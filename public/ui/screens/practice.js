// Step 5 (phase 7): Review & Practice overview.
// This screen owns every /practice address. The overview is built here; the detailed review, verse library,
// game and achievement modes (?mode=, ?arcade=, ?play=) keep their own content (rebuilt later) but open inside
// the same frame: the rail on the left, the mode in the middle, the progress panel on the right.
import { renderProgressBar, setFrameVariant } from '../components/index.js';
import { mountProgressBars } from '../components/progress-bar.js';
import { practiceStateSummary } from '../../practice-state.js';

const ic = body => `<svg class="cs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const ICONS = Object.freeze({
  review: ic('<path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v4.5h-4.5"></path>'),
  books: ic('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"></path><path d="M12 6.5v13"></path>'),
  games: ic('<rect x="3" y="7" width="18" height="12" rx="3"></rect><path d="M8 11v4M6 13h4M15.5 12.5h.01M18 14.5h.01"></path>'),
  award: ic('<circle cx="12" cy="9" r="5"></circle><path d="m8.5 13.5-1.5 7 5-3 5 3-1.5-7"></path>'),
  down: ic('<path d="m6 9 6 6 6-6"></path>'),
  grid: ic('<rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M4 10h16M10 4v16"></path>'),
  search: ic('<circle cx="10.5" cy="10.5" r="6.5"></circle><path d="M15.5 15.5 21 21"></path>'),
  swipe: ic('<rect x="7" y="3" width="10" height="18" rx="2"></rect><path d="M3 12h2M19 12h2"></path>'),
  hint: ic('<path d="M4 17h3M9 17h3M14 17h3M19 17h1"></path><path d="M12 4v6"></path>')
});

/** The three practice games' artwork, from the template. */
const ART = Object.freeze({
  sequence: '<div class="cs-art cs-art--paper"><div class="cs-art-books"><span></span><span></span><span class="is-out"></span><span></span><span></span></div></div>',
  memory: `<div class="cs-art cs-art--blue"><div class="cs-art-tiles">${[0, 1, 0, 0, 0, 0, 1, 0].map(rose => `<span${rose ? ' class="is-rose"' : ''}></span>`).join('')}</div></div>`,
  rule: '<div class="cs-art cs-art--green"><div class="cs-art-rule"><span class="is-wisdom"></span><span class="is-wisdom"></span><span class="is-major"></span><span class="is-wisdom"></span><span class="is-major is-picked"></span><span class="is-major"></span></div></div>'
});

const dueFor = (db, state) => typeof db?.dueReviews === 'function' ? db.dueReviews(state) : [];

function nextReviewLabel(state, now = Date.now()) {
  const next = Object.values(state.reviewSchedule || {})
    .map(item => Date.parse(item?.dueAt))
    .filter(timestamp => Number.isFinite(timestamp) && timestamp > now)
    .sort((a, b) => a - b)[0];
  if (!next) return 'None scheduled';
  const days = Math.ceil((next - now) / 86_400_000);
  if (days <= 1) return 'Tomorrow';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(next);
}

function dueDescription(due, data, esc) {
  if (!due.length) return 'Your spaced review queue is clear. New items appear after scored Pathway work.';
  const activityIds = new Set(due.map(item => item.id));
  const unitId = (data.activities || []).find(activity => activityIds.has(activity.id))?.unitId;
  const unit = (data.units || []).find(item => item.id === unitId);
  return unit
    ? `${due.length} item${due.length === 1 ? '' : 's'} from ${esc(unit.title)} are ready to revisit.`
    : `${due.length} item${due.length === 1 ? '' : 's'} are ready to revisit.`;
}

/** The left pane (template: .cs-rail). `active` is the current item's key. */
function practiceRail(dueCount, active) {
  const item = (key, href, label, icon, count) => `<a class="cs-rail__item${key === active ? ' is-current' : ''}" href="${href}"${key === active ? ' aria-current="page"' : ''}>${icon}<span class="cs-grow">${label}</span>${count === undefined ? '' : `<span class="cs-count">${count}</span>`}</a>`;
  return `<nav class="cs-card cs-rail practice-rail" aria-label="Review and practice"><span class="cs-rail__label">Review</span>${item('review', '/practice?mode=review', 'Due for review', ICONS.review, dueCount)}<span class="cs-rail__section">Practice</span>${item('verses', '/practice?mode=verses', 'Verse library', ICONS.books)}${item('arcade', '/practice?mode=arcade', 'Games', ICONS.games, 3)}${item('achievements', '/practice?mode=achievements', 'Achievements', ICONS.award)}</nav>`;
}

/** The phone's menu (template: .cs-typepicker): a drop-down that stands in for the left pane. */
function practicePicker(dueCount, active) {
  const options = [['review', 'Due for review', ICONS.review], ['verses', 'Verse library', ICONS.books], ['arcade', 'Games', ICONS.games], ['achievements', 'Achievements', ICONS.award]];
  const current = options.find(([key]) => key === active) || options[0];
  const count = current[0] === 'review' ? ` <span class="cs-count">${dueCount}</span>` : '';
  return `<label class="cs-typepicker cs-typepicker--block practice-picker">${current[2]}<span class="cs-grow">${current[1]}${count}</span>${ICONS.down}<select aria-label="Review and practice" data-practice-select>${options.map(([key, label]) => `<option value="/practice?mode=${key}"${key === current[0] ? ' selected' : ''}>${label}</option>`).join('')}</select></label>`;
}

function statsAside({ due, summary, reviewCount, state, achievementProgress }) {
  return `<aside class="cs-stack practice-stats" aria-label="Your progress">
      <section class="cs-card cs-panel cs-stats practice-stat-card">
        <span class="cs-caption cs-caption--label">Review</span>
        <div class="cs-split"><span>Items you’re keeping</span><span class="cs-muted">${reviewCount}</span></div>
        <div class="cs-split"><span>Due now</span><span class="${due.length ? 'cs-due-count' : 'cs-muted'}">${due.length}</span></div>
        <div class="cs-split"><span>Next review after this</span><span class="cs-muted">${nextReviewLabel(state)}</span></div>
      </section>
      <section class="cs-card cs-panel cs-stats practice-stat-card">
        <span class="cs-caption cs-caption--label">Practice</span>
        <div class="cs-split"><span>Games played</span><span class="cs-muted">${summary.state.arcade.plays}</span></div>
        <div class="cs-progress-row"><div class="cs-split"><span>Achievements</span><span class="cs-muted">${summary.achievements} of ${summary.totalAchievements}</span></div>${achievementProgress}</div>
        <span class="cs-caption cs-caption--fine">Practice is just for you. There are no streaks or leaderboards.</span>
      </section>
    </aside>`;
}

const GAMES = Object.freeze([
  { art: 'sequence', title: 'Sequence Repair', text: 'Put a shuffled run of Bible books back in canonical order.', note: 'Book order · 10 rounds', href: '/practice?mode=arcade&game=sequence&scope=all' },
  { art: 'memory', title: 'Memory', text: 'Match books with their place in the library.', note: 'Pairs · 10 rounds', href: '/practice?mode=arcade&game=pairs&scope=all' },
  { art: 'rule', title: 'Rule Discovery', text: 'Spot the book that breaks the pattern, then test your reasoning.', note: 'Reasoning · 10 rounds', href: '/practice?mode=arcade&game=odd&scope=all' }
]);
const COMING = Object.freeze([
  ['grid', 'Crossword', 'Clues that make you think, built from the Glossary.'],
  ['search', 'Word search', 'A light warm-up with names, places, and terms.'],
  ['swipe', 'Swipe sort', 'Text or interpretation? Swipe to decide. Untimed or beat the clock.'],
  ['hint', 'Hint reveal', 'Guess the name from its letter count as new hints appear.']
]);

const achievementBar = summary => renderProgressBar({ value: summary.achievements, max: summary.totalAchievements, ariaLabel: 'Achievements earned', variant: 'accent', className: 'practice-screen__progress' });

function overview({ container, data, state, db, esc }) {
  const due = dueFor(db, state);
  const summary = practiceStateSummary();
  const reviewCount = Object.keys(state.reviewSchedule || {}).length;
  const minutes = Math.max(1, Math.round(due.length * 4 / 3));
  const games = GAMES.map(game => `<a class="cs-card cs-game practice-screen__game" href="${game.href}">${ART[game.art]}<span class="cs-game__title">${game.title}</span><span class="cs-game__text">${game.text}</span><span class="cs-caption">${game.note}</span></a>`).join('');
  const coming = COMING.map(([icon, title, text]) => `<li class="cs-coming__item"><span class="cs-coming__icon">${ICONS[icon]}</span><div><span class="cs-coming__title">${title}</span><span class="cs-coming__text">${text}</span></div></li>`).join('');

  container.innerHTML = `
    ${practiceRail(due.length, 'review')}
    <section class="cs-column practice-screen__main" aria-label="Review and practice">
      <div class="cs-heading"><h1>Review &amp; Practice</h1><span class="cs-sub">Review keeps what you’ve learned. Practice is optional and doesn’t count toward lessons.</span></div>
      ${practicePicker(due.length, 'review')}
      <section class="cs-card cs-due practice-screen__due" aria-label="Due for review">
        <div class="cs-grow cs-due__copy"><span class="cs-due__kicker">Due for review</span><span class="cs-due__title">${due.length ? `${due.length} item${due.length === 1 ? '' : 's'} ready to revisit` : 'Nothing due right now'}</span><span class="cs-due__text">${due.length ? `About ${minutes} minute${minutes === 1 ? '' : 's'}. ${dueDescription(due, data, esc)}` : dueDescription(due, data, esc)}</span></div>
        <a class="cs-button" href="${due.length ? '/practice?mode=review' : '/course'}">${due.length ? 'Start review' : 'Continue Learning Path'}</a>
      </section>
      <div class="cs-section-head"><h2>Practice games</h2><span class="cs-caption">More games are on the way</span></div>
      <div class="cs-games">${games}</div>
      <div class="cs-section-head cs-section-head--minor"><h2>Coming later</h2><span class="cs-caption">Working names</span></div>
      <ul class="cs-coming" aria-label="Practice games in development">${coming}</ul>
    </section>
    ${statsAside({ due, summary, reviewCount, state, achievementProgress: achievementBar(summary) })}`;
}

const MODE_RAIL = Object.freeze({ review: 'review', verses: 'verses', arcade: 'arcade', achievements: 'achievements' });
const BACK_LINK = '<p><a href="/practice">← Practice overview</a></p>';

/** A mode keeps its own content; the frame supplies the rail, the progress panel and the way back to the overview. */
async function mode({ container, data, state, db, activityHref, esc, params }) {
  const { practiceView } = await import('../../practice-experience.js');
  const due = dueFor(db, state);
  const summary = practiceStateSummary();
  const reviewCount = Object.keys(state.reviewSchedule || {}).length;
  const active = params.has('arcade') || params.has('play') ? 'arcade' : (MODE_RAIL[params.get('mode')] || '');
  const view = practiceView({ data, state, params, esc, dueReviews: db.dueReviews, activityHref });
  const content = (typeof view === 'string' ? view : view.outerHTML).replace(BACK_LINK, '');
  container.innerHTML = `
    ${practiceRail(due.length, active)}
    <section class="cs-column practice-screen__main practice-screen__mode" aria-label="Practice" data-practice-mode="${esc(params.get('mode') || (params.has('play') ? 'play' : 'arcade'))}">
      ${practicePicker(due.length, active)}
      ${content}
    </section>
    ${statsAside({ due, summary, reviewCount, state, achievementProgress: achievementBar(summary) })}`;
}

export const handles = () => true;

export async function mount(container, context) {
  const { params } = context;
  const main = document.querySelector('main#main');
  const restoreFrame = setFrameVariant('well');
  main?.classList.add('cs-cols--practice');
  if (params.has('mode') || params.has('arcade') || params.has('play')) await mode({ container, ...context });
  else overview({ container, ...context });
  mountProgressBars(container);
  const onChange = event => {
    const select = event.target.closest?.('[data-practice-select]');
    if (select?.value) context.navigate ? context.navigate(select.value) : window.location.assign(select.value);
  };
  container.addEventListener('change', onChange);
  return () => {
    container.removeEventListener('change', onChange);
    main?.classList.remove('cs-cols--practice');
    restoreFrame();
  };
}
