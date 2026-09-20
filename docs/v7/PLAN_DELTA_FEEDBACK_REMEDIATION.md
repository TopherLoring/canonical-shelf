# Feedback Remediation — Implementation and Execution Plan

## Objective

Resolve the nine production feedback findings from the Course/Study Focus experience without reducing lesson rigor, changing stable activity IDs, conflating completion with mastery, or restoring legacy runtime debt.

## Observed evidence

- Lesson completion does not provide a clear next-activity continuation.
- All activities are linked, but state copy can make later activities appear gated.
- The renderer places the primary passage before explanatory preparation.
- Per-item assessment results are not exposed.
- Fixed utility controls can cover Study Focus.
- Lesson notes and Journal currently share one global panel.
- The first lesson names Jennings without introduction.
- Some scenes fragment adjacent explanation.
- Short viewports can clip the scene before the last-resort overflow breakpoint.

## Locked outcomes

1. Every activity remains open from the unit journey; state communicates `Available`, `Complete`, `Mastered`, or `Review due`.
2. Final-scene navigation continues to the next activity when available and completion receives a clear congratulatory state.
3. Correct selected responses alone receive a green check/status treatment; incorrect selections stay neutral and receive explanatory remediation. Color is never the only cue.
4. Preparatory explanation precedes the primary passage. Recognized supporting verse references expose adjacent expandable BSB text.
5. Closely related explanatory paragraphs may share a scene when this reduces fragmentation.
6. Reflection owns lesson-specific notes. The persistent utility is Journal-only.
7. Feedback is part of reserved Study Focus chrome and cannot overlay lesson content.
8. Study Focus typography and composition respond to container/viewport dimensions; scene overflow remains safe when content genuinely exceeds the viewport.
9. Theodore W. Jennings is introduced with role and relevance before his work is cited.

## Invariants

- Existing activity/mastery IDs and learner-state schema remain unchanged.
- Completion is not represented as mastery.
- Review intervals remain 1 → 3 → 7 → 14 → 30 → 60 days.
- Notes and Journal remain local-first, unscored, exportable, and sync-compatible.
- BSB corpus bytes remain unchanged.
- Keyboard, focus, reduced-motion, forced-colors, and non-color status cues remain supported.
- Human responsive/usability review remains required before public-launch certification.

## Implementation plan

1. Extend Course state presentation and next-activity resolution.
2. Recompose lesson scenes and add contextual supporting-passage disclosure.
3. Add deterministic per-item correctness evidence and a single positive visual indicator.
4. Split inline lesson notes from the Journal utility without changing persisted state keys.
5. move Feedback into Study Focus chrome and harden responsive folio behavior.
6. Patch explanatory attribution in generated curriculum postprocessing.
7. Add unit/E2E contract coverage and run automated CI.

## Acceptance criteria

- Later activities are clickable regardless of completion and are labeled available when untouched.
- Completing all scored checks records completion, shows congratulations, and offers the next activity.
- Correct selections expose a check icon and text/accessible status; no red wrong-state styling is introduced.
- Lesson `begin` explains the reading before displaying the full passage and introduces Jennings.
- Supporting references with chapter-and-verse syntax expose their text without leaving the lesson.
- The Reflection scene includes lesson notes; the floating utility is labeled Journal and edits only Journal state.
- Feedback never floats over Study Focus content.
- 320px-wide and short landscape layouts remain operable without clipped controls.
- Existing assessment, state, D1, feedback, build, and new E2E contracts pass.

## Risks and rollback

- Reference parsing may miss nonstandard citations; unmatched text remains unchanged.
- Scene recomposition can affect bookmarked scene numbers; activity IDs and completion evidence remain stable, but scene positions are presentation-only.
- Rollback is the branch/PR commit set; no database or learner-state migration is introduced.

## Human review gates

- Desktop/tablet/phone visual composition.
- Novice comprehension of the reordered first lesson.
- Touch behavior for rails, drawers, inline references, and completion controls.
- Editorial check of contextual verse use and Jennings attribution.
- Screen-reader confirmation of correct-only response indicators.
