// App shell component (template shell: docs/design/templates).
// index.html holds the markup: top bar (desktop), bottom bar (phone), search field and the frame. This module keeps
// them in step with the route (current item, wordmark) and runs the search field.

import { ROUTE_ALIASES } from '../labels.js';

let appShellMounted = false;

export function updateAppShell(currentRoute) {
  const normPath = '/' + location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
  const effectiveRoute = currentRoute || normPath.replace(/^\/+/, '') || 'home';
  const aliasTarget = ROUTE_ALIASES[normPath] || ROUTE_ALIASES[location.pathname];
  const mappedRoute = aliasTarget
    ? aliasTarget.replace(/^\/+/, '')
    : (effectiveRoute === 'path' ? 'course' : effectiveRoute);

  document.body.dataset.currentRoute = mappedRoute;
  const app = document.querySelector('.cs-app');
  if (app) app.dataset.screen = mappedRoute;

  // The wordmark is absent on /home and shown everywhere else (Decision ui.nav.brand.v1); its space stays reserved.
  const isHome = mappedRoute === 'home' || location.pathname === '/' || location.pathname === '/home';
  const wordmark = document.querySelector('.cs-top .cs-wordmark');
  if (wordmark) wordmark.hidden = isHome;

  // Current item in the top bar's navigation and the phone bottom bar.
  const links = document.querySelectorAll('.cs-nav a, .cs-tabbar a, .cs-top__profile');
  links.forEach(link => {
    const route = link.dataset.route;
    const href = link.getAttribute('href');
    const isActive = route === mappedRoute || href === location.pathname || href === normPath;
    if (isActive) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    link.classList.toggle('is-active', isActive);
  });
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
    if (open) input?.focus({ preventScroll: true });
  };

  toggle?.addEventListener('click', () => {
    if (form.dataset.open === 'true' && input?.value.trim()) form.requestSubmit();
    else setOpen(form.dataset.open !== 'true');
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
      if (!input.value.trim() && !form.contains(document.activeElement)) setOpen(false);
    }, 120);
  });
}

export function mountAppShell() {
  const header = document.querySelector('header.cs-top');
  if (!header) return;

  initSearchControls(header);

  if (!appShellMounted) {
    appShellMounted = true;
    document.addEventListener('canonical-route-rendered', e => updateAppShell(e.detail?.route));
    window.addEventListener('popstate', () => updateAppShell());
  }

  updateAppShell();
}
