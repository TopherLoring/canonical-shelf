# Canonical Shelf — Full Experience Restoration Audit

Status: merged restoration baseline on `main`; follow-through remains active for current-state visual polish, learner-feedback remediation, editorial review, and QA.

## Decision

The restoration target remains the strongest recoverable learner-facing experience and capability set from v2/v3/v4/v5, reimplemented natively in current v7 while preserving the current six-course curriculum, stable learner-state identifiers, account/sync, offline architecture, and editorial/theological constraints.

A capability counts as restored only when its underlying data, learner-facing presentation, interaction behavior, relevant state/offline contracts, and accessibility alternative are functional. File names or feature labels alone are not completion evidence.

PR #11 (`experience/restore-v5-parity`) merged into `main` on September 20, 2026. It is now historical implementation provenance, not an active delivery branch. New restoration follow-through must start from current `main`.

## Corrected historical finding

The earlier audit repeated a stale historical comment describing a 97-passage verse library. Inspection of the actual v3 `VERSES` array established that the recoverable source contains **232 curated passages**. The current runtime contains all 232 with BSB/KJV wording, speaker, recipient, themes, life-context facets, contextual notes, filtering, pagination, reader/search links, custom curated-passage wording, and Practice integration.

## Current surface status

### Course — current curriculum preserved; historical interaction depth substantially restored

The current six-course curriculum remains authoritative and `content/curriculum/**` is read-only for restoration work unless an explicit curriculum change is approved. Current lessons retain substantive explanation, vocabulary, deeper inquiry, drawers, sources, reflection, and task-specific checks.

Restored learner-facing architecture includes viewport Study Focus scenes, scene rail/progress, scholarly apparatus, rich challenge boards, and the historical semantic visual taxonomy: shelf, timeline, story-arc, relationship, compare, flow, theme-thread, map-lite, book-profile, verse-context, spectrum, and stack. The existing `learning-visuals.js` / `learning-visuals.css` pair owns this renderer layer and provides text equivalents, reduced-motion behavior, and forced-colors support.

Remaining Course work is polish rather than lost curriculum recovery: strengthen contextual mastery presentation and course/unit identity without changing curriculum hierarchy, IDs, or authored content.

### Bible — functional restoration substantially complete

Restored:
- tactile 66-book shelf and nine canonical groups;
- group filtering and rich book search;
- 66 authored book profiles;
- book/profile/reader continuity;
- complete local BSB chapter reader;
- previous/next navigation across book boundaries;
- local Scripture search;
- canon-versus-chronology distinction, eras, anchors, story arc, and thematic metadata;
- learner-visible current/learned shelf states;
- links into the restored curated passage system;
- responsive, reduced-motion, and forced-colors treatment.

The remaining Bible gate is editorial confidence/sourcing treatment for disputed authorship, dating, and reconstructed chronology before public launch. The current profiles already distinguish traditional attribution, broad orientation, uncertain dating, and a source-boundary note; this requires final editorial review rather than deleting the historical detail.

A complete alternate full-reader KJV mode is data-gated: the historical source provides KJV wording for the curated passage library, not a verified complete distributable KJV reader corpus in the current restoration source. The product must not imply otherwise.

### Topics — authored reference depth restored

Topics exposes and searches the historical authored structure rather than a shallow card projection:
- kind/category;
- aliases/search language;
- tags;
- direct answers;
- authored sections;
- Scripture references;
- related-topic traversal;
- Course connections;
- glossary;
- Guide handoff;
- full-field reference search.

Topics remains unscored and does not create parallel curriculum completion.

### Practice — historical breadth restored as reinforcement

Restored:
- four-stage, 40-level optional campaign;
- Arcade/free play;
- Sequence, Fill the Gap, Before/After, Spot the Misfit, Shelf Slots, Pairs, Sort the Shelf, Beat the Clock, Survival, Group Drill, Content Drill, Word Jumble, Hard Jumble, Guess the Book, Spot the Impostor, Verse Book, Verse Theme, Verse Fill, and Verse Drill behavior;
- XP, seven ranks, stars, 14 achievements, streak and missed-answer state;
- configurable canon/group scopes;
- timer and survival semantics;
- mastery replay and spaced-review doorway without duplicating Course completion.

Practice progression remains separately namespaced from Course learner state.

### Curated passage system — restored with corrected 232-passage scope

The 232-passage library is available under Practice and linked back into Bible/search. It supports BSB and KJV wording for the curated set, custom reader-supplied wording for that set, theme/life/book/speaker/recipient facets, contextual notes, pagination, chapter links, and verse-specific Practice engines. Verses do not return as a top-level destination.

### Search — restored shared study index

The active Search route indexes and presents visibly distinct evidence domains across:
- Scripture;
- complete Topic fields including aliases/sections/references;
- Course lesson title/objective/body/plain-language/deeper/vocabulary/drawers;
- glossary;
- 66-book metadata;
- all 232 curated passages.

Search hands synthesis questions to the Guide without flattening the evidence types.

### Guide / Theologian — restored shared evidence graph

The Guide consumes the shared study index and can surface Scripture, full Topics, Course lessons, book profiles, curated passages, glossary entries, and scholarly source metadata. It retains mastery-answer protection, Statement-of-Faith authority boundaries, interpretive-rule labeling, and specific contested-language cautions.

### Home — restored state composition; dedicated identity layer fixed

Home combines current Course progress, due review, next activity, six-course progress, recent activity, Bible shelf state, current book, learned books, Practice rank/XP/stars/achievements, featured Topic, and direct study entry points.

A missing `/home-experience.css` asset was identified during the restoration audit and restored. Home has a dedicated Canonical Shelf-specific visual layer including the miniature canonical shelf/current-book state rather than relying solely on generic dashboard cards. The asset is part of the offline shell.

### Visual identity — substantially restored, final consistency pass remains

Bible, Course Study Focus, semantic learning visuals, Practice, Topics/Search reference surfaces, and Home each have product-specific visual grammar. The final design pass should evaluate cross-surface hierarchy and remove residual repeated generic-card treatments where they weaken the scholarly editorial × tactile library × advanced learning identity. The goal is coherence, not forcing every surface into a bookshelf metaphor.

## Validation state

Structural validation checks 66 book profiles, Bible learned/current state, full Topic fields, the shared Search/Guide graph, all 232 recovered passages, implemented Practice engine families, the 40-level campaign, and all twelve semantic Course visual types.

The Playwright restoration parity suite includes learner-visible checks for:
- the 66-book shelf and profile-to-reader continuity;
- authored Topic sections and Scripture references;
- cross-domain search;
- semantic Course visuals and text equivalents;
- the 232-passage Verse Library and translation controls;
- Guide evidence handoff;
- preservation of the five primary destinations.

Automated green status is necessary but not sufficient. Pre-launch still requires final cross-browser/mobile visual review, keyboard/touch/reduced-motion/forced-colors checks, offline verification, state/export/import migration checks, editorial review of disputed historical metadata, and novice usability review unless a later owner decision explicitly changes those gates.

## Remaining implementation order

1. Complete the product-wide visual hierarchy/recomposition review and remove residual generic/repetitive treatments where they weaken Canonical Shelf identity.
2. Complete Bible historical-metadata confidence/source review without deleting useful profile depth.
3. Run the full automated verification suite after consequential changes, including learner-visible restoration parity tests, and fix actual failures.
4. Verify learner-state compatibility, offline caching, desktop/tablet/mobile recomposition, keyboard/touch/reduced-motion/forced-colors behavior.
5. Treat PR #11 and its source branch as historical merged provenance. Do not revive or merge stale restoration branches; branch new work from current `main` and apply current owner-precedence decisions.

## Curriculum invariant

No restoration task may overwrite, downscope, renumber, or reorganize the current six-course curriculum unless explicitly approved as a curriculum change. Historical v3/v4/v5 curriculum remains reference material for detail depth, organization, learning-object composition, interaction quality, information architecture, and visual pedagogy—not the current curriculum source of truth.
