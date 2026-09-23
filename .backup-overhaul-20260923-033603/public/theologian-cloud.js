let controller=null;
const MAX_CURRENT=1400;
const MAX_HISTORY_TURNS=4;

const clip=(value,max)=>String(value||'').replace(/\s+/g,' ').trim().slice(0,max);

// Kept as a small public formatter for callers/tests. Conversation history and
// learner state are transmitted separately rather than embedded into this text.
export function conversationalQuestion(question){return clip(question,MAX_CURRENT)}

function boundedHistory(history=[]){
  if(!Array.isArray(history))return[];
  return history.slice(-MAX_HISTORY_TURNS*2).map(item=>({
    role:item?.role==='assistant'?'assistant':'user',
    text:clip(item?.text,item?.role==='assistant'?1200:700)
  })).filter(item=>item.text);
}
function boundedLearnerContext(value={}){
  const context={};
  if(value?.route)context.route=clip(value.route,180);
  if(value?.activity)context.activity=clip(value.activity,240);
  if(Number.isFinite(value?.completed))context.completed=Number(value.completed);
  if(Number.isFinite(value?.total))context.total=Number(value.total);
  if(Number.isFinite(value?.reviewsDue))context.reviewsDue=Number(value.reviewsDue);
  if(Array.isArray(value?.recent))context.recent=value.recent.slice(0,4).map(item=>clip(item,90)).filter(Boolean);
  context.masteryActive=value?.masteryActive===true;
  return context;
}

export async function requestCloudTheologian(question,{path=`${location.pathname}${location.search}`,history=[],learnerContext={}}={}){
  const text=conversationalQuestion(question);
  if(!text)throw new Error('Question is required');
  controller?.abort();
  controller=new AbortController();
  const response=await fetch('/api/theologian',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
      question:text,
      history:boundedHistory(history),
      context:{path:clip(path,600),learnerContext:boundedLearnerContext(learnerContext)}
    }),
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