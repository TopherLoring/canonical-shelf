import {readFile} from 'node:fs/promises';

const read=path=>readFile(path,'utf8');
const [index,bootstrap,about,app,home,bible,bibleState,bibleStateCss,libraryData,otBooks,ntBooks,experience,topicsExperience,topicsCss,searchExperience,searchCss,practiceExperience,practiceEngine,practiceEngineRestored,practiceData,practiceState,course,learningVisuals,learningVisualsCss,sw,verseData,...verseParts]=await Promise.all([
  read('public/index.html'),read('public/bootstrap.js'),read('public/about.html'),read('public/app.js'),read('public/progress-experience.js'),read('public/bible.js'),read('public/bible-state.js'),read('public/bible-state.css'),read('public/library-data.js'),read('public/library-books-ot.js'),read('public/library-books-nt.js'),read('public/experience.js'),read('public/topics-experience.js'),read('public/topics-experience.css'),read('public/search-experience.js'),read('public/search-experience.css'),read('public/practice-experience.js'),read('public/practice-engine.js'),read('public/practice-engine-restored.js'),read('public/practice-data.js'),read('public/practice-state.js'),read('public/course-experience.js'),read('public/learning-visuals.js'),read('public/learning-visuals.css'),read('public/sw.js'),read('public/verse-data.js'),...Array.from({length:8},(_,i)=>read(`public/verse-data-${String(i+1).padStart(2,'0')}.js`))
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
for(const visualType of ['shelf','timeline','story-arc','relationship','compare','flow','theme-thread','map-lite','book-profile','verse-context','spectrum','stack'])requireText(learningVisuals,`'${visualType}'`,`Course semantic visual renderer missing: ${visualType}`);
for(const marker of ['semanticVisualType','renderSemanticVisual','enhanceLearningVisuals','Text equivalent','Schematic orientation · not to scale'])requireText(learningVisuals,marker,`Course visual accessibility/semantic contract missing: ${marker}`);
for(const marker of ['semantic-flow','semantic-timeline','semantic-story-arc','semantic-relationship','semantic-compare','semantic-shelf','semantic-thread','semantic-route','semantic-profile','semantic-verse-context','semantic-spectrum','semantic-stack','prefers-reduced-motion','forced-colors'])requireText(learningVisualsCss,marker,`Course visual CSS grammar missing: ${marker}`);
requireText(app,"from './learning-visuals.js'",'Course renderer must import semantic visuals explicitly');
requireText(app,"if(r==='course')enhanceLearningVisuals(main)",'Course semantic visuals must run in the normal Course render path');
forbid(learningVisuals,'MutationObserver','Course visual restoration must not use DOM-repair observers');

for(const marker of ['Bookshelf','Books & groups','Bible reader','Canon & timeline','book-profile-page','library-search','shelf-spine','STORY_ARC'])requireText(bible+libraryData,marker,`Bible parity surface missing: ${marker}`);
const profileCount=(otBooks.match(/\{n:\d+,name:/g)||[]).length+(ntBooks.match(/\{n:\d+,name:/g)||[]).length;
if(profileCount!==66)throw new Error(`expected 66 restored Bible book profiles, found ${profileCount}`);
for(const marker of ['The Patriarchs','Exodus & Wilderness','Divided Kingdom','Return & Persia','Life of Christ','The Early Church'])requireText(libraryData,marker,`historical orientation missing: ${marker}`);
for(const marker of ['A world made good, and quickly broken','Return, then the Second Temple bridge','Jesus','The movement, and an ending that is a beginning'])requireText(libraryData,marker,`Bible story arc missing: ${marker}`);
for(const marker of ['canonical-shelf-bible-state-v1','getPracticeState','learnedBooks','rememberBibleBook','enhanceBibleState','dataset.current','dataset.learned'])requireText(bibleState,marker,`Bible learner-state identity missing: ${marker}`);
for(const marker of ['data-learned="true"','data-current="true"','book-state-chip','prefers-reduced-motion','forced-colors'])requireText(bibleStateCss,marker,`Bible state visual/accessibility contract missing: ${marker}`);
requireText(app,"from './bible-state.js'",'Bible route must import learner-state identity explicitly');
requireText(app,"if(r==='bible')enhanceBibleState(main,p)",'Bible learner state must run in the normal Bible render path');
forbid(bibleState,'canonical-shelf-v6','Bible state must not duplicate Course learner state');

requireText(experience,"from './topics-experience.js'",'shared experience module must delegate Topics to the full-depth renderer');
requireText(experience,'export {topicsView}','shared experience module must re-export the full-depth Topics renderer');
requireText(experience,"href='/topics-experience.css'",'Topics reference styling must be loaded without inline CSS');
for(const marker of ['Ask / search','Theology & doctrine','Christian life','Biblical concepts','Difficult questions','Glossary','Related exploration','topicSearchText','courseConnections','Scripture connections','Course connections','Related search language','t.sections','t.refs','t.aliases'])requireText(topicsExperience,marker,`Topics depth contract missing: ${marker}`);
for(const marker of ['topic-reference-heading','topic-sections','topic-section','topic-reference-list','topic-course-links'])requireText(topicsCss,marker,`Topics visual reference grammar missing: ${marker}`);

for(const marker of ['searchCanonicalShelf','searchExperienceView','topic.sections','topic.aliases','topic.refs','lesson.body','lesson.vocab','lesson.drawers','LIBRARY_BOOKS','VERSES','Scripture','Topics','Course','Book profiles','Curated passages','Glossary','Ask the Guide with the evidence in view'])requireText(searchExperience,marker,`Unified Search corpus/access contract missing: ${marker}`);
for(const marker of ['search-domain-grid','search-domain','search-hit','search-guide-handoff','forced-colors'])requireText(searchCss,marker,`Unified Search visual grammar missing: ${marker}`);
requireText(app,"from './search-experience.js'",'router must import the unified study Search');
requireText(app,"searchExperienceView({query:p.get('q')||'',data,corpus,esc})",'Search route must use the full study index');

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

for(const asset of ['/about.html','/footer.css','/about-page.js','/experience.js','/topics-experience.js','/topics-experience.css','/search-experience.js','/search-experience.css','/progress-experience.js','/course-experience.js','/learning-visuals.js','/learning-visuals.css','/bible-state.js','/bible-state.css','/library-data.js','/library-books-ot.js','/library-books-nt.js','/practice-experience.js','/practice-engine.js','/practice-engine-restored.js','/practice-state.js','/practice-data.js','/verse-data.js','/verse-data-01.js','/verse-data-08.js','/experience.css','/course-experience.css','/library.css','/practice.css'])requireText(sw,asset,`offline shell missing restored asset: ${asset}`);
for(const module of ['./experience.js','./progress-experience.js','./course-experience.js','./practice-experience.js','./practice-engine.js','./learning-visuals.js','./bible-state.js','./search-experience.js'])requireText(app,module,`router is not wired to restored module: ${module}`);
forbid(app,'MutationObserver','v7 experience must not restore v5 DOM-repair architecture');
forbid(app,'v5-pages','v7 experience must not restore v5 bridge runtime');
forbid(app,'v5-shell','v7 experience must not restore v5 bridge runtime');
forbid(practiceState,'canonical-shelf-v6','Practice progression must not reuse Course IndexedDB state');

console.log(`cross-tab v2-v5 restoration contract passed: 66 book profiles with learned/current state, full Topics depth, unified study Search, ${restoredVerseCount} restored curated passages, native Practice engines, and 12 semantic Course visual families`);