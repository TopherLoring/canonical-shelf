// The /course route serves two redesigned screens: a lesson (?lesson=) and the Learning Path page (everything else).
// Checkpoints (?mastery=), the glossary and the orientation unit stay on the current view until their own steps.
import * as lesson from './lesson.js';
import * as learningPath from './learning-path.js';

export const handles = params => lesson.handles(params) || learningPath.handles(params);
export const mount = (container, ctx) => (lesson.handles(ctx.params) ? lesson : learningPath).mount(container, ctx);
