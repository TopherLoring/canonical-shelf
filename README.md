# The Canonical Shelf

**The Canonical Shelf** is a self-paced Bible-literacy and Scripture-study web application for adult learners. It is designed to help learners understand the Bible as a library, read it in context, develop sound interpretive habits, understand how Christian doctrine develops, and engage difficult or contested questions with intellectual and theological care.

The application is **Canonical Shelf v7**. It keeps the stronger learner-facing structure and interaction model established in v5, uses v4 selectively as a scholarly writing/content-depth reference, and runs on the cleaner v7 architecture without restoring v5 bridge/runtime debt.

> **Quality status:** automated verification is a release gate, not a substitute for human review. Editorial/theological review, novice-usability review, responsive/device review, and accessibility review are recorded separately and must not be represented as completed without evidence.

---

## Product model

Canonical Shelf uses a **six-course progressive curriculum** rather than a single long course. The curriculum is designed to work for an adult beginner while still developing toward advanced interpretation and theological reasoning.

### Course 1 — Bible & Christianity: Foundations

A complete adult-beginner survey of Christianity, the Bible, transmission and translation, interpretation, theology, Christian practice, traditions, and the biblical story.

### Course 2 — Israel: Exodus, Covenant, Temple & Prophetic Hope

The historical-biblical bridge from Egypt and Exodus through Sinai, tabernacle, sacrifice, monarchy, Temple, prophets, exile, restoration, and unresolved hope.

### Course 3 — From Exile to Jesus: The Second Temple World

Persian, Hellenistic, Hasmonean, Herodian, and Roman contexts; Jewish institutions and diversity; apocalyptic and resurrection expectations; and the world immediately preceding and surrounding the Gospels.

### Course 4 — Jesus, the Gospels & the Early Church

The four Gospels, Jesus' kingdom and teaching, passion and resurrection, Ascension, Pentecost, Acts, Paul, Gentile inclusion, and the development of earliest Christian communities.

### Course 5 — Advanced Biblical Interpretation

Textual transmission, translation theory, genre mechanics, intertextuality, Gospel and letter study, evidence evaluation, and accountable independent interpretation.

### Course 6 — Theology, Traditions & Difficult Questions

Christian doctrine, salvation, providence, Church and practice, traditions, contested texts, difficult questions, resurrection, judgment, and final hope.

The generated curriculum currently contains:

- **6 courses**
- **44 scored units**
- **116 guided lessons**: 70 inherited stable lesson IDs plus 46 new lessons
- **119 mastery/capstone activities**: 69 inherited stable mastery IDs plus 44 unit masteries and 6 course capstones
- **235 scored activities total**
- **45 curated Topics**, used as reference material rather than course-completion requirements
- **Orientation · Lesson 1 — Welcome to Canonical Shelf**, a replayable non-scored tutorial outside the scored curriculum

The historical **25 units / 70 lessons / 69 mastery / 139 scored activities** values remain migration baselines for compatibility. They are no longer curriculum ceilings. Existing inherited lesson and mastery IDs remain stable so prior learner state can continue to resolve correctly.

The five primary destinations remain:

1. **Home** — progress, continuation, and orientation
2. **Course** — the six-course guided learning journey plus replayable Orientation
3. **Bible** — canonical bookshelf, reader, reference lookup, Scripture search, and study affordances
4. **Topics** — curated reference material that does not count toward course completion
5. **Practice** — spaced reinforcement and review rather than a second curriculum

`Account & sync`, `Appearance`, `Feedback`, personal study tools, `Ask the Guide`, and deeper study surfaces are supporting capabilities rather than primary destinations.

---

## Learning architecture

Course is designed as a guided, progressive, visual, interactive, mastery-oriented environment rather than a set of long scrolling documents.

Typical lesson scenes can include:

**Orient → Prepare → Read → Explain → Visualize → Compare → Context → Practice → Retention → Reflect → Continue**

The exact sequence is task-dependent. Lessons preserve scholarly depth through progressive disclosure rather than forcing every note, definition, source, or interpretive qualification into the primary reading flow.

### Study Focus

Guided lessons and mastery activities transition into **Study Focus**: a concentrated, theme-aware learning environment with dark outer chrome and an elevated light folio.

Study Focus includes:

- course, unit, lesson/mastery, scene, and progress identity;
- viewport-aware composition;
- persistent reserved-space navigation that does not cover content;
- responsive recomposition across desktop, tablet, phone, and short landscape viewports;
- optional lesson drawers for glossary terms, historical background, interpretive limits, and deeper material;
- scholarly apparatus for textual, historical, literary, translation, lexical, interpretive, reception, doctrinal, application, and source material where relevant;
- rich challenge rendering for sequencing, matching, evidence selection, scenarios, argument mapping, classification, single-choice tasks, reflection, and synthesis;
- keyboard-accessible alternatives to direct manipulation;
- explicit distinction between understanding/reasoning and theological assent.

The governing scholarly sequence remains:

**Text → evidence/history → interpretation → reception → doctrine → application**

### Mastery and retention

Mastery is structurally part of the curriculum rather than an optional authoring convention:

- every scored unit has an authored **Unit Mastery** activity;
- every course has a cumulative **Course Capstone**;
- existing inherited mastery activities remain available and retain their stable IDs;
- Practice uses the spaced-review schedule **1 → 3 → 7 → 14 → 30 → 60 days**;
- review state remains distinct from simple completion;
- challenges score understanding, evidence use, reconstruction, transfer, and reasoning rather than personal theological assent.

### Glossary

Lesson vocabulary is generated into reusable lesson, course, and global glossary surfaces. Quick definitions keep the learner moving; lesson drawers and deeper study provide fuller lexical, historical, and interpretive context.

---

## Historical-biblical bridge

The six-course model explicitly fills the historical and conceptual gap between a basic Bible overview and the New Testament.

Course 2 develops:

- Egypt, Moses, Exodus, Passover, sea crossing, and wilderness;
- Sinai, covenant, commandments, covenant responsibility, golden calf, rupture, and renewal;
- tabernacle, Ark of the Covenant, sacred space, and divine presence;
- priesthood, offerings, sacrifice, holiness, clean/unclean distinctions, Day of Atonement, Sabbath, and festivals;
- land traditions, Judges, Ruth, monarchy, Davidic covenant, Solomon, Jerusalem, and Temple;
- divided monarchy, prophetic accountability, Assyria, Babylon, Jerusalem's destruction, lament, and exile;
- Persian-period return, Second Temple rebuilding, new covenant, restored presence, Davidic/messianic hope, Spirit, kingdom, and renewed creation.

Course 3 then develops:

- Persian-period Judea, Ezra-Nehemiah, Torah, Temple, and diaspora;
- Alexander, Hellenization, successor kingdoms, Antiochus IV, Maccabean resistance, and temple rededication;
- Hasmonean rule, Roman intervention, Herodian rule, Judea, and Galilee;
- Temple, priesthood, synagogues, diaspora, Torah, Pharisees, Sadducees, Essenes/Qumran, scribes, and revolutionary currents;
- apocalyptic thought, resurrection debates, messianic diversity, Davidic and priestly hopes, Son of Man imagery, restoration, and kingdom;
- the historical vocabulary needed to enter the Gospels without treating first-century Judaism as a flat backdrop.

Course 4 reconnects this foundation to Jesus, Passover, the Last Supper, scriptural fulfillment, passion and resurrection, Ascension, Pentecost, Acts, and Gentile inclusion.

---

## Aesthetic packages

Users can choose among six persisted theme packages:

1. Canonical Original — the new-install default
2. Heritage
3. Oxblood
4. Illuminated Jewel
5. Slate & Linen
6. Bookshelf Spectrum

Existing saved preferences remain unchanged. Themes are full color/surface packages rather than palette swaps, while the original Iowan/Palatino editorial typography remains consistent across them. Bible category colors remain semantic and are not arbitrarily remapped.

---

## Personal study writing

Personal writing is available inside Study Focus with two distinct owners:

- **Lesson notes** live inline in a lesson's Reflect scene so they stay attached to the material being studied;
- **Journal** is a separate global reflection surface, available from Study Focus without covering lesson content.

Both are explicitly **unscored** and do not affect completion, mastery, review schedules, or challenge results. They are local-first, included in learner export/import, and participate in optional account sync through deterministic per-activity merge rules.

---

## Feedback

A compact **Feedback** control is available from every primary screen and from Study Focus.

Feedback supports:

- category;
- message;
- optional contact information;
- automatic route context.

The implementation does not intentionally collect a browser fingerprint or hidden learner content. Online feedback persists through a bounded `/api/feedback` endpoint; failed/offline submissions queue locally and retry when connectivity returns.

---

## Scripture corpus

Canonical Shelf includes an **embedded local copy of the Berean Standard Bible (BSB)** as its primary Scripture corpus.

The application parses the bundled corpus locally for:

- 66-book proportional bookshelf navigation;
- in-context book-detail drawers with authorship, setting, people, themes, reading paths, and chapter entry;
- chapter reading;
- verse/reference lookup;
- direct references such as `John 3:16`;
- local word and phrase search;
- offline Scripture access.

Generated runtime corpus:

```text
public/data/corpus.txt
```

The approved migration source is vendored under `content/vendor/legacy/`, so normal production builds do not depend on the legacy repository being available.

---

## Offline-first PWA

Core study remains usable without a mandatory account or continuous network connection:

- Bible;
- all six Courses and Orientation;
- Topics;
- Practice;
- learner progress, mastery, and spaced review;
- lesson/course/global glossary data;
- inline lesson notes and Journal;
- search;
- progress export/import;
- theme preferences;
- bounded Guide/Theologian evidence already packaged with the application.

The service worker maintains versioned shell/data caches and includes Study Focus, theme, orientation, personal-study, feedback, curriculum, glossary, and Guide client assets.

Primary native routes include:

```text
/home
/course
/bible
/topics
/practice
```

Legacy hash URLs are compatibility-only and canonicalize forward. Legacy unit-only Course URLs map to the closest new semantic unit; inherited lesson and mastery IDs remain stable.

---

## Learner state

Learner state is **local-first** and stored in IndexedDB.

Current structured state includes separate concepts for:

- completed activities;
- attempts;
- per-challenge progress;
- mastery;
- review scheduling;
- Notes;
- Journal;
- migration state;
- synchronization metadata.

Practice uses the spaced-review schedule:

**1 → 3 → 7 → 14 → 30 → 60 days**

Review state remains separate from simple activity completion. Curriculum placement is metadata; inherited learner identity remains anchored to stable activity IDs rather than a unit number that can change during curriculum reorganization.

---

## Optional accounts and cross-device sync

An account is **not required** for core use.

Optional sync supports cross-device continuity, backup, and recovery while retaining local-first ownership. The architecture uses:

- IndexedDB as authoritative local state;
- a local mutation outbox;
- deterministic merge rules;
- Better Auth;
- passkeys;
- Cloudflare D1 for user-scoped remote state and mutation identities.

Important boundaries:

- local study does not depend on the network;
- signing out does not erase local progress;
- `legacyRaw` migration records are not uploaded;
- clients do not choose the authenticated remote user identity;
- account deletion removes remote sync records while leaving local device progress intact unless separately cleared.

Human/environment validation of production passkey, recovery, deletion, authenticated endpoint isolation, and privacy behavior remains continuing QA unless explicitly recorded as completed.

---

## Ask the Guide / Theologian

`Ask the Guide` is currently a **bounded deterministic/evidence-aware interpretive and theological assistant**. It functions inside the application and remains available in Study Focus and offline where packaged evidence is sufficient.

Its authority hierarchy is:

1. Statement of Faith
2. explicit Canonical Shelf theological/editorial policy
3. approved curriculum and Topics
4. Scripture plus curated historical, linguistic, and reception evidence
5. denominational/confessional sources
6. vetted academic sources

The current runtime includes safeguards for contested biblical texts, lexical overstatement, LGBTQ inclusion and dignity, Romans 1 claims, Ruth/Naomi reception boundaries, and mastery-answer leakage.

**Not yet implemented:** the planned richer conversational-model Theologian with true multi-turn generation, streaming model responses, retrieval orchestration, saved conversations, and expanded Advanced Study behavior. That upgrade is intentionally deferred; the current bounded runtime is retained as the evidence/policy layer rather than discarded.

See:

```text
content/statement/
content/theology/
public/data/theology-policy.json
docs/v6/theologian-runtime.md
```

---

## Theology and interpretive posture

The **Statement of Faith** is the normative ceiling for Canonical Shelf doctrinal claims.

The product distinguishes textual evidence, historical context, interpretation, reception history, doctrine, and application. Competing Christian interpretations may be represented accurately without allowing an external position to silently replace Canonical Shelf's stated position.

Content on disputed questions should identify the relevant evidence, major responsible readings, uncertainty, and Canonical Shelf's own position where the product has one. Learners are assessed on understanding and reasoning, not theological assent.

---

## Architecture

### Client

- semantic HTML;
- modular vanilla JavaScript;
- CSS custom properties with primitive, semantic, and component token tiers;
- IndexedDB learner state;
- native History API routing;
- service-worker PWA shell/data caching;
- generated curriculum and glossary catalogs;
- native platform primitives first, with permissively licensed low-level/headless open-source primitives allowed when they materially improve the experience.

### Worker / optional sync

- Cloudflare Worker;
- Better Auth;
- passkeys;
- Cloudflare D1;
- user-scoped sync state and mutation log;
- bounded feedback persistence endpoint.

### Curriculum source and generation

The six-course hierarchy and new authored content live under:

```text
content/curriculum/
```

`content/curriculum/structure.mjs` owns course and unit structure. The migration/post-processing pipeline combines retained authored v7 material with the new curriculum source while preserving inherited activity IDs.

Generated runtime data includes:

```text
public/data/catalog.json
public/llms.txt
```

`llms.txt` is generated and freshness-validated from the same canonical runtime inputs; it is not maintained as an independent hand-edited description of the product.

---

## Accessibility and adaptive access

Accessibility is a product floor without flattening the default visual experience.

Automated coverage includes Chromium, Firefox, and WebKit; axe serious/critical WCAG-tagged checks; keyboard/focus behavior; reduced-motion support; forced-colors support; responsive/mobile-width checks; and semantic form/status structures.

Rich manipulation requires accessible non-drag equivalents. Responsive behavior means recomposition rather than merely shrinking desktop layouts.

Human screen-reader, forced-colors, high-zoom/reflow, physical touch-device, and representative-learner review remain separate evidence gates rather than being inferred from automation.

---

## Development

### Requirements

- **Bun 1.2.15** for the pinned production/CI environment.

Install reproducibly:

```bash
bun install --frozen-lockfile
```

Build:

```bash
bun run build
```

Run the complete automated verification matrix:

```bash
bun run verify
```

Useful commands:

```bash
bun run migrate
bun run generate:llms
bun run validate
bun run validate:llms
bun run test:assessment
bun run test:sync
bun run test:d1
bun run test:feedback
bun run build:client
bun run build:worker
bun run serve
bun run test:e2e
```

---

## Production deployment

Production uses **Cloudflare Workers Static Assets + a Cloudflare Worker + D1** at `https://the-canonical-shelf.christopherwonder.workers.dev`. The generated Wrangler target is `the-canonical-shelf`; the D1 database remains `canonical-shelf`. The build generates `wrangler.jsonc`; generated configuration/runtime artifacts are not intended for manual maintenance.

Required environment values include:

```text
D1_DATABASE_ID
BETTER_AUTH_URL
BETTER_AUTH_SECRET
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

The guarded production workflow installs from the frozen Bun lockfile, runs the complete verification suite, validates generated discovery data, generates Cloudflare configuration, applies D1 migrations, and deploys the Worker/static assets.

---

## CI acceptance surface

The automated release surface covers, among other things:

- audited migration provenance and repository-local vendored inputs;
- deterministic runtime generation;
- Better Auth schema generation;
- exactly six ordered courses and the 44-unit curriculum structure;
- preservation of all 70 inherited guided lesson IDs and 69 inherited mastery IDs;
- expansion beyond the historical 139-activity migration baseline;
- Orientation exclusion from scored denominators;
- an active learning check on every scored guided lesson;
- authored Unit Mastery for every scored unit;
- a cumulative Course Capstone for all six courses;
- required Exodus/Temple/exile/Second Temple historical-bridge coverage;
- generated lesson/course/global glossary data;
- the 1/3/7/14/30/60 retention schedule;
- assessment completion/state/migration regression behavior;
- embedded BSB corpus integrity;
- native routing and legacy-link compatibility;
- design-token architecture and theme persistence;
- Study Focus enter/exit, browser-history, viewport, mobile-apparatus, and rich-challenge behavior;
- inline lesson-note and separate Journal persistence and sync merge behavior;
- Feedback validation/persistence/privacy behavior;
- Guide/Theologian safeguards and mastery-answer protection;
- local sync merge/privacy/outbox behavior;
- D1 user isolation/replay/deletion behavior;
- browser/client/Worker bundles;
- Chromium, Firefox, and WebKit E2E;
- axe checks on covered surfaces;
- offline/PWA behavior;
- generated `llms.txt` freshness;
- Cloudflare production-config dry run.

A green automated run does **not** by itself complete editorial/theological review, novice usability review, physical-device review, or manual accessibility review.

---

## Governance and execution planning

Consequential repository work is plan-before-mutation. The multi-course curriculum change is backed by an Implementation Plan, Execution Plan, WBS, and typed Project Execution Graph under `docs/v7/`.

The explicit owner-approved curriculum decision supersedes the historical fixed-count ceiling while preserving compatibility requirements. See:

```text
docs/v7/CURRICULUM_MULTI_COURSE_PLAN.md
docs/v7/curriculum-multicourse-execution-graph.json
docs/v7/DECISION_PRECEDENCE.md
```

Other current v7 governance and design references include:

```text
docs/v7/PLAN_DELTA_V7_V5_POLISH.md
docs/v7/PLAN_DELTA_V7_PERSONAL_STUDY_FEEDBACK.md
docs/v7/PLAN_DELTA_V7_OPEN_SOURCE_ASSEMBLY.md
docs/v7/DESIGN_INTENT_DELTA_V5_POLISH.md
docs/v7/project-execution-graph.json
```

`docs/v6/` remains historical architecture/release documentation for the v6 foundation; it is not the current product-governance source.

---

## Repository map

```text
public/                     Browser application and generated runtime data
public/data/                Generated curriculum, corpus, theology/source data
content/                    Audited source content and migration policy
content/curriculum/         Six-course structure, new lessons, mastery, and authoring helpers
content/vendor/legacy/      Admitted legacy source snapshot retained for provenance/builds
content/migration/          Legacy admissibility manifest
content/statement/          Canonical Shelf Statement of Faith
content/theology/           Curated theological/source evidence
worker/                     Account/sync/feedback Cloudflare Worker
worker/migrations/          Generated auth + learner-state/feedback D1 migrations
src/client/                 Better Auth/passkey client source
src/knowledge/              Knowledge/theology domain types
scripts/                    Build, migration, validation, sync, feedback, D1, discovery, deployment tooling
tests/e2e/                  Cross-browser Playwright coverage
docs/v7/                    Current v7 decisions, plans, design intent, execution state
docs/v6/                    Historical v6 foundation documentation
```

---

## Governing principle

Canonical Shelf should teach learners not merely **what conclusion to repeat**, but **how to read carefully, distinguish evidence from interpretation, understand the biblical story and its historical worlds, recognize how theology develops, represent legitimate disagreement accurately, retain what they learn, and make increasingly independent judgments without losing sight of the project's stated theological commitments**.
