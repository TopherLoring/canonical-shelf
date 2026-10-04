// Vendors the Berean Standard Bible's reading apparatus — section headings, paragraph and poetry starts, and
// translator footnotes — from the pinned source table into content/vendor/bsb/annotations.json.
//
// The reading text itself stays content/vendor/legacy/corpus.txt (the hash-locked authority). This file only adds
// the presentation the printed BSB carries around that text, keyed by book, chapter and verse, so builds and CI
// never need the 85 MB source table. Re-run only when the pinned source changes:
//
//   bun run data:fetch bsb_tables.tsv && bun scripts/vendor-bsb-annotations.mjs
//
// Every footnote is anchored to the BSB words it follows, and every anchor is checked against the corpus text;
// the script fails if any heading, paragraph or footnote points at a verse or phrase the corpus does not contain.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { OSIS } from './lib/bible-books.mjs';

const root = process.cwd();
const TSV = resolve(root, 'data/source/bsb_tables.tsv');
const CORPUS = resolve(root, 'content/vendor/legacy/corpus.txt');
const OUT_DIR = resolve(root, 'content/vendor/bsb');
const OUT = resolve(OUT_DIR, 'annotations.json');
const PINNED_SHA = '09bbee6f9fe4fa22b5df28e8a9ffa99bf9c33435f4eb8c47c2dc221d855d35cb';
const fail = msg => { console.error(`vendor-bsb-annotations: ${msg}`); process.exit(1); };

if (!existsSync(TSV)) fail('data/source/bsb_tables.tsv missing. Run: bun run data:fetch bsb_tables.tsv');
const raw = readFileSync(TSV);
const sha = createHash('sha256').update(raw).digest('hex');
if (sha !== PINNED_SHA) fail(`bsb_tables.tsv hash ${sha} does not match the pin in scripts/fetch-bsb-sources.mjs`);

// Book names as the table writes them ("1 Samuel 3:4", "Song of Solomon 2:1", "Psalm 23:1").
const NAMES = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
const BOOK = new Map(NAMES.map((n, i) => [n, i + 1]));
BOOK.set('Psalms', 19);
if (NAMES.length !== 66 || OSIS.length !== 66) fail('book table is not 66 books');

function parseVerseId(s) {
  const m = String(s || '').trim().match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!m || !BOOK.has(m[1])) return null;
  return { book: BOOK.get(m[1]), chapter: Number(m[2]), verse: Number(m[3]) };
}

// Footnotes keep italics only; every other tag is dropped and entities are decoded.
function cleanNote(s) {
  return String(s || '')
    .replace(/<i>/gi, '\u0001').replace(/<\/i>/gi, '\u0002')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim()
    .replace(/\u0001/g, '<i>').replace(/\u0002/g, '</i>');
}
const cleanText = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// Headings: the table carries one or more <p class=|hdg|> (and subheading) blocks before a verse.
function headingsOf(cell) {
  const out = [];
  const re = /<p class=\|(hdg|subhdg|suphdg|pshdg|ihdg|acrostic)\|>([\s\S]*?)(?=<p class=|<br|$)/g;
  let m;
  while ((m = re.exec(String(cell || '')))) {
    const text = cleanText(m[2]);
    if (text) out.push({ kind: m[1] === 'hdg' ? 'section' : m[1], text });
  }
  return out;
}

// Paragraph kinds. "reg" starts a prose paragraph; indent/list/selah kinds start a poetry or list line.
const PAR_KIND = { reg: 'prose', indent1: 'poetry', indent2: 'poetry2', indent1stline: 'prose', list1: 'list', list1stline: 'list', selah: 'selah', tab1stline: 'prose', red: 'prose' };
function parOf(cell) {
  const m = String(cell || '').match(/<p class=\|([a-z0-9]+)\|>/);
  return m ? (PAR_KIND[m[1]] || 'prose') : null;
}

// Pass 1: gather tokens per verse in the table's order, keeping the English sort for anchoring.
const lines = raw.toString('utf8').split('\n');
const header = lines[0].split('\t').map(s => s.trim());
const col = name => { const i = header.indexOf(name); if (i < 0) fail(`column "${name}" missing from bsb_tables.tsv`); return i; };
const C = { sort: col('BSB Sort'), verseId: col('VerseId'), hdg: col('Hdg'), par: col('Par'), word: col('BSB version'), notes: col('footnotes') };

const verses = new Map(); // "b:c:v" -> { book, chapter, verse, headings, tokens: [{ sort, par, word, note }] }
let current = null;
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].replace(/\r$/, '').split('\t');
  if (cols.length <= C.notes) continue;
  const id = cols[C.verseId]?.trim();
  if (id) {
    const v = parseVerseId(id);
    if (!v) fail(`unreadable verse id "${id}" on line ${i + 1}`);
    const key = `${v.book}:${v.chapter}:${v.verse}`;
    current = verses.get(key) || { ...v, headings: [], tokens: [] };
    current.headings.push(...headingsOf(cols[C.hdg]));
    verses.set(key, current);
  }
  if (!current) continue;
  const sort = Number(cols[C.sort]);
  current.tokens.push({ sort: Number.isFinite(sort) ? sort : Number.MAX_SAFE_INTEGER, par: parOf(cols[C.par]), word: cleanText(cols[C.word]), note: cleanNote(cols[C.notes]) });
}

// Corpus: the authority every anchor is checked against.
const corpus = new Map();
for (const line of readFileSync(CORPUS, 'utf8').split('\n')) {
  const [b, c, v, ...rest] = line.split('\t');
  if (b && c && v && rest.length) corpus.set(`${Number(b)}:${Number(c)}:${Number(v)}`, rest.join('\t'));
}

// Pass 2: per chapter, record headings, paragraph starts and anchored footnotes.
const chapters = {};
let headingCount = 0, paragraphCount = 0, noteCount = 0, unanchored = 0;
const missing = [];
for (const [key, v] of verses) {
  const text = corpus.get(key);
  if (text === undefined) { if (v.headings.length || v.tokens.some(t => t.note)) missing.push(key); continue; }
  const ck = `${v.book}:${v.chapter}`;
  const ch = chapters[ck] ||= {};
  if (v.headings.length) { (ch.h ||= {})[v.verse] = v.headings; headingCount += v.headings.length; }
  const ordered = [...v.tokens].sort((a, b) => a.sort - b.sort);
  const first = ordered.find(t => t.word || t.par);
  if (first?.par) { (ch.p ||= {})[v.verse] = first.par; paragraphCount++; }
  // Footnote anchors: walk the English order and find each footnoted word after the previous anchor.
  let cursor = 0;
  const notes = [];
  for (const t of ordered) {
    const word = t.word.replace(/^[\s"“‘'(\[]+|[\s"”’'),;:.!?\]]+$/g, '');
    let at = -1;
    if (word) {
      at = text.indexOf(word, cursor);
      if (at < 0) at = text.indexOf(word);
      if (at >= 0) cursor = at + word.length;
    }
    if (!t.note) continue;
    if (at < 0) { unanchored++; notes.push({ at: text.length, text: t.note }); }
    else notes.push({ at: at + word.length, text: t.note });
    noteCount++;
  }
  if (notes.length) (ch.f ||= {})[v.verse] = notes;
}
if (missing.length) fail(`${missing.length} annotated verses are not in the corpus (first: ${missing.slice(0, 5).join(', ')})`);

mkdirSync(OUT_DIR, { recursive: true });
const out = {
  about: 'Berean Standard Bible reading apparatus: section headings (h), paragraph and poetry line starts (p), and translator footnotes (f, anchored at a character offset into the corpus verse text). Keyed "book:chapter", then verse.',
  source: { file: 'data/source/bsb_tables.tsv', url: 'https://bereanbible.com/bsb_tables.tsv', sha256: sha },
  corpus: { file: 'content/vendor/legacy/corpus.txt', sha256: createHash('sha256').update(readFileSync(CORPUS)).digest('hex') },
  license: 'The Berean Standard Bible is dedicated to the public domain.',
  counts: { chapters: Object.keys(chapters).length, headings: headingCount, paragraphs: paragraphCount, footnotes: noteCount, footnotesAtVerseEnd: unanchored },
  chapters
};
writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(`vendor-bsb-annotations: ${out.counts.chapters} chapters, ${headingCount} headings, ${paragraphCount} paragraph starts, ${noteCount} footnotes (${unanchored} placed at verse end)`);
