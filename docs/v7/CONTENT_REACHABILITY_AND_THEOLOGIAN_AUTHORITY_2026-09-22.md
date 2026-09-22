# Learner content reachability and Theologian authority — 2026-09-22

Status: **current authority for PR #24**; supersedes older documentation where it describes the long-form v3 belief document as the public Statement of Faith or describes Theologian chat as reload-ephemeral.

## Public Statement of Faith

The public doctrinal ceiling is:

`content/statement/statement-of-faith-compact.md`

It is deterministically published to:

`public/data/statement-of-faith.md`

and rendered at:

`/about.html#faith`

The public disclosure explicitly states that a learner is **not asked to agree with the Statement of Faith to use Canonical Shelf** and that assessment evaluates understanding and reasoning rather than theological assent.

## Supplemental long-form belief context

The existing long-form document remains at:

`content/statement/statement-of-faith-v3.md`

It is **not** the public Statement of Faith and is not rendered by the About page. It is published separately to:

`public/data/theologian-belief-context.md`

for Theologian use. The Worker treats this document as supplemental context only. It may add nuance, interpretive reasoning, pastoral framing, or additional belief detail when consistent with the compact Statement of Faith, but it does not replace, outrank, or silently expand the compact doctrinal ceiling.

## Theologian authority and learner agency

The authority order is:

1. Berean Standard Bible for canonical Scripture quotation.
2. Current Canonical Shelf Course, Topics, glossary, Bible/book, and reference content.
3. Compact Canonical Shelf Statement of Faith as doctrinal ceiling for claims labeled as Canonical Shelf doctrine.
4. Supplemental long-form belief context as lower-authority elaboration only.
5. Theology policy and vetted sources for evidence labels, interpretive boundaries, documented disagreement, translation differences, and supporting scholarship.

The approved interpretive foundation requires serious attention to the biblical claims that God is love, salvation is grounded in grace rather than human merit, and Jesus identifies love of God and love of neighbor as the greatest commandments through which the rest of the law is understood. Where Christians differ over the conditions, scope, or mechanics of salvation, those interpretations are presented distinctly rather than falsely treated as settled.

The learner remains the decision-maker. The Theologian may state Canonical Shelf's position, but it must distinguish that position from competing readings, surface material translation/interpretive differences, preserve evidence-strength distinctions, and never pressure the learner to adopt Canonical Shelf doctrine or any competing interpretation.

The model remains a synthesis layer rather than an independent theological authority.

## Conversation behavior and privacy

The learner-facing Theologian is a traditional multi-turn chat. The current browser chat is locally persistent under the Canonical Shelf Theologian chat key so the active conversation remains visible and useful across ordinary route changes and reloads until the learner starts a **New chat** or clears local browser storage.

Persistence is local to the browser. Canonical Shelf does **not** persist Theologian conversation text to D1, KV, Durable Objects, account sync, Journal, Feedback, or analytics.

For cloud synthesis, the browser may send:

- the current question;
- a bounded recent excerpt of the active Theologian conversation;
- the current learner-facing route/activity label;
- an allowlisted study-state summary such as aggregate completion/review-due context and recent study labels when useful to make the assistant state-aware.

The browser must not send Journal text, lesson notes, optional reflection writing, profile/account identifiers, feedback content, or inferred theological beliefs as model context. Study-state context is never theological evidence or authority.

## Learner-content reachability

`content/learner-content-reachability.json` is the machine-readable contract mapping current learner-facing content families to their owning surface or intentional Theologian-only path. It also owns each content family's `llms.txt` disposition: `embed`, `link`, or `exclude`.

Direct/progressive learner surfaces cover:

- Orientation → Course
- guided curriculum and mastery → Course
- complete BSB corpus → Bible
- 66-book profiles, groups, timelines, story arc, and shelf metadata → Bible
- Topics → Topics
- glossary → Topics / Search
- Practice campaign/games/ranks/achievements → Practice
- curated passage/Verse Library content → Practice
- appearance themes → Profile / Account → Appearance
- institutional disclosures → About
- compact Statement of Faith → About → Statement of Faith

Theologian-mediated content covers:

- theology policy
- vetted theology/source metadata
- supplemental long-form belief context

Those resources are not required to become parallel reference pages merely to be technically reachable; their learner-facing path is the Theologian's answer/evidence/guardrail layer.

Generated mirrors such as `public/data/catalog.json`, `public/data/curriculum.md`, generated route documents, and `public/llms.txt` do not require separate learner navigation when their substantive content already has an owning surface.

## `llms.txt` contract

PR #23's intended complete learner-corpus behavior is selectively absorbed into PR #24. `content/learner-content-reachability.json` is now the authority for `llms.txt` scope.

- Learner-facing curriculum/reference/editorial content marked `embed` is generated into `public/llms.txt`.
- The complete BSB corpus is marked `link` and is linked rather than duplicated verbatim.
- Supplemental long-form Theologian belief context is marked `exclude` so it cannot be mistaken for a standalone public doctrinal authority.
- Private learner/account/feedback data, implementation plans, tests, CI/configuration, and secrets are not part of the learner corpus.

`public/llms.txt` is generated during the normal prelaunch content-repair path and freshness-validated; the large generated snapshot from PR #23 is not an independent source of truth.

## Validation

`scripts/validate-learner-content-reachability.mjs` and `scripts/validate-llms.mjs` fail the release if:

- a mapped source/host/published artifact disappears;
- an `llms.txt` content family loses or contradicts its declared disposition;
- the public Statement of Faith becomes the long-form document again;
- the agreement-not-required disclosure disappears;
- About begins rendering the supplemental long-form Theologian belief context;
- the Worker stops loading the compact doctrinal ceiling or supplemental belief context;
- the published theology policy drifts from the canonical policy;
- the learner-agency/free-inquiry contract disappears;
- private learner writing/account/feedback fields are added to Theologian cloud context;
- the full BSB or supplemental belief document leaks into `llms.txt` contrary to the reachability contract.

These gates are wired into both prelaunch and full validation.
