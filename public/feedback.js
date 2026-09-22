const openButton=document.querySelector('#feedback-open');
const panel=document.querySelector('#feedback-panel');
const closeButton=document.querySelector('#feedback-close');
const form=document.querySelector('#feedback-form');
const status=document.querySelector('#feedback-status');
const contextPreview=document.querySelector('#feedback-context-preview');
const reasonRow=document.querySelector('#feedback-review-reason-row');
const reasonSelect=form?.querySelector('[name="reviewReason"]');
const categorySelect=form?.querySelector('[name="category"]');
const messageInput=form?.querySelector('[name="message"]');
const QUEUE_KEY='canonical-shelf-feedback-queue-v1';
let lastTrigger=openButton,pendingContext=null;

const readQueue=()=>{try{const value=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}};
const writeQueue=items=>localStorage.setItem(QUEUE_KEY,JSON.stringify(items));
const routeContext=()=>`${location.pathname}${location.search}`.slice(0,512);
const clip=(value,max)=>String(value??'').trim().slice(0,max);

function feedbackTriggers(){return [openButton,...document.querySelectorAll('[data-feedback-open]')].filter(Boolean)}
function resetReviewContext(){
  pendingContext=null;
  if(contextPreview){contextPreview.hidden=true;contextPreview.textContent=''}
  if(reasonRow)reasonRow.hidden=true;
  if(reasonSelect)reasonSelect.required=false;
  if(messageInput)messageInput.placeholder='What happened, what were you trying to do, or what should change?';
}
function normalizeEvidence(items){
  return Array.isArray(items)?items.slice(0,8).map(item=>({
    label:clip(item?.label,220),href:clip(item?.href,700),evidenceStatus:clip(item?.evidenceStatus,40),claimDomain:clip(item?.claimDomain,40),doctrinalStatus:clip(item?.doctrinalStatus,40),limits:clip(item?.limits,700)
  })):[];
}
function setReviewContext(detail){
  if(!detail||detail.kind!=='theologian-response')return false;
  pendingContext={
    kind:'theologian-response',action:clip(detail.action,32)||'review',
    question:clip(detail.question,1600),answer:clip(detail.answer,9000),mode:clip(detail.mode,32),model:clip(detail.model,160),
    policyVersion:typeof detail.policyVersion==='number'?detail.policyVersion:clip(detail.policyVersion,32),
    validationStatus:clip(detail.validationStatus,32),evidence:normalizeEvidence(detail.evidence)
  };
  if(categorySelect)categorySelect.value='theology';
  if(reasonRow)reasonRow.hidden=false;
  if(reasonSelect){reasonSelect.required=false;reasonSelect.value=detail.action==='disagree'?'interpretive-disagreement':'incorrect-claim'}
  if(contextPreview){
    contextPreview.hidden=false;
    contextPreview.textContent=detail.action==='disagree'?'Your disagreement will include the specific Theologian question, answer, and visible evidence metadata for review.':'This review request will include the specific Theologian question, answer, and visible evidence metadata.';
  }
  if(messageInput)messageInput.placeholder=detail.action==='disagree'?'Optional: add the interpretation, evidence, or perspective you want considered.':'Optional: add what seems incorrect, unsupported, incomplete, or too certain.';
  return true;
}
function openPanel(trigger=openButton,reviewContext=null){
  lastTrigger=trigger||openButton;
  if(reviewContext){setReviewContext(reviewContext)}else resetReviewContext();
  panel.hidden=false;
  feedbackTriggers().forEach(button=>button.setAttribute('aria-expanded','true'));
  (pendingContext?reasonSelect:form?.querySelector('select,textarea,input'))?.focus({preventScroll:true});
}

function closePanel(){
  panel.hidden=true;
  feedbackTriggers().forEach(button=>button.setAttribute('aria-expanded','false'));
  (lastTrigger?.isConnected?lastTrigger:openButton)?.focus({preventScroll:true});
}

async function send(payload){
  const response=await fetch('/api/feedback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  if(!response.ok){
    let message='Feedback could not be sent.';
    try{const body=await response.json();if(body?.error)message=body.error}catch{}
    throw new Error(message);
  }
  return response.json().catch(()=>({ok:true}));
}

async function flushQueue(){
  if(!navigator.onLine)return;
  const queue=readQueue();
  if(!queue.length)return;
  const remaining=[];
  for(const item of queue){
    try{await send(item)}catch{remaining.push(item)}
  }
  writeQueue(remaining);
}

form?.addEventListener('submit',async event=>{
  event.preventDefault();
  const data=new FormData(form);
  const wasReview=Boolean(pendingContext);
  const payload={
    category:pendingContext?'theology':String(data.get('category')||'other'),
    message:String(data.get('message')||'').trim(),
    contact:String(data.get('contact')||'').trim(),
    route:routeContext(),
    clientCreatedAt:new Date().toISOString(),
    ...(pendingContext?{reviewReason:String(data.get('reviewReason')||'').trim(),context:pendingContext}:{})
  };
  status.textContent='Sending…';
  try{
    await send(payload);
    form.reset();resetReviewContext();
    status.textContent=wasReview?'Thank you. Your review request was sent.':'Thank you. Your feedback was sent.';
  }catch{
    const queue=readQueue();
    queue.push(payload);
    writeQueue(queue.slice(-50));
    form.reset();resetReviewContext();
    status.textContent='The service is unavailable right now. Your feedback was saved on this device and will retry automatically.';
  }
});

openButton?.addEventListener('click',()=>openPanel(openButton));
document.addEventListener('click',event=>{const trigger=event.target.closest?.('[data-feedback-open]');if(trigger)openPanel(trigger)});
document.addEventListener('canonical-theologian-review',event=>openPanel(event.detail?.trigger||openButton,event.detail));
closeButton?.addEventListener('click',closePanel);
window.addEventListener('online',()=>flushQueue().catch(()=>{}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden)closePanel()});
setTimeout(()=>flushQueue().catch(()=>{}),600);
