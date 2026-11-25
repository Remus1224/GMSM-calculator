export const P9_P6_SOURCE_SHA256 = '86A00D0448C664CDAFC488517398B9E997B583AC47F1D115D65F22D12DFFE9BC';
export const P9_P5_RUNTIME_SHA256 = 'DA874072A365271D9066E5201340C78D06B7072E187AB56E3903361EE707B5B9';
export const P9_ADAPTER_SHA256 = 'C7960DA6B4DCC54436B4362319E68CA2A57D06E57F06426738451005986A3494';
export const P9_SOURCE_EPOCH = '2.450.5784_d44364c2';

export function validateP9EquivalenceAdapter({ adapter, p5Admission }) {
  if (!adapter || adapter.schema !== 'CrystalChest.MovieSelectorP9.ConditionalDecisionEquivalence.v1'
    || adapter.classification !== 'ENGINEERING_ONLY_CONDITIONAL_STATIC_DECISION_EQUIVALENCE_IDENTITY_UNRESOLVED'
    || adapter.sourceEpoch !== P9_SOURCE_EPOCH || adapter.p6SourceSha256 !== P9_P6_SOURCE_SHA256
    || adapter.p5RuntimeAdmissionSha256 !== P9_P5_RUNTIME_SHA256 || adapter.rowCount !== 23
    || !p5Admission || p5Admission.schema !== 'CrystalChest.MovieSelectorP5.RuntimeAdmission.v1'
    || p5Admission.sourceAdmissionSha256 !== 'AAC2576EDDFA363C3A5F610A3510DC76FE78811588721B6EDB3F7FD3F2E94C50'
    || !Array.isArray(adapter.rows) || adapter.rows.length !== 23 || !Array.isArray(p5Admission.rows) || p5Admission.rows.length !== 268)
    return { ok: false, reason: 'SOURCE_METADATA_OR_COUNT_MISMATCH' };

  const p5Rows = new Map(p5Admission.rows.map(row => [row.sourceRowKey, row]));
  const p5Unresolved = new Set(p5Admission.rows.filter(row => row.sourceStatus !== 'SOURCE_ADMITTED').map(row => row.sourceRowKey));
  const adapterKeys = new Set();
  for (const row of adapter.rows) {
    const source = p5Rows.get(row.sourceRowKey);
    if (!row || !['NORMAL', 'FEVER'].includes(row.pool) || adapterKeys.has(row.sourceRowKey)
      || !source || source.pool !== row.pool || source.sourceStatus === 'SOURCE_ADMITTED'
      || row.identity !== 'AMBIGUOUS' || row.movieDecisionEquivalent !== true
      || ![0, 2].includes(row.conditionalMovieState) || row.candidateCount < 2
      || row.candidateStateCount !== row.candidateCount || row.candidateSetSha256?.length !== 64)
      return { ok: false, reason: 'EQUIVALENCE_ROW_MISMATCH', sourceRowKey: row?.sourceRowKey ?? null };
    adapterKeys.add(row.sourceRowKey);
  }
  if (adapterKeys.size !== 23 || p5Unresolved.size !== 23 || [...p5Unresolved].some(key => !adapterKeys.has(key)))
    return { ok: false, reason: 'P5_P6_UNRESOLVED_KEY_SET_MISMATCH' };
  return { ok: true, sourceEpoch: adapter.sourceEpoch, exactRows: 245, equivalentRows: 23, totalRows: 268 };
}

