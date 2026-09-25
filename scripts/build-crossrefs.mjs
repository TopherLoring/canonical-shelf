// Builds per-chapter cross-reference shards for the Bible reader from the
// committed OpenBible.info snapshot. Runs in CI via prepare:content, so the
// reader's /data/crossref/{book}_{chapter}.json requests resolve in production.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { resolve } from 'node:path';

const SOURCE = resolve(process.cwd(), 'content/vendor/openbible/cross-references.txt.gz');
const OUT_DIR = resolve(process.cwd(), 'public/data/crossref');
const MIN_VOTES = 3;      // drops low-confidence community links
const MAX_PER_VERSE = 15; // keeps each verse's list readable

const BOOKS = ['Gen','Exod','Lev','Num','Deut','Josh','Judg','Ruth','1Sam','2Sam','1Kgs','2Kgs','1Chr','2Chr','Ezra','Neh','Esth','Job','Ps','Prov','Eccl','Song','Isa','Jer','Lam','Ezek','Dan','Hos','Joel','Amos','Obad','Jonah','Mic','Nah','Hab','Zeph','Hag','Zech','Mal','Matt','Mark','Luke','John','Acts','Rom','1Cor','2Cor','Gal','Eph','Phil','Col','1Thess','2Thess','1Tim','2Tim','Titus','Phlm','Heb','Jas','1Pet','2Pet','1John','2John','3John','Jude','Rev'];
const BOOK_NUMBER = new Map(BOOKS.map((b, i) => [b, i + 1]));

function parseVerse(token) {
  const [book, chapter, verse] = token.split('.');
  const n = BOOK_NUMBER.get(book);
  if (!n || !chapter || !verse) throw new Error(`Unrecognized reference: ${token}`);
  return [n, Number(chapter), Number(verse)];
}

function parseTarget(token) {
  const [startToken, endToken] = token.split('-');
  const [b, c, v] = parseVerse(startToken);
  if (!endToken) return [b, c, v, v];
  const [eb, ec, ev] = parseVerse(endToken);
  // Ranges crossing a chapter or book are linked at their start verse.
  return eb === b && ec === c ? [b, c, v, ev] : [b, c, v, v];
}

const lines = gunzipSync(readFileSync(SOURCE)).toString('utf8').split('\n');
const chapters = new Map();
let kept = 0;
let skipped = 0;

for (const line of lines.slice(1)) {
  if (!line.trim()) continue;
  const [from, to, votesRaw] = line.split('\t');
  const votes = Number(votesRaw);
  if (!(votes >= MIN_VOTES)) { skipped++; continue; }
  const [b, c, v] = parseVerse(from);
  const key = `${b}_${c}`;
  if (!chapters.has(key)) chapters.set(key, {});
  const verses = chapters.get(key);
  (verses[v] ||= []).push({ ref: parseTarget(to), votes });
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
for (const [key, verses] of chapters) {
  for (const v of Object.keys(verses)) {
    verses[v] = verses[v]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, MAX_PER_VERSE)
      .map(({ ref }) => ({ ref }));
    kept += verses[v].length;
  }
  writeFileSync(resolve(OUT_DIR, `${key}.json`), JSON.stringify({
    version: 2,
    chapter: key,
    source: 'OpenBible.info (CC-BY)',
    verses
  }), 'utf8');
}

console.log(`cross-references: ${kept} links across ${chapters.size} chapters (min votes ${MIN_VOTES}, max ${MAX_PER_VERSE}/verse; ${skipped} low-vote rows dropped)`);
