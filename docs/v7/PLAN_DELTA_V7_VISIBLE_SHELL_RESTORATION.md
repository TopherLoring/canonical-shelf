# Canonical Shelf v7 — Visible Shell Restoration

## Objective
Restore the visible v5 product experience that v7 was intended to preserve. The current `main` deploy is technically current, but its global shell, Home surface, and Course overview still render the v6 minimalist/flat presentation. This repair keeps the v7 runtime, Study Focus, themes, account/sync, Notes & Journal, Feedback, Guide, offline model, and assessment/state contracts while replacing the regressed visible shell natively.

## Product / UX outcomes
- Home uses the v5 dashboard grammar: premium hero, three direct study actions, progress ring/dashboard, suggested activity, featured topic, Practice card, and recent-study framing.
- Global navigation reads as one intentional product chrome rather than a generic form/header plus flat link row.
- Course overview uses richer unit cards / progress presentation instead of a long flat ruled list while preserving all 25 units, Unit 0, IDs, completion state, and Study Focus routes.
- Current v7 utilities remain available: Appearance, Account & sync, Feedback, Notes & Journal, and Ask the Guide.
- No v5 bridge scripts, DOM repair layer, MutationObserver architecture, or duplicate state ownership is restored.

## Acceptance criteria
1. `/home` no longer renders the `Read with context. Think with care.` v6 hero.
2. `/home` visibly matches the v5 design thesis and dashboard information architecture using current v7 data/state.
3. `/course` presents Unit 0 + 25 scored units as a premium responsive overview with progress, not the current flat list.
4. Lesson/mastery routes continue to enter current Study Focus unchanged.
5. Five primary destinations remain Home / Course / Bible / Topics / Practice.
6. Feedback, Notes & Journal, Guide, Appearance, account/sync, search, offline support, learner state, and review scheduling remain functional.
7. Service-worker release is bumped so existing installed clients receive the restored shell rather than retaining cached app/CSS assets.
8. Desktop/tablet/phone layouts recompose cleanly; reduced-motion support remains.
9. No curriculum counts or stable activity/mastery IDs change.

## Implementation plan
Use v5 (`TopherLoring/the-canonical-shelf` at `25ea6acd012fb28e1427eb4a5e69e358824e1d96`) as the visual/product reference only. Reimplement its Home dashboard and shell grammar directly in the v7 `app.js` / `learning.js` / CSS primitives. Preserve current routing, state, storage, sync, Worker, and Study Focus ownership.

## Execution plan / WBS
- VSR.1: Confirm current deployed screenshot corresponds to current source and identify v6 surfaces left unchanged by PR #4.
- VSR.2: Restore Home dashboard markup against v7 progress/activity data.
- VSR.3: Restore shell/nav visual hierarchy while keeping current utility controls.
- VSR.4: Recompose Course overview and unit overview using v5 card/dashboard grammar; preserve Study Focus links.
- VSR.5: Bump service-worker release/cache namespace.
- VSR.6: Update behavior tests that intentionally identify the Home heading/shell and add visible-shell regression assertions without prose-string governance checks.
- VSR.7: Run build/validation/e2e and visually inspect desktop/tablet/phone before merge.

## Risks / rollback
Primary risk is visual/CSS regression around utility panels or Study Focus. Changes stay isolated to a repair branch; rollback is branch rejection. Study Focus selectors and state logic are not to be rewritten. Service-worker cache bump is mandatory to avoid false old-version reports after deployment.

## Human review gate
Before merge, verify Home and Course visually against the v5 design thesis and confirm the result is materially different from the v6 screenshot that triggered this repair.