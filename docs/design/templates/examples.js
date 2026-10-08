// Screen markup for the six templates, desktop and phone. Text and progress are the boards' demonstration content;
// the app supplies real data through the same structure. Every size lives in CSS (css/src), proportional to --u.
import { icons as i } from './icons.js';

const GROUPS = {
  law: 'Law', history: 'History', wisdom: 'Wisdom and Poetry', major: 'Major Prophets', minor: 'Minor Prophets',
  gospels: 'Gospels and Acts', paul: 'Paul’s Letters', general: 'General Letters', revelation: 'Revelation'
};
const tag = (g, label = GROUPS[g]) => `<span class="cs-tag" data-group="${g}"><span class="cs-tag__dot"></span>${label}</span>`;
const bar = (pct, label, tone = '') => `<div class="cs-bar${tone ? ` cs-bar--${tone}` : ''}" role="progressbar" aria-label="${label}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="--pct:${pct}%"></span></div>`;

/* ---------------- Shelf ---------------- */
// Book list, chapter counts and verse counts drive spine width (square root of verses) and colour group, as on Main.dc.html.
const BOOKS = [
  ['law','Genesis',50],['law','Exodus',40],['law','Leviticus',27],['law','Numbers',36],['law','Deuteronomy',34],
  ['history','Joshua',24],['history','Judges',21],['history','Ruth',4],['history','1 Samuel',31],['history','2 Samuel',24],['history','1 Kings',22],['history','2 Kings',25],['history','1 Chronicles',29],['history','2 Chronicles',36],['history','Ezra',10],['history','Nehemiah',13],['history','Esther',10],
  ['wisdom','Job',42],['wisdom','Psalms',150],['wisdom','Proverbs',31],['wisdom','Ecclesiastes',12],['wisdom','Song of Songs',8],
  ['major','Isaiah',66],['major','Jeremiah',52],['major','Lamentations',5],['major','Ezekiel',48],['major','Daniel',12],
  ['minor','Hosea',14],['minor','Joel',3],['minor','Amos',9],['minor','Obadiah',1],['minor','Jonah',4],['minor','Micah',7],['minor','Nahum',3],['minor','Habakkuk',3],['minor','Zephaniah',3],['minor','Haggai',2],['minor','Zechariah',14],['minor','Malachi',4],
  ['gospels','Matthew',28],['gospels','Mark',16],['gospels','Luke',24],['gospels','John',21],['gospels','Acts',28],
  ['paul','Romans',16],['paul','1 Corinthians',16],['paul','2 Corinthians',13],['paul','Galatians',6],['paul','Ephesians',6],['paul','Philippians',4],['paul','Colossians',4],['paul','1 Thessalonians',5],['paul','2 Thessalonians',3],['paul','1 Timothy',6],['paul','2 Timothy',4],['paul','Titus',3],['paul','Philemon',1],
  ['general','Hebrews',13],['general','James',5],['general','1 Peter',5],['general','2 Peter',3],['general','1 John',5],['general','2 John',1],['general','3 John',1],['general','Jude',1],
  ['revelation','Revelation',22]
];
const VERSES = [1533,1213,859,1288,959,658,618,85,810,695,816,719,942,822,280,406,167,1070,2461,915,222,117,1292,1364,154,1273,357,197,73,146,21,48,105,47,56,53,38,211,55,1071,678,1151,879,1007,433,437,257,149,155,104,95,89,47,113,83,46,25,303,108,105,61,105,13,14,25,404];
const JITTER = [0, 7, -5, 3, -8, 6, -2, 9, -6, 2, 5, -4, 8, -7, 1];
const SHELF = 886, LEAN = 12;

function spineWeights() {
  const ot = BOOKS.slice(0, 39), sumOT = ot.reduce((s, _, k) => s + Math.sqrt(VERSES[k]), 0);
  const perOT = (SHELF - 39 * 10) / sumOT;
  const sumNT = BOOKS.slice(39).reduce((s, _, k) => s + Math.sqrt(VERSES[39 + k]), 0);
  const perNT = (SHELF * 0.8 - 34 - 27 * 20) / sumNT;
  return BOOKS.map((_, k) => k < 39 ? 10 + perOT * Math.sqrt(VERSES[k]) : 20 + perNT * Math.sqrt(VERSES[k]));
}
const chapters = n => `${n} chapter${n === 1 ? '' : 's'}`;
function shelfRow(from, to, label, selected) {
  const w = spineWeights();
  let prevH = 0, used = 0;
  const books = BOOKS.slice(from, to).map(([g, name, ch], k) => {
    const n = from + k, h = Math.round(Math.min(204, 186 + JITTER[n % JITTER.length]) * 0.64);
    const lean = name === 'Revelation' ? Math.round(prevH * Math.tan(LEAN * Math.PI / 180)) : 0;
    prevH = h; used += w[n];
    return `<button type="button" class="cs-spine${name === selected ? ' is-selected' : ''}${lean ? ' is-leaning' : ''}" data-group="${g}" data-book="${name}" aria-label="${name}, ${GROUPS[g]}, ${chapters(ch)}" aria-pressed="${name === selected}" style="--w:${w[n].toFixed(2)};--h:${h};--lean:${lean}"><span class="cs-spine__cap"></span><span class="cs-spine__rib"></span><span class="cs-spine__rib cs-spine__rib--low"></span><span class="cs-spine__cap cs-spine__cap--low"></span></button>`;
  }).join('');
  const room = Math.max(0, SHELF - used - (from ? 34 : 0));
  return `<div class="cs-shelf-row"><span class="cs-bookend"></span>${books}<span class="cs-bookend"></span>${room > 1 ? `<span class="cs-shelf-room" style="--w:${room.toFixed(2)}"></span>` : ''}</div><div class="cs-plank"><span class="cs-plank__foot"></span><span class="cs-plank__foot cs-plank__foot--end"></span><span class="cs-plaque">${label}</span></div>`;
}
const legend = `<ul class="cs-legend" aria-label="The nine shelves">${Object.entries(GROUPS).map(([g, l]) => `<li><span class="cs-swatch" data-group="${g}"></span>${l}</li>`).join('')}</ul>`;
const bookPanel = `<aside class="cs-book" aria-label="Selected book">
  <span class="cs-book__meta">${tag('law')}Book 1 of 66</span>
  <div class="cs-book__head"><h2>Genesis</h2><span class="cs-book__tagline">Origins, and one chosen family</span></div>
  <p class="cs-book__synopsis">God makes a world and people break it: a garden, a murder, a flood, a tower. Then he picks one man, Abraham, promises him land and descendants, and follows that family four generations into Egypt.</p>
  <div class="cs-split"><span>50 chapters</span><span>Reading chapter 3</span></div>
  ${bar(6, 'Genesis reading progress')}
  <a class="cs-button cs-button--block cs-button--tall" href="?screen=reader">Resume Genesis 3</a>
  <a class="cs-book__overview" href="?screen=reader">Book overview</a>
  <dl class="cs-book__facts">
    <div><dt>Where to begin</dt><dd>Chapters 1–3 for the beginning, then 37–50 for the Joseph story.</dd></div>
    <div><dt>People</dt><dd class="cs-chips">${['Adam','Noah','Abraham','Sarah','Jacob','Joseph'].map(p => `<a href="#">${p}</a>`).join('')}</dd></div>
    <div><dt>Setting</dt><dd>Prehistory to roughly 1800–1600 BC</dd></div>
  </dl>
</aside>`;
const continueCards = `<div class="cs-continue">
  <a class="cs-card cs-continue__card" href="?screen=lesson"><span class="cs-caption">Learning Path · Module 1 · Unit 2 · Lesson 1</span><span class="cs-continue__title">Meet the library: nine kinds of books</span><span class="cs-continue__go">Continue the lesson →</span></a>
  <a class="cs-card cs-continue__card" href="?screen=reader"><span class="cs-caption">My Notes · Genesis 1:2</span><span class="cs-continue__note">What does “the deep” mean here? Bring this up on Sunday.</span><span class="cs-continue__go">Open in the Bible →</span></a>
</div>`;
const shelfIntro = `<div class="cs-shelf-intro"><h1 class="cs-title">The Canonical<br><em>Shelf</em></h1><p>Learn the Bible as a connected library: read in context, follow the story, ask hard questions, and build durable understanding without collapsing evidence, interpretation, and doctrine into one thing.</p></div>`;
const shelfCase = `<section class="cs-shelf" aria-label="Bookshelf">${shelfRow(0, 39, 'Old Testament · 39 books', 'Genesis')}${shelfRow(39, 66, 'New Testament · 27 books', 'Genesis')}</section>`;

const shelf = {
  frame: 'shelf',
  desktop: () => `<div class="cs-shelf-main">${shelfIntro}${shelfCase}${legend}${continueCards}</div>${bookPanel}`,
  phone: () => `<div class="cs-scroll">${shelfIntro}${shelfCase}${legend}${bookPanel}${continueCards}</div>`
};

/* ---------------- Learning Path ---------------- */
const lessons = ['Meet the library: nine kinds of books','How to read what you’re reading','Find your way: references, canon, and translation','Practice: reading Psalm 23 as poetry','The timeline and the skills you’ll use from here'];
const modules = [
  ['Module 1 · 4 units','Reading the Bible Well: The Library and Its Story','2 of 13 lessons',15],
  ['Module 2 · 9 units','The Hebrew Scriptures & the Near Eastern World','Not started'],
  ['Module 3 · 20 units','Second Temple Judaism & the Christ Event','Not started'],
  ['Module 4 · 11 units','Systematic Synthesis, Hard Ethics & Living Practice','Not started']
];
const unitCard = (n, title, status, tone, open) => `<section class="cs-card cs-unit${open ? ' is-open' : ''}">
  <button type="button" class="cs-unit__head" aria-expanded="${!!open}"><span class="cs-unit__num">Unit ${n}</span><span class="cs-unit__title">${title}</span><span class="cs-unit__status${tone ? ` cs-unit__status--${tone}` : ''}">${status}</span><span class="cs-unit__chev">${open ? i.up : i.down}</span></button>
  ${open ? `<ol class="cs-unit__lessons" aria-label="Unit ${n} lessons">${lessons.map((l, k) => `<li${k === 0 ? ' class="is-current"' : ''}><span class="cs-marker${k === 0 ? ' cs-marker--current' : ''}">${k + 1}</span><span class="cs-unit__lesson">${l}</span>${k === 0 ? '<a class="cs-button cs-button--small" href="?screen=lesson">Start</a>' : ''}</li>`).join('')}<li><span class="cs-marker cs-marker--locked">${i.check}</span><span class="cs-unit__lesson">Unit 2 Checkpoint</span><span class="cs-caption">Unlocks after the lessons</span></li></ol>` : ''}
</section>`;
const pathRail = `<nav class="cs-card cs-rail" aria-label="Learning Path modules"><span class="cs-rail__label">Learning Path · 4 modules</span>${modules.map(([k, t, s, p], n) => `<a class="cs-module${n === 0 ? ' is-current' : ''}" href="#"${n === 0 ? ' aria-current="true"' : ''}><span class="cs-module__kicker">${k}</span><span class="cs-module__title">${t}</span><span class="cs-caption">${s}</span>${p ? bar(p, 'Module 1 progress') : ''}</a>`).join('')}<span class="cs-rail__section">Across the path</span><a class="cs-rail__item" href="#">${i.shield}<span class="cs-grow">Capstones</span><span class="cs-count">6</span></a></nav>`;
const pathMain = `<section class="cs-column" aria-label="Module 1"><div class="cs-heading"><span class="cs-kicker">Module 1 of 4</span><h1>Reading the Bible Well: The Library and Its Story</h1><span class="cs-sub">4 units · 13 lessons</span></div>
  ${unitCard(1, 'Christianity in One View', 'Complete', 'done')}${unitCard(2, 'What the Bible Is', 'In progress · 0 of 5', 'active', true)}${unitCard(3, 'The Biblical Story in One View', '6 lessons')}${unitCard(4, 'Putting the Map Together', 'Review and connect')}</section>`;
const progressRow = (label, value, pct) => `<div class="cs-progress-row"><div class="cs-split"><span>${label}</span><span class="cs-muted">${value}</span></div>${bar(pct, `${label} progress`)}</div>`;
const pathAside = `<aside class="cs-stack" aria-label="Your progress">
  <section class="cs-card cs-panel cs-upnext"><span class="cs-caption cs-caption--label">Up next</span><span class="cs-kicker cs-kicker--small">Module 1 · Unit 2 · Lesson 1</span><span class="cs-upnext__title">Meet the library: nine kinds of books</span><a class="cs-button cs-button--block" href="?screen=lesson">Start lesson</a></section>
  <section class="cs-card cs-panel cs-progress"><span class="cs-caption cs-caption--label">Progress</span>${progressRow('Unit 2', '0 of 5 lessons', 0)}${progressRow('Module 1', '2 of 13 lessons', 15)}${progressRow('Learning Path', 'Module 1 of 4', 4)}</section>
</aside>`;
const path = {
  frame: 'well', cols: 'path',
  desktop: () => `${pathRail}${pathMain}${pathAside}`,
  phone: () => `<div class="cs-scroll"><a class="cs-card cs-module-switch" href="#" aria-label="Change module"><span class="cs-module__kicker">Module 1 · 4 units</span><span class="cs-module__title">Reading the Bible Well: The Library and Its Story</span><span class="cs-split"><span class="cs-caption">2 of 13 lessons</span><span class="cs-link">Change ${i.down}</span></span>${bar(15, 'Module 1 progress')}</a>${pathMain}${pathAside}</div>`
};

/* ---------------- Lesson ---------------- */
const steps = ['A library, not a book','The Old Testament shelves','The New Testament shelves','Labels, not boxes','What you now know','Reflect'];
const lessonNav = `<nav class="cs-card cs-rail cs-rail--lesson" aria-label="Lesson navigation"><span class="cs-rail__label">Steps · 1 of 6</span><ol class="cs-steps">${steps.map((s, k) => `<li><a href="#"${k === 0 ? ' aria-current="step"' : ''}><span class="cs-marker${k === 0 ? ' cs-marker--current' : ''}">${k + 1}</span>${s}</a></li>`).join('')}</ol>
  <span class="cs-rail__section">For this step</span>
  <a class="cs-rail__item is-current" href="#" aria-current="true">${i.glossary}<span class="cs-grow">Glossary</span><span class="cs-count">2</span></a>
  <a class="cs-rail__item" href="#">${i.question}<span class="cs-grow">Questions</span><span class="cs-count">3</span></a>
  <a class="cs-rail__item" href="#">${i.deeper}<span class="cs-grow">Go deeper</span></a></nav>`;
const lessonProse = `<p>The Bible is not one book written in one style. It is a library of 66 books, written over many centuries by many authors, and gathered in two collections: the Old Testament, Israel’s scriptures, and the New Testament, the writings of the first Christians.</p><p>Jesus himself describes Israel’s scriptures in groups: “the Law of Moses, the Prophets, and the Psalms.” Knowing which shelf a book sits on is the first step to reading it well.</p>`;
const lessonCard = `<div class="cs-card cs-lesson-card"><div class="cs-lesson">
  <div class="cs-lesson__head"><span class="cs-sub">Meet the library: nine kinds of books</span><h1>A library, not a book</h1></div>
  <div class="cs-lesson__prose">${lessonProse}</div>
  <figure class="cs-quote" data-group="gospels"><blockquote>Then He told them, “These are the words I spoke to you while I was still with you: Everything must be fulfilled that is written about Me in the Law of Moses, the Prophets, and the Psalms.” Then He opened their minds to understand the Scriptures.</blockquote><figcaption><span class="cs-quote__ref">${tag('gospels')}Luke 24:44–45 · BSB</span><a href="?screen=reader">Read in context</a></figcaption></figure>
  <div class="cs-lesson__nav"><button type="button" class="cs-button cs-button--ghost" disabled>Back</button><button type="button" class="cs-button cs-button--continue">Continue</button></div>
</div></div>`;
const lessonAside = `<aside class="cs-stack" aria-label="Notes and study content">
  <button type="button" class="cs-card cs-notes-toggle" aria-expanded="false">${i.pen}<span class="cs-grow">My Notes</span><span class="cs-notes-toggle__add">Add a note</span>${i.down}</button>
  <section class="cs-card cs-panel cs-fill" aria-label="Glossary for this step"><div><span class="cs-caption cs-caption--label">Glossary</span><h2 class="cs-panel__title">Terms in this step</h2></div>
    <dl class="cs-terms"><div><dt>Old Testament</dt><dd>The 39 books of Israel’s scriptures, written mostly in Hebrew, which Christians share with the Jewish tradition.</dd></div><div><dt>New Testament</dt><dd>The 27 books written by the first Christians about Jesus and the early church, written in Greek.</dd></div></dl>
    <a class="cs-panel__foot" href="?screen=topics">All 4 terms in this lesson</a></section>
</aside>`;
const lessonTitlebar = full => `<div class="cs-titlebar"><nav class="cs-crumbs" aria-label="Breadcrumb">${full ? '<a href="?screen=path">Learning Path</a><span aria-hidden="true">›</span><a href="?screen=path">Module 1: Reading the Bible Well</a><span aria-hidden="true">›</span><a href="?screen=path">Unit 2: What the Bible Is</a><span aria-hidden="true">›</span><span aria-current="page">Lesson 1</span>' : `<button type="button" class="cs-crumbs__toggle" aria-expanded="false" aria-label="Show full path: Learning Path, Module 1: Reading the Bible Well, Unit 2: What the Bible Is, Lesson 1"><span>Unit 2 · <strong>Lesson 1</strong></span>${i.down}</button>`}</nav><a class="cs-icon-button cs-icon-button--small" href="?screen=path" aria-label="Leave lesson">${i.close}</a></div>`;
const lesson = {
  frame: 'window', current: 'path',
  desktop: () => `${lessonTitlebar(true)}<div class="cs-window-well cs-window-well--lesson"><section class="cs-lesson-row" aria-label="Lesson">${lessonNav}${lessonCard}</section>${lessonAside}</div>`,
  phone: () => `${lessonTitlebar(false)}<button type="button" class="cs-stepbar" aria-expanded="false" aria-label="Step 1 of 6, part 1 of 2: A library, not a book. Show all steps"><span class="cs-split"><span>Step 1 of 6 · part 1 of 2</span><span class="cs-stepbar__all">All steps</span></span><span class="cs-stepbar__segments">${steps.map((_, k) => `<span${k === 0 ? ' class="is-current"' : ''}></span>`).join('')}</span></button>
  <article class="cs-phone-article"><div class="cs-lesson__head"><span class="cs-sub">Meet the library: nine kinds of books</span><h1>A library, not a book</h1></div>
  <nav class="cs-toolgrid cs-toolgrid--3" aria-label="Study tools for this step"><a href="#">${i.glossary}Glossary · 2</a><a href="#">${i.question}Questions · 3</a><a href="#">${i.deeper}Go deeper</a></nav>
  <p class="cs-phone-prose">The Bible is not one book written in one style. It is a library of 66 books, written over many centuries by many authors, and gathered in two collections: the Old Testament<button type="button" class="cs-footnote" aria-label="Footnote a: glossary, Old Testament">a</button>, Israel’s scriptures, and the New Testament<button type="button" class="cs-footnote" aria-label="Footnote b: glossary, New Testament">b</button>, the writings of the first Christians.</p>
  <p class="cs-phone-prose">Jesus himself describes Israel’s scriptures in groups: “the Law of Moses, the Prophets, and the Psalms.” Knowing which shelf a book sits on is the first step to reading it well.</p></article>
  <div class="cs-phone-actions"><button type="button" class="cs-button cs-button--outline" disabled>Back</button><button type="button" class="cs-button cs-button--continue">Continue</button></div>`
};

/* ---------------- Bible reader ---------------- */
const readerTools = [['context','Context'],['links','Cross-references','3',true],['highlight','Highlights','1'],['people','People'],['places','Places'],['maps','Maps']];
const readerRail = `<nav class="cs-card cs-rail cs-rail--reader" aria-label="Study tools"><span class="cs-rail__label">For Genesis 1:2</span>${readerTools.map(([ic, l, c, cur]) => `<a class="cs-rail__item${cur ? ' is-current' : ''}" href="#"${cur ? ' aria-current="true"' : ''}>${i[ic]}<span class="cs-grow">${l}</span>${c ? `<span class="cs-count">${c}</span>` : ''}</a>`).join('')}<span class="cs-rail__section">For the book</span>${[['overview','Book overview'],['timeline','Timeline'],['themes','Themes']].map(([ic, l]) => `<a class="cs-rail__item" href="#">${i[ic]}<span class="cs-grow">${l}</span></a>`).join('')}</nav>`;
const verses = {
  one: '<span class="cs-verse cs-verse--noted"><sup>1</sup>In the beginning God created the heavens and the earth.</span>',
  two: '<span class="cs-verse cs-verse--selected"><sup>2</sup>Now the earth was <mark>formless and void</mark>, and darkness was over the surface of the deep. And the Spirit of God was hovering over the surface of the waters.</span>'
};
const selectionBar = `<span class="cs-selection" popover="manual" role="toolbar" aria-label="Actions for Genesis 1:2"><button type="button" class="cs-swatch-button" data-hl="yellow" aria-label="Highlight yellow"></button><button type="button" class="cs-swatch-button" data-hl="green" aria-label="Highlight green"></button><button type="button" class="cs-swatch-button" data-hl="blue" aria-label="Highlight blue"></button><button type="button" class="cs-swatch-button" data-hl="rose" aria-label="Highlight rose"></button><span class="cs-selection__rule"></span><button type="button" class="cs-selection__action">+ Note</button><button type="button" class="cs-selection__action">Copy</button></span>`;
const readerPassage = `<section class="cs-card cs-passage" aria-label="Passage">
  <div class="cs-passage__bar"><button type="button" class="cs-square-button" aria-label="Previous chapter" disabled>${i.left}</button><button type="button" class="cs-square-button" aria-label="Next chapter">${i.right}</button><span class="cs-grow"></span><button type="button" class="cs-text-button">BSB</button><button type="button" class="cs-text-button cs-text-button--aa" aria-label="Text size">Aa</button></div>
  <article class="cs-passage__body"><div class="cs-passage__inner">
    <div class="cs-chapter" data-group="law"><span class="cs-chapter__bar"></span><div><span class="cs-chapter__group">Law</span><h1><button type="button" class="cs-chapter-title" aria-label="Choose book and chapter, currently Genesis 1">Genesis 1${i.down}</button></h1><span class="cs-sub">Berean Standard Bible</span></div></div>
    <h2 class="cs-section-title">The Creation</h2>
    <p class="cs-scripture">${verses.one}<span class="cs-anchor">${selectionBar}</span>${verses.two}<span class="cs-note-mark" aria-label="Has a note">${i.note}</span> <span><sup>3</sup>And God said, “Let there be light,” and there was light. <sup>4</sup>And God saw that the light was good, and He separated the light from the darkness. <sup>5</sup>God called the light “day,” and the darkness He called “night.” And there was evening, and there was morning—the first day.</span></p>
    <h2 class="cs-section-title">The Second Day</h2>
    <p class="cs-scripture"><sup>6</sup>And God said, “Let there be an expanse between the waters, to separate the waters from the waters.” <sup>7</sup>So God made the expanse and separated the waters beneath it from the waters above. And it was so. <sup>8</sup>God called the expanse “sky.” And there was evening, and there was morning—the second day.</p>
  </div></article></section>`;
const refs = [['major','Jeremiah 4:23','I looked at the earth, and it was formless and void; I looked to the heavens, and they had no light.'],['major','Isaiah 45:18'],['wisdom','Psalm 104:30']];
const readerAside = `<aside class="cs-stack" aria-label="Notes and study content">
  <section class="cs-card cs-panel cs-notes" aria-label="My notes on Genesis 1:2"><div class="cs-split cs-split--center"><h2 class="cs-panel__title">My notes on 1:2</h2><button type="button" class="cs-icon-button cs-icon-button--small" aria-label="Collapse notes" aria-expanded="true">${i.up}</button></div>
    <p class="cs-saved-note">What does “the deep” mean here? Bring this up on Sunday.</p><label class="cs-visually-hidden" for="note-1-2">New note on Genesis 1:2</label><textarea id="note-1-2" class="cs-textarea" placeholder="Add a note to 1:2"></textarea><div class="cs-end"><button type="button" class="cs-button cs-button--compact">Save note</button></div></section>
  <section class="cs-card cs-panel cs-fill" aria-label="Cross-references for Genesis 1:2"><div><span class="cs-caption cs-caption--label">Cross-references</span><h2 class="cs-panel__title">Genesis 1:2</h2></div>
    <ul class="cs-refs">${refs.map(([g, r, t]) => `<li data-group="${g}"><span class="cs-refs__bar"></span><div class="cs-grow"><div class="cs-refs__head"><a href="#">${r}<span class="cs-visually-hidden">, ${GROUPS[g]}</span></a><button type="button" class="cs-icon-button cs-icon-button--tiny" aria-label="${t ? 'Hide' : 'Show'} ${r}" aria-expanded="${!!t}">${t ? i.up : i.down}</button></div>${t ? `<p>${t}</p>` : ''}</div></li>`).join('')}</ul></section>
</aside>`;
const reader = {
  frame: 'well', cols: 'reader', current: 'reader', surface: 'scripture',
  desktop: () => `${readerRail}${readerPassage}${readerAside}`,
  phone: () => `<article class="cs-phone-article cs-phone-article--reader">
    <div class="cs-phone-chapter" data-group="law"><span class="cs-chapter__bar"></span><div class="cs-grow"><span class="cs-chapter__group">Law · Berean Standard Bible</span><button type="button" class="cs-chapter-picker" aria-label="Choose book and chapter, currently Genesis 1">Genesis 1${i.down}</button></div><button type="button" class="cs-square-button cs-square-button--large" aria-label="Reading options: text size, translation">${i.more}</button></div>
    <nav class="cs-toolgrid cs-toolgrid--6" aria-label="Study tools for Genesis">${[['overview','Overview'],['timeline','Timeline'],['themes','Themes'],['people','People'],['places','Places'],['maps','Maps']].map(([ic, l]) => `<a href="#">${i[ic]}${l}</a>`).join('')}</nav>
    <p class="cs-scripture cs-scripture--phone"><span class="cs-anchor">${selectionBar.replace('<button type="button" class="cs-selection__action">Copy</button>', '')}</span><span class="cs-verse cs-verse--noted"><sup>1</sup>In the beginning God created the heavens and the earth.</span><button type="button" class="cs-footnote" aria-label="Footnote a: context for Genesis 1">a</button><span class="cs-verse cs-verse--selected"><sup>2</sup>Now the earth was <mark>formless and void</mark>, and darkness was over the surface of the deep. And the Spirit of God was hovering over the surface of the waters.</span><button type="button" class="cs-footnote" aria-label="Footnote b: 3 cross-references for Genesis 1:2">b</button> <sup>3</sup>And God said, “Let there be light,” and there was light. <sup>4</sup>And God saw that the light was good, and He separated the light from the darkness.</p></article>`
};

/* ---------------- Study Topics ---------------- */
const topics = [
  ['God, Trinity, and Jesus','How can Christians speak of one God, Father, Son, and Spirit, while also confessing Jesus as divine and human?'],
  ['Scripture, transmission, and trust','Can an ancient collection copied, translated, and interpreted across centuries be read responsibly and trusted?'],
  ['Sin, salvation, and the cross','What is sin, what does salvation mean, and why did Jesus die?'],
  ['Suffering, evil, and providence','Why does suffering exist, what does God do about it, and how should providence and human freedom be understood?'],
  ['Violence, conquest, and slavery','How should readers understand biblical texts involving conquest, violence, slavery, domination, or morally difficult social systems?'],
  ['Women, ministry, and authority','How should texts about women, leadership, household roles, teaching, and ministry be interpreted across their historical settings?'],
  ['Miracles, history, and evidence','How should claims about miracles and historical events be evaluated without either assuming or dismissing them in advance?'],
  ['Christian disagreement and traditions','Why do sincere Christians reach different conclusions from shared texts, and how can traditions be compared fairly?']
];
const studied = [['Module 1 · Unit 2','What the Bible Is'],['Module 3 · Unit 8','How We Got the Bible'],['Module 3 · Unit 9','Text, Manuscripts and Transmission'],['Module 3 · Unit 10','Translation'],['Module 4 · Unit 10','Building an Interpretation']];
const topicGroups = [['Questions', '12', true], ['Theology & doctrine'], ['Christian life'], ['Biblical concepts'], ['Difficult questions']];
const topicsRail = `<nav class="cs-card cs-rail" aria-label="Topic groups"><span class="cs-rail__label">Browse</span>${topicGroups.map(([l, c, cur]) => `<a class="cs-rail__item${cur ? ' is-current' : ''}" href="#"${cur ? ' aria-current="true"' : ''}><span class="cs-grow">${l}</span>${c ? `<span class="cs-count">${c}</span>` : ''}</a>`).join('')}<span class="cs-rail__section">Look up a word</span><a class="cs-rail__item" href="#">${i.glossary}<span class="cs-grow">Glossary</span></a></nav>`;
const topicsSearch = `<label class="cs-search">${i.search}<span class="cs-visually-hidden">Search topics and the glossary</span><input id="topic-search" type="search" placeholder="Search topics and the glossary"></label>`;
const topicsGrid = `<div class="cs-topic-grid">${topics.map(([t, d], k) => `<a class="cs-topic" href="#" data-topic="${k}"${k === 1 ? ' aria-current="true"' : ''}><span class="cs-topic__title">${t}</span><span class="cs-topic__text">${d}</span></a>`).join('')}</div><span class="cs-result-count" aria-live="polite">Showing 8 of 12 questions</span>`;
const topicDetail = `<section class="cs-card cs-panel cs-topic-detail"><span class="cs-caption cs-caption--label">Question</span><h2 data-topic-title>${topics[1][0]}</h2><p data-topic-text>${topics[1][1]}</p><a class="cs-button cs-button--block" href="#">Open topic</a></section>`;
const topicStudied = `<section class="cs-card cs-panel cs-studied"><span class="cs-caption cs-caption--label">Studied in the Learning Path</span>${studied.map(([k, t]) => `<a href="?screen=path"><span class="cs-kicker cs-kicker--small">${k}</span><span>${t}</span></a>`).join('')}</section>`;
const topicsHeading = `<div class="cs-heading"><span class="cs-kicker">Study Topics</span><h1>Questions</h1><span class="cs-sub">Start with a question, then inspect Scripture, context, and interpretation.</span></div>`;
const topicsPage = {
  frame: 'well', cols: 'topics', current: 'topics',
  desktop: () => `${topicsRail}<section class="cs-column" aria-label="Questions">${topicsHeading}${topicsSearch}${topicsGrid}</section><aside class="cs-stack" aria-label="Selected topic">${topicDetail}${topicStudied}</aside>`,
  phone: () => `<div class="cs-scroll">${topicsHeading}${topicsSearch}<nav class="cs-chiprow" aria-label="Topic groups">${topicGroups.map(([l, c, cur]) => `<a href="#"${cur ? ' aria-current="true"' : ''}>${l}${c ? ` <span>${c}</span>` : ''}</a>`).join('')}<a href="#">${i.glossary}Glossary</a></nav>${topicDetail}${topicsGrid}${topicStudied}</div>`
};

/* ---------------- Review & Practice ---------------- */
const practiceRail = `<nav class="cs-card cs-rail" aria-label="Review and practice"><span class="cs-rail__label">Review</span><a class="cs-rail__item is-current" href="#" aria-current="true">${i.refresh}<span class="cs-grow">Due for review</span><span class="cs-count">3</span></a><span class="cs-rail__section">Practice</span><a class="cs-rail__item" href="#">${i.bible}<span class="cs-grow">Verse library</span></a><a class="cs-rail__item" href="#">${i.games}<span class="cs-grow">Games</span><span class="cs-count">3</span></a><a class="cs-rail__item" href="#">${i.award}<span class="cs-grow">Achievements</span></a></nav>`;
const art = {
  sequence: '<div class="cs-art cs-art--paper"><div class="cs-art-books"><span></span><span></span><span class="is-out"></span><span></span><span></span></div></div>',
  memory: '<div class="cs-art cs-art--blue"><div class="cs-art-tiles">' + [0,1,0,0,0,0,1,0].map(r => `<span${r ? ' class="is-rose"' : ''}></span>`).join('') + '</div></div>',
  rule: '<div class="cs-art cs-art--green"><div class="cs-art-rule">' + ['w','w','m','w','m sel','m'].map(c => `<span class="${c.split(' ').map(x => ({ w: 'is-wisdom', m: 'is-major', sel: 'is-picked' })[x]).join(' ')}"></span>`).join('') + '</div></div>'
};
const game = (a, t, d, f) => `<a class="cs-card cs-game" href="#">${art[a]}<span class="cs-game__title">${t}</span><span class="cs-game__text">${d}</span><span class="cs-caption">${f}</span></a>`;
const coming = [['grid','Crossword','Clues that make you think, built from the Glossary.'],['search','Word search','A light warm-up with names, places, and terms.'],['swipe','Swipe sort','Text or interpretation? Swipe to decide. Untimed or beat the clock.'],['hint','Hint reveal','Guess the name from its letter count as new hints appear.']];
const practiceMain = `<section class="cs-column" aria-label="Review and practice"><div class="cs-heading"><h1>Review &amp; Practice</h1><span class="cs-sub">Review keeps what you’ve learned. Practice is optional and doesn’t count toward lessons.</span></div>
  <section class="cs-card cs-due" aria-label="Due for review"><div class="cs-grow cs-due__copy"><span class="cs-due__kicker">Due for review</span><span class="cs-due__title">3 items from Unit 1</span><span class="cs-due__text">About 4 minutes. Spaced so each idea comes back just before you’d forget it.</span></div><a class="cs-button" href="#">Start review</a></section>
  <div class="cs-section-head"><h2>Practice games</h2><span class="cs-caption">More games are on the way</span></div>
  <div class="cs-games">${game('sequence','Sequence Repair','One book is out of order. Find it and put the shelf right.','Book order · 5 rounds')}${game('memory','Memory','Match each book to its shelf group by memory.','Shelf groups · 16 cards')}${game('rule','Rule Discovery','Work out the rule that sorts these books, then test it.','Reasoning · 4 puzzles')}</div>
  <div class="cs-section-head cs-section-head--minor"><h2>Coming later</h2><span class="cs-caption">Working names</span></div>
  <div class="cs-coming">${coming.map(([ic, t, d]) => `<div class="cs-coming__item"><span class="cs-coming__icon">${i[ic]}</span><div><span class="cs-coming__title">${t}</span><span class="cs-coming__text">${d}</span></div></div>`).join('')}</div></section>`;
const practiceAside = `<aside class="cs-stack" aria-label="Your progress">
  <section class="cs-card cs-panel cs-stats"><span class="cs-caption cs-caption--label">Review</span><div class="cs-split"><span>Items you’re keeping</span><span class="cs-muted">12</span></div><div class="cs-split"><span>Due now</span><span class="cs-due-count">3</span></div><div class="cs-split"><span>Next review after this</span><span class="cs-muted">Tomorrow</span></div></section>
  <section class="cs-card cs-panel cs-stats"><span class="cs-caption cs-caption--label">Practice</span><div class="cs-split"><span>Games played</span><span class="cs-muted">5</span></div><div class="cs-progress-row"><div class="cs-split"><span>Achievements</span><span class="cs-muted">4 of 20</span></div>${bar(20, 'Achievements', 'gold')}</div><span class="cs-caption cs-caption--fine">Practice is just for you. There are no streaks or leaderboards.</span></section>
</aside>`;
const practice = {
  frame: 'well', cols: 'practice', current: 'practice',
  desktop: () => `${practiceRail}${practiceMain}${practiceAside}`,
  phone: () => `<div class="cs-scroll"><nav class="cs-chiprow" aria-label="Review and practice"><a href="#" aria-current="true">Due for review <span>3</span></a><a href="#">Verse library</a><a href="#">Games <span>3</span></a><a href="#">Achievements</a></nav>${practiceMain}${practiceAside}</div>`
};

export const screens = { shelf, path, lesson, reader, topics: topicsPage, practice };
export const topicList = topics;
