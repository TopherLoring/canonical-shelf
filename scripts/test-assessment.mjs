import {readFile} from 'node:fs/promises';
import {normalizeLearnerState,applyActivityResult,REVIEW_DAYS} from '../public/db.js';
import {createSyncMeta,mergeLearnerState,remoteSnapshot} from '../public/sync.js';
import {challengeEvaluationMode} from '../public/learning.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const base=(device='test-device')=>normalizeLearnerState({
  completed:[],attempts:{},mastery:{},reviews:{},reviewSchedule:{},notes:{},journal:{},migrations:{},legacyRaw:{secret:'local-only'},
  sync:createSyncMeta({deviceId:device,clocks:{},outbox:[]})
});

// A completion-bearing activity completes only after all authored scored checks pass.
let lesson=base();
lesson=applyActivityResult(lesson,'lesson:test',{challengeIndex:0,totalChallenges:2,mode:'scored',passed:true}).state;
assert(!lesson.completed.includes('lesson:test'),'partial success completed a lesson');
assert(!lesson.reviewSchedule['lesson:test'],'partial success scheduled review');
lesson=applyActivityResult(lesson,'lesson:test',{challengeIndex:1,totalChallenges:2,mode:'scored',passed:true}).state;
assert(lesson.completed.includes('lesson:test'),'all passed checks did not complete the lesson');
assert(lesson.reviewSchedule['lesson:test'],'completed lesson did not enter spaced review');

// Demonstrated success is monotonic across retries.
lesson=applyActivityResult(lesson,'lesson:test',{challengeIndex:0,totalChallenges:2,mode:'scored',passed:false}).state;
assert(lesson.challengeProgress['lesson:test'].challenges['0'].passed===true,'failed retry erased prior demonstrated success');

// Mastery requires demonstrated success.
let mastery=base();
mastery=applyActivityResult(mastery,'mastery:test',{challengeIndex:0,totalChallenges:1,mode:'scored',passed:false}).state;
assert(!mastery.completed.includes('mastery:test'),'failed mastery check completed mastery');
mastery=applyActivityResult(mastery,'mastery:test',{challengeIndex:0,totalChallenges:1,mode:'scored',passed:true}).state;
assert(mastery.completed.includes('mastery:test'),'passed mastery check did not complete mastery');

// Reflection remains learner-owned writing and cannot satisfy scored completion.
let reflection=base();
reflection=applyActivityResult(reflection,'lesson:reflection',{challengeIndex:0,totalChallenges:1,mode:'reflection',submitted:true}).state;
assert(!reflection.completed.includes('lesson:reflection'),'reflection incorrectly completed a lesson');
assert(!reflection.reviewSchedule['lesson:reflection'],'reflection entered spaced review');
assert(reflection.challengeProgress['lesson:reflection'].challenges['0'].passed!==true,'reflection was represented as a scored pass');

// State remains serializable and old learner data preserves meaningful progress when normalized.
const legacy=normalizeLearnerState({completed:['lesson:legacy'],attempts:{'lesson:legacy':1},mastery:{},reviews:{},reviewSchedule:{},migrations:{},legacyRaw:{},sync:createSyncMeta({deviceId:'legacy-device',clocks:{},outbox:[]})});
assert(legacy.completed.includes('lesson:legacy'),'normalization lost existing completion');
const roundTrip=normalizeLearnerState(JSON.parse(JSON.stringify(lesson)));
assert(JSON.stringify(roundTrip.challengeProgress)===JSON.stringify(lesson.challengeProgress),'challenge progress did not survive serialization');

// Independent devices can contribute different passed checks and converge on completion.
let left=base('device-left'),right=base('device-right');
left=applyActivityResult(left,'lesson:merge',{challengeIndex:0,totalChallenges:2,mode:'scored',passed:true}).state;
right=applyActivityResult(right,'lesson:merge',{challengeIndex:1,totalChallenges:2,mode:'scored',passed:true}).state;
const merged=mergeLearnerState(left,right);
assert(merged.completed.includes('lesson:merge'),'cross-device progress did not reconcile completion');
const remote=remoteSnapshot(merged);
assert(!('legacyRaw' in remote),'local migration material leaked into remote snapshot');
assert(!('outbox' in (remote.sync||{})),'local sync outbox leaked into remote snapshot');

// Review cadence is a real increasing spaced schedule without freezing exact day values.
assert(Array.isArray(REVIEW_DAYS)&&REVIEW_DAYS.length>1,'spaced review cadence is missing');
assert(REVIEW_DAYS.every(day=>Number.isFinite(day)&&day>0),'review cadence contains a non-positive interval');
assert(REVIEW_DAYS.every((day,index)=>index===0||day>REVIEW_DAYS[index-1]),'review cadence must increase over time');

// Curriculum verification protects shape and scoring semantics, not historical item counts or IDs.
const catalog=JSON.parse(await readFile('public/data/catalog.json','utf8'));
assert(Array.isArray(catalog.courses)&&catalog.courses.length>0,'catalog has no courses');
assert(Array.isArray(catalog.units)&&catalog.units.length>0,'catalog has no units');
assert(Array.isArray(catalog.lessons)&&catalog.lessons.length>0,'catalog has no lessons');
assert(Array.isArray(catalog.masteryIds)&&catalog.masteryIds.length>0,'catalog has no mastery/capstone activities');
assert(Array.isArray(catalog.activities)&&catalog.activities.length>0,'catalog has no completion-bearing activities');

const masteryRecord=id=>catalog.mastery?.[id]||catalog.legacyMastery?.CANON_V4_MASTERY?.[id]||null;
for(const id of catalog.masteryIds){
  const challenge=masteryRecord(id)?.challenge;
  assert(challenge,`mastery activity lacks an authored challenge: ${id}`);
  assert(challengeEvaluationMode(challenge)==='scored',`mastery activity is not deterministically scored: ${id}`);
}
for(const lessonItem of catalog.lessons){
  const challenges=lessonItem.challenges||[];
  assert(challenges.length>0,`lesson lacks an authored check: ${lessonItem.id}`);
  for(const challenge of challenges) assert(challengeEvaluationMode(challenge)==='scored',`completion-bearing lesson check is not deterministically scored: ${lessonItem.id}`);
}
for(const unit of catalog.units){
  const ids=catalog.byUnit?.[unit.id]||[];
  assert(ids.some(activityId=>catalog.activities.find(item=>item.id===activityId)?.masteryType==='unit-mastery'),`unit has no mastery activity: ${unit.id}`);
}
for(const course of catalog.courses){
  assert(catalog.activities.some(activity=>activity.courseId===course.id&&activity.masteryType==='course-capstone'),`course has no capstone: ${course.id}`);
}

console.log('PASS — durable assessment, reflection, review, merge, privacy, and curriculum scoring behavior.');
