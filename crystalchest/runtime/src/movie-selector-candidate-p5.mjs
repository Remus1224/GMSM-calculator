/**
 * P4 conditional Define-2128-ON selector, reused for a P5 engineering-only
 * fixture. Runtime Define 2128 and live result Item overrides remain unresolved.
 */
export function selectMovieCandidate(items, { minEquipLevel = 1 } = {}) {
  if (!Array.isArray(items)) return { status: 'UNRESOLVED_INPUT' };
  let state = 0; // Saved conditional branch: 0=N, 1=H, 2=R.
  for (const item of items) {
    // P9 engineering-only contribution: this is a movie-state proof for an
    // ambiguous Item identity, never a synthetic Item/Equip record.
    if (item?.sourceStatus === 'MOVIE_DECISION_EQUIVALENT') {
      if (item.identity !== 'AMBIGUOUS' || ![0, 2].includes(item.conditionalMovieState)) {
        if (state === 2) return { status: 'CANDIDATE', movie: 'R', movieIndex: 6, earlyR: true };
        return { status: 'UNRESOLVED_INPUT' };
      }
      // R is the highest-priority conditional result. Resolve immediately so
      // it cannot fall through the end-of-list state==0/N else/H summary.
      if (item.conditionalMovieState === 2) return { status: 'CANDIDATE', movie: 'R', movieIndex: 6 };
      state = Math.max(state, item.conditionalMovieState);
      continue;
    }
    if (!item || item.sourceStatus !== 'SOURCE_ADMITTED') {
      if (state === 2) return { status: 'CANDIDATE', movie: 'R', movieIndex: 6 };
      return { status: 'UNRESOLVED_INPUT' };
    }
    if (item.itemType === 'NON_EQUIP') continue;
    if (item.itemType !== 'EQUIP') return { status: 'UNRESOLVED_INPUT' };
    const { equipLevel, gradeType, partsType } = item;
    if (![equipLevel, gradeType, partsType].every(Number.isInteger)) {
      if (state === 2) return { status: 'CANDIDATE', movie: 'R', movieIndex: 6 };
      return { status: 'UNRESOLVED_INPUT' };
    }
    if (equipLevel < minEquipLevel) continue;
    if (partsType === 40) {
      if (gradeType > 5) return { status: 'CANDIDATE', movie: 'R', movieIndex: 6 };
      if (gradeType === 5) state = 1;
    } else {
      if (gradeType > 6) return { status: 'CANDIDATE', movie: 'R', movieIndex: 6 };
      if (gradeType === 6) state = 1;
    }
  }
  if (state === 0) return { status: 'CANDIDATE', movie: 'N', movieIndex: 0 };
  return { status: 'CANDIDATE', movie: 'H', movieIndex: 1 };
}
