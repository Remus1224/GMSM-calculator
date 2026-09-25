(() => {
    'use strict';

    const CONFIRM_SRC = 'pray-confirm-popup/index.html?v=20260925-fix9';
    const overlay = document.getElementById('prayConfirmOverlay');
    const frame = document.getElementById('prayConfirmFrame');
    const canvas = document.getElementById('sceneCanvas');
    const simStatus = document.getElementById('gameplaySimStatus');
    let unloadTimer = 0;

    function syncConfirmResidency() {
        if (!overlay || !frame) return;
        window.clearTimeout(unloadTimer);

        if (!overlay.hidden) {
            if (frame.dataset.loaded !== '1') {
                frame.dataset.loaded = '1';
                frame.src = CONFIRM_SRC;
            }
            return;
        }

        if (frame.dataset.loaded === '1') {
            unloadTimer = window.setTimeout(() => {
                if (!overlay.hidden) return;
                frame.src = 'about:blank';
                frame.dataset.loaded = '0';
            }, 0);
        }
    }

    if (overlay && frame) {
        frame.dataset.loaded = '0';
        frame.src = 'about:blank';
        const confirmObserver = new MutationObserver(syncConfirmResidency);
        confirmObserver.observe(overlay, { attributes: true, attributeFilter: ['hidden'] });
        syncConfirmResidency();
    }

    function restoreDefaultSkipAfterReset() {
        if (!canvas || !simStatus) return;
        const text = String(simStatus.textContent || '');
        if (!text.includes('SkipConfirm OFF') || !text.includes('來源 Reset')) return;

        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        // Native 1280x720 coordinate inside the serialized Btn_Skip hit region.
        const clientX = rect.left + rect.width * (1239 / 1280);
        const clientY = rect.top + rect.height * (692 / 720);
        canvas.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX,
            clientY
        }));
    }

    if (simStatus) {
        const statusObserver = new MutationObserver(restoreDefaultSkipAfterReset);
        statusObserver.observe(simStatus, { childList: true, characterData: true, subtree: true });
        restoreDefaultSkipAfterReset();
    }

    window.__LS_FIX9__ = Object.freeze({
        version: 'Fix9-mobile-fullscreen-confirm-closure-1',
        fullscreenChannel: 'gmsm-light-sanctum-pray',
        confirmMode: 'lazy-on-demand',
        confirmDefault: 'skip-checked-after-reset'
    });
})();