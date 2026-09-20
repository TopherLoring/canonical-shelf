import {BOOKS} from './bible.js';
import {CATEGORIES} from './library-data.js';
import {queryStudyIndex} from './study-index.js';

if(typeof document!=='undefined'&&!document.querySelector('link[data-canonical-search]')){
  const link=document.createElement('link');link.rel='stylesheet';link.href='/search-experience.css';link.dataset.canonicalSearch='';document.head.append(link);
}

const section=(title,items,markup)=>`<section class="search-domain"><div class="search-domain__head"><h2>${title}</h2><span>${items.length}</span></div>${items.length?markup:'<p class="notice">No matching material in this collection.</p>'}</section>`;

export function searchCanonicalShelf({query,data,corpus}){return queryStudyIndex({query,data,corpus})}

export function searchExperienceView({query,data,corpus,esc}){
  const result=queryStudyIndex({query,data,corpus}),q=result.query;
  const scripture=result.scripture.map(row=>`<a class="search-hit" href="/bible?book=${row.bn}&chapter=${row.chapter}#v${row.verse}"><span>Scripture</span><strong>${esc(BOOKS[row.bn-1])} ${row.chapter}:${row.verse}</strong><p>${esc(row.text)}</p></a>`).join('');
  const topics=result.topics.map(topic=>`<a class="search-hit" href="/topics?topic=${encodeURIComponent(topic.id)}"><span>${esc(topic.kind||'Topic')}</span><strong>${esc(topic.title)}</strong><p>${esc(topic.answer||topic.summary||'')}</p><small>${esc((topic.refs||[]).slice(0,3).join(' · '))}</small></a>`).join('');
  const lessons=result.lessons.map(lesson=>`<a class="search-hit" href="/course?unit=${encodeURIComponent(lesson.unitId)}&lesson=${encodeURIComponent(lesson.id)}"><span>Course lesson</span><strong>${esc(lesson.title)}</strong><p>${esc(lesson.objective||lesson.simple||'')}</p></a>`).join('');
  const glossary=result.glossary.map(term=>`<a class="search-hit" href="/topics?mode=glossary&q=${encodeURIComponent(term.term)}"><span>Glossary</span><strong>${esc(term.term)}</strong><p>${esc(term.quick||term.definitions?.[0]||'')}</p></a>`).join('');
  const books=result.books.map(book=>`<a class="search-hit" href="/bible?book=${book.n}&profile=1"><span>${esc(CATEGORIES[book.cat]?.name||'Bible book')}</span><strong>${esc(book.name)}</strong><p>${esc(book.hook||book.syn||'')}</p><small>${esc((book.people||[]).slice(0,4).join(' · '))}</small></a>`).join('');
  const verses=result.verses.map(verse=>`<a class="search-hit" href="/practice?mode=verses&q=${encodeURIComponent(verse.ref)}"><span>Curated passage</span><strong>${esc(verse.ref)}</strong><p>${esc(verse.note||verse.bsb||'')}</p><small>${esc([verse.speaker,verse.recipient].filter(Boolean).join(' → '))}</small></a>`).join('');
  return `<header class="section compact-section search-experience-head"><p class="eyebrow">Search the whole shelf</p><h1>${q?`“${esc(q)}”`:'Search'}</h1><p class="lede">Scripture, authored Topics, Course teaching, glossary, book profiles, and the restored curated passage library are indexed together while remaining visibly different evidence types.</p></header><div class="search-domain-grid">${section('Scripture',result.scripture,scripture)}${section('Topics',result.topics,topics)}${section('Course',result.lessons,lessons)}${section('Book profiles',result.books,books)}${section('Curated passages',result.verses,verses)}${section('Glossary',result.glossary,glossary)}</div><section class="search-guide-handoff"><p class="eyebrow">Need synthesis rather than retrieval?</p><h2>Ask the Guide with the evidence in view.</h2><button class="button" data-ask="${esc(q)}">Ask the Guide about this</button></section>`;
}
