import {readFile} from 'node:fs/promises';

const read=path=>readFile(path,'utf8');
const [index,app,home,bible,libraryData,otBooks,ntBooks,experience,practiceExperience,practiceEngine,practiceData,practiceState,course,sw]=await Promise.all([
  read('public/index.html'),read('public/app.js'),read('public/progress-experience.js'),read('public/bible.js'),read('public/library-data.js'),read('public/library-books-ot.js'),read('public/library-books-nt.js'),read('public/experience.js'),read('public/practice-experience.js'),read('public/practice-engine.js'),read('public/practice-data.js'),read('public/practice-state.js'),read('public/course-experience.js'),read('public/sw.js')
]);

const requireText=(source,text,message)=>{if(!source.includes(text))throw new Error(message||`missing required parity marker: ${text}`)};
const forbid=(source,text,message)=>{if(source.includes(text))throw new Error(message||`forbidden legacy implementation marker: ${text}`)};

for(const route of ['home','course','bible','topics','practice'])requireText(index,`data-route="${route}"`,`primary destination missing: ${route}`);
for(const asset of ['/experience.css','/course-experience.css','/library.css','/practice.css'])requireText(index,asset,`restored experience stylesheet not loaded: ${asset}`);
for(const utility of ['translation-select','progress-open','account-open','guide-open','feedback-open','personal-study-open'])requireText(index,utility,`shared utility missing: ${utility}`);

for(const marker of ['Suggested next activity','Featured topic','Six-course path','Recent activity','Open Practice','Open Bible'])requireText(home,marker,`Home parity surface missing: ${marker}`);
for(const marker of ['courseLandingView','courseDetailView','unitExperienceView','review','mastery'])requireText(course,marker,`Course parity contract missing: ${marker}`);
for(const marker of ['Bookshelf','Books & groups','Bible reader','Canon & timeline','book-profile-page','library-search','shelf-spine','STORY_ARC'])requireText(bible+libraryData,marker,`Bible parity surface missing: ${marker}`);
const profileCount=(otBooks.match(/\{n:\d+,name:/g)||[]).length+(ntBooks.match(/\{n:\d+,name:/g)||[]).length;
if(profileCount!==66)throw new Error(`expected 66 restored Bible book profiles, found ${profileCount}`);
for(const marker of ['The Patriarchs','Exodus & Wilderness','Divided Kingdom','Return & Persia','Life of Christ','The Early Church'])requireText(libraryData,marker,`historical orientation missing: ${marker}`);
for(const marker of ['A world made good, and quickly broken','Return, then a long silence','Jesus','The movement, and an ending that is a beginning'])requireText(libraryData,marker,`legacy Bible story arc missing: ${marker}`);

for(const marker of ['Ask / search','Theology & doctrine','Christian life','Biblical concepts','Difficult questions','Glossary','Related exploration'])requireText(experience,marker,`Topics entry mode missing: ${marker}`);
for(const marker of ['Recommended review','Practice Campaign','Arcade','Games & mastery','Ranks & achievements','Context & interpretation','Themes','Verse library'])requireText(practiceExperience,marker,`Practice surface missing: ${marker}`);
for(const marker of ['The Order','The Groups','The Substance','The Verses','Full Gilt','Archivist'])requireText(practiceData,marker,`legacy Practice progression missing: ${marker}`);
const campaignLevels=(practiceData.match(/\{id:'[ogsv]\d+'/g)||[]).length;
if(campaignLevels!==40)throw new Error(`expected 40 restored Practice campaign levels, found ${campaignLevels}`);
for(const marker of ['sequenceQuestion','shelfQuestion','binsQuestion','pairsQuestion','finishPracticeRun','practiceCampaignView','practiceArcadeView'])requireText(practiceEngine,marker,`Practice engine missing: ${marker}`);
requireText(practiceState,"canonical-shelf-practice-v3",'Practice state must remain separately namespaced from Course learner state');

for(const asset of ['/experience.js','/progress-experience.js','/course-experience.js','/library-data.js','/library-books-ot.js','/library-books-nt.js','/practice-experience.js','/practice-engine.js','/practice-state.js','/practice-data.js','/experience.css','/course-experience.css','/library.css','/practice.css'])requireText(sw,asset,`offline shell missing restored asset: ${asset}`);
for(const module of ['./experience.js','./progress-experience.js','./course-experience.js','./practice-experience.js','./practice-engine.js'])requireText(app,module,`router is not wired to restored module: ${module}`);
forbid(app,'MutationObserver','v7 experience must not restore v5 DOM-repair architecture');
forbid(app,'v5-pages','v7 experience must not restore v5 bridge runtime');
forbid(app,'v5-shell','v7 experience must not restore v5 bridge runtime');
forbid(practiceState,'canonical-shelf-v6','Practice progression must not reuse Course IndexedDB state');

console.log('cross-tab v2-v4 non-course restoration parity contract passed');
