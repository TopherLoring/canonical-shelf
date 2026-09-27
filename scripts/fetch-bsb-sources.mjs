// Downloads the Berean Standard Bible source files into data/source and verifies pinned SHA-256 hashes.
// Files already present with the right hash are left alone. A hash mismatch fails loudly so upstream
// changes never slip into the build unnoticed; update the pins below deliberately after reviewing a new release.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DIR = resolve(process.cwd(), 'data/source');
const SOURCES = [
  { file: 'bsb_tables.tsv', url: 'https://bereanbible.com/bsb_tables.tsv', sha256: '09bbee6f9fe4fa22b5df28e8a9ffa99bf9c33435f4eb8c47c2dc221d855d35cb', bytes: 85525373 },
  { file: 'bsb_concordance.xlsx', url: 'https://bereanbible.com/bsb_concordance.xlsx', sha256: '01a888e221cdfb652b19e2791e82b5a7141beb703d54661b8819ff49d89580d3', bytes: 52051537 },
  { file: 'bsb_topical_index.xlsx', url: 'https://bereanbible.com/bsb_topical_index.xlsx', sha256: '7de7a0d688bf4fc89d6087b12d94e47e091b5e3ac0146362da13819bbfd9ad6f', bytes: 9823971 }
];

const only = process.argv.slice(2);
const sha = buf => createHash('sha256').update(buf).digest('hex');
await mkdir(DIR, { recursive: true });
let failed = false;

for (const src of SOURCES.filter(s => !only.length || only.includes(s.file))) {
  const path = resolve(DIR, src.file);
  if (existsSync(path) && sha(await readFile(path)) === src.sha256) { console.log(`ok       ${src.file} (cached)`); continue; }
  const res = await fetch(src.url);
  if (!res.ok) { console.error(`FAILED   ${src.file}: HTTP ${res.status} from ${src.url}`); failed = true; continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  const got = sha(buf);
  if (got !== src.sha256) {
    console.error(`MISMATCH ${src.file}: expected ${src.sha256}, got ${got} (${buf.length} bytes). Upstream changed; review the new release, then update the pin.`);
    await rm(path, { force: true });
    failed = true; continue;
  }
  await writeFile(path, buf);
  console.log(`fetched  ${src.file} (${buf.length} bytes, hash verified)`);
}
process.exit(failed ? 1 : 0);
