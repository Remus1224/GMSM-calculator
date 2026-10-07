/* Game Info export configuration; rendering and file delivery are shared. */
(() => {
  "use strict";
  window.GMSMImageExport.create({
    buttonSelector: "#save-table-image",
    rootSelector: ".shell",
    contentSelector: ".data-row,.hexa-level-row,.constellation-row,.hieros-row,.genesis-info-row,.pet-food-row,.pet-food-calculator-result,.secondary-weapon-row,.rune-requirement-row,.starforce-requirement-row,.hyper-stat-requirement-row,.flame-result-row",
    titleSelector: ".hero-compact h2",
    fallbackTitle: "遊戲資訊表",
    surfaceSelector: ".hero-compact,.data-section:not(.requirements-panel),.note-panel,.hexa-title-card,.hexa-body-card,.hieros-table-frame,.hieros-stat-card,.hieros-hint,.genesis-info-total-card,.genesis-info-attack-total,.pet-food-summary-card",
    extraCSS: ".action-btn:disabled{opacity:1;cursor:default} .site-table-scroll{overflow:visible!important} .pet-food-selected-ranges{display:block!important} .pet-food-settings-layout{display:block!important} .pet-food-inventory-panel{display:block!important;border-left:0!important;padding-left:0!important} .pet-food-settings-summary{display:grid!important;grid-template-columns:minmax(0,1fr)!important} .pet-food-settings-summary > *{grid-column:auto!important;grid-row:auto!important}",
    crop: { startSelector: ".hero-compact", endSelector: ".note-panel" },
    async prepare(doc, { button }) {
      const title = button?.dataset.exportTitle;
      if (title) {
        const heading = doc.querySelector(".hero-compact h2");
        heading.textContent = title;
        const grade = doc.querySelector("#secondary-weapon-grade-title .secondary-weapon-grade");
        if (grade && title.endsWith(` - ${grade.textContent}`)) {
          heading.replaceChildren(doc.createTextNode(title.slice(0, -grade.textContent.length)), grade.cloneNode(true));
        }
      }
      doc.querySelector(".hero-actions")?.remove();
      doc.querySelectorAll("[data-pet-food-unit-price]").forEach(cost => {
        cost.textContent = `每包參考價格 ${cost.dataset.petFoodUnitPrice}；${cost.textContent}`;
      });
      // Export uses a different viewport: measure slots in that document's font sizes.
      await doc.fonts.ready;
      window.GMSMToolShell.tableNumberSlots(doc);
      window.GMSMToolShell.tableNumberSlots(doc, "[data-secondary-number]", "data-secondary-number");
    },
    notify: window.GMSMNotify.show
  });
})();
