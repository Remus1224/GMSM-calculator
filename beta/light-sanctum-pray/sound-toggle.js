(() => {
    'use strict';

    const STORAGE_KEY = 'gmsm-light-sanctum-pray-sound';
    const button = document.getElementById('btn-sound-toggle-pray');

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

    function render() {
        if (!button) return;
        const enabled = isEnabled();
        button.textContent = enabled ? '🔊 音效：開啟' : '🔇 音效：關閉';
        button.classList.toggle('muted', !enabled);
        button.setAttribute('aria-pressed', String(enabled));
    }

    if (button) {
        button.addEventListener('click', () => {
            save(!isEnabled());
            render();
        });
    }

    // BtMouseClick belongs only to the in-game Light Sanctum UI. Site-shell controls
    // such as Home, theme, level selection, reset and the sound setting itself stay silent.
    render();
})();
