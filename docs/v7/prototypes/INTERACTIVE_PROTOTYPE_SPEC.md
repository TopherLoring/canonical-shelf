# Canonical Shelf v7 Interactive Prototype Specification

## Purpose

The prototype gate must be satisfied with actual interactive, browser-runnable prototypes rather than image-only concept boards. These prototypes are evaluation artifacts, not production UI. No production surface may adopt one direction until the human decision-maker has interacted with all three and selected, combined, or rejected them.

## Required directions

Three materially distinct directions are required:

- **A — Living Library**: tactile library/book metaphor, dark walnut/ink atmosphere, gilt progress, shelf-led Bible navigation, lesson-as-folio, scholar-desk Theologian.
- **B — Scholarly Folio**: light editorial/scholarly composition, typography-led hierarchy, restrained surfaces, syllabus/folio lesson architecture, research-desk Theologian.
- **C — Scripture Atlas**: spatial/relational navigation, deep atlas palette, journey/timeline language, exploratory Bible/topic relationships, contextual Theologian.

These directions may share underlying sample content and state, but must differ materially in navigation model, information architecture, composition, interaction framing, and content presentation—not merely palette.

## Required demo surfaces

Every direction must provide the same evaluable surfaces:

1. Home
2. Learn / Course
3. Lesson
4. Practice
5. Bible
6. Topics
7. Theologian

## Required interactions

The prototypes must be runnable today using only static HTML/CSS/JavaScript and existing Canonical Shelf deployment capabilities. They must include:

- direction switching A/B/C without losing current demo page;
- primary navigation among all seven surfaces;
- course unit/lesson selection;
- lesson scene navigation with at least one interactive knowledge check and apparatus/context expansion;
- practice challenge interaction with submit/feedback/state change;
- Bible shelf/book selection using the complete 66-book Protestant canon list;
- Topics category/filter selection and an expandable topic article;
- a working Theologian question form with suggested prompts and deterministic prototype responses showing the intended answer architecture (answer, evidence, competing readings when relevant, limits, and follow-up actions);
- responsive recomposition for desktop, tablet, and phone widths;
- keyboard-usable native controls and visible focus states;
- no production learner-state mutation, account mutation, feedback submission, or remote model/API calls.

## Prototype-only Theologian behavior

The Theologian in these demos is intentionally a deterministic interactive simulation. It must accept submitted questions so the interaction can be evaluated, but it must clearly disclose that production conversational inference is not connected in the prototype. The production implementation decision remains separate and requires the selected UX plus the model/provider architecture.

## Shared sample state

All three directions should show the same learner state so visual/interaction differences are comparable:

- Unit 1 active: **The Story and Its Setting**
- Lesson 2 active
- 1 lesson complete
- unit progress approximately 33%
- 139 scored activities total
- 25 scored units
- 45 unscored Topics
- at least one review/practice item due

## Evaluation dimensions

Human selection should compare:

- clarity of next action;
- perceived quality and Canonical Shelf identity;
- learning flow and cognitive orientation;
- Scripture/content readability;
- ability to understand progress/mastery/retention;
- quality of Bible browsing;
- quality of Topics reference use;
- Theologian discoverability and answer comprehension;
- responsive behavior;
- implementation plausibility without reducing the demonstrated experience.

## Production gate

Prototype implementation is allowed because prototypes are the required pre-production decision artifact. Production UI coding remains blocked until the human decision-maker explicitly selects a direction or an intentional hybrid and the Design Intent Artifact is updated with that choice.