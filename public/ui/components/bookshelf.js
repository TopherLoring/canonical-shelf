// Bookshelf Component (Reading Room design system).
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderBookshelfBook({
  name = '',
  number = '',
  n = '',
  verses = 1000,
  group = 'law',
  isLean = false,
  href = '#',
  selectable = false,
  selected = false,
  className = ''
} = {}) {
  const widthWeight = Math.max(1, Number(verses) || 1);
  const bookNumber = Number(number || n);
  const leanClass = isLean ? 'is-lean' : '';
  const shared = 'class="ui-bookshelf-book ' + leanClass + ' ' + esc(className) +
    '" data-group="' + esc(group) + '" data-book-name="' + esc(name) +
    '" style="--book-weight:' + widthWeight + '"';
  const label = 'title="' + esc(name) + '" aria-label="' +
    (selectable ? 'Select ' + esc(name) : esc(name)) + '"';
  if (selectable) {
    return '<button type="button" ' + shared + ' data-book-select="' + bookNumber +
      '" aria-pressed="' + Boolean(selected) + '" ' + label +
      '><span class="ui-bookshelf-book__name" aria-hidden="true">' + esc(name) + '</span></button>';
  }
  return '<a href="' + esc(href) + '" ' + shared + ' ' + label +
    '><span class="ui-bookshelf-book__name" aria-hidden="true">' + esc(name) + '</span></a>';
}

export function renderBookshelfRow({
  title = '',
  countText = '',
  books = [],
  fill = 100,
  className = ''
} = {}) {
  const booksHtml = books.map(book => renderBookshelfBook(book)).join('');
  const fillWidth = Math.max(1, Math.min(100, Number(fill) || 100)) + '%';
  const rowName = title || 'Books';
  return '<section class="ui-bookshelf-row ' + esc(className) + '" aria-label="' + esc(rowName) + '">' +
    '<div class="ui-bookshelf-row-header"><h2 class="ui-bookshelf-row-title">' + esc(title) + '</h2>' +
    (countText ? '<span class="ui-bookshelf-row-count">' + esc(countText) + '</span>' : '') + '</div>' +
    '<div class="ui-bookshelf-shelf" role="group" aria-label="' + esc(rowName) + ' books">' +
    '<div class="ui-bookshelf-book-run" style="--books-fill:' + fillWidth + '">' +
    '<span class="ui-bookshelf-bookend" aria-hidden="true"></span>' + booksHtml +
    '<span class="ui-bookshelf-bookend" aria-hidden="true"></span></div>' +
    '<span class="ui-bookshelf-support ui-bookshelf-support--right" aria-hidden="true"></span></div></section>';
}

export function renderBookshelf({ rows = [], className = '' } = {}) {
  return '<div class="ui-bookshelf ' + esc(className) + '">' +
    rows.map(row => renderBookshelfRow(row)).join('') + '</div>';
}
