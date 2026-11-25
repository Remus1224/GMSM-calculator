export function createFlipAllBatch(cards, startedAt) {
  const pendingSlots = [];
  const preopenedSlots = [];
  for (let index = 0; index < cards.length; index++) {
    if (cards[index]?.openAt === null) pendingSlots.push(index);
    else preopenedSlots.push(index);
  }
  return {
    pendingSlots,
    preopenedSlots,
    skippedSlots: [],
    issuedSlots: [],
    cursor: 0,
    startedAt,
    lastFlipCompleteAt: null,
    endAt: null,
  };
}

export function advanceFlipAllBatch(batch, cards, now, perCardWaitMs) {
  const skippedSlots = [];
  while (batch.cursor < batch.pendingSlots.length) {
    const index = batch.pendingSlots[batch.cursor];
    if (cards[index]?.openAt === null) break;
    skippedSlots.push(index);
    batch.skippedSlots.push(index);
    batch.cursor++;
  }

  let due = null;
  if (batch.cursor < batch.pendingSlots.length) {
    const cursor = batch.cursor;
    const scheduledAt = batch.startedAt + cursor * perCardWaitMs;
    if (now >= scheduledAt) {
      due = { index: batch.pendingSlots[cursor], scheduledAt };
      batch.cursor++;
    }
  }
  return { skippedSlots, due, finished: batch.cursor >= batch.pendingSlots.length };
}

export function finishFlipAllBatch(batch, cards, now, flipMs, postLoopWaitMs) {
  if (batch.cursor < batch.pendingSlots.length) return false;
  if (batch.endAt === null) {
    const flipCompletions = cards
      .filter(card => card?.openAt !== null)
      .map(card => card.openAt + flipMs);
    batch.lastFlipCompleteAt = flipCompletions.length
      ? Math.max(...flipCompletions)
      : batch.startedAt;
    batch.endAt = batch.lastFlipCompleteAt + postLoopWaitMs;
  }
  return now >= batch.endAt;
}
