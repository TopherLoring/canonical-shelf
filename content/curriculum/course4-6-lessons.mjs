import {lesson,sequence,match,evidence,drawer} from './helpers.mjs';

export const course4Lessons=[
  lesson({
    id:'c4-sermon-mount',unitId:'c4.teaching',title:'Sermon on the Mount: kingdom life in concentrated form',reading:'Matthew 5:1–12',ref:[40,5,1,12],
    objective:'Locate the Beatitudes and major Sermon themes within Jesus’ kingdom teaching rather than treating isolated sayings as unrelated rules.',
    body:[
      'Matthew 5–7 gathers a sustained body of Jesus’ teaching commonly called the Sermon on the Mount. The opening Beatitudes name people and conditions that do not fit ordinary prestige hierarchies and place them inside the announced blessing of God’s kingdom.',
      'The Sermon moves through Torah, anger, reconciliation, sexuality, truthfulness, enemy-love, generosity, prayer, fasting, wealth, anxiety, judgment, discernment, and doing what Jesus teaches. Individual sayings belong inside that larger moral and theological movement.',
      'Jesus repeatedly presses beyond visible compliance toward motives, relationships, integrity, mercy, and practices shaped by God’s reign. That does not mean historical setting or Torah becomes irrelevant; the argument depends on Israel’s Scriptures and debates about faithful life.',
      'Christian traditions disagree about how the Sermon relates to law, grace, Church, politics, perfection, and ordinary discipleship. Before those debates, the learner should be able to reconstruct what the Sermon actually emphasizes and how its parts connect.'
    ],
    simple:'The Sermon on the Mount is a connected vision of kingdom-shaped life, not a bag of inspirational quotations.',
    vocab:{Beatitudes:'Blessing sayings opening Matthew’s Sermon on the Mount.','Enemy Love':'Jesus’ command to love enemies and pray for persecutors in Matthew 5.','Sermon on the Mount':'Matthew 5–7, a major collection of Jesus’ teaching.'},
    deeper:'The relationship between Matthew’s Sermon and Luke’s Sermon on the Plain is a Synoptic question; Course 5 treats Gospel relationships without requiring a beginner to solve source criticism first.',
    drawers:[
      drawer('Why the Beatitudes are not personality tips','They announce blessing in relation to God’s kingdom and reversal, not a self-improvement list for becoming sufficiently meek or mournful.'),
      drawer('Where the Lord’s Prayer fits','Matthew places the Lord’s Prayer inside teaching about prayer, performance, forgiveness, provision, and God’s reign. The existing prayer lesson develops that practice in detail.')
    ],
    visual:{title:'Sermon movement',text:'Blessing → Torah and relationships → hidden practices → possessions/anxiety → judgment/discernment → hearing and doing'},
    challenges:[
      sequence('Reconstruct the Sermon’s broad movement','Order these broad sections.',['Prayer/fasting/giving','Beatitudes','Hearing and doing','Relationships and Torah'],[1,3,0,2],'The Sermon moves from blessing through ethical teaching and practices toward a concluding call to enact Jesus’ words.'),
      evidence('Read sayings inside the whole','Which two conclusions fit?',['The Sermon connects inward motives and outward relationships.','Every saying should be interpreted without its surrounding argument.','The teaching draws on Israel’s Scriptures.','The Beatitudes are only a list of personality traits to cultivate.'],[0,2],'The Sermon is a connected Jewish teaching discourse about kingdom-shaped life.')
    ]
  }),

  lesson({
    id:'c4-scripture-fulfillment',unitId:'c4.israel-story',title:'Jesus and Scripture: fulfillment is more than prediction',reading:'Matthew 2:13–18',ref:[40,2,13,18],
    objective:'Distinguish direct prediction from typology, quotation, allusion, and narrative rereading when New Testament writers connect Jesus with Israel’s Scriptures.',
    body:[
      'New Testament writers frequently quote and allude to Israel’s Scriptures when presenting Jesus. Some connections involve future-oriented promises, while others reuse an earlier event, image, person, or pattern to interpret a later event.',
      'Matthew 2 provides a useful warning against a one-category model. “Out of Egypt I called my son” comes from Hosea 11, where the earlier context recalls Israel’s past Exodus. Matthew reuses that line in a Jesus narrative, treating Israel’s story as a pattern rather than merely finding a sentence that originally predicted a child’s travel itinerary.',
      'Likewise, Jeremiah’s Rachel-weeping imagery belongs to an earlier setting before Matthew brings it into a new narrative context. The later use can be meaningful Christian interpretation without requiring the claim that the earlier author consciously described every later event in advance.',
      'Course 5 will name these relationships more precisely. For now, the learner should ask two questions every time: What did the earlier passage do in its own context? What is the later writer doing with it here?'
    ],
    simple:'New Testament fulfillment can involve prediction, but it can also involve typology, quotation, allusion, and rereading earlier Scripture through a new event.',
    vocab:{Fulfillment:'Language for bringing Scripture, promise, pattern, or divine purpose to realization; its literary relationship varies by passage.',Typology:'Reading a later person/event as corresponding to an earlier scriptural pattern without requiring simple direct prediction.',Allusion:'An indirect echo or reference to another text.'},
    deeper:'Christian traditions and scholars debate categories such as sensus plenior, typology, figural reading, prophecy, and authorial intention. The essential discipline is to preserve both textual contexts before making a theological synthesis.',
    drawers:[drawer('A two-context habit','Always open the earlier passage and the later passage. A cross-reference label is the start of interpretation, not the end.')],
    challenges:[
      match('Name the relationship','Match the example with the best introductory category.',['Hosea recalls Israel leaving Egypt; Matthew applies it to Jesus','A later writer echoes a phrase without formally quoting it','A prophet explicitly announces a future event'],['Typological/narrative reuse','Allusion','Direct prediction'],[0,1,2],'Different literary relationships should not all be called direct prediction.'),
      evidence('Preserve both contexts','Which two moves are responsible?',['Read the quoted Old Testament passage in its own setting.','Assume “fulfilled” always means the earlier author consciously predicted the exact later event.','Ask what the Gospel writer accomplishes by reusing the text.','Ignore the earlier context because the New Testament has replaced it.'],[0,2],'Responsible Christian intertextual reading keeps both contexts visible.')
    ]
  }),

  lesson({
    id:'c4-passion-passover',unitId:'c4.passion',title:'Passover and the passion: an old liberation story enters a new claim',reading:'Luke 22:14–20',ref:[42,22,14,20],
    objective:'Connect the Last Supper traditions with Passover and covenant language while preserving the Exodus and Jeremiah backgrounds.',
    body:[
      'The passion traditions occur in the world of Jewish festival practice, and the Synoptic Gospels frame the final meal in relation to Passover. The learner now brings Course 2’s Exodus memory into the scene rather than encountering Passover as an unexplained Christian word.',
      'Jesus interprets bread and cup in relation to his body and covenant blood. Luke’s wording also evokes “new covenant” language, connecting the meal with prophetic restoration themes such as Jeremiah 31 as well as with sacrifice and covenant imagery.',
      'The Gospels and Paul preserve related but not identical meal traditions. Careful comparison matters. The Christian practice later called Communion/Eucharist/Lord’s Supper grows from these traditions and from early communal meals, not from one isolated proof text.',
      'Christian interpretation can see Jesus’ death through Passover, covenant, sacrifice, and liberation patterns while still recognizing Passover as a living Jewish festival with meanings not exhausted by Christian use.'
    ],
    simple:'The Last Supper draws on Passover and covenant memory; Christian interpretation adds a claim about Jesus without erasing the Jewish story underneath it.',
    vocab:{'Last Supper':'Traditional name for Jesus’ final meal with disciples before the crucifixion.','Covenant Blood':'Language linking blood with covenant ratification or relationship in biblical texts.',Eucharist:'A traditional Christian name for Communion/Lord’s Supper, from a Greek word associated with thanksgiving.'},
    deeper:'The chronology and festival framing differ in important ways across the Gospels, especially between John and the Synoptics. Course 5’s Gospel-comparison tools help learners examine those differences without premature harmonization.',
    drawers:[drawer('Passover is not merely “the Christian prequel”','Jewish Passover continues as Jewish worship and memory. Christian typology is a Christian interpretive claim, not a reason to deny Jewish meaning or practice.')],
    challenges:[
      match('Bring the earlier courses forward','Match the passion element to its earlier background.',['Passover','New covenant','Shared meal proclamation'],['Exodus/liberation memory','Jeremiah’s restoration promise','Later Communion tradition'],[0,1,2],'The meal gathers several biblical trajectories without making them identical.'),
      evidence('Connect without erasing','Select the two responsible conclusions.',['Passover provides important context for the meal traditions.','Christian use makes Jewish Passover meaningless.','New-covenant language has a prophetic background before Luke uses it.','All four Gospels narrate the meal chronology identically.'],[0,2],'The connection is historically and theologically rich without erasing difference.')
    ]
  }),

  lesson({
    id:'c4-ascension',unitId:'c4.passion',title:'Ascension: resurrection leads into mission and reign',reading:'Acts 1:1–11',ref:[44,1,1,11],
    objective:'Explain the Ascension as a transition between resurrection appearances, divine reign, Spirit expectation, and the Church’s mission.',
    body:[
      'Acts begins by connecting itself with the Gospel story and describing a period of resurrection appearances before Jesus is taken from the disciples’ sight. The Ascension is therefore not an optional epilogue after resurrection; it forms the hinge into Acts.',
      'The disciples ask about restoring the kingdom to Israel. Jesus does not give them a timetable. Instead, the narrative redirects attention toward the promised Spirit and a widening witness from Jerusalem outward.',
      'Cloud and heavenly imagery draw on biblical language of divine presence and exaltation. Later Christian theology speaks of Christ’s reign and session at God’s right hand, but Acts 1 itself should first be read as narrative transition and commission.',
      'The scene also sets up Pentecost. The disciples are told to wait for the Spirit rather than launch the mission through their own timetable or power.'
    ],
    simple:'Ascension connects the risen Jesus with divine reign and turns the narrative toward Spirit-empowered mission rather than an end-times timetable.',
    vocab:{Ascension:'Jesus being taken from the disciples’ sight after the resurrection appearances in Luke-Acts.',Witness:'A person who testifies; Acts uses witness language for the expanding mission.',Exaltation:'Language for Jesus being raised to divine honor and rule.'},
    deeper:'Different New Testament texts express resurrection, exaltation, heavenly session, and Ascension with different narrative and theological emphases. They should be compared rather than forced into one flat chronology without examination.',
    drawers:[drawer('Why the kingdom question matters','Acts opens with an Israel-restoration question and then narrates mission through Jerusalem, Judea/Samaria, and outward. That movement belongs to the book’s theology of mission.')],
    challenges:[
      sequence('From resurrection to mission','Order the Acts 1 movement.',['Promise of Spirit-empowered witness','Resurrection appearances','Ascension','Waiting in Jerusalem'],[1,0,2,3],'Acts connects resurrection testimony, mission promise, Ascension, and waiting for the Spirit.'),
      evidence('Timetable or commission?','Which two conclusions fit?',['Jesus gives the disciples a precise restoration timetable.','The mission is linked with the coming Spirit.','Ascension functions as a bridge into Acts.','The disciples are told to ignore Jerusalem and begin in Rome.'],[1,2],'The text redirects timing questions toward Spirit-empowered witness.')
    ]
  }),

  lesson({
    id:'c4-pentecost',unitId:'c4.pentecost',title:'Pentecost: Spirit, festival, languages, and mission',reading:'Acts 2:1–13',ref:[44,2,1,13],
    objective:'Interpret Pentecost within the Jewish festival of Weeks and trace how Spirit, languages, diaspora, and mission converge in Acts 2.',
    body:[
      'Pentecost is the Greek-derived name associated with the Jewish festival of Weeks. Acts 2 therefore begins during an existing Jewish pilgrimage festival, not with the invention of a new Christian date. Course 2’s sacred calendar now explains why people from many regions are gathered in Jerusalem.',
      'The narrative describes Spirit, wind/fire imagery, speech in other languages, and a multilingual audience. The emphasis is communication across difference rather than a private spiritual spectacle detached from mission.',
      'The list of peoples and regions evokes diaspora geography. The movement anticipates Acts’ widening story: Jerusalem is a starting point from which witness will cross linguistic, ethnic, and geographic boundaries.',
      'Christians differ about how Pentecost relates to later experiences of Spirit, charismatic gifts, baptism in the Spirit, and church order. The core lesson first establishes what Acts 2 narrates before those theological systems are compared.'
    ],
    simple:'Pentecost takes place at a Jewish festival and links the Spirit with multilingual witness and the outward movement of the early Church.',
    vocab:{Pentecost:'Greek-derived name associated with the Jewish festival of Weeks; in Acts 2, the setting of the Spirit’s coming.',Diaspora:'Communities living outside an ancestral homeland; Acts’ audience list reflects a wide Jewish geography.','Holy Spirit':'In Christian Scripture and doctrine, the Spirit of God; Course 6 develops theological formulations in greater depth.'},
    deeper:'Acts 2 has generated major theological debates about gifts and ecclesiology. Those debates should not be imported into every narrative detail before the passage’s literary movement is understood.',
    drawers:[drawer('Why Course 2 matters here','Without Israel’s festival calendar, “Pentecost” can sound like a purely Christian event name. The earlier course supplies the Jewish sacred-time context that Acts assumes.')],
    visual:{title:'Festival becomes mission scene',text:'Weeks/Pentecost pilgrimage → Jerusalem gathering → Spirit/languages → diaspora hearers → widening witness'},
    challenges:[
      match('Connect the layers','Match each feature with its significance.',['Pentecost/Weeks','Many languages','Diaspora audience'],['Jewish festival setting','Communication across linguistic difference','Geographic breadth'],[0,1,2],'Acts coordinates festival, language, and geography.'),
      evidence('Narrative before system','Which two statements are supported?',['Pentecost already names a Jewish festival setting.','Acts says every later Christian must reproduce every physical sign identically.','The scene anticipates widening witness.','The audience is culturally and geographically uniform.'],[0,2],'The passage clearly provides festival and mission context while later doctrinal applications require further argument.')
    ],
    sources:['https://www.bibleodyssey.org/dictionary/feasts-festivals-and-fasts/']
  })
];

export const course5Lessons=[
  lesson({
    id:'c5-equivalence',unitId:'c5.translation',title:'Translation spectrum: form, function, and readability',reading:'1 Corinthians 13:4–7',ref:[46,13,4,7],
    objective:'Compare formal and functional translation strategies without ranking an entire Bible by one slogan.',
    body:[
      'Translations make many decisions at once. A relatively formal rendering often tries to preserve source-language structures or repeated forms where English allows; a more functional rendering prioritizes communicating the sense naturally in the target language. Paraphrastic approaches may recast larger units more freely.',
      'These are tendencies, not airtight boxes. A translation can be more formal in one verse and more functional in another because languages do not map word-for-word. Even highly literal translations must add, reorder, or choose among meanings to produce grammatical English.',
      'The right comparison asks what a rendering preserves, clarifies, obscures, or interprets. An idiom translated literally may preserve imagery but confuse meaning; an idiom translated functionally may clarify meaning while hiding the original metaphor.',
      'For serious study, use multiple translations and consult a translation’s own preface and notes. A spectrum is a diagnostic tool, not a holiness ranking.'
    ],
    simple:'Formal and functional translation describe different priorities. Every real translation balances form, meaning, idiom, and readable target-language expression.',
    vocab:{'Formal Equivalence':'A translation tendency emphasizing correspondence with source-language form where workable.','Functional Equivalence':'A translation tendency emphasizing natural communication of source-language meaning in the target language.',Paraphrase:'A freer restatement that may work at larger units of meaning rather than close formal correspondence.'},
    deeper:'Translation studies uses more precise and varied terminology than a simple formal/dynamic spectrum. The spectrum remains useful for beginners if presented as a heuristic rather than a complete theory.',
    drawers:[drawer('Do not call one translation “literal” in every verse','No full translation can preserve every lexical, syntactic, rhetorical, and cultural feature simultaneously. “Literal” often hides which feature is being preserved.')],
    challenges:[
      match('Name the priority','Match the rendering goal to the translation tendency.',['Preserve source syntax where readable','Make an idiom communicate naturally','Freely restate the paragraph’s sense'],['More formal','More functional','Paraphrastic'],[0,1,2],'The categories describe tendencies in translation choices.'),
      evidence('Use the spectrum responsibly','Select the two warranted conclusions.',['A formal translation still makes interpretive choices.','A functional translation necessarily changes the underlying manuscript.','Comparing translations can reveal interpretive decisions.','One spectrum score proves which translation is always best.'],[0,2],'Translation strategy and textual criticism are distinct questions, and no single label settles every verse.')
    ]
  }),

  lesson({
    id:'c5-hebrew-poetry',unitId:'c5.genre',title:'Hebrew poetry: lines speak to each other',reading:'Psalm 19:1–6',ref:[19,19,1,6],
    objective:'Use parallelism, imagery, repetition, and line relationships to read biblical poetry without treating each line as isolated prose.',
    body:[
      'Biblical Hebrew poetry often creates meaning through relationships between lines: repetition, development, contrast, intensification, image, sound, and structure. “Parallelism” is a useful entry point, but not every pair of lines fits one rigid category.',
      'Psalm 19 begins with cosmic imagery in which heavens, sky, day, and night communicate without ordinary speech. Reading the imagery as poetry does not make the theological claim meaningless; it asks what the image does rather than whether the sky literally uses vocal cords.',
      'A second line may restate the first, sharpen it, extend it, contrast with it, or shift perspective. The reader should ask what changes between lines instead of simply deleting the second as repetition.',
      'Poetic structure also matters in prophets, wisdom, songs, laments, and many embedded speeches. Recognizing poetry changes how claims, metaphors, hyperbole, and emotional language are interpreted.'
    ],
    simple:'In Hebrew poetry, meaning often lives between lines. Ask how the next line repeats, develops, contrasts, or intensifies the first.',
    vocab:{Parallelism:'A broad term for meaningful relationships between poetic lines.',Imagery:'Language that evokes sensory or conceptual pictures.',Hyperbole:'Intentional exaggeration used for emphasis rather than literal measurement.'},
    deeper:'Older textbook labels such as synonymous, antithetic, and synthetic parallelism can help but often oversimplify. Contemporary analysis pays closer attention to how the second line transforms or advances the first.',
    drawers:[drawer('What about chiasm?','Chiastic structures do occur, but pattern claims should be tested carefully. A proposed symmetry is not automatically authorial or interpretively decisive just because labels can be arranged in an A-B-B-A pattern.')],
    challenges:[
      match('Read line relationships','Match the relationship to the description.',['Restatement','Contrast','Development'],['Second line overlaps the first with variation','Second line sets an opposing idea beside the first','Second line advances or specifies the thought'],[0,1,2],'Parallelism is about relationships, not merely duplicate wording.'),
      evidence('Poetry is not failed prose','Which two conclusions fit?',['Metaphor can communicate a real claim without literalizing every image.','The second poetic line is always redundant.','Genre affects how language should be interpreted.','Poetry means historical and theological questions no longer matter.'],[0,2],'Genre changes reading strategy without emptying the text of meaning.')
    ]
  }),

  lesson({
    id:'c5-typology-allusion',unitId:'c5.intertext',title:'Prediction, typology, quotation, and allusion',reading:'Matthew 2:13–18',ref:[40,2,13,18],
    objective:'Classify major ways later biblical texts reuse earlier Scripture and explain why those relationships require two-context reading.',
    body:[
      'Intertextual interpretation begins by refusing one giant category called “prophecy.” A later text may quote an earlier passage directly, echo it indirectly, identify a recurring pattern, claim fulfillment, or construct an argument from several texts.',
      'Direct prediction concerns an earlier text oriented toward a future event or figure. Typology recognizes correspondence between earlier and later persons/events within a larger story. Allusion is a less explicit echo whose recognition depends on wording, imagery, and context.',
      'Matthew’s use of Hosea’s Exodus memory for Jesus is a classic example of why classification matters. The connection can be theologically meaningful without pretending Hosea 11 originally functioned only as a prediction of Jesus’ childhood.',
      'The discipline is always double: reconstruct the earlier text’s literary/historical work, then reconstruct the later author’s reuse. Only after both are visible should a broader theological synthesis be made.'
    ],
    simple:'Biblical writers connect texts through several mechanisms. Not every later use is a direct prediction fulfilled in only one way.',
    vocab:{Quotation:'An explicit citation or reproduction of earlier wording.',Allusion:'An indirect textual echo or reference.',Typology:'A later correspondence with an earlier scriptural person, event, institution, or pattern.'},
    deeper:'Scholars debate thresholds for identifying allusions and the relationship between authorial intent, reader recognition, canonical interpretation, and theological claims. Strong allusion arguments normally use multiple converging signals rather than resemblance alone.',
    drawers:[drawer('A practical test for allusion','Look for distinctive wording, repeated clusters, thematic fit, availability to the later author, and whether the proposed source actually improves the reading. One shared common word is weak evidence.')],
    challenges:[
      match('Classify the relationship','Match each description with the best category.',['Explicitly cites earlier words','Echoes earlier imagery without citation','Later event corresponds to an earlier story pattern'],['Quotation','Allusion','Typology'],[0,1,2],'Naming relationships prevents all intertextuality from being flattened into prediction.'),
      evidence('Use two contexts','Select the two responsible moves.',['Interpret the earlier passage in its own setting.','Assume the later use cancels the earlier meaning.','Ask what the later author accomplishes by reusing the text.','Treat any verbal resemblance as certain allusion.'],[0,2],'Strong intertextual reading preserves both contexts and weighs evidence.')
    ]
  }),

  lesson({
    id:'c5-synoptic-problem',unitId:'c5.gospel-letters',title:'The Synoptic Problem: why Matthew, Mark, and Luke are so similar',reading:'Mark 1:1–8',ref:[41,1,1,8],
    objective:'Explain the basic Synoptic Problem and distinguish literary dependence hypotheses from claims about fraud or theological unreliability.',
    body:[
      'Matthew, Mark, and Luke share substantial material, wording, sequence, and story structure and are therefore called the Synoptic Gospels. Their similarities are close enough that scholars ask about literary relationships, sources, oral tradition, and editorial choices.',
      'A widely held scholarly model gives Mark priority and proposes that Matthew and Luke used Mark along with other material. The hypothetical source called Q has been proposed to explain some material shared by Matthew and Luke but absent from Mark; Q remains a hypothesis rather than a surviving manuscript.',
      'Other models exist, including versions of the Farrer hypothesis and Griesbach/Two-Gospel approaches. Introductory competence does not require choosing a winner. It requires understanding what evidence a source theory tries to explain and what remains uncertain.',
      'Literary dependence is not the same thing as plagiarism in a modern academic-policy sense. Ancient authors could reuse and reshape sources. The interpretive payoff is learning to notice what each Gospel preserves, omits, relocates, or emphasizes.'
    ],
    simple:'Matthew, Mark, and Luke are unusually similar. Scholars propose source relationships to explain that pattern; those hypotheses help comparison but are not themselves manuscripts we possess.',
    vocab:{'Synoptic Gospels':'Matthew, Mark, and Luke, named for their substantial overlap and comparable view of Jesus’ story.','Markan Priority':'The hypothesis that Mark was written before and used by Matthew and Luke.',Q:'A hypothetical source proposed in some models to explain shared Matthew-Luke material absent from Mark.'},
    deeper:'Source criticism interacts with oral tradition, memory, redaction criticism, dating, and ancient compositional practice. No single introductory model should be presented as if all scholarly questions are closed.',
    drawers:[drawer('What this changes for reading','If two writers reuse a shared scene, differences in placement or wording can become evidence of each writer’s literary and theological emphasis rather than problems to erase immediately.')],
    challenges:[
      match('Name the model piece','Match the term to its meaning.',['Markan priority','Q','Synoptic Gospels'],['Mark precedes and is used by other Synoptics in a common hypothesis','Hypothetical shared source in some models','Matthew, Mark, Luke'],[0,1,2],'The terms describe the problem and proposed relationships rather than settled manuscripts.'),
      evidence('Hypothesis versus evidence','Which two statements are responsible?',['Q is a hypothetical source, not a manuscript currently in hand.','Literary dependence automatically proves deception.','Several models attempt to explain Synoptic relationships.','Source criticism makes close reading of each Gospel unnecessary.'],[0,2],'The hypotheses organize evidence while leaving room for alternatives and literary reading.')
    ]
  }),

  lesson({
    id:'c5-authorship-composition',unitId:'c5.gospel-letters',title:'Authorship, attribution, and ancient composition',reading:'Luke 1:1–4',ref:[42,1,1,4],
    objective:'Distinguish a text’s internal claims, traditional attribution, scholarly reconstruction, use of sources, and ancient compositional practices.',
    body:[
      'Modern readers often ask “Who wrote this?” as if every biblical book must fit the model of one named modern author composing alone from a blank page. Ancient texts can involve sources, scribes, editors, schools, collected traditions, pseudonymous attribution, or later shaping in different combinations.',
      'A responsible book profile separates what the text itself claims from later titles and traditions. Luke’s prologue, for example, describes earlier accounts, transmitted testimony, investigation, and ordered writing without printing the later traditional author name inside those four verses.',
      'Traditional attribution is historically significant evidence, but it should not be relabeled as an explicit internal claim when it is not one. Likewise, a scholarly hypothesis about composition should be identified as reconstruction with a level of confidence rather than as a fact the text directly states.',
      'Pseudonymity—writing under another name or attributed persona—is debated differently across ancient corpora and biblical books. The ethical meaning of such practices cannot be assumed to match modern plagiarism or impersonation categories without historical argument.'
    ],
    simple:'Keep separate what a book says about itself, what later tradition says about it, and what scholars reconstruct from evidence.',
    vocab:{Attribution:'The identification of a work with an author, whether by the text, tradition, or later scholarship.',Pseudonymity:'Writing under or being attributed to a name/persona other than the direct composer; ancient forms and motives vary.',Redaction:'Editing or shaping inherited material into a literary work.'},
    deeper:'Authorship debates are book-specific. Evidence can include internal claims, vocabulary, style, historical fit, manuscript titles, patristic testimony, source relationships, and reception. One generic rule cannot settle every biblical book.',
    drawers:[drawer('Confidence labels matter','“Traditional,” “possible,” “probable,” “disputed,” and “unknown” should correspond to actual evidence rather than being rhetorical ways to reward a preferred conclusion.')],
    challenges:[
      match('Separate evidence layers','Match the statement with its category.',['A title in later manuscript tradition names an author','The text says “I, Paul”','A scholar infers multiple editorial stages'],['Traditional/manuscript attribution','Internal authorial claim','Composition hypothesis'],[0,1,2],'Different evidence layers should remain visible.'),
      evidence('Avoid modern-category shortcuts','Select the two responsible conclusions.',['Ancient works can use sources and editorial shaping.','Traditional attribution and explicit internal claim are always identical.','Composition hypotheses should be labeled according to evidence and confidence.','Any ancient pseudonymous practice is automatically identical to a modern academic plagiarism case.'],[0,2],'Historical composition requires historically appropriate categories and evidence labels.')
    ]
  })
];

export const course6Lessons=[
  lesson({
    id:'c6-end-times-frameworks',unitId:'c6.final-hope',title:'Millennium and rapture: name the frameworks before debating them',reading:'Revelation 20:1–6',ref:[66,20,1,6],
    objective:'Distinguish major millennial frameworks and locate rapture/dispensational readings within Christian interpretive history without making one timeline the course’s doctrinal center.',
    body:[
      'Revelation 20 refers to a thousand-year reign, and Christian interpreters have organized that imagery in several major ways. Premillennial approaches place Christ’s return before a future millennium; postmillennial approaches expect a period of gospel-shaped flourishing before Christ’s return; amillennial approaches read the millennium symbolically or as the present reign of Christ and the saints rather than a future earthly thousand-year phase.',
      'Premillennialism itself includes important differences. Historic premillennialism and dispensational premillennialism should not be treated as synonyms. Dispensational systems develop distinctive relationships among Israel, Church, prophetic chronology, and periods of divine administration.',
      'Popular “rapture” teaching often draws especially on 1 Thessalonians 4 together with a dispensational end-times scheme. Christians disagree about whether the passage describes a separate secret removal, the public coming of Christ, or another configuration. The word “rapture” can name the catching-up imagery without settling the entire timeline.',
      'Canonical Shelf keeps bodily resurrection, judgment, Christ’s victory, and renewed creation central while presenting detailed end-times schedules as disputed interpretations. The learner should be able to identify a framework and its evidence without being graded for adopting it.'
    ],
    simple:'Christians agree more broadly on resurrection and final hope than on the sequence represented by millennial and rapture systems.',
    vocab:{Premillennialism:'A family of views placing Christ’s return before a future millennial reign.',Amillennialism:'A view reading Revelation’s millennium nonliterally or as the present messianic reign rather than a future earthly thousand-year period.',Postmillennialism:'A family of views expecting a long period of gospel-shaped flourishing before Christ’s return.',Dispensationalism:'A theological system with distinctive ways of organizing biblical history, Israel/Church, and prophecy; forms vary.'},
    deeper:'Historical development matters. Modern dispensationalism emerges in the nineteenth century, while millennial debates are much older. “The early Church believed X” usually requires more precise evidence than popular end-times arguments provide.',
    drawers:[drawer('Rapture vocabulary','The English word comes through Latin terminology for being “caught up.” Vocabulary does not settle whether the event is separate from or part of the public coming of Christ.')],
    challenges:[
      match('Name the framework','Match each summary to the framework.',['Christ returns before a future millennium','Millennium symbolizes/presents Christ’s present reign','A flourishing era precedes Christ’s return'],['Premillennial','Amillennial','Postmillennial'],[0,1,2],'Naming frameworks makes disagreement discussable without declaring one the default.'),
      evidence('Keep the center and the dispute distinct','Which two statements fit Canonical Shelf’s method?',['Bodily resurrection and renewed creation are more central than one detailed timeline.','All Christians agree on a separate secret rapture.','Dispensational premillennialism and historic premillennialism are identical.','A learner can understand a framework without being graded for assent.'],[0,3],'The course distinguishes historic Christian hope from disputed chronological systems.')
    ]
  }),

  lesson({
    id:'c6-covenant-frameworks',unitId:'c6.traditions',title:'Covenant frameworks: continuity without erasing Israel',reading:'Romans 11:17–29',ref:[45,11,17,29],
    objective:'Compare major Christian ways of relating biblical covenants, Israel, Church, and fulfillment while rejecting simplistic supersessionism.',
    body:[
      'Course 2 traced Noahic, Abrahamic, Sinai, Davidic, and new-covenant trajectories as biblical history. Christian theology then asks how those covenants relate to one another and how the Church relates to Israel. Several theological systems answer differently.',
      'Covenant theology commonly emphasizes strong continuity across God’s covenantal purposes and often organizes Scripture through theological covenants such as works and grace, with important variations among Reformed and other traditions. Dispensational systems generally make sharper distinctions in biblical administrations and often maintain a distinctive future role for ethnic/national Israel.',
      'Other traditions resist both systems or use different categories. Romans 9–11 remains central because Paul speaks simultaneously of Gentile inclusion, Israel, warning against Gentile boasting, divine faithfulness, and unresolved mystery.',
      'Canonical Shelf will not teach that Christian belonging licenses contempt for Jews or proves God simply abandoned the Jewish people. A framework must account for the actual texts and for the ethical consequences of how it speaks about Israel and Judaism.'
    ],
    simple:'Christians organize covenant continuity and Israel/Church relationships differently; any framework must preserve the texts and reject Gentile superiority.',
    vocab:{'Covenant Theology':'A family of Christian systems emphasizing covenantal continuity across Scripture; forms vary.',Dispensationalism:'A family of systems emphasizing distinct administrations in biblical history and often a distinctive future for Israel.',Supersessionism:'A range of claims that the Church supersedes or replaces Israel; definitions and theological forms vary.'},
    deeper:'“Supersessionism” is used broadly in scholarship and theology, so accusations require definition. Some Christian traditions affirm fulfillment in Christ while explicitly rejecting the idea that God has abandoned Jewish people or that the Church may treat Judaism with contempt.',
    drawers:[drawer('Why Romans 11 matters','Paul’s olive-tree image includes warning to Gentile believers not to boast over branches. Whatever larger system one adopts, that warning constrains triumphalist application.')],
    challenges:[
      match('Name the broad emphasis','Match the description to the framework.',['Strong covenantal continuity','Sharper dispensational distinctions','No single system adopted'],['Covenant theology family','Dispensational family','Other/mixed approaches'],[0,1,2],'The categories orient comparison without pretending each family is internally uniform.'),
      evidence('Theological framework with ethical limits','Which two conclusions fit?',['Romans 11 warns Gentile believers against boasting.','Any Christian fulfillment claim automatically proves Jewish people have no continuing significance.','Christian systems disagree about Israel/Church relationships.','One framework exhausts every Christian tradition.'],[0,2],'The course presents real disagreement while preserving Paul’s anti-boasting constraint.')
    ]
  })
];
