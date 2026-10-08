// The /bible route serves the redesigned reader (book + chapter, or a reference) and, from Step 8, the Book overview and
// Timeline screen. Every other /bible address (the old library) stays on the current view until S8 removes it.
import * as reader from './reader.js';
import * as overview from './book-overview.js';

export const handles = params => reader.handles(params) || overview.handles(params);
export const mount = (container, ctx) => (reader.handles(ctx.params) ? reader : overview).mount(container, ctx);
