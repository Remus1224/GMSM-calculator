import {fetchResource as fetch,loadImage} from './resource-loader.mjs';
import { sampleCurve, gradient, makeRandom } from './p8-canvas-candidate.mjs';

// Source-derived approximation. No Unity, background capture, transport or RGB gate.
export function createOneTimeBackgroundMotion({ redraw, onStatus }) {
  let ready=false, disposed=false, error=null, key=null, current=null, variant='motion';
  let groups=[], frame=0, start=0, age=0, sequence=0, painted=0, ticks=0;
  let random=makeRandom(0x503c2026), config=null;
  const runs=[], textures=[];
  const timing={shopReadyAt:null,prewarmRequestedAt:performance.now(),canvasReadyAt:null};
  const resources={originalTextures:0,tintCanvases:0,rgbaBudgetBytes:0};
  const snapshot=()=>({backend:'P3_CANVAS2D',classification:'SOURCE_DERIVED_VISUAL_APPROXIMATION',
    ready,loading:!ready&&!error&&!disposed,error,applicable:key!==null,variant,
    gpuInstance:false,p3UnityInstanceCreated:false,p3WebGLContextCreated:false,
    background:'CURRENT_STAGE_DIRECT_COMPOSITE',transport:'NOT_APPLICABLE',
    drawOrderNativeProven:false,tintBins:16,removedByPlayerDecision:['center_b001'],age,paintedFrames:painted,animationTicks:ticks,
    particles:groups.map(g=>({name:g.c.name,count:g.items.length,max:g.c.max,blend:g.c.blend})),
    resources:{...resources},timing:{...timing},currentRun:current,runs:runs.map(r=>({...r}))});
  const notify=()=>onStatus?.(snapshot());
  const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=0;};
  const schedule=()=>{if(ready&&key&&!disposed&&!error&&!document.hidden&&!frame)frame=requestAnimationFrame(tick);};
  async function prepareSources(){
    try{
      const response=await fetch(new URL('./p3-canvas-config.json',import.meta.url));
      if(!response.ok)throw Error('P3_CANVAS_CONFIG_REQUIRED');
      config=await response.json();

      for(const c of config.particles){
        const image=await loadImage(new URL(c.texture,import.meta.url).href);
        if(disposed)return;
        resources.originalTextures++;
        const scratch=document.createElement('canvas');scratch.width=image.naturalWidth;scratch.height=image.naturalHeight;
        const source=scratch.getContext('2d',{willReadFrequently:true});source.drawImage(image,0,0);
        const pixels=source.getImageData(0,0,scratch.width,scratch.height);
        const tints=[];
        for(let bin=0;bin<16;bin++){
          if(disposed)return;
          const canvas=document.createElement('canvas');canvas.width=scratch.width;canvas.height=scratch.height;
          const data=new ImageData(new Uint8ClampedArray(pixels.data),canvas.width,canvas.height);
          const rgb=['r','g','b'].map(channel=>gradient(c.colors,bin/15,channel)*(c.startColor?.[channel]??1));
          for(let i=0;i<data.data.length;i+=4){
            data.data[i]=Math.round(data.data[i]*rgb[0]);
            data.data[i+1]=Math.round(data.data[i+1]*rgb[1]);
            data.data[i+2]=Math.round(data.data[i+2]*rgb[2]);
          }
          canvas.getContext('2d').putImageData(data,0,0);tints.push(canvas);textures.push(canvas);
          resources.tintCanvases++;resources.rgbaBudgetBytes+=canvas.width*canvas.height*4;
          await new Promise(resolve=>setTimeout(resolve,16));
        }
        scratch.width=scratch.height=1;
        groups.push({c,tints,items:[],nextBirth:1/c.rate});
      }
      if(disposed)return;
      if(key){start=performance.now();age=0;}
      ready=true;timing.canvasReadyAt=performance.now();notify();redraw();schedule();
    }catch(cause){error=String(cause?.stack||cause);stop();notify();}
  }
  function spawn(g,birth){
    const c=g.c,angle=random()*Math.PI*2;
    // Sphere/circle projected into the existing orthographic camera. Depth sorting
    // and billboard shader details remain explicit approximation boundaries.
    const z=c.shape.type===0?random()*2-1:0;
    const planar=Math.sqrt(1-z*z),radius=c.shape.radius*(c.shape.type===0?Math.cbrt(random()):Math.sqrt(random()));
    const x=Math.cos(angle)*planar,y=Math.sin(angle)*planar;
    return {birth,life:sampleCurve(c.lifetime,0,random()),
      size:sampleCurve(c.startSize,(birth%c.duration)/c.duration,random()),
      speed:sampleCurve(c.startSpeed,0,random()),rotation:sampleCurve(c.startRotation,0,random()),
      spin:sampleCurve(c.rotation,0,random()),x:x*radius*c.emitterScale[0],y:y*radius*c.emitterScale[1],dx:x,dy:y};
  }
  function tick(now){
    frame=0;if(!key||disposed||error||document.hidden)return;
    age=(now-start)/1000;ticks++;
    for(const g of groups){
      g.items=g.items.filter(p=>age-p.birth<p.life);
      let attempts=0;
      while(g.nextBirth<=age&&attempts++<g.c.max+2){
        if(g.items.length<g.c.max){const p=spawn(g,g.nextBirth);if(age-p.birth<p.life)g.items.push(p);}
        g.nextBirth+=1/g.c.rate;
      }
      if(g.nextBirth<age)g.nextBirth=age+1/g.c.rate;
    }
    redraw();schedule();
  }
  function sync(next,reason='result-left'){
    if(next===key)return;
    stop();if(current){current.confirmAt=performance.now();current.closeReason=reason;}
    key=next;age=0;start=performance.now();random=makeRandom(0x503c2026+sequence);
    for(const g of groups){g.items=[];g.nextBirth=1/g.c.rate;}
    current=next?{runId:'p3-canvas-'+(++sequence),resultSessionStartedAt:next.started??start,
      firstCompositeDrawAt:null,firstVisibleFXPixelAt:null,firstPixelMeasurement:'NOT_MEASURED_NO_READBACK',confirmAt:null}:null;
    if(current){runs.push(current);if(runs.length>12)runs.shift();}
    notify();schedule();
  }
  function paint(ctx){
    if(!ready||!current||variant!=='motion'||error||disposed)return;
    const pixelsPerUnit=720/(2*config.camera.orthographicSize);
    ctx.save();
    try{
      for(const g of groups){
        ctx.globalCompositeOperation=g.c.blend;
        for(const p of g.items){
          const elapsed=age-p.birth,u=Math.max(0,Math.min(1,elapsed/p.life));
          const alpha=gradient(g.c.alphas,u,'a')*(g.c.startColor?.a??1);if(alpha<=0)continue;
          const size=p.size*sampleCurve(g.c.size,u)*pixelsPerUnit;
          if(!(size>0))continue;
          ctx.save();
          ctx.translate(640+(p.x+p.dx*p.speed*elapsed)*pixelsPerUnit,360-(p.y+p.dy*p.speed*elapsed)*pixelsPerUnit);
          ctx.rotate(-(p.rotation+p.spin*elapsed));ctx.globalAlpha=Math.max(0,Math.min(1,alpha));
          ctx.drawImage(g.tints[Math.max(0,Math.min(15,Math.round(u*15)))],-size/2,-size/2,size,size);ctx.restore();
        }
      }
    }finally{ctx.restore();}
    painted++;current.firstCompositeDrawAt??=performance.now();
  }
  const onVisibility=()=>{if(document.hidden)stop();else schedule();};
  document.addEventListener('visibilitychange',onVisibility);
  async function dispose(){if(disposed)return;sync(null,'dispose');disposed=true;stop();ready=false;
    document.removeEventListener('visibilitychange',onVisibility);
    for(const canvas of textures)canvas.width=canvas.height=1;
    textures.length=0;groups=[];resources.rgbaBudgetBytes=0;resources.tintCanvases=0;
  }
  window.addEventListener('pagehide',()=>{void dispose();},{once:true});
  const preparation=prepareSources();
  return Object.freeze({prepare:()=>preparation,paint,sync,endResult:reason=>sync(null,reason),snapshot,dispose,
    observeScene:({shop})=>{if(shop&&timing.shopReadyAt===null)timing.shopReadyAt=performance.now();},
    movieFinished(){},cardPainted(){},setVariant:next=>{if(!['motion','still'].includes(next))throw Error('P3_INVALID_VARIANT');variant=next;redraw();},
    readMemoryDiagnostics:()=>({backend:'P3_CANVAS2D',nativeMemory:'NOT_APPLICABLE'})});
}
