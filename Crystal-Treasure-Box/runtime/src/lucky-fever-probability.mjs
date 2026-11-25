import { createCryptoRng, createSeededTestRng, unbiasedTicket } from './normal-local-simulation.mjs';

const TICKET_TABLE = Object.freeze({ total: 10000n });
const PURCHASE_RULES = Object.freeze({
  1: Object.freeze({ probabilityBasisPoints: 150, label: 'NORMAL_SINGLE_1_5_PERCENT' }),
  11: Object.freeze({ probabilityBasisPoints: 1650, label: 'NORMAL_TEN_PLUS_ONE_16_5_PERCENT' }),
});

export function evaluateLuckyFeverPurchase({ purchaseCount, mode = 'random', seed = '', feverBefore, diagnostic = false, rng = null }) {
  const rule = PURCHASE_RULES[purchaseCount];
  if (!rule) throw new RangeError('LUCKY_FEVER_PURCHASE_COUNT_UNSUPPORTED');
  if (!feverBefore || !Number.isInteger(feverBefore.progress) || !Number.isInteger(feverBefore.maxProgress)) {
    throw new TypeError('LUCKY_FEVER_PRE_PURCHASE_STATE_REQUIRED');
  }

  const base = {
    classification: 'WEB_SIMULATION_ONLY',
    ruleSource: 'PLAYER_SUPPLIED_GAME_PROBABILITY_RULE',
    purchaseCount,
    probabilityBasisPoints: rule.probabilityBasisPoints,
    probabilityPercent: rule.probabilityBasisPoints / 100,
    feverBefore: { progress: feverBefore.progress, maxProgress: feverBefore.maxProgress, phase: feverBefore.phase, usesRemaining: feverBefore.usesRemaining },
    expectedNormalProgressAfterPurchase: feverBefore.progress + purchaseCount,
    randomDrawn: false,
    diagnostic,
  };

  if (diagnostic) return Object.freeze({ ...base, eligible: false, triggered: false, outcome: 'SUPPRESSED_DIAGNOSTIC_SESSION' });
  if (feverBefore.phase === 'fever-test-active' && feverBefore.usesRemaining > 0) {
    return Object.freeze({ ...base, eligible: false, triggered: false, outcome: 'FEVER_OPPORTUNITY_PRESENT_BEFORE_PURCHASE' });
  }
  if (feverBefore.phase !== 'normal-progress' || feverBefore.normalSingleAvailable !== true || feverBefore.progress >= feverBefore.maxProgress) {
    return Object.freeze({ ...base, eligible: false, triggered: false, outcome: 'NORMAL_PURCHASE_NOT_ELIGIBLE_BEFORE_DRAW' });
  }
  if (base.expectedNormalProgressAfterPurchase >= feverBefore.maxProgress) {
    return Object.freeze({ ...base, eligible: false, triggered: false, outcome: 'NATURAL_FEVER_CAP_AFTER_PURCHASE' });
  }

  let selectedRng = rng;
  if (!selectedRng) {
    if (mode === 'seeded') {
      if (typeof seed !== 'string' || seed.trim() === '') throw new Error('LUCKY_FEVER_SEEDED_MODE_REQUIRES_SEED');
      // Domain-separated test stream: it cannot consume or shift reward sampler tickets.
      selectedRng = createSeededTestRng(`${seed}|R12P3_LUCKY_FEVER|NORMAL_${purchaseCount}`);
    } else if (mode === 'random') {
      selectedRng = createCryptoRng();
    } else {
      throw new Error('LUCKY_FEVER_RANDOM_MODE_INVALID');
    }
  }
  const selected = unbiasedTicket(TICKET_TABLE, selectedRng);
  const roll = Number(selected.ticket);
  return Object.freeze({
    ...base,
    eligible: true,
    triggered: roll < rule.probabilityBasisPoints,
    outcome: roll < rule.probabilityBasisPoints ? 'TRIGGERED' : 'NOT_TRIGGERED',
    mode: selectedRng.label,
    seed: mode === 'seeded' ? seed : null,
    randomDrawn: true,
    rollBasisPoints: roll,
    ticketRange: '[0,10000)',
    rejectionAttempts: selected.rejectionAttempts,
  });
}
