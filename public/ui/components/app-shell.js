// Universal App Shell Component (Reading Room design system)
// Owns the masthead layout, brand reservation, nav dock, tools, and route synchronization.

import { NAV_ITEMS, ROUTE_ALIASES } from '../labels.js';

let appShellMounted = false;

export function updateAppShell(currentRoute) {
  const effectiveRoute = currentRoute || (location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || 'home');
  const mappedRoute = ROUTE_ALIASES[location.pathname]
    ? ROUTE_ALIASES[location.pathname].replace(/^\/+/, '')
    : effectiveRoute;

  // 1. Sync body / root attribute
  document.body.dataset.currentRoute = mappedRoute;

  // 2. Brand wordmark: absent on /home, attached everywhere else (Decision ui.nav.brand.v1)
  const isHome = mappedRoute === 'home' || location.pathname === '/' || location.pathname === '/home';
  const brand = document.querySelector('.masthead .brand');
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
  const navLinks = document.querySelectorAll('.masthead nav.primary a');
  navLinks.forEach(link => {
    const route = link.dataset.route;
    const href = link.getAttribute('href');
    const isActive = route === mappedRoute || href === location.pathname;
    link.toggleAttribute('aria-current', isActive);
    link.classList.toggle('is-active', isActive);
  });

  // 4. Sync profile link
  const profileLink = document.querySelector('.masthead .profile-link');
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
