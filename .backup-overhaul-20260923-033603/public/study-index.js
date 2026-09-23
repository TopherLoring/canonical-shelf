import {parseReference,parseCorpus} from './bible.js';
import {LIBRARY_BOOKS,CATEGORIES} from './library-data.js';
import {VERSES} from './verse-data.js';

const STOP=new Set(['the','and','for','with','that','this','what','why','how','does','did','are','was','were','from','into','about','have','has','can','could','would','should','christian','christians','bible','biblical']);
export const studyTerms=value=>[...new Set(String(value||'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(term=>term.length>2&&!STOP.has(term)))];
const scoreText=(text,terms)=>{const hay=String(text||'').toLowerCase();return terms.reduce((score,term)=>score+(hay.includes(term)?1:0),0)};
const rank=(items,terms,textOf,limit=10)=>items.map(item=>({item,score:scoreText(textOf(item),terms)})).filter(entry=>entry.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(entry=>entry.item);

export const topicIndexText=topic=>`${topic.title||''} ${topic.kind||''} ${topic.answer||topic.summary||''} ${(topic.aliases||[]).join(' ')} ${(topic.tags||[]).join(' ')} ${(topic.refs||[]).join(' ')} ${(topic.body||[]).join(' ')} ${(topic.sections||[]).flat().join(' ')}`;
export const lessonIndexText=lesson=>`${lesson.title||''} ${lesson.objective||''} ${(lesson.body||[]).join(' ')} ${lesson.simple||''} ${lesson.deeper||''} ${Object.entries(lesson.vocab||{}).flat().join(' ')} ${(lesson.drawers||[]).map(drawer=>`${drawer.title||''} ${Array.isArray(drawer.body)?drawer.body.join(' '):drawer.body||''}`).join(' ')}`;
export const bookIndexText=book=>`${book.name} ${book.hook||''} ${book.syn||''} ${book.who||''} ${book.when||''} ${book.read||''} ${(book.people||[]).join(' ')} ${(book.threads||[]).join(' ')} ${CATEGORIES[book.cat]?.name||''}`;
export const verseIndexText=verse=>`${verse.ref} ${verse.book} ${(verse.themes||[]).join(' ')} ${(verse.life||[]).join(' ')} ${verse.speaker||''} ${verse.recipient||''} ${verse.bsb||''} ${verse.kjv||''} ${verse.note||''}`;

export function queryStudyIndex({query,data,corpus='',limits={}}){
  const q=String(query||'').trim(),terms=studyTerms(q),ref=parseReference(q);
  const max=(key,fallback)=>Number(limits[key]||fallback);
  const scripture=ref?parseCorpus(corpus).filter(row=>row.bn===ref.bn&&row.chapter===ref.chapter&&(!ref.start||(row.verse>=ref.start&&row.verse<=ref.end))).slice(0,max('scripture',30)):rank(parseCorpus(corpus),terms,row=>row.text,max('scripture',12));
  return {
    query:q,
    terms,
    reference:ref,
    scripture,
    topics:rank(data.topics||[],terms,topicIndexText,max('topics',10)),
    lessons:rank(data.lessons||[],terms,lessonIndexText,max('lessons',10)),
    glossary:rank(data.glossary||[],terms,item=>`${item.term} ${item.quick||''} ${(item.definitions||[]).join(' ')}`,max('glossary',10)),
    books:rank(LIBRARY_BOOKS,terms,bookIndexText,max('books',10)),
    verses:rank(VERSES,terms,verseIndexText,max('verses',10))
  };
}

export function topicEvidenceDetail(topic){
  const section=(topic.sections||[])[0];
  const sectionText=Array.isArray(section)?section.slice(0,2).join(': '):'';
  return [topic.answer||topic.summary||'',sectionText,(topic.refs||[]).slice(0,3).join(' · ')].filter(Boolean).join(' — ').slice(0,620);
}
export function lessonEvidenceDetail(lesson){
  return [lesson.objective||'',lesson.simple||'',(lesson.body||[])[0]||''].filter(Boolean).join(' ').slice(0,620);
}
export function bookEvidenceDetail(book){
  return [book.hook||'',book.syn||'',book.who?`Authorship/source note: ${book.who}`:''].filter(Boolean).join(' ').slice(0,620);
}
export function verseEvidenceDetail(verse){
  return [verse.bsb||'',verse.note||'',verse.speaker?`Speaker: ${verse.speaker}`:'',verse.recipient?`Recipient: ${verse.recipient}`:''].filter(Boolean).join(' ').slice(0,620);
}
