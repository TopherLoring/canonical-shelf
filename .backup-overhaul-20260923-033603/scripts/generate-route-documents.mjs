import {readFile,writeFile} from 'node:fs/promises';
import {LIBRARY_BOOKS} from '../public/library-data.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shelfBooks=(books,{bookend=false}={})=>`${books.map(book=>`<a class="library-first-book" data-cat="${esc(book.cat)}" href="/bible?book=${book.n}&chapter=1" style="--chapters:${book.ch}" aria-label="${esc(book.name)}, ${book.ch} chapters" title="${esc(book.name)}"><span>${esc(book.name)}</span></a>`).join('')}${bookend?'<span class="library-first-bookend-space" aria-hidden="true"></span><span class="library-first-bookend" aria-hidden="true"></span>':''}`;
const compactBibleShelves=()=>`<div class="bible-reader-shelves" aria-label="Bible book selector"><div class="bible-reader-shelf-row"><div class="bible-reader-shelf-label">Old</div><div class="bible-reader-shelf">${shelfBooks(LIBRARY_BOOKS.filter(book=>book.n<=39))}</div></div><div class="bible-reader-shelf-row"><div class="bible-reader-shelf-label">New</div><div class="bible-reader-shelf">${shelfBooks(LIBRARY_BOOKS.filter(book=>book.n>=40),{bookend:true})}</div></div></div>`;
const catalog=JSON.parse(await readFile('public/data/catalog.json','utf8'));
const courseSpines=(catalog.courses||[]).map((course,index)=>`<a class="course-volume" href="/course?course=${encodeURIComponent(course.id)}" style="--volume-height:${Math.min(96,68+index*5)}%"><span class="course-volume__seq">Course ${esc(course.sequence||index+1)}</span><strong class="course-volume__title">${esc(course.shortTitle||course.title)}</strong><span class="course-volume__status"><strong>Loading progress…</strong></span></a>`).join('');

const routes={
  home:{
    title:'Home',
    html:`<div class="library-first-home route-prerender"><section class="library-first-hero"><header class="library-first-homehead"><div class="library-first-copy"><div><span class="home-kicker">66 books · full Bible reader · guided learning</span><h1>The Canonical <em>Shelf</em></h1></div><p class="lede">Learn the Bible as a connected library: read in context, follow the story, ask hard questions, and build durable understanding without collapsing evidence, interpretation, and doctrine into one thing.</p></div><nav class="library-first-actions" aria-label="Home destinations"><a href="/course">Course</a><a href="/bible">Bible</a><a href="/topics">Topics</a><a href="/practice">Practice</a></nav></header><div class="library-first-shelf-wrap" aria-label="Canonical bookshelf"><div class="library-first-shelf-row"><div class="library-first-shelf-label">Old Testament</div><div class="library-first-shelf">${shelfBooks(LIBRARY_BOOKS.filter(book=>book.n<=39))}</div></div><div class="library-first-shelf-row"><div class="library-first-shelf-label">New Testament</div><div class="library-first-shelf">${shelfBooks(LIBRARY_BOOKS.filter(book=>book.n>=40),{bookend:true})}</div></div></div></section><nav class="library-entry-map" aria-label="Explore Canonical Shelf"><a href="/bible"><small>Bible</small><strong>Browse books</strong><span>Shelf, profiles, chapters, context.</span></a><a href="/topics"><small>Topics</small><strong>Ask a question</strong><span>Curated evidence and interpretation.</span></a><a href="/course"><small>Course</small><strong>Learn in sequence</strong><span>Six courses with scored activities.</span></a><a href="/practice"><small>Practice</small><strong>Retain what matters</strong><span>Due review before optional practice.</span></a></nav></div>`
  },
  course:{
    title:'Course',
    html:`<section class="course-volume-landing route-prerender"><header class="course-volume-heading"><p class="eyebrow">Guided learning · six-course collection</p><h1>Course</h1><p class="lede">Open the curriculum as a set of six volumes. Each course has its own purpose, ordered units, scored activities, and mastery work.</p></header><div class="course-volume-shelf" aria-label="Six Canonical Shelf courses">${courseSpines}</div></section>`
  },
  bible:{
    title:'Bible',
    html:`<section class="bible-reader-shell route-prerender"><header class="bible-reader-heading"><div><p class="eyebrow">Scripture · library · context</p><h1>Bible</h1><p>Choose from the canonical shelf, use the address controls, then read the text with book and chapter context kept alongside it.</p></div></header>${compactBibleShelves()}<nav class="bible-reader-nav" aria-label="Bible tools"><a href="/bible?view=books">Books</a><a href="/bible?view=timeline">Timeline</a><span aria-disabled="true">Maps</span><a href="/search">Search</a></nav><section class="bible-closed-book"><div class="bible-closed-book__cover"><span>HOLY BIBLE</span></div></section></section>`
  },
  topics:{
    title:'Topics',
    html:`<section class="topics-dossier route-prerender"><header class="topics-dossier__head"><div><p class="eyebrow">Questions · concepts · evidence</p><h1>Topics</h1><p>Begin with what you want to understand, then move through Scripture, context, competing interpretations, and Course connections.</p></div></header><form class="topics-dossier__search"><input disabled placeholder="Loading authored questions and reference guides…"><button class="button" disabled>Explore</button></form><div class="topics-dossier__body"><nav class="topics-dossier__nav"><a aria-current="page">Questions</a><a>Theology &amp; doctrine</a><a>Christian life</a><a>Biblical concepts</a><a>Difficult questions</a><a>Glossary</a></nav><section><p class="notice">Loading the authored reference library…</p></section></div></section>`
  },
  practice:{
    title:'Practice',
    html:`<section class="practice-dashboard route-prerender"><header class="practice-dashboard__head"><div><p class="eyebrow">Retention</p><h1>Practice</h1><p>Review what is due, then use optional practice when useful.</p></div></header><div class="practice-dashboard__grid"><article class="practice-dashboard__card practice-dashboard__due"><p class="eyebrow">Due now</p><h2>Loading review queue…</h2></article><article class="practice-dashboard__card"><p class="eyebrow">Practice rank</p><h2>—</h2></article><article class="practice-dashboard__card"><p class="eyebrow">Achievements</p><h2>—</h2></article></div></section>`
  },
  search:{
    title:'Search',
    html:`<header class="section compact-section search-experience-head"><p class="eyebrow">Search the whole shelf</p><h1>Search</h1><p class="lede">Scripture, authored Topics, Course teaching, glossary, book profiles, and the curated passage library are indexed together while remaining visibly different evidence types.</p></header><section class="route-prerender"><p class="notice">Enter a search above to retrieve material across Canonical Shelf.</p></section>`
  }
};

const shell=await readFile('public/index.html','utf8');
const mainMarker='<main id="main" tabindex="-1" aria-live="polite"></main>';
if(!shell.includes(mainMarker))throw new Error('route document generation requires the canonical empty #main marker in public/index.html');

for(const [route,entry] of Object.entries(routes)){
  const main=`<main class="route-document" data-route-document="${route}"><div id="main" data-route-content="${route}" tabindex="-1" aria-live="polite">${entry.html}</div></main>`;
  const title=`<title>${entry.title} · Canonical Shelf</title>`;
  const navMarker=`href="/${route}" data-route="${route}"`;
  const document=shell
    .replace(mainMarker,main)
    .replace('<title>Canonical Shelf</title>',title)
    .replace(navMarker,`${navMarker} aria-current="page"`);
  await writeFile(`public/${route}.html`,document);
}

console.log(`generated ${Object.keys(routes).length} route-owned HTML documents`);