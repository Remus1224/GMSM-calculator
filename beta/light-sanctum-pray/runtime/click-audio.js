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

  // Only the game canvas gets the MapleM UI click. Site shell controls and the
  // fullscreen overlay intentionally do not play BtMouseClick.
  document.getElementById('sceneCanvas')?.addEventListener('click', play, true);

  // Confirm/Cancel live in the nested PrayConfirmPopup iframe. Auto-confirm used by
  // the all-locked bypass is silent because the Pray button already produced the click.
  window.addEventListener('message', event => {
    const data = event && event.data || {};
    if (data.type === 'maplem-pray-confirm-action' && !data.silent && (data.action === 'confirm' || data.action === 'cancel')) play();
  });
})();
