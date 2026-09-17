import {createAuth, type AuthEnv} from './auth';
import {mergeLearnerState,remoteSnapshot} from '../public/sync.js';

interface Env extends AuthEnv {
  ASSETS?: {fetch(request:Request):Promise<Response>};
}

type SyncEvent={id:string;deviceId:string;type:string;payload:unknown;at:string};
type SyncBody={deviceId:string;snapshot:Record<string,unknown>;events?:SyncEvent[];cursor?:number|null};

const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
const bad=(message:string,status=400)=>json({error:message},status);

async function sessionUser(request:Request,auth:ReturnType<typeof createAuth>){
  const session=await auth.api.getSession({headers:request.headers});
  return session?.user||null;
}

function validBody(body:unknown):body is SyncBody{
  if(!body||typeof body!=='object')return false;
  const x=body as SyncBody;
  return typeof x.deviceId==='string'&&x.deviceId.length>=8&&!!x.snapshot&&typeof x.snapshot==='object'&&Array.isArray(x.events||[])&&(x.events||[]).length<=500;
}

async function getSync(request:Request,env:Env,auth:ReturnType<typeof createAuth>){
  const user=await sessionUser(request,auth);if(!user)return bad('Unauthorized',401);
  const row=await env.DB.prepare('SELECT snapshot_json,cursor,updated_at FROM learner_state WHERE user_id=?').bind(user.id).first<{snapshot_json:string;cursor:number;updated_at:string}>();
  return json(row?{state:JSON.parse(row.snapshot_json),cursor:row.cursor,updatedAt:row.updated_at}:{state:null,cursor:0,updatedAt:null});
}

async function postSync(request:Request,env:Env,auth:ReturnType<typeof createAuth>){
  const user=await sessionUser(request,auth);if(!user)return bad('Unauthorized',401);
  let body:unknown;try{body=await request.json()}catch{return bad('Invalid JSON')}
  if(!validBody(body))return bad('Invalid sync payload');
  if('legacyRaw'in body.snapshot)return bad('Legacy raw data cannot be synchronized');
  const existing=await env.DB.prepare('SELECT snapshot_json,cursor FROM learner_state WHERE user_id=?').bind(user.id).first<{snapshot_json:string;cursor:number}>();
  const serverState=existing?JSON.parse(existing.snapshot_json):{};
  const merged=remoteSnapshot(mergeLearnerState(serverState,body.snapshot));
  const cursor=Number(existing?.cursor||0)+1,now=new Date().toISOString(),events=body.events||[];
  const inserts=events.map(e=>env.DB.prepare('INSERT OR IGNORE INTO learner_mutation(id,user_id,device_id,type,payload_json,occurred_at,created_at) VALUES(?,?,?,?,?,?,?)').bind(e.id,user.id,e.deviceId,e.type,JSON.stringify(e.payload??null),e.at,now));
  const upsert=env.DB.prepare('INSERT INTO learner_state(user_id,snapshot_json,cursor,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET snapshot_json=excluded.snapshot_json,cursor=excluded.cursor,updated_at=excluded.updated_at').bind(user.id,JSON.stringify(merged),cursor,now);
  await env.DB.batch([...inserts,upsert]);
  return json({state:merged,cursor,acceptedIds:events.map(e=>e.id),updatedAt:now});
}

async function deleteSync(request:Request,env:Env,auth:ReturnType<typeof createAuth>){
  const user=await sessionUser(request,auth);if(!user)return bad('Unauthorized',401);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM learner_mutation WHERE user_id=?').bind(user.id),
    env.DB.prepare('DELETE FROM learner_state WHERE user_id=?').bind(user.id)
  ]);
  return new Response(null,{status:204});
}

export default {
  async fetch(request:Request,env:Env):Promise<Response>{
    const url=new URL(request.url),auth=createAuth(env);
    if(url.pathname.startsWith('/api/auth/'))return auth.handler(request);
    if(url.pathname==='/api/sync'){
      if(request.method==='GET')return getSync(request,env,auth);
      if(request.method==='POST')return postSync(request,env,auth);
      if(request.method==='DELETE')return deleteSync(request,env,auth);
      return bad('Method not allowed',405);
    }
    if(env.ASSETS)return env.ASSETS.fetch(request);
    return new Response('Not found',{status:404});
  }
};
