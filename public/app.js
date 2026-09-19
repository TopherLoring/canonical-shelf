import {getState,recordResult,recordReview,dueReviews,exportState,importState} from './db.js';
import {courseView,challengeFor,challengeCountFor,challengeEvaluationMode,checkChallenge} from './learning.js';
import {bibleView,parseCorpus,parseReference,BOOKS} from './bible.js';
import {buildTheologianResponse} from './theologian.js';

const main=document.querySelector('#main'),nav=[...document.querySelectorAll('[data-route]')],guide=document.querySelector('#guide'),guideBody=document.querySelector('#guide-body');
let data={units:[],topics:[],lessons:[],masteryIds:[],activities:[],byUnit:{}},corpus='',policy=null,statement='',theologySources=[],state=await getState();
const reviewSession=new Map();
const FALLBACK={authority:{normativeCeiling:'Canonical Shelf Statement of Faith',rule:'The Guide may explain positions beyond the Statement of Faith but may not establish them as Canonical Shelf doctrine.'},lgbtq:{claims:['LGBTQ people possess equal dignity and belonging.','Homosexual or bisexual orientation is not inherently sinful.','Faithful same-sex relationships and marriage may embody Christian virtue.','LGBTQ identity does not disqualify worship, service, teaching, leadership, or spiritual gifts.']},interpretiveRules:['Distinguish biblical text, historical context, lexical evidence, interpretation, reception history, doctrine, and application.','Do not render contested evidence as scholarly consensus.'],queerReception:{ruthNaomi:{allowed:'Some Christian and biblical interpreters read Ruth and Naomi through lesbian, homoerotic, female-same-sex-love, or queer-kinship lenses.',boundary:'The biblical narrator does not explicitly identify Ruth and Naomi as sexual partners; present this as reception history or interpretation, not uncontested textual fact.'}},prohibitedOverstatements:[]};

async function load(){try{data=await fetch('/data/catalog.json').then(r=>r.ok?r.json():Promise.reject())}catch{}try{corpus=await fetch('/data/corpus.txt').then(r=>r.ok?r.text():'')}catch{}try{policy=await fetch('/data/theology-policy.json').then(r=>r.ok?r.json():FALLBACK)}catch{policy=FALLBACK}try{statement=await fetch('/data/statement-of-faith.md').then(r=>r.ok?r.text():'')}catch{}try{theologySources=await fetch('/data/theology-sources.json').then(r=>r.ok?r.json():[])}catch{}}
await load();
policy||=FALLBACK;

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roots=new Set(['home','course','bible','topics','practice','search']);
const route=()=>{const r=location.pathname.replace(/^\/+|\/+$/g,'').split('/')[0]||'home';return roots.has(r)?r:'home'};
const params=()=>new URLSearchParams(location.search);
const nativeHref=h=>h?.startsWith('#/')?h.slice(1):h;

function canonicalizeLinks(root=document){for(const a of root.querySelectorAll('a[href^="#/"]'))a.href=nativeHref(a.getAttribute('href'))}
function navigate(path,{replace=false}={}){const target=nativeHref(path)||'/home';history[replace?'replaceState':'pushState']({},'',target);render()}
function setCurrent(r){nav.forEach(a=>a.toggleAttribute('aria-current',a.dataset.route===r))}
function progress(){const total=data.activities?.length||139,done=state.completed?.filter(id=>/^(lesson|mastery):/.test(id)).length||0;return{done,total,pct:Math.round(done/Math.max(total,1)*100)}}
function shell(title,eye,body){return `<header class="section"><p class="eyebrow">${esc(eye)}</p><h1>${esc(title)}</h1></header>${body}`}
function nextUnit(){return data.units.find(u=>(data.byUnit?.[u.id]||[]).some(id=>!state.completed.includes(id)))}
function activityHref(id){const a=data.activities?.find(x=>x.id===id);if(!a)return'/course';return a.type==='lesson'?`/course?unit=${encodeURIComponent(a.unitId)}&lesson=${encodeURIComponent(a.sourceId)}`:`/course?unit=${encodeURIComponent(a.unitId)}&mastery=${encodeURIComponent(a.sourceId)}`}

function home(){const s=progress(),next=nextUnit();return `<section class="hero"><div><p class="eyebrow">Bible literacy for thoughtful adults</p><h1>Read with context.<br>Think with care.</h1><p class="lede">A self-paced course, complete Bible, curated reference library, and evidence-aware study guide. Progress measures understanding, not theological assent.</p><p><a class="button" href="${next?`/course?unit=${encodeURIComponent(next.id)}`:'/course'}">${next?'Continue the course':'Review the course'}</a></p></div><div><div class="stat"><strong>${s.pct}%</strong><span>${s.done}/${s.total} activities complete</span></div><div class="stat"><strong>25</strong><span>integrated units</span></div><div class="stat"><strong>${data.topics.length||45}</strong><span>curated Topics</span></div></div></section><section class="section"><h2>Your study shelf</h2><div class="grid"><article class="card"><p class="eyebrow">Course</p><h3>${esc(next?.title||'Independent review')}</h3><p>${esc(next?.scope||'Return to any unit and strengthen recall.')}</p><a href="/course">Open Course</a></article><article class="card"><p class="eyebrow">Bible</p><h3>Read the text itself</h3><p>Browse all 66 books or open a reference directly.</p><a href="/bible">Open Bible</a></article><article class="card"><p class="eyebrow">Topics</p><h3>Follow a question</h3><p>Doctrine, ethics, history, practice, and contested interpretations.</p><a href="/topics">Browse Topics</a></article></div></section>`}

function topics(){const id=params().get('topic');if(id){const t=data.topics.find(x=>x.id===id);if(!t)return shell('Topic not found','Topics','');return `<article class="reader"><p><a href="/topics">← All Topics</a></p><p class="eyebrow">Reference · not scored</p><h1>${esc(t.title)}</h1><p class="lede">${esc(t.answer||t.summary||'')}</p>${(Array.isArray(t.body)?t.body:[]).map(x=>`<p>${esc(x)}</p>`).join('')}<p><button class="button" data-ask="${esc(t.title)}">Ask the Guide about this</button></p></article>`}return shell('Topics','Curated reference · not scored',`<p class="lede">Direct answers, distinctions, Scripture connections, competing interpretations, and source trails.</p><div class="topic-list">${data.topics.map(t=>`<article class="topic-item"><h3><a href="/topics?topic=${encodeURIComponent(t.id)}">${esc(t.title)}</a></h3><p>${esc(t.answer||t.summary||'').slice(0,180)}</p></article>`).join('')||'<p class="notice">Run migration to populate Topics.</p>'}</div>`)}

function practice(){const s=progress(),due=dueReviews(state);return shell('Practice','Retrieval and transfer',`<p class="lede">Practice reinforces the course without becoming a second curriculum. Completion, mastery attempts, and review need remain separate.</p><div class="grid"><article class="card"><h3>Context vs. application</h3><p>Practice observation, context, interpretation, doctrine, reception history, and application.</p></article><article class="card"><h3>Review queue</h3><p>${due.length?`${due.length} spaced review ${due.length===1?'activity is':'activities are'} due.`:'No scheduled reviews are due.'}</p>${due.length?`<ol>${due.slice(0,8).map(x=>{const a=data.activities?.find(v=>v.id===x.id);return `<li><a href="${activityHref(x.id)}">${esc(a?.title||x.id)}</a></li>`}).join('')}</ol>`:''}</article><article class="card"><h3>Your progress</h3><p>${s.done}/${s.total} activities complete.</p><button class="button" id="export">Export progress</button> <button class="button" id="import">Import progress</button></article></div>`)}

function scriptureResults(q){const ref=parseReference(q);if(ref)return[{label:`${BOOKS[ref.bn-1]} ${ref.chapter}${ref.start?`:${ref.start}${ref.end!==ref.start?`-${ref.end}`:''}`:''}`,href:`/bible?book=${ref.bn}&chapter=${ref.chapter}`}];const n=q.toLowerCase();return parseCorpus(corpus).filter(r=>r.text.toLowerCase().includes(n)).slice(0,12).map(r=>({label:`${BOOKS[r.bn-1]} ${r.chapter}:${r.verse} — ${r.text}`,href:`/bible?book=${r.bn}&chapter=${r.chapter}`}))}
function searchPage(q){const n=q.toLowerCase(),topics=data.topics.filter(t=>`${t.title} ${t.answer||''} ${(t.tags||[]).join(' ')}`.toLowerCase().includes(n)).slice(0,12),units=data.units.filter(u=>`${u.title} ${u.scope}`.toLowerCase().includes(n)),bible=scriptureResults(q);return shell(`Search: “${q}”`,'Across Canonical Shelf',`<div class="results"><section><h2>Bible</h2>${bible.map(x=>`<a class="result" href="${x.href}">${esc(x.label)}</a>`).join('')||'<p>No Scripture matches.</p>'}</section><section><h2>Topics</h2>${topics.map(t=>`<div class="result"><a href="/topics?topic=${encodeURIComponent(t.id)}"><strong>${esc(t.title)}</strong></a><p>${esc(t.answer||'').slice(0,220)}</p></div>`).join('')||'<p>No Topic matches.</p>'}</section><section><h2>Course</h2>${units.map(u=>`<div class="result"><a href="/course?unit=${encodeURIComponent(u.id)}"><strong>${esc(u.title)}</strong></a><p>${esc(u.scope)}</p></div>`).join('')||'<p>No course matches.</p>'}</section><button class="button" data-ask="${esc(q)}">Ask the Guide about this</button></div>`)}
function render(){const r=route();setCurrent(r);if(r==='search')main.innerHTML=searchPage(params().get('q')||'');else if(r==='course')main.innerHTML=data.units.length?courseView(data,state,params(),esc):shell('Course','Migration required','<p class="notice">Run bun run migrate.</p>');else if(r==='bible')main.innerHTML=bibleView(corpus,params(),esc);else main.innerHTML=({home,topics,practice}[r]||home)();canonicalizeLinks(main);main.focus({preventScroll:true})}

function evidenceMarkup(e){const link=e.type==='topic'&&e.id?`/topics?topic=${encodeURIComponent(e.id)}`:e.type==='course'&&e.id?`/course?unit=${encodeURIComponent(e.id)}`:null;return `<article class="result"><p class="eyebrow">${esc(e.type)} · ${esc(e.evidence||'evidence')}</p><h4>${link?`<a href="${link}">${esc(e.label)}</a>`:esc(e.label)}</h4>${e.detail?`<p>${esc(e.detail)}</p>`:''}${e.limits?`<p><strong>Limit:</strong> ${esc(e.limits)}</p>`:''}</article>`}
function guideAnswer(q){let result;try{result=buildTheologianResponse({question:q,data,policy,statement,sources:theologySources,corpus,context:{scored:route()==='course'&&!!params().get('mastery')}})}catch{result={intent:'study',position:policy.authority.rule,method:policy.interpretiveRules||[],evidence:[],warnings:['The Guide withheld a response because its theological validation failed.'],masteryProtected:false}}guideBody.innerHTML=`<form id="guide-form"><label for="guide-q">Ask a study question</label><textarea id="guide-q" name="question" rows="3">${esc(q)}</textarea><button class="button">Ask</button></form><div class="evidence"><span class="badge">${esc(result.intent)}</span>${result.masteryProtected?'<span class="badge">mastery protected</span>':''}<span class="badge">bounded by ${esc(policy.authority.normativeCeiling)}</span><p class="lede">${esc(result.position)}</p></div>${result.warnings.length?`<div class="evidence"><h3>Evidence cautions</h3>${result.warnings.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:''}${result.evidence.length?`<section class="evidence"><h3>Evidence and connections</h3>${result.evidence.map(evidenceMarkup).join('')}</section>`:''}<div class="evidence"><h3>How the Guide is reasoning</h3><ul>${result.method.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="evidence"><span class="badge">offline evidence mode</span></div>`;canonicalizeLinks(guideBody);guide.hidden=false}

window.addEventListener('popstate',render);

document.addEventListener('click',async e=>{
  const link=e.target.closest('a[href]');
  if(link&&!e.defaultPrevented&&e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey&&link.target!=='_blank'&&!link.hasAttribute('download')){
    const u=new URL(link.href,location.href);
    if(u.origin===location.origin&&roots.has(u.pathname.replace(/^\/+|\/+$/g,'').split('/')[0]||'home')){
      e.preventDefault();
      navigate(u.pathname+u.search);
      return;
    }
  }

  const a=e.target.closest('[data-ask]');
  if(a)guideAnswer(a.dataset.ask);

  if(e.target.id==='export'){
    const blob=new Blob([await exportState()],{type:'application/json'}),x=document.createElement('a');
    x.href=URL.createObjectURL(blob);
    x.download='canonical-shelf-progress.json';
    x.click();
    URL.revokeObjectURL(x.href);
  }

  if(e.target.id==='import'){
    const input=document.createElement('input');
    input.type='file';
    input.accept='application/json';
    input.onchange=async()=>{
      try{
        await importState(await input.files[0].text());
        state=await getState();
        render();
      }catch(err){alert(err.message)}
    };
    input.click();
  }
});

document.addEventListener('submit',async e=>{
  if(e.target.id==='global-search'){
    e.preventDefault();
    const q=String(new FormData(e.target).get('q')||'').trim();
    if(q)navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  if(e.target.id==='bible-search'){
    e.preventDefault();
    navigate(`/bible?q=${encodeURIComponent(new FormData(e.target).get('bq')||'')}`);
  }

  if(e.target.id==='guide-form'){
    e.preventDefault();
    guideAnswer(new FormData(e.target).get('question')||'');
  }

  if(e.target.matches('.challenge')){
    e.preventDefault();

    const id=e.target.dataset.activity;
    const index=Number(e.target.dataset.index);
    const challenge=challengeFor(data,id,index);
    const evaluation=checkChallenge(e.target,challenge);
    const feedback=e.target.querySelector('.feedback');

    if(evaluation.mode==='reflection'&&!evaluation.submitted){
      feedback.innerHTML='<p class="notice"><strong>Add a reflection before saving.</strong></p>';
      return;
    }

    const dueEntry=dueReviews(state).find(entry=>entry.id===id);

    state=await recordResult(id,{
      challengeIndex:index,
      totalChallenges:challengeCountFor(data,id),
      mode:evaluation.mode,
      passed:evaluation.correct===true,
      submitted:evaluation.submitted===true
    });

    let reviewAdvanced=false;

    if(dueEntry&&evaluation.mode==='scored'){
      let session=reviewSession.get(id);
      if(!session||session.dueAt!==dueEntry.dueAt){
        session={dueAt:dueEntry.dueAt,passed:new Set()};
        reviewSession.set(id,session);
      }

      if(evaluation.correct===true)session.passed.add(index);
      else session.passed.delete(index);

      const required=Array.from({length:challengeCountFor(data,id)},(_,challengeIndex)=>challengeIndex)
        .filter(challengeIndex=>challengeEvaluationMode(challengeFor(data,id,challengeIndex))==='scored');

      if(required.length>0&&required.every(challengeIndex=>session.passed.has(challengeIndex))){
        state=await recordReview(id,true);
        reviewSession.delete(id);
        reviewAdvanced=true;
      }
    }

    if(evaluation.mode==='reflection'){
      feedback.innerHTML='<p class="notice"><strong>Reflection saved.</strong> This response is not scored for correctness.</p>';
    }else if(evaluation.correct===true){
      feedback.innerHTML=`<p class="notice"><strong>Correct.</strong> ${esc(challenge?.why||'Your response is supported by the activity.')}${reviewAdvanced?' Review interval advanced.':''}</p>`;
    }else{
      feedback.innerHTML=`<p class="notice"><strong>Not yet.</strong> ${esc(challenge?.hint||challenge?.hints?.[0]||'Return to the evidence and try again.')}</p>`;
    }
  }
});

document.addEventListener('change',e=>{if(e.target.id==='chapter-jump')navigate(`/bible?book=${encodeURIComponent(e.target.dataset.book)}&chapter=${encodeURIComponent(e.target.value)}`)});
document.querySelector('#guide-open').addEventListener('click',()=>{guideAnswer('What can you help me study?');document.querySelector('#guide-q')?.focus()});
document.querySelector('#guide-close').addEventListener('click',()=>{guide.hidden=true;document.querySelector('#guide-open').focus()});

render();
