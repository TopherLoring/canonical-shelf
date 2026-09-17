# Canonical Shelf v6 — Director Release Readiness

Status: **PASS WITH RELEASE HOLD**

Branch: `v6`
Latest automated-gate head: `1bc3a48a06e4beae6df9c0855a184cde0129ac23`
Latest full CI run: `35223143073`

## Director disposition

The v6 engineering implementation has passed the automated acceptance surface currently available in CI. This does **not** authorize merge to `main` or deployment. Release remains held on human/device validation and final production identity/sync provisioning.

## Automated gates — PASS

- audited migration provenance is pinned to an immutable legacy commit and explicit admissibility manifest;
- 25 units, 70 guided lessons, 69 mastery activities, 139 scored activities, and 45 Topics validate exactly;
- no empty v6 curriculum unit;
- native durable routes and static-host fallback validate;
- legacy hash URLs are compatibility-only and canonicalize forward;
- three-tier design tokens are enforced and primitive-token leakage is blocked;
- bounded Theologian runtime, LGBTQ doctrine safeguards, Ruth/Naomi boundary, Romans/lexical caution, and mastery-answer protection are tested;
- local-first learner state, spaced review, sync outbox, merge rules, and `legacyRaw` privacy boundaries are tested;
- optional account/passkey client compiles;
- Better Auth + Cloudflare D1 Worker compiles;
- local D1 harness passes two-user isolation, same mutation ID across users, duplicate replay deduplication, deletion isolation, and `legacyRaw` rejection;
- mutation replay identity is scoped by `(user_id, id)`;
- PWA start URL uses `/home`, install identity is present, shell/data cache boundaries validate, and offline shell behavior is tested;
- Chromium, Firefox, and WebKit E2E suites pass;
- axe serious/critical WCAG-tagged checks pass on covered surfaces;
- mobile-width account/header surface passes automated browser checks.

## Release holds — HUMAN / ENVIRONMENT

These remain release-blocking and must not be represented as completed by automated CI:

1. **Screen reader validation:** NVDA on Windows and VoiceOver on iOS/macOS for primary navigation, lessons, mastery forms, Bible reader, Guide, Account & sync, and error/status announcements.
2. **Forced-colors / zoom:** human inspection in forced-colors plus 200% and 400% zoom/reflow.
3. **Physical mobile devices:** representative iPhone/iPad and Android testing for touch targets, viewport behavior, PWA install/launch, offline work, reconnect, and passkey ceremonies.
4. **Representative learner usability:** low/no-biblical-knowledge learner testing for orientation, lesson comprehension, practice/review flow, search, and Guide expectations.
5. **Editorial/theological review:** representative migrated lessons and Topics in the new sequence, with special attention to Unit 4, Unit 18, contested-text material, LGBTQ spiral integration, and source/evidence labeling.
6. **Production account environment:** provision D1, Worker secrets, Better Auth schema generated from the pinned config, RP/origin configuration, passkey registration/sign-in, account deletion, and fresh-device restoration against the production-like environment.
7. **Authenticated endpoint tests:** explicit unauthorized-request and cross-user endpoint tests using real Better Auth sessions, not only storage-layer user isolation.
8. **Privacy/recovery review:** verify learner-visible disclosure of remotely stored fields, deletion behavior, export/import continuity, and recovery limitations.

## Merge / deploy rule

No merge to `main` and no production deployment until the release holds above are dispositioned. A release candidate may be created only after the production-like account environment exists and physical/human validation has been recorded.
