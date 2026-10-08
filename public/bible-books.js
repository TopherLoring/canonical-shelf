import {LIBRARY_BOOKS,CATEGORIES,CATEGORY_ORDER} from './library-data.js';

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

// Book names, shelf groups, corpus parsing and reference parsing (moved from bible.js for the redesign;
// every screen and engine imports them from here).
export const BOOKS=LIBRARY_BOOKS.map(book=>book.name);
export const GROUPS=CATEGORY_ORDER.map(key=>{
  const members=LIBRARY_BOOKS.filter(book=>book.cat===key);
  return [CATEGORIES[key].name,members[0].n,members[members.length-1].n,key];
});

const aliases=new Map();
BOOKS.forEach((book,index)=>{
  const n=index+1;
  for(const alias of [book,book.replace('Song of Solomon','Song'),book.replace('Psalms','Psalm')])aliases.set(alias.toLowerCase(),n);
});
Object.entries({gen:1,ex:2,exod:2,lev:3,num:4,deut:5,josh:6,judg:7,ps:19,psalm:19,prov:20,eccl:21,song:22,isa:23,jer:24,ezek:26,dan:27,matt:40,mk:41,mark:41,lk:42,luke:42,jn:43,john:43,acts:44,rom:45,gal:48,eph:49,phil:50,col:51,heb:58,jas:59,james:59,rev:66}).forEach(([alias,n])=>aliases.set(alias,n));

let parsedFrom=null;
let rows=[];
export function parseCorpus(text){
  if(text===parsedFrom)return rows;
  parsedFrom=text;
  rows=[];
  for(const line of String(text||'').split('\n')){
    const [b,c,v,...rest]=line.split('\t');
    const bn=Number(b),chapter=Number(c),verse=Number(v);
    if(bn&&chapter&&verse&&rest.length)rows.push({bn,chapter,verse,text:rest.join('\t')});
  }
  return rows;
}
export function parseReference(q){
  const s=String(q||'').trim().replace(/\s+/g,' ');
  if(!s)return null;
  const m=s.match(/^(.+?)\s+(\d+)(?::(\d+)(?:[-–](\d+))?)?$/);
  if(!m)return null;
  const bn=aliases.get(m[1].toLowerCase());
  if(!bn)return null;
  return{bn,chapter:Number(m[2]),start:m[3]?Number(m[3]):null,end:m[4]?Number(m[4]):m[3]?Number(m[3]):null};
}
