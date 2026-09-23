import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';

const read=file=>readFile(file,'utf8');
const requireText=(source,text,message)=>{if(!source.includes(text))throw new Error(message||`missing required marker: ${text}`)};
const forbid=(source,text,message)=>{if(source.includes(text))throw new Error(message||`forbidden marker: ${text}`)};

async function filesUnder(dir){
  const entries=await readdir(dir,{withFileTypes:true});
  const result=[];
  for(const entry of entries){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())result.push(...await filesUnder(file));
    else result.push(file);
  }
  return result;
}

const routeNames=['home','course','bible','topics','practice','search'];
const [index,bootstrap,app,home,course,learning,bible,topics,practice,search,cloud,sw,contract,studyControls,manifest,icon,...routeDocuments]=await Promise.all([
  read('public/index.html'),read('public/bootstrap.js'),read('public/app.js'),read('public/progress-experience.js'),read('public/course-experience.js'),read('public/learning.js'),read('public/bible.js'),read('public/topics-experience.js'),read('public/practice-experience.js'),read('public/search-experience.js'),read('public/theologian-cloud.js'),read('public/sw.js'),read('public/canonical-shelf.css'),read('public/study-controls.js'),read('public/manifest.webmanifest'),read('public/icon.svg'),
  ...routeNames.map(route=>read(`public/${route}.html`))
]);

requireText(index,'/canonical-shelf.css','canonical visual contract must be a native shell asset');
requireText(index,'content="#24272d"','shared browser chrome must use the approved graphite theme color');
requireText(index,'id="guide-title">Theologian','Theologian must be named in the delivered shell');
requireText(index,'Ask the Theologian a study question','Theologian form must exist natively in the shell');
forbid(index,'/tokens.css','obsolete token hierarchy must not remain a loaded visual authority');
forbid(index,'library-system-refinements.css','obsolete CSS refinement layer must not be loaded');
forbid(bootstrap,'library-system.js','generic DOM repair runtime must not be loaded');
forbid(sw,'library-system-refinements.css','offline shell must not cache obsolete refinement layer');
forbid(sw,'library-system.js','offline shell must not cache obsolete DOM repair runtime');
requireText(sw,'v7-native-rendering-2026-09-22','service-worker cache must be bumped for native-rendering release');
requireText(sw,'/canonical-shelf.css','offline shell must cache the canonical visual contract');

for(const marker of ['"background_color":"#f3f3f0"','"theme_color":"#24272d"','"start_url":"/home"'])requireText(manifest,marker,`PWA manifest missing current Library First identity: ${marker}`);
for(const marker of ['fill="#24272d"','fill="#fffefb"'])requireText(icon,marker,`PWA icon missing current Library First palette: ${marker}`);
for(const stale of ['#c8ff35','#f6f1e8'])forbid(icon,stale,`PWA icon retains superseded palette value ${stale}`);

for(const [route,document] of routeNames.map((route,index)=>[route,routeDocuments[index]])){
  requireText(document,`data-route-document="${route}"`,`${route} must ship a route-owned document root`);
  requireText(document,`data-route-content="${route}"`,`${route} must ship a bounded enhancement region`);
  requireText(document,'<h1',`${route} route document must expose a meaningful heading before JavaScript enhancement`);
  requireText(document,'content="#24272d"',`${route} route document must inherit shared graphite browser chrome`);
  requireText(document,'/canonical-shelf.css',`${route} route document must load the canonical visual contract`);
  requireText(sw,`/${route}.html`,`${route} route document must be available offline`);
}

for(const marker of ['const routeFromPath=','const documentRoute=','const sameRouteNavigation=','location.assign(targetPath)','sameRouteNavigation(targetRoute)'])requireText(app,marker,`top-level native document navigation contract missing: ${marker}`);
forbid(app,"e.preventDefault();navigate(u.pathname+u.search+u.hash);return}}","cross-destination links must not be unconditionally converted to SPA navigation");

for(const [source,label] of [[home,'Home'],[course,'Course'],[learning,'Study Focus'],[bible,'Bible'],[topics,'Topics'],[practice,'Practice'],[search,'Search'],[app,'App'],[cloud,'Cloud Theologian'],[studyControls,'Study controls']])forbid(source,'MutationObserver',`${label} must not use MutationObserver rendering/repair`);
const jsFiles=(await filesUnder('public')).filter(file=>file.endsWith('.js'));
for(const file of jsFiles){const source=await read(file);forbid(source,'new MutationObserver',`production runtime must not instantiate MutationObserver: ${file}`)}

for(const marker of ['library-first-home','library-first-homehead','library-first-shelf-row','Old Testament','New Testament','library-first-bookend','Browse books','Ask a question','Learn in sequence','Retain what matters'])requireText(home,marker,`Home must own locked shelf-first marker: ${marker}`);
for(const marker of ['course-volume-landing','course-volume-shelf','course-volume__title','course-catalog-detail','Current','Next','Later'])requireText(course,marker,`Course renderer must own locked volume marker: ${marker}`);
for(const marker of ['Session Notes','data-journal-open','data-feedback-open','data-complete=','Theologian','current study activity'])requireText(learning,marker,`Study Focus must own learner-facing marker: ${marker}`);
for(const marker of ['bible-reader-shell','bible-reader-shelves','bible-address-tools','Book Notes','library-reader-layout','library-reader-panel','data-selected','nearby verses'])requireText(bible,marker,`Bible renderer must own reader-first marker: ${marker}`);
for(const marker of ['topics-dossier','topics-dossier__questions','Topic Notes','topic-reference-layout','topic-context-panel','Ask the Theologian'])requireText(topics,marker,`Topics renderer must own dossier marker: ${marker}`);
for(const marker of ['practice-dashboard','practice-dashboard__grid','practice-review-list','Due now','Free practice'])requireText(practice,marker,`Practice renderer must own dashboard marker: ${marker}`);
for(const marker of ['requestCloudTheologian','/api/theologian'])requireText(cloud,marker,`Cloud Theologian client missing direct marker: ${marker}`);
for(const legacy of ['Ask the Guide','How the Guide is reasoning','The Guide withheld'])forbid(app+learning+topics+search+cloud,legacy,`learner-facing legacy Guide language remains: ${legacy}`);

for(const marker of ['--home-bg:#252a30','library-first-homehead','course-volume-shelf','study-layout','bible-reader-shell','topics-dossier','practice-dashboard','.guide-open'])requireText(contract,marker,`canonical visual contract missing locked grammar: ${marker}`);
for(const protectedColor of ['--canon-law:#274c8e','--canon-history-ot:#8b5e34','--canon-wisdom:#2c7a6b','--canon-gospel:#b7362c','--canon-apocalypse:#26292f'])requireText(contract,protectedColor,`canonical category semantic missing: ${protectedColor}`);

console.log(`native document-first rendering gate passed: ${routeNames.length} route documents + ${jsFiles.length} production JS files checked; locked destination renderers are native; canonical visual contract is loaded once; DOM repair layers absent`);
