(() => {
  "use strict";

  // V21-P3K — size-aware optical calibration for Game Info liquid glass.
  // The displacement field still samples inward only, but its visible rim,
  // transition depth, refraction strength and reflection thickness now scale
  // from the actual component geometry instead of assuming one fixed table size.

  const FILTER_ID = "liquid_edge_refraction";
  const MAP_ID = "liquid_edge_refraction_map";
  const MAX_MAP_EDGE = 480;

  let observedSection = null;
  let resizeObserver = null;
  let pendingFrame = 0;
  let lastSizeKey = "";

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function roundedRectSdf(x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width * 0.5, height * 0.5));
    const qx = Math.abs(x - width * 0.5) - (width * 0.5 - r);
    const qy = Math.abs(y - height * 0.5) - (height * 0.5 - r);
    const ox = Math.max(qx, 0);
    const oy = Math.max(qy, 0);
    return Math.min(Math.max(qx, qy), 0) + Math.hypot(ox, oy) - r;
  }

  function opticalMetrics(width, height) {
    // Scale from the shorter edge so wide/short and narrow/tall tables both keep
    // similar perceived glass thickness. Clamps prevent tiny cards becoming too
    // heavy and large desktop tables from developing an oversized white rim.
    const shortEdge = Math.max(1, Math.min(width, height));
    const rim = clamp(shortEdge * 0.0175, 5, 11.5);
    const edgeBand = clamp(rim * 3.0, 18, 34);
    const maxShift = clamp(rim * 0.92, 5, 10.5);
    const filterScale = clamp(maxShift * 2.7, 24, 30);

    return {
      rim,
      edgeBand,
      maxShift,
      filterScale,
      reflectInset: clamp(rim * 0.12, 1, 1.6),
      reflectBlur: clamp(rim * 0.82, 6, 10),
      reflectSpread: clamp(rim * 0.27, 2, 3.2),
      returnBlur: clamp(rim * 0.58, 4, 7),
      returnSpread: clamp(rim * 0.13, 1, 1.6),
      innerGlintInset: clamp(rim * 0.30, 2, 4),
      fresnelWidth: clamp(rim * 0.68, 4, 8)
    };
  }

  function applyOpticalCssVars(section, metrics) {
    section.style.setProperty("--glass-rim", `${metrics.rim.toFixed(2)}px`);
    section.style.setProperty("--glass-reflect-inset", `${metrics.reflectInset.toFixed(2)}px`);
    section.style.setProperty("--glass-reflect-blur", `${metrics.reflectBlur.toFixed(2)}px`);
    section.style.setProperty("--glass-reflect-spread", `${metrics.reflectSpread.toFixed(2)}px`);
    section.style.setProperty("--glass-return-blur", `${metrics.returnBlur.toFixed(2)}px`);
    section.style.setProperty("--glass-return-spread", `${(-metrics.returnSpread).toFixed(2)}px`);
    section.style.setProperty("--glass-inner-glint-inset", `${metrics.innerGlintInset.toFixed(2)}px`);
    section.style.setProperty("--glass-fresnel-width", `${metrics.fresnelWidth.toFixed(2)}px`);
  }

  function ensureFilter() {
    let image = document.getElementById(MAP_ID);
    const existingFilter = document.getElementById(FILTER_ID);
    if (image && existingFilter) {
      return { image, displacement: existingFilter.querySelector("feDisplacementMap") };
    }

    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    svg.style.overflow = "hidden";

    const defs = document.createElementNS(ns, "defs");
    const filter = document.createElementNS(ns, "filter");
    filter.setAttribute("id", FILTER_ID);
    filter.setAttribute("x", "-4%");
    filter.setAttribute("y", "-4%");
    filter.setAttribute("width", "108%");
    filter.setAttribute("height", "108%");
    filter.setAttribute("filterUnits", "objectBoundingBox");
    filter.setAttribute("color-interpolation-filters", "sRGB");

    image = document.createElementNS(ns, "feImage");
    image.setAttribute("id", MAP_ID);
    image.setAttribute("x", "0%");
    image.setAttribute("y", "0%");
    image.setAttribute("width", "100%");
    image.setAttribute("height", "100%");
    image.setAttribute("preserveAspectRatio", "none");
    image.setAttribute("result", "edgeMap");

    const displacement = document.createElementNS(ns, "feDisplacementMap");
    displacement.setAttribute("in", "SourceGraphic");
    displacement.setAttribute("in2", "edgeMap");
    displacement.setAttribute("scale", "24");
    displacement.setAttribute("xChannelSelector", "R");
    displacement.setAttribute("yChannelSelector", "G");
    displacement.setAttribute("color-interpolation-filters", "sRGB");

    filter.append(image, displacement);
    defs.append(filter);
    svg.append(defs);
    document.body.append(svg);
    return { image, displacement };
  }

  function buildMap(section) {
    const rect = section.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const cssRadius = parseFloat(getComputedStyle(section).borderTopLeftRadius) || 0;
    const metrics = opticalMetrics(width, height);
    const sizeKey = `${Math.round(width)}x${Math.round(height)}@${cssRadius.toFixed(1)}:${metrics.rim.toFixed(1)}`;
    if (sizeKey === lastSizeKey) return;
    lastSizeKey = sizeKey;

    applyOpticalCssVars(section, metrics);

    const scale = Math.min(1, MAX_MAP_EDGE / Math.max(width, height));
    const mapWidth = Math.max(48, Math.round(width * scale));
    const mapHeight = Math.max(48, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: false });
    if (!ctx) return;

    const imageData = ctx.createImageData(mapWidth, mapHeight);
    const pixels = imageData.data;
    const sx = width / mapWidth;
    const sy = height / mapHeight;
    const epsilon = 0.75;

    for (let py = 0; py < mapHeight; py += 1) {
      const y = (py + 0.5) * sy;
      for (let px = 0; px < mapWidth; px += 1) {
        const x = (px + 0.5) * sx;
        const sdf = roundedRectSdf(x, y, width, height, cssRadius);
        const i = (py * mapWidth + px) * 4;

        if (sdf > 0) {
          pixels[i] = 128;
          pixels[i + 1] = 128;
          pixels[i + 2] = 128;
          pixels[i + 3] = 255;
          continue;
        }

        const distanceInside = -sdf;
        const edge = clamp(1 - distanceInside / metrics.edgeBand, 0, 1);
        const strength = edge * edge * (3 - 2 * edge);

        if (strength <= 0.0001) {
          pixels[i] = 128;
          pixels[i + 1] = 128;
          pixels[i + 2] = 128;
          pixels[i + 3] = 255;
          continue;
        }

        const gx = roundedRectSdf(x + epsilon, y, width, height, cssRadius)
          - roundedRectSdf(x - epsilon, y, width, height, cssRadius);
        const gy = roundedRectSdf(x, y + epsilon, width, height, cssRadius)
          - roundedRectSdf(x, y - epsilon, width, height, cssRadius);
        const length = Math.hypot(gx, gy) || 1;
        const inwardX = -gx / length;
        const inwardY = -gy / length;
        const shift = metrics.maxShift * strength;
        const dx = inwardX * shift;
        const dy = inwardY * shift;

        pixels[i] = Math.round(clamp(0.5 + dx / metrics.filterScale, 0, 1) * 255);
        pixels[i + 1] = Math.round(clamp(0.5 + dy / metrics.filterScale, 0, 1) * 255);
        pixels[i + 2] = 128;
        pixels[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const { image, displacement } = ensureFilter();
    displacement?.setAttribute("scale", metrics.filterScale.toFixed(2));
    const url = canvas.toDataURL("image/png");
    image.setAttribute("href", url);
    image.setAttributeNS("http://www.w3.org/1999/xlink", "href", url);
    section.classList.add("has-real-edge-refraction");
  }

  function scheduleBuild(section) {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(() => buildMap(section));
  }

  function attach(section) {
    if (!section || section === observedSection) return;
    observedSection = section;
    lastSizeKey = "";
    if (resizeObserver) resizeObserver.disconnect();
    resizeObserver = new ResizeObserver(() => scheduleBuild(section));
    resizeObserver.observe(section);
    scheduleBuild(section);
  }

  function findTable() {
    const section = document.querySelector(".data-section");
    if (section) attach(section);
  }

  const app = document.getElementById("app");
  if (app) {
    const observer = new MutationObserver(findTable);
    observer.observe(app, { childList: true, subtree: true });
  }
  findTable();
})();
