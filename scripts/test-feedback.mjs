import {readFile} from 'node:fs/promises';
import {Miniflare} from 'miniflare';
import {anonymousFeedbackKey,normalizeFeedbackBody,pruneFeedbackData,readFeedbackAdminQueue,readFeedbackInbox,respondToFeedback,validateFeedbackBody,writeFeedback} from '../worker/feedback-store.ts';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const mf=new Miniflare({modules:true,script:`export default {fetch(){return new Response('ok')}}`,d1Databases:['DB']});
try{
  const db=await mf.getD1Database('DB');
  for(const path of ['worker/migrations/0002_feedback.sql','worker/migrations/0003_theologian_feedback_context.sql','worker/migrations/0004_feedback_reply_routing.sql']){
    const migration=(await readFile(path,'utf8')).replace(/\s+/g,' ').trim();
    await db.exec(migration);
  }

  const base={category:'product',message:'A useful feedback message.',contact:'reader@example.com',route:'/course?unit=test',clientCreatedAt:'2026-09-19T12:00:00.000Z'};
  assert(validateFeedbackBody(base),'valid feedback payload was rejected');
  assert(validateFeedbackBody({...base,message:''}),'optional blank feedback text was rejected');
  assert(validateFeedbackBody({...base,message:'x'}),'short feedback was rejected');
  assert(validateFeedbackBody({...base,category:'custom-category'}),'custom category was rejected');

  const normalized=normalizeFeedbackBody({...base,category:'custom-category',route:'https://example.com'});
  assert(normalized?.category==='custom-category','custom category was not preserved');
  assert(normalized?.route?.startsWith('/'),'unsafe route was not normalized to a local route');

  const browserId='feedback-browser-test-identifier';
  const browserKey=await anonymousFeedbackKey(browserId);
  assert(browserKey&&browserKey!==browserId,'anonymous browser identifier was not transformed before persistence');

  const ordinary=await writeFeedback(db,base,null,browserId,'2026-09-19T12:01:00.000Z');
  assert(ordinary?.id,'ordinary feedback did not persist');
  const ownInbox=await readFeedbackInbox(db,null,browserId);
  assert(ownInbox.some(item=>item.id===ordinary.id),'originating browser cannot retrieve its feedback');
  const otherInbox=await readFeedbackInbox(db,null,'different-browser');
  assert(!otherInbox.some(item=>item.id===ordinary.id),'another browser can retrieve anonymous feedback it does not own');

  const review={
    category:'theology',message:'Please review this interpretation.',route:'/bible?book=45&chapter=1',reviewReason:'interpretive-disagreement',clientCreatedAt:'2026-09-22T21:00:00.000Z',
    context:{kind:'theologian-response',action:'flag',question:'How should I understand this passage?',answer:'A bounded answer.',mode:'cloud',model:'model-under-test',policyVersion:4,validationStatus:'passed',evidence:[{label:'Passage',href:'/bible?book=45&chapter=1',evidenceStatus:'direct',claimDomain:'biblical-text',doctrinalStatus:'descriptive-only',limits:'Interpretation remains necessary.'}]}
  };
  assert(validateFeedbackBody(review),'valid Theologian review payload was rejected');
  assert(validateFeedbackBody({...review,reviewReason:'custom-reason'}),'custom review reason was rejected');
  assert(validateFeedbackBody({...review,message:''}),'review without explanation was rejected');

  const oversized=normalizeFeedbackBody({...review,context:{...review.context,answer:'x'.repeat(20000),history:['private prior turn']}});
  assert(oversized?.context?.answer.length<20000,'oversized bounded context was not clipped');
  assert(!('history' in (oversized?.context||{})),'unrelated conversation history survived normalization');

  const reviewSaved=await writeFeedback(db,review,null,browserId,'2026-09-22T21:01:00.000Z');
  const queue=await readFeedbackAdminQueue(db,{status:'new'});
  const queued=queue.find(item=>item.id===reviewSaved.id);
  assert(queued,'reviewer queue cannot retrieve submitted review');
  assert(queued.context?.question===review.context.question,'bounded Theologian context was lost');
  assert(queued.hasAnonymousReplyRoute===true,'reviewer queue does not expose reply capability');
  assert(!('anonymousKey' in queued)&&!('anonymous_key' in queued),'reviewer-facing record exposes anonymous routing key');

  const replyText='Reviewed response';
  const response=await respondToFeedback(db,reviewSaved.id,replyText,'responded','2026-09-22T22:00:00.000Z');
  assert(response.ok,'reviewer response could not be stored');
  const replied=(await readFeedbackInbox(db,null,browserId)).find(item=>item.id===reviewSaved.id);
  assert(replied?.status==='responded','review status was not routed back to the learner');
  assert(replied?.reviewerResponse===replyText,'reviewer response was not routed back to the learner');

  // Retention must actually remove records that are clearly beyond any active retention window.
  const ancientOpen=await writeFeedback(db,{...base,message:'Ancient unresolved record'},null,browserId,'2010-01-01T00:00:00.000Z');
  const ancientResolved=await writeFeedback(db,{...base,message:'Ancient resolved record'},null,browserId,'2010-01-01T00:00:00.000Z');
  await respondToFeedback(db,ancientResolved.id,'Resolved','responded','2010-02-01T00:00:00.000Z');
  await pruneFeedbackData(db,new Date('2030-01-01T00:00:00.000Z'));
  const afterPrune=await readFeedbackInbox(db,null,browserId);
  assert(!afterPrune.some(item=>item.id===ancientOpen.id||item.id===ancientResolved.id),'retention pruning did not remove clearly expired feedback');

  console.log('PASS — feedback acceptance, normalization, bounded review context, anonymous reply routing, privacy, and retention behavior.');
}finally{await mf.dispose()}
