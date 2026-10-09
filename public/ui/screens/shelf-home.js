import { LIBRARY_BOOKS, CATEGORY_ORDER } from '../../library-data.js';
import { GROUP_NAMES } from '../labels.js';
import { setFrameVariant } from '../components/index.js';
import { getState } from '../../db.js';
import { noteHref } from '../../study-notes.js';
import { markOrientationSeen, orientationSeen } from '../../orientation.js';

const ORIENTATION_HREF = '/course?unit=unit.orientation&lesson=orientation';

// Counts from the bundled BSB corpus; used to scale book widths to their relative length.
const VERSE_COUNTS = [1533,1213,859,1288,959,658,618,85,810,695,816,719,942,822,280,406,167,1070,2461,915,222,117,1292,1364,154,1273,357,197,73,146,21,48,105,47,56,53,38,211,55,1068,673,1149,878,1003,432,437,257,149,155,104,95,89,47,113,83,46,25,303,108,105,61,105,13,14,25,404];

// The template's group ids differ from the library's; the shelf's colours are keyed by the template's.
const GROUP_KEY = { law: 'law', othist: 'history', wisdom: 'wisdom', major: 'major', minor: 'minor', gospel: 'gospels', paul: 'paul', general: 'general', apoc: 'revelation' };
const groupKey = cat => GROUP_KEY[cat] || cat;

// Spine geometry from the template: width follows the square root of the verse count; the Old Testament fills the
// shelf, the New Testament 80% of it; heights vary a little so the row reads as books rather than bars.
const JITTER = [0, 7, -5, 3, -8, 6, -2, 9, -6, 2, 5, -4, 8, -7, 1];
const SHELF = 886, LEAN = 12, OT = 39;

function spineWeights() {
  const root = n => Math.sqrt(VERSE_COUNTS[n] || 1);
  const sumOT = VERSE_COUNTS.slice(0, OT).reduce((sum, _, k) => sum + root(k), 0);
  const perOT = (SHELF - OT * 10) / sumOT;
  const sumNT = VERSE_COUNTS.slice(OT).reduce((sum, _, k) => sum + root(OT + k), 0);
  const perNT = (SHELF * 0.8 - 34 - 27 * 20) / sumNT;
  return VERSE_COUNTS.map((_, k) => k < OT ? 10 + perOT * root(k) : 20 + perNT * root(k));
}

const chapters = n => n + ' chapter' + (n === 1 ? '' : 's');

function shelfRow(from, to, label, selectedNumber, esc) {
  const weights = spineWeights();
  let prevH = 0, used = 0;
  const books = LIBRARY_BOOKS.slice(from, to).map((book, k) => {
    const n = from + k;
    const h = Math.round(Math.min(204, 186 + JITTER[n % JITTER.length]) * 0.64);
    const lean = book.n === 66 ? Math.round(prevH * Math.tan(LEAN * Math.PI / 180)) : 0;
    prevH = h; used += weights[n];
    const name = esc(book.name);
    return '<button type="button" class="cs-spine' + (book.n === selectedNumber ? ' is-selected' : '') + (lean ? ' is-leaning' : '') +
      '" data-group="' + groupKey(book.cat) + '" data-book="' + name + '" data-book-select="' + book.n +
      '" aria-label="' + name + ', ' + esc(GROUP_NAMES[book.cat] || '') + ', ' + chapters(book.ch) +
      '" aria-pressed="' + (book.n === selectedNumber) + '" data-w="' + weights[n].toFixed(2) + '" data-h="' + h + '" data-lean="' + lean + '">' +
      '<span class="cs-spine__cap"></span><span class="cs-spine__rib"></span><span class="cs-spine__rib cs-spine__rib--low"></span><span class="cs-spine__cap cs-spine__cap--low"></span></button>';
  }).join('');
  const room = Math.max(0, SHELF - used - (from ? 34 : 0));
  return '<div class="cs-shelf-row"><span class="cs-bookend"></span>' + books + '<span class="cs-bookend"></span>' +
    (room > 1 ? '<span class="cs-shelf-room" data-w="' + room.toFixed(2) + '"></span>' : '') +
    '</div><div class="cs-plank"><span class="cs-plank__foot"></span><span class="cs-plank__foot cs-plank__foot--end"></span><span class="cs-plaque">' + esc(label) + '</span></div>';
}

// Spine sizes and the reading-position bar come from data attributes, applied through the CSSOM (inline styles are blocked by the CSP).
function paint(root) {
  root?.querySelectorAll('[data-w]').forEach(el => {
    el.style.setProperty('--w', el.dataset.w);
    if (el.dataset.h) { el.style.setProperty('--h', el.dataset.h); el.style.setProperty('--lean', el.dataset.lean || '0'); }
  });
  root?.querySelectorAll('[data-pct]').forEach(el => el.style.setProperty('--pct', el.dataset.pct + '%'));
}

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

function readingOf(book, reading) {
  const chapter = reading?.book === book.n && reading.chapter > 0 ? Math.min(reading.chapter, book.ch) : null;
  return { chapter, progress: chapter ? Math.round(chapter / book.ch * 100) : 0 };
}

const tag = (cat, esc) => '<span class="cs-tag" data-group="' + groupKey(cat) + '"><span class="cs-tag__dot"></span>' + esc(GROUP_NAMES[cat] || '') + '</span>';

function bookPanel(book, reading, esc) {
  const { chapter, progress } = readingOf(book, reading);
  const people = (book.people || []).slice(0, 6);
  const openChapter = chapter || 1;
  return '<span class="cs-book__meta">' + tag(book.cat, esc) + 'Book ' + book.n + ' of 66</span>' +
    '<div class="cs-book__head"><h2 id="shelf-selected-title">' + esc(book.name) + '</h2><span class="cs-book__tagline">' + esc(book.hook || '') + '</span></div>' +
    '<p class="cs-book__synopsis">' + esc(book.syn || '') + '</p>' +
    '<div class="cs-split shelf-book-panel__reading"><span>' + chapters(book.ch) + '</span><span>' +
      (chapter ? 'Last opened · chapter ' + chapter : 'Ready to explore') + '</span></div>' +
    (chapter ? '<div class="cs-bar shelf-book-panel__progress" role="progressbar" aria-label="' + esc(book.name) +
      ' reading position" aria-valuenow="' + progress + '" aria-valuemin="0" aria-valuemax="100"><span data-pct="' + progress + '"></span></div>' : '') +
    '<a class="cs-button cs-button--block cs-button--tall shelf-book-panel__resume" href="/bible?book=' + book.n + '&chapter=' + openChapter + '">' +
      (chapter ? 'Resume ' + esc(book.name) + ' ' + openChapter : 'Open ' + esc(book.name) + ' in the Bible') + '</a>' +
    '<a class="cs-book__overview shelf-book-panel__overview" href="/bible?book=' + book.n + '&profile=1">Book overview</a>' +
    '<dl class="cs-book__facts"><div><dt>Read first</dt><dd>' + esc(book.read || 'Start with chapter 1 of ' + book.name + '.') + '</dd></div>' +
    (people.length ? '<div><dt>People</dt><dd class="cs-chips shelf-book-panel__people">' + people.map(person => '<span>' + esc(person) + '</span>').join('') + '</dd></div>' : '') +
    '<div><dt>Setting</dt><dd>' + esc(book.when || '') + '</dd></div></dl>';
}

// Phone: the selected book docks above the bottom bar (title, tagline, Resume, Details).
function bookDock(book, reading, esc) {
  const { chapter } = readingOf(book, reading);
  return '<span class="cs-dock__meta">' + tag(book.cat, esc) + '<span>Book ' + book.n + ' of 66 · ' + chapters(book.ch) + '</span></span>' +
    '<div class="cs-dock__main"><div class="cs-dock__text"><strong>' + esc(book.name) + '</strong><span>' + esc(book.hook || '') + '</span></div>' +
    '<a class="cs-button cs-button--compact" href="/bible?book=' + book.n + '&chapter=' + (chapter || 1) + '">' +
      (chapter ? 'Resume ' + esc(book.name) + ' ' + chapter : 'Open ' + esc(book.name)) + '</a>' +
    '<a class="cs-dock__details" href="/bible?book=' + book.n + '&profile=1">Details</a></div>';
}

// "Course · Unit" for the lesson card and how far the learner is through that course (phone shows it as a bar).
function lessonContext(data, state, next) {
  const unit = (data.units || []).find(item => item.id === next.unitId);
  const course = (data.courses || []).find(item => item.id === unit?.courseId);
  const completed = new Set(state?.completed || []);
  const unitIds = new Set(data.byCourse?.[course?.id] || []);
  const lessons = (data.activities || []).filter(activity => activity.type === 'lesson' && unitIds.has(activity.unitId));
  const done = lessons.filter(activity => completed.has(activity.id)).length;
  return { caption: [course?.title, unit?.title].filter(Boolean).join(' · '), done, total: lessons.length };
}

function continueCard(data, state, activityHref, esc, reading) {
  const completed = new Set(state?.completed || []);
  // Someone new (no progress, no saved reading place, orientation not yet seen) is pointed to the Orientation first.
  if (!completed.size && !reading && !orientationSeen()) {
    return '<section class="cs-card cs-continue__card shelf-home-orient" data-orientation-first aria-label="Start here"><div><span class="cs-caption">New here? Start here</span>' +
      '<span class="cs-continue__title">Take the short orientation.</span></div><span class="shelf-home-orient__actions">' +
      '<button type="button" class="cs-button cs-button--outline cs-button--small" data-orientation-skip>Skip</button>' +
      '<a class="cs-button cs-button--small shelf-home-orient__begin" href="' + esc(ORIENTATION_HREF) + '">Begin</a></span></section>';
  }
  const next = (data.activities || []).find(activity => !completed.has(activity.id));
  if (!next) {
    return '<a class="cs-card cs-continue__card shelf-home-continue" href="/course" aria-label="Learning Path"><span class="cs-caption">Learning Path</span>' +
      '<span class="cs-continue__title">Explore the library, one step at a time.</span><span class="cs-continue__go">Open the Learning Path →</span></a>';
  }
  const ctx = lessonContext(data, state, next);
  const pct = ctx.total ? Math.round(ctx.done / ctx.total * 100) : 0;
  return '<a class="cs-card cs-continue__card shelf-home-continue" href="' + esc(activityHref(next.id)) + '" aria-label="Continue learning: ' + esc(next.title || 'Your next step') + '">' +
    '<span class="cs-caption">' + esc(ctx.caption || 'Continue learning') + '</span><span class="cs-continue__title">' + esc(next.title || 'Your next step') + '</span>' +
    '<span class="cs-continue__go shelf-desktop-only">Continue the lesson →</span>' +
    '<span class="cs-split shelf-phone-only"><span class="cs-continue__go">Continue the lesson →</span>' +
      (ctx.total ? '<span class="cs-caption">' + ctx.done + ' of ' + ctx.total + ' lessons</span>' : '') + '</span>' +
    (ctx.total ? '<div class="cs-bar shelf-phone-only" role="progressbar" aria-label="Course progress" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><span data-pct="' + pct + '"></span></div>' : '') + '</a>';
}

function noteText(note) {
  return typeof note === 'string' ? note : String(note?.text || '');
}

function myNotesCard(entries, esc) {
  const recent = entries.find(([, note]) => noteText(note).trim());
  if (!recent) {
    return '<a class="cs-card cs-continue__card" data-home-notes href="/profile#notes" aria-label="My Notes"><span class="cs-caption">My Notes</span>' +
      '<span class="cs-continue__note">Keep what you notice close. Notes you write in the Bible, a lesson, or a Topic appear here.</span><span class="cs-continue__go">Open My Notes →</span></a>';
  }
  const [key, note] = recent;
  const text = noteText(note).trim();
  const label = note.label || key;
  const isScripture = key.startsWith('scripture:');
  return '<a class="cs-card cs-continue__card" data-home-notes href="' + esc(noteHref(key)) + '" aria-label="My Notes"><span class="cs-caption">My Notes · ' + esc(label) +
    '</span><span class="cs-continue__note">' + esc(text.slice(0, 220)) + (text.length > 220 ? '…' : '') + '</span><span class="cs-continue__go">' +
    (isScripture ? 'Open in the Bible' : 'Open note') + ' →</span></a>';
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
    if (card.isConnected) card.outerHTML = '<a class="cs-card cs-continue__card" data-home-notes href="/profile#notes"><span class="cs-caption">My Notes</span><span class="cs-continue__note">My Notes are unavailable right now.</span><span class="cs-continue__go">Open My Notes →</span></a>';
  }
}

export function mount(container, ctx) {
  const { data, state, esc, activityHref } = ctx;
  const reading = savedReading();
  let selectedNumber = reading?.book || 1;
  const restoreFrame = setFrameVariant('shelf');
  const card = continueCard(data, state, activityHref, esc, reading);
  const first = card.includes('data-orientation-first');
  const selected = LIBRARY_BOOKS[selectedNumber - 1];
  const legend = '<ul class="cs-legend shelf-home__legend" aria-label="The nine shelf groups">' +
    CATEGORY_ORDER.map(key => '<li><span class="cs-swatch" data-group="' + groupKey(key) + '"></span>' + esc(GROUP_NAMES[key]) + '</li>').join('') + '</ul>';

  // A new visitor's first step goes right under the title, where it is seen before the shelf (on a phone too).
  container.innerHTML = '<section class="shelf-home" aria-labelledby="shelf-home-title">' +
    '<div class="cs-shelf-main cs-scroll cs-scroll--shelf shelf-home__library">' +
      '<div class="cs-shelf-intro shelf-home__intro"><h1 id="shelf-home-title" class="cs-title">The Canonical<br><em>Shelf</em></h1>' +
        '<p>Learn the Bible as a connected library: read in context, follow the story, ask hard questions, and build durable understanding without collapsing evidence, interpretation, and doctrine into one thing.</p></div>' +
      (first ? card : '') +
      '<section class="cs-shelf" aria-label="Canonical bookshelf">' +
        shelfRow(0, 39, 'Old Testament · 39 books', selectedNumber, esc) + shelfRow(39, 66, 'New Testament · 27 books', selectedNumber, esc) + '</section>' +
      legend +
      '<section class="cs-continue cs-start shelf-home__continue" aria-label="Continue"><span class="cs-caption cs-caption--label shelf-phone-only">Pick up where you left off</span>' +
        (first ? '' : card) + myNotesCard([], esc) + '</section>' +
      '<p class="cs-visually-hidden shelf-home__announcement" aria-live="polite"></p></div>' +
    '<aside class="cs-book shelf-book-panel shelf-desktop-only" aria-label="Selected book">' + bookPanel(selected, reading, esc) + '</aside>' +
    '<aside class="cs-dock shelf-phone-only shelf-book-dock" aria-label="Selected book">' + bookDock(selected, reading, esc) + '</aside></section>';

  paint(container);
  const onSelect = event => {
    const button = event.target.closest?.('[data-book-select]');
    if (!button || !container.contains(button)) return;
    const number = Number(button.dataset.bookSelect);
    const book = LIBRARY_BOOKS[number - 1];
    if (!book) return;
    selectedNumber = number;
    container.querySelectorAll('[data-book-select]').forEach(item => {
      const on = Number(item.dataset.bookSelect) === number;
      item.setAttribute('aria-pressed', String(on));
      item.classList.toggle('is-selected', on);
    });
    const panel = container.querySelector('.shelf-book-panel');
    if (panel) { panel.innerHTML = bookPanel(book, reading, esc); paint(panel); }
    const dock = container.querySelector('.shelf-book-dock');
    if (dock) dock.innerHTML = bookDock(book, reading, esc);
    const announcement = container.querySelector('.shelf-home__announcement');
    if (announcement) announcement.textContent = 'Selected ' + book.name + ', book ' + book.n + ' of 66.';
  };
  const onSkip = event => {
    if (!event.target.closest?.('[data-orientation-skip]')) return;
    markOrientationSeen();
    container.querySelector('[data-orientation-first]')?.remove();
    const row = container.querySelector('.shelf-home__continue');
    row?.insertAdjacentHTML('afterbegin', continueCard(data, state, activityHref, esc, reading));
    paint(row);
  };
  container.addEventListener('click', onSkip);
  container.addEventListener('click', onSelect);
  loadMyNotes(container, esc);
  return () => { container.removeEventListener('click', onSelect); container.removeEventListener('click', onSkip); restoreFrame(); };
}
