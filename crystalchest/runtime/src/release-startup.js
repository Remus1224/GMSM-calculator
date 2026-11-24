(() => {
  const state={app:false,pool:false,status:'LOADING',error:null,optionalReady:false};
  let releaseOptional;window.__releaseOptionalGate=new Promise(resolve=>{releaseOptional=resolve;});
  window.__releaseOptionalReady=false;
  document.documentElement.classList.add('cc-loading');
  window.__releaseStartup=state;
  function message(text){const label=document.getElementById('release-loading-message');if(label)label.textContent=text;}
  function showRecovery(){const button=document.getElementById('release-loading-retry');if(button)button.hidden=false;}
  window.__releaseFail=cause=>{
    if(state.status==='READY')return;
    state.status='FAILED';state.error=String(cause?.stack||cause);
    message('素材未能完成載入，請稍後重新載入。');
    showRecovery();
    console.error('CRYSTALCHEST_STARTUP_FAILED',cause);
  };
  window.__releaseOptionalDone=(ok,cause)=>{
    state.optionalReady=ok;window.__releaseOptionalReady=ok;
    const root=document.getElementById('cleanRebuildRoot');if(root)root.inert=!ok;
    if(ok)document.getElementById('release-loading')?.remove();
    else{state.optionalError=String(cause?.stack||cause);message('抽取動畫未能完成載入，請重新載入。');showRecovery();console.error('OPTIONAL_ASSETS_FAILED',cause);}
  };
  window.__releaseMarkReady=part=>{
    state[part]=true;
    if(!state.app||!state.pool||state.status==='FAILED')return;
    try{window.cleanRebuild?.render();}
    catch(cause){window.__releaseFail(cause);return;}
    requestAnimationFrame(()=>{
      state.status='READY';
      document.documentElement.classList.remove('cc-loading');
      releaseOptional();
    });
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const panel=document.createElement('section');panel.id='release-loading';panel.setAttribute('role','status');
    panel.innerHTML='<div class="start-card"><h1 class="will-game-title">水晶寶箱模擬器</h1><p id="release-loading-message" aria-live="polite">素材載入中…</p><p id="release-loading-hint" hidden>載入時間較長，請稍候；也可以重新載入。</p><button id="release-loading-retry" type="button" hidden>重新載入</button></div>';
    panel.querySelector('button').onclick=()=>location.reload();
    document.body.append(panel);
    const root=document.getElementById('cleanRebuildRoot');if(root)root.inert=!state.optionalReady;
    if(state.optionalReady)panel.remove();
    else if(state.optionalError){message('抽取動畫未能完成載入，請重新載入。');showRecovery();}
    else if(state.status==='FAILED'){message('素材未能完成載入，請稍後重新載入。');showRecovery();}
    setTimeout(()=>{if(!state.optionalReady&&state.status!=='FAILED'&&!state.optionalError){const hint=document.getElementById('release-loading-hint');if(hint)hint.hidden=false;showRecovery();}},20000);
  },{once:true});
})();
