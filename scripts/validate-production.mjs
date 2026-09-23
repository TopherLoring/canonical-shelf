import {readFile,stat} from 'node:fs/promises';
import {verifyPublicCorpus} from './bsb-integrity.mjs';

const requiredVendor=[
  'content/vendor/legacy/corpus.txt',
  'content/vendor/legacy/v4-course-map.js',
  'content/vendor/legacy/topics-data.js',
  'content/vendor/legacy/topics-extended.js',
  'content/vendor/legacy/foundations-data.js',
  'content/vendor/legacy/foundations-expansion-core.js',
  'content/vendor/legacy/foundations-units-02-08.js',
  'content/vendor/legacy/foundations-units-09-16.js',
  'content/vendor/legacy/docs/curriculum.md'
];
for(const path of requiredVendor)await stat(path);

try{await stat('public/_redirects');throw new Error('legacy Pages _redirects must not be shipped with Workers Static Assets');}catch(error){if(error.code!=='ENOENT')throw error;}

const manifest=JSON.parse(await readFile('content/migration/admissibility.json','utf8'));
if(!/^[0-9a-f]{40}$/.test(manifest.sourceRef||''))throw new Error('legacy provenance must remain pinned to an immutable SHA');

const packageJson=JSON.parse(await readFile('package.json','utf8'));
const scripts=packageJson.scripts||{};
const migrate=String(scripts.migrate||'');
const prepareContent=String(scripts['prepare:content']||'');
const repairPrelaunch=String(scripts['repair:prelaunch']||'');
const verifyBsb=String(scripts['verify:bsb']||'');
const generateRoutes=String(scripts['generate:routes']||'');
const generateWrangler=String(scripts['generate:wrangler']||'');
const validateCloudflare=String(scripts['validate:cloudflare']||'');
const validateNative=String(scripts['validate:native-rendering']||'');
const validateReachability=String(scripts['validate:reachability']||'');
const validateScoreable=String(scripts['validate:scoreable']||'');
const verifyDeployment=String(scripts['verify:deployment']||'');
const buildRuntime=String(scripts['build:runtime']||'');
const buildApp=String(scripts['build:app']||'');
const buildVerify=String(scripts['build:verify']||'');
const build=String(scripts.build||'');
const verify=String(scripts.verify||'');
const verifyPrelaunch=String(scripts['verify:prelaunch']||'');
const verifyFull=String(scripts['verify:full']||'');
const validateFull=String(scripts['validate:full']||'');
const deploy=String(scripts.deploy||'');

for(const required of ['migrate-vendored.mjs','postprocess-v6.mjs','publish-theology.mjs','apply-curriculum-metadata.mjs'])if(!migrate.includes(required))throw new Error(`production migrate must include ${required}`);
if(!prepareContent.includes('bun run migrate')||!prepareContent.includes('bun run generate:curriculum-reference')||!prepareContent.includes('bun run generate:llms'))throw new Error('content preparation must migrate canonical data, generate the current curriculum reference, and regenerate llms.txt');
if(!repairPrelaunch.includes('repair-prelaunch.mjs'))throw new Error('prelaunch repair script must be wired');
if(!verifyBsb.includes('bsb-integrity.mjs'))throw new Error('BSB integrity check must be wired');
if(!generateRoutes.includes('generate-route-documents.mjs'))throw new Error('route-owned document generation must use the canonical route document generator');
if(!generateWrangler.includes('write-wrangler.mjs'))throw new Error('Cloudflare config generation must use the canonical generator');
if(!validateCloudflare.includes('validate-cloudflare-config.mjs'))throw new Error('Cloudflare config validation gate must be wired');
if(!validateNative.includes('validate-native-rendering.mjs'))throw new Error('native route-document validation gate must be wired');
if(!validateReachability.includes('validate-learner-content-reachability.mjs'))throw new Error('learner content reachability gate must be wired');
if(!validateScoreable.includes('validate-scoreable-challenges.mjs'))throw new Error('scoreable assessment gate must be wired');
if(!verifyDeployment.includes('verify-deployment.mjs'))throw new Error('post-deploy smoke gate must be wired');
if(!buildRuntime.includes('generate:routes')||!buildRuntime.includes('build:client')||!buildRuntime.includes('generate:auth-migration')||!buildRuntime.includes('bootstrap.js')||!buildRuntime.includes('build:worker'))throw new Error('runtime build must generate route documents, compile generated client, auth migration, browser bootstrap, and worker');
if(!buildApp.includes('prepare:content')||!buildApp.includes('build:runtime'))throw new Error('application build must prepare content then compile the runtime');
if(!build.includes('build:app'))throw new Error('default build must execute the application build');
if(build.includes('generate:wrangler')||build.includes('bun run validate'))throw new Error('default build must not require deployment config or release validation');
for(const required of ['repair:prelaunch','build:runtime','verify:bsb','validate:curriculum-spiral','validate:scoreable','validate:native-rendering','validate:llms','validate:reachability'])if(!buildVerify.includes(required))throw new Error(`prelaunch verification build must include ${required}`);
if(!verify.includes('verify:prelaunch'))throw new Error('default verify must use the prelaunch code gate');
for(const required of ['build:verify','test:sync','test:d1','test:feedback','test:theologian'])if(!verifyPrelaunch.includes(required))throw new Error(`prelaunch verify must include ${required}`);
if(verifyPrelaunch.includes('validate:experience')||verifyPrelaunch.includes('test:e2e')||verifyPrelaunch.includes('test:assessment')||verifyPrelaunch.includes('axe'))throw new Error('prelaunch verify must not be blocked by browser/content-depth gates reserved for full release verification');
if(!verifyFull.includes('test:e2e')||!verifyFull.includes('test:assessment')||!verifyFull.includes('test:theologian'))throw new Error('full verification must retain exhaustive assessment, cloud-Theologian, and browser checks');
for(const required of ['validate:curriculum-spiral','validate:scoreable','validate:experience','validate:native-rendering','validate:llms','validate:reachability'])if(!validateFull.includes(required))throw new Error(`full validation must include ${required}`);
for(const required of ['verify:prelaunch','generate:wrangler','validate:cloudflare','wrangler d1 migrations apply canonical-shelf --remote','wrangler deploy','verify:deployment'])if(!deploy.includes(required))throw new Error(`production deploy must include ${required}`);

for(const path of [
  'scripts/generate-route-documents.mjs','scripts/generate-curriculum-reference.mjs','scripts/publish-theology.mjs','scripts/apply-curriculum-metadata.mjs','scripts/validate-curriculum-spiral.mjs','scripts/validate-scoreable-challenges.mjs','scripts/validate-cloudflare-config.mjs','scripts/validate-native-rendering.mjs','scripts/validate-learner-content-reachability.mjs','scripts/verify-deployment.mjs','scripts/test-theologian-cloud.mjs',
  'content/learner-content-reachability.json','content/theology/policy.json','content/theology/sources.json','content/statement/statement-of-faith-compact.md','content/statement/statement-of-faith-v3.md','src/knowledge/model.ts',
  'public/canonical-shelf.css','public/data/catalog.json','public/data/corpus.txt','public/data/curriculum.md','public/data/statement-of-faith.md','public/data/theologian-belief-context.md','public/data/theology-policy.json','public/data/theology-sources.json','public/llms.txt','public/generated/account.js','worker/migrations/0000_auth.sql',
  'public/home.html','public/course.html','public/bible.html','public/topics.html','public/practice.html','public/search.html',
  'public/feedback.js','public/personal-study.js','public/utility-panels.css','public/theologian-chat.js','public/theologian-chat.css','worker/feedback-store.ts','worker/theologian-ai.ts','worker/migrations/0002_feedback.sql'
])await stat(path);

for(const [source,target] of [
  ['content/statement/statement-of-faith-compact.md','public/data/statement-of-faith.md'],
  ['content/statement/statement-of-faith-v3.md','public/data/theologian-belief-context.md'],
  ['content/theology/policy.json','public/data/theology-policy.json'],
  ['content/theology/sources.json','public/data/theology-sources.json']
]){
  const canonical=(await readFile(source,'utf8')).trim();
  const published=(await readFile(target,'utf8')).trim();
  if(canonical!==published)throw new Error(`${target} drifted from canonical source ${source}`);
}

await verifyPublicCorpus();

const routeGenerator=await readFile('scripts/generate-route-documents.mjs','utf8');
for(const route of ['home','course','bible','topics','practice','search']){
  if(!routeGenerator.includes(`${route}:`))throw new Error(`route document generator missing ${route}`);
  const document=await readFile(`public/${route}.html`,'utf8');
  for(const marker of [`data-route-document="${route}"`,`data-route-content="${route}"`])if(!document.includes(marker))throw new Error(`${route} route artifact missing ${marker}`);
}

const index=await readFile('public/index.html','utf8');
if(!index.includes('/theologian-chat.css'))throw new Error('application shell must load Theologian chat styles');
if(!index.includes('/canonical-shelf.css'))throw new Error('application shell must load the canonical visual contract');
if(index.includes('/tokens.css'))throw new Error('application shell must not load retired tokens.css');
if(!index.includes('Private journal entry'))throw new Error('Journal terminology must remain distinct from assessment reflection');

for(const page of ['about.html','privacy.html','data-retention.html','storage.html','terms.html','safety.html']){
  const source=await readFile(`public/${page}`,'utf8');
  if(!source.includes('/canonical-shelf.css'))throw new Error(`${page} must load the canonical visual contract`);
  if(source.includes('/tokens.css'))throw new Error(`${page} still references retired tokens.css`);
}

const sw=await readFile('public/sw.js','utf8');
for(const asset of ['/data/corpus.txt','/data/catalog.json','/data/statement-of-faith.md','/data/theologian-belief-context.md','/data/theology-policy.json','/data/theology-sources.json','/generated/account.js','/feedback.js','/personal-study.js','/utility-panels.css','/theologian-chat.js','/theologian-chat.css','/canonical-shelf.css','/home.html','/course.html','/bible.html','/topics.html','/practice.html','/search.html'])if(!sw.includes(asset))throw new Error(`offline release missing ${asset}`);

const wranglerWriter=await readFile('scripts/write-wrangler.mjs','utf8');
for(const invariant of ["name:WORKER_NAME","'the-canonical-shelf'","html_handling:'auto-trailing-slash'","not_found_handling:'single-page-application'","ai:{binding:'AI'}","CANONICAL_ORIGIN","RELEASE_SHA"])if(!wranglerWriter.includes(invariant))throw new Error(`canonical Wrangler generator missing ${invariant}`);

const deploymentVerifier=await readFile('scripts/verify-deployment.mjs','utf8');
for(const invariant of ['data-route-document','data-route-content',"'/api/theologian'","mode!=='cloud'",'Berean Standard Bible'])if(!deploymentVerifier.includes(invariant))throw new Error(`post-deploy proof missing ${invariant}`);

const deployWorkflow=await readFile('.github/workflows/deploy-production.yml','utf8');
for(const invariant of ['CANONICAL_ORIGIN: https://the-canonical-shelf.christopherwonder.workers.dev','bun run validate:cloudflare','bun run verify:deployment','live Theologian'])if(!deployWorkflow.includes(invariant))throw new Error(`production workflow missing ${invariant}`);

console.log('production route-document build/deploy separation + canonical visual contract + exact Worker target + route ownership/live Theologian smoke + scoreable assessments + learner-content reachability + compact/supplemental theology roles + persistent/offline Theologian chat + curriculum/content integrity gates passed');
