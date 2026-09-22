# Plan Delta — Automatically Generated `llms.txt`

## Objective

Publish a root-level `/llms.txt` that remains synchronized with Canonical Shelf without routine human or agent editing. Treat it as a deterministic derivative of the repository’s substantive content and current runtime artifacts, not as an independent source of truth.

The generated file is intended to contain the complete substantive Canonical Shelf corpus an LLM should know about, including material that is not directly rendered to end users when that material explains the product, curriculum, theology, design, governance, architecture, or current decisions. The complete Berean Standard Bible corpus is the explicit content exclusion.

## Included content

`llms.txt` automatically loads and embeds:

- current primary destinations and route descriptions;
- About-page overview and institutional disclosures, including the Statement of Faith disclosure;
- generated curriculum reference;
- the substantive runtime catalog: courses, units, question threads, curriculum guidance, lessons, current and preserved mastery content, activity placement, Topics, glossary, and retention metadata;
- the unscored Orientation lesson;
- the complete 66-book Canonical Shelf reference library, including categories, book profiles, eras, timeline anchors, themes/threads, and story arc;
- Practice ranks, achievements, stages, levels, game families, and scopes;
- the curated passage library and its translation/theme/context metadata;
- Statement of Faith;
- theology policy and theology-source metadata;
- repository-root Markdown such as `README.md` and `AI_INSTRUCTIONS.md`;
- Markdown documentation under `docs/` that materially preserves product, curriculum, theology, design, governance, architecture, audit, planning, and decision context; and
- semantic `.md`, `.json`, and `.txt` source material under `content/`, excluding vendored legacy snapshots and migration/provenance inputs already represented by current canonical artifacts.

Repository documentation may include historical or superseded material. Source paths are preserved, and explicit decision-precedence/current-baseline documents plus generated runtime artifacts govern conflicts.

## Explicit exclusions

The complete BSB Bible text at `public/data/corpus.txt` is linked but not embedded. The generator also does not ingest secrets, private learner/account/feedback data, dependency trees, transient build output, binary assets, vendored migration snapshots, or implementation-only source code merely because those files exist in the repository.

Curated Scripture passages used as Canonical Shelf learning/reference content remain included because they are substantive site content; the excluded item is the complete BSB reader corpus.

## Outcomes

- Agents can discover the site contract at `/llms.txt` and from `rel="describedby"` in the app shell.
- The document is usable as a self-contained context corpus without requiring an agent to reconstruct lessons, Topics, Practice, book profiles, Orientation, source policy, or current project decisions from scattered files.
- Non-user-facing documentation and semantic source data that materially affect correct understanding are available alongside published content.
- Curriculum/reference counts are read from the generated runtime catalog, so canonical content changes automatically propagate.
- Source documents and runtime artifacts remain authoritative; `llms.txt` republishes them rather than independently authoring policy or theology.
- The full BSB remains discoverable without being duplicated.

## Acceptance criteria

1. `bun run migrate`, `bun run generate:curriculum-reference`, and `bun run generate:llms` deterministically create the current `public/data/curriculum.md` and `public/llms.txt`.
2. Generated counts match `public/data/catalog.json` for courses, units, guided lessons, mastery/capstone activities, scored activities, Topics, and glossary terms.
3. Primary destination links are derived from the actual primary navigation in `public/index.html`.
4. `public/index.html` advertises `/llms.txt` with `<link rel="describedby" href="/llms.txt">`.
5. `llms.txt` embeds the generated curriculum reference, Statement of Faith, theology policy, and theology-source metadata.
6. `llms.txt` embeds the substantive current runtime catalog, Orientation, 66-book library data, Practice data, and curated passage library.
7. `llms.txt` embeds repository-root Markdown, `docs/` Markdown, and eligible semantic source files under `content/` according to the repository-context policy.
8. `README.md`, `AI_INSTRUCTIONS.md`, and `docs/v7/DECISION_PRECEDENCE.md` are mandatory context when present in the repository.
9. The complete BSB corpus is linked but never embedded as a `Source:` content section.
10. `bun run validate:llms` rejects stale output, malformed structure, missing canonical resources/datasets, incomplete Bible/Practice/orientation data, missing required repository context, accidental full-corpus embedding, or discovery-link drift.
11. Normal build/verify/deploy paths regenerate the current curriculum reference and `llms.txt` automatically.
12. Sensitive paths are never selected as repository context.

## Invariants

- Curriculum counts and the current curriculum reference are derived from the canonical generated catalog rather than hard-coded into `llms.txt`.
- Home / Course / Bible / Topics / Practice remain the current primary destinations.
- Bible owns shelf/browse/reader; Topics are reference content and do not count toward completion; Practice is reinforcement.
- The Statement of Faith remains the doctrinal ceiling.
- `llms.txt` is derived output and must not become a second authority for product, curriculum, theology, or governance.
- Runtime-only migration timestamps and implementation provenance are omitted from the embedded catalog representation so identical substantive inputs remain deterministic.
- Historical repository documentation is context; it does not override explicit current-baseline or precedence documents.

## Implementation plan

1. Generate `public/data/curriculum.md` from the current runtime catalog after migration.
2. Maintain a shared generator that reads app navigation, About disclosures, generated public documents, current runtime catalog, and substantive public content modules.
3. Normalize the runtime catalog to substantive fields instead of copying transient migration metadata.
4. Serialize Orientation, Bible-library, Practice, and curated-passage datasets directly from authoritative exports.
5. Recursively include repository-root Markdown, `docs/**/*.md`, and semantic `.md`/`.json`/`.txt` under `content/`, preserving source paths while excluding vendored legacy and migration/provenance directories.
6. Link `/data/corpus.txt` while explicitly excluding it from embedded content.
7. Maintain discovery metadata in the app shell.
8. Wire generation into `prepare:content` and validation into the verification chain.
9. Keep a generated baseline `public/llms.txt` in-repo; content builds rewrite it deterministically.

## Affected systems

- Build/migration pipeline
- Static public assets
- Generated curriculum reference
- Primary HTML shell metadata
- Public learning/reference data modules
- Repository documentation and semantic source corpus
- Production validation/CI command graph
- Generated runtime catalog as a normalized input

## Validation

- Generate twice from the same substantive inputs and require byte-identical output.
- Compare generated output in-memory against `public/llms.txt`.
- Assert one structural H1, summary blockquote, expected H2 sections, and route links.
- Assert catalog counts are represented exactly.
- Assert primary nav routes are represented exactly once.
- Assert the About overview plus all seven disclosure sections are represented.
- Assert every configured embedded resource is non-empty.
- Assert runtime catalog, Orientation, Bible-library, Practice, and curated-passage sections exist.
- Assert exactly 66 Bible book profiles are present and Orientation/Practice/curated-passage datasets are non-empty.
- Assert repository context is non-empty and required baseline files are present.
- Assert selected repository-context paths do not match sensitive-path patterns.
- Assert `/data/corpus.txt` is linked but never emitted as an embedded `Source:` section.
- Assert package scripts run migration → curriculum-reference generation → llms generation before build completion and validation during verification.

## Risks and mitigations

- **Generated catalog absent before migration:** generation fails with an actionable message; build runs migration first.
- **Catalog timestamps break determinism:** only substantive catalog fields are serialized.
- **Important content lives outside the catalog:** Orientation, library, Practice, curated-passage modules, root docs, `docs/`, and semantic `content/` source files are loaded explicitly.
- **Historical documentation creates conflicting instructions:** paths are preserved and the document explicitly tells consumers to apply current decision-precedence/baseline artifacts over historical context.
- **Duplicate canonical/source copies:** duplication is tolerated when it preserves authoritative source context, but runtime artifacts remain the operative current representation.
- **Large discovery artifact:** size is accepted because the purpose is comprehensive context; the multi-megabyte full BSB remains excluded.
- **Theological drift:** theological text is loaded verbatim from canonical published/source artifacts rather than synthesized by the generator.
- **Information leakage:** selection is constrained to substantive content/documentation roots, migration/vendor trees are excluded, and validation rejects sensitive repository paths.

## Rollback

Revert the `llms` generator/validator/documentation changes and regenerate the previous baseline. No learner-state schema or runtime persistence changes are involved.

## Human-review gate

No new theological position or learner-facing interaction is introduced. Human review remains appropriate for the canonical curriculum/theological source documents themselves; the generation path republishes approved content and relevant repository context without changing their meaning.
