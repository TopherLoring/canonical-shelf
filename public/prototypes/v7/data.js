export const BOOK_GROUPS = [
  {name:'Law', color:'#315f9d', books:['Genesis','Exodus','Leviticus','Numbers','Deuteronomy']},
  {name:'History', color:'#8b5f37', books:['Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther']},
  {name:'Wisdom', color:'#3c806f', books:['Job','Psalms','Proverbs','Ecclesiastes','Song of Songs']},
  {name:'Major Prophets', color:'#74417f', books:['Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel']},
  {name:'Minor Prophets', color:'#a77721', books:['Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi']},
  {name:'Gospels', color:'#b54337', books:['Matthew','Mark','Luke','John']},
  {name:'Acts', color:'#4f7d39', books:['Acts']},
  {name:'Pauline Letters', color:'#a75176', books:['Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon']},
  {name:'General Letters', color:'#53677f', books:['Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude']},
  {name:'Apocalypse', color:'#34353b', books:['Revelation']}
];

export const BOOK_INFO = {
  Genesis:{subtitle:'Beginnings, covenant, family, promise', era:'Primeval history → patriarchs', genre:'Narrative', key:'Creation, fall, flood, Abraham, Isaac, Jacob, Joseph', question:'How does God begin restoring a fractured world?'},
  Exodus:{subtitle:'Deliverance, covenant, presence', era:'Israel in Egypt → Sinai', genre:'Narrative + law', key:'Moses, plagues, Passover, exodus, Sinai, tabernacle', question:'What does liberation reveal about God and covenant?'},
  Psalms:{subtitle:'Prayer, praise, lament, wisdom', era:'Collected across Israel’s history', genre:'Poetry', key:'Worship, kingship, suffering, trust, creation', question:'How does Scripture teach people to speak honestly with God?'},
  Isaiah:{subtitle:'Judgment, hope, holiness, restoration', era:'8th century BCE and beyond', genre:'Prophetic literature', key:'Judah, Assyria, servant, Zion, new creation', question:'How do judgment and restoration belong to one prophetic vision?'},
  Matthew:{subtitle:'Jesus as Messiah and teacher', era:'First-century Roman Judea', genre:'Gospel', key:'Kingdom, Torah, discipleship, fulfillment', question:'How does Matthew place Jesus inside Israel’s story?'},
  Romans:{subtitle:'Paul’s sustained argument about gospel, Israel, and transformed life', era:'Mid-first century CE', genre:'Letter', key:'Grace, faith, Jew/Gentile, Spirit, ethics', question:'How does Paul build an argument across the whole letter?'},
  Revelation:{subtitle:'Apocalyptic witness to faithful endurance and new creation', era:'Late first-century Roman world', genre:'Apocalypse + prophecy + letter', key:'Empire, worship, witness, judgment, hope', question:'How does symbolic imagery form communities for faithful endurance?'}
};

export const UNIT = {
  id:'u1', number:1, title:'The Story and Its Setting', subtitle:'A story. A people. A world. A purpose.', progress:33,
  lessons:[
    {id:'u1l1',n:'1.1',title:'Why the Bible Matters',kind:'Lesson',minutes:5,status:'complete'},
    {id:'u1l2',n:'1.2',title:'The Story and Its Setting',kind:'Lesson',minutes:7,status:'current'},
    {id:'u1l3',n:'1.3',title:'The World of the Bible',kind:'Lesson',minutes:8,status:'locked'},
    {id:'u1l4',n:'1.4',title:'People, Places, and Cultures',kind:'Lesson',minutes:6,status:'locked'},
    {id:'u1m1',n:'1.5',title:'Unit 1 Mastery Check',kind:'Mastery',minutes:8,status:'locked'}
  ]
};

export const LESSON_SCENES = [
  {role:'Orient',title:'Every text has a setting',body:'The Bible is not a collection of ideas dropped out of the sky. Its books arise in real places, among real communities, through languages, political pressures, economies, rituals, arguments, hopes, and memories.',aside:'Context is not an obstacle between you and Scripture. It is one of the ways Scripture becomes clearer.',action:'Begin with the big picture'},
  {role:'Read',title:'A claim made inside history',body:'“All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness.” — 2 Timothy 3:16. Even a familiar verse belongs to a letter, an audience, and an argument.',aside:'The question is not only “What does this verse say?” but also “What is this sentence doing here?”',action:'Look at the surrounding argument'},
  {role:'Explain',title:'Text, context, and interpretation are different things',body:'The text is what the passage says. Historical context asks what world the text inhabits. Interpretation asks what the text means and how its parts relate. Doctrine and application are later acts of synthesis and judgment.',aside:'Canonical Shelf keeps these layers visible so a confident conclusion does not masquerade as a direct quotation.',action:'Compare the layers'},
  {role:'Visualize',title:'The Bible spans changing worlds',body:'Patriarchal households, Egyptian imperial power, Israelite monarchy, Assyrian and Babylonian expansion, Persian administration, Hellenistic kingdoms, Roman rule, synagogue life, patronage networks, and early churches all shape what readers encounter.',aside:'Chronology is not the same thing as canonical order. Both are useful maps, but they answer different questions.',action:'Open the timeline'},
  {role:'Practice',title:'Which statement best preserves the distinction?',body:'Choose the statement that distinguishes text from interpretation.',aside:'This check is unscored in the prototype; it demonstrates the interaction model.',action:'Check your reasoning'},
  {role:'Reflect',title:'Context changes the quality of the question',body:'Good interpretation becomes more precise as you learn what kind of text you are reading, where it sits in an argument, and what historical assumptions separate you from its first audiences.',aside:'You do not need to become a specialist before reading. You need habits that tell you when more context matters.',action:'Continue to the next lesson'}
];

export const TOPICS = [
  {id:'covenant',title:'Covenant',category:'Biblical Theology',summary:'How promises, obligations, identity, and divine-human relationship develop across Scripture.',links:['Genesis 12','Exodus 19','Jeremiah 31','Luke 22','Hebrews 8'],course:'Units 1, 4, 11'},
  {id:'grace',title:'Grace',category:'Doctrine',summary:'Gift, favor, reconciliation, and transformed life across biblical texts and Christian traditions.',links:['Romans 3','Ephesians 2','Titus 2'],course:'Units 14, 18'},
  {id:'kingdom',title:'Kingdom of God',category:'Jesus & Gospels',summary:'Royal language, Israel’s hopes, Jesus’ proclamation, present participation, and future consummation.',links:['Daniel 7','Mark 1','Matthew 5–7','Luke 4'],course:'Units 9, 12'},
  {id:'law',title:'Law & Torah',category:'Scripture',summary:'Instruction, covenant, holiness, justice, wisdom, and later Christian interpretation of Torah.',links:['Exodus 20','Deuteronomy 6','Matthew 5','Romans 7'],course:'Units 4, 15'},
  {id:'resurrection',title:'Resurrection',category:'Jesus & Hope',summary:'Israel’s resurrection hope, Jesus’ resurrection, Paul’s argument, and Christian claims about new creation.',links:['Daniel 12','John 20','1 Corinthians 15'],course:'Units 13, 22'},
  {id:'sexuality',title:'Sexuality & Christian Ethics',category:'Ethics & Interpretation',summary:'Biblical texts, historical context, lexical questions, reception history, competing Christian interpretations, and Canonical Shelf’s stated position.',links:['Genesis 1–2','Leviticus 18','Romans 1','1 Corinthians 6'],course:'Advanced Study'}
];

export const THEOLOGIAN_DEMOS = [
  {match:['romans 1','romans one','same-sex','homosexual'],intent:'Romans 1 and same-sex relationships',answer:'Romans 1:26–27 appears inside Paul’s larger argument about Gentile idolatry, distorted worship, and humanity’s shared need for grace. Christian interpreters disagree about how directly Paul’s description maps onto modern categories such as sexual orientation and covenanted same-sex relationships. Canonical Shelf should present the text, its ancient setting, major interpretive arguments, and its own affirming ethical conclusion as distinct layers rather than collapsing them into one claim.',evidence:[['Text','Romans 1:18–32 — the immediate argument links disordered desire with idolatry and a wider catalogue of human wrongdoing.'],['Context','Interpretation requires attention to Greco-Roman sexual practices, status, gender expectations, and Paul’s rhetorical movement into Romans 2–3.'],['Interpretation','Traditional and affirming readings disagree about the scope of Paul’s language and its relation to modern same-sex relationships.'],['Canonical Shelf position','LGBTQ orientation is not inherently sinful; faithful same-sex relationships may embody Christian virtue.']],limits:'The historical evidence does not justify claiming that Romans 1 refers only to one exploitative practice, nor that Paul possessed modern concepts of sexual orientation.',follow:['Show the Greek terms','Compare major Christian readings','Trace Romans 1 into Romans 2–3']},
  {match:['ruth','naomi'],intent:'Ruth and Naomi',answer:'Ruth and Naomi are explicitly portrayed as women bound by extraordinary loyalty, kinship, shared vulnerability, and covenant-like commitment. Queer and lesbian readings of their relationship exist in modern reception history and can illuminate themes of chosen kinship and gendered social vulnerability, but the narrative does not explicitly identify them as a sexual couple.',evidence:[['Text','Ruth 1:16–17 uses unusually strong language of loyalty and shared destiny.'],['Reception','Queer interpreters have read the relationship as a resource for chosen kinship and lesbian/queer identification.'],['Historical limit','The text itself does not define the relationship using modern sexual-identity categories.']],limits:'Reception history should not be presented as if it were an uncontested claim made directly by the narrative.',follow:['Read Ruth 1 in context','Show queer reception history','Compare kinship language']},
  {match:['salvation','saved','grace'],intent:'Salvation and grace',answer:'Canonical Shelf treats salvation first as God’s gift of reconciliation and life, not as a reward for possessing perfect knowledge. Christian traditions differ in how they describe faith, repentance, sacraments, perseverance, judgment, and the reach of grace, so a full answer should distinguish shared claims from denominational formulations.',evidence:[['Scripture','Ephesians 2:8–10 joins grace, faith, gift, and transformed life.'],['Scripture','Romans 5 frames reconciliation through Christ within a larger argument about grace and death.'],['Doctrine','Christian traditions differ over how salvation is received, described, and related to sacramental life.']],limits:'A concise answer cannot erase genuine differences among traditions or settle every question about post-mortem opportunity and judgment.',follow:['Compare denominational views','Show the key passages','Explain justification and sanctification']}
];

export const DEFAULT_THEOLOGIAN = {
  intent:'Study question',
  answer:'This interactive prototype accepts your question and demonstrates the intended Theologian answer structure. The production conversational model is not connected here, so questions outside the prepared demonstration set return this bounded placeholder rather than pretending an AI answer was generated.',
  evidence:[['Prototype behavior','The interface, evidence hierarchy, citations area, limits, and follow-up actions are interactive today.'],['Production requirement','A model/provider and retrieval pipeline must be connected before open-ended synthesis is real.']],
  limits:'No remote model or external scholarly search is used by this prototype.',
  follow:['Ask about Romans 1','Ask about Ruth and Naomi','Ask about salvation and grace']
};

export const PRACTICE_ITEMS = [
  {id:'p1',type:'order',prompt:'Put these events in chronological order.',options:['Exodus from Egypt','Call of Abram','Wilderness journey','Giving of the Law'],answer:['Call of Abram','Exodus from Egypt','Giving of the Law','Wilderness journey']},
  {id:'p2',type:'distinguish',prompt:'Which statement is an interpretation rather than direct textual observation?',options:['Romans 1 mentions “exchange” language.','Romans 1 is part of a larger argument that continues into chapter 2.','Romans 1 condemns every modern same-sex marriage in exactly the same way.','Romans 1 discusses idolatry.'],answer:'Romans 1 condemns every modern same-sex marriage in exactly the same way.'}
];