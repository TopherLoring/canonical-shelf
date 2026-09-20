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
const buildRuntime=String(scripts['build:runtime']||'');
const buildApp=String(scripts['build:app']||'');
const buildVerify=String(scripts['build:verify']||'');
const build=String(scripts.build||'');
const verify=String(scripts.verify||'');
const verifyPrelaunch=String(scripts['verify:prelaunch']||'');
const verifyFull=String(scripts['verify:full']||'');
const deploy=String(scripts.deploy||'');

if(!migrate.includes('migrate-vendored.mjs'))throw new Error('production migrate must use the local vendor snapshot');
if(!prepareContent.includes('bun run migrate')||!prepareContent.includes('bun run generate:llms'))throw new Error('content preparation must migrate canonical data and regenerate llms.txt');
if(!repairPrelaunch.includes('repair-prelaunch.mjs'))throw new Error('prelaunch repair script must be wired');
if(!verifyBsb.includes('bsb-integrity.mjs'))throw new Error('BSB integrity check must be wired');
if(!buildRuntime.includes('build:client')||!buildRuntime.includes('generate:auth-migration')||!buildRuntime.includes('bootstrap.js')||!buildRuntime.includes('build:worker'))throw new Error('runtime build must compile generated client, auth migration, browser bootstrap, and worker');
if(!buildApp.includes('prepare:content')||!buildApp.includes('build:runtime'))throw new Error('application build must prepare content then compile the runtime');
if(!build.includes('build:app'))throw new Error('default build must execute the application build');
if(build.includes('generate:wrangler')||build.includes('bun run validate'))throw new Error('default build must not require deployment config or release validation');
if(!buildVerify.includes('repair:prelaunch')||!buildVerify.includes('build:runtime')||!buildVerify.includes('verify:bsb'))throw new Error('prelaunch verification build must repair deterministic content, compile runtime, and verify BSB integrity');
if(!verify.includes('verify:prelaunch'))throw new Error('default verify must use the prelaunch code gate');
if(!verifyPrelaunch.includes('build:verify')||!verifyPrelaunch.includes('test:sync')||!verifyPrelaunch.includes('test:d1')||!verifyPrelaunch.includes('test:feedback'))throw new Error('prelaunch verify must run build/integrity plus state/storage code tests');
if(verifyPrelaunch.includes('validate:experience')||verifyPrelaunch.includes('test:e2e')||verifyPrelaunch.includes('test:assessment')||verifyPrelaunch.includes('axe'))throw new Error('prelaunch verify must not be blocked by copy/parity/accessibility/content-depth checks');
if(!verifyFull.includes('test:e2e')||!verifyFull.includes('test:assessment'))throw new Error('full verification must retain exhaustive assessment and browser checks');
if(!deploy.includes('verify:prelaunch'))throw new Error('prelaunch deploy must use the prelaunch gate');
if(!deploy.includes('generate:wrangler'))throw new Error('production deploy must generate Cloudflare configuration');
if(!deploy.includes('wrangler d1 migrations apply canonical-shelf --remote'))throw new Error('production deploy must apply remote D1 migrations before Worker deployment');
if(!deploy.includes('wrangler deploy'))throw new Error('production deploy must publish through Wrangler');

for(const path of [
  'public/data/catalog.json','public/data/corpus.txt','public/data/curriculum.md','public/data/statement-of-faith.md','public/data/theology-sources.json','public/llms.txt','public/generated/account.js','worker/migrations/0000_auth.sql',
  'public/feedback.js','public/personal-study.js','public/utility-panels.css','worker/feedback-store.ts','worker/migrations/0002_feedback.sql'
])await stat(path);

await verifyPublicCorpus();

const sw=await readFile('public/sw.js','utf8');
for(const asset of ['/data/corpus.txt','/data/catalog.json','/generated/account.js','/feedback.js','/personal-study.js','/utility-panels.css'])if(!sw.includes(asset))throw new Error(`offline release missing ${asset}`);

console.log('production build/deploy separation + prelaunch/full gate split + immutable BSB integrity passed');
