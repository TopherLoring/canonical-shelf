# Plan Delta — Questions-First Spiral Curriculum

Status: **implemented in PR #21; final integrated validation pending**

## Objective

Refine Canonical Shelf's six-course adult curriculum so difficult questions and doctrine are introduced early as motivating questions, revisited where their biblical/historical evidence naturally appears, and synthesized later with stronger interpretive tools. Preserve the six-course architecture, stable activity IDs, learner-state compatibility, Topics/Practice/Bible ownership boundaries, and the existing substantive authored curriculum.

## Product and learning outcomes

- Adult learners encounter the questions that commonly motivate Bible/theology study during Course 1 rather than discovering them only near the end.
- Course 1 explicitly explains that responsible answers often require foundations in Scripture, translation, context, biblical history, Second Temple Judaism, Jesus/early Church, and interpretation.
- Later courses visibly return to those questions with greater evidentiary and conceptual depth.
- Course 5 is **How We Know: Interpretation & Evidence** and teaches the tools used to evaluate contested claims.
- Course 6 is **Christian Theology, Traditions & Synthesis** and becomes synthesis/comparison rather than first meaningful exposure to theology or difficult questions.
- Learners can see realistic active-study time expectations for each course without conflating completion with retained mastery.
- Course-facing language distinguishes completion time from the 1 → 3 → 7 → 14 → 30 → 60 day retention cycle.

## Acceptance criteria

1. Keep exactly six courses and 44 current unit IDs.
2. Preserve every inherited activity ID; no destructive learner-state migration.
3. Add a Course 1 lesson that explicitly names major difficult questions and explains the foundations required to address them responsibly.
4. Add a reusable question-thread model spanning the curriculum.
5. Course metadata exposes active-study time ranges and learner-facing purpose statements.
6. Course 6 framing states that it synthesizes material introduced and encountered earlier.
7. Generated curriculum reference exposes course time expectations and question-thread progression.
8. Existing assessment, offline, account/sync, Bible, Topics, Practice, and design behavior remain intact unless required to surface the new metadata.
9. Automated validation asserts the new curriculum contract.

## Current target

- 6 courses
- 44 scored units
- 117 guided lessons
- 119 mastery/capstone activities
- 236 scored activities
- 12 recurring question threads
- 45 Topics outside completion

## Invariants

- Home / Course / Bible / Topics / Practice remain primary destinations.
- Bible owns shelf/browse/reader.
- Topics remain unscored reference.
- Practice remains reinforcement.
- Learner state remains local-first and stable-ID based.
- Statement of Faith remains the doctrinal ceiling.
- Understanding and reasoning are scored; theological assent is not.
- The historical/biblical bridge across Courses 2–4 remains intact.
- No v5 bridge architecture or DOM-repair debt is reintroduced.

## Implementation

1. Course-time and question-thread metadata in `content/curriculum/structure.mjs`.
2. `c1-questions-first` foundational lesson with active checks.
3. Thread IDs attached to relevant Course 1 lessons.
4. `scripts/apply-curriculum-metadata.mjs` publishes thread/timing data into the runtime catalog.
5. `scripts/generate-curriculum-reference.mjs` publishes learner/editorial timing and thread progression.
6. `scripts/validate-curriculum-spiral.mjs` validates counts, timing, thread references, stable legacy preservation, runtime publication, and Course 5/6 framing.
7. `public/orientation.js` explains the questions-first learning contract before scored study begins.
8. `AI_INSTRUCTIONS.md`, `DECISION_PRECEDENCE.md`, and generated discovery data use the same current terminology.

## Execution / WBS

| ID | Work | Status | Evidence |
|---|---|---|---|
| QS1.CONTRACT | Define spiral-learning contract and invariants | complete | this plan |
| QS2.MODEL | Add time/thread metadata | complete | `content/curriculum/structure.mjs` |
| QS3.COURSE1 | Add questions-first lesson | complete | `content/curriculum/course1-lessons.mjs` |
| QS4.SPIRAL | Map recurring questions across courses | complete | `questionThreads` |
| QS5.DOCS | Generate timing/thread reference | complete | curriculum generator |
| QS6.VALIDATE | Add contract validation and integrated CI | in final validation | curriculum validator + PR #21 CI |
| QS7.HUMAN | Editorial/theological/novice review | waived for prelaunch dev, not passed | required before public launch unless superseded |

DAG: `QS1.CONTRACT → QS2.MODEL → {QS3.COURSE1, QS4.SPIRAL} → QS5.DOCS → QS6.VALIDATE → QS7.HUMAN`.

## Risks and mitigations

- **Curriculum bloat:** one focused foundational lesson was added; the rest is cross-course metadata and framing.
- **False precision in timing:** ranges are explicitly active-study planning estimates, not mastery-duration guarantees.
- **Question fragmentation:** threads point to the same six-course curriculum rather than creating parallel mini-courses.
- **Learner-state breakage:** inherited IDs remain stable; the added lesson receives a new ID.
- **Premature theological certainty:** the questions-first lesson teaches proportional confidence and provisional answers rather than resolving every contested issue immediately.

## Rollback

Revert the questions-first integration commits. Existing learner-state records remain valid because inherited activity identities are preserved.
