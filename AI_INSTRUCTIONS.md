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

Read `.roa/state.json` and `AGENTS.md` first. Project decisions are records in `.roa/records/`, grouped by topic in the generated decision log `docs/v7/DECISION_PRECEDENCE.md`.

- Chris's current request outranks every document, including this one. Contradictions are raised explicitly for approve/reject.
- Per topic, Chris's latest **decision** is current; **defaults** (agent engineering choices, including everything carried over from the old rules document) are enforced but adjustable; **feedback** means adjust, never lock.
- `main` is the production branch. Do not merge stale pull requests wholesale. Deployment is a separate, explicit owner action.

## Experience / architecture

The design-tokens contract is the visual authority (owner decision `design.authority`). Token values live in `.roa/values/design-tokens.json` and generate `public/design-tokens.css`, which loads before `public/canonical-shelf.css`. Change a token only with `node .roa-kit/roa.mjs set design-tokens.<path> <value>`; guards reject hand-declared token variables, duplicated token colors, `!important`, and literal z-index values.

Current layout and styling values are recorded as adjustable defaults (`ui.current-values`), not locks. Open owner feedback covers Home, the shelf, the Bible page, themes, and the Course shelf; see `docs/STATUS.md`. The Theologian placement is the owner decision `theologian.ui`: a vertical tab on the right viewport edge, lower right, on every screen including lessons, sliding a fixed-size chat panel in and out.

Top-level Home, Course, Bible, Topics, Practice, and Search are routes inside a **single-document SPA**. `public/index.html` is the sole application document. Internal app links use clean path-based URLs with History API navigation and bounded `#main` rendering; Back/Forward rerenders through `popstate`. Direct entry and refresh resolve to the same shell through local and Cloudflare SPA fallback. Do not reintroduce generated top-level route HTML documents.

The application employs a **public-first SPA architecture**: the `/public` directory is the sole authoritative source for runtime logic and assets. Legacy `/src` files are archived in `.src-archived`. Course, Unit, Home, and Progress views use native HTML `<template>` elements from `public/index.html` and populate them through DOM operations. Core orchestration logic is modularized into dedicated engines:
- `public/search-engine.js` — Search orchestration and result synthesis.
- `public/theologian-engine.js` — AI prompt orchestration and response formatting.
- `public/practice-engine-restored.js` — Practice game generation and grading logic.

Current top-level architecture authority: `docs/v7/SPA_ARCHITECTURE_2026-09-24.md`.

Retired architecture (broad MutationObserver repair, duplicate renderers, route documents, and the retired library-system/locked-* files) is blocked by `roa` guards and `manifest.forbid`, not by this document.

## Curriculum / learning

The runtime ships the four-module curriculum (owner decisions `curriculum.structure` and `curriculum.design`, approved 2026-10-01): Module 1 Hermeneutics & Canon, Module 2 Hebrew Scriptures, Module 3 Second Temple & Christ Event, Module 4 Synthesis & Practice, with the optional extra-credit module still to be authored. The design is `docs/v7/curriculum-design.proposal.json` (now approved). Unit, lesson, and activity IDs are stable; moving a unit between modules never changes its ID, and old `course.*` IDs resolve through `legacyCourseAliases` in `content/curriculum/structure.mjs`. Next phase: rewrite units to the approved unit pattern, module by module, starting with Module 1. `docs/v7/CURRICULUM_MULTI_COURSE_PLAN.md` describes the retired six-course structure and is history only. It has guided lessons, mastery/capstone work, Topics outside completion, stable activity identity, and spaced review. Current generated counts are descriptive runtime data, **not long-term verification constants**.

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

`content/theology/crisis-policy.json` is current authority. It is internal: never publish it under `public/`, link it, or embed it in `llms.txt` (owner decision 2026-10-01). The only learner-facing crisis surfaces are the crisis response itself and the 988/911 line at `/about.html#help`. A deterministic crisis layer runs before ordinary AI generation for credible first-person suicide/self-harm indicators.

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