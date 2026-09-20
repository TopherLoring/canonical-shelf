# Canonical Shelf v7 — Visible Shell Restoration

## Objective
Restore the visible v5 product experience that v7 was intended to preserve. The current production source still contains the minimalist v6-style outer shell even though v7 Study Focus and utility work are present underneath it. This repair keeps the current v7 runtime, Unit 0, Study Focus, themes, account/sync, Notes & Journal, Feedback, Guide, offline model, learner state, assessment, and llms.txt contracts while replacing the regressed visible Home/Course shell natively.

## Product / UX outcomes
- Home uses the approved v5 dashboard grammar: premium hero, three direct study actions, progress ring/dashboard, suggested activity, featured topic, Practice card, and study-continuity framing.
- Global navigation reads as one intentional premium product chrome rather than a generic form/header plus flat link row.
- Course overview uses rich responsive unit surfaces and visible progress instead of a long flat ruled list while preserving all 25 units, Unit 0, IDs, completion state, and Study Focus routes.
- Current v7 utilities remain available: Appearance, Account & sync, Feedback, Notes & Journal, Ask the Guide, and search.
- No v5 bridge scripts, DOM repair layer, MutationObserver architecture, duplicate runtime, or duplicate state ownership is restored.

## Acceptance criteria
1. `/home` no longer renders the `Read with context. Think with care.` v6 hero.
2. `/home` visibly follows the approved v5 design thesis using current v7 data/state.
3. `/course` presents Unit 0 + 25 scored units as a premium responsive overview with progress.
4. Lesson/mastery routes continue to enter current Study Focus unchanged.
5. Five primary destinations remain Home / Course / Bible / Topics / Practice.
6. Feedback, Notes & Journal, Guide, Appearance, account/sync, search, offline support, learner state, reviews, and llms.txt generation remain functional.
7. Service-worker release/cache namespace changes so installed clients receive the restored shell.
8. Desktop/tablet/phone layouts recompose cleanly and reduced-motion remains supported.
9. Curriculum counts and stable activity/mastery IDs do not change.

## Implementation plan
Use v5 (`TopherLoring/the-canonical-shelf` at `25ea6acd012fb28e1427eb4a5e69e358824e1d96`) as a visual/product reference only. Reimplement its Home dashboard, shell hierarchy, and Course overview directly in the current v7 `app.js`, `learning.js`, and CSS. Preserve current routing, state, storage, sync, Worker, Study Focus, build/deploy separation, and automated llms.txt generation.

## Execution plan / WBS
- VSR.1 Audit deployed/source mismatch and identify the v6-visible surfaces that survived the v7 merge.
- VSR.2 Restore Home dashboard markup against v7 progress/activity data.
- VSR.3 Restore shell/nav visual hierarchy while keeping all v7 utilities.
- VSR.4 Recompose Course root and unit overview using the same visual grammar while preserving Study Focus links/state.
- VSR.5 Bump service-worker release/cache namespace.
- VSR.6 Update behavioral regression coverage for the restored Home/Course shell.
- VSR.7 Run build, validation, E2E, and visual desktop/tablet/phone checks.
- VSR.8 Merge only after the visible product is confirmed materially different from the reported v6 screenshot and production deploy points at the repair commit.

## Risks / rollback
Primary risk is visual/CSS regression around utility panels or Study Focus. Changes remain isolated to this repair branch until verification. Study Focus internals and learner-state logic are intentionally out of scope. Rollback is rejection/revert of the shell repair commit.

## Human review gate
Before merge, verify Home and Course visually against the v5 design thesis and confirm the result is materially different from the v6 screenshot that triggered this repair.
