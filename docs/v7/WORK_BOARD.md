# Work board

Generated from `docs/v7/work-graph.json` by `bun run work`. Do not edit by hand. Updated 2026-10-08.

## Rules every agent follows

1. Read the board, the node you will work on, and the decisions it cites before editing anything.
2. Claim before you edit: `bun run work claim <id> --agent <name> --branch <branch>`, then commit the graph change first. One owner per node; a node can be claimed only when its dependencies are done.
3. Before claiming, `bun run work claim` reads the shared board on GitHub (integrationBranch) and refuses if the node is already taken there or your branch is behind it. Start every node's branch from the latest integration branch.
4. Edit only the paths your node owns. Anything outside them is a new node (add it, commit it) or a question for Chris, never a side edit.
5. Two agents never hold nodes that own the same paths at the same time; `bun run work check` fails if they do.
6. Decisions live only in `.roa/records` (`node .roa-kit/roa.mjs decide ...`). When decisions conflict, the decision made with Claude stands unless Chris explicitly overrides it. Chris's latest explicit decision on a topic is the baseline; never restore a superseded one.
7. One node, one branch, one draft PR. Nothing merges without Chris's approval.
8. A node is done only through `bun run work done <id>`, which runs its acceptance commands. Chris-gate nodes close only through `bun run work approve <id> --record <record id>` citing his recorded decision.
9. Leave the node handoff-ready at every commit: `bun run work note <id> "what changed, what is next"`. If you stop, `bun run work release <id>` keeps your notes for the next agent.
10. Run `bun run verify:fast` before every commit and `bun run verify` before marking a node done.

## Ready to start

- **K1** — project-roa-kit 1.2.0: upstream theme contract v11, views.mjs and roa.mjs from this repo; update the kit test fixture
- **S8** — Step 8: Bible library goes away (it duplicates the Shelf: /bible and the old library addresses redirect to Home); Book overview and Timeline become one screen in the Topics layout (left: sections or eras, right: selected item, default overview)
- **S10** — Step 10: About and policies as one screen at /about: left list (About, Privacy, Terms, Storage, Data retention), the right side loads general About content by default and a clicked item replaces it; the old /privacy.html etc. addresses redirect

## All nodes

| Node | Status | Owner | Branch | Depends on | Title |
|---|---|---|---|---|---|
| `A1` | waiting |  |  | `RD` | Accounts: server. Better Auth email+password, username, phone number as a unique login identifier (password, no SMS or code), Google; keep guest (anonymous) and passkey as a first-class method; migration 0001; rate limits |
| `A2` | waiting |  |  | `A1` | Sign-in gate: before a lesson, notes, or feedback, show Sign in / Create account / Continue as guest. Guest choice is remembered on the device (progress and notes stay local) and can be changed in Profile |
| `A3` | waiting |  |  | `A2` | Create-account flow as a popover card: method (Google, email, phone, or passkey), then name or username, then email and/or phone plus password where the method needs one. Existing local progress and notes merge into the new account |
| `A4` | waiting |  |  | `A3` | Profile 'You' section: edit name or username, email, phone, password; sign out; delete account; guest upgrade |
| `A5` | waiting |  |  | `A1` | Security pass: password rules, enumeration-safe errors, lockout, recovery codes, CSP and cookie flags, delete-account data removal |
| `A6` | waiting (Chris) |  |  | `A4`, `A5` | Accounts: end-to-end tests (guest, email, phone, Google with a stub) and docs; Chris sign-off on the live flow |
| `C1` | waiting |  |  | `S7` | Content: one glossary, one definition per term (single file lessons reference; optional per-lesson "in this lesson" notes); resolves the 59 terms defined differently across lessons |
| `C2` | waiting |  |  | `C1` | Content: rewrite all glossary definitions to the voice standard (content.voice.v1-2026-10-05), drafted in batches by module |
| `C3` | waiting (Chris) |  |  | `C2` | Content: Chris approves each glossary batch (old and new side by side) |
| `C4` | waiting |  |  | `S7` | Content: rewrite each lesson as one script (one objective, its points in order, details elaborating each) in the content voice and depth, working lesson by lesson from docs/v7/LESSON_SCRIPTS.md; before/after per lesson |
| `C5` | waiting (Chris) |  |  | `C4` | Content: Chris approves each lesson revision batch |
| `K1` | ready |  |  |  | project-roa-kit 1.2.0: upstream theme contract v11, views.mjs and roa.mjs from this repo; update the kit test fixture |
| `P10` | waiting |  |  | `RD` | Themes 2-8: final values per theme (layouts unchanged) |
| `RD` | waiting (Chris) |  |  | `S7`, `C3`, `S3.G` | Chris approves the redesign |
| `S3.F` | waiting (Chris) |  |  | `S3.E`, `C5` | Step 3: Chris reviews the report and approves the one-time revision edits |
| `S3.G` | waiting |  |  | `S3.F` | Step 3: lock approved parts into content/pathway/lessons; build fails if any part exceeds the budget |
| `S7` | waiting |  |  | `S10`, `S3.I`, `S3.J`, `S4`, `S5a`, `S5b`, `S5c`, `S5d`, `S6`, `S8`, `S9` | Step 7: remove legacy stylesheets and render paths; close the guards |
| `S7b` | waiting |  |  | `RD` | Prune redesign scaffolding tests (screenshot baselines, layout conformance, Component Lab checks, overlapping reader cases) |
| `S8` | ready |  |  | `S5a` | Step 8: Bible library goes away (it duplicates the Shelf: /bible and the old library addresses redirect to Home); Book overview and Timeline become one screen in the Topics layout (left: sections or eras, right: selected item, default overview) |
| `S9` | waiting |  |  | `S5a`, `S8` | Step 9: Search on the Topics layout. A reference goes to the reader; any other query shows grouped instant results (Topics, Glossary, Learning Path lessons, Scripture words) with the selected result on the right; a Scripture word hit opens the reader at that verse. Question-shaped queries also get an 'Ask the Theologian' row that opens the panel with the question filled in (never sent automatically). The glossary and Orientation fold in |
| `S10` | ready |  |  | `S5a` | Step 10: About and policies as one screen at /about: left list (About, Privacy, Terms, Storage, Data retention), the right side loads general About content by default and a clicked item replaces it; the old /privacy.html etc. addresses redirect |
| `F1` | done | Codex | `codex/reader-font-readiness` | `S2` | Reader: wait for the selected theme fonts before mounting and revealing a deep-linked verse |
| `M1` | done | Codex | `codex/roa-manifest-repair` |  | ROA manifest: map the lesson screen and new lesson build scripts for PR 60 |
| `R1` | done | Codex | `feature/redesign-p5-lesson-path` | `S2` | Reader: "a pending reader mount cannot replace the profile after navigation" fails in the parallel run |
| `R2` | done | Codex | `codex/r2-top-bar-spacing` | `S2` | Every page starts close under the top bar: contract test fails on the lesson branch |
| `R3` | done | Claude | `feature/redesign-p5-lesson-path` | `S2` | Reader spec: seed the database only after the reader mounts, wait for queued highlight saves before reloading, and skip the service worker precache these tests do not need |
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
| `S3.C` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.B`, `S3.B7`, `S3.R` | Step 3: lesson card CSS (portrait = phone layout, landscape = desktop layout; type in container units with min/max clamps) |
| `S3.D` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.B`, `S3.R` | Step 3: build-time divider (sentence-safe, step-isolated parts that fit both shapes) with Node unit tests |
| `S3.D2` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.S` | Divider: implement the Scripture reading rule from S3.S; attach "As you read X, notice..." to the reading's last card |
| `S3.D3` | done | Codex | `codex/lesson-catalog-cards` | `S3.D2` | Build emits the divider's cards into the catalog (each lesson step's cards, with ids and reading modes) so the lesson screen renders them; nothing is locked into the sources |
| `S3.D3a` | done | Codex | `codex/lesson-card-catalog-docs` | `S3.D3` | Regenerate the published catalog documentation for provisional lesson cards |
| `S3.E` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.D`, `S3.B7`, `S3.D2` | Step 3: review report of every lesson's proposed parts with weak breaks flagged (docs/v7/LESSON_PAGINATION_REVIEW.md) |
| `S3.H` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.C`, `X1`, `S3.D3` | Step 3: lesson screen renders locked parts (adapt Codex's lesson screen) |
| `S3.I` | done | Claude | `feature/redesign-p5-lesson-path` | `S3.H` | Step 3: tests: sampled browser test of the fullest parts in both shapes; retire the render-every-lesson test |
| `S3.J` | done | Claude | `feature/redesign-p5-lesson-path` | `X1` | Step 3: Learning Path page (path, module and unit on one page) |
| `S3.Q` | done (Chris) |  |  |  | Lesson fonts: ship Source Sans 3 and Literata per the Reading Room theme sheet, or keep the shipped reading font for lesson prose |
| `S3.Q2` | done | Claude + Codex | `feature/redesign-p5-lesson-path` | `S3.Q` | Ship Source Sans 3 (body) and Literata (Scripture) from the site, per S3.Q; wire them into the Reading Room theme values |
| `S3.R` | done (Chris) |  |  | `S3.B7` | Portrait step body: the decided 4:5 box, 49x17 and 1.55 line height cannot all hold with Source Sans 3 (only 15.6 lines fit). Choose: A) 15 lines, B) line height 1.42, C) 3:4 box |
| `S3.S` | done (Chris) |  |  | `S3.D` | Scripture readings longer than one card (100 of 116): A) split at verse boundaries across cards, B) scroll inside the card, C) open in the Bible reader, or A up to 3 cards and C beyond (Claude recommends) |
| `S4` | done | Codex | `codex/s4-shelf-home` | `S2` | Step 4: Shelf home (bookshelf, two-line title, selected-book panel) |
| `S5a` | done | Codex-S5a | `codex/s5a-study-topics` | `S2` | Step 5: Study Topics |
| `S5b` | done | Codex-S5b | `codex/s5b-review-practice` | `S2` | Step 5: Review & Practice |
| `S5c` | done | Codex-S5c | `codex/s5c-profile` | `S2` | Step 5: Profile |
| `S5d` | done | claude | `feature/redesign-p5-lesson-path` | `S4`, `S5a`, `S5b`, `S5c` | Step 5: Activate redesigned Home, Study Topics, Review & Practice, and Profile routes in the screen registry |
| `S6` | done | Codex-S6 | `codex/s6-theologian` | `S3.H` | Step 6: Theologian panel (docked desktop, centered phone, dim overlay) |
| `X1` | done (Chris) |  |  |  | Codex lesson branch committed and pushed (codex/redesign-lesson-path) |
| `SW1` | dropped |  |  | `S2` | Service worker: after a reload under parallel load the page's own fetches (annotations, fonts, corpus, module imports) sit pending behind the worker while the worker has nothing in flight |

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

- 2026-10-05 (Codex): PR #66 merged into feature/redesign-p5-lesson-path after #65 merged into #64 and #64 merged into integration. Git merged the graph correctly but left its generated board stale; regenerating the board from the combined graph. All three nodes remain done; no source content changes. Next: finish the lesson templates before content revision and final break review. Main and production were not touched.
- 2026-10-05 (Codex): Closed through bun run work done R2: spacing contract and verify:fast passed (12 smoke) with CI=1; full verify passed 144/144 and targeted spacing passed 10 repetitions. Board-only investigation; current runtime left unchanged. Next: publish codex/r2-top-bar-spacing as a draft PR into feature/redesign-p5-lesson-path for Chris's review. S3.J must check the replacement Learning Path screen's own top spacing; historical 62px gap was reproduced in the old screen, not shared frame/layout. No other node changed.
- 2026-10-05 (Codex): Done; acceptance passed (bunx playwright test tests/contracts/product-contract.spec.js --grep "starts close under the top bar"; bun run verify:fast).
- 2026-10-05 (Codex): Current integration verified: 10/10 repeated spacing contract runs and full bun run verify with CI=1 (144/144 browser tests; no retries reported; build/BSB/contracts/core passed). Historical failure reproduced twice at 62px on /course in 6f8c2ac; screen-owned learning-path.css causes it, not the frame/layout. Existing integration has removed that unfinished renderer. Next: close via work done, commit this board-only investigation, and present its draft PR for review; S3.J should rerun this contract when introducing the replacement screen.
- 2026-10-05 (Codex): Historical reproduction confirmed on codex/redesign-lesson-path (6f8c2ac) in an ignored archive snapshot: /course first-text gap is 62px, failing the 48px contract on both initial run and retry. That branch mounts learning-path.js, whose screen CSS adds 28px frame margin-top plus internal padding. Current integration leaves course registry null and removes that unfinished screen; the same contract passes. Frame/layout are not the source, so no CSS change is warranted. Next: repeated current-branch contract check and full verify; hand the historical spacing issue to S3.J when its new screen is implemented.
- 2026-10-05 (Codex): Claimed from the latest feature/redesign-p5-lesson-path at Chris's request. Scope is public/ui/components/frame.css and public/ui/layout.css. No implementation changed. Next: reproduce the top-bar spacing contract failure on the lesson branch, then fix only the owned frame/layout paths; preserve Claude's lesson work.
- 2026-10-05 (Codex): Claimed on codex/r2-top-bar-spacing.
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

- 2026-10-06 (Claude): Done; acceptance passed (bun run verify:fast).
- 2026-10-06 (Claude): Portrait = phone layout (4:5 step body; type = box width / 21.7em, clamped 16-20px; at the reference iPhone box 348x435 it is 16.04px). Landscape (orientation landscape and width >= 700px) = desktop layout: sections rail | step | My Notes; 2:1 step body; type = box width / 36em (about 91 chars), clamped 15-22px. Box sized by container query units on .lesson-stage. Enlarged text scrolls inside the box.
- 2026-10-06 (Claude): Claimed on feature/redesign-p5-lesson-path.
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

- 2026-10-05 (Claude): Done; acceptance passed (bun scripts/lesson-pagination-report.mjs --check; bun run verify:fast).
- 2026-10-05 (Claude): docs/v7/LESSON_PAGINATION_REVIEW.md (generated; --check keeps it current). Section 1: 2 short last cards and 29 seams that open mid-paragraph with a word leaning on the previous card (It, This, They, But, So...). Section 2: 72 blocks (mostly checks) opening their own card. Section 3: every lesson in Learning Path order with every break shown as last sentence before / first sentence after. Next: Chris's review (S3.F).
- 2026-10-05 (Claude): Claimed on feature/redesign-p5-lesson-path.
- 2026-10-05 (Claude): List steps that exceed the primary layout but fit fallback D; many such steps is the trigger to switch to D.
- 2026-10-05 (Claude): The report must simulate wrapping with the shipped Source Sans 3 widths (S3.B7), not Caladea.

### S3.F — Step 3: Chris reviews the report and approves the one-time revision edits

- 2026-10-05 (Claude): Deferred until the lesson content is revised (C5): reviewing breaks on text about to change is wasted work. Regenerate the report (S3.E) first.

### S3.H — Step 3: lesson screen renders locked parts (adapt Codex's lesson screen)

- 2026-10-06 (Claude): Done; acceptance passed (bun run verify:fast).
- 2026-10-06 (Claude): public/ui/screens/lesson.js renders catalog cards (lesson.sections[].cards) as steps; /course?unit=&lesson=&step=n; checkpoints (?mastery=) still use the current view. Sections rail with step dots; progress 'n of m' plus segmented bar; tools open a study sheet (apparatus) on portrait, rail buttons on landscape; Questions jumps to the first step with a check; readings inline (ScriptureBlock) or link + native dialog popover with Open in the Bible; one My Notes editor moved between side column (landscape) and sheet (portrait); arrow keys page. Notes editor everywhere drops the in-person flag and Ask link (decisions), keeping existing flags. Not yet: Theologian tab behaviour (S6), Checkpoint screen, rotate hint.
- 2026-10-06 (Claude): Claimed on feature/redesign-p5-lesson-path.
- 2026-10-05 (Claude): Render the cards the build emits (S3.D3), not locked sources: card breaks are reviewed only after the content revision (redesign.sequence.content-after-templates-2026-10-05).
- 2026-10-05 (unknown): Build the reading popover per ui.lesson.reading.inline-or-popover-2026-10-05: centered over a dimmed screen on phones, beside the link on desktop; passage scrolls inside; Open in the Bible; closes with close button, Escape, or the dimmed area; focus returns to the link. Inline readings use the ScriptureBlock look with extra padding, scriptureBed surface and the group stripe.

### S3.I — Step 3: tests: sampled browser test of the fullest parts in both shapes; retire the render-every-lesson test

- 2026-10-06 (Claude): Done; acceptance passed (bunx playwright test tests/redesign/lesson-screen.spec.js tests/contracts/product-contract.spec.js; bun scripts/test-lesson-divider.mjs; bun run verify:fast).
- 2026-10-06 (Claude): Acceptance corrected: it named tests/redesign/lesson.spec.js, which only exists on codex/redesign-lesson-path (never merged). It now runs the lesson-screen spec, the contract spec, the divider unit tests and verify:fast.
- 2026-10-06 (Claude): Contract tests that assumed the old scene-based lesson (one step per section, .scene-rail dots, Study Desk) are rewritten for the redesigned lesson screen: sections list with per-step dots, sections spanning several steps, inline checks, Scripture contrast in light and dark for both the quoted block and the popover, objectives never inside the lesson, My Notes separate from the apparatus. tests/redesign/lesson-screen.spec.js covers the step body shapes, 'n of m', the popover and the notes editor. Lesson screen also gained the titlebar Feedback button (study focus hides the masthead) and escapes quoted Scripture. The old render-every-lesson test was never merged here (it lived on Codex's branch), so there is nothing to retire; the build-time divider tests cover every lesson without a browser.
- 2026-10-06 (Claude): Claimed on feature/redesign-p5-lesson-path.

### S3.J — Step 3: Learning Path page (path, module and unit on one page)

- 2026-10-07 (Claude): Done; acceptance passed (bunx playwright test tests/redesign/learning-path.spec.js --workers=1; bun run verify:fast).
- 2026-10-07 (Claude): RECONCILED with Codex's parallel build (codex/s3j-learning-path, 4 files, source only, registry untouched, never wired or browser-tested). Claude's version is the one of record: wired into the registry through ui/screens/course.js (so Codex's separate S3.J2 "registry activation" is done for this screen), mockup-faithful (modules rail with lesson counts, Capstones, phone picker), 6 browser specs. Taken from Codex's branch: painting progress-bar widths from script because the CSP ignores inline widths (Claude's page drew every bar full; fixed in the shared component as mountProgressBars), and the isCurrent guard. Not taken: progress counted as "scored activities" (the mockup counts lessons), unit scope paragraph. Still open from Codex's notes: a 320px-wide check. Why this happened twice: Claude's claim was committed locally but never reached GitHub, so the shared-board check could not see it. Claims must be pushed before work starts.
- 2026-10-07 (Claude): Learning Path page built to the confirmed mockup (docs/v7/mockups-2026-10-03/LearningPath.dc.html): modules rail with 'n of m lessons' and Capstones; the open module with units as accordions (one open at a time, address follows ?unit=); each unit lists numbered lessons with their objectives, its Checkpoint ('Checkpoint · <unit title>', never locked) and any older practice; Up next (first unfinished lesson, then the Checkpoint) and three progress bars (unit, module, path) counted in lessons. The words Module and Unit never appear (ui.naming.hide-module-unit-labels). Phone: one column, Up next first, picker instead of the rail, Progress last. /course now dispatches through ui/screens/course.js: ?lesson= -> lesson screen, ?mastery=, ?glossary= and unit.orientation stay on the old view until their steps. Rail component gained the optional sublabel line it already accepted. Old course/unit contract assertions rewritten for this page. Step counts are not shown on lesson rows (Chris has not decided; the copy rewrite will change them).
- 2026-10-06 (Claude): Claimed on feature/redesign-p5-lesson-path.
- 2026-10-05 (unknown): Checkpoint placement depends on content and number of steps, not one per unit or lesson (curriculum.checkpoint.placement-content-and-steps-2026-10-05). The Learning Path page must render checkpoints wherever the content places them; the exact rule is still to be given by Chris.
- 2026-10-05 (unknown): Checkpoint is named plain 'Checkpoint' with the unit title (ui.naming.checkpoint-bare-2026-10-05). Open question for Chris: one Checkpoint per unit or per lesson.
- 2026-10-05 (unknown): Per ui.naming.hide-module-unit-labels-2026-10-05: do not show the words Module or Unit to learners (titles only); Lesson and Step stay; keep 'Unit N Checkpoint'. Check tests/redesign/vocabulary-guard.spec.js for terms to adjust.

### S4 — Step 4: Shelf home (bookshelf, two-line title, selected-book panel)

- 2026-10-07 (Claude): INTEGRATED: codex/s4-shelf-home merged (source only) and wired into the registry (home -> shelf-home.js). Review found three defects that Codex's isolated probe could not see once the screen was live, all fixed: (1) the page security policy (style-src 'self') blocks inline style attributes, so every book was the same width (Psalms = Obadiah = Genesis = 21px) and the New Testament row did not fill 80%; the component now emits data-book-weight / data-books-fill and a new mountBookshelf() applies them through the CSSOM; the reading-position bar uses the same approach (data-progress); (2) the screen passed each book's cat but the component reads group, so all 66 books were the Law colour; (3) the notes card heading was oversized and the top padding broke the page-top rule (R2). Contract tests that counted 66 Bible links on Home now count the 66 shelf books; tests/redesign/shelf-home.spec.js (5 tests) added. 83 of 85 affected specs passed first run; the 2 failures were the padding and a legend assertion, both fixed. Same CSP pitfall applies to any component that renders style= in an HTML string (S5a/S5b/S5c/S6 to be checked).
- 2026-10-07 (Chris): Implementation approved by Chris; record: approved-the-completed-s4-s5a-s5b-s5c-and-s6-imp (scope: S4, S5a, S5b, S5c, S6).
- 2026-10-07 (Codex): Imported existing done record from codex/s4-shelf-home at 5226ada; acceptance and full verification were completed on that branch. Implementation remains on its source branch and is not merged by this board update.
- 2026-10-07 (Codex): Done; acceptance passed (bun run verify:fast).
- 2026-10-07 (Codex): Reopened after independent review found saved-chapter, My Notes card, and bookshelf support placement issues; fix within existing S4-owned paths, then repeat serialized full verification.
- 2026-10-07 (Codex-S4): Done; acceptance passed (bun run verify:fast).
- 2026-10-07 (Codex-S4): Full verify passed (149/149) after verify:fast; S5d separately owns registry activation. S4 implementation is ready for review.
- 2026-10-07 (Codex-S4): Implemented the Shelf home screen and proportional Bookshelf component; build, contract, BSB, service-worker, ROA, verify:fast and full verify passed (149/149). S5d owns registry activation; S4 stays claimed pending review. No push or PR.
- 2026-10-07 (Codex-S4): Claimed on codex/s4-shelf-home.

### S5a — Step 5: Study Topics

- 2026-10-07 (Codex-S5a): Integrated: registry.topics wired. Fixed Codex's side panel (Scripture connections and Learning Path sections rendered twice from a triple-duplicated template). Legacy /topics?topic=<id> links (search results, related links) open the full topic page; mode=ask maps to questions; any topic id selects even outside the current group. Card links always carry the mode. Top spacing for the R2 rule. vocabulary-guard selector updated for Profile (also missed in S5c). tests/redesign/topics.spec.js (5). No inline style=.
- 2026-10-07 (Chris): Implementation approved by Chris; record: approved-the-completed-s4-s5a-s5b-s5c-and-s6-imp (scope: S4, S5a, S5b, S5c, S6).
- 2026-10-07 (Codex): Imported existing done record from codex/s5a-study-topics at 87219ea; acceptance and full verification were completed on that branch. Implementation remains on its source branch and is not merged by this board update.
- 2026-10-07 (Codex-S5a): Full CI=1 bun run verify passed: 149 tests with 2 workers. bun run work done S5a also passed verify:fast (13/13 smoke), so S5a is done. Registry activation remains assigned to S5d.
- 2026-10-07 (Codex-S5a): Done; acceptance passed (bun run verify:fast).
- 2026-10-07 (Codex-S5a): CI=1 bun run verify:fast passed, including 13/13 smoke tests at 2 workers. The S5a screen module is implemented and bundled but remains inactive because registry.js is outside this node’s owned paths; coordinate that integration separately. Chris’s full verify is still required before S5a closes.
- 2026-10-07 (Codex-S5a): Built the Study Topics browse, search, selected-topic detail, glossary, Scripture references, Learning Path links, and topic-anchored notes in topics.js/topics.css. Targeted JS bundle and diff checks pass; next run verify:fast, then Chris runs full verify on laptop before S5a closes.
- 2026-10-07 (Codex-S5a): Claimed on codex/s5a-study-topics.

### S5b — Step 5: Review & Practice

- 2026-10-07 (Codex-S5b): Integrated: registry.practice wired (owns plain /practice only; ?mode=, ?arcade=, ?play= still render through practice-experience.js, so S7 cannot delete that file). Shared progress-bar no longer emits style= (CSP logged an error on every bar): width comes from data-fill via mountProgressBars, now also called by the lab. Rail top padding and screen padding for the R2 page-top rule. Found: /practice#backup never existed and no Export/Restore UI existed anywhere (handlers on #export/#import are in app.js); Profile now has the real buttons. tests/redesign/practice.spec.js (5) + Profile backup test. Flaky candidate: reader.spec 'Notes and Theologian share tab sizing' failed once under load in a 175-test serial run, passes alone (hit-test while the chat panel animates).
- 2026-10-07 (Chris): Implementation approved by Chris; record: approved-the-completed-s4-s5a-s5b-s5c-and-s6-imp (scope: S4, S5a, S5b, S5c, S6).
- 2026-10-07 (Codex): Imported existing done record from codex/s5b-review-practice at 82cf8f1; acceptance and full verification were completed on that branch. Implementation remains on its source branch and is not merged by this board update.
- 2026-10-07 (Codex-S5b): Done; acceptance passed (bun run verify:fast).
- 2026-10-07 (Codex-S5b): Self-contained Review & Practice overview is implemented in the owned practice.js/practice.css files: due-review entry, optional game tiles, future-game list, and personal progress summary; module build and CI=1 verify:fast passed (13/13 smoke). Activation remains deferred to separate S5d because the practice screen registry path is outside S5b ownership. Keep this node claimed and pending Chris's full verification on laptop; do not mark done yet.
- 2026-10-07 (Codex-S5b): Claimed on codex/s5b-review-practice.

### S5c — Step 5: Profile

- 2026-10-07 (Codex-S5c): Integrated into feature/redesign-p5-lesson-path: registry.profile wired; theme-card and mode-toggle styles moved into profile.css (they lived only in legacy canonical-shelf.css, which S7 deletes); theme.js aria-pressed now a real true/false (was an empty attribute); page-top spacing for the R2 rule; contract/reader/font-readiness selectors updated; tests/redesign/profile.spec.js (4). No inline style= in the screen. Chris's full verify: 160/160 at 2 workers.
- 2026-10-07 (Chris): Implementation approved by Chris; record: approved-the-completed-s4-s5a-s5b-s5c-and-s6-imp (scope: S4, S5a, S5b, S5c, S6).
- 2026-10-07 (Codex): Imported existing done record from codex/s5c-profile at 8b763b6; acceptance and full verification were completed on that branch. Implementation remains on its source branch and is not merged by this board update.
- 2026-10-07 (Codex-S5c): Done; acceptance passed (bun run verify:fast).
- 2026-10-07 (Codex-S5c): Accessibility fix: Light/Dark/System radio group now has roving tabindex, wrapping arrow-key selection, and Home/End support. Static checks passed; post-fix CI=1 verify:fast and full CI=1 bun run verify passed (149/149, 2 workers). Focused keyboard browser regression test remains a separate test-path node/S5d scope.
- 2026-10-07 (Codex-S5c): Post-edit CI=1 bun run verify:fast passed, including smoke 13/13 (2 workers). Profile module is ready for S5d route activation; full bun run verify remains for Chris's laptop. Node stays claimed for review.
- 2026-10-07 (Codex-S5c): Implemented the full-screen Profile module and structural layout in the owned files; account, progress, notes, appearance, reading, and privacy controls are retained. Route activation is separate S5d. Static checks pass; waiting for the coordinated CI=1 verify:fast run.
- 2026-10-07 (Codex-S5c): Claimed on codex/s5c-profile.

### S5d — Step 5: Activate redesigned Home, Study Topics, Review & Practice, and Profile routes in the screen registry

- 2026-10-07 (claude): Registry entries for home, topics, practice, profile were activated screen by screen during S4/S5a/S5b/S5c/S6 integration (each with its own tests); this node's acceptance (verify:fast: build, BSB, contracts, service worker, core, roa verify, work check, 19 smoke tests) passed. Also took codex/pr60-work-offline-fix (WORK_OFFLINE=1 now actually overrides the shared-board check) and added optional PW_CHROMIUM_PATH to playwright.config.js for machines whose Chromium build differs.
- 2026-10-07 (claude): Done; acceptance passed (bun run verify:fast).
- 2026-10-07 (claude): Claimed on feature/redesign-p5-lesson-path.
- 2026-10-06 (Chris): Chris authorized a separate node because registry.js is outside the individual screen nodes. Register the completed Home, Topics, Practice, and Profile screens here; do not change their modules or other paths.

### S6 — Step 6: Theologian panel (docked desktop, centered phone, dim overlay)

- 2026-10-07 (Codex-S6): Integrated (source only changed public/theologian-chat.js open/close wiring; engine, policies, crisis paths, cloud calls untouched; test:theologian passes). Fixes: stylesheet was injected from JS into body (late, uncached): now a static link in index.html; theologian-panel.css/js added to the service worker shell list (without that the chat module import would fail offline) and sw stamp refreshed; manifest entry. Deviation to note for RD: desktop is a floating fixed panel at the right edge, not a column inside the reader (decision text says 'docked in the right column'); phone is the centered card with dim, inert background, focus trap, backdrop click closes. Not done: Scripture-cited section open by default, suggestions-inside-conversation and removable passage chip are the chat's own render and were left as they are. tests/redesign/theologian-panel.spec.js (3).
- 2026-10-07 (Chris): Implementation approved by Chris; record: approved-the-completed-s4-s5a-s5b-s5c-and-s6-imp (scope: S4, S5a, S5b, S5c, S6).
- 2026-10-07 (Codex): Imported existing done record from codex/s6-theologian at f63cf9c; acceptance and full verification were completed on that branch. Implementation remains on its source branch and is not merged by this board update.
- 2026-10-07 (Codex-S6): Done; acceptance passed (bun run test:theologian; bun run verify:fast).
- 2026-10-07 (Codex-S6): Fast gate passes after preserving Theologian tab visibility and loading component CSS from body; 13/13 smoke tests. Next: full bun run verify, then work done S6 if acceptance passes.
- 2026-10-07 (Codex-S6): Full verify passed 148/149; preserve the existing phone contract that the Theologian tab remains visible while open. Removed the hide rule. Next: rerun fast and full verification.
- 2026-10-07 (Codex-S6): Implemented the panel shell in the three owned paths; build:app and test:theologian pass. Next: run serialized verify:fast and full verify, then work done S6 if both pass.
- 2026-10-07 (Codex-S6): Claimed on codex/s6-theologian.

### S7 — Step 7: remove legacy stylesheets and render paths; close the guards

- 2026-10-07 (Claude): Experiment branch experiment/drop-legacy: with every legacy stylesheet removed all 186 tests pass, but the Bible library/Timeline/book profile, Search, Glossary, Orientation, practice modes and the static pages render unstyled. S8-S10 replace all but the practice modes (deferred by Chris). S7 deletes the legacy layer after them. Legacy files archived in canonical-shelf-legacy-2026-10-07.zip.
- 2026-10-08 (unknown): Checkpoint fit: all 119 Checkpoint, Capstone and older practice items fit their card with no scrolling at 390x844 and 1280x720 (multi-question checks page one question at a time; long reorder lists use two columns; long introductions split across cards). Full redesign+contracts: 186 passed.
- 2026-10-07 (unknown): Chris decision ui.type.max-genesis-2026-10-07: --type-max (Genesis size) caps all text; site title only exception. Guard: tests/redesign/type-cap.spec.js (15+ routes x phone/desktop/1920). Checkpoints now render on the lesson screen (?mastery=). Full redesign+contracts: 185 passed.
- 2026-10-07 (unknown): Chris 2026-10-07: leave the practice modes (review, verse library, arcade, achievements) until he has played with them live; their rebuild must continue the rail and side panels (ui.practice.modes.continue-side-panes-2026-10-07). Checkpoints and Capstones now render on the lesson screen (one intro step and one check step; older practice keeps its own title); S7 may delete the old mastery view in learning.js after the contract tests pass. Unit check content wording fixed at source: title 'Checkpoint · <unit>' and 'This Checkpoint combines…' (was 'Unit Mastery' / 'This mastery check').

### RD — Chris approves the redesign

- 2026-10-05 (Claude): Chris approves the redesign after the content track (glossary and lesson revision) and locked card breaks are in place.

### K1 — project-roa-kit 1.2.0: upstream theme contract v11, views.mjs and roa.mjs from this repo; update the kit test fixture

- 2026-10-05 (unknown): When upgrading the kit, consider named shared font slots (body, reading, display) so themes reference fonts instead of setting stacks; S3.Q2 set Reading Room's body and Scripture fonts as theme-level stacks because the v11 contract only has serif/sans/mono.
- 2026-10-05 (Claude): Separate repository (C:/dev/project-roa-kit). Until done, never re-copy the upstream kit into .roa-kit/: it would pin a contract version the kit does not have.

### S3.Q2 — Ship Source Sans 3 (body) and Literata (Scripture) from the site, per S3.Q; wire them into the Reading Room theme values

- 2026-10-05 (Claude): Shipped twice in parallel (Claude on feature/redesign-p5-lesson-path, Codex in PR #62) because each read the board from its local copy. Reconciled on the lesson branch: Codex's shipment is the one of record (400/600/700 with italics, OFL notices, full-suite verification that found F1); Reading Room keeps its Caladea/Cascadia Mono source so its title and label fonts do not depend on other themes. Calibration rerun against the static weight files.
- 2026-10-05 (Codex): Closed through work done on the tested combined stack: verify:fast passed (12 smoke) with CI=1; full combined runtime verify passed 144 browser tests. Source Sans 3/Literata assets and licenses are committed on the parent branch. Completion status is carried by the dependent F1 child PR; include F1 before merging the font shipment. S3.B7 is ready on the combined stack, and S3.H owns font readiness for locked lesson parts. No Claude-owned node changed.
- 2026-10-05 (Codex): Done; acceptance passed (bun run verify:fast).
- 2026-10-05 (Codex): Combined stack now passes full verify (CI=1, 144/144). Font shipment depends on F1's font-safe reader mount; keep the separate draft PRs stacked and do not merge the parent without including F1. S3.B7 gets the shipped fonts; S3.H still owns waiting for its selected theme fonts before locked-part lesson rendering. Next: close both nodes through work done on the verified combined stack, commit the handoff, and publish draft PRs for review.
- 2026-10-05 (Codex): Full verify exposed a font-dependent reader deep-link regression: 140 passed, Psalm 119:105 phone visibility failed on both attempts. Added F1 as a dependency under the board's path-ownership rule. Assets and theme values are ready; F1 will wait for reading fonts before mount, preserve navigation cancellation, and handle failed downloads. Commit the font shipment and graph now after verify:fast; F1 gets its own branch and draft PR, with Q2 closure awaiting integration approval.
- 2026-10-05 (Codex): Shipped 8 new Latin/Latin-ext woff2 assets and upstream OFL notices through fontSources; Reading Room fontBody is Source Sans 3 and fontReading is Literata. Generated theme CSS/docs/tests regenerated by roa; other theme values and display/label stacks unchanged. Chromium loads all 12 regular/semibold/bold normal/italic combinations and confirms custom-font glyphs for both roles, with zero third-party browser requests. S3.B7 can recalibrate against these faces; S3.H must await selected-theme document.fonts.load before rendering locked parts, as the existing Q2 handoff requires (lesson runtime is outside this node's owned paths). Next: full verify, node acceptance, final review and commit.
- 2026-10-05 (Codex): Claimed the approved font shipment: keep existing fontSources generation, ship Source Sans 3 body faces and Literata Scripture faces, and update only Reading Room values. Existing themes keep their fonts. First commit is the claim; next fetch licensed assets, regenerate theme output, verify the actual browser font faces and run the required gates.
- 2026-10-05 (Codex): Claimed on codex/ship-reading-room-fonts.
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

### F1 — Reader: wait for the selected theme fonts before mounting and revealing a deep-linked verse

- 2026-10-05 (Codex): Closed through work done: final fixture uses intercepted theme CSS instead of forbidden DOM/style observers; three regression tests, ten distant-verse repetitions, and verify:fast (12 smoke) passed with CI=1. Full combined runtime verify passed 144 browser tests before the fixture-only guard correction. Commit the reader fix and both completion handoffs on the child branch; keep the two draft PRs stacked for Chris's approval.
- 2026-10-05 (Codex): Done; acceptance passed (bunx playwright test tests/redesign/font-readiness.spec.js; bunx playwright test tests/redesign/reader.spec.js --grep "opening a distant verse" --repeat-each=10; bun run verify:fast).
- 2026-10-05 (Codex): Full bun run verify passed with CI=1: 144/144 browser tests, no retries reported, plus build/BSB/contracts/core checks. Self-review: readiness runs in parallel with data, all layout writes remain after isCurrent, failed font downloads fall back, and tests use an arbitrary bundled real font instead of freezing a family choice. Next: node acceptance and commit the F1 fix; draft PR is stacked on the font shipment, with merge reserved for Chris.
- 2026-10-05 (Codex): The new delayed-font test failed before the fix (readerFontAtMount false), then all 3 tests passed with the fix. The reader now waits for selected body/reading fonts (400/600/700 normal and italic, Latin and Latin-ext) in parallel with annotations/highlights; the existing isCurrent guard follows the whole wait. Missing fonts are allowed to fall back. Original Psalm 119:105 test repeated 10/10 successfully. Next: full verification, node acceptance, commit, and two draft PRs for Chris's integration review.
- 2026-10-05 (Codex): Claimed the font-readiness regression fix on a branch stacked on codex/ship-reading-room-fonts. First commit is this claim; next add behavior tests with a real delayed font, wait before reader layout/reveal, and retain cancellation and missing-font fallback. Font shipment node remains open until this separately reviewed dependency is integrated.
- 2026-10-05 (Codex): Claimed on codex/reader-font-readiness.
- 2026-10-05 (Codex): S3.Q2 font shipment exposes this: full CI-configured verify has 140 passed and the Psalm 119:105 phone deep-link test fails twice because the reader reveals the verse before Literata settles. Reader paths are outside Q2 scope, so this node owns the fix; preserve navigation-generation cancellation and graceful missing-font fallback.

### S3.D3 — Build emits the divider's cards into the catalog (each lesson step's cards, with ids and reading modes) so the lesson screen renders them; nothing is locked into the sources

- 2026-10-05 (Claude): Claude claimed S3.D3 locally but did not push the claim, so the shared-board check could not see it; Codex's S3.D3 is the one of record. Claude then changed the divider to break rule v2 (sections divided independently; divideLesson returns a flat list of steps tagged with section), and adapted compile-pathway to group them by section.
- 2026-10-05 (Codex): Closed through work done: compile:pathway, divider tests, and verify:fast (12 smoke) passed; full verify passed 144/144 with CI=1 and no retries reported. Complete catalog consumer probe passes for all 119 lessons/1042 cards. Source-only change; generated llms.txt is owned by dependent S3.D3a and must accompany this change. New untracked docs/content-revisions files appeared independently and are excluded. Next: commit the source node and regenerate/document its dependent output before draft review.
- 2026-10-05 (Codex): Done; acceptance passed (bun run compile:pathway; bun scripts/test-lesson-divider.mjs; bun run verify:fast).
- 2026-10-05 (Codex): Implemented the approved provisional handoff: compile-pathway loads the existing divider context once and adds its complete cards to each authored section in the catalog. Source sections, blocks, anchors, lesson/activity IDs and challenge ordering stay intact; the source files and divider rules are unchanged. Consumer probe was red for missing cards, now passes across 119 lessons and 1042 cards; divider unit tests pass. Next: full verify, node acceptance, commit, then lesson CSS/renderer work. The 637/46 content rule and final break review remain deferred pending recovery/content revision.
- 2026-10-05 (Codex): Continuing Chris's requested sequence: finish redesign templates before content/glossary revision and final break review. Emit provisional divider output in the catalog for the lesson renderer; preserve authored sections, source files, stable section/activity IDs, and current content. The pasted 637/46 counting changes are not published on the shared branch, so this node will expose current divider output without treating it as locked final pagination. No Claude-owned node changes. Next: verify and commit the claim, then wire the existing divider into compile-pathway.
- 2026-10-05 (Codex): Claimed on codex/lesson-catalog-cards.
- 2026-10-05 (Claude): Per redesign.sequence.content-after-templates-2026-10-05: the screen renders live divider output until the content revision is done; S3.G later locks reviewed cards.

### C4 — Content: rewrite each lesson as one script (one objective, its points in order, details elaborating each) in the content voice and depth, working lesson by lesson from docs/v7/LESSON_SCRIPTS.md; before/after per lesson

- 2026-10-06 (Claude): Lesson 1 (begin) done and approved as the calibration lesson (content.lesson-01-approved-2026-10-06): docs/v7/content-revision/lesson-01-begin.steps.md + .meta.md. Source for rewrites is the pre-Codex text in content/pathway/legacy-ledger.json, not the current lesson files. Process: script in Chris voice -> Claude Doc review with comments -> divide by break rule v3 -> Chris adjusts -> approve. Paused until the redesign is done (Chris, 2026-10-06).
- 2026-10-05 (Claude): Governed by content.lesson-shape.v1-2026-10-05 and content.voice.v2-2026-10-05. Regenerate the compiled scripts with bun scripts/lesson-scripts-export.mjs; after rewriting, rerun the divider and its tests and regenerate LESSON_CARDS.md, then the pagination review (S3.E) before S3.F.

### S3.D3a — Regenerate the published catalog documentation for provisional lesson cards

- 2026-10-05 (Codex): Closed through work done: generation and verify:fast (12 smoke) passed with CI=1. Combined catalog source and documentation already passed full verify 144/144, divider unit tests and all 119 lesson/1042 card consumer checks. Only generated llms.txt and this node's handoff are committed here. Next: review the stacked source/output drafts together before merging. Independently created content-revision files are left untouched.
- 2026-10-05 (Codex): Done; acceptance passed (bun run generate:llms; bun run verify:fast).
- 2026-10-05 (Codex): Claimed after the source node passed full verify (144/144), divider unit tests and complete catalog consumer checks. Only generated public/llms.txt is owned; regenerate from the catalog without changing curriculum text. Next: commit this claim, close acceptance and commit the generated output. New docs/content-revisions files remain untouched.
- 2026-10-05 (Codex): Claimed on codex/lesson-card-catalog-docs.
- 2026-10-05 (Codex): S3.D3 adds provisional cards to the catalog; generate:llms embeds that catalog and regenerates the tracked public/llms.txt. This dependent output node keeps the generated update within declared ownership; no hand edits or content revisions.

### R3 — Reader spec: seed the database only after the reader mounts, wait for queued highlight saves before reloading, and skip the service worker precache these tests do not need

- 2026-10-07 (Claude): Chris measured the full verify on his 12-core laptop: it fails at the default 6 workers and passes with $env:CI=1 (2 workers AND one retry). That supports load-sensitivity (not product bugs) but does not separate workers from the retry. playwright.config.js now defaults to 2 workers everywhere (PW_WORKERS overrides) and keeps the retry CI-only; next measurement: plain `bun run verify` (2 workers, no retry), and `CI=1 bun run verify` to list the tests reported "flaky".
- 2026-10-06 (Claude): Done; acceptance passed (bunx playwright test tests/redesign/reader.spec.js --repeat-each=2; bun run verify:fast).
- 2026-10-06 (Claude): Corrected: the failures reproduced here only because this sandbox has one CPU (see SW1). The edits are still right on their own: (1) seeding right after goto could race the app's startup write; (2) a reload straight after clicking a highlight colour can drop the queued save, so the spec now waits until the saved ranges show the colour; (3) the service worker pre-caches about 130 files on first visit, which is extra load when many browsers run at once and is irrelevant to these tests (verify:sw covers it). Chris's 12-core run failed 1 of 149 on the legacy-notes test; unconfirmed whether these edits remove it.
- 2026-10-06 (Claude): Claimed on feature/redesign-p5-lesson-path.
- 2026-10-06 (Claude): Found from Chris's full run (148/149). Not caused by the notes-editor change: it fails identically with the old study-notes.js. The app renders the seeded note correctly when given time; the test needs to wait for [data-reader] before seeding.

### SW1 — Service worker: after a reload under parallel load the page's own fetches (annotations, fonts, corpus, module imports) sit pending behind the worker while the worker has nothing in flight

- 2026-10-06 (Claude): RETRACTED. The sandbox where this was measured has ONE CPU: a reload takes 1.2 s alone and about 9.8 s with six browsers at once, which exceeds the 7 s expect timeout. Every "fails under parallel load" result (legacy notes, highlights) came from that starvation; the service worker only added install work. There is no evidence of a service-worker defect. If it ever shows up on a many-core machine with an idle CPU, reopen with a real reproduction.
- 2026-10-06 (Claude): Found while chasing reader.spec "legacy notes remain readable" (148/149 on Chris's run). Reproduces only with the service worker allowed, 3+ browsers on one test server, and a reload right after the first visit: 0 of 6 pass at 3 workers, 6 of 6 with serviceWorkers blocked or 1 worker. After the reload the router starts one render and stalls in a fetch; /data/bsb-annotations/<n>.json (and sometimes font files) stay pending while the worker has no requests of its own in flight. NOT the cause: the notes-editor change (fails identically with the old file), waiting for the worker to control the page, waiting for its six-file data precache. Suspects to check: the /data/ cache-first handler awaits cache.put(response.clone()) before returning the response (a large body plus a tee can stall the page until the put completes); 129-file install precache; HTTP/1.1 six-connection limit on the test server. Likely harmless on HTTP/2 production, but a stalled first reload would be a real defect. Tests meanwhile: reader.spec.js blocks the service worker (R3).

### M1 — ROA manifest: map the lesson screen and new lesson build scripts for PR 60

- 2026-10-07 (Codex): Done; acceptance passed (node .roa-kit/roa.mjs verify --base origin/feature/redesign-p4-reader; bun run verify:fast).
- 2026-10-07 (Codex): Added the exact Learning Path screen mapping after S3.J’s base-aware ROA check exposed it; generated state and README are synced. Next run the node acceptance and close M1.
- 2026-10-06 (Codex): Mapped the lesson screen and all eight new lesson script paths with specific manifest descriptions; ROA sync regenerated the project state and README. Next run the PR 60 base-aware check, fast and full verification, then close the node.
- 2026-10-06 (Codex): Claimed on codex/roa-manifest-repair.
- 2026-10-06 (Codex): PR 60 base-aware ROA check reports newly added governed lesson UI and lesson build scripts without exact manifest mappings. Map every reported file and its purpose, regenerate ROA outputs, then verify against PR 60 P4 base and the fast suite.

### A1 — Accounts: server. Better Auth email+password, username, phone number as a unique login identifier (password, no SMS or code), Google; keep guest (anonymous) and passkey as a first-class method; migration 0001; rate limits

- 2026-10-07 (Claude): Own branch feature/accounts, started after Chris approves RD. Chris 2026-10-07: phone is only a unique identifier, no 2FA or verification; Apple skipped for now; name or username required; email and/or phone plus password. Supersedes the passkey-only account decision (passkey stays as an optional extra).

### A2 — Sign-in gate: before a lesson, notes, or feedback, show Sign in / Create account / Continue as guest. Guest choice is remembered on the device (progress and notes stay local) and can be changed in Profile

- 2026-10-07 (Claude): Chris 2026-10-07: the gate also covers feedback (lessons, My notes, feedback). Passkey is an offered sign-in and create method.
- 2026-10-07 (Claude): One shared popover card; no per-screen copies. Not shown again after a choice.

### A3 — Create-account flow as a popover card: method (Google, email, phone, or passkey), then name or username, then email and/or phone plus password where the method needs one. Existing local progress and notes merge into the new account

- 2026-10-07 (Claude): Passkey is a first-class method alongside Google, email and phone; a passkey account still needs a name or username.
- 2026-10-07 (Claude): Phone-only accounts have no password recovery without email; A5 decides the recovery path (recovery codes, per the earlier decision).

### A4 — Profile 'You' section: edit name or username, email, phone, password; sign out; delete account; guest upgrade

- 2026-10-07 (Claude): Everything entered in the creation flow must be editable here (Chris 2026-10-07).

### A5 — Security pass: password rules, enumeration-safe errors, lockout, recovery codes, CSP and cookie flags, delete-account data removal

- 2026-10-07 (Claude): Review before any real user signs up.

### A6 — Accounts: end-to-end tests (guest, email, phone, Google with a stub) and docs; Chris sign-off on the live flow

- 2026-10-07 (Claude): Google needs a Google Cloud OAuth client id and secret from Chris; email sender (free tier) needs a key; both go in Worker secrets, never the repo.

### S8 — Step 8: Bible library goes away (it duplicates the Shelf: /bible and the old library addresses redirect to Home); Book overview and Timeline become one screen in the Topics layout (left: sections or eras, right: selected item, default overview)

- 2026-10-07 (Claude): Chris 2026-10-07: approved. Maps (already disabled) is dropped. The Shelf book panel keeps its Book overview link.

### S9 — Step 9: Search on the Topics layout. A reference goes to the reader; any other query shows grouped instant results (Topics, Glossary, Learning Path lessons, Scripture words) with the selected result on the right; a Scripture word hit opens the reader at that verse. Question-shaped queries also get an 'Ask the Theologian' row that opens the panel with the question filled in (never sent automatically). The glossary and Orientation fold in

- 2026-10-07 (Claude): Chris 2026-10-07: approved. Glossary links (?glossary=) redirect into Study Topics glossary mode. Check whether the Orientation unit is a normal Learning Path unit.

### S10 — Step 10: About and policies as one screen at /about: left list (About, Privacy, Terms, Storage, Data retention), the right side loads general About content by default and a clicked item replaces it; the old /privacy.html etc. addresses redirect

- 2026-10-07 (Claude): Chris 2026-10-07: approved; same two-pane layout as Topics.

