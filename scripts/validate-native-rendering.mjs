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
const [index,bootstrap,app,home,course,learning,bible,topics,search,cloud,sw,libraryCss,studyControls,...routeDocuments]=await Promise.all([
  read('public/index.html'),read('public/bootstrap.js'),read('public/app.js'),read('public/progress-experience.js'),read('public/course-experience.js'),read('public/learning.js'),read('public/bible.js'),read('public/topics-experience.js'),read('public/search-experience.js'),read('public/theologian-cloud.js'),read('public/sw.js'),read('public/library-system.css'),read('public/study-controls.js'),
  ...routeNames.map(route=>read(`public/${route}.html`))
]);

requireText(index,'/home-experience.css','Home Library First stylesheet must be a native shell asset');
requireText(index,'id="guide-title">Theologian','Theologian must be named in the delivered shell');
requireText(index,'Ask the Theologian a study question','Theologian form must exist natively in the shell');
forbid(index,'library-system-refinements.css','obsolete CSS refinement layer must not be loaded');
forbid(bootstrap,'library-system.js','generic DOM repair runtime must not be loaded');
forbid(sw,'library-system-refinements.css','offline shell must not cache obsolete refinement layer');
forbid(sw,'library-system.js','offline shell must not cache obsolete DOM repair runtime');
requireText(sw,'v7-native-rendering-2026-09-22','service-worker cache must be bumped for native-rendering release');

for(const [route,document] of routeNames.map((route,index)=>[route,routeDocuments[index]])){
  requireText(document,`data-route-document="${route}"`,`${route} must ship a route-owned document root`);
  requireText(document,`data-route-content="${route}"`,`${route} must ship a bounded enhancement region`);
  requireText(document,'<h1',`${route} route document must expose a meaningful heading before JavaScript enhancement`);
  requireText(sw,`/${route}.html`,`${route} route document must be available offline`);
}

for(const marker of ['const routeFromPath=','const documentRoute=','const sameRouteNavigation=','location.assign(targetPath)','sameRouteNavigation(targetRoute)'])requireText(app,marker,`top-level native document navigation contract missing: ${marker}`);
forbid(app,"e.preventDefault();navigate(u.pathname+u.search+u.hash);return}}","cross-destination links must not be unconditionally converted to SPA navigation");

for(const [source,label] of [[home,'Home'],[course,'Course'],[learning,'Study Focus'],[bible,'Bible'],[topics,'Topics'],[search,'Search'],[app,'App'],[cloud,'Cloud Theologian'],[studyControls,'Study controls']])forbid(source,'MutationObserver',`${label} must not use MutationObserver rendering/repair`);
const jsFiles=(await filesUnder('public')).filter(file=>file.endsWith('.js'));
for(const file of jsFiles){const source=await read(file);forbid(source,'new MutationObserver',`production runtime must not instantiate MutationObserver: ${file}`)}

for(const marker of ['library-first-home','library-first-shelf','Theologian','66-book library'])requireText(home,marker,`Home must own Library First marker: ${marker}`);
for(const marker of ['course-catalog-chooser','course-catalog-detail','Current','Next','Later','data-course-preview-template'])requireText(course,marker,`Course renderer must own Catalog marker: ${marker}`);
for(const marker of ['Session Notes','data-journal-open','data-feedback-open','data-complete=','Theologian','current study activity'])requireText(learning,marker,`Study Focus must own learner-facing marker: ${marker}`);
for(const marker of ['Book Notes','library-reader-layout','library-reader-panel','shelf-spine__reveal','data-touch-named','current Bible reading'])requireText(bible,marker,`Bible renderer must own marker: ${marker}`);
for(const marker of ['Topic Notes','topic-reference-layout','topic-context-panel','Ask the Theologian','current Topic'])requireText(topics,marker,`Topics renderer must own marker: ${marker}`);
for(const marker of ['requestCloudTheologian','/api/theologian'])requireText(cloud,marker,`Cloud Theologian client missing direct marker: ${marker}`);
for(const legacy of ['Ask the Guide','How the Guide is reasoning','The Guide withheld'])forbid(app+learning+topics+search+cloud,legacy,`learner-facing legacy Guide language remains: ${legacy}`);

for(const marker of ['.study-focus__identity{display:grid','.study-layout{grid-template-columns:24px minmax(0,1fr) 286px','.library-reader-layout,.topic-reference-layout','.shelf-spine[data-touch-named="true"]'])requireText(libraryCss,marker,`consolidated Library First style missing: ${marker}`);

console.log(`native document-first rendering gate passed: ${routeNames.length} route documents + ${jsFiles.length} production JS files checked; cross-destination navigation is native; DOM repair layers absent`);
