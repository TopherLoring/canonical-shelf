// Sets the service worker's RELEASE to a fingerprint of every file it serves from its shell cache, so any change
// to those files produces a new cache (the old one is deleted on activate) and visitors never keep stale files.
//   bun scripts/stamp-sw.mjs          update public/sw.js
//   bun scripts/stamp-sw.mjs --check  fail if public/sw.js is out of date (used by verify)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SW = 'public/sw.js';
const sw = readFileSync(SW, 'utf8');
const list = sw.match(/const ESSENTIAL=\[([^\]]*)\]/);
if (!list) { console.error('stamp-sw: ESSENTIAL list not found in public/sw.js'); process.exit(1); }
const files = [...list[1].matchAll(/'([^']+)'/g)].map(m => m[1]).filter(p => p !== '/');
const hash = createHash('sha256');
for (const p of files.sort()) {
  const file = `public${p}`;
  hash.update(p + '\0');
  if (existsSync(file)) hash.update(readFileSync(file).toString('utf8').replace(/const RELEASE='[^']*';/, ''));
}
const release = `auto-${hash.digest('hex').slice(0, 12)}`;
const next = sw.replace(/const RELEASE='[^']*';/, `const RELEASE='${release}';`);
if (process.argv.includes('--check')) {
  if (next !== sw) { console.error(`stamp-sw: public/sw.js RELEASE is stale (expected ${release}); run: bun run sw:stamp`); process.exit(1); }
  console.log(`stamp-sw: RELEASE ${release} matches the shell files`);
} else {
  writeFileSync(SW, next);
  console.log(`stamp-sw: RELEASE ${release} (${files.length} shell files)`);
}
