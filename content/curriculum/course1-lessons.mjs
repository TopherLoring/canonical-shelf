import {lesson,sequence,match,evidence,drawer} from './helpers.mjs';

export const course1Lessons=[
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
    model:'I would ask whether other translations render the phrase differently and whether the difference is translation, textual evidence, or interpretation.'
  }),

  lesson({
    id:'c1-theology-map',unitId:'c1.theology',title:'Theology: the claims you will keep meeting',reading:'Matthew 28:16–20',ref:[40,28,16,20],
    objective:'Build an introductory map of the central Christian claims that later courses examine in depth.',
    body:[
      'Christian theology is organized reflection on claims about God, Jesus Christ, the Holy Spirit, humanity, sin, salvation, the Church, and final hope. Beginners do not need to settle every later controversy before reading Scripture, but they do need enough vocabulary to recognize what kind of question is being asked.',
      'Historic Christianity speaks of one God and names Father, Son, and Holy Spirit together. It confesses Jesus as fully divine and fully human. These formulations developed as Christians tried to describe the biblical witness coherently; the later technical vocabulary should be distinguished from the passages that contributed to it.',
      'The Christian story also speaks of human dignity and sin, Christ’s death and resurrection, grace, repentance and faith, the work of the Spirit, life in Christian community, bodily resurrection, judgment, and renewed creation. Traditions often agree on the central vocabulary while disagreeing about mechanisms, emphases, and implications.',
      'Canonical Shelf will distinguish text, historical evidence, interpretation, doctrine, reception, and application. Course 1 gives the map. Course 6 returns to the same questions with competing positions, historical development, and difficult cases.'
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
    ]
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
    ]
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
    ]
  })
];
