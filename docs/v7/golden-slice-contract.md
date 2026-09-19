# Canonical Shelf v7 — Golden Slice Contract

Status: **C0 candidate**

## Objective

Prove the v7 experience with one production-fidelity vertical slice before scaling the redesign across all 139 scored activities.

The slice must demonstrate that Canonical Shelf can feel like a premium scholarly learning environment without weakening the v6 foundation: local-first state, native routing, offline behavior, theological/editorial boundaries, stable activity IDs, and deterministic assessment semantics.

## Representative journey

The slice uses the first guided lesson, `lesson:begin` — **Begin with the central story** — because it exercises a meaningful cross-section of the product in the learner's first session:

1. Home resumes or starts the course with one dominant action.
2. Course orients the learner to the current unit and next activity.
3. `lesson:begin` becomes a scene-based lesson rather than a long document.
4. Scripture reading remains linked to the Bible reader rather than duplicated into a second reader implementation.
5. Vocabulary, historical context, deeper reasoning, reflection, and model response remain available without competing with the current scene.
6. The lesson's three authored challenge structures remain intact:
   - sequence — reconstruct the proclamation;
   - match — decode the vocabulary;
   - argument map — connect textual observations, supported interpretation, and proportionate application.
7. Partial challenge success must not complete the lesson or start review scheduling.
8. Completion occurs only after all scored challenges satisfy the B assessment contract.
9. Completion activates retention state and a next-step transition.

The adjacent `mastery:n.what` activity is the mastery proof point for the slice: mastery remains distinct from lesson completion and requires authored scored success.

## Experience contract

### Home

Home answers only three questions at first glance:

- Where am I?
- What should I do next?
- Is anything due for review?

Requirements:

- one dominant continuation action;
- course progress uses `catalog.activities.length`, never a duplicated hard-coded denominator;
- completion, mastery, and review-due state remain visually distinguishable;
- Bible, Topics, and Practice remain discoverable without becoming competing hero calls to action.

### Course orientation

- retain the 25-unit linear learning path;
- expose phase/unit/activity state clearly;
- distinguish lesson, mastery, complete, current, locked/not-yet-reached where applicable, and review-due states;
- unit pages remain concise orientation surfaces rather than article pages.

### Guided lesson scene model

The golden lesson uses the following scene roles when content exists:

`Orient → Read → Explain → Visualize → Context → Practice → Feedback → Retention → Reflect → Continue`

Not every future lesson must instantiate every role. Scene structure is content-driven rather than a forced template.

Scene requirements:

- one primary cognitive task per viewport composition;
- meaningful progress indicator showing current scene and lesson progress;
- desktop/tablet/phone recomposition, not simple shrinking;
- browser back/forward remains meaningful at the lesson route level;
- scene navigation never mutates scored learner state by itself;
- content depth remains available through progressive disclosure rather than deletion;
- motion communicates state/progress only and has a reduced-motion adaptation when the user requests it.

### Learning interaction

For the golden lesson, controls should feel like learning tools rather than generic form fields.

- Sequence: direct ordering surface with explicit non-drag controls available.
- Match: visible term/definition relationship building rather than a row of unrelated selects.
- Argument map: observations, interpretation, application, and unsupported alternative remain visibly distinct.
- Hints use authored content.
- Feedback explains the evidence/reasoning through authored `why` text.
- Incorrect attempts do not erase prior demonstrated challenge success under the B state contract.
- Free reasoning, where used elsewhere, remains non-scored unless explicit authored evaluation exists.

### Retention

After full lesson completion:

- show the newly scheduled review state;
- make the 1 → 3 → 7 → 14 → 30 → 60 day model visible only where it helps the learner understand what happens next;
- Practice remains the primary home for due review, not a duplicate curriculum.

### Scripture and Guide boundaries

- Scripture links open the existing Bible destination/reader.
- The lesson does not create a second Scripture renderer.
- Ask the Guide may explain the lesson but must preserve mastery protection on scored content.
- Text, historical evidence, interpretation, doctrine, reception, and application remain distinguishable.

## Responsive composition contract

### Desktop

- reading-room/folio composition;
- primary scene occupies the dominant reading field;
- a narrow contextual rail may hold scene index, vocabulary, source/context notes, or lesson state;
- avoid dashboard-card repetition.

### Tablet

- maintain scene focus while moving context into a collapsible or adjacent secondary region;
- preserve tactile interaction sizes;
- visual relationships must remain legible without relying on hover.

### Phone

- single-scene focus;
- compact persistent scene progress/navigation may sit at the viewport edge or safe-area bottom;
- contextual material opens intentionally rather than stacking every section into one long page;
- no horizontal dependence for core reading or scoring.

## Default vs adaptive accessibility

The default presentation is the approved full-fidelity Canonical Shelf experience. Accessibility adaptations must not independently flatten the normal design.

Invisible baseline semantics, names, roles, states, focus mechanics, and adaptation hooks are required. Presentation changes activate through user/system state where applicable:

- `prefers-reduced-motion` → reduced transition path;
- forced colors → forced-color adaptation;
- zoom/text scaling → reflow when invoked;
- keyboard → `:focus-visible` and equivalent controls;
- screen reader → semantic relationships and announcements;
- touch → touch-safe interaction behavior.

## Product invariants

The slice may not change:

- 25 units;
- 70 lessons + 69 mastery = 139 scored activities;
- stable activity/mastery IDs;
- Home / Course / Bible / Topics / Practice;
- Bible ownership of shelf/browse/reader;
- Topics excluded from completion;
- Practice as reinforcement;
- local-first learner state with export/import;
- optional passkey sync/backup/recovery;
- Statement of Faith as doctrinal ceiling;
- distinction among text/history/interpretation/doctrine/reception/application.

## Automated acceptance

At minimum:

- `bun run test:assessment` passes;
- `bun run test:sync` passes;
- `bun run test:d1` passes;
- `bun run validate` passes;
- `bun run test:e2e` passes except the previously documented environment-specific skip;
- lesson completion remains all-challenge based;
- dynamic 139-activity denominator remains catalog-driven;
- all 69 mastery challenges retain deterministic authored scoring;
- no length-based reasoning auto-pass returns;
- no regression to hash routing, localStorage as active state owner, or duplicate Bible rendering.

## Human C2 approval gates

C1 does not become the scale-out reference until human review confirms:

- `GATE_GOLDEN_SLICE_UX`;
- `GATE_INDEPENDENT_VISUAL_DESIGN`;
- `GATE_ANTI_GENERIC_DESIGN`;
- `GATE_RESPONSIVE_DESKTOP_TABLET_PHONE`.

Adaptive/accessibility human gates remain required at their appropriate later verification stage and are not auto-approved by automated checks.

## Failure rule

If implementation pressure conflicts with this experience contract, simplify implementation before simplifying the approved learner experience. Architecture is allowed to become more capable when necessary to faithfully deliver the slice.