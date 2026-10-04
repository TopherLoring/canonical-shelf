// Learning Path Screen Track (/path & /course)
// Presents path, module, and unit hierarchies simultaneously.
// Conforms to LearningPath.dc.html and design tokens contract.

import { getState } from '../../db.js';
import { renderProgressBar } from '../components/progress-bar.js';
import { LABELS } from '../labels.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let cachedCatalog = null;

async function loadCatalog() {
  if (cachedCatalog) return cachedCatalog;
  if (window.CANON_CATALOG) {
    cachedCatalog = window.CANON_CATALOG;
    return cachedCatalog;
  }
  try {
    const res = await fetch('/data/catalog.json');
    if (res.ok) {
      cachedCatalog = await res.json();
      window.CANON_CATALOG = cachedCatalog;
      return cachedCatalog;
    }
  } catch {
    // Ignore fetch error
  }
  return { courses: [], units: [], lessons: [], activities: [], byUnit: {}, byCourse: {} };
}

function progressFor(ids = [], state = {}) {
  const completed = new Set(state?.completed || []);
  const done = ids.filter(id => completed.has(id)).length;
  const total = ids.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

function activityHref(a) {
  if (!a) return '/course';
  return a.type === 'lesson'
    ? `/course?unit=${encodeURIComponent(a.unitId)}&lesson=${encodeURIComponent(a.sourceId)}`
    : `/course?unit=${encodeURIComponent(a.unitId)}&mastery=${encodeURIComponent(a.sourceId)}`;
}

export function learningPathView({ data, state, params, esc: escapeFn = esc }) {
  const p = params instanceof URLSearchParams ? params : new URLSearchParams(params || {});
  const courses = data?.courses || [];
  const units = data?.units || [];
  const activities = data?.activities || [];
  const completed = new Set(state?.completed || []);

  // Determine active module
  const requestedCourseId = p.get('course');
  let activeCourse = courses.find(c => c.id === requestedCourseId);
  if (!activeCourse) {
    // Pick the first module that has incomplete activities or fallback to first
    activeCourse = courses.find(c => {
      const uIds = data?.byCourse?.[c.id] || [];
      const actIds = uIds.flatMap(uId => data?.byUnit?.[uId] || []);
      const prog = progressFor(actIds, state);
      return prog.done < prog.total;
    }) || courses[0] || { id: 'm1', sequence: 1, title: 'Hermeneutics & Canon', units: [] };
  }

  // Units for active module
  const moduleUnitIds = data?.byCourse?.[activeCourse.id] || [];
  const moduleUnits = moduleUnitIds.map(uId => units.find(u => u.id === uId)).filter(Boolean);
  const moduleActIds = moduleUnitIds.flatMap(uId => data?.byUnit?.[uId] || []);
  const moduleProgress = progressFor(moduleActIds, state);

  // Active or requested unit
  const requestedUnitId = p.get('unit');
  let activeUnit = moduleUnits.find(u => u.id === requestedUnitId);
  if (!activeUnit) {
    activeUnit = moduleUnits.find(u => {
      const uActIds = data?.byUnit?.[u.id] || [];
      const uProg = progressFor(uActIds, state);
      return uProg.done < uProg.total;
    }) || moduleUnits[0];
  }

  // Find next activity for Up Next card
  const nextActivity = activities.find(a => !completed.has(a.id)) || activities[0];
  const nextUnit = nextActivity ? units.find(u => u.id === nextActivity.unitId) : null;
  const nextCourse = nextUnit ? courses.find(c => c.id === nextUnit.courseId) : null;

  // Capstone count across path
  const capstoneCount = activities.filter(a => a.type === 'mastery' && a.masteryType === 'course-capstone').length || 6;

  // Left Column: Path Modules Nav
  const modulesNavHtml = courses.map(course => {
    const uIds = data?.byCourse?.[course.id] || [];
    const actIds = uIds.flatMap(uId => data?.byUnit?.[uId] || []);
    const prog = progressFor(actIds, state);
    const isActive = course.id === activeCourse.id;
    const metaText = prog.total > 0 ? (prog.done > 0 ? `${prog.done} of ${prog.total} lessons` : 'Not started') : '0 lessons';

    return `
    <a href="/course?course=${encodeURIComponent(course.id)}"
       class="lp-module-nav-item ${isActive ? 'is-active' : ''}"
       ${isActive ? 'aria-current="true"' : ''}
       data-course-id="${escapeFn(course.id)}">
      <span class="lp-module-seq">${LABELS.module} ${course.sequence} · ${uIds.length} ${LABELS.unit.toLowerCase()}s</span>
      <span class="lp-module-title">${escapeFn(course.shortTitle || course.title)}</span>
      <span class="lp-module-meta">${escapeFn(metaText)}</span>
      ${renderProgressBar({ value: prog.pct, max: 100, ariaLabel: `${course.title} ${prog.pct}% complete`, variant: 'action' })}
    </a>`;
  }).join('');

  // Phone Module Switcher Buttons
  const phoneModuleTabsHtml = courses.map(course => {
    const isActive = course.id === activeCourse.id;
    return `
    <button type="button"
            class="lp-phone-tab ${isActive ? 'is-active' : ''}"
            data-course-id="${escapeFn(course.id)}"
            role="tab"
            aria-selected="${isActive ? 'true' : 'false'}">
      ${LABELS.module} ${course.sequence}
    </button>`;
  }).join('');

  // Center Column: Units Accordion
  const unitsListHtml = moduleUnits.map(unit => {
    const uActIds = data?.byUnit?.[unit.id] || [];
    const uProg = progressFor(uActIds, state);
    const isComplete = uProg.total > 0 && uProg.done === uProg.total;
    const isUnitExpanded = activeUnit ? unit.id === activeUnit.id : false;

    let statusLabel = 'Not started';
    let statusClass = 'not-started';
    if (isComplete) {
      statusLabel = 'Complete';
      statusClass = 'complete';
    } else if (uProg.done > 0) {
      statusLabel = `In progress · ${uProg.done} of ${uProg.total}`;
      statusClass = 'in-progress';
    }

    const unitActivities = uActIds.map(aId => activities.find(a => a.id === aId)).filter(Boolean);
    const lessonsListHtml = unitActivities.map((act, index) => {
      const isActDone = completed.has(act.id);
      const isNext = nextActivity && act.id === nextActivity.id;
      const isMastery = act.type === 'mastery';

      let chipClass = 'is-upcoming';
      let chipContent = `${index + 1}`;
      if (isActDone) {
        chipClass = 'is-complete';
      } else if (isNext) {
        chipClass = 'is-active';
      }
      if (isMastery) {
        chipContent = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3 4 7v6c0 4 3.4 7 8 8 4.6-1 8-4 8-8V7z"></path></svg>`;
        chipClass = isActDone ? 'is-complete' : 'is-locked';
      }

      return `
      <li class="lp-lesson-row">
        <span class="lp-lesson-chip ${chipClass}">${chipContent}</span>
        <span class="lp-lesson-title">${escapeFn(act.title)}</span>
        <a href="${activityHref(act)}" class="lp-lesson-cta">${isActDone ? 'Review' : 'Start'}</a>
      </li>`;
    }).join('');

    return `
    <section class="lp-unit-section ${isUnitExpanded ? 'is-expanded' : ''}" data-unit-id="${escapeFn(unit.id)}">
      <button type="button" class="lp-unit-toggle" aria-expanded="${isUnitExpanded ? 'true' : 'false'}" data-toggle-unit="${escapeFn(unit.id)}">
        <span class="lp-unit-seq">${LABELS.unit} ${unit.sequence}</span>
        <span class="lp-unit-name">${escapeFn(unit.title)}</span>
        <span class="lp-unit-status lp-status--${statusClass}">${escapeFn(statusLabel)}</span>
        <span class="lp-unit-chevron">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="${isUnitExpanded ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'}"></path>
          </svg>
        </span>
      </button>
      <ol class="lp-unit-lessons" aria-label="${LABELS.unit} ${unit.sequence} ${LABELS.lesson.toLowerCase()}s" ${isUnitExpanded ? '' : 'hidden'}>
        ${lessonsListHtml}
      </ol>
    </section>`;
  }).join('');

  // Right Column: Up Next & Progress
  const activeUnitProg = activeUnit ? progressFor(data?.byUnit?.[activeUnit.id] || [], state) : { done: 0, total: 1, pct: 0 };
  const totalCourses = courses.length || 4;
  const pathPct = Math.round((courses.findIndex(c => c.id === activeCourse.id) + 1) / totalCourses * 100);

  return `
  <div class="screen-learning-path">
    <!-- Left Column: Path Modules Rail -->
    <nav class="lp-modules-nav" aria-label="${LABELS.learningPath} ${LABELS.module.toLowerCase()}s">
      <span class="lp-nav-header">${LABELS.learningPath} · ${courses.length} ${LABELS.module.toLowerCase()}s</span>
      ${modulesNavHtml}
      <span class="lp-nav-divider">Across the path</span>
      <a href="/practice" class="lp-nav-capstones">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3 4 7v6c0 4 3.4 7 8 8 4.6-1 8-4 8-8V7z"></path>
        </svg>
        <span>${LABELS.capstone}s</span>
        <span class="lp-count-badge">${capstoneCount}</span>
      </a>
    </nav>

    <!-- Center Column: Module & Unit Hierarchy -->
    <section class="lp-module-view" aria-label="${LABELS.module} ${activeCourse.sequence}">
      <!-- Phone Module Selector -->
      <div class="lp-phone-module-bar" role="tablist" aria-label="Select module">
        ${phoneModuleTabsHtml}
      </div>

      <div class="lp-module-header">
        <span class="lp-module-kicker">${LABELS.module} ${activeCourse.sequence} of ${courses.length}</span>
        <h1 class="lp-module-heading">${escapeFn(activeCourse.title)}</h1>
        <span class="lp-module-sub">${moduleUnits.length} ${LABELS.unit.toLowerCase()}s · ${moduleProgress.total} ${LABELS.lesson.toLowerCase()}s</span>
      </div>

      <div class="lp-units-list">
        ${unitsListHtml}
      </div>
    </section>

    <!-- Right Column: Progress Tier -->
    <aside class="lp-progress-aside" aria-label="Your progress">
      ${nextActivity ? `
      <section class="lp-upnext-card">
        <span class="lp-card-eyebrow">Up next</span>
        <span class="lp-card-sub">${nextCourse ? `${LABELS.module} ${nextCourse.sequence} · ` : ''}${nextUnit ? `${LABELS.unit} ${nextUnit.sequence}` : ''}</span>
        <h2 class="lp-card-title">${escapeFn(nextActivity.title)}</h2>
        <a href="${activityHref(nextActivity)}" class="lp-card-primary-cta">Start ${LABELS.lesson.toLowerCase()}</a>
      </section>` : ''}

      <section class="lp-summary-card">
        <span class="lp-card-eyebrow">Progress</span>
        ${activeUnit ? `
        <div class="lp-progress-item">
          <div class="lp-progress-row">
            <span>${LABELS.unit} ${activeUnit.sequence}</span>
            <span>${activeUnitProg.done} of ${activeUnitProg.total} ${LABELS.lesson.toLowerCase()}s</span>
          </div>
          ${renderProgressBar({ value: activeUnitProg.pct, max: 100, ariaLabel: `${activeUnit.title} progress`, variant: 'action' })}
        </div>` : ''}

        <div class="lp-progress-item">
          <div class="lp-progress-row">
            <span>${LABELS.module} ${activeCourse.sequence}</span>
            <span>${moduleProgress.done} of ${moduleProgress.total} ${LABELS.lesson.toLowerCase()}s</span>
          </div>
          ${renderProgressBar({ value: moduleProgress.pct, max: 100, ariaLabel: `${activeCourse.title} progress`, variant: 'action' })}
        </div>

        <div class="lp-progress-item">
          <div class="lp-progress-row">
            <span>${LABELS.learningPath}</span>
            <span>${LABELS.module} ${activeCourse.sequence} of ${courses.length}</span>
          </div>
          ${renderProgressBar({ value: pathPct, max: 100, ariaLabel: `${LABELS.learningPath} progress`, variant: 'action' })}
        </div>
      </section>
    </aside>
  </div>`;
}

// Compatibility exports
export function courseLandingView({ data, state }) {
  return learningPathView({ data, state, params: new URLSearchParams(), esc });
}
export function courseDetailView({ data, state, course }) {
  return learningPathView({ data, state, params: new URLSearchParams({ course: course?.id || '' }), esc });
}
export function unitExperienceView({ data, state, unit, course }) {
  return learningPathView({ data, state, params: new URLSearchParams({ course: course?.id || '', unit: unit?.id || '' }), esc });
}

export function mount(container, params = {}) {
  let isMounted = true;
  const p = params instanceof URLSearchParams ? params : new URLSearchParams(params || {});

  async function render() {
    if (!isMounted) return;
    const [cat, st] = await Promise.all([
      loadCatalog(),
      getState().catch(() => ({}))
    ]);
    if (!isMounted) return;

    container.innerHTML = learningPathView({
      data: cat,
      state: st,
      params: p,
      esc
    });
  }

  function handleClick(e) {
    // Accordion toggle
    const toggle = e.target.closest('[data-toggle-unit]');
    if (toggle) {
      e.preventDefault();
      const unitSection = toggle.closest('.lp-unit-section');
      if (unitSection) {
        const isExpanded = unitSection.classList.toggle('is-expanded');
        toggle.setAttribute('aria-expanded', String(isExpanded));
        const list = unitSection.querySelector('.lp-unit-lessons');
        if (list) list.hidden = !isExpanded;
        const chevron = unitSection.querySelector('.lp-unit-chevron path');
        if (chevron) {
          chevron.setAttribute('d', isExpanded ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6');
        }
      }
      return;
    }

    // Module switcher tab on phone
    const tab = e.target.closest('.lp-phone-tab');
    if (tab) {
      e.preventDefault();
      const courseId = tab.dataset.courseId;
      if (courseId) {
        p.set('course', courseId);
        render();
      }
      return;
    }

    // Module nav item on desktop
    const moduleItem = e.target.closest('.lp-module-nav-item');
    if (moduleItem && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const courseId = moduleItem.dataset.courseId;
      if (courseId) {
        p.set('course', courseId);
        render();
      }
      return;
    }
  }

  container.addEventListener('click', handleClick);
  render();

  return () => {
    isMounted = false;
    container.removeEventListener('click', handleClick);
  };
}
