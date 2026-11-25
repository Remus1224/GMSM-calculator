// Build-only tool. Browser keeps using the single shared source resource loader.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const esbuild=require(process.env.CTB_ESBUILD_API||'esbuild');
const root=path.resolve(__dirname,'..'),runtime=path.join(root,'runtime'),src=path.join(runtime,'src');
(async()=>{
 const result=await esbuild.build({absWorkingDir:runtime,entryPoints:['src/app.js'],outfile:'src/player.bundle.mjs',bundle:true,format:'esm',platform:'browser',target:['safari18'],write:false,metafile:true,minifyWhitespace:true,minifyIdentifiers:false,minifySyntax:false,keepNames:true,plugins:[{name:'shared-resource-loader',setup(build){build.onResolve({filter:/resource-loader\.mjs(?:\?|$)/},args=>({path:args.path,external:true}));}}]});
 const bytes=result.outputFiles[0].contents,hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16),name=`player-${hash}.bundle.mjs`;
 fs.writeFileSync(path.join(src,name),bytes);
 const entry=path.join(runtime,'index.html');let html=fs.readFileSync(entry,'utf8');
 html=html.replace(/<link rel="modulepreload" data-player-bundle[^>]*>/g,'');
 html=html.replace('</head>',`<link rel="modulepreload" data-player-bundle href="src/${name}" crossorigin="anonymous"></head>`);
 html=html.replace(/import\("\.\/src\/(?:app\.js[^"\n]*|player-[a-f0-9]+\.bundle\.mjs)"\)/,`import("./src/${name}")`);
 if(!html.includes(`import("./src/${name}")`))throw Error('PLAYER_ENTRY_NOT_UPDATED');
 fs.writeFileSync(entry,html);
 const inputs=[...new Set(Object.keys(result.metafile.inputs).map(file=>file.split('?')[0]))].map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(runtime,file))).digest('hex')}));
 fs.writeFileSync(path.join(__dirname,'player-build-manifest.json'),JSON.stringify({esbuild:esbuild.version,file:'src/'+name,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),inputs},null,2)+'\n');
 // Remove only obsolete generated bundles in this exact src directory.
 for(const old of fs.readdirSync(src))if(/^player-[a-f0-9]+\.bundle\.mjs$/.test(old)&&old!==name)fs.unlinkSync(path.join(src,old));
 console.log(JSON.stringify({file:name,bytes:bytes.length,inputs:Object.keys(result.metafile.inputs),external:result.metafile.outputs['src/player.bundle.mjs'].imports}));
})().catch(error=>{console.error(error);process.exitCode=1});
