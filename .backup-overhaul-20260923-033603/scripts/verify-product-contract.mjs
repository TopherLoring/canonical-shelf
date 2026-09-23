import {access,readFile} from 'node:fs/promises';
import {constants} from 'node:fs';
import {LIBRARY_BOOKS} from '../public/library-data.js';

const PUBLIC='public';
const results=[];
const exists=async path=>{try{await access(path,constants.R_OK);return true}catch{return false}};
const read=path=>readFile(path,'utf8');
const escapeRe=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const hasTag=(html,tag)=>new RegExp(`<${tag}(?:\\s|>)`,'i').test(html);
const hasAttr=(html,name,value)=>new RegExp(`${escapeRe(name)}=["']${escapeRe(value)}["']`,'i').test(html);
const check=async(name,fn)=>{
  try{
    const detail=await fn();
    results.push({name,ok:true,detail:typeof detail==='string'?detail:''});
  }catch(error){
    results.push({name,ok:false,detail:error?.message||String(error)});
  }
};
const requireContract=(condition,message)=>{if(!condition)throw new Error(message)};

// IMPORTANT: this verifier protects durable product/template capabilities only.
// It must not freeze copy, line numbers, styling classes, CSS values, themes,
// DOM nesting that is irrelevant to function, or a historical visual version.
const routes=['home','course','bible','topics','practice','search'];
const legalFiles=['about.html','privacy.html','data-retention.html','storage.html','terms.html','safety.html'];
const durableAssets=['manifest.webmanifest','sw.js','llms.txt','data/catalog.json','data/corpus.txt','data/theology-policy.json','data/theologian-crisis-policy.json'];

const shell=await read(`${PUBLIC}/index.html`);

await check('Application shell',async()=>{
  requireContract(/href=["']#main["']/i.test(shell)&&/id=["']main["']/i.test(shell),'skip navigation must reach main content');
  requireContract(/role=["']search["']/i.test(shell),'global search landmark is missing');
  requireContract(/<nav\b[^>]*aria-label=["']Primary["']/i.test(shell),'primary navigation landmark is missing');
  requireContract(/id=["']guide-open["']/i.test(shell)&&/id=["']guide["']/i.test(shell),'Theologian launcher/panel contract is missing');
  requireContract(/aria-controls=["']feedback-panel["']/i.test(shell)&&/id=["']feedback-panel["']/i.test(shell),'feedback launcher/panel contract is missing');
  requireContract(/aria-controls=["']personal-study-panel["']/i.test(shell)&&/id=["']personal-study-panel["']/i.test(shell),'journal launcher/panel contract is missing');
  requireContract(/id=["']account-panel["']/i.test(shell)&&/id=["']progress-panel["']/i.test(shell),'account/progress utility surfaces are missing');
  return 'search, navigation, study utilities, feedback, journal, account/progress';
});

await check('Visual contract authority',async()=>{
  const stylesheetTags=[...shell.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)].map(match=>match[0]);
  const authorities=stylesheetTags.filter(tag=>/data-visual-contract=["'][^"']+["']/i.test(tag));
  requireContract(authorities.length===1,'shell must declare exactly one visual-contract stylesheet');
  const href=authorities[0].match(/href=["']\/([^"']+)["']/i)?.[1];
  requireContract(Boolean(href),'visual-contract stylesheet must publish a local href');
  requireContract(await exists(`${PUBLIC}/${href}`),'visual-contract stylesheet target is missing');
  return 'one marked visual authority; feature styles may remain structural';
});

await check('Route-owned documents',async()=>{
  for(const route of routes){
    const path=`${PUBLIC}/${route}.html`;
    requireContract(await exists(path),`${route} route document is missing`);
    const html=await read(path);
    requireContract((html.match(/<main\b/gi)||[]).length===1,`${route} must own one main region`);
    requireContract(hasTag(html,'h1'),`${route} must expose a page heading`);
    requireContract(hasAttr(html,'data-route-content',route),`${route} must identify its generated route content`);
  }
  return routes.join(', ');
});

await check('Home exploration template',async()=>{
  const html=await read(`${PUBLIC}/home.html`);
  for(const target of ['/course','/bible','/topics','/practice']){
    requireContract(new RegExp(`href=["']${escapeRe(target)}(?:[?#["'])`,'i').test(html),`Home cannot reach ${target}`);
  }
  const bookLinks=html.match(/href=["']\/bible\?book=/gi)||[];
  requireContract(bookLinks.length===66,'Home bookshelf must expose the 66-book canon');
  return 'four primary destinations + canonical bookshelf';
});

await check('Published policy surfaces',async()=>{
  const missing=[];
  for(const file of legalFiles) if(!(await exists(`${PUBLIC}/${file}`))) missing.push(file);
  requireContract(missing.length===0,`missing: ${missing.join(', ')}`);
  return legalFiles.join(', ');
});

await check('Published runtime/data assets',async()=>{
  const missing=[];
  for(const file of durableAssets) if(!(await exists(`${PUBLIC}/${file}`))) missing.push(file);
  requireContract(missing.length===0,`missing: ${missing.join(', ')}`);
  const refs=[...shell.matchAll(/(?:href|src)=["']\/(.*?\.(?:css|js|webmanifest))["']/gi)].map(match=>match[1]);
  const unresolved=[];
  for(const ref of new Set(refs)) if(!(await exists(`${PUBLIC}/${ref}`))) unresolved.push(ref);
  requireContract(unresolved.length===0,`shell references missing assets: ${unresolved.join(', ')}`);
  return 'shell assets, PWA files, learner corpus, theology policies';
});

await check('Canonical Bible identity',async()=>{
  requireContract(Array.isArray(LIBRARY_BOOKS)&&LIBRARY_BOOKS.length===66,'canonical library must contain 66 books');
  requireContract(LIBRARY_BOOKS.every(book=>Number.isInteger(book.n)&&book.n>0&&Number.isInteger(book.ch)&&book.ch>0&&book.name),'every canonical book needs stable identity and chapter count');
  requireContract(new Set(LIBRARY_BOOKS.map(book=>book.n)).size===66,'canonical book ids must be unique');
  return '66 books with unique stable identity and chapter counts';
});

await check('Learning catalog template',async()=>{
  const catalog=JSON.parse(await read(`${PUBLIC}/data/catalog.json`));
  requireContract(Array.isArray(catalog.courses)&&catalog.courses.length>0,'catalog needs guided courses');
  requireContract(catalog.courses.every(course=>course.id&&(course.title||course.shortTitle)),'every course needs stable identity');
  requireContract(Array.isArray(catalog.activities)&&catalog.activities.length>0,'catalog needs completion-bearing activities');
  requireContract(Array.isArray(catalog.units)&&catalog.units.length>0,'catalog needs learning units');
  return 'courses, units, activities, stable identities';
});

await check('PWA template',async()=>{
  const manifest=JSON.parse(await read(`${PUBLIC}/manifest.webmanifest`));
  requireContract(Boolean(manifest.name&&manifest.start_url&&manifest.display),'manifest needs identity, launch target, and display mode');
  requireContract(await exists(`${PUBLIC}/sw.js`),'service worker is missing');
  return 'manifest + service worker';
});

await check('Theology/safety policy data',async()=>{
  for(const path of ['data/theology-policy.json','data/theologian-crisis-policy.json']){
    const value=JSON.parse(await read(`${PUBLIC}/${path}`));
    requireContract(value&&typeof value==='object'&&!Array.isArray(value),`${path} must publish structured policy data`);
  }
  return 'interpretation policy + crisis policy';
});

console.log('\nCanonical Shelf durable product contract');
for(const result of results) console.log(`${result.ok?'PASS':'FAIL'}  ${result.name}${result.detail?` — ${result.detail}`:''}`);
const failed=results.filter(result=>!result.ok);
if(failed.length){
  console.error(`\n${failed.length}/${results.length} contract groups failed.`);
  process.exit(1);
}
console.log(`\nPASS — ${results.length} durable contract groups.`);