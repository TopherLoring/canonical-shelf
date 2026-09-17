import {mergeLearnerState,remoteSnapshot} from '../public/sync.js';

type D1StatementLike={bind(...values:unknown[]):D1StatementLike;first<T=unknown>():Promise<T|null>};
type D1Like={prepare(sql:string):D1StatementLike;batch(statements:D1StatementLike[]):Promise<unknown>};
export type SyncEvent={id:string;deviceId:string;type:string;payload:unknown;at:string};
export type SyncBody={deviceId:string;snapshot:Record<string,unknown>;events?:SyncEvent[];cursor?:number|null};

export function validSyncBody(body:unknown):body is SyncBody{
  if(!body||typeof body!=='object')return false;
  const x=body as SyncBody;
  return typeof x.deviceId==='string'&&x.deviceId.length>=8&&!!x.snapshot&&typeof x.snapshot==='object'&&Array.isArray(x.events||[])&&(x.events||[]).length<=500;
}

export async function readSync(db:D1Like,userId:string){
  const row=await db.prepare('SELECT snapshot_json,cursor,updated_at FROM learner_state WHERE user_id=?').bind(userId).first<{snapshot_json:string;cursor:number;updated_at:string}>();
  return row?{state:JSON.parse(row.snapshot_json),cursor:row.cursor,updatedAt:row.updated_at}:{state:null,cursor:0,updatedAt:null};
}

export async function mergeAndWriteSync(db:D1Like,userId:string,body:SyncBody,now=new Date().toISOString()){
  if('legacyRaw'in body.snapshot)throw new Error('Legacy raw data cannot be synchronized');
  const existing=await db.prepare('SELECT snapshot_json,cursor FROM learner_state WHERE user_id=?').bind(userId).first<{snapshot_json:string;cursor:number}>();
  const serverState=existing?JSON.parse(existing.snapshot_json):{};
  const merged=remoteSnapshot(mergeLearnerState(serverState,body.snapshot));
  const cursor=Number(existing?.cursor||0)+1,events=body.events||[];
  const inserts=events.map(e=>db.prepare('INSERT OR IGNORE INTO learner_mutation(id,user_id,device_id,type,payload_json,occurred_at,created_at) VALUES(?,?,?,?,?,?,?)').bind(e.id,userId,e.deviceId,e.type,JSON.stringify(e.payload??null),e.at,now));
  const upsert=db.prepare('INSERT INTO learner_state(user_id,snapshot_json,cursor,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET snapshot_json=excluded.snapshot_json,cursor=excluded.cursor,updated_at=excluded.updated_at').bind(userId,JSON.stringify(merged),cursor,now);
  await db.batch([...inserts,upsert]);
  return {state:merged,cursor,acceptedIds:events.map(e=>e.id),updatedAt:now};
}

export async function deleteSync(db:D1Like,userId:string){
  await db.batch([
    db.prepare('DELETE FROM learner_mutation WHERE user_id=?').bind(userId),
    db.prepare('DELETE FROM learner_state WHERE user_id=?').bind(userId)
  ]);
}
