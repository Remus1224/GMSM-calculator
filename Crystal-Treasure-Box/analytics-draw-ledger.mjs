// In-memory increments only. IDs and individual result rows never leave the player.
const fields = {
  draw_count: 'draws', normal_draws: 'normalDraws', fever_draws: 'feverDraws',
  fever_triggers: 'feverTriggers', gauge_triggers: 'gaugeTriggers', lucky_triggers: 'luckyTriggers'
};
const items = {
  item_ancient_crystal: 'ancientCrystal', item_mythic_sub: 'mythicSub',
  item_legendary_sub: 'legendarySub', item_chaos: 'chaos', item_ancient: 'ancient',
  item_mythic: 'mythic', item_legendary: 'legendary', item_rare: 'rare',
  item_shards5: 'shards5', item_shards10: 'shards10'
};
const empty = () => Object.fromEntries([...Object.keys(fields), ...Object.keys(items), 'round_count'].map(key => [key, 0]));
function counters(state) {
  const row = {};
  for (const [key, source] of Object.entries(fields)) row[key] = state[source];
  for (const [key, source] of Object.entries(items)) row[key] = state.items?.[source];
  return Object.values(row).every(value => Number.isSafeInteger(value) && value >= 0) ? row : null;
}
export function createDrawLedger() {
  let previous = null, pending = empty(), acceptedRun = false;
  return {
    observe(state, trustedDraw = false) {
      const current = counters(state);
      if (!current) return;
      if (!previous || current.draw_count < previous.draw_count) {
        previous = current; acceptedRun = false; return;
      }
      const delta = Object.fromEntries(Object.keys(current).map(key => [key, current[key] - previous[key]]));
      previous = current;
      if (Object.values(delta).some(value => value < 0)) { acceptedRun = false; return; }
      if (delta.draw_count) {
        acceptedRun = trustedDraw && [1, 11].includes(delta.draw_count) &&
          delta.draw_count === delta.normal_draws + delta.fever_draws &&
          delta.draw_count === Object.keys(items).reduce((sum, key) => sum + delta[key], 0);
      }
      if (!acceptedRun) return;
      for (const key of Object.keys(delta)) pending[key] += delta[key];
      if (delta.draw_count) pending.round_count++;
    },
    take() {
      if (!pending.draw_count && !pending.fever_triggers) return null;
      const batch = pending; pending = empty(); return batch;
    }
  };
}
