import { readFile, stat } from 'node:fs/promises';

const req = [
  'public/index.html',
  'public/canonical-shelf.css',
  'public/styles.css',
  'public/learning.css',
  'public/bible.css',
  'public/bootstrap.js',
  'public/app.js',
  'public/account-ui.js',
  'public/sync.js',
  'public/learning.js',
  'public/theologian.js',
  'public/db.js',
  'public/sw.js',
  'public/manifest.webmanifest',
  'public/icon.svg',
  'public/data/theology-policy.json',
  'docs/v6/README.md',
  'docs/v6/theologian-runtime.md',
  'docs/v6/account-sync.md',
  'worker/index.ts',
  'worker/auth.ts',
  'worker/sync-store.ts',
  'worker/migrations/0001_sync.sql',
  'scripts/test-d1-sync.mjs',
  'src/client/account.ts',
  'src/knowledge/model.ts',
  'content/migration/admissibility.json'
];

for (const f of req) {
  await stat(f);
}

const architecture = await readFile('docs/v6/README.md', 'utf8');
if (/brownfield at the product\/content\/data layer/i.test(architecture)) {
  throw new Error('superseded brownfield architecture rule remains');
}

const shell=await readFile('public/index.html','utf8');
if(!shell.includes('/canonical-shelf.css'))throw new Error('canonical visual contract is not loaded by the shell');
if(shell.includes('/tokens.css'))throw new Error('legacy tokens.css remains a loaded visual authority');

console.log('v6 architecture/content/theology/canonical-design/native-routing/PWA/account-sync/audited-migration gates passed');
