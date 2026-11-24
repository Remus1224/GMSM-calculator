import { createOutlineTokenGate, outlineFixtureEnabled } from './outline-fixture-state.mjs';
import { readUnityMemoryInfo } from './unity-memory-f12-diagnostic.mjs';

// Source PS run in Unity. Only slot routing, projection and the compositor are Web fixtures.
export function createOriginalBackFX({ redraw, appSnapshot }) {
  const engineering = new URLSearchParams(window.location.search).get('mode')==='engineering';
  const base = new URL('../assets/back-p32r1/Build/', import.meta.url);
  const buildName = 'WebRuntime';
  const gate = createOutlineTokenGate();
  let instance = null, surface = null, compositeSurface = null, compositeContext = null, prepared = false, loading = false, disposed = false;
  let scope = null, scopeSignature = '', choice = 0, revealedMask = 0, selection = null, presentation = null;
  let error = null, pilotAllowed = true, previousCreate, sequence = 0, mount = engineering && new URLSearchParams(window.location.search).get('backNativeMount')==='1'?1:1.18;
  const loadEpoch = performance.timeOrigin;
  const stats = { starts: 0, quits: 0, renderedFrames: 0, drawnFrames: 0, rejectedFrames: 0, clears: 0, native: null, preparedParticles: null, idle: null, transitions: [], probes: [] };
  const timing = { prepareRequestedAt: performance.now(), readyAt: null, engineCreatedAt: null };
  const previousFrames = new Map();
  function readMemoryDiagnostics(enabled) {
    return readUnityMemoryInfo({ enabled, runtime: 'P32', instance, ready: prepared, loading, disposed, runtimeError: error, getterName: 'GetMemoryInfo' });
  }
  const timingAudit=engineering && new URLSearchParams(window.location.search).get('p32Audit')==='1';
  const timingRuns=[];
  function runTrace(){if(!timingAudit||!scope)return null;let r=timingRuns.find(r=>r.run===scope.run);if(!r){r={run:scope.run,firstScopeAt:performance.now(),firstAcceptedFrame:null,firstVisible:{},eligible:{},stopped:{},timeline:scope.timeline};timingRuns.push(r);if(timingRuns.length>4)timingRuns.shift();}r.timeline=scope.timeline;for(const t of scope.targets??[]){r.eligible[t.slot]??=performance.now();}return r;}
  const section = document.createElement('section'); section.id = 'p30p32-controls';
  section.style.cssText = 'margin:10px 0;padding:10px;border:1px solid #b7a166;border-radius:8px;background:#252d35;color:#eef1f4;max-width:900px';
  section.innerHTML='<strong>P32 原始獨立 BackFX · ORIGINAL_PARTICLE_ENGINEERING_REPLAY</strong><pre id="p32-receipt" style="max-height:160px;overflow:auto"></pre><div id="p32-frames"></div><canvas id="p32-pilot-canvas" width="1280" height="720" hidden></canvas>';
  const diagnostic = document.getElementById('diagnostic-mode'), originalMaxHeight = diagnostic.style.maxHeight;
  if(engineering){diagnostic.querySelector('summary').after(section); if(new URLSearchParams(location.search).get('r14p32r2r14')!=='1')diagnostic.open = true;}
  const $ = id => section.querySelector('#' + id);
  const pilotCanvas = $('p32-pilot-canvas'), pilotContext = pilotCanvas.getContext('2d');
  function snapshot() {
    return { build: 'R14P32R2', classification:scope?(engineering?'ORIGINAL_PARTICLE_ENGINEERING_REPLAY':'WEB_VISUAL_POLICY'):'SOURCE_CONFIRMED_ASSET', routing:'NATIVE_ACTIVATION_UNRESOLVED',
      nativeMountSource:'CoGlobal +0x108 -> clone -> parent/card position -> 0x183E56B18 localScale XYZ 0x3f970a3d -> list +0x30',sourceRootPathID:'822578672460975409', sourceRoot:'GL_EffectSpecialBack_UI', projection: 'WEB_PROJECTION_UIROOT_2_DIV_720_NATIVE_BACK_MOUNT_SOURCE_CONFIRMED_NO_PLUS5', composite: 'WEB_VISUAL_ADAPTATION_BLACK_KEY_ALPHA_ADDITIVE', sourceBackground:'Unity WebGL render surface is RGB black outside the particles; black-key adaptation leaves those pixels transparent for the in-stage shell', haloShader: 'WEB_SHADER_ADAPTATION_EXISTING_SOURCE_SEMANTIC_PORT',
      ready: prepared, loading, error, gpuInstance: Boolean(instance), scope, choice, revealedMask, effectiveMask: choice & revealedMask, mount, loadEpoch, selection, presentation,
      timing: { ...timing }, timingRuns, ...stats, app: appSnapshot() };
  }
  function notify() { if(!engineering)return; $('p32-receipt').textContent=JSON.stringify(snapshot(),null,2); }
  function fail(message) { error = String(message); clear('render-error'); notify(); }
  function record(type) {
    stats.transitions.push({ at: performance.now(), type, scope: scope?.run ?? null, choice, token: selection?.token ?? null });
    if (stats.transitions.length > 24) stats.transitions.shift();
  }
  function clear(reason) {
    const audit=runTrace();if(audit)for(const t of scope?.targets??[])audit.stopped[t.slot]??={at:performance.now(),reason};
    presentation = null; selection = null; previousFrames.clear();
    const token = gate.clear(); instance?.SendMessage('P32OutlineFixture', 'Clear', token);
    stats.clears++; record(reason);
  }
  function apply() {
    presentation = null;
    if (!scope || !prepared || !instance || error || disposed) return;
    selection = gate.issue(scope.run, choice & revealedMask);
    previousFrames.clear();
    instance.SendMessage('P32OutlineFixture', 'Apply', JSON.stringify({ ...selection, ...scope.positions, mount }));
    record('apply'); notify(); redraw();
  }
  function applyReadyScope(){if(scope&&choice&&prepared&&instance&&!selection)apply();}
  function setMask(value) {
    const next = Number(value); if (![0, 1, 2, 3].includes(next)) throw Error('P32_INVALID_MASK');
    if (!prepared || !scope || error) return;
    if (next === choice) return;
    choice = next; apply();
  }
  function setScope(next) {
    const signature = next ? JSON.stringify([next.run, next.context, next.positions]) : '';
    if (signature === scopeSignature) return;
    clear(next ? 'scope-change' : 'result-left'); choice = next?.mapping?1:0; scope = next; scopeSignature = signature;
    revealedMask = next?.context === 'pilot' ? 3 : next?.revealedMask ?? 0;
    pilotCanvas.hidden = next?.context !== 'pilot';
    diagnostic.style.maxHeight = next?.context === 'pilot' ? '440px' : originalMaxHeight;
    if (!next) { pilotContext.clearRect(0, 0, 1280, 720); }
    record('scope');if(scope?.mapping)apply();notify();
  }
  function syncScene({ result, allowPilot }) {
    pilotAllowed = allowPilot;
    if (result) {
      setScope({ context: 'result', ...result });
      if(scope&&result.mapping){const audit=runTrace();if(audit)for(const t of scope.targets??[])if(!result.targets.some(n=>n.slot===t.slot))audit.stopped[t.slot]??={at:performance.now(),reason:'opened-or-left'};scope.targets=result.targets;scope.occluders=result.occluders;scope.timeline=result.timeline;runTrace();}
      // Flip visibility is independent of fixture choice/run identity. Never reroll cards.
      const next = result.revealedMask & 3;
      if (revealedMask !== next) {
        revealedMask = next; scope.revealedMask = next;
        if (choice) apply();
      }
    }
    else if (!allowPilot || scope?.context === 'result') setScope(null);
    notify();
  }
  function paint(context) {
    if (!presentation || !selection || !gate.accepts(presentation.run, presentation.token, presentation.mask) || !(choice & revealedMask) || error) return;
    context.save(); context.globalAlpha = 1; context.globalCompositeOperation = 'lighter';
    const source=compositeSurface??surface;
    if(scope.mapping){for(const t of scope.targets??[]){if(!t.revealed||!(selection.mask&(1<<(t.root-1))))continue;const scale=t.reviewScale??1;const audit=runTrace();let roi=null,before=null;if(audit&&!audit.firstVisible[t.slot]){const m=context.getTransform();const x=Math.max(0,Math.floor((t.center.x-115*scale)*m.a)),y=Math.max(0,Math.floor((t.center.y-140*scale)*m.d)),w=Math.min(context.canvas.width-x,Math.ceil(230*scale*m.a)),h=Math.min(context.canvas.height-y,Math.ceil(280*scale*m.d));if(w>0&&h>0){roi={x,y,w,h};before=context.getImageData(x,y,w,h).data;}}context.save();context.beginPath();context.rect(0,0,1280,720);for(const box of scope.occluders??[])context.rect(box.x,box.y,box.width,box.height);context.clip('evenodd');context.globalAlpha*=t.reviewOpacity??1;context.drawImage(source,0,0,1280,720,t.center.x-640*scale,t.center.y-360*scale,1280*scale,720*scale);context.restore();if(before){const after=context.getImageData(roi.x,roi.y,roi.w,roi.h).data;let changed=0,maxDelta=0;for(let i=0;i<after.length;i+=4){const d=Math.max(after[i]-before[i],after[i+1]-before[i+1],after[i+2]-before[i+2]);if(d>=2)changed++;maxDelta=Math.max(maxDelta,d);}if(changed>=4)audit.firstVisible[t.slot]={at:performance.now(),changedPixels:changed,maxDelta,roi,presentationAt:presentation.at,sourceFrame:presentation.frame,center:t.center,scale};}}}else context.drawImage(source, 0, 0, 1280, 720); context.restore(); stats.drawnFrames++;
  }
  function prepareBlackKeyComposite() {
    if(!surface)return;
    if(!compositeSurface){compositeSurface=document.createElement('canvas');compositeSurface.width=1280;compositeSurface.height=720;compositeSurface.setAttribute('aria-hidden','true');compositeContext=compositeSurface.getContext('2d',{alpha:true,willReadFrequently:true});}
    const started=performance.now();compositeContext.clearRect(0,0,1280,720);compositeContext.drawImage(surface,0,0,1280,720);
    const image=compositeContext.getImageData(0,0,1280,720),data=image.data;
    for(let i=0;i<data.length;i+=4){const alpha=Math.max(data[i],data[i+1],data[i+2]);if(alpha===0){data[i+3]=0;continue;}data[i]=Math.round(data[i]*255/alpha);data[i+1]=Math.round(data[i+1]*255/alpha);data[i+2]=Math.round(data[i+2]*255/alpha);data[i+3]=alpha;}
    compositeContext.putImageData(image,0,0);stats.blackKeyFrames=(stats.blackKeyFrames??0)+1;stats.blackKeyLastMs=performance.now()-started;
  }
  window.p32Receive = value => {
    if (disposed) return;
    if (value.phase === 'P32_PREPARED') { prepared = true; timing.readyAt = performance.now(); stats.preparedParticles = value.particles; applyReadyScope(); }
    if (value.phase === 'P32_IDLE') stats.idle = value;
    if (value.phase === 'P32_PREPARED' || value.phase === 'P32_IDLE' || value.token === selection?.token) stats.native = value;
    notify();
  };
  window.p32Frame = (frame, run, token, mask) => {
    if (disposed || error || !gate.accepts(run, token, mask)) { stats.rejectedFrames++; return; }
    presentation = { frame, run, token, mask, at: performance.now() };prepareBlackKeyComposite();const audit=runTrace();if(audit&&!audit.firstAcceptedFrame)audit.firstAcceptedFrame={at:presentation.at,frame,token,mask}; stats.renderedFrames++;
    if (scope?.context === 'pilot') { pilotContext.fillStyle = '#242424'; pilotContext.fillRect(0, 0, 1280, 720); paint(pilotContext); }
    else redraw();
  };
  function upright(raw) {
    const result = new Uint8ClampedArray(raw.length), stride = 1280 * 4;
    for (let y = 0; y < 720; y++) result.set(raw.subarray((719-y)*stride, (720-y)*stride), y*stride);
    return result;
  }
  function metrics(off, on, previous) {
    let changedPixels = 0, offNonBlackPixels = 0, magentaPixels = 0, motionPixels = 0, minX = 1280, minY = 720, maxX = -1, maxY = -1;
    for (let i = 0; i < on.length; i += 4) {
      if (off[i] || off[i+1] || off[i+2]) offNonBlackPixels++;
      if (on[i] > 220 && on[i+1] < 20 && on[i+2] > 220) magentaPixels++;
      if (Math.max(Math.abs(on[i]-off[i]), Math.abs(on[i+1]-off[i+1]), Math.abs(on[i+2]-off[i+2])) > 1) {
        changedPixels++; const x = (i/4)%1280, y = Math.floor(i/4/1280);
        minX = Math.min(minX,x); minY = Math.min(minY,y); maxX = Math.max(maxX,x); maxY = Math.max(maxY,y);
      }
      if (previous && Math.max(Math.abs(on[i]-previous[i]), Math.abs(on[i+1]-previous[i+1]), Math.abs(on[i+2]-previous[i+2])) > 1) motionPixels++;
    }
    return { changedPixels, offNonBlackPixels, magentaPixels, motionPixelsComparedToFirst: previous ? motionPixels : null,
      bounds: changedPixels ? { x:minX, y:minY, width:maxX-minX+1, height:maxY-minY+1 } : null };
  }
  function addImage(label, rgba, id) {
    const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
    canvas.getContext('2d').putImageData(new ImageData(rgba,1280,720),0,0);
    const a = document.createElement('a'); a.id = id; a.textContent = label + ' PNG'; a.download = id+'.png'; a.href = canvas.toDataURL('image/png'); a.style.marginRight = '10px'; $('p32-frames').append(a);
  }
  window.p32Probe = async (rawOff, rawOn, root, index, age, run, token, layer = 0) => {
    if(!engineering)return;
    const mask = selection?.mask;
    if (!gate.accepts(run,token,mask) || error || disposed) return;
    const frameKey = `${root}:${layer}`;
    const off = upright(rawOff), on = upright(rawOn), previous = previousFrames.get(frameKey);
    const row = { run, token, context: scope.context, positions: { ...scope.positions }, root, layer:layer?'HaloOnly':'WholeRoot', mount, cardRects:appSnapshot().cardRects??[], index, ageSeconds: age,
      at: performance.now(), ...metrics(off,on,previous), rgbaSha256: null };
    if (!previous) previousFrames.set(frameKey,on);
    stats.probes.push(row); if (stats.probes.length > 32) stats.probes.shift();
    const id = `p32-${scope.context}-${token}-root${root}-${index}${layer?'-halo':''}`;
    addImage(id,on,id); if (index === 0 && root === 1) addImage(id+'-off',off,id+'-off');
    row.rgbaSha256 = [...new Uint8Array(await crypto.subtle.digest('SHA-256',on))].map(n=>n.toString(16).padStart(2,'0')).join('');
    notify();
  };
  window.p32Error = fail;
  async function prepare() {
    loading = true; notify();
    try {
      const create = await new Promise((resolve,reject) => {
        previousCreate = window.createUnityInstance;
        const script = document.createElement('script'); script.src = new URL(buildName+'.loader.js',base).href;
        script.onload = () => { const fn = window.createUnityInstance; window.createUnityInstance = previousCreate; resolve(fn); };
        script.onerror = () => reject(Error('P32_LOADER_FAILED')); document.head.append(script);
      });
      if (disposed) return;
      surface = document.createElement('canvas'); surface.id = 'p32-native-source-canvas'; surface.width = 1280; surface.height = 720;
      surface.setAttribute('aria-hidden','true'); surface.style.cssText = 'position:fixed;left:-1400px;top:0;width:1280px;height:720px;pointer-events:none'; document.body.append(surface);
      const created = await create(surface, { dataUrl:new URL(buildName+'.data',base).href, frameworkUrl:new URL(buildName+'.framework.js',base).href, codeUrl:new URL(buildName+'.wasm',base).href,
        streamingAssetsUrl:new URL('../StreamingAssets/',base).href, companyName:'LocalSourceResearch', productName:'P32OriginalOutlineFixture', productVersion:'R14P30P32',
        matchWebGLToCanvasSize:false, webglContextAttributes:{alpha:false,preserveDrawingBuffer:true},
        showBanner:(message,type) => { if (type === 'error') fail(message); } });
      if (disposed) { await created.Quit(); surface.remove(); return; }
      instance = created; stats.starts++; timing.engineCreatedAt = performance.now();compositeSurface=document.createElement('canvas');compositeSurface.width=1280;compositeSurface.height=720;compositeSurface.setAttribute('aria-hidden','true');compositeContext=compositeSurface.getContext('2d',{alpha:true,willReadFrequently:true});
      applyReadyScope();
    } catch(e) { fail(e); surface?.remove(); }
    finally { loading = false; notify(); }
  }
  document.addEventListener('visibilitychange',() => { if (document.hidden) { setScope(null); notify(); } else redraw(); });
  async function dispose() { if (disposed) return; setScope(null); disposed = true; prepared = false; if (instance) { const old = instance; instance = null; await old.Quit(); stats.quits++; } surface?.remove(); }
  window.addEventListener('pagehide',() => { void dispose(); });
  function measuredPaint(...args) {
    if (!new URLSearchParams(location.search).has('phoneDiag')) return paint(...args);
    const start = performance.now();
    try { return paint(...args); }
    finally {
      const ms = performance.now() - start;
      stats.phonePaintCalls = (stats.phonePaintCalls || 0) + 1;
      stats.phonePaintTotalMs = (stats.phonePaintTotalMs || 0) + ms;
      stats.phonePaintMaxMs = Math.max(stats.phonePaintMaxMs || 0, ms);
    }
  }
  void prepare();
  return Object.freeze({ syncScene, paint: measuredPaint, snapshot, readMemoryDiagnostics, dispose });
}
