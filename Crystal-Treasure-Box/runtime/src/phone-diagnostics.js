(() => {
 if(!new URLSearchParams(location.search).has('phoneDiag'))return;
 const started=performance.now(),events=[],samples=[];
 let recording=true,lastFrame=0,raf=0,timer=0,gaps=[];
 const bounded=(list,item,max)=>{list.push(item);if(list.length>max)list.shift();};
 const event=(type,data)=>bounded(events,{at:Math.round(performance.now()-started),type,data},400);
 window.addEventListener('error',e=>event('error',{
  message:e.message,source:e.filename,line:e.lineno,column:e.colno,
  errorName:e.error?.name,errorMessage:e.error?.message,stack:e.error?.stack,
  trusted:e.isTrusted,eventClass:e.constructor?.name,targetTag:e.target?.tagName,
  targetIsWindow:e.target===window,resource:e.target?.src||e.target?.href,
  currentScript:document.currentScript?.src||null,readyState:document.readyState,
  visibility:document.visibilityState,
  scripts:[...document.scripts].slice(-16).map(s=>({src:s.src||'INLINE',type:s.type||'classic',crossOrigin:s.crossOrigin})),
  recentResources:performance.getEntriesByType('resource').slice(-12).map(r=>({name:r.name,startTime:r.startTime,duration:r.duration,initiator:r.initiatorType}))
 }),true);
 // Preserve console behavior; capture only bounded diagnostic text, never objects.
 const originalConsoleError=console.error;
 console.error=function(...args){
  event('console-error',args.slice(0,6).map(value=>{
   try{return String(value?.stack||value).slice(0,2000);}catch{return '[unprintable]';}
  }));
  return Reflect.apply(originalConsoleError,this,args);
 };

 window.addEventListener('unhandledrejection',e=>event('rejection',String(e.reason?.stack||e.reason)));
 document.addEventListener('visibilitychange',()=>{event('visibility',document.visibilityState);lastFrame=0;});
 document.addEventListener('click',e=>{if(!e.target.closest('#phone-diagnostics'))event('tap',{id:e.target.id,tag:e.target.tagName,x:e.clientX,y:e.clientY});},true);
 function frame(now){if(!recording)return;if(lastFrame&&!document.hidden)gaps.push(now-lastFrame);lastFrame=now;raf=requestAnimationFrame(frame);}
 function safe(fn){try{return fn();}catch(e){return {error:String(e)};}}
 function rect(id){const el=document.getElementById(id);if(!el)return null;const r=el.getBoundingClientRect();return {hidden:el.hidden,x:r.x,y:r.y,width:r.width,height:r.height,text:el.textContent?.slice(0,300)};}
 function sample(){
  if(!recording)return;
  const sorted=gaps.sort((a,b)=>a-b);
  const p8=safe(()=>window.__r14p30P8?.snapshot());
  const app=p8?.app;
  const startup=safe(()=>({...window.__releaseStartup}));
  const status=document.querySelector('#phone-diagnostics summary');
  if(status)status.textContent=startup?.optionalReady?'手機診斷：已就緒，可操作':startup?.status==='FAILED'||startup?.optionalError?'手機診斷：載入失敗':'手機診斷：仍在載入';
  const presentation=safe(()=>{const frame=window.frameElement;if(!frame)return{visibility:document.visibilityState};const r=frame.getBoundingClientRect(),v=parent.visualViewport;return{visibility:document.visibilityState,parentScrollY:parent.scrollY,frameTop:r.top,frameBottom:r.bottom,parentHeight:v?.height||parent.innerHeight,intersectsParentViewport:r.bottom>0&&r.top<(v?.height||parent.innerHeight)};});
  bounded(samples,{presentation,startup,at:Math.round(performance.now()-started),frames:gaps.length,p95:sorted[Math.floor(sorted.length*.95)]||0,max:sorted.at(-1)||0,over100:gaps.filter(x=>x>100).length,p8,flow:safe(()=>window.__phoneFlow?.()),lucky:rect('luckyFeverOverlay'),compositionError:rect('compositionError'),loadState:rect('compositionLoadState'),stage:rect('stage'),canvas:[...document.querySelectorAll('canvas')].map(c=>({id:c.id,w:c.width,h:c.height}))},600);
  gaps=[];
 }
 function report(){sample();return {version:4,startupProfile:window.__ccStartupProfile?.data,player:safe(()=>window.CrystalTreasureBoxPlayer?.snapshot()),startup:safe(()=>({...window.__releaseStartup,characterSet:document.characterSet,documentAgeMs:Math.round(performance.now())})),navigation:safe(()=>performance.getEntriesByType('navigation').map(n=>n.toJSON())),outerPage:safe(()=>window.parent===window?null:({characterSet:parent.document.characterSet,ageMs:Math.round(parent.performance.now()),navigation:parent.performance.getEntriesByType('navigation').map(n=>n.toJSON())})),pool:safe(()=>window.crystalChestPoolList?.snapshot()),video:safe(()=>window.__phoneVideo?.snapshot()),userAgent:navigator.userAgent,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},secure:isSecureContext,url:location.href,started:new Date(performance.timeOrigin+started).toISOString(),recording,events,samples,resources:performance.getEntriesByType('resource').map(r=>({name:r.name,startTime:r.startTime,responseEnd:r.responseEnd,duration:r.duration,bytes:r.transferSize,encodedBodySize:r.encodedBodySize,decodedBodySize:r.decodedBodySize,responseStatus:r.responseStatus})),note:document.querySelector('#phone-note')?.value};}
 function download(){const blob=new Blob([JSON.stringify(report(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Crystal-Treasure-Box-phone-'+Date.now()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 function install(){
  const panel=document.createElement('details');panel.id='phone-diagnostics';panel.style.cssText='position:fixed;left:4px;top:4px;z-index:2147483647;background:#fff;color:#111;padding:6px;font:14px system-ui;max-width:85vw';
  panel.innerHTML='<summary>手機診斷記錄中</summary><p>重現問題後下載紀錄</p><input id="phone-note" placeholder="例如 Lucky 沒出現／翻卡卡頓"><button id="phone-mark">標記問題</button><button id="phone-download">下載診斷</button><button id="phone-stop">停止記錄</button>';
  document.body.append(panel);
  const video=document.getElementById('movie');
  if(video){
    const sourceLabel=document.createElement('p');sourceLabel.textContent='影片尚未播放';panel.append(sourceLabel);
    video.addEventListener('playing',()=>{sourceLabel.textContent='本輪影片：'+(video.currentSrc||video.src).split('/').pop();});
  }

  if (new URLSearchParams(location.search).get('luckyProbe') === '1') {
    const luckyButton = document.createElement('button');
    luckyButton.textContent = '本輪播放 Lucky（診斷）';
    luckyButton.onclick = () => {
      const accepted = window.__phoneLuckyArm?.() === true;
      event('diagnostic-lucky-arm', { accepted });
      luckyButton.textContent = accepted ? '已設定，請 Flip All' : '請先抽 10+1，發完後未翻卡時再按';
    };
    panel.append(luckyButton);
  }

  panel.querySelector('#phone-mark').onclick=()=>event('player-mark',panel.querySelector('#phone-note').value);
  panel.querySelector('#phone-download').onclick=download;
  panel.querySelector('#phone-stop').onclick=()=>{sample();recording=false;cancelAnimationFrame(raf);clearInterval(timer);panel.querySelector('summary').textContent='手機診斷已停止';};
  raf=requestAnimationFrame(frame);timer=setInterval(sample,1000);
 }
 document.addEventListener('DOMContentLoaded',install,{once:true});
})();