# The Canonical Shelf

**The Canonical Shelf** is a self-paced Bible-literacy and Scripture-study web application designed to help adult learners understand the Bible as a library, read it in context, develop sound interpretive habits, understand how Christian doctrine develops, and engage difficult or contested questions with intellectual and theological care.

The current application is the **v6 greenfield replatform**. It replaces the legacy runtime while selectively migrating audited curriculum content, stable learning identities, Scripture data, Topics, theological policy, and learner state.

> **Current status:** Engineering and automated acceptance gates are passing. The application remains under a documented release hold for final physical-device, assistive-technology, learner-usability, editorial/theological, and production account/sync validation.

---

## Product model

Canonical Shelf is built around one linear, self-paced curriculum:

- **25 units**
- **70 guided lessons**
- **69 mastery activities**
- **139 scored activities total**
- **45 curated Topics** used as reference material rather than course completion requirements

The primary application destinations are:

1. **Home** — progress, continuation, and orientation
2. **Course** — the 25-unit learning path
3. **Bible** — canonical bookshelf, chapter reader, reference lookup, and Scripture search
4. **Topics** — curated reference material
5. **Practice** — spaced reinforcement and review

`Account & sync` and `Ask the Guide` are secondary capabilities rather than primary navigation destinations.

---

## Curriculum progression

The v6 curriculum is organized as:

1. Start Here
2. How to Read a Bible
3. Bible as Library
4. How Interpretation Works
5. Story in One View
6. Beginnings
7. Abraham to Exodus
8. Torah and Wilderness
9. Land, Judges, and Ruth
10. Kings and Temple
11. Kingdoms and the Prophetic Library
12. Exile, Return, and the World Before Jesus
13. Poetry and Wisdom
14. Jesus and Gospels
15. Cross, Resurrection, Salvation
16. Acts and Early Church
17. Paul and Other Letters
18. How Christian Doctrine Develops
19. God and Christian Doctrine
20. Christian Practice
21. Christian Traditions
22. Difficult Questions and Contested Interpretations
23. Resurrection, Judgment, New Creation
24. Themes Across Scripture
25. Independent Mastery

The broad learning progression is:

**orientation → biblical literacy → interpretive method → biblical story → complex interpretation → doctrine formation → traditions and disagreement → contested questions → synthesis → independent interpretation**

A core interpretive model introduced early in the curriculum is:

**TEXT → CONTEXT → INTERPRETATION → THEOLOGY → APPLICATION**

---

## Scripture corpus

Canonical Shelf includes an **embedded local copy of the Berean Standard Bible (BSB)** as its primary Scripture corpus.

The Bible text is not fetched from a third-party Bible API during normal use. The application parses the bundled corpus locally for:

- 66-book canonical navigation
- chapter reading
- verse/reference lookup
- direct references such as `John 3:16`
- local word and phrase search
- offline Scripture access

The corpus is generated into:

```text
public/data/corpus.txt
```

Its audited migration source is the legacy Canonical Shelf `public/corpus.txt` asset. The approved immutable source snapshot is vendored into this repository under `content/vendor/legacy/`; normal production builds do not depend on the legacy repository being available.

---

## Offline-first PWA

Canonical Shelf is designed as an offline-first Progressive Web App.

Core functionality remains available without an account and without continuous network access:

- Bible
- Course
- Topics
- Practice
- learner progress
- spaced review
- search
- progress export/import
- bounded Guide evidence already packaged with the application

The service worker maintains versioned shell and data caches. Navigation uses durable native routes such as:

```text
/home
/course
/bible
/topics
/practice
```

Legacy `#/...` URLs are compatibility-only and canonicalize forward to native routes. The install manifest launches at `/home`; the old hash-route startup path is not part of the v6 architecture.

---

## Learner state

Learner progress is **local-first**.

Structured state is stored in IndexedDB and includes separate concepts for:

- completed activities
- attempts
- mastery
- review scheduling
- migration state
- synchronization metadata

Legacy progress can be migrated into v6, while raw legacy migration records remain local-only.

### Spaced review

Practice uses a v6 review scheduler rather than preserving the old review implementation. Review state is separate from simple completion state so an activity can be complete while still becoming due for reinforcement later.

---

## Optional accounts and cross-device sync

An account is **not required** to use Canonical Shelf.

The architecture supports guest-first use with optional authenticated sync for learners who want cross-device continuity, authenticated backup, or recovery on a new device.

The sync architecture uses:

- **IndexedDB** as the authoritative local state
- a local mutation outbox
- deterministic merge rules
- **Better Auth 1.7.5** for identity/session handling
- **passkeys** as the primary recoverable credential path
- **Cloudflare D1** for user-scoped remote learner snapshots and mutation identities

Important sync invariants:

- local study never depends on the network
- completion merges monotonically
- review schedules reconcile using activity-specific freshness
- signing out does not erase local progress
- `legacyRaw` migration data is never uploaded
- the sync API derives user identity from the authenticated server session
- clients cannot submit or override a remote `userId`
- replay identity is scoped by `(user_id, mutation_id)`
- account deletion removes remote learner sync records while leaving local device progress intact unless the learner separately clears it

Production account/sync remains release-held until the real D1/Auth environment, passkey flows, account recovery/deletion, and authenticated cross-user endpoint isolation have been validated.

---

## Ask the Guide / Theologian runtime

`Ask the Guide` is a bounded interpretive and theological assistant embedded in the application. It is **not** permitted to invent doctrine or silently override Canonical Shelf's stated theology.

Its authority hierarchy is:

1. Statement of Faith
2. explicit Canonical Shelf theological/editorial policy
3. approved curriculum and Topics
4. Scripture plus curated historical, linguistic, and reception evidence
5. denominational/confessional sources
6. vetted academic sources

The runtime distinguishes both doctrinal and evidentiary confidence rather than collapsing them into a single certainty score. It includes safeguards for LGBTQ inclusion and dignity, contested biblical texts, lexical overstatement, Romans 1 claims, Ruth and Naomi / queer reception history, and mastery-answer leakage.

---

## Theology and interpretive posture

The **Statement of Faith** is the normative ceiling for Canonical Shelf doctrinal claims.

The application intentionally distinguishes textual evidence, historical context, interpretation, theology, reception history, and application. Competing Christian interpretations may be represented accurately without allowing an external position to silently replace Canonical Shelf's stated position.

The current theological policy explicitly affirms the full dignity and Christian inclusion of LGBTQ people. The curriculum also treats queer reception history and contested interpretation as real areas of study while distinguishing interpretive reception from claims that exceed the wording of the biblical text.

See:

```text
content/statement/
content/theology/
public/data/theology-policy.json
docs/v6/theologian-runtime.md
```

---

## Greenfield migration rule

v6 is **not** a brownfield continuation of the legacy application.

> **Greenfield product architecture with audited migration of approved intellectual property, content, identifiers, and learner state.**

Legacy material is treated as a migration candidate rather than a default requirement. The audited migration manifest at `content/migration/admissibility.json` pins the legacy source to an immutable commit and explicitly lists the assets allowed into v6. Approved source assets are now vendored locally, so `canonical-shelf` is independently buildable.

---

## Architecture

### Client

- semantic HTML
- modular vanilla JavaScript
- CSS custom properties with a three-tier token system
- IndexedDB learner state
- native History API routing
- service-worker PWA shell/data caching

### Optional sync Worker

- Cloudflare Worker
- Better Auth
- passkeys
- Cloudflare D1
- user-scoped sync snapshots and mutation log

### Design-system token model

The CSS system enforces primitive, semantic, and component token tiers. Components are not allowed to consume primitive reference tokens directly.

---

## Accessibility

Automated coverage includes Chromium, Firefox, and WebKit; axe WCAG-tagged serious/critical checks; keyboard/focus behavior on tested flows; reduced-motion support; forced-colors support; responsive/mobile-width checks; and semantic form/status structures.

Automated checks do not replace human accessibility validation. The release hold still requires NVDA, VoiceOver, forced-colors inspection, 200%/400% zoom and reflow inspection, and physical touch-device testing.

---

## Development

### Requirements

- **Bun 1.2.15** — pinned to match the production Cloudflare build environment and committed lockfile format.

Install dependencies reproducibly:

```bash
bun install --frozen-lockfile
```

Run the authoritative production build:

```bash
bun run build
```

Run the complete automated verification matrix:

```bash
bun run verify
```

Useful individual commands:

```bash
bun run migrate
bun run validate
bun run test:sync
bun run test:d1
bun run build:client
bun run build:worker
bun run serve
bun run test:e2e
```

---

## Production deployment

Production uses **Cloudflare Workers Static Assets + a Cloudflare Worker + D1**. The build generates `wrangler.jsonc`; generated configuration and runtime artifacts are intentionally not hand-maintained.

Required production environment values:

```text
D1_DATABASE_ID
BETTER_AUTH_URL
BETTER_AUTH_SECRET
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

`BETTER_AUTH_SECRET`, `D1_DATABASE_ID`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_API_TOKEN` belong in protected GitHub/Cloudflare secrets. `BETTER_AUTH_URL` is a non-secret production environment variable.

The manual `deploy-production` GitHub Actions workflow:

1. installs with the frozen Bun lockfile
2. runs the full automated release-candidate verification matrix
3. generates Cloudflare configuration
4. applies D1 migrations
5. deploys the Worker and static assets

The generated Cloudflare configuration declares native SPA fallback behavior, `/api/*` Worker-first routing, D1 binding, observability, and `BETTER_AUTH_SECRET` as a required deployment secret.

---

## CI acceptance surface

Production CI validates, among other things:

- immutable audited migration provenance
- repository-local vendored source assets
- deterministic runtime-data generation
- Better Auth schema generation
- curriculum/content counts and identity
- 25 units with no empty unit
- 70 guided lessons
- 69 mastery activities
- 139 scored activities
- 45 Topics
- embedded BSB corpus integrity
- native routing
- migration compatibility rules
- design-token architecture
- Theologian safeguards
- local sync merge/privacy/outbox behavior
- local D1 isolation/replay/deletion behavior through Miniflare
- client, browser shell, and Worker bundles
- Chromium, Firefox, and WebKit E2E
- axe accessibility checks
- offline/PWA behavior
- mobile-width account/header behavior
- Cloudflare deployment-config dry run

---

## Release status

The Director disposition remains:

**PASS WITH RELEASE HOLD**

Engineering and automated release infrastructure can be production-complete while final release still requires human/environment validation covering screen readers, forced colors/high zoom, physical iPhone/iPad/Android devices, PWA install/launch, representative learner usability, editorial/theological sampling, and real production Better Auth/D1/passkey/account-recovery/privacy validation.

See `docs/v6/release-readiness.md`.

---

## Repository map

```text
public/                     Browser application and generated runtime data
public/data/                Generated curriculum, corpus, theology/source data
content/                    Audited source content and migration policy
content/vendor/legacy/      Immutable admitted source snapshot retained for provenance/builds
content/migration/          Legacy admissibility manifest
content/statement/          Canonical Shelf Statement of Faith
content/theology/           Curated theological/source evidence
worker/                     Account/sync Cloudflare Worker
worker/migrations/          Generated auth + learner-sync D1 migrations
src/client/                 Better Auth/passkey client source
src/knowledge/              Knowledge/theology domain types
scripts/                    Build, migration, validation, sync, D1, and deployment tooling
tests/e2e/                  Cross-browser Playwright coverage
docs/v6/                    Architecture, theologian, sync, and release docs
```

---

## Governing principle

Canonical Shelf should teach learners not merely **what conclusion to repeat**, but **how to read carefully, distinguish evidence from interpretation, understand how theology develops, recognize legitimate disagreement, and make increasingly independent judgments without losing sight of the project's stated theological commitments**.
