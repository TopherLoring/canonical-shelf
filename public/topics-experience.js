const topicText=t=>t?.answer||t?.summary||'';
const topicSearchText=t=>[
  t?.title,
  t?.kind,
  topicText(t),
  ...(t?.aliases||[]),
  ...(t?.tags||[]),
  ...(t?.refs||[]),
  ...(t?.sections||[]).flatMap(section=>Array.isArray(section)?section:[]),
  ...(t?.body||[])
].filter(Boolean).join(' ');

const TOPIC_GROUPS=[
  ['ask','Ask / search',()=>true,'Search the reference library or ask the Guide.'],
  ['theology','Theology & doctrine',t=>/doctrine|theolog|trinity|salvation|atonement|spirit|church|grace/i.test(`${t.title} ${t.kind||''} ${(t.tags||[]).join(' ')}`),'Belief, doctrine, salvation, Church, Spirit, and theological frameworks.'],
  ['life','Christian life',t=>/life|practice|prayer|ethic|forgive|relationship|vocation|worship/i.test(`${t.title} ${t.kind||''} ${(t.tags||[]).join(' ')}`),'Prayer, ethics, worship, relationships, vocation, and discipleship.'],
  ['concepts','Biblical concepts',t=>/scripture|bible|canon|covenant|kingdom|gospel|prophe|wisdom|temple|sacrifice/i.test(`${t.title} ${t.kind||''} ${(t.tags||[]).join(' ')}`),'Major biblical ideas and how they connect across Scripture.'],
  ['difficult','Difficult questions',t=>/difficult|suffer|evil|lgbtq|judg|hell|violence|miracle|science|slavery|women/i.test(`${t.title} ${t.kind||''} ${(t.tags||[]).join(' ')}`),'Contested texts and questions handled with evidence labels and interpretive limits.'],
  ['glossary','Glossary',()=>false,'Quick definitions with deeper lexical/contextual treatment.'],
  ['related','Related exploration',t=>Array.isArray(t.related)&&t.related.length>0,'Follow relationships between questions, passages, concepts, and courses.']
];

function filterTopics(data,mode,q){
  const topics=data.topics||[],needle=String(q||'').trim().toLowerCase();
  if(needle)return topics.filter(t=>topicSearchText(t).toLowerCase().includes(needle));
  const group=TOPIC_GROUPS.find(([id])=>id===mode);
  return group&&mode!=='ask'?topics.filter(group[2]):topics;
}

function topicModeNav(data,active,esc){
  const topics=data.topics||[];
  return `<nav class="mode-map topic-mode-map" aria-label="Topic entry modes">${TOPIC_GROUPS.map(([id,label,test,description])=>{const count=id==='glossary'?(data.glossary||[]).length:id==='ask'?topics.length:topics.filter(test).length;return `<a class="mode-card" href="/topics?mode=${id}" ${active===id?'aria-current="page"':''}><strong>${esc(label)}</strong><span>${count}${id==='glossary'?' terms':' guides'}</span><small>${esc(description)}</small></a>`}).join('')}</nav>`;
}

const courseConnections=(data,t)=>{
  const terms=[...(t.tags||[]),...(t.aliases||[]),t.title].filter(Boolean).map(x=>String(x).toLowerCase());
  return (data.units||[]).map(unit=>({unit,score:terms.reduce((score,term)=>score+(`${unit.title} ${unit.scope||''}`.toLowerCase().includes(term)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5).map(x=>x.unit);
};

const referenceLinks=(refs,esc)=>refs?.length?`<section class="topic-evidence"><p class="eyebrow">Scripture connections</p><div class="topic-reference-list">${refs.map(ref=>`<a href="/search?q=${encodeURIComponent(ref)}"><strong>${esc(ref)}</strong><span>Open passage/search context →</span></a>`).join('')}</div></section>`:'';

const sectionMarkup=(sections,esc)=>sections?.length?`<section class="topic-sections" aria-label="Topic explanation">${sections.map((section,index)=>{const [title,body]=Array.isArray(section)?section:[`Section ${index+1}`,String(section||'')];return `<article class="topic-section"><p class="eyebrow">Explanation</p><h2>${esc(title||`Section ${index+1}`)}</h2><p>${esc(body||'')}</p></article>`}).join('')}</section>`:'';

const aliasMarkup=(aliases,esc)=>aliases?.length?`<details class="topic-aliases"><summary>Related search language</summary><div class="badge-row">${aliases.map(alias=>`<span>${esc(alias)}</span>`).join('')}</div></details>`:'';

export function topicsView({data,params,esc}){
  const id=params.get('topic');
  if(id){
    const t=(data.topics||[]).find(x=>x.id===id);if(!t)return `<header class="section"><p class="eyebrow">Topics</p><h1>Topic not found</h1></header>`;
    const related=(t.related||[]).map(rid=>(data.topics||[]).find(x=>x.id===rid)).filter(Boolean);
    const tagRelated=(data.topics||[]).filter(x=>x.id!==t.id&&(x.tags||[]).some(tag=>(t.tags||[]).includes(tag))).slice(0,8);
    const units=courseConnections(data,t);
    return `<article class="topic-reader topic-reference-page"><p><a href="/topics">← All Topics</a></p><div class="topic-reference-heading"><div><p class="eyebrow">${esc(t.kind||'Reference')} · not scored</p><h1>${esc(t.title)}</h1><p class="lede">${esc(topicText(t))}</p></div><aside class="topic-reference-meta"><span>${(t.refs||[]).length} Scripture connection${(t.refs||[]).length===1?'':'s'}</span><span>${(t.related||[]).length} authored relationship${(t.related||[]).length===1?'':'s'}</span><span>${(t.tags||[]).length} topic tag${(t.tags||[]).length===1?'':'s'}</span></aside></div>${aliasMarkup(t.aliases,esc)}${sectionMarkup(t.sections,esc)}${(Array.isArray(t.body)?t.body:[]).map(x=>`<p class="topic-body-extra">${esc(x)}</p>`).join('')}${referenceLinks(t.refs,esc)}${units.length?`<section class="topic-evidence"><p class="eyebrow">Course connections</p><div class="topic-course-links">${units.map(unit=>`<a href="/course?unit=${encodeURIComponent(unit.id)}"><strong>${esc(unit.title)}</strong><span>${esc(unit.scope||'Open related unit')}</span></a>`).join('')}</div></section>`:''}<div class="topic-actions"><button class="button" data-ask="${esc(t.title)}">Ask the Guide about this</button><a class="button" href="/search?q=${encodeURIComponent(t.title)}">Search all connections</a></div>${(related.length||tagRelated.length)?`<section class="related-topics"><p class="eyebrow">Related exploration</p><div class="topic-card-grid">${[...related,...tagRelated].filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(0,10).map(x=>`<a class="topic-card" href="/topics?topic=${encodeURIComponent(x.id)}"><span>${esc(x.kind||(x.tags||[])[0]||'Reference')}</span><strong>${esc(x.title)}</strong><small>${esc(topicText(x)).slice(0,150)}</small></a>`).join('')}</div></section>`:''}</article>`;
  }
  const mode=params.get('mode')||'ask',q=params.get('q')||'';
  if(mode==='glossary'){
    const terms=(data.glossary||[]).filter(term=>!q||`${term.term} ${term.quick} ${(term.definitions||[]).join(' ')}`.toLowerCase().includes(q.toLowerCase()));
    return `<header class="section compact-section"><p class="eyebrow">Topics · Reference</p><h1>Glossary</h1><p class="lede">Quick definitions that keep you moving, with deeper language and context when you want it.</p></header>${topicModeNav(data,mode,esc)}<form class="reference-search" id="topic-search"><input name="topic-q" value="${esc(q)}" placeholder="Search glossary…"><input type="hidden" name="topic-mode" value="glossary"><button>Search</button></form><div class="glossary-grid">${terms.map(term=>`<article id="${esc(term.id||term.term)}" class="glossary-card"><h3>${esc(term.term)}</h3><p>${esc(term.quick||term.definitions?.[0]||'')}</p>${term.definitions?.length>1?`<details><summary>Go deeper</summary>${term.definitions.map(d=>`<p>${esc(d)}</p>`).join('')}</details>`:''}</article>`).join('')}</div>`;
  }
  const results=filterTopics(data,mode,q);
  return `<header class="section compact-section"><p class="eyebrow">Curated reference · not scored</p><h1>Topics</h1><p class="lede">Ask what something means, compare responsible interpretations, and follow Scripture, history, doctrine, practice, and related questions without turning reference into a second course.</p></header>${topicModeNav(data,mode,esc)}<form class="reference-search" id="topic-search"><input name="topic-q" value="${esc(q)}" placeholder="Search answers, sections, references, aliases, and tags…"><input type="hidden" name="topic-mode" value="${esc(mode)}"><button>Search</button></form><div class="topic-card-grid topic-card-grid--results">${results.map(t=>`<a class="topic-card" href="/topics?topic=${encodeURIComponent(t.id)}"><span>${esc(t.kind||(t.tags||[])[0]||'Reference')}</span><strong>${esc(t.title)}</strong><small>${esc(topicText(t)).slice(0,175)}</small><em>${(t.sections||[]).length} section${(t.sections||[]).length===1?'':'s'} · ${(t.refs||[]).length} Scripture ref${(t.refs||[]).length===1?'':'s'}</em></a>`).join('')||'<p class="notice">No matching Topics.</p>'}</div>`;
}
