# Canonical Shelf documentation audit — 2026-09-21

Status: **current documentation authority map; refreshed 2026-09-22 for PR #24 convergence**

## Purpose

This audit prevents superseded restoration plans, design experiments, architecture workarounds, historical release notes, old curriculum counts, legacy Guide terminology, and open-but-superseded PRs from being mistaken for current Canonical Shelf authority.

## Authority order

When documents disagree, use this order:

1. latest explicit owner decision;
2. `AI_INSTRUCTIONS.md`;
3. `docs/v7/DECISION_PRECEDENCE.md`;
4. current domain authority documents/source contracts listed below;
5. canonical runtime/data source;
6. generated artifacts produced from those sources;
7. historical plans/audits/PRs as provenance only.

“Approved”, “locked”, and “canonical” describe the current baseline, not immutability.

## Current authoritative documents

| Document | Status | Owns |
|---|---|---|
| `README.md` | current | concise current product/runtime/content/deployment overview |
| `AI_INSTRUCTIONS.md` | current | project operating rules and experience priorities |
| `docs/v7/DECISION_PRECEDENCE.md` | current | decision precedence + integrated release authority |
| `docs/v7/CONVERGENCE_SUPERSESSION_2026-09-22.md` | current | #20/#22/#23 → #24 convergence and supersession |
| `docs/v7/CONTENT_REACHABILITY_AND_THEOLOGIAN_AUTHORITY_2026-09-22.md` | current | compact faith ceiling, supplemental belief context, Theologian agency/privacy, learner-content reachability, `llms.txt` disposition |
| `docs/v7/LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md` | current editable baseline | default visual/interaction grammar |
| `docs/v7/PLAN_NATIVE_DOCUMENT_RENDERING_2026-09-22.md` | active release implementation record | native route documents and release work for #24 |
| `docs/v7/native-document-rendering-graph.json` | current typed PEG | #24 execution dependencies/invariants |
| `docs/v7/CURRICULUM_MULTI_COURSE_PLAN.md` | current structural reference | six-course/stable-ID curriculum structure |
| `docs/v7/PLAN_DELTA_QUESTIONS_FIRST_SPIRAL.md` | current curriculum record | questions-first spiral/current course framing |
| `docs/v7/THEOLOGIAN_CLOUD_RUNTIME_2026-09-21.md` | supporting runtime reference | cloud/deterministic evidence runtime; defers to newer 2026-09-22 authority on faith/agency/chat persistence |
| `docs/v7/DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md` | current | exact production target and release verification |
| `docs/v7/DOCUMENTATION_AUDIT_2026-09-21.md` | current | this authority/status map |

## Current product/runtime values

- 6 courses
- 44 scored units
- 117 guided lessons
- 119 mastery/capstone activities
- 236 scored activities
- 12 recurring question threads
- 45 Topics outside completion
- retention cadence 1 → 3 → 7 → 14 → 30 → 60 days

Historical 25-unit / 70-lesson / 69-mastery / 139-activity values are migration baselines only.

Current Course 5/6 titles are **How We Know: Interpretation & Evidence** and **Christian Theology, Traditions & Synthesis**.

## Current rendering architecture

PR #24 uses route-owned, document-first rendering:

- `public/index.html` is the shared shell/root compatibility source;
- `scripts/generate-route-documents.mjs` generates route documents for Home, Course, Bible, Topics, Practice, Search;
- different top-level destinations use normal document navigation;
- same-destination detail/query state may use bounded History API enhancement;
- whole-body/broad-subtree MutationObserver repair, duplicate `#main` renderers, render-old-then-repair flows, and stacked corrective layers are excluded;
- `public/library-system.js` and `public/library-system-refinements.css` are removed from active architecture;
- `public/locked-home.js` and `public/locked-library-baseline.css` are superseded #22 artifacts and must not exist in #24;
- service-worker/offline handling owns route-specific generated documents.

## Canonical sources vs generated outputs

Author-maintained canonical inputs include:

```text
content/curriculum/
content/statement/statement-of-faith-compact.md
content/statement/statement-of-faith-v3.md        # supplemental Theologian context only
content/theology/policy.json
content/theology/sources.json
content/learner-content-reachability.json
content/vendor/legacy/
public/index.html
```

Generated/published outputs include:

```text
public/data/catalog.json
public/data/curriculum.md
public/data/statement-of-faith.md
public/data/theologian-belief-context.md
public/data/theology-policy.json
public/data/theology-sources.json
public/data/corpus.txt
public/llms.txt
public/home.html
public/course.html
public/bible.html
public/topics.html
public/practice.html
public/search.html
wrangler.jsonc
```

Generated outputs are not independent hand-edited authorities.

## Statement of Faith / theology authority

Public doctrinal ceiling:

`content/statement/statement-of-faith-compact.md`

Supplemental Theologian-only belief context:

`content/statement/statement-of-faith-v3.md`

The long-form file is not the public Statement of Faith. Older documentation that says otherwise is superseded.

Agreement with the compact Statement of Faith is not required to use Canonical Shelf, and theological assent is not scored.

## Current Theologian documentation

The learner-facing name is **Theologian**. Historical `guide-*` identifiers may remain internally only for compatibility.

Current contract:

- Cloudflare Workers AI conversational synthesis when available;
- deterministic evidence-aware fallback;
- BSB → current site content → compact Statement of Faith → supplemental belief context → theology policy/vetted scholarship;
- approved grace/love interpretive foundation;
- multiple viewpoints and material translation differences where responsibly disputed;
- Canonical Shelf position labeled rather than imposed;
- learner agency/free inquiry preserved;
- active chat may persist locally in the browser across reloads until New chat;
- no server/account persistence of Theologian conversation text;
- bounded recent conversation + allowlisted study-state summary may be model context;
- Journal text, lesson notes, reflection writing, profile/account identifiers, feedback content, and inferred theological beliefs are excluded.

## Learner corpus / `llms.txt`

`content/learner-content-reachability.json` owns `embed` / `link` / `exclude` dispositions.

- complete learner-facing corpus is generated into `public/llms.txt` according to that manifest;
- full BSB corpus is linked, not duplicated verbatim;
- supplemental long-form belief context is excluded as a standalone public authority;
- private/internal content is excluded;
- `public/llms.txt` is regenerated/freshness-validated and is not a hand-maintained authority.

## PR convergence status

- **#24** — sole active release/convergence PR.
- **#20** — superseded independent PR; curriculum intent is already represented by merged #21/main and current #24.
- **#22** — superseded implementation; requirements preserved natively in #24, repair architecture rejected.
- **#23** — superseded independent PR; learner-corpus intent selectively absorbed into #24, generated snapshot must not be merged.

See `docs/v7/CONVERGENCE_SUPERSESSION_2026-09-22.md`.

## Current deployment documentation

Canonical production target:

`https://the-canonical-shelf.christopherwonder.workers.dev`

Release verification requires exact Worker/origin/D1/AI/release identity, generated route ownership, critical generated content, offline/runtime validation, and a real `/api/theologian` cloud inference with substantive answer, non-empty evidence, BSB guardrail, and passed policy validation.

A successful `wrangler deploy` or HTTP 200 alone is insufficient.

## Historical provenance

Historical v5/v6, restoration, migration, completed delta, corrective-layer, and superseded PR documentation may remain for provenance/rollback reasoning. It must not override current authority.

Examples include earlier restoration plans/graphs, old branch audits, old design correction documents, completed implementation deltas, and prior production hotfix approaches.

If an old finding remains actionable, promote it into a current authority/plan rather than silently following the historical file.

## Verification status

The latest #24 GitHub Actions attempts have continued to fail before runner allocation with zero executed steps and `runner_id: 0`. These are infrastructure/no-runner outcomes, not code-test results. PR #24 remains draft until a current head actually receives a runner and executes the release gates.

Do not document #24 as merged, deployed, or fully validated until that evidence exists.
