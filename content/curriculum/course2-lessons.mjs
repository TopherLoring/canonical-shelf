import {lesson,sequence,match,evidence,drawer} from './helpers.mjs';

export const course2Lessons=[
  lesson({
    id:'c2-passover',unitId:'c2.exodus',title:'Passover: liberation remembered at a table',reading:'Exodus 12:1–14',ref:[2,12,1,14],
    objective:'Explain how Passover connects deliverance from Egypt with ritual memory and communal identity.',
    body:[
      'Exodus places Passover inside the final confrontation with Pharaoh. The meal is not an abstract religious exercise detached from history: it is tied to danger, departure, deliverance, and the formation of a people leaving slavery.',
      'Households prepare a lamb, mark their doors, eat in readiness, and remember the night as a lasting observance. The details belong to Israel’s story before they become symbols in later Jewish or Christian interpretation. Responsible reading begins with that first setting.',
      'Passover becomes one of Israel’s major practices of memory. Later biblical books can recall Exodus language when speaking about rescue, covenant, worship, and identity. Remembering is therefore more than thinking about the past; ritual can locate a later generation inside a received story.',
      'The New Testament later places important Jesus traditions in Passover settings and uses Passover imagery. Course 4 will examine those connections. The Christian connection should not erase Passover’s Jewish meaning or turn the Exodus into merely a code for later events.'
    ],
    simple:'Passover remembers Israel’s deliverance from Egypt through a shared meal tied to the night of departure.',
    vocab:{Passover:'The biblical festival remembering Israel’s deliverance from Egypt.','Unleavened bread':'Bread made without leaven; Exodus connects it with the urgency of departure.',Memorial:'A practice that keeps a formative event present in communal identity.'},
    deeper:'Biblical Passover practice develops across texts and periods. Exodus 12, Deuteronomy 16, later reform narratives, Second Temple practice, and later Jewish tradition should not be flattened into one timeless ritual description.',
    drawers:[
      drawer('Why eat in readiness?','Exodus depicts the meal in the setting of imminent departure. The posture reinforces that this is a liberation narrative, not simply a festival recipe.'),
      drawer('Passover and Christianity','Course 4 will distinguish Exodus itself, Gospel Passover settings, the Last Supper traditions and later Christian interpretation rather than treating them as identical.')
    ],
    visual:{title:'Passover in the Exodus story',text:'Oppression → plagues → Passover night → departure → sea crossing → wilderness'},
    challenges:[
      sequence('Place Passover in the Exodus movement','Order the events in the narrative movement.',['Israel crosses the sea','Passover is observed in Egypt','Moses is called','Israel departs from Egypt'],[2,1,3,0],'Passover belongs after Moses’ call and before departure and the sea crossing.'),
      evidence('What does Exodus 12 establish?','Select the two conclusions directly supported by the lesson.',['Passover is tied to deliverance from Egypt.','Passover first appears as a Christian Communion service.','The meal becomes a communal act of remembrance.','Every later Passover practice is described completely in Exodus 12.'],[0,2],'Exodus establishes liberation and memorial; later developments require later evidence.')
    ]
  }),

  lesson({
    id:'c2-sea-wilderness',unitId:'c2.exodus',title:'Sea and wilderness: freedom becomes dependence',reading:'Exodus 14:10–31',ref:[2,14,10,31],
    objective:'Trace the movement from escape through the sea into wilderness dependence rather than treating Exodus as complete at departure.',
    body:[
      'Leaving Egypt does not end the Exodus story. At the sea, the people face the possibility of renewed domination and fear that escape has failed. The narrative presents deliverance as a movement through danger rather than a single political announcement.',
      'After the crossing, wilderness stories repeatedly focus on food, water, fear, trust, complaint, leadership, and dependence. Manna becomes a daily provision rather than a stockpile that removes the need to trust tomorrow.',
      'These stories resist a romantic picture of liberation. A people can be freed from an oppressive system and still need habits, institutions, memory, and trust for life beyond that system. The biblical narrative does not portray the liberated community as instantly mature.',
      'Later Scripture repeatedly returns to sea and wilderness imagery. Those later uses depend on knowing the original narrative movement: danger, rescue, testing, provision, failure, and continuing presence.'
    ],
    simple:'Exodus is not finished when Israel leaves Egypt. The sea and wilderness show rescue followed by dependence, testing, and formation.',
    vocab:{Wilderness:'An unsettled region that becomes a setting of testing, provision, and formation in the Exodus traditions.',Manna:'Food described as divine provision for Israel in the wilderness.',Deliverance:'Release or rescue from danger or domination.'},
    deeper:'Different biblical texts remember the wilderness with different emphases—rebellion, dependence, courtship, judgment, provision. A theme should preserve those differences instead of turning “wilderness” into one fixed symbol.',
    drawers:[drawer('Why wilderness matters later','Prophets, Psalms, Gospels, Paul, and Revelation reuse wilderness imagery. Course 5 will study how later texts reuse earlier stories without making every reuse identical.')],
    visual:{title:'Freedom needs formation',text:'Egypt → sea → wilderness → Sinai → land'},
    challenges:[
      sequence('Follow the movement','Put these stages in narrative order.',['Sinai covenant','Sea crossing','Egyptian bondage','Wilderness provision'],[2,1,3,0],'The movement from bondage through rescue and wilderness leads toward Sinai.'),
      evidence('Avoid a shallow liberation story','Which two conclusions fit the narrative?',['Freedom removes every future difficulty.','Wilderness stories include dependence and complaint after liberation.','The sea crossing belongs to Israel’s escape from Egyptian domination.','Manna means the people never experience uncertainty again.'],[1,2],'The story joins rescue with continuing vulnerability and formation.')
    ]
  }),

  lesson({
    id:'c2-sinai-covenant',unitId:'c2.sinai',title:'Sinai: a liberated people enters covenant',reading:'Exodus 19:1–8',ref:[2,19,1,8],
    objective:'Connect Sinai covenant with the Exodus that precedes it and distinguish covenant identity from earning liberation.',
    body:[
      'Israel arrives at Sinai after the Exodus. The order matters: the covenant instructions do not purchase release from Egypt. The narrative first recalls what God has done in bringing the people out, then describes the relationship and responsibilities into which they are called.',
      'Covenant language joins relationship, promise, identity, and obligation. Exodus 19 speaks of treasured possession, priestly vocation, and holiness. These claims concern a people within a larger world rather than a license for moral superiority.',
      'The commandments and wider covenant laws that follow address worship, violence, property, labor, vulnerable neighbors, justice, and communal life. Torah therefore includes moral, social, ritual, and legal dimensions rather than a single undifferentiated list.',
      'Christian traditions later reason differently about how Sinai law relates to Gentile Christians. That later question should not erase what these instructions meant within Israel’s covenant life. Course 4 and Course 6 return to the later debates.'
    ],
    simple:'Israel is rescued before receiving Sinai’s covenant responsibilities. The law describes covenant life; it is not the price paid to escape Egypt.',
    vocab:{Sinai:'The mountain setting associated with covenant revelation in Exodus.',Covenant:'A binding relationship involving promises, identity, and responsibilities.',Torah:'Instruction; often used for the first five biblical books and the teaching they contain.'},
    deeper:'Biblical covenants are not all identical contracts. The word can describe different forms of relationship, promise, obligation, and divine commitment. Course 5 and Course 6 can examine later covenant frameworks more technically.',
    drawers:[drawer('Why the order matters','Exodus → covenant prevents a beginner from imagining that obedience earns the initial liberation. Later Christian grace/law debates should not simply be projected backward onto Sinai.')],
    visual:{title:'Exodus before command',text:'Deliverance → covenant identity → instruction → communal life'},
    challenges:[
      sequence('Reconstruct the logic','Order the relationship established in the lesson.',['Covenant responsibilities are given','Israel is delivered from Egypt','Israel is called into a particular vocation','Community life is shaped by instruction'],[1,2,0,3],'The narrative grounds covenant responsibility in prior deliverance.'),
      evidence('Read covenant without superiority','Select the two responsible conclusions.',['Israel’s covenant vocation includes responsibilities.','Being called means every Israelite action is morally right.','Sinai follows the Exodus in the narrative.','The law is presented as the payment required before God acts in Egypt.'],[0,2],'Calling and instruction follow deliverance and do not certify every action of the called community.')
    ]
  }),

  lesson({
    id:'c2-golden-calf',unitId:'c2.sinai',title:'Golden calf: covenant can be broken and renewed',reading:'Exodus 32:1–14',ref:[2,32,1,14],
    objective:'Explain the golden-calf episode as covenant rupture within the Sinai story and identify the roles of judgment, intercession, and renewal.',
    body:[
      'The golden-calf story interrupts the Sinai material almost immediately. That placement is important: covenant instruction does not produce an idealized community without failure. The people’s anxiety and the making of an image become a crisis of loyalty and worship.',
      'Moses’ intercession appeals to God’s relationship with the people and to promises associated with the ancestors. The narrative therefore places judgment and intercession inside covenant relationship rather than treating failure as if the prior relationship never existed.',
      'The chapters that follow include consequences and covenant renewal. Renewal does not make the rupture imaginary. Biblical covenant life can include real failure, accountability, mercy, and a restored path forward.',
      'Later readers often use “idolatry” as a label for anything they dislike. This story should first be understood in its own setting before the term is generalized to modern attachments or loyalties.'
    ],
    simple:'Israel breaks covenant loyalty soon after Sinai; the story holds failure, judgment, intercession, and renewal together.',
    vocab:{Idolatry:'Worship or religious allegiance directed to an image or deity in a way that violates Israel’s covenant worship.',Intercession:'Appealing on behalf of others.',Renewal:'Restoration or reaffirmation of a damaged covenant relationship.'},
    deeper:'Exodus 32–34 is a literary unit worth reading together. A lesson on “the golden calf” that stops at the image can miss Moses’ intercession, divine self-description, consequences, and covenant renewal.',
    drawers:[drawer('Do not make “idol” a shortcut','A modern application needs an argued analogy. Calling money, politics, work, or another concern an “idol” may be rhetorically powerful, but the connection should be explained rather than assumed.')],
    challenges:[
      sequence('Trace rupture and renewal','Order the broad movement.',['Moses intercedes','Covenant instruction is given','The calf is made','Covenant relationship is renewed'],[1,2,0,3],'The crisis occurs inside the Sinai covenant sequence and is followed by intercession and renewal.'),
      evidence('What does failure mean here?','Choose the two warranted conclusions.',['Covenant community can experience serious internal failure.','One failure proves the Exodus never occurred in the narrative.','Intercession and renewal are part of the continuing story.','The lesson licenses calling any disliked object an idol without argument.'],[0,2],'The story depicts rupture as real but not the final word.')
    ]
  }),

  lesson({
    id:'c2-tabernacle',unitId:'c2.tabernacle',title:'Tabernacle: sacred space on the move',reading:'Exodus 25:1–9',ref:[2,25,1,9],
    objective:'Explain why the tabernacle matters in the Exodus story and locate its major zones as a model of ordered sacred space.',
    body:[
      'After Sinai, Exodus devotes substantial attention to a portable sanctuary. The tabernacle is not an unrelated architectural appendix. Its stated purpose is connected with God dwelling among the people who have been brought out of Egypt.',
      'The sanctuary has graded spaces: an outer courtyard, a tent with a Holy Place, and an inner Most Holy Place or Holy of Holies. Objects and priestly actions are located within those spaces. The arrangement teaches that presence, holiness, access, and worship are related ideas.',
      'Because the sanctuary is portable, divine presence is not yet tied to a permanent royal capital. The tabernacle travels with Israel. Later, the temple in Jerusalem will inherit and transform many of these spatial and ritual patterns.',
      'A diagram is useful, but biblical descriptions are not modern architectural blueprints. Reconstructions make interpretive decisions. The core learning goal is the relationship among sacred space, presence, access, worship, and movement.'
    ],
    simple:'The tabernacle is a portable sanctuary representing God dwelling among Israel, with increasingly restricted sacred zones.',
    vocab:{Tabernacle:'The portable sanctuary described in Exodus.',HolyPlace:'The first chamber of the sanctuary tent.',HolyOfHolies:'The innermost sacred space associated with the Ark.'},
    deeper:'Different modern diagrams can vary because ancient measurements, terminology, construction assumptions, and artistic choices require reconstruction. The text’s theological and ritual relationships are more important here than false architectural precision.',
    drawers:[
      drawer('What belongs where?','The courtyard contains the altar and basin; the tent’s Holy Place contains furnishings such as the lampstand and table; the Ark belongs in the innermost space.'),
      drawer('From tent to temple','Course 2 later traces how tabernacle patterns relate to Solomon’s Temple and to later biblical presence imagery.')
    ],
    visual:{title:'Sacred-space layers',text:'Camp → courtyard → Holy Place → Holy of Holies / Ark'},
    challenges:[
      sequence('Move inward through sacred space','Arrange these zones from broader access toward the innermost space.',['Holy of Holies','Camp','Holy Place','Courtyard'],[1,3,2,0],'The tabernacle organizes movement from the wider camp through courtyard and sanctuary to the innermost space.'),
      match('Place the objects','Match each item with its best introductory location.',['Ark of the Covenant','Bronze altar','Lampstand'],['Holy of Holies','Courtyard','Holy Place'],[0,1,2],'Location helps make the sanctuary’s ordered access visible.')
    ]
  }),

  lesson({
    id:'c2-ark',unitId:'c2.tabernacle',title:'Ark of the Covenant: covenant and presence',reading:'Exodus 25:10–22',ref:[2,25,10,22],
    objective:'Explain the Ark’s relationship to covenant testimony, the mercy seat, and divine presence without turning it into a magical object.',
    body:[
      'The Ark is a sacred chest placed in the tabernacle’s innermost space. Exodus connects it with the covenant testimony and describes a cover often translated “mercy seat” or “atonement cover,” above which divine meeting and speech are described.',
      'The Ark therefore joins covenant memory and presence. Its significance is not that the box mechanically controls God. Later narratives actually warn against treating sacred objects as guarantees of military success or divine manipulation.',
      'The Ark travels through Israel’s story: wilderness traditions, crossing into the land, Shiloh, capture by the Philistines, recovery, David’s Jerusalem, and Solomon’s Temple. The later biblical record does not provide a simple account of its final fate after the temple’s destruction.',
      'Later Jewish and Christian traditions develop additional stories and interpretations. Those should be labeled as later reception rather than silently inserted into the biblical narrative.'
    ],
    simple:'The Ark links covenant testimony, the sanctuary’s innermost space, and divine presence; it is not a magical guarantee of success.',
    vocab:{ArkOfTheCovenant:'The sacred chest associated with covenant testimony and the innermost sanctuary.',MercySeat:'A traditional English term for the Ark’s cover, also rendered atonement cover.',Presence:'In this context, language for God dwelling, meeting, or being manifest among the people.'},
    deeper:'Hebrews 9 and other later texts remember tabernacle furnishings in theological argument. Course 4 and Course 5 distinguish an earlier text’s own setting from later reuse.',
    drawers:[
      drawer('What was inside?','Exodus emphasizes the covenant testimony/tablets. Other biblical texts and later traditions mention additional items in related ways. Compare passages rather than forcing every reference into one moment.'),
      drawer('Where did the Ark go?','The Hebrew Bible does not narrate a simple post-destruction recovery. Later traditions are historically interesting but should not be presented as if the biblical narrative settles the question.')
    ],
    visual:{title:'Ark through the story',text:'Sinai/tabernacle → wilderness → land/Shiloh → Jerusalem → Solomon’s Temple → later fate uncertain'},
    challenges:[
      match('Ark relationships','Match the Ark with the relationship emphasized in the lesson.',['Covenant testimony','Mercy seat / cover','Holy of Holies'],['Covenant memory','Meeting/atonement imagery','Innermost sacred location'],[0,1,2],'The Ark’s meaning emerges through covenant, cover, and location together.'),
      evidence('Reject magical thinking','Which two claims are warranted?',['The Ark is associated with covenant testimony.','Possessing the Ark guarantees victory regardless of covenant faithfulness.','The Ark is located in the innermost sanctuary.','The Bible clearly reports where the Ark is today.'],[0,2],'The text supports covenant and location claims, not magical control or a known modern location.')
    ]
  }),

  lesson({
    id:'c2-priesthood-sacrifice',unitId:'c2.sacrifice',title:'Priesthood and sacrifice: worship has roles and purposes',reading:'Leviticus 1:1–9',ref:[3,1,1,9],
    objective:'Distinguish priestly mediation, sacrifice, and several possible ritual purposes instead of reducing every offering to the same mechanism.',
    body:[
      'Leviticus assumes the tabernacle world established in Exodus and describes worship carried out through priests, offerings, purity practices, sacred times, and communal responsibilities. The system has structure; “sacrifice” is not one single undifferentiated action.',
      'Different offerings have different functions and features. Some emphasize gift, dedication, fellowship, purification, reparation, or atonement. Blood is important in several rites, but not every offering works in exactly the same way or addresses the same circumstance.',
      'Priests perform particular ritual responsibilities on behalf of the community, but Israel’s worship also involves households, worshipers, Levites, sacred space, and ordinary ethical life. Ritual and ethics should not be separated as if one matters to God and the other does not.',
      'Later Christian texts use priestly and sacrificial language for Jesus in multiple ways. Understanding Israel’s worship first prevents later theology from turning biblical sacrificial imagery into a vague synonym for “something costly happened.”'
    ],
    simple:'Israel’s sacrificial system includes different offerings and priestly roles. Not every sacrifice has the same purpose.',
    vocab:{Priest:'A person appointed for particular sacred and ritual responsibilities.',Offering:'A gift or sacrifice presented within worship; different offerings serve different purposes.',Atonement:'Language for dealing with impurity, wrongdoing, estrangement, or restored relationship; its ritual use varies by context.'},
    deeper:'Scholars debate the precise logic and terminology of Israelite sacrifice. Beginners should learn the diversity of offerings before trying to force all of them into one later theological model.',
    drawers:[drawer('Why this matters for the New Testament','Hebrews, Paul, the Gospels, and Revelation use priestly and sacrificial imagery. Later Christian interpretation becomes clearer when learners know the underlying ritual vocabulary.')],
    visual:{title:'One worship system, several functions',text:'Priesthood + sacred space + offerings + purity + festivals + justice/community life'},
    challenges:[
      evidence('Do not flatten sacrifice','Which two conclusions are warranted?',['Different offerings can serve different ritual purposes.','Every biblical offering has exactly the same mechanism.','Priestly and ritual language becomes important for later Christian interpretation.','Ethical conduct is unrelated to Israel’s worship system.'],[0,2],'The lesson emphasizes ritual diversity and later interpretive importance.'),
      match('Separate the categories','Match each category to its role.',['Priest','Offering','Tabernacle'],['Ritual office','Ritual gift/action','Sacred space'],[0,1,2],'Separating roles, actions, and space prevents the system from becoming a blur of religious terms.')
    ]
  }),

  lesson({
    id:'c2-day-atonement',unitId:'c2.sacrifice',title:'Day of Atonement: cleansing sacred space and community',reading:'Leviticus 16:1–34',ref:[3,16,1,34],
    objective:'Explain the Day of Atonement as a coordinated set of rites involving priest, sanctuary, impurity/sin, and communal restoration.',
    body:[
      'Leviticus 16 describes an annual rite centered on the high priest and the sanctuary. The chapter links human wrongdoing and impurity with the need to cleanse or purify sacred space and maintain the community’s relationship with God.',
      'Two goats play different roles: one is involved in sanctuary rites, while another symbolically bears Israel’s wrongs away into the wilderness. Treating both actions as if they were one identical sacrifice misses the chapter’s internal distinctions.',
      'The high priest’s entry into the innermost space is exceptional rather than routine. The ritual therefore joins access, danger, cleansing, confession, removal, and restored order.',
      'Later Christian interpretation, especially Hebrews, reuses Day-of-Atonement imagery. That later argument becomes easier to follow once the learner first understands the Levitical ritual on its own terms.'
    ],
    simple:'The Day of Atonement is an annual complex of rites dealing with sanctuary cleansing, communal wrongdoing, removal, and restored relationship.',
    vocab:{DayOfAtonement:'The annual Israelite observance described especially in Leviticus 16.',HighPriest:'The priest with distinctive responsibilities, including the Day of Atonement entry into the innermost sanctuary.',Scapegoat:'Traditional term for the goat sent away bearing confessed wrongs in the Leviticus 16 ritual.'},
    deeper:'The Hebrew term associated with the sent-away goat and the precise mechanics of atonement are debated. The lesson should preserve what the chapter clearly distinguishes before adjudicating technical theories.',
    drawers:[drawer('Why Hebrews feels dense without this','Hebrews assumes familiarity with priests, sanctuary zones, blood rites, access, and annual repetition. Course 5 can examine how Hebrews interprets those patterns.')],
    challenges:[
      match('Two goats, different roles','Match each feature to the best role.',['Goat used in sanctuary rites','Goat sent into the wilderness','High priest'],['Purification/atonement rites','Symbolic removal of wrongdoing','Exceptional entry into the innermost space'],[0,1,2],'The ritual coordinates distinct actions rather than one undifferentiated sacrifice.'),
      evidence('What makes the day distinctive?','Select the two supported claims.',['The high priest’s innermost entry is exceptional.','The chapter treats sanctuary and community as unrelated.','Wrongdoing and impurity are connected with cleansing rites.','Every later Christian use is identical to Leviticus 16.'],[0,2],'The chapter connects restricted access and cleansing while later interpretations remain later interpretations.')
    ]
  }),

  lesson({
    id:'c2-sacred-calendar',unitId:'c2.sacrifice',title:'Sabbath and festivals: Israel learns time as well as space',reading:'Leviticus 23:1–8',ref:[3,23,1,8],
    objective:'Relate Sabbath, Passover/Unleavened Bread, Weeks, and Booths to Israel’s worship, memory, agriculture, and communal calendar.',
    body:[
      'Israel’s worship is organized not only through sacred places but also through sacred time. Sabbath establishes a recurring rhythm of work and rest, while annual festivals connect worship with memory, harvest, pilgrimage, and communal identity.',
      'Passover and Unleavened Bread remember Exodus; Weeks is associated with harvest and later Jewish traditions develop additional associations; Booths or Tabernacles combines harvest celebration with wilderness memory. Biblical descriptions vary across legal corpora and later practice develops further.',
      'The calendar helps explain Gospel and Acts narratives. Jesus travels to festivals, Passover frames passion traditions, and Pentecost in Acts belongs to the festival of Weeks. These later texts assume a rhythm a beginner can otherwise miss.',
      'A festival is not merely a date label. It can organize travel, crowds, sacrifice, Scripture, memory, identity, and expectation. Historical practice also changes, so one biblical festival list should not be treated as a complete description of every period.'
    ],
    simple:'Israel’s calendar teaches memory and identity through recurring rest and festivals; those rhythms later shape Gospel and Acts settings.',
    vocab:{Sabbath:'The recurring seventh-day rhythm of rest and sacred time.',Weeks:'A pilgrimage/harvest festival later known by the Greek-derived name Pentecost.',Booths:'A pilgrimage festival also called Tabernacles or Sukkot.'},
    deeper:'Passover, Unleavened Bread, Weeks, Booths, new-moon observance, trumpet traditions, the Day of Atonement, and later festivals do not all have identical origins or functions. Historical development belongs in deeper study.',
    drawers:[drawer('Why Pentecost is already Jewish','Acts 2 does not invent the date called Pentecost. The Christian narrative takes place during the Jewish festival of Weeks, which helps explain the gathering in Jerusalem.')],
    visual:{title:'Sacred time',text:'Weekly Sabbath · spring Passover/Unleavened Bread · Weeks/Pentecost · autumn festivals including Booths'},
    challenges:[
      match('Festival and memory','Match each observance with its introductory association.',['Passover','Weeks / Pentecost','Booths'],['Exodus deliverance','Harvest pilgrimage later framing Acts 2','Harvest and wilderness dwelling'],[0,1,2],'The festivals carry different memories and seasonal relationships.'),
      evidence('Use the calendar historically','Which two statements are responsible?',['Festival settings can explain crowds and travel in biblical narratives.','Every period practiced each festival identically.','Acts 2 takes place during a Jewish festival already known as Pentecost/Weeks.','Sacred time is irrelevant to Gospel interpretation.'],[0,2],'Festival settings matter historically while practice develops over time.')
    ]
  }),

  lesson({
    id:'c2-davidic-covenant',unitId:'c2.land-kings',title:'Davidic covenant: kingship becomes a line of hope',reading:'2 Samuel 7:8–17',ref:[10,7,8,17],
    objective:'Explain how the promise to David links dynasty, kingdom, temple, discipline, and later messianic hope.',
    body:[
      'Second Samuel 7 turns from David’s desire to build a house for God toward God’s promise to build a “house” or dynasty for David. The wordplay connects temple ambition with royal succession while keeping divine initiative central.',
      'The promise speaks of descendants, throne, kingdom, discipline, and enduring commitment. It does not say that every Davidic king will rule justly. Later narratives repeatedly expose royal failure while preserving the memory of the promise.',
      'After the monarchy collapses and exile disrupts Davidic rule, prophetic and later Jewish hopes can return to Davidic language. “Messiah” does not mean only one fixed expectation in every period, but royal-Davidic hope becomes one important stream.',
      'The New Testament later presents Jesus with Davidic titles and genealogical claims. Course 3 studies the diversity of messianic expectation; Course 4 studies how the Gospels use Davidic language.'
    ],
    simple:'God’s promise to David links dynasty and kingdom with an enduring line of hope even though individual kings can fail.',
    vocab:{DavidicCovenant:'The biblical promise associated with David’s dynasty, especially in 2 Samuel 7.',Dynasty:'A succession of rulers from the same family line.',Messiah:'Anointed one; later Jewish and Christian expectations use the term in several ways, including royal-Davidic hope.'},
    deeper:'Interpreters debate how unconditional and conditional elements of royal promises fit together across Samuel, Kings, Psalms, prophets, and later literature. The introductory point is the persistence of Davidic promise through royal failure.',
    drawers:[drawer('King versus Messiah','“Anointed” language can refer to actual kings and other figures. Course 3 will prevent the learner from assuming every use already means the later Christian claim about Jesus.')],
    challenges:[
      match('Read the wordplay','Match the “house” idea to its role.',['David wants to build a house','God promises David a house'],['Temple','Dynasty'],[0,1],'The passage’s wordplay shifts from building to dynasty.'),
      evidence('Promise without idealizing kings','Select the two warranted conclusions.',['The promise concerns David’s line and kingdom.','Every Davidic king is therefore morally exemplary.','Royal failure can coexist with continuing Davidic hope.','The text says exile can never interrupt political rule.'],[0,2],'The narrative later shows failed kings while the promise continues to shape hope.')
    ]
  }),

  lesson({
    id:'c2-temple-presence',unitId:'c2.temple-kingdom',title:'Temple: presence, prayer, kingship, and limits',reading:'1 Kings 8:22–30',ref:[11,8,22,30],
    objective:'Connect Solomon’s Temple with tabernacle traditions while recognizing that the prayer itself refuses to confine God to a building.',
    body:[
      'Solomon’s Temple gives Israel’s central sanctuary a permanent monumental form in Jerusalem. Its spatial logic and furnishings draw on tabernacle traditions while the building also becomes entangled with monarchy, capital, pilgrimage, sacrifice, and national identity.',
      'In Solomon’s dedication prayer, the Temple is a focus of prayer and divine name/presence, yet the prayer also asks whether heaven itself can contain God. That tension matters: sacred space is meaningful without shrinking God to sacred architecture.',
      'The Temple becomes a major biblical symbol, but prophets can criticize confidence in the building when worship is detached from justice and covenant faithfulness. Sacred institutions can be honored and judged within the same scriptural tradition.',
      'The destruction of the Temple will therefore become both a political catastrophe and a theological crisis. Later restoration, Second Temple Judaism, Jesus’ Temple actions, and New Testament presence imagery all depend on this background.'
    ],
    simple:'Jerusalem’s Temple centralizes worship and presence language, but Scripture does not portray God as physically confined to the building.',
    vocab:{Temple:'The Jerusalem sanctuary associated with centralized worship and divine presence.',Dedication:'The act of setting a sacred building or object apart for its purpose.',Pilgrimage:'Travel to a sacred center for worship or festival.'},
    deeper:'The historical development of centralization, the relationship between tabernacle and temple traditions, and archaeological questions are complex. The course teaches the canonical relationship without pretending every historical reconstruction is settled.',
    drawers:[drawer('Temple and justice','Jeremiah and other prophets can challenge reliance on the Temple when social and covenant obligations are violated. Course 2 returns to that prophetic critique.')],
    visual:{title:'Presence develops through changing spaces',text:'Tabernacle → Jerusalem sanctuary → Solomon’s Temple → destruction → Second Temple'},
    challenges:[
      sequence('Trace the sacred-space development','Order these broad stages.',['Second Temple','Tabernacle','Solomon’s Temple','Temple destruction'],[1,2,3,0],'The temple story grows out of tabernacle traditions, passes through destruction, and later restoration.'),
      evidence('Temple without confinement','Which two statements fit 1 Kings 8 and the lesson?',['The Temple becomes a focus of prayer.','God is described as contained by the building in every sense.','The dedication prayer acknowledges that heaven cannot contain God.','Temple importance makes prophetic criticism impossible.'],[0,2],'The text holds meaningful sacred space together with divine transcendence.')
    ]
  }),

  lesson({
    id:'c2-exile-temple-loss',unitId:'c2.prophets-exile',title:'586 BCE: exile means more than losing a war',reading:'2 Kings 25:8–21',ref:[12,25,8,21],
    objective:'Explain why Jerusalem’s destruction and exile create political, communal, liturgical, and theological crises.',
    body:[
      'Second Kings narrates Babylon’s destruction of Jerusalem and the Temple and the forced displacement of part of Judah’s population. The catastrophe is conventionally dated to 586 BCE, though ancient chronological reconstruction deserves appropriate precision rather than false certainty about every detail.',
      'The loss is simultaneously political and religious: monarchy collapses, the sanctuary is burned, land is lost, communities are displaced, and inherited promises appear difficult to reconcile with events. Biblical responses include lament, confession, protest, reinterpretation, and hope.',
      'Exile does not mean that every Judean person is deported or that Jewish life exists only in Babylon. Populations remain in the land, communities develop in multiple locations, and later return does not simply reverse displacement for everyone.',
      'The crisis reshapes how later texts speak about covenant, temple, kingship, presence, restoration, and identity. Understanding exile is therefore essential preparation for both prophetic hope and Second Temple Judaism.'
    ],
    simple:'Jerusalem’s fall destroys political and religious institutions at once, creating a crisis that reshapes later biblical hope and identity.',
    vocab:{Exile:'Forced displacement from homeland, especially Judah’s Babylonian exile in biblical history.',Babylon:'The empire that conquered Jerusalem and destroyed the First Temple.',Lament:'Speech or prayer that voices grief, protest, loss, or appeal to God.'},
    deeper:'“The exile” is useful shorthand but can hide multiple deportations, communities left in Judah, earlier Assyrian displacement, and later diaspora life. Course 3 treats postexilic Jewish geography more carefully.',
    drawers:[drawer('Why 586 BCE matters','It provides a major chronological anchor for biblical history. Dates are historical reconstructions built from ancient sources; a responsible course can use the conventional date while acknowledging the character of the evidence.')],
    challenges:[
      evidence('Name the layers of the crisis','Select the two supported conclusions.',['Temple destruction affects worship as well as politics.','Every Judean is deported to the same place.','The fall of Jerusalem destabilizes assumptions about kingship and covenant.','Return later means diaspora immediately ends.'],[0,2],'The crisis is institutional and theological without reducing population history to one movement.'),
      match('Loss and question','Match each loss with the question it intensifies.',['Temple','Davidic monarchy','Land'],['How is divine presence/worship understood?','What becomes of royal promise?','How does covenant identity continue in displacement?'],[0,1,2],'Exile creates several interconnected theological questions.')
    ]
  }),

  lesson({
    id:'c2-restoration-temple',unitId:'c2.restoration-hope',title:'Return and Second Temple: restoration is real but incomplete',reading:'Ezra 3:10–13',ref:[15,3,10,13],
    objective:'Explain Persian-period return and temple rebuilding as restoration that also leaves unresolved political and theological hopes.',
    body:[
      'The Persian conquest of Babylon changes the political setting of Judean communities and allows return and rebuilding under imperial authorization. Biblical restoration narratives therefore occur inside Persian imperial rule rather than after the simple recovery of an independent Davidic kingdom.',
      'Ezra describes the laying of the new Temple foundation with both celebration and weeping. That mixed response is a useful image for restoration: something genuinely important is rebuilt, while memory of loss and the limits of the present remain visible.',
      'The Second Temple becomes the center of later Judean worship, but the postexilic community still faces questions about identity, leadership, Torah, foreign rule, diaspora, and the absence of a restored Davidic monarchy. “Return” does not resolve every prophetic hope at once.',
      'This is the doorway to Course 3. Between Persian restoration and the Gospels come Hellenistic rule, the Maccabean crisis, Hasmonean rule, Rome, Herod, and substantial developments in Jewish life and expectation.'
    ],
    simple:'The Temple is rebuilt under Persian rule, but restoration does not mean every exile-era loss or prophetic hope is fully resolved.',
    vocab:{SecondTemple:'The Jerusalem Temple rebuilt after the Babylonian destruction and later extensively renovated before its destruction in 70 CE.',PersianPeriod:'The period of Persian imperial rule over the region after Babylon’s fall.',Restoration:'Return, rebuilding, and renewed communal life after catastrophe; not necessarily complete fulfillment of every hope.'},
    deeper:'The return narratives, Persian administration, temple chronology, and relationships among Ezra, Nehemiah, Chronicles, Haggai, Zechariah, and other sources require careful historical reconstruction. Course 3 keeps the broad sequence while marking uncertainty.',
    drawers:[drawer('Why the tears matter','Ezra’s mixed celebration and grief prevents “restoration” from becoming a simplistic reset button. The new community carries memory, loss, and unresolved expectations.')],
    challenges:[
      sequence('From destruction to Second Temple','Order the broad historical movement.',['Second Temple foundation','Babylon destroys Jerusalem','Persia conquers Babylon','Some Judeans return/rebuild'],[1,2,3,0],'Persian rule creates the setting in which return and rebuilding occur after Babylonian destruction.'),
      evidence('Restoration without pretending completion','Which two claims fit the lesson?',['The rebuilt Temple is a real restoration milestone.','Persian-period Judah is already a restored independent Davidic kingdom.','Return leaves some hopes and political questions unresolved.','Diaspora Jewish life disappears once rebuilding begins.'],[0,2],'The narrative combines genuine restoration with continuing limits and dispersion.')
    ]
  }),

  lesson({
    id:'c2-new-covenant',unitId:'c2.restoration-hope',title:'New covenant: prophetic hope after rupture',reading:'Jeremiah 31:31–34',ref:[24,31,31,34],
    objective:'Interpret Jeremiah’s new-covenant promise in its Israel/Judah restoration setting before tracing later Christian use.',
    body:[
      'Jeremiah announces a future “new covenant” with the house of Israel and the house of Judah in a section filled with restoration hope. The original audience and setting matter: the promise responds to covenant rupture, exile, and the need for renewed relationship.',
      'The passage emphasizes internalized instruction, knowledge of God, and forgiveness. “New” therefore does not mean that Israel’s Scriptures or Jewish people become disposable. The text describes renewed covenant relationship with Israel and Judah.',
      'Later Christian texts, especially the Last Supper traditions and Hebrews, apply new-covenant language to Jesus. That is a major Christian interpretation, but responsible reading preserves Jeremiah’s own horizon before examining its later reception.',
      'This distinction also guards against supersessionism—the idea that Christian identity simply makes Israel or Judaism obsolete. Canonical Shelf will present Christian fulfillment claims while refusing to erase the continuing Jewish context of the texts Christians inherit.'
    ],
    simple:'Jeremiah’s new-covenant hope addresses Israel and Judah after covenant rupture; later Christian texts reuse that promise in relation to Jesus.',
    vocab:{NewCovenant:'Jeremiah’s promise of renewed covenant relationship, later important in Christian interpretation.',InternalizedInstruction:'Jeremiah’s image of divine instruction written on the heart.',Supersessionism:'The claim that the Church simply replaces Israel in a way that renders Jewish covenantal identity obsolete; forms and definitions vary.'},
    deeper:'Christian traditions disagree on covenant continuity, Israel and Church, and fulfillment. Jewish interpretation does not accept Christian claims about Jesus as the fulfillment of Jeremiah. Course 5 distinguishes original context from later canonical reuse; Course 6 treats theological frameworks.',
    drawers:[drawer('Why this matters for Communion','New-covenant language appears in Last Supper/Communion traditions. Course 4 will reconnect that phrase to Jeremiah rather than allowing it to appear without its prophetic background.')],
    challenges:[
      evidence('Start with Jeremiah’s audience','Which two statements are warranted by the passage and lesson?',['The promise names Israel and Judah.','The passage says Jewish covenantal identity is now meaningless.','Forgiveness and internalized instruction are central images.','Jeremiah directly describes a later Christian denomination.'],[0,2],'The original prophetic promise concerns renewed relationship with Israel and Judah.'),
      match('Original context and later use','Match the layer to its example.',['Jeremiah 31','Last Supper / Hebrews','Modern covenant theology'],['Prophetic restoration promise','Later Christian reuse','Subsequent theological system'],[0,1,2],'Keeping layers distinct makes later connections clearer rather than weaker.')
    ]
  }),

  lesson({
    id:'c2-prophetic-hope',unitId:'c2.restoration-hope',title:'Prophetic hope: king, Spirit, restoration, and peace',reading:'Isaiah 11:1–10',ref:[23,11,1,10],
    objective:'Identify several streams of prophetic hope without collapsing them into one prediction checklist.',
    body:[
      'Prophetic hope is not one single formula. Biblical prophets speak of restored land and community, renewed covenant, justice, divine presence, Spirit, a faithful ruler, purified worship, international peace, and new-creation imagery in different contexts.',
      'Isaiah 11 imagines a shoot from Jesse, Spirit-endowed judgment, justice for the vulnerable, and a transformed world. The passage joins royal and cosmic imagery rather than giving a modern timetable for identifying one future event.',
      'After the collapse of the Davidic monarchy, royal promises can become future-facing hopes. Other texts emphasize a servant, a prophet, priestly renewal, divine kingship, resurrection, or apocalyptic deliverance. Second Temple Jewish communities combine these materials in diverse ways.',
      'Course 3 therefore asks what kinds of hopes existed before asking how Christians identify Jesus with them. Course 4 examines Gospel fulfillment claims, and Course 5 studies quotation, allusion, typology, and prophecy as distinct interpretive relationships.'
    ],
    simple:'The prophets offer several kinds of hope—restoration, justice, presence, Spirit, kingship, peace—not one flat prediction chart.',
    vocab:{PropheticHope:'Future-oriented promises or visions emerging from prophetic messages in concrete historical crises.',Jesse:'David’s father; “root/shoot of Jesse” language evokes Davidic royal hope.',MessianicExpectation:'Expectation concerning an anointed or divinely appointed figure; forms vary across texts and communities.'},
    deeper:'“Messianic prophecy” can become an anachronistic category if every prophetic passage is assumed to function as a direct prediction of Jesus. Christian interpretation can affirm fulfillment while still asking how a passage operated in its earlier literary and historical context.',
    drawers:[drawer('Direct prediction is not the only connection','Later texts can quote, echo, typologically reuse, or reread earlier Scripture. Course 5 teaches those relationships explicitly.')],
    visual:{title:'Several streams of hope',text:'Davidic ruler · Spirit · justice · restored Israel · renewed covenant · presence · peace · new creation'},
    challenges:[
      match('Name the stream','Match each image with the broad hope it expresses.',['Shoot from Jesse','Spirit rests on the ruler','Justice for the poor'],['Davidic royal hope','Spirit-endowed rule','Righteous judgment'],[0,1,2],'Isaiah 11 coordinates several hopes in one vision.'),
      evidence('Avoid the checklist trap','Select the two responsible conclusions.',['Prophetic hope includes several themes.','Every hopeful prophetic image functions only as a direct prediction of one later event.','Second Temple readers could combine hopes in different ways.','Knowing the Christian interpretation makes the original setting irrelevant.'],[0,2],'Diverse hopes and later interpretations require layered reading.')
    ]
  })
];
