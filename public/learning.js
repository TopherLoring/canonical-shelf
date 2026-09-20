import {ORIENTATION_LESSON,ORIENTATION_LESSON_ID,ORIENTATION_UNIT_ID} from './orientation.js';
import {THEMES} from './theme.js';

const sequenceKinds=new Set(['sequence','sequence-path','timeline-sort','shelf-build','verse-rebuild','theme-trace']);
const matchKinds=new Set(['match','match-board']);
const scalar=value=>!Array.isArray(value)&&value!==undefined&&value!==null&&(typeof value==='number'||typeof value==='string');

let parsedCorpusSource=null;
let parsedCorpusRows=[];

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

export function challengeEvaluationMode(ch){return challengeShape(ch)==='reflection'?'reflection':'scored'}
export function activityFor(data,id){return data.activities?.find(a=>a.id===id)}
export function lessonFor(data,id){return data.lessons?.find(l=>l.id===id)}
export function masteryFor(data,id){return data.legacyMastery?.CANON_V4_MASTERY?.[id]||null}

function optionTiles(name,options,esc){
  return `<div class="answer-tiles">${options.map((option,index)=>`<label class="answer-tile"><input type="radio" name="${name}" value="${index}"><span>${esc(option)}</span></label>`).join('')}</div>`;
}

function challengeForm(ch,activityId,index,esc){
  if(!ch)return'';
  const kind=ch.kind||'reasoning';
  const shape=challengeShape(ch);
  const mode=challengeEvaluationMode(ch);
  let controls='';

  if(shape==='sequence'){
    controls=`<ol class="sequence-board" data-sequence-board>${ch.items.map((item,itemIndex)=>`<li class="sequence-card" data-seq-value="${itemIndex}"><input type="hidden" name="p${itemIndex}" value="${itemIndex}"><span class="sequence-card__index" aria-hidden="true">${String(itemIndex+1).padStart(2,'0')}</span><span class="sequence-card__text">${esc(item)}</span><span class="sequence-card__controls"><button type="button" data-seq-move="up" aria-label="Move ${esc(item)} earlier">↑</button><button type="button" data-seq-move="down" aria-label="Move ${esc(item)} later">↓</button></span></li>`).join('')}</ol>`;
  }else if(shape==='match'){
    controls=`<div class="match-board">${ch.items.map((item,itemIndex)=>`<fieldset class="match-card"><legend>${esc(item)}</legend>${optionTiles(`p${itemIndex}`,ch.options,esc)}</fieldset>`).join('')}</div>`;
  }else if(shape==='evidence-select'){
    controls=`<div class="evidence-board">${ch.items.map((item,itemIndex)=>`<label class="evidence-card"><input type="checkbox" name="pick" value="${itemIndex}"><span>${esc(item)}</span></label>`).join('')}</div>`;
  }else if(shape==='scenario'){
    controls=`<div class="scenario-board">${ch.stages.map((stage,stageIndex)=>`<fieldset class="scenario-stage"><legend>${esc(stage.prompt)}</legend>${optionTiles(`s${stageIndex}`,stage.choices,esc)}</fieldset>`).join('')}</div>`;
  }else if(shape==='fields'){
    controls=`<div class="argument-board">${ch.fields.map((field,fieldIndex)=>{const options=Array.isArray(ch.options[fieldIndex])?ch.options[fieldIndex]:ch.options;return `<fieldset class="argument-link"><legend><span>Evidence</span>${esc(field)}</legend><p class="argument-link__cue">Connect this claim to the best-supported next step.</p>${optionTiles(`p${fieldIndex}`,options,esc)}</fieldset>`}).join('')}</div>`;
  }else if(shape==='lanes'){
    controls=`<div class="classification-board">${ch.items.map((item,itemIndex)=>`<fieldset class="classification-card"><legend>${esc(item)}</legend>${optionTiles(`p${itemIndex}`,ch.lanes,esc)}</fieldset>`).join('')}</div>`;
  }else if(shape==='single-choice'){
    controls=optionTiles('choice',ch.options,esc);
  }else{
    controls='<label class="reflection-field">Reflect on the evidence<textarea name="reasoning" rows="5" required placeholder="Use the passage or lesson evidence, then distinguish observation from interpretation and application."></textarea></label>';
  }

  const eyebrow=mode==='reflection'?'Reflection':'Understanding check';
  const action=mode==='reflection'?'Save reflection':'Check response';
  const hint=ch.hint||ch.hints?.[0]||'Return to the evidence and context before choosing.';

  return `<form class="challenge challenge--${esc(shape)}" data-activity="${esc(activityId)}" data-index="${index}" data-kind="${esc(kind)}" data-shape="${esc(shape)}" data-mode="${esc(mode)}"><p class="eyebrow">${eyebrow}</p><h3>${esc(ch.title||'Check your understanding')}</h3><p class="challenge-prompt">${esc(ch.prompt||'Use the evidence from this activity.')}</p><div class="challenge-controls">${controls}</div><details class="challenge-hint"><summary>Need a hint?</summary><p>${esc(hint)}</p></details><div class="challenge-submit"><button class="button" type="submit">${action}</button><div class="feedback" role="status" aria-live="polite"></div></div></form>`;
}

function visualBlock(lesson,esc){
  const v=lesson.visual||lesson.diagram||null;
  if(!v)return'';
  if(typeof v==='string')return `<div class="scene-visual"><p>${esc(v)}</p></div>`;
  if(v.src)return `<figure class="scene-visual"><img src="${esc(v.src)}" alt="${esc(v.alt||'Lesson visual')}">${v.caption?`<figcaption>${esc(v.caption)}</figcaption>`:''}</figure>`;
  if(v.text)return `<div class="scene-visual"><h3>${esc(v.title||'Visual map')}</h3><p>${esc(v.text)}</p></div>`;
  return'';
}

function parseCorpus(text){
  if(text===parsedCorpusSource)return parsedCorpusRows;
  parsedCorpusSource=text;
  parsedCorpusRows=[];
  for(const line of String(text||'').split('\n')){
    const [book,chapter,verse,...rest]=line.split('\t');
    const bn=Number(book),cn=Number(chapter),vn=Number(verse);
    if(bn&&cn&&vn&&rest.length)parsedCorpusRows.push({bn,chapter:cn,verse:vn,text:rest.join('\t')});
  }
  return parsedCorpusRows;
}

function scriptureMarkup(lesson,corpus,esc){
  const ref=lesson.ref;
  if(!Array.isArray(ref)||ref.length<2)return `<p class="reading-ref">Primary reading · <strong>${esc(lesson.reading||'See lesson reference')}</strong></p>`;
  const [bn,chapter,start=1,end=start]=ref.map(Number);
  const rows=parseCorpus(corpus).filter(row=>row.bn===bn&&row.chapter===chapter&&row.verse>=start&&row.verse<=end);
  if(!rows.length)return `<p class="reading-ref">Primary reading · <strong>${esc(lesson.reading||'')}</strong></p>`;
  return `<div class="study-scripture"><p class="eyebrow">Primary reading · Berean Standard Bible</p><h3>${esc(lesson.reading||'Scripture')}</h3>${rows.map(row=>`<p><sup>${row.verse}</sup> ${esc(row.text)}</p>`).join('')}</div>`;
}

const beginBodyHeadings=[
  ['Explain','The proclamation at the center'],
  ['Context','A reminder inside a letter'],
  ['Position','How this guide approaches belief'],
  ['Method','Observe before settling the mechanism'],
  ['Context','Corinth: community, status, and shared life']
];

function lessonScenes(lesson,corpus,esc){
  const aid=`lesson:${lesson.id}`;
  const scenes=[{role:'Orient',title:lesson.title,html:`<p class="scene-objective">${esc(lesson.objective||'')}</p>${lesson.reading?`<p class="reading-ref">Primary reading · <strong>${esc(lesson.reading)}</strong></p>`:''}`}];

  if(lesson.reading)scenes.push({role:'Read',title:'Read the passage before the explanation',html:scriptureMarkup(lesson,corpus,esc)});

  (lesson.body||[]).forEach((paragraph,index)=>{
    const special=lesson.id==='begin'?beginBodyHeadings[index]:null;
    const defaults=[['Explain','Read closely'],['Context','Locate the claim in context'],['Explain','Follow the argument'],['Context','Keep the setting visible'],['Interpret','Distinguish what follows from the evidence']];
    const [role,title]=special||defaults[index%defaults.length];
    scenes.push({role,title,html:`<p class="scene-prose">${esc(paragraph)}</p>`});
  });

  if(lesson.simple)scenes.push({role:'Clarify',title:'In plain language',html:`<aside class="scene-callout"><p>${esc(lesson.simple)}</p></aside>`});

  const vocab=Object.entries(lesson.vocab||{});
  if(vocab.length)scenes.push({role:'Locate',title:'Vocabulary for the work ahead',html:`<dl class="vocab vocab--scene">${vocab.map(([term,definition])=>`<div><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join('')}</dl>`});

  if(lesson.deeper)scenes.push({role:'Context',title:'Go deeper',html:`<details class="deep-reading" open><summary>Scholarly context and interpretive limits</summary><p>${esc(lesson.deeper)}</p></details>`});
  if(lesson.visual||lesson.diagram)scenes.push({role:'Visualize',title:'See the relationship',html:visualBlock(lesson,esc)});

  (lesson.challenges||[]).forEach((challenge,index)=>scenes.push({role:'Practice',title:challenge.title||'Check understanding',html:challengeForm(challenge,aid,index,esc)}));

  if(lesson.reflect)scenes.push({role:'Reflect',title:'Reflect without being scored for belief',html:`<p class="scene-prose">${esc(lesson.reflect)}</p>${lesson.model?`<details class="deep-reading"><summary>Compare with a model response</summary><p>${esc(lesson.model)}</p></details>`:''}`});

  return scenes;
}

function orientationSceneMarkup(scene,esc){
  const paragraphs=(scene.paragraphs||[]).map(text=>`<p class="scene-prose">${esc(text)}</p>`).join('');
  const bullets=scene.bullets?.length?`<ul class="orientation-list">${scene.bullets.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:'';
  const callout=scene.callout?`<aside class="scene-callout"><p>${esc(scene.callout)}</p></aside>`:'';
  const actions=scene.actions?.length?`<div class="scene-actions">${scene.actions.map(action=>`<a class="button" href="${esc(action.href)}">${esc(action.label)}</a>`).join('')}</div>`:'';
  const themes=scene.themeDemo?`<div class="theme-demo" aria-label="Theme packages">${THEMES.map(theme=>`<button type="button" data-theme-choice="${theme.id}" aria-pressed="false"><span class="theme-demo__dot" aria-hidden="true"></span><strong>${esc(theme.name)}</strong><small>${esc(theme.summary)}</small></button>`).join('')}</div>`:'';
  return `${paragraphs}${bullets}${callout}${themes}${actions}`;
}

function apparatusModule(title,tag,body,{open=false}={}){
  return `<details class="apparatus-module" ${open?'open':''}><summary><span>${title}</span>${tag?`<small>${tag}</small>`:''}</summary><div class="apparatus-module__body">${body}</div></details>`;
}

function lessonApparatus(lesson,esc){
  const vocab=Object.entries(lesson.vocab||{});
  const sources=(lesson.sources||[]).map((source,index)=>`<li><a href="${esc(source)}" target="_blank" rel="noreferrer">Source ${index+1}</a></li>`).join('');
  let modules='';
  modules+=apparatusModule('Passage','text',`<p><strong>${esc(lesson.reading||'Lesson reading')}</strong></p><p>The lesson begins with the biblical text. Explanatory claims should remain distinguishable from what the passage states directly.</p>`,{open:true});
  if(lesson.id==='begin'){
    modules+=apparatusModule('Transmission','evidence',`<p>Paul says he “received” and “passed on” the proclamation. This supports discussion of transmitted tradition; it does not by itself reconstruct the exact date or wording of every earlier form.</p>`);
    modules+=apparatusModule('Corinth','context',`<p>The letter addresses an existing congregation. Social status, communal meals, patronage, and public honor can illuminate questions in 1 Corinthians, but background evidence should not be used to invent the private motive of every participant.</p>`);
    modules+=apparatusModule('Interpretive limit','boundary',`<p>The sequence of death, burial, resurrection, and appearances establishes the proclamation. This passage alone does not settle every theory of atonement, every historical reconstruction, or every later doctrinal formulation.</p>`);
  }
  if(vocab.length)modules+=apparatusModule('Language & terms','lexical',`<dl class="apparatus-vocab">${vocab.map(([term,definition])=>`<div><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join('')}</dl>`);
  if(lesson.deeper)modules+=apparatusModule('Interpretation','deeper',`<p>${esc(lesson.deeper)}</p>`);
  modules+=apparatusModule('Translation','BSB',`<p>The primary reading is displayed from the Berean Standard Bible in this build. Translation comparison belongs to the Bible study layer; differences in English wording should be evaluated before treating them as differences in meaning or doctrine.</p>`);
  if(sources)modules+=apparatusModule('Sources','external',`<ol class="source-list">${sources}</ol>`);
  return modules;
}

function orientationApparatus(){
  return apparatusModule('Unit 0','not scored','<p>This tutorial teaches the product and study method. It does not add to the 25-unit course completion denominator.</p>',{open:true})+
    apparatusModule('Study layers','method','<p>Canonical Shelf keeps text, historical evidence, interpretation, reception, doctrine, and application visible as related but distinct layers.</p>')+
    apparatusModule('Need help?','navigation','<p>Inside lessons use hints, deeper notes, vocabulary and sources. Across the site use Bible, Topics, search, the Guide, and further-reading trails.</p>');
}

function focusHref(base,index){return `${base}${base.includes('?')?'&':'?'}scene=${index+1}`}

function studyFocusShell({unitSequence,unitTitle,lessonSequence,title,sceneIndex,scenes,baseHref,exitFallback,apparatus,esc,scored=true}){
  const scene=scenes[sceneIndex]||scenes[0];
  const previous=sceneIndex>0?focusHref(baseHref,sceneIndex-1):null;
  const next=sceneIndex<scenes.length-1?focusHref(baseHref,sceneIndex+1):exitFallback;
  const nextLabel=sceneIndex<scenes.length-1?'Continue →':'Return to unit →';
  const progress=Math.round(((sceneIndex+1)/Math.max(scenes.length,1))*100);
  return `<section class="study-focus" data-study-focus>
    <header class="study-focus__chrome">
      <div class="study-focus__identity"><span>Unit ${unitSequence} · ${esc(unitTitle)}</span><strong>Lesson ${lessonSequence} · ${esc(title)}</strong></div>
      <div class="study-focus__utilities"><button type="button" data-open-appearance>Appearance</button><button type="button" data-toggle-apparatus>Notes &amp; sources</button><button type="button" class="study-exit" data-exit-lesson data-fallback="${esc(exitFallback)}">Exit lesson</button></div>
    </header>
    <article class="study-folio" aria-labelledby="study-scene-title">
      <header class="study-folio__head"><div><p class="eyebrow">${esc(scene.role)}${scored?'':' · orientation'}</p><h1 id="study-scene-title">${esc(scene.title)}</h1></div><div class="study-folio__count"><strong>${sceneIndex+1}</strong><span>of ${scenes.length}</span></div></header>
      <div class="study-layout">
        <nav class="scene-rail" aria-label="Lesson scenes">${scenes.map((item,index)=>`<a href="${focusHref(baseHref,index)}" aria-label="Scene ${index+1}: ${esc(item.role)}" ${index===sceneIndex?'aria-current="step"':''}><span>${index+1}</span><small>${esc(item.role)}</small></a>`).join('')}</nav>
        <div class="study-scene" role="region" aria-labelledby="study-scene-title"><div class="study-scene__inner">${scene.html}</div></div>
        <aside id="study-apparatus" class="study-apparatus" aria-label="Scholarly notes"><div class="study-apparatus__head"><div><p class="eyebrow">Study apparatus</p><h2>Notes &amp; sources</h2></div><button type="button" data-close-apparatus aria-label="Close notes and sources">×</button></div>${apparatus}</aside>
      </div>
      <footer class="study-nav" aria-label="Lesson navigation">
        <div>${previous?`<a class="study-nav__button" href="${previous}">← Previous</a>`:'<span class="study-nav__button is-disabled" aria-hidden="true">← Previous</span>'}</div>
        <button type="button" class="study-nav__notes" data-toggle-apparatus>Notes &amp; sources</button>
        <div class="study-nav__progress"><span>${esc(scene.role)} · ${sceneIndex+1}/${scenes.length}</span><div class="study-nav__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}" aria-label="${progress}% through this lesson"><i style="width:${progress}%"></i></div></div>
        <a class="study-nav__button study-nav__button--next" href="${next}">${nextLabel}</a>
      </footer>
    </article>
  </section>`;
}

function orientationView(params,esc){
  const scenes=ORIENTATION_LESSON.scenes.map(scene=>({...scene,html:orientationSceneMarkup(scene,esc)}));
  const sceneIndex=Math.max(0,Math.min(scenes.length-1,(Number(params.get('scene'))||1)-1));
  const baseHref=`/course?unit=${encodeURIComponent(ORIENTATION_UNIT_ID)}&lesson=${encodeURIComponent(ORIENTATION_LESSON_ID)}`;
  return studyFocusShell({unitSequence:0,unitTitle:ORIENTATION_LESSON.unitTitle,lessonSequence:1,title:ORIENTATION_LESSON.title,sceneIndex,scenes,baseHref,exitFallback:'/course',apparatus:orientationApparatus(),esc,scored:false});
}

function lessonView(data,lesson,params,esc,corpus){
  const unit=data.units?.find(item=>item.id===lesson.v6Unit)||{sequence:lesson.v4Unit||1,title:'Course'};
  const ids=data.byUnit?.[lesson.v6Unit]||[];
  const lessonPosition=Math.max(0,ids.filter(id=>id.startsWith('lesson:')).indexOf(`lesson:${lesson.id}`));
  const scenes=lessonScenes(lesson,corpus,esc);
  const sceneIndex=Math.max(0,Math.min(scenes.length-1,(Number(params.get('scene'))||1)-1));
  const baseHref=`/course?unit=${encodeURIComponent(lesson.v6Unit)}&lesson=${encodeURIComponent(lesson.id)}`;
  return studyFocusShell({unitSequence:unit.sequence,unitTitle:unit.title,lessonSequence:lessonPosition+1,title:lesson.title,sceneIndex,scenes,baseHref,exitFallback:`/course?unit=${encodeURIComponent(lesson.v6Unit)}`,apparatus:lessonApparatus(lesson,esc),esc,scored:true});
}

function masteryView(data,id,params,esc){
  const mastery=masteryFor(data,id);
  if(!mastery)return `<p class="notice">Mastery source ${esc(id)} was not found.</p>`;
  const activity=activityFor(data,`mastery:${id}`);
  const unit=data.units?.find(item=>item.id===activity?.unitId)||{sequence:'—',title:'Mastery'};
  const scene={role:'Practice',title:mastery.title||id,html:`<p class="scene-objective">${esc(mastery.dek||mastery.plain||'Apply the skill using the authored evidence.')}</p>${(mastery.body||[]).map(p=>`<p class="scene-prose">${esc(p)}</p>`).join('')}${mastery.plain?`<aside class="scene-callout"><p>${esc(mastery.plain)}</p></aside>`:''}${challengeForm(mastery.challenge,`mastery:${id}`,0,esc)}`};
  const scenes=[scene];
  const baseHref=`/course?unit=${encodeURIComponent(activity?.unitId||'')}&mastery=${encodeURIComponent(id)}`;
  const apparatus=apparatusModule('Mastery','scored skill','<p>This activity evaluates understanding or reasoning, not whether you personally assent to a theological claim.</p>',{open:true});
  return studyFocusShell({unitSequence:unit.sequence,unitTitle:unit.title,lessonSequence:'M',title:mastery.title||id,sceneIndex:0,scenes,baseHref,exitFallback:`/course?unit=${encodeURIComponent(activity?.unitId||'')}`,apparatus,esc,scored:true});
}

function orientationUnitView(){
  return `<header class="section"><p><a href="/course">← All units</a></p><p class="eyebrow">Unit 0 · Orientation · not scored</p><h1>Orientation</h1><p class="lede">Learn how Canonical Shelf works before entering the scored curriculum. Revisit this tutorial whenever you need it.</p></header><ol class="unit-list"><li class="unit unit--orientation"><span class="unit-num">01</span><div><p class="eyebrow">Tutorial</p><h3><a data-activity-link="orientation" href="/course?unit=${encodeURIComponent(ORIENTATION_UNIT_ID)}&lesson=${encodeURIComponent(ORIENTATION_LESSON_ID)}">Welcome to Canonical Shelf</a></h3><p>Canon, library structure, site navigation, deeper study, sources, translation comparison, Practice, themes, and independent study.</p></div><span>Not scored</span></li></ol>`;
}

export function courseView(data,state,params,esc,corpus=''){
  const lessonId=params.get('lesson'),masteryId=params.get('mastery'),unitId=params.get('unit');
  if(lessonId===ORIENTATION_LESSON_ID&&unitId===ORIENTATION_UNIT_ID)return orientationView(params,esc);
  if(lessonId){const lesson=lessonFor(data,lessonId);return lesson?lessonView(data,lesson,params,esc,corpus):'<p class="notice">Lesson not found.</p>'}
  if(masteryId)return masteryView(data,masteryId,params,esc);
  if(unitId===ORIENTATION_UNIT_ID)return orientationUnitView();
  if(unitId){
    const unit=data.units?.find(item=>item.id===unitId);
    if(!unit)return'<p class="notice">Unit not found.</p>';
    const ids=data.byUnit?.[unitId]||[];
    return `<header class="section"><p><a href="/course">← All units</a></p><p class="eyebrow">Unit ${unit.sequence}</p><h1>${esc(unit.title)}</h1><p class="lede">${esc(unit.scope)}</p></header><ol class="unit-list">${ids.map((aid,index)=>{const activity=activityFor(data,aid),done=state.completed?.includes(aid),href=activity.type==='lesson'?`/course?unit=${encodeURIComponent(unitId)}&lesson=${encodeURIComponent(activity.sourceId)}`:`/course?unit=${encodeURIComponent(unitId)}&mastery=${encodeURIComponent(activity.sourceId)}`;return `<li class="unit"><span class="unit-num">${String(index+1).padStart(2,'0')}</span><div><p class="eyebrow">${activity.type==='lesson'?'Guided lesson':'Mastery'}</p><h3><a data-activity-link="${esc(aid)}" href="${href}">${esc(activity.title)}</a></h3></div><span>${done?'✓ Complete':'Not complete'}</span></li>`}).join('')}</ol>`;
  }

  return `<header class="section"><p class="eyebrow">Orientation + 25-unit learning path</p><h1>Course</h1><p class="lede">Begin with Unit 0 if you want a guided tour, then follow the scored curriculum from orientation through independent synthesis.</p></header><ol class="unit-list"><li class="unit unit--orientation"><span class="unit-num">00</span><div><p class="eyebrow">Orientation · not scored</p><h3><a data-activity-link="orientation" href="/course?unit=${encodeURIComponent(ORIENTATION_UNIT_ID)}&lesson=${encodeURIComponent(ORIENTATION_LESSON_ID)}">Welcome to Canonical Shelf</a></h3><p>Learn the tool, the library model, deeper-study surfaces, sources, translations, Practice, themes, and how the course leads toward independent study.</p></div><span>Replay anytime</span></li>${(data.units||[]).map(unit=>{const ids=data.byUnit?.[unit.id]||[],done=ids.filter(id=>state.completed?.includes(id)).length,pct=ids.length?Math.round(done/ids.length*100):0;return `<li class="unit"><span class="unit-num">${String(unit.sequence).padStart(2,'0')}</span><div><h3><a href="/course?unit=${encodeURIComponent(unit.id)}">${esc(unit.title)}</a></h3><p>${esc(unit.scope)}</p><progress class="progress-native" value="${done}" max="${ids.length||1}" aria-label="${pct}% complete"></progress><p class="meta">${done}/${ids.length} activities</p></div></li>`}).join('')}</ol>`;
}

function ints(form,prefix,count){
  const formData=new FormData(form);
  return Array.from({length:count},(_,index)=>{
    const value=formData.get(`${prefix}${index}`);
    return value===null||value===''?Number.NaN:Number(value);
  });
}

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function checkChallenge(form,ch){
  const shape=challengeShape(ch),mode=challengeEvaluationMode(ch),formData=new FormData(form);

  if(mode==='reflection'){
    const text=String(formData.get('reasoning')||'').trim();
    return {mode,shape,correct:null,submitted:text.length>0};
  }

  let correct=false;

  if(shape==='sequence'){
    correct=same(ints(form,'p',ch.answer.length),ch.answer.map(Number));
  }else if(shape==='match'){
    correct=same(ints(form,'p',ch.answer.length),ch.answer.map(Number));
  }else if(shape==='evidence-select'){
    const got=formData.getAll('pick').map(Number).sort((a,b)=>a-b),want=ch.answer.map(Number).sort((a,b)=>a-b);
    correct=same(got,want);
  }else if(shape==='scenario'){
    correct=ch.stages.every((stage,index)=>{const value=formData.get(`s${index}`);return value!==null&&value!==''&&Number(value)===Number(stage.correct)});
  }else if(shape==='fields'){
    correct=same(ints(form,'p',ch.answer.length),ch.answer.map(Number));
  }else if(shape==='lanes'){
    const expected=ch.answer.map(entry=>Array.isArray(entry)?Number(entry[1]):Number(entry));
    correct=same(ints(form,'p',ch.items.length),expected);
  }else if(shape==='single-choice'){
    const value=formData.get('choice');
    correct=value!==null&&value!==''&&Number(value)===Number(ch.answer);
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
