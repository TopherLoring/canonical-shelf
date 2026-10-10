// LessonWindow Component (Reading Room design system)
// Breadcrumb title-bar, split pane content, and Back/Continue footer.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderLessonWindow({
  breadcrumbs = [], // Array of { label, href }
  currentTitle = 'Lesson 1',
  body = '',
  canGoBack = false,
  canContinue = true,
  continueText = 'Continue',
  backText = 'Back',
  onCloseHref = '/path',
  className = ''
} = {}) {
  const crumbsHtml = breadcrumbs.map(b => `<a href="${esc(b.href)}">${esc(b.label)}</a><span aria-hidden="true">›</span>`).join('');

  return `
  <div class="ui-lesson-window ${esc(className)}">
    <div class="ui-lesson-titlebar">
      <nav aria-label="Breadcrumb" class="ui-lesson-breadcrumb">
        ${crumbsHtml}
        <span aria-current="page" class="ui-lesson-breadcrumb-current">${esc(currentTitle)}</span>
      </nav>
      <a href="${esc(onCloseHref)}" class="ui-lesson-close-btn" aria-label="Leave lesson">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>
      </a>
    </div>
    <div class="ui-lesson-body">
      ${body}
    </div>
    <div class="ui-lesson-footer">
      <button type="button" class="ui-lesson-back-btn" ${canGoBack ? '' : 'disabled="disabled"'}>${esc(backText)}</button>
      <button type="button" class="ui-lesson-continue-btn" ${canContinue ? '' : 'disabled="disabled"'}>${esc(continueText)}</button>
    </div>
  </div>`;
}

