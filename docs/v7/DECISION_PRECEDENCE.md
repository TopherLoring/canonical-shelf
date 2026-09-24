# v7 Decision Precedence and Conflict Protocol

Status: **current authority**  
Updated: **2026-09-24**

## Authority

The latest explicit project-owner decision takes precedence over earlier project decisions. Current authority order:

1. latest explicit owner decision;
2. `AI_INSTRUCTIONS.md`;
3. this document;
4. current domain authority docs and source contracts;
5. generated artifacts;
6. historical plans/audits as provenance only.

Terms such as **locked**, **approved**, **canonical**, and **invariant** describe the current baseline; a later owner decision may supersede them.

## Current release / convergence

`main` is the canonical production branch. Historical PR/convergence records remain provenance and must not override the current owner-approved architecture or current-head verification evidence.

- **#20** — superseded independent merge candidate; questions-first curriculum intent is already represented.
- **#22** — superseded implementation; preserve Library First/Theologian/cache/live-smoke outcomes, not its `locked-*`, MutationObserver, or post-render repair architecture.
- **#23** — superseded independent merge candidate; learner-corpus intent is represented by reachability + generated/freshness-validated `llms.txt`, not its snapshot.
- **#24** — merged historical convergence baseline; its later document-first routing implementation was superseded by the 2026-09-24 owner decision to restore a true SPA.

Do not merge stale PRs wholesale. Deployment remains a separate explicit production action. A GitHub Actions run with zero executed steps is infrastructure evidence, not code-validation evidence.

## Product and curriculum invariants

Current scored curriculum counts are descriptive runtime data, not permanent verification constants. Durable curriculum requirements are:

- six-course adult Bible-literacy structure;
- Topics outside completion;
- inherited stable learner/activity IDs;
- deterministic completion-bearing assessment behavior;
- spaced review and retention;
- questions-first spiral learning;
- assessment of understanding/reasoning, never personal theological assent.

Historical exact counts and earlier 25-unit / 70-lesson / 69-mastery / 139-activity values are migration snapshots only.

## Experience / architecture

`public/canonical-shelf.css` is the **sole visual-system authority** for the current experience. Feature CSS may implement feature-specific layout and composition but must not establish a competing palette, typography hierarchy, geometry system, theme hierarchy, or destination-level visual language. `public/tokens.css` is retired.

Locked visual/product selection:

- scholarly typography with serif display/reading, restrained sans UI, and mono metadata;
- bookish geometry with **15px** primary radius;
- bright gilt signal **`#ffc800`**, secondary chrome **`#3e4551`**, white Bible reader paper **`#ffffff`**, reader ink **`#303136`**;
- canonical Bible-category colors remain semantic and theme-independent;
- Home is a graphite shelf-first experience and the one primary destination without the shared global navigation bar;
- Home puts destination buttons at upper right, uses separate Old/New Testament shelves sized by relative book length, and leaves empty shelf/bookend space after Revelation;
- learner history adds Continue/Current Context above the four exploration paths; without history, the four paths lead to Bible, Topics, Course, and Practice;
- Course landing is the six-volume shelf;
- lessons use Study Focus + side apparatus and learner-facing **Glossary** terminology;
- Bible is reader-first with compact shelf, Books/Timeline/Maps/Search tools, address controls, contextual reader, and right-side notes;
- Topics uses the editorial dossier approach;
- Practice uses the compact due-first dashboard;
- Theologian is a lower-right floating launcher opening a bounded chat panel; in Study Focus it belongs in the side apparatus rather than overlapping the lesson.

Current curated palette packages are `scholarly-graphite` (default), `cool-archive`, `blue-stone`, and `quiet-jewel`. A theme may change palette/material tone but not typography hierarchy, geometry, destination architecture, Bible category semantics, interaction behavior, accessibility behavior, or learner-state behavior.

Top-level Home, Course, Bible, Topics, Practice, and Search are routes in a **single-document SPA**. `public/index.html` is the sole application document. Internal application navigation uses clean path-based URLs, History API state, and bounded client rendering without replacing the browser document. Back/Forward rerenders through `popstate`. Direct entry and refresh use local/Cloudflare SPA fallback to the canonical shell. Course, Unit, Home, and Progress views use native HTML `<template>` elements in that shell and DOM population. The current architecture SSOT is `docs/v7/SPA_ARCHITECTURE_2026-09-24.md`.

Generated top-level route documents and normal cross-destination document navigation are superseded architecture and must not be restored unless a later explicit owner decision changes the target.

Do not restore:

- whole-body/broad-subtree `MutationObserver` repair;
- duplicate renderers competing for `#main`;
- render-obsolete-UI-then-relocate/rename flows;
- stacked compatibility runtimes;
- generated top-level application route documents or route-ownership markers;
- `public/library-system.js`;
- `public/library-system-refinements.css`;
- `public/locked-home.js`;
- `public/locked-library-baseline.css`.

End-user experience and learning effectiveness are co-primary; architecture serves the experience.

## Statement of Faith / interpretation authority

Public doctrinal ceiling:

`content/statement/statement-of-faith-compact.md`

Supplemental Theologian context only:

`content/statement/statement-of-faith-v3.md`

The long-form belief document must never be presented as the public Statement of Faith or silently promoted above the compact ceiling.

Approved interpretive foundation:

> Scripture should be interpreted with serious attention to the biblical claims that God is love, salvation is grounded in God’s grace rather than human merit, and Jesus identifies love of God and love of neighbor as the greatest commandments through which the rest of the law is understood. Where Christians differ over the conditions, scope, or mechanics of salvation, those interpretations should be presented distinctly rather than treated as settled.

**Learner agency is a hard requirement. The learner remains the decision-maker.** Theologian informs, compares, contextualizes, challenges reasoning, and labels Canonical Shelf's own position; it must not pressure agreement where an issue is genuinely contested. Material viewpoint/translation differences and evidence-strength distinctions remain visible.

## Theologian conversation and privacy

The active Theologian conversation may persist **locally in the browser** across route changes/reloads until New chat or browser-data clearing.

Normal cloud requests may include:

- current question;
- bounded recent conversation;
- current route/activity label;
- allowlisted aggregate study-state context.

Normal requests exclude Journal text, lesson notes, optional reflection writing, account/profile identifiers, feedback content, and inferred beliefs/denomination/sexuality or other sensitive identity traits. Study-state context is not theological evidence.

Ordinary Theologian conversation is not persisted server-side merely because it was sent for inference. A learner may deliberately submit a bounded response snapshot for feedback/review; that explicit submission is the exception.

## Response review / feedback authority

Every Theologian answer may be:

- **Flagged for review**; or
- **Disagreed with / offered another interpretation**.

A review snapshot may include the immediately preceding learner question, exact Theologian answer, visible evidence metadata, route, response mode/model, policy version, validation status, optional reason, and learner-provided explanation.

It must not automatically attach Journal writing, private reflections, lesson notes, profile/account data, inferred beliefs, or unrelated chat history.

**Feedback/review requests are accept-and-normalize, not reject-by-taxonomy.** Unknown categories/reasons and blank/short explanations are valid submissions; unsafe/oversized transport fields may be normalized/clipped.

Anonymous feedback/review reply routing uses a random browser-scoped identifier. The reusable identifier stays in the browser; D1 stores only a one-way SHA-256 routing key. **IP addresses are not the feedback/review identity.** The learner may forget the browser link at any time.

Reviewer responses can return to the same anonymous browser or to an authenticated account. Account deletion de-identifies retained feedback by clearing its account `user_id`.

## Crisis / pastoral safety authority

`content/theology/crisis-policy.json` is the approved crisis-safety policy. A deterministic crisis layer runs **before normal LLM generation** for credible first-person suicide/self-harm indicators.

When warranted:

- immediate attempt, serious injury, overdose, or immediate physical danger → direct to **911/local emergency service/emergency department**;
- U.S. suicide/self-harm/behavioral-health crisis → prominently offer **call or text 988**;
- encourage a trusted person to be physically present and distance from means when relevant;
- stay conversational rather than terminating the chat.

Pastoral response is allowed and expected:

- doubt, depression, despair, suicidal thoughts, and self-harm do not place the learner beyond God's love, grace, presence, or power;
- prayer and human crisis/medical/counseling/pastoral help are compatible;
- Theologian may encourage asking God for comfort, healing, courage, hope, strength, and perseverance;
- Theologian may recommend a trusted pastor, chaplain, clergy member, spiritual director, or shared-faith person;
- if requested, Theologian may pray with the learner.

Prayer must **never** replace or delay urgent human help, and after prayer Theologian returns directly to the safety check.

Prohibited crisis behavior includes shame, threats about hell/divine punishment/salvation, implying weak faith, saying prayer alone should resolve the crisis, promising guaranteed healing, silently contacting third parties, IP-based crisis identity, permanent diagnosis/risk labels, or automatically converting crisis chat into feedback.

## Privacy / legal / retention authority

Current public policy surfaces:

- `/privacy.html`
- `/data-retention.html`
- `/storage.html`
- `/terms.html`
- `/safety.html`

Current product posture:

- local-first guest learning;
- optional account/passkey sync;
- no sale of personal data;
- no targeted advertising;
- no advertising pixels or behavioral analytics trackers;
- first-party authentication/security cookies and functional browser storage only;
- no generic “accept all cookies” banner while no optional tracking exists;
- if nonessential tracking is later introduced, disclosure/consent behavior must change where legally required.

Feedback retention contract:

- unresolved/open feedback: up to 24 months;
- responded/resolved feedback: up to 12 months after response/resolution;
- optional contact information: removed/anonymized no later than 90 days after response/resolution unless a documented exception applies;
- pseudonymous routing key ends with the feedback record.

These periods must be enforced in code, not only documented.

## Learner corpus / reachability

`content/learner-content-reachability.json` v3 owns UI reachability and `llms.txt` disposition.

Embed current learner-facing curriculum/reference/editorial/legal/privacy/safety content. Link the full BSB corpus rather than duplicating it. Exclude supplemental long-form belief context as a standalone authority and exclude private learner/account/feedback records and implementation/governance material.

`public/llms.txt` is generated and freshness-validated, never an independent hand-maintained authority.

## Production / release gates

Canonical production target:

`https://the-canonical-shelf.christopherwonder.workers.dev`

Worker: `the-canonical-shelf`  
D1: `canonical-shelf`

Required release evidence includes:

1. executable current-head `bun run verify`;
2. browser verification of same-document navigation, deep links, Back/Forward, and representative user-facing routes;
3. Cloudflare configuration validation and dry run with SPA fallback;
4. D1 migration validation;
5. release-governance gate;
6. generated/fresh `llms.txt` and other deterministic content/runtime outputs;
7. real post-deploy cloud Theologian smoke with evidence and guardrail validation;
8. applicable human physical-device, accessibility, editorial/theological nuance, and novice-usability review.

`FEEDBACK_ADMIN_TOKEN` is an operational secret for reviewer-response administration and must never be committed as a plaintext configuration value.

## Human gates

Automated evidence and human-review evidence are distinct. A waiver is not a pass. Security/privacy, data integrity, stable IDs, deterministic generation, theology policy, production target, supersession state, feedback privacy, crisis safety, and retention enforcement are not satisfied merely by a visual/editorial waiver.