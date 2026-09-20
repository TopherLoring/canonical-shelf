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

The merged release used 25 units, 70 guided lessons, 69 mastery activities, and 139 scored activities. Unit 0 is non-scored and replayable. Those counts are now a **migration baseline only**: on September 19, 2026 the project owner explicitly approved replacing the single-course count ceiling with a six-course curriculum architecture. Existing stable lesson/mastery IDs and learner-state evidence remain compatibility invariants, but new units, lessons, mastery activities, retention activities, and course capstones may be added according to pedagogical need. No arbitrary maximum lesson count per unit applies.

The approved curriculum architecture is:

1. **Bible & Christianity: Foundations** — a rigorous adult-beginner survey that introduces the whole map, including interpretation, textual transmission/translation, theology, practice, traditions, biblical history, and difficult-question methodology.
2. **Israel: Exodus, Covenant, Temple & Prophetic Hope** — the historical-biblical bridge from Egypt/Exodus through Sinai, tabernacle/Ark, sacrifice/priesthood, monarchy/Temple, prophets, exile, restoration, and unresolved hope.
3. **From Exile to Jesus: The Second Temple World** — Persian, Hellenistic, Hasmonean, Herodian, Roman, Jewish institutional, sectarian, apocalyptic, resurrection, and messianic context.
4. **Jesus, the Gospels & the Early Church** — Jesus within first-century Judaism, Gospel witnesses, teaching, passion/resurrection/Ascension, Pentecost, Acts, Paul, Gentile inclusion, and early communities.
5. **Advanced Biblical Interpretation** — textual transmission, translation theory, genre mechanics, intertextuality, Gospel/letter study, and independent interpretation.
6. **Theology, Traditions & Difficult Questions** — deeper doctrine, practice, denominational comparison, contested texts/questions, resurrection, judgment, and final hope.

Courses 1–4 form the Biblical Literacy Core. Courses 5–6 are deeper study. Course 1 previews material developed in all later courses so an adult first approaching the Bible receives essential interpretive and theological equipment near the beginning rather than waiting until advanced study.

### Learning-experience decisions

- Guided lessons are **multi-scene/card experiences**, not single long cards or lecture pages.
- Low friction does not mean low rigor. Core scenes must provide enough context, evidence, vocabulary, relationships, interpretive boundaries, and reasoning for genuine understanding.
- **Game-style active checks are integral to every scored guided lesson.** Unit mastery activities and course synthesis/capstones are integral to the learning process, not optional decoration.
- Spaced review remains visible and uses the 1 → 3 → 7 → 14 → 30 → 60 day sequence unless evidence supports a better interval. Reviews should increasingly test retrieval, relation, interpretation, and transfer rather than simply repeat the original prompt.
- Optional hidden drawers may provide background, deeper explanation, related passages, evidence/source notes, competing interpretations, original-language notes, later reception, and other learner-driven depth. Essential understanding must not be hidden in optional drawers.
- Glossary support is first-class: inline quick definitions, lesson glossary drawers, course glossary, global glossary, and advanced lexical treatment where useful.
- Topics remain curated reference outside scored completion. Practice remains reinforcement rather than a second curriculum. Bible owns the shelf/browse/reader experience.
- Existing strong authored material should be rehomed and preserved rather than rewritten merely to fit the new hierarchy.

Current product direction remains v5-led for learner-facing structure, layout, learning flow, and interaction ambition; v4 is used selectively as a scholarly editorial/content-depth reference rather than as the application baseline.

Current release additions include six aesthetic packages, Study Focus, scholarly apparatus, richer challenge rendering, restored personal Notes & Journal, and global Feedback. The current Guide/Theologian remains the bounded deterministic/evidence-aware implementation; the richer conversational-model upgrade remains a future capability unless separately changed.

The same precedence rule applies to product structure, navigation, themes, Study Focus, content/editorial direction, assessment design, accounts/sync, technology choices, Theologian architecture, release gates, and other previously approved decisions.

## Gate interpretation

Automated CI evidence and human review evidence are distinct. For the merged v7 release, the project owner's explicit merge instruction superseded the earlier rule that all named human gates had to be completed before merge. That supersession does **not** mean those human gates passed; unless separately evidenced, they remain continuing quality-assurance activities.

For the multi-course curriculum redesign, learner-state migration, stable-ID preservation, schema/content integrity, browser/offline behavior, and other automated development-safety checks remain required before pre-launch integration.

On September 20, 2026, the project owner explicitly **waived the named human review gates as blockers for pre-launch development**. Editorial/theological review, novice usability review, responsive/manual-accessibility review, and learning-quality review are therefore deferred rather than passed. They remain required quality work before a public launch unless the owner explicitly changes that requirement later.

Accordingly:

- a pre-launch development merge may proceed after authoritative automated validation passes and rollback/state compatibility remain intact;
- human gates must be recorded as `waived_for_prelaunch_dev` or equivalent, never falsely marked `passed`;
- unresolved human-review findings remain visible in future work and release documentation;
- this waiver does not relax stable-ID, learner-state, security/privacy, data-integrity, or deterministic migration safeguards;
- public-launch readiness is a separate decision and must not be inferred from a pre-launch merge.
