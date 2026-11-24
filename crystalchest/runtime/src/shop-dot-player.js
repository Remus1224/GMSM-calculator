'use strict';
window.CrystalDot=(()=>{
 const sourceManifest=window.CRYSTAL_DOT_MANIFEST;
 const compactRequested=new URLSearchParams(location.search).get('shopDotBitmaps')==='1';
 const M={...sourceManifest,frames:sourceManifest.frames.map(f=>({...f,rect:[...f.rect],origin:[...f.origin],sourcePage:f.page}))},pages=[],D={enabled:true,loaded:false,elapsed:0,drawn:0,ticks:0,loopRunning:false,errors:[],lastLayers:[],lastProjection:null};
 const resources={mode:'ORIGINAL_ATLASES',status:'LOADING',originalLogicalBytes:M.pages.reduce((n,p)=>n+p.size[0]*p.size[1]*4,0),bitmapLogicalBytes:0,bitmapCount:0,sourcePageReferences:0};
 function layersAt(seconds){const frame=Math.floor(Math.max(0,seconds)*60);if(frame<106)return[{index:frame,weight:1}];const q=(frame-106)%76;if(q<15)return[{index:106+q,weight:1-q/15},{index:30+q,weight:q/15}];return[{index:30+q,weight:1}]}
 function snapshot(){return{status:'SOURCE_REUSED_NATIVE_BAKE_WEB_ADAPTATION_PLAYER_PENDING',enabled:D.enabled,loaded:D.loaded,elapsed:D.elapsed,frames:D.ticks,renderCount:D.drawn,loopRunning:D.loopRunning,layers:D.lastLayers,projection:D.lastProjection,sourceLoopEvidence:M.loop.evidence,mountEvidence:M.mount.evidence,nativeCameraClosed:false,resources:{...resources},errors:D.errors}}
 function publish(){const o=document.getElementById('dot-audit');if(o)o.textContent=JSON.stringify(snapshot())}
 // S1C-R5 projected its centered 1280x720 logical canvas into the 1124x635
 // preview with this renderer translation. Clean Rebuild uses a centered
 // 1280x720 logical canvas. Convert the complete inherited R5 host space
 // (including its clip) into Clean coordinates; do not move particle frames
 // independently of their source capture coordinates.
 const R5_HOST_PROJECTION_TRANSLATION=[-156,-85];
 function cleanProjectionDelta(ctx,scale){const width=ctx.canvas.width/scale,height=ctx.canvas.height/scale,cleanOrigin=[width/2,height/2],r5Origin=[cleanOrigin[0]+R5_HOST_PROJECTION_TRANSLATION[0],cleanOrigin[1]+R5_HOST_PROJECTION_TRANSLATION[1]];return{x:cleanOrigin[0]-r5Origin[0],y:cleanOrigin[1]-r5Origin[1],sourceOrigin:r5Origin,targetOrigin:cleanOrigin}}
 async function loadPage(p,i){const im=new Image();im.src=p.url.startsWith('/dot/')?p.url.replace('/dot/','assets/shop-dot/'):p.url;await im.decode();if(im.naturalWidth!==p.size[0]||im.naturalHeight!==p.size[1])throw Error('Dot atlas size mismatch '+i);return im}
 async function prepare(){
  if(!compactRequested||typeof createImageBitmap!=='function'){
   await Promise.all(M.pages.map(async(p,i)=>{pages[i]=await loadPage(p,i)}));
   resources.sourcePageReferences=pages.length;return;
  }
  resources.mode='CLIPPED_FRAME_BITMAPS';
  const [clipX,clipY,clipW,clipH]=M.mount.clip,[dx,dy]=M.mount.researchToR5Translation;
  // Integer source intersection with the unchanged logical clipping rectangle.
  for(let i=0;i<M.pages.length;i++){
   const im=await loadPage(M.pages[i],i);
   for(const f of M.frames.filter(f=>f.sourcePage===i)){
    const [sx,sy,w,h]=f.rect,[ox,oy]=f.origin;
    const left=Math.max(0,clipX-dx-ox),top=Math.max(0,clipY-dy-oy);
    const right=Math.min(w,clipX+clipW-dx-ox),bottom=Math.min(h,clipY+clipH-dy-oy);
    if(right<=left||bottom<=top){f.empty=true;continue;}
    const bitmap=await createImageBitmap(im,sx+left,sy+top,right-left,bottom-top);
    f.page=pages.length;pages.push(bitmap);f.rect=[0,0,right-left,bottom-top];f.origin=[ox+left,oy+top];
    resources.bitmapCount++;resources.bitmapLogicalBytes+=bitmap.width*bitmap.height*4;
    await new Promise(resolve=>setTimeout(resolve,16));
   }
   // No retained reference to the decoded source page in this mode.
   im.src='';
  }
 }
 const ready=prepare().then(()=>{D.loaded=true;resources.status='READY';publish();return true}).catch(e=>{D.errors.push(String(e));D.enabled=false;resources.status='FAILED';for(const p of pages)p?.close?.();pages.length=0;publish();return false});
 function draw(ctx,scale=1){if(!D.loaded||!D.enabled){D.lastLayers=[];publish();return}ctx.save();ctx.setTransform(scale,0,0,scale,0,0);const p=cleanProjectionDelta(ctx,scale);ctx.translate(p.x,p.y);ctx.beginPath();ctx.rect(...M.mount.clip);ctx.clip();ctx.globalCompositeOperation='lighter';ctx.imageSmoothingEnabled=false;const layers=layersAt(D.elapsed);for(const l of layers){if(!l.weight)continue;const f=M.frames[l.index];if(f.empty)continue;ctx.globalAlpha=l.weight;ctx.drawImage(pages[f.page],...f.rect,f.origin[0]+M.mount.researchToR5Translation[0],f.origin[1]+M.mount.researchToR5Translation[1],f.rect[2],f.rect[3])}ctx.restore();D.lastLayers=layers;D.lastProjection={from:'S1C-R5 projected logical canvas',to:'Clean 1280x720 logical canvas',logicalTranslation:[p.x,p.y],sourceCanvasOrigin:p.sourceOrigin,targetCanvasOrigin:p.targetOrigin,evidence:'S1C shop-renderer.js translation -156,-85; Clean applyTransform centered at fixture.width/2, fixture.height/2'};D.drawn++;publish()}
 return{ready,draw,layersAt,snapshot,get active(){return D.enabled&&D.loaded},advance(dt){if(D.enabled&&D.loaded){D.elapsed+=Math.max(0,dt);D.ticks++}},setLoopRunning(v){D.loopRunning=v;publish()},setEnabled(v){D.enabled=v;publish()},restart(){D.elapsed=0;D.ticks=0;publish()}};
})();
