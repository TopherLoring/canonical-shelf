import {readFile,writeFile} from 'node:fs/promises';

const routes={
  home:{
    title:'Home',
    html:`<div class="library-first-home route-prerender"><section class="library-first-hero"><div class="library-first-copy"><p class="eyebrow">A Bible-learning library</p><h1>The Canonical <em>Shelf</em></h1><p class="lede">Start with the library itself. Open a book, understand where it sits, then move naturally into reading, context, course learning, and practice.</p><div class="library-first-actions"><a class="button" href="/bible?view=shelf">Open the bookshelf</a><a class="button" href="/course">Explore the Course</a></div></div><div class="library-first-shelf-wrap"><div class="library-first-shelf-label"><strong>66-book library</strong><span>Books, context, learning, and practice</span></div><p class="notice">The interactive shelf and your learner state load from local Canonical Shelf data.</p></div></section></div>`
  },
  course:{
    title:'Course Catalog',
    html:`<header class="section compact-section course-catalog-heading"><p class="eyebrow">Course Catalog</p><h1>Choose where to begin.</h1><p class="lede">Browse the six-course collection, inspect what each course establishes, and open the volume you want to study.</p></header><section class="course-catalog-chooser route-prerender" aria-label="Canonical learning course catalog"><p class="notice">Loading the current course catalog and learner progress…</p></section>`
  },
  bible:{
    title:'Bible',
    html:`<header class="bible-identity"><p class="eyebrow"><strong>66 books</strong> · full Bible reader · guided learning · interactive practice</p><h1 aria-label="The Canonical Shelf"><span>The Canonical</span><em>Shelf</em></h1><p class="lede">The Bible is not one book — it is a shelf of sixty-six, collected over roughly a thousand years, in several different kinds of writing. Learn the shelf first, then the groups, then what is actually in them.</p></header><nav class="bible-mode-map" aria-label="Bible views"><a href="/bible?view=shelf" aria-current="page"><span>01</span><strong>Bookshelf</strong></a><a href="/bible?view=books"><span>02</span><strong>Books &amp; groups</strong></a><a href="/bible?view=reader"><span>03</span><strong>Bible reader</strong></a><a href="/bible?view=timeline"><span>04</span><strong>Canon &amp; timeline</strong></a></nav><section class="canonical-shelf route-prerender"><div class="bible-section-head"><div><p class="eyebrow">The canonical shelf</p><h2>Sixty-six books. One library.</h2></div><p>The interactive shelf and book profiles load from Canonical Shelf’s local Bible library.</p></div></section>`
  },
  topics:{
    title:'Topics',
    html:`<header class="section compact-section"><p class="eyebrow">Curated reference · not scored</p><h1>Topics</h1><p class="lede">Ask what something means, compare responsible interpretations, and follow Scripture, history, doctrine, practice, and related questions without turning reference into a second course.</p></header><section class="route-prerender"><p class="notice">Loading the authored reference library…</p></section>`
  },
  practice:{
    title:'Practice',
    html:`<header class="section compact-section"><p class="eyebrow">Retrieval · retention · transfer</p><h1>Practice</h1><p class="lede">Reinforce Course learning through spaced review, active retrieval, mastery replay, and optional games without creating a second curriculum.</p></header><section class="route-prerender"><p class="notice">Loading review state and practice modes…</p></section>`
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
