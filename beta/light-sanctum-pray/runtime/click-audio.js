(() => {
  'use strict';

  const STORAGE_KEY = 'gmsm-light-sanctum-pray-sound';
  const SOUND_URL = 'audio/BtMouseClick.mp3';
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  const fallbackAudio = new Audio(SOUND_URL);
  fallbackAudio.preload = 'auto';

  let audioContext = null;
  let clickBuffer = null;
  let bufferPromise = null;
  let webAudioFailed = !AudioContextCtor;

  function enabled() {
    try { return localStorage.getItem(STORAGE_KEY) !== 'off'; }
    catch (_) { return true; }
  }

  function getContext() {
    if (webAudioFailed) return null;
    if (audioContext) return audioContext;
    try {
      try { audioContext = new AudioContextCtor({ latencyHint: 'interactive' }); }
      catch (_) { audioContext = new AudioContextCtor(); }
      return audioContext;
    } catch (_) {
      webAudioFailed = true;
      return null;
    }
  }

  function decodeAudioData(context, bytes) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const ok = value => { if (!settled) { settled = true; resolve(value); } };
      const fail = error => { if (!settled) { settled = true; reject(error); } };
      try {
        const result = context.decodeAudioData(bytes.slice(0), ok, fail);
        if (result && typeof result.then === 'function') result.then(ok, fail);
      } catch (error) {
        fail(error);
      }
    });
  }

  function preloadBuffer() {
    if (clickBuffer) return Promise.resolve(clickBuffer);
    if (bufferPromise) return bufferPromise;
    const context = getContext();
    if (!context) return Promise.reject(new Error('Web Audio unavailable'));

    bufferPromise = fetch(SOUND_URL, { cache: 'force-cache' })
      .then(response => {
        if (!response.ok) throw new Error(`Click audio HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then(bytes => decodeAudioData(context, bytes))
      .then(buffer => {
        clickBuffer = buffer;
        return buffer;
      })
      .catch(error => {
        webAudioFailed = true;
        bufferPromise = null;
        throw error;
      });

    return bufferPromise;
  }

  function playFallback() {
    try {
      fallbackAudio.currentTime = 0;
      const promise = fallbackAudio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } catch (_) {}
  }

  function startBuffer(context) {
    if (!clickBuffer || context.state !== 'running') return false;
    try {
      const source = context.createBufferSource();
      source.buffer = clickBuffer;
      source.connect(context.destination);
      source.start(0);
      return true;
    } catch (_) {
      return false;
    }
  }

  function unlockAndPlay() {
    if (!enabled()) return;

    const context = getContext();
    if (!context || webAudioFailed) {
      playFallback();
      return;
    }

    // pointerdown/touchstart is the actual user gesture on iOS. Resume here,
    // before the canvas click handler starts Pray/lock animation work.
    if (context.state !== 'running') {
      try {
        const resumed = context.resume();
        if (clickBuffer) {
          if (resumed && typeof resumed.then === 'function') {
            resumed.then(() => {
              if (!startBuffer(context)) playFallback();
            }).catch(playFallback);
          } else if (!startBuffer(context)) {
            playFallback();
          }
          return;
        }
      } catch (_) {
        playFallback();
        return;
      }
    }

    if (startBuffer(context)) return;

    // The tiny MP3 is normally decoded before the first interaction. If a very
    // early first tap beats preload, fall back immediately instead of delaying
    // the click until decode/animation work finishes.
    playFallback();
    preloadBuffer().catch(() => {});
  }

  // Preload/decode while idle. A suspended AudioContext may decode before iOS
  // grants playback; the first real game gesture resumes it.
  preloadBuffer().catch(() => {});

  const canvas = document.getElementById('sceneCanvas');
  if (canvas) {
    if (window.PointerEvent) {
      canvas.addEventListener('pointerdown', unlockAndPlay, { capture: true, passive: true });
    } else {
      canvas.addEventListener('touchstart', unlockAndPlay, { capture: true, passive: true });
      canvas.addEventListener('mousedown', unlockAndPlay, true);
    }
  }

  // Confirm/Cancel live in the nested popup iframe. The Pray tap has already
  // unlocked Web Audio, so the parent can play these actions immediately.
  window.addEventListener('message', event => {
    const data = event && event.data || {};
    if (data.type !== 'maplem-pray-confirm-action' || data.silent) return;
    if (data.action !== 'confirm' && data.action !== 'cancel') return;

    if (!enabled()) return;
    const context = getContext();
    if (context && startBuffer(context)) return;
    playFallback();
  });
})();
