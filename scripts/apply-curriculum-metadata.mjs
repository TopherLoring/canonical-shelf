import {readFile,writeFile} from 'node:fs/promises';
import {courses,units,questionThreads} from '../content/curriculum/structure.mjs';

const path='public/data/catalog.json';
const catalog=JSON.parse(await readFile(path,'utf8'));
const courseIds=new Set(courses.map(course=>course.id));
const unitIds=new Set(units.map(unit=>unit.id));

if(catalog.courses?.length!==courses.length||catalog.units?.length!==units.length){
  throw new Error('runtime catalog must be postprocessed before curriculum metadata is applied');
}

for(const course of courses){
  const range=course.activeStudyMinutes;
  if(!range||!Number.isFinite(range.min)||!Number.isFinite(range.max)||range.min<=0||range.max<=range.min){
    throw new Error(`${course.id}: invalid active-study time range`);
  }
}

const seen=new Set();
for(const thread of questionThreads){
  if(!thread.id||seen.has(thread.id))throw new Error(`duplicate or missing question-thread id: ${thread.id||'(missing)'}`);
  seen.add(thread.id);
  if(!thread.question||!Array.isArray(thread.touchpoints)||thread.touchpoints.length<2)throw new Error(`${thread.id}: incomplete question thread`);
  for(const point of thread.touchpoints){
    if(!courseIds.has(point.courseId))throw new Error(`${thread.id}: unknown course ${point.courseId}`);
    if(!unitIds.has(point.unitId))throw new Error(`${thread.id}: unknown unit ${point.unitId}`);
    const unit=units.find(item=>item.id===point.unitId);
    if(unit.courseId!==point.courseId)throw new Error(`${thread.id}: ${point.unitId} does not belong to ${point.courseId}`);
    if(!point.stage)throw new Error(`${thread.id}: touchpoint ${point.unitId} is missing a stage`);
  }
}

catalog.courses=courses;
catalog.units=units;
catalog.questionThreads=questionThreads;
catalog.curriculumGuidance={
  model:'questions-first-spiral',
  completionTiming:'active-study estimate only',
  retentionDays:catalog.retentionDays||[1,3,7,14,30,60],
  principle:'Introduce major questions early, build biblical/historical/interpretive foundations, revisit them in context, then synthesize with stronger tools.'
};

await writeFile(path,JSON.stringify(catalog,null,2));
console.log(`applied curriculum metadata: ${courses.length} courses, ${questionThreads.length} question threads`);
