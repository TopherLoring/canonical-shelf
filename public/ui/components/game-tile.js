// GameTile Component (Reading Room design system)
// Visual tile for Review & Practice activities.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderGameTile({
  title = '',
  description = '',
  badge = '',
  icon = '',
  href = '#',
  className = ''
} = {}) {
  const iconHtml = icon ? `<div class="ui-game-tile-icon" aria-hidden="true">${icon}</div>` : '';
  const badgeHtml = badge ? `<span class="ui-game-tile-badge">${esc(badge)}</span>` : '';

  return `
  <a href="${esc(href)}" class="ui-game-tile ${esc(className)}">
    <div class="ui-game-tile-top">
      ${iconHtml}
      ${badgeHtml}
    </div>
    <h3 class="ui-game-tile-title">${esc(title)}</h3>
    ${description ? `<p class="ui-game-tile-desc">${esc(description)}</p>` : ''}
  </a>`;
}

