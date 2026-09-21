# Production Worker Target Correction

## Decision

The canonical production Worker is `the-canonical-shelf`, matching `https://the-canonical-shelf.christopherwonder.workers.dev`. The D1 database remains `canonical-shelf`.

## Evidence

- Deployment run 35650554623 passed but Wrangler reported deployment to `https://canonical-shelf.christopherwonder.workers.dev`.
- The requested production hostname loads at its root, but a direct request to `/bible` fails.
- The newly deployed `canonical-shelf` Worker serves `/bible` directly and exposes the restored 66-book shelf.

## Changes

1. Change only the generated Wrangler Worker name to `the-canonical-shelf`.
2. Preserve the D1 database name, bindings, routes, assets, secrets, and authentication URL.
3. Add a release validator for the exact Worker target.
4. Document the canonical production hostname.
5. Run CI, merge, dispatch the guarded production workflow, and verify root plus direct `/bible`.

## Acceptance criteria

- Generated Wrangler configuration names `the-canonical-shelf`.
- D1 still targets database `canonical-shelf`.
- Automated production CI passes.
- Deployment log reports `https://the-canonical-shelf.christopherwonder.workers.dev`.
- Root and direct `/bible` requests load.
- The Bible page shows Canonical Original, “The Canonical Shelf,” and 66 shelf spines.

## Rollback

Revert the target-name commit and redeploy the previous Worker configuration. No database or state migration is introduced.
