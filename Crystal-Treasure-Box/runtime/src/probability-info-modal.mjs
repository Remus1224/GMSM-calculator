// Player-requested modal behavior; this is not native probability UI/data.
export function createProbabilityInfoModal({trigger,overlay,dialog,stayButton,closeButton,isShopIdle}){
  if(!trigger||!overlay||!dialog||!stayButton||!closeButton||typeof isShopIdle!=='function')throw new TypeError('PROBABILITY_MODAL_BINDINGS_REQUIRED');
  let open=false,previousFocus=null;
  const stop=event=>{event.preventDefault?.();event.stopPropagation?.();event.stopImmediatePropagation?.();};
  const openFromShop=event=>{
    stop(event);
    if(open||!isShopIdle())return;
    previousFocus=globalThis.document?.activeElement??trigger;
    open=true;overlay.hidden=false;overlay.setAttribute?.('aria-hidden','false');
    dialog.focus?.({preventScroll:true});
  };
  const stayOpen=event=>{stop(event);};
  const closeToShop=event=>{
    stop(event);
    if(!open)return;
    open=false;overlay.hidden=true;overlay.setAttribute?.('aria-hidden','true');
    if(previousFocus?.isConnected!==false)previousFocus?.focus?.({preventScroll:true});
    else trigger.focus?.({preventScroll:true});
    previousFocus=null;
  };
  const buttonEvents=new Set(['click','pointerdown','pointerup','mousedown','mouseup','touchstart','touchend']);
  const block=event=>{
    if(!open)return;
    const target=event.target;
    const buttonTarget=target&&dialog.contains(target)&&(stayButton.contains(target)||closeButton.contains(target));
    if(!(buttonTarget&&buttonEvents.has(event.type)))event.preventDefault?.();
    event.stopPropagation?.();event.stopImmediatePropagation?.();
  };
  const trapTab=event=>{
    if(!open||event.key!=='Tab')return;
    stop(event);
    const first=stayButton,last=closeButton,active=globalThis.document?.activeElement;
    if(event.shiftKey){(active===first?last:first).focus?.({preventScroll:true});}
    else{(active===last?first:last).focus?.({preventScroll:true});}
  };
  trigger.addEventListener('click',openFromShop);
  stayButton.addEventListener('click',stayOpen);
  closeButton.addEventListener('click',closeToShop);
  for(const type of ['click','pointerdown','pointerup','mousedown','mouseup','touchstart','touchend'])overlay.addEventListener(type,block);
  overlay.addEventListener('wheel',block,{passive:false});
  overlay.addEventListener('touchmove',block,{passive:false});
  dialog.addEventListener('keydown',trapTab);
  return Object.freeze({snapshot:()=>({open}),openFromShop,stayOpen,closeToShop});
}
