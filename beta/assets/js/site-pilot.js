/* Explicit calculator allowlist; lazy-created cards follow their normal initializer. */
(() => {
 const selectors={
  notice:'.notice-hero,.notice-timeline-panel,.notice-release,.notice-hero-icon,.notice-info-card > summary,.notice-info-body,.notice-older > summary',
  star:'.sarcasm-banner',
  ignore:'.ignore-left-panel,.panel-absolab,.panel-arcane,.equip-card,.ignore-result-surface,.ignore-bug-notice',
  rune:'.rune-category-btn,.rune-calc-card,.authentic-region-tab,.rune-grand-total',
  'hexa-prog':'.hexa-progress-panel,.prog-item,.prog-bar-wrap,.hexa-time-surface',
  'hexa-lazy':'.hexa-website-panel',
  'hexa-reset':'.hexa-website-panel',
  'hexa-sim':'.hexa-website-panel',
  liberation:'.genesis-subtabs,.liberation-journey-panel,.liberation-panel'
 };
 function decorateTab(id) {
  const tab=document.getElementById('tab-'+id),G=window.GMSMGlass;
  if(!tab||!G)return;
  if(window.GMSMSimulatorSettings?.decorateTab(id))return;
  if(!selectors[id])return;
  if(id==='notice'||id==='star'){
   tab.querySelectorAll(selectors[id]).forEach(surface=>{
    surface.classList.add('site-notice-surface');
    if(surface.matches('.notice-hero,.notice-timeline-panel,.notice-info-body,.sarcasm-banner'))surface.classList.add('calculator-section');
    G.decorate(surface);
    G.setCardRole(surface,surface.matches('summary')?'toggle':'info');
   });
   if(id==='notice')G.bindWebsiteInteractions(tab);
   return;
  }
  tab.classList.add('site-calculator');
  G.decorateChoices(tab);
  if(id==='ignore')tab.querySelectorAll('.absolab-group .site-radio-option,.arcane-group .site-radio-option').forEach(control=>control.classList.add('site-choice-film'));
  tab.querySelectorAll(selectors[id]).forEach(surface=>{
   if(surface.classList.contains('prog-item')){
    surface.style.removeProperty('background-color');
    surface.style.removeProperty('border-left');
   }
   G.decorate(surface);
   const choice=surface.matches('.rune-category-btn');
   const input=surface.matches('.ignore-left-panel,.panel-absolab,.panel-arcane,.equip-card,.rune-calc-card:not(.authentic-rune-card-locked),.hexa-progress-panel,.prog-item,.hexa-website-panel,.liberation-panel');
   G.setCardRole(surface,surface.matches('.authentic-rune-card-locked')?'static':choice?'choice':surface.matches('.equip-card,.rune-calc-card,.prog-item')?'group':input?'input':'info');
  });

  if(id==='liberation'){
   tab.querySelectorAll('.liberation-custom-toggle,.genesis-stone-status-option,.liberation-stage-card,.liberation-boss-card').forEach(surface=>{
    surface.classList.add('site-glass-compact');
    if(surface.matches('.liberation-custom-toggle,.genesis-stone-status-option'))surface.classList.add('site-glass-toggle');
    G.decorate(surface);
    if(!surface.matches('.site-glass-toggle'))G.setCardRole(surface,surface.matches('.liberation-stage-card')?'choice':surface.matches('button,[role=button]')?'entry':surface.querySelector('input,select,textarea')?'input':'info');
   });
  }
  if(id==='liberation'){
   tab.querySelectorAll('.liberation-stage-section > .liberation-section-heading,.genesis-stage-description,.genesis-reward-help,.genesis-income-summary,.liberation-total-summary,.liberation-forecast-stat,.genesis-forecast,.genesis-resource,.genesis-alchemy-rules,.genesis-stone-exchange-rule').forEach(surface=>{
    surface.classList.remove('site-summary-inset');
    surface.classList.add('genesis-info-surface','site-summary-card');
    G.decorate(surface);G.setCardRole(surface,'info');
   });
  }
  if(id==='liberation')tab.querySelectorAll('.genesis-alchemy-table-panel').forEach(surface=>G.setCardRole(surface,'info'));
  tab.querySelectorAll('.ignore-bug-notice').forEach(notice=>notice.classList.add('calculator-section'));
  tab.querySelectorAll('.site-card').forEach(surface=>{if(surface.querySelector('.site-card:not(.site-select-shell)'))surface.classList.add('calculator-section');});
  tab.querySelectorAll('.ignore-left-panel,.hexa-progress-panel,.liberation-panel').forEach(panel=>panel.classList.add('calculator-section'));
  tab.querySelectorAll('.prog-item').forEach(card=>card.classList.add('site-tinted-card'));
  // Computed results share an information film, independent of operation buttons.
  tab.querySelectorAll('.rune-grand-total,.ignore-result-surface,.prog-bar-wrap,.hexa-time-surface,.hexa-website-result').forEach(card=>{
   card.classList.add('site-summary-card');G.setCardRole(card,'info');
  });

  tab.querySelectorAll('.hexa-website-panel').forEach(card=>card.classList.add('calculator-section'));
  tab.querySelectorAll('.hexa-inputs > div').forEach(group=>{const field=group.querySelector('input'),label=group.querySelector('label');if(field&&label)label.htmlFor=field.id;});
  const result=tab.querySelector('#result-hexa-sim'),resultSurface=tab.querySelector('.hexa-sim-result-surface');
  if(result&&resultSurface&&!resultSurface.dataset.visibilityObserver){
   const sync=()=>{resultSurface.hidden=result.style.display==='none';};
   new MutationObserver(sync).observe(result,{attributes:true,attributeFilter:['style']});
   resultSurface.dataset.visibilityObserver='true';sync();
  }
  tab.querySelectorAll('.equip-card').forEach(card=>card.classList.add('site-tinted-card','site-input-group'));
  tab.querySelectorAll('.equip-card,.rune-calc-card,.prog-item').forEach(card=>card.classList.add('site-focus-card'));
  tab.querySelectorAll('input:not([type=checkbox]):not([type=radio]),select').forEach(field=>{
   field.classList.add('site-field');
   // Standalone custom rewards use the shared glass numeric editor, without another shell.
   if(field.matches('.liberation-boss-custom-traces'))field.classList.add('site-glass-field');
   const shell=field.closest('.site-select-shell,.rune-progress-input,.genesis-editor,.liberation-ticket-stepper');
   field.classList.toggle('site-field-inner',Boolean(shell));
   if(shell)shell.classList.add('site-field-shell');
   if(shell?.matches('.rune-progress-input,.genesis-editor,.liberation-ticket-stepper')){shell.classList.add('site-value-control');G.decorate(shell);}
  });
  tab.querySelectorAll('select:not([hidden])').forEach(field=>{
   if(!field.labels.length&&!field.hasAttribute('aria-label')) {
    const boss=field.closest('.liberation-boss-card')?.querySelector('header strong')?.textContent.trim();
    const core=field.closest('.prog-item')?.querySelector('.liquid-surface-content > div')?.textContent.trim();
    if(boss||core)field.setAttribute('aria-label',boss?boss+'難度':core+'等級');
   }
   G.decorateSelect(field,{fitContent:true});
  });
  tab.querySelectorAll('.btn-clear,.action-btn,.liberation-reset-btn').forEach(button=>{
   const isClear=button.matches('.btn-clear,.clear-btn,.liberation-reset-btn');
   G.decorateAction(button,{kind:isClear?'danger':'primary'});
  });
  G.bindWebsiteInteractions(tab,{groups:'.equip-card,.rune-calc-card:not(.authentic-rune-card-locked),.prog-item,.liberation-boss-card'});
 }
 window.GMSMSite=Object.freeze({decorateTab});
})();
/* Beta pilot allowlist: no game scene or modal decoration. */
document.addEventListener('DOMContentLoaded', () => {
 const G=window.GMSMGlass;
 document.querySelectorAll('#tab-home .app-card').forEach(card=>{
  card.classList.add('site-entry');
  G.decorate(card,'.app-status-badge');G.setCardRole(card,'entry');
 });
 G.decorateAll(document.querySelectorAll('#tab-home .data-backup-panel,#tab-home .memo-card,#tab-hyper-stat .hyper-overview,#tab-hyper-stat .hyper-profile-tab'));
 document.querySelectorAll('#tab-home .data-backup-panel,#tab-home .memo-card,#tab-hyper-stat .hyper-overview,#tab-hyper-stat .hyper-profile-tab').forEach(card=>G.setCardRole(card,card.matches('.hyper-profile-tab')?'choice':card.querySelector('input,select,textarea')?'input':'info'));
 document.querySelectorAll('#tab-home .data-backup-btn').forEach(button=>{
  G.decorateAction(button,{kind:button.classList.contains('data-backup-clear')?'danger':'primary'});
 });
 const top=document.getElementById('mobile-back-to-top');
 if(top){top.classList.add('glass-action');G.decorate(top);G.setInteraction(top,'action');}
 document.querySelectorAll('#tab-hyper-stat .hyper-bottom-actions button').forEach(button=>button.classList.add('site-button'));
 document.querySelectorAll('#tab-hyper-stat .hyper-bottom-actions button').forEach(button=>{G.decorateAction(button,{kind:'danger'});});
 document.querySelectorAll('#tab-hyper-stat .hyper-overview-item').forEach(card=>card.classList.add('site-summary-inset'));
 G.bindWebsiteInteractions(document.getElementById('tab-home'));
 decorateHyperStatControls(document.getElementById('tab-hyper-stat'));
 G.bindWebsiteInteractions(document.getElementById('tab-hyper-stat'));
 ['notice','star','ignore','rune','hexa-prog','liberation','hexa-lazy','hexa-reset','hexa-sim',...window.GMSMSimulatorSettings.ids].forEach(window.GMSMSite.decorateTab);
 const initial=new URL(location.href).searchParams.get('tab');
 if(['notice','star','hexa-visual','hyper-stat','ignore','rune','hexa-prog','liberation','hexa-lazy','hexa-reset','hexa-sim',...window.GMSMSimulatorSettings.ids].includes(initial)) switchTab(initial);
 else document.getElementById('site-navigation').classList.add('is-home');
});

