// VerseText Component (Reading Room design system)
// Selectable verses, word-level highlights, note underline, footnote badges.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderVerseSpan({
  verseNumber = null,
  text = '',
  isSelected = false,
  hasNote = false,
  highlightColor = null, // 'yellow' | 'green' | 'blue' | 'rose'
  className = ''
} = {}) {
  const selectedClass = isSelected ? 'is-selected' : '';
  const noteClass = hasNote ? 'has-note' : '';
  const highlightClass = highlightColor ? `ui-highlight-${highlightColor}` : '';

  const numHtml = verseNumber ? `<sup class="ui-verse-num">${verseNumber}</sup>` : '';
  const noteIcon = hasNote ? `<svg class="ui-verse-note-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-label="Has a note"><path d="M5 4h10l4 4v12H5z"></path></svg>` : '';

  return `<span class="ui-verse-span ${selectedClass} ${noteClass} ${highlightClass} ${esc(className)}">${numHtml}${text}</span>${noteIcon}`;
}

export function renderVersePassage({
  verses = [], // Array of { verseNumber, text, isSelected, hasNote, highlightColor }
  className = '',
  tag = 'p'
} = {}) {
  const content = verses.map(v => renderVerseSpan(v)).join(' ');
  return `<${tag} class="ui-verse-passage ${esc(className)}">${content}</${tag}>`;
}

