// Universal App Shell Component (Reading Room design system)
// Owns the masthead layout, brand reservation, nav dock, tools, and route synchronization.

import { NAV_ITEMS, ROUTE_ALIASES } from '../labels.js';

let appShellMounted = false;

export function renderAppShell({ currentRoute = 'home' } = {}) {
  const isHome = currentRoute === 'home';
  return `
  <header class="masthead app-shell-header">
    <a class="brand" href="/home" aria-label="Canonical Shelf home">
      <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="5" y="7" width="6" height="19" rx="1.2"/><rect x="13" y="4" width="6" height="22" rx="1.2"/><rect x="21.5" y="9" width="6" height="17" rx="1.2" transform="rotate(8 24.5 17.5)"/><rect x="3" y="27" width="26" height="2" rx="1"/></svg>
      ${isHome ? '' : '<span class="brand-wordmark">The Canonical <em>Shelf</em></span>'}
    </a>
    <nav class="primary" aria-label="Primary">
      ${NAV_ITEMS.map(item => `
        <a href="${item.path}" data-route="${item.route}" aria-label="${item.label}" ${item.route === currentRoute ? 'aria-current="page" class="is-active"' : ''}>
          ${item.icon}
          <span class="nav-label" data-phone-label="${item.phoneLabel}">${item.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="masthead-tools">
      <form id="global-search" class="search" role="search" action="/search" method="get" data-open="false">
        <button type="button" class="search-toggle" aria-controls="q" aria-expanded="false" aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg></button>
        <label class="sr-only" for="q">Search the Bible, topics, glossary, and Learning Path</label>
        <input id="q" name="q" type="search" placeholder="Search the Bible, topics, glossary" autocomplete="off">
        <button type="submit" class="sr-only">Search</button>
      </form>
      <button type="button" class="feedback-cta" data-feedback-open aria-haspopup="dialog" aria-controls="feedback-panel" aria-expanded="false">Feedback</button>
      <a class="profile-link" href="/profile" data-route="profile" aria-label="Your profile"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1.2-4 4.1-6 7.5-6s6.3 2 7.5 6"/></svg></a>
    </div>
  </header>`;
}

export function updateAppShell(currentRoute) {
  const normPath = '/' + location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
  const effectiveRoute = currentRoute || normPath.replace(/^\/+/, '') || 'home';
  const aliasTarget = ROUTE_ALIASES[normPath] || ROUTE_ALIASES[location.pathname];
  const mappedRoute = aliasTarget
    ? aliasTarget.replace(/^\/+/, '')
    : (effectiveRoute === 'path' ? 'course' : effectiveRoute);

  // 1. Sync body / root attribute
  document.body.dataset.currentRoute = mappedRoute;

  // 2. Brand wordmark: absent on /home, attached everywhere else (Decision ui.nav.brand.v1)
  const isHome = mappedRoute === 'home' || location.pathname === '/' || location.pathname === '/home';
  const brand = document.querySelector('.masthead .brand, .app-shell-header .brand');
  const wordmark = brand?.querySelector('.brand-wordmark');
  if (isHome) {
    wordmark?.remove();
  } else if (brand && !wordmark) {
    const wm = document.createElement('span');
    wm.className = 'brand-wordmark';
    wm.innerHTML = 'The Canonical <em>Shelf</em>';
    brand.appendChild(wm);
  }

  // 3. Sync nav links active state
  const navLinks = document.querySelectorAll('.masthead nav.primary a, .app-shell-header nav.primary a');
  navLinks.forEach(link => {
    const route = link.dataset.route;
    const href = link.getAttribute('href');
    const isActive = route === mappedRoute || href === location.pathname || href === normPath;
    link.toggleAttribute('aria-current', isActive);
    link.classList.toggle('is-active', isActive);
  });

  // 4. Sync profile link
  const profileLink = document.querySelector('.masthead .profile-link, .app-shell-header .profile-link');
  if (profileLink) {
    const isProfile = mappedRoute === 'profile' || location.pathname === '/profile';
    profileLink.toggleAttribute('aria-current', isProfile);
    profileLink.classList.toggle('is-active', isProfile);
  }
}

function initSearchControls(header) {
  const form = header.querySelector('#global-search');
  if (!form || form.dataset.initialized === 'true') return;
  form.dataset.initialized = 'true';

  const toggle = form.querySelector('.search-toggle');
  const input = form.querySelector('#q');

  const setOpen = open => {
    form.dataset.open = String(open);
    toggle?.setAttribute('aria-expanded', String(open));
    if (open) {
      input?.focus({ preventScroll: true });
    }
  };

  toggle?.addEventListener('click', () => {
    if (form.dataset.open === 'true' && input?.value.trim()) {
      form.requestSubmit();
    } else {
      setOpen(form.dataset.open !== 'true');
    }
  });

  input?.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      input.value = '';
      setOpen(false);
      toggle?.focus();
    }
  });

  input?.addEventListener('blur', () => {
    setTimeout(() => {
      if (!input.value.trim() && !form.contains(document.activeElement)) {
        setOpen(false);
      }
    }, 120);
  });
}

export function mountAppShell() {
  const header = document.querySelector('header.masthead');
  if (!header) return;

  // Ensure nav items from central NAV_ITEMS registry
  const nav = header.querySelector('nav.primary');
  if (nav && nav.children.length === 0) {
    nav.innerHTML = NAV_ITEMS.map(item => `
      <a href="${item.path}" data-route="${item.route}" aria-label="${item.label}">
        ${item.icon}
        <span class="nav-label" data-phone-label="${item.phoneLabel}">${item.label}</span>
      </a>
    `).join('');
  }

  // Initialize search behavior
  initSearchControls(header);

  if (!appShellMounted) {
    appShellMounted = true;

    // Listen to route transition events
    document.addEventListener('canonical-route-rendered', e => {
      updateAppShell(e.detail?.route);
    });

    window.addEventListener('popstate', () => {
      updateAppShell();
    });
  }

  updateAppShell();
}
