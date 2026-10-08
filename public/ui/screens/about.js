// S10: About and policies share the Topics navigation-and-reading layout.
import { ABOUT_SECTIONS, markdownToHtml } from '../../about-page.js';

const hrefFor = id => id === 'about' ? '/about' : `/about?section=${id}`;

export function mount(container, ctx) {
  const selected = ABOUT_SECTIONS.find(section => section.id === ctx.params.get('section')) || ABOUT_SECTIONS[0];
  container.innerHTML = `<section class="about-screen">
      <nav class="about-screen__list ui-rail" aria-label="About and policies">
        <p class="ui-rail-section-title">About and policies</p>
        ${ABOUT_SECTIONS.map(section => `<a class="ui-rail-link" href="${hrefFor(section.id)}" ${section === selected ? 'aria-current="page"' : ''}>${section.label}</a>`).join('')}
      </nav>
      <article class="about-screen__content" aria-label="Selected information">${selected.html}</article>
    </section><link rel="stylesheet" href="/ui/screens/about.css">`;

  // Policy cross-links use the same-document route, including old footer URLs.
  for (const link of container.querySelectorAll('a[href]')) {
    const section = ABOUT_SECTIONS.find(item => link.getAttribute('href') === `/${item.id}.html`);
    if (section) link.setAttribute('href', hrefFor(section.id));
  }

  const statement = container.querySelector('#statement-content');
  const controller = new AbortController();
  if (statement) {
    fetch('/data/statement-of-faith.md', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Statement unavailable');
        return response.text();
      })
      .then(markdown => {
        if (!ctx.isCurrent() || !statement.isConnected) return;
        statement.innerHTML = markdownToHtml(markdown) || '<p>The Statement of Faith is currently unavailable.</p>';
        if (location.hash === '#faith') statement.closest('section').scrollIntoView({ block: 'start' });
      })
      .catch(error => {
        if (error.name === 'AbortError' || !ctx.isCurrent() || !statement.isConnected) return;
        statement.textContent = 'The Statement of Faith could not be loaded. Reload this page when the local content bundle is available.';
      });
  }
  return () => controller.abort();
}
