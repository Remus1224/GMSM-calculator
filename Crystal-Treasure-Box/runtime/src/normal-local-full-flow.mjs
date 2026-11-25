const FINISH_TRIGGERS = new Set(['skip', 'ended']);

/**
 * Small state holder for the opt-in local Normal draw flow.
 * It never samples, changes payloads, or chooses a movie fixture.
 */
export function createNormalLocalFullFlowController() {
  let pending = null;
  let lastReceipt = null;
  let nextFlowId = 1;

  function publicState() {
    if (!pending) return null;
    return {
      flowId: pending.flowId,
      sourceRowKey: pending.sourceRowKey,
      mode: pending.mode,
      movieKey: pending.movieKey,
      phase: pending.phase,
      finishTrigger: pending.finishTrigger ?? null,
      startedAt: pending.startedAt,
      events: pending.events.map(event => ({ ...event })),
      result: pending.result,
    };
  }

  function append(event, fields = {}) {
    if (!pending) return;
    pending.events.push({ event, ...fields });
  }

  return {
    begin({ result, mode, movieKey, at }) {
      if (pending) throw new Error('NORMAL_LOCAL_FLOW_ALREADY_PENDING');
      if (result?.pool !== 'NORMAL' || typeof result.sourceRowKey !== 'string' || !result.sourceRowKey)
        throw new Error('NORMAL_LOCAL_FLOW_RESULT_ROW_KEY_INVALID');
      if (!['random', 'seeded'].includes(mode)) throw new Error('NORMAL_LOCAL_FLOW_MODE_NOT_EXPLICIT');
      if (typeof movieKey !== 'string' || !movieKey) throw new Error('NORMAL_LOCAL_FLOW_MOVIE_FIXTURE_NOT_EXPLICIT');

      pending = {
        flowId: nextFlowId++,
        result,
        sourceRowKey: result.sourceRowKey,
        mode,
        movieKey,
        phase: 'preparing',
        finishTrigger: null,
        startedAt: at,
        events: [{ event: 'draw-selected', at, sourceRowKey: result.sourceRowKey, mode }],
      };
      return publicState();
    },

    beginWithoutMovie({ result, mode, at, reason = 'SELECTOR_UNRESOLVED' }) {
      if (pending) throw new Error('NORMAL_LOCAL_FLOW_ALREADY_PENDING');
      if (result?.pool !== 'NORMAL' || typeof result.sourceRowKey !== 'string' || !result.sourceRowKey)
        throw new Error('NORMAL_LOCAL_FLOW_RESULT_ROW_KEY_INVALID');
      if (!['random', 'seeded'].includes(mode)) throw new Error('NORMAL_LOCAL_FLOW_MODE_NOT_EXPLICIT');
      pending = {
        flowId: nextFlowId++, result, sourceRowKey: result.sourceRowKey, mode,
        movieKey: null, phase: 'result-loading', finishTrigger: 'no-video-safe-recovery', startedAt: at,
        events: [
          { event: 'draw-selected', at, sourceRowKey: result.sourceRowKey, mode },
          { event: 'movie-selection-unresolved', at, reason },
          { event: 'continue-without-video-same-result', at, sourceRowKey: result.sourceRowKey },
        ],
      };
      return publicState();
    },

    movieStarted(at) {
      if (!pending || pending.phase !== 'preparing') return { accepted: false, reason: 'NOT_PREPARING' };
      pending.phase = 'movie';
      append('movie-start', { at, sourceRowKey: pending.sourceRowKey, movieKey: pending.movieKey });
      return { accepted: true, pending: publicState() };
    },

    finish(trigger, at) {
      if (!pending || pending.phase !== 'movie') return { accepted: false, reason: 'NOT_IN_MOVIE' };
      if (!FINISH_TRIGGERS.has(trigger)) return { accepted: false, reason: 'INVALID_FINISH_TRIGGER' };
      pending.phase = 'result-loading';
      pending.finishTrigger = trigger;
      append('movie-finish', { at, trigger, sourceRowKey: pending.sourceRowKey });
      return { accepted: true, pending: publicState() };
    },

    cardDisplayed(at, admissionClass) {
      if (!pending || pending.phase !== 'result-loading') return { accepted: false, reason: 'NOT_LOADING_RESULT' };
      pending.phase = 'result-visible';
      append('result-card-displayed', { at, sourceRowKey: pending.sourceRowKey, admissionClass });
      return { accepted: true, pending: publicState() };
    },

    returnToShop(at, trigger = 'confirm-or-reset') {
      if (!pending) return null;
      const returned = publicState();
      returned.phase = 'returned';
      returned.events.push({ event: 'return-to-shop', at, trigger, sourceRowKey: pending.sourceRowKey });
      lastReceipt = returned;
      pending = null;
      return { ...returned, result: returned.result };
    },

    current() { return publicState(); },
    receipt() { return lastReceipt ? { ...lastReceipt, events: lastReceipt.events.map(event => ({ ...event })) } : null; },
  };
}
