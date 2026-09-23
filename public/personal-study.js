import {getState,putState} from './db.js';
import {recordMutation} from './sync.js';

const openButton=document.querySelector('#personal-study-open');
const panel=document.querySelector('#personal-study-panel');
const closeButton=document.querySelector('#personal-study-close');
const title=document.querySelector('#personal-study-context');
const journal=document.querySelector('#personal-journal');
const status=document.querySelector('#personal-study-status');
let journalTimer=null,currentKey=null,lastTrigger=openButton;
const inlineTimers=new WeakMap();

function activityKey(){
  const route=location.pathname,newParams=new URLSearchParams(location.search);
  if(route==='/course'){
    if(newParams.get('mastery'))return `mastery:${newParams.get('mastery')}`;
    if(newParams.get('lesson'))return newParams.get('lesson')==='orientation'?'orientation:orientation':`lesson:${newParams.get('lesson')}`;
    if(newParams.get('unit'))return `unit:${newParams.get('unit')}`;
    if(newParams.get('course'))return `course:${newParams.get('course')}`;
  }
  if(route==='/bible'){
    const book=Number(newParams.get('book')||0),chapter=Number(newParams.get('chapter')||0);
    if(book&&chapter)return `bible:${book}:${chapter}${location.hash||''}`;
    if(book)return `bible-book:${book}`;
  }
  if(route==='/topics'&&newParams.get('topic'))return `topic:${newParams.get('topic')}`;
  return `route:${route||'/'}`;
}

function contextLabel(){
  if(location.pathname==='/course')return document.querySelector('.study-focus__identity strong')?.textContent?.trim()||document.querySelector('main h1')?.textContent?.trim()||'Course';
  if(location.pathname==='/bible')return document.querySelector('.reader.scripture h1')?.textContent?.trim()||document.querySelector('[data-book-drawer] h2')?.textContent?.trim()||document.querySelector('main h1')?.textContent?.trim()||'Bible';
  if(location.pathname==='/topics')return document.querySelector('.topic-reference-page h1')?.textContent?.trim()||document.querySelector('main h1')?.textContent?.trim()||'Topics';
  return document.querySelector('main h1')?.textContent?.trim()||'Current study destination';
}

function contextDescription(){
  if(location.pathname==='/bible')return'This journal entry is tied to your current Bible reading or Bible destination.';
  if(location.pathname==='/topics')return'This journal entry is tied to the current Topic or Topics destination.';
  if(location.pathname==='/course')return'This journal entry is tied to the current course, unit, lesson, or Course destination.';
  return'This journal entry is tied to the current Canonical Shelf destination.';
}
function datedText(map,key){const value=map?.[key];if(typeof value==='string')return value;return value&&typeof value==='object'?String(value.text||''):''}
async function saveField(field,key,text,statusNode){
  if(!key)return;
  const state=await getState(),at=new Date().toISOString();
  state[field]={...(state[field]||{}),[key]:{text,updatedAt:at}};
  recordMutation(state,'personal-study',{id:key,fields:[field],updatedAt:at},at);
  await putState(state);
  if(statusNode)statusNode.textContent=`Saved ${new Date(at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;
}
async function loadJournal(){
  currentKey=activityKey();
  const state=await getState();journal.value=datedText(state.journal,currentKey);title.textContent=contextLabel();
  status.textContent=`${contextDescription()} Saved locally on this device; optional account sync includes journal writing when enabled.`;
  return true;
}
function scheduleJournalSave(){if(!currentKey)return;clearTimeout(journalTimer);status.textContent='Saving…';journalTimer=setTimeout(()=>saveField('journal',currentKey,journal.value,status).catch(()=>{status.textContent='Could not save. Your writing remains in this panel.'}),650)}
async function bindInlineNotes(){
  const notes=[...document.querySelectorAll('[data-inline-lesson-note]')];if(!notes.length)return;
  const state=await getState();
  for(const note of notes){
    if(note.dataset.bound==='true')continue;note.dataset.bound='true';
    const key=note.dataset.activity||activityKey(),statusNode=note.parentElement?.querySelector('[data-inline-note-status]');note.value=datedText(state.notes,key);
    note.addEventListener('input',()=>{clearTimeout(inlineTimers.get(note));if(statusNode)statusNode.textContent='Saving…';const timer=setTimeout(()=>saveField('notes',key,note.value,statusNode).catch(()=>{if(statusNode)statusNode.textContent='Could not save. Your note remains here.'}),650);inlineTimers.set(note,timer)});
  }
}
async function openPanel(trigger=openButton){
  lastTrigger=trigger||openButton;await loadJournal();
  panel.hidden=false;openButton.setAttribute('aria-expanded','true');journal?.focus({preventScroll:true});
}
function closePanel(){clearTimeout(journalTimer);if(currentKey)saveField('journal',currentKey,journal.value,status).catch(()=>{});panel.hidden=true;openButton.setAttribute('aria-expanded','false');(lastTrigger?.isConnected?lastTrigger:openButton)?.focus({preventScroll:true})}
openButton?.addEventListener('click',()=>openPanel(openButton).catch(()=>{}));
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-journal-open]');if(trigger)openPanel(trigger).catch(()=>{})});
closeButton?.addEventListener('click',closePanel);journal?.addEventListener('input',scheduleJournalSave);
document.addEventListener('canonical-route-rendered',()=>bindInlineNotes().catch(()=>{}));
window.addEventListener('popstate',()=>{if(panel&&!panel.hidden)closePanel()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden)closePanel()});
