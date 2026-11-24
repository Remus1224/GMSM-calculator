export function createP7IdleControl({enabled,getInstance,onFault,now=()=>performance.now()}) {
 const state={enabled,suspended:false,fault:null,capability:'NOT_PROBED',pauseCalls:0,resumeCalls:0,lastTransition:null};
 let owner=null,shop=false,receipt=null,pending=null;
 const fault=e=>{state.fault=String(e);state.lastTransition={action:'fault',at:now()};onFault(state.fault);return false;};
 function resume(reason){
  if(!enabled)return true;if(state.fault)return false;if(!state.suspended)return true;
  if(getInstance()?.Module!==owner)return fault('P7_MODULE_CHANGED');
  try{const r=owner.resumeMainLoop();if(r?.then)throw Error('P7_ASYNC_RESUME');state.suspended=false;state.resumeCalls++;state.lastTransition={action:'resume',reason,at:now()};return true;}catch(e){return fault(e);}
 }
 return Object.freeze({
  snapshot:()=>({...state,pendingClear:pending,shop}),
  scene(value){shop=value===true;if(!shop)resume('leave-shop');},
  beforeCommand(reason){if(!resume(reason))return false;receipt=null;return true;},
  clearToken(token){pending=token;receipt=null;},
  receive(value){if(!enabled)return;if(pending!==null){if(value.phase!=='P7_IDLE'||value.token!==pending)return;pending=null;}receipt=value;},
  maybePause({prepared,loading,disposed,error,scope,selection,presentation,effectiveMask}){
   if(!enabled||state.fault||state.suspended||!shop||!prepared||loading||disposed||error||scope||selection||presentation||effectiveMask!==0||pending!==null)return;
   if(!['P7_PREPARED','P7_IDLE'].includes(receipt?.phase)||!Array.isArray(receipt.rootActive)||receipt.rootActive.length!==2||receipt.rootActive.some(v=>v!==false)||!Array.isArray(receipt.particles)||receipt.particles.length!==5||receipt.particles.some(p=>p.count!==0||p.playing!==false))return;
   const m=getInstance()?.Module;if(typeof m?.pauseMainLoop!=='function'||typeof m?.resumeMainLoop!=='function'){state.capability='UNAVAILABLE';return;}owner=m;state.capability='AVAILABLE';
   try{const r=m.pauseMainLoop();if(r?.then)throw Error('P7_ASYNC_PAUSE');state.suspended=true;state.pauseCalls++;state.lastTransition={action:'pause',at:now()};}catch(e){try{m.resumeMainLoop();state.resumeCalls++;}catch(recovery){state.suspended=null;}fault(e);}
  },resume
 });
}
