# Canonical Shelf — Full Experience Restoration Audit

Status: implementation-driving, not completion evidence.

## Decision

The restoration target is the strongest recoverable learner-facing experience and capability set from v3/v4/v5, reimplemented natively in current v7 while preserving the current six-course curriculum, stable learner-state identifiers, accounts/sync, offline architecture, and current editorial/theological constraints.

The restoration is **not complete** merely because historical feature names, files, or routes exist. A capability counts as restored only when its underlying data, learner-facing presentation, interaction behavior, responsive/accessibility behavior, and relevant state/offline contracts are functional.

## Audit conclusions

### Course — strong content, incomplete experience parity

Current six-course content remains authoritative and must not be replaced. Its lesson model preserves substantial explanation, vocabulary, deeper inquiry, drawers, visuals, task-specific checks, reflection, sources, and interpretive boundaries. The primary gap is presentation and semantic rendering: historical v4 supported purpose-built visual types such as shelf, timeline, story-arc, relationship, compare, flow, theme-thread, map-lite, book-profile, verse-context, spectrum, and stack. Current rendering collapses too many visuals into generic text/image blocks.

Required: restore semantic visual renderers, richer scene composition, contextual mastery presentation, competency/retention visualization, and stronger unit/course identity without changing current curriculum IDs/content hierarchy.

### Bible — strongest restored surface, not complete

Restored: tactile 66-book shelf, nine canonical groups, rich book metadata, book profiles, reader/chapter navigation, local search, canon/timeline distinction, story arc, responsive and reduced-motion/forced-colors behavior.

Still required: learned/current shelf state integration, curated verse-library integration, translation functionality only where text/licensing permits, and stronger evidence/confidence treatment for disputed historical metadata.

### Topics — materially incomplete

The underlying topic corpus contains richer authored structures than the UI currently exposes: kind/category, aliases, tags, direct answer, multiple authored sections, Scripture references, related topics and evidence-aware distinctions. Current UI exposes only a shallow projection of that data and relies too heavily on regex-derived category grouping.

Required: render authored sections, Scripture references, aliases/discovery terms, related-topic graph, Course connections, Guide handoff, source/evidence trails where available, and search across all topic fields. Topics must function as a curated scholarly reference desk, not a card index.

### Practice — structural restoration ahead of behavioral parity

Restored: four-stage optional campaign model, 40 campaign levels, separate Practice state, XP, ranks, stars, achievements, Arcade entry and many book/order/group/substance mechanics.

Still required: actual implementation of every advertised game family, especially Word Jumble, hard jumble, verse-book, verse-theme, verse-fill/reconstruction and Verse Drill; complete timer/survival semantics; missed-answer review; 97-passage verse dataset; accurate campaign gating/results behavior. Unknown engines must never silently fall back to a different question type.

### Verse system — not restored

Historical source includes 97 curated passages with BSB/KJV wording, speaker, recipient, themes, life-context facets and explanatory notes. This remains an explicit open restoration node.

Required: restore the complete data module and use it in Bible and Practice. Do not restore Verses as a primary top-level destination.

### Home — functional composition, incomplete Canonical Shelf identity

Restored: continue learning, progress, due review, featured Topic, Bible/Practice entry, six-course progress and recent activity.

Required: integrate shelf/mastery/retention/current-study and earned Practice state where pedagogically useful; reduce generic dashboard-card dependence; make the surface feel like Canonical Shelf rather than generic SaaS.

### Guide / Theologian — functional bounded engine, incomplete evidence graph

Restored: intent classification, Scripture retrieval, Topic/Course evidence, mastery protection, doctrinal-policy boundaries and contested-language warnings.

Required: consume the full Topics sections/references, book metadata, verse library, source trails and richer cross-mode evidence graph.

### Search — incomplete indexing

Required: index topic aliases/sections/refs, lesson bodies/vocabulary/deeper content, Bible book metadata, verse-library metadata and relevant source/reference relationships. A material portion of the perceived data loss is data that exists but is no longer discoverable.

### Visual identity — partial

Bible has again become recognizably Canonical Shelf. Home, Course, Topics and parts of Practice still rely too heavily on bordered cards, pills, generic grids and simple progress bars.

Required: carry the scholarly editorial × tactile library × advanced interactive learning identity across the product using semantic motifs such as folios, marginalia, shelf position, manuscript layers, study apparatus, evidence maps, timeline structures and mastery/retention states. Do not mechanically apply bookshelf styling to unrelated concepts.

### Parity validation — currently insufficient

Current validator is useful as a structural smoke test but cannot prove parity because it primarily checks strings, files and counts.

Required: behavioral/data-contract assertions for real engine dispatch, Topic field accessibility, Bible profile/reader continuity, verse-library completeness, Practice state and missed-answer behavior, Course semantic visual dispatch, responsive/accessibility behavior and offline availability.

## Implementation order

1. Topics full-data accessibility and reference presentation.
2. Complete verse dataset and Practice verse/game mechanics.
3. Course semantic visual renderer system and richer scene composition.
4. Remaining Bible state/translation/evidence work.
5. Unified Search + Guide evidence graph.
6. Product-wide visual identity/recomposition pass.
7. Behavioral parity suite, responsive/accessibility/offline assurance.
8. Merge only after the restoration branch satisfies these gates.

## Curriculum invariant

No restoration task may overwrite, downscope, renumber, or reorganize the current six-course curriculum unless explicitly approved as a curriculum change. Historical v3/v4/v5 curriculum is a reference for detail depth, learning-object composition, interaction quality, information architecture and visual pedagogy—not the current curriculum source of truth.
