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

- **R1** — Reader: "a pending reader mount cannot replace the profile after navigation" fails in the parallel run
- **R2** — Every page starts close under the top bar: contract test fails on the lesson branch
- **X1** — Codex lesson branch committed and pushed (codex/redesign-lesson-path) *(needs Chris)*
- **S3.C** — Step 3: lesson card CSS (portrait = phone layout, landscape = desktop layout; type in container units with min/max clamps)
- **S3.D** — Step 3: build-time divider (sentence-safe, step-isolated parts that fit both shapes) with Node unit tests
- **S4** — Step 4: Shelf home (bookshelf, two-line title, selected-book panel)
- **S5a** — Step 5: Study Topics
- **S5b** — Step 5: Review & Practice
- **S5c** — Step 5: Profile
- **K1** — project-roa-kit 1.2.0: upstream theme contract v11, views.mjs and roa.mjs from this repo; update the kit test fixture

## All nodes

| Node | Status | Owner | Branch | Depends on | Title |
|---|---|---|---|---|---|
| `S3.B4` | claimed | Claude | `feature/redesign-p5-lesson-path` | `S3.B3` | Step 3: landscape line maximum 14 (ui.lesson.card.landscape-91x14-2026-10-05) |
| `K1` | ready |  |  |  | project-roa-kit 1.2.0: upstream theme contract v11, views.mjs and roa.mjs from this repo; update the kit test fixture |
| `P10` | waiting |  |  | `RD` | Themes 2-8: final values per theme (layouts unchanged) |
| `R1` | ready |  | `feature/redesign-p5-lesson-path` | `S2` | Reader: "a pending reader mount cannot replace the profile after navigation" fails in the parallel run |
| `R2` | ready |  |  | `S2` | Every page starts close under the top bar: contract test fails on the lesson branch |
| `RD` | waiting (Chris) |  |  | `S7` | Chris approves the redesign |
| `S3.C` | ready |  |  | `S3.B` | Step 3: lesson card CSS (portrait = phone layout, landscape = desktop layout; type in container units with min/max clamps) |
| `S3.D` | ready |  |  | `S3.B` | Step 3: build-time divider (sentence-safe, step-isolated parts that fit both shapes) with Node unit tests |
| `S3.E` | waiting |  |  | `S3.D` | Step 3: review report of every lesson's proposed parts with weak breaks flagged (docs/v7/LESSON_PAGINATION_REVIEW.md) |
| `S3.F` | waiting (Chris) |  |  | `S3.E` | Step 3: Chris reviews the report and approves the one-time revision edits |
| `S3.G` | waiting |  |  | `S3.F` | Step 3: lock approved parts into content/pathway/lessons; build fails if any part exceeds the budget |
| `S3.H` | waiting |  |  | `S3.C`, `S3.G`, `X1` | Step 3: lesson screen renders locked parts (adapt Codex's lesson screen) |
| `S3.I` | waiting |  |  | `S3.H` | Step 3: tests: sampled browser test of the fullest parts in both shapes; retire the render-every-lesson test |
| `S3.J` | waiting |  |  | `X1` | Step 3: Learning Path page (path, module and unit on one page) |
| `S4` | ready |  |  | `S2` | Step 4: Shelf home (bookshelf, two-line title, selected-book panel) |
| `S5a` | ready |  |  | `S2` | Step 5: Study Topics |
| `S5b` | ready |  |  | `S2` | Step 5: Review & Practice |
| `S5c` | ready |  |  | `S2` | Step 5: Profile |
| `S6` | waiting |  |  | `S3.H` | Step 6: Theologian panel (docked desktop, centered phone, dim overlay) |
| `S7` | waiting |  |  | `S4`, `S5a`, `S5b`, `S5c`, `S6`, `S3.I`, `S3.J` | Step 7: remove legacy stylesheets and render paths; close the guards |
| `S7b` | waiting |  |  | `RD` | Prune redesign scaffolding tests (screenshot baselines, layout conformance, Component Lab checks, overlapping reader cases) |
| `X1` | ready (Chris) |  |  |  | Codex lesson branch committed and pushed (codex/redesign-lesson-path) |
| `S2` | done | Codex + Claude | `feature/redesign-p4-reader` |  | Step 2: Bible reader |
| `S3.A` | done | Claude | `feature/redesign-p5-lesson-path` |  | Step 3: decisions and handoff doc |
| `S3.B` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.A` | Step 3: type calibration (reading-font character widths; portrait and landscape line and character budgets) |
| `S3.B2` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.B` | Step 3: recalibrate the portrait text box to 4:5 (decision ui.lesson.card.portrait-4x5-2026-10-05) |
| `S3.B3` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.B2` | Step 3: recalibrate line budgets to the block maximums (49 across x 17 down portrait, 91 across landscape) |
| `S3.Q` | done (Chris) |  |  |  | Lesson fonts: ship Source Sans 3 and Literata per the Reading Room theme sheet, or keep the shipped reading font for lesson prose |

## Handoff notes (latest first)

### S2 — Step 2: Bible reader

- 2026-10-05 (Claude): Codex rebuilt the reader from Claude's work (codex/resume-reader); Claude added the 2026-10-05 decisions and two-speed verification. Full run on Chris's laptop: 165 passed, 4 failed (see R1, R2, S3.I).

### R1 — Reader: "a pending reader mount cannot replace the profile after navigation" fails in the parallel run

- 2026-10-05 (Claude): Released from feature/redesign-p5-lesson-path.
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.

### R2 — Every page starts close under the top bar: contract test fails on the lesson branch

- 2026-10-05 (Claude): Seen on Chris's run of codex/redesign-lesson-path; reproduce on that branch first to confirm whether the lesson screen or the frame causes it.

### X1 — Codex lesson branch committed and pushed (codex/redesign-lesson-path)

- 2026-10-05 (Claude): Needed by S3.H and S3.J. Close with a record such as process.codex-lesson-branch-pushed once pushed.

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

- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.

### S3.Q — Lesson fonts: ship Source Sans 3 and Literata per the Reading Room theme sheet, or keep the shipped reading font for lesson prose

- 2026-10-05 (Chris): Decided: work.s3.q.2026-10-05 (Adapt fonts to match selected theme font, use Source Sans 3 / Literata per the Reading Room theme sheet).
- 2026-10-05 (Claude): Not blocking: S3.B calibrates the shipped reading font (Cambria/Caladea metrics, identical on every device). Choosing the theme-sheet fonts means shipping them site-wide and rerunning S3.B.

### K1 — project-roa-kit 1.2.0: upstream theme contract v11, views.mjs and roa.mjs from this repo; update the kit test fixture

- 2026-10-05 (Claude): Separate repository (C:/dev/project-roa-kit). Until done, never re-copy the upstream kit into .roa-kit/: it would pin a contract version the kit does not have.

