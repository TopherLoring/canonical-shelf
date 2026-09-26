# Contributing to The Canonical Shelf

<!-- roa:begin roa-contributing — GENERATED, do not edit inside this block -->
## Workflow

- **commits:** Conventional prefixes: feat, fix, docs, chore, refactor, test, build, ci
- **branches:** Work on a feature branch and open a pull request to main
- **verification:** `bun run verify` must pass (build, contracts, BSB integrity, core and browser tests)
- **deployment:** Production deploy is a separate, explicit owner action

## Project records

Decisions, open questions, phases, checks, and changelog notes live in `.roa/records/` and are append-only. Generated documents are rebuilt from them; never edit those by hand.

```sh
node .roa-kit/roa.mjs decide "What was decided" --topic area.subject --by <owner> --kind decision --why "Reason"
node .roa-kit/roa.mjs note fixed "What changed for users"
node .roa-kit/roa.mjs verify
```

## Environment variables

None declared in an env example file.

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
| `data:fetch` | `bun scripts/fetch-bsb-sources.mjs` |
| `data:build:bsb` | `bun scripts/build-bsb-json.mjs` |
<!-- roa:end roa-contributing -->
