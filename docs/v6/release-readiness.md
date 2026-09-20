# Canonical Shelf v6 — Director Release Readiness

> **Historical snapshot.** This document records the v6 release-readiness position before v7 superseded it. It is retained for provenance and must not be read as the current release-governance state. Current status is documented in the root `README.md` and `docs/v7/`.

Historical status: **PASS WITH RELEASE HOLD**

Branch at the time: `v6`  
Latest automated-gate head at the time: `1bc3a48a06e4beae6df9c0855a184cde0129ac23`  
Latest full CI run at the time: `35223143073`

## Historical Director disposition

The v6 engineering implementation had passed the automated acceptance surface available in CI at that stage. The v6 policy did **not** authorize merge to `main` or deployment and held release on human/device validation plus final production identity/sync provisioning.

That v6 merge/deploy rule was later superseded by explicit project-owner decisions during v7. Under `docs/v7/DECISION_PRECEDENCE.md`, newer explicit owner decisions govern after conflict notification/confirmation where material.

## Automated gates recorded as PASS in v6

- audited migration provenance pinned to an immutable legacy commit and explicit admissibility manifest;
- 25 units, 70 guided lessons, 69 mastery activities, 139 scored activities, and 45 Topics validated;
- no empty curriculum unit;
- native durable routes and static-host fallback;
- legacy hash compatibility canonicalizing forward;
- three-tier design-token enforcement;
- bounded Theologian safeguards and mastery-answer protection;
- local-first learner state, spaced review, sync outbox, merge rules, and `legacyRaw` privacy boundaries;
- optional account/passkey client compilation;
- Better Auth + Cloudflare D1 Worker compilation;
- local D1 user isolation/replay/deletion/privacy checks;
- PWA shell/data cache behavior;
- Chromium, Firefox, and WebKit E2E;
- axe serious/critical checks on covered surfaces;
- mobile-width account/header checks.

## Human/environment holds recorded at the v6 stage

The following were explicitly not considered satisfied by automated CI:

1. NVDA and VoiceOver validation.
2. Forced-colors and 200%/400% zoom/reflow inspection.
3. Physical iPhone/iPad/Android testing, including PWA and passkey behavior.
4. Representative learner usability testing.
5. Editorial/theological review of representative migrated content.
6. Production D1/Auth/passkey/recovery/deletion environment validation.
7. Authenticated endpoint isolation using real sessions.
8. Privacy/recovery review.

These categories informed the later v7 assurance model. Unless separate evidence records completion, current documentation continues to treat comparable human/device/editorial checks as continuing QA rather than silently marking them complete.

## Supersession

The v7 V5-polish release was later merged to `main` as `801a9706d7cec9574ceadca7647a9f63a2b554fc` after its authoritative automated production CI passed and the project owner explicitly authorized merge. This historical v6 release hold therefore no longer controls `main`.

For current state, see:

- `README.md`
- `docs/v7/DECISION_PRECEDENCE.md`
- `docs/v7/PLAN_DELTA_V7_V5_POLISH.md`
- `docs/v7/project-execution-graph.json`
