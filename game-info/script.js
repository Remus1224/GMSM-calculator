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
  let hexaModeSwitch = null;
  let petFoodViewSwitch = null;
  let secondaryWeaponGradeSwitch = null;
  let runeRequirementsSwitch = null;
  let starforceRequirementsSwitch = null;
  let cleanupSecondaryWeaponMobile = () => {};
  let updateHexaModeIndicator = () => {};
  let cleanupTableRules = () => {};
  let cleanupHyperStatNumbers = () => {};
  let cleanupFlameNumbers = () => {};

  const mainSiteUrl = () => "../";
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
    u.searchParams.delete("core");
    u.searchParams.delete("view");
    u.searchParams.delete("from");
    if (pageId !== "secondary-weapon") u.searchParams.delete("grade");
    if (pageId !== "helos-seal") {
      u.searchParams.delete("floor");
      u.searchParams.delete("range");
    }
    if (pageId !== "rune-requirements") u.searchParams.delete("type");
    if (pageId !== "starforce-requirements") u.searchParams.delete("cost");
    if (pageId !== "hyper-stat-requirements") u.searchParams.delete("stat");
    if (pageId !== "flame-expectations") {
      u.searchParams.delete("ability");
      u.searchParams.delete("goal");
    }
    history[replace ? "replaceState" : "pushState"]({}, "", u);
    renderRoute();
  }

  function setNav(pageTitle = "") {
    const detail = Boolean(pageTitle);
    const fromMenu = detail && currentPageId() === "pet-food" && new URL(location.href).searchParams.get("from") === "menu";
    navTitle.textContent = detail ? pageTitle : "也許有用的資訊";
    document.getElementById("nav-back-label").textContent = detail && !fromMenu ? "資訊首頁" : "主選單";
    const current = navTitle.parentElement;
    detail ? current.setAttribute("aria-current", "page") : current.removeAttribute("aria-current");
    navBack.onclick = detail && !fromMenu ? () => setRoute("") : () => { location.href = mainSiteUrl(); };
    const analyticsPage = detail ? currentPageId() : root.classList.contains("is-info-home") ? "home" : "";
    window.GMSMAnalytics?.viewInfo(analyticsPage, detail ? pageTitle : "也許有用的資訊", new URL(location.href).searchParams.get("view"));
  }

  const fmt = v => v == null ? "—" : nf.format(v);

  function syncPageStyles() {
    const glass = window.GMSMGlass;
    app.querySelectorAll(".glass-panel,.info-row,.hero-compact,.data-section,.note-panel,.hexa-title-card,.hexa-body-card,.hexa-mode-control,.hexa-mode-indicator,.hieros-table-frame,.hieros-stat-card,.hieros-hint,.genesis-info-total-card,.genesis-info-attack-total,.pet-food-summary-card").forEach(surface => {
      if (surface.classList.contains("requirements-panel")) return;
      glass.decorate(surface);
      surface.classList.add("site-card");
      const role = surface.matches(".info-row") ? (surface.disabled ? "static" : "entry") : "info";
      glass.setCardRole(surface, role);
    });
    app.querySelectorAll(".hero-compact").forEach(heading => {
      heading.classList.add("site-content-heading");
      heading.dataset.headingLayout = heading.querySelector(".hero-surface-content") ? "compact" : "intro";
    });
    for (const [selector, shared] of [[".hero-surface-content", "site-heading-content"], [".hero-copy", "site-heading-copy"], [".hero-actions", "site-heading-actions"], [".eyebrow", "site-heading-kicker"]]) {
      app.querySelectorAll(selector).forEach(node => node.classList.add(shared));
    }
    app.querySelectorAll(".genesis-info-table,.constellation-table,.hieros-table,.hexa-table").forEach(node => node.classList.add("site-data-table"));
    app.querySelectorAll(".genesis-info-card-heading h3,.hieros-lookup-heading h3,.hieros-data h3,.pet-food-settings-title,.pet-food-panel-heading h3,.pet-food-price-reference > .liquid-surface-content > h3,.secondary-weapon-heading h3").forEach(node => node.classList.add("site-section-title"));
    app.querySelectorAll(".genesis-info-total dl,.hieros-stats").forEach(node => node.classList.add("site-stat-grid"));
    // Shared emphasis belongs to numeric content, not explanatory or unlocked-state cells.
    app.querySelectorAll(".hexa-level-row .hexa-current,.hexa-level-row .hexa-cumulative,.constellation-table tbody td,.pet-food-table tbody td,.data-row .data-cell:not(.data-level):not(.data-unlock),.genesis-info-table tbody td:not(:has(.genesis-info-material)),.genesis-info-table tfoot td:last-child,.genesis-info-total dd > span,.genesis-info-attack-total strong,.hieros-force-value,.hexa-table tfoot .hexa-total").forEach(node => node.classList.add("site-table-number"));
    app.querySelectorAll(".hieros-stat-card > .liquid-surface-content,.genesis-info-total dd").forEach(node => node.classList.add("site-stat-content"));
    app.querySelectorAll(".hieros-stats dd,.genesis-info-total dd").forEach(node => node.classList.add("site-stat-value"));
    app.querySelectorAll(".hexa-scroll,.hieros-scroll").forEach(node => node.classList.add("site-table-scroll"));
    app.querySelectorAll(".hexa-scroll-hint,.hieros-scroll-hint").forEach(node => {
      node.classList.add("site-scroll-hint");
      node.dataset.scrollAt = node.matches(".hexa-scroll-hint") || node.closest(".hieros-star") ? "wide" : "phone";
      node.setAttribute("data-export-exclude", "");
    });
    app.querySelectorAll(".genesis-info-alchemy-table tbody tr:last-child > *").forEach(cell => cell.classList.add("site-table-rule-block"));
    app.querySelectorAll(".action-btn").forEach(button => glass.decorateAction(button));
    glass.decorateControls(app);
    window.GMSMToolShell.spacing(app);
    app.querySelectorAll(".hexa-info-content,.secondary-weapon-content").forEach(content => window.GMSMToolShell.spacing(content));
    cleanupTableRules();
    cleanupTableRules = window.GMSMToolShell.tableRules(app);
  }

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
        characterCoinPerPray: coin,
        unlockText: unlock.length ? unlock.join(" ") : "—",
        unlockParts: unlock,
        hasUnlock: unlock.length > 0
      };
    });
  }

  function renderHome() {
    app.setAttribute("aria-busy", "false");
    root.classList.remove("is-info-home", "is-genesis-info-page", "is-light-sanctum-page", "is-hexa-page", "is-constellation-page", "is-hieros-page", "is-pet-food-page", "is-secondary-weapon-page", "is-starforce-requirements-page", "is-hyper-stat-requirements-page", "is-flame-expectations-page");
    root.classList.add("is-info-home");
    setNav("");
    document.title = "也許有用的資訊｜楓之谷M 也許有用的工具";
    const renderEntry = item => {
      const ready = item.status === "ready";
      return `<button class="info-row site-entry site-menu-entry" type="button" data-page="${esc(item.id)}" ${ready ? "" : "disabled"}><span class="site-entry-icon${item.iconStyle === "transparent" ? " site-entry-icon-transparent" : ""}" aria-hidden="true"><img src="${esc(item.icon)}" alt="" loading="lazy" decoding="async"></span><span class="site-entry-copy"><span class="site-entry-title">${esc(item.title)}</span></span></button>`;
    };
    const categories = catalog.categories || [{ id: "growth", title: "成長與強化" }];
    const groups = categories.map(category => {
      const items = catalog.items.filter(item => (item.category || "growth") === category.id);
      if (!items.length) return "";
      return `<section class="site-home-category" aria-labelledby="info-category-${esc(category.id)}"><div id="info-category-${esc(category.id)}" class="home-menu-category" role="heading" aria-level="2"><span>${esc(category.title)}</span><small>${items.length}</small></div><div class="info-list site-menu-grid">${items.map(renderEntry).join("")}</div></section>`;
    }).join("");

    app.innerHTML = `<section class="glass-panel hero-compact"><div class="info-home-heading"><span class="site-entry-icon info-home-icon" aria-hidden="true"><img src="${esc(catalog.icon)}" alt="" decoding="async"></span><div class="info-home-heading-copy"><div class="eyebrow">MapleStory M · Data Library</div><h2>${esc(catalog.title)}</h2></div></div></section>${groups}`;
    syncPageStyles();
    app.querySelectorAll("[data-page]:not(:disabled)").forEach(b => b.addEventListener("click", () => setRoute(b.dataset.page)));
  }

  function renderDataRows(rows) {
    return rows.map(r => `<div role="row" class="data-row ${r.hasUnlock ? "is-milestone site-table-rule-fill" : ""}"><div role="rowheader" class="data-cell data-level">Lv.${r.level}</div><div role="cell" class="data-cell">${fmt(r.expToNext)}</div><div role="cell" class="data-cell">${fmt(r.needPoint)}</div><div role="cell" class="data-cell">${fmt(r.characterCoinPerPray)}</div><div role="cell" class="data-cell data-unlock">${r.hasUnlock ? `<span class="unlock-mark"><span class="unlock-copy">${r.unlockParts.map(part => `<span class="unlock-part">${esc(part)}</span>`).join(" ")}</span></span>` : "—"}</div></div>`).join("");
  }

  function glassLayers() {
    return `<div class="liquid_glass-cover" aria-hidden="true"></div><div class="liquid_glass-sharp" aria-hidden="true"></div><div class="liquid_glass-reflect" aria-hidden="true"></div>`;
  }

  function showLoadError(label, retry) {
    app.setAttribute("aria-busy", "false");
    app.innerHTML = `<div class="glass-panel error-box"><p>${esc(label)}載入失敗，請確認連線後重試。</p><button class="action-btn retry-btn" type="button" data-retry="${retry}">重新載入</button></div>`;
    syncPageStyles();
  }

  async function renderLightSanctum(item, revision, controller) {
    root.classList.add("is-light-sanctum-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    syncPageStyles();
    app.setAttribute("aria-busy", "true");

    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      const rows = derivedRows(Array.isArray(data.levels) ? data.levels : []);
      if (!rows.length) throw new Error("找不到等級資料");

      app.innerHTML = `<section class="hero-compact liquid-surface-card glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Light Sanctum</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button">儲存圖片</button></div></div></section><section class="data-section glass-surface">${glassLayers()}<div class="liquid-surface-content site-table-frame-content"><div class="site-table-hover site-table-rules" role="table" aria-label="光之聖所祈禱經驗表"><div class="data-header" role="row"><div role="columnheader">等級</div><div role="columnheader"><span class="header-phrase">升等所需</span><span class="header-phrase">經驗</span></div><div role="columnheader">累積經驗</div><div role="columnheader">聖痕結晶</div><div role="columnheader">解鎖內容</div></div>${renderDataRows(rows)}</div></div></section><section class="note-panel site-note-compact-mobile liquid-surface-card glass-surface">${glassLayers()}<div class="liquid-surface-content note-surface-content"><p class="note-only"><span class="note-detail site-note-detail">${esc(window.GMSMToolShell.dataNote(data.verificationNotice, data.gameVersion))}</span></p></div></section>`;
      app.querySelector(".note-panel").classList.add("site-tool-version");
      syncPageStyles();
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("資料載入失敗", e);
      showLoadError("資料", "page");
    }
  }

  async function renderConstellation(item, revision, controller) {
    root.classList.add("is-constellation-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    syncPageStyles();
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      const steps = data.steps;
      if (!Array.isArray(steps) || !steps.length || steps[0].from !== 0 ||
          steps.at(-1).to !== 30 || steps.some((step, index) =>
            ![step.from, step.to, step.cost].every(Number.isSafeInteger) ||
            step.from < 0 || step.to <= step.from || step.cost < 1 ||
            (index > 0 && step.from !== steps[index - 1].to) ||
            (step.basis === "unlock" ? step.from !== 0 || step.to !== 1 :
              step.basis === "level" ? step.to !== step.from + 1 :
                step.basis !== "per-level" || step.from === 0))) {
        throw new Error("星座核心需求資料不完整");
      }
      let cumulative = 0;
      const rows = steps.map((step, index) => {
        const range = step.basis === "per-level";
        const transition = step.basis === "level" && step.to % 10 === 0;
        // Include opening Lv.1, then every upgrade through the row's target level.
        cumulative += step.cost * (step.to - step.from);
        return `<tr class="constellation-row${range ? " constellation-range site-table-rule-fill-row" : ""}${transition ? " constellation-transition" : ""}"><th id="constellation-step-${index}" scope="row" headers="constellation-levels"><span class="constellation-upgrade-group"><span class="constellation-start">${step.from === 0 ? "開啟" : `Lv.${step.from}`}</span><span class="constellation-arrow" aria-hidden="true">${range ? "～" : "→"}</span><span class="constellation-target">Lv.${step.to}</span></span></th><td class="constellation-cost" headers="constellation-step-${index} constellation-material constellation-current"><span class="constellation-cost-value">${fmt(step.cost)}</span></td><td class="constellation-cumulative" headers="constellation-step-${index} constellation-material constellation-cumulative">${fmt(cumulative)}</td></tr>`;
      }).join("");
      app.innerHTML = `<section class="hero-compact glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Constellation Core</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button">儲存圖片</button></div></div></section><section class="data-section glass-surface"><div class="liquid-surface-content site-table-frame-content"><table class="constellation-table site-table-hover site-table-rules" aria-label="${esc(data.title)}" aria-describedby="constellation-table-note"><colgroup><col class="constellation-upgrade-column"></colgroup><colgroup span="2"></colgroup><thead><tr class="constellation-material-row"><th id="constellation-levels" scope="col" rowspan="2">升級區間</th><th id="constellation-material" scope="colgroup" colspan="2">${esc(data.material)}</th></tr><tr class="constellation-demand-row"><th id="constellation-current" class="site-table-rule-join-start" scope="col" headers="constellation-material">單級</th><th id="constellation-cumulative" scope="col" headers="constellation-material" aria-label="累計至目標等級，包含開啟需求">累計</th></tr></thead><tbody>${rows}</tbody></table></div></section><section class="note-panel site-tool-version site-note-left site-note-compact-mobile glass-surface">${glassLayers()}<div class="liquid-surface-content note-surface-content"><p id="constellation-table-note" class="note-only">${esc(window.GMSMToolShell.dataNote(data.notice, data.gameVersion))}</p></div></section>`;
      syncPageStyles();
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("星座核心需求載入失敗", e);
      showLoadError("星座核心需求", "page");
    }
  }

  async function renderHieros(item, revision, controller) {
    root.classList.add("is-hieros-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    syncPageStyles();
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      const fields = ["starForce", "arcaneForce", "authenticForce"];
      const levels = data.levels;
      if (!Array.isArray(levels) || levels.length !== 500 || levels.some((level, index) =>
        level.floor !== index + 1 || fields.some(field => !Number.isSafeInteger(level[field]) || level[field] < 0))) {
        throw new Error("海洛斯樓層資料不完整");
      }
      // Each ability has its own change points; merge independently without estimates.
      const bands = Object.fromEntries(fields.map(field => {
        const segments = [];
        levels.forEach(level => {
          const previous = segments.at(-1);
          if (previous && previous.value === level[field]) previous.to = level.floor;
          else segments.push({ from: level.floor, to: level.floor, value: level[field] });
        });
        return [field, segments];
      }));
      const params = new URL(location.href).searchParams;
      const initialFloor = Number(params.get("floor"));
      let selectedFloor = Number.isInteger(initialFloor) && initialFloor >= 1 && initialFloor <= 500 ? initialFloor : 1;
      app.innerHTML = `<section class="hero-compact glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Hieros's Seal</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button" data-export-title="${esc(data.title)}" data-export-filename="${esc(data.title)}_1-500層">儲存圖片</button></div></div></section>
        <section class="data-section hieros-lookup glass-surface">${glassLayers()}<div class="liquid-surface-content hieros-lookup-content"><div class="hieros-lookup-heading"><h3>第<span id="hieros-current-floor"></span>層</h3><form id="hieros-lookup-form" class="simulator-settings-surface" data-export-exclude><label class="site-value-control" for="hieros-floor-input"><span class="hieros-floor-label">樓層</span><input id="hieros-floor-input" class="site-field" type="number" min="1" max="500" step="1" required inputmode="numeric" value="${selectedFloor}"></label><button class="action-btn site-important-action" type="submit">查詢</button></form></div><dl class="hieros-stats" aria-live="polite" aria-atomic="true">${fields.map((field, index) => { const label = ["裝備星力", "神秘之力", "真實之力"][index]; return `<div class="hieros-stat-card site-summary-card" data-ability="${field}"><dt title="${label}"><span class="hieros-ability-icon" aria-hidden="true"><img src="assets/hieros-force-icons.png" alt="" width="77" height="26"></span><span class="site-sr-only">${label}</span></dt><dd id="hieros-${field}"></dd></div>`; }).join("")}</dl><div class="hieros-hint site-summary-card"><p id="hieros-next-change"></p></div></div></section>
        <div class="hieros-tables-layout"><section class="data-section hieros-data hieros-star glass-surface">${glassLayers()}<div class="liquid-surface-content"><div class="hieros-table-toolbar"><h3><span class="hieros-section-letter" aria-hidden="true">A</span>建議裝備星力</h3><p id="hieros-star-scroll-hint" class="hieros-scroll-hint" data-export-exclude>左右滑動，每次查看兩張星力表。</p></div><div class="hieros-scroll hieros-star-scroll site-table-paged-scroll" role="region" tabindex="0" aria-label="A區星力表，手機每次左右滑動查看兩張完整表格"><div id="hieros-star-tables" class="hieros-ability-grid site-table-pages"></div></div></div></section>
        <div class="hieros-secondary-region"><p class="hieros-scroll-hint" data-export-exclude>左右滑動，每次查看完整的神秘或真實之力表。</p><div class="hieros-scroll hieros-secondary-scroll site-table-paged-scroll" role="region" tabindex="0" aria-label="B、C區神秘與真實之力表，手機每次左右滑動查看一組完整資料"><div class="hieros-secondary-grid site-table-pages"><section class="data-section hieros-data hieros-arcane glass-surface site-table-page">${glassLayers()}<div class="liquid-surface-content"><div class="hieros-table-toolbar"><h3><span class="hieros-section-letter" aria-hidden="true">B</span>建議神秘之力</h3></div><div id="hieros-arcane-table" class="hieros-ability-grid"></div></div></section><section class="data-section hieros-data hieros-authentic glass-surface site-table-page">${glassLayers()}<div class="liquid-surface-content"><div class="hieros-table-toolbar"><h3><span class="hieros-section-letter" aria-hidden="true">C</span>建議真實之力</h3></div><div id="hieros-authentic-table" class="hieros-ability-grid"></div></div></section></div></div>
        <section class="note-panel site-tool-version site-note-left site-note-compact-mobile hieros-source-note glass-surface">${glassLayers()}<div class="liquid-surface-content"><p id="hieros-table-note"><span class="note-detail">${esc(window.GMSMToolShell.dataNote(data.notice, data.gameVersion))}</span></p></div></section></div></div>`;
      const input = app.querySelector("#hieros-floor-input");
      const labels = { starForce: "星力", arcaneForce: "神秘之力", authenticForce: "真實之力" };
      const floorLabel = band => band.from === band.to ? String(band.from) : `${band.from}～${band.to}`;
      function abilityTable(field, segments) {
        const rows = segments.map(band => {
          const active = selectedFloor >= band.from && selectedFloor <= band.to;
          return `<tr class="hieros-row${active ? " is-selected" : ""}" data-from="${band.from}" data-to="${band.to}"><th scope="row"${active ? ' aria-current="true"' : ""}>${floorLabel(band)}</th><td class="hieros-force-value">${fmt(band.value)}</td></tr>`;
        }).join("");
        return `<div class="hieros-table-frame glass-surface">${glassLayers()}<div class="liquid-surface-content site-table-frame-content"><table class="hieros-table site-table-hover site-table-rules" data-ability="${field}" aria-label="建議${labels[field]}，第${segments[0].from}至${segments.at(-1).to}層" aria-describedby="hieros-table-note"><caption>第${segments[0].from}～${segments.at(-1).to}層</caption><colgroup><col class="hieros-floor-column"><col></colgroup><thead><tr><th scope="col">樓層區間</th><th scope="col">${labels[field]}</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
      }
      function abilityColumns(field, segments, count, target) {
        const baseRows = Math.floor(segments.length / count);
        const extraRows = segments.length % count;
        let offset = 0;
        const columns = Array.from({ length: count }, (_, index) => {
          const size = baseRows + (index < extraRows ? 1 : 0);
          const table = abilityTable(field, segments.slice(offset, offset + size));
          offset += size;
          return table;
        });
        if (field === "starForce") {
          const pages = [];
          for (let index = 0; index < columns.length; index += 2) {
            pages.push(`<div class="hieros-star-page site-table-page site-table-page-grid" role="group" aria-label="星力區間第${index + 1}至${Math.min(index + 2, columns.length)}張表">${columns.slice(index, index + 2).join("")}</div>`);
          }
          target.innerHTML = pages.join("");
        } else {
          target.innerHTML = columns.join("");
        }
        target.dataset.columns = count;
        target.style.setProperty("--hieros-columns", count);
      }
      function updateView() {
        const level = levels[selectedFloor - 1];
        const nextChange = Math.min(...fields.map(field => bands[field].find(band => band.from <= selectedFloor && band.to >= selectedFloor).to + 1));
        input.value = String(selectedFloor);
        app.querySelector("#hieros-current-floor").textContent = selectedFloor;
        fields.forEach(field => { app.querySelector(`#hieros-${field}`).textContent = fmt(level[field]); });
        app.querySelector("#hieros-next-change").innerHTML = nextChange <= 500
          ? `<span>下一次能力變動</span><strong>第${fmt(nextChange)}層</strong>`
          : "1～500層內沒有後續能力變動。";
        abilityColumns("starForce", bands.starForce, Math.ceil(bands.starForce.length / 25), app.querySelector("#hieros-star-tables"));
        abilityColumns("arcaneForce", bands.arcaneForce, 1, app.querySelector("#hieros-arcane-table"));
        abilityColumns("authenticForce", bands.authenticForce, 1, app.querySelector("#hieros-authentic-table"));
        const url = new URL(location.href);
        url.searchParams.set("floor", selectedFloor);
        url.searchParams.delete("range");
        history.replaceState({}, "", url);
        syncPageStyles();
      }
      app.querySelector("#hieros-lookup-form").addEventListener("submit", event => {
        event.preventDefault();
        const floor = Number(input.value);
        if (!input.reportValidity() || !Number.isInteger(floor) || floor < 1 || floor > 500) return;
        selectedFloor = floor;
        updateView();
      });
      updateView();
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("海洛斯資料載入失敗", e);
      showLoadError("海洛斯資料", "page");
    }
  }

  const hexaMaterials = [
    { id: "sol", label: "氣息" },
    { id: "fragments", label: "碎片" }
  ];

  const hexaModes = [
    { id: "current", label: "單級" },
    { id: "cumulative", label: "累積" },
    { id: "combined", label: "綜合" }
  ];
  const hexaModeKey = "msm-game-info-hexa-mode";
  const hexaColumns = mode => mode === "combined" ? ["current", "cumulative"] : [mode];

  function savedHexaMode() {
    try {
      const saved = localStorage.getItem(hexaModeKey);
      if (hexaModes.some(mode => mode.id === saved)) return saved;
    } catch (_) {}
    return "combined";
  }

  function cleanupHexaModeControl() {
    hexaModeSwitch?.destroy();
    hexaModeSwitch = null;
    updateHexaModeIndicator = () => {};
  }

  function mountHexaModeControl() {
    cleanupHexaModeControl();
    const nav = app.querySelector(".hexa-mode-control");
    hexaModeSwitch = window.GMSMViewSwitch.mount(nav, { indicator: nav.querySelector(".hexa-mode-indicator") });
    updateHexaModeIndicator = () => hexaModeSwitch?.refresh();
  }

  function hexaRows(types, mode) {
    const columns = hexaColumns(mode);
    const totals = types.map(() => ({ sol: 0, fragments: 0 }));
    return Array.from({ length: 30 }, (_, index) => {
      const level = index + 1;
      const cells = types.map((type, family) => {
        hexaMaterials.forEach(material => { totals[family][material.id] += type[material.id][level]; });
        const costs = hexaMaterials.map(material => columns.map(column => {
          const resource = material.id;
          const value = column === "current" ? type[resource][level] : totals[family][resource];
          const group = `hexa-${type.id}-${resource}`;
          const columnHeader = mode === "combined" ? ` ${group}-${column}` : "";
          const divider = column === columns[0] && resource === "fragments" ? " hexa-material-divider" : "";
          const edge = resource === "sol" && column === columns[0] ? " site-table-rule-start" : resource === "fragments" && column === columns.at(-1) ? " site-table-rule-end" : "";
          return `<td class="hexa-${column}${divider}${edge}" data-core="${esc(type.id)}" data-resource="${resource}" headers="hexa-lv-${level} hexa-${type.id} ${group}${columnHeader}"><span class="hexa-cost-value">${fmt(value)}</span></td>`;
        }).join("")).join("");
        return `<td class="hexa-gap site-table-hover-gap" aria-hidden="true" role="presentation"></td>` + (type.id === "skill" && level === 1
          ? `<td colspan="${columns.length * 2}" class="hexa-unlocked site-table-rule-start site-table-rule-end" data-core="skill" headers="hexa-lv-1 hexa-skill">轉職時開放</td>`
          : costs);
      }).join("");
      return `<tr class="hexa-level-row ${level % 10 === 0 ? "is-milestone" : ""}"><th id="hexa-lv-${level}" scope="row" class="data-level site-table-rule-start site-table-rule-end">Lv.${level}</th>${cells}</tr>`;
    }).join("");
  }

  function hexaTable(types, mode) {
    const columns = hexaColumns(mode);
    const combined = mode === "combined";
    const span = columns.length * 2;
    const titleCard = title => `<div class="hexa-title-card glass-surface">${glassLayers()}<div class="liquid-surface-content">${esc(title)}</div></div>`;
    const gap = `<th class="hexa-gap site-table-hover-gap" aria-hidden="true" role="presentation"></th>`;
    const titles = `<div class="hexa-family-headings" aria-hidden="true"><span></span>${types.map(type => titleCard(type.title)).join("")}</div>`;
    const headers = types.map(type => `${gap}<th id="hexa-${type.id}" scope="colgroup" colspan="${span}"><span class="site-sr-only">${esc(type.title)}</span></th>`).join("");
    const bodySurfaces = Array.from({ length: 5 }, () => `<div class="hexa-body-card glass-surface">${glassLayers()}</div>`).join("");
    const materialHeaders = types.map(type => `<th class="hexa-gap site-table-hover-gap" rowspan="${combined ? 2 : 1}" aria-hidden="true" role="presentation"></th>` + hexaMaterials.map(material => `<th id="hexa-${type.id}-${material.id}" scope="${combined ? "colgroup" : "col"}" colspan="${columns.length}" class="${material.id === "fragments" ? "hexa-material-divider site-table-rule-end" : "site-table-rule-start"}" headers="hexa-${type.id}">${esc(material.label)}</th>`).join("")).join("");
    const demandHeaders = types.map(type => hexaMaterials.map(material => columns.map(column => {
      const group = `hexa-${type.id}-${material.id}`;
      const divider = column === columns[0] && material.id === "fragments" ? "hexa-material-divider" : "";
      const edge = material.id === "sol" && column === columns[0] ? " site-table-rule-start" : material.id === "fragments" && column === columns.at(-1) ? " site-table-rule-end" : "";
      const label = hexaModes.find(mode => mode.id === column).label;
      return `<th id="${group}-${column}" scope="col" class="hexa-${column} ${divider}${edge}" headers="hexa-${type.id} ${group}"><span class="hexa-cost-value">${label}</span></th>`;
    }).join("")).join("")).join("");
    const label = hexaModes.find(option => option.id === mode).label;
    const totals = combined ? "" : types.map(type => `<td class="hexa-gap site-table-hover-gap" aria-hidden="true" role="presentation"></td>` + hexaMaterials.map(material => {
      const group = `hexa-${type.id}-${material.id}`;
      const total = type[material.id].reduce((sum, value) => sum + value, 0);
      return columns.map(column => {
        const divider = material.id === "fragments" && column === columns[0] ? " hexa-material-divider" : "";
        const edge = material.id === "sol" && column === columns[0] ? " site-table-rule-start" : material.id === "fragments" && column === columns.at(-1) ? " site-table-rule-end" : "";
        return `<td class="hexa-total hexa-${column}${divider}${edge}" data-core="${type.id}" data-resource="${material.id}" headers="hexa-total-label hexa-${type.id} ${group}"><span class="hexa-cost-value">${fmt(total)}</span></td>`;
      }).join("");
    }).join("")).join("");
    return `<div class="hexa-body-surfaces" aria-hidden="true">${bodySurfaces}</div>${titles}<table class="hexa-table site-table-hover site-table-hover-segmented site-table-rules site-table-framed" aria-label="六轉核心需求表，${label}" aria-describedby="hexa-table-note"><colgroup><col class="hexa-level-column"></colgroup>${types.map(() => `<colgroup><col class="hexa-gap-column"></colgroup><colgroup span="${span}"></colgroup>`).join("")}<thead><tr class="hexa-family-row"><th scope="col"><span class="hexa-family-label">等級</span></th>${headers}</tr><tr class="hexa-material-row site-table-rule-fill-row"><th scope="col" rowspan="${combined ? 2 : 1}" class="hexa-level-heading site-table-rule-block"><div class="hexa-level-label">等級</div></th>${materialHeaders}</tr>${combined ? `<tr class="hexa-demand-row site-table-rule-fill-row">${demandHeaders}</tr>` : ""}</thead><tbody>${hexaRows(types, mode)}</tbody>${combined ? "" : `<tfoot><tr class="site-table-rule-fill-row"><th id="hexa-total-label" scope="row" class="site-table-rule-start site-table-rule-end">合計</th>${totals}</tr></tfoot>`}</table>`;
  }

  function hexaMobileTable(types, mode) {
    const columns = hexaColumns(mode);
    const combined = mode === "combined";
    const modeLabel = hexaModes.find(option => option.id === mode).label;
    const frame = table => `<div class="hexa-body-card glass-surface">${glassLayers()}<div class="liquid-surface-content site-table-frame-content">${table}</div></div>`;
    const levelRows = Array.from({ length: 30 }, (_, index) => `<tr class="hexa-level-row ${(index + 1) % 10 === 0 ? "is-milestone" : ""}"><th scope="row" class="data-level">Lv.${index + 1}</th></tr>`).join("");
    const levels = `<div class="hexa-mobile-levels"><span aria-hidden="true"></span>${frame(`<table class="hexa-mobile-table hexa-mobile-level-table site-data-table site-table-rules site-table-framed" aria-label="固定等級欄"><thead><tr><th scope="col">等級</th></tr></thead><tbody>${levelRows}</tbody>${combined ? "" : '<tfoot><tr class="site-table-rule-fill-row"><th scope="row">合計</th></tr></tfoot>'}</table>`)}</div>`;
    const core = type => {
      const prefix = `hexa-mobile-${type.id}`;
      const totals = { sol: 0, fragments: 0 };
      const materialHeaders = hexaMaterials.map(material => `<th id="${prefix}-${material.id}" scope="${combined ? "colgroup" : "col"}" colspan="${columns.length}">${esc(material.label)}</th>`).join("");
      const demandHeaders = hexaMaterials.map(material => columns.map(column => `<th id="${prefix}-${material.id}-${column}" scope="col" headers="${prefix}-${material.id}">${hexaModes.find(option => option.id === column).label}</th>`).join("")).join("");
      const rows = Array.from({ length: 30 }, (_, index) => {
        const level = index + 1;
        hexaMaterials.forEach(material => { totals[material.id] += type[material.id][level]; });
        const cells = type.id === "skill" && level === 1
          ? `<td class="hexa-mobile-unlocked" colspan="${columns.length * 2}" aria-label="Lv.1 轉職時開放">轉職時開放</td>`
          : hexaMaterials.map(material => columns.map(column => {
              const value = column === "current" ? type[material.id][level] : totals[material.id];
              const label = hexaModes.find(option => option.id === column).label;
              return `<td class="hexa-${column}" headers="${prefix}-${material.id}${combined ? ` ${prefix}-${material.id}-${column}` : ""}" aria-label="Lv.${level} ${esc(material.label)}${label} ${fmt(value)}">${fmt(value)}</td>`;
            }).join("")).join("");
        return `<tr class="hexa-level-row" aria-label="Lv.${level}">${cells}</tr>`;
      }).join("");
      const totalRow = combined ? "" : `<tfoot><tr class="site-table-rule-fill-row">${hexaMaterials.map(material => `<td headers="${prefix}-${material.id}" aria-label="${esc(material.label)}合計 ${fmt(totals[material.id])}">${fmt(totals[material.id])}</td>`).join("")}</tr></tfoot>`;
      return `<div class="hexa-mobile-core"><div class="hexa-title-card glass-surface">${glassLayers()}<div class="liquid-surface-content">${esc(type.title)}</div></div>${frame(`<table class="hexa-mobile-table site-data-table site-table-hover site-table-rules site-table-framed" aria-label="${esc(type.title)}，${modeLabel}" aria-describedby="hexa-table-note"><thead><tr class="hexa-material-row site-table-rule-fill-row">${materialHeaders}</tr>${combined ? `<tr class="hexa-demand-row site-table-rule-fill-row">${demandHeaders}</tr>` : ""}</thead><tbody>${rows}</tbody>${totalRow}</table>`)}</div>`;
    };
    const pairs = [types.slice(0, 2), types.slice(2, 4)].map(pair => `<div class="site-table-page site-table-page-grid" role="group" aria-label="${pair.map(type => esc(type.title)).join("、")}">${pair.map(core).join("")}</div>`).join("");
    return `${levels}<div class="hexa-mobile-scroll site-table-scroll site-table-paged-scroll" tabindex="0" role="region" aria-label="核心需求，每次左右滑動查看兩個核心"><div class="site-table-pages">${pairs}</div></div>`;
  }

  async function renderHexa(item, revision, controller) {
    root.classList.add("is-hexa-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    syncPageStyles();
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      const ids = ["skill", "mastery", "enhance", "common"];
      if (!Array.isArray(data.types) || data.types.length !== ids.length ||
          ids.some(id => !data.types.some(type => type.id === id &&
            [type.sol, type.fragments].every(values => Array.isArray(values) && values.length === 31 &&
              values[0] === 0 && values.every(value => Number.isSafeInteger(value) && value >= 0))))) {
        throw new Error("核心需求資料不完整");
      }
      const types = ids.map(id => data.types.find(type => type.id === id));
      const mode = savedHexaMode();
      root.dataset.hexaMode = mode;
      const controls = hexaModes.map(option => `<button id="hexa-mode-${option.id}" type="button" role="tab" class="hexa-mode-button site-interaction-exempt ${option.id === mode ? "is-active" : ""}" data-hexa-mode="${option.id}" aria-selected="${option.id === mode}" tabindex="${option.id === mode ? 0 : -1}" aria-controls="hexa-matrix hexa-mobile-matrix">${option.label}</button>`).join("");
      app.innerHTML = `<div class="hexa-view-toolbar" data-export-exclude><div class="hexa-mode-control" role="tablist" aria-label="檢視模式"><span class="hexa-mode-indicator site-summary-card" aria-hidden="true"></span>${controls}</div><p class="hexa-scroll-hint"><span class="hexa-desktop-hint">表格可左右滑動，查看四種核心需求。</span><span class="hexa-mobile-hint">等級固定，每次左右滑動查看兩個核心。</span></p></div><div class="hexa-info-content site-tool-flow"><section class="hero-compact glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · HEXA Matrix</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button" data-export-title="${esc(data.title)}">儲存圖片</button></div></div></section><section class="data-section requirements-panel"><div class="hexa-scroll hexa-desktop-scroll" tabindex="0" aria-label="六轉核心需求表，可左右捲動"><div id="hexa-matrix" class="hexa-matrix" data-mode="${mode}" role="tabpanel" aria-labelledby="hexa-mode-${mode}">${hexaTable(types, mode)}</div></div><div id="hexa-mobile-matrix" class="hexa-mobile-matrix site-table-paged-layout" data-mode="${mode}" role="tabpanel" aria-labelledby="hexa-mode-${mode}" data-export-exclude>${hexaMobileTable(types, mode)}</div></section><section class="note-panel site-tool-version site-note-left site-note-compact-mobile glass-surface">${glassLayers()}<div class="liquid-surface-content note-surface-content"><p id="hexa-table-note" class="note-only">共通核心尚未開放，暫時採用韓服（KMSM）需求。<br class="site-note-mobile-break"><span class="site-note-version-inline">${esc(window.GMSMToolShell.dataNote("", data.source.gameVersion))}</span></p></div></section></div>`;
      function mountMobilePairs(pairIndex = 0) {
        const mobileScroll = app.querySelector(".hexa-mobile-scroll");
        mobileScroll.scrollLeft = pairIndex * Math.max(0, mobileScroll.scrollWidth - mobileScroll.clientWidth);
        mobileScroll.addEventListener("keydown", event => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const left = ["ArrowLeft", "Home"].includes(event.key) ? 0 : mobileScroll.scrollWidth - mobileScroll.clientWidth;
          mobileScroll.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        });
      }
      app.querySelector(".hexa-mode-control").addEventListener("click", event => {
        const button = event.target.closest("[data-hexa-mode]");
        const selected = hexaModes.find(option => option.id === button?.dataset.hexaMode);
        const matrix = app.querySelector(".hexa-matrix");
        if (!selected || matrix.dataset.mode === selected.id) return;
        const scroll = app.querySelector(".hexa-scroll");
        const fraction = scroll.scrollLeft / Math.max(1, scroll.scrollWidth - scroll.clientWidth);
        const mobileScroll = app.querySelector(".hexa-mobile-scroll");
        const pairIndex = mobileScroll.scrollLeft > (mobileScroll.scrollWidth - mobileScroll.clientWidth) / 2 ? 1 : 0;
        root.dataset.hexaMode = selected.id;
        matrix.dataset.mode = selected.id;
        matrix.setAttribute("aria-labelledby", button.id);
        matrix.innerHTML = hexaTable(types, selected.id);
        const mobileMatrix = app.querySelector(".hexa-mobile-matrix");
        mobileMatrix.dataset.mode = selected.id;
        mobileMatrix.setAttribute("aria-labelledby", button.id);
        mobileMatrix.innerHTML = hexaMobileTable(types, selected.id);
        app.querySelectorAll("[data-hexa-mode]").forEach(control => {
          control.setAttribute("aria-selected", String(control === button));
          control.classList.toggle("is-active", control === button);
          control.tabIndex = control === button ? 0 : -1;
        });
        try { localStorage.setItem(hexaModeKey, selected.id); } catch (_) {}
        syncPageStyles();
        updateHexaModeIndicator();
        scroll.scrollLeft = fraction * Math.max(0, scroll.scrollWidth - scroll.clientWidth);
        mountMobilePairs(pairIndex);
      });
      if (new URL(location.href).searchParams.has("core")) {
        const url = new URL(location.href);
        url.searchParams.delete("core");
        history.replaceState({}, "", url);
      }
      syncPageStyles();
      mountHexaModeControl();
      mountMobilePairs();
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("核心需求載入失敗", e);
      showLoadError("核心需求", "page");
    }
  }

  async function renderGenesis(item, revision, controller) {
    root.classList.add("is-genesis-info-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    syncPageStyles();
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      const { stages, alchemy, stone, assets } = data;
      if (!Array.isArray(stages) || !stages.length || stages.some(s => !Number.isSafeInteger(s.traces) || s.traces < 0) ||
          stages.reduce((sum, s) => sum + s.traces, 0) !== data.totalTraces ||
          ![alchemy.maxLevel, alchemy.afterimagesPerLevel, alchemy.mesosPerLevel, alchemy.firstLevelStones, alchemy.firstLevelAttack, alchemy.attackPerLevel, stone.afterimagesPerStone].every(n => Number.isSafeInteger(n) && n > 0)) {
        throw new Error("創世需求資料不完整");
      }
      const material = (src, name, amount) => `<span class="genesis-info-material"><img src="${esc(src)}" alt=""><span>${esc(name)}<b>× ${fmt(amount)}</b></span></span>`;
      const mesos = amount => amount % 100000000 === 0 ? `${fmt(amount / 100000000)}億` : fmt(amount);
      const totalCard = (src, name, amount, display = fmt(amount)) => `<div class="genesis-info-total-card site-summary-card"><dt>${esc(name)}</dt><dd aria-label="${esc(name)} ${fmt(amount)}"><img src="${esc(src)}" alt=""><span>${esc(display)}</span></dd></div>`;
      let cumulative = 0;
      const rows = stages.map(stage => {
        cumulative += stage.traces;
        const quest = esc(stage.name);
        return `<tr class="genesis-info-row"><th scope="row" title="${esc(stage.name)}" aria-label="${esc(stage.phase)}，${esc(stage.name)}"><span class="genesis-info-stage"><span class="genesis-info-phase">${esc(stage.phase)}</span><span class="genesis-info-quest">${quest}</span></span></th><td>${fmt(stage.traces)}</td><td>${fmt(cumulative)}</td></tr>`;
      }).join("");
      const totalAfterimages = (alchemy.maxLevel - 1) * alchemy.afterimagesPerLevel;
      const totalMesos = alchemy.maxLevel * alchemy.mesosPerLevel;
      const totalAttack = alchemy.firstLevelAttack + (alchemy.maxLevel - 1) * alchemy.attackPerLevel;
      app.innerHTML = `<section class="hero-compact glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Genesis</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button" data-export-title="${esc(data.title)}">儲存圖片</button></div></div></section>
        <div class="genesis-info-grid">
          <section class="data-section genesis-info-liberation"><div class="genesis-info-card-content site-table-frame-content"><header class="genesis-info-card-heading"><div><h3>各階段解放需求</h3><p>黑暗的痕跡</p></div></header><table class="genesis-info-table site-table-hover site-table-rules" aria-label="各階段解放需求"><colgroup><col style="width:52%"><col><col></colgroup><thead><tr><th scope="col">解放階段</th><th scope="col">本階需求</th><th scope="col">累積需求</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="site-table-rule-fill-row"><th scope="row">全部解放</th><td></td><td>${fmt(data.totalTraces)}</td></tr></tfoot></table></div></section>
          <section class="data-section genesis-info-alchemy"><div class="genesis-info-card-content site-table-frame-content"><header class="genesis-info-card-heading"><div><h3>創世再鍊成需求</h3><p>Lv.1～Lv.${alchemy.maxLevel}</p></div></header><table class="genesis-info-table genesis-info-alchemy-table site-table-hover site-table-rules" aria-label="創世再鍊成需求"><thead><tr><th scope="col">等級</th><th scope="col">材料</th><th scope="col">楓幣</th><th scope="col">攻擊力<br>增加</th></tr></thead><tbody><tr class="genesis-info-row"><th scope="row">Lv.1</th><td>${material(assets.stone, "創世鍊成石", alchemy.firstLevelStones)}</td><td title="${fmt(alchemy.mesosPerLevel)} 楓幣">${mesos(alchemy.mesosPerLevel)}</td><td class="genesis-info-attack">+${fmt(alchemy.firstLevelAttack)}</td></tr><tr class="genesis-info-row"><th scope="row">Lv.2～${alchemy.maxLevel}<small>每級需求</small></th><td>${material(assets.afterimage, "黑暗的殘像", alchemy.afterimagesPerLevel)}</td><td title="${fmt(alchemy.mesosPerLevel)} 楓幣">${mesos(alchemy.mesosPerLevel)}</td><td class="genesis-info-attack">+${fmt(alchemy.attackPerLevel)}</td></tr></tbody></table><div class="genesis-info-total"><h4>完成 Lv.${alchemy.maxLevel} 合計</h4><dl>${totalCard(assets.stone, "創世鍊成石", alchemy.firstLevelStones, `${fmt(alchemy.firstLevelStones)}顆`)}${totalCard(assets.afterimage, "黑暗的殘像", totalAfterimages)}${totalCard(assets.mesos, "楓幣", totalMesos, mesos(totalMesos))}</dl><div class="genesis-info-attack-total site-summary-card"><span>Lv.${alchemy.maxLevel} 累積攻擊力</span><strong id="genesis-info-total-attack">+${fmt(totalAttack)}</strong></div></div></div></section>
          <section class="data-section genesis-info-stone"><div class="genesis-info-card-content site-table-frame-content"><header class="genesis-info-card-heading"><div><h3>創世鍊成石需求</h3><p>每顆兌換需求</p></div></header><div class="genesis-info-exchange">${material(assets.afterimage, "黑暗的殘像", stone.afterimagesPerStone)}<span class="genesis-info-exchange-arrow" aria-label="兌換為">→</span>${material(assets.stone, "創世鍊成石", 1)}</div></div></section>
        </div><section class="note-panel site-tool-version site-note-left site-note-compact-mobile glass-surface">${glassLayers()}<div class="liquid-surface-content"><p>${esc(window.GMSMToolShell.dataNote(data.notice, data.source.gameVersion))}</p></div></section>`;
      syncPageStyles();
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("創世需求載入失敗", e);
      showLoadError("創世需求", "page");
    }
  }

  async function renderPetFood(item, revision, controller) {
    const initialView = new URL(location.href).searchParams.get("view") === "calculator" ? "calculator" : "table";
    const initialTitle = initialView === "calculator" ? "寵物食品計算機" : item.title;
    root.classList.add("is-pet-food-page");
    root.dataset.petFoodView = initialView;
    setNav(initialTitle);
    document.title = `${initialTitle}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    syncPageStyles();
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      if (!Array.isArray(data.levels) || !data.levels.length ||
          !Number.isSafeInteger(data.food?.experience) || data.food.experience <= 0) throw new Error("找不到寵物等級資料");
      const packSizes = data.food.packSizes;
      if (!Array.isArray(packSizes) || packSizes.length !== 2 || packSizes.some(size => !Number.isSafeInteger(size) || size <= 0)) throw new Error("寵物食品組合包資料不完整");
      const packageCards = packSizes.map(size => `<div class="pet-food-summary-card pet-food-package-card glass-surface">${glassLayers()}<div class="liquid-surface-content"><h3>${fmt(size)} 個兌換券</h3><div class="pet-food-price-field" data-export-exclude><label for="pet-food-pack-${size}-price">每包參考價格</label><input id="pet-food-pack-${size}-price" class="site-field site-glass-field" type="text" inputmode="decimal" maxlength="18" placeholder="請輸入" autocomplete="off" aria-describedby="pet-food-price-note pet-food-pack-${size}-cost"></div><div class="site-stat-content site-stat-value"><img src="${esc(data.food.icon)}" alt=""><span id="pet-food-pack-${size}-count">0 包</span></div><p id="pet-food-pack-${size}-surplus">兌換 0 個，剩餘 0 個</p><p id="pet-food-pack-${size}-cost">尚未輸入價格</p></div></div>`).join("");
      const priceLimitCards = packSizes.map(size => `<div class="pet-food-summary-card glass-surface">${glassLayers()}<div class="liquid-surface-content"><h3>${fmt(size)} 個兌換券</h3><div id="pet-food-pack-${size}-limit" class="site-stat-value">—</div><p>以下可考慮購買</p></div></div>`).join("");
      const firstLevel = data.levels[0].fromLevel;
      const lastLevel = data.levels.at(-1).toLevel;
      if (!Number.isSafeInteger(firstLevel) || data.levels.some((level, index) =>
        level.fromLevel !== firstLevel + index || level.toLevel !== level.fromLevel + 1 ||
        !Number.isSafeInteger(level.experience) || level.experience < 0)) throw new Error("寵物等級資料不完整");
      const levelOptions = selected => Array.from({ length: lastLevel - firstLevel + 1 }, (_, index) => {
        const level = firstLevel + index;
        return `<option value="${level}"${level === selected ? " selected" : ""}>Lv.${level}</option>`;
      }).join("");
      const petFields = Array.from({ length: 3 }, (_, index) => {
        const id = index + 1;
        return `<div class="pet-food-pet-row" data-pet="${id}"><label class="site-toggle-control pet-food-pet-toggle" for="pet-food-pet-${id}-enabled"><input id="pet-food-pet-${id}-enabled" type="checkbox"${index === 0 ? " checked" : ""} aria-label="將寵物 ${id} 加入計算"><span>寵物 ${id}</span></label><div class="pet-food-level-fields"><div><label class="site-sr-only" for="pet-food-pet-${id}-start">寵物 ${id} 起始等級</label><select id="pet-food-pet-${id}-start">${levelOptions(firstLevel)}</select></div><span class="pet-food-level-arrow" aria-hidden="true">→</span><div><label class="site-sr-only" for="pet-food-pet-${id}-target">寵物 ${id} 目標等級</label><select id="pet-food-pet-${id}-target">${levelOptions(lastLevel)}</select></div></div><p class="pet-food-pet-demand" id="pet-food-pet-${id}-demand"></p></div>`;
      }).join("");
      const splitAt = Math.ceil(data.levels.length / 2);
      const segments = [data.levels.slice(0, splitAt), data.levels.slice(splitAt)].filter(levels => levels.length);
      const tables = segments.map((levels, index) => {
        const segmentLabel = `Lv.${levels[0].fromLevel}～${levels[levels.length - 1].toLevel}`;
        const rows = levels.map(level => `<tr class="pet-food-row${[30, 40, 50].includes(level.toLevel) ? " pet-food-milestone site-table-rule-fill-row" : ""}"><th scope="row">Lv.${fmt(level.fromLevel)} → ${fmt(level.toLevel)}</th><td>${fmt(level.experience)}</td><td>${fmt(level.cumulativeExperience)}</td><td>${fmt(level.foodEquivalent)}</td><td>${fmt(level.cumulativeFoodEquivalent)}</td></tr>`).join("");
        const totalRow = index === segments.length - 1 ? `<tfoot><tr class="site-table-rule-fill-row"><th scope="row">合計</th><td colspan="2">${fmt(data.totalExperience)}</td><td colspan="2">${fmt(data.totalFoodEquivalent)}</td></tr></tfoot>` : "";
        return `<div class="pet-food-segment site-table-page">
          <table class="pet-food-table site-data-table site-table-hover site-table-rules site-table-framed"><caption class="site-sr-only">${esc(segmentLabel)} 經驗與食品需求；累積數量由 Lv.1 起計算至該列目標等級。</caption><colgroup><col class="pet-food-level-column"><col class="pet-food-exp-current-column"><col class="pet-food-exp-total-column"><col class="pet-food-food-current-column"><col class="pet-food-food-total-column"></colgroup>
            <thead><tr><th scope="col" rowspan="2">升級區間</th><th scope="colgroup" colspan="2">經驗</th><th scope="colgroup" colspan="2">食品數量（個）</th></tr><tr><th scope="col">本級</th><th scope="col">累積</th><th scope="col">本級</th><th scope="col">累積</th></tr></thead>
            <tbody>${rows}</tbody>${totalRow}
          </table></div>`;
      }).join("");
      app.innerHTML = `<div class="pet-food-view-switch site-view-switch" role="tablist" aria-label="寵物食品功能" data-export-exclude>
          <button id="pet-food-tab-table" class="site-view-tab site-interaction-exempt is-active" type="button" role="tab" aria-selected="true" aria-controls="pet-food-panel-table">需求表</button>
          <button id="pet-food-tab-calculator" class="site-view-tab site-interaction-exempt" type="button" role="tab" aria-selected="false" aria-controls="pet-food-panel-calculator" tabindex="-1">計算機</button>
        </div>
        <section class="hero-compact glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Pet Food</div><h2 id="pet-food-page-title">${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button">儲存圖片</button></div></div></section>
        <div id="pet-food-panel-table" class="pet-food-view-panel site-tool-flow" role="tabpanel" aria-labelledby="pet-food-tab-table">
          <section class="pet-food-summary site-stat-grid" aria-label="Lv.1 至 Lv.50 總需求">
            <div class="pet-food-summary-card glass-surface">${glassLayers()}<div class="liquid-surface-content site-stat-content"><h3>總需求經驗</h3><div class="site-stat-value">${fmt(data.totalExperience)}</div></div></div>
            <div class="pet-food-summary-card glass-surface">${glassLayers()}<div class="liquid-surface-content site-stat-content site-stat-value" aria-label="食品總需求；每個${esc(data.food.name)}提供 ${fmt(data.food.experience)} 經驗"><img src="${esc(data.food.icon)}" alt="${esc(data.food.name)}"><span>${fmt(data.totalFoodEquivalent)} 個</span></div></div>
          </section>
          <section class="data-section glass-surface">${glassLayers()}<div class="liquid-surface-content site-table-frame-content">
            <p class="site-scroll-hint" data-scroll-at="wide" data-export-exclude>左右滑動查看完整欄位</p>
            <div class="site-table-scroll pet-food-scroll site-table-paged-scroll" tabindex="0" role="region" aria-label="寵物食品需求表，每次左右滑動查看完整一段">
              <div class="pet-food-pages site-table-pages">${tables}</div>
            </div>
          </div></section>
        </div>
        <div id="pet-food-panel-calculator" class="pet-food-view-panel site-tool-flow" role="tabpanel" aria-labelledby="pet-food-tab-calculator" hidden data-export-exclude>
          <section class="data-section glass-surface">${glassLayers()}<div class="liquid-surface-content site-table-frame-content">
            <h3 class="pet-food-settings-title" data-export-exclude>寵物與庫存設定</h3>
            <div class="pet-food-settings-layout">
              <form id="pet-food-calculator-form" class="pet-food-calculator-form" data-export-exclude>
                <div class="pet-food-pet-header" aria-hidden="true"><span>加入計算</span><div class="pet-food-level-header"><span>起始等級</span><span></span><span>目標等級</span></div><span>食品需求</span></div>
                <div class="pet-food-pet-list">${petFields}</div>
              </form>
              <div class="pet-food-inventory-panel">
                <div class="pet-food-stock-field" data-export-exclude><label for="pet-food-owned-food">已持有食品</label><input id="pet-food-owned-food" form="pet-food-calculator-form" class="site-field site-glass-field" type="text" inputmode="numeric" maxlength="20" value="0" placeholder="0" autocomplete="off" aria-describedby="pet-food-stock-error"><span>個</span></div>
                <p id="pet-food-stock-error" class="pet-food-stock-error" role="alert" hidden data-export-exclude>請輸入 0 或正整數。</p>
                <div class="pet-food-settings-summary" role="status" aria-live="polite" aria-atomic="true">
                  <header class="pet-food-panel-heading"><h3 id="pet-food-calculator-range">合計需求（1 隻寵物）</h3><p id="pet-food-stock-balance" class="pet-food-stock-balance"></p></header>
                  <section id="pet-food-calculator-summary" class="pet-food-summary-card glass-surface" aria-label="食品需求與庫存">${glassLayers()}<div class="liquid-surface-content site-stat-content site-stat-value"><img src="${esc(data.food.icon)}" alt="${esc(data.food.name)}"><h3>缺少</h3><span id="pet-food-calculator-food">${fmt(data.totalFoodEquivalent)} 個</span></div></section>
                  <p id="pet-food-selected-ranges" class="pet-food-selected-ranges"></p>
                </div>
              </div>
            </div>
          </div></section>
          <div id="pet-food-calculator-result" class="pet-food-calculator-result site-tool-flow" role="status" aria-live="polite" aria-atomic="true">
            <section class="data-section pet-food-package-options glass-surface">${glassLayers()}<div class="liquid-surface-content site-table-frame-content">
              <header class="pet-food-panel-heading"><h3>組合包需求與價格</h3><p id="pet-food-price-note" class="pet-food-price-note">價格使用相同單位；包數為單買需求，總價僅供參考。</p></header><section class="pet-food-summary site-stat-grid" aria-label="各種組合包單獨購買時的需求包數、剩餘食品與參考總價">${packageCards}</section>
            </div></section>
            <section class="data-section pet-food-price-reference glass-surface">${glassLayers()}<div class="liquid-surface-content site-table-frame-content"><h3>購買價格參考</h3><p id="pet-food-reference-status">請輸入兩種組合包的參考價格。</p><section id="pet-food-price-limits" class="pet-food-summary site-stat-grid" aria-label="各種組合包的單包購買價格上限" hidden>${priceLimitCards}</section><p id="pet-food-reference-detail"></p></div></section>
          </div>
        </div>
        <section class="note-panel site-tool-version site-note-left site-note-compact-mobile glass-surface">${glassLayers()}<div class="liquid-surface-content"><p>遊戲版本 ${esc(data.gameVersion)}</p></div></section>`;
      app.querySelectorAll(".pet-food-level-fields select").forEach(field => window.GMSMGlass.decorateSelect(field, { fitContent: true })?.classList.add("site-select-centered"));
      syncPageStyles();
      // Measure the displayed strings once per font load. Both segments use the same column widths.
      const fitColumns = () => {
        if (revision !== routeRevision || controller.signal.aborted) return;
        const table = app.querySelector(".pet-food-table");
        if (!table || table.closest(".pet-food-view-panel")?.hidden) return;
        const probe = document.createElement("span");
        probe.className = "pet-food-size-probe";
        probe.setAttribute("aria-hidden", "true");
        probe.style.fontFamily = getComputedStyle(table).fontFamily;
        table.parentElement.append(probe);
        try {
          const room = 4 * (parseFloat(getComputedStyle(root).getPropertyValue("--site-space-field")) || 8);
          const measure = text => {
            probe.textContent = text;
            return Math.ceil(probe.getBoundingClientRect().width);
          };
          const shell = app.closest(".shell");
          const columns = [
            ["level", data.levels.map(level => `Lv.${fmt(level.fromLevel)} → ${fmt(level.toLevel)}`), "升級區間"],
            ["exp-current", data.levels.map(level => fmt(level.experience)), "本級"],
            ["exp-total", data.levels.map(level => fmt(level.cumulativeExperience)), "累積"],
            ["food-current", data.levels.map(level => fmt(level.foodEquivalent)), "本級"],
            ["food-total", data.levels.map(level => fmt(level.cumulativeFoodEquivalent)), "累積"]
          ];
          const widths = columns.map(([name, values, heading]) => {
            const width = Math.max(...values.map(measure)) + room;
            // Short numeric columns must also fit their two-character heading.
            return [name, Math.max(width, measure(heading) + 8)];
          });
          const totalWidth = widths.reduce((total, [, width]) => total + width, 0);
          for (const [name, width] of widths) {
            shell.style.setProperty(`--pet-food-${name}-width`, width + "px");
            // Mobile scales the same content-based proportions into one visible segment.
            shell.style.setProperty(`--pet-food-${name}-share`, (width / totalWidth * 100) + "%");
          }
        } finally {
          probe.remove();
        }
      };
      const pets = Array.from({ length: 3 }, (_, index) => {
        const id = index + 1;
        return { id, row: app.querySelector(`[data-pet="${id}"]`), enabled: app.querySelector(`#pet-food-pet-${id}-enabled`), start: app.querySelector(`#pet-food-pet-${id}-start`), target: app.querySelector(`#pet-food-pet-${id}-target`), demand: app.querySelector(`#pet-food-pet-${id}-demand`) };
      });
      let selectedPets = [];
      const stockInput = app.querySelector("#pet-food-owned-food");
      let inventory = { owned: 0, required: 0, missing: 0, valid: true };
      const exportButton = app.querySelector("#save-table-image");
      const viewNav = app.querySelector(".pet-food-view-switch");
      let activeView = "table";
      const updateExportTitle = () => {
        const title = activeView === "table" ? data.title : "寵物食品計算機";
        exportButton.dataset.exportTitle = title;
        exportButton.dataset.exportFilename = activeView === "table" ? `${title}_Lv${firstLevel}-${lastLevel}` : `${title}_${selectedPets.length}隻寵物`;
      };
      const priceInputs = new Map(packSizes.map(size => [size, app.querySelector(`#pet-food-pack-${size}-price`)]));
      // Compare unit costs as integer ratios; round purchase limits down to hundredths.
      const formatPrice = cents => {
        const decimal = (cents % 100n).toString().padStart(2, "0").replace(/0+$/, "");
        return fmt(cents / 100n) + (decimal ? "." + decimal : "");
      };
      const readPrice = input => {
        const raw = input.value.trim().replaceAll(",", "");
        if (!raw) return { state: "empty" };
        if (!/^(?:[0-9]+(?:[.][0-9]{0,2})?|[.][0-9]{1,2})$/.test(raw)) return { state: "invalid" };
        const [whole, fraction = ""] = raw.split(".");
        return { state: "valid", cents: BigInt(whole || "0") * 100n + BigInt(fraction.padEnd(2, "0")) };
      };
      const updatePriceComparison = food => {
        const prices = packSizes.map(size => {
          const input = priceInputs.get(size);
          const price = readPrice(input);
          input.setAttribute("aria-invalid", String(price.state === "invalid"));
          const cost = app.querySelector(`#pet-food-pack-${size}-cost`);
          if (price.state === "valid") cost.dataset.petFoodUnitPrice = formatPrice(price.cents);
          else delete cost.dataset.petFoodUnitPrice;
          cost.textContent = food === null ? "請先修正庫存數量" : price.state === "valid"
            ? `單買參考總價 ${formatPrice(BigInt(Math.ceil(food / size)) * price.cents)}`
            : price.state === "empty" ? "尚未輸入價格" : "請輸入非負價格，最多兩位小數。";
          return price;
        });
        const status = app.querySelector("#pet-food-reference-status");
        const limits = app.querySelector("#pet-food-price-limits");
        const detail = app.querySelector("#pet-food-reference-detail");
        limits.hidden = true;
        detail.textContent = "";
        for (const size of packSizes) app.querySelector(`#pet-food-pack-${size}-limit`).textContent = "—";
        if (food === null) {
          status.textContent = "請先修正已持有食品數量。";
          return;
        }
        if (food === 0) {
          status.textContent = !selectedPets.length ? "請先勾選要計算的寵物。" : inventory.required > 0 ? "庫存足夠，不需購買組合包。" : "不需購買組合包。";
          if (selectedPets.length) detail.textContent = `使用 ${fmt(inventory.required)} 個後，庫存剩餘 ${fmt(inventory.owned - inventory.required)} 個。`;
          return;
        }
        if (prices.some(price => price.state !== "valid")) {
          status.textContent = prices.some(price => price.state === "invalid") ? "請修正價格後再比較。" : "請輸入兩種組合包的參考價格。";
          return;
        }
        // Cross multiplication keeps the comparison exact, without rounding the unit price.
        const firstCost = prices[0].cents * BigInt(packSizes[1]);
        const secondCost = prices[1].cents * BigInt(packSizes[0]);
        const baseIndex = firstCost <= secondCost ? 0 : 1;
        const baseSize = BigInt(packSizes[baseIndex]);
        const basePrice = prices[baseIndex].cents;
        for (const size of packSizes) {
          const limit = basePrice * BigInt(size) / baseSize;
          app.querySelector(`#pet-food-pack-${size}-limit`).textContent = formatPrice(limit);
        }
        status.textContent = firstCost === secondCost
          ? "兩種組合包的每個食品成本相同，以此價格換算購買上限。"
          : `以 ${fmt(packSizes[baseIndex])} 個兌換券較低的每個食品成本，換算購買上限。`;
        detail.textContent = "其他賣家的單包價格不超過上述金額，即符合參考成本；請依實際庫存分批購買。";
        limits.hidden = false;
      };
      const updateCalculation = () => {
        selectedPets = [];
        for (const pet of pets) {
          const included = pet.enabled.checked;
          pet.start.disabled = !included;
          pet.target.disabled = !included;
          pet.row.classList.toggle("is-excluded", !included);
          const from = Number(pet.start.value);
          if (Number(pet.target.value) < from) pet.target.value = String(from);
          for (const option of pet.target.options) option.disabled = Number(option.value) < from;
          const to = Number(pet.target.value);
          const experience = data.levels.reduce((sum, level) => sum + (level.fromLevel >= from && level.toLevel <= to ? level.experience : 0), 0);
          const food = Math.ceil(experience / data.food.experience);
          pet.demand.textContent = included ? `${fmt(food)} 個` : "未計入";
          pet.demand.title = included ? `寵物 ${pet.id}：Lv.${from} → Lv.${to}` : "未加入計算";
          if (included) selectedPets.push({ id: pet.id, from, to, food });
        }
        // Round each pet independently: leftover experience cannot be transferred between pets.
        const food = selectedPets.reduce((sum, pet) => sum + pet.food, 0);
        const rawStock = stockInput.value.trim().replaceAll(",", "");
        const owned = rawStock === "" ? 0 : Number(rawStock);
        const validStock = (rawStock === "" || /^[0-9]+$/.test(rawStock)) && Number.isSafeInteger(owned) && owned >= 0;
        stockInput.setAttribute("aria-invalid", String(!validStock));
        app.querySelector("#pet-food-stock-error").hidden = validStock;
        const missing = validStock ? Math.max(0, food - owned) : null;
        inventory = { owned, required: food, missing, valid: validStock };
        for (const size of packSizes) {
          const packs = missing === null ? null : Math.ceil(missing / size);
          const totalFood = packs === null ? null : packs * size;
          app.querySelector(`#pet-food-pack-${size}-count`).textContent = `${fmt(packs)} 包`;
          app.querySelector(`#pet-food-pack-${size}-surplus`).textContent = missing === null ? "請先修正庫存數量" : `兌換 ${fmt(totalFood)} 個，剩餘 ${fmt(Math.max(0, inventory.owned + totalFood - inventory.required))} 個`;
        }
        app.querySelector("#pet-food-calculator-range").textContent = `合計需求（${selectedPets.length} 隻寵物）`;
        app.querySelector("#pet-food-selected-ranges").textContent = selectedPets.map(pet => `寵物 ${pet.id}：Lv.${pet.from} → Lv.${pet.to}`).join("；");
        app.querySelector("#pet-food-calculator-food").textContent = `${fmt(missing)} 個`;
        app.querySelector("#pet-food-stock-balance").textContent = validStock ? `總需求 ${fmt(food)} 個 · 已持有 ${fmt(owned)} 個` : `總需求 ${fmt(food)} 個 · 庫存數量待修正`;
        app.querySelector("#pet-food-calculator-summary").setAttribute("aria-label", `已選 ${selectedPets.length} 隻寵物，食品總需求 ${fmt(food)} 個，${validStock ? `已持有 ${fmt(owned)} 個，缺少 ${fmt(missing)} 個` : "庫存數量待修正"}`);
        updateExportTitle();
        updatePriceComparison(missing);
      };
      stockInput.addEventListener("input", updateCalculation);
      for (const input of priceInputs.values()) input.addEventListener("input", updateCalculation);
      for (const pet of pets) {
        for (const control of [pet.enabled, pet.start, pet.target]) control.addEventListener("change", updateCalculation);
      }
      app.querySelector("#pet-food-calculator-form").addEventListener("submit", event => { event.preventDefault(); updateCalculation(); });
      const setPetFoodView = (view, updateUrl = true) => {
        activeView = view === "calculator" ? "calculator" : "table";
        root.dataset.petFoodView = activeView;
        viewNav.querySelectorAll("[role=tab]").forEach(button => {
          const selected = button.id === `pet-food-tab-${activeView}`;
          button.setAttribute("aria-selected", String(selected));
          button.classList.toggle("is-active", selected);
          button.tabIndex = selected ? 0 : -1;
          const panel = app.querySelector(`#${button.getAttribute("aria-controls")}`);
          panel.hidden = !selected;
          panel.toggleAttribute("data-export-exclude", !selected);
        });
        if (updateUrl) {
          const url = new URL(location.href);
          activeView === "calculator" ? url.searchParams.set("view", "calculator") : url.searchParams.delete("view");
          history.replaceState({}, "", url);
        }
        const title = activeView === "table" ? data.title : "寵物食品計算機";
        app.querySelector("#pet-food-page-title").textContent = title;
        setNav(title);
        document.title = `${title}｜也許有用的資訊`;
        updateExportTitle();
        if (activeView === "table") fitColumns();
        petFoodViewSwitch?.refresh();
      };
      viewNav.addEventListener("click", event => {
        const tab = event.target.closest("[role=tab]");
        if (!tab || !viewNav.contains(tab)) return;
        setPetFoodView(tab.id === "pet-food-tab-calculator" ? "calculator" : "table");
      });
      petFoodViewSwitch = window.GMSMViewSwitch.mount(viewNav);
      setPetFoodView(initialView, false);
      app.querySelectorAll(".pet-food-view-panel,.pet-food-calculator-result").forEach(panel => window.GMSMToolShell.spacing(panel));
      updateCalculation();
      fitColumns();
      document.fonts?.ready.then(fitColumns);
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("寵物食品資料載入失敗", e);
      showLoadError("寵物食品資料", "page");
    }
  }

  async function renderSecondaryWeapon(item, revision, controller) {
    root.classList.add("is-secondary-weapon-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    syncPageStyles();
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      const abilityKeys = ["physicalAttack", "magicAttack", "bossAttackPercent", "finalDamagePercent"];
      if (data.costBasis !== "per-attempt" || data.abilityBasis !== "alchemy-added-total-excluding-item-base" ||
          !Array.isArray(data.grades) || data.grades.length !== 3 ||
          data.grades.some(grade => !Array.isArray(grade.levels) || grade.levels.length !== 10 ||
            grade.levels.some((row, index) => row.level !== index + 1 ||
              row.fromLevel !== (index === 0 ? null : index) ||
              ![row.materialCount, row.mesos].every(value => Number.isSafeInteger(value) && value >= 0) ||
              !Number.isFinite(row.successRatePercent) || row.successRatePercent <= 0 || row.successRatePercent > 100 ||
              abilityKeys.some(key => !Number.isFinite(row[key]) || row[key] < 0 ||
                !Number.isFinite(row.increase?.[key]) || row.increase[key] < 0)))) {
        throw new Error("輔助武器鍊成需求資料不完整");
      }
      const image = (src, className = "") => src ? `<img class="${esc(className)}" src="${esc(src)}" alt="" decoding="async">` : "";
      const gradeText = grade => `<span class="secondary-weapon-grade" data-grade="${esc(grade.id)}">${esc(grade.name)}</span>`;
      const range = row => `${row.level === 1 ? "首次轉換" : `Lv.${row.fromLevel}`} → Lv.${row.level}`;
      const columns = [
        { key: "physicalAttack", label: "物理攻擊力" },
        { key: "magicAttack", label: "魔法攻擊力" },
        { key: "bossAttackPercent", label: "BOSS 攻擊力", percent: true },
        { key: "finalDamagePercent", label: "最終傷害", percent: true },
        { key: "successRatePercent", label: "成功率", percent: true },
        { key: "materialCount", label: data.material.name, icon: data.material.icon },
        { key: "mesos", label: "楓幣", icon: data.mesosIcon }
      ];
      const cell = (row, column) => {
        const value = row[column.key] === 0 ? "" : fmt(row[column.key]);
        if (column.percent) {
          return `<span class="site-table-number site-table-number-unit"><span class="site-table-number-value" data-secondary-number="${esc(column.key)}">${value}</span><span class="site-table-number-unit-symbol">${value ? "%" : ""}</span></span>`;
        }
        return `<span class="site-table-number site-table-number-aligned" data-secondary-number="${esc(column.key)}">${value}</span>`;
      };
      const alignNumbers = () => {
        const slots = window.GMSMToolShell.tableNumberSlots(app, "[data-secondary-number]", "data-secondary-number");
        const desktop = app.querySelector(".secondary-weapon-table");
        const tableWidth = desktop?.getBoundingClientRect().width || 0;
        if (tableWidth) root.style.setProperty("--secondary-weapon-table-width", `${Math.ceil(tableWidth)}px`);
        return slots;
      };
      const header = column => `<th scope="col" aria-label="${esc(column.label)}" title="${esc(column.label)}"><span class="secondary-weapon-material-label">${column.icon ? image(column.icon) : esc(column.label)}</span></th>`;
      const rowClass = row => `secondary-weapon-row${row.level === 1 || row.level === 10 ? " site-table-rule-fill-row" : ""}`;
      const mobileTable = grade => {
        const fixed = `<table class="secondary-weapon-mobile-table site-data-table site-table-rules site-table-framed" aria-label="固定鍊成區間"><thead><tr><th scope="col">鍊成區間</th></tr></thead><tbody>${grade.levels.map(row => `<tr class="${rowClass(row)}"><th scope="row" aria-label="${range(row)}">${row.level === 1 ? "首次 → Lv.1" : range(row)}</th></tr>`).join("")}</tbody></table>`;
        const rows = group => grade.levels.map(row => `<tr class="${rowClass(row)}" aria-label="${range(row)}">${group.map(column => `<td aria-label="Lv.${row.level} ${esc(column.label)} ${fmt(row[column.key])}${column.percent ? "%" : ""}">${cell(row, column)}</td>`).join("")}</tr>`).join("");
        return `${fixed}<div class="secondary-weapon-whole-scroll site-table-scroll site-table-paged-scroll" tabindex="0" role="region" aria-label="輔助武器能力與需求，左右滑動查看完整欄位"><div class="site-table-pages"></div></div><div class="secondary-weapon-column-probe" aria-hidden="true" inert><table class="secondary-weapon-mobile-table site-data-table site-table-intrinsic"><thead><tr>${columns.map(header).join("")}</tr></thead><tbody>${rows(columns)}</tbody></table></div>`;
      };
      const mountMobilePages = grade => {
        const host = app.querySelector("#secondary-weapon-mobile");
        const scroll = host.querySelector(".secondary-weapon-whole-scroll");
        const pages = scroll.querySelector(".site-table-pages");
        const probe = host.querySelector(".secondary-weapon-column-probe table");
        let frame = 0, disposed = false, signature = "", previousStep = 0;
        const fit = () => {
          frame = 0;
          if (disposed || !host.isConnected) return;
          const slots = alignNumbers();
          if (!scroll.clientWidth) return;
          // Round up intrinsic widths so fractional pixels never clip the last column.
          const widths = [...probe.tHead.rows[0].cells].map(cell => Math.ceil(cell.getBoundingClientRect().width));
          if (widths.some(width => width <= 0)) return;
          const available = Math.floor(Math.min(scroll.clientWidth, scroll.getBoundingClientRect().width));
          if (available <= 0) return;
          const groups = window.GMSMToolShell.columnPages(widths, available, { maxPages: 3 });
          const nextSignature = `${available}:${widths.join(",")}:${JSON.stringify([...slots])}`;
          if (nextSignature === signature) return;
          const previousPage = previousStep ? Math.round(scroll.scrollLeft / previousStep) : 0;
          const previousColumn = Number(pages.children[previousPage]?.dataset.firstColumn || 0);
          signature = nextSignature;
          pages.innerHTML = groups.map(indices => {
            const group = indices.map(index => columns[index]);
            const usedWidth = indices.reduce((sum, index) => sum + widths[index], 0);
            // Pack by minimum content width first, then fill the remaining page width evenly.
            const spare = Math.max(0, available - usedWidth);
            const share = Math.floor(spare / indices.length);
            const remainder = spare % indices.length;
            const colgroup = `<colgroup>${indices.map((index, position) => `<col style="width:${widths[index] + share + (position < remainder ? 1 : 0)}px">`).join("")}</colgroup>`;
            const rows = grade.levels.map(row => `<tr class="${rowClass(row)}" aria-label="${range(row)}">${group.map(column => `<td aria-label="Lv.${row.level} ${esc(column.label)} ${fmt(row[column.key])}${column.percent ? "%" : ""}">${cell(row, column)}</td>`).join("")}</tr>`).join("");
            return `<div class="site-table-page" data-first-column="${indices[0]}" role="group" aria-label="${esc(group.map(column => column.label).join("、"))}"><table class="secondary-weapon-mobile-table site-data-table site-table-hover site-table-rules site-table-framed" style="width:100%" aria-label="${esc(grade.name)}輔助武器${esc(group.map(column => column.label).join("、"))}" aria-describedby="secondary-weapon-note">${colgroup}<thead><tr>${group.map(header).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
          }).join("");
          alignNumbers();
          previousStep = pages.children[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(pages).columnGap) || 0);
          const target = groups.findIndex(indices => indices.includes(previousColumn));
          scroll.scrollLeft = Math.max(0, target) * previousStep;
          syncPageStyles();
        };
        const schedule = () => {
          if (!disposed && !frame) frame = requestAnimationFrame(fit);
        };
        const resize = new ResizeObserver(schedule);
        resize.observe(scroll);
        document.fonts?.ready.then(schedule);
        document.fonts?.addEventListener("loadingdone", schedule);
        fit();
        cleanupSecondaryWeaponMobile = () => {
          disposed = true;
          cancelAnimationFrame(frame);
          resize.disconnect();
          document.fonts?.removeEventListener("loadingdone", schedule);
        };
      };
      app.innerHTML = `<div id="secondary-weapon-grade-switch" class="site-view-switch" role="tablist" aria-label="輔助武器品級" data-export-exclude>
          ${data.grades.map((grade, index) => `<button id="secondary-weapon-tab-${esc(grade.id)}" class="site-view-tab" type="button" role="tab" aria-selected="${index === 0}" aria-controls="secondary-weapon-panel" data-grade="${esc(grade.id)}">${gradeText(grade)}</button>`).join("")}
        </div>
        <section class="hero-compact glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Secondary Weapon</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button">儲存圖片</button></div></div></section>
        <section id="secondary-weapon-panel" class="data-section glass-surface" role="tabpanel" aria-labelledby="secondary-weapon-tab-${esc(data.grades[0].id)}" tabindex="0">${glassLayers()}<div class="liquid-surface-content site-table-frame-content secondary-weapon-content site-tool-flow">
          <header class="secondary-weapon-heading"><div><h3 id="secondary-weapon-grade-title"></h3><p>能力為鍊成附加的累積值，不含武器本身能力。</p></div></header>
          <p class="secondary-weapon-cost-note">Lv.1 為首次轉換；Lv.2～10 為逐級鍊成。材料與楓幣均為單次消耗。</p>
          <p class="site-scroll-hint" data-scroll-at="wide" data-export-exclude><span class="secondary-weapon-desktop-hint">表格可左右滑動，查看完整能力與需求。</span><span class="secondary-weapon-mobile-hint">鍊成區間固定，左右滑動查看完整欄位。</span></p>
          <div class="secondary-weapon-desktop-scroll site-table-scroll" tabindex="0" aria-label="輔助武器鍊成能力與單次需求，可左右捲動">
            <table class="secondary-weapon-table site-data-table site-table-intrinsic site-table-hover site-table-rules" aria-describedby="secondary-weapon-note">
              <thead><tr><th scope="col">鍊成區間</th>${columns.map(header).join("")}</tr></thead><tbody id="secondary-weapon-rows"></tbody>
            </table>
          </div>
          <div id="secondary-weapon-mobile" class="secondary-weapon-mobile-layout site-table-fixed-layout" data-export-exclude></div>
        </div></section>
        <section class="note-panel site-tool-version site-note-left site-note-compact-mobile glass-surface">${glassLayers()}<div class="liquid-surface-content note-surface-content"><p id="secondary-weapon-note" class="note-only">${esc(window.GMSMToolShell.dataNote(data.notice))}</p></div></section>`;
      const nav = app.querySelector("#secondary-weapon-grade-switch");
      const selectGrade = (gradeId, updateUrl = true) => {
        const grade = data.grades.find(candidate => candidate.id === gradeId) || data.grades[0];
        nav.querySelectorAll("[role=tab]").forEach(tab => {
          const selected = tab.dataset.grade === grade.id;
          tab.setAttribute("aria-selected", String(selected));
          tab.classList.toggle("is-active", selected);
          tab.tabIndex = selected ? 0 : -1;
        });
        app.querySelector("#secondary-weapon-panel").setAttribute("aria-labelledby", `secondary-weapon-tab-${grade.id}`);
        app.querySelector("#secondary-weapon-grade-title").innerHTML = `${gradeText(grade)}輔助武器 · Lv.1～10`;
        app.querySelector(".secondary-weapon-table").setAttribute("aria-label", `${grade.name}輔助武器鍊成能力與單次需求`);
        app.querySelector("#secondary-weapon-rows").innerHTML = grade.levels.map(row => `<tr class="${rowClass(row)}"><th scope="row">${range(row)}</th>${columns.map(column => `<td>${cell(row, column)}</td>`).join("")}</tr>`).join("");
        cleanupSecondaryWeaponMobile();
        app.querySelector("#secondary-weapon-mobile").innerHTML = mobileTable(grade);
        app.querySelector("#save-table-image").dataset.exportTitle = `${data.title} - ${grade.name}`;
        if (updateUrl) {
          const url = new URL(location.href);
          url.searchParams.set("grade", grade.id);
          history.replaceState({}, "", url);
        }
        syncPageStyles();
        mountMobilePages(grade);
        secondaryWeaponGradeSwitch?.refresh();
      };
      nav.addEventListener("click", event => {
        const tab = event.target.closest("[data-grade]");
        if (tab && nav.contains(tab)) selectGrade(tab.dataset.grade);
      });
      selectGrade(new URL(location.href).searchParams.get("grade"), false);
      secondaryWeaponGradeSwitch = window.GMSMViewSwitch.mount(nav);
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("輔助武器鍊成資料載入失敗", e);
      showLoadError("輔助武器鍊成資料", "page");
    }
  }


  async function renderRuneRequirements(item, revision, controller) {
    root.classList.add("is-rune-requirements-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      const renderTable = type => {
        const runeType = data.types[type];
        const rows = runeType.rows.map(row => `<tr class="rune-requirement-row"><th scope="row" class="rune-requirement-range">Lv.${fmt(row.from)} → ${fmt(row.to)}</th><td><span class="site-table-number rune-requirement-number">${fmt(row.runes)}</span></td><td><span class="site-table-number rune-requirement-number">${fmt(row.mesos)}</span></td></tr>`).join("");
        const highestLevel = runeType.rows.at(-1)?.to;
        const totalRunes = runeType.rows.reduce((sum, row) => sum + row.runes, 0);
        const totalMesos = runeType.rows.reduce((sum, row) => sum + row.mesos, 0);
        return `<section id="rune-requirements-panel-${type}" class="data-section glass-surface rune-requirement-panel" role="tabpanel" aria-labelledby="rune-requirements-tab-${type}" tabindex="0" ${type === selectedType ? "" : "hidden"}>${glassLayers()}<div class="liquid-surface-content site-table-frame-content"><header class="rune-requirement-heading"><h3 id="rune-requirements-heading-${type}" class="site-section-title">${esc(runeType.title)}</h3><div class="rune-requirement-symbols site-stat-content" role="group" aria-label="${esc(runeType.title)}地區符文">${runeType.symbols.map(symbol => `<img src="${esc(symbol.icon)}" alt="${esc(symbol.name)}" title="${esc(symbol.name)}" width="28" height="28">`).join("")}</div></header><table class="rune-requirement-table site-data-table site-table-hover site-table-rules site-table-framed" aria-label="${esc(runeType.title)}需求表"><colgroup><col class="rune-requirement-range-column"><col class="rune-requirement-quantity-column"><col class="rune-requirement-cost-column"></colgroup><thead><tr><th scope="col">升級區間</th><th scope="col">符文數量（個）</th><th scope="col">升等費用（楓幣）</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="site-table-rule-fill-row"><th scope="row" aria-label="Lv.1 至 Lv.${fmt(highestLevel)}，單顆符文升級合計">合計（單顆）</th><td><span class="site-table-number rune-requirement-number">${fmt(totalRunes)}</span></td><td><span class="site-table-number rune-requirement-number">${fmt(totalMesos)}</span></td></tr></tfoot></table></div></section>`;
      };
      let selectedType = new URL(location.href).searchParams.get("type") === "authentic" ? "authentic" : "arcane";
      app.innerHTML = `<nav id="rune-requirements-switch" class="site-view-switch" role="tablist" aria-label="符文種類" data-export-exclude><button id="rune-requirements-tab-arcane" class="site-view-tab" type="button" role="tab" aria-selected="${selectedType === "arcane"}" aria-controls="rune-requirements-panel-arcane" data-rune-type="arcane">祕法符文</button><button id="rune-requirements-tab-authentic" class="site-view-tab" type="button" role="tab" aria-selected="${selectedType === "authentic"}" aria-controls="rune-requirements-panel-authentic" data-rune-type="authentic">真實符文</button></nav>
        <section class="hero-compact glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Rune Requirements</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button" data-export-title="${esc(data.types[selectedType].title)}需求表">儲存圖片</button></div></div></section>
        ${renderTable("arcane")}${renderTable("authentic")}
        <section class="note-panel site-tool-version site-note-left glass-surface">${glassLayers()}<div class="liquid-surface-content"><p>遊戲版本 ${esc(data.gameVersion)}</p></div></section>`;
      syncPageStyles();
      const nav = app.querySelector("#rune-requirements-switch");
      const selectType = type => {
        selectedType = type === "authentic" ? "authentic" : "arcane";
        for (const candidate of ["arcane", "authentic"]) {
          const selected = candidate === selectedType;
          app.querySelector(`#rune-requirements-tab-${candidate}`).setAttribute("aria-selected", String(selected));
          app.querySelector(`#rune-requirements-panel-${candidate}`).hidden = !selected;
        }
        app.querySelector("#save-table-image").dataset.exportTitle = `${data.types[selectedType].title}需求表`;
        const url = new URL(location.href);
        if (url.searchParams.get("type") !== selectedType) {
          url.searchParams.set("type", selectedType);
          history.replaceState(history.state, "", url);
        }
      };
      nav.addEventListener("click", event => {
        const tab = event.target.closest("[data-rune-type]");
        if (tab && nav.contains(tab)) selectType(tab.dataset.runeType);
      });
      runeRequirementsSwitch = window.GMSMViewSwitch.mount(nav);
      selectType(selectedType);
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("符文需求資料載入失敗", e);
      showLoadError("符文需求資料", "page");
    }
  }

  async function renderFlameExpectations(item, revision, controller) {
    root.classList.add("is-flame-expectations-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      if (!data.abilities?.length || data.abilities.some(ability => !ability.groups?.length)) throw new Error("找不到輪迴星火資料");
      const percentFormat = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 6 });
      const rateFormat = new Intl.NumberFormat("zh-TW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const topRateFormat = new Intl.NumberFormat("zh-TW", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
      const percent = (value, group, isTop) => `<span class="site-table-number site-table-number-unit"><span class="site-table-number-value" data-site-number-group="${group}">${(isTop ? topRateFormat : rateFormat).format(value)}</span><span class="site-table-number-unit-symbol">%</span></span>`;
      const modes = [{ id: "single", name: "單排" }, { id: "double", name: "雙排" }, { id: "double-max", name: "雙排頂" }];
      const renderValues = values => {
        const highest = Math.max(...values);
        return `<span class="flame-values">${values.map(value => `<span class="site-table-number"${value === highest ? ' title="最高值"' : ''}>${percentFormat.format(value)}</span>`).join('<span class="flame-value-divider">/</span>')}<span class="site-table-number">%</span></span>`;
      };
      const gradeIcons = { legendary: "../assets/flame/icon_傳說輪迴星火.png", mythic: "../assets/flame/icon_神話輪迴星火.png" };
      const partIcons = {
        "武器": [{ file: "武器_分類", label: "武器", category: true }],
        "輔助武器": [{ file: "輔助武器_分類", label: "輔助武器", category: true }],
        "機器人": [{ file: "機器人_分類", label: "機器人", category: true, className: "flame-part-icon-robot" }],
        "帽子": [{ file: "帽子_分類", label: "帽子", category: true }],
        "上衣": [{ file: "上衣_分類", label: "上衣", category: true }],
        "套服": [{ file: "套服_分類", label: "套服", category: true }],
        "手套": [{ file: "手套_分類", label: "手套", category: true }],
        "披風": [{ file: "披風_分類", label: "披風", category: true }],
        "腰帶": [{ file: "腰帶_分類", label: "腰帶", category: true }],
        "護肩": [{ file: "護肩_分類", label: "護肩", category: true }],
        "鞋子": [{ file: "鞋子_分類", label: "鞋子", category: true }],
        "徽章": [{ file: "徽章_分類", label: "徽章", category: true }],
        "戒指": [{ file: "戒指", label: "戒指" }],
        "口袋": [{ file: "口袋_紅", label: "口袋（紅）" }, { file: "口袋_藍", label: "口袋（藍）" }],
        "耳環": [{ file: "耳環", label: "耳環" }],
        "胸章": [{ file: "胸章", label: "胸章" }],
        "臉部裝飾": [{ file: "臉飾", label: "臉飾" }],
        "眼部裝飾": [{ file: "眼飾", label: "眼飾" }],
        "項鍊": [{ file: "項鍊", label: "項鍊" }]
      };
      const renderIcon = (icon, decorative = false) => `<span class="flame-genesis-icon-slot"><img class="flame-part-icon${icon.category ? " flame-part-icon-category" : ""}${icon.className ? ` ${esc(icon.className)}` : ""}" src="../assets/equipment/icon_${esc(icon.file)}.png" alt="${decorative ? "" : esc(icon.label)}"${decorative ? ' aria-hidden="true"' : ""} title="${esc(icon.label)}" width="28" height="28"></span>`;
      const dropPartOrder = ["臉部裝飾", "眼部裝飾", "戒指", "項鍊", "口袋", "耳環", "胸章"];
      const renderParts = (parts, abilityId) => {
        const ordered = abilityId === "item-drop" ? [...parts].sort((a, b) =>
          (dropPartOrder.indexOf(a) < 0 ? dropPartOrder.length : dropPartOrder.indexOf(a)) -
          (dropPartOrder.indexOf(b) < 0 ? dropPartOrder.length : dropPartOrder.indexOf(b))) : parts;
        const textParts = ordered.filter(part => !partIcons[part]);
        const illustrated = ordered.filter(part => partIcons[part]);
        const text = textParts.length ? `<span class="flame-parts-text">${textParts.map((part, index) => `<span>${esc(part)}${index < textParts.length - 1 ? "、" : ""}</span>`).join("")}</span>` : "";
        const renderIconGroup = part => `<span class="flame-part-icon-group site-stat-content" role="group" aria-label="${esc(part)}">${partIcons[part].map(icon => renderIcon(icon)).join("")}</span>`;
        const rowBreak = abilityId === "item-drop" ? 4
          : abilityId === "final-damage" ? illustrated.indexOf("機器人") + 1
          : abilityId === "ignore-defense" && illustrated.includes("護肩") ? illustrated.indexOf("護肩") + 1 : 0;
        const hasRows = rowBreak > 0 && rowBreak < illustrated.length;
        const iconContent = hasRows
          ? [illustrated.slice(0,rowBreak), illustrated.slice(rowBreak)].map(row => `<span class="flame-part-icon-row site-stat-content">${row.map(renderIconGroup).join("")}</span>`).join("")
          : illustrated.map(renderIconGroup).join("");
        const icons = illustrated.length ? `<span class="flame-part-icons site-stat-content${hasRows ? " flame-part-icons-rows" : ""}">${iconContent}</span>` : "";
        return `<span class="flame-parts">${text}${icons}</span>`;
      };
      const guideParts = ["武器", "輔助武器", "機器人", "腰帶", "手套", "帽子", "鞋子", "披風", "護肩", "套服", "上衣", "徽章"];
      const iconGuide = `<section class="data-section glass-surface flame-icon-guide" aria-labelledby="flame-icon-guide-title">${glassLayers()}<div class="liquid-surface-content site-table-frame-content"><h3 id="flame-icon-guide-title" class="site-section-title">部位圖示</h3><ul class="site-stat-grid flame-icon-guide-grid">${guideParts.map(part => `<li class="site-stat-content flame-icon-guide-item">${partIcons[part].map(icon => renderIcon(icon, true)).join("")}<span class="flame-icon-guide-label">${esc(part)}</span></li>`).join("")}</ul><p id="flame-result-note" class="site-entry-caption flame-result-note">結果：期望值／機率</p></div></section>`;
      let groupIndex = 0;
      const groups = data.abilities.map((ability, abilityIndex) => {
        const abilityId = `flame-ability-${abilityIndex}`;
        const representative = ability.groups[0];
        const sharedValues = ability.groups.every(group =>
          JSON.stringify(group.legendaryValues) === JSON.stringify(representative.legendaryValues) &&
          JSON.stringify(group.mythicValues) === JSON.stringify(representative.mythicValues));
        if (!sharedValues) throw new Error("同能力的輪迴星火數值不一致");
        const rows = ability.groups.map(group => {
          const index = groupIndex++;
          const rowCount = group.legendaryValues.length;
          if (rowCount !== group.mythicValues.length || rowCount !== group.targetValueCount) throw new Error("輪迴星火數值種類不一致");
          const partId = `flame-parts-${index}`;
          const pairedCells = modes.map(mode => `<td class="flame-mode-start" headers="${partId} ${abilityId}-${mode.id}"><span class="flame-result-slot"><span class="flame-result"><span class="site-table-number site-table-number-unit flame-result-mean"><span class="site-table-number-value" data-site-number-group="flame-${mode.id}-mean">${fmt(group[mode.id].expectedFlames)}</span><span class="site-table-number-unit-symbol">顆</span></span><span class="flame-result-divider" aria-hidden="true">/</span><span class="flame-result-rate">${percent(group[mode.id].probability * 100, `flame-${mode.id}-rate`, mode.id === "double-max")}</span></span></span></td>`).join("");
          return `<tr class="flame-result-row"><th id="${partId}" scope="row">${renderParts(group.parts, ability.id)}</th>${pairedCells}</tr>`;
        }).join("");
        const gradeMarkup = `<div class="flame-grade-footer site-table-rule-fill"><span class="site-table-number flame-grade-caption">素質</span><div class="flame-grade-pair" aria-label="素質"><div class="flame-grade"><img class="flame-grade-icon" src="${gradeIcons.legendary}" alt="傳說輪迴星火" title="傳說輪迴星火" width="22" height="22">${renderValues(representative.legendaryValues)}</div><div class="flame-grade"><img class="flame-grade-icon" src="${gradeIcons.mythic}" alt="神話輪迴星火" title="神話輪迴星火" width="22" height="22">${renderValues(representative.mythicValues)}</div></div></div>`;
        return `<section class="data-section glass-surface flame-ability-card" aria-labelledby="${abilityId}">${glassLayers()}<div class="liquid-surface-content site-table-frame-content site-table-rules"><div class="site-table-scroll flame-table-scroll" role="region" aria-label="${esc(ability.name)}各部位期望值與機率"><table class="flame-table site-data-table site-table-hover site-table-rules site-table-framed" aria-labelledby="${abilityId}" aria-describedby="flame-result-note flame-table-note"><colgroup><col class="flame-parts-column"></colgroup><colgroup span="3" class="flame-result-column"></colgroup><thead><tr><th scope="col" aria-label="${esc(ability.name)}適用部位"><h3 id="${abilityId}" class="site-section-title flame-ability-title">${esc(ability.name)}</h3><span class="site-entry-caption flame-parts-caption">部位</span></th>${modes.map(mode => `<th id="${abilityId}-${mode.id}" class="flame-mode-start" scope="col">${mode.name}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>${gradeMarkup}</div></section>`;
      }).join("");
      app.innerHTML = `<section class="hero-compact glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Probability · Reincarnation Flame</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button" data-export-title="${esc(data.title)}">儲存圖片</button></div></div></section>
        ${iconGuide}
        ${groups}
        <section class="note-panel site-tool-version site-note-left flame-info-note glass-surface">${glassLayers()}<div class="liquid-surface-content"><p id="flame-table-note">以已有兩排的裝備重洗為基準；期望值為平均需求，非保底。</p><p>單排機率以單一詞條為計算基準；雙排指兩個詞條皆出現同一指定能力，兩者均不限制數值。</p><p>各數值序列的末值為該品階最高值；雙排頂要求兩排都是指定能力，且各自達到最高數值。</p><p>機率顯示至小數點後兩位，雙排頂顯示三位；期望值使用完整精度計算。依候選池等權、兩排獨立且同能力可重複的整理模型估算。</p><p>遊戲版本 ${esc(data.gameVersion)}</p></div></section>`;
      const url = new URL(location.href);
      url.searchParams.delete("ability");
      url.searchParams.delete("goal");
      history.replaceState(history.state, "", url);
      syncPageStyles();
      cleanupFlameNumbers = window.GMSMToolShell.tableNumbers(app);
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      cleanupFlameNumbers();
      cleanupFlameNumbers = () => {};
      console.error("輪迴星火資料載入失敗", e);
      showLoadError("輪迴星火資料", "page");
    }
  }


  async function renderHyperStatRequirements(item, revision, controller) {
    root.classList.add("is-hyper-stat-requirements-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      if (!Array.isArray(data.abilities) || !data.abilities.length || data.abilities.some(ability => !ability.levels?.length)) throw new Error("找不到極限屬性資料");
      const requestedId = new URL(location.href).searchParams.get("stat");
      const selectedAbility = data.abilities.find(ability => ability.id === requestedId) || data.abilities[0];
      const additionalSkill = data.abilities.find(ability => ability.id === "additional-skill-damage");
      const skillTiming = row => String(row.effect ?? "").match(/\/\s*(\d+(?:\.\d+)?)\s*sec$/i)?.[1];
      const learnedSkillRows = additionalSkill?.levels.filter(row => row.level > 0) || [];
      const sharedSkillTiming = learnedSkillRows.length && learnedSkillRows.every(row => skillTiming(row) === skillTiming(learnedSkillRows[0]))
        ? skillTiming(learnedSkillRows[0]) : null;
      const renderEffect = (effect, id) => String(effect ?? "").split(/\s*\/\s*/).map((part, index) => {
        const match = part.trim().match(/^([+-]?\d+(?:\.\d+)?)\s*(%|hits|sec)?$/i);
        if (!match) return esc(part);
        if (id === "additional-skill-damage" && sharedSkillTiming && match[2]?.toLowerCase() === "sec") return "";
        const compactDamage = id === "max-damage" && !match[2];
        const value = fmt(Number(match[1]) / (compactDamage ? 10000 : 1));
        const group = `${id}-${index}`;
        const unit = compactDamage ? "萬" : { hits: "次", sec: "秒", "%": "%" }[(match[2] || "").toLowerCase()];
        const original = compactDamage ? ` title="${fmt(Number(match[1]))}" aria-label="最大傷害 ${fmt(Number(match[1]))}"` : "";
        return unit
          ? `<span class="site-table-number site-table-number-unit"${original}><span class="site-table-number-value" data-site-number-group="${esc(group)}">${value}</span><span class="site-table-number-unit-symbol">${unit}</span></span>`
          : `<span class="site-table-number site-table-number-aligned" data-site-number-group="${esc(group)}">${value}</span>`;
      }).join("");
      const renderRows = ability => ability.levels.map(row => `<tr class="hyper-stat-requirement-row${row.level === ability.maxLevel ? " site-table-rule-fill-row" : ""}"><th scope="row">Lv.${fmt(row.level)}</th><td><span class="hyper-stat-effect-parts${ability.id === "additional-skill-damage" && sharedSkillTiming ? " hyper-stat-skill-effect" : ""}">${renderEffect(row.effect, ability.id)}</span></td><td><span class="site-table-number hyper-stat-cost">${fmt(row.nextLevelCost)}</span></td><td><span class="site-table-number hyper-stat-cost">${fmt(row.cumulativeCost)}</span></td></tr>`).join("");
      const options = data.abilities.map(ability => `<option value="${esc(ability.id)}" title="${esc(ability.sourceName)}"${ability.id === selectedAbility.id ? " selected" : ""}>${esc(ability.name)}</option>`).join("");
      app.innerHTML = `<section class="hero-compact glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Hyper Stats</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button">儲存圖片</button></div></div></section>
        <section class="data-section glass-surface hyper-stat-ability-picker" data-export-exclude>${glassLayers()}<div class="liquid-surface-content site-table-frame-content"><label for="hyper-stat-ability-select" class="site-section-title">能力</label><select id="hyper-stat-ability-select">${options}</select></div></section>
        <section class="data-section glass-surface">${glassLayers()}<div class="liquid-surface-content site-table-frame-content"><table class="hyper-stat-requirement-table site-data-table site-table-hover site-table-rules site-table-framed" aria-label="${esc(selectedAbility.name)}效果與費用"><colgroup><col style="width:14%"><col style="width:28%"><col style="width:29%"><col style="width:29%"></colgroup><thead><tr><th scope="col">等級</th><th scope="col">目前效果</th><th scope="col">升下一級（楓幣）</th><th scope="col">累積楓幣</th></tr></thead><tbody id="hyper-stat-requirement-rows">${renderRows(selectedAbility)}</tbody></table><p id="hyper-stat-skill-note" class="site-entry-caption hyper-stat-skill-note" hidden></p></div></section>
        <section class="note-panel site-tool-version site-note-left glass-surface">${glassLayers()}<div class="liquid-surface-content"><p>遊戲版本 ${esc(data.gameVersion)}</p></div></section>`;
      syncPageStyles();
      const select = app.querySelector("#hyper-stat-ability-select");
      window.GMSMGlass.decorateSelect(select, { fitContent: true });
      const setAbility = id => {
        const ability = data.abilities.find(candidate => candidate.id === id);
        if (!ability) return;
        select.value = ability.id;
        app.querySelector("#hyper-stat-requirement-rows").innerHTML = renderRows(ability);
        const table = app.querySelector(".hyper-stat-requirement-table");
        table.setAttribute("aria-label", `${ability.name}效果與費用`);
        const skillNote = app.querySelector("#hyper-stat-skill-note");
        const showSkillNote = ability.id === "additional-skill-damage" && Boolean(sharedSkillTiming);
        skillNote.hidden = !showSkillNote;
        if (showSkillNote) {
          skillNote.textContent = `Lv.${learnedSkillRows[0].level}～${ability.maxLevel} 的秒數皆為 ${fmt(Number(sharedSkillTiming))} 秒；Lv.0 為 ${fmt(Number(skillTiming(ability.levels.find(row => row.level === 0))))} 秒。`;
          table.setAttribute("aria-describedby", skillNote.id);
        } else {
          table.removeAttribute("aria-describedby");
          skillNote.textContent = "";
        }
        app.querySelector("#save-table-image").dataset.exportTitle = `${data.title}｜${ability.name}`;
        const url = new URL(location.href);
        url.searchParams.delete("view");
        url.searchParams.set("stat", ability.id);
        history.replaceState(history.state, "", url);
        cleanupTableRules();
        cleanupTableRules = window.GMSMToolShell.tableRules(app);
      };
      select.addEventListener("change", () => setAbility(select.value));
      setAbility(selectedAbility.id);
      cleanupHyperStatNumbers = window.GMSMToolShell.tableNumbers(app.querySelector(".hyper-stat-requirement-table"));
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("極限屬性資料載入失敗", e);
      showLoadError("極限屬性資料", "page");
    }
  }

  async function renderStarforceRequirements(item, revision, controller) {
    root.classList.add("is-starforce-requirements-page");
    setNav(item.title);
    document.title = `${item.title}｜也許有用的資訊`;
    app.innerHTML = `<div class="glass-panel loading">正在載入資料…</div>`;
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson(item.data, controller.signal);
      if (revision !== routeRevision || controller.signal.aborted) return;
      const requestedCost = new URL(location.href).searchParams.get("cost");
      let selectedProfileId = data.costProfiles.some(profile => profile.id === requestedCost) ? requestedCost : data.costProfiles[0].id;
      const rateCell = value => value === 0 ? '<span class="site-table-number">-</span>' : `<span class="site-table-number site-table-number-unit starforce-rate-number"><span class="site-table-number-value">${fmt(value)}</span><span class="site-table-number-unit-symbol">%</span></span>`;
      const renderRows = profile => data.rows.map((row, index) => {
        const milestone = data.milestones.includes(row.toStar) ? " site-table-rule-fill-row" : "";
        const cost = profile.costs[index];
        const costCell = cost == null ? "—" : `<span class="site-table-number">${fmt(cost)}</span>`;
        return `<tr class="starforce-requirement-row${milestone}"${row.toStar > profile.displayMaxTarget ? " hidden" : ""}><th scope="row">${fmt(row.fromStar)} → ${fmt(row.toStar)}</th><td>${rateCell(row.success)}</td><td>${rateCell(row.maintain)}</td><td>${rateCell(row.decrease)}</td><td>${rateCell(row.destroy)}</td><td>${costCell}</td></tr>`;
      }).join("");
      const tabLabel = profile => profile.id === "standard" ? "一般裝備" : profile.id === "root-abyss-cap-weapon" ? '<span class="starforce-cost-family">露塔必思</span> <span class="starforce-cost-parts">帽子／武器</span>' : '<span class="starforce-cost-family">露塔必思</span> <span class="starforce-cost-parts">上衣／褲子</span>';
      const tabs = data.costProfiles.map(profile => `<button id="starforce-cost-tab-${esc(profile.id)}" class="site-view-tab" type="button" role="tab" aria-selected="${profile.id === selectedProfileId}" aria-controls="starforce-requirement-panel" data-starforce-cost="${esc(profile.id)}">${tabLabel(profile)}</button>`).join("");
      const selectedProfile = data.costProfiles.find(profile => profile.id === selectedProfileId);
      app.innerHTML = `<nav id="starforce-cost-switch" class="site-view-switch" role="tablist" aria-label="星力費用類型" data-export-exclude>${tabs}</nav>
        <section class="hero-compact glass-surface">${glassLayers()}<div class="liquid-surface-content hero-surface-content"><div class="hero-copy"><div class="eyebrow">Growth · Starforce</div><h2>${esc(data.title)}</h2></div><div class="hero-actions"><button id="save-table-image" class="action-btn site-important-action" type="button" data-export-title="${esc(data.title)}｜${esc(selectedProfile.title)}">儲存圖片</button></div></div></section>
        <section id="starforce-requirement-panel" class="data-section glass-surface" role="tabpanel" aria-labelledby="starforce-cost-tab-${esc(selectedProfile.id)}" tabindex="0">${glassLayers()}<div class="liquid-surface-content site-table-frame-content"><h3 id="starforce-requirements-profile-title" class="site-section-title starforce-requirement-heading">${esc(selectedProfile.title)}</h3><table class="starforce-requirement-table site-data-table site-table-hover site-table-rules site-table-framed" aria-label="${esc(data.title)}"><colgroup><col class="starforce-level-column"><col class="starforce-rate-column"><col class="starforce-rate-column"><col class="starforce-rate-column"><col class="starforce-rate-column"><col class="starforce-cost-column"></colgroup><thead><tr><th scope="col">升星</th><th scope="col">成功</th><th scope="col">維持</th><th scope="col">下降</th><th scope="col">破壞</th><th scope="col">楓幣（每次）</th></tr></thead><tbody id="starforce-requirement-rows">${renderRows(selectedProfile)}</tbody></table></div></section>
        <section class="data-section glass-surface starforce-reminder">${glassLayers()}<div class="liquid-surface-content site-table-frame-content"><h3 class="site-section-title starforce-reminder-heading">強化提醒</h3><ul class="starforce-reminder-list"><li>本表不套用星星捕捉、幸運日、安全盾牌、裝備保護卷軸及費用折扣。</li><li>每次強化費用依裝備類型而異；本表不包含飾品、輔助武器與其他活動裝備。</li><li>有費用資料不代表每件裝備都能升到該星數；36星受裝備上限與擴充條件限制。</li></ul></div></section>
        <section class="note-panel site-tool-version site-note-left glass-surface">${glassLayers()}<div class="liquid-surface-content"><p>遊戲版本 ${esc(data.gameVersion)}</p></div></section>`;
      syncPageStyles();
      const nav = app.querySelector("#starforce-cost-switch");
      const selectProfile = profileId => {
        const profile = data.costProfiles.find(candidate => candidate.id === profileId) || data.costProfiles[0];
        selectedProfileId = profile.id;
        app.querySelector("#starforce-requirement-panel").setAttribute("aria-labelledby", `starforce-cost-tab-${profile.id}`);
        for (const candidate of data.costProfiles) {
          app.querySelector(`#starforce-cost-tab-${candidate.id}`).setAttribute("aria-selected", String(candidate.id === selectedProfileId));
        }
        app.querySelector("#starforce-requirements-profile-title").textContent = profile.title;
        app.querySelectorAll(".starforce-requirement-row").forEach((row, index) => {
          row.hidden = data.rows[index].toStar > profile.displayMaxTarget;
          const cost = profile.costs[index];
          const cell = row.lastElementChild;
          if (cost == null) {
            cell.textContent = "—";
            return;
          }
          const value = document.createElement("span");
          value.className = "site-table-number";
          value.textContent = fmt(cost);
          cell.replaceChildren(value);
        });
        app.querySelector("#save-table-image").dataset.exportTitle = `${data.title}｜${profile.title}`;
        const url = new URL(location.href);
        if (url.searchParams.get("cost") !== selectedProfileId) {
          url.searchParams.set("cost", selectedProfileId);
          history.replaceState(history.state, "", url);
        }
      };
      nav.addEventListener("click", event => {
        const tab = event.target.closest("[data-starforce-cost]");
        if (tab && nav.contains(tab)) selectProfile(tab.dataset.starforceCost);
      });
      starforceRequirementsSwitch = window.GMSMViewSwitch.mount(nav);
      selectProfile(selectedProfileId);
      app.setAttribute("aria-busy", "false");
    } catch (e) {
      if (revision !== routeRevision || controller.signal.aborted) return;
      console.error("星力強化資料載入失敗", e);
      showLoadError("星力強化資料", "page");
    }
  }

  async function renderRoute() {
    cleanupFlameNumbers();
    cleanupFlameNumbers = () => {};
    cleanupHyperStatNumbers();
    cleanupHyperStatNumbers = () => {};
    cleanupHexaModeControl();
    petFoodViewSwitch?.destroy();
    petFoodViewSwitch = null;
    secondaryWeaponGradeSwitch?.destroy();
    secondaryWeaponGradeSwitch = null;
    runeRequirementsSwitch?.destroy();
    runeRequirementsSwitch = null;
    starforceRequirementsSwitch?.destroy();
    starforceRequirementsSwitch = null;
    cleanupSecondaryWeaponMobile();
    cleanupSecondaryWeaponMobile = () => {};
    root.style.removeProperty("--secondary-weapon-table-width");
    delete root.dataset.petFoodView;
    const revision = ++routeRevision;
    routeRequest?.abort();
    routeRequest = null;
    root.classList.remove("is-info-home", "is-genesis-info-page", "is-light-sanctum-page", "is-hexa-page", "is-constellation-page", "is-hieros-page", "is-pet-food-page", "is-secondary-weapon-page", "is-rune-requirements-page", "is-starforce-requirements-page", "is-hyper-stat-requirements-page", "is-flame-expectations-page");
    if (!catalog) return;
    const id = currentPageId();
    if (!id) { renderHome(); return; }
    const item = catalog.items.find(x => x.id === id && x.status === "ready");
    if (!item) { setRoute("", true); return; }
    if (item.id === "flame-expectations") {
      routeRequest = new AbortController();
      await renderFlameExpectations(item, revision, routeRequest);
      return;
    }
    if (item.id === "secondary-weapon") {
      routeRequest = new AbortController();
      await renderSecondaryWeapon(item, revision, routeRequest);
      return;
    }
    if (item.id === "rune-requirements") {
      routeRequest = new AbortController();
      await renderRuneRequirements(item, revision, routeRequest);
      return;
    }
    if (item.id === "hyper-stat-requirements") {
      routeRequest = new AbortController();
      await renderHyperStatRequirements(item, revision, routeRequest);
      return;
    }
    if (item.id === "starforce-requirements") {
      routeRequest = new AbortController();
      await renderStarforceRequirements(item, revision, routeRequest);
      return;
    }
    if (item.id === "pet-food") {
      routeRequest = new AbortController();
      await renderPetFood(item, revision, routeRequest);
      return;
    }
    if (item.id === "genesis-liberation") {
      routeRequest = new AbortController();
      await renderGenesis(item, revision, routeRequest);
      return;
    }
    if (item.id === "light-sanctum-pray-exp") {
      routeRequest = new AbortController();
      await renderLightSanctum(item, revision, routeRequest);
      return;
    }
    if (item.id === "hexa-core") {
      routeRequest = new AbortController();
      await renderHexa(item, revision, routeRequest);
      return;
    }
    if (item.id === "constellation-core") {
      routeRequest = new AbortController();
      await renderConstellation(item, revision, routeRequest);
      return;
    }
    if (item.id === "helos-seal") {
      routeRequest = new AbortController();
      await renderHieros(item, revision, routeRequest);
      return;
    }
    renderHome();
  }

  async function loadCatalog() {
    catalogRequest?.abort();
    const controller = new AbortController();
    catalogRequest = controller;
    app.innerHTML = `<div class="glass-panel loading">正在載入資訊…</div>`;
    syncPageStyles();
    app.setAttribute("aria-busy", "true");
    try {
      const data = await fetchJson("data/catalog.json", controller.signal);
      if (controller.signal.aborted) return;
      catalog = data;
      await renderRoute();
    } catch (e) {
      if (controller.signal.aborted) return;
      root.classList.remove("is-info-home", "is-genesis-info-page", "is-light-sanctum-page", "is-hexa-page", "is-constellation-page", "is-hieros-page", "is-pet-food-page", "is-secondary-weapon-page", "is-starforce-requirements-page", "is-hyper-stat-requirements-page", "is-flame-expectations-page");
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
