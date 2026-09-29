(() => {
  "use strict";

  const root = document.documentElement;
  const app = document.getElementById("app");
  const navBack = document.getElementById("nav-back");
  const navTitle = document.getElementById("nav-title");
  const themeToggle = document.getElementById("theme-toggle");
  const nf = new Intl.NumberFormat("zh-TW");
  let catalog = null;

  const isBetaPath = () => /\/beta\/game-info\/?/.test(location.pathname);
  const mainSiteUrl = () => isBetaPath() ? "../../" : "../";
  const currentPageId = () => new URL(location.href).searchParams.get("page") || "";

  function setTheme(theme) {
    theme === "dark" ? root.setAttribute("data-theme", "dark") : root.removeAttribute("data-theme");
    const dark = theme === "dark";
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
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  function esc(v) {
    return String(v ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setRoute(pageId, replace = false) {
    const u = new URL(location.href);
    pageId ? u.searchParams.set("page", pageId) : u.searchParams.delete("page");
    history[replace ? "replaceState" : "pushState"]({}, "", u);
    renderRoute();
  }

  function setNav(pageTitle = "") {
    const detail = Boolean(pageTitle);
    navTitle.textContent = detail ? pageTitle : "也許有用的資訊";
    navBack.textContent = detail ? "資訊首頁" : "主選單";
    navBack.onclick = detail ? () => setRoute("") : () => { location.href = mainSiteUrl(); };
  }

  const fmt = v => v == null ? "—" : nf.format(v);

  function derivedRows(levels) {
    return levels.map((level, index) => {
      const next = levels[index + 1] || null;
      const prev = levels[index - 1] || null;
      const coin = Number(level.upgradeCostAmount0 || 0) * Number(level.slotCount || 0);
      const unlock = [];

      if (index === 0) {
        unlock.push(`${level.slotCount} 個欄位`);
        unlock.push(`${level.presetCount} 組預設`);
      } else {
        if (Number(level.slotCount) > Number(prev.slotCount)) unlock.push(`第 ${level.slotCount} 個欄位`);
        if (Number(level.presetCount) > Number(prev.presetCount)) unlock.push(`第 ${level.presetCount} 組預設`);
      }

      return {
        ...level,
        expToNext: next ? Number(next.needPoint) - Number(level.needPoint) : null,
        expPerPray: Number(level.gainPoint || 0) + Number(level.gainPointPerCoin || 0) * coin,
        unlockText: unlock.length ? (index === 0 ? unlock.join("・") : `開放 ${unlock.join("・")}`) : "—",
        hasUnlock: unlock.length > 0
      };
    });
  }

  function renderHome() {
    root.classList.remove("is-light-sanctum-page");
    setNav("");
    document.title = "也許有用的資訊｜楓之谷M 也許有用的工具";
    const rows = catalog.items.map(item => {
      const ready = item.status === "ready";
      return `<button class="info-row" type="button" data-page="${esc(item.id)}" ${ready ? "" : "disabled"}><span class="info-icon" aria-hidden="true">${esc(item.icon)}</span><span class="info-copy"><span class="info-title">${esc(item.title)}</span><span class="info-subtitle">${esc(item.subtitle)}</span></span><span class="status-pill ${ready ? "" : "soon"}">${ready ? "查看" : "準備中"}</span></button>`;
    }).join("");

    app.innerHTML = `<section class="glass-panel hero-compact"><div class="eyebrow">MapleStory M · Data Library</div><h2>也許有用的資訊</h2><p>遊戲內成長需求、等級門檻與系統資料。以簡單的一列式資訊為主，方便手機查詢與保存。</p></section><section class="info-list" aria-label="資訊分類">${rows}</section><div class="footer">Beta V7-R1 · Turbulence Smoke Root Fix。</div>`;
    app.querySelectorAll("[data-page]:not(:disabled)").forEach(b => b.addEventListener("click", () => setRoute(b.dataset.page)));
  }

  function renderDataRows(rows) {
    return rows.map(r => `<div class="data-row ${r.hasUnlock ? "is-milestone" : ""}"><div class="data-cell data-level">Lv.${r.level}</div><div class="data-cell">${fmt(r.expToNext)}</div><div class="data-cell">${fmt(r.needPoint)}</div><div class="data-cell">${fmt(r.expPerPray)}</div><div class="data-cell data-unlock">${r.hasUnlock ? `<span class="unlock-mark">${esc(r.unlockText)}</span>` : "—"}</div></div>`).join("");
  }

  function glassLayers() {
    return `<div class="liquid_glass-outer" aria-hidden="true"></div><div class="liquid_glass-cover" aria-hidden="true"></div><div class="liquid_glass-sharp" aria-hidden="true"></div><div class="liquid_glass-reflect" aria-hidden="true"></div>`;
  }

  async function renderLightSanctum(item) {
    root.classList.add("is-light-sanctum-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;

    try {
      const data = await fetchJson(item.data);
      const rows = derivedRows(Array.isArray(data.levels) ? data.levels : []);
      if (!rows.length) throw new Error("找不到等級資料");

      app.innerHTML = `<section class="hero-compact liquid-surface-card" data-liquid-refraction>${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Light Sanctum</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn" type="button">儲存 / 分享表格圖片</button></div></div></section><section class="data-section" data-liquid-refraction aria-label="光之聖所祈禱經驗表">${glassLayers()}<div class="data-header" aria-hidden="true"><div>等級</div><div>升等所需經驗</div><div>累積經驗</div><div>聖痕結晶</div><div>解鎖內容</div></div>${renderDataRows(rows)}</section><section class="note-panel liquid-surface-card" data-liquid-refraction>${glassLayers()}<div class="liquid-surface-content note-surface-content"><p class="note-only">遊戲版本 2026-09。數據來源部分尚未於遊戲內正式驗證，實際請以遊戲內顯示為主。</p></div></section><div class="footer">Beta V21-P4C · 測試版。</div>`;
    } catch (e) {
      app.innerHTML = `<div class="glass-panel error-box">資料載入失敗：${esc(e.message)}<br>請確認你是透過 GitHub Pages 網址開啟。</div>`;
    }
  }

  async function renderRoute() {
    if (!catalog) return;
    const id = currentPageId();
    if (!id) { renderHome(); return; }
    const item = catalog.items.find(x => x.id === id && x.status === "ready");
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
    } catch (e) {
      setNav("");
      app.innerHTML = `<div class="glass-panel error-box">資訊中心載入失敗：${esc(e.message)}<br>請使用 GitHub Pages 測試網址開啟。</div>`;
    }
  }

  addEventListener("popstate", renderRoute);
  init();
})();
