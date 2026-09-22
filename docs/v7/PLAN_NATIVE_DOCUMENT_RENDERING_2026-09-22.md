# Native document-first rendering remediation — 2026-09-22

Status: active implementation plan. This supersedes any hotfix approach that relies on post-render DOM repair, MutationObserver-based UI correction, or stacked CSS override layers.

## Objective
Restore the approved Library First experience and Theologian behavior using the simplest reliable architecture that renders the intended page structure natively, rather than rendering an older surface and repairing it afterward.

## Product / UX outcomes
- Home, Course, Bible, Topics, Practice, Search, About, and shared utility panels ship with the intended semantic structure in the delivered document.
- Theologian is the only learner-facing assistant name. Cloud synthesis is a direct form action with deterministic evidence fallback; there is no Guide-to-Theologian upgrade step.
- The approved flat library baseline remains: charcoal shared chrome, light/ivory reading surfaces, cool-neutral structural grays, sparse gilt, category-colored Bible shelf, serif editorial content, sans UI, no decorative gradients in the default theme.
- Bible reader retains light Scripture reading with attached charcoal Book Notes; Topics uses the same reading-plus-context strategy; Journal and Feedback remain contextual without exposing technical activity IDs.
- Existing Course, Practice, Bible, Topics, learner-state, account/sync, offline, theology, feedback, and cloud-AI capabilities are preserved.

## Architecture decision
Document-first means the route document owns the final structural regions and accessible landmarks. JavaScript may enhance behavior and update bounded dynamic regions, but it must not reconstruct the whole route, relocate core regions after render, or watch the body to repair markup.

Allowed dynamic behavior includes: learner-state/progress values, selected course/topic/book detail content, chapter text, practice challenge state, Journal/Feedback editors, panel visibility, and Theologian answer output. These updates must target explicit owned regions and event flows.

Forbidden implementation patterns:
- whole-body or broad-subtree MutationObserver repair;
- render-old-UI-then-rename/relocate/replace it;
- duplicate route renderers competing for `#main`;
- permanent `!important` override sheets used as a second design system;
- CSS/runtime layers named `locked-*`, `*-refinements` or similar that exist only to correct an earlier layer;
- client navigation that requires rebuilding the complete destination DOM solely to change top-level pages.

## Acceptance criteria
1. No production JavaScript contains `MutationObserver` for rendering/repair.
2. No production runtime contains a post-render Home replacement or a Guide-to-Theologian renaming/upgrading layer.
3. The primary shell and destination documents expose their final headings, landmarks, navigation, utility panels, and Theologian naming before enhancement.
4. Top-level navigation uses normal URL navigation; query/detail experiences may enhance within a route-owned content region.
5. Theologian form submits directly to `/api/theologian`; successful cloud synthesis displays the answer and evidence; failure displays deterministic evidence fallback without changing the assistant identity.
6. The flat library visual baseline is owned by the normal feature styles. Obsolete corrective CSS layers are removed from `index.html` and the service-worker shell.
7. Service-worker cache version changes and references only live assets.
8. Existing stable activity/mastery IDs and learner-state schemas do not change.
9. BSB, current site content, Statement of Faith, theology policy, and vetted LGBTQ scholarship remain Theologian guardrails.
10. Prelaunch validation, Theologian tests, deployment config validation, production dry-run/deploy workflow, and a live `/api/theologian` smoke check pass before merge/deploy.

## Invariants
- 6 courses; 44 units; 117 lessons; 119 mastery/capstone activities; 236 scored activities; 45 Topics.
- Stable pre-existing lesson/mastery IDs.
- Home / Course / Bible / Topics / Practice remain the five primary destinations.
- Bible owns shelf, profiles, chapters, reader, and Book Notes.
- Topics remain curated reference and do not count toward completion.
- Practice remains reinforcement, not a second curriculum.
- Questions-first spiral curriculum remains intact.
- BSB remains the bundled Scripture corpus.
- Statement of Faith remains doctrinal ceiling.
- Guest/offline use remains first-class; optional passkey sync remains additive.
- Feedback remains available everywhere; learner-facing feedback history remains absent.
- Journal remains private, persistent, unscored, and context-linked.

## Implementation plan
### Phase A — remove repair architecture
- Replace Theologian cloud MutationObserver upgrade with direct event-driven integration.
- Remove `locked-home.js` and move the approved Home composition into the normal Home renderer/document path.
- Remove `library-system.js` behaviors that reconstruct/relocate core route DOM; move required behavior into the owning route modules.
- Remove obsolete corrective CSS layers after their durable styles are consolidated into owning stylesheets.

### Phase B — destination-owned rendering
- Make top-level navigation document navigation rather than SPA-wide `#main` replacement.
- Give each destination a stable route-owned root/landmarks and enhance only bounded content regions.
- Preserve accessible focus, keyboard, touch, reduced-motion, forced-colors, and mobile recomposition.

### Phase C — Theologian single implementation
- Use one `Theologian` shell and one direct submit path.
- Keep cloud model optional at runtime and deterministic evidence generation as fallback.
- Preserve evidence links, mastery protection, theology policy validation, stateless privacy, and source/guardrail display.

### Phase D — stylesheet/service-worker consolidation
- Consolidate the approved baseline into feature/base styles.
- Delete obsolete override files and remove them from HTML/service-worker manifests.
- Bump cache release so deployed clients cannot mix old repair assets with the new architecture.

### Phase E — audit/validation/release
- Update validators so they forbid repair architecture instead of requiring legacy layers.
- Audit authoritative docs and remove stale descriptions of Guide, repair layers, or SPA-wide rendering.
- Run automated validation and inspect production workflow output.
- Merge only after the release branch is internally consistent; deploy and verify live routes + Theologian.

## Execution plan / WBS
| ID | Work | Depends on | Validation |
|---|---|---|---|
| N0 | Baseline audit and plan | — | active branches/PRs inspected; plan + PEG committed |
| N1 | Direct Theologian integration | N0 | no MutationObserver; cloud/fallback tests |
| N2 | Native Home renderer | N0 | no post-render Home replacement; visual contract |
| N3 | Route-owned Course/Bible/Topics/Practice enhancements | N0 | no core DOM relocation/reconstruction layer |
| N4 | Consolidate CSS ownership | N2,N3 | no corrective override sheets required |
| N5 | Remove obsolete runtime/assets | N1,N2,N3,N4 | imports, HTML, SW manifest clean |
| N6 | Update validators/docs | N1–N5 | repair patterns forbidden; docs accurate |
| N7 | Full automated release verification | N6 | verify:prelaunch + relevant full gates |
| N8 | Merge/deploy/live smoke | N7 | production routes + `/api/theologian` verified |

## Risks and mitigations
- **Offline regressions:** retain current service-worker strategy and verify route/data assets after consolidation.
- **Learner-state regressions:** do not change state schemas; preserve existing modules and stable IDs.
- **Visual drift during consolidation:** move approved rules verbatim where possible before simplification; validate page composition after ownership changes.
- **Cloud AI outage/cost/latency:** deterministic evidence fallback remains available and cloud requests remain stateless.
- **Active PR conflict:** PR #23 changes generated `llms.txt` scope and should remain separate until this architecture branch is validated; rebase/absorb it afterward if still current.

## Rollback
Revert the native-rendering integration commit(s) as a unit to the current `main` release. Do not restore PR #22's observer/repair implementation as rollback architecture; it remains reference-only for intended visible outcomes.

## Human review gates
Automated validation can establish structural correctness, syntax, accessibility rules, deployment target, and live API behavior. Physical-device visual review, nuanced editorial/theological review, and novice-usability review remain human gates. They do not justify retaining known repair architecture.
