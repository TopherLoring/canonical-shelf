# Canonical Shelf v7 — V5 Polish Plan Delta

## Objective

Re-center v7 on the v5 learner-facing product experience while preserving the validated v7 state/assessment foundation. v5 remains the structural and experiential reference; v4 supplies the scholarly writing quality bar. The result should feel like a polished, premium evolution of v5 rather than an architecture-led redesign.

## Locked product direction

- Preserve the five primary destinations: Home / Course / Bible / Topics / Practice.
- Preserve the 25-unit curriculum, 70 guided lessons, 69 mastery activities, 139 scored activities, and stable existing activity/mastery IDs.
- Keep Bible as the canonical home of the bookshelf, reader, book profiles, chapters, maps/timelines, and study affordances.
- Topics remains curated reference and does not count toward curriculum completion.
- Practice remains reinforcement, not a parallel curriculum.
- v5 is the principal layout/product-flow reference.
- v4 is the scholarly-content quality bar: adult reading level, substantive explanation, historical/literary context, evidence boundaries, credible competing readings, vocabulary, deeper layers, and sources where useful.
- Unit 1 Lesson 1 remains the existing first curriculum lesson, "Begin with the central story."
- Add Unit 0 Lesson 1, "Welcome to Canonical Shelf," as a non-scored onboarding/tutorial experience outside the 25-unit/139-scored-activity curriculum.
- Unit 0 teaches how to use Canonical Shelf, what the biblical canon is, library/category-vs-chronology orientation, Course/Bible/Topics/Practice, help/deeper-study surfaces, translation comparison, site tools, external sources, Practice/retention, exploration/skip-around behavior, and the transition toward independent study.
- Add first-class curated aesthetic/theme packages. Theme changes affect presentation only, never curriculum semantics, progress, assessment, or theological interpretation.
- Lesson mode uses the same design system as the main site in a more focused state: dark Study Focus chrome + elevated light folio surface.
- Lesson card must fit comfortably inside the available viewport. Resize/recompose/relocate before scrolling. Accordion/drawer behavior is preferred before scroll. Persistent lesson navigation must remain accessible without covering content.
- Typography scales with the actual lesson surface width.
- Scholarly apparatus supports textual notes, translation differences, original-language notes when useful, historical/literary context, sources, evidence strength, competing interpretations, reception, doctrine, and application while keeping those categories distinct.
- Bookshelf/category colors remain semantic to the Bible/library experience and are not used as arbitrary lesson-card decoration.
- Accessibility-driven presentation changes do not alter the universal default visual experience; adaptive paths activate through user/system settings while baseline semantic compatibility remains.

## Experience outcomes

1. A learner opening Canonical Shelf recognizes the v5 product model immediately, but with substantially higher visual polish and more coherent responsive behavior.
2. Unit 0 teaches the product by using real product surfaces rather than a detached slideshow or fake UI.
3. Starting a guided lesson transitions from Course into Study Focus without losing context; exiting returns to the previous Course visual/scroll state.
4. Primary lesson content remains the priority under viewport pressure. Secondary material collapses into accordions, then relocates to drawers/sheets, before primary scrolling is introduced.
5. Previous/Continue/navigation/progress controls remain reachable at all times and occupy reserved layout space rather than overlaying lesson content.
6. Scholarly content reads at the stronger v4 standard without flattening disputed interpretation or rewriting the curriculum into generic onboarding copy.
7. Theme packages are coherent design-system variants, persist locally, and can later sync as an optional account preference.

## Acceptance criteria

### Product and curriculum

- Home / Course / Bible / Topics / Practice remain the only primary learner destinations.
- Unit 0 is clearly separated from the scored curriculum and does not alter the 25/70/69/139 counts.
- Existing stable curriculum/mastery IDs remain unchanged.
- Unit 1 Lesson 1 remains the current first scored curriculum lesson.
- Unit 0 can be replayed without affecting completion/mastery denominators.

### Study Focus

- Entering a lesson darkens/intensifies the same theme and expands the lesson folio into focus.
- Exiting restores the originating Course route, scroll position, and normal site visual state.
- Desktop folio fits within the available viewport with comfortable outer chrome visible.
- Tablet recomposes scholarly apparatus without simply shrinking desktop.
- Mobile retains Study Focus framing and moves scholarly apparatus to an on-demand sheet/drawer.
- Accordions/drawers are used before introducing additional scroll surfaces.
- Persistent lesson nav never obscures reading/challenge content.
- Typography and spacing scale down gracefully as card/container width narrows.

### Scholarly apparatus/content

- Lesson prose uses v4-level scholarly standards while preserving v5 curriculum intent and sequence.
- Notes visibly distinguish text, historical evidence/context, interpretation, reception, doctrine, and application.
- Translation differences can be explained/compared without implying every wording difference is doctrinally significant.
- External sources and further reading can be surfaced from lessons/site where relevant.
- Competing readings are represented with evidence and limits rather than collapsed into false consensus.

### Themes

Initial curated theme contract:
- Heritage
- Canonical Original
- Oxblood
- Slate & Linen
- Illuminated Jewel
- Bookshelf Spectrum

Each package may vary palette, typography pairing, surfaces, rules, elevation, focus chrome, controls, diagrams, and motion character, but must preserve semantic status colors and content meaning. Selected theme persists locally.

## Implementation plan

### Phase P0 — Reference lock and content inventory

- Audit v5 Home/Course/Bible/Topics/Practice structure and identify concrete learner-facing behaviors to reproduce natively.
- Audit current v7 foundation routes/components/state ownership.
- Inventory current Unit 1 Lesson 1 ID/content and verify Unit 0 can be introduced without touching scored identifiers.
- Identify v4 lesson-content patterns to use as editorial quality criteria rather than as a replacement curriculum.

### Phase P1 — Design-system/theme foundation

- Introduce theme-token contract independent of semantic Bible/category colors.
- Implement theme selector and local persistence.
- Establish shared normal-site and Study-Focus tokens so lesson mode is an intensified state of the same theme.
- Add responsive/container typography primitives.

### Phase P2 — Unit 0 orientation

- Create non-scored Unit 0 content/data contract.
- Build tutorial scenes using actual product affordances and scholarly orientation content.
- Add replay/skip/continue behavior with no scored-progress side effects.

### Phase P3 — Study Focus lesson shell

- Implement enter/exit transition, viewport-fit folio, persistent navigation region, responsive recomposition, accordion/drawer-first overflow strategy, and scholarly apparatus shell.
- Restore Course route/scroll/focus state on exit.
- Keep default lesson card free of bookshelf-color decoration.

### Phase P4 — Golden lesson integration

- Integrate Unit 1 Lesson 1 into Study Focus without changing its curriculum identity.
- Polish its prose where needed to the v4 scholarly bar while preserving substantive meaning.
- Prove at least one sequence/matching/argument-style challenge through the new presentation without reducing interaction richness.

### Phase P5 — Scale-out

- Apply shell, themes, scholarly apparatus, and responsive rules across remaining Course lessons/mastery activities.
- Polish Home/Bible/Topics/Practice to the same system while preserving v5 IA.
- Reimplement desirable v5 games natively where current v7 rendering is poorer.

### Phase P6 — Independent assurance and release

- Run automated validation, migration/state tests, curriculum-count tests, offline/PWA tests, sync/account tests, and end-to-end route/lesson tests.
- Human visual, editorial, theological, novice, device, keyboard/touch, adaptive-access, offline, passkey/sync, privacy/recovery, and release gates remain human-only.

## Execution plan / WBS

See `docs/v7/project-execution-graph.json` for the typed dependency graph and machine-readable WBS. `dependsOn` is authoritative; no node may be treated as complete before its acceptance evidence exists.

## Affected systems

- `public/index.html`
- global design tokens / primary CSS
- Course/learning renderer and lesson routing
- learner-state integration for non-scored Unit 0
- theme preference persistence
- challenge presentation layer
- scholarly/reference data hooks
- service worker/offline asset list
- E2E and regression tests
- content/editorial documentation

## Validation

Required automated checks before human approval:

- 25 units / 70 lessons / 69 mastery / 139 scored activities unchanged
- stable existing activity/mastery IDs unchanged
- Unit 0 excluded from scored completion denominator
- current assessment-correctness suite green
- sync/D1 tests green
- theme persistence test
- Study Focus enter/exit restoration test
- persistent lesson-nav non-overlap test at representative viewport sizes
- responsive typography/container tests
- drawer/accordion behavior tests
- offline navigation + Unit 0 + lesson shell test
- no accidental generic radio/select downgrade for richer challenge kinds

## Risks

- Recreating v5 visually without importing its old bridge/runtime debt.
- Accidentally treating Unit 0 as a scored curriculum unit.
- Theme customization remapping semantic status/category colors.
- Excessive Study Focus chrome reducing usable reading area on small screens.
- Multiple nested scroll surfaces degrading usability.
- Scholarly apparatus becoming clutter rather than progressive disclosure.
- Content polish silently changing theological or historical claims.

## Rollback

All work remains isolated on `v7-v5-polish` until automated verification and human gates pass. The validated assessment foundation at `267016f7f483f3de3f22e17ed8bea2868ea35b0d` is the rollback anchor. Do not merge stale `v7-golden-slice-native` presentation work wholesale; reuse only individually reviewed ideas.

## Human-review gates

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
- GATE_PRODUCTION_RELEASE
