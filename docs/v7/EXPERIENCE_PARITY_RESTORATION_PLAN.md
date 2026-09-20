# Canonical Shelf v7 — Experience Parity Restoration Plan

## Objective

Restore the strongest learner-facing experience across **Home, Bible, Topics, Practice, and the shared application shell** from the actual v2/v3/v4 implementations wherever feasible, while keeping the current v7 runtime, six-course curriculum, learner-state model, account/sync architecture, theology safeguards, and offline-first foundation.

**Course is the exception:** Course remains the current six-course v7 curriculum and scene-based learning system. Earlier Course/Learn implementations are reference material only for interaction quality, not content or hierarchy.

## Source precedence

For **non-Course** product behavior, use this order:

1. **v2/v3 actual shipped implementation** — primary source for the original bookshelf, Explore/book profiles/reader, local Bible search, translation switching/import, verse library, Play/campaign/Arcade/game engines, XP/ranks/stars/achievements, progress portability, and the tactile visual language.
2. **v4 actual implementation and architecture** — primary source for capabilities explicitly retained while the curriculum changed: Practice, Explore, Verses, Bible reader, translation controls, shelf navigation, local Bible search, Topics/reference desk, offline behavior, and accessibility fixes.
3. **v5** — information-architecture reference for assigning those earlier capabilities to Home / Bible / Topics / Practice and avoiding obsolete top-level Explore/Verses tabs.
4. **v7** — runtime/architecture foundation and source of current state, routing, sync, Guide, Notes & Journal, Feedback, PWA, accessibility, and six-course Course.

Do **not** use v5 as the source of truth when v2/v3/v4 contain a richer real implementation. Do not restore old bridge architecture, stacked runtimes, whole-body MutationObserver repair, duplicated state, or legacy tab chrome.

## Confirmed earlier non-Course capabilities to restore

### Shared application experience
- signature visual canon shelf with interactive book segments, group coloring, group filters/legend, learned/current states, hover/focus book labels, and responsive behavior;
- global/local Bible search;
- persistent translation utility;
- BSB and KJV switching where the required text assets can be shipped legally;
- reader-supplied translation slot/import with explicit licensing responsibility and fallback behavior;
- translation attribution/credit surface;
- progress/profile access;
- local-first portable progress/export/import;
- XP/rank/mastery/achievement surfaces where they support Practice and retention rather than replacing Course mastery;
- mobile-safe header/navigation and reduced-motion/forced-colors behavior;
- current v7 Guide, account/sync, Notes & Journal, Feedback, PWA status, and accessibility systems remain.

### Home
Earlier releases did not have the current Home destination, so Home is a v7/v5 composition surface that exposes the restored earlier capabilities:
- continue learning and next Course activity;
- course/progress overview;
- review-due state;
- quick access to the interactive Bible shelf/reader;
- Practice/Arcade entry;
- featured Topic;
- recent lessons, passages, Topics and practice activity;
- earned rank/achievement summary where available.

### Course
Course remains **v7 six-course architecture**:
- six-course roadmap;
- unit state and progress;
- multi-scene lesson cards;
- drawers/glossary/apparatus;
- integral game-style checks;
- unit mastery, course capstones and spaced retention;
- no restoration of legacy Learn tracks as parallel curriculum.

### Bible — restore from v2/v3/v4
- interactive 66-book bookshelf, not merely a grid/list;
- canonical group colors and filters;
- Old/New Testament visual proportion and shelf orientation;
- searchable books using book title, people, summary and group metadata;
- rich 66-book profiles/drawer with original metadata where available;
- chapter count and chapter navigation;
- complete local Bible reader;
- previous/next chapter across book boundaries;
- direct book-profile → reader navigation and reader → book-profile navigation;
- local full-text Bible search;
- canonical order browsing;
- timeline/chronology exploration kept distinct from shelf order;
- BSB/KJV/custom translation behavior where assets/data allow;
- current Bible route owns all of this; Explore does not return as a primary tab.

### Topics — restore v4 reference depth, retain v5/v7 IA
- Ask/search;
- Theology & doctrine;
- Christian life;
- Biblical concepts;
- Difficult questions;
- Glossary;
- Related exploration;
- category/filter discovery;
- topic relationships and related traversal;
- Scripture connections;
- Course connections;
- Guide handoff;
- source/evidence trails where available;
- unscored reference only.

### Practice — restore the v2/v3 game system as native v7 reinforcement
Practice must recover the useful original game breadth, not a three-card menu.

Restore/adapt, where data supports them:
- Sequence;
- Fill the Gap;
- Before or After;
- Spot the Misfit;
- Shelf Slots;
- Pairs / Pairs by Number;
- Sort the Shelf;
- Beat the Clock;
- Survival;
- Group Drill;
- Content Drill;
- Word Jumble (phrase and hard/word modes);
- Guess the Book;
- Spot the Impostor;
- Verse Drill;
- campaign/challenge chains where pedagogically useful;
- free-play Arcade;
- configurable OT / NT / group / whole-canon scope;
- review of missed answers;
- XP/ranks/stars/achievements as secondary reinforcement signals;
- transferable/local progress compatibility where feasible.

Practice remains reinforcement: its game progression must not become a second curriculum or override Course mastery/retention state.

### Verses — restore inside Bible and Practice, not as a top-level tab
- curated verse/passages library from the earlier app where source data is recoverable;
- theme facets/categories;
- book/theme identification practice;
- verse reconstruction/jumble;
- active translation wording;
- Scripture-reader links;
- no separate primary Verses destination.

## Acceptance criteria

1. v2/v3/v4 are explicitly audited as the source of truth for every non-Course capability before declaring parity.
2. Home / Course / Bible / Topics / Practice remain the only primary product destinations.
3. Current six-course Course remains authoritative.
4. Bible regains the original shelf, book-profile, reader, navigation, search, canon and chronology capabilities.
5. Practice regains the earlier game breadth and free-play capability without creating parallel curriculum completion.
6. Topics retain/restore the v4 reference corpus and richer discovery/relationship surfaces.
7. Translation controls restore BSB/KJV/custom behavior only when text/licensing assets support it; no false availability claims.
8. Existing activity IDs, learner progress, review schedule, export/import and account-sync compatibility remain valid.
9. Rich interactions provide keyboard/non-drag equivalents and reduced-motion behavior.
10. No v5 bridge runtime, old application tab bar, stacked runtimes, duplicated learner state, or MutationObserver repair architecture is restored.
11. Automated tests cover every restored non-Course capability family, route isolation, offline operation and state compatibility.

## Invariants

- six-course curriculum remains current;
- generated activity counts remain catalog-derived, not hard-coded ceilings;
- inherited stable activity IDs remain stable;
- 1 → 3 → 7 → 14 → 30 → 60 review scheduling remains available;
- Bible owns shelf/reader;
- Topics are unscored;
- Practice is reinforcement;
- local-first guest/offline use remains first-class;
- optional account/passkey sync remains additive;
- Statement of Faith remains the doctrinal ceiling;
- disputed interpretations remain evidence-labeled;
- public-launch human gates remain deferred during pre-launch development but are not considered passed.

# Implementation Plan

## Phase 0 — source audit and extraction
- audit actual v2/v3 `public/index.html` and related assets for non-Course UI/data/behavior;
- audit v4 for retained non-Course capabilities and Topics integration;
- map every original feature to Home, Bible, Topics, Practice or shared shell;
- classify each as restore intact / adapt natively / superseded / impossible because source asset unavailable;
- extract reusable book metadata, verse metadata, game definitions, translation metadata and achievement/rank rules into v7-native modules.

## Phase 1 — shared shell + state-adjacent utilities
- restore translation utility and attribution;
- add reader-supplied translation storage without contaminating learner mastery state;
- restore recent-activity and Practice gamification state as additive local state;
- restore learner progress/profile composition;
- improve responsive header/navigation composition.

## Phase 2 — Home + Course
- complete Home using current Course state plus restored Bible/Practice/Topics entry points;
- enrich Course overview only; do not replace v7 lessons/content.

## Phase 3 — Bible
- restore the original shelf interaction model natively;
- restore original book-profile metadata and drawer/detail experience;
- restore books/groups filters and rich search;
- restore complete reader navigation;
- restore translation switching/custom import;
- restore canon vs chronology/timeline exploration;
- integrate verse-library entry points.

## Phase 4 — Topics
- retain current route but restore v4 reference categorization, search, glossary, relationships and source trails;
- cross-link into Bible and Course without scoring.

## Phase 5 — Practice + Verses
- reimplement the earlier game engine family as v7-native Practice primitives;
- restore free-play Arcade and useful campaign/challenge-chain concepts;
- restore XP/ranks/stars/achievements as secondary Practice state;
- restore themed verse library and verse games inside Practice/Bible;
- integrate review-due items and Course mastery replay.

## Phase 6 — assurance + polish
- E2E coverage for each restored feature family;
- state/export/import migration tests;
- desktop/tablet/mobile recomposition;
- keyboard/touch/reduced motion/forced-colors checks;
- offline/service-worker coverage for restored assets;
- verify no legacy bridge/runtime debt entered v7.

# Execution Plan / WBS

| ID | Work | Depends on | Output |
|---|---|---|---|
| E0.V2V3_AUDIT | actual v2/v3 non-Course inventory | — | source-of-truth capability matrix |
| E0.V4_AUDIT | v4 retained non-Course inventory | E0.V2V3_AUDIT | retention/supersession matrix |
| E0.EXTRACT | extract book/verse/game/translation/gamification data | E0.V2V3_AUDIT,E0.V4_AUDIT | v7-native data modules |
| E0.CONTRACTS | route/state/translation/recent/gamification contracts | E0.EXTRACT | stable interfaces |
| E1.SHELL | translation + progress/profile + responsive utilities | E0.CONTRACTS | restored shared shell |
| E1.RECENT | cross-mode recent activity | E0.CONTRACTS | local recent history |
| E1.PRACTICE_STATE | additive XP/rank/star/achievement state | E0.CONTRACTS | non-curriculum gamification state |
| E2.HOME | dashboard/next/review/shelf/featured/recent/rank | E1.SHELL,E1.RECENT,E1.PRACTICE_STATE | complete Home |
| E2.COURSE | six-course overview polish only | E1.SHELL | complete Course overview |
| E3.BIBLE_MODEL | original shelf/book/profile/translation/verse metadata | E0.EXTRACT | Bible view model |
| E3.BIBLE_UI | shelf/books/profiles/reader/search/translation/timeline | E3.BIBLE_MODEL,E1.SHELL | restored Bible |
| E4.TOPICS | v4 reference discovery/glossary/relationships | E1.SHELL | restored Topics |
| E5.GAME_ENGINE | native v7 game primitives from v2/v3 | E0.EXTRACT,E1.PRACTICE_STATE | reusable Practice engine |
| E5.PRACTICE | review + games + Arcade + mastery replay | E5.GAME_ENGINE,E2.COURSE | restored Practice |
| E5.VERSES | themed verse library + verse games | E0.EXTRACT,E5.GAME_ENGINE,E3.BIBLE_UI | restored verse capability |
| E6.STYLES | tactile library/game visual system + responsive motion | E2.HOME,E3.BIBLE_UI,E4.TOPICS,E5.PRACTICE | coherent premium UI |
| V.PARITY | v2/v3/v4 non-Course feature assertions | E6.STYLES | parity evidence |
| V.STATE | current state + additive practice-state compatibility | E5.PRACTICE | state evidence |
| V.ACCESS | keyboard/touch/reduced-motion/axe/forced-colors | E6.STYLES | accessibility evidence |
| V.OFFLINE | restored asset/service-worker regression | E6.STYLES | offline evidence |
| R.PRELAUNCH | pre-launch merge | V.PARITY,V.STATE,V.ACCESS,V.OFFLINE | merge-ready branch |

## Risks

- **Accidentally recreating the old monolith:** extract concepts/data and reimplement native modules; do not copy the single-file runtime wholesale.
- **Gamification competing with learning:** XP/stars/ranks/achievements are Practice feedback, never Course completion or theological scoring.
- **State duplication:** Course mastery remains in the current learner state; Practice gamification is additive and separately namespaced.
- **Book-profile historical claims:** preserve original authored metadata where useful, but evidence-label disputed authorship/date claims before public launch.
- **Translation licensing:** bundle only texts the project can legally distribute; custom imports remain the reader’s responsibility.
- **Mobile utility crowding:** responsive recomposition, not shrinking.

## Rollback

All work remains on `experience/restore-v5-parity` until automated pre-launch gates pass. Main remains the rollback anchor. Restored non-Course state must be additive and removable without corrupting Course progress.