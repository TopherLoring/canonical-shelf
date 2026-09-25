# Recovered designs — 2026-09-25

Status: **design backlog, not implemented.** These designs existed only in a Gemini chat transcript (2026-09-23/24). They are committed here so they cannot be lost again. Nothing in this file is live; each item names the phase that implements it.

## 1. Audience decision (locked 2026-09-25)

- **Primary learner:** a graduate-level adult who recently came to faith. Eager, analytically sharp, near-zero biblical literacy, carrying prior judgments that no longer fit, anxious that literary nuance means the faith is "made up." This person is the reason the tool exists.
- **Also served:** casual adult learners, and existing Christians / Bible-study groups.
- **Design consequence:** one curriculum. The card deck carries plain language; the Study Desk apparatus carries collegiate depth. Existing Christians use a "prove it to skip" diagnostic rather than a separate track. A group-study mode is a later polish item.

## 2. The epistemic-panic questions (Unit 0 / Topics seed)

Address these up front; they are the primary learner's first crisis.

| The learner asks | The underlying fear | The answer the curriculum teaches |
|---|---|---|
| What is fact vs. allegory or hyperbole? | "If it's not literal history, is it a lie?" | Genre determines the kind of truth claim a text makes. |
| Is prophecy manufactured hindsight? | "Did authors fake predictions?" | Prophecy is primarily forth-telling: covenant prosecution of present injustice, not only prediction. |
| Was Jonah a fable? | "Did a man live in a fish?" | Jonah functions as prophetic satire about ethnocentrism; its point holds under either historical reading. |
| Was Goliath a myth? | "Is this folklore?" | Champion combat is attested in the ancient Near East; the manuscript traditions differ on his height (MT vs. LXX/Qumran). |

## 3. Curriculum architecture

### 3a. Four movements (target top-level structure — Phase 6, after the evidence schema)
1. **Hermeneutics & Canon** — anatomy of the canon, genre, textual criticism and translation, the core proclamation (1 Cor 15:1–8; Mark 1:14–15).
2. **The Hebrew Scriptures & the Near Eastern World** — Genesis 1–3 in ANE context, covenant/treaty form, monarchy and prophetic indictment, commanded-violence texts, wisdom and theodicy.
3. **Second Temple Judaism & the Christ Event** — the Persian/Greek/Hasmonean bridge, fourfold Gospel and the Synoptic problem, John, cross and resurrection, "Reading Somebody Else's Mail" (the letters as occasional correspondence).
4. **Systematic Synthesis, Hard Ethics & Living Practice** — Trinity and Christology, evil and suffering, covenant continuity / anti-supersessionism, difficult texts, new creation.

**Rule:** movements are containers for the existing multi-lesson units (survey lesson + case studies + skill lab). Do not compress units to single lessons; that drops the curriculum from two-semester depth to a one-semester survey. Lesson IDs stay stable so learner progress survives.

### 3b. Low-risk resequencing (Phase 6, can precede the full restructure)
- Move `unit.wisdom` to follow Kings (David/Solomon), so Psalms and Proverbs are read in historical context.
- Distribute `unit.difficult` touchpoints: violence during the Conquest units, sexuality during Paul. Course 6 synthesizes rather than introduces controversies.
- Fold interpretation rules into the first narrative encounter (Genesis) instead of teaching method in the abstract first.
- Add "Reading Somebody Else's Mail" at the start of the letters: author, audience, crisis, then theology.
- Add an interactive prophets-to-kings timeline in `unit.kingdoms-prophets`.
- Compress the Second Temple bridge for the reader who needs "why Rome, why Pharisees, what messianic hope" before Hasmonean detail.

### 3c. Reading replacements (NOT applied — needs content rewrite)
The deleted `scripts/compile-unified-catalog.mjs` overrode these readings at build time. It was never wired into the build, and applying it blindly would have broken the lessons: their step prose discusses the current passage. Change a reading only together with its steps and checks.

| Lesson | Current | Proposed | Reason |
|---|---|---|---|
| c1-bible-languages | Luke 4:16–21 | Nehemiah 8:1–8 | Luke 4 is assigned in three courses |
| library | Luke 1:1–4 | Deuteronomy 30:11–14 | Luke 1:1–4 is shared with gospel-comparison |
| gospel-comparison | Luke 1:1–4 | Mark 1:1 // Matt 1:1 // John 1:1–5 | Same passage as library |
| c3-alexander-hellenization | *none* | Daniel 8:1–8 | **Lesson has no primary reading today (defect).** |
| c3-hasmoneans | *none* | 1 Maccabees 2:19–28 | **Lesson has no primary reading today (defect).** **Not in the Protestant canon or the BSB corpus.** Needs a canonical anchor or an explicit extra-canonical source card. |
| c3-essenes-qumran | *none* | Isaiah 40:1–5 | **Lesson has no primary reading today (defect).** |
| c5-synoptic-problem | Mark 1:1–8 | Mark 2:1–12 // Matt 9:1–8 // Luke 5:17–26 | Needs a true triple-tradition parallel |
| cross-grace | 1 Corinthians 15:1–8 | Romans 3:21–26 | 1 Cor 15:1–8 is reused across courses; Romans 3 absent as a primary reading |
| creeds-reading | 1 Corinthians 15:1–8 | Philippians 2:5–11 | 1 Cor 15:1–8 reused; Phil 2 is the classic early hymn |
| suffering-discernment | Luke 13:1–5 | John 9:1–7 | John narrative underrepresented |
| inclusion-reading | Matthew 22:34–40 | Acts 8:26–39 | Primary text for the inclusion argument |
| communion-table | 1 Corinthians 11:23–34 | Mark 14:22–26 | Institution narrative in Gospel context |

## 4. Game engines

Merged with the ChatGPT learning-evidence plan and the game-types research doc.

| Engine | Merged with | Phase |
|---|---|---|
| Hermeneutic Sieve (route passages to genre rules; explain the category error) | Rule Discovery | 4 |
| Council Simulator (Acts 15 branching decisions) | Branching dilemma scenarios | 4 |
| Synoptic Synopsis (tag additions/omissions across parallels) | — | 4 |
| Text-critical Detective (order witnesses, find where a gloss entered) | — | 4 |
| Epistolary Argument Mapper | Already live (`argument-map` checks). Per-slot option lists are intentional, not a bug. | — |

Guardrails: no streaks, no public leaderboards, no peer ghosts; confidence changes review priority, never the score.

## 5. Editorial style sheet (enforce with a lint in Phase 1b)
- Lowercase pronouns for God (he/him/his).
- **Scripture** for the canon; **scriptures** when generic ("Israel's scriptures").
- **Church** for the universal/historic body; **church** for a congregation or building.
- **BCE/CE** throughout; no BC/AD.
- En-dash for verse ranges: 1 Corinthians 15:1–5.
- Vocabulary terms are display English, never code identifiers (fixed 2026-09-25: 44 camelCase terms).

## 6. Topics expansion backlog (45 → ~115)

Each dossier keeps the seven-part structure: short answer, what that means, important distinction, where Christians disagree, biblical evidence, related topics, course connection. **Deduplicate against the existing 45 before authoring.**

Review flags:
- *Gehenna* — the "garbage dump" explanation is a late, disputed tradition; present it as disputed, not as fact.
- Pastoral topics (anxiety, grief, trauma, addiction, chronic illness) must route through `theologian-crisis-policy.json` and point to professional care.
- Contested topics are taught from the published affirming position while representing other traditions fairly, consistent with the statement of faith.

### 1. Theology & Doctrine (24 Topics)
- God (The Shema & Divine Attributes) — Transcendence, immanence, holiness, aseity, and eternal love.
- The Trinity — One Being (ousia), three Persons (hypostaseis); distinguishing distinction from division.
- The Incarnation — The Word made flesh; fully divine and fully human without confusion or mixture.
- The Holy Spirit — Presence, empowerment, conviction, and fruit in community.
- Creation & Functional Order — Cosmic ordering, purpose, and goodness versus materialism and dualism.
- Human Nature & The Imago Dei — Inherent human dignity, vocation, and relational capacity.
- The Fall & Cosmic Rupture — Alienation from God, systemic corruption, and mortality.
- Sin (Personal, Systemic & Structural) — Missed mark (hamartia), debt, transgression, and systemic oppression.
- Grace (Sola Gratia) — Unmerited divine initiative and reconciliation versus transactional merit.
- Faith & Trust (Pistis) — Relational allegiance and trust versus mere intellectual assent.
- Justification — Declared righteous by grace; the legal and relational declaration.
- Sanctification — The gradual moral and spiritual transformation of habits and desires.
- Atonement: Penal Substitution — Christ bearing the legal curse and penalty of sin.
- Atonement: Christus Victor — The defeat of demonic powers, death, and systemic tyranny.
- Atonement: Moral Influence & Exemplar — The transformative revelation of self-giving divine love.
- Atonement: Recapitulation — Christ as the Second Adam undoing human failure and restoring the human vocation.
- Providence & Divine Sovereignty — God's guidance of history without erasing creaturely freedom.
- Predestination & Election — Corporate purpose, foreknowledge, and human agency.
- The Church (Ecclesia) — The covenant body of Christ, local assembly, and universal fellowship.
- Inspiration of Scripture — God-breathed text operating through human historical authors.
- Biblical Canon & Authority — The historical recognition of authoritative writings.
- The Bodily Resurrection — Physical transformation of the dead; continuity and discontinuity.
- Final Judgment — Moral accountability, justice for victims, and divine rectification.
- New Creation (Cosmic Renewal) — The renewal of the physical heavens and earth versus ethereal escape.

### 2. Biblical Concepts & Major Themes (22 Topics)
- Covenant (Berit) — The binding commitment between God and humanity (Noahic, Abrahamic, Mosaic, Davidic, New).
- The Kingdom of God — God's active reign breaking into present history; the "already and not yet."
- The Temple & Divine Presence — Sacred space from Eden to Tabernacle, Temple, Jesus, the Church, and the New Jerusalem.
- Exile & Diaspora — Geographical displacement, theological alienation, and living faithfully under empire.
- Messiah (Mashiach / Christos) — Anointed offices (king, priest, prophet) and evolving eschatological hopes.
- The Day of the LORD — The prophetic threshold of divine intervention, judgment on injustice, and deliverance.
- The Remnant — The preserved faithful core within a compromised community.
- Sacrifice & Blood — Life given to purify sacred space and avert covenant rupture.
- The Scapegoat (Azazel) — The ritual removal and exile of guilt on the Day of Atonement.
- Shalom (Peace & Wholeness) — Systemic flourishing, justice, and reconciliation beyond the mere absence of conflict.
- Righteousness (Tzedakah) — Relational fidelity, fair dealing, and active vindication of the wronged.
- Justice (Mishpat) — Structural equity, legal impartiality, and protection for the vulnerable.
- Lovingkindness (Chesed) — Unwavering covenant loyalty, mercy, and steadfast devotion.
- The Poor and Vulnerable (The Quartet of Vulnerability) — Widows, orphans, foreigners, and the poor in biblical law.
- Sabbath & Sacred Rest — Resistance to ceaseless economic exploitation; sanctified time as covenant sign.
- The Jubilee — Periodic economic reset: debt cancellation, land return, and slave liberation.
- Sheol, Hades, and the Underworld — Ancient Near Eastern concepts of the grave and shadow existence.
- Gehenna & The Valley of Hinnom — Historical garbage dump, site of child sacrifice, and Jesus' warning of ruin.
- Apocalyptic Literature — Unveiling cosmic reality through symbolic visions during political crisis.
- Wisdom (Chokhmah) — Practical skill in living; observing God's moral order in daily reality.
- Lament & Protest — Honest complaint and grief addressed to God as an authentic act of faith.
- Typology & Recapitulation — Historical patterns repeated and heightened across salvation history.

### 3. Difficult, Contested & Ethical Questions (22 Topics)
- The Problem of Evil (Theodicy) — Moral evil, natural suffering, and the limits of philosophical systems.
- Conquest Warfare & Commanded Violence — Herem warfare in Joshua/Judges, ancient Near Eastern war rhetoric, and the cruciform critique.
- Biblical Slavery & Emancipation — Ancient Near Eastern and Greco-Roman chattel/debt slavery vs. the trajectory toward abolition in Philemon and Galatians.
- Women in Ministry & Leadership — Complementarian versus egalitarian readings of 1 Timothy 2, 1 Corinthians 14, Romans 16, and Junia.
- LGBTQ Identity & Same-Sex Relationships — The affirming hermeneutic, the lexical debates (arsenokoitai, malakoi), ancient pederasty vs. modern mutual covenants.
- Anti-Judaism & Supersessionism — Rejecting the "replacement" myth; Paul's olive tree in Romans 9–11 and historical Christian culpability.
- Christianity and World Religions — Exclusivism, inclusivism, pluralism, and the fate of the unevangelized.
- Hell & Final Punishment: Eternal Conscious Torment — The traditional Augustinian-Dantean model and its textual basis.
- Hell & Final Punishment: Conditional Immortality (Annihilationism) — Destruction of body and soul; death as the wages of sin.
- Hell & Final Punishment: Universal Reconciliation — The restoration of all things (apokatastasis) in patristic and modern theology.
- Millennial Frameworks & The Rapture — Premillennialism, amillennialism, postmillennialism, and 19th-century dispensationalism.
- Biblical Inerrancy vs. Infallibility — The Chicago Statement vs. functional and historical-critical views of inspiration.
- Creation, Evolution & Age of the Earth — Young-earth creationism, old-earth creationism, and evolutionary creation (theistic evolution).
- Miracles & the Modern Worldview — Evaluating supernatural claims in historical-critical and philosophical perspective.
- Satan, Demons & Spiritual Evil — Personal agents, systemic powers, and psychological projections in biblical theology.
- Wealth, Capitalism & Christian Responsibility — Accumulation, stewardship, economic exploitation, and radical sharing.
- Just War, Pacifism & Nonviolence — Christian engagement with military force from early church pacifism to Augustine and Niebuhr.
- Church and State (Political Theology) — The Two Kingdoms, Anabaptist withdrawal, Kuyperian sphere sovereignty, and Christian nationalism.
- Capital Punishment — Retributive justice in the Old Testament vs. mercy and the dignity of life in the New Testament.
- Environmental Stewardship & Ecology — Creation care as an ethical imperative vs. escapist theology.
- Bioethics: Reproductive Ethics & End of Life — The sanctity of life, suffering, medical intervention, and moral agency.
- Divorce and Remarriage — Moses' concession, Jesus' radical challenge, Paul's desertion clause, and pastoral restoration.

### 4. Historical Context, Canon & Manuscripts (16 Topics)
- How the Old Testament Was Compiled — Oral tradition, scribal schools, the Documentary Hypothesis (JEDP), and redaction.
- The Septuagint (LXX) — The Greek translation of Jewish Scriptures, its differences from the Masoretic Text, and its use by New Testament authors.
- The Dead Sea Scrolls (Qumran) — 20th-century manuscript discoveries, textual plurality, and Second Temple sectarianism.
- The Apocrypha / Deuterocanon — The historical status of 1–2 Maccabees, Tobit, Judith, Wisdom, Sirach, and canonical divergence.
- Alexander the Great & Hellenization — Greek cultural hegemony, language, gymnasia, and the Jewish crisis of assimilation.
- The Maccabean Revolt & Hanukkah — Antiochus IV Epiphanes, temple desecration, guerrilla resistance, and Hasmonean kingship.
- The Roman Empire in First-Century Judea — Pax Romana, client kings (Herod), prefects (Pilate), taxation, and imperial military presence.
- Jewish Sects: Pharisees, Sadducees, Essenes, Zealots — Diverse institutional, theological, and socio-economic movements in Jesus' day.
- The Synoptic Problem (Markan Priority & Q) — Triple tradition, literary dependence, and source criticism.
- Authorship and Pseudepigraphy in the Ancient World — Ancient compositional conventions, amanuenses (scribes), and traditional vs. critical attributions.
- Textual Criticism: How Scribes Copied Manuscripts — Uncials, minuscules, accidental errors (homoioteleuton), and deliberate scribal harmonizations.
- Translation Philosophy: Formal vs. Functional Equivalence — Word-for-word (NASB/ESV) vs. thought-for-thought (NIV/NLT) vs. optimal (BSB/CSB).
- Translation Drift: How Latin Shaped Western Theology — Jerome's Vulgate (paenitentiam agite) and Latin shifts on grace, penance, and original sin.
- The Early Creeds: Nicaea (325) and Chalcedon (451) — The historical and philosophical necessity of ecumenical definitions.
- The Great Schism (1054) — The division of Eastern Orthodoxy and Western Catholicism over papal supremacy and the Filioque.
- The Protestant Reformation (1517) — Luther, Calvin, Zwingli, the five solas, and the splintering of Western Christendom.

### 5. Christian Practice, Sacraments & Formation (15 Topics)
- Baptism: Meaning, Mode & Timing — Infant baptism (paedobaptism) vs. believer's baptism (credobaptism); sacramental vs. symbolic views.
- The Lord's Supper / Communion / Eucharist — Transubstantiation, real presence, consubstantiation, and memorialism; open vs. closed tables.
- Prayer: Adoration, Confession, Thanksgiving, Supplication (ACTS) — Sustainable patterns of conversational prayer and the Lord's Prayer.
- Fasting — Spiritual discipline, physical embodiment, hunger for justice, and resistance to consumerism.
- Confession and Repentance (Metanoia) — Intellectual and behavioral turnaround, relational amends, and restitution.
- Forgiveness and Reconciliation — Releasing debt vs. rebuilding trust; establishing safety boundaries after harm.
- Worship & Liturgy — The gathering of the saints, the Christian calendar (Advent, Lent, Easter, Pentecost), and formative liturgy.
- Spiritual Gifts (Charismata) — Leadership, teaching, service, prophecy, and tongues; cessationism vs. continuationism.
- Discipleship & Spiritual Formation — Intentional practices, monastic rhythms (Regula), and character transformation.
- Community & Accountability — Shared life, mutual submission, constructive confrontation, and restoration in the local church.
- Hospitality & Welcome (Philoxenia) — Welcoming the stranger, table fellowship, and practical sanctuary.
- Generosity, Tithing & Stewardship — Old Testament tithes vs. New Testament sacrificial giving and communal sharing.
- Vocation & Work — Faith in the secular workplace; human labor as participation in God's creative order.
- Spiritual Discernment — Distinguishing divine direction, community consensus, personal desire, and wisdom.
- Sabbath Keeping in Modern Life — Unplugging from consumerism, honoring creaturely limits, and delighting in God.

### 6. Pastoral, Existential & Life Questions (16 Topics)
- Anxiety and Mental Health — Clinical depression, anxiety, panic, and medical care vs. spiritual bypassing.
- Grief and Bereavement — Walking through the loss of a spouse, child, or parent without trite theological platitudes.
- Doubt and Deconstruction — Honest intellectual questioning as a path to mature faith rather than infidelity.
- Unanswered Prayer & God's Apparent Silence — When prayers for healing or relief receive no observable answer.
- Religious Trauma and Spiritual Abuse — Identifying coercive spiritual manipulation, authoritarian leadership, and healing from church hurt.
- Loneliness and Isolation — The human need for communion in an atomized, digital society.
- Marriage and Covenant Partnership — Mutual submission, fidelity, grace, and relational endurance.
- Singleness, Celibacy and Dignity — The honor of Christian singleness modeled by Jesus and Paul vs. the idolatry of the nuclear family.
- Sexuality, Desire and Holiness — Bodily integrity, mutual consent, self-giving love, and the sacredness of human intimacy.
- Parenting and Intergenerational Faith — Raising children without religious coercion; nurture and parental humility.
- Aging, Physical Decline and Dementia — Maintaining dignity when the body and cognitive faculties deteriorate; God's memory of the person.
- Chronic Illness and Disability — Dismantling the false link between sickness and personal sin; disabled embodiment in the kingdom.
- Addiction, Recovery and Grace — Substance abuse, behavioral compulsions, 12-step alignment, and community support.
- Workplace Burnout & Overachievement — Restoring identity derived from being loved by God rather than professional productivity.
- Forgiving Yourself — Accepting divine absolution when personal remorse feels insurmountable.
- Finding a Church Community — Practical criteria for evaluating a congregation: healthy leadership, transparency, and authentic practice.

## 7. Killed (do not revive without a new reason)
- Gemini's `reconcile-all.mjs` — never existed.
- Shipping Ollama-generated verse apparatus without human review.
- CBM point penalties, peer ghosts, collective raids, rolling brackets.
- A homemade tagged-template diffing layer (native `<template>` is the view standard).
- "Where to start" reader module (removed 2026-09-25).
