// Shelf Home Screen Track (/home — P6)
// 2-tier dark walnut bookshelf, proportional sqrt(verses) spines, Revelation lean on Jude,
// roving tabindex keyboard accessibility across all 66 books, token-driven layer styling.

import { LIBRARY_BOOKS, CATEGORIES } from '../../library-data.js';

export const VERSES = [
  1533, 1213, 859, 1288, 959, 658, 618, 85, 810, 695, 816, 719, 942, 822, 280, 406, 167, 1070, 2461, 915, 222, 117, 1292, 1364, 154, 1273, 357, 197, 73, 146, 21, 48, 105, 47, 56, 53, 38, 211, 55, // OT (39)
  1071, 678, 1151, 879, 1007, 433, 437, 257, 149, 155, 104, 95, 89, 47, 113, 83, 46, 25, 303, 108, 105, 61, 105, 13, 14, 25, 404 // NT (27)
];

const JITTER = [0, 7, -5, 3, -8, 6, -2, 9, -6, 2, 5, -4, 8, -7, 1];

export const CATEGORY_INFO = {
  law: { label: 'Law', token: 'var(--bible-law)' },
  othist: { label: 'History', token: 'var(--bible-othist)' },
  wisdom: { label: 'Wisdom & Poetry', token: 'var(--bible-wisdom)' },
  major: { label: 'Major Prophets', token: 'var(--bible-major)' },
  minor: { label: 'Minor Prophets', token: 'var(--bible-minor)' },
  gospel: { label: 'Gospels & Acts', token: 'var(--bible-gospel)' },
  paul: { label: 'Paul’s Letters', token: 'var(--bible-paul)' },
  general: { label: 'General Letters', token: 'var(--bible-general)' },
  apoc: { label: 'Revelation', token: 'var(--bible-apoc)' }
};

const esc = (s = '') => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function getBookList() {
  if (Array.isArray(LIBRARY_BOOKS) && LIBRARY_BOOKS.length === 66) {
    return LIBRARY_BOOKS;
  }
  return [];
}

function renderBookSpine(book, index, isSelected = false) {
  const isOt = index < 39;
  const isRev = index === 65; // Revelation
  const verseCount = VERSES[index] || 1000;
  const rootVerses = Math.sqrt(verseCount);

  // Proportional weight calculation based on sqrt(verses)
  const otSum = VERSES.slice(0, 39).reduce((sum, v) => sum + Math.sqrt(v), 0);
  const ntSum = VERSES.slice(39).reduce((sum, v) => sum + Math.sqrt(v), 0);
  const weight = isOt
    ? ((rootVerses / otSum) * 100).toFixed(2)
    : ((rootVerses / ntSum) * 100).toFixed(2);

  // Height jitter around 110px - 125px
  const baseH = 186;
  const heightPx = Math.round(Math.min(204, baseH + JITTER[index % JITTER.length]) * 0.64);

  const catToken = CATEGORY_INFO[book.cat]?.token || 'var(--bible-general)';
  const spineBg = `repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.04) 0px, rgba(255, 255, 255, 0.04) 1px, transparent 1px, transparent 3px), linear-gradient(90deg, color-mix(in srgb, ${catToken} 70%, black) 0%, ${catToken} 14%, color-mix(in srgb, ${catToken} 85%, white) 44%, ${catToken} 78%, color-mix(in srgb, ${catToken} 70%, black) 100%)`;

  const tooltipText = `${esc(book.name)} · ${book.ch} chapter${book.ch === 1 ? '' : 's'}`;
  const ariaLabel = `${esc(book.name)}, book ${book.n}, ${book.ch} chapter${book.ch === 1 ? '' : 's'}`;
  const selectedClass = isSelected ? 'is-selected' : '';

  const bookHtml = `
    <a href="/bible?book=${book.n}&chapter=1"
       class="shelf-book ${selectedClass}"
       data-book="${book.n}"
       data-index="${index}"
       data-group="${esc(book.cat)}"
       data-tooltip="${tooltipText}"
       aria-label="${ariaLabel}"
       tabindex="${index === 0 ? '0' : '-1'}"
       style="--book-weight: ${weight}; --book-height: ${heightPx}px; --book-spine-bg: ${spineBg};">
      <span class="shelf-book-cap-top" aria-hidden="true"></span>
      <span class="shelf-book-rib-1" aria-hidden="true"></span>
      <span class="shelf-book-rib-2" aria-hidden="true"></span>
      <span class="shelf-book-cap-bottom" aria-hidden="true"></span>
      <span class="shelf-book-tooltip" data-tooltip aria-hidden="true">${tooltipText}</span>
    </a>
  `;

  // Revelation leans 12° on Jude (book 65)
  if (isRev) {
    return `<div class="shelf-book-wrap--lean">${bookHtml}</div>`;
  }

  return bookHtml;
}

function renderAsideContent(book) {
  if (!book) return '';
  const groupLabel = CATEGORY_INFO[book.cat]?.label || 'General';
  const groupToken = CATEGORY_INFO[book.cat]?.token || 'var(--bible-general)';
  const testamentLabel = book.n <= 39 ? 'Old Testament' : 'New Testament';
  const people = Array.isArray(book.people) && book.people.length > 0 ? book.people : [];

  return `
    <div class="shelf-aside-meta">
      <span class="shelf-aside-group-chip" style="--chip-color: ${groupToken}">
        <span class="shelf-aside-group-chip-dot" aria-hidden="true"></span>
        ${esc(groupLabel)}
      </span>
      <span>${esc(testamentLabel)}</span>
    </div>
    <div class="shelf-aside-title-block">
      <h2 class="shelf-aside-title">${esc(book.name)}</h2>
      ${book.hook ? `<span class="shelf-aside-subtitle">${esc(book.hook)}</span>` : ''}
    </div>
    ${book.syn ? `<p class="shelf-aside-synopsis">${esc(book.syn)}</p>` : ''}
    <div class="shelf-aside-stats">
      <span>${book.ch} chapter${book.ch === 1 ? '' : 's'}</span>
      <span>Chapter 1</span>
    </div>
    <a href="/bible?book=${book.n}&chapter=1" class="shelf-aside-cta">
      Read ${esc(book.name)} →
    </a>
    <dl class="shelf-aside-dl">
      ${book.read ? `
        <div>
          <dt>Where to begin</dt>
          <dd>${esc(book.read)}</dd>
        </div>
      ` : ''}
      ${people.length > 0 ? `
        <div>
          <dt>People</dt>
          <dd class="shelf-aside-people-list">
            ${people.map(p => `<span class="shelf-aside-person-tag">${esc(p)}</span>`).join('')}
          </dd>
        </div>
      ` : ''}
      ${book.when ? `
        <div>
          <dt>Setting</dt>
          <dd>${esc(book.when)}</dd>
        </div>
      ` : ''}
    </dl>
  `;
}

export function shelfHomeView({ data = {}, state = {}, esc: escapeFn = esc } = {}) {
  const books = getBookList();
  const otBooks = books.slice(0, 39);
  const ntBooks = books.slice(39, 66);
  const selectedBook = books[0] || null;

  const otHtml = otBooks.map((b, i) => renderBookSpine(b, i, i === 0)).join('');
  const ntHtml = ntBooks.map((b, i) => renderBookSpine(b, 39 + i, false)).join('');

  const legendHtml = Object.entries(CATEGORY_INFO).map(([, info]) => `
    <li class="shelf-legend-item">
      <span class="shelf-legend-swatch" style="background: ${info.token};" aria-hidden="true"></span>
      <span>${esc(info.label)}</span>
    </li>
  `).join('');

  return `
    <div class="shelf-home">
      <div class="shelf-home-main">
        <header class="shelf-home-header">
          <h1 class="shelf-home-title">The Canonical<br><em>Shelf</em></h1>
          <p class="shelf-home-intro">Learn the Bible as a connected library: read in context, follow the story, ask hard questions, and build durable understanding without collapsing evidence, interpretation, and doctrine into one thing.</p>
        </header>

        <section class="shelf-bookshelf" aria-label="Bookshelf">
          <!-- Tier 1: Old Testament (Full width between bookends) -->
          <div class="shelf-tier" data-tier="ot">
            <div class="shelf-books-row">
              <span class="shelf-bookend" aria-hidden="true"></span>
              <div class="shelf-track shelf-track--ot">
                ${otHtml}
              </div>
              <span class="shelf-bookend" aria-hidden="true"></span>
            </div>
            <div class="shelf-plank">
              <span class="shelf-support-block shelf-support-block--left" aria-hidden="true"></span>
              <span class="shelf-support-block shelf-support-block--right" aria-hidden="true"></span>
              <span class="shelf-plaque">Old Testament</span>
            </div>
          </div>

          <!-- Tier 2: New Testament (80% fill between bookends, Revelation leaning 12° on Jude) -->
          <div class="shelf-tier" data-tier="nt">
            <div class="shelf-books-row">
              <span class="shelf-bookend" aria-hidden="true"></span>
              <div class="shelf-track shelf-track--nt">
                ${ntHtml}
              </div>
              <span class="shelf-bookend" aria-hidden="true"></span>
            </div>
            <div class="shelf-plank">
              <span class="shelf-support-block shelf-support-block--left" aria-hidden="true"></span>
              <span class="shelf-support-block shelf-support-block--right" aria-hidden="true"></span>
              <span class="shelf-plaque">New Testament</span>
            </div>
          </div>
        </section>

        <!-- Nine Canon Categories Legend -->
        <ul class="shelf-legend" aria-label="Canonical categories">
          ${legendHtml}
        </ul>

        <!-- Context Continuation Cards -->
        <div class="shelf-context-cards">
          <a href="/path" class="shelf-context-card">
            <span class="shelf-context-eyebrow">Learning Path · Module 1 · Unit 2</span>
            <span class="shelf-context-title">Meet the library: nine kinds of books</span>
            <span class="shelf-context-cta">Continue the lesson →</span>
          </a>
          <a href="/bible?book=1&chapter=1" class="shelf-context-card">
            <span class="shelf-context-eyebrow">Bible Reader · Genesis 1:1</span>
            <span class="shelf-context-title">In the beginning, God created the heavens and the earth.</span>
            <span class="shelf-context-cta">Open in the Bible →</span>
          </a>
        </div>
      </div>

      <!-- Right Aside: Selected Book Details -->
      <aside class="shelf-book-aside" aria-label="Selected book" id="shelf-book-aside">
        ${renderAsideContent(selectedBook)}
      </aside>
    </div>
  `;
}

export function mount(container, params = {}) {
  if (!container) return () => {};

  // Render view into container
  container.innerHTML = shelfHomeView({ params });

  const books = getBookList();
  const bookElements = Array.from(container.querySelectorAll('.shelf-book'));
  const asideElement = container.querySelector('#shelf-book-aside');

  let activeIndex = 0;
  if (params?.book) {
    const bookNum = Number(params.book);
    const foundIdx = books.findIndex(b => b.n === bookNum);
    if (foundIdx !== -1) activeIndex = foundIdx;
  }

  function updateActiveBook(newIndex, shouldFocus = false) {
    if (newIndex < 0 || newIndex >= bookElements.length) return;

    bookElements.forEach((el, idx) => {
      const isTarget = idx === newIndex;
      el.setAttribute('tabindex', isTarget ? '0' : '-1');
      el.classList.toggle('is-selected', isTarget);
    });

    activeIndex = newIndex;
    const targetBook = books[newIndex];
    if (asideElement && targetBook) {
      asideElement.innerHTML = renderAsideContent(targetBook);
    }

    if (shouldFocus && bookElements[newIndex]) {
      bookElements[newIndex].focus();
    }
  }

  // Initialize active book state
  updateActiveBook(activeIndex, false);

  function handleKeyDown(event) {
    const target = event.target;
    if (!target || !target.classList.contains('shelf-book')) return;

    const currentIndex = Number(target.dataset.index ?? activeIndex);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % 66;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + 66) % 66;
        break;
      case 'ArrowDown':
        if (currentIndex < 39) {
          // Map OT index (0..38) to NT index (39..65)
          nextIndex = Math.min(65, 39 + Math.round((currentIndex / 38) * 26));
        }
        break;
      case 'ArrowUp':
        if (currentIndex >= 39) {
          // Map NT index (39..65) to OT index (0..38)
          nextIndex = Math.round(((currentIndex - 39) / 26) * 38);
        }
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = 65;
        break;
      default:
        return;
    }

    event.preventDefault();
    updateActiveBook(nextIndex, true);
  }

  function handleFocusIn(event) {
    const target = event.target;
    if (target && target.classList.contains('shelf-book')) {
      const idx = Number(target.dataset.index);
      if (!Number.isNaN(idx) && idx !== activeIndex) {
        updateActiveBook(idx, false);
      }
    }
  }

  function handleMouseEnter(event) {
    const target = event.target;
    if (target && target.classList.contains('shelf-book')) {
      const idx = Number(target.dataset.index);
      if (!Number.isNaN(idx)) {
        updateActiveBook(idx, false);
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);
  container.addEventListener('focusin', handleFocusIn);
  container.addEventListener('mouseover', handleMouseEnter);

  // Return standard cleanup function
  return function cleanup() {
    container.removeEventListener('keydown', handleKeyDown);
    container.removeEventListener('focusin', handleFocusIn);
    container.removeEventListener('mouseover', handleMouseEnter);
  };
}
