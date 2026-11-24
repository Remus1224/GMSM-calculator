export function createLuckyFeverOverlay() {
  const overlay = document.getElementById('luckyFeverOverlay');
  const stageFit = document.getElementById('stage-fit');
  const stage = document.getElementById('stage');
  const composition = window.LUCKY_FEVER_COMPOSITION;
  const duration = Number(window.FX_SOURCE_MODEL?.clip?.maxSerializedKeyTime);
  let generation = 0;
  let frame = 0;
  let activeRunId = null;
  let status = 'HIDDEN';
  let lastError = null;
  const transitionProbeEnabled = new URLSearchParams(location.search).get('phoneDiag') === '1';
  let transitionCosts = [];
  function measureTransition(step, action) {
    if (!transitionProbeEnabled) return action();
    const startedAt = performance.now();
    try { return action(); }
    finally {
      if (transitionCosts.length < 32) transitionCosts.push({ step, startedAt, elapsedMs: performance.now() - startedAt });
    }
  }
  let playbackCosts = { calls: 0, totalMs: 0, maxMs: 0, slowFrames: [] };
  function present(time) {
    const before = performance.now();
    composition.setTime(time);
    const elapsed = performance.now() - before;
    playbackCosts.calls++;
    playbackCosts.totalMs += elapsed;
    playbackCosts.maxMs = Math.max(playbackCosts.maxMs, elapsed);
    if (elapsed > 25 && playbackCosts.slowFrames.length < 8) {
      playbackCosts.slowFrames.push({ time, elapsedMs: elapsed, at: performance.now(), layers: composition.renderCosts?.() });
    }
  }
  let resolveRun = null;
  const firstFrameWarm = { status: 'DISABLED', elapsedMs: null, result: null, error: null };
  if (new URLSearchParams(location.search).get('luckyFirstFrameWarm') === '1') {
    firstFrameWarm.status = 'WAITING';
    // A bounded startup task. Never reveal the overlay or advance a live run.
    setTimeout(async () => {
      try {
        let ready = false;
        for (let attempt = 0; attempt < 240; attempt++) {
          if (activeRunId !== null) { firstFrameWarm.status = 'SKIPPED_ACTIVE_RUN'; return; }
          const prepared = composition?.staticPreparationInfo?.();
          if (composition?.dotParticleC2Info?.().status === 'READY' &&
              composition?.inComePaC5Info?.().status === 'READY' && prepared?.status === 'READY') {
            ready = true; break;
          }
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        if (!ready) { firstFrameWarm.status = 'NOT_READY'; return; }
        if (activeRunId !== null || !overlay?.hidden) { firstFrameWarm.status = 'SKIPPED_ACTIVE_RUN'; return; }
        const rect = stage.getBoundingClientRect();
        const before = performance.now();
        firstFrameWarm.result = composition.prepareFirstFrame({ width: rect.width, height: rect.height });
        firstFrameWarm.elapsedMs = performance.now() - before;
        firstFrameWarm.status = 'READY';
      } catch (error) {
        firstFrameWarm.status = 'FAILED';
        firstFrameWarm.error = String(error);
      }
    }, 1000);
  }

  function updateOverlayBounds() {
    if (!overlay || !stageFit || !stage) return false;
    const stageRect = stage.getBoundingClientRect();
    const hostRect = stageFit.getBoundingClientRect();
    const scaleX = hostRect.width / (stageFit.offsetWidth || hostRect.width);
    const scaleY = hostRect.height / (stageFit.offsetHeight || hostRect.height);
    if (!(stageRect.width > 0 && stageRect.height > 0 && scaleX > 0 && scaleY > 0)) return false;
    const left = (stageRect.left - hostRect.left) / scaleX - stageFit.clientLeft;
    const top = (stageRect.top - hostRect.top) / scaleY - stageFit.clientTop;
    const cssPx = value => `${Math.round(value * 10000) / 10000}px`;
    overlay.style.left = cssPx(left);
    overlay.style.top = cssPx(top);
    overlay.style.width = cssPx(stageRect.width / scaleX);
    overlay.style.height = cssPx(stageRect.height / scaleY);
    return true;
  }

  const boundsObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateOverlayBounds);
  if (boundsObserver && stageFit && stage) {
    boundsObserver.observe(stageFit);
    boundsObserver.observe(stage);
  }
  window.addEventListener('resize', updateOverlayBounds, { passive: true });
  updateOverlayBounds();

  function setVisible(visible) {
    if (!overlay) return;
    if (visible) updateOverlayBounds();
    overlay.hidden = !visible;
    overlay.setAttribute('aria-hidden', String(!visible));
    stage?.classList.toggle('lucky-fever-overlay-active', visible);
  }

  function cancel(reason = 'cancelled') {
    generation++;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    setVisible(false);
    activeRunId = null;
    const resolve = resolveRun;
    resolveRun = null;
    if (resolve) resolve({ status: 'CANCELLED', reason });
    status = 'HIDDEN';
  }

  async function play({ runId, isCurrent, onStart }) {
    cancel('replaced');
    const token = ++generation;
    activeRunId = runId;
    status = 'LOADING';
    lastError = null;
    playbackCosts = { calls: 0, totalMs: 0, maxMs: 0, slowFrames: [] };
    transitionCosts = [];
    if (!overlay || !stageFit || !stage || !composition || !Number.isFinite(duration) || duration <= 0) {
      status = 'BLOCKED_SOURCE_NOT_READY';
      activeRunId = null;
      return { status, reason: !stageFit || !stage ? 'GAME_STAGE_OR_OVERLAY_HOST_UNAVAILABLE' : 'C5_COMPOSITION_OR_CLIP_UNAVAILABLE' };
    }
    try {
      measureTransition('set-mode', () => composition.setDotParticleMode('C5'));
      for (let attempt = 0; attempt < 240; attempt++) {
        if (token !== generation || !isCurrent()) return { status: 'CANCELLED', reason: 'session-invalidated-before-start' };
        const c2 = composition.dotParticleC2Info();
        const c5 = composition.inComePaC5Info();
        if (c2.status === 'FAILED' || c5.status === 'FAILED') throw new Error(`C5_ASSET_LOAD_FAILED:${c2.status}/${c5.status}`);
        if (c2.status === 'READY' && c5.status === 'READY') break;
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      if (token !== generation || !isCurrent()) return { status: 'CANCELLED', reason: 'session-invalidated-before-start' };
      const c2 = composition.dotParticleC2Info();
      const c5 = composition.inComePaC5Info();
      if (c2.status !== 'READY' || c5.status !== 'READY') throw new Error(`C5_ASSET_LOAD_TIMEOUT:${c2.status}/${c5.status}`);
      if (!measureTransition('initial-bounds', updateOverlayBounds)) throw new Error('GAME_STAGE_BOUNDS_UNAVAILABLE');
      measureTransition('show-overlay', () => setVisible(true));
      measureTransition('first-render', () => present(0));
      status = 'PLAYING';
      measureTransition('app-on-start', () => onStart(performance.now()));
      const startedAt = performance.now();
      let previousCallbackAt = startedAt;
      let callbackIndex = 0;
      return await new Promise(resolve => {
        resolveRun = resolve;
        const tick = now => {
          frame = 0;
          const callbackAt = performance.now();
          if (transitionProbeEnabled && (callbackIndex < 3 || callbackAt - previousCallbackAt > 35) && transitionCosts.length < 32) {
            transitionCosts.push({ step: 'callback-gap', index: callbackIndex, startedAt: callbackAt,
              elapsedMs: callbackAt - previousCallbackAt, rafTimestamp: now });
          }
          previousCallbackAt = callbackAt;
          callbackIndex++;
          if (token !== generation || !isCurrent()) {
            cancel('session-invalidated-during-playback');
            return;
          }
          const time = Math.min(duration, Math.max(0, (now - startedAt) / 1000));
          present(time);
          if (time >= duration) {
            measureTransition('hide-overlay', () => setVisible(false));
            activeRunId = null;
            status = 'COMPLETE';
            const done = resolveRun;
            resolveRun = null;
            if (done) measureTransition('resolve-complete', () => done({ status: 'COMPLETE', runId, durationSeconds: duration, endedAt: now }));
            return;
          }
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      });
    } catch (error) {
      lastError = String(error?.stack || error);
      if (token === generation) {
        setVisible(false);
        activeRunId = null;
        status = 'FAILED';
      }
      return { status: 'FAILED', runId, reason: String(error) };
    }
  }

  return Object.freeze({
    play,
    cancel,
    snapshot: () => ({ status, lastError, firstFrameWarm: { ...firstFrameWarm }, transitionCosts: transitionCosts.map(entry => ({ ...entry })), atlasStorage: composition.atlasStorage?.(), staticPreparation: composition.staticPreparationInfo?.(), playbackCosts: { ...playbackCosts, slowFrames: [...playbackCosts.slowFrames] }, sourceC2: composition?.dotParticleC2Info?.(), sourceC5: composition?.inComePaC5Info?.(), activeRunId, durationSeconds: duration, overlayHidden: overlay?.hidden ?? true })
  });
}
