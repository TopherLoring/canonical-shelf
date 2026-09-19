# Canonical Shelf v7 — Design Intent Artifact

Status: **L0 candidate**

## Design thesis

**The Living Folio**

Canonical Shelf should feel like a serious scholarly reading room that has learned the affordances of a premium interactive product. The visual system should borrow the authority, density, tactility, and hierarchy of a critical edition or museum reading table without becoming nostalgic, theatrical, or skeuomorphic.

The learner is not moving through a dashboard. They are moving through a curated body of text, evidence, interpretation, and practice. Interfaces should therefore feel **edited, placed, indexed, and handled** rather than merely contained in cards.

The signature visual equation is:

**scholarly editorial design × tactile library × contemporary museum interpretation × advanced interactive learning**

## Experience principles

### 1. A page has a center of gravity

Each viewport composition should have one obvious intellectual task. A lesson scene, Bible chapter, Topic article, or Practice challenge should dominate its frame. Secondary controls support the task instead of competing with it.

### 2. Depth comes from hierarchy, not decoration

Use typography, proportion, rules, inset surfaces, marginalia, index marks, and controlled depth before adding gradients, glass, pills, or repeated cards.

### 3. Canonical Shelf motifs have product meaning

- **Shelf / spine** → canonical location and book identity.
- **Folio** → guided reading/learning scene.
- **Marginalia** → contextual note, source, definition, caution, or interpretive limit.
- **Index tab** → place within course, book, topic, or scene sequence.
- **Rule / rubric** → structural separation and argument hierarchy.
- **Gilt/accent line** → priority, current state, or canonical identity; not generic decoration.
- **Annotation mark** → evidence status or interpretive note.

Repeated treatments must retain hierarchy. Not every surface becomes a folio, card, tab, or badge.

## Visual language

### Palette

The base should read as warm paper and dark ink rather than a generic beige theme.

Primary families:

- parchment / vellum neutrals for reading surfaces;
- near-black brown ink for long-form reading;
- oxblood for scholarly emphasis and current-position cues;
- deep verdigris/forest for retained/mastered/progress states;
- restrained gilt/brass for rare ceremonial or canonical accents;
- cool blue reserved primarily for focus/interaction semantics where useful.

Color is semantic before decorative.

### Typography

Use a literary serif for reading, major headings, and display moments; use a modern grotesk/sans for controls, metadata, progress, and labels.

The hierarchy should feel like an edited publication:

- display/title;
- scene title;
- dek/lede;
- body;
- marginal note;
- rubric/eyebrow;
- metadata/index.

Avoid oversized type simply to create visual drama. Scale should follow reading role.

### Geometry

Default geometry is disciplined and mostly rectilinear.

- narrow radii only where tactility or touch affordance benefits;
- hairline rules and inset borders over floating card stacks;
- shadow only where a surface genuinely floats, slides, or layers;
- asymmetric editorial compositions are encouraged when they improve hierarchy.

## Annotated reference board

This board uses **reference archetypes**, not copied site layouts. Each reference has a specific job.

| Reference archetype | What to borrow | What not to borrow | Canonical Shelf application |
| --- | --- | --- | --- |
| Critical-edition Bible / scholarly monograph | typographic hierarchy, notes, apparatus separation, disciplined measure | cramped academic density, tiny type | lesson body, evidence notes, source/context rail |
| Museum object label + gallery wall | restrained hierarchy, interpretive sequence, confidence in whitespace | sterile white-cube emptiness | Orient/Context/Visualize scenes |
| Archival folio / manuscript spread | page proportion, marginal notes, index marks, material warmth | faux-aged textures, literal parchment simulation | scene shell and section dividers |
| Library card / catalog system | indexing, identifiers, taxonomy, concise metadata | retro novelty | unit/activity metadata, Bible book identity |
| Premium editorial long-form | pacing, strong opening composition, image/text choreography | endless article scroll | Home hero and Read/Explain scene composition |
| Modern data-storytelling | progressive disclosure, stateful explanatory graphics | generic dashboard charts | timelines, argument maps, theme threads |
| Tactile game/learning surface | direct manipulation, visible state change, satisfying completion | toy-like gamification | Sequence, Match, Evidence, Argument interactions |

## Golden-slice composition

### Home — "Reading desk"

The home view should feel like arriving at a prepared desk, not opening a dashboard.

Composition:

- left/dominant: current course position and one continuation action;
- right/secondary: progress and review state as quiet indexed facts;
- lower region: three portals — Bible, Topics, Practice — differentiated by role rather than identical cards.

Home must avoid a four-card/bento dashboard feel.

### Course — "Index and path"

Course should communicate sequence and state with an editorial index language.

- 25 units remain visible as a coherent path;
- unit number is an index marker, not decorative numerology;
- current activity is visually unmistakable;
- lesson vs mastery vs completed vs review-due use shape/type/state distinctions, not a rainbow of badges.

### Guided lesson — "Living folio"

Desktop composition:

- narrow left scene index / lesson progress;
- primary folio reading field;
- optional right marginalia rail when context warrants it;
- bottom/edge scene transition control.

The folio is not a rounded card. It is the main reading field created through measure, inset rules, subtle surface shift, and page-like composition.

Tablet:

- primary folio remains dominant;
- rails collapse into intentional drawers/inline context regions;
- scene controls remain persistent but less spatially expensive.

Phone:

- one scene occupies the viewport flow;
- compact progress remains visible;
- secondary material opens on demand;
- next/back controls respect safe areas and do not obscure text.

## Scene visual grammar

### Orient

Large but restrained lesson title, objective, reading reference, estimated intellectual shape (e.g. `Read · Context · 3 checks · Reflect`). Establishes purpose without dumping the lesson.

### Read

Scripture reference and excerpt/link relationship dominate. The learner should know what text anchors the scene and how to open it in Bible.

### Explain

Editorial reading measure with one or two paragraphs at a time. Supporting terms can appear as marginal notes rather than a glossary block consuming the page.

### Visualize

Use authored/derived structural evidence: sequence, timeline, relationship, compare, shelf, argument. Visuals exist to make a relationship visible, not to decorate.

### Context

Historical/cultural/genre context uses marginalia and evidence labels to distinguish observation from reconstruction or interpretive proposal.

### Practice

The interaction becomes the center of the composition. The reading field recedes. Each interaction should use direct manipulation and clear state, with non-drag alternatives where appropriate.

### Feedback

Feedback is explanatory and attached to the learner's action. Correctness is not celebrated with confetti; the reward is clarity, demonstrated progress, and visible mastery/retention state.

### Retention

Show what was retained and when it returns. The spaced-review model should feel like a scholarly study plan, not a streak mechanic.

### Reflect

Private writing/reflection may be visually quieter and never represented as scored correctness unless authored evaluation exists.

### Continue

Give the learner closure: what they just established, current course state, and the next meaningful action.

## Interaction language for the golden lesson

### Sequence

- movable statement strips on a reading-table surface;
- order numbers update visibly;
- pointer drag where available;
- explicit up/down controls remain available;
- submit/check is separate from manipulation.

### Match

- terms and meanings appear as two structured columns or a responsive pairing field;
- selected source and target states are explicit;
- relationships remain visible after pairing;
- avoid a stack of selects.

### Argument map

- node types are visibly distinct: observation, interpretation, application, unsupported alternative;
- supported links are the task;
- the unsupported alternative remains present so evidential restraint is part of the learning objective;
- keyboard/non-pointer path uses source → target selection.

## Motion thesis

Motion communicates **place, causality, and state**.

Use motion for:

- scene transition direction;
- reordering/pairing confirmation;
- progress advancement;
- opening contextual marginalia;
- completion/retention state change.

Do not use idle floating, decorative parallax, continuous shimmer, gratuitous reveal animation, or motion that delays reading.

When `prefers-reduced-motion` is active, preserve hierarchy and state change while removing spatial/animated transitions.

## Anti-generic constraints

Do not default to:

- bento dashboards;
- repeated rounded cards;
- pill-heavy navigation;
- glass/blur as a brand motif;
- giant empty hero whitespace;
- generic purple/blue gradients;
- floating AI assistant orb aesthetics;
- every metric rendered as a badge;
- all content placed inside visually identical containers.

Modern patterns remain available when they serve a specific Canonical Shelf function.

## Accessibility adaptation posture

The visual default remains full fidelity. Baseline semantics and focus mechanics are built into the implementation but do not flatten the presentation.

Adaptations activate where requested/needed:

- reduced motion through system preference;
- forced colors through system mode;
- zoom/reflow when invoked;
- keyboard focus through active keyboard navigation / `:focus-visible`;
- screen-reader semantics without a separate default visual layout;
- touch-safe controls based on input environment.

## Design acceptance questions

A human reviewer should be able to answer yes to all of these before C2 approval:

1. Does this feel unmistakably like Canonical Shelf rather than a premium generic learning app?
2. Is the learner's current intellectual task obvious within two seconds?
3. Does the design preserve adult reading depth while reducing scroll fatigue?
4. Do interactive challenges feel more like tools for reasoning than form controls?
5. Does responsive behavior recompose the experience rather than merely stack it?
6. Is motion meaningful rather than decorative?
7. Are Bible/library motifs used semantically rather than as themed ornament?
8. Does the default experience retain visual richness while adaptive paths remain available?
9. Could this visual grammar scale to Course, Bible, Topics, Practice, and Guide without forcing them into one repetitive component pattern?

## Decision

Proceed with this design thesis for the golden slice. Any later material visual-direction change requires a Design Intent Delta before implementation.