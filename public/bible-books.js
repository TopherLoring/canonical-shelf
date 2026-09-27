// Protestant 66-book canon in order: index + 1 = book number. OSIS abbreviations match OpenBible
// cross-references and the data dictionary's `osis` anchors (e.g. John.3.16).
export const OSIS = ['Gen','Exod','Lev','Num','Deut','Josh','Judg','Ruth','1Sam','2Sam','1Kgs','2Kgs','1Chr','2Chr','Ezra','Neh','Esth','Job','Ps','Prov','Eccl','Song','Isa','Jer','Lam','Ezek','Dan','Hos','Joel','Amos','Obad','Jonah','Mic','Nah','Hab','Zeph','Hag','Zech','Mal','Matt','Mark','Luke','John','Acts','Rom','1Cor','2Cor','Gal','Eph','Phil','Col','1Thess','2Thess','1Tim','2Tim','Titus','Phlm','Heb','Jas','1Pet','2Pet','1John','2John','3John','Jude','Rev'];
export const BOOK_BY_OSIS = new Map(OSIS.map((o, i) => [o, i + 1]));

// PassageAddress {book, chapter, verseStart, verseEnd} -> 'John.3.16-18'
export function osisOf({ book, chapter, verseStart, verseEnd }) {
  const base = `${OSIS[book - 1]}.${chapter}`;
  if (!verseStart) return base;
  return verseEnd && verseEnd > verseStart ? `${base}.${verseStart}-${verseEnd}` : `${base}.${verseStart}`;
}

// 'John.3.16-18' -> PassageAddress, or null
export function parseOsis(value) {
  const m = String(value || '').match(/^([1-3]?[A-Za-z]+)\.(\d+)(?:\.(\d+)(?:-(\d+))?)?$/);
  if (!m || !BOOK_BY_OSIS.has(m[1])) return null;
  return { book: BOOK_BY_OSIS.get(m[1]), chapter: Number(m[2]), verseStart: m[3] ? Number(m[3]) : null, verseEnd: m[4] ? Number(m[4]) : (m[3] ? Number(m[3]) : null) };
}
