(() => {
  "use strict";

  const root = document.documentElement;
  const app = document.getElementById("app");
  const navBack = document.getElementById("nav-back");
  const navTitle = document.getElementById("nav-title");
  const themeToggle = document.getElementById("theme-toggle");
  const nf = new Intl.NumberFormat("zh-TW");
  let catalog = null;
  let routeRevision = 0;
  let routeRequest = null;
  let catalogRequest = null;

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

  async function fetchJson(path, signal) {
    const r = await fetch(path, { cache: "no-store", signal });
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
    document.getElementById("nav-back-label").textContent = detail ? "資訊首頁" : "主選單";
    const current = navTitle.parentElement;
    detail ? current.setAttribute("aria-current", "page") : current.removeAttribute("aria-current");
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
        unlock.push(`${level.slotCount}個欄位`);
        unlock.push(`${level.presetCount}組預設`);
      } else {
        if (Number(level.slotCount) > Number(prev.slotCount)) unlock.push(`第${level.slotCount}個欄位`);
        if (Number(level.presetCount) > Number(prev.presetCount)) unlock.push(`第${level.presetCount}組預設`);
      }

      return {
        ...level,
        expToNext: next ? Number(next.needPoint) - Number(level.needPoint) : null,
        expPerPray: Number(level.gainPoint || 0) + Number(level.gainPointPerCoin || 0) * coin,
        unlockText: unlock.length ? unlock.join(" ") : "—",
        unlockParts: unlock,
        hasUnlock: unlock.length > 0
      };
    });
  }

  function renderHome() {
    app.setAttribute("aria-busy", "false");
    root.classList.remove("is-light-sanctum-page");
    setNav("");
    document.title = "也許有用的資訊｜楓之谷M 也許有用的工具";
    const rows = catalog.items.map(item => {
      const ready = item.status === "ready";
      return `<button class="info-row" type="button" data-page="${esc(item.id)}" ${ready ? "" : "disabled"}><span class="info-icon" aria-hidden="true">${esc(item.icon)}</span><span class="info-copy"><span class="info-title">${esc(item.title)}</span><span class="info-subtitle">${esc(item.subtitle)}</span></span><span class="status-pill ${ready ? "" : "soon"}">${ready ? "查看" : "準備中"}</span></button>`;
    }).join("");

    app.innerHTML = `<section class="glass-panel hero-compact"><div class="eyebrow">MapleStory M · Data Library</div><h2>也許有用的資訊</h2><p>遊戲內成長需求、等級門檻與系統資料。以簡單的一列式資訊為主，方便手機查詢與保存。</p></section><section class="info-list" aria-label="資訊分類">${rows}</section>`;
    app.querySelectorAll("[data-page]:not(:disabled)").forEach(b => b.addEventListener("click", () => setRoute(b.dataset.page)));
  }

  function renderDataRows(rows) {
    return rows.map(r => `<div role="row" class="data-row ${r.hasUnlock ? "is-milestone" : ""}"><div role="rowheader" class="data-cell data-level">Lv.${r.level}</div><div role="cell" class="data-cell">${fmt(r.expToNext)}</div><div role="cell" class="data-cell">${fmt(r.needPoint)}</div><div role="cell" class="data-cell">${fmt(r.expPerPray)}</div><div role="cell" class="data-cell data-unlock">${r.hasUnlock ? `<span class="unlock-mark"><span class="unlock-copy">${r.unlockParts.map(part => `<span class="unlock-part">${esc(part)}</span>`).join(" ")}</span></span>` : "—"}</div></div>`).join("");
  }

  function glassLayers() {
    return `<div class="liquid_glass-cover" aria-hidden="true"></div><div class="liquid_glass-sharp" aria-hidden="true"></div><div class="liquid_glass-reflect" aria-hidden="true"></div>`;
  }

  function showLoadError(label, retry) {
    app.setAttribute("aria-busy", "false");
    app.innerHTML = `<div class="glass-panel error-box"><p>${esc(label)}載入失敗，請確認連線後重試。</p><button class="action-btn retry-btn" type="button" data-retry="${retry}">重新載入</button></div>`;
  }

  async function renderLightSanctum(item, revision, controller) {
    root.classList.add("is-light-sanctum-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    app.setAttribute("aria-busy", "true");

    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      const rows = derivedRows(Array.isArray(data.levels) ? data.levels : []);
      if (!rows.length) throw new Error("找不到等級資料");

      app.innerHTML = `<section class="hero-compact liquid-surface-card glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Light Sanctum</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn" type="button">儲存圖片</button></div></div></section><section class="data-section glass-surface" role="table" aria-label="光之聖所祈禱經驗表">${glassLayers()}<div class="data-header" role="row"><div role="columnheader">等級</div><div role="columnheader"><span class="header-phrase">升等所需</span><span class="header-phrase">經驗</span></div><div role="columnheader">累積經驗</div><div role="columnheader">聖痕結晶</div><div role="columnheader">解鎖內容</div></div>${renderDataRows(rows)}</section><section class="note-panel liquid-surface-card glass-surface">${glassLayers()}<div class="liquid-surface-content note-surface-content"><p class="note-only"><span class="note-version">遊戲版本 ${esc(data.gameVersion)}</span><span class="note-detail">${esc(data.verificationNotice)}</span></p></div></section>`;
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("資料載入失敗", e);
      showLoadError("資料", "page");
    }
  }

  async function renderRoute() {
    const revision = ++routeRevision;
    routeRequest?.abort();
    routeRequest = null;
    if (!catalog) return;
    const id = currentPageId();
    if (!id) { renderHome(); return; }
    const item = catalog.items.find(x => x.id === id && x.status === "ready");
    if (!item) { setRoute("", true); return; }
    if (item.id === "light-sanctum-pray-exp") {
      routeRequest = new AbortController();
      await renderLightSanctum(item, revision, routeRequest);
      return;
    }
    renderHome();
  }

  async function loadCatalog() {
    catalogRequest?.abort();
    const controller = new AbortController();
    catalogRequest = controller;
    app.innerHTML = `<div class="glass-panel loading">正在載入資訊中心…</div>`;
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson("data/catalog.json", controller.signal);
      if (controller.signal.aborted) return;
      catalog = data;
      await renderRoute();
    } catch (e) {
      if (controller.signal.aborted) return;
      root.classList.remove("is-light-sanctum-page");
      setNav("");
      console.error("資訊中心載入失敗", e);
      showLoadError("資訊中心", "catalog");
    }
  }

  addEventListener("popstate", renderRoute);
  app.addEventListener("click", event => {
    const button = event.target.closest("[data-retry]");
    if (!button) return;
    button.dataset.retry === "catalog" ? loadCatalog() : renderRoute();
  });
  initTheme();
  loadCatalog();
})();
