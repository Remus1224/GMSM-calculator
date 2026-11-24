// A16 opt-in helpers for avoiding repeated shop-target work during an unchanged render state.
// These helpers do not alter canvas drawing, animation clocks, or Unity lifecycle.
export function createShopTargetSyncCache(enabled = false) {
  let previousKey = null;
  let hasPrevious = false;
  return Object.freeze({
    shouldUpdate(key) {
      if (!enabled) return true;
      const next = String(key);
      if (hasPrevious && next === previousKey) return false;
      previousKey = next;
      hasPrevious = true;
      return true;
    },
    reset() {
      previousKey = null;
      hasPrevious = false;
    },
  });
}

// Every listed value feeds a Player shop hit-target's visibility, disabled state,
// selected source component, or probability button's openability. Geometry remains
// in the fixed logical stage and CSS percentages follow the same #stage resize.
export function shopTargetStateKey(state) {
  const fields = [
    'route', 'shellEnabled', 'feverMode', 'feverActive', 'normalSingleAvailable',
    'showing', 'movieActive', 'moviePending', 'normalR9StartPending',
    'feverTenStartPending', 'normalLocalTenStartPending', 'normalLocalTenPendingRun',
    'normalLocalSingleResumePending', 'normalLocalTenResumePending', 'normalLocalFlow',
    'luckyOverlayVisible', 'probabilityComponentActive', 'fixtureWidth', 'fixtureHeight',
    'canvasRenderScale', 'canvasWidth', 'canvasHeight',
  ];
  return fields.map(key => {
    const value = state[key];
    if (value === true) return '1';
    if (value === false || value === null || value === undefined) return '0';
    return String(value);
  }).join('|');
}

export function applyShopTargetStateIfChanged(element, state) {
  if (!element || !state) return 0;
  let writes = 0;
  for (const [key, value] of Object.entries(state.style ?? {})) {
    if (element.style[key] !== value) {
      element.style[key] = value;
      writes++;
    }
  }
  for (const key of ['hidden', 'disabled']) {
    if (Object.hasOwn(state, key) && element[key] !== state[key]) {
      element[key] = state[key];
      writes++;
    }
  }
  for (const [key, value] of Object.entries(state.dataset ?? {})) {
    if (element.dataset[key] !== value) {
      element.dataset[key] = value;
      writes++;
    }
  }
  for (const [key, value] of Object.entries(state.attributes ?? {})) {
    if (element.getAttribute(key) !== value) {
      element.setAttribute(key, value);
      writes++;
    }
  }
  return writes;
}

export function shouldPublishFeverBackgroundReceipt({ enabled = false, route = '', feverResult = false } = {}) {
  return !enabled || route !== 'player' || feverResult === true;
}
