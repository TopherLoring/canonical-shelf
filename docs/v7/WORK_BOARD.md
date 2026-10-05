# Work board

Generated from `docs/v7/work-graph.json` by `bun run work`. Do not edit by hand. Updated 2026-10-05.

## Rules every agent follows

1. Read the board, the node you will work on, and the decisions it cites before editing anything.
2. Claim before you edit: `bun run work claim <id> --agent <name> --branch <branch>`, then commit the graph change first. One owner per node; a node can be claimed only when its dependencies are done.
3. Edit only the paths your node owns. Anything outside them is a new node (add it, commit it) or a question for Chris, never a side edit.
4. Two agents never hold nodes that own the same paths at the same time; `bun run work check` fails if they do.
5. Decisions live only in `.roa/records` (`node .roa-kit/roa.mjs decide ...`). When decisions conflict, the decision made with Claude stands unless Chris explicitly overrides it. Chris's latest explicit decision on a topic is the baseline; never restore a superseded one.
6. One node, one branch, one draft PR. Nothing merges without Chris's approval.
7. A node is done only through `bun run work done <id>`, which runs its acceptance commands. Chris-gate nodes close only through `bun run work approve <id> --record <record id>` citing his recorded decision.
8. Leave the node handoff-ready at every commit: `bun run work note <id> "what changed, what is next"`. If you stop, `bun run work release <id>` keeps your notes for the next agent.
9. Run `bun run verify:fast` before every commit and `bun run verify` before marking a node done.

## Ready to start

- **R2** — Every page starts close under the top bar: contract test fails on the lesson branch
- **S3.C** — Step 3: lesson card CSS (portrait = phone layout, landscape = desktop layout; type in container units with min/max clamps)
- **S3.E** — Step 3: review report of every lesson's proposed parts with weak breaks flagged (docs/v7/LESSON_PAGINATION_REVIEW.md)
- **S3.J** — Step 3: Learning Path page (path, module and unit on one page)
- **S4** — Step 4: Shelf home (bookshelf, two-line title, selected-book panel)
- **S5a** — Step 5: Study Topics
- **S5b** — Step 5: Review & Practice
- **S5c** — Step 5: Profile
- **K1** — project-roa-kit 1.2.0: upstream theme contract v11, views.mjs and roa.mjs from this repo; update the kit test fixture

## All nodes

| Node | Status | Owner | Branch | Depends on | Title |
|---|---|---|---|---|---|
| `K1` | ready |  |  |  | project-roa-kit 1.2.0: upstream theme contract v11, views.mjs and roa.mjs from this repo; update the kit test fixture |
| `P10` | waiting |  |  | `RD` | Themes 2-8: final values per theme (layouts unchanged) |
| `R2` | ready |  |  | `S2` | Every page starts close under the top bar: contract test fails on the lesson branch |
| `RD` | waiting (Chris) |  |  | `S7` | Chris approves the redesign |
| `S3.C` | ready |  |  | `S3.B`, `S3.B7`, `S3.R` | Step 3: lesson card CSS (portrait = phone layout, landscape = desktop layout; type in container units with min/max clamps) |
| `S3.E` | ready |  |  | `S3.D`, `S3.B7`, `S3.D2` | Step 3: review report of every lesson's proposed parts with weak breaks flagged (docs/v7/LESSON_PAGINATION_REVIEW.md) |
| `S3.F` | waiting (Chris) |  |  | `S3.E` | Step 3: Chris reviews the report and approves the one-time revision edits |
| `S3.G` | waiting |  |  | `S3.F` | Step 3: lock approved parts into content/pathway/lessons; build fails if any part exceeds the budget |
| `S3.H` | waiting |  |  | `S3.C`, `S3.G`, `X1` | Step 3: lesson screen renders locked parts (adapt Codex's lesson screen) |
| `S3.I` | waiting |  |  | `S3.H` | Step 3: tests: sampled browser test of the fullest parts in both shapes; retire the render-every-lesson test |
| `S3.J` | ready |  |  | `X1` | Step 3: Learning Path page (path, module and unit on one page) |
| `S4` | ready |  |  | `S2` | Step 4: Shelf home (bookshelf, two-line title, selected-book panel) |
| `S5a` | ready |  |  | `S2` | Step 5: Study Topics |
| `S5b` | ready |  |  | `S2` | Step 5: Review & Practice |
| `S5c` | ready |  |  | `S2` | Step 5: Profile |
| `S6` | waiting |  |  | `S3.H` | Step 6: Theologian panel (docked desktop, centered phone, dim overlay) |
| `S7` | waiting |  |  | `S4`, `S5a`, `S5b`, `S5c`, `S6`, `S3.I`, `S3.J` | Step 7: remove legacy stylesheets and render paths; close the guards |
| `S7b` | waiting |  |  | `RD` | Prune redesign scaffolding tests (screenshot baselines, layout conformance, Component Lab checks, overlapping reader cases) |
| `R1` | done | Codex | `feature/redesign-p5-lesson-path` | `S2` | Reader: "a pending reader mount cannot replace the profile after navigation" fails in the parallel run |
| `S2` | done | Codex + Claude | `feature/redesign-p4-reader` |  | Step 2: Bible reader |
| `S3.A` | done | Claude | `feature/redesign-p5-lesson-path` |  | Step 3: decisions and handoff doc |
| `S3.A2` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.A` | Step 3: handoff doc brought current (decisions, vocabulary, open questions) |
| `S3.B` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.A` | Step 3: type calibration (reading-font character widths; portrait and landscape line and character budgets) |
| `S3.B2` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.B` | Step 3: recalibrate the portrait text box to 4:5 (decision ui.lesson.card.portrait-4x5-2026-10-05) |
| `S3.B3` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.B2` | Step 3: recalibrate line budgets to the block maximums (49 across x 17 down portrait, 91 across landscape) |
| `S3.B4` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.B3` | Step 3: landscape line maximum 14 (ui.lesson.card.landscape-91x14-2026-10-05) |
| `S3.B5` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.B4` | Step 3: line height 1.55; decided line counts (17 portrait, 14 landscape) are authoritative, box aspect follows |
| `S3.B6` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.B5` | Step 3: character ceilings per step (833 / 784 / 735 by paragraph count) |
| `S3.B7` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.Q2` | Recalibrate lesson type size against Source Sans 3 so it hits Chris's decided counts (49x17 portrait, 91x14 landscape) |
| `S3.D` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.B`, `S3.R` | Step 3: build-time divider (sentence-safe, step-isolated parts that fit both shapes) with Node unit tests |
| `S3.D2` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.S` | Divider: implement the Scripture reading rule from S3.S; attach "As you read X, notice..." to the reading's last card |
| `S3.Q` | done (Chris) |  |  |  | Lesson fonts: ship Source Sans 3 and Literata per the Reading Room theme sheet, or keep the shipped reading font for lesson prose |
| `S3.Q2` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.Q` | Ship Source Sans 3 (body) and Literata (Scripture) from the site, per S3.Q; wire them into the Reading Room theme values |
| `S3.R` | done (Chris) |  |  | `S3.B7` | Portrait step body: the decided 4:5 box, 49x17 and 1.55 line height cannot all hold with Source Sans 3 (only 15.6 lines fit). Choose: A) 15 lines, B) line height 1.42, C) 3:4 box |
| `S3.S` | done (Chris) |  |  | `S3.D` | Scripture readings longer than one card (100 of 116): A) split at verse boundaries across cards, B) scroll inside the card, C) open in the Bible reader, or A up to 3 cards and C beyond (Claude recommends) |
| `X1` | done (Chris) |  |  |  | Codex lesson branch committed and pushed (codex/redesign-lesson-path) |

## Handoff notes (latest first)

### S2 — Step 2: Bible reader

- 2026-10-05 (Claude): Codex rebuilt the reader from Claude's work (codex/resume-reader); Claude added the 2026-10-05 decisions and two-speed verification. Full run on Chris's laptop: 165 passed, 4 failed (see R1, R2, S3.I).

### R1 — Reader: "a pending reader mount cannot replace the profile after navigation" fails in the parallel run

- 2026-10-05 (Codex): Closed through bun run work done R1: 10/10 race repetitions and verify:fast (12/12 smoke) passed with CI=1. Full verify previously passed 141/141 with the same configuration. Board-only investigation; existing guard retained unchanged. Handoff: default six-worker network-suspension failures remain recorded above for future suite reliability work; no other node changed. Ready for Chris's review in draft PR #60.
- 2026-10-05 (Codex): Done; acceptance passed (bunx playwright test tests/redesign/reader.spec.js --grep "pending reader mount" --repeat-each=10; bun run verify:fast).
- 2026-10-05 (Codex): Existing fix confirmed: c58c433 already added the navigation-generation guard. No runtime or test change is needed. Full bun run verify passed with CI=1 (configured 2 workers; 141/141 browser tests, no retries reported). R1 also passed in the default 6-worker full run and 10 isolated repetitions; removing the guard failed 3/3 mutation runs. Earlier default full run had four other reader failures; one trace identified Chromium ERR_NETWORK_IO_SUSPENDED. Next: run node acceptance, close through work done, commit and push the board-only verification handoff to the existing draft PR #60.
- 2026-10-05 (Codex): Investigation: existing ctx.isCurrent guard passes 10 isolated repetitions and the parallel full-suite R1 case. Temporarily removing the guard fails the profile assertion in all 3 mutation runs; reader restored unchanged. Initial full gate: 137 passed, 4 other reader failures (legacy notes, highlighted range, shared passage context, study links); study-links trace reports ERR_NETWORK_IO_SUSPENDED for library-books modules. Full verification with configured CI worker limit is in progress.
- 2026-10-05 (Codex): Claimed on feature/redesign-p5-lesson-path.
- 2026-10-05 (Claude): Released from feature/redesign-p5-lesson-path.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.

### R2 — Every page starts close under the top bar: contract test fails on the lesson branch

- 2026-10-05 (Claude): Seen on Chris's run of codex/redesign-lesson-path; reproduce on that branch first to confirm whether the lesson screen or the frame causes it.

### X1 — Codex lesson branch committed and pushed (codex/redesign-lesson-path)

- 2026-10-05 (Chris): Decided: work.x1.2026-10-05 (Codex lesson branch pushed (6f8c2ac)).
- 2026-10-05 (Claude): Needed by S3.H and S3.J. Close with a record such as process.codex-lesson-branch-pushed once pushed.

### S3.A2 — Step 3: handoff doc brought current (decisions, vocabulary, open questions)

- 2026-10-05 (Claude): Done; acceptance passed (bun run verify:fast).
- 2026-10-05 (Claude): Handoff doc rewritten: current decisions, vocabulary (card = step), calibration result, open questions.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.

### S3.B — Step 3: type calibration (reading-font character widths; portrait and landscape line and character budgets)

- 2026-10-05 (Claude): Done; acceptance passed (bun scripts/calibrate-lesson-type.mjs --check; bun run verify:fast).
- 2026-10-05 (Claude): Calibrated Caladea (regular/bold/italic/boldItalic) widths from the shipped WOFF2 files into content/pathway/lesson-type.json (200 chars each, font units, 1000/em). Budgets: portrait 38/line x 15 lines = 524 chars, landscape 68/line x 9 lines = 563 chars; portrait governs, so one part holds at most 15 lines / 524 chars (lineHeight 1.7, 3% width safety, 92% fill). widthEm() is exported from scripts/calibrate-lesson-type.mjs for S3.D to wrap-simulate. Kerning is not modelled; the margins cover it. S3.C and S3.D are next.

### S3.B2 — Step 3: recalibrate the portrait text box to 4:5 (decision ui.lesson.card.portrait-4x5-2026-10-05)

- 2026-10-05 (Claude): Done; acceptance passed (bun scripts/calibrate-lesson-type.mjs --check; bun run verify:fast).
- 2026-10-05 (Claude): Portrait text box now 4:5 per ui.lesson.card.portrait-4x5-2026-10-05. Budget: portrait 38/line x 11 lines = 384 chars governs; landscape 9 lines = 563 chars (landscape has spare room; same-capacity check removed). For S3.C: aspect-ratio 4/5 plus max-height calc(100dvh - 380px) breaks the ratio on short phones (SE 375x667 gives 287pt vs 418pt): size the box by min(width, 0.8 x available height) and scale type with it, so a part never needs to scroll.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.

### S3.B3 — Step 3: recalibrate line budgets to the block maximums (49 across x 17 down portrait, 91 across landscape)

- 2026-10-05 (Claude): Done; acceptance passed (bun scripts/calibrate-lesson-type.mjs --check; bun run verify:fast).
- 2026-10-05 (Claude): Block maximums per ui.lesson.card.block-max-2026-10-05: portrait 49 across x 17 lines (766 chars, governs), landscape 91 across x 15 lines (1255 chars, derived from the 5:3 box). Line height 1.45 (--leading-normal); with Caladea that yields exactly 17 lines in the 4:5 box at 49 per line. Font size = box width / (49 x 0.406) portrait, / (91 x 0.406) landscape. Still Caladea: rerun after S3.Q fonts ship.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.

### S3.B4 — Step 3: landscape line maximum 14 (ui.lesson.card.landscape-91x14-2026-10-05)

- 2026-10-05 (Claude): Landscape: 91 across, 14-line cap (landscape-91x14), box 2:1 (landscape-2x1). At 2:1 and 1.45 leading the box holds 12 lines, under the 14 cap; 14 lines would need about 1.32 leading. Landscape holds 1004 chars; portrait 17 x 49 = 766 still governs the part budget.
- 2026-10-05 (Claude): Done; acceptance passed (bun scripts/calibrate-lesson-type.mjs --check; bun run verify:fast).
- 2026-10-05 (Claude): Landscape capped at 14 lines (91 across) per ui.lesson.card.landscape-91x14-2026-10-05; the derived 15 is now a cap. Landscape holds 1172 chars; portrait 17 x 49 = 766 still governs the part budget.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.

### S3.B5 — Step 3: line height 1.55; decided line counts (17 portrait, 14 landscape) are authoritative, box aspect follows

- 2026-10-05 (Claude): Done; acceptance passed (bun scripts/calibrate-lesson-type.mjs --check; bun run verify:fast).
- 2026-10-05 (Claude): Line height 1.55. Line counts are now authoritative (portrait 17, landscape 14) instead of derived from the box aspect; with Caladea the implied boxes are about 0.76 (portrait) and 1.7 (landscape) width/height, not exactly 4:5 and 2:1 because the final font sets the average character width. Portrait 17 x 49 = 766 chars governs the part budget; landscape holds 1172. Rerun after S3.Q fonts ship.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.

### S3.B6 — Step 3: character ceilings per step (833 / 784 / 735 by paragraph count)

- 2026-10-05 (Claude): Done; acceptance passed (bun scripts/calibrate-lesson-type.mjs --check; bun run verify:fast).
- 2026-10-05 (Claude): Ceilings per ui.lesson.card.char-ceiling-2026-10-05: 833 / 784 / 735 chars for 1 / 2 / 3 paragraphs (each paragraph break costs one 49-char line; 4 paragraphs = 686). Hard maximums, not targets. Interpreted as per card (one screen of a step), the same unit as the 17 x 49 portrait block; if Chris means the whole step, the divider (S3.D) would have no parts to cut. Replaced the 92% fill budget. Landscape ceilings are higher (1274 for one block), so portrait governs.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.

### S3.Q — Lesson fonts: ship Source Sans 3 and Literata per the Reading Room theme sheet, or keep the shipped reading font for lesson prose

- 2026-10-05 (Chris): Decided: work.s3.q.2026-10-05 (Adapt fonts to match selected theme font, use Source Sans 3 / Literata per the Reading Room theme sheet).
- 2026-10-05 (Claude): Not blocking: S3.B calibrates the shipped reading font (Cambria/Caladea metrics, identical on every device). Choosing the theme-sheet fonts means shipping them site-wide and rerunning S3.B.

### S3.C — Step 3: lesson card CSS (portrait = phone layout, landscape = desktop layout; type in container units with min/max clamps)

- 2026-10-05 (Claude): Primary portrait layout: 4:5 step body, 49 characters per line, 1.55 line height (ui.lesson.card.portrait-layout-primary-fallback-2026-10-05). Size the type so 49 characters fill the box width; keep fallback D (54 x 17) switchable by one setting.
- 2026-10-05 (Claude): Ratios, counts and ceilings apply to the step body only (ui.lesson.card.step-body-scope-2026-10-05): title, progress, study-tool buttons, side columns, edge tabs and Back/Continue are outside the box.
- 2026-10-05 (Claude): Landscape columns follow ui.lesson.card.landscape-columns-2026-10-05: the center text box must fit 91 characters by 14 lines at the calibrated landscape type size; the step list and My Notes columns narrow to make room (each keeps a usable minimum). In Chris's landscape mockup the box ran about 10% past the center column into My Notes and over the title line; neither may happen.

### S3.D — Step 3: build-time divider (sentence-safe, step-isolated parts that fit both shapes) with Node unit tests

- 2026-10-05 (Claude): Done; acceptance passed (bun scripts/test-lesson-divider.mjs; bun run verify:fast).
- 2026-10-05 (Claude): Divider complete except readings: 642 steps -> 1078 cards, median 286 chars, max 475; sentences intact, content unchanged and in order, ids <step>, <step>-2...; runs of text cards re-split evenly; short last cards merged back only up to ~480 chars, else flagged orphan (6). 74 checks/blocks sit on their own card after their setup (informational). 100 primary readings overflow: rule pending S3.S, implemented in S3.D2. Suggest S3.I add scripts/test-lesson-divider.mjs to test:core.
- 2026-10-05 (Claude): WIP: scripts/lib/lesson-parse.mjs (parser shared with compile-pathway, no behavior change) and scripts/lesson-divider.mjs. Geometry from 16px / 1.55 / 347x435 box (54 x 17). Result: 642 steps -> 1088 cards, median 278 chars, max 419; checks all fit; 100 primary readings overflow (need Chris: split by verse, scroll, or open in reader); 5 orphans are 'As you read X, notice...' after a reading. Remaining: reading rule, then scripts/test-lesson-divider.mjs unit tests.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.
- 2026-10-05 (Claude): Pack to the target of about half the ceiling (about 370-420 characters; ui.lesson.card.step-length-2026-10-05), never above 833/784/735 by paragraph count, and never more lines than fit the primary portrait box (about 15 at 49 per line). Report every step that only fits under fallback D.
- 2026-10-05 (Claude): Ratios, counts and ceilings apply to the step body only (ui.lesson.card.step-body-scope-2026-10-05): title, progress, study-tool buttons, side columns, edge tabs and Back/Continue are outside the box.

### S3.E — Step 3: review report of every lesson's proposed parts with weak breaks flagged (docs/v7/LESSON_PAGINATION_REVIEW.md)

- 2026-10-05 (Claude): List steps that exceed the primary layout but fit fallback D; many such steps is the trigger to switch to D.
- 2026-10-05 (Claude): The report must simulate wrapping with the shipped Source Sans 3 widths (S3.B7), not Caladea.

### S3.H — Step 3: lesson screen renders locked parts (adapt Codex's lesson screen)

- 2026-10-05 (unknown): Build the reading popover per ui.lesson.reading.inline-or-popover-2026-10-05: centered over a dimmed screen on phones, beside the link on desktop; passage scrolls inside; Open in the Bible; closes with close button, Escape, or the dimmed area; focus returns to the link. Inline readings use the ScriptureBlock look with extra padding, scriptureBed surface and the group stripe.

### S3.J — Step 3: Learning Path page (path, module and unit on one page)

- 2026-10-05 (unknown): Checkpoint placement depends on content and number of steps, not one per unit or lesson (curriculum.checkpoint.placement-content-and-steps-2026-10-05). The Learning Path page must render checkpoints wherever the content places them; the exact rule is still to be given by Chris.
- 2026-10-05 (unknown): Checkpoint is named plain 'Checkpoint' with the unit title (ui.naming.checkpoint-bare-2026-10-05). Open question for Chris: one Checkpoint per unit or per lesson.
- 2026-10-05 (unknown): Per ui.naming.hide-module-unit-labels-2026-10-05: do not show the words Module or Unit to learners (titles only); Lesson and Step stay; keep 'Unit N Checkpoint'. Check tests/redesign/vocabulary-guard.spec.js for terms to adjust.

### K1 — project-roa-kit 1.2.0: upstream theme contract v11, views.mjs and roa.mjs from this repo; update the kit test fixture

- 2026-10-05 (unknown): When upgrading the kit, consider named shared font slots (body, reading, display) so themes reference fonts instead of setting stacks; S3.Q2 set Reading Room's body and Scripture fonts as theme-level stacks because the v11 contract only has serif/sans/mono.
- 2026-10-05 (Claude): Separate repository (C:/dev/project-roa-kit). Until done, never re-copy the upstream kit into .roa-kit/: it would pin a contract version the kit does not have.

### S3.Q2 — Ship Source Sans 3 (body) and Literata (Scripture) from the site, per S3.Q; wire them into the Reading Room theme values

- 2026-10-05 (Claude): Done; acceptance passed (bun run verify:fast).
- 2026-10-05 (Claude): Reading Room: fontBody = Source Sans 3, fontReading (Scripture) = Literata, self-hosted Latin subsets via fontSources (24 faces, 16 files; all fonts 544 KB total, loaded only when used). Display/title stays Cambria/Caladea. Other themes unchanged until P10. Set as theme-level font stacks rather than new shared slots: the contract's shared fonts are fixed to serif/sans/mono, and adding slots means contract v12 (fold into K1). Verified in a browser: both families load and render on the reader. Lesson text must wait for document.fonts.ready before first paint (S3.H) so wrapping matches calibration.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.
- 2026-10-05 (Claude): Decided under S3.Q but no node shipped them. Self-host the woff2 files through the existing fontSources mechanism (open license, no cost). Fonts must load before lesson text renders or wrapping will differ from the calibration.

### S3.B7 — Recalibrate lesson type size against Source Sans 3 so it hits Chris's decided counts (49x17 portrait, 91x14 landscape)

- 2026-10-05 (Claude): Done; acceptance passed (bun scripts/calibrate-lesson-type.mjs --check; bun run verify:fast).
- 2026-10-05 (Claude): Recalibrated to the shipped fonts: Source Sans 3 (prose; avg 0.395 em/char) and Literata at 1.15x (Scripture blocks). Variable-font bold widths scaled by 1.07 (one width table per file). widthEm(type, text, face, role) now takes a role ('prose' or 'scripture'). Result exposed a conflict between 4:5, 49x17 and 1.55: see S3.R.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.
- 2026-10-05 (Claude): Ratios, counts and ceilings apply to the step body only (ui.lesson.card.step-body-scope-2026-10-05): title, progress, study-tool buttons, side columns, edge tabs and Back/Continue are outside the box.
- 2026-10-05 (Claude): The counts and the 833/784/735 ceilings are Chris's design targets, measured from his approved portrait and landscape mockups; they do not change. Only the type size that produces them changes with the font. S3.B through S3.B6 measured Caladea.

### S3.R — Portrait step body: the decided 4:5 box, 49x17 and 1.55 line height cannot all hold with Source Sans 3 (only 15.6 lines fit). Choose: A) 15 lines, B) line height 1.42, C) 3:4 box

- 2026-10-05 (Chris): Decided: ui.lesson.card.portrait-layout-primary-fallback-2026-10-05.
- 2026-10-05 (Claude): Measured (S3.B7): Source Sans 3 averages 0.395 em per character on lesson prose. At 49 per line the line is 19.36 em; a 4:5 box is then 24.2 em tall = 15.6 lines at 1.55. Claude recommends C (3:4 box keeps 49x17, the 833/784/735 ceilings and 1.55 spacing). Landscape 2:1 at 91 per line fits 11.6 lines; not binding because portrait governs.

### S3.S — Scripture readings longer than one card (100 of 116): A) split at verse boundaries across cards, B) scroll inside the card, C) open in the Bible reader, or A up to 3 cards and C beyond (Claude recommends)

- 2026-10-05 (Chris): Decided: ui.lesson.reading.inline-or-popover-2026-10-05.

### S3.D2 — Divider: implement the Scripture reading rule from S3.S; attach "As you read X, notice..." to the reading's last card

- 2026-10-05 (Claude): Done; acceptance passed (bun scripts/test-lesson-divider.mjs; bun run verify:fast).
- 2026-10-05 (Claude): Reading rule implemented (ui.lesson.reading.inline-or-popover-2026-10-05): inline when two sentences or fewer AND at most 300 characters (Luke 24:44-45, Nehemiah 8:8, Proverbs 26:4-5); the other 113 readings are a 4-line link that opens a scrollable popover. The 300-character limit keeps out single Scripture sentences that run many verses (Ephesians 4:1-6, Ecclesiastes 3:1-8). Result: 1042 cards, no overflow; 2 orphans and 72 check-alone cards for the review report. The popover itself is lesson-screen work (S3.H).
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.

