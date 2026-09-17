const {BOOKS}=await import(new URL('../public/bible.js',import.meta.url));
if(BOOKS.length!==66||new Set(BOOKS).size!==66)throw new Error(`canonical Bible index must contain 66 unique books, got ${BOOKS.length}`);
if(BOOKS[13]!=='2 Chronicles'||BOOKS[42]!=='John'||BOOKS[65]!=='Revelation')throw new Error('canonical Bible book numbering is misaligned');
console.log('canonical 66-book Bible index gate passed');
