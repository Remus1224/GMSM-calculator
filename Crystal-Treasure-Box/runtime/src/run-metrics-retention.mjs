// Bounded retention is an opt-in Player diagnostic/memory candidate. Engineering
// and default Player paths keep their complete existing history semantics.
export function appendBoundedHistory(history, value, { enabled = false, maxItems = 8 } = {}) {
  history.push(value);
  if (enabled && Number.isInteger(maxItems) && maxItems >= 0 && history.length > maxItems) {
    history.splice(0, history.length - maxItems);
  }
  return history;
}
