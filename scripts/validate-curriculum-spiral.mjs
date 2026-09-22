import {readFile} from 'node:fs/promises';
import {courses,units,questionThreads,RETENTION_DAYS} from '../content/curriculum/structure.mjs';
import {newLessons} from '../content/curriculum/new-lessons.mjs';

const fail=message=>{throw new Error(`questions-first curriculum validation failed: ${message}`)};
const catalog=JSON.parse(await readFile('public/data/catalog.json','utf8'));

if(courses.length!==6)fail(`expected 6 courses; found ${courses.length}`);
if(units.length!==44)fail(`expected 44 current units; found ${units.length}`);
if(!questionThreads.length)fail('question-thread map is empty');
if(JSON.stringify(RETENTION_DAYS)!==JSON.stringify([1,3,7,14,30,60]))fail('retention schedule drifted');

const courseIds=new Set(courses.map(course=>course.id));
const unitById=new Map(units.map(unit=>[unit.id,unit]));
for(const course of courses){
  const range=course.activeStudyMinutes;
  if(!range||!Number.isFinite(range.min)||!Number.isFinite(range.max)||range.min<240||range.max<=range.min)fail(`${course.id} has invalid active-study range`);
  if(!course.learnerPromise)fail(`${course.id} is missing learnerPromise`);
  if(!course.phaseLabel)fail(`${course.id} is missing phaseLabel`);
}

const threadIds=new Set();
for(const thread of questionThreads){
  if(threadIds.has(thread.id))fail(`duplicate question thread ${thread.id}`);
  threadIds.add(thread.id);
  if(!thread.question||thread.touchpoints.length<2)fail(`${thread.id} is incomplete`);
  if(!thread.touchpoints.some(point=>point.courseId==='course.foundations'))fail(`${thread.id} is not introduced in Course 1`);
  if(!thread.touchpoints.some(point=>['course.interpretation','course.theology'].includes(point.courseId)))fail(`${thread.id} never reaches investigation/synthesis`);
  for(const point of thread.touchpoints){
    if(!courseIds.has(point.courseId))fail(`${thread.id} references unknown course ${point.courseId}`);
    const unit=unitById.get(point.unitId);
    if(!unit)fail(`${thread.id} references unknown unit ${point.unitId}`);
    if(unit.courseId!==point.courseId)fail(`${thread.id} mismatches ${point.unitId} and ${point.courseId}`);
  }
}

const framing=newLessons.find(lesson=>lesson.id==='c1-questions-first');
if(!framing)fail('Course 1 questions-first lesson is missing');
if(framing.unitId!=='c1.christianity')fail('questions-first lesson must remain in the opening Christianity unit');
if(framing.questionThreadIds?.length!==questionThreads.length)fail('questions-first lesson must introduce every current question thread');
if(!(framing.body||[]).some(text=>/Course 5/i.test(text))||!(framing.body||[]).some(text=>/Course 6/i.test(text)))fail('questions-first lesson must explain later investigation and synthesis');

if(catalog.courses?.length!==courses.length)fail('runtime catalog course count drifted');
if(catalog.units?.length!==units.length)fail('runtime catalog unit count drifted');
if(catalog.questionThreads?.length!==questionThreads.length)fail('runtime catalog question threads were not published');
if(catalog.curriculumGuidance?.model!=='questions-first-spiral')fail('runtime catalog curriculum guidance is missing');
if(!catalog.lessons?.some(lesson=>lesson.id==='c1-questions-first'))fail('runtime catalog is missing the questions-first lesson');
if(catalog.legacyLessonIds?.length!==70)fail(`legacy guided lesson preservation failed: ${catalog.legacyLessonIds?.length}`);
if(catalog.legacyMasteryIds?.length!==69)fail(`legacy mastery preservation failed: ${catalog.legacyMasteryIds?.length}`);
if(catalog.lessons?.length!==70+newLessons.length)fail(`guided lesson count does not match preserved + new lessons: ${catalog.lessons?.length}`);
if(catalog.activities?.length!==(catalog.lessons.length+catalog.masteryIds.length))fail('scored activity total does not equal lessons + mastery/capstones');

const course5=courses.find(course=>course.id==='course.interpretation');
const course6=courses.find(course=>course.id==='course.theology');
if(/Advanced/i.test(course5?.title||''))fail('Course 5 learner-facing title should not frame interpretation as optional advanced material');
if(!/Synthesis/i.test(course6?.title||''))fail('Course 6 learner-facing title must communicate synthesis');
if(!/not the first time/i.test(course6?.learnerPromise||''))fail('Course 6 must explicitly state that difficult questions appeared earlier');

console.log(`questions-first spiral gates passed: ${courses.length} courses, ${units.length} units, ${catalog.lessons.length} guided lessons, ${catalog.activities.length} scored activities, ${questionThreads.length} question threads`);
