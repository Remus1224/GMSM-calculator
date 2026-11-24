(() => {
  const state={app:false,pool:false,status:'LOADING',error:null,optionalReady:false};
  let releaseOptional;window.__releaseOptionalGate=new Promise(resolve=>{releaseOptional=resolve;});
  window.__releaseOptionalReady=false;
  document.documentElement.classList.add('cc-loading');
  window.__releaseStartup=state;
  function message(text){const label=document.getElementById('release-loading-message');if(label)label.textContent=text;}
  window.__releaseFail=cause=>{
    if(state.status==='READY')return;
    state.status='FAILED';state.error=String(cause?.stack||cause);
    message('素材未能完成載入，請稍後重新載入。');
    console.error('CRYSTALCHEST_STARTUP_FAILED',cause);
  };
  window.__releaseOptionalDone=(ok,cause)=>{
    state.optionalReady=ok;window.__releaseOptionalReady=ok;
    const root=document.getElementById('cleanRebuildRoot');if(root)root.inert=!ok;
    if(ok)document.getElementById('release-loading')?.remove();
    else{state.optionalError=String(cause?.stack||cause);message('抽取動畫未能完成載入，請重新載入。');console.error('OPTIONAL_ASSETS_FAILED',cause);}
  };
  window.__releaseMarkReady=part=>{
    state[part]=true;
    if(!state.app||!state.pool||state.status==='FAILED')return;
    try{window.cleanRebuild?.render();}
    catch(cause){window.__releaseFail(cause);return;}
    requestAnimationFrame(()=>{
      state.status='READY';
      document.documentElement.classList.remove('cc-loading');
      document.getElementById('release-loading')?.classList.add('compact');
      message('正在準備抽取動畫…');releaseOptional();
    });
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const panel=document.createElement('section');panel.id='release-loading';panel.setAttribute('role','status');
    panel.innerHTML='<p id="release-loading-message">正在載入水晶寶箱…</p><button type="button">重新載入</button>';
    panel.querySelector('button').onclick=()=>location.reload();
    document.body.append(panel);
    const root=document.getElementById('cleanRebuildRoot');if(root)root.inert=!state.optionalReady;
    if(state.optionalReady)panel.remove();
    else if(state.status==='READY'){panel.classList.add('compact');message('正在準備抽取動畫…');}
    else if(state.status==='FAILED')message('素材未能完成載入，請稍後重新載入。');
    setTimeout(()=>{if(state.status==='LOADING')message('仍在載入，可繼續等待或重新載入。');},20000);
  },{once:true});
})();
