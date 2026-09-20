# Plan Delta — Personal Study Notes, Journal, and Global Feedback

## Status

**Implemented and merged in v7.** The personal-study and feedback work described here shipped in the release merged to `main` at `801a9706d7cec9574ceadca7647a9f63a2b554fc`. The authoritative automated production CI passed before merge, including sync/privacy, feedback persistence, offline, and cross-browser E2E coverage.

Human review of privacy perception, wording, touch/device behavior, and long-term production feedback abuse handling remains continuing QA unless separately evidenced.

## Objective
Restore learner-owned notes and journal writing inside Study Focus and add an always-available feedback entry point across Canonical Shelf without degrading the v5-based experience, offline-first behavior, or theological/assessment boundaries.

## Implemented UX outcomes
- Every lesson/mastery Study Focus surface exposes **Notes & Journal** without covering lesson content.
- Learners can keep a private lesson note and a private journal reflection per activity; both are explicitly unscored.
- Personal writing is local-first, survives reloads, is included in learner export/import, and participates in optional account sync.
- Every primary screen exposes a compact **Feedback** control, including Study Focus.
- Feedback accepts category, message, and optional contact information; route context is attached automatically, without intentional browser fingerprinting or hidden learner-content capture.
- Offline feedback queues locally and is retried when connectivity returns.

## Acceptance criteria — disposition
1. Personal notes/journal available from Unit 0, scored lessons, and mastery screens — **implemented**.
2. Saving personal writing never changes completion, score, mastery, or review schedule — **implemented and regression-tested**.
3. Notes/journal persist locally and merge deterministically across synced devices by latest edit timestamp per activity — **implemented and sync-tested**.
4. Export/import retains personal writing — **implemented through learner-state serialization**.
5. Feedback control reachable from Home, Course, Bible, Topics, Practice, and Study Focus — **implemented and E2E-tested**.
6. Online feedback persists to D1 through bounded `/api/feedback`; offline submissions queue and later flush — **implemented**.
7. Feedback endpoint enforces type/length validation and stores only bounded submitted fields, route, optional authenticated user id, and server timestamp — **implemented and persistence/privacy-tested**.
8. Existing assessment, offline, sync, Guide/Theologian, responsive, and cross-browser tests continue to pass — **passed in the authoritative pre-merge production CI**.

## Execution / WBS — final disposition
- **P1 — personal-data state contract — COMPLETE**
  - `notes` and `journal` maps added to learner state
  - save/persistence helpers and sync merge policy added
  - regression coverage added
- **P2 — lesson personal-study UI — COMPLETE**
  - Study Focus entry control and side panel
  - current-activity binding
  - save/status behavior
  - responsive non-obscuring presentation
- **F1 — global feedback UI — COMPLETE**
  - persistent feedback control and panel
  - online submit + offline queue/flush
- **F2 — feedback persistence — COMPLETE**
  - D1 persistence path
  - validated Worker endpoint
  - feedback validation/persistence/privacy tests
- **V1 — offline/cache + E2E — COMPLETE (automated)**
  - new client modules/styles cached
  - normal routes and Study Focus verified
  - full authoritative CI passed before merge

## Dependency graph
`P1 -> P2 -> V1`

`F2 -> F1 -> V1`

All implementation nodes above are complete in the merged release.

## Risks and controls
- **Private writing accidentally affects scoring:** notes/journal remain separate state fields and are not consumed by assessment-completion logic.
- **Sync conflict data loss:** latest `updatedAt` wins independently for each activity and writing type under the current merge policy.
- **Feedback spam:** bounded payloads and constrained categories are implemented; stronger production abuse controls may be added if traffic warrants them.
- **Privacy:** the client does not intentionally submit automatic name/email, browser fingerprint, or lesson body content; route context and explicitly submitted fields are bounded.
- **Offline loss:** failed feedback is queued locally and retried on `online`.

## Rollback
The client panels and feedback endpoint are additive. A future rollback can remove their UI/modules while retaining additive D1/personal-state fields without corrupting scored learner progress.

## Continuing human assurance
The release is already merged. Remaining review is post-merge quality assurance rather than a statement that implementation is incomplete: verify that Notes & Journal feel private and unobtrusive, Feedback remains reachable without blocking content, Study Focus composition remains strong on physical devices, and wording clearly communicates unscored/private behavior.
