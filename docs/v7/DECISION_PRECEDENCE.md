# v7 Decision Precedence and Conflict Protocol

Status: **current authority**

## Authority

The latest explicit project-owner decision takes precedence over earlier project decisions.

Terms such as **locked**, **frozen**, **invariant**, **approved**, and **canonical** describe the current baseline. They do not make a file or design immutable. A later explicit owner decision may supersede them. Do not introduce branch protection, read-only restrictions, ownership rules, or validators whose purpose is to prevent later approved changes.

When older plans conflict with this document, `AI_INSTRUCTIONS.md`, the current runtime source, or a later dated owner-approved baseline, treat the older plan as historical evidence rather than current authority.

## Conflict protocol

When a new instruction conflicts with an earlier decision, identify the conflict and follow the newer owner instruction. Low-risk visual/editorial changes may proceed after noting the supersession. Changes that materially affect stable learner IDs, learner-state compatibility, schemas/migrations, security/privacy, theological/editorial policy, or the production target require explicit owner confirmation before destructive mutation.

## Current integration baseline

`main` remains the canonical production branch. The active release candidate is **PR #24** (`fix/native-document-first-rendering`). PR #24 is the sole convergence PR for the current release and must absorb current behavior selectively rather than merge stale branches wholesale.

Supersession state:

- **PR #20** — superseded as an independent merge candidate. Its questions-first curriculum intent is already represented through merged PR #21/main and the current #24 runtime/validators.
- **PR #22** — superseded as an implementation. Its Library First/Theologian/cache/live-smoke requirements are preserved natively in #24; its `locked-*`, MutationObserver, and post-render repair layers must not return.
- **PR #23** — superseded as an independent merge candidate. Its complete learner-corpus intent has been selectively absorbed into #24 through `content/learner-content-reachability.json`, `scripts/llms-contract.mjs`, and `scripts/validate-llms.mjs`. Its generated snapshot must not be merged as a parallel authority.

Historical fixed counts of 25 units / 70 guided lessons / 69 mastery / 139 scored activities remain migration baselines only.

The current curriculum target is:

- **6 courses**
- **44 scored units**
- **117 guided lessons**
- **119 mastery/capstone activities**
- **236 scored activities**
- **45 curated Topics** outside completion
- stable inherited lesson/mastery IDs preserved
- visible retention cadence **1 → 3 → 7 → 14 → 30 → 60 days**

The six current courses are:

1. **Bible & Christianity: Foundations**
2. **Israel: Exodus, Covenant, Temple & Prophetic Hope**
3. **From Exile to Jesus: The Second Temple World**
4. **Jesus, the Gospels & the Early Church**
5. **How We Know: Interpretation & Evidence**
6. **Christian Theology, Traditions & Synthesis**

Courses 1–4 form the Biblical Literacy Core. Courses 5–6 deepen interpretation/evidence and theological synthesis.

## Native document-first rendering decision

The current top-level architecture is **route-owned, document-first rendering** rather than SPA-wide destination reconstruction.

- `/home`, `/course`, `/bible`, `/topics`, `/practice`, and `/search` each have a generated HTML document that exposes meaningful route structure before JavaScript enhancement.
- Navigation between different top-level destinations uses normal browser document navigation.
- Query/detail changes within the same destination may use the History API and update that destination's bounded content region without a full reload.
- JavaScript may enhance learner state, selected course/topic/book details, chapter text, practice state, Journal/Feedback, panels, and Theologian answers; it must not render an obsolete surface and repair or relocate core regions afterward.
- Whole-body/broad-subtree `MutationObserver` repair, duplicate renderers competing for `#main`, stacked compatibility runtimes, and corrective CSS layers are not part of the current architecture.
- Generated route documents are deployment artifacts produced by `scripts/generate-route-documents.mjs`; Cloudflare Static Assets uses explicit `html_handling: auto-trailing-slash` so clean route URLs resolve to those documents.
- The service worker caches the route-owned documents and restores the matching route document for offline top-level navigation.

`public/index.html` remains the shared shell source and root/hash-compatibility fallback. Route-specific documents are generated from that shell during build rather than hand-maintained as divergent copies.

## Questions-first curriculum decision

The curriculum uses a **questions-first spiral**. Difficult doctrinal and interpretive questions are introduced early enough to motivate adult learners, then revisited where their biblical and historical evidence naturally appears, investigated with stronger interpretive tools, and synthesized later.

Current recurring question threads include God/Christ, Scripture/trust, sin/salvation/cross, suffering/evil/providence, violence/conquest/slavery, sexuality/LGBTQ interpretation, women/ministry, judgment/hell/resurrection, religions/unevangelized, miracles/history/evidence, Christian disagreement, and law/covenant/ethics.

Course 6 is not the learner's first encounter with difficult questions. It is the synthesis stage. Course 5 is not framed as optional esoteric study; it teaches how evidence and interpretation are evaluated.

Active-study time ranges are planning estimates for first-pass study only. They must not be confused with retained mastery or the spaced-review interval.

## Learning-experience decisions

- Guided lessons are multi-scene learning experiences, not lecture pages.
- Every scored guided lesson includes active learning checks.
- Unit mastery and course capstones are part of the curriculum, not decorative extras.
- Assessment evaluates understanding, evidence use, interpretation, transfer, and reasoning—not personal theological assent.
- Essential understanding cannot be hidden only inside optional drawers.
- Glossary support and deeper contextual/source material remain first-class.
- Topics remain curated reference outside scored completion.
- Practice remains reinforcement rather than a second curriculum.
- Bible owns bookshelf, book profiles, chapters, reader, and Bible-specific study affordances.
- Stable IDs and learner-state compatibility take precedence over convenient renaming of internal identities.

## Current visual / interaction baseline

The approved default/reference experience is the editable library-system baseline in `LIBRARY_SYSTEM_DESIGN_BASELINE_2026-09-21.md`.

- flat default color system; no decorative gradients in the reference theme;
- shared charcoal masthead `#24272d` and secondary/menu charcoal `#31353c`;
- light white/ivory primary reading surfaces, restrained cool-neutral support, sparse antique gilt;
- preserve serif editorial content, sans interface text, mono only for technical metadata;
- no generic SaaS dashboard treatment, oversized hero type, or unnecessary card-within-card nesting;
- `/course` is the Course Catalog;
- Study Focus keeps the dot rail, human-facing course/unit/lesson hierarchy, light lesson reading surface, and attached dark **Session Notes** pane;
- current technical activity/step identifiers remain internal;
- Bible uses the category-colored shelf, hover/focus book-name reveal, first-touch mobile peek, light reader, and attached charcoal **Book Notes** panel;
- Topics use the same light-reference + charcoal-context strategy while remaining a distinct reference product;
- Feedback is available throughout the product;
- profile/account exposes selectable appearance themes;
- alternate themes remain supported and may intentionally use their own palettes.

## Journal and feedback

Journal Notes are private, persistent, unscored learner-owned writing tied to the material being studied. Learner-facing copy should describe the note as tied to the current activity, Bible reading, or Topic rather than expose technical IDs.

Feedback context—route, activity, build/release identity where useful—may be attached internally. Submitted feedback is not a learner-facing history surface unless the owner later changes that decision.

## Statement of Faith authority

The public Canonical Shelf Statement of Faith and doctrinal ceiling is:

`content/statement/statement-of-faith-compact.md`

It is published to `public/data/statement-of-faith.md` and rendered under About. The long-form `content/statement/statement-of-faith-v3.md` is supplemental Theologian context only and must not be presented as the public Statement of Faith or independent doctrinal ceiling.

Agreement with Canonical Shelf's Statement of Faith is not required to use the product, and theological assent is never a scored mastery criterion.

## Theologian authority

**Theologian** is the learner-facing assistant name. Historical Guide naming may remain only in internal compatibility identifiers where changing it would create unnecessary migration risk; learner-facing copy and current documentation should use Theologian.

The conversational Theologian uses **Cloudflare Workers AI** as a synthesis layer and retains the deterministic evidence-aware Theologian as fallback. No model weights are downloaded to the learner.

The guardrail order is:

1. bundled **Berean Standard Bible (BSB)** for Scripture text and quotations;
2. current Canonical Shelf Course, Topics, glossary, Bible/book, and reference content;
3. compact **Statement of Faith** as doctrinal ceiling for Canonical Shelf doctrinal claims;
4. supplemental long-form belief context as lower-authority elaboration;
5. Canonical Shelf theology policy and vetted biblical/historical/linguistic scholarship.

The approved interpretive foundation requires serious attention to the biblical claims that God is love, salvation is grounded in grace rather than human merit, and Jesus identifies love of God and love of neighbor as the greatest commandments through which the rest of the law is understood. Where Christians differ over the conditions, scope, or mechanics of salvation, those interpretations must be presented distinctly rather than treated as settled.

Learner agency is a hard requirement: the Theologian informs, compares, contextualizes, and tests reasoning; it does not pressure the learner to adopt Canonical Shelf doctrine or any competing interpretation. Material translation/interpretive differences must be surfaced, Canonical Shelf's position must be labeled as its position, and evidence-strength distinctions must be preserved without false balance.

Canonical Shelf's LGBTQ position is affirming. The research/evidence layer must also represent serious non-affirming readings accurately and distinguish direct text, historical context, lexical evidence, interpretation, reception history, doctrine, Canonical Shelf position, and application.

The attachment-derived research has been normalized into explicit arguments, evidence states, limits, and an expanded vetted source catalog. Stronger claims from the original research are not repeated as settled fact where the evidence is contested—for example, the runtime may not say that Romans 1 refers only to exploitation/pederasty, that `arsenokoitai` has one certain modern equivalent, that `to'evah` merely means ritual impurity, or that ancient eunuchs map directly onto modern LGBTQ identity.

The active chat may persist locally in the browser so the current conversation remains visible across route changes/reloads until the learner starts a New chat. Canonical Shelf does not persist Theologian conversations server-side or into account sync. The cloud request may include a bounded recent conversation excerpt and an allowlisted study-state summary; Journal text, lesson notes, reflection writing, profile/account identifiers, feedback content, and inferred theological beliefs are excluded. Study-state context is not theological evidence.

## Learner corpus / `llms.txt`

`content/learner-content-reachability.json` owns the current learner-content map and each content family's `llms.txt` disposition.

- learner-facing curriculum/reference/editorial content marked `embed` is generated into `public/llms.txt`;
- the complete BSB corpus is marked `link` and is not duplicated verbatim;
- the supplemental long-form belief document is marked `exclude` so it cannot be mistaken for a public doctrinal authority;
- private learner/account/feedback content and implementation/governance material are excluded.

`public/llms.txt` is generated and freshness-validated. PR #23's generated snapshot is superseded by the #24 generator/manifest contract.

## Production/deployment authority

There is one canonical production Worker target:

`https://the-canonical-shelf.christopherwonder.workers.dev`

Worker name: `the-canonical-shelf`  
D1 database: `canonical-shelf`

Production configuration is generated from `scripts/write-wrangler.mjs`; generated `wrangler.jsonc` is not hand-maintained.

A release is not considered deployed merely because `wrangler deploy` exits successfully. The production workflow must:

1. run prelaunch verification;
2. generate the Wrangler configuration;
3. validate the exact Worker name, canonical origin, clean route-document handling, D1 binding, Workers AI binding, and release SHA;
4. apply D1 migrations;
5. deploy the exact canonical Worker;
6. call `/api/health` and confirm the live release SHA and required bindings;
7. smoke-test direct routes `/`, `/home`, `/course`, `/bible`, `/topics`, `/practice`, and `/search` plus critical generated data resources;
8. perform a real `/api/theologian` cloud request and require a substantive answer, non-empty grounding evidence, the BSB guardrail, and passed guardrail validation.

PR CI also runs a full release audit with assessment, state, cross-browser E2E/accessibility coverage, curriculum/theology validation, native-document validation, convergence/supersession validation, and a Cloudflare dry run. Older deployment plans remain provenance only if they conflict with this contract.

## Human gates

Automated evidence and human-review evidence are distinct. Editorial/theological, novice-usability, responsive/physical-device, and manual-accessibility review may be waived as blockers for prelaunch development only when explicitly recorded. A waiver is not a pass and does not imply public-launch readiness.

Stable-ID, learner-state, security/privacy, data-integrity, deterministic-generation, theology-policy, production-target, and supersession safeguards are not waived by that prelaunch rule.
