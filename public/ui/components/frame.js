// Frame component logic (Reading Room design system)
// Ensures main content area conforms to frame boundaries and classes.

export function mountFrame() {
  const main = document.querySelector('main#main');
  if (main && !main.classList.contains('app-frame')) {
    main.classList.add('app-frame');
  }
}

export function renderFrame(content = '') {
  return `<main id="main" class="app-frame" tabindex="-1" aria-live="polite">${content}</main>`;
}
