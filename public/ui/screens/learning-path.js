import { activityFor, lessonFor } from '../../learning.js';
import { progressSummary } from '../../progress-experience.js';
import { renderPanel, renderProgressScope, renderRail } from '../components/index.js';

// Browsing shares one surface; doing and the glossary retain their own dispatch.
export const handles = params => params.get('unit') !== 'unit.orientation' && !['lesson', 'mastery', 'glossary'].some(key => params.has(key));

export function mount(container, ctx) {
  if (ctx.isCurrent?.() === false) return;
  const { data, state, params, esc, activityHref, navigate } = ctx;
  const completed = new Set(state.completed || []);
  const due = new Set(Object.entries(state.reviewSchedule || {}).filter(([, item]) => Date.parse(item?.dueAt) <= Date.now()).map(([id]) => id));
  const progress = progressSummary(data, state);
  const courses = data.courses || [];
  const units = data.units || [];
  const activities = unit => (data.byUnit?.[unit.id] || []).map(id => activityFor(data, id)).filter(Boolean);
  const courseUnits = course => (data.byCourse?.[course.id] || []).map(id => units.find(unit => unit.id === id)).filter(Boolean);
  const requestedUnit = params.get('unit');
  const unitId = units.some(unit => unit.id === requestedUnit) ? requestedUnit : data.legacyUnitAliases?.[requestedUnit];
  const requestedCourse = params.get('course');
  const courseId = courses.some(course => course.id === requestedCourse) ? requestedCourse : data.legacyCourseAliases?.[requestedCourse];
  const explicitUnit = units.find(unit => unit.id === unitId);
  const course = courses.find(item => item.id === explicitUnit?.courseId) || courses.find(item => item.id === courseId)
    || courses.find(item => item.id === progress.next?.courseId) || courses[0];
  if (!course) { container.innerHTML = '<p class="notice">The Learning Path is not available yet.</p>'; return; }
  const groups = courseUnits(course);
  const courseActivities = groups.flatMap(activities);
  const next = courseActivities.find(item => !completed.has(item.id)) || courseActivities.find(item => due.has(item.id)) || courseActivities[0];
  const selectedUnit = groups.find(unit => unit.id === explicitUnit?.id) || groups.find(unit => unit.id === next?.unitId) || groups[0];
  const stats = items => ({ done: items.filter(item => completed.has(item.id)).length, total: items.length });
  const count = ({ done, total }) => `${done} of ${total} scored activities`;
  const status = items => {
    const value = stats(items), reviews = items.filter(item => due.has(item.id)).length;
    return `${value.total && value.done === value.total ? 'Complete' : value.done ? 'In progress' : 'Not started'}${reviews ? ` · ${reviews} review${reviews === 1 ? '' : 's'} due` : ''}`;
  };
  const title = item => item.type === 'lesson' ? (lessonFor(data, item.sourceId)?.title || item.title) : `Checkpoint · ${units.find(unit => unit.id === item.unitId)?.title || item.title} · ${item.title}`;
  const scope = (label, items, kind) => {
    const value = stats(items);
    return renderProgressScope({ scope: kind, label, status: count(value), value: value.done, max: value.total || 1 });
  };
  const rail = renderRail({ title: `Learning Path`, ariaLabel: 'Learning Path curricula', id: 'learning-path-modules', items: courses.map(item => ({
    href: `/course?course=${encodeURIComponent(item.id)}`, label: item.title, isActive: item.id === course.id
  })) });
  const fallback = (requestedUnit && !explicitUnit) || (requestedCourse && !courses.some(item => item.id === courseId));
  const groupsHTML = groups.map(unit => {
    const items = activities(unit);
    return `<details class="learning-path-group" data-unit="${esc(unit.id)}" ${unit.id === selectedUnit?.id ? 'open' : ''}>
      <summary><span class="learning-path-group-title">${esc(unit.title)}</span><span class="learning-path-status">${esc(status(items))}</span></summary>
      ${unit.scope ? `<p class="learning-path-group-copy">${esc(unit.scope)}</p>` : ''}
      <ol aria-label="${esc(unit.title)} activities">${items.map((item, index) => `<li><a data-activity-link="${esc(item.id)}" href="${esc(activityHref(item.id))}"><span class="learning-path-number" aria-hidden="true">${index + 1}</span><span>${esc(title(item))}</span><span class="learning-path-activity-status">${completed.has(item.id) ? 'Complete' : 'Not started'}${due.has(item.id) ? ' · Review due' : ''}</span></a></li>`).join('')}</ol>
    </details>`;
  }).join('');
  const nextPanel = renderPanel({ title: next && completed.has(next.id) ? 'Review' : 'Up next', className: 'learning-path-next', body: next ? `<p class="learning-path-context">${esc(course.title)} · ${esc(units.find(unit => unit.id === next.unitId)?.title || '')}</p><h3>${esc(title(next))}</h3><a class="learning-path-primary" data-activity-link="${esc(next.id)}" href="${esc(activityHref(next.id))}">${completed.has(next.id) ? 'Review activity' : next.type === 'lesson' ? 'Start lesson' : 'Start Checkpoint'}</a>` : '<p>No activities are available in this curriculum yet.</p>' });
  const progressPanel = renderPanel({ title: 'Progress', body: `${selectedUnit ? scope(selectedUnit.title, activities(selectedUnit), 'unit') : ''}${scope(course.title, courseActivities, 'module')}${renderProgressScope({ scope: 'path', label: 'Learning Path', status: count(progress), value: progress.done, max: progress.total || 1 })}` });
  container.innerHTML = `<div class="learning-path-screen">${rail}<section class="learning-path-content" aria-labelledby="learning-path-title"><header><p class="learning-path-kicker">Learning Path</p><h1 id="learning-path-title">${esc(course.title)}</h1>${course.scope ? `<p class="learning-path-lede">${esc(course.scope)}</p>` : ''}${fallback ? '<p class="learning-path-fallback" role="status">That selection is unavailable. Browse the Learning Path below.</p>' : ''}</header><div class="learning-path-groups">${groupsHTML}</div></section><aside class="learning-path-aside" aria-label="Your learning">${nextPanel}${progressPanel}</aside></div>`;
  // The shell sanitizes inline style attributes in HTML strings. Set shared bar
  // widths through the DOM after mounting so visual and accessible values agree.
  container.querySelectorAll('.ui-progress-bar').forEach(bar => {
    const value = Number(bar.getAttribute('aria-valuenow'));
    const max = Number(bar.getAttribute('aria-valuemax')) || 1;
    bar.querySelector('.ui-progress-bar-fill').style.width = `${Math.min(100, Math.max(0, value / max * 100))}%`;
  });
  const onClick = event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || ctx.isCurrent?.() === false) return;
    const link = event.target.closest?.('a');
    if (!link || !container.contains(link) || !link.getAttribute('href')?.startsWith('/course')) return;
    event.preventDefault();
    navigate(link.getAttribute('href'));
  };
  container.addEventListener('click', onClick);
  return () => container.removeEventListener('click', onClick);
}




