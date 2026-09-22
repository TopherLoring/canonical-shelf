type D1StatementLike={bind(...values:unknown[]):D1StatementLike;run():Promise<unknown>;first<T=Record<string,unknown>>():Promise<T|null>;all<T=Record<string,unknown>>():Promise<{results?:T[]}>};
type D1Like={prepare(sql:string):D1StatementLike};

type TheologianEvidence={label?:string;href?:string;evidenceStatus?:string;claimDomain?:string;doctrinalStatus?:string;limits?:string};
export type TheologianFeedbackContext={
  kind:'theologian-response';
  action:string;
  question:string;
  answer:string;
  mode?:string;
  model?:string;
  policyVersion?:string|number;
  validationStatus?:string;
  evidence?:TheologianEvidence[];
};
export type FeedbackBody={
  category:string;
  message:string;
  contact?:string;
  route:string;
  clientCreatedAt?:string;
  reviewReason?:string;
  context?:TheologianFeedbackContext;
};

const clip=(value:unknown,max:number)=>String(value??'').replace(/\u0000/g,'').trim().slice(0,max);
function normalizeTheologianContext(value:unknown):TheologianFeedbackContext|undefined{
  if(!value||typeof value!=='object')return undefined;
  const x=value as Record<string,unknown>;
  const question=clip(x.question,1600),answer=clip(x.answer,9000);
  if(!question&&!answer)return undefined;
  const evidence=Array.isArray(x.evidence)?x.evidence.slice(0,8).map(raw=>{
    const item=(raw&&typeof raw==='object'?raw:{}) as Record<string,unknown>;
    return {
      label:clip(item.label,220),href:clip(item.href,700),evidenceStatus:clip(item.evidenceStatus,40),claimDomain:clip(item.claimDomain,40),doctrinalStatus:clip(item.doctrinalStatus,40),limits:clip(item.limits,700)
    };
  }):[];
  const policyRaw=x.policyVersion;
  const policyVersion=typeof policyRaw==='number'&&Number.isFinite(policyRaw)?policyRaw:clip(policyRaw,32);
  return {
    kind:'theologian-response',action:clip(x.action,32)||'review',question,answer,
    mode:clip(x.mode,32),model:clip(x.model,160),policyVersion,validationStatus:clip(x.validationStatus,32),evidence
  };
}

export function normalizeFeedbackBody(body:unknown):FeedbackBody|null{
  if(!body||typeof body!=='object'||Array.isArray(body))return null;
  const x=body as Record<string,unknown>;
  const routeRaw=clip(x.route,512);
  const route=routeRaw.startsWith('/')?routeRaw:'/';
  const context=normalizeTheologianContext(x.context);
  return {
    category:clip(x.category,64)||'other',
    message:clip(x.message,4000),
    contact:clip(x.contact,320)||undefined,
    route,
    clientCreatedAt:clip(x.clientCreatedAt,64)||undefined,
    reviewReason:clip(x.reviewReason,120)||undefined,
    context
  };
}

export function validateFeedbackBody(body:unknown):body is FeedbackBody{
  return normalizeFeedbackBody(body)!==null;
}

const safeToken=(value:unknown)=>{
  const token=clip(value,180);
  return token.length>=24&&/^[A-Za-z0-9_-]+$/.test(token)?token:'';
};
export async function anonymousFeedbackKey(token:unknown){
  const value=safeToken(token);if(!value)return null;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

export async function writeFeedback(db:D1Like,body:FeedbackBody,userId:string|null,anonymousToken:string|null=null,now=new Date().toISOString()){
  const normalized=normalizeFeedbackBody(body)||{category:'other',message:'',route:'/'};
  const id=crypto.randomUUID(),anonymousKey=await anonymousFeedbackKey(anonymousToken);
  const contextJson=normalized.context?JSON.stringify(normalized.context):null;
  await db.prepare('INSERT INTO feedback(id,user_id,category,message,contact,route,client_created_at,created_at,review_reason,context_json,anonymous_key,status,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(id,userId,normalized.category,normalized.message,normalized.contact||null,normalized.route,normalized.clientCreatedAt||null,now,normalized.reviewReason||null,contextJson,anonymousKey,'new',now)
    .run();
  return {id,createdAt:now,status:'new'};
}

export async function readFeedbackInbox(db:D1Like,userId:string|null,anonymousToken:string|null){
  const anonymousKey=await anonymousFeedbackKey(anonymousToken);
  if(!userId&&!anonymousKey)return [];
  const fields='id,category,message,route,review_reason,status,reviewer_response,responded_at,created_at,updated_at';
  let statement:D1StatementLike;
  if(userId&&anonymousKey)statement=db.prepare(`SELECT ${fields} FROM feedback WHERE user_id=? OR anonymous_key=? ORDER BY created_at DESC LIMIT 50`).bind(userId,anonymousKey);
  else if(userId)statement=db.prepare(`SELECT ${fields} FROM feedback WHERE user_id=? ORDER BY created_at DESC LIMIT 50`).bind(userId);
  else statement=db.prepare(`SELECT ${fields} FROM feedback WHERE anonymous_key=? ORDER BY created_at DESC LIMIT 50`).bind(anonymousKey);
  const result=await statement.all<Record<string,unknown>>();
  return (result.results||[]).map(row=>({
    id:String(row.id||''),category:String(row.category||'other'),message:String(row.message||''),route:String(row.route||'/'),reviewReason:row.review_reason?String(row.review_reason):null,
    status:String(row.status||'new'),reviewerResponse:row.reviewer_response?String(row.reviewer_response):null,respondedAt:row.responded_at?String(row.responded_at):null,
    createdAt:String(row.created_at||''),updatedAt:row.updated_at?String(row.updated_at):String(row.created_at||'')
  }));
}

export async function respondToFeedback(db:D1Like,feedbackId:unknown,response:unknown,status:unknown='responded',now=new Date().toISOString()){
  const id=clip(feedbackId,80),message=clip(response,6000),nextStatus=clip(status,40)||'responded';
  if(!id)return {ok:false,reason:'missing-id'};
  const existing=await db.prepare('SELECT id FROM feedback WHERE id=?').bind(id).first();
  if(!existing)return {ok:false,reason:'not-found'};
  await db.prepare('UPDATE feedback SET reviewer_response=?, status=?, responded_at=?, updated_at=? WHERE id=?')
    .bind(message,nextStatus,now,now,id).run();
  return {ok:true,id,status:nextStatus,respondedAt:now};
}
