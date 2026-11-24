import { selectMovieCandidate } from './movie-selector-candidate-p5.mjs?r14p9r1=20261107b';

export function resolveMovieForRows({ pool, results, admissionByRowKey, decisionEquivalentByRowKey = null, manualMovie = 'N', mode = 'manual', minEquipLevel = 1 }) {
  if (!['NORMAL', 'FEVER'].includes(pool) || !Array.isArray(results) || !results.length)
    return { status: 'UNRESOLVED_INPUT', reason: 'INVALID_POOL_OR_RESULT_LIST' };
  if (mode !== 'auto') return { status: 'MANUAL_OVERRIDE', movie: manualMovie, movieIndex: ({ N: 0, H: 1, R: 6 })[manualMovie] ?? null };
  const input = results.map(result => {
    const key = result?.sourceRowKey;
    const record = typeof key === 'string' ? admissionByRowKey.get(key) : null;
    if (record?.pool === pool && record.sourceStatus === 'SOURCE_ADMITTED') return {
      sourceStatus: 'SOURCE_ADMITTED', sourceRowKey: key, pool,
      itemType: record.itemType === 'NON_EQUIP' ? 'NON_EQUIP' : record.itemType === 'Equip' ? 'EQUIP' : 'UNKNOWN',
      equipLevel: record.equipLevel, gradeType: record.gradeType, partsType: record.partsType,
      decisionSource: 'P5_EXACT_ITEM_IDENTITY', identity: 'EXACT',
    };
    const equivalent = typeof key === 'string' ? decisionEquivalentByRowKey?.get(key) : null;
    if (equivalent && equivalent.pool === pool && equivalent.sourceRowKey === key && equivalent.identity === 'AMBIGUOUS' && equivalent.movieDecisionEquivalent === true && [0, 2].includes(equivalent.conditionalMovieState)) return {
      sourceStatus: 'MOVIE_DECISION_EQUIVALENT', sourceRowKey: key, pool,
      conditionalMovieState: equivalent.conditionalMovieState,
      decisionSource: 'P6_CONDITIONAL_STATIC_MOVIE_EQUIVALENCE', identity: 'AMBIGUOUS',
    };
    if (!record || record.pool !== pool || record.sourceStatus !== 'SOURCE_ADMITTED')
      return { sourceStatus: 'UNRESOLVED', pool, sourceRowKey: key ?? null, reason: record?.reason ?? 'NO_EXACT_POOL_ROW_ADMISSION' };
    return { sourceStatus: 'UNRESOLVED', pool, sourceRowKey: key ?? null, reason: 'P5_ADMISSION_POOL_MISMATCH' };
  });
  const candidate = selectMovieCandidate(input, { minEquipLevel });
  const exactCount = input.filter(row => row.decisionSource === 'P5_EXACT_ITEM_IDENTITY').length;
  const equivalentCount = input.filter(row => row.decisionSource === 'P6_CONDITIONAL_STATIC_MOVIE_EQUIVALENCE').length;
  return { ...candidate, mode: 'AUTO_CONDITIONAL_WEB_CANDIDATE_DEFINE2128_ON', pool, rowCount: results.length, sourceRowKeys: results.map(r => r?.sourceRowKey ?? null), decisionSourceCounts: { exact: exactCount, equivalent: equivalentCount }, identityAmbiguousSourceRowKeys: input.filter(row => row.identity === 'AMBIGUOUS').map(row => row.sourceRowKey), classification: 'ENGINEERING_FIXTURE_ONLY_DEFINE2128_ON_CONDITIONAL_NOT_NATIVE_ACTIVE_RULE' };
}
