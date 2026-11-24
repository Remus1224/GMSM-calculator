// Reversible local-only Fever state based on player-observed rules.
// It never produces Fever results or claims native/server transition parity.
export function isFinalLocalFeverRunConfirmEligible(owner, state, completedRunIds = new Set()) {
  return owner?.mode === 'local-fever-ten-display' && owner.count === 11 && owner.phase === 'complete'
    && owner.feverQuotaAttempted === true && owner.feverQuotaConsumed === true
    && typeof owner.feverRunId === 'string' && owner.feverRunId.length > 0
    && Array.isArray(owner.cards) && owner.cards.length === 11 && owner.cards.every(card => Number.isFinite(card.openAt))
    && Array.isArray(owner.resultCards) && owner.resultCards.length === 11
    && owner.resultCards.every(record => record.renderState !== 'ASSET_LOAD_FAILED')
    && state?.phase === 'fever-test-exhausted-transition-unknown' && state.usesRemaining === 0
    && !completedRunIds.has(owner.feverRunId);
}

export function createLocalFeverSimulation({ maxProgress = 110, feverTenTimeUses = 2 } = {}) {
  if (!Number.isInteger(maxProgress) || maxProgress <= 0) throw new TypeError('LOCAL_FEVER_MAX_PROGRESS_INVALID');
  if (!Number.isInteger(feverTenTimeUses) || feverTenTimeUses <= 0) throw new TypeError('LOCAL_FEVER_USE_COUNT_INVALID');

  let progress = 0;
  let usesRemaining = 0;
  let phase = 'normal-progress';
  let sequence = 0;
  const events = [];
  const processedEventIds = new Set();

  function record(event) {
    events.push({ sequence: ++sequence, ...event });
    if (events.length > 40) events.shift();
  }

  function eventKey(scope, id) {
    if (id === null || id === undefined || String(id).trim() === '') throw new TypeError('LOCAL_FEVER_EVENT_ID_REQUIRED');
    return `${scope}:${String(id)}`;
  }

  function duplicateResult(key) {
    if (!processedEventIds.has(key)) return null;
    record({ type: 'duplicate-event-suppressed', eventId: key, ruleClass: 'LOCAL_IDEMPOTENCY_GUARD' });
    return { accepted: false, reason: 'DUPLICATE_EVENT', state: snapshot() };
  }

  function activate(source, before, attemptedIncrease = null, activationRuleClass = null) {
    progress = maxProgress;
    usesRemaining = feverTenTimeUses;
    phase = 'fever-test-active';
    record({
      type: 'local-fever-activated', source, beforeProgress: before, afterProgress: progress,
      usesGranted: feverTenTimeUses, attemptedIncrease,
      ruleClass: activationRuleClass ?? (source === 'player-observed-normal-draw' ? 'PLAYER_OBSERVED_WITH_WEB_CLAMP_ADAPTATION' : 'WEB_SIMULATION_FORCED_FIXTURE'),
      probability: null, animation: 'NOT_IMPLEMENTED',
    });
  }

  function applyNormalDraw(drawCount, source, eventId, ruleClass, activationRuleClass = null) {
    if (![1, 11].includes(drawCount)) throw new RangeError('LOCAL_FEVER_DRAW_COUNT_UNSUPPORTED');
    if (phase !== 'normal-progress') return { accepted: false, reason: 'NORMAL_PROGRESS_UNAVAILABLE', state: snapshot() };
    const before = progress;
    const rawTarget = before + drawCount;
    if (rawTarget >= maxProgress) activate(source, before, drawCount, activationRuleClass);
    else {
      progress = rawTarget;
      record({ type: 'local-normal-draw-progress', drawCount, beforeProgress: before, afterProgress: progress,
        eventId, playerObservedIncrement: drawCount, ruleClass });
    }
    return { accepted: true, state: snapshot() };
  }

  function recordCompletedNormalSingle(flowId) {
    const key = eventKey('normal-single-flow', flowId);
    const duplicate = duplicateResult(key);
    if (duplicate) return duplicate;
    if (phase !== 'normal-progress') return { accepted: false, reason: 'NORMAL_SINGLE_UNAVAILABLE_IN_FEVER', state: snapshot() };
    processedEventIds.add(key);
    const result = applyNormalDraw(1, 'player-observed-normal-draw', key, 'PLAYER_OBSERVED_COMPLETED_LOCAL_NORMAL_SINGLE_WEB_MODEL');
    record({ type: 'local-normal-single-result-completion-counted', eventId: key, accepted: true,
      progress: result.state.progress, phase: result.state.phase, ruleClass: 'PLAYER_OBSERVED_WEB_SIMULATION_ONLY' });
    return { ...result, eventId: key };
  }

  function recordCompletedNormalTenPlusOne(runId) {
    const key = eventKey('normal-ten-plus-one-run', runId);
    const duplicate = duplicateResult(key);
    if (duplicate) return duplicate;
    if (phase !== 'normal-progress') return { accepted: false, reason: 'NORMAL_PROGRESS_UNAVAILABLE', state: snapshot() };
    processedEventIds.add(key);
    const result = applyNormalDraw(11, 'local-normal-ten-plus-one', key,
      'WEB_SIMULATION_ONLY_NORMAL_TEN_PLUS_ONE_RESULT_COMPLETION',
      'WEB_SIMULATION_ONLY_NORMAL_TEN_PLUS_ONE_COMPLETION');
    record({ type: 'local-normal-ten-plus-one-result-completion-counted', eventId: key, accepted: true,
      progress: result.state.progress, maxProgress: result.state.maxProgress, phase: result.state.phase,
      playerObservedIncrement: 11, ruleClass: 'WEB_SIMULATION_ONLY' });
    return { ...result, eventId: key };
  }

  function recordCompletedNormalPurchaseWithLuckyFever(drawCount, runId, decision) {
    if (![1, 11].includes(drawCount)) throw new RangeError('LOCAL_FEVER_LUCKY_DRAW_COUNT_UNSUPPORTED');
    const key = eventKey('normal-lucky-fever-purchase', runId);
    const duplicate = duplicateResult(key);
    if (duplicate) return duplicate;
    if (phase !== 'normal-progress' || progress >= maxProgress) return { accepted: false, reason: 'NORMAL_PROGRESS_UNAVAILABLE', state: snapshot() };
    if (decision?.classification !== 'WEB_SIMULATION_ONLY' || decision?.ruleSource !== 'PLAYER_SUPPLIED_GAME_PROBABILITY_RULE' || decision?.triggered !== true || decision?.eligible !== true || decision.purchaseCount !== drawCount) {
      return { accepted: false, reason: 'LUCKY_FEVER_DECISION_CONTRACT_INVALID', state: snapshot() };
    }
    const before = progress;
    const naturalTarget = before + drawCount;
    if (naturalTarget >= maxProgress) return { accepted: false, reason: 'NATURAL_FEVER_CAP_AFTER_PURCHASE', state: snapshot() };
    processedEventIds.add(key);
    activate('player-supplied-lucky-fever-random-trigger', before, drawCount, 'PLAYER_SUPPLIED_GAME_PROBABILITY_RULE_WEB_SIMULATION_ONLY');
    record({ type: 'local-normal-purchase-lucky-fever-settlement', eventId: key, drawCount,
      normalProgressContribution: drawCount, progressBefore: before, progressAfterNormalDraw: naturalTarget,
      progressAfterLuckyFever: progress, maxProgress, usesGranted: feverTenTimeUses,
      probabilityBasisPoints: decision.probabilityBasisPoints, rollBasisPoints: decision.rollBasisPoints,
      ruleSource: 'PLAYER_SUPPLIED_GAME_PROBABILITY_RULE', ruleClass: 'WEB_SIMULATION_ONLY_SINGLE_RUN_SETTLEMENT' });
    return { accepted: true, state: snapshot(), eventId: key, normalProgressContribution: drawCount, luckyFeverTriggered: true };
  }

  function recordDiagnosticNormalDraw(drawCount, actionId) {
    const key = eventKey('diagnostic-normal-draw', actionId);
    const duplicate = duplicateResult(key);
    if (duplicate) return duplicate;
    if (phase !== 'normal-progress') return { accepted: false, reason: 'NORMAL_PROGRESS_UNAVAILABLE', state: snapshot() };
    processedEventIds.add(key);
    return { ...applyNormalDraw(drawCount, 'diagnostic-normal-draw-fixture', key, 'WEB_SIMULATION_ONLY_DIAGNOSTIC_FIXTURE'), eventId: key };
  }

  function forceDirectFillFixture(actionId) {
    const key = eventKey('diagnostic-direct-fill', actionId);
    const duplicate = duplicateResult(key);
    if (duplicate) return duplicate;
    if (phase !== 'normal-progress') return { accepted: false, reason: 'FEVER_ALREADY_ACTIVE', state: snapshot() };
    processedEventIds.add(key);
    const before = progress;
    activate('forced-direct-fill-diagnostic-fixture', before);
    record({ type: 'direct-fill-fixture-applied', eventId: key, ruleClass: 'WEB_SIMULATION_ONLY_DIAGNOSTIC_FIXTURE' });
    return { accepted: true, state: snapshot(), eventId: key };
  }

  function completeFeverTenTime(completionId) {
    const key = eventKey('diagnostic-fever-ten-completion', completionId);
    const duplicate = duplicateResult(key);
    if (duplicate) return duplicate;
    if (phase !== 'fever-test-active' || usesRemaining <= 0) return { accepted: false, reason: 'LOCAL_FEVER_TEN_TIME_NOT_AVAILABLE', state: snapshot() };
    processedEventIds.add(key);
    const before = usesRemaining;
    usesRemaining -= 1;
    phase = usesRemaining > 0 ? 'fever-test-active' : 'fever-test-exhausted-transition-unknown';
    record({ type: 'local-fever-ten-time-completion-recorded', eventId: key, beforeUses: before, afterUses: usesRemaining,
      progressRemainsAtCap: progress === maxProgress, ruleClass: 'WEB_ADAPTATION_AFTER_EXPLICIT_DIAGNOSTIC_COMPLETION',
      nativeChargeTiming: 'UNRESOLVED', nativePostExhaustionTransition: 'UNRESOLVED', drawResultsGenerated: false });
    return { accepted: true, state: snapshot(), eventId: key };
  }

  function completeLocalFeverTenTimeRun(runId) {
    const key = eventKey('local-fever-ten-run', runId);
    const duplicate = duplicateResult(key);
    if (duplicate) return duplicate;
    if (phase !== 'fever-test-active' || usesRemaining <= 0) return { accepted: false, reason: 'LOCAL_FEVER_TEN_TIME_NOT_AVAILABLE', state: snapshot() };
    processedEventIds.add(key);
    const before = usesRemaining;
    usesRemaining -= 1;
    phase = usesRemaining > 0 ? 'fever-test-active' : 'fever-test-exhausted-transition-unknown';
    record({ type: 'local-fever-ten-run-completed', eventId: key, beforeUses: before, afterUses: usesRemaining,
      progressRemainsAtCap: progress === maxProgress, ruleClass: 'WEB_ADAPTATION_AFTER_ALL_11_CARDS_REVEALED',
      nativeChargeTiming: 'UNRESOLVED', nativePostExhaustionTransition: 'UNRESOLVED', drawResultsGeneratedByStateModel: false });
    return { accepted: true, state: snapshot(), eventId: key };
  }

  function reset({ ruleClass = 'LOCAL_TEST_CONTROL', runId = null } = {}) {
    const before = { progress, usesRemaining, phase };
    progress = 0;
    usesRemaining = 0;
    phase = 'normal-progress';
    record({ type: 'local-fever-model-reset', ...(runId === null ? {} : { runId }), before, after: { progress, usesRemaining, phase }, ruleClass });
    return { accepted: true, state: snapshot() };
  }

  function snapshot() {
    return JSON.parse(JSON.stringify({
      schema: 'CrystalChest.LocalFeverSimulation.v2', classification: 'WEB_SIMULATION_ONLY', maxProgress,
      progress, feverTenTimeUses, usesRemaining, phase,
      normalSingleAvailable: phase === 'normal-progress' && progress < maxProgress,
      automaticTriggerProbability: null, autoReturnToNormal: false,
      webClientCyclePolicy: 'WEB_SIMULATION_AUTO_NEW_CYCLE_AFTER_FINAL_FEVER_CONFIRM',
      nativePostExhaustionTransition: 'UNRESOLVED', noDrawResultsGenerated: true, events,
    }));
  }

  return Object.freeze({ recordCompletedNormalSingle, recordCompletedNormalTenPlusOne, recordCompletedNormalPurchaseWithLuckyFever, recordDiagnosticNormalDraw, forceDirectFillFixture,
    completeFeverTenTime, completeLocalFeverTenTimeRun, reset, snapshot });
}
