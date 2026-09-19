# Plan Delta — Personal Study Notes, Journal, and Global Feedback

## Objective
Restore learner-owned notes and journal writing inside Study Focus and add an always-available feedback entry point across Canonical Shelf without degrading the v5-based experience, offline-first behavior, or theological/assessment boundaries.

## UX outcomes
- Every lesson/mastery Study Focus surface exposes **Notes & journal** without covering lesson content.
- Learners can keep a private lesson note and a private journal reflection per activity; both are explicitly unscored.
- Personal writing is local-first, survives reloads, is included in learner export/import, and participates in optional account sync.
- Every screen exposes a compact **Feedback** control, including Study Focus.
- Feedback accepts category, message, and optional contact information; route context is attached automatically, but no fingerprint or hidden personal data is collected.
- Offline feedback queues locally and is retried when connectivity returns.

## Acceptance criteria
1. Personal notes/journal are available from Unit 0, scored lessons, and mastery screens.
2. Saving personal writing never changes completion, score, mastery, or review schedule.
3. Notes/journal persist locally and merge deterministically across synced devices by latest edit timestamp per activity.
4. Export/import retains personal writing.
5. Feedback control is reachable from Home, Course, Bible, Topics, Practice, and Study Focus.
6. Online feedback persists to D1 through a bounded `/api/feedback` endpoint; offline submissions queue and later flush.
7. Feedback endpoint enforces type/length validation and stores only submitted fields, route, optional authenticated user id, and server timestamp.
8. Existing assessment, offline, sync, Guide/Theologian, and responsive tests continue to pass; new regression tests cover the added surfaces.

## Execution / WBS
- P1 — personal-data state contract
  - add `notes` and `journal` maps to learner state
  - add save helpers and sync merge policy
  - extend regression tests
- P2 — lesson personal-study UI
  - static Study Focus control + side panel
  - bind current activity from URL
  - autosave/status behavior
  - responsive non-obscuring presentation
- F1 — global feedback UI
  - persistent feedback control and dialog/panel
  - online submit + offline queue/flush
- F2 — feedback persistence
  - D1 migration
  - validated Worker endpoint
  - endpoint regression coverage where feasible
- V1 — offline/cache + e2e
  - cache new client modules/styles
  - verify all routes and Study Focus
  - run full CI before merge

## Dependency graph
`P1 -> P2 -> V1`

`F2 -> F1 -> V1`

P1/P2 and F1/F2 may proceed independently until V1.

## Risks and controls
- **Private writing accidentally affects scoring:** notes/journal are separate state fields and never consumed by assessment completion logic.
- **Sync conflict data loss:** latest `updatedAt` wins independently for each activity and each writing type.
- **Feedback spam:** bounded payloads, constrained categories, no public read endpoint. Stronger abuse controls can be added if production traffic warrants them.
- **Privacy:** no automatic email, name, IP persistence, browser fingerprint, or lesson content is submitted beyond the current route string.
- **Offline loss:** failed feedback is queued locally and retried on `online`.

## Rollback
Client panels and endpoint are additive. Rollback can remove their UI/modules while retaining the additive D1 table and personal-state fields without corrupting learner progress.

## Human review gates
Before release, verify: notes/journal feel private and unobtrusive; feedback remains reachable without blocking content; Study Focus viewport composition remains intact; wording makes unscored/private status clear.
