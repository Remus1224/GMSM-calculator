import { createFlash02Measurement } from './flash02-measurement.mjs';
import { createFlash02Tuning, createPlaybackSchedule } from './flash02-player-tuning.mjs';
import { createFinalFlash02Panel } from './flash02-final-panel.mjs';
import { createContinuityMeter } from './flash02-continuity-meter.mjs';
import { evaluateP8IosDiagnostic, captureP8GateOracle, compareP8Rgb, evaluateP8RgbGate, matchP8GateInput, uprightP8Readback } from './p8-background-gate.mjs';
import { readUnityMemoryInfo } from './unity-memory-f12-diagnostic.mjs';
// P8R1 source playback preserved; R2 enables read-only timing/pixel observations.
export function createTenTimeMotionFixture({ redraw, appSnapshot, lazy = false, onLazyError = null }) {
  const lazyEnabled=Boolean(lazy);
  const query = new URLSearchParams(location.search);
  const iosRgbDiagnostic=query.get('p8iosRgbDiagnostic')==='1';
  const p8ProbeEnabled=query.get('mode')==='engineering'&&query.get('p8Probe')==='1';let skippedP8Probes=0;
  const legacyRequested=['r14p30P8','r14p30P8R1','r14p30P8R2','r14p30P8R3','r14p30P8R3R6','r14p30P8R3R7'].some(k=>query.get(k)==='1');
  const finalEnabled=!legacyRequested||query.get('r14p30P8R3R8')==='1'||query.get('r14p30P8Final')==='1';
  const inScene=query.get('r14p30P8R3R7')==='1';const isolated=inScene||query.get('r14p30P8R3R6')==='1';const isolationSamples=[];let isolatedChoice='raw-glow';let isolatedCanvas;
  const tuningEnabled=finalEnabled||query.get('r14p30P8R3')==='1';
  const measurement = query.get('r14p30P8R2') === '1' ? createFlash02Measurement(appSnapshot) : null;
  let playbackMode=tuningEnabled?(query.get('r14p30P8R3R5Mode')==='a'?'a':'hold-live'):'source';
  if(isolated)playbackMode='raw-glow';if(finalEnabled)playbackMode='raw-glow';
  let base = runtimeBase();
  // Continuity is engineering observation only; strict RGB transport validation is separate.
  const continuityEnabled=tuningEnabled&&(query.get('mode')!=='player'||query.get('r14p30P8R2')==='1');
  const continuity=continuityEnabled?createContinuityMeter():null;
  function runtimeBase(){return new URL(finalEnabled?'../assets/tentime-p8r3r8/Build/':isolated?'../assets/tentime-p8r3r6/Build/':tuningEnabled?(playbackMode==='source'?'../assets/tentime-p8r3/Build/':'../assets/tentime-p8r3r5/Build/'):'../assets/tentime-p8r1/Build/',import.meta.url);}
  const background = document.createElement('canvas'); background.width = 1280; background.height = 720;
  const bg = background.getContext('2d');
  let instance, surface, ready = false, loading = !lazyEnabled, error = null, disposed = false, preparePromise = null, reportedLazyError = null;
  let run = null, token = '', serial = 0, choice = 'off', lastChoice = 'flash02', presentation = null, pixels = null, identity = '', frame = 0, native = null, gateOraclePending = false;
  const inputs = new Map(), probes = [], transitions = [],glowSamples=[];
  const timing = { prepareRequestedAt: lazyEnabled ? null : performance.now(), loaderFetchedAt: null, unityCreatedAt: null, readyAt: null, resultEnteredAt: null, playRequestedAt: null, activatedAt: null, firstPresentedAt: null };
  const stats = { starts: 0, inputFrames: 0, presentedFrames: 0, drawnFrames: 0, rejectedFrames: 0, clears: 0, gateOracleCaptures: 0 };
  function readMemoryDiagnostics(enabled) {
    return readUnityMemoryInfo({ enabled, runtime: 'P8', instance, ready, loading, disposed, runtimeError: error, getterName: 'GetMemoryInfo', notCreatedStatus: lazyEnabled ? 'NOT_CREATED_LAZY' : 'NOT_CREATED' });
  }
  let tuning=null,schedule=null,provenance=null;
  const section = document.createElement('section'); section.id = 'p30p8-controls';
  section.style.cssText = 'margin:10px 0;padding:10px;border:1px solid #8cb2c8;background:#25323b;color:#eef1f4;border-radius:8px';
  section.innerHTML = `<strong>R14-P30-P8R1｜Box／Flash02 影片來源比較・MANUAL_FIXTURE_ONLY</strong>
    <p>保留 Box（7 PS；玩家視覺 FAIL）對照；新候選 Flash02（3 PS：放射線／星形／光暈）待玩家比對，未證為影片原生觸發。卡前合成，A 暗度不變；同批卡可切換，每次最多 6 秒。</p>
    <label>TenTime 原始 FX <select id="p8-fx" disabled><option value="off">OFF｜原背景</option><option value="box">Box｜原始 7 PS</option><option disabled>Flash01｜本輪未試</option><option value="flash02">新候選｜Flash02 原始 3 PS</option></select></label>
    <button id="p8-play" type="button" disabled>播放 Flash02（6 秒）</button><button id="p8-stop" type="button">停止／清空</button>
    <label><input id="p8-auto" type="checkbox">結果入場立即試播（人工工程時序）</label>
    <p id="p8-status" role="status">預載中；不啟動粒子、不阻塞卡片。</p>
    <details><summary>P8 渲染與清理收據</summary><pre id="p8-receipt" style="max-height:360px;overflow:auto;white-space:pre-wrap"></pre><div id="p8-frames"></div></details>`;
  const diagnostic = document.getElementById('diagnostic-mode'); diagnostic.querySelector('summary').after(section); if(new URLSearchParams(location.search).get('r14p32r2r14')!=='1')diagnostic.open = true;
  const $ = id => section.querySelector('#' + id);
  if(tuningEnabled){
    section.querySelector('strong').textContent='R14-P30-P8R3R5｜中央光暈對照・MANUAL_FIXTURE_ONLY';
    section.querySelector('p').textContent='固定1.80×；HOLD 在指定時刻只 Pause 中央 glow；HOLD_LIVE 從成熟快照連續微動。亮度只作用於保持後的 glow。保持時刻改後請重播 FX。A／B／SOFT／SOURCE 保留對照，線條與星點持續動態。WEB_VISUAL_ADAPTATION。';
    const modeLabel=document.createElement('label');modeLabel.innerHTML=' Flash02 演出 <select id="p8-continuity"><option value="a">A｜R2 SUSTAINED</option><option value="hide-glow">B｜2.8秒後只隱藏 glow</option><option value="hold-live">HOLD_LIVE_WEB_VISUAL_ADAPTATION</option><option value="hold">HOLD｜保持中央光暈</option><option value="soft">SUSTAINED_GLOW_SOFT｜自然淡出</option><option value="source">原來源播放｜原6秒工程窗口</option></select>';$('p8-fx').parentElement.after(modeLabel);$('p8-continuity').value=playbackMode;
    $('p8-continuity').onchange=async e=>{
      const next=e.target.value;if(loading||next===playbackMode)return;
      if(playbackMode!=='source'&&next!=='source'){
        playbackMode=next;if(instance&&choice==='flash02')instance.SendMessage('P8TenTimeMotion','SetPresentation',JSON.stringify({run,token,presentation:next,...tuning.settings()}));record('presentation-mode-change');notify();redraw();return;
      }
      clear('runtime-mode-change');ready=false;loading=true;error=null;notify();redraw();
      if(instance){const old=instance;instance=null;await old.Quit();}surface?.remove();surface=null;
      playbackMode=next;base=runtimeBase();stats.activationToken=null;await prepare();
      if(run&&!error&&choice==='off'&&!schedule.snapshot().pending)play('flash02');
    };
    $('p8-auto').parentElement.lastChild.textContent='結果入場依目前延遲試播（人工工程時序）';
    $('p8-auto').checked=true;
    $('p8-auto').onchange=()=>{if(!$('p8-auto').checked){clear('auto-disabled');notify();redraw();}};
    schedule=createPlaybackSchedule({isReady:()=>ready&&Boolean(instance)&&!error&&!disposed,getRun:()=>run,start:(effect,request)=>{timing.scheduleFiredAt=request.firedAt;begin(effect);}});
    tuning=(finalEnabled?createFinalFlash02Panel:createFlash02Tuning)({onMode:(next,settings)=>{playbackMode=next;if(instance&&choice==='flash02'){instance.SendMessage('P8TenTimeMotion','SetPresentation',JSON.stringify({run,token,presentation:next,...nativeSettings(settings)}));}notify();redraw();},onMount:settings=>{
      if(instance&&choice==='flash02'){instance.SendMessage('P8TenTimeMotion',finalEnabled?'Tune':'Mount',JSON.stringify(finalEnabled?{run,token,...nativeSettings(settings)}:{x:settings.offsetX,y:settings.offsetY,scale:settings.scale}));presentation=null;redraw();}
      notify();
    },onHold:settings=>{if(playbackMode!=='source'&&choice==='flash02')instance?.SendMessage('P8TenTimeMotion','ConfigureHold',JSON.stringify({run,token,...settings}));notify();},onHoldNow:()=>{instance?.SendMessage('P8TenTimeMotion','HoldNow',JSON.stringify({run,token}));},onTiming:value=>{schedule.retime(value);notify();},onReplay:()=>play('flash02'),onStop:()=>{clear('manual-stop');notify();redraw();},getContext:()=>({run,choice,playbackMode,glowSamples,runtimeProjection:choice==='flash02'&&native?.token===token?{scale:native.mountScale,offsetX:native.mountX,offsetY:native.mountY,orthoSize:native.orthoSize}:null,continuity:continuity?.snapshot(),timing:{...timing},schedule:schedule.snapshot(),sourceAndRuntimeSHA256:provenance,app:appSnapshot(),sourceTiming:'SOURCE_UNRESOLVED',manualReplayReference:'button performance.now(); auto uses normal-local-ten-movie-finish trace.at'})});
  }
  function nativeSettings(s){return {...s,x:s.offsetX,y:s.offsetY,scale:finalEnabled?s.overallScale:s.scale,holdAt:finalEnabled?s.holdDelayMs/1000:s.holdAt,liveSpeed:finalEnabled?s.pulseSpeed:s.liveSpeed,finalTuning:finalEnabled};}
  function snapshot() { return {probeDiagnostics:{enabled:p8ProbeEnabled,skipped:skippedP8Probes},backgroundRole:appSnapshot().sessionMode==='local-fever-ten-display'?'FEVER_BACKGROUND_WEB_ADAPTATION_PLAYER_PENDING_NOT_NATIVE_VERIFIED':'NORMAL_FLASH02_PLAYER_ACCEPTED',isolated,isolatedChoice,isolationSamples, build: finalEnabled?'R14P30P8R3R8_FINAL_TUNING_PANEL':tuningEnabled?'R14P30P8R3R5':'R14P30P8R1', classification: finalEnabled?'WEB_VISUAL_ADAPTATION':'MANUAL_FIXTURE_ONLY', routing: 'NATIVE_TENTIME_ACTIVATION_UNRESOLVED',
    source: choice === 'off' ? null : choice === 'flash02' ? { field: 'EffectFlash_02_UI', gameObjectPathID: '7822162672251176467', particleSystems: 3 } : { field: 'EffectBox_UI', gameObjectPathID: '5394023160150627020', particleSystems: 7 },
    shader: 'WEB_SHADER_ADAPTATION_MOBILE_BLEND_VERTEX_COLOR_TEXTURE', projection: 'EXISTING_1280x720_UIROOT_2_DIV_720_ORTHO_1_FIXTURE',
    ready, loading, error, run, token, choice, lastChoice,playbackMode,glowSamples,continuity:continuity?.snapshot(), presentation, native, timing: { ...timing }, lazyPreparation:{enabled:lazyEnabled,requested:timing.prepareRequestedAt!==null,instanceCreated:Boolean(instance),inFlight:Boolean(preparePromise&&loading)}, ...stats, probes, transitions, calibration: measurement?.snapshot() ?? null, tuning:tuning?.snapshot()??null, app: appSnapshot() }; }
  function notify() {
    $('p8-fx').value = choice; $('p8-fx').disabled = !ready || !run || Boolean(error);
    const windowLabel=tuningEnabled&&lastChoice==='flash02'&&playbackMode!=='source'?'持續至停止／Confirm':'6 秒';
    if(tuningEnabled)$('p8-continuity').disabled=loading||isolated||finalEnabled;
    $('p8-play').textContent = `播放 ${lastChoice === 'flash02' ? 'Flash02' : 'Box'}（${windowLabel}）`;
    $('p8-play').disabled = !ready || !run || Boolean(error);
    $('p8-status').textContent = error ? '停止：' + error : !ready ? (lazyEnabled&&!timing.prepareRequestedAt?'商店待機：P8 Unity 尚未建立；需要 10+1 Flash02 時才預熱。':'預載中；不啟動粒子、不阻塞卡片。') : !run ?
      '引擎已預備；Box 7 PS＋Flash02 3 PS，合計10 PS均關閉。等待 Normal 10+1 結果。' : choice === 'off' ? 'OFF：原背景；粒子已停止／清空，同批卡不變。' :
      presentation ? `原始 ${choice === 'flash02' ? 'Flash02 新候選' : 'Box 對照'} 播放中（${windowLabel}）；可停止／同卡切換。` : '等待匹配結果背景的第一個原始影格。';
    $('p8-receipt').textContent = JSON.stringify(snapshot(), null, 2);
    if(continuity){const rows=continuity.snapshot().at(-1)?.rows;$('p8-receipt').dataset.measuredAge=rows?.at(-1)?.ageSeconds??'';}
    if(tuning){const pending=schedule.snapshot().pending;tuning.status(error?'停止：'+error:pending?`已排程 ${pending.effect}：${pending.delayMs}ms；${ready?'等待播放時點':'等待引擎預載'}。`:!run?'請先開啟 Normal 10+1；不會重新抽卡。':choice==='flash02'?(native?.holdEmpty?'沒有可保持光暈：請重播 FX（不重抽卡）':native?.glowHeld?'已保持成熟光暈；亮度／LIVE 幅度速度即時套用，保持時刻改後請重播 FX':`Flash02 ${playbackMode} 播放中；HOLD／HOLD_LIVE 只暫停 glow 模擬。`):'同批卡可重播；目前 '+choice,Boolean(run)&&!error&&!disposed);}
  }
  function record(type) { transitions.push({ type, at: performance.now(), run, token, choice }); if (transitions.length > 24) transitions.shift(); }
  function clear(reason) {
    continuity?.end(reason);
    schedule?.cancel(reason);
    measurement?.clear(reason);
    token = 'p8-' + (++serial); choice = 'off'; presentation = null; inputs.clear(); gateOraclePending = false;
    if(isolatedCanvas)isolatedCanvas.getContext('2d').clearRect(0,0,1280,720);
    instance?.SendMessage('P8TenTimeMotion', 'Clear', token); stats.clears++; record(reason);
  }
  function fail(message) { error = String(message); clear('error'); reportLazyError(error); notify(); }
  function reportLazyError(message){if(!lazyEnabled||reportedLazyError===message)return;reportedLazyError=message;onLazyError?.(message);}
  function play(effect=lastChoice,referenceAt=performance.now(),reference='manual-replay-button'){
    if(!tuningEnabled)return begin(effect);
    if(!run||error||disposed)return;
    clear('scheduled-replay');lastChoice=effect;
    schedule.request(effect,referenceAt,effect==='flash02'?(finalEnabled?tuning.settings().startDelayMs:tuning.settings().timingOffsetMs):0,reference);notify();redraw();
  }
  function begin(effect = lastChoice) {
    if (!['box','flash02'].includes(effect)) throw Error('P8R1_SOURCE_EFFECT_REQUIRED');
    if (!ready || !run || error || disposed) return;
    clear('restart'); token = 'p8-' + (++serial); choice = effect; lastChoice = effect; pixels = null; gateOraclePending = true; timing.playRequestedAt = performance.now(); timing.activatedAt = null; timing.firstPresentedAt = null;
    continuity?.start({run,token,effect,playbackMode,settings:tuning.settings(),startedAt:timing.playRequestedAt});
    measurement?.start({run,token,effect,playRequestedAt:timing.playRequestedAt,engineReadyAt:timing.readyAt,readyWhenRequested:ready});
    // paint() supplies the correct pre-card background before Unity may activate.
    record('manual-play'); notify(); redraw();
  }
  function sync(nextRun) {
    if (nextRun === run) return;
    clear(nextRun ? 'result-entered' : 'result-left'); run = nextRun;if(isolated)document.getElementById('r6-isolated').open=inScene||Boolean(run); identity = ''; pixels = null;
    if (run) { timing.resultEnteredAt = performance.now();
      if(lazyEnabled&&!ready)void ensurePrepared();
      const movieEvent=appSnapshot().calibration?.flowEvents?.filter(e=>e.event==='normal-local-ten-movie-finish').at(-1);
      timing.resultEvent=movieEvent??null;
      if ($('p8-auto').checked && (ready||tuningEnabled)) play(tuningEnabled?'flash02':lastChoice,movieEvent?.at??timing.resultEnteredAt,movieEvent?'movie-finish-'+movieEvent.trigger:'result-entered-fallback'); }
    notify();
  }
  window.p8Transport = { inputFrame: 0 };
  window.p8ComposeBackground = () => {
    if (!run || !pixels || choice === 'off') throw Error('P8_NO_MATCHING_RESULT_BACKGROUND');
    // The background Canvas is updated by paint(), while `pixels` is a first-frame cache.
    // Capture one matching oracle on the first upload for each play token; never read back per frame.
    const oracle = captureP8GateOracle(background, pixels, gateOraclePending);
    gateOraclePending = oracle.pending;
    if (oracle.captured) stats.gateOracleCaptures++;
    const input = { frame: ++frame, run, token, pixels: oracle.pixels }; inputs.set(frame, input); if (inputs.size > 4) inputs.delete(inputs.keys().next().value);
    window.p8Transport.inputFrame = frame; stats.inputFrames++; return background;
  };
  function inputFor(f, r, t) { return matchP8GateInput(inputs, f, r, t, run, token, choice); }
  const upright = uprightP8Readback;
  const difference = compareP8Rgb;
  window.p8BackgroundGate = (raw, f, r, t) => {
    if(iosRgbDiagnostic){
      const decision=evaluateP8IosDiagnostic({inputs,frame:f,run:r,token:t,currentRun:run,currentToken:token,choice,raw,enabled:true});
      stats.backgroundGate={...(decision.result??{}),identityValid:decision.identityValid,strictAccepted:decision.strictAccepted,diagnosticAccepted:decision.diagnosticAccepted,accepted:decision.accepted,reason:decision.reason,mode:'A21_BOUNDED_1LSB_DIAGNOSTIC_NOT_STRICT_PASS',frame:f,run:r,token:t,currentRun:run,currentToken:token,choice,capturedAtUTC:new Date().toISOString(),maxAllowedOneLsbPixels:1843};
      record('ios-diagnostic-background-gate');notify();return Number(decision.accepted);
    }
    const input = inputFor(f,r,t); if (!input) return 0;
    try {
      const { accepted, result } = evaluateP8RgbGate(input.pixels, raw);
      record('background-gate'); stats.backgroundGate = result; notify(); return Number(accepted);
    } catch (e) {
      record('background-gate-invalid'); stats.backgroundGate = { accepted: false, reason: String(e) }; notify(); return 0;
    }
  };
  window.p8Receive = value => {
    if (disposed) return;
    if(value.phase==='P8_ISOLATION_SAMPLE'&&value.token===token){isolationSamples.push({...value.isolatedSample,run:value.run,token:value.token,presentation:value.presentation,fixture:isolatedChoice});if(isolationSamples.length>160)isolationSamples.shift();const ageLabel=document.getElementById('r6-age');if(ageLabel)ageLabel.textContent=value.isolatedSample.age.toFixed(2)+'秒／6秒（到點停末幀）';return;}
    if(value.phase==='P8_GLOW_SAMPLE'&&value.token===token){glowSamples.push({...value.glowSample,run:value.run,token:value.token,receivedAt:performance.now()});if(glowSamples.length>400)glowSamples.shift();}
    if (value.phase === 'P8_PREPARED') { ready = true; timing.readyAt = performance.now(); stats.preparedParticles = value.particles; }
    if (value.phase === 'P8_PREPARED' || value.token === token) native = value;
    if (value.phase === 'P8_ACTIVATED' && value.token === token) timing.activatedAt = performance.now();
    if (value.phase === 'P8_WINDOW_ENDED' && value.token === token) { clear('manual-window-ended'); redraw(); }
    // PREPARED may arrive after createUnityInstance resolves. Wake an opted-in pending result.
    if(tuningEnabled){if(value.phase==='P8_PREPARED')schedule.wake();}
    else if (value.phase === 'P8_PREPARED' && instance && run && $('p8-auto').checked && choice === 'off') play();
    notify();
  };
  window.p8Presented = (f, unityFrame, r, t) => {
    const input = inputFor(f,r,t); if (!input || error || disposed) { stats.rejectedFrames++; return; }
    presentation = { inputFrame: f, unityFrame, run:r, token:t }; stats.presentedFrames++; timing.firstPresentedAt ??= performance.now();
    if(continuity?.sample(surface,input.pixels,performance.now()))notify();
    measurement?.presented(surface,{inputFrame:f,unityFrame,run:r,token:t,presentedAt:performance.now()},input.pixels);
    redraw();
  };
  function addImage(rgba, id) {
    const canvas = document.createElement('canvas'); canvas.width=1280;canvas.height=720;canvas.getContext('2d').putImageData(new ImageData(rgba,1280,720),0,0);
    const a = document.createElement('a');a.id=id;a.download=id+'.png';a.textContent=id+' PNG ';a.href=canvas.toDataURL('image/png');$('p8-frames').append(a);
  }
  let previousProbe = null;
  window.p8Probe = async (rawOff,rawOn,f,index,age,r,t) => {
    if(!p8ProbeEnabled){skippedP8Probes++;return;}
    const input = inputFor(f,r,t); if (!input || error || disposed) return;
    const probeStartedAt=performance.now();
    const off=upright(rawOff),on=upright(rawOn);
    const row={run:r,token:t,effect:choice,index,ageSeconds:age,inputFrame:f,offVsInput:difference(input.pixels,off),onVsOff:difference(off,on),
      motion:index>0&&previousProbe?.token===t&&previousProbe.mode===playbackMode?difference(previousProbe.rgba,on):null,stage:[1280,720],cardRects:appSnapshot().cardRects,mount:tuning?.settings()??null,playbackMode,rgbaSha256:null};
    previousProbe={token:t,mode:playbackMode,rgba:on};probes.push(row);if(probes.length>8)probes.shift();
    addImage(off,`p8-${t}-${playbackMode}-${index}-off`);addImage(on,`p8-${t}-${playbackMode}-${index}-on`);
    row.probeWork={start:probeStartedAt,end:performance.now(),syncMs:performance.now()-probeStartedAt};
    row.rgbaSha256=[...new Uint8Array(await crypto.subtle.digest('SHA-256',on))].map(n=>n.toString(16).padStart(2,'0')).join('');notify();
  };
  window.p8Error = fail;
  function paint(context, backgroundIdentity) {
    if (!run || choice === 'off' || error) return;
    const nextIdentity=run+':'+backgroundIdentity;
    if (identity !== nextIdentity) { identity=nextIdentity; pixels=null;presentation=null;inputs.clear(); }
    bg.setTransform(1,0,0,1,0,0);bg.drawImage(context.canvas,0,0,context.canvas.width,context.canvas.height,0,0,1280,720);
    if(isolated&&!inScene){bg.fillStyle='#000';bg.fillRect(0,0,1280,720);}
    pixels ??= bg.getImageData(0,0,1280,720).data;
    if (ready && instance && stats.activationToken !== token) { stats.activationToken=token;const settings=tuning?.settings();instance.SendMessage('P8TenTimeMotion','Activate',JSON.stringify({run,token,effect:choice,presentation:playbackMode,...(finalEnabled?nativeSettings(settings):{}),isolated,x:settings?.offsetX??0,y:settings?.offsetY??0,scale:settings?.scale??1,holdAt:settings?.holdAt??2.5,brightness:settings?.brightness??70,liveAmplitude:isolated?(isolatedChoice==='live-diagnostic'?5:1.5):(settings?.liveAmplitude??1.5),liveSpeed:isolated?(isolatedChoice==='live-diagnostic'?.8:.35):(settings?.liveSpeed??.35),...(finalEnabled?nativeSettings(settings):{})})); }
    if (presentation?.run === run && presentation.token === token) { if(isolated&&!inScene){isolatedCanvas?.getContext('2d').drawImage(surface,0,0,1280,720);}else context.drawImage(surface,0,0,1280,720);stats.drawnFrames++; }
  }
  async function prepare() {
    notify();
    try {
      if(tuningEnabled){const response=await fetch(new URL('../TUNING_PROVENANCE.json',base));if(!response.ok)throw Error('P8R3_PROVENANCE_REQUIRED');provenance=await response.json();}
      const create = await new Promise((resolve,reject)=>{const previous=window.createUnityInstance;const script=document.createElement('script');script.src=new URL('WebRuntime.loader.js',base).href;
        script.onload=()=>{timing.loaderFetchedAt=performance.now();const fn=window.createUnityInstance;window.createUnityInstance=previous;resolve(fn);};script.onerror=()=>reject(Error('P8_LOADER_FAILED'));document.head.append(script);});
      if (disposed) return null;
      surface=document.createElement('canvas');surface.id='p8-native-source-canvas';surface.width=1280;surface.height=720;surface.setAttribute('aria-hidden','true');surface.style.cssText='position:fixed;left:-1500px;top:0;width:1280px;height:720px;pointer-events:none';document.body.append(surface);
      const created=await create(surface,{dataUrl:new URL('WebRuntime.data',base).href,frameworkUrl:new URL('WebRuntime.framework.js',base).href,codeUrl:new URL('WebRuntime.wasm',base).href,
        streamingAssetsUrl:new URL('../StreamingAssets/',base).href,companyName:'LocalSourceResearch',productName:'P8R1TenTimeSourceCompare',productVersion:'R14P30P8R1',matchWebGLToCanvasSize:false,
        webglContextAttributes:{alpha:false,preserveDrawingBuffer:true},showBanner:(message,type)=>{if(type==='error')fail(message);}});
      if(disposed){await created.Quit();surface.remove();return null;}instance=created;timing.unityCreatedAt=performance.now();stats.starts++;
      if(tuningEnabled){schedule.wake();redraw();}else if(run&&$('p8-auto').checked&&choice==='off')play();else redraw();
      return instance;
    }catch(e){fail(e);surface?.remove();reportLazyError(String(e));return null;}finally{loading=false;notify();}
  }
  function ensurePrepared(){
    if(instance)return Promise.resolve(instance);
    if(disposed)return Promise.resolve(null);
    if(preparePromise)return preparePromise;
    loading=true;timing.prepareRequestedAt=performance.now();error=null;reportedLazyError=null;notify();
    const operation=prepare();preparePromise=operation;
    void operation.then(()=>{if(!ready&&preparePromise===operation)preparePromise=null;},()=>{if(!ready&&preparePromise===operation)preparePromise=null;});
    return preparePromise;
  }
  if(finalEnabled){section.querySelector('strong').textContent='10+1 Flash02 · WEB_VISUAL_ADAPTATION';section.querySelector('p').textContent='玩家採用 RAW SOURCE 參數，正式10+1入場自動播放；原生相機／啟用規則未閉合。';diagnostic.open=false;$('p8-continuity').disabled=true;}
  $('p8-fx').onchange=e=>{if(e.target.value!=='off')play(e.target.value);else{clear('manual-off');notify();redraw();}};
  $('p8-play').onclick=()=>play();$('p8-stop').onclick=()=>{clear('manual-stop');notify();redraw();};
  if(isolated){
    const viewer=document.createElement('details');viewer.id='r6-isolated';viewer.open=false;viewer.style.cssText='position:fixed;right:8px;top:8px;width:min(900px,94vw);z-index:2147483000;background:#111;color:white;padding:8px;border:1px solid #aaa;max-height:95vh;overflow:auto';
    viewer.innerHTML='<summary>R6 glow 隔離｜1280×720／1.80×｜0～6 秒</summary><p>MANUAL_FIXTURE_ONLY。6秒後停在末幀；RAW僅0～6秒原始自然播放。HOLD/LIVE為Web適配；同卡不重抽。</p><select id="r6-choice"><option value="raw-glow">RAW SOURCE</option><option value="hold">HOLD</option><option value="live-default">HOLD LIVE 1.5% / 0.35Hz</option><option value="live-diagnostic">HOLD LIVE 5% / 0.80Hz</option></select> <button id="r6-replay">重播0～6秒</button> <button id="r6-off">OFF</button><span id="r6-age"></span><canvas id="r6-canvas" width="1280" height="720" style="display:block;width:100%;background:black"></canvas>';
    document.body.append(viewer);isolatedCanvas=viewer.querySelector('canvas');
    viewer.querySelector('#r6-choice').onchange=e=>{isolatedChoice=e.target.value;playbackMode=isolatedChoice.startsWith('live')?'hold-live':isolatedChoice;play('flash02');};
    viewer.querySelector('#r6-replay').onclick=()=>play('flash02');viewer.querySelector('#r6-off').onclick=()=>{clear('isolation-off');isolatedCanvas.getContext('2d').clearRect(0,0,1280,720);notify();redraw();};
    if(inScene){viewer.open=true;viewer.style.cssText='position:fixed;left:12px;top:2px;max-width:650px;padding:5px;background:#172332f5;color:white;font:12px system-ui;z-index:2147483000';viewer.querySelector('summary').textContent='R7 場景內 Glow 四模式｜工程候選';viewer.querySelector('p').textContent='同批11卡，FX位於卡片後方；0～6秒後停末幀，可重播。';isolatedCanvas.hidden=true;isolatedCanvas.style.display='none';viewer.querySelector('p').style.display='none';diagnostic.open=false;}
    $('p8-continuity').disabled=true;tuning?.dispose();
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden){sync(null);}else redraw();});
  async function dispose(){if(disposed)return;sync(null);schedule?.cancel('pagehide');disposed=true;ready=false;if(instance){await instance.Quit();instance=null;}surface?.remove();tuning?.dispose();}
  window.addEventListener('pagehide',()=>{void dispose();});if(!lazyEnabled)void ensurePrepared();else notify();
  function observeStage(context){if(measurement){measurement.stage(context);notify();}}
  return Object.freeze({sync,paint,snapshot,readMemoryDiagnostics,dispose,observeStage,ensurePrepared});
}
