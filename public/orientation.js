// The Orientation lesson: how the site works, in the names the site uses now. The lesson screen shows it
// (public/ui/screens/lesson.js, orientationAsLesson); it is not scored and does not count toward any module.
//
// Every step is written as one card, so each break is chosen, not measured: one idea per step. Text marks the names of
// site elements with **double asterisks**; the lesson screen sets them in a heavier weight. `desktop` and `phone`
// describe how an element differs by device. There are no pictures: the steps are text.
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
  sections:[
    {
      id:'places',
      title:'Five places and a guide',
      cards:[
        {
          id:'places',
          p:['Everything on the site lives in five places, named along the top of every screen.'],
          phone:'The same five places appear as icons in the bar at the top.',
          note:'This tour is designed for landscape: a laptop, a desktop, or a tablet turned sideways. On a phone held upright it has the same content, arranged to fit.'
        },
        {
          id:'places-list',
          list:[
            '**Shelf:** all 66 books at a glance, and where you left off.',
            '**Learning Path:** the guided course, one lesson at a time.',
            '**Bible:** the full text, chapter by chapter.',
            '**Study Topics:** questions, doctrines and a glossary you can search.',
            '**Review & Practice:** games and review that keep what you learned from fading.'
          ]
        },
        {
          id:'guide',
          p:['The **Theologian** tab sits on the right edge of every screen. Open it from any lesson, chapter or topic to ask about what is in front of you.'],
          desktop:'It opens as a panel beside the page.',
          phone:'It opens centered over a dimmed page.'
        }
      ]
    },
    {
      id:'bible',
      title:'Reading the Bible here',
      cards:[
        {
          id:'reader',
          p:['The Bible reader shows one chapter at a time. Search a reference like John 3:16 and it opens right there. The book name at the top is also the book selector.']
        },
        {
          id:'notes',
          p:['**My Notes** sits beside the text for the verse you are on, with optional help: word meanings, background, and sources. You can change the translation in your **Profile**.'],
          desktop:'My Notes is a pane beside the text.',
          phone:'My Notes is the tab on the right edge; it opens a sheet.',
          actions:[{label:'Open the Bible',href:'/bible'}]
        }
      ]
    },
    {
      id:'lessons',
      title:'How a lesson works',
      cards:[
        {
          id:'lesson',
          p:['A lesson teaches one idea at a time in short steps, and checks it before moving on. The bar at the top shows where you are, and **All steps** lists every step.'],
          desktop:'The list of sections stays at the left.',
          phone:'All steps opens that list.'
        },
        {
          id:'checks',
          p:['Checks ask whether you understood, never whether you agree. Your progress is saved in this browser, and in your account if you sign in.',
            'Each unit ends with a **Checkpoint**. A **Capstone** ends each module and asks you to use a whole stretch of the course at once.']
        }
      ]
    },
    {
      id:'material',
      title:'What kind of material is here',
      cards:[
        {
          id:'material',
          p:['The site keeps different kinds of material separate, so you always know what you are reading. The Bible text itself is the Berean Standard Bible by default. Text, context, and interpretation are kept apart on every page.']
        },
        {
          id:'overview',
          p:['Every book has an overview with four separate facts: where it sits on the shelf, what kind of writing it is, when its events happen, and when it was written. They often differ: many prophets lived during events told in Kings, though their books sit later on the shelf.']
        },
        {
          id:'else',
          list:[
            '**Lessons and Study Topics:** explanation written for this site. Where Christians disagree, they say so and show the main readings.',
            '**Sources:** named scholarly and historical works, so claims can be traced.',
            '**Texts outside the Bible,** such as other ancient gospels, appear only where they help, and are always labeled as outside the canon.'
          ]
        }
      ]
    },
    {
      id:'theologian',
      title:'What the Theologian draws on',
      cards:[
        {
          id:'draws',
          p:['The **Theologian** answers from the Bible text, the material on this site, the published Statement of Faith, and a set of vetted sources.',
            'It can explain positions the site does not hold, but it labels them as positions, not as the site’s teaching. During a scored check it will help you reason but will not pick the answer.']
        },
        {
          id:'privacy',
          p:['If a search looks like a question, the search page offers to ask the **Theologian** for you; nothing is sent until you send it. Your notes, feedback, and account details are never sent to it.']
        }
      ]
    },
    {
      id:'order',
      title:'Why the Learning Path goes in this order',
      cards:[
        {
          id:'module-1',
          p:['The first module, **Reading the Bible Well**, starts with the center: the earliest summary of what Christians proclaimed. Then it takes the questions that worry new readers, shows the Bible as a library of different kinds of writing, and starts the story at Genesis.']
        },
        {
          id:'module-2',
          p:['The second, **The Hebrew Scriptures**, reads Israel’s Scriptures, because Jesus and the New Testament speak in their words: covenant, law, temple, exile, hope.',
            'The third, **Second Temple Judaism & the Christ Event**, enters the world Jesus lived in, then the Gospels and Paul’s letters, which make sense once that world is familiar.']
        },
        {
          id:'module-4',
          p:['The fourth, **Systematic Synthesis**, comes last because it brings back questions you met earlier, now with the evidence to weigh them.',
            'Hard questions appear early on purpose, with honest first answers and fuller ones later. The order is a recommendation, not a lock: you can open any lesson, read anywhere in the Bible, and come back.']
        }
      ]
    },
    {
      id:'continue',
      title:'Review, practice, and your settings',
      cards:[
        {
          id:'review',
          p:['**Review & Practice** brings back what you have already learned, at growing intervals, so finishing something and still remembering it later are tracked separately. Games there never change your Learning Path progress.']
        },
        {
          id:'profile',
          p:['Your **Profile** holds the look of the site, your translation, and your account. The order and meaning of everything stay the same whichever look you choose.'],
          actions:[{label:'Open your Profile',href:'/profile'},{label:'Begin the Learning Path',href:ORIENTATION_START_HREF,primary:true}]
        }
      ]
    }
  ]
};

// Whether this device has seen the Orientation through to the end (or skipped it). The Shelf suggests it first until then,
// but only to someone with no progress and no saved reading place.
const SEEN_KEY='canonical-shelf-orientation-seen';
export function orientationSeen(){try{return localStorage.getItem(SEEN_KEY)==='1'}catch{return false}}
export function markOrientationSeen(){try{localStorage.setItem(SEEN_KEY,'1')}catch{/* storage unavailable */}}
