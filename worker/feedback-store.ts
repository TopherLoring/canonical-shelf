type D1StatementLike={bind(...values:unknown[]):D1StatementLike;run():Promise<unknown>};
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

export async function writeFeedback(db:D1Like,body:FeedbackBody,userId:string|null,now=new Date().toISOString()){
  const normalized=normalizeFeedbackBody(body)||{category:'other',message:'',route:'/'};
  const id=crypto.randomUUID();
  const contextJson=normalized.context?JSON.stringify(normalized.context):null;
  await db.prepare('INSERT INTO feedback(id,user_id,category,message,contact,route,client_created_at,created_at,review_reason,context_json) VALUES(?,?,?,?,?,?,?,?,?,?)')
    .bind(id,userId,normalized.category,normalized.message,normalized.contact||null,normalized.route,normalized.clientCreatedAt||null,now,normalized.reviewReason||null,contextJson)
    .run();
  return {id,createdAt:now};
}
