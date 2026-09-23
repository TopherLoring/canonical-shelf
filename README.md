# The Canonical Shelf

**Canonical Shelf** is an offline-capable Bible-literacy, Scripture-reading, Christian-study, and reference application for adult learners. It teaches the Bible as a library, develops durable biblical knowledge and interpretive reasoning, makes evidence/limits visible, presents Christian disagreement responsibly, and supports independent investigation rather than permanent dependence on lessons.

> **Release status:** PR #24 is the sole active convergence/release candidate and remains draft until the current head passes `bun run verify` and the applicable human visual, accessibility, editorial/theological, and novice-usability gates. A GitHub Actions job that receives no runner and executes zero steps is infrastructure failure, not validation evidence.

## Product model

Primary destinations:

1. **Home** — shelf-first orientation, continuation, and routes into the rest of the product.
2. **Course** — six-course guided curriculum and scored learning.
3. **Bible** — 66-book shelf, book profiles, chapters, BSB reader, and Bible-specific context.
4. **Topics** — curated reference and question-driven investigation outside completion.
5. **Practice** — retrieval, spaced review, mastery reinforcement, and learning games; not a second curriculum.

Supporting capabilities include Search, Progress, optional Account/Profile sync, appearance themes, Journal, **Feedback & reviews**, and **Theologian**.

## Learning model

Canonical Shelf uses a **questions-first spiral**: difficult doctrinal and interpretive questions are introduced early, revisited where evidence naturally appears, investigated with better interpretive tools, and synthesized later. Assessment evaluates understanding and reasoning, never theological assent.

Current generated curriculum counts are descriptive runtime data and may evolve. They are not long-term verification constants. Stable activity identity, deterministic scoring for completion-bearing work, learner-state preservation, spaced review behavior, and separation of reflection from scored completion are durable contracts.

## Experience / architecture

`public/canonical-shelf.css` is the shared visual-system authority. Feature CSS may own feature-specific composition but should not create a competing destination-wide design system.

The current selected direction uses scholarly typography, bookish geometry, graphite/chrome structure, bright gilt as a signal, semantic Bible-category colors, and a reader-first paper surface for Scripture.

Home, Course, Bible, Topics, Practice, and Search use **route-owned generated HTML documents**. Cross-destination navigation uses normal document navigation; bounded same-route detail changes may use History API enhancement.

The architecture intentionally excludes broad MutationObserver repair, duplicate top-level renderers, `locked-*` post-render patches, `public/library-system.js`, and `public/library-system-refinements.css`.

## Theologian

Theologian is Canonical Shelf's conversational biblical/theological study assistant.

Response paths:

1. **Cloudflare Workers AI synthesis** when available.
2. **Deterministic evidence-aware fallback** when cloud inference is unavailable or rejected.
3. **Deterministic crisis safety response** before ordinary AI generation when credible first-person suicide/self-harm indicators appear.

Authority order:

1. bundled Berean Standard Bible for Scripture text/quotation;
2. current Course/Topics/glossary/Bible/reference content;
3. compact Statement of Faith as Canonical Shelf doctrinal ceiling;
4. supplemental long-form belief context as lower-authority Theologian context;
5. theology policy + vetted scholarship/traditions as attributed evidence.

Canonical theology files:

```text
content/statement/statement-of-faith-compact.md
content/statement/statement-of-faith-v3.md
content/theology/policy.json
content/theology/crisis-policy.json
content/theology/sources.json
```

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

Public disclosure: `/safety.html`.

## Privacy / policy surfaces

Public policy surfaces:

- `/privacy.html` — Privacy Policy
- `/data-retention.html` — Data Retention Policy
- `/storage.html` — Cookies & Local Storage
- `/terms.html` — Terms of Use
- `/safety.html` — Theologian Safety

Current posture includes local-first guest use, optional account/passkey sync, no personal-data sale, no targeted advertising, and no advertising pixels or behavioral analytics trackers.

## Learner corpus / `llms.txt`

`content/learner-content-reachability.json` owns learner-facing UI paths and `llms.txt` disposition.

`public/llms.txt` is generated. It represents substantive learner-facing curriculum/reference/editorial/legal/privacy/safety content while linking the full BSB corpus rather than duplicating it. Supplemental long-form belief context is excluded as a standalone public authority, and private learner/account/feedback records, secrets, tests, plans, and implementation/governance material are excluded.

## Deterministic generation

Canonical inputs include:

```text
content/curriculum/
content/statement/
content/theology/
content/learner-content-reachability.json
content/vendor/legacy/
public/index.html
```

Generated/published outputs include route-owned documents and the current catalog, curriculum reference, theology data, BSB corpus, and `llms.txt`.

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
