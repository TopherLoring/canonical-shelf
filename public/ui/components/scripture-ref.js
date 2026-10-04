// ScriptureRef Component (Reading Room design system)
// Address link with group bar and expandable verse text for cross-references & citations.

import { BIBLE_GROUPS } from './group-chip.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let refIdCounter = 0;

export function renderScriptureRef({
  reference = '',
  group = 'major',
  text = '',
  href = '#',
  isExpanded = false,
  id = '',
  className = '',
  tag = 'div'
} = {}) {
  const groupMeta = BIBLE_GROUPS[group] || { label: group };
  const uid = id || `ui-scripture-ref-${++refIdCounter}`;
  const textId = `${uid}-text`;
  const expandedStr = isExpanded ? 'true' : 'false';
  const toggleLabel = `${isExpanded ? 'Hide' : 'Show'} ${reference}`;

  const chevronPath = isExpanded ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6';

  return `
  <${tag} id="${esc(uid)}" class="ui-scripture-ref ${esc(className)}" data-group="${esc(group)}" data-expanded="${expandedStr}">
    <span class="ui-scripture-ref-bar" aria-hidden="true" title="${esc(groupMeta.label)}"></span>
    <div class="ui-scripture-ref-content">
      <div class="ui-scripture-ref-header">
        <a href="${esc(href)}" class="ui-scripture-ref-link" title="Open ${esc(reference)} in the reader">
          ${esc(reference)}<span class="sr-only">, ${esc(groupMeta.label)}</span>
        </a>
        ${text ? `
        <button type="button"
          class="ui-scripture-ref-toggle"
          aria-expanded="${expandedStr}"
          aria-controls="${esc(textId)}"
          aria-label="${esc(toggleLabel)}"
          data-ref-toggle>
          <svg class="ui-scripture-ref-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="${chevronPath}"></path>
          </svg>
        </button>` : ''}
      </div>
      ${text ? `<p id="${esc(textId)}" class="ui-scripture-ref-text" ${isExpanded ? '' : 'hidden'}>${esc(text)}</p>` : ''}
    </div>
  </${tag}>`;
}

export function mountScriptureRef(container = document) {
  const toggles = container.querySelectorAll('[data-ref-toggle]');
  toggles.forEach(toggle => {
    if (toggle.dataset.mounted === 'true') return;
    toggle.dataset.mounted = 'true';
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;
      const targetId = toggle.getAttribute('aria-controls');
      const textEl = targetId ? document.getElementById(targetId) : null;
      const root = toggle.closest('.ui-scripture-ref');

      toggle.setAttribute('aria-expanded', String(nextState));
      if (root) root.dataset.expanded = String(nextState);

      const path = toggle.querySelector('svg path');
      if (path) path.setAttribute('d', nextState ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6');

      if (textEl) {
        if (nextState) {
          textEl.removeAttribute('hidden');
        } else {
          textEl.setAttribute('hidden', '');
        }
      }
    });
  });
}

