// Step 3 (S3.H): the lesson screen.
//
// Renders the steps the build already divided (catalog: lesson.sections[].cards; decisions
// curriculum.lesson.sections-divided-2026-10-05 and ui.lesson.card.break-rule-v3-2026-10-05). Nothing is measured at
// runtime. One screen, two layouts chosen by the screen's shape (ui.lesson.card.orientation-2026-10-05): portrait uses
// the phone layout, landscape the desktop layout. The step body is a 4:5 box in portrait and a 2:1 box in landscape
// (ui.lesson.card.portrait-4x5, ui.lesson.card.landscape-2x1, ui.lesson.card.step-body-scope-2026-10-05).
//
// Address: /course?unit=<unit>&lesson=<lesson>&step=<n> (1-based). Progress reads "n of m", never "Step n of m"
// (ui.lesson.progress.no-step-label-2026-10-05). Readings: quoted on the card when short, otherwise a link that opens
// the passage in a popover (ui.lesson.reading.inline-or-popover-2026-10-05).
import { challengeForm, proseMarkup, visualBlock, lessonApparatus, continuationFor, activityFor, lessonFor } from '../../learning.js';
import { renderMounts } from '../../study-notes.js';
import { renderScriptureBlock, renderEdgeTab } from '../components/index.js';
import { GROUPS, parseReference } from '../../bible-books.js';
import { LABELS } from '../labels.js';
import { enhanceLearningVisuals } from '../../learning-visuals.js';

// Checkpoints (mastery) stay on the current view until the Checkpoint screen is built.
export const handles = params => params.has('lesson') && !params.has('mastery');

/** Every step of a lesson in order, with the section it belongs to. */
export function lessonSteps(lesson) {
  return (lesson?.sections || []).flatMap(section => (section.cards || []).map(card => ({
    ...card,
    sectionId: section.id,
    sectionTitle: section.title,
    anchor: section.anchor,
    blocks: section.blocks || []
  })));
}

const groupKeyFor = reference => {
  const book = parseReference(reference || '')?.book;
  const group = GROUPS.find(([, first, last]) => book >= first && book <= last);
  return group?.[3] || 'gospel';
};

/** The body of one step: its sentences regrouped into paragraphs, and its blocks in place. */
function stepBody(step, lesson, ctx) {
  const { esc, corpus = '' } = ctx;
  const out = [];
  let paragraph = null;
  const flush = () => { if (paragraph) { out.push(proseMarkup([paragraph.join(' ')], corpus, esc)); paragraph = null; } };
  step.units.forEach((unit, i) => {
    if (unit.kind === 'sentence') {
      if (unit.paraStart || !paragraph) { flush(); paragraph = []; }
      paragraph.push(unit.text);
      return;
    }
    flush();
    if (unit.kind === 'callout') out.push(`<aside class="scene-callout"><p>${esc(unit.text)}</p></aside>`);
    else if (unit.kind === 'reading') out.push(readingMarkup(unit, i, ctx));
    else if (unit.kind === 'visual') out.push(visualBlock(lesson, esc));
    else if (unit.kind === 'check') {
      const index = step.blocks[unit.block]?.index ?? 0;
      out.push(`<div class="inline-check" id="check-${index + 1}">${challengeForm(lesson.challenges[index], `lesson:${lesson.id}`, index, esc)}</div>`);
    } else if (unit.kind === 'reflect') {
      out.push(`<p class="scene-prose">${esc(lesson.reflect || '')}</p>${lesson.model ? `<details class="deep-reading"><summary>Compare with a model response</summary><p>${esc(lesson.model)}</p></details>` : ''}`);
    }
  });
  flush();
  return out.join('');
}

function readingMarkup(unit, i, { esc }) {
  const reference = unit.reference || '';
  const contextHref = `/bible?q=${encodeURIComponent(reference)}`;
  if (unit.mode === 'inline') {
    return renderScriptureBlock({ quote: unit.text, reference, group: groupKeyFor(reference), contextHref, className: 'lesson-reading-inline' });
  }
  const preview = unit.text.length > 90 ? `${unit.text.slice(0, 90).replace(/\s\S*$/, '')}…` : unit.text;
  const id = `lesson-reading-${i}`;
  return `<button type="button" class="lesson-reading-link" data-group="${esc(groupKeyFor(reference))}" data-reading-open="${id}" aria-haspopup="dialog">
      <span class="lesson-reading-ref">${esc(reference)} <span class="lesson-reading-version">· BSB</span></span>
      <span class="lesson-reading-preview">${esc(preview)}</span>
      <span class="lesson-reading-cta">Read the passage</span>
    </button>
    <dialog class="lesson-reading-dialog" id="${id}" aria-labelledby="${id}-title">
      <header><h2 id="${id}-title">${esc(reference)} <span class="lesson-reading-version">· BSB</span></h2>
        <button type="button" class="lesson-dialog-close" data-dialog-close aria-label="Close the passage">×</button></header>
      <div class="lesson-reading-text"><p>${esc(unit.text)}</p></div>
      <footer><a href="${esc(contextHref)}" class="lesson-reading-context">Open in the Bible</a></footer>
    </dialog>`;
}

export async function mount(container, ctx) {
  const { data, params, esc, navigate } = ctx;
  const lessonId = params.get('lesson');
  const lesson = lessonFor(data, lessonId);
  const steps = lessonSteps(lesson);
  if (!lesson || !steps.length) { container.innerHTML = '<p class="notice">Lesson not found.</p>'; return; }

  const activityId = `lesson:${lessonId}`;
  const activity = activityFor(data, activityId);
  const unitId = params.get('unit') || activity?.unitId || lesson.unitId;
  const unit = data.units?.find(u => u.id === unitId);
  const course = data.courses?.find(c => c.id === unit?.courseId);
  const lessonNumber = Math.max(1, (data.byUnit?.[unitId] || []).filter(id => id.startsWith('lesson:')).indexOf(activityId) + 1);
  const requested = Number(params.get('step'));
  const index = Number.isInteger(requested) && requested >= 1 ? Math.min(steps.length, requested) - 1 : 0;
  const step = steps[index];
  const base = `/course?unit=${encodeURIComponent(unitId || '')}&lesson=${encodeURIComponent(lessonId)}`;
  const stepHref = i => `${base}&step=${i + 1}`;
  const exitHref = `/course?unit=${encodeURIComponent(unitId || '')}`;
  const next = continuationFor(data, activityId);
  const last = index === steps.length - 1;

  // Sections in order, each with its steps as dots (the rail and the phone's "All steps" sheet).
  const sections = [];
  steps.forEach((s, i) => {
    if (!sections.length || sections.at(-1).id !== s.sectionId) sections.push({ id: s.sectionId, title: s.sectionTitle, first: i, steps: [] });
    sections.at(-1).steps.push(i);
  });
  const sectionList = `<ol class="lesson-sections">${sections.map(section => {
    const current = section.steps.includes(index);
    const done = section.steps.at(-1) < index;
    return `<li class="${current ? 'is-current' : ''}${done ? ' is-done' : ''}">
      <a href="${esc(stepHref(section.first))}" ${current ? 'aria-current="step"' : ''}>${esc(section.title)}</a>
      <span class="lesson-section-dots" aria-hidden="true">${section.steps.map(i => `<span class="${i === index ? 'is-current' : i < index ? 'is-done' : ''}"></span>`).join('')}</span>
    </li>`;
  }).join('')}</ol>`;

  const vocabCount = Array.isArray(lesson.vocab) ? lesson.vocab.length : Object.keys(lesson.vocab || {}).length;
  const questionCount = lesson.challenges?.length || 0;
  const icon = path => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  const tools = `<div class="lesson-tools" role="group" aria-label="Study tools">
      <button type="button" data-lesson-tool="glossary" ${vocabCount ? '' : 'disabled'}>${icon('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16"/>')}<span>Glossary${vocabCount ? ` · ${vocabCount}` : ''}</span></button>
      <button type="button" data-lesson-tool="questions" ${questionCount ? '' : 'disabled'}>${icon('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01"/>')}<span>Questions${questionCount ? ` · ${questionCount}` : ''}</span></button>
      <button type="button" data-lesson-tool="deeper">${icon('<path d="M12 4v12M6 10l6 6 6-6M5 20h14"/>')}<span>Go deeper</span></button>
    </div>`;

  const crumbs = [
    `<a href="/course">${esc(LABELS.learningPath)}</a>`,
    course ? `<a href="/course?course=${encodeURIComponent(course.id)}" class="lesson-crumb-wide">${esc(course.title)}</a>` : '',
    unit ? `<a href="${esc(exitHref)}" class="lesson-crumb-wide">${esc(unit.title)}</a>` : '',
    `<span aria-current="page">${esc(LABELS.lesson)} ${lessonNumber}</span>`
  ].filter(Boolean).join('<span class="lesson-crumb-sep" aria-hidden="true">›</span>');

  const progress = `<div class="lesson-progress">
      <span class="lesson-progress-count" data-lesson-count>${index + 1} of ${steps.length}</span>
      <ol class="lesson-progress-bar" aria-hidden="true">${steps.map((_, i) => `<li class="${i < index ? 'is-done' : i === index ? 'is-current' : ''}"></li>`).join('')}</ol>
      <button type="button" class="lesson-all-steps" data-sheet-open="lesson-steps-sheet" aria-haspopup="dialog">All steps</button>
    </div>`;

  const apparatus = lessonApparatus(lesson, esc, { title: step.sectionTitle, anchor: step.anchor });

  container.innerHTML = `<section class="lesson-screen" data-lesson-screen data-study-focus aria-labelledby="lesson-step-title">
    <div class="lesson-card">
      <header class="lesson-titlebar">
        <nav class="lesson-crumbs" aria-label="Breadcrumb">${crumbs}</nav>
        <div class="lesson-titlebar-utilities">
          <button type="button" class="feedback-cta" data-feedback-open aria-haspopup="dialog" aria-controls="feedback-panel" aria-expanded="false">Feedback</button>
          <a href="${esc(exitHref)}" class="lesson-close" aria-label="Leave lesson">${icon('<path d="M6 6l12 12M18 6 6 18"/>')}</a>
        </div>
      </header>
      ${progress}
      <div class="lesson-layout">
        <aside class="lesson-rail" aria-label="Sections">
          <p class="lesson-rail-heading">${esc(lesson.title)}</p>
          ${sectionList}
          <p class="lesson-rail-heading">For this step</p>
          ${tools}
        </aside>
        <article class="lesson-main">
          <header class="lesson-step-head">
            <p class="lesson-eyebrow">${esc(lesson.title)}</p>
            <h1 id="lesson-step-title">${esc(step.sectionTitle)}</h1>
          </header>
          <div class="lesson-phone-tools">${tools}</div>
          <div class="lesson-stage"><div class="lesson-body" data-step-id="${esc(step.id)}" tabindex="0" aria-label="Step text"><div class="lesson-body-text">${stepBody(step, lesson, ctx)}</div></div></div>
          <footer class="lesson-nav">
            <a class="lesson-back" href="${esc(index > 0 ? stepHref(index - 1) : exitHref)}" ${index > 0 ? '' : 'aria-disabled="true"'}>Back</a>
            <a class="lesson-continue" href="${esc(!last ? stepHref(index + 1) : next?.href || exitHref)}">${!last ? 'Continue' : next ? 'Next lesson' : 'Return to unit'}</a>
          </footer>
        </article>
        <aside class="lesson-side" aria-label="${esc(LABELS.myNotes)}">
          <h2 class="lesson-side-heading">${esc(LABELS.myNotes)}</h2>
          <div class="lesson-notes-home" data-notes-home="side"></div>
          <div class="lesson-apparatus">${apparatus}</div>
        </aside>
      </div>
    </div>
    ${renderEdgeTab({ type: 'notes', targetId: 'lesson-notes-sheet', className: 'lesson-notes-tab' })}
    <dialog class="lesson-sheet" id="lesson-steps-sheet" aria-label="All steps"><header><h2>${esc(lesson.title)}</h2><button type="button" class="lesson-dialog-close" data-dialog-close aria-label="Close">×</button></header>${sectionList}</dialog>
    <dialog class="lesson-sheet" id="lesson-study-sheet" aria-label="Study tools"><header><h2>${esc(step.sectionTitle)}</h2><button type="button" class="lesson-dialog-close" data-dialog-close aria-label="Close">×</button></header><div class="lesson-apparatus">${apparatus}</div></dialog>
    <dialog class="lesson-sheet" id="lesson-notes-sheet" aria-label="${esc(LABELS.myNotes)}"><header><h2>${esc(LABELS.myNotes)}</h2><button type="button" class="lesson-dialog-close" data-dialog-close aria-label="Close">×</button></header><div class="lesson-notes-home" data-notes-home="sheet"></div></dialog>
  </section>`;

  enhanceLearningVisuals(container.querySelector('.lesson-body'));
  // The apparatus brings its own notes section; the lesson has one My Notes editor instead (side column in
  // landscape, sheet in portrait), so the editor exists once and its ids stay unique.
  container.querySelectorAll('.lesson-apparatus [data-notes-mount]').forEach(m => (m.closest('details') || m).remove());
  const notes = document.createElement('div');
  notes.dataset.notesMount = '';
  const landscape = window.matchMedia('(orientation: landscape) and (min-width: 700px)');
  const placeNotes = () => container.querySelector(`[data-notes-home="${landscape.matches ? 'side' : 'sheet'}"]`)?.append(notes);
  placeNotes();
  landscape.addEventListener('change', placeNotes);
  renderMounts();
  // The screen fills the viewport below wherever it starts (the lesson hides the top bar in focus mode).
  const screen = container.querySelector('.lesson-screen');
  const fit = () => screen.style.setProperty('--lesson-top', `${Math.max(0, Math.round(screen.getBoundingClientRect().top + window.scrollY))}px`);
  fit();
  window.addEventListener('resize', fit);

  const openDialog = id => { const d = container.querySelector(`#${CSS.escape(id)}`); if (d && !d.open) d.showModal(); };
  function onClick(event) {
    const t = event.target;
    const reading = t.closest('[data-reading-open]');
    if (reading) { openDialog(reading.dataset.readingOpen); return; }
    const sheet = t.closest('[data-sheet-open]');
    if (sheet) { openDialog(sheet.dataset.sheetOpen); return; }
    if (t.closest('[data-edge-tab="notes"]')) { openDialog('lesson-notes-sheet'); return; }
    const tool = t.closest('[data-lesson-tool]');
    if (tool) {
      if (tool.dataset.lessonTool === 'questions') {
        const target = steps.findIndex(s => s.units.some(u => u.kind === 'check'));
        if (target >= 0) navigate(stepHref(target));
        return;
      }
      openDialog('lesson-study-sheet');
      const wanted = tool.dataset.lessonTool === 'glossary' ? 'Glossary' : 'Go deeper';
      container.querySelectorAll('#lesson-study-sheet details').forEach(d => { d.open = d.querySelector('summary')?.textContent.trim().startsWith(wanted) || false; });
      return;
    }
    if (t.closest('[data-dialog-close]')) { t.closest('dialog')?.close(); return; }
    // A click on a dialog's dimmed backdrop (outside its box) closes it.
    if (t instanceof HTMLDialogElement && t.open) {
      const r = t.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) t.close();
    }
    if (t.closest('.lesson-back[aria-disabled="true"]')) event.preventDefault();
  }
  function onKey(event) {
    if (event.target.closest('input, textarea, select, [contenteditable]')) return;
    if (container.querySelector('dialog[open]')) return;
    if (event.key === 'ArrowRight' && !last) navigate(stepHref(index + 1));
    if (event.key === 'ArrowLeft' && index > 0) navigate(stepHref(index - 1));
  }
  container.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  return () => {
    container.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKey);
    landscape.removeEventListener('change', placeNotes);
    window.removeEventListener('resize', fit);
  };
}
