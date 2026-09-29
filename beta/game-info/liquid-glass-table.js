/*
 * V21-P3B — Table Liquid Glass displacement map.
 * Adapted for the existing Game Info table from shuding/liquid-glass.
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
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const TARGET_SELECTOR = '.data-section';
  const MAX_MAP_PIXELS = 240000;
  const MIN_MAP_SIDE = 96;

  let active = null;
  let appObserver = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function smoothStep(edge0, edge1, value) {
    const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function roundedRectSDF(x, y, halfWidth, halfHeight, radius) {
    const qx = Math.abs(x) - halfWidth + radius;
    const qy = Math.abs(y) - halfHeight + radius;
    return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius;
  }

  function makeSvgNode(name) {
    return document.createElementNS(SVG_NS, name);
  }

  class TableLiquidGlass {
    constructor(element) {
      this.element = element;
      this.id = `gi-liquid-${Math.random().toString(36).slice(2, 10)}`;
      this.resizeTimer = 0;
      this.lastWidth = 0;
      this.lastHeight = 0;
      this.createNodes();
      this.resizeObserver = new ResizeObserver(() => this.scheduleUpdate());
      this.resizeObserver.observe(this.element);
      this.update();
    }

    createNodes() {
      this.svg = makeSvgNode('svg');
      this.svg.classList.add('glass-filter-defs');
      this.svg.setAttribute('aria-hidden', 'true');
      this.svg.setAttribute('width', '0');
      this.svg.setAttribute('height', '0');

      const defs = makeSvgNode('defs');
      this.filter = makeSvgNode('filter');
      this.filter.setAttribute('id', `${this.id}-filter`);
      this.filter.setAttribute('filterUnits', 'userSpaceOnUse');
      this.filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
      this.filter.setAttribute('color-interpolation-filters', 'sRGB');

      this.feImage = makeSvgNode('feImage');
      this.feImage.setAttribute('id', `${this.id}-map`);
      this.feImage.setAttribute('x', '0');
      this.feImage.setAttribute('y', '0');
      this.feImage.setAttribute('preserveAspectRatio', 'none');
      this.feImage.setAttribute('result', 'displacementMap');

      this.feDisplacement = makeSvgNode('feDisplacementMap');
      this.feDisplacement.setAttribute('in', 'SourceGraphic');
      this.feDisplacement.setAttribute('in2', 'displacementMap');
      this.feDisplacement.setAttribute('xChannelSelector', 'R');
      this.feDisplacement.setAttribute('yChannelSelector', 'G');

      this.filter.append(this.feImage, this.feDisplacement);
      defs.appendChild(this.filter);
      this.svg.appendChild(defs);
      document.body.appendChild(this.svg);

      this.lens = document.createElement('div');
      this.lens.className = 'gi-liquid-lens';
      this.lens.setAttribute('aria-hidden', 'true');
      this.element.prepend(this.lens);
    }

    scheduleUpdate() {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => this.update(), 90);
    }

    update() {
      if (!this.element.isConnected) return;

      const rect = this.element.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      if (width === this.lastWidth && height === this.lastHeight) return;
      this.lastWidth = width;
      this.lastHeight = height;

      const style = getComputedStyle(this.element);
      const radius = clamp(parseFloat(style.borderTopLeftRadius) || 24, 12, Math.min(width, height) / 2);
      const edgeWidth = clamp(radius * 0.82, 14, 22);
      this.element.style.setProperty('--gi-lens-band', `${Math.round(edgeWidth)}px`);

      const samplingScale = Math.min(1, Math.sqrt(MAX_MAP_PIXELS / (width * height)));
      const mapWidth = Math.max(MIN_MAP_SIDE, Math.round(width * samplingScale));
      const mapHeight = Math.max(MIN_MAP_SIDE, Math.round(height * samplingScale));

      const canvas = document.createElement('canvas');
      canvas.width = mapWidth;
      canvas.height = mapHeight;
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) return;

      const imageData = context.createImageData(mapWidth, mapHeight);
      const data = imageData.data;
      const raw = new Float32Array(mapWidth * mapHeight * 2);
      const halfW = width / 2;
      const halfH = height / 2;
      const epsilon = 0.8;
      const maxRefraction = clamp(edgeWidth * 0.88, 12, 18);
      let maxAbs = 0.001;

      let vectorIndex = 0;
      for (let py = 0; py < mapHeight; py += 1) {
        const y = ((py + 0.5) / mapHeight) * height - halfH;
        for (let px = 0; px < mapWidth; px += 1) {
          const x = ((px + 0.5) / mapWidth) * width - halfW;
          const sdf = roundedRectSDF(x, y, halfW, halfH, radius);
          const insideDistance = -sdf;
          const edgeAmount = 1 - smoothStep(1.5, edgeWidth, insideDistance);
          const shapedEdge = edgeAmount * edgeAmount * (3 - 2 * edgeAmount);

          let dx = 0;
          let dy = 0;
          if (shapedEdge > 0.0001) {
            const gx = roundedRectSDF(x + epsilon, y, halfW, halfH, radius) - roundedRectSDF(x - epsilon, y, halfW, halfH, radius);
            const gy = roundedRectSDF(x, y + epsilon, halfW, halfH, radius) - roundedRectSDF(x, y - epsilon, halfW, halfH, radius);
            const gl = Math.hypot(gx, gy) || 1;
            const nx = gx / gl;
            const ny = gy / gl;

            // Sample inward at the rim. The displacement smoothly falls to zero
            // before the data field, so text and row geometry stay undistorted.
            const shoulder = 0.72 + 0.28 * smoothStep(0, edgeWidth * 0.55, insideDistance);
            const shift = maxRefraction * shapedEdge * shoulder;
            dx = -nx * shift;
            dy = -ny * shift;
          }

          raw[vectorIndex++] = dx;
          raw[vectorIndex++] = dy;
          maxAbs = Math.max(maxAbs, Math.abs(dx), Math.abs(dy));
        }
      }

      let rawIndex = 0;
      for (let i = 0; i < data.length; i += 4) {
        const dx = raw[rawIndex++];
        const dy = raw[rawIndex++];
        data[i] = Math.round(clamp(0.5 + dx / (2 * maxAbs), 0, 1) * 255);
        data[i + 1] = Math.round(clamp(0.5 + dy / (2 * maxAbs), 0, 1) * 255);
        data[i + 2] = 128;
        data[i + 3] = 255;
      }

      context.putImageData(imageData, 0, 0);
      const mapUrl = canvas.toDataURL('image/png');

      this.filter.setAttribute('x', '0');
      this.filter.setAttribute('y', '0');
      this.filter.setAttribute('width', String(width));
      this.filter.setAttribute('height', String(height));
      this.feImage.setAttribute('width', String(width));
      this.feImage.setAttribute('height', String(height));
      this.feImage.setAttribute('href', mapUrl);
      this.feImage.setAttributeNS(XLINK_NS, 'href', mapUrl);
      this.feDisplacement.setAttribute('scale', String(maxAbs * 2));

      const filterValue = `url("#${this.id}-filter") blur(0.35px) contrast(1.12) brightness(1.035) saturate(1.12)`;
      this.lens.style.backdropFilter = filterValue;
      this.lens.style.webkitBackdropFilter = filterValue;
      this.element.classList.add('gi-liquid-ready');
    }

    destroy() {
      window.clearTimeout(this.resizeTimer);
      this.resizeObserver?.disconnect();
      this.lens?.remove();
      this.svg?.remove();
      this.element?.classList.remove('gi-liquid-ready');
    }
  }

  function attach() {
    const target = document.querySelector(TARGET_SELECTOR);
    if (!target) return;
    if (active?.element === target) return;
    active?.destroy();
    active = new TableLiquidGlass(target);
  }

  function start() {
    attach();
    const app = document.getElementById('app');
    if (!app) return;
    appObserver = new MutationObserver(() => {
      if (active && !active.element.isConnected) {
        active.destroy();
        active = null;
      }
      attach();
    });
    appObserver.observe(app, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('pagehide', () => {
    appObserver?.disconnect();
    active?.destroy();
  }, { once: true });
})();
