import {access,readFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import {LIBRARY_BOOKS} from '../public/library-data.js';

const PUBLIC='public';
const failures=[];
const checks=[];
const ok=(name,condition,detail='')=>{
  checks.push({name,ok:Boolean(condition),detail});
  if(!condition) failures.push(`${name}${detail?`: ${detail}`:''}`);
};
const exists=async path=>{
  try{await access(path,constants.R_OK);return true}catch{return false}
};
const read=path=>readFile(path,'utf8');
const hasTag=(html,tag)=>new RegExp(`<${tag}(?:\\s|>)`,'i').test(html);
const hasAttr=(html,name,value)=>new RegExp(`${name}=["']${value.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}["']`,'i').test(html);

// The contract intentionally verifies capabilities and document shape, not copy,
// CSS values, class names, line numbers, or a historical visual implementation.
const routeContracts={
  home:{capabilities:['/course','/bible','/topics','/practice']},
  course:{},
  bible:{capabilities:['/search']},
  topics:{},
  practice:{},
  search:{}
};
const legalFiles=['about.html','privacy.html','data-retention.html','storage.html','terms.html','safety.html'];
const durableAssets=['manifest.webmanifest','sw.js','llms.txt','data/catalog.json','data/corpus.txt','data/theology-policy.json','data/theologian-crisis-policy.json'];

const shell=await read(`${PUBLIC}/index.html`);
ok('shell has skip target',/href=["']#main["']/i.test(shell)&&/id=["']main["']/i.test(shell));
ok('shell has global search',hasTag(shell,'form')&&/role=["']search["']/i.test(shell));
ok('shell exposes primary navigation',/<nav\b[^>]*aria-label=["']Primary["']/i.test(shell));
ok('shell exposes Theologian',/id=["']guide-open["']/i.test(shell)&&/id=["']guide["']/i.test(shell));
ok('shell exposes feedback',/id=["']feedback-open["']/i.test(shell)&&/id=["']feedback-panel["']/i.test(shell));
ok('shell exposes journal',/id=["']personal-study-open["']/i.test(shell)&&/id=["']personal-study-panel["']/i.test(shell));
ok('shell exposes account and progress',/id=["']account-panel["']/i.test(shell)&&/id=["']progress-panel["']/i.test(shell));

for(const [route,contract] of Object.entries(routeContracts)){
  const path=`${PUBLIC}/${route}.html`;
  ok(`${route} route document exists`,await exists(path));
  if(!(await exists(path))) continue;
  const html=await read(path);
  ok(`${route} owns one main content region`,(html.match(/<main\b/gi)||[]).length===1);
  ok(`${route} has a page heading`,hasTag(html,'h1'));
  ok(`${route} identifies its route content`,hasAttr(html,'data-route-content',route));
  for(const href of contract.capabilities||[]){
    ok(`${route} links to ${href}`,new RegExp(`href=["']${href.replace('/','\\/')}(?:[?#["'])`,'i').test(html));
  }
}

for(const file of legalFiles) ok(`legal/policy document exists: ${file}`,await exists(`${PUBLIC}/${file}`));
for(const file of durableAssets) ok(`durable published asset exists: ${file}`,await exists(`${PUBLIC}/${file}`));

// Validate referenced executable/style assets by existence, not by exact ordering.
const assetRefs=[...shell.matchAll(/(?:href|src)=["']\/(.*?\.(?:css|js|webmanifest))["']/gi)].map(m=>m[1]);
for(const ref of new Set(assetRefs)) ok(`referenced asset exists: ${ref}`,await exists(`${PUBLIC}/${ref}`));

// Canonical Bible identity is an immutable domain contract, not a visual constraint.
ok('canonical Bible exposes 66 books',Array.isArray(LIBRARY_BOOKS)&&LIBRARY_BOOKS.length===66);
ok('canonical books have stable ids and chapter counts',LIBRARY_BOOKS.every(book=>Number.isInteger(book.n)&&book.n>0&&Number.isInteger(book.ch)&&book.ch>0&&book.name));

const catalog=JSON.parse(await read(`${PUBLIC}/data/catalog.json`));
ok('catalog exposes guided courses',Array.isArray(catalog.courses)&&catalog.courses.length>0);
ok('courses expose stable identity',Array.isArray(catalog.courses)&&catalog.courses.every(course=>course.id&&(course.title||course.shortTitle)));

const manifest=JSON.parse(await read(`${PUBLIC}/manifest.webmanifest`));
ok('PWA manifest declares identity and launch target',Boolean(manifest.name&&manifest.start_url&&manifest.display));

for(const jsonPath of ['data/theology-policy.json','data/theologian-crisis-policy.json']){
  try{const value=JSON.parse(await read(`${PUBLIC}/${jsonPath}`));ok(`${jsonPath} is valid structured policy`,value&&typeof value==='object'&&!Array.isArray(value))}
  catch(error){ok(`${jsonPath} is valid structured policy`,false,error.message)}
}

console.log(`\nCanonical Shelf durable contract: ${checks.filter(x=>x.ok).length}/${checks.length} checks passed`);
if(failures.length){
  console.error('\nContract failures:');
  for(const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('PASS — product capabilities and template contracts are intact.');
