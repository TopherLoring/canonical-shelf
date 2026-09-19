import {goldenLessonView} from './golden-slice.js';

const sequenceKinds=new Set(['sequence','sequence-path','timeline-sort','shelf-build','verse-rebuild','theme-trace']);
const matchKinds=new Set(['match','match-board']);

const scalar=value=>!Array.isArray(value)&&value!==undefined&&value!==null&&(typeof value==='number'||typeof value==='string');

export function challengeShape(ch){
  if(!ch)return'reflection';
  const kind=ch.kind||'';
  const answer=ch.answer;

  if(Array.isArray(ch.stages)&&ch.stages.length>0&&ch.stages.every(stage=>Array.isArray(stage.choices)&&stage.correct!==undefined&&stage.correct!==null))return'scenario';
  if(Array.isArray(ch.fields)&&Array.isArray(ch.options)&&Array.isArray(answer))return'fields';
  if(Array.isArray(ch.lanes)&&Array.isArray(ch.items)&&Array.isArray(answer))return'lanes';
  if(Array.isArray(ch.options)&&scalar(answer))return'single-choice';
  if(kind==='evidence'&&Array.isArray(ch.items)&&Array.isArray(answer)&&answer.every(scalar))return'evidence-select';
  if((matchKinds.has(kind)||(!sequenceKinds.has(kind)&&Array.isArray(ch.items)&&Array.isArray(ch.options)))&&Array.isArray(answer)&&answer.every(scalar))return'match';
  if((sequenceKinds.has(kind)||Array.isArray(ch.items))&&Array.isArray(answer)&&answer.every(scalar))return'sequence';

  return'reflection';
}

export function challengeEvaluationMode(ch){
  return challengeShape(ch)==='reflection'?'reflection':'scored';
}

export function activityFor(data,id){return data.activities?.find(a=>a.id===id)}
export function lessonFor(data,id){return data.lessons?.find(l=>l.id===id)}
export function masteryFor(data,id){return data.legacyMastery?.CANON_V4_MASTERY?.[id]||null}

function challengeForm(ch,activityId,index,esc){
  if(!ch)return'';

  const kind=ch.kind||'reasoning';
  const shape=challengeShape(ch);
  const mode=challengeEvaluationMode(ch);
  let controls='';

  if(shape==='sequence'){
    controls=ch.answer.map((_,position)=>`<label>Position ${position+1}<select name="p${position}"><option value="">Choose…</option>${ch.items.map((item,itemIndex)=>`<option value="${itemIndex}">${esc(item)}</option>`).join('')}</select></label>`).join('');
  }else if(shape==='match'){
    controls=ch.items.map((item,itemIndex)=>`<label>${esc(item)}<select name="p${itemIndex}"><option value="">Choose…</option>${ch.options.map((option,optionIndex)=>`<option value="${optionIndex}">${esc(option)}</option>`).join('')}</select></label>`).join('');
  }else if(shape==='evidence-select'){
    controls=ch.items.map((item,itemIndex)=>`<label class="choice"><input type="checkbox" name="pick" value="${itemIndex}"> ${esc(item)}</label>`).join('');
  }else if(shape==='scenario'){
    controls=ch.stages.map((stage,stageIndex)=>`<fieldset><legend>${esc(stage.prompt)}</legend>${stage.choices.map((choice,choiceIndex)=>`<label class="choice"><input type="radio" name="s${stageIndex}" value="${choiceIndex}"> ${esc(choice)}</label>`).join('')}</fieldset>`).join('');
  }else if(shape==='fields'){
    controls=ch.fields.map((field,fieldIndex)=>{
      const options=Array.isArray(ch.options[fieldIndex])?ch.options[fieldIndex]:ch.options;
      return `<label>${esc(field)}<select name="p${fieldIndex}"><option value="">Choose…</option>${options.map((option,optionIndex)=>`<option value="${optionIndex}">${esc(option)}</option>`).join('')}</select></label>`;
    }).join('');
  }else if(shape==='lanes'){
    controls=ch.items.map((item,itemIndex)=>`<label>${esc(item)}<select name="p${itemIndex}"><option value="">Choose…</option>${ch.lanes.map((lane,laneIndex)=>`<option value="${laneIndex}">${esc(lane)}</option>`).join('')}</select></label>`).join('');
  }else if(shape==='single-choice'){
    controls=ch.options.map((option,optionIndex)=>`<label class="choice"><input type="radio" name="choice" value="${optionIndex}"> ${esc(option)}</label>`).join('');
  }else{
    controls='<label>Reflect on the evidence<textarea name="reasoning" rows="5" required placeholder="Use the passage or lesson evidence, then distinguish observation from interpretation and application."></textarea></label>';
  }

  const eyebrow=mode==='reflection'?'Reflection':'Understanding check';
  const action=mode==='reflection'?'Save reflection':'Check response';
  const hint=ch.hint||ch.hints?.[0]||'Return to the evidence and context before choosing.';

  return `<form class="challenge" data-activity="${esc(activityId)}" data-index="${index}" data-kind="${esc(kind)}" data-shape="${esc(shape)}" data-mode="${esc(mode)}"><p class="eyebrow">${eyebrow}</p><h3>${esc(ch.title||'Check your understanding')}</h3><p>${esc(ch.prompt||'Use the evidence from this activity.')}</p><div class="challenge-controls">${controls}</div><details><summary>Hint</summary><p>${esc(hint)}</p></details><button class="button" type="submit">${action}</button><div class="feedback" role="status"></div></form>`;
}

function visualBlock(lesson,esc){const v=lesson.visual||lesson.diagram||null;if(!v)return'';if(typeof v==='string')return `<section class="section lesson-visual"><h2>Visual map</h2><p>${esc(v)}</p></section>`;if(v.src)return `<figure class="lesson-visual"><img src="${esc(v.src)}" alt="${esc(v.alt||'Lesson visual')}">${v.caption?`<figcaption>${esc(v.caption)}</figcaption>`:''}</figure>`;if(v.text)return `<section class="section lesson-visual"><h2>${esc(v.title||'Visual map')}</h2><p>${esc(v.text)}</p></section>`;return''}

function lessonView(data,state,lesson,esc){
  if(lesson.id==='begin'){
    const golden=goldenLessonView({data,state,lesson,esc});
    if(golden)return golden;
  }
  const aid=`lesson:${lesson.id}`,vocab=Object.entries(lesson.vocab||{}),challenges=lesson.challenges||[];
  return `<article class="lesson reader"><p><a href="#/course?unit=${encodeURIComponent(lesson.v6Unit)}">← Back to unit</a></p><p class="eyebrow">Guided lesson</p><h1>${esc(lesson.title)}</h1><p class="lede">${esc(lesson.objective||'')}</p>${lesson.reading?`<p class="reading-ref">Primary reading · <strong>${esc(lesson.reading)}</strong></p>`:''}${(lesson.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${lesson.simple?`<aside class="notice"><strong>In plain language.</strong> ${esc(lesson.simple)}</aside>`:''}${vocab.length?`<section class="section"><h2>Vocabulary</h2><dl class="vocab">${vocab.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>`:''}${lesson.deeper?`<section class="section"><h2>Go deeper</h2><p>${esc(lesson.deeper)}</p></section>`:''}${visualBlock(lesson,esc)}<section class="section"><h2>Check understanding</h2>${challenges.map((c,i)=>challengeForm(c,aid,i,esc)).join('')||'<p>No authored check is available for this lesson.</p>'}</section>${lesson.reflect?`<section class="section"><h2>Reflect</h2><p>${esc(lesson.reflect)}</p>${lesson.model?`<details><summary>Compare with a model response</summary><p>${esc(lesson.model)}</p></details>`:''}</section>`:''}</article>`;
}

function masteryView(data,id,esc){const m=masteryFor(data,id);if(!m)return `<p class="notice">Mastery source ${esc(id)} was not found.</p>`;const aid=`mastery:${id}`,ch=m.challenge;return `<article class="lesson reader"><p><a href="#/course?unit=${encodeURIComponent(activityFor(data,aid)?.unitId||'unit.mastery')}">← Back to unit</a></p><p class="eyebrow">Mastery · ${esc(id)}</p><h1>${esc(m.title||id)}</h1><p class="lede">${esc(m.dek||m.plain||'Apply the skill using the authored evidence.')}</p>${(m.body||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${m.plain?`<aside class="notice"><strong>In plain language.</strong> ${esc(m.plain)}</aside>`:''}<section class="section">${challengeForm(ch,aid,0,esc)}</section></article>`}

export function courseView(data,state,params,esc){
  const lessonId=params.get('lesson'),masteryId=params.get('mastery'),unitId=params.get('unit');
  if(lessonId){const l=lessonFor(data,lessonId);return l?lessonView(data,state,l,esc):'<p class="notice">Lesson not found.</p>'}
  if(masteryId)return masteryView(data,masteryId,esc);
  if(unitId){
    const u=data.units?.find(x=>x.id===unitId);
    if(!u)return'<p class="notice">Unit not found.</p>';
    const ids=data.byUnit?.[unitId]||[];
    return `<header class="section"><p><a href="#/course">← All units</a></p><p class="eyebrow">Unit ${u.sequence}</p><h1>${esc(u.title)}</h1><p class="lede">${esc(u.scope)}</p></header><ol class="unit-list">${ids.map((aid,i)=>{const a=activityFor(data,aid),done=state.completed?.includes(aid),href=a.type==='lesson'?`#/course?unit=${encodeURIComponent(unitId)}&lesson=${encodeURIComponent(a.sourceId)}`:`#/course?unit=${encodeURIComponent(unitId)}&mastery=${encodeURIComponent(a.sourceId)}`;return `<li class="unit"><span class="unit-num">${String(i+1).padStart(2,'0')}</span><div><p class="eyebrow">${a.type==='lesson'?'Guided lesson':'Mastery'}</p><h3><a href="${href}">${esc(a.title)}</a></h3></div><span>${done?'✓ Complete':'Not complete'}</span></li>`}).join('')}</ol>`;
  }
  return `<header class="section"><p class="eyebrow">25-unit learning path</p><h1>Course</h1><p class="lede">Orientation → interpretive method → biblical story → doctrine formation → traditions and contested questions → independent synthesis.</p></header><ol class="unit-list">${(data.units||[]).map(u=>{const ids=data.byUnit?.[u.id]||[],done=ids.filter(id=>state.completed?.includes(id)).length,pct=ids.length?Math.round(done/ids.length*100):0;return `<li class="unit"><span class="unit-num">${String(u.sequence).padStart(2,'0')}</span><div><h3><a href="#/course?unit=${encodeURIComponent(u.id)}">${esc(u.title)}</a></h3><p>${esc(u.scope)}</p><progress class="progress-native" value="${done}" max="${ids.length||1}" aria-label="${pct}% complete"></progress><p class="meta">${done}/${ids.length} activities</p></div></li>`}).join('')}</ol>`;
}

function ints(form,prefix,count){
  const data=new FormData(form);
  return Array.from({length:count},(_,index)=>{
    const value=data.get(`${prefix}${index}`);
    return value===null||value===''?Number.NaN:Number(value);
  });
}

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function checkChallenge(form,ch){
  const shape=challengeShape(ch),mode=challengeEvaluationMode(ch),data=new FormData(form);

  if(mode==='reflection'){
    const text=String(data.get('reasoning')||'').trim();
    return {mode,shape,correct:null,submitted:text.length>0};
  }

  let correct=false;

  if(shape==='sequence'){
    correct=same(ints(form,'p',ch.answer.length),ch.answer.map(Number));
  }else if(shape==='match'){
    correct=same(ints(form,'p',ch.answer.length),ch.answer.map(Number));
  }else if(shape==='evidence-select'){
    const got=data.getAll('pick').map(Number).sort((a,b)=>a-b),want=ch.answer.map(Number).sort((a,b)=>a-b);
    correct=same(got,want);
  }else if(shape==='scenario'){
    correct=ch.stages.every((stage,index)=>Number(data.get(`s${index}`))===Number(stage.correct));
  }else if(shape==='fields'){
    correct=same(ints(form,'p',ch.answer.length),ch.answer.map(Number));
  }else if(shape==='lanes'){
    const expected=ch.answer.map(entry=>Array.isArray(entry)?Number(entry[1]):Number(entry));
    correct=same(ints(form,'p',ch.items.length),expected);
  }else if(shape==='single-choice'){
    correct=Number(data.get('choice'))===Number(ch.answer);
  }

  return {mode:'scored',shape,correct:!!correct,submitted:true};
}

export function challengeFor(data,activityId,index){
  if(activityId.startsWith('lesson:'))return lessonFor(data,activityId.slice(7))?.challenges?.[index]||null;
  if(activityId.startsWith('mastery:'))return masteryFor(data,activityId.slice(8))?.challenge||null;
  return null;
}

export function challengeCountFor(data,activityId){
  if(activityId.startsWith('lesson:'))return Math.max(1,lessonFor(data,activityId.slice(7))?.challenges?.length||0);
  if(activityId.startsWith('mastery:'))return masteryFor(data,activityId.slice(8))?.challenge?1:0;
  return 0;
}
