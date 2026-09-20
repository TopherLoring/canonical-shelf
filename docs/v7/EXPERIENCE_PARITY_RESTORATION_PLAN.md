# Canonical Shelf v7 — Experience Parity Restoration Plan

## Objective

Restore the major learner-facing capabilities and composition quality that existed in the strongest v5 experience across **Home, Course, Bible, Topics, Practice, and the shared application shell**, while keeping the current v7 six-course curriculum, learner-state model, account/sync architecture, offline runtime, theology safeguards, and native routing.

This is **not** a port of v5 implementation. v5 is the experience/reference source; v7 remains the runtime foundation. Do not restore the old bridge architecture, stacked runtimes, DOM repair layers, or whole-body MutationObserver approach.

## Product outcome

Every primary destination must again feel like a complete product mode rather than a thin wrapper around one engine. The application should recover the strongest v5 capabilities while improving them for the current six-course architecture.

## Experience parity inventory

### Shared shell
Restore or strengthen:
- persistent Home / Course / Bible / Topics / Practice navigation;
- global search with Scripture-reference routing and non-reference discovery across Topics, glossary, Course, and Bible;
- translation control as a persistent utility surface;
- learner progress/profile access distinct from account/sync;
- recent-activity tracking across Course, Bible, and Topics;
- responsive mobile recomposition rather than a compressed desktop header;
- current Notes & Journal, Feedback, Ask the Guide, account/sync, PWA status, and accessibility behavior remain intact.

### Home
Restore the original question: **Where am I and what should I do next?**
Required surfaces:
- continue learning;
- current progress visualization;
- suggested next activity;
- Explore Scripture entry;
- featured Topic;
- Practice entry with review-due state;
- recent local activity across lessons/passages/topics;
- six-course roadmap/progress summary appropriate to the new curriculum.

### Course
Preserve the current multi-scene lesson renderer and six-course curriculum, while restoring the richer journey/navigation experience:
- six-course roadmap and progress state;
- unit cards with scope, activity counts, completion/mastery/review-due status;
- clear current/next activity;
- course-level progress visualization;
- lesson/mastery distinction without creating parallel tracks;
- glossary access;
- visible retained/mastered/review-due states;
- rich lesson scenes, drawers, apparatus, game-style checks, unit mastery, and course capstones remain first-class;
- avoid flat text lists as the dominant overview.

### Bible
Restore Bible as a full study/navigation mode rather than only a grouped book list and reader:
- signature interactive bookshelf;
- books & canonical groups;
- book profiles;
- chapter navigation;
- Bible reader;
- canon-order exploration;
- chronology/timeline exploration distinct from shelf order;
- local Scripture search;
- current reader behavior preserved;
- Bible owns all shelf/browse/reader interactions.

### Topics
Restore the seven intentional entry modes:
- Ask / search;
- Theology & doctrine;
- Christian life;
- Biblical concepts;
- Difficult questions;
- Glossary;
- Related exploration.

Also restore:
- category/filter discovery;
- topic detail relationships;
- related-topic traversal;
- glossary browsing/search;
- Guide handoff;
- Topic → Bible / Course / Advanced Study-style connections where data exists;
- Topics remain unscored reference.

### Practice
Restore Practice as active reinforcement rather than a three-card dashboard:
- Recommended review;
- Book & order;
- Context & interpretation;
- Themes;
- Verses;
- Games & mastery.

Practice requirements:
- review-due queue driven by learner state;
- game-style interactions rather than passive links;
- canonical order/groups drills;
- context/genre/evidence/interpretation drills;
- theme tracing;
- verse reconstruction/recognition where supported;
- mastery replay and transfer work;
- no second curriculum or duplicated completion model.

## Acceptance criteria

1. All five primary destinations expose the restored capability set above without introducing nested top-level tab bars.
2. Current six-course curriculum remains authoritative.
3. Existing activity IDs, learner progress, review schedule, export/import, and account-sync compatibility remain valid.
4. Bible owns shelf, browse, profiles, chapters, reader, and canon/timeline exploration.
5. Topics remain reference-only and do not count toward completion.
6. Practice remains reinforcement and does not create parallel course progress.
7. Global search, translation, learner progress, account/sync, Guide, Notes & Journal, Feedback, and PWA state coexist without crowding mobile layouts.
8. Rich interactions provide keyboard/non-drag equivalents and reduced-motion behavior.
9. No v5 bridge/MutationObserver/parallel-runtime debt is restored.
10. Automated tests cover route capability parity and isolation.

## Invariants

- six-course curriculum remains current;
- 116 guided lessons / current generated counts remain catalog-derived, not hard-coded ceilings;
- inherited stable activity IDs remain stable;
- 1 → 3 → 7 → 14 → 30 → 60 review scheduling remains available;
- Home / Course / Bible / Topics / Practice remain primary destinations;
- Bible owns shelf/reader;
- Topics are unscored;
- Practice is reinforcement;
- local-first guest/offline use remains first-class;
- optional account/passkey sync remains additive;
- Statement of Faith remains doctrinal ceiling;
- disputed interpretations remain evidence-labeled;
- public-launch human gates remain deferred during pre-launch development but are not considered passed.

# Implementation Plan

## Phase 0 — audit and contracts
- compare v5 reference architecture/pages against current v7 routes;
- inventory preserved, missing, and superseded capabilities;
- map old experience intent to native v7 data/state contracts;
- define recent-activity and shell-utility contracts.

## Phase 1 — shared shell foundation
- add learner progress/profile surface separate from account/sync;
- restore persistent translation utility surface with current BSB as valid default and architecture for additional available translations;
- extend global search behavior and recent-activity tracking;
- improve responsive header/navigation composition.

## Phase 2 — Home + Course
- restore dashboard composition and recent activity;
- expose six-course progress and next-action logic;
- enrich Course overview with course/unit state, mastery, retention, and review-due signals;
- preserve current Study Focus and lesson scene architecture.

## Phase 3 — Bible
- implement native shelf model and interactive visual bookshelf;
- add book-profile data derived from canonical metadata/current corpus;
- add contextual Bible landing modes: Shelf / Books / Timeline while keeping them controls within Bible;
- preserve reader and search;
- add book profile → chapter → reader navigation.

## Phase 4 — Topics + Practice
- restore Topics entry-mode map, categories, glossary, related traversal and cross-links;
- restore Practice six-mode architecture and playable reinforcement surfaces using current assessment/state primitives;
- integrate review-due and replay/transfer behavior.

## Phase 5 — assurance + polish
- update E2E parity assertions;
- test route isolation, learner-state compatibility, keyboard/touch/reduced motion, offline and service worker;
- validate all restored modes on desktop/tablet/mobile breakpoints;
- verify no legacy v5 runtime dependency or DOM-repair architecture was introduced.

# Execution Plan / WBS

| ID | Work | Depends on | Output |
|---|---|---|---|
| E0.REFERENCE_AUDIT | v5 ↔ v7 per-tab capability inventory | — | parity matrix |
| E0.CONTRACTS | recent activity, progress, translation, route-mode contracts | E0.REFERENCE_AUDIT | stable interfaces |
| E1.SHELL | global utilities + responsive shell | E0.CONTRACTS | restored shared shell |
| E1.RECENT | local recent-activity model | E0.CONTRACTS | cross-mode recent history |
| E2.HOME | dashboard/next/recent/featured/practice | E1.SHELL,E1.RECENT | complete Home |
| E2.COURSE | journey map, unit state, retention/mastery visualization | E1.SHELL | complete Course overview |
| E3.BIBLE_MODEL | shelf/profile/timeline metadata | E0.CONTRACTS | Bible view model |
| E3.BIBLE_UI | shelf/books/profiles/reader/timeline | E3.BIBLE_MODEL,E1.SHELL | complete Bible |
| E4.TOPICS | seven entry modes + glossary + relationships | E1.SHELL | complete Topics |
| E4.PRACTICE | six reinforcement modes + games | E1.SHELL,E2.COURSE | complete Practice |
| E5.STYLES | cross-route composition, responsive, motion hierarchy | E2.HOME,E2.COURSE,E3.BIBLE_UI,E4.TOPICS,E4.PRACTICE | premium coherent UI |
| V.PARITY | route capability assertions | E5.STYLES | parity evidence |
| V.STATE | learner-state/backward compatibility | E2.COURSE,E4.PRACTICE | state evidence |
| V.ACCESS | keyboard/touch/reduced-motion/axe | E5.STYLES | accessibility evidence |
| V.OFFLINE | offline/service-worker regression | E5.STYLES | offline evidence |
| R.PRELAUNCH | pre-launch merge | V.PARITY,V.STATE,V.ACCESS,V.OFFLINE | merge-ready branch |

## Risks

- **Scope regression into v5 runtime debt:** use v5 only as experience reference; implement in current modules.
- **State duplication:** one learner-state owner; no second progress model.
- **Bible metadata overreach:** distinguish canonical order, narrative chronology, and scholarly dating; do not imply one undisputed chronology.
- **Translation control without multiple bundled texts:** UI must accurately represent what is actually available; never imply a translation is bundled when it is not.
- **Practice becoming a second curriculum:** no independent completion percentage; use review/mastery/retention state only.
- **Mobile utility crowding:** responsive recomposition is required rather than shrinking all controls into one row.

## Rollback

All work occurs on `experience/restore-v5-parity`. Main remains the rollback anchor until automated pre-launch gates pass. Changes must remain additive to learner state and preserve stable activity IDs.