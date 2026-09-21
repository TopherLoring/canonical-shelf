# Plan Delta — Questions-First Spiral Curriculum

## Objective

Refine Canonical Shelf's six-course adult curriculum so difficult questions and doctrine are introduced early as motivating questions, revisited where their biblical/historical evidence naturally appears, and synthesized later with stronger interpretive tools. Preserve the six-course architecture, stable activity IDs, learner-state compatibility, Topics/Practice/Bible ownership boundaries, and the existing substantive authored curriculum.

## Product and learning outcomes

- Adult learners encounter the questions that commonly motivate Bible/theology study during Course 1 rather than discovering them only near the end.
- Course 1 explicitly explains that responsible answers often require foundations in Scripture, translation, context, biblical history, Second Temple Judaism, Jesus/early Church, and interpretation.
- Later courses visibly return to those questions with greater evidentiary and conceptual depth.
- Course 6 becomes synthesis and comparison rather than the first meaningful exposure to theology or difficult questions.
- Learners can see realistic active-study time expectations for each course without conflating completion with retained mastery.
- Course-facing language distinguishes completion time from the 1 → 3 → 7 → 14 → 30 → 60 day retention cycle.

## Acceptance criteria

1. Keep exactly six courses and all existing unit IDs.
2. Preserve every inherited and current activity ID; no destructive learner-state migration.
3. Add a Course 1 lesson that explicitly names major difficult questions and explains the foundations required to address them responsibly.
4. Add a reusable question-thread model spanning all six courses.
5. Course metadata exposes active-study time ranges and a concise learner-facing purpose statement.
6. Course 6 framing states that it synthesizes material introduced and encountered earlier.
7. Generated curriculum reference can expose course time expectations and question-thread progression.
8. Existing assessment, offline, account/sync, Bible, Topics, Practice, and design behavior remain unchanged unless required to surface the new metadata.
9. Automated validation must continue to pass; add contract assertions for the new curriculum metadata where practical.

## Invariants

- Home / Course / Bible / Topics / Practice remain primary destinations.
- Bible owns shelf/browse/reader.
- Topics remain unscored reference.
- Practice remains reinforcement.
- Learner state remains local-first and stable-ID based.
- Statement of Faith remains the doctrinal ceiling.
- Understanding and reasoning are scored; theological assent is not.
- Current six-course historical bridge remains intact.
- No v5 bridge architecture or DOM repair is reintroduced.

## Implementation plan

1. Add typed question-thread and course-time metadata to `content/curriculum/structure.mjs`.
2. Add a Course 1 "questions worth carrying" lesson with active checks and explicit cross-course return points.
3. Update Course 1 and Course 6 descriptions to make the spiral learning contract explicit.
4. Teach catalog post-processing to retain the new metadata.
5. Extend generated curriculum documentation to expose active-study estimates and question-thread progression.
6. Add validation for six course time ranges, question-thread IDs, and valid course/unit references.
7. Run repository CI on the branch and inspect any failures before opening/merging a PR.

## Execution plan / WBS

| ID | Work | Depends on | Evidence |
|---|---|---|---|
| QS1.CONTRACT | Define spiral-learning contract, timing semantics, invariants | current six-course baseline | this plan + execution graph |
| QS2.MODEL | Add course-time and question-thread metadata | QS1.CONTRACT | structure schema/source |
| QS3.COURSE1 | Add explicit questions-first foundational lesson | QS2.MODEL | authored lesson + checks |
| QS4.SPIRAL | Map major questions across courses/units | QS2.MODEL | question-thread metadata |
| QS5.DOCS | Generate learner/editorial curriculum reference with timing/thread data | QS2.MODEL, QS4.SPIRAL | curriculum generator |
| QS6.VALIDATE | Add contract validation and run CI | QS3.COURSE1, QS5.DOCS | validation + CI |
| QS7.HUMAN | Editorial/theological/novice-usability review | QS6.VALIDATE | human gate before merge/public release |

DAG: `QS1.CONTRACT → QS2.MODEL → {QS3.COURSE1, QS4.SPIRAL} → QS5.DOCS → QS6.VALIDATE → QS7.HUMAN`.

## Affected systems

- Curriculum structure and metadata
- Course 1 authored content
- Generated runtime catalog
- Generated curriculum reference / llms context indirectly
- Curriculum validation

No learner-state schema, account storage, Bible corpus, service-worker strategy, or theology policy is changed by this delta.

## Validation

- Exactly six courses and 44 current units remain.
- Existing lesson/mastery IDs remain resolvable.
- New question-thread references resolve to existing courses/units.
- Every course has a valid active-study time range with minimum < maximum.
- Course 1 contains an explicit foundational difficult-question lesson.
- Course 6 wording describes synthesis/deepening rather than first exposure.
- Existing assessment/state/offline/production validation remains green.

## Risks and mitigations

- **Curriculum bloat:** one focused Course 1 lesson is added; the rest is metadata/framing rather than duplicative content.
- **False precision in timing:** publish ranges as planning estimates for active study, not guarantees or mastery duration.
- **Question fragmentation:** threads point to existing units instead of creating parallel mini-courses.
- **Learner-state breakage:** existing IDs and unit IDs remain unchanged; only the new lesson receives a new stable ID.
- **Theological oversimplification:** the new lesson frames questions and method rather than prematurely resolving contested issues.

## Rollback

Revert the branch commits. Existing learner-state records remain valid because existing activity IDs and placement identifiers are preserved.

## Human-review gates

Before merge/public release, review the new Course 1 framing for adult-beginner clarity, theological/editorial accuracy, tone, cognitive load, and whether the question list motivates rather than overwhelms.