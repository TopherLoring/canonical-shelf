/* Canonical Shelf v4 — plain-English topic and theology reference data.
   Answers lead with explanation. Scripture references are optional evidence, not prerequisites. */
window.CANON_TOPICS = {
  articles: [
    {
      id:'trinity', kind:'Doctrine', title:'What Christians mean by the Trinity',
      aliases:['trinity','father son holy spirit','three in one','is god three people'],
      tags:['God','Jesus','Holy Spirit','doctrine'],
      answer:'Historic Christianity teaches that there is one God who is known as Father, Son, and Holy Spirit. Christians do not mean three gods, and they do not mean one person simply changing masks. “Three persons, one God” is technical language developed to hold together the Bible’s claims about God, Jesus, and the Spirit without collapsing any of them into the others.',
      sections:[
        ['Why Christians say this','The doctrine grew from Christian worship and Scripture before it was expressed in later creeds. Christians prayed to the Father, confessed Jesus as divine, and experienced the Spirit as God’s active presence. The doctrine is an attempt to describe those claims together, not a mathematical explanation of God.'],
        ['What it does not mean','The Trinity is not three independent gods, a God divided into thirds, or one person taking turns being Father, Son, and Spirit. Every analogy eventually breaks down, so analogies should be treated as teaching aids rather than definitions.'],
        ['Where Christians differ','Most Catholic, Orthodox, Anglican, Lutheran, Reformed, Methodist, Baptist, Pentecostal, and many other churches affirm the historic doctrine. Some Christian movements reject or redefine it.']
      ],
      refs:['Matthew 28:19','John 1:1–18','John 14–16','2 Corinthians 13:14'], related:['incarnation','holy-spirit','jesus-divine']
    },
    {
      id:'incarnation', kind:'Doctrine', title:'How Christians understand Jesus as human and divine',
      aliases:['incarnation','jesus god and man','jesus human divine','is jesus god'], tags:['Jesus','Christ','doctrine'],
      answer:'Historic Christianity teaches that Jesus is fully human and fully divine. The point is not that Jesus is half of each. Christians believe the eternal Son truly entered human life: born, embodied, vulnerable, able to suffer and die, while still sharing in God’s identity.',
      sections:[
        ['Why it matters','Christian claims about salvation depend on both sides of this confession. Jesus genuinely shares human life, while Christians also understand God to be acting personally in and through him.'],
        ['A useful boundary','Statements about Jesus’ hunger, grief, learning, suffering, authority, worship, or divine status should not be used to erase the other side of the confession.'],
        ['Where Christians differ','Christians debate how best to explain particular passages and how Jesus’ divine and human knowing relate, but the classic creedal position preserves both full humanity and full divinity.']
      ], refs:['John 1:1–18','Philippians 2:5–11','Colossians 1:15–20','Hebrews 2:14–18'], related:['trinity','atonement','resurrection']
    },
    {
      id:'salvation', kind:'Doctrine', title:'What Christians mean by salvation',
      aliases:['salvation','saved','how to be saved','what does saved mean','going to heaven'], tags:['grace','Jesus','faith','sin'],
      answer:'Salvation is the Christian claim that God acts through Jesus Christ to rescue people from sin and death, reconcile them to God, and bring them into renewed life. It is broader than “getting into heaven.” It includes forgiveness, reconciliation, liberation from destructive powers, transformed life, resurrection, and hope for renewed creation.',
      sections:[
        ['How it is received','Christian traditions agree that salvation depends on God’s grace rather than human moral achievement. They describe the human response with language such as faith, repentance, trust, baptism, receiving grace, and persevering discipleship, while differing on how those pieces relate.'],
        ['What good works do','Good works are not a purchase price for God’s love. They are normally understood as the fruit or lived response of grace—love of neighbor, justice, mercy, repair, generosity, and growth in holiness.'],
        ['Where Christians differ','Traditions disagree about election, free will, sacraments, assurance, whether salvation can be finally rejected, and the final destiny of those outside explicit Christian faith.']
      ], refs:['Ephesians 2:8–10','Romans 3–8','1 Corinthians 15','2 Corinthians 5:17–21'], related:['grace','atonement','faith-works','judgment']
    },
    {
      id:'atonement', kind:'Doctrine', title:'Why Christians say Jesus’ death saves',
      aliases:['atonement','why did jesus die','cross','penal substitution','christ died for sins'], tags:['Jesus','cross','salvation'],
      answer:'The New Testament uses several images to explain why Jesus’ death matters: sacrifice, reconciliation, victory over sin and death, liberation, representation, ransom, covenant, and bearing sin. Christians agree that the cross is central to salvation but do not all reduce it to one mechanism.',
      sections:[
        ['Penal substitution','One influential account says Christ bears the judgment or penalty sinners face. Many Christians find this biblically important; others emphasize that it should be held alongside the Bible’s other images rather than treated as the only explanation.'],
        ['Victory and liberation','Another major emphasis is that Christ confronts and defeats the powers of sin, death, and evil. The resurrection is essential to this picture: the cross is not simply a payment followed by an unrelated miracle.'],
        ['Reconciliation','The cross is also described as God acting to restore relationship. This image highlights forgiveness, peace, repaired communion, and a new way of life.']
      ], refs:['Romans 3:21–26','2 Corinthians 5:17–21','Colossians 2:13–15','Hebrews 9–10'], related:['salvation','resurrection','sin']
    },
    {
      id:'grace', kind:'Doctrine', title:'What grace means', aliases:['grace','god grace','unearned favor'], tags:['salvation','faith'],
      answer:'Grace means God’s freely given favor and action toward people rather than something earned as wages. In Christian theology, grace is not merely God overlooking wrongdoing. It is God taking the initiative to forgive, restore, transform, and sustain.',
      sections:[['Grace and effort','Receiving grace does not make human choices meaningless. Christian traditions commonly distinguish earning salvation from responding to it.'],['Grace and worth','Saying that salvation cannot be earned does not mean human beings have no value. Christian teaching normally grounds human dignity in creation and God’s love, not in moral performance.']],
      refs:['Ephesians 2:8–10','Romans 5:1–11','Titus 2:11–14'], related:['salvation','faith-works','repentance']
    },
    {
      id:'faith-works', kind:'Doctrine', title:'Faith, works, and the apparent Paul–James conflict', aliases:['faith vs works','faith and works','paul james contradiction','works salvation'], tags:['faith','grace','James','Paul'],
      answer:'Paul and James use “faith” and “works” in different arguments. Paul rejects treating works as a basis for boasting or earning right standing with God. James rejects a claim to faith that produces no mercy or action. Read together, they challenge both self-salvation and empty profession.',
      sections:[['The key distinction','A person does not buy grace through moral performance, but Christian faith is expected to become visible in life.'],['Why the wording sounds contradictory','Each writer is answering a different problem. Isolating one sentence from either letter can make the disagreement look larger than the arguments themselves.']],
      refs:['Romans 3:21–31','Ephesians 2:8–10','James 2:14–26'], related:['grace','salvation','repentance']
    },
    {
      id:'holy-spirit', kind:'Doctrine', title:'Who the Holy Spirit is', aliases:['holy spirit','holy ghost','spirit of god'], tags:['God','Trinity','spiritual life'],
      answer:'Christians understand the Holy Spirit as God’s personal presence and action, not merely a religious feeling or impersonal energy. The New Testament connects the Spirit with guidance, empowerment, conviction, prayer, gifts, community, and the formation of Christlike character.',
      sections:[['Gifts and fruit','Spiritual gifts describe capacities used for the good of others; the “fruit of the Spirit” describes qualities of character. Spectacular experiences are not the only evidence Christians associate with the Spirit.'],['Discernment','Claims of spiritual guidance should be tested rather than treated as automatically infallible. Christians have historically used Scripture, the character of Christ, community wisdom, moral fruit, and practical consequences as part of discernment.']],
      refs:['John 14–16','Acts 2','1 Corinthians 12–14','Galatians 5:22–25'], related:['trinity','prayer','spiritual-gifts']
    },
    {
      id:'scripture', kind:'Doctrine', title:'What Christians mean when they call the Bible inspired', aliases:['inspiration','bible inspired','inerrancy','word of god','scripture authority'], tags:['Bible','interpretation','canon'],
      answer:'Christians call Scripture inspired and authoritative because they believe God speaks through these writings to form faith and life. Christians disagree about exactly how inspiration relates to historical detail, scientific description, human authorship, textual transmission, and the word “inerrancy.”',
      sections:[['Human and divine dimensions','The Bible is a collection written in human languages, genres, cultures, and historical settings. Taking inspiration seriously does not remove the need to interpret those features.'],['Text and interpretation are not identical','A Bible can be authoritative while a reader’s interpretation is mistaken. Translation decisions, manuscript evidence, genre, context, and theological assumptions all affect how a passage is understood.'],['Canon differences','Protestant, Catholic, and Orthodox Bibles do not contain exactly the same Old Testament collection. That is a canon question, not simply a translation difference.']],
      refs:['2 Timothy 3:14–17','Luke 1:1–4','2 Peter 3:15–16'], related:['canon','translation','genre']
    },
    {
      id:'baptism', kind:'Practice & doctrine', title:'What baptism means', aliases:['baptism','baptize','infant baptism','believers baptism'], tags:['sacrament','church','practice'],
      answer:'Baptism is the Christian initiation practice using water in the name of God. It marks belonging to Christ and the Christian community and is associated with cleansing, new life, participation in Christ’s death and resurrection, and receiving God’s promise.',
      sections:[['Why practices differ','Some churches baptize infants as recipients of covenant grace; others baptize people after a personal profession of faith. Some emphasize sacramental action, others public testimony, and many combine those ideas differently.'],['Is baptism required for salvation?','Christians disagree. This course treats baptism as spiritually and communally significant without declaring the ritual itself a prerequisite that limits God’s ability to save.']],
      refs:['Matthew 28:18–20','Acts 2:37–41','Romans 6:1–4','Galatians 3:26–29'], related:['communion','salvation','church']
    },
    {
      id:'communion', kind:'Practice & doctrine', title:'What Communion is', aliases:['communion','eucharist','lords supper','bread wine'], tags:['Jesus','church','sacrament'],
      answer:'Communion, the Lord’s Supper, or Eucharist is the Christian meal centered on bread and wine or juice in remembrance of Jesus. Christians connect it with Jesus’ death, thanksgiving, participation in Christ, unity, and the life of the gathered community.',
      sections:[['What Christians disagree about','Catholic, Orthodox, Lutheran, Reformed, Anglican, Methodist, Baptist, Disciples, and other traditions describe Christ’s presence in the meal differently. Those differences are substantial, not just vocabulary.'],['Who may receive','Churches have different admission practices. This course takes an open-table position: all are welcome, while clearly noting that many traditions require baptism, membership, confession, or other preparation.']],
      refs:['1 Corinthians 10:16–17','1 Corinthians 11:17–34','Luke 22:14–20'], related:['baptism','church','atonement']
    },
    {
      id:'resurrection', kind:'Doctrine', title:'What Christians mean by resurrection', aliases:['resurrection','raised from dead','life after death','jesus rose'], tags:['Jesus','hope','death'],
      answer:'Resurrection means being raised from death into renewed embodied life. In Christianity it is not the same as a soul simply surviving death and it is not repeated reincarnation. Jesus’ resurrection is central to Christian faith and becomes the basis for hope that death will not have the final word for creation.',
      sections:[['Jesus’ resurrection','The New Testament presents the resurrection as God’s vindication of Jesus and the beginning of new creation, not merely as the disciples preserving his teachings.'],['Future hope','Christian traditions describe the state between death and final resurrection differently, but classic Christian hope ultimately points toward resurrection and renewed creation.']],
      refs:['1 Corinthians 15','Luke 24','Romans 8:18–25','Revelation 21–22'], related:['death','heaven','judgment','new-creation']
    },
    {
      id:'judgment', kind:'Doctrine', title:'Judgment, hell, and Christian disagreement', aliases:['hell','judgment','eternal punishment','annihilation','universalism','who goes to hell'], tags:['afterlife','salvation','justice'],
      answer:'Christianity teaches that human life is morally accountable to God and that evil will not simply be ignored. Christians agree less about the exact nature and duration of final punishment. Major positions include eternal conscious punishment, conditional immortality or final destruction, and forms of hopeful or confident universal reconciliation.',
      sections:[['What the course will not pretend','A few isolated English words do not settle every question about final destiny. Genre, imagery, Greek and Hebrew vocabulary, the wider biblical argument, and historical interpretation all matter.'],['What remains central','Judgment means injustice matters. Christian final hope also centers on Christ, resurrection, the defeat of death, and renewed creation rather than fascination with punishment.'],['Individual destinies','This guide does not claim certainty about the final destiny of a particular living or deceased person.']],
      refs:['Matthew 25:31–46','Romans 2:1–16','1 Corinthians 15:20–28','Revelation 20–22'], related:['salvation','resurrection','heaven','new-creation']
    },
    {
      id:'free-will', kind:'Doctrine', title:'Free will, providence, and predestination', aliases:['free will','predestination','election','providence','does god control everything'], tags:['God','choice','Calvinism','Arminianism'],
      answer:'Christians agree that God is sovereign and that human choices matter, but they disagree about exactly how those claims fit together. “Foreknowledge,” “predestination,” “providence,” “election,” and “determinism” are related terms, not synonyms.',
      sections:[['Major approaches','Reformed traditions typically emphasize God’s determining grace and election. Arminian and Wesleyan traditions emphasize grace that enables a genuinely resistible response. Other traditions frame the problem differently or resist reducing it to that debate.'],['A practical boundary','Saying God can bring good from suffering is not the same as saying every harmful act was morally good or that its perpetrator lacked responsibility.']],
      refs:['Romans 8:28–30','Romans 9–11','Ephesians 1:3–14','1 Timothy 2:1–6'], related:['grace','suffering','salvation']
    },
    {
      id:'anxiety', kind:'Life & Scripture', title:'What Christianity says about anxiety', aliases:['anxiety','worry','panic','fear','stressed'], tags:['mental health','prayer','peace'],
      answer:'The Bible repeatedly invites people to bring fear and worry to God, but it does not teach that anxiety is proof of weak faith. Biblical people experience fear, distress, grief, sleeplessness, and anguish while still being portrayed as faithful. Christian care can include prayer, companionship, practical help, and appropriate professional treatment.',
      sections:[['What “do not worry” is doing','Jesus and Paul redirect attention toward trust, prayer, daily provision, and community. Those passages should not be weaponized as “a good Christian would stop feeling anxious.”'],['Prayer and treatment','Prayer is not a substitute for medical or mental-health care. Seeking appropriate treatment can be part of responsible care for a person.'],['A useful practice','Name the concrete concern, identify what can be acted on today, ask for help where needed, and allow lament or uncertainty rather than demanding instant emotional change.']],
      refs:['Matthew 6:25–34','Philippians 4:4–9','Psalm 13','1 Peter 5:6–7'], related:['prayer','suffering','peace']
    },
    {
      id:'grief', kind:'Life & Scripture', title:'What Christianity says about grief', aliases:['grief','mourning','death of loved one','loss'], tags:['death','lament','hope'],
      answer:'Christianity does not require grief to disappear quickly. The Bible includes lament, tears, anger, bewilderment, remembrance, and hope. Jesus himself weeps. Christian hope in resurrection can coexist with the reality that losing someone hurts.',
      sections:[['Lament is not failure','Psalms of lament speak honestly to God instead of pretending pain is absent. Faith can include protest and unanswered questions.'],['How to help someone grieving','Presence is often more useful than explaining why the loss happened. Avoid claiming certainty that a tragedy was deliberately sent as a lesson. Practical care, listening, rituals, and remembrance can matter.']],
      refs:['Psalm 13','Psalm 42','John 11:28–36','1 Thessalonians 4:13–18'], related:['death','resurrection','suffering','prayer']
    },
    {
      id:'suffering', kind:'Life & theology', title:'Why suffering exists', aliases:['suffering','why bad things happen','problem of evil','why does god allow evil','pain'], tags:['evil','freedom','grief'],
      answer:'Christianity does not have one sentence that explains every instance of suffering. Scripture contains several kinds of explanation: human wrongdoing, unjust systems, ordinary creaturely vulnerability, consequences, spiritual evil, and suffering whose reason remains unknown. Job explicitly resists the idea that every tragedy can be reverse-engineered into the victim’s fault.',
      sections:[['Freedom and evil','Many Christians argue that meaningful freedom makes genuine wrongdoing possible. That helps explain some moral evil but does not by itself explain disease, disaster, or every unanswered prayer.'],['God and tragedy','Christians may believe God can redeem suffering without calling the harmful event itself good. The Bible also gives people permission to lament rather than explain.'],['Pastoral boundary','Do not tell a suffering person that pain proves weak faith or that you know God deliberately caused their specific tragedy.']],
      refs:['Job 1–2; 38–42','Psalm 22','Luke 13:1–5','Romans 8:18–39'], related:['grief','free-will','prayer','resurrection']
    },
    {
      id:'forgiveness', kind:'Life & Scripture', title:'Forgiveness, reconciliation, and boundaries', aliases:['forgiveness','forgive','reconcile','abuse boundaries'], tags:['relationships','justice','mercy'],
      answer:'Christianity treats forgiveness as central, but forgiveness is not identical to pretending harm did not occur, restoring trust immediately, dropping every consequence, or returning to an unsafe relationship. Reconciliation requires more than one person; safety and accountability can remain necessary.',
      sections:[['Forgiveness','At minimum, forgiveness rejects vengeance as the final goal and opens the possibility that resentment will not control the future. Traditions describe its emotional and relational dimensions differently.'],['Reconciliation','Reconciliation means repaired relationship and therefore normally requires truth, change, and participation by the people involved. It cannot be forced by one person alone.'],['Boundaries','A person can seek to forgive while maintaining distance, reporting abuse, pursuing justice, or requiring demonstrated change before trust is restored.']],
      refs:['Matthew 18:15–35','Luke 17:3–4','Romans 12:17–21','2 Corinthians 5:18–20'], related:['justice','repentance','relationships']
    },
    {
      id:'money', kind:'Life & Scripture', title:'What the Bible says about money', aliases:['money','wealth','rich','poverty','tithing','giving'], tags:['generosity','justice','work'],
      answer:'The Bible does not teach that money itself is evil, but it repeatedly warns that wealth can distort loyalty, hide dependence, and make exploitation easier to ignore. It also treats material resources as a way to provide, share, welcome, relieve need, and practice justice.',
      sections:[['Wealth is morally serious','Biblical warnings focus less on possessing an object called money than on greed, hoarding, dishonest gain, indifference to the poor, and trusting wealth as security.'],['Giving','Christian traditions differ on whether a literal ten-percent tithe is required for Christians. The New Testament emphasizes willing, proportionate generosity and care for people in need.'],['Prosperity claims','The Bible contains promises of provision and blessing, but those should not be turned into a guarantee that faithful people will become wealthy.']],
      refs:['Deuteronomy 15:7–11','Luke 12:13–34','1 Timothy 6:6–19','2 Corinthians 8–9'], related:['work','justice','generosity']
    },
    {
      id:'sex-relationships', kind:'Life & Scripture', title:'Sex, relationships, and Christian ethics', aliases:['sex','dating','relationships','marriage','sexual ethics'], tags:['relationships','marriage','body'],
      answer:'Christian sexual ethics have historically connected sex with covenant, fidelity, responsibility, mutual care, and the dignity of bodies. Christians disagree sharply about gender, same-sex relationships, contraception, divorce, remarriage, and the exact boundaries of sexual morality. Those disagreements should be represented rather than hidden.',
      sections:[['A useful ethical center','Consent alone does not answer every Christian ethical question, but coercion or exploitation is incompatible with love of neighbor. Fidelity, honesty, power, responsibility, vulnerability, and consequences all matter.'],['This course’s position','The Canonical Shelf explicitly affirms LGBTQ people, relationships, marriage, leadership, and ministry. It also explains non-affirming interpretations accurately enough for learners to understand where the disagreement comes from.']],
      refs:['Genesis 2:18–25','Matthew 19:3–12','1 Corinthians 6–7','Galatians 5:13–26'], related:['lgbtq','marriage','forgiveness']
    },
    {
      id:'lgbtq', kind:'Life & theology', title:'Christianity and LGBTQ people', aliases:['lgbtq','gay christian','trans christian','same sex marriage','homosexuality','queer christian'], tags:['relationships','church','interpretation'],
      answer:'Christians disagree about how a small group of biblical passages applies to modern LGBTQ identities and relationships. This course takes an affirming position: LGBTQ people can fully belong, marry, lead, serve, and participate in Christian community without treating their identity as a defect to be cured.',
      sections:[['Why Christians disagree','The debate involves translation, ancient sexual practices, creation texts, assumptions about gender, how biblical commands apply across cultures, and how Christians use Jesus’ teaching, covenant, justice, and the wider scriptural story.'],['What an affirming reading argues','Affirming Christians argue that the biblical texts often cited against LGBTQ people address situations that are not equivalent to loving, mutual modern same-sex relationships or transgender identity, and that Christian sexual ethics should focus on covenant, fidelity, justice, consent, and neighbor-love.'],['What non-affirming Christians argue','Non-affirming Christians commonly understand the relevant texts and creation patterns as establishing male–female marriage as the permitted context for sex. This course explains that position without adopting it.'],['Pastoral boundary','A theological disagreement is never permission to mistreat, humiliate, threaten, or deny another person’s basic dignity.']],
      refs:['Genesis 1–2','Matthew 22:34–40','Acts 10–15','Romans 1:18–32','Galatians 3:26–29'], related:['sex-relationships','scripture','church']
    },
    {
      id:'prayer', kind:'Life & Scripture', title:'What prayer is for', aliases:['prayer','how to pray','unanswered prayer','does prayer work'], tags:['spiritual practice','God','anxiety'],
      answer:'Prayer is communication and relationship with God. In the Bible it includes praise, gratitude, requests, confession, silence, lament, anger, intercession, and surrender. It is not presented as a technique that guarantees a chosen outcome if performed correctly.',
      sections:[['Unanswered prayer','Biblical prayer includes requests that are delayed, changed, or apparently unanswered. Christianity therefore cannot responsibly promise that enough faith or the right words will produce healing, money, or a specific event.'],['How to begin','You do not need special vocabulary. Say what is true: what you are grateful for, afraid of, angry about, responsible for, or hoping for. Silence can also be prayer.'],['Prayer and action','Prayer can accompany practical action rather than replace it. Praying for someone’s needs while refusing reasonable help is a tension the New Testament itself notices.']],
      refs:['Matthew 6:5–13','Psalm 13','Romans 8:26–27','James 2:14–17'], related:['anxiety','suffering','holy-spirit']
    },
    {
      id:'work', kind:'Life & Scripture', title:'Work, calling, and purpose', aliases:['work','job','career','calling','purpose'], tags:['vocation','money','service'],
      answer:'The Bible treats work as part of human responsibility before it treats work as toil. Christian vocation is therefore broader than finding one perfect career chosen by God. Paid work, caregiving, service, creativity, rest, and community responsibility can all belong to a meaningful life.',
      sections:[['Calling is not a secret code','Christians may experience a strong sense of calling, but Scripture does not require everyone to discover one hidden career path or assume a bad job choice permanently defeats God’s purpose.'],['Work can become unjust','Biblical teaching also criticizes exploitation, withheld wages, status competition, and treating productivity as a measure of human worth.'],['Rest matters','Sabbath traditions challenge the idea that a person’s value is equal to output. Rest, worship, relationships, and limits are also part of creaturely life.']],
      refs:['Genesis 2:15','Deuteronomy 5:12–15','Colossians 3:22–4:1','James 5:1–6'], related:['money','creation','justice']
    },
    {
      id:'death', kind:'Life & theology', title:'What Christians believe happens after death', aliases:['death','after death','afterlife','when you die','where do dead people go'], tags:['resurrection','heaven','judgment'],
      answer:'Christians believe death is real but not final. The clearest shared Christian hope is resurrection and life with God. Traditions differ about the condition between a person’s death and the final resurrection, and popular images of immediately becoming an angel are not the Bible’s basic resurrection claim.',
      sections:[['Immediate presence and intermediate state','Many Christians believe the dead are consciously with God before the final resurrection; others describe that interval differently. The biblical material uses several images and is less interested in mapping a timeline than popular culture often is.'],['Final hope','The New Testament’s culminating picture is not humanity permanently abandoning creation but God defeating death and renewing creation.']],
      refs:['Luke 23:39–43','Philippians 1:20–24','1 Corinthians 15','Revelation 21–22'], related:['resurrection','heaven','judgment','grief']
    },
    {
      id:'heaven', kind:'Doctrine', title:'What the Bible means by heaven and new creation', aliases:['heaven','new earth','new creation','eternal life'], tags:['afterlife','resurrection','hope'],
      answer:'In the Bible, “heaven” can mean God’s realm or the skies, depending on context. Popular Christian speech often uses heaven as shorthand for being with God after death. The Bible’s larger final hope, however, culminates in resurrection and a renewed creation where God dwells with humanity.',
      sections:[['Not just clouds','The closing biblical vision is strikingly earthly: a city, nations, healing, life, and God dwelling with people. Christian hope therefore includes the restoration of creation, not only escape from it.'],['What remains mysterious','Biblical imagery communicates real hope without giving a technical description of the physics or geography of eternal life.']],
      refs:['Isaiah 65:17–25','1 Corinthians 15','2 Peter 3:13','Revelation 21–22'], related:['resurrection','death','judgment','new-creation']
    },
    {
      id:'justice', kind:'Life & Scripture', title:'Justice, mercy, and caring for neighbors', aliases:['justice','social justice','poor','oppression','mercy'], tags:['prophets','ethics','neighbor'],
      answer:'Biblical justice is not only punishment for wrongdoing. It also concerns fair treatment, honest courts and commerce, protection of vulnerable people, repair of wrongs, and social conditions in which neighbors can live. The prophets repeatedly connect worship with how people are treated.',
      sections:[['Justice and mercy','The Bible often places justice and mercy together rather than treating them as opposites. Mercy does not require pretending harm is harmless; justice need not mean vengeance.'],['Personal and structural dimensions','Scripture addresses both individual conduct and systems such as courts, debt, land, wages, rulers, and communal obligations. Christian ethics therefore cannot be reduced entirely to private kindness.']],
      refs:['Isaiah 1:10–20','Amos 5:21–24','Micah 6:6–8','Luke 4:16–21'], related:['forgiveness','money','work']
    },
    {
      id:'canon', kind:'Bible basics', title:'Why different Bibles contain different books', aliases:['canon','66 books','catholic bible','orthodox bible','missing books','apocrypha'], tags:['Bible','history','deuterocanonical'],
      answer:'“Canon” means the collection a religious community recognizes as Scripture. Protestant Bibles normally contain 66 books. Catholic Bibles include additional Old Testament books, and Orthodox traditions include somewhat different collections. This difference is about which writings belong in the recognized collection, not simply which English translation is used.',
      sections:[['Why the collections differ','Jewish and Christian communities inherited, used, translated, and formally recognized ancient writings through different historical processes. The boundaries were not created by one single modern decision.'],['How this app handles it','The Canonical Shelf teaches the 66-book Protestant arrangement as its navigation system while explicitly acknowledging that it is not the only Christian canon.']],
      refs:['Luke 24:44','2 Timothy 3:14–17'], related:['scripture','translation','genre']
    },
    {
      id:'translation', kind:'Bible basics', title:'Why Bible translations sound different', aliases:['translation','which bible translation','kjv','bsb','niv','nlt','why verses different'], tags:['Bible','manuscripts','language'],
      answer:'Bible translations differ because translators must make choices about ancient Hebrew, Aramaic, and Greek wording, style, ambiguity, and how directly to reproduce ancient sentence structure. Different wording is not automatically evidence of corruption.',
      sections:[['More literal vs more explanatory','Some translations preserve source-language structure more closely; others prioritize natural modern English. Neither approach removes interpretation.'],['Manuscript differences','A smaller number of differences come from variation among surviving ancient manuscripts. Modern editions compare those witnesses and often place significant variants in footnotes.'],['How to compare responsibly','Read the whole paragraph, compare two or three reputable translations, and inspect notes when an argument depends heavily on one wording.']],
      refs:['Luke 1:1–4','1 John 5:6–8'], related:['scripture','canon','genre']
    },
    {
      id:'genre', kind:'Bible basics', title:'Why genre changes how you read the Bible', aliases:['genre','literal bible','how to read bible','poetry prophecy apocalypse'], tags:['interpretation','Bible','context'],
      answer:'The Bible contains narrative, law, poetry, wisdom, prophecy, letters, genealogy, parable, and apocalyptic vision. Reading responsibly means asking what kind of writing you are reading before deciding what a sentence is doing. “Take the Bible seriously” is not the same as “read every sentence as the same kind of literal statement.”',
      sections:[['Examples','A proverb describes wise patterns; a psalm may use metaphor; a letter addresses a concrete community; a parable tells a story to provoke understanding; Revelation uses symbolic visions. Each can communicate truth without using the same method.'],['Genre is not an escape hatch','Calling something poetic or symbolic does not mean it can mean anything. Literary form still has evidence, structure, context, and interpretive limits.']],
      refs:['Psalm 18:1–6','Proverbs 26:4–5','Luke 15','Revelation 12'], related:['scripture','translation','canon']
    }
  ],
  glossary: {
    'Atonement':'Ways Christians describe how Jesus’ life, death, and resurrection address sin and restore relationship with God.',
    'Canon':'The collection of writings a religious community recognizes as Scripture.',
    'Christ':'A title meaning “anointed one,” corresponding to Messiah; it is not Jesus’ surname.',
    'Covenant':'A committed relationship involving promises and responsibilities.',
    'Eschatology':'Christian teaching about final hope, resurrection, judgment, and the fulfillment of God’s purposes.',
    'Exegesis':'Careful interpretation that asks what a text is communicating in its literary and historical setting.',
    'Gospel':'“Good news”; also the name for one of the four New Testament narratives about Jesus.',
    'Grace':'God’s freely given favor and action rather than something earned as wages.',
    'Incarnation':'The Christian teaching that the eternal Son truly became human in Jesus Christ.',
    'Justification':'Language, especially in Paul, for being put in right standing with God.',
    'Lament':'Prayer or speech that brings grief, protest, confusion, or pain honestly before God.',
    'Messiah':'“Anointed one”; a Jewish royal and theological title translated into Greek as Christ.',
    'Providence':'Christian language for God’s continuing care and purposeful activity within creation and history.',
    'Repentance':'A turning or reorientation away from sin and toward God, not merely feeling ashamed.',
    'Resurrection':'Being raised from death into renewed life; distinct from reincarnation.',
    'Sacrament':'A sacred practice understood by many Christians as a visible sign through which God gives or confirms grace; traditions define the term differently.',
    'Sanctification':'Growth in holiness and Christlike life through God’s grace.',
    'Sin':'Human rebellion, mistrust, wrongdoing, and distorted relationship with God, neighbor, self, and creation.',
    'Trinity':'The historic Christian confession of one God as Father, Son, and Holy Spirit.',
    'Vocation':'A calling or sphere of responsibility; broader than a paid career.'
  }
};
