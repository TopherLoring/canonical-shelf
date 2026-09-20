# Canonical Shelf v7 — Design Intent Delta

## Status

**Implemented baseline on `main`.** The v7 V5-polish release was merged as `801a9706d7cec9574ceadca7647a9f63a2b554fc` after the authoritative automated production CI passed. This artifact remains the active design-intent reference for the merged experience.

Independent human visual, novice-learner, device, editorial, theological, and adaptive-access review remain continuing assurance activities unless separate evidence records them as completed. Their absence must not be retroactively represented as automated approval.

## Direction

Canonical Shelf v7 is a **premium visual and interaction polish of the v5 product model**, rebuilt on the cleaner v7 architecture. It is not a separate visual product and it is not an architecture-led simplification of v5.

The target experience is:

> **v5 product structure and learning flow × v4 scholarly depth × luxury editorial study environment × tactile interactive library**

## What remains recognizable from v5

- Home / Course / Bible / Topics / Practice as the five primary destinations.
- Course as a 25-unit integrated journey rather than a collection of skill-track tabs.
- Bible as the home of the bookshelf, reader, book profiles, canonical groups, chapters, and timeline/context exploration.
- Topics as a curated reference environment.
- Practice as reinforcement rather than a second curriculum.
- Dense, useful learner-facing information rather than architecture-driven reduction.
- Rich learning interactions where the cognitive task warrants them.

## What is deliberately elevated

- stronger editorial typography and hierarchy;
- more tactile paper/folio surfaces and purposeful depth;
- theme-aware semantic motion;
- viewport-aware lesson scenes rather than long generic documents;
- persistent mastery/progress state presentation;
- scholarly passage apparatus that exposes evidence and limits without cluttering the reading surface;
- responsive recomposition across desktop, tablet, phone, and short landscape viewports;
- richer task-specific challenge boards instead of generic form controls;
- coherent user-selectable aesthetic packages.

## Study Focus

Starting a guided lesson transitions the current theme into a darker, concentrated **Study Focus** state. The rest of the application recedes; the lesson expands into a large elevated folio that remains comfortably inside the viewport.

Study Focus is an intensified state of the selected site theme, not a second visual language.

### Composition contract

- dark outer chrome remains visibly related to the current theme;
- a light folio occupies most, but not all, of the usable viewport;
- the folio has a lesson/unit-specific header rather than global site navigation;
- scene/progress state is visible without dominating the reading surface;
- Previous / Notes / progress / Continue occupy reserved footer space and never cover content;
- Exit lesson restores the originating Course surface and visual state;
- no bookshelf-category stripe or arbitrary category color decorates the lesson card.

### Overflow hierarchy

When space narrows, resolve pressure in this order:

1. fluid typography and media sizing;
2. tighter—but still comfortable—spacing;
3. reduced secondary chrome;
4. accordion collapse of secondary scholarly material;
5. relocation of secondary material to drawer/sheet;
6. primary-content scrolling only when the viewport remains physically too small.

The interface must not simply shrink desktop or create multiple competing scroll panes.

## Scholarly apparatus

The apparatus should feel like useful marginalia in a serious study edition, not a generic right sidebar.

It may expose:

- textual and translation notes;
- manuscript evidence where materially relevant;
- original-language observations where they clarify meaning;
- historical and literary context;
- evidence strength and explicit limits;
- responsible competing interpretations;
- reception history;
- doctrine, clearly labeled as doctrine rather than direct textual observation;
- application, clearly separated from interpretation;
- citations, external scholarship, and further reading.

The governing sequence is:

> **Text → evidence/history → interpretation → reception → doctrine → application**

Not every passage needs every layer. Density follows the material.

## Aesthetic packages

Themes are complete design-system packages rather than palette swaps. They may vary palette, font pairing, surface treatment, rules, elevation, focus chrome, control styling, diagram treatment, and restrained motion character.

Current packages:

1. Heritage
2. Canonical Original
3. Oxblood
4. Slate & Linen
5. Illuminated Jewel
6. Bookshelf Spectrum

Bible category colors remain semantic and are not arbitrarily remapped by themes.

## Annotated mood / reference board

| Reference | Keep | Avoid / reinterpret |
| --- | --- | --- |
| **Canonical Shelf v5** | five-destination IA, Course journey, Bible ownership of bookshelf, useful density, rich interaction ambition | legacy bridge/runtime debt, stacked compatibility layers, any generic/unfinished visual treatment |
| **Canonical Shelf v4** | adult scholarly voice, substantive explanatory depth, Simply/Deeper layering, vocabulary, evidence limits, source trails | using v4 as a competing application architecture |
| **Tactile scholarly book / study Bible** | paper hierarchy, marginalia, rules, folio framing, measured typography, source apparatus | faux-antique decoration, skeuomorphism for its own sake |
| **Contemporary digital museum/editorial product** | confident composition, meaningful typography scale, layered surfaces, focused transitions | giant empty hero space, generic marketing bento cards, decorative motion |
| **Interactive learning environment** | retrieval, manipulation, immediate explanatory feedback, mastery/retention state | form-like quizzes as the default, fake reward currency, animation disconnected from learning |
| **Original Canonical Shelf bookshelf palette** | category colors as semantic library/navigation cues | painting lesson surfaces with shelf colors merely for decoration |

## Motion language

Motion communicates relationship, state, progress, or causality.

- entering Study Focus: originating lesson affordance yields to the dark focus environment and folio;
- changing scene: quiet directional/state transition, not slideshow spectacle;
- challenge manipulation: tactile state response tied to the learner’s action;
- mastery/retention: completion and review state changes become legible;
- exiting Study Focus: folio recedes and the originating Course context returns.

System/user reduced-motion preference receives the adaptive alternative; the default experience retains full semantic motion.

## Anti-generic test

A design choice fails if it could be dropped unchanged into an unrelated SaaS dashboard, generic LMS, or AI chat product without losing meaning.

Repeated visual treatments must map to Canonical Shelf concepts: folio, shelf, marginalia, source apparatus, canonical grouping, study state, mastery/retention, textual evidence, or navigation.

## Assurance posture after merge

The design intent above is implemented in the current v7 baseline. Automated tests verify structural and interaction contracts but do not substitute for independent visual judgment or human usability review. Future design changes should continue to be evaluated against this artifact, the current owner decisions, and `DECISION_PRECEDENCE.md`; if the owner changes the direction, the newer decision governs after the conflict protocol is applied.
