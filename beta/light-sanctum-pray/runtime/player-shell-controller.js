(() => {
    'use strict';

    const POPUP_SRC = 'pray-confirm-popup/index.html?v=20260925-fix11';
    const BLANK_SRC = 'about:blank';
    const overlay = document.getElementById('prayConfirmOverlay');
    const frame = document.getElementById('prayConfirmFrame');
    const simStatus = document.getElementById('gameplaySimStatus');

    if (!overlay || !frame) return;

    function isIOSLike() {
        const ua = String(navigator.userAgent || '');
        return /iPad|iPhone|iPod/.test(ua) ||
            (navigator.platform === 'MacIntel' && Number(navigator.maxTouchPoints || 0) > 1);
    }

    function statusText() {
        return String(simStatus && simStatus.textContent || '');
    }

    function isLoaded() {
        return frame.dataset.loaded === '1';
    }

    function loadPopup() {
        if (isLoaded()) return;
        frame.dataset.loaded = '1';
        frame.src = POPUP_SRC;
    }

    function unloadPopup() {
        if (!isLoaded()) return;
        frame.src = BLANK_SRC;
        frame.dataset.loaded = '0';
    }

    const ios = isIOSLike();
    frame.dataset.loaded = '0';
    frame.src = BLANK_SRC;

    if (!ios) {
        // Desktop regression closure: restore the last known-good P137 ownership
        // topology. The confirmation child is resident before the first Pray, so
        // Cancel/Confirm use player-presentation.js's original message bridge with
        // no load/unload navigation in the interaction path.
        loadPopup();
    } else {
        // iOS keeps the Fix8 thermal gate: no confirmation child while confirmation
        // is not in use. When SkipConfirm is OFF, preload before Pray and keep the
        // same child WindowProxy resident until the player turns SkipConfirm ON.
        function reconcileMobileResidency() {
            const skipOff = statusText().includes('SkipConfirm OFF');
            if (!overlay.hidden || skipOff) loadPopup();
            else unloadPopup();
        }

        new MutationObserver(reconcileMobileResidency).observe(overlay, {
            attributes: true,
            attributeFilter: ['hidden']
        });

        if (simStatus) {
            new MutationObserver(reconcileMobileResidency).observe(simStatus, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }

        reconcileMobileResidency();
    }

    // Ownership rule: this shell controls only child-runtime residency. It never
    // mutates gameplayState, never synthesizes canvas clicks, and never handles
    // Cancel/Confirm. Those remain exclusively owned by player-presentation.js.
    window.__LS_PLAYER_SHELL__ = Object.freeze({
        version: 'Fix11-regression-closure-1',
        desktopConfirmMode: 'resident-stable-p137',
        iosConfirmMode: 'lazy-while-confirmation-enabled',
        gameplayOwnership: 'player-presentation-only'
    });
})();
