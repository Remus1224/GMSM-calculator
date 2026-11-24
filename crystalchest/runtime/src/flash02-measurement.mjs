// P8R2 observation only. No particle, camera, draw order or scale writes.
export function createFlash02Measurement(appSnapshot) {
  const raster = document.createElement('canvas'); raster.width=1280; raster.height=720;
  const read = raster.getContext('2d', { willReadFrequently:true });
  const events=[], stages=[], activations=[]; const seen=new Set(); let current=null,pending=null,lastSettled=-1;
  function event(type,details={}) { events.push({type,at:performance.now(),...details}); }
  const video=document.getElementById('movie');
  for(const name of ['playing','ended']) video.addEventListener(name,()=>event('media-'+name,{mediaTime:video.currentTime,duration:video.duration}));
  document.getElementById('movie-skip').addEventListener('click',()=>event('skip-click',{mediaTime:video.currentTime,duration:video.duration}),true);
  function observeFlow() {
    const app=appSnapshot();
    for(const e of app.calibration?.flowEvents??[]) {const key=e.event+':'+e.at;if(!seen.has(key)){seen.add(key);events.push({type:e.event,...e});}}
    const count=app.calibration?.settledCards;
    if(app.sessionMode==='normal-local-ten-draw'&&count!==lastSettled){lastSettled=count;stages.push({at:performance.now(),run:app.runId,phase:app.phase,settledCards:count,opened:app.opened,cardRects:app.cardRects});}
    return app;
  }
  function start(meta) {
    const app=observeFlow();
    current={...meta,sessionStartedAt:app.calibration?.sessionStartedAt,observedFrames:0,zeroContributionFramesBeforeFirst:0,firstGpuPixel:null,firstStagePixel:null,readbackMs:[],sampleDefinition:'RGB difference>1; full1280x720 every presented frame until first stage evidence; no screen photon time'};
    activations.push(current);pending=null;
  }
  function presented(surface,meta,source) {
    if(!current||current.token!==meta.token||current.firstStagePixel)return;
    const t=performance.now();read.drawImage(surface,0,0,1280,720);const on=read.getImageData(0,0,1280,720).data;
    let count=0; const indexes=[];
    for(let i=0;i<on.length;i+=4)if(Math.max(Math.abs(on[i]-source[i]),Math.abs(on[i+1]-source[i+1]),Math.abs(on[i+2]-source[i+2]))>1){count++;indexes.push(i);}
    current.observedFrames++;current.readbackMs.push(performance.now()-t);
    if(!count){if(!current.firstGpuPixel)current.zeroContributionFramesBeforeFirst++;pending=null;return;}
    current.firstGpuPixel??={...meta,observedAt:performance.now(),count};
    pending={...meta,on,source,indexes,count};
  }
  function stage(context) {
    const app=observeFlow();
    if(!pending||!current||current.firstStagePixel||pending.token!==current.token)return;
    const t=performance.now();read.drawImage(context.canvas,0,0,context.canvas.width,context.canvas.height,0,0,1280,720);
    const final=read.getImageData(0,0,1280,720).data,rects=app.cardRects;
    for(const i of pending.indexes){
      const x=i/4%1280,y=Math.floor(i/4/1280);
      // Conservative unoccluded area: exclude all current card bounds and bottom HUD.
      if(y>=520||rects.some(r=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height))continue;
      if(Math.max(Math.abs(final[i]-pending.on[i]),Math.abs(final[i+1]-pending.on[i+1]),Math.abs(final[i+2]-pending.on[i+2]))>1)continue;
      current.firstStagePixel={presentedAt:pending.presentedAt,observedAt:performance.now(),unityFrame:pending.unityFrame,inputFrame:pending.inputFrame,x,y,
        inputRGB:Array.from(pending.source.slice(i,i+3)),gpuRGB:Array.from(pending.on.slice(i,i+3)),stageRGB:Array.from(final.slice(i,i+3)),
        sameAsFirstNonzeroGpuFrame:pending.unityFrame===current.firstGpuPixel.unityFrame,
        meaning:pending.unityFrame===current.firstGpuPixel.unityFrame?'FIRST_NONZERO_GPU_FRAME_HAS_PROVEN_UNOCCLUDED_STAGE_PIXEL':'FIRST_PROVEN_STAGE_PIXEL_UPPER_BOUND_ONLY'};
      break;
    }
    current.readbackMs.push(performance.now()-t);pending=null;
  }
  function clear(reason){pending=null;if(current&&!current.closedAt){current.closedAt=performance.now();current.closeReason=reason;}}
  return {start,presented,stage,clear,snapshot:()=>({clock:'performance.now milliseconds; mediaTime seconds; original video PTS unknown',events,stages,activations})};
}
