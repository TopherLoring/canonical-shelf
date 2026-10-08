// ScriptureBlock Component (Reading Room design system)
// Verse text container on scriptureBed with Literata font and canon group bar.

import { renderGroupChip } from './group-chip.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderScriptureBlock({
  quote = '',
  reference = '',
  group = 'gospel',
  groupLabel = '',
  translation = 'BSB',
  contextHref = '',
  className = ''
} = {}) {
  const chipHtml = renderGroupChip({ group, label: groupLabel });
  const refText = reference ? `${esc(reference)}${translation ? ` · ${esc(translation)}` : ''}` : '';
  const contextLinkHtml = contextHref ? `<a href="${esc(contextHref)}" class="ui-scripture-block-context">Read in context</a>` : '';

  return `
  <figure class="ui-scripture-block ${esc(className)}" data-group="${esc(group)}">
    <blockquote class="ui-scripture-block-quote">${quote}</blockquote>
    <figcaption class="ui-scripture-block-caption">
      <div class="ui-scripture-block-meta">
        ${chipHtml}
        ${refText ? `<span class="ui-scripture-block-ref">${refText}</span>` : ''}
      </div>
      ${contextLinkHtml}
    </figcaption>
  </figure>`;
}

export function renderScriptureHeader({
  title = '',
  group = 'law',
  groupLabel = '',
  sub = 'Berean Standard Bible',
  className = ''
} = {}) {
  return `
  <div class="ui-scripture-header ${esc(className)}" data-group="${esc(group)}">
    <span class="ui-scripture-header-bar" aria-hidden="true"></span>
    <div class="ui-scripture-header-text">
      ${groupLabel ? `<span class="ui-scripture-header-group">${esc(groupLabel)}</span>` : ''}
      <h1 class="ui-scripture-header-title">${esc(title)}</h1>
      ${sub ? `<span class="ui-scripture-header-sub">${esc(sub)}</span>` : ''}
    </div>
  </div>`;
}

