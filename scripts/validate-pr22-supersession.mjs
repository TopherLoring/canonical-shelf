import {readFile,access} from 'node:fs/promises';

const read=file=>readFile(file,'utf8');
const requireText=(source,text,message)=>{if(!source.includes(text))throw new Error(message||`missing required marker: ${text}`)};
const requirePattern=(source,pattern,message)=>{if(!pattern.test(source))throw new Error(message||`missing required pattern: ${pattern}`)};
const forbid=(source,text,message)=>{if(source.includes(text))throw new Error(message||`forbidden marker: ${text}`)};
const mustNotExist=async(file)=>{try{await access(file);throw new Error(`superseded PR #22 repair artifact still exists: ${file}`)}catch(error){if(error?.code!=='ENOENT')throw error}};

const [index,bootstrap,home,learning,chat,cloud,sw,verify,contract]=await Promise.all([
  read('public/index.html'),
  read('public/bootstrap.js'),
  read('public/progress-experience.js'),
  read('public/learning.js'),
  read('public/theologian-chat.js'),
  read('public/theologian-cloud.js'),
  read('public/sw.js'),
  read('scripts/verify-deployment.mjs'),
  read('public/canonical-shelf.css')
]);

// PR #22's desired user-facing behaviors must survive, while current owner decisions govern presentation.
for(const marker of ['id="guide-title">Theologian','aria-label="Open Theologian"'])requireText(index,marker,`native shell missing PR #22 Theologian invariant: ${marker}`);
for(const marker of ['library-first-home','library-first-shelf','Old Testament','New Testament','Browse books','Ask a question'])requireText(home,marker,`native Home missing current Library First invariant: ${marker}`);
for(const marker of ['data-study-guide','>Theologian</button>','Session Notes'])requireText(learning,marker,`native Study Focus missing Theologian/learning invariant: ${marker}`);
for(const marker of ['Building a grounded answer','offline evidence mode','guardrails validated','New chat'])requireText(chat,marker,`native Theologian chat missing visible state invariant: ${marker}`);
for(const marker of ['requestCloudTheologian','/api/theologian'])requireText(cloud,marker,`direct cloud Theologian client missing invariant: ${marker}`);
requirePattern(sw,/const RELEASE='v7-native-rendering-\d{4}-\d{2}-\d{2}-[a-z0-9]+';/,'service-worker release/cache identity is missing or malformed');
for(const marker of ['/theologian-chat.js','/home.html','/data/theology-policy.json','/canonical-shelf.css'])requireText(sw,marker,`service-worker supersession/cache invariant missing: ${marker}`);
for(const marker of ["theologian?.mode!=='cloud'","theologian.evidence.length===0","theologian?.validation?.status!=='passed'",'learnerAgency','data-route-document'])requireText(verify,marker,`production smoke gate missing PR #22 behavioral invariant: ${marker}`);
for(const marker of ['--home-bg:#252a30','--chrome-2:#3e4551','--color-gilt:#ffc800','--reader-paper:#ffffff','--theme-radius:15px','course-volume-shelf','bible-reader-shell','topics-dossier','practice-dashboard'])requireText(contract,marker,`canonical visual contract missing approved current marker: ${marker}`);

// PR #22's implementation strategy must remain superseded.
await mustNotExist('public/locked-home.js');
await mustNotExist('public/locked-library-baseline.css');
await mustNotExist('public/library-system-refinements.css');
for(const [source,label] of [[index,'index'],[bootstrap,'bootstrap'],[sw,'service worker'],[cloud,'cloud Theologian']]){
  for(const obsolete of ['locked-home.js','locked-library-baseline.css','library-system-refinements.css'])forbid(source,obsolete,`${label} references superseded PR #22 repair asset ${obsolete}`);
}
forbid(bootstrap,'library-system.js','bootstrap must not revive the generic post-render repair runtime');
forbid(cloud,'MutationObserver','cloud Theologian must not revive PR #22 MutationObserver naming/upgrade repair');
forbid(chat,'MutationObserver','traditional Theologian chat must not depend on DOM repair observers');
for(const legacy of ['Ask the Guide','How the Guide is reasoning'])forbid(index+learning+chat+cloud,legacy,`learner-facing legacy Guide language remains: ${legacy}`);

console.log('PR #22 supersession gate passed: Library First/Theologian/cache/live-smoke behavior preserved natively; current visual contract replaces locked repair styling; repair layers absent');
