import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import * as XLSX from 'xlsx';
import { Database } from 'bun:sqlite';

const SOURCE_PATH = resolve(process.cwd(), 'data/source/bsb_concordance.xlsx');
const SQLITE_OUT = resolve(process.cwd(), 'data/concordance.db');
const JSON_OUT = resolve(process.cwd(), 'public/data/concordance.json');

// Canonical 66-book dictionary mapping all abbreviations and full names
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

const CLIENT_STOP_WORDS = new Set([
  'the', 'and', 'of', 'to', 'that', 'in', 'he', 'shall', 'unto', 'for',
  'with', 'a', 'is', 'his', 'they', 'be', 'not', 'him', 'them', 'it',
  'all', 'as', 'at', 'by', 'from', 'this', 'was', 'were', 'but', 'on'
]);

function cleanWord(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim();
}

function normalizeBook(val) {
  if (!val) return null;
  const num = parseInt(val, 10);
  if (!isNaN(num) && num >= 1 && num <= 66) return num;
  const key = String(val).toLowerCase().replace(/[^a-z0-9]/g, '');
  return BOOK_MAP[key] || null;
}

function parseHeadword(entryStr) {
  if (!entryStr) return '';
  return String(entryStr)
    .replace(/\s*\(\d+\s*occurrences?\)/i, '')
    .trim();
}

function run() {
  console.log(`[1/4] Reading Excel workbook: ${SOURCE_PATH}`);
  const workbook = XLSX.readFile(SOURCE_PATH, { dense: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  console.log(`[2/4] Initializing SQLite database: ${SQLITE_OUT}`);
  for (const ext of ['', '-wal', '-shm']) {
    const p = SQLITE_OUT + ext;
    if (existsSync(p)) rmSync(p, { force: true });
  }
  mkdirSync(dirname(SQLITE_OUT), { recursive: true });

  const db = new Database(SQLITE_OUT);
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA synchronous = NORMAL;');
  db.run('DROP TABLE IF EXISTS entries;');
  db.run(`
    CREATE TABLE entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      headword TEXT NOT NULL,
      headword_clean TEXT NOT NULL,
      word TEXT,
      book INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      reference TEXT NOT NULL,
      context TEXT
    );
  `);

  const insertStmt = db.prepare(`
    INSERT INTO entries (headword, headword_clean, word, book, chapter, verse, reference, context)
    VALUES ($headword, $headword_clean, $word, $book, $chapter, $verse, $reference, $context)
  `);

  const clientIndex = Object.create(null);
  let currentHeadword = '';
  let totalOccurrences = 0;
  let totalHeadwords = 0;

  console.log(`[3/4] Ingesting ${rows.length} rows with stateful headword extraction...`);
  db.transaction(() => {
    // Row 0 = license notice, Row 1 = column headers; data starts at index 2
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const rawBook = row[1];
      const rawChap = row[2];
      const rawWord = row[3];
      const rawEntry = row[6];
      const rawVerse = row[7];
      const rawContext = row[8];

      if (rawEntry) {
        const parsed = parseHeadword(rawEntry);
        if (parsed && parsed !== currentHeadword) {
          currentHeadword = parsed;
          totalHeadwords++;
        }
      }

      // Skip headword summary rows or empty rows
      if (!rawBook || rawChap === undefined || rawVerse === undefined) {
        continue;
      }

      const bookNum = normalizeBook(rawBook);
      const chapter = parseInt(rawChap, 10);
      const verse = parseInt(rawVerse, 10);

      if (!bookNum || isNaN(chapter) || isNaN(verse)) {
        continue;
      }

      const headword = currentHeadword || String(rawWord || '').trim();
      const headwordClean = cleanWord(headword);
      const wordStr = rawWord ? String(rawWord).trim() : headword;
      const contextStr = rawContext ? String(rawContext).trim() : '';
      const referenceStr = `${bookNum}:${chapter}:${verse}`;

      insertStmt.run({
        $headword: headword,$headword_clean: headwordClean,
        $word: wordStr,$book: bookNum,
        $chapter: chapter,$verse: verse,
        $reference: referenceStr,$context: contextStr
      });

      if (headwordClean) {
        if (!clientIndex[headwordClean]) {
          clientIndex[headwordClean] = { count: 0, refs: [] };
        }
        clientIndex[headwordClean].count += 1;

        if (!CLIENT_STOP_WORDS.has(headwordClean)) {
          clientIndex[headwordClean].refs.push([bookNum, chapter, verse]);
        }
      }

      totalOccurrences++;
    }
  })();

  console.log(`[4/4] Generating indexes and writing client payload...`);
  db.run('CREATE INDEX idx_entries_headword_clean ON entries(headword_clean);');
  db.run('CREATE INDEX idx_entries_coords ON entries(book, chapter, verse);');
  db.run('CREATE INDEX idx_entries_word ON entries(word);');
  db.close();

  mkdirSync(dirname(JSON_OUT), { recursive: true });
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    totalHeadwords,
    totalOccurrences,
    termsCount: Object.keys(clientIndex).length,
    terms: clientIndex
  };

  writeFileSync(JSON_OUT, JSON.stringify(payload), 'utf8');

  console.log('\n--- Concordance Conversion Complete ---');
  console.log(`Total Headwords Processed : ${totalHeadwords}`);
  console.log(`Total Verses Indexed       : ${totalOccurrences}`);
  console.log(`Unique Terms in Client JSON: ${payload.termsCount}`);
  console.log(`SQLite Database            : ${SQLITE_OUT}`);
  console.log(`Client Search Index        : ${JSON_OUT}`);
}

run();
