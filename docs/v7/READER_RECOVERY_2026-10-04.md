# Reader recovery — 2026-10-04

The two supplied `canonical-shelf-redesign-2026-10-04b` bundles are identical and end at `6bd2529` on `feature/redesign-p4-reader`. They contain the reader work in progress, but not Claude's reported cloud commit `63a34e7`.

The recovery on `codex/resume-reader` reconstructs the missing edits from the supplied command transcripts and reader test file. It places the fifteen older stylesheets in a legacy cascade layer, removes four runtime stylesheet injectors, restores lesson focus compatibility, and completes the handoff's reader label, footnote, cross-reference loading, selection, and notes behavior.

The recovery also fixes issues found during verification and independent review:

- Phone notes tabs respect panel visibility.
- Distant verse addresses scroll within the chapter while retaining the surrounding controls.
- Hebrew acrostic headings decode numeric source entities before safe text escaping.
- Range highlighting and clearing save every selected verse in one queued state write.
- Shared passage context preserves selected ranges and direct reference-query addresses for notes and the Theologian.
- Footnote buttons retain native keyboard activation.

Chris clarified the layout rules during recovery: width adapts to the available screen; mobile pages never scroll horizontally; vertical scrolling is permitted where needed; scrolling stays within the content container when moving the whole page would disrupt surrounding controls. The no-scroll requirement specifically covers primary lesson content in the Learning Path, with additional content allowed to scroll. These statements are recorded through ROA.

This is a recovery checkpoint, not certification that every redesign phase is complete. Whole-verse and verse-range highlights are restored; word and phrase marking is covered by the continuation below. The lesson and Learning Path redesign, Shelf home, Topics/Practice/Profile, Theologian redesign, legacy removal, and final theme work remain separate planned slices. Production integration and deployment require their own owner instruction.

Chris subsequently deferred tablet-specific layout work and comparisons. Tablet reader layout remains open; shared navigation now scales with width and switches to icons with short labels under the later navigation decision. Later tablet exploration may use a scrollable toolbar with a hidden scrollbar and a clear scrolling cue, and side panels that become drawers when necessary.

Validation uses the literal `bun run verify` release gate, ROA's generator/guards, desktop and phone screenshots, and responsive reader checks at 320, 390, and 428 pixels. Browser screenshots are written to per-run test artifact folders, preserving the tracked reference images.

## Word and phrase marking continuation

Native text selection now opens the reader marking controls for a word, phrase, or passage crossing verse boundaries. The four colors and underline apply only to the selected Scripture text; repeated actions retain that same selection. Removal preserves surrounding marks, and color and underline can overlap. Whole-verse and verse-range actions remain available.

Each verse stores normalized marking intervals in canonical UTF-16 text positions, excluding verse numbers and footnote badges. Existing highlight entries remain compatible. Queued transactional writes preserve concurrent notes and markings; dated empty intervals synchronize removals. Painting follows the latest saved action for each affected verse, including rapid actions on different verses, without changing Scripture or replacing footnote controls.

Verification also exposed a pre-existing asynchronous route race: a slow corpus or reader annotation load could replace a more recent destination. The router now rejects superseded render generations, and the reader checks its current mount before writing its content.

The lesson investigation confirms that checking only document overflow cannot prove the primary lesson content is readable: existing lesson containers can scroll internally. The separate lesson slice must measure content overflow, preserve every authored word, and keep answers in the same assessment form across pagination.

Continuation validation: the literal bun run verify gate passed with 142 browser tests, including mouse/touch selection, overlapping marks, phrase retention, rapid saves within and across verses, delayed navigation, and existing reader contracts. Sync range round-trip and removal checks passed. Independent review is clean; the guard reports 247 existing violations and zero new.
