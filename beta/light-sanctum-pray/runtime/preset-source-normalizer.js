(() => {
  "use strict";

  const nativeFetch = typeof window.fetch === "function" ? window.fetch.bind(window) : null;
  if (!nativeFetch) return;

  window.fetch = async function maplemPresetNormalizedFetch(input, init) {
    const response = await nativeFetch(input, init);
    let url = "";
    try {
      url = typeof input === "string" ? new URL(input, window.location.href).href : String(input && input.url || "");
    } catch {
      url = String(input || "");
    }

    if (!/\/player-presentation\.js(?:[?#]|$)/i.test(url)) return response;

    const raw = await response.text();
    const crlfCount = (raw.match(/\r\n/g) || []).length;
    const loneCrCount = (raw.match(/\r(?!\n)/g) || []).length;
    const normalized = raw.replace(/\r\n?/g, "\n");

    window.MAPLEM_PRESET_SOURCE_NORMALIZER = {
      active: true,
      url,
      crlfCount,
      loneCrCount,
      changed: normalized !== raw,
      rawLength: raw.length,
      normalizedLength: normalized.length
    };

    return new Response(normalized, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  };
})();
