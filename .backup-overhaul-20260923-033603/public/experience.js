import {topicsView} from './topics-experience.js';

const RECENT_KEY='canonical-shelf-recent-v1';
const safeJson=(raw,fallback)=>{try{return JSON.parse(raw)}catch{return fallback}};

if(typeof document!=='undefined'&&!document.querySelector('link[data-canonical-topics]')){
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/topics-experience.css';
  link.dataset.canonicalTopics='';
  document.head.append(link);
}

export {topicsView};

export function recentActivity(){
  try{return safeJson(localStorage.getItem(RECENT_KEY)||'[]',[]).filter(item=>item&&item.href&&item.title).slice(0,12)}catch{return[]}
}

export function recordRecent(entry){
  if(!entry?.href||!entry?.title)return;
  try{
    const now=new Date().toISOString();
    const items=recentActivity().filter(item=>item.href!==entry.href);
    items.unshift({...entry,at:now});
    localStorage.setItem(RECENT_KEY,JSON.stringify(items.slice(0,12)));
  }catch{}
}

export function recentEntryForRoute(route,params,data,books){
  if(route==='course'){
    const lesson=params.get('lesson'),mastery=params.get('mastery');
    if(lesson){const item=(data.lessons||[]).find(value=>value.id===lesson);return item?{kind:'Lesson',title:item.title,detail:(data.units||[]).find(unit=>unit.id===item.unitId)?.title||'',href:location.pathname+location.search}:null}
    if(mastery){const item=(data.activities||[]).find(value=>value.sourceId===mastery&&value.type==='mastery');return item?{kind:'Mastery',title:item.title,detail:(data.units||[]).find(unit=>unit.id===item.unitId)?.title||'',href:location.pathname+location.search}:null}
  }
  if(route==='bible'){
    const book=Number(params.get('book')),chapter=Number(params.get('chapter'));
    if(book&&chapter)return{kind:'Bible',title:`${books[book-1]} ${chapter}`,href:location.pathname+location.search};
  }
  if(route==='topics'){
    const id=params.get('topic'),topic=(data.topics||[]).find(item=>item.id===id);
    if(topic)return{kind:'Topic',title:topic.title,href:location.pathname+location.search};
  }
  return null;
}
