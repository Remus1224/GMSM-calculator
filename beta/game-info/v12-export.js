(() => {
  "use strict";

  const root = document.documentElement;
  const EXPORT_SCALE = 2;
  const LOGICAL_WIDTH = 1280;
  const MARGIN = 34;
  const HERO_H = 112;
  const GAP = 14;
  const HEADER_H = 54;
  const ROW_H = 54;
  const NOTE_H = 52;

  const darkMode = () => root.getAttribute("data-theme") === "dark";
  const cssVar = (name, fallback = "") => getComputedStyle(root).getPropertyValue(name).trim() || fallback;
  const bodyStyle = () => getComputedStyle(document.body);
  const fontFamily = () => bodyStyle().fontFamily || '-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft JhengHei",sans-serif';

  const showToast = (message, duration = 2600) => {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { toast.hidden = true; }, duration);
  };

  const roundRect = (ctx, x, y, w, h, r) => {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

  const rgba0 = "rgba(0,0,0,0)";

  const drawText = (ctx, text, x, y, options = {}) => {
    ctx.save();
    const size = options.size || 16;
    const weight = options.weight || 600;
    ctx.font = `${weight} ${size}px ${fontFamily()}`;
    ctx.fillStyle = options.color || cssVar("--text", darkMode() ? "#dce5ef" : "#232936");
    ctx.textAlign = options.align || "left";
    ctx.textBaseline = options.baseline || "middle";
    if (options.maxWidth) ctx.fillText(String(text), x, y, options.maxWidth);
    else ctx.fillText(String(text), x, y);
    ctx.restore();
  };

  const ellipseGlow = (ctx, width, height, px, py, rx, ry, color, fadeAt = .70) => {
    const cx = width * px;
    const cy = height * py;
    const radiusX = width * rx;
    const radiusY = height * ry;
    if (radiusX <= 0 || radiusY <= 0) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, radiusY / radiusX);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radiusX);
    gradient.addColorStop(0, color);
    gradient.addColorStop(Math.min(.99, fadeAt), rgba0);
    gradient.addColorStop(1, rgba0);
    ctx.fillStyle = gradient;
    const ySpan = height * radiusX / radiusY;
    ctx.fillRect(-width, -ySpan, width * 2, ySpan * 2);
    ctx.restore();
  };

  const circleGlow = (ctx, width, height, px, py, radiusRatio, color, fadeAt = .55) => {
    const cx = width * px;
    const cy = height * py;
    const radius = Math.max(width, height) * radiusRatio;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    g.addColorStop(0, color);
    g.addColorStop(fadeAt, rgba0);
    g.addColorStop(1, rgba0);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  };

  function paintAtmosphere(ctx, width, height) {
    ctx.fillStyle = cssVar("--page-base", darkMode() ? "#050A12" : "#EEF1FA");
    ctx.fillRect(0, 0, width, height);

    circleGlow(ctx, width, height, .15, .40, .62, cssVar("--page-grad-cyan", darkMode() ? "rgba(85,195,255,.34)" : "rgba(156,234,254,.64)"));
    circleGlow(ctx, width, height, .85, .60, .62, cssVar("--page-grad-violet", darkMode() ? "rgba(181,112,218,.27)" : "rgba(200,141,221,.50)"));
    circleGlow(ctx, width, height, .50, .10, .46, cssVar("--page-grad-blue", darkMode() ? "rgba(85,195,255,.21)" : "rgba(167,211,246,.32)"), .42);

    ellipseGlow(ctx, width, height, .18, .22, .21, .10, cssVar("--page-detail-light", darkMode() ? "rgba(189,228,255,.038)" : "rgba(255,255,255,.10)"), .69);
    ellipseGlow(ctx, width, height, .42, .53, .15, .23, cssVar("--page-detail-cool", darkMode() ? "rgba(85,195,255,.065)" : "rgba(89,139,178,.050)"), .70);
    ellipseGlow(ctx, width, height, .76, .30, .19, .09, cssVar("--page-detail-soft", darkMode() ? "rgba(186,211,242,.026)" : "rgba(255,255,255,.054)"), .69);
    ellipseGlow(ctx, width, height, .62, .75, .21, .13, cssVar("--page-detail-violet", darkMode() ? "rgba(181,112,218,.035)" : "rgba(139,104,176,.032)"), .72);

    const line = ctx.createLinearGradient(width * .12, height * .10, width * .88, height * .90);
    line.addColorStop(0, rgba0);
    line.addColorStop(.22, cssVar("--page-detail-line-a", darkMode() ? "rgba(189,228,255,.018)" : "rgba(255,255,255,.030)"));
    line.addColorStop(.38, rgba0);
    line.addColorStop(.60, cssVar("--page-detail-line-b", darkMode() ? "rgba(85,195,255,.016)" : "rgba(111,133,173,.020)"));
    line.addColorStop(.82, rgba0);
    ctx.fillStyle = line;
    ctx.fillRect(0, 0, width, height);
  }

  const createBackgroundCanvas = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * EXPORT_SCALE);
    canvas.height = Math.round(height * EXPORT_SCALE);
    const ctx = canvas.getContext("2d");
    ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
    paintAtmosphere(ctx, width, height);
    return canvas;
  };

  function drawGlassSurface(ctx, backgroundCanvas, width, height, x, y, w, h, radius, energy = 1) {
    const dark = darkMode();

    ctx.save();
    ctx.shadowColor = dark ? "rgba(0,0,0,.28)" : "rgba(35,42,75,.11)";
    ctx.shadowBlur = dark ? 22 : 18;
    ctx.shadowOffsetY = dark ? 8 : 6;
    ctx.fillStyle = dark ? "rgba(3,9,18,.025)" : "rgba(255,255,255,.018)";
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(ctx, x, y, w, h, radius);
    ctx.clip();
    ctx.filter = "blur(2.6px) saturate(120%)";
    ctx.drawImage(backgroundCanvas, 0, 0, backgroundCanvas.width, backgroundCanvas.height, 0, 0, width, height);
    ctx.filter = "none";
    ctx.fillStyle = dark ? "rgba(3,9,18,.10)" : "rgba(255,255,255,.040)";
    ctx.fillRect(x, y, w, h);

    const reflect = ctx.createLinearGradient(x, y, x + w, y + h);
    reflect.addColorStop(0, dark ? "rgba(255,255,255,.042)" : "rgba(255,255,255,.10)");
    reflect.addColorStop(.24, rgba0);
    reflect.addColorStop(.76, rgba0);
    reflect.addColorStop(1, dark ? "rgba(255,255,255,.012)" : "rgba(255,255,255,.035)");
    ctx.fillStyle = reflect;
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    ctx.save();
    roundRect(ctx, x + .5, y + .5, w - 1, h - 1, radius - .5);
    const rim = ctx.createLinearGradient(x, y, x + w, y + h);
    const cyanA = dark ? .10 * energy : .18 * energy;
    const violetA = dark ? .08 * energy : .14 * energy;
    rim.addColorStop(0, `rgba(156,234,254,${cyanA})`);
    rim.addColorStop(.42, dark ? "rgba(235,249,255,.12)" : "rgba(255,255,255,.44)");
    rim.addColorStop(1, `rgba(200,141,221,${violetA})`);
    ctx.strokeStyle = rim;
    ctx.lineWidth = energy < .5 ? .8 : 1.15;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    roundRect(ctx, x + 1.2, y + 1.2, w - 2.4, h - 2.4, Math.max(2, radius - 1.2));
    const sharp = ctx.createLinearGradient(x, y, x + w, y + h);
    sharp.addColorStop(0, dark ? "rgba(235,249,255,.30)" : "rgba(255,255,255,.64)");
    sharp.addColorStop(.50, dark ? "rgba(225,239,255,.08)" : "rgba(255,255,255,.18)");
    sharp.addColorStop(1, dark ? "rgba(225,239,255,.12)" : "rgba(255,255,255,.28)");
    ctx.strokeStyle = sharp;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  const nodeColor = (selector, fallback) => {
    const node = document.querySelector(selector);
    return node ? getComputedStyle(node).color : fallback;
  };

  const collectLive = () => {
    const header = [...document.querySelectorAll(".data-header > div")].map(node => node.textContent.trim());
    const rows = [...document.querySelectorAll(".data-row")].map(row => ({
      values: [...row.querySelectorAll(".data-cell")].map(cell => cell.textContent.trim()),
      hasUnlock: Boolean(row.querySelector(".unlock-mark"))
    }));
    if (header.length !== 5 || !rows.length || rows.some(row => row.values.length !== 5)) throw new Error("找不到目前畫面的五欄資料表");

    return {
      eyebrow: document.querySelector(".hero-compact .eyebrow")?.textContent.trim() || "Growth · Light Sanctum",
      title: document.querySelector(".hero-compact h2")?.textContent.trim() || "光之聖所祈禱經驗表",
      button: document.querySelector("#save-table-image")?.textContent.trim() || "儲存 / 分享表格圖片",
      note: document.querySelector(".note-only")?.textContent.trim() || "遊戲版本 2026-09。數據來源部分尚未於遊戲內正式驗證，實際請以遊戲內顯示為主。",
      header,
      rows,
      colors: {
        strong: nodeColor(".hero-compact h2", darkMode() ? "#f3f7fb" : "#151a24"),
        text: nodeColor(".data-row .data-cell:not(.data-unlock)", darkMode() ? "#dce5ef" : "#232936"),
        soft: nodeColor(".hero-compact .eyebrow", darkMode() ? "#788696" : "#919aa8"),
        unlock: nodeColor(".data-unlock", darkMode() ? "#dbe6ef" : "#394659"),
        note: nodeColor(".note-only", darkMode() ? "#aebdca" : "#566173"),
        buttonText: nodeColor("#save-table-image", darkMode() ? "#edf4fb" : "#2c3e50")
      }
    };
  };

  function drawPill(ctx, x, y, w, h, text, colors) {
    ctx.save();
    ctx.shadowColor = darkMode() ? "rgba(0,0,0,.22)" : "rgba(35,42,75,.07)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = darkMode() ? "rgba(15,20,30,.56)" : "rgba(255,255,255,.38)";
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(ctx, x + .5, y + .5, w - 1, h - 1, (h - 1) / 2);
    ctx.strokeStyle = darkMode() ? "rgba(178,187,237,.20)" : "rgba(255,255,255,.58)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    drawText(ctx, text, x + w / 2, y + h / 2 + .5, { size: 13, weight: 680, color: colors.buttonText, align: "center" });
  }

  function drawUnlockMarker(ctx, textX, y) {
    const g = ctx.createLinearGradient(textX - 18, y, textX - 4, y);
    g.addColorStop(0, rgba0);
    g.addColorStop(.35, darkMode() ? "rgba(85,195,255,.54)" : "rgba(121,220,233,.76)");
    g.addColorStop(.68, darkMode() ? "rgba(200,141,221,.42)" : "rgba(200,141,221,.62)");
    g.addColorStop(1, rgba0);
    ctx.fillStyle = g;
    roundRect(ctx, textX - 18, y - 1, 14, 2, 1);
    ctx.fill();
  }

  async function buildCanvas() {
    if (document.fonts?.ready) await document.fonts.ready;
    const live = collectLive();

    const contentW = LOGICAL_WIDTH - MARGIN * 2;
    const tableH = HEADER_H + live.rows.length * ROW_H;
    const tableY = MARGIN + HERO_H + GAP;
    const noteY = tableY + tableH + 12;
    const logicalH = noteY + NOTE_H + MARGIN;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(LOGICAL_WIDTH * EXPORT_SCALE);
    canvas.height = Math.round(logicalH * EXPORT_SCALE);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("瀏覽器無法建立 Canvas");
    ctx.scale(EXPORT_SCALE, EXPORT_SCALE);

    const backgroundCanvas = createBackgroundCanvas(LOGICAL_WIDTH, logicalH);
    ctx.drawImage(backgroundCanvas, 0, 0, backgroundCanvas.width, backgroundCanvas.height, 0, 0, LOGICAL_WIDTH, logicalH);

    drawGlassSurface(ctx, backgroundCanvas, LOGICAL_WIDTH, logicalH, MARGIN, MARGIN, contentW, HERO_H, 22, .34);
    drawText(ctx, live.eyebrow, MARGIN + 24, MARGIN + 28, { size: 12, weight: 700, color: live.colors.soft });
    drawText(ctx, live.title, MARGIN + 24, MARGIN + 69, { size: 34, weight: 780, color: live.colors.strong });
    const buttonW = 170;
    const buttonH = 38;
    drawPill(ctx, MARGIN + contentW - buttonW - 20, MARGIN + (HERO_H - buttonH) / 2, buttonW, buttonH, live.button, live.colors);

    drawGlassSurface(ctx, backgroundCanvas, LOGICAL_WIDTH, logicalH, MARGIN, tableY, contentW, tableH, 24, 1);

    const first = 96;
    const remaining = contentW - first;
    const unit = remaining / 4.75;
    const cols = [first, unit, unit, unit, unit * 1.75];
    const colX = [MARGIN];
    for (let i = 0; i < cols.length - 1; i++) colX.push(colX[i] + cols[i]);

    live.header.forEach((label, index) => {
      drawText(ctx, label, colX[index] + cols[index] / 2, tableY + HEADER_H / 2, { size: 13.5, weight: 760, color: live.colors.strong, align: "center" });
    });

    const lineColor = darkMode() ? "rgba(194,212,230,.085)" : "rgba(69,87,124,.10)";
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MARGIN + 14, tableY + HEADER_H);
    ctx.lineTo(MARGIN + contentW - 14, tableY + HEADER_H);
    ctx.stroke();

    live.rows.forEach((row, rowIndex) => {
      const y = tableY + HEADER_H + rowIndex * ROW_H;
      if (rowIndex > 0) {
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(MARGIN + 14, y);
        ctx.lineTo(MARGIN + contentW - 14, y);
        ctx.stroke();
      }

      row.values.forEach((value, index) => {
        const centerX = colX[index] + cols[index] / 2;
        const centerY = y + ROW_H / 2;
        const isUnlock = index === 4;
        const color = isUnlock ? live.colors.unlock : live.colors.text;
        const size = isUnlock ? 13 : 15.5;
        const weight = index === 0 ? 730 : isUnlock ? 650 : 600;
        if (isUnlock && row.hasUnlock) {
          ctx.save();
          ctx.font = `${weight} ${size}px ${fontFamily()}`;
          const tw = ctx.measureText(String(value)).width;
          ctx.restore();
          drawUnlockMarker(ctx, centerX - tw / 2, centerY);
        }
        drawText(ctx, value, centerX, centerY, { size, weight, color, align: "center", maxWidth: cols[index] - 20 });
      });
    });

    drawGlassSurface(ctx, backgroundCanvas, LOGICAL_WIDTH, logicalH, MARGIN, noteY, contentW, NOTE_H, 18, .20);
    drawText(ctx, live.note, LOGICAL_WIDTH / 2, noteY + NOTE_H / 2, { size: 12.5, weight: 540, color: live.colors.note, align: "center", maxWidth: contentW - 40 });

    return canvas;
  }

  const toBlob = canvas => new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("無法建立 PNG")), "image/png");
  });

  const getUpdatedAt = async () => {
    try {
      const response = await fetch("data/light-sanctum-pray-exp.json", { cache: "no-store" });
      if (!response.ok) return "MapleStoryM";
      const data = await response.json();
      return data.updatedAt || "MapleStoryM";
    } catch (_) {
      return "MapleStoryM";
    }
  };

  async function deliver(blob) {
    const updatedAt = await getUpdatedAt();
    const theme = darkMode() ? "夜間" : "日間";
    const name = `光之聖所祈禱經驗表_${updatedAt}_${theme}_完整.png`;
    const file = new File([blob], name, { type: "image/png" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "光之聖所祈禱經驗表" });
      showToast("完整圖片已交給系統分享選單");
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1600);
    showToast("完整 PNG 已建立並下載");
  }

  async function exportManual(button) {
    if (button.disabled) return;
    button.disabled = true;
    try {
      showToast("正在依目前 Light / Dark 主題繪製完整圖片…", 3600);
      const canvas = await buildCanvas();
      const blob = await toBlob(canvas);
      await deliver(blob);
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("P5B manual canvas export failed", error);
        showToast(`圖片建立失敗：${error?.message || error}`, 4200);
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
    exportManual(button);
  }, true);
})();