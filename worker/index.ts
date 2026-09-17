import {createAuth, type AuthEnv} from './auth';
import {deleteSync as deleteStoredSync,mergeAndWriteSync,readSync,validSyncBody} from './sync-store';

interface Env extends AuthEnv {
  ASSETS?: {fetch(request:Request):Promise<Response>};
}

const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
const bad=(message:string,status=400)=>json({error:message},status);

async function sessionUser(request:Request,auth:ReturnType<typeof createAuth>){
  const session=await auth.api.getSession({headers:request.headers});
  return session?.user||null;
}

async function getSync(request:Request,env:Env,auth:ReturnType<typeof createAuth>){
  const user=await sessionUser(request,auth);if(!user)return bad('Unauthorized',401);
  return json(await readSync(env.DB,user.id));
}

async function postSync(request:Request,env:Env,auth:ReturnType<typeof createAuth>){
  const user=await sessionUser(request,auth);if(!user)return bad('Unauthorized',401);
  let body:unknown;try{body=await request.json()}catch{return bad('Invalid JSON')}
  if(!validSyncBody(body))return bad('Invalid sync payload');
  try{return json(await mergeAndWriteSync(env.DB,user.id,body))}
  catch(error){if(error instanceof Error&&/Legacy raw data/.test(error.message))return bad(error.message);throw error}
}

async function deleteSync(request:Request,env:Env,auth:ReturnType<typeof createAuth>){
  const user=await sessionUser(request,auth);if(!user)return bad('Unauthorized',401);
  await deleteStoredSync(env.DB,user.id);
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
