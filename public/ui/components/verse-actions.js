// VerseActions Component (Reading Room design system)
// Floating toolbar with highlight colors, + Note, and Copy.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderVerseActions({
  verseReference = '',
  colors = ['yellow', 'green', 'blue', 'rose'],
  showNote = true,
  showCopy = true,
  className = ''
} = {}) {
  const ariaLabel = verseReference ? `Actions for ${verseReference}` : 'Verse actions';
  const colorButtons = colors.map(c => `
    <button type="button" class="ui-verse-action-color" data-color="${c}" aria-label="Highlight ${c}"></button>
  `).join('');

  return `
  <div role="toolbar" class="ui-verse-actions ${esc(className)}" aria-label="${esc(ariaLabel)}">
    ${colorButtons}
    <span class="ui-verse-actions-divider" aria-hidden="true"></span>
    ${showNote ? `<button type="button" class="ui-verse-action-btn" data-action="note">+ Note</button>` : ''}
    ${showCopy ? `<button type="button" class="ui-verse-action-btn" data-action="copy">Copy</button>` : ''}
  </div>`;
}

