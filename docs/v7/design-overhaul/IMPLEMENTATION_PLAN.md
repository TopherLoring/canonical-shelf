# Canonical Shelf v7 — Visual Overhaul Implementation Plan

## Objective
Re-establish Canonical Shelf as a premium Bible-learning and scholarly-reference experience using the current v7 runtime/state architecture while recovering the strongest experiential qualities from the earlier Canonical Shelf work.

## Human-selected visual baseline
The global visual language is now selected from the Living Folio lesson prototype screenshot. This decision applies to the entire product, not only lesson interiors:
- near-black / espresso application canvas;
- warm ivory editorial study surfaces;
- restrained oxblood, bronze, and gilt accents;
- literary serif display typography paired with compact utilitarian labels;
- thin architectural rules and restrained rounding instead of generic card/pill repetition;
- a clear hierarchy of application environment → scholarly object → contextual apparatus;
- viewport-aware composition with dense but subordinate marginal information;
- motion and progressive disclosure inside a stable scholarly stage.

This visual baseline is fixed for the next prototype gate. The next decision is page composition, not theme direction.

## Current problem
The merged runtime preserves important capability, but the visible product still lacks a coherent site-wide expression of Canonical Shelf. Earlier prototypes also over-coupled visual language and page composition, forcing the user to choose an entire system when the strongest direction is a hybrid.

## Governing design rule
No production UI code may be written for a major design decision until the Prototype Choice Gate is satisfied. For each unresolved major composition decision, present at least three materially distinct, implementable interactive prototypes using representative Canonical Shelf content and states. Record the human-selected composition before implementation becomes eligible.

## Composition-lab gate
Hold the selected visual language constant and provide three implementable composition choices for each major surface:
1. Home — reading-room dashboard / current-volume focus / library overview;
2. Learn — course volume / visual progression path / volume + mastery map;
3. Lesson — selected Living Folio baseline with three layout refinements inside that language;
4. Bible — full shelf / shelf + book desk / shelf-to-reader transformation;
5. Practice — challenge stage / retrieval desk / mastery sequence;
6. Topics — archival index / reading table / relationship explorer;
7. Theologian — research desk / conversation + evidence rail / multi-pane investigator.

The lab must allow the user to mix choices across surfaces and record a selection summary. The choices must differ materially in information architecture or interaction, not merely color or decoration.

## Experience outcomes
- one coherent dark editorial-library environment across the entire product;
- lessons retain the selected warm Living Folio / marginal apparatus composition;
- the Bible shelf remains a signature object;
- Course and Practice remain progressive, interactive, and mastery/retention-forward;
- Topics feel editorial and relational rather than a generic card grid;
- Theologian feels like a native scholarly research workspace rather than a bolted-on chatbot;
- responsive behavior recomposes rather than merely shrinking;
- current learner-state, content, offline, account/sync, and theology/editorial contracts remain unchanged by prototype work.

## Prototype comparison criteria
- Canonical Shelf specificity and memorability;
- end-user comprehension and navigational clarity;
- learning momentum and mastery/retention visibility;
- scholarly credibility and reading quality;
- responsiveness/recomposition;
- capability fit for each product mode;
- implementation risk and reversibility;
- offline/performance implications;
- compatibility with adaptive/access paths without flattening the default experience.

## Implementation strategy after surface selections
Implement in coherent experience slices rather than isolated style patches:
1. design tokens, typography, material system, global shell;
2. Home + Learn composition;
3. Lesson/Study Focus scene architecture;
4. Bible shelf/browse/reader;
5. Practice + retention feedback;
6. Topics + Theologian;
7. utility/system surfaces;
8. responsive/adaptive refinements;
9. motion and final craft pass.

Each slice must preserve current functionality and state contracts, receive rendered visual review, and pass applicable functional/experience validation before the next broad slice proceeds.

## Acceptance criteria
- the selected Living Folio screenshot language is used as the site-wide baseline;
- three materially different interactive composition choices exist for every unresolved major surface;
- the human may select a different composition for each surface;
- selected choices and rationale are recorded before production implementation;
- no production redesign code precedes those selections;
- desktop/tablet/phone recomposition is deliberate;
- validation covers function, visuals, interaction, responsive behavior, offline state, learner-state safety, content/theology integrity, and applicable access paths.

## Rollback
Prototype work remains isolated from production. After implementation begins, each experience slice remains independently revertible without learner-state migration or content loss.
