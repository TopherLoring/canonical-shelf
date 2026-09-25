import {lesson,sequence,match,evidence,drawer} from './helpers.mjs';

export const course3Lessons=[
  lesson({
    id:'c3-persian-judea',unitId:'c3.after-exile',title:'Persian Judea: return without independence',reading:'Ezra 1:1–4',ref:[15,1,1,4],
    objective:'Locate postexilic Judah within the Persian Empire and distinguish return, rebuilding, and communal restoration from political independence.',
    body:[
      'Babylon’s fall to Persia changes the political world of Judean communities. Persian policy allows displaced populations and cults to be restored in various ways, and the biblical book of Ezra presents Cyrus authorizing the rebuilding of the Jerusalem sanctuary.',
      'Return does not mean that every Judean in Babylon relocates to Jerusalem. Jewish communities continue outside the land, and the restored province remains under imperial authority. “Return from exile” is therefore both a real historical movement and an incomplete shorthand for a dispersed people.',
      'The rebuilt Temple, Torah-centered communal life, priestly leadership, and questions of ancestry and belonging become major features of the postexilic period. Ezra and Nehemiah preserve theological narratives of this world, not neutral administrative transcripts.',
      'This Persian setting is the starting point for the Second Temple period. The learner should resist the common mental jump from “return” directly to Roman-era Jesus; several centuries of political and cultural change lie between them.'
    ],
    simple:'Some Judeans return and rebuild under Persian rule, but Jewish life remains dispersed and Judea is not an independent restored monarchy.',
    vocab:{Yehud:'The Persian-period province corresponding broadly to Judah/Judea.',Diaspora:'Communities living outside an ancestral homeland.','Second Temple Period':'The long period centered on the rebuilt Jerusalem Temple, conventionally extending until its destruction in 70 CE.'},
    deeper:'Historians reconstruct Persian-period Judah from biblical texts, Persian evidence, archaeology, epigraphy, and comparative imperial history. The biblical narratives have theological interests that should be respected rather than mistaken for modern historiography.',
    drawers:[drawer('Why “return” is not the end of diaspora','Many Jewish communities remain or develop outside Judea. Diaspora becomes a durable feature of Jewish history rather than a temporary mistake corrected by one migration.')],
    visual:{title:'The bridge begins under empire',text:'Babylon → Persia → restored Temple/Judea under Persian rule → later Greek rule'},
    challenges:[
      sequence('Place the imperial transition','Order the broad movement.',['Jerusalem Temple is rebuilt','Babylonian conquest of Jerusalem','Persia conquers Babylon','Some displaced Judeans return'],[1,2,3,0],'Persian conquest creates the setting for return and rebuilding after Babylonian rule.'),
      evidence('Return without oversimplifying','Which two statements fit the lesson?',['Judea remains within the Persian imperial system.','Every Jewish family returns to Jerusalem.','Diaspora life continues after restoration begins.','The Davidic monarchy is fully restored by Cyrus.'],[0,2],'Restoration and continuing imperial/diaspora realities coexist.')
    ]
  }),

  lesson({
    id:'c3-torah-public-life',unitId:'c3.after-exile',title:'Torah and public identity after exile',reading:'Nehemiah 8:1–8',ref:[16,8,1,8],
    objective:'Explain how public reading, interpretation, worship, and communal identity become visible in postexilic biblical narratives.',
    body:[
      'Nehemiah 8 depicts a public assembly centered on the reading and explanation of Torah. Whatever questions remain about the composition and dating of the books involved, the narrative presents Scripture, interpretation, worship, and communal identity as closely connected.',
      'The scene also reminds beginners that written text does not eliminate the need for interpretation. Reading aloud, explaining sense, and helping a community understand are already part of the biblical picture of receiving Scripture.',
      'Postexilic identity is negotiated through worship, ancestry, land, imperial realities, Temple institutions, and Torah. Different Jewish communities will later emphasize and interpret these features in different ways rather than developing one uniform “Second Temple Judaism.”',
      'This diversity becomes essential for reading the Gospels. Pharisees, Sadducees, priests, teachers, diaspora communities, and other groups participate in overlapping Jewish worlds rather than representing different religions.'
    ],
    simple:'Postexilic Jewish life visibly centers Scripture, interpretation, worship, and communal identity—without producing one uniform Jewish viewpoint.',
    vocab:{'Public Reading':'Communal proclamation of Scripture.',Interpretation:'Explanation of meaning using language, context, evidence, and reasoning.',Identity:'The ways a community understands belonging, story, obligations, and boundaries.'},
    deeper:'Scholars debate the relationship between Ezra-Nehemiah’s literary presentation and historical reconstruction. The lesson uses the text to identify a real conceptual development: Scripture is received through communal reading and explanation.',
    drawers:[drawer('Why this matters for synagogues','Later synagogue life includes Scripture reading and teaching, but the institutional history is complex. Do not simply label Nehemiah 8 a fully developed first-century synagogue service.')],
    challenges:[
      match('Separate the elements','Match the feature to its role in the scene.',['Written Torah','Public reading','Explanation'],['Text','Communal reception','Interpretive mediation'],[0,1,2],'The scene joins text and interpretation rather than opposing them.'),
      evidence('Diversity without fragmentation','Select the two warranted conclusions.',['Torah becomes important for communal identity.','All later Jewish groups therefore interpret Torah identically.','Interpretation accompanies public reading.','Second Temple Jewish diversity means groups share no common Scriptures or practices.'],[0,2],'Shared texts and practices can coexist with significant interpretive diversity.')
    ]
  }),

  lesson({
    id:'c3-alexander-hellenization',unitId:'c3.greek-world',title:'Alexander and Hellenization: a new cultural world',
    objective:'Explain how Alexander’s conquests and Hellenistic culture reshape the eastern Mediterranean without imagining that local Jewish identity simply disappears.',
    body:[
      'In the late fourth century BCE, Alexander of Macedon conquers the Persian Empire and brings Judea into a Hellenistic political world. After his death in 323 BCE, successor kingdoms compete for territories including Judea.',
      'Hellenization describes the spread and local adaptation of Greek language, institutions, education, art, political forms, and cultural practices. It is not a switch by which everyone suddenly stops being Jewish and becomes “Greek.” People can participate in Greek language and civic life while negotiating Jewish identity in different ways.',
      'Greek becomes especially important across the eastern Mediterranean. Jewish Scriptures are translated into Greek over time, creating the translation tradition commonly called the Septuagint. Greek-speaking Jewish communities become central to the world from which early Christianity later emerges.',
      'Cultural exchange can produce opportunity, conflict, creativity, and arguments about fidelity. The Maccabean crisis becomes intelligible only after seeing Hellenization as a complex social process rather than a simple contest between two sealed cultures.'
    ],
    simple:'Alexander brings Judea into a Hellenistic world where Greek language and culture spread, but Jewish communities respond in diverse rather than uniform ways.',
    vocab:{Hellenization:'The spread and local adaptation of Greek language and cultural forms in the Hellenistic world.','Hellenistic Period':'The era shaped by Alexander’s conquests and successor kingdoms.',Septuagint:'A conventional name for ancient Greek translations of Jewish Scriptures; the collection and translation history developed over time.'},
    deeper:'“The Septuagint” is a convenient label but can imply more uniformity than the evidence warrants. Different books were translated at different times and textual histories are complex.',
    drawers:[
      drawer('Greek does not mean non-Jewish','Greek-speaking Jews appear throughout the ancient Mediterranean. Language use and religious identity are different dimensions.'),
      drawer('Why this matters for the New Testament','The New Testament is written in Greek and often engages forms of Greek Jewish Scripture. Course 5 returns to quotation and translation relationships.')
    ],
    visual:{title:'Political and cultural transition',text:'Persian Empire → Alexander → Hellenistic successor kingdoms → Greek-speaking eastern Mediterranean'},
    challenges:[
      evidence('Define Hellenization carefully','Which two conclusions fit?',['Greek language and cultural forms spread widely.','Hellenization requires complete abandonment of Jewish identity.','Jewish communities respond to Greek culture in varied ways.','Every biblical book is translated into Greek at the same moment.'],[0,2],'Hellenization is broad cultural change with diverse local responses.'),
      sequence('Place the broad transition','Order these stages.',['Successor kingdoms compete','Persian imperial rule','Alexander conquers the Persian Empire','Roman intervention in Judea'],[1,2,0,3],'Alexander’s conquests stand between Persian rule and the later Hellenistic kingdoms that Rome eventually displaces.')
    ]
  }),

  lesson({
    id:'c3-antiochus-maccabees',unitId:'c3.greek-world',title:'Antiochus IV and the Maccabean crisis',reading:'Daniel 11:29–35',ref:[27,11,29,35],
    objective:'Describe the second-century BCE crisis around Antiochus IV, Jewish resistance, and Temple rededication while distinguishing history from later literary interpretation.',
    body:[
      'In the second century BCE, Seleucid king Antiochus IV Epiphanes becomes entangled in conflict within Judea and imposes measures that ancient Jewish sources remember as attacks on Jewish worship and law. The Jerusalem Temple is profaned, producing a defining crisis.',
      'Resistance associated with Mattathias and his sons—especially Judas Maccabeus—develops into revolt. The conflict is not best understood as “Jews versus Greeks” in a simple ethnic sense; internal Jewish political and cultural conflicts are part of the story as well as Seleucid power.',
      'The Temple is rededicated in 164 BCE, an event later commemorated by Hanukkah. The revolt eventually contributes to Hasmonean rule. Books such as 1 and 2 Maccabees preserve major accounts of the crisis, though they are not part of the 66-book Protestant canon used in this reader.',
      'Many historical-critical interpreters relate important portions of Daniel’s visions to the Antiochene crisis. That relationship illustrates how apocalyptic literature can address concrete oppression through symbolic visions without functioning as a modern newspaper code.'
    ],
    simple:'Antiochus IV’s policies and the Temple crisis provoke Jewish resistance; the Temple is rededicated, and the revolt helps produce Hasmonean rule.',
    vocab:{'Antiochus IV':'Seleucid ruler whose reign is associated with the second-century BCE Judean crisis.',Maccabees:'The family and movement associated with revolt against Seleucid rule and the Temple crisis.',Hanukkah:'The later Jewish festival commemorating the Temple’s rededication.'},
    deeper:'Ancient sources differ in emphases and explanations for the crisis. Political rivalry, Hellenization, imperial coercion, priestly conflict, and religious persecution interact. A responsible introduction avoids reducing the conflict to one cause.',
    drawers:[
      drawer('Why use sources outside the Protestant canon?','Historical study can use 1–2 Maccabees, Josephus, inscriptions, archaeology, and other sources without treating all of them as Scripture in a Protestant canon.'),
      drawer('Daniel and historical interpretation','Connecting Daniel 7–12 with second-century events is a mainstream historical-critical approach. Other theological readings extend the visions beyond that crisis; Course 5 distinguishes literary setting, historical reconstruction, and later interpretation.')
    ],
    challenges:[
      sequence('From crisis to rededication','Order the broad movement.',['Temple rededication','Antiochus IV’s Judean crisis','Maccabean resistance','Hasmonean rule develops'],[1,2,0,3],'The crisis generates resistance; rededication precedes the consolidation of Hasmonean rule.'),
      evidence('Avoid a cartoon history','Which two statements are responsible?',['Internal Jewish conflicts are part of the crisis.','The conflict is adequately explained as all Jews rejecting everything Greek.','Temple rededication becomes a major memory.','1 Maccabees is part of the 66-book Protestant canon used by Canonical Shelf.'],[0,2],'The history is internally complex and the source traditions cross canonical boundaries.')
    ]
  }),

  lesson({
    id:'c3-hasmoneans',unitId:'c3.hasmonean-rome',title:'Hasmonean rule: resistance becomes a dynasty',
    objective:'Explain how the Maccabean revolt develops into Hasmonean political and priestly rule and why that history matters for later Jewish politics.',
    body:[
      'The revolt against Seleucid control eventually produces a Hasmonean ruling house. Leaders combine military, political, and priestly authority in ways that create both Jewish self-rule and new internal controversies.',
      'Hasmonean territory expands, and rulers navigate diplomacy, warfare, priestly legitimacy, and competing groups. A movement born from resistance to foreign domination therefore becomes its own dynasty with the problems dynasties bring.',
      'This period helps explain why later debates about priesthood, kingship, law, purity, and political legitimacy are not abstract. Different Jewish groups remember and evaluate recent rule differently.',
      'Internal Hasmonean conflict eventually creates an opening for Roman intervention. When Pompey enters Jerusalem in 63 BCE, Judea moves into a new imperial relationship that will frame the world of Herod and the Gospels.'
    ],
    simple:'Maccabean resistance develops into Hasmonean rule, bringing Jewish self-government but also conflicts over dynasty, priesthood, and legitimacy.',
    vocab:{Hasmoneans:'The Jewish ruling dynasty that developed from the Maccabean movement.','High Priesthood':'The senior priestly office associated with Temple leadership.',Legitimacy:'A claim to rightful authority or rule.'},
    deeper:'The boundaries between independence, client relationships, titles, and territorial control change across the Hasmonean period. The course uses a broad political map rather than pretending every decade has the same constitutional arrangement.',
    drawers:[drawer('Why this matters for “sects”','Pharisaic, Sadducean, Essene, priestly, and other identities emerge within histories of institutions and power. They are not timeless personality types.')],
    challenges:[
      sequence('Resistance to Roman intervention','Order the broad political movement.',['Roman intervention','Maccabean revolt','Hasmonean dynasty','Antiochene Temple crisis'],[3,1,2,0],'The Antiochene crisis leads into revolt, Hasmonean rule, and eventually Roman intervention.'),
      evidence('Dynasty without romanticizing','Which two claims fit?',['Hasmonean rulers combine political and priestly questions.','Jewish self-rule eliminates internal disagreement.','The period shapes later disputes about legitimacy.','Rome has no relationship to Hasmonean internal conflict.'],[0,2],'Self-rule is historically significant without being politically simple.')
    ]
  }),

  lesson({
    id:'c3-rome-judea',unitId:'c3.hasmonean-rome',title:'Rome enters Judea: empire becomes the political horizon',reading:'Luke 2:1–3',ref:[42,2,1,3],
    objective:'Locate Judea and Galilee within Roman imperial power and explain why rulers, taxes, armies, and client kings matter for Gospel reading.',
    body:[
      'Roman intervention in Judea begins well before Jesus’ ministry. Pompey enters Jerusalem in 63 BCE, and the region becomes increasingly entangled in Roman imperial politics, local dynasties, taxation, and military power.',
      'Rome often governs through layered arrangements rather than one uniform provincial system. Client rulers, local elites, priestly leadership, governors, and imperial authority can overlap. That is why Gospel references to Caesar, Herod, governors, tax collectors, and Temple leadership need more than one political label.',
      'Imperial rule affects land, revenue, public order, status, and the threat of violence. At the same time, ordinary life continues through families, villages, trade, worship, agriculture, and local institutions. “Roman occupation” should not erase the texture of daily life.',
      'Kingdom language, messianic claims, taxation questions, crucifixion, and public gatherings can all acquire political dimensions in this setting. Reading those dimensions does not mean reducing Jesus to a modern political category.'
    ],
    simple:'The Gospel world sits inside Roman imperial power expressed through emperors, client rulers, governors, local elites, taxation, and force.',
    vocab:{'Roman Empire':'The imperial system centered on Rome that controlled the eastern Mediterranean world of the New Testament.','Client Ruler':'A local ruler whose authority depends substantially on a larger imperial power.',Governor:'An imperial official administering a province or territory under Roman authority.'},
    deeper:'Administrative arrangements change over time. Judea under Herod the Great, his successors, Roman prefects/procurators, and later provincial structures should not be treated as one unchanging system.',
    drawers:[drawer('Why crucifixion is political as well as brutal','Crucifixion is a Roman execution associated especially with enslaved people, rebels, and others subjected to imperial power. The Gospels’ passion narratives therefore have a concrete imperial setting.')],
    challenges:[
      match('Who holds what kind of power?','Match each figure with the broad role.',['Caesar','Herodian ruler','Roman governor'],['Imperial sovereign','Local/client dynastic authority','Imperial regional administration'],[0,1,2],'Power is layered rather than represented by one office.'),
      evidence('Read empire without flattening life','Select the two warranted conclusions.',['Roman power shapes taxation and public order.','Every local decision is made personally by the emperor.','Gospel political titles belong to changing administrative arrangements.','Roman rule means Jewish institutions cease to exist.'],[0,2],'Imperial and local institutions overlap.')
    ]
  }),

  lesson({
    id:'c3-herod',unitId:'c3.hasmonean-rome',title:'Herod the Great: client king, builder, and contested ruler',reading:'Matthew 2:1–8',ref:[40,2,1,8],
    objective:'Explain Herod’s place between Rome and Judea and recognize how his rule reshapes the Temple and the political background of Gospel birth traditions.',
    body:[
      'Herod the Great rules Judea as a Roman-aligned king in the late first century BCE. His authority depends on Roman support, but his rule is local and dynastic rather than simply the daily administration of a Roman governor.',
      'Herod is famous for ambitious building projects, including a massive renovation and expansion of the Jerusalem Temple complex. The Temple encountered by Jesus’ generation is therefore the Second Temple transformed through Herodian construction.',
      'Ancient sources also remember Herod as politically ruthless and deeply concerned with dynastic security. Matthew’s birth narrative places Jesus’ royal identity in tension with Herod, using scriptural and theological storytelling that should be distinguished from a modern court chronicle.',
      'After Herod’s death, his territories are divided among successors, including Herod Antipas in Galilee. The New Testament’s several “Herods” are therefore members of a dynasty, not repeated references to one man.'
    ],
    simple:'Herod is a Roman-backed Jewish king whose building projects reshape the Temple and whose dynasty continues into the Gospel world.',
    vocab:{'Herod the Great':'Roman-aligned king of Judea who ruled in the late first century BCE.','Herodian Dynasty':'Herod’s ruling family and successors in parts of the region.','Client King':'A king whose rule is locally exercised but depends on imperial recognition and power.'},
    deeper:'Chronology around Herod’s death and the birth narratives is part of wider historical discussion. The course need not force the Gospels into a modern biography model to teach Herod’s political setting accurately.',
    drawers:[
      drawer('The “Herods” are not one person','Herod Antipas, Archelaus, Philip, Agrippa I, Agrippa II, and others belong to the wider Herodian dynasty and appear in different New Testament settings.'),
      drawer('Herodians','Mark mentions “Herodians,” generally understood as supporters or associates of Herodian rule; the exact nature of the grouping remains debated.')
    ],
    challenges:[
      match('Separate the Herodian setting','Match the feature to its significance.',['Roman support','Temple expansion','Herodian successors'],['Imperial relationship','Religious/architectural legacy','Dynastic continuity into the New Testament'],[0,1,2],'Herod’s significance is political, architectural, and dynastic.'),
      evidence('Avoid collapsing offices','Which two statements are supported?',['Herod is a Roman-aligned king rather than simply a Roman governor.','Every New Testament Herod is Herod the Great.','Herodian construction shapes the Temple complex known to Jesus’ generation.','The Second Temple begins only when Herod builds it.'],[0,2],'Herod renovates an existing Second Temple and begins a dynasty, not a single repeated identity.')
    ],
    sources:['https://www.bibleodyssey.org/people/main-articles/herodians/']
  }),

  lesson({
    id:'c3-temple-priesthood',unitId:'c3.jewish-life',title:'The Second Temple: worship, economy, authority, and pilgrimage',reading:'Luke 2:41–49',ref:[42,2,41,49],
    objective:'Describe the Second Temple as a religious center embedded in pilgrimage, priesthood, economy, and political authority.',
    body:[
      'The Second Temple is more than a religious backdrop. It is a major center of sacrifice, festivals, pilgrimage, priestly service, teaching, exchange, public gathering, and communal identity. Its importance reaches far beyond Jerusalem.',
      'Priestly families and the high priesthood carry religious responsibilities but also operate within changing political systems. Under foreign empires and Herodian/Roman arrangements, Temple leadership can be religiously authoritative and politically entangled at the same time.',
      'Pilgrimage festivals bring large numbers of people to Jerusalem. That helps explain crowd dynamics, economic activity, sacrificial logistics, and the political sensitivity of major festivals. Passover in particular remembers liberation while taking place under imperial rule.',
      'Jesus’ Temple actions and the passion narratives belong inside this world. Criticism of Temple practices should not be converted into a Christian claim that Jewish worship as such was corrupt or obsolete.'
    ],
    simple:'The Second Temple is the center of sacrifice and pilgrimage and also an institution with economic and political significance.',
    vocab:{'High Priest':'The senior priestly office associated with Temple worship and leadership.','Pilgrimage Festival':'A festival associated with travel to the sanctuary.','Temple Economy':'The material systems surrounding worship, offerings, exchange, labor, travel, and administration.'},
    deeper:'Ancient evidence about priestly groups, Temple administration, sacrifice, and political influence is uneven. Later rabbinic memory, Josephus, archaeology, the New Testament, and other sources must be handled according to genre and date.',
    drawers:[drawer('Why Passover can feel politically charged','A festival remembering liberation gathers crowds in Jerusalem while Judea lives under imperial power. That context does not determine every participant’s motive, but it explains heightened concern for public order.')],
    challenges:[
      match('Temple dimensions','Match the feature to the dimension it illustrates.',['Sacrifice','Pilgrimage crowds','High priesthood'],['Worship','Social/economic movement','Religious and political authority'],[0,1,2],'The Temple operates across several dimensions at once.'),
      evidence('Critique without supersessionism','Which two conclusions are responsible?',['Jesus’ Temple actions occur within a Jewish institution he and other Jews engage.','Criticism of a practice proves all Jewish worship is invalid.','Festival crowds matter for the political setting.','The Temple has no economic dimension.'],[0,2],'Historical critique should preserve the institution’s Jewish setting and complexity.')
    ]
  }),

  lesson({
    id:'c3-synagogue-diaspora',unitId:'c3.jewish-life',title:'Synagogue and diaspora: Jewish life beyond the Temple',reading:'Luke 4:16–21',ref:[42,4,16,21],
    objective:'Explain how synagogue and diaspora settings broaden the learner’s picture of Jewish life beyond Jerusalem sacrifice.',
    body:[
      'The Jerusalem Temple is unique, but Jewish communal life is not confined to the Temple. Synagogues become important settings for assembly, Scripture reading, teaching, prayer, and community life in Judea, Galilee, and diaspora communities.',
      'The institutional history of synagogues develops over time, and evidence varies by place. The Gospels and Acts nevertheless assume synagogue settings familiar enough to structure scenes of reading, teaching, debate, and community response.',
      'Diaspora Jewish communities live throughout the Mediterranean and Near East. They may use Greek extensively while maintaining Jewish Scriptures, practices, communal institutions, and connections with Jerusalem.',
      'This background matters especially for Acts and Paul. Early Christian mission often moves through diaspora cities where Jewish communities already provide networks, Scriptures, debates about Gentiles, and spaces of encounter.'
    ],
    simple:'Jewish life is centered on more than Jerusalem: synagogues and diaspora communities make Scripture, worship, and community visible across a wide geography.',
    vocab:{Synagogue:'A Jewish communal gathering institution associated with assembly, Scripture, teaching, prayer, and local life.','Diaspora Judaism':'Jewish communities living outside Judea/Israel.',Assembly:'A gathered community; different institutions and texts use related gathering language in different ways.'},
    deeper:'It is risky to project later rabbinic synagogue practice backward unchanged into the first century. Archaeology, inscriptions, literary texts, and later traditions illuminate different times and places.',
    drawers:[drawer('Why Greek-speaking Judaism matters','Greek Jewish Scriptures and diaspora communities are not peripheral to Christian origins. The earliest Christian movement spreads through a world where many Jews already live and read Scripture in Greek.')],
    challenges:[
      match('Temple, synagogue, diaspora','Match each category to the best description.',['Temple','Synagogue','Diaspora'],['Unique Jerusalem sanctuary','Local communal gathering institution','Jewish life outside the homeland'],[0,1,2],'The categories overlap in Jewish life but are not interchangeable.'),
      evidence('Do not make Jerusalem the only Jewish world','Select the two warranted conclusions.',['Jewish communities exist across the Mediterranean and Near East.','Diaspora Jews must abandon Jewish identity if they speak Greek.','Synagogues provide settings for Scripture and teaching.','Every synagogue everywhere follows an identical later rabbinic service.'],[0,2],'Diaspora and synagogue life expand the geographic and institutional picture without demanding uniformity.')
    ]
  }),

  lesson({
    id:'c3-pharisees-sadducees',unitId:'c3.jewish-life',title:'Pharisees and Sadducees: disagreements inside Judaism',reading:'Acts 23:6–8',ref:[44,23,6,8],
    objective:'Distinguish Pharisees and Sadducees historically and refuse the stereotype that “Pharisee” simply means hypocrite or legalist.',
    body:[
      'Pharisees and Sadducees are Jewish groups appearing in late Second Temple sources, but neither term means “Judaism” as a whole. They differ in social location, authority, interpretation, resurrection, and other questions, and our evidence comes from sources with their own perspectives.',
      'Acts 23 highlights one recognizable disagreement: Pharisees affirm resurrection while Sadducees deny it. That does not provide a complete platform for either group, but it shows that resurrection is a debated Jewish question rather than a concept Christianity introduces into an otherwise uniform Judaism.',
      'The Gospels often depict conflicts between Jesus and Pharisees. Conflict can indicate proximity as well as distance: arguments about Sabbath, purity, interpretation, and practice occur within a Jewish scriptural world. Later Christian anti-Pharisaic rhetoric has often turned these disputes into harmful caricatures of Jews.',
      'Sadducees are especially associated in our sources with priestly/elite and Temple contexts, but the evidence is limited. Both groups disappear or transform after the Temple’s destruction in 70 CE; later rabbinic Judaism should not simply be equated with “the Pharisees” without qualification.'
    ],
    simple:'Pharisees and Sadducees are distinct Jewish groups with real disagreements; neither represents all Judaism, and “Pharisee” is not a synonym for hypocrite.',
    vocab:{Pharisees:'A late Second Temple Jewish movement associated in ancient sources with distinctive interpretive practices and beliefs including resurrection.',Sadducees:'A late Second Temple Jewish group associated especially with priestly/elite and Temple contexts in ancient sources.',Resurrection:'Being raised from death; a debated belief within Second Temple Judaism.'},
    deeper:'Josephus, the New Testament, rabbinic texts, and other evidence do not offer neutral sociological surveys. Historical descriptions should therefore be modest about exact membership, organization, and doctrine.',
    drawers:[drawer('Why Gospel conflict is not “Christianity versus Judaism”','Jesus, his disciples, Pharisees, priests, and other participants are located within Jewish life. Later Christianity should not retroactively turn every intra-Jewish argument into an opposition between two already separate religions.')],
    challenges:[
      match('Distinguish the groups','Match the feature to the group most clearly associated with it in Acts 23.',['Affirm resurrection','Deny resurrection'],['Pharisees','Sadducees'],[0,1],'Acts explicitly uses resurrection as a point of disagreement.'),
      evidence('Reject the stereotype','Which two statements are responsible?',['Pharisees do not represent all Judaism.','“Pharisee” is simply an ancient word for hypocrite.','Jesus’ disputes with Pharisees occur within a Jewish context.','Sadducees are identical with later rabbis.'],[0,2],'Historical groups require historical description rather than later stereotypes.')
    ]
  }),

  lesson({
    id:'c3-essenes-qumran',unitId:'c3.jewish-life',title:'Essenes, Qumran, and the Dead Sea Scrolls',
    objective:'Explain what the Dead Sea Scrolls reveal about Jewish textual and communal diversity while keeping the Qumran-Essene identification appropriately qualified.',
    body:[
      'The Dead Sea Scrolls, discovered near the Dead Sea in the twentieth century, preserve biblical manuscripts, interpretive writings, community texts, prayers, rules, and other literature from the late Second Temple period. They dramatically expand direct evidence for Jewish texts before and around the time of early Christianity.',
      'The nearby site of Qumran is commonly associated with at least some of the scrolls and often connected with a movement identified as Essene, drawing partly on ancient descriptions by Josephus, Philo, and Pliny. Details of that relationship remain debated and should not be presented as if every scholarly question is settled.',
      'The scrolls show textual plurality: biblical manuscripts can preserve wording related to later Masoretic traditions, forms closer to some Greek translations, and other readings. Variation is evidence for textual history, not evidence that ancient readers had no Scripture or that every reading was equally common.',
      'Community documents also reveal intense concerns about purity, covenant, interpretation, calendar, leadership, and end-time expectation. They provide one window into Jewish diversity, not a secret blueprint for all first-century Judaism or Christianity.'
    ],
    simple:'The Dead Sea Scrolls give direct evidence for biblical texts and diverse Jewish communities before the New Testament period; Qumran’s exact relationship to the Essenes remains a historical question.',
    vocab:{'Dead Sea Scrolls':'Ancient manuscripts found in caves near the Dead Sea, including biblical and nonbiblical Jewish texts.',Qumran:'An archaeological site near caves containing many Dead Sea Scrolls.',Essenes:'A Jewish group described by several ancient writers and often associated with Qumran, though details are debated.'},
    deeper:'The Scrolls are a collection, not one library in a modern cataloging sense with completely known provenance. Textual classification and community attribution remain active scholarly fields.',
    drawers:[drawer('Why this belongs in Bible literacy','The Scrolls make manuscript transmission and Second Temple interpretation tangible. Course 5 returns to their significance for textual criticism rather than using them as sensational evidence for or against faith.')],
    challenges:[
      evidence('What do the Scrolls establish?','Select the two warranted conclusions.',['They preserve ancient biblical manuscripts.','They prove every first-century Jew belonged to the same Qumran community.','They reveal textual and interpretive diversity.','They eliminate every question about biblical textual history.'],[0,2],'The Scrolls expand evidence without making Jewish life or textual history uniform.'),
      match('Evidence and inference','Match each claim to its status.',['Scrolls were found near the Dead Sea','Qumran is often associated with some scrolls','Qumran community equals every Essene everywhere'],['Direct archaeological/manuscript fact','Historical inference with substantial discussion','Overstatement'],[0,1,2],'The lesson distinguishes evidence from stronger reconstructions.')
    ]
  }),

  lesson({
    id:'c3-revolutionary-currents',unitId:'c3.jewish-life',title:'Resistance, revolt, and “Zealot” language',reading:'Acts 5:34–39',ref:[44,5,34,39],
    objective:'Recognize anti-imperial resistance and revolutionary movements without projecting the later organized Zealot movement backward onto every opponent of Rome.',
    body:[
      'Roman rule generates accommodation, negotiation, protest, banditry, prophetic movements, tax resistance, and open revolt at different times. Ancient sources describe figures and groups whose motives mix politics, religion, local grievance, and hopes for divine intervention.',
      'The label “Zealot” is often used casually for any first-century Jewish nationalist. That can be misleading. A more identifiable Zealot movement belongs especially to the period of revolt against Rome beginning in 66 CE, though zeal, resistance, and anti-imperial activism obviously existed earlier.',
      'Acts 5 remembers Theudas and Judas the Galilean as leaders of failed movements. Josephus also discusses resistance associated with Judas and opposition to Roman taxation. These sources should be compared rather than collapsed into one revolutionary party.',
      'This context helps explain why claims about kingdom, Messiah, taxes, crowds, and public order could be politically sensitive. It does not prove that Jesus or every disciple belongs to one revolutionary program.'
    ],
    simple:'Resistance to Rome takes many forms. “Zealot” should not be used as a catch-all label for every Jewish opponent of imperial rule.',
    vocab:{Zealot:'Strictly, a label especially associated with a movement active in the revolt against Rome; it is often used too broadly.','Judas the Galilean':'A figure linked in ancient sources with resistance connected to Roman taxation.',Revolt:'Organized armed resistance against political authority.'},
    deeper:'Ancient categories such as “bandit,” “rebel,” “prophet,” or “deceiver” can themselves reflect the perspective of authorities or historians. Historical analysis should ask who applies the label and why.',
    drawers:[drawer('Why taxes matter in the Gospels','Tax questions are not abstract accounting puzzles under imperial rule. They touch sovereignty, collaboration, livelihood, and public allegiance without automatically determining one theological answer.')],
    challenges:[
      evidence('Use “Zealot” carefully','Which two statements fit?',['Resistance to Rome existed in several forms.','Every tax protester belongs to one formal Zealot party.','The organized Zealot label is especially associated with the later revolt period.','Political sensitivity proves every kingdom saying calls for armed revolt.'],[0,2],'Historical resistance is diverse and labels need chronological control.'),
      match('Claim and caution','Match the statement to the best evaluation.',['Judas the Galilean is linked with resistance','All anti-Roman Jews are Zealots','Kingdom language can have political resonance'],['Historically grounded','Overgeneralization','Contextual possibility requiring textual evidence'],[0,1,2],'The distinction protects historical context from becoming a predetermined interpretation.')
    ]
  }),

  lesson({
    id:'c3-apocalyptic-resurrection',unitId:'c3.expectation',title:'Apocalyptic hope and resurrection before Christianity',reading:'Daniel 12:1–3',ref:[27,12,1,3],
    objective:'Recognize resurrection and apocalyptic hope as developments within Jewish Scripture and Second Temple Judaism rather than concepts appearing from nowhere in Christianity.',
    body:[
      'Daniel 12 contains one of the Hebrew Bible’s clearest statements about resurrection: people sleeping in the dust awaken to different destinies. The passage appears within apocalyptic visions responding to severe conflict and divine justice.',
      'Second Temple Jewish texts develop varied expectations about resurrection, judgment, angels, cosmic conflict, kingdoms, and the age to come. Not every Jewish group affirms the same details; Acts, for example, depicts Pharisees and Sadducees disagreeing about resurrection.',
      'Apocalyptic literature uses visions, symbols, heavenly scenes, beasts, numbers, and dramatic transformations to unveil the meaning of earthly crisis in relation to divine rule. That genre is not best approached as a coded schedule assigning each symbol to today’s headlines.',
      'Early Christian resurrection claims therefore emerge inside an existing Jewish conversation while also making a distinctive claim about Jesus. Course 4 will place Jesus’ resurrection inside that background; Course 6 will study Christian final hope in depth.'
    ],
    simple:'Resurrection and apocalyptic hope are already part of Jewish debate before Christianity; Christians enter that conversation with claims about Jesus.',
    vocab:{Apocalyptic:'Visionary literature that unveils earthly conflict in relation to heavenly realities, divine judgment, and hope.',Resurrection:'Raising the dead to transformed life.','Age to Come':'Language for a future order of divine restoration or judgment in some Jewish and Christian traditions.'},
    deeper:'“Apocalyptic” names both a literary genre and, in scholarship, broader patterns of thought. Those categories overlap but are not identical. Beginners should first learn how symbolic visions function before debating technical taxonomies.',
    drawers:[drawer('Why this changes Gospel reading','When Gospel characters debate resurrection or speak of the Son of Man, judgment, angels, or the kingdom, they participate in already existing Jewish scriptural and interpretive worlds.')],
    challenges:[
      evidence('Locate resurrection historically','Which two statements are supported?',['Daniel contains resurrection language.','Christianity invents resurrection without Jewish precedent.','Second Temple Jews can disagree about resurrection.','Every Jewish group shares one apocalyptic timetable.'],[0,2],'Resurrection belongs to Jewish Scripture and debate, not a uniform consensus.'),
      match('Read apocalyptic signals','Match each feature to its role.',['Symbolic beasts','Heavenly vision','Resurrection/judgment'],['Symbolic portrayal of kingdoms/conflict','Unveiling a larger frame','Hope and accountability beyond present oppression'],[0,1,2],'Apocalyptic imagery interprets crisis through a larger theological frame.')
    ]
  }),

  lesson({
    id:'c3-messianic-diversity',unitId:'c3.expectation',title:'Messiah was not one single expectation',reading:'Psalm 2:1–8',ref:[19,2,1,8],
    objective:'Distinguish royal-Davidic messianic hope from other Second Temple expectations and avoid assuming one universal checklist awaited Jesus.',
    body:[
      '“Messiah” means anointed one. In Israel’s Scriptures, anointing language can apply to kings, priests, and other appointed figures. Later Jewish hopes can draw especially on Davidic royal promises, but the term does not carry one fully fixed Christian definition before the Gospels.',
      'Second Temple Jewish texts reveal diverse expectations: a Davidic ruler, priestly figures, prophetic restoration, heavenly or apocalyptic agents, national deliverance, renewed Temple life, resurrection, or no central messianic figure at all. Different texts combine hopes differently.',
      'Psalm 2 supplies royal language later reused by Christians, but its earlier function concerns kingship and divine rule. Reading later fulfillment does not require pretending the psalm’s original hearers already possessed the entire later Christian interpretation.',
      'This diversity explains why Gospel questions such as “Who do you say that I am?” carry real interpretive weight. Identifying Jesus as Messiah is not simply matching him to one universally agreed job description.'
    ],
    simple:'Messiah means “anointed one,” and Second Temple Jewish hopes were diverse rather than one universally agreed checklist.',
    vocab:{Messiah:'Anointed one; a title whose meanings and expectations vary across biblical and later Jewish/Christian contexts.','Davidic Hope':'Expectation connected with David’s dynasty and royal promises.',Anointed:'Consecrated or appointed, often symbolized by anointing with oil.'},
    deeper:'Modern discussions often speak of “the Jewish Messiah” as if one standardized doctrine existed. Ancient evidence instead supports a range of messianic and non-messianic eschatological expectations.',
    drawers:[drawer('What Christians later claim','Christian texts identify Jesus with royal, prophetic, priestly, servant, Son of Man, and other scriptural patterns. Course 5 will separate direct quotation, allusion, typology, and theological synthesis.')],
    challenges:[
      evidence('Reject the single-checklist model','Select the two warranted conclusions.',['Davidic royal hope is one important messianic stream.','Every Second Temple Jewish text expects exactly the same Messiah.','Some hopes are not centered on one messianic figure.','The word Messiah always means “divine savior who dies and rises” before Christianity.'],[0,2],'Ancient expectation is diverse and develops across texts.'),
      match('Different kinds of hope','Match each expectation to its broad category.',['Son of David','Priestly figure','Resurrection of the dead'],['Royal','Priestly','Eschatological hope not necessarily identical with a messianic office'],[0,1,2],'Messianic and eschatological hopes can overlap without being identical.')
    ]
  }),

  lesson({
    id:'c3-enter-gospels',unitId:'c3.enter-gospels',title:'Open the Gospels with the missing centuries restored',reading:'Mark 1:14–15',ref:[41,1,14,15],
    objective:'Integrate empire, Temple, Jewish diversity, apocalyptic hope, and messianic expectation into a usable context for beginning the Gospels.',
    body:[
      'When Mark announces the kingdom of God, the learner now enters the scene with several centuries restored. Judea and Galilee live under Roman power; Herodian rulers remain part of the landscape; the Jerusalem Temple dominates worship and pilgrimage; and Jewish communities interpret Scripture in diverse ways.',
      'Pharisees, Sadducees, priests, teachers, diaspora Jews, apocalyptic writers, and resistance movements do not form one block called “the Jews.” Disputes in the Gospels need to be located among particular people, institutions, texts, and questions.',
      'Kingdom, Messiah, resurrection, purity, Sabbath, Temple, Torah, Son of Man, Passover, and exile/restoration language now arrive with histories. Jesus can challenge, reinterpret, intensify, or inhabit these traditions precisely because he and his earliest followers are Jewish participants in this world.',
      'This context sets limits as well as possibilities. Historical background can illuminate a Gospel scene, but it cannot reveal motives the text does not give or settle every theological interpretation. Course 4 returns to the primary Gospel narratives with this context in place.'
    ],
    simple:'The Gospels begin inside Roman-ruled, Second Temple Jewish life—not in an empty gap after the Old Testament.',
    vocab:{'Kingdom of God':'God’s reign; in the Gospels it draws on Jewish scriptural hopes and is not merely a synonym for heaven after death.','Second Temple Judaism':'A broad label for diverse Jewish life during the Second Temple period.','Historical Context':'Evidence about the world in which a text or event is located; useful but not a substitute for reading the text itself.'},
    deeper:'The phrase “Second Temple Judaism” is itself an analytical umbrella. It should help learners notice diversity and history, not suggest that every Jewish practice belongs to one coherent system.',
    drawers:[
      drawer('A checklist before interpreting a Gospel dispute','Ask: Who is involved? What institution or text matters? What is explicitly said? Which background claim is well supported? What remains inference?'),
      drawer('Anti-Judaism warning','Later Christian readers have often generalized local Gospel conflicts into claims about Jewish people as a whole. Canonical Shelf explicitly rejects that move.')
    ],
    visual:{title:'The Gospel world',text:'Rome + Herodian rule + Temple + Torah + synagogues + Jewish diversity + apocalyptic/messianic hopes → Jesus’ ministry'},
    challenges:[
      match('Put the context back','Match the Gospel feature to the background now available.',['Passover','Sadducees','Kingdom of God'],['Exodus/festival/Temple world','Second Temple Jewish group','Jewish scriptural and eschatological hope'],[0,1,2],'The bridge turns unfamiliar Gospel terms into historically located concepts.'),
      evidence('Context without overreach','Which two moves are responsible?',['Use background to illuminate terms and institutions.','Use a background theory to invent a character’s private motive.','Distinguish particular Jewish groups from Judaism as a whole.','Treat Roman rule as irrelevant to crucifixion and taxation scenes.'],[0,2],'Historical context helps when it remains evidence-controlled.')
    ]
  })
];
