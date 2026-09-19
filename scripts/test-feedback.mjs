import {readFile} from 'node:fs/promises';
import {Miniflare} from 'miniflare';
import {validateFeedbackBody,writeFeedback} from '../worker/feedback-store.ts';

const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const mf=new Miniflare({modules:true,script:`export default {fetch(){return new Response('ok')}}`,d1Databases:['DB']});
try{
  const db=await mf.getD1Database('DB');
  const migration=(await readFile('worker/migrations/0002_feedback.sql','utf8')).replace(/\s+/g,' ').trim();
  await db.exec(migration);
  const valid={category:'product',message:'The feedback button works from this route.',contact:'reader@example.com',route:'/course?unit=unit.start',clientCreatedAt:'2026-09-19T12:00:00.000Z'};
  assert(validateFeedbackBody(valid),'valid feedback payload was rejected');
  assert(!validateFeedbackBody({...valid,message:'x'}),'too-short feedback was accepted');
  assert(!validateFeedbackBody({...valid,category:'admin'}),'unknown feedback category was accepted');
  assert(!validateFeedbackBody({...valid,route:'https://example.com'}),'external route was accepted');
  const saved=await writeFeedback(db,valid,null,'2026-09-19T12:01:00.000Z');
  assert(saved.id&&saved.createdAt,'feedback persistence did not return identity');
  const row=await db.prepare('SELECT category,message,contact,route,user_id FROM feedback WHERE id=?').bind(saved.id).first();
  assert(row?.category==='product','feedback category not persisted');
  assert(row?.message===valid.message,'feedback message not persisted');
  assert(row?.route===valid.route,'feedback route not persisted');
  assert(row?.user_id===null,'anonymous feedback unexpectedly gained user identity');
  console.log('v7 feedback validation/persistence/privacy gates passed');
}finally{await mf.dispose()}
