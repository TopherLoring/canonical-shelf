# Canonical Shelf v7 — V5 Polish Plan Delta

## Status

**Implemented and merged.** The v7 V5-polish release was squash-merged to `main` as `801a9706d7cec9574ceadca7647a9f63a2b554fc` after the authoritative automated production CI passed.

This plan remains the historical implementation record and current product-direction baseline. Human/device/editorial/theological review items that were not independently evidenced remain continuing assurance work; they are not retroactively marked complete by CI or by merge.

## Objective

Re-center v7 on the v5 learner-facing product experience while preserving the validated v7 state/assessment foundation. v5 remains the structural and experiential reference; v4 supplies a selective scholarly writing/content-depth quality bar. The result is intended to feel like a polished, premium evolution of v5 rather than an architecture-led redesign.

## Current product baseline

Under `DECISION_PRECEDENCE.md`, these are current decisions rather than immutable constraints against a later explicit owner change:

- Home / Course / Bible / Topics / Practice remain the five primary destinations.
- Current scored baseline remains 25 units, 70 guided lessons, 69 mastery activities, 139 scored activities, with existing activity/mastery IDs preserved.
- Bible owns the bookshelf, reader, book profiles, chapters, maps/timelines, and study affordances.
- Topics remains curated reference and does not count toward curriculum completion.
- Practice remains reinforcement, not a parallel curriculum.
- v5 is the principal layout/product-flow reference.
- v4 is a scholarly-content reference for adult reading level, substantive explanation, historical/literary context, evidence boundaries, responsible competing readings, vocabulary, deeper layers, and sources where useful.
- Unit 1 Lesson 1 remains the first scored curriculum lesson, **Begin with the central story**.
- Unit 0 Lesson 1, **Welcome to Canonical Shelf**, is a replayable non-scored onboarding/tutorial outside the 25-unit/139-scored-activity curriculum.
- Six first-class aesthetic/theme packages are available and persist locally.
- Lesson mode uses dark, theme-aware **Study Focus** chrome with an elevated light folio.
- Lesson composition follows resize/recompose/relocate before scrolling; accordion/drawer treatment precedes additional scroll surfaces where possible.
- Scholarly apparatus keeps text, evidence/history, interpretation, reception, doctrine, and application distinguishable.
- Bible/category colors remain semantic and are not arbitrary lesson decoration.
- Accessibility-driven presentation alternatives activate through user/system settings where applicable while baseline semantic compatibility remains.

## Implemented experience outcomes

1. v7 preserves the recognizable v5 product model while using the cleaner v7 architecture.
2. Unit 0 teaches how Canonical Shelf works without affecting scored progress.
3. Guided lessons enter Study Focus and restore Course route/scroll context on exit.
4. Secondary scholarly material collapses/relocates before primary reading is forced into extra scroll surfaces.
5. Navigation/progress controls use reserved space rather than covering lesson content.
6. Unit 1 Lesson 1 and the scholarly apparatus demonstrate the stronger scholarly-content standard without replacing the v5 product model.
7. Theme packages are coherent design-system variants, not simple recolors.
8. Rich challenge rendering supports sequence, matching, evidence, scenario, argument, classification, single-choice, and reflection patterns.
9. Personal Notes & Journal and global Feedback were restored/added before release closeout.

## Acceptance criteria — automated disposition

### Product and curriculum
- five primary destinations preserved — **pass**
- Unit 0 excluded from scored counts — **pass**
- 25/70/69/139 baseline preserved — **pass**
- existing stable curriculum/mastery IDs preserved — **pass**
- Unit 1 Lesson 1 preserved as first scored lesson — **pass**

### Study Focus
- enter/exit behavior and Course restoration — **automated pass**
- viewport-fit/reserved navigation contracts on covered viewports — **automated pass**
- mobile apparatus relocation — **automated pass**
- responsive/container-aware typography and composition — **automated structural/E2E pass on covered cases**

### Scholarly apparatus/content
- required scholarly layers present — **implemented**
- source trail and evidence/context distinctions demonstrated — **automated content checks passed on covered material**
- independent human editorial/theological review — **continuing assurance unless separately evidenced**

### Themes
Current package contract:
- Heritage
- Canonical Original
- Oxblood
- Slate & Linen
- Illuminated Jewel
- Bookshelf Spectrum

Theme selection/persistence and Study Focus integration — **automated pass**.

## Implementation plan — final disposition

### P0 — Reference/content inventory — COMPLETE
v5 learner-facing behavior, v7 integration points, curriculum IDs, and v4 editorial criteria were audited.

### P1 — Design-system/theme foundation — COMPLETE
Theme tokens, six packages, persistence, semantic-color separation, and focus-mode tokens were implemented.

### P2 — Unit 0 orientation — COMPLETE
Non-scored Unit 0 content and replayable tutorial behavior were implemented.

### P3 — Study Focus lesson shell — COMPLETE
Study Focus, route restoration, responsive composition, navigation, and scholarly apparatus were implemented.

### P4 — Golden lesson integration — COMPLETE
Unit 1 Lesson 1 was integrated without changing curriculum identity; richer challenge presentation was proven natively.

### P5 — Release-scale integration — COMPLETE FOR THIS RELEASE
The shared v7 shell/behavior was integrated across the current release surfaces. Future experience work may continue to deepen v5-quality game/visual behavior without restoring v5 runtime debt.

### P6 — Assurance/release — AUTOMATED COMPLETE; HUMAN ASSURANCE CONTINUES
Assessment, migration/state, curriculum-count, offline/PWA, sync/D1, feedback, browser, accessibility-automation, and Cloudflare production-config checks passed in authoritative CI before merge. Human/device/editorial/theological review remains separately evidenced work.

## Execution plan / WBS

See `docs/v7/project-execution-graph.json` for the typed project graph and release disposition. `dependsOn` remains the dependency model; status now distinguishes merged implementation from continuing human assurance.

## Validation evidence

The authoritative pre-merge production CI passed:

- 25 / 70 / 69 / 139 and 45 Topics validation
- Unit 0 exclusion from scored denominator
- assessment-correctness regression suite
- sync/privacy/outbox and personal-writing merge tests
- D1 user-isolation/replay/deletion tests
- feedback validation/persistence/privacy tests
- theme persistence
- Study Focus route/history/viewport behavior on covered cases
- rich challenge rendering
- Notes & Journal persistence without scored-progress mutation
- global Feedback reachability
- Chromium / Firefox / WebKit E2E
- axe serious/critical checks on covered surfaces
- offline/PWA behavior
- Cloudflare production-config validation

## Risks carried forward

- preserving v5 experience quality without restoring its bridge/runtime debt;
- preventing theme customization from remapping semantic meaning;
- keeping Study Focus spacious and legible on small/short viewports;
- preventing scholarly apparatus from becoming clutter;
- ensuring content polish does not silently change theological/historical claims;
- continuing to improve rich games where the current native rendering is still less capable than the strongest v5 interaction.

## Rollback / lineage

The release is no longer isolated on `v7-v5-polish`; it is merged to `main` at `801a9706d7cec9574ceadca7647a9f63a2b554fc`.

Historical anchors remain useful for diagnosis:
- validated assessment foundation: `267016f7f483f3de3f22e17ed8bea2868ea35b0d`
- pre-v7 main foundation: `579e64b8c189eab608c50c10a94f8190b59269d6`
- merged v7 release: `801a9706d7cec9574ceadca7647a9f63a2b554fc`

Stale `v7-golden-slice-native` presentation work must not be merged wholesale; any future reuse should be individually reviewed against the current v7 direction.

## Continuing human-review gates

These remain quality-assurance categories unless separate evidence records them as completed:

- GATE_GOLDEN_SLICE_UX
- GATE_INDEPENDENT_VISUAL_DESIGN
- GATE_ANTI_GENERIC_DESIGN
- GATE_RESPONSIVE_DESKTOP_TABLET_PHONE
- GATE_REDUCED_MOTION
- GATE_NVDA
- GATE_VOICEOVER
- GATE_KEYBOARD_ONLY
- GATE_TOUCH_DEVICE
- GATE_ZOOM_200
- GATE_ZOOM_400
- GATE_FORCED_COLORS
- GATE_NOVICE_LEARNER
- GATE_EDITORIAL_REVIEW
- GATE_THEOLOGICAL_REVIEW
- GATE_OFFLINE_PWA
- GATE_ACCOUNT_PASSKEY_SYNC
- GATE_PRIVACY_RECOVERY

`GATE_PRODUCTION_RELEASE` was superseded for this specific merge by the project owner's explicit instruction to merge after CI readiness; this does not imply the independent human gates above were completed. Future consequential releases should again follow the then-current owner-approved gate policy.
