# Canonical Shelf — Multi-Course Curriculum Architecture

Status: **current structural reference; questions-first refinements are authoritative in `PLAN_DELTA_QUESTIONS_FIRST_SPIRAL.md`**

## Objective

Organize Canonical Shelf as a progressive six-course curriculum while preserving strong authored material, inherited stable activity IDs, local-first learner state, Bible/Topics/Practice ownership boundaries, and an interactive adult-learning experience.

Historical 25-unit / 70-lesson / 69-mastery / 139-activity counts are migration baselines, not current ceilings. Existing inherited lesson/mastery IDs remain stable. New content receives new stable IDs.

## Current curriculum contract

- 6 courses
- 44 scored units
- 117 guided lessons
- 119 mastery/capstone activities
- 236 scored activities
- 45 curated Topics outside completion
- 12 recurring questions-first threads
- 1 → 3 → 7 → 14 → 30 → 60 day spaced-review cadence

Course completion-time ranges describe active first-pass study, not retained mastery.

## Program architecture

### Course 1 — Bible & Christianity: Foundations

A genuine adult-beginner survey that introduces Christianity, the Bible as a library, transmission/translation, interpretation, theology, practice, traditions, the biblical story, and the difficult questions the learner will revisit later.

Units:

1. Christianity in One View
2. What the Bible Is
3. How We Got the Bible
4. How to Read It
5. Theology You Need Before Continuing
6. Christian Practice
7. Christians Do Not All Read the Same Way
8. The Biblical Story in One View
9. Foundations Synthesis

Active-study estimate: 6–8 hours.

### Course 2 — Israel: Exodus, Covenant, Temple & Prophetic Hope

Builds the biblical vocabulary later assumed by the New Testament: Exodus, covenant, law, worship, tabernacle/Ark, sacrifice, monarchy, Temple, prophets, exile, restoration, and hope.

Units:

1. Egypt and Exodus
2. Sinai and Covenant
3. Tabernacle, Ark and Presence
4. Sacrifice, Holiness and Sacred Time
5. Land, Judges and Kings
6. Temple and Kingdom
7. Prophets, Exile and Destruction
8. Restoration and Prophetic Hope

Active-study estimate: 7–10 hours.

### Course 3 — From Exile to Jesus: The Second Temple World

Provides the Persian, Hellenistic, Hasmonean, Herodian, Roman, Jewish institutional, sectarian, apocalyptic, resurrection, and messianic context needed to enter the Gospels responsibly.

Units:

1. After the Exile
2. The Greek World
3. Hasmoneans, Rome and Herod
4. Jewish Life and Jewish Diversity
5. Hope and Expectation
6. Entering the Gospels

Active-study estimate: 5–7 hours.

### Course 4 — Jesus, the Gospels & the Early Church

The four Gospels, Jesus' kingdom and teaching, passion/resurrection/Ascension, Pentecost, Acts, Paul, Gentile inclusion, and early Christian communities.

Units:

1. Four Gospels
2. Jesus and the Kingdom
3. Jesus' Teaching
4. Jesus and Israel's Story
5. Passion and Resurrection
6. Pentecost and the Jerusalem Church
7. Paul and Gentile Inclusion
8. Christianity Begins to Expand

Active-study estimate: 7–10 hours.

Courses 1–4 form the **Biblical Literacy Core**.

### Course 5 — How We Know: Interpretation & Evidence

Develops the tools required to evaluate interpretations rather than framing interpretive method as optional specialist material.

Units:

1. Text, Manuscripts and Transmission
2. Translation
3. Genre
4. Scripture Interpreting Scripture
5. Gospel and Letter Study
6. Building an Interpretation

Active-study estimate: 6–9 hours.

### Course 6 — Christian Theology, Traditions & Synthesis

Synthesizes theology, traditions, contested texts, and difficult questions that were introduced and revisited earlier. It is not the learner's first exposure to those questions.

Units:

1. God and Christ
2. Humanity, Sin and Salvation
3. Providence and Christian Life
4. Church and Practice
5. Christian Traditions
6. Difficult Texts and Questions
7. Resurrection and Final Hope

Active-study estimate: 6–9 hours.

## Questions-first spiral

Adult learners often arrive with questions about God/Christ, Scripture/trust, sin/salvation/cross, suffering/evil, violence/slavery, sexuality/LGBTQ interpretation, women/ministry, judgment/hell/resurrection, religions/unevangelized, miracles/history, Christian disagreement, and law/ethics.

Canonical Shelf surfaces those questions early, gives responsible first-pass orientation, then returns to them as the learner gains:

1. biblical-literacy foundations;
2. Israel's covenant/law/worship/history;
3. Second Temple context;
4. Jesus/early-Church primary-text settings;
5. interpretation/evidence tools;
6. theological synthesis.

The strength of a conclusion should remain proportional to the evidence the learner has learned to evaluate.

See `PLAN_DELTA_QUESTIONS_FIRST_SPIRAL.md` for the current implementation contract and `questions-first-spiral-execution-graph.json` for execution state.

## Lesson experience contract

A guided lesson is a multi-scene learning experience rather than a single long card or lecture page. Scene count follows instructional need. Typical roles include Orient, Read, Explain, Visualize, Compare, Context, Practice, Retention, Reflect, and Continue.

Every scored guided lesson contains meaningful active learning. Multiple-choice is permitted when it fits the objective but is not the default interaction. Other task families include sequencing, matching, sorting, evidence classification, timeline/shelf reconstruction, argument mapping, interpretation distinctions, scenarios, comparison, and synthesis. Rich manipulation requires keyboard/non-drag equivalents.

Essential understanding stays in the core sequence. Optional contextual drawers/Session Notes may provide vocabulary, history, textual/translation material, competing interpretations, sources, later reception, and deeper study without hiding information required to understand or pass the lesson.

## Mastery and retention

- every scored unit has authored unit mastery;
- every course has a cumulative capstone;
- inherited mastery activities remain available under stable IDs;
- retention uses 1 → 3 → 7 → 14 → 30 → 60 days unless later evidence changes it;
- later review should increasingly test relation, interpretation, transfer, and synthesis rather than repeat the original prompt;
- Practice does not count as Course completion;
- skipping does not imply mastery.

## Glossary / reference contract

Vocabulary is layered through inline definitions, lesson/context notes, global glossary/search, Topics, and deeper lexical/source treatment where useful. Topics remain curated reference outside completion. Bible remains the owner of the shelf, books, chapters, reader, and Bible-specific study context.

## Learner-state compatibility

- inherited `lesson:<id>` and `mastery:<id>` identities remain stable;
- course/unit placement is metadata, not learner identity;
- existing completion, review, and mastery evidence remains valid when content is rehomed;
- new mastery is not inferred merely from legacy completion;
- export/import and sync changes must remain deterministic and versioned.

## Current UX outcomes

- `/course` is a six-course Course Catalog;
- no-progress learners can inspect all six courses before beginning;
- returning learners see their selected/current course and Current / Next / Later orientation;
- lessons/mastery enter Study Focus;
- Study Focus uses human-facing identity, dot progress rail, light primary study surface, and attached Session Notes;
- curriculum questions and evidence can link outward to Bible, Topics, Search, and the Theologian without turning those destinations into duplicate curricula.

## Acceptance criteria

1. Six courses and 44 current units are represented in canonical structure/runtime data.
2. 70 inherited lesson IDs and 69 inherited mastery IDs remain resolvable.
3. Current runtime target is 117 guided lessons / 119 mastery+capstones / 236 scored activities.
4. Course 1 explicitly teaches the questions-first learning contract.
5. Courses 2–4 preserve the Exodus-to-early-Church historical/biblical bridge.
6. Course 5 is learner-facing interpretation/evidence training.
7. Course 6 explicitly synthesizes questions encountered earlier.
8. Every scored lesson has active learning; every unit/course has appropriate mastery/synthesis.
9. Topics remain outside completion; Practice remains reinforcement; Bible owns Bible reading.
10. Learner-state migration and stable IDs remain intact.
11. Automated curriculum/content/state/browser/offline/deployment gates pass on the integrated release branch.
12. Human editorial/theological/novice/accessibility review remains separately recorded and is never inferred from automation.

## Rollback

The six-course redesign and questions-first refinements are additive around inherited stable IDs. Rollback must restore a known-good code/catalog release without deleting or rewriting inherited learner progress records.
