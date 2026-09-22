import {readFile} from 'node:fs/promises';
import {Miniflare} from 'miniflare';
import {anonymousFeedbackKey,normalizeFeedbackBody,pruneFeedbackData,readFeedbackInbox,respondToFeedback,validateFeedbackBody,writeFeedback} from '../worker/feedback-store.ts';

const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const mf=new Miniflare({modules:true,script:`export default {fetch(){return new Response('ok')}}`,d1Databases:['DB']});
try{
  const db=await mf.getD1Database('DB');
  for(const path of ['worker/migrations/0002_feedback.sql','worker/migrations/0003_theologian_feedback_context.sql','worker/migrations/0004_feedback_reply_routing.sql']){
    const migration=(await readFile(path,'utf8')).replace(/\s+/g,' ').trim();
    await db.exec(migration);
  }
  const valid={category:'product',message:'The feedback button works from this route.',contact:'reader@example.com',route:'/course?unit=unit.start',clientCreatedAt:'2026-09-19T12:00:00.000Z'};
  assert(validateFeedbackBody(valid),'valid feedback payload was rejected');
  assert(validateFeedbackBody({...valid,message:''}),'blank optional feedback text was rejected');
  assert(validateFeedbackBody({...valid,message:'x'}),'short feedback was rejected');
  assert(validateFeedbackBody({...valid,category:'something-new'}),'unknown category was rejected');
  assert(validateFeedbackBody({...valid,route:'https://example.com'}),'unexpected route format should be normalized rather than rejected');
  const normalized=normalizeFeedbackBody({...valid,category:'something-new',route:'https://example.com'});
  assert(normalized?.category==='something-new','custom category was not preserved');
  assert(normalized?.route==='/','unsafe route was not normalized');

  const anonymousId='cfb_test_browser_identifier_1234567890';
  const anonymousKey=await anonymousFeedbackKey(anonymousId);
  assert(anonymousKey&&anonymousKey!==anonymousId&&anonymousKey.length===64,'anonymous browser identifier was not one-way hashed');
  const saved=await writeFeedback(db,valid,null,anonymousId,'2026-09-19T12:01:00.000Z');
  assert(saved.id&&saved.createdAt&&saved.status==='new','feedback persistence did not return identity/status');
  const row=await db.prepare('SELECT category,message,contact,route,user_id,review_reason,context_json,anonymous_key,status FROM feedback WHERE id=?').bind(saved.id).first();
  assert(row?.category==='product','feedback category not persisted');
  assert(row?.message===valid.message,'feedback message not persisted');
  assert(row?.route===valid.route,'feedback route not persisted');
  assert(row?.user_id===null,'anonymous feedback unexpectedly gained user identity');
  assert(row?.anonymous_key===anonymousKey,'hashed anonymous routing key not persisted');
  assert(row?.anonymous_key!==anonymousId,'raw anonymous browser identifier was persisted');
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
  assert(validateFeedbackBody({...review,category:'product'}),'custom review category was rejected');
  assert(validateFeedbackBody({...review,reviewReason:'my-own-reason'}),'custom review reason was rejected');
  assert(validateFeedbackBody({...review,message:''}),'review without explanation was rejected');
  const oversized=normalizeFeedbackBody({...review,context:{...review.context,answer:'x'.repeat(12000),history:['private prior turn']}});
  assert(oversized?.context?.answer.length===9000,'oversized response context was not safely clipped');
  assert(!('history' in (oversized?.context||{})),'unexpected private history survived normalization');

  const reviewSaved=await writeFeedback(db,review,null,anonymousId,'2026-09-22T21:01:00.000Z');
  const reviewRow=await db.prepare('SELECT category,message,route,review_reason,context_json FROM feedback WHERE id=?').bind(reviewSaved.id).first();
  assert(reviewRow?.review_reason==='too-certain','review reason not persisted');
  const parsed=JSON.parse(String(reviewRow?.context_json||'{}'));
  assert(parsed.kind==='theologian-response'&&parsed.action==='flag','review context identity not persisted');
  assert(parsed.question===review.context.question&&parsed.answer===review.context.answer,'question/answer review context not persisted');
  assert(!('history' in parsed),'unrelated conversation history was persisted');

  const initialInbox=await readFeedbackInbox(db,null,anonymousId);
  assert(initialInbox.some(item=>item.id===reviewSaved.id&&item.status==='new'),'anonymous learner could not retrieve own review');
  assert((await readFeedbackInbox(db,null,'cfb_different_browser_identifier_123456')).length===0,'another browser could read anonymous feedback');
  const response=await respondToFeedback(db,reviewSaved.id,'Thank you. We reviewed the response and updated the interpretation guidance.','responded','2026-09-22T22:00:00.000Z');
  assert(response.ok,'reviewer response could not be stored');
  const repliedInbox=await readFeedbackInbox(db,null,anonymousId);
  const replied=repliedInbox.find(item=>item.id===reviewSaved.id);
  assert(replied?.status==='responded','review status was not routed to learner');
  assert(replied?.reviewerResponse?.includes('updated the interpretation'),'reviewer response was not routed to learner');
  assert(replied?.respondedAt==='2026-09-22T22:00:00.000Z','response timestamp missing');

  const recentResolved=await writeFeedback(db,{...valid,message:'Recent resolved record',contact:'keep-until-cutoff@example.com'},null,anonymousId,'2026-01-01T00:00:00.000Z');
  await respondToFeedback(db,recentResolved.id,'Resolved response','responded','2026-05-01T00:00:00.000Z');
  const oldResolved=await writeFeedback(db,{...valid,message:'Old resolved record'},null,anonymousId,'2024-01-01T00:00:00.000Z');
  await respondToFeedback(db,oldResolved.id,'Old response','responded','2024-02-01T00:00:00.000Z');
  const oldOpen=await writeFeedback(db,{...valid,message:'Old unresolved record'},null,anonymousId,'2024-01-01T00:00:00.000Z');
  await pruneFeedbackData(db,new Date('2026-09-22T23:00:00.000Z'));
  const recentResolvedRow=await db.prepare('SELECT contact FROM feedback WHERE id=?').bind(recentResolved.id).first();
  assert(recentResolvedRow&&recentResolvedRow.contact===null,'optional contact was not removed after 90-day resolved cutoff');
  assert(!(await db.prepare('SELECT id FROM feedback WHERE id=?').bind(oldResolved.id).first()),'resolved feedback older than 12 months was retained');
  assert(!(await db.prepare('SELECT id FROM feedback WHERE id=?').bind(oldOpen.id).first()),'unresolved feedback older than 24 months was retained');

  console.log('v7 feedback accept-and-normalize + privacy + bounded review + pseudonymous reply routing + retention enforcement gates passed');
}finally{await mf.dispose()}
