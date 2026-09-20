# Plan Delta — Open-source assembly policy

## Status

**Active policy.** The merged v7 release used native platform primitives for the shipped Study Focus/theme/personal-study/feedback work because they met the current quality bar without adding unnecessary runtime dependencies. The candidate libraries below remain approved options for future work when they materially improve the Canonical Shelf experience.

## Decision

Canonical Shelf may assemble and customize permissively licensed open-source primitives when doing so either shortens delivery time **or** materially improves interaction quality, accessibility, performance, reliability, or maintainability. Open-source adoption must serve the Canonical Shelf experience; it must not impose a generic component-library aesthetic or dictate product behavior.

## Selection rules

1. Prefer low-level primitives over opinionated visual systems.
2. Self-host/bundle all runtime dependencies required for core learning; no CDN dependency for the offline PWA.
3. Preserve Canonical Shelf design tokens, typography, surfaces, motion language, and interaction grammar.
4. Do not replace richer learning interactions with simpler library defaults.
5. Require keyboard/touch/screen-reader-compatible paths for manipulation libraries.
6. Keep learner state ownership inside Canonical Shelf; third-party UI packages do not own progress or assessment state.
7. Add a dependency only when its value exceeds the bundle, upgrade, security, and offline costs.
8. Record license and purpose when a new runtime library is adopted.

## Current candidates

- **Motion (`motion`, MIT):** candidate for semantic Study Focus/route/scene transitions and tactile state motion when native View Transitions/CSS are insufficient.
- **dnd-kit DOM (`@dnd-kit/dom`, MIT):** candidate for sequence, shelf placement, sorting, matching, argument/evidence manipulation, and other v5-style learning games where native controls would reduce interaction quality.
- **Floating UI (`@floating-ui/dom`, MIT):** candidate for anchored scholarly notes, footnote popovers, lexical callouts, and positioned study surfaces where CSS anchoring/popover support is insufficient.

## Current implementation choice

The merged v7 release uses native platform primitives where they already meet the quality bar: CSS custom properties, container/media queries, native disclosure/drawer patterns, IndexedDB/local persistence, History API routing, and native browser behavior where appropriate.

No new candidate above was adopted merely for novelty. Future work—especially richer game manipulation, advanced study surfaces, or more sophisticated semantic motion—may introduce these primitives when the expected UX/learning value outweighs bundle, upgrade, security, and offline costs.

## Guardrail

No Bootstrap/Tailwind/component-kit adoption as the learner-facing visual design system merely for implementation convenience. Utility or headless code may be used internally, but the rendered product must remain Canonical Shelf-specific.
