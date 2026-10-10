// Profile (Phase A): the Topics layout. A card list of tabs beside a pane for the selected one. On a phone the list is the
// Profile screen and each tab opens as a detail page with a Back button. The tab is in the address (/profile#appearance).
// Tabs with choices (Appearance, Reading) hold a draft: a sticky Save / Cancel bar appears only when something changed.
import { THEMES, currentTheme, currentMode, applyMode, applyTheme, applyFonts, applyTextSize, applyAccessibility, currentFonts, currentTextSize, currentAccessibility, resetDisplayPreferences, FONT_CHOICES, TEXT_SIZES, MOTION_CHOICES, CONTRAST_CHOICES } from '../../theme.js';
import { progressPanelView } from '../../progress-experience.js';
import { setFrameVariant } from '../components/index.js';
import { sendFeedback, forgetFeedbackLink } from '../../feedback.js';
import { screenContext } from '../../screen-context.js';
import { resetPathProgress, resetPracticeProgress, eraseNotes, eraseHighlights, clearHistory, eraseEverythingOnThisDevice, exportStudy, exportProgress, exportEverything } from '../../profile-data.js';

const CHEVRON = '<svg class="cs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6"></path></svg>';
const LEFT = '<svg class="cs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 6-6 6 6 6"></path></svg>';

// id, label, heading, blurb
const TABS = [
  ['account', 'Account', 'Account', 'Sign in, sync across devices, and manage this device.'],
  ['appearance', 'Appearance', 'Appearance', 'Theme, text, and accessibility, with a preview before you save.'],
  ['reading', 'Reading', 'Reading', 'The translation used in the Reader and Topics.'],
  ['study', 'My Study', 'My Study', 'Your progress, notes, highlights, and history.'],
  ['privacy', 'Privacy & data', 'Privacy & data', 'Export or erase what is stored, and see how it is kept.'],
  ['about', 'About Us', 'About Us', 'Who we are, what we believe, and the terms and policies.'],
  ['contact', 'Contact Us', 'Contact Us', 'Ask a question or tell us what you found.']
];
const ALIASES = { you: 'account', progress: 'study', notes: 'study' };
const PHONE = '(max-width: 760px), (max-aspect-ratio: 4/5)';

const LEGAL = [
  ['/about.html#faith', 'Statement of Faith', 'The convictions behind Canonical Shelf’s own doctrinal claims. You are never asked to agree.'],
  ['/about.html', 'About', 'How Canonical Shelf works, its sources, and its approach to Scripture.'],
  ['/terms.html', 'Terms', 'The terms for using Canonical Shelf.'],
  ['/privacy.html', 'Privacy', 'What we collect, why, and the choices you have.'],
  ['/data-retention.html', 'Data retention', 'How long data is kept.'],
  ['/storage.html', 'What is stored', 'The cookies and browser storage Canonical Shelf uses.']
];

const CONFIRMS = {
  'reset-path': { title: 'Reset Learning Path progress?', body: 'Completed lessons, scores, and scheduled reviews on this device are cleared. Notes and highlights stay.', go: 'Reset Path progress', run: resetPathProgress, exporter: exportProgress, done: 'Learning Path progress was reset.' },
  'reset-practice': { title: 'Reset Practice progress?', body: 'Practice levels, stars, and achievements on this device are cleared.', go: 'Reset Practice progress', run: async () => resetPracticeProgress(), exporter: exportProgress, done: 'Practice progress was reset.' },
  'erase-notes': { title: 'Erase all notes?', body: 'Every note, journal entry, and saved Theologian conversation on this device is deleted.', go: 'Erase notes', run: eraseNotes, exporter: exportStudy, done: 'Notes were erased.' },
  'erase-highlights': { title: 'Erase all highlights?', body: 'Every highlight and text mark on this device is removed.', go: 'Erase highlights', run: eraseHighlights, exporter: exportStudy, done: 'Highlights were erased.' },
  'clear-history': { title: 'Clear history?', body: 'Recently viewed items and your saved reading place are removed.', go: 'Clear history', run: async () => clearHistory(), exporter: null, done: 'History was cleared.' },
  'erase-all': { title: 'Erase everything on this device?', body: 'Progress, Practice, notes, highlights, and history on this device are deleted. A synced copy in your account is not touched.', go: 'Erase everything', run: eraseEverythingOnThisDevice, exporter: exportEverything, done: 'Everything on this device was erased.' }
};

let pendingStatus = '';

const tabFromHash = () => {
  let id = '';
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { /* ignore a malformed address */ }
  id = ALIASES[id] || id;
  return TABS.some(([key]) => key === id) ? id : '';
};
const hrefFor = id => `/profile#${id}`;

function rail(current, esc) {
  return `<nav class="cs-card cs-rail profile-rail" aria-label="Profile"><span class="cs-rail__label">Profile</span>
    ${TABS.map(([id, label]) => `<a class="cs-rail__item${id === current ? ' is-current' : ''}" href="${esc(hrefFor(id))}"${id === current ? ' aria-current="page"' : ''}><span class="cs-grow">${esc(label)}</span></a>`).join('')}</nav>`;
}

function phoneList(esc) {
  return `<nav class="profile-list" aria-label="Profile">${TABS.map(([id, label, , blurb]) => `<a class="cs-card profile-list__item" href="${esc(hrefFor(id))}"><span class="profile-list__text"><strong>${esc(label)}</strong><span>${esc(blurb)}</span></span>${CHEVRON}</a>`).join('')}</nav>`;
}

const card = (title, body, extra = '') => `<section class="cs-card cs-panel profile-card${extra ? ` ${extra}` : ''}">${title ? `<span class="cs-caption cs-caption--label">${title}</span>` : ''}${body}</section>`;

function radio(attr, items, selectedId, label) {
  return `<div class="mode-toggle-group profile-seg" role="radiogroup" aria-label="${label}">${items.map(([id, text, small]) => `<button class="mode-toggle-btn ${id === selectedId ? 'is-selected' : ''}" type="button" role="radio" ${attr}="${id}" aria-checked="${id === selectedId}" tabindex="${id === selectedId ? 0 : -1}">${text}${small ? `<small>${small}</small>` : ''}</button>`).join('')}</div>`;
}

function fontField(kind, label, selected, esc) {
  return `<label class="profile-field">${label}<select data-font-choice="${kind}">${FONT_CHOICES.map(font => `<option value="${esc(font.id)}"${font.id === selected ? ' selected' : ''}>${esc(font.name)}</option>`).join('')}</select></label>`;
}

const saveBar = `<div class="profile-savebar" data-savebar hidden><span class="profile-savebar__text">You have unsaved changes.</span><span class="profile-savebar__actions"><button type="button" class="button" data-cancel>Cancel</button><button type="button" class="button button--primary" data-save>Save</button></span></div>`;

function sizeRadio(selected) {
  return `<div class="mode-toggle-group profile-seg profile-seg--sizes" role="radiogroup" aria-label="Site text size">${TEXT_SIZES.map((size, n) => `<button class="mode-toggle-btn ${size.id === selected ? 'is-selected' : ''}" type="button" role="radio" data-text-size-choice="${size.id}" aria-checked="${size.id === selected}" aria-label="${size.name}, ${size.percent}%" title="${size.name}, ${size.percent}%" tabindex="${size.id === selected ? 0 : -1}"><span class="profile-sizeglyph profile-sizeglyph--${n + 1}" aria-hidden="true">A</span></button>`).join('')}</div>`;
}

function appearancePane(draft, esc) {
  const theme = THEMES.find(t => t.id === draft.theme) || THEMES[0];
  const head = `<div class="profile-cardhead"><span class="cs-caption cs-caption--label">Theme</span>${radio('data-mode-choice', [['light', 'Light'], ['dark', 'Dark'], ['system', 'Match my device']], currentMode(), 'Light or dark')}</div>`;
  const preview = `<div class="profile-preview" data-preview data-theme-swatch="${esc(theme.id)}" aria-label="Preview of the selected theme and type">
      <div class="pv-page"><div class="pv-card">
        <span class="pv-kicker">Genesis 1</span>
        <h3 class="pv-title">In the beginning</h3>
        <p class="pv-text">In the beginning, God created the heavens and the earth.</p>
        <p class="pv-note">Notes, highlights, and menus use the interface font.</p>
        <span class="pv-actions"><span class="pv-btn pv-btn--primary">Continue</span><span class="pv-btn">My Notes</span></span>
      </div></div></div>`;
  const row = `<div class="profile-controls-row">
      <label class="profile-field">Theme<select data-theme-select>${THEMES.map(t => `<option value="${esc(t.id)}"${t.id === draft.theme ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label>
      ${fontField('reading', 'Reading font', draft.reading, esc)}
      ${fontField('interface', 'Interface font', draft.interface, esc)}
      <div class="profile-field profile-field--sizes"><span>Text size</span>${sizeRadio(draft.size)}</div>
    </div>`;
  const notes = `<p class="cs-sub" data-preview-name><strong>${esc(theme.name)}.</strong> <span data-preview-desc>${esc(theme.summary || '')}</span></p>
      <p class="cs-sub">The preview shows your choices without applying them; Save to use them across the site. Reading font covers Scripture, lessons, and headings; Interface font covers menus, buttons, and labels. The Reader’s own Aa control sets Scripture text size separately.</p>`;
  return `${card('', `${head}${preview}${row}${notes}`, 'profile-appearance-card')}
    ${card('Accessibility', `<div class="profile-a11y"><div><span class="cs-caption">Motion</span>${radio('data-motion-choice', MOTION_CHOICES.map(m => [m.id, m.name]), draft.motion, 'Motion')}</div><div><span class="cs-caption">Contrast</span>${radio('data-contrast-choice', CONTRAST_CHOICES.map(c => [c.id, c.name]), draft.contrast, 'Contrast')}</div></div>`)}
    ${card('', `<button type="button" class="profile-action" data-reset-defaults>Reset appearance to defaults</button>`)}`;
}

function readingPane(translation, esc) {
  return `${card('Bible translation', `<label class="profile-field">Translation used in the Reader and Topics
      <select data-translation-choice><option value="bsb" ${translation === 'bsb' ? 'selected' : ''}>Berean Standard Bible (BSB)</option></select></label>
      <p class="cs-sub">The Berean Standard Bible is the default. Lessons and Practice always quote it. More translations may be added later.</p>`)}
    ${card('Reader text size', `<p class="cs-sub">The Reader has its own Aa control for the size of Scripture text. It is separate from the site text size in Appearance.</p><a class="profile-action" href="/profile#appearance">Open Appearance</a>`)}`;
}

function studyPane() {
  const row = (key, label) => `<button type="button" class="button button--danger" data-study-action="${key}">${label}</button>`;
  return `${card('Progress', `<div class="profile-progress" data-profile-progress></div><div class="profile-buttons"><button type="button" class="button" data-study-export="progress">Export progress</button>${row('reset-path', 'Reset Path progress')}${row('reset-practice', 'Reset Practice progress')}</div>`)}
    ${card('My Notes and highlights', `<div data-profile-notes><p class="cs-sub">Loading your notes…</p></div><div class="profile-buttons"><button type="button" class="button" data-study-export="study">Export notes and highlights</button>${row('erase-notes', 'Erase notes')}${row('erase-highlights', 'Erase highlights')}</div>`)}
    ${card('History', `<p class="cs-sub">Recently viewed items and your saved reading place in the Reader and Topics.</p><div class="profile-buttons">${row('clear-history', 'Clear history')}</div>`)}`;
}

function privacyPane(esc) {
  const status = window.canonPwaStatus;
  return `${card('Back up or restore progress', `<div class="profile-backup" id="backup" role="group" aria-label="Back up or restore progress"><span class="cs-sub">Export a copy of your progress, or restore one on this device.</span><span class="profile-backup__actions"><button class="button" type="button" id="export">Export</button><button class="button" type="button" id="import">Restore…</button></span></div><div class="profile-buttons"><button type="button" class="button" data-study-export="everything">Export everything</button></div>`)}
    ${card('Erase from this device', `<p class="cs-sub">Deletes progress, Practice, notes, highlights, and history stored in this browser. You can export first.</p><div class="profile-buttons"><button type="button" class="button button--danger" data-study-action="erase-all">Erase everything on this device</button></div>`)}
    ${card('Delete account', `<p class="cs-sub">Deleting your account and its synced copy is done in Account. What is saved on this device stays unless you erase it above.</p><a class="profile-action" href="/profile#account">Go to Account</a>`)}
    ${card('Offline access', `<p class="cs-sub" role="status"><span id="pwa-status" data-state="${esc(status?.state || '')}">${esc(status?.text || 'Online. Saved content is available offline.')}</span></p>`)}
    ${card('Policies', `<p class="cs-sub">How your data is handled is in the <a href="/privacy.html">Privacy policy</a>. All terms and policies are under About Us.</p>`)}`;
}

function aboutPane(esc) {
  return card('Terms, policies, and what we believe', `<ul class="profile-links">${LEGAL.map(([href, label, note]) => `<li><a href="${esc(href)}"><strong>${esc(label)}</strong><span>${esc(note)}</span></a></li>`).join('')}</ul>`);
}

function contactPane() {
  return card('Send a message', `<form class="profile-contact" id="profile-contact" novalidate>
      <label class="profile-field">About<select name="category"><option value="content">Content</option><option value="function">How something works</option><option value="interpretation">An interpretation</option><option value="suggestion">A suggestion</option><option value="translation">Adding my own translation</option><option value="question">A question</option></select></label>
      <label class="profile-field">Your message<textarea name="message" maxlength="4000" rows="6" placeholder="Write as much or as little as you like." required></textarea></label>
      <label class="profile-field">Contact information <small>optional</small><input name="contact" type="text" maxlength="320" autocomplete="email" placeholder="Email, if you want a reply by email too"></label>
      <p class="cs-sub">Replies come back to this browser as a message on the Theologian tab, without identifying you. The server keeps only a one-way hash of a random browser code, never your IP address.</p>
      <div class="profile-buttons"><button class="button button--primary" type="submit">Send</button><button type="button" class="profile-action" data-forget-feedback>Forget this browser’s feedback link</button></div>
    </form>`);
}

function pane(id, ctx, draft, translation) {
  if (id === 'account') return card('Sign-in and sync', '<div data-account-mount><p class="cs-sub">Checking your account…</p></div>');
  if (id === 'appearance') return appearancePane(draft, ctx.esc);
  if (id === 'reading') return readingPane(translation, ctx.esc);
  if (id === 'study') return studyPane();
  if (id === 'privacy') return privacyPane(ctx.esc);
  if (id === 'about') return aboutPane(ctx.esc);
  return contactPane();
}

export const handles = () => true;

export function mount(container, ctx) {
  const { data, state, esc } = ctx;
  const phone = window.matchMedia(PHONE);
  const requested = tabFromHash();
  const listView = !requested && phone.matches;
  const id = requested || 'account';
  const [, , title, blurb] = TABS.find(([key]) => key === id);
  let storedTranslation = 'bsb';
  try { storedTranslation = localStorage.getItem('canon.translation') || 'bsb'; } catch { /* storage unavailable */ }
  const applied = () => ({ theme: currentTheme(), size: currentTextSize(), ...currentFonts(), ...currentAccessibility() });
  const draft = applied();
  let translation = storedTranslation;
  const modeAtOpen = currentMode();

  const main = document.querySelector('main#main');
  const restoreFrame = setFrameVariant('well');
  main?.classList.add('cs-cols--profile');

  const heading = listView ? 'Profile' : title;
  const sub = listView ? 'Your account, preferences, and study.' : blurb;
  container.innerHTML = `${rail(id, esc)}
    <section class="cs-column profile-screen${listView ? ' is-list' : ''}" aria-label="${esc(heading)}" data-profile-screen data-profile-section="${listView ? 'list' : esc(id)}">
      ${listView ? '' : `<a class="cs-backlink profile-back" href="/profile">${LEFT}<span>Profile</span></a>`}
      <div class="cs-heading"><span class="cs-kicker profile-kicker">Profile</span><h1 class="profile-h1">${esc(heading)}</h1><span class="cs-sub">${esc(sub)}</span></div>
      ${listView ? phoneList(esc) : `<div class="profile-status cs-sub" role="status" aria-live="polite" data-profile-status>${esc(pendingStatus)}</div><div class="profile-panes" data-profile-pane="${esc(id)}">${pane(id, ctx, draft, translation)}</div>${id === 'appearance' || id === 'reading' ? saveBar : ''}`}
    </section>
    <dialog class="profile-confirm" aria-labelledby="profile-confirm-title"><h2 id="profile-confirm-title"></h2><p data-confirm-body></p><div class="profile-buttons"><button type="button" class="button" data-confirm-export hidden>Export first</button><button type="button" class="button button--danger" data-confirm-go></button><button type="button" class="button" data-confirm-cancel>Cancel</button></div></dialog>`;
  pendingStatus = '';

  const q = selector => container.querySelector(selector);
  const status = text => { const el = q('[data-profile-status]'); if (el) el.textContent = text; };
  const reload = message => { pendingStatus = message || ''; if (ctx.navigate) ctx.navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true }); else location.reload(); };

  const progress = q('[data-profile-progress]');
  if (progress) progress.append(progressPanelView({ data, state, esc }));

  // ---- Draft, preview, and the Save / Cancel bar ----
  const dirty = () => {
    if (id === 'appearance') { const now = applied(); return Object.keys(now).some(key => now[key] !== draft[key]) || currentMode() !== modeAtOpen; }
    if (id === 'reading') return translation !== storedTranslation;
    return false;
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
    const name = q('[data-preview-name]');
    if (name) name.innerHTML = `<strong>${esc(theme.name)}.</strong> <span data-preview-desc>${esc(theme.summary || '')}</span>`;
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

  const save = () => {
    if (id === 'appearance') {
      applyTheme(draft.theme);
      applyTextSize(draft.size);
      applyFonts({ reading: draft.reading, interface: draft.interface });
      applyAccessibility({ motion: draft.motion, contrast: draft.contrast });
      applyMode(currentMode());
    } else if (id === 'reading') {
      storedTranslation = translation;
      try { localStorage.setItem('canon.translation', translation); } catch { /* storage unavailable */ }
    }
    reload('Saved.');
  };
  const cancel = () => { if (currentMode() !== modeAtOpen) applyMode(modeAtOpen); reload(''); };

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
    const radioButton = target.closest?.('[role="radio"]');
    if (radioButton && container.contains(radioButton)) {
      mark(radioButton);
      if (radioButton.dataset.textSizeChoice) draft.size = radioButton.dataset.textSizeChoice;
      if (radioButton.dataset.motionChoice) draft.motion = radioButton.dataset.motionChoice;
      if (radioButton.dataset.contrastChoice) draft.contrast = radioButton.dataset.contrastChoice;
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
    const choice = event.target.closest?.('[data-translation-choice]');
    if (choice) { translation = choice.value; refresh(); }
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

  // Leaving with unsaved changes asks first; a changed light/dark choice (which applies as you pick it) is put back.
  const guard = event => {
    if (!dirty()) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.target === '_blank' || link.getAttribute('href').startsWith('#')) return;
    if (!window.confirm('You have unsaved changes. Leave without saving?')) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    if (currentMode() !== modeAtOpen) applyMode(modeAtOpen);
  };
  const beforeUnload = event => { if (dirty()) { event.preventDefault(); event.returnValue = ''; } };
  const onPhoneChange = () => { if (!requested) reload(''); };

  container.addEventListener('click', onClick);
  container.addEventListener('change', onChange);
  container.addEventListener('keydown', onKeydown);
  container.addEventListener('submit', onSubmit);
  dialog.addEventListener('cancel', onDialogCancel);
  document.addEventListener('click', guard, true);
  window.addEventListener('beforeunload', beforeUnload);
  phone.addEventListener('change', onPhoneChange);

  return () => {
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
