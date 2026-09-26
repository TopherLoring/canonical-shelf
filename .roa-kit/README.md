# project-roa-kit

Contract-first project state for any git repository. Every project keeps the same small set of structured records. One zero-dependency script compiles them, plus facts it reads from the repository, into a compact file for AI agents and the standard human documents. CI rejects hand edits, so the documents cannot drift from the data.

## What it produces

| Output | Audience | Source |
|---|---|---|
| `.roa/state.json` | AI agents (read first; a few KB) | manifest + records + repository facts |
| `AGENTS.md` (managed block) | AI agents | manifest + kit rules |
| `README.md` (managed block) | Humans | manifest + repository facts |
| `CONTRIBUTING.md` (managed block) | Contributors | manifest conventions + commands + env names |
| `CHANGELOG.md` | Humans | note, decision, resolution and completed-phase records |
| `docs/STATUS.md` | Humans | phases, checks, open questions, active decisions |
| `docs/DECISIONS.md` | Humans, auditors | full decision log, including superseded decisions |
| `SECURITY.md` | Reporters | `manifest.security` (only when set) |

Managed blocks sit between `<!-- roa:begin ... -->` and `<!-- roa:end ... -->`. Text outside a block is yours and is never touched.

## Authority model

The owner's current request outranks every document. Contradictions are raised explicitly (a `conflict` question) and closed by an owner decision. Per topic, the owner's latest decision is current; previous and prior entries are history and changes or reverts need no reconfirmation. Only owner decisions and in-scope approvals bind; feedback and agent defaults never lock anything. `verify` rejects owner-kind records not attributed to the owner and defaults attributed to the owner.

## Inputs

**Authored (by the owner)**
- `.roa/manifest.json`: name, summary, purpose, audience, status, owner, links, repository map, invariants, agent rules, extra agent docs, conventions, security contact, output toggles. See `schema/manifest.schema.json`. Edited only on explicit owner instruction.
- `.roa/records/*.json`: append-only events, written only through the commands below. See `schema/record.schema.json`.

| Record | Purpose | Command |
|---|---|---|
| decision | Grouped by `--topic`; `--kind decision` (owner statement, binding; latest per topic is current), `approval` (owner yes to a `--scope`d proposal only), `feedback` (owner dislike: adjust, never lock), `default` (agent engineering choice, overridable). `--reverts id` restores an earlier state without retyping | `decide "text" --topic a.b --by name --kind decision [--id slug] [--scope p] [--reverts id] [--why "..."]` |
| question | An open question; `--kind conflict` records an owner request that contradicts a document or decision, with both sides quoted | `ask "question" --id slug [--owner name] [--kind conflict --request .. --source .. --source-text ..]` |
| resolution | Closes a question, optionally linking the decision | `resolve <question-id> "answer" [--decision id]` |
| phase | Work phase status: planned, active, blocked, done, dropped | `phase <id> <status> [--name "..."]` |
| check | Readiness or audit check: open, pass, fail, waived | `check <id> <status> [--text "..."]` |
| note | Changelog entry: added, changed, fixed, removed, security, deprecated | `note <kind> "text"` |

All record commands accept `--date YYYY-MM-DD` (for backfilling history) and `--by name`.

**Derived (never typed by anyone)**: version, license, package scripts, runtime and package manager, languages, CI workflows, environment variable names from `.env.example`-style files, top-level directories, and directories missing from the map.

## Install into a project

```sh
node /path/to/project-roa-kit/roa.mjs install \
  --summary "One line: what it is" \
  --purpose "Why it exists" \
  --audience "Primary users,Secondary users" \
  --owner "Owner Name" [--contact "email"] [--protect]
```

Install copies the kit into `.roa-kit/`, writes the manifest, adds `.githooks/pre-commit`, sets `core.hooksPath` (and a `prepare` script so every `npm/bun install` re-enables the hook), adds `.github/workflows/roa.yml`, generates all outputs, and stages everything for review. `--protect` creates a GitHub ruleset on `main` requiring a pull request and a passing `roa` check (GitHub CLI with admin rights; private repositories need a paid plan).

## Enforcement

1. **Pre-commit hook** regenerates and stages outputs on every commit.
2. **CI (`roa` workflow)** regenerates everything and fails if any generated file differs, if any record was modified or deleted since the base commit, or if a record or the manifest is invalid. The failure message states the exact fix.
3. **Ruleset (optional)** blocks merges to `main` until the check passes.
4. **`AGENTS.md`** tells agents the rules up front, so well-behaved agents never trip CI.

## Contracts

A contract is a typed set of blanks plus the outputs it compiles to. The kit ships definitions in `contracts/`; a project pins a copy in `.roa/contracts/<name>.json` (never edited) and keeps its filled values in `.roa/values/<name>.json` (changed only through commands).

| Contract | Holds | Compiles to |
|---|---|---|
| `design-tokens` | base fonts, lengths, colors, durations, values; themes with aliases and light/dark modes; default theme; contrast pairs | `public/design-tokens.css` (themed custom properties), `docs/contracts/design-tokens.md` |
| `layout` | breakpoints, containers, stacking layers, per-screen grids by breakpoint with overlays (sheet-right, sheet-bottom, drawer-left, hidden) | `public/layout.css`, `docs/contracts/layout.md` |

- **Types** (`lib/types.mjs`): string, text, id, int, number, bool, enum, color, length, duration, url, email, semver, font, css-value; closed objects, maps, lists; min/max/pattern/options/minItems/maxItems/unique.
- **References** (`lib/refs.mjs`): any scalar may be `{"$ref": "path"}` or `{"$ref": "contract:path"}`; missing targets, cycles, and wrong-type references fail.
- **Checks** (`lib/constraints.mjs`): contrast (WCAG, per theme and mode), lessThan, fits, allPlaced, sameKeysAs, uniformKeys, keyOf, ascending, screenLayout. Failures state the computed numbers.
- **Rendering** (`lib/render.mjs`, `lib/views.mjs`, `packs/`): language packs are data; templates support only `{{value}}`, `{{#each}}`, `{{#if}}`; every output renders twice and must match.

## Guards (opt-in)

Add `"guard": {"governed": ["public/"], "allow": [...], "exclude": [...], "browserTests": {"pages": ["/"]}}` and optional `"forbid": [{"pattern" | "file", "message"}]` to the manifest, then run `guard --baseline` once. From then on `verify` fails on any new: `!important`, redeclared contract-owned custom property, raw color that duplicates a token, literal z-index, `MutationObserver`, `<head>` injection, style writes to owned properties, `innerHTML` into layout-owned regions, forbidden pattern or file, or unlisted new file in a governed folder. The baseline may only shrink. `browserTests` generates Playwright specs that compare rendered custom properties and layers against the contracts and check for horizontal overflow at every breakpoint.

## Commands

```sh
node .roa-kit/roa.mjs sync [--stage]                       # regenerate outputs
node .roa-kit/roa.mjs verify [--base <ref>]                # CI gate
node .roa-kit/roa.mjs state                                # print state.json
node .roa-kit/roa.mjs contract list | add <name> --values <file> | upgrade <name>
node .roa-kit/roa.mjs set|add|remove <contract|manifest>.<path> ...
node .roa-kit/roa.mjs impact <contract>.<path>
node .roa-kit/roa.mjs guard [--baseline]
node .roa-kit/roa.mjs import design-tokens --from-css <file.css> --out <values.json>
```

## Upgrading

Run `node /path/to/new/kit/roa.mjs install` in the project. It replaces `.roa-kit/`, keeps the manifest, records, and contract values, and regenerates outputs. From 1.0: existing decisions become `legacy.<id>` topics flagged for provenance review; re-record them with `--topic`, `--kind`, and `--supersedes <old-id>`. Pinned contracts move to a newer kit version only through `contract upgrade <name>`, which first checks that current values satisfy it.

## Development

`node test/all.mjs` runs every suite (279 tests): records and authority, types and paths, references, checks, rendering, contracts and typed edits, both shipped contracts, guards, CSS import round-trip, and the 1.0 upgrade path.

---
project-roa-kit · version in `VERSION`
