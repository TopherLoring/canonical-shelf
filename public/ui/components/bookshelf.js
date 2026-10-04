// Bookshelf Component (Reading Room design system)
// Wall shelves displaying canonical books with verse-count widths and group colors.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderBookshelfBook({
  name = '',
  verses = 1000,
  group = 'law',
  isLean = false,
  href = '#',
  className = ''
} = {}) {
  // Proportional width based on verse count (e.g. min 14px, max 38px)
  const widthPx = Math.max(14, Math.min(38, Math.round(12 + (verses / 1500) * 16)));
  const leanClass = isLean ? 'is-lean' : '';

  return `
  <a href="${esc(href)}"
    class="ui-bookshelf-book ${leanClass} ${esc(className)}"
    data-group="${esc(group)}"
    style="width: ${widthPx}px;"
    title="${esc(name)} (${verses} verses)"
    aria-label="${esc(name)}">
  </a>`;
}

export function renderBookshelfRow({
  title = '',
  countText = '',
  books = [], // Array of { name, verses, group, isLean, href }
  className = ''
} = {}) {
  const booksHtml = books.map(b => renderBookshelfBook(b)).join('');

  return `
  <div class="ui-bookshelf-row ${esc(className)}">
    <div class="ui-bookshelf-row-header">
      <h3 class="ui-bookshelf-row-title">${esc(title)}</h3>
      ${countText ? `<span class="ui-bookshelf-row-count">${esc(countText)}</span>` : ''}
    </div>
    <div class="ui-bookshelf-shelf">
      ${booksHtml}
    </div>
  </div>`;
}

export function renderBookshelf({
  rows = [], // Array of { title, countText, books }
  className = ''
} = {}) {
  const rowsHtml = rows.map(r => renderBookshelfRow(r)).join('');
  return `<div class="ui-bookshelf ${esc(className)}">${rowsHtml}</div>`;
}

