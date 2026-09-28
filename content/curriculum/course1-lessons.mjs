import {lesson,sequence,match,evidence,drawer} from './helpers.mjs';

export const course1Lessons=[

  // Content for c1-library-groups is authored in content/pathway/lessons/c1-library-groups.md; this entry only registers the lesson.
  lesson({
    id:'c1-library-groups',unitId:'c1.bible',title:'Meet the library: nine kinds of books',reading:'Luke 24:44–45',ref:[42,24,44,45],
    objective:'Name the nine groups of the 66-book Protestant Bible, say what each group contains, and choose a sensible place to start reading in each.',
    body:[
      'The Bible is not one book written in one style. It is a library of 66 books, written over many centuries by many authors, and gathered in two collections: the Old Testament, Israel’s scriptures, and the New Testament, the writings of the first Christians. Jesus himself describes Israel’s scriptures in groups: “the Law of Moses, the Prophets, and the Psalms.” Knowing which shelf a book sits on is the first step to reading it well.',
      'The Law, Genesis through Deuteronomy, tells Israel’s founding story: creation, the ancestors, the Exodus from Egypt, and the covenant given at Sinai. The stories frame the laws. The laws show what a covenant community was meant to look like in its own world, not a rulebook to copy item by item. Begin with Genesis 1–3 and 12, then Exodus 1–3 and 20.',
      'The History books, Joshua through Esther, follow Israel in the land: judges, kings, a divided kingdom, exile, and return. This is theological history. The writers are asking why things happened, not only reporting that they did, so expect repeated patterns of faithfulness and failure. Begin with 1 Samuel 16–17, 2 Kings 17, and Nehemiah 8.',
      'Wisdom and Poetry, Job through Song of Songs, gathers prayers, songs, sayings, and reflections on suffering, love, and how life works. Read these slowly and listen for images. Hebrew poetry often pairs lines so the second deepens the first. It expresses and wrestles more than it reports. Begin with Psalms 1, 23, and 139, Proverbs 1, and Job 38.',
      'The Major Prophets, Isaiah through Daniel, are long books addressing Israel before, during, and after the exile. The Minor Prophets, Hosea through Malachi, are twelve shorter books; “minor” means short, not less important. Prophets mostly speak to their own time: warning, pleading, and promising. Look for who is being addressed and what injustice is named before looking for predictions. Begin with Isaiah 1 and 40, Jeremiah 31, Amos 5, Micah 6, and all four chapters of Jonah.',
      'In the New Testament, the Gospels and Acts tell the life, death, and resurrection of Jesus and the story of the early church. Each Gospel tells the same story for a different audience, so notice what each one emphasizes; Acts continues Luke. Begin with Mark, the shortest Gospel, then Luke 15 and Acts 2.',
      'Paul’s Letters, Romans through Philemon, and the General Letters, Hebrews through Jude, were written to specific churches and wider Christian audiences dealing with real problems. You are reading someone else’s mail: find the writer, the readers, and the situation first, then the teaching. Begin with Philippians, Romans 5–8, James 1–2, and 1 John 4.',
      'Revelation stands on its own shelf. It is apocalyptic writing, a symbolic vision about suffering, empire, and God making all things new. Ask what its images meant to its first readers before asking what they say about the future. Begin with Revelation 1 and 21–22.',
      'These nine groups are shelf labels, not strict categories. A history book can contain a poem, a prophet can tell a story, and a letter can quote a hymn. The next lesson looks closely at those kinds of writing and what each one is claiming.'
    ],
    simple:'The Bible is a library of 66 books on nine shelves: Law, History, Wisdom and Poetry, Major Prophets, Minor Prophets, Gospels and Acts, Paul’s Letters, General Letters, and Revelation. Each shelf is read a little differently.',
    vocab:{
      'Old Testament':'The 39 books of Israel’s scriptures, written mostly in Hebrew, which Christians share with the Jewish tradition.',
      'New Testament':'The 27 books written by the first Christians about Jesus and the early church, written in Greek.',
      'Pentateuch':'The first five books of the Bible, also called the Law or the Torah.',
      'Canon':'The collection of books a community recognizes as Scripture; Protestant Bibles contain 66 books.'
    },
    deeper:'The group names used here follow common Protestant arrangement. Jewish Bibles arrange the same Hebrew books differently, into Law, Prophets, and Writings, and Catholic and Orthodox Bibles include additional books. Each book’s profile on the Bible page shows its themes, people, setting, and where to begin.',
    drawers:[
      drawer('Why nine groups and not two?','Old and New Testament tell you which collection a book belongs to. The nine groups tell you what kind of book you are holding, which changes how you read it.'),
      drawer('Do I have to read the Bible in order?','No. Many readers start with a Gospel, then Genesis and Exodus, then the Psalms. The shelf helps you know where you are wherever you begin.'),
      drawer('Are the Apocrypha missing?','Protestant Bibles do not include the additional books found in Catholic and Orthodox Bibles. The extra-credit module covers them, along with how the canon took shape.')
    ],
    visual:{text:'Old Testament: Law · History · Wisdom and Poetry · Major Prophets · Minor Prophets | New Testament: Gospels and Acts · Paul’s Letters · General Letters · Revelation',title:'The nine shelves of the library'},
    challenges:[
      match('Shelve the book','Match each book to its group.',['Leviticus','Psalms','Amos','Galatians','Acts'],['Paul’s Letters','Law','Gospels and Acts','Minor Prophets','Wisdom and Poetry'],[1,4,3,0,2],'Leviticus belongs to the Law, Psalms to Wisdom and Poetry, Amos to the Minor Prophets, Galatians to Paul’s Letters, and Acts to the Gospels and Acts.'),
      evidence('Read the shelf, not just the book','Which two statements follow from this lesson?',['Knowing a book’s group helps you choose how to read it.','A “minor” prophet is less important than a major one.','A letter is best read by first finding its writer, readers, and situation.','Every book fits exactly one pure genre.'],[0,2],'Groups guide reading, “minor” means short, and books often mix forms, so the group is a starting point rather than a rule.')
    ],
    reflect:'Which shelf feels least familiar to you, and where will you start reading it?',
    model:'A strong response names one group, says what makes it unfamiliar, and picks one of the suggested starting places.',
    questionThreadIds:['q.scripture-trust']
  }),

  // Content for c1-reading-kinds is authored in content/pathway/lessons/c1-reading-kinds.md; this entry only registers the lesson.
  lesson({
    id:'c1-reading-kinds',unitId:'c1.bible',title:'How to read what you’re reading',reading:'Nehemiah 8:8',ref:[16,8,8,8],
    objective:'Recognize the main kinds of biblical writing, explain what kind of claim each makes, and describe the views Christians hold where they read a passage differently.',
    body:[
      'When the scriptures were read aloud in Nehemiah’s day, the teachers “read from the Book of the Law of God, explaining it and giving it meaning.” Understanding a passage starts with recognizing what kind of writing it is. A news report, a love song, and a parable can all tell the truth, but they do not make the same kind of claim.',
      'Historical narrative names people and places and moves through events: “and then.” It claims that these things happened, told to show their meaning. The writers select and emphasize, as every historian does; selection is not distortion. Samuel, Kings, and Acts are examples. Close to it is summary and compressed history: genealogies, “in those days,” centuries covered in a sentence. Genesis 5 and 11, Chronicles, and Judges 2 give the shape of a period, not a complete record, so treating their numbers as a full timeline asks more of them than they offer.',
      'Law uses commands and cases, such as “if a man…”. It describes how a covenant community should live in its world. Copying every ancient rule directly and dismissing them all are both mistakes. Poetry uses paired lines, images, and strong feeling. It tells the truth about God and life by expressing it rather than reporting it, so when a psalm says the hills clap their hands, it is not describing geology. Wisdom sayings, like Proverbs, observe how life usually works; a proverb is a general truth, not a promise.',
      'Prophecy begins “thus says the LORD” and carries warnings, oaths, and promises. It is mainly God’s verdict on present injustice and hope beyond it, not a set of coded predictions. Apocalyptic writing, in Daniel 7–12 and Revelation, uses beasts, numbers, and cosmic symbols to show the deep reality behind history: evil is real, and God wins. Decoding each symbol as a news headline misreads it.',
      'A parable is a story Jesus tells, such as “a man had two sons.” It is made up on purpose to carry a true point, so asking whether the prodigal son was a real person misses what it is. Allegory, where each detail stands for something else, is rare in the Bible; Paul uses the word himself in Galatians 4:24. Turning every story into allegory is a common mistake. Letters teach real people facing a real crisis, and Gospels are ancient biographies: true events, deliberately arranged, not modern day-by-day chronicles.',
      'For some passages, serious Christian readers disagree about the kind of writing. Genesis 1–11 is read by some as literal history in detail, by others as true history told in stylized and symbolic form, and by others as theological story using ancient forms to make claims about God and people. Jonah is read as a historical account, as a historically based story shaped as satire, or as a parable-like prophetic story; its point about God’s mercy stands under every reading. Job is read as the story of a historical person or as a wisdom debate built around one. Daniel is dated by some to the 500s BCE and by others to visions compiled in the 100s BCE. Revelation is read as future events, as symbols for every era, as mainly about the first century, or as a mix of these.',
      'The key line is simple: “not literal” never means “not true.” A parable, a psalm, or a vision can tell the truth as fully as a report does. It just is not a report. Where Christians disagree, Canonical Shelf shows the views side by side and leaves the decision with you.'
    ],
    simple:'Every passage is a kind of writing: history, summary, law, poetry, wisdom, prophecy, apocalyptic vision, parable, letter, or Gospel. Knowing the kind tells you what the passage is claiming. “Not literal” never means “not true.”',
    vocab:{
      'Historical narrative':'Writing that tells events as having happened, selected and shaped to show their meaning.',
      Parable:'A story told to make a point; it is not presented as a report of real events.',
      Allegory:'Writing in which details stand for other things; rare in the Bible and usually signaled by the text.',
      Apocalyptic:'Writing that uses symbolic visions to reveal the reality behind history, as in Daniel and Revelation.',
      Genre:'The kind of writing a text is, which shapes the kind of claim it makes.'
    },
    deeper:'Genre recognition is not a way to avoid hard passages. It is how every careful reader, ancient and modern, decides what a text is asking of them. Later units return to each form in depth, and the extra-credit module covers debates about dating and authorship.',
    drawers:[
      drawer('If Genesis 1 is not literal, is it made up?','No. Christians who read Genesis 1 as stylized or theological still read it as true: it claims that God made the world good and gave people dignity and responsibility. The disagreement is about what kind of account it is, not whether it tells the truth.'),
      drawer('Did Jesus think the parables were real events?','Parables were a known teaching form in Jesus’ world. Their power comes from their point, which is why they begin like stories rather than reports.'),
      drawer('Who decides which reading is right?','You do, with evidence. Canonical Shelf states its own positions where it has them, shows the strongest alternatives fairly, and never scores agreement.')
    ],
    visual:{text:'History · Summary · Law · Poetry · Wisdom · Prophecy · Apocalyptic · Parable · Allegory · Letter · Gospel',title:'Kinds of biblical writing'},
    challenges:[
      match('Name the kind of writing','Match each passage to its kind of writing.',['“A man had two sons…” (Luke 15:11)','“Trust in the LORD with all your heart” (Proverbs 3:5)','“Paul, an apostle… to the churches in Galatia” (Galatians 1:1–2)','“A beast rising out of the sea, with ten horns” (Revelation 13:1)','“The mountains skipped like rams” (Psalm 114:4)'],['Poetry','Letter','Parable','Apocalyptic vision','Wisdom saying'],[2,4,1,3,0],'Recognizing the form tells you what each passage is doing: a teaching story, a general truth, correspondence, a symbolic vision, and poetic imagery.'),
      evidence('What is it claiming?','Choose the two statements that read these passages well.',['Psalm 114 expresses the awe of the Exodus through images; it does not report moving mountains.','The parable of the prodigal son fails if no such family existed.','A proverb states a general truth about life rather than a guarantee.','Poetry cannot tell the truth because it is not literal.'],[0,2],'Poetry expresses truth through images, parables carry their point without being reports, and proverbs describe how life usually works.')
    ],
    reflect:'Which reading of Jonah do you lean toward right now, and what in the text points you there?',
    model:'A strong response names one of the readings, points to something in the text such as its humor, structure, or ending, and notes that the book’s point about God’s mercy holds either way. This reflection is never scored for which view you hold.',
    questionThreadIds:['q.scripture-trust','q.miracles-history','q.disagreement']
  }),
  lesson({
    id:'c1-questions-first',unitId:'c1.christianity',title:'Questions worth carrying',reading:'Acts 17:10–12',ref:[44,17,10,12],
    objective:'Explain why Canonical Shelf introduces difficult questions early while delaying stronger conclusions until the learner has enough biblical, historical, and interpretive foundation to evaluate them responsibly.',
    body:[
      'Thoughtful adults rarely begin Bible study without questions. Why does suffering exist? Why did Jesus die? What is sin? Can Scripture be trusted after centuries of copying and translation? Why do Christians disagree about sexuality, women, hell, miracles, predestination, violence, other religions, or which biblical commands still apply? Canonical Shelf will not treat those questions as distractions from the curriculum. They are part of the reason for the curriculum.',
      'But an important question is not automatically a simple question. A single verse may sit inside an ancient language, literary genre, covenant, historical conflict, argument, or later doctrinal debate. Answering before learning those layers can produce confidence faster than understanding. Acts praises hearers who receive a claim seriously and also examine the evidence. That combination—openness plus investigation—is the posture this course is designed to build.',
      'Course 1 therefore gives you the map and responsible first-pass answers. It introduces Christianity, Scripture, translation, interpretation, theology, practice, traditions, and the biblical story. Courses 2–4 then supply much of the biblical and historical evidence: covenant and law, sacrifice and temple, exile and hope, the Second Temple world, Jesus, the cross and resurrection, Acts, Paul, and the early Church.',
      'Course 5 asks how we know: manuscripts, translation, genre, historical context, lexical evidence, intertextuality, arguments, competing interpretations, and levels of confidence. Course 6 then brings the strands together. It does not suddenly reveal a set of difficult questions that were hidden until the end; it asks you to synthesize questions you have already encountered using better tools and a larger body of evidence.',
      'You are allowed to hold a provisional answer while learning. You are also allowed to change your mind. The goal is not to postpone every conclusion or imply that every question has an equally uncertain answer. The goal is to keep the strength of a conclusion proportional to the evidence you have actually learned to evaluate.'
    ],
    simple:'You will meet the big questions early. We will give you a first map now, build the evidence and context you need, and return to the questions later with better tools.',
    vocab:{
      Provisional:'A conclusion held with enough confidence to use for now while remaining open to revision as stronger evidence or understanding appears.',
      Foundation:'Background knowledge and interpretive skills needed before a complex question can be evaluated responsibly.',
      Synthesis:'Bringing several kinds of evidence and earlier learning together into a coherent conclusion.'
    },
    deeper:'Spiral learning deliberately returns to important ideas after the learner has gained new knowledge. Repetition is not the goal by itself; each return should increase what the learner can distinguish, explain, evaluate, or transfer.',
    drawers:[
      drawer('Questions we will return to','God and Trinity; Scripture and trust; sin, salvation, and the cross; suffering and evil; violence, conquest, and slavery; sexuality and LGBTQ interpretation; women and ministry; judgment, hell, and resurrection; other religions and the unevangelized; miracles and historical evidence; Christian disagreement; and law, covenant, and ethics.'),
      drawer('Does “later” mean “no answer now”?','No. Course 1 gives the central Christian claims, essential distinctions, and responsible first-pass explanations. Later courses deepen or qualify those answers where additional biblical history, cultural context, textual evidence, or competing interpretations materially matter.'),
      drawer('What if I disagree?','Understanding is not assent. Canonical Shelf can state its own theological/editorial position while still asking you to identify the text, evidence, alternatives, uncertainty, and reasoning involved. Scored work evaluates understanding and reasoning rather than requiring you to agree personally.')
    ],
    visual:{text:'Question → first map → biblical foundations → historical context → primary texts → interpretation tools → theological synthesis',title:'How a difficult question develops'},
    challenges:[
      sequence('Build before concluding','Put the learning sequence in the strongest order.',['Synthesize a conclusion','Encounter the question','Build biblical and historical context','Evaluate interpretation and evidence'],[1,2,3,0],'The curriculum introduces the question first, then increases the evidence and interpretive tools available before asking for synthesis.'),
      evidence('What does the curriculum promise?','Choose the three responsible expectations.',['Important questions may appear before their full treatment.','Every difficult question should be settled from the first verse that mentions it.','A learner may hold a provisional conclusion while continuing to investigate.','Course 6 synthesizes earlier work rather than introducing theology for the first time.','If Christians disagree, no conclusion can ever be stronger than another.'],[0,2,3],'The curriculum surfaces questions early, permits provisional understanding, and returns to them with more evidence; disagreement does not make all conclusions equally supported.')
    ],
    reflect:'Which question most makes you want the stronger foundation rather than a fast answer?',
    model:'A strong response names a question and identifies at least one kind of background—textual, historical, literary, linguistic, or theological—that could materially improve the answer.',
    questionThreadIds:['q.god-christ','q.scripture-trust','q.sin-salvation','q.suffering-evil','q.violence-slavery','q.sexuality','q.women-ministry','q.judgment-hope','q.religions','q.miracles-history','q.disagreement','q.law-ethics']
  }),

  lesson({
    id:'c1-bible-languages',unitId:'c1.transmission',title:'Before English: the Bible’s languages',reading:'Luke 4:16–21',ref:[42,4,16,21],
    objective:'Recognize Hebrew, Aramaic, and Greek as the principal biblical languages and explain why translation is a normal part of reading Scripture.',
    body:[
      'The Bible did not arrive as one English book. Most of the Old Testament is written in Hebrew, with smaller Aramaic sections; the New Testament is written in Greek. Jesus and other first-century Jews lived in a multilingual world in which Hebrew, Aramaic, Greek, and sometimes Latin had different settings and functions.',
      'Luke depicts Jesus reading Isaiah in a synagogue. The Gospel itself reports the scene in Greek while referring to Israel’s Scriptures. That is already a reminder that Scripture can be received, quoted, and explained across languages without translation becoming an embarrassment or an exception.',
      'Translation therefore involves judgment about vocabulary, grammar, idiom, style, and what an audience can understand. A responsible reader does not assume that one English wording transparently reproduces every feature of an ancient sentence, but neither does the need for translation imply that meaning is unreachable.',
      'When an interpretation depends heavily on one English word, compare translations and consult notes before building a large conclusion on it. Course 5 returns to the mechanics of translation, semantic range, and equivalence in much greater depth.'
    ],
    simple:'Scripture was written in ancient languages. English Bibles are translations, so comparing wording and notes is a normal part of careful reading.',
    vocab:{Hebrew:'The principal language of most of the Old Testament.',Aramaic:'A related Semitic language used in portions of the Old Testament and widely spoken in parts of the ancient Near East.',Greek:'The language of the New Testament writings as they survive in the manuscript tradition.'},
    deeper:'Language history is more complicated than assigning one language to one people. Multilingualism, dialect, scribal practice, and translation traditions all matter. The introductory point is narrower: the biblical texts require linguistic mediation, and responsible study keeps that visible.',
    drawers:[
      drawer('Where is Aramaic in the Bible?','Substantial Aramaic passages occur in Ezra and Daniel, with smaller examples elsewhere. Course 5 can examine these boundaries and their historical setting.'),
      drawer('Do I need Greek or Hebrew?','No. Original-language study can sharpen questions, but careful use of multiple translations, notes, lexicons, and scholarly resources already improves interpretation. Knowing a little Greek or Hebrew is not a license to ignore context.')
    ],
    visual:{text:'Hebrew / Aramaic → Old Testament textual traditions · Greek → New Testament textual traditions · translation → modern readers',title:'From ancient text to modern reader'},
    challenges:[
      match('Match language and role','Match each description to the best category.',['Most of the Old Testament','Important portions of Ezra and Daniel','New Testament writings'],['Hebrew','Aramaic','Greek'],[0,1,2],'The three languages play different roles in the biblical collection.'),
      evidence('Keep translation conclusions proportional','Which two conclusions follow from this lesson?',['English readers depend on translation.','Every English difference proves the underlying manuscripts differ.','A claim resting on one English word deserves comparison and notes.','Only fluent ancient-language readers can interpret Scripture responsibly.'],[0,2],'Translation is unavoidable for most readers, and comparison is useful; the stronger claims do not follow.')
    ],
    reflect:'What question would you ask before building a theological claim on one translated word?',
    model:'I would ask whether other translations render the phrase differently and whether the difference is translation, textual evidence, or interpretation.',
    questionThreadIds:['q.scripture-trust','q.sexuality']
  }),

  lesson({
    id:'c1-theology-map',unitId:'c1.theology',title:'Theology: the claims you will keep meeting',reading:'Matthew 28:16–20',ref:[40,28,16,20],
    objective:'Build an introductory map of the central Christian claims that later courses examine in depth.',
    body:[
      'Christian theology is organized reflection on claims about God, Jesus Christ, the Holy Spirit, humanity, sin, salvation, the Church, and final hope. Beginners do not need to settle every later controversy before reading Scripture, but they do need enough vocabulary to recognize what kind of question is being asked.',
      'Historic Christianity speaks of one God and names Father, Son, and Holy Spirit together. It confesses Jesus as fully divine and fully human. These formulations developed as Christians tried to describe the biblical witness coherently; the later technical vocabulary should be distinguished from the passages that contributed to it.',
      'The Christian story also speaks of human dignity and sin, Christ’s death and resurrection, grace, repentance and faith, the work of the Spirit, life in Christian community, bodily resurrection, judgment, and renewed creation. Traditions often agree on the central vocabulary while disagreeing about mechanisms, emphases, and implications.',
      'Canonical Shelf will distinguish text, historical evidence, interpretation, doctrine, reception, and application. Course 1 gives the map. Courses 2–5 supply more of the biblical history, primary-text context, and interpretive method. Course 6 returns to the same questions for synthesis, competing positions, historical development, and difficult cases.'
    ],
    simple:'Learn the map before the debates: God, Christ, Spirit, humanity, sin, salvation, Church, resurrection, and hope are recurring Christian questions.',
    vocab:{Theology:'Reasoned reflection about God and the claims of faith.',Trinity:'The historic Christian confession of one God in Father, Son, and Holy Spirit.',Incarnation:'The Christian claim that the Son became genuinely human in Jesus Christ.'},
    deeper:'A doctrine can summarize a broad scriptural argument without being a quotation from one verse. That is why later study must ask both what individual passages say and how communities have drawn them together.',
    drawers:[
      drawer('Central versus disputed','Trinity, incarnation, Christ’s death and resurrection, and resurrection hope are historic Christian centers. Christians still disagree about predestination, sacramental mechanisms, atonement models, final punishment, end-times timelines, and many applications.'),
      drawer('Understanding is not assent','Course challenges test whether you can represent a claim and its evidence. They do not grade whether you personally believe it.')
    ],
    visual:{text:'God → creation and humanity → rupture/sin → Christ → Spirit/Church → resurrection and renewed creation',title:'A theology map'},
    challenges:[
      match('Name the question','Match the question to the theological category.',['How can Jesus be divine and human?','How is relationship with God restored?','What is Christian final hope?'],['Incarnation','Salvation','Resurrection / new creation'],[0,1,2],'The categories help locate a question before attempting its answer.'),
      evidence('Distinguish text and doctrine','Which two statements are responsible?',['A later doctrinal term can summarize reasoning across several passages.','If a technical term is not printed in a verse, the doctrine has no relationship to Scripture.','Understanding a doctrine is different from being graded for assent to it.','Every Christian tradition explains each doctrine identically.'],[0,2],'Doctrinal formulations draw on texts and reasoning; they are not identical to single verses or uniform across traditions.')
    ],
    questionThreadIds:['q.god-christ','q.sin-salvation','q.suffering-evil','q.judgment-hope']
  }),

  lesson({
    id:'c1-practice-map',unitId:'c1.practice',title:'Christian practice: beliefs take a communal form',reading:'Acts 2:42–47',ref:[44,2,42,47],
    objective:'Recognize worship, baptism, Communion, prayer, formation, generosity, and community as practices connected with Christian belief.',
    body:[
      'Christianity is not only a set of propositions. The New Testament depicts communities learning, praying, sharing meals, caring for needs, baptizing, remembering Jesus, worshiping, and making ethical decisions together. Practices give beliefs a social and embodied form.',
      'Acts 2 offers an idealized summary of an early Jerusalem community: teaching, fellowship, breaking bread, prayer, shared resources, and public life are held together. The passage should not be treated as a complete rulebook for every later congregation, but it makes clear that Christian formation is communal as well as individual.',
      'Baptism and Communion become especially important Christian practices. Traditions disagree about their timing, meaning, admission, and relationship to grace. Prayer likewise includes more than requests: praise, lament, confession, thanksgiving, intercession, and attentive listening all appear within Christian practice.',
      'Course 1 introduces the landscape. Later lessons examine baptism, Communion, prayer, ethics, worship, ministry, and denominational differences without pretending that one local practice represents every Christian community.'
    ],
    simple:'Christian beliefs are practiced through worship, prayer, baptism, Communion, care, community, and a way of life.',
    vocab:{Baptism:'The Christian water rite associated with initiation and life in Christ.',Communion:'The Christian shared meal also called Eucharist or the Lord’s Supper.',Formation:'Practices and relationships through which habits, understanding, and character are shaped.'},
    deeper:'Acts summarizes one community at one moment. Description is not automatically prescription. The passage can still reveal priorities and relationships that later communities must reason about rather than mechanically copy.',
    drawers:[drawer('Why communities differ','Sacramental theology, church governance, culture, history, and different interpretations of Scripture all shape Christian practice. Course 6 compares those differences directly.')],
    challenges:[
      match('Practice and purpose','Match the practice to the best introductory description.',['Baptism','Communion','Prayer'],['Initiation/belonging connected with Christ','Shared meal remembering/proclaiming Christ','Address to God including praise, lament, petition, confession, and thanks'],[0,1,2],'Each practice has a distinct role even where traditions explain it differently.'),
      evidence('Read Acts as a community portrait','Which two statements fit the passage and method?',['Teaching, meals, prayer, and material care appear together.','Every later church must reproduce every economic arrangement in exactly the same form.','Christian formation can involve communal practices.','Acts 2 settles every sacramental disagreement.'],[0,2],'The passage supports the communal pattern without functioning as a complete later church manual.')
    ],
    questionThreadIds:['q.women-ministry','q.law-ethics','q.disagreement']
  }),

  lesson({
    id:'c1-traditions-map',unitId:'c1.traditions',title:'One faith, many Christian traditions',reading:'1 Corinthians 12:4–13',ref:[46,12,4,13],
    objective:'Distinguish shared Christian identity from real differences among traditions and learn a fair method for comparison.',
    body:[
      'Christians share Scripture, Jesus-centered confession, baptismal and worship traditions, and a long history of common creeds and disagreements. “Christianity” therefore names both substantial common ground and many communities that do not answer every question in the same way.',
      'Major differences concern authority, sacraments, church governance, ministry, salvation language, worship, biblical interpretation, sexuality, social ethics, and other questions. Labels such as Catholic, Orthodox, Protestant, evangelical, mainline, Anglican, Lutheran, Methodist, Baptist, Pentecostal, or Restorationist identify histories and families, not complete descriptions of every congregation.',
      'Fair comparison begins with a tradition’s own sources, distinguishes official teaching from local practice, and describes disagreement in terms adherents would recognize. A learner should be able to say both where two traditions genuinely differ and where a stereotype exaggerates the difference.',
      'Canonical Shelf states its own editorial commitments while still identifying text, evidence, interpretation, doctrine, reception, and application separately. Course 6 provides the deeper historical and denominational comparison.'
    ],
    simple:'Christians share important centers and also disagree. Compare traditions using their own claims and actual practices rather than stereotypes.',
    vocab:{Tradition:'A historically developed community of belief, worship, interpretation, and practice.',Denomination:'An organized Christian body or family with a distinct identity and governance.',Ecumenism:'Work toward understanding, cooperation, or unity among Christians across traditions.'},
    deeper:'Internal diversity matters. National denominational documents, theological traditions, clergy, and individual congregations may not speak with one voice on every question.',
    drawers:[
      drawer('What Canonical Shelf will compare','Authority, baptism, Communion, polity, worship, ministry, LGBTQ participation, theological emphases, and the relationship between official teaching and local practice.'),
      drawer('Why 1 Corinthians 12?','Paul’s body imagery is not a modern denominational theory. It does supply a vocabulary of unity-with-difference that can help frame comparison without pretending every disagreement is trivial.')
    ],
    challenges:[
      match('Compare fairly','Match the evidence source to what it can responsibly establish.',['Official denominational statement','Local congregation policy','One member’s experience'],['A body’s stated teaching or policy','What a particular congregation says it practices','Evidence about one person’s experience, not the entire tradition'],[0,1,2],'Different evidence supports different levels of claim.'),
      evidence('Avoid caricature','Which two moves make a comparison stronger?',['Use a tradition’s own description before criticizing it.','Assume every local congregation exactly mirrors national policy.','Name both common ground and actual disagreement.','Treat one anecdote as the definition of an entire tradition.'],[0,2],'Fair comparison uses appropriate sources and preserves both similarity and difference.')
    ],
    questionThreadIds:['q.disagreement','q.sexuality','q.women-ministry','q.law-ethics']
  })
];
