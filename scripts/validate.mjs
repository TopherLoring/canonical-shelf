import {readFile,stat} from 'node:fs/promises';
const req=['public/index.html','public/styles.css','public/app.js','public/db.js','public/sw.js','public/manifest.webmanifest','docs/v6/README.md','docs/v6/theologian-runtime.md','src/knowledge/model.ts'];
for(const f of req)await stat(f);
const html=await readFile('public/index.html','utf8');
for(const label of ['Home','Course','Bible','Topics','Practice'])if(!html.includes(label))throw new Error(`missing primary destination: ${label}`);
const guide=await readFile('docs/v6/theologian-runtime.md','utf8');
for(const phrase of ['Statement of Faith','orientation is not inherently sinful','Ruth and Naomi','not uncontested textual fact'])if(!guide.toLowerCase().includes(phrase.toLowerCase()))throw new Error(`theologian policy missing: ${phrase}`);
const app=await readFile('public/app.js','utf8');
for(const pattern of [/innerHTML\s*=\s*location\.hash/,/innerHTML\s*=\s*params\(\)\.get/,/insertAdjacentHTML\([^,]+,\s*location\.hash/])if(pattern.test(app))throw new Error('unsafe unescaped route injection pattern');
try{
  const cat=JSON.parse(await readFile('public/data/catalog.json','utf8'));
  if(cat.units.length!==25)throw new Error(`expected 25 v6 units, got ${cat.units.length}`);
  if(cat.masteryIds.length!==69)throw new Error(`expected 69 mastery IDs, got ${cat.masteryIds.length}`);
  if(cat.lessons.length!==70)throw new Error(`expected 70 guided lessons, got ${cat.lessons.length}`);
  if(cat.topics.length!==45)throw new Error(`expected 45 Topics, got ${cat.topics.length}`);
  if(new Set(cat.masteryIds).size!==69)throw new Error('mastery IDs are not unique');
}catch(e){if(e.code==='ENOENT')throw new Error('public/data/catalog.json missing: run bun run migrate before validation');throw e}
console.log('v6 structural/content/doctrinal gates passed');
