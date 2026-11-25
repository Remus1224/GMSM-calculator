import {fetchResource,measureStartup} from './resource-loader.mjs?startupProbe=1';
import {sha256Digest} from './sha256-http-compat.mjs';
// Scoped CacheStorage entries contain complete, verified responses; media uses Blob URLs.
export function createMovieCache(movies,{onProgress=()=>{}}={}) {
  const entries=Object.values(movies),urls=new Map();let preparation=null,cache=null;
  const stats={status:'IDLE',total:entries.length,prepared:0,persistentAvailable:false,storageError:null,networkLoads:0,persistentHits:0,corruptEntries:0,bytes:0,items:[]};
  const keyFor=e=>{const u=new URL(e.file,document.baseURI);u.searchParams.set('ctbMovieSha',e.sha256);return u.href;};
  async function verified(response,entry){
    if(!response?.ok||response.status!==200)throw Error('MOVIE_HTTP_'+response?.status);
    const bytes=await response.arrayBuffer();const hash=Array.from(new Uint8Array(await sha256Digest(bytes)),b=>b.toString(16).padStart(2,'0')).join('');
    if(hash!==entry.sha256.toLowerCase())throw Error('MOVIE_SHA_MISMATCH:'+entry.file);return bytes;
  }
  async function prepare(){
    stats.status='PREPARING';
    try{if(globalThis.isSecureContext&&globalThis.caches){cache=await caches.open('crystal-treasure-box-movies-v1');stats.persistentAvailable=true;}}
    catch(error){stats.storageError=String(error);}
    try{
      for(const entry of entries){
        const key=keyFor(entry);let bytes=null,source='network',repair=false;
        if(cache)try{const saved=await cache.match(key);if(saved){try{bytes=await verified(saved,entry);source='persistent-cache';stats.persistentHits++;}catch(error){stats.corruptEntries++;repair=true;await cache.delete(key);}}}catch(error){stats.storageError=String(error);}
        if(!bytes){
          const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),30000);
          try{stats.networkLoads++;bytes=await verified(await fetchResource(entry.file,{signal:abort.signal,cache:repair?'reload':'default'}),entry);}finally{clearTimeout(timer);}
          if(cache)try{await cache.put(key,new Response(bytes,{headers:{'Content-Type':'video/mp4'}}));}catch(error){stats.storageError=String(error);}
        }
        urls.set(entry.file,URL.createObjectURL(new Blob([bytes],{type:'video/mp4'})));
        stats.bytes+=bytes.byteLength;stats.prepared++;stats.items.push({file:entry.file,source,bytes:bytes.byteLength});onProgress(stats.prepared,stats.total);
      }
      if(cache)try{const valid=new Set(entries.map(keyFor)),prefix=new URL('assets/movies/',document.baseURI).href;for(const request of await cache.keys())if(request.url.startsWith(prefix)&&!valid.has(request.url))await cache.delete(request);}catch(error){stats.storageError=String(error);}
      stats.status='READY';return true;
    }catch(error){stats.status='FAILED';stats.error=String(error);throw error;}
  }
  const release=()=>{for(const url of urls.values())URL.revokeObjectURL(url);urls.clear();};
  addEventListener('pagehide',e=>{if(!e.persisted)release();});
  return {prepare:()=>preparation??=measureStartup('movies.prepare',prepare),getURL:file=>{const url=urls.get(file);if(!url)throw Error('MOVIE_NOT_PREPARED:'+file);return url;},sourceForURL:url=>[...urls].find(([,local])=>local===url)?.[0]||null,snapshot:()=>({...stats,items:stats.items.map(e=>({...e}))})};
}
