# Canonical Shelf documentation audit — 2026-09-21

Status: **current documentation authority map for PR #21**

## Purpose

This audit prevents old restoration plans, superseded design experiments, historical release notes, generated artifacts, or prior curriculum names/counts from being mistaken for the current Canonical Shelf contract.

The audit covered the root project instructions/README, generated discovery/reference surfaces, current `docs/v7/` documents, v6 historical documentation, curriculum/theology source documentation, and deployment/release documentation.

## Authority order

When two documents disagree, use this order:

1. latest explicit owner decision;
2. `AI_INSTRUCTIONS.md`;
3. `docs/v7/DECISION_PRECEDENCE.md`;
4. current domain baselines listed below;
5. canonical source code/data contracts;
6. generated artifacts produced from those sources;
7. historical plans/audits only as provenance.

“Approved”, “locked”, or “canonical” means current baseline, not immutable. Later approved work remains editable.

## Current authoritative documents

| Document | Status | What it owns |
|---|---|---|
| `README.md` | current | product overview, current counts/names, user-facing capabilities, architecture, deployment summary |
| `AI_INSTRUCTIONS.md` | current | agent/project operating rules and invariants |
| `docs/v7/DECISION_PRECEDENCE.md` | current | owner-precedence protocol and integrated product/curriculum/deployment decisions |
| `docs/v7/LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md` | current editable baseline | flat library-system UX/theme grammar, Course/Study Focus/Bible/Topics/Profile/Feedback behavior |
| `docs/v7/CURRICULUM_MULTI_COURSE_PLAN.md` | current structural reference | six-course architecture and stable-ID curriculum contract |
| `docs/v7/PLAN_DELTA_QUESTIONS_FIRST_SPIRAL.md` | current curriculum delta | questions-first spiral, time ranges, question threads, Course 5/6 framing |
| `docs/v7/questions-first-spiral-execution-graph.json` | current execution state | machine-readable curriculum-delta execution state |
| `docs/v7/THEOLOGIAN_CLOUD_RUNTIME_2026-09-21.md` | current | cloud/deterministic Theologian authority, evidence, privacy, LGBTQ argument/source boundaries |
| `docs/v7/DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md` | current | exact production Worker, generated config, pre/post-deploy verification contract |
| `docs/v7/DOCUMENTATION_AUDIT_2026-09-21.md` | current | this authority/status map |

## Canonical source data vs generated documentation

The following are author-maintained canonical inputs:

- `content/curriculum/`
- `content/statement/statement-of-faith-v3.md`
- `content/theology/policy.json`
- `content/theology/sources.json`
- admitted/pinned migration sources under `content/vendor/legacy/`

The following are generated/published outputs and must not become independent hand-edited sources of truth:

- `public/data/catalog.json`
- `public/data/curriculum.md`
- `public/data/statement-of-faith.md`
- `public/data/theology-policy.json`
- `public/data/theology-sources.json`
- `public/data/corpus.txt`
- `public/llms.txt`
- generated account/auth/runtime artifacts
- generated `wrangler.jsonc`

`publish-theology.mjs`, curriculum migration/post-processing, `generate-curriculum-reference.mjs`, and `generate-llms.mjs` keep published copies aligned with canonical inputs. Production validation rejects theology source/publication drift.

## Current values corrected during this audit

The documentation set now uses the same current curriculum values:

- 6 courses
- 44 scored units
- 117 guided lessons
- 119 mastery/capstone activities
- 236 scored activities
- 12 question threads
- 45 Topics

Current learner-facing course names are:

1. Bible & Christianity: Foundations
2. Israel: Exodus, Covenant, Temple & Prophetic Hope
3. From Exile to Jesus: The Second Temple World
4. Jesus, the Gospels & the Early Church
5. How We Know: Interpretation & Evidence
6. Christian Theology, Traditions & Synthesis

The old learner-facing names “Advanced Biblical Interpretation” and “Theology, Traditions & Difficult Questions” are historical labels and must not be reintroduced as the current Course 5/6 titles.

## Current Theologian documentation corrected during this audit

The documentation no longer describes conversational AI as merely future work. Current architecture is:

- Cloudflare Workers AI for conversational synthesis;
- deterministic evidence-aware Theologian as fallback;
- BSB → site content → Statement of Faith → theology policy/vetted research as guardrail order;
- canonical theology policy/source files published deterministically;
- attachment-derived LGBTQ beliefs/arguments normalized into evidence states, limits, and source records;
- no Canonical Shelf server-side conversation persistence;
- no Journal/profile/progress/account data supplied as model context by default.

## Current deployment documentation corrected during this audit

There is one production target:

`https://the-canonical-shelf.christopherwonder.workers.dev`

The deployment contract now includes generated configuration validation, exact Worker/D1/AI/origin checks, release-SHA identity, `/api/health`, direct-route smoke tests, and PR full-release/dry-run gates. Older deployment-target experiments are historical only.

## `docs/v7/` status inventory

### Current / carried forward

| File | Disposition |
|---|---|
| `.restoration-active` | rewritten as current integration marker; restoration-parity phase declared superseded |
| `CURRICULUM_MULTI_COURSE_PLAN.md` | updated to current Course 5/6 names, counts, questions-first relationship |
| `DECISION_PRECEDENCE.md` | rewritten to current integrated authority |
| `LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md` | current editable design baseline |
| `PLAN_DELTA_QUESTIONS_FIRST_SPIRAL.md` | added/absorbed from PR #20 and updated for PR #21 |
| `questions-first-spiral-execution-graph.json` | added/absorbed and pointed at PR #21 integrated validation |
| `THEOLOGIAN_CLOUD_RUNTIME_2026-09-21.md` | updated for expanded arguments/sources and canonical publication |
| `DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md` | added as deployment authority |
| `PLAN_DELTA_V7_PERSONAL_STUDY_FEEDBACK.md` | retained but rewritten to distinguish durable state behavior from superseded panel UX |
| `RESTORATION_NEXT.md` | explicitly retired as historical pointer |
| `RESTORATION_PROGRESS.md` | explicitly retired as historical tracker |
| `RESTORATION_WORKING_RULE.md` | still valid as a general principle: content that is unreachable does not count as restored |
| `DOCUMENTATION_CLOSEOUT_PLAN.md` | already correctly labeled historical/completed |
| `DESIGN_INTENT_DELTA_V5_POLISH.md` | supporting design-intent history; its own status already defers to later owner decisions; palette/surface conflicts are superseded by the library-system baseline |

### Historical provenance — retain, do not use as current authority

These files document earlier restoration, migration, design, or release phases. They remain useful evidence of why a change happened but do not override current docs/runtime:

- `BRANCH_AUDIT_2026-09-20.md`
- `EXPERIENCE_PARITY_RESTORATION_PLAN.md`
- `NON_COURSE_LEGACY_SOURCE_AUDIT.md`
- `PLAN_DELTA_ABOUT_FOOTER_REFINEMENT.md`
- `PLAN_DELTA_AUTOMATED_LLMS_TXT.md`
- `PLAN_DELTA_BIBLE_IDENTITY_RESTORATION.md`
- `PLAN_DELTA_FEEDBACK_REMEDIATION.md`
- `PLAN_DELTA_ORIGINAL_BIBLE_DRAWER_THEME.md`
- `PLAN_DELTA_PRELAUNCH_SELF_HEALING_GATE.md`
- `PLAN_DELTA_V7_BUILD_RELEASE_SEPARATION.md`
- `PLAN_DELTA_V7_OPEN_SOURCE_ASSEMBLY.md`
- `PLAN_DELTA_V7_V5_POLISH.md`
- `PLAN_FULL_EXPERIENCE_RESTORATION.md`
- `RESTORATION_AUDIT_2026-09-20.md`
- `TOPICS_RESTORATION_ACCEPTANCE.md`
- `TOPICS_RESTORATION_NOTE.md`
- `WBS_ABOUT_FOOTER_REFINEMENT.md`
- `EXECUTION_GRAPH_ABOUT_FOOTER_REFINEMENT.json`
- `bible-identity-restoration-graph.json`
- `build-release-separation-graph.json`
- `curriculum-multicourse-execution-graph.json`
- `documentation-closeout-graph.json`
- `experience-parity-execution-graph.json`
- `feedback-remediation-execution-graph.json`
- `feedback-remediation-wbs.json`
- `full-experience-restoration-graph.json`
- `original-bible-drawer-theme-execution-graph.json`
- `original-bible-drawer-theme-wbs.json`
- `prelaunch-self-healing-gate-graph.json`
- `project-execution-graph.json`

Historical files are not deleted because they provide implementation provenance and rollback context. Their dates/names and this audit make their status explicit. If a historical finding remains actionable, it must be promoted into a current plan rather than silently treated as current because an old file still exists.

## v6 documentation

`docs/v6/` is historical architecture/release documentation for the previous foundation. It may be consulted for implementation history, evidence discipline, migrations, or prior decisions, but it cannot override current v7/current product governance.

## User-facing data-path documentation

Current docs recognize these user-facing ownership rules:

- Course owns courses, units, lessons, mastery/capstones, and current learning position.
- Bible owns the 66-book shelf, book information, chapters, Scripture reading, and Bible-specific context.
- Topics owns curated reference/glossary exploration outside completion.
- Practice owns reinforcement/review rather than curriculum progression.
- About owns Statement of Faith, methodology, translation, accessibility, privacy, and institutional explanation.
- Theologian synthesizes evidence across first-party content but is not itself the source of authority.
- Feedback is globally reachable.
- Profile/Account owns appearance selection and account/sync controls.

A consolidated learner Journal index and extra Bible/Topic Journal entry points must not be described as implemented until runtime paths and validation exist.

## Fixes completed in this pass

- root README rewritten to current product state;
- `AI_INSTRUCTIONS.md` aligned with questions-first curriculum, library baseline, cloud Theologian, evidence/privacy rules, and editable-baseline policy;
- `DECISION_PRECEDENCE.md` rewritten to current authority;
- multi-course plan updated to current names/counts and questions-first model;
- questions-first plan/graph absorbed from PR #20;
- Orientation updated from the old 25-unit framing to the six-course questions-first model;
- Cloud Theologian runtime doc expanded for normalized arguments/source catalog;
- personal-study/Feedback historical plan corrected so superseded “Notes & Journal” presentation is not mistaken for the current Session Notes pattern;
- stale restoration-next/progress markers retired;
- canonical deployment contract added;
- deterministic theology publication and drift validation added;
- README/current docs no longer call cloud conversational Theologian “not implemented”;
- README/current docs no longer use the old Course 5/6 names or 116/235 counts.

## Remaining pre-merge documentation work

Only generated artifacts remain to be regenerated by the authoritative build (`catalog.json`, `curriculum.md`, `llms.txt`, and published theology files). Final PR #21 CI must prove those generated outputs and all documented contracts converge. No document should be marked “final merged/deployed” until that evidence exists.
