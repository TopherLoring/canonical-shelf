# DECISION_PRECEDENCE.md → project records (2026-09-26)

The hand-written `docs/v7/DECISION_PRECEDENCE.md` (updated 2026-09-24, agent-written from owner approvals) was converted into `.roa/records/`. The file at the same path is now generated from those records. Every statement maps to exactly one record, forbid entry, or owner decision below.

| Old section / statement | Now | Kind |
|---|---|---|
| Authority order | `process.authority-order` (rewritten: owner's current request first) | default |
| "locked / approved / canonical / invariant describe the baseline" | Replaced by record kinds (decision, approval, feedback, default) | kit rule |
| Release convergence: PRs #20, #22, #23, #24 | `process.pull-requests` | default |
| Deployment is a separate explicit action; zero-step Actions runs | `release.deployment` | default |
| Six-course structure | Superseded by owner decision `curriculum.structure` (four modules) | decision |
| Topics outside completion, stable IDs, deterministic assessment, spaced review, questions-first, never assess assent | `curriculum.invariants` | default |
| `canonical-shelf.css` sole visual authority; `tokens.css` retired | Superseded by owner decision `design.authority`; tokens generated from the design-tokens contract | decision |
| Locked visual selection (type, 15px radius, #ffc800, #3e4551, #ffffff, #303136, category colors) | Values in `.roa/values/design-tokens.json`; summary in `ui.current-values` | default |
| Home, Course landing, lesson, Bible, Topics, Practice layouts | `ui.current-values`; open owner feedback on Home, shelf, Bible, Course shelf | default + feedback |
| Theologian lower-right floating launcher; side apparatus in Study Focus | Superseded by owner decision `theologian.ui` (right-edge tab everywhere) | decision |
| Palette packages scholarly-graphite (default), cool-archive, blue-stone, quiet-jewel | Superseded by commit ad97f21; owner feedback `ui.theme.palettes`; default `ui.theme.default` = scholarly-graphite | feedback + default |
| Single-document SPA details | `arch.spa-implementation` (implements owner decision `arch.routing`) | default |
| Generated route documents must not be restored | `manifest.forbid` (home/course/bible/topics/practice.html) | guard |
| Do not restore: MutationObserver repair, duplicate renderers, relocate flows, stacked runtimes | Guard rules (`js-mutation-observer`, `js-head-inject`, others) | guard |
| Do not restore: library-system.js, library-system-refinements.css, locked-home.js, locked-library-baseline.css | `manifest.forbid` | guard |
| Experience and learning effectiveness co-primary | `process.experience-first` | default |
| Statement of Faith public ceiling vs supplemental long form | `doctrine.statement-of-faith` | default, high-stakes |
| Approved interpretive foundation (verbatim) | `doctrine.interpretive-foundation` | default, high-stakes |
| Learner agency is a hard requirement | `theologian.learner-agency` | default, high-stakes |
| Theologian conversation persists locally until New chat | Owner decision `theologian.memory` | decision |
| Theologian cloud request contents and exclusions; no server-side persistence | `theologian.privacy` | default, high-stakes |
| Review snapshot contents; accept-and-normalize; blank explanations valid | Superseded by owner decision `theologian.review` (mandatory reason; two prompts, prior response, screen context) | decision |
| Snapshot exclusions; anonymous routing key; IP never identity; account deletion de-identifies | `feedback.privacy` | default, high-stakes |
| Reviewer responses return to the learner | Owner decision `feedback` (two-way, system message on the Theologian surface) | decision |
| Crisis and pastoral safety policy | `safety.crisis` | default, high-stakes |
| Privacy posture and public policy pages | `privacy.posture` | default, high-stakes |
| Feedback retention periods, enforced in code | `privacy.retention` | default, high-stakes |
| Learner corpus reachability and generated llms.txt | `content.reachability` | default |
| Production target, Worker, D1, release evidence, FEEDBACK_ADMIN_TOKEN | `release.gates` | default |
| Human gates; a waiver is not a pass | `release.human-gates` | default |

Open for Chris: `ratify-high-stakes-policies` (eight high-stakes topics stay enforced as defaults until ratified or changed).
