/* Explicit outer boundaries. Game controls and modals never enter this adapter. */
(() => {
 const ids=['transcend','craft','acc-enhance','emb-enhance','will'];
 const watchedButtons=new WeakSet();
 function decorateTab(id) {
  if(!ids.includes(id))return false;
  const tab=document.getElementById('tab-'+id),G=window.GMSMGlass;
  if(!tab||!G)return true;
  const panels=id==='will' ? tab.querySelectorAll(':scope > .will-settings-wrapper > .settings-panel') : tab.querySelectorAll(':scope > .settings-panel');
  panels.forEach(panel=>{
   panel.classList.add('simulator-settings-surface','site-calculator');
   G.decorate(panel);G.setCardRole(panel,'input');
   panel.querySelectorAll('.stats-text').forEach(stats=>{
    let shell=stats.closest('.simulator-stats-surface');
    if(!shell){
     shell=document.createElement('div');shell.className='simulator-stats-surface calculator-section site-summary-card';
     stats.before(shell);shell.append(stats);G.decorate(shell);G.setCardRole(shell,'info');
    }
   });
   panel.querySelectorAll('input:is([type=text],[type=number]),select').forEach(field=>field.classList.add('site-field'));
   // Native radios remain responsible for selection, keyboard navigation and change events.
   G.decorateControls(panel);
   panel.querySelectorAll('.setting-row > label').forEach(label=>{
    const next=label.nextElementSibling;
    if(!label.querySelector('input')&&next?.matches('input,select')&&next.id)label.htmlFor=next.id;
   });
   panel.querySelectorAll('select:not([hidden])').forEach(field=>{
    const scrolls=field.closest('.cr-scroll-selects');
    if(scrolls&&!field.hasAttribute('aria-label')) {
     const caption=scrolls.closest('.setting-row')?.querySelector('.cr-setting-heading')?.textContent.trim();
     field.setAttribute('aria-label',caption+' 第'+([...scrolls.querySelectorAll('select')].indexOf(field)+1)+'張');
    }
    G.decorateSelect(field,{fitContent:true});
   });
   panel.querySelectorAll('.btn-reset-tr,.btn-sound').forEach(button=>{
    const refresh=()=>{
     if(button.classList.contains('btn-reset-tr'))G.decorateAction(button,{kind:'danger'});
     else G.decorateSound(button);
    };
    refresh();
    if(button.classList.contains('btn-sound')&&!watchedButtons.has(button)){
     watchedButtons.add(button);
     // Existing sound functions replace text and className; restore only this button's material.
     new MutationObserver(()=>{if(!button.querySelector(':scope > .liquid_glass-cover'))refresh();}).observe(button,{childList:true});
    }
   });
   G.bindWebsiteInteractions(panel);
  });
  return true;
 }
 window.GMSMSimulatorSettings=Object.freeze({decorateTab,ids:Object.freeze(ids)});
})();
