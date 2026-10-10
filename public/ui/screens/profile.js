// Profile: a drill-down. The left pane lists the sections; choosing one replaces it with a Back link and that section's sub-sections,
// each its own screen. On a phone the same steps are full screens: sections, then sub-sections, then the page, each with Back.
// The address holds the place (/profile#customization/appearance). Customization holds a draft (a sticky Save / Cancel bar appears only
// when something changed) that survives moving between its sub-sections. Nothing here links out of Profile: policies, terms, and the
// Statement of Faith are shown in the pane.
import { THEMES, currentTheme, currentMode, applyMode, applyTheme, applyFonts, applyTextSize, applyAccessibility, currentFonts, currentTextSize, currentAccessibility, resetDisplayPreferences, FONT_CHOICES, TEXT_SIZES } from '../../theme.js';
import { progressPanelView } from '../../progress-experience.js';
import { setFrameVariant } from '../components/index.js';
import { sendFeedback, forgetFeedbackLink } from '../../feedback.js';
import { screenContext } from '../../screen-context.js';
import { ABOUT_SECTIONS, markdownToHtml } from '../../about-page.js';
import { resetPathProgress, resetPracticeProgress, eraseNotes, eraseHighlights, clearHistory, eraseEverythingOnThisDevice, exportStudy, exportProgress, exportEverything } from '../../profile-data.js';

const svg = body => `<svg class="cs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const CHEVRON = svg('<path d="m9 6 6 6-6 6"></path>');
const LEFT = svg('<path d="m15 6-6 6 6 6"></path>');

// Sections: id, label, blurb, and sub-sections as [id, label, heading, blurb].
const SECTIONS = [
  { id: 'account', label: 'Account', blurb: 'Sign in, sync across devices, and manage this device.', subs: [
    ['signin', 'Sign-in & sync', 'Sign-in & sync', 'Passkeys, syncing, and deleting your account.']] },
  { id: 'customization', label: 'Customization', blurb: 'Theme, Reader, and accessibility, with a preview before you save.', subs: [
    ['appearance', 'Appearance', 'Appearance', 'Theme, light or dark, fonts, and text size.'],
    ['reader', 'Reader', 'Reader', 'The translation used in the Reader and Topics.'],
    ['accessibility', 'Accessibility', 'Accessibility', 'Motion and contrast.']] },
  { id: 'study', label: 'My Study', blurb: 'Your progress, notes, highlights, and history.', subs: [
    ['progress', 'Progress', 'Progress', 'Learning Path and Practice progress.'],
    ['notes', 'My Notes', 'My Notes', 'Your notes and highlights.'],
    ['history', 'History', 'History', 'Recently viewed items and your reading place.']] },
  { id: 'privacy', label: 'Privacy & Policies', blurb: 'Export or erase what is stored, and read how it is handled.', subs: [
    ['data', 'Your data', 'Your data', 'Back up, export, or erase what is stored.'],
    ['privacy-policy', 'Privacy Policy', 'Privacy Policy', 'What we collect, why, and the choices you have.'],
    ['storage', 'Cookies & storage', 'Cookies & storage', 'The cookies and browser storage Canonical Shelf uses.'],
    ['retention', 'Data retention', 'Data retention', 'How long data is kept.'],
    ['terms', 'Terms of Use', 'Terms of Use', 'The terms for using Canonical Shelf.']] },
  { id: 'about', label: 'About Canonical Shelf', blurb: 'What this is, and what we believe.', subs: [
    ['introduction', 'About', 'About Canonical Shelf', 'How Canonical Shelf works, its sources, and its approach to Scripture.'],
    ['faith', 'Statement of Faith', 'Statement of Faith', 'The convictions behind Canonical Shelf’s own doctrinal claims. You are never asked to agree.']] },
  { id: 'contact', label: 'Contact Us', blurb: 'Ask a question or tell us what you found.', subs: [
    ['message', 'Send a message', 'Contact Us', 'Ask a question or tell us what you found.']] }
];
const ALIASES = {
  you: 'account', policies: 'privacy', appearance: 'customization/appearance', reading: 'customization/reader', accessibility: 'customization/accessibility',
  progress: 'study/progress', notes: 'study/notes', history: 'study/history', terms: 'privacy/terms', 'data-retention': 'privacy/retention', storage: 'privacy/storage', faith: 'about/faith'
};
const DOCS = { 'privacy-policy': 'privacy', storage: 'storage', retention: 'data-retention', terms: 'terms' };
// Where a link in a policy document goes: another place inside Profile.
const DOC_LINKS = { '/privacy.html': 'privacy/privacy-policy', '/terms.html': 'privacy/terms', '/data-retention.html': 'privacy/retention', '/storage.html': 'privacy/storage', '/about.html': 'about/introduction', '/about.html#faith': 'about/faith' };
const PHONE = '(max-width: 760px), (max-aspect-ratio: 4/5)';

const CONFIRMS = {
  'reset-path': { title: 'Reset Learning Path progress?', body: 'Completed lessons, scores, and scheduled reviews on this device are cleared. Notes and highlights stay.', go: 'Reset Path progress', run: resetPathProgress, exporter: exportProgress, done: 'Learning Path progress was reset.' },
  'reset-practice': { title: 'Reset Practice progress?', body: 'Practice levels, stars, and achievements on this device are cleared.', go: 'Reset Practice progress', run: async () => resetPracticeProgress(), exporter: exportProgress, done: 'Practice progress was reset.' },
  'erase-notes': { title: 'Erase all notes?', body: 'Every note, journal entry, and saved Theologian conversation on this device is deleted.', go: 'Erase notes', run: eraseNotes, exporter: exportStudy, done: 'Notes were erased.' },
  'erase-highlights': { title: 'Erase all highlights?', body: 'Every highlight and text mark on this device is removed.', go: 'Erase highlights', run: eraseHighlights, exporter: exportStudy, done: 'Highlights were erased.' },
  'clear-history': { title: 'Clear history?', body: 'Recently viewed items and your saved reading place are removed.', go: 'Clear history', run: async () => clearHistory(), exporter: null, done: 'History was cleared.' },
  'erase-all': { title: 'Erase everything on this device?', body: 'Progress, Practice, notes, highlights, and history on this device are deleted. A synced copy in your account is not touched.', go: 'Erase everything', run: eraseEverythingOnThisDevice, exporter: exportEverything, done: 'Everything on this device was erased.' }
};

let pendingStatus = '';
// The unsaved Customization draft, kept while moving between its sub-sections.
let held = null;

const hrefFor = (section, sub) => `/profile#${section}${sub ? `/${sub}` : ''}`;

function routeFromHash() {
  let raw = '';
  try { raw = decodeURIComponent(location.hash.slice(1)); } catch { /* ignore a malformed address */ }
  const [sectionId, subId] = (ALIASES[raw] || raw).split('/');
  const section = SECTIONS.find(item => item.id === sectionId) || null;
  const sub = section?.subs.find(([id]) => id === subId)?.[0] || '';
  return { section, sub };
}

function rail(route, level, esc) {
  const { section, sub } = route;
  if (!section) {
    return `<nav class="cs-card cs-rail profile-rail" aria-label="Profile"><span class="cs-rail__label">Profile</span>
      ${SECTIONS.map(item => `<a class="cs-rail__item" href="${esc(hrefFor(item.id))}"><span class="cs-grow">${esc(item.label)}</span>${CHEVRON}</a>`).join('')}</nav>`;
  }
  const current = sub || section.subs[0][0];
  return `<nav class="cs-card cs-rail profile-rail" aria-label="${esc(section.label)}"><a class="cs-rail__item profile-rail__back" href="/profile">${LEFT}<span class="cs-grow">Profile</span></a>
    <span class="cs-rail__label">${esc(section.label)}</span>
    ${section.subs.map(([id, label]) => `<a class="cs-rail__item${id === current && level === 'detail' ? ' is-current' : ''}" href="${esc(hrefFor(section.id, id))}"${id === current && level === 'detail' ? ' aria-current="page"' : ''}><span class="cs-grow">${esc(label)}</span></a>`).join('')}</nav>`;
}

const listCards = (items, esc) => `<nav class="profile-list" aria-label="Profile">${items.map(([href, label, blurb]) => `<a class="cs-card profile-list__item" href="${esc(href)}"><span class="profile-list__text"><strong>${esc(label)}</strong><span>${esc(blurb)}</span></span>${CHEVRON}</a>`).join('')}</nav>`;

const card = (title, body, extra = '') => `<section class="cs-card cs-panel profile-card${extra ? ` ${extra}` : ''}">${title ? `<span class="cs-caption cs-caption--label">${title}</span>` : ''}${body}</section>`;

function radio(attr, items, selectedId, label) {
  return `<div class="mode-toggle-group profile-seg" role="radiogroup" aria-label="${label}">${items.map(([id, text, small]) => `<button class="mode-toggle-btn ${id === selectedId ? 'is-selected' : ''}" type="button" role="radio" ${attr}="${id}" aria-checked="${id === selectedId}" tabindex="${id === selectedId ? 0 : -1}">${text}${small ? `<small>${small}</small>` : ''}</button>`).join('')}</div>`;
}

const MODE_ICONS = {
  light: svg('<circle cx="12" cy="12" r="4"></circle><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"></path>'),
  dark: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"></path>'),
  system: svg('<rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M8 20h8M12 16v4"></path>')
};
// Light, dark, or the device's setting: standard sun, moon, and monitor icons (labelled for screen readers).
function modeRadio(selected) {
  const items = [['light', 'Light'], ['dark', 'Dark'], ['system', 'Match my device']];
  return `<div class="mode-toggle-group profile-seg profile-seg--icons" role="radiogroup" aria-label="Light or dark">${items.map(([id, name]) => `<button class="mode-toggle-btn ${id === selected ? 'is-selected' : ''}" type="button" role="radio" data-mode-choice="${id}" aria-checked="${id === selected}" aria-label="${name}" title="${name}" tabindex="${id === selected ? 0 : -1}">${MODE_ICONS[id]}</button>`).join('')}</div>`;
}

function fontField(kind, label, selected, esc) {
  return `<label class="profile-field">${label}<select data-font-choice="${kind}">${FONT_CHOICES.map(font => `<option value="${esc(font.id)}"${font.id === selected ? ' selected' : ''}>${esc(font.name)}</option>`).join('')}</select></label>`;
}

const saveBar = `<div class="profile-savebar" data-savebar hidden><span class="profile-savebar__text">You have unsaved changes.</span><span class="profile-savebar__actions"><button type="button" class="button" data-cancel>Cancel</button><button type="button" class="button button--primary" data-save>Save</button></span></div>`;

function sizeRadio(selected) {
  return `<div class="mode-toggle-group profile-seg profile-seg--sizes" role="radiogroup" aria-label="Site text size">${TEXT_SIZES.map((size, n) => `<button class="mode-toggle-btn ${size.id === selected ? 'is-selected' : ''}" type="button" role="radio" data-text-size-choice="${size.id}" aria-checked="${size.id === selected}" aria-label="${size.name}, ${size.percent}%" title="${size.name}, ${size.percent}%" tabindex="${size.id === selected ? 0 : -1}"><span class="profile-sizeglyph profile-sizeglyph--${n + 1}" aria-hidden="true">A</span></button>`).join('')}</div>`;
}

function switchRow(attr, label, note, on) {
  return `<label class="profile-switch"><span class="profile-switch__text"><strong>${label}</strong><span>${note}</span></span><input type="checkbox" role="switch" ${attr}${on ? ' checked' : ''}><span class="profile-switch__track" aria-hidden="true"></span></label>`;
}

function appearancePane(draft, esc) {
  const theme = THEMES.find(t => t.id === draft.theme) || THEMES[0];
  const head = `<div class="profile-cardhead"><span class="cs-caption cs-caption--label">Theme</span>${modeRadio(currentMode())}</div>`;
  const preview = `<div class="profile-previewwrap"><div class="profile-preview" data-preview data-theme-swatch="${esc(theme.id)}" aria-label="Preview of the selected theme and type">
      <div class="pv-page"><div class="pv-card">
        <span class="pv-kicker">Genesis 1</span>
        <h3 class="pv-title">In the beginning</h3>
        <p class="pv-text">In the beginning, God created the heavens and the earth.</p>
        <span class="pv-actions"><span class="pv-btn pv-btn--primary">Continue</span><span class="pv-btn">My Notes</span></span>
      </div></div></div>
      <div class="profile-sizemenu"><button type="button" class="profile-sizebtn" data-size-trigger aria-haspopup="true" aria-expanded="false" aria-label="Text size" title="Text size"><span aria-hidden="true">A<small>a</small></span></button><div class="profile-sizepop" data-size-pop hidden>${sizeRadio(draft.size)}</div></div></div>`;
  const row = `<div class="profile-controls-row">
      <label class="profile-field">Theme<select data-theme-select>${THEMES.map(t => `<option value="${esc(t.id)}"${t.id === draft.theme ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label>
      ${fontField('reading', 'Reading font', draft.reading, esc)}
      ${fontField('interface', 'Interface font', draft.interface, esc)}
      <button type="button" class="profile-action profile-action--reset" data-reset-defaults>Reset to defaults</button>
    </div>`;
  return card('', `${head}<div class="profile-appearance-body">${preview}${row}</div>`, 'profile-appearance-card');
}

function accessibilityPane(draft) {
  return card('', `<div class="profile-switches">${switchRow('data-motion-switch', 'Reduce motion', 'Turns off animation and smooth scrolling.', draft.motion === 'reduce')}${switchRow('data-contrast-switch', 'High contrast', 'Stronger text and border contrast.', draft.contrast === 'high')}</div>`, 'profile-a11y-card');
}

function readerPane(translation) {
  return `${card('Bible translation', `<label class="profile-field">Translation used in the Reader and Topics
      <select data-translation-choice><option value="bsb" ${translation === 'bsb' ? 'selected' : ''}>Berean Standard Bible (BSB)</option></select></label>
      <p class="cs-sub">The Berean Standard Bible is the default. Lessons and Practice always quote it. More translations may be added later.</p>`)}
    ${card('Reader text size', '<p class="cs-sub">The Reader has its own Aa control for the size of Scripture text. It is separate from the site text size in Appearance.</p>')}`;
}

const dangerButton = (key, label) => `<button type="button" class="button button--danger" data-study-action="${key}">${label}</button>`;

function studyPane(sub) {
  if (sub === 'progress') return card('Progress', `<div class="profile-progress" data-profile-progress></div><div class="profile-buttons"><button type="button" class="button" data-study-export="progress">Export progress</button>${dangerButton('reset-path', 'Reset Path progress')}${dangerButton('reset-practice', 'Reset Practice progress')}</div>`, 'profile-card--fill');
  if (sub === 'notes') return card('My Notes and highlights', `<div data-profile-notes><p class="cs-sub">Loading your notes…</p></div><div class="profile-buttons"><button type="button" class="button" data-study-export="study">Export notes and highlights</button>${dangerButton('erase-notes', 'Erase notes')}${dangerButton('erase-highlights', 'Erase highlights')}</div>`, 'profile-card--fill');
  return card('History', `<p class="cs-sub">Recently viewed items and your saved reading place in the Reader and Topics.</p><div class="profile-buttons">${dangerButton('clear-history', 'Clear history')}</div>`);
}

function dataPane(esc) {
  const status = window.canonPwaStatus;
  return `${card('Back up or restore progress', `<div class="profile-backup" id="backup" role="group" aria-label="Back up or restore progress"><span class="cs-sub">Export a copy of your progress, or restore one on this device.</span><span class="profile-backup__actions"><button class="button" type="button" id="export">Export</button><button class="button" type="button" id="import">Restore…</button></span></div><div class="profile-buttons"><button type="button" class="button" data-study-export="everything">Export everything</button></div>`)}
    <div class="profile-pair">${card('Erase from this device', `<p class="cs-sub">Deletes progress, Practice, notes, highlights, and history stored in this browser. You can export first.</p><div class="profile-buttons">${dangerButton('erase-all', 'Erase everything on this device')}</div>`)}
    ${card('Delete account', `<p class="cs-sub">Deleting your account and its synced copy is done in Account. What is saved on this device stays unless you erase it here.</p><a class="profile-action" href="${esc(hrefFor('account'))}">Go to Account</a>`)}</div>
    ${card('Offline access', `<p class="cs-sub" role="status"><span id="pwa-status" data-state="${esc(status?.state || '')}">${esc(status?.text || 'Online. Saved content is available offline.')}</span></p>`)}`;
}

// A document from the About bundle, shown in the pane: the first-party HTML with its page nav and outbound links taken out.
function documentHtml(id, which) {
  const source = ABOUT_SECTIONS.find(item => item.id === id)?.html || '<p>This document is not available.</p>';
  const template = document.createElement('template');
  template.innerHTML = source;
  const root = template.content;
  root.querySelector('.about-page__nav')?.remove();
  // The screen heading already names a policy page, so its own title and label are dropped; About keeps its title.
  if (which !== 'introduction') root.querySelectorAll('.about-page__hero h1').forEach(h1 => h1.remove());
  root.querySelectorAll('.about-page__hero .eyebrow').forEach(label => label.remove());
  root.querySelectorAll('h1').forEach(h1 => { const h2 = document.createElement('h2'); h2.innerHTML = h1.innerHTML; h1.replaceWith(h2); });
  const faith = root.querySelector('#faith');
  if (which === 'faith') faith?.querySelector('h2')?.remove();
  if (which === 'faith') { const only = document.createElement('div'); if (faith) only.append(faith); return only.innerHTML; }
  if (which === 'introduction') faith?.remove();
  const holder = document.createElement('div');
  holder.append(root);
  return holder.innerHTML;
}

function docPane(sub) {
  const id = DOCS[sub] || 'about';
  return `<section class="cs-card profile-doc" data-doc="${sub}" tabindex="0" aria-label="Document">${documentHtml(id, sub)}</section>`;
}

function contactPane() {
  return card('Send a message', `<form class="profile-contact" id="profile-contact" novalidate>
      <label class="profile-field">About<select name="category"><option value="content">Content</option><option value="function">How something works</option><option value="interpretation">An interpretation</option><option value="suggestion">A suggestion</option><option value="translation">Adding my own translation</option><option value="question">A question</option></select></label>
      <label class="profile-field">Your message<textarea name="message" maxlength="4000" rows="6" placeholder="Write as much or as little as you like." required></textarea></label>
      <label class="profile-field">Contact information <small>optional</small><input name="contact" type="text" maxlength="320" autocomplete="email" placeholder="Email, if you want a reply by email too"></label>
      <p class="cs-sub">Replies come back to this browser as a message on the Theologian tab, without identifying you. The server keeps only a one-way hash of a random browser code, never your IP address.</p>
      <div class="profile-buttons"><button class="button button--primary" type="submit">Send</button><button type="button" class="profile-action" data-forget-feedback>Forget this browser’s feedback link</button></div>
    </form>`, 'profile-card--narrow');
}

function pane(section, sub, ctx, draft, translation) {
  if (section === 'account') return card('Sign-in and sync', '<div data-account-mount><p class="cs-sub">Checking your account…</p></div>');
  if (section === 'customization') return sub === 'appearance' ? appearancePane(draft, ctx.esc) : sub === 'accessibility' ? accessibilityPane(draft) : readerPane(translation);
  if (section === 'study') return studyPane(sub);
  if (section === 'privacy') return sub === 'data' ? dataPane(ctx.esc) : docPane(sub);
  if (section === 'about') return docPane(sub);
  return contactPane();
}

export const handles = () => true;

export function mount(container, ctx) {
  const { data, state, esc } = ctx;
  const phone = window.matchMedia(PHONE);
  const route = routeFromHash();
  const { section } = route;
  const multi = Boolean(section && section.subs.length > 1);
  const level = !section ? 'home' : (route.sub || !multi || !phone.matches ? 'detail' : 'subs');
  const sub = section ? (route.sub || section.subs[0][0]) : '';
  const customizing = section?.id === 'customization';

  let storedTranslation = 'bsb';
  try { storedTranslation = localStorage.getItem('canon.translation') || 'bsb'; } catch { /* storage unavailable */ }
  const applied = () => ({ theme: currentTheme(), size: currentTextSize(), ...currentFonts(), ...currentAccessibility() });
  // Leaving Customization drops its draft; light or dark applies as it is picked, so put it back.
  if (held && !customizing) { if (currentMode() !== held.modeAtOpen) applyMode(held.modeAtOpen); held = null; }
  if (customizing && !held) held = { draft: applied(), translation: storedTranslation, modeAtOpen: currentMode() };
  const draft = held?.draft || applied();
  const modeAtOpen = held?.modeAtOpen || currentMode();
  const translationNow = () => held?.translation ?? storedTranslation;

  const main = document.querySelector('main#main');
  const restoreFrame = setFrameVariant('well');
  main?.classList.add('cs-cols--profile');

  const subRow = section?.subs.find(([id]) => id === sub);
  const heading = level === 'home' ? 'Profile' : level === 'subs' ? section.label : subRow[2];
  const blurb = level === 'home' ? 'Your account, preferences, and study.' : level === 'subs' ? section.blurb : subRow[3];
  const backHref = level === 'subs' || (level === 'detail' && !multi) ? '/profile' : hrefFor(section?.id || '');
  const backLabel = level === 'detail' && multi ? section.label : 'Profile';
  let body = '';
  if (level === 'home') body = listCards(SECTIONS.map(item => [hrefFor(item.id), item.label, item.blurb]), esc);
  else if (level === 'subs') body = listCards(section.subs.map(([id, label, , note]) => [hrefFor(section.id, id), label, note]), esc);
  else body = `<div class="profile-status cs-sub" role="status" aria-live="polite" data-profile-status>${esc(pendingStatus)}</div><div class="profile-panes" data-profile-pane="${esc(sub)}">${pane(section.id, sub, ctx, draft, translationNow())}</div>${customizing ? saveBar : ''}`;
  container.innerHTML = `${rail(route, level, esc)}
    <section class="cs-column profile-screen${level === 'home' ? ' is-list' : ''}${level === 'detail' && (DOCS[sub] || (section?.id === 'about')) ? ' has-doc' : ''}" aria-label="${esc(heading)}" data-profile-screen data-profile-section="${level === 'home' ? 'list' : esc(section.id)}" data-profile-sub="${esc(level === 'detail' ? sub : '')}">
      ${level === 'home' ? '' : `<a class="cs-backlink profile-back" href="${esc(backHref)}">${LEFT}<span>${esc(backLabel)}</span></a>`}
      <div class="cs-heading"><span class="cs-kicker profile-kicker">${esc(section?.label || 'Profile')}</span><h1 class="profile-h1">${esc(heading)}</h1><span class="cs-sub">${esc(blurb)}</span></div>
      ${body}
    </section>
    <dialog class="profile-confirm" aria-labelledby="profile-confirm-title"><h2 id="profile-confirm-title"></h2><p data-confirm-body></p><div class="profile-buttons"><button type="button" class="button" data-confirm-export hidden>Export first</button><button type="button" class="button button--danger" data-confirm-go></button><button type="button" class="button" data-confirm-cancel>Cancel</button></div></dialog>`;
  pendingStatus = '';

  const q = selector => container.querySelector(selector);
  const status = text => { const el = q('[data-profile-status]'); if (el) el.textContent = text; };
  const reload = message => { pendingStatus = message || ''; if (ctx.navigate) ctx.navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true }); else location.reload(); };

  const progress = q('[data-profile-progress]');
  if (progress) progress.append(progressPanelView({ data, state, esc }));

  // ---- Documents shown in the pane: links stay inside Profile; the Statement of Faith loads in place ----
  const controller = new AbortController();
  container.querySelectorAll('.profile-doc a[href]').forEach(link => {
    const target = DOC_LINKS[link.getAttribute('href')];
    if (target) { const [a, b] = target.split('/'); link.setAttribute('href', hrefFor(a, b)); return; }
    link.replaceWith(...link.childNodes);
  });
  const statement = q('#statement-content');
  if (statement) {
    fetch('/data/statement-of-faith.md', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Statement unavailable'); return response.text(); })
      .then(markdown => { if (statement.isConnected) statement.innerHTML = markdownToHtml(markdown) || '<p>The Statement of Faith is currently unavailable.</p>'; })
      .catch(error => { if (error.name !== 'AbortError' && statement.isConnected) statement.textContent = 'The Statement of Faith could not be loaded right now.'; });
  }

  // ---- Draft, preview, and the Save / Cancel bar ----
  const dirty = () => {
    if (!customizing) return false;
    const now = applied();
    return Object.keys(now).some(key => now[key] !== draft[key]) || currentMode() !== modeAtOpen || translationNow() !== storedTranslation;
  };
  const preview = q('[data-preview]');
  const paintPreview = () => {
    if (!preview) return;
    const theme = THEMES.find(t => t.id === draft.theme) || THEMES[0];
    preview.dataset.themeSwatch = theme.id;
    const reading = FONT_CHOICES.find(f => f.id === draft.reading)?.reading;
    const ui = FONT_CHOICES.find(f => f.id === draft.interface)?.interface;
    const factor = TEXT_SIZES.find(s => s.id === draft.size)?.factor ?? 1;
    const setVar = (name, value) => { if (value) preview.style.setProperty(name, value); else preview.style.removeProperty(name); };
    setVar('--pv-reading', reading);
    setVar('--pv-ui', ui);
    setVar('--pv-factor', String(factor));
    const select = q('[data-theme-select]');
    if (select) select.value = draft.theme;
  };
  const refresh = () => { const bar = q('[data-savebar]'); if (bar) bar.hidden = !dirty(); };
  const mark = button => {
    const group = button.closest('[role="radiogroup"]');
    group.querySelectorAll('[role="radio"]').forEach(other => {
      const checked = other === button;
      other.setAttribute('aria-checked', String(checked));
      other.tabIndex = checked ? 0 : -1;
      other.classList.toggle('is-selected', checked);
    });
  };
  paintPreview();
  refresh();

  const save = () => {
    applyTheme(draft.theme);
    applyTextSize(draft.size);
    applyFonts({ reading: draft.reading, interface: draft.interface });
    applyAccessibility({ motion: draft.motion, contrast: draft.contrast });
    applyMode(currentMode());
    storedTranslation = translationNow();
    try { localStorage.setItem('canon.translation', storedTranslation); } catch { /* storage unavailable */ }
    held = null;
    reload('Saved.');
  };
  const cancel = () => { if (currentMode() !== modeAtOpen) applyMode(modeAtOpen); held = null; reload(''); };

  const sizePop = q('[data-size-pop]');
  const sizeTrigger = q('[data-size-trigger]');
  const setSizePop = open => { if (!sizePop) return; sizePop.hidden = !open; sizeTrigger?.setAttribute('aria-expanded', String(open)); };

  // ---- Confirmation dialog for resets and erases ----
  const dialog = q('dialog.profile-confirm');
  const confirmAction = key => new Promise(resolve => {
    const spec = CONFIRMS[key];
    dialog.querySelector('#profile-confirm-title').textContent = spec.title;
    dialog.querySelector('[data-confirm-body]').textContent = spec.body;
    dialog.querySelector('[data-confirm-go]').textContent = spec.go;
    dialog.querySelector('[data-confirm-export]').hidden = !spec.exporter;
    dialog.dataset.key = key;
    dialog.showModal();
    dialog._resolve = resolve;
  });
  const closeDialog = value => { const resolve = dialog._resolve; dialog._resolve = null; if (dialog.open) dialog.close(); resolve?.(value); };

  const onClick = async event => {
    const target = event.target;
    if (target.closest?.('[data-size-trigger]')) { setSizePop(sizePop?.hidden); return; }
    if (sizePop && !sizePop.hidden && !target.closest?.('[data-size-pop]')) setSizePop(false);
    const radioButton = target.closest?.('[role="radio"]');
    if (radioButton && container.contains(radioButton)) {
      mark(radioButton);
      if (radioButton.dataset.textSizeChoice) { draft.size = radioButton.dataset.textSizeChoice; setSizePop(false); sizeTrigger?.focus({ preventScroll: true }); }
      paintPreview();
      refresh();
      // Light or dark applies as it is picked (the theme script handles that after this); check again once it has.
      if (radioButton.dataset.modeChoice) setTimeout(() => { paintPreview(); refresh(); }, 0);
      return;
    }
    if (target.closest?.('[data-save]')) { save(); return; }
    if (target.closest?.('[data-cancel]')) { cancel(); return; }
    if (target.closest?.('[data-reset-defaults]')) {
      if (!window.confirm('Reset appearance to defaults?')) return;
      resetDisplayPreferences();
      held = null;
      reload('Appearance was reset to defaults.');
      return;
    }
    const exporter = target.closest?.('[data-study-export]');
    if (exporter) {
      const kind = exporter.dataset.studyExport;
      await (kind === 'progress' ? exportProgress() : kind === 'study' ? exportStudy() : exportEverything());
      status('Your export was downloaded.');
      return;
    }
    const action = target.closest?.('[data-study-action]');
    if (action) {
      const key = action.dataset.studyAction;
      const decision = await confirmAction(key);
      if (!decision) return;
      await CONFIRMS[key].run();
      reload(CONFIRMS[key].done);
      return;
    }
    if (target.closest?.('[data-confirm-cancel]')) { closeDialog(false); return; }
    if (target.closest?.('[data-confirm-export]')) { await CONFIRMS[dialog.dataset.key]?.exporter?.(); return; }
    if (target.closest?.('[data-confirm-go]')) { closeDialog(true); return; }
    if (target.closest?.('[data-forget-feedback]')) { forgetFeedbackLink(); status('This browser is no longer linked to earlier anonymous feedback or its replies.'); }
  };
  const onChange = event => {
    const themeSelect = event.target.closest?.('[data-theme-select]');
    if (themeSelect) { draft.theme = themeSelect.value; paintPreview(); refresh(); return; }
    const font = event.target.closest?.('[data-font-choice]');
    if (font) { draft[font.dataset.fontChoice] = font.value; paintPreview(); refresh(); return; }
    const motion = event.target.closest?.('[data-motion-switch]');
    if (motion) { draft.motion = motion.checked ? 'reduce' : 'device'; refresh(); return; }
    const contrast = event.target.closest?.('[data-contrast-switch]');
    if (contrast) { draft.contrast = contrast.checked ? 'high' : 'standard'; refresh(); return; }
    const choice = event.target.closest?.('[data-translation-choice]');
    if (choice && held) { held.translation = choice.value; refresh(); }
  };
  const onKeydown = event => {
    if (event.key === 'Escape' && sizePop && !sizePop.hidden) { setSizePop(false); sizeTrigger?.focus({ preventScroll: true }); return; }
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
  const onSubmit = async event => {
    const form = event.target.closest?.('#profile-contact');
    if (!form) return;
    event.preventDefault();
    const fields = new FormData(form);
    const message = String(fields.get('message') || '').trim();
    if (!message) { status('Write a message first.'); form.querySelector('textarea')?.focus(); return; }
    status('Sending…');
    try {
      const { sent } = await sendFeedback({ category: String(fields.get('category') || 'other'), message, contact: String(fields.get('contact') || '').trim(), context: { kind: 'screen', screen: screenContext() } });
      form.reset();
      status(sent ? 'Thank you. It was sent to Canonical Shelf. If there is a reply, it will appear on the Theologian tab.' : 'You are offline. It was saved on this device and will send automatically.');
    } catch (error) { status(error.message || 'Your message could not be sent.'); }
  };
  const onDialogCancel = event => { event.preventDefault(); closeDialog(false); };

  // Leaving with unsaved changes asks first (moving between Customization's own pages does not); a changed light/dark choice is put back.
  const guard = event => {
    if (!dirty()) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.target === '_blank' || link.getAttribute('href').startsWith('#') || link.getAttribute('href').startsWith('/profile#customization')) return;
    if (!window.confirm('You have unsaved changes. Leave without saving?')) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    if (currentMode() !== modeAtOpen) applyMode(modeAtOpen);
    held = null;
  };
  const beforeUnload = event => { if (dirty()) { event.preventDefault(); event.returnValue = ''; } };
  const onPhoneChange = () => reload('');

  container.addEventListener('click', onClick);
  container.addEventListener('change', onChange);
  container.addEventListener('keydown', onKeydown);
  container.addEventListener('submit', onSubmit);
  dialog.addEventListener('cancel', onDialogCancel);
  document.addEventListener('click', guard, true);
  window.addEventListener('beforeunload', beforeUnload);
  phone.addEventListener('change', onPhoneChange);

  return () => {
    controller.abort();
    container.removeEventListener('click', onClick);
    container.removeEventListener('change', onChange);
    container.removeEventListener('keydown', onKeydown);
    container.removeEventListener('submit', onSubmit);
    document.removeEventListener('click', guard, true);
    window.removeEventListener('beforeunload', beforeUnload);
    phone.removeEventListener('change', onPhoneChange);
    main?.classList.remove('cs-cols--profile');
    restoreFrame();
  };
}
