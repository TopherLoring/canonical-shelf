// Frame component logic: the main region is the template's frame (public/ui/shell.css, .cs-frame).
// Screens that have not moved to the template's own frame variants (shelf, well, window) sit in .cs-frame--page.

const VARIANTS = ['page', 'shelf', 'well', 'window'];

export function mountFrame() {
  const main = document.querySelector('main#main');
  if (main && !main.classList.contains('cs-frame')) main.classList.add('cs-frame', 'cs-frame--page', 'app-frame');
}

export function renderFrame(content = '') {
  return `<main id="main" class="cs-frame cs-frame--page app-frame" tabindex="-1" aria-live="polite">${content}</main>`;
}

/** Switch the frame to one of the template's variants (window, well, shelf). Returns a function that restores the
 *  frame to what it was, for the screen's cleanup. */
export function setFrameVariant(variant) {
  const main = document.querySelector('main#main');
  if (!main || !VARIANTS.includes(variant)) return () => {};
  const before = VARIANTS.filter(name => main.classList.contains(`cs-frame--${name}`));
  before.forEach(name => main.classList.remove(`cs-frame--${name}`));
  main.classList.add(`cs-frame--${variant}`);
  return () => {
    main.classList.remove(`cs-frame--${variant}`);
    before.forEach(name => main.classList.add(`cs-frame--${name}`));
  };
}
