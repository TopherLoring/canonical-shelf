import {readFile} from 'node:fs/promises';

const read=path=>readFile(path,'utf8');
const [index,app,home,bible,libraryData,practice,course,sw]=await Promise.all([
  read('public/index.html'),read('public/app.js'),read('public/progress-experience.js'),read('public/bible.js'),read('public/library-data.js'),read('public/experience.js'),read('public/course-experience.js'),read('public/sw.js')
]);

const requireText=(source,text,message)=>{if(!source.includes(text))throw new Error(message||`missing required parity marker: ${text}`)};
const forbid=(source,text,message)=>{if(source.includes(text))throw new Error(message||`forbidden legacy implementation marker: ${text}`)};

for(const route of ['home','course','bible','topics','practice'])requireText(index,`data-route="${route}"`,`primary destination missing: ${route}`);
for(const asset of ['/experience.css','/course-experience.css','/library.css'])requireText(index,asset,`restored experience stylesheet not loaded: ${asset}`);
for(const utility of ['translation-select','progress-open','account-open','guide-open','feedback-open','personal-study-open'])requireText(index,utility,`shared utility missing: ${utility}`);

for(const marker of ['Suggested next activity','Featured topic','Six-course path','Recent activity','Open Practice','Open Bible'])requireText(home,marker,`Home parity surface missing: ${marker}`);
for(const marker of ['courseLandingView','courseDetailView','unitExperienceView','review','mastery'])requireText(course,marker,`Course parity contract missing: ${marker}`);
for(const marker of ['Bookshelf','Books & groups','Bible reader','Canon & timeline','book-profile-page','library-search'])requireText(bible,marker,`Bible parity surface missing: ${marker}`);
if((libraryData.match(/n:\d+,name:/g)||[]).length===0)throw new Error('library metadata model is empty');
requireText(libraryData,'Return, then the Second Temple bridge','legacy Bible story arc must preserve the Second Temple bridge');

for(const marker of ['Ask / search','Theology & doctrine','Christian life','Biblical concepts','Difficult questions','Glossary','Related exploration'])requireText(practice,marker,`Topics entry mode missing: ${marker}`);
for(const marker of ['Recommended review','Book & order','Context & interpretation','Themes','Verses','Games & mastery'])requireText(practice,marker,`Practice mode missing: ${marker}`);

for(const asset of ['/experience.js','/progress-experience.js','/course-experience.js','/library-data.js','/library-books-ot.js','/library-books-nt.js','/experience.css','/course-experience.css','/library.css'])requireText(sw,asset,`offline shell missing restored asset: ${asset}`);

for(const module of ['./experience.js','./progress-experience.js','./course-experience.js'])requireText(app,module,`router is not wired to restored module: ${module}`);
forbid(app,'MutationObserver','v7 experience must not restore v5 DOM-repair architecture');
forbid(app,'v5-pages','v7 experience must not restore v5 bridge runtime');
forbid(app,'v5-shell','v7 experience must not restore v5 bridge runtime');

console.log('cross-tab experience parity contract passed');
