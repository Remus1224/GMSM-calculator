(() => {
  "use strict";

  const root = document.documentElement;
  const app = document.getElementById("app");
  const navBack = document.getElementById("nav-back");
  const navTitle = document.getElementById("nav-title");
  const themeToggle = document.getElementById("theme-toggle");
  const numberFormat = new Intl.NumberFormat("zh-TW");
  let catalog = null;

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

  function renderHome() {
    setNav("");
    document.title = "也許有用的資訊｜楓之谷M 也許有用的工具";

    const cards = catalog.items.map(item => {
      const ready = item.status === "ready";
      return `
        <button class="info-card" type="button" data-page="${escapeHtml(item.id)}" ${ready ? "" : "disabled"}>
          <span class="card-top">
            <span class="card-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
            <span class="status-pill ${ready ? "status-ready" : "status-soon"}">${ready ? "可查看" : "準備中"}</span>
          </span>
          <span class="card-title">${escapeHtml(item.title)}</span>
          <span class="card-subtitle">${escapeHtml(item.subtitle)}</span>
        </button>`;
    }).join("");

    app.innerHTML = `
      <section class="hero">
        <div class="eyebrow">MapleStory M · Data Library</div>
        <h2>也許有用的資訊</h2>
        <p>整理遊戲內可查證的成長需求、等級門檻與系統資料。資料與介面分離，之後遊戲更新時可以直接更新資料表，不必重做整個頁面。</p>
      </section>
      <section class="info-grid" aria-label="資訊分類">
        ${cards}
      </section>
      <div class="footer">Beta V1 · 資料頁會逐步增加，準備中的項目目前不開放。</div>`;

    app.querySelectorAll("[data-page]:not(:disabled)").forEach(button => {
      button.addEventListener("click", () => setRoute(button.dataset.page));
    });
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

  function formatNumber(value) {
    return value == null ? "—" : numberFormat.format(value);
  }

  function renderDesktopRows(rows) {
    return rows.map(row => `
      <tr class="${row.milestone ? "is-milestone" : ""}">
        <td class="level-cell">Lv.${row.level}</td>
        <td>${formatNumber(row.expToNext)}</td>
        <td>${formatNumber(row.needPoint)}</td>
        <td>${formatNumber(row.expPerPray)}</td>
        <td>${row.slotCount}</td>
        <td>${row.presetCount}</td>
        <td>${row.milestone ? `<span class="milestone-tag">${escapeHtml(row.milestone)}</span>` : `<span class="muted-dash">—</span>`}</td>
      </tr>`).join("");
  }

  function renderMobileRows(rows) {
    return rows.map(row => `
      <article class="level-card ${row.milestone ? "is-milestone" : ""}">
        <div class="level-card-head">
          <div class="level-card-title">Lv.${row.level}</div>
          ${row.milestone ? `<span class="milestone-tag">里程碑</span>` : ""}
        </div>
        <div class="level-card-grid">
          <div><small>升下一級 EXP</small><strong>${formatNumber(row.expToNext)}</strong></div>
          <div><small>累積 EXP</small><strong>${formatNumber(row.needPoint)}</strong></div>
          <div><small>每次祈禱 EXP</small><strong>${formatNumber(row.expPerPray)}</strong></div>
          <div><small>開放欄位</small><strong>${row.slotCount}</strong></div>
          <div><small>Preset</small><strong>${row.presetCount}</strong></div>
        </div>
        ${row.milestone ? `<div class="level-card-note">${escapeHtml(row.milestone)}</div>` : ""}
      </article>`).join("");
  }

  async function renderLightSanctum(item) {
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="panel loading">正在載入資料…</div>`;

    try {
      const data = await fetchJson(item.data);
      const rows = derivedRows(Array.isArray(data.levels) ? data.levels : []);
      if (!rows.length) throw new Error("找不到等級資料");
      const max = rows[rows.length - 1];
      const milestones = rows.filter(row => row.milestone).length;

      app.innerHTML = `
        <section class="hero">
          <div class="page-head">
            <div>
              <div class="eyebrow">Growth · Light Sanctum</div>
              <h2>${escapeHtml(data.title)}</h2>
              <p>整理光之聖所 Lv.1～Lv.${max.level} 的升級經驗門檻、累積 EXP、每次祈禱 EXP、欄位與 Preset 數量。</p>
            </div>
            <span class="source-chip">Client Table</span>
          </div>
          <div class="summary-grid">
            <div class="summary-card"><div class="summary-label">最高等級</div><div class="summary-value">Lv.${max.level}</div></div>
            <div class="summary-card"><div class="summary-label">滿等累積 EXP</div><div class="summary-value">${formatNumber(max.needPoint)}</div></div>
            <div class="summary-card"><div class="summary-label">最大欄位</div><div class="summary-value">${max.slotCount}</div></div>
            <div class="summary-card"><div class="summary-label">最大 Preset</div><div class="summary-value">${max.presetCount}</div></div>
          </div>
        </section>

        <section class="panel table-panel">
          <div class="table-scroll">
            <table class="info-table">
              <thead>
                <tr>
                  <th>等級</th>
                  <th>升下一級 EXP</th>
                  <th>累積 EXP</th>
                  <th>每次祈禱 EXP</th>
                  <th>欄位</th>
                  <th>Preset</th>
                  <th>里程碑</th>
                </tr>
              </thead>
              <tbody>${renderDesktopRows(rows)}</tbody>
            </table>
          </div>
        </section>

        <section class="mobile-level-list" aria-label="光之聖所祈禱經驗表手機版">
          ${renderMobileRows(rows)}
        </section>

        <section class="panel note-panel">
          <h3>資料說明</h3>
          <p>「累積 EXP」直接對應 Client Table 的 <span class="code-inline">LevelInfo.needPoint</span>；「升下一級 EXP」由下一級 needPoint 減去目前級 needPoint。</p>
          <p>「每次祈禱 EXP」依正式模擬器採用的公式 <span class="code-inline">GainPoint + GainPointPerCoin × CharacterCoin cost</span> 推導。Lv.${max.level} 為滿等，因此顯示 0。</p>
          <p>目前共標示 ${milestones} 個開放里程碑。來源：<span class="code-inline">${escapeHtml(data.source?.path || "")}</span>，資料版本 ${escapeHtml(data.updatedAt || "") }。</p>
        </section>
        <div class="footer">Beta V1 · 此頁目前只讀，不會修改任何模擬器狀態。</div>`;
    } catch (error) {
      app.innerHTML = `<div class="panel error-box">資料載入失敗：${escapeHtml(error.message)}<br>請確認你是透過 GitHub Pages 網址開啟，而不是直接使用 file://。</div>`;
    }
  }

  async function renderRoute() {
    if (!catalog) return;
    const pageId = currentPageId();
    if (!pageId) {
      renderHome();
      return;
    }

    const item = catalog.items.find(entry => entry.id === pageId && entry.status === "ready");
    if (!item) {
      setRoute("", true);
      return;
    }

    if (item.id === "light-sanctum-pray-exp") {
      await renderLightSanctum(item);
      return;
    }

    renderHome();
  }

  async function init() {
    initTheme();
    navBack.textContent = "主選單";
    app.innerHTML = `<div class="panel loading">正在載入資訊中心…</div>`;
    try {
      catalog = await fetchJson("data/catalog.json");
      await renderRoute();
    } catch (error) {
      setNav("");
      app.innerHTML = `<div class="panel error-box">資訊中心載入失敗：${escapeHtml(error.message)}<br>請使用 GitHub Pages 測試網址開啟。</div>`;
    }
  }

  window.addEventListener("popstate", renderRoute);
  init();
})();
