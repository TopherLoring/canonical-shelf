# Shell controls + footer regression fix — 2026-09-20

## Objective
Restore reliable shell interaction and the missing institutional footer without changing Course curriculum or the five-primary-destination information architecture.

## Compact implementation / execution plan
1. **BOOT_FIX** — bind SPA navigation and utility controls before service-worker readiness; offline setup must never hold the interface hostage.
2. **FOOTER_RESTORE** — restore the permanent footer with Statement of Faith, About, Scripture approach, sources/methodology, translation, accessibility, and privacy disclosures.
3. **AUX_DISCLOSURE** — provide a standalone About surface that works without SPA routing and renders the current generated Statement of Faith.
4. **CACHE_ADVANCE** — version the shell cache, cache the restored assets, and allow a waiting worker to activate so stale broken bootstrap assets are displaced.
5. **REGRESSION_GATES** — validate boot ordering, footer/disclosure presence, offline assets, and real browser interaction for Progress, Guide, Feedback, primary navigation, and footer links.
6. **VERIFY** — run the repository's full `bun run verify` and Cloudflare dry-run gates.

## Typed execution graph
```text
BOOT_FIX [experience/runtime] ─┬─> CACHE_ADVANCE [offline/release] ─┐
                              │                                    │
FOOTER_RESTORE [experience] ──┴─> AUX_DISCLOSURE [content/ui] ─────┼─> REGRESSION_GATES [quality] ─> VERIFY [release]
```

## Acceptance criteria
- Core navigation and utility controls work before service-worker readiness resolves.
- Home/Course/Bible/Topics/Practice remain the only primary destinations.
- Footer is visible on normal application surfaces and suppressed during focused lesson scenes.
- All seven institutional footer disclosures are reachable.
- Existing learner state schemas are unchanged.
- Offline shell includes the footer/About assets and updates stale releases.
- Full verification and browser tests pass.

## Rollback
Revert the shell/bootstrap/service-worker/footer commits. No learner-state migration or destructive data change is involved.
