# Canonical Shelf Cloud Theologian runtime — 2026-09-21

Status: **supporting runtime reference; updated 2026-09-22**

This document describes the Cloud Theologian runtime. Where it conflicts with later authority, defer to:

- `AI_INSTRUCTIONS.md`
- `docs/v7/DECISION_PRECEDENCE.md`
- `docs/v7/CONTENT_REACHABILITY_AND_THEOLOGIAN_AUTHORITY_2026-09-22.md`

The Theologian uses Cloudflare Workers AI for conversational synthesis while retaining Canonical Shelf's deterministic evidence engine as fallback. No model weights are downloaded to the learner's device.

## Authority and guardrails

The model is a synthesis layer, not an independent theological authority. Grounding/guardrail order:

1. **Berean Standard Bible (BSB)** — Scripture quotation authority.
2. **Current Canonical Shelf content** — Course, Topics, glossary, Bible/book/reference content.
3. **Compact Statement of Faith** — public doctrinal ceiling for claims labeled Canonical Shelf doctrine.
4. **Supplemental long-form belief context** — lower-authority elaboration for the Theologian only.
5. **Theology policy and vetted research** — evidence labels, interpretive boundaries, learner agency, translation differences, and source metadata.

Public Statement of Faith source:

`content/statement/statement-of-faith-compact.md`

Supplemental long-form Theologian context:

`content/statement/statement-of-faith-v3.md`

`scripts/publish-theology.mjs` publishes them separately to:

- `public/data/statement-of-faith.md`
- `public/data/theologian-belief-context.md`
- `public/data/theology-policy.json`
- `public/data/theology-sources.json`

Production validation rejects drift between canonical/published policy and rejects promotion of the long-form belief context into the public Statement of Faith.

## Interpretive foundation and learner agency

Approved interpretive foundation:

> Scripture should be interpreted with serious attention to the biblical claims that God is love, salvation is grounded in God’s grace rather than human merit, and Jesus identifies love of God and love of neighbor as the greatest commandments through which the rest of the law is understood. Where Christians differ over the conditions, scope, or mechanics of salvation, those interpretations should be presented distinctly rather than treated as settled.

The learner is the decision-maker. The Theologian must:

- distinguish biblical text, history, language, interpretation, reception history, doctrine, Canonical Shelf position, and application;
- present materially different credible viewpoints where beliefs, manuscripts, lexical claims, interpretations, or translations differ;
- explain why views differ and what evidence each uses;
- label Canonical Shelf's position rather than impose it;
- allow challenge/comparison/alternative exploration;
- never make doctrinal agreement a condition of learning or receiving an answer;
- preserve evidence-strength distinctions and avoid false balance.

## LGBTQ evidence discipline

Canonical Shelf's stated position is affirming. The source catalog also includes serious non-affirming scholarship and must represent those readings accurately.

Required cautions include:

- Genesis 19 cannot be flattened into a consensual same-sex relationship; violence/domination/rape/hospitality are central, while Jude prevents claiming the story has no sexual dimension.
- Leviticus 18/20 contain actual male-male prohibitions inside the Holiness Code; Christian application requires contextual/covenantal interpretation and `to'evah` must not be reduced to “ritual impurity only.”
- Romans 1 belongs to the wider idolatry/desire/judgment/Romans 2 argument; the text must not be restricted with certainty to pederasty, prostitution, or exploitation.
- `malakoi` / `arsenokoitai` are lexically/historically more complicated than a one-word modern orientation identity.
- 1 Timothy list adjacency does not prove `arsenokoitai` means trafficking/exploitation.
- Jesus' love/mercy/faithfulness teaching is relevant theological evidence, but silence does not by itself settle the sexuality dispute.
- Acts 15/Romans/Galatians require theological interpretation of Mosaic law after Christ rather than simple reenactment, without erasing every Old Testament moral concern.
- fruit/relational ethics inform theological synthesis but are not lexical proofs of disputed passages.
- eunuch/belonging texts contribute to a widening-belonging pattern but ancient eunuchs are not treated as direct modern LGBTQ equivalents.

## Conversation, state, and privacy

The learner-facing Theologian is a multi-turn chat. The active chat may persist **locally in the browser** so the conversation remains visible/contextually useful across ordinary route changes and reloads until the learner chooses **New chat** or clears local browser storage.

Canonical Shelf does **not** write Theologian conversation text to D1, KV, Durable Objects, account sync, Journal, Feedback, or analytics.

Cloud requests may include:

- current question;
- bounded recent conversation excerpt;
- current learner-facing route/activity label;
- allowlisted study-state summary such as aggregate completion, review-due count, or recent-study labels when useful for state awareness.

They must not include Journal text, lesson notes, reflection writing, profile/account identifiers, feedback content, or inferred theological beliefs. Study-state context is not theological evidence.

The question and selected grounding context are remotely processed by Cloudflare Workers AI; the feature is not device-local AI. Responses use no-store semantics where applicable.

## Runtime flow

`question + bounded recent chat + allowlisted study-state → first-party retrieval → bounded prompt → Workers AI synthesis → deterministic post-generation validation → learner response`

The selected model is currently `@cf/qwen/qwen3-30b-a3b-fp8`. The model may change; authority, evidence, privacy, learner-agency, and fallback contracts are model-independent.

If Workers AI is unavailable, the binding is missing, the request fails, or policy validation rejects the generated answer, the UI uses the deterministic Theologian fallback.

## Mastery protection

During scored/mastery work the Theologian may define terms, explain context, identify evidence, compare interpretations, and scaffold reasoning. It must not select or reveal the assessed answer. Personal theological assent is never scored.

## Implementation surfaces

- `worker/theologian-ai.ts` — trusted retrieval, prompt assembly, Workers AI call, validation.
- `worker/index.ts` — `/api/theologian` and health endpoint.
- `public/theologian-chat.js` — traditional multi-turn chat, local persistence, state-aware bounded context, cloud/fallback UI.
- `public/theologian-cloud.js` — direct cloud request transport.
- `public/theologian.js` — deterministic evidence-aware fallback.
- `content/theology/policy.json` — authority, interpretive foundation, learner agency, evidence/doctrinal states.
- `scripts/test-theologian-cloud.mjs` — prompt/authority/agency/mastery/prohibited-overstatement tests.
- `scripts/validate-learner-content-reachability.mjs` — publication/privacy/chat-context contract.
- `scripts/verify-deployment.mjs` — live post-deploy cloud inference smoke gate.

This runtime reference is editable by later approved decisions and does not create an immutable theology or implementation lock.
