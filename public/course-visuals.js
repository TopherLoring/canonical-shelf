/* Canonical Shelf native semantic Course visuals.
   Presentation only: consumes current authored curriculum data without mutating curriculum content. */

const valueText=value=>Array.isArray(value)?value.join(' · '):String(value??'');
const frame=(title,type,body,textEquivalent,esc)=>`<figure class="course-visual course-visual--${esc(type)}" data-course-visual="${esc(type)}"><figcaption><span>${esc(type.replace(/-/g,' '))}</span><strong>${esc(title||'Visual study')}</strong></figcaption><div class="course-visual__body">${body}</div>${textEquivalent?`<p class="sr-only">${esc(textEquivalent)}</p>`:''}</figure>`;
const cards=(items,esc)=>`<div class="course-visual__cards">${items.map((item,index)=>`<article><small>${String(index+1).padStart(2,'0')}</small><strong>${esc(item.title||item.label||valueText(item))}</strong>${item.text||item.note||item.role?`<p>${esc(item.text||item.note||item.role)}</p>`:''}</article>`).join('')}</div>`;
const chain=(items,esc,{bidirectional=false}={})=>`<div class="course-visual__chain">${items.map((item,index)=>`${index?`<span class="course-visual__connector" aria-hidden="true">${bidirectional?'↔':'→'}</span>`:''}<article><small>${esc(item.kicker||item.date||item.book||String(index+1).padStart(2,'0'))}</small><strong>${esc(item.title||item.label||valueText(item))}</strong>${item.text||item.note?`<p>${esc(item.text||item.note)}</p>`:''}</article>`).join('')}</div>`;

function timeline(spec,esc){const items=spec.points||spec.stops||[];return frame(spec.title||'Timeline','timeline',chain(items,esc),items.map(x=>`${x.date||x.book||''} ${x.title||''} ${x.note||x.text||''}`).join(' → '),esc)}
function flow(spec,esc){const items=(spec.nodes||[]).map(x=>typeof x==='string'?{title:x}:x);return frame(spec.title||'How the ideas connect','flow',chain(items,esc),items.map(x=>`${x.title||''} ${x.text||''}`).join(' → '),esc)}
function storyArc(spec,esc){const items=(spec.beats||spec.nodes||[]).map(x=>typeof x==='string'?{title:x}:x);return frame(spec.title||'Story arc','story-arc',chain(items,esc),items.map(x=>`${x.title||''} ${x.books||x.text||''}`).join(' → '),esc)}
function relationship(spec,esc){const items=(spec.nodes||[]).map(x=>typeof x==='string'?{title:x}:x);return frame(spec.title||'Relationships','relationship',cards(items,esc),items.map(x=>`${x.title||''}: ${x.role||x.text||''}`).join(' · '),esc)}
function themeThread(spec,esc){const items=spec.stops||spec.nodes||[];return frame(spec.title||'Trace the thread','theme-thread',chain(items,esc),items.map(x=>`${x.book||''} ${x.title||''} ${x.text||''}`).join(' → '),esc)}
function compare(spec,esc){
  const columns=(spec.columns||[]).slice(0,3);
  const body=`<div class="course-visual__compare">${columns.map(column=>`<section><h4>${esc(column.title||'Position')}</h4>${(column.items||[]).map(item=>`<p>${esc(valueText(item))}</p>`).join('')}</section>`).join('')}</div>${spec.shared?.length?`<aside class="course-visual__shared"><strong>Shared ground</strong><p>${spec.shared.map(esc).join(' · ')}</p></aside>`:''}`;
  return frame(spec.title||'Compare','compare',body,columns.map(c=>`${c.title}: ${(c.items||[]).map(valueText).join('; ')}`).join(' | '),esc);
}
function shelf(spec,esc){
  const items=(spec.books||spec.items||[]).map((book,index)=>typeof book==='string'?{title:book,group:index%9}:book);
  const body=`<div class="course-visual__shelf">${items.map((book,index)=>`<span class="course-visual__spine" data-group="${Number(book.group??index%9)}" style="--visual-height:${Number(book.height||58+(index%5)*7)}%"><strong>${esc(book.title||book.name||`Book ${index+1}`)}</strong></span>`).join('')}</div>${spec.caption?`<p>${esc(spec.caption)}</p>`:''}`;
  return frame(spec.title||'The biblical shelf','shelf',body,items.map(book=>book.title||book.name).join(', '),esc);
}
function verseContext(spec,esc){
  const items=[['Speaker',spec.speaker],['Recipient',spec.recipient],['Situation',spec.situation],['Wording',spec.wording],['Responsible use',spec.application]].filter(([,value])=>value).map(([title,text])=>({title,text}));
  return frame(spec.title||'Put the verse back in context','verse-context',chain(items,esc),items.map(x=>`${x.title}: ${x.text}`).join(' → '),esc);
}
function bookProfile(spec,esc){
  const items=[['Shelf',spec.shelf],['Setting',spec.setting],['What happens',spec.synopsis],['People',spec.people],['Audience',spec.audience],['Why read it',spec.purpose]].filter(([,value])=>value).map(([title,text])=>({title,text:valueText(text)}));
  return frame(spec.title||'Book profile','book-profile',cards(items,esc),items.map(x=>`${x.title}: ${x.text}`).join(' · '),esc);
}
function spectrum(spec,esc){const items=(spec.positions||[]).map(x=>typeof x==='string'?{title:x}:x);return frame(spec.title||'Major approaches','spectrum',`${chain(items,esc,{bidirectional:true})}${spec.boundary?`<aside class="course-visual__boundary"><strong>Interpretive boundary</strong><p>${esc(spec.boundary)}</p></aside>`:''}`,items.map(x=>`${x.title}: ${x.text||''}`).join(' ↔ '),esc)}
function stack(spec,esc){const items=(spec.layers||[]).map(x=>typeof x==='string'?{title:x}:x);return frame(spec.title||'Keep the layers separate','stack',`<div class="course-visual__stack">${items.map((item,index)=>`<article><small>Layer ${index+1}</small><strong>${esc(item.title||valueText(item))}</strong>${item.text?`<p>${esc(item.text)}</p>`:''}</article>`).join('')}</div>`,items.map(x=>`${x.title}: ${x.text||''}`).join(' · '),esc)}
function mapLite(spec,esc){
  const places=(spec.places||[]).map((place,index)=>typeof place==='string'?{title:place}:place);
  const body=`<div class="course-visual__map" role="img" aria-label="${esc(spec.alt||spec.title||'Schematic geography')}" aria-describedby="course-map-note"><svg viewBox="0 0 800 360" aria-hidden="true" focusable="false"><path d="M80 300 C170 235 170 145 285 126 C400 105 475 52 615 75 C695 91 730 142 710 220 C690 294 560 316 435 296 C315 276 194 342 80 300Z"/>${places.map((place,index)=>{const x=Number(place.x??120+index*95),y=Number(place.y??170+(index%3)*45);return `<g><circle cx="${x}" cy="${y}" r="8"/><text x="${x+14}" y="${y+5}">${esc(place.title||'Place')}</text></g>`}).join('')}</svg></div><p id="course-map-note" class="course-visual__note">${esc(spec.caption||'Schematic orientation only; boundaries and distances are not survey-grade.')}</p>`;
  return frame(spec.title||'Places in the story','map-lite',body,places.map(x=>x.title).join(', '),esc);
}

const renderers={timeline,flow,compare,shelf,'story-arc':storyArc,relationship,'theme-thread':themeThread,'verse-context':verseContext,'book-profile':bookProfile,spectrum,stack,'map-lite':mapLite};

function textSpec(lesson,v){
  const text=String(v?.text||'').trim();
  const parts=text.split(/\s*(?:→|⇒|->)\s*/).filter(Boolean);
  if(parts.length>1)return {type:/timeline|chronolog|period|era/i.test(`${v.title||''} ${lesson.title||''}`)?'timeline':'flow',title:v.title||'See the relationship',nodes:parts.map((title,index)=>({title,kicker:String(index+1).padStart(2,'0')})),points:parts.map((title,index)=>({title,date:String(index+1).padStart(2,'0')}))};
  if(/compare|versus| vs\.? |difference|distinguish/i.test(`${v?.title||''} ${lesson.title||''}`)){
    const columns=text.split(/\s*[|·]\s*/).filter(Boolean).slice(0,3).map(title=>({title,items:[]}));
    if(columns.length>1)return {type:'compare',title:v.title||'Compare',columns};
  }
  return null;
}

export function renderCourseVisual(lesson,esc){
  const v=lesson?.visual||lesson?.diagram||null;
  if(!v)return'';
  if(typeof v==='string')return frame('Visual study','flow',`<p class="course-visual__prose">${esc(v)}</p>`,v,esc);
  if(v.src)return `<figure class="course-visual course-visual--image"><img src="${esc(v.src)}" alt="${esc(v.alt||'Lesson visual')}">${v.caption?`<figcaption><strong>${esc(v.caption)}</strong></figcaption>`:''}</figure>`;
  const spec=v.type?v:textSpec(lesson,v);
  if(spec&&renderers[spec.type])return renderers[spec.type](spec,esc);
  if(v.text)return frame(v.title||'Visual study','relationship',`<p class="course-visual__prose">${esc(v.text)}</p>`,v.text,esc);
  return'';
}

export const COURSE_VISUAL_TYPES=Object.freeze(Object.keys(renderers));
