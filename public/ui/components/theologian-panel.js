const PHONE_LAYOUT = '(max-width: 640px)';

function installStylesheet() {
  const href = new URL('./theologian-panel.css', import.meta.url).href;
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.component = 'theologian-panel';
  document.head.append(link);
}

function focusableWithin(panel) {
  return [...panel.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter(element => !element.hidden && element.getClientRects().length > 0);
}

export function mountTheologianPanel({ panel, openButton, onClose } = {}) {
  if (!panel || !openButton) throw new Error('Theologian panel shell unavailable');
  installStylesheet();

  let backdrop = document.querySelector('[data-theologian-backdrop]');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'theologian-panel__backdrop';
    backdrop.hidden = true;
    backdrop.dataset.theologianBackdrop = '';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(backdrop, panel);
  }

  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('tabindex', '-1');
  panel.dataset.modal = 'false';
  const mobile = window.matchMedia(PHONE_LAYOUT);
  const originalInert = new Map();

  function setBackgroundInert(inert) {
    for (const child of document.body.children) {
      if (child === panel || child === backdrop) continue;
      if (inert) {
        if (!originalInert.has(child)) originalInert.set(child, child.inert);
        child.inert = true;
      } else if (originalInert.has(child)) {
        child.inert = originalInert.get(child);
        originalInert.delete(child);
      }
    }
  }

  function applyMode(isOpen) {
    const modal = isOpen && mobile.matches;
    panel.dataset.modal = String(modal);
    panel.setAttribute('aria-modal', String(modal));
    backdrop.hidden = !modal;
    if (modal) {
      document.documentElement.dataset.theologianModal = 'true';
      setBackgroundInert(true);
    } else {
      delete document.documentElement.dataset.theologianModal;
      setBackgroundInert(false);
    }
  }

  function open() {
    panel.hidden = false;
    openButton.setAttribute('aria-expanded', 'true');
    applyMode(true);
    requestAnimationFrame(() => { panel.dataset.open = 'true'; });
  }

  function close() {
    panel.dataset.open = 'false';
    openButton.setAttribute('aria-expanded', 'false');
    applyMode(false);
  }

  function keepFocusInside(event) {
    if (event.key !== 'Tab' || panel.dataset.modal !== 'true') return;
    const items = focusableWithin(panel);
    if (!items.length) {
      event.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  backdrop.addEventListener('click', () => onClose?.());
  panel.addEventListener('keydown', keepFocusInside);
  mobile.addEventListener?.('change', () => applyMode(panel.dataset.open === 'true'));

  return { open, close };
}
