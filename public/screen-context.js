// What the learner is looking at right now. Shared by the Theologian, feedback, and notes so every
// feature attaches the same context. Anchors follow docs/v7/data-dictionary.json:
//   outline anchors  lesson:<id>#scene-<n> · unit:<id> · course:<id> · mastery:<id> · topic:<id> · route:<path>
//   Scripture        osis strings such as John.3 or John.3.16-18
import { LIBRARY_BOOKS } from './library-data.js';
import { osisOf } from './bible-books.js';

const clip = (v, n) => String(v || '').trim().slice(0, n);
const bookName = n => LIBRARY_BOOKS.find(b => b.n === n)?.name || `Book ${n}`;

// The verse the learner selected in the reader (the reader marks it with .v5-active and an id "v<n>").
export function selectedVerse() {
  const el = document.querySelector('.reader.scripture .verses p.v5-active');
  const n = el ? Number(String(el.id || '').replace(/^v/, '')) : 0;
  if (n) return n;
  // A verse clicked before the reader finished loading is remembered on the reader itself.
  const remembered = Number(document.querySelector('[data-reader]')?.dataset.selectedVerse || document.querySelector('.reader.scripture')?.dataset.selectedVerse || 0);
  return remembered || null;
}

// Record the clicked verse immediately, independent of the reader's own (asynchronous) setup.
export function rememberVerse(p) {
  const reader = p?.closest?.('.reader.scripture');
  if (!reader) return;
  const list = [...reader.querySelectorAll('.verses p')];
  const n = Number(String(p.id || '').replace(/^v/, '')) || list.indexOf(p) + 1;
  if (n) reader.dataset.selectedVerse = String(n);
}

export function currentPassage() {
  if (location.pathname !== '/bible') return null;
  const params = new URLSearchParams(location.search);
  const reader = document.querySelector('[data-reader]');
  const book = Number(reader?.dataset.book || params.get('book') || 0), chapter = Number(reader?.dataset.chapter || params.get('chapter') || 0);
  if (!book || !chapter) return null;
  const verse = reader ? Number(reader.dataset.selectedVerse) || null : selectedVerse() || Number(params.get('start') || 0) || null;
  const end = verse ? (reader ? Number(reader.dataset.selectedEnd) || verse : selectedVerse() ? verse : Number(params.get('end') || verse)) : null;
  const address = { book, chapter, verseStart: verse, verseEnd: end };
  const label = `${bookName(book)} ${chapter}${verse ? `:${verse}${end && end > verse ? `–${end}` : ''}` : ''}`;
  return { address, osis: osisOf(address), label };
}

export function outlineAnchor() {
  const params = new URLSearchParams(location.search), route = location.pathname;
  if (route === '/course') {
    if (params.get('mastery')) return `mastery:${params.get('mastery')}`;
    if (params.get('lesson')) return `lesson:${params.get('lesson')}${params.get('scene') ? `#scene-${params.get('scene')}` : ''}`;
    if (params.get('unit')) return `unit:${params.get('unit')}`;
    if (params.get('course')) return `course:${params.get('course')}`;
  }
  if (route === '/topics' && params.get('topic')) return `topic:${params.get('topic')}`;
  return `route:${route || '/'}`;
}

export function screenLabel() {
  const passage = currentPassage();
  if (passage) return passage.label;
  const pick = sel => document.querySelector(sel)?.textContent?.trim();
  return clip(pick('.study-focus__identity strong') || pick('.topic-reference-page h1') || pick('main h1') || 'Canonical Shelf', 200);
}

export function screenContext() {
  const passage = currentPassage(), html = document.documentElement;
  return {
    route: `${location.pathname}${location.search}`.slice(0, 512),
    label: screenLabel(),
    anchor: outlineAnchor(),
    scripture: passage?.osis,
    theme: html.dataset.theme || '',
    mode: html.dataset.mode || '',
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    appVersion: document.querySelector('meta[name="app-version"]')?.content || ''
  };
}
