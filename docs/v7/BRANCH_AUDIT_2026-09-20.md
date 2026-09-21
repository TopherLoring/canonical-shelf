# Canonical Shelf — Branch Audit and Cleanup

Date: 2026-09-20

## Purpose

Record the disposition of every non-`main` branch reviewed during the September 20 cleanup, preserve useful information that is not otherwise obvious on `main`, and prevent stale implementation branches from being mistaken for current product direction.

`main` remains the only authoritative product source. A branch name, old PR body, prototype, or historical plan does not override current owner decisions or later merged work.

## Branch disposition

| Branch | Disposition | Evidence / reason |
| --- | --- | --- |
| `curriculum/multicourse-foundations` | **Merged / retire** | The current branch head was merged through PR #10. The six-course curriculum, historical-biblical bridge, current counts, stable-ID policy, and curriculum governance are already represented on `main`. Do not re-merge the branch based on ancestry-only compare output. |
| `experience/restore-v5-parity` | **Merged / retire** | PR #11 merged to `main` on 2026-09-20. The restored Bible, Topics, Practice, Search/Guide, Home, verse library, and learner-facing experience are now current-main provenance. New restoration follow-through must branch from `main`. |
| `fix/learner-feedback-remediation` | **Merged / retire** | PR #14 merged to `main`. Correct-only answer feedback, Study Focus changes, notes/journal placement, preparation/read ordering, citation expansion, responsive fixes, and regression coverage are already current. |
| `fix/v7-visible-shell-restoration` | **Superseded / retire** | PR #7 is an early shell-repair attempt. Later shell work was explicitly rejected as insufficient in PR #8, and the broader restoration was subsequently implemented and merged through PR #11. Do not revive this branch. |
| `fix/v7-visible-shell-restoration-r2` | **Rejected / retire** | PR #8 was explicitly rejected after visual review because it treated the problem as a shell/dashboard restyle instead of the required product-wide experience restoration. Its runtime changes are not authoritative. |
| `production-hardening` | **Superseded / retire** | PR #13 was closed without merge after manual comparison. The functional shell fixes that mattered were already present in the experience-restoration line; remaining deltas were cache/version/accessibility-only or conflicted with newer work. Earlier production-hardening work that was actually accepted remains preserved through its merged commits on `main`. |
| `v7-design-overhaul-prototypes` | **Prototype reference only / retire as delivery branch** | PR #12 explicitly says the branch is a prototype-gate artifact and must not be merged into production. Its interactive composition lab remains useful design research, but later current-main restoration work is authoritative for implementation. |

## Useful information preserved from the prototype branch

The Living Folio exploration contains several durable design observations worth retaining as **reference principles**, not as an unmerged implementation package:

- distinguish **application chrome → scholarly object → contextual apparatus** so the learner can tell navigation, primary study material, and supporting evidence apart;
- protect the primary reading surface from utility density; richer controls and metadata can live at the margins without flattening the study object;
- use motion to communicate **state, progression, or relationship**, not as decoration;
- allow each major surface to express its job rather than forcing identical cards everywhere: Home as orientation/continuation, Course as guided journey, Bible as tactile library/reference reader, Practice as active challenge environment, Topics as authored reference, and Guide/Theologian as an evidence-oriented research surface;
- avoid generic SaaS-dashboard and generic chat-product visual grammar when it weakens Canonical Shelf's scholarly/editorial/tactile identity.

The prototype's specific whole-site palette/composition choices and its requirement to keep production implementation blocked pending three composition alternatives are **historical exploration**, not current governance. Current `main` design intent and later owner decisions take precedence.

## Compare-output warning

Several merged branches still appear `ahead` or `diverged` when compared by Git ancestry because their work entered `main` through squash/merge commits. Branch cleanup must therefore use PR merge history and content-level comparison, not `ahead_by` alone. In particular, the curriculum and learner-feedback branches should not be re-merged merely because Git reports unique branch commits.

## Current cleanup rules

1. Start all new work from `main`.
2. Do not revive rejected or superseded shell/restoration implementations.
3. Use historical branches only as evidence/reference when a current-main capability is missing or a later owner decision explicitly calls for recovery.
4. Preserve stable learner-state IDs, current six-course curriculum authority, local-first/offline behavior, account/sync boundaries, and current theological/editorial safeguards unless explicitly changed.
5. Keep useful historical detail by re-homing it into current documentation or implementation; do not keep stale branches open solely as informal memory.
6. When branch ancestry and merged PR history disagree, inspect the merged PR and current file content before deciding that work is missing.

## Open-PR cleanup

- PR #7: superseded by the later restoration sequence; close without merge.
- PR #12: prototype-only design lab; close as a delivery PR after preserving its useful design observations here. The branch/PR history remains available as research provenance.

No production code is adopted from rejected/superseded branches by this cleanup.
