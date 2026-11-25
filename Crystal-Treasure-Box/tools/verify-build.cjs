const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../runtime'),manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'player-build-manifest.json'),'utf8'));
const hash=file=>{const target=path.resolve(root,file);assert(target.startsWith(root+path.sep));return crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');};
assert.equal(hash(manifest.file),manifest.sha256,'Generated bundle changed');
for(const input of manifest.inputs)assert.equal(hash(input.file),input.sha256,`Rebuild required: ${input.file}`);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes(`import("./${manifest.file}")`)&&html.includes(`href="${manifest.file}"`));
console.log('PASS player bundle matches source hashes and canonical entry');
