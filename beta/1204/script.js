(() => {
    'use strict';

    const DEFAULT_REASON = '';
    const MAX_REASON_LENGTH = 120;

    const STYLES = {
        classic: {
            width: 1633,
            height: 963,
            label: '樣式一：白底 1204 梗圖',
            fileSuffix: 'style-1'
        },
        'game-ui': {
            width: 1320,
            height: 963,
            label: '樣式二：遊戲內提示視窗 UI',
            fileSuffix: 'style-2'
        }
    };

    const reasonInput = document.getElementById('reason-input');
    const messagePreview = document.getElementById('message-preview-text');
    const previewSize = document.getElementById('preview-size');
    const canvas = document.getElementById('meme-canvas');
    const ctx = canvas.getContext('2d');
    const memeImage = document.getElementById('meme-image');
    const previewHint = document.getElementById('preview-hint');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const styleRadios = Array.from(document.querySelectorAll('input[name="image-style"]'));

    function normalizeReason(value) {
        return String(value || '')
            .replace(/\r\n?/g, '\n')
            .replace(/[\t ]+/g, ' ')
            .replace(/ *\n */g, '\n')
            .trim()
            .slice(0, MAX_REASON_LENGTH);
    }

    function getSelectedStyle() {
        const selected = styleRadios.find((radio) => radio.checked);
        return selected ? selected.value : 'classic';
    }

    function buildMessage(reason, style = getSelectedStyle()) {
        if (style === 'game-ui') {
            return `根據內部政策(懲處原因：${reason})，遊戲服務受到限制。`;
        }
        return `根據內部政策 (懲處原因：${reason})，遊戲服務永久受到限制。(1204)`;
    }

    function splitTextToLines(text, maxWidth, fontSize, maxLines, weight = 500) {
        const lines = [];
        const paragraphs = String(text).split('\n');
        ctx.font = `${weight} ${fontSize}px "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif`;

        for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
            const paragraph = paragraphs[paragraphIndex] || '';
            let current = '';

            for (const char of Array.from(paragraph)) {
                const test = current + char;
                if (ctx.measureText(test).width <= maxWidth || current.length === 0) {
                    current = test;
                    continue;
                }

                lines.push(current);
                current = char;
                if (lines.length >= maxLines) break;
            }

            if (lines.length >= maxLines) break;
            if (current || paragraph === '') lines.push(current);
            if (lines.length >= maxLines) break;
        }

        return lines;
    }

    function fitText(message, options) {
        const {
            maxWidth,
            maxLines,
            startFontSize,
            minFontSize,
            step = 1,
            weight = 500
        } = options;

        let fontSize = startFontSize;
        let lines = splitTextToLines(message, maxWidth, fontSize, maxLines + 1, weight);

        while (lines.length > maxLines && fontSize > minFontSize) {
            fontSize -= step;
            lines = splitTextToLines(message, maxWidth, fontSize, maxLines + 1, weight);
        }

        if (lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
            let last = lines[maxLines - 1];
            ctx.font = `${weight} ${fontSize}px "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif`;
            while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
                last = last.slice(0, -1);
            }
            lines[maxLines - 1] = `${last}…`;
        }

        return { fontSize, lines };
    }

    function roundedRectPath(context, x, y, width, height, radius) {
        const r = Math.max(0, Math.min(radius, width / 2, height / 2));
        context.beginPath();
        context.moveTo(x + r, y);
        context.arcTo(x + width, y, x + width, y + height, r);
        context.arcTo(x + width, y + height, x, y + height, r);
        context.arcTo(x, y + height, x, y, r);
        context.arcTo(x, y, x + width, y, r);
        context.closePath();
    }

    function drawClassic(reason) {
        const width = STYLES.classic.width;
        const height = STYLES.classic.height;
        const message = buildMessage(reason, 'classic');

        canvas.width = width;
        canvas.height = height;

        ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        const fitted = fitText(message, {
            maxWidth: 1285,
            maxLines: 4,
            startFontSize: 56,
            minFontSize: 32,
            step: 2,
            weight: 500
        });
        const lineHeight = fitted.fontSize * 1.42;
        const textBlockHeight = fitted.lines.length * lineHeight;
        const textCenterY = 370;
        let y = textCenterY - textBlockHeight / 2 + lineHeight * 0.72;

        ctx.fillStyle = '#111111';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.font = `500 ${fitted.fontSize}px "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif`;

        for (const line of fitted.lines) {
            ctx.fillText(line, width / 2, y);
            y += lineHeight;
        }

        const buttonX = 78;
        const buttonY = 675;
        const buttonWidth = 1477;
        const buttonHeight = 210;
        ctx.fillStyle = '#000000';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 57px "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif';
        ctx.fillText('確認', width / 2, buttonY + buttonHeight / 2 + 2);
        ctx.restore();
    }

    function drawGameUI(reason) {
        const width = STYLES['game-ui'].width;
        const height = STYLES['game-ui'].height;
        const message = buildMessage(reason, 'game-ui');

        // 以參考 UI 的 614 × 448 為設計座標，再等比例放大到接近樣式一的輸出尺寸。
        const designWidth = 614;
        const designHeight = 448;
        const scale = height / designHeight;
        const scaledWidth = designWidth * scale;
        const offsetX = (width - scaledWidth) / 2;

        canvas.width = width;
        canvas.height = height;

        ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.translate(offsetX, 0);
        ctx.scale(scale, scale);

        // 只輸出遊戲提示視窗本身；四角外側維持透明。
        roundedRectPath(ctx, 0, 0, designWidth, designHeight, 12);
        ctx.clip();

        ctx.fillStyle = '#F2F2F2';
        ctx.fillRect(0, 0, designWidth, designHeight);

        const headerHeight = 82;
        ctx.fillStyle = '#525F6F';
        ctx.fillRect(0, 0, designWidth, headerHeight);

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 34px "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif';
        ctx.fillText('提示', designWidth / 2, headerHeight / 2 + 1);

        const fitted = fitText(message, {
            maxWidth: 520,
            maxLines: 4,
            startFontSize: 21,
            minFontSize: 15,
            step: 1,
            weight: 500
        });
        const lineHeight = fitted.fontSize * 1.55;
        const textBlockHeight = fitted.lines.length * lineHeight;
        const textCenterY = 224;
        let y = textCenterY - textBlockHeight / 2 + lineHeight / 2;

        ctx.fillStyle = '#4A4D52';
        ctx.font = `500 ${fitted.fontSize}px "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const line of fitted.lines) {
            ctx.fillText(line, designWidth / 2, y);
            y += lineHeight;
        }

        const buttonWidth = 276;
        const buttonHeight = 64;
        const buttonX = (designWidth - buttonWidth) / 2;
        const buttonY = 364;

        ctx.fillStyle = '#CC5F3A';
        roundedRectPath(ctx, buttonX, buttonY + 4, buttonWidth, buttonHeight, 8);
        ctx.fill();

        ctx.fillStyle = '#EE7047';
        roundedRectPath(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 8);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 24px "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif';
        ctx.fillText('確認', designWidth / 2, buttonY + buttonHeight / 2 - 1);

        ctx.restore();
    }

    function drawCanvas(reason, style = getSelectedStyle()) {
        if (style === 'game-ui') {
            drawGameUI(reason);
        } else {
            drawClassic(reason);
        }
    }

    function updateCanvasPresentation(style) {
        const config = STYLES[style] || STYLES.classic;
        previewSize.textContent = `${config.width} × ${config.height}`;
        memeImage.style.aspectRatio = `${config.width} / ${config.height}`;
        document.querySelector('.canvas-shell').classList.toggle('transparent-preview', style === 'game-ui');
    }

    function updateGenerator() {
        const reason = normalizeReason(reasonInput.value);
        const style = getSelectedStyle();
        messagePreview.textContent = buildMessage(reason, style);
        updateCanvasPresentation(style);
        drawCanvas(reason, style);
        memeImage.src = canvas.toDataURL('image/png');
    }

    function applyTheme(theme, shouldSave = false) {
        const isDark = theme === 'dark';
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', isDark ? '切換至日間模式' : '切換至夜間模式');
        themeToggle.title = isDark ? '切換至日間模式' : '切換至夜間模式';

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

    function isIOSDevice() {
        const ua = navigator.userAgent || '';
        const platform = navigator.platform || '';
        const touchMac = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
        return /iPad|iPhone|iPod/i.test(ua) || touchMac;
    }

    function downloadImage() {
        const reason = normalizeReason(reasonInput.value);
        const style = getSelectedStyle();
        const config = STYLES[style] || STYLES.classic;
        drawCanvas(reason, style);
        const dataUrl = canvas.toDataURL('image/png');
        memeImage.src = dataUrl;

        if (isIOSDevice()) {
            memeImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            previewHint.textContent = '請長按上方圖片，接著選擇「儲存到照片」或「儲存影像」。';
        } else {
            const link = document.createElement('a');
            link.download = `1204 產生器_${config.fileSuffix}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            link.remove();
        }

        if (typeof window.gtag === 'function') {
            window.gtag('event', 'download_1204_generator', {
                event_category: '1204_generator',
                image_style: style,
                save_method: isIOSDevice() ? 'long_press' : 'download'
            });
        }
    }

    function resetGenerator() {
        reasonInput.value = DEFAULT_REASON;
        updateGenerator();
        reasonInput.focus();
    }

    reasonInput.addEventListener('input', updateGenerator);
    styleRadios.forEach((radio) => radio.addEventListener('change', updateGenerator));
    downloadBtn.addEventListener('click', downloadImage);
    resetBtn.addEventListener('click', resetGenerator);
    themeToggle.addEventListener('click', toggleTheme);

    let savedTheme = 'light';
    try {
        savedTheme = localStorage.getItem('msm-theme') === 'dark' ? 'dark' : 'light';
    } catch (error) {
        console.warn('無法讀取主題設定：', error);
    }

    if (isIOSDevice()) {
        downloadBtn.textContent = '長按圖片儲存';
        previewHint.textContent = 'iPhone / iPad：圖片產生後可直接長按預覽圖，再選擇「儲存到照片」或「儲存影像」。';
    }

    applyTheme(savedTheme);
    updateGenerator();
})();
