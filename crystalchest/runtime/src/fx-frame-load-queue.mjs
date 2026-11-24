// Keep asset verification/decoding away from a burst of simultaneous tasks.
export function createFrameLoadQueue(enabled) {
  let tail = Promise.resolve();
  return function enqueue(task) {
    if (!enabled) return task();
    const result = tail.then(async () => {
      await new Promise(resolve => setTimeout(resolve, 16));
      return task();
    });
    // A failed asset must not prevent the remaining assets from being checked.
    tail = result.catch(() => {});
    return result;
  };
}
