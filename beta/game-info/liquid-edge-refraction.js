/*
 * Game Info V21-P4C — safe per-surface self-refraction maps.
 * Optical approach adapted from ideas demonstrated by shuding/liquid-glass.
 * Original project: https://github.com/shuding/liquid-glass
 *
 * MIT License
 * Copyright (c) 2025 Shu Ding
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(() => {
  "use strict";

  // P4C keeps the accepted P3Q displacement math unchanged, but gives every
  // glass surface its own SVG filter/map so Hero, Table and Note can share the
  // same optical material without reusing a table-shaped displacement map.

  const FILTER_BASE = "liquid_edge_refraction";
  const MAP_BASE = "liquid_edge_refraction_map";
  const FILTER_SCALE = 200;
  const MAX_SHIFT = 11;
  const EDGE_BAND = 14;
  const MAX_MAP_EDGE = 480;

  const states = new Map();
  let nextId = 0;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function roundedRectSdf(x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width * 0.5, height * 0.5));
    const qx = Math.abs(x - width * 0.5) - (width * 0.5 - r);
    const qy = Math.abs(y - height * 0.5) - (height * 0.5 - r);
    const ox = Math.max(qx, 0);
    const oy = Math.max(qy, 0);
    return Math.min(Math.max(qx, qy), 0) + Math.hypot(ox, oy) - r;
  }

  function createFilter(filterId, mapId) {
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
    filter.setAttribute("id", filterId);
    filter.setAttribute("x", "-12%");
    filter.setAttribute("y", "-12%");
    filter.setAttribute("width", "124%");
    filter.setAttribute("height", "124%");
    filter.setAttribute("filterUnits", "objectBoundingBox");
    filter.setAttribute("color-interpolation-filters", "sRGB");

    const image = document.createElementNS(ns, "feImage");
    image.setAttribute("id", mapId);
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

  function ensureState(surface) {
    if (states.has(surface)) return states.get(surface);

    const outer = surface.querySelector(":scope > .liquid_glass-outer");
    if (!outer) return null;

    const id = nextId++;
    const filterId = id === 0 ? FILTER_BASE : `${FILTER_BASE}_${id}`;
    const mapId = id === 0 ? MAP_BASE : `${MAP_BASE}_${id}`;
    const image = createFilter(filterId, mapId);
    const state = {
      filterId,
      image,
      outer,
      lastSizeKey: "",
      pendingFrame: 0
    };

    outer.style.filter = `url(#${filterId})`;
    outer.style.webkitFilter = `url(#${filterId})`;
    states.set(surface, state);
    resizeObserver.observe(surface);
    scheduleBuild(surface);
    return state;
  }

  function buildMap(surface) {
    const state = states.get(surface);
    if (!state || !surface.isConnected) return;

    const rect = surface.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const cssRadius = parseFloat(getComputedStyle(surface).borderTopLeftRadius) || 0;
    const sizeKey = `${Math.round(width)}x${Math.round(height)}@${cssRadius.toFixed(1)}`;
    if (sizeKey === state.lastSizeKey) return;
    state.lastSizeKey = sizeKey;

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
        const edge = clamp(1 - distanceInside / EDGE_BAND, 0, 1);
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
        const shift = MAX_SHIFT * strength;
        const dx = inwardX * shift;
        const dy = inwardY * shift;

        pixels[i] = Math.round(clamp(0.5 + dx / FILTER_SCALE, 0, 1) * 255);
        pixels[i + 1] = Math.round(clamp(0.5 + dy / FILTER_SCALE, 0, 1) * 255);
        pixels[i + 2] = 128;
        pixels[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const url = canvas.toDataURL("image/png");
    state.image.setAttribute("href", url);
    state.image.setAttributeNS("http://www.w3.org/1999/xlink", "href", url);
  }

  function scheduleBuild(surface) {
    const state = states.get(surface);
    if (!state) return;
    cancelAnimationFrame(state.pendingFrame);
    state.pendingFrame = requestAnimationFrame(() => buildMap(surface));
  }

  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) scheduleBuild(entry.target);
  });

  function attachAll() {
    document.querySelectorAll("[data-liquid-refraction]").forEach(surface => ensureState(surface));

    for (const [surface] of states) {
      if (!surface.isConnected) {
        resizeObserver.unobserve(surface);
        states.delete(surface);
      }
    }
  }

  const app = document.getElementById("app");
  if (app) {
    const observer = new MutationObserver(attachAll);
    observer.observe(app, { childList: true, subtree: true });
  }

  attachAll();
})();
