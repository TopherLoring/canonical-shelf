import {readFile} from 'node:fs/promises';
import {ORIENTATION_LESSON,ORIENTATION_LESSON_ID,ORIENTATION_UNIT_ID} from '../public/orientation.js';
import {DEFAULT_THEME_ID,THEMES} from '../public/theme.js';
import {REVIEW_DAYS} from '../public/db.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const catalog=JSON.parse(await readFile('public/data/catalog.json','utf8'));

// The old 25/70/69/139 values are migration baselines, not curriculum ceilings.
assert(catalog.courses?.length===6,`expected six courses; found ${catalog.courses?.length}`);
assert(catalog.units?.length>=44,`multi-course unit map incomplete: ${catalog.units?.length}`);
assert(catalog.legacyLessonIds?.length===70,`legacy guided lesson preservation failed: ${catalog.legacyLessonIds?.length}`);
assert(catalog.legacyMasteryIds?.length===69,`legacy mastery preservation failed: ${catalog.legacyMasteryIds?.length}`);
assert(catalog.lessons.length>70,'new curriculum contains no added guided lessons');
assert(catalog.masteryIds.length>69,'new curriculum contains no added unit/course mastery');
assert(catalog.activities.length>139,'multi-course scored activity catalog did not expand');
assert(catalog.lessons.some(lesson=>lesson.id==='begin'&&lesson.title==='Begin with the central story'),'legacy Unit 1 Lesson 1 identity changed');
assert(catalog.activities.some(activity=>activity.id==='lesson:begin'),'lesson:begin activity ID missing');
assert(!catalog.activities.some(activity=>activity.id===`lesson:${ORIENTATION_LESSON_ID}`),'Orientation leaked into scored activity catalog');
assert(!catalog.units.some(unit=>unit.id===ORIENTATION_UNIT_ID),'Orientation leaked into scored units');
assert(ORIENTATION_LESSON.scored===false,'Orientation must remain explicitly non-scored');
assert(ORIENTATION_LESSON.unitSequence===0&&ORIENTATION_LESSON.lessonSequence===1,'Orientation numbering contract changed');
assert(ORIENTATION_LESSON.scenes.length>=10,'Orientation tutorial lost required breadth');

const expectedCourseIds=['course.foundations','course.israel','course.second-temple','course.jesus-church','course.interpretation','course.theology'];
assert(JSON.stringify(catalog.courses.map(course=>course.id))===JSON.stringify(expectedCourseIds),'six-course ID/order contract changed');
for(const course of catalog.courses){
  const unitIds=catalog.byCourse?.[course.id]||[];
  assert(unitIds.length>0,`${course.id} has no units`);
  for(const unitId of unitIds)assert(catalog.units.some(unit=>unit.id===unitId&&unit.courseId===course.id),`${course.id} contains invalid unit ${unitId}`);
  assert((catalog.courseCapstoneIds||[]).some(id=>catalog.mastery?.[id]?.courseId===course.id),`${course.id} missing course capstone`);
}

for(const unit of catalog.units){
  const ids=catalog.byUnit?.[unit.id]||[];
  assert(ids.length>0,`${unit.id} is empty`);
  assert(ids.some(id=>catalog.mastery?.[id.replace(/^mastery:/,'')]?.type==='unit-mastery'),`${unit.id} missing unit mastery`);
}

for(const lesson of catalog.lessons){
  assert((lesson.challenges||[]).length>0,`${lesson.id} has no active learning check`);
  assert(catalog.activities.some(activity=>activity.id===`lesson:${lesson.id}`&&activity.unitId===lesson.unitId),`${lesson.id} activity placement missing`);
}

for(const required of ['c2-passover','c2-tabernacle','c2-ark','c2-priesthood-sacrifice','c2-day-atonement','c2-new-covenant','c2-prophetic-hope','c3-alexander-hellenization','c3-antiochus-maccabees','c3-pharisees-sadducees','c3-essenes-qumran','c3-messianic-diversity','c3-enter-gospels','c4-ascension','c4-pentecost']){
  assert(catalog.lessons.some(lesson=>lesson.id===required),`historical-biblical bridge missing ${required}`);
}

assert(Array.isArray(catalog.glossary)&&catalog.glossary.length>0,'global glossary was not generated');
assert(catalog.glossary.some(entry=>entry.term.toLowerCase()==='covenant'),'global glossary missing covenant');
assert(JSON.stringify(catalog.retentionDays)===JSON.stringify([1,3,7,14,30,60]),'catalog retention schedule changed');
assert(JSON.stringify(REVIEW_DAYS)===JSON.stringify([1,3,7,14,30,60]),'learner-state retention schedule changed');

const orientationText=JSON.stringify(ORIENTATION_LESSON).toLowerCase();
for(const term of ['canon','chronology','translation','evidence','practice','independent','theme'])assert(orientationText.includes(term),`Orientation missing ${term} coverage`);
assert(orientationText.includes('theologian')&&orientationText.includes('statement of faith')&&orientationText.includes('vetted research'),'Orientation missing current bounded-Theologian coverage');

const expectedThemes=['canonical-original','heritage','oxblood','illuminated-jewel','slate-linen','bookshelf-spectrum'];
assert(THEMES.length===expectedThemes.length,`expected ${expectedThemes.length} curated themes; found ${THEMES.length}`);
assert(JSON.stringify(THEMES.map(theme=>theme.id))===JSON.stringify(expectedThemes),'curated theme package IDs/order changed');
assert(DEFAULT_THEME_ID==='canonical-original','Canonical Original must remain the new-install default');

const tokens=await readFile('public/tokens.css','utf8');
for(const id of expectedThemes.filter(id=>id!=='heritage'))assert(tokens.includes(`data-theme="${id}"`),`theme tokens missing ${id}`);
for(const marker of ["'Iowan Old Style'","'Palatino Linotype'","--font-meta:var(--ref-font-mono)"])assert(tokens.includes(marker),`original typography contract missing ${marker}`);
for(const semantic of ['--canon-law','--canon-history-ot','--canon-wisdom','--canon-gospel','--canon-paul','--canon-apocalypse'])assert(tokens.includes(semantic),`semantic bookshelf color missing ${semantic}`);

const learning=await readFile('public/learning.js','utf8');
for(const marker of ['studyFocusShell','study-apparatus','sequence-board','argument-board','unit--orientation','lesson-drawers','glossaryView','courseOverview'])assert(learning.includes(marker),`Study Focus/multi-course implementation missing ${marker}`);
assert(!learning.includes('<select name="p'),'rich challenge rendering regressed to generic select controls');
assert(learning.includes("value!==null&&value!==''"),'single-choice/scenario null-answer hardening missing');

const styles=await readFile('public/learning.css','utf8');
for(const marker of ['container-type:inline-size','study-nav','max-height:640px','study-apparatus.is-open'])assert(styles.includes(marker),`responsive Study Focus contract missing ${marker}`);

const sw=await readFile('public/sw.js','utf8');
for(const asset of ['/theme.js','/orientation.js','/study-controls.js'])assert(sw.includes(asset),`offline shell missing ${asset}`);

const packageJson=JSON.parse(await readFile('package.json','utf8'));
assert((packageJson.scripts?.['validate:full']||'').includes('validate-v7-polish.mjs'),'v7 polish validator is not wired into full release validation');

console.log(`multi-course polish invariants passed: ${catalog.courses.length} courses / ${catalog.units.length} units / ${catalog.lessons.length} lessons / ${catalog.activities.length} scored activities`);
