import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { Database } from 'bun:sqlite';

const BIBLE_DB_PATH = resolve(process.cwd(), 'data/bible.db');
const CROSSREF_DB_PATH = resolve(process.cwd(), 'data/crossref.db');
const CLIENT_OUT_DIR = resolve(process.cwd(), 'public/data/crossref');

if (!existsSync(BIBLE_DB_PATH)) {
  console.error(`[ERROR] Missing ${BIBLE_DB_PATH}. Run scripts/ingest-bsb-tsv.mjs first.`);
  process.exit(1);
}

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

function normalizeBook(name) {
  if (!name) return null;
  const key = String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  return BOOK_MAP[key] || null;
}

// Parses target strings: "Genesis 1:1–3", "John 3:16", "1 Cor 15:3-4"
function parseReferenceText(rawText) {
  const clean = rawText
    .replace(/<[^>]+>/g, '')
    .replace(/[()]/g, '')
    .trim();

  const segments = clean.split(/[;,]/).map(s => s.trim()).filter(Boolean);
  const results = [];
  let lastBook = null;

  for (const seg of segments) {
    // Pattern 1: Full Book Chapter:Verse(s) e.g., "Hebrews 11:1–3"
    const mFull = seg.match(/^((?:\d\s+)?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s+(\d+)[:.](\d+)(?:[–-](\d+))?/i);
    if (mFull) {
      const book = normalizeBook(mFull[1]);
      if (book) {
        lastBook = book;
        const ch = parseInt(mFull[2], 10);
        const vs = parseInt(mFull[3], 10);
        const ve = mFull[4] ? parseInt(mFull[4], 10) : vs;
        results.push({ book, chapter: ch, verseStart: vs, verseEnd: ve, display: seg });
        continue;
      }
    }

    // Pattern 2: Successive Chapter:Verse under same book context e.g., "12:1–2"
    const mPartial = seg.match(/^(\d+)[:.](\d+)(?:[–-](\d+))?/);
    if (mPartial && lastBook) {
      const ch = parseInt(mPartial[1], 10);
      const vs = parseInt(mPartial[2], 10);
      const ve = mPartial[3] ? parseInt(mPartial[3], 10) : vs;
      results.push({ book: lastBook, chapter: ch, verseStart: vs, verseEnd: ve, display: seg });
    }
  }

  return results;
}

function run() {
  console.log('[1/4] Connecting to Scripture Engine...');
  const bibleDb = new Database(BIBLE_DB_PATH);
  const rows = bibleDb.query(
    "SELECT book, chapter, verse, crossref FROM verses WHERE crossref IS NOT NULL AND crossref != ''"
  ).all();
  bibleDb.close();

  console.log(`      Found ${rows.length} verses with apparatus cross-reference records.`);

  console.log('[2/4] Initializing Cross-Reference Database...');
  for (const ext of ['', '-wal', '-shm']) {
    const p = CROSSREF_DB_PATH + ext;
    if (existsSync(p)) rmSync(p, { force: true });
  }
  mkdirSync(dirname(CROSSREF_DB_PATH), { recursive: true });

  const db = new Database(CROSSREF_DB_PATH);
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA synchronous = NORMAL;');
  db.run(`
    CREATE TABLE cross_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_book INTEGER NOT NULL,
      from_chapter INTEGER NOT NULL,
      from_verse INTEGER NOT NULL,
      to_book INTEGER NOT NULL,
      to_chapter INTEGER NOT NULL,
      to_verse_start INTEGER NOT NULL,
      to_verse_end INTEGER NOT NULL,
      display_label TEXT NOT NULL,
      reciprocal INTEGER DEFAULT 0
    );
  `);

  const insertStmt = db.prepare(`
    INSERT INTO cross_references (
      from_book, from_chapter, from_verse,
      to_book, to_chapter, to_verse_start, to_verse_end,
      display_label, reciprocal
    ) VALUES (
      $from_book, $from_chapter, $from_verse,
      $to_book, $to_chapter, $to_verse_start, $to_verse_end,
      $display_label, $reciprocal
    )
  `);

  const chapterPayloads = new Map();
  let totalLinks = 0;

  console.log('[3/4] Parsing cross-references into canonical coordinates...');
  db.transaction(() => {
    for (const row of rows) {
      const parsedLinks = parseReferenceText(row.crossref);
      if (parsedLinks.length === 0) continue;

      const chKey = `${row.book}_${row.chapter}`;
      if (!chapterPayloads.has(chKey)) {
        chapterPayloads.set(chKey, {});
      }
      const chapterObj = chapterPayloads.get(chKey);

      if (!chapterObj[row.verse]) {
        chapterObj[row.verse] = [];
      }

      for (const link of parsedLinks) {
        // Insert forward relationship
        insertStmt.run({
          $from_book: row.book,
          $from_chapter: row.chapter,
          $from_verse: row.verse,
          $to_book: link.book,
          $to_chapter: link.chapter,
          $to_verse_start: link.verseStart,
          $to_verse_end: link.verseEnd,
          $display_label: link.display,
          $reciprocal: 0
        });

        // Insert reciprocal reverse link for bi-directional traversal
        insertStmt.run({
          $from_book: link.book,
          $from_chapter: link.chapter,
          $from_verse: link.verseStart,
          $to_book: row.book,
          $to_chapter: row.chapter,
          $to_verse_start: row.verse,
          $to_verse_end: row.verse,
          $display_label: `Linked from ${row.book}:${row.chapter}:${row.verse}`,
          $reciprocal: 1
        });

        chapterObj[row.verse].push({
          ref: [link.book, link.chapter, link.verseStart, link.verseEnd],
          label: link.display
        });

        totalLinks++;
      }
    }
  })();

  console.log('[4/4] Indexing database and writing client chapter JSON files...');
  db.run('CREATE INDEX idx_crossref_from ON cross_references(from_book, from_chapter, from_verse);');
  db.run('CREATE INDEX idx_crossref_to ON cross_references(to_book, to_chapter, to_verse_start);');
  db.close();

  mkdirSync(CLIENT_OUT_DIR, { recursive: true });
  for (const [chKey, verses] of chapterPayloads.entries()) {
    writeFileSync(
      resolve(CLIENT_OUT_DIR, `${chKey}.json`),
      JSON.stringify({ version: 1, chapter: chKey, verses }, null, 2),
      'utf8'
    );
  }

  console.log('\n--- Cross-Reference Engine Complete ---');
  console.log(`Forward Links Compiled : ${totalLinks}`);
  console.log(`Chapters Generated     : ${chapterPayloads.size}`);
  console.log(`SQLite Database Path   : ${CROSSREF_DB_PATH}`);
  console.log(`Client Shard Directory : ${CLIENT_OUT_DIR}`);
}

run();
