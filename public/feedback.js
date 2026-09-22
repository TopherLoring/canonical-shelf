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
const inbox=document.querySelector('#feedback-inbox');
const inboxStatus=document.querySelector('#feedback-inbox-status');
const QUEUE_KEY='canonical-shelf-feedback-queue-v1';
const ANON_KEY='canonical-shelf-feedback-browser-id-v1';
let lastTrigger=openButton,pendingContext=null;

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readQueue=()=>{try{const value=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}};
const writeQueue=items=>{try{localStorage.setItem(QUEUE_KEY,JSON.stringify(items))}catch{}};
const routeContext=()=>`${location.pathname}${location.search}`.slice(0,512);
const clip=(value,max)=>String(value??'').trim().slice(0,max);
function feedbackId(){
  try{
    let id=localStorage.getItem(ANON_KEY)||'';
    if(!id){
      const random=crypto.randomUUID?.()||`${Date.now().toString(36)}_${Array.from(crypto.getRandomValues(new Uint32Array(4))).map(n=>n.toString(36)).join('_')}`;
      id=`cfb_${random}`;localStorage.setItem(ANON_KEY,id);
    }
    return id;
  }catch{return''}
}
const feedbackHeaders=(json=false)=>({...(json?{'content-type':'application/json'}:{}),...(feedbackId()?{'x-canonical-feedback-id':feedbackId()}:{})});

function feedbackTriggers(){return [openButton,...document.querySelectorAll('[data-feedback-open]')].filter(Boolean)}
function resetReviewContext(){
  pendingContext=null;
  if(contextPreview){contextPreview.hidden=true;contextPreview.textContent=''}
  if(reasonRow)reasonRow.hidden=true;
  if(reasonSelect)reasonSelect.required=false;
  if(messageInput)messageInput.placeholder='Add as much or as little detail as you want.';
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
function inboxMarkup(items){
  if(!items.length)return '<p class="meta">No feedback or review threads are linked to this browser yet.</p>';
  return items.map(item=>{
    const response=item.reviewerResponse?`<div class="feedback-thread__response"><strong>Canonical Shelf response</strong><p>${esc(item.reviewerResponse)}</p>${item.respondedAt?`<small>${esc(new Date(item.respondedAt).toLocaleString())}</small>`:''}</div>`:'';
    const message=item.message?`<p>${esc(item.message)}</p>`:'<p class="meta">Submitted without additional written detail.</p>';
    return `<article class="feedback-thread"><div class="feedback-thread__head"><strong>${esc(item.reviewReason?'Theologian review':'Feedback')}</strong><span>${esc(item.status||'new')}</span></div>${message}<small>${esc(item.route||'/')} · ${esc(item.createdAt?new Date(item.createdAt).toLocaleString():'')}</small>${response}</article>`;
  }).join('');
}
async function loadInbox(){
  if(!inbox)return;
  if(inboxStatus)inboxStatus.textContent='Checking for replies…';
  try{
    const response=await fetch('/api/feedback',{headers:feedbackHeaders()});
    if(!response.ok)throw new Error(`Inbox unavailable (${response.status})`);
    const body=await response.json();
    inbox.innerHTML=inboxMarkup(Array.isArray(body?.items)?body.items:[]);
    if(inboxStatus)inboxStatus.textContent='';
  }catch{
    if(inboxStatus)inboxStatus.textContent=navigator.onLine?'Replies are temporarily unavailable.':'Replies will refresh when you are online.';
  }
}
function openPanel(trigger=openButton,reviewContext=null){
  lastTrigger=trigger||openButton;
  if(reviewContext){setReviewContext(reviewContext)}else resetReviewContext();
  panel.hidden=false;
  feedbackTriggers().forEach(button=>button.setAttribute('aria-expanded','true'));
  void loadInbox();
  (pendingContext?reasonSelect:form?.querySelector('select,textarea,input'))?.focus({preventScroll:true});
}

function closePanel(){
  panel.hidden=true;
  feedbackTriggers().forEach(button=>button.setAttribute('aria-expanded','false'));
  (lastTrigger?.isConnected?lastTrigger:openButton)?.focus({preventScroll:true});
}

async function send(payload){
  const response=await fetch('/api/feedback',{method:'POST',headers:feedbackHeaders(true),body:JSON.stringify(payload)});
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
  if(remaining.length!==queue.length)void loadInbox();
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
    status.textContent=wasReview?'Thank you. Your review request was sent. A response can return here without identifying you.':'Thank you. Your feedback was sent. A response can return here without identifying you.';
    void loadInbox();
  }catch{
    const queue=readQueue();
    queue.push(payload);
    writeQueue(queue.slice(-50));
    form.reset();resetReviewContext();
    status.textContent='The service is unavailable right now. Your feedback was saved on this device and will retry automatically.';
  }
});

openButton?.addEventListener('click',()=>openPanel(openButton));
document.addEventListener('click',event=>{
  const trigger=event.target.closest?.('[data-feedback-open]');if(trigger){openPanel(trigger);return}
  if(event.target.closest?.('[data-feedback-refresh]')){event.preventDefault();void loadInbox();return}
  if(event.target.closest?.('[data-feedback-forget]')){
    event.preventDefault();
    try{localStorage.removeItem(ANON_KEY)}catch{}
    if(inbox)inbox.innerHTML='<p class="meta">This browser is no longer linked to previous anonymous feedback threads.</p>';
    if(inboxStatus)inboxStatus.textContent='A new private browser identifier will be created if you submit feedback again.';
  }
});
document.addEventListener('canonical-theologian-review',event=>openPanel(event.detail?.trigger||openButton,event.detail));
closeButton?.addEventListener('click',closePanel);
window.addEventListener('online',()=>{flushQueue().catch(()=>{});void loadInbox()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden)closePanel()});
setTimeout(()=>flushQueue().catch(()=>{}),600);
