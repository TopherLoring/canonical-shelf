# Plan Delta — Pre-launch self-healing gate

## Objective
Make pre-launch validation fast and code-focused so copy, labels, headings, prose, accessibility-only checks, and experience-parity wording do not block seeing or deploying the product during active development.

## Product outcome
- `bun run repair:prelaunch` deterministically regenerates/rebuilds safe derived artifacts.
- `bun run verify:prelaunch` repairs first, then blocks only on code/build/runtime/state integrity plus immutable BSB corpus identity.
- `bun run verify:full` retains exhaustive assessment/sync/feedback/E2E/parity checks for later release readiness.
- `bun run deploy` uses the pre-launch gate during the pre-launch phase.
- CI uses the pre-launch gate so copy/selector churn cannot block product iteration.

## Non-negotiable protected asset
The canonical BSB source is `TopherLoring/the-canonical-shelf@25ea6acd012fb28e1427eb4a5e69e358824e1d96/public/corpus.txt`, Git blob SHA `186fb31859ad8274840aa7a4aca965d813c8f5e1`.

Rules:
1. `content/vendor/legacy/corpus.txt` must hash to that exact Git blob SHA.
2. `public/data/corpus.txt` must be byte-identical to the locked vendor corpus.
3. Repair may copy vendor -> public only.
4. No repair path may rewrite or normalize the locked vendor corpus.

## Blocking pre-launch checks
- application/client/worker compilation;
- deterministic content preparation/migration;
- immutable BSB identity and public-copy equality;
- required runtime/build outputs exist;
- core state/sync/D1/feedback tests;
- Cloudflare configuration/dry-run deploy viability.

## Deferred/non-blocking during pre-launch
- exact labels, headings, CTA text, copy/prose;
- semantic/prose parity assertions;
- accessibility-only failures;
- exhaustive cross-browser copy-sensitive E2E checks;
- human editorial/theological/usability/accessibility gates.

## Self-healing scope
Safe automatic repairs include generated catalog/content, llms.txt, generated account bundle, auth migration, Wrangler config, public BSB copy, and other deterministic build outputs. Ambiguous product behavior, authored curriculum/reference prose, learner state semantics, security/privacy decisions, and the canonical BSB source are never auto-authored.

## Acceptance criteria
1. Pre-launch verify does not invoke copy-sensitive experience parity or exhaustive E2E.
2. Full verification remains available explicitly.
3. A changed public corpus is restored from the locked vendor copy and rechecked.
4. A changed vendor corpus hard-fails and is never repaired automatically.
5. CI and pre-launch deploy run the pre-launch gate.
6. Production/public-launch readiness can still invoke the full gate later.

## Rollback
Revert package/workflow/prelaunch scripts. The canonical BSB source remains untouched throughout.
