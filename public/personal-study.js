import {getState,putState} from './db.js';
import {recordMutation} from './sync.js';

const openButton=document.querySelector('#personal-study-open');
const panel=document.querySelector('#personal-study-panel');
const closeButton=document.querySelector('#personal-study-close');
const title=document.querySelector('#personal-study-context');
const journal=document.querySelector('#personal-journal');
const status=document.querySelector('#personal-study-status');
let journalTimer=null;
let currentKey=null;
let lastTrigger=openButton;
const inlineTimers=new WeakMap();

function activityKey(){
  if(location.pathname!=='/course')return null;
  const params=new URLSearchParams(location.search);
  if(params.get('mastery'))return `mastery:${params.get('mastery')}`;
  if(params.get('lesson'))return params.get('lesson')==='orientation'?'orientation:orientation':`lesson:${params.get('lesson')}`;
  return null;
}

function contextLabel(){
  const identity=document.querySelector('.study-focus__identity strong')?.textContent?.trim();
  return identity||'Current study activity';
}

function datedText(map,key){
  const value=map?.[key];
  if(typeof value==='string')return value;
  return value&&typeof value==='object'?String(value.text||''):'';
}

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
  if(!currentKey)return;
  const state=await getState();
  journal.value=datedText(state.journal,currentKey);
  title.textContent=contextLabel();
  status.textContent='Saved locally on this device. Account sync includes journal writing when enabled.';
}

function scheduleJournalSave(){
  if(!currentKey)return;
  clearTimeout(journalTimer);
  status.textContent='Saving…';
  journalTimer=setTimeout(()=>saveField('journal',currentKey,journal.value,status).catch(()=>{status.textContent='Could not save. Your writing remains in this panel.'}),650);
}

async function bindInlineNotes(){
  const notes=[...document.querySelectorAll('[data-inline-lesson-note]')];
  if(!notes.length)return;
  const state=await getState();
  for(const note of notes){
    if(note.dataset.bound==='true')continue;
    note.dataset.bound='true';
    const key=note.dataset.activity||activityKey(),statusNode=note.parentElement?.querySelector('[data-inline-note-status]');
    note.value=datedText(state.notes,key);
    note.addEventListener('input',()=>{
      clearTimeout(inlineTimers.get(note));
      if(statusNode)statusNode.textContent='Saving…';
      const timer=setTimeout(()=>saveField('notes',key,note.value,statusNode).catch(()=>{if(statusNode)statusNode.textContent='Could not save. Your note remains here.'}),650);
      inlineTimers.set(note,timer);
    });
  }
}

async function openPanel(trigger=openButton){
  if(!activityKey())return;
  lastTrigger=trigger||openButton;
  await loadJournal();
  panel.hidden=false;
  openButton.setAttribute('aria-expanded','true');
  journal?.focus({preventScroll:true});
}

function closePanel(){
  clearTimeout(journalTimer);
  if(currentKey)saveField('journal',currentKey,journal.value,status).catch(()=>{});
  panel.hidden=true;
  openButton.setAttribute('aria-expanded','false');
  (lastTrigger?.isConnected?lastTrigger:openButton)?.focus({preventScroll:true});
}

openButton?.addEventListener('click',()=>openPanel(openButton).catch(()=>{}));
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-journal-open]');if(trigger)openPanel(trigger).catch(()=>{})});
closeButton?.addEventListener('click',closePanel);
journal?.addEventListener('input',scheduleJournalSave);
document.addEventListener('canonical-route-rendered',()=>bindInlineNotes().catch(()=>{}));
window.addEventListener('popstate',()=>{if(panel&&!panel.hidden)closePanel()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden)closePanel()});
