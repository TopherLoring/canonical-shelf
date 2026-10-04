// Panel Component (Reading Room design system)
// Provides raised surface containers using design tokens.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderPanel({
  variant = 'raised', // 'raised' | 'frame' | 'sunken'
  title = '',
  eyebrow = '',
  headerAction = '',
  body = '',
  footer = '',
  content = '', // alias/fallback for body
  ariaLabel = '',
  className = '',
  id = '',
  tag = 'section'
} = {}) {
  const variantClass = `ui-panel--${variant}`;
  const effectiveBody = body || content;
  const idAttr = id ? `id="${esc(id)}"` : '';
  const ariaAttr = ariaLabel ? `aria-label="${esc(ariaLabel)}"` : (title ? `aria-label="${esc(title)}"` : '');

  const hasHeader = Boolean(title || eyebrow || headerAction);
  const headerHtml = hasHeader ? `
    <header class="ui-panel-header">
      <div class="ui-panel-header-content">
        ${eyebrow ? `<span class="ui-panel-eyebrow">${esc(eyebrow)}</span>` : ''}
        ${title ? `<h2 class="ui-panel-title">${esc(title)}</h2>` : ''}
      </div>
      ${headerAction ? `<div class="ui-panel-header-action">${headerAction}</div>` : ''}
    </header>` : '';

  const bodyHtml = effectiveBody ? `<div class="ui-panel-body">${effectiveBody}</div>` : '';
  const footerHtml = footer ? `<footer class="ui-panel-footer">${footer}</footer>` : '';

  return `
  <${tag} class="ui-panel ${variantClass} ${esc(className)}" ${idAttr} ${ariaAttr}>
    ${headerHtml}
    ${bodyHtml}
    ${footerHtml}
  </${tag}>`;
}

