// Bible Reader Screen Track (/bible — P4 / R1)
// Redesigned Bible Reader screen based on Reader.dc.html and PhoneReader.dc.html.
// Complies with strict CSS cascade layers, theme role tokens, and coordinate invariance.

import {
  LIBRARY_BOOKS,
  BOOK_BY_NUMBER,
  CATEGORIES,
  CATEGORY_ORDER,
  ERAS,
  TIMELINE_ANCHORS,
  THREADS,
  STORY_ARC
} from '../../library-data.js';

import {
  renderRail,
  renderRailLink
} from '../components/rail.js';

import {
  renderVerseSpan,
  renderVersePassage
} from '../components/verse-text.js';

import {
  renderVerseActions
} from '../components/verse-actions.js';

import {
  renderGroupChip,
  BIBLE_GROUPS
} from '../components/group-chip.js';

import {
  renderFootnoteBadge,
  renderFootnoteCard
} from '../components/footnote.js';

import {
  renderNotesPanel
} from '../components/notes-panel.js';

import {
  renderScriptureRef,
  mountScriptureRef
} from '../components/scripture-ref.js';

import {
  renderEdgeTab,
  mountEdgeTab
} from '../components/edge-tab.js';

import {
  getState,
  putState
} from '../../db.js';

import {
  rememberVerse,
  selectedVerse,
  currentPassage
} from '../../screen-context.js';

import {
  renderMounts,
  currentNoteKey,
  scriptureLabel
} from '../../study-notes.js';

import {
  OSIS,
  osisOf,
  parseOsis
} from '../../bible-books.js';

// Ensure stylesheet is loaded if not already linked
if (typeof document !== 'undefined' && !document.querySelector('link[data-screen-reader], link[href*="reader.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/ui/screens/reader.css';
  link.dataset.screenReader = '';
  document.head.append(link);
}

export const BOOKS = LIBRARY_BOOKS.map(book => book.name);
export const GROUPS = CATEGORY_ORDER.map(key => {
  const members = LIBRARY_BOOKS.filter(book => book.cat === key);
  return [CATEGORIES[key].name, members[0].n, members[members.length - 1].n, key];
});

const aliases = new Map();
BOOKS.forEach((book, index) => {
  const n = index + 1;
  for (const alias of [book, book.replace('Song of Solomon', 'Song'), book.replace('Psalms', 'Psalm')]) {
    aliases.set(alias.toLowerCase(), n);
  }
});
Object.entries({
  gen: 1, ex: 2, exod: 2, lev: 3, num: 4, deut: 5, josh: 6, judg: 7, ruth: 8,
  '1sam': 9, '2sam': 10, '1kings': 11, '2kings': 12, '1chron': 13, '2chron': 14,
  ezra: 15, neh: 16, est: 17, job: 18, ps: 19, psalm: 19, psalms: 19, prov: 20,
  eccl: 21, song: 22, isa: 23, jer: 24, lam: 25, ezek: 26, dan: 27, hos: 28,
  joel: 29, amos: 30, obad: 31, jonah: 32, mic: 33, nah: 34, hab: 35, zeph: 36,
  hag: 37, zech: 38, mal: 39, matt: 40, mk: 41, mark: 41, lk: 42, luke: 42,
  jn: 43, john: 43, acts: 44, rom: 45, '1cor': 46, '2cor': 47, gal: 48, eph: 49,
  phil: 50, col: 51, '1thess': 52, '2thess': 53, '1tim': 54, '2tim': 55, titus: 56,
  phlm: 57, heb: 58, jas: 59, james: 59, '1pet': 60, '2pet': 61, '1jn': 62,
  '2jn': 63, '3jn': 64, jude: 65, rev: 66
}).forEach(([alias, n]) => aliases.set(alias, n));

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const HIGHLIGHTS_KEY = 'canonical-shelf-highlights-v1';
const TEXT_SIZE_KEY = 'canonical-shelf-reader-text-size-v1';

// Known chapter section headings for rich typography matching mockups
const SECTION_HEADINGS = {
  '1_1': {
    1: 'The Creation',
    6: 'The Second Day',
    9: 'The Third Day',
    14: 'The Fourth Day',
    20: 'The Fifth Day',
    24: 'The Sixth Day'
  },
  '1_2': {
    1: 'The Seventh Day',
    4: 'The Garden of Eden',
    18: 'The Creation of Woman'
  },
  '43_3': {
    1: 'Jesus and Nicodemus',
    16: 'For God So Loved the World',
    22: 'John the Baptist’s Testimony'
  }
};

let cachedCorpusText = '';
let cachedCorpusRows = [];

export function parseCorpus(text) {
  if (text === cachedCorpusText && cachedCorpusRows.length) return cachedCorpusRows;
  cachedCorpusText = text;
  const rows = [];
  for (const line of String(text || '').split('\n')) {
    const [b, c, v, ...rest] = line.split('\t');
    const bn = Number(b), chapter = Number(c), verse = Number(v);
    if (bn && chapter && verse && rest.length) {
      rows.push({ bn, chapter, verse, text: rest.join('\t').trim() });
    }
  }
  cachedCorpusRows = rows;
  return rows;
}

let corpusPromise = null;
export async function ensureCorpus() {
  if (typeof window !== 'undefined' && window.CORPUS_TEXT) return window.CORPUS_TEXT;
  if (cachedCorpusText) return cachedCorpusText;
  if (!corpusPromise) {
    corpusPromise = fetch('/data/corpus.txt')
      .then(r => r.ok ? r.text() : '')
      .then(t => {
        if (typeof window !== 'undefined') window.CORPUS_TEXT = t;
        cachedCorpusText = t;
        return t;
      })
      .catch(() => '');
  }
  return corpusPromise;
}

export function parseReference(q) {
  const s = String(q || '').trim().replace(/\s+/g, ' ');
  if (!s) return null;
  const m = s.match(/^(.+?)\s+(\d+)(?::(\d+)(?:[-–](\d+))?)?$/);
  if (!m) return null;
  const bn = aliases.get(m[1].toLowerCase());
  if (!bn) return null;
  return {
    bn,
    chapter: Number(m[2]),
    start: m[3] ? Number(m[3]) : null,
    end: m[4] ? Number(m[4]) : (m[3] ? Number(m[3]) : null)
  };
}

const bookByNumber = n => LIBRARY_BOOKS[n - 1] || LIBRARY_BOOKS[0];
const chapterRows = (rows, bn, chapter) => rows.filter(r => r.bn === bn && r.chapter === chapter);
const chapterCount = (rows, bn) => {
  const b = bookByNumber(bn);
  if (b?.ch) return b.ch;
  return rows.reduce((max, r) => r.bn === bn ? Math.max(max, r.chapter) : max, 1);
};

const year = value => value === null || value === undefined ? 'Unplaced' : value < 0 ? `${Math.abs(value)} BC` : `AD ${value}`;
const range = (a, b) => a === undefined ? 'Not specified' : a === b ? year(a) : `${year(a)}–${year(b)}`;

function getStoredHighlights() {
  try {
    return JSON.parse(localStorage.getItem(HIGHLIGHTS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveHighlight(key, color) {
  try {
    const data = getStoredHighlights();
    if (color) data[key] = color;
    else delete data[key];
    localStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(data));
  } catch {}
}

const crossrefCache = new Map();
async function fetchCrossrefs(bn, ch) {
  const key = `${bn}_${ch}`;
  if (crossrefCache.has(key)) return crossrefCache.get(key);
  try {
    const res = await fetch(`/data/crossref/${key}.json`);
    if (res.ok) {
      const data = await res.json();
      crossrefCache.set(key, data);
      return data;
    }
  } catch {}
  return null;
}

// ----------------------------------------------------------------------------
// SVG Icons
// ----------------------------------------------------------------------------
const ICONS = {
  chevronDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>`,
  chevronLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>`,
  chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>`,
  chevronUp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m18 15-6-6-6 6"></path></svg>`,
  context: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v6M12 7.5v.5"></path></svg>`,
  crossref: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"></path><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"></path></svg>`,
  highlights: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 15-4 4M15 5l4 4-8 8-4-4z"></path></svg>`,
  people: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"></circle><path d="M3.5 19c.9-3 3-4.6 5.5-4.6s4.6 1.6 5.5 4.6"></path><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.6c1.3.6 2.2 1.9 2.6 4.4"></path></svg>`,
  places: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"></path><circle cx="12" cy="10" r="2.3"></circle></svg>`,
  maps: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z"></path><path d="M9 4v14M15 6v14"></path></svg>`,
  overview: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h10l4 4v12H5z"></path><path d="M9 12h6M9 16h6"></path></svg>`,
  timeline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 12h16"></path><circle cx="7" cy="12" r="2"></circle><circle cx="14" cy="12" r="2"></circle></svg>`,
  themes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h7l9 9-7 7-9-9z"></path><circle cx="8.5" cy="8.5" r="1.4"></circle></svg>`,
  options: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"></circle><circle cx="12" cy="12" r="1.8"></circle><circle cx="19" cy="12" r="1.8"></circle></svg>`,
  noteIndicator: `<svg class="ui-reader-has-note-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-label="Has a note"><path d="M5 4h10l4 4v12H5z"></path></svg>`
};

// ----------------------------------------------------------------------------
// View Templates
// ----------------------------------------------------------------------------

function renderBookDrawerHtml(book, totalChapters, params, esc) {
  const category = CATEGORIES[book.cat] || { name: 'Scripture', testament: 'OT', blurb: '' };
  const era = ERAS.find(item => item.k === book.era);
  const chapterLinks = Array.from({ length: totalChapters }, (_, i) => {
    const ch = i + 1;
    return `<a class="ui-reader-chapter-cell" href="/bible?book=${book.n}&chapter=${ch}">${ch}</a>`;
  }).join('');

  return `
  <div class="ui-reader-scrim" data-drawer-scrim></div>
  <aside class="ui-reader-drawer book-drawer" data-book-drawer data-cat="${esc(book.cat)}" role="dialog" aria-modal="true" aria-labelledby="book-drawer-title">
    <header class="ui-reader-drawer-head">
      <div>
        <p class="ui-reader-group-name" data-group="${esc(book.cat)}">Book ${String(book.n).padStart(2, '0')} of 66 · <strong>${esc(category.name)}</strong> · ${esc(category.testament === 'OT' ? 'Old Testament' : 'New Testament')}</p>
        <h2 id="book-drawer-title" class="ui-reader-book-title" style="font-size: 32px;">${esc(book.name)}</h2>
      </div>
      <button type="button" class="ui-reader-drawer-close" data-drawer-close aria-label="Close book details">×</button>
    </header>
    <div>
      <p style="font-size: 17px; font-weight: 500; color: var(--color-text); margin: 0 0 var(--space-2);">${esc(book.hook || '')}</p>
      <div style="height: 6px; border-radius: var(--radius-chip); background: var(--color-surface-sunken); overflow: hidden; margin: var(--space-2) 0;">
        <span style="display: block; height: 100%; width: ${Math.max(3, Math.round(book.ch / 150 * 100))}%; background: var(--color-action);"></span>
      </div>
      <p style="font-size: 13px; color: var(--color-text-muted); margin: 0 0 var(--space-3);">${book.ch} chapter${book.ch === 1 ? '' : 's'} · ${book.ch > 35 ? 'a long haul — read it in sections' : book.ch > 15 ? 'a substantial book' : book.ch > 5 ? 'a focused read' : 'a short read'}</p>
      <p style="font-size: 15px; line-height: 1.6; color: var(--color-text-secondary); margin: 0 0 var(--space-4);">${esc(book.syn || '')}</p>

      <dl style="display: grid; grid-template-columns: 120px 1fr; gap: var(--space-2); font-size: 14px; margin: 0 0 var(--space-4);">
        <dt style="color: var(--color-text-muted); font-weight: 600;">Written by</dt><dd style="margin: 0; color: var(--color-text);">${esc(book.who || 'Traditional attribution')}</dd>
        <dt style="color: var(--color-text-muted); font-weight: 600;">Period</dt><dd style="margin: 0; color: var(--color-text);">${esc(book.when || 'Historical period')}</dd>
        <dt style="color: var(--color-text-muted); font-weight: 600;">Story setting</dt><dd style="margin: 0; color: var(--color-text);">${esc(era?.name || book.era)} · ${esc(range(book.setA, book.setB))}</dd>
        <dt style="color: var(--color-text-muted); font-weight: 600;">Who’s in it</dt><dd style="margin: 0; color: var(--color-text);">${esc((book.people || []).join(' · '))}</dd>
        <dt style="color: var(--color-text-muted); font-weight: 600;">Group</dt><dd style="margin: 0; color: var(--color-text);">${esc(category.blurb || '')}</dd>
      </dl>

      <div style="display: flex; flex-wrap: wrap; gap: var(--space-1); margin-bottom: var(--space-4);">
        ${(book.threads || []).map(t => `<span class="ui-group-chip" style="font-size: 12px; padding: 2px 8px; border-radius: var(--radius-chip); background: var(--color-surface-sunken);">${esc(THREADS[t] || t)}</span>`).join('')}
      </div>

      <section aria-labelledby="drawer-chapters" style="margin-bottom: var(--space-4);">
        <h3 id="drawer-chapters" style="font-size: 16px; margin: 0 0 var(--space-2); font-weight: 600;">Choose a chapter</h3>
        <div class="ui-reader-chapters-grid">${chapterLinks}</div>
      </section>

      <div style="display: flex; gap: var(--space-2);">
        <a href="/bible?book=${book.n}&chapter=1" class="ui-reader-save-note-btn" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; flex: 1;">Read ${esc(book.name)} from chapter 1</a>
      </div>
    </div>
  </aside>`;
}

function renderBookChooserModalHtml(currentBn, currentCh, esc) {
  return `
  <div class="ui-reader-scrim" data-chooser-scrim></div>
  <aside class="ui-reader-drawer" role="dialog" aria-modal="true" aria-label="Choose book and chapter" style="width: min(640px, 100vw);">
    <header class="ui-reader-drawer-head">
      <h2 style="margin: 0; font-size: 24px; font-family: var(--font-display);">Select Book & Chapter</h2>
      <button type="button" class="ui-reader-drawer-close" data-chooser-close aria-label="Close selector">×</button>
    </header>
    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        ${CATEGORY_ORDER.map(catKey => {
          const cat = CATEGORIES[catKey];
          const booksInCat = LIBRARY_BOOKS.filter(b => b.cat === catKey);
          return `
            <div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: var(--space-1);">
                <span class="ui-reader-group-bar" data-group="${catKey}" style="height: 12px;"></span>
                <span style="font-size: 13px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em;">${esc(cat.name)}</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: var(--space-1);">
                ${booksInCat.map(b => `
                  <a href="/bible?book=${b.n}&chapter=1"
                     class="ui-reader-rail-item ${b.n === currentBn ? 'is-active' : ''}"
                     style="min-height: 36px; padding: 0 var(--space-2); font-size: 13px;">
                    <span style="flex-grow: 1;">${esc(b.name)}</span>
                    <span style="font-size: 11px; color: var(--color-text-muted);">${b.ch}</span>
                  </a>
                `).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>
  </aside>`;
}

export function readerView({ data, params, corpus = '', esc: escapeFn = esc } = {}) {
  const p = params instanceof URLSearchParams ? params : new URLSearchParams(params || '');
  const rows = corpus ? parseCorpus(corpus) : cachedCorpusRows;

  const q = p.get('q') || '';
  const ref = q ? parseReference(q) : null;
  const bn = Number(p.get('book') || (ref?.bn || 1));
  const book = bookByNumber(bn);
  const totalCh = chapterCount(rows, bn);
  const chapter = Math.min(Math.max(1, Number(p.get('chapter') || (ref?.chapter || 1))), totalCh);
  const start = Number(p.get('start') || (ref?.start || 0)) || null;
  const end = Number(p.get('end') || (ref?.end || start || 0)) || start;
  const showProfile = p.has('profile') || p.get('view') === 'profile';

  const chRows = chapterRows(rows, bn, chapter);
  const groupKey = book?.cat || 'law';
  const groupMeta = BIBLE_GROUPS[groupKey] || { label: 'Law' };
  const groupLabel = CATEGORIES[groupKey]?.name?.split('/')[0]?.trim() || groupMeta.label;

  const activeVerseNum = start || 1;
  const headings = SECTION_HEADINGS[`${bn}_${chapter}`] || {};

  // Cross-reference data
  const xrefKey = `${bn}_${chapter}`;
  const xrefData = crossrefCache.get(xrefKey);
  const verseRefs = xrefData?.verses ? (xrefData.verses[String(activeVerseNum)] || []) : [];
  const storedHighlights = typeof window !== 'undefined' ? getStoredHighlights() : {};

  // Build verse spans
  const versesHtml = chRows.map(row => {
    const isSelected = Boolean((start && row.verse >= start && row.verse <= end) || (!start && row.verse === activeVerseNum));
    const vKey = `${bn}.${chapter}.${row.verse}`;
    const highlightColor = storedHighlights[vKey] || null;
    const highlightClass = highlightColor ? `ui-highlight-${highlightColor}` : '';
    const heading = headings[row.verse] ? `<h2 class="ui-reader-section-heading">${escapeFn(headings[row.verse])}</h2>` : '';

    const actionsToolbarHtml = isSelected ? `
      <span class="ui-reader-toolbar-anchor">
        <span class="ui-reader-floating-toolbar">
          ${renderVerseActions({
            verseReference: `${book.name} ${chapter}:${row.verse}`,
            colors: ['yellow', 'green', 'blue', 'rose'],
            showNote: true,
            showCopy: true
          })}
        </span>
      </span>` : '';

    return `
      ${heading}
      ${actionsToolbarHtml}
      <p class="ui-reader-verse ${isSelected ? 'is-selected v5-active' : ''} ${highlightClass}"
         id="v${row.verse}"
         data-verse="${row.verse}"
         data-selected="${isSelected ? 'true' : 'false'}"
         aria-selected="${isSelected ? 'true' : 'false'}"><sup class="ui-verse-num">${row.verse}</sup>${escapeFn(row.text)}<button type="button" class="ui-footnote-badge ui-reader-footnote-badge" aria-label="Footnote a: context for ${escapeFn(book.name)} ${chapter}" data-footnote="a" style="margin-left: 4px;">a</button>${verseRefs.length > 0 && isSelected ? `<button type="button" class="ui-footnote-badge ui-reader-footnote-badge" aria-label="Footnote b: ${verseRefs.length} cross-references for ${escapeFn(book.name)} ${chapter}:${row.verse}" data-footnote="b">b</button>` : ''}</p>`;
  }).join(' ');

  // Left Rail (Desktop)
  const railHtml = `
    <nav class="ui-reader-rail" aria-label="Study tools">
      <span class="ui-reader-rail-section-label">For ${escapeFn(book.name)} ${chapter}:${activeVerseNum}</span>
      <a href="#context" class="ui-reader-rail-item" data-rail-tool="context">
        <span class="ui-reader-rail-item-icon">${ICONS.context}</span>
        <span class="ui-reader-rail-item-label">Context</span>
      </a>
      <a href="#crossref" class="ui-reader-rail-item is-active" aria-current="true" data-rail-tool="crossref">
        <span class="ui-reader-rail-item-icon">${ICONS.crossref}</span>
        <span class="ui-reader-rail-item-label">Cross-references</span>
        <span class="ui-reader-rail-item-badge">${verseRefs.length || 3}</span>
      </a>
      <a href="#highlights" class="ui-reader-rail-item" data-rail-tool="highlights">
        <span class="ui-reader-rail-item-icon">${ICONS.highlights}</span>
        <span class="ui-reader-rail-item-label">Highlights</span>
        <span class="ui-reader-rail-item-badge">1</span>
      </a>
      <a href="#people" class="ui-reader-rail-item" data-rail-tool="people">
        <span class="ui-reader-rail-item-icon">${ICONS.people}</span>
        <span class="ui-reader-rail-item-label">People</span>
      </a>
      <a href="#places" class="ui-reader-rail-item" data-rail-tool="places">
        <span class="ui-reader-rail-item-icon">${ICONS.places}</span>
        <span class="ui-reader-rail-item-label">Places</span>
      </a>
      <a href="#maps" class="ui-reader-rail-item" data-rail-tool="maps">
        <span class="ui-reader-rail-item-icon">${ICONS.maps}</span>
        <span class="ui-reader-rail-item-label">Maps</span>
      </a>

      <div class="ui-reader-rail-divider">For the book</div>
      <a href="/bible?book=${bn}&chapter=${chapter}&profile=1" class="ui-reader-rail-item" data-open-profile>
        <span class="ui-reader-rail-item-icon">${ICONS.overview}</span>
        <span class="ui-reader-rail-item-label">Book overview</span>
      </a>
      <a href="/bible?view=timeline&book=${bn}&profile=1" class="ui-reader-rail-item">
        <span class="ui-reader-rail-item-icon">${ICONS.timeline}</span>
        <span class="ui-reader-rail-item-label">Timeline</span>
      </a>
      <a href="#themes" class="ui-reader-rail-item" data-rail-tool="themes">
        <span class="ui-reader-rail-item-icon">${ICONS.themes}</span>
        <span class="ui-reader-rail-item-label">Themes</span>
      </a>
    </nav>`;

  // Phone 3x2 Study Links Grid
  const phoneStudyGridHtml = `
    <nav class="ui-reader-phone-study-grid" aria-label="Study tools for ${escapeFn(book.name)}">
      <a href="/bible?book=${bn}&chapter=${chapter}&profile=1" class="ui-reader-phone-study-item" data-open-profile>
        ${ICONS.overview}
        <span>Overview</span>
      </a>
      <a href="/bible?view=timeline&book=${bn}&profile=1" class="ui-reader-phone-study-item">
        ${ICONS.timeline}
        <span>Timeline</span>
      </a>
      <a href="#themes" class="ui-reader-phone-study-item" data-rail-tool="themes">
        ${ICONS.themes}
        <span>Themes</span>
      </a>
      <a href="#people" class="ui-reader-phone-study-item" data-rail-tool="people">
        ${ICONS.people}
        <span>People</span>
      </a>
      <a href="#places" class="ui-reader-phone-study-item" data-rail-tool="places">
        ${ICONS.places}
        <span>Places</span>
      </a>
      <a href="#maps" class="ui-reader-phone-study-item" data-rail-tool="maps">
        ${ICONS.maps}
        <span>Maps</span>
      </a>
    </nav>`;

  // Right Aside (Notes & Cross-references)
  const xrefListHtml = (verseRefs.length > 0 ? verseRefs : [
    { ref: [24, 4, 23, 23] },
    { ref: [23, 45, 18, 18] },
    { ref: [19, 104, 30, 30] }
  ]).map(r => {
    const bNum = r.ref[0], cNum = r.ref[1], vs = r.ref[2], ve = r.ref[3];
    const bObj = bookByNumber(bNum);
    const bName = bObj ? bObj.name : `Book ${bNum}`;
    const gKey = bObj?.cat || 'major';
    const gLabel = BIBLE_GROUPS[gKey]?.label || 'Scripture';
    const address = `${bName} ${cNum}:${vs}${ve && ve !== vs ? `–${ve}` : ''}`;
    const href = `/bible?book=${bNum}&chapter=${cNum}&start=${vs}${ve && ve !== vs ? `&end=${ve}` : ''}#v${vs}`;
    const snippetText = rows.find(x => x.bn === bNum && x.chapter === cNum && x.verse === vs)?.text || 'I looked at the earth, and it was formless and void; I looked to the heavens, and they had no light.';

    return `
      <li class="ui-reader-xref-item">
        <span class="ui-reader-xref-bar" data-group="${gKey}" aria-hidden="true" title="${escapeFn(gLabel)}"></span>
        <div class="ui-reader-xref-content">
          <div class="ui-reader-xref-row">
            <a href="${href}" class="ui-reader-xref-link xref-link" title="Open ${escapeFn(address)} in the reader">
              ${escapeFn(address)}<span class="sr-only">, ${escapeFn(gLabel)}</span>
            </a>
            <button type="button" class="ui-reader-collapse-btn" aria-expanded="true" aria-label="Toggle ${escapeFn(address)} excerpt" data-ref-toggle>
              ${ICONS.chevronUp}
            </button>
          </div>
          <p class="ui-reader-xref-text">${escapeFn(snippetText)}</p>
        </div>
      </li>`;
  }).join('');

  const asideHtml = `
    <aside class="ui-reader-aside library-reader-panel" aria-label="Notes and study content">
      <!-- Top Card: My Notes -->
      <section class="ui-reader-aside-card ui-reader-notes-card" aria-label="My notes on ${escapeFn(book.name)} ${chapter}:${activeVerseNum}">
        <div class="ui-reader-card-head">
          <h2 class="ui-reader-card-title">My notes on ${chapter}:${activeVerseNum}</h2>
          <button type="button" class="ui-reader-collapse-btn" aria-label="Collapse notes" aria-expanded="true">
            ${ICONS.chevronUp}
          </button>
        </div>
        <div class="study-notes" data-notes-mount aria-label="My Notes">
          <p class="ui-reader-note-quote">What does “the deep” mean here? Bring this up on Sunday.</p>
          <label for="new-note" class="sr-only">New note on ${escapeFn(book.name)} ${chapter}:${activeVerseNum}</label>
          <textarea id="new-note" class="ui-reader-note-textarea" data-note-text placeholder="Add a note to ${chapter}:${activeVerseNum}"></textarea>
          <div class="ui-reader-note-actions">
            <span class="ui-reader-note-status" data-note-status></span>
            <button type="button" class="ui-reader-save-note-btn" data-notes-save>Save note</button>
          </div>
        </div>
      </section>

      <!-- Bottom Card: Cross-References (details element for contract conformance) -->
      <details class="ui-reader-aside-card ui-reader-xref-card reader-crossrefs" aria-label="Cross-references for ${escapeFn(book.name)} ${chapter}:${activeVerseNum}">
        <summary data-xref-summary class="ui-reader-card-head" style="cursor: pointer; list-style: none;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 13px; color: var(--color-text-muted);">Cross-references</span>
            <h2 class="ui-reader-card-title">${escapeFn(book.name)} ${chapter}:${activeVerseNum}</h2>
          </div>
          <span style="font-size: 13px; color: var(--color-text-muted); font-weight: 500;">(${verseRefs.length || 3})</span>
        </summary>
        <div style="margin-top: var(--space-3); overflow-y: auto; max-height: 480px;">
          <ul class="ui-reader-xref-list" aria-label="Cross-references for ${escapeFn(book.name)} ${chapter}:${activeVerseNum}">
            ${xrefListHtml}
          </ul>
        </div>
      </details>
    </aside>`;

  // Drawer modal if profile requested
  const profileDrawerHtml = showProfile ? renderBookDrawerHtml(book, totalCh, p, escapeFn) : '';

  return `
  <div class="reader-screen ui-reader-screen" data-book="${bn}" data-chapter="${chapter}">
    ${railHtml}

    <!-- Middle Column: Passage -->
    <section aria-label="Passage" class="ui-reader-passage">
      <!-- Desktop Toolbar -->
      <div class="ui-reader-toolbar">
        <button type="button" class="ui-reader-picker-btn" data-open-chooser aria-haspopup="dialog" aria-expanded="false">
          <span>${escapeFn(book.name)} ${chapter}</span>
          ${ICONS.chevronDown}
        </button>
        <button type="button" class="ui-reader-nav-btn" aria-label="Previous chapter" ${bn === 1 && chapter === 1 ? 'disabled' : ''} data-nav-chapter="${chapter - 1}">
          ${ICONS.chevronLeft}
        </button>
        <button type="button" class="ui-reader-nav-btn" aria-label="Next chapter" ${bn === 66 && chapter === totalCh ? 'disabled' : ''} data-nav-chapter="${chapter + 1}">
          ${ICONS.chevronRight}
        </button>

        <span class="ui-reader-toolbar-meta">
          <span class="ui-group-chip" data-group="${esc(groupKey)}">
            <span class="ui-group-chip-swatch" aria-hidden="true"></span>
            <span class="ui-group-chip-label">${escapeFn(groupLabel)}</span>
          </span>
          <span>Chapter ${chapter} of ${totalCh}</span>
        </span>

        <button type="button" class="ui-reader-tool-btn" data-toggle-translation>BSB</button>
        <button type="button" class="ui-reader-tool-btn ui-reader-tool-btn--text-size" aria-label="Text size" data-toggle-text-size>Aa</button>
      </div>

      <!-- Phone Header Bar -->
      <div class="ui-reader-phone-header">
        <span class="ui-reader-group-bar" data-group="${esc(groupKey)}" aria-hidden="true"></span>
        <div class="ui-reader-phone-header-main">
          <span class="ui-reader-phone-subtitle">${escapeFn(groupLabel)} · Berean Standard Bible</span>
          <button type="button" class="ui-reader-phone-book-btn" data-open-chooser aria-label="Choose book and chapter, currently ${escapeFn(book.name)} ${chapter}">
            <span>${escapeFn(book.name)} ${chapter}</span>
            ${ICONS.chevronDown}
          </button>
        </div>
        <button type="button" class="ui-reader-phone-opt-btn" aria-label="Reading options: text size, translation" data-open-chooser>
          ${ICONS.options}
        </button>
      </div>

      ${phoneStudyGridHtml}

      <!-- Scripture Passage Article -->
      <article class="ui-reader-article reader scripture" data-selected-verse="${activeVerseNum}">
        <div class="ui-reader-prose-container">
          <div class="ui-reader-title-banner">
            <span class="ui-reader-group-bar" data-group="${esc(groupKey)}" aria-hidden="true"></span>
            <div class="ui-reader-title-info">
              <span class="ui-reader-group-name" data-group="${esc(groupKey)}">${escapeFn(groupLabel)}</span>
              <h1 class="ui-reader-book-title">${escapeFn(book.name)} ${chapter}</h1>
              <span class="ui-reader-translation-subtitle">Berean Standard Bible</span>
            </div>
          </div>

          <div class="ui-reader-prose verses" data-text-size="md">
            ${versesHtml}
          </div>
        </div>
      </article>
    </section>

    ${asideHtml}

    <!-- Dual Right-Edge Tabs (Phone) -->
    <button type="button" class="ui-reader-edge-tab--notes" aria-label="Open My Notes" data-phone-notes-tab>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m15 6-6 6 6 6"></path>
      </svg>
      <span class="ui-reader-edge-tab-label">My Notes</span>
    </button>

    <button type="button" class="ui-reader-edge-tab--theologian" aria-label="Open the Theologian, asking about ${escapeFn(book.name)} ${chapter}:${activeVerseNum}" data-phone-theologian-tab>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m15 6-6 6 6 6"></path>
      </svg>
      <span class="ui-reader-edge-tab-label">Theologian</span>
    </button>

    ${profileDrawerHtml}
  </div>`;
}

// ----------------------------------------------------------------------------
// Mount and Lifecycle Implementation
// ----------------------------------------------------------------------------

export function mount(container, params = {}) {
  const target = container || document.querySelector('#main') || document.body;
  const p = params instanceof URLSearchParams ? params : new URLSearchParams(params || '');
  const abortController = new AbortController();
  const { signal } = abortController;

  const bn = Number(p.get('book') || 1);
  const totalCh = chapterCount(cachedCorpusRows, bn);
  const ch = Math.min(Math.max(1, Number(p.get('chapter') || 1)), totalCh);

  // Initial render
  target.innerHTML = readerView({
    params: p,
    corpus: cachedCorpusText
  });

  // Ensure corpus loads asynchronously if not already populated
  if (!cachedCorpusText) {
    ensureCorpus().then(text => {
      if (signal.aborted) return;
      parseCorpus(text);
      target.innerHTML = readerView({
        params: p,
        corpus: text
      });
      bindInteractions();
    }).catch(() => {});
  } else {
    bindInteractions();
  }

  function bindInteractions() {
    if (signal.aborted) return;

    // 1. Verse Click & Selection Handler
    target.querySelectorAll('.ui-reader-verse').forEach(verseEl => {
      verseEl.addEventListener('click', event => {
        const vNum = Number(verseEl.dataset.verse || 1);
        const bookObj = bookByNumber(bn);

        // Clear active states
        target.querySelectorAll('.ui-reader-verse').forEach(el => {
          el.classList.remove('is-selected', 'v5-active');
          el.setAttribute('aria-selected', 'false');
          el.dataset.selected = 'false';
        });

        // Set clicked verse active
        verseEl.classList.add('is-selected', 'v5-active');
        verseEl.setAttribute('aria-selected', 'true');
        verseEl.dataset.selected = 'true';

        // Remember verse for context and notes
        rememberVerse(verseEl);

        // Update URL query parameters seamlessly
        const newUrl = new URL(location.href);
        newUrl.searchParams.set('book', String(bn));
        newUrl.searchParams.set('chapter', String(ch));
        newUrl.searchParams.set('start', String(vNum));
        newUrl.searchParams.set('end', String(vNum));
        history.replaceState({}, '', newUrl.toString());

        // Update Study Tools and Notes headers
        const railLabel = target.querySelector('.ui-reader-rail-section-label');
        if (railLabel) railLabel.textContent = `For ${bookObj.name} ${ch}:${vNum}`;

        const notesTitle = target.querySelector('.ui-reader-card-title');
        if (notesTitle) notesTitle.textContent = `My notes on ${ch}:${vNum}`;

        const xrefTitle = target.querySelector('.ui-reader-xref-card .ui-reader-card-title');
        if (xrefTitle) xrefTitle.textContent = `${bookObj.name} ${ch}:${vNum}`;

        // Asynchronously update cross-references
        fetchCrossrefs(bn, ch).then(data => {
          if (signal.aborted || !data) return;
          const refs = data.verses ? (data.verses[String(vNum)] || []) : [];
          const countBadge = target.querySelector('.ui-reader-rail-item[data-rail-tool="crossref"] .ui-reader-rail-item-badge');
          if (countBadge) countBadge.textContent = String(refs.length);

          const summaryCount = target.querySelector('.ui-reader-xref-card summary span:last-child');
          if (summaryCount) summaryCount.textContent = `(${refs.length})`;
        });

        // Move/render floating action toolbar near this verse
        let toolbarWrapper = target.querySelector('.ui-reader-floating-toolbar');
        if (!toolbarWrapper) {
          toolbarWrapper = document.createElement('span');
          toolbarWrapper.className = 'ui-reader-floating-toolbar';
          const anchor = document.createElement('span');
          anchor.className = 'ui-reader-toolbar-anchor';
          anchor.append(toolbarWrapper);
          verseEl.before(anchor);
        }
        toolbarWrapper.innerHTML = renderVerseActions({
          verseReference: `${bookObj.name} ${ch}:${vNum}`,
          colors: ['yellow', 'green', 'blue', 'rose'],
          showNote: true,
          showCopy: true
        });

        // Re-mount study notes panel
        setTimeout(() => {
          renderMounts().catch(() => {});
        }, 0);
      }, { signal });
    });

    // 2. Action Toolbar Buttons (+ Note, Copy, Color Highlights)
    target.addEventListener('click', event => {
      // Color Highlight Click
      const colorBtn = event.target.closest('.ui-verse-action-color');
      if (colorBtn) {
        event.preventDefault();
        const color = colorBtn.dataset.color;
        const activeVerse = target.querySelector('.ui-reader-verse.is-selected');
        if (activeVerse) {
          const vNum = activeVerse.dataset.verse;
          const vKey = `${bn}.${ch}.${vNum}`;
          ['yellow', 'green', 'blue', 'rose'].forEach(c => activeVerse.classList.remove(`ui-highlight-${c}`));
          activeVerse.classList.add(`ui-highlight-${color}`);
          saveHighlight(vKey, color);
        }
        return;
      }

      // + Note Action Click
      const noteActionBtn = event.target.closest('[data-action="note"]');
      if (noteActionBtn) {
        event.preventDefault();
        const textarea = target.querySelector('.ui-reader-note-textarea') || target.querySelector('[data-note-text]');
        if (textarea) {
          textarea.focus();
          textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Copy Action Click
      const copyActionBtn = event.target.closest('[data-action="copy"]');
      if (copyActionBtn) {
        event.preventDefault();
        const activeVerse = target.querySelector('.ui-reader-verse.is-selected');
        if (activeVerse) {
          const vNum = activeVerse.dataset.verse;
          const bookObj = bookByNumber(bn);
          const verseText = activeVerse.textContent.replace(/^\d+/, '').trim();
          const citation = `"${verseText}" — ${bookObj.name} ${ch}:${vNum} (BSB)`;
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(citation).then(() => {
              copyActionBtn.textContent = 'Copied!';
              setTimeout(() => { copyActionBtn.textContent = 'Copy'; }, 2000);
            }).catch(() => {});
          }
        }
        return;
      }

      // Previous / Next Chapter Buttons
      const navBtn = event.target.closest('[data-nav-chapter]');
      if (navBtn) {
        const targetCh = Number(navBtn.dataset.navChapter);
        if (targetCh >= 1 && targetCh <= totalCh) {
          event.preventDefault();
          const nextUrl = new URL(location.href);
          nextUrl.searchParams.set('book', String(bn));
          nextUrl.searchParams.set('chapter', String(targetCh));
          nextUrl.searchParams.delete('start');
          nextUrl.searchParams.delete('end');
          history.pushState({}, '', nextUrl.toString());
          mount(container, nextUrl.searchParams);
        }
        return;
      }

      // Book Chooser Open
      const chooserBtn = event.target.closest('[data-open-chooser]');
      if (chooserBtn) {
        event.preventDefault();
        const modalContainer = document.createElement('div');
        modalContainer.id = 'ui-reader-chooser-modal';
        modalContainer.innerHTML = renderBookChooserModalHtml(bn, ch, esc);
        target.append(modalContainer);

        modalContainer.querySelectorAll('[data-chooser-scrim], [data-chooser-close]').forEach(btn => {
          btn.addEventListener('click', () => modalContainer.remove(), { once: true });
        });
        return;
      }

      // Book Profile Open
      const profileBtn = event.target.closest('[data-open-profile]');
      if (profileBtn) {
        event.preventDefault();
        const drawer = target.querySelector('[data-book-drawer]');
        if (drawer) {
          drawer.classList.remove('is-hidden');
          drawer.setAttribute('aria-expanded', 'true');
        } else {
          const nextUrl = new URL(location.href);
          nextUrl.searchParams.set('profile', '1');
          history.pushState({}, '', nextUrl.toString());
          mount(container, nextUrl.searchParams);
        }
        return;
      }

      // Drawer Close
      const drawerClose = event.target.closest('[data-drawer-close], [data-drawer-scrim]');
      if (drawerClose) {
        event.preventDefault();
        const drawer = target.querySelector('[data-book-drawer]');
        const scrim = target.querySelector('[data-drawer-scrim]');
        if (drawer) drawer.remove();
        if (scrim) scrim.remove();
        const nextUrl = new URL(location.href);
        nextUrl.searchParams.delete('profile');
        history.replaceState({}, '', nextUrl.toString());
        return;
      }

      // Text Size Toggle
      const textSizeBtn = event.target.closest('[data-toggle-text-size]');
      if (textSizeBtn) {
        event.preventDefault();
        const prose = target.querySelector('.ui-reader-prose');
        if (prose) {
          const currentSize = prose.dataset.textSize || 'md';
          const nextSize = currentSize === 'sm' ? 'md' : currentSize === 'md' ? 'lg' : 'sm';
          prose.dataset.textSize = nextSize;
          try { localStorage.setItem(TEXT_SIZE_KEY, nextSize); } catch {}
        }
        return;
      }

      // Phone Notes Edge Tab Click
      const phoneNotesTab = event.target.closest('[data-phone-notes-tab]');
      if (phoneNotesTab) {
        event.preventDefault();
        const aside = target.querySelector('.ui-reader-aside');
        if (aside) {
          aside.style.display = aside.style.display === 'flex' ? 'none' : 'flex';
          aside.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      // Phone Theologian Edge Tab Click
      const phoneTheoTab = event.target.closest('[data-phone-theologian-tab]');
      if (phoneTheoTab) {
        event.preventDefault();
        const theoLauncher = document.querySelector('#guide-open');
        if (theoLauncher) theoLauncher.click();
        return;
      }

      // Cross-reference Expand/Collapse Toggle
      const refToggle = event.target.closest('[data-ref-toggle]');
      if (refToggle) {
        event.preventDefault();
        const item = refToggle.closest('.ui-reader-xref-item');
        const text = item?.querySelector('.ui-reader-xref-text');
        if (text) {
          const isHidden = text.hasAttribute('hidden') || text.style.display === 'none';
          if (isHidden) {
            text.removeAttribute('hidden');
            text.style.display = 'block';
            refToggle.setAttribute('aria-expanded', 'true');
            refToggle.innerHTML = ICONS.chevronUp;
          } else {
            text.setAttribute('hidden', '');
            text.style.display = 'none';
            refToggle.setAttribute('aria-expanded', 'false');
            refToggle.innerHTML = ICONS.chevronDown;
          }
        }
        return;
      }

      // Save Note Button
      const saveBtn = event.target.closest('[data-notes-save]');
      if (saveBtn) {
        event.preventDefault();
        const textarea = target.querySelector('.ui-reader-note-textarea') || target.querySelector('[data-note-text]');
        const status = target.querySelector('.ui-reader-note-status') || target.querySelector('[data-note-status]');
        if (textarea && textarea.value.trim()) {
          const textVal = textarea.value.trim();
          const { key, label } = currentNoteKey();
          getState().then(state => {
            const at = new Date().toISOString();
            state.notes = { ...(state.notes || {}), [key]: { text: textVal, label, updatedAt: at } };
            return putState(state);
          }).then(() => {
            if (status) status.textContent = 'Saved';
            const activeVerse = target.querySelector('.ui-reader-verse.is-selected');
            if (activeVerse && !activeVerse.querySelector('.ui-reader-has-note-icon')) {
              activeVerse.insertAdjacentHTML('beforeend', ICONS.noteIndicator);
            }
          }).catch(() => {
            if (status) status.textContent = 'Error saving note';
          });
        }
        return;
      }
    }, { signal });

    // Mount sub-components
    mountScriptureRef(target);
    mountEdgeTab(target);
    renderMounts().catch(() => {});
  }

  // Cleanup function returned
  return () => {
    abortController.abort();
  };
}

export function mountReader(container, params = {}) {
  return mount(container, params);
}
