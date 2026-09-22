import {readFile,stat} from 'node:fs/promises';

const manifest=JSON.parse(await readFile('content/learner-content-reachability.json','utf8'));
if(manifest.version!==1||!Array.isArray(manifest.entries)||!manifest.entries.length)throw new Error('learner content reachability manifest is missing or invalid');

const ids=new Set();
for(const entry of manifest.entries){
  if(!entry.id||ids.has(entry.id))throw new Error(`invalid or duplicate reachability id: ${entry.id||'(missing)'}`);
  ids.add(entry.id);
  for(const required of ['source','mode','surface','entry','host'])if(!entry[required])throw new Error(`${entry.id} is missing ${required}`);
  await stat(entry.source);
  await stat(entry.host);
  if(entry.published)await stat(entry.published);
  if(entry.mode==='direct'&&entry.entry.startsWith('/')){
    const root=entry.entry.split(/[?#]/)[0].replace(/^\//,'');
    if(['home','course','bible','topics','practice','search'].includes(root))await stat(`public/${root}.html`);
    if(root==='about.html')await stat('public/about.html');
  }
}

for(const required of ['orientation','curriculum','scripture','bible-library','topics','glossary','practice','curated-passages','appearance-themes','about-disclosures','statement-of-faith','theology-policy','theology-sources','supplemental-belief-context']){
  if(!ids.has(required))throw new Error(`learner content reachability contract missing ${required}`);
}

const compact=(await readFile('content/statement/statement-of-faith-compact.md','utf8')).trim();
const longForm=(await readFile('content/statement/statement-of-faith-v3.md','utf8')).trim();
if(compact.length>=longForm.length)throw new Error('public Statement of Faith must remain the compact document, not the long-form belief context');
if(!/you are not asked to agree/i.test(compact))throw new Error('compact Statement of Faith must explicitly state that agreement is not required');
if(!/doctrinal ceiling/i.test(compact))throw new Error('compact Statement of Faith must define its doctrinal-ceiling role');

const about=await readFile('public/about.html','utf8');
const aboutScript=await readFile('public/about-page.js','utf8');
if(!/You are not asked to agree with this statement to use Canonical Shelf/i.test(about))throw new Error('About faith disclosure lost the agreement-not-required statement');
if(!aboutScript.includes("fetch('/data/statement-of-faith.md')"))throw new Error('About must load the compact published Statement of Faith');
if(aboutScript.includes('theologian-belief-context'))throw new Error('About must not render the supplemental long-form Theologian belief context');

const publisher=await readFile('scripts/publish-theology.mjs','utf8');
for(const mapping of ['statement-of-faith-compact.md','public/data/statement-of-faith.md','statement-of-faith-v3.md','public/data/theologian-belief-context.md'])if(!publisher.includes(mapping))throw new Error(`theology publisher missing ${mapping}`);

const worker=await readFile('worker/theologian-ai.ts','utf8');
for(const invariant of ['/data/statement-of-faith.md','/data/theologian-belief-context.md','doctrinal ceiling','supplemental only'])if(!worker.toLowerCase().includes(invariant.toLowerCase()))throw new Error(`Theologian authority wiring missing ${invariant}`);

const cloudClient=await readFile('public/theologian-cloud.js','utf8');
for(const invariant of ['const conversation=[]','Current question:','conversationMode'])if(!cloudClient.includes(invariant))throw new Error(`session-only Theologian conversation wiring missing ${invariant}`);
for(const forbidden of ['localStorage','sessionStorage','indexedDB'])if(cloudClient.includes(forbidden))throw new Error(`Theologian conversation must not persist through ${forbidden}`);

console.log(`learner content reachability + compact faith ceiling + supplemental belief context + session-only Theologian conversation gates passed (${manifest.entries.length} content families)`);
