# Canonical Shelf v6 — Optional Account & Cross-Device Sync Contract

Status: implementation contract for `v6`.

## Product rule

Canonical Shelf is guest-first and local-first. Core Bible, Course, Topics, Practice, search, progress, review scheduling, and export/import must work without an account and without a network connection.

Accounts are optional. Their purpose is cross-device continuity, recovery, and authenticated backup. Signing in must never become a prerequisite for the core learning experience.

## Architecture

- IndexedDB remains the authoritative local learner state.
- Local results and reviews are recorded immediately, even while offline.
- Each device has a stable random `deviceId`.
- Syncable learner mutations enter a local outbox with a unique event ID and timestamp.
- The remote service is a replica/recovery surface, not the runtime authority.
- Better Auth 1.7.5 owns identity and sessions.
- Cloudflare D1 stores Better Auth records plus user-scoped learner snapshots and mutation IDs.
- Legacy raw migration records are local-only and must never be uploaded.

## Merge rules

1. Completion is monotonic set union.
2. Mastery `passed` is monotonic true; attempts retain the greatest known aggregate until event-based aggregation replaces snapshots.
3. Review counts retain the greatest known aggregate.
4. Review schedules use the newest activity-specific sync clock; this preserves a later failed-review reset over an older higher stage.
5. Local device identity and local unacknowledged outbox entries survive every merge.
6. Server snapshots never contain `legacyRaw` or a client outbox.
7. Mutation IDs are idempotency keys; duplicate pushes must not duplicate server events.

## Account lifecycle

- Guest mode creates no mandatory remote account.
- A learner may explicitly enable sync and authenticate.
- Anonymous Better Auth sessions may be used only as an intermediate/linkable identity where UX requires it; they are not a substitute for recoverable cross-device credentials.
- Recoverable login methods may include passkeys and verified email/social identity.
- Implicit account linking is disabled; linking requires an authenticated/explicit flow.
- Account deletion must remove learner sync data as well as identity/session records under the final deletion workflow.
- Signing out never deletes local learner progress.

## Security and privacy

- `/api/sync` derives `userId` exclusively from the authenticated server session.
- The client cannot provide or override a user ID.
- Sync responses use `Cache-Control: no-store`.
- D1 writes use prepared statements and transactional `batch()` calls.
- Sync payloads are bounded; the current API accepts at most 500 mutations per push.
- Authentication secrets remain Worker secrets and never enter static assets.
- Remote sync contains only the minimum learner-state data required for continuity.

## Release gates

Before account sync can ship:

- deterministic two-device offline merge tests pass;
- duplicate/replayed mutation tests pass;
- unauthorized cross-user access tests pass;
- account-link and unlink flows are tested;
- offline changes reconcile after reconnect;
- account deletion removes remote learner state;
- sign-out preserves local progress;
- recovery on a fresh device reproduces learner progress and review state;
- sync failures never block local progress recording;
- privacy/export documentation identifies what is local-only vs remotely stored;
- physical mobile-device validation covers sign-in, offline work, reconnect, and second-device recovery.
