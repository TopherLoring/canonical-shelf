# v7 Decision Precedence and Conflict Protocol

Status: **current authority**  
Updated: **2026-09-22**

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

`main` is the canonical production branch. **PR #24 (`fix/native-document-first-rendering`) is the sole active convergence/release PR.**

- **#20** — superseded independent merge candidate; questions-first curriculum intent is already represented.
- **#22** — superseded implementation; preserve Library First/Theologian/cache/live-smoke outcomes, not its `locked-*`, MutationObserver, or post-render repair architecture.
- **#23** — superseded independent merge candidate; learner-corpus intent is represented by reachability + generated/freshness-validated `llms.txt`, not its snapshot.

Do not close the superseded PRs, mark #24 ready, merge, or deploy until current-head executable validation succeeds. A GitHub Actions run with zero steps and `runner_id: 0` is infrastructure evidence, not code-validation evidence.

## Product and curriculum invariants

Current scored curriculum:

- 6 courses;
- 44 units;
- 117 guided lessons;
- 119 mastery/capstone activities;
- 236 scored activities;
- 45 Topics outside completion;
- inherited stable learner IDs;
- retention cadence **1 → 3 → 7 → 14 → 30 → 60 days**.

Historical 25-unit / 70-lesson / 69-mastery / 139-activity values are migration baselines only.

The curriculum uses a **questions-first spiral**. Difficult doctrinal and interpretive questions appear early enough to motivate adult learners, recur where evidence becomes available, and are synthesized only after prerequisite context and interpretive tools are established. Assessment evaluates understanding/reasoning, not personal theological assent.

## Experience / architecture

Top-level Home, Course, Bible, Topics, Practice, and Search use **route-owned generated HTML documents**. Normal top-level navigation uses document navigation; bounded same-route state changes may use History API enhancement.

Do not restore:

- whole-body/broad-subtree `MutationObserver` repair;
- duplicate renderers competing for `#main`;
- render-obsolete-UI-then-relocate/rename flows;
- stacked compatibility runtimes;
- `public/library-system.js`;
- `public/library-system-refinements.css`;
- `public/locked-home.js`;
- `public/locked-library-baseline.css`.

The editable Library First visual baseline remains the default/reference design. End-user experience and learning effectiveness are co-primary; architecture serves the experience.

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

1. executable current-head prelaunch validation;
2. full validation/E2E/accessibility release audit;
3. Cloudflare configuration dry run;
4. D1 migration validation;
5. release-governance gate;
6. generated/fresh `llms.txt` and route documents;
7. real post-deploy cloud Theologian smoke with evidence and guardrail validation;
8. human physical-device, accessibility, editorial/theological nuance, and novice-usability review.

`FEEDBACK_ADMIN_TOKEN` is an operational secret for reviewer-response administration and must never be committed as a plaintext configuration value.

## Human gates

Automated evidence and human-review evidence are distinct. A waiver is not a pass. Security/privacy, data integrity, stable IDs, deterministic generation, theology policy, production target, supersession state, feedback privacy, crisis safety, and retention enforcement are not satisfied merely by a visual/editorial waiver.
