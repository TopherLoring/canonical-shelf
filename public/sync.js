const clone=x=>structuredClone(x||{});
const latest=(a,b,field='lastAttempt')=>Date.parse(a?.[field]||0)>=Date.parse(b?.[field]||0)?a:b;
const union=(a=[],b=[])=>[...new Set([...a,...b])];
const mapMax=(a={},b={})=>{const out={...a};for(const [k,v] of Object.entries(b))out[k]=Math.max(Number(out[k]||0),Number(v||0));return out};
const clockOf=(state,key)=>Date.parse(state?.sync?.clocks?.[key]||0);

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
  out.version=Math.max(Number(a.version||1),Number(b.version||1),2);
  out.completed=union(a.completed,b.completed);
  out.attempts=mapMax(a.attempts,b.attempts);
  out.reviews=mapMax(a.reviews,b.reviews);
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
  out.migrations={...(a.migrations||{})};
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
  const s=clone(state);
  delete s.legacyRaw;
  if(s.sync)s.sync={schema:s.sync.schema,clocks:s.sync.clocks};
  return s;
}

export function acknowledgeSync(state,{cursor=null,acceptedIds=[]}={}){
  const accepted=new Set(acceptedIds),sync=createSyncMeta(state.sync);
  sync.outbox=sync.outbox.filter(x=>!accepted.has(x.id));
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
