// Step 8: Book overview and Timeline.
// One screen in the Study Topics layout: a left list (the Timeline, then every book by group), the selected item in the
// middle, and the reading panel on the right. The old Bible library, which duplicated the Shelf, is gone: its addresses
// redirect (see bible.js).
import { BOOK_BY_NUMBER, CATEGORIES, CATEGORY_ORDER, ERAS, LIBRARY_BOOKS, STORY_ARC, THREADS, TIMELINE_ANCHORS } from '../../library-data.js';
import { mountProgressBars, renderGroupChip, renderProgressBar } from '../components/index.js';

const year = value => (value === null || value === undefined ? 'Unplaced' : value < 0 ? `${Math.abs(value)} BC` : `AD ${value}`);
const range = (a, b) => (a === undefined ? 'Not specified' : a === b ? year(a) : `${year(a)}–${year(b)}`);

export const overviewHref = book => `/bible?book=${book}&profile=1`;
export const TIMELINE_HREF = '/bible?view=timeline';

export function handles(params) {
  if (params.get('view') === 'timeline') return true;
  return params.has('profile') && Boolean(BOOK_BY_NUMBER.get(Number(params.get('book'))));
}

function leftList(active, timelineActive, esc) {
  const groups = CATEGORY_ORDER.map(key => {
    const books = LIBRARY_BOOKS.filter(book => book.cat === key);
    return `<section class="book-nav__group" aria-label="${esc(CATEGORIES[key].name)}"><p class="book-nav__label">${esc(CATEGORIES[key].name)}</p>
      ${books.map(book => `<a href="${esc(overviewHref(book.n))}" ${active === book.n ? 'aria-current="page"' : ''}><span>${esc(book.name)}</span><span class="book-nav__count">${book.ch}</span></a>`).join('')}
    </section>`;
  }).join('');
  return `<div class="book-nav-wrap" data-book-nav-wrap><nav class="book-nav" id="book-nav" aria-label="Books and timeline">
    <p class="book-nav__label">Orientation</p>
    <a href="${esc(TIMELINE_HREF)}" ${timelineActive ? 'aria-current="page"' : ''}><span>Timeline</span></a>
    ${groups}
  </nav></div>`;
}

function lengthNote(book) {
  const size = book.ch > 35 ? 'a long haul: read it in sections' : book.ch > 15 ? 'a substantial book' : book.ch > 5 ? 'a focused read' : 'a short read';
  return `${book.ch} chapter${book.ch === 1 ? '' : 's'} · ${size}`;
}

function bookMain(book, esc) {
  const category = CATEGORIES[book.cat];
  const era = ERAS.find(item => item.k === book.era);
  const badges = [book.dateUnsure ? 'dating disputed' : 'broad orientation', ...(book.threads || []).map(thread => THREADS[thread] || thread)];
  return `<header class="book-heading">
      <p class="eyebrow">Book ${String(book.n).padStart(2, '0')} of 66 · ${esc(category.testament === 'OT' ? 'Old Testament' : 'New Testament')}</p>
      <h1 id="book-overview-title">${esc(book.name)}</h1>
      <button type="button" class="book-title-toggle" data-book-nav-toggle aria-expanded="false" aria-controls="book-nav" aria-label="${esc(book.name)}: choose a book"></button>
      ${renderGroupChip({ group: book.cat, label: category.name })}
    </header>
    <p class="book-hook">${esc(book.hook)}</p>
    <p class="book-synopsis">${esc(book.syn)}</p>
    <div class="book-length">${renderProgressBar({ value: Math.max(3, Math.round(book.ch / 150 * 100)), max: 100, ariaLabel: `${book.name} length: ${book.ch} chapters` })}<span>${esc(lengthNote(book))}</span></div>
    <dl class="book-facts">
      <div><dt>Written by</dt><dd>${esc(book.who)}</dd></div>
      <div><dt>Period</dt><dd>${esc(book.when)}</dd></div>
      <div><dt>Story setting</dt><dd>${esc(era?.name || book.era)} · ${esc(range(book.setA, book.setB))}</dd></div>
      <div><dt>Who’s in it</dt><dd>${esc((book.people || []).join(' · '))}</dd></div>
      <div><dt>Group</dt><dd>${esc(category.blurb)}</dd></div>
    </dl>
    <ul class="book-badges" aria-label="Evidence and themes">${badges.map(label => `<li>${esc(label)}</li>`).join('')}</ul>
    <p class="book-boundary">Traditional attributions, reconstructed dates, and disputed authorship are different evidence types. Uncertain entries are marked for fuller editorial sourcing.</p>
    <nav class="book-stepper" aria-label="Adjacent books">
      ${book.n > 1 ? `<a href="${esc(overviewHref(book.n - 1))}"><small>Previous</small><strong>${esc(BOOK_BY_NUMBER.get(book.n - 1).name)}</strong></a>` : '<span></span>'}
      ${book.n < 66 ? `<a href="${esc(overviewHref(book.n + 1))}"><small>Next</small><strong>${esc(BOOK_BY_NUMBER.get(book.n + 1).name)}</strong></a>` : '<span></span>'}
    </nav>`;
}

function bookContext(book, esc) {
  const chapters = Array.from({ length: book.ch }, (_, index) => `<a href="/bible?book=${book.n}&chapter=${index + 1}" aria-label="${esc(book.name)} chapter ${index + 1}">${index + 1}</a>`).join('');
  return `<aside class="book-context ui-panel ui-panel--raised" aria-label="Read ${esc(book.name)}">
    <p class="ui-panel-eyebrow">Read first</p>
    <p class="book-context__read">${esc(book.read || `Start with chapter 1 of ${book.name}.`)}</p>
    <a class="book-context__start" href="/bible?book=${book.n}&chapter=1">Read ${esc(book.name)} from chapter 1</a>
    <div class="book-chapters-wrap" data-book-chapters>
      <button type="button" class="book-chapters-toggle" data-book-chapters-toggle aria-expanded="false" aria-controls="book-chapters">Chapters <span>${book.ch}</span><span aria-hidden="true">▾</span></button>
      <h2 class="ui-panel-title book-chapters-title">Chapters</h2>
      <div class="book-chapters" id="book-chapters">${chapters}</div>
    </div>
  </aside>`;
}

function timelineMain(focus, esc) {
  const focused = BOOK_BY_NUMBER.get(focus);
  const eras = ERAS.filter(era => era.a !== null).map(era => {
    const books = LIBRARY_BOOKS.filter(book => book.era === era.k);
    return `<article class="timeline-era"><div><p class="eyebrow">${esc(range(era.a, era.b))}</p><h3>${esc(era.name)}</h3></div>
      <div class="timeline-books">${books.map(book => `<a href="${esc(overviewHref(book.n))}" ${focus === book.n ? 'aria-current="true"' : ''}>${esc(book.name)}</a>`).join('')}</div></article>`;
  }).join('');
  return `<header class="book-heading"><p class="eyebrow">Canon &amp; timeline</p><h1 id="book-overview-title">Timeline</h1><button type="button" class="book-title-toggle" data-book-nav-toggle aria-expanded="false" aria-controls="book-nav" aria-label="${esc('Timeline')}: choose a book"></button></header>
    <p class="book-hook">Shelf order is not historical order.</p>
    <p class="book-synopsis">This view keeps broad story-setting eras and anchor events without pretending composition dates or historical reconstructions are uncontested.</p>
    ${focused ? `<p class="notice"><strong>${esc(focused.name)}</strong> sits in ${esc(ERAS.find(era => era.k === focused.era)?.name || focused.era)}.</p>` : ''}
    <div class="timeline-era-list">${eras}</div>`;
}

function timelineContext(esc) {
  return `<aside class="book-context ui-panel ui-panel--raised" aria-label="Anchor events and story arc">
    <p class="ui-panel-eyebrow">Anchor events</p>
    <ol class="timeline-anchors">${TIMELINE_ANCHORS.map(anchor => `<li><strong>${esc(year(anchor.y))}</strong><span>${esc(anchor.t)}</span></li>`).join('')}</ol>
    <h2 class="ui-panel-title">The story arc</h2>
    <ol class="story-arc">${STORY_ARC.map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><div><strong>${esc(item.title)}</strong><em>${esc(item.where)}</em><p>${esc(item.detail)}</p></div></li>`).join('')}</ol>
  </aside>`;
}

export async function mount(container, ctx) {
  const { params, esc } = ctx;
  const timeline = params.get('view') === 'timeline';
  const book = timeline ? null : BOOK_BY_NUMBER.get(Number(params.get('book')));
  const focus = timeline ? Number(params.get('book')) || 0 : 0;
  container.innerHTML = `<section class="book-screen" data-book-screen data-kind="${book ? 'book' : 'timeline'}" aria-labelledby="book-overview-title">
    ${leftList(book?.n || 0, timeline, esc)}
    <div class="book-main">${book ? bookMain(book, esc) : timelineMain(focus, esc)}</div>
    ${book ? bookContext(book, esc) : timelineContext(esc)}
  </section>`;
  mountProgressBars(container);
  // The list is always open beside the page on a wide screen; on a phone it is a collapsed "choose a book" bar.
  const wrap = container.querySelector('[data-book-nav-wrap]');
  const toggle = container.querySelector('[data-book-nav-toggle]');
  const chapters = container.querySelector('[data-book-chapters]');
  const chaptersToggle = container.querySelector('[data-book-chapters-toggle]');
  const wide = window.matchMedia('(min-width: 681px)');
  const setNav = open => { wrap.toggleAttribute('data-open', open); toggle.setAttribute('aria-expanded', String(open)); };
  const setChapters = open => { chapters?.toggleAttribute('data-open', open); chaptersToggle?.setAttribute('aria-expanded', String(open)); };
  const sync = () => { setNav(wide.matches); setChapters(wide.matches); };
  sync();
  wide.addEventListener('change', sync);
  toggle.addEventListener('click', () => setNav(!wrap.hasAttribute('data-open')));
  chaptersToggle?.addEventListener('click', () => setChapters(!chapters.hasAttribute('data-open')));
  // Bring the current book into view inside the list only (scrollIntoView would also scroll the page).
  const current = container.querySelector('.book-nav [aria-current]');
  if (current && wide.matches) wrap.scrollTop += current.getBoundingClientRect().top - wrap.getBoundingClientRect().top - wrap.clientHeight / 3;
  return () => wide.removeEventListener('change', sync);
}
