/* Shared DOM/CSS image export with portable Canvas glass edges.
 * No screen capture, external service, or third-party rasterizer required. */
(() => {
  "use strict";
  function create(options = {}) {
  const WIDTH = options.width || 1120;
  const HEIGHT = options.height || 1480;
  const SCALE = options.scale || 2;
  let busy = false;
  // Draw glass rims and shadows after DOM rasterization: WebKit's SVG image
  // renderer can omit inset shadows or turn outer shadows into rectangular bands.
  function paintGlassEdges(ctx, surfaces, left, top) {
    ctx.save();
    ctx.scale(SCALE, SCALE);
    for (const surface of surfaces) {
      const x = surface.x - left, y = surface.y - top;
      const { width: w, height: h, radius: r } = surface;
      ctx.save();
      if (surface.sharedGlass) {
        // Portable inset light and side-weighted border for the accepted material.
        // Keep the selected zero external shadow in exported images too.
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.clip();
        const glow = ctx.createLinearGradient(x, y, x, y + 8);
        glow.addColorStop(0, surface.innerGlow);
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(x, y, w, 8);
        for (const [offset, color] of [[1.5, surface.innerTop], [-1.5, surface.innerBottom]]) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, offset > 0 ? y : y + h - 4, w, 4);
          ctx.clip();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(x + .5, y + offset, w - 1, h - 1, Math.max(0, r - .5));
          ctx.stroke();
          ctx.restore();
        }
        // Match the CSS top/bottom brightness and the softer left/right rims.
        ctx.save();
        ctx.beginPath();
        ctx.rect(x + r + 1, y, Math.max(0, w - 2 * r - 2), h);
        ctx.clip();
        ctx.strokeStyle = surface.border;
        ctx.beginPath();
        ctx.roundRect(x + .5, y + .5, w - 1, h - 1, Math.max(0, r - .5));
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, r + 1, h);
        ctx.rect(x + w - r - 1, y, r + 1, h);
        ctx.clip();
        ctx.strokeStyle = surface.sideBorder;
        ctx.beginPath();
        ctx.roundRect(x + .5, y + .5, w - 1, h - 1, Math.max(0, r - .5));
        ctx.stroke();
        ctx.restore();
        ctx.restore();
        continue;
      }
      // Only paint the soft shadow outside the rounded surface.
      ctx.beginPath();
      ctx.rect(-WIDTH, -HEIGHT, WIDTH * 3, HEIGHT * 3);
      ctx.roundRect(x, y, w, h, r);
      ctx.clip("evenodd");
      ctx.shadowColor = surface.dark ? "rgba(0,0,0,.25)" : "rgba(35,42,75,.14)";
      ctx.shadowBlur = 8 * SCALE;
      ctx.shadowOffsetY = 4 * SCALE;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
      ctx.restore();

      const edge = ctx.createLinearGradient(x, y, x + w * .55, y + h);
      edge.addColorStop(0, surface.highlight);
      edge.addColorStop(.45, surface.dark ? "rgba(225,239,255,.09)" : "rgba(255,255,255,.24)");
      edge.addColorStop(1, surface.returnEdge);
      ctx.strokeStyle = edge;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x + .5, y + .5, w - 1, h - 1, Math.max(0, r - .5));
      ctx.stroke();
      // A second, softer return produces the thin glass lip seen on the page.
      const lip = ctx.createLinearGradient(x, y, x, y + h);
      lip.addColorStop(0, surface.dark ? "rgba(235,249,255,.12)" : "rgba(255,255,255,.25)");
      lip.addColorStop(.18, "rgba(255,255,255,0)");
      lip.addColorStop(.85, "rgba(255,255,255,0)");
      lip.addColorStop(1, surface.dark ? "rgba(225,239,255,.06)" : "rgba(255,255,255,.14)");
      ctx.strokeStyle = lip;
      ctx.beginPath();
      ctx.roundRect(x + 1.5, y + 1.5, w - 3, h - 3, Math.max(0, r - 1.5));
      ctx.stroke();
    }
    ctx.restore();
  }
  const toast = options.notify || window.GMSMNotify?.show || (() => {});

  async function render(button) {
    // Read the active styles, including the inline visual baseline, in cascade order.
    const css = Array.from(document.styleSheets, sheet =>
      Array.from(sheet.cssRules, rule => rule.cssText).join("\n")
    ).join("\n");
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = `position:fixed;left:-20000px;top:0;width:${WIDTH}px;height:${HEIGHT}px;border:0;pointer-events:none`;
    document.body.append(frame);
    try {
      const doc = frame.contentDocument;
      doc.open();
      doc.write('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
      doc.close();
      for (const attr of document.documentElement.attributes) doc.documentElement.setAttribute(attr.name, attr.value);
      const style = doc.createElement("style");
      style.textContent = css + `\nhtml,body{width:${WIDTH}px!important;min-height:${HEIGHT}px!important} *,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important} ${options.extraCSS || ""}`;
      doc.head.append(style);
      const shell = document.querySelector(options.rootSelector);
      if (!shell || (options.contentSelector && !shell.querySelector(options.contentSelector))) throw new Error("找不到完整表格");
      doc.body.className = document.body.className;
      doc.body.append(doc.importNode(shell, true));
      // SVG images cannot reliably load external image resources. Embed each
      // local material icon once so PNG exports retain the original artwork.
      const embeddedImages = new Map();
      for (const icon of doc.querySelectorAll("img[src]")) {
        const url = new URL(icon.getAttribute("src"), document.baseURI).href;
        if (!embeddedImages.has(url)) {
          const response = await fetch(url, { cache: "force-cache" });
          if (!response.ok) throw new Error("材料圖示載入失敗");
          const blob = await response.blob();
          const data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("材料圖示讀取失敗"));
            reader.readAsDataURL(blob);
          });
          embeddedImages.set(url, data);
        }
        icon.src = embeddedImages.get(url);
        await icon.decode();
      }
      doc.querySelectorAll("[data-export-exclude]").forEach(node => node.remove());
      doc.querySelectorAll("button").forEach(button => { button.disabled = false; });
      await options.prepare?.(doc, { button });
      // Live displacement maps have viewport-dependent geometry. SVG image
      // rendering in WebKit also handles masks/filters differently: use the
      // existing CSS sharp/reflection edges without the displaced masked layer.
      doc.querySelectorAll(".liquid_glass-outer").forEach(layer => layer.remove());
      await doc.fonts.ready;
      const win = frame.contentWindow;
      const surfaces = [...doc.querySelectorAll(options.surfaceSelector || ".glass-surface")].map(node => {
        const rect = node.getBoundingClientRect();
        const computed = win.getComputedStyle(node);
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height,
          radius: parseFloat(computed.borderTopLeftRadius) || 0,
          highlight: computed.getPropertyValue("--glass-highlight").trim(),
          returnEdge: computed.getPropertyValue("--glass-edge-end").trim(),
          dark: doc.documentElement.dataset.theme === "dark",
          sharedGlass: Boolean(computed.getPropertyValue("--accepted-radius").trim()),
          border: computed.getPropertyValue("--crystal-border").trim(),
          sideBorder: computed.getPropertyValue("--crystal-side-border").trim(),
          innerTop: computed.getPropertyValue("--glass-inner-top").trim(),
          innerGlow: computed.getPropertyValue("--glass-inner-glow").trim(),
          innerBottom: computed.getPropertyValue("--glass-inner-bottom").trim() };
      });
      const stableEdges = doc.createElement("style");
      stableEdges.textContent = `${options.surfaceSelector || ".glass-surface"},.liquid_glass-sharp,.liquid_glass-reflect{box-shadow:none!important}`;
      if (surfaces.some(surface => surface.sharedGlass)) {
        stableEdges.textContent += ".liquid_glass-sharp{border:0!important}";
      }
      doc.head.append(stableEdges);
      const bodyStyle = win.getComputedStyle(doc.body);
      const fullHeight = Math.max(HEIGHT, doc.body.scrollHeight);
      // Shared mobile/day and night atmospheres live on a fixed pseudo-element.
      // Freeze that paint into the export body before removing the viewport layer.
      const atmosphereStyle = win.getComputedStyle(doc.body, "::before");
      const background = atmosphereStyle.content !== "none" && atmosphereStyle.backgroundImage !== "none"
        ? atmosphereStyle.backgroundImage : bodyStyle.backgroundImage;
      const base = bodyStyle.backgroundColor;
      const exportAtmosphere = doc.createElement("style");
      exportAtmosphere.textContent = "html body::before{display:none!important;background:none!important}";
      doc.head.append(exportAtmosphere);
      // Prevent HTML canvas background propagation from painting the translucent
      // atmosphere twice inside a foreignObject (particularly visible in Safari).
      doc.documentElement.style.background = base;
      doc.body.style.backgroundColor = base;
      // :root belongs to the outer SVG after serialization. Freeze the resolved
      // page atmosphere so the exported HTML retains its active day/night colors.
      doc.body.style.backgroundImage = background;
      const size = `${WIDTH}px ${fullHeight}px`;
      doc.body.style.backgroundAttachment = "scroll";
      doc.body.style.backgroundSize = size;
      // SVG image rendering does not reliably support backdrop-filter. Re-sample
      // the same CSS atmosphere behind each glass film, retaining CSS edge layers.
      doc.querySelectorAll(".liquid_glass-outer,.liquid_glass-cover").forEach(layer => {
        const rect = layer.getBoundingClientRect();
        const filmStyle = win.getComputedStyle(layer);
        const film = filmStyle.backgroundColor;
        const filmImage = filmStyle.backgroundImage;
        const cover = layer.classList.contains("liquid_glass-cover");
        const hasGradient = cover && filmImage !== "none";
        layer.style.backgroundAttachment = "scroll";
        layer.style.backgroundColor = base;
        layer.style.backgroundImage = cover
          ? `${hasGradient ? filmImage : `linear-gradient(${film},${film})`},${background}` : background;
        const atmosphereCount = background.match(/(?:linear|radial|conic)-gradient\(/g)?.length || 1;
        layer.style.backgroundSize = (cover ? ["100% 100%"] : []).concat(Array(atmosphereCount).fill(size)).join(",");
        layer.style.backgroundPosition = (cover ? ["0 0"] : []).concat(Array(atmosphereCount).fill(`${-rect.left}px ${-rect.top}px`)).join(",");
        layer.style.backdropFilter = "none";
        layer.style.webkitBackdropFilter = "none";
        layer.style.filter = "none";
        layer.style.webkitFilter = "none";
      });
      const crop = options.crop || {};
      const hero = doc.querySelector(crop.startSelector || options.rootSelector).getBoundingClientRect();
      const note = doc.querySelector(crop.endSelector || options.rootSelector).getBoundingClientRect();
      const sides = doc.querySelector(crop.widthSelector || crop.startSelector || options.rootSelector).getBoundingClientRect();
      const top = Math.max(0, Math.floor(hero.top - (crop.topPadding ?? 14)));
      const left = Math.max(0, Math.floor(sides.left - (crop.sidePadding ?? 14)));
      const width = Math.min(WIDTH, Math.ceil(sides.right + (crop.sidePadding ?? 14))) - left;
      const height = Math.ceil(note.bottom + (crop.bottomPadding ?? 18) - top);
      // In an SVG foreignObject, :root points to the SVG rather than the HTML.
      // Preserve resolved theme aliases (text, dividers and glass tokens) on HTML.
      const rootStyle = win.getComputedStyle(doc.documentElement);
      for (const property of Array.from(rootStyle)) {
        if (property.startsWith("--")) doc.documentElement.style.setProperty(property, rootStyle.getPropertyValue(property));
      }
      // Retain the HTML theme selectors and document geometry.
      // The SVG viewport is full size; crop after rasterization.
      doc.documentElement.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      const markup = new XMLSerializer().serializeToString(doc.documentElement);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${fullHeight}"><foreignObject width="100%" height="100%">${markup}</foreignObject></svg>`;
      const image = new Image();
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("圖片繪製逾時，請重試")), 20000);
        image.onload = () => { clearTimeout(timer); resolve(); };
        image.onerror = () => { clearTimeout(timer); reject(new Error("瀏覽器不支援此圖片輸出方式")); };
        image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      });
      const canvas = document.createElement("canvas");
      canvas.width = width * SCALE;
      canvas.height = height * SCALE;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("無法建立圖片畫布");
      context.drawImage(image, left, top, width, height, 0, 0, canvas.width, canvas.height);
      paintGlassEdges(context, surfaces, left, top);
      return await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG 建立失敗")), "image/png"));
    } finally {
      frame.remove();
    }
  }

  async function save(button) {
    if (busy) return;
    const analyticsContext = window.GMSMAnalytics?.captureContext?.();
    busy = true;
    const theme = document.documentElement.dataset.theme === "dark" ? "夜間" : "日間";
    const heading = options.titleSelector ? document.querySelector(options.titleSelector)?.textContent : "";
    const title = button.dataset.exportTitle || heading || options.fallbackTitle || "圖片";
    button.disabled = true;
    try {
      toast("正在依網頁樣式產生完整圖片…");
      const blob = await render(button);
      const filename = button.dataset.exportFilename || title;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}_${theme}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      window.GMSMAnalytics?.exportImage?.(analyticsContext, 'download');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast("完整 PNG 已建立並下載");
    } catch (error) {
      console.error("Shared DOM image export failed", error);
      toast(`圖片建立失敗：${error.message}`);
    } finally {
      busy = false;
      button.disabled = false;
    }
  }

  const onClick = event => {
    const button = event.target.closest?.(options.buttonSelector || "[data-site-export]");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    save(button);
  };
  document.addEventListener("click", onClick, true);
  return Object.freeze({ render, save, destroy() { document.removeEventListener("click", onClick, true); } });
  }
  window.GMSMImageExport = Object.freeze({ create });
})();
