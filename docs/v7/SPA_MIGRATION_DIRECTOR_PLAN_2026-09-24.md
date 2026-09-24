# Canonical Shelf SPA Migration — Director Plan

Status: IMPLEMENTED / PRE-MERGE VERIFIED
Date: 2026-09-24
Owner: Director
Branch: `refactor/dom-template-views-20260924`

## Objective

Return Canonical Shelf to a true single-page application while preserving current learner-facing behavior, current practice/game work, Theologian behavior, state persistence, clean path-based URLs, direct-entry/refresh behavior, and the DOM-template view migration.

## Target architecture

- `public/index.html` is the sole application document.
- Application routes remain `/home`, `/course`, `/bible`, `/topics`, `/practice`, and `/search`.
- Internal navigation uses the History API and bounded client rendering without replacing the browser document.
- Direct requests to application routes resolve to `public/index.html` through SPA fallback.
- Course/Home/Progress/Unit views use native `<template>` cloning and DOM population; other bounded views may migrate independently.
- No whole-body DOM reconstruction or post-render structural repair.

## Rollback baseline

The branch start commit is `88d6939c9929155bc1fe71a8ee93bf92683589ae`. The verified generator-removal commit is `0c09761f56ae214ba84b6b60abe4038c2524efae`. Migration phases were committed independently so scoped rollback remains available without discarding unrelated current work.

## Execution DAG

0. Planning gate — lock target and rollback baseline. **COMPLETE**
1. Complete DOM-template migration for Course/Home/Progress/Unit views. **COMPLETE**
2. Restore SPA router behavior: History API for cross-route navigation, internal-link interception, `popstate` rendering. **COMPLETE**
3. Prove same-document navigation across all primary routes. **COMPLETE**
4. Remove route generation from build/dev/serve and delete generated route documents only after Gate 1 passes. **COMPLETE**
5. Verify local and Cloudflare SPA fallback/direct-entry behavior. **COMPLETE**
6. Replace multi-document routing tests with SPA navigation, refresh, back/forward, state, and no-reload contracts. **COMPLETE**
7. Run full verification and repair regressions through the owning maker. **COMPLETE**
8. Supersede document-first architecture documentation with the SPA architecture SSOT. **COMPLETE**
9. Program Governance Auditor closeout. **ACTIVE — final PR evidence pending**

## Ownership

- Director: accountable orchestration and gate decisions.
- Development Planning Orchestrator: plan/DAG and execution eligibility.
- Engineering Director: DOM templates, app router, navigation behavior, application integration.
- Infrastructure Reliability Director: build/deploy routing and Cloudflare SPA fallback.
- Verification Auditor: independent functional/regression evidence.
- Program Governance Auditor: final governance/independence check.

## Gates

### G0 — Plan approved
**PASS.** User approved the lean Director-led plan on 2026-09-24 before generator removal.

### G1 — Same-document SPA behavior
**PASS.** Browser verification proved primary navigation, Back/Forward behavior, native template rendering, utilities, responsive overflow, and representative accessibility checks before phase 2 was allowed to remove generated route documents.

### G2 — Direct-entry / infrastructure parity
**PASS.** The generator-free build passed local route/browser verification, Cloudflare configuration validation, and `wrangler deploy --dry-run`; Cloudflare SPA fallback is the production routing mechanism for clean application URLs.

### G3 — Pre-merge product verification
**PASS.** The generator-free workspace passed `bun run verify`, including build, BSB integrity, durable product contract, assessment, sync/D1, feedback, Theologian/crisis, and all browser contract tests. The workflow committed generator removal only after those checks and the Cloudflare dry run succeeded.

## Additional repairs discovered by verification

Two pre-existing inconsistencies were repaired through their owning implementation scope rather than bypassing gates:

1. The public-first modularization had left corrupted obsolete local Theologian code in `public/app.js` after introducing `public/theologian-engine.js`. The migration finished the intended extraction and retained the engine module as the single Theologian implementation.
2. `package.json` still attempted to build deleted `src/client/account.ts`. The live account/passkey/sync client source was restored under `public/account-client.ts`, consistent with the repository's public-first architecture, so account/sync remained functional rather than silently dropping the bundle.

## Plan-delta review

None of the defined plan-delta triggers occurred:

- Cloudflare supports clean SPA URLs through `single-page-application` fallback.
- Offline navigation works through the cached `index.html` shell.
- DOM-template migration remained implementation-only; no user-facing redesign was required.
- current state, Practice/games, curriculum, Theologian, account/sync, and deep-link behavior remained within the verified product contract.

No architecture delta was therefore required.

## Scope / regression evidence

The branch is based directly on current `main` (`88d6939c...`), is ahead only, and the final compare contains the intended routing/render/build/tests/docs files plus the account-client repair. Practice/game engine files are not changed by this migration.

Current architecture authority: `docs/v7/SPA_ARCHITECTURE_2026-09-24.md`.

## Final closeout condition

Open a PR to `main` and require the repository's canonical PR CI to independently rerun `bun run verify` and the Cloudflare dry run. Program Governance Auditor records final PASS only after that independent PR evidence is successful. Merge/deploy remains a separate owner decision.