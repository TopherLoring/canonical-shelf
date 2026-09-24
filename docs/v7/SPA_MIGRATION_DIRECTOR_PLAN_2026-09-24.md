# Canonical Shelf SPA Migration — Director Plan

Status: APPROVED
Date: 2026-09-24
Owner: Director
Branch: `refactor/dom-template-views-20260924`

## Objective

Return Canonical Shelf to a true single-page application while preserving current learner-facing behavior, current practice/game work, Theologian behavior, state persistence, clean path-based URLs, direct-entry/refresh behavior, and the in-progress DOM-template view migration.

## Target architecture

- `public/index.html` is the sole application document.
- Application routes remain `/home`, `/course`, `/bible`, `/topics`, `/practice`, and `/search`.
- Internal navigation uses the History API and bounded client rendering without replacing the browser document.
- Direct requests to application routes resolve to `public/index.html`.
- Route views may return strings temporarily where not yet migrated, but Course/Home/Progress/Unit views migrate to native `<template>` cloning and DOM population.
- No whole-body DOM reconstruction or post-render structural repair.

## Rollback baseline

The branch start commit is `88d6939c9929155bc1fe71a8ee93bf92683589ae`. Each migration phase is committed independently so any failed phase can be reverted without losing unrelated current work.

## Execution DAG

0. Planning gate — lock target and rollback baseline.
1. Complete DOM-template migration for Course/Home/Progress/Unit views.
2. Restore SPA router behavior: History API for cross-route navigation, internal-link interception, `popstate` rendering.
3. Prove same-document navigation across all primary routes.
4. Remove route generation from build/dev/serve and delete generated route documents only after Gate 1 passes.
5. Verify local and Cloudflare SPA fallback/direct-entry behavior.
6. Replace multi-document routing tests with SPA navigation, refresh, back/forward, state, and no-reload contracts.
7. Run full verification and repair regressions through the owning maker.
8. Supersede document-first architecture documentation with the SPA architecture SSOT.
9. Program Governance Auditor closeout.

## Ownership

- Director: accountable orchestration and gate decisions.
- Development Planning Orchestrator: this plan/DAG and execution eligibility.
- Engineering Director: DOM templates, app router, navigation behavior, application integration.
- Infrastructure Reliability Director: build/deploy routing and Cloudflare SPA fallback.
- Verification Auditor: independent functional/regression evidence.
- Program Governance Auditor: final governance/independence check.

## Gates

### G0 — Plan approved
PASS. User approved the lean Director-led plan on 2026-09-24.

### G1 — Same-document SPA behavior
Before route generator removal, all primary routes must navigate through the client router without document reload and browser Back/Forward must rerender correctly.

### G2 — Direct-entry parity
Before the generator is considered obsolete, direct entry and refresh for every primary route and representative query/deep-link routes must resolve to `index.html` and render correctly locally and in the Cloudflare runtime configuration.

### G3 — Merge readiness
Full verification must pass with current learner state, curriculum, games/practice behavior, Theologian, offline/local behavior, and current user-facing experiences preserved. Program Governance Auditor then performs terminal closeout.

## Plan-delta triggers

Create a plan delta only if implementation evidence shows one of the following:

- clean path-based SPA URLs cannot be supported by the deployed Cloudflare runtime without generated route documents;
- removing generated documents materially harms required offline/direct-entry behavior;
- the DOM-template migration requires a user-facing redesign rather than an implementation-only change;
- current state, practice/game, curriculum, or Theologian behavior cannot be preserved under the target router.

Otherwise, implementation proceeds through the DAG without additional governance artifacts.

## Execution status

- G0: PASS
- Node 1: ACTIVE — recover/reapply DOM-template implementation.
