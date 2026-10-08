// The /course route serves two redesigned screens: a lesson (?lesson=) and the Learning Path page (everything else).
// The glossary lives in Study Topics now, so any ?glossary= address moves there. Checkpoints (?mastery=) and the
// orientation unit stay on the current view until Step 7 removes it.
import * as lesson from './lesson.js';
import * as learningPath from './learning-path.js';

const glossaryTarget = params => {
  const term = params.get('glossary');
  return `/topics?mode=glossary${term && term !== '1' ? `&q=${encodeURIComponent(term)}` : ''}`;
};

export const handles = params => params.has('glossary') || lesson.handles(params) || learningPath.handles(params);
export function mount(container, ctx) {
  if (ctx.params.has('glossary')) { ctx.navigate(glossaryTarget(ctx.params), { replace: true }); return () => {}; }
  return (lesson.handles(ctx.params) ? lesson : learningPath).mount(container, ctx);
}
