/* Explicit website surfaces. Never decorate canvas output, stage-host or iframe runtime. */
(() => {
 const G=window.GMSMGlass;
 if(!G)return;
 document.querySelectorAll('.settings-panel').forEach(panel=>G.decorateChoices(panel));
 const generator=document.body.classList.contains('generator-tool');
 const selectors=generator ? '.panel,.style-option,.custom-mode-toggle' : '.settings-panel,.stats-text,.orientation-hint';
 document.querySelectorAll(selectors).forEach(surface=>{
  if(surface.matches('.style-option,.custom-mode-toggle'))surface.classList.add('site-choice');
  if(surface.matches('.panel,.settings-panel'))surface.classList.add('site-calculator');
  if(surface.matches('.panel,.settings-panel,.stats-text,.orientation-hint'))surface.classList.add('calculator-section');
  if(!generator&&surface.matches('.stats-text'))surface.classList.add('site-summary-card');
  G.decorate(surface);
  if(!surface.matches('.site-choice'))G.setCardRole(surface,surface.matches('.settings-panel,.panel')&&surface.querySelector('input,select,textarea')?'input':'info');
 });
 document.querySelectorAll(generator ? '.settings-panel input:not([type=radio]):not([type=checkbox])' : '.settings-panel select').forEach(field=>field.classList.add(generator?'site-field':'site-native-field'));
 // First select sample: prayer level only. Shared helper can be reused by other independent tools.
 if(!generator)document.querySelectorAll('.settings-panel select').forEach(field=>G.decorateSelect(field,{fitContent:true}));
 document.querySelectorAll(generator ? '.settings-panel .action-btn' : '.settings-panel .btn-reset-simulator,.settings-panel .btn-sound').forEach(button=>{
  const refresh=()=>{
   if(button.classList.contains('btn-sound'))G.decorateSound(button);
   else G.decorateAction(button,{kind:button.matches('.clear-btn,.btn-reset-simulator')?'danger':'primary'});
  };
  refresh();
  if(button.classList.contains('btn-sound')){
   // The sound module replaces textContent after a click; restore this button's material only.
   new MutationObserver(()=>{if(!button.querySelector(':scope > .liquid_glass-cover'))refresh();}).observe(button,{childList:true});
  }
 });
 document.querySelectorAll('.settings-panel').forEach(panel=>G.bindWebsiteInteractions(panel));
})();
