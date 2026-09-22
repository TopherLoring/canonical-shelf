import {readFile} from 'node:fs/promises';
import {normalizeLearnerState,applyActivityResult,REVIEW_DAYS} from '../public/db.js';
import {createSyncMeta,mergeLearnerState,remoteSnapshot} from '../public/sync.js';
import {challengeShape,challengeEvaluationMode} from '../public/learning.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const base=(device='test-device')=>normalizeLearnerState({
  version:2,
  completed:[],
  attempts:{},
  mastery:{},
  reviews:{},
  reviewSchedule:{},
  migrations:{},
  legacyRaw:{secret:'local-only'},
  sync:createSyncMeta({deviceId:device,clocks:{},outbox:[]}),
  updatedAt:'2026-09-19T00:00:00.000Z'
});

let lesson=base();
lesson=applyActivityResult(lesson,'lesson:three',{challengeIndex:0,totalChallenges:3,mode:'scored',passed:true},'2026-09-19T01:00:00.000Z').state;
assert(!lesson.completed.includes('lesson:three'),'one passed challenge completed a three-challenge lesson');
assert(!lesson.reviewSchedule['lesson:three'],'review scheduled after partial lesson success');
lesson=applyActivityResult(lesson,'lesson:three',{challengeIndex:1,totalChallenges:3,mode:'scored',passed:true},'2026-09-19T01:01:00.000Z').state;
assert(!lesson.completed.includes('lesson:three'),'two passed challenges completed a three-challenge lesson');
lesson=applyActivityResult(lesson,'lesson:three',{challengeIndex:2,totalChallenges:3,mode:'scored',passed:true},'2026-09-19T01:02:00.000Z').state;
assert(lesson.completed.includes('lesson:three'),'lesson did not complete after all three challenges passed');
assert(lesson.reviewSchedule['lesson:three']?.stage===0,'review did not begin after full lesson completion');
assert(lesson.reviewSchedule['lesson:three']?.intervalDays===1,'first review interval is not one day');

lesson=applyActivityResult(lesson,'lesson:three',{challengeIndex:0,totalChallenges:3,mode:'scored',passed:false},'2026-09-19T01:03:00.000Z').state;
assert(lesson.challengeProgress['lesson:three'].challenges['0'].passed===true,'failed retry erased previously demonstrated challenge success');

let mastery=base();
mastery=applyActivityResult(mastery,'mastery:test',{challengeIndex:0,totalChallenges:1,mode:'scored',passed:false}).state;
assert(!mastery.completed.includes('mastery:test'),'failed mastery challenge completed mastery');
mastery=applyActivityResult(mastery,'mastery:test',{challengeIndex:0,totalChallenges:1,mode:'scored',passed:true}).state;
assert(mastery.completed.includes('mastery:test'),'passed mastery challenge did not complete mastery');
assert(mastery.mastery['mastery:test']?.passed===true,'mastery pass state missing');

const reflectionChallenge={kind:'reasoning',prompt:'Explain the distinction.'};
assert(challengeShape(reflectionChallenge)==='reflection','free reasoning fallback is not recognized as reflection');
assert(challengeEvaluationMode(reflectionChallenge)==='reflection','free reasoning fallback became scored');
let reflection=base();
reflection=applyActivityResult(reflection,'lesson:reflection',{challengeIndex:0,totalChallenges:1,mode:'reflection',submitted:true}).state;
assert(!reflection.completed.includes('lesson:reflection'),'submitted reflection incorrectly completed a lesson');
assert(!reflection.reviewSchedule['lesson:reflection'],'reflection-only activity entered spaced review');
assert(reflection.challengeProgress['lesson:reflection'].challenges['0'].passed!==true,'reflection was represented as a scored pass');

let masteryReflection=base();
masteryReflection=applyActivityResult(masteryReflection,'mastery:reflection',{challengeIndex:0,totalChallenges:1,mode:'reflection',submitted:true}).state;
assert(!masteryReflection.completed.includes('mastery:reflection'),'reflection completed a mastery activity');

const legacy=normalizeLearnerState({
  version:2,
  completed:['lesson:legacy','mastery:legacy'],
  attempts:{'lesson:legacy':3},
  mastery:{'mastery:legacy':{passed:true}},
  reviews:{},
  reviewSchedule:{'lesson:legacy':{stage:1,dueAt:'2026-09-20T00:00:00.000Z',intervalDays:3}},
  migrations:{},
  legacyRaw:{},
  sync:createSyncMeta({deviceId:'legacy-device',clocks:{},outbox:[]})
});
assert(legacy.version===3,'legacy learner state did not normalize to schema v3');
assert(legacy.completed.includes('lesson:legacy'),'legacy completion was lost');
assert(legacy.completed.includes('mastery:legacy'),'legacy mastery completion was lost');
assert(legacy.migrations.assessmentV3?.fromVersion===2,'assessment-v3 migration marker missing');

const roundTrip=normalizeLearnerState(JSON.parse(JSON.stringify(lesson)));
assert(JSON.stringify(roundTrip.challengeProgress)===JSON.stringify(lesson.challengeProgress),'challenge progress did not survive JSON round trip');

let left=base('device-left');
let right=base('device-right');
left=applyActivityResult(left,'lesson:merge',{challengeIndex:0,totalChallenges:2,mode:'scored',passed:true},'2026-09-19T04:00:00.000Z').state;
right=applyActivityResult(right,'lesson:merge',{challengeIndex:1,totalChallenges:2,mode:'scored',passed:true},'2026-09-19T04:05:00.000Z').state;
const merged=mergeLearnerState(left,right);
assert(merged.completed.includes('lesson:merge'),'cross-device challenge progress did not reconcile completion');
assert(merged.reviewSchedule['lesson:merge']?.stage===0,'cross-device completion did not create first review schedule');
const remote=remoteSnapshot(merged);
assert(!('legacyRaw' in remote),'legacy raw migration data leaked into remote snapshot');
assert(!('outbox' in (remote.sync||{})),'local sync outbox leaked into remote snapshot');

const catalog=JSON.parse(await readFile('public/data/catalog.json','utf8'));
assert(catalog.courses.length===6,'expected six courses');
assert(catalog.legacyLessonIds.length===70,'expected all 70 legacy guided lesson IDs to survive');
assert(catalog.legacyMasteryIds.length===69,'expected all 69 legacy mastery IDs to survive');
assert(catalog.lessons.length>70,'expected added guided lessons');
assert(catalog.masteryIds.length>69,'expected added mastery/capstone IDs');
assert(catalog.activities.length===catalog.lessons.length+catalog.masteryIds.length,'activity catalog is not lesson + mastery total');
assert(JSON.stringify(REVIEW_DAYS)===JSON.stringify([1,3,7,14,30,60]),'spaced retention intervals changed');

const masteryRecord=id=>catalog.mastery?.[id]||catalog.legacyMastery?.CANON_V4_MASTERY?.[id]||null;
const shapeCounts={};
const unsupported=[];
for(const id of catalog.masteryIds){
  const challenge=masteryRecord(id)?.challenge;
  assert(challenge,`mastery challenge missing: ${id}`);
  const shape=challengeShape(challenge);
  shapeCounts[shape]=(shapeCounts[shape]||0)+1;
  if(challengeEvaluationMode(challenge)!=='scored')unsupported.push({id:`mastery:${id}`,kind:challenge.kind,shape,keys:Object.keys(challenge)});
}
for(const lessonItem of catalog.lessons){
  const challenges=lessonItem.challenges||[];
  assert(challenges.length>=1,`${lessonItem.id} has no lesson game/check`);
  if(lessonItem.newCurriculum)assert(challenges.length>=2,`${lessonItem.id} new curriculum lesson needs at least two active checks`);
  for(let index=0;index<challenges.length;index++){
    const challenge=challenges[index],shape=challengeShape(challenge);
    shapeCounts[shape]=(shapeCounts[shape]||0)+1;
    if(challengeEvaluationMode(challenge)!=='scored')unsupported.push({id:`lesson:${lessonItem.id}#${index+1}`,kind:challenge.kind,shape,keys:Object.keys(challenge)});
  }
}
if(unsupported.length)throw new Error(`completion-bearing challenges without deterministic authored scoring:\n${JSON.stringify(unsupported,null,2)}`);

for(const unit of catalog.units){
  const ids=catalog.byUnit[unit.id]||[];
  assert(ids.some(activityId=>{
    const activity=catalog.activities.find(item=>item.id===activityId);
    return activity?.masteryType==='unit-mastery';
  }),`${unit.id} has no unit mastery activity`);
}
for(const course of catalog.courses){
  assert(catalog.activities.some(activity=>activity.courseId===course.id&&activity.masteryType==='course-capstone'),`${course.id} has no course capstone`);
}

const nWhat=catalog.legacyMastery?.CANON_V4_MASTERY?.['n.what']?.challenge;
assert(nWhat?.kind==='book-detective','n.what book-detective contract missing');
assert(challengeShape(nWhat)==='single-choice','n.what scalar answer was not recognized as deterministic single-choice');

const learningSource=await readFile('public/learning.js','utf8');
assert(!learningSource.includes("trim().length>=20"),'legacy 20-character correctness fallback remains');
assert(!learningSource.includes('minlength="20"'),'legacy minimum-length pseudo-assessment remains');
assert(learningSource.includes('lesson-drawers'),'lesson progressive-disclosure drawers missing');
assert(learningSource.includes('glossaryView'),'course/global glossary surface missing');

console.log('scored challenge shapes:',shapeCounts);
console.log(`multi-course assessment gates passed: ${catalog.lessons.length} lessons / ${catalog.masteryIds.length} mastery+capstone / ${catalog.activities.length} total; optional reflection cannot satisfy completion`);
