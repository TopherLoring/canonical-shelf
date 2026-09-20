# Plan Delta — Automatically Generated `llms.txt`

## Objective

Publish a root-level `/llms.txt` that remains synchronized with Canonical Shelf without routine human or agent editing. Treat it as a deterministic derivative of the application's authoritative route/content data, not as an independent source of truth.

## UX / product outcomes

- Agents can discover the site contract at `/llms.txt` and from `rel="describedby"` in the app shell.
- The file exposes the five primary destinations and public scholarly/editorial resources without exposing private learner state or internal implementation details.
- Curriculum/reference counts are read from the generated runtime catalog, so changes to canonical content automatically propagate.
- Theological/editorial language is linked to canonical published resources rather than synthesized into new doctrine.

## Acceptance criteria

1. `bun run migrate` followed by `bun run generate:llms` deterministically creates `public/llms.txt`.
2. Generated counts match `public/data/catalog.json` for units, guided lessons, mastery activities, scored activities, and Topics.
3. Primary destination links are derived from the actual primary navigation in `public/index.html`; unknown future destinations still receive a safe generic description.
4. `public/index.html` advertises `/llms.txt` with `<link rel="describedby" href="/llms.txt">`.
5. `bun run validate:llms` rejects stale output, malformed structure, missing canonical resources, duplicate/invalid route entries, or discovery-link drift.
6. Normal build/verify/deploy paths generate and validate `llms.txt` automatically.
7. No learner state, account data, feedback, secrets, private APIs, or generated theological claims are emitted.

## Invariants

- Preserve 25 units, 70 guided lessons, 69 mastery activities, and 139 scored activities unless changed through the canonical curriculum itself.
- Home / Course / Bible / Topics / Practice remain the current primary destinations.
- Bible owns shelf/browse/reader; Topics are reference content and do not count toward completion; Practice is reinforcement.
- The Statement of Faith remains the doctrinal ceiling.
- `llms.txt` is derived output and must not become a second authority for product, curriculum, or theology.

## Implementation plan

1. Add a shared generator module that reads `public/index.html` and `public/data/catalog.json`, derives navigation/resources/counts, and renders spec-shaped Markdown.
2. Add generation and validation entry points.
3. Add discovery metadata to the app shell.
4. Wire generation into `build:app` after migration and validation into the existing validation chain.
5. Commit a generated baseline `public/llms.txt` so source and deployed artifact are inspectable in-repo; subsequent builds rewrite it deterministically.
6. Validate both source consistency and build-path integration.

## Execution plan / WBS

| ID | Work | Depends on | Evidence |
|---|---|---|---|
| P6.LLMS_CONTRACT | Define derivation rules, privacy boundary, resource set, acceptance criteria | existing v7 baseline | this plan + execution graph |
| P6.LLMS_GENERATOR | Implement deterministic generator and baseline output | P6.LLMS_CONTRACT | `scripts/llms-contract.mjs`, `scripts/generate-llms.mjs`, `public/llms.txt` |
| P6.LLMS_DISCOVERY | Advertise the generated contract from HTML | P6.LLMS_CONTRACT | `public/index.html` |
| P6.LLMS_VALIDATION | Validate structure, freshness, canonical counts/routes/resources, and discovery metadata | generator + discovery | `scripts/validate-llms.mjs` |
| P6.LLMS_BUILD_GATE | Integrate generate/validate into package scripts and production validation | generator + validation | `package.json`, validation pass |

DAG: `P6.LLMS_CONTRACT → {P6.LLMS_GENERATOR, P6.LLMS_DISCOVERY} → P6.LLMS_VALIDATION → P6.LLMS_BUILD_GATE`.

## Affected systems

- Build/migration pipeline
- Static public assets
- Primary HTML shell metadata
- Production validation/CI command graph
- Generated runtime catalog (read-only input)

## Validation

- Generate twice and require byte-identical output.
- Compare generated output in-memory against `public/llms.txt`.
- Assert one H1, summary blockquote, H2 resource sections, and Markdown-list links.
- Assert catalog counts are represented exactly.
- Assert primary nav routes are represented exactly once.
- Assert public linked resources exist after migration.
- Assert package scripts run generation before build completion and validation during `validate`/`verify`.

## Risks and mitigations

- **Generated catalog absent before migration:** generation fails with an actionable message; build runs migration first.
- **Route parser drift:** validator requires a non-empty primary nav and unique routes; route descriptions have a generic fallback.
- **Theological drift:** generator only states product-level boundaries and links canonical Statement of Faith/policy resources.
- **Information leakage:** resource allowlist contains public navigation and public content artifacts only.

## Rollback

Revert the `P6` files/changes: remove the generator/validator and `/llms.txt`, remove the `describedby` link, and restore prior package scripts. No learner-state schema or runtime persistence changes are involved.

## Human-review gate

No new theological position or learner-facing interaction is introduced. Human review is appropriate for the wording/resource curation in the generated contract but is not required for correctness of the mechanical generation/validation path.