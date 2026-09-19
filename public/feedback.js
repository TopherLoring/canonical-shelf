const openButton=document.querySelector('#feedback-open');
const panel=document.querySelector('#feedback-panel');
const closeButton=document.querySelector('#feedback-close');
const form=document.querySelector('#feedback-form');
const status=document.querySelector('#feedback-status');
const QUEUE_KEY='canonical-shelf-feedback-queue-v1';

const readQueue=()=>{try{const value=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}};
const writeQueue=items=>localStorage.setItem(QUEUE_KEY,JSON.stringify(items));
const routeContext=()=>`${location.pathname}${location.search}`.slice(0,512);

function openPanel(){
  panel.hidden=false;
  openButton.setAttribute('aria-expanded','true');
  form.querySelector('select,textarea,input')?.focus({preventScroll:true});
}

function closePanel(){
  panel.hidden=true;
  openButton.setAttribute('aria-expanded','false');
  openButton.focus({preventScroll:true});
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
  const payload={
    category:String(data.get('category')||'other'),
    message:String(data.get('message')||'').trim(),
    contact:String(data.get('contact')||'').trim(),
    route:routeContext(),
    clientCreatedAt:new Date().toISOString()
  };
  if(payload.message.length<5){status.textContent='Please add a little more detail.';return}
  status.textContent='Sending…';
  try{
    await send(payload);
    form.reset();
    status.textContent='Thank you. Your feedback was sent.';
  }catch{
    const queue=readQueue();
    queue.push(payload);
    writeQueue(queue.slice(-50));
    form.reset();
    status.textContent='You appear to be offline or the service is unavailable. Your feedback was saved on this device and will retry automatically.';
  }
});

openButton?.addEventListener('click',openPanel);
closeButton?.addEventListener('click',closePanel);
window.addEventListener('online',()=>flushQueue().catch(()=>{}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden)closePanel()});
setTimeout(()=>flushQueue().catch(()=>{}),600);
