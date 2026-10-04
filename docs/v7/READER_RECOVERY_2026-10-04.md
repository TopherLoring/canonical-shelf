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

This is a recovery checkpoint, not certification that every redesign phase is complete. Whole-verse and verse-range highlights are restored; the original plan's word-level highlighting remains outstanding. The lesson and Learning Path redesign, Shelf home, Topics/Practice/Profile, Theologian redesign, legacy removal, and final theme work remain separate planned slices. Production integration and deployment require their own owner instruction.

Chris subsequently deferred tablet-specific layout work and comparisons. Tablet layout remains open, including the existing navigation overflow at 768 pixels; no tablet layout is approved by this recovery. Later exploration may use a scrollable toolbar with a hidden scrollbar and a clear scrolling cue, and side panels that become drawers when necessary.

Validation uses the literal `bun run verify` release gate, ROA's generator/guards, desktop and phone screenshots, and responsive reader checks at 320, 390, and 428 pixels. Browser screenshots are written to per-run test artifact folders, preserving the tracked reference images.
