import {statLabels} from './runtime/src/player-records.mjs?v=2';
const $=id=>document.getElementById(id),frame=$('crystal-frame'),host=$('stage-host'),viewport=$('stage-viewport'),section=$('stage-section'),settings=$('player-settings');
const drawLabels={draws:'累積抽取',normalDraws:'一般抽取',feverDraws:'Fever 抽取',feverTriggers:'Fever 觸發',gaugeTriggers:'進度集滿',luckyTriggers:'Lucky Fever'};
const statUnits={draws:'抽',normalDraws:'抽',feverDraws:'抽',feverTriggers:'次',gaugeTriggers:'次',luckyTriggers:'次',ancientCrystal:'個',mythicSub:'把',legendarySub:'把',chaos:'件',ancient:'件',mythic:'件',legendary:'件',rare:'件',shards5:'張',shards10:'張'};
function cells(id,labels){for(const[key,label]of Object.entries(labels)){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd'),value=document.createElement('span'),unit=document.createElement('span');dt.textContent=label;value.textContent='0';value.dataset.stat=key;unit.textContent=statUnits[key]||'';unit.className='stat-unit';row.classList.add('site-summary-inset');dd.append(value,unit);row.append(dt,dd);$(id).append(row);}}
const itemDisplayLabels={...statLabels,ancientCrystal:'古代副武結晶',mythicSub:'神話副武',legendarySub:'傳說附武',shards5:'混沌碎片*5',shards10:'混沌碎片*10'};
cells('draw-stats',drawLabels);cells('item-stats',itemDisplayLabels);
function api(){try{return frame.contentWindow?.CrystalTreasureBoxPlayer;}catch{return null;}}
function update(){const runtime=api();if(!runtime)return;const state=runtime.snapshot();for(const[key,value]of Object.entries({...state,...state.items})){const el=document.querySelector(`[data-stat="${key}"]`);if(el&&Number.isFinite(value)){el.textContent=value.toLocaleString('zh-TW');el.closest('.site-summary-inset')?.classList.toggle('stat-card-large-count',value>=1000);}}
 const soundLabel=state.muted?'🔇 音效：關閉':'🔊 音效：開啟';if($('sound-toggle').textContent!==soundLabel)$('sound-toggle').textContent=soundLabel;$('sound-toggle').classList.toggle('muted',state.muted);$('sound-toggle').setAttribute('aria-pressed',String(state.muted));$('sound-toggle').disabled=!state.ready;$('reset-simulator').disabled=!state.ready;

}
frame.addEventListener('load',()=>{try{frame.contentWindow.addEventListener('crystal-treasure-box-player-state',update);update();}catch{}});
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


window.GMSMGlass?.setCardRole(settings,'input');

// Use the same notice material, colour and text-width measurement as other tools.
window.GMSMToolShell?.mount(document.querySelector('main'),{id:'Crystal-Treasure-Box',title:'水晶寶箱模擬器',operation:'手機直向可完整顯示，但建議旋轉為橫向以獲得最佳操作體驗。'});
const sharedNotice=document.querySelector('main > .site-tool-notices');
if(sharedNotice){$('stage-tools').prepend(sharedNotice);for(const phrase of sharedNotice.querySelectorAll('.site-note-phrase')){const raw=phrase.textContent,marks=raw.match(/[，。]+$/)?.[0]||'';phrase.textContent=raw.slice(0,raw.length-marks.length);if(marks){const punctuation=document.createElement('span');punctuation.className='hint-punctuation';punctuation.textContent=marks;phrase.append(punctuation);}}}

// Same theme key and accessible toggle contract as the other standalone tools.
function applyWebsiteTheme(theme,save=false){const dark=theme==='dark';if(dark)document.documentElement.setAttribute('data-theme','dark');else document.documentElement.removeAttribute('data-theme');$('theme-toggle').setAttribute('aria-pressed',String(dark));$('theme-toggle').setAttribute('aria-label',dark?'切換至日間模式':'切換至夜間模式');if(save)try{localStorage.setItem('msm-theme',dark?'dark':'light');}catch{}}
applyWebsiteTheme(document.documentElement.getAttribute('data-theme'));
$('theme-toggle').addEventListener('click',()=>applyWebsiteTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark',true));
addEventListener('storage',event=>{if(event.key==='msm-theme')applyWebsiteTheme(event.newValue);});
