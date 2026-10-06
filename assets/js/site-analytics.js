(() => {
  "use strict";

  if (window.GMSMAnalytics) return;

  const measurementId = "G-FSW7VLPBYS";
  const allowedActions = new Set(["configure", "action", "simulate"]);
  const allowedSaveMethods = new Set(["download", "long_press"]);
  const mainTools = Object.freeze({
    transcend: ["超越模擬器", "simulator"],
    craft: ["製作模擬器", "simulator"],
    "emb-enhance": ["紋章模擬器", "simulator"],
    "acc-enhance": ["飾品強化模擬器", "simulator"],
    star: ["星力強化模擬器", "simulator"],
    ignore: ["無視防禦計算機", "calculator"],
    "hyper-stat": ["極限屬性計算機", "calculator"],
    rune: ["符文計算機", "calculator"],
    liberation: ["創世解放計算機", "calculator"],
    "hexa-prog": ["六轉進度計算機", "hexa"],
    "hexa-visual": ["HEXA屬性模擬器", "hexa"],
    "hexa-lazy": ["HEXA懶人決策表", "hexa"],
    "hexa-reset": ["HEXA重置決策模擬", "hexa"],
    "hexa-sim": ["HEXA目標機率模擬", "hexa"],
    will: ["威爾二階練習機", "practice"],
    notice: ["布告欄", "site"]
  });

  const script = document.currentScript;
  const pageSurface = script?.dataset.siteAnalyticsSurface || "";
  const capturedContexts = new WeakSet();
  let currentTool = null;
  let useRecorded = false;

  function isLocalHost(hostname) {
    const host = String(hostname || "").toLowerCase().replace(/^\[|\]$/g, "");
    return host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") ||
      host === "::1" || host === "0.0.0.0" || host === "::" ||
      /^127(?:\.\d{1,3}){3}$/.test(host) || /^10(?:\.\d{1,3}){3}$/.test(host) ||
      /^192\.168(?:\.\d{1,3}){2}$/.test(host) || /^172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}$/.test(host) ||
      /^169\.254(?:\.\d{1,3}){2}$/.test(host) || /^f[cd][0-9a-f]{2}:/i.test(host) || /^fe[89ab][0-9a-f]:/i.test(host);
  }

  let analyticsEnabled = false;
  try {
    analyticsEnabled = ["http:", "https:"].includes(window.location.protocol) && !isLocalHost(window.location.hostname);
  } catch (_) {}

  function eventBase(tool) {
    return {
      tool_id: tool.tool_id,
      tool_name: tool.tool_name,
      tool_category: tool.tool_category,
      tool_surface: tool.tool_surface
    };
  }

  function send(eventName, params) {
    if (!analyticsEnabled) return false;
    try {
      if (typeof window.gtag !== "function") return false;
      window.gtag("event", eventName, params);
      return true;
    } catch (_) {
      return false;
    }
  }

  function clearCurrent() {
    currentTool = null;
    useRecorded = false;
  }

  function setCurrent(tool) {
    if (!tool || !tool.tool_id) {
      clearCurrent();
      return false;
    }
    if (currentTool?.tool_id === tool.tool_id) return false;
    currentTool = Object.freeze(tool);
    useRecorded = false;
    send("tool_view", eventBase(currentTool));
    return true;
  }

  function viewMain(tabId) {
    try {
      const item = mainTools[String(tabId || "")];
      if (!item) {
        clearCurrent();
        return false;
      }
      return setCurrent({
        tool_id: String(tabId),
        tool_name: item[0],
        tool_category: item[1],
        tool_surface: "main",
        tab_id: String(tabId)
      });
    } catch (_) {
      clearCurrent();
      return false;
    }
  }

  function viewInfo(pageId, title, view) {
    try {
      const id = String(pageId || "");
      if (!id) {
        clearCurrent();
        return false;
      }
      if (id === "1204-generator") {
        return setCurrent({ tool_id: id, tool_name: "1204 產生器", tool_category: "site", tool_surface: "generator" });
      }
      if (id === "light-sanctum-pray") {
        return setCurrent({ tool_id: id, tool_name: "光之聖所祈禱模擬器", tool_category: "simulator", tool_surface: "pray" });
      }
      if (id === "pet-food") {
        const calculator = view === "calculator";
        return setCurrent({
          tool_id: calculator ? "pet-food-calculator" : "pet-food-table",
          tool_name: calculator ? "寵物食品計算機" : String(title || "寵物食品"),
          tool_category: calculator ? "calculator" : "information",
          tool_surface: "info",
          page_id: id
        });
      }
      const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
      if (!safeId) {
        clearCurrent();
        return false;
      }
      return setCurrent({
        tool_id: safeId.startsWith("info-") ? safeId : `info-${safeId}`,
        tool_name: String(title || safeId),
        tool_category: "information",
        tool_surface: "info",
        page_id: safeId
      });
    } catch (_) {
      clearCurrent();
      return false;
    }
  }

  function use(action = "action") {
    try {
      if (!currentTool || useRecorded || !allowedActions.has(action)) return false;
      useRecorded = true;
      return send("tool_use", { ...eventBase(currentTool), action_type: action });
    } catch (_) {
      return false;
    }
  }

  function captureContext() {
    try {
      if (!currentTool) return null;
      const context = Object.freeze(eventBase(currentTool));
      capturedContexts.add(context);
      return context;
    } catch (_) {
      return null;
    }
  }

  function exportImage(context, method) {
    try {
      if (!context || !capturedContexts.has(context) || !allowedSaveMethods.has(method)) return false;
      return send("tool_export", { ...context, save_method: method });
    } catch (_) {
      return false;
    }
  }

  function elementFor(event) {
    const target = event.target;
    return target instanceof Element ? target : target?.parentElement || null;
  }

  const excludedInteraction = [
    ".unified-nav", ".tab-menu", "#btn-home", "#nav-back", ".unified-home",
    ".site-menu-entry", ".site-entry", ".info-row", "[data-site-interaction='entry']",
    "[role='tab']", "[role='tablist']", ".site-view-switch", ".hexa-mode-control",
    "#theme-toggle", ".theme-toggle", ".btn-sound", "#btn-will-bgm", "#btn-mute-v", "#fullscreen-toggle",
    ".fullscreen-toggle", "[data-fullscreen]", "[data-site-export]", "#save-table-image",
    "#download-btn", "[data-export-button]", "[download]",
    "[data-site-analytics-ignore]", "[hidden]"
  ].join(",");

  function currentScope() {
    if (!currentTool) return null;
    if (currentTool.tool_surface === "main") return document.getElementById(`tab-${currentTool.tab_id}`);
    if (currentTool.tool_surface === "info") return document.getElementById("app");
    if (currentTool.tool_surface === "generator" || currentTool.tool_surface === "pray") return document.querySelector("main.container");
    return null;
  }

  function handleInteraction(event) {
    try {
      if (!event.isTrusted || !currentTool) return;
      const element = elementFor(event);
      const scope = currentScope();
      if (!element || !scope || !scope.contains(element) || element.closest(excludedInteraction) || element.closest(":disabled")) return;
      if (currentTool.tool_surface === "main" && !scope.classList.contains("active")) return;
      if (event.type === "click") {
        const button = element.closest("button");
        if (!button || button.disabled) return;
        const requested = button.dataset.siteAnalyticsAction;
        use(allowedActions.has(requested) ? requested : "action");
        return;
      }
      if (!element.matches("input,select,textarea")) return;
      const type = String(element.type || "").toLowerCase();
      if (["button", "submit", "reset", "hidden"].includes(type) || element.disabled) return;
      use("configure");
    } catch (_) {}
  }

  function restoreVisibleView() {
    try {
      if (pageSurface === "main") {
        const active = document.querySelector(".tab-content.active[id^='tab-']");
        viewMain(active ? active.id.slice(4) : "home");
      } else if (pageSurface === "info") {
        const currentNav = document.getElementById("nav-title")?.parentElement;
        if (!currentNav?.matches("[aria-current='page']")) {
          clearCurrent();
          return;
        }
        const params = new URL(window.location.href).searchParams;
        viewInfo(params.get("page") || "", document.getElementById("nav-title")?.textContent || "", params.get("view"));
      } else if (pageSurface === "generator") {
        viewInfo("1204-generator", "1204 產生器");
      } else if (pageSurface === "pray") {
        viewInfo("light-sanctum-pray", "光之聖所祈禱模擬器");
      }
    } catch (_) {
      clearCurrent();
    }
  }

  try {
    if (analyticsEnabled) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", measurementId);
      const loader = document.createElement("script");
      loader.async = true;
      loader.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.append(loader);
    }
  } catch (_) {}

  document.addEventListener("click", handleInteraction, true);
  document.addEventListener("input", handleInteraction, true);
  document.addEventListener("change", handleInteraction, true);
  document.addEventListener("DOMContentLoaded", () => queueMicrotask(restoreVisibleView), { once: true });
  window.addEventListener("pagehide", clearCurrent);
  window.addEventListener("pageshow", event => {
    if (!event.persisted) return;
    clearCurrent();
    queueMicrotask(restoreVisibleView);
  });

  window.GMSMAnalytics = Object.freeze({ viewMain, viewInfo, use, captureContext, exportImage });
})();