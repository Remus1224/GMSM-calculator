import {statLabels} from './runtime/src/player-records.mjs?v=2';
const $=id=>document.getElementById(id),frame=$('crystal-frame'),host=$('stage-host'),viewport=$('stage-viewport'),section=$('stage-section'),settings=$('player-settings');
const drawLabels={draws:'累積抽取（抽）',normalDraws:'一般抽取（抽）',feverDraws:'Fever 抽取（抽）',singles:'單抽購買（次）',normalTen:'一般 10+1（次）',feverTen:'Fever 10+1（次）',feverTriggers:'Fever 觸發（次）',gaugeTriggers:'進度集滿（次）',luckyTriggers:'Lucky Fever（次）'};
function cells(id,labels){for(const[key,label]of Object.entries(labels)){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent='0';dd.dataset.stat=key;row.classList.add('site-summary-inset');row.append(dt,dd);$(id).append(row);}}
cells('draw-stats',drawLabels);cells('item-stats',statLabels);
function api(){try{return frame.contentWindow?.CrystalChestPlayer;}catch{return null;}}
function update(){const runtime=api();if(!runtime)return;const state=runtime.snapshot();for(const[key,value]of Object.entries({...state,...state.items})){const el=document.querySelector(`[data-stat="${key}"]`);if(el&&Number.isFinite(value))el.textContent=value.toLocaleString('zh-TW');}
 $('draw-summary').textContent=`累積 ${state.draws.toLocaleString('zh-TW')} 抽；Fever 觸發 ${state.feverTriggers.toLocaleString('zh-TW')} 次`;
 $('shard-summary').textContent=`混沌碎片合計：${state.shardsTotal.toLocaleString('zh-TW')} 個（依交換券面額換算）`;
 $('sound-toggle').textContent=state.muted?'音效：靜音':'音效：開啟';$('sound-toggle').setAttribute('aria-pressed',String(state.muted));$('sound-toggle').disabled=!state.ready;$('reset-simulator').disabled=!state.ready;

}
frame.addEventListener('load',()=>{try{frame.contentWindow.addEventListener('crystalchest-player-state',update);update();}catch{}});
$('sound-toggle').addEventListener('click',()=>{const runtime=api();if(runtime)runtime.setMuted(!runtime.snapshot().muted);update();});
$('reset-simulator').addEventListener('click',()=>{const runtime=api();if(!runtime)return;$('reset-simulator').disabled=true;$('sound-toggle').disabled=true;runtime.reset();});
const target=new URL('runtime/',location.href);target.search=location.search;target.searchParams.set('shell','2');frame.src=target.href;
let returnY=0,reflowPending=false;
function nativeFull(){return document.fullscreenElement===host||document.webkitFullscreenElement===host;}
function isFull(){return nativeFull()||host.classList.contains('fake-fullscreen');}
function reflow(){reflowPending=false;const vv=window.visualViewport,w=vv?.width||innerWidth,h=vv?.height||innerHeight,full=isFull();let width=Math.min(full?w:section.clientWidth,1280);if(full||w>h)width=Math.min(width,Math.max(1,h-16)*16/9);const height=width*9/16;
 const button=$('fullscreen-toggle');if(full&&button.parentNode!==host)host.append(button);else if(!full&&button.parentNode===host)$('stage-tools').append(button);
 viewport.style.width=width+'px';viewport.style.height=height+'px';if(!full){host.style.width=width+'px';host.style.height=height+'px';settings.style.maxWidth=width+'px';}
 $('fullscreen-toggle').textContent=full?'×':'⛶';$('fullscreen-toggle').setAttribute('aria-label',full?'離開全螢幕':'全螢幕顯示模擬器');
}
function queueReflow(){if(!reflowPending){reflowPending=true;requestAnimationFrame(reflow);}}
function fakeFull(on){if(on)returnY=scrollY;host.classList.toggle('fake-fullscreen',on);document.documentElement.classList.toggle('crystal-no-scroll',on);if(on)scrollTo(0,0);else scrollTo(0,returnY);queueReflow();}
$('fullscreen-toggle').addEventListener('click',async()=>{if(isFull()){if(nativeFull()){if(document.exitFullscreen)await document.exitFullscreen();else document.webkitExitFullscreen?.();}else fakeFull(false);}else{const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);if(ios||!host.requestFullscreen)fakeFull(true);else try{await host.requestFullscreen();}catch{fakeFull(true);}}queueReflow();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&host.classList.contains('fake-fullscreen'))fakeFull(false);});
addEventListener('resize',queueReflow);addEventListener('orientationchange',queueReflow);visualViewport?.addEventListener('resize',queueReflow);document.addEventListener('fullscreenchange',queueReflow);document.addEventListener('webkitfullscreenchange',queueReflow);queueReflow();
