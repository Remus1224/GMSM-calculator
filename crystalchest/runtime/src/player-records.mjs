import categories from './player-stat-categories.mjs';
export const statLabels={ancientCrystal:'古代輔助武器結晶',mythicSub:'神話輔助武器',legendarySub:'傳說輔助武器',chaos:'混沌裝備',ancient:'古代裝備',mythic:'神話裝備',legendary:'傳說裝備',rare:'罕見裝備',shards5:'混沌碎片 5 個交換券',shards10:'混沌碎片 10 個交換券'};
const KEY='crystalchest.player.v1';
const fresh=()=>({version:1,muted:false,draws:0,normalDraws:0,feverDraws:0,singles:0,normalTen:0,feverTen:0,feverTriggers:0,luckyTriggers:0,gaugeTriggers:0,items:Object.fromEntries(Object.keys(statLabels).map(k=>[k,0])),runIds:[],activationIds:[]});
export function createPlayerRecords({storage,onChange=()=>{}}={}){
 let state=fresh(),persistent=true,closed=false;
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{persistent=false;}}
 if(!storage)persistent=false;
 try{const saved=JSON.parse(storage?.getItem(KEY)||'null');if(saved?.version===1){
  for(const k of ['draws','normalDraws','feverDraws','singles','normalTen','feverTen','feverTriggers','luckyTriggers','gaugeTriggers'])if(Number.isSafeInteger(saved[k])&&saved[k]>=0)state[k]=saved[k];
  state.muted=saved.muted===true;
  for(const k of Object.keys(statLabels))if(Number.isSafeInteger(saved.items?.[k])&&saved.items[k]>=0)state.items[k]=saved.items[k];
  for(const k of ['runIds','activationIds'])if(Array.isArray(saved[k]))state[k]=saved[k].filter(x=>typeof x==='string').slice(-512);
 }}catch{persistent=false;}
 const snapshot=()=>({...state,items:{...state.items},runIds:[...state.runIds],activationIds:[...state.activationIds],persistent,shardsTotal:state.items.shards5*5+state.items.shards10*10});
 function save(){try{storage?.setItem(KEY,JSON.stringify(state));}catch{persistent=false;}onChange(snapshot());}
 function recordRun({pool,runId,results}){
  if(closed||!['NORMAL','FEVER'].includes(pool)||typeof runId!=='string'||!runId||state.runIds.includes(runId))return false;
  if(!Array.isArray(results)||![1,11].includes(results.length)||(pool==='FEVER'&&results.length!==11))return false;
  const keys=results.map(r=>r?.sourceRowKey||r?.officialSourceRowKey);
  // Exact source-row joins only. Reject the entire update if a key is unknown.
  if(keys.some(k=>!categories[k]||JSON.parse(k)[0]!==pool))return false;
  for(const k of keys)state.items[categories[k]]++;
  state.draws+=keys.length;state[pool==='NORMAL'?'normalDraws':'feverDraws']+=keys.length;
  state[pool==='FEVER'?'feverTen':keys.length===1?'singles':'normalTen']++;
  state.runIds.push(runId);state.runIds=state.runIds.slice(-512);save();return true;
 }
 function recordActivation({runId,lucky,accepted,before,after,diagnostic=false}){
  if(closed||diagnostic||!accepted||before?.phase!=='normal-progress'||after?.phase!=='fever-test-active'||!runId||state.activationIds.includes(runId))return false;
  state.feverTriggers++;state[lucky?'luckyTriggers':'gaugeTriggers']++;state.activationIds.push(runId);state.activationIds=state.activationIds.slice(-512);save();return true;
 }
 return{snapshot,recordRun,recordActivation,setMuted(value){if(closed)return;state.muted=!!value;save();},reset({dispose=false}={}){state=fresh();if(dispose)closed=true;save();}};
}
