(() => {
  "use strict";

  const CHANNEL = "gmsm-light-sanctum-pray";
  const STATUS_TYPE = "preset-phase1-status";
  const root = document.documentElement;

  function publishStatus() {
    const status = root.dataset.presetPhase1 || "booting";
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ channel: CHANNEL, type: STATUS_TYPE, status }, "*");
      }
    } catch (error) {
      console.warn("Preset local test status bridge failed:", error);
    }
  }

  root.dataset.presetPhase1 = root.dataset.presetPhase1 || "booting";
  publishStatus();

  const observer = new MutationObserver(publishStatus);
  observer.observe(root, { attributes: true, attributeFilter: ["data-preset-phase1"] });

  if (window.location.protocol !== "file:") {
    window.MAPLEM_FILE_LOCAL_FETCH_SHIM = { active: false, reason: "not-file-protocol" };
    return;
  }

  const nativeFetch = typeof window.fetch === "function" ? window.fetch.bind(window) : null;

  function resolveFileUrl(input) {
    const raw = typeof input === "string" ? input : (input && input.url ? input.url : String(input || ""));
    const url = new URL(raw, window.location.href);
    if (url.protocol === "file:") {
      url.search = "";
      url.hash = "";
    }
    return url;
  }

  window.fetch = function localFileFetch(input, init = {}) {
    let url;
    try {
      url = resolveFileUrl(input);
    } catch (error) {
      return Promise.reject(error);
    }

    if (url.protocol !== "file:") {
      if (!nativeFetch) return Promise.reject(new Error("native fetch unavailable"));
      return nativeFetch(input, init);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const method = String(init && init.method || "GET").toUpperCase();
      xhr.open(method, url.href, true);
      xhr.onload = () => {
        const ok = xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300);
        const body = xhr.responseText || "";
        if (!ok) {
          reject(new Error("local file HTTP/XHR status " + xhr.status + " for " + url.href));
          return;
        }
        resolve({
          ok: true,
          status: xhr.status || 200,
          statusText: xhr.statusText || "OK",
          url: url.href,
          text: async () => body,
          json: async () => JSON.parse(body)
        });
      };
      xhr.onerror = () => reject(new Error("local file XHR failed for " + url.href + ". Launch Edge with --allow-file-access-from-files."));
      xhr.send(null);
    });
  };

  window.MAPLEM_FILE_LOCAL_FETCH_SHIM = {
    active: true,
    protocol: "file:",
    transport: "XMLHttpRequest",
    queryStripping: true
  };
})();
