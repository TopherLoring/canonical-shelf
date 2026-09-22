# Plan Delta — Automatically Generated `llms.txt`

## Objective

Publish a root-level `/llms.txt` that remains synchronized with Canonical Shelf without routine human or agent editing. Treat it as a deterministic derivative of authoritative public content, not as an independent source of truth.

The generated file is intended to contain the complete substantive user-facing Canonical Shelf corpus available in the repository while intentionally excluding the complete Berean Standard Bible corpus. The full BSB remains available at `/data/corpus.txt` and is linked from `llms.txt`, but it is not duplicated into the discovery document.

## Included content

`llms.txt` automatically loads and embeds:

- current primary destinations and route descriptions;
- About-page overview and institutional disclosures, including the Statement of Faith disclosure;
- generated curriculum reference;
- the substantive learner-facing runtime catalog: courses, units, question threads, curriculum guidance, lessons, current and preserved mastery content, activity placement, Topics, glossary, and retention metadata;
- the unscored Orientation lesson;
- the complete 66-book Canonical Shelf reference library, including categories, book profiles, eras, timeline anchors, themes/threads, and story arc;
- Practice ranks, achievements, stages, levels, game families, and scopes;
- the curated passage library and its translation/theme/context metadata;
- Statement of Faith;
- theology policy; and
- theology-source metadata.

UI implementation code, repeated interface chrome, private learner state, account data, feedback, private APIs, secrets, and generated conversational responses are not content inputs.

## Explicit exclusion

The sole intentionally omitted public content corpus is the complete BSB Bible text at `public/data/corpus.txt`. Curated Scripture passages already used as Canonical Shelf learning/reference content remain part of `llms.txt`; the multi-megabyte full Bible reader corpus does not.

## UX / product outcomes

- Agents can discover the site contract at `/llms.txt` and from `rel="describedby"` in the app shell.
- The document is usable as a self-contained representation of Canonical Shelf’s substantive learner-facing content without requiring an agent to reconstruct lessons, Topics, Practice, book profiles, or Orientation from JavaScript modules.
- Curriculum/reference counts are read from the generated runtime catalog, so changes to canonical content automatically propagate.
- Public source documents remain authoritative; `llms.txt` republishes rather than independently authors them.
- The full BSB is discoverable but not duplicated.

## Acceptance criteria

1. `bun run migrate`, `bun run generate:curriculum-reference`, and `bun run generate:llms` deterministically create the current `public/data/curriculum.md` and `public/llms.txt`.
2. Generated counts match `public/data/catalog.json` for courses, units, guided lessons, mastery/capstone activities, scored activities, Topics, and glossary terms.
3. Primary destination links are derived from the actual primary navigation in `public/index.html`; unknown future destinations still receive a safe generic description.
4. `public/index.html` advertises `/llms.txt` with `<link rel="describedby" href="/llms.txt">`.
5. `llms.txt` embeds the generated curriculum reference, Statement of Faith, theology policy, and theology-source metadata.
6. `llms.txt` embeds the substantive current runtime catalog, Orientation, 66-book library data, Practice data, and curated passage library.
7. The complete BSB corpus is linked but never embedded as a `Source:` content section.
8. `bun run validate:llms` rejects stale output, malformed structure, missing canonical resources/datasets, incomplete Bible/Practice/orientation data, accidental full-corpus embedding, duplicate/invalid route entries, privacy-surface leakage, or discovery-link drift.
9. Normal build/verify/deploy paths regenerate the current curriculum reference and `llms.txt` automatically.
10. No learner state, account data, feedback, secrets, private APIs, or generated theological claims are emitted.

## Invariants

- Curriculum counts and the current curriculum reference are derived from the canonical generated catalog rather than hard-coded into `llms.txt`.
- Home / Course / Bible / Topics / Practice remain the current primary destinations.
- Bible owns shelf/browse/reader; Topics are reference content and do not count toward completion; Practice is reinforcement.
- The Statement of Faith remains the doctrinal ceiling.
- `llms.txt` is derived output and must not become a second authority for product, curriculum, or theology.
- Historical vendored curriculum documentation remains provenance/reference material and is not republished as current learner content.
- Runtime-only migration timestamps and implementation provenance are omitted from the embedded catalog representation so identical substantive inputs remain deterministic.

## Implementation plan

1. Generate `public/data/curriculum.md` from the current runtime catalog after migration.
2. Maintain a shared `llms.txt` generator that reads the app navigation, About disclosures, generated public documents, current runtime catalog, and substantive public content modules.
3. Normalize the runtime catalog to learner-facing fields instead of copying transient migration metadata.
4. Serialize Orientation, Bible-library, Practice, and curated-passage datasets directly from their authoritative exported modules.
5. Link `/data/corpus.txt` while explicitly excluding it from embedded content.
6. Maintain discovery metadata in the app shell.
7. Wire generation into `prepare:content` and validation into the existing verification chain.
8. Keep a generated baseline `public/llms.txt` in-repo; content builds rewrite it deterministically.

## Affected systems

- Build/migration pipeline
- Static public assets
- Generated curriculum reference
- Primary HTML shell metadata
- Public learning/reference data modules
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
- Assert `/data/corpus.txt` is linked but never emitted as an embedded `Source:` section.
- Assert package scripts run migration → curriculum-reference generation → llms generation before build completion and validation during the verification path.

## Risks and mitigations

- **Generated catalog absent before migration:** generation fails with an actionable message; build runs migration first.
- **Catalog timestamps break determinism:** only substantive learner-facing catalog fields are serialized.
- **User-facing content lives outside the catalog:** Orientation, library, Practice, and curated-passage modules are loaded explicitly from their authoritative exports.
- **Large discovery artifact:** size is an accepted consequence of the requirement to expose the complete substantive user-facing corpus; the multi-megabyte full BSB remains excluded.
- **Theological drift:** theological text is loaded verbatim from the published Statement/policy/source artifacts rather than synthesized by the generator.
- **Information leakage:** the input set is limited to public learner-facing datasets/documents; validation retains private API/account/feedback guards.

## Rollback

Revert the `llms` generator/validator/documentation changes and regenerate the previous baseline. No learner-state schema or runtime persistence changes are involved.

## Human-review gate

No new theological position or learner-facing interaction is introduced. Human review remains appropriate for the canonical curriculum/theological source documents themselves; the generation path republishes approved public content without changing its meaning.
