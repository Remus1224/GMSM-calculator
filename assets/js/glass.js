/* Shared DOM layering. Preserves controls, IDs and DOM order. */
(() => {
 'use strict';
 function decorate(surface, floatingSelector) {
  if(!surface || surface.querySelector(':scope > .liquid_glass-cover')) return;
  const content=document.createElement(['BUTTON','LABEL'].includes(surface.tagName) ? 'span' : 'div');
  content.className='liquid-surface-content';
  for(const node of [...surface.childNodes]) {
   if(node.nodeType===1 && floatingSelector && node.matches(floatingSelector))continue;
   content.append(node);
  }
  surface.classList.add('glass-surface','site-card');
  for(const name of ['cover','sharp','reflect']) {
   const layer=document.createElement('span');
   layer.className='liquid_glass-'+name;
   layer.setAttribute('aria-hidden','true');
   surface.append(layer);
  }
  surface.append(content);
 }
 // Opt-in native select shell. Options, label, focus and change listeners stay on the select.
 function decorateSelect(field, options = {}) {
  if(!field?.matches('select')||field.hidden||field.multiple||field.size>1)return;
  let shell=field.closest('.site-select-shell');
  if(!shell) {
   shell=document.createElement('div');
   shell.className='site-select-shell';
   field.before(shell);shell.append(field);field.classList.add('site-select-control');
   decorate(shell);
   const affordance=document.createElement('span');
   affordance.className='site-select-affordance';affordance.setAttribute('aria-hidden','true');
   shell.append(affordance);
  }
  if(options?.fitContent&&!shell.classList.contains('site-select-fit-content')) {
   shell.classList.add('site-select-fit-content','site-select-compact');
   // CSS measures all option labels in an overlapping, inaccessible sizing grid.
   // Selection changes keep a stable width; fonts and responsive sizing stay in CSS.
   const sizer=document.createElement('span');
   sizer.className='site-select-sizer';sizer.setAttribute('aria-hidden','true');
   const syncLabels=()=>sizer.replaceChildren(...[...field.options].map(option=>{
    const label=document.createElement('span');label.textContent=option.label;return label;
   }));
   syncLabels();shell.append(sizer);
   new MutationObserver(syncLabels).observe(field,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['label']});
  }
  setInteraction(shell,'field');
  return shell;
 }
 // Tools explicitly opt in through shared choice markup; never scan or convert game radios.
 function decorateControls(root){
  root?.querySelectorAll('.site-radio-option,.site-toggle-control,.site-value-control').forEach(control=>{
   // A value and its caption share one hover/focus owner, like a select shell.
   if(control.matches('.site-value-control'))control.querySelectorAll('input:not([type=radio]):not([type=checkbox]):not([type=hidden]),textarea').forEach(field=>field.classList.add('site-field-inner'));
   decorate(control);setInteraction(control,control.matches('.site-value-control')?'field':control.matches('.site-radio-custom')?'group':control.matches('.site-toggle-control')?'toggle':'choice');
  });
 }
 const decorateChoices=decorateControls;
 // Action kinds change paint only; the explicit operation class owns common geometry and interaction.
 function decorateAction(button,{kind='primary'}={}){
  if(!button?.matches('button'))return;
  button.classList.add('site-button','glass-action','site-operation');
  button.classList.toggle('glass-action-danger',kind==='danger');
  button.classList.toggle('glass-action-primary',kind==='primary');
  decorate(button);setInteraction(button,'action');
 }
 function decorateSound(button){
  if(!button?.matches('button.btn-sound'))return;
  button.classList.add('glass-action','site-sound-control');
  decorate(button);setInteraction(button,'toggle');
 }
 function setCardRole(surface,role){
  if(!surface||!['entry','choice','toggle','input','group','info','static'].includes(role))return;
  surface.classList.remove('site-card-entry','site-card-choice','site-card-toggle','site-card-input','site-card-group','site-card-info','site-card-static');
  surface.classList.add('site-card-'+role);
  if(['entry','choice','toggle','group'].includes(role))setInteraction(surface,role);
  else {surface.classList.remove('site-interactive');delete surface.dataset.siteInteraction;}
 }
 // One motion owner per operable unit. Adapters supply small-group boundaries;
 // this helper never scans the document, game scenes, canvases or iframe runtimes.
 const controlSelector='button,a[href],summary,input:not([type=hidden]),select,textarea,[role=button],[onclick],.site-radio-option,.site-toggle-control,.site-value-control,.site-choice,.site-glass-toggle,.site-field-shell';
 const controlHost='.site-select-shell,.site-value-control,.site-radio-option,.site-toggle-control,.site-choice,.site-glass-toggle,.site-field-shell';
 const excluded='.site-interaction-exempt,.site-card-static,.stage-host,.simulator-frame,canvas';
 const watchedRoots=new WeakMap();
 let touchBound=false;
 function setInteraction(surface,kind){
  if(!surface||!['entry','action','choice','toggle','field','group'].includes(kind))return;
  surface.classList.add('site-interactive');surface.dataset.siteInteraction=kind;
  bindTouchFeedback();
 }
 function getInteractionOwner(element){
  if(!element||element.closest(excluded))return null;
  const control=element.closest('.site-interactive');
  if(control?.matches('[data-site-interaction=action],[data-site-interaction=choice],[data-site-interaction=toggle]'))return control;
  return element.closest('[data-site-interaction=group]')||element.closest('[data-site-interaction=entry]')||control;
 }
 // Category navigation has a calm selected marker, distinct from radio choices.
 function decorateCategoryTab(tab){
  if(!tab?.matches('[role=tab]'))return;
  tab.classList.add('site-category-tab');decorate(tab);setCardRole(tab,'choice');
 }
 // One delegated touch adapter follows existing semantic roles, including lazy DOM.
 // Fields/groups keep their focus feedback; passive info and game scenes never press.
 function bindTouchFeedback(){
  if(touchBound)return;touchBound=true;
  let press=null;
  const releases=new WeakMap();
  function finish(){
   if(!press)return;
   const owner=press.owner;press=null;owner.classList.remove('site-touch-pressed');
   releases.set(owner,setTimeout(()=>{
    owner.classList.remove('site-touch-feedback');delete owner.dataset.siteTouchKind;releases.delete(owner);
   },180));
  }
  document.addEventListener('pointerdown',event=>{
   if(event.pointerType!=='touch'||!event.isPrimary)return;
   finish();
   const target=event.target;
   if(!(target instanceof Element)||target.closest(excluded+',[inert],[aria-disabled=true]')||target.matches(':disabled'))return;
   // An editor inside a combined custom-radio control must keep native focus.
   if(target.closest('input:not([type=radio]):not([type=checkbox]),select,textarea,.site-select-shell,.site-field-shell,.site-value-control'))return;
   const owner=getInteractionOwner(target);
   if(!owner||!owner.closest('.glass-theme')||owner.matches(':disabled')||owner.querySelector('input:disabled'))return;
   let kind=owner.dataset.siteInteraction;
   if(kind==='group'&&owner.classList.contains('site-radio-custom'))kind='choice';
   if(!['entry','action','choice','toggle'].includes(kind))return;
   if(owner.classList.contains('site-category-tab'))kind='category';
   clearTimeout(releases.get(owner));
   owner.dataset.siteTouchKind=kind;owner.classList.add('site-touch-feedback','site-touch-pressed');
   press={owner,id:event.pointerId,x:event.clientX,y:event.clientY};
  },{passive:true});
  document.addEventListener('pointermove',event=>{
   if(press&&event.pointerId===press.id&&Math.hypot(event.clientX-press.x,event.clientY-press.y)>9)finish();
  },{passive:true});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(name,event=>{
   if(press&&event.pointerId===press.id)finish();
  },{passive:true});
  document.addEventListener('scroll',finish,{capture:true,passive:true});
  window.addEventListener('blur',finish);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
 }
 function bindWebsiteInteractions(root,{groups=''}={}){
  if(!root)return;
  const visit=branch=>{
   if(!(branch instanceof Element))return;
   if(groups){
    const cards=[...(branch.matches(groups)?[branch]:[]),...branch.querySelectorAll(groups)];
    cards.filter(card=>!card.closest(excluded)).forEach(card=>setCardRole(card,'group'));
   }
   const controls=[...(branch.matches(controlSelector)?[branch]:[]),...branch.querySelectorAll(controlSelector)];
   for(const control of controls){
    if(control.closest(excluded)||control.matches('[hidden],.site-select-sizer *'))continue;
    const host=control.matches('input,select,textarea')?control.closest(controlHost):control;
    const target=host||control;
    if(target.matches('[role=tab]')){decorateCategoryTab(target);continue;}
    if(target.classList.contains('site-interactive'))continue;
    if(target.matches('input[type=radio],input[type=checkbox]')&&target.closest('[data-site-interaction=group]'))continue;
    // Layering, geometry and events remain owned by the original control/decorator.
    const kind=target.matches('.site-select-shell,.site-value-control,.site-field-shell,input:not([type=radio]):not([type=checkbox]),select,textarea')?'field':
     target.matches('[role=tab],[role=radio],.site-radio-option')?'choice':
     target.matches('summary,.site-toggle-control,.site-glass-toggle,input[type=checkbox],[role=switch],[aria-pressed],[aria-expanded]')||target.querySelector('input[type=checkbox]')?'toggle':
     target.matches('.site-choice,input[type=radio]')||target.querySelector('input[type=radio]')?'choice':
     target.matches('a[href]')?'entry':'action';
    setInteraction(target,kind);
   }
  };
  visit(root);
  if(watchedRoots.has(root))return;
  const observer=new MutationObserver(records=>{
   for(const record of records)for(const node of record.addedNodes)visit(node);
  });
  observer.observe(root,{childList:true,subtree:true});watchedRoots.set(root,observer);
 }
 window.GMSMGlass=Object.freeze({setInteraction,getInteractionOwner,bindWebsiteInteractions,decorateCategoryTab,setCardRole,decorate,decorateSelect,decorateChoices,decorateControls,decorateAction,decorateSound,decorateAll:(surfaces,role)=>surfaces.forEach(surface=>{decorate(surface);if(role)setCardRole(surface,role);})});
 // Headers are explicit website controls on both integrated and independent tools.
 const bindHeaders=()=>{
  if(!document.documentElement.classList.contains('glass-theme'))return;
  document.querySelectorAll('.unified-nav').forEach(nav=>{
   nav.querySelectorAll('.unified-home').forEach(home=>setInteraction(home,'entry'));
   bindWebsiteInteractions(nav);
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindHeaders,{once:true});
 else bindHeaders();
})();

