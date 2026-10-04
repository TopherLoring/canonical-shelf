// Frame component logic (Reading Room design system)
// Ensures main content area conforms to frame boundaries and classes.

export function mountFrame() {
  const main = document.querySelector('main#main');
  if (main && !main.classList.contains('app-frame')) {
    main.classList.add('app-frame');
  }
}
