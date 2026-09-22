import {readFile,access} from 'node:fs/promises';

const read=file=>readFile(file,'utf8');
const requireText=(source,text,message)=>{if(!source.includes(text))throw new Error(message||`missing required marker: ${text}`)};
const forbid=(source,text,message)=>{if(source.includes(text))throw new Error(message||`forbidden marker: ${text}`)};
const mustNotExist=async(file)=>{try{await access(file);throw new Error(`superseded PR #22 repair artifact still exists: ${file}`)}catch(error){if(error?.code!=='ENOENT')throw error}};

const [index,bootstrap,home,learning,chat,cloud,sw,verify,libraryCss]=await Promise.all([
  read('public/index.html'),
  read('public/bootstrap.js'),
  read('public/progress-experience.js'),
  read('public/learning.js'),
  read('public/theologian-chat.js'),
  read('public/theologian-cloud.js'),
  read('public/sw.js'),
  read('scripts/verify-deployment.mjs'),
  read('public/library-system.css')
]);

// PR #22's desired user-facing behaviors must survive.
for(const marker of ['id="guide-title">Theologian','aria-label="Open Theologian"'])requireText(index,marker,`native shell missing PR #22 Theologian invariant: ${marker}`);
for(const marker of ['library-first-home','library-first-shelf','66-book library','Theologian'])requireText(home,marker,`native Home missing Library First invariant: ${marker}`);
for(const marker of ['data-study-guide','>Theologian</button>','Session Notes'])requireText(learning,marker,`native Study Focus missing Theologian/learning invariant: ${marker}`);
for(const marker of ['Building a grounded answer','offline evidence mode','guardrails validated','New chat'])requireText(chat,marker,`native Theologian chat missing visible state invariant: ${marker}`);
for(const marker of ['requestCloudTheologian','/api/theologian'])requireText(cloud,marker,`direct cloud Theologian client missing invariant: ${marker}`);
for(const marker of ['v7-native-rendering-2026-09-22-d','/theologian-chat.js','/home.html','/data/theology-policy.json'])requireText(sw,marker,`service-worker supersession/cache invariant missing: ${marker}`);
for(const marker of ["theologian?.mode!=='cloud'","theologian.evidence.length===0","theologian?.validation?.status!=='passed'",'learnerAgency','data-route-document'])requireText(verify,marker,`production smoke gate missing PR #22 behavioral invariant: ${marker}`);
for(const marker of ['#24272d','#31353c','#c7a253','background-image:none!important'])requireText(libraryCss,marker,`consolidated Library First CSS missing approved baseline marker: ${marker}`);

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

console.log('PR #22 supersession gate passed: Library First/Theologian/cache/live-smoke behavior preserved natively; locked repair layers absent');
