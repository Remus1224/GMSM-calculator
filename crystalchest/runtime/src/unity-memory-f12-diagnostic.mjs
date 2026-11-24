// On-demand diagnostic only. Callers must invoke this from an explicit F12 action.
// Never stores or returns an Unity handle; only sanitized primitive metrics escape.
export function readUnityMemoryInfo({
  enabled = false,
  runtime,
  instance = null,
  ready = false,
  loading = false,
  disposed = false,
  runtimeError = null,
  getterName,
  notCreatedStatus = 'NOT_CREATED'
}) {
  const result = {
    runtime,
    enabled: Boolean(enabled),
    available: false,
    ready: Boolean(ready),
    loading: Boolean(loading),
    disposed: Boolean(disposed),
    totalWASMHeapSize: null,
    usedWASMHeapSize: null,
    status: 'UNKNOWN',
    error: runtimeError == null ? null : String(runtimeError).slice(0, 160)
  };

  if (!enabled) { result.status = 'DIAGNOSTIC_DISABLED'; return result; }
  if (disposed) { result.status = 'RUNTIME_STOPPED'; return result; }
  if (!instance) { result.status = loading ? 'LOADING_NO_INSTANCE' : notCreatedStatus; return result; }
  if (!ready) { result.status = loading ? 'LOADING_NOT_READY' : 'NOT_READY'; return result; }

  let getter;
  try { getter = instance[getterName]; }
  catch (error) { result.status = 'GETTER_LOOKUP_ERROR'; result.error = String(error?.message ?? error).slice(0, 160); return result; }
  if (typeof getter !== 'function') { result.status = 'GETTER_UNAVAILABLE'; return result; }

  try {
    const metrics = getter.call(instance);
    const total = metrics?.totalWASMHeapSize;
    const used = metrics?.usedWASMHeapSize;
    if (typeof total !== 'number' || !Number.isFinite(total) || total < 0 ||
        typeof used !== 'number' || !Number.isFinite(used) || used < 0 || used > total) {
      result.status = 'METRICS_INVALID';
      return result;
    }
    result.available = true;
    result.totalWASMHeapSize = total;
    result.usedWASMHeapSize = used;
    result.status = 'OK';
    return result;
  } catch (error) {
    result.status = 'GETTER_ERROR';
    result.error = String(error?.message ?? error).slice(0, 160);
    return result;
  }
}
