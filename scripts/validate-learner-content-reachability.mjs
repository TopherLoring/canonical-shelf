import {readFile,stat} from 'node:fs/promises';

const manifest=JSON.parse(await readFile('content/learner-content-reachability.json','utf8'));
if(manifest.version!==1||!Array.isArray(manifest.entries)||!manifest.entries.length)throw new Error('learner content reachability manifest is missing or invalid');

const ids=new Set();
for(const entry of manifest.entries){
  if(!entry.id||ids.has(entry.id))throw new Error(`invalid or duplicate reachability id: ${entry.id||'(missing)'}`);
  ids.add(entry.id);
  for(const required of ['source','mode','surface','entry','host'])if(!entry[required])throw new Error(`${entry.id} is missing ${required}`);
  await stat(entry.source);await stat(entry.host);if(entry.published)await stat(entry.published);
  if(entry.mode==='direct'&&entry.entry.startsWith('/')){
    const root=entry.entry.split(/[?#]/)[0].replace(/^\//,'');
    if(['home','course','bible','topics','practice','search'].includes(root))await stat(`public/${root}.html`);
    if(root==='about.html')await stat('public/about.html');
  }
}
for(const required of ['orientation','curriculum','scripture','bible-library','topics','glossary','practice','curated-passages','appearance-themes','about-disclosures','statement-of-faith','theology-policy','theology-sources','supplemental-belief-context'])if(!ids.has(required))throw new Error(`learner content reachability contract missing ${required}`);

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

const policy=JSON.parse(await readFile('content/theology/policy.json','utf8'));
if(Number(policy.version)<3)throw new Error('theology policy must use the restored v3 authority/privacy contract');
for(const key of ['scriptureText','canonicalDoctrine','interpretivePolicy','publishedTeaching','supplementalBeliefContext','scholarshipAndTraditions'])if(!policy.authority?.domains?.[key])throw new Error(`theology policy authority domain missing ${key}`);
for(const state of ['affirmed','bounded-inference','open','descriptive-only','outside-scope'])if(!policy.doctrinalStates?.includes(state))throw new Error(`theology policy doctrinal state missing ${state}`);
for(const state of ['direct','strong','plausible','contested','speculative'])if(!policy.evidenceStates?.includes(state))throw new Error(`theology policy evidence state missing ${state}`);
for(const domain of ['biblical-text','history','language','doctrine','interpretation','ethics','reception-history','application'])if(!policy.claimDomains?.includes(domain))throw new Error(`theology policy claim domain missing ${domain}`);
if(!policy.responseContract?.some(item=>/answer.*first/i.test(item)))throw new Error('Theologian response contract must remain answer-first');
if(!policy.responseContract?.some(item=>/Canonical Shelf.*position.*separately/i.test(item)))throw new Error('Theologian response contract must separate Canonical Shelf position from competing readings');
for(const forbidden of ['Journal text','lesson notes','profile data','account identifiers','feedback content','inferred theological beliefs'])if(!policy.learnerContext?.forbidden?.includes(forbidden))throw new Error(`Theologian learner-context policy missing forbidden field ${forbidden}`);
if(!/must not reveal|must not.*select|do not reveal/i.test(policy.masteryProtection?.rule||''))throw new Error('Theologian mastery protection rule missing');
if(!/never a scored mastery criterion/i.test(policy.masteryProtection?.theologicalAssent||''))throw new Error('theological assent must remain outside mastery scoring');

const model=await readFile('src/knowledge/model.ts','utf8');
for(const invariant of ['outside-scope','application','LearnerContextSummary','EvidenceStatus','InterpretationType'])if(!model.includes(invariant))throw new Error(`typed theology model missing ${invariant}`);

const worker=await readFile('worker/theologian-ai.ts','utf8');
for(const invariant of ['/data/statement-of-faith.md','/data/theologian-belief-context.md','AUTHORITY BY DOMAIN','COMPACT CANONICAL SHELF STATEMENT OF FAITH','SUPPLEMENTAL LONG-FORM BELIEF CONTEXT','Prior dialogue','LEARNER CONTEXT','evidenceStatus','claimDomain','doctrinalStatus','MASTERY MODE IS ACTIVE'])if(!worker.includes(invariant))throw new Error(`cloud Theologian guardrail wiring missing ${invariant}`);

const deterministic=await readFile('public/theologian.js','utf8');
if(/\bGuide\b/.test(deterministic))throw new Error('learner-facing deterministic Theologian runtime must not retain Guide naming');
for(const invariant of ['evidenceStatus','claimDomain','doctrinalStatus','masteryProtected','prohibitedOverstatements'])if(!deterministic.includes(invariant))throw new Error(`deterministic Theologian guardrail wiring missing ${invariant}`);

const cloudClient=await readFile('public/theologian-cloud.js','utf8');
for(const invariant of ['Current question:','conversationMode','LEARNER CONTEXT','masteryActive'])if(!cloudClient.includes(invariant))throw new Error(`bounded Theologian request context missing ${invariant}`);
for(const forbidden of ['localStorage','sessionStorage','indexedDB','journal','notes','profile','account'])if(cloudClient.toLowerCase().includes(forbidden.toLowerCase()))throw new Error(`cloud transport must not directly read or serialize private learner field ${forbidden}`);

const chat=await readFile('public/theologian-chat.js','utf8');
for(const invariant of ['canonical-shelf-theologian-chat-v1','localStorage','New chat','getState','dueReviews','recentActivity','masteryActive','deterministicAnswer','evidenceStatus','claimDomain','validation'])if(!chat.includes(invariant))throw new Error(`traditional Theologian chat missing ${invariant}`);
for(const forbidden of ['state.journal','state.notes','state.profile','state.account','personal-journal','feedback-form'])if(chat.includes(forbidden))throw new Error(`Theologian learner context must not include private field ${forbidden}`);

const bootstrap=await readFile('public/bootstrap.js','utf8');
if(!bootstrap.includes("import('./theologian-chat.js')"))throw new Error('traditional Theologian chat must initialize with the application shell');
await stat('public/theologian-chat.css');

const utilities=await readFile('public/utility-panels.css','utf8');
if(!utilities.includes('body.study-focus-active>.feedback-open')||!utilities.includes('background:transparent'))throw new Error('learning-view Feedback must remain a quiet text-style control rather than a floating primary button');

console.log(`learner content reachability + compact faith ceiling + supplemental belief context + original typed Theologian guardrails + locally persistent private-safe chat + quiet feedback affordance gates passed (${manifest.entries.length} content families)`);
