// Your profile (owner decision ui.profile): a full screen, not a popup. It holds the learner's account,
// progress, notes and saved conversations, appearance (themes and light/dark), reading preferences, and
// data controls. Account and notes sections fill themselves in after the route renders.
import { THEMES, currentTheme, currentMode } from './theme.js';

const SECTIONS = [['you', 'You'], ['progress', 'Progress'], ['notes', 'Notes'], ['appearance', 'Appearance'], ['reading', 'Reading'], ['privacy', 'Data & privacy']];

export function profileView({ data, state, esc, progressNode }) {
  const root = document.createElement('div');
  root.className = 'profile-page';
  const theme = currentTheme();
  const mode = currentMode();
  const translation = (() => { try { return localStorage.getItem('canon.translation') || 'bsb'; } catch { return 'bsb'; } })();
  root.innerHTML = `
    <header class="profile-head">
      <p class="eyebrow">Your Canonical Shelf</p>
      <h1>Your profile</h1>
      <p class="lede">Your account, progress, notes, and how the site looks. Everything here works without an account; an account adds sync across devices.</p>
      <nav class="profile-sections" aria-label="Profile sections">${SECTIONS.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav>
    </header>
    <section id="you" class="profile-section" aria-labelledby="you-title"><h2 id="you-title">You</h2><div data-account-mount><p class="meta">Checking your account…</p></div></section>
    <section id="progress" class="profile-section" aria-labelledby="progress-title-profile"><h2 id="progress-title-profile">Progress</h2><div data-profile-progress></div></section>
    <section id="notes" class="profile-section" aria-labelledby="notes-title"><h2 id="notes-title">Notes</h2><div data-profile-notes></div></section>
    <section id="appearance" class="profile-section" aria-labelledby="appearance-title-profile">
      <h2 id="appearance-title-profile">Appearance</h2>
      <p class="section-note">Themes change colors, lines, and type. Where things are on the screen stays the same in every theme.</p>
      <div class="mode-toggle-group" role="radiogroup" aria-label="Light or dark">
        ${[['light', 'Light'], ['dark', 'Dark'], ['system', 'Match my device']].map(([id, label]) => `<button class="mode-toggle-btn ${mode === id ? 'is-selected' : ''}" type="button" role="radio" data-mode-choice="${id}" aria-checked="${mode === id}">${label}</button>`).join('')}
      </div>
      <div class="profile-theme-grid" role="list">${THEMES.map(t => `<button class="theme-card ${t.id === theme ? 'is-selected' : ''}" type="button" role="listitem" data-theme-option="${esc(t.id)}" aria-pressed="${t.id === theme}"><strong>${esc(t.name)}</strong><span>${esc(t.summary || '')}</span></button>`).join('')}</div>
    </section>
    <section id="reading" class="profile-section" aria-labelledby="reading-title">
      <h2 id="reading-title">Reading</h2>
      <label class="profile-field">Bible translation
        <select data-translation-choice><option value="bsb" ${translation === 'bsb' ? 'selected' : ''}>Berean Standard Bible (BSB)</option></select>
      </label>
      <p class="section-note">More translations can be added later; your choice is remembered on this device.</p>
    </section>
    <section id="privacy" class="profile-section" aria-labelledby="privacy-title">
      <h2 id="privacy-title">Data &amp; privacy</h2>
      <ul class="profile-links">
        <li><a href="/practice#backup">Back up or restore progress on this device</a></li>
        <li><button type="button" class="link-button" data-feedback-forget>Forget this browser's anonymous feedback link</button></li>
        <li><a href="/privacy.html">Privacy</a> · <a href="/data-retention.html">Data retention</a> · <a href="/storage.html">What is stored</a></li>
      </ul>
      <p class="section-note">Deleting an account is in the You section above.</p>
    </section>`;
  if (progressNode) root.querySelector('[data-profile-progress]').append(progressNode);
  return root;
}

document.addEventListener('change', event => {
  const select = event.target.closest?.('[data-translation-choice]');
  if (select) { try { localStorage.setItem('canon.translation', select.value); } catch {} }
});
