// Review & Practice Screen (Reading Room design system)
// Independent review vs practice tracking with GameTile components based on ReviewPractice.dc.html
// Strictly no streaks or competitive leaderboards.
// Export standard signatures: mount(container, params) returning cleanup function, plus practiceView(opts).

import { renderGameTile } from '../components/game-tile.js';
import { renderProgressBar } from '../components/progress-bar.js';
import { getState, dueReviews } from '../../db.js';
import { practiceStateSummary } from '../../practice-state.js';
import {
  practiceRunView,
  practiceArcadeView,
  practiceCampaignView,
  practiceAchievementsView,
  activatePracticeRun
} from '../../practice-engine.js';
import {
  VERSES,
  VERSE_COUNT,
  VERSE_TRANSLATIONS,
  VERSE_THEMES,
  VERSE_LIFE_FACETS,
  VERSE_BOOKS,
  VERSE_SPEAKERS,
  VERSE_RECIPIENTS,
  verseText,
  filterVerses,
  parseCustomTranslation
} from '../../verse-data.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const TRANSLATION_KEY = 'canonical-shelf-verse-translation-v1';
const CUSTOM_TRANSLATION_KEY = 'canonical-shelf-custom-translation-v1';
const safeStorageGet = (key, fallback = '') => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
const safeStorageSet = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
const customTranslationMap = () => { try { return JSON.parse(safeStorageGet(CUSTOM_TRANSLATION_KEY, '{}')) || {}; } catch { return {}; } };

function verseChapter(verse) {
  const match = String(verse.ref || '').match(/\s(\d+)(?::|$)/);
  return Number(match?.[1] || 1);
}

function verseHref(params, updates = {}) {
  const next = new URLSearchParams(params);
  next.set('mode', 'verses');
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '') next.delete(key);
    else next.set(key, String(value));
  }
  return `/practice?${next.toString()}`;
}

function optionList(items, selected, placeholder) {
  return `<option value="">${placeholder}</option>${items.map(item => `<option value="${esc(item)}" ${selected === item ? 'selected' : ''}>${esc(item)}</option>`).join('')}`;
}

export function practiceView({
  data = {},
  state = null,
  params = new URLSearchParams(),
  dueReviews: dueReviewsFn = dueReviews,
  activityHref = null
} = {}) {
  const catalog = data || window.CANON_CATALOG || {};
  const currentState = state || { completed: [], reviews: {} };
  const due = dueReviewsFn ? dueReviewsFn(currentState) : [];
  const summary = practiceStateSummary();

  // If active arcade or play run is requested
  if (params.has('play') || params.has('arcade')) {
    return practiceRunView({ params, esc });
  }

  const mode = params.get('mode');

  if (!mode) {
    return renderDashboardView({ catalog, state: currentState, due, summary, params });
  }
  if (mode === 'review') {
    return renderReviewQueueView({ catalog, state: currentState, due, activityHref });
  }
  if (mode === 'verses') {
    return renderVerseLibraryView({ params });
  }
  if (mode === 'arcade') {
    return practiceArcadeView({ params, esc });
  }
  if (mode === 'campaign') {
    return practiceCampaignView({ esc });
  }
  if (mode === 'achievements') {
    return practiceAchievementsView({ esc });
  }

  return renderDashboardView({ catalog, state: currentState, due, summary, params });
}

function renderLeftRail({ activeMode, dueCount, gamesCount = 3 }) {
  return `
  <nav class="ui-practice-rail" aria-label="Review and practice">
    <div class="ui-practice-rail-group">
      <span class="ui-practice-rail-heading">Review</span>
      <div class="ui-practice-rail-links">
        <a href="/practice?mode=review"
           class="ui-practice-rail-link ${activeMode === 'review' ? 'is-active' : ''}"
           ${activeMode === 'review' ? 'aria-current="page"' : ''}>
          <svg class="ui-practice-rail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 12a8 8 0 1 1-2.3-5.7"></path>
            <path d="M20 4v4.5h-4.5"></path>
          </svg>
          <span class="ui-practice-rail-label">Due for review</span>
          <span class="ui-practice-rail-count ${dueCount > 0 ? 'ui-practice-rail-count--due' : ''}">${dueCount}</span>
        </a>
      </div>
    </div>

    <div class="ui-practice-rail-divider" aria-hidden="true"></div>

    <div class="ui-practice-rail-group">
      <span class="ui-practice-rail-heading">Practice</span>
      <div class="ui-practice-rail-links">
        <a href="/practice?mode=verses"
           class="ui-practice-rail-link ${activeMode === 'verses' ? 'is-active' : ''}"
           ${activeMode === 'verses' ? 'aria-current="page"' : ''}>
          <svg class="ui-practice-rail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"></path>
            <path d="M12 6.5v13"></path>
          </svg>
          <span class="ui-practice-rail-label">Verse library</span>
        </a>

        <a href="/practice?mode=arcade"
           class="ui-practice-rail-link ${activeMode === 'arcade' ? 'is-active' : ''}"
           ${activeMode === 'arcade' ? 'aria-current="page"' : ''}>
          <svg class="ui-practice-rail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="7" width="18" height="12" rx="3"></rect>
            <path d="M8 11v4M6 13h4M15.5 12.5h.01M18 14.5h.01"></path>
          </svg>
          <span class="ui-practice-rail-label">Games</span>
          <span class="ui-practice-rail-count">${gamesCount}</span>
        </a>

        <a href="/practice?mode=achievements"
           class="ui-practice-rail-link ${activeMode === 'achievements' ? 'is-active' : ''}"
           ${activeMode === 'achievements' ? 'aria-current="page"' : ''}>
          <svg class="ui-practice-rail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="9" r="5"></circle>
            <path d="m8.5 13.5-1.5 7 5-3 5 3-1.5-7"></path>
          </svg>
          <span class="ui-practice-rail-label">Achievements</span>
        </a>
      </div>
    </div>
  </nav>`;
}

function renderRightProgressAside({ due, state, summary }) {
  const itemsKept = (state?.completed || []).length || 12;
  const dueCount = due.length;
  const gamesPlayed = summary?.state?.arcade?.plays || 0;
  const achievementsCount = summary?.achievements || 0;
  const totalAchievements = summary?.totalAchievements || 14;
  const achievementsPercent = totalAchievements > 0 ? Math.round((achievementsCount / totalAchievements) * 100) : 0;

  return `
  <aside class="ui-practice-aside" aria-label="Your progress">
    <section class="ui-practice-progress-card" aria-label="Review progress">
      <span class="ui-practice-progress-eyebrow">Review</span>
      <div class="ui-practice-stat-row">
        <span class="ui-practice-stat-label">Items you’re keeping</span>
        <span class="ui-practice-stat-value">${itemsKept}</span>
      </div>
      <div class="ui-practice-stat-row">
        <span class="ui-practice-stat-label">Due now</span>
        <span class="ui-practice-stat-value ui-practice-stat-value--due">${dueCount}</span>
      </div>
      <div class="ui-practice-stat-row">
        <span class="ui-practice-stat-label">Next review after this</span>
        <span class="ui-practice-stat-value">${dueCount > 0 ? 'After review' : 'Tomorrow'}</span>
      </div>
    </section>

    <section class="ui-practice-progress-card" aria-label="Practice progress">
      <span class="ui-practice-progress-eyebrow">Practice</span>
      <div class="ui-practice-stat-row">
        <span class="ui-practice-stat-label">Games played</span>
        <span class="ui-practice-stat-value">${gamesPlayed}</span>
      </div>
      <div class="ui-practice-stat-row ui-practice-stat-row--column">
        <div class="ui-practice-stat-split">
          <span class="ui-practice-stat-label">Achievements</span>
          <span class="ui-practice-stat-value">${achievementsCount} of ${totalAchievements}</span>
        </div>
        ${renderProgressBar({ value: achievementsPercent, max: 100, ariaLabel: 'Practice achievements progress', variant: 'accent' })}
      </div>
      <p class="ui-practice-progress-note">Practice is just for you. There are no streaks or leaderboards.</p>
    </section>
  </aside>`;
}

function renderDashboardView({ catalog, state, due, summary, params }) {
  const dueCount = due.length;
  const dueUnitTitle = due[0] ? ((catalog?.activities || []).find(a => a.id === due[0].id)?.title || 'Unit review') : 'Unit 1';

  // Game tile preview visual illustrations matching ReviewPractice.dc.html
  const sequencePreview = `
    <div class="ui-practice-preview-illustration ui-practice-preview-illustration--books" aria-hidden="true">
      <span class="ui-practice-preview-book" style="height: 50px; background: var(--color-action);"></span>
      <span class="ui-practice-preview-book" style="height: 54px; background: var(--color-action);"></span>
      <span class="ui-practice-preview-book ui-practice-preview-book--lean" style="height: 46px; background: var(--color-accent);"></span>
      <span class="ui-practice-preview-book" style="height: 52px; background: var(--color-action);"></span>
      <span class="ui-practice-preview-book" style="height: 48px; background: var(--color-action);"></span>
    </div>`;

  const memoryPreview = `
    <div class="ui-practice-preview-illustration ui-practice-preview-illustration--grid" aria-hidden="true">
      <span class="ui-practice-preview-chip" style="background: var(--color-edge-theologian);"></span>
      <span class="ui-practice-preview-chip" style="background: var(--color-edge-notes);"></span>
      <span class="ui-practice-preview-chip" style="background: var(--color-edge-theologian);"></span>
      <span class="ui-practice-preview-chip" style="background: var(--color-edge-theologian);"></span>
      <span class="ui-practice-preview-chip" style="background: var(--color-edge-theologian);"></span>
      <span class="ui-practice-preview-chip" style="background: var(--color-edge-theologian);"></span>
      <span class="ui-practice-preview-chip" style="background: var(--color-edge-notes);"></span>
      <span class="ui-practice-preview-chip" style="background: var(--color-edge-theologian);"></span>
    </div>`;

  const rulePreview = `
    <div class="ui-practice-preview-illustration ui-practice-preview-illustration--blocks" aria-hidden="true">
      <span class="ui-practice-preview-block" style="background: var(--color-correct);"></span>
      <span class="ui-practice-preview-block" style="background: var(--color-correct);"></span>
      <span class="ui-practice-preview-block" style="background: var(--color-action);"></span>
      <span class="ui-practice-preview-block" style="background: var(--color-correct);"></span>
      <span class="ui-practice-preview-block ui-practice-preview-block--active" style="background: var(--color-action);"></span>
      <span class="ui-practice-preview-block" style="background: var(--color-action);"></span>
    </div>`;

  return `
  <div class="ui-practice-container">
    ${renderLeftRail({ activeMode: 'overview', dueCount })}

    <section class="ui-practice-center" aria-label="Review and practice">
      <header class="ui-practice-header">
        <h1 class="ui-practice-title">Review &amp; Practice</h1>
        <p class="ui-practice-lede">Review keeps what you’ve learned. Practice is optional and doesn’t count toward lessons.</p>
      </header>

      <section class="ui-practice-hero-card" aria-label="Due for review">
        <div class="ui-practice-hero-info">
          <span class="ui-practice-hero-eyebrow">Due for review</span>
          <h2 class="ui-practice-hero-title">${dueCount > 0 ? `${dueCount} items from ${esc(dueUnitTitle)}` : 'Nothing due right now'}</h2>
          <p class="ui-practice-hero-desc">
            ${dueCount > 0
              ? 'About 4 minutes. Spaced so each idea comes back just before you’d forget it.'
              : 'Your spaced review queue is clear. Scored checks appear here when their intervals mature.'}
          </p>
        </div>
        <a href="${dueCount > 0 ? '/practice?mode=review' : '/course'}" class="ui-practice-hero-cta">
          ${dueCount > 0 ? 'Start review' : 'Continue Learning Path'}
        </a>
      </section>

      <div class="ui-practice-subhead">
        <h2 class="ui-practice-subhead-title">Practice games</h2>
        <span class="ui-practice-subhead-meta">More games are on the way</span>
      </div>

      <div class="ui-practice-games-grid" role="list">
        ${renderGameTile({
          title: 'Sequence Repair',
          description: 'One book is out of order. Find it and put the shelf right.',
          badge: 'Book order · 5 rounds',
          icon: sequencePreview,
          href: '/practice?arcade=order-repair',
          className: 'ui-practice-game-card'
        })}

        ${renderGameTile({
          title: 'Memory',
          description: 'Match each book to its shelf group by memory.',
          badge: 'Shelf groups · 16 cards',
          icon: memoryPreview,
          href: '/practice?arcade=shelf-memory',
          className: 'ui-practice-game-card'
        })}

        ${renderGameTile({
          title: 'Rule Discovery',
          description: 'Work out the rule that sorts these books, then test it.',
          badge: 'Reasoning · 4 puzzles',
          icon: rulePreview,
          href: '/practice?arcade=rule-discovery',
          className: 'ui-practice-game-card'
        })}
      </div>

      <div class="ui-practice-subhead ui-practice-subhead--muted">
        <h2 class="ui-practice-subhead-title">Coming later</h2>
        <span class="ui-practice-subhead-meta">Working names</span>
      </div>

      <div class="ui-practice-future-grid">
        <div class="ui-practice-future-card">
          <div class="ui-practice-future-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2"></rect>
              <path d="M4 10h16M10 4v16"></path>
            </svg>
          </div>
          <div class="ui-practice-future-body">
            <span class="ui-practice-future-name">Crossword</span>
            <span class="ui-practice-future-desc">Clues that make you think, built from the Glossary.</span>
          </div>
        </div>

        <div class="ui-practice-future-card">
          <div class="ui-practice-future-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="10.5" cy="10.5" r="6.5"></circle>
              <path d="M15.5 15.5 21 21"></path>
            </svg>
          </div>
          <div class="ui-practice-future-body">
            <span class="ui-practice-future-name">Word search</span>
            <span class="ui-practice-future-desc">A light warm-up with names, places, and terms.</span>
          </div>
        </div>

        <div class="ui-practice-future-card">
          <div class="ui-practice-future-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="7" y="3" width="10" height="18" rx="2"></rect>
              <path d="M3 12h2M19 12h2"></path>
            </svg>
          </div>
          <div class="ui-practice-future-body">
            <span class="ui-practice-future-name">Swipe sort</span>
            <span class="ui-practice-future-desc">Text or interpretation? Swipe to decide. Untimed or beat the clock.</span>
          </div>
        </div>

        <div class="ui-practice-future-card">
          <div class="ui-practice-future-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 17h3M9 17h3M14 17h3M19 17h1"></path>
              <path d="M12 4v6"></path>
            </svg>
          </div>
          <div class="ui-practice-future-body">
            <span class="ui-practice-future-name">Hint reveal</span>
            <span class="ui-practice-future-desc">Guess the name from its letter count as new hints appear.</span>
          </div>
        </div>
      </div>
    </section>

    ${renderRightProgressAside({ due, state, summary })}
  </div>`;
}

function renderReviewQueueView({ catalog, state, due, activityHref }) {
  return `
  <section class="ui-practice-review-screen" aria-label="Review Queue">
    <p><a href="/practice" class="ui-practice-back">← Back to Practice Overview</a></p>
    <header class="ui-practice-header">
      <p class="ui-practice-eyebrow">Spaced Retention · not scored</p>
      <h1 class="ui-practice-title">${due.length ? `${due.length} review${due.length === 1 ? '' : 's'} due` : 'Nothing due right now'}</h1>
      <p class="ui-practice-lede">Spaced review keeps what you’ve learned durable. Complete the original scored check to advance the review interval.</p>
    </header>

    ${due.length > 0 ? `
    <div class="ui-practice-review-queue" role="list">
      ${due.map(entry => {
        const activity = (catalog?.activities || []).find(a => a.id === entry.id);
        const href = activityHref ? activityHref(entry.id) : `/course?unit=${encodeURIComponent(activity?.unitId || '')}&lesson=${encodeURIComponent(activity?.sourceId || '')}`;
        return `
        <article class="ui-practice-review-item" role="listitem">
          <div class="ui-practice-review-item-main">
            <span class="ui-practice-review-item-stage">Review stage ${Number(entry.stage || 0) + 1} · ${entry.intervalDays || 1}-day interval</span>
            <h2 class="ui-practice-review-item-title">${esc(activity?.title || entry.id)}</h2>
            <p class="ui-practice-review-item-desc">Review interval advances upon successful completion.</p>
          </div>
          <a href="${esc(href)}" class="ui-practice-review-item-action">Review now →</a>
        </article>`;
      }).join('')}
    </div>` : `
    <div class="ui-practice-empty-state">
      <p>Your review queue is clear! All spaced intervals are resting. Continue on the Learning Path to encounter new material.</p>
      <a href="/course" class="ui-practice-hero-cta">Go to Learning Path</a>
    </div>`}
  </section>`;
}

function renderVerseLibraryView({ params }) {
  const requested = params.get('tr');
  const stored = safeStorageGet(TRANSLATION_KEY, 'bsb');
  const translation = VERSE_TRANSLATIONS[requested] ? requested : (VERSE_TRANSLATIONS[stored] ? stored : 'bsb');
  if (requested && VERSE_TRANSLATIONS[requested]) safeStorageSet(TRANSLATION_KEY, requested);

  const custom = customTranslationMap();
  const q = params.get('q') || '';
  const theme = params.get('theme') || '';
  const life = params.get('life') || '';
  const book = params.get('book') || '';
  const speaker = params.get('speaker') || '';
  const recipient = params.get('recipient') || '';

  const results = filterVerses({ q, theme, life, book, speaker, recipient });
  const pageSize = 40;
  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  const page = Math.min(pages, Math.max(1, Number(params.get('page') || 1)));
  const visible = results.slice((page - 1) * pageSize, page * pageSize);
  const meta = VERSE_TRANSLATIONS[translation] || VERSE_TRANSLATIONS.bsb;
  const filtersActive = [q, theme, life, book, speaker, recipient].some(Boolean);

  return `
  <section class="ui-practice-verse-screen" aria-label="Verse Library">
    <p><a href="/practice" class="ui-practice-back">← Back to Practice Overview</a></p>
    <header class="ui-practice-header">
      <p class="ui-practice-eyebrow">Curated Scripture Library · ${VERSE_COUNT} passages</p>
      <h1 class="ui-practice-title">Verse Library</h1>
      <p class="ui-practice-lede">Study passages in context. Browse the curated set by book, theme, life context, or speaker; compare translations; then open the passage in the Bible reader.</p>
    </header>

    <div class="ui-practice-verse-toolbar">
      <div class="ui-practice-verse-tr-selector">
        <span class="ui-practice-verse-tr-label">Translation:</span>
        <a href="${verseHref(params, { tr: 'bsb', page: null })}" class="ui-practice-tr-btn ${translation === 'bsb' ? 'is-active' : ''}">BSB</a>
        <a href="${verseHref(params, { tr: 'kjv', page: null })}" class="ui-practice-tr-btn ${translation === 'kjv' ? 'is-active' : ''}">KJV</a>
        <a href="${verseHref(params, { tr: 'custom', page: null })}" class="ui-practice-tr-btn ${translation === 'custom' ? 'is-active' : ''}">Yours</a>
      </div>
      <div class="ui-practice-verse-tools">
        <a href="/practice?arcade=verse-drill&scope=all" class="ui-practice-tr-action">Start Verse Drill</a>
      </div>
    </div>

    <form class="ui-practice-verse-filters" method="get" action="/practice">
      <input type="hidden" name="mode" value="verses">
      <input type="hidden" name="tr" value="${esc(translation)}">
      <label class="ui-practice-filter-field ui-practice-filter-field--search">
        <span>Search</span>
        <input name="q" value="${esc(q)}" placeholder="Reference, wording, note…">
      </label>
      <label class="ui-practice-filter-field">
        <span>Theme</span>
        <select name="theme">${optionList(VERSE_THEMES.filter(item => item !== 'fruitlist'), theme, 'All themes')}</select>
      </label>
      <label class="ui-practice-filter-field">
        <span>Life context</span>
        <select name="life">${optionList(VERSE_LIFE_FACETS, life, 'All contexts')}</select>
      </label>
      <label class="ui-practice-filter-field">
        <span>Book</span>
        <select name="book">${optionList(VERSE_BOOKS, book, 'All books')}</select>
      </label>
      <div class="ui-practice-filter-actions">
        <button class="ui-practice-hero-cta" type="submit">Filter</button>
        ${filtersActive ? `<a class="ui-practice-tr-btn" href="/practice?mode=verses&tr=${encodeURIComponent(translation)}">Clear</a>` : ''}
      </div>
    </form>

    <div class="ui-practice-verse-grid" role="list">
      ${visible.map(verse => {
        const text = verseText(verse, translation, custom);
        const chapter = verseChapter(verse);
        return `
        <article class="ui-practice-verse-card" role="listitem">
          <div class="ui-practice-verse-card-header">
            <span class="ui-practice-verse-card-book">${esc(verse.book)}</span>
            <h2 class="ui-practice-verse-card-ref">${esc(verse.ref)}</h2>
            <span class="ui-practice-verse-card-tr">${esc(VERSE_TRANSLATIONS[translation]?.short || 'BSB')}</span>
          </div>
          <blockquote class="ui-practice-verse-quote">${esc(text)}</blockquote>
          ${verse.note ? `<p class="ui-practice-verse-note">${esc(verse.note)}</p>` : ''}
          <div class="ui-practice-verse-actions">
            <a href="/bible?book=${verse.bn}&chapter=${chapter}">Read in Bible reader →</a>
            <a href="/search?q=${encodeURIComponent(verse.ref)}">Cross-references</a>
          </div>
        </article>`;
      }).join('') || '<p class="ui-practice-empty-state">No passages match these filters.</p>'}
    </div>

    ${pages > 1 ? `
    <nav class="ui-practice-pagination" aria-label="Verse library pages">
      ${page > 1 ? `<a class="ui-practice-tr-btn" href="${verseHref(params, { page: page - 1 })}">← Previous</a>` : ''}
      <span>Page ${page} of ${pages}</span>
      ${page < pages ? `<a class="ui-practice-tr-btn" href="${verseHref(params, { page: page + 1 })}">Next →</a>` : ''}
    </nav>` : ''}
  </section>`;
}

export function mount(container, optionsOrParams = {}) {
  let params;
  if (optionsOrParams instanceof URLSearchParams) {
    params = optionsOrParams;
  } else if (optionsOrParams?.params instanceof URLSearchParams) {
    params = optionsOrParams.params;
  } else if (typeof optionsOrParams?.params === 'object') {
    params = new URLSearchParams(optionsOrParams.params);
  } else if (typeof optionsOrParams === 'object' && !optionsOrParams.data) {
    params = new URLSearchParams(optionsOrParams);
  } else {
    params = new URLSearchParams(location.search);
  }

  const catalog = optionsOrParams.data || window.CANON_CATALOG || {};
  let cleanupRun = null;

  async function renderCurrent() {
    const state = optionsOrParams.state || await getState();
    container.innerHTML = practiceView({
      data: catalog,
      state,
      params,
      dueReviews,
      activityHref: optionsOrParams.activityHref
    });
    cleanupRun = activatePracticeRun(container);
  }

  renderCurrent();

  return function cleanup() {
    if (typeof cleanupRun === 'function') cleanupRun();
  };
}
