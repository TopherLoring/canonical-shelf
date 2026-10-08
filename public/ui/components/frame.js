// Frame component logic: the main region is the template's frame (public/ui/shell.css, .cs-frame).
// Screens that have not moved to the template's own frame variants (shelf, well, window) sit in .cs-frame--page.

export function mountFrame() {
  const main = document.querySelector('main#main');
  if (main && !main.classList.contains('cs-frame')) main.classList.add('cs-frame', 'cs-frame--page', 'app-frame');
}

export function renderFrame(content = '') {
  return `<main id="main" class="cs-frame cs-frame--page app-frame" tabindex="-1" aria-live="polite">${content}</main>`;
}
