import {readFile,writeFile,rm} from 'node:fs/promises';

const phase=process.argv[2]||'phase1';
const read=path=>readFile(path,'utf8');
const write=(path,content)=>writeFile(path,content,'utf8');
const replaceOnce=(content,from,to,label)=>{
  if(content.includes(to))return content;
  if(!content.includes(from))throw new Error(`SPA migration could not find expected ${label}`);
  return content.replace(from,to);
};

async function phase1(){
  let app=await read('public/app.js');

  // The public-first modularization commit imported theologian-engine but left a
  // corrupted copy of the old local Theologian implementation in app.js. Remove
  // that obsolete block before evaluating the SPA router. The engine module is
  // already the live owner of these functions.
  const obsoleteStart=app.indexOf("\n\n`:e.type==='course'");
  const obsoleteEnd=app.indexOf('\nfunction rememberStudyReturn');
  if(obsoleteStart>=0&&obsoleteEnd>obsoleteStart){
    app=app.slice(0,obsoleteStart)+app.slice(obsoleteEnd);
  }
  app=app.replace("import {theologianAnswer,theologianForm} from './theologian-engine.js';","import {theologianAnswer} from './theologian-engine.js';");
  if(app.includes("function deterministicTheologian(q)"))throw new Error('obsolete local Theologian implementation remains in app.js');

  app=replaceOnce(app,
`const route=()=>routeFromPath(location.pathname);
const documentRoute=()=>document.querySelector('[data-route-document]')?.dataset.routeDocument||null;
const sameRouteNavigation=targetRoute=>targetRoute===route()&&documentRoute()===targetRoute;
const params=()=>new URLSearchParams(location.search);`,
`const route=()=>routeFromPath(location.pathname);
const params=()=>new URLSearchParams(location.search);`,
'hybrid document-route helpers');

  app=replaceOnce(app,
`function navigate(path,{replace=false}={}){
  const target=new URL(nativeHref(path)||'/home',location.href),targetPath=\`${'${target.pathname}${target.search}${target.hash}'}\`,targetRoute=routeFromPath(target.pathname);
  if(!sameRouteNavigation(targetRoute)){
    if(replace)location.replace(targetPath);else location.assign(targetPath);
    return;
  }
  history[replace?'replaceState':'pushState']({},'',targetPath);render();
}`,
`function navigate(path,{replace=false}={}){
  const target=new URL(nativeHref(path)||'/home',location.href);
  const targetRoute=appRouteFromPath(target.pathname);
  const targetPath=\`${'${target.pathname}${target.search}${target.hash}'}\`;
  if(target.origin!==location.origin||!targetRoute){
    if(replace)location.replace(target.href);else location.assign(target.href);
    return;
  }
  history[replace?'replaceState':'pushState']({},'',targetPath);
  render();
}`,
'cross-document navigate function');

  app=replaceOnce(app,
`function refreshProgressPanel(){if(progressPanel&&!progressPanel.hidden)progressBody.innerHTML=progressPanelView({data,state,esc})}`,
`function renderInto(target,view){if(!target)return;if(typeof view==='string')target.innerHTML=view;else target.replaceChildren(view)}
function refreshProgressPanel(){if(progressPanel&&!progressPanel.hidden)renderInto(progressBody,progressPanelView({data,state,esc}))}`,
'progress-panel string renderer');

  app=replaceOnce(app,
`    if(targetRoute){
      rememberStudyReturn(link,u);
      if(sameRouteNavigation(targetRoute)){e.preventDefault();navigate(u.pathname+u.search+u.hash);return}
    }`,
`    if(targetRoute){
      rememberStudyReturn(link,u);
      e.preventDefault();navigate(u.pathname+u.search+u.hash);return;
    }`,
'internal-link hybrid navigation branch');

  app=replaceOnce(app,
`document.querySelector('#progress-open').addEventListener('click',()=>{progressBody.innerHTML=progressPanelView({data,state,esc});progressPanel.hidden=false;progressPanel.querySelector('a,button')?.focus({preventScroll:true})});`,
`document.querySelector('#progress-open').addEventListener('click',()=>{renderInto(progressBody,progressPanelView({data,state,esc}));progressPanel.hidden=false;progressPanel.querySelector('a,button')?.focus({preventScroll:true})});`,
'progress-open string renderer');

  await write('public/app.js',app);

  let css=await read('public/canonical-shelf.css');
  css=replaceOnce(css,
`body:has(.library-first-home)>.pwa-status{color:var(--home-muted);margin:.55rem clamp(1rem,4vw,4rem) 0}`,
`body:has(.library-first-home)>.pwa-status{color:var(--home-muted);background:var(--home-bg);margin:.55rem clamp(1rem,4vw,4rem) 0}`,
'Home PWA status surface');
  await write('public/canonical-shelf.css',css);

  console.log('SPA migration phase 1 applied: repaired public-first Theologian boundary, DOM-capable progress rendering, History API navigation, Home shell contrast');
}

async function phase2(){
  const packagePath='package.json';
  const pkg=JSON.parse(await read(packagePath));
  delete pkg.scripts['generate:routes'];
  for(const key of ['build:runtime','serve','dev']){
    if(typeof pkg.scripts[key]==='string')pkg.scripts[key]=pkg.scripts[key].replace(/\s*&&\s*bun run generate:routes/g,'').replace(/^bun run generate:routes\s*&&\s*/,'');
  }
  await write(packagePath,`${JSON.stringify(pkg,null,2)}\n`);

  let validate=await read('scripts/validate-cloudflare-config.mjs');
  validate=validate
    .replace("if(config.assets?.html_handling!=='auto-trailing-slash')fail('static route documents must use auto-trailing-slash HTML handling for clean /home, /course, /bible, /topics, /practice, and /search URLs');","if(config.assets?.html_handling!=='auto-trailing-slash')fail('static assets must preserve clean URL HTML handling');")
    .replace('clean route documents + D1/ASSETS/AI bindings present','SPA fallback + D1/ASSETS/AI bindings present');
  await write('scripts/validate-cloudflare-config.mjs',validate);

  let deployment=await read('scripts/verify-deployment.mjs');
  deployment=deployment.replace(
`for(const route of ['home','course','bible','topics','practice','search']){
  const path=\`/${'${route}'}\`;
  const response=await fetchWithRetry(path);
  const type=response.headers.get('content-type')||'';
  const body=await response.text();
  if(!type.includes('text/html'))throw new Error(\`${'${path}'} did not return HTML (${'${type||\'no content-type\'}'})\`);
  if(!/<html[\\s>]/i.test(body)||!/Canonical Shelf/i.test(body))throw new Error(\`${'${path}'} did not return a Canonical Shelf document\`);
  if(!body.includes(\`data-route-document=\"${'${route}'}\"\`))throw new Error(\`${'${path}'} resolved to generic fallback instead of its route-owned ${'${route}'} document\`);
  if(!body.includes(\`data-route-content=\"${'${route}'}\"\`))throw new Error(\`${'${path}'} is missing its bounded ${'${route}'} enhancement region\`);
  assertNativeShell(body,path);
}`,
`for(const route of ['home','course','bible','topics','practice','search']){
  const path=\`/${'${route}'}\`;
  const response=await fetchWithRetry(path);
  const type=response.headers.get('content-type')||'';
  const body=await response.text();
  if(!type.includes('text/html'))throw new Error(\`${'${path}'} did not return HTML (${'${type||\'no content-type\'}'})\`);
  if(!/<html[\\s>]/i.test(body)||!/Canonical Shelf/i.test(body))throw new Error(\`${'${path}'} did not return the Canonical Shelf SPA shell\`);
  if(!body.includes('id=\"main\" tabindex=\"-1\" aria-live=\"polite\"'))throw new Error(\`${'${path}'} is missing the canonical SPA mount\`);
  if(!body.includes('id=\"tpl-course-landing\"'))throw new Error(\`${'${path}'} is missing canonical DOM view templates\`);
  if(body.includes('data-route-document='))throw new Error(\`${'${path}'} is still serving a generated route-owned document\`);
  assertNativeShell(body,path);
}`);
  deployment=deployment.replace('route-owned documents, legal/privacy/safety surfaces','SPA route fallback, legal/privacy/safety surfaces');
  await write('scripts/verify-deployment.mjs',deployment);

  for(const file of ['public/home.html','public/course.html','public/bible.html','public/topics.html','public/practice.html','public/search.html','scripts/generate-route-documents.mjs'])await rm(file,{force:true});
  console.log('SPA migration phase 2 applied: route generator and generated documents removed');
}

if(phase==='phase1')await phase1();
else if(phase==='phase2')await phase2();
else throw new Error(`Unknown SPA migration phase: ${phase}`);
