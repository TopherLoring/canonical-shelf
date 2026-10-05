# The Canonical Shelf

**Canonical Shelf** is an offline-capable Bible-literacy, Scripture-reading, Christian-study, and reference application for adult learners. It teaches the Bible as a library, develops durable biblical knowledge and interpretive reasoning, makes evidence/limits visible, presents Christian disagreement responsibly, and supports independent investigation rather than permanent dependence on lessons.

> **Release status:** Theologian communication and optional free-only web research are implemented on `theologian-conversation-web`. Local checks and a live Tavily API search have passed; deployment to the existing test Worker and review of live AI conversations remain pending. The default browser gate requires Playwright’s pinned Chromium; this cloud environment used its documented system-Chromium override.

## Product model

Primary destinations:

1. **Home** — shelf-first orientation, continuation, and routes into the rest of the product.
2. **Pathway** — four-module guided curriculum and scored learning.
3. **Bible** — 66-book shelf, book profiles, chapters, BSB reader, and Bible-specific context.
4. **Topics** — curated reference and question-driven investigation outside completion.
5. **Practice** — retrieval, spaced review, mastery reinforcement, and learning games; not a second curriculum.

Supporting capabilities include Search, Progress, optional Account/Profile sync, appearance themes, Journal, **Feedback & reviews**, and **Theologian**.

## Optional Theologian web research

Explicit requests such as “Search the web for sources on baptism” can use Tavily.
Set `TAVILY_API_KEY` as a secret on the Cloudflare Worker; for cloud development,
use the environment secret binding and pass it to local Wrangler through its
supported secret configuration. Never commit a key. Browsing stays off without it.

Use Tavily's free **Researcher** account, with no payment method or pay-as-you-go.
Before each search the Worker checks `/usage`, accepts only the free plan with
disabled pay-as-you-go (zero or null limit), zero overage usage, and unused credits. Unknown billing
metadata blocks browsing. Each request uses one basic search (one credit), with
up to three results and their available page text; automatic upgrades are disabled.
The provider's free allowance is shared by the account. Chat continues when search
is unavailable, with the model instructed to disclose the lack of web verification.

Only the current explicit search message goes to Tavily. Retrieved pages are
untrusted references, and the Statement of Faith remains the governing doctrinal
stance. Sources appear in the existing evidence view. No autonomous browsing,
separate URL extraction, or paid plan is enabled.

## Learning model

Canonical Shelf uses a **questions-first spiral**: difficult doctrinal and interpretive questions are introduced early, revisited where evidence naturally appears, investigated with better interpretive tools, and synthesized later. Assessment evaluates understanding and reasoning, never theological assent.

Current generated curriculum counts are descriptive runtime data and may evolve. They are not long-term verification constants. Stable activity identity, deterministic scoring for completion-bearing work, learner-state preservation, spaced review behavior, and separation of reflection from scored completion are durable contracts.

## Experience / architecture

`public/canonical-shelf.css` is the shared visual-system authority. Feature CSS may own feature-specific composition but should not create a competing destination-wide design system.

The current selected direction uses scholarly typography, bookish geometry, graphite/chrome structure, bright gilt as a signal, semantic Bible-category colors, and a reader-first paper surface for Scripture.

Canonical Shelf is a **single-document, public-first SPA**. `public/index.html` is the sole application document for Home, Course, Bible, Topics, Practice, and Search. Clean path-based URLs are preserved with the History API; ordinary internal navigation renders the next destination without replacing the browser document, while direct entry and refresh resolve to the same shell through the local/Cloudflare SPA fallback.

The `/public` directory is the authoritative source for runtime logic and assets. Legacy source files from `/src` have been moved to `.src-archived`. Course, Unit, Home, and Progress views use native HTML `<template>` elements from the canonical shell and populate them through DOM operations. Other bounded views may continue to return strings while they remain behaviorally correct. Key orchestration logic is modularized into standalone engines such as `public/search-engine.js` and `public/theologian-engine.js`.

The architecture intentionally excludes generated top-level route documents, broad MutationObserver repair, duplicate top-level renderers, `locked-*` post-render patches, `public/library-system.js`, and `public/library-system-refinements.css`.

Current architecture SSOT: [`docs/v7/SPA_ARCHITECTURE_2026-09-24.md`](docs/v7/SPA_ARCHITECTURE_2026-09-24.md).

## Theologian

Theologian is Canonical Shelf's conversational biblical/theological study assistant.

Response paths:

1. **Cloudflare Workers AI synthesis** when available.
2. **Deterministic evidence-aware fallback** when cloud inference is unavailable or rejected.
3. **Deterministic crisis safety response** before ordinary AI generation when credible first-person suicide/self-harm indicators appear.

The Statement of Faith is Theologian’s governing doctrinal stance. It may fairly explain competing interpretations and conflicting evidence without adopting them as its own stance or pressuring learner agreement.

The model can reason from broader knowledge; site content is a reference resource, not an exclusive knowledge base. Exact Scripture quotations use the bundled BSB, and questions about the interface use actual site facts. Reply length follows the conversation rather than a fixed word target. Follow-ups retain relevant context, and feedback about a mistaken answer should prompt correction rather than a theological keyword search.

Canonical theology files:

```text
public/data/statement-of-faith.md
content/statement/statement-of-faith-v3.md  # server-only source; not a public asset
public/data/theology-policy.json
public/data/theology-sources.json
```

The supplemental belief source compiles to `worker/generated/belief-context.ts` and remains lower authority than the compact Statement of Faith.

### Learner agency

**Learner agency is a hard requirement. The learner remains the decision-maker.** Theologian informs, compares, contextualizes, challenges reasoning, distinguishes text/evidence/interpretation/reception/doctrine/application, surfaces material translation/viewpoint differences, labels Canonical Shelf's own position, and does not pressure agreement where an issue is genuinely contested.

### Conversation privacy

The active Theologian transcript may persist locally in the browser until **New chat** or browser-data clearing. Normal cloud requests may include the current question, bounded recent conversation, route/activity, and allowlisted aggregate study-state context.

Journal text, lesson notes, optional reflections, profile/account identifiers, feedback content, and inferred beliefs/identity are excluded. Ordinary chat is not persisted server-side merely because it is sent for inference.

## Response review and feedback

A Theologian answer can be flagged for review or challenged with another interpretation. A submitted review stores only bounded relevant context. Journal/private reflections, unrelated chat history, inferred beliefs, and account/profile data are not automatically attached.

Feedback follows an **accept-and-normalize** rule: unknown/custom categories and reasons, blank explanations, and short explanations remain valid submissions rather than being rejected by a taxonomy.

Anonymous users can receive reviewer responses without providing identity. A browser-scoped identifier is transformed into a one-way routing key for persistence; IP address is not used as feedback identity. The learner can forget the browser link.

## Crisis / pastoral safety

The deterministic crisis layer precedes normal Workers AI generation. Credible risk can route the learner to emergency care and U.S. 988 support while remaining conversational, encouraging nearby trusted human help, and allowing pastoral support or prayer without substituting them for urgent safety action.

The policy is internal: the Worker reads it from `content/` at build time and it is never published. Learners get the crisis response itself and the 988/911 line on About (`/about.html#help`).

## Privacy / policy surfaces

Public policy surfaces:

- `/privacy.html` — Privacy Policy
- `/data-retention.html` — Data Retention Policy
- `/storage.html` — Cookies & Local Storage
- `/terms.html` — Terms of Use

Current posture includes local-first guest use, optional account/passkey sync, no personal-data sale, no targeted advertising, and no advertising pixels or behavioral analytics trackers.

## Learner corpus / `llms.txt`

`content/learner-content-reachability.json` owns learner-facing UI paths and `llms.txt` disposition.

`public/llms.txt` is generated. It represents substantive learner-facing curriculum/reference/editorial/legal/privacy/safety content while linking the full BSB corpus rather than duplicating it. Supplemental long-form belief context is excluded as a standalone public authority, and private learner/account/feedback records, secrets, tests, plans, and implementation/governance material are excluded.

## Deterministic generation

Canonical inputs include:

```text
public/data/
public/index.html
```

Generated/published outputs include the current catalog, curriculum reference, theology data, BSB corpus, `llms.txt`, the account client bundle, and modular runtime engines (`public/search-engine.js`, `public/theologian-engine.js`). Top-level route HTML documents are not generated; `public/index.html` is the sole application shell.

## Development / verification

Requirement: **Bun 1.2.15** is the CI reference version.

```bash
bun install --frozen-lockfile
bunx playwright install chromium
bun run verify
```

`bun run verify` is the single repository merge/release gate. It performs current generation/build, immutable BSB integrity, a small grouped product/template contract, behavior-level assessment/state/sync/feedback/Theologian/crisis tests, and a small Chromium browser smoke for core routes, utilities, responsive overflow, and serious/critical automated accessibility failures.

Verification intentionally does **not** freeze exact copy, source line numbers, CSS values, theme names, styling classes, historical layouts/screenshots, evolving curriculum counts, internal table names, prompt wording, hash lengths, clipping thresholds, or other replaceable implementation details.

See [`docs/VERIFICATION_CONTRACT.md`](docs/VERIFICATION_CONTRACT.md) for the durable testing rules.

Cloudflare configuration validation and live post-deployment verification are separate infrastructure contracts. Human visual/accessibility/editorial/novice review remains separate from automated verification.

## Production

Canonical production URL:

```text
https://the-canonical-shelf.christopherwonder.workers.dev
```

Worker: `the-canonical-shelf`  
D1: `canonical-shelf`

A production release runs the durable verification gate, validates the exact Cloudflare configuration, applies D1 migrations, deploys the canonical Worker/assets, and then verifies the live release/bindings/routes/policy resources/offline behavior/Theologian. Deployment is separate from ordinary development verification.

## Governance

Current release authority:

- **#24** — sole active release/convergence PR until merged.
- **#20** — superseded independent merge candidate.
- **#22** — superseded implementation; desired behavior preserved without its repair architecture.
- **#23** — superseded independent merge candidate; learner-corpus behavior absorbed through current generation/reachability.

Current project instructions: `AI_INSTRUCTIONS.md`  
Verification authority: `docs/VERIFICATION_CONTRACT.md`  
Decision history: `docs/v7/DECISION_PRECEDENCE.md`

<!-- roa:begin roa-readme — GENERATED, do not edit inside this block -->
## At a glance

A guided Bible-learning library: full BSB reader, questions-first courses, topics, practice, and a grounded Theologian.

- **Purpose:** Help adults read and understand the Bible in context without being overwhelmed, by pairing a full reader with a map, guided courses, and a Theologian that answers from the passage in front of them.
- **For:** Primary: a graduate-level adult who recently came to faith and is anxious about navigating Scripture; Casual adult learners; Existing Christians and Bible-study groups
- **Status:** active · current phase **Slice 3: learning hierarchy and lesson card density with redesigned checks**
- **Stack:** node, bun 1.2.15, bun@1.2.15 · CSS, HTML, JavaScript, PowerShell, SQL, TypeScript
- **repository:** https://github.com/TopherLoring/canonical-shelf
- **production:** https://the-canonical-shelf.christopherwonder.workers.dev

## Commands

| Command | Runs |
|---|---|
| `migrate` | `bun scripts/migrate-vendored.mjs && bun scripts/postprocess-v6.mjs && bun scripts/publish-theology.mjs && bun scripts/apply-curriculum-metadata.mjs` |
| `generate:auth-migration` | `bun scripts/generate-auth-migration.mjs` |
| `generate:wrangler` | `bun scripts/write-wrangler.mjs` |
| `generate:curriculum-reference` | `bun scripts/generate-curriculum-reference.mjs` |
| `generate:llms` | `bun scripts/generate-llms.mjs` |
| `prepare:content` | `bun run migrate && bun scripts/publish-bsb-annotations.mjs && bun run compile:pathway && bun run data:crossref && bun run generate:curriculum-reference && bun run generate:llms` |
| `verify:bsb` | `bun scripts/bsb-integrity.mjs` |
| `verify:contract` | `bun scripts/verify-product-contract.mjs` |
| `verify:deployment` | `bun scripts/verify-deployment.mjs` |
| `validate:cloudflare` | `bun scripts/validate-cloudflare-config.mjs` |
| `test:assessment` | `bun scripts/test-assessment.mjs` |
| `test:sync` | `bun scripts/test-sync.mjs` |
| `test:d1` | `bun scripts/test-d1-sync.mjs` |
| `test:feedback` | `bun scripts/test-feedback.mjs` |
| `test:theologian` | `bun scripts/test-theologian-cloud.mjs && bun scripts/test-theologian-crisis.mjs` |
| `test:core` | `bun run test:assessment && bun run test:sync && bun run test:d1 && bun run test:feedback && bun run test:theologian` |
| `test:browser` | `playwright test` |
| `test:redesign` | `playwright test tests/redesign` |
| `test` | `bun run test:core && bun run test:browser` |
| `build:client` | `mkdir -p public/generated && bun build public/account-client.ts --outfile=public/generated/account.js --target=browser --minify && bun run sw:stamp` |
| `build:worker` | `bun build worker/index.ts --outdir=.tmp/canonical-shelf-worker --target=browser` |
| `build:runtime` | `bun run build:client && bun run generate:auth-migration && bun build public/bootstrap.js --outdir=.tmp/canonical-shelf-browser --target=browser && bun run build:worker` |
| `build:app` | `bun run prepare:content && bun run build:runtime` |
| `build` | `bun run build:app` |
| `verify` | `bun run build:app && bun run verify:bsb && bun run verify:contract && bun run verify:sw && bun run test:core && bun run test:browser` |
| `serve` | `bun run prepare:content && bun run build:client && bun scripts/serve.mjs` |
| `dev` | `bun run prepare:content && bun run build:client && bun run generate:wrangler && bun run db:migrate:local && wrangler dev` |
| `deploy` | `bun run verify && bun run generate:wrangler && bun run validate:cloudflare && wrangler d1 migrations apply canonical-shelf --remote && wrangler deploy && bun run verify:deployment` |
| `db:migrate:local` | `bun run generate:auth-migration && wrangler d1 migrations apply canonical-shelf --local` |
| `db:migrate:remote` | `bun run generate:auth-migration && wrangler d1 migrations apply canonical-shelf --remote` |
| `data:ingest:bsb` | `bun scripts/ingest-bsb-tsv.mjs` |
| `data:crossref` | `bun scripts/build-crossrefs.mjs` |
| `data:convert:concordance` | `bun scripts/convert-concordance.mjs` |
| `data:generate:apparatus` | `bun scripts/generate-exegetical-apparatus.mjs` |
| `prepare` | `git config core.hooksPath .githooks \|\| true` |
| `roa` | `node .roa-kit/roa.mjs` |
| `roa:verify` | `node .roa-kit/roa.mjs verify` |
| `data:fetch` | `bun scripts/fetch-bsb-sources.mjs` |
| `data:build:bsb` | `bun scripts/build-bsb-json.mjs` |
| `compile:pathway` | `bun scripts/compile-pathway.mjs` |
| `fonts:fetch` | `bun scripts/fetch-fonts.mjs` |
| `sw:stamp` | `bun scripts/stamp-sw.mjs` |
| `verify:sw` | `bun scripts/stamp-sw.mjs --check` |

## Repository map

- `public/highlights.js` — Persisted learner highlights, saved and synced with personal study state
- `public/ui/screens/reader.js` — Redesigned Bible reader: Scripture apparatus, selection, notes, highlights, and study panels
- `public/ui/legacy.css` — Pre-redesign stylesheets in the legacy cascade layer
- `public/` — The SPA: index.html shell, feature modules, CSS, service worker, generated data under public/data/
- `content/` — Authored curriculum, topics, theology policy, statement of faith, and vendored data (content/vendor/)
- `worker/` — Cloudflare Worker: auth, sync, Theologian, feedback APIs
- `scripts/` — Build, data, generation, and verification scripts
- `tests/` — Playwright browser tests
- `docs/` — Architecture, verification contract, and historical plans (docs/v7/*-graph.json are provenance only)
- `.src-archived/` — Archived earlier source; reference only, not built
- `.roa/` — Project records and generated state (project-roa-kit)
- `.roa-kit/` — Vendored project-roa-kit

Project status: [docs/STATUS.md](docs/STATUS.md) · Decisions: [docs/v7/DECISION_PRECEDENCE.md](docs/v7/DECISION_PRECEDENCE.md) · Changes: [CHANGELOG.md](CHANGELOG.md)
<!-- roa:end roa-readme -->
