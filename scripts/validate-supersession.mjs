import {readFile,access} from 'node:fs/promises';

const read=file=>readFile(file,'utf8');
const requireText=(source,text,message)=>{if(!source.includes(text))throw new Error(message||`missing required marker: ${text}`)};
const forbidText=(source,text,message)=>{if(source.includes(text))throw new Error(message||`forbidden stale marker: ${text}`)};
const mustNotExist=async file=>{
  try{await access(file);throw new Error(`superseded runtime artifact still exists: ${file}`)}
  catch(error){if(error?.code!=='ENOENT')throw error}
};

const [readme,precedence,reachabilityDoc,audit,convergence,packageJson]=await Promise.all([
  read('README.md'),
  read('docs/v7/DECISION_PRECEDENCE.md'),
  read('docs/v7/CONTENT_REACHABILITY_AND_THEOLOGIAN_AUTHORITY_2026-09-22.md'),
  read('docs/v7/DOCUMENTATION_AUDIT_2026-09-21.md'),
  read('docs/v7/CONVERGENCE_SUPERSESSION_2026-09-22.md'),
  read('package.json')
]);

// Public faith authority must be unambiguous.
for(const source of [readme,precedence,reachabilityDoc,audit,convergence]){
  requireText(source,'content/statement/statement-of-faith-compact.md','current authority docs must name the compact public Statement of Faith');
  requireText(source,'content/statement/statement-of-faith-v3.md','current authority docs must identify the supplemental long-form belief context');
}
forbidText(readme,'Its canonical source is `content/statement/statement-of-faith-v3.md`','README must not restore the long-form belief file as the public Statement of Faith');
forbidText(audit,'content/statement/statement-of-faith-v3.md`\n- `content/theology/policy.json','documentation audit must not list long-form belief context as the sole Statement of Faith source');

// #24 is the sole convergence path; #20/#22/#23 must be explicitly superseded.
for(const source of [readme,precedence,audit,convergence]){
  requireText(source,'#24',`current convergence authority missing PR #24`);
  requireText(source,'#20',`current convergence authority missing PR #20 disposition`);
  requireText(source,'#22',`current convergence authority missing PR #22 disposition`);
  requireText(source,'#23',`current convergence authority missing PR #23 disposition`);
  requireText(source,'superseded',`current convergence authority must label older PRs superseded`);
}
for(const stale of [
  'PR #23 contains the separate complete learner-facing `llms.txt` corpus work',
  'PR #23 changes the generated learner-facing `llms.txt` corpus scope',
  'intentionally separate from PR #24',
  'preserve the separate PR #23'
])forbidText(precedence+'\n'+audit+'\n'+readme,stale,`stale pre-convergence PR #23 authority remains: ${stale}`);

// Current chat behavior: local continuity is allowed; server/account persistence remains forbidden.
for(const source of [readme,precedence,reachabilityDoc,audit]){
  requireText(source,'local',`Theologian chat authority must describe local browser continuity`);
  requireText(source,'Journal',`Theologian privacy authority must preserve private-writing exclusions`);
}
requireText(reachabilityDoc,'New chat','reachability authority must define how locally persistent Theologian chat is cleared');
forbidText(reachabilityDoc,'Reloading the application clears the conversation context','reload-ephemeral chat documentation is superseded');
forbidText(reachabilityDoc,'not written to localStorage','local browser persistence is now an approved Theologian behavior');

// Learner agency remains a hard current contract.
for(const marker of ['learner remains the decision-maker','God is love','grace rather than human merit','love of God and love of neighbor'])requireText(precedence.toLowerCase(),marker.toLowerCase(),`decision precedence missing Theologian interpretive/agency marker: ${marker}`);

// Superseded repair architecture must not physically survive in the active tree.
for(const file of [
  'public/library-system.js',
  'public/library-system-refinements.css',
  'public/locked-home.js',
  'public/locked-library-baseline.css'
])await mustNotExist(file);

// The convergence gate itself must be release-blocking.
const pkg=JSON.parse(packageJson);
if(pkg.scripts?.['validate:supersession']!=='bun scripts/validate-supersession.mjs')throw new Error('package.json must expose validate:supersession');
for(const script of ['build:verify','validate:full'])if(!String(pkg.scripts?.[script]||'').includes('validate:supersession'))throw new Error(`${script} must execute validate:supersession`);

console.log('repo-wide convergence/supersession gate passed: #24 sole authority; #20/#22/#23 historical; compact faith ceiling, local chat continuity, and obsolete-runtime exclusions aligned');
