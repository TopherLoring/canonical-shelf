# Plan Delta — Native Bible Identity & Detail Restoration

## Objective
Restore the strongest Bible-tab capabilities and visual identity present in v5 inside the current v7 runtime without restoring v5 bridge architecture or changing the current curriculum.

## Product outcomes
- Bible once again presents as Canonical Shelf's signature library, not a generic grid of links.
- The locked nine-group taxonomy and historic category colors are visible and meaningful.
- Every canonical book has an accessible profile surface before/alongside chapter reading.
- Existing BSB corpus reading and search remain available offline.
- Book profile, shelf, and reader states remain coherent through normal URL navigation.

## Curriculum isolation invariant
This work MUST NOT modify `content/curriculum/**`, course/unit/lesson/mastery IDs, activity ordering/counts, learner progress schemas, or curriculum migration semantics. Bible code may consume the existing generated catalog only for cross-links; it must not write to or transform curriculum sources.

## Acceptance criteria
1. `/bible` renders all 66 books in the locked nine-group taxonomy with the original Canonical Shelf group colors and distinct Old/New Testament shelf regions.
2. Selecting a book can open a native v7 book profile with canonical group, orientation/synopsis, themes, deeper-reading questions, disagreement notes, and textual/translation notes where authored.
3. Book profiles provide an explicit path into chapter 1; chapter readers provide a path back to the selected book profile and the full shelf.
4. Existing reference search, keyword search, chapter navigation, BSB corpus, offline behavior, keyboard navigation, focus indication, forced-colors behavior, touch targets, and reduced-motion expectations remain intact.
5. No MutationObserver repair layer, DOM patch bridge, stacked runtime, or direct reuse of v5 shell code is introduced.
6. Bible validation checks 66 unique books, nine groups, complete book-study coverage, group alignment, and the presence of native profile/shelf contracts.
7. A repository diff from the pre-restoration baseline contains no changes under `content/curriculum/**`.

## Implementation plan
- Recover the editorially authored v5 book-study metadata into an ES module owned by the Bible surface.
- Replace the flat shelf renderer with a native semantic shelf renderer using current routing.
- Add a native profile renderer keyed by `?book=<n>`; reserve `?book=<n>&chapter=<n>` for scripture reading.
- Restore color continuity through CSS custom properties on group/book elements rather than DOM mutation.
- Recompose mobile layouts rather than merely shrinking the desktop shelf.
- Strengthen `validate-bible.mjs` so the restored contract becomes a release gate.

## Execution plan / WBS
1. Baseline and plan gate
   1.1 Record scope and curriculum isolation invariant.
   1.2 Recover v5 study metadata and taxonomy.
2. Data restoration
   2.1 Add Bible-owned book-study module.
   2.2 Normalize legacy group labels to the locked nine-group taxonomy.
3. Native rendering
   3.1 Build semantic bookshelf.
   3.2 Build book-profile surface.
   3.3 Preserve chapter/search reader behavior and add profile continuity.
4. Visual restoration
   4.1 Reinstate group color identity and tactile shelf/spine treatment.
   4.2 Add responsive recomposition, focus, forced-colors, and reduced-motion safeguards.
5. Validation
   5.1 Extend Bible structural validator.
   5.2 Confirm no curriculum-source diff.
   5.3 Run repository verification/CI.
6. Human review gate
   6.1 Visual check on phone + desktop: shelf identity, book profile density, reader transition.
   6.2 Editorial spot-check of representative OT/NT profiles.

## Rollback
Revert Bible-specific metadata/render/style/validation commits. Because no curriculum or learner-state schema is touched, rollback does not require progress migration.

## Risks
- Legacy profile language may use older group labels (`Wisdom`, `Gospels`, `Acts`, `Revelation`). Mitigation: map through canonical book taxonomy; never trust those legacy labels for grouping.
- Large shelf density can regress mobile usability. Mitigation: dedicated mobile shelf composition with horizontal spine rows and accessible non-drag interaction.
- Profile restoration could accidentally make reading one extra click. Mitigation: expose both `Study book` and direct `Read chapter 1` affordances from each spine/profile context.
