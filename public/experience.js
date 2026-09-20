const RECENT_KEY='canonical-shelf-recent-v1';

const safeJson=(raw,fallback)=>{try{return JSON.parse(raw)}catch{return fallback}};
const completedSet=state=>new Set(state?.completed||[]);

export function recentActivity(){
  try{return safeJson(localStorage.getItem(RECENT_KEY)||'[]',[]).filter(x=>x&&x.href&&x.title).slice(0,12)}catch{return[]}
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

export function progressSummary(data,state){
  const completed=completedSet(state),activities=data.activities||[];
  const total=activities.length,done=activities.filter(a=>completed.has(a.id)).length;
  const due=Object.entries(state?.reviewSchedule||{}).filter(([,v])=>Date.parse(v?.dueAt)<=Date.now()).length;
  const courses=(data.courses||[]).map(course=>{
    const ids=data.byCourse?.[course.id]||[];
    const cdone=ids.filter(id=>completed.has(id)).length;
    return {...course,done:cdone,total:ids.length,pct:Math.round(cdone/Math.max(ids.length,1)*100)};
  });
  const next=activities.find(a=>!completed.has(a.id))||null;
  return {done,total,pct:Math.round(done/Math.max(total,1)*100),due,courses,next};
}

const activityHref=a=>a?.type==='lesson'?`/course?unit=${encodeURIComponent(a.unitId)}&lesson=${encodeURIComponent(a.sourceId)}`:a?`/course?unit=${encodeURIComponent(a.unitId)}&mastery=${encodeURIComponent(a.sourceId)}`:'/course';
const topicText=t=>t?.answer||t?.summary||'';

export function homeView({data,state,esc}){
  const s=progressSummary(data,state),next=s.next,nextUnit=next&&data.units?.find(u=>u.id===next.unitId),nextCourse=next&&data.courses?.find(c=>c.id===next.courseId);
  const featured=(data.topics||[])[Math.min(new Date().getDate()%Math.max((data.topics||[]).length,1),(data.topics||[]).length-1)]||(data.topics||[])[0];
  const recent=recentActivity().slice(0,6);
  return `<section class="experience-hero home-hero">
    <div class="experience-hero__copy"><p class="eyebrow">Canonical Shelf · Scripture in context</p><h1>Know the Bible.<br>Understand what you’re reading.</h1><p class="lede">Rigorous Bible learning without lecture-after-lecture: six connected courses, a complete reader, reference depth, active practice, and spaced retention.</p><div class="hero-actions"><a class="button button--primary" href="${activityHref(next)}">${next?'Continue learning':'Open Course'}</a><a class="button" href="/bible">Explore Scripture</a></div></div>
    <aside class="home-progress" aria-label="Current progress"><div class="progress-ring" style="--progress:${s.pct}" role="progressbar" aria-label="Overall Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.pct}"><span><strong>${s.pct}%</strong><small>${s.done}/${s.total}</small></span></div><div><p class="eyebrow">Current progress</p><h2>${s.due?`${s.due} review${s.due===1?'':'s'} due`:'Learning on track'}</h2><p>${nextCourse?`Course ${nextCourse.sequence} · ${esc(nextCourse.shortTitle||nextCourse.title)}`:'All current activities complete.'}</p></div></aside>
  </section>
  <section class="dashboard-grid" aria-label="Your learning dashboard">
    <article class="dashboard-card dashboard-card--wide"><p class="eyebrow">Suggested next activity</p><h2>${esc(next?.title||'Independent review')}</h2><p>${esc(nextUnit?.scope||'Return to a completed lesson, mastery activity, or a due review to strengthen retention.')}</p><a href="${activityHref(next)}">${next?'Continue where you left off':'Review the curriculum'} →</a></article>
    <article class="dashboard-card"><p class="eyebrow">Featured topic</p><h3>${esc(featured?.title||'Explore a question')}</h3><p>${esc(topicText(featured)).slice(0,190)}</p><a href="${featured?`/topics?topic=${encodeURIComponent(featured.id)}`:'/topics'}">Explore the question →</a></article>
    <article class="dashboard-card"><p class="eyebrow">Practice</p><h3>${s.due?'Review what is getting rusty':'Strengthen what you know'}</h3><p>${s.due?`${s.due} spaced review ${s.due===1?'is':'are'} ready now.`:'Use focused practice for order, context, themes, verses, and mastery.'}</p><a href="/practice">Open Practice →</a></article>
    <article class="dashboard-card"><p class="eyebrow">Bible</p><h3>Read the text itself</h3><p>Bookshelf, book profiles, chapters, search, canonical groups, and story chronology.</p><a href="/bible">Open Bible →</a></article>
  </section>
  <section class="course-strip"><div class="section-lead"><div><p class="eyebrow">Six-course path</p><h2>One connected journey.</h2></div><a href="/course">View full Course →</a></div><div class="course-progress-grid">${s.courses.map(c=>`<a class="course-progress-card" href="/course?course=${encodeURIComponent(c.id)}"><span>Course ${c.sequence}</span><strong>${esc(c.shortTitle||c.title)}</strong><div class="progress"><span style="width:${c.pct}%"></span></div><small>${c.done}/${c.total} activities · ${c.pct}%</small></a>`).join('')}</div></section>
  <section class="recent-section"><div class="section-lead"><div><p class="eyebrow">Recent activity</p><h2>Pick up without hunting for your place.</h2></div><span>Stored locally</span></div>${recent.length?`<div class="recent-grid">${recent.map(item=>`<a class="recent-item" href="${esc(item.href)}"><span>${esc(item.kind||'Study')}</span><strong>${esc(item.title)}</strong>${item.detail?`<small>${esc(item.detail)}</small>`:''}</a>`).join('')}</div>`:'<p class="notice">Lessons, Bible passages, and Topics you open will appear here.</p>'}</section>`;
}

const TOPIC_GROUPS=[
  ['ask','Ask / search',()=>true,'Search the reference library or ask the Guide.'],
  ['theology','Theology & doctrine',t=>/doctrine|theolog|trinity|salvation|atonement|spirit|church|grace/i.test(`${t.title} ${(t.tags||[]).join(' ')}`),'Belief, doctrine, salvation, Church, Spirit, and theological frameworks.'],
  ['life','Christian life',t=>/life|practice|prayer|ethic|forgive|relationship|vocation|worship/i.test(`${t.title} ${(t.tags||[]).join(' ')}`),'Prayer, ethics, worship, relationships, vocation, and discipleship.'],
  ['concepts','Biblical concepts',t=>/scripture|bible|canon|covenant|kingdom|gospel|prophe|wisdom|temple|sacrifice/i.test(`${t.title} ${(t.tags||[]).join(' ')}`),'Major biblical ideas and how they connect across Scripture.'],
  ['difficult','Difficult questions',t=>/difficult|suffer|evil|lgbtq|judg|hell|violence|miracle|science|slavery|women/i.test(`${t.title} ${(t.tags||[]).join(' ')}`),'Contested texts and questions handled with evidence labels and interpretive limits.'],
  ['glossary','Glossary',()=>false,'Quick definitions with deeper lexical/contextual treatment.'],
  ['related','Related exploration',t=>Array.isArray(t.related)&&t.related.length>0,'Follow relationships between questions, passages, concepts, and courses.']
];

function filterTopics(data,mode,q){
  const topics=data.topics||[],needle=String(q||'').trim().toLowerCase();
  if(needle)return topics.filter(t=>`${t.title} ${topicText(t)} ${(t.tags||[]).join(' ')} ${(t.body||[]).join(' ')}`.toLowerCase().includes(needle));
  const group=TOPIC_GROUPS.find(([id])=>id===mode);
  return group&&mode!=='ask'?topics.filter(group[2]):topics;
}

export function topicsView({data,params,esc}){
  const id=params.get('topic');
  if(id){
    const t=(data.topics||[]).find(x=>x.id===id);if(!t)return `<header class="section"><p class="eyebrow">Topics</p><h1>Topic not found</h1></header>`;
    const related=(t.related||[]).map(rid=>(data.topics||[]).find(x=>x.id===rid)).filter(Boolean).slice(0,8);
    const tagRelated=(data.topics||[]).filter(x=>x.id!==t.id&&(x.tags||[]).some(tag=>(t.tags||[]).includes(tag))).slice(0,6);
    return `<article class="topic-reader"><p><a href="/topics">← All Topics</a></p><p class="eyebrow">Reference · not scored</p><h1>${esc(t.title)}</h1><p class="lede">${esc(topicText(t))}</p>${(Array.isArray(t.body)?t.body:[]).map(x=>`<p>${esc(x)}</p>`).join('')}<div class="topic-actions"><button class="button" data-ask="${esc(t.title)}">Ask the Guide</button><a class="button" href="/search?q=${encodeURIComponent(t.title)}">Search connections</a></div>${(related.length||tagRelated.length)?`<section class="related-topics"><p class="eyebrow">Related exploration</p><div class="topic-card-grid">${[...related,...tagRelated].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(0,8).map(x=>`<a class="topic-card" href="/topics?topic=${encodeURIComponent(x.id)}"><strong>${esc(x.title)}</strong><span>${esc(topicText(x)).slice(0,120)}</span></a>`).join('')}</div></section>`:''}</article>`;
  }
  const mode=params.get('mode')||'ask',q=params.get('q')||'';
  if(mode==='glossary'){
    const terms=(data.glossary||[]).filter(term=>!q||`${term.term} ${term.quick} ${(term.definitions||[]).join(' ')}`.toLowerCase().includes(q.toLowerCase()));
    return `<header class="section compact-section"><p class="eyebrow">Topics · Reference</p><h1>Glossary</h1><p class="lede">Quick definitions that keep you moving, with deeper language and context when you want it.</p></header>${topicModeNav(data,mode,esc)}<form class="reference-search" id="topic-search"><input name="topic-q" value="${esc(q)}" placeholder="Search glossary…"><input type="hidden" name="topic-mode" value="glossary"><button>Search</button></form><div class="glossary-grid">${terms.map(term=>`<article id="${esc(term.id||term.term)}" class="glossary-card"><h3>${esc(term.term)}</h3><p>${esc(term.quick||term.definitions?.[0]||'')}</p>${term.definitions?.length>1?`<details><summary>Go deeper</summary>${term.definitions.map(d=>`<p>${esc(d)}</p>`).join('')}</details>`:''}</article>`).join('')}</div>`;
  }
  const results=filterTopics(data,mode,q);
  return `<header class="section compact-section"><p class="eyebrow">Curated reference · not scored</p><h1>Topics</h1><p class="lede">Ask what something means, compare responsible interpretations, and follow Scripture, history, doctrine, practice, and related questions without turning reference into a second course.</p></header>${topicModeNav(data,mode,esc)}<form class="reference-search" id="topic-search"><input name="topic-q" value="${esc(q)}" placeholder="Ask or search Topics…"><input type="hidden" name="topic-mode" value="${esc(mode)}"><button>Search</button></form><div class="topic-card-grid topic-card-grid--results">${results.map(t=>`<a class="topic-card" href="/topics?topic=${encodeURIComponent(t.id)}"><span>${esc((t.tags||[])[0]||'Reference')}</span><strong>${esc(t.title)}</strong><small>${esc(topicText(t)).slice(0,175)}</small></a>`).join('')||'<p class="notice">No matching Topics.</p>'}</div>`;
}

function topicModeNav(data,active,esc){
  const topics=data.topics||[];
  return `<nav class="mode-map topic-mode-map" aria-label="Topic entry modes">${TOPIC_GROUPS.map(([id,label,test,description])=>{const count=id==='glossary'?(data.glossary||[]).length:id==='ask'?topics.length:topics.filter(test).length;return `<a class="mode-card" href="/topics?mode=${id}" ${active===id?'aria-current="page"':''}><strong>${esc(label)}</strong><span>${count}${id==='glossary'?' terms':' guides'}</span><small>${esc(description)}</small></a>`}).join('')}</nav>`;
}

function practiceOverview(dueCount,esc){
  const modes=[
    ['review','Recommended review',dueCount?`${dueCount} spaced review${dueCount===1?' is':'s are'} due now.`:'Return to material when its next spaced review becomes due.'],
    ['order','Book & order','Strengthen canonical sequence, groups, and shelf orientation.'],
    ['context','Context & interpretation','Practice genre, speaker/audience, evidence, and responsible reading.'],
    ['themes','Themes','Trace covenant, kingdom, presence, exile, restoration, and other themes across settings.'],
    ['verses','Verses','Recover key passages by reference and context rather than isolated slogans.'],
    ['games','Games & mastery','Replay mastery and synthesis activities without creating a second curriculum.']
  ];
  return `<nav class="mode-map practice-mode-map" aria-label="Practice modes">${modes.map(([id,title,copy])=>`<a class="mode-card" href="/practice?mode=${id}"><strong>${esc(title)}</strong><small>${esc(copy)}</small><span>Open practice →</span></a>`).join('')}</nav>`;
}

const ORDER_ITEMS=['Genesis','Exodus','Leviticus','Numbers','Deuteronomy'];
const THEME_ITEMS=[['Covenant','Promise and binding relationship'],['Exile','Displacement after covenant/kingdom crisis'],['Temple','Sacred center associated with divine presence and worship'],['Kingdom','God’s reign and the contested shape of human rule']];

export function practiceView({data,state,params,esc,dueReviews,activityHref}){
  const due=dueReviews(state),mode=params.get('mode');
  if(!mode)return `<header class="section compact-section"><p class="eyebrow">Retrieval · retention · transfer</p><h1>Practice</h1><p class="lede">Reinforce what you know without turning review into another course. Practice adapts to what is due and gives you focused ways to strengthen structure, context, themes, verses, and mastery.</p></header>${practiceOverview(due.length,esc)}`;
  const back='<p><a href="/practice">← Practice overview</a></p>';
  if(mode==='review')return `${back}<header class="section compact-section"><p class="eyebrow">Recommended review</p><h1>${due.length?`${due.length} review${due.length===1?'':'s'} due`:'Nothing due right now'}</h1></header>${due.length?`<div class="review-list">${due.map(x=>{const a=(data.activities||[]).find(v=>v.id===x.id);return `<a class="review-item" href="${activityHref(x.id)}"><span>Stage ${Number(x.stage)+1} · ${x.intervalDays} day interval</span><strong>${esc(a?.title||x.id)}</strong><small>Open the original activity in Study Focus and complete its scored checks to advance the interval.</small></a>`}).join('')}</div>`:'<p class="notice">Use another practice mode or continue the Course. Completed scored activities will appear here when their review interval comes due.</p>'}`;
  if(mode==='order')return `${back}<header class="section compact-section"><p class="eyebrow">Book & order</p><h1>Build the opening shelf</h1><p class="lede">Put the five books of the Torah/Pentateuch into canonical order.</p></header><form class="practice-game" data-practice-game="order"><ol class="sequence-board" data-sequence-board>${[...ORDER_ITEMS].reverse().map((item,index)=>`<li class="sequence-card" data-seq-value="${ORDER_ITEMS.indexOf(item)}" tabindex="-1"><input type="hidden" name="p${index}" value="${ORDER_ITEMS.indexOf(item)}"><span class="sequence-card__index">${String(index+1).padStart(2,'0')}</span><span class="sequence-card__text">${item}</span><span class="sequence-card__controls"><button type="button" data-seq-move="up">↑</button><button type="button" data-seq-move="down">↓</button></span></li>`).join('')}</ol><button class="button" type="submit">Check order</button><div class="feedback" role="status"></div></form>`;
  if(mode==='context')return `${back}<header class="section compact-section"><p class="eyebrow">Context & interpretation</p><h1>Choose the responsible first move</h1></header><form class="practice-game" data-practice-game="context"><p class="practice-prompt">Someone quotes one verse to settle a disputed question. What should you do first?</p>${['Identify the verse’s literary and historical context.','Choose the interpretation most familiar to you.','Ignore the passage because people disagree.'].map((x,i)=>`<label class="answer-tile"><input type="radio" name="choice" value="${i}"><span>${esc(x)}</span></label>`).join('')}<button class="button" type="submit">Check response</button><div class="feedback" role="status"></div></form>`;
  if(mode==='themes')return `${back}<header class="section compact-section"><p class="eyebrow">Themes</p><h1>Match the thread to its role</h1></header><form class="practice-game" data-practice-game="themes">${THEME_ITEMS.map(([term,definition],i)=>`<fieldset class="match-card"><legend>${esc(term)}</legend><select name="theme-${i}"><option value="">Choose…</option>${THEME_ITEMS.map(([,d],j)=>`<option value="${j}">${esc(d)}</option>`).join('')}</select></fieldset>`).join('')}<button class="button" type="submit">Check matches</button><div class="feedback" role="status"></div></form>`;
  if(mode==='verses')return `${back}<header class="section compact-section"><p class="eyebrow">Verses</p><h1>Locate before you quote</h1><p class="lede">Verse practice should recover context, not merely memorize slogans.</p></header><form class="practice-game" data-practice-game="verses"><p class="practice-prompt">“The LORD is my shepherd…” begins which passage?</p>${['Psalm 23','Isaiah 53','John 10'].map((x,i)=>`<label class="answer-tile"><input type="radio" name="choice" value="${i}"><span>${esc(x)}</span></label>`).join('')}<button class="button" type="submit">Check response</button><div class="feedback" role="status"></div></form><p><a href="/bible?book=19&chapter=23">Open Psalm 23 in the Bible reader →</a></p>`;
  if(mode==='games'){
    const mastery=(data.activities||[]).filter(a=>a.type==='mastery').slice(0,24);
    return `${back}<header class="section compact-section"><p class="eyebrow">Games & mastery</p><h1>Replay synthesis work</h1><p class="lede">Mastery activities remain part of the Course record; Practice gives you another doorway into them without a second completion model.</p></header><div class="mastery-replay-grid">${mastery.map(a=>`<a class="topic-card" href="${activityHref(a.id)}"><span>${(state.completed||[]).includes(a.id)?'Completed · replay':'Available'}</span><strong>${esc(a.title)}</strong><small>${esc((data.units||[]).find(u=>u.id===a.unitId)?.title||'Unit mastery')}</small></a>`).join('')}</div>`;
  }
  return `${back}${practiceOverview(due.length,esc)}`;
}

export function checkPracticeGame(form){
  const kind=form.dataset.practiceGame,fd=new FormData(form);
  if(kind==='order')return [0,1,2,3,4].every((value,index)=>Number(fd.get(`p${index}`))===value)?{ok:true,message:'Correct. Genesis → Exodus → Leviticus → Numbers → Deuteronomy.'}:{ok:false,message:'Not yet. Think creation/patriarchs → Exodus → Leviticus → Numbers → Deuteronomy.'};
  if(kind==='context')return {ok:fd.get('choice')==='0',message:fd.get('choice')==='0'?'Correct. Context and evidence come before application or argument.':'Start with literary and historical context before deciding what the verse can establish.'};
  if(kind==='themes')return {ok:THEME_ITEMS.every((_,i)=>Number(fd.get(`theme-${i}`))===i),message:'Each theme has a distinct role, but the course will repeatedly show how they overlap across the biblical story.'};
  if(kind==='verses')return {ok:fd.get('choice')==='0',message:fd.get('choice')==='0'?'Correct. Psalm 23 opens with the shepherd confession.':'The line opens Psalm 23. Open the passage and read the whole psalm in context.'};
  return {ok:false,message:'Choose a response before checking.'};
}

export function progressPanelView({data,state,esc}){
  const s=progressSummary(data,state),recent=recentActivity().slice(0,6);
  return `<div class="progress-panel__summary"><div class="progress-ring progress-ring--small" style="--progress:${s.pct}"><span><strong>${s.pct}%</strong><small>${s.done}/${s.total}</small></span></div><div><p class="eyebrow">Learning progress</p><h3>${s.due?`${s.due} review${s.due===1?'':'s'} due`:'No reviews due'}</h3><p>Completion, mastery, and review state remain local-first and can be backed up or synced separately.</p></div></div><div class="progress-panel__courses">${s.courses.map(c=>`<a href="/course?course=${encodeURIComponent(c.id)}"><span>Course ${c.sequence}</span><strong>${esc(c.shortTitle||c.title)}</strong><small>${c.pct}% · ${c.done}/${c.total}</small></a>`).join('')}</div><section><h3>Recent activity</h3>${recent.length?`<ul>${recent.map(x=>`<li><a href="${esc(x.href)}">${esc(x.title)}</a></li>`).join('')}</ul>`:'<p>No recent activity yet.</p>'}</section><section><h3>Backup</h3><p><button class="button" id="export">Export progress</button> <button class="button" id="import">Import progress</button></p></section>`;
}

export function recentEntryForRoute(route,params,data,books){
  if(route==='course'){
    const lesson=params.get('lesson'),mastery=params.get('mastery');
    if(lesson){const l=(data.lessons||[]).find(x=>x.id===lesson);return l?{kind:'Lesson',title:l.title,detail:(data.units||[]).find(u=>u.id===l.unitId)?.title||'',href:location.pathname+location.search}:null}
    if(mastery){const a=(data.activities||[]).find(x=>x.sourceId===mastery&&x.type==='mastery');return a?{kind:'Mastery',title:a.title,detail:(data.units||[]).find(u=>u.id===a.unitId)?.title||'',href:location.pathname+location.search}:null}
  }
  if(route==='bible'){
    const bn=Number(params.get('book')),chapter=Number(params.get('chapter'));if(bn&&chapter)return{kind:'Bible',title:`${books[bn-1]} ${chapter}`,href:location.pathname+location.search};
  }
  if(route==='topics'){
    const id=params.get('topic'),t=(data.topics||[]).find(x=>x.id===id);if(t)return{kind:'Topic',title:t.title,href:location.pathname+location.search};
  }
  return null;
}