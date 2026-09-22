# Plan Delta — Build / Release Validation Separation

Status: **implemented historical delta; current release authority is `DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md`**

## Objective

Separate deterministic application builds from credentialed Cloudflare deployment configuration. This principle remains active: `bun run build` must not require production Cloudflare/D1 credentials.

## Durable decisions

1. Ordinary application build prepares content and compiles client/browser/Worker runtime without production deployment credentials.
2. Wrangler configuration is generated only for dev/release paths that have the required environment values.
3. Release verification remains stronger than ordinary build verification.
4. `.github/workflows/deploy-production.yml` is the production deployment path.
5. Learner state, curriculum, UI, theology, and content must not be mutated merely to make deployment tooling easier.

## Current superseding release contract

The original delta predated the permanent target-hardening work. Current releases additionally require:

- exact Worker target `the-canonical-shelf`;
- exact canonical origin `https://the-canonical-shelf.christopherwonder.workers.dev`;
- generated Wrangler config validation;
- D1 + Static Assets + Workers AI binding validation;
- release-SHA identity;
- `/api/health` post-deploy proof;
- direct-route smoke checks;
- PR full-release audit + Wrangler dry-run.

See `DEPLOYMENT_CANONICAL_TARGET_2026-09-21.md` for current authority.
