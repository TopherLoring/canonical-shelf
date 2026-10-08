// Step 5 (phase 7): Review & Practice overview.
// This screen owns every /practice address. The overview is built here; the detailed review, verse library,
// game and achievement modes (?mode=, ?arcade=, ?play=) keep their own content (rebuilt later) but open inside
// the same frame: the rail on the left, the mode in the middle, the progress panel on the right.
import { renderGameTile, renderProgressBar, renderRail } from '../components/index.js';
import { mountProgressBars } from '../components/progress-bar.js';
import { practiceStateSummary } from '../../practice-state.js';

const ICONS = Object.freeze({
  review: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v4.5h-4.5"></path></svg>',
  books: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"></path><path d="M12 6.5v13"></path></svg>',
  sequence: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h11M4 12h7M4 18h13"></path><path d="m15 9 3 3-3 3"></path></svg>',
  memory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="8" height="7" rx="1.5"></rect><rect x="13" y="12" width="8" height="7" rx="1.5"></rect><path d="M7 15v.01M17 8v.01"></path></svg>',
  discovery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5M8 10.5h5M10.5 8v5"></path></svg>',
  overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"></rect><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"></rect><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"></rect><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"></rect></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5"></circle><path d="m8.5 13.5-1.5 7 5-3 5 3-1.5-7"></path></svg>'
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

function practiceRail(dueCount, active) {
  const item = (key, href, label, icon, extra = {}) => ({ href, label, icon, isActive: key === active, ...extra });
  return renderRail({
    ariaLabel: 'Review and practice',
    className: 'practice-screen__rail',
    sections: [
      { title: 'Review & Practice', items: [item('overview', '/practice', 'Overview', ICONS.overview)] },
      { title: 'Review', items: [item('review', '/practice?mode=review', 'Due for review', ICONS.review, { count: dueCount })] },
      { title: 'Practice', items: [
        item('verses', '/practice?mode=verses', 'Verse library', ICONS.books),
        item('arcade', '/practice?mode=arcade', 'Games', ICONS.discovery)
      ] },
      { title: '', items: [item('achievements', '/practice?mode=achievements', 'Achievements', ICONS.award)] }
    ]
  });
}

function statsAside({ due, summary, reviewCount, state, achievementProgress }) {
  return `<aside class="practice-screen__stats" aria-label="Your progress">
      <section class="ui-game-tile practice-screen__stat-card">
        <p class="eyebrow">Review</p>
        <dl>
          <div><dt>Items you’re keeping</dt><dd>${reviewCount}</dd></div>
          <div><dt>Due now</dt><dd>${due.length}</dd></div>
          <div><dt>Next review</dt><dd>${nextReviewLabel(state)}</dd></div>
        </dl>
      </section>
      <section class="ui-game-tile practice-screen__stat-card">
        <p class="eyebrow">Practice</p>
        <dl><div><dt>Games played</dt><dd>${summary.state.arcade.plays}</dd></div></dl>
        <div class="practice-screen__achievement-label"><span>Achievements</span><span>${summary.achievements} of ${summary.totalAchievements}</span></div>
        ${achievementProgress}
        <p>Practice is for your own learning. There are no streaks or leaderboards.</p>
      </section>
    </aside>`;
}

function overview({ container, data, state, db, activityHref, esc }) {
  const due = dueFor(db, state);
  const summary = practiceStateSummary();
  const reviewCount = Object.keys(state.reviewSchedule || {}).length;
  const dueItems = due.slice(0, 4).map(entry => {
    const activity = (data.activities || []).find(item => item.id === entry.id);
    const href = activityHref(entry.id);
    return `<a class="practice-review-row" href="${href}"><span>${esc(activity?.title || entry.id)}</span><span>${entry.intervalDays}-day interval</span></a>`;
  }).join('');

  const rail = practiceRail(due.length, 'overview');

  const games = [
    { title: 'Sequence Repair', description: 'Put a shuffled run of Bible books back in canonical order.', badge: 'Book order', icon: ICONS.sequence, href: '/practice?mode=arcade&game=sequence&scope=all' },
    { title: 'Memory', description: 'Match books with their place in the library.', badge: 'Pairs', icon: ICONS.memory, href: '/practice?mode=arcade&game=pairs&scope=all' },
    { title: 'Rule Discovery', description: 'Spot the book that breaks the pattern, then test your reasoning.', badge: 'Reasoning', icon: ICONS.discovery, href: '/practice?mode=arcade&game=odd&scope=all' }
  ].map(game => renderGameTile({ ...game, className: 'practice-screen__game' })).join('');
  const achievementProgress = renderProgressBar({
    value: summary.achievements,
    max: summary.totalAchievements,
    ariaLabel: 'Achievements earned',
    className: 'practice-screen__progress'
  });

  container.innerHTML = `
    <div class="practice-screen">
      ${rail}
      <section class="practice-screen__main" aria-label="Review and practice overview">
        <header class="practice-screen__heading">
          <p class="eyebrow">Keep what you have learned</p>
          <h1>Review &amp; Practice</h1>
          <p>Review brings ideas back over time. Optional practice games build recall without counting toward lessons.</p>
        </header>

        <section class="ui-game-tile practice-screen__due" aria-labelledby="practice-due-title">
          <div class="practice-screen__due-copy">
            <p class="eyebrow">Due for review</p>
            <h2 id="practice-due-title">${due.length ? `${due.length} item${due.length === 1 ? '' : 's'} ready to revisit` : 'Nothing due right now'}</h2>
            <p>${dueDescription(due, data, esc)}</p>
          </div>
          <a class="button button--primary" href="${due.length ? '/practice?mode=review' : '/course'}">${due.length ? 'Start review' : 'Continue Learning Path'}</a>
          ${dueItems ? `<div class="practice-screen__due-list" aria-label="Due review items">${dueItems}</div>` : ''}
        </section>

        <div class="practice-screen__section-head">
          <h2>Practice games</h2>
          <a href="/practice?mode=arcade">Explore all games</a>
        </div>
        <div class="practice-screen__games">${games}</div>

        <div class="practice-screen__section-head practice-screen__section-head--later">
          <h2>Coming later</h2><span>In development</span>
        </div>
        <ul class="practice-screen__coming" aria-label="Practice games in development">
          <li class="ui-game-tile"><strong>Crossword</strong><span>Clues built from the glossary.</span></li>
          <li class="ui-game-tile"><strong>Word search</strong><span>A warm-up with names, places, and terms.</span></li>
          <li class="ui-game-tile"><strong>Swipe sort</strong><span>Sort text, interpretation, and application.</span></li>
          <li class="ui-game-tile"><strong>Hint reveal</strong><span>Use a sequence of clues to identify a book or idea.</span></li>
        </ul>
      </section>

      ${statsAside({ due, summary, reviewCount, state, achievementProgress })}
    </div>`;
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
  const achievementProgress = renderProgressBar({
    value: summary.achievements,
    max: summary.totalAchievements,
    ariaLabel: 'Achievements earned',
    className: 'practice-screen__progress'
  });
  container.innerHTML = `
    <div class="practice-screen" data-practice-mode="${esc(params.get('mode') || (params.has('play') ? 'play' : 'arcade'))}">
      ${practiceRail(due.length, active)}
      <section class="practice-screen__main practice-screen__mode" aria-label="Practice">${content}</section>
      ${statsAside({ due, summary, reviewCount, state, achievementProgress })}
    </div>`;
}

export const handles = () => true;

export async function mount(container, context) {
  const { params } = context;
  if (params.has('mode') || params.has('arcade') || params.has('play')) await mode({ container, ...context });
  else overview({ container, ...context });
  mountProgressBars(container);
}
