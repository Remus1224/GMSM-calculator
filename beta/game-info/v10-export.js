(() => {
  "use strict";

  // V11 keeps the V10 export architecture: current CSS tokens + live DOM table remain
  // the single presentation/data truth. This file name is retained to avoid another
  // historical override layer during Beta.
  const root = document.documentElement;

  const token = (name, fallback) => {
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    return value || fallback;
  };
  const numberToken = (name, fallback) => {
    const value = Number.parseFloat(token(name, String(fallback)));
    return Number.isFinite(value) ? value : fallback;
  };
  const darkMode = () => root.getAttribute("data-theme") === "dark";
  const transparentTail = () => darkMode() ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)";

  const loadImage = src => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("V11 表格材質載入失敗"));
    image.src = src;
  });

  const roundRect = (ctx, x, y, w, h, r) => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

  const drawText = (ctx, text, x, y, options = {}) => {
    ctx.save();
    ctx.font = options.font || '600 24px -apple-system,"PingFang TC",sans-serif';
    ctx.fillStyle = options.color || token("--text", "#222735");
    ctx.textAlign = options.align || "left";
    ctx.textBaseline = "middle";
    ctx.fillText(String(text), x, y);
    ctx.restore();
  };

  const showToast = message => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.setTimeout(() => { toast.hidden = true; }, 2600);
  };

  function collectLiveTable() {
    const header = [...document.querySelectorAll(".data-header > div")].map(node => node.textContent.trim());
    const rows = [...document.querySelectorAll(".data-row")].map(row => ({
      values: [...row.querySelectorAll(".data-cell")].map(cell => cell.textContent.trim()),
      hasUnlock: Boolean(row.querySelector(".unlock-mark"))
    }));
    if (header.length !== 5 || !rows.length || rows.some(row => row.values.length !== 5)) {
      throw new Error("找不到目前畫面的五欄資料表");
    }
    return { header, rows };
  }

  function collectLiveMeta() {
    return {
      siteTitle: document.querySelector(".site-title")?.textContent.trim() || "楓之谷M 也許有用的工具",
      title: document.querySelector(".hero-compact h2")?.textContent.trim() || "光之聖所祈禱經驗表",
      subtitle: document.querySelector(".hero-compact p")?.textContent.trim() || "",
      theme: darkMode() ? "dark" : "light"
    };
  }

  function paintAtmosphere(ctx, width, height) {
    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, token("--v10-page-start", "#dff8ff"));
    background.addColorStop(.46, token("--v10-page-mid", "#eef2ff"));
    background.addColorStop(1, token("--v10-page-end", "#ffe9fa"));
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    // Match the low-frequency V9/V11 live atmosphere geometry rather than a uniform wash.
    const glows = [
      [width * .05, height * .08, width * .40, token("--v10-atmos-cyan", "rgba(76,214,255,.36)")],
      [width * .94, height * .16, width * .36, token("--v10-atmos-violet", "rgba(220,147,255,.27)")],
      [width * .52, height * .72, width * .42, token("--v10-atmos-pink", "rgba(255,182,227,.18)")]
    ];
    glows.forEach(([x, y, r, color]) => {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, color);
      glow.addColorStop(1, transparentTail());
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    });

    const veil = ctx.createLinearGradient(0, 0, 0, height);
    veil.addColorStop(0, token("--v10-veil-top", "rgba(255,255,255,.17)"));
    veil.addColorStop(.40, token("--v10-veil-mid", "rgba(255,255,255,.03)"));
    veil.addColorStop(1, token("--v10-veil-bottom", "rgba(255,255,255,.10)"));
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, width, height);
  }

  function drawGlassPanel(ctx, x, y, w, h, radius) {
    ctx.save();
    roundRect(ctx, x, y, w, h, radius);
    ctx.clip();

    const fill = ctx.createLinearGradient(x, y, x + w, y + h);
    fill.addColorStop(0, token("--v10-panel-fill-a", "rgba(255,255,255,.25)"));
    fill.addColorStop(.48, token("--v10-panel-fill-b", "rgba(255,255,255,.09)"));
    fill.addColorStop(1, token("--v10-panel-fill-c", "rgba(255,255,255,.18)"));
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    const border = ctx.createLinearGradient(x, y, x + w, y + h);
    border.addColorStop(0, token("--v10-panel-border-a", "rgba(255,255,255,.88)"));
    border.addColorStop(.30, token("--v10-panel-border-cyan", "rgba(202,238,255,.36)"));
    border.addColorStop(.58, token("--v10-panel-border-violet", "rgba(230,205,255,.22)"));
    border.addColorStop(.78, token("--v10-panel-border-pink", "rgba(242,193,255,.32)"));
    border.addColorStop(1, token("--v10-panel-border-z", "rgba(255,255,255,.72)"));
    ctx.save();
    roundRect(ctx, x, y, w, h, radius);
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawUnlockMarker(ctx, x, y) {
    const w = 11;
    const h = 2;
    ctx.save();
    roundRect(ctx, x, y - h / 2, w, h, h / 2);
    const gradient = ctx.createLinearGradient(x, y, x + w, y);
    gradient.addColorStop(0, transparentTail());
    gradient.addColorStop(.22, token("--v10-marker-cyan", "#68d9e9"));
    gradient.addColorStop(.56, token("--v10-marker-violet", "#8c91d3"));
    gradient.addColorStop(.78, token("--v10-marker-pink", "#dda7ca"));
    gradient.addColorStop(1, transparentTail());
    ctx.globalAlpha = darkMode() ? .56 : .72;
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.globalAlpha = darkMode() ? .20 : .34;
    ctx.strokeStyle = token("--v10-marker-edge", "rgba(255,255,255,.72)");
    ctx.lineWidth = .65;
    ctx.beginPath();
    ctx.moveTo(x + 2, y - .45);
    ctx.lineTo(x + w - 2, y - .45);
    ctx.stroke();
    ctx.restore();
  }

  async function buildCanvas(meta, table, data) {
    const width = 1440;
    const margin = 70;
    const heroH = 205;
    const colHeadH = 64;
    const rowH = 66;
    const footerH = 105;
    const height = margin + heroH + 20 + colHeadH + table.rows.length * rowH + footerH + margin;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("瀏覽器無法建立 Canvas");

    paintAtmosphere(ctx, width, height);

    drawGlassPanel(ctx, margin, margin, width - margin * 2, heroH, 34);
    drawText(ctx, meta.siteTitle, margin + 38, margin + 40, {
      font: '700 22px -apple-system,"PingFang TC",sans-serif',
      color: token("--muted", darkMode() ? "#9aa9b8" : "#697080")
    });
    drawText(ctx, meta.title, margin + 38, margin + 96, {
      font: '800 48px -apple-system,"PingFang TC",sans-serif',
      color: token("--strong", darkMode() ? "#f4f7fb" : "#202532")
    });
    drawText(ctx, meta.subtitle, margin + 38, margin + 145, {
      font: '600 21px -apple-system,"PingFang TC",sans-serif',
      color: token("--muted", darkMode() ? "#9aa9b8" : "#727887")
    });

    const tableX = margin;
    const tableW = width - margin * 2;
    const tableY = margin + heroH + 20;
    const tableH = colHeadH + table.rows.length * rowH;

    ctx.save();
    roundRect(ctx, tableX, tableY, tableW, tableH, 30);
    ctx.clip();

    // Live CSS uses a diagonal multi-stop fill; reproduce it from the same token set.
    const tableFill = ctx.createLinearGradient(tableX, tableY, tableX + tableW, tableY + tableH);
    tableFill.addColorStop(0, token("--v10-table-fill-a", "rgba(255,255,255,.18)"));
    tableFill.addColorStop(.40, token("--v10-table-fill-b", "rgba(255,255,255,.055)"));
    tableFill.addColorStop(.73, token("--v10-table-fill-c", "rgba(255,255,255,.11)"));
    tableFill.addColorStop(1, token("--v10-table-fill-d", "rgba(255,255,255,.16)"));
    ctx.fillStyle = tableFill;
    ctx.fillRect(tableX, tableY, tableW, tableH);

    try {
      const optical = await loadImage("table-glass-v8.svg?v=20260927-v11");
      const requestedBlend = token("--v10-table-optical-blend", "screen");
      ctx.globalCompositeOperation = requestedBlend === "soft-light" ? "soft-light" : "screen";
      ctx.globalAlpha = numberToken("--v10-table-optical-opacity", darkMode() ? .25 : .74);

      // V11 dark crops the broad lower SVG bands by enlarging vertically and top-aligning.
      // This keeps the same optical asset while removing the V10 lower-right block source.
      const scaleX = 1.04;
      const scaleY = darkMode() ? 1.24 : 1.04;
      const opticalX = tableX - tableW * (scaleX - 1) / 2;
      const opticalY = darkMode() ? tableY : tableY - tableH * (scaleY - 1) / 2;
      ctx.drawImage(optical, opticalX, opticalY, tableW * scaleX, tableH * scaleY);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    } catch (_) {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    const specular = ctx.createLinearGradient(tableX, tableY, tableX + tableW, tableY + tableH * .38);
    specular.addColorStop(0, token("--v10-spec-strong", "rgba(255,255,255,.60)"));
    specular.addColorStop(.14, token("--v10-spec-soft", "rgba(255,255,255,.16)"));
    specular.addColorStop(.31, "rgba(255,255,255,0)");
    specular.addColorStop(.67, "rgba(255,255,255,0)");
    specular.addColorStop(.86, token("--v10-spec-tail", "rgba(255,255,255,.08)"));
    specular.addColorStop(1, token("--v10-spec-end", "rgba(255,255,255,.30)"));
    ctx.globalAlpha = numberToken("--v10-table-specular-opacity", darkMode() ? .32 : .76);
    ctx.fillStyle = specular;
    ctx.fillRect(tableX, tableY, tableW, tableH);

    const chroma = ctx.createLinearGradient(tableX, tableY, tableX + tableW, tableY);
    chroma.addColorStop(0, token("--v10-chroma-cyan", "rgba(72,217,255,.060)"));
    chroma.addColorStop(.24, "rgba(255,255,255,0)");
    chroma.addColorStop(.77, "rgba(255,255,255,0)");
    chroma.addColorStop(1, token("--v10-chroma-pink", "rgba(255,139,226,.052)"));
    ctx.fillStyle = chroma;
    ctx.fillRect(tableX, tableY, tableW, tableH);
    ctx.globalAlpha = 1;

    ctx.fillStyle = token("--v10-header-fill", "rgba(255,255,255,.055)");
    ctx.fillRect(tableX, tableY, tableW, colHeadH);
    ctx.restore();

    const border = ctx.createLinearGradient(tableX, tableY, tableX + tableW, tableY + tableH);
    border.addColorStop(0, token("--v10-table-border-a", "rgba(255,255,255,.98)"));
    border.addColorStop(.18, token("--v10-table-border-cyan", "rgba(192,239,255,.70)"));
    border.addColorStop(.42, token("--v10-table-border-violet", "rgba(255,255,255,.22)"));
    border.addColorStop(.72, token("--v10-table-border-pink", "rgba(239,184,255,.55)"));
    border.addColorStop(1, token("--v10-table-border-z", "rgba(255,255,255,.88)"));
    ctx.save();
    roundRect(ctx, tableX, tableY, tableW, tableH, 30);
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const cols = [120, 260, 240, 240, tableW - 860];
    let x = tableX;
    table.header.forEach((label, index) => {
      drawText(ctx, label, x + cols[index] / 2, tableY + colHeadH / 2, {
        font: '800 17px -apple-system,"PingFang TC",sans-serif',
        color: token("--strong", darkMode() ? "#f4f7fb" : "#303744"),
        align: "center"
      });
      x += cols[index];
    });

    ctx.strokeStyle = token("--v10-row-line", darkMode() ? "rgba(185,205,225,.082)" : "rgba(76,91,123,.095)");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tableX + 16, tableY + colHeadH);
    ctx.lineTo(tableX + tableW - 16, tableY + colHeadH);
    ctx.stroke();

    let y = tableY + colHeadH;
    table.rows.forEach((row, rowIndex) => {
      if (rowIndex) {
        ctx.strokeStyle = token("--v10-row-line", darkMode() ? "rgba(185,205,225,.082)" : "rgba(76,91,123,.095)");
        ctx.beginPath();
        ctx.moveTo(tableX + 16, y);
        ctx.lineTo(tableX + tableW - 16, y);
        ctx.stroke();
      }

      x = tableX;
      row.values.forEach((value, index) => {
        const font = `${index === 0 ? 750 : index === 4 ? 560 : 620} ${index === 4 ? 14 : 18}px -apple-system,"PingFang TC",sans-serif`;
        const color = index === 4
          ? token("--muted", darkMode() ? "#9aa9b8" : "#697180")
          : index === 0
            ? token("--strong", darkMode() ? "#f4f7fb" : "#252a36")
            : token("--text", darkMode() ? "#dce5ef" : "#303642");

        if (index === 4 && row.hasUnlock) {
          ctx.save();
          ctx.font = font;
          const textWidth = ctx.measureText(String(value)).width;
          ctx.restore();
          drawUnlockMarker(ctx, x + cols[index] / 2 - textWidth / 2 - 20, y + rowH / 2);
        }

        drawText(ctx, value, x + cols[index] / 2, y + rowH / 2, { font, color, align: "center" });
        x += cols[index];
      });
      y += rowH;
    });

    drawText(ctx, `資料來源：${data.source?.path || "light-sanctum-pray/runtime/sanctuary-gameplay-data.js"}`, margin, y + 48, {
      font: '600 15px -apple-system,"PingFang TC",sans-serif',
      color: token("--soft", darkMode() ? "#788796" : "#7a8090")
    });
    drawText(ctx, `資料版本：${data.updatedAt || ""} · ${meta.theme === "dark" ? "夜間" : "日間"}主題 · 由「也許有用的資訊」產生`, width - margin, y + 48, {
      font: '600 15px -apple-system,"PingFang TC",sans-serif',
      color: token("--soft", darkMode() ? "#788796" : "#7a8090"),
      align: "right"
    });

    return canvas;
  }

  const toBlob = canvas => new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("無法建立 PNG")), "image/png");
  });

  async function exportV11(button) {
    button.disabled = true;
    try {
      showToast("正在依目前主題產生圖片…");
      const meta = collectLiveMeta();
      const table = collectLiveTable();
      const response = await fetch("data/light-sanctum-pray-exp.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      const canvas = await buildCanvas(meta, table, data);
      const blob = await toBlob(canvas);
      const name = `光之聖所祈禱經驗表_${data.updatedAt || "MapleStoryM"}_${meta.theme === "dark" ? "夜間" : "日間"}.png`;
      const file = new File([blob], name, { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "光之聖所祈禱經驗表" });
        showToast("圖片已交給系統分享選單");
        return;
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast("PNG 已建立並下載");
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("V11 export failed", error);
        showToast(`圖片建立失敗：${error?.message || error}`);
      }
    } finally {
      button.disabled = false;
    }
  }

  document.addEventListener("click", event => {
    const button = event.target.closest?.("#save-table-image");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    exportV11(button);
  }, true);
})();