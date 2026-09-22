# Learner content reachability and Theologian authority — 2026-09-22

Status: current authority for PR #24; supersedes older documentation where it describes the long-form v3 belief document as the public Statement of Faith.

## Public Statement of Faith

The public doctrinal ceiling is now:

`content/statement/statement-of-faith-compact.md`

It is deterministically published to:

`public/data/statement-of-faith.md`

and rendered at:

`/about.html#faith`

The public disclosure explicitly states that a learner is **not asked to agree with the Statement of Faith to use Canonical Shelf** and that assessment evaluates understanding and reasoning rather than theological assent.

## Supplemental long-form belief context

The existing long-form document remains at:

`content/statement/statement-of-faith-v3.md`

It is no longer the public Statement of Faith and is not rendered by the About page. It is published separately to:

`public/data/theologian-belief-context.md`

for Theologian use. The Worker treats this document as supplemental context only. It may add nuance, interpretive reasoning, pastoral framing, or additional belief detail when consistent with the compact Statement of Faith, but it does not replace, outrank, or silently expand the compact doctrinal ceiling.

## Theologian authority order

1. Berean Standard Bible for canonical Scripture quotation.
2. Current Canonical Shelf Course, Topics, glossary, Bible/book, and reference content.
3. Compact Canonical Shelf Statement of Faith as doctrinal ceiling.
4. Supplemental long-form belief context as lower-authority elaboration only.
5. Theology policy and vetted sources for evidence labels, interpretive boundaries, documented disagreement, and supporting scholarship.

The model remains a synthesis layer rather than an independent theological authority.

## Conversation behavior

The cloud Theologian supports bounded follow-up context in browser memory. Recent user/Theologian turns are condensed into the next request so follow-up questions can resolve prior conversational context.

This history is deliberately not written to localStorage, sessionStorage, IndexedDB, D1, KV, Durable Objects, account sync, Journal, or Feedback. Reloading the application clears the conversation context. The server remains stateless with respect to stored conversation history.

## Learner-content reachability

`content/learner-content-reachability.json` is the machine-readable contract mapping current learner-facing content families to their owning surface or intentional Theologian-only path.

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

Generated mirrors such as `public/data/catalog.json`, `public/data/curriculum.md`, and `public/llms.txt` do not require separate learner navigation when their substantive content already has an owning surface.

## Validation

`scripts/validate-learner-content-reachability.mjs` fails the release if:

- a mapped source/host/published artifact disappears;
- the public Statement of Faith becomes the long-form document again;
- the agreement-not-required disclosure disappears;
- About begins rendering the supplemental long-form belief context;
- the Worker stops loading either the compact doctrinal ceiling or supplemental belief context;
- session conversation context becomes persisted in browser storage.

This gate is wired into both prelaunch and full validation.
