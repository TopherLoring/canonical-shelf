type D1StatementLike={bind(...values:unknown[]):D1StatementLike;run():Promise<unknown>};
type D1Like={prepare(sql:string):D1StatementLike};

const CATEGORIES=new Set(['product','content','theology','bug','accessibility','other']);
export type FeedbackBody={category:string;message:string;contact?:string;route:string;clientCreatedAt?:string};

export function validateFeedbackBody(body:unknown):body is FeedbackBody{
  if(!body||typeof body!=='object')return false;
  const x=body as FeedbackBody;
  return CATEGORIES.has(String(x.category||''))&&
    typeof x.message==='string'&&x.message.trim().length>=5&&x.message.trim().length<=4000&&
    (x.contact===undefined||(typeof x.contact==='string'&&x.contact.length<=320))&&
    typeof x.route==='string'&&x.route.length>=1&&x.route.length<=512&&x.route.startsWith('/')&&
    (x.clientCreatedAt===undefined||(typeof x.clientCreatedAt==='string'&&x.clientCreatedAt.length<=64));
}

export async function writeFeedback(db:D1Like,body:FeedbackBody,userId:string|null,now=new Date().toISOString()){
  const id=crypto.randomUUID();
  await db.prepare('INSERT INTO feedback(id,user_id,category,message,contact,route,client_created_at,created_at) VALUES(?,?,?,?,?,?,?,?)')
    .bind(id,userId,body.category,body.message.trim(),body.contact?.trim()||null,body.route,body.clientCreatedAt||null,now)
    .run();
  return {id,createdAt:now};
}
