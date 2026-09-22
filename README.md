# The Canonical Shelf

**Canonical Shelf** is a self-paced Bible-literacy, Scripture-reading, and Christian-study application for adult learners. It teaches the Bible as a library, builds durable biblical knowledge, makes interpretive evidence visible, presents Christian disagreement responsibly, and develops the learner toward independent investigation rather than permanent dependence on lessons.

> **Release status:** PR #24 is the active release candidate. Automated verification is a release gate, not a substitute for editorial/theological, novice-usability, physical-device, or manual-accessibility review.

## Current product model

The five primary destinations are:

1. **Home** — orientation, progress, current context, and continuation.
2. **Course** — six-course guided curriculum and scored learning activities.
3. **Bible** — 66-book bookshelf, book profiles, chapters, Scripture reader, search, and Bible-specific study context.
4. **Topics** — curated reference material outside course completion.
5. **Practice** — retrieval, spaced review, mastery reinforcement, games, and related practice modes; not a second curriculum.

Supporting capabilities include Search, Progress, optional Account/Profile sync, appearance themes, Feedback, Journal, and the **Theologian**.

## Curriculum

Canonical Shelf uses a **questions-first spiral**. Difficult doctrinal and interpretive questions are introduced early enough to motivate adult learners, revisited where their biblical/historical evidence naturally appears, investigated with stronger interpretive tools, and synthesized later. The curriculum does not force confidence before the learner has sufficient context to evaluate a claim responsibly.

Current runtime contract:

- **6 courses**
- **44 scored units**
- **117 guided lessons**
- **119 mastery/capstone activities**
- **236 scored activities**
- **12 recurring difficult-question/doctrinal threads**
- **45 curated Topics** outside completion
- replayable non-scored Orientation
- inherited stable lesson/mastery IDs preserved
- spaced review cadence **1 → 3 → 7 → 14 → 30 → 60 days**

Courses:

1. **Bible & Christianity: Foundations** — estimated active first pass 6–8 hours.
2. **Israel: Exodus, Covenant, Temple & Prophetic Hope** — 7–10 hours.
3. **From Exile to Jesus: The Second Temple World** — 5–7 hours.
4. **Jesus, the Gospels & the Early Church** — 7–10 hours.
5. **How We Know: Interpretation & Evidence** — 6–9 hours.
6. **Christian Theology, Traditions & Synthesis** — 6–9 hours.

Historical 25-unit / 70-lesson / 69-mastery / 139-activity values are migration baselines only.

## Learning architecture

Guided learning is progressive and interactive rather than a collection of lecture pages. Scene roles may include:

**Orient → Prepare → Read → Explain → Visualize → Compare → Context → Practice → Retention → Reflect → Continue**

Assessment may use ordering, matching, classification, evidence selection, reconstruction, scenarios, argument mapping, comparison, interpretation distinctions, free reasoning, reflection, and synthesis. Scored work evaluates understanding/reasoning rather than theological assent.

### Study Focus

Lessons/mastery enter **Study Focus**, which uses:

- human-facing Course / Unit / lesson identity;
- a thin vertical dot progress rail;
- a light editorial reading/interaction surface;
- attached dark **Session Notes**;
- contextual vocabulary, passage, evidence, deeper-study, interpretive-limit, and source drawers;
- Journal and Feedback actions;
- deliberate-open contextual Theologian;
- responsive recomposition across desktop/tablet/phone.

Technical activity identifiers remain internal.

## Bible, Topics, and Practice

**Bible** owns the proportional category-colored 66-book shelf, book profiles, chapters, reader, search, and Bible-specific context. The default reader uses a light reading surface with attached charcoal **Book Notes**. The bundled **Berean Standard Bible (BSB)** corpus remains available offline at `public/data/corpus.txt` and is the canonical Scripture quotation source for the Theologian.

**Topics** is authored reference outside course completion. Topic reading uses a light reference surface with attached charcoal contextual notes. The glossary is discoverable through Topics/Search.

**Practice** reinforces learned material through spaced review, mastery, games, interpretation/themes/verse-library modes, ranks/achievements, and related reinforcement. Practice remains **challenge → feedback → state change → next challenge** rather than a second curriculum.

## Visual system

The approved default/reference theme is the editable flat library system documented in `docs/v7/LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md`:

- charcoal shared chrome (`#24272d`, `#31353c`);
- white/ivory primary reading surfaces;
- restrained cool-neutral structure;
- sparse antique gilt (`#c7a253`);
- serif editorial/content typography, sans interface typography;
- no decorative gradients in the reference theme;
- no generic SaaS dashboard treatment or oversized billboard headings.

Alternate themes such as Heritage, Oxblood, Illuminated Jewel, Slate & Linen, and Bookshelf Spectrum remain selectable. Themes affect presentation, not curriculum meaning, progress, assessment, or theology.

## Journal and Feedback

Journal writing is private, persistent, unscored learner-owned content tied to the material being studied. Learner-facing copy uses human context rather than technical activity IDs.

Feedback remains globally reachable. Route/activity/build context may be attached internally. Submitted feedback is not a learner-facing content library unless explicitly changed later.

## Theologian

The learner-facing assistant is **Theologian**. Historical `guide-*` identifiers may remain internally only where changing them would create needless compatibility risk.

Two response paths coexist:

1. **Cloudflare Workers AI conversational synthesis** — primary when available.
2. **Deterministic evidence-aware fallback** — always retained for offline/cloud-failure/rejected-output conditions.

No model weights are downloaded to the learner's device.

### Authority order

1. **Berean Standard Bible** — canonical Scripture text/quotation source.
2. **Current Canonical Shelf content** — Course, Topics, glossary, Bible/book/reference content.
3. **Compact Statement of Faith** — doctrinal ceiling for claims labeled as Canonical Shelf doctrine.
4. **Supplemental long-form belief context** — lower-authority elaboration for the Theologian only.
5. **Theology policy + vetted research** — evidence labels, interpretive boundaries, translation differences, source metadata, and documented competing interpretations.

Canonical files:

```text
content/statement/statement-of-faith-compact.md     public doctrinal ceiling
content/statement/statement-of-faith-v3.md          supplemental Theologian context only
content/theology/policy.json                        interpretation/agency/evidence policy
content/theology/sources.json                       vetted source catalog
```

The compact Statement of Faith is published to `public/data/statement-of-faith.md` and rendered under **About → Statement of Faith**. Learners are not required to agree with it to use Canonical Shelf.

### Interpretive foundation and learner agency

The Theologian is required to interpret with serious attention to the biblical claims that **God is love**, salvation is grounded in **grace rather than human merit**, and Jesus identifies **love of God and love of neighbor** as the greatest commandments through which the rest of the law is understood. Where Christians differ over the conditions, scope, or mechanics of salvation, those interpretations must be presented distinctly rather than treated as settled.

The learner is the decision-maker. The Theologian:

- presents materially different credible viewpoints when beliefs, interpretation, manuscripts, lexical claims, or translations differ;
- explains why they differ and what evidence each relies on;
- labels Canonical Shelf's position as Canonical Shelf's position;
- never makes agreement a condition of learning or receiving an answer;
- allows the learner to challenge Canonical Shelf and compare alternatives/traditions;
- preserves evidence-strength distinctions and avoids false balance.

Canonical Shelf's stated LGBTQ position is affirming while the evidence layer accurately represents serious non-affirming readings and contested lexical/historical claims. The runtime rejects overstatements such as claiming Romans 1 refers only to exploitation/pederasty or assigning one certain modern equivalent to rare ancient terms.

### Conversation privacy/state

The current Theologian chat is locally persistent in the browser so the active conversation remains visible across ordinary route changes/reloads until the learner starts a **New chat** or clears local browser storage.

Canonical Shelf does **not** persist Theologian conversation text to D1, KV, Durable Objects, account sync, Journal, Feedback, or analytics.

A cloud request may include the current question, a bounded recent conversation excerpt, current learner-facing route/activity context, and an allowlisted study-state summary such as aggregate completion/review-due/recent-study context. Journal text, lesson notes, reflection writing, profile/account identifiers, feedback content, and inferred theological beliefs are excluded. Study-state context is not theological evidence.

See `docs/v7/CONTENT_REACHABILITY_AND_THEOLOGIAN_AUTHORITY_2026-09-22.md`.

## Learner content and `llms.txt`

`content/learner-content-reachability.json` is the machine-readable contract for learner-facing content and each content family's `llms.txt` disposition.

`public/llms.txt` is generated/freshness-validated and contains the complete learner-facing curriculum/reference/editorial corpus intended for machine discovery, with these boundaries:

- learner-facing content marked `embed` is included;
- the complete BSB corpus is linked rather than duplicated verbatim;
- the supplemental long-form belief document is excluded as a standalone learner authority;
- private learner/account/feedback data, implementation plans, tests, CI/configuration, and secrets are excluded.

PR #23's intended learner-corpus behavior has been selectively absorbed into PR #24. The #23 generated snapshot is not an independent source of truth.

## Browser architecture

Top-level Home, Course, Bible, Topics, Practice, and Search use **route-owned generated HTML documents**.

- `public/index.html` is the shared shell/root compatibility source.
- `scripts/generate-route-documents.mjs` creates `public/home.html`, `course.html`, `bible.html`, `topics.html`, `practice.html`, and `search.html`.
- Navigation between different destinations uses normal browser document navigation.
- Query/detail changes inside the same destination may use bounded History API enhancement.
- The service worker caches route-specific documents and maps offline navigation to the matching route document.

The architecture intentionally does **not** use whole-body/broad-subtree MutationObserver repair, duplicate top-level renderers competing for `#main`, `locked-*` post-render patches, `library-system.js` repair runtime, or `library-system-refinements.css` corrective layers.

## Cloudflare architecture

Production uses Cloudflare Workers Static Assets + Worker + D1 + Workers AI:

- clean static route handling with `html_handling: auto-trailing-slash`;
- Better Auth/passkeys and optional D1 sync/backup;
- Workers AI for Theologian synthesis;
- `/api/health` release/binding identity;
- canonical Worker target `the-canonical-shelf`.

Learner state is local-first. Guest/offline use remains first-class; optional accounts are additive rather than prerequisites.

## Deterministic generation

Canonical inputs include:

```text
content/curriculum/
content/statement/statement-of-faith-compact.md
content/statement/statement-of-faith-v3.md
content/theology/policy.json
content/theology/sources.json
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

Generated outputs are not independent hand-maintained authorities.

## Development

Requirements: **Bun 1.2.15**

```bash
bun install --frozen-lockfile
bun run build
bun run verify
bun run verify:full
bun run validate:curriculum-spiral
bun run validate:native-rendering
bun run validate:pr22-supersession
bun run validate:supersession
bun run test:theologian
bun run generate:llms
bun run generate:routes
bun run generate:wrangler
bun run validate:cloudflare
bun run serve
bun run test:e2e
```

`bun run verify` is the prelaunch code/state gate. `bun run verify:full` adds deeper assessment and cross-browser E2E/accessibility release validation.

## Production deployment

Canonical production URL:

```text
https://the-canonical-shelf.christopherwonder.workers.dev
```

Worker: `the-canonical-shelf`  
D1 database: `canonical-shelf`

Required values:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
D1_DATABASE_ID
BETTER_AUTH_URL
BETTER_AUTH_SECRET
```

Production configuration is generated from `scripts/write-wrangler.mjs`.

A production release must:

1. run prelaunch verification;
2. generate/validate exact Cloudflare configuration;
3. apply D1 migrations;
4. deploy the exact canonical Worker/static assets;
5. verify `/api/health` release SHA and required bindings;
6. smoke-test `/`, `/home`, `/course`, `/bible`, `/topics`, `/practice`, and `/search` with route-ownership markers;
7. verify generated learner/theology content;
8. prove a real `/api/theologian` cloud inference with a substantive answer, non-empty evidence, BSB guardrail, and passed validation.

See `docs/v7/DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md`.

## Current convergence and governance

Current authority order:

1. latest explicit owner decision;
2. `AI_INSTRUCTIONS.md`;
3. `docs/v7/DECISION_PRECEDENCE.md`;
4. current domain authority docs/source contracts;
5. generated artifacts;
6. historical plans/audits as provenance only.

PR state for this release:

- **#24** — sole active convergence/release PR.
- **#20** — superseded as an independent merge candidate; questions-first curriculum is already represented through merged #21/main and #24.
- **#22** — superseded implementation; desired behavior is preserved natively in #24, old repair architecture rejected.
- **#23** — superseded as an independent merge candidate; learner-corpus behavior selectively absorbed into #24.

Key current docs:

```text
AI_INSTRUCTIONS.md
docs/v7/DECISION_PRECEDENCE.md
docs/v7/LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md
docs/v7/CONTENT_REACHABILITY_AND_THEOLOGIAN_AUTHORITY_2026-09-22.md
docs/v7/PLAN_NATIVE_DOCUMENT_RENDERING_2026-09-22.md
docs/v7/CONVERGENCE_SUPERSESSION_2026-09-22.md
docs/v7/DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md
docs/v7/DOCUMENTATION_AUDIT_2026-09-21.md
```

Historical v5/v6, restoration, completed delta, and superseded PR documents remain provenance only when they conflict with current authority.
