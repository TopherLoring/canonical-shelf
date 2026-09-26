// Compiles the Berean Standard Bible into one machine-readable JSON file: public/data/bsb.json.
// Reading text comes from public/data/corpus.txt (the hash-locked authority); section headings come from
// data/bible.db (built by data:ingest:bsb from the pinned TSV); book metadata from public/library-data.js.
// Field names follow docs/v7/data-dictionary.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { Database } from 'bun:sqlite';
import { LIBRARY_BOOKS } from '../public/library-data.js';
import { OSIS } from './lib/bible-books.mjs';

const root = process.cwd();
const CORPUS = resolve(root, 'public/data/corpus.txt');
const DB = resolve(root, 'data/bible.db');
const TSV = resolve(root, 'data/source/bsb_tables.tsv');
const OUT = resolve(root, 'public/data/bsb.json');
const fail = msg => { console.error(`build-bsb-json: ${msg}`); process.exit(1); };
if (!existsSync(DB)) fail('data/bible.db missing. Run: bun run data:fetch && bun run data:ingest:bsb');

const sha = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const headings = new Map();
const db = new Database(DB, { readonly: true });
for (const r of db.query("SELECT book, chapter, verse, heading FROM verses WHERE heading IS NOT NULL AND heading <> ''").all()) headings.set(`${r.book}:${r.chapter}:${r.verse}`, r.heading.trim());
const dbCount = db.query('SELECT COUNT(*) AS c FROM verses').get().c;

if (LIBRARY_BOOKS.length !== 66) fail(`expected 66 books in library-data.js, found ${LIBRARY_BOOKS.length}`);
const books = LIBRARY_BOOKS.map(b => ({ book: b.n, osis: OSIS[b.n - 1], name: b.name, testament: b.n <= 39 ? 'OT' : 'NT', category: b.cat, chaptersCount: b.ch, chapters: [] }));

let verses = 0, lastKey = [0, 0, 0];
for (const line of readFileSync(CORPUS, 'utf8').split('\n')) {
  if (!line) continue;
  const [bs, cs, vs, ...rest] = line.split('\t');
  const book = Number(bs), chapter = Number(cs), verse = Number(vs), text = rest.join('\t');
  if (!book || !chapter || !verse || !text) fail(`malformed corpus line: ${line.slice(0, 60)}`);
  const [lb, lc, lv] = lastKey;
  if (book < lb || (book === lb && chapter < lc) || (book === lb && chapter === lc && verse <= lv)) fail(`corpus out of order at ${book}:${chapter}:${verse}`);
  lastKey = [book, chapter, verse];
  const b = books[book - 1];
  let ch = b.chapters.at(-1);
  if (!ch || ch.chapter !== chapter) { ch = { chapter, verses: [] }; b.chapters.push(ch); }
  const h = headings.get(`${book}:${chapter}:${verse}`);
  ch.verses.push(h ? { verse, heading: h, text } : { verse, text });
  verses++;
}
for (const b of books) if (b.chapters.length !== b.chaptersCount) fail(`${b.name}: ${b.chapters.length} chapters in corpus, ${b.chaptersCount} in library-data`);
if (verses !== dbCount) fail(`corpus has ${verses} verses, bible.db has ${dbCount}`);

const out = {
  translation: { id: 'BSB', name: 'Berean Standard Bible', license: 'Public domain (dedicated by the Berean Bible publishers, 2023)' },
  canon: 'Protestant, 66 books',
  sources: { text: { path: 'public/data/corpus.txt', sha256: sha(CORPUS) }, headings: { path: 'data/source/bsb_tables.tsv', sha256: existsSync(TSV) ? sha(TSV) : null } },
  counts: { books: 66, chapters: books.reduce((n, b) => n + b.chapters.length, 0), verses, headings: headings.size },
  books
};
writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(`bsb.json: ${out.counts.books} books, ${out.counts.chapters} chapters, ${verses} verses, ${headings.size} headings`);
