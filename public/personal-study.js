import {getState,putState} from './db.js';
import {recordMutation} from './sync.js';

const openButton=document.querySelector('#personal-study-open');
const panel=document.querySelector('#personal-study-panel');
const closeButton=document.querySelector('#personal-study-close');
const title=document.querySelector('#personal-study-context');
const note=document.querySelector('#personal-note');
const journal=document.querySelector('#personal-journal');
const status=document.querySelector('#personal-study-status');
const tabs=[...document.querySelectorAll('[data-personal-tab]')];
const panes=[...document.querySelectorAll('[data-personal-pane]')];
let saveTimer=null;
let currentKey=null;
const dirty=new Set();

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

async function loadCurrent(){
  currentKey=activityKey();
  if(!currentKey)return;
  const state=await getState();
  note.value=datedText(state.notes,currentKey);
  journal.value=datedText(state.journal,currentKey);
  dirty.clear();
  title.textContent=contextLabel();
  status.textContent='Saved locally on this device. Account sync includes personal writing when enabled.';
}

async function saveDirty(){
  if(!currentKey||!dirty.size)return;
  const state=await getState();
  const at=new Date().toISOString();
  if(dirty.has('notes'))state.notes={...(state.notes||{}),[currentKey]:{text:note.value,updatedAt:at}};
  if(dirty.has('journal'))state.journal={...(state.journal||{}),[currentKey]:{text:journal.value,updatedAt:at}};
  recordMutation(state,'personal-study',{id:currentKey,fields:[...dirty],updatedAt:at},at);
  dirty.clear();
  await putState(state);
  status.textContent=`Saved ${new Date(at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;
}

function scheduleSave(field){
  dirty.add(field);
  clearTimeout(saveTimer);
  status.textContent='Saving…';
  saveTimer=setTimeout(()=>saveDirty().catch(()=>{status.textContent='Could not save. Your text remains in this panel.'}),650);
}

function selectTab(name){
  tabs.forEach(button=>button.setAttribute('aria-selected',String(button.dataset.personalTab===name)));
  panes.forEach(pane=>pane.hidden=pane.dataset.personalPane!==name);
  (name==='journal'?journal:note)?.focus({preventScroll:true});
}

async function openPanel(){
  if(!activityKey())return;
  await loadCurrent();
  panel.hidden=false;
  openButton.setAttribute('aria-expanded','true');
  panel.querySelector('[data-personal-tab][aria-selected="true"]')?.focus({preventScroll:true});
}

function closePanel(){
  clearTimeout(saveTimer);
  if(currentKey)saveDirty().catch(()=>{});
  panel.hidden=true;
  openButton.setAttribute('aria-expanded','false');
  openButton.focus({preventScroll:true});
}

openButton?.addEventListener('click',()=>openPanel().catch(()=>{}));
closeButton?.addEventListener('click',closePanel);
note?.addEventListener('input',()=>scheduleSave('notes'));
journal?.addEventListener('input',()=>scheduleSave('journal'));
tabs.forEach(button=>button.addEventListener('click',()=>selectTab(button.dataset.personalTab)));
window.addEventListener('popstate',()=>{if(panel&&!panel.hidden)closePanel()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel&&!panel.hidden)closePanel()});
