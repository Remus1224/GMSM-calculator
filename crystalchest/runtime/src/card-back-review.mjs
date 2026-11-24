export const BACK_REVIEW_DEFAULTS=Object.freeze({enabled:true,scale:1,x:0,y:0,opacity:1,delayMs:0});
export function backReviewTypes(choice){
  if(choice==='mixed')return Array.from({length:11},(_,i)=>i%2?'legendary':'unique');
  if(!['normal','epic','unique','legendary'].includes(choice))throw Error('UNKNOWN_BACK_TEXTURE');
  return Array(11).fill(choice);
}
export function mountBackReview({mode,host,display,configure}){
  if(mode!=='engineering')return;
  const panel=document.createElement('section');panel.id='card-back-review';
  panel.innerHTML=`<h3>卡背驗收 · ENGINEERING_FIXTURE_ONLY</h3>
  <p>P32：A為已被玩家拒絕的舊Root1；B為獨立原始GL_EffectSpecialBack_UI兩PS。皆僅人工工程展示，非官方啟用規則。</p>
  <select id="cb-type"><option value="legendary">紅綠特殊背 ×11</option><option value="unique">橘色 Unique 背 ×11</option><option value="epic">Epic 背 ×11（來源候選）</option><option value="normal">Normal 背 ×11（來源候選）</option><option value="mixed">橘／紅綠混合</option></select>
  <button id="cb-show" type="button">顯示卡背11卡</button>
  <label>FX比較 <select id="cb-fx"><option value="off">OFF</option><option value="root1">A 舊Root1</option><option value="backfx" selected>B 原始BackFX</option></select></label>
  <button id="cb-play" type="button">播放／重啟延遲</button><button id="cb-stop" type="button">停止特效</button>
  <label>scale <input id="cb-scale" type="number" min="0.25" max="2" step="0.05" value="1"></label>
  <label>X <input id="cb-x" type="number" min="-100" max="100" value="0"></label>
  <label>Y <input id="cb-y" type="number" min="-100" max="100" value="0"></label>
  <label>opacity <input id="cb-opacity" type="range" min="0" max="1" step="0.05" value="1"></label>
  <label>start delay ms <input id="cb-delay" type="number" min="0" max="5000" step="100" value="0"></label>
  <p id="cb-status">請先Confirm離開舊結果再顯示；本功能不抽樣、不計Gauge或額度。顯示後自動收合，未翻卡直接觀察。</p>`;
  host.prepend(panel);host.open=true;
  const $=id=>panel.querySelector('#'+id);
  const settings=()=>({fxMode:$('cb-fx').value,scale:Number($('cb-scale').value),x:Number($('cb-x').value),y:Number($('cb-y').value),opacity:Number($('cb-opacity').value),delayMs:Number($('cb-delay').value)});
  for(const id of ['cb-scale','cb-x','cb-y','cb-opacity','cb-delay'])$(id).oninput=()=>configure(settings());
  $('cb-fx').onchange=()=>configure({...settings(),enabled:$('cb-fx').value!=='off',restart:true});
  $('cb-play').onclick=()=>configure({...settings(),enabled:true,restart:true});
  $('cb-stop').onclick=()=>configure({enabled:false});
  $('cb-show').onclick=async()=>{try{await display(backReviewTypes($('cb-type').value));host.open=false;$('cb-status').textContent='已顯示。紅綠背候選可播放／停止；Confirm沿原路徑清理。';}catch(e){$('cb-status').textContent=String(e);}};
}
