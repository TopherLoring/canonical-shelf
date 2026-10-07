import { LIBRARY_BOOKS, CATEGORIES, ERAS, CATEGORY_ORDER } from '../../library-data.js';
import { renderBookshelf } from '../components/bookshelf.js';
import { renderGroupChip } from '../components/group-chip.js';
import { getState } from '../../db.js';
import { noteHref } from '../../study-notes.js';

// Counts from the bundled BSB corpus; used to scale book widths to their relative length.
const VERSE_COUNTS = [1533,1213,859,1288,959,658,618,85,810,695,816,719,942,822,280,406,167,1070,2461,915,222,117,1292,1364,154,1273,357,197,73,146,21,48,105,47,56,53,38,211,55,1068,673,1149,878,1003,432,437,257,149,155,104,95,89,47,113,83,46,25,303,108,105,61,105,13,14,25,404];

function savedReading() {
  try {
    const state = JSON.parse(localStorage.getItem('canonical-shelf-bible-state-v1') || '{}');
    const book = Number(state.lastBook) || 0;
    const chapter = Number(state.lastChapter);
    return book >= 1 && book <= 66 ? { book, chapter: Number.isInteger(chapter) && chapter > 0 ? chapter : null } : null;
  } catch {
    return null;
  }
}

function bookPanel(book, reading, esc) {
  const chapter = reading?.book === book.n && reading.chapter > 0 ? Math.min(reading.chapter, book.ch) : null;
  const progress = chapter ? Math.round(chapter / book.ch * 100) : 0;
  const people = (book.people || []).slice(0, 6);
  const category = CATEGORIES[book.cat] || {};
  const era = ERAS.find(item => item.k === book.era);
  const openChapter = chapter || 1;

  return '<div class="shelf-book-panel__topline">' +
      renderGroupChip({ group: book.cat }) + '<span>Book ' + book.n + ' of 66</span></div>' +
    '<header class="shelf-book-panel__heading"><h2 id="shelf-selected-title">' + esc(book.name) +
      '</h2><p>' + esc(book.hook || '') + '</p></header>' +
    '<p class="shelf-book-panel__summary">' + esc(book.syn || '') + '</p>' +
    '<div class="shelf-book-panel__reading"><span>' + book.ch + ' chapters</span><span>' +
      (chapter ? 'Last opened · chapter ' + chapter : 'Ready to explore') + '</span></div>' +
    (chapter ? '<div class="shelf-book-panel__progress" role="progressbar" aria-label="' + esc(book.name) +
      ' reading position" aria-valuenow="' + progress + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + progress + '%"></span></div>' : '') +
    '<a class="shelf-book-panel__resume" href="/bible?book=' + book.n + '&chapter=' + openChapter + '">' +
      (chapter ? 'Resume ' + esc(book.name) + ' ' + openChapter : 'Open ' + esc(book.name) + ' in the Bible') + '</a>' +
    '<a class="shelf-book-panel__overview" href="/bible?view=shelf&book=' + book.n + '&profile=1">Book overview</a>' +
    '<dl class="shelf-book-panel__details"><div><dt>Where to begin</dt><dd>' +
      esc(book.read || 'Start with chapter 1 of ' + book.name + '.') + '</dd></div>' +
    (people.length ? '<div><dt>People</dt><dd class="shelf-book-panel__people">' +
      people.map(person => '<span>' + esc(person) + '</span>').join('') + '</dd></div>' : '') +
    '<div><dt>Setting</dt><dd>' + esc(book.when || era?.name || '') + '</dd></div>' +
    (category.blurb ? '<div class="shelf-book-panel__group-note"><dt>' + esc(category.name || '') +
      '</dt><dd>' + esc(category.blurb) + '</dd></div>' : '') + '</dl>';
}

function continueCard(data, state, activityHref, esc) {
  const completed = new Set(state?.completed || []);
  const next = (data.activities || []).find(activity => !completed.has(activity.id));
  if (!next) {
    return '<section class="shelf-home-continue" aria-label="Learning Path"><div><p class="eyebrow">Learning Path</p>' +
      '<h2>Explore the library, one step at a time.</h2></div><a class="button button--primary" href="/course">Open the Learning Path</a></section>';
  }
  return '<section class="shelf-home-continue" aria-label="Continue learning"><div><p class="eyebrow">Continue learning</p>' +
    '<h2>' + esc(next.title || 'Your next step') + '</h2></div><a class="button button--primary" href="' +
    esc(activityHref(next.id)) + '">Continue</a></section>';
}

function noteText(note) {
  return typeof note === 'string' ? note : String(note?.text || '');
}

function myNotesCard(entries, esc) {
  const recent = entries.find(([, note]) => noteText(note).trim());
  if (!recent) {
    return '<section class="shelf-home-notes" data-home-notes aria-label="My Notes"><div><p class="eyebrow">My Notes</p>' +
      '<h2>Keep what you notice close.</h2><p>Notes you write in the Bible, a lesson, or a Topic appear here.</p></div>' +
      '<a href="/profile#notes">Open My Notes</a></section>';
  }
  const [key, note] = recent;
  const text = noteText(note).trim();
  const label = note.label || key;
  const isScripture = key.startsWith('scripture:');
  return '<section class="shelf-home-notes" data-home-notes aria-label="My Notes"><div><p class="eyebrow">My Notes · ' +
    esc(label) + '</p><p class="shelf-home-notes__excerpt">' + esc(text.slice(0, 220)) +
    (text.length > 220 ? '…' : '') + '</p></div><a href="' + esc(noteHref(key)) + '">' +
    (isScripture ? 'Open in the Bible' : 'Open note') + ' →</a></section>';
}

async function loadMyNotes(container, esc) {
  const card = container.querySelector('[data-home-notes]');
  if (!card) return;
  try {
    const state = await getState();
    if (!card.isConnected) return;
    const entries = Object.entries(state.notes || {}).sort(([, a], [, b]) =>
      String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
    card.outerHTML = myNotesCard(entries, esc);
  } catch {
    if (card.isConnected) card.outerHTML = '<section class="shelf-home-notes" data-home-notes aria-label="My Notes"><p>My Notes are unavailable right now.</p><a href="/profile#notes">Open My Notes</a></section>';
  }
}

export function mount(container, ctx) {
  const { data, state, esc, activityHref } = ctx;
  const reading = savedReading();
  let selectedNumber = reading?.book || 1;
  const books = LIBRARY_BOOKS.map(book => ({
    ...book,
    verses: VERSE_COUNTS[book.n - 1] || 1,
    isLean: book.n === 66,
    selectable: true,
    selected: book.n === selectedNumber
  }));
  const rows = [
    { title: 'Old Testament', countText: '39 books', books: books.filter(book => book.n <= 39) },
    { title: 'New Testament', countText: '27 books', fill: 80, books: books.filter(book => book.n >= 40) }
  ];

  container.innerHTML = '<section class="shelf-home" aria-labelledby="shelf-home-title">' +
    '<div class="shelf-home__library"><header class="shelf-home__intro">' +
      '<h1 id="shelf-home-title">The Canonical<br><em>Shelf</em></h1>' +
      '<p>Learn the Bible as a connected library: read in context, follow the story, ask hard questions, and build durable understanding without collapsing evidence, interpretation, and doctrine into one thing.</p>' +
    '</header><section class="shelf-home__collection" aria-label="Canonical bookshelf">' +
      renderBookshelf({ rows, className: 'shelf-home-bookshelf' }) + '</section>' +
    '<ul class="shelf-home__legend" aria-label="The nine shelf groups">' +
      CATEGORY_ORDER.map(key => '<li>' + renderGroupChip({ group: key }) + '</li>').join('') + '</ul>' +
      continueCard(data, state, activityHref, esc) + myNotesCard([], esc) + '</div>' +
    '<aside class="shelf-book-panel" aria-label="Selected book">' +
      bookPanel(LIBRARY_BOOKS[selectedNumber - 1], reading, esc) + '</aside>' +
    '<p class="shelf-home__announcement" aria-live="polite"></p></section>';

  const onSelect = event => {
    const button = event.target.closest?.('[data-book-select]');
    if (!button || !container.contains(button)) return;
    const number = Number(button.dataset.bookSelect);
    const book = LIBRARY_BOOKS[number - 1];
    if (!book) return;
    selectedNumber = number;
    container.querySelectorAll('[data-book-select]').forEach(item => {
      item.setAttribute('aria-pressed', String(Number(item.dataset.bookSelect) === number));
    });
    const panel = container.querySelector('.shelf-book-panel');
    if (panel) panel.innerHTML = bookPanel(book, reading, esc);
    const announcement = container.querySelector('.shelf-home__announcement');
    if (announcement) announcement.textContent = 'Selected ' + book.name + ', book ' + book.n + ' of 66.';
  };
  container.addEventListener('click', onSelect);
  loadMyNotes(container, esc);
  return () => container.removeEventListener('click', onSelect);
}
