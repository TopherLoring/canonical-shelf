type D1StatementLike={bind(...values:unknown[]):D1StatementLike;run():Promise<unknown>};
type D1Like={prepare(sql:string):D1StatementLike};

const CATEGORIES=new Set(['product','content','theology','bug','accessibility','other']);
const REVIEW_REASONS=new Set(['incorrect-claim','source-problem','missing-viewpoint','translation-issue','interpretive-disagreement','too-certain','other']);
const REVIEW_ACTIONS=new Set(['flag','disagree']);

type TheologianEvidence={label?:string;href?:string;evidenceStatus?:string;claimDomain?:string;doctrinalStatus?:string;limits?:string};
export type TheologianFeedbackContext={
  kind:'theologian-response';
  action:'flag'|'disagree';
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

const textWithin=(value:unknown,max:number)=>value===undefined||(typeof value==='string'&&value.length<=max);
function validTheologianContext(value:unknown):value is TheologianFeedbackContext{
  if(!value||typeof value!=='object')return false;
  const x=value as TheologianFeedbackContext;
  if(x.kind!=='theologian-response'||!REVIEW_ACTIONS.has(String(x.action||'')))return false;
  if(typeof x.question!=='string'||x.question.trim().length<2||x.question.length>1600)return false;
  if(typeof x.answer!=='string'||x.answer.trim().length<2||x.answer.length>9000)return false;
  if(!textWithin(x.mode,32)||!textWithin(x.model,160)||!textWithin(x.validationStatus,32))return false;
  if(x.policyVersion!==undefined&&typeof x.policyVersion!=='string'&&typeof x.policyVersion!=='number')return false;
  if(typeof x.policyVersion==='string'&&x.policyVersion.length>32)return false;
  if(x.evidence!==undefined){
    if(!Array.isArray(x.evidence)||x.evidence.length>8)return false;
    for(const item of x.evidence){
      if(!item||typeof item!=='object')return false;
      if(!textWithin(item.label,220)||!textWithin(item.href,700)||!textWithin(item.evidenceStatus,40)||!textWithin(item.claimDomain,40)||!textWithin(item.doctrinalStatus,40)||!textWithin(item.limits,700))return false;
    }
  }
  return true;
}

export function validateFeedbackBody(body:unknown):body is FeedbackBody{
  if(!body||typeof body!=='object')return false;
  const x=body as FeedbackBody;
  const base=CATEGORIES.has(String(x.category||''))&&
    typeof x.message==='string'&&x.message.trim().length>=5&&x.message.trim().length<=4000&&
    (x.contact===undefined||(typeof x.contact==='string'&&x.contact.length<=320))&&
    typeof x.route==='string'&&x.route.length>=1&&x.route.length<=512&&x.route.startsWith('/')&&
    (x.clientCreatedAt===undefined||(typeof x.clientCreatedAt==='string'&&x.clientCreatedAt.length<=64));
  if(!base)return false;
  if(x.context===undefined)return x.reviewReason===undefined;
  return x.category==='theology'&&validTheologianContext(x.context)&&REVIEW_REASONS.has(String(x.reviewReason||''));
}

export async function writeFeedback(db:D1Like,body:FeedbackBody,userId:string|null,now=new Date().toISOString()){
  const id=crypto.randomUUID();
  const contextJson=body.context?JSON.stringify(body.context):null;
  await db.prepare('INSERT INTO feedback(id,user_id,category,message,contact,route,client_created_at,created_at,review_reason,context_json) VALUES(?,?,?,?,?,?,?,?,?,?)')
    .bind(id,userId,body.category,body.message.trim(),body.contact?.trim()||null,body.route,body.clientCreatedAt||null,now,body.reviewReason||null,contextJson)
    .run();
  return {id,createdAt:now};
}
