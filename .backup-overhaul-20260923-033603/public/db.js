import {createSyncMeta,recordMutation} from './sync.js';

const DB='canonical-shelf-v6',VERSION=1,STORE='state';
export const REVIEW_DAYS=[1,3,7,14,30,60];

const record=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};

const fresh=()=>({
  version:3,
  completed:[],
  attempts:{},
  challengeProgress:{},
  mastery:{},
  reviews:{},
  reviewSchedule:{},
  notes:{},
  journal:{},
  migrations:{},
  legacyRaw:{},
  sync:createSyncMeta(),
  updatedAt:null
});

function open(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB,VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}

export function normalizeLearnerState(state={}){
  const input=record(state),base=fresh(),fromVersion=Math.max(1,Number(input.version||1));
  const out={...base,...input,version:Math.max(fromVersion,3)};

  out.completed=[...new Set(Array.isArray(input.completed)?input.completed.filter(id=>typeof id==='string'):[])];
  out.attempts={...record(input.attempts)};
  out.mastery={...record(input.mastery)};
  out.reviews={...record(input.reviews)};
  out.reviewSchedule={...record(input.reviewSchedule)};
  out.notes={...record(input.notes)};
  out.journal={...record(input.journal)};
  out.migrations={...record(input.migrations)};
  out.legacyRaw={...record(input.legacyRaw)};
  out.challengeProgress={};

  for(const [id,value] of Object.entries(record(input.challengeProgress))){
    const progress=record(value);
    out.challengeProgress[id]={
      ...progress,
      total:Math.max(0,Number(progress.total||0)),
      challenges:{...record(progress.challenges)}
    };
  }

  if(fromVersion<3&&!out.migrations.assessmentV3){
    out.migrations.assessmentV3={
      fromVersion,
      legacyCompletedPreserved:out.completed.length
    };
  }

  out.sync=createSyncMeta(input.sync||base.sync);
  return out;
}

export async function getState(){
  const db=await open();
  return new Promise((resolve,reject)=>{
    const request=db.transaction(STORE).objectStore(STORE).get('learner');
    request.onsuccess=()=>resolve(normalizeLearnerState(request.result||{}));
    request.onerror=()=>reject(request.error);
  });
}

export async function putState(state,{notify=true}={}){
  state=normalizeLearnerState(state);
  state.updatedAt=new Date().toISOString();
  const db=await open();

  return new Promise((resolve,reject)=>{
    const transaction=db.transaction(STORE,'readwrite');
    transaction.objectStore(STORE).put(state,'learner');
    transaction.oncomplete=()=>{
      if(notify&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent('canonical-state-changed'));
      resolve(state);
    };
    transaction.onerror=()=>reject(transaction.error);
  });
}

const addDays=(days,base=Date.now())=>new Date(base+days*86400000).toISOString();
function schedule(state,id,stage=0,base=Date.now()){
  const index=Math.min(Math.max(stage,0),REVIEW_DAYS.length-1);
  state.reviewSchedule[id]={stage:index,dueAt:addDays(REVIEW_DAYS[index],base),intervalDays:REVIEW_DAYS[index]};
}

function hasScoredChallenge(progress){
  return Object.values(progress?.challenges||{}).some(challenge=>challenge?.mode==='scored');
}

export function activityRequirementsSatisfied(_id,progress){
  const total=Math.max(0,Number(progress?.total||0));
  if(total<1)return false;

  for(let index=0;index<total;index++){
    const challenge=progress?.challenges?.[String(index)];
    if(!challenge||challenge.mode!=='scored'||challenge.passed!==true)return false;
  }

  return true;
}

export function applyActivityResult(state,id,result={},at=new Date().toISOString()){
  if(typeof id!=='string'||!/^(lesson|mastery):/.test(id))throw new Error('Invalid Canonical Shelf activity id');

  const learner=normalizeLearnerState(state);
  const challengeIndex=Number(result.challengeIndex);
  const totalChallenges=Number(result.totalChallenges);

  if(!Number.isInteger(challengeIndex)||challengeIndex<0)throw new Error('Invalid challenge index');
  if(!Number.isInteger(totalChallenges)||totalChallenges<1||challengeIndex>=totalChallenges)throw new Error('Invalid challenge count');

  const requestedMode=result.mode==='reflection'?'reflection':'scored';
  const progress={
    ...(learner.challengeProgress[id]||{}),
    total:Math.max(totalChallenges,Number(learner.challengeProgress[id]?.total||0)),
    challenges:{...(learner.challengeProgress[id]?.challenges||{})}
  };

  const key=String(challengeIndex);
  const previous=record(progress.challenges[key]);
  const mode=previous.mode==='scored'||requestedMode==='scored'?'scored':'reflection';
  const challenge={...previous,mode,attempts:Number(previous.attempts||0)+1,lastAttempt:at};

  if(mode==='scored')challenge.passed=previous.passed===true||result.passed===true;
  else challenge.submitted=previous.submitted===true||result.submitted===true;

  progress.challenges[key]=challenge;
  progress.updatedAt=at;
  learner.challengeProgress[id]=progress;
  learner.attempts[id]=Number(learner.attempts[id]||0)+1;

  const alreadyComplete=learner.completed.includes(id);
  const requirementsSatisfied=activityRequirementsSatisfied(id,progress);
  const newlyCompleted=requirementsSatisfied&&!alreadyComplete;

  if(newlyCompleted){
    learner.completed.push(id);
    progress.completedAt=progress.completedAt||at;
    if(hasScoredChallenge(progress)&&!learner.reviewSchedule[id]){
      const base=Date.parse(progress.completedAt);
      schedule(learner,id,0,Number.isFinite(base)?base:Date.now());
    }
  }

  if(id.startsWith('mastery:')){
    const previousMastery=record(learner.mastery[id]);
    learner.mastery[id]={
      ...previousMastery,
      passed:previousMastery.passed===true||requirementsSatisfied,
      attempts:learner.attempts[id],
      lastAttempt:at
    };
  }

  return {
    state:learner,
    activityComplete:alreadyComplete||requirementsSatisfied,
    newlyCompleted,
    challenge:{
      index:challengeIndex,
      total:totalChallenges,
      mode,
      passed:challenge.passed===true,
      submitted:challenge.submitted===true
    }
  };
}

export async function recordResult(id,result){
  const state=await getState(),at=new Date().toISOString();
  const outcome=applyActivityResult(state,id,result,at);
  recordMutation(outcome.state,'result',{
    id,
    challengeIndex:outcome.challenge.index,
    totalChallenges:outcome.challenge.total,
    mode:outcome.challenge.mode,
    passed:outcome.challenge.passed,
    submitted:outcome.challenge.submitted,
    activityComplete:outcome.activityComplete,
    newlyCompleted:outcome.newlyCompleted,
    attempts:outcome.state.attempts[id]
  },at);
  return putState(outcome.state);
}

export async function recordReview(id,passed=true){
  const state=await getState(),previous=state.reviewSchedule[id]||{stage:0},at=new Date().toISOString();
  state.reviews[id]=(state.reviews[id]||0)+1;
  const base=Date.parse(at);
  schedule(state,id,passed?previous.stage+1:0,Number.isFinite(base)?base:Date.now());
  recordMutation(state,'review',{id,passed:!!passed,count:state.reviews[id],schedule:state.reviewSchedule[id]},at);
  return putState(state);
}

export function dueReviews(state,now=Date.now()){
  return Object.entries(state.reviewSchedule||{})
    .filter(([,value])=>Date.parse(value.dueAt)<=now)
    .sort((a,b)=>Date.parse(a[1].dueAt)-Date.parse(b[1].dueAt))
    .map(([id,value])=>({id,...value}));
}

export async function exportState(){return JSON.stringify(await getState(),null,2)}

export async function importState(raw){
  const parsed=typeof raw==='string'?JSON.parse(raw):raw;
  if(!parsed||!Array.isArray(parsed.completed))throw new Error('Invalid Canonical Shelf state');
  return putState(normalizeLearnerState(parsed));
}

export async function legacyLocalStorageSnapshot(){
  const out={};
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    if(key&&/(canon|foundation|progress|mastery)/i.test(key))out[key]=localStorage.getItem(key);
  }
  return out;
}

function findStepDone(value,out=[]){
  if(!value||typeof value!=='object')return out;
  if(value.stepDone&&typeof value.stepDone==='object')out.push(value.stepDone);
  for(const child of Object.values(value))if(child&&typeof child==='object')findStepDone(child,out);
  return out;
}

export async function migrateLegacy(lessonIds=[],masteryIds=[]){
  const state=await getState();
  if(state.migrations?.legacyLocalStorage)return state;

  const raw=await legacyLocalStorageSnapshot(),lessonSet=new Set(lessonIds),masterySet=new Set(masteryIds);
  state.legacyRaw=raw;
  const completed=new Set(state.completed);

  try{
    const legacy=JSON.parse(raw['canon.foundations.v1']||'null');
    for(const [id,progress] of Object.entries(legacy?.lessons||{})){
      if(lessonSet.has(id)&&progress?.passed)completed.add(`lesson:${id}`);
      if(lessonSet.has(id)&&Number.isFinite(progress?.reviews))state.reviews[`lesson:${id}`]=progress.reviews;
    }
  }catch{}

  for(const value of Object.values(raw)){
    try{
      const parsed=JSON.parse(value);
      for(const stepDone of findStepDone(parsed)){
        for(const [id,done] of Object.entries(stepDone)){
          if(done&&masterySet.has(id)){
            completed.add(`mastery:${id}`);
            state.mastery[`mastery:${id}`]={passed:true,attempts:1,migrated:true};
          }
        }
      }
    }catch{}
  }

  state.completed=[...completed];
  for(const id of state.completed)if(!state.reviewSchedule[id])schedule(state,id,0);
  state.migrations.legacyLocalStorage={at:new Date().toISOString(),records:Object.keys(raw).length};
  return putState(state);
}
