# The Canonical Shelf

**Canonical Shelf** is an offline-capable Bible-literacy, Scripture-reading, Christian-study, and reference application for adult learners. It teaches the Bible as a library, develops durable biblical knowledge and interpretive reasoning, makes evidence/limits visible, presents Christian disagreement responsibly, and supports independent investigation rather than permanent dependence on lessons.

> **Release status:** PR #24 is the sole active convergence/release candidate and remains draft until executable current-head validation succeeds. Automated checks do not replace physical-device, manual-accessibility, editorial/theological, or novice-usability review.

## Product model

Primary destinations:

1. **Home** — orientation, progress, recommendations, continuation.
2. **Course** — six-course guided curriculum and scored learning.
3. **Bible** — 66-book shelf, book profiles, chapters, BSB reader, Bible-specific context.
4. **Topics** — curated reference outside completion.
5. **Practice** — retrieval, spaced review, mastery reinforcement, and learning games; not a second curriculum.

Supporting capabilities include Search, Progress, optional Account/Profile sync, appearance themes, Journal, **Feedback & reviews**, and **Theologian**.

## Current learning contract

- 6 courses
- 44 scored units
- 117 guided lessons
- 119 mastery/capstone activities
- 236 scored activities
- 45 Topics outside completion
- inherited stable lesson/mastery IDs
- review cadence **1 → 3 → 7 → 14 → 30 → 60 days**

Historical 25-unit / 70-lesson / 69-mastery / 139-activity values are migration baselines only.

Canonical Shelf uses a **questions-first spiral**: difficult doctrinal and interpretive questions are introduced early, revisited where evidence naturally appears, investigated with better interpretive tools, and synthesized later. Assessment evaluates understanding/reasoning, never theological assent.

## Library First architecture

The default/reference experience uses charcoal shared chrome, light/ivory reading surfaces, restrained cool-neutral structure, sparse gilt, serif editorial content, and sans UI. Alternate themes remain supported.

Home, Course, Bible, Topics, Practice, and Search use **route-owned generated HTML documents**. Cross-destination navigation uses normal document navigation; bounded same-route detail changes may use History API enhancement.

The current architecture intentionally excludes broad MutationObserver repair, duplicate top-level renderers, `locked-*` post-render patches, `public/library-system.js`, and `public/library-system-refinements.css`.

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

Approved principle:

> **Learner agency is a hard requirement. The learner remains the decision-maker.**

Theologian informs, compares, contextualizes, challenges reasoning, distinguishes text/evidence/interpretation/reception/doctrine/application, surfaces material translation/viewpoint differences, labels Canonical Shelf's own position, and does not pressure agreement where an issue is genuinely contested.

The approved interpretive foundation gives serious attention to the biblical claims that God is love, salvation is grounded in grace rather than human merit, and Jesus identifies love of God and love of neighbor as the greatest commandments through which the rest of the law is understood. Disputed salvation mechanics/scope/conditions remain distinct rather than falsely settled.

### Conversation privacy

The active Theologian transcript may persist locally in the browser until **New chat** or browser-data clearing. Normal cloud requests may include the current question, bounded recent conversation, route/activity, and allowlisted aggregate study-state context.

Journal text, lesson notes, optional reflections, profile/account identifiers, feedback content, and inferred beliefs/identity are excluded. Ordinary chat is not persisted server-side merely because it is sent for inference.

## Response review and feedback

Every Theologian answer can be:

- **Flagged for review**;
- **Disagreed with / offered another interpretation**.

A submitted review stores only bounded relevant context: preceding question, exact answer, visible evidence metadata, route, mode/model, policy version, validation status, optional reason, and optional learner explanation. Journal/private reflections, unrelated chat history, inferred beliefs, and account/profile data are not automatically attached.

Feedback follows an **accept-and-normalize** rule: unknown/custom categories and reasons, blank explanations, and short explanations remain valid submissions rather than being rejected by a taxonomy.

### Anonymous reply routing

Anonymous users can receive reviewer responses without providing identity:

- browser creates a random high-entropy feedback identifier;
- reusable token remains in that browser;
- server stores only its SHA-256 routing key;
- IP address is not used as the feedback identity;
- the same browser can retrieve reviewer responses through **Feedback & review replies**;
- the learner can **Forget this browser's feedback link** at any time.

Authenticated feedback can also be associated with the account. Account deletion de-identifies retained feedback by clearing its account `user_id`.

Operational reviewer responses use `/api/admin/feedback/respond` protected by the `FEEDBACK_ADMIN_TOKEN` secret. Never commit that secret.

## Crisis / pastoral safety

The deterministic crisis layer precedes normal Workers AI generation.

For credible risk it can:

- direct immediate attempts, serious injury, overdose, or immediate danger to **911/local emergency services/emergency care**;
- prominently offer **call or text 988** for U.S. suicide/self-harm/behavioral-health crisis support;
- encourage another trusted person to be physically present and distance from means when relevant;
- remain conversational and ask directly about immediate safety.

Pastoral care remains part of the response. Theologian may affirm that doubt, depression, despair, suicidal thoughts, and self-harm do not place the learner beyond God's love, grace, presence, or power; encourage prayer and asking God for comfort/healing/courage/hope/strength/perseverance; recommend trusted clergy/shared-faith support; and pray with the learner when requested.

Prayer never replaces urgent human help. After prayer, Theologian returns to the safety check. Shame, hell/divine-punishment threats, weak-faith framing, prayer-only treatment, guaranteed healing, silent third-party dispatch, IP-based crisis identity, and permanent crisis diagnoses/risk labels are prohibited.

Public disclosure: [`/safety.html`](/safety.html).

## Privacy / retention / Terms

Public policy surfaces:

- [`/privacy.html`](/privacy.html) — Privacy Policy
- [`/data-retention.html`](/data-retention.html) — Data Retention Policy
- [`/storage.html`](/storage.html) — Cookies & Local Storage
- [`/terms.html`](/terms.html) — Terms of Use
- [`/safety.html`](/safety.html) — Theologian Safety

Current posture:

- guest/offline use first-class;
- optional Better Auth/passkey account sync;
- no personal-data sale;
- no targeted advertising;
- no advertising pixels or behavioral analytics trackers;
- necessary first-party authentication/security cookies plus functional local browser storage;
- no generic “accept all cookies” banner while no optional tracking exists.

Feedback retention is enforced in D1:

- unresolved/open: up to 24 months;
- responded/resolved: up to 12 months after response/resolution;
- optional contact info: remove/anonymize within 90 days after response/resolution absent a documented exception.

## Learner corpus / `llms.txt`

`content/learner-content-reachability.json` v3 is the authority for learner-facing UI paths and `llms.txt` disposition.

`public/llms.txt` is generated/freshness-validated and embeds substantive learner-facing curriculum/reference/editorial/legal/privacy/safety content. The full BSB corpus is linked rather than duplicated verbatim. Supplemental long-form belief context is excluded as a standalone public authority. Private learner/account/feedback records, secrets, tests, plans, and implementation/governance material are excluded.

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

Generated/published outputs include:

```text
public/data/catalog.json
public/data/curriculum.md
public/data/statement-of-faith.md
public/data/theologian-belief-context.md
public/data/theology-policy.json
public/data/theologian-crisis-policy.json
public/data/theology-sources.json
public/data/corpus.txt
public/llms.txt
public/home.html
public/course.html
public/bible.html
public/topics.html
public/practice.html
public/search.html
wrangler.jsonc
```

## Development / verification

Requirement: **Bun 1.2.15**

```bash
bun install --frozen-lockfile
bun run verify
bun run verify:full
bun run validate:native-rendering
bun run validate:pr22-supersession
bun run validate:supersession
bun run validate:release-governance
bun run validate:llms
bun run validate:reachability
bun run test:feedback
bun run test:theologian
```

`verify` is the prelaunch code/state gate. `verify:full` adds deeper assessment and cross-browser E2E/accessibility release validation.

## Production

Canonical production URL:

```text
https://the-canonical-shelf.christopherwonder.workers.dev
```

Worker: `the-canonical-shelf`  
D1: `canonical-shelf`

Required operational values include Cloudflare credentials, D1 database ID, Better Auth configuration, and `FEEDBACK_ADMIN_TOKEN` for reviewer-response administration. Secrets must not be committed.

A production release must run verification, generate/validate the exact Cloudflare configuration, apply D1 migrations, deploy the canonical Worker/assets, verify `/api/health`, smoke-test route-owned documents and public policy resources, verify generated learner/theology content, and prove a real `/api/theologian` cloud response with substantive answer/evidence/guardrail validation.

## Governance

Current release authority:

- **#24** — sole active release/convergence PR.
- **#20** — superseded independent merge candidate.
- **#22** — superseded implementation; native desired behavior preserved, repair architecture rejected.
- **#23** — superseded independent merge candidate; learner-corpus behavior absorbed through reachability/generation.

See:

```text
AI_INSTRUCTIONS.md
docs/v7/DECISION_PRECEDENCE.md
docs/v7/CONVERGENCE_SUPERSESSION_2026-09-22.md
docs/v7/CONTENT_REACHABILITY_AND_THEOLOGIAN_AUTHORITY_2026-09-22.md
docs/v7/DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md
```
