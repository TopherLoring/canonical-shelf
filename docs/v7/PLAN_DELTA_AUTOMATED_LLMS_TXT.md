# Plan Delta — Complete generated `llms.txt` user corpus

## Objective

Publish `/llms.txt` as a deterministic, self-contained machine-readable mirror of **all Canonical Shelf content intended to inform or teach the learner**, while excluding the verbatim full Berean Standard Bible corpus.

`llms.txt` remains generated output, not an independent source of truth. It must automatically rebuild from canonical runtime/content sources so new curriculum, Topics, glossary entries, Bible-book metadata, Practice material, curated passage material, Orientation content, institutional disclosures, and theology/editorial material cannot silently fall out of the machine-readable corpus.

The full `public/data/corpus.txt` BSB text is the one explicit content exclusion. Curated BSB excerpts intentionally used in lessons, challenges, Topics, Practice, or the curated passage library remain included because they are learner-facing Canonical Shelf content rather than a duplicate of the complete Bible translation.

## User-facing corpus contract

The generated corpus includes:

1. primary destinations and route descriptions derived from the app shell;
2. About/institutional disclosures;
3. the complete current runtime catalog (`catalog.json`), including courses, units, lessons, mastery/capstones, Topics, glossary, question threads, learning metadata, feedback/challenge content, and stable IDs;
4. generated curriculum reference;
5. Statement of Faith;
6. theology policy and vetted theology/source metadata;
7. unscored Orientation lesson content;
8. Bible-library data: all 66 book profiles plus canonical groups, eras, timeline anchors, story arc, and cross-canon threads;
9. Practice ranks, achievements, stages, levels, scopes, and game-family labels;
10. curated passage library and translation metadata, including intentionally selected BSB excerpts but not the complete BSB corpus;
11. learner-selectable theme names/descriptions.

Implementation/runtime source code, tests, project plans, CI/configuration, private learner state, account data, feedback submissions, secrets, private APIs, and internal-only engineering documentation are not learner corpus content and must not be copied into `llms.txt`.

## Acceptance criteria

1. `bun run prepare:content` deterministically regenerates `public/llms.txt` from current canonical inputs.
2. `public/data/catalog.json` is embedded completely rather than only summarized or linked.
3. Every current Orientation scene is present.
4. All 66 Bible book profiles and supporting library metadata are present.
5. Practice configuration and learner-visible progression labels are present.
6. The curated passage library is present, including curated BSB excerpts and its translation metadata.
7. Current theme names/descriptions are present.
8. Curriculum reference, Statement of Faith, theology policy, theology source metadata, and About disclosures remain present.
9. The full `public/data/corpus.txt` BSB text is linked as a resource but is never embedded.
10. Validation fails when any configured corpus source is empty, stale, missing, or excluded accidentally.
11. Validation explicitly fails if the complete BSB corpus becomes an embedded source.
12. No learner/account/feedback state or private API surface is emitted.

## Invariants

- `llms.txt` is derived output and never becomes an authoring source.
- Statement of Faith remains the doctrinal ceiling.
- Bible owns shelf/browse/reader; Topics remain reference content; Practice remains reinforcement.
- Stable learning IDs and generated catalog ownership are preserved.
- The full BSB corpus remains separately available to the Bible reader/search system but is excluded from `llms.txt` duplication.
- Curated Scripture excerpts embedded in lessons/Topics/Practice/passage data are not removed merely because their translation is BSB.

## Implementation plan

1. Extend the shared llms contract with an explicit user-corpus source registry.
2. Keep text documents verbatim where they are already canonical published artifacts.
3. Serialize structured learner-facing ESM exports into deterministic JSON sections for Orientation, Bible library, Practice, curated passages, and themes.
4. Embed the complete generated runtime catalog verbatim.
5. Keep `corpus.txt` as an explicit linked-only exclusion.
6. Expand validation to assert source coverage, 66-book coverage, Orientation/Practice/curated-passage/theme coverage, complete catalog embedding, and full-BSB exclusion.
7. Regenerate and commit `public/llms.txt` from the new contract.

## Execution plan / WBS

| ID | Work | Depends on | Evidence |
|---|---|---|---|
| LLMS.C1 | Define complete learner-corpus scope and BSB exception | current product/content contracts | this plan |
| LLMS.C2 | Add typed execution graph | LLMS.C1 | `EXECUTION_GRAPH_LLMS_COMPLETE_CORPUS.json` |
| LLMS.C3 | Extend deterministic generator/source registry | LLMS.C1 | `scripts/llms-contract.mjs` |
| LLMS.C4 | Strengthen freshness/coverage/exclusion validation | LLMS.C3 | `scripts/validate-llms.mjs` |
| LLMS.C5 | Regenerate checked-in corpus | LLMS.C3 | `public/llms.txt` |
| LLMS.C6 | Validate build/CI integration and deterministic regeneration | LLMS.C4, LLMS.C5 | `bun run validate:llms`, build/CI |

DAG: `LLMS.C1 → LLMS.C2`; `LLMS.C1 → LLMS.C3 → {LLMS.C4, LLMS.C5} → LLMS.C6`.

## Validation

- Generate twice from identical inputs and require byte-identical output.
- Compare `public/llms.txt` byte-for-byte with `buildLlmsContract().markdown`.
- Assert complete `catalog.json` text is embedded.
- Assert Orientation contains all current scene titles.
- Assert Bible library contains exactly 66 book profiles and all canonical-group metadata.
- Assert Practice source counts match exported ranks/achievements/stages/levels/scopes.
- Assert curated passage count and translation metadata match `verse-data.js` exports.
- Assert theme count/names match `theme.js` exports.
- Assert the configured embedded-resource registry contains no `corpus.txt` entry.
- Assert `/data/corpus.txt` remains linked and explicitly identified as the full BSB exclusion.
- Preserve privacy/API leakage checks.

## Risks and mitigations

- **Large `llms.txt`:** accepted intentionally; completeness is the product requirement. Only the multi-megabyte full Bible corpus remains excluded.
- **Duplicate authored material:** acceptable where the same learner-facing content legitimately exists in canonical published artifacts and runtime catalog; the generator does not synthesize or rewrite it.
- **Structured module drift:** load current ESM exports during generation instead of maintaining hand-copied mirrors.
- **Accidental BSB duplication:** keep `corpus.txt` outside the embedded registry and enforce that rule in validation.
- **Private data leakage:** only deterministic public content sources are eligible; runtime state/accounts/feedback remain outside the registry.

## Rollback

Revert the generator, validator, execution graph, plan, and generated `public/llms.txt`. No learner-state schema, persistence, account, or content-authoring data is modified.

## Human-review gate

No theological or editorial claims are authored by this change. Human review is required only if the source content itself changes; this work republishes existing approved learner-facing content without altering its meaning.
