// Local-only Normal pool sampler. It never represents the game server RNG.
const EXPECTED_NORMAL_ROWS = 134;
const UINT64_RANGE = 1n << 64n;

function decimalRatio(value, fieldName) {
  if (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value)) {
    throw new Error(`INVALID_DECIMAL:${fieldName}`);
  }
  const [whole, fraction = ''] = value.split('.');
  return {
    numerator: BigInt(`${whole}${fraction}`),
    denominator: 10n ** BigInt(fraction.length),
    places: fraction.length,
  };
}

function assertFractionMatchesPercent(percentRaw, fractionRaw, sourceRowKey) {
  const percent = decimalRatio(percentRaw, 'officialProbabilityPercentRaw');
  const fraction = decimalRatio(fractionRaw, 'officialExactFractionRaw');
  if (percent.numerator * fraction.denominator !== fraction.numerator * percent.denominator * 100n) {
    throw new Error(`OFFICIAL_FRACTION_MISMATCH:${sourceRowKey}`);
  }
}

export function buildNormalTicketTable(normalEntries) {
  if (!Array.isArray(normalEntries) || normalEntries.length !== EXPECTED_NORMAL_ROWS) {
    throw new Error('NORMAL_ENTRY_COUNT_MUST_BE_134');
  }
  const seen = new Set();
  for (const row of normalEntries) {
    if (row?.pool !== 'NORMAL' || typeof row.officialSourceRowKey !== 'string' || seen.has(row.officialSourceRowKey)) {
      throw new Error('NORMAL_SOURCE_ROW_KEYS_INVALID');
    }
    seen.add(row.officialSourceRowKey);
    assertFractionMatchesPercent(row.officialProbabilityPercentRaw, row.officialExactFractionRaw, row.officialSourceRowKey);
  }

  const parsed = normalEntries.map((row) => decimalRatio(row.officialProbabilityPercentRaw, 'officialProbabilityPercentRaw'));
  const places = Math.max(...parsed.map((value) => value.places));
  if (places > 3) throw new Error('UNEXPECTED_OFFICIAL_PERCENT_PRECISION');
  const scale = 10n ** BigInt(places);
  let cursor = 0n;
  const buckets = normalEntries.map((row, index) => {
    const value = parsed[index];
    const weight = value.numerator * (scale / value.denominator);
    const bucket = Object.freeze({
      sourceRowKey: row.officialSourceRowKey,
      start: cursor,
      end: cursor + weight,
      weight,
    });
    cursor += weight;
    return bucket;
  });
  const total = 100n * scale;
  if (cursor !== total) throw new Error(`OFFICIAL_NORMAL_SUM_NOT_100:${cursor}/${total}`);

  return Object.freeze({
    pool: 'NORMAL',
    rows: Object.freeze([...normalEntries]),
    buckets: Object.freeze(buckets),
    total,
    scale,
    percentPlaces: places,
    normalizationApplied: false,
  });
}

export function sourceRowAtTicket(table, ticket) {
  if (typeof ticket !== 'bigint' || ticket < 0n || ticket >= table.total) {
    throw new Error('TICKET_OUT_OF_BOUNDS');
  }
  const bucket = table.buckets.find((candidate) => ticket >= candidate.start && ticket < candidate.end);
  if (!bucket) throw new Error('TICKET_BUCKET_NOT_FOUND');
  return table.rows.find((row) => row.officialSourceRowKey === bucket.sourceRowKey);
}

export function createCryptoRng() {
  if (!globalThis.crypto?.getRandomValues) throw new Error('CRYPTO_GET_RANDOM_VALUES_UNAVAILABLE');
  return Object.freeze({
    label: 'CRYPTO_GET_RANDOM_VALUES_LOCAL_ONLY',
    next64() {
      const words = new Uint32Array(2);
      globalThis.crypto.getRandomValues(words);
      return (BigInt(words[0]) << 32n) | BigInt(words[1]);
    },
  });
}

export function createSeededTestRng(seed) {
  if (typeof seed !== 'string' || seed.length === 0) throw new Error('EMPTY_TEST_SEED');
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  let x = (hash ^ 0xa341316c) >>> 0;
  let y = (hash ^ 0xc8013ea4) >>> 0;
  let z = (hash ^ 0xad90777d) >>> 0;
  let w = (hash ^ 0x7e95761e) >>> 0;
  const word = () => {
    const t = (x ^ (x << 11)) >>> 0;
    x = y;
    y = z;
    z = w;
    w = (w ^ (w >>> 19) ^ t ^ (t >>> 8)) >>> 0;
    return w;
  };
  return {
    label: 'SEEDED_XORSHIFT128_TEST_ONLY',
    seed,
    next64() {
      return (BigInt(word()) << 32n) | BigInt(word());
    },
  };
}

export function unbiasedTicket(table, rng) {
  const limit = UINT64_RANGE - (UINT64_RANGE % table.total);
  for (let attempts = 1; attempts <= 1024; attempts += 1) {
    const word = rng.next64();
    if (typeof word !== 'bigint' || word < 0n || word >= UINT64_RANGE) throw new Error('RNG_WORD_INVALID');
    if (word < limit) return { ticket: word % table.total, rejectionAttempts: attempts };
  }
  throw new Error('RNG_REJECTION_LIMIT');
}

function makeResult(table, adapterByKey, ticket, mode, rejectionAttempts = 0) {
  const sourceRow = sourceRowAtTicket(table, ticket);
  const adapter = adapterByKey.get(sourceRow.officialSourceRowKey);
  if (!adapter) throw new Error(`RESULT_ADAPTER_ROW_MISSING:${sourceRow.officialSourceRowKey}`);
  return Object.freeze({
    classification: 'LOCAL_NORMAL_SIMULATION_NOT_OFFICIAL_SERVER_RNG',
    pool: 'NORMAL',
    mode,
    normalizationApplied: false,
    sourceRowKey: sourceRow.officialSourceRowKey,
    officialSourceRowKey: sourceRow.officialSourceRowKey,
    officialSourceSheet: sourceRow.officialSourceSheet,
    officialSourceRow: sourceRow.officialSourceRow,
    announcementName: sourceRow.announcementName,
    officialProbabilityPercentRaw: sourceRow.officialProbabilityPercentRaw,
    officialExactFractionRaw: sourceRow.officialExactFractionRaw,
    ticket: ticket.toString(),
    totalTickets: table.total.toString(),
    rejectionAttempts,
    identity: adapter.identity,
    payloadStatus: adapter.payloadStatus,
    unresolvedReason: adapter.unresolvedReason ?? null,
    resultPayload: adapter.resultPayload ?? null,
  });
}

function makeManyResults(table, adapterByKey, rng, count) {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new RangeError('NORMAL_SAMPLE_COUNT_INVALID');
  const results = [];
  for (let index = 0; index < count; index += 1) {
    const selected = unbiasedTicket(table, rng);
    results.push(makeResult(table, adapterByKey, selected.ticket, rng.label, selected.rejectionAttempts));
  }
  const frozenResults = Object.freeze(results);
  return Object.freeze({
    classification: 'WEB_SIMULATION_ONLY',
    pool: 'NORMAL',
    mode: rng.label,
    strategy: 'INDEPENDENT_WITH_REPLACEMENT_NORMAL_ANNOUNCEMENT_WEIGHTED_DRAWS',
    drawCount: count,
    normalizationApplied: false,
    results: frozenResults,
    sourceRowKeys: Object.freeze(frozenResults.map(result => result.sourceRowKey)),
  });
}

export function createNormalLocalSimulator(normalEntries, resultMapRows) {
  if (!Array.isArray(resultMapRows) || resultMapRows.length !== EXPECTED_NORMAL_ROWS) {
    throw new Error('NORMAL_RESULT_MAP_COUNT_MUST_BE_134');
  }
  const table = buildNormalTicketTable(normalEntries);
  const adapterByKey = new Map();
  for (const row of resultMapRows) {
    if (row?.pool !== 'NORMAL' || typeof row.sourceRowKey !== 'string' || adapterByKey.has(row.sourceRowKey)) {
      throw new Error('NORMAL_RESULT_MAP_KEYS_INVALID');
    }
    adapterByKey.set(row.sourceRowKey, row);
  }
  for (const entry of table.rows) {
    if (!adapterByKey.has(entry.officialSourceRowKey)) throw new Error(`NORMAL_RESULT_MAP_ROW_MISSING:${entry.officialSourceRowKey}`);
  }

  return Object.freeze({
    table,
    drawRandom() {
      const rng = createCryptoRng();
      const selected = unbiasedTicket(table, rng);
      return makeResult(table, adapterByKey, selected.ticket, rng.label, selected.rejectionAttempts);
    },
    drawSeeded(seed) {
      const rng = createSeededTestRng(seed);
      const selected = unbiasedTicket(table, rng);
      return makeResult(table, adapterByKey, selected.ticket, rng.label, selected.rejectionAttempts);
    },
    drawRandomMany(count) {
      return makeManyResults(table, adapterByKey, createCryptoRng(), count);
    },
    drawSeededMany(seed, count) {
      return makeManyResults(table, adapterByKey, createSeededTestRng(seed), count);
    },
    resultAtTicket(ticket) {
      return makeResult(table, adapterByKey, ticket, 'DETERMINISTIC_TICKET_TEST_ONLY');
    },
  });
}
