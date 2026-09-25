(function(){
  'use strict';
  const started=performance.now();
  const C={rafRequested:0,rafCallbacks:0,intervalCreated:0,intervalCallbacks:0,timeoutCreated:0,timeoutCallbacks:0,postMessageSent:0,postMessageReceived:0,canvasDrawCalls:0,canvasPutImageData:0,canvasClearRect:0,mutations:0,mutationCallbacks:0};
  const origRAF=window.requestAnimationFrame.bind(window), origSI=window.setInterval.bind(window), origST=window.setTimeout.bind(window);
  window.requestAnimationFrame=function(cb){C.rafRequested++; return origRAF(function(t){C.rafCallbacks++; return cb(t);});};
  window.setInterval=function(cb,ms,...args){C.intervalCreated++; if(typeof cb==='function'){const f=cb; cb=function(...a){C.intervalCallbacks++; return f.apply(this,a);};} return origSI(cb,ms,...args);};
  window.setTimeout=function(cb,ms,...args){C.timeoutCreated++; if(typeof cb==='function'){const f=cb; cb=function(...a){C.timeoutCallbacks++; return f.apply(this,a);};} return origST(cb,ms,...args);};
  const opm=window.postMessage.bind(window); window.postMessage=function(){C.postMessageSent++; return opm.apply(window,arguments);};
  window.addEventListener('message',()=>C.postMessageReceived++,true);
  const MO=window.MutationObserver;
  if(MO){window.MutationObserver=function(cb){const wrapped=function(records,obs){C.mutationCallbacks++; C.mutations+=records?records.length:0; return cb(records,obs);}; return new MO(wrapped);}; window.MutationObserver.prototype=MO.prototype;}
  const P=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;
  if(P){['drawImage','fillRect','strokeRect','fillText','strokeText','beginPath','fill','stroke'].forEach(k=>{const o=P[k]; if(typeof o==='function')P[k]=function(){C.canvasDrawCalls++; return o.apply(this,arguments);};}); const pc=P.putImageData;if(pc)P.putImageData=function(){C.canvasPutImageData++;return pc.apply(this,arguments);}; const cr=P.clearRect;if(cr)P.clearRect=function(){C.canvasClearRect++;return cr.apply(this,arguments);};}
  let last={t:performance.now(),...C}, samples=[];
  function snapshot(){const now=performance.now(),dt=Math.max(.001,(now-last.t)/1000), rates={}; for(const k of Object.keys(C))rates[k]=+((C[k]-last[k])/dt).toFixed(2); const s={atMs:Math.round(now-started),rates,totals:{...C},visibility:document.visibilityState,canvasCount:document.querySelectorAll('canvas').length,iframeCount:document.querySelectorAll('iframe').length,confirmHidden:!!document.getElementById('prayConfirmOverlay')?.hidden}; last={t:now,...C}; samples.push(s); if(samples.length>180)samples.shift(); return s;}
  const sampler=origSI(snapshot,1000);
  window.__LS_IDLE_PROFILER__={version:'Fix6-idle-profiler-1',startedAt:new Date().toISOString(),snapshot,report:function(){const s=snapshot();return {version:this.version,userAgent:navigator.userAgent,devicePixelRatio:devicePixelRatio,screen:{w:screen.width,h:screen.height},viewport:{w:innerWidth,h:innerHeight},now:s,samples:samples.slice(),totals:{...C},runtime:{href:location.href,visibility:document.visibilityState},notes:'No temperature API exists on iOS; correlate this report with observed device warmth.'};}};
})();
