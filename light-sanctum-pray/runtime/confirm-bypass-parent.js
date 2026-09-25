(() => {
  'use strict';
  const overlay = document.getElementById('prayConfirmOverlay');
  const frame = document.getElementById('prayConfirmFrame');
  if (!overlay || !frame) return;

  // Gate a newly requested popup until its current lock state has been classified.
  // This prevents an all-locked Pray from flashing a one-frame dialog.
  const observer = new MutationObserver(() => {
    if (!overlay.hidden) overlay.style.visibility = 'hidden';
  });
  observer.observe(overlay, { attributes: true, attributeFilter: ['hidden'] });

  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow) return;
    const data = event.data || {};
    if (data.type !== 'maplem-pray-confirm-visibility') return;
    if (data.allLocked) {
      overlay.style.visibility = 'hidden';
      return;
    }
    if (!overlay.hidden) overlay.style.visibility = 'visible';
  });
})();
