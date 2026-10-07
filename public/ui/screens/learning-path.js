// Step 3 (S3.J): the Learning Path page. Reference: docs/v7/mockups-2026-10-03/LearningPath.dc.html.
//
// Left: the path's modules (title and "n of m lessons"), plus "Across the path: Capstones". Middle: the selected
// module with its units as accordions; an open unit lists its lessons, its Checkpoint, and any older practice.
// Right: "Up next" and three progress bars (the open unit, the module, the whole path).
//
// Naming (ui.naming.hide-module-unit-labels-2026-10-05): learners never see the words "Module" or "Unit", only titles;
// "Lesson" stays. The per-unit check is "Checkpoint · <title>" (ui.naming.checkpoint-bare-2026-10-05). Nothing is locked:
// everything is reachable in any order (navigation.hierarchy). Progress is counted in lessons.
//
// Addresses: /course, /course?course=<id>, /course?unit=<id>. Lessons (?lesson=), Checkpoints (?mastery=), the glossary
// and the orientation unit stay on their own views.
import { renderRail, renderPanel, renderProgressScopeGroup } from '../components/index.js';
import { LABELS } from '../labels.js';

export const handles = params =>
  !params.has('lesson') && !params.has('mastery') && !params.has('glossary') && params.get('unit') !== 'unit.orientation';

const icon = path => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const CHEVRON = icon('<path d="m6 9 6 6 6-6"/>');
const FLAG = icon('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>');
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Everything the page needs from the catalog and the learner's state, computed once per render. */
function buildModel(data, state) {
  const acts = new Map((data.activities || []).map(a => [a.id, a]));
  const lessons = new Map((data.lessons || []).map(l => [l.id, l]));
  const units = new Map((data.units || []).map(u => [u.id, u]));
  const completed = new Set(state?.completed || []);
  const due = new Set(Object.entries(state?.reviewSchedule || {}).filter(([, r]) => Date.parse(r?.dueAt) <= Date.now()).map(([id]) => id));
  const unitsOf = course => (data.byCourse?.[course.id] || []).map(id => units.get(id)).filter(Boolean);
  const partsOf = unit => {
    const all = (data.byUnit?.[unit.id] || []).map(id => acts.get(id)).filter(Boolean);
    return {
      lessons: all.filter(a => a.type === 'lesson'),
      checkpoint: all.find(a => a.masteryType === 'unit-mastery') || null,
      capstone: all.find(a => a.masteryType === 'course-capstone') || null,
      practice: all.filter(a => a.masteryType === 'legacy')
    };
  };
  const lessonCount = list => ({ done: list.filter(a => completed.has(a.id)).length, total: list.length });
  /** The next thing to do in a unit: its first unfinished lesson, then its Checkpoint. */
  const nextIn = unit => {
    const p = partsOf(unit);
    return p.lessons.find(a => !completed.has(a.id)) || (p.checkpoint && !completed.has(p.checkpoint.id) ? p.checkpoint : null);
  };
  return { acts, lessons, units, completed, due, unitsOf, partsOf, lessonCount, nextIn, data, state };
}

function unitStatus(m, unit) {
  const p = m.partsOf(unit);
  const { done, total } = m.lessonCount(p.lessons);
  const reviews = [...p.lessons, p.checkpoint, ...p.practice].filter(a => a && m.due.has(a.id)).length;
  if (reviews) return { kind: 'due', text: `${plural(reviews, 'review')} due` };
  const checkpointDone = !p.checkpoint || m.completed.has(p.checkpoint.id);
  if (total && done === total && checkpointDone) return { kind: 'complete', text: 'Complete' };
  if (done || (p.checkpoint && m.completed.has(p.checkpoint.id))) return { kind: 'progress', text: `In progress · ${done} of ${total}` };
  return { kind: 'new', text: plural(total, 'lesson') };
}

function row(m, esc, activityHref, activity, { number, title, objective, nextId, eyebrow = '' }) {
  const done = m.completed.has(activity.id);
  const isDue = m.due.has(activity.id);
  const mastered = activity.type === 'mastery' && m.state?.mastery?.[activity.id]?.passed === true;
  const status = isDue ? 'Review due' : mastered ? 'Mastered' : done ? 'Complete' : nextId === activity.id ? 'Start' : '';
  const marker = isDue ? '↻' : done ? '✓' : number;
  return `<li class="path-row" data-state="${isDue ? 'due' : done ? 'done' : nextId === activity.id ? 'next' : 'open'}">
    <a class="path-row-link" href="${esc(activityHref(activity.id))}" data-activity-link="${esc(activity.id)}">
      <span class="path-row-mark" aria-hidden="true">${marker}</span>
      <span class="path-row-main">
        ${eyebrow ? `<span class="path-row-eyebrow">${esc(eyebrow)}</span>` : ''}
        <span class="path-row-title">${esc(title)}</span>
        ${objective ? `<span class="path-row-objective unit-lesson-objective">${esc(objective)}</span>` : ''}
      </span>
      <span class="path-row-status">${esc(status)}</span>
    </a>
  </li>`;
}

function unitMarkup(m, esc, activityHref, unit, open) {
  const p = m.partsOf(unit);
  const status = unitStatus(m, unit);
  const next = m.nextIn(unit);
  const lessonDone = m.lessonCount(p.lessons).done === p.lessons.length;
  const rows = p.lessons.map((a, i) => {
    const lesson = m.lessons.get(a.sourceId);
    return row(m, esc, activityHref, a, { number: i + 1, title: lesson?.title || a.title, objective: lesson?.objective, nextId: next?.id });
  });
  if (p.checkpoint) {
    const done = m.completed.has(p.checkpoint.id);
    rows.push(`<li class="path-row path-row--checkpoint" data-state="${done ? 'done' : next?.id === p.checkpoint.id ? 'next' : 'open'}">
      <a class="path-row-link" href="${esc(activityHref(p.checkpoint.id))}" data-activity-link="${esc(p.checkpoint.id)}">
        <span class="path-row-mark" aria-hidden="true">${done ? '✓' : FLAG}</span>
        <span class="path-row-main"><span class="path-row-title">${esc(LABELS.unitCheck)} · ${esc(unit.title)}</span></span>
        <span class="path-row-status">${esc(done ? (m.state?.mastery?.[p.checkpoint.id]?.passed === true ? 'Mastered' : 'Complete') : lessonDone ? 'Start' : 'After the lessons')}</span>
      </a></li>`);
  }
  if (p.capstone) rows.push(row(m, esc, activityHref, p.capstone, { number: FLAG, title: p.capstone.title, nextId: next?.id }));
  const practice = p.practice.length
    ? `<details class="path-practice"><summary>More practice <span>${p.practice.length}</span></summary><ol>${p.practice.map(a => row(m, esc, activityHref, a, { number: '•', title: a.title, nextId: null })).join('')}</ol></details>`
    : '';
  return `<details class="path-unit" data-path-unit="${esc(unit.id)}" ${open ? 'open' : ''}>
    <summary><span class="path-unit-title">${esc(unit.title)}</span><span class="path-unit-status" data-kind="${status.kind}">${esc(status.text)}</span><span class="path-unit-chevron" aria-hidden="true">${CHEVRON}</span></summary>
    <ol class="path-rows" aria-label="${esc(unit.title)}">${rows.join('')}</ol>${practice}
  </details>`;
}

export async function mount(container, ctx) {
  const { data, state, params, esc, navigate, activityHref } = ctx; // activityHref takes an activity id
  const m = buildModel(data, state);
  const courses = data.courses || [];
  if (!courses.length) { container.innerHTML = '<p class="notice">The Learning Path is not available yet.</p>'; return; }

  const requestedUnit = m.units.get(data.legacyUnitAliases?.[params.get('unit')] || params.get('unit'));
  const requestedCourseId = data.legacyCourseAliases?.[params.get('course')] || params.get('course');
  const current = courses.find(c => m.unitsOf(c).some(u => m.nextIn(u))) || courses[0];
  const course = courses.find(c => c.id === (requestedUnit?.courseId || requestedCourseId)) || current;
  const index = courses.indexOf(course);
  const courseUnits = m.unitsOf(course);
  let selected = requestedUnit && requestedUnit.courseId === course.id ? requestedUnit : courseUnits.find(u => m.nextIn(u)) || courseUnits[0];

  const lessonTotals = c => m.lessonCount(m.unitsOf(c).flatMap(u => m.partsOf(u).lessons));
  const pathTotals = m.lessonCount(courses.flatMap(c => m.unitsOf(c).flatMap(u => m.partsOf(u).lessons)));
  const moduleTotals = lessonTotals(course);
  const capstones = (data.activities || []).filter(a => a.masteryType === 'course-capstone');

  const railHtml = renderRail({
    ariaLabel: LABELS.learningPath,
    id: 'path-modules',
    sections: [
      {
        title: LABELS.learningPath,
        items: courses.map(c => {
          const t = lessonTotals(c);
          return { href: `/course?course=${encodeURIComponent(c.id)}`, label: c.title, sublabel: t.done ? `${t.done} of ${t.total} lessons` : plural(t.total, 'lesson'), isActive: c.id === course.id };
        })
      },
      { title: 'Across the path', items: [{ href: '#path-capstones', label: 'Capstones', count: capstones.length, id: 'path-capstones-link' }] }
    ]
  });

  const orientation = (data.lessons || []).some(l => l.id === 'orientation')
    ? `<a class="path-orientation" href="/course?unit=unit.orientation&lesson=orientation">New here? Start with the orientation</a>` : '';

  const capstoneRows = capstones.map(a => {
    const unit = m.units.get(a.unitId);
    return row(m, esc, activityHref, a, { number: FLAG, title: a.title, eyebrow: unit ? `After ${unit.title}` : '', nextId: null });
  }).join('');

  function asideHtml() {
    const unit = selected;
    const unitTotals = m.lessonCount(m.partsOf(unit).lessons);
    const next = m.nextIn(unit) || courseUnits.map(u => m.nextIn(u)).find(Boolean) || null;
    const nextUnit = next ? m.units.get(next.unitId) : null;
    const lessonNumber = next?.type === 'lesson' ? m.partsOf(nextUnit).lessons.indexOf(next) + 1 : 0;
    const upNext = next
      ? renderPanel({
          eyebrow: 'Up next',
          title: next.masteryType === 'unit-mastery' ? `${LABELS.unitCheck} · ${nextUnit.title}` : (m.lessons.get(next.sourceId)?.title || next.title),
          body: `<p class="path-up-meta">${esc(course.title)} · ${esc(nextUnit?.title || '')}${lessonNumber ? ` · ${esc(LABELS.lesson)} ${lessonNumber}` : ''}</p>
            <a class="path-start" href="${esc(activityHref(next.id))}" data-path-start>${next.type === 'lesson' ? 'Start lesson' : `Start ${esc(LABELS.unitCheck)}`}</a>`
        })
      : renderPanel({ eyebrow: 'Up next', title: 'You are all caught up', body: `<p class="path-up-meta">Every lesson here is complete.</p><a class="path-start" href="/practice">Review &amp; Practice</a>` });
    const progress = renderPanel({
      title: 'Progress',
      body: renderProgressScopeGroup({
        scopes: [
          { scope: 'unit', label: unit.title, value: unitTotals.done, max: unitTotals.total || 1, status: `${unitTotals.done} of ${unitTotals.total} lessons` },
          { scope: 'module', label: course.title, value: moduleTotals.done, max: moduleTotals.total || 1, status: `${moduleTotals.done} of ${moduleTotals.total} lessons` },
          { scope: 'path', label: LABELS.learningPath, value: pathTotals.done, max: pathTotals.total || 1, status: `${pathTotals.done} of ${pathTotals.total} lessons` }
        ]
      })
    });
    return `${upNext}${progress}${orientation}`;
  }

  container.innerHTML = `<section class="path-screen" data-learning-path aria-labelledby="path-title">
    <div class="path-rail-wrap">${railHtml}</div>
    <div class="path-main">
      <header class="path-head">
        <p class="path-eyebrow">${esc(LABELS.learningPath)} · ${index + 1} of ${courses.length}</p>
        <h1 id="path-title">${esc(course.title)}</h1>
        <p class="path-scope">${plural(moduleTotals.total, 'lesson')}</p>
        <label class="path-picker"><span class="sr-only">Choose a section of the Learning Path</span>
          <select data-path-picker>${courses.map(c => `<option value="${esc(c.id)}" ${c.id === course.id ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select></label>
      </header>
      <div class="path-units" data-path-units>${courseUnits.map(u => unitMarkup(m, esc, activityHref, u, u.id === selected?.id)).join('')}</div>
      <details class="path-unit path-capstones" id="path-capstones"><summary><span class="path-unit-title">Capstones</span><span class="path-unit-status" data-kind="new">${capstones.length}</span><span class="path-unit-chevron" aria-hidden="true">${CHEVRON}</span></summary><ol class="path-rows" aria-label="Capstones">${capstoneRows}</ol></details>
    </div>
    <aside class="path-aside" aria-label="Your progress" data-path-aside>${asideHtml()}</aside>
  </section>`;

  const root = container.querySelector('[data-learning-path]');
  const capstoneList = root.querySelector('#path-capstones');

  const onToggle = event => {
    const detail = event.target;
    if (!detail.matches?.('[data-path-unit]') || !detail.open) return;
    root.querySelectorAll('[data-path-unit]').forEach(other => { if (other !== detail) other.open = false; });
    if (selected?.id !== detail.dataset.pathUnit) {
      selected = m.units.get(detail.dataset.pathUnit);
      const address = new URL(location.href);
      address.searchParams.set('unit', selected.id);
      address.searchParams.delete('course');
      history.replaceState(history.state, '', address);
      root.querySelector('[data-path-aside]').innerHTML = asideHtml();
    }
  };
  const onPick = event => { if (event.target.matches('[data-path-picker]')) navigate(`/course?course=${encodeURIComponent(event.target.value)}`); };
  const onClick = event => {
    if (event.target.closest('#path-capstones-link')) {
      event.preventDefault();
      capstoneList.open = true;
      capstoneList.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };
  root.addEventListener('toggle', onToggle, true);
  root.addEventListener('change', onPick);
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('toggle', onToggle, true);
    root.removeEventListener('change', onPick);
    root.removeEventListener('click', onClick);
  };
}
