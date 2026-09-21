# Plan Delta — Automatically Generated `llms.txt`

## Objective

Publish a root-level `/llms.txt` that remains synchronized with Canonical Shelf without routine human or agent editing. Treat it as a deterministic derivative of the application's authoritative route/content data, not as an independent source of truth.

The generated file is intentionally self-contained for the human-readable canonical learning/editorial layer: it automatically loads and embeds the current curriculum reference, Statement of Faith, theology policy, and theology-source metadata during content generation. The large runtime catalog and Scripture corpus remain linked rather than duplicated verbatim.

## UX / product outcomes

- Agents can discover the site contract at `/llms.txt` and from `rel="describedby"` in the app shell.
- The file exposes the five primary destinations and public scholarly/editorial resources without exposing private learner state or internal implementation details.
- Curriculum/reference counts are read from the generated runtime catalog, so changes to canonical content automatically propagate.
- The human-readable curriculum and theological/editorial resources are loaded into `llms.txt` from their published artifacts on every generation pass rather than manually copied.
- The current curriculum reference is generated from the runtime catalog instead of preserving the superseded v4 25-unit reference as the published curriculum document.
- Large machine-readable/runtime assets remain linked to avoid duplicating the runtime catalog and multi-megabyte Scripture corpus inside the discovery document.

## Acceptance criteria

1. `bun run migrate`, `bun run generate:curriculum-reference`, and `bun run generate:llms` deterministically create the current `public/data/curriculum.md` and `public/llms.txt`.
2. Generated counts match `public/data/catalog.json` for courses, units, guided lessons, mastery/capstone activities, scored activities, Topics, and glossary terms.
3. Primary destination links are derived from the actual primary navigation in `public/index.html`; unknown future destinations still receive a safe generic description.
4. `public/index.html` advertises `/llms.txt` with `<link rel="describedby" href="/llms.txt">`.
5. `llms.txt` automatically embeds the generated curriculum reference, Statement of Faith, theology policy, and theology-source metadata from the current published artifacts.
6. The runtime catalog and Bible corpus remain linked and are not duplicated verbatim in `llms.txt`.
7. `bun run validate:llms` rejects stale output, malformed structure, missing canonical resources, empty embedded resources, duplicate/invalid route entries, or discovery-link drift.
8. Normal build/verify/deploy paths generate the current curriculum reference and `llms.txt` automatically.
9. No learner state, account data, feedback, secrets, private APIs, or generated theological claims are emitted.

## Invariants

- Curriculum counts and the current curriculum reference are derived from the canonical generated catalog rather than hard-coded into `llms.txt`. The historical 25-unit / 70-lesson / 69-mastery / 139-activity values remain migration baselines, not ceilings, after the owner-approved six-course curriculum redesign.
- Home / Course / Bible / Topics / Practice remain the current primary destinations.
- Bible owns shelf/browse/reader; Topics are reference content and do not count toward completion; Practice is reinforcement.
- The Statement of Faith remains the doctrinal ceiling.
- `llms.txt` is derived output and must not become a second authority for product, curriculum, or theology.
- Historical vendored curriculum documentation remains provenance/reference material and is not republished as the current curriculum reference.

## Implementation plan

1. Generate `public/data/curriculum.md` from the current runtime catalog after migration.
2. Maintain a shared `llms.txt` generator module that reads `public/index.html`, `public/data/catalog.json`, and the public canonical learning/editorial documents.
3. Derive navigation/resources/counts and render spec-shaped Markdown plus automatically loaded canonical content.
4. Keep large runtime data and the Bible corpus linked rather than embedded.
5. Maintain discovery metadata in the app shell.
6. Wire curriculum-reference generation and `llms.txt` generation into `prepare:content`, with validation in the existing validation chain.
7. Commit a generated baseline `public/llms.txt` so source and deployed artifact remain inspectable in-repo; subsequent content builds rewrite it deterministically.

## Execution plan / WBS

| ID | Work | Depends on | Evidence |
|---|---|---|---|
| P6.CURRICULUM_REFERENCE | Generate current six-course curriculum reference from runtime catalog | current migration/catalog | `scripts/generate-curriculum-reference.mjs`, `public/data/curriculum.md` |
| P6.LLMS_CONTRACT | Define derivation, embedding rules, privacy boundary, resource set, acceptance criteria | existing v7 baseline | this plan + execution graph |
| P6.LLMS_GENERATOR | Implement deterministic generator and baseline output | P6.CURRICULUM_REFERENCE, P6.LLMS_CONTRACT | `scripts/llms-contract.mjs`, `scripts/generate-llms.mjs`, `public/llms.txt` |
| P6.LLMS_DISCOVERY | Advertise the generated contract from HTML | P6.LLMS_CONTRACT | `public/index.html` |
| P6.LLMS_VALIDATION | Validate structure, freshness, embedded canonical content, counts/routes/resources, and discovery metadata | generator + discovery | `scripts/validate-llms.mjs` |
| P6.LLMS_BUILD_GATE | Integrate curriculum-reference generation and llms generation/validation into package scripts | generator + validation | `package.json`, validation pass |

DAG: `P6.CURRICULUM_REFERENCE → P6.LLMS_GENERATOR`; `P6.LLMS_CONTRACT → {P6.LLMS_GENERATOR, P6.LLMS_DISCOVERY} → P6.LLMS_VALIDATION → P6.LLMS_BUILD_GATE`.

## Affected systems

- Build/migration pipeline
- Static public assets
- Generated curriculum reference
- Primary HTML shell metadata
- Production validation/CI command graph
- Generated runtime catalog (read-only input)

## Validation

- Generate twice from the same canonical inputs and require byte-identical output.
- Compare generated output in-memory against `public/llms.txt`.
- Assert one structural H1, summary blockquote, H2 resource sections, and Markdown-list links.
- Assert catalog counts are represented exactly.
- Assert primary nav routes are represented exactly once.
- Assert public linked resources exist after migration.
- Assert every configured embedded resource is non-empty and represented under `## Loaded canonical content`.
- Assert the generated curriculum reference reports the current six-course catalog rather than the historical v4 baseline.
- Assert package scripts run migration → curriculum-reference generation → llms generation before build completion and validation during the full validation path.

## Risks and mitigations

- **Generated catalog absent before migration:** generation fails with an actionable message; build runs migration first.
- **Historical curriculum reference overwrites the current one:** `generate:curriculum-reference` runs immediately after migration and before `generate:llms`.
- **Route parser drift:** validator requires a non-empty primary nav and unique routes; route descriptions have a generic fallback.
- **Large discovery artifact:** only the human-readable canonical curriculum/theology resources are embedded; the runtime catalog and Scripture corpus remain linked.
- **Theological drift:** theological text is loaded verbatim from the published Statement/policy/source artifacts rather than synthesized by the generator.
- **Information leakage:** the resource allowlist contains public navigation and public content artifacts only.

## Rollback

Revert the `P6` files/changes: remove current-curriculum generation and restore the previous `prepare:content`, restore the prior generator/validator and `/llms.txt`, and remove any related documentation changes. No learner-state schema or runtime persistence changes are involved.

## Human-review gate

No new theological position or learner-facing interaction is introduced. Human review remains appropriate for the canonical curriculum/theological source documents themselves; the generation path only republishes approved public content and should not alter its meaning.
