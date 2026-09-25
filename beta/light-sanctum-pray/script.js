(() => {
    'use strict';

    const NATIVE_WIDTH = 1280;
    const NATIVE_HEIGHT = 720;
    const BRIDGE_CHANNEL = 'gmsm-light-sanctum-pray';

    const themeToggle = document.getElementById('theme-toggle');
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
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

    function applyTheme(theme, shouldSave = false) {
        const isDark = theme === 'dark';
        if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
        else document.documentElement.removeAttribute('data-theme');
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', String(isDark));
            themeToggle.setAttribute('aria-label', isDark ? '切換至日間模式' : '切換至夜間模式');
            themeToggle.title = isDark ? '切換至日間模式' : '切換至夜間模式';
        }
        if (shouldSave) {
            try { localStorage.setItem('msm-theme', isDark ? 'dark' : 'light'); }
            catch (error) { console.warn('無法儲存主題設定：', error); }
        }
    }

    function toggleTheme() {
        applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    }

    function isNativeFullscreen() {
        return document.fullscreenElement === stageHost || document.webkitFullscreenElement === stageHost;
    }
    function isFakeFullscreen() { return Boolean(stageHost && stageHost.classList.contains('fake-fullscreen')); }
    function isFullscreen() { return isNativeFullscreen() || isFakeFullscreen(); }
    function isIOSLike() {
        const ua = navigator.userAgent || '';
        return (/Mac|iPad|iPhone|iPod/.test(ua) && !window.MSStream) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    function postFullscreenState(active) {
        postToRuntime({ type: 'fullscreen-state', active: Boolean(active), fake: isFakeFullscreen() });
    }

    // Keep this intentionally equivalent to the already player-verified Will simulator:
    // fixed fake-fullscreen wrapper + body-no-scroll + scrollTo(0, 0). No gesture relay,
    // synthetic scrolling, top-level test route, or other Light-Sanctum-specific workaround.
    function setFakeFullscreen(active) {
        if (!stageHost) return;
        stageHost.classList.toggle('fake-fullscreen', active);
        document.body.classList.toggle('body-no-scroll', active);
        if (active) window.scrollTo(0, 0);
        updateFullscreenLabel();
        postFullscreenState(active);
        requestAnimationFrame(reflowStage);
        window.setTimeout(reflowStage, 80);
        window.setTimeout(reflowStage, 250);
    }

    function updateFullscreenLabel() {
        if (!fullscreenToggle) return;
        const active = isFullscreen();
        fullscreenToggle.textContent = active ? '離開全螢幕' : '全螢幕';
        fullscreenToggle.setAttribute('aria-label', active ? '離開全螢幕' : '全螢幕顯示模擬器');
    }

    async function toggleFullscreen() {
        if (!stageHost) return;
        try {
            if (isFullscreen()) {
                if (isNativeFullscreen()) {
                    if (document.exitFullscreen) await document.exitFullscreen();
                    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                }
                if (isFakeFullscreen()) setFakeFullscreen(false);
                return;
            }
            if (isIOSLike() || (!stageHost.requestFullscreen && !stageHost.webkitRequestFullscreen)) {
                setFakeFullscreen(true);
                return;
            }
            if (stageHost.requestFullscreen) await stageHost.requestFullscreen();
            else if (stageHost.webkitRequestFullscreen) stageHost.webkitRequestFullscreen();
            try {
                if (screen.orientation && typeof screen.orientation.lock === 'function') await screen.orientation.lock('landscape');
            } catch (error) {}
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
        return { width: Math.max(1, vv ? vv.width : window.innerWidth), height: Math.max(1, vv ? vv.height : window.innerHeight) };
    }

    function reflowStage() {
        if (!stageSection || !stageHost || !stageViewport || !simulatorFrame) return;
        const vp = viewportSize();
        const fullscreen = isFullscreen();
        let availableWidth, availableHeight;
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
        let scale = portrait && !fullscreen ? Math.min(widthScale, 1) : Math.min(widthScale, heightScale, 1);
        scale = Math.max(0.1, scale);
        const scaledWidth = Math.max(1, Math.round(NATIVE_WIDTH * scale));
        const scaledHeight = Math.max(1, Math.round(NATIVE_HEIGHT * scale));
        if (!fullscreen) {
            stageHost.style.width = `${scaledWidth}px`;
            stageHost.style.height = `${scaledHeight}px`;
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

    function finiteNumber(value, fallback = 0) { const number = Number(value); return Number.isFinite(number) ? number : fallback; }
    function formatInteger(value) { return Math.max(0, Math.round(finiteNumber(value, 0))).toLocaleString('zh-TW'); }
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
    function stopHandshake() { if (handshakeTimer) { window.clearInterval(handshakeTimer); handshakeTimer = 0; } }
    function requestHandshake() { handshakeAttempts += 1; postToRuntime({ type: 'hello', attempt: handshakeAttempts }); if (bridgeReady || handshakeAttempts >= 40) stopHandshake(); }
    function startHandshake() {
        bridgeReady = false; handshakeAttempts = 0; setControlsEnabled(false); stopHandshake(); requestHandshake();
        handshakeTimer = window.setInterval(requestHandshake, 250);
    }
    function applyRuntimeState(state) {
        bridgeReady = true; stopHandshake(); setControlsEnabled(true);
        if (currentLevelSelect && !applyingLevel) currentLevelSelect.value = String(Math.max(1, Math.min(15, Math.round(finiteNumber(state.level, 1)))));
        if (statCrystalUsed) statCrystalUsed.textContent = formatInteger(state.cumulativeCrystalUsed);
        if (statMesoUsed) statMesoUsed.textContent = formatInteger(state.cumulativeMesoUsed);
    }

    function handleRuntimeMessage(event) {
        if (!simulatorFrame || event.source !== simulatorFrame.contentWindow) return;
        const data = event.data || {};
        if (data.channel !== BRIDGE_CHANNEL) return;
        if (data.type === 'toggle-fullscreen-from-runtime') { toggleFullscreen(); return; }
        if (data.type === 'ready') {
            bridgeReady = true; stopHandshake(); setControlsEnabled(true); postToRuntime({ type: 'get-state' }); postFullscreenState(isFullscreen()); return;
        }
        if (data.type === 'state') { applyRuntimeState(data); applyingLevel = false; return; }
        if (data.type === 'ack' && data.ok === false) { applyingLevel = false; setControlsEnabled(true); postToRuntime({ type: 'get-state' }); }
    }

    function applyCurrentLevel() {
        if (!currentLevelSelect || !bridgeReady || applyingLevel) return;
        applyingLevel = true;
        const level = Math.max(1, Math.min(15, Number(currentLevelSelect.value) || 1));
        if (statCrystalUsed) statCrystalUsed.textContent = '0';
        if (statMesoUsed) statMesoUsed.textContent = '0';
        postToRuntime({ type: 'set-level', level });
        window.setTimeout(() => { if (!applyingLevel) return; applyingLevel = false; postToRuntime({ type: 'get-state' }); }, 1000);
    }
    function clearSimulatorRecords() { if (bridgeReady) postToRuntime({ type: 'reset' }); }

    let savedTheme = 'light';
    try { savedTheme = localStorage.getItem('msm-theme') === 'dark' ? 'dark' : 'light'; }
    catch (error) { console.warn('無法讀取主題設定：', error); }
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (fullscreenToggle) fullscreenToggle.addEventListener('click', toggleFullscreen);
    if (currentLevelSelect) currentLevelSelect.addEventListener('change', applyCurrentLevel);
    if (resetSimulatorButton) resetSimulatorButton.addEventListener('click', clearSimulatorRecords);
    window.addEventListener('message', handleRuntimeMessage);
    if (simulatorFrame && stageHost) {
        simulatorFrame.addEventListener('load', () => { stageHost.classList.add('is-loaded'); reflowStage(); startHandshake(); });
        startHandshake();
    }
    window.addEventListener('resize', reflowStage, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(reflowStage, 50), { passive: true });
    window.visualViewport?.addEventListener('resize', reflowStage, { passive: true });
    document.addEventListener('fullscreenchange', () => { updateFullscreenLabel(); postFullscreenState(isFullscreen()); requestAnimationFrame(reflowStage); window.setTimeout(reflowStage, 80); });
    document.addEventListener('webkitfullscreenchange', () => { updateFullscreenLabel(); postFullscreenState(isFullscreen()); requestAnimationFrame(reflowStage); window.setTimeout(reflowStage, 80); });
    applyTheme(savedTheme);
    updateFullscreenLabel();
    requestAnimationFrame(reflowStage);
})();
