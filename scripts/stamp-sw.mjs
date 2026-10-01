// Writes the service worker's RELEASE to public/generated/sw-release.js: a fingerprint of every file the worker
// serves from its shell cache, so any change to those files produces a new cache (the old one is deleted on
// activate) and visitors never keep stale files. sw.js imports the generated file; because the app registers
// the worker with updateViaCache:'none', browsers re-check imported scripts on every update check, so a new
// fingerprint alone is enough to roll out a new worker. The generated file is gitignored, so release bumps never
// change a tracked file and never conflict between pull requests.
//   bun scripts/stamp-sw.mjs          write public/generated/sw-release.js
//   bun scripts/stamp-sw.mjs --check  fail if it is missing or out of date (used by verify)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SW = 'public/sw.js';
const OUT = 'public/generated/sw-release.js';
const sw = readFileSync(SW, 'utf8');
if (!sw.includes("importScripts('/generated/sw-release.js')")) { console.error('stamp-sw: public/sw.js must import /generated/sw-release.js'); process.exit(1); }
const list = sw.match(/const ESSENTIAL=\[([^\]]*)\]/);
if (!list) { console.error('stamp-sw: ESSENTIAL list not found in public/sw.js'); process.exit(1); }
const files = [...list[1].matchAll(/'([^']+)'/g)].map(m => m[1]).filter(p => p !== '/');
const missing = files.filter(p => !existsSync(`public${p}`));
if (missing.length) { console.error(`stamp-sw: ESSENTIAL lists files that do not exist (the browser would refuse to install the worker): ${missing.join(', ')}`); process.exit(1); }
const hash = createHash('sha256');
hash.update(sw);
for (const p of files.sort()) { hash.update(p + '\0'); hash.update(readFileSync(`public${p}`)); }
const release = `auto-${hash.digest('hex').slice(0, 12)}`;
const next = `self.CS_RELEASE='${release}';\n`;
if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== next) { console.error(`stamp-sw: ${OUT} is ${current ? 'stale' : 'missing'} (expected ${release}); run: bun run sw:stamp`); process.exit(1); }
  console.log(`stamp-sw: RELEASE ${release} matches the shell files`);
} else {
  mkdirSync('public/generated', { recursive: true });
  writeFileSync(OUT, next);
  console.log(`stamp-sw: RELEASE ${release} (${files.length} shell files)`);
}
