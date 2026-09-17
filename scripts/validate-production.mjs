import {readFile,stat} from 'node:fs/promises';

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

const manifest=JSON.parse(await readFile('content/migration/admissibility.json','utf8'));
if(!/^[0-9a-f]{40}$/.test(manifest.sourceRef||''))throw new Error('legacy provenance must remain pinned to an immutable SHA');

const packageJson=JSON.parse(await readFile('package.json','utf8'));
if(!String(packageJson.scripts?.migrate||'').includes('migrate-vendored.mjs'))throw new Error('production migrate must use the local vendor snapshot');
if(!String(packageJson.scripts?.build||'').includes('generate:auth-migration'))throw new Error('production build must generate Better Auth schema');
if(!String(packageJson.scripts?.deploy||'').includes('generate:wrangler'))throw new Error('production deploy must generate Cloudflare config');

for(const path of ['public/data/catalog.json','public/data/corpus.txt','public/data/curriculum.md','public/data/statement-of-faith.md','public/data/theology-sources.json','public/generated/account.js','worker/migrations/0000_auth.sql'])await stat(path);

const corpus=await stat('public/data/corpus.txt');
if(corpus.size<3_000_000)throw new Error(`embedded BSB corpus unexpectedly small: ${corpus.size}`);

const sw=await readFile('public/sw.js','utf8');
for(const asset of ['/data/corpus.txt','/data/catalog.json','/generated/account.js'])if(!sw.includes(asset))throw new Error(`offline release missing ${asset}`);

const readme=await readFile('README.md','utf8');
if(!/Berean Standard Bible \(BSB\)/.test(readme))throw new Error('README must identify the embedded BSB corpus');

console.log('production standalone/build/offline/BSB gates passed');
