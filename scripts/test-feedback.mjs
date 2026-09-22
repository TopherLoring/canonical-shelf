import {readFile} from 'node:fs/promises';
import {Miniflare} from 'miniflare';
import {validateFeedbackBody,writeFeedback} from '../worker/feedback-store.ts';

const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const mf=new Miniflare({modules:true,script:`export default {fetch(){return new Response('ok')}}`,d1Databases:['DB']});
try{
  const db=await mf.getD1Database('DB');
  for(const path of ['worker/migrations/0002_feedback.sql','worker/migrations/0003_theologian_feedback_context.sql']){
    const migration=(await readFile(path,'utf8')).replace(/\s+/g,' ').trim();
    await db.exec(migration);
  }
  const valid={category:'product',message:'The feedback button works from this route.',contact:'reader@example.com',route:'/course?unit=unit.start',clientCreatedAt:'2026-09-19T12:00:00.000Z'};
  assert(validateFeedbackBody(valid),'valid feedback payload was rejected');
  assert(!validateFeedbackBody({...valid,message:'x'}),'too-short feedback was accepted');
  assert(!validateFeedbackBody({...valid,category:'admin'}),'unknown feedback category was accepted');
  assert(!validateFeedbackBody({...valid,route:'https://example.com'}),'external route was accepted');
  const saved=await writeFeedback(db,valid,null,'2026-09-19T12:01:00.000Z');
  assert(saved.id&&saved.createdAt,'feedback persistence did not return identity');
  const row=await db.prepare('SELECT category,message,contact,route,user_id,review_reason,context_json FROM feedback WHERE id=?').bind(saved.id).first();
  assert(row?.category==='product','feedback category not persisted');
  assert(row?.message===valid.message,'feedback message not persisted');
  assert(row?.route===valid.route,'feedback route not persisted');
  assert(row?.user_id===null,'anonymous feedback unexpectedly gained user identity');
  assert(row?.review_reason===null&&row?.context_json===null,'ordinary feedback unexpectedly gained Theologian context');

  const review={
    category:'theology',
    message:'This answer sounds more certain than the evidence shown.',
    route:'/bible?book=45&chapter=1',
    reviewReason:'too-certain',
    clientCreatedAt:'2026-09-22T21:00:00.000Z',
    context:{
      kind:'theologian-response',
      action:'flag',
      question:'How should I understand Romans 1?',
      answer:'Canonical Shelf distinguishes the text from later interpretations.',
      mode:'cloud',
      model:'@cf/qwen/qwen3-30b-a3b-fp8',
      policyVersion:4,
      validationStatus:'passed',
      evidence:[{label:'Romans 1:26–27',href:'/bible?book=45&chapter=1#v26',evidenceStatus:'direct',claimDomain:'biblical-text',doctrinalStatus:'descriptive-only',limits:'The passage still requires interpretation.'}]
    }
  };
  assert(validateFeedbackBody(review),'valid Theologian review payload was rejected');
  assert(!validateFeedbackBody({...review,category:'product'}),'Theologian review escaped theology category');
  assert(!validateFeedbackBody({...review,reviewReason:'agree'}),'unknown review reason was accepted');
  assert(!validateFeedbackBody({...review,context:{...review.context,answer:'x'.repeat(9001)}}),'oversized Theologian answer was accepted');
  assert(!validateFeedbackBody({...review,context:{...review.context,history:['private prior turn']}}),'unexpected private history should not be relied upon by the schema');
  const reviewSaved=await writeFeedback(db,review,null,'2026-09-22T21:01:00.000Z');
  const reviewRow=await db.prepare('SELECT category,message,route,review_reason,context_json FROM feedback WHERE id=?').bind(reviewSaved.id).first();
  assert(reviewRow?.review_reason==='too-certain','review reason not persisted');
  const parsed=JSON.parse(String(reviewRow?.context_json||'{}'));
  assert(parsed.kind==='theologian-response'&&parsed.action==='flag','review context identity not persisted');
  assert(parsed.question===review.context.question&&parsed.answer===review.context.answer,'question/answer review context not persisted');
  assert(!('history' in parsed),'unrelated conversation history was persisted');
  console.log('v7 feedback validation/persistence/privacy + bounded Theologian response review gates passed');
}finally{await mf.dispose()}
