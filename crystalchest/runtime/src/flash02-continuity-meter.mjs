// Engineering-only bounded GPU readbacks: separate a source cycle from adapter Clear.
export function createContinuityMeter(){
  let current=null,previous=null;const runs=[];
  const ages=[.35,1,2,2.8,3.2,4,5,5.8,6.2,7,8,9,10];
  function start(meta){current={...meta,rows:[],ended:null};runs.push(current);if(runs.length>6)runs.shift();previous=null;}
  function sample(surface,background,at){
    if(!current||current.ended||current.rows.length>=ages.length)return;
    const age=(at-current.startedAt)/1000;if(age<ages[current.rows.length])return;
    const gl=surface.getContext('webgl2')||surface.getContext('webgl');if(!gl)return;
    const raw=new Uint8Array(1280*720*4);gl.readPixels(0,0,1280,720,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    let changed=0,outer=0,white=0,motion=0,minX=1280,minY=720,maxX=-1,maxY=-1,coreMinX=1280,coreMinY=720,coreMaxX=-1,coreMaxY=-1;
    const cx=640+current.settings.offsetX,cy=360+current.settings.offsetY;
    for(let y=0;y<720;y++)for(let x=0;x<1280;x++){
      const a=((719-y)*1280+x)*4,b=(y*1280+x)*4;
      const d=Math.max(Math.abs(raw[a]-background[b]),Math.abs(raw[a+1]-background[b+1]),Math.abs(raw[a+2]-background[b+2]));
      if(previous&&Math.max(Math.abs(raw[a]-previous[a]),Math.abs(raw[a+1]-previous[a+1]),Math.abs(raw[a+2]-previous[a+2]))>1)motion++;
      if(d>1){changed++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);if((x-cx)**2+(y-cy)**2>200**2)outer++;}
      if(d>1&&Math.abs(x-cx)<180&&Math.abs(y-cy)<180&&raw[a]>=230&&raw[a+1]>=230&&raw[a+2]>=230){white++;coreMinX=Math.min(coreMinX,x);coreMaxX=Math.max(coreMaxX,x);coreMinY=Math.min(coreMinY,y);coreMaxY=Math.max(coreMaxY,y);}
    }
    current.rows.push({ageSeconds:age,at,changedPixels:changed,outerRadius200Pixels:outer,whiteCorePixels:white,bounds:changed?[minX,minY,maxX-minX+1,maxY-minY+1]:null,whiteCoreBounds:white?[coreMinX,coreMinY,coreMaxX-coreMinX+1,coreMaxY-coreMinY+1]:null,motionSincePrevious:previous?motion:null});previous=raw;return true;
  }
  function end(reason){if(current&&!current.ended)current.ended={reason,at:performance.now(),ageSeconds:(performance.now()-current.startedAt)/1000};previous=null;}
  return Object.freeze({start,sample,end,snapshot:()=>runs});
}
