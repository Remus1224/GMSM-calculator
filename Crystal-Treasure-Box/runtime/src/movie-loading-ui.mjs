// Presentation only: never load, seek, pause or play the media element here.
export function attachMovieLoadingUI(video, stage) {
  const panel=document.createElement('div');panel.id='movie-preparing';panel.hidden=true;
  panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');
  const text=document.createElement('span');panel.append(text);stage.append(panel);
  let frame=0,waitingTimer=0,hintTimer=0,generation=0;
  function cancel(){clearTimeout(waitingTimer);clearTimeout(hintTimer);if(frame)video.cancelVideoFrameCallback?.(frame);frame=0;}
  function hide(){generation++;cancel();panel.hidden=true;}
  function show(message='影片準備中…'){
    if(video.hidden||video.ended)return;panel.hidden=false;text.textContent=message;
    clearTimeout(hintTimer);hintTimer=setTimeout(()=>{if(!panel.hidden)text.textContent='影片仍在準備中，可按右上角跳過。';},15000);
  }
  function reveal(){
    const token=++generation;cancel();
    if(video.requestVideoFrameCallback){frame=video.requestVideoFrameCallback(()=>{frame=0;if(token===generation)hide();});}
    else hide();
  }
  function delayed(){clearTimeout(waitingTimer);waitingTimer=setTimeout(()=>show('影片仍在準備中，可按右上角跳過。'),1200);}
  video.addEventListener('loadstart',()=>{hide();delayed();});
  video.addEventListener('waiting',delayed);
  video.addEventListener('playing',reveal);
  video.addEventListener('error',()=>{cancel();show('影片未能載入，可按右上角跳過。');});
  video.addEventListener('ended',hide);
  new MutationObserver(()=>{if(video.hidden)hide();else if(video.readyState<2)delayed();}).observe(video,{attributes:true,attributeFilter:['hidden','src']});
  return {snapshot:()=>({visible:!panel.hidden,text:text.textContent}),clear:hide};
}
const video=document.getElementById('movie'),stage=document.getElementById('stage');
if(video&&stage)window.__movieLoadingUI=attachMovieLoadingUI(video,stage);
