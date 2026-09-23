let controller=null;
const MAX_CURRENT=1400;
const MAX_CONTEXT=2600;
const MAX_HISTORY_TURNS=4;

const clip=(value,max)=>String(value||'').replace(/\s+/g,' ').trim().slice(0,max);

export function conversationalQuestion(question,history=[],learnerContext={}){
  const current=clip(question,MAX_CURRENT);
  const parts=[];
  const learner=[];
  if(learnerContext.route)learner.push(`Current route: ${clip(learnerContext.route,180)}`);
  if(learnerContext.activity)learner.push(`Current activity: ${clip(learnerContext.activity,240)}`);
  if(Number.isFinite(learnerContext.completed)&&Number.isFinite(learnerContext.total))learner.push(`Course progress: ${learnerContext.completed}/${learnerContext.total} scored activities complete`);
  if(Number.isFinite(learnerContext.reviewsDue))learner.push(`Reviews due: ${learnerContext.reviewsDue}`);
  if(Array.isArray(learnerContext.recent)&&learnerContext.recent.length)learner.push(`Recent study: ${learnerContext.recent.slice(0,4).map(value=>clip(value,90)).join(' | ')}`);
  if(learnerContext.masteryActive===true)learner.push('Current activity is scored/mastery work: scaffold reasoning but never reveal or select the assessed answer.');
  if(learner.length)parts.push(`LEARNER CONTEXT (study-state summary only; not theological evidence or authority):\n${learner.join('\n')}`);

  const safeHistory=Array.isArray(history)?history.slice(-MAX_HISTORY_TURNS*2):[];
  for(let index=0;index<safeHistory.length;index+=2){
    const user=safeHistory[index],assistant=safeHistory[index+1];
    if(user?.role!=='user'||assistant?.role!=='assistant')continue;
    parts.push(`Previous user: ${clip(user.text,260)}\nPrevious Theologian: ${clip(assistant.text,520)}`);
  }
  parts.push(`Current question: ${current}`);
  let value=parts.join('\n\n');
  if(value.length>MAX_CONTEXT)value=`${parts[0]?.startsWith('LEARNER CONTEXT')?`${parts[0]}\n\n`:''}${parts.slice(-2).join('\n\n')}`.slice(-MAX_CONTEXT);
  return value;
}

export async function requestCloudTheologian(question,{path=`${location.pathname}${location.search}`,history=[],learnerContext={}}={}){
  const text=String(question||'').trim();
  if(!text)throw new Error('Question is required');
  controller?.abort();
  controller=new AbortController();
  const response=await fetch('/api/theologian',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({question:conversationalQuestion(text,history,learnerContext),context:{path,conversationMode:'local-persistent-bounded',learnerContextPresent:Boolean(Object.keys(learnerContext||{}).length)}}),
    signal:controller.signal
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok||result?.fallback)throw new Error(result?.error||`Cloud synthesis unavailable (${response.status})`);
  return result;
}

export function cancelCloudTheologian(){
  controller?.abort();
  controller=null;
}
