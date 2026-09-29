(() => {
  "use strict";

  // V21-P3J — real edge refraction for the large Game Info table.
  // The displacement field is generated from the table's actual geometry.
  // It is inward-only so sampling never reaches outside the glass surface,
  // and it is rebuilt only on first render / resize (never on scroll or mousemove).

  const FILTER_ID = "liquid_edge_refraction";
  const MAP_ID = "liquid_edge_refraction_map";
  const FILTER_SCALE = 24; // feDisplacementMap scale; intentionally far below the old 200.
  const MAX_SHIFT = 9;     // max inward source-sampling shift in CSS pixels.
  const EDGE_BAND = 20;    // distance from the rounded edge over which refraction eases out.
  const MAX_MAP_EDGE = 420; // cap map resolution; smooth vector data scales cleanly.

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

  function ensureFilter() {
    let image = document.getElementById(MAP_ID);
    if (image) return image;

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
    filter.setAttribute("x", "-3%");
    filter.setAttribute("y", "-3%");
    filter.setAttribute("width", "106%");
    filter.setAttribute("height", "106%");
    filter.setAttribute("filterUnits", "objectBoundingBox");
    // Critical for displacement maps: 128 must stay the neutral 0.5 channel value.
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
    displacement.setAttribute("scale", String(FILTER_SCALE));
    displacement.setAttribute("xChannelSelector", "R");
    displacement.setAttribute("yChannelSelector", "G");
    displacement.setAttribute("color-interpolation-filters", "sRGB");

    filter.append(image, displacement);
    defs.append(filter);
    svg.append(defs);
    document.body.append(svg);
    return image;
  }

  function buildMap(section) {
    const rect = section.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const sizeKey = `${Math.round(width)}x${Math.round(height)}`;
    if (sizeKey === lastSizeKey) return;
    lastSizeKey = sizeKey;

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
    const cssRadius = parseFloat(getComputedStyle(section).borderTopLeftRadius) || 0;
    const sx = width / mapWidth;
    const sy = height / mapHeight;
    const epsilon = 0.75;

    for (let py = 0; py < mapHeight; py += 1) {
      const y = (py + 0.5) * sy;
      for (let px = 0; px < mapWidth; px += 1) {
        const x = (px + 0.5) * sx;
        const sdf = roundedRectSdf(x, y, width, height, cssRadius);
        const i = (py * mapWidth + px) * 4;

        // Outside the rounded rectangle stays neutral. The element clips these pixels anyway.
        if (sdf > 0) {
          pixels[i] = 128;
          pixels[i + 1] = 128;
          pixels[i + 2] = 128;
          pixels[i + 3] = 255;
          continue;
        }

        const distanceInside = -sdf;
        const edge = clamp(1 - distanceInside / EDGE_BAND, 0, 1);
        // Smoothstep gives a lens-like transition instead of a hard 5px bend.
        const strength = edge * edge * (3 - 2 * edge);

        if (strength <= 0.0001) {
          pixels[i] = 128;
          pixels[i + 1] = 128;
          pixels[i + 2] = 128;
          pixels[i + 3] = 255;
          continue;
        }

        // SDF gradient points outward. Negating it gives an inward sampling vector.
        const gx = roundedRectSdf(x + epsilon, y, width, height, cssRadius)
          - roundedRectSdf(x - epsilon, y, width, height, cssRadius);
        const gy = roundedRectSdf(x, y + epsilon, width, height, cssRadius)
          - roundedRectSdf(x, y - epsilon, width, height, cssRadius);
        const length = Math.hypot(gx, gy) || 1;
        const inwardX = -gx / length;
        const inwardY = -gy / length;
        const shift = MAX_SHIFT * strength;
        const dx = inwardX * shift;
        const dy = inwardY * shift;

        // feDisplacementMap offset = scale * (channel - 0.5).
        pixels[i] = Math.round(clamp(0.5 + dx / FILTER_SCALE, 0, 1) * 255);
        pixels[i + 1] = Math.round(clamp(0.5 + dy / FILTER_SCALE, 0, 1) * 255);
        pixels[i + 2] = 128;
        pixels[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const image = ensureFilter();
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
