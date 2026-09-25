(() => {
    'use strict';

    const STORAGE_KEY = 'gmsm-light-sanctum-pray-sound';
    const button = document.getElementById('btn-sound-toggle-pray');
    const clickAudio = new Audio('runtime/audio/BtMouseClick.mp3');
    clickAudio.preload = 'auto';

    function isEnabled() {
        try {
            return localStorage.getItem(STORAGE_KEY) !== 'off';
        } catch (_) {
            return true;
        }
    }

    function save(enabled) {
        try {
            localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
        } catch (_) {
            // Keep the in-memory/default behavior when storage is unavailable.
        }
    }

    function playClick() {
        if (!isEnabled()) return;
        try {
            clickAudio.currentTime = 0;
            const promise = clickAudio.play();
            if (promise && typeof promise.catch === 'function') promise.catch(() => {});
        } catch (_) {}
    }

    function render() {
        if (!button) return;
        const enabled = isEnabled();
        button.textContent = enabled ? '🔊 音效：開啟' : '🔇 音效：關閉';
        button.classList.toggle('muted', !enabled);
        button.setAttribute('aria-pressed', String(enabled));
    }

    if (button) {
        button.addEventListener('click', () => {
            const wasEnabled = isEnabled();
            if (wasEnabled) playClick();
            save(!wasEnabled);
            render();
            if (!wasEnabled) playClick();
        });
    }

    // Site-level simulator controls are also real UI operations. Runtime canvas controls
    // are handled inside the iframe by runtime/click-audio.js.
    document.addEventListener('click', event => {
        const target = event.target instanceof Element ? event.target.closest('button, a.nav-btn') : null;
        if (!target || target === button || target.disabled) return;
        playClick();
    }, true);
    document.getElementById('current-level-select')?.addEventListener('change', playClick);

    render();
})();
