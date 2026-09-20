import {readFile} from 'node:fs/promises';

const read=path=>readFile(path,'utf8');
const [index,bootstrap,about,app,home,bible,libraryData,otBooks,ntBooks,experience,topicsExperience,topicsCss,practiceExperience,practiceEngine,practiceEngineRestored,practiceData,practiceState,course,sw,verseData,...verseParts]=await Promise.all([
  read('public/index.html'),read('public/bootstrap.js'),read('public/about.html'),read('public/app.js'),read('public/progress-experience.js'),read('public/bible.js'),read('public/library-data.js'),read('public/library-books-ot.js'),read('public/library-books-nt.js'),read('public/experience.js'),read('public/topics-experience.js'),read('public/topics-experience.css'),read('public/practice-experience.js'),read('public/practice-engine.js'),read('public/practice-engine-restored.js'),read('public/practice-data.js'),read('public/practice-state.js'),read('public/course-experience.js'),read('public/sw.js'),read('public/verse-data.js'),...Array.from({length:8},(_,i)=>read(`public/verse-data-${String(i+1).padStart(2,'0')}.js`))
]);

const requireText=(source,text,message)=>{if(!source.includes(text))throw new Error(message||`missing required parity marker: ${text}`)};
const forbid=(source,text,message)=>{if(source.includes(text))throw new Error(message||`forbidden legacy implementation marker: ${text}`)};

for(const route of ['home','course','bible','topics','practice'])requireText(index,`data-route="${route}"`,`primary destination missing: ${route}`);
for(const asset of ['/experience.css','/course-experience.css','/library.css','/practice.css','/footer.css'])requireText(index,asset,`restored experience stylesheet not loaded: ${asset}`);
for(const utility of ['translation-select','progress-open','account-open','guide-open','feedback-open','personal-study-open'])requireText(index,utility,`shared utility missing: ${utility}`);
for(const footer of ['site-footer','Statement of Faith','About Canonical Shelf','How this guide approaches Scripture','Sources &amp; methodology','Translation information','Accessibility','Privacy'])requireText(index,footer,`footer/about missing: ${footer}`);
for(const disclosure of ['Statement of Faith','How this guide approaches Scripture','Sources &amp; methodology','Translation information','Accessibility','Privacy'])requireText(about,disclosure,`About surface missing disclosure: ${disclosure}`);

const appImport=bootstrap.indexOf("await import('./app.js')");
const swRegister=bootstrap.indexOf("navigator.serviceWorker.register('/sw.js'");
if(appImport<0||swRegister<0||appImport>swRegister)throw new Error('core app controls must initialize before service-worker registration/readiness');
forbid(bootstrap,"await navigator.serviceWorker.ready;\n\nwindow.addEventListener",'service-worker readiness must not block core application initialization');

for(const marker of ['Suggested next activity','Featured topic','Six-course path','Recent activity','Open Practice','Open Bible','Practice rank','campaign stars'])requireText(home,marker,`Home parity surface missing: ${marker}`);
for(const marker of ['courseLandingView','courseDetailView','unitExperienceView','review','mastery'])requireText(course,marker,`Course parity contract missing: ${marker}`);
for(const marker of ['Bookshelf','Books & groups','Bible reader','Canon & timeline','book-profile-page','library-search','shelf-spine','STORY_ARC'])requireText(bible+libraryData,marker,`Bible parity surface missing: ${marker}`);
const profileCount=(otBooks.match(/\{n:\d+,name:/g)||[]).length+(ntBooks.match(/\{n:\d+,name:/g)||[]).length;
if(profileCount!==66)throw new Error(`expected 66 restored Bible book profiles, found ${profileCount}`);
for(const marker of ['The Patriarchs','Exodus & Wilderness','Divided Kingdom','Return & Persia','Life of Christ','The Early Church'])requireText(libraryData,marker,`historical orientation missing: ${marker}`);
for(const marker of ['A world made good, and quickly broken','Return, then the Second Temple bridge','Jesus','The movement, and an ending that is a beginning'])requireText(libraryData,marker,`Bible story arc missing: ${marker}`);

requireText(experience,"from './topics-experience.js'",'shared experience module must delegate Topics to the full-depth renderer');
requireText(experience,'export {topicsView}','shared experience module must re-export the full-depth Topics renderer');
requireText(experience,"href='/topics-experience.css'",'Topics reference styling must be loaded without inline CSS');
for(const marker of ['Ask / search','Theology & doctrine','Christian life','Biblical concepts','Difficult questions','Glossary','Related exploration','topicSearchText','courseConnections','Scripture connections','Course connections','Related search language','t.sections','t.refs','t.aliases'])requireText(topicsExperience,marker,`Topics depth contract missing: ${marker}`);
for(const marker of ['topic-reference-heading','topic-sections','topic-section','topic-reference-list','topic-course-links'])requireText(topicsCss,marker,`Topics visual reference grammar missing: ${marker}`);

for(const marker of ['Recommended review','Practice Campaign','Arcade','Games & mastery','Ranks & achievements','Context & interpretation','Themes','Verse library','Restored v2/v3 passage library','Start Verse Drill'])requireText(practiceExperience,marker,`Practice surface missing: ${marker}`);
for(const marker of ['The Order','The Groups','The Substance','The Verses','Full Gilt','Archivist','VERSE_COUNT'])requireText(practiceData,marker,`legacy Practice progression missing: ${marker}`);
const campaignLevels=(practiceData.match(/\{id:'[ogsv]\d+'/g)||[]).length;
if(campaignLevels!==40)throw new Error(`expected 40 restored Practice campaign levels, found ${campaignLevels}`);
requireText(practiceEngine,"export * from './practice-engine-restored.js'",'Practice compatibility module must route through restored engine');
for(const marker of ['sequenceQuestion','shelfQuestion','binsQuestion','pairsQuestion','questionVerseBook','questionVerseTheme','questionVerseFill','questionVerseJumble','questionVerseDrill','finishPracticeRun','practiceCampaignView','practiceArcadeView','Unsupported Practice engine'])requireText(practiceEngineRestored,marker,`restored Practice engine missing: ${marker}`);
for(const engine of ['jumble','jumble-hard','guess-book','verse-book','verse-theme','verse-fill','verse-drill'])requireText(practiceEngineRestored,`engine==='${engine}'`,`advertised Practice engine is not implemented: ${engine}`);
requireText(practiceState,"canonical-shelf-practice-v3",'Practice state must remain separately namespaced from Course learner state');

for(const marker of ['VERSES=[','VERSE_COUNT=VERSES.length','Berean Standard Bible','King James Version','Your translation','parseCustomTranslation','filterVerses'])requireText(verseData,marker,`restored verse library contract missing: ${marker}`);
const restoredVerseCount=verseParts.reduce((sum,part)=>sum+(part.match(/\{ref:/g)||[]).length,0);
if(restoredVerseCount!==232)throw new Error(`expected 232 passages recovered from the actual v3 VERSES array, found ${restoredVerseCount}`);
for(const ref of ['Genesis 1:1','John 3:16','Galatians 5:22-23','Revelation 21:5'])requireText(verseParts.join('\n'),`ref:"${ref}"`,`restored verse corpus missing boundary/anchor passage: ${ref}`);

for(const asset of ['/about.html','/footer.css','/about-page.js','/experience.js','/topics-experience.js','/topics-experience.css','/progress-experience.js','/course-experience.js','/library-data.js','/library-books-ot.js','/library-books-nt.js','/practice-experience.js','/practice-engine.js','/practice-engine-restored.js','/practice-state.js','/practice-data.js','/verse-data.js','/verse-data-01.js','/verse-data-08.js','/experience.css','/course-experience.css','/library.css','/practice.css'])requireText(sw,asset,`offline shell missing restored asset: ${asset}`);
for(const module of ['./experience.js','./progress-experience.js','./course-experience.js','./practice-experience.js','./practice-engine.js'])requireText(app,module,`router is not wired to restored module: ${module}`);
forbid(app,'MutationObserver','v7 experience must not restore v5 DOM-repair architecture');
forbid(app,'v5-pages','v7 experience must not restore v5 bridge runtime');
forbid(app,'v5-shell','v7 experience must not restore v5 bridge runtime');
forbid(practiceState,'canonical-shelf-v6','Practice progression must not reuse Course IndexedDB state');

console.log(`cross-tab v2-v5 restoration contract passed: 66 book profiles, full Topics depth, ${restoredVerseCount} restored curated passages, and native Practice engines`);