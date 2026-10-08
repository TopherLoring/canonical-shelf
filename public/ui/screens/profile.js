// Step 5 (S5c): the full-screen Profile.
// Account, progress, notes, appearance, reading, and privacy settings stay together here.
import { THEMES, currentTheme, currentMode } from '../../theme.js';
import { progressPanelView } from '../../progress-experience.js';

const SECTIONS = [
  ['you', 'Your account'],
  ['progress', 'Progress'],
  ['notes', 'My Notes'],
  ['appearance', 'Appearance'],
  ['reading', 'Reading'],
  ['privacy', 'Data & privacy']
];

export const handles = () => true;

export function mount(container, ctx) {
  const { data, state, esc } = ctx;
  const theme = currentTheme();
  const mode = currentMode();
  let translation = 'bsb';
  try { translation = localStorage.getItem('canon.translation') || 'bsb'; } catch {}

  const root = document.createElement('div');
  root.className = 'profile-screen';
  root.innerHTML = `
    <header class="profile-screen__intro">
      <div class="profile-screen__title">
        <p class="eyebrow">Your study, your settings</p>
        <h1>Profile</h1>
        <p class="lede">Keep track of your learning, manage your notes, and shape how the library looks. Everything works on this device; an account adds sync across devices.</p>
      </div>
      <nav class="profile-screen__nav" aria-label="Profile sections">
        ${SECTIONS.map(([id, label], index) => `<a href="#${id}"><span aria-hidden="true">0${index + 1}</span>${label}</a>`).join('')}
      </nav>
    </header>

    <div class="profile-screen__sections">
      <section id="you" class="profile-screen__section profile-screen__section--account" aria-labelledby="profile-account-title">
        <header class="profile-screen__section-head"><p class="eyebrow">01 · Account</p><h2 id="profile-account-title">Your account</h2><p>Use this device on its own or add a passkey to sync your study across devices.</p></header>
        <div class="profile-screen__section-body" data-account-mount><p class="meta">Checking your account…</p></div>
      </section>

      <section id="progress" class="profile-screen__section profile-screen__section--progress" aria-labelledby="profile-progress-title">
        <header class="profile-screen__section-head"><p class="eyebrow">02 · Learning</p><h2 id="profile-progress-title">Progress</h2><p>Your learning history and reviews, ready whenever you return.</p></header>
        <div class="profile-screen__section-body profile-screen__progress" data-profile-progress></div>
      </section>

      <section id="notes" class="profile-screen__section profile-screen__section--notes" aria-labelledby="profile-notes-title">
        <header class="profile-screen__section-head"><p class="eyebrow">03 · Personal study</p><h2 id="profile-notes-title">My Notes</h2><p>Your private thoughts and questions stay yours.</p></header>
        <div class="profile-screen__section-body" data-profile-notes><p class="meta">Loading your notes…</p></div>
      </section>

      <section id="appearance" class="profile-screen__section profile-screen__section--appearance" aria-labelledby="profile-appearance-title">
        <header class="profile-screen__section-head"><p class="eyebrow">04 · Display</p><h2 id="profile-appearance-title">Appearance</h2><p>Themes change colors, lines, and type. Page structure stays consistent.</p></header>
        <div class="profile-screen__section-body">
          <div class="profile-screen__mode">
            <h3>Light or dark</h3>
            <div class="mode-toggle-group" role="radiogroup" aria-label="Light or dark">
              ${[['light', 'Light'], ['dark', 'Dark'], ['system', 'Match my device']].map(([id, label]) => `<button class="mode-toggle-btn ${mode === id ? 'is-selected' : ''}" type="button" role="radio" data-mode-choice="${id}" aria-checked="${mode === id}" tabindex="${mode === id ? 0 : -1}">${label}</button>`).join('')}
            </div>
          </div>
          <div class="profile-screen__themes" role="group" aria-label="Choose a theme">
            ${THEMES.map(t => `<button class="theme-choice ${t.id === theme ? 'is-selected' : ''}" type="button" data-theme-option="${esc(t.id)}" aria-pressed="${t.id === theme}"><span class="theme-choice__swatch" data-theme-swatch="${esc(t.id)}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="theme-choice__text"><strong>${esc(t.name)}</strong><span>${esc(t.summary || '')}</span>${t.nativeMode ? `<small>Opens in ${esc(t.nativeMode)} mode</small>` : ''}</span></button>`).join('')}
          </div>
        </div>
      </section>

      <section id="reading" class="profile-screen__section profile-screen__section--reading" aria-labelledby="profile-reading-title">
        <header class="profile-screen__section-head"><p class="eyebrow">05 · Scripture</p><h2 id="profile-reading-title">Reading</h2><p>Choose the translation used throughout the library.</p></header>
        <div class="profile-screen__section-body">
          <label class="profile-screen__field">Bible translation
            <select data-translation-choice><option value="bsb" ${translation === 'bsb' ? 'selected' : ''}>Berean Standard Bible (BSB)</option></select>
          </label>
          <p class="section-note">More translations may be added later. Your choice is remembered on this device.</p>
        </div>
      </section>

      <section id="privacy" class="profile-screen__section profile-screen__section--privacy" aria-labelledby="profile-privacy-title">
        <header class="profile-screen__section-head"><p class="eyebrow">06 · Your data</p><h2 id="profile-privacy-title">Data &amp; privacy</h2><p>Review what is stored and manage the copy saved in this browser.</p></header>
        <div class="profile-screen__section-body">
          <div class="profile-screen__backup" id="backup" role="group" aria-labelledby="profile-backup-title">
            <span><strong id="profile-backup-title">Back up or restore progress</strong><small>Export a copy of your progress, or restore one on this device.</small></span>
            <span class="profile-screen__backup-actions"><button class="button" type="button" id="export">Export</button><button class="button" type="button" id="import">Restore…</button></span>
          </div>
          <button type="button" class="profile-screen__privacy-action" data-feedback-forget>Forget this browser’s anonymous feedback link</button>
          <p class="profile-screen__legal-links"><a href="/privacy.html">Privacy</a><a href="/data-retention.html">Data retention</a><a href="/storage.html">What is stored</a></p>
          <p class="section-note">Account deletion is available in Your account above.</p>
          <p class="section-note" role="status"><strong>Offline access:</strong> <span id="pwa-status" data-state="${esc(window.canonPwaStatus?.state || '')}">${esc(window.canonPwaStatus?.text || 'Online. Saved content is available offline.')}</span></p>
        </div>
      </section>
    </div>
  `;

  const modeButtons = [...root.querySelectorAll('[role="radio"][data-mode-choice]')];
  const updateModeTabStop = selected => {
    modeButtons.forEach(button => {
      const checked = button === selected;
      button.setAttribute('aria-checked', String(checked));
      button.tabIndex = checked ? 0 : -1;
      button.classList.toggle('is-selected', checked);
    });
  };
  const onModeClick = event => {
    const radio = event.target.closest?.('[role="radio"][data-mode-choice]');
    if (radio && modeButtons.includes(radio)) updateModeTabStop(radio);
  };
  const onModeKeydown = event => {
    const radio = event.target.closest?.('[role="radio"][data-mode-choice]');
    const index = modeButtons.indexOf(radio);
    if (index < 0) return;

    let nextIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % modeButtons.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + modeButtons.length) % modeButtons.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = modeButtons.length - 1;
    else return;

    event.preventDefault();
    const next = modeButtons[nextIndex];
    next.click();
    next.focus({ preventScroll: true });
  };
  root.addEventListener('click', onModeClick);
  root.addEventListener('keydown', onModeKeydown);

  const progress = root.querySelector('[data-profile-progress]');
  if (progress) progress.append(progressPanelView({ data, state, esc }));
  container.replaceChildren(root);
  return () => {
    root.removeEventListener('click', onModeClick);
    root.removeEventListener('keydown', onModeKeydown);
    root.remove();
  };
}
