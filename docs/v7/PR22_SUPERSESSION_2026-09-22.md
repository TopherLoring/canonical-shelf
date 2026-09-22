# PR #22 behavioral supersession — 2026-09-22

Status: CURRENT convergence record for PR #24. PR #22 is retained only as historical provenance and must not be merged independently once #24 validates.

## Decision

PR #24 preserves the intended production-correction behavior from PR #22 while superseding its post-render implementation strategy. The desired user experience and deployment safeguards are current; the `locked-*` correction files, DOM-wide naming repair, and MutationObserver-based upgrade behavior are not.

## Requirement mapping

| PR #22 intent | PR #24 native owner | Disposition |
| --- | --- | --- |
| Library First visual identity and compact destination typography | shared native styles in `public/library-system.css` plus route-owned renderers | ABSORBED |
| Library First Home with category-colored 66-book shelf | native Home renderer in `public/progress-experience.js` | ABSORBED |
| Learner-facing assistant name is Theologian | native shell, Study Focus, Topics, Home, and `public/theologian-chat.js` | ABSORBED |
| Visible loading, cloud-answer, validation, and fallback states | `public/theologian-chat.js` | ABSORBED |
| Cloud inference with deterministic/local evidence fallback | `public/theologian-cloud.js`, `public/theologian-chat.js`, `public/theologian.js` | ABSORBED |
| Cache release must change when final visual/Theologian assets change | `public/sw.js` native release cache | ABSORBED; current key `v7-native-rendering-2026-09-22-d` |
| Production deployment must execute a real `/api/theologian` request | `scripts/verify-deployment.mjs` | ABSORBED AND HARDENED |
| Live inference must return cloud mode, substantive answer, evidence, and BSB guardrail | `scripts/verify-deployment.mjs` | ABSORBED AND HARDENED with passed guardrail validation |
| Deployment must prove the intended UI shell is present | exact native route-document ownership + Theologian shell checks | ABSORBED AND HARDENED |
| Production correction remains editable rather than immutable | current native architecture and authority docs | PRESERVED |

## Explicitly superseded implementation

The following PR #22 mechanisms must not return to production:

- `public/locked-home.js`;
- `public/locked-library-baseline.css`;
- `public/library-system-refinements.css`;
- broad `MutationObserver` repair or naming enforcement;
- a cloud assistant layered over a legacy learner-facing Guide shell;
- deployment verification that treats an AI binding alone as proof of working inference.

Internal compatibility identifiers containing `guide` may remain when changing them would create unnecessary migration risk, but current learner-facing copy must use **Theologian**.

## Enforcement

`scripts/validate-pr22-supersession.mjs` is part of prelaunch and full validation. It requires the intended PR #22 behaviors in their native owners and rejects the superseded repair artifacts or mechanisms.

PR #22 should be closed as superseded after an executable current-head PR #24 validation run succeeds. Until then it remains open only as historical evidence, not as a candidate to merge.
