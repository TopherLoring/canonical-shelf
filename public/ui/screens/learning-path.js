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
// stay on their own views.
import { renderProgressBar, mountProgressBars, setFrameVariant } from '../components/index.js';
import { LABELS } from '../labels.js';

export const handles = params =>
  !params.has('lesson') && !params.has('mastery') && !params.has('glossary');

const ic = body => `<svg class="cs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const I = Object.freeze({
  down: ic('<path d="m6 9 6 6 6-6"></path>'),
  up: ic('<path d="m6 15 6-6 6 6"></path>'),
  left: ic('<path d="m15 6-6 6 6 6"></path>'),
  check: ic('<path d="m5 12 4.5 4.5L19 7"></path>'),
  flag: ic('<path d="M5 21V4M5 4h11l-2 4 2 4H5"></path>'),
  shield: ic('<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"></path><path d="m9 12 2.2 2.2L15.5 10"></path>'),
  due: ic('<path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v4.5h-4.5"></path>')
});
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


const unitHref = (unit, pick = '') => `/course?unit=${encodeURIComponent(unit.id)}&view=unit${pick ? `&pick=${encodeURIComponent(pick)}` : ''}`;
const courseHref = course => `/course?course=${encodeURIComponent(course.id)}`;
const bar = (value, max, label) => renderProgressBar({ value, max: max || 1, ariaLabel: label });
const progressRow = (label, text, value, max) => `<div class="cs-progress-row"><div class="cs-split"><span>${label}</span><span class="cs-muted">${text}</span></div>${bar(value, max, `${label} progress`)}</div>`;
const lessonsText = (t, esc) => esc(t.done ? `${t.done} of ${t.total} lessons` : plural(t.total, 'lesson'));

function marker(m, a, index, next) {
  if (m.due.has(a.id)) return `<span class="cs-marker cs-marker--due" aria-hidden="true">${I.due}</span>`;
  if (m.completed.has(a.id)) return `<span class="cs-marker cs-marker--done" aria-hidden="true">${I.check}</span>`;
  return `<span class="cs-marker${next?.id === a.id ? ' cs-marker--current' : ''}" aria-hidden="true">${index}</span>`;
}
const statusWord = (m, a, next) => m.due.has(a.id) ? 'Review due' : m.completed.has(a.id) ? (a.type === 'mastery' && m.state?.mastery?.[a.id]?.passed === true ? 'Mastered' : 'Complete') : next?.id === a.id ? 'Start' : '';

/** A Checkpoint, Capstone or older-practice row: opens its activity directly. */
function activityRow(m, esc, activityHref, a, { title, caption = '', next, icon = I.flag, className = '' }) {
  const done = m.completed.has(a.id);
  const word = statusWord(m, a, next);
  const state = m.due.has(a.id) ? 'due' : done ? 'done' : next?.id === a.id ? 'next' : 'open';
  return `<li class="path-row ${className}" data-state="${state}"><a class="cs-unit__link" href="${esc(activityHref(a.id))}" data-activity-link="${esc(a.id)}"><span class="cs-marker${done ? ' cs-marker--done' : ''}" aria-hidden="true">${done ? I.check : icon}</span><span class="cs-unit__lesson">${caption ? `<span class="path-row-eyebrow">${esc(caption)}</span>` : ''}${esc(title)}</span><span class="path-row-status">${esc(word)}</span></a></li>`;
}

function lessonRow(m, esc, a, i, unit, next, selectedId) {
  const lesson = m.lessons.get(a.sourceId);
  const title = lesson?.title || a.title;
  const isNext = next?.id === a.id;
  const word = statusWord(m, a, next);
  const state = m.due.has(a.id) ? 'due' : m.completed.has(a.id) ? 'done' : isNext ? 'next' : 'open';
  const selected = selectedId === a.id;
  const pill = isNext ? '<span class="cs-button cs-button--small" role="presentation">Start</span>' : (word ? `<span class="path-row-status">${esc(word)}</span>` : '');
  return `<li class="path-row${isNext ? ' is-current' : ''}" data-state="${state}">
    <a class="cs-unit__link path-desktop-only${selected ? ' is-selected' : ''}" href="${esc(unitHref(unit, a.id))}" data-activity-link="${esc(a.id)}"${selected ? ' aria-current="true"' : ''}>${marker(m, a, i + 1, next)}<span class="cs-unit__lesson">${esc(title)}</span>${pill}</a>
    <button type="button" class="cs-unit__link path-phone-only" aria-expanded="false" data-lesson-toggle="${esc(a.id)}">${marker(m, a, i + 1, next)}<span class="cs-unit__lesson">${esc(title)}</span>${isNext ? '<span class="cs-button cs-button--small path-pill" role="presentation">Start lesson</span>' : I.down}</button>
    <div class="cs-lessonopen path-phone-only" data-lesson-open="${esc(a.id)}" hidden><p>${esc(lesson?.objective || '')}</p><a class="cs-button cs-button--small" href="${esc(m.hrefOf(a.id))}">${m.completed.has(a.id) ? 'Open lesson' : isNext ? 'Start lesson' : 'Open lesson'}</a></div>
  </li>`;
}

function lessonList(m, esc, activityHref, unit, { selectedId = '', open = true } = {}) {
  const p = m.partsOf(unit);
  const next = m.nextIn(unit);
  const lessonDone = m.lessonCount(p.lessons).done === p.lessons.length;
  const rows = p.lessons.map((a, i) => lessonRow(m, esc, a, i, unit, next, selectedId));
  if (p.checkpoint) {
    const cp = p.checkpoint;
    const done = m.completed.has(cp.id);
    const word = done ? (m.state?.mastery?.[cp.id]?.passed === true ? 'Mastered' : 'Complete') : lessonDone ? 'Start' : 'After the lessons';
    rows.push(`<li class="path-row path-row--checkpoint" data-state="${done ? 'done' : next?.id === cp.id ? 'next' : 'open'}"><a class="cs-unit__link" href="${esc(activityHref(cp.id))}" data-activity-link="${esc(cp.id)}"><span class="cs-marker${done ? ' cs-marker--done' : ''}" aria-hidden="true">${done ? I.check : I.flag}</span><span class="cs-unit__lesson">${esc(LABELS.unitCheck)} · ${esc(unit.title)}</span><span class="cs-caption">${esc(word)}</span></a></li>`);
  }
  if (p.capstone) rows.push(activityRow(m, esc, activityHref, p.capstone, { title: p.capstone.title, next }));
  const practice = p.practice.length
    ? `<details class="cs-acc path-practice"><summary><span class="cs-grow">More practice</span><span class="cs-count">${p.practice.length}</span>${I.down}</summary><ol class="cs-unit__lessons">${p.practice.map(a => activityRow(m, esc, activityHref, a, { title: a.title, icon: '•' })).join('')}</ol></details>`
    : '';
  return `<ol class="cs-unit__lessons path-rows" aria-label="${esc(unit.title)} lessons">${rows.join('')}</ol>${practice}`;
}

const unitStatusClass = kind => kind === 'complete' ? ' cs-unit__status--done' : kind === 'progress' || kind === 'due' ? ' cs-unit__status--active' : '';
const coverItems = unit => String(unit.scope || '').split(/;\s*/).map(x => x.trim()).filter(Boolean);
const goalsCard = (title, items, esc) => `<section class="cs-card cs-panel"><span class="cs-caption cs-caption--label">${esc(title)}</span><ul class="cs-goals">${items.map(g => `<li>${I.check}<span>${esc(g)}</span></li>`).join('')}</ul></section>`;

function unitCard(m, esc, activityHref, unit, open) {
  const status = unitStatus(m, unit);
  const cover = coverItems(unit);
  return `<details class="cs-card cs-unit${open ? ' is-open' : ''}" data-path-unit="${esc(unit.id)}"${open ? ' open' : ''}>
    <summary class="cs-unit__head"><span class="cs-unit__title">${esc(unit.title)}</span><span class="cs-unit__status${unitStatusClass(status.kind)}" data-kind="${status.kind}">${esc(status.text)}</span><span class="cs-unit__chev" aria-hidden="true">${I.down}</span></summary>
    <div class="path-phone-only path-gain">${cover.length ? `<details class="cs-acc cs-acc--depth cs-gain"><summary><span class="cs-grow">What it covers</span>${I.down}</summary><div class="cs-acc__body"><ul class="cs-goals">${cover.map(g => `<li>${I.check}<span>${esc(g)}</span></li>`).join('')}</ul></div></details>` : ''}</div>
    ${lessonList(m, esc, activityHref, unit)}
  </details>`;
}

export async function mount(container, ctx) {
  if (ctx.isCurrent?.() === false) return;
  const { data, state, params, esc, navigate, activityHref } = ctx; // activityHref takes an activity id
  const m = buildModel(data, state);
  m.hrefOf = activityHref;
  const courses = data.courses || [];
  if (!courses.length) { container.innerHTML = '<p class="notice">The Learning Path is not available yet.</p>'; return; }

  const requestedUnit = m.units.get(data.legacyUnitAliases?.[params.get('unit')] || params.get('unit'));
  const requestedCourseId = data.legacyCourseAliases?.[params.get('course')] || params.get('course');
  const current = courses.find(c => m.unitsOf(c).some(u => m.nextIn(u))) || courses[0];
  const course = courses.find(c => c.id === (requestedUnit?.courseId || requestedCourseId)) || current;
  const courseUnits = m.unitsOf(course);
  let selected = requestedUnit && requestedUnit.courseId === course.id ? requestedUnit : courseUnits.find(u => m.nextIn(u)) || courseUnits[0];

  const view = params.get('view') === 'capstones' ? 'capstones' : (params.get('view') === 'unit' && requestedUnit ? 'unit' : 'module');
  const lessonTotals = c => m.lessonCount(m.unitsOf(c).flatMap(u => m.partsOf(u).lessons));
  const pathTotals = m.lessonCount(courses.flatMap(c => m.unitsOf(c).flatMap(u => m.partsOf(u).lessons)));
  const moduleTotals = lessonTotals(course);
  const capstones = (data.activities || []).filter(a => a.masteryType === 'course-capstone');
  const overallNext = courses.map(c => courseUnitsNext(c)).find(Boolean) || null;
  function courseUnitsNext(c) { return m.unitsOf(c).map(u => m.nextIn(u)).find(Boolean) || null; }

  const kickerFor = c => { const t = lessonTotals(c); return c.id === current.id && t.done < t.total ? 'Current' : t.total && t.done === t.total ? 'Complete' : t.done ? 'In progress' : 'Not started'; };

  // ---- Left pane ----
  const moduleRail = capstonesCurrent => `<nav class="cs-card cs-rail path-rail" aria-label="${esc(LABELS.learningPath)}" id="path-modules"><span class="cs-rail__label">${esc(LABELS.learningPath)}</span>
    ${courses.map(c => { const t = lessonTotals(c); const cur = !capstonesCurrent && c.id === course.id; return `<a class="cs-module${cur ? ' is-current' : ''}" href="${esc(courseHref(c))}"${cur ? ' aria-current="page"' : ''}><span class="cs-module__title">${esc(c.title)}</span><span class="cs-caption">${t.done ? esc(`${t.done} of ${t.total} lessons`) : esc(c.id === current.id ? plural(t.total, 'lesson') : 'Not started')}</span>${t.done || cur ? bar(t.done, t.total, `${c.title} progress`) : ''}</a>`; }).join('')}
    <span class="cs-rail__section">Across the path</span>
    <a class="cs-rail__item${capstonesCurrent ? ' is-current' : ''}" href="/course?view=capstones" id="path-capstones-link"${capstonesCurrent ? ' aria-current="page"' : ''}>${I.shield}<span class="cs-grow">Capstones</span><span class="cs-count">${capstones.length}</span></a>
    <span class="cs-rail__section">Progress</span><div class="cs-rail__progress">${progressRow(esc(course.shortTitle || course.title), lessonsText(moduleTotals, esc), moduleTotals.done, moduleTotals.total)}${progressRow(esc(LABELS.learningPath), `${pathTotals.done} of ${pathTotals.total}`, pathTotals.done, pathTotals.total)}</div></nav>`;

  const unitRail = unit => { const t = m.lessonCount(m.partsOf(unit).lessons); return `<nav class="cs-card cs-rail path-rail" aria-label="${esc(course.title)}" id="path-modules"><a class="cs-backlink" href="${esc(courseHref(course))}">${I.left}<span>${esc(course.title)}</span></a><span class="cs-rail__label">In this module</span>
    ${courseUnits.map(u => { const st = unitStatus(m, u); const tt = m.lessonCount(m.partsOf(u).lessons); const cur = u.id === unit.id; return `<a class="cs-module${cur ? ' is-current' : ''}" href="${esc(unitHref(u))}"${cur ? ' aria-current="page"' : ''}><span class="cs-module__title">${esc(u.title)}</span><span class="cs-caption">${esc(st.text)}</span>${bar(tt.done, tt.total, `${u.title} progress`)}</a>`; }).join('')}
    <span class="cs-rail__section">Progress</span><div class="cs-rail__progress">${progressRow(esc(unit.title), lessonsText(t, esc), t.done, t.total)}${progressRow(esc(course.shortTitle || course.title), lessonsText(moduleTotals, esc), moduleTotals.done, moduleTotals.total)}${progressRow(esc(LABELS.learningPath), `${pathTotals.done} of ${pathTotals.total}`, pathTotals.done, pathTotals.total)}</div></nav>`; };

  // ---- Right pane ----
  const orientation = '<a class="path-orientation" href="/course?unit=unit.orientation&lesson=orientation">New here? Start with the orientation</a>';
  const upNextCard = scopeUnit => {
    const next = (scopeUnit && m.nextIn(scopeUnit)) || courseUnitsNext(course) || overallNext;
    if (!next) return `<section class="cs-card cs-panel cs-upnext"><span class="cs-caption cs-caption--label">Up next</span><span class="cs-upnext__title">You are all caught up</span><p class="path-up-meta">Every lesson here is complete.</p><a class="cs-button cs-button--block" href="/practice">Review &amp; Practice</a>${orientation}</section>`;
    const nextUnit = m.units.get(next.unitId);
    const title = next.masteryType === 'unit-mastery' ? `${LABELS.unitCheck} · ${nextUnit.title}` : (m.lessons.get(next.sourceId)?.title || next.title);
    return `<section class="cs-card cs-panel cs-upnext" data-path-up-next><span class="cs-caption cs-caption--label">Up next</span><span class="cs-kicker cs-kicker--small">${esc(nextUnit?.title || '')}</span><span class="cs-upnext__title">${esc(title)}</span><a class="cs-button cs-button--block" href="${esc(activityHref(next.id))}" data-path-start>${next.type === 'lesson' ? 'Start lesson' : `Start ${esc(LABELS.unitCheck)}`}</a>${orientation}</section>`;
  };
  const lessonPane = (unit, pickedId) => {
    const p = m.partsOf(unit);
    const next = m.nextIn(unit);
    const picked = p.lessons.find(a => a.id === pickedId) || null;
    const checkpoint = p.checkpoint && p.checkpoint.id === pickedId ? p.checkpoint : null;
    if (picked) {
      const lesson = m.lessons.get(picked.sourceId);
      const n = p.lessons.indexOf(picked) + 1;
      const label = m.completed.has(picked.id) ? 'Open lesson' : next?.id === picked.id ? 'Start lesson' : 'Open lesson';
      return `<aside class="cs-stack" aria-label="Selected lesson"><section class="cs-card cs-panel cs-lessonpane" data-path-lesson-pane><span class="cs-caption cs-caption--label">${esc(LABELS.lesson)} ${n} of ${p.lessons.length}</span><h2 class="cs-panel__title">${esc(lesson?.title || picked.title)}</h2>${lesson?.reading ? `<p>Reading: ${esc(lesson.reading)}</p>` : ''}<span class="cs-caption cs-caption--label">By the end you will</span><p class="cs-objective">${esc(lesson?.objective || '')}</p><a class="cs-button cs-button--block" href="${esc(activityHref(picked.id))}" data-path-start>${label}</a></section>${coverItems(unit).length ? goalsCard('What it covers', coverItems(unit), esc) : ''}</aside>`;
    }
    if (checkpoint) return `<aside class="cs-stack" aria-label="Selected lesson"><section class="cs-card cs-panel cs-lessonpane" data-path-lesson-pane><span class="cs-caption cs-caption--label">${esc(LABELS.unitCheck)}</span><h2 class="cs-panel__title">${esc(checkpoint.title)}</h2><p>Check what you have learned in this part of the path.</p><a class="cs-button cs-button--block" href="${esc(activityHref(checkpoint.id))}" data-path-start>Start ${esc(LABELS.unitCheck)}</a></section></aside>`;
    return `<aside class="cs-stack" aria-label="Selected lesson">${upNextCard(unit)}${coverItems(unit).length ? goalsCard('What it covers', coverItems(unit), esc) : ''}</aside>`;
  };

  // ---- Centre ----
  let html;
  let cols = 'cs-cols--path';
  if (view === 'unit') {
    const unit = requestedUnit;
    const p = m.partsOf(unit);
    const pickId = params.get('pick') || '';
    const next = m.nextIn(unit);
    const pickedId = [...p.lessons, p.checkpoint].filter(Boolean).some(a => a.id === pickId) ? pickId : (p.lessons.find(a => a.id === next?.id) || p.lessons[0] || {}).id || '';
    const status = unitStatus(m, unit);
    const t = m.lessonCount(p.lessons);
    html = `${unitRail(unit)}<section class="cs-column" aria-label="${esc(unit.title)}" data-learning-path data-path-view="unit">
      <a class="cs-backlink path-phone-only" href="${esc(courseHref(course))}">${I.left}<span>${esc(course.title)}</span></a>
      <div class="cs-heading"><span class="cs-kicker">${esc(course.title)}</span><h1 id="path-title">${esc(unit.title)}</h1><span class="cs-sub">${esc(status.text)}</span></div>
      <p class="cs-lede">${esc(unit.scope || '')}</p>${bar(t.done, t.total, `${unit.title} progress`)}
      <section class="cs-card cs-unit is-open"><div class="cs-unit__head"><span class="cs-unit__title">${esc(unit.title)}</span><span class="cs-unit__status${unitStatusClass(status.kind)}">${esc(status.text)}</span></div>${lessonList(m, esc, activityHref, unit, { selectedId: pickedId })}</section>
    </section>${lessonPane(unit, pickedId)}`;
  } else if (view === 'capstones') {
    html = `${moduleRail(true)}<section class="cs-column" aria-label="Capstones" data-learning-path data-path-view="capstones" id="path-capstones">
      <div class="cs-heading"><span class="cs-kicker">Across the path</span><h1 id="path-title">Capstones</h1><span class="cs-sub">${plural(capstones.length, 'capstone')}</span></div>
      <p class="cs-lede">A Capstone closes each module: it asks you to use everything the module taught.</p>
      <section class="cs-card cs-unit is-open"><ol class="cs-unit__lessons path-rows" aria-label="Capstones">${capstones.map(a => { const u = m.units.get(a.unitId); return activityRow(m, esc, activityHref, a, { title: a.title, caption: u ? `After ${u.title}` : '', next: null }); }).join('')}</ol></section>
    </section><aside class="cs-stack" aria-label="Up next">${upNextCard(null)}</aside>`;
  } else {
    const kicker = kickerFor(course);
    html = `${moduleRail(false)}<section class="cs-column" aria-label="${esc(course.title)}" data-learning-path data-path-view="module">
      <label class="cs-modpick path-phone-only"><span class="cs-modpick__text"><span class="cs-kicker cs-kicker--small">${esc(kicker)}</span><span class="cs-modpick__title">${esc(course.title)}</span></span>${I.down}<select aria-label="Choose a section of the Learning Path" data-path-picker>${courses.map(c => `<option value="${esc(c.id)}"${c.id === course.id ? ' selected' : ''}>${esc(c.title)}</option>`).join('')}</select></label>
      <div class="cs-heading path-heading"><span class="cs-kicker">${esc(kicker)}</span><h1 id="path-title">${esc(course.title)}</h1><span class="cs-sub">${plural(moduleTotals.total, 'lesson')} · ${moduleTotals.done ? `${moduleTotals.done} done` : 'not started'}</span></div>
      <div class="cs-split path-phone-only"><span class="cs-caption">${plural(moduleTotals.total, 'lesson')}</span><span class="cs-caption">${moduleTotals.done ? `${moduleTotals.done} of ${moduleTotals.total} lessons` : 'Not started'}</span></div>
      <p class="cs-lede path-desktop-only">${esc(course.outcome || course.scope || '')}</p>${bar(moduleTotals.done, moduleTotals.total, `${course.title} progress`)}
      <div class="path-units" data-path-units>${courseUnits.map(u => unitCard(m, esc, activityHref, u, u.id === selected?.id)).join('')}</div>
      <a class="cs-card cs-modcard cs-modcard--plain path-phone-only" href="/course?view=capstones">${I.shield}<span class="cs-grow">Capstones across the path</span><span class="cs-count">${capstones.length}</span></a>
    </section><aside class="cs-stack path-aside" aria-label="Next and objectives" data-path-aside>${upNextCard(selected)}${goalsCard('What you’ll gain', [course.outcome || course.scope || ''].filter(Boolean), esc)}</aside>`;
  }

  const main = document.querySelector('main#main');
  const restoreFrame = setFrameVariant('well');
  main?.classList.add(cols);
  container.innerHTML = html;
  const root = container.querySelector('[data-learning-path]') || container;
  mountProgressBars(container);

  const onToggle = event => {
    const detail = event.target;
    if (!detail.matches?.('[data-path-unit]')) return;
    detail.classList.toggle('is-open', detail.open);
    if (!detail.open) return;
    root.querySelectorAll('[data-path-unit]').forEach(other => { if (other !== detail) { other.open = false; other.classList.remove('is-open'); } });
    if (selected?.id !== detail.dataset.pathUnit) {
      selected = m.units.get(detail.dataset.pathUnit);
      const address = new URL(location.href);
      address.searchParams.set('unit', selected.id);
      address.searchParams.delete('course');
      history.replaceState(history.state, '', address);
      const aside = container.querySelector('[data-path-aside]');
      if (aside) { aside.innerHTML = `${upNextCard(selected)}${goalsCard('What you’ll gain', [course.outcome || course.scope || ''].filter(Boolean), esc)}`; mountProgressBars(aside); }
    }
  };
  const onPick = event => { if (event.target.matches('[data-path-picker]')) navigate(`/course?course=${encodeURIComponent(event.target.value)}`); };
  const onClick = event => {
    const toggle = event.target.closest('[data-lesson-toggle]');
    if (!toggle) return;
    const panel = container.querySelector(`[data-lesson-open="${CSS.escape(toggle.dataset.lessonToggle)}"]`);
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.closest('li')?.classList.toggle('has-open', open);
    if (panel) panel.hidden = !open;
  };
  container.addEventListener('toggle', onToggle, true);
  container.addEventListener('change', onPick);
  container.addEventListener('click', onClick);
  return () => {
    container.removeEventListener('toggle', onToggle, true);
    container.removeEventListener('change', onPick);
    container.removeEventListener('click', onClick);
    main?.classList.remove(cols);
    restoreFrame();
  };
}
