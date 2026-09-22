# Canonical Shelf Cloud Theologian runtime — 2026-09-21

Status: **approved, editable implementation baseline**

The Theologian uses Cloudflare Workers AI for conversational synthesis while retaining Canonical Shelf's deterministic evidence engine as the fallback. No model weights are downloaded to the learner's device.

## Authority and guardrails

The cloud model is a synthesis layer, not an independent theological authority. Its guardrail order is:

1. **Berean Standard Bible (BSB)** — Scripture quotations and passage evidence come from Canonical Shelf's bundled BSB corpus. The model must not invent BSB wording or silently substitute another translation.
2. **Canonical Shelf published content** — Course, Topics, glossary, Bible/book material, and other approved site content provide the product's own teaching and contextual material.
3. **Canonical Shelf Statement of Faith** — the doctrinal ceiling. Other Christian or scholarly positions may be explained accurately, but the model may not establish a contrary position as Canonical Shelf doctrine.
4. **Canonical Shelf theology policy and vetted research** — evidence labels, interpretive boundaries, LGBTQ invariants, queer reception material, and vetted source metadata govern disputed claims.

The existing evidence discipline remains mandatory: distinguish biblical text, historical context, lexical evidence, interpretation, reception history, doctrine, Canonical Shelf position, and application; label contested evidence; do not make lexical shortcuts into doctrine; represent significant non-affirming Christian interpretations accurately without displacing Canonical Shelf's stated affirming position.

## LGBTQ research already present in the repository

The repository already contains the LGBTQ/queer-reception guardrails and vetted research needed by this runtime.

- `public/data/theology-policy.json` carries the affirmed LGBTQ claims, relational-ethics standard, queer-reception boundaries, and prohibited overstatements.
- `content/theology/sources.json` carries vetted academic source metadata, currently including:
  - Theodore W. Jennings, **“Same-Sex Relations in the Biblical World,”** *The Oxford Handbook of Theology, Sexuality, and Gender* (2014).
  - Benjamin H. Dunning, **“Same-Sex Relations,”** *The Oxford Handbook of New Testament, Gender, and Sexuality* (2019).
  - Jeremy Punt, **“Queer Bible Readings in Global Hermeneutical Perspective,”** *The Oxford Handbook of Feminist Approaches to the Hebrew Bible* (2020).
  - **“Reading Ruth, Reading Desire,”** *The Oxford Handbook of Biblical Narrative* (2015).
- `docs/v6/theologian-runtime.md` remains useful historical/editorial context for the evidence discipline and LGBTQ invariants.

For questions involving LGBTQ identity, same-sex relationships, Romans 1, Leviticus 18/20, `arsenokoitai`, `malakoi`, Ruth/Naomi, David/Jonathan, eunuchs, queer kinship, or related material, the cloud runtime includes the vetted LGBTQ research set as first-class grounding material rather than relying on model memory alone.

## Privacy and storage

- The browser sends only the current question and the current user-facing route to `/api/theologian`.
- The Worker retrieves the BSB, current Canonical Shelf content, Statement of Faith, theology policy, and source metadata from trusted first-party static assets.
- The application does **not** write Theologian conversations to D1, KV, Durable Objects, or another Canonical Shelf server-side store.
- Conversation history is not persisted by Canonical Shelf. The initial implementation is stateless per request.
- Journal content, profile data, progress history, and account data are not sent to Workers AI as conversational context.
- The response uses `Cache-Control: no-store`.

## Runtime flow

`question -> first-party retrieval -> guardrail prompt -> Workers AI synthesis -> deterministic post-generation validation -> learner response`

The selected cloud model is `@cf/qwen/qwen3-30b-a3b-fp8`. The model is replaceable; the guardrails and retrieval contract are not tied to one model.

If Workers AI is unavailable, the AI binding is missing, the request fails, or post-generation validation rejects the generated answer, the UI keeps the existing deterministic Theologian response. Cloud synthesis is therefore an enhancement rather than a single point of failure.

## Mastery protection

During scored or mastery work the model may define terms, explain context, identify evidence, compare interpretations, and scaffold reasoning. It must not select or reveal the assessed answer. Existing deterministic mastery protection remains authoritative.

## Implementation surfaces

- `worker/theologian-ai.ts` — trusted asset retrieval, grounding prompt, Workers AI call, post-generation validation.
- `worker/index.ts` — `/api/theologian` endpoint.
- `scripts/write-wrangler.mjs` — `AI` Workers AI binding.
- `public/theologian-cloud.js` — progressive cloud enhancement over the existing deterministic Guide/Theologian.
- `public/theologian.js` — deterministic evidence-aware fallback.
- `scripts/test-theologian-cloud.mjs` — verifies BSB/site/Statement/LGBTQ grounding and prohibited-overstatement fallback.

This document is authoritative for continuity but remains editable by later approved decisions. It does not create an immutable design or theology lock.
