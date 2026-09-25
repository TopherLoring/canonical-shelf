# The Canonical Shelf — Agent Guide

<!-- roa:begin roa-agents — GENERATED, do not edit inside this block -->
## Start here (for AI agents)

1. Read `.roa/state.json` first. It is the compact, current source of truth for identity, commands, map, invariants, phase, decisions, and open questions.
2. The latest active decision overrides older documents. Treat anything in `superseded` as history only.
3. Do not act on an open question; ask the owner (Chris).

## Rules for project records

- **Never edit generated files by hand:** `.roa/state.json`, `CHANGELOG.md`, `docs/STATUS.md`, `docs/DECISIONS.md`, and every `<!-- roa:begin -->` block. CI regenerates and rejects hand edits.
- **Never edit or delete files in `.roa/records/`.** They are append-only. Change a decision by recording a new one that supersedes it.
- **Never edit `.roa/manifest.json`** unless the owner explicitly instructs it in the current task.
- Record facts only when the owner has stated them or the work completed them:
  - `node .roa-kit/roa.mjs decide "text" --id slug [--supersedes id] [--why "..."]`
  - `node .roa-kit/roa.mjs ask "question" --id slug [--owner name]`
  - `node .roa-kit/roa.mjs resolve <question-id> "answer" [--decision id]`
  - `node .roa-kit/roa.mjs phase <id> <planned|active|blocked|done|dropped> [--name "..."]`
  - `node .roa-kit/roa.mjs check <id> <open|pass|fail|waived> [--text "..."]`
  - `node .roa-kit/roa.mjs note <added|changed|fixed|removed|security|deprecated> "text"`
- Each command writes a record, regenerates outputs, and stages them. Commit them together with the related work.
- Before pushing: `node .roa-kit/roa.mjs verify`.

## Invariants

- Protestant 66-book canon; Berean Standard Bible is the default text
- Assess understanding and reasoning, never personal theological assent; agreement with the Statement of Faith is never a condition of use
- The curriculum states its published LGBTQ-affirming position openly while presenting other readings accurately; never claim neutrality
- Stable learner and activity IDs are inherited; never renumber or rename them
- Topics sit outside course completion
- Single-document SPA: public/index.html is the only application document
- The design-tokens and layout contracts are the visual authority; public/canonical-shelf.css consumes their generated output
- Pastoral and crisis-adjacent content routes through the Theologian crisis policy
- No streaks, public leaderboards, or peer comparison

## Agent rules

- Chris's current request outranks every document; raise any contradiction explicitly for approve/reject. Only records marked [decision] by Chris bind; [default] and [feedback] records are adjustable
- Run `bun run verify` before opening a pull request
- Never deploy to production without explicit owner instruction in the current task
- Do not merge stale pull requests wholesale; carry forward only named outcomes
- Do not show unreviewed AI-generated exegesis to learners

## Further instructions

- `AI_INSTRUCTIONS.md`
- `docs/v7/DECISION_PRECEDENCE.md`
- `docs/v7/SPA_ARCHITECTURE_2026-09-24.md`
- `docs/VERIFICATION_CONTRACT.md`

## Commands

| Command | Runs |
|---|---|
| `migrate` | `bun scripts/migrate-vendored.mjs && bun scripts/postprocess-v6.mjs && bun scripts/publish-theology.mjs && bun scripts/apply-curriculum-metadata.mjs` |
| `generate:auth-migration` | `bun scripts/generate-auth-migration.mjs` |
| `generate:wrangler` | `bun scripts/write-wrangler.mjs` |
| `generate:curriculum-reference` | `bun scripts/generate-curriculum-reference.mjs` |
| `generate:llms` | `bun scripts/generate-llms.mjs` |
| `prepare:content` | `bun run migrate && bun run data:crossref && bun run generate:curriculum-reference && bun run generate:llms` |
| `verify:bsb` | `bun scripts/bsb-integrity.mjs` |
| `verify:contract` | `bun scripts/verify-product-contract.mjs` |
| `verify:deployment` | `bun scripts/verify-deployment.mjs` |
| `validate:cloudflare` | `bun scripts/validate-cloudflare-config.mjs` |
| `test:assessment` | `bun scripts/test-assessment.mjs` |
| `test:sync` | `bun scripts/test-sync.mjs` |
| `test:d1` | `bun scripts/test-d1-sync.mjs` |
| `test:feedback` | `bun scripts/test-feedback.mjs` |
| `test:theologian` | `bun scripts/test-theologian-cloud.mjs && bun scripts/test-theologian-crisis.mjs` |
| `test:core` | `bun run test:assessment && bun run test:sync && bun run test:d1 && bun run test:feedback && bun run test:theologian` |
| `test:browser` | `playwright test` |
| `test` | `bun run test:core && bun run test:browser` |
| `build:client` | `mkdir -p public/generated && bun build public/account-client.ts --outfile=public/generated/account.js --target=browser --minify` |
| `build:worker` | `bun build worker/index.ts --outdir=.tmp/canonical-shelf-worker --target=browser` |
| `build:runtime` | `bun run build:client && bun run generate:auth-migration && bun build public/bootstrap.js --outdir=.tmp/canonical-shelf-browser --target=browser && bun run build:worker` |
| `build:app` | `bun run prepare:content && bun run build:runtime` |
| `build` | `bun run build:app` |
| `verify` | `bun run build:app && bun run verify:bsb && bun run verify:contract && bun run test:core && bun run test:browser` |
| `serve` | `bun run prepare:content && bun run build:client && bun scripts/serve.mjs` |
| `dev` | `bun run prepare:content && bun run build:client && bun run generate:wrangler && bun run db:migrate:local && wrangler dev` |
| `deploy` | `bun run verify && bun run generate:wrangler && bun run validate:cloudflare && wrangler d1 migrations apply canonical-shelf --remote && wrangler deploy && bun run verify:deployment` |
| `db:migrate:local` | `bun run generate:auth-migration && wrangler d1 migrations apply canonical-shelf --local` |
| `db:migrate:remote` | `bun run generate:auth-migration && wrangler d1 migrations apply canonical-shelf --remote` |
| `data:ingest:bsb` | `bun scripts/ingest-bsb-tsv.mjs` |
| `data:crossref` | `bun scripts/build-crossrefs.mjs` |
| `data:convert:concordance` | `bun scripts/convert-concordance.mjs` |
| `data:generate:apparatus` | `bun scripts/generate-exegetical-apparatus.mjs` |
| `prepare` | `git config core.hooksPath .githooks \|\| true` |
| `roa` | `node .roa-kit/roa.mjs` |
| `roa:verify` | `node .roa-kit/roa.mjs verify` |
<!-- roa:end roa-agents -->
