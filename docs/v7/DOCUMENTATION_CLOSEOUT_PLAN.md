# Canonical Shelf v7 — Documentation Closeout Plan

## Status

**Documentation updates complete; closeout ready to merge.** This branch is documentation-only. Product/runtime behavior remains unchanged.

## Objective
Bring the repository documentation into exact alignment with the v7 release merged to `main` at `801a9706d7cec9574ceadca7647a9f63a2b554fc`, without changing product behavior or source code.

## Product/documentation outcomes
- `README.md` describes v7 as the current application rather than v6.
- Current v7 capabilities are documented: Unit 0 orientation, six aesthetic packages, Study Focus, scholarly apparatus, rich challenge rendering, personal Notes & Journal, global Feedback, local-first/offline behavior, optional sync, and the bounded Guide/Theologian.
- The Theologian is described accurately as the current bounded deterministic/evidence-aware runtime; the richer conversational-model upgrade is explicitly deferred to the next release rather than represented as complete.
- v7 plan/design artifacts distinguish **implemented and merged** work from remaining human-quality review and future work.
- v6 documents are explicitly historical and cannot be mistaken for current release governance.
- Current baseline decisions are described as baselines subject to the owner-precedence protocol, not immutable constraints.

## Acceptance criteria
1. No active/current document states that v6 is the active product.
2. No current v7 document states that the merged release is still isolated on `v7-v5-polish`, awaiting merge, or merely a release candidate.
3. Automated verification is recorded as passed for the release candidate that became merge commit `801a9706...`.
4. Human review items that were not independently evidenced are not falsely marked as passed; they are recorded as continuing quality-assurance work rather than retroactively claimed complete.
5. Notes/Journal and Feedback are represented in current product/state/offline documentation.
6. The merged v7 direction remains v5-led for learner-facing product structure, with v4 used selectively as a scholarly editorial/content-depth reference.
7. Documentation changes do not alter code, learner state, curriculum IDs/counts, theology policy, deployment configuration, or runtime behavior.

## Implementation plan — disposition
- Root README updated to current v7 product/release state — **complete**.
- v7 V5 Polish plan updated from pre-merge language to implementation/merge disposition — **complete**.
- v7 Design Intent artifact updated to post-merge assurance posture — **complete**.
- Personal Study/Feedback delta updated with implementation and verification disposition — **complete**.
- Open-source Assembly delta updated to reflect the actual release choice and future candidate policy — **complete**.
- Typed v7 execution graph updated with release metadata and node dispositions — **complete**.
- v6 README/release-readiness documents marked historical — **complete**.
- Changed documents re-read from the branch and documentation-only scope confirmed — **complete**.
- Documentation-only PR merge back to `main` — **next/final step**.

## Execution plan / WBS
1. **D0 — Inventory — COMPLETE**
2. **D1 — Current-state docs — COMPLETE**
3. **D2 — Historical labeling — COMPLETE**
4. **D3 — Typed graph — COMPLETE**
5. **D4 — Verification — COMPLETE**
6. **D5 — Closeout — READY**

## Dependencies
`D0 -> D1 -> D3 -> D4 -> D5`

`D0 -> D2 -> D4`

The machine-readable graph is `docs/v7/documentation-closeout-graph.json`.

## Risks / controls
- **Rewriting history:** v6 documents are labeled historical rather than silently rewritten as though v7 decisions existed at the time.
- **False assurance claims:** automated CI pass and owner-authorized merge are documented separately from human/device/editorial review evidence.
- **Governance drift:** latest-owner-decision precedence remains authoritative.
- **Scope creep:** documentation-only branch; no product/runtime files are changed.

## Rollback
Revert the documentation-only merge. Product/runtime state remains unchanged throughout this closeout.
