const sequenceKinds=new Set(['sequence','sequence-path','timeline-sort']);
const matchKinds=new Set(['match','match-board']);

export function activityFor(data,id){return data.activities?.find(a=>a.id===id)}
export function lessonFor(data,id){return data.lessons?.find(l=>l.id===id)}
export function masteryFor(data,id){return data.legacyMastery?.CANON_V4_MASTERY?.[id]||null}

function challengeForm(ch,activityId,index,esc){
  if(!ch)return '';
  const kind=ch.kind||'reasoning';
  let controls='';
  if(sequenceKinds.has(kind)&&Array.isArray(ch.items)&&Array.isArray(ch.answer)){
    controls=ch.answer.map((_,pos)=>`<label>Position ${pos+1}<select name="p${pos}"><option value="">Choose…</option>${ch.items.map((x,i)=>`<option value="${i}">${esc(x)}</option>`).join('')}</select></label>`).join('');
  }else if(matchKinds.has(kind)&&Array.isArray(ch.items)&&Array.isArray(ch.options)&&Array.isArray(ch.answer)){
    controls=ch.items.map((x,i)=>`<label>${esc(x)}<select name="p${i}"><option value="">Choose…</option>${ch.options.map((o,j)=>`<option value="${j}">${esc(o)}</option>`).join('')}</select></label>`).join('');
  }else if(kind==='evidence'&&Array.isArray(ch.items)&&Array.isArray(ch.answer)){
    controls=ch.items.map((x,i)=>`<label class="choice"><input type="checkbox" name="pick" value="${i}"> ${esc(x)}</label>`).join('');
  }else if(kind==='scenario'&&Array.isArray(ch.stages)){
    controls=ch.stages.map((s,i)=>`<fieldset><legend>${esc(s.prompt)}</legend>${s.choices.map((x,j)=>`<label class="choice"><input type="radio" name="s${i}" value="${j}"> ${esc(x)}</label>`).join('')}</fieldset>`).join('');
  }else if(Array.isArray(ch.fields)&&Array.isArray(ch.options)&&Array.isArray(ch.answer)){
    controls=ch.fields.map((f,i)=>`<label>${esc(f)}<select name="p${i}"><option value="">Choose…</option>${(ch.options[i]||[]).map((x,j)=>`<option value="${j}">${esc(x)}</option>`).join('')}</select></label>`).join('');
  }else if(Array.isArray(ch.lanes)&&Array.isArray(ch.items)&&Array.isArray(ch.answer)){
    controls=ch.items.map((x,i)=>`<label>${esc(x)}<select name="p${i}"><option value="">Choose…</option>${ch.lanes.map((lane,j)=>`<option value="${j}">${esc(lane)}</option>`).join('')}</select></label>`).join('');
  }else{
    controls=`<label>Explain your reasoning<textarea name="reasoning" rows="5" required minlength="20" placeholder="Use the passage or lesson evidence, then distinguish observation from interpretation and application."></textarea></label>`;
  }
  return `<form class="challenge" data-activity="${esc(activityId)}" data-index="${index}" data-kind="${esc(kind)}"><p class="eyebrow">Understanding check</p><h3>${esc(ch.title||'Check your understanding')}</h3><p>${esc(ch.prompt||'Use the evidence from this activity.')}</p><div class="challenge-controls">${controls}</div><details><summary>Hint</summary><p>${esc(ch.hint||'Return to the evidence and context before choosing.')}</p></details><button class="button" type="submit">Check response</button><div class="feedback" role="status"></div></form>`;
}

function lessonView(data,lesson,esc){
  const aid=`lesson:${lesson.id}`;
  const vocab=Object.entries(lesson.vocab||{});
  const challenges=lesson.challenges||[];
  return `<article class="lesson reader"><p><a href="#/course?unit=${encodeURIComponent(lesson.v6Unit)}">← Back to unit</a></p><p class="eyebrow">Guided lesson</p><h1>${esc(lesson.title)}</h1><p class="lede">${esc(lesson.objective||'')}</p>${lesson.reading?`<p class="reading-ref">Primary reading · <strong>${esc(lesson.reading)}</strong></p>`:''}${(lesson.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${lesson.simple?`<aside class="notice"><strong>In plain language.</strong> ${esc(lesson.simple)}</aside>`:''}${vocab.length?`<section class="section"><h2>Vocabulary</h2><dl class="vocab">${vocab.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`:''}${lesson.deeper?`<section class="section"><h2>Go deeper</h2><p>${esc(lesson.deeper)}</p></section>`:''}${lesson.reflect?`<section class="section"><h2>Reflect</h2><p>${esc(lesson.reflect)}</p>${lesson.model?`<details><summary>Compare with a model response</summary><p>${esc(lesson.model)}</p></details>`:''}</section>`:''}<section class="section"><h2>Check understanding</h2>${challenges.map((c,i)=>challengeForm(c,aid,i,esc)).join('')||'<p>No authored check is available for this lesson.</p>'}</section></article>`;
}

function masteryView(data,id,esc){
  const m=masteryFor(data,id);if(!m)return `<p class="notice">Mastery source ${esc(id)} was not found.</p>`;
  const aid=`mastery:${id}`,ch=m.challenge;
  return `<article class="lesson reader"><p><a href="#/course?unit=${encodeURIComponent(activityFor(data,aid)?.unitId||'unit.mastery')}">← Back to unit</a></p><p class="eyebrow">Mastery · ${esc(id)}</p><h1>${esc(m.title||id)}</h1><p class="lede">${esc(m.dek||m.plain||'Apply the skill using the authored evidence.')}</p>${(m.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${m.plain?`<aside class="notice"><strong>In plain language.</strong> ${esc(m.plain)}</aside>`:''}<section class="section">${challengeForm(ch,aid,0,esc)}</section></article>`;
}

export function courseView(data,state,params,esc){
  const lessonId=params.get('lesson'),masteryId=params.get('mastery'),unitId=params.get('unit');
  if(lessonId){const l=lessonFor(data,lessonId);return l?lessonView(data,l,esc):'<p class="notice">Lesson not found.</p>'}
  if(masteryId)return masteryView(data,masteryId,esc);
  if(unitId){const u=data.units?.find(x=>x.id===unitId);if(!u)return '<p class="notice">Unit not found.</p>';const ids=data.byUnit?.[unitId]||[];return `<header class="section"><p><a href="#/course">← All units</a></p><p class="eyebrow">Unit ${u.sequence}</p><h1>${esc(u.title)}</h1><p class="lede">${esc(u.scope)}</p></header><ol class="unit-list">${ids.map((aid,i)=>{const a=activityFor(data,aid),done=state.completed?.includes(aid);const href=a.type==='lesson'?`#/course?unit=${encodeURIComponent(unitId)}&lesson=${encodeURIComponent(a.sourceId)}`:`#/course?unit=${encodeURIComponent(unitId)}&mastery=${encodeURIComponent(a.sourceId)}`;return `<li class="unit"><span class="unit-num">${String(i+1).padStart(2,'0')}</span><div><p class="eyebrow">${a.type==='lesson'?'Guided lesson':'Mastery'}</p><h3><a href="${href}">${esc(a.title)}</a></h3></div><span>${done?'✓ Complete':'Not complete'}</span></li>`}).join('')}</ol>`}
  return `<header class="section"><p class="eyebrow">25-unit learning path</p><h1>Course</h1><p class="lede">Orientation → interpretive method → biblical story → doctrine formation → traditions and contested questions → independent synthesis.</p></header><ol class="unit-list">${(data.units||[]).map(u=>{const ids=data.byUnit?.[u.id]||[],done=ids.filter(id=>state.completed?.includes(id)).length,pct=ids.length?Math.round(done/ids.length*100):0;return `<li class="unit"><span class="unit-num">${String(u.sequence).padStart(2,'0')}</span><div><h3><a href="#/course?unit=${encodeURIComponent(u.id)}">${esc(u.title)}</a></h3><p>${esc(u.scope)}</p><div class="progress" aria-label="${pct}% complete"><span style="width:${pct}%"></span></div><p class="meta">${done}/${ids.length} activities</p></div></li>`}).join('')}</ol>`;
}

function ints(form,prefix,count){return Array.from({length:count},(_,i)=>Number(new FormData(form).get(`${prefix}${i}`)))}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
export function checkChallenge(form,ch){
  const kind=ch?.kind||'reasoning',fd=new FormData(form);
  if(sequenceKinds.has(kind))return same(ints(form,'p',ch.answer.length),ch.answer);
  if(matchKinds.has(kind))return same(ints(form,'p',ch.answer.length),ch.answer);
  if(kind==='evidence'){const got=fd.getAll('pick').map(Number).sort((a,b)=>a-b),want=[...ch.answer].map(Number).sort((a,b)=>a-b);return same(got,want)}
  if(kind==='scenario')return ch.stages.every((s,i)=>Number(fd.get(`s${i}`))===Number(s.correct));
  if(Array.isArray(ch?.fields)&&Array.isArray(ch?.answer))return same(ints(form,'p',ch.answer.length),ch.answer);
  if(Array.isArray(ch?.lanes)&&Array.isArray(ch?.answer)){const expected=ch.answer.map(pair=>Array.isArray(pair)?Number(pair[1]):Number(pair));return same(ints(form,'p',expected.length),expected)}
  return String(fd.get('reasoning')||'').trim().length>=20;
}

export function challengeFor(data,activityId,index){
  if(activityId.startsWith('lesson:'))return lessonFor(data,activityId.slice(7))?.challenges?.[index]||null;
  if(activityId.startsWith('mastery:'))return masteryFor(data,activityId.slice(8))?.challenge||null;
  return null;
}
