// Phase 5: authored lesson steps and checkpoint forms use the same learner-state engine.
import { lessonFor, masteryFor, activityFor, lessonScenes, challengeForm, lessonApparatus, orientationSceneMarkup, orientationApparatus, continuationFor } from '../../learning.js';
import { ORIENTATION_LESSON, ORIENTATION_LESSON_ID, ORIENTATION_UNIT_ID } from '../../orientation.js';
import { renderMounts } from '../../study-notes.js';
import { renderLessonWindow, renderStepList, renderStepStrip, renderPanel, renderNotesPanel, renderEdgeTab } from '../components/index.js';
import { createLessonPagination } from '../components/lesson-pagination.js';
import { LABELS } from '../labels.js';
import { enhanceLearningVisuals } from '../../learning-visuals.js';

export const handles = params => params.has('lesson') || params.has('mastery');

export async function mount(container, ctx) {
  const { data, params, esc, corpus = '', navigate } = ctx;
  const orientation = params.get('lesson') === ORIENTATION_LESSON_ID;
  const masteryId = params.get('mastery');
  const lesson = orientation ? ORIENTATION_LESSON : lessonFor(data, params.get('lesson'));
  const mastery = masteryId ? masteryFor(data, masteryId) : null;
  if (!lesson && !mastery) { container.innerHTML = '<p class="notice">Lesson not found.</p>'; return; }
  const activityId = mastery ? `mastery:${masteryId}` : `lesson:${params.get('lesson')}`;
  const activity = activityFor(data, activityId);
  const unitId = orientation ? ORIENTATION_UNIT_ID : activity?.unitId || lesson?.unitId || lesson?.v6Unit;
  const unit = data.units?.find(u => u.id === unitId);
  const course = data.courses?.find(c => c.id === unit?.courseId);
  const title = (mastery || lesson).title;
  const lessonNumber = Math.max(1, (data.byUnit?.[unitId] || []).filter(id => id.startsWith('lesson:')).indexOf(activityId) + 1);
  const activityLabel = mastery ? activity?.masteryType === 'course-capstone' ? LABELS.capstone : LABELS.unitCheck : `${LABELS.lesson} ${lessonNumber}`;
  const scenes = orientation ? ORIENTATION_LESSON.scenes.map(s => ({ ...s, html: orientationSceneMarkup(s, esc) })) : mastery ? [{ title, role: 'Checkpoint', html: `${(mastery.body || []).map(p => `<p class="scene-prose">${esc(p)}</p>`).join('')}${mastery.dek ? `<p>${esc(mastery.dek)}</p>` : ''}${mastery.plain ? `<aside class="scene-callout"><p>${esc(mastery.plain)}</p></aside>` : ''}${challengeForm(mastery.challenge, activityId, 0, esc)}` }] : lessonScenes(lesson, corpus, esc);
  const requestedScene = Number(params.get('scene'));
  const sceneIndex = Number.isInteger(requestedScene) && requestedScene > 0 ? Math.min(scenes.length - 1, requestedScene - 1) : 0;
  const scene = scenes[sceneIndex];
  const base = `/course?unit=${encodeURIComponent(unitId || '')}&${mastery ? 'mastery' : 'lesson'}=${encodeURIComponent(masteryId || params.get('lesson'))}`;
  const stepHref = index => `${base}&scene=${index + 1}`;
  const exit = orientation ? '/course' : `/course?unit=${encodeURIComponent(unitId || '')}`;
  const next = continuationFor(data, activityId);
  const steps = scenes.map((s, i) => ({ title: s.label || s.title, href: stepHref(i), isActive: i === sceneIndex, isComplete: false }));
  const apparatus = orientation ? orientationApparatus() : mastery ? '' : lessonApparatus(lesson, esc, scene);
  const hasChecks = scenes.some(s => s.html.includes('class="challenge'));
  const vocabCount = Array.isArray(lesson?.vocab) ? lesson.vocab.length : Object.keys(lesson?.vocab || {}).length;
  const questionCount = mastery ? 1 : lesson?.challenges?.length || 0;
  const toolIcon = path => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"></path></svg>`;
  const tools = `<nav class="lesson-tools" aria-label="Study tools for this step"><button type="button" data-lesson-tool="glossary" ${apparatus.includes('Glossary') ? '' : 'disabled'}>${toolIcon('M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z M5 17a3 3 0 0 1 3-3h11')}<span>Glossary</span><span class="lesson-tool-count">${vocabCount}</span></button><button type="button" data-lesson-tool="questions" ${hasChecks ? '' : 'disabled'}>${toolIcon('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.4 M12 17v.5')}<span>Questions</span><span class="lesson-tool-count">${questionCount}</span></button><button type="button" data-lesson-tool="deeper" ${apparatus ? '' : 'disabled'}>${toolIcon('M12 4v13 M6 11l6 6 6-6 M5 20h14')}<span>Go deeper</span></button></nav>`;
  const rail = `<aside class="lesson-step-rail">${renderStepList({ steps, currentStep: sceneIndex + 1 })}${tools}</aside>`;
  const primary = renderPanel({ className: 'lesson-primary-panel', body: `<header class="lesson-content-heading"><p>${esc(title)}</p><h1 id="study-scene-title">${esc(scene.title)}</h1></header><div class="lesson-phone-tools">${tools}</div><div class="lesson-primary-window"><div class="lesson-primary-content">${scene.html}</div></div>`, ariaLabel: scene.title });
  const body = `<div class="lesson-window-body">${renderStepStrip({ currentStep: sceneIndex + 1, totalSteps: scenes.length, stepTitle: scene.title })}${rail}${primary}</div>`;
  container.innerHTML = `<section class="lesson-screen" data-lesson-screen data-study-focus>${renderLessonWindow({ breadcrumbs: [{ label: LABELS.learningPath, href: '/course' }, ...(course ? [{ label: `${LABELS.module} ${course.sequence}: ${course.shortTitle || course.title}`, href: `/course?course=${encodeURIComponent(course.id)}` }] : []), { label: orientation ? 'Orientation' : `${LABELS.unit} ${unit?.sequence || ''}${unit?.title ? `: ${unit.title}` : ''}`, href: exit }], currentTitle: activityLabel, body, canGoBack: sceneIndex > 0, onCloseHref: exit })}<aside class="lesson-study-panel">${renderPanel({ title: 'For this step', body: apparatus, className: 'lesson-apparatus' })}</aside><aside class="lesson-notes-drawer ui-panel ui-panel--raised" id="lesson-notes-drawer" hidden aria-label="${LABELS.myNotes}"><button type="button" data-lesson-notes-close aria-label="Close My Notes">Close</button>${renderNotesPanel({ target: title, id: 'lesson-notes' })}</aside>${renderEdgeTab({ type: 'notes', targetId: 'lesson-notes-drawer', id: 'lesson-notes-tab' })}<aside class="lesson-rotate-hint ui-panel ui-panel--raised" hidden><span>For more room, try rotating your tablet.</span><button type="button" data-dismiss-rotate aria-label="Dismiss rotation suggestion">Dismiss</button></aside></section>`;
  // Notes retain the existing autosave and canonical activity anchor.
  container.querySelector('.lesson-apparatus [data-notes-mount]')?.closest('details')?.remove();
  container.querySelector('.ui-lesson-body').append(container.querySelector('.lesson-study-panel'));
  const glossary = [...container.querySelectorAll('.lesson-apparatus .apparatus-module')].find(details => details.querySelector('summary')?.textContent.trim().startsWith('Glossary'));
  if (glossary) {
    glossary.open = true; glossary.classList.add('lesson-default-glossary');
    container.querySelector('.lesson-apparatus .ui-panel-body').prepend(glossary);
    container.querySelector('.lesson-apparatus .ui-panel-title').textContent = 'Terms in this step';
    const glossaryEyebrow = document.createElement('span'); glossaryEyebrow.className = 'ui-panel-eyebrow'; glossaryEyebrow.textContent = 'Glossary';
    container.querySelector('.lesson-apparatus .ui-panel-header-content').prepend(glossaryEyebrow);
  }
  const notesAffordance = document.createElement('button'); notesAffordance.type = 'button'; notesAffordance.className = 'lesson-notes-affordance ui-panel ui-panel--raised'; notesAffordance.dataset.lessonNotesOpen = ''; notesAffordance.setAttribute('aria-controls', 'lesson-notes-drawer'); notesAffordance.setAttribute('aria-expanded', 'false'); notesAffordance.innerHTML = `${toolIcon('M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z')}<span>${LABELS.myNotes}</span><span class="lesson-notes-affordance-action">Add a note</span>`;
  container.querySelector('.lesson-study-panel').prepend(notesAffordance);
  const stepList = container.querySelector('.lesson-step-rail .ui-step-list');
  const toolHeading = document.createElement('p'); toolHeading.className = 'lesson-tools-heading'; toolHeading.textContent = 'For this step'; stepList.append(toolHeading, container.querySelector('.lesson-step-rail > .lesson-tools'));
  const notesPanel = container.querySelector('#lesson-notes');
  const closeLesson = container.querySelector('.ui-lesson-close-btn');
  closeLesson.dataset.exitLesson = '';
  closeLesson.dataset.fallback = exit;
  notesPanel.querySelectorAll('.ui-notes-textarea,.ui-notes-actions,label').forEach(n => n.remove());
  const notesMount = document.createElement('div'); notesMount.dataset.notesMount = ''; notesPanel.append(notesMount);
  const studyClose = document.createElement('button'); studyClose.type = 'button'; studyClose.dataset.lessonStudyClose = ''; studyClose.textContent = 'Close study tools'; container.querySelector('.lesson-study-panel').prepend(studyClose);
  const crumbs = container.querySelector('.ui-lesson-breadcrumb');
  crumbs.querySelector('a').textContent = LABELS.learningPath;
  const unitCrumb = [...crumbs.querySelectorAll('a')].at(-1);
  const fullUnitLabel = unitCrumb.textContent;
  unitCrumb.replaceChildren();
  const fullUnit = document.createElement('span'); fullUnit.className = 'lesson-breadcrumb-full'; fullUnit.textContent = fullUnitLabel;
  const shortUnit = document.createElement('span'); shortUnit.className = 'lesson-breadcrumb-short'; shortUnit.textContent = orientation ? 'Orientation' : `${LABELS.unit} ${unit?.sequence || ''}`;
  unitCrumb.append(fullUnit, shortUnit); unitCrumb.nextElementSibling.classList.add('lesson-breadcrumb-unit-separator');
  const pathToggle = document.createElement('button'); pathToggle.type = 'button'; pathToggle.className = 'lesson-path-toggle'; pathToggle.textContent = 'Full path'; pathToggle.setAttribute('aria-expanded', 'false'); pathToggle.setAttribute('aria-label', `Show full path: ${LABELS.learningPath}, ${course ? `${LABELS.module} ${course.sequence}: ${course.shortTitle || course.title}, ` : ''}${fullUnitLabel}, ${activityLabel}`); crumbs.before(pathToggle);
  const viewport = container.querySelector('.lesson-primary-window');
  const content = container.querySelector('.lesson-primary-content');
  // The navigation belongs to the content card, leaving the desktop step rail independent.
  container.querySelector('.lesson-primary-panel').append(container.querySelector('.ui-lesson-footer'));
  enhanceLearningVisuals(content);
  const back = container.querySelector('.ui-lesson-back-btn');
  const forward = container.querySelector('.ui-lesson-continue-btn');
  const status = document.createElement('span'); status.className = 'lesson-part-status'; status.setAttribute('role', 'status');
  forward.before(status);
  const pagination = createLessonPagination({ viewport, content, onChange(state) {
    const pacing = `Step ${sceneIndex + 1} of ${scenes.length} · part ${state.part} of ${state.parts}`;
    status.textContent = pacing;
    container.querySelector('.ui-step-strip-step').textContent = pacing;
    container.querySelector('.ui-step-strip-button').setAttribute('aria-label', `${pacing}: ${scene.title}. All steps`);
    back.disabled = !state.hasPrevious && sceneIndex === 0;
    forward.textContent = state.hasNext || sceneIndex < scenes.length - 1 ? 'Continue' : next ? 'Next activity' : 'Return to unit';
  } });
  const notesDrawer = container.querySelector('.lesson-notes-drawer');
  const notesTab = container.querySelector('[data-edge-tab="notes"]');
  let notesLoaded;
  function toggleNotes(open) {
    notesDrawer.hidden = !open; notesTab.classList.toggle('is-hidden', open); notesTab.setAttribute('aria-expanded', String(open));
    notesAffordance.setAttribute('aria-expanded', String(open));
    if (open) { notesLoaded ||= renderMounts(); notesLoaded.then(() => { if (ctx.isCurrent?.() !== false && !notesDrawer.hidden) notesMount.querySelector('textarea')?.focus(); }); }
    else notesTab.focus();
  }
  function click(event) {
    if (event.target.closest('.lesson-path-toggle')) { const open = pathToggle.getAttribute('aria-expanded') !== 'true'; pathToggle.setAttribute('aria-expanded', String(open)); crumbs.classList.toggle('is-expanded', open); }
    if (event.target.closest('[data-lesson-study-close]')) container.querySelector('.lesson-study-panel').classList.remove('is-open');
    if (event.target.closest('.ui-lesson-back-btn')) { if (pagination.state.hasPrevious) pagination.previous(); else navigate(stepHref(sceneIndex - 1)); }
    if (event.target.closest('.ui-lesson-continue-btn')) { if (pagination.state.hasNext) pagination.next(); else navigate(sceneIndex < scenes.length - 1 ? stepHref(sceneIndex + 1) : next?.href || exit); }
    const strip = event.target.closest('.ui-step-strip-button');
    if (strip) { const open = strip.getAttribute('aria-expanded') !== 'true'; strip.setAttribute('aria-expanded', String(open)); container.querySelector('.lesson-step-rail').classList.toggle('is-open', open); }
    if (event.target.closest('[data-edge-tab="notes"],[data-lesson-notes-open]')) toggleNotes(true);
    if (event.target.closest('[data-lesson-notes-close]')) toggleNotes(false);
    if (event.target.closest('[data-dismiss-rotate]')) { try { sessionStorage.setItem('lesson-rotate-dismissed', '1'); } catch {} container.querySelector('.lesson-rotate-hint').hidden = true; }
    const tool = event.target.closest('[data-lesson-tool]');
    if (tool) {
      if (tool.dataset.lessonTool === 'questions') { const index = scenes.findIndex(s => s.html.includes('class="challenge')); if (index >= 0) navigate(stepHref(index)); }
      else { const panel = container.querySelector('.lesson-study-panel'); panel.classList.toggle('is-open'); const details = [...panel.querySelectorAll('details')].find(d => d.textContent.includes(tool.dataset.lessonTool === 'glossary' ? 'Glossary' : 'Go deeper')); if (details) details.open = true; }
    }
  }
  function escape(event) {
    if (event.key !== 'Escape') return;
    if (!notesDrawer.hidden) toggleNotes(false);
    container.querySelector('.lesson-study-panel').classList.remove('is-open');
    container.querySelector('.lesson-step-rail').classList.remove('is-open');
    container.querySelector('.ui-step-strip-button').setAttribute('aria-expanded', 'false');
    crumbs.classList.remove('is-expanded'); pathToggle.setAttribute('aria-expanded', 'false');
  }
  container.addEventListener('click', click); container.addEventListener('keydown', escape);
  // Assessment feedback and sequence order are updated by the app's delegated handlers.
  // Observe only those bounded dynamic regions, avoiding pagination's own hidden flags.
  const dynamicRegions = [...container.querySelectorAll('.feedback,[data-sequence-board]')];
  const observeDynamic = () => dynamicRegions.forEach(n => dynamicObserver.observe(n, { childList: true, subtree: true, characterData: true }));
  const dynamicObserver = new MutationObserver(() => { dynamicObserver.disconnect(); pagination.reflow(); observeDynamic(); });
  observeDynamic();
  function rotationHint() { let dismissed = false; try { dismissed = sessionStorage.getItem('lesson-rotate-dismissed') === '1'; } catch {} container.querySelector('.lesson-rotate-hint').hidden = dismissed || !matchMedia('(min-width: 641px) and (max-width: 1099px) and (orientation: portrait)').matches; }
  rotationHint(); window.addEventListener('resize', rotationHint);
  return () => { dynamicObserver.disconnect(); pagination.destroy(); container.removeEventListener('click', click); container.removeEventListener('keydown', escape); window.removeEventListener('resize', rotationHint); };
}
