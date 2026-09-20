# The Canonical Shelf

**The Canonical Shelf** is a self-paced Bible-literacy and Scripture-study web application for adult learners. It is designed to help learners understand the Bible as a library, read it in context, develop sound interpretive habits, understand how Christian doctrine develops, and engage difficult or contested questions with intellectual and theological care.

The current application is **Canonical Shelf v7**, merged to `main` at `801a9706d7cec9574ceadca7647a9f63a2b554fc`. v7 keeps the stronger learner-facing structure and interaction model established in v5, uses v4 selectively as a scholarly writing/content-depth reference, and runs on the cleaner v7 architecture without restoring v5 bridge/runtime debt.

> **Current status:** the merged v7 release passed the authoritative automated production CI before merge. Remaining human/device/editorial/theological review items are continuing quality-assurance work and must not be represented as independently completed unless evidence is recorded.
 
---

## Product model

Canonical Shelf currently uses one linear self-paced curriculum:

- **25 scored curriculum units**
- **70 guided lessons**
- **69 mastery activities**
- **139 scored activities total**
- **45 curated Topics** used as reference material rather than course completion requirements
- **Unit 0 · Lesson 1 — Welcome to Canonical Shelf**, a replayable non-scored orientation/tutorial outside the 25-unit scored curriculum

These counts and identities are the current baseline. They are governed by `docs/v7/DECISION_PRECEDENCE.md`: an explicit later project-owner decision may change them, with conflict notification and confirmation for material state/ID/migration/deployment consequences.

The five primary destinations are:

1. **Home** — progress, continuation, and orientation
2. **Course** — the 25-unit learning journey plus Unit 0 orientation
3. **Bible** — canonical bookshelf, reader, reference lookup, Scripture search, and study affordances
4. **Topics** — curated reference material
5. **Practice** — spaced reinforcement and review

`Account & sync`, `Appearance`, `Feedback`, personal study tools, and `Ask the Guide` are supporting capabilities rather than primary destinations.

---

## v7 experience direction

The current design intent is:

> **v5 product structure and learning flow × v4 scholarly depth × luxury editorial study environment × tactile interactive library**

v7 preserves the v5 product model while reimplementing it natively. It does not restore the legacy bridge architecture, stacked runtimes, DOM-repair hacks, or parallel CSS debt.

### Study Focus

Guided lessons and mastery activities transition into **Study Focus**: a concentrated, theme-aware learning environment with dark outer chrome and an elevated light folio.

Study Focus includes:

- lesson/unit identity and scene/progress state;
- viewport-aware composition;
- persistent reserved-space navigation that does not cover content;
- responsive recomposition across desktop, tablet, phone, and short landscape viewports;
- accordion/drawer-first handling of secondary material before additional primary scrolling;
- scholarly apparatus for textual, historical, literary, translation, lexical, interpretive, reception, doctrinal, application, and source material where relevant;
- rich challenge rendering for sequence, matching, evidence selection, scenarios, argument mapping, classification, single-choice tasks, and reflection.

The governing scholarly sequence remains:

**Text → evidence/history → interpretation → reception → doctrine → application**

### Aesthetic packages

Users can choose among six persisted theme packages:

1. Heritage
2. Canonical Original
3. Oxblood
4. Slate & Linen
5. Illuminated Jewel
6. Bookshelf Spectrum

Themes are full presentation systems rather than palette swaps. Bible category colors remain semantic and are not arbitrarily remapped.

---

## Personal Notes & Journal

Personal writing is restored inside Study Focus.

Learners can keep:

- **Notes** tied to the current lesson/mastery activity;
- **Journal** reflections tied to the current lesson/mastery activity.

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

- 66-book canonical navigation;
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
- Course and Unit 0;
- Topics;
- Practice;
- learner progress and spaced review;
- Notes & Journal;
- search;
- progress export/import;
- theme preferences;
- bounded Guide/Theologian evidence already packaged with the application.

The service worker maintains versioned shell/data caches and includes the v7 Study Focus, theme, orientation, personal-study, and feedback client assets.

Primary native routes include:

```text
/home
/course
/bible
/topics
/practice
```

Legacy hash URLs are compatibility-only and canonicalize forward.

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

Practice uses the current spaced-review schedule:

**1 → 3 → 7 → 14 → 30 → 60 days**

Review state remains separate from simple activity completion.

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

**Not yet implemented:** the planned richer conversational-model Theologian with true multi-turn generation, streaming model responses, retrieval orchestration, saved conversations, and expanded Advanced Study behavior. That upgrade is intentionally deferred to the next release; the current bounded runtime is retained as the evidence/policy layer rather than discarded.

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

---

## Architecture

### Client

- semantic HTML;
- modular vanilla JavaScript;
- CSS custom properties with primitive, semantic, and component token tiers;
- IndexedDB learner state;
- native History API routing;
- service-worker PWA shell/data caching;
- native platform primitives first, with permissively licensed low-level/headless open-source primitives allowed when they materially improve the experience.

### Worker / optional sync

- Cloudflare Worker;
- Better Auth;
- passkeys;
- Cloudflare D1;
- user-scoped sync state and mutation log;
- bounded feedback persistence endpoint.

---

## Accessibility and adaptive access

Accessibility remains a product floor without flattening the default visual experience.

Automated coverage includes Chromium, Firefox, and WebKit; axe serious/critical WCAG-tagged checks; tested keyboard/focus behavior; reduced-motion support; forced-colors support; responsive/mobile-width checks; and semantic form/status structures.

Adaptive presentation paths activate through user/system settings where applicable. Human screen-reader, forced-colors, high-zoom/reflow, physical touch-device, and representative-learner review remain separate evidence gates rather than being inferred from automation.

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
bun run validate
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

Production uses **Cloudflare Workers Static Assets + a Cloudflare Worker + D1**. The build generates `wrangler.jsonc`; generated configuration/runtime artifacts are not intended for manual maintenance.

Required environment values include:

```text
D1_DATABASE_ID
BETTER_AUTH_URL
BETTER_AUTH_SECRET
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

The guarded production workflow installs from the frozen Bun lockfile, runs the complete verification suite, generates Cloudflare configuration, applies D1 migrations, and deploys the Worker/static assets.

---

## CI acceptance surface

The merged v7 candidate passed the authoritative production CI before merge. The automated surface covers, among other things:

- audited migration provenance and repository-local vendored inputs;
- deterministic runtime generation;
- Better Auth schema generation;
- 25/70/69/139 curriculum/activity baseline and 45 Topics;
- Unit 0 exclusion from scored denominators;
- assessment completion/state/migration regression behavior;
- embedded BSB corpus integrity;
- native routing;
- design-token architecture;
- theme persistence;
- Study Focus enter/exit and responsive composition;
- Notes & Journal persistence and sync merge behavior;
- Feedback validation/persistence/privacy behavior;
- Guide/Theologian safeguards;
- local sync merge/privacy/outbox behavior;
- D1 user isolation/replay/deletion behavior;
- browser/client/Worker bundles;
- Chromium, Firefox, and WebKit E2E;
- axe checks on covered surfaces;
- offline/PWA behavior;
- Cloudflare production-config dry run.

---

## Release and documentation state

- v7 release PR #4 was squash-merged to `main` as `801a9706d7cec9574ceadca7647a9f63a2b554fc` after the authoritative production CI passed.
- stale draft PR #3 was closed without merge.
- `docs/v7/` contains the active v7 decision, design, plan, and execution documentation.
- `docs/v6/` is retained as historical architecture/release documentation for the v6 foundation; it is not the current product-governance source.

Current v7 governance and status:

```text
docs/v7/DECISION_PRECEDENCE.md
docs/v7/PLAN_DELTA_V7_V5_POLISH.md
docs/v7/PLAN_DELTA_V7_PERSONAL_STUDY_FEEDBACK.md
docs/v7/PLAN_DELTA_V7_OPEN_SOURCE_ASSEMBLY.md
docs/v7/DESIGN_INTENT_DELTA_V5_POLISH.md
docs/v7/project-execution-graph.json
```

---

## Repository map

```text
public/                     Browser application and generated runtime data
public/data/                Generated curriculum, corpus, theology/source data
content/                    Audited source content and migration policy
content/vendor/legacy/      Admitted legacy source snapshot retained for provenance/builds
content/migration/          Legacy admissibility manifest
content/statement/          Canonical Shelf Statement of Faith
content/theology/           Curated theological/source evidence
worker/                     Account/sync/feedback Cloudflare Worker
worker/migrations/          Generated auth + learner-state/feedback D1 migrations
src/client/                 Better Auth/passkey client source
src/knowledge/              Knowledge/theology domain types
scripts/                    Build, migration, validation, sync, feedback, D1, deployment tooling
tests/e2e/                  Cross-browser Playwright coverage
docs/v7/                    Current v7 decisions, plans, design intent, execution state
docs/v6/                    Historical v6 foundation documentation
```

---

## Governing principle

Canonical Shelf should teach learners not merely **what conclusion to repeat**, but **how to read carefully, distinguish evidence from interpretation, understand how theology develops, recognize legitimate disagreement, and make increasingly independent judgments without losing sight of the project's stated theological commitments**.
