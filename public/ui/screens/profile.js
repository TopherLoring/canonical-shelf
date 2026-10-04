// Full-Screen Profile Screen (/profile — P7c)
// Structural Redesign: Full-screen route layout (route, not modal) based on Profile.dc.html
// Features:
//  (1) Account creation & management workflow with Name and Email inputs alongside passkey/recovery credentials.
//  (2) Appearance / themes selector (8 themes, light/dark/system mode, Reading Room default).
//  (3) Translation upload and selection utility (defaulting to BSB, supporting custom translation uploads).
//  (4) Personal study management (My Notes with #notes-title, Saved Passages, Learning Progress).
// Export standard signature: export function mount(container, params = {}) { ... return () => cleanup(); }

import { THEMES, currentTheme, currentMode, applyTheme, applyMode, DEFAULT_THEME_ID, DEFAULT_MODE } from '../../theme.js';
import { LABELS, MY_NOTES } from '../labels.js';

const SECTIONS = [
  ['you', 'You'],
  ['progress', 'Progress'],
  ['notes', MY_NOTES || 'My Notes'],
  ['appearance', 'Appearance'],
  ['reading', 'Reading'],
  ['privacy', 'Data & privacy']
];

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const STORAGE_NAME_KEY = 'canon.account.name';
const STORAGE_EMAIL_KEY = 'canon.account.email';
const STORAGE_TRANSLATION_KEY = 'canon.translation';
const STORAGE_CUSTOM_TRANSLATION_KEY = 'canonical-shelf-custom-translation-v1';
const STORAGE_VERSE_TRANSLATION_KEY = 'canonical-shelf-verse-translation-v1';
const STORAGE_SAVED_PASSAGES_KEY = 'canon.saved_passages';

function safeStorageGet(key, fallback = '') {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function getSavedPassages() {
  try {
    const raw = safeStorageGet(STORAGE_SAVED_PASSAGES_KEY, '[]');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSavedPassages(list) {
  safeStorageSet(STORAGE_SAVED_PASSAGES_KEY, JSON.stringify(list));
}

function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (!document.querySelector('link[href*="profile.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/ui/screens/profile.css';
    document.head.appendChild(link);
  }
}

/**
 * Standard mount function for Profile Screen
 * @param {HTMLElement} container 
 * @param {Object} params 
 * @returns {Function} cleanup
 */
export function mount(container, params = {}) {
  ensureStyles();

  const theme = currentTheme();
  const mode = currentMode();
  const translation = safeStorageGet(STORAGE_TRANSLATION_KEY, 'bsb');
  const storedName = safeStorageGet(STORAGE_NAME_KEY, '');
  const storedEmail = safeStorageGet(STORAGE_EMAIL_KEY, '');
  const customJson = safeStorageGet(STORAGE_CUSTOM_TRANSLATION_KEY, '');
  let hasCustomTranslation = false;
  let customVerseCount = 0;
  try {
    if (customJson) {
      const parsed = JSON.parse(customJson);
      if (parsed && typeof parsed === 'object') {
        customVerseCount = Object.keys(parsed).length;
        hasCustomTranslation = customVerseCount > 0;
      }
    }
  } catch {}

  const isPasskeySupported = typeof window !== 'undefined' && Boolean(window.PublicKeyCredential);
  const syncEnabled = safeStorageGet('canon.sync.enabled') === '1';
  const syncLast = safeStorageGet('canon.sync.last', '');
  const savedPassages = getSavedPassages();

  const root = document.createElement('div');
  root.className = 'profile-page';

  root.innerHTML = `
    <header class="profile-head">
      <p class="eyebrow">Personal settings &amp; study</p>
      <h1>Your profile</h1>
      <p class="lede">Your account, progress, notes, and appearance. Everything works without an account; an account adds sync across devices.</p>
      <nav class="profile-sections" aria-label="Profile sections">
        ${SECTIONS.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}
      </nav>
    </header>

    <div class="profile-content">
      <!-- 1. Account Section -->
      <section id="you" class="profile-section" aria-labelledby="you-title">
        <h2 id="you-title">You</h2>
        <div class="profile-account-card">
          <div class="profile-account-fields">
            <label class="profile-field" for="profile-name">
              <span class="field-label">Name</span>
              <input id="profile-name" type="text" autocomplete="name" placeholder="Your name (optional)" data-profile-name value="${esc(storedName)}">
            </label>
            <label class="profile-field" for="profile-email">
              <span class="field-label">Email</span>
              <input id="profile-email" type="email" autocomplete="email" placeholder="name@example.com (for recovery)" data-profile-email value="${esc(storedEmail)}">
            </label>
          </div>
          <p class="field-hint">Your name and recovery email are saved locally and associated with your passkey credentials.</p>

          <div class="profile-passkey-group">
            <h3 id="passkey-title">Passkey &amp; Sync Credentials</h3>
            <div data-account-mount>
              <p>You don't need an account. Your progress and notes are saved on this device.</p>
              <p>An account keeps them in sync across your devices. It uses a passkey (your fingerprint, face, or device PIN), so there is no password to remember.</p>
              <p class="profile-actions">
                <button class="button" type="button" data-account="enable">Create an account</button>
                <button class="button button--quiet" type="button" data-account="signin">Sign in on this device</button>
              </p>
            </div>
            <div class="passkey-status-indicator">
              <span class="passkey-badge ${isPasskeySupported ? 'passkey-badge--supported' : 'passkey-badge--unsupported'}">
                ${isPasskeySupported ? 'WebAuthn passkeys supported on this device' : 'Passkeys not supported in this browser'}
              </span>
              ${syncEnabled ? `<span class="sync-badge">Sync active${syncLast ? ` · Last synced ${esc(new Date(syncLast).toLocaleTimeString())}` : ''}</span>` : ''}
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Learning Progress Section -->
      <section id="progress" class="profile-section" aria-labelledby="progress-title-profile">
        <h2 id="progress-title-profile">Progress</h2>
        <div data-profile-progress></div>
      </section>

      <!-- 3. Personal Study Management: My Notes & Saved Passages -->
      <section id="notes" class="profile-section" aria-labelledby="notes-title" aria-label="My Notes">
        <h2 id="notes-title">My Notes</h2>
        <div data-profile-notes></div>

        <!-- Saved Passages Subsystem -->
        <div class="profile-saved-passages" data-profile-saved-passages>
          <div class="saved-passages-header">
            <h3 id="saved-passages-title">Saved Passages</h3>
            <p class="section-note">Quick links to passages bookmarked during study.</p>
          </div>
          <div class="saved-passages-list-container" data-saved-passages-container>
            ${renderSavedPassagesList(savedPassages)}
          </div>
          <form class="saved-passages-add-form" data-add-passage-form>
            <div class="saved-passages-inputs">
              <label class="profile-field" for="new-passage-ref">
                <span class="field-label">Reference</span>
                <input id="new-passage-ref" type="text" placeholder="e.g. John 3:16 or Psalm 23" data-new-passage-ref required>
              </label>
              <label class="profile-field" for="new-passage-note">
                <span class="field-label">Note (optional)</span>
                <input id="new-passage-note" type="text" placeholder="Theme or reminder" data-new-passage-note>
              </label>
            </div>
            <button class="button button--quiet" type="submit" data-add-passage-btn>Save passage</button>
          </form>
        </div>
      </section>

      <!-- 4. Appearance & Themes Selector -->
      <section id="appearance" class="profile-section" aria-labelledby="appearance-title-profile">
        <h2 id="appearance-title-profile">Appearance</h2>
        <p class="section-note">Themes change colors, lines, and type. Where things are on the screen stays the same in every theme.</p>
        
        <div class="mode-toggle-group" role="radiogroup" aria-label="Light or dark">
          ${[
            ['light', 'Light'],
            ['dark', 'Dark'],
            ['system', 'Match my device']
          ].map(([id, label]) => `
            <button class="mode-toggle-btn ${mode === id ? 'is-selected' : ''}" type="button" role="radio" data-mode-choice="${id}" aria-checked="${mode === id}">${label}</button>
          `).join('')}
        </div>

        <div class="profile-theme-grid" role="list">
          ${THEMES.map(t => {
            const isSelected = t.id === theme;
            const swatchColors = (mode === 'dark' && t.darkSwatch) ? t.darkSwatch : (t.swatch || ['#EDEEF0', '#141B2D', '#1F3A6E', '#A04E68']);
            return `
            <button class="theme-choice ${isSelected ? 'is-selected' : ''}" type="button" role="listitem" data-theme-option="${esc(t.id)}" aria-pressed="${isSelected}">
              <span class="theme-choice__swatch" data-theme-swatch="${esc(t.id)}" aria-hidden="true">
                ${swatchColors.slice(0, 4).map(c => `<i style="background-color: ${c}"></i>`).join('')}
              </span>
              <span class="theme-choice__text">
                <strong>${esc(t.name)}</strong>
                <span>${esc(t.summary || '')}</span>
                ${t.nativeMode ? `<small>Opens in ${esc(t.nativeMode)} mode</small>` : ''}
              </span>
            </button>
          `;
          }).join('')}
        </div>
      </section>

      <!-- 5. Reading & Translation Utility -->
      <section id="reading" class="profile-section" aria-labelledby="reading-title">
        <h2 id="reading-title">Reading</h2>
        
        <label class="profile-field" for="translation-selector">Bible translation
          <select id="translation-selector" data-translation-choice>
            <option value="bsb" ${translation === 'bsb' ? 'selected' : ''}>Berean Standard Bible (BSB) — Default</option>
            <option value="kjv" ${translation === 'kjv' ? 'selected' : ''}>King James Version (KJV)</option>
            <option value="custom" ${translation === 'custom' ? 'selected' : ''} ${hasCustomTranslation ? '' : 'hidden'}>Your custom translation (${customVerseCount} verses)</option>
          </select>
        </label>
        <p class="section-note">Berean Standard Bible (BSB) is the primary text. Your translation choice is remembered across this device.</p>

        <!-- Custom Translation Upload and Management Utility -->
        <div class="custom-translation-box" data-custom-translation-box>
          <h3 id="custom-translation-title">Custom Translation Utility</h3>
          <p class="section-note">Load your own wording for study passages. Upload a JSON file or paste a JSON object keyed by Scripture reference. Missing references fall back to BSB.</p>
          
          <div class="custom-translation-file-row">
            <label class="button button--quiet profile-file-upload">
              Upload JSON file
              <input type="file" accept=".json,application/json" data-custom-translation-file class="sr-only">
            </label>
            <span class="custom-translation-file-name" data-custom-file-name>No file selected</span>
          </div>

          <textarea class="custom-translation-textarea" rows="5" data-custom-translation-text placeholder='{"John 3:16": "For God so loved the world...", "Genesis 1:1": "In the beginning..."}' aria-label="Custom translation JSON">${esc(customJson)}</textarea>

          <div class="profile-actions">
            <button class="button" type="button" data-custom-translation-save>Save translation</button>
            <button class="button button--quiet" type="button" data-custom-translation-clear ${hasCustomTranslation ? '' : 'disabled'}>Clear custom wording</button>
          </div>
          <div class="profile-feedback" data-custom-translation-feedback role="status" aria-live="polite"></div>
        </div>
      </section>

      <!-- 6. Data & Privacy Section -->
      <section id="privacy" class="profile-section" aria-labelledby="privacy-title">
        <h2 id="privacy-title">Data &amp; privacy</h2>
        <ul class="profile-links">
          <li><a href="/practice#backup">Back up or restore progress on this device</a></li>
          <li><button type="button" class="link-button" data-feedback-forget>Forget this browser's anonymous feedback link</button></li>
          <li><a href="/privacy.html">Privacy</a> · <a href="/data-retention.html">Data retention</a> · <a href="/storage.html">What is stored</a></li>
        </ul>
        <p class="section-note">Deleting an account is in the You section above.</p>
      </section>
    </div>
  `;

  // Append progress node if provided
  const progressContainer = root.querySelector('[data-profile-progress]');
  if (params.progressNode && progressContainer) {
    progressContainer.append(params.progressNode);
  } else if (progressContainer) {
    // If progressNode was not passed, clone tpl-progress-panel if available
    const tpl = document.getElementById('tpl-progress-panel');
    if (tpl) {
      progressContainer.append(tpl.content.cloneNode(true));
    }
  }

  // Hook up event handlers
  const cleanupFns = [];

  // 1. Name & Email inputs
  const nameInput = root.querySelector('[data-profile-name]');
  const emailInput = root.querySelector('[data-profile-email]');
  if (nameInput) {
    const onNameInput = () => safeStorageSet(STORAGE_NAME_KEY, nameInput.value.trim());
    nameInput.addEventListener('input', onNameInput);
    cleanupFns.push(() => nameInput.removeEventListener('input', onNameInput));
  }
  if (emailInput) {
    const onEmailInput = () => safeStorageSet(STORAGE_EMAIL_KEY, emailInput.value.trim());
    emailInput.addEventListener('input', onEmailInput);
    cleanupFns.push(() => emailInput.removeEventListener('input', onEmailInput));
  }

  // 2. Translation selection dropdown
  const transSelect = root.querySelector('[data-translation-choice]');
  if (transSelect) {
    const onTransChange = () => {
      const val = transSelect.value;
      safeStorageSet(STORAGE_TRANSLATION_KEY, val);
      safeStorageSet(STORAGE_VERSE_TRANSLATION_KEY, val);
      document.dispatchEvent(new CustomEvent('canonical-translation-changed', { detail: { translation: val } }));
    };
    transSelect.addEventListener('change', onTransChange);
    cleanupFns.push(() => transSelect.removeEventListener('change', onTransChange));
  }

  // 3. Custom translation file upload and save
  const fileInput = root.querySelector('[data-custom-translation-file]');
  const fileNameDisplay = root.querySelector('[data-custom-file-name]');
  const customTextArea = root.querySelector('[data-custom-translation-text]');
  const saveCustomBtn = root.querySelector('[data-custom-translation-save]');
  const clearCustomBtn = root.querySelector('[data-custom-translation-clear]');
  const feedbackEl = root.querySelector('[data-custom-translation-feedback]');

  if (fileInput) {
    const onFileChange = e => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (fileNameDisplay) fileNameDisplay.textContent = file.name;
      const reader = new FileReader();
      reader.onload = evt => {
        if (customTextArea) customTextArea.value = evt.target?.result || '';
      };
      reader.readAsText(file);
    };
    fileInput.addEventListener('change', onFileChange);
    cleanupFns.push(() => fileInput.removeEventListener('change', onFileChange));
  }

  if (saveCustomBtn && customTextArea) {
    const onSaveCustom = () => {
      const raw = customTextArea.value.trim();
      if (!raw) {
        showFeedback(feedbackEl, 'Please enter or upload JSON text before saving.', 'error');
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Custom translation must be a JSON object keyed by Bible reference.');
        }
        const clean = {};
        for (const [ref, text] of Object.entries(parsed)) {
          if (typeof text === 'string' && text.trim()) {
            clean[String(ref).trim()] = text.trim();
          }
        }
        const count = Object.keys(clean).length;
        if (count === 0) {
          throw new Error('No valid reference-to-text pairs found in JSON.');
        }

        const serialized = JSON.stringify(clean);
        safeStorageSet(STORAGE_CUSTOM_TRANSLATION_KEY, serialized);
        safeStorageSet(STORAGE_TRANSLATION_KEY, 'custom');
        safeStorageSet(STORAGE_VERSE_TRANSLATION_KEY, 'custom');

        // Update select option
        if (transSelect) {
          let customOption = transSelect.querySelector('option[value="custom"]');
          if (customOption) {
            customOption.hidden = false;
            customOption.textContent = `Your custom translation (${count} verses)`;
            customOption.selected = true;
          }
        }
        if (clearCustomBtn) clearCustomBtn.disabled = false;
        showFeedback(feedbackEl, `Successfully saved ${count} custom verses. Primary translation set to custom.`, 'success');
        document.dispatchEvent(new CustomEvent('canonical-translation-changed', { detail: { translation: 'custom' } }));
      } catch (err) {
        showFeedback(feedbackEl, err.message || 'Invalid JSON format.', 'error');
      }
    };
    saveCustomBtn.addEventListener('click', onSaveCustom);
    cleanupFns.push(() => saveCustomBtn.removeEventListener('click', onSaveCustom));
  }

  if (clearCustomBtn) {
    const onClearCustom = () => {
      safeStorageRemove(STORAGE_CUSTOM_TRANSLATION_KEY);
      safeStorageSet(STORAGE_TRANSLATION_KEY, 'bsb');
      safeStorageSet(STORAGE_VERSE_TRANSLATION_KEY, 'bsb');
      if (customTextArea) customTextArea.value = '';
      if (fileNameDisplay) fileNameDisplay.textContent = 'No file selected';
      if (transSelect) {
        const customOption = transSelect.querySelector('option[value="custom"]');
        if (customOption) customOption.hidden = true;
        transSelect.value = 'bsb';
      }
      clearCustomBtn.disabled = true;
      showFeedback(feedbackEl, 'Custom translation removed. Reset to Berean Standard Bible (BSB).', 'info');
      document.dispatchEvent(new CustomEvent('canonical-translation-changed', { detail: { translation: 'bsb' } }));
    };
    clearCustomBtn.addEventListener('click', onClearCustom);
    cleanupFns.push(() => clearCustomBtn.removeEventListener('click', onClearCustom));
  }

  // 4. Saved Passages add and remove
  const addPassageForm = root.querySelector('[data-add-passage-form]');
  const passagesContainer = root.querySelector('[data-saved-passages-container]');
  if (addPassageForm && passagesContainer) {
    const onAddPassage = e => {
      e.preventDefault();
      const refInput = addPassageForm.querySelector('[data-new-passage-ref]');
      const noteInput = addPassageForm.querySelector('[data-new-passage-note]');
      const ref = refInput?.value?.trim();
      const note = noteInput?.value?.trim() || '';
      if (!ref) return;

      const current = getSavedPassages();
      current.unshift({ ref, note, date: new Date().toISOString() });
      saveSavedPassages(current);

      passagesContainer.innerHTML = renderSavedPassagesList(current);
      if (refInput) refInput.value = '';
      if (noteInput) noteInput.value = '';
    };
    addPassageForm.addEventListener('submit', onAddPassage);
    cleanupFns.push(() => addPassageForm.removeEventListener('submit', onAddPassage));

    const onPassageClick = e => {
      const removeBtn = e.target.closest('[data-remove-passage]');
      if (!removeBtn) return;
      e.preventDefault();
      const index = Number(removeBtn.dataset.removePassage);
      const current = getSavedPassages();
      if (index >= 0 && index < current.length) {
        current.splice(index, 1);
        saveSavedPassages(current);
        passagesContainer.innerHTML = renderSavedPassagesList(current);
      }
    };
    passagesContainer.addEventListener('click', onPassageClick);
    cleanupFns.push(() => passagesContainer.removeEventListener('click', onPassageClick));
  }

  // 5. Section links smooth scrolling with hash update
  const sectionNav = root.querySelector('.profile-sections');
  if (sectionNav) {
    const onNavClick = e => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const targetId = anchor.getAttribute('href').slice(1);
      const targetEl = root.querySelector(`#${CSS.escape(targetId)}`);
      if (targetEl) {
        e.preventDefault();
        history.pushState(null, '', `#${targetId}`);
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    sectionNav.addEventListener('click', onNavClick);
    cleanupFns.push(() => sectionNav.removeEventListener('click', onNavClick));
  }

  container.replaceChildren(root);

  // If arriving with hash (e.g. /profile#notes or /profile#appearance), scroll to section
  if (location.hash.length > 1) {
    const targetSection = root.querySelector(location.hash);
    if (targetSection) {
      requestAnimationFrame(() => targetSection.scrollIntoView({ block: 'start' }));
    }
  }

  return () => {
    cleanupFns.forEach(fn => {
      try { fn(); } catch {}
    });
  };
}

function showFeedback(container, message, type = 'info') {
  if (!container) return;
  container.textContent = message;
  container.className = `profile-feedback profile-feedback--${type}`;
}

function renderSavedPassagesList(passages) {
  if (!passages.length) {
    return '<p class="saved-passages-empty">No saved passages yet. Save verses or references below for quick study access.</p>';
  }
  return `
    <ul class="saved-passages-list">
      ${passages.map((p, index) => `
        <li class="saved-passage-item">
          <div class="saved-passage-content">
            <a href="/bible?q=${encodeURIComponent(p.ref)}" class="saved-passage-link">
              <strong>${esc(p.ref)}</strong>
            </a>
            ${p.note ? `<span class="saved-passage-note">${esc(p.note)}</span>` : ''}
          </div>
          <button type="button" class="link-button saved-passage-remove" data-remove-passage="${index}" aria-label="Remove saved passage ${esc(p.ref)}">Remove</button>
        </li>
      `).join('')}
    </ul>
  `;
}

/**
 * Backward compatibility export for app.js profileView({ data, state, esc, progressNode })
 */
export function profileView({ data, state, esc: escFn, progressNode } = {}) {
  const root = document.createElement('div');
  mount(root, { data, state, progressNode });
  return root;
}

export default { mount, profileView };
