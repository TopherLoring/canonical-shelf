import {CATEGORIES,CATEGORY_ORDER} from './library-data.js';
// Shared conversation interpretation for cloud retrieval and the limited local fallback.
// History is context for a question, never a source of theological evidence.
export function conversationalReply(question) {
  const text=String(question||'').trim();
  if (/^(are you (still )?(broken|working|there)|(?:that(?:’s|'s| is)|this(?:’s|'s| is)) not what i (asked|meant)|you (misunderstood me|got (that|it) wrong)|that(?:’s|'s| is) wrong)[?!.\s]*$/i.test(text)) return 'I may have misunderstood. Which part of my answer should I revisit?';
  if (/^(hi|hello|hey)[!.\s]*$/i.test(text)) return 'Hi! What’s on your mind?';
  if (/^(thanks|thank you|thanks so much|thank you so much)[!.\s]*$/i.test(text)) return 'You’re welcome.';
  if (/^(ok|okay|got it|that makes sense)[!.\s]*$/i.test(text)) return 'Okay.';
  return '';
}

export function isConversationFollowUp(question) {
  if (/\b(this|the) (page|screen)\b/i.test(question)) return false;
  return /^(why|how so|go on|say more|tell me more|continue|yes|please)[?!.\s]*$/i.test(question.trim()) ||
    /\b(that|this|it|those|them)\b/i.test(question) && /\b(explain|mean|simpler|simply|example|why|how|disagree|understand|elaborate)\b/i.test(question);
}

export function conversationQuery(question, history=[]) {
  if (conversationalReply(question) || !isConversationFollowUp(question)) return question;
  const turns=Array.isArray(history)?history.slice(-8):[];
  const anchor=[...turns].reverse().find(turn=>turn?.role==='user' && typeof turn.text==='string' && !conversationalReply(turn.text) && !isConversationFollowUp(turn.text));
  return anchor ? `${anchor.text.slice(0,700)}\nFollow-up: ${question}` : question;
}


export function bookshelfQuestion(question) {
  return /\b(bookshelf|book ?shelf)\b/i.test(question) ||
    /\b(categories|groups|groupings)\b/i.test(question) && /\b(canon|biblical|bible|books|shelf)\b/i.test(question);
}

export function bookshelfDescription() {
  return `The bookshelf uses ${CATEGORY_ORDER.length} color-coded groups:\n${CATEGORY_ORDER.map((key,index)=>`${index+1}. ${CATEGORIES[key].name} — ${CATEGORIES[key].sub}`).join('\n')}\nThese are the site’s groupings of the Protestant Bible’s 66 books. Other traditions may organize the canon differently.`;
}

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
  if(value?.passage)context.passage=clip(value.passage,80);
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