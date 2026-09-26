(() => {
  'use strict';
  const root = document.documentElement;
  const CHANNEL = 'gmsm-light-sanctum-pray';
  const TYPE = 'preset-phase1-status';
  function publish() {
    const status = root.dataset.presetPhase1 || 'booting';
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ channel: CHANNEL, type: TYPE, status }, '*');
      }
    } catch (error) {
      console.warn('Preset status bridge failed:', error);
    }
  }
  if (!root.dataset.presetPhase1) root.dataset.presetPhase1 = 'booting';
  publish();
  new MutationObserver(publish).observe(root, {
    attributes: true,
    attributeFilter: ['data-preset-phase1']
  });
})();
