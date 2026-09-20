import {readFile,writeFile} from 'node:fs/promises';
import {courses,units,mapLegacyUnit,mapLesson,courseForUnit} from './curriculum-map.mjs';
import {newLessons} from '../content/curriculum/new-lessons.mjs';
import {newMastery,newMasteryPlacement,newMasteryIds,courseCapstoneIds} from '../content/curriculum/new-mastery.mjs';
import {RETENTION_DAYS} from '../content/curriculum/structure.mjs';

const path='public/data/catalog.json';
const cat=JSON.parse(await readFile(path,'utf8'));
const txt=l=>`${l.id||''} ${l.title||''} ${l.objective||''}`.toLowerCase(),has=(l,re)=>re.test(txt(l));

function legacySemanticUnit(l){
  const old=Number(l.unit)||0;
  if(old===1){if(has(l,/larger story|story map|biblical story/))return 4;if(has(l,/library|canon|reference|context detective/))return 2;if(has(l,/neighbor|mercy|love/))return 20;return 1}
  if(old===2){if(has(l,/shelf|seven bible skills|book order|group|genre/))return 3;return 2}
  if(old===3)return 5;
  if(old===4){if(has(l,/torah|law|sinai|neighbor responsibility|holiness/))return 7;return 6}
  if(old===5){if(has(l,/judge|conquest|land|violence/))return 8;if(has(l,/monarch|king|david|solomon|temple/))return 9;if(has(l,/exile|lament|return|rebuild/))return 11;return 10}
  if(old===6)return 12;
  if(old===7){if(has(l,/hear the prophets in their own setting|prophetic overview/))return 13;if(has(l,/justice|amos|micah|jeremiah|exilic hope/))return 10;return 13}
  if(old===8)return 14;
  if(old===9)return 15;
  if(old===10){if(has(l,/acts|early church|early christian|pentecost|communal discernment|jerusalem council/))return 16;if(has(l,/james|favoritism|general epistle|general letter/))return 18;if(has(l,/paul|letter|body|belong/))return 17;return 16}
  if(old===11)return 19;
  if(old===12)return 20;
  if(old===13)return 21;
  if(old===14)return 22;
  if(old===15)return 23;
  if(old===16){if(has(l,/theme|argument|comparison/))return 24;return 25}
  return 1;
}

function adaptChallenge(ch){
  if(!ch)return ch;
  if(ch.kind==='argument'&&Array.isArray(ch.items)&&Array.isArray(ch.answer)){
    return {...ch,kind:'argument-map',fields:ch.answer.map(([src])=>ch.items[src]),options:ch.answer.map(()=>ch.items),answer:ch.answer.map(([,target])=>target)};
  }
  return ch;
}

const legacyLessons=cat.lessons.map((lesson,order)=>{
  const legacy=legacySemanticUnit(lesson);
  const unitId=mapLesson({...lesson,v4Unit:legacy});
  return {...lesson,challenges:(lesson.challenges||[]).map(adaptChallenge),reviewChallenges:(lesson.reviewChallenges||[]).map(adaptChallenge),v4Unit:legacy,v6Unit:unitId,unitId,courseId:courseForUnit(unitId),legacyGuided:true,legacyOrder:order};
});
const beginningLesson=legacyLessons.find(lesson=>lesson.id==='begin');
if(beginningLesson?.deeper)beginningLesson.deeper=beginningLesson.deeper.replace(
  'Jennings studies patronage especially in 2 Corinthians 8–9;',
  'New Testament scholar Theodore W. Jennings examines patronage—resource relationships shaped by loyalty, honor, and reciprocal obligation—especially in 2 Corinthians 8–9;'
);
for(const m of Object.values(cat.legacyMastery?.CANON_V4_MASTERY||{}))if(m?.challenge)m.challenge=adaptChallenge(m.challenge);
const addedLessons=newLessons.map((lesson,order)=>({...lesson,challenges:(lesson.challenges||[]).map(adaptChallenge),reviewChallenges:(lesson.reviewChallenges||[]).map(adaptChallenge),v6Unit:lesson.unitId,courseId:courseForUnit(lesson.unitId),curriculumOrder:order}));

const lessonIds=new Set();
for(const lesson of [...legacyLessons,...addedLessons]){
  if(lessonIds.has(lesson.id))throw new Error(`duplicate guided lesson id: ${lesson.id}`);
  lessonIds.add(lesson.id);
  if(!units.some(unit=>unit.id===lesson.unitId))throw new Error(`${lesson.id}: unknown unit ${lesson.unitId}`);
  if(!(lesson.challenges||[]).length)throw new Error(`${lesson.id}: scored guided lesson has no active check`);
}

cat.curriculumVersion=2;
cat.courses=courses;
cat.units=units;
cat.lessons=[...legacyLessons,...addedLessons];
cat.legacyLessonIds=legacyLessons.map(lesson=>lesson.id);
cat.newLessonIds=addedLessons.map(lesson=>lesson.id);
cat.retentionDays=RETENTION_DAYS;
cat.mastery=newMastery;
cat.legacyMasteryIds=[...cat.masteryIds];
cat.masteryIds=[...cat.legacyMasteryIds,...newMasteryIds];
cat.courseCapstoneIds=courseCapstoneIds;

// Old unit-only bookmarks continue to land on the closest semantic destination.
cat.legacyUnitAliases={
  'unit.start':'c1.christianity','unit.read':'c1.reading','unit.library':'c1.bible','unit.interpretation':'c1.reading','unit.story':'c1.story',
  'unit.beginnings':'c1.story','unit.abraham-exodus':'c2.exodus','unit.torah':'c2.sinai','unit.land':'c2.land-kings','unit.kings-temple':'c2.temple-kingdom',
  'unit.prophets':'c2.prophets-exile','unit.exile':'c2.restoration-hope','unit.wisdom':'c5.genre','unit.prophetic-library':'c2.prophets-exile','unit.jesus':'c4.gospels',
  'unit.salvation':'c6.sin-salvation','unit.acts':'c4.pentecost','unit.paul':'c4.paul-gentiles','unit.general-letters':'c4.expansion','unit.doctrine':'c6.god-christ',
  'unit.practice':'c6.church-practice','unit.traditions':'c6.traditions','unit.difficult':'c6.difficult','unit.hope':'c6.final-hope','unit.themes':'c5.intertext','unit.independent':'c5.interpretation'
};

const legacyMasteryActivities=[];
for(const [legacyUnit,ids] of Object.entries(cat.legacyMasteryPlacement||{}))for(const id of ids){
  const unitId=mapLegacyUnit(legacyUnit);
  legacyMasteryActivities.push({id:`mastery:${id}`,type:'mastery',masteryType:'legacy',unitId,courseId:courseForUnit(unitId),title:cat.legacyMastery?.CANON_V4_MASTERY?.[id]?.title||id,sourceId:id});
}
const lessonActivities=cat.lessons.map(lesson=>({id:`lesson:${lesson.id}`,type:'lesson',unitId:lesson.unitId,courseId:lesson.courseId,title:lesson.title,sourceId:lesson.id,legacy:!!lesson.legacyGuided}));
const newMasteryActivities=Object.values(newMastery).map(item=>({id:`mastery:${item.id}`,type:'mastery',masteryType:item.type,unitId:item.unitId,courseId:item.courseId,title:item.title,sourceId:item.id}));
cat.activities=[...lessonActivities,...legacyMasteryActivities,...newMasteryActivities];

const preferredLessonOrder={
  'c1.christianity':['begin'],'c1.bible':['library','shelf-skills'],'c1.transmission':['c1-bible-languages','translation'],'c1.reading':['context'],'c1.theology':['c1-theology-map'],'c1.practice':['c1-practice-map'],'c1.traditions':['c1-traditions-map'],'c1.story':['story','garden-trust','sin-mortality','creation-care','abraham-blessing'],
  'c2.exodus':['exodus-call','c2-passover','c2-sea-wilderness'],'c2.sinai':['c2-sinai-covenant','c2-golden-calf','torah-neighbor'],'c2.tabernacle':['c2-tabernacle','c2-ark'],'c2.sacrifice':['c2-priesthood-sacrifice','c2-day-atonement','c2-sacred-calendar'],'c2.land-kings':['c2-davidic-covenant'],'c2.temple-kingdom':['c2-temple-presence'],'c2.prophets-exile':['c2-exile-temple-loss'],'c2.restoration-hope':['c2-restoration-temple','c2-new-covenant','c2-prophetic-hope'],
  'c3.after-exile':['c3-persian-judea','c3-torah-public-life'],'c3.greek-world':['c3-alexander-hellenization','c3-antiochus-maccabees'],'c3.hasmonean-rome':['c3-hasmoneans','c3-rome-judea','c3-herod'],'c3.jewish-life':['c3-temple-priesthood','c3-synagogue-diaspora','c3-pharisees-sadducees','c3-essenes-qumran','c3-revolutionary-currents'],'c3.expectation':['c3-apocalyptic-resurrection','c3-messianic-diversity'],'c3.enter-gospels':['c3-enter-gospels'],
  'c4.gospels':['gospel-comparison'],'c4.teaching':['c4-sermon-mount','prayer-practice'],'c4.israel-story':['c4-scripture-fulfillment'],'c4.passion':['c4-passion-passover','communion-table','c4-ascension'],'c4.pentecost':['c4-pentecost'],'c4.paul-gentiles':['acts-discernment'],'c4.expansion':['body-belonging','letters-favoritism'],
  'c5.translation':['c5-equivalence'],'c5.genre':['c5-hebrew-poetry'],'c5.intertext':['c5-typology-allusion'],'c5.gospel-letters':['c5-synoptic-problem','c5-authorship-composition'],
  'c6.god-christ':['trinity-language'],'c6.sin-salvation':['atonement-images','receiving-grace','grace-repair'],'c6.providence-life':['providence-freedom'],'c6.church-practice':['baptism-belonging'],'c6.traditions':['traditions-welcome','c6-covenant-frameworks'],'c6.difficult':['ethical-texts'],'c6.final-hope':['apocalypse-hope','c6-end-times-frameworks']
};
function lessonRank(activity){
  if(activity.type!=='lesson')return Number.MAX_SAFE_INTEGER;
  const preferred=preferredLessonOrder[activity.unitId]||[],index=preferred.indexOf(activity.sourceId);
  if(index>=0)return index;
  const lesson=cat.lessons.find(item=>item.id===activity.sourceId),fallbackBase=preferred.length+100;
  return fallbackBase+(lesson?.legacyGuided?(lesson.legacyOrder||0):(lesson?.curriculumOrder||0));
}

cat.byUnit={};
for(const unit of units){
  const lessonIdsForUnit=lessonActivities.filter(activity=>activity.unitId===unit.id).sort((a,b)=>lessonRank(a)-lessonRank(b)).map(activity=>activity.id);
  const legacyMasteryIdsForUnit=legacyMasteryActivities.filter(activity=>activity.unitId===unit.id).map(activity=>activity.id);
  const authoredMasteryIdsForUnit=(newMasteryPlacement[unit.id]||[]).map(id=>`mastery:${id}`);
  cat.byUnit[unit.id]=[...lessonIdsForUnit,...legacyMasteryIdsForUnit,...authoredMasteryIdsForUnit];
}
cat.byCourse=Object.fromEntries(courses.map(course=>[course.id,units.filter(unit=>unit.courseId===course.id).map(unit=>unit.id)]));

for(const activity of cat.activities)if(!cat.byUnit[activity.unitId]?.includes(activity.id))throw new Error(`activity ${activity.id} missing from unit placement`);

const glossaryMap=new Map();
for(const lesson of cat.lessons){
  const entries=Array.isArray(lesson.vocab)?lesson.vocab:Object.entries(lesson.vocab||{});
  for(const entry of entries){
    if(!Array.isArray(entry)||entry.length<2)continue;
    const [term,definition]=entry,key=String(term).trim().toLowerCase();
    if(!key)continue;
    const current=glossaryMap.get(key)||{id:`term.${key.replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`,term:String(term),quick:String(definition),definitions:[],occurrences:[]};
    if(!current.definitions.includes(String(definition)))current.definitions.push(String(definition));
    current.occurrences.push({courseId:lesson.courseId,unitId:lesson.unitId,lessonId:lesson.id});
    glossaryMap.set(key,current);
  }
}
cat.glossary=[...glossaryMap.values()].sort((a,b)=>a.term.localeCompare(b.term));

if(courses.length!==6)throw new Error(`expected six courses, got ${courses.length}`);
if(cat.legacyLessonIds.length!==70)throw new Error(`legacy guided lesson preservation failed: ${cat.legacyLessonIds.length}`);
if(cat.legacyMasteryIds.length!==69)throw new Error(`legacy mastery preservation failed: ${cat.legacyMasteryIds.length}`);
if(!cat.legacyLessonIds.includes('begin'))throw new Error('stable legacy lesson begin missing');
if(!cat.activities.some(activity=>activity.id==='lesson:begin'))throw new Error('stable lesson:begin activity missing');
if(!cat.activities.every(activity=>units.some(unit=>unit.id===activity.unitId)))throw new Error('activity references unknown unit');
if(units.some(unit=>!(newMasteryPlacement[unit.id]||[]).some(id=>newMastery[id]?.type==='unit-mastery')))throw new Error('a scored unit is missing authored unit mastery');
if(courses.some(course=>!courseCapstoneIds.some(id=>newMastery[id]?.courseId===course.id)))throw new Error('a course is missing its capstone');
for(const required of ['c2-passover','c2-tabernacle','c2-ark','c2-day-atonement','c2-new-covenant','c3-alexander-hellenization','c3-pharisees-sadducees','c3-messianic-diversity','c4-pentecost'])if(!cat.lessons.some(lesson=>lesson.id===required))throw new Error(`required bridge lesson missing: ${required}`);

await writeFile(path,JSON.stringify(cat,null,2));
await writeFile('public/data/statement-of-faith.md',await readFile('content/statement/statement-of-faith-v3.md','utf8'));
await writeFile('public/data/theology-sources.json',await readFile('content/theology/sources.json','utf8'));
console.log(`multi-course catalog: ${cat.courses.length} courses, ${cat.units.length} units, ${cat.lessons.length} guided lessons, ${cat.masteryIds.length} mastery/capstone activities, ${cat.activities.length} scored activities, ${cat.glossary.length} glossary terms`);
