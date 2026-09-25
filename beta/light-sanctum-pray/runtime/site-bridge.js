(() => {
    'use strict';

    const CHANNEL = 'gmsm-light-sanctum-pray';
    const VERSION = 'beta6';

    const levelSelect = document.getElementById('gameplayLevel');
    const applyLevelButton = document.getElementById('gameplayApplyLevel');
    const resetButton = document.getElementById('gameplayReset');
    const transitionToggle = document.getElementById('gameplayDebugTransitions');
    const statusNode = document.getElementById('gameplaySimStatus');
    const crystalBalanceInput = document.getElementById('gameplayCoinBalance');
    const mesoBalanceInput = document.getElementById('gameplayMesoBalance');

    let cumulativeCrystalUsed = 0;
    let cumulativeMesoUsed = 0;
    let lastCrystalBalance = null;
    let lastMesoBalance = null;
    let sendQueued = false;

    function finiteNumber(value, fallback = 0) {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }

    function clampLevel(value) {
        return Math.max(1, Math.min(15, Math.round(finiteNumber(value, 1))));
    }

    function currentLevel() {
        const text = statusNode?.textContent || '';
        const match = text.match(/Lv\.(\d+)/i);
        if (match) return clampLevel(match[1]);
        return clampLevel(levelSelect?.value || 1);
    }

    function currentBalances() {
        return {
            crystal: Math.max(0, Math.floor(finiteNumber(crystalBalanceInput?.value, 0))),
            meso: Math.max(0, Math.floor(finiteNumber(mesoBalanceInput?.value, 0)))
        };
    }

    function captureConsumption() {
        const balances = currentBalances();
        if (lastCrystalBalance !== null && balances.crystal < lastCrystalBalance) {
            cumulativeCrystalUsed += lastCrystalBalance - balances.crystal;
        }
        if (lastMesoBalance !== null && balances.meso < lastMesoBalance) {
            cumulativeMesoUsed += lastMesoBalance - balances.meso;
        }
        lastCrystalBalance = balances.crystal;
        lastMesoBalance = balances.meso;
        return balances;
    }

    function statePayload() {
        const balances = captureConsumption();
        return {
            channel: CHANNEL,
            version: VERSION,
            type: 'state',
            level: currentLevel(),
            crystalBalance: balances.crystal,
            mesoBalance: balances.meso,
            cumulativeCrystalUsed,
            cumulativeMesoUsed
        };
    }

    function post(payload) {
        if (window.parent === window) return;
        window.parent.postMessage(payload, '*');
    }

    function sendState() {
        sendQueued = false;
        post(statePayload());
    }

    function queueState() {
        if (sendQueued) return;
        sendQueued = true;
        requestAnimationFrame(sendState);
    }

    function sendReady() {
        // Establish a fresh baseline before announcing readiness so loading/reset never
        // appears as user consumption.
        const balances = currentBalances();
        if (lastCrystalBalance === null) lastCrystalBalance = balances.crystal;
        if (lastMesoBalance === null) lastMesoBalance = balances.meso;
        post({
            channel: CHANNEL,
            version: VERSION,
            type: 'ready',
            capabilities: ['set-level', 'reset', 'state', 'cumulative-consumption']
        });
        queueState();
    }

    function setLevel(level) {
        if (!levelSelect || !applyLevelButton) return false;
        const target = clampLevel(level);
        const previousTransitions = transitionToggle ? transitionToggle.checked : false;

        // A manually selected level is a fresh simulation starting point. Clear prior
        // consumption and re-baseline the authoritative P137 wallets so earlier spending
        // cannot be counted again after the level switch.
        cumulativeCrystalUsed = 0;
        cumulativeMesoUsed = 0;
        lastCrystalBalance = null;
        lastMesoBalance = null;

        try {
            // This is initial-state configuration, not actual progression. Keep real Pray
            // level-up/unlock effects untouched while suppressing only this settings action.
            if (transitionToggle) transitionToggle.checked = false;
            levelSelect.value = String(target);
            levelSelect.dispatchEvent(new Event('change', { bubbles: true }));
            applyLevelButton.click();
        } finally {
            if (transitionToggle) transitionToggle.checked = previousTransitions;
        }

        const balances = currentBalances();
        lastCrystalBalance = balances.crystal;
        lastMesoBalance = balances.meso;
        queueState();
        return true;
    }

    function resetSimulator() {
        if (!resetButton) return false;
        // The site-level "重新模擬" contract clears both P137 state and site statistics.
        cumulativeCrystalUsed = 0;
        cumulativeMesoUsed = 0;
        lastCrystalBalance = null;
        lastMesoBalance = null;
        resetButton.click();
        const balances = currentBalances();
        lastCrystalBalance = balances.crystal;
        lastMesoBalance = balances.meso;
        queueState();
        return true;
    }

    window.addEventListener('message', event => {
        if (event.source !== window.parent) return;
        const data = event.data || {};
        if (data.channel !== CHANNEL) return;

        if (data.type === 'hello' || data.type === 'get-state') {
            sendReady();
            return;
        }

        if (data.type === 'set-level') {
            const ok = setLevel(data.level);
            post({ channel: CHANNEL, version: VERSION, type: 'ack', command: 'set-level', ok });
            return;
        }

        if (data.type === 'reset') {
            const ok = resetSimulator();
            post({ channel: CHANNEL, version: VERSION, type: 'ack', command: 'reset', ok });
        }
    });

    // P137 writes every authoritative state change through gameplayRenderSimStatus().
    // Observe that single sink instead of polling or reproducing gameplay/cost formulas.
    if (statusNode) {
        const observer = new MutationObserver(queueState);
        observer.observe(statusNode, { childList: true, characterData: true, subtree: true });
    }
    crystalBalanceInput?.addEventListener('change', queueState);
    mesoBalanceInput?.addEventListener('change', queueState);

    window.GMSM_LIGHT_SANCTUM_PRAY_BRIDGE = {
        version: VERSION,
        snapshot: statePayload,
        setLevel,
        reset: resetSimulator
    };

    sendReady();
})();
