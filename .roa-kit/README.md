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

## Inputs

**Authored (by the owner)**
- `.roa/manifest.json`: name, summary, purpose, audience, status, owner, links, repository map, invariants, agent rules, extra agent docs, conventions, security contact, output toggles. See `schema/manifest.schema.json`. Edited only on explicit owner instruction.
- `.roa/records/*.json`: append-only events, written only through the commands below. See `schema/record.schema.json`.

| Record | Purpose | Command |
|---|---|---|
| decision | A choice that governs the project; may supersede earlier ones | `decide "text" --id slug [--supersedes a,b] [--why "..."]` |
| question | An open question waiting on someone | `ask "question" --id slug [--owner name]` |
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

## Commands

```sh
node .roa-kit/roa.mjs sync [--stage]         # regenerate outputs
node .roa-kit/roa.mjs verify [--base <ref>]  # CI gate
node .roa-kit/roa.mjs state                  # print state.json
```

## Upgrading

Copy a newer kit over `.roa-kit/` (or rerun `install`; it keeps the existing manifest and records), run `sync`, and commit.

## Development

`node test/roa.test.mjs` builds a throwaway repository and exercises every command and failure path.

---
project-roa-kit · version in `VERSION`
