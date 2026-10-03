/* Six-transfer presentation. Requirement tables and arithmetic remain in script.js. */
(() => {
 'use strict';
 const icon=(name,alt='')=>`<img src="assets/hexa/icon_${name}.png" class="res-icon" alt="${alt}">`;
 const number=value=>Number(value).toLocaleString('zh-TW',{maximumFractionDigits:2});
 function renderCores(container,cores) {
  const options=Array.from({length:31},(_,lv)=>`<option value="${lv}">Lv. ${lv}</option>`).join('');
  // Keep unavailable controls for saved settings, but omit them from the visible grid.
  const familyOrder=['skill','mastery','enhance','common'];
  const renderCard=core=>{
   const enabled=core.mandatory||core.default;
   const shortLabel=core.id==='sk1'?'啟源':core.label.replace(/核心\s*/g,'');
   const caption=core.mandatory?`<span title="${core.label}">${shortLabel}</span>`:
    `<label for="cb-${core.id}" title="${core.label}"><input type="checkbox" id="cb-${core.id}" aria-label="${core.label}納入計算" onchange="toggleCoreProg('${core.id}')" ${enabled?'checked':''}>${shortLabel}</label>`;
   return `<div class="prog-item${enabled?'':' is-unselected'}" id="item-${core.id}"${core.hidden?' hidden':''}${core.wideOnly?' data-wide-only':''}>
    <div class="prog-core-caption">${caption}</div>
    <select id="sel-${core.id}" aria-label="${core.label}目前等級" ${enabled?'':'disabled'}>${options}</select>
   </div>`;
  };
  const rows=familyOrder.map(type=>{
   const family=cores.filter(core=>core.type===type);
   const visibleCount=family.filter(core=>!core.hidden).length;
   return `<div class="core-row" data-core-family="${type}" data-visible-count="${visibleCount}">${family.map(renderCard).join('')}</div>`;
  }).join('');
  container.innerHTML=`<div class="prog-core-groups">${rows}</div>`;
 }
 function dateAfter(days) {
  const date=new Date();date.setDate(date.getDate()+Math.ceil(days));
  return `${date.getFullYear()}/${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}`;
 }
 function timeDetail(name,days,hours,material) {
  const missing=!Number.isFinite(days),complete=days<=0;
  return `<div class="prog-time-detail prog-resource-${material}">
   <h3>${icon(material==='sol'?'靈魂艾爾達斯':'靈魂艾爾達斯碎片')}${name}</h3>
   <strong>${missing?'待補速度':complete?'庫存已足夠':`約 ${number(Math.ceil(days))} 天`}</strong>
   <span>${missing?'填寫此材料的獲取速度':complete?'可完成已納入的核心':`預計 ${dateAfter(days)}`}</span>
   ${missing||complete?'':`<small>累計掛機 ${number(Math.ceil(hours))} 小時</small>`}
  </div>`;
 }
 function resource(material,{total,invested,bag,remaining,shortfall,pct,energy}) {
  const credited=Math.min(bag,remaining),attainable=invested+credited;
  const fraction=pct.toFixed(1),bar=document.getElementById('prog-bar-'+material),track=bar.parentElement;
  bar.style.width=fraction+'%';bar.textContent='';
  track.setAttribute('aria-valuenow',fraction);
  track.setAttribute('aria-valuetext',`${fraction}%，已投入與庫存可抵合計 ${number(attainable)}，需求 ${number(total)}`);
  document.getElementById('prog-percent-'+material).textContent=fraction+'%';
  document.getElementById('prog-txt-'+material).innerHTML=`
   <p class="prog-resource-total">需求合計 <b>${number(total)}</b> 個</p>
   <dl class="prog-resource-stats">
    <div><dt>已投入</dt><dd>${number(invested)}</dd></div>
    <div><dt>庫存可抵</dt><dd>${number(credited)}</dd></div>
    <div><dt>尚缺</dt><dd>${number(shortfall)}</dd></div>
   </dl>
   ${energy?`<p class="prog-resource-note">尚缺折合 ${number(energy)} 氣息</p>`:''}`;
 }
 function renderResults(data) {
  const {totalBigNeeded,totalSmallNeeded,investedBig,investedSmall,currentBagEnergy,invFrag,remainingEnergy,remainingFrag,shortfallEnergy,shortfallFrag,solPct,fragPct,daysEnergy,daysFrag,grindHoursEnergy,grindHoursFrag}=data;
  resource('sol',{total:totalBigNeeded,invested:investedBig,bag:currentBagEnergy/1000,remaining:remainingEnergy/1000,shortfall:shortfallEnergy/1000,pct:solPct,energy:shortfallEnergy});
  resource('frag',{total:totalSmallNeeded,invested:investedSmall,bag:invFrag,remaining:remainingFrag,shortfall:shortfallFrag,pct:fragPct});
  const days=Math.max(daysEnergy,daysFrag),missing=!Number.isFinite(days),complete=days<=0;
  const names=[];if(daysEnergy===days&&daysEnergy>0)names.push('靈魂艾爾達斯');if(daysFrag===days&&daysFrag>0)names.push('碎片');
  let headline=missing?'待補獲取速度':complete?'庫存已足夠':`<b>${number(Math.ceil(days))}</b><span>天</span>`;
  let description=missing?'尚缺材料的獲取速度未填寫，暫時無法推算完成日期。':complete?'庫存已可完成所有納入核心的 Lv.30 需求。':`預計完成 ${dateAfter(days)}`;
  const box=document.getElementById('prog-time-result');
  if(totalBigNeeded===0&&totalSmallNeeded===0){headline='尚未納入核心';description='請先選擇要養成的核心。';}
  box.innerHTML=`<div class="prog-overall-summary">
   <div><h2>整體預估完成時間</h2><div class="prog-overall-value${missing||complete?' is-status':''}">${headline}</div><p>${description}</p></div>
   ${names.length?`<div class="prog-limiting"><span>${missing?'待補速度':'目前限制'}</span><strong>${names.join('、')}</strong></div>`:''}
  </div><div class="prog-time-details">${timeDetail('靈魂艾爾達斯',daysEnergy,grindHoursEnergy,'sol')}${timeDetail('艾爾達斯碎片',daysFrag,grindHoursFrag,'frag')}</div>`;
 }
 window.GMSMHexaProgress=Object.freeze({renderCores,renderResults});
})();
