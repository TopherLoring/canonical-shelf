import {readFile} from 'node:fs/promises';
import {normalizeLearnerState,applyActivityResult} from '../public/db.js';
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

lesson=applyActivityResult(lesson,'lesson:three',{challengeIndex:0,totalChallenges:3,mode:'scored',passed:false},'2026-09-19T01:03:00.000Z').state;
assert(lesson.challengeProgress['lesson:three'].challenges['0'].passed===true,'failed retry erased previously demonstrated challenge success');

let mastery=base();
mastery=applyActivityResult(mastery,'mastery:test',{challengeIndex:0,totalChallenges:1,mode:'scored',passed:false}).state;
assert(!mastery.completed.includes('mastery:test'),'failed mastery challenge completed mastery');
mastery=applyActivityResult(mastery,'mastery:test',{challengeIndex:0,totalChallenges:1,mode:'scored',passed:true}).state;
assert(mastery.completed.includes('mastery:test'),'passed mastery challenge did not complete mastery');
assert(mastery.mastery['mastery:test']?.passed===true,'mastery pass state missing');

const reflectionChallenge={kind:'reasoning',prompt:'Explain the distinction.'};
assert(challengeShape(reflectionChallenge)==='reflection','free reasoning is not reflection mode');
assert(challengeEvaluationMode(reflectionChallenge)==='reflection','free reasoning became scored');
let reflection=base();
reflection=applyActivityResult(reflection,'lesson:reflection',{challengeIndex:0,totalChallenges:1,mode:'reflection',submitted:true}).state;
assert(reflection.completed.includes('lesson:reflection'),'submitted lesson reflection did not satisfy participation requirement');
assert(!reflection.reviewSchedule['lesson:reflection'],'reflection-only activity entered spaced review');
assert(reflection.challengeProgress['lesson:reflection'].challenges['0'].passed!==true,'reflection was represented as a scored pass');

let masteryReflection=base();
masteryReflection=applyActivityResult(masteryReflection,'mastery:reflection',{challengeIndex:0,totalChallenges:1,mode:'reflection',submitted:true}).state;
assert(!masteryReflection.completed.includes('mastery:reflection'),'reflection completed a mastery activity');

const legacy=normalizeLearnerState({
  version:2,
  completed:['lesson:legacy'],
  attempts:{'lesson:legacy':3},
  mastery:{},
  reviews:{},
  reviewSchedule:{'lesson:legacy':{stage:1,dueAt:'2026-09-20T00:00:00.000Z',intervalDays:3}},
  migrations:{},
  legacyRaw:{},
  sync:createSyncMeta({deviceId:'legacy-device',clocks:{},outbox:[]})
});
assert(legacy.version===3,'legacy learner state did not normalize to schema v3');
assert(legacy.completed.includes('lesson:legacy'),'legacy completion was lost');
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
assert(catalog.units.length===25,'expected 25 units');
assert(catalog.lessons.length===70,'expected 70 lessons');
assert(catalog.masteryIds.length===69,'expected 69 mastery IDs');
assert(catalog.activities.length===139,'expected 139 activities');

const shapeCounts={};
const unsupported=[];
for(const id of catalog.masteryIds){
  const challenge=catalog.legacyMastery?.CANON_V4_MASTERY?.[id]?.challenge;
  assert(challenge,`mastery challenge missing: ${id}`);
  const shape=challengeShape(challenge);
  shapeCounts[shape]=(shapeCounts[shape]||0)+1;
  if(challengeEvaluationMode(challenge)!=='scored')unsupported.push({id,kind:challenge.kind,shape,keys:Object.keys(challenge)});
}
if(unsupported.length)throw new Error(`mastery challenges without deterministic authored scoring:\n${JSON.stringify(unsupported,null,2)}`);

const nWhat=catalog.legacyMastery?.CANON_V4_MASTERY?.['n.what']?.challenge;
assert(nWhat?.kind==='book-detective','n.what book-detective contract missing');
assert(challengeShape(nWhat)==='single-choice','n.what scalar answer was not recognized as deterministic single-choice');

const learningSource=await readFile('public/learning.js','utf8');
assert(!learningSource.includes("trim().length>=20"),'legacy 20-character correctness fallback remains');
assert(!learningSource.includes('minlength="20"'),'legacy minimum-length pseudo-assessment remains');

console.log('mastery challenge shapes:',shapeCounts);
console.log('v7 assessment completion/state/migration/sync regression gates passed');
