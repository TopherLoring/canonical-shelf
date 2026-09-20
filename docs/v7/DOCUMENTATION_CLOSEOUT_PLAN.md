# Canonical Shelf v7 — Documentation Closeout Plan

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
1. No current document states that v6 is the active/current product.
2. No current v7 document states that the merged release is still isolated on `v7-v5-polish`, awaiting merge, or merely a release candidate.
3. Automated verification is recorded as passed for the release candidate that became merge commit `801a9706...`.
4. Human review items that were not independently evidenced are not falsely marked as passed; they are recorded as continuing quality-assurance work rather than retroactively claimed complete.
5. Notes/Journal and Feedback are represented in current product/state/offline documentation.
6. The merged v7 direction remains v5-led for learner-facing product structure, with v4 used selectively as a scholarly editorial/content-depth reference.
7. Documentation changes do not alter code, learner state, curriculum IDs/counts, theology policy, deployment configuration, or runtime behavior.

## Implementation plan
- Update the root README to the current v7 product/release state.
- Update the v7 V5 Polish plan from pre-merge language to implementation/merge disposition and preserve remaining quality work explicitly.
- Update the v7 Design Intent artifact so its human-review section reflects post-merge assurance rather than a pre-release blocker.
- Update the Personal Study/Feedback delta with implementation and verification disposition.
- Update the Open-source Assembly delta to describe the actual release choice: native primitives used for this release; candidates remain available for future use when they materially improve experience.
- Update the typed v7 execution graph with release metadata and node dispositions.
- Mark v6 README/release-readiness documents as historical snapshots superseded by v7.
- Re-read all changed documents from the branch, inspect the diff/PR, then merge documentation-only changes back to `main`.

## Execution plan / WBS
1. **D0 — Inventory**: inspect root README, all `docs/v7/*`, and current v6 release-governance docs for stale release-state language.
2. **D1 — Current-state docs**: update README and v7 decision/design/plan documentation.
3. **D2 — Historical labeling**: mark superseded v6 release documentation as historical without rewriting its historical record.
4. **D3 — Typed graph**: update `docs/v7/project-execution-graph.json` and the documentation-closeout graph with implemented/merged/continuing dispositions.
5. **D4 — Verification**: fetch every changed document from the branch, confirm there are no stale active-v6/pre-merge claims, and open a documentation-only PR.
6. **D5 — Closeout**: merge after document review; verify `main` points to the documentation-closeout merge.

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
