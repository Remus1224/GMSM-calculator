const MANUAL_MOVIES = new Set(['N', 'H', 'R']);

export function createMovieSelectorP6Pending({ pool, flow, mode, seed = null, runId, results, sampledAt, flowId = null, volume }) {
  if (!['NORMAL', 'FEVER'].includes(pool) || !['single', 'ten'].includes(flow) || !Array.isArray(results) || !results.length)
    throw new Error('MOVIE_P6_PENDING_INVALID_INPUT');
  const expected = flow === 'single' ? 1 : 11;
  if (volume !== expected || results.length !== expected || results.some(row => row?.pool !== pool || typeof row?.sourceRowKey !== 'string'))
    throw new Error('MOVIE_P6_PENDING_RESULT_CONTRACT_INVALID');
  return {
    classification: 'ENGINEERING_SAME_RUN_MANUAL_RESUME_PENDING', pool, flow, mode, seed, runId, flowId,
    volume, sampledAt, results, sourceRowKeys: results.map(row => row.sourceRowKey),
    selectedAtSampling: true, samplerCalls: 1, quotaBefore: pool === 'FEVER' ? 2 : null,
  };
}

export function resumeMovieSelectorP6Manually(pending, movie) {
  if (!pending || pending.classification !== 'ENGINEERING_SAME_RUN_MANUAL_RESUME_PENDING')
    return { status: 'NO_PENDING_ATTEMPT' };
  if (!MANUAL_MOVIES.has(movie)) return { status: 'MANUAL_MOVIE_REQUIRED' };
  const keys = pending.results.map(row => row?.sourceRowKey ?? null);
  if (keys.length !== pending.volume || keys.some((key, index) => key !== pending.sourceRowKeys[index]))
    return { status: 'PENDING_RESULT_MUTATED' };
  return {
    status: 'MANUAL_RESUME', movie, movieIndex: ({ N: 0, H: 1, R: 6 })[movie],
    pool: pending.pool, flow: pending.flow, runId: pending.runId, flowId: pending.flowId,
    mode: pending.mode, seed: pending.seed, volume: pending.volume,
    results: pending.results, sourceRowKeys: [...pending.sourceRowKeys],
    samplerCalls: pending.samplerCalls, quotaBefore: pending.quotaBefore,
    resultReferencePreserved: true,
  };
}
