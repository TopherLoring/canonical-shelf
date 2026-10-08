// Rail Component (Reading Room design system)
// Provides desktop side rail navigation and phone drawer with expand/collapse states.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderRailLink({
  href = '#',
  label = '',
  icon = '',
  count = null,
  isActive = false,
  sublabel = '',
  id = ''
} = {}) {
  const currentAttr = isActive ? 'aria-current="page"' : '';
  const activeClass = isActive ? 'is-active' : '';
  const idAttr = id ? `id="${esc(id)}"` : '';
  const countHtml = (count !== null && count !== undefined)
    ? `<span class="ui-rail-count">${esc(count)}</span>`
    : '';
  const iconHtml = icon ? `<span class="ui-rail-icon" aria-hidden="true">${icon}</span>` : '';

  return `<a href="${esc(href)}" class="ui-rail-link ${activeClass}" ${currentAttr} ${idAttr}>${iconHtml}<span class="ui-rail-label">${esc(label)}${sublabel ? `<small class="ui-rail-sublabel">${esc(sublabel)}</small>` : ''}</span>${countHtml}</a>`;
}

export function renderRail({
  title = '',
  ariaLabel = 'Side navigation',
  items = [],
  sections = [],
  isDrawer = false,
  isOpen = false,
  id = 'ui-rail',
  className = ''
} = {}) {
  const effectiveSections = sections.length > 0 ? sections : [{ title, items }];

  const sectionsHtml = effectiveSections.map((sec, idx) => {
    const titleHtml = sec.title
      ? `<span class="ui-rail-section-title">${esc(sec.title)}</span>`
      : '';
    const itemsHtml = (sec.items || []).map(item => renderRailLink(item)).join('');
    const dividerHtml = (idx > 0 && sec.title) ? '<div class="ui-rail-divider" aria-hidden="true"></div>' : '';
    return `${dividerHtml}<div class="ui-rail-section">${titleHtml}${itemsHtml}</div>`;
  }).join('');

  if (isDrawer) {
    const openClass = isOpen ? 'is-open' : '';
    return `
    <div id="${esc(id)}-container" class="ui-rail-drawer-container ${openClass}" role="dialog" aria-modal="true" aria-label="${esc(ariaLabel)}">
      <div class="ui-rail-backdrop" data-rail-close></div>
      <nav id="${esc(id)}" class="ui-rail-drawer ${esc(className)}" aria-label="${esc(ariaLabel)}">
        <div class="ui-rail-drawer-header">
          <span class="ui-rail-section-title">${esc(title || ariaLabel)}</span>
          <button type="button" class="ui-rail-drawer-close" aria-label="Close navigation" data-rail-close>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"></path></svg>
          </button>
        </div>
        ${sectionsHtml}
      </nav>
    </div>`;
  }

  return `<nav id="${esc(id)}" class="ui-rail ${esc(className)}" aria-label="${esc(ariaLabel)}">${sectionsHtml}</nav>`;
}

export function mountRail(container = document) {
  const drawerContainers = container.querySelectorAll('.ui-rail-drawer-container');
  drawerContainers.forEach(drawer => {
    drawer.querySelectorAll('[data-rail-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        const trigger = document.querySelector(`[aria-controls="${drawer.id}"]`);
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    });
  });
}

