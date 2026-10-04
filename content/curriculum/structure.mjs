export const RETENTION_DAYS=[1,3,7,14,30,60];

const course=(config)=>({
  ...config,
  activeStudyMinutes:{min:config.activeStudyMinutes.min,max:config.activeStudyMinutes.max},
  timingNote:'Estimated active study time for first-pass course completion; spaced retention continues after completion.'
});

export const courses=[
  course({
    id:'module.canon',sequence:1,title:'Reading the Bible Well: The Library and Its Story',shortTitle:'Reading the Bible Well',
    level:'core',phaseLabel:'Start here',achievement:'Module 1 Complete',activeStudyMinutes:{min:330,max:450},
    scope:'The central Christian claim, the questions that worry new readers, the Bible as a library of different kinds of writing, and the story from creation to Abraham, with each reading skill taught the first time a passage needs it.',
    outcome:'State what Christianity claims at its center, find your way around the Bible, and read a passage by first recognizing what kind of writing it is and what it claims.',
    learnerPromise:'You can learn what Christians claim before deciding whether you believe it. Hard questions are welcome here and get honest first answers, with deeper answers later.'
  }),
  course({
    id:'module.hebrew-scriptures',sequence:2,title:'The Hebrew Scriptures & the Near Eastern World',shortTitle:'Hebrew Scriptures',
    level:'core',phaseLabel:'Israel and its Scriptures',achievement:null,activeStudyMinutes:{min:480,max:690},
    scope:'Exodus, Sinai, tabernacle, sacrifice, land and kings, temple, wisdom and worship, prophets, exile, and restoration, read in their ancient Near Eastern setting.',
    outcome:'Explain how Exodus, covenant, law, worship, wisdom, temple, exile, and prophetic hope supply the vocabulary later used by Jesus and the New Testament.',
    learnerPromise:'Law, poetry, and prophecy are each taught where they first appear, and difficult texts are read honestly in their setting rather than skipped.'
  }),
  course({
    id:'module.christ-event',sequence:3,title:'Second Temple Judaism & the Christ Event',shortTitle:'Second Temple & Christ',
    level:'core',phaseLabel:'Jesus in his world',achievement:'Biblical Literacy Core Complete',activeStudyMinutes:{min:900,max:1290},
    scope:'The world between the testaments, Jewish life and hope, the four Gospels with their manuscripts and translations, Jesus\u2019 kingdom, teaching, death and resurrection, Pentecost, and Paul\u2019s letters to real communities.',
    outcome:'Read the Gospels and letters inside the Jewish and Roman world that produced them, and explain how manuscripts and translation affect what we read.',
    learnerPromise:'Questions about Messiah, resurrection, manuscripts, and Paul are answered with the history needed to weigh them, and texts left out of the Bible are shown and labeled where they come up.'
  }),
  course({
    id:'module.synthesis',sequence:4,title:'Systematic Synthesis, Hard Ethics & Living Practice',shortTitle:'Synthesis & Practice',
    level:'advanced',phaseLabel:'Bringing it together',achievement:'Advanced Canonical Shelf Complete',activeStudyMinutes:{min:510,max:750},
    scope:'God and Christ, sin and salvation, providence and prayer, Church and practice, Christian traditions, difficult texts and questions, building your own interpretation, and final hope.',
    outcome:'Explain major Christian claims and disagreements fairly, identify their evidence and limits, and build and defend a responsible interpretation without confusing understanding with personal assent.',
    learnerPromise:'Difficult questions met earlier come back here with better tools. You learn the major options and their evidence, and agreement is never what is assessed.'
  })
];

const unit=(courseId,sequence,id,title,scope)=>({id,courseId,sequence,title,scope});

export const units=[
  unit('module.canon',1,'c1.christianity','Christianity in One View','Jesus, gospel, cross, resurrection, grace, faith, repentance, discipleship, Church, Christian hope, and the major questions the curriculum will revisit.'),
  unit('module.canon',2,'c1.bible','What the Bible Is','Bible as library; Old and New Testaments; canon; books, chapters, verses; literary variety.'),
  unit('module.canon',3,'c1.story','The Biblical Story in One View','Creation, Abraham, Exodus, covenant, Israel, David, temple, prophets, exile, Jesus, Church, and new creation.'),
  unit('module.canon',4,'c1.synthesis','Putting the Map Together','Reconstruct the map from Module 1 and use it to orient an unfamiliar passage or difficult question without collapsing evidence, interpretation, doctrine, and application.'),
  unit('module.hebrew-scriptures',1,'c2.exodus','Egypt and Exodus','Israel in Egypt, Moses, divine name, Pharaoh, plagues, Passover, sea crossing, wilderness, and liberation.'),
  unit('module.hebrew-scriptures',2,'c2.sinai','Sinai and Covenant','Sinai, covenant ceremony, commandments, covenant law, golden calf, rupture, renewal, and covenant responsibility.'),
  unit('module.hebrew-scriptures',3,'c2.tabernacle','Tabernacle, Ark and Presence','Tabernacle purpose and layout, Ark of the Covenant, mercy seat, sacred space, and divine presence.'),
  unit('module.hebrew-scriptures',4,'c2.sacrifice','Sacrifice, Holiness and Sacred Time','Priesthood, offerings, Day of Atonement, clean/unclean, holiness, Sabbath, and Israel’s festival calendar.'),
  unit('module.hebrew-scriptures',5,'c2.land-kings','Land, Judges and Kings','Land traditions, conquest questions, Judges, Ruth, Samuel, Saul, David, Davidic covenant, and Solomon.'),
  unit('module.hebrew-scriptures',6,'c2.temple-kingdom','Temple and Kingdom','Jerusalem, Solomon’s Temple, Ark and presence, worship, divided monarchy, power, and prophetic accountability.'),
  unit('module.hebrew-scriptures',7,'c5.genre','Wisdom and Worship','Psalms, Proverbs, Job, Ecclesiastes, and the Song of Songs after the monarchy, with Hebrew poetry taught where it first appears.'),
  unit('module.hebrew-scriptures',8,'c2.prophets-exile','Prophets, Exile and Destruction','Prophetic vocation and genres, Assyria, Judah, Babylon, Jerusalem’s destruction, temple loss, lament, and exile.'),
  unit('module.hebrew-scriptures',9,'c2.restoration-hope','Restoration and Prophetic Hope','Persian return, rebuilding, Second Temple, new covenant, restored presence, Davidic/messianic hope, Spirit, kingdom, and renewed creation.'),
  unit('module.christ-event',1,'c3.after-exile','After the Exile','Persian-period Judea, Second Temple Jerusalem, Ezra-Nehemiah, Torah, identity, and diaspora.'),
  unit('module.christ-event',2,'c3.greek-world','The Greek World','Alexander, Hellenization, successor kingdoms, Antiochus IV, Maccabean revolt, and temple rededication.'),
  unit('module.christ-event',3,'c3.hasmonean-rome','Hasmoneans, Rome and Herod','Hasmonean rule and conflict, Roman intervention, Herodian rule, building programs, Judea, and Galilee.'),
  unit('module.christ-event',4,'c3.jewish-life','Jewish Life and Jewish Diversity','Temple, priesthood, synagogues, diaspora, Torah, Pharisees, Sadducees, Essenes/Qumran, scribes, and revolutionary currents.'),
  unit('module.christ-event',5,'c3.expectation','Hope and Expectation','Apocalyptic thought, resurrection debates, messianic diversity, Davidic and priestly hopes, Son of Man imagery, restoration, and kingdom.'),
  unit('module.christ-event',6,'c3.enter-gospels','Entering the Gospels','Judea, Galilee, Samaria, Rome, taxation, Temple authority, Jewish disputes, Messiah language, and why Jesus must be read within Judaism.'),
  unit('module.christ-event',7,'c4.gospels','Four Gospels','Gospel as literary proclamation; Mark, Matthew, Luke, John; comparison without flattening.'),
  unit('module.christ-event',8,'c1.transmission','How We Got the Bible','Hebrew, Aramaic, and Greek; copying, manuscripts, textual variants, and translation, met where the Gospels make these questions real.'),
  unit('module.christ-event',9,'c5.transmission','Text, Manuscripts and Transmission','Composition, Hebrew/Aramaic/Greek, copying, textual variants, scribal phenomena, manuscript witnesses, Dead Sea Scrolls, codices, and apparatus.'),
  unit('module.christ-event',10,'c5.translation','Translation','Translation as interpretation, formal and functional equivalence, paraphrase, idiom, semantic range, and comparison.'),
  unit('module.christ-event',11,'c4.kingdom','Jesus and the Kingdom','John the Baptist, baptism, kingdom, disciples, miracles, signs, parables, welcome, and table fellowship.'),
  unit('module.christ-event',12,'c4.teaching','Jesus’ Teaching','Sermon on the Mount, Beatitudes, Torah, enemy-love, Lord’s Prayer, wealth, judgment, mercy, and neighbor-love.'),
  unit('module.christ-event',13,'c4.israel-story','Jesus and Israel’s Story','Torah, Sabbath, Temple, Messiah, Son of Man, prophecy and fulfillment, Passover imagery, and Jesus’ use of Israel’s Scriptures.'),
  unit('module.christ-event',14,'c4.passion','Passion and Resurrection','Jerusalem, Temple confrontation, Last Supper, arrest, trial, crucifixion, death, resurrection accounts, and Ascension.'),
  unit('module.christ-event',15,'c4.pentecost','Pentecost and the Jerusalem Church','Pentecost, Spirit, mission, early community, Temple, Stephen, persecution, Philip, and widening mission.'),
  unit('module.christ-event',16,'c1.reading','Reading Somebody Else\u2019s Mail','Letters were written by real people to real communities: author, audience, and crisis come before theology. Context, recovering the conversation, and responsible application.'),
  unit('module.christ-event',17,'c4.paul-gentiles','Paul and Gentile Inclusion','Paul, mission, Gentile converts, Acts 15, Torah and Gentile Christians, journeys, and community formation.'),
  unit('module.christ-event',18,'c4.expansion','Christianity Begins to Expand','Letters and communities, Jewish/Gentile identity, Roman social world, pressure and persecution, and early Christian diversity.'),
  unit('module.christ-event',19,'c5.intertext','Scripture Interpreting Scripture','Quotation, allusion, echo, typology, direct prophecy, fulfillment, original context, later use, and canonical trajectories.'),
  unit('module.christ-event',20,'c5.gospel-letters','Gospel and Letter Study','Synoptic relationships, harmonization, arrangement, attribution/authorship, ancient letters, audience, occasion, rhetoric, and argument.'),
  unit('module.synthesis',1,'c1.theology','Theology You Need Before Continuing','God, Trinity, incarnation, Spirit, sin, salvation, resurrection, and the difference between central claims and disputed explanations.'),
  unit('module.synthesis',2,'c6.god-christ','God and Christ','God, Trinity, incarnation, Jesus’ divinity and humanity, Holy Spirit, creeds, and doctrinal reasoning.'),
  unit('module.synthesis',3,'c6.sin-salvation','Humanity, Sin and Salvation','Image of God, sin, mortality, grace, repentance, faith, cross, resurrection, atonement models, and reconciliation.'),
  unit('module.synthesis',4,'c6.providence-life','Providence and Christian Life','Providence, foreknowledge, predestination, freedom, prayer, miracles, suffering, formation, and ethics.'),
  unit('module.synthesis',5,'c1.practice','Christian Practice','Baptism, Communion, prayer, worship, discipleship, community, and the relationship between belief and practice.'),
  unit('module.synthesis',6,'c6.church-practice','Church and Practice','Church, baptism, Communion, worship, ministry, leadership, mission, and Christian community.'),
  unit('module.synthesis',7,'c1.traditions','Christians Do Not All Read the Same Way','Traditions, denominations, authority, sacraments, interpretation, theological disagreement, and fair comparison.'),
  unit('module.synthesis',8,'c6.traditions','Christian Traditions','Creeds/councils, Catholic/Orthodox/Protestant orientation, Reformation, authority, sacraments, polity, and denominational comparison.'),
  unit('module.synthesis',9,'c6.difficult','Difficult Texts and Questions','Synthesize the curriculum’s earlier encounters with conquest, slavery, women, sexuality/LGBTQ interpretation, Judaism and supersessionism, religions, suffering, miracles, spiritual evil, and discernment.'),
  unit('module.synthesis',10,'c5.interpretation','Building an Interpretation','Observation, literary and historical context, evidence, interpretation, alternatives, application, confidence, uncertainty, and independent study.'),
  unit('module.synthesis',11,'c6.final-hope','Resurrection and Final Hope','Resurrection, judgment, renewed creation, final punishment, universal reconciliation/conditional immortality, unevangelized, millennial frameworks, rapture readings, Revelation, and hope.')
].map((entry,index)=>({...entry,globalSequence:index+1}));

// Touchpoints name the unit; the module comes from the unit, so moving a unit moves its touchpoints with it.
const touch=(_legacyCourseId,unitId,stage)=>({courseId:units.find(unit=>unit.id===unitId).courseId,unitId,stage});

export const questionThreads=[
  {id:'q.god-christ',title:'God, Trinity, and Jesus',question:'How can Christians speak of one God, Father, Son, and Spirit, while also confessing Jesus as divine and human?',touchpoints:[touch('course.foundations','c1.theology','introduce'),touch('course.second-temple','c3.expectation','contextualize'),touch('course.jesus-church','c4.israel-story','encounter'),touch('course.interpretation','c5.intertext','investigate'),touch('course.theology','c6.god-christ','synthesize')]},
  {id:'q.scripture-trust',title:'Scripture, transmission, and trust',question:'Can an ancient collection copied, translated, and interpreted across centuries be read responsibly and trusted?',touchpoints:[touch('course.foundations','c1.bible','introduce'),touch('course.foundations','c1.transmission','ground'),touch('course.interpretation','c5.transmission','investigate'),touch('course.interpretation','c5.translation','investigate'),touch('course.interpretation','c5.interpretation','synthesize')]},
  {id:'q.sin-salvation',title:'Sin, salvation, and the cross',question:'What is sin, what does salvation mean, and why did Jesus die?',touchpoints:[touch('course.foundations','c1.theology','introduce'),touch('course.israel','c2.sinai','ground'),touch('course.israel','c2.sacrifice','ground'),touch('course.jesus-church','c4.passion','encounter'),touch('course.interpretation','c5.intertext','investigate'),touch('course.theology','c6.sin-salvation','synthesize')]},
  {id:'q.suffering-evil',title:'Suffering, evil, and providence',question:'Why does suffering exist, what does God do about it, and how should providence and human freedom be understood?',touchpoints:[touch('course.foundations','c1.theology','introduce'),touch('course.israel','c2.prophets-exile','encounter'),touch('course.jesus-church','c4.passion','encounter'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.providence-life','synthesize')]},
  {id:'q.violence-slavery',title:'Violence, conquest, and slavery',question:'How should readers understand biblical texts involving conquest, violence, slavery, domination, or morally difficult social systems?',touchpoints:[touch('course.foundations','c1.reading','introduce'),touch('course.israel','c2.land-kings','encounter'),touch('course.jesus-church','c4.teaching','compare'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.difficult','synthesize')]},
  {id:'q.sexuality',title:'Sexuality, LGBTQ interpretation, and relationships',question:'Why do Christians disagree about sexuality and LGBTQ inclusion, and what evidence is required to interpret the relevant texts responsibly?',touchpoints:[touch('course.foundations','c1.traditions','introduce'),touch('course.israel','c2.sinai','contextualize'),touch('course.second-temple','c3.jewish-life','contextualize'),touch('course.jesus-church','c4.expansion','encounter'),touch('course.interpretation','c5.translation','investigate'),touch('course.interpretation','c5.gospel-letters','investigate'),touch('course.theology','c6.difficult','synthesize')]},
  {id:'q.women-ministry',title:'Women, ministry, and authority',question:'How should texts about women, leadership, household roles, teaching, and ministry be interpreted across their historical settings?',touchpoints:[touch('course.foundations','c1.practice','introduce'),touch('course.second-temple','c3.jewish-life','contextualize'),touch('course.jesus-church','c4.expansion','encounter'),touch('course.interpretation','c5.gospel-letters','investigate'),touch('course.theology','c6.difficult','synthesize')]},
  {id:'q.judgment-hope',title:'Judgment, hell, resurrection, and final hope',question:'What do Christians mean by judgment, resurrection, hell, eternal life, and new creation, and why do final-destiny views differ?',touchpoints:[touch('course.foundations','c1.theology','introduce'),touch('course.second-temple','c3.expectation','contextualize'),touch('course.jesus-church','c4.teaching','encounter'),touch('course.interpretation','c5.genre','investigate'),touch('course.theology','c6.final-hope','synthesize')]},
  {id:'q.religions',title:'Other religions and the unevangelized',question:'How should Christians think about people of other religions, Jewish-Christian relations, and people who never encounter the Christian message?',touchpoints:[touch('course.foundations','c1.christianity','introduce'),touch('course.second-temple','c3.jewish-life','contextualize'),touch('course.jesus-church','c4.paul-gentiles','encounter'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.difficult','synthesize'),touch('course.theology','c6.final-hope','synthesize')]},
  {id:'q.miracles-history',title:'Miracles, history, and evidence',question:'How should claims about miracles and historical events be evaluated without either assuming or dismissing them in advance?',touchpoints:[touch('course.foundations','c1.reading','introduce'),touch('course.israel','c2.exodus','encounter'),touch('course.second-temple','c3.hasmonean-rome','contextualize'),touch('course.jesus-church','c4.kingdom','encounter'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.providence-life','synthesize')]},
  {id:'q.disagreement',title:'Christian disagreement and traditions',question:'Why do sincere Christians reach different conclusions from shared texts, and how can traditions be compared fairly?',touchpoints:[touch('course.foundations','c1.traditions','introduce'),touch('course.second-temple','c3.jewish-life','contextualize'),touch('course.jesus-church','c4.paul-gentiles','encounter'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.traditions','synthesize')]},
  {id:'q.law-ethics',title:'Law, covenant, and Christian ethics',question:'Which biblical commands apply to Christians, how does covenant matter, and how should ethical application move from ancient text to modern life?',touchpoints:[touch('course.foundations','c1.reading','introduce'),touch('course.israel','c2.sinai','ground'),touch('course.second-temple','c3.jewish-life','contextualize'),touch('course.jesus-church','c4.teaching','encounter'),touch('course.jesus-church','c4.paul-gentiles','encounter'),touch('course.interpretation','c5.interpretation','investigate'),touch('course.theology','c6.difficult','synthesize')]}
];

// Keep each question's progression (introduce, then ground, ... then synthesize) in the order a learner now meets the units.
{
  const position=Object.fromEntries(units.map((unit,index)=>[unit.id,index]));
  for(const thread of questionThreads){
    const stages=thread.touchpoints.map(point=>point.stage);
    thread.touchpoints.sort((a,b)=>position[a.unitId]-position[b.unitId]);
    thread.touchpoints.forEach((point,index)=>{point.stage=stages[index]});
  }
}

export const achievements=[
  {id:'achievement.foundations',courseId:'module.canon',title:'Module 1 Complete'},
  {id:'achievement.core',courseId:'module.christ-event',requiresCourses:['module.canon','module.hebrew-scriptures','module.christ-event'],title:'Biblical Literacy Core Complete'},
  {id:'achievement.advanced',courseId:'module.synthesis',requiresCourses:courses.map(course=>course.id),title:'Advanced Canonical Shelf Complete'}
];

// Old six-course IDs, kept so saved links and bookmarks still open the module that now holds that material.
export const legacyCourseAliases={
  'course.foundations':'module.canon',
  'course.israel':'module.hebrew-scriptures',
  'course.second-temple':'module.christ-event',
  'course.jesus-church':'module.christ-event',
  'course.interpretation':'module.synthesis',
  'course.theology':'module.synthesis'
};

export const unitById=Object.fromEntries(units.map(unit=>[unit.id,unit]));
export const courseById=Object.fromEntries(courses.map(course=>[course.id,course]));
export const questionThreadById=Object.fromEntries(questionThreads.map(thread=>[thread.id,thread]));
