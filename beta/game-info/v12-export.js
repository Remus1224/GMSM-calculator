(() => {
  "use strict";

  const root = document.documentElement;
  const token = (name, fallback) => getComputedStyle(root).getPropertyValue(name).trim() || fallback;
  const darkMode = () => root.getAttribute("data-theme") === "dark";
  const tail = () => darkMode() ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)";

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
    ctx.fillStyle = options.color || token("--gi-text", "#222936");
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
    setTimeout(() => { toast.hidden = true; }, 2600);
  };

  const collectLiveTable = () => {
    const header = [...document.querySelectorAll(".data-header > div")].map(node => node.textContent.trim());
    const rows = [...document.querySelectorAll(".data-row")].map(row => ({
      values: [...row.querySelectorAll(".data-cell")].map(cell => cell.textContent.trim()),
      hasUnlock: Boolean(row.querySelector(".unlock-mark"))
    }));
    if (header.length !== 5 || !rows.length || rows.some(row => row.values.length !== 5)) throw new Error("找不到目前畫面的五欄資料表");
    return { header, rows };
  };

  const collectLiveMeta = () => ({
    siteTitle: document.querySelector(".site-title")?.textContent.trim() || "楓之谷M 也許有用的工具",
    title: document.querySelector(".hero-compact h2")?.textContent.trim() || "光之聖所祈禱經驗表",
    subtitle: document.querySelector(".hero-compact p")?.textContent.trim() || "",
    theme: darkMode() ? "dark" : "light"
  });

  function paintPage(ctx, width, height) {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, token("--gi-page-a", darkMode() ? "#07111b" : "#dff8ff"));
    bg.addColorStop(.47, token("--gi-page-b", darkMode() ? "#0a111b" : "#eef2ff"));
    bg.addColorStop(1, token("--gi-page-c", darkMode() ? "#11131a" : "#ffe9f7"));
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const fields = [
      [width * .04, height * .05, width * .43, token("--gi-atmos-cyan", "rgba(72,215,255,.34)")],
      [width * .96, height * .14, width * .38, token("--gi-atmos-violet", "rgba(187,160,255,.20)")],
      [width * .52, height * .88, width * .44, token("--gi-atmos-pink", "rgba(255,177,221,.18)")]
    ];
    fields.forEach(([x, y, r, color]) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, tail());
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    });
  }

  function panel(ctx, x, y, w, h, r) {
    ctx.save();
    roundRect(ctx, x, y, w, h, r);
    ctx.clip();
    const fill = ctx.createLinearGradient(x, y, x + w, y + h);
    fill.addColorStop(0, token("--gi-panel-a", "rgba(255,255,255,.30)"));
    fill.addColorStop(.48, token("--gi-panel-b", "rgba(255,255,255,.105)"));
    fill.addColorStop(1, token("--gi-panel-c", "rgba(255,255,255,.18)"));
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);

    const hi = ctx.createLinearGradient(x, y, x + w, y + h * .45);
    hi.addColorStop(0, darkMode() ? "rgba(226,238,247,.10)" : "rgba(255,255,255,.34)");
    hi.addColorStop(.28, tail());
    ctx.fillStyle = hi;
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    ctx.save();
    roundRect(ctx, x, y, w, h, r);
    ctx.strokeStyle = token("--gi-panel-border", "rgba(255,255,255,.78)");
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawMarker(ctx, x, y) {
    const w = 11, h = 2;
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, tail());
    g.addColorStop(.24, token("--gi-marker-cyan", "#79dce9"));
    g.addColorStop(.56, token("--gi-marker-violet", "#9b9bd7"));
    g.addColorStop(.78, token("--gi-marker-pink", "#dda8ca"));
    g.addColorStop(1, tail());
    ctx.save();
    roundRect(ctx, x, y - h / 2, w, h, 1);
    ctx.globalAlpha = darkMode() ? .48 : .74;
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  async function buildCanvas(meta, table, data) {
    const width = 1440;
    const margin = 70;
    const heroH = 205;
    const headerH = 64;
    const rowH = 66;
    const footerH = 105;
    const tableY = margin + heroH + 20;
    const tableH = headerH + table.rows.length * rowH;
    const height = tableY + tableH + footerH + margin;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("瀏覽器無法建立 Canvas");

    paintPage(ctx, width, height);
    panel(ctx, margin, margin, width - margin * 2, heroH, 34);

    drawText(ctx, meta.siteTitle, margin + 38, margin + 40, { font:'700 22px -apple-system,"PingFang TC",sans-serif', color:token("--gi-muted", "#707989") });
    drawText(ctx, meta.title, margin + 38, margin + 96, { font:'800 48px -apple-system,"PingFang TC",sans-serif', color:token("--gi-strong", "#161b25") });
    drawText(ctx, meta.subtitle, margin + 38, margin + 145, { font:'600 21px -apple-system,"PingFang TC",sans-serif', color:token("--gi-muted", "#707989") });

    const tableX = margin;
    const tableW = width - margin * 2;

    ctx.save();
    roundRect(ctx, tableX, tableY, tableW, tableH, 30);
    ctx.clip();
    const fill = ctx.createLinearGradient(tableX, tableY, tableX + tableW, tableY + tableH);
    fill.addColorStop(0, token("--gi-table-a", "rgba(255,255,255,.24)"));
    fill.addColorStop(.46, token("--gi-table-b", "rgba(255,255,255,.075)"));
    fill.addColorStop(1, token("--gi-table-c", "rgba(255,255,255,.14)"));
    ctx.fillStyle = fill;
    ctx.fillRect(tableX, tableY, tableW, tableH);

    const spec = ctx.createRadialGradient(tableX + tableW * .22, tableY + tableH * .14, 0, tableX + tableW * .22, tableY + tableH * .14, 330);
    spec.addColorStop(0, token("--gi-spec", "rgba(255,255,255,.46)"));
    spec.addColorStop(.28, token("--gi-spec-soft", "rgba(255,255,255,.13)"));
    spec.addColorStop(1, tail());
    ctx.fillStyle = spec;
    ctx.fillRect(tableX, tableY, tableW, tableH);

    const chroma = ctx.createLinearGradient(tableX, tableY, tableX + tableW, tableY);
    chroma.addColorStop(0, token("--gi-edge-cyan", "rgba(93,220,255,.18)"));
    chroma.addColorStop(.22, tail());
    chroma.addColorStop(.78, tail());
    chroma.addColorStop(1, token("--gi-edge-pink", "rgba(255,157,224,.13)"));
    ctx.fillStyle = chroma;
    ctx.fillRect(tableX, tableY, tableW, tableH);

    const topHi = ctx.createLinearGradient(tableX, tableY, tableX + tableW, tableY + tableH * .35);
    topHi.addColorStop(0, darkMode() ? "rgba(226,238,247,.17)" : "rgba(255,255,255,.34)");
    topHi.addColorStop(.18, darkMode() ? "rgba(202,222,236,.04)" : "rgba(255,255,255,.08)");
    topHi.addColorStop(.36, tail());
    ctx.fillStyle = topHi;
    ctx.fillRect(tableX, tableY, tableW, tableH);

    ctx.fillStyle = darkMode() ? "rgba(190,210,228,.020)" : "rgba(255,255,255,.035)";
    ctx.fillRect(tableX, tableY, tableW, headerH);
    ctx.restore();

    ctx.save();
    roundRect(ctx, tableX, tableY, tableW, tableH, 30);
    ctx.strokeStyle = token("--gi-table-border", "rgba(255,255,255,.84)");
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const cols = [120, 260, 240, 240, tableW - 860];
    let x = tableX;
    table.header.forEach((label, index) => {
      drawText(ctx, label, x + cols[index] / 2, tableY + headerH / 2, { font:'800 17px -apple-system,"PingFang TC",sans-serif', color:token("--gi-strong", "#303744"), align:"center" });
      x += cols[index];
    });

    ctx.strokeStyle = token("--gi-line", "rgba(72,91,126,.105)");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tableX + 16, tableY + headerH);
    ctx.lineTo(tableX + tableW - 16, tableY + headerH);
    ctx.stroke();

    let y = tableY + headerH;
    table.rows.forEach((row, rowIndex) => {
      if (rowIndex) {
        ctx.strokeStyle = token("--gi-line", "rgba(72,91,126,.105)");
        ctx.beginPath();
        ctx.moveTo(tableX + 16, y);
        ctx.lineTo(tableX + tableW - 16, y);
        ctx.stroke();
      }
      x = tableX;
      row.values.forEach((value, index) => {
        const font = `${index === 0 ? 750 : index === 4 ? 560 : 620} ${index === 4 ? 14 : 18}px -apple-system,"PingFang TC",sans-serif`;
        const color = index === 4 ? token("--gi-muted", "#707989") : index === 0 ? token("--gi-strong", "#161b25") : token("--gi-text", "#222936");
        if (index === 4 && row.hasUnlock) {
          ctx.save();
          ctx.font = font;
          const tw = ctx.measureText(String(value)).width;
          ctx.restore();
          drawMarker(ctx, x + cols[index] / 2 - tw / 2 - 20, y + rowH / 2);
        }
        drawText(ctx, value, x + cols[index] / 2, y + rowH / 2, { font, color, align:"center" });
        x += cols[index];
      });
      y += rowH;
    });

    drawText(ctx, `資料來源：${data.source?.path || "light-sanctum-pray/runtime/sanctuary-gameplay-data.js"}`, margin, y + 48, { font:'600 15px -apple-system,"PingFang TC",sans-serif', color:token("--gi-soft", "#9199a8") });
    drawText(ctx, `資料版本：${data.updatedAt || ""} · ${meta.theme === "dark" ? "夜間" : "日間"}主題 · 由「也許有用的資訊」產生`, width - margin, y + 48, { font:'600 15px -apple-system,"PingFang TC",sans-serif', color:token("--gi-soft", "#9199a8"), align:"right" });
    return canvas;
  }

  const toBlob = canvas => new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("無法建立 PNG")), "image/png"));

  async function exportV12(button) {
    button.disabled = true;
    try {
      showToast("正在依目前主題產生圖片…");
      const meta = collectLiveMeta();
      const table = collectLiveTable();
      const response = await fetch("data/light-sanctum-pray-exp.json", { cache:"no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      const canvas = await buildCanvas(meta, table, data);
      const blob = await toBlob(canvas);
      const name = `光之聖所祈禱經驗表_${data.updatedAt || "MapleStoryM"}_${meta.theme === "dark" ? "夜間" : "日間"}.png`;
      const file = new File([blob], name, { type:"image/png" });
      if (navigator.share && navigator.canShare && navigator.canShare({ files:[file] })) {
        await navigator.share({ files:[file], title:"光之聖所祈禱經驗表" });
        showToast("圖片已交給系統分享選單");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast("PNG 已建立並下載");
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("V12 export failed", error);
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
    exportV12(button);
  }, true);
})();
