const clone=value=>structuredClone(value||{});
const asTime=value=>{const n=Date.parse(value||'');return Number.isFinite(n)?n:0};
const latest=(a,b,field='lastAttempt')=>asTime(a?.[field])>=asTime(b?.[field])?a:b;
const union=(a=[],b=[])=>[...new Set([...a,...b])];
const mapMax=(a={},b={})=>{const out={...a};for(const [key,value] of Object.entries(b))out[key]=Math.max(Number(out[key]||0),Number(value||0));return out};
const clockOf=(state,key)=>Date.parse(state?.sync?.clocks?.[key]||0);

function progressSatisfied(id,progress){
  const total=Math.max(0,Number(progress?.total||0));
  if(total<1)return false;
  const mastery=id.startsWith('mastery:');

  for(let index=0;index<total;index++){
    const challenge=progress?.challenges?.[String(index)];
    if(!challenge)return false;
    if(challenge.mode==='reflection'){
      if(mastery||challenge.submitted!==true)return false;
    }else if(challenge.passed!==true){
      return false;
    }
  }

  return true;
}

function hasScoredChallenge(progress){
  return Object.values(progress?.challenges||{}).some(challenge=>challenge?.mode==='scored');
}

function mergeProgress(id,a={},b={}){
  const total=Math.max(Number(a?.total||0),Number(b?.total||0));
  const challenges={};
  const keys=new Set([...Object.keys(a?.challenges||{}),...Object.keys(b?.challenges||{})]);

  for(const key of keys){
    const left=a?.challenges?.[key]||{},right=b?.challenges?.[key]||{},winner=latest(left,right);
    const mode=left.mode==='scored'||right.mode==='scored'?'scored':(left.mode||right.mode||'reflection');
    const merged={...left,...right,...winner,mode,attempts:Math.max(Number(left.attempts||0),Number(right.attempts||0))};
    if(mode==='scored')merged.passed=left.passed===true||right.passed===true;
    else merged.submitted=left.submitted===true||right.submitted===true;
    challenges[key]=merged;
  }

  const progress={
    ...a,
    ...b,
    total,
    challenges,
    updatedAt:asTime(a?.updatedAt)>=asTime(b?.updatedAt)?a?.updatedAt:b?.updatedAt
  };

  const completedTimes=[a?.completedAt,b?.completedAt].filter(Boolean);
  if(completedTimes.length)progress.completedAt=completedTimes.sort((x,y)=>asTime(x)-asTime(y))[0];
  else if(progressSatisfied(id,progress)){
    const evidenceTimes=Object.values(challenges).map(challenge=>challenge.lastAttempt).filter(Boolean).sort((x,y)=>asTime(x)-asTime(y));
    progress.completedAt=evidenceTimes.at(-1)||progress.updatedAt||null;
  }

  return progress;
}

function firstReview(completedAt){
  const base=asTime(completedAt)||Date.now();
  return {stage:0,dueAt:new Date(base+86400000).toISOString(),intervalDays:1};
}

export function createSyncMeta(existing={}){
  return {
    schema:1,
    deviceId:existing.deviceId||crypto.randomUUID(),
    cursor:existing.cursor||null,
    lastSyncAt:existing.lastSyncAt||null,
    clocks:{...(existing.clocks||{})},
    outbox:Array.isArray(existing.outbox)?existing.outbox:[]
  };
}

export function recordMutation(state,type,payload,at=new Date().toISOString()){
  const sync=createSyncMeta(state.sync),event={id:crypto.randomUUID(),deviceId:sync.deviceId,type,payload:clone(payload),at};
  const key=payload?.id?`${type}:${payload.id}`:type;
  sync.clocks[key]=at;
  sync.outbox=[...sync.outbox,event];
  state.sync=sync;
  return event;
}

export function mergeLearnerState(local,remote){
  const a=clone(local),b=clone(remote),out={...a};
  out.version=Math.max(Number(a.version||1),Number(b.version||1),3);
  out.completed=union(a.completed,b.completed);
  out.attempts=mapMax(a.attempts,b.attempts);
  out.reviews=mapMax(a.reviews,b.reviews);

  out.challengeProgress={};
  const progressIds=new Set([...Object.keys(a.challengeProgress||{}),...Object.keys(b.challengeProgress||{})]);
  for(const id of progressIds){
    const progress=mergeProgress(id,a.challengeProgress?.[id]||{},b.challengeProgress?.[id]||{});
    out.challengeProgress[id]=progress;
    if(progressSatisfied(id,progress)&&!out.completed.includes(id))out.completed.push(id);
  }

  out.mastery={...a.mastery};
  for(const [id,value] of Object.entries(b.mastery||{})){
    const left=out.mastery[id]||{};
    const winner=latest(left,value);
    out.mastery[id]={...left,...value,...winner,passed:!!(left.passed||value.passed),attempts:Math.max(Number(left.attempts||0),Number(value.attempts||0))};
  }

  out.reviewSchedule={...a.reviewSchedule};
  for(const [id,value] of Object.entries(b.reviewSchedule||{})){
    const localClock=Math.max(clockOf(a,`review:${id}`),clockOf(a,`result:${id}`));
    const remoteClock=Math.max(clockOf(b,`review:${id}`),clockOf(b,`result:${id}`));
    if(!out.reviewSchedule[id]||remoteClock>localClock)out.reviewSchedule[id]=value;
    else if(remoteClock===localClock&&Number(value?.stage||0)>Number(out.reviewSchedule[id]?.stage||0))out.reviewSchedule[id]=value;
  }

  for(const [id,progress] of Object.entries(out.challengeProgress)){
    if(progressSatisfied(id,progress)&&hasScoredChallenge(progress)&&!out.reviewSchedule[id])out.reviewSchedule[id]=firstReview(progress.completedAt);
  }

  out.migrations={...(a.migrations||{}),...(b.migrations||{})};
  out.legacyRaw={...(a.legacyRaw||{})};

  const as=createSyncMeta(a.sync),bs=createSyncMeta(b.sync);
  out.sync={
    schema:1,
    deviceId:as.deviceId,
    cursor:bs.cursor||as.cursor||null,
    lastSyncAt:[as.lastSyncAt,bs.lastSyncAt].filter(Boolean).sort().at(-1)||null,
    clocks:{...as.clocks,...bs.clocks},
    outbox:as.outbox
  };

  out.updatedAt=[a.updatedAt,b.updatedAt].filter(Boolean).sort().at(-1)||null;
  return out;
}

export function remoteSnapshot(state){
  const snapshot=clone(state);
  delete snapshot.legacyRaw;
  if(snapshot.sync)snapshot.sync={schema:snapshot.sync.schema,clocks:snapshot.sync.clocks};
  return snapshot;
}

export function acknowledgeSync(state,{cursor=null,acceptedIds=[]}={}){
  const accepted=new Set(acceptedIds),sync=createSyncMeta(state.sync);
  sync.outbox=sync.outbox.filter(event=>!accepted.has(event.id));
  sync.cursor=cursor??sync.cursor;
  sync.lastSyncAt=new Date().toISOString();
  state.sync=sync;
  return state;
}

export class GuestSyncProvider{
  async getSession(){return null}
  async pull(){return {cursor:null,state:null,events:[]}}
  async push(){return {cursor:null,acceptedIds:[]}}
  async signOut(){}
  async deleteAccount(){}
}
