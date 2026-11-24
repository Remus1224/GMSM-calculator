// Engineering Web mount/scheduling only. No particle source parameters or game results.
export const TUNING_DEFAULTS = Object.freeze({offsetX:0,offsetY:0,scale:1.8,timingOffsetMs:0,holdAt:2.5,brightness:70,liveAmplitude:1.5,liveSpeed:.35});
export const TUNING_FIELDS = Object.freeze({
  offsetX:{min:-200,max:200,step:1,label:'水平 X',unit:'stage px'},
  offsetY:{min:-200,max:200,step:1,label:'垂直 Y（正值向下）',unit:'stage px'},
  scale:{min:1.8,max:1.8,step:.01,label:'暫定統一倍率（固定）',unit:'×'},
  liveAmplitude:{min:0,max:5,step:.1,label:'HOLD LIVE 動態幅度',unit:'%'},
  liveSpeed:{min:.1,max:1,step:.05,label:'HOLD LIVE 動態速度',unit:'Hz'},
  holdAt:{min:.8,max:3.2,step:.05,label:'光暈保持時刻（重播套用）',unit:'秒'},
  brightness:{min:0,max:100,step:1,label:'保持後中央亮度',unit:'%'},
  timingOffsetMs:{min:0,max:2000,step:25,label:'播放延遲（正值延後）',unit:'ms'}
});
export function clampTuning(key,value){
  const spec=TUNING_FIELDS[key];
  if(!spec||value===''||!Number.isFinite(Number(value)))return null;
  const bounded=Math.max(spec.min,Math.min(spec.max,Number(value)));
  return Number((spec.min+Math.round((bounded-spec.min)/spec.step)*spec.step).toFixed(2));
}
// A request retains its scene/run and event origin while waiting for preload or delay.
// Clear/Confirm cancels both. The timer can never acquire a later run.
export function createPlaybackSchedule({now=()=>performance.now(),setTimer=setTimeout,clearTimer=clearTimeout,isReady,getRun,start}){
  let pending=null,timer=null,last=null,serial=0;
  function cancel(reason){if(timer!==null)clearTimer(timer);timer=null;if(pending)last={...pending,cancelledAt:now(),reason};pending=null;serial++;}
  function wake(){
    if(timer!==null)clearTimer(timer);timer=null;
    if(!pending)return;
    if(pending.run!==getRun()){cancel('run-changed');return;}
    const remaining=pending.dueAt-now();
    if(remaining>0){const ticket=serial;timer=setTimer(()=>{if(ticket===serial)wake();},remaining);return;}
    if(!isReady())return;
    const request=pending;pending=null;last={...request,firedAt:now()};start(request.effect,last);
  }
  function request(effect,referenceAt,delayMs,reference){cancel('replaced');pending={run:getRun(),effect,requestedAt:now(),referenceAt,reference,delayMs,dueAt:referenceAt+delayMs};if(pending.run===null){cancel('no-result');return;}wake();}
  function retime(delayMs){if(!pending||pending.effect!=='flash02')return;pending.delayMs=delayMs;pending.dueAt=pending.referenceAt+delayMs;wake();}
  return Object.freeze({request,wake,retime,cancel,snapshot:()=>({pending:pending?{...pending}:null,last:last?{...last}:null})});
}
export function createFlash02Tuning({onMount,onTiming,onHold,onHoldNow,onReplay,onStop,getContext}){
  const settings={...TUNING_DEFAULTS};let changes=0,exported=null,exportUrl=null;
  const el=document.createElement('details');el.id='p8r3-panel';el.open=true;
  el.style.cssText='position:fixed;left:12px;top:85px;width:min(310px,calc(100vw - 24px));max-height:calc(100vh - 110px);overflow:auto;z-index:2147482999;background:#172332f5;color:#eef3fa;border:1px solid #7b9db8;border-radius:10px;padding:10px;font:13px/1.4 system-ui';
  el.innerHTML='<summary style="cursor:pointer;font-weight:bold">Flash02 視覺校準 · P8R3R5</summary><p>MANUAL_FIXTURE_ONLY · WEB_VISUAL_ADAPTATION<br>只改 FX；舞台 1280×720，來源中心 (640,360)。</p>'+
    Object.entries(TUNING_FIELDS).map(([key,spec])=>`<div style="margin:10px 0"><label for="p8r3-${key}">${spec.label} <output id="p8r3-${key}-out"></output></label><input id="p8r3-${key}" type="range" min="${spec.min}" max="${spec.max}" step="${spec.step}" style="display:block;width:100%"><input id="p8r3-${key}-number" aria-label="${spec.label}數字" type="number" min="${spec.min}" max="${spec.max}" step="${spec.step}" style="width:80px"> ${spec.unit}</div>`).join('')+
    '<p>延遲以結果入場（電影結束／Skip）為基準；手動重播以按下按鈕為基準。負延遲：UNSUPPORTED_PRE_ROLL_NOT_RUN，不預先模擬粒子。</p><div style="display:flex;flex-wrap:wrap;gap:6px"><button id="p8r3-replay" type="button">播放目前參數／重播</button><button id="p8r3-hold-now" type="button">立即保持目前光暈</button><button id="p8r3-stop" type="button">停止</button><button id="p8r3-reset" type="button">還原 0/0/1.80/0</button><button id="p8r3-export" type="button">匯出參數 JSON</button></div><p id="p8r3-status" role="status"></p><details><summary>匯出內容／複製</summary><pre id="p8r3-export-json" style="max-height:180px;overflow:auto;white-space:pre-wrap"></pre><a id="p8r3-download" hidden>下載 JSON</a></details><p>同批 11 卡反覆比較；重新整理回到預設值。可收合面板看完整舞台。</p>';
  document.body.append(el);const $=id=>el.querySelector('#'+id);
  function snapshot(){return {schema:'CrystalChest.R14P30P8R3.VisualTuning.v1',build:'R14P30P8R3R5_20261105A',classification:'WEB_VISUAL_ADAPTATION',activation:'MANUAL_FIXTURE_ONLY',source:{field:'EffectFlash_02_UI',gameObjectPathID:'7822162672251176467',particleSystems:3},origin:[640,360],settings:{...settings},defaults:{...TUNING_DEFAULTS},scalePolicy:'PLAYER_PROVISIONAL_FIXED_1.80',projectedOrigin:[640+settings.offsetX,360+settings.offsetY],ranges:TUNING_FIELDS,negativeTiming:'UNSUPPORTED_PRE_ROLL_NOT_RUN',settingChanges:changes,...getContext()};}
  function sync(){for(const [key,spec] of Object.entries(TUNING_FIELDS)){const value=settings[key];$('p8r3-'+key).value=value;$('p8r3-'+key+'-number').value=value;$('p8r3-'+key+'-out').textContent=(key==='scale'?value.toFixed(2):value)+' '+spec.unit;}}
  function set(key,value){const next=clampTuning(key,value);if(next===null){sync();return false;}if(settings[key]!==next){settings[key]=next;changes++;if(['holdAt','brightness','liveAmplitude','liveSpeed'].includes(key))onHold({...settings});else if(key==='timingOffsetMs')onTiming(next);else onMount({...settings});}sync();return true;}
  for(const key of Object.keys(TUNING_FIELDS))for(const suffix of ['','-number'])$('p8r3-'+key+suffix).addEventListener('input',e=>{if(e.target.value!=='')set(key,e.target.value);});
  $('p8r3-hold-now').onclick=()=>onHoldNow();
  $('p8r3-replay').onclick=()=>onReplay();$('p8r3-stop').onclick=()=>onStop();
  $('p8r3-reset').onclick=()=>{Object.assign(settings,TUNING_DEFAULTS);changes++;onMount({...settings});onTiming(0);onHold({...settings});sync();};
  $('p8r3-export').onclick=()=>{
    exported={...snapshot(),createdAt:new Date().toISOString(),adoptedOutputValues:{...settings}};
    const json=JSON.stringify(exported,null,2);$('p8r3-export-json').textContent=json;
    if(exportUrl)URL.revokeObjectURL(exportUrl);exportUrl=URL.createObjectURL(new Blob([json],{type:'application/json;charset=utf-8'}));
    const a=$('p8r3-download');a.href=exportUrl;a.download='P8R3R5_VISUAL_TUNING_RECEIPT.json';a.hidden=false;a.click();
  };
  function status(text,canPlay){$('p8r3-status').textContent=text;$('p8r3-replay').disabled=!canPlay;$('p8r3-hold-now').disabled=!canPlay||!['hold','hold-live'].includes(getContext().playbackMode)||getContext().choice!=='flash02';}
  function dispose(){if(exportUrl)URL.revokeObjectURL(exportUrl);el.remove();}
  $('p8r3-scale').disabled=true;$('p8r3-scale-number').disabled=true;
  sync();return Object.freeze({snapshot,settings:()=>({...settings}),status,dispose});
}
