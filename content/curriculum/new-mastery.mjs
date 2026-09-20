import {courses,units} from './structure.mjs';

const sequence=(title,prompt,items,answer,why)=>({kind:'sequence',title,prompt,items,answer,hint:'Reconstruct the relationships taught across this unit.',why});
const match=(title,prompt,items,options,answer,why)=>({kind:'match',title,prompt,items,options,answer,hint:'Use the distinctions practiced across the unit.',why});
const evidence=(title,prompt,items,answer,why)=>({kind:'evidence',title,prompt,items,answer,hint:'Choose only conclusions supported by the course evidence.',why});
const scenario=(title,prompt,stages,why)=>({kind:'scenario',title,prompt,stages,hint:'Work through each decision using the evidence and distinctions you learned.',why});

const specs={
  'c1.christianity':evidence('Christianity in one view','Select the two claims that belong at the center of the introductory Christian proclamation.',['Jesus’ death and resurrection are central.','A learner must settle every denominational controversy before beginning.','Grace, repentance, faith, discipleship, and hope belong in the larger Christian map.','Christianity is only a list of Bible-book names.'],[0,2],'The foundation is a Jesus-centered proclamation developed through a larger life of grace, response, community, and hope.'),
  'c1.bible':match('Navigate the library','Match each question to the category that answers it.',['Which books belong?','How is this ancient wording rendered in English?','What kind of writing is this?'],['Canon','Translation','Genre'],[0,1,2],'Canon, translation, and genre answer different questions.'),
  'c1.transmission':match('Diagnose the difference','Match each investigation to its layer.',['Which manuscript wording is supported?','How should this idiom read in English?','What does the paragraph mean here?'],['Textual evidence','Translation','Interpretation'],[0,1,2],'The strongest beginner habit is identifying the layer before arguing about the answer.'),
  'c1.reading':sequence('Build an interpretation','Put the reading process in a responsible order.',['Application','Observation','Interpretation in context','Evidence/context gathering'],[1,3,2,0],'Application is stronger when it follows observation, contextual evidence, and interpretation.'),
  'c1.theology':match('Name the theological question','Match the question to its category.',['How is Jesus divine and human?','How is humanity reconciled to God?','What is Christian final hope?'],['Incarnation','Salvation','Resurrection/new creation'],[0,1,2],'A map of theology helps the learner locate later disagreements.'),
  'c1.practice':match('Practice and meaning','Match the practice to its introductory role.',['Baptism','Communion','Prayer'],['Initiation/belonging','Shared remembrance/proclamation','Address and response to God'],[0,1,2],'Practices overlap in Christian life but have distinct functions.'),
  'c1.traditions':evidence('Compare Christians fairly','Select the two strongest comparison practices.',['Use a tradition’s own sources.','Assume every congregation perfectly matches national policy.','Distinguish official teaching from local practice.','Define a tradition by one hostile anecdote.'],[0,2],'Fair comparison uses appropriately scoped evidence.'),
  'c1.story':sequence('Rebuild the biblical story','Order the broad movements.',['Jesus and early Church','Exodus and covenant','Creation and human rupture','Kings, Temple, prophets, exile','Abraham and promise','New creation hope'],[2,4,1,3,0,5],'The sequence supplies orientation without claiming that shelf order equals historical chronology.'),
  'c1.synthesis':scenario('Foundations capstone rehearsal','An unfamiliar verse is presented. Choose the best next move at each stage.',[
    {prompt:'First move?',choices:['Identify book, genre, speaker/audience, and surrounding context.','Jump directly to a modern application.','Choose the interpretation you already prefer.'],correct:0},
    {prompt:'Two translations differ. Next?',choices:['Decide one is corrupt immediately.','Ask whether the difference is translation, manuscript evidence, or interpretation.','Ignore the wording.'],correct:1},
    {prompt:'Christians disagree about application. Next?',choices:['Represent the evidence and competing reasoning before choosing an application.','Assume disagreement means the text has no meaning.','Treat one denomination as identical with all Christianity.'],correct:0}
  ],'The capstone integrates navigation, text, context, translation, interpretation, and fair disagreement.'),

  'c2.exodus':sequence('Trace Exodus','Order the movement from oppression toward Sinai.',['Wilderness provision','Passover','Moses’ call','Sea crossing','Sinai'],[2,1,3,0,4],'The Exodus story moves through call, Passover, escape, wilderness, and covenant.'),
  'c2.sinai':sequence('Covenant logic','Order the Sinai relationship.',['Instruction for covenant life','Deliverance from Egypt','Covenant identity/vocation','Rupture and renewal'],[1,2,0,3],'Deliverance precedes covenant responsibility, which can be broken and renewed.'),
  'c2.tabernacle':match('Sacred-space mastery','Match item to location/meaning.',['Ark','Holy Place','Courtyard altar'],['Innermost covenant/presence focus','First sanctuary chamber','Sacrificial activity in the courtyard'],[0,1,2],'Location and meaning work together in tabernacle literacy.'),
  'c2.sacrifice':match('Worship system mastery','Match the concept to the best role.',['Priesthood','Day of Atonement','Passover/Weeks/Booths'],['Ritual office','Annual cleansing/removal complex','Sacred calendar/festival memory'],[0,1,2],'The worship system includes roles, rites, and sacred time rather than one undifferentiated sacrifice idea.'),
  'c2.land-kings':sequence('From land to dynasty','Order the broad movement.',['Solomon','Judges','Davidic covenant','Entry/settlement traditions','Saul'],[3,1,4,2,0],'The sequence moves from land traditions and judges into monarchy and Davidic promise.'),
  'c2.temple-kingdom':sequence('Temple and monarchy','Order the broad story.',['Kingdom divides','Jerusalem becomes royal center','Solomon’s Temple','Prophetic accountability intensifies'],[1,2,0,3],'Temple and monarchy become central institutions that prophets can still hold accountable.'),
  'c2.prophets-exile':match('Prophetic crisis map','Match event to its significance.',['Assyrian conquest of northern kingdom','Babylonian destruction of Jerusalem','Exile'],['Northern kingdom catastrophe','Temple/monarchy collapse','Displacement and theological crisis'],[0,1,2],'Prophetic literature belongs to concrete historical crises.'),
  'c2.restoration-hope':match('Hope after exile','Match the hope to the text-world.',['Second Temple rebuilding','New covenant','Davidic/Spirit hope'],['Restoration under empire','Renewed covenant relationship','Future-oriented royal/restoration expectation'],[0,1,2],'Restoration is real while multiple hopes remain open.'),

  'c3.after-exile':evidence('Persian-period orientation','Select the two accurate claims.',['Return occurs under Persian imperial rule.','Diaspora disappears after return.','Torah/public interpretation becomes visible in postexilic narratives.','A Davidic king regains independent rule immediately.'],[0,2],'Return, diaspora, Scripture, Temple, and imperial rule coexist.'),
  'c3.greek-world':sequence('Hellenistic transition','Order the broad movement.',['Maccabean resistance','Alexander’s conquests','Antiochene crisis','Hellenistic successor kingdoms'],[1,3,2,0],'Alexander’s conquests lead into successor kingdoms and eventually the Antiochene crisis and revolt.'),
  'c3.hasmonean-rome':sequence('Dynasty to empire','Order the political movement.',['Herodian rule','Hasmonean dynasty','Roman intervention','Maccabean revolt'],[3,1,2,0],'The revolt develops into Hasmonean rule before Rome and Herodian client kingship reshape the region.'),
  'c3.jewish-life':match('Jewish institutions and groups','Match each category to its best description.',['Temple','Synagogue','Pharisees','Sadducees','Qumran/Essene association'],['Jerusalem sacrificial/pilgrimage center','Local communal Scripture/assembly setting','Movement associated with interpretation and resurrection belief','Group associated especially with priestly/Temple elite contexts','Important but qualified historical association'],[0,1,2,3,4],'Second Temple Jewish life is institutionally and interpretively diverse.'),
  'c3.expectation':match('Hope and expectation','Match the idea to its category.',['Resurrection','Davidic Messiah','Apocalyptic vision'],['Eschatological hope debated among Jews','Royal messianic stream','Symbolic unveiling of crisis and divine rule'],[0,1,2],'Different forms of hope overlap without becoming one universal checklist.'),
  'c3.enter-gospels':scenario('Enter a Gospel historically','A Gospel scene mentions Pharisees, Passover, and Rome. Choose the best interpretive move at each stage.',[
    {prompt:'Pharisees appear. What first?',choices:['Treat them as all Judaism.','Identify the particular group and dispute.','Assume “Pharisee” means hypocrite.'],correct:1},
    {prompt:'Passover appears. What context matters?',choices:['Exodus memory, pilgrimage, Temple, and festival setting.','Only later Christian Communion.','No historical context.'],correct:0},
    {prompt:'Roman authority appears. What next?',choices:['Consider layered imperial/local power without reducing every scene to politics.','Assume Rome is irrelevant.','Assume every Jewish leader is a Roman official.'],correct:0}
  ],'The bridge course equips the learner to enter Gospel scenes without caricature or historical gaps.'),

  'c4.gospels':match('Four Gospel reading','Match the reading move to its purpose.',['Read each account in its own literary setting','Compare agreements/differences','Build a harmonized summary'],['Preserve authorial shape','Observe relationships','Optional synthesis after prior steps'],[0,1,2],'Comparison is strongest when distinctive accounts are understood before harmonization.'),
  'c4.kingdom':match('Jesus’ ministry map','Match the feature to its role.',['Kingdom','Parable','Disciple'],['God’s reign','Story/comparison inviting insight','Learner/follower'],[0,1,2],'The unit connects proclamation, teaching form, and response.'),
  'c4.teaching':sequence('Sermon movement','Order the broad Sermon on the Mount movement.',['Prayer/hidden practices','Beatitudes','Hearing and doing','Torah/relationships'],[1,3,0,2],'The Sermon forms a connected discourse rather than isolated quotations.'),
  'c4.israel-story':match('Jesus and Israel’s Scriptures','Match the relationship to the example type.',['Explicit citation','Typological reuse','Passover setting'],['Quotation','Earlier pattern reused in a later event','Festival/story context'],[0,1,2],'Jesus traditions engage Israel’s Scriptures through several kinds of relationship.'),
  'c4.passion':sequence('Passion and resurrection','Order the broad movement.',['Resurrection','Last Supper','Crucifixion','Entry/Temple conflict','Ascension'],[3,1,2,0,4],'The unit moves from Jerusalem conflict through meal, death, resurrection, and Ascension.'),
  'c4.pentecost':sequence('Spirit and widening mission','Order the Acts movement.',['Philip/widening mission','Pentecost','Stephen/persecution','Jerusalem community'],[1,3,2,0],'Acts narrates Spirit, community, conflict, and widening mission.'),
  'c4.paul-gentiles':sequence('Gentile inclusion','Order the broad development.',['Acts 15 discernment','Paul’s mission expands','Gentile converts raise belonging questions','Communities continue forming'],[1,2,0,3],'Mission produces concrete belonging questions that require communal discernment.'),
  'c4.expansion':evidence('Earliest Christianity in context','Select the two responsible claims.',['Early Christian communities develop inside Jewish and Greco-Roman worlds.','Christianity becomes instantly uniform after Acts 15.','Letters address real communities and local problems.','Jewish identity becomes irrelevant the moment Gentiles join.'],[0,2],'The early movement expands through diverse communities without erasing its Jewish roots.'),

  'c5.transmission':match('Textual investigation','Match the evidence layer to the question.',['Manuscript witnesses','Variant reading','Textual apparatus'],['Copies used as evidence','Difference among textual witnesses','Scholarly notes reporting readings/evidence'],[0,1,2],'Textual criticism depends on evidence categories rather than suspicion alone.'),
  'c5.translation':match('Translation strategy','Match the goal to the tendency.',['Preserve formal features','Communicate idiom naturally','Freely restate larger meaning'],['Formal tendency','Functional tendency','Paraphrastic tendency'],[0,1,2],'Translation strategies balance competing values rather than forming a simple best-to-worst ladder.'),
  'c5.genre':match('Genre reasoning','Match the text type to a key reading discipline.',['Proverb','Narrative','Apocalypse','Poetry'],['Wisdom saying, not automatic guarantee','Description is not automatically prescription','Symbolic vision in historical/literary context','Attend to imagery and line relationships'],[0,1,2,3],'Genre disciplines interpretation.'),
  'c5.intertext':match('Intertextual relationships','Match the relationship to its description.',['Quotation','Allusion','Typology'],['Explicit textual citation','Indirect echo','Later correspondence with earlier scriptural pattern'],[0,1,2],'Later scriptural use cannot be reduced to one category of prediction.'),
  'c5.gospel-letters':evidence('Composition with evidence labels','Select the two responsible moves.',['Separate internal claims from traditional attribution.','Treat every source hypothesis as a discovered manuscript.','Use Gospel differences to investigate literary emphasis.','Assume ancient source use equals modern plagiarism.'],[0,2],'Composition study requires evidence-controlled historical categories.'),
  'c5.interpretation':sequence('Independent interpretation','Order the process.',['Compare alternative reading','Observe the text','Propose application with limits','Build historical/literary context','State interpretation'],[1,3,4,0,2],'Independent study moves from observation and context toward interpretation, alternatives, and responsible application.'),

  'c6.god-christ':match('Historic doctrinal distinctions','Match the term to its core claim.',['Trinity','Incarnation','Holy Spirit'],['One God, Father/Son/Spirit with real distinction','The Son genuinely becomes human in Jesus Christ','Divine Spirit in Christian Scripture and doctrine'],[0,1,2],'The unit teaches definitions before advanced controversy.'),
  'c6.sin-salvation':match('Salvation images','Match the image to what it highlights.',['Reconciliation','Substitution','Victory'],['Restored relationship','Representation/bearing what belongs to others in a model','Defeat of sin/death/hostile powers'],[0,1,2],'Several biblical/theological images illuminate different aspects of saving work.'),
  'c6.providence-life':evidence('Providence without erasing responsibility','Select the two responsible conclusions.',['God bringing good from harm does not make the harm good.','Foreknowledge and forcing a choice are identical by definition.','Prayer can coexist with practical care and uncertainty.','Every tragedy should be confidently identified as a punishment.'],[0,2],'Providence and prayer are taught without moral or pastoral shortcuts.'),
  'c6.church-practice':match('Church and practice','Match the practice to its domain.',['Baptism','Communion','Ministry/mission'],['Initiation/belonging','Shared meal and proclamation','Service, leadership, and outward vocation'],[0,1,2],'Christian communal life includes distinct but related practices.'),
  'c6.traditions':evidence('Compare systems fairly','Select the two strongest moves.',['Use official sources and concrete local practice.','Treat all Protestants as one theology.','Define terms such as covenant theology or dispensationalism before comparing them.','Assume one national statement describes every member.'],[0,2],'Fair comparison requires definitions and appropriately scoped evidence.'),
  'c6.difficult':match('Difficult-text method','Match each layer to the question.',['Text','Historical context','Interpretation','Application'],['What is actually said?','What world or situation illuminates it?','What does the evidence support as meaning?','How should a later community respond?'],[0,1,2,3],'Difficult questions become more honest when layers are not collapsed.'),
  'c6.final-hope':match('Final-hope map','Match the category to its status.',['Bodily resurrection','Renewed creation','Millennial timeline'],['Historic Christian center','Historic Christian final-hope theme','Disputed framework'],[0,1,2],'The unit distinguishes central hope from disputed chronology.')
};

const unitMastery={};
const placement={};
for(const unit of units){
  const id=`unit-${unit.id.replace(/\./g,'-')}-mastery`;
  const challenge=specs[unit.id];
  if(!challenge)throw new Error(`missing unit mastery spec for ${unit.id}`);
  unitMastery[id]={id,type:'unit-mastery',unitId:unit.id,courseId:unit.courseId,title:`${unit.title} · Unit Mastery`,dek:'Synthesize the unit before moving forward.',body:['This mastery check combines distinctions and relationships from across the unit. It evaluates understanding and reasoning, not theological assent.'],challenge};
  placement[unit.id]=[id];
}

const capstoneSpecs={
  'course.foundations':scenario('Foundations Capstone','Orient an unfamiliar Bible-study question.',[
    {prompt:'A verse is quoted without context.',choices:['Read its paragraph/book setting first.','Apply it immediately.','Choose a denomination first.'],correct:0},
    {prompt:'Translations differ.',choices:['Identify whether the issue is translation, text, or interpretation.','Assume corruption.','Ignore the difference.'],correct:0},
    {prompt:'Christians disagree.',choices:['Represent text/evidence/interpretation before judging application.','Assume no answer exists.','Reduce all traditions to one stereotype.'],correct:0}
  ],'The learner uses the complete Course 1 map.'),
  'course.israel':sequence('Israel Capstone','Reconstruct the historical-biblical bridge.',['Prophetic hope/restoration','Sinai covenant','Temple/monarchy','Exodus/Passover','Exile/destruction','Tabernacle/Ark/sacrifice'],[3,1,5,2,4,0],'The capstone reconstructs the bridge from liberation through worship, kingdom, exile, and hope.'),
  'course.second-temple':sequence('Second Temple Capstone','Rebuild the bridge into the Gospel world.',['Roman/Herodian rule','Persian restoration','Hellenistic world','Jewish groups/institutions','Maccabean/Hasmonean developments','Messianic/apocalyptic expectations'],[1,2,4,0,3,5],'The period moves from Persian restoration through Greek and Hasmonean developments into Roman rule and a diverse Jewish world.'),
  'course.jesus-church':sequence('Jesus & Early Church Capstone','Trace the movement from Gospel proclamation to expanding communities.',['Paul/Gentile mission','Jesus’ kingdom and teaching','Pentecost/Jerusalem Church','Passion/resurrection/Ascension','Four Gospel witnesses'],[4,1,3,2,0],'The course moves from Gospel witness through Jesus’ ministry and passion into Spirit-empowered mission.'),
  'course.interpretation':scenario('Interpretation Capstone','Build an accountable reading.',[
    {prompt:'First?',choices:['Observe genre, wording, literary context.','Choose application.','Search for a confirming quote.'],correct:0},
    {prompt:'A later biblical text reuses it.',choices:['Classify quotation/allusion/typology and preserve both contexts.','Call every reuse prediction.','Discard the earlier meaning.'],correct:0},
    {prompt:'A disputed conclusion remains.',choices:['State confidence, alternatives, and limits.','Hide uncertainty.','Treat uncertainty as meaninglessness.'],correct:0}
  ],'Advanced study integrates textual, literary, historical, and intertextual reasoning.'),
  'course.theology':scenario('Theology Capstone','Explain a disputed Christian question without collapsing evidence layers.',[
    {prompt:'Start with?',choices:['Define the claim and distinguish text, doctrine, and application.','Choose a winner first.','Begin with a hostile label.'],correct:0},
    {prompt:'Traditions differ.',choices:['Represent each using evidence adherents would recognize.','Flatten them into one position.','Treat difference as bad faith.'],correct:0},
    {prompt:'Pastoral consequences are serious.',choices:['State limits and avoid claims beyond evidence.','Use certainty to end discussion.','Diagnose people from a text.'],correct:0}
  ],'The capstone tests fair representation, theological reasoning, and interpretive restraint.')
};

const courseCapstones={};
for(const course of courses){
  const lastUnit=units.filter(unit=>unit.courseId===course.id).at(-1);
  const id=`course-${course.sequence}-capstone`;
  courseCapstones[id]={id,type:'course-capstone',unitId:lastUnit.id,courseId:course.id,title:`${course.shortTitle} · Course Capstone`,dek:'Transfer the course’s knowledge into a cumulative problem.',body:['This capstone asks you to reconstruct and use the course, not merely recognize isolated terms.'],challenge:capstoneSpecs[course.id]};
  placement[lastUnit.id].push(id);
}

export const newMastery={...unitMastery,...courseCapstones};
export const newMasteryPlacement=placement;
export const newMasteryIds=Object.keys(newMastery);
export const courseCapstoneIds=Object.values(courseCapstones).map(item=>item.id);
