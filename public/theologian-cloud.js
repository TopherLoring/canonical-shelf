let controller=null;
const conversation=[];
const MAX_TURNS=3;
const MAX_CURRENT=1400;
const MAX_CONTEXT=1850;

const clip=(value,max)=>String(value||'').replace(/\s+/g,' ').trim().slice(0,max);

function conversationalQuestion(question){
  const current=clip(question,MAX_CURRENT);
  if(!conversation.length)return current;
  const parts=[];
  for(const turn of conversation.slice(-MAX_TURNS).reverse()){
    const part=`Previous user: ${clip(turn.user,220)}\nPrevious Theologian: ${clip(turn.assistant,420)}`;
    const next=[part,...parts,`Current question: ${current}`].join('\n\n');
    if(next.length>MAX_CONTEXT)break;
    parts.unshift(part);
  }
  return parts.length?`${parts.join('\n\n')}\n\nCurrent question: ${current}`:current;
}

export async function requestCloudTheologian(question,{path=`${location.pathname}${location.search}`}={}){
  const text=String(question||'').trim();
  if(!text)throw new Error('Question is required');
  controller?.abort();
  controller=new AbortController();
  const response=await fetch('/api/theologian',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({question:conversationalQuestion(text),context:{path,conversationMode:'session-memory'}}),
    signal:controller.signal
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok||result?.fallback)throw new Error(result?.error||`Cloud synthesis unavailable (${response.status})`);
  conversation.push({user:text,assistant:String(result.answer||'')});
  if(conversation.length>MAX_TURNS)conversation.splice(0,conversation.length-MAX_TURNS);
  return result;
}

export function resetCloudTheologianConversation(){
  conversation.length=0;
  controller?.abort();
  controller=null;
}

export function cancelCloudTheologian(){
  controller?.abort();
  controller=null;
}
