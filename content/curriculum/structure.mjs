export const RETENTION_DAYS=[1,3,7,14,30,60];

const course=(config)=>({
  ...config,
  activeStudyMinutes:{min:config.activeStudyMinutes.min,max:config.activeStudyMinutes.max},
  timingNote:'Estimated active study time for first-pass course completion; spaced retention continues after completion.'
});

export const courses=[
  course({
    id:'course.foundations',sequence:1,title:'Bible & Christianity: Foundations',shortTitle:'Foundations',
    level:'core',phaseLabel:'Foundations',achievement:'Foundations Complete',activeStudyMinutes:{min:360,max:480},
    scope:'A rigorous adult-beginner survey that introduces Christianity, the Bible, interpretation, theology, practice, the biblical story, and the difficult questions the later courses will address in greater depth.',
    outcome:'Build a usable mental map of the Bible and Christianity, recognize the major questions and disagreements, and understand which foundations are needed before drawing stronger conclusions.',
    learnerPromise:'You will meet the important questions early. Course 1 gives responsible first-pass answers and shows why Scripture, history, context, and interpretation are needed before later courses return to those questions in greater depth.'
  }),
  course({
    id:'course.israel',sequence:2,title:'Israel: Exodus, Covenant, Temple & Prophetic Hope',shortTitle:'Israel',
    level:'core',phaseLabel:'Biblical foundations',achievement:null,activeStudyMinutes:{min:420,max:600},
    scope:'The historical-biblical bridge from Egypt and Exodus through Sinai, worship, monarchy, temple, prophets, exile, restoration, and unresolved hope.',
    outcome:'Explain how Exodus, covenant, law, worship, temple, exile, and prophetic hope supply the vocabulary later used by Jesus and the New Testament.',
    learnerPromise:'Questions about sin, law, sacrifice, violence, justice, salvation, and hope are revisited here in the texts and institutions that gave them their biblical vocabulary.'
  }),
  course({
    id:'course.second-temple',sequence:3,title:'From Exile to Jesus: The Second Temple World',shortTitle:'Second Temple World',
    level:'core',phaseLabel:'Historical context',achievement:null,activeStudyMinutes:{min:300,max:420},
    scope:'Persian, Hellenistic, Hasmonean, Herodian, and Roman contexts; Jewish institutions, diversity, apocalyptic hope, and messianic expectations.',
    outcome:'Enter the Gospels understanding the Jewish and imperial world in which their people, disputes, institutions, and hopes make sense.',
    learnerPromise:'Questions about resurrection, Messiah, law, purity, Jewish diversity, empire, and interpretation gain the first-century context needed for later Gospel and theological study.'
  }),
  course({
    id:'course.jesus-church',sequence:4,title:'Jesus, the Gospels & the Early Church',shortTitle:'Jesus & Early Church',
    level:'core',phaseLabel:'Jesus & early Christianity',achievement:'Biblical Literacy Core Complete',activeStudyMinutes:{min:420,max:600},
    scope:'The four Gospels, Jesus’ kingdom and teaching, passion and resurrection, Ascension, Pentecost, Acts, Paul, Gentile inclusion, and earliest Christian communities.',
    outcome:'Trace the movement from Jesus within first-century Judaism through the emergence and expansion of the early Church while connecting earlier covenant, temple, law, and hope themes to Christian claims.',
    learnerPromise:'Questions about Jesus, the cross, resurrection, grace, Torah, inclusion, Church, ethics, and Christian identity are now encountered in their primary New Testament settings.'
  }),
  course({
    id:'course.interpretation',sequence:5,title:'How We Know: Interpretation & Evidence',shortTitle:'Interpretation & Evidence',
    level:'advanced',phaseLabel:'Interpretation & evidence',achievement:null,activeStudyMinutes:{min:360,max:540},
    scope:'Textual transmission, translation theory, genre mechanics, intertextuality, Gospel and letter study, evidence evaluation, and accountable independent interpretation.',
    outcome:'Evaluate evidence and construct responsible interpretations while distinguishing text, context, inference, reception, doctrine, and application.',
    learnerPromise:'Return to questions already encountered and learn how manuscripts, translation, genre, historical context, lexical evidence, intertextuality, and competing interpretations change the strength of an answer.'
  }),
  course({
    id:'course.theology',sequence:6,title:'Christian Theology, Traditions & Synthesis',shortTitle:'Theology & Synthesis',
    level:'advanced',phaseLabel:'Theological synthesis',achievement:'Advanced Canonical Shelf Complete',activeStudyMinutes:{min:360,max:540},
    scope:'A synthesis of Christian doctrine, salvation, providence, Church and practice, traditions, contested texts, difficult questions, resurrection, judgment, and final hope using foundations developed across Courses 1–5.',
    outcome:'Explain major Christian claims and disagreements fairly, identify their evidence and limits, compare responsible interpretations, and integrate the curriculum without confusing understanding with personal assent.',
    learnerPromise:'This is not the first time difficult questions appear. It is where you bring together the biblical, historical, and interpretive work already completed and evaluate the major theological options with better tools.'
  })
];

const unit=(courseId,sequence,id,title,scope)=>({id,courseId,sequence,title,scope});

export const units=[
  // Course 1 — Foundations
  unit('course.foundations',1,'c1.christianity','Christianity in One View','Jesus, gospel, cross, resurrection, grace, faith, repentance, discipleship, Church, Christian hope, and the major questions the curriculum will revisit.'),
  unit('course.foundations',2,'c1.bible','What the Bible Is','Bible as library; Old and New Testaments; canon; books, chapters, verses; literary variety.'),
  unit('course.foundations',3,'c1.transmission','How We Got the Bible','Hebrew, Aramaic, Greek, copying, manuscripts, textual variants, translation, and why English Bibles differ.'),
  unit('course.foundations',4,'c1.reading','How to Read It','Context, genre, observation, interpretation, application, evidence, uncertainty, and responsible reading.'),
  unit('course.foundations',5,'c1.theology','Theology You Need Before Continuing','God, Trinity, incarnation, Spirit, sin, salvation, resurrection, and the difference between central claims and disputed explanations.'),
  unit('course.foundations',6,'c1.practice','Christian Practice','Baptism, Communion, prayer, worship, discipleship, community, and the relationship between belief and practice.'),
  unit('course.foundations',7,'c1.traditions','Christians Do Not All Read the Same Way','Traditions, denominations, authority, sacraments, interpretation, theological disagreement, and fair comparison.'),
  unit('course.foundations',8,'c1.story','The Biblical Story in One View','Creation, Abraham, Exodus, covenant, Israel, David, temple, prophets, exile, Jesus, Church, and new creation.'),
  unit('course.foundations',9,'c1.synthesis','Foundations Synthesis','Reconstruct the whole map and use it to orient an unfamiliar passage or difficult question without collapsing evidence, interpretation, doctrine, and application.'),

  // Course 2 — Israel
  unit('course.israel',1,'c2.exodus','Egypt and Exodus','Israel in Egypt, Moses, divine name, Pharaoh, plagues, Passover, sea crossing, wilderness, and liberation.'),
  unit('course.israel',2,'c2.sinai','Sinai and Covenant','Sinai, covenant ceremony, commandments, covenant law, golden calf, rupture, renewal, and covenant responsibility.'),
  unit('course.israel',3,'c2.tabernacle','Tabernacle, Ark and Presence','Tabernacle purpose and layout, Ark of the Covenant, mercy seat, sacred space, and divine presence.'),
  unit('course.israel',4,'c2.sacrifice','Sacrifice, Holiness and Sacred Time','Priesthood, offerings, Day of Atonement, clean/unclean, holiness, Sabbath, and Israel’s festival calendar.'),
  unit('course.israel',5,'c2.land-kings','Land, Judges and Kings','Land traditions, conquest questions, Judges, Ruth, Samuel, Saul, David, Davidic covenant, and Solomon.'),
  unit('course.israel',6,'c2.temple-kingdom','Temple and Kingdom','Jerusalem, Solomon’s Temple, Ark and presence, worship, divided monarchy, power, and prophetic accountability.'),
  unit('course.israel',7,'c2.prophets-exile','Prophets, Exile and Destruction','Prophetic vocation and genres, Assyria, Judah, Babylon, Jerusalem’s destruction, temple loss, lament, and exile.'),
  unit('course.israel',8,'c2.restoration-hope','Restoration and Prophetic Hope','Persian return, rebuilding, Second Temple, new covenant, restored presence, Davidic/messianic hope, Spirit, kingdom, and renewed creation.'),

  // Course 3 — Second Temple
  unit('course.second-temple',1,'c3.after-exile','After the Exile','Persian-period Judea, Second Temple Jerusalem, Ezra-Nehemiah, Torah, identity, and diaspora.'),
  unit('course.second-temple',2,'c3.greek-world','The Greek World','Alexander, Hellenization, successor kingdoms, Antiochus IV, Maccabean revolt, and temple rededication.'),
  unit('course.second-temple',3,'c3.hasmonean-rome','Hasmoneans, Rome and Herod','Hasmonean rule and conflict, Roman intervention, Herodian rule, building programs, Judea, and Galilee.'),
  unit('course.second-temple',4,'c3.jewish-life','Jewish Life and Jewish Diversity','Temple, priesthood, synagogues, diaspora, Torah, Pharisees, Sadducees, Essenes/Qumran, scribes, and revolutionary currents.'),
  unit('course.second-temple',5,'c3.expectation','Hope and Expectation','Apocalyptic thought, resurrection debates, messianic diversity, Davidic and priestly hopes, Son of Man imagery, restoration, and kingdom.'),
  unit('course.second-temple',6,'c3.enter-gospels','Entering the Gospels','Judea, Galilee, Samaria, Rome, taxation, Temple authority, Jewish disputes, Messiah language, and why Jesus must be read within Judaism.'),

  // Course 4 — Jesus and early Church
  unit('course.jesus-church',1,'c4.gospels','Four Gospels','Gospel as literary proclamation; Mark, Matthew, Luke, John; comparison without flattening.'),
  unit('course.jesus-church',2,'c4.kingdom','Jesus and the Kingdom','John the Baptist, baptism, kingdom, disciples, miracles, signs, parables, welcome, and table fellowship.'),
  unit('course.jesus-church',3,'c4.teaching','Jesus’ Teaching','Sermon on the Mount, Beatitudes, Torah, enemy-love, Lord’s Prayer, wealth, judgment, mercy, and neighbor-love.'),
  unit('course.jesus-church',4,'c4.israel-story','Jesus and Israel’s Story','Torah, Sabbath, Temple, Messiah, Son of Man, prophecy and fulfillment, Passover imagery, and Jesus’ use of Israel’s Scriptures.'),
  unit('course.jesus-church',5,'c4.passion','Passion and Resurrection','Jerusalem, Temple confrontation, Last Supper, arrest, trial, crucifixion, death, resurrection accounts, and Ascension.'),
  unit('course.jesus-church',6,'c4.pentecost','Pentecost and the Jerusalem Church','Pentecost, Spirit, mission, early community, Temple, Stephen, persecution, Philip, and widening mission.'),
  unit('course.jesus-church',7,'c4.paul-gentiles','Paul and Gentile Inclusion','Paul, mission, Gentile converts, Acts 15, Torah and Gentile Christians, journeys, and community formation.'),
  unit('course.jesus-church',8,'c4.expansion','Christianity Begins to Expand','Letters and communities, Jewish/Gentile identity, Roman social world, pressure and persecution, and early Christian diversity.'),

  // Course 5 — Interpretation and evidence
  unit('course.interpretation',1,'c5.transmission','Text, Manuscripts and Transmission','Composition, Hebrew/Aramaic/Greek, copying, textual variants, scribal phenomena, manuscript witnesses, Dead Sea Scrolls, codices, and apparatus.'),
  unit('course.interpretation',2,'c5.translation','Translation','Translation as interpretation, formal and functional equivalence, paraphrase, idiom, semantic range, and comparison.'),
  unit('course.interpretation',3,'c5.genre','Genre','Narrative, Torah/law, Hebrew poetry and parallelism, wisdom, prophecy, Gospel, parable, epistle, and apocalypse.'),
  unit('course.interpretation',4,'c5.intertext','Scripture Interpreting Scripture','Quotation, allusion, echo, typology, direct prophecy, fulfillment, original context, later use, and canonical trajectories.'),
  unit('course.interpretation',5,'c5.gospel-letters','Gospel and Letter Study','Synoptic relationships, harmonization, arrangement, attribution/authorship, ancient letters, audience, occasion, rhetoric, and argument.'),
  unit('course.interpretation',6,'c5.interpretation','Building an Interpretation','Observation, literary and historical context, evidence, interpretation, alternatives, application, confidence, uncertainty, and independent study.'),

  // Course 6 — Theological synthesis
  unit('course.theology',1,'c6.god-christ','God and Christ','God, Trinity, incarnation, Jesus’ divinity and humanity, Holy Spirit, creeds, and doctrinal reasoning.'),
  unit('course.theology',2,'c6.sin-salvation','Humanity, Sin and Salvation','Image of God, sin, mortality, grace, repentance, faith, cross, resurrection, atonement models, and reconciliation.'),
  unit('course.theology',3,'c6.providence-life','Providence and Christian Life','Providence, foreknowledge, predestination, freedom, prayer, miracles, suffering, formation, and ethics.'),
  unit('course.theology',4,'c6.church-practice','Church and Practice','Church, baptism, Communion, worship, ministry, leadership, mission, and Christian community.'),
  unit('course.theology',5,'c6.traditions','Christian Traditions','Creeds/councils, Catholic/Orthodox/Protestant orientation, Reformation, authority, sacraments, polity, and denominational comparison.'),
  unit('course.theology',6,'c6.difficult','Difficult Texts and Questions','Synthesize the curriculum’s earlier encounters with conquest, slavery, women, sexuality/LGBTQ interpretation, Judaism and supersessionism, religions, suffering, miracles, spiritual evil, and discernment.'),
  unit('course.theology',7,'c6.final-hope','Resurrection and Final Hope','Resurrection, judgment, renewed creation, final punishment, universal reconciliation/conditional immortality, unevangelized, millennial frameworks, rapture readings, Revelation, and hope.')
].map((entry,index)=>({...entry,globalSequence:index+1}));

const touch=(courseId,unitId,stage)=>({courseId,unitId,stage});

export const questionThreads=[
  {
    id:'q.god-christ',title:'God, Trinity, and Jesus',
    question:'How can Christians speak of one God, Father, Son, and Spirit, while also confessing Jesus as divine and human?',
    touchpoints:[touch('course.foundations','c1.theology','introduce'),touch('course.second-temple','c3.expectation','contextualize'),touch('course.jesus-church','c4.israel-story','encounter'),touch('course.interpretation','c5.intertext','investigate'),touch('course.theology','c6.god-christ','synthesize')]
  },
  {
    id:'q.scripture-trust',title:'Scripture, transmission, and trust',
    question:'Can an ancient collection copied, translated, and interpreted across centuries be read responsibly and trusted?',
    touchpoints:[touch('course.foundations','c1.bible','introduce'),touch('course.foundations','c1.transmission','ground'),touch('course.interpretation','c5.transmission','investigate'),touch('course.interpretation','c5.translation','investigate'),touch('course.interpretation','c5.interpretation','synthesize')]
  },
  {
    id:'q.sin-salvation',title:'Sin, salvation, and the cross',
    question:'What is sin, what does salvation mean, and why did Jesus die?',
    touchpoints:[touch('course.foundations','c1.theology','introduce'),touch('course.israel','c2.sinai','ground'),touch('course.israel','c2.sacrifice','ground'),touch('course.jesus-church','c4.passion','encounter'),touch('course.interpretation','c5.intertext','investigate'),touch('course.theology','c6.sin-salvation','synthesize')]
  },
  {
    id:'q.suffering-evil',title:'Suffering, evil, and providence',
    question:'Why does suffering exist, what does God do about it, and how should providence and human freedom be understood?',
    touchpoints:[touch('course.foundations','c1.theology','introduce'),touch('course.israel','c2.prophets-exile','encounter'),touch('course.jesus-church','c4.passion','encounter'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.providence-life','synthesize')]
  },
  {
    id:'q.violence-slavery',title:'Violence, conquest, and slavery',
    question:'How should readers understand biblical texts involving conquest, violence, slavery, domination, or morally difficult social systems?',
    touchpoints:[touch('course.foundations','c1.reading','introduce'),touch('course.israel','c2.land-kings','encounter'),touch('course.jesus-church','c4.teaching','compare'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.difficult','synthesize')]
  },
  {
    id:'q.sexuality',title:'Sexuality, LGBTQ interpretation, and relationships',
    question:'Why do Christians disagree about sexuality and LGBTQ inclusion, and what evidence is required to interpret the relevant texts responsibly?',
    touchpoints:[touch('course.foundations','c1.traditions','introduce'),touch('course.israel','c2.sinai','contextualize'),touch('course.second-temple','c3.jewish-life','contextualize'),touch('course.jesus-church','c4.expansion','encounter'),touch('course.interpretation','c5.translation','investigate'),touch('course.interpretation','c5.gospel-letters','investigate'),touch('course.theology','c6.difficult','synthesize')]
  },
  {
    id:'q.women-ministry',title:'Women, ministry, and authority',
    question:'How should texts about women, leadership, household roles, teaching, and ministry be interpreted across their historical settings?',
    touchpoints:[touch('course.foundations','c1.practice','introduce'),touch('course.second-temple','c3.jewish-life','contextualize'),touch('course.jesus-church','c4.expansion','encounter'),touch('course.interpretation','c5.gospel-letters','investigate'),touch('course.theology','c6.difficult','synthesize')]
  },
  {
    id:'q.judgment-hope',title:'Judgment, hell, resurrection, and final hope',
    question:'What do Christians mean by judgment, resurrection, hell, eternal life, and new creation, and why do final-destiny views differ?',
    touchpoints:[touch('course.foundations','c1.theology','introduce'),touch('course.second-temple','c3.expectation','contextualize'),touch('course.jesus-church','c4.teaching','encounter'),touch('course.interpretation','c5.genre','investigate'),touch('course.theology','c6.final-hope','synthesize')]
  },
  {
    id:'q.religions',title:'Other religions and the unevangelized',
    question:'How should Christians think about people of other religions, Jewish-Christian relations, and people who never encounter the Christian message?',
    touchpoints:[touch('course.foundations','c1.christianity','introduce'),touch('course.second-temple','c3.jewish-life','contextualize'),touch('course.jesus-church','c4.paul-gentiles','encounter'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.difficult','synthesize'),touch('course.theology','c6.final-hope','synthesize')]
  },
  {
    id:'q.miracles-history',title:'Miracles, history, and evidence',
    question:'How should claims about miracles and historical events be evaluated without either assuming or dismissing them in advance?',
    touchpoints:[touch('course.foundations','c1.reading','introduce'),touch('course.israel','c2.exodus','encounter'),touch('course.second-temple','c3.hasmonean-rome','contextualize'),touch('course.jesus-church','c4.kingdom','encounter'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.providence-life','synthesize')]
  },
  {
    id:'q.disagreement',title:'Christian disagreement and traditions',
    question:'Why do sincere Christians reach different conclusions from shared texts, and how can traditions be compared fairly?',
    touchpoints:[touch('course.foundations','c1.traditions','introduce'),touch('course.second-temple','c3.jewish-life','contextualize'),touch('course.jesus-church','c4.paul-gentiles','encounter'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.traditions','synthesize')]
  },
  {
    id:'q.law-ethics',title:'Law, covenant, and Christian ethics',
    question:'Which biblical commands apply to Christians, how does covenant matter, and how should ethical application move from ancient text to modern life?',
    touchpoints:[touch('course.foundations','c1.reading','introduce'),touch('course.israel','c2.sinai','ground'),touch('course.second-temple','c3.jewish-life','contextualize'),touch('course.jesus-church','c4.teaching','encounter'),touch('course.jesus-church','c4.paul-gentiles','encounter'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.difficult','synthesize')]
  }
];

export const achievements=[
  {id:'achievement.foundations',courseId:'course.foundations',title:'Foundations Complete'},
  {id:'achievement.core',courseId:'course.jesus-church',requiresCourses:['course.foundations','course.israel','course.second-temple','course.jesus-church'],title:'Biblical Literacy Core Complete'},
  {id:'achievement.advanced',courseId:'course.theology',requiresCourses:courses.map(course=>course.id),title:'Advanced Canonical Shelf Complete'}
];

export const unitById=Object.fromEntries(units.map(unit=>[unit.id,unit]));
export const courseById=Object.fromEntries(courses.map(course=>[course.id,course]));
export const questionThreadById=Object.fromEntries(questionThreads.map(thread=>[thread.id,thread]));
