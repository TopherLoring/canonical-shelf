// StepList & StepStrip Component (Reading Room design system)
// Desktop step list and phone step strip for lesson pacing.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderStepList({
  steps = [], // Array of { title, href, isComplete, isActive }
  currentStep = 1,
  totalSteps = 6,
  title = 'Steps',
  ariaLabel = 'Lesson navigation',
  className = ''
} = {}) {
  const effectiveTotal = steps.length || totalSteps;
  const itemsHtml = steps.map((s, idx) => {
    const stepNum = idx + 1;
    const isCur = s.isActive ?? (stepNum === currentStep);
    const isComp = s.isComplete ?? (stepNum < currentStep);
    const activeClass = isCur ? 'is-active' : (isComp ? 'is-complete' : '');
    const currentAttr = isCur ? 'aria-current="step"' : '';

    return `
    <li class="ui-step-list-item">
      <a href="${esc(s.href || '#')}" class="ui-step-list-link ${activeClass}" ${currentAttr}>
        <span class="ui-step-badge">${stepNum}</span>
        <span class="ui-step-title">${esc(s.title || `Step ${stepNum}`)}</span>
      </a>
    </li>`;
  }).join('');

  return `
  <nav class="ui-step-list ${esc(className)}" aria-label="${esc(ariaLabel)}">
    <span class="ui-step-list-header">${esc(title)} · ${currentStep} of ${effectiveTotal}</span>
    <ol class="ui-step-list-items">
      ${itemsHtml}
    </ol>
  </nav>`;
}

export function renderStepStrip({
  currentStep = 1,
  totalSteps = 6,
  currentPart = 1,
  totalParts = 1,
  stepTitle = '',
  actionLabel = 'All steps',
  isExpanded = false,
  className = ''
} = {}) {
  const partText = totalParts > 1 ? ` · part ${currentPart} of ${totalParts}` : '';
  const fullLabel = `Step ${currentStep} of ${totalSteps}${partText}${stepTitle ? `: ${stepTitle}` : ''}. ${actionLabel}`;

  const barsHtml = Array.from({ length: totalSteps }, (_, i) => {
    const num = i + 1;
    const isCur = num === currentStep;
    const isComp = num < currentStep;
    const statusClass = isCur ? 'is-active' : (isComp ? 'is-complete' : '');
    return `<span class="ui-step-strip-bar ${statusClass}"></span>`;
  }).join('');

  return `
  <div class="ui-step-strip ${esc(className)}" role="region" aria-label="Lesson pacing">
    <button type="button"
      class="ui-step-strip-button"
      aria-expanded="${isExpanded ? 'true' : 'false'}"
      aria-label="${esc(fullLabel)}">
      <span class="ui-step-strip-header">
        <span class="ui-step-strip-step">Step ${currentStep} of ${totalSteps}${partText}</span>
        <span class="ui-step-strip-action">${esc(actionLabel)}</span>
      </span>
      <span class="ui-step-strip-bars" aria-hidden="true">
        ${barsHtml}
      </span>
    </button>
  </div>`;
}

