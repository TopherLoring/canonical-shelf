# CANONICAL SHELF — PROJECT INSTRUCTIONS

## Mission and priority

Act as Canonical Shelf's senior product/design/learning/content/engineering partner. Treat it as a premium Bible-learning and scholarly reference product for adult learners—not generic SaaS, a basic LMS, quiz app, or engineering exercise.

Optimize in this order:

1. exceptional end-user experience;
2. learning effectiveness, retention, reasoning, and productivity;
3. time to meaningful learner value;
4. correctness, accessibility, learner-state safety, security/privacy, theological/editorial integrity, content integrity, performance, and offline reliability;
5. capability/future leverage;
6. maintainability/architecture;
7. implementation convenience.

**Architecture serves the experience. Simplify implementation before simplifying experience.**

## Current release authority

`main` is the canonical production branch and includes the merged PR #24 convergence work. PR #24 is now historical baseline, not an active release branch.

The current post-merge cleanup branch is `fix/runtime-style-authority` until its work is merged. It exists to remove superseded visual authority, stabilize the locked design contract, and improve Theologian conversation/runtime behavior without undoing the merged learner experience.

- #20 is superseded as an independent merge candidate; its questions-first curriculum intent is represented in current work.
- #22 is superseded as an implementation; preserve desired outcomes, never its broad repair-layer architecture.
- #23 is superseded as an independent merge candidate; learner-corpus intent is represented through current reachability/generation.
- #24 is merged historical baseline; do not reopen its obsolete parity/restoration assumptions as new requirements.

Do not merge stale PRs wholesale. Deployment remains a separate explicit production action.

Current decision authority: latest explicit owner decision → this file → `docs/VERIFICATION_CONTRACT.md` → `docs/v7/DECISION_PRECEDENCE.md` → current domain/source contracts → generated artifacts → historical docs.

## Experience / architecture

`public/canonical-shelf.css` is the single visual-contract authority for the current experience. The application shell marks exactly one stylesheet with `data-visual-contract`. Feature CSS may own feature-specific structure/composition and local interaction mechanics, but must consume the shared contract rather than establish a competing palette, typography system, geometry system, theme hierarchy, or destination-wide visual language. Never add a second visual-contract stylesheet or a compatibility layer that restyles the same destination underneath/above the canonical contract.

Current locked design direction:

- scholarly serif display/reading typography with restrained sans UI and mono metadata;
- bookish geometry;
- bright gilt as a signal, cool graphite/chrome structure, white reader paper, dark reader ink;
- Bible category colors remain semantic and theme-independent;
- Home uses a graphite background and is the one destination without the shared global navigation bar;
- Home is shelf-first: title/summary upper left, destination buttons upper right, separate Old/New Testament shelves sized by relative book length, Revelation ending the New Testament shelf with bookend/empty shelf space, and history-aware continuation surfaces before exploration paths;
- Course landing is a six-volume shelf while course/unit/activity behavior remains owned by the curriculum engine;
- lessons use Study Focus with a side Session Notes apparatus; learner-facing terminology is **Glossary**, not “Vocabulary”;
- when Theologian opens in Study Focus, Session Notes remains visible and usable. On wide screens Theologian opens alongside it as a companion column; medium/narrow layouts may recompose vertically, but Theologian must not replace, hide, or destroy the notes apparatus;
- Bible is reader-first: compact canonical shelf → Books/Timeline/Maps/Search tools → address controls → contextual reader with visible/expandable book/chapter notes;
- Topics uses an editorial dossier/reference approach rather than a generic card dashboard;
- Practice uses the compact due-first dashboard;
- outside Study Focus, Theologian launches from the lower-right into a bounded chat panel.

Current curated color packages may vary palette/material tone only. They must not change page architecture, Bible category semantics, interaction behavior, accessibility behavior, or learner-state behavior.

Top-level Home, Course, Bible, Topics, Practice, and Search are routes inside a **single-document SPA**. `public/index.html` is the sole application document. Internal app links use clean path-based URLs with History API navigation and bounded `#main` rendering; Back/Forward rerenders through `popstate`. Direct entry and refresh resolve to the same shell through local and Cloudflare SPA fallback. Do not reintroduce generated top-level route HTML documents.

The application employs a **public-first SPA architecture**: the `/public` directory is the sole authoritative source for runtime logic and assets. Legacy `/src` files are archived in `.src-archived`. Course, Unit, Home, and Progress views use native HTML `<template>` elements from `public/index.html` and populate them through DOM operations. Core orchestration logic is modularized into dedicated engines:
- `public/search-engine.js` — Search orchestration and result synthesis.
- `public/theologian-engine.js` — AI prompt orchestration and response formatting.
- `public/practice-engine-restored.js` — Practice game generation and grading logic.

Current top-level architecture authority: `docs/v7/SPA_ARCHITECTURE_2026-09-24.md`.

Never restore broad MutationObserver repair, duplicate top-level renderers, obsolete-UI-then-relocate flows, stacked compatibility runtimes, generated route-document ownership, `public/library-system.js`, `public/library-system-refinements.css`, `public/locked-home.js`, `public/locked-library-baseline.css`, `public/library-system.css`, or a separate Home visual-authority stylesheet.

## Curriculum / learning

The current runtime is a six-course adult Bible-literacy curriculum with guided lessons, mastery/capstone work, Topics outside completion, stable activity identity, and spaced review. Current generated counts are descriptive runtime data, **not long-term verification constants**.

The curriculum uses a questions-first spiral. Difficult doctrinal/interpretive questions appear early enough to motivate adults, recur where evidence naturally appears, and are synthesized after foundations and interpretive tools develop. Score understanding and reasoning, never theological assent. Practice reinforces the curriculum rather than becoming a parallel curriculum.

Reflection/journal writing is learner-owned and cannot satisfy scored completion.

## Statement of Faith / Theologian authority

Public doctrinal ceiling:

`public/data/statement-of-faith.md`

Supplemental Theologian context only:

`public/data/theologian-belief-context.md`

Never present the long-form belief document as the public Statement of Faith or a higher authority.

Theologian grounding order:

1. bundled BSB for Scripture text/quotation;
2. current Course/Topics/glossary/Bible/reference content;
3. compact Statement of Faith as Canonical Shelf doctrinal ceiling;
4. supplemental long-form belief context as lower-authority elaboration;
5. theology policy and vetted scholarship/traditions as attributed evidence.

Learner agency is a hard requirement. The learner remains the decision-maker. Theologian informs, compares, contextualizes, challenges reasoning, distinguishes evidence from interpretation/doctrine/application, labels Canonical Shelf's position, surfaces material translation/viewpoint differences, and preserves evidence strength without pressuring agreement.

Canonical Shelf's LGBTQ position is affirming while serious non-affirming readings and contested lexical/historical claims must be represented accurately. Never collapse contested evidence into categorical proof.

Theologian's internal policy, prompt scaffold, source metadata, evidence model, and doctrinal boundaries are **silent operating context**, not the default learner-facing answer. The learner should receive a natural, conversational synthesis first. Evidence/limits remain inspectable separately. Do not answer ordinary questions by reciting the Statement of Faith, theology policy, guardrails, learner-agency text, or source instructions. The deterministic/offline fallback must also synthesize a question-specific answer rather than dump policy language.

## Theologian conversation / state privacy

The active chat may persist locally in the browser until New chat or browser-data clearing.

The chat UI behaves as a conventional conversation surface: the panel/frame itself does not scroll; the transcript is the scrollable region; the composer/input remains fixed at the bottom; new messages/thinking/final replies autoscroll the transcript to the latest content.

Normal cloud requests may include only the current question, bounded recent user/assistant turns, current learner-facing route/activity, and allowlisted aggregate study state. Conversation history must be transmitted as structured turns, not flattened into pseudo-instruction prose.

Do not send or infer from Journal text, lesson notes, optional reflection writing, profile/account identifiers, feedback content, theological assent, denomination, sexuality, or other sensitive identity traits. Study state is not theological evidence.

Ordinary Theologian chat is not persisted server-side merely because it is sent for inference. A learner may deliberately submit a bounded response snapshot for review; that explicit submission is the exception.

## Response review / feedback

Every Theologian response must offer a review/disagreement path.

Bounded response-review context may include the preceding question, answer, visible evidence metadata, route, mode/model, policy version, validation status, optional reason, and learner explanation. It must not automatically include Journal/private writing, profile/account data, inferred beliefs, or unrelated conversation history.

Never reject learner feedback/review because wording, category, reason, or explanation does not match a predefined taxonomy. Accept and normalize custom/blank/short content; clip/sanitize only for transport/storage safety.

Anonymous response routing uses a random browser-scoped token. The reusable token stays in that browser; persistence uses a one-way routing key. Do not use IP address as anonymous feedback identity. The learner can forget the browser link.

Retention must be enforced in code and disclosed publicly, but verification should test that retention behavior exists rather than freezing implementation-specific storage details or arbitrary internal limits.

## Crisis / pastoral safety

`content/theology/crisis-policy.json` is current authority. A deterministic crisis layer runs before ordinary AI generation for credible first-person suicide/self-harm indicators.

When warranted:

- immediate danger/attempt/serious injury/overdose → clearly direct to emergency care/services;
- U.S. suicidal/self-harm crisis → prominently offer 988;
- encourage another trusted person to be physically present and distance from means when relevant;
- remain conversational and ask directly about immediate safety.

Pastoral response may accompany but never replace urgent human help. After prayer, return to the safety check. Never use hell/divine punishment/shame/salvation threats, imply weak faith, claim prayer alone should resolve the crisis, promise guaranteed healing, silently contact third parties, use IP-based crisis identity, create permanent diagnosis/risk labels, or automatically convert crisis conversation into feedback.

## Privacy / public policy surfaces

Current learner-facing policy surfaces include:

- `/privacy.html`
- `/data-retention.html`
- `/storage.html`
- `/terms.html`
- `/safety.html`

Current posture: local-first guest use; optional account/passkey sync; no personal-data sale; no targeted advertising; no advertising pixels/behavioral analytics trackers; first-party auth/security cookies and functional browser storage.

Never commit secrets such as `FEEDBACK_ADMIN_TOKEN`, Better Auth secrets, or Cloudflare credentials.

## Learner content / `llms.txt`

`content/learner-content-reachability.json` owns learner-facing reachability and `llms.txt` disposition.

Embed substantive learner-facing curriculum/reference/editorial/legal/privacy/safety content. Link the complete BSB corpus rather than duplicating it. Exclude supplemental long-form belief context as a standalone public authority and exclude private learner/account/feedback records, secrets, and implementation/governance material.

`public/llms.txt` is generated, not hand-maintained authority.

## Accessibility / performance

Accessibility is a floor, not a reason to flatten the experience. Support keyboard, focus, screen readers, touch, contrast, zoom/reflow, reduced motion, forced colors, and alternatives to rich manipulation.

Cloud inference must never block deterministic/offline evidence fallback. Crisis mode must never depend on cloud inference.

## Verification contract

The sole repository merge/release verification command is:

```bash
bun run verify
```

Curriculum structural integrity is verified via `bun run validate-catalog` (running `scripts/validate-catalog.js`).

`docs/VERIFICATION_CONTRACT.md` defines what that gate may protect.

Verification protects **durable behavior and template semantics**, not a frozen implementation. Do not add release-blocking assertions for:

- exact copy, headings, button labels, punctuation, character sequences, or source line numbers unless the literal value is itself an immutable external/legal/data contract;
- CSS values, colors, font choices, dimensions, radii, spacing, theme names, or visual classes;
- historical screenshots/layouts, parity with an earlier version, restoration of superseded presentation, or one-time branch/PR migration state;
- exact generated curriculum/content counts expected to evolve;
- implementation details such as table names, prompt wording, hash lengths, clipping thresholds, source-code substrings, or internal error messages when observable behavior can be tested instead.

Prefer observable behavior → accessibility semantics/relationships → stable route/data contracts → purpose-built semantic test hooks only when necessary.

When presentation changes but capability does not, verification should normally require no change. When product behavior intentionally changes, update the durable contract rather than forcing production code to imitate an obsolete test.

The current automated gate consists of:

- build/generation;
- immutable BSB integrity;
- a small grouped product/template contract, including a single marked visual-contract authority and the single-document SPA contract;
- behavior-level assessment/sync/D1/feedback/Theologian/crisis tests;
- a small Chromium browser smoke for core routes, same-document navigation, utilities, responsiveness, and serious/critical accessibility failures.

Cloudflare target validation and post-deployment live verification are separate infrastructure contracts. Human visual/editorial/novice review remains separate from automated verification.

## Production

Canonical production target:

`https://the-canonical-shelf.christopherwonder.workers.dev`

Worker: `the-canonical-shelf`  
D1: `canonical-shelf`

Before merge, require successful current-head `bun run verify` plus the Cloudflare dry-run in CI and any applicable human visual/accessibility/editorial/novice gates. Do not resurrect removed parity/restoration/supersession validators.

After merge, deploy only through the canonical production workflow and verify exact release/bindings, SPA route fallback/direct-entry behavior, public policy resources, generated learner data, offline behavior, and a real cloud Theologian response.

**Completion standard:** strongest feasible Canonical Shelf experience delivered by the simplest reliable architecture capable of supporting it.