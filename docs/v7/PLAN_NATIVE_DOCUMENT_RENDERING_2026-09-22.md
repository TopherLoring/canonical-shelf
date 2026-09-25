# Native document-first rendering remediation — 2026-09-22

> **SUPERSEDED — 2026-09-24.** This document is retained as historical implementation context only. Its generated route-document architecture, cross-destination document navigation, route ownership markers, and per-route offline HTML strategy are no longer current. The governing architecture is [`SPA_ARCHITECTURE_2026-09-24.md`](SPA_ARCHITECTURE_2026-09-24.md): `public/index.html` is the sole application document, application navigation is same-document History API routing, direct entry uses SPA fallback, and the service worker uses the canonical shell for offline navigation.

Status: **historical / superseded by the 2026-09-24 SPA architecture.** The work below remains useful as provenance for removal of MutationObserver/post-render repair architecture, but its top-level routing/render ownership decisions must not be used for new implementation.

## Implementation status — 2026-09-22

- **N0–N6 were implemented on PR #24 under the then-current document-first direction.** That direction was later superseded after the generated route layer was determined to add no remaining required value for Canonical Shelf's target architecture.
- `public/home.html`, `course.html`, `bible.html`, `topics.html`, `practice.html`, and `search.html` were deterministic build artifacts generated from `public/index.html`; they have since been removed from the current SPA architecture.
- Cloudflare Static Assets continues to preserve clean URLs, but current application deep links now resolve through SPA fallback rather than generated destination documents.
- Historical release-verification notes below describe the state of the branch at that time and are not current release evidence.

## Objective
Restore the approved Library First experience and Theologian behavior using the simplest reliable architecture that renders the intended page structure natively, rather than rendering an older surface and repairing it afterward.

## Product / UX outcomes
- Home, Course, Bible, Topics, Practice, Search, About, and shared utility panels ship with the intended semantic structure in the delivered experience.
- Theologian is the only learner-facing assistant name. Cloud synthesis is a direct form action with deterministic evidence fallback; there is no Guide-to-Theologian upgrade step.
- The approved flat library baseline remains: charcoal shared chrome, light/ivory reading surfaces, cool-neutral structural grays, sparse gilt, category-colored Bible shelf, serif editorial content, sans UI, no decorative gradients in the default theme.
- Bible reader retains light Scripture reading with attached charcoal Book Notes; Topics uses the same reading-plus-context strategy; Journal and Feedback remain contextual without exposing technical activity IDs.
- Existing Course, Practice, Bible, Topics, learner-state, account/sync, offline, theology, feedback, and cloud-AI capabilities are preserved.

## Historical architecture decision
At the time of this plan, document-first meant the route document owned final structural regions and accessible landmarks. JavaScript enhanced behavior and updated bounded dynamic regions rather than reconstructing whole routes or repairing the body after render.

The shared `public/index.html` was the shell source and root/legacy-hash compatibility fallback. `scripts/generate-route-documents.mjs` derived six destination documents during runtime builds. Navigation between different top-level destinations used normal browser document navigation; query/detail changes within the currently owned destination could use History API updates.

That top-level routing strategy is now superseded. The current SPA keeps the durable parts of this plan—bounded route ownership, no structural repair, direct Theologian integration, learner-state preservation, and consolidated styles—without generating separate application documents.

Forbidden implementation patterns that remain current:
- whole-body or broad-subtree MutationObserver repair;
- render-old-UI-then-rename/relocate/replace it;
- duplicate route renderers competing for `#main`;
- permanent `!important` override sheets used as a second design system;
- CSS/runtime layers named `locked-*`, `*-refinements` or similar that exist only to correct an earlier layer.

## Historical acceptance criteria
The original acceptance criteria below are retained for provenance. Criteria that require generated route documents, normal top-level document navigation, route ownership markers, or route-specific cached HTML are superseded by the current SPA verification contract.

1. No production JavaScript contains `MutationObserver` for rendering/repair.
2. No production runtime contains a post-render Home replacement or a Guide-to-Theologian renaming/upgrading layer.
3. The primary shell and destination experiences expose intended headings, landmarks, navigation, utility panels, and Theologian naming without repair layers.
4. **Superseded:** top-level navigation uses normal URL/document navigation.
5. Theologian form submits directly to `/api/theologian`; successful cloud synthesis displays the answer and evidence; failure displays deterministic evidence fallback without changing the assistant identity.
6. The flat library visual baseline is owned by normal feature styles. Obsolete corrective CSS layers are removed.
7. **Superseded:** service worker preserves matching generated destination documents for offline top-level navigation.
8. Existing stable activity/mastery IDs and learner-state schemas do not change.
9. BSB, current site content, Statement of Faith, theology policy, and vetted LGBTQ scholarship remain Theologian guardrails.
10. Release verification and Cloudflare validation must pass before merge/deploy.

## Invariants
- Stable pre-existing lesson/mastery IDs.
- Home / Course / Bible / Topics / Practice remain primary destinations.
- Bible owns shelf, profiles, chapters, reader, and Book Notes.
- Topics remain curated reference and do not count toward completion.
- Practice remains reinforcement, not a second curriculum.
- Questions-first spiral curriculum remains intact.
- BSB remains the bundled Scripture corpus.
- Statement of Faith remains doctrinal ceiling.
- Guest/offline use remains first-class; optional passkey sync remains additive.
- Feedback remains available everywhere; learner-facing feedback history remains absent.
- Journal remains private, persistent, unscored, and context-linked.

Historical generated counts in earlier versions of this plan were descriptive snapshots, not durable architecture invariants.

## Historical implementation plan
### Phase A — remove repair architecture
- Replace Theologian cloud MutationObserver upgrade with direct event-driven integration.
- Remove `locked-home.js` and move the approved Home composition into the normal Home renderer/document path.
- Remove `library-system.js` behaviors that reconstruct/relocate core route DOM; move required behavior into owning route modules.
- Remove obsolete corrective CSS layers after durable styles are consolidated into owning stylesheets.

### Phase B — destination-owned rendering
- Historical direction: generate stable route-owned documents for Home, Course, Bible, Topics, Practice, and Search.
- Historical direction: make top-level navigation document navigation rather than SPA-wide `#main` replacement.
- Current direction: these two items are superseded by the single-document SPA architecture.
- Preserve bounded ownership of route content and existing focus/keyboard/touch/responsive behavior.

### Phase C — Theologian single implementation
- Use one `Theologian` shell and one direct submit path.
- Keep cloud model optional at runtime and deterministic evidence generation as fallback.
- Preserve evidence links, mastery protection, theology policy validation, stateless privacy, and source/guardrail display.

### Phase D — stylesheet/service-worker consolidation
- Consolidate the approved baseline into feature/base styles.
- Delete obsolete override files and remove them from HTML/service-worker manifests.
- Current SPA service worker caches the canonical shell rather than generated route documents.

### Phase E — audit/validation/release
- Keep validators focused on durable behavior rather than historical architecture artifacts.
- Audit authoritative docs when architecture changes.
- Run automated validation and production configuration checks before release.

## Historical execution plan / WBS
| ID | Work | Historical status | Current disposition |
|---|---|---|---|
| N0 | Baseline audit and plan | COMPLETE | retained as provenance |
| N1 | Direct Theologian integration | COMPLETE | retained |
| N2 | Native Home renderer | COMPLETE | evolved into SPA DOM-template rendering |
| N3 | Route-owned generated destinations | COMPLETE then | superseded / removed |
| N4 | Consolidate CSS ownership | COMPLETE | retained |
| N5 | Route-aware offline shell | COMPLETE then | replaced by SPA shell fallback |
| N6 | Update validators/tests/docs | COMPLETE then | replaced with SPA contracts |
| N7 | Full automated release verification | historically blocked | superseded by 2026-09-24 passing SPA migration verification |
| N8 | Merge/deploy/live smoke | historical plan | governed separately from this retained document |

## Risks and mitigations
The durable risks remain offline behavior, learner-state preservation, visual drift, cloud AI availability, and executable CI evidence. The 2026-09-24 SPA migration specifically verified same-document routing before deleting generated documents, then ran the full repository verification suite and Cloudflare dry-run before committing the generator-free state.

## Rollback
Historical rollback guidance in this plan is superseded. The SPA migration's recorded rollback baseline is commit `88d6939c9929155bc1fe71a8ee93bf92683589ae`; use normal Git history and scoped reverts rather than restoring the deprecated DOM-repair or route-generator architectures.

## Human review gates
Automated validation establishes structural and behavioral evidence within its scope. Physical-device visual review, nuanced editorial/theological review, manual assistive-technology review, and novice-usability review remain distinct evidence classes where applicable and must not be represented as passed without evidence.
