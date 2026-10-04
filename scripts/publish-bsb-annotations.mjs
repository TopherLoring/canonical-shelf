// Publishes the vendored BSB reading apparatus (content/vendor/bsb/annotations.json) to
// public/data/bsb-annotations/<book>.json (one small file per book) for the Bible reader, after confirming it was built against the same corpus
// the site serves. Runs inside prepare:content; never needs the 85 MB source table.
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = process.cwd();
const SRC = resolve(root, 'content/vendor/bsb/annotations.json');
const CORPUS = resolve(root, 'public/data/corpus.txt');
const OUT_DIR = resolve(root, 'public/data/bsb-annotations');
const fail = msg => { console.error(`publish-bsb-annotations: ${msg}`); process.exit(1); };

if (!existsSync(SRC)) fail('content/vendor/bsb/annotations.json missing. Run: bun scripts/vendor-bsb-annotations.mjs');
if (!existsSync(CORPUS)) fail('public/data/corpus.txt missing. Run: bun run migrate');
const data = JSON.parse(readFileSync(SRC, 'utf8'));
const corpusSha = createHash('sha256').update(readFileSync(CORPUS)).digest('hex');
if (data.corpus?.sha256 !== corpusSha) fail(`annotations were built against corpus ${data.corpus?.sha256}, but the site serves ${corpusSha}. Re-run scripts/vendor-bsb-annotations.mjs.`);
if (Object.keys(data.chapters || {}).length !== 1189) fail(`expected 1189 chapters, found ${Object.keys(data.chapters || {}).length}`);
const { chapters, counts, license, source } = data;
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
const byBook = new Map();
for (const [key, value] of Object.entries(chapters)) {
  const [book, chapter] = key.split(':');
  if (!byBook.has(book)) byBook.set(book, {});
  byBook.get(book)[chapter] = value;
}
if (byBook.size !== 66) fail(`expected 66 books, found ${byBook.size}`);
for (const [book, bookChapters] of byBook) writeFileSync(resolve(OUT_DIR, `${book}.json`), JSON.stringify({ book: Number(book), source: source.url, license, chapters: bookChapters }));
console.log(`publish-bsb-annotations: ${counts.headings} headings, ${counts.footnotes} footnotes for ${counts.chapters} chapters`);
