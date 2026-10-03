/* Genesis presentation only. Forecasts and persisted controls stay in script.js. */
(() => {
 let root,nav,indicator,frame;
 const text=(id,value)=>{const node=document.getElementById(id);if(node&&node.textContent!==value)node.textContent=value;};
 function positionIndicator(){
  if(!nav||!nav.getBoundingClientRect().width)return;
  const selected=nav.querySelector('[aria-selected="true"]'),host=indicator.parentElement;
  if(!selected)return;
  const target=selected.getBoundingClientRect(),bounds=host.getBoundingClientRect();
  indicator.style.width=target.width+'px';indicator.style.height=target.height+'px';
  // The shared passive-card contract locks transform; translate owns this plate's motion.
  indicator.style.translate=`${target.left-bounds.left}px ${target.top-bounds.top}px`;
  if(!nav.classList.contains('is-ready'))requestAnimationFrame(()=>nav.classList.add('is-ready'));
 }
 function update(){
  if(!root)return;
  cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   positionIndicator();
   for(const [prefix,getReward] of [['liberation',liberationGetBossReward],['genesis-alchemy',genesisAlchemyGetBossReward],['genesis-stone',genesisStoneGetBossReward]]){
    let weekly=0,monthly=0,tickets=0;
    for(const boss of liberationBosses){const reward=getReward(boss),base=reward.baseTraces??reward.base;boss.monthly?monthly+=base:weekly+=base;tickets+=reward.customTicketTraces??reward.tickets;}
    text(prefix+'-weekly-income',liberationFormatNumber(weekly));text(prefix+'-monthly-income',liberationFormatNumber(monthly));text(prefix+'-ticket-income',liberationFormatNumber(tickets));
   }
   const alchemyCurrent=Number(document.getElementById('genesis-alchemy-current-level')?.value)||0,alchemyTarget=Number(document.getElementById('genesis-alchemy-target-level')?.value)||20;
   text('genesis-alchemy-current-stage-label',alchemyCurrent?'Lv.'+alchemyCurrent:'尚未鍊成');text('genesis-alchemy-target-stage-label','Lv.'+alchemyTarget);
   const selectedIndex=liberationGetSelectedStageIndex(),stage=liberationStages[selectedIndex];
   text('genesis-stage-description',stage.phase+' · '+stage.name);
   if(document.getElementById('liberation-current-stage')?.textContent!=='已完成解放')text('liberation-current-stage',stage.phase+' · '+stage.name);
   root.querySelectorAll('.liberation-stage-card').forEach(card=>{
    const copy=card.querySelector('.liberation-stage-copy');if(!copy)return;
    let status=copy.querySelector('.genesis-stage-status');
    if(!status){status=document.createElement('span');status.className='genesis-stage-status';copy.append(status);}
    const current=card.classList.contains('is-current'),complete=card.classList.contains('is-complete');
    const label=current?(complete?'目前 · 完成':'目前'):complete?'✓ 完成':'';
    if(status.textContent!==label)status.textContent=label;
   });
  });
 }
 window.GMSMGenesisLayout=Object.freeze({update});
 document.addEventListener('DOMContentLoaded',()=>{
  root=document.getElementById('tab-liberation');nav=root?.querySelector('.genesis-subtabs');if(!nav)return;
  indicator=document.createElement('span');indicator.className='genesis-tab-indicator site-summary-card';indicator.setAttribute('aria-hidden','true');
  (nav.querySelector(':scope > .liquid-surface-content')||nav).prepend(indicator);
  window.GMSMGlass?.decorate(indicator);window.GMSMGlass?.setCardRole(indicator,'info');
  nav.addEventListener('click',event=>{
   const tab=event.target.closest('[role="tab"]');if(!tab)return;
   const tabs=[...nav.querySelectorAll('[role="tab"]')],current=tabs.findIndex(t=>t.getAttribute('aria-selected')==='true');
   root.style.setProperty('--genesis-enter-offset',tabs.indexOf(tab)<current?'-6px':'6px');
  },true);
  nav.addEventListener('keydown',event=>{
   const tabs=[...nav.querySelectorAll('[role="tab"]')],index=tabs.indexOf(event.target);if(index<0)return;
   const next=event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;
   if(next===null)return;event.preventDefault();tabs[next].click();tabs[next].focus();
  });
  new ResizeObserver(update).observe(nav);
  new MutationObserver(update).observe(root,{attributes:true,attributeFilter:['class']});
  update();
 });
})();
