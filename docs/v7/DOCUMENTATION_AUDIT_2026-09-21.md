# Canonical Shelf documentation audit — 2026-09-21

Status: **current documentation authority map; updated 2026-09-22 for PR #24**

## Purpose

This audit prevents superseded restoration plans, design experiments, architecture workarounds, historical release notes, generated artifacts, prior curriculum names/counts, or legacy Guide terminology from being mistaken for the current Canonical Shelf contract.

The current audit covers the root project instructions/README, the native-rendering plan/PEG, current `docs/v7/` authority documents, generated discovery/reference surfaces, route-document generation, curriculum/theology source documentation, deployment/release documentation, and older v6/restoration provenance.

## Authority order

When two documents disagree, use this order:

1. latest explicit owner decision;
2. `AI_INSTRUCTIONS.md`;
3. `docs/v7/DECISION_PRECEDENCE.md`;
4. current domain baselines/current implementation plans listed below;
5. canonical source code/data contracts;
6. generated artifacts produced from those sources;
7. historical plans/audits only as provenance.

“Approved”, “locked”, or “canonical” means current baseline, not immutable. Later approved work remains editable.

## Current authoritative documents

| Document | Status | What it owns |
|---|---|---|
| `README.md` | current | product overview, current counts/names, learner-facing capabilities, document-first architecture, deterministic generation, deployment summary |
| `AI_INSTRUCTIONS.md` | current | project operating rules, experience priorities, native route-document architecture, invariants, Theologian naming/authority |
| `docs/v7/DECISION_PRECEDENCE.md` | current | owner-precedence protocol and integrated product/curriculum/rendering/deployment decisions |
| `docs/v7/LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md` | current editable baseline | flat library-system UX/theme grammar, Course/Study Focus/Bible/Topics behavior |
| `docs/v7/PLAN_NATIVE_DOCUMENT_RENDERING_2026-09-22.md` | active current implementation/release plan | replacement of post-render repair with generated route-owned documents, bounded enhancement, validation and release state |
| `docs/v7/native-document-rendering-graph.json` | current typed PEG | machine-readable native-rendering execution dependencies, invariants, risks, rollback, human gates |
| `docs/v7/CURRICULUM_MULTI_COURSE_PLAN.md` | current structural reference | six-course architecture and stable-ID curriculum contract |
| `docs/v7/PLAN_DELTA_QUESTIONS_FIRST_SPIRAL.md` | current curriculum delta | questions-first spiral, time ranges, question threads, Course 5/6 framing |
| `docs/v7/questions-first-spiral-execution-graph.json` | current curriculum execution record | machine-readable curriculum-delta execution state |
| `docs/v7/THEOLOGIAN_CLOUD_RUNTIME_2026-09-21.md` | current | cloud/deterministic Theologian authority, evidence, privacy, LGBTQ argument/source boundaries |
| `docs/v7/DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md` | current | exact production Worker, generated config, clean route-document handling, pre/post-deploy verification and live Theologian smoke |
| `docs/v7/DOCUMENTATION_AUDIT_2026-09-21.md` | current | this authority/status map |

## Current product/runtime values

Current documentation uses these curriculum values:

- 6 courses
- 44 scored units
- 117 guided lessons
- 119 mastery/capstone activities
- 236 scored activities
- 12 recurring question threads
- 45 Topics outside completion
- visible retention cadence 1 → 3 → 7 → 14 → 30 → 60 days

Current learner-facing course names are:

1. Bible & Christianity: Foundations
2. Israel: Exodus, Covenant, Temple & Prophetic Hope
3. From Exile to Jesus: The Second Temple World
4. Jesus, the Gospels & the Early Church
5. How We Know: Interpretation & Evidence
6. Christian Theology, Traditions & Synthesis

The historical 25-unit / 70-lesson / 69-mastery / 139-activity values remain migration baselines only. The old learner-facing names “Advanced Biblical Interpretation” and “Theology, Traditions & Difficult Questions” are historical labels and must not be reintroduced as current Course 5/6 titles.

## Current rendering architecture

PR #24 replaces post-render repair architecture with a route-owned document model.

Current contract:

- `public/index.html` is the shared shell source and root/legacy-hash compatibility fallback;
- `scripts/generate-route-documents.mjs` deterministically generates `public/home.html`, `course.html`, `bible.html`, `topics.html`, `practice.html`, and `search.html` during runtime builds;
- each generated document exposes a route-owned outer document root and a bounded inner enhancement region before JavaScript runs;
- navigation between different top-level destinations uses normal browser document navigation;
- query/detail changes inside the currently owned destination may use History API updates and bounded rerendering;
- whole-body/broad-subtree `MutationObserver` repair, render-old-UI-then-relocate/rename behavior, duplicate destination renderers competing for `#main`, and permanent corrective CSS/runtime layers are not current architecture;
- the service worker caches all route-owned documents and maps offline top-level navigation back to the matching route document;
- Cloudflare Static Assets explicitly uses `html_handling: auto-trailing-slash` so clean URLs resolve to the matching generated HTML document rather than depending on the generic SPA fallback.

The generic `library-system.js` post-render repair runtime and obsolete `library-system-refinements.css` correction layer are superseded and removed from the active architecture.

## Canonical source data vs generated outputs

Author-maintained canonical inputs include:

- `content/curriculum/`
- `content/statement/statement-of-faith-v3.md`
- `content/theology/policy.json`
- `content/theology/sources.json`
- admitted/pinned migration sources under `content/vendor/legacy/`
- `public/index.html` as the shared application shell source

Generated/published outputs must not become independent hand-edited sources of truth:

- `public/data/catalog.json`
- `public/data/curriculum.md`
- `public/data/statement-of-faith.md`
- `public/data/theology-policy.json`
- `public/data/theology-sources.json`
- `public/data/corpus.txt`
- `public/llms.txt`
- `public/home.html`
- `public/course.html`
- `public/bible.html`
- `public/topics.html`
- `public/practice.html`
- `public/search.html`
- generated account/auth/runtime artifacts
- generated `wrangler.jsonc`

The migration/publication/generation scripts and release validators keep these outputs aligned with canonical inputs. Production validation rejects theology publication drift, missing route-document generation, incorrect Cloudflare route handling, and missing release artifacts.

## Current Theologian documentation

**Theologian** is the learner-facing assistant name. Historical `guide-*` IDs may remain internally only where changing them would create needless compatibility/migration risk; learner-facing copy and current authority documentation should say Theologian.

Current architecture is:

- Cloudflare Workers AI for conversational synthesis;
- deterministic evidence-aware Theologian as fallback;
- BSB → site content → Statement of Faith → theology policy/vetted research as guardrail order;
- canonical theology policy/source files published deterministically;
- LGBTQ beliefs/arguments normalized into evidence states, limits, and vetted source records;
- no Canonical Shelf server-side conversation persistence;
- no Journal/profile/progress/account data supplied as model context by default;
- direct `/api/theologian` client integration rather than a Guide-to-Theologian upgrade/rename layer.

## Current deployment documentation

There is one production target:

`https://the-canonical-shelf.christopherwonder.workers.dev`

The deployment contract includes generated configuration validation, exact Worker/D1/AI/origin/release checks, explicit clean HTML handling, `/api/health`, direct route-ownership smoke tests, critical generated-content checks, and a bounded live cloud-Theologian smoke request.

A successful `wrangler deploy` or an HTTP 200 on a clean route is not sufficient. `/home`, `/course`, `/bible`, `/topics`, `/practice`, and `/search` must each return their matching route-document ownership marker so the generic compatibility fallback cannot masquerade as successful destination routing.

## Current user-facing ownership rules

- **Home** owns orientation, continuation, current context, recent study, and entry into the library/learning system.
- **Course** owns courses, units, lessons, mastery/capstones, current learning position, and Study Focus.
- **Bible** owns the 66-book shelf, book profiles, chapters, Scripture reading, and Bible-specific context/Book Notes.
- **Topics** owns curated reference/glossary exploration outside completion and Topic Notes.
- **Practice** owns retrieval/reinforcement/review rather than curriculum progression.
- **Search** indexes distinct evidence/content types across the shelf and hands synthesis questions to the Theologian.
- **About** owns Statement of Faith, methodology, translation, accessibility, privacy, and institutional explanation.
- **Theologian** synthesizes evidence across first-party content but is not itself the source of authority.
- **Feedback** remains globally reachable.
- **Journal Notes** remain private, persistent, unscored, and context-linked.
- **Account/sync** remains additive/secondary to guest and offline use.

A consolidated learner Journal index or other future capabilities must not be documented as implemented until runtime paths and validation exist.

## `docs/v7/` status inventory

### Current / carried forward

- `.restoration-active` — current integration marker where retained; restoration-parity phase itself is superseded by the current integrated architecture.
- `CURRICULUM_MULTI_COURSE_PLAN.md` — current structural curriculum reference.
- `DECISION_PRECEDENCE.md` — current integrated authority.
- `LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md` — current editable visual/interaction baseline.
- `PLAN_NATIVE_DOCUMENT_RENDERING_2026-09-22.md` — current architecture/release plan for PR #24.
- `native-document-rendering-graph.json` — current typed execution graph.
- `PLAN_DELTA_QUESTIONS_FIRST_SPIRAL.md` and `questions-first-spiral-execution-graph.json` — current curriculum delta/history.
- `THEOLOGIAN_CLOUD_RUNTIME_2026-09-21.md` — current Theologian runtime authority.
- `DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md` — current production/release authority.
- `PLAN_DELTA_V7_PERSONAL_STUDY_FEEDBACK.md` — retained where it distinguishes durable state behavior from superseded panel presentation.
- `RESTORATION_WORKING_RULE.md` — retained general rule that unreachable content does not count as restored.
- `DESIGN_INTENT_DELTA_V5_POLISH.md` — supporting design-intent history that defers to later owner-approved baselines.

### Historical provenance — retain, do not use as current authority

Earlier restoration, migration, design, release, and corrective-layer plans remain implementation provenance only, including:

- `BRANCH_AUDIT_2026-09-20.md`
- `EXPERIENCE_PARITY_RESTORATION_PLAN.md`
- `NON_COURSE_LEGACY_SOURCE_AUDIT.md`
- prior `PLAN_DELTA_*` files whose work is completed/superseded and not explicitly listed as current above
- prior restoration/topic acceptance/progress/next trackers
- prior execution graphs for completed restoration/build/feedback/Bible identity phases
- `DOCUMENTATION_CLOSEOUT_PLAN.md` and its completed graph

Historical files are retained for provenance and rollback reasoning, not as hidden parallel authority. If an old finding remains actionable, promote it into a current plan rather than silently following the old file.

`docs/v6/` is historical architecture/release documentation for the previous foundation. It may be consulted for implementation history, evidence discipline, migrations, or prior decisions, but it cannot override current v7 governance/runtime.

## PR #23 relationship

PR #23 changes the generated learner-facing `llms.txt` corpus scope. It is intentionally separate from PR #24 until the native architecture branch receives current executable release-verification evidence. If PR #23 remains current afterward, rebase/absorb it deliberately rather than merging both branches blindly.

## Verification status

The last production-ci run that actually received a runner and executed steps was **#492**. Its prelaunch `verify` job passed; its full audit stopped at a non-browser import of `public/bible.js` because browser-only `document` access was unguarded. That import problem was subsequently fixed in commit `a5c73fa0a91029615f0637c12e27080d1537d1f3`.

Later production-ci runs, including **#515** on the current documentation/architecture sequence, have failed before runner allocation with zero steps executed. They provide no result about repository correctness. PR #24 remains draft, and current-head N7/N8 release gates remain unevidenced until GitHub actually executes them.

## Documentation closeout state

Current README, project instructions, decision precedence, native-rendering plan/PEG, deployment authority, and this audit now describe the same document-first architecture and learner-facing Theologian naming. Generated content/route artifacts remain build outputs. No document should state that PR #24 is merged, deployed, or fully validated until executable current-head CI plus production smoke evidence exists.
