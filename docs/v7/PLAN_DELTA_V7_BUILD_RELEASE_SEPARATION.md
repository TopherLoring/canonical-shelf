# Plan Delta — Build / Release Validation Separation

## Objective

Make `bun run build` a deterministic application build that does not require Cloudflare deployment credentials/configuration and is not blocked by release-only validation. Keep the comprehensive validation suite intact under `bun run verify` and the guarded production deployment workflow.

## Implementation / execution

1. Separate ordinary build from release verification and deployment configuration generation.
2. Keep migration, client bundle, auth migration generation, browser bundle, and Worker bundle in `build`.
3. Keep architecture/content/theology/Bible/production/v7 validation plus assessment/sync/D1/feedback/E2E tests in `verify`.
4. Generate `wrangler.jsonc` only for dev/deploy paths that actually have deployment configuration available.
5. Preserve `.github/workflows/deploy-production.yml` as the production deployment path.

## Acceptance criteria

- `bun run build` does not require `D1_DATABASE_ID` or `BETTER_AUTH_URL`.
- `bun run verify` retains the existing validation/test coverage.
- production deployment still requires real Cloudflare/D1 configuration.
- no learner-state, curriculum, UI, theology, content, or runtime behavior changes.

## WBS / typed execution graph

`B0.AUDIT_LOGS -> B1.SEPARATE_BUILD -> B2.VERIFY_CI -> B3.RELEASE_READY`

Rollback: restore the prior `package.json` scripts only. No data migration or runtime rollback is required.
