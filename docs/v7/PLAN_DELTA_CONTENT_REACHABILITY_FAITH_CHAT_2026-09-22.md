# Plan delta — learner content reachability, faith-statement separation, and conversational Theologian

Status: active implementation plan for PR #24
Date: 2026-09-22

## Objective

Complete PR #24 with an explicit learner-content reachability contract, separate the compact public Statement of Faith from the long-form supplemental belief context used by the Theologian, and make the cloud Theologian support bounded multi-turn conversation without adding server-side conversation persistence.

## UX/product outcomes

1. Every current learner-facing content family has a deliberate user-facing entry surface or an explicitly documented Theologian-only path.
2. About → Statement of Faith shows a compact public doctrinal ceiling and clearly states that agreement is not required to use Canonical Shelf.
3. The existing long-form belief document is no longer rendered as the public Statement of Faith. It remains available to the Theologian as supplemental context below the compact doctrinal ceiling.
4. The Theologian supports follow-up questions with a short in-memory browser conversation history while preserving the current BSB/site/evidence guardrails and deterministic fallback.
5. Conversation history is not written to D1, account sync, Journal, localStorage, KV, or Durable Objects.

## Invariants

- The compact Statement of Faith is the doctrinal ceiling.
- The long-form belief context may elaborate but may not override or silently expand the compact doctrinal ceiling.
- Understanding/reasoning, not theological assent, remains the assessment contract.
- The BSB remains the canonical Scripture quotation source.
- Theologian answers distinguish text, evidence/history, interpretation, reception, doctrine, Canonical Shelf position, and application.
- Course/Bible/Topics/Practice ownership boundaries and stable learner-state IDs remain unchanged.
- No model weights are shipped to the browser.

## Acceptance criteria

- `public/data/statement-of-faith.md` is generated from a compact canonical source and includes the explicit agreement-not-required disclosure.
- The existing long-form belief document is published separately for Worker retrieval and is not loaded by `about-page.js`.
- The Worker loads both resources with explicit authority ordering: compact Statement of Faith first; long-form belief context supplemental only.
- The Theologian client and Worker accept a bounded conversation-history payload and cap its size.
- History is session-memory-only in the browser and can be cleared without affecting learner state.
- A machine-readable learner-content reachability manifest maps every current learner-facing content family to its owning surface/entry path.
- Validation fails if the compact/long-form roles collapse, a required learner content source loses its mapped surface, or Theologian conversation history becomes persisted server-side.
- Existing production route, offline, assessment, state, theology, and live-cloud smoke gates remain required.

## Affected systems

- `content/statement/`
- `content/learner-content-reachability.json`
- `scripts/publish-theology.mjs`
- `scripts/postprocess-v6.mjs`
- `scripts/validate-production.mjs`
- new reachability validator
- `public/app.js`
- `public/theologian-cloud.js`
- `worker/theologian-ai.ts`
- Theologian tests and current documentation

## Validation

1. Generate/publish canonical content.
2. Validate compact Statement of Faith and supplemental long-form separation.
3. Validate learner-content reachability manifest against current source/public/route files.
4. Run Theologian unit tests including multi-turn history and authority ordering.
5. Run PR #24 prelaunch verification.
6. Obtain an executable full current-head CI run before merge.
7. After merge, production deployment must pass the live `/api/theologian` smoke gate.

## Risks and rollback

- Risk: compacting the public statement accidentally changes doctrine. Mitigation: compact statement is a summary of positions already present in the long-form document; long-form remains available as supplemental context, and the compact statement is explicitly the ceiling.
- Risk: conversation history expands prompts excessively. Mitigation: strict turn/content caps and current-question evidence retrieval.
- Risk: an indirect content family becomes invisible. Mitigation: reachability manifest distinguishes direct UI, progressive disclosure, and Theologian-only content.

Rollback is a single PR #24 revert of this delta; no learner-state migration is introduced.

## Human review gates

Before public launch, retain separate human review for theological/editorial nuance, novice usability, physical-device behavior, and manual accessibility. Automated validation does not represent those gates as passed.
