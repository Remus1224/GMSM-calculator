import {createDrawLedger} from './analytics-draw-ledger.mjs?v=1';
// Outer-page bridge only. Never transmit individual results, run IDs, seeds, URLs or error text.
const frame=document.getElementById('crystal-frame'),analytics=window.GMSMAnalytics;
const ledger=createDrawLedger();
let flushTimer=0,phaseObserver=null,idleJob=0;
let timer=0,boundDoc=null,boundWindow=null,lastDraws=null,trustedDrawIntent=false,readyReported=false,terminal=false;
function observeDraws(){try{
 const state=frame.contentWindow.CrystalTreasureBoxPlayer?.snapshot();if(!state)return;
 if(!phaseObserver){const buy=boundDoc.getElementById('shop-buy-ten');if(buy){phaseObserver=new MutationObserver(scheduleStats);phaseObserver.observe(buy,{attributes:true,attributeFilter:['hidden','disabled']});}}
 const increased=lastDraws!==null&&state.draws>lastDraws;
 ledger.observe(state,increased&&trustedDrawIntent);
 if(increased){if(trustedDrawIntent)analytics?.use('simulate');trustedDrawIntent=false;}
 if(lastDraws!==null&&state.draws<lastDraws)trustedDrawIntent=false;
 lastDraws=state.draws;scheduleStats();
}catch{}}
// No animation-frame hook or persistent statistics polling. Only state/phase changes wake this.
function inShop(){const buy=boundDoc?.getElementById('shop-buy-ten');return !document.hidden&&buy&&!buy.hidden&&!buy.disabled;}
function cancelStats(){clearTimeout(flushTimer);flushTimer=0;if(idleJob)window.cancelIdleCallback?.(idleJob);idleJob=0;}
function scheduleStats(){
 cancelStats();if(!inShop())return;
 flushTimer=setTimeout(()=>{
  flushTimer=0;
  const flush=()=>{idleJob=0;if(!inShop())return;const batch=ledger.take();if(batch)analytics?.drawStats?.(batch);};
  if(window.requestIdleCallback)idleJob=window.requestIdleCallback(flush,{timeout:1500});else flush();
 },1000);
}
function click(event){if(!event.isTrusted)return;const button=event.target.closest?.('button');if(button&&!button.disabled&&['shop-buy-single','shop-buy-ten','retry'].includes(button.id))trustedDrawIntent=true;}
function stop(){clearInterval(timer);timer=0;}
function poll(){try{const win=frame.contentWindow,s=win.__releaseStartup,m=win.__movieCache?.snapshot();if(performance.now()>180000&&!s){analytics?.loadError('timeout');terminal=true;stop();return;}if(!s)return;
 if(s.status==='FAILED'||s.optionalError){analytics?.loadError(m?.status==='FAILED'?'movies':s.optionalError?'effects':win.cleanRebuild?'assets':'bootstrap');terminal=true;stop();return;}
 if(s.optionalReady){if(!readyReported){const cache=!m?.persistentAvailable?'unavailable':m.persistentHits===m.total?'hit':m.persistentHits>0?'partial':'miss';analytics?.ready({load_time_ms:Math.round(performance.now()),cache_status:cache});readyReported=true;}stop();return;}
 if(performance.now()>180000){analytics?.loadError('timeout');terminal=true;stop();}
}catch{}}
function bind(){try{cancelStats();phaseObserver?.disconnect();phaseObserver=null;boundDoc?.removeEventListener('click',click,true);boundWindow?.removeEventListener('crystal-treasure-box-player-state',observeDraws);boundWindow=frame.contentWindow;boundDoc=boundWindow.document;lastDraws=null;trustedDrawIntent=false;boundDoc.addEventListener('click',click,true);boundWindow.addEventListener('crystal-treasure-box-player-state',observeDraws);const phaseNode=boundDoc.getElementById('shop-buy-ten');if(phaseNode){phaseObserver=new MutationObserver(scheduleStats);phaseObserver.observe(phaseNode,{attributes:true,attributeFilter:['hidden','disabled']});}observeDraws();stop();poll();if(!readyReported&&!terminal)timer=setInterval(poll,500);}catch{}}
frame.addEventListener('load',bind);bind();
document.getElementById('reset-simulator').addEventListener('click',()=>{trustedDrawIntent=false;});
document.addEventListener('visibilitychange',scheduleStats);
addEventListener('pagehide',()=>{stop();cancelStats();});addEventListener('pageshow',e=>{if(e.persisted)bind();});
