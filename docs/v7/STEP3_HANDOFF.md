# Step 3 handoff — Lesson and Learning Path

Living document. Whoever is working on Step 3 (Claude or Codex) updates the **Status** table and **Next actions** at
every commit, so the work can change hands at any point without a briefing.

- **Branch:** `feature/redesign-p5-lesson-path`, cut from `feature/redesign-p4-reader` (Step 2 reader, Codex's
  `codex/resume-reader` plus the 2026-10-05 decisions and two-speed verification).
- **Owner now:** Claude, until its usage runs out; then Codex.
- **Plan:** `docs/v7/PLAN_IMPLEMENTATION_2026-10-03.md` (phase 5) as amended by
  `docs/v7/PLAN_IMPLEMENTATION_AMENDMENT_2026-10-04.md` and the decisions below.
- **Visual reference:** `docs/v7/mockups-2026-10-03/` — `Lesson.dc.html`, `PhoneLesson.dc.html`, `LearningPath.dc.html`.

## Decisions that govern this step (all recorded in `.roa/records`)

| Record | What it requires |
|---|---|
| `curriculum.lesson.pagination.build-time-2026-10-05` | Parts are decided at build and locked into the lesson sources. A sentence is never split across parts; content never moves between steps. The screen does no measuring. Enlarged text scrolls inside its box, never clips. |
| `ui.lesson.card.orientation-2026-10-05` | Two card layouts by screen shape: portrait = phone layout decisions, landscape = desktop layout decisions. Text box about 3:5 (portrait) and 5:3 (landscape). Type scales with the text box so both hold the same amount of text (about 38 characters per line portrait, about 68 landscape); one set of parts fits both. Theme font sizes normalized so every theme wraps identically. |
| `curriculum.lesson.pagination.revision-pass-2026-10-05` | One-time revision pass: wording may change only at badly placed part boundaries; every edit listed before/after and applied only after Chris approves. Everything else stays word-for-word. |
| `curriculum.rewrite.preservation` | Lesson text, Scripture, answer logic and completion rules are preserved (except the scoped revision pass above). |
| `ui.naming.unit-check.checkpoint.v2` | The per-unit check is a Checkpoint ("Unit 2 Checkpoint"). |
| `curriculum.module1.title.v2` | Module 1 is "Reading the Bible Well: The Library and Its Story". |
| `reader-lessons-scroll-2026-10-04`, `learning-path-primary-content-scroll-2026-10-04` | No horizontal scroll anywhere; primary lesson content never scrolls; additional lesson content may. |
| `design.typography.caps.unset-2026-10-05` | No capitalization rule during the redesign. |

## Plan graph

```
A  Decisions + this handoff doc ───────────────────────────── done
B  Type calibration: character widths of the lesson fonts; per-shape line and character budget ← A
C  Lesson card CSS: portrait and landscape layouts, type sized in container units, min/max clamps ← B
D  Build-time divider: pack each step's blocks into parts that fit both shapes; sentence-safe; step-isolated ← B
E  Review report (docs/v7/LESSON_PAGINATION_REVIEW.md): every lesson's parts, weak breaks flagged ← D
F  Chris reviews; one revision pass on flagged breaks only ← E            (human gate)
G  Lock parts into content/pathway/lessons/*.md; build check that every part fits ← F
H  Lesson screen renders locked parts (build on Codex's lesson screen) ← C, G
I  Tests: divider unit tests (Node), one sampled browser test (fullest parts, both shapes);
   retire the render-every-lesson test ← H
J  Learning Path page (path, module, unit on one page) — parallel with H
```

## Status

Tracked on the shared work board: `docs/v7/WORK_BOARD.md` (generated from `docs/v7/work-graph.json`; nodes `S3.*`,
`X1`, `S3.Q`). Run `bun run work` for the live board. This document keeps the decisions and findings; the board
keeps who owns what and what is ready.

## Fonts (finding, 2026-10-05)

- Every theme uses the same shared fonts. The reading font stack starts `Cambria, Caladea, …`, and the site ships
  Caladea itself (`/fonts/fonts.css`). Caladea has the same character widths as Cambria, so serif text wraps the
  same on every device: **deterministic, safe to paginate against.**
- The body font is the device's system sans (Segoe UI, San Francisco, Roboto, …), whose widths differ by roughly
  5–8%: **not deterministic.**
- **Current choice:** lesson prose in the text box is set in the reading font, so pagination is exact.
- **Open for Chris:** the Reading Room theme sheet specifies Source Sans 3 (body) and Literata (Scripture). Using
  them means shipping those fonts site-wide (free, open license) and rerunning calibration (node B). Not done
  without his approval, because it changes every page's type.

## Codex branch dependency

Codex built a lesson screen and `tests/redesign/lesson.spec.js` on `codex/redesign-lesson-path` (local to Chris's
laptop as of 2026-10-05). Its every-lesson render test showed about 45 screens across about 40 lessons clipping at
390px: long steps the old live pager could not split further, and diagrams taller than the space left. Nodes D–G
replace live pagination, so that test is retired in node I. Codex's screen markup and Learning Path work should be
kept and adapted in H and J.

## Verification

- Every change: `bun run verify:fast` (build, Bible integrity, contract, service worker, core suites,
  `roa verify`, 12 smoke browser tests).
- Before a PR merges: `bun run verify` (full suite, parallel).

## Next actions

See "Ready to start" on the work board.
