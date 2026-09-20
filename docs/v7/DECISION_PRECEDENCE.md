# v7 Decision Precedence and Conflict Protocol

## Authority

The latest explicit project-owner decision takes precedence over earlier project decisions.

Terms such as **locked**, **frozen**, **invariant**, **approved**, and **canonical** describe the current baseline. They do not prevent the project owner from changing that baseline later.

## Conflict protocol

When a new instruction conflicts with an earlier decision, surface the conflict before treating the earlier decision as superseded:

> **Conflict detected**  
> Previous decision: …  
> New instruction: …  
> Impact: …  
> Proceeding with: **new instruction**, unless directed otherwise.

For low-risk conflicts, notify and continue. For conflicts that can materially affect learner state, stable IDs, curriculum counts, migrations, theological/editorial policy, deployment, privacy/security, or data compatibility, stop for explicit confirmation before mutation.

## Current merged baseline

The current canonical branch is `main`. The v7 V5-polish release was merged as `801a9706d7cec9574ceadca7647a9f63a2b554fc` after the authoritative automated production CI passed and the project owner explicitly authorized merge.

The current scored curriculum remains 25 units, 70 lessons, 69 mastery activities, and 139 scored activities. Unit 0 remains non-scored and replayable. These are present baselines because no later instruction has changed the counts; they are not immutable against a future explicit owner decision.

Current product direction is v5-led for learner-facing structure, layout, learning flow, and interaction ambition; v4 is used selectively as a scholarly editorial/content-depth reference rather than as the application baseline.

Current release additions include six aesthetic packages, Study Focus, scholarly apparatus, richer challenge rendering, restored personal Notes & Journal, and global Feedback. The current Guide/Theologian remains the bounded deterministic/evidence-aware implementation; the richer conversational-model upgrade is deferred to the next release.

The same precedence rule applies to product structure, navigation, themes, Study Focus, content/editorial direction, assessment design, accounts/sync, technology choices, Theologian architecture, release gates, and other previously approved decisions.

## Gate interpretation

Automated CI evidence and human review evidence are distinct. For the merged v7 release, the project owner's explicit merge instruction superseded the earlier rule that all named human gates had to be completed before merge. That supersession does **not** mean those human gates passed; unless separately evidenced, they remain continuing quality-assurance activities.
