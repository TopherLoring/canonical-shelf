# Canonical Shelf — Non-Course Legacy Source Audit

Status: in progress, implementation-driving.

## Governing decision

Course remains the current v7 six-course curriculum. For every other product surface, restore the strongest useful behavior/data from the actual v2/v3/v4 implementations when technically and editorially feasible. v5 is an information-architecture reference, not the preferred capability source when earlier builds were richer.

## Source snapshots inspected

- `TopherLoring/the-canonical-shelf` commit `8ccf00ad6555178143ffc3c435a67a1a8fafc4f9`, `public/index.html` — v2/v3-origin monolithic application carried forward into v4-era integration. This is the primary recoverable source for original shelf, book metadata, reader, verse library, game engine, campaign, Arcade, translation behavior, XP/ranks/stars/achievements and portable progress concepts.
- current historical-repo `docs/v4-architecture.md` / v4 integration — confirms Practice, Explore, Verses, Bible reader, translation controls, shelf navigation and local Bible search were intended to survive the curriculum redesign.
- current v7 vendored `content/vendor/legacy/topics-data.js` and `topics-extended.js` — preserved v4 Topics/reference content.
- v5 architecture/pages — used only to map earlier capabilities into Home / Bible / Topics / Practice without restoring Explore or Verses as top-level tabs.

## Recovered capability inventory

### Bible / Explore source

Confirmed in the original app:
- proportional Old/New Testament shelf bar;
- 66 selectable book spines;
- nine canonical group colors and group filter/legend;
- active/current/learned shelf state;
- responsive shelf behavior;
- 66 authored book profiles containing: canonical number, group, chapter count, narrated setting range, approximate writing range, uncertainty marker, thematic threads, one-line hook, synopsis, authorship/source note, broad date/setting note, important people, and a recommended reading path;
- book search across name, hook, synopsis, people and group;
- rich book-detail drawer;
- full local BSB chapter reader;
- book and chapter selectors;
- previous/next chapter navigation crossing book boundaries;
- reader → book detail and detail → reader flows;
- local full-text Bible search;
- canonical order data, historical-era data, anchor events and a story-arc model.

### Translation source

Confirmed:
- BSB as default;
- KJV as a selectable translation for the curated verse-library surfaces;
- reader-supplied custom translation import;
- missing custom references fall back to BSB;
- custom translation name/credit;
- translation attribution/credit UI.

The historical snapshot does **not** provide a separate complete KJV corpus asset alongside the BSB corpus. Therefore v7 must not imply that the entire Bible reader can switch to KJV unless a distributable full-text KJV asset is deliberately added. Exact legacy behavior should be restored for curated verse surfaces first; full-reader translation switching is data-gated.

### Verse-library source

Confirmed:
- 97 curated passages;
- reference, book, themes, life-context facets, speaker, recipient, KJV wording, BSB wording and explanatory note;
- theme groupings used by the learning/game system;
- verse-to-book and verse-to-theme drills;
- fill/reconstruction/jumble interactions;
- active-translation wording on curated passages.

### Practice / Play source

Confirmed campaign structure:
- Stage 1 Order;
- Stage 2 Groups;
- Stage 3 Substance;
- Stage 4 Verses;
- 40 campaign levels in the inspected v3-era source;
- free-play Arcade;
- configurable practice scope;
- per-run feedback and missed-answer review;
- XP rewards;
- stars;
- ranks;
- achievements;
- transferable progress concepts.

Recovered game families:
- Sequence;
- Fill the Gap;
- Before or After;
- Spot the Misfit;
- Shelf Slots;
- Pairs;
- Pairs by Number;
- Sort the Shelf;
- Beat the Clock;
- Survival;
- Group Drill;
- Content Drill;
- Word Jumble (phrase);
- Word Jumble (hard/word);
- Guess the Book;
- Spot the Impostor;
- Verse Drill.

Recovered achievements in inspected source: First Folio, Perfect Pentateuch, The Twelve, Longest to Shortest, Flawless, Ten in a Row, Clockwork, Last One Standing, Unaided, The Whole Shelf, Sorter, Close Reader, Illuminator, Full Gilt.

### Topics source

v4 Topics data is already vendored in v7. The restoration should expose the existing corpus through richer discovery rather than recreating it:
- direct question/search;
- doctrine/theology;
- Christian life;
- biblical concepts;
- difficult questions;
- glossary;
- related exploration;
- Scripture references;
- related-topic links;
- evidence-aware distinctions.

### Home

The original v2/v3 app was tab-oriented rather than Home-oriented. Home therefore does not have an earlier page to copy. Its job is to compose the recovered systems into an orientation/dashboard surface: next Course work, due review, shelf/reader, Topics, Arcade/Practice, recent activity and lightweight earned-state summary.

## Restore / adapt / supersede decisions

| Legacy capability | v7 decision |
|---|---|
| interactive bookshelf | Restore natively in Bible |
| rich 66-book profiles | Restore data + native profile UI; evidence-label disputed metadata later |
| BSB reader/search | Preserve/expand current native reader |
| KJV curated verses | Restore in verse library |
| custom translation | Restore as local reader-owned data; do not mix with Course state |
| top-level Explore | Superseded; capability belongs to Bible |
| top-level Verses | Superseded; capability belongs to Bible + Practice |
| Play campaign | Restore as optional Practice journey, not curriculum |
| Arcade | Restore in Practice |
| XP/rank/stars/achievements | Restore as Practice-only secondary feedback |
| old Learn tracks | Superseded by six-course Course; do not restore |
| v4 Topics reference corpus | Preserve and expose more fully |
| old monolithic runtime | Do not restore |
| v5 bridge / MutationObserver repair | Do not restore |

## Extraction/implementation constraints

- Preserve authored source wording when migrating historical metadata; do not silently rewrite source claims during extraction.
- Claims such as authorship/dating may be contested. Preserve them as legacy source data but present evidence levels/boundaries in the new UI before public launch.
- Course completion/mastery remains owned by current learner state. Practice XP/stars/ranks/achievements must be separately namespaced/additive.
- New modules must be cacheable/offline and compatible with the current service-worker pipeline.
