// Theme lab: one sample frame per theme (and mode), listed from the generated theme list.
import { THEMES } from './theme-list.js';
const lab = document.querySelector('#lab');
function render(which) {
  const modes = which === 'both' ? ['light', 'dark'] : [which];
  lab.replaceChildren(...THEMES.map(t => {
    const figure = document.createElement('figure');
    figure.className = 'lab-theme';
    const caption = document.createElement('figcaption');
    caption.innerHTML = `<strong></strong> <span></span>`;
    caption.querySelector('strong').textContent = t.name;
    caption.querySelector('span').textContent = t.summary || '';
    const frames = document.createElement('div');
    frames.className = 'lab-frames';
    for (const mode of modes) {
      const frame = document.createElement('iframe');
      frame.src = `/theme-sample.html?theme=${encodeURIComponent(t.id)}&mode=${mode}`;
      frame.title = `${t.name}, ${mode} mode`;
      frame.loading = 'lazy';
      frames.append(frame);
    }
    figure.append(caption, frames);
    return figure;
  }));
  document.querySelectorAll('[data-lab-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.labMode === which)));
}
document.addEventListener('click', e => { const b = e.target.closest('[data-lab-mode]'); if (b) render(b.dataset.labMode); });
render('both');
