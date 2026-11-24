import { createP7IdleControl } from './p7-idle-control.mjs';
import { createOutlineTokenGate, outlineFixtureEnabled } from './outline-fixture-state.mjs';
import { readUnityMemoryInfo } from './unity-memory-f12-diagnostic.mjs';

// Source PS run in Unity. Only slot routing, projection and the compositor are Web fixtures.
export function createCardOutlineFixture({ redraw, appSnapshot }) {
  if (!outlineFixtureEnabled(new URLSearchParams(window.location.search))) throw Error('P7_ENGINEERING_OPT_IN_REQUIRED');
  const base = new URL('../assets/outline-p7/Build/', import.meta.url);
  const buildName = 'WebRuntimeR2';
  const gate = createOutlineTokenGate();
  let instance = null, surface = null, compositeSurface = null, compositeContext = null, prepared = false, loading = false, disposed = false;
  let scope = null, scopeSignature = '', choice = 0, revealedMask = 0, selection = null, presentation = null;
  let error = null, pilotAllowed = true, previousCreate, sequence = 0, mount = 1.18;
  const loadEpoch = performance.timeOrigin;
  const stats = { starts: 0, quits: 0, renderedFrames: 0, drawnFrames: 0, rejectedFrames: 0, clears: 0, native: null, preparedParticles: null, idle: null, transitions: [], probes: [] };
  const timing = { prepareRequestedAt: performance.now(), readyAt: null, engineCreatedAt: null };
  const previousFrames = new Map();
  const idleEnabled=new URLSearchParams(window.location.search).get('mode')==='player'&&new URLSearchParams(window.location.search).get('p12P7IdlePause')==='1';
  const idleControl=createP7IdleControl({enabled:idleEnabled,getInstance:()=>instance,onFault:message=>{error='P7_IDLE_CONTROL_FAILED: '+message;presentation=null;notify(true);}});
  function observeIdleScene(scene){if(idleEnabled)idleControl.scene(scene.shop&&!scene.movie&&!scene.pending&&!scene.hidden);}
  function maybePause(){if(idleEnabled)idleControl.maybePause({prepared,loading,disposed,error,scope,selection,presentation,effectiveMask:choice&revealedMask});}

  function readMemoryDiagnostics(enabled) {
    return readUnityMemoryInfo({ enabled, runtime: 'P7', instance, ready: prepared, loading, disposed, runtimeError: error, getterName: 'GetMemoryInfo' });
  }
  const root2ReviewEnabled=new URLSearchParams(location.search).get('mode')==='engineering'&&new URLSearchParams(location.search).get('root2Review')==='1';
  const formalRoot2Contribution=.60; // PLAYER_DECISION / WEB_ADAPTATION
  let root2Contribution=formalRoot2Contribution;
  // Whole-frame analysis/PNG exports are diagnostics, never player rendering.
  const p7ProbeEnabled=new URLSearchParams(location.search).get('mode')==='engineering'&&new URLSearchParams(location.search).get('p7Probe')==='1';
  let skippedProbes=0;
  const section = document.createElement('section'); section.id = 'p30p7-controls';
  section.style.cssText = 'margin:10px 0;padding:10px;border:1px solid #b7a166;border-radius:8px;background:#252d35;color:#eef1f4;max-width:900px';
  section.innerHTML = `<strong>P7 逐卡外框｜WEB_GRADE_VISUAL_MAPPING</strong>
    <p>WEB_GRADE_VISUAL_MAPPING：已准入橘色Unique卡面→Root1、綠色Legendary卡面→Root2；其他卡面保持靜態，翻開完成才顯示。非原生Define/結果碼路由，可選OFF。</p>
    <label>卡框顯示 <select id="p7-mask" disabled><option value="0">OFF｜基準</option><option value="1">1｜Root1／已映射橘框</option><option value="2">2｜Root2／已映射綠框</option><option value="3">1＋2｜兩組</option></select></label>
    <label>定位 <select id="p7-mount" disabled><option value="1.18">B｜來源根掛載 1.18</option><option value="1">A｜原 P7 根掛載 1</option></select></label>
    <button type="button" id="p7-pilot" disabled>獨立預覽兩組原始粒子</button>
    <button type="button" id="p7-stop">停止並清理</button>
    <p id="p7-status" role="status">Unity 引擎預載中；粒子尚未啟動，不阻塞抽卡。</p>
    <canvas id="p7-pilot-canvas" width="1280" height="720" hidden style="width:480px;max-width:100%;background:#242424" aria-label="P7 原始卡框粒子獨立工程預覽"></canvas>
    <details><summary>P7 渲染與生命週期收據</summary><button id="p7-refresh" type="button">更新 P7 收據</button><pre id="p7-receipt" style="white-space:pre-wrap;max-height:460px;overflow:auto"></pre><div id="p7-frames"></div></details>`;
  if(root2ReviewEnabled){
    const controls=document.createElement('div');controls.id='p7-root2-tuning';controls.style.cssText='padding:8px 0';
    controls.innerHTML='<label for="p7-root2-contribution">Root2 終端亮度 · 正式 0.60×／工程即時覆寫</label> <input id="p7-root2-contribution" aria-label="Root2 終端亮度" type="range" min="0.30" max="1.10" step="0.01" value="0.60" style="width:260px;max-width:55%;vertical-align:middle"> <output id="p7-root2-value" for="p7-root2-contribution">0.60×</output><div id="p7-root2-presets"></div><span id="p7-root2-apply-status" role="status"></span>';
    section.querySelector('strong').after(controls);
    const set=value=>{root2Contribution=Math.round(Math.min(1.1,Math.max(.3,Number(value)))*100)/100;controls.querySelector('input').value=String(root2Contribution);notify();redraw();};
    controls.querySelector('input').oninput=e=>set(e.target.value);
    for(const value of [.5,.6,.8,1]){const b=document.createElement('button');b.type='button';b.id='p7-root2-preset-'+value;b.textContent=value.toFixed(2);b.onclick=()=>set(value);controls.querySelector('#p7-root2-presets').append(b);}
  }
  const diagnostic = document.getElementById('diagnostic-mode'), originalMaxHeight = diagnostic.style.maxHeight;
  diagnostic.querySelector('summary').after(section);
  diagnostic.open = true;
  const $ = id => section.querySelector('#' + id);
  const pilotCanvas = $('p7-pilot-canvas'), pilotContext = pilotCanvas.getContext('2d');
  function snapshot() {
    return { ...(idleEnabled?{pauseState:idleControl.snapshot()}:{}),build: 'R14P30P7', classification: scope?.mapping??'MANUAL_SOURCE_BOUND_ENGINEERING_FIXTURE', routing: 'NATIVE_OUTLINE_ROUTING_UNRESOLVED',
      projection: 'WEB_PROJECTION_FIXTURE_UIROOT_2_DIV_720_CAMERA_ORTHO_1', composite: 'WEB_VISUAL_ADAPTATION_BLACK_KEY_ALPHA_ADDITIVE', sourceBackground:'Unity WebGL render surface is RGB black outside the particles; black-key adaptation leaves those pixels transparent for the in-stage shell', haloShader: 'WEB_SHADER_ADAPTATION_EXISTING_SOURCE_SEMANTIC_PORT',
      probeDiagnostics:{enabled:p7ProbeEnabled,skipped:skippedProbes},root2Review:{enabled:root2ReviewEnabled,formalContribution:formalRoot2Contribution,contribution:root2Contribution,classification:root2ReviewEnabled?'WEB_VISUAL_ADAPTATION_CANDIDATE':'PLAYER_DECISION_WEB_ADAPTATION_0.60'},ready: prepared, loading, error, gpuInstance: Boolean(instance), scope, choice, revealedMask, effectiveMask: choice & revealedMask, mount, loadEpoch, selection, presentation,
      timing: { ...timing }, ...stats, app: appSnapshot() };
  }
  function root2Status(){
    if(!root2ReviewEnabled)return;
    $('p7-root2-value').textContent=root2Contribution.toFixed(2)+'×';
    const applied=stats.root2Applied,live=scope?.mapping&&scope.targets?.some(t=>t.root===2&&t.revealed)&&(choice&revealedMask&2);
    $('p7-root2-apply-status').textContent=error?'停止：'+error:!live?'目前 '+root2Contribution.toFixed(2)+'×；等待已翻開的 Root2 卡片。':applied?.token===selection?.token&&applied.coefficient===root2Contribution?'已套用 '+root2Contribution.toFixed(2)+'× · Root2 '+applied.targets+' 張 · GPU frame '+applied.frame:'目前 '+root2Contribution.toFixed(2)+'×；等待下一個有效 FX 影格。';
  }
  const receiptQuery = new URLSearchParams(window.location.search);
  const receiptGateEnabled = receiptQuery.get('p12P7ReceiptGate') === '1';
  const receiptUiEnabled = !receiptGateEnabled || receiptQuery.get('mode') === 'engineering' || receiptQuery.get('p7Diagnostics') === '1';
  function notify(force = false) {
    if (!force && !receiptUiEnabled) return;
    root2Status();
    $('p7-mask').value = String(choice);
    $('p7-mask').disabled = !prepared || !scope || Boolean(error);
    $('p7-mount').disabled = !prepared || !scope || Boolean(error);
    $('p7-pilot').disabled = !prepared || !pilotAllowed || Boolean(error);
    $('p7-status').textContent = error ? '渲染停止：' + error : !prepared ? 'Unity 引擎預載中；粒子尚未啟動，不阻塞抽卡。' :
      !scope ? '引擎已預備；五組粒子關閉。可獨立預覽或開始 Normal 10+1。' : choice === 0 ?
      'OFF：原始粒子已停止並清理；同一組卡片保持原樣。' : !(choice & revealedMask) ? '等待目前顯示條件；卡背依來源或明示工程設定顯示。' : !presentation ? '等待第一個匹配 Fixture 的實際渲染畫面…' :
      `原始粒子渲染中：${scope.context === 'pilot' ? '獨立預覽' : '同一組 11 卡／指定 slot'}，選擇 ${choice}。官方每卡觸發仍 UNKNOWN。`;
    $('p7-receipt').textContent = JSON.stringify(snapshot(), null, 2);
  }
  function fail(message) { error = String(message); clear('render-error'); notify(); }
  function record(type) {
    stats.transitions.push({ at: performance.now(), type, scope: scope?.run ?? null, choice, token: selection?.token ?? null });
    if (stats.transitions.length > 24) stats.transitions.shift();
  }
  function clear(reason) {
    if(idleEnabled&&!idleControl.beforeCommand('before-clear'))return false;
    presentation = null; selection = null; previousFrames.clear();
    const token = gate.clear(); if(idleEnabled)idleControl.clearToken(token); instance?.SendMessage('P7OutlineFixture', 'Clear', token);
    stats.clears++; record(reason);return true;
  }
  function apply() {
    if(idleEnabled&&!idleControl.beforeCommand('before-apply'))return;
    presentation = null;
    if (!scope || !prepared || !instance || error || disposed) return;
    selection = gate.issue(scope.run, choice & revealedMask);
    previousFrames.clear();
    instance.SendMessage('P7OutlineFixture', 'Apply', JSON.stringify({ ...selection, ...scope.positions, mount }));
    record('apply'); notify(); redraw();
  }
  function setMask(value) {
    const next = Number(value); if (![0, 1, 2, 3].includes(next)) throw Error('P7_INVALID_MASK');
    if (!prepared || !scope || error) return;
    if (next === choice) return;
    choice = next; apply();
  }
  function setScope(next) {
    const signature = next ? JSON.stringify([next.run, next.context, next.positions]) : '';
    if (signature === scopeSignature) return;
    if(clear(next ? 'scope-change' : 'result-left')===false)return; choice = next?.mapping?3:0; scope = next; scopeSignature = signature;
    revealedMask = next?.context === 'pilot' ? 3 : next?.revealedMask ?? 0;
    pilotCanvas.hidden = next?.context !== 'pilot';
    diagnostic.style.maxHeight = next?.context === 'pilot' ? '440px' : originalMaxHeight;
    if (!next) { pilotContext.clearRect(0, 0, 1280, 720); }
    record('scope');if(scope?.mapping)apply();notify();
  }
  function syncScene({ result, allowPilot }) {
    if(idleEnabled&&result&&!idleControl.resume('result-before-scope'))return;
    pilotAllowed = allowPilot;
    if (result) {
      setScope({ context: 'result', ...result });
      if(scope&&result.mapping)scope.targets=result.targets;
      // Flip visibility is independent of fixture choice/run identity. Never reroll cards.
      const next = result.revealedMask & 3;
      if (revealedMask !== next) {
        revealedMask = next; scope.revealedMask = next;
        if (choice) apply();
      }
    }
    else if (!allowPilot || scope?.context === 'result') setScope(null);
    maybePause();notify();
  }
  function paint(context, root2Override) {
    if (!presentation || !selection || !gate.accepts(presentation.run, presentation.token, presentation.mask) || !(choice & revealedMask) || error) return;
    context.save(); context.globalAlpha = 1; context.globalCompositeOperation = 'lighter';
    const source=compositeSurface??surface;
    if(scope.mapping){for(const t of scope.targets??[]){if(!t.revealed||!(selection.mask&(1<<(t.root-1))))continue;const sx=t.root===1?0:640;const scale=t.reviewScale??1;context.save();const gain=t.root===2&&root2ReviewEnabled?(Number.isFinite(root2Override)&&root2Override>=.3&&root2Override<=1.1?root2Override:root2Contribution):t.root===2?formalRoot2Contribution:1;context.globalAlpha*=(t.reviewOpacity??1)*Math.min(1,gain);if(gain>1)context.filter='brightness('+gain+')';context.drawImage(source,sx,0,640,720,t.center.x-320*scale,t.center.y-360*scale,640*scale,720*scale);context.restore();}}else context.drawImage(source, 0, 0, 1280, 720); context.restore(); stats.drawnFrames++;if(scope?.mapping){const targets=scope.targets.filter(t=>t.root===2&&t.revealed&&(selection.mask&2)).length;if(targets)stats.root2Applied={coefficient:root2ReviewEnabled?(Number.isFinite(root2Override)?root2Override:root2Contribution):formalRoot2Contribution,targets,frame:presentation.frame,run:selection.run,token:selection.token};root2Status();}
  }
  function prepareBlackKeyComposite() {
    if(!surface)return;
    if(!compositeSurface){compositeSurface=document.createElement('canvas');compositeSurface.width=1280;compositeSurface.height=720;compositeSurface.setAttribute('aria-hidden','true');compositeContext=compositeSurface.getContext('2d',{alpha:true,willReadFrequently:true});}
    const started=performance.now();compositeContext.clearRect(0,0,1280,720);compositeContext.drawImage(surface,0,0,1280,720);
    const image=compositeContext.getImageData(0,0,1280,720),data=image.data;
    for(let i=0;i<data.length;i+=4){const alpha=Math.max(data[i],data[i+1],data[i+2]);if(alpha===0){data[i+3]=0;continue;}data[i]=Math.round(data[i]*255/alpha);data[i+1]=Math.round(data[i+1]*255/alpha);data[i+2]=Math.round(data[i+2]*255/alpha);data[i+3]=alpha;}
    compositeContext.putImageData(image,0,0);stats.blackKeyFrames=(stats.blackKeyFrames??0)+1;stats.blackKeyLastMs=performance.now()-started;
  }
  window.p7Receive = value => {
    if (disposed) return;
    if(idleEnabled)idleControl.receive(value);
    if (value.phase === 'P7_PREPARED') { prepared = true; timing.readyAt = performance.now(); stats.preparedParticles = value.particles; }
    if (value.phase === 'P7_IDLE') stats.idle = value;
    if (value.phase === 'P7_PREPARED' || value.phase === 'P7_IDLE' || value.token === selection?.token) stats.native = value;
    notify();
  };
  window.p7Frame = (frame, run, token, mask) => {
    if (disposed || error || !gate.accepts(run, token, mask)) { stats.rejectedFrames++; return; }
    presentation = { frame, run, token, mask, at: performance.now() };prepareBlackKeyComposite(); stats.renderedFrames++;
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
    const a = document.createElement('a'); a.id = id; a.textContent = label + ' PNG'; a.download = id+'.png'; a.href = canvas.toDataURL('image/png'); a.style.marginRight = '10px'; $('p7-frames').append(a);
  }
  window.p7Probe = async (rawOff, rawOn, root, index, age, run, token, layer = 0) => {
    if(!p7ProbeEnabled){skippedProbes++;return;}
    const mask = selection?.mask;
    if (!gate.accepts(run,token,mask) || error || disposed) return;
    const probeStartedAt=performance.now();
    const frameKey = `${root}:${layer}`;
    const off = upright(rawOff), on = upright(rawOn), previous = previousFrames.get(frameKey);
    const row = { run, token, context: scope.context, positions: { ...scope.positions }, root, layer:layer?'HaloOnly':'WholeRoot', mount, cardRects:appSnapshot().cardRects??[], index, ageSeconds: age,
      at: performance.now(), ...metrics(off,on,previous), rgbaSha256: null };
    if (!previous) previousFrames.set(frameKey,on);
    stats.probes.push(row); if (stats.probes.length > 32) stats.probes.shift();
    const id = `p7-${scope.context}-${token}-root${root}-${index}${layer?'-halo':''}`;
    addImage(id,on,id); if (index === 0 && root === 1) addImage(id+'-off',off,id+'-off');
    row.probeWork={start:probeStartedAt,end:performance.now(),syncMs:performance.now()-probeStartedAt};
    row.rgbaSha256 = [...new Uint8Array(await crypto.subtle.digest('SHA-256',on))].map(n=>n.toString(16).padStart(2,'0')).join('');
    notify();
  };
  window.p7Error = fail;
  async function prepare() {
    loading = true; notify();
    try {
      const create = await new Promise((resolve,reject) => {
        previousCreate = window.createUnityInstance;
        const script = document.createElement('script'); script.src = new URL(buildName+'.loader.js',base).href;
        script.onload = () => { const fn = window.createUnityInstance; window.createUnityInstance = previousCreate; resolve(fn); };
        script.onerror = () => reject(Error('P7_LOADER_FAILED')); document.head.append(script);
      });
      if (disposed) return;
      surface = document.createElement('canvas'); surface.id = 'p7-native-source-canvas'; surface.width = 1280; surface.height = 720;
      surface.setAttribute('aria-hidden','true'); surface.style.cssText = 'position:fixed;left:-1400px;top:0;width:1280px;height:720px;pointer-events:none'; document.body.append(surface);
      const created = await create(surface, { dataUrl:new URL(buildName+'.data',base).href, frameworkUrl:new URL(buildName+'.framework.js',base).href, codeUrl:new URL(buildName+'.wasm',base).href,
        streamingAssetsUrl:new URL('../StreamingAssets/',base).href, companyName:'LocalSourceResearch', productName:'P7OriginalOutlineFixture', productVersion:'R14P30P7',
        matchWebGLToCanvasSize:false, webglContextAttributes:{alpha:false,preserveDrawingBuffer:true},
        showBanner:(message,type) => { if (type === 'error') fail(message); } });
      if (disposed) { await created.Quit(); surface.remove(); return; }
      instance = created; stats.starts++; timing.engineCreatedAt = performance.now();compositeSurface=document.createElement('canvas');compositeSurface.width=1280;compositeSurface.height=720;compositeSurface.setAttribute('aria-hidden','true');compositeContext=compositeSurface.getContext('2d',{alpha:true,willReadFrequently:true});
      if (scope && choice) apply();
    } catch(e) { fail(e); surface?.remove(); }
    finally { loading = false; notify(); }
  }
  $('p7-mask').addEventListener('change',e => setMask(e.target.value));
  $('p7-mount').addEventListener('change',e => {const value=Number(e.target.value);if(value!==1&&value!==1.18)throw Error('P7_INVALID_MOUNT');mount=value;apply();});
  $('p7-pilot').onclick = () => { if (!prepared || !pilotAllowed || error) return;
    setScope({ context:'pilot', run:`p7-pilot-${++sequence}`, positions:{x1:-240,y1:0,x2:240,y2:0} }); setMask(3); };
  $('p7-stop').onclick = () => { if (scope?.context === 'pilot') setScope(null); else setMask(0); notify(); redraw(); };
  $('p7-refresh').onclick = () => notify(true);
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
  return Object.freeze({ observeIdleScene, syncScene, paint: measuredPaint, snapshot, readMemoryDiagnostics, dispose });
}
