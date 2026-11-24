import {fetchResource as fetch,loadImage} from './resource-loader.mjs';
// VISUAL_APPROXIMATION_NOT_NATIVE_EQUIVALENT. No Unity import, factory, Native ACK or readback.
export function hermite(keys,t){
 if(!keys?.length)return 1;if(t<=keys[0].time)return keys[0].value;
 for(let i=1;i<keys.length;i++){const b=keys[i],a=keys[i-1];if(t>b.time)continue;const d=b.time-a.time;if(d<=0)return b.value;const u=(t-a.time)/d;return (2*u*u*u-3*u*u+1)*a.value+(u*u*u-2*u*u+u)*d*a.outSlope+(-2*u*u*u+3*u*u)*b.value+(u*u*u-u*u)*d*b.inSlope;}
 return keys.at(-1).value;
}
export function sampleCurve(c,t,r=.5){if(c.mode===0)return c.scalar;if(c.mode===3)return c.minScalar+(c.scalar-c.minScalar)*r;return c.scalar*hermite(c.keys,t);}
export function gradient(keys,t,key){if(t<=keys[0].t)return keys[0][key];for(let i=1;i<keys.length;i++){const b=keys[i],a=keys[i-1];if(t>b.t)continue;const u=(t-a.t)/(b.t-a.t||1);return a[key]+u*(b[key]-a[key]);}return keys.at(-1)[key];}
export function makeRandom(seed=0x44a801){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function createTenTimeMotionFixture({redraw,appSnapshot}){
 let configs=[],groups=[],run=null,start=0,raf=0,ready=false,disposed=false,error=null,random=makeRandom(),age=0,painted=0,ticks=0,loaded=0,released=false;
 const textureCanvases=[];const fixedSeed=0x44a801;
 const receipt=()=>({backend:'CANVAS2D_APPROXIMATION',classification:'VISUAL_APPROXIMATION_NOT_NATIVE_EQUIVALENT',ready,error,run,age,active:Boolean(run),paintedFrames:painted,animationTicks:ticks,textureCount:loaded,particles:groups.map(g=>({name:g.c.name,count:g.items.length,max:g.c.max})),p8UnityInstanceCreated:false,p8WebGLContextCreated:false,p8NativeAck:'NOT_APPLICABLE',nativeFrame:'NOT_APPLICABLE',rgbGate:'NOT_APPLICABLE_NOT_STRICT0',fixedPreviewSeed:fixedSeed,tintBins:16,backdrop:'CURRENT_R21_STAGE_BACKGROUND',resources:{tintCanvases:textureCanvases.length,rgbaBudgetBytes:16*(128*128+256*256+128*128)*4,released},app:appSnapshot()});
 async function prepare(){try{
  const response=await fetch(new URL('./r44-p1-particle-config.json',import.meta.url));if(!response.ok)throw Error('PARTICLE_CONFIG_REQUIRED');configs=await response.json();if(disposed)return;
  for(const c of configs){
   const image=await loadImage(new URL(c.texture,import.meta.url).href);if(disposed)return;loaded++;
   const scratch=document.createElement('canvas');scratch.width=image.naturalWidth;scratch.height=image.naturalHeight;const ctx=scratch.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,scratch.width,scratch.height); // small original texture only, once
   const tints=[];
   for(let bin=0;bin<16;bin++){const t=bin/15,canvas=document.createElement('canvas');canvas.width=scratch.width;canvas.height=scratch.height;const cc=canvas.getContext('2d');const data=new ImageData(new Uint8ClampedArray(pixels.data),canvas.width,canvas.height);
    const rgb=['r','g','b'].map(k=>gradient(c.colors,t,k));for(let p=0;p<data.data.length;p+=4)for(let k=0;k<3;k++)data.data[p+k]=Math.round(data.data[p+k]*rgb[k]);cc.putImageData(data,0,0);tints.push(canvas);textureCanvases.push(canvas);
   }scratch.width=scratch.height=1;
   if(disposed){for(const canvas of tints)canvas.width=canvas.height=1;return;}
   groups.push({c,tints,items:[],nextBirth:0});
  }
  ready=true;redraw();if(run)startAnimation();
 }catch(e){error=String(e);stopAnimation();redraw();}}
 function stopAnimation(){if(raf)cancelAnimationFrame(raf);raf=0;}
 function spawn(g,birth){const c=g.c;const angle=random()*Math.PI*2;const radius=c.shape.enabled?Math.sqrt(random())*c.shape.radius*2:0;const life=sampleCurve(c.lifetime,0,random());const size=sampleCurve(c.startSize,(birth%c.duration)/c.duration,random())*720;
  return {birth,life,size,angle,radius,spin:c.rotation?sampleCurve(c.rotation,0,random()):0};
 }
 function tick(now){raf=0;if(!run||disposed||error||document.hidden)return;age=(now-start)/1000;ticks++;
  for(const g of groups){g.items=g.items.filter(p=>age-p.birth<p.life);const interval=1/g.c.rate;let safety=0;
   while(g.nextBirth<=age&&safety++<g.c.max+1){if(g.items.length<g.c.max){const p=spawn(g,g.nextBirth);if(age-p.birth<p.life)g.items.push(p);}g.nextBirth+=interval;}
   if(g.nextBirth<age)g.nextBirth=age+interval;
  }redraw();raf=requestAnimationFrame(tick);
 }
 function startAnimation(){if(ready&&run&&!raf&&!document.hidden&&!disposed&&!error)raf=requestAnimationFrame(tick);}
 function sync(next){if(next===run)return;stopAnimation();run=next;age=0;start=performance.now();random=makeRandom(fixedSeed);for(const g of groups){g.items=[];g.nextBirth=0;}if(run)startAnimation();}
 function paint(ctx){if(!run||!ready||error||disposed)return;
  ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='lighter';
  // Ordering is a documented approximation of source renderer priorities, not GPU fragment parity.
  for(const g of [...groups].sort((a,b)=>a.c.name==='glow_m002'?1:b.c.name==='glow_m002'?-1:0))for(const p of g.items){
   const elapsed=Math.max(0,age-p.birth),u=Math.min(1,elapsed/p.life),c=g.c,glow=c.name==='glow_m002';const alpha=gradient(c.alphas,u,'a')*(glow?.70:1);if(alpha<=0)continue;
   const size=p.size*sampleCurve(c.size,u);const distance=p.radius+(glow?0:c.speed*720*elapsed);const x=640+Math.cos(p.angle)*distance,y=360+Math.sin(p.angle)*distance;const img=g.tints[Math.min(15,Math.max(0,Math.round(u*15)))];
   ctx.save();ctx.translate(x,y);ctx.rotate(glow?0:p.angle+Math.PI/2+p.spin*elapsed);ctx.globalAlpha=Math.min(1,Math.max(0,alpha));
   const width=size,height=c.name==='bomb_p001'?size+c.speed*720*.5:size;ctx.drawImage(img,-width/2,-height/2,width,height);ctx.restore();
  }ctx.restore();painted++;
 }
 const onVisibility=()=>{if(document.hidden)stopAnimation();else startAnimation();};document.addEventListener('visibilitychange',onVisibility);
 async function dispose(){if(disposed)return;sync(null);disposed=true;ready=false;document.removeEventListener('visibilitychange',onVisibility);for(const canvas of textureCanvases)canvas.width=canvas.height=1;textureCanvases.length=0;groups=[];configs=[];released=true;}
 window.addEventListener('pagehide',()=>{void dispose();},{once:true});const preparation=prepare();
 return Object.freeze({sync,paint,snapshot:receipt,ensurePrepared:()=>preparation,observeStage(){},readMemoryDiagnostics:()=>({backend:'CANVAS2D_APPROXIMATION',nativeMemory:'NOT_APPLICABLE'}),dispose});
}
