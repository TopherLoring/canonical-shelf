# Plan Delta — Open-source assembly policy

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

## Initial candidates

- **Motion (`motion`, MIT):** candidate for semantic Study Focus/route/scene transitions and tactile state motion when native View Transitions/CSS are insufficient.
- **dnd-kit DOM (`@dnd-kit/dom`, MIT):** candidate for sequence, shelf placement, sorting, matching, argument/evidence manipulation, and other v5-style learning games. Its framework-agnostic DOM layer and keyboard/pointer/touch model are a better fit than generic form controls.
- **Floating UI (`@floating-ui/dom`, MIT):** candidate for anchored scholarly notes, footnote popovers, lexical callouts, and other positioned study surfaces where CSS anchoring/popover support is insufficient.

## Current implementation choice

The first golden slice should use native platform primitives where they already meet the quality bar (CSS custom properties, container queries, `details`, dialog/drawer patterns, localStorage, History API, View Transitions when available). This avoids adding dependencies merely for novelty. Open-source primitives should be introduced at the first point where they materially improve the target experience—especially rich game manipulation and complex anchored study surfaces.

## Guardrail

No Bootstrap/Tailwind/component-kit adoption as the visual design system. Utility or headless code may be used internally, but the learner-facing product must remain Canonical Shelf-specific.
