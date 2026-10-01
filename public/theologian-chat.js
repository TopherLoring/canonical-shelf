// Theologian (owner decisions theologian.ui, theologian.memory, theologian.review, feedback):
// a vertical tab on the right viewport edge opens a fixed-size chat panel on every screen, lessons included.
// The conversation stays in this browser until New chat; it is saved to the profile only on request.
// Each answer can be rated or flagged (flags need a reason and a written explanation). Replies to the
// learner's feedback arrive here as system messages, with an unread badge on the tab.
import {getState,putState,dueReviews} from './db.js';
import {recordMutation} from './sync.js';
import {recentActivity} from './experience.js';
import {requestCloudTheologian,cancelCloudTheologian} from './theologian-cloud.js';
import {buildTheologianResponse} from './theologian.js';
import {screenContext,currentPassage} from './screen-context.js';
import {sendFeedback,fetchReplies} from './feedback.js';

const panel=document.querySelector('#guide');
const body=document.querySelector('#guide-body');
const openButton=document.querySelector('#guide-open');
const closeButton=document.querySelector('#guide-close');
const menuButton=document.querySelector('#guide-menu-button');
const menu=document.querySelector('#guide-menu');
if(!panel||!body||!openButton||!closeButton)throw new Error('Theologian shell unavailable');

const STORAGE_KEY='canonical-shelf-theologian-chat-v1';
const SEEN_KEY='canonical-shelf-feedback-replies-seen-v1';
const MAX_STORED_MESSAGES=40;
const MAX_VISIBLE_EVIDENCE=8;
let sending=false,lastTrigger=openButton,assetCache=null,flagOpen=null,replies=[];
const seenReplies=new Set((()=>{try{return JSON.parse(localStorage.getItem(SEEN_KEY)||'[]')}catch{return[]}})());

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clip=(value,max)=>String(value||'').trim().slice(0,max);
const now=()=>new Date().toISOString();
const evidenceStatus=item=>clip(item?.evidenceStatus||item?.status||((item?.evidence||'').includes('direct')?'direct':''),40);
const claimDomain=item=>clip(item?.claimDomain||(item?.type==='scripture'?'biblical-text':item?.type==='glossary'?'language':item?.type==='source'?'interpretation':''),40);

function normalizeMessage(value){
  if(!value||!['user','assistant'].includes(value.role))return null;
  return {
    role:value.role,
    text:clip(value.text,9000),
    at:value.at||now(),
    mode:value.role==='assistant'?clip(value.mode||'',32):'',
    model:value.role==='assistant'?clip(value.model||'',160):'',
    policyVersion:value.role==='assistant'?(typeof value.policyVersion==='number'?value.policyVersion:clip(value.policyVersion||'',32)):'',
    evidence:value.role==='assistant'&&Array.isArray(value.evidence)?value.evidence.slice(0,MAX_VISIBLE_EVIDENCE).map(item=>({
      type:clip(item?.type,40),label:clip(item?.label,220),href:clip(item?.href,700),evidence:clip(item?.evidence,180),limits:clip(item?.limits,700),
      evidenceStatus:evidenceStatus(item),claimDomain:claimDomain(item),doctrinalStatus:clip(item?.doctrinalStatus||'',40),interpretationType:clip(item?.interpretationType||'',60)
    })):[],
    guardrails:value.role==='assistant'&&Array.isArray(value.guardrails)?value.guardrails.slice(0,8).map(item=>clip(item,160)):[],
    validation:value.role==='assistant'&&value.validation&&typeof value.validation==='object'?{
      status:clip(value.validation.status,30),doctrinalCeiling:clip(value.validation.doctrinalCeiling,180),masteryProtected:Boolean(value.validation.masteryProtected)
    }:null,
    lgbtqResearchApplied:Boolean(value?.lgbtqResearchApplied),fallback:Boolean(value?.fallback),
    rating:value.role==='assistant'&&['up','down'].includes(value.rating)?value.rating:undefined,flagged:value.role==='assistant'&&value.flagged===true
  };
}
function loadMessages(){try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(value)?value.map(normalizeMessage).filter(Boolean).slice(-MAX_STORED_MESSAGES):[]}catch{return[]}}
function saveMessages(items){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items.slice(-MAX_STORED_MESSAGES)))}catch{}}
let messages=loadMessages();

function answerMarkup(text){return clip(text,9000).split(/\n\s*\n/).filter(Boolean).map(block=>`<p>${esc(block).replace(/\n/g,'<br>')}</p>`).join('')}
function timeLabel(value){try{return new Date(value).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}catch{return''}}
function evidenceMarkup(items=[]){
  if(!items.length)return'';
  return `<details class="chat-message__evidence"><summary>Evidence &amp; limits · ${items.length}</summary><div class="chat-message__evidence-body">${items.map(item=>{
    const status=[item.evidenceStatus,item.claimDomain,item.doctrinalStatus].filter(Boolean).join(' · ');
    return `<div class="chat-evidence"><strong>${item.href?`<a href="${esc(item.href)}"${/^https?:/i.test(item.href)?' target="_blank" rel="noreferrer"':''}>${esc(item.label||item.type||'Evidence')}</a>`:esc(item.label||item.type||'Evidence')}</strong>${status?`<small class="chat-evidence__status">${esc(status)}</small>`:''}${item.evidence?`<small>${esc(item.evidence)}</small>`:''}${item.limits?`<small class="chat-evidence__limit">Limit: ${esc(item.limits)}</small>`:''}</div>`
  }).join('')}</div></details>`
}
function badgesMarkup(message){
  if(message.role!=='assistant')return'';
  const badges=[];
  if(message.mode==='cloud')badges.push('cloud synthesis');
  if(message.fallback)badges.push('offline evidence mode');
  if(message.validation?.masteryProtected)badges.push('mastery protected');
  if(message.lgbtqResearchApplied)badges.push('LGBTQ research applied');
  return badges.length?`<div class="chat-message__badges">${badges.map(item=>`<span>${esc(item)}</span>`).join('')}</div>`:'';
}
const FLAG_REASONS=[['disagreement','Disagreement'],['profound','Profound'],['very-helpful','Very helpful'],['misguided','Misguided'],['inappropriate','Inappropriate'],['contrary-to-scripture','Contrary to Scripture']];
function reviewActionsMarkup(index,message){
  const rated=message.rating;
  return `<div class="chat-message__actions" aria-label="Rate or flag this answer"><button type="button" data-theologian-rate="up" data-message-index="${index}" aria-pressed="${rated==='up'}" aria-label="Helpful">👍</button><button type="button" data-theologian-rate="down" data-message-index="${index}" aria-pressed="${rated==='down'}" aria-label="Not helpful">👎</button><button type="button" data-theologian-flag="${index}" aria-expanded="${flagOpen===index}">Flag</button></div>${flagOpen===index?flagFormMarkup(index):''}${message.flagged?'<p class="chat-message__note">Flag sent for review.</p>':''}`;
}
function flagFormMarkup(index){
  return `<form class="chat-flag" data-flag-form="${index}"><label>Reason<select name="reason" required><option value="">Choose a reason</option>${FLAG_REASONS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label><label>Why? <span class="meta">required</span><textarea name="message" rows="3" maxlength="4000" required placeholder="Say what you noticed so it can be reviewed."></textarea></label><p class="meta">Sent with your two most recent questions, the answer before this one, and what was on screen. Nothing from your notes is included.</p><div class="chat-flag__actions"><button type="submit" class="button">Send flag</button><button type="button" class="link-button" data-flag-cancel>Cancel</button><span class="chat-flag__status" role="status" aria-live="polite"></span></div></form>`;
}
function messageMarkup(message,index){
  const assistant=message.role==='assistant';
  return `<article class="chat-message chat-message--${message.role}"><div class="chat-message__label">${assistant?'Theologian':'You'} <time>${esc(timeLabel(message.at))}</time></div><div class="chat-message__bubble">${answerMarkup(message.text)}</div>${assistant?badgesMarkup(message):''}${assistant?evidenceMarkup(message.evidence):''}${assistant?reviewActionsMarkup(index,message):''}</article>`;
}
function systemMarkup(){
  const unread=replies.filter(r=>!seenReplies.has(r.id));
  if(!replies.length)return'';
  return `<section class="chat-system" aria-label="Messages from Canonical Shelf">${replies.slice(0,5).map(r=>`<article class="chat-system__message${seenReplies.has(r.id)?'':' is-unread'}"><div class="chat-system__label">Message from Canonical Shelf${seenReplies.has(r.id)?'':' · new'}</div><p>${esc(r.reviewerResponse)}</p><small>In reply to your ${r.reviewReason?'flag':'feedback'} · ${esc(r.respondedAt?new Date(r.respondedAt).toLocaleDateString():'')}</small></article>`).join('')}${unread.length?'<button type="button" class="link-button" data-mark-replies-read>Mark as read</button>':''}</section>`;
}
function suggestionsMarkup(){return `<div class="theologian-chat__suggestions"><button type="button" data-theologian-suggest="What is the Decalogue, and how does it relate to the rest of Mosaic law?">Decalogue &amp; Mosaic law</button><button type="button" data-theologian-suggest="How should I distinguish what a passage says from later interpretation?">Text vs. interpretation</button><button type="button" data-theologian-suggest="What can you help me understand on this page?">Use this page</button></div>`}
function emptyMarkup(){return `<div class="theologian-chat__empty"><p class="eyebrow">Study conversation</p><h3>Ask, follow up, and inspect the evidence.</h3><p>Ask naturally. Theologian uses Canonical Shelf Scripture, course material, theology boundaries, and vetted sources behind the scenes; evidence remains available without turning the answer into a policy report.</p>${suggestionsMarkup()}</div>`}
function composerMarkup(){return `<form id="guide-form" class="theologian-chat__composer"><div class="theologian-chat__composer-row"><label class="sr-only" for="guide-q">Message Theologian</label><textarea id="guide-q" name="question" rows="2" maxlength="1400" placeholder="Ask a question or continue the conversation…"></textarea><button type="submit" ${sending?'disabled':''}>${sending?'Thinking…':'Send'}</button></div><p class="theologian-chat__privacy">This chat stays in this browser until you start a new chat. A bounded recent conversation and minimal study context may be sent to answer follow-ups; your notes, feedback, and account data are never included.</p><p id="theologian-chat-status" class="theologian-chat__status" role="status" aria-live="polite"></p></form>`}
// scroll: 'keep' preserves the reader's position (ratings, flags, status, background refreshes);
// 'bottom' shows the learner's own message and the thinking indicator;
// 'answer' puts the start of the latest Theologian reply at the top of the stream so it reads from its first line.
// 'bottom' and 'answer' run on the next frame. A background re-render before that frame (for example the reply-inbox
// refresh) must not cancel them, so the pending request carries over and the frame always targets the live stream.
let pendingScroll=null;
function render({thinking=sending,status=sending?'Thinking…':'',scroll='keep'}={}){
  const previousTop=body.querySelector('[data-theologian-messages]')?.scrollTop??0;
  if(scroll==='keep'&&pendingScroll)scroll=pendingScroll;
  // Re-rendering replaces the composer, so carry over whatever the learner is typing, the caret, and focus.
  const oldInput=body.querySelector('#guide-q'),draft=oldInput?.value||'',hadFocus=!!oldInput&&document.activeElement===oldInput,caret=[oldInput?.selectionStart??draft.length,oldInput?.selectionEnd??draft.length];
  const ctx=screenContext();
  body.innerHTML=`<section class="theologian-chat" aria-label="Theologian conversation">${systemMarkup()}<p class="theologian-chat__context">Looking at: <strong>${esc(ctx.label)}</strong></p><div class="theologian-chat__stream" data-theologian-messages>${messages.length?messages.map(messageMarkup).join(''):emptyMarkup()}${thinking?'<div class="chat-message chat-message--assistant chat-message--thinking"><div class="chat-message__label">Theologian</div><div class="chat-message__bubble"><p>Thinking…</p></div></div>':''}</div>${composerMarkup()}</section>`;
  const statusNode=body.querySelector('#theologian-chat-status');if(statusNode)statusNode.textContent=status;
  const newInput=body.querySelector('#guide-q');if(newInput&&draft){newInput.value=draft;if(hadFocus){newInput.focus({preventScroll:true});newInput.setSelectionRange(caret[0],caret[1])}}else if(newInput&&hadFocus)newInput.focus({preventScroll:true});
  const stream=body.querySelector('[data-theologian-messages]');if(!stream)return;
  if(scroll==='keep'){stream.scrollTop=previousTop;return}
  const firstRequest=!pendingScroll;pendingScroll=scroll;
  if(!firstRequest)return;
  requestAnimationFrame(()=>{
    const target=pendingScroll;pendingScroll=null;
    const live=body.querySelector('[data-theologian-messages]');if(!live)return;
    if(target==='bottom'){live.scrollTop=live.scrollHeight;return}
    const replies=live.querySelectorAll('.chat-message--assistant:not(.chat-message--thinking)');
    const latest=replies[replies.length-1];
    if(!latest){live.scrollTop=live.scrollHeight;return}
    live.scrollTop+=latest.getBoundingClientRect().top-live.getBoundingClientRect().top;
  });
}

async function assets(){
  if(assetCache)return assetCache;
  const [data,corpus,policy,statement,sources]=await Promise.all([
    fetch('/data/catalog.json').then(r=>r.ok?r.json():({courses:[],units:[],topics:[],lessons:[],activities:[],glossary:[]})),
    fetch('/data/corpus.txt').then(r=>r.ok?r.text():''),
    fetch('/data/theology-policy.json').then(r=>r.ok?r.json():null),
    fetch('/data/statement-of-faith.md').then(r=>r.ok?r.text():''),
    fetch('/data/theology-sources.json').then(r=>r.ok?r.json():[])
  ]);
  assetCache={data,corpus,policy,statement,sources};return assetCache;
}
function activityLabel(data){
  const params=new URLSearchParams(location.search);
  if(location.pathname==='/course'){
    const lesson=params.get('lesson');if(lesson){const item=(data.lessons||[]).find(value=>value.id===lesson);return item?.title||`Lesson ${lesson}`}
    const mastery=params.get('mastery');if(mastery){const item=(data.activities||[]).find(value=>value.type==='mastery'&&value.sourceId===mastery);return item?.title||`Mastery ${mastery}`}
    const unit=params.get('unit');if(unit)return (data.units||[]).find(value=>value.id===unit)?.title||`Unit ${unit}`;
    const course=params.get('course');if(course)return (data.courses||[]).find(value=>value.id===course)?.title||`Module ${course}`;
  }
  if(location.pathname==='/bible')return document.querySelector('.reader.scripture h1')?.textContent?.trim()||document.querySelector('[data-book-drawer] h2')?.textContent?.trim()||'Bible';
  if(location.pathname==='/topics')return document.querySelector('.topic-reference-page h1')?.textContent?.trim()||'Topics';
  if(location.pathname==='/practice')return document.querySelector('main h1')?.textContent?.trim()||'Practice';
  return document.querySelector('main h1')?.textContent?.trim()||'Canonical Shelf';
}
async function learnerContext(){
  const [{data},state]=await Promise.all([assets(),getState()]);
  const total=(data.activities||[]).length;
  const valid=new Set((data.activities||[]).map(item=>item.id));
  const completed=(state.completed||[]).filter(id=>valid.has(id)).length;
  const passage=currentPassage();
  return {route:`${location.pathname}${location.search}`,activity:activityLabel(data),passage:passage?.label,completed,total,reviewsDue:dueReviews(state).length,recent:recentActivity().slice(0,4).map(item=>`${item.kind||'Study'}: ${item.title}`),masteryActive:location.pathname==='/course'&&new URLSearchParams(location.search).has('mastery')};
}
function deterministicAnswer(question,resources){
  const result=buildTheologianResponse({question,data:resources.data,policy:resources.policy,statement:resources.statement,sources:resources.sources,corpus:resources.corpus,context:{scored:location.pathname==='/course'&&new URLSearchParams(location.search).has('mastery'),page:{route:location.pathname,label:resources.pageLabel}}});
  const text=[result.position,...(result.warnings||[])].filter(Boolean).join('\n\n');
  return {mode:'local',model:'local-deterministic',policyVersion:resources.policy?.version||'',answer:text,evidence:result.evidence||[],guardrails:['Berean Standard Bible quotation integrity','Compact Canonical Shelf Statement of Faith doctrinal ceiling','Canonical Shelf theology/evidence policy','Published Canonical Shelf content','Attributed vetted sources'],validation:{status:'passed',doctrinalCeiling:resources.policy?.authority?.normativeCeiling||'Canonical Shelf Statement of Faith',masteryProtected:Boolean(result.masteryProtected)},fallback:true};
}
async function ask(question){
  const text=clip(question,1400);if(!text||sending)return;
  const history=messages.slice(-8).map(({role,text})=>({role,text}));
  messages.push({role:'user',text,at:now()});messages=messages.slice(-MAX_STORED_MESSAGES);saveMessages(messages);
  sending=true;flagOpen=null;render({thinking:true,status:'Thinking…',scroll:'bottom'});showPanel();
  try{
    // Study context and policy lookups are extras: if loading them fails, still ask the service rather than dropping to the offline answer.
    const context=await learnerContext().catch(()=>({route:`${location.pathname}${location.search}`}));
    const passage=currentPassage(),params=new URLSearchParams(location.search);
    if(passage?.address.verseStart){params.set('start',passage.address.verseStart);params.set('end',passage.address.verseEnd||passage.address.verseStart)}
    const result=await requestCloudTheologian(text,{path:`${location.pathname}${params.toString()?`?${params}`:''}`,history,learnerContext:context});
    const policyVersion=result.policyVersion?'':await assets().then(value=>value.policy?.version||'').catch(()=>'');
    messages.push(normalizeMessage({role:'assistant',text:result.answer,at:now(),mode:result.mode||'cloud',model:result.model||'',policyVersion:result.policyVersion||policyVersion,evidence:result.evidence||[],guardrails:result.guardrails||[],validation:result.validation||null,lgbtqResearchApplied:result.lgbtqResearchApplied}));
  }catch(error){
    if(error?.name==='AbortError'){sending=false;render();return}
    try{
      const resources=await assets(),fallback=deterministicAnswer(text,{...resources,pageLabel:activityLabel(resources.data)});
      messages.push(normalizeMessage({role:'assistant',text:`The Theologian service isn't reachable right now, so this is a shorter answer from the site's own material.\n\n${fallback.answer}`,at:now(),mode:'local',model:fallback.model,policyVersion:fallback.policyVersion,evidence:fallback.evidence,guardrails:fallback.guardrails,validation:fallback.validation,fallback:true}));
    }catch{
      messages.push(normalizeMessage({role:'assistant',text:'I could not build a reliable answer from the available evidence. Try rephrasing the question or open the relevant Bible, Pathway, or Catalog material and ask again.',at:now(),mode:'local',model:'local-unavailable',fallback:true}));
    }
  }finally{
    sending=false;messages=messages.filter(Boolean).slice(-MAX_STORED_MESSAGES);saveMessages(messages);render({scroll:'answer'});body.querySelector('#guide-q')?.focus({preventScroll:true});
  }
}
function userPromptsBefore(index,count){const out=[];for(let i=index-1;i>=0&&out.length<count;i--)if(messages[i]?.role==='user')out.unshift(messages[i].text);return out}
function priorResponse(index){for(let i=index-1;i>=0;i--)if(messages[i]?.role==='assistant')return messages[i].text;return''}
function reviewContext(index,action,extra={}){
  const m=messages[index];
  const prompts=userPromptsBefore(index,2);
  return {kind:'theologian-response',action,question:prompts.at(-1)||'',answer:m.text,prompts,priorResponse:priorResponse(index),mode:m.mode,model:m.model,policyVersion:m.policyVersion,validationStatus:m.validation?.status||'',evidence:(m.evidence||[]).map(({label,href,evidenceStatus,claimDomain,doctrinalStatus,limits})=>({label,href,evidenceStatus,claimDomain,doctrinalStatus,limits})),screen:screenContext(),...extra};
}
async function rate(index,value){
  const m=messages[index];if(!m||m.role!=='assistant')return;
  m.rating=m.rating===value?undefined:value;saveMessages(messages);render();
  if(m.rating)try{await sendFeedback({category:'theologian-rating',message:'',context:reviewContext(index,'rate',{rating:m.rating})})}catch{}
}
async function submitFlag(form){
  const index=Number(form.dataset.flagForm),data=new FormData(form),reason=String(data.get('reason')||''),message=String(data.get('message')||'').trim();
  const statusNode=form.querySelector('.chat-flag__status');
  if(!reason||!message){statusNode.textContent='Choose a reason and write why.';return}
  statusNode.textContent='Sending…';
  try{
    const {sent}=await sendFeedback({category:'theologian-flag',reviewReason:reason,message,context:reviewContext(index,'flag')});
    messages[index].flagged=true;saveMessages(messages);flagOpen=null;render({status:sent?'Flag sent. A reply, if any, will appear here.':'You are offline; the flag will send automatically.'});
  }catch(error){statusNode.textContent=error.message||'The flag could not be sent.'}
}
function transcriptText(){
  const ctx=screenContext();
  return [`Canonical Shelf — Theologian conversation`,`Saved ${new Date().toLocaleString()} · ${ctx.label}`,'',...messages.map(m=>`${m.role==='user'?'You':'Theologian'} (${timeLabel(m.at)}):\n${m.text}\n`)].join('\n');
}
async function saveToProfile(){
  if(!messages.length){render({status:'There is nothing to save yet.'});return}
  const state=await getState(),at=now(),id=`t_${Date.now().toString(36)}`;
  const firstQuestion=messages.find(m=>m.role==='user')?.text||'Conversation';
  state.transcripts={...(state.transcripts||{}),[id]:{title:clip(firstQuestion,90),savedAt:at,updatedAt:at,screen:screenContext().label,messages:messages.map(({role,text,at})=>({role,text,at}))}};
  recordMutation(state,'personal-study',{id:`transcript:${id}`,fields:['transcripts'],updatedAt:at},at);
  await putState(state);
  render({status:'Saved to Your Canonical Shelf.'});
}
function download(){
  const blob=new Blob([transcriptText()],{type:'text/plain'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`theologian-conversation-${new Date().toISOString().slice(0,10)}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
async function share(){
  const text=transcriptText();
  try{if(navigator.share){await navigator.share({title:'Theologian conversation',text});return}}catch{return}
  try{await navigator.clipboard.writeText(text);render({status:'Conversation copied. Paste it wherever you want to share it.'})}catch{download()}
}
function setMenu(open){if(!menu||!menuButton)return;menu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));if(open)menu.querySelector('button')?.focus({preventScroll:true})}
function updateBadge(){
  const unread=replies.filter(r=>!seenReplies.has(r.id)).length;
  const badge=openButton.querySelector('[data-unread-count]'),label=openButton.querySelector('[data-unread-label]');
  if(badge){badge.hidden=!unread;badge.textContent=unread?String(unread):''}
  if(label)label.textContent=unread?`, ${unread} new message${unread===1?'':'s'} from Canonical Shelf`:'';
  openButton.classList.toggle('has-unread',unread>0);
}
async function refreshReplies(){try{replies=await fetchReplies()}catch{replies=[]}updateBadge();if(!panel.hidden)render()}
function markRepliesRead(){for(const r of replies)seenReplies.add(r.id);try{localStorage.setItem(SEEN_KEY,JSON.stringify([...seenReplies]))}catch{}updateBadge();render()}
function showPanel(){panel.hidden=false;requestAnimationFrame(()=>{panel.dataset.open='true'});openButton.setAttribute('aria-expanded','true')}
function openChat(trigger=openButton,{draft=''}={}){
  lastTrigger=trigger||openButton;render({scroll:'answer'});showPanel();
  const input=body.querySelector('#guide-q');if(input){input.value=draft;input.focus({preventScroll:true})}
  void refreshReplies();
}
function closeChat(){cancelCloudTheologian();setMenu(false);panel.dataset.open='false';openButton.setAttribute('aria-expanded','false');setTimeout(()=>{if(panel.dataset.open==='false')panel.hidden=true},220);(lastTrigger?.isConnected?lastTrigger:openButton)?.focus({preventScroll:true})}
function newChat(){cancelCloudTheologian();messages=[];flagOpen=null;saveMessages(messages);sending=false;setMenu(false);render();body.querySelector('#guide-q')?.focus({preventScroll:true})}

document.addEventListener('click',event=>{
  const t=event.target;
  if(menu&&!menu.hidden&&!t.closest?.('#guide-menu')&&!t.closest?.('#guide-menu-button'))setMenu(false);
  const rateBtn=t.closest?.('[data-theologian-rate]');if(rateBtn){event.preventDefault();void rate(Number(rateBtn.dataset.messageIndex),rateBtn.dataset.theologianRate);return}
  const flagBtn=t.closest?.('[data-theologian-flag]');if(flagBtn){event.preventDefault();const i=Number(flagBtn.dataset.theologianFlag);flagOpen=flagOpen===i?null:i;render();body.querySelector(`[data-flag-form="${i}"] select`)?.focus({preventScroll:true});return}
  if(t.closest?.('[data-flag-cancel]')){event.preventDefault();flagOpen=null;render();return}
  if(t.closest?.('[data-mark-replies-read]')){event.preventDefault();markRepliesRead();return}
  if(t.closest?.('#guide-menu-button')){event.preventDefault();setMenu(menu.hidden);return}
  if(t.closest?.('[data-theologian-save]')){event.preventDefault();setMenu(false);void saveToProfile();return}
  if(t.closest?.('[data-theologian-export]')){event.preventDefault();setMenu(false);download();return}
  if(t.closest?.('[data-theologian-share]')){event.preventDefault();setMenu(false);void share();return}
  const open=t.closest?.('#guide-open');if(open){event.preventDefault();event.stopImmediatePropagation();if(panel.hidden||panel.dataset.open==='false')openChat(open);else closeChat();return}
  const close=t.closest?.('#guide-close');if(close){event.preventDefault();event.stopImmediatePropagation();closeChat();return}
  const askButton=t.closest?.('[data-ask]');if(askButton){event.preventDefault();event.stopImmediatePropagation();openChat(askButton,{draft:askButton.dataset.ask||''});return}
  const suggestion=t.closest?.('[data-theologian-suggest]');if(suggestion){event.preventDefault();void ask(suggestion.dataset.theologianSuggest||'');return}
  if(t.closest?.('[data-theologian-new-chat]')){event.preventDefault();newChat()}
},true);

document.addEventListener('submit',event=>{
  const flagForm=event.target?.closest?.('[data-flag-form]');if(flagForm){event.preventDefault();event.stopImmediatePropagation();void submitFlag(flagForm);return}
  if(event.target?.id!=='guide-form')return;
  event.preventDefault();event.stopImmediatePropagation();
  const question=new FormData(event.target).get('question')||'',input=event.target.querySelector('#guide-q');
  if(sending)return;
  if(input)input.value='';
  void ask(question);
},true);

document.addEventListener('keydown',event=>{
  if(event.target?.id==='guide-q'&&event.key==='Enter'&&!event.shiftKey){event.preventDefault();event.target.form?.requestSubmit()}
  if(event.key==='Escape'){if(menu&&!menu.hidden){setMenu(false);menuButton?.focus();return}if(!panel.hidden)closeChat()}
},true);

// The panel keeps its place on every screen; only the "Looking at" line follows the route.
document.addEventListener('canonical-route-rendered',()=>{if(!panel.hidden)render()});
window.addEventListener('online',()=>void refreshReplies());
setTimeout(()=>void refreshReplies(),1500);

export function openTheologianChat(question=''){openChat(openButton,{draft:question})}
export function clearTheologianChat(){newChat()}
