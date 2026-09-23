# Canonical Shelf convergence and supersession — 2026-09-22

Status: **current release-convergence authority for PR #24**

## Purpose

PR #24 is the sole active convergence/release PR for the current Canonical Shelf release. Older open PRs remain historical provenance only until #24 receives executable current-head validation and they can be closed safely.

This document prevents future agents from rediscovering #20, #22, or #23 and treating them as parallel implementation authorities.

## PR disposition matrix

| PR | Original purpose | Current disposition | Preserve | Superseded / do not merge |
|---|---|---|---|---|
| #20 | questions-first six-course curriculum | **absorbed/superseded** | questions-first spiral, 12 question threads, current Course 5/6 framing, stable IDs, current counts, retention separation | independent #20 branch/commit history as a merge source |
| #22 | production Library First + Cloud Theologian hotfix | **natively superseded by #24** | Library First appearance, 66-book Home shelf, Theologian naming/status UX, cache invalidation, real post-deploy cloud inference smoke | `locked-home.js`, `locked-library-baseline.css`, `library-system-refinements.css`, DOM-wide MutationObserver repair, legacy Guide shell upgrade layers |
| #23 | complete learner-facing `llms.txt` corpus | **selectively absorbed by #24** | complete learner-facing corpus intent, BSB link-not-embed rule, privacy exclusions, generated/freshness validation | #23's large generated `llms.txt` snapshot as an independent source or blind cherry-pick |
| #24 | native document-first rendering + integrated current release | **sole active release candidate** | all current product/runtime/content/theology/deployment authority | parallel merge paths from #20/#22/#23 |

## #20 evidence

Merged PR #21 integrated the questions-first curriculum into `main` at merge commit `8636421f8ffd7e62c92a6bec935000f7479172bd`. Current #24 carries that curriculum forward and validates the current six-course target:

- 6 courses
- 44 scored units
- 117 guided lessons
- 119 mastery/capstone activities
- 236 scored activities
- 12 recurring question threads
- stable inherited IDs
- 1 → 3 → 7 → 14 → 30 → 60 review cadence

No #20 commit should be merged into #24 merely because #20 remains open.

## #22 evidence

#24 preserves #22's desired behavior in native owners:

- Home owns Library First composition and the 66-book shelf;
- Study Focus/Home/Topics own learner-facing Theologian entry points directly;
- `public/theologian-chat.js` owns traditional chat, loading/thinking/fallback/validation UX;
- `public/theologian-cloud.js` is a direct cloud client rather than a DOM repair/rename layer;
- `public/sw.js` owns current cache invalidation and route-document offline behavior;
- `scripts/verify-deployment.mjs` performs a real cloud Theologian smoke request after deployment.

`scripts/validate-pr22-supersession.mjs` rejects the obsolete #22 repair architecture.

## #23 evidence

#24 makes `content/learner-content-reachability.json` authoritative for learner corpus scope. Every current content family receives an explicit `llms.txt` disposition:

- `embed` — learner-facing curriculum/reference/editorial content;
- `link` — complete BSB corpus, linked rather than duplicated verbatim;
- `exclude` — supplemental long-form belief context as a standalone authority and all private/internal content outside the learner corpus.

`scripts/llms-contract.mjs` builds the corpus from current #24 sources, and `scripts/validate-llms.mjs` checks freshness/coverage/privacy/disposition invariants. Prelaunch repair regenerates `public/llms.txt`, so #23's generated snapshot is intentionally not imported.

## Current Statement of Faith authority

Public doctrinal ceiling:

`content/statement/statement-of-faith-compact.md`

Supplemental Theologian context only:

`content/statement/statement-of-faith-v3.md`

The long-form file must never be restored as the public Statement of Faith merely because older plans or PRs refer to it that way.

## Current Theologian contract

The current Theologian:

- is learner-facing as **Theologian**, never “Ask the Guide”;
- presents multiple credible viewpoints when beliefs, interpretations, manuscripts, lexical claims, or translations materially differ;
- labels Canonical Shelf's own position rather than imposing it;
- preserves learner free inquiry and decision-making;
- uses the approved grace/love interpretive foundation;
- keeps private Journal/notes/reflection/account/feedback content out of cloud model context;
- may use a bounded conversation excerpt and allowlisted study-state summary;
- may persist the active chat locally in the browser, but not server-side/account-side.

## Current architecture exclusions

The following are not current implementation strategies and must not reappear without a new explicit owner decision:

- whole-body/broad-subtree MutationObserver repair;
- duplicate top-level renderers competing for `#main`;
- render-obsolete-UI-then-relocate/rename flows;
- `public/library-system.js` repair runtime;
- `public/library-system-refinements.css` corrective layer;
- `public/locked-home.js`;
- `public/locked-library-baseline.css`;
- blind merges/cherry-picks from #20/#22/#23.

Historical references to these items are allowed only when clearly labeled historical/superseded.

## Closure rule

Do not merge #20, #22, or #23.

After #24 receives an executable current-head prelaunch/full validation run and any real failures are resolved:

1. mark #24 ready for review;
2. close #20, #22, and #23 as superseded (not merged);
3. merge #24 to `main`;
4. deploy through the canonical production workflow only;
5. verify route ownership, generated content, offline behavior, bindings, and live Theologian inference in production.
