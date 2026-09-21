import {readFile} from 'node:fs/promises';

const {BOOKS}=await import(new URL('../public/bible.js',import.meta.url));
if(BOOKS.length!==66||new Set(BOOKS).size!==66)throw new Error(`canonical Bible index must contain 66 unique books, got ${BOOKS.length}`);
if(BOOKS[13]!=='2 Chronicles'||BOOKS[42]!=='John'||BOOKS[65]!=='Revelation')throw new Error('canonical Bible book numbering is misaligned');

const bible=await readFile('public/bible.js','utf8');
for(const marker of ['bibleLandingHeader','The Canonical Shelf','data-book-drawer','aria-modal="true"','bibleContextHref','data-book-drawer-close']){
  if(!bible.includes(marker))throw new Error(`original Bible drawer contract missing ${marker}`);
}
if(!bible.includes('view=shelf&book=${book.n}&profile=1'))throw new Error('bookshelf spines must open details in shelf context');

const styles=await readFile('public/bible.css','utf8');
for(const marker of ['.bible-identity','.book-drawer-scrim','.book-drawer__facts','body.book-drawer-active']){
  if(!styles.includes(marker))throw new Error(`Bible identity/drawer styles missing ${marker}`);
}

console.log('canonical 66-book Bible index + original shelf/drawer gate passed');
