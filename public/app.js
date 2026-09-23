import {getState,recordResult,recordReview,dueReviews,exportState,importState} from './db.js';
import {courseView,challengeFor,challengeCountFor,challengeEvaluationMode,checkChallenge} from './learning.js';
import {bibleView,parseCorpus,parseReference,BOOKS} from './bible.js';
import {buildTheologianResponse} from './theologian.js';
import {requestCloudTheologian,cancelCloudTheologian} from './theologian-cloud.js';
import {topicsView,recentEntryForRoute,recordRecent} from './experience.js';
import {practiceView,checkPracticeGame} from './practice-experience.js';
import {finishPracticeRun,activatePracticeRun} from './practice-engine.js';
import {homeView,progressPanelView} from './progress-experience.js';
import {courseLandingView,courseDetailView,unitExperienceView} from './course-experience.js';
import {enhanceLearningVisuals} from './learning-visuals.js';
import {enhanceBibleState} from './bible-state.js';
import {searchExperienceView} from './search-experience.js';

const getMain=()=>document.querySelector('#main');
const nav=[...document.querySelectorAll('[data-route]')];
const theologian=document.querySelector('#guide'),theologianBody=document.querySelector('#guide-body');
const progressPanel=document.querySelector('#progress-panel'),progressBody=document.querySelector('#progress-body');
let data={courses:[],units:[],topics:[],lessons:[],masteryIds:[],activities:[],byUnit:{},byCourse:{},glossary:[]},corpus='',policy=null,statement='',theologySources=[],state=await getState();
const reviewSession=new Map(),STUDY_RETURN_KEY='canonical-shelf-study-return-v1';
const FALLBACK={authority:{normativeCeiling:'Canonical Shelf Statement of Faith',rule:'The Theologian may explain positions beyond the Statement of Faith but may not establish them as Canonical Shelf doctrine.'},lgbtq:{claims:['LGBTQ people possess equal dignity and belonging.','Homosexual or bisexual orientation is not inherently sinful.','Faithful same-sex relationships and marriage may embody Christian virtue.','LGBTQ identity does not disqualify worship, service, teaching, leadership, or spiritual gifts.']},interpretiveRules:['Distinguish biblical text, historical context, lexical evidence, interpretation, reception history, doctrine, and application.','Do not render contested evidence as scholarly consensus.'],queerReception:{ruthNaomi:{allowed:'Some Christian and biblical interpreters read Ruth and Naomi through lesbian, homoerotic, female-same-sex-love, or queer-kinship lenses.',boundary:'The biblical narrator does not explicitly identify Ruth and Naomi as sexual partners; present this as reception history or interpretation, not uncontested textual fact.'}},prohibitedOverstatements:[]};

async function load(){
  try{data=await fetch('/data/catalog.json').then(r=>r.ok?r.json():Promise.reject()); window.CANON_CATALOG=data; document.dispatchEvent(new CustomEvent('catalog:loaded',{detail:data}));}catch{}
  try{corpus=await fetch('/data/corpus.txt').then(r=>r.ok?r.text():'')}catch{}
  try{policy=await fetch('/data/theology-policy.json').then(r=>r.ok?r.json():FALLBACK)}catch{policy=FALLBACK}
  try{statement=await fetch('/data/statement-of-faith.md').then(r=>r.ok?r.text():'')}catch{}
  try{theologySources=await fetch('/data/theology-sources.json').then(r=>r.ok?r.json():[])}catch{}
}
await load();policy||=FALLBACK;

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const roots=new Set(['home','course','bible','topics','practice','search']);
const pathRoot=pathname=>String(pathname||'').replace(/^\/+|\/+$/g,'').split('/')[0].replace(/\.html$/,'')||'home';
const appRouteFromPath=pathname=>{const r=pathRoot(pathname);return roots.has(r)?r:null};
const routeFromPath=pathname=>appRouteFromPath(pathname)||'home';
const route=()=>routeFromPath(location.pathname);
const documentRoute=()=>document.querySelector('[data-route-document]')?.dataset.routeDocument||null;
const sameRouteNavigation=targetRoute=>targetRoute===route()&&documentRoute()===targetRoute;
const params=()=>new URLSearchParams(location.search);
const nativeHref=h=>h?.startsWith('#/')?h.slice(1):h;
function canonicalizeLinks(root=document){for(const a of root.querySelectorAll('a[href^="#/"]'))a.href=nativeHref(a.getAttribute('href'))}
function navigate(path,{replace=false}={}){
  const target=new URL(nativeHref(path)||'/home',location.href),targetPath=`${target.pathname}${target.search}${target.hash}`,targetRoute=routeFromPath(target.pathname);
  if(!sameRouteNavigation(targetRoute)){
    if(replace)location.replace(targetPath);else location.assign(targetPath);
    return;
  }
  history[replace?'replaceState':'pushState']({},'',targetPath);render();
}
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
  return shell(`Search: “${q}”`,'Across Canonical Shelf',`<div class="results"><section><h2>Bible</h2>${bible.map(x=>`<a class="result" href="${x.href}">${esc(x.label)}</a>`).join('')||'<p>No Scripture matches.</p>'}</section><section><h2>Topics</h2>${topics.map(t=>`<div class="result"><a href="/topics?topic=${encodeURIComponent(t.id)}"><strong>${esc(t.title)}</strong></a><p>${esc(t.answer||'').slice(0,220)}</p></div>`).join('')||'<p>No Topic matches.</p>'}</section><section><h2>Glossary</h2>${terms.map(term=>`<div class="result"><a href="/topics?mode=glossary&q=${encodeURIComponent(term.term)}"><strong>${esc(term.term)}</strong></a><p>${esc(term.quick)}</p></div>`).join('')||'<p>No glossary matches.</p>'}</section><section><h2>Course</h2>${units.map(u=>`<div class="result"><a href="/course?unit=${encodeURIComponent(u.id)}"><strong>${esc(u.title)}</strong></a><p>${esc(u.scope)}</p></div>`).join('')||'<p>No course matches.</p>'}</section><button class="button" data-ask="${esc(q)}">Ask the Theologian about this</button></div>`);
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
  const main=getMain();
  if(!main)return;
  const r=route(),p=params(),focus=r==='course'&&(p.has('lesson')||p.has('mastery'));
  document.body.classList.toggle('study-focus-active',focus);if(focus)theologian.hidden=true;setCurrent(r);
  
  let view;
  if(r==='search')view=searchExperienceView({query:p.get('q')||'',data,corpus,esc});
  else if(r==='course')view=courseRouteView(p);
  else if(r==='bible')view=bibleView(corpus,p,esc);
  else if(r==='topics')view=topicsView({data,params:p,esc});
  else if(r==='practice')view=practiceView({data,state,params:p,esc,dueReviews,activityHref});
  else view=homeView({data,state,esc});

  if(typeof view==='string'){
    main.innerHTML=view;
  }else{
    main.replaceChildren(view);
  }

  canonicalizeLinks(main);
  if(r==='course')enhanceLearningVisuals(main);
  if(r==='bible')enhanceBibleState(main,p);
  const bookDrawer=r==='bible'?main.querySelector('[data-book-drawer]'):null;
  document.body.classList.toggle('book-drawer-active',!!bookDrawer);
  const recent=recentEntryForRoute(r,p,data,BOOKS);if(recent)recordRecent(recent);
  if(bookDrawer)bookDrawer.querySelector('[data-book-drawer-close]')?.focus({preventScroll:true});
  else if(r==='bible'&&p.get('focus'))main.querySelector(`[data-book="${CSS.escape(p.get('focus'))}"]`)?.focus({preventScroll:true});
  else main.focus({preventScroll:true});
  refreshProgressPanel();activatePracticeRun(main);document.dispatchEvent(new CustomEvent('canonical-route-rendered',{detail:{route:r}}));
}

function evidenceMarkup(e){const fallback=e.type==='topic'&&e.id?`/topics?topic=${encodeURIComponent(e.id)}`:e.type==='course'&&e.id?`/course?unit=${encodeURIComponent(e.id)}`:null,link=e.href||fallback;return `<article class="result"><p class="eyebrow">${esc(e.type)} · ${esc(e.evidence||'evidence')}</p><h4>${link?`<a href="${esc(link)}"${/^https?:/i.test(link)?' target="_blank" rel="noreferrer"':''}>${esc(e.label)}</a>`:esc(e.label)}</h4>${e.detail?`<p>${esc(e.detail)}</p>`:''}${e.limits?`<p><strong>Limit:</strong> ${esc(e.limits)}</p>`:''}</article>`}
function theologianForm(q){return `<form id="guide-form"><label for="guide-q">Ask the Theologian a study question</label><textarea id="guide-q" name="question" rows="3">${esc(q)}</textarea><button class="button">Ask</button></form>`}
function answerMarkup(answer){return String(answer||'').trim().split(/\n\s*\n/).filter(Boolean).map(block=>`<p>${esc(block).replace(/\n/g,'<br>')}</p>`).join('')}
function deterministicTheologian(q){
  try{return buildTheologianResponse({question:q,data,policy,statement,sources:theologySources,corpus,context:{scored:route()==='course'&&!!params().get('mastery')}})}
  catch{return {intent:'study',position:policy.authority.rule,method:policy.interpretiveRules||[],evidence:[],warnings:['The Theologian withheld a response because its theological validation failed.'],masteryProtected:false}}
}
function deterministicMarkup(q,result,{cloudStatus=''}={}){
  return `${theologianForm(q)}${cloudStatus?`<p class="cloud-theologian-status" role="status" aria-live="polite">${esc(cloudStatus)}</p>`:''}<div class="evidence"><span class="badge">${esc(result.intent)}</span>${result.masteryProtected?'<span class="badge">mastery protected</span>':''}<span class="badge">bounded by ${esc(policy.authority.normativeCeiling)}</span><p class="lede">${esc(result.position)}</p></div>${result.warnings.length?`<div class="evidence"><h3>Evidence cautions</h3>${result.warnings.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}${result.evidence.length?`<section class="evidence"><h3>Evidence and connections</h3>${result.evidence.map(evidenceMarkup).join('')}</section>`:''}<div class="evidence"><h3>How the Theologian is reasoning</h3><ul>${result.method.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="evidence"><span class="badge">local evidence fallback</span></div>`
}
function cloudMarkup(q,result){
  const evidence=Array.isArray(result.evidence)?result.evidence:[],guardrails=Array.isArray(result.guardrails)?result.guardrails:[];
  return `${theologianForm(q)}<section class="evidence cloud-theologian-answer"><div class="badge-row"><span class="badge">Theologian</span><span class="badge">cloud grounded</span>${result.lgbtqResearchApplied?'<span class="badge">LGBTQ research applied</span>':''}</div><div class="cloud-theologian-copy">${answerMarkup(result.answer)}</div></section>${evidence.length?`<section class="evidence"><h3>Evidence and connections</h3>${evidence.map(evidenceMarkup).join('')}</section>`:''}<details class="evidence"><summary>Guardrails used for this answer</summary><ul>${guardrails.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><p class="meta">The current question and user-facing page context are processed by Canonical Shelf's Cloudflare Worker for this response. Canonical Shelf does not write the conversation to its database.</p></details><div class="evidence"><span class="badge">cloud synthesis</span><span class="badge">local evidence fallback available</span></div>`
}
async function theologianAnswer(question){
  const q=String(question||'').trim()||'What can you help me study?';
  const fallback=deterministicTheologian(q);
  theologianBody.innerHTML=deterministicMarkup(q,fallback,{cloudStatus:'Building a grounded response from the BSB, Canonical Shelf content, the Statement of Faith, and vetted theology research…'});
  canonicalizeLinks(theologianBody);theologian.hidden=false;
  try{
    const result=await requestCloudTheologian(q,{path:`${location.pathname}${location.search}`});
    if(theologianBody.querySelector('#guide-q')?.value.trim()!==q)return;
    theologianBody.innerHTML=cloudMarkup(q,result);canonicalizeLinks(theologianBody);
  }catch(error){
    if(error?.name==='AbortError')return;
    theologianBody.innerHTML=deterministicMarkup(q,fallback,{cloudStatus:'Cloud synthesis is unavailable right now. Canonical Shelf is showing the local evidence response instead.'});
    canonicalizeLinks(theologianBody);
  }
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

function markCorrectResponses(form,evaluation){
  form.querySelectorAll('.response-is-correct').forEach(node=>{node.classList.remove('response-is-correct');node.querySelector('[data-response-status]')?.remove()});
  if(evaluation.mode!=='scored')return;
  const mark=node=>{if(!node)return;node.classList.add('response-is-correct');const status=document.createElement('span');status.dataset.responseStatus='';status.className='response-status';status.innerHTML='<span aria-hidden="true">✓</span> Correct';node.append(status)};
  evaluation.correctItems.forEach((isCorrect,index)=>{
    if(!isCorrect)return;
    let node=null;
    if(evaluation.shape==='sequence')node=form.querySelectorAll('[data-seq-value]')[index];
    else if(evaluation.shape==='evidence-select')node=form.querySelector(`input[name="pick"][value="${index}"]:checked`)?.closest('.evidence-card');
    else if(evaluation.shape==='scenario')node=form.querySelector(`input[name="s${index}"]:checked`)?.closest('.answer-tile');
    else if(evaluation.shape==='single-choice')node=form.querySelector('input[name="choice"]:checked')?.closest('.answer-tile');
    else node=form.querySelector(`input[name="p${index}"]:checked`)?.closest('.answer-tile');
    mark(node);
  });
}

function nextActivity(id){
  const current=data.activities?.find(activity=>activity.id===id);if(!current)return null;
  const ordered=(data.byCourse?.[current.courseId]||[]).flatMap(unitId=>data.byUnit?.[unitId]||[]);
  return data.activities?.find(activity=>activity.id===ordered[ordered.indexOf(id)+1])||null;
}
function activityVerse(id,success){
  if(!id.startsWith('lesson:'))return null;
  const lesson=data.lessons?.find(item=>item.id===id.slice(7)),ref=lesson?.ref;if(!Array.isArray(ref))return null;
  const [bn,chapter,start=1,end=start]=ref.map(Number),verses=parseCorpus(corpus).filter(row=>row.bn===bn&&row.chapter===chapter&&row.verse>=start&&row.verse<=end);
  const verse=success?verses.at(-1):verses[0];return verse?{reference:`${BOOKS[bn-1]} ${chapter}:${verse.verse}`,text:verse.text}:null;
}
function activityContinuation(id){const next=nextActivity(id);return next?`<a class="button response-next" href="${activityHref(next.id)}">Continue to ${esc(next.title)} →</a>`:''}

document.addEventListener('keydown',event=>{
  const drawer=document.querySelector('[data-book-drawer]');
  if(!drawer)return;
  if(event.key==='Escape'){
    event.preventDefault();
    drawer.querySelector('[data-book-drawer-close]')?.click();
    return;
  }
  if(event.key!=='Tab')return;
  const focusable=[...drawer.querySelectorAll('a[href],button:not([disabled]),select:not([disabled]),textarea:not([disabled]),input:not([disabled])')].filter(node=>!node.hidden&&node.getClientRects().length);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
});

window.addEventListener('popstate',render);
document.addEventListener('click',async e=>{
  const exitButton=e.target.closest('[data-exit-lesson]');if(exitButton){e.preventDefault();exitStudy(exitButton);return}
  const seqMove=e.target.closest('[data-seq-move]');if(seqMove){e.preventDefault();moveSequence(seqMove);return}
  if(e.target.closest('[data-toggle-apparatus]')){e.preventDefault();toggleApparatus();return}
  if(e.target.closest('[data-close-apparatus]')){e.preventDefault();toggleApparatus(false);return}
  const link=e.target.closest('a[href]');
  if(link&&!e.defaultPrevented&&e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&link.target!=='_blank'&&!link.hasAttribute('download')){
    const u=new URL(link.href,location.href),targetRoute=u.origin===location.origin?appRouteFromPath(u.pathname):null;
    if(targetRoute){
      rememberStudyReturn(link,u);
      if(sameRouteNavigation(targetRoute)){e.preventDefault();navigate(u.pathname+u.search+u.hash);return}
    }
  }
  const ask=e.target.closest('[data-ask]');if(ask)void theologianAnswer(ask.dataset.ask);
  if(e.target.id==='export'){const blob=new Blob([await exportState()],{type:'application/json'}),x=document.createElement('a');x.href=URL.createObjectURL(blob);x.download='canonical-shelf-progress.json';x.click();URL.revokeObjectURL(x.href)}
  if(e.target.id==='import'){const input=document.createElement('input');input.type='file';input.accept='application/json';input.onchange=async()=>{try{await importState(await input.files[0].text());state=await getState();render()}catch(err){alert(err.message)}};input.click()}
});

document.addEventListener('submit',async e=>{
  if(e.target.id==='global-search'){e.preventDefault();const q=String(new FormData(e.target).get('q')||'').trim();if(q)navigate(`/search?q=${encodeURIComponent(q)}`);return}
  if(e.target.id==='bible-search'){e.preventDefault();navigate(`/bible?q=${encodeURIComponent(new FormData(e.target).get('bq')||'')}`);return}
  if(e.target.id==='library-search'){e.preventDefault();const fd=new FormData(e.target),q=String(fd.get('libraryq')||'').trim(),p=params(),view=p.get('view')||'shelf',group=p.get('group')||'';navigate(`/bible?view=${encodeURIComponent(view)}${group?`&group=${encodeURIComponent(group)}`:''}${q?`&libraryq=${encodeURIComponent(q)}`:''}`);return}
  if(e.target.id==='topic-search'){e.preventDefault();const fd=new FormData(e.target),q=String(fd.get('topic-q')||'').trim(),mode=String(fd.get('topic-mode')||'ask');navigate(`/topics?mode=${encodeURIComponent(mode)}${q?`&q=${encodeURIComponent(q)}`:''}`);return}
  if(e.target.matches('.arcade-config')){e.preventDefault();const fd=new FormData(e.target);navigate(`/practice?mode=arcade&game=${encodeURIComponent(fd.get('game')||'sequence')}&scope=${encodeURIComponent(fd.get('scope')||'all')}`);return}
  if(e.target.id==='guide-form'){e.preventDefault();void theologianAnswer(new FormData(e.target).get('question')||'');return}
  if(e.target.matches('[data-practice-run]')){e.preventDefault();const result=finishPracticeRun(e.target),feedback=e.target.querySelector('.feedback');feedback.innerHTML=result.html;canonicalizeLinks(feedback);return}
  if(e.target.matches('[data-practice-game]')){e.preventDefault();const result=checkPracticeGame(e.target),feedback=e.target.querySelector('.feedback');feedback.innerHTML=`<p class="notice"><strong>${result.ok?'Correct.':'Keep working.'}</strong> ${esc(result.message)}</p>`;return}
  if(!e.target.matches('.challenge'))return;
  e.preventDefault();
  const id=e.target.dataset.activity,index=Number(e.target.dataset.index),challenge=challengeFor(data,id,index),evaluation=checkChallenge(e.target,challenge),feedback=e.target.querySelector('.feedback');
  markCorrectResponses(e.target,evaluation);
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
  const completed=state.completed?.includes(id),verse=activityVerse(id,evaluation.correct===true);
  const verseMarkup=verse?`<blockquote class="response-scripture"><p>“${esc(verse.text)}”</p><cite>${esc(verse.reference)} · BSB</cite></blockquote>`:'';
  if(evaluation.mode==='reflection')feedback.innerHTML='<p class="notice"><strong>Reflection saved.</strong> This response is not scored for correctness.</p>';
  else if(evaluation.correct===true&&completed)feedback.innerHTML=`<div class="notice response-complete"><strong>✓ Lesson complete.</strong><p>${esc(challenge?.why||'Your response is supported by the activity.')}${reviewAdvanced?' Review interval advanced.':''}</p>${verseMarkup}${activityContinuation(id)}</div>`;
  else if(evaluation.correct===true)feedback.innerHTML=`<div class="notice"><strong>✓ Correct.</strong><p>${esc(challenge?.why||'Your response is supported by the activity.')}${reviewAdvanced?' Review interval advanced.':''}</p>${verseMarkup}</div>`;
  else feedback.innerHTML=`<div class="notice"><strong>Keep working.</strong><p>${esc(challenge?.hint||challenge?.hints?.[0]||'Return to the evidence and try again.')}</p>${verseMarkup}</div>`;
  canonicalizeLinks(feedback);refreshProgressPanel();
});

document.addEventListener('change',e=>{if(e.target.id==='chapter-jump')navigate(`/bible?book=${encodeURIComponent(e.target.dataset.book)}&chapter=${encodeURIComponent(e.target.value)}`);if(e.target.id==='translation-select'&&e.target.value!=='bsb')e.target.value='bsb'});
document.querySelector('#guide-open').addEventListener('click',()=>{void theologianAnswer('What can you help me study?');document.querySelector('#guide-q')?.focus()});
document.querySelector('#guide-close').addEventListener('click',()=>{cancelCloudTheologian();theologian.hidden=true;document.querySelector('#guide-open').focus()});
document.querySelector('#progress-open').addEventListener('click',()=>{progressBody.innerHTML=progressPanelView({data,state,esc});progressPanel.hidden=false;progressPanel.querySelector('a,button')?.focus({preventScroll:true})});
document.querySelector('#progress-close').addEventListener('click',()=>{progressPanel.hidden=true;document.querySelector('#progress-open').focus()});
render();
