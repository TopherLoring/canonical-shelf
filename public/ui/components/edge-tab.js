// EdgeTab Component (Reading Room design system)
// Fixed vertical tabs for Theologian and My Notes.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderEdgeTab({
  type = 'theologian', // 'theologian' | 'notes'
  label = '',
  targetId = '',
  ariaLabel = '',
  isOpen = false,
  className = '',
  id = ''
} = {}) {
  const isTheo = type === 'theologian';
  const defaultLabel = isTheo ? 'Theologian' : 'My Notes';
  const effectiveLabel = label || defaultLabel;
  const effectiveAriaLabel = ariaLabel || (isTheo ? 'Open the Theologian' : 'Open My Notes');
  const typeClass = isTheo ? 'ui-edge-tab--theologian' : 'ui-edge-tab--notes';
  const hiddenClass = isOpen ? 'is-hidden' : '';
  const effectiveId = id || (isTheo ? 'edge-theologian-tab' : 'edge-notes-tab');
  const targetAttr = targetId ? `aria-controls="${esc(targetId)}"` : (isTheo ? 'aria-controls="guide"' : 'aria-controls="notes-panel"');

  return `
  <button type="button"
    id="${esc(effectiveId)}"
    class="ui-edge-tab ${typeClass} ${hiddenClass} ${esc(className)}"
    data-edge-tab="${esc(type)}"
    aria-label="${esc(effectiveAriaLabel)}"
    aria-expanded="${isOpen ? 'true' : 'false'}"
    ${targetAttr}>
    <svg class="ui-edge-tab-chevron" data-chevron="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m15 6-6 6 6 6"></path>
    </svg>
    <span class="ui-edge-tab-label">${esc(effectiveLabel)}</span>
  </button>`;
}

export function mountEdgeTab(container = document) {
  const tabs = container.querySelectorAll('.ui-edge-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('aria-controls');
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        tab.classList.add('is-hidden');
        tab.setAttribute('aria-expanded', 'true');
        target.removeAttribute('hidden');
        target.classList.add('is-open');
        target.focus?.();
      }
    });
  });
}

