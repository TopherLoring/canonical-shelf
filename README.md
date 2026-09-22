# The Canonical Shelf

**Canonical Shelf** is a self-paced Bible-literacy, Scripture-reading, and Christian-study application for adult learners. It is designed to help a learner understand the Bible as a library, read texts in context, build durable biblical knowledge, evaluate interpretations and evidence, understand Christian doctrine and disagreement, and eventually investigate unfamiliar questions independently.

The current application uses the v7/current architecture, retains the strongest learner-facing ideas from earlier versions, and does not restore the bridge/runtime debt of the historical v5 implementation.

> **Release status:** automated verification is a release gate, not a substitute for human review. Editorial/theological, novice-usability, physical-device, and manual-accessibility reviews remain separate evidence classes and must not be represented as passed without evidence.

## Current product model

The five primary destinations are:

1. **Home** — orientation, progress, and continuation.
2. **Course** — six-course guided curriculum and scored learning activities.
3. **Bible** — 66-book bookshelf, book profiles, chapters, Scripture reader, search, and Bible-specific study context.
4. **Topics** — curated reference material outside course completion.
5. **Practice** — retrieval, spaced review, mastery reinforcement, games, and related practice modes; not a second curriculum.

Supporting capabilities include Search, Progress, Account/Profile, appearance themes, Feedback, Journal Notes, and the Theologian.

## Six-course curriculum

Canonical Shelf uses a **questions-first spiral**. Important doctrinal and difficult questions are introduced early enough to motivate an adult learner, revisited where their biblical and historical evidence naturally appears, investigated with stronger interpretive tools, and synthesized later. The curriculum does not hide difficult questions until the final course, and it does not force confidence before the learner has the context needed to evaluate a claim responsibly.

### 1. Bible & Christianity: Foundations

A rigorous adult-beginner map of Christianity, the Bible, transmission and translation, interpretation, theology, practice, traditions, the biblical story, and the major questions the curriculum will revisit.

Estimated active first-pass study: **6–8 hours**.

### 2. Israel: Exodus, Covenant, Temple & Prophetic Hope

Egypt and Exodus, Sinai and covenant, tabernacle and Ark, sacrifice and sacred time, land and monarchy, Temple, prophets, exile, restoration, and unresolved hope.

Estimated active first-pass study: **7–10 hours**.

### 3. From Exile to Jesus: The Second Temple World

Persian, Hellenistic, Hasmonean, Herodian, and Roman contexts; Jewish institutions and diversity; apocalyptic and resurrection expectations; and the world surrounding the Gospels.

Estimated active first-pass study: **5–7 hours**.

### 4. Jesus, the Gospels & the Early Church

The four Gospels, Jesus' kingdom and teaching, passion and resurrection, Ascension, Pentecost, Acts, Paul, Gentile inclusion, and earliest Christian communities.

Estimated active first-pass study: **7–10 hours**.

### 5. How We Know: Interpretation & Evidence

Textual transmission, translation theory, genre, intertextuality, Gospel and letter study, historical context, lexical evidence, competing interpretations, confidence, and accountable independent interpretation.

Estimated active first-pass study: **6–9 hours**.

### 6. Christian Theology, Traditions & Synthesis

God and Christ, humanity/sin/salvation, providence, Church and practice, Christian traditions, contested texts and difficult questions, resurrection, judgment, and final hope—using the foundations developed across Courses 1–5.

Estimated active first-pass study: **6–9 hours**.

Current target/runtime contract:

- **6 courses**
- **44 scored units**
- **117 guided lessons**
- **119 mastery/capstone activities**
- **236 scored activities**
- **12 recurring difficult-question/doctrinal threads**
- **45 curated Topics** outside completion
- replayable non-scored Orientation
- inherited stable lesson/mastery IDs preserved

The historical 25-unit / 70-lesson / 69-mastery / 139-activity values remain migration baselines, not current curriculum ceilings.

## Learning architecture

Guided learning is progressive and interactive rather than a collection of long lecture pages. Scene roles may include:

**Orient → Prepare → Read → Explain → Visualize → Compare → Context → Practice → Retention → Reflect → Continue**

The exact sequence depends on the learning task. Assessment can use ordering, matching, classification, evidence selection, reconstruction, scenarios, argument mapping, comparison, interpretation distinctions, reflection, and synthesis. Scored work evaluates understanding and reasoning rather than requiring theological assent.

### Study Focus

Lessons and mastery activities enter **Study Focus**, which uses the current library-system design:

- human-facing Course / Unit / lesson identity rather than technical IDs;
- a thin vertical dot progress rail;
- a light editorial reading/interaction surface;
- an attached dark **Session Notes** panel;
- contextual collapsible vocabulary, passage, evidence, deeper-study, interpretive-limit, and source material;
- **Journal Notes** and **Feedback** actions that temporarily use the side panel;
- deliberate-open contextual Theologian rather than a floating overlay;
- responsive recomposition for narrower/shorter viewports.

Current activity/step identifiers remain internal. Learner-facing copy may say a journal entry or feedback submission is tied to the current study activity without exposing the identifier.

### Mastery and retention

- Every scored unit has authored mastery.
- Every course has a cumulative capstone.
- Inherited mastery IDs remain valid.
- Spaced review uses **1 → 3 → 7 → 14 → 30 → 60 days** unless later evidence supports a better interval.
- Completion, retention, mastery, and review-due state remain distinct.

## Bible

Canonical Shelf includes an embedded local copy of the **Berean Standard Bible (BSB)** as the canonical Scripture corpus used by the application and Theologian quotation layer.

The Bible destination provides:

- a proportional **66-book bookshelf**;
- canonical-category color coding;
- full book-name reveal on desktop hover/focus;
- first-touch name reveal on touch/mobile before deliberate open;
- book profiles and reading paths;
- chapter reading and reference lookup;
- local word/phrase search;
- canon/timeline and other Bible-context surfaces.

The current Bible reader uses a **light reading surface** with an attached charcoal **Book Notes** panel. Book Notes use collapsible sections such as At a glance, People & setting, Group & themes, Where to start, and Reader links.

The bundled BSB remains available offline from `public/data/corpus.txt`.

## Topics

Topics are authored reference, not a parallel course and not part of completion. Topic reading uses a light reference surface with an attached charcoal contextual panel for metadata, search language, Scripture/course connections, evidence, and related exploration.

The glossary is generated from lesson vocabulary and is discoverable through the Topics/reference layer and global search.

## Practice

Practice reinforces material already encountered. It includes recommended spaced review and the application's existing mastery, campaign, arcade/game, interpretation, themes, verse-library, rank/achievement, and related reinforcement surfaces where applicable.

Practice should follow **challenge → feedback → state change → next challenge**, and correct/incorrect feedback should communicate the result without showing contradictory simultaneous success/error states.

## Visual system and themes

The approved default/reference theme is an **editable flat library system**, documented in `docs/v7/LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md`.

Default/reference visual grammar:

- masthead charcoal `#24272d`;
- secondary/menu charcoal `#31353c`;
- white/ivory primary reading surfaces;
- restrained cool-neutral structural colors;
- sparse antique gilt `#c7a253`;
- serif editorial/content typography;
- sans-serif interface typography;
- monospace only for genuine technical metadata;
- no decorative gradients in the reference theme;
- no default red/brown/tan cast;
- no generic SaaS dashboard treatment or unnecessary card-within-card nesting.

Appearance packages remain selectable from **Profile / Account**. Existing optional themes such as Heritage, Oxblood, Illuminated Jewel, Slate & Linen, and Bookshelf Spectrum may intentionally use their own palettes. Theme choice affects presentation, not curriculum meaning, progress, assessment, or theology.

The baseline is authoritative for continuity but intentionally editable when a later owner-approved decision supersedes it.

## Journal Notes and Feedback

Journal Notes are private, persistent, unscored learner-owned writing tied to the material being studied. Lesson Journal Notes are tied to the current study activity. Context should be described to the learner in human terms rather than exposing technical activity IDs.

Feedback is available throughout the product. Feedback can attach current route/activity/build context internally; submitted feedback history is not exposed as a learner-facing content library. Offline/failed submissions can queue locally and retry.

A consolidated Profile → Journal browsing/index experience and additional Bible/Topic-linked Journal entry points should only be documented as implemented once their runtime paths are present and validated.

## Ask the Theologian

The Theologian has two layers:

1. **deterministic evidence-aware fallback** — bounded retrieval/evidence logic that remains available without cloud synthesis;
2. **Cloudflare Workers AI conversational synthesis** — a remote model turns first-party retrieved evidence into a more natural answer when available.

No model weights are downloaded to the learner's device.

### Authority order

1. **Berean Standard Bible** — canonical Scripture text/quotation source.
2. **Canonical Shelf site content** — Course, Topics, glossary, Bible/book/reference content.
3. **Statement of Faith** — doctrinal ceiling.
4. **Theology policy + vetted research** — evidence labels, interpretive boundaries, source metadata, LGBTQ arguments/research, and serious competing interpretations.

The model is a synthesis layer, not an independent theological authority. Post-generation validation can reject a cloud answer and retain the deterministic response.

### LGBTQ research / evidence discipline

Canonical Shelf's stated position is affirming. The canonical theology policy includes an explicit argument framework for Sodom, Leviticus, Romans 1–2, `malakoi`/`arsenokoitai`, 1 Timothy, Jesus/love, law/grace, fruit/relational ethics, eunuchs/belonging, and grace/belonging.

The source catalog includes affirming and non-affirming scholarship, critical commentaries, lexicons, historical studies, and primary-source-oriented works. Claims are stored with what the source can support and its limits. The runtime specifically prevents common overstatements such as reducing Romans 1 exclusively to pederasty/exploitation, assigning one certain modern meaning to `arsenokoitai`, reducing `to'evah` to ritual impurity only, or mapping ancient eunuchs directly onto modern LGBTQ identity.

Canonical theology sources:

```text
content/statement/statement-of-faith-v3.md
content/theology/policy.json
content/theology/sources.json
```

Published runtime copies are regenerated deterministically under `public/data/`.

### Privacy

The browser sends the current question and user-facing route to `/api/theologian`. The Worker retrieves trusted first-party evidence. Canonical Shelf does not persist Theologian conversation text to D1, KV, Durable Objects, or account sync, and it does not send Journal/profile/progress/account data as model context. Workers AI is remote processing, so this feature must not be described as device-local AI.

See `docs/v7/THEOLOGIAN_CLOUD_RUNTIME_2026-09-21.md`.

## Statement of Faith and About

The Statement of Faith is user-facing under **About → Statement of Faith** (`/about.html#faith`) and is linked from the footer. Its canonical source is `content/statement/statement-of-faith-v3.md`.

About also owns methodology, Scripture/interpretation posture, translation, accessibility, privacy, and related institutional/reference information rather than competing with the five primary learning destinations.

## Offline-first and learner state

Core Bible/Course/Topics/Practice content, learner state, theme preferences, search, and deterministic Theologian evidence are local/offline-capable according to the PWA cache/runtime contract. Cloud synthesis naturally requires network access, but its failure does not remove the deterministic Theologian path.

Learner state is local-first in IndexedDB. Optional accounts provide sync/backup/recovery using Better Auth, passkeys, and Cloudflare D1 while retaining stable local identity/state semantics.

Stable activity IDs—not mutable display placement—anchor inherited progress compatibility.

## Architecture

### Browser

- semantic route-owned HTML documents for **Home, Course, Bible, Topics, Practice, and Search**;
- `public/index.html` as the shared shell source and root/legacy-hash compatibility fallback;
- deterministic route-document generation through `scripts/generate-route-documents.mjs`;
- normal browser document navigation between different top-level destinations;
- History API updates only for query/detail state inside the currently owned destination;
- bounded JavaScript enhancement of route content rather than SPA-wide page reconstruction;
- modular vanilla JavaScript;
- CSS custom properties and destination-specific experience layers;
- IndexedDB learner state;
- service-worker PWA caching, including route-specific offline documents;
- generated curriculum/glossary/topic data;
- Cloud Theologian progressive enhancement over deterministic fallback.

The architecture intentionally does **not** use a whole-body `MutationObserver`, render-old-UI-then-repair behavior, duplicate renderers competing for `#main`, or stacked corrective CSS/runtime layers.

### Cloudflare Worker

- static assets binding with clean HTML routing (`html_handling: auto-trailing-slash`);
- Better Auth and passkeys;
- D1 account/sync/feedback persistence;
- Workers AI binding for Theologian synthesis;
- `/api/health` release/binding identity endpoint;
- canonical production target `the-canonical-shelf`.

## Deterministic generation

Authoritative content and route structure are regenerated into runtime artifacts rather than maintained as divergent copies.

Source inputs include:

```text
content/curriculum/               curriculum source
content/statement/                Statement of Faith
content/theology/policy.json      theology/interpretation policy
content/theology/sources.json     vetted source catalog
content/vendor/legacy/            admitted legacy snapshot / BSB source
public/index.html                 shared application shell source
```

Generation publishes content artifacts:

```text
public/data/catalog.json
public/data/curriculum.md
public/data/statement-of-faith.md
public/data/theology-policy.json
public/data/theology-sources.json
public/data/corpus.txt
public/llms.txt
```

`public/llms.txt` is generated and freshness-validated rather than hand-maintained.

`bun run generate:routes` runs `scripts/generate-route-documents.mjs` and creates the route-owned build artifacts:

```text
public/home.html
public/course.html
public/bible.html
public/topics.html
public/practice.html
public/search.html
```

These route documents are generated from `public/index.html`; they are not independent hand-maintained shells.

## Development

Requirements:

- **Bun 1.2.15**

Install:

```bash
bun install --frozen-lockfile
```

Common commands:

```bash
bun run build
bun run verify
bun run verify:full
bun run validate:curriculum-spiral
bun run validate:native-rendering
bun run test:theologian
bun run generate:llms
bun run generate:routes
bun run generate:wrangler
bun run validate:cloudflare
bun run serve
bun run test:e2e
```

`bun run verify` is the prelaunch code/state gate. `bun run verify:full` includes the deeper assessment and cross-browser E2E/accessibility release audit.

## Production deployment

Canonical production URL:

```text
https://the-canonical-shelf.christopherwonder.workers.dev
```

Worker name: `the-canonical-shelf`  
D1 database name: `canonical-shelf`

Production uses **Cloudflare Workers Static Assets + Worker + D1 + Workers AI**.

Required deployment values:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
D1_DATABASE_ID
BETTER_AUTH_URL
BETTER_AUTH_SECRET
```

`wrangler.jsonc` is generated from `scripts/write-wrangler.mjs`; it is not an independently maintained production source of truth. The generated Static Assets configuration explicitly uses `html_handling: auto-trailing-slash` so clean URLs such as `/course` resolve to the corresponding generated route document rather than depending on the generic SPA fallback.

The production workflow permanently guards the target by:

1. running prelaunch verification;
2. generating Wrangler configuration;
3. verifying exact Worker name/origin, clean route-document handling, D1, AI binding, and release SHA;
4. applying remote D1 migrations;
5. deploying the exact canonical Worker and static assets;
6. calling `/api/health` to verify the live release SHA and required bindings;
7. smoke-testing `/`, `/home`, `/course`, `/bible`, `/topics`, `/practice`, and `/search` and requiring the six destination routes to expose their matching `data-route-document` ownership marker rather than a generic fallback;
8. verifying critical generated content;
9. making a bounded live `/api/theologian` request and requiring grounded cloud synthesis with BSB guardrails.

PR CI additionally performs the full release audit and a Wrangler dry-run so a deployable branch is proven before merge.

See `docs/v7/DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md` and `docs/v7/PLAN_NATIVE_DOCUMENT_RENDERING_2026-09-22.md`.

## Current governance

Current authority order for repository work:

1. latest explicit owner decision;
2. `AI_INSTRUCTIONS.md`;
3. `docs/v7/DECISION_PRECEDENCE.md`;
4. current approved/editable domain baselines such as the library-system and Theologian runtime docs;
5. current canonical source/runtime contracts;
6. older plans/audits as historical provenance when they conflict with newer decisions.

Current key documents:

```text
AI_INSTRUCTIONS.md
docs/v7/DECISION_PRECEDENCE.md
docs/v7/LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md
docs/v7/PLAN_NATIVE_DOCUMENT_RENDERING_2026-09-22.md
docs/v7/native-document-rendering-graph.json
docs/v7/PLAN_DELTA_QUESTIONS_FIRST_SPIRAL.md
docs/v7/THEOLOGIAN_CLOUD_RUNTIME_2026-09-21.md
docs/v7/DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md
docs/v7/DOCUMENTATION_AUDIT_2026-09-21.md
```

Historical v6 and restoration/delta documents remain useful provenance, but they do not override the current integrated baseline.
