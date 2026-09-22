import {getState,dueReviews} from './db.js';
import {recentActivity} from './experience.js';
import {requestCloudTheologian,cancelCloudTheologian} from './theologian-cloud.js';
import {buildTheologianResponse} from './theologian.js';

const panel=document.querySelector('#guide');
const body=document.querySelector('#guide-body');
const openButton=document.querySelector('#guide-open');
const closeButton=document.querySelector('#guide-close');
if(!panel||!body||!openButton||!closeButton)throw new Error('Theologian shell unavailable');

const STYLE='/theologian-chat.css';
if(!document.querySelector(`link[href="${STYLE}"]`)){
  const link=document.createElement('link');link.rel='stylesheet';link.href=STYLE;document.head.append(link);
}

const STORAGE_KEY='canonical-shelf-theologian-chat-v1';
const MAX_STORED_MESSAGES=40;
const MAX_VISIBLE_EVIDENCE=8;
let sending=false,lastTrigger=openButton,assetCache=null;

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clip=(value,max)=>String(value||'').trim().slice(0,max);
const now=()=>new Date().toISOString();

function normalizeMessage(value){
  if(!value||!['user','assistant'].includes(value.role))return null;
  return {
    role:value.role,
    text:clip(value.text,9000),
    at:value.at||now(),
    mode:value.role==='assistant'?clip(value.mode||'',32):'',
    evidence:value.role==='assistant'&&Array.isArray(value.evidence)?value.evidence.slice(0,MAX_VISIBLE_EVIDENCE).map(item=>({
      type:clip(item?.type,40),label:clip(item?.label,220),href:clip(item?.href,700),evidence:clip(item?.evidence,180),limits:clip(item?.limits,700)
    })):[],
    guardrails:value.role==='assistant'&&Array.isArray(value.guardrails)?value.guardrails.slice(0,8).map(item=>clip(item,160)):[],
    lgbtqResearchApplied:Boolean(value?.lgbtqResearchApplied),
    fallback:Boolean(value?.fallback)
  };
}
function loadMessages(){
  try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(value)?value.map(normalizeMessage).filter(Boolean).slice(-MAX_STORED_MESSAGES):[]}catch{return[]}
}
function saveMessages(messages){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)))}catch{}
}
let messages=loadMessages();

function answerMarkup(text){return clip(text,9000).split(/\n\s*\n/).filter(Boolean).map(block=>`<p>${esc(block).replace(/\n/g,'<br>')}</p>`).join('')}
function timeLabel(value){try{return new Date(value).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}catch{return''}}
function evidenceMarkup(items=[]){
  if(!items.length)return'';
  return `<details class="chat-message__evidence"><summary>Evidence &amp; limits · ${items.length}</summary><div class="chat-message__evidence-body">${items.map(item=>`<div class="chat-evidence"><strong>${item.href?`<a href="${esc(item.href)}"${/^https?:/i.test(item.href)?' target="_blank" rel="noreferrer"':''}>${esc(item.label||item.type||'Evidence')}</a>`:esc(item.label||item.type||'Evidence')}</strong>${item.evidence?`<small>${esc(item.evidence)}</small>`:''}${item.limits?`<small class="chat-evidence__limit">Limit: ${esc(item.limits)}</small>`:''}</div>`).join('')}</div></details>`
}
function badgesMarkup(message){
  if(message.role!=='assistant')return'';
  const badges=[];
  if(message.mode==='cloud')badges.push('cloud synthesis');
  if(message.fallback)badges.push('offline evidence mode');
  if(message.lgbtqResearchApplied)badges.push('LGBTQ research applied');
  badges.push('faith ceiling enforced');
  return `<div class="chat-message__badges">${badges.map(item=>`<span>${esc(item)}</span>`).join('')}</div>`
}
function messageMarkup(message){
  const assistant=message.role==='assistant';
  return `<article class="chat-message chat-message--${message.role}"><div class="chat-message__label">${assistant?'Theologian':'You'}</div><div class="chat-message__bubble">${answerMarkup(message.text)}</div>${assistant?badgesMarkup(message):''}${assistant?evidenceMarkup(message.evidence):''}<div class="chat-message__meta">${esc(timeLabel(message.at))}</div></article>`
}
function suggestionsMarkup(){return `<div class="theologian-chat__suggestions"><button type="button" data-theologian-suggest="What is the Decalogue, and how does it relate to the rest of Mosaic law?">Decalogue &amp; Mosaic law</button><button type="button" data-theologian-suggest="How should I distinguish what a passage says from later interpretation?">Text vs. interpretation</button><button type="button" data-theologian-suggest="What can you help me understand on this page?">Use this page</button></div>`}
function emptyMarkup(){return `<div class="theologian-chat__empty"><p class="eyebrow">Study conversation</p><h3>Ask, follow up, and inspect the evidence.</h3><p>Theologian uses the BSB, Canonical Shelf content, the compact Statement of Faith, and vetted sources. It can see limited study-state context, but not your Journal, lesson notes, reflection writing, profile, or account data.</p>${suggestionsMarkup()}</div>`}
function composerMarkup(){return `<form id="guide-form" class="theologian-chat__composer"><div class="theologian-chat__composer-row"><label class="sr-only" for="guide-q">Message Theologian</label><textarea id="guide-q" name="question" rows="2" maxlength="1400" placeholder="Ask about Scripture, context, interpretation, doctrine, evidence, or what you are studying…"></textarea><button type="submit" ${sending?'disabled':''}>${sending?'Thinking…':'Send'}</button></div><p class="theologian-chat__privacy">Chat is stored only in this browser until you start a new chat. Only a bounded recent excerpt is sent for a response. Private study writing and account/profile data are excluded.</p><p id="theologian-chat-status" class="theologian-chat__status" role="status" aria-live="polite"></p></form>`}
function render({thinking=false,status=''}={}){
  body.innerHTML=`<section class="theologian-chat" aria-label="Theologian conversation"><div class="theologian-chat__toolbar"><p>Grounded study assistant · evidence and interpretive limits stay inspectable.</p><button class="theologian-chat__new" type="button" data-theologian-new-chat>New chat</button></div><div class="theologian-chat__messages" data-theologian-messages aria-live="polite">${messages.length?messages.map(messageMarkup).join(''):emptyMarkup()}${thinking?'<div class="theologian-chat__thinking" aria-label="Theologian is composing a response"><i></i><i></i><i></i></div>':''}</div>${composerMarkup()}</section>`;
  const statusNode=body.querySelector('#theologian-chat-status');if(statusNode)statusNode.textContent=status;
  const stream=body.querySelector('[data-theologian-messages]');if(stream)requestAnimationFrame(()=>{stream.scrollTop=stream.scrollHeight});
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
    const course=params.get('course');if(course)return (data.courses||[]).find(value=>value.id===course)?.title||`Course ${course}`;
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
  return {
    route:`${location.pathname}${location.search}`,
    activity:activityLabel(data),
    completed,total,
    reviewsDue:dueReviews(state).length,
    recent:recentActivity().slice(0,4).map(item=>`${item.kind||'Study'}: ${item.title}`),
    masteryActive:location.pathname==='/course'&&new URLSearchParams(location.search).has('mastery')
  };
}
function deterministicAnswer(question,resources){
  const result=buildTheologianResponse({question,data:resources.data,policy:resources.policy,statement:resources.statement,sources:resources.sources,corpus:resources.corpus,context:{scored:location.pathname==='/course'&&new URLSearchParams(location.search).has('mastery')}});
  const text=[result.position,...(result.warnings||[])].filter(Boolean).join('\n\n');
  return {mode:'local',answer:text,evidence:result.evidence||[],guardrails:['Berean Standard Bible','Canonical Shelf published content','Compact Canonical Shelf Statement of Faith','Canonical Shelf theology policy and vetted research'],fallback:true};
}
async function ask(question){
  const text=clip(question,1400);if(!text||sending)return;
  const history=messages.slice(-8).map(({role,text})=>({role,text}));
  messages.push({role:'user',text,at:now()});messages=messages.slice(-MAX_STORED_MESSAGES);saveMessages(messages);
  sending=true;render({thinking:true,status:'Building a grounded answer…'});panel.hidden=false;
  try{
    const context=await learnerContext();
    const result=await requestCloudTheologian(text,{path:`${location.pathname}${location.search}`,history,learnerContext:context});
    messages.push(normalizeMessage({role:'assistant',text:result.answer,at:now(),mode:result.mode||'cloud',evidence:result.evidence||[],guardrails:result.guardrails||[],lgbtqResearchApplied:result.lgbtqResearchApplied}));
  }catch(error){
    if(error?.name==='AbortError'){sending=false;render();return}
    try{
      const resources=await assets(),fallback=deterministicAnswer(text,resources);
      messages.push(normalizeMessage({role:'assistant',text:fallback.answer,at:now(),mode:'local',evidence:fallback.evidence,guardrails:fallback.guardrails,fallback:true}));
    }catch{
      messages.push(normalizeMessage({role:'assistant',text:'Theologian could not produce a response that passed its evidence and theological safeguards. Try rephrasing the question or open the relevant Bible, Course, or Topic material and ask again.',at:now(),mode:'local',fallback:true}));
    }
  }finally{
    sending=false;messages=messages.filter(Boolean).slice(-MAX_STORED_MESSAGES);saveMessages(messages);render();body.querySelector('#guide-q')?.focus({preventScroll:true});
  }
}
function openChat(trigger=openButton,{draft=''}={}){
  lastTrigger=trigger||openButton;render();panel.hidden=false;openButton.setAttribute('aria-expanded','true');const input=body.querySelector('#guide-q');if(input){input.value=draft;input.focus({preventScroll:true})}
}
function closeChat(){cancelCloudTheologian();panel.hidden=true;openButton.setAttribute('aria-expanded','false');(lastTrigger?.isConnected?lastTrigger:openButton)?.focus({preventScroll:true})}
function newChat(){cancelCloudTheologian();messages=[];saveMessages(messages);sending=false;render();body.querySelector('#guide-q')?.focus({preventScroll:true})}

// Capture handlers replace the older single-answer Guide behavior without reviving DOM-repair layers.
document.addEventListener('click',event=>{
  const open=event.target.closest?.('#guide-open');if(open){event.preventDefault();event.stopImmediatePropagation();openChat(open);return}
  const close=event.target.closest?.('#guide-close');if(close){event.preventDefault();event.stopImmediatePropagation();closeChat();return}
  const askButton=event.target.closest?.('[data-ask]');if(askButton){event.preventDefault();event.stopImmediatePropagation();openChat(askButton,{draft:askButton.dataset.ask||''});return}
  const suggestion=event.target.closest?.('[data-theologian-suggest]');if(suggestion){event.preventDefault();void ask(suggestion.dataset.theologianSuggest||'');return}
  if(event.target.closest?.('[data-theologian-new-chat]')){event.preventDefault();newChat()}
},true);

document.addEventListener('submit',event=>{
  if(event.target?.id!=='guide-form')return;
  event.preventDefault();event.stopImmediatePropagation();void ask(new FormData(event.target).get('question')||'');
},true);

document.addEventListener('keydown',event=>{
  if(event.target?.id==='guide-q'&&event.key==='Enter'&&!event.shiftKey){event.preventDefault();event.target.form?.requestSubmit()}
  if(event.key==='Escape'&&!panel.hidden)closeChat();
},true);

export function openTheologianChat(question=''){openChat(openButton,{draft:question})}
export function clearTheologianChat(){newChat()}
