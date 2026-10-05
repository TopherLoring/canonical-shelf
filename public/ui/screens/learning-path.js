// Phase 5: one view for modules, units, and their stable scored activities.
import { courseProgress, unitStats } from '../../course-experience.js';
import { renderRail, renderPanel, renderProgressScopeGroup } from '../components/index.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const moduleHref = id => `/course?course=${encodeURIComponent(id)}`;
const kind = activity => activity.type === 'lesson' ? 'Guided lesson' : activity.masteryType === 'course-capstone' ? 'Capstone' : activity.masteryType === 'unit-mastery' ? 'Checkpoint' : 'Integrated mastery';
const status = stats => stats.status === 'complete' ? 'Complete' : stats.status === 'in-progress' ? 'In progress' : 'Not started';

export function handles(params) {
  return params.has('lesson') || params.has('mastery') || (!params.has('glossary') && params.get('unit') !== 'unit.orientation');
}

export async function mount(container, ctx) {
  if (ctx.params.has('lesson') || ctx.params.has('mastery')) {
    const screen = await import('./lesson.js');
    if (ctx.isCurrent?.() === false) return;
    return screen.mount(container, ctx);
  }
  return mountPath(container, ctx);
}

function mountPath(container, ctx) {
  const { data, state, params, activityHref } = ctx;
  const courses = data.courses || [];
  const unitId = data.legacyUnitAliases?.[params.get('unit')] || params.get('unit');
  const requested = data.units.find(unit => unit.id === unitId);
  const courseId = data.legacyCourseAliases?.[params.get('course')] || params.get('course');
  const course = courses.find(item => item.id === (requested?.courseId || courseId)) || (!courseId && !unitId ? courses[0] : null);
  if (!course) { container.innerHTML = '<p class="notice">This module or unit could not be found. <a href="/path">Return to the Learning Path</a></p>'; return; }
  const stats = courseProgress(data, state, course);
  const activities = new Map(data.activities.map(activity => [activity.id, activity]));
  const completed = new Set(state.completed || []);
  const due = new Set(Object.entries(state.reviewSchedule || {}).filter(([, review]) => Date.parse(review?.dueAt) <= Date.now()).map(([id]) => id));
  let selectedUnit = requested || stats.units.find(unit => unitStats(data, state, unit).status !== 'complete') || stats.units[0];
  const template = document.getElementById('tpl-learning-path');
  container.replaceChildren(template.content.cloneNode(true));
  const root = container.querySelector('[data-learning-path]');
  root.querySelector('[data-path-position]').textContent = `Module ${courses.indexOf(course) + 1} of ${courses.length}`;
  root.querySelector('h1').textContent = course.title;
  root.querySelector('[data-path-scope]').textContent = `${stats.units.length} units · ${stats.ids.filter(id => activities.get(id)?.type === 'lesson').length} lessons`;
  root.querySelector('[data-path-modules]').innerHTML = renderRail({
    title: `Learning Path · ${courses.length} modules`, ariaLabel: 'Learning Path modules', id: 'path-modules',
    items: courses.map(item => { const progress = courseProgress(data, state, item), lessonIds = progress.ids.filter(id => activities.get(id)?.type === 'lesson'), done = lessonIds.filter(id => completed.has(id)).length; return { id: `path-module-${item.id}`, href: moduleHref(item.id), label: item.title, isActive: item.id === course.id, sublabel: `Module ${item.sequence} · ${progress.units.length} units`, description: `${done} of ${lessonIds.length} lessons`, progress: { value: done, max: lessonIds.length, ariaLabel: `${item.title}: ${done} of ${lessonIds.length} lessons` } }; })
  });
  const rail = root.querySelector('[data-path-modules] .ui-rail');
  const across = document.createElement('div');
  across.className = 'ui-rail-section';
  across.innerHTML = `<div class="ui-rail-divider">Across the path</div><a class="ui-rail-link" href="#path-capstones">Capstones</a><a class="ui-rail-link" href="/practice">Review &amp; Practice</a>`;
  rail.append(across);
  const picker = root.querySelector('[data-path-module-picker]');
  picker.innerHTML = courses.map(item => `<option value="${esc(item.id)}" ${item.id === course.id ? 'selected' : ''}>Module ${item.sequence} · ${esc(item.title)}</option>`).join('');
  root.querySelector('[data-path-units]').innerHTML = stats.units.map(unit => {
    const progress = unitStats(data, state, unit), ids = data.byUnit[unit.id] || [];
    const rows = ids.map((id, index) => {
      const activity = activities.get(id); if (!activity) return '';
      const done = completed.has(id), reviewDue = due.has(id), lesson = activity.type === 'lesson' ? data.lessons.find(item => item.id === activity.sourceId) : null;
      const rowStatus = reviewDue ? 'Review due' : activity.type === 'mastery' && state.mastery?.[id]?.passed === true ? 'Mastered' : done ? 'Complete' : 'Available';
      return `<li class="path-activity" data-review-due="${reviewDue}"><span class="path-activity-number" aria-label="${esc(rowStatus)}">${reviewDue ? '↻' : done ? '✓' : index + 1}</span><div class="path-activity-content"><a data-activity-link="${esc(id)}" href="${esc(activityHref(id))}">${esc(activity.title)}</a>${lesson?.objective ? `<details class="path-activity-about"><summary aria-label="About this lesson"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></svg></summary><span class="path-activity-kind">${kind(activity)}</span><p class="unit-lesson-objective">${esc(lesson.objective)}</p></details>` : `<span class="path-activity-kind">${kind(activity)}</span>`}</div><span class="path-activity-status">${rowStatus}</span></li>`;
    }).join('');
    return `<details class="path-unit" data-path-unit="${esc(unit.id)}" ${selectedUnit?.id === unit.id ? 'open' : ''}><summary><span class="path-unit-number">Unit ${unit.sequence}</span><span class="path-unit-title">${esc(unit.title)}</span><span data-unit-progress>${progress.done} of ${progress.total} · ${status(progress)}${progress.reviewDue ? ` · ${progress.reviewDue} review due` : ''}</span></summary><details class="path-unit-about"><summary>About this unit</summary><p class="path-unit-scope">${esc(unit.scope)}</p></details><ol aria-label="${esc(unit.title)} activities">${rows}</ol></details>`;
  }).join('');
  const capstones = data.activities.filter(activity => activity.masteryType === 'course-capstone');
  const capstoneList = document.createElement('details');
  capstoneList.id = 'path-capstones';
  capstoneList.className = 'path-unit path-capstones';
  capstoneList.innerHTML = `<summary><span class="path-unit-title">Capstones</span></summary><ol>${capstones.map(activity => `<li class="path-activity"><a data-activity-link="${esc(activity.id)}" href="${esc(activityHref(activity.id))}">${esc(activity.title)}</a></li>`).join('')}</ol>`;
  root.querySelector('[data-path-units]').after(capstoneList);
  across.querySelector('[href="#path-capstones"]').addEventListener('click', () => { capstoneList.open = true; });
  function renderProgress() {
    const unit = selectedUnit, unitProgress = unit ? unitStats(data, state, unit) : { done: 0, total: 0 };
    const next = unitProgress.next || stats.ids.map(id => activities.get(id)).find(activity => activity && !completed.has(activity.id)) || stats.ids.map(id => activities.get(id)).find(Boolean);
    const allIds = courses.flatMap(item => courseProgress(data, state, item).ids);
    const scopes = [
      { scope: 'unit', label: `Unit ${unit?.sequence || ''}`, value: unitProgress.done, max: unitProgress.total, status: `${unitProgress.done} of ${unitProgress.total} activities` },
      { scope: 'module', label: `Module ${course.sequence}`, value: stats.done, max: stats.total, status: `${stats.done} of ${stats.total} activities` },
      { scope: 'path', label: 'Learning Path', value: allIds.filter(id => completed.has(id)).length, max: allIds.length, status: `${allIds.filter(id => completed.has(id)).length} of ${allIds.length} activities` }
    ];
    const upNext = next ? renderPanel({ eyebrow: completed.has(next.id) ? 'Revisit' : 'Up next', title: next.title, body: `<p>Module ${course.sequence} · Unit ${data.units.find(item => item.id === next.unitId)?.sequence || ''}</p><a class="path-primary" data-activity-link="${esc(next.id)}" href="${esc(activityHref(next.id))}">${completed.has(next.id) ? 'Review' : state.attempts?.[next.id] ? 'Resume' : 'Start'} ${next.type === 'lesson' ? 'lesson' : kind(next).toLowerCase()}</a>` }) : '';
    root.querySelector('[data-path-progress]').innerHTML = `${upNext}${renderPanel({ title: 'Progress', body: renderProgressScopeGroup({ scopes }) })}<a class="path-orientation" href="/course?unit=unit.orientation&lesson=orientation">Revisit orientation</a><a href="${moduleHref(course.id)}&glossary=1">Module glossary</a>`;
  }
  renderProgress();
  const onToggle = event => {
    const detail = event.target;
    if (!detail.matches('[data-path-unit]') || !detail.open) return;
    const changedUnit = selectedUnit?.id !== detail.dataset.pathUnit;
    selectedUnit = stats.units.find(unit => unit.id === detail.dataset.pathUnit);
    if (changedUnit) {
      const address = new URL(location.href);
      address.searchParams.set('unit', selectedUnit.id);
      history.replaceState(history.state, '', address);
    }
    root.querySelectorAll('[data-path-unit]').forEach(other => { if (other !== detail) other.open = false; });
    renderProgress();
  };
  root.addEventListener('toggle', onToggle, true);
  picker.addEventListener('change', () => ctx.navigate(moduleHref(picker.value)));
  return () => root.removeEventListener('toggle', onToggle, true);
}
