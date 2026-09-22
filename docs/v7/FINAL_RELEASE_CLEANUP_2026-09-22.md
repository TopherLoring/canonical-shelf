# Final Release Cleanup — PR #24

Date: **2026-09-22**  
Status: **current release-closeout record**

## Purpose

This record captures the final aggressive convergence/cleanup sweep after the native Library First, learner-corpus, Theologian, feedback/review, crisis-safety, and privacy/governance work converged into PR #24.

It does **not** declare PR #24 validated or ready to merge. Executable current-head CI remains a separate release gate.

## Current convergence authority

- `main` remains canonical production.
- PR #24 is the sole active convergence/release candidate.
- PRs #20, #22, and #23 remain superseded provenance and should not be merged independently.
- They should be closed only after #24 receives executable current-head validation.

## Step 7 cleanup results

### 1. Feedback / response review

Current product behavior:

- every Theologian answer exposes **Flag for review** and **Disagree / another interpretation**;
- review context is bounded to the directly relevant question, exact response, visible evidence metadata, route, mode/model, policy version, and validation status;
- Journal/private reflections, unrelated conversation history, inferred beliefs, and account/profile data are excluded;
- feedback/review requests use **accept-and-normalize** semantics rather than rejecting unknown categories/reasons or blank/short explanations.

### 2. Anonymous response routing

Anonymous feedback/reviews can receive reviewer responses without identity disclosure:

- browser holds a random high-entropy identifier;
- server stores only its SHA-256 routing key;
- the same browser can retrieve reviewer responses;
- another browser token cannot retrieve them;
- learner can forget the local link;
- IP address is not the routing identity.

Authenticated feedback may use account identity. Account deletion de-identifies retained feedback by clearing its `user_id`.

Reviewer-response administration is available through the protected `/api/admin/feedback/respond` endpoint. `FEEDBACK_ADMIN_TOKEN` is an operational secret and must not be committed.

### 3. Retention enforcement

The published retention schedule is implemented in D1 cleanup logic and tests:

- open/unresolved feedback: up to 24 months;
- responded/resolved feedback: up to 12 months after response/resolution;
- optional contact information: removed/anonymized within 90 days after response/resolution absent a documented exception;
- pseudonymous routing key expires with its feedback record.

### 4. Theologian crisis / pastoral safety

A deterministic crisis-safety layer executes before ordinary AI generation for credible first-person suicide/self-harm indicators.

Current required behavior:

- 911/local emergency service/emergency department for immediate danger, attempt underway, serious injury, or suspected overdose;
- call/text 988 for U.S. suicide/self-harm/behavioral-health crisis support;
- trusted-person presence and distance from means where relevant;
- pastoral reassurance that doubt, depression, despair, suicidal thoughts, and self-harm do not place the learner beyond God's love, grace, presence, or power;
- prayer and human help treated as compatible;
- trusted pastor/chaplain/clergy/spiritual-director/shared-faith support encouraged;
- prayer offered/provided when requested;
- after prayer, return directly to the safety check.

Prohibited behavior includes shame, hell/divine-punishment/salvation threats, weak-faith framing, prayer-only treatment, guaranteed healing, silent third-party dispatch, IP-based crisis identity, permanent crisis diagnoses/risk labels, or automatic feedback creation from crisis chat.

### 5. Privacy / legal / storage surfaces

Public learner-facing policies now exist at:

- `/privacy.html`
- `/data-retention.html`
- `/storage.html`
- `/terms.html`
- `/safety.html`

The current storage disclosure reflects actual product behavior: first-party auth/security cookies and functional browser storage are used; advertising cookies, advertising pixels, and behavioral analytics trackers are not currently used. A generic “accept all” banner is therefore not presented. Any future nonessential tracking must trigger updated disclosure/consent behavior where required.

### 6. Learner corpus / reachability

`content/learner-content-reachability.json` is now **v3**.

Learner-facing legal/privacy/safety policies and the crisis policy are embedded in generated `llms.txt`. Full BSB remains link-only. Supplemental long-form belief context remains excluded as a standalone public authority. Private learner/account/feedback records and implementation/governance content remain excluded.

### 7. Offline parity

Privacy, retention, storage, Terms, safety, and published crisis-policy resources are included in the service-worker release cache. Offline navigation to public policy pages resolves to those pages rather than generic fallback.

### 8. Authority/docs

Current `AI_INSTRUCTIONS.md`, README, `DECISION_PRECEDENCE.md`, About privacy disclosure, public policies, source policy contracts, and runtime behavior now agree on:

- learner agency;
- bounded response review;
- pseudonymous anonymous replies;
- no IP-based feedback identity;
- deterministic crisis handling;
- pastoral prayer/support boundaries;
- retention periods;
- reachability v3;
- public legal/privacy/safety surfaces.

### 9. New release gate

`scripts/validate-release-governance.mjs` enforces the cross-surface contract and is wired into both `build:verify` and `validate:full`.

The release gate checks, among other things:

- legal/privacy/safety pages and navigation;
- response review actions;
- accept-and-normalize feedback behavior;
- pseudonymous SHA-256 routing and no IP-based routing;
- account-deletion feedback de-identification;
- crisis-policy/runtime requirements;
- retention-policy markers;
- reachability v3 legal/safety families;
- offline cache coverage;
- crisis test inclusion in `test:theologian`.

### 10. Post-deploy verification

`verify-deployment.mjs` now checks:

- public privacy/retention/storage/Terms/safety pages;
- crisis-policy publication;
- legal/safety content in `llms.txt`;
- deterministic `/api/theologian` crisis response;
- ordinary real cloud Theologian synthesis;
- exact release/bindings and route-owned documents.

## Remaining release gates

PR #24 must remain draft until all required executable/human evidence exists:

1. executable current-head prelaunch validation;
2. executable current-head full release audit/E2E/accessibility validation;
3. Cloudflare configuration/dry-run validation;
4. D1 migration validation including feedback migrations 0003/0004;
5. fresh generated `public/llms.txt` and route documents from current sources;
6. physical-device visual review;
7. manual accessibility review;
8. editorial/theological nuance review;
9. novice-usability review.

Only after those gates pass should #20/#22/#23 be closed as superseded, #24 be marked ready, and merge be considered. Deployment follows merge through the canonical production workflow; no deployment is authorized by this document.
