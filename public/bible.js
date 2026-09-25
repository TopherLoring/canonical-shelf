import {LIBRARY_BOOKS,CATEGORIES,CATEGORY_ORDER,ERAS,TIMELINE_ANCHORS,THREADS,STORY_ARC,searchLibraryBooks} from './library-data.js';

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

const bookByNumber=n=>LIBRARY_BOOKS[n-1]||null;
const chapterRows=(text,bn,chapter)=>parseCorpus(text).filter(row=>row.bn===bn&&row.chapter===chapter);
const chapterCount=(text,bn)=>bookByNumber(bn)?.ch||parseCorpus(text).reduce((max,row)=>row.bn===bn?Math.max(max,row.chapter):max,0);
const year=value=>value===null||value===undefined?'Unplaced':value<0?`${Math.abs(value)} BC`:`AD ${value}`;
const range=(a,b)=>a===undefined?'Not specified':a===b?year(a):`${year(a)}–${year(b)}`;

function bibleNav(active){
  const modes=[['reader','01','Reader'],['shelf','02','Bookshelf'],['books','03','Books & groups'],['timeline','04','Canon & timeline']];
  return `<nav class="bible-mode-map" aria-label="Bible views">${modes.map(([id,n,title])=>`<a href="/bible?view=${id}" ${active===id?'aria-current="page"':''}><span>${n}</span><strong>${title}</strong></a>`).join('')}</nav>`;
}
function bibleLandingHeader(){return `<header class="bible-identity"><p class="eyebrow"><strong>66 books</strong> · full Bible reader · guided learning · interactive practice</p><h1 aria-label="The Canonical Shelf"><span>The Canonical</span><em>Shelf</em></h1><p class="lede">The Bible is not one book — it is a shelf of sixty-six, collected over roughly a thousand years, in several different kinds of writing. Learn the shelf first, then the groups, then what is actually in them.</p></header>`}
function bibleStandardHeader(){return `<header class="section compact-section bible-head"><p class="eyebrow">Scripture · library · context</p><h1>Bible</h1><p class="lede">Browse the shelf, understand each book, read the text, and keep canonical order distinct from historical sequence.</p><form class="search" id="bible-search"><label class="sr-only" for="bq">Reference, word, or phrase</label><input id="bq" name="bq" placeholder="John 3:16 or covenant"><button>Search</button></form></header>`}
function librarySearch(params,esc){const q=params.get('libraryq')||'';return `<form class="library-search" id="library-search"><label for="libraryq">Search books, people, summaries, themes, or groups</label><div><input id="libraryq" name="libraryq" type="search" value="${esc(q)}" placeholder="David, exile, wisdom, covenant…"><button class="button">Search books</button></div></form>`}

function shelf(params,esc){
  const selected=params.get('group')||'all',q=params.get('libraryq')||'';
  const matches=new Set(searchLibraryBooks(q).map(book=>book.n));
  const visible=LIBRARY_BOOKS.filter(book=>(selected==='all'||book.cat===selected)&&matches.has(book.n));
  const byTestament=testament=>visible.filter(book=>CATEGORIES[book.cat].testament===testament);
  const legend=`<div class="shelf-legend" aria-label="Filter shelf by canonical group"><a href="/bible?view=shelf" ${selected==='all'?'aria-current="true"':''}>All 66</a>${CATEGORY_ORDER.map(key=>`<a href="/bible?view=shelf&group=${key}" data-cat="${key}" ${selected===key?'aria-current="true"':''}>${esc(CATEGORIES[key].name)}</a>`).join('')}</div>`;
  const testament=(label,books)=>`<section class="shelf-testament"><div class="shelf-testament__label"><span>${label}</span><strong>${books.length}</strong></div><div class="shelf-board">${books.map(book=>`<a class="shelf-spine" data-cat="${book.cat}" href="/bible?view=shelf&book=${book.n}&profile=1" data-book="${book.n}" style="--chapters:${book.ch}" aria-label="${esc(book.name)}, book ${book.n}, ${book.ch} chapters"><span class="shelf-spine__num">${String(book.n).padStart(2,'0')}</span><strong>${esc(book.name)}</strong><small>${book.ch}</small><span class="shelf-spine__reveal" aria-hidden="true">${esc(book.name)}</span></a>`).join('')||'<p class="notice">No books match this filter.</p>'}</div></section>`;
  return `<section class="canonical-shelf" aria-labelledby="shelf-title"><div class="bible-section-head"><div><p class="eyebrow">The canonical shelf</p><h2 id="shelf-title">Sixty-six books. One library.</h2></div><p>The visual shelf keeps group, position, relative size, and book identity visible together.</p></div>${librarySearch(params,esc)}${legend}<div class="shelf-cabinet">${testament('Old Testament',byTestament('OT'))}${testament('New Testament',byTestament('NT'))}</div><p class="shelf-note">Hover or focus a spine to reveal its full book name. On touch, the first tap reveals the name and a second deliberate tap opens the book. This product uses the 66-book Protestant canon as its primary shelf; Catholic and Orthodox collections differ.</p></section>`;
}

function bookCard(book,esc){const category=CATEGORIES[book.cat];return `<article class="book-profile-card" data-cat="${book.cat}"><span class="book-profile-card__num">${String(book.n).padStart(2,'0')}</span><p class="eyebrow">${esc(category.name)}</p><h3><a href="/bible?view=books&book=${book.n}&profile=1">${esc(book.name)}</a></h3><p class="book-hook">${esc(book.hook)}</p><p>${esc(book.syn)}</p><div class="book-profile-card__meta"><span>${book.ch} chapter${book.ch===1?'':'s'}</span><span>${esc(book.people.slice(0,3).join(' · '))}</span></div></article>`}
function booksView(params,esc){
  const q=params.get('libraryq')||'',selected=params.get('group')||'all';
  const matches=searchLibraryBooks(q).filter(book=>selected==='all'||book.cat===selected);
  return `<section class="books-groups"><div class="bible-section-head"><div><p class="eyebrow">Books & canonical groups</p><h2>Know what you opened before you read it.</h2></div><p>Profiles preserve hook, synopsis, people, setting/writing orientation, themes, and suggested entry points.</p></div>${librarySearch(params,esc)}<div class="shelf-legend"><a href="/bible?view=books" ${selected==='all'?'aria-current="true"':''}>All books</a>${CATEGORY_ORDER.map(key=>`<a href="/bible?view=books&group=${key}" data-cat="${key}" ${selected===key?'aria-current="true"':''}>${esc(CATEGORIES[key].name)}</a>`).join('')}</div><p class="results-count">${matches.length} book${matches.length===1?'':'s'} shown</p><div class="book-profile-grid">${matches.map(book=>bookCard(book,esc)).join('')||'<p class="notice">No books match this search.</p>'}</div></section>`;
}

function evidenceBadge(book){return book.dateUnsure?'<span class="badge">dating disputed</span>':'<span class="badge">broad orientation</span>'}
function bibleContextHref(params,changes={}){const next=new URLSearchParams(params);if(!next.has('view'))next.set('view','reader');for(const [key,value] of Object.entries(changes)){if(value===null||value===undefined||value==='')next.delete(key);else next.set(key,String(value))}return `/bible?${next.toString()}`}
function profileDrawer(text,bn,params,esc){
  const book=bookByNumber(bn);if(!book)return'<p class="notice">Book not found.</p>';
  const category=CATEGORIES[book.cat],era=ERAS.find(item=>item.k===book.era),count=chapterCount(text,bn),closeHref=bibleContextHref(params,{book:null,profile:null,focus:bn}),bookHref=number=>bibleContextHref(params,{book:number,profile:1,focus:null}),chapterLinks=Array.from({length:count},(_,index)=>`<a href="/bible?book=${bn}&chapter=${index+1}">${index+1}</a>`).join('');
  return `<a class="book-drawer-scrim" href="${closeHref}" tabindex="-1" aria-hidden="true"></a><aside class="book-drawer" data-book-drawer data-cat="${book.cat}" role="dialog" aria-modal="true" aria-labelledby="book-drawer-title"><header class="book-drawer__head"><p class="book-drawer__meta">Book ${String(book.n).padStart(2,'0')} of 66 · <strong>${esc(category.name)}</strong> · ${esc(category.testament==='OT'?'Old Testament':'New Testament')}</p><h2 id="book-drawer-title">${esc(book.name)}</h2><a class="book-drawer__close" data-book-drawer-close href="${closeHref}" aria-label="Close ${esc(book.name)} details">×</a></header><div class="book-drawer__body"><p class="book-profile-hook">${esc(book.hook)}</p><div class="book-drawer__length" aria-label="${book.ch} chapters"><span style="width:${Math.max(3,Math.round(book.ch/150*100))}%"></span></div><p class="book-drawer__length-copy">${book.ch} chapter${book.ch===1?'':'s'} · ${book.ch>35?'a long haul — read it in sections':book.ch>15?'a substantial book':book.ch>5?'a focused read':'a short read'}</p><p class="book-drawer__synopsis">${esc(book.syn)}</p><dl class="book-drawer__facts"><div><dt>Written by</dt><dd>${esc(book.who)}</dd></div><div><dt>Period</dt><dd>${esc(book.when)}</dd></div><div><dt>Story setting</dt><dd>${esc(era?.name||book.era)} · ${esc(range(book.setA,book.setB))}</dd></div><div><dt>Who’s in it</dt><dd>${esc(book.people.join(' · '))}</dd></div><div><dt>Group</dt><dd>${esc(category.blurb)}</dd></div></dl><div class="badge-row">${evidenceBadge(book)}${book.threads.map(thread=>`<span class="badge">${esc(THREADS[thread]||thread)}</span>`).join('')}</div><section class="book-drawer__chapters" aria-labelledby="drawer-chapters"><div><p class="eyebrow">Read the book</p><h3 id="drawer-chapters">Choose a chapter.</h3></div><div>${chapterLinks}</div></section><p class="source-boundary">Traditional attributions, reconstructed dates, and disputed authorship are different evidence types. Uncertain entries are marked for fuller editorial sourcing.</p><a class="button book-drawer__read" href="/bible?book=${bn}&chapter=1">Read ${esc(book.name)} from chapter 1</a><nav class="book-drawer__stepper" aria-label="Adjacent books">${bn>1?`<a href="${bookHref(bn-1)}"><small>Previous</small><strong>${esc(bookByNumber(bn-1).name)}</strong></a>`:'<span></span>'}${bn<66?`<a href="${bookHref(bn+1)}"><small>Next</small><strong>${esc(bookByNumber(bn+1).name)}</strong></a>`:'<span></span>'}</nav></div></aside>`;
}

function bookNotes(book,chapter,esc){
  const category=CATEGORIES[book.cat],era=ERAS.find(item=>item.k===book.era),themes=(book.threads||[]).map(thread=>THREADS[thread]||thread);
  const module=(title,body,open=false)=>`<details ${open?'open':''}><summary>${esc(title)}</summary><div>${body}</div></details>`;
  return `<aside class="library-reader-panel" aria-label="Book Notes"><header><p class="eyebrow">Reading context</p><h2>Book Notes</h2><div class="session-pane-actions"><button type="button" data-journal-open aria-haspopup="dialog" aria-controls="personal-study-panel">Journal Notes</button><button type="button" data-feedback-open aria-haspopup="dialog" aria-controls="feedback-panel">Feedback</button></div><p class="session-context-note">Notes update with the current book and chapter. Your private journal remains separate.</p></header>${module('Cross-references',`<div id="v5-crossref-panel" class="reader-crossref-panel"><p class="session-context-note" style="margin:0 0 0.5rem;">Select any verse to inspect parallel citations.</p><div id="v5-crossref-list"></div><p class="session-context-note">Cross-references courtesy of <a href="https://www.openbible.info/labs/cross-references/" rel="noopener">OpenBible.info</a> (CC-BY).</p></div>`,true)}${module('At a glance',`<p><strong>${esc(book.name)}</strong> · ${book.ch} chapter${book.ch===1?'':'s'}</p><p>${esc(book.syn||book.hook||'')}</p>`,true)}${module('People & setting',`<p>${esc((book.people||[]).join(' · ')||'People and setting vary across the book.')}</p><p>${esc(era?.name||book.era||'Broad historical setting')} · ${esc(range(book.setA,book.setB))}</p>`)}${module('Group & themes',`<p><strong>${esc(category.name)}</strong></p><p>${esc(category.blurb)}</p>${themes.length?`<ul>${themes.map(theme=>`<li>${esc(theme)}</li>`).join('')}</ul>`:''}`)}${module('Reader links',`<p><a href="/bible?book=${book.n}&profile=1">Full book profile</a></p><p><a href="/bible?view=shelf">Expanded bookshelf</a></p>`)}</aside>`;
}

function compactReaderShelf(esc){
  const row=(label,books,{bookend=false}={})=>`<div class="bible-reader-shelf-row"><div class="bible-reader-shelf-label">${label}</div><div class="bible-reader-shelf">${books.map(book=>`<a class="library-first-book" data-cat="${esc(book.cat)}" href="/bible?book=${book.n}&chapter=1" style="--chapters:${book.ch}" aria-label="${esc(book.name)}, ${book.ch} chapters" title="${esc(book.name)}"><span>${esc(book.name)}</span></a>`).join('')}${bookend?'<span class="library-first-bookend-space" aria-hidden="true"></span><span class="library-first-bookend" aria-hidden="true"></span>':''}</div></div>`;
  return `<div class="bible-reader-shelves" aria-label="Bible book selector">${row('Old',LIBRARY_BOOKS.filter(book=>book.n<=39))}${row('New',LIBRARY_BOOKS.filter(book=>book.n>=40),{bookend:true})}</div>`;
}
function readerNavigation(){return `<nav class="bible-reader-nav" aria-label="Bible tools"><a href="/bible?view=books">Books</a><a href="/bible?view=timeline">Timeline</a><span aria-disabled="true" title="A dedicated map view is not yet published.">Maps</span><a href="/search">Search</a></nav>`}
function addressTools(text,bn=1,chapter=1,start=null,end=null,esc=s=>s){
  const selectedBook=bookByNumber(bn)||LIBRARY_BOOKS[0],count=chapterCount(text,selectedBook.n)||selectedBook.ch||1;
  return `<form class="bible-address-tools" method="get" action="/bible"><input type="hidden" name="view" value="reader"><label>Book<select name="book">${LIBRARY_BOOKS.map(book=>`<option value="${book.n}" ${book.n===selectedBook.n?'selected':''}>${esc(book.name)}</option>`).join('')}</select></label><label>Chapter<select name="chapter">${Array.from({length:count},(_,i)=>`<option value="${i+1}" ${i+1===chapter?'selected':''}>${i+1}</option>`).join('')}</select></label><label>From verse<input name="start" type="number" min="1" value="${start||''}" placeholder="optional"></label><label>To verse<input name="end" type="number" min="1" value="${end||''}" placeholder="optional"></label><button class="button button--primary" type="submit">Open</button></form>`;
}
function readerChrome(text,bn,chapter,start,end,esc){
  return `<header class="bible-reader-heading"><div><p class="eyebrow">Scripture · library · context</p><h1>Bible</h1><p>Choose from the canonical shelf, use the address controls, then read the text with book and chapter context kept alongside it.</p></div></header>${compactReaderShelf(esc)}${readerNavigation()}${addressTools(text,bn||1,chapter||1,start,end,esc)}`;
}

function reader(text,bn,chapter,start,end,esc){
  const book=bookByNumber(bn),all=chapterRows(text,bn,chapter),count=chapterCount(text,bn);
  if(!book||!all.length)return `<section class="bible-reader-shell">${readerChrome(text,bn,chapter,start,end,esc)}<p class="notice">${esc(book?.name||'Book')} ${chapter} was not found in the local corpus.</p></section>`;
  const selectedStart=Number(start||0),selectedEnd=Number(end||selectedStart||0),contextStart=selectedStart?Math.max(1,selectedStart-3):null,contextEnd=selectedStart?Math.min(all.at(-1)?.verse||selectedEnd,selectedEnd+3):null;
  const shown=selectedStart?all.filter(row=>row.verse>=contextStart&&row.verse<=contextEnd):all;
  const previous=chapter>1?`/bible?book=${bn}&chapter=${chapter-1}`:bn>1?`/bible?book=${bn-1}&chapter=${chapterCount(text,bn-1)}`:null,next=chapter<count?`/bible?book=${bn}&chapter=${chapter+1}`:bn<66?`/bible?book=${bn+1}&chapter=1`:null;
  return `<section class="bible-reader-shell">${readerChrome(text,bn,chapter,selectedStart||null,selectedEnd||null,esc)}<section class="library-reader-layout"><article class="reader scripture"><div class="reader-utility"><a href="/bible?book=${bn}&profile=1">${esc(book.name)} profile</a><span class="badge">Berean Standard Bible · BSB</span></div><h1>${esc(book.name)} ${chapter}${selectedStart?`:${selectedStart}${selectedEnd!==selectedStart?`–${selectedEnd}`:''}`:''}</h1><div class="chapter-nav">${previous?`<a class="button" href="${previous}">← Previous</a>`:'<span></span>'}<label>Chapter <select id="chapter-jump" data-book="${bn}">${Array.from({length:count},(_,i)=>`<option value="${i+1}" ${i+1===chapter?'selected':''}>${i+1}</option>`).join('')}</select></label>${next?`<a class="button" href="${next}">Next →</a>`:'<span></span>'}</div><div class="verses">${shown.map(row=>`<p id="v${row.verse}" ${selectedStart&&row.verse>=selectedStart&&row.verse<=selectedEnd?'data-selected="true"':''}><sup>${row.verse}</sup> ${esc(row.text)}</p>`).join('')}</div>${selectedStart?`<p class="meta">Showing the selected verse${selectedEnd!==selectedStart?' range':''} with nearby verses for context. <a href="/bible?book=${bn}&chapter=${chapter}">Show full chapter</a>.</p>`:''}<footer class="reader-footer"><a href="/bible?book=${bn}&profile=1">Book details</a><a href="/bible?view=shelf">Expanded bookshelf</a></footer></article>${bookNotes(book,chapter,esc)}</section></section>`;
}

function timeline(params,esc){
  const focus=Number(params.get('focus')||0),focused=bookByNumber(focus);
  const eraMarkup=ERAS.filter(era=>era.a!==null).map(era=>{const books=LIBRARY_BOOKS.filter(book=>book.era===era.k);return `<article class="timeline-era"><div><p class="eyebrow">${esc(range(era.a,era.b))}</p><h3>${esc(era.name)}</h3></div><div class="timeline-books">${books.map(book=>`<a href="/bible?view=timeline&book=${book.n}&profile=1" ${focus===book.n?'aria-current="true"':''}>${esc(book.name)}</a>`).join('')}</div></article>`}).join('');
  return `<section class="bible-timeline"><div class="bible-section-head"><div><p class="eyebrow">Canon & timeline</p><h2>Shelf order is not historical order.</h2></div><p>This view preserves broad story-setting eras and anchor events without pretending composition dates or historical reconstructions are uncontested.</p></div>${focused?`<p class="notice"><strong>${esc(focused.name)}</strong> is highlighted by its broad story setting: ${esc(ERAS.find(era=>era.k===focused.era)?.name||focused.era)}.</p>`:''}<section class="timeline-anchors" aria-label="Historical anchor events">${TIMELINE_ANCHORS.map(anchor=>`<article><strong>${esc(year(anchor.y))}</strong><span>${esc(anchor.t)}</span></article>`).join('')}</section><div class="timeline-era-list">${eraMarkup}</div><section class="story-arc"><p class="eyebrow">The story arc</p><h2>Ten movements that orient the whole library.</h2>${STORY_ARC.map((item,index)=>`<article><span>${String(index+1).padStart(2,'0')}</span><div><h3>${esc(item.title)}</h3><strong>${esc(item.where)}</strong><p>${esc(item.detail)}</p></div></article>`).join('')}</section></section>`;
}
function readerLauncher(text,esc){return `<section class="bible-reader-shell">${readerChrome(text,1,1,null,null,esc)}<section class="bible-closed-book" aria-label="Choose a Bible address to open the reader"><div class="bible-closed-book__cover"><span>HOLY BIBLE</span></div></section></section>`}

export function bibleView(text,params,esc){
  const q=params.get('q')||'',ref=q?parseReference(q):null,bn=Number(params.get('book')||(ref?.bn||0)),chapter=Number(params.get('chapter')||(ref?.chapter||0)),explicitStart=Number(params.get('start')||0)||null,explicitEnd=Number(params.get('end')||0)||null,profileMode=params.has('profile'),view=params.get('view')||'reader';
  const start=explicitStart??ref?.start??null,end=explicitEnd??ref?.end??start;
  if(bn&&chapter)return reader(text,bn,chapter,start,end,esc);
  let matches=[];
  if(q&&!ref){const needle=q.toLowerCase();matches=parseCorpus(text).filter(row=>row.text.toLowerCase().includes(needle)).slice(0,100)}
  if(q&&ref)return reader(text,ref.bn,ref.chapter,ref.start,ref.end,esc);
  if(q&&!ref)return `<header class="section compact-section"><p class="eyebrow">Scripture search · Berean Standard Bible (BSB)</p><h1>Bible</h1><form class="search" id="bible-search"><label class="sr-only" for="bq">Reference, word, or phrase</label><input id="bq" name="bq" value="${esc(q)}" placeholder="John 3:16 or covenant"><button>Search</button></form></header><p><a href="/bible">← Bible reader</a></p><section class="section"><h2>${matches.length} text matches</h2><div class="results">${matches.map(row=>`<a class="result" href="/bible?book=${row.bn}&chapter=${row.chapter}#v${row.verse}"><strong>${esc(BOOKS[row.bn-1])} ${row.chapter}:${row.verse}</strong> ${esc(row.text)}</a>`).join('')||'<p>No match found.</p>'}</div></section>`;
  const content=view==='books'?booksView(params,esc):view==='timeline'?timeline(params,esc):view==='shelf'?shelf(params,esc):readerLauncher(text,esc),header=view==='reader'?'':view==='shelf'?bibleLandingHeader():bibleStandardHeader(),background=view==='reader'?content:`${header}${bibleNav(view)}${content}`;
  if(bn&&profileMode)return `<div class="bible-drawer-background" inert aria-hidden="true">${background}</div>${profileDrawer(text,bn,params,esc)}`;
  if(profileMode&&bn)return `<div class="bible-drawer-background" inert aria-hidden="true">${readerLauncher(text,esc)}</div>${profileDrawer(text,bn,params,esc)}`;
  return background;
}

if(typeof document!=='undefined'){
  document.addEventListener('click',event=>{
    const spine=event.target.closest?.('.shelf-spine');
    if(!spine||typeof matchMedia!=='function'||!matchMedia('(hover: none), (pointer: coarse)').matches)return;
    if(spine.dataset.touchNamed!=='true'){
      event.preventDefault();
      document.querySelectorAll('.shelf-spine[data-touch-named="true"]').forEach(item=>{if(item!==spine)delete item.dataset.touchNamed});
      spine.dataset.touchNamed='true';
    }
  });
}


if (typeof document !== 'undefined') {
  async function _v5LoadCrossrefs(bn, ch) {
    try {
      const res = await fetch('/data/crossref/' + bn + '_' + ch + '.json');
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  function _v5RenderPills(refs, targetEl) {
    if (!targetEl) return;
    if (!refs || !refs.length) {
      targetEl.innerHTML = '<p style="font-size:0.82rem;color:var(--color-muted,#717a84);margin:0.25rem 0;">No direct parallels indexed for this verse.</p>';
      return;
    }
    targetEl.innerHTML = '<div style="display:flex;flex-direction:column;gap:0.35rem;margin-top:0.35rem;">' +
      refs.map(function(r) {
        const b = r.ref[0], c = r.ref[1], vs = r.ref[2], ve = r.ref[3];
        const bookObj = typeof bookByNumber === 'function' ? bookByNumber(b) : null;
        const name = bookObj ? bookObj.name : ('Book ' + b);
        const isParallel = r.label && r.label.indexOf('Linked from') === 0;
        const label = (r.label && !isParallel) ? r.label : (name + ' ' + c + ':' + vs + (ve && ve !== vs ? '–' + ve : ''));
        const href = '/bible?book=' + b + '&chapter=' + c + '&start=' + vs + (ve && ve !== vs ? '&end=' + ve : '') + '#v' + vs;
        return '<a href="' + href + '" style="display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0.6rem;background:var(--color-surface-subtle,#f2f3f5);border:1px solid var(--color-border,#d7dbe0);border-radius:4px;text-decoration:none;color:var(--color-ink,#1c2024);font-size:0.84rem;">' +
          '<span><span style="color:var(--color-accent,#486272);font-weight:700;margin-right:0.35rem;">' + (isParallel ? '⇠' : '↳') + '</span><strong>' + label + '</strong></span>' +
          '<span style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.04em;padding:0.1rem 0.35rem;background:#e5e9ee;border-radius:3px;font-weight:700;color:#486272;">' + (isParallel ? 'Parallel' : 'Citation') + '</span>' +
        '</a>';
      }).join('') +
    '</div>';
  }

  function _v5AttachReaderAugmentations() {
    setTimeout(async function() {
      const params = new URLSearchParams(window.location.search);
      const bn = Number(params.get('book')) || 1;
      const ch = Number(params.get('chapter')) || 1;
      const panel = document.querySelector('.library-reader-panel');

      if (panel && window.CANON_CATALOG && Array.isArray(window.CANON_CATALOG.lessons)) {
        const matches = window.CANON_CATALOG.lessons.filter(function(l) {
          return l.readingAddress && l.readingAddress.book === bn && l.readingAddress.chapter === ch;
        });
        if (matches.length) {
          let existing = panel.querySelector('.v5-course-inject');
          if (existing) existing.remove();
          const box = document.createElement('div');
          box.className = 'v5-course-inject';
          box.style.cssText = 'margin:0.75rem 1rem;padding:0.85rem;background:var(--color-surface-subtle,#f2f3f5);border-left:3px solid var(--color-gilt,#c59b27);border-radius:4px;';
          box.innerHTML = '<p style="font:750 0.72rem var(--font-meta);letter-spacing:0.08em;text-transform:uppercase;color:var(--color-accent,#486272);margin:0 0 0.25rem;">Course Insights · Ch. ' + ch + '</p>' +
            matches.map(function(l) {
              return '<p style="margin:0 0 0.35rem;font-size:0.88rem;"><strong>' + l.title + ':</strong> ' + l.plainSummary + '</p>' +
                '<a href="/course?unit=' + encodeURIComponent(l.unitId) + '&lesson=' + encodeURIComponent(l.id) + '" style="font-size:0.75rem;font-weight:700;color:var(--color-ink,#1c2024);">Open Lesson Deck →</a>';
            }).join('');
          panel.prepend(box);
        }
      }

      const crossRefData = await _v5LoadCrossrefs(bn, ch);

      const crossrefListEl = document.querySelector('#v5-crossref-list');
      if (crossrefListEl && crossRefData && crossRefData.verses) {
        const count = Object.keys(crossRefData.verses).length;
        if (count > 0) {
          crossrefListEl.innerHTML = '<p style="font-size:0.82rem;color:var(--color-ink,#1c2024);margin:0;"><strong>' + count + '</strong> verses in this chapter have parallel cross-references. Click any verse to view citations.</p>';
        }
      }

      const verses = document.querySelectorAll('.reader.scripture .verses p');
      verses.forEach(function(p, idx) {
        const vNum = Number(p.id ? p.id.replace(/^v/, '') : (idx + 1));
        p.style.cursor = 'pointer';
        p.addEventListener('click', function() {
          document.querySelectorAll('.reader.scripture .verses p.v5-active').forEach(function(el) {
            el.classList.remove('v5-active');
          });
          p.classList.add('v5-active');

          let inspectBox = document.querySelector('#v5-verse-inspect');
          if (!inspectBox) {
            inspectBox = document.createElement('div');
            inspectBox.id = 'v5-verse-inspect';
            inspectBox.style.cssText = 'margin:1rem 0;padding:1rem;background:#fffaf0;border:1px solid #e6d3a3;border-radius:6px;';
            const r = document.querySelector('.reader.scripture');
            if (r) r.prepend(inspectBox);
          }

          inspectBox.innerHTML = '<span style="font:750 0.72rem var(--font-meta);color:#8c6d1f;text-transform:uppercase;">Verse Deep-Dive · ' + bn + ':' + ch + ':' + vNum + '</span>' +
            '<p style="font-family:var(--font-display);font-size:1.1rem;margin:0.35rem 0;">' + p.textContent.trim() + '</p>' +
            '<div id="v5-inspect-crossrefs" style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px dashed #e6d3a3;">' +
              '<span style="font:700 0.72rem var(--font-meta);color:#8c6d1f;text-transform:uppercase;">Parallel Cross-References</span>' +
              '<div id="v5-inspect-crossrefs-target"></div>' +
            '</div>';

          const verseRefs = crossRefData && crossRefData.verses ? crossRefData.verses[String(vNum)] : null;
          _v5RenderPills(verseRefs, document.querySelector('#v5-inspect-crossrefs-target'));

          const sidebarTarget = document.querySelector('#v5-crossref-list');
          if (sidebarTarget) {
            const noteHead = document.querySelector('#v5-crossref-panel .session-context-note');
            if (noteHead) noteHead.innerHTML = 'Cross-references for <strong>Verse ' + vNum + '</strong>:';
            _v5RenderPills(verseRefs, sidebarTarget);
            const parentDetails = sidebarTarget.closest('details');
            if (parentDetails) parentDetails.open = true;
          }
        });
      });
    }, 100);
  }
  document.addEventListener('catalog:loaded', _v5AttachReaderAugmentations);
  window.addEventListener('popstate', _v5AttachReaderAugmentations);
  setTimeout(_v5AttachReaderAugmentations, 300);
}
