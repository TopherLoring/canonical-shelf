# Canonical Shelf v7 — Visual Overhaul Implementation Plan

## Objective
Re-establish Canonical Shelf as a premium Bible-learning and scholarly-reference experience using v5 as the primary experiential reference, v4 selectively for scholarly/content depth, and the current v7 runtime/state architecture as the implementation foundation.

## Current problem
The merged v7 runtime preserves important capability but the visible shell remains too close to the regressed v6 presentation: flat navigation, generic utility chrome, weak hierarchy, and insufficient expression of the shelf/library identity. The next change is therefore a site-wide experience redesign, not another local CSS patch.

## Governing design rule
No production UI code may be written for a major design decision until the Prototype Choice Gate is satisfied. For each major direction, present at least three materially distinct prototypes using representative Canonical Shelf content and critical states. Record the human-selected direction before implementation becomes eligible.

## Experience outcomes
- restore v5-level visual character, dynamic composition, interaction richness, and learning momentum;
- make the Bible shelf a signature product object rather than a decorative motif;
- make Course and Practice viewport-aware, progressive, interactive, and mastery/retention-forward;
- make Study Focus feel like a serious scholarly reading/study environment;
- make Topics feel editorial and relational rather than a generic card list;
- integrate Guide/Theologian, notes/journal, account/sync, search, feedback, and offline state into one coherent product language;
- preserve current learner-state, IDs, offline behavior, account/sync capability, and theological/editorial distinctions.

## Prototype gate
The first gate covers the global visual/interaction architecture and must include at least three materially different concepts. Each prototype must show, at minimum:
1. Home / global shell;
2. Course progression surface;
3. Lesson / Study Focus state;
4. Bible shelf or browse state;
5. desktop and phone composition logic, with tablet implications documented.

Prototype comparison criteria:
- Canonical Shelf specificity and memorability;
- end-user comprehension and navigational clarity;
- learning momentum, mastery/retention visibility, and activity affordance;
- scholarly credibility and reading quality;
- responsiveness/recomposition;
- capability fit for Bible, Course, Topics, Practice, and Study Focus;
- implementation risk and reversibility;
- offline/performance implications;
- compatibility with accessible/adaptive paths without flattening the default experience.

## Invariants
- 25 scored units; 70 lessons + 69 mastery = 139 scored activities;
- stable activity/mastery IDs;
- Home/Course/Bible/Topics/Practice remain primary product modes;
- Bible owns shelf/browse/reader;
- Topics remain unscored reference;
- Practice remains reinforcement;
- Unit 0 orientation remains non-scored;
- learner state remains local-first with export/import and optional sync;
- Statement of Faith remains doctrinal ceiling;
- text/history/interpretation/doctrine/reception/application remain distinguishable;
- no v5 bridge architecture, DOM hacks, whole-body observers, or parallel legacy runtime restoration.

## Implementation strategy after selection
Implement in coherent experience slices rather than isolated style patches:
1. design tokens, typography, material system, global shell;
2. Home + Course progression;
3. Lesson/Study Focus scene architecture;
4. Bible shelf/browse/reader;
5. Practice + retention feedback;
6. Topics + Guide/Theologian integration;
7. utility/system surfaces;
8. responsive/adaptive refinements;
9. motion and final craft pass.

Each slice must preserve current functionality and state contracts, receive rendered visual review, and pass applicable functional/experience validation before the next broad slice proceeds.

## Acceptance criteria
- human selects one prototype direction or an explicitly documented hybrid;
- selected direction has a Design Intent Artifact and responsive composition rules;
- no production redesign code precedes selection;
- implementation materially improves the visible experience without removing current capability;
- desktop/tablet/phone recomposition is deliberate;
- final product no longer resembles generic SaaS/dashboard styling;
- validation covers function, visuals, interaction, responsive behavior, offline state, learner-state safety, content/theology integrity, and applicable access paths.

## Rollback
Prototype work is non-production. After implementation begins, each experience slice is isolated so the previous stable main can be restored without learner-state migration or content loss.