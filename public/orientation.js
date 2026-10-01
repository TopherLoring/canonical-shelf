export const ORIENTATION_UNIT_ID='unit.orientation';
export const ORIENTATION_LESSON_ID='orientation';

export const ORIENTATION_LESSON={
  id:ORIENTATION_LESSON_ID,
  unitId:ORIENTATION_UNIT_ID,
  unitSequence:0,
  unitTitle:'Orientation',
  lessonSequence:1,
  title:'How Canonical Shelf works',
  objective:'Learn how to use the site, what kinds of material it holds, and why the Pathway is ordered the way it is.',
  scored:false,
  scenes:[
    {
      role:'Navigate',
      title:'Five places and a guide',
      paragraphs:[
        'Everything on the site lives in five places, named along the top of every screen. The Theologian tab on the right edge goes with you to all of them.'
      ],
      bullets:[
        'Shelf: all 66 books at a glance, and where you left off.',
        'Pathway: the guided course, in four modules.',
        'Bible: the full text, chapter by chapter, with a profile for every book.',
        'Catalog: reference topics, the glossary, and book profiles you can search.',
        'Practice: games and review that keep what you learned from fading.',
        'Theologian: a chat you can open from any screen to ask about what is in front of you.'
      ]
    },
    {
      role:'Navigate',
      title:'Reading the Bible here',
      paragraphs:[
        'The Bible reader shows one chapter at a time. Pick a book from the shelf or search for a reference like John 3:16. Each book has a profile that tells you what it is before you start reading.',
        'The study desk beside the text holds your notes for the verse or lesson you are on, plus optional help: word meanings, background, and sources. You can change the translation in your profile.'
      ],
      actions:[{label:'Open the Bible',href:'/bible'}]
    },
    {
      role:'Navigate',
      title:'How a lesson works',
      paragraphs:[
        'A lesson teaches one idea and then checks it right away with a short activity, before moving to the next idea. The dots down the side show where you are.',
        'Checks ask whether you understood, never whether you agree. Each unit ends with a mastery activity, and capstones ask you to use a whole stretch of the course at once. Your progress is saved in this browser, and in your account if you sign in.'
      ]
    },
    {
      role:'Understand',
      title:'What kind of material is here',
      paragraphs:[
        'The site keeps different kinds of material separate, so you always know what you are reading.'
      ],
      bullets:[
        'The Bible text itself: the Berean Standard Bible by default.',
        'Book profiles: four separate facts about each book, where it sits on the shelf, what kind of writing it is, when its events happen, and when it was written. These often differ: many prophets lived during events told in Kings, though their books sit later on the shelf.',
        'Lessons and Catalog topics: explanation written for this site. Where Christians disagree, they say so and show the main readings.',
        'Sources: named scholarly and historical works, so claims can be traced.',
        'Texts that are not in the Bible, such as other ancient gospels, appear only where they help, and are always labeled as outside the canon.'
      ],
      callout:'Text, context, and interpretation are kept apart on every page.'
    },
    {
      role:'Understand',
      title:'What the Theologian draws on',
      paragraphs:[
        'The Theologian answers from the Bible text, the material on this site, the published Statement of Faith, and a set of vetted sources. It can explain positions the site does not hold, but it labels them as positions, not as the site’s teaching.',
        'During a scored check it will help you reason but will not pick the answer. If the service cannot be reached, it says so and gives a shorter answer from the site’s own material. Your notes, feedback, and account details are never sent to it.'
      ]
    },
    {
      role:'Understand',
      title:'Why the Pathway goes in this order',
      paragraphs:[
        'Module 1 starts with the center: the earliest summary of what Christians proclaimed, so everything after has something to connect to. Then it takes the questions that worry new readers, shows the Bible as a library of different kinds of writing, and starts the story at Genesis.',
        'Module 2 reads Israel’s Scriptures, because Jesus and the New Testament speak in their words: covenant, law, temple, exile, hope. Module 3 enters the world Jesus lived in, then the Gospels and Paul’s letters, which make sense once that world is familiar. Module 4 comes last because it brings back questions you met earlier, now with the evidence to weigh them.',
        'Hard questions appear early on purpose, with honest first answers and fuller ones later. The order is a recommendation, not a lock: you can open any unit, read anywhere in the Bible, and come back.'
      ]
    },
    {
      role:'Continue',
      title:'Practice, review, and your settings',
      paragraphs:[
        'Practice brings back what you have already learned, at growing intervals, so finishing something and still remembering it later are tracked separately. Games there never change your Pathway progress.',
        'You can change the look of the site at any time in your profile. The order and meaning of everything stay the same whichever look you choose.'
      ],
      themeDemo:true,
      actions:[{label:'Begin Module 1',href:'/course?unit=c1.christianity&lesson=begin'}]
    }
  ]
};
