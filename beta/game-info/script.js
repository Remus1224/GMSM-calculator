(() => {
  "use strict";

  const root = document.documentElement;
  const app = document.getElementById("app");
  const navBack = document.getElementById("nav-back");
  const navTitle = document.getElementById("nav-title");
  const themeToggle = document.getElementById("theme-toggle");
  const toast = document.getElementById("toast");
  const numberFormat = new Intl.NumberFormat("zh-TW");
  let catalog = null;
  let toastTimer = 0;

  function isBetaPath() {
    return /\/beta\/game-info\/?/.test(window.location.pathname);
  }
  function mainSiteUrl() {
    return isBetaPath() ? "../../" : "../";
  }
  function currentPageId() {
    return new URL(window.location.href).searchParams.get("page") || "";
  }
  function setTheme(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    const dark = theme === "dark";
    themeToggle.textContent = dark ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-label", dark ? "切換至日間模式" : "切換至夜間模式");
    themeToggle.setAttribute("aria-pressed", String(dark));
  }
  function initTheme() {
    let saved = "light";
    try { saved = localStorage.getItem("msm-theme") === "dark" ? "dark" : "light"; } catch (_) {}
    setTheme(saved);
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem("msm-theme", next); } catch (_) {}
      setTheme(next);
    });
  }
  async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  }
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function setRoute(pageId, replace = false) {
    const url = new URL(window.location.href);
    if (pageId) url.searchParams.set("page", pageId);
    else url.searchParams.delete("page");
    history[replace ? "replaceState" : "pushState"]({}, "", url);
    renderRoute();
  }
  function setNav(pageTitle = "") {
    const detail = Boolean(pageTitle);
    navTitle.textContent = detail ? pageTitle : "也許有用的資訊";
    navBack.textContent = detail ? "資訊首頁" : "主選單";
    navBack.onclick = detail
      ? () => setRoute("")
      : () => { window.location.href = mainSiteUrl(); };
  }
  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
  }
  function formatNumber(value) {
    return value == null ? "—" : numberFormat.format(value);
  }
  function derivedRows(levels) {
    return levels.map((level, index) => {
      const next = levels[index + 1] || null;
      const characterCoinPerPray = Number(level.upgradeCostAmount0 || 0) * Number(level.slotCount || 0);
      return {
        ...level,
        expToNext: next ? Number(next.needPoint) - Number(level.needPoint) : null,
        characterCoinPerPray,
        expPerPray: Number(level.gainPoint || 0) + Number(level.gainPointPerCoin || 0) * characterCoinPerPray
      };
    });
  }

  function renderHome() {
    setNav("");
    document.title = "也許有用的資訊｜楓之谷M 也許有用的工具";
    const rows = catalog.items.map(item => {
      const ready = item.status === "ready";
      return `
        <button class="info-row" type="button" data-page="${escapeHtml(item.id)}" ${ready ? "" : "disabled"}>
          <span class="info-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
          <span class="info-copy">
            <span class="info-title">${escapeHtml(item.title)}</span>
            <span class="info-subtitle">${escapeHtml(item.subtitle)}</span>
          </span>
          <span class="status-pill ${ready ? "" : "soon"}">${ready ? "查看" : "準備中"}</span>
        </button>`;
    }).join("");

    app.innerHTML = `
      <section class="glass-panel hero-compact">
        <div class="eyebrow">MapleStory M · Data Library</div>
        <h2>也許有用的資訊</h2>
        <p>遊戲內成長需求、等級門檻與系統資料。以簡單的一列式資訊為主，方便手機查詢與保存。</p>
      </section>
      <section class="info-list" aria-label="資訊分類">${rows}</section>
      <div class="footer">Beta V2 · 資料頁會逐步增加。</div>`;

    app.querySelectorAll("[data-page]:not(:disabled)").forEach(button => {
      button.addEventListener("click", () => setRoute(button.dataset.page));
    });
  }

  function renderDataRows(rows) {
    return rows.map(row => `
      <div class="data-row ${row.milestone ? "is-milestone" : ""}">
        <div class="data-cell data-level">Lv.${row.level}</div>
        <div class="data-cell">${formatNumber(row.expToNext)}</div>
        <div class="data-cell">${formatNumber(row.needPoint)}</div>
        <div class="data-cell">${formatNumber(row.expPerPray)}</div>
        <div class="data-cell">${row.slotCount}</div>
        <div class="data-cell">${row.presetCount}</div>
        <div class="data-cell data-note">${row.milestone ? `<span class="milestone-mark">${escapeHtml(row.milestone)}</span>` : "—"}</div>
      </div>`).join("");
  }

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
  function drawText(ctx, text, x, y, opts = {}) {
    ctx.save();
    ctx.font = opts.font || '600 24px -apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", sans-serif';
    ctx.fillStyle = opts.color || "#222735";
    ctx.textAlign = opts.align || "left";
    ctx.textBaseline = opts.baseline || "middle";
    ctx.fillText(String(text), x, y);
    ctx.restore();
  }
  function createShareCanvas(data, rows) {
    const width = 1440;
    const margin = 70;
    const headerH = 250;
    const colHeadH = 62;
    const rowH = 68;
    const footerH = 110;
    const height = margin + headerH + colHeadH + rows.length * rowH + footerH + margin;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#d9f4ff");
    bg.addColorStop(.48, "#f2efff");
    bg.addColorStop(1, "#f5ddff");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const glowA = ctx.createRadialGradient(140, 150, 20, 140, 150, 430);
    glowA.addColorStop(0, "rgba(91,203,255,.42)");
    glowA.addColorStop(1, "rgba(91,203,255,0)");
    ctx.fillStyle = glowA; ctx.fillRect(0, 0, width, height);
    const glowB = ctx.createRadialGradient(width - 120, 360, 10, width - 120, 360, 500);
    glowB.addColorStop(0, "rgba(205,131,230,.35)");
    glowB.addColorStop(1, "rgba(205,131,230,0)");
    ctx.fillStyle = glowB; ctx.fillRect(0, 0, width, height);

    ctx.save();
    roundRect(ctx, margin, margin, width - margin * 2, headerH, 32);
    ctx.fillStyle = "rgba(255,255,255,.54)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.90)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    drawText(ctx, "楓之谷M 也許有用的工具", margin + 38, margin + 42, { font: '700 22px -apple-system, "PingFang TC", sans-serif', color: "#697080" });
    drawText(ctx, data.title || "光之聖所祈禱經驗表", margin + 38, margin + 98, { font: '900 48px -apple-system, "PingFang TC", sans-serif', color: "#202532" });
    drawText(ctx, `Lv.1～Lv.${rows.at(-1)?.level || 15} · 升級 EXP / 累積 EXP / 每次祈禱 EXP / 欄位 / Preset`, margin + 38, margin + 145, { font: '600 21px -apple-system, "PingFang TC", sans-serif', color: "#727887" });

    const summaryY = margin + 198;
    const summaries = [
      ["最高等級", `Lv.${rows.at(-1)?.level || 15}`],
      ["滿等累積 EXP", formatNumber(rows.at(-1)?.needPoint)],
      ["最大欄位", rows.at(-1)?.slotCount ?? 5],
      ["最大 Preset", rows.at(-1)?.presetCount ?? 3]
    ];
    summaries.forEach((entry, i) => {
      const x = margin + 38 + i * 295;
      drawText(ctx, entry[0], x, summaryY - 10, { font: '600 16px -apple-system, "PingFang TC", sans-serif', color: "#7b8190" });
      drawText(ctx, entry[1], x, summaryY + 18, { font: '900 25px -apple-system, "PingFang TC", sans-serif', color: "#252a36" });
    });

    const tableX = margin;
    const tableW = width - margin * 2;
    let y = margin + headerH + 22;
    const columns = [
      { t: "等級", w: 100, a: "left" },
      { t: "升下一級 EXP", w: 220, a: "right" },
      { t: "累積 EXP", w: 205, a: "right" },
      { t: "每次祈禱 EXP", w: 205, a: "right" },
      { t: "欄位", w: 110, a: "right" },
      { t: "Preset", w: 110, a: "right" },
      { t: "里程碑", w: tableW - 950, a: "left" }
    ];
    let cx = tableX + 20;
    columns.forEach(col => {
      drawText(ctx, col.t, col.a === "right" ? cx + col.w - 12 : cx + 8, y + colHeadH / 2, {
        font: '800 16px -apple-system, "PingFang TC", sans-serif',
        color: "#6f7686",
        align: col.a
      });
      cx += col.w;
    });
    y += colHeadH;

    rows.forEach(row => {
      ctx.save();
      roundRect(ctx, tableX, y + 4, tableW, rowH - 8, 16);
      ctx.fillStyle = row.milestone ? "rgba(224,231,255,.66)" : "rgba(255,255,255,.48)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.86)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      const values = [
        `Lv.${row.level}`,
        formatNumber(row.expToNext),
        formatNumber(row.needPoint),
        formatNumber(row.expPerPray),
        row.slotCount,
        row.presetCount,
        row.milestone || "—"
      ];
      cx = tableX + 20;
      columns.forEach((col, i) => {
        const isLevel = i === 0;
        const isNote = i === 6;
        drawText(ctx, values[i], col.a === "right" ? cx + col.w - 12 : cx + 8, y + rowH / 2, {
          font: `${isLevel ? 900 : isNote ? 600 : 700} ${isNote ? 14 : 18}px -apple-system, "PingFang TC", "Microsoft JhengHei", sans-serif`,
          color: isNote ? "#6f7686" : "#252a36",
          align: col.a
        });
        cx += col.w;
      });
      y += rowH;
    });

    drawText(ctx, `資料來源：${data.source?.path || "light-sanctum-pray/runtime/sanctuary-gameplay-data.js"}`, margin, y + 48, {
      font: '600 15px -apple-system, "PingFang TC", sans-serif',
      color: "#7a8090"
    });
    drawText(ctx, `資料版本：${data.updatedAt || ""} · 由「也許有用的資訊」產生`, width - margin, y + 48, {
      font: '600 15px -apple-system, "PingFang TC", sans-serif',
      color: "#7a8090",
      align: "right"
    });
    return canvas;
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("無法建立 PNG")), "image/png");
    });
  }
  async function saveOrShareImage(data, rows) {
    const button = document.getElementById("save-table-image");
    if (button) button.disabled = true;
    try {
      showToast("正在產生高解析圖片…");
      const canvas = createShareCanvas(data, rows);
      const blob = await canvasToBlob(canvas);
      const fileName = `光之聖所祈禱經驗表_${data.updatedAt || "MapleStoryM"}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "光之聖所祈禱經驗表" });
        showToast("圖片已交給系統分享選單");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast("PNG 已建立並下載");
    } catch (error) {
      if (error?.name !== "AbortError") showToast(`圖片建立失敗：${error.message}`);
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function renderLightSanctum(item) {
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    try {
      const data = await fetchJson(item.data);
      const rows = derivedRows(Array.isArray(data.levels) ? data.levels : []);
      if (!rows.length) throw new Error("找不到等級資料");
      const max = rows[rows.length - 1];
      const milestones = rows.filter(row => row.milestone).length;

      app.innerHTML = `
        <section class="glass-panel hero-compact">
          <div class="hero-line">
            <div>
              <div class="eyebrow">Growth · Light Sanctum</div>
              <h2>${escapeHtml(data.title)}</h2>
              <p>Lv.1～Lv.${max.level} 升級經驗、累積 EXP、每次祈禱 EXP、欄位與 Preset 數量。</p>
            </div>
            <span class="source-chip">Client Table</span>
          </div>
          <div class="hero-actions">
            <button id="save-table-image" class="action-btn" type="button">儲存 / 分享表格圖片</button>
          </div>
        </section>

        <section class="summary-strip" aria-label="資料摘要">
          <div class="summary-item"><div class="summary-label">最高等級</div><div class="summary-value">Lv.${max.level}</div></div>
          <div class="summary-item"><div class="summary-label">滿等累積 EXP</div><div class="summary-value">${formatNumber(max.needPoint)}</div></div>
          <div class="summary-item"><div class="summary-label">最大欄位</div><div class="summary-value">${max.slotCount}</div></div>
          <div class="summary-item"><div class="summary-label">最大 Preset</div><div class="summary-value">${max.presetCount}</div></div>
        </section>

        <section class="data-section" aria-label="光之聖所祈禱經驗表">
          <div class="data-header" aria-hidden="true">
            <div>等級</div><div>升下一級 EXP</div><div>累積 EXP</div><div>每次祈禱 EXP</div><div>欄位</div><div>Preset</div><div class="milestone-col">里程碑</div>
          </div>
          ${renderDataRows(rows)}
        </section>

        <section class="note-panel">
          <h3>資料說明</h3>
          <p>「累積 EXP」直接對應 Client Table 的 <span class="code-inline">LevelInfo.needPoint</span>；「升下一級 EXP」由下一級 needPoint 減目前級 needPoint。</p>
          <p>「每次祈禱 EXP」依正式模擬器公式 <span class="code-inline">GainPoint + GainPointPerCoin × CharacterCoin cost</span> 推導。Lv.${max.level} 為滿等，因此顯示 0。</p>
          <p>目前標示 ${milestones} 個開放里程碑。來源：<span class="code-inline">${escapeHtml(data.source?.path || "")}</span>，資料版本 ${escapeHtml(data.updatedAt || "")}。</p>
        </section>
        <div class="footer">Beta V2 · 此頁只讀，不會修改任何模擬器狀態。</div>`;

      document.getElementById("save-table-image")?.addEventListener("click", () => saveOrShareImage(data, rows));
    } catch (error) {
      app.innerHTML = `<div class="glass-panel error-box">資料載入失敗：${escapeHtml(error.message)}<br>請確認你是透過 GitHub Pages 網址開啟。</div>`;
    }
  }

  async function renderRoute() {
    if (!catalog) return;
    const pageId = currentPageId();
    if (!pageId) { renderHome(); return; }
    const item = catalog.items.find(entry => entry.id === pageId && entry.status === "ready");
    if (!item) { setRoute("", true); return; }
    if (item.id === "light-sanctum-pray-exp") { await renderLightSanctum(item); return; }
    renderHome();
  }

  async function init() {
    initTheme();
    app.innerHTML = `<div class="glass-panel loading">正在載入資訊中心…</div>`;
    try {
      catalog = await fetchJson("data/catalog.json");
      await renderRoute();
    } catch (error) {
      setNav("");
      app.innerHTML = `<div class="glass-panel error-box">資訊中心載入失敗：${escapeHtml(error.message)}<br>請使用 GitHub Pages 測試網址開啟。</div>`;
    }
  }

  window.addEventListener("popstate", renderRoute);
  init();
})();
