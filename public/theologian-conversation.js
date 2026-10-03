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
