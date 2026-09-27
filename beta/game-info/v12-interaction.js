(() => {
  "use strict";

  const coarse = window.matchMedia?.("(hover: none), (pointer: coarse)")?.matches;
  if (coarse) return;

  const bind = sheet => {
    if (!sheet || sheet.dataset.v12GlassBound === "1") return;
    sheet.dataset.v12GlassBound = "1";

    sheet.addEventListener("pointermove", event => {
      const rect = sheet.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      sheet.style.setProperty("--glass-x", `${x.toFixed(2)}%`);
      sheet.style.setProperty("--glass-y", `${y.toFixed(2)}%`);
    }, { passive: true });

    sheet.addEventListener("pointerleave", () => {
      sheet.style.setProperty("--glass-x", "22%");
      sheet.style.setProperty("--glass-y", "14%");
    }, { passive: true });
  };

  const scan = () => document.querySelectorAll(".data-section").forEach(bind);
  scan();

  const app = document.getElementById("app");
  if (app) new MutationObserver(scan).observe(app, { childList: true, subtree: true });
})();
