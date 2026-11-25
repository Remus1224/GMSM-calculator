import { createCryptoRng, createSeededTestRng, unbiasedTicket } from './normal-local-simulation.mjs';

const EXPECTED_FEVER_ROWS = 134;
const LOCAL_DRAWS = 11;

function decimalRatio(value, fieldName) {
  if (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value)) throw new Error(`INVALID_DECIMAL:${fieldName}`);
  const [whole, fraction = ''] = value.split('.');
  return { numerator: BigInt(`${whole}${fraction}`), denominator: 10n ** BigInt(fraction.length), places: fraction.length };
}

function assertPercentMatchesExact(percentRaw, fractionRaw, sourceRowKey) {
  const percent = decimalRatio(percentRaw, 'officialProbabilityPercentRaw');
  const exact = decimalRatio(fractionRaw, 'officialExactFractionRaw');
  if (percent.numerator * exact.denominator !== exact.numerator * percent.denominator * 100n) {
    throw new Error(`FEVER_OFFICIAL_FRACTION_MISMATCH:${sourceRowKey}`);
  }
}

export function buildFeverTicketTable(feverEntries, admissionRows) {
  if (!Array.isArray(feverEntries) || feverEntries.length !== EXPECTED_FEVER_ROWS) throw new Error('FEVER_ENTRY_COUNT_MUST_BE_134');
  if (!Array.isArray(admissionRows) || admissionRows.length !== EXPECTED_FEVER_ROWS) throw new Error('FEVER_ADMISSION_COUNT_MUST_BE_134');

  const admissionByKey = new Map();
  for (const row of admissionRows) {
    if (row?.pool !== 'FEVER' || typeof row.sourceRowKey !== 'string' || admissionByKey.has(row.sourceRowKey)) throw new Error('FEVER_ADMISSION_KEYS_INVALID');
    admissionByKey.set(row.sourceRowKey, row);
  }

  const seen = new Set();
  for (const row of feverEntries) {
    if (row?.pool !== 'FEVER' || typeof row.officialSourceRowKey !== 'string' || seen.has(row.officialSourceRowKey)) throw new Error('FEVER_SOURCE_ROW_KEYS_INVALID');
    seen.add(row.officialSourceRowKey);
    assertPercentMatchesExact(row.officialProbabilityPercentRaw, row.officialExactFractionRaw, row.officialSourceRowKey);
    const admitted = admissionByKey.get(row.officialSourceRowKey);
    if (!admitted || admitted.announcementName !== row.announcementName || admitted.officialProbabilityPercentRaw !== row.officialProbabilityPercentRaw || admitted.officialExactFractionRaw !== row.officialExactFractionRaw) {
      throw new Error(`FEVER_ADMISSION_ROW_JOIN_FAILED:${row.officialSourceRowKey}`);
    }
  }
  if (admissionByKey.size !== feverEntries.length) throw new Error('FEVER_ADMISSION_ROW_COUNT_MISMATCH');

  const parsed = feverEntries.map(row => decimalRatio(row.officialProbabilityPercentRaw, 'officialProbabilityPercentRaw'));
  const places = Math.max(...parsed.map(value => value.places));
  if (places > 3) throw new Error('UNEXPECTED_FEVER_PERCENT_PRECISION');
  const scale = 10n ** BigInt(places);
  let cursor = 0n;
  const buckets = feverEntries.map((row, index) => {
    const value = parsed[index];
    const weight = value.numerator * (scale / value.denominator);
    const bucket = Object.freeze({ sourceRowKey: row.officialSourceRowKey, start: cursor, end: cursor + weight, weight });
    cursor += weight;
    return bucket;
  });
  const total = 100n * scale;
  if (cursor !== total) throw new Error(`OFFICIAL_FEVER_SUM_NOT_100:${cursor}/${total}`);

  return Object.freeze({
    pool: 'FEVER', rows: Object.freeze([...feverEntries]), admissionByKey,
    buckets: Object.freeze(buckets), total, scale, percentPlaces: places,
    normalizationApplied: false,
  });
}

function drawTen(table, rng, mode) {
  const picks = [];
  for (let index = 0; index < LOCAL_DRAWS; index += 1) {
    const selected = unbiasedTicket(table, rng);
    const bucket = table.buckets.find(candidate => selected.ticket >= candidate.start && selected.ticket < candidate.end);
    const source = table.rows.find(row => row.officialSourceRowKey === bucket?.sourceRowKey);
    const admission = source && table.admissionByKey.get(source.officialSourceRowKey);
    if (!source || !admission) throw new Error(`FEVER_RESULT_ROW_NOT_ADMITTED:${bucket?.sourceRowKey ?? 'UNKNOWN'}`);
    picks.push(Object.freeze({
      classification: 'LOCAL_FEVER_TENTIME_SIMULATION_WEB_ONLY',
      mode,
      resultIndex: index,
      pool: 'FEVER',
      sourceRowKey: source.officialSourceRowKey,
      officialSourceSheet: source.officialSourceSheet,
      officialSourceRow: source.officialSourceRow,
      announcementName: source.announcementName,
      officialGrade: source.officialGrade ?? null,
      officialProbabilityPercentRaw: source.officialProbabilityPercentRaw,
      officialExactFractionRaw: source.officialExactFractionRaw,
      ticket: selected.ticket.toString(),
      totalTickets: table.total.toString(),
      rejectionAttempts: selected.rejectionAttempts,
      identity: Object.freeze({
        identityVerdict: source.clientIdentity?.identityVerdict ?? 'UNRESOLVED',
        verifiedClientItemId: source.clientIdentity?.verifiedClientItemId ?? null,
        candidateClientItemIds: Object.freeze([...(source.clientIdentity?.candidateClientItemIds ?? [])]),
        serverPayloadProven: source.clientIdentity?.serverPayloadProven ?? false,
      }),
      admission,
      resultPayload: null,
      liveResultGrade: 'UNKNOWN',
      selectionRule: 'WEB_SIMULATION_ONLY: 11 sequential independent draws with replacement from the 134-row Fever announcement-weight table; not a native/server rule.',
    }));
  }
  return Object.freeze({
    classification: 'LOCAL_FEVER_TENTIME_SIMULATION_WEB_ONLY',
    pool: 'FEVER',
    drawCount: LOCAL_DRAWS,
    mode,
    strategy: '11 sequential independent draws with replacement using the official Fever announcement percentages as local display weights; server/native generation is unresolved.',
    normalizationApplied: false,
    sourceRowKeys: Object.freeze(picks.map(pick => pick.sourceRowKey)),
    results: Object.freeze(picks),
  });
}

export function createFeverLocalSimulator(feverEntries, admissionRows) {
  const table = buildFeverTicketTable(feverEntries, admissionRows);
  return Object.freeze({
    table,
    drawRandomTen() {
      const rng = createCryptoRng();
      return drawTen(table, rng, 'CRYPTO_GET_RANDOM_VALUES_LOCAL_ONLY');
    },
    drawSeededTen(seed) {
      const rng = createSeededTestRng(seed);
      return drawTen(table, rng, 'SEEDED_XORSHIFT128_TEST_ONLY');
    },
  });
}
