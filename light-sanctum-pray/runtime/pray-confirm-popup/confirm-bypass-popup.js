(() => {
  'use strict';
  window.addEventListener('message', event => {
    const data = event.data || {};
    if (data.type !== 'maplem-pray-confirm-state') return;
    const slotCount = Math.max(0, Math.min(5, Math.round(Number(data.slotCount) || 0)));
    const locks = Array.isArray(data.locks) ? data.locks : [];
    const allLocked = slotCount > 0 && Array.from({ length: slotCount }, (_, i) => Boolean(locks[i])).every(Boolean);

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'maplem-pray-confirm-visibility', allLocked }, '*');
      if (allLocked) {
        // Reuse the established confirm path: gameplayPray() already preserves all
        // locked abilities, applies the sealed cost rule, and adds EXP only.
        window.parent.postMessage({ type: 'maplem-pray-confirm-action', action: 'confirm', silent: true, allLockedBypass: true }, '*');
      }
    }
  });
})();
