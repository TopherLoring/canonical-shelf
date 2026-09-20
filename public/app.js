import {getState,recordResult,recordReview,dueReviews,exportState,importState} from './db.js';
import {courseView,challengeFor,challengeCountFor,challengeEvaluationMode,checkChallenge} from './learning.js';
import {bibleView,parseCorpus,parseReference,BOOKS} from './bible.js';
import {buildTheologianResponse} from './theologian.js';
import {topicsView,recentEntryForRoute,recordRecent} from './experience.js';
import {practiceView,checkPracticeGame} from './practice-experience.js';
import {finishPracticeRun,activatePracticeRun} from './practice-engine.js';
import {homeView,progressPanelView} from './progress-experience.js';
import {courseLandingView,courseDetailView,unitExperienceView} from './course-experience.js';

const main=document.querySelector('#main');
const nav=[...document.querySelectorAll('[data-route]')];
const guide=document.querySelector('#guide'),guideBody=document.querySelector('#guide-body');
const progressPanel=document.querySelector('#progress-panel'),progressBody=document.querySelector('#progress-body');
let data={courses:[],units:[],topics:[],lessons:[],masteryIds:[],activities:[],byUnit:{},byCourse:{},glossary:[]},corpus='',policy=null,statement='',theologySources=[],state=await getState();
const reviewSession=new Map(),STUDY_RETURN_KEY='canonical-shelf-study-return-v1';
const FALLBACK={authority:{normativeCeiling:'Canonical Shelf Statement of Faith',rule:'The Guide may explain positions beyond the Statement of Faith but may not establish them as Canonical Shelf doctrine.'},lgbtq:{claims:['LGBTQ people possess equal dignity and belonging.','Homosexual or bisexual orientation is not inherently sinful.','Faithful same-sex relationships and marriage may embody Christian virtue.','LGBTQ identity does not disqualify worship, service, teaching, leadership, or spiritual gifts.']},interpretiveRules:['Distinguish biblical text, historical context, lexical evidence, interpretation, reception history, doctrine, and application.','Do not render contested evidence as scholarly consensus.'],queerReception:{ruthNaomi:{allowed:'Some Christian and biblical interpreters read Ruth and Naomi through lesbian, homoerotic, female-same-sex-love, or queer-kinship lenses.',boundary:'The biblical narrator does not explicitly identify Ruth and Naomi as sexual partners; present this as reception history or interpretation, not uncontested textual fact.'}},prohibitedOverstatements:[]};

async function load(){
  try{data=await fetch('/data/catalog.json').then(r=>r.ok?r.json():Promise.reject())}catch{}
  try{corpus=await fetch('/data/corpus.txt').then(r=>r.ok?r.text():'')}catch{}
  try{policy=await fetch('/data/theology-policy.json').then(r=>r.ok?r.json():FALLBACK)}catch{policy=FALLBACK}
  try{statement=await fetch('/data/statement-of-faith.md').then(r=>r.ok?r.text():'')}catch{}
  try{theologySources=await fetch('/data/theology-sources.json').then(r=>r.ok?r.json():[])}catch{}
}
await load();policy||=FALLBACK;

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const roots=new Set(['home','course','bible','topics','practice','search']);
const route=()=>{const r=location.pathname.replace(/^\/+|\/+$/g,'').split('/')[0]||'home';return roots.has(r)?r:'home'};
const params=()=>new URLSearchParams(location.search);
const nativeHref=h=>h?.startsWith('#/')?h.slice(1):h;
function canonicalizeLinks(root=document){for(const a of root.querySelectorAll('a[href^="#/"]'))a.href=nativeHref(a.getAttribute('href'))}
function navigate(path,{replace=false}={}){history[replace?'replaceState':'pushState']({},'',nativeHref(path)||'/home');render()}
function setCurrent(r){nav.forEach(a=>a.toggleAttribute('aria-current',a.dataset.route===r))}
function shell(title,eye,body){return `<header class="section"><p class="eyebrow">${esc(eye)}</p><h1>${esc(title)}</h1></header>${body}`}
function activityHref(id){const a=data.activities?.find(x=>x.id===id);if(!a)return'/course';return a.type==='lesson'?`/course?unit=${encodeURIComponent(a.unitId)}&lesson=${encodeURIComponent(a.sourceId)}`:`/course?unit=${encodeURIComponent(a.unitId)}&mastery=${encodeURIComponent(a.sourceId)}`}
function refreshProgressPanel(){if(progressPanel&&!progressPanel.hidden)progressBody.innerHTML=progressPanelView({data,state,esc})}

function scriptureResults(q){
  const ref=parseReference(q);if(ref)return[{label:`${BOOKS[ref.bn-1]} ${ref.chapter}${ref.start?`:${ref.start}${ref.end!==ref.start?`-${ref.end}`:''}`:''}`,href:`/bible?book=${ref.bn}&chapter=${ref.chapter}`}];
  const n=q.toLowerCase();return parseCorpus(corpus).filter(r=>r.text.toLowerCase().includes(n)).slice(0,12).map(r=>({label:`${BOOKS[r.bn-1]} ${r.chapter}:${r.verse} — ${r.text}`,href:`/bible?book=${r.bn}&chapter=${r.chapter}`}));
}
function searchPage(q){
  const n=q.toLowerCase();
  const topics=data.topics.filter(t=>`${t.title} ${t.answer||''} ${(t.tags||[]).join(' ')}`.toLowerCase().includes(n)).slice(0,12);
  const units=data.units.filter(u=>`${u.title} ${u.scope}`.toLowerCase().includes(n)).slice(0,12);
  const terms=(data.glossary||[]).filter(term=>`${term.term} ${term.quick} ${(term.definitions||[]).join(' ')}`.toLowerCase().includes(n)).slice(0,12);
  const bible=scriptureResults(q);
  return shell(`Search: “${q}”`,'Across Canonical Shelf',`<div class="results"><section><h2>Bible</h2>${bible.map(x=>`<a class="result" href="${x.href}">${esc(x.label)}</a>`).join('')||'<p>No Scripture matches.</p>'}</section><section><h2>Topics</h2>${topics.map(t=>`<div class="result"><a href="/topics?topic=${encodeURIComponent(t.id)}"><strong>${esc(t.title)}</strong></a><p>${esc(t.answer||'').slice(0,220)}</p></div>`).join('')||'<p>No Topic matches.</p>'}</section><section><h2>Glossary</h2>${terms.map(term=>`<div class="result"><a href="/topics?mode=glossary&q=${encodeURIComponent(term.term)}"><strong>${esc(term.term)}</strong></a><p>${esc(term.quick)}</p></div>`).join('')||'<p>No glossary matches.</p>'}</section><section><h2>Course</h2>${units.map(u=>`<div class="result"><a href="/course?unit=${encodeURIComponent(u.id)}"><strong>${esc(u.title)}</strong></a><p>${esc(u.scope)}</p></div>`).join('')||'<p>No course matches.</p>'}</section><button class="button" data-ask="${esc(q)}">Ask the Guide about this</button></div>`);
}

function courseRouteView(p){
  if(!data.units.length)return shell('Course','Migration required','<p class="notice">Run bun run migrate.</p>');
  if(p.has('lesson')||p.has('mastery')||p.has('glossary'))return courseView(data,state,p,esc,corpus);
  const rawUnit=p.get('unit');
  if(rawUnit){
    if(rawUnit==='unit.orientation')return courseView(data,state,p,esc,corpus);
    const unitId=data.units.some(u=>u.id===rawUnit)?rawUnit:(data.legacyUnitAliases?.[rawUnit]||rawUnit),unit=data.units.find(u=>u.id===unitId);
    if(!unit)return courseView(data,state,p,esc,corpus);
    return unitExperienceView({data,state,unit,course:data.courses.find(c=>c.id===unit.courseId),esc});
  }
  const courseId=p.get('course');
  if(courseId){const course=data.courses.find(c=>c.id===courseId);return course?courseDetailView({data,state,course,esc}):'<p class="notice">Course not found.</p>'}
  return courseLandingView({data,state,esc});
}

function render(){
  const r=route(),p=params(),focus=r==='course'&&(p.has('lesson')||p.has('mastery'));
  document.body.classList.toggle('study-focus-active',focus);if(focus)guide.hidden=true;setCurrent(r);
  if(r==='search')main.innerHTML=searchPage(p.get('q')||'');
  else if(r==='course')main.innerHTML=courseRouteView(p);
  else if(r==='bible')main.innerHTML=bibleView(corpus,p,esc);
  else if(r==='topics')main.innerHTML=topicsView({data,params:p,esc});
  else if(r==='practice')main.innerHTML=practiceView({data,state,params:p,esc,dueReviews,activityHref});
  else main.innerHTML=homeView({data,state,esc});
  canonicalizeLinks(main);
  const recent=recentEntryForRoute(r,p,data,BOOKS);if(recent)recordRecent(recent);
  main.focus({preventScroll:true});refreshProgressPanel();activatePracticeRun(main);
}

function evidenceMarkup(e){const link=e.type==='topic'&&e.id?`/topics?topic=${encodeURIComponent(e.id)}`:e.type==='course'&&e.id?`/course?unit=${encodeURIComponent(e.id)}`:null;return `<article class="result"><p class="eyebrow">${esc(e.type)} · ${esc(e.evidence||'evidence')}</p><h4>${link?`<a href="${link}">${esc(e.label)}</a>`:esc(e.label)}</h4>${e.detail?`<p>${esc(e.detail)}</p>`:''}${e.limits?`<p><strong>Limit:</strong> ${esc(e.limits)}</p>`:''}</article>`}
function guideAnswer(q){
  let result;try{result=buildTheologianResponse({question:q,data,policy,statement,sources:theologySources,corpus,context:{scored:route()==='course'&&!!params().get('mastery')}})}catch{result={intent:'study',position:policy.authority.rule,method:policy.interpretiveRules||[],evidence:[],warnings:['The Guide withheld a response because its theological validation failed.'],masteryProtected:false}}
  guideBody.innerHTML=`<form id="guide-form"><label for="guide-q">Ask a study question</label><textarea id="guide-q" name="question" rows="3">${esc(q)}</textarea><button class="button">Ask</button></form><div class="evidence"><span class="badge">${esc(result.intent)}</span>${result.masteryProtected?'<span class="badge">mastery protected</span>':''}<span class="badge">bounded by ${esc(policy.authority.normativeCeiling)}</span><p class="lede">${esc(result.position)}</p></div>${result.warnings.length?`<div class="evidence"><h3>Evidence cautions</h3>${result.warnings.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}${result.evidence.length?`<section class="evidence"><h3>Evidence and connections</h3>${result.evidence.map(evidenceMarkup).join('')}</section>`:''}<div class="evidence"><h3>How the Guide is reasoning</h3><ul>${result.method.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="evidence"><span class="badge">offline evidence mode</span></div>`;
  canonicalizeLinks(guideBody);guide.hidden=false;
}

function rememberStudyReturn(link,url){if(document.body.classList.contains('study-focus-active'))return;if(url.pathname!=='/course'||(!url.searchParams.has('lesson')&&!url.searchParams.has('mastery')))return;try{sessionStorage.setItem(STUDY_RETURN_KEY,JSON.stringify({path:location.pathname+location.search,scrollY:window.scrollY,activity:link.dataset.activityLink||''}))}catch{}}
function exitStudy(button){
  let saved=null;try{saved=JSON.parse(sessionStorage.getItem(STUDY_RETURN_KEY)||'null')}catch{}
  const target=saved?.path||button.dataset.fallback||'/course';try{sessionStorage.removeItem(STUDY_RETURN_KEY)}catch{}navigate(target);
  requestAnimationFrame(()=>{if(Number.isFinite(saved?.scrollY))window.scrollTo({top:saved.scrollY,left:0,behavior:'auto'});if(saved?.activity)[...document.querySelectorAll('[data-activity-link]')].find(link=>link.dataset.activityLink===saved.activity)?.focus({preventScroll:true})});
}
function syncSequence(board){const cards=[...board.querySelectorAll('[data-seq-value]')];cards.forEach((card,index)=>{const input=card.querySelector('input[type="hidden"]');if(input&&!input.name.includes('-')){input.name=`p${index}`;input.value=card.dataset.seqValue}const position=card.querySelector('.sequence-card__index');if(position)position.textContent=String(index+1).padStart(2,'0');card.querySelectorAll('[data-seq-move]').forEach(button=>{button.disabled=(button.dataset.seqMove==='up'&&index===0)||(button.dataset.seqMove==='down'&&index===cards.length-1)})})}
function moveSequence(button){const card=button.closest('[data-seq-value]'),board=button.closest('[data-sequence-board]');if(!card||!board)return;if(button.dataset.seqMove==='up'&&card.previousElementSibling)board.insertBefore(card,card.previousElementSibling);if(button.dataset.seqMove==='down'&&card.nextElementSibling)board.insertBefore(card.nextElementSibling,card);syncSequence(board);card.focus?.()}
function toggleApparatus(open){const panel=document.querySelector('#study-apparatus');if(!panel)return;const next=open??!panel.classList.contains('is-open');panel.classList.toggle('is-open',next);document.querySelectorAll('[data-toggle-apparatus]').forEach(button=>button.setAttribute('aria-expanded',String(next)));if(next)panel.querySelector('summary,button,a')?.focus({preventScroll:true})}

window.addEventListener('popstate',render);
document.addEventListener('click',async e=>{
  const exitButton=e.target.closest('[data-exit-lesson]');if(exitButton){e.preventDefault();exitStudy(exitButton);return}
  const seqMove=e.target.closest('[data-seq-move]');if(seqMove){e.preventDefault();moveSequence(seqMove);return}
  if(e.target.closest('[data-toggle-apparatus]')){e.preventDefault();toggleApparatus();return}
  if(e.target.closest('[data-close-apparatus]')){e.preventDefault();toggleApparatus(false);return}
  const link=e.target.closest('a[href]');
  if(link&&!e.defaultPrevented&&e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&link.target!=='_blank'&&!link.hasAttribute('download')){const u=new URL(link.href,location.href);if(u.origin===location.origin&&roots.has(u.pathname.replace(/^\/+|\/+$/g,'').split('/')[0]||'home')){rememberStudyReturn(link,u);e.preventDefault();navigate(u.pathname+u.search+u.hash);return}}
  const ask=e.target.closest('[data-ask]');if(ask)guideAnswer(ask.dataset.ask);
  if(e.target.id==='export'){const blob=new Blob([await exportState()],{type:'application/json'}),x=document.createElement('a');x.href=URL.createObjectURL(blob);x.download='canonical-shelf-progress.json';x.click();URL.revokeObjectURL(x.href)}
  if(e.target.id==='import'){const input=document.createElement('input');input.type='file';input.accept='application/json';input.onchange=async()=>{try{await importState(await input.files[0].text());state=await getState();render()}catch(err){alert(err.message)}};input.click()}
});

document.addEventListener('submit',async e=>{
  if(e.target.id==='global-search'){e.preventDefault();const q=String(new FormData(e.target).get('q')||'').trim();if(q)navigate(`/search?q=${encodeURIComponent(q)}`);return}
  if(e.target.id==='bible-search'){e.preventDefault();navigate(`/bible?q=${encodeURIComponent(new FormData(e.target).get('bq')||'')}`);return}
  if(e.target.id==='library-search'){e.preventDefault();const fd=new FormData(e.target),q=String(fd.get('libraryq')||'').trim(),p=params(),view=p.get('view')||'shelf',group=p.get('group')||'';navigate(`/bible?view=${encodeURIComponent(view)}${group?`&group=${encodeURIComponent(group)}`:''}${q?`&libraryq=${encodeURIComponent(q)}`:''}`);return}
  if(e.target.id==='topic-search'){e.preventDefault();const fd=new FormData(e.target),q=String(fd.get('topic-q')||'').trim(),mode=String(fd.get('topic-mode')||'ask');navigate(`/topics?mode=${encodeURIComponent(mode)}${q?`&q=${encodeURIComponent(q)}`:''}`);return}
  if(e.target.matches('.arcade-config')){e.preventDefault();const fd=new FormData(e.target);navigate(`/practice?mode=arcade&game=${encodeURIComponent(fd.get('game')||'sequence')}&scope=${encodeURIComponent(fd.get('scope')||'all')}`);return}
  if(e.target.id==='guide-form'){e.preventDefault();guideAnswer(new FormData(e.target).get('question')||'');return}
  if(e.target.matches('[data-practice-run]')){e.preventDefault();const result=finishPracticeRun(e.target),feedback=e.target.querySelector('.feedback');feedback.innerHTML=result.html;canonicalizeLinks(feedback);return}
  if(e.target.matches('[data-practice-game]')){e.preventDefault();const result=checkPracticeGame(e.target),feedback=e.target.querySelector('.feedback');feedback.innerHTML=`<p class="notice"><strong>${result.ok?'Correct.':'Keep working.'}</strong> ${esc(result.message)}</p>`;return}
  if(!e.target.matches('.challenge'))return;
  e.preventDefault();
  const id=e.target.dataset.activity,index=Number(e.target.dataset.index),challenge=challengeFor(data,id,index),evaluation=checkChallenge(e.target,challenge),feedback=e.target.querySelector('.feedback');
  if(evaluation.mode==='reflection'&&!evaluation.submitted){feedback.innerHTML='<p class="notice"><strong>Add a reflection before saving.</strong></p>';return}
  const dueEntry=dueReviews(state).find(entry=>entry.id===id);
  state=await recordResult(id,{challengeIndex:index,totalChallenges:challengeCountFor(data,id),mode:evaluation.mode,passed:evaluation.correct===true,submitted:evaluation.submitted===true});
  document.dispatchEvent(new CustomEvent('canonical-state-changed',{detail:{activityId:id,state}}));
  let reviewAdvanced=false;
  if(dueEntry&&evaluation.mode==='scored'){
    let session=reviewSession.get(id);if(!session||session.dueAt!==dueEntry.dueAt){session={dueAt:dueEntry.dueAt,passed:new Set()};reviewSession.set(id,session)}
    if(evaluation.correct===true)session.passed.add(index);else session.passed.delete(index);
    const required=Array.from({length:challengeCountFor(data,id)},(_,challengeIndex)=>challengeIndex).filter(challengeIndex=>challengeEvaluationMode(challengeFor(data,id,challengeIndex))==='scored');
    if(required.length>0&&required.every(challengeIndex=>session.passed.has(challengeIndex))){state=await recordReview(id,true);reviewSession.delete(id);reviewAdvanced=true;document.dispatchEvent(new CustomEvent('canonical-state-changed',{detail:{activityId:id,state}}))}
  }
  if(evaluation.mode==='reflection')feedback.innerHTML='<p class="notice"><strong>Reflection saved.</strong> This response is not scored for correctness.</p>';
  else if(evaluation.correct===true)feedback.innerHTML=`<p class="notice"><strong>Correct.</strong> ${esc(challenge?.why||'Your response is supported by the activity.')}${reviewAdvanced?' Review interval advanced.':''}</p>`;
  else feedback.innerHTML=`<p class="notice"><strong>Not yet.</strong> ${esc(challenge?.hint||challenge?.hints?.[0]||'Return to the evidence and try again.')}</p>`;
  refreshProgressPanel();
});

document.addEventListener('change',e=>{if(e.target.id==='chapter-jump')navigate(`/bible?book=${encodeURIComponent(e.target.dataset.book)}&chapter=${encodeURIComponent(e.target.value)}`);if(e.target.id==='translation-select'&&e.target.value!=='bsb')e.target.value='bsb'});
document.querySelector('#guide-open').addEventListener('click',()=>{guideAnswer('What can you help me study?');document.querySelector('#guide-q')?.focus()});
document.querySelector('#guide-close').addEventListener('click',()=>{guide.hidden=true;document.querySelector('#guide-open').focus()});
document.querySelector('#progress-open').addEventListener('click',()=>{progressBody.innerHTML=progressPanelView({data,state,esc});progressPanel.hidden=false;progressPanel.querySelector('a,button')?.focus({preventScroll:true})});
document.querySelector('#progress-close').addEventListener('click',()=>{progressPanel.hidden=true;document.querySelector('#progress-open').focus()});
render();
