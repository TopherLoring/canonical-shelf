// Footnote Component (Reading Room design system)
// Inline badge and floating card for footnotes and glossary terms.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderFootnoteBadge({
  marker = 'a',
  label = '',
  targetId = '',
  className = ''
} = {}) {
  const ariaLabel = label || `Footnote ${marker}`;
  const targetAttr = targetId ? `aria-controls="${esc(targetId)}" aria-expanded="false"` : '';

  return `<button type="button" class="ui-footnote-badge ${esc(className)}" aria-label="${esc(ariaLabel)}" ${targetAttr}>${esc(marker)}</button>`;
}

export function renderFootnoteCard({
  marker = 'a',
  text = '',
  id = '',
  className = ''
} = {}) {
  const idAttr = id ? `id="${esc(id)}"` : '';
  return `
  <div class="ui-footnote-card ${esc(className)}" ${idAttr}>
    <span class="ui-footnote-card-marker">${esc(marker)}</span>
    <span class="ui-footnote-card-text">${esc(text)}</span>
  </div>`;
}

