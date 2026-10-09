// Step 3 (S3.H): the lesson screen.
//
// Renders the steps the build already divided (catalog: lesson.sections[].cards; decisions
// curriculum.lesson.sections-divided-2026-10-05 and ui.lesson.card.break-rule-v3-2026-10-05). Nothing is measured at
// runtime. One screen, two layouts chosen by the screen's shape (ui.lesson.card.orientation-2026-10-05): portrait uses
// the phone layout, landscape the desktop layout. The step flows in the window frame; there is no fixed-shape box
// (Chris 2026-10-08, superseding ui.lesson.card.portrait-4x5 and landscape-2x1). The markup is the template's lesson
// screen (docs/design/templates: titlebar, steps rail, lesson card, My Notes and Glossary cards).
//
// Address: /course?unit=<unit>&lesson=<lesson>&step=<n> (1-based). The phone title bar reads "Step n of m" with a dot
// chain (Chris 2026-10-08, superseding ui.lesson.progress.no-step-label-2026-10-05). Readings: quoted on the card when short, otherwise a link that opens
// the passage in a popover (ui.lesson.reading.inline-or-popover-2026-10-05).
import { challengeForm, proseMarkup, visualBlock, lessonApparatus, vocabEntries, continuationFor, activityFor, lessonFor, masteryFor } from '../../learning.js';
import { renderMounts } from '../../study-notes.js';
import { renderScriptureBlock, renderEdgeTab, setFrameVariant } from '../components/index.js';
import { GROUPS, parseReference } from '../../bible-books.js';
import { LABELS } from '../labels.js';
import { enhanceLearningVisuals } from '../../learning-visuals.js';
import { ORIENTATION_LESSON, ORIENTATION_LESSON_ID, ORIENTATION_UNIT_ID, ORIENTATION_START_HREF, markOrientationSeen } from '../../orientation.js';

// Lessons (?lesson=) and Checkpoints (?mastery=). A Checkpoint is a one-step lesson: the same frame, progress, notes and
// navigation, with the unit's check on the card (decisions ui.naming.checkpoint-bare-2026-10-05 and ui.naming.hide-module-unit-labels).
export const handles = params => params.has('lesson') || params.has('mastery');

/** A Checkpoint (unit check) or Capstone shaped like a lesson of one step, so the lesson screen can show it. */
export function checkpointAsLesson(data, masteryId) {
  const mastery = masteryFor(data, masteryId);
  if (!mastery) return null;
  const activityId = `mastery:${masteryId}`;
  const activity = activityFor(data, activityId);
  const unit = data.units?.find(u => u.id === activity?.unitId);
  const course = data.courses?.find(c => c.id === (activity?.courseId || unit?.courseId));
  const capstone = activity?.masteryType === 'course-capstone';
  const older = activity?.masteryType === 'legacy';
  // The unit's own check is "Checkpoint · <unit title>", the course's is "Capstone · <title>"; the older practice items
  // under a unit ("More practice" on the Learning Path) keep their own titles.
  const label = capstone ? LABELS.capstone : older ? 'Practice' : LABELS.unitCheck;
  const subject = capstone ? (course?.title || '') : older ? (activity?.title || mastery.title || '') : (unit?.title || '');
  const heading = older ? subject : subject ? `${label} · ${subject}` : label;
  // The introduction and the check are separate steps, so the check always has the whole card (no scrolling).
  // A long introduction is cut at sentence ends into several cards (about 380 characters each) so none scrolls either.
  const cards = [];
  const pieces = [mastery.dek, ...(mastery.body || [])].filter(Boolean).flatMap(text => {
    const sentences = String(text).match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) || [String(text)];
    return sentences.map((sentence, i) => ({ kind: 'sentence', text: sentence.trim(), paraStart: i === 0 }));
  });
  if (mastery.plain) pieces.push({ kind: 'callout', text: mastery.plain });
  let current = [], size = 0;
  const flush = () => { if (current.length) cards.push({ id: cards.length ? `checkpoint-${cards.length + 1}` : 'checkpoint', title: heading, units: current }); current = []; size = 0; };
  pieces.forEach(piece => {
    if (current.length && size + piece.text.length > 380) flush();
    if (!current.length) piece.paraStart = true;
    current.push(piece); size += piece.text.length;
  });
  flush();
  cards.push({ id: `checkpoint-${cards.length + 1}`, title: heading, units: [{ kind: 'check', block: 0 }] });
  return {
    id: masteryId,
    activityId,
    title: mastery.challenge?.title || mastery.title || heading,
    unitId: activity?.unitId || mastery.unitId || '',
    isCheckpoint: true,
    heading,
    label,
    challenges: [mastery.challenge],
    vocab: [],
    sections: [{ id: 'checkpoint', title: heading, blocks: [{ index: 0 }], cards }]
  };
}

/** The Orientation shaped like a lesson: every card is written as one step (see public/orientation.js). */
export function orientationAsLesson() {
  const sections = ORIENTATION_LESSON.sections.map(section => ({
    id: section.id,
    title: section.title,
    blocks: [],
    cards: section.cards.map(card => ({
      id: card.id,
      title: section.title,
      units: [
        ...(card.p || []).map(text => ({ kind: 'prose', text })),
        ...(card.list ? [{ kind: 'list', items: card.list }] : []),
        ...(card.desktop || card.phone ? [{ kind: 'platform', desktop: card.desktop, phone: card.phone }] : []),
        ...(card.note ? [{ kind: 'note', text: card.note }] : []),
        ...(card.actions ? [{ kind: 'actions', items: card.actions }] : [])
      ]
    }))
  }));
  return { id: ORIENTATION_LESSON_ID, activityId: `orientation:${ORIENTATION_LESSON_ID}`, title: ORIENTATION_LESSON.title, unitId: ORIENTATION_UNIT_ID, isOrientation: true, challenges: [], vocab: [], sections };
}

// **Name** marks a site element's name; it is set in a heavier weight so learners can find it on screen.
const labelled = (esc, text) => esc(text).replace(/\*\*(.+?)\*\*/g, '<strong class="site-label">$1</strong>');

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
    else if (unit.kind === 'prose') out.push(`<p class="scene-prose">${labelled(esc, unit.text)}</p>`);
    else if (unit.kind === 'platform') out.push(`<dl class="scene-platform">${unit.desktop ? `<div><dt class="site-label">Desktop</dt><dd>${labelled(esc, unit.desktop)}</dd></div>` : ''}${unit.phone ? `<div><dt class="site-label">Phone</dt><dd>${labelled(esc, unit.phone)}</dd></div>` : ''}</dl>`);
    else if (unit.kind === 'note') out.push(`<p class="scene-note">${labelled(esc, unit.text)}</p>`);
    else if (unit.kind === 'list') out.push(`<ul class="scene-list">${unit.items.map(item => `<li>${labelled(esc, item)}</li>`).join('')}</ul>`);
    else if (unit.kind === 'actions') out.push(`<p class="scene-actions">${unit.items.map(item => `<a class="scene-action${item.primary ? ' is-primary' : ''}" href="${esc(item.href)}">${esc(item.label)}</a>`).join('')}</p>`);
    else if (unit.kind === 'reading') out.push(readingMarkup(unit, i, ctx));
    else if (unit.kind === 'visual') out.push(visualBlock(lesson, esc));
    else if (unit.kind === 'check') {
      const index = step.blocks[unit.block]?.index ?? 0;
      out.push(`<div class="inline-check" id="check-${index + 1}">${challengeForm(lesson.challenges[index], lesson.activityId || `lesson:${lesson.id}`, index, esc)}</div>`);
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
    return renderScriptureBlock({ quote: esc(unit.text), reference, group: groupKeyFor(reference), contextHref, className: 'lesson-reading-inline' });
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

// A check with several questions (matching, scenario, lanes, argument fields) shows one at a time inside the card,
// so the card never scrolls. "Check response" appears with the last question.
function mountCheckPager(root) {
  root.querySelectorAll('.inline-check form.challenge').forEach(form => {
    const groups = [...form.querySelectorAll('.challenge-controls fieldset')];
    const submit = form.querySelector('.challenge-submit button[type="submit"]');
    if (groups.length < 2 || !submit) return;
    const bar = document.createElement('div');
    bar.className = 'check-pager';
    bar.innerHTML = '<button type="button" data-pager="back">Back</button><span data-pager-count aria-live="polite"></span><button type="button" data-pager="next">Next question</button>';
    form.querySelector('.challenge-controls').after(bar);
    const back = bar.querySelector('[data-pager="back"]'), nextBtn = bar.querySelector('[data-pager="next"]'), count = bar.querySelector('[data-pager-count]');
    let at = 0;
    const answered = group => !group.querySelector('input') || Boolean(group.querySelector('input:checked'));
    const show = i => {
      at = i;
      groups.forEach((group, k) => { group.hidden = k !== i; });
      count.textContent = `Question ${i + 1} of ${groups.length}`;
      back.disabled = i === 0;
      nextBtn.hidden = i === groups.length - 1;
      nextBtn.disabled = !answered(groups[i]);
      submit.hidden = i !== groups.length - 1;
    };
    form.addEventListener('change', () => { nextBtn.disabled = !answered(groups[at]); });
    back.addEventListener('click', () => show(Math.max(0, at - 1)));
    nextBtn.addEventListener('click', () => { if (answered(groups[at])) show(Math.min(groups.length - 1, at + 1)); });
    show(0);
  });
}

// The phone step chain: scroll so the current dot sits where it belongs (left at the start, centred in the middle, right at the
// end), fade the edge that has more beyond it, and show "Step n of x" for a moment on a tap.
let lastChain = { key: '', left: 0 };
function mountChain(container, key) {
  const chain = container.querySelector('[data-chain]');
  if (!chain) return () => {};
  const wrap = chain.parentElement;
  const fade = () => {
    const max = chain.scrollWidth - chain.clientWidth;
    const more = { start: chain.scrollLeft > 1, end: chain.scrollLeft < max - 1 };
    chain.dataset.fade = more.start && more.end ? 'both' : more.start ? 'start' : more.end ? 'end' : 'none';
  };
  const current = chain.querySelector('.is-current');
  const max = Math.max(0, chain.scrollWidth - chain.clientWidth);
  const want = current ? Math.min(max, Math.max(0, current.offsetLeft + current.offsetWidth / 2 - chain.clientWidth / 2)) : 0;
  if (lastChain.key === key && !matchMedia('(prefers-reduced-motion: reduce)').matches && chain.clientWidth) {
    chain.scrollLeft = Math.min(max, lastChain.left);
    chain.scrollTo({ left: want, behavior: 'smooth' });
  } else chain.scrollLeft = want;
  lastChain = { key, left: want };
  fade();
  let timer = 0;
  const onTap = () => { wrap.dataset.open = '1'; clearTimeout(timer); timer = setTimeout(() => { delete wrap.dataset.open; }, 2400); };
  chain.addEventListener('scroll', fade, { passive: true });
  chain.addEventListener('click', onTap);
  return () => { clearTimeout(timer); chain.removeEventListener('scroll', fade); chain.removeEventListener('click', onTap); };
}

export async function mount(container, ctx) {
  const { data, params, esc, navigate } = ctx;
  const masteryId = params.get('mastery');
  const lessonId = masteryId || params.get('lesson');
  const orientation = !masteryId && lessonId === ORIENTATION_LESSON_ID;
  const lesson = masteryId ? checkpointAsLesson(data, masteryId) : orientation ? orientationAsLesson() : lessonFor(data, lessonId);
  const steps = lessonSteps(lesson);
  if (!lesson || !steps.length) { container.innerHTML = `<p class="notice">${masteryId ? 'Checkpoint' : 'Lesson'} not found.</p>`; return; }

  const checkpoint = Boolean(lesson.isCheckpoint);
  const activityId = checkpoint || orientation ? lesson.activityId : `lesson:${lessonId}`;
  const activity = activityFor(data, activityId);
  const unitId = params.get('unit') || activity?.unitId || lesson.unitId;
  const unit = data.units?.find(u => u.id === unitId);
  const course = data.courses?.find(c => c.id === unit?.courseId);
  const lessonNumber = Math.max(1, (data.byUnit?.[unitId] || []).filter(id => id.startsWith('lesson:')).indexOf(activityId) + 1);
  const requested = Number(params.get('step'));
  const index = Number.isInteger(requested) && requested >= 1 ? Math.min(steps.length, requested) - 1 : 0;
  const step = steps[index];
  const base = `/course?unit=${encodeURIComponent(unitId || '')}&${checkpoint ? 'mastery' : 'lesson'}=${encodeURIComponent(lessonId)}`;
  const stepHref = i => `${base}&step=${i + 1}`;
  const exitHref = orientation ? '/course' : `/course?unit=${encodeURIComponent(unitId || '')}`;
  const next = orientation ? { href: ORIENTATION_START_HREF } : continuationFor(data, activityId);
  const last = index === steps.length - 1;
  if (orientation && last) markOrientationSeen();

  // Sections in order, each with its steps as dots (the rail and the phone's "All steps" sheet).
  const sections = [];
  steps.forEach((s, i) => {
    if (!sections.length || sections.at(-1).id !== s.sectionId) sections.push({ id: s.sectionId, title: s.sectionTitle, first: i, steps: [] });
    sections.at(-1).steps.push(i);
  });
  const ic = (path, label = '') => `<svg class="cs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}${label}</svg>`;
  const ICONS = {
    glossary: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.4M12 17v.5"/>',
    deeper: '<path d="M12 4v13M6 11l6 6 6-6"/><path d="M5 20h14"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>'
  };

  // Sections in order (the rail and the phone's "All steps" sheet): a marker, the title, and the section's steps as dots.
  const sectionList = `<ol class="cs-steps lesson-sections">${sections.map((section, n) => {
    const current = section.steps.includes(index);
    const done = section.steps.at(-1) < index;
    return `<li class="${current ? 'is-current' : ''}${done ? ' is-done' : ''}">
      <a href="${esc(stepHref(section.first))}" ${current ? 'aria-current="step"' : ''}>
        <span class="cs-marker${current ? ' cs-marker--current' : ''}" aria-hidden="true">${n + 1}</span>
        <span class="cs-grow lesson-section-text"><span class="lesson-section-title">${esc(section.title)}</span>
          <span class="lesson-section-dots" aria-hidden="true">${section.steps.map(i => `<span class="${i === index ? 'is-current' : i < index ? 'is-done' : ''}"></span>`).join('')}</span></span>
      </a>
    </li>`;
  }).join('')}</ol>`;

  const terms = vocabEntries(lesson);
  const vocabCount = terms.length;
  const questionCount = lesson.challenges?.length || 0;
  const stepText = step.units.map(u => [u.text, ...(u.items || [])].filter(Boolean).join(' ')).join(' ').toLowerCase();
  const stepTerms = terms.filter(([term]) => stepText.includes(String(term).toLowerCase())).slice(0, 4);
  const toolDefs = [
    { id: 'glossary', icon: ICONS.glossary, label: 'Glossary', count: vocabCount, off: !vocabCount },
    { id: 'questions', icon: ICONS.question, label: 'Questions', count: questionCount, off: !questionCount },
    { id: 'deeper', icon: ICONS.deeper, label: 'Go deeper', count: 0, off: checkpoint || orientation }
  ];
  const railTools = toolDefs.map((t, n) => `<button type="button" class="cs-rail__item${n === 0 && !t.off ? ' is-current' : ''}" data-lesson-tool="${t.id}" ${t.off ? 'disabled' : ''}>${ic(t.icon)}<span class="cs-grow">${t.label}</span>${t.count ? `<span class="cs-count">${t.count}</span>` : ''}</button>`).join('');
  const phoneTools = checkpoint || orientation ? '' : `<nav class="cs-toolgrid cs-toolgrid--3 lesson-phone-tools" aria-label="Study tools for this step">${toolDefs.map(t => `<button type="button" data-lesson-tool="${t.id}" ${t.off ? 'disabled' : ''}>${ic(t.icon)}<span>${t.label}${t.count ? ` · ${t.count}` : ''}</span></button>`).join('')}</nav>`;

  const lessonLabel = orientation ? 'Orientation' : checkpoint ? lesson.label : `${LABELS.lesson} ${lessonNumber}`;
  const crumbs = [
    `<a href="/course">${esc(LABELS.learningPath)}</a>`,
    course ? `<a href="/course?course=${encodeURIComponent(course.id)}">${esc(course.title)}</a>` : '',
    unit ? `<a href="${esc(exitHref)}">${esc(unit.title)}</a>` : '',
    `<span aria-current="page">${esc(lessonLabel)}</span>`
  ].filter(Boolean).join('<span class="lesson-crumb-sep" aria-hidden="true">›</span>');

  const where = `Step ${index + 1} of ${steps.length}`;

  const apparatus = orientation
    ? `<details class="deep-reading" open><summary>About the orientation</summary><p>A short tour of how the site works. It is not scored and does not count toward any module.</p></details>
       <section class="study-notes" data-notes-mount aria-label="${esc(LABELS.myNotes)}"></section>`
    : checkpoint
    ? `<details class="deep-reading" open><summary>About this ${esc(lesson.label.toLowerCase())}</summary><p>This activity evaluates understanding or reasoning, not whether you personally assent to a theological claim.</p></details>
       <section class="study-notes" data-notes-mount aria-label="${esc(LABELS.myNotes)}"></section>`
    : lessonApparatus(lesson, esc, { title: step.sectionTitle, anchor: step.anchor });

  const notesCard = `<section class="cs-card cs-panel cs-notes cs-notes--lesson" aria-label="${esc(LABELS.myNotes)}">
      <div class="cs-split cs-split--center"><h2 class="cs-panel__title">${ic(ICONS.pen)}${esc(LABELS.myNotes)}</h2>
        <button type="button" class="cs-icon-button cs-icon-button--small" data-collapse="lesson-notes" aria-label="Collapse ${esc(LABELS.myNotes)}" aria-expanded="true">${ic(ICONS.up)}</button></div>
      <div class="cs-notes__body lesson-notes-home" data-collapse-body="lesson-notes" data-notes-home="side"></div>
    </section>`;
  const glossaryCard = checkpoint || orientation || !vocabCount ? '' : `<section class="cs-card cs-panel cs-fill" aria-label="Glossary for this step">
      <h2 class="cs-panel__title">Glossary</h2>
      ${stepTerms.length
        ? `<dl class="cs-terms">${stepTerms.map(([term, definition]) => `<div><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join('')}</dl>`
        : '<p class="cs-caption">No glossary terms in this step.</p>'}
      <button type="button" class="cs-panel__foot lesson-link" data-lesson-tool="glossary">All ${vocabCount} term${vocabCount === 1 ? '' : 's'} in this lesson</button>
    </section>`;

  const sheetHead = title => `<header><h2>${title}</h2><button type="button" class="lesson-dialog-close" data-dialog-close aria-label="Close">×</button></header>`;
  container.innerHTML = `<section class="lesson-screen" data-lesson-screen ${checkpoint || orientation ? 'data-checkpoint' : ''} data-study-focus aria-labelledby="lesson-step-title">
    <header class="cs-titlebar lesson-titlebar">
      <nav class="cs-crumbs lesson-crumbs" aria-label="Breadcrumb">${crumbs}</nav>
      <div class="lesson-progress">
        <div class="cs-chain" data-chain role="group" tabindex="0" aria-label="${esc(where)}"><span class="cs-dots cs-dots--chain" aria-hidden="true">${steps.map((_, i) => `<span class="${i === index ? 'is-current' : i < index ? 'is-done' : ''}"></span>`).join('')}</span></div>
        <span class="cs-chain__label" data-lesson-count-phone role="status">${esc(where)}</span>
      </div>
      <button type="button" class="cs-crumbs__toggle lesson-all-steps" data-sheet-open="lesson-steps-sheet" aria-haspopup="dialog" aria-label="${esc(where)}. Show all steps and the full path">${ic(ICONS.down)}</button>
      <a href="${esc(exitHref)}" class="cs-icon-button cs-icon-button--small lesson-close" aria-label="Leave lesson">${ic(ICONS.close)}</a>
    </header>
    <div class="cs-window-well cs-window-well--lesson">
      <section class="cs-lesson-row" aria-label="Lesson">
        <nav class="cs-card cs-rail cs-rail--lesson lesson-rail" aria-label="Lesson navigation">
          <span class="cs-rail__label">Steps · <span data-lesson-count>${index + 1} of ${steps.length}</span></span>
          ${sectionList}
          ${checkpoint || orientation ? '' : `<span class="cs-rail__section">For this step</span>${railTools}`}
        </nav>
        <div class="cs-card cs-lesson-card">
          <article class="cs-lesson lesson-main">
            <div class="cs-lesson__scroll lesson-stage">
              <div class="cs-lesson__head">
                ${checkpoint || orientation ? '' : `<span class="cs-sub">${esc(lesson.title)}</span>`}
                <span class="cs-kicker">${esc(lessonLabel)}</span>
                <h1 id="lesson-step-title">${esc(step.sectionTitle)}</h1>
              </div>
              ${phoneTools}
              <div class="cs-lesson__prose lesson-body" data-step-id="${esc(step.id)}" tabindex="0" aria-label="Step text"><div class="lesson-body-text">${stepBody(step, lesson, ctx)}</div></div>
            </div>
            <footer class="cs-lesson__nav lesson-nav">
              <a class="cs-button cs-button--ghost lesson-back" href="${esc(index > 0 ? stepHref(index - 1) : exitHref)}" ${index > 0 ? '' : 'aria-disabled="true"'}>Back</a>
              <a class="cs-button cs-button--continue lesson-continue" href="${esc(!last ? stepHref(index + 1) : next?.href || exitHref)}">${!last ? 'Continue' : next ? (checkpoint ? 'Continue' : orientation ? 'Begin the Learning Path' : 'Next lesson') : 'Return to unit'}</a>
            </footer>
          </article>
        </div>
      </section>
      <aside class="cs-stack lesson-side" aria-label="Notes and study content">${notesCard}${glossaryCard}</aside>
    </div>
    ${renderEdgeTab({ type: 'notes', targetId: 'lesson-notes-sheet', className: 'lesson-notes-tab' })}
    <dialog class="lesson-sheet" id="lesson-steps-sheet" aria-label="All steps">${sheetHead(esc(lesson.title))}<nav class="cs-crumbs lesson-sheet-path" aria-label="Where this lesson is">${crumbs}</nav>${sectionList}</dialog>
    <dialog class="lesson-sheet" id="lesson-study-sheet" aria-label="Study tools">${sheetHead(esc(step.sectionTitle))}<div class="lesson-apparatus">${apparatus}</div></dialog>
    <dialog class="lesson-sheet" id="lesson-notes-sheet" aria-label="${esc(LABELS.myNotes)}">${sheetHead(esc(LABELS.myNotes))}<div class="lesson-notes-home" data-notes-home="sheet"></div></dialog>
  </section>`;

  enhanceLearningVisuals(container.querySelector('.lesson-body'));
  const restoreFrame = setFrameVariant('window');
  // The apparatus brings its own notes section; the lesson has one My Notes editor instead (the aside on a wide screen, a
  // sheet on the phone), so the editor exists once and its ids stay unique.
  container.querySelectorAll('.lesson-apparatus [data-notes-mount]').forEach(m => (m.closest('details') || m).remove());
  const notes = document.createElement('div');
  notes.dataset.notesMount = '';
  notes.className = 'study-notes';
  const phone = window.matchMedia('(max-width: 760px), (max-aspect-ratio: 4/5)');
  const placeNotes = () => container.querySelector(`[data-notes-home="${phone.matches ? 'sheet' : 'side'}"]`)?.append(notes);
  placeNotes();
  phone.addEventListener('change', placeNotes);
  renderMounts();
  const openDialog = id => { const d = container.querySelector(`#${CSS.escape(id)}`); if (d && !d.open) d.showModal(); };
  function onClick(event) {
    const t = event.target;
    const reading = t.closest('[data-reading-open]');
    if (reading) { openDialog(reading.dataset.readingOpen); return; }
    const sheet = t.closest('[data-sheet-open]');
    if (sheet) { openDialog(sheet.dataset.sheetOpen); return; }
    if (t.closest('[data-edge-tab="notes"]')) { openDialog('lesson-notes-sheet'); return; }
    const collapse = t.closest('[data-collapse]');
    if (collapse) {
      const body = container.querySelector(`[data-collapse-body="${CSS.escape(collapse.dataset.collapse)}"]`);
      const open = collapse.getAttribute('aria-expanded') !== 'true';
      if (body) body.hidden = !open;
      collapse.setAttribute('aria-expanded', String(open));
      collapse.setAttribute('aria-label', `${open ? 'Collapse' : 'Expand'} ${LABELS.myNotes}`);
      collapse.querySelector('path')?.setAttribute('d', open ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6');
      return;
    }
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
  mountCheckPager(container);
  const unmountChain = mountChain(container, lesson.id || lesson.title || '');
  container.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  return () => {
    unmountChain();
    container.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKey);
    phone.removeEventListener('change', placeNotes);
    restoreFrame();
  };
}
