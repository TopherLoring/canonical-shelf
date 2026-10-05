// ProgressBar & ProgressScope Component (Reading Room design system)
// Labelled progress indicators (Unit, Module, Path) with 3px radius.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderProgressBar({
  value = 0,
  max = 100,
  ariaLabel = 'Progress',
  variant = 'action', // 'action' | 'accent' | 'correct'
  className = ''
} = {}) {
  const safeMax = max > 0 ? max : 100;
  const clampedVal = Math.min(Math.max(0, value), safeMax);
  const percent = Math.round((clampedVal / safeMax) * 100);
  const variantClass = variant !== 'action' ? `ui-progress-bar--${variant}` : '';

  return `
  <progress class="ui-progress-bar ${variantClass} ${esc(className)}"
    value="${clampedVal}" max="${safeMax}"
    role="progressbar"
    aria-valuenow="${clampedVal}"
    aria-valuemin="0"
    aria-valuemax="${safeMax}"
    aria-label="${esc(ariaLabel)}">
    ${percent}%
  </progress>`;
}

export function renderProgressScope({
  scope = 'unit', // 'unit' | 'module' | 'path'
  label = '',
  status = '',
  value = 0,
  max = 100,
  ariaLabel = '',
  variant = 'action',
  className = ''
} = {}) {
  const effectiveAria = ariaLabel || `${label} progress: ${status || `${value} of ${max}`}`;
  const barHtml = renderProgressBar({ value, max, ariaLabel: effectiveAria, variant });

  return `
  <div class="ui-progress-scope ${esc(className)}" data-scope="${esc(scope)}">
    <div class="ui-progress-scope-header">
      <span class="ui-progress-scope-title">${esc(label)}</span>
      ${status ? `<span class="ui-progress-scope-status">${esc(status)}</span>` : ''}
    </div>
    ${barHtml}
  </div>`;
}

export function renderProgressScopeGroup({
  scopes = [],
  className = ''
} = {}) {
  const scopesHtml = scopes.map(s => renderProgressScope(s)).join('');
  return `<div class="ui-progress-scope-group ${esc(className)}">${scopesHtml}</div>`;
}

