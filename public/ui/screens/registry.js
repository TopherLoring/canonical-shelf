// Screen registry: the one place the router learns that a redesigned screen exists.
//
// Each entry is either null (the route still renders through its current view in app.js) or a function that
// loads the screen module. A screen module exports:
//
//   mount(container, ctx) -> cleanup function (or nothing)
//   handles(params) -> boolean   (optional) false hands this address back to the route's current view, so a
//                                route can move to the new screen one state at a time (for example /bible?book=&chapter=
//                                before /bible?view=timeline)
//
// where ctx is built by app.js for every render:
//
//   { route, params, data, corpus, state, setState, esc, labels, groupNames, navigate, activityHref, db, isCurrent }
//
//   params      URLSearchParams for the current address (book, chapter, start, end, focus, q, unit, lesson, ...)
//   data        the loaded catalog (courses, units, lessons, activities, topics, glossary, ...)
//   corpus      the full BSB corpus text, already loaded for routes that need Scripture
//   state       learner state at render time; after a change call setState(nextState) so the app keeps it
//   db          { getState, recordResult, recordReview, dueReviews, exportState, importState } from db.js
//   navigate    client-side navigation: navigate('/bible?book=1&chapter=1')
//   isCurrent   after an asynchronous preparation, check this before writing to the container; a newer route may have replaced this render
//
// Screens never fetch the catalog or the corpus themselves, never touch elements outside the container, and
// return a cleanup function that removes any listeners they attached outside it.
//
// One entry per route. Each screen pull request changes only its own entry; the blank lines between entries
// keep parallel pull requests from conflicting.

export const SCREENS = Object.freeze({
  // Step 4 (phase 6): Shelf home
  home: () => import('./shelf-home.js'),

  // Step 2 (phase 4): Bible reader
  bible: () => import('./bible.js'),

  // Step 3 (phase 5): Learning Path and lesson (one module dispatches on params; the lesson screen handles
  // ?lesson= addresses, everything else stays on the current view until S3.J)
  course: () => import('./course.js'),

  // Step 5 (phase 7): Study Topics
  topics: () => import('./topics.js'),

  // Step 5 (phase 7): Review & Practice
  practice: () => import('./practice.js'),

  // Step 5 (phase 7): Profile (S5c)
  profile: () => import('./profile.js'),

  // Step 9: Search results (placeholder until S9 replaces the module)
  search: () => import('./search.js'),

  // Step 10: About and policies
  about: () => import('./about.js')
});
