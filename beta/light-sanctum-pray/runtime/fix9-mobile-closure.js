(() => {
    'use strict';

    const CONFIRM_SRC = 'pray-confirm-popup/index.html?v=20260925-fix10';
    const overlay = document.getElementById('prayConfirmOverlay');
    const frame = document.getElementById('prayConfirmFrame');
    const canvas = document.getElementById('sceneCanvas');
    const simStatus = document.getElementById('gameplaySimStatus');

    function statusText() {
        return String(simStatus && simStatus.textContent || '');
    }

    function ensureConfirmLoaded() {
        if (!frame || frame.dataset.loaded === '1') return;
        frame.dataset.loaded = '1';
        frame.src = CONFIRM_SRC;
    }

    function unloadConfirm() {
        if (!frame || frame.dataset.loaded !== '1') return;
        frame.src = 'about:blank';
        frame.dataset.loaded = '0';
    }

    function restoreDefaultSkipAfterReset() {
        if (!canvas || !simStatus) return false;
        const text = statusText();
        if (!text.includes('SkipConfirm OFF') || !text.includes('來源 Reset')) return false;

        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;

        const clientX = rect.left + rect.width * (1239 / 1280);
        const clientY = rect.top + rect.height * (692 / 720);
        canvas.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX,
            clientY
        }));
        return true;
    }

    function reconcileConfirmResidency() {
        if (!overlay || !frame) return;

        if (restoreDefaultSkipAfterReset()) return;

        const skipOff = statusText().includes('SkipConfirm OFF');
        if (!overlay.hidden || skipOff) {
            // Fix10: confirmation runtime is loaded once when the user enables
            // confirmation and is reused between Pray actions. Fix9 destroyed
            // and rebuilt the heavy child runtime on every popup cycle.
            ensureConfirmLoaded();
        } else {
            // Preserve Fix8 idle/thermal behavior while SkipConfirm is ON.
            unloadConfirm();
        }
    }

    if (overlay && frame) {
        frame.dataset.loaded = '0';
        frame.src = 'about:blank';
        const confirmObserver = new MutationObserver(reconcileConfirmResidency);
        confirmObserver.observe(overlay, { attributes: true, attributeFilter: ['hidden'] });
    }

    if (simStatus) {
        const statusObserver = new MutationObserver(reconcileConfirmResidency);
        statusObserver.observe(simStatus, { childList: true, characterData: true, subtree: true });
    }

    reconcileConfirmResidency();

    window.__LS_FIX9__ = Object.freeze({
        version: 'Fix10-desktop-confirm-smoothness-1',
        fullscreenChannel: 'gmsm-light-sanctum-pray',
        confirmMode: 'resident-while-skip-off',
        confirmDefault: 'skip-checked-after-reset',
        idlePolicy: 'about-blank-while-skip-on'
    });
})();