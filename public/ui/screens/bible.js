// The /bible route. It serves the reader (a book and chapter, or a reference), the Book overview and Timeline screen,
// and redirects what is left of the old Bible library, which duplicated the Shelf:
//   /bible, /bible?view=reader            -> where you were reading (or Genesis 1)
//   /bible?book=N                          -> that book, chapter 1
//   /bible?view=shelf, ?view=books         -> Home (the Shelf)
// A Scripture word search (/bible?q=covenant) stays on the current view until S9.
import * as reader from './reader.js';
import * as overview from './book-overview.js';

function libraryRedirect(params) {
  if (reader.handles(params) || overview.handles(params)) return null;
  const view = params.get('view');
  if (view === 'shelf' || view === 'books') return '/home';
  const q = (params.get('q') || '').trim();
  // A word (not a reference) is a Scripture search; it lives on the search screen.
  if (q && !params.has('profile') && !(view && view !== 'reader')) return `/search?q=${encodeURIComponent(q)}&type=scripture`;
  if (params.has('profile') || q || (view && view !== 'reader')) return null;
  const book = Number(params.get('book'));
  if (book >= 1 && book <= 66) return `/bible?book=${book}&chapter=1`;
  try {
    const saved = JSON.parse(localStorage.getItem('canonical-shelf-bible-state-v1') || '{}');
    const lastBook = Number(saved.lastBook), lastChapter = Number(saved.lastChapter);
    if (lastBook >= 1 && lastBook <= 66) return `/bible?book=${lastBook}&chapter=${lastChapter > 0 ? lastChapter : 1}`;
  } catch { /* no saved position */ }
  return '/bible?book=1&chapter=1';
}

export const handles = params => reader.handles(params) || overview.handles(params) || libraryRedirect(params) !== null;

export async function mount(container, ctx) {
  const { params } = ctx;
  if (reader.handles(params)) return reader.mount(container, ctx);
  if (overview.handles(params)) return overview.mount(container, ctx);
  const target = libraryRedirect(params);
  if (target) ctx.navigate(target, { replace: true });
  return () => {};
}
