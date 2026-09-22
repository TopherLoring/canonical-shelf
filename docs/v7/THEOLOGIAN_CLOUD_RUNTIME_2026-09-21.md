# Canonical Shelf Cloud Theologian runtime — 2026-09-21

Status: **approved, editable implementation baseline**

The Theologian uses Cloudflare Workers AI for conversational synthesis while retaining Canonical Shelf's deterministic evidence engine as the fallback. No model weights are downloaded to the learner's device.

## Authority and guardrails

The cloud model is a synthesis layer, not an independent theological authority. Its guardrail order is:

1. **Berean Standard Bible (BSB)** — Scripture quotations and passage evidence come from Canonical Shelf's bundled BSB corpus. The model must not invent BSB wording or silently substitute another translation.
2. **Canonical Shelf published content** — Course, Topics, glossary, Bible/book material, and other approved site content provide the product's own teaching and contextual material.
3. **Canonical Shelf Statement of Faith** — the doctrinal ceiling. Other Christian or scholarly positions may be explained accurately, but the model may not establish a contrary position as Canonical Shelf doctrine.
4. **Canonical Shelf theology policy and vetted research** — evidence labels, interpretive boundaries, declared LGBTQ position, queer-reception material, and vetted source metadata govern disputed claims.

The evidence discipline is mandatory: distinguish biblical text, historical context, lexical evidence, interpretation, reception history, doctrine, Canonical Shelf position, and application; label contested evidence; do not turn lexical shortcuts into doctrine; represent significant non-affirming Christian interpretations accurately without displacing Canonical Shelf's stated affirming position.

## Canonical theology sources

The author-maintained sources are:

- `content/statement/statement-of-faith-v3.md`
- `content/theology/policy.json`
- `content/theology/sources.json`

`scripts/publish-theology.mjs` deterministically publishes them to:

- `public/data/statement-of-faith.md`
- `public/data/theology-policy.json`
- `public/data/theology-sources.json`

Production validation rejects drift between the canonical and published copies.

## LGBTQ beliefs and argument framework

Canonical Shelf's stated position remains affirming:

- LGBTQ people possess equal dignity and belonging.
- Homosexual or bisexual orientation is not inherently sinful.
- Renouncing LGBTQ orientation is not a condition of grace or Christian discipleship.
- Faithful same-sex relationships and marriage may embody Christian virtue.
- LGBTQ identity does not disqualify worship, service, teaching, leadership, or spiritual gifts.
- Relationships are evaluated by fidelity, consent, honesty, mutuality, equality, responsibility, self-control, care, dignity, and self-giving love rather than partner gender.

The source research has been normalized into an explicit argument framework rather than copied as advocacy prose. The current framework covers:

- **Sodom:** Genesis 19 is not a depiction of a consensual same-sex relationship; violence, domination, threatened gang rape, and failed hospitality are central. Ezekiel and Jesus supply additional canonical interpretation. Jude 7 prevents flattening the story into a claim that it has no sexual dimension at all.
- **Leviticus 18/20:** the male-male prohibitions are real texts inside Israel's Holiness Code. Christian application requires both careful Hebrew exegesis and an account of covenant/law after Christ. `to'evah` must not be reduced to “ritual impurity only.”
- **Romans 1–2:** Romans 1 belongs to Paul's larger argument about idolatry, desire, judgment, and the rhetorical turn toward the one who judges in Romans 2. Ancient sexual categories and modern orientation/covenantal-marriage categories are not identical. `para physin` cannot simply be glossed as “unusual,” and the text must not be restricted with certainty to pederasty, prostitution, or exploitation.
- **`malakoi` / `arsenokoitai`:** the terms are historically and lexically more complicated than the modern orientation category “homosexual.” Their semantic range and social scope must be presented with appropriate uncertainty; neither term gets a one-word modern identity equivalent by decree.
- **1 Timothy 1:** adjacency to enslavers can support inquiry into exploitation/coercion in the ancient social world, but list order does not prove that `arsenokoitai` means trafficking or exploitation.
- **Jesus and love:** the Gospels do not record Jesus explicitly addressing same-sex relationships. His repeated teaching on love, mercy, faithfulness, and burdensome religious hypocrisy is relevant theological evidence, but silence alone does not decide the exegetical dispute; Matthew 19 remains a serious text in Christian marriage arguments.
- **Law and grace:** Acts 15, Romans, and Galatians establish a changed covenantal relationship to Mosaic law for Gentile Christians. That requires theological interpretation rather than simple reenactment of the Israelite legal code, but it does not mean every Old Testament moral concern disappears.
- **Fruit and relational ethics:** fruit-of-the-Spirit and love/faithfulness reasoning forms part of Canonical Shelf's theological synthesis for evaluating relationships by the same virtues. It is not a lexical proof of a disputed sexuality passage.
- **Eunuchs and expanding belonging:** Deuteronomy 23, Isaiah 56, Acts 8, and Acts 10 contribute to a canonical pattern of widening covenant belonging. Ancient eunuchs are not treated as a direct equivalent of a modern LGBTQ identity.
- **Grace and belonging:** orientation is not treated as a precondition that must be renounced before receiving grace or participating in Christian life. Grace texts govern the gospel context of the dispute without pretending to settle every lexical question by themselves.

## Vetted research set

The source catalog now includes affirming, non-affirming, lexical, historical, commentary, and primary-source-oriented scholarship so the model does not depend on its own training memory for disputed claims. Representative sources include:

- Theodore W. Jennings, *Same-Sex Relations in the Biblical World*.
- Benjamin H. Dunning, *Same-Sex Relations*.
- Jeremy Punt, *Queer Bible Readings in Global Hermeneutical Perspective*.
- James V. Brownson, *Bible, Gender, Sexuality*.
- Dale B. Martin, *Arsenokoitai and Malakos: Meanings and Consequences* and *Sex and the Single Savior*.
- Martti Nissinen, *Homoeroticism in the Biblical World*.
- Robin Scroggs, *The New Testament and Homosexuality*.
- Dan O. Via and Robert A. J. Gagnon, *Homosexuality and the Bible: Two Views*.
- Richard B. Hays, *The Moral Vision of the New Testament*.
- Robert A. J. Gagnon, *The Bible and Homosexual Practice*.
- William Loader, *The New Testament on Sexuality*.
- Saul M. Olyan on Leviticus 18:22 / 20:13.
- Jacob Milgrom on Leviticus.
- Robert Jewett and Joseph A. Fitzmyer on Romans.
- Thomas K. Hubbard and Kenneth J. Dover for Greco-Roman source/history context.
- BDAG, LSJ, HALOT, and BDB for lexical evidence.
- Bruce Metzger for translation history.
- Matthew Vines as an accessible contemporary affirming synthesis.

Each source record states both what it can support and its limits. Non-affirming sources are intentionally present so serious competing interpretations can be described accurately rather than caricatured.

## Privacy and storage

- The browser sends the current question and current user-facing route to `/api/theologian`.
- The Worker retrieves BSB, site content, Statement of Faith, policy, and source metadata from first-party static assets.
- Canonical Shelf does **not** write Theologian conversations to D1, KV, Durable Objects, account sync, or another Canonical Shelf server-side store.
- The initial cloud implementation is stateless per request.
- Journal content, profile data, progress history, and account data are not sent as model context.
- The response uses `Cache-Control: no-store`.
- The question and selected grounding context are nevertheless processed remotely by Cloudflare Workers AI; the feature should not be described as device-local AI.

## Runtime flow

`question → first-party retrieval → bounded prompt → Workers AI synthesis → deterministic post-generation validation → learner response`

The selected cloud model is `@cf/qwen/qwen3-30b-a3b-fp8`. The model may be replaced later; the authority, retrieval, evidence, privacy, and fallback contracts are model-independent.

If Workers AI is unavailable, its binding is missing, the request fails, or validation rejects the generated answer, the UI retains the deterministic Theologian response. Cloud synthesis is therefore an enhancement rather than a single point of failure.

## Mastery protection

During scored/mastery work the model may define terms, explain context, identify evidence, compare interpretations, and scaffold reasoning. It must not select or reveal the assessed answer. Existing deterministic mastery protection remains authoritative.

## Implementation surfaces

- `worker/theologian-ai.ts` — trusted retrieval, prompt assembly, Workers AI call, validation.
- `worker/index.ts` — `/api/theologian` plus deployment-health endpoint.
- `scripts/write-wrangler.mjs` — Workers AI binding and release identity.
- `public/theologian-cloud.js` — progressive cloud enhancement.
- `public/theologian.js` — deterministic evidence-aware fallback.
- `scripts/test-theologian-cloud.mjs` — BSB/site/Statement/LGBTQ grounding and rejection fallback tests.
- `scripts/publish-theology.mjs` — deterministic publication of canonical theology data.

This document is authoritative for continuity but remains editable by later approved decisions. It does not create an immutable design or theology lock.
