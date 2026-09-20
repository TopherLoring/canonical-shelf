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

## Current baseline

The current scored curriculum remains 25 units, 70 lessons, 69 mastery activities, and 139 scored activities. Unit 0 remains non-scored and replayable. These are the present baseline because no later instruction has changed the counts; they are not immutable against a future explicit owner decision.

The same rule applies to product structure, navigation, themes, Study Focus, content/editorial direction, assessment design, account/sync behavior, technology choices, and other previously approved decisions.
