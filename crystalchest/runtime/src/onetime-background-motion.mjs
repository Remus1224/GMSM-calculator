import { readUnityMemoryInfo } from './unity-memory-f12-diagnostic.mjs';

// P3R1: prepare the engine in the shop; activate the unmodified source PS only for a captured result.
const P3_GATE_WIDTH = 1280;
const P3_GATE_HEIGHT = 720;
const P3_GATE_MAX_CHANNEL_DELTA = 1;
const P3_GATE_MAX_DIFFERENT_PIXEL_RATIO = 0.002;

/**
 * Product gate decision for the Unity -> Web RGB transport.
 * The tolerance is a bounded Web transfer allowance, not a native pixel-parity claim.
 */
export function evaluateP3BackgroundTransferGate({ input, raw, frame, run, currentRunId, revision, activeBackgroundIdentity, width = P3_GATE_WIDTH, height = P3_GATE_HEIGHT }) {
  if (!input || !input.pixels || !raw) return { accepted: false, reason: 'INPUT_MISSING', metrics: null };
  if (!Number.isInteger(frame) || input.frame !== frame) return { accepted: false, reason: 'FRAME_MISMATCH', metrics: null };
  if (typeof run !== 'string' || input.runId !== run || currentRunId !== run) return { accepted: false, reason: 'RUN_MISMATCH', metrics: null };
  if (!Number.isInteger(revision) || input.revision !== revision) return { accepted: false, reason: 'REVISION_MISMATCH', metrics: null };
  if (typeof activeBackgroundIdentity !== 'string' || !activeBackgroundIdentity || input.backgroundIdentity !== activeBackgroundIdentity) {
    return { accepted: false, reason: 'BACKGROUND_IDENTITY_MISMATCH', metrics: null };
  }
  const expectedLength = width * height * 4;
  if (input.pixels.length !== expectedLength || raw.length !== expectedLength) return { accepted: false, reason: 'PIXEL_BUFFER_INVALID', metrics: null };

  let differentPixels = 0, maxDifference = 0; const samples = [];
  const source=input.pixels,stride=width*4;
  // Full RGB comparison, same vertical inversion and thresholds. Avoid repeated
  // coordinate multiplication, slices and Math.abs calls in the hot loop.
  for(let y=0;y<height;y++){
    let a=y*stride,b=(height-1-y)*stride;
    const end=a+stride;
    for(;a<end;a+=4,b+=4){
      let dr=source[a]-raw[b],dg=source[a+1]-raw[b+1],db=source[a+2]-raw[b+2];
      if(dr||dg||db)differentPixels++;
      if(dr<0)dr=-dr;if(dg<0)dg=-dg;if(db<0)db=-db;
      if(dr>maxDifference)maxDifference=dr;
      if(dg>maxDifference)maxDifference=dg;
      if(db>maxDifference)maxDifference=db;
    }
  }
  // Keep the original row-major sample order, including small/overlapping sizes.
  const sampleXs=[...new Set([12,width-20])].filter(x=>x>=0&&x<width).sort((a,b)=>a-b);
  const sampleYs=[...new Set([12,height-20])].filter(y=>y>=0&&y<height).sort((a,b)=>a-b);
  for(const y of sampleYs)for(const x of sampleXs){
    const a=y*stride+x*4,b=(height-1-y)*stride+x*4;
    samples.push({x,y,input:Array.from(source.slice(a,a+3)),output:Array.from(raw.slice(b,b+3))});
  }
  const totalPixels = width * height;
  const differentPixelRatio = differentPixels / totalPixels;
  const metrics = { differentPixels, differentPixelRatio, maxDifference, samples, width, height, channels: 'RGB', maxAllowedChannelDelta: P3_GATE_MAX_CHANNEL_DELTA, maxAllowedDifferentPixelRatio: P3_GATE_MAX_DIFFERENT_PIXEL_RATIO };
  const accepted = maxDifference <= P3_GATE_MAX_CHANNEL_DELTA && differentPixelRatio <= P3_GATE_MAX_DIFFERENT_PIXEL_RATIO;
  return { accepted, reason: accepted ? (differentPixels === 0 ? 'EXACT_MATCH' : 'WEB_TRANSPORT_QUANTIZATION_TOLERANCE') : 'PIXEL_DIFFERENCE_OUT_OF_BOUNDS', metrics };
}

export function createOneTimeBackgroundMotion({ redraw, onStatus }) {
  const startup = { phase:'CREATED', events:[], statusCallbackErrors:[] };
  const markStartup = phase => {
    startup.phase=phase;
    startup.events.push({phase,at:performance.now()});
    if(startup.events.length>16)startup.events.shift();
  };
  markStartup('CREATED');
  const query=new URLSearchParams(location.search);const p3ProbeEnabled=query.get('mode')==='engineering'&&query.get('p3Probe')==='1';let skippedDarknessProbes=0;
  const p3IdleEnabled=query.get('mode')==='player'&&query.get('p12P3IdlePause')==='1';
  const pauseThroughMovie=query.get('p3PauseThroughMovie')==='1';
  let movieResumeDeferrals=0;
  const transportProbeEnabled=query.has('phoneDiag')||p3ProbeEnabled;
  const transportCosts={callbacks:{},inputToGate:{calls:0,totalMs:0,maxMs:0},inputToPresented:{calls:0,totalMs:0,maxMs:0},slowFrames:[]};
  const transportTimes=new Map();
  const firstPixelProbeEnabled=p3ProbeEnabled;
  const paintCosts={calls:0,totalMs:0,maxMs:0,copyMaxMs:0,captureMaxMs:0,compositeMaxMs:0,firstPixelProbeCalls:0};
  const base = new URL('../assets/onetime-p3r1-u6/Build/', import.meta.url);
  const background = document.createElement('canvas'); background.width = 1280; background.height = 720;
  const bg = background.getContext('2d', { colorSpace: 'srgb' });
  let key = null, instance = null, surface = null, loading = false, prepared = false, disposed = false;
  let variant = 'motion', error = null, loaderPromise = null, current = null, sequence = 0;
  let revision = 0, captureIdentity = null, pixels = null, presentation = null, activationSent = null;
  let movieActive = false, lastMovie = {}, inputFrame = 0;
  const inputs = new Map(), runs = [];
  const timing = { shopReadyAt: null, prewarmRequestedAt: null, loaderFetchedAt: null, unityCreatedAt: null, unityReadyAt: null };
  const stats = { starts: 0, quits: 0, inputFrames: 0, presentedFrames: 0, drawnFrames: 0, rejectedFrames: 0, native: null, preparedParticles: null, idleSample: null };
  // A14R2: instance-bound, synchronous Emscripten APIs. Never mutate another runtime.
  const idle = { enabled:p3IdleEnabled, capability:'NOT_PROBED', pauseCalls:0, resumeCalls:0, suspended:false, fault:null, lastTransition:null };
  let idleModule=null, sceneShop=false, scenePending=false, idleTransition=false;
  function readMemoryDiagnostics(enabled) {
    return readUnityMemoryInfo({ enabled, runtime: 'P3', instance, ready: prepared, loading, disposed, runtimeError: error, getterName: 'GetMetricsInfo' });
  }
  const now = () => performance.now();
  function idleFault(message) {
    idle.fault=String(message); idle.lastTransition={action:'fault',at:now(),reason:idle.fault};
    fail('P3_IDLE_CONTROL_FAILED: '+idle.fault+'; disable p12P3IdlePause and reload.');
  }
  function idleCapability() {
    if(!p3IdleEnabled||!prepared||!instance)return false;
    if(idle.capability!=='NOT_PROBED')return idle.capability==='AVAILABLE';
    const module=instance.Module;
    idle.capability=typeof module?.pauseMainLoop==='function'&&typeof module?.resumeMainLoop==='function'?'AVAILABLE':'UNAVAILABLE';
    idleModule=idle.capability==='AVAILABLE'?module:null;
    idle.lastTransition={action:'capability',at:now(),result:idle.capability};
    return idle.capability==='AVAILABLE';
  }
  function idleResume(reason) {
    if(!p3IdleEnabled)return true;
    if(idle.fault||idleTransition)return false;
    if(!idle.suspended)return true;
    if(instance?.Module!==idleModule||typeof idleModule?.resumeMainLoop!=='function'){idleFault('RESUME_API_UNAVAILABLE_OR_MODULE_CHANGED');return false;}
    idleTransition=true;
    try {
      const result=idleModule.resumeMainLoop();
      if(result&&typeof result.then==='function')throw Error('UNEXPECTED_ASYNC_RESUME_API');
      idle.suspended=false;idle.resumeCalls++;idle.lastTransition={action:'resume',reason,at:now()};
      return true;
    } catch(e){idleFault(e);return false;}
    finally {idleTransition=false;}
  }
  function idleMaybePause(reason) {
    if(!p3IdleEnabled||disposed||loading||error||idle.fault||idleTransition||idle.suspended||!sceneShop||scenePending||movieActive||key!==null||current||activationSent)return;
    if(!prepared||!instance||!['P3_PREPARED','P3_IDLE'].includes(stats.native?.phase)||stats.native?.holderActive===true)return;
    if(!idleCapability())return; // Missing API leaves the original running path intact; no pause attempted.
    idleTransition=true;
    try {
      const result=idleModule.pauseMainLoop();
      if(result&&typeof result.then==='function')throw Error('UNEXPECTED_ASYNC_PAUSE_API');
      idle.suspended=true;idle.pauseCalls++;idle.lastTransition={action:'pause',reason,at:now()};
    } catch(e){
      // A throwing API may have partially paused: one best-effort recovery, then stop this candidate path.
      let recoveryError=null;
      try {idleModule.resumeMainLoop();idle.resumeCalls++;idle.suspended=false;}catch(recovery){idle.suspended=null;recoveryError=String(recovery);}
      idleFault(String(e)+(recoveryError?' RECOVERY_FAILED: '+recoveryError:' RECOVERED_BUT_CANDIDATE_STOPPED'));
    } finally {idleTransition=false;}
  }
  function snapshot() {
    return { movieIdlePolicy:{enabled:pauseThroughMovie,resumeDeferrals:movieResumeDeferrals},startup:{...startup,events:[...startup.events],statusCallbackErrors:[...startup.statusCallbackErrors]}, ...(p3IdleEnabled ? { p3IdleRuntime:{...idle,transitionInProgress:idleTransition,sceneShop,scenePending,instancePreserved:Boolean(instance)} } : {}),transportCosts:JSON.parse(JSON.stringify(transportCosts)),paintCosts:{...paintCosts},probeDiagnostics:{enabled:p3ProbeEnabled,skipped:skippedDarknessProbes,firstPixelProbeEnabled,firstPixelPolicy:'ENGINEERING_OPT_IN_ONLY'},build: 'R14P30P3R1', classification: 'SOURCE_CONDITIONAL_BOX2_WEB_ADAPTATION', variant,
      applicable: key !== null, ready: prepared, loading, error, gpuInstance: Boolean(instance), standby: prepared && key === null,
      canvasAttached: Boolean(surface?.isConnected), redrawPending: false, timing: { ...timing,
        engineInitializationMs: timing.unityReadyAt === null ? null : timing.unityReadyAt - timing.prewarmRequestedAt },
      currentRun: current, runs, ...stats };
  }
  const notify = () => {
    try { onStatus?.(snapshot()); }
    catch (cause) {
      // Status UI is diagnostic: its failure must not strand engine preparation.
      const detail={at:now(),phase:startup.phase,message:String(cause),stack:cause?.stack??null};
      if(startup.statusCallbackErrors.length<8)startup.statusCallbackErrors.push(detail);
      console.error('P3_STATUS_CALLBACK_FAILED',detail.message,detail.stack);
    }
  };
  function fail(message) { error = String(message); presentation = null; notify(); }
  function loader() {
    if (!loaderPromise) loaderPromise = new Promise((resolve, reject) => {
      markStartup('LOADER_REQUEST');
      const script = document.createElement('script'); script.crossOrigin='anonymous'; script.src = new URL('WebRuntime.loader.js', base).href;
      script.onload = () => { timing.loaderFetchedAt = now(); markStartup('LOADER_LOADED'); if(typeof window.createUnityInstance!=='function'){reject(Error('P3R1_LOADER_FACTORY_MISSING'));return;} resolve(window.createUnityInstance); };
      script.onerror = () => reject(Error('P3R1_SOURCE_LOADER_FAILED')); document.head.append(script);
    });
    return loaderPromise;
  }
  async function prepare() {
    if (loading || instance || disposed || error) return;
    loading = true; timing.prewarmRequestedAt ??= now(); markStartup('PREPARING');
    try {
      notify();
      const create = await loader(); if (disposed) return;
      surface = document.createElement('canvas'); surface.id = 'onetime-p3r1-source-canvas'; surface.width = 1280; surface.height = 720;
      surface.setAttribute('aria-hidden', 'true'); surface.dataset.onetimeP3 = 'source-player';
      Object.assign(surface.style, { position: 'fixed', left: '-1300px', top: '0', width: '1280px', height: '720px', pointerEvents: 'none' });
      document.body.append(surface);
      markStartup('UNITY_CREATE');
      const created = await create(surface, {
        dataUrl: new URL('WebRuntime.data', base).href, frameworkUrl: new URL('WebRuntime.framework.js', base).href,
        codeUrl: new URL('WebRuntime.wasm', base).href, streamingAssetsUrl: new URL('../StreamingAssets/', base).href,
        companyName: 'LocalSourceResearch', productName: 'OneTimeBox2BackgroundP3R1', productVersion: 'R14P30P3R1',
        matchWebGLToCanvasSize: false, webglContextAttributes: { alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true },
        showBanner: (message, type) => { if (type === 'error') fail(message); }
      });
      timing.unityCreatedAt = now(); markStartup('UNITY_CREATED');
      if (disposed) { await created.Quit(); stats.quits++; surface?.remove(); return; }
      instance = created; stats.starts++; instance.SendMessage('P3OneTimeBackground', 'SetFX', variant === 'motion' ? 'on' : 'off');
      if (current) redraw();
    } catch (e) { markStartup('FAILED'); fail(e?.stack||e); surface?.remove(); }
    finally { loading = false; if(p3IdleEnabled){idleCapability();idleMaybePause('prepared-instance');} notify(); }
  }
  function observeScene({ shop, movie, pending = false }) {
    if(p3IdleEnabled){sceneShop=shop===true;scenePending=pending===true;
      const safelyParked=pauseThroughMovie&&idle.suspended===true&&prepared&&!error&&!idle.fault&&
        key===null&&!current&&!activationSent&&stats.native?.holderActive!==true&&
        ['P3_PREPARED','P3_IDLE'].includes(stats.native?.phase);
      if(!sceneShop||movie||scenePending){
        if(safelyParked)movieResumeDeferrals++;
        else idleResume('leave-shop-before-sync');
      }
    }
    if (shop && timing.shopReadyAt === null) { timing.shopReadyAt = now(); notify(); }
    if (movie && !movieActive) lastMovie = { movieStartedAt: now(), movieEndedOrSkippedAt: null, completion: null };
    movieActive = movie;if(p3IdleEnabled)idleMaybePause('observe-shop');
  }
  function movieFinished(completion) { if(p3IdleEnabled)idleResume('movie-finished'); lastMovie.movieEndedOrSkippedAt = now(); lastMovie.completion = completion; }
  function sync(nextKey, reason = 'result-left') {
    if(p3IdleEnabled&&nextKey!==null&&!idleResume('result-before-sync'))return;
    if (nextKey === key) return;
    if (current) { current.confirmAt = now(); current.closeReason = reason; }
    key = nextKey; presentation = null; activationSent = null; captureIdentity = null; pixels = null; inputs.clear(); revision++;
    instance?.SendMessage('P3OneTimeBackground', 'Deactivate', reason);
    current = nextKey === null ? null : { runId: 'p3r1-' + (++sequence), ...lastMovie,
      resultSessionStartedAt: nextKey.started ?? now(), resultEntryObservedAt: now(), resultCardFirstPaintAt: null,
      holderActivatedAt: null, firstMatchingResultBackgroundInputAt: null, firstCompositedFrameAt: null,
      firstVisibleFXPixelAt: null, firstVisibleDeltaMs: null, firstVisibleFromCardMs: null,
      firstCompositeDrawAt:null,firstPixelMeasurement:firstPixelProbeEnabled?'PENDING':'NOT_MEASURED_PLAYER_READBACK_DISABLED',
      coldStateAtResult: prepared && instance ? 'PREPARED' : 'COLD_NOT_READY', backgroundGate: null,
      darknessProbes: [], activationRequestedAt: null, confirmAt: null, closeReason: null };
    if (current) { runs.push(current); if (runs.length > 12) runs.shift(); }
    if(p3IdleEnabled)idleMaybePause('result-left');
    notify();
  }
  function setVariant(next) {
    if (!['still', 'motion'].includes(next)) throw Error('P3_INVALID_VARIANT');
    variant = next; presentation = null; instance?.SendMessage('P3OneTimeBackground', 'SetFX', next === 'motion' ? 'on' : 'off'); notify();
  }
  function inputFor(frame, run) { const input = inputs.get(frame); return current && current.runId === run && input?.runId === run && input.revision === revision && input.backgroundIdentity === captureIdentity ? input : null; }
  window.p3Transport = { inputFrame: 0 };
  window.p3ComposeBackground = () => {
    if (!current || !pixels) throw Error('P3R1_NO_MATCHING_RESULT_BACKGROUND');
    const input = { frame: ++inputFrame, runId: current.runId, revision, backgroundIdentity: captureIdentity, pixels, capturedAt: now() };
    inputs.set(input.frame, input); if (inputs.size > 4) inputs.delete(inputs.keys().next().value);
    window.p3Transport.inputFrame = input.frame; stats.inputFrames++;
    current.firstMatchingResultBackgroundInputAt ??= input.capturedAt;
    return background;
  };
  function rgbDiff(source, raw) {
    let differentPixels = 0, maxDifference = 0; const samples = [];
    for (let y = 0; y < 720; y++) for (let x = 0; x < 1280; x++) {
      const a = (y * 1280 + x) * 4, b = ((719 - y) * 1280 + x) * 4; let bad = false;
      for (let c = 0; c < 3; c++) { const d = Math.abs(source[a + c] - raw[b + c]); maxDifference = Math.max(maxDifference, d); bad ||= d !== 0; }
      if (bad) differentPixels++;
      if ((x === 12 || x === 1260) && (y === 12 || y === 700)) samples.push({ x, y, input: Array.from(source.slice(a, a + 3)), output: Array.from(raw.slice(b, b + 3)) });
    }
    return { differentPixels, maxDifference, samples, channels: 'RGB', width: 1280, height: 720 };
  }
  window.p3BackgroundGate = (raw, frame, run) => {
    const input = inputFor(frame, run); if (!input) return 0;
    const decision = evaluateP3BackgroundTransferGate({ input, raw, frame, run, currentRunId: current.runId, revision, activeBackgroundIdentity: captureIdentity });
    current.backgroundGate = { ...(decision.metrics ?? {}), inputFrame: frame, runId: run, revision, backgroundIdentity: captureIdentity, accepted: decision.accepted, reason: decision.reason };
    return Number(decision.accepted);
  };
  window.p3Receive = value => {
    if (disposed) return; stats.native = value;
    if (value.phase === 'P3_PREPARED') { markStartup('NATIVE_PREPARED'); prepared = true; timing.unityReadyAt = now(); stats.preparedParticles = value.particles; if (current && instance) redraw(); }
    if (value.phase === 'P3_IDLE') stats.idleSample = value;
    if (value.phase === 'P3_HOLDER_ACTIVATED' && value.run === current?.runId) { current.holderActivatedAt = now(); current.activationParticles = value.particles; }
    if(p3IdleEnabled){idleCapability();idleMaybePause('native-idle');}notify();
  };
  window.p3Presented = (frame, unityFrame, run, visible) => {
    const input = inputFor(frame, run); if (!input || error || disposed) { stats.rejectedFrames++; return; }
    presentation = { input, unityFrame, visible }; stats.presentedFrames++;
    current.firstCompositedFrameAt ??= now();
    // Render the completed same-run surface now; avoid adding another full RAF of host latency.
    redraw();
  };
  window.p3DarknessProbe = (off, on, frame, run) => {
    if(!p3ProbeEnabled){skippedDarknessProbes++;return;}
    const input = inputFor(frame, run); if (!input) return;
    const probeStartedAt=now();
    const control = rgbDiff(input.pixels, off); let changed = 0, unchanged = 0, nonParticleMaxDifference = 0; const unaffectedROIs = [];
    for (let y = 0; y < 720; y++) for (let x = 0; x < 1280; x++) {
      const a = (y * 1280 + x) * 4, b = ((719 - y) * 1280 + x) * 4;
      if (off[b] !== on[b] || off[b + 1] !== on[b + 1] || off[b + 2] !== on[b + 2]) { changed++; continue; }
      unchanged++; for (let c = 0; c < 3; c++) nonParticleMaxDifference = Math.max(nonParticleMaxDifference, Math.abs(input.pixels[a + c] - on[b + c]));
      if (x % 64 === 0 && y % 64 === 0 && unaffectedROIs.length < 12) unaffectedROIs.push({ x, y, input: Array.from(input.pixels.slice(a,a+3)), off: Array.from(off.slice(b,b+3)), on: Array.from(on.slice(b,b+3)) });
    }
    current.darknessProbes.push({ probeWork:{start:probeStartedAt,end:now(),syncMs:now()-probeStartedAt},at: now(), inputFrame: frame, runId: run, offVsInput: control, fxContributionPixels: changed,
      zeroFXContributionPixels: unchanged, nonParticleMaxDifference, unaffectedROIs, maskDefinition: 'same-frame RGB(on)==RGB(off), plus independent full-frame off/input equality' });
    if (current.darknessProbes.length > 5) current.darknessProbes.shift(); notify();
  };
  if(transportProbeEnabled){
    const addCost=(bucket,elapsed)=>{bucket.calls++;bucket.totalMs+=elapsed;bucket.maxMs=Math.max(bucket.maxMs,elapsed);};
    for(const name of ['p3ComposeBackground','p3BackgroundGate','p3Presented','p3Receive','p3DarknessProbe']){
      const original=window[name];
      window[name]=function(...args){
        const entered=now();
        const frame=name==='p3ComposeBackground'?null:(name==='p3BackgroundGate'?args[1]:args[0]);
        const stamp=transportTimes.get(frame);
        if(name==='p3BackgroundGate'&&stamp){
          const elapsed=entered-stamp.uploadCallbackEnd;
          addCost(transportCosts.inputToGate,elapsed);stamp.gateEntry=entered;
          if(elapsed>25&&transportCosts.slowFrames.length<20)transportCosts.slowFrames.push({step:'input-to-gate',frame,elapsedMs:elapsed,at:entered,runId:current?.runId??null});
        }
        try{return Reflect.apply(original,this,args);}
        finally{
          const ended=now(),elapsed=ended-entered;
          const bucket=transportCosts.callbacks[name]??={calls:0,totalMs:0,maxMs:0};addCost(bucket,elapsed);
          if(elapsed>25&&transportCosts.slowFrames.length<20)transportCosts.slowFrames.push({step:name,frame,elapsedMs:elapsed,at:entered,runId:current?.runId??null});
          if(name==='p3ComposeBackground'){
            transportTimes.set(inputFrame,{uploadCallbackEnd:ended});
            if(transportTimes.size>4)transportTimes.delete(transportTimes.keys().next().value);
          }
          if(name==='p3Presented'&&stamp)addCost(transportCosts.inputToPresented,entered-stamp.uploadCallbackEnd);
        }
      };
    }
  }
  window.p3Error = fail;
  function paintCore(context, identity = '') {
    if (!current) return;
    if(p3IdleEnabled&&!idleResume('paint-before-activate'))return;
    const nextIdentity = current.runId + ':' + identity;
    if (captureIdentity !== nextIdentity) { captureIdentity = nextIdentity; revision++; presentation = null; pixels = null; }
    bg.setTransform(1, 0, 0, 1, 0, 0); bg.clearRect(0, 0, 1280, 720);
    const copyStarted=now();
    bg.drawImage(context.canvas, 0, 0, context.canvas.width, context.canvas.height, 0, 0, 1280, 720);
    paintCosts.copyMaxMs=Math.max(paintCosts.copyMaxMs,now()-copyStarted);
    if(pixels===null){const captureStarted=now();pixels=bg.getImageData(0,0,1280,720).data;
      paintCosts.captureMaxMs=Math.max(paintCosts.captureMaxMs,now()-captureStarted);}

    if (prepared && instance && activationSent !== current.runId) {
      activationSent = current.runId; current.activationRequestedAt = now(); instance.SendMessage('P3OneTimeBackground', 'Activate', current.runId);
    }
    const frame = presentation;
    if (!frame || frame.input.revision !== revision || frame.input.runId !== current.runId || !frame.visible || variant !== 'motion' || error) return;
    const drawAt = now(); context.drawImage(surface, 0, 0, 1280, 720); stats.drawnFrames++;
    paintCosts.compositeMaxMs=Math.max(paintCosts.compositeMaxMs,now()-drawAt);
    current.firstCompositeDrawAt ??= drawAt;
    if (firstPixelProbeEnabled && current.firstVisibleFXPixelAt === null) {
      paintCosts.firstPixelProbeCalls++;
      const output = context.getImageData(0, 0, 1280, 720).data, source = frame.input.pixels;
      let changed = 0, maxDifference = 0; for (let i = 0; i < output.length; i += 4) {
        const x = (i / 4) % 1280, y = Math.floor(i / 4 / 1280);
        // Existing stable single card is centered (199x250 natural art); use a larger exclusion.
        // Also exclude the entire bottom result-button/Gauge area. These pixels survive later UI painting.
        if (y >= 550 || (x >= 500 && x < 780 && y >= 210)) continue;
        let bad = false; for (let c = 0; c < 3; c++) { const d = Math.abs(output[i+c] - source[i+c]); maxDifference = Math.max(maxDifference,d); bad ||= d !== 0; } if (bad) changed++;
      }
      if (changed) {
        current.firstPixelMeasurement='MEASURED_ENGINEERING_READBACK';
        current.firstVisibleFXPixelAt = drawAt; current.firstVisibleDeltaMs = drawAt - current.resultSessionStartedAt;
        current.firstVisibleFromCardMs = current.resultCardFirstPaintAt === null ? null : drawAt - current.resultCardFirstPaintAt;
        current.firstPixelEvidence = { inputFrame: frame.input.frame, unityFrame: frame.unityFrame, changedPixels: changed, maxDifference, sampleAt: now(), unoccludedROIs: [[0,0,1280,210],[0,210,500,340],[780,210,500,340]], boundary: 'main Canvas verified FX pixels outside conservative card/button/Gauge bounds; first detected in these ROIs, not guaranteed earliest anywhere or physical display photon time' }; notify();
      }
    }
  }
  function paint(context,identity=''){
    const started=now();
    try{return paintCore(context,identity);}
    finally{const elapsed=now()-started;paintCosts.calls++;paintCosts.totalMs+=elapsed;paintCosts.maxMs=Math.max(paintCosts.maxMs,elapsed);}
  }
  function cardPainted() { if (current && current.resultCardFirstPaintAt === null) { current.resultCardFirstPaintAt = now(); notify(); } }
  async function dispose() { if (disposed) return; if(p3IdleEnabled){sceneShop=false;scenePending=true;idleResume('pagehide');}sync(null, 'pagehide'); disposed = true; prepared = false; if (instance) { const old = instance; instance = null; await old.Quit(); stats.quits++; surface?.remove(); } }
  window.addEventListener('pagehide', () => { void dispose(); });
  // No awaited engine work on the UI path; source particles stay inactive throughout preparation.
  queueMicrotask(() => { void prepare(); });
  return Object.freeze({ prepare, observeScene, movieFinished, sync, endResult: reason => sync(null,reason), paint, cardPainted, setVariant, snapshot, readMemoryDiagnostics, dispose });
}

