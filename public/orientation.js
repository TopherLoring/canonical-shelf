export const ORIENTATION_UNIT_ID='unit.orientation';
export const ORIENTATION_LESSON_ID='orientation';

export const ORIENTATION_LESSON={
  id:ORIENTATION_LESSON_ID,
  unitId:ORIENTATION_UNIT_ID,
  unitSequence:0,
  unitTitle:'Orientation',
  lessonSequence:1,
  title:'Welcome to Canonical Shelf',
  objective:'Learn what Canonical Shelf is, how its study tools work, and how to move from guided learning toward independent biblical study.',
  scored:false,
  scenes:[
    {
      role:'Orient',
      title:'A guided way into Scripture',
      paragraphs:[
        'Canonical Shelf is a Bible-learning and study environment for thoughtful adults. It combines a guided Course, the biblical text itself, curated reference material, active Practice, and deeper study tools so that learning does not stop at remembering isolated facts.',
        'The goal is not permanent dependence on lessons. The guided course provides scaffolding: first showing you what to notice, then helping you practice how to investigate a text, question, or claim for yourself.'
      ],
      callout:'Learn → Study → Remember → Investigate independently.'
    },
    {
      role:'Orient',
      title:'Why is it called Canonical Shelf?',
      paragraphs:[
        'The word canon comes through Greek kanōn, a word associated with a measuring rod, rule, or standard. Over time, Christians used canon for the collection of writings recognized as Scripture—books regarded by a particular religious community as belonging to its authoritative biblical collection.',
        'So the biblical canon is not simply “all ancient religious books.” It is the particular collection a community recognizes as its Bible. Canonical Shelf uses the 66-book Protestant canon: 39 books in the Old Testament and 27 in the New Testament. Roman Catholic and Eastern Orthodox traditions recognize somewhat different Old Testament collections, and Orthodox canons also vary.'
      ],
      callout:'Like a library, the Bible is grouped by category, not chronology.'
    },
    {
      role:'Visualize',
      title:'A library, not one ordinary book',
      paragraphs:[
        'A printed Bible binds dozens of distinct writings between two covers. Those writings come from different periods, circumstances, communities, authorship traditions, and literary forms. Books next to one another on the shelf are often related by literary type or traditional canonical placement rather than by the historical sequence of the events they describe.',
        'Many prophets, for example, lived during periods narrated in Kings and Chronicles even though the prophetic books appear later in the shelf order. Canonical Shelf therefore keeps four questions distinct: where a book sits on the shelf, what kind of writing it is, when its narrated events occur, and when or how the text was composed or compiled.'
      ],
      bullets:['Law / Torah','History','Poetry and Wisdom','Major Prophets','Minor Prophets','Gospels','Acts','Pauline Letters','General Letters','Revelation / Apocalypse'],
      callout:'Shelf order ≠ story chronology ≠ composition history.'
    },
    {
      role:'Explain',
      title:'What the course will teach',
      paragraphs:[
        'The curriculum begins with orientation and the biblical library, then develops the larger story, chronology, people, places, genres, themes, key passages, historical context, translation, relevant Hebrew and Greek, interpretation, Christian doctrine, contested questions, evidence evaluation, and independent synthesis.',
        'The learning progression is deliberate. You will move from recognition and location toward interpretation, evaluating evidence, transferring a method to unfamiliar material, and eventually synthesizing a responsible conclusion.'
      ],
      bullets:['Remember','Locate','Distinguish','Relate','Interpret','Evaluate evidence','Transfer','Synthesize']
    },
    {
      role:'Navigate',
      title:'Course — the guided path',
      paragraphs:[
        'Course is the recommended sequence through 25 scored curriculum units. Guided lessons and mastery activities are interleaved so that explanation and retrieval belong to the same learning path rather than becoming two disconnected systems.',
        'Progress distinguishes completion, retention, mastery, and review-due states. You may leave the path to investigate something elsewhere and return without losing your place.'
      ],
      actions:[{label:'Open Course overview',href:'/course'}]
    },
    {
      role:'Navigate',
      title:'Bible — the library itself',
      paragraphs:[
        'Bible owns the bookshelf, book navigation, chapters, reader, book profiles, and the study affordances that belong closest to the biblical text. Use it when you want to read a passage directly, locate a book, compare its canonical setting with chronology, or follow references from a lesson or Topic.',
        'You do not need to memorize the shelf before beginning. The Course teaches the groups progressively while the Bible remains available as a reference environment at any time.'
      ],
      actions:[{label:'Open Bible',href:'/bible'}]
    },
    {
      role:'Context',
      title:'Where deeper study and evidence live',
      paragraphs:[
        'Within lessons, look for vocabulary, deeper explanation, passage notes, challenge feedback, interpretive boundaries, and source trails. Passage-level study can surface translation choices, manuscript or textual notes when relevant, original-language observations, historical and literary context, evidence strength, competing interpretations, reception history, doctrine, and application.',
        'Across the site, use Topics, book profiles, maps, timelines, search, cross-references, and the Guide. Bible translation controls help you compare wording without assuming that every difference changes doctrine. External scholarly sources, academic books or articles, primary sources, and further-reading references are cited where they materially support or qualify a claim.'
      ],
      callout:'Canonical Shelf should show what kind of claim you are looking at: text → evidence/history → interpretation → reception → doctrine → application.'
    },
    {
      role:'Navigate',
      title:'Topics and the Guide — follow a question',
      paragraphs:[
        'Topics is a curated reference layer rather than a second curriculum. Use it for doctrine, biblical concepts, Christian practice, difficult questions, glossary material, and links back into Scripture or Course content.',
        'The Guide can help connect material already available in Canonical Shelf. It is bounded by the project’s theological and evidence policies and should distinguish direct textual evidence from interpretation rather than presenting every disputed question as settled.'
      ],
      actions:[{label:'Browse Topics',href:'/topics'}]
    },
    {
      role:'Practice',
      title:'Practice — make learning durable',
      paragraphs:[
        'Practice is reinforcement, not a second course. It returns you to material you have already encountered through retrieval, ordering, matching, classification, reconstruction, comparison, evidence work, argument mapping, scenarios, and other task-appropriate interactions.',
        'Spaced review makes forgetting visible before it becomes permanent. The review schedule grows as material is successfully retained, so “complete” and “still remembered later” remain different states.'
      ],
      callout:'Practice rewards retrieval, delayed retention, improvement, transfer, and mastery—not theological assent.',
      actions:[{label:'Open Practice',href:'/practice'}]
    },
    {
      role:'Personalize',
      title:'Choose the visual environment that works for you',
      paragraphs:[
        'Canonical Shelf supports complete aesthetic packages rather than a single mandatory palette. A theme can change the site’s palette, typography pairing, surfaces, rules, elevation, focus chrome, controls, diagrams, and motion character while leaving curriculum meaning, progress, assessment, and theological interpretation unchanged.',
        'You can change the theme again at any time from Appearance.'
      ],
      themeDemo:true
    },
    {
      role:'Explore',
      title:'The course is a path, not a locked hallway',
      paragraphs:[
        'You may skip ahead, open another unit, browse the Bible, investigate a Topic, practice learned material, follow a cross-reference, or return to the guided path. The curriculum supplies a recommended learning sequence, not a restriction on curiosity.',
        'When a lesson raises a question that matters to you, following that question is part of learning. Canonical Shelf is designed to help you return with better context rather than punish exploration.'
      ]
    },
    {
      role:'Continue',
      title:'The destination is independent study',
      paragraphs:[
        'At the beginning, the question may be “What should I learn next?” Over time, the goal becomes “I know how to investigate this responsibly.” Independent study means being increasingly able to locate relevant texts, distinguish evidence from interpretation, compare credible readings, identify what remains uncertain, and decide what further evidence you need.',
        'Unit 1 begins the scored curriculum with Christianity’s central proclamation. The tutorial remains available whenever you want to revisit how Canonical Shelf works.'
      ],
      callout:'Next: Unit 1 · Lesson 1 — Begin with the central story',
      actions:[{label:'Begin Unit 1',href:'/course?unit=unit.start&lesson=begin'}]
    }
  ]
};
