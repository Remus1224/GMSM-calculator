(() => {
    "use strict";

    const atlasPaths = {
        upgrade: "assets/craft/effects/atlas_古代製作.png",
        chaos: "assets/craft/effects/atlas_混沌製作.png"
    };
    // The source UI uses a PixelPerfect 1280 x 720 logical viewport. The web
    // forge panel represents that complete viewport: scale uniformly by its
    // height and crop any horizontal overflow instead of stretching sprites.
    const logicalViewportHeight = 720;

    // Confirmed runtime hierarchy:
    // ForgePopup > Contents(-202,-42) > Manufacture(0,0)
    // > ResultPopup(202,0) > Effect Root(0,46)
    // Therefore the effect root resolves to (0,4) relative to ForgePopup.
    const runtimeEffectRoot = Object.freeze({ x: 0, y: 4 });
    const fallbackSourceRoot = Object.freeze({ x: 0, y: 46 });
    const imageCache = new Map();
    let activeRunId = 0;
    let animationFrameId = 0;

    function loadAtlas(path) {
        if (imageCache.has(path)) return imageCache.get(path);

        const promise = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => {
                imageCache.delete(path);
                reject(new Error(`製作特效圖集載入失敗：${path}`));
            };
            image.src = path;
        });

        imageCache.set(path, promise);
        return promise;
    }

    function finiteSlope(value) {
        return typeof value === "number" && Number.isFinite(value) ? value : 0;
    }

    function evaluateHermite(keys, time) {
        if (!keys || keys.length === 0) return 0;
        if (time <= keys[0].time) return Number(keys[0].value) || 0;
        if (time >= keys[keys.length - 1].time) return Number(keys[keys.length - 1].value) || 0;

        for (let index = 0; index < keys.length - 1; index++) {
            const from = keys[index];
            const to = keys[index + 1];
            if (time < from.time || time > to.time) continue;

            const duration = to.time - from.time;
            const progress = duration > 0 ? (time - from.time) / duration : 0;
            const progress2 = progress * progress;
            const progress3 = progress2 * progress;
            const h00 = 2 * progress3 - 3 * progress2 + 1;
            const h10 = progress3 - 2 * progress2 + progress;
            const h01 = -2 * progress3 + 3 * progress2;
            const h11 = progress3 - progress2;

            return h00 * Number(from.value)
                + h10 * duration * finiteSlope(from.outSlope)
                + h01 * Number(to.value)
                + h11 * duration * finiteSlope(to.inSlope);
        }

        return Number(keys[keys.length - 1].value) || 0;
    }

    function evaluateStep(keys, time) {
        if (!keys || keys.length === 0) return 0;
        let value = Number(keys[0].value) || 0;
        for (const key of keys) {
            if (key.time <= time + 1e-7) value = Number(key.value) || 0;
            else break;
        }
        return value;
    }

    function evaluateRotation(curve, time) {
        const keys = curve?.keys;
        if (!keys || keys.length === 0) return 0;
        if (time <= keys[0].time) return keys[0].angle;
        if (time >= keys[keys.length - 1].time) return keys[keys.length - 1].angle;

        for (let index = 0; index < keys.length - 1; index++) {
            const from = keys[index];
            const to = keys[index + 1];
            if (time < from.time || time > to.time) continue;
            const progress = (time - from.time) / (to.time - from.time);
            return from.angle + (to.angle - from.angle) * progress;
        }
        return 0;
    }

    function clearCanvas(canvas, context) {
        if (!canvas || !context) return;
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }

    function stopCurrentEffect() {
        activeRunId++;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = 0;
        }

        const overlay = document.getElementById("cr-anim-overlay");
        const canvas = document.getElementById("cr-effect-canvas");
        const context = canvas?.getContext("2d");
        clearCanvas(canvas, context);
        if (overlay) overlay.className = "lightning-overlay";
    }

    async function playOriginalEffect(effectKey, onStart) {
        const data = window.CRAFT_EFFECT_DATA?.[effectKey];
        const family = effectKey.startsWith("upgrade-") ? "upgrade" : "chaos";
        const atlasPath = atlasPaths[family];
        const overlay = document.getElementById("cr-anim-overlay");
        const canvas = document.getElementById("cr-effect-canvas");

        if (!data || !atlasPath || !overlay || !canvas) return false;

        const image = await loadAtlas(atlasPath);
        const context = canvas.getContext("2d", { alpha: true });
        if (!context) return false;

        stopCurrentEffect();
        const runId = activeRunId;
        overlay.className = "lightning-overlay cr-original-effect";

        const rect = overlay.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.imageSmoothingEnabled = true;

        const atlasFrames = new Map((data.atlas?.sprites || []).map(sprite => [sprite.name, sprite]));
        const curveByKey = new Map((data.animation?.floatCurves || []).map(curve => [`${curve.path}|${curve.attribute}`, curve]));
        const rotationByPath = new Map((data.animation?.rotationCurves || []).map(curve => [curve.path, curve]));
        const pixelScale = height / logicalViewportHeight;
        const sourceRoot = {
            x: Number(data.mount?.rootLocal?.x ?? fallbackSourceRoot.x),
            y: Number(data.mount?.rootLocal?.y ?? fallbackSourceRoot.y)
        };
        const resolvedRuntimeRoot = data.mount?.resolvedRuntimeMount?.effectRelativeToForgePopup;
        const effectRoot = {
            x: Number(resolvedRuntimeRoot?.x ?? runtimeEffectRoot.x),
            y: Number(resolvedRuntimeRoot?.y ?? runtimeEffectRoot.y)
        };
        const forgeCenterX = width / 2;
        const forgeCenterY = height / 2;
        const sourceDuration = Number(data.animation?.duration) || Number(data.meta?.durationSeconds) || 1.26;
        const duration = Math.max(0.1, sourceDuration);

        function isActive(node, time) {
            if (!node.enabled) return false;
            const curve = curveByKey.get(`${node.path}|m_IsActive`);
            return curve ? evaluateStep(curve.keys, time) >= 0.5 : true;
        }

        function alphaFor(node, time) {
            const curve = curveByKey.get(`${node.path}|mColor.a`);
            const initial = typeof node.color?.a === "number" ? node.color.a : 1;
            const alpha = curve ? evaluateHermite(curve.keys, time) : initial;
            return Math.max(0, Math.min(1, alpha));
        }

        function drawSprite(node, alpha, rotation) {
            const frame = atlasFrames.get(node.atlasSpriteName);
            if (!frame) return;

            const paddingLeft = Number(frame.paddingLeft) || 0;
            const paddingRight = Number(frame.paddingRight) || 0;
            const paddingTop = Number(frame.paddingTop) || 0;
            const paddingBottom = Number(frame.paddingBottom) || 0;
            const fullWidth = Number(frame.width) + paddingLeft + paddingRight;
            const fullHeight = Number(frame.height) + paddingTop + paddingBottom;
            if (fullWidth <= 0 || fullHeight <= 0) return;

            const widgetWidth = node.width * node.scaleX;
            const widgetHeight = node.height * node.scaleY;
            const targetX = -widgetWidth / 2 + (paddingLeft / fullWidth) * widgetWidth;
            const targetY = -widgetHeight / 2 + (paddingTop / fullHeight) * widgetHeight;
            const targetWidth = (frame.width / fullWidth) * widgetWidth;
            const targetHeight = (frame.height / fullHeight) * widgetHeight;

            context.save();
            // Scene node positions already include Effect Root(0,46). Remove
            // that source-local offset once, then apply the resolved runtime
            // root (0,4) relative to the ForgePopup center.
            const runtimeX = effectRoot.x + (Number(node.x) - sourceRoot.x);
            const runtimeY = effectRoot.y + (Number(node.y) - sourceRoot.y);

            context.translate(forgeCenterX, forgeCenterY);
            context.scale(pixelScale, pixelScale);
            context.translate(runtimeX, -runtimeY);
            context.rotate(-(node.rotation + rotation));
            context.globalCompositeOperation = "source-over";
            context.globalAlpha = alpha;
            context.drawImage(
                image,
                frame.x, frame.y, frame.width, frame.height,
                targetX, targetY, targetWidth, targetHeight
            );
            context.restore();
        }

        function draw(time) {
            clearCanvas(canvas, context);
            const visible = [];

            for (const [sceneOrder, node] of (data.scene?.nodes || []).entries()) {
                if (!isActive(node, time)) continue;
                const alpha = alphaFor(node, time);
                if (alpha <= 0.0001) continue;
                visible.push({ node, alpha, sceneOrder });
            }

            visible.sort((left, right) => left.node.depth - right.node.depth
                || left.sceneOrder - right.sceneOrder);

            for (const item of visible) {
                const node = item.node;
                if (node.width >= 5000 || node.height >= 5000) {
                    const color = node.color || { r: 1, g: 1, b: 1 };
                    context.save();
                    context.globalCompositeOperation = "source-over";
                    context.globalAlpha = item.alpha;
                    context.fillStyle = `rgb(${Math.round((color.r || 0) * 255)}, ${Math.round((color.g || 0) * 255)}, ${Math.round((color.b || 0) * 255)})`;
                    context.fillRect(0, 0, width, height);
                    context.restore();
                    continue;
                }

                drawSprite(node, item.alpha, evaluateRotation(rotationByPath.get(node.path), time));
            }
        }

        return new Promise(resolve => {
            let startedAt = 0;
            let soundStarted = false;

            function finish(result) {
                if (runId === activeRunId) {
                    clearCanvas(canvas, context);
                    overlay.className = "lightning-overlay";
                    animationFrameId = 0;
                }
                resolve(result);
            }

            function tick(timestamp) {
                if (runId !== activeRunId) {
                    finish(false);
                    return;
                }
                if (!startedAt) {
                    startedAt = timestamp;
                    if (!soundStarted && typeof onStart === "function") {
                        soundStarted = true;
                        onStart();
                    }
                }

                const time = Math.min(duration, (timestamp - startedAt) / 1000);
                draw(time);
                if (time >= duration) {
                    finish(true);
                    return;
                }
                animationFrameId = requestAnimationFrame(tick);
            }

            animationFrameId = requestAnimationFrame(tick);
        });
    }

    function playFallbackEffect(className, onStart) {
        const overlay = document.getElementById("cr-anim-overlay");
        if (!overlay) return Promise.resolve(false);

        stopCurrentEffect();
        const runId = activeRunId;
        overlay.className = `lightning-overlay ${className}`;
        if (typeof onStart === "function") onStart();

        return new Promise(resolve => {
            setTimeout(() => {
                if (runId === activeRunId) overlay.className = "lightning-overlay";
                resolve(true);
            }, 1260);
        });
    }

    window.cr_playOriginalCraftEffect = playOriginalEffect;
    window.cr_playFallbackCraftEffect = playFallbackEffect;
    window.cr_stopCraftEffect = stopCurrentEffect;
})();
