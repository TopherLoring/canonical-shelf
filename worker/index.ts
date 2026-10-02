import {createAuth, type AuthEnv} from './auth';
import {deleteSync as deleteStoredSync,mergeAndWriteSync,readSync,validSyncBody} from './sync-store';
import {feedbackProblem,pruneFeedbackData,readFeedbackAdminQueue,readFeedbackInbox,respondToFeedback,writeFeedback} from './feedback-store';
import {postTheologian,type TheologianAiEnv} from './theologian-ai';
import {maybeTheologianCrisisResponse} from './theologian-crisis';

interface Env extends AuthEnv,TheologianAiEnv {ASSETS?:{fetch(request:Request):Promise<Response>};RELEASE_SHA?:string;CANONICAL_ORIGIN?:string;FEEDBACK_ADMIN_TOKEN?:string}
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const json=(value:unknown,status=200,extra:Record<string,string>={})=>new Response(JSON.stringify(value),{status,headers:{...headers,...extra}});
const bad=(message:string,status=400)=>json({error:message},status);
const feedbackToken=(request:Request)=>request.headers.get('x-canonical-feedback-id')||'';
const ADMIN_COOKIE='canonical_feedback_admin';

async function sessionUser(request:Request,auth:ReturnType<typeof createAuth>){try{const session=await auth.api.getSession({headers:request.headers});return session?.user||null}catch{return null}}
async function getSync(request:Request,env:Env,auth:ReturnType<typeof createAuth>){const user=await sessionUser(request,auth);if(!user)return bad('Unauthorized',401);return json(await readSync(env.DB,user.id))}
async function postSync(request:Request,env:Env,auth:ReturnType<typeof createAuth>){const user=await sessionUser(request,auth);if(!user)return bad('Unauthorized',401);let body:unknown;try{body=await request.json()}catch{return bad('Invalid JSON')}if(!validSyncBody(body))return bad('Invalid sync payload');try{return json(await mergeAndWriteSync(env.DB,user.id,body))}catch(error){if(error instanceof Error&&/Legacy raw data/.test(error.message))return bad(error.message);throw error}}
async function deleteSync(request:Request,env:Env,auth:ReturnType<typeof createAuth>){const user=await sessionUser(request,auth);if(!user)return bad('Unauthorized',401);await deleteStoredSync(env.DB,user.id);return new Response(null,{status:204})}

async function postFeedback(request:Request,env:Env,auth:ReturnType<typeof createAuth>){
  let body:unknown;try{body=await request.json()}catch{return bad('Invalid JSON')}
  const problem=feedbackProblem(body);if(problem)return bad(problem);
  await pruneFeedbackData(env.DB);
  const user=await sessionUser(request,auth),result=await writeFeedback(env.DB,body,user?.id||null,feedbackToken(request));
  return json({ok:true,...result},201);
}
async function getFeedbackInbox(request:Request,env:Env,auth:ReturnType<typeof createAuth>){
  await pruneFeedbackData(env.DB);const user=await sessionUser(request,auth),items=await readFeedbackInbox(env.DB,user?.id||null,feedbackToken(request));return json({items});
}
function cookieValue(request:Request,name:string){const raw=request.headers.get('cookie')||'';for(const part of raw.split(';')){const [key,...rest]=part.trim().split('=');if(key===name){try{return decodeURIComponent(rest.join('='))}catch{return ''}}}return ''}
function adminAuthorized(request:Request,env:Env){const configured=String(env.FEEDBACK_ADMIN_TOKEN||'');if(!configured)return false;const bearer=(request.headers.get('authorization')||'')===`Bearer ${configured}`;return bearer||cookieValue(request,ADMIN_COOKIE)===configured}
function sameOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin}
async function adminSession(request:Request,env:Env){
  if(request.method==='GET')return adminAuthorized(request,env)?json({ok:true}):bad('Unauthorized',401);
  if(request.method==='DELETE')return json({ok:true},200,{'set-cookie':`${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`});
  if(request.method!=='POST')return bad('Method not allowed',405);
  if(!sameOrigin(request))return bad('Forbidden',403);
  let body:any;try{body=await request.json()}catch{return bad('Invalid JSON')}
  const configured=String(env.FEEDBACK_ADMIN_TOKEN||'');if(!configured||String(body?.token||'')!==configured)return bad('Unauthorized',401);
  return json({ok:true},200,{'set-cookie':`${ADMIN_COOKIE}=${encodeURIComponent(configured)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`});
}
async function getAdminFeedback(request:Request,env:Env){
  if(!adminAuthorized(request,env))return bad('Unauthorized',401);await pruneFeedbackData(env.DB);
  const url=new URL(request.url),items=await readFeedbackAdminQueue(env.DB,{status:url.searchParams.get('status')||'',limit:Number(url.searchParams.get('limit')||100)});return json({items});
}
async function postAdminFeedbackResponse(request:Request,env:Env){
  if(!adminAuthorized(request,env))return bad('Unauthorized',401);if(!sameOrigin(request))return bad('Forbidden',403);let body:any;try{body=await request.json()}catch{return bad('Invalid JSON')}
  await pruneFeedbackData(env.DB);const result=await respondToFeedback(env.DB,body?.feedbackId,body?.response,body?.status||'responded');
  if(!result.ok)return bad(result.reason==='not-found'?'Feedback not found':result.reason==='invalid-status'?'Invalid feedback status':'Feedback id is required',result.reason==='not-found'?404:400);return json(result);
}
function health(env:Env){return json({ok:true,service:'the-canonical-shelf',release:env.RELEASE_SHA||null,origin:env.CANONICAL_ORIGIN||null,bindings:{assets:!!env.ASSETS,db:!!env.DB,ai:!!env.AI}})}
async function adminDashboard(request:Request,env:Env){if(!env.ASSETS)return new Response('Not found',{status:404});const assetUrl=new URL('/admin-feedback',request.url);const response=await env.ASSETS.fetch(new Request(assetUrl,{method:'GET',headers:request.headers}));const out=new Response(response.body,response);out.headers.set('cache-control','no-store');out.headers.set('x-robots-tag','noindex, nofollow, noarchive');return out}

export default {async fetch(request:Request,env:Env):Promise<Response>{
  const url=new URL(request.url),auth=createAuth(env);
  if(url.pathname==='/api/health'){if(request.method!=='GET')return bad('Method not allowed',405);return health(env)}
  if(url.pathname.startsWith('/api/auth/'))return auth.handler(request);
  if(url.pathname==='/api/sync'){
    if(request.method==='GET')return getSync(request,env,auth);if(request.method==='POST')return postSync(request,env,auth);if(request.method==='DELETE')return deleteSync(request,env,auth);return bad('Method not allowed',405);
  }
  if(url.pathname==='/api/feedback'){
    if(request.method==='GET')return getFeedbackInbox(request,env,auth);if(request.method==='POST')return postFeedback(request,env,auth);return bad('Method not allowed',405);
  }
  if(url.pathname==='/api/admin/session')return adminSession(request,env);
  if(url.pathname==='/api/admin/feedback'){
    if(request.method==='GET')return getAdminFeedback(request,env);return bad('Method not allowed',405);
  }
  if(url.pathname==='/api/admin/feedback/respond'){
    if(request.method==='POST')return postAdminFeedbackResponse(request,env);return bad('Method not allowed',405);
  }
  if(url.pathname==='/admin/feedback'||url.pathname==='/admin/feedback/')return adminDashboard(request,env);
  if(url.pathname==='/api/theologian'){
    const crisis=await maybeTheologianCrisisResponse(request.clone());if(crisis)return crisis;return postTheologian(request,env);
  }
  if(env.ASSETS)return env.ASSETS.fetch(request);return new Response('Not found',{status:404});
}};
