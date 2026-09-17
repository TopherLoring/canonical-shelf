# Canonical Shelf v6 — Clean-Core Replatform

Status: **active design and implementation on `v6` branch only**.

## Release rule

Do not merge to `main` or deploy a v6 runtime until the v6 acceptance gates are complete. The legacy application remains production/reference only while v6 is developed independently.

## Director governing rule

v6 is a **greenfield product architecture with audited migration of approved intellectual property, content, identifiers, and learner state**.

Legacy material is a migration candidate, never a default requirement. Before an inherited asset, interaction, algorithm, content structure, or implementation pattern enters v6, apply this test:

> Would the Director-led specialist bench choose this for a brand-new Canonical Shelf today under the v6 quality standards?

- **Yes:** migrate, normalize, or refine it.
- **No:** redesign, rewrite, replace, or retire it.

Historical presence alone is not evidence for preservation. Compatibility may justify preserving stable identifiers and learner data, but must not force legacy runtime, UX, information architecture, pedagogy, content organization, or technical debt into v6.

## Product invariants

- One self-paced 25-unit curriculum.
- 70 guided lessons + 69 mastery requirements = 139 scored activities.
- Stable activity/mastery identity independent from curriculum sequence.
- Five primary destinations: Home, Course, Bible, Topics, Practice.
- Bible owns canonical bookshelf/browse/reader experiences.
- Topics remain curated reference content and do not count toward course completion.
- Practice reinforces learning but does not create a second curriculum.
- The core learning experience must remain usable without mandatory sign-in and must preserve offline-first operation. Optional identity/accounts, authenticated backup, and cross-device progress sync are permitted when they improve learner continuity without making network access a prerequisite for core study.
- Core Bible, Course, Topics, Practice, progress, search, and export/import remain usable offline.
- Learner progress is local-first, migratable from legacy state, and may optionally synchronize across devices when an account is used.
- The Statement of Faith is the normative ceiling for Canonical Shelf doctrinal claims.
- LGBTQ people are fully included under the Statement of Faith; orientation is not inherently sinful; faithful same-sex relationships and marriage may embody Christian virtue; LGBTQ identity does not bar Christian participation or leadership.
- Competing Christian interpretations are represented accurately without allowing an external view to silently replace Canonical Shelf's stated position.
- The product distinguishes textual evidence, historical context, interpretation, doctrine, reception history, and application.

## Identity and synchronization posture

Accounts are **not prohibited** and are not assumed to be mandatory. The Director should evaluate identity and synchronization as a separate architecture concern using these constraints:

- guest use remains first-class;
- offline study and local progress remain functional without authentication;
- signing in may enable cross-device synchronization, recovery, and authenticated backup;
- account introduction must not create unnecessary collection of learner or theological-query data;
- synchronization must use an explicit conflict-resolution and versioning model rather than last-write-wins by accident;
- local export/import remains available as a portable backup and migration path;
- privacy, deletion, account recovery, and offline reconciliation become release-blocking requirements if accounts are implemented.

## Migration classes

### Eligible for audited migration

- curriculum intellectual property and learning objectives;
- stable learner-facing identities needed for continuity;
- Scripture corpus and verified book metadata;
- Topics and source material;
- Statement of Faith and theological/editorial safeguards;
- learner progress/history through a versioned migration path;
- individual mastery/evaluation algorithms that independently meet v6 standards.

### Never inherit by default

- legacy curriculum sequencing or content organization;
- old interaction patterns or assessment UX;
- single-file application substrate;
- DOM relocation/repair architecture;
- whole-body mutation-observer coordination;
- v4/v5 bridge layers and adapters;
- parallel CSS systems;
- text/DOM discovery for application routing;
- fragmented progress/state ownership;
- non-atomic service-worker executable updates;
- content encoded primarily as executable UI JavaScript;
- any legacy implementation whose only justification is compatibility or prior existence.

## Development slices

1. Doctrinal constitution and LGBTQ evidence policy.
2. Curriculum resequencing and prerequisite/spacing model.
3. Canonical knowledge architecture.
4. Bounded Theologian runtime.
5. Topics + global Search redesign.
6. Bible + Theologian integration.
7. Practice/recommendation integration.
8. Offline/privacy/model architecture.
9. Assurance and red-team suite.
10. Application implementation, audited migration, and cutover readiness.
11. Optional identity, authenticated backup, and cross-device synchronization if approved by Director architecture review.

## Acceptance gates before merge/deploy

v6 is not releasable until all gates pass, including audited-migration provenance, content accounting, lossless learner-state migration, one authoritative progress domain, doctrinal traceability, accessibility, browser, offline/update, schema, migration, visual, performance, security, and release-governance checks. If accounts or synchronization are implemented, identity security, privacy/deletion, conflict resolution, offline reconciliation, recovery, and cross-device continuity are additional release-blocking gates.
