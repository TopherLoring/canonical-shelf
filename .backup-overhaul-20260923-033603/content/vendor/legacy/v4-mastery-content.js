/* Canonical Shelf v4 mastery modules — learner-facing rewrites.
   Each entry replaces generic templated copy with a specific explanation, visual, and challenge design.
   The file will grow to all 69 legacy IDs before v4 merges. */
window.CANON_V4_MASTERY = {
  'n.what': {
    title:'Know what a book is doing before you quote it',
    dek:'A Bible book is more than a container for isolated verses. Start by learning its shape, purpose, people, and situation.',
    body:[
      'When people say “the Bible says,” they often jump straight to a sentence. A better first question is: what kind of book am I inside, and what is this book trying to do? Genesis tells a long origin story. Psalms gathers poetry and prayer. Romans develops an argument in a letter. Revelation uses symbolic visions. Those differences matter before any individual line is applied.',
      'A useful book profile has a few simple parts: what happens or what argument develops, who appears or speaks, the historical setting the book portrays, who the likely audience is, and what questions or problems the book addresses. You do not need a seminary degree to build that profile. You need to notice what the book itself repeatedly emphasizes and then keep background claims proportionate to the evidence.',
      'This habit protects you from two opposite mistakes: treating every sentence as if it were a timeless instruction written directly to you, or treating background information as if it can make the text mean anything. The book gives you the frame; historical and literary context sharpen it.'
    ],
    plain:'Before asking “What does this verse mean for me?”, ask “What is this book doing, and where does this sentence fit inside it?”',
    visual:{type:'book-profile',title:'The five questions that orient a book',shelf:'Where does it sit in the library?',setting:'What world or situation does it portray?',synopsis:'What story, argument, prayer, or vision develops?',people:'Who speaks, acts, or receives the message?',audience:'Who is being addressed?',purpose:'What problem, hope, or question is the book working on?'},
    challenge:{kind:'book-detective',title:'Recognize the kind of book',prompt:'Which profile best fits a New Testament letter?',clues:['It addresses a particular community.','Its argument develops across paragraphs.','Commands respond to real pastoral problems.'],options:['A collection of independent proverbs','A letter written into a community situation','A chronological biography of Jesus','A symbolic apocalypse'],answer:1,hints:['Look for the form that naturally has a sender and recipients.','A letter is occasional: it responds to a real situation.'],why:'A letter has a sender, recipients, and an argument shaped by a community situation.'}
  },
  'v.what': {
    title:'A memorable verse still has a speaker, audience, and situation',
    dek:'Verse numbers help you find words; they do not remove those words from the conversation they came from.',
    body:[
      'Chapter and verse numbers were added long after the biblical books were written. They are excellent coordinates, but they can make a sentence look more independent than it really is. A line from Job may be spoken by Job, one of his friends, or God. A sentence in a Gospel may be narration, a quotation from Jesus, or a hostile accusation. A line in a letter may answer a specific conflict in a particular church.',
      'So “knowing a verse” has at least five parts: where it is, who is speaking, who is being addressed, what is happening around it, and what the wording contributes to that larger scene or argument. Memorizing the words is useful; restoring those five parts makes the memory trustworthy.',
      'This also changes application. Philippians 4:13, for example, sits inside Paul’s discussion of learning contentment in both need and abundance. Keeping that setting attached to the line gives the verse more depth, not less.'
    ],
    plain:'A verse is not a fortune cookie. Put the sentence back into the conversation before deciding what it promises or commands.',
    visual:{type:'verse-context',title:'The context chain',speaker:'Who says the words?',recipient:'Who hears or receives them?',situation:'What problem, story, prayer, or argument surrounds them?',wording:'What does the sentence actually say in that setting?',application:'Only then ask how the meaning can responsibly travel into a new setting.'},
    challenge:{kind:'context-lens',title:'Put the verse back into context',prompt:'Build the most responsible context profile for Philippians 4:13.',fields:['Speaker','Recipient','Situation','Purpose'],options:[['Paul','Jesus','David'],['The church at Philippi','The Roman emperor','Job'],['Contentment in need and abundance','Winning any desired competition','A creation account'],['Encourage durable trust in changing circumstances','Guarantee every personal goal','Explain the order of the Bible books']],answer:[0,0,0,0],hints:['Start with the book: Philippians is a letter from Paul.','Read verses 10–12 before verse 13.'],why:'The line is Paul’s statement about strength for contentment through changing circumstances, addressed to the Philippian church.'}
  },
  't.what': {
    title:'A biblical theme is a thread, not a repeated keyword',
    dek:'Themes become meaningful when you trace how an idea works in different books instead of collecting matching words.',
    body:[
      'A theme is a recurring concern that develops across texts. Covenant, exile, kingdom, sacrifice, mercy, wisdom, worship, and mission are examples. But a computer search for the same English word is not enough. A theme can appear without the same vocabulary, and the same vocabulary can do different work in different contexts.',
      'Good theme tracing asks three questions at each stop: What does the idea mean here? What problem or hope is it addressing? What stays continuous, and what changes when the theme appears later? That last question matters because biblical writers reuse earlier images creatively rather than merely repeating definitions.',
      'The result should look like a thread with distinct knots, not a pile of proof texts. You preserve the differences between the passages while explaining why they still belong in the same conversation.'
    ],
    plain:'Follow the idea across the Bible, but let each passage keep its own job.',
    visual:{type:'theme-thread',title:'How a theme develops',stops:[{book:'Genesis',title:'Promise',text:'A relationship begins with promises and responsibilities.'},{book:'Exodus',title:'Covenant people',text:'The relationship gains communal practices and obligations.'},{book:'Jeremiah',title:'Renewal',text:'Covenant language becomes part of hope after failure.'},{book:'New Testament',title:'Re-read through Christ',text:'Christian writers connect earlier covenant language with Jesus and the Church.'}]},
    challenge:{kind:'compare-board',title:'Trace without flattening',prompt:'Sort each statement according to what good theme tracing requires.',lanes:['Keep','Both','Avoid'],items:['Explain what the theme does in each passage.','Notice continuity and difference.','Assume the same English word always means exactly the same thing.','Use one verse to erase the setting of another.'],answer:[0,0,2,2],hints:['Theme tracing preserves context.','A shared idea can develop without becoming identical everywhere.'],why:'Responsible theme tracing explains connection while preserving each passage’s distinct setting and function.'}
  },
  'c.two': {
    title:'The Bible has more than one kind of “when”',
    dek:'Shelf order, the time a story portrays, and the time a text was written are different coordinates.',
    body:[
      'The Bible is not arranged as one continuous timeline. Job appears after Esther on the shelf, but the story is not therefore set after Esther. The prophets are grouped together even though they spoke during different parts of Israel’s history. The New Testament letters are grouped largely by type and length, not in the order they were written.',
      'When chronology matters, separate at least three questions: Where does this book sit in the canon? When are the events or situation it portrays? When was the book or its final form composed? Sometimes the answers are close together. Sometimes they are centuries apart, and sometimes scholars disagree about the last question.',
      'This distinction prevents a very common beginner mistake: assuming “later in my Bible” means “later in history.” Shelf order is useful navigation. Historical order is a reconstruction that uses different evidence.'
    ],
    plain:'Printed order tells you where to find a book. It does not automatically tell you when its events happened or when it was written.',
    visual:{type:'stack',title:'Three different coordinates',layers:[{title:'Shelf order',text:'Where the book appears in this Bible.'},{title:'Narrated setting',text:'The period or events the text portrays.'},{title:'Composition',text:'When the text was written, collected, or shaped.'}]},
    challenge:{kind:'evidence-lab',title:'Separate the coordinates',prompt:'Classify each claim.',lanes:['Supported','Possible','Overreach'],items:['Malachi sits at the end of the Protestant Old Testament shelf.','A book can portray events earlier than its final composition.','A later shelf position proves a later date of composition.','Every disputed biblical date can be settled from shelf order.'],answer:[[0,0],[1,0],[2,2],[3,2]],hints:['Shelf position is directly observable; composition is a historical question.','Do not turn an organizational choice into a dating method.'],why:'Shelf order and chronology overlap in places but answer different questions.'}
  },
  'n.author': {
    title:'“Who wrote it?” can have more than one kind of answer',
    dek:'Traditional attribution, what a text claims for itself, and modern historical reconstruction should not be blended into one certainty.',
    body:[
      'Some biblical books name an author or sender. Some are traditionally associated with a figure even when the text itself does not explicitly identify that person. Some may preserve material from more than one period or source. Those are different kinds of evidence.',
      'A clear explanation labels the kind of claim being made. “Traditionally attributed to Moses” is not the same sentence as “the text explicitly says Moses wrote every line.” “Paul identifies himself as sender” is stronger internal evidence than a later title attached to an anonymous work. Historical scholarship then asks further questions about language, sources, editing, and setting.',
      'You do not need to solve every authorship debate before reading well. What matters is refusing to smuggle uncertainty into a confident label. State what is known, what is traditional, and what is debated.'
    ],
    plain:'Say what kind of authorship claim you mean: explicit, traditional, or reconstructed.',
    visual:{type:'flow',title:'From evidence to an authorship claim',nodes:[{title:'Textual evidence',text:'Does the work name a writer or sender?'},{title:'Tradition',text:'How was the book historically attributed?'},{title:'Historical analysis',text:'What do language, sources, and setting suggest?'},{title:'Qualified conclusion',text:'State the claim at the strength the evidence supports.'}]},
    challenge:{kind:'evidence-lab',title:'Calibrate the claim',prompt:'Sort the statements by evidential strength.',lanes:['Supported','Possible','Overreach'],items:['Romans names Paul as its sender.','A traditional attribution can be historically important evidence.','Every traditional attribution is explicitly stated inside the biblical text.','If authorship is debated, the book has no meaning.'],answer:[[0,0],[1,0],[2,2],[3,2]],hints:['Look for what the statement claims about evidence, not whether tradition matters.'],why:'Responsible authorship discussion distinguishes explicit claims, tradition, and historical reconstruction.'}
  },
  'n.audience': {
    title:'Every text lands somewhere before it lands with us',
    dek:'Original audiences do not make Scripture irrelevant; they tell you what problem the words were first addressing.',
    body:[
      'A prophetic oracle spoken to Judah during a crisis, a proverb offered as wisdom, a Gospel narrative shaped for a community, and a letter sent to Corinth do not begin with the same audience. Identifying that first horizon makes the text more concrete.',
      'Audience can sometimes be named directly. Paul writes “to the church of God in Corinth.” Luke addresses Theophilus. Other cases require reconstruction from clues inside the book and historical evidence. Again, the level of certainty should match the evidence.',
      'Application is a second movement, not a shortcut. First ask what the communication was doing there. Then ask what principle, warning, hope, or pattern can responsibly travel into a new situation—and what details should remain tied to the original setting.'
    ],
    plain:'Before asking how a passage speaks to us, learn who it was speaking to first.',
    visual:{type:'flow',title:'How meaning travels responsibly',nodes:[{title:'First audience',text:'Who receives the message in its original setting?'},{title:'Original purpose',text:'What is the text doing for them?'},{title:'Enduring meaning',text:'What principle or claim survives the change of setting?'},{title:'Present application',text:'How can that meaning be lived now without copying accidental details?'}]},
    challenge:{kind:'sequence-path',title:'Move from then to now',prompt:'Put the interpretation steps in a responsible order.',items:['Identify the first audience and situation.','Explain what the passage is doing there.','State the enduring claim or principle.','Develop a proportionate present application.'],answer:[0,1,2,3],hints:['Do not begin with application.','The original situation comes before the modern analogy.'],why:'Application becomes more responsible when it grows from original audience, purpose, and meaning.'}
  }
};
