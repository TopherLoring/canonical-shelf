import {access,readFile} from 'node:fs/promises';

const fail=message=>{throw new Error(`release governance validation failed: ${message}`)};
const read=path=>readFile(path,'utf8').catch(error=>fail(`${path} unavailable: ${error.message}`));
const requireAll=(value,markers,label)=>{for(const marker of markers)if(!value.includes(marker))fail(`${label} missing ${marker}`)};

const requiredFiles=[
  'public/privacy.html','public/data-retention.html','public/storage.html','public/terms.html','public/safety.html',
  'content/theology/crisis-policy.json','public/data/theologian-crisis-policy.json',
  'worker/theologian-crisis.ts','worker/migrations/0003_theologian_feedback_context.sql','worker/migrations/0004_feedback_reply_routing.sql'
];
for(const path of requiredFiles)await access(path).catch(()=>fail(`required release file missing: ${path}`));

const [index,about,privacy,retention,storage,terms,safety,feedback,chat,store,worker,crisis,crisisPolicy,reachability,sw,pkg,auth]=await Promise.all([
  read('public/index.html'),read('public/about.html'),read('public/privacy.html'),read('public/data-retention.html'),read('public/storage.html'),read('public/terms.html'),read('public/safety.html'),
  read('public/feedback.js'),read('public/theologian-chat.js'),read('worker/feedback-store.ts'),read('worker/index.ts'),read('worker/theologian-crisis.ts'),read('content/theology/crisis-policy.json'),read('content/learner-content-reachability.json'),read('public/sw.js'),read('package.json'),read('worker/auth.ts')
]);

for(const page of [index,about])requireAll(page,['/privacy.html','/data-retention.html','/storage.html','/terms.html','/safety.html'],'public legal navigation');
requireAll(index,['Feedback &amp; reviews','Privacy or data request','feedback-inbox','Forget this browser'], 'feedback learner surface');
requireAll(feedback,['canonical-shelf-feedback-browser-id-v1','x-canonical-feedback-id','loadInbox','data-feedback-forget'], 'feedback browser routing');
requireAll(chat,['Flag for review','Disagree / another interpretation','canonical-theologian-review'], 'Theologian response review');

requireAll(store,['normalizeFeedbackBody','anonymousFeedbackKey','SHA-256','readFeedbackInbox','respondToFeedback','pruneFeedbackData'], 'feedback server contract');
if(/REVIEW_REASONS|CATEGORIES\.has|message\.trim\(\)\.length>=/i.test(store))fail('feedback store appears to restore content-level rejection enums/minimums');
requireAll(worker,['x-canonical-feedback-id','/api/admin/feedback/respond','FEEDBACK_ADMIN_TOKEN','maybeTheologianCrisisResponse'], 'worker feedback/crisis routes');
if(/cf-connecting-ip|x-forwarded-for|anonymous_key\s*=\s*.*ip/i.test(`${worker}\n${store}`))fail('IP-based feedback routing is forbidden');
requireAll(auth,["UPDATE feedback SET user_id=NULL WHERE user_id=?"], 'account deletion feedback de-identification');

requireAll(crisis,['deterministic-crisis-safety-v1','call or text 988','call 911','God\'s love','Prayer','immediate danger right now'], 'deterministic crisis layer');
requireAll(crisisPolicy,['Pastoral reassurance, Scripture, prayer, and faith-community support may accompany but must never delay, replace, or weaken','Do not use or persist an IP address','Do not silently contact police','do not place a learner beyond God\'s love'], 'crisis policy');
requireAll(safety,['988','911','God\'s love','prayer','Learner agency is a hard requirement. The learner remains the decision-maker.'], 'public safety disclosure');

requireAll(privacy,['pseudonymous','one-way SHA-256','does not use or persist an IP address','does not sell personal data','does not use personal data for targeted advertising'], 'privacy policy');
requireAll(retention,['24 months','12 months','90 days'], 'retention policy');
requireAll(storage,['does not use advertising cookies','does not present a generic “accept all cookies” banner'], 'storage disclosure');
requireAll(terms,['Learner agency is a hard requirement. The learner remains the decision-maker.','pastoral-style guidance','call or text 988'], 'Terms');

const manifest=JSON.parse(reachability);
if(Number(manifest.version)<3)fail('learner-content reachability must be v3+');
const ids=new Set((manifest.entries||[]).map(entry=>entry.id));
for(const id of ['privacy-policy','data-retention-policy','storage-disclosure','terms-of-use','theologian-safety','crisis-policy'])if(!ids.has(id))fail(`reachability missing ${id}`);
for(const id of ['privacy-policy','data-retention-policy','storage-disclosure','terms-of-use','theologian-safety','crisis-policy']){
  const entry=manifest.entries.find(item=>item.id===id);if(entry?.llms?.disposition!=='embed')fail(`${id} must be embedded in llms.txt`);
}

requireAll(sw,['/privacy.html','/data-retention.html','/storage.html','/terms.html','/safety.html','/data/theologian-crisis-policy.json'], 'offline cache');
const packageJson=JSON.parse(pkg);
if(!String(packageJson.scripts?.['test:theologian']||'').includes('test-theologian-crisis.mjs'))fail('Theologian crisis test is not in test:theologian');
if(!String(packageJson.scripts?.['build:verify']||'').includes('validate:release-governance'))fail('release governance validator is not in build:verify');
if(!String(packageJson.scripts?.['validate:full']||'').includes('validate:release-governance'))fail('release governance validator is not in validate:full');

console.log('release governance gates passed: learner agency + response review + pseudonymous replies + retention/legal disclosure + crisis safety + reachability/offline consistency');
