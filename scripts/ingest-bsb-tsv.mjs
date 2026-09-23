import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { Database } from 'bun:sqlite';

const SOURCE_TSV = resolve(process.cwd(), 'data/source/bsb_tables.tsv');
const SQLITE_OUT = resolve(process.cwd(), 'data/bible.db');
const CHAPTERS_DIR = resolve(process.cwd(), 'public/data/bible');
const MANIFEST_OUT = resolve(process.cwd(), 'public/data/canon-structure.json');

const BOOK_MAP = {
  genesis: 1, gen: 1, gn: 1, ge: 1,
  exodus: 2, exod: 2, exo: 2, ex: 2,
  leviticus: 3, lev: 3, le: 3, lv: 3,
  numbers: 4, num: 4, nu: 4, nm: 4, nb: 4,
  deuteronomy: 5, deut: 5, deu: 5, dt: 5,
  joshua: 6, josh: 6, jos: 6, jsh: 6,
  judges: 7, judg: 7, jdg: 7, jg: 7, jdgs: 7,
  ruth: 8, rth: 8, ru: 8,
  '1samuel': 9, '1sam': 9, '1sa': 9, '1s': 9, '1sm': 9,
  '2samuel': 10, '2sam': 10, '2sa': 10, '2s': 10, '2sm': 10,
  '1kings': 11, '1kgs': 11, '1kg': 11, '1ki': 11, '1k': 11,
  '2kings': 12, '2kgs': 12, '2kg': 12, '2ki': 12, '2k': 12,
  '1chronicles': 13, '1chron': 13, '1chr': 13, '1ch': 13,
  '2chronicles': 14, '2chron': 14, '2chr': 14, '2ch': 14,
  ezra: 15, ezr: 15, ez: 15,
  nehemiah: 16, nehem: 16, neh: 16, ne: 16,
  esther: 17, esth: 17, est: 17, es: 17,
  job: 18, jb: 18,
  psalms: 19, psalm: 19, psa: 19, ps: 19, pss: 19, psm: 19,
  proverbs: 20, prov: 20, pro: 20, prv: 20, pr: 20,
  ecclesiastes: 21, eccl: 21, ecc: 21, ec: 21, qoh: 21, qoheleth: 21,
  songofsolomon: 22, songofsongs: 22, song: 22, songs: 22, sos: 22, canticles: 22, cant: 22, sng: 22, so: 22, sol: 22,
  isaiah: 23, isa: 23, is: 23,
  jeremiah: 24, jer: 24, je: 24, jr: 24,
  lamentations: 25, lam: 25, la: 25,
  ezekiel: 26, ezek: 26, eze: 26, ezk: 26,
  daniel: 27, dan: 27, da: 27, dn: 27,
  hosea: 28, hos: 28, ho: 28,
  joel: 29, joe: 29, jl: 29, jle: 29,
  amos: 30, amo: 30, am: 30,
  obadiah: 31, obad: 31, oba: 31, ob: 31,
  jonah: 32, jona: 32, jon: 32, jnh: 32,
  micah: 33, mic: 33, mc: 33,
  nahum: 34, nah: 34, na: 34,
  habakkuk: 35, hab: 35, hb: 35,
  zephaniah: 36, zeph: 36, zep: 36, zp: 36,
  haggai: 37, hagg: 37, hag: 37, hg: 37,
  zechariah: 38, zech: 38, zec: 38, zc: 38,
  malachi: 39, mal: 39, ml: 39,
  matthew: 40, matt: 40, mat: 40, mt: 40,
  mark: 41, mrk: 41, mar: 41, mk: 41,
  luke: 42, luk: 42, lu: 42, lk: 42,
  john: 43, jhn: 43, joh: 43, jn: 43,
  acts: 44, act: 44, ac: 44,
  romans: 45, rom: 45, ro: 45, rm: 45,
  '1corinthians': 46, '1cor': 46, '1co': 46, '1c': 46,
  '2corinthians': 47, '2cor': 47, '2co': 47, '2c': 47,
  galatians: 48, gal: 48, ga: 48,
  ephesians: 49, ephes: 49, eph: 49, ep: 49,
  philippians: 50, phil: 50, php: 50, phi: 50, pp: 50,
  colossians: 51, col: 51, co: 51,
  '1thessalonians': 52, '1thess': 52, '1th': 52, '1ts': 52,
  '2thessalonians': 53, '2thess': 53, '2th': 53, '2ts': 53,
  '1timothy': 54, '1tim': 54, '1ti': 54, '1tm': 54,
  '2timothy': 55, '2tim': 55, '2ti': 55, '2tm': 55,
  titus: 56, tit: 56, ti: 56,
  philemon: 57, philem: 57, phlm: 57, phm: 57, pm: 57,
  hebrews: 58, hebr: 58, heb: 58, he: 58,
  james: 59, jas: 59, jam: 59, jm: 59,
  '1peter': 60, '1pet': 60, '1pe': 60, '1pt': 60, '1p': 60,
  '2peter': 61, '2pet': 61, '2pe': 61, '2pt': 61, '2p': 61,
  '1john': 62, '1jhn': 62, '1joh': 62, '1jn': 62, '1j': 62,
  '2john': 63, '2jhn': 63, '2joh': 63, '2jn': 63, '2j': 63,
  '3john': 64, '3jhn': 64, '3joh': 64, '3jn': 64, '3j': 64,
  jude: 65, jud: 65, jd: 65,
  revelation: 66, rev: 66, re: 66, rv: 66
};

function normalizeBook(val) {
  if (!val) return null;
  const trimmed = String(val).trim();
  // Strictly numeric strings only
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (num >= 1 && num <= 66) return num;
  }
  const key = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
  return BOOK_MAP[key] || null;
}

function parseVerseId(verseIdStr) {
  if (!verseIdStr) return null;
  const m = String(verseIdStr).trim().match(/^((?:\d\s+)?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s+(\d+)[:.](\d+)/i);
  if (!m) return null;
  const book = normalizeBook(m[1]);
  if (!book) return null;
  return {
    book,
    chapter: parseInt(m[2], 10),
    verse: parseInt(m[3], 10),
    ref: `${book}:${m[2]}:${m[3]}`
  };
}

function cleanHtml(str) {
  if (!str) return null;
  const clean = String(str)
    .replace(/<[^>]+>/g, '')
    .replace(/\|/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > 0 ? clean : null;
}

function run() {
  console.log(`[1/4] Loading BSB Interlinear Table: ${SOURCE_TSV}`);
  let raw = readFileSync(SOURCE_TSV, 'utf8');
  if (raw.charCodeAt(0) === 0xFEFF) {
    raw = raw.slice(1);
  }
  const lines = raw.split(/\r?\n/);

  console.log(`[2/4] Initializing SQLite database: ${SQLITE_OUT}`);
  for (const ext of ['', '-wal', '-shm']) {
    const p = SQLITE_OUT + ext;
    if (existsSync(p)) rmSync(p, { force: true });
  }
  mkdirSync(dirname(SQLITE_OUT), { recursive: true });
  mkdirSync(CHAPTERS_DIR, { recursive: true });

  const db = new Database(SQLITE_OUT);
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA synchronous = NORMAL;');
  db.run('DROP TABLE IF EXISTS verses;');
  db.run(`
    CREATE TABLE verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      reference TEXT NOT NULL,
      text TEXT NOT NULL,
      heading TEXT,
      crossref TEXT
    );
  `);

  const insertStmt = db.prepare(`
    INSERT INTO verses (book, chapter, verse, reference, text, heading, crossref)
    VALUES ($book, $chapter, $verse, $reference, $text, $heading, $crossref)
  `);

  const chaptersMap = new Map();
  const canonStructure = {};
  let totalVerses = 0;

  let currentVerse = null;

  function flushVerse() {
    if (!currentVerse) return;
    const text = currentVerse.tokens
      .join(' ')
      .replace(/\s+([,.:;?!’”"])/g, '$1')
      .replace(/([‘“"])\s+/g, '$1')
      .trim();

    if (text.length > 0) {
      insertStmt.run({
        $book: currentVerse.book,
        $chapter: currentVerse.chapter,
        $verse: currentVerse.verse,
        $reference: currentVerse.reference,
        $text: text,$heading: currentVerse.heading,
        $crossref: currentVerse.crossref
      });

      const chKey = `${currentVerse.book}_${currentVerse.chapter}`;
      if (!chaptersMap.has(chKey)) {
        chaptersMap.set(chKey, {
          book: currentVerse.book,
          chapter: currentVerse.chapter,
          verses: []
        });
      }
      chaptersMap.get(chKey).verses.push({
        verse: currentVerse.verse,
        text,
        heading: currentVerse.heading,
        crossref: currentVerse.crossref
      });

      const b = currentVerse.book;
      const c = currentVerse.chapter;
      const v = currentVerse.verse;
      if (!canonStructure[b]) {
        canonStructure[b] = { maxChapter: c, chapterVerses: {} };
      }
      if (c > canonStructure[b].maxChapter) {
        canonStructure[b].maxChapter = c;
      }
      canonStructure[b].chapterVerses[c] = Math.max(
        canonStructure[b].chapterVerses[c] || 0,
        v
      );

      totalVerses++;
    }
    currentVerse = null;
  }

  console.log(`[3/4] Parsing interlinear tokens and rebuilding verses...`);
  db.transaction(() => {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const cols = line.split('\t');
      if (cols.length < 19) continue;

      const verseIdRaw = cols[12]?.trim();
      const hdgRaw = cols[13];
      const crossRaw = cols[14];
      const begQ = cols[17]?.trim() || '';
      const bsbWordRaw = cols[18];
      const pnc = cols[19]?.trim() || '';
      const endQ = cols[20]?.trim() || '';

      if (verseIdRaw) {
        const parsed = parseVerseId(verseIdRaw);
        if (parsed) {
          flushVerse();
          currentVerse = {
            book: parsed.book,
            chapter: parsed.chapter,
            verse: parsed.verse,
            reference: parsed.ref,
            heading: cleanHtml(hdgRaw),
            crossref: cleanHtml(crossRaw),
            tokens: []
          };
        }
      }

      if (!currentVerse) continue;

      const rawWord = (bsbWordRaw || '').trim();
      // Skip null translation placeholders, untranslated markers, and BSB "vvv" tags
      if (!rawWord || rawWord === '-' || rawWord.toLowerCase() === 'vvv') {
        continue;
      }

      const word = rawWord.replace(/\bvvv\b/gi, '').trim();
      if (!word) continue;

      const token = `${begQ}${word}${pnc}${endQ}`;
      currentVerse.tokens.push(token);
    }
    flushVerse();
  })();

  console.log(`[4/4] Generating FTS5 index, static chapter files, and manifest...`);
  db.run('CREATE INDEX idx_verses_lookup ON verses(book, chapter, verse);');
  db.run('CREATE INDEX idx_verses_ref ON verses(reference);');
  db.run('DROP TABLE IF EXISTS verses_fts;');
  db.run(`
    CREATE VIRTUAL TABLE verses_fts USING fts5(
      text,
      heading,
      content='verses',
      content_rowid='id'
    );
  `);
  db.run(`INSERT INTO verses_fts(verses_fts) VALUES('rebuild');`);
  db.close();

  for (const [key, payload] of chaptersMap.entries()) {
    const chapterPath = resolve(CHAPTERS_DIR, `${key}.json`);
    writeFileSync(chapterPath, JSON.stringify(payload), 'utf8');
  }

  mkdirSync(dirname(MANIFEST_OUT), { recursive: true });
  writeFileSync(MANIFEST_OUT, JSON.stringify({
    version: 1,
    generatedAt: new Date().toISOString(),
    totalVerses,
    totalChapters: chaptersMap.size,
    canon: canonStructure
  }, null, 2), 'utf8');

  console.log('\n--- BSB Ingestion Complete ---');
  console.log(`Total Canonical Verses : ${totalVerses}`);
  console.log(`Total Chapters Built   : ${chaptersMap.size}`);
  console.log(`SQLite Database Path   : ${SQLITE_OUT}`);
  console.log(`Static Chapters Path   : ${CHAPTERS_DIR}`);
  console.log(`Canon Manifest Path    : ${MANIFEST_OUT}`);
}

run();
