# Plan delta — learner content reachability, faith-statement separation, and conversational Theologian

Status: active implementation plan for PR #24
Date: 2026-09-22

## Objective

Complete PR #24 with an explicit learner-content reachability contract, separate the compact public Statement of Faith from the long-form supplemental belief context used by the Theologian, and make the cloud Theologian a traditional multi-turn chatbot with a visible locally persistent transcript, bounded learner-state awareness, deterministic offline fallback, and the original theological/evidence guardrails restored where they have drifted.

## UX/product outcomes

1. Every current learner-facing content family has a deliberate user-facing entry surface or an explicitly documented Theologian-only path.
2. About → Statement of Faith shows a compact public doctrinal ceiling and clearly states that agreement is not required to use Canonical Shelf.
3. The existing long-form belief document is not rendered as the public Statement of Faith; it remains supplemental Theologian context below the compact doctrinal ceiling.
4. The Theologian behaves as a conventional chatbot: chronological user/assistant message transcript, composer at the bottom, follow-up context, loading/error state, evidence/limits attached to answers, and a New chat/Clear chat control.
5. The transcript persists locally across reloads until the learner clears it; it is not written to D1, KV, Durable Objects, account sync, Journal, Feedback, or remote conversation storage.
6. The Theologian is learner-state aware through a deliberately minimal context summary: current route/activity, course/activity completion counts, due-review count, and recent study labels. Journal text, lesson notes, reflection text, profile/account data, contact data, and inferred theological beliefs are excluded.
7. Reflection challenges retain the learner's typed response privately rather than recording only a submitted flag, while remaining unscored.
8. Original Guide/Theologian safeguards remain enforceable and visible where useful without turning the interface into a compliance dashboard.

## Invariants

- The compact Statement of Faith is the doctrinal ceiling.
- The long-form belief context may elaborate but may not override or silently expand the compact doctrinal ceiling.
- Understanding/reasoning, not theological assent, remains the assessment contract.
- The BSB remains the canonical Scripture quotation source.
- Theologian answers distinguish text, historical context, lexical evidence, interpretation, reception history, doctrine, Canonical Shelf position, and application.
- Evidence status and interpretive limits remain explicit where relevant; contested evidence must never be rendered as consensus.
- The typed theology model (`DoctrinalStatus`, `EvidenceStatus`, `ClaimDomain`, `InterpretationType`) remains the contract for structured theological/evidence status.
- Mastery protection prevents revealing/selecting assessed answers while still allowing explanation, context, evidence, and reasoning help.
- LGBTQ affirmations and the Ruth/Naomi, Romans 1, `arsenokoitai`, `malakoi`, `para physin`, `to'evah`, and eunuch boundaries remain enforced.
- The learner-state summary sent to cloud synthesis excludes private writing and identity/account data.
- Course/Bible/Topics/Practice ownership boundaries and stable learner-state IDs remain unchanged.
- No model weights are shipped to the browser.

## Acceptance criteria

- `public/data/statement-of-faith.md` is generated from the compact canonical source and includes the explicit agreement-not-required disclosure.
- The long-form belief document is published separately for Worker retrieval and is not loaded by `about-page.js`.
- The Worker loads both resources with explicit authority ordering: compact Statement of Faith first; long-form belief context supplemental only.
- Chat history is visible chronologically until cleared, survives reload locally, and is bounded before transmission to the Worker.
- New chat/Clear chat removes the persisted transcript and the context subsequently sent for follow-ups.
- The Worker remains stateless for conversation persistence.
- Learner-state context contains only approved summary fields and never private writing/profile/account payloads.
- Cloud and deterministic modes both retain mastery protection, evidence labels, source limits, theological boundaries, and Statement-of-Faith validation.
- The learner-facing name is `Theologian`, not `Guide`.
- The original typed theology/evidence model remains wired into runtime validation rather than becoming dead types.
- Reflection challenge text is stored privately with the activity/challenge and recoverable when returning to it; it is never scored for theological agreement.
- A machine-readable learner-content reachability manifest maps every current learner-facing content family to its owning surface/entry path.
- Existing production route, offline, assessment, state, theology, and live-cloud smoke gates remain required.

## Affected systems

- `content/statement/`
- `content/theology/`
- `content/learner-content-reachability.json`
- `src/knowledge/model.ts`
- `scripts/publish-theology.mjs`
- `scripts/validate-production.mjs`
- reachability/Theologian validation
- `public/app.js`
- `public/db.js`
- `public/learning.js`
- `public/theologian.js`
- `public/theologian-cloud.js`
- `public/utility-panels.css`
- `worker/theologian-ai.ts`
- Theologian tests and current documentation

## Validation

1. Generate/publish canonical content.
2. Validate compact Statement of Faith and supplemental long-form separation.
3. Validate learner-content reachability manifest.
4. Validate original theology-policy invariants and typed status model usage.
5. Test visible/local-persistent conversation behavior, bounded follow-up context, New chat/Clear chat, and learner-state allowlist.
6. Test reflection text persistence separately from Journal/lesson notes.
7. Test mastery protection in deterministic and cloud modes.
8. Run PR #24 prelaunch verification.
9. Obtain an executable full current-head CI run before merge.
10. After merge, production deployment must pass the live `/api/theologian` smoke gate.

## Risks and rollback

- Risk: compacting the public statement accidentally changes doctrine. Mitigation: compact statement summarizes already-governing positions; long-form remains supplemental and lower authority.
- Risk: chat/local transcript creates privacy ambiguity. Mitigation: make local persistence explicit in UI, provide one-action clearing, and exclude transcript from sync/server persistence.
- Risk: learner-state awareness leaks private material. Mitigation: construct a hard allowlist summary; no generic learner-state serialization is permitted.
- Risk: conversation history expands prompts excessively. Mitigation: keep full local transcript for viewing while transmitting only a bounded recent subset.
- Risk: reflection storage accidentally becomes theological scoring. Mitigation: persist text separately from scoring semantics; assessment records only submission/completion.
- Risk: rich chatbot UI hides evidence/limits. Mitigation: attach compact evidence/limits disclosure to each assistant answer.

Rollback is a PR #24 revert of this delta. Reflection-text persistence is additive to learner state and must tolerate absence in older state.

## Human review gates

Before public launch, retain separate human review for theological/editorial nuance, conversational quality, novice usability, physical-device behavior, and manual accessibility. Automated validation does not represent those gates as passed.
