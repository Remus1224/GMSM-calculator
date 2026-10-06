/* Shared transient status: plain text, accepted glass and replaceable lifetime. */
(() => {
 'use strict';
 const timers=new WeakMap();
 function show(message,{duration=5000,root=document.body}={}) {
  let node=root.querySelector(':scope > .site-toast');
  if(!node){
   node=document.createElement('div');node.className='site-toast';node.hidden=true;
   node.setAttribute('role','status');node.setAttribute('aria-live','polite');
   root.append(node);
  }
  const glass=window.GMSMGlass;
  glass?.decorate(node);glass?.setCardRole(node,'info');
  (node.querySelector(':scope > .liquid-surface-content')||node).textContent=String(message);
  clearTimeout(timers.get(node));node.hidden=false;
  timers.set(node,setTimeout(()=>{node.hidden=true;timers.delete(node);},duration));
 }
 window.GMSMNotify=Object.freeze({show});
})();
