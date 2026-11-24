// P7 manual engineering fixture. This gate never reads item/grade/result routing.
export function outlineFixtureEnabled(query) {
  return query.get('r14p30P7') !== '0';
}
export function createOutlineTokenGate() {
  let serial = 0, current = null;
  return {
    issue(run, mask) {
      if (![0, 1, 2, 3].includes(mask)) throw Error('P7_INVALID_MASK');
      current = { run, mask, token: `p7-${++serial}` };
      return { ...current };
    },
    clear() { const token = `p7-${++serial}`; current = null; return token; },
    accepts(run, token, mask) {
      return Boolean(current && current.mask > 0 && current.run === run && current.token === token && current.mask === mask);
    },
    snapshot: () => current && { ...current },
  };
}
