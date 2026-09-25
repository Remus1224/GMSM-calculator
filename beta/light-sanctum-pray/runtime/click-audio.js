(() => {
  'use strict';
  const STORAGE_KEY = 'gmsm-light-sanctum-pray-sound';
  const audio = new Audio('audio/BtMouseClick.mp3');
  audio.preload = 'auto';

  function enabled() {
    try { return localStorage.getItem(STORAGE_KEY) !== 'off'; }
    catch (_) { return true; }
  }
  function play() {
    if (!enabled()) return;
    try {
      audio.currentTime = 0;
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } catch (_) {}
  }

  // Formal game UI is canvas-rendered. Capture phase keeps the click sound in the same
  // user gesture without touching gameplay state, Pray timing, animation, or bridge logic.
  document.getElementById('sceneCanvas')?.addEventListener('click', play, true);
  document.getElementById('embeddedFullscreenToggle')?.addEventListener('click', play, true);

  // Confirm/Cancel live in the nested PrayConfirmPopup iframe. The established popup
  // already posts this action to the runtime; reuse that message instead of changing it.
  window.addEventListener('message', event => {
    const data = event && event.data || {};
    if (data.type === 'maplem-pray-confirm-action' && (data.action === 'confirm' || data.action === 'cancel')) play();
  });
})();
