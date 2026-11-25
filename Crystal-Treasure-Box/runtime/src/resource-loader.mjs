import staticAtlas from './static-atlas-manifest.mjs';
export async function measureStartup(name,action,source=''){const p=globalThis.__ccStartupProfile,start=p?.now();try{return await action();}finally{p?.end('ASYNC_WALL',name,start,source);}}
// GET/image preparation only. No sampler or game-state mutation on retry.
export function createResourceLoader({ concurrency=4, retries=2,
  fetchImpl=(...args)=>globalThis.fetch(...args), ImageClass=globalThis.Image,
  delay=ms=>new Promise(resolve=>setTimeout(resolve,ms)), baseURL=globalThis.document?.baseURI }={}) {
  let active=0,atlasReady=null;
  const atlasSprites=new Map();
  const pending=[], images=new Map();
  const stats={queued:0,active:0,peak:0,fetchAttempts:0,imageAttempts:0,retries:0,failures:0};
  function pump(){
    while(active<concurrency&&pending.length){
      const {job,resolve,reject}=pending.shift();active++;stats.active=active;stats.peak=Math.max(stats.peak,active);
      Promise.resolve().then(job).then(resolve,reject).finally(()=>{active--;stats.active=active;pump();});
    }
  }
  function enqueue(job){stats.queued++;return new Promise((resolve,reject)=>{pending.push({job,resolve,reject});pump();});}
  function retryWait(attempt,response){
    const value=response?.headers?.get('Retry-After');
    const parsed=value===null||value===undefined?NaN:(/^\d+(?:\.\d+)?$/.test(value)?Number(value)*1000:Date.parse(value)-Date.now());
    return Number.isFinite(parsed)?Math.max(0,parsed):300*2**attempt;
  }
  function fetchResource(input,options={}){
    return enqueue(async()=>{
      const method=String(options.method||'GET').toUpperCase();
      for(let attempt=0;;attempt++){
        let response;
        try{stats.fetchAttempts++;response=await measureStartup('fetch.headers',()=>fetchImpl(input,options),input);}
        catch(error){
          if(error?.name==='AbortError'||method!=='GET'||attempt>=retries){stats.failures++;throw error;}
          stats.retries++;await delay(retryWait(attempt));continue;
        }
        const retryable=[408,429,500,502,503,504].includes(response.status);
        if(!retryable||method!=='GET'||attempt>=retries){if(!response.ok)stats.failures++;return response;}
        const wait=retryWait(attempt,response);
        // Do not retry sooner than a server asks; long waits surface to recovery UI.
        if(wait>30000){stats.failures++;return response;}
        await response.body?.cancel?.();stats.retries++;await delay(wait);
      }
    });
  }
  function loadNativeImage(path){
    const url=new URL(path,baseURL).href;
    if(images.has(url))return images.get(url);
    const promise=enqueue(async()=>{
      for(let attempt=0;;attempt++){
        try{
          stats.imageAttempts++;const image=new ImageClass();image.decoding='async';image.src=url;await measureStartup('image.fetch-and-decode',()=>image.decode(),url);return image;
        }catch(error){
          if(attempt>=retries){stats.failures++;throw error;}
          stats.retries++;await delay(retryWait(attempt));
        }
      }
    });
    images.set(url,promise);promise.catch(()=>{if(images.get(url)===promise)images.delete(url);});return promise;
  }
  function prepareAtlas(){
    if(atlasReady)return atlasReady;
    atlasReady=(async()=>{
      for(const page of staticAtlas.pages){
        const pageUrl=new URL(page.file,baseURL).href;
        const image=await loadNativeImage(pageUrl);
        const pageSprites=new Map();
        try{
          for(const [path,entry] of Object.entries(staticAtlas.entries)){
            if(entry.page!==page.file)continue;
            const key=[entry.x,entry.y,entry.width,entry.height].join(':');
            let bitmap=pageSprites.get(key);
            if(!bitmap){
              bitmap=await measureStartup('static-atlas.crop',()=>createImageBitmap(image,entry.x,entry.y,entry.width,entry.height),page.file);
              Object.assign(bitmap,{naturalWidth:entry.width,naturalHeight:entry.height,src:'atlas:'+page.file+':'+key});
              pageSprites.set(key,bitmap);
            }
            atlasSprites.set(new URL(path,baseURL).href,bitmap);
          }
        }finally{
          // Crops own their pixels. Do not retain decoded atlas pages as well.
          images.delete(pageUrl);image.src='';
        }
      }
    })().catch(error=>{for(const bitmap of new Set(atlasSprites.values()))bitmap.close();atlasSprites.clear();atlasReady=null;throw error;});
    return atlasReady;
  }
  function loadImage(path){
    const url=new URL(path,baseURL).href;
    const root=new URL('./',baseURL).href;
    const relative=url.startsWith(root)?url.slice(root.length):null;
    if(relative&&staticAtlas.entries[relative])return prepareAtlas().then(()=>atlasSprites.get(url));
    return loadNativeImage(path);
  }
  return {fetchResource,loadImage,snapshot:()=>({...stats,pending:pending.length,cachedImages:images.size,atlasMappedPaths:atlasSprites.size,atlasUniqueBitmaps:new Set(atlasSprites.values()).size})};
}
const loader=createResourceLoader();
export const fetchResource=loader.fetchResource;
export const loadImage=loader.loadImage;
export const resourceSnapshot=loader.snapshot;
// Keep the DOM's original <img> scaling path. Blob URLs are local, not downloads.
const domUrls=new WeakMap();
export async function loadDOMImageURL(path){
  const source=await loadImage(path);
  if(!domUrls.has(source))domUrls.set(source,(async()=>{
    const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
    canvas.getContext('2d').drawImage(source,0,0);
    const blob=await measureStartup('pool.local-png-encode',()=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('ATLAS_DOM_PNG_REQUIRED')),'image/png')));
    return URL.createObjectURL(blob);
  })());
  return domUrls.get(source);
}
