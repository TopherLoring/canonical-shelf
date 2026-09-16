import { mkdir, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const RAW='https://raw.githubusercontent.com/TopherLoring/the-canonical-shelf/main/public/';
const OUT='public/data';
await mkdir(OUT,{recursive:true});

async function text(name){
  const r=await fetch(RAW+name,{headers:{'user-agent':'canonical-shelf-v6-migrator'}});
  if(!r.ok) throw new Error(`${name}: ${r.status}`);
  return r.text();
}

function evalWindow(sources){
  const context={console};
  context.window=context;
  vm.createContext(context);
  for(const [name,code] of sources) vm.runInContext(code,context,{filename:name});
  return context;
}

const courseWin=evalWindow([['v4-course-map.js',await text('v4-course-map.js')]]);
if(!courseWin.CANON_V4_COURSE?.units?.length) throw new Error('legacy course map missing');

const topicsWin=evalWindow([
  ['topics-data.js',await text('topics-data.js')],
  ['topics-extended.js',await text('topics-extended.js')]
]);
if(!topicsWin.CANON_TOPICS?.articles?.length) throw new Error('legacy topics missing');

const foundationsWin=evalWindow([
  ['foundations-data.js',await text('foundations-data.js')],
  ['foundations-expansion-core.js',await text('foundations-expansion-core.js')],
  ['foundations-units-02-08.js',await text('foundations-units-02-08.js')],
  ['foundations-units-09-16.js',await text('foundations-units-09-16.js')]
]);
if(!foundationsWin.FOUNDATIONS_DATA?.lessons?.length) throw new Error('legacy guided lessons missing');

const masteryFiles=[
  'v4-mastery-manifest.js','v4-mastery-story.js','v4-mastery-order.js','v4-mastery-groups.js',
  'v4-mastery-chrono.js','v4-mastery-content.js','v4-mastery-content-profiles.js','v4-mastery-themes.js','v4-mastery-verses.js'
];
const masterySources=[];
for(const f of masteryFiles) masterySources.push([f,await text(f)]);
const masteryWin=evalWindow(masterySources);

const curriculumDoc=await text('docs/curriculum.md');
const corpus=await text('corpus.txt');

const v6Units=[
  ['unit.start','Start Here','Christianity, Jesus, responsible inquiry and learning'],
  ['unit.read','How to Read a Bible','References, context, translation, manuscripts, authorship, audience and canon'],
  ['unit.library','The Bible as a Library','Shelf, canon, genres, navigation and chronology versus canonical order'],
  ['unit.interpretation','How Interpretation Works','Text, context, interpretation, doctrine, application and evidence levels'],
  ['unit.story','The Story in One View','Whole biblical arc, eras, hinge events and recurring themes'],
  ['unit.beginnings','Beginnings','Creation, humanity, rupture, mortality and Genesis'],
  ['unit.abraham-exodus','Abraham to Exodus','Patriarchs, covenant, Egypt, Moses and liberation'],
  ['unit.torah','Torah and Wilderness','Law, holiness, covenant life, wilderness and Christian use of Old Testament law'],
  ['unit.land-ruth','Land, Judges, and Ruth','Conquest, violence, Judges, Ruth, covenant loyalty and interpretation'],
  ['unit.kings','Kings and Temple','Samuel, Saul, David, Solomon, monarchy, temple and power'],
  ['unit.kingdoms-prophets','Kingdoms and the Prophetic Library','Divided monarchy, prophets, justice, prophetic genres and organization'],
  ['unit.exile','Exile, Return, and the World Before Jesus','Babylon, Persia, restoration and Second Temple context'],
  ['unit.wisdom','Poetry and Wisdom','Psalms, Job, Proverbs, Ecclesiastes and Song of Songs'],
  ['unit.jesus','Jesus and the Gospels','Jewish context, four Gospels, kingdom, parables, welcome and discipleship'],
  ['unit.cross','Cross, Resurrection, and Salvation','Cross, resurrection, grace, repentance, reconciliation and atonement models'],
  ['unit.acts','Acts and the Early Church','Spirit, mission, Gentile inclusion, conflict, discernment and belonging'],
  ['unit.letters','Paul and the Other Letters','Paul, Hebrews, James, Peter, John, Jude, communities, ethics and interpretation'],
  ['unit.doctrine-develops','How Christian Doctrine Develops','Scripture, interpretation, councils, creeds and doctrinal reasoning'],
  ['unit.doctrine','God and Christian Doctrine','Trinity, incarnation, Spirit, providence, freedom and grace'],
  ['unit.practice','Christian Practice','Baptism, Communion, prayer, ethics, formation and neighbor-love'],
  ['unit.traditions','Christian Traditions','Catholic, Orthodox, Protestant and denominational differences'],
  ['unit.difficult','Difficult Questions and Contested Interpretations','Suffering, violence, LGBTQ interpretation, religions, miracles, evil and uncertainty'],
  ['unit.hope','Resurrection, Judgment, and New Creation','Apocalypse, Revelation, judgment, final destiny and renewed creation'],
  ['unit.themes','Themes Across Scripture','Cross-canon synthesis without flattening local context'],
  ['unit.mastery','Independent Mastery','Whole-book contextual interpretation and synthesis']
].map(([id,title,scope],i)=>({id,sequence:i+1,title,scope}));

const legacyMap=courseWin.CANON_V4_COURSE;
const legacyUnits=legacyMap.units.map(u=>({...u,legacyId:u.id}));
const masteryIds=Object.values(legacyMap.masteryPlacement).flat();
if(masteryIds.length!==69) throw new Error(`expected 69 mastery ids; found ${masteryIds.length}`);

const payload={
  version:6,
  generatedAt:new Date().toISOString(),
  sourceRepo:'TopherLoring/the-canonical-shelf@main',
  units:v6Units,
  legacyUnits,
  masteryIds,
  legacyMasteryPlacement:legacyMap.masteryPlacement,
  lessons:foundationsWin.FOUNDATIONS_DATA.lessons,
  topics:topicsWin.CANON_TOPICS.articles,
  legacyMastery:Object.fromEntries(Object.entries(masteryWin).filter(([k])=>k.startsWith('CANON_')))
};

await writeFile(`${OUT}/catalog.json`,JSON.stringify(payload,null,2));
await writeFile(`${OUT}/curriculum.md`,curriculumDoc);
await writeFile(`${OUT}/corpus.txt`,corpus);
console.log(`v6 migration snapshot: ${payload.units.length} units, ${payload.lessons.length} lessons, ${payload.masteryIds.length} mastery IDs, ${payload.topics.length} topics`);
