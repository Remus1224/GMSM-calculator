/* Shared Genesis-style view switch: geometry, travelling plate and keyboard input.
   Each tool keeps its own selected state and content rendering. */
(() => {
 'use strict';
 const mounted=new WeakMap();
 function mount(nav,{indicator:existing,tabSelector='[role="tab"]'}={}) {
  if(!nav)return null;
  mounted.get(nav)?.destroy();
  nav.classList.add('site-view-switch');
  const glass=window.GMSMGlass;
  glass?.decorate(nav);glass?.setCardRole(nav,'info');
  const indicator=existing||document.createElement('span');
  indicator.classList.add('site-view-indicator','site-summary-card');
  indicator.setAttribute('aria-hidden','true');
  if(!existing)(nav.querySelector(':scope > .liquid-surface-content')||nav).prepend(indicator);
  glass?.decorate(indicator);glass?.setCardRole(indicator,'info');
  let frame=0,readyFrame=0,disposed=false;
  const tabs=()=>[...nav.querySelectorAll(tabSelector)];
  tabs().forEach(tab=>tab.classList.add('site-view-tab','site-interaction-exempt'));
  function refresh(){
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    if(disposed||!nav.isConnected||!nav.getBoundingClientRect().width)return;
    const selected=nav.querySelector('[aria-selected="true"]');if(!selected)return;
    const target=selected.getBoundingClientRect(),host=indicator.parentElement.getBoundingClientRect();
    indicator.style.width=target.width+'px';indicator.style.height=target.height+'px';
    indicator.style.translate=`${target.left-host.left}px ${target.top-host.top}px`;
    tabs().forEach(tab=>{tab.tabIndex=tab===selected?0:-1;});
    if(!nav.classList.contains('is-ready')){
     cancelAnimationFrame(readyFrame);
     readyFrame=requestAnimationFrame(()=>{if(!disposed)nav.classList.add('is-ready');});
    }
   });
  }
  function keydown(event){
   const list=tabs(),index=list.indexOf(event.target);if(index<0)return;
   const next=event.key==='ArrowRight'?(index+1)%list.length:event.key==='ArrowLeft'?(index+list.length-1)%list.length:event.key==='Home'?0:event.key==='End'?list.length-1:null;
   if(next===null)return;
   event.preventDefault();list[next].click();list[next].focus();refresh();
  }
  const resize=new ResizeObserver(refresh);
  const selection=new MutationObserver(refresh);
  resize.observe(nav);selection.observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-selected']});
  nav.addEventListener('click',refresh);nav.addEventListener('keydown',keydown);
  const controller={refresh,destroy(){
   disposed=true;cancelAnimationFrame(frame);cancelAnimationFrame(readyFrame);
   resize.disconnect();selection.disconnect();
   nav.removeEventListener('click',refresh);nav.removeEventListener('keydown',keydown);
   if(!existing)indicator.remove();
   if(mounted.get(nav)===controller)mounted.delete(nav);
  }};
  mounted.set(nav,controller);refresh();return controller;
 }
 window.GMSMViewSwitch=Object.freeze({mount});
})();
