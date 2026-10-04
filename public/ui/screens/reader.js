// Bible reader (redesign Step 2, phase 4). Mounted by the router for /bible addresses that name a chapter
// (book + chapter, or q with a reference); every other /bible view keeps its current page until its own step.
//
// Desktop: study links on the left, the chapter in the middle, My Notes and the selected study panel on the right.
// Phone: one card with the study icon row, verse popup, footnote badges and the My Notes edge tab.
// Text: public/data/corpus.txt (via ctx.corpus). Headings, paragraphs and footnotes: the vendored BSB apparatus.
// Cross-references: OpenBible. Notes: study-notes.js. Highlights: highlights.js.
import { LIBRARY_BOOKS, CATEGORIES, THREADS } from '../../library-data.js';
import { OSIS, parseCorpus, parseReference } from '../../bible-books.js';
import { renderMounts } from '../../study-notes.js';
import { chapterHighlights, setHighlight, HIGHLIGHT_COLORS } from '../../highlights.js';
import {
  renderRail, renderGroupChip, renderScriptureRef, mountScriptureRef,
  renderVerseSpan, renderVerseActions, renderFootnoteBadge, renderEdgeTab
} from '../components/index.js';

const SIZE_KEY = 'cs-reader-size';
const SIZES = ['standard', 'large', 'larger'];
const PANELS = ['context', 'xrefs', 'highlights', 'people', 'places', 'maps', 'themes'];
const annotationCache = new Map();
const crossrefCache = new Map();

const bookByNumber = n => LIBRARY_BOOKS[n - 1] || null;
const groupName = cat => CATEGORIES[cat]?.name || '';

// Which /bible addresses this screen draws. Library, Books, Timeline, profile drawers and word search stay on
// the current Bible page until the Shelf home and cleanup steps replace them.
export function handles(params) {
  if (params.has('profile') || (params.get('view') && params.get('view') !== 'reader')) return false;
  if (Number(params.get('book')) && Number(params.get('chapter'))) return true;
  const q = params.get('q');
  return Boolean(q && parseReference(q));
}

function addressFrom(params) {
  const q = params.get('q') || '';
  const ref = q ? parseReference(q) : null;
  const book = Math.min(66, Math.max(1, Number(params.get('book') || ref?.bn || 1)));
  const count = bookByNumber(book)?.ch || 1;
  const chapter = Math.min(count, Math.max(1, Number(params.get('chapter') || ref?.chapter || 1)));
  const start = Number(params.get('start') || ref?.start || 0) || null;
  const end = start ? Math.max(start, Number(params.get('end') || ref?.end || start)) : null;
  const panel = PANELS.includes(params.get('panel')) ? params.get('panel') : 'xrefs';
  return { book, chapter, start, end, panel };
}

const chapterHref = (book, chapter, extra = '') => `/bible?book=${book}&chapter=${chapter}${extra}`;
function neighbours(book, chapter) {
  const count = bookByNumber(book).ch;
  const prev = chapter > 1 ? [book, chapter - 1] : book > 1 ? [book - 1, bookByNumber(book - 1).ch] : null;
  const next = chapter < count ? [book, chapter + 1] : book < 66 ? [book + 1, 1] : null;
  return { prev, next };
}

async function loadAnnotations(book, chapter) {
  if (!annotationCache.has(book)) {
    annotationCache.set(book, fetch(`/data/bsb-annotations/${book}.json`).then(r => (r.ok ? r.json() : null)).catch(() => null));
  }
  const data = await annotationCache.get(book);
  return data?.chapters?.[chapter] || {};
}

async function loadCrossrefs(book, chapter) {
  const key = `${book}_${chapter}`;
  if (!crossrefCache.has(key)) {
    crossrefCache.set(key, fetch(`/data/crossref/${key}.json`).then(r => (r.ok ? r.json() : null)).catch(() => null));
  }
  return crossrefCache.get(key);
}

const refLabel = ([b, c, v1, v2]) => `${bookByNumber(b)?.name || `Book ${b}`} ${c}:${v1}${v2 && v2 !== v1 ? `–${v2}` : ''}`;
const refHref = ([b, c, v1, v2]) => chapterHref(b, c, `&start=${v1}${v2 && v2 !== v1 ? `&end=${v2}` : ''}`);
function refText(corpus, [b, c, v1, v2]) {
  const last = v2 || v1;
  return parseCorpus(corpus).filter(r => r.bn === b && r.chapter === c && r.verse >= v1 && r.verse <= last).map(r => r.text).join(' ');
}

// Footnotes keep the italics the BSB prints and nothing else.
const noteHtml = (text, esc) => esc(text).replace(/&lt;i&gt;/g, '<i>').replace(/&lt;\/i&gt;/g, '</i>');
const marker = i => String.fromCharCode(97 + (i % 26)) + (i >= 26 ? String(Math.floor(i / 26)) : '');

function verseBody(text, notes, esc, counter) {
  if (!notes?.length) return { html: esc(text), cards: [] };
  const sorted = [...notes].sort((a, b) => a.at - b.at);
  let html = '', at = 0;
  const cards = [];
  for (const note of sorted) {
    const cut = Math.max(at, Math.min(text.length, note.at));
    html += esc(text.slice(at, cut));
    const m = marker(counter.n++);
    const id = `reader-fn-${m}`;
    html += renderFootnoteBadge({ marker: m, label: `Footnote ${m}`, targetId: id, className: 'reader-fn-badge' }).replace('<button', `<button data-footnote="${m}"`);
    cards.push({ marker: m, id, text: note.text });
    at = cut;
  }
  html += esc(text.slice(at));
  return { html, cards };
}

function renderChapter({ rows, annotations, highlights, selected, esc }) {
  const headings = annotations.h || {};
  const paragraphs = annotations.p || {};
  const footnotes = annotations.f || {};
  const counter = { n: 0 };
  const allCards = [];
  const blocks = [];
  let open = null;
  const close = () => { if (open) { blocks.push(`<p class="reader-para reader-para--${open.kind}">${open.parts.join(' ')}</p>`); open = null; } };
  for (const row of rows) {
    for (const h of headings[row.verse] || []) {
      close();
      blocks.push(h.kind === 'section'
        ? `<h2 class="reader-heading">${esc(h.text)}</h2>`
        : `<h3 class="reader-subheading">${esc(h.text)}</h3>`);
    }
    // A paragraph or poetry-line start begins a new block; verses without one continue the open block.
    const kind = paragraphs[row.verse];
    if (kind) { close(); open = { kind, parts: [] }; }
    else if (!open) open = { kind: 'prose', parts: [] };
    const { html, cards } = verseBody(row.text, footnotes[row.verse], esc, counter);
    allCards.push(...cards.map(c => ({ ...c, verse: row.verse })));
    open.parts.push(renderVerseSpan({
      verseNumber: row.verse,
      text: html,
      isSelected: Boolean(selected && row.verse >= selected.start && row.verse <= selected.end),
      highlightColor: highlights[row.verse] || null,
      className: 'reader-verse',
      selectable: true
    }));
  }
  close();
  const footnoteList = allCards.length
    ? `<section class="reader-footnotes" aria-labelledby="reader-footnotes-title"><h2 id="reader-footnotes-title" class="reader-footnotes-title">Footnotes</h2><ol class="reader-footnote-list">${allCards.map(c => `<li id="${c.id}" class="reader-footnote" data-footnote-item="${c.marker}"><span class="reader-footnote-marker">${c.marker}</span><span class="reader-footnote-ref">${c.verse}</span><span class="reader-footnote-text">${noteHtml(c.text, esc)}</span></li>`).join('')}</ol></section>`
    : '';
  return blocks.join('') + footnoteList;
}

const ICONS = {
  context: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  xrefs: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  highlights: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m14 4 6 6-9 9H5v-6z"/><path d="M4 21h16"/></svg>',
  people: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></svg>',
  places: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  maps: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  overview: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7"/></svg>',
  timeline: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 12h18"/><circle cx="7" cy="12" r="2"/><circle cx="17" cy="12" r="2"/></svg>',
  themes: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>',
  chevronLeft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>',
  chevronRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
  chevronDown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  more: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
  close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};

function pickerMarkup(book, chapter, esc) {
  const current = bookByNumber(book);
  const testament = (label, from, to) => `<optgroup label="${label}">${LIBRARY_BOOKS.filter(b => b.n >= from && b.n <= to).map(b => `<option value="${b.n}" ${b.n === book ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</optgroup>`;
  return `<details class="reader-picker" data-reader-picker>
    <summary class="reader-picker-button"><span data-reader-title>${esc(current.name)} ${chapter}</span>${ICONS.chevronDown}</summary>
    <div class="reader-picker-popup" role="group" aria-label="Choose a book and chapter">
      <label class="reader-picker-label" for="reader-book-select">Book</label>
      <select id="reader-book-select" class="reader-picker-select" data-reader-book>${testament('Old Testament', 1, 39)}${testament('New Testament', 40, 66)}</select>
      <p class="reader-picker-label" id="reader-chapter-label">Chapter</p>
      <div class="reader-chapter-grid" role="list" aria-labelledby="reader-chapter-label" data-reader-chapters>${chapterLinks(book, chapter)}</div>
    </div>
  </details>`;
}
function chapterLinks(book, chapter) {
  const count = bookByNumber(book)?.ch || 1;
  return Array.from({ length: count }, (_, i) => `<a role="listitem" class="reader-chapter-link" href="${chapterHref(book, i + 1)}" ${i + 1 === chapter ? 'aria-current="page"' : ''}>${i + 1}</a>`).join('');
}

export async function mount(container, ctx) {
  const { esc, corpus } = ctx;
  const address = addressFrom(ctx.params);
  const { book, chapter } = address;
  const meta = bookByNumber(book);
  const osisBook = OSIS[book - 1];
  const rows = parseCorpus(corpus).filter(r => r.bn === book && r.chapter === chapter);
  const groupLabel = groupName(meta.cat);
  const [annotations, highlights] = await Promise.all([loadAnnotations(book, chapter), chapterHighlights(osisBook, chapter).catch(() => ({}))]);
  const { prev, next } = neighbours(book, chapter);
  let size = SIZES[0];
  try { const saved = localStorage.getItem(SIZE_KEY); if (SIZES.includes(saved)) size = saved; } catch {}
  let selected = address.start ? { start: address.start, end: address.end } : null;
  let panel = address.panel;
  const label = sel => `${meta.name} ${chapter}${sel ? `:${sel.start}${sel.end > sel.start ? `–${sel.end}` : ''}` : ''}`;
  const short = sel => (sel ? `${chapter}:${sel.start}${sel.end > sel.start ? `–${sel.end}` : ''}` : `${meta.name} ${chapter}`);

  if (!rows.length) {
    container.innerHTML = `<section class="reader-screen reader-screen--empty"><p class="reader-empty">${esc(meta.name)} ${chapter} is not in the local Bible text. <a href="${chapterHref(1, 1)}">Open Genesis 1</a>.</p></section>`;
    return () => {};
  }

  const railSections = sel => [
    { title: `For ${meta.name} ${sel ? short(sel) : chapter}`, items: [
      { href: '#context', label: 'Context', icon: ICONS.context, id: 'reader-rail-context' },
      { href: '#xrefs', label: 'Cross-references', icon: ICONS.xrefs, id: 'reader-rail-xrefs' },
      { href: '#highlights', label: 'Highlights', icon: ICONS.highlights, id: 'reader-rail-highlights' },
      { href: '#people', label: 'People', icon: ICONS.people, id: 'reader-rail-people' },
      { href: '#places', label: 'Places', icon: ICONS.places, id: 'reader-rail-places' },
      { href: '#maps', label: 'Maps', icon: ICONS.maps, id: 'reader-rail-maps' }
    ] },
    { title: 'For the book', items: [
      { href: `/bible?book=${book}&profile=1`, label: 'Book overview', icon: ICONS.overview, id: 'reader-rail-overview' },
      { href: '/bible?view=timeline', label: 'Timeline', icon: ICONS.timeline, id: 'reader-rail-timeline' },
      { href: '#themes', label: 'Themes', icon: ICONS.themes, id: 'reader-rail-themes' }
    ] }
  ];

  const prevLink = prev ? `<a class="reader-step" href="${chapterHref(...prev)}" aria-label="Previous chapter: ${esc(bookByNumber(prev[0]).name)} ${prev[1]}">${ICONS.chevronLeft}</a>` : `<span class="reader-step" aria-disabled="true">${ICONS.chevronLeft}</span>`;
  const nextLink = next ? `<a class="reader-step" href="${chapterHref(...next)}" aria-label="Next chapter: ${esc(bookByNumber(next[0]).name)} ${next[1]}">${ICONS.chevronRight}</a>` : `<span class="reader-step" aria-disabled="true">${ICONS.chevronRight}</span>`;
  const phoneTools = [['context', 'Overview', ICONS.overview], ['timeline', 'Timeline', ICONS.timeline], ['themes', 'Themes', ICONS.themes], ['people', 'People', ICONS.people], ['places', 'Places', ICONS.places], ['maps', 'Maps', ICONS.maps]];

  container.innerHTML = `<section class="reader-screen" data-reader data-book="${book}" data-chapter="${chapter}" data-size="${size}" aria-label="${esc(meta.name)} ${chapter}">
    <div class="reader-rail-wrap" data-reader-rail>${renderRail({ sections: railSections(selected), ariaLabel: 'Study tools', id: 'reader-rail' })}</div>
    <article class="reader-card" data-reader-card>
      <header class="reader-toolbar">
        ${pickerMarkup(book, chapter, esc)}
        <div class="reader-steps">${prevLink}${nextLink}</div>
        <div class="reader-meta">${renderGroupChip({ group: meta.cat })}<span class="reader-meta-count">Chapter ${chapter} of ${meta.ch}</span></div>
        <div class="reader-toolbar-end">
          <abbr class="reader-version" title="Berean Standard Bible">BSB</abbr>
          <button type="button" class="reader-size" data-reader-size aria-label="Text size: ${size}">Aa</button>
        </div>
      </header>
      <header class="reader-phone-head">
        <div class="reader-phone-title">
          <p class="reader-eyebrow" data-group="${meta.cat}">${esc(groupLabel)} · Berean Standard Bible</p>
          ${pickerMarkup(book, chapter, esc).replace('id="reader-book-select"', 'id="reader-book-select-phone"').replace('for="reader-book-select"', 'for="reader-book-select-phone"').replace('id="reader-chapter-label"', 'id="reader-chapter-label-phone"').replace('aria-labelledby="reader-chapter-label"', 'aria-labelledby="reader-chapter-label-phone"')}
        </div>
        <details class="reader-more" data-reader-more>
          <summary class="reader-more-button" aria-label="More reading options">${ICONS.more}</summary>
          <div class="reader-more-popup">
            ${prev ? `<a class="reader-more-item" href="${chapterHref(...prev)}">Previous chapter</a>` : ''}
            ${next ? `<a class="reader-more-item" href="${chapterHref(...next)}">Next chapter</a>` : ''}
            <button type="button" class="reader-more-item" data-reader-size>Text size</button>
            <a class="reader-more-item" href="/bible?book=${book}&profile=1">Book overview</a>
          </div>
        </details>
      </header>
      <nav class="reader-phone-tools" aria-label="Study tools">${phoneTools.map(([id, name, icon]) => `<button type="button" class="reader-phone-tool" data-phone-tool="${id}">${icon}<span>${name}</span></button>`).join('')}</nav>
      <div class="reader-scroll" data-reader-scroll>
        <header class="reader-title" data-group="${meta.cat}">
          <p class="reader-title-group">${esc(groupLabel)}</p>
          <h1 class="reader-title-heading">${esc(meta.name)} ${chapter}</h1>
          <p class="reader-title-version">Berean Standard Bible</p>
        </header>
        <div class="reader-text ui-verse-passage" data-reader-text>${renderChapter({ rows, annotations, highlights, selected, esc })}</div>
        <nav class="reader-chapter-nav" aria-label="Chapters">${prev ? `<a class="reader-chapter-nav-link" href="${chapterHref(...prev)}">${ICONS.chevronLeft}<span>${esc(bookByNumber(prev[0]).name)} ${prev[1]}</span></a>` : '<span></span>'}${next ? `<a class="reader-chapter-nav-link" href="${chapterHref(...next)}"><span>${esc(bookByNumber(next[0]).name)} ${next[1]}</span>${ICONS.chevronRight}</a>` : '<span></span>'}</nav>
      </div>
      <div class="reader-actions" data-reader-actions hidden>${renderVerseActions({ verseReference: label(selected), colors: HIGHLIGHT_COLORS })}<button type="button" class="reader-actions-clear" data-highlight-clear hidden>Remove highlight</button></div>
      <div class="reader-fn-pop" data-reader-fn-pop role="note" hidden></div>
    </article>
    <aside class="reader-aside" data-reader-aside data-sheet="none" aria-label="My Notes and study tools">
      <div class="reader-sheet-head"><span class="reader-sheet-title" data-sheet-title>My Notes</span><button type="button" class="reader-sheet-close" data-sheet-close aria-label="Close">${ICONS.close}</button></div>
      <section class="reader-notes-card" data-reader-notes aria-labelledby="reader-notes-title">
        <h2 class="reader-notes-title" id="reader-notes-title" data-notes-title>My notes on ${esc(short(selected))}</h2>
        <section class="study-notes" data-notes-mount aria-label="My Notes"></section>
      </section>
      <section class="reader-panel-card" data-reader-panel aria-live="polite"></section>
    </aside>
    ${renderEdgeTab({ type: 'notes', targetId: 'reader-notes', ariaLabel: 'Open My Notes', id: 'reader-notes-tab', className: 'reader-notes-tab' })}
  </section>`;

  const root = container.querySelector('[data-reader]');
  const text = root.querySelector('[data-reader-text]');
  const actions = root.querySelector('[data-reader-actions]');
  const clearButton = actions.querySelector('[data-highlight-clear]');
  const aside = root.querySelector('[data-reader-aside]');
  const panelCard = root.querySelector('[data-reader-panel]');
  const notesTitle = root.querySelector('[data-notes-title]');
  const fnPop = root.querySelector('[data-reader-fn-pop]');
  const card = root.querySelector('[data-reader-card]');
  const phone = () => matchMedia('(max-width: 1099px)').matches;

  // ---- Study panel -------------------------------------------------------------------------------------------
  const chapterXrefs = await loadCrossrefs(book, chapter);
  function crossrefsFor(sel) {
    if (!chapterXrefs?.verses) return [];
    const verses = sel ? Array.from({ length: sel.end - sel.start + 1 }, (_, i) => sel.start + i) : [];
    const seen = new Set();
    const out = [];
    for (const v of verses) for (const item of chapterXrefs.verses[v] || []) {
      const key = item.ref.join(':');
      if (!seen.has(key)) { seen.add(key); out.push(item.ref); }
    }
    return out;
  }
  function updateCounts() {
    const xrefCount = selected ? crossrefsFor(selected).length : 0;
    const highlightCount = text.querySelectorAll('.reader-verse[class*="ui-highlight-"]').length;
    for (const [id, count] of [['reader-rail-xrefs', xrefCount], ['reader-rail-highlights', highlightCount]]) {
      const link = root.querySelector(`#${id}`);
      if (!link) continue;
      link.querySelector('.ui-rail-count')?.remove();
      if (count) link.insertAdjacentHTML('beforeend', `<span class="ui-rail-count">${count}</span>`);
    }
    const title = root.querySelector('#reader-rail .ui-rail-section-title');
    if (title) title.textContent = `For ${meta.name} ${selected ? short(selected) : chapter}`;
  }
  function panelBody(which) {
    const head = (eyebrow, title) => `<header class="reader-panel-head"><p class="reader-panel-eyebrow">${esc(eyebrow)}</p><h2 class="reader-panel-title">${esc(title)}</h2></header>`;
    if (which === 'xrefs') {
      if (!selected) return `${head('Cross-references', `${meta.name} ${chapter}`)}<p class="reader-panel-hint">Select a verse to see where else Scripture says something related.</p>`;
      const refs = crossrefsFor(selected);
      if (!chapterXrefs) return `${head('Cross-references', label(selected))}<p class="reader-panel-hint">Cross-references are still loading or unavailable offline.</p>`;
      if (!refs.length) return `${head('Cross-references', label(selected))}<p class="reader-panel-hint">No cross-references are listed for this verse.</p>`;
      return `${head('Cross-references', label(selected))}<ul class="reader-xref-list" data-xref-list>${refs.slice(0, 40).map(ref => `<li>${renderScriptureRef({ reference: refLabel(ref), group: bookByNumber(ref[0])?.cat || 'law', text: refText(corpus, ref), href: refHref(ref), className: 'reader-xref' })}</li>`).join('')}</ul>${refs.length > 40 ? `<p class="reader-panel-hint">Showing 40 of ${refs.length}.</p>` : ''}<p class="reader-panel-source">Cross-references: OpenBible.info</p>`;
    }
    if (which === 'context') {
      return `${head('Context', meta.name)}<p class="reader-panel-hook">${esc(meta.hook || '')}</p><p class="reader-panel-text">${esc(meta.syn || '')}</p>
        <dl class="reader-facts"><dt>Where to begin</dt><dd>${esc(meta.read || '')}</dd><dt>Setting</dt><dd>${esc(meta.when || '')}</dd><dt>Who wrote it</dt><dd>${esc(meta.who || '')}</dd></dl>
        <p><a class="reader-panel-link" href="/bible?book=${book}&profile=1">Book overview</a></p>`;
    }
    if (which === 'highlights') {
      const marked = [...text.querySelectorAll('.reader-verse[class*="ui-highlight-"]')];
      if (!marked.length) return `${head('Highlights', `${meta.name} ${chapter}`)}<p class="reader-panel-hint">Select a verse and pick a color to highlight it.</p>`;
      return `${head('Highlights', `${meta.name} ${chapter}`)}<ul class="reader-highlight-list">${marked.map(v => {
        const n = Number(v.dataset.verse);
        const color = HIGHLIGHT_COLORS.find(c => v.classList.contains(`ui-highlight-${c}`));
        const row = rows.find(r => r.verse === n);
        return `<li><button type="button" class="reader-highlight-item" data-goto-verse="${n}"><span class="reader-highlight-swatch ui-highlight-${color}" aria-hidden="true"></span><span class="reader-highlight-ref">${chapter}:${n}</span><span class="reader-highlight-text">${esc(row?.text || '')}</span></button></li>`;
      }).join('')}</ul>`;
    }
    if (which === 'people') {
      const people = meta.people || [];
      return `${head('People', meta.name)}${people.length ? `<ul class="reader-chip-list">${people.map(p => `<li class="reader-chip">${esc(p)}</li>`).join('')}</ul>` : '<p class="reader-panel-hint">No people are listed for this book yet.</p>'}<p class="reader-panel-text">${esc(meta.when || '')}</p>`;
    }
    if (which === 'themes') {
      const themes = (meta.threads || []).map(t => THREADS[t] || t);
      return `${head('Themes', meta.name)}${themes.length ? `<ul class="reader-chip-list">${themes.map(t => `<li class="reader-chip">${esc(t)}</li>`).join('')}</ul>` : '<p class="reader-panel-hint">No themes are listed for this book yet.</p>'}<p><a class="reader-panel-link" href="/topics">Study Topics</a></p>`;
    }
    if (which === 'places' || which === 'maps') {
      const name = which === 'places' ? 'Places' : 'Maps';
      return `${head(name, meta.name)}<p class="reader-panel-hint">${name} for each book are not published yet. ${which === 'places' ? `The setting for ${esc(meta.name)}: ${esc(meta.when || 'see the book overview')}.` : 'The Timeline shows where each book sits in history.'}</p>${which === 'maps' ? '<p><a class="reader-panel-link" href="/bible?view=timeline">Timeline</a></p>' : ''}`;
    }
    if (which === 'timeline') {
      return `${head('Timeline', meta.name)}<p class="reader-panel-text">${esc(meta.when || '')}</p><p><a class="reader-panel-link" href="/bible?view=timeline">Open the Timeline</a></p>`;
    }
    return '';
  }
  function renderPanel() {
    panelCard.innerHTML = panelBody(panel);
    panelCard.dataset.panel = panel;
    mountScriptureRef(panelCard);
    for (const link of root.querySelectorAll('#reader-rail .ui-rail-link')) {
      const id = link.getAttribute('href')?.startsWith('#') ? link.getAttribute('href').slice(1) : null;
      const current = id === panel;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    }
  }

  // ---- Selection --------------------------------------------------------------------------------------------
  function syncAddress() {
    const url = new URL(location.href);
    url.searchParams.set('book', String(book));
    url.searchParams.set('chapter', String(chapter));
    url.searchParams.delete('q');
    if (selected) { url.searchParams.set('start', String(selected.start)); if (selected.end > selected.start) url.searchParams.set('end', String(selected.end)); else url.searchParams.delete('end'); }
    else { url.searchParams.delete('start'); url.searchParams.delete('end'); }
    if (panel !== 'xrefs') url.searchParams.set('panel', panel); else url.searchParams.delete('panel');
    history.replaceState(history.state, '', `${url.pathname}${url.search}`);
  }
  function placeActions() {
    const first = selected ? text.querySelector(`.reader-verse[data-verse="${selected.start}"]`) : null;
    if (!first) { actions.hidden = true; return; }
    actions.hidden = false;
    const cardBox = card.getBoundingClientRect();
    const box = first.getClientRects()[0] || first.getBoundingClientRect();
    const width = actions.offsetWidth || 240;
    const left = Math.max(8, Math.min(cardBox.width - width - 8, box.right - cardBox.left - width));
    const top = Math.max(8, box.top - cardBox.top - actions.offsetHeight - 8);
    actions.style.setProperty('--reader-actions-x', `${left}px`);
    actions.style.setProperty('--reader-actions-y', `${top}px`);
    const current = HIGHLIGHT_COLORS.find(c => first.classList.contains(`ui-highlight-${c}`));
    clearButton.hidden = !current;
    for (const b of actions.querySelectorAll('[data-color]')) b.setAttribute('aria-pressed', String(b.dataset.color === current));
  }
  function select(start, end = start, { focusNotes = false } = {}) {
    selected = start ? { start, end } : null;
    root.dataset.selectedVerse = selected ? String(selected.start) : '';
    for (const v of text.querySelectorAll('.reader-verse')) {
      const n = Number(v.dataset.verse);
      const on = Boolean(selected && n >= selected.start && n <= selected.end);
      v.classList.toggle('is-selected', on);
      v.setAttribute('aria-pressed', String(on));
    }
    notesTitle.textContent = `My notes on ${short(selected)}`;
    syncAddress();
    updateCounts();
    if (panel === 'xrefs' || panel === 'highlights') renderPanel();
    placeActions();
    renderMounts().then(() => { if (focusNotes) aside.querySelector('[data-note-text]')?.focus(); }).catch(() => {});
  }

  // ---- Sheets (phone) ---------------------------------------------------------------------------------------
  const notesTab = root.querySelector('#reader-notes-tab');
  function openSheet(kind) {
    aside.dataset.sheet = kind;
    root.querySelector('[data-sheet-title]').textContent = kind === 'notes' ? 'My Notes' : (panelCard.querySelector('.reader-panel-eyebrow')?.textContent || 'Study');
    notesTab?.classList.toggle('is-hidden', kind !== 'none');
    if (kind !== 'none') aside.querySelector('[data-sheet-close]')?.focus();
  }
  const closeSheet = () => { const was = aside.dataset.sheet; openSheet('none'); if (was === 'notes') notesTab?.focus(); };

  // ---- Events ------------------------------------------------------------------------------------------------
  function verseFrom(target) { return target?.closest?.('.reader-verse[data-verse]'); }
  function onClick(event) {
    const t = event.target;
    const badge = t.closest('[data-footnote]');
    if (badge) {
      event.preventDefault();
      const m = badge.dataset.footnote;
      const item = root.querySelector(`[data-footnote-item="${m}"] .reader-footnote-text`);
      const open = fnPop.dataset.marker === m && !fnPop.hidden;
      root.querySelectorAll('[data-footnote][aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
      if (open || !item) { fnPop.hidden = true; delete fnPop.dataset.marker; return; }
      fnPop.innerHTML = `<span class="reader-fn-pop-marker">${m}</span><span class="reader-fn-pop-text">${item.innerHTML}</span>`;
      fnPop.dataset.marker = m;
      fnPop.hidden = false;
      badge.setAttribute('aria-expanded', 'true');
      const cardBox = card.getBoundingClientRect(), box = badge.getBoundingClientRect();
      fnPop.style.setProperty('--reader-fn-x', `${Math.max(8, Math.min(cardBox.width - fnPop.offsetWidth - 8, box.left - cardBox.left - 12))}px`);
      fnPop.style.setProperty('--reader-fn-y', `${box.bottom - cardBox.top + 6}px`);
      return;
    }
    if (!t.closest('[data-reader-fn-pop]')) { fnPop.hidden = true; delete fnPop.dataset.marker; root.querySelectorAll('[data-footnote][aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false')); }
    const color = t.closest('[data-reader-actions] [data-color]');
    if (color && selected) {
      const chosen = color.dataset.color;
      const targets = [...text.querySelectorAll('.reader-verse')].filter(v => { const n = Number(v.dataset.verse); return n >= selected.start && n <= selected.end; });
      const first = targets[0];
      const same = first && first.classList.contains(`ui-highlight-${chosen}`);
      const next = same ? null : chosen;
      for (const v of targets) {
        HIGHLIGHT_COLORS.forEach(c => v.classList.remove(`ui-highlight-${c}`));
        if (next) v.classList.add(`ui-highlight-${next}`);
        setHighlight(`${osisBook}.${chapter}.${v.dataset.verse}`, next, `${meta.name} ${chapter}:${v.dataset.verse}`).catch(() => {});
      }
      updateCounts(); placeActions(); if (panel === 'highlights') renderPanel();
      return;
    }
    if (t.closest('[data-highlight-clear]') && selected) {
      for (const v of text.querySelectorAll('.reader-verse')) {
        const n = Number(v.dataset.verse);
        if (n < selected.start || n > selected.end) continue;
        HIGHLIGHT_COLORS.forEach(c => v.classList.remove(`ui-highlight-${c}`));
        setHighlight(`${osisBook}.${chapter}.${n}`, null).catch(() => {});
      }
      updateCounts(); placeActions(); if (panel === 'highlights') renderPanel();
      return;
    }
    if (t.closest('[data-reader-actions] [data-action="note"]')) {
      if (phone()) openSheet('notes');
      aside.querySelector('[data-note-text]')?.focus();
      return;
    }
    if (t.closest('[data-reader-actions] [data-action="copy"]') && selected) {
      const words = rows.filter(r => r.verse >= selected.start && r.verse <= selected.end).map(r => r.text).join(' ');
      navigator.clipboard?.writeText(`${words} — ${label(selected)} (BSB)`).then(() => {
        const button = t.closest('[data-action="copy"]');
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = 'Copy'; }, 1500);
      }).catch(() => {});
      return;
    }
    const sizeButton = t.closest('[data-reader-size]');
    if (sizeButton) {
      size = SIZES[(SIZES.indexOf(size) + 1) % SIZES.length];
      root.dataset.size = size;
      try { localStorage.setItem(SIZE_KEY, size); } catch {}
      root.querySelectorAll('.reader-size').forEach(b => b.setAttribute('aria-label', `Text size: ${size}`));
      placeActions();
      return;
    }
    const goto = t.closest('[data-goto-verse]');
    if (goto) { const n = Number(goto.dataset.gotoVerse); select(n); text.querySelector(`#v${n}`)?.scrollIntoView({ block: 'center' }); if (phone()) closeSheet(); return; }
    const railLink = t.closest('#reader-rail .ui-rail-link');
    if (railLink && railLink.getAttribute('href')?.startsWith('#')) {
      event.preventDefault();
      panel = railLink.getAttribute('href').slice(1);
      renderPanel(); syncAddress();
      return;
    }
    const tool = t.closest('[data-phone-tool]');
    if (tool) {
      panel = tool.dataset.phoneTool === 'context' && selected ? 'xrefs' : tool.dataset.phoneTool;
      if (tool.dataset.phoneTool === 'context' && !selected) panel = 'context';
      renderPanel();
      openSheet('study');
      return;
    }
    if (t.closest('#reader-notes-tab')) { openSheet('notes'); aside.querySelector('[data-note-text]')?.focus(); return; }
    if (t.closest('[data-sheet-close]')) { closeSheet(); return; }
    const verse = verseFrom(t);
    if (verse) {
      const n = Number(verse.dataset.verse);
      if (event.shiftKey && selected) select(Math.min(selected.start, n), Math.max(selected.end, n));
      else if (selected && selected.start === n && selected.end === n) select(null);
      else select(n);
      return;
    }
  }
  function onKeydown(event) {
    if (event.key === 'Escape') {
      if (!fnPop.hidden) { fnPop.hidden = true; return; }
      if (aside.dataset.sheet !== 'none') { closeSheet(); return; }
      if (selected) { const n = selected.start; select(null); text.querySelector(`#v${n}`)?.focus(); }
      return;
    }
    const verse = verseFrom(event.target);
    if (verse && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); verse.click(); }
  }
  function onChange(event) {
    const select = event.target.closest('[data-reader-book]');
    if (!select) return;
    const picker = select.closest('[data-reader-picker]');
    const n = Number(select.value);
    picker.querySelector('[data-reader-chapters]').innerHTML = chapterLinks(n, n === book ? chapter : 0);
  }
  const onResize = () => { placeActions(); if (!phone() && aside.dataset.sheet !== 'none') openSheet('none'); };

  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKeydown);
  root.addEventListener('change', onChange);
  addEventListener('resize', onResize);

  renderPanel();
  updateCounts();
  if (selected) {
    root.dataset.selectedVerse = String(selected.start);
    requestAnimationFrame(() => { text.querySelector(`#v${selected.start}`)?.scrollIntoView({ block: 'center' }); placeActions(); });
  }

  return () => {
    removeEventListener('resize', onResize);
  };
}
