# Canonical Shelf v7 — Full Experience Restoration

## Status
Active corrective program. This supersedes any assumption that earlier “v5 polish” work established actual learner-facing parity merely because structural or CI checks passed.

## Objective
Restore the strongest learner-facing capabilities, information architecture, content/detail presentation, visual identity, interaction richness, and learning ergonomics from Canonical Shelf v3/v4/v5 inside the current native v7 architecture.

## Source repositories and precedence

### Current authority
`TopherLoring/canonical-shelf`
- `main` is authoritative for current architecture, six-course curriculum, current IDs, learner state, account/passkey sync, offline/PWA behavior, current theology/editorial policy, and current production contracts.
- Historical/unmerged branches such as `experience/restore-v5-parity`, `fix/v7-visible-shell-restoration*`, and `v7-design-overhaul-prototypes` are implementation/reference sources only and must be reconciled against current `main` before use.

### Historical product reference
`TopherLoring/the-canonical-shelf`
- earlier v3/v4 implementation history;
- `curriculum-v4-redesign` for scholarly depth, assessment breadth, content organization, and learning presentation;
- `v5-application-experience` and `v5-complete-experience` for principal product flow, visual identity, dynamic learning scenes, Bible/library identity, page organization, progress/practice behavior;
- `main` and specialist branches such as `mobile-bible-experience`, `bookshelf-density-walkthrough-polish`, and `learning-progress-reader-polish` for later historical refinements.

Historical versions are references, not rollback targets. Do not restore bridge architecture, stacked runtimes, whole-body MutationObservers, duplicate state ownership, or obsolete top-level navigation.

## Preservation boundary — current curriculum is canonical
This restoration MUST NOT replace, regress, reorder, or silently rewrite the current curriculum update.

Preserve:
- current six-course model;
- current 44-unit structure;
- current guided lessons, mastery activities, course capstones, placement, and stable IDs;
- current authored bridge lessons and current curriculum semantics;
- current retention/state semantics;
- local-first guest progress and export/import;
- optional passkey sync/backup/recovery;
- current Statement of Faith ceiling and theology policy;
- current production/offline infrastructure.

Historical curriculum is a **quality/depth/presentation reference**. v3/v4/v5 lesson organization, scholarly layering, reading level, explanations, diagrams, vocabulary, timelines, comparison structures, assessment variety, and scene composition should be used to deepen/present the current curriculum where they improve it. Historical curriculum data must never overwrite current canonical curriculum source files wholesale.

## Restoration scope

### Global product identity
- tactile scholarly-library identity rather than generic SaaS/content-site presentation;
- strong editorial typography, semantic Bible/group color, layered surfaces, physical-library motifs, purposeful motion and progress;
- responsive recomposition for desktop/tablet/phone;
- visible learning, mastery, retention, and review state;
- coherent themes without arbitrary decoration.

### Home
- current learning state and next meaningful action;
- six-course path/progress;
- review-due state;
- Bible shelf/reader access;
- Practice/Arcade entry;
- featured Topic and recent activity;
- secondary rank/achievement summary where pedagogically useful.

### Course
Current six-course content/IDs remain authoritative, while v3/v4/v5 are used to restore:
- stronger course/unit/activity information architecture;
- viewport-aware scene composition rather than flat document scrolling;
- dynamic scene roles and progressive disclosure;
- richer diagrams/timelines/comparison/context/evidence panels;
- original scholarly/adult detail depth where the current lesson is thinner;
- richer mastery interactions and feedback;
- visible unit/course/mastery/review state;
- continuity between course map, unit view, activity, feedback, retention, and return state.

No legacy Learn track becomes a second curriculum.

### Bible
- signature interactive 66-book shelf;
- locked nine-group color taxonomy and OT/NT composition;
- rich searchable book metadata;
- 66 book profiles with orientation/synopsis, chapter count, themes, people/context, authorship/date/setting evidence boundaries, reading paths, deeper questions, interpretive disagreement and textual/translation notes where supportable;
- complete local reader, local search, cross-book previous/next chapter navigation;
- profile ↔ reader continuity;
- canonical order versus chronology/timeline exploration;
- translation attribution and only those translation modes supported by distributable text assets;
- verse-library capabilities owned by Bible/Practice rather than a separate primary tab.

### Topics
Restore the historical reference-desk depth while keeping Topics unscored:
- Ask/search;
- Theology & doctrine;
- Christian life;
- Biblical concepts;
- Difficult questions;
- Glossary;
- related exploration;
- categories/facets, relationships and traversal;
- Scripture and Course links;
- evidence/source trails;
- text/history/interpretation/reception/doctrine/application distinctions;
- Guide handoff.

### Practice
Restore active reinforcement breadth rather than a flat menu:
- due review and mastery replay;
- Sequence;
- Fill the Gap;
- Before/After;
- Spot the Misfit / Impostor;
- Shelf Slots;
- Pairs / Pairs by Number;
- Sort the Shelf;
- Beat the Clock;
- Survival;
- Group and Content drills;
- Word Jumble;
- Guess the Book;
- Verse Drill/reconstruction;
- optional campaign/challenge chains and free-play Arcade;
- OT/NT/group/whole-canon scope where appropriate;
- missed-answer review;
- XP/ranks/stars/achievements only as secondary Practice feedback, never Course completion.

### Guide / Theologian
- preserve current bounded theology policy;
- restore richer conversational/study presentation and contextual continuity;
- answer-first, then evidence, limits, position when relevant, related exploration;
- keep text, evidence/history, interpretation, reception, doctrine and application distinguishable;
- never leak scored mastery answers.

### Search / orientation / progress / utility surfaces
- richer cross-mode search and navigable results;
- onboarding/tutorial remains replayable and non-scored;
- progress/profile becomes a useful learner-state surface, not merely an export control;
- recent activity and return context;
- Notes/Journal, Feedback, account/sync and appearance systems remain integrated.

## Implementation plan
1. **Inventory and reconciliation** — audit both repos and historical branches; classify every capability as restore, adapt, supersede, or reject.
2. **Recover proven unmerged work** — selectively port `experience/restore-v5-parity` onto current `main`; preserve current-main-only commits and curriculum.
3. **Bible/library restoration** — native shelf, profiles, reader continuity, chronology/search and metadata.
4. **Home/Topics/Practice restoration** — dashboard, reference desk, historical game breadth, recent/progress state.
5. **Course depth/organization restoration** — preserve current curriculum data while applying historical scene organization, scholarly depth, visual learning and interaction richness.
6. **Guide/search/global identity** — unify product surfaces under the restored Canonical Shelf visual system.
7. **Assurance** — curriculum-isolation diff, state compatibility, content/theology review, responsive/visual/motion/a11y/offline/performance validation.

## Execution plan / WBS
- F0.1 Audit both repositories and all relevant historical branches.
- F0.2 Build feature/content/interaction parity matrix by surface.
- F0.3 Freeze current curriculum source hashes/IDs/counts as a restoration guardrail.
- F1.1 Port safe shared experience modules from `experience/restore-v5-parity`.
- F1.2 Reconcile app shell/routing/bootstrap/service-worker changes with current main.
- F2.1 Restore Bible model and book-study data.
- F2.2 Restore native shelf/profile/reader/search/timeline UI.
- F3.1 Restore Home state/dashboard composition.
- F3.2 Restore Topics discovery/detail/relationship depth.
- F3.3 Restore Practice engine, game families and secondary reinforcement state.
- F4.1 Audit each current Course lesson/unit against v3/v4/v5 depth and organization.
- F4.2 Restore scene-level progressive disclosure, diagrams, context, evidence, vocabulary and rich interaction patterns without changing IDs or curriculum placement.
- F5.1 Restore Guide/search/progress/orientation continuity.
- F5.2 Unify visual identity and responsive recomposition across all surfaces.
- V1 Validate current curriculum source hashes/IDs/counts unchanged by experience-only phases.
- V2 Validate route/function parity and no legacy runtime debt.
- V3 Run browser/E2E/accessibility/offline/state validation.
- V4 Human visual/device/editorial/theological review on representative surfaces.

## Typed dependency graph
See `docs/v7/full-experience-restoration-graph.json`.

## Acceptance criteria
- Home / Course / Bible / Topics / Practice remain primary destinations.
- Current six-course curriculum content/IDs/placement are preserved.
- Historical Course depth and organization inform current lesson presentation without wholesale content rollback.
- Bible regains signature shelf + book profiles + reader/search/chronology capability.
- Topics regains historical reference depth/discovery and remains unscored.
- Practice regains meaningful historical game breadth and remains reinforcement.
- Guide/search/progress/orientation are coherent parts of the same premium product.
- Rich interactions have keyboard/touch/reduced-motion alternatives.
- No MutationObserver repair, stacked runtime, duplicated learner state, or old application shell is restored.
- Offline/PWA and optional account sync remain functional.
- A curriculum-isolation check proves experience restoration did not mutate current curriculum sources.

## Rollback
Experience modules and style changes are independently revertible. Curriculum source/state migrations are outside this program unless explicitly approved in a separate plan, so experience rollback must not require learner-progress migration.
