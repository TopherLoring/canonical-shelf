import {createAuth, type AuthEnv} from './auth';
import {deleteSync as deleteStoredSync,mergeAndWriteSync,readSync,validSyncBody} from './sync-store';
import {readFeedbackInbox,respondToFeedback,validateFeedbackBody,writeFeedback} from './feedback-store';
import {postTheologian,type TheologianAiEnv} from './theologian-ai';

interface Env extends AuthEnv,TheologianAiEnv {
  ASSETS?: {fetch(request:Request):Promise<Response>};
  RELEASE_SHA?: string;
  CANONICAL_ORIGIN?: string;
  FEEDBACK_ADMIN_TOKEN?: string;
}

const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
const bad=(message:string,status=400)=>json({error:message},status);
const feedbackToken=(request:Request)=>request.headers.get('x-canonical-feedback-id')||'';

async function sessionUser(request:Request,auth:ReturnType<typeof createAuth>){
  try{const session=await auth.api.getSession({headers:request.headers});return session?.user||null}catch{return null}
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

async function postFeedback(request:Request,env:Env,auth:ReturnType<typeof createAuth>){
  let body:unknown;try{body=await request.json()}catch{return bad('Invalid JSON')}
  if(!validateFeedbackBody(body))return bad('Invalid feedback payload');
  const user=await sessionUser(request,auth);
  const result=await writeFeedback(env.DB,body,user?.id||null,feedbackToken(request));
  return json({ok:true,...result},201);
}
async function getFeedbackInbox(request:Request,env:Env,auth:ReturnType<typeof createAuth>){
  const user=await sessionUser(request,auth);
  const items=await readFeedbackInbox(env.DB,user?.id||null,feedbackToken(request));
  return json({items});
}
function adminAuthorized(request:Request,env:Env){
  const configured=String(env.FEEDBACK_ADMIN_TOKEN||'');
  if(!configured)return false;
  const supplied=request.headers.get('authorization')||'';
  return supplied===`Bearer ${configured}`;
}
async function postAdminFeedbackResponse(request:Request,env:Env){
  if(!adminAuthorized(request,env))return bad('Unauthorized',401);
  let body:any;try{body=await request.json()}catch{return bad('Invalid JSON')}
  const result=await respondToFeedback(env.DB,body?.feedbackId,body?.response,body?.status||'responded');
  if(!result.ok)return bad(result.reason==='not-found'?'Feedback not found':'Feedback id is required',result.reason==='not-found'?404:400);
  return json(result);
}

function health(env:Env){
  return json({
    ok:true,
    service:'the-canonical-shelf',
    release:env.RELEASE_SHA||null,
    origin:env.CANONICAL_ORIGIN||null,
    bindings:{assets:!!env.ASSETS,db:!!env.DB,ai:!!env.AI}
  });
}

export default {
  async fetch(request:Request,env:Env):Promise<Response>{
    const url=new URL(request.url),auth=createAuth(env);
    if(url.pathname==='/api/health'){
      if(request.method!=='GET')return bad('Method not allowed',405);
      return health(env);
    }
    if(url.pathname.startsWith('/api/auth/'))return auth.handler(request);
    if(url.pathname==='/api/sync'){
      if(request.method==='GET')return getSync(request,env,auth);
      if(request.method==='POST')return postSync(request,env,auth);
      if(request.method==='DELETE')return deleteSync(request,env,auth);
      return bad('Method not allowed',405);
    }
    if(url.pathname==='/api/feedback'){
      if(request.method==='GET')return getFeedbackInbox(request,env,auth);
      if(request.method==='POST')return postFeedback(request,env,auth);
      return bad('Method not allowed',405);
    }
    if(url.pathname==='/api/admin/feedback/respond'){
      if(request.method==='POST')return postAdminFeedbackResponse(request,env);
      return bad('Method not allowed',405);
    }
    if(url.pathname==='/api/theologian')return postTheologian(request,env);
    if(env.ASSETS)return env.ASSETS.fetch(request);
    return new Response('Not found',{status:404});
  }
};
