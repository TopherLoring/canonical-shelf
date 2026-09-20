# Canonical Shelf v6 — Clean-Core Replatform

> **Historical document.** v6 supplied the clean architectural foundation that v7 now builds on, but it is no longer the active product/release-governance baseline. Current product direction, decisions, plans, and execution state live under `docs/v7/` and the repository root README. This document is retained to preserve v6 design/architecture history.

Historical status at the time of this document: **active design and implementation on `v6` branch only**.

## Historical release rule

At the v6 stage, the rule was: do not merge to `main` or deploy a v6 runtime until the v6 acceptance gates were complete. This rule is preserved here as historical context and does not override later v7 owner decisions or `docs/v7/DECISION_PRECEDENCE.md`.

## Director governing rule

v6 established a **greenfield product architecture with audited migration of approved intellectual property, content, identifiers, and learner state**.

The exact governing formulation retained for validator/provenance continuity was:

> **Legacy material is a migration candidate, never a default requirement.**

Before an inherited asset, interaction, algorithm, content structure, or implementation pattern entered v6, the governing test was:

> Would the Director-led specialist bench choose this for a brand-new Canonical Shelf today under the v6 quality standards?

- **Yes:** migrate, normalize, or refine it.
- **No:** redesign, rewrite, replace, or retire it.

Historical presence alone was not evidence for preservation. Compatibility could justify preserving stable identifiers and learner data, but not forcing legacy runtime, UX, information architecture, pedagogy, content organization, or technical debt into the clean core.

## v6 product baseline at that stage

- One self-paced 25-unit curriculum.
- 70 guided lessons + 69 mastery requirements = 139 scored activities.
- Stable activity/mastery identity independent from curriculum sequence.
- Five primary destinations: Home, Course, Bible, Topics, Practice.
- Bible owns canonical bookshelf/browse/reader experiences.
- Topics remain curated reference content and do not count toward course completion.
- Practice reinforces learning but does not create a second curriculum.
- Core learning remains usable without mandatory sign-in and preserves offline-first operation.
- Learner progress is local-first and may optionally synchronize when an account is used.
- The Statement of Faith is the normative ceiling for Canonical Shelf doctrinal claims.
- Competing Christian interpretations are represented accurately without silently replacing Canonical Shelf's stated position.
- Textual evidence, historical context, interpretation, doctrine, reception history, and application remain distinguishable.

These items informed v7 but are no longer to be read as immutable constraints; current baselines are governed by the v7 decision-precedence protocol.

## Identity and synchronization posture established in v6

- guest use remains first-class;
- offline study and local progress remain functional without authentication;
- signing in may enable cross-device synchronization, recovery, and authenticated backup;
- account introduction must not create unnecessary collection of learner or theological-query data;
- synchronization uses explicit conflict-resolution/versioning rather than accidental last-write-wins behavior;
- local export/import remains available as portable backup/migration;
- privacy, deletion, recovery, and offline reconciliation require explicit validation when accounts are enabled.

## Migration classes

### Eligible for audited migration

- curriculum intellectual property and learning objectives;
- stable learner-facing identities needed for continuity;
- Scripture corpus and verified book metadata;
- Topics and source material;
- Statement of Faith and theological/editorial safeguards;
- learner progress/history through a versioned migration path;
- individual mastery/evaluation algorithms that independently meet quality standards.

### Never inherit by default

- legacy single-file application substrate;
- DOM relocation/repair architecture;
- whole-body mutation-observer coordination;
- v4/v5 bridge layers and adapters;
- parallel CSS systems;
- text/DOM discovery for application routing;
- fragmented progress/state ownership;
- non-atomic service-worker executable updates;
- content encoded primarily as executable UI JavaScript;
- any legacy implementation whose only justification is compatibility or prior existence.

## Historical v6 development slices

1. Doctrinal constitution and evidence policy.
2. Curriculum resequencing and prerequisite/spacing model.
3. Canonical knowledge architecture.
4. Bounded Theologian runtime.
5. Topics + global Search redesign.
6. Bible + Theologian integration.
7. Practice/recommendation integration.
8. Offline/privacy/model architecture.
9. Assurance and red-team suite.
10. Application implementation, audited migration, and cutover readiness.
11. Optional identity, authenticated backup, and cross-device synchronization.

## Current pointer

For the active v7 state, use:

- `README.md`
- `docs/v7/DECISION_PRECEDENCE.md`
- `docs/v7/PLAN_DELTA_V7_V5_POLISH.md`
- `docs/v7/DESIGN_INTENT_DELTA_V5_POLISH.md`
- `docs/v7/project-execution-graph.json`
