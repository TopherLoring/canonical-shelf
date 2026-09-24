# Canonical Shelf SPA Architecture

Status: CURRENT
Effective: 2026-09-24
Supersedes: `PLAN_NATIVE_DOCUMENT_RENDERING_2026-09-22.md` for top-level routing/render ownership

## Architecture contract

Canonical Shelf is a single-document, public-first web application.

- `public/index.html` is the sole application document for Home, Course, Bible, Topics, Practice, and Search.
- Clean application URLs remain `/home`, `/course`, `/bible`, `/topics`, `/practice`, and `/search`, including their query/deep-link states.
- Internal application navigation uses the History API and bounded client rendering. It must not replace the browser document during ordinary same-origin app navigation.
- Browser Back/Forward is handled through `popstate` and must rerender the URL state without replacing the document.
- Direct entry and refresh on application routes resolve to `public/index.html` through the local preview fallback and Cloudflare `not_found_handling = single-page-application` behavior.
- Static/legal documents such as `/about.html`, `/privacy.html`, `/terms.html`, and `/safety.html` remain ordinary standalone documents.

## Rendering ownership

`public/app.js` owns application route selection and the bounded `#main` mount. Route/view modules own only their returned view content; they do not own or reconstruct the document shell.

Course, Unit, Home, and Progress views use native HTML `<template>` elements declared in `public/index.html`. Their JavaScript clones templates and populates text, links, data attributes, styles, and child collections through DOM operations. The render pipeline accepts both strings and DOM Nodes/DocumentFragments so other bounded view modules may migrate independently without another architecture transition.

The architecture prohibits:

- generated top-level route documents for application destinations;
- whole-body/document reconstruction from route modules;
- MutationObserver-based structural repair of the application shell;
- duplicate top-level renderers for the same destination;
- hidden post-render architecture patches that compete with the canonical router.

## Build and deployment

The build does not run a route-document generator. `build`, `serve`, and `dev` build content/runtime assets directly from the canonical public-first source.

Cloudflare assets use SPA fallback for unknown application paths while `/api/*` continues to run through the Worker first. The service worker caches the canonical shell and uses `/index.html` as the offline navigation fallback rather than precaching per-route HTML documents.

## Verification contract

A valid release must prove all of the following:

1. Primary application navigation is same-document.
2. Back/Forward preserves SPA behavior.
3. Direct route entry and refresh render correctly.
4. The canonical shell contains exactly one application `main` mount and the required native view templates.
5. No generated route-document ownership markers are required.
6. Current learner state, curriculum, Practice/games, Theologian, account/sync, offline behavior, legal surfaces, and deep links remain functional.
7. `bun run verify` passes.
8. Cloudflare configuration validation and deployment dry-run pass before merge/release readiness is claimed.

## Migration evidence

The 2026-09-24 Director-led migration used a guarded two-phase gate:

- G1 proved same-document navigation before generator removal.
- G2/G3 then removed generated route documents in an isolated CI workspace, ran the full repository verification suite, validated the Cloudflare SPA target, and committed the migration only after all checks passed.

Rollback baseline for that migration was commit `88d6939c9929155bc1fe71a8ee93bf92683589ae` on `refactor/dom-template-views-20260924`.
