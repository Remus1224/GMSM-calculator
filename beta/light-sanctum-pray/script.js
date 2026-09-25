(() => {
    'use strict';

    const NATIVE_WIDTH = 1280;
    const NATIVE_HEIGHT = 720;
    const BRIDGE_CHANNEL = 'gmsm-light-sanctum-pray';

    const themeToggle = document.getElementById('theme-toggle');
    const fullscreenToggle = document.getElementById('fullscreen-toggle'); // Fix6: normally null; control is inside runtime coordinates
    const simulatorFrame = document.getElementById('simulator-frame');
    const stageSection = document.getElementById('stage-section');
    const stageHost = document.getElementById('stage-host');
    const stageViewport = document.getElementById('stage-viewport');
    const currentLevelSelect = document.getElementById('current-level-select');
    const resetSimulatorButton = document.getElementById('reset-simulator');
    const statCrystalUsed = document.getElementById('stat-crystal-used');
    const statMesoUsed = document.getElementById('stat-meso-used');
    const settingsPanel = document.querySelector('.settings-panel');

    let bridgeReady = false;
    let handshakeTimer = 0;
    let handshakeAttempts = 0;
    let applyingLevel = false;
    let fakeFullscreenReturnY = 0;

    function applyTheme(theme, shouldSave = false) {
        const isDark = theme === 'dark';
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', String(isDark));
            themeToggle.setAttribute('aria-label', isDark ? '切換至日間模式' : '切換至夜間模式');
            themeToggle.title = isDark ? '切換至日間模式' : '切換至夜間模式';
        }

        if (shouldSave) {
            try {
                localStorage.setItem('msm-theme', isDark ? 'dark' : 'light');
            } catch (error) {
                console.warn('無法儲存主題設定：', error);
            }
        }
    }

    function toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        applyTheme(isDark ? 'light' : 'dark', true);
    }

    function isNativeFullscreen() {
        return document.fullscreenElement === stageHost || document.webkitFullscreenElement === stageHost;
    }

    function isFakeFullscreen() {
        return Boolean(stageHost && stageHost.classList.contains('fake-fullscreen'));
    }

    function isFullscreen() {
        return isNativeFullscreen() || isFakeFullscreen();
    }

    function isIOSLike() {
        const ua = navigator.userAgent || '';
        return (/Mac|iPad|iPhone|iPod/.test(ua) && !window.MSStream) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    function setFakeFullscreen(active) {
        if (!stageHost) return;
        if (active && !isFakeFullscreen()) fakeFullscreenReturnY = window.scrollY || 0;
        stageHost.classList.toggle('fake-fullscreen', active);
        document.documentElement.classList.toggle('light-sanctum-pray-no-scroll', active);
        document.body.classList.toggle('light-sanctum-pray-no-scroll', active);
        if (active) {
            window.scrollTo(0, 0);
        } else {
            window.requestAnimationFrame(() => window.scrollTo(0, fakeFullscreenReturnY));
        }
        updateFullscreenLabel();
        requestAnimationFrame(reflowStage);
        window.setTimeout(reflowStage, 80);
        window.setTimeout(reflowStage, 250);
    }

    function updateFullscreenLabel() {
        const active = isFullscreen();
        if (fullscreenToggle) {
            fullscreenToggle.textContent = '⛶';
            fullscreenToggle.setAttribute('aria-label', active ? '離開全螢幕' : '全螢幕顯示模擬器');
            fullscreenToggle.title = active ? '離開全螢幕' : '全螢幕';
            fullscreenToggle.classList.toggle('is-active', active);
        }
    }

    async function toggleFullscreen() {
        if (!stageHost) return;

        try {
            if (isFullscreen()) {
                if (isNativeFullscreen()) {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
                if (isFakeFullscreen()) setFakeFullscreen(false);
                return;
            }

            // iPhone/iPad Safari does not reliably support element Fullscreen API.
            // Use the same fixed-position fake-fullscreen strategy already proven by
            // the site's Will simulator. Also use it as a fallback on browsers with
            // no element Fullscreen API.
            if (isIOSLike() || (!stageHost.requestFullscreen && !stageHost.webkitRequestFullscreen)) {
                setFakeFullscreen(true);
                return;
            }

            if (stageHost.requestFullscreen) {
                await stageHost.requestFullscreen();
            } else if (stageHost.webkitRequestFullscreen) {
                stageHost.webkitRequestFullscreen();
            }

            try {
                if (screen.orientation && typeof screen.orientation.lock === 'function') {
                    await screen.orientation.lock('landscape');
                }
            } catch (error) {
                // Fullscreen remains valid when orientation lock is unavailable.
            }
        } catch (error) {
            console.warn('原生全螢幕失敗，改用頁面全螢幕：', error);
            setFakeFullscreen(true);
        } finally {
            updateFullscreenLabel();
            requestAnimationFrame(reflowStage);
        }
    }

    function viewportSize() {
        const vv = window.visualViewport;
        return {
            width: Math.max(1, vv ? vv.width : window.innerWidth),
            height: Math.max(1, vv ? vv.height : window.innerHeight)
        };
    }

    function reflowStage() {
        if (!stageSection || !stageHost || !stageViewport || !simulatorFrame) return;

        const vp = viewportSize();
        const fullscreen = isFullscreen();
        let availableWidth;
        let availableHeight;

        if (fullscreen) {
            availableWidth = vp.width;
            availableHeight = vp.height;
        } else {
            availableWidth = Math.max(1, stageSection.clientWidth);
            const top = stageSection.getBoundingClientRect().top;
            availableHeight = Math.max(180, vp.height - Math.max(0, top) - 8);
        }

        const widthScale = availableWidth / NATIVE_WIDTH;
        const heightScale = availableHeight / NATIVE_HEIGHT;
        const portrait = vp.height > vp.width;

        let scale = portrait && !fullscreen
            ? Math.min(widthScale, 1)
            : Math.min(widthScale, heightScale, 1);

        scale = Math.max(0.1, scale);

        const scaledWidth = Math.max(1, Math.round(NATIVE_WIDTH * scale));
        const scaledHeight = Math.max(1, Math.round(NATIVE_HEIGHT * scale));

        if (!fullscreen) {
            stageHost.style.width = `${scaledWidth}px`;
            stageHost.style.height = `${scaledHeight}px`;
            // Keep the site settings panel aligned 1:1 with the visible simulator stage.
            // Use the rendered width (not the 1280px native width), so height-constrained
            // desktop windows and narrow/mobile layouts remain exactly aligned.
            if (settingsPanel) settingsPanel.style.width = `${scaledWidth}px`;
        } else {
            stageHost.style.width = '';
            stageHost.style.height = '';
        }

        stageViewport.style.width = `${scaledWidth}px`;
        stageViewport.style.height = `${scaledHeight}px`;
        simulatorFrame.style.transform = `scale(${scale})`;
        simulatorFrame.dataset.scale = scale.toFixed(5);
    }

    function finiteNumber(value, fallback = 0) {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    function formatInteger(value) {
        return Math.max(0, Math.round(finiteNumber(value, 0))).toLocaleString('zh-TW');
    }

    function setControlsEnabled(enabled) {
        if (currentLevelSelect) currentLevelSelect.disabled = !enabled;
        if (resetSimulatorButton) resetSimulatorButton.disabled = !enabled;
    }

    function postToRuntime(payload) {
        const target = simulatorFrame?.contentWindow;
        if (!target) return false;
        target.postMessage({ channel: BRIDGE_CHANNEL, ...payload }, '*');
        return true;
    }

    function stopHandshake() {
        if (handshakeTimer) {
            window.clearInterval(handshakeTimer);
            handshakeTimer = 0;
        }
    }

    function requestHandshake() {
        handshakeAttempts += 1;
        postToRuntime({ type: 'hello', attempt: handshakeAttempts });
        if (bridgeReady || handshakeAttempts >= 40) stopHandshake();
    }

    function startHandshake() {
        bridgeReady = false;
        handshakeAttempts = 0;
        setControlsEnabled(false);
        stopHandshake();
        requestHandshake();
        handshakeTimer = window.setInterval(requestHandshake, 250);
    }

    function applyRuntimeState(state) {
        bridgeReady = true;
        stopHandshake();
        setControlsEnabled(true);

        if (currentLevelSelect && !applyingLevel) {
            const level = Math.max(1, Math.min(15, Math.round(finiteNumber(state.level, 1))));
            currentLevelSelect.value = String(level);
        }
        if (statCrystalUsed) statCrystalUsed.textContent = formatInteger(state.cumulativeCrystalUsed);
        if (statMesoUsed) statMesoUsed.textContent = formatInteger(state.cumulativeMesoUsed);
    }

    function handleRuntimeMessage(event) {
        if (!simulatorFrame || event.source !== simulatorFrame.contentWindow) return;
        const data = event.data || {};
        if (data.channel !== BRIDGE_CHANNEL) return;

        if (data.type === 'toggle-fullscreen-from-runtime') { toggleFullscreen(); return; }

        if (data.type === 'ready') {
            bridgeReady = true;
            stopHandshake();
            setControlsEnabled(true);
            postToRuntime({ type: 'get-state' });
            return;
        }

        if (data.type === 'state') {
            applyRuntimeState(data);
            applyingLevel = false;
            return;
        }

        if (data.type === 'ack' && data.ok === false) {
            applyingLevel = false;
            // Keep controls usable and request authoritative state rather than trapping
            // the player in a permanent disabled/wait state.
            setControlsEnabled(true);
            postToRuntime({ type: 'get-state' });
        }
    }

    function applyCurrentLevel() {
        if (!currentLevelSelect || !bridgeReady || applyingLevel) return;
        applyingLevel = true;
        const level = Math.max(1, Math.min(15, Number(currentLevelSelect.value) || 1));

        // Choosing a new starting level begins a new simulation baseline. Reflect the
        // reset immediately in the site UI; the runtime bridge remains authoritative
        // and will confirm both counters as zero in its next state message.
        if (statCrystalUsed) statCrystalUsed.textContent = '0';
        if (statMesoUsed) statMesoUsed.textContent = '0';

        postToRuntime({ type: 'set-level', level });
        // A missed state message should never leave the control permanently locked.
        window.setTimeout(() => {
            if (!applyingLevel) return;
            applyingLevel = false;
            postToRuntime({ type: 'get-state' });
        }, 1000);
    }

    function clearSimulatorRecords() {
        if (!bridgeReady) return;
        postToRuntime({ type: 'reset' });
    }

    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('msm-theme') === 'dark' ? 'dark' : 'light';
    } catch (error) {
        console.warn('無法讀取主題設定：', error);
    }

    // Fix6 — user-visible 60 s idle profiler.
    const idleStart=document.getElementById('idle-profiler-start'), idleCopy=document.getElementById('idle-profiler-copy'), idleStatus=document.getElementById('idle-profiler-status'), idleOutput=document.getElementById('idle-profiler-output');
    let idleTimer=0;
    function runtimeProfiler(){ try{return simulatorFrame&&simulatorFrame.contentWindow&&simulatorFrame.contentWindow.__LS_IDLE_PROFILER__;}catch(e){return null;} }
    if(idleStart) idleStart.addEventListener('click',()=>{const p=runtimeProfiler();if(!p){idleStatus.textContent='診斷器尚未載入，請等待模擬器完成載入後再試。';return;}idleStart.disabled=true;idleCopy.disabled=true;idleOutput.hidden=true;const begun=Date.now(),baseline=p.report();idleStatus.textContent='診斷中：60 秒內請不要點擊、捲動、旋轉手機或切換頁籤。';idleTimer=setInterval(()=>{const left=Math.max(0,60-Math.floor((Date.now()-begun)/1000));idleStatus.textContent=`診斷中：剩餘 ${left} 秒。請完全不要操作。`;},1000);setTimeout(()=>{clearInterval(idleTimer);const end=p.report();const result={kind:'LightSanctumPray Fix6 Idle 60s',capturedAt:new Date().toISOString(),elapsedMs:Date.now()-begun,baseline,end};const text=JSON.stringify(result,null,2);idleOutput.value=text;idleOutput.hidden=false;idleStart.disabled=false;idleCopy.disabled=false;idleStatus.textContent='完成。請按「複製診斷結果」，回到 ChatGPT 直接貼上。';},60000);});
    if(idleCopy) idleCopy.addEventListener('click',async()=>{const text=idleOutput.value;if(!text)return;try{await navigator.clipboard.writeText(text);idleStatus.textContent='已複製。回到 ChatGPT 直接貼上即可。';}catch(e){idleOutput.hidden=false;idleOutput.focus();idleOutput.select();idleStatus.textContent='Safari 未允許自動複製；已選取文字，請長按→複製。';}});

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (fullscreenToggle) fullscreenToggle.addEventListener('click', toggleFullscreen);
    if (currentLevelSelect) currentLevelSelect.addEventListener('change', applyCurrentLevel);
    if (resetSimulatorButton) resetSimulatorButton.addEventListener('click', clearSimulatorRecords);

    window.addEventListener('message', handleRuntimeMessage);

    if (simulatorFrame && stageHost) {
        simulatorFrame.addEventListener('load', () => {
            stageHost.classList.add('is-loaded');
            reflowStage();
            startHandshake();
        });
        // The iframe may already be complete before this script is parsed (cache/file://).
        // A retrying hello handshake removes that load-event race entirely.
        startHandshake();
    }

    window.addEventListener('resize', reflowStage, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(reflowStage, 50), { passive: true });
    window.visualViewport?.addEventListener('resize', reflowStage, { passive: true });
    document.addEventListener('fullscreenchange', () => {
        updateFullscreenLabel();
        requestAnimationFrame(reflowStage);
        window.setTimeout(reflowStage, 80);
    });
    document.addEventListener('webkitfullscreenchange', () => {
        updateFullscreenLabel();
        requestAnimationFrame(reflowStage);
        window.setTimeout(reflowStage, 80);
    });

    applyTheme(savedTheme);
    updateFullscreenLabel();
    requestAnimationFrame(reflowStage);
})();
