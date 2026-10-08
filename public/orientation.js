// The Orientation lesson: how the site works, in the names the site uses now. It is shown by the lesson screen
// (public/ui/screens/lesson.js, orientationAsLesson), is not scored, and does not count toward any module.
export const ORIENTATION_UNIT_ID='unit.orientation';
export const ORIENTATION_LESSON_ID='orientation';
export const ORIENTATION_START_HREF='/course?unit=c1.christianity&lesson=begin';

export const ORIENTATION_LESSON={
  id:ORIENTATION_LESSON_ID,
  unitId:ORIENTATION_UNIT_ID,
  unitTitle:'Orientation',
  title:'How Canonical Shelf works',
  objective:'Learn how to use the site, what kinds of material it holds, and why the Learning Path is ordered the way it is.',
  scored:false,
  scenes:[
    {
      id:'places',
      title:'Five places and a guide',
      paragraphs:[
        'Everything on the site lives in five places, named along the top of every screen. The Theologian tab on the right edge goes with you to all of them.'
      ],
      bullets:[
        'Shelf: all 66 books at a glance, and where you left off.',
        'Learning Path: the guided course, one lesson at a time.',
        'Bible: the full text, chapter by chapter. Every book has an overview that says what to read first.',
        'Study Topics: questions, doctrines and a glossary you can search.',
        'Review & Practice: games and review that keep what you learned from fading.',
        'Theologian: a chat you can open from any screen to ask about what is in front of you.'
      ]
    },
    {
      id:'bible',
      title:'Reading the Bible here',
      paragraphs:[
        'The Bible reader shows one chapter at a time. Pick a book on the Shelf, or search for a reference like John 3:16 and it opens right there. The book name at the top is also the book selector.',
        'My Notes sits beside the text for the verse or lesson you are on, with optional help: word meanings, background, and sources. You can change the translation in your Profile.'
      ],
      actions:[{label:'Open the Bible',href:'/bible'}]
    },
    {
      id:'lessons',
      title:'How a lesson works',
      paragraphs:[
        'A lesson teaches one idea at a time in short steps, and checks it before moving on. The bar at the top shows where you are, and All steps lists every step.',
        'Checks ask whether you understood, never whether you agree. Each unit ends with a Checkpoint, and a Capstone asks you to use a whole stretch of the course at once. Your progress is saved in this browser, and in your account if you sign in.'
      ]
    },
    {
      id:'material',
      title:'What kind of material is here',
      paragraphs:[
        'The site keeps different kinds of material separate, so you always know what you are reading.'
      ],
      bullets:[
        'The Bible text itself: the Berean Standard Bible by default.',
        'Book overviews: four separate facts about each book. Where it sits on the shelf, what kind of writing it is, when its events happen, and when it was written often differ. Many prophets lived during events told in Kings, though their books sit later on the shelf.',
        'Lessons and Study Topics: explanation written for this site. Where Christians disagree, they say so and show the main readings.',
        'Sources: named scholarly and historical works, so claims can be traced.',
        'Texts that are not in the Bible, such as other ancient gospels, appear only where they help, and are always labeled as outside the canon.'
      ],
      callout:'Text, context, and interpretation are kept apart on every page.'
    },
    {
      id:'theologian',
      title:'What the Theologian draws on',
      paragraphs:[
        'The Theologian answers from the Bible text, the material on this site, the published Statement of Faith, and a set of vetted sources. It can explain positions the site does not hold, but it labels them as positions, not as the site’s teaching.',
        'During a scored check it will help you reason but will not pick the answer. If a search looks like a question, the search page offers to ask the Theologian for you; nothing is sent until you send it. Your notes, feedback, and account details are never sent to it.'
      ]
    },
    {
      id:'order',
      title:'Why the Learning Path goes in this order',
      paragraphs:[
        'The first module starts with the center: the earliest summary of what Christians proclaimed, so everything after has something to connect to. Then it takes the questions that worry new readers, shows the Bible as a library of different kinds of writing, and starts the story at Genesis.',
        'The second module reads Israel’s Scriptures, because Jesus and the New Testament speak in their words: covenant, law, temple, exile, hope. The third enters the world Jesus lived in, then the Gospels and Paul’s letters, which make sense once that world is familiar. The fourth comes last because it brings back questions you met earlier, now with the evidence to weigh them.',
        'Hard questions appear early on purpose, with honest first answers and fuller ones later. The order is a recommendation, not a lock: you can open any lesson, read anywhere in the Bible, and come back.'
      ]
    },
    {
      id:'continue',
      title:'Review, practice, and your settings',
      paragraphs:[
        'Review & Practice brings back what you have already learned, at growing intervals, so finishing something and still remembering it later are tracked separately. Games there never change your Learning Path progress.',
        'Your Profile holds the look of the site, your translation, and your account. The order and meaning of everything stay the same whichever look you choose.'
      ],
      actions:[{label:'Open your Profile',href:'/profile'},{label:'Begin the Learning Path',href:ORIENTATION_START_HREF,primary:true}]
    }
  ]
};

// Whether this device has seen the Orientation through to the end (or skipped it). The Shelf suggests it first until then,
// but only to someone with no progress and no saved reading place.
const SEEN_KEY='canonical-shelf-orientation-seen';
export function orientationSeen(){try{return localStorage.getItem(SEEN_KEY)==='1'}catch{return false}}
export function markOrientationSeen(){try{localStorage.setItem(SEEN_KEY,'1')}catch{/* storage unavailable */}}
