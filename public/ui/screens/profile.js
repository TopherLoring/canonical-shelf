// Step 9: Profile, on the Topics screen layout.
// A card list of sections sits beside a pane that shows the selected section (phone: a drop-down picks the section).
// The section lives in the address (/profile#notes), so links such as "All my notes" keep working. Account, progress,
// notes, appearance, reading, and privacy settings all stay here.
import { THEMES, currentTheme, currentMode, FONT_CHOICES, TEXT_SIZES, currentFonts, currentTextSize, applyFonts, applyTextSize } from '../../theme.js';
import { progressPanelView } from '../../progress-experience.js';
import { setFrameVariant } from '../components/index.js';

const DOWN = '<svg class="cs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"></path></svg>';

// id, rail label, heading, one-line description
const SECTIONS = [
  ['you', 'Account', 'Account', 'Use this device on its own, or add a passkey to sync your study across devices.'],
  ['progress', 'Progress', 'Progress', 'Your learning history and reviews, ready whenever you return.'],
  ['notes', 'My Notes', 'My Notes', 'Your private thoughts and questions stay yours.'],
  ['appearance', 'Appearance', 'Appearance', 'Themes change colors, lines, and type. Page structure stays consistent.'],
  ['reading', 'Reading', 'Reading', 'Choose the translation and the reading font used throughout the library.'],
  ['privacy', 'Data & privacy', 'Data & privacy', 'Review what is stored, manage the copy saved in this browser, and find About and the policies.']
];

const LEGAL = [
  ['/about.html#faith', 'Statement of Faith', 'The convictions behind Canonical Shelf’s own doctrinal claims. You are never asked to agree.'],
  ['/about.html', 'About', 'How Canonical Shelf works, its sources, and its approach to Scripture.'],
  ['/terms.html', 'Terms', 'The terms for using Canonical Shelf.'],
  ['/privacy.html', 'Privacy', 'What we collect, why, and the choices you have.'],
  ['/data-retention.html', 'Data retention', 'How long data is kept.'],
  ['/storage.html', 'What is stored', 'The cookies and browser storage Canonical Shelf uses.']
];

const sectionFromHash = () => {
  let id = '';
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { /* ignore a malformed address */ }
  return SECTIONS.some(([key]) => key === id) ? id : 'you';
};
const hrefFor = id => `/profile#${id}`;

function rail(current, esc) {
  return `<nav class="cs-card cs-rail profile-rail" aria-label="Profile sections"><span class="cs-rail__label">Profile</span>
    ${SECTIONS.map(([id, label]) => `<a class="cs-rail__item${id === current ? ' is-current' : ''}" href="${esc(hrefFor(id))}"${id === current ? ' aria-current="page"' : ''}><span class="cs-grow">${esc(label)}</span></a>`).join('')}</nav>`;
}

function picker(current, esc) {
  const label = SECTIONS.find(([id]) => id === current)[1];
  return `<label class="cs-typepicker profile-picker"><span class="cs-grow">${esc(label)}</span>${DOWN}<select aria-label="Choose a profile section" data-profile-select>${SECTIONS.map(([id, text]) => `<option value="${esc(hrefFor(id))}"${id === current ? ' selected' : ''}>${esc(text)}</option>`).join('')}</select></label>`;
}

const card = (title, body, extra = '') => `<section class="cs-card cs-panel profile-card${extra ? ` ${extra}` : ''}">${title ? `<span class="cs-caption cs-caption--label">${title}</span>` : ''}${body}</section>`;

function radio(attr, items, selectedId, label) {
  return `<div class="mode-toggle-group profile-seg" role="radiogroup" aria-label="${label}">${items.map(([id, text, small]) => `<button class="mode-toggle-btn ${id === selectedId ? 'is-selected' : ''}" type="button" role="radio" ${attr}="${id}" aria-checked="${id === selectedId}" tabindex="${id === selectedId ? 0 : -1}">${text}${small ? `<small>${small}</small>` : ''}</button>`).join('')}</div>`;
}

function fontField(kind, label, hint, esc) {
  const selected = currentFonts()[kind];
  return `<label class="profile-field">${label}
    <select data-font-choice="${kind}">${FONT_CHOICES.map(font => `<option value="${esc(font.id)}"${font.id === selected ? ' selected' : ''}>${esc(font.name)}</option>`).join('')}</select>
    <small>${hint}</small></label>`;
}

function appearancePane(esc) {
  const theme = currentTheme(), mode = currentMode(), size = currentTextSize();
  return `${card('Light or dark', radio('data-mode-choice', [['light', 'Light'], ['dark', 'Dark'], ['system', 'Match my device']], mode, 'Light or dark'))}
    ${card('Theme', `<div class="profile-themes" role="group" aria-label="Choose a theme">${THEMES.map(t => `<button class="theme-choice ${t.id === theme ? 'is-selected' : ''}" type="button" data-theme-option="${esc(t.id)}" aria-pressed="${t.id === theme}"><span class="theme-choice__swatch" data-theme-swatch="${esc(t.id)}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="theme-choice__text"><strong>${esc(t.name)}</strong><span>${esc(t.summary || '')}</span>${t.nativeMode ? `<small>Opens in ${esc(t.nativeMode)} mode</small>` : ''}</span></button>`).join('')}</div>`)}
    ${card('Text size', `${radio('data-text-size-choice', TEXT_SIZES.map(s => [s.id, s.name, `${s.percent}%`]), size, 'Site text size')}<p class="cs-sub">Makes the whole site larger or smaller on this device. The Reader’s own Aa control sets the size of Scripture text separately.</p>`)}
    ${card('Interface font', `${fontField('interface', 'Font for menus, buttons, and labels', 'Applies everywhere on this device.', esc)}<p class="profile-sample profile-sample--ui" data-font-sample="interface">Continue your study · Practice · Topics · My Notes</p>`)}`;
}

function readingPane(translation, esc) {
  return `${card('Bible translation', `<label class="profile-field">Translation used throughout the library
      <select data-translation-choice><option value="bsb" ${translation === 'bsb' ? 'selected' : ''}>Berean Standard Bible (BSB)</option></select></label>
      <p class="cs-sub">More translations may be added later. Your choice is remembered on this device.</p>`)}
    ${card('Reading font', `${fontField('reading', 'Font for Scripture, lessons, and headings', 'Applies everywhere on this device.', esc)}<p class="profile-sample" data-font-sample="reading">In the beginning, God created the heavens and the earth.</p>`)}`;
}

function privacyPane(esc) {
  const status = window.canonPwaStatus;
  return `${card('Back up or restore progress', `<div class="profile-backup" id="backup" role="group" aria-label="Back up or restore progress"><span class="cs-sub">Export a copy of your progress, or restore one on this device.</span><span class="profile-backup__actions"><button class="button" type="button" id="export">Export</button><button class="button" type="button" id="import">Restore…</button></span></div>`)}
    ${card('This browser', `<button type="button" class="profile-action" data-feedback-forget>Forget this browser’s anonymous feedback link</button>
      <button type="button" class="profile-action profile-action--phone" data-feedback-open aria-haspopup="dialog" aria-controls="feedback-panel" aria-expanded="false">Send feedback</button>
      <p class="cs-sub">Account deletion is available in Account.</p>
      <p class="cs-sub" role="status"><strong>Offline access:</strong> <span id="pwa-status" data-state="${esc(status?.state || '')}">${esc(status?.text || 'Online. Saved content is available offline.')}</span></p>`)}
    ${card('About and policies', `<ul class="profile-links">${LEGAL.map(([href, label, note]) => `<li><a href="${esc(href)}"><strong>${esc(label)}</strong><span>${esc(note)}</span></a></li>`).join('')}</ul>`)}`;
}

function pane(id, ctx, translation) {
  const { esc } = ctx;
  if (id === 'you') return card('', '<div data-account-mount><p class="cs-sub">Checking your account…</p></div>');
  if (id === 'progress') return card('', '<div class="profile-progress" data-profile-progress></div>');
  if (id === 'notes') return card('', '<div data-profile-notes><p class="cs-sub">Loading your notes…</p></div>');
  if (id === 'appearance') return appearancePane(esc);
  if (id === 'reading') return readingPane(translation, esc);
  return privacyPane(esc);
}

export const handles = () => true;

export function mount(container, ctx) {
  const { data, state, esc } = ctx;
  const id = sectionFromHash();
  const [, , title, blurb] = SECTIONS.find(([key]) => key === id);
  let translation = 'bsb';
  try { translation = localStorage.getItem('canon.translation') || 'bsb'; } catch { /* storage unavailable */ }

  const main = document.querySelector('main#main');
  const restoreFrame = setFrameVariant('well');
  main?.classList.add('cs-cols--profile');

  container.innerHTML = `${rail(id, esc)}
    <section class="cs-column profile-screen" aria-label="${esc(title)}" data-profile-screen data-profile-section="${esc(id)}">
      <div class="cs-heading"><span class="cs-kicker profile-kicker">Profile</span><span class="profile-phone-title" aria-hidden="true">Profile</span><h1 class="profile-h1">${esc(title)}</h1><span class="cs-sub">${esc(blurb)}</span></div>
      ${picker(id, esc)}
      <div class="profile-panes" id="profile-${esc(id)}">${pane(id, ctx, translation)}</div>
    </section>`;

  const progress = container.querySelector('[data-profile-progress]');
  if (progress) progress.append(progressPanelView({ data, state, esc }));

  const go = url => (ctx.navigate ? ctx.navigate(url) : window.location.assign(url));
  const onChange = event => {
    const select = event.target.closest?.('[data-profile-select]');
    if (select?.value) { go(select.value); return; }
    const font = event.target.closest?.('[data-font-choice]');
    if (font) applyFonts({ [font.dataset.fontChoice]: font.value });
  };

  // Light/dark and text size are radio groups: arrow keys move and select.
  const mark = (button) => {
    const group = button.closest('[role="radiogroup"]');
    group.querySelectorAll('[role="radio"]').forEach(other => {
      const checked = other === button;
      other.setAttribute('aria-checked', String(checked));
      other.tabIndex = checked ? 0 : -1;
      other.classList.toggle('is-selected', checked);
    });
  };
  const onClick = event => {
    const radioButton = event.target.closest?.('[role="radio"]');
    if (!radioButton || !container.contains(radioButton)) return;
    mark(radioButton);
    if (radioButton.dataset.textSizeChoice) applyTextSize(radioButton.dataset.textSizeChoice);
  };
  const onKeydown = event => {
    const radioButton = event.target.closest?.('[role="radio"]');
    const buttons = radioButton ? [...radioButton.closest('[role="radiogroup"]').querySelectorAll('[role="radio"]')] : [];
    const index = buttons.indexOf(radioButton);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[next].click();
    buttons[next].focus({ preventScroll: true });
  };
  container.addEventListener('change', onChange);
  container.addEventListener('click', onClick);
  container.addEventListener('keydown', onKeydown);

  return () => {
    container.removeEventListener('change', onChange);
    container.removeEventListener('click', onClick);
    container.removeEventListener('keydown', onKeydown);
    main?.classList.remove('cs-cols--profile');
    restoreFrame();
  };
}
