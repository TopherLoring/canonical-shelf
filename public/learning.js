import {ORIENTATION_LESSON,ORIENTATION_LESSON_ID,ORIENTATION_UNIT_ID} from './orientation.js';
import {THEMES} from './theme.js';
import {BOOKS,parseReference} from './bible.js';

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
export function masteryFor(data,id){return data.mastery?.[id]||data.legacyMastery?.CANON_V4_MASTERY?.[id]||null}

function optionTiles(name,options,esc){
  return `<div class="answer-tiles">${(options||[]).map((option,index)=>`<label class="answer-tile"><input type="radio" name="${name}" value="${index}"><span>${esc(option)}</span></label>`).join('')}</div>`;
}

function challengeForm(ch,activityId,index,esc){
  if(!ch)return'';
  const kind=ch.kind||'reasoning';
  const shape=challengeShape(ch);
  const mode=challengeEvaluationMode(ch);
  let controls='';

  if(shape==='sequence'){
    controls=`<ol class="sequence-board" data-sequence-board>${(ch.items||[]).map((item,itemIndex)=>`<li class="sequence-card" tabindex="-1" data-seq-value="${itemIndex}"><input type="hidden" name="p${itemIndex}" value="${itemIndex}"><span class="sequence-card__index" aria-hidden="true">${String(itemIndex+1).padStart(2,'0')}</span><span class="sequence-card__text">${esc(item)}</span><span class="sequence-card__controls"><button type="button" data-seq-move="up" aria-label="Move ${esc(item)} earlier">↑</button><button type="button" data-seq-move="down" aria-label="Move ${esc(item)} later">↓</button></span></li>`).join('')}</ol>`;
  }else if(shape==='match'){
    controls=`<div class="match-board">${(ch.items||[]).map((item,itemIndex)=>`<fieldset class="match-card"><legend>${esc(item)}</legend>${optionTiles(`p${itemIndex}`,ch.options,esc)}</fieldset>`).join('')}</div>`;
  }else if(shape==='evidence-select'){
    controls=`<div class="evidence-board">${(ch.items||[]).map((item,itemIndex)=>`<label class="evidence-card"><input type="checkbox" name="pick" value="${itemIndex}"><span>${esc(item)}</span></label>`).join('')}</div>`;
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

const referenceNames=[...BOOKS,'Psalm'].sort((a,b)=>b.length-a.length).map(name=>name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
const supportingReferencePattern=new RegExp(`\\b(${referenceNames.join('|')})\\s+\\d+:\\d+(?:[-–]\\d+)?`,'gi');

function supportingReferencesMarkup(text,corpus,esc){
  const seen=new Set(),references=[...String(text||'').matchAll(supportingReferencePattern)].map(match=>match[0]).filter(ref=>{const key=ref.toLowerCase();if(seen.has(key))return false;seen.add(key);return true});
  const rows=parseCorpus(corpus);
  const cards=references.map(reference=>{
    const parsed=parseReference(reference);
    if(!parsed?.start)return'';
    const selected=rows.filter(row=>row.bn===parsed.bn&&row.chapter===parsed.chapter&&row.verse>=parsed.start&&row.verse<=(parsed.end||parsed.start));
    if(!selected.length)return'';
    const href=`/bible?book=${parsed.bn}&chapter=${parsed.chapter}#v${parsed.start}`;
    return `<details class="supporting-scripture"><summary>Read ${esc(reference)} in context</summary><blockquote>${selected.map(row=>`<p><sup>${row.verse}</sup> ${esc(row.text)}</p>`).join('')}</blockquote><a href="${href}">Open chapter →</a></details>`;
  }).filter(Boolean).join('');
  return cards?`<div class="supporting-scriptures" aria-label="Supporting Scripture cited in this explanation">${cards}</div>`:'';
}

function proseMarkup(paragraphs,corpus,esc){
  return paragraphs.map(paragraph=>`<p class="scene-prose">${esc(paragraph)}</p>${supportingReferencesMarkup(paragraph,corpus,esc)}`).join('');
}

function scriptureMarkup(lesson,corpus,esc){
  const ref=lesson.ref;
  if(!Array.isArray(ref)||ref.length<2)return `<p class="reading-ref">Primary reading · <strong>${esc(lesson.reading||'See lesson reference')}</strong></p>`;
  const [bn,chapter,start=1,end=start]=ref.map(Number);
  const rows=parseCorpus(corpus).filter(row=>row.bn===bn&&row.chapter===chapter&&row.verse>=start&&row.verse<=end);
  if(!rows.length)return `<p class="reading-ref">Primary reading · <strong>${esc(lesson.reading||'')}</strong></p>`;
  return `<div class="study-scripture"><p class="eyebrow">Primary reading · Berean Standard Bible</p><h3>${esc(lesson.reading||'Scripture')}</h3>${rows.map(row=>`<p><sup>${row.verse}</sup> ${esc(row.text)}</p>`).join('')}</div>`;
}

function vocabEntries(lesson){return Array.isArray(lesson.vocab)?lesson.vocab:Object.entries(lesson.vocab||{})}

function drawerTray(lesson,esc,{includeDeeper=true}={}){
  const vocab=vocabEntries(lesson);
  const drawers=[...(lesson.drawers||[])];
  if(includeDeeper&&lesson.deeper)drawers.push({title:'Go deeper',tag:'Depth',body:lesson.deeper});
  let html='';
  if(vocab.length){
    html+=`<details class="deep-reading lesson-drawer"><summary>Glossary · ${vocab.length} term${vocab.length===1?'':'s'}</summary><dl class="vocab">${vocab.map(([term,definition])=>`<div><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join('')}</dl></details>`;
  }
  for(const drawer of drawers){
    html+=`<details class="deep-reading lesson-drawer"><summary>${esc(drawer.tag?`${drawer.tag} · `:'')}${esc(drawer.title||'Explore')}</summary>${Array.isArray(drawer.body)?drawer.body.map(p=>`<p>${esc(p)}</p>`).join(''):`<p>${esc(drawer.body||'')}</p>`}</details>`;
  }
  return html?`<div class="lesson-drawers" aria-label="Optional lesson depth">${html}</div>`:'';
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
  const support=drawerTray(lesson,esc);
  const scenes=[{role:'Orient',title:lesson.title,html:`<p class="scene-objective">${esc(lesson.objective||'')}</p>${lesson.reading?`<p class="reading-ref">Primary reading ahead · <strong>${esc(lesson.reading)}</strong></p>`:''}${support}`}];
  const body=[...(lesson.body||[])];
  const defaults=[['Explain','Read closely'],['Context','Locate the claim in context'],['Explain','Follow the relationship'],['Context','Keep the setting visible'],['Interpret','Distinguish what follows from the evidence']];

  if(body.length){
    const [role,title]=lesson.id==='begin'?['Prepare','Before you read: the central claim']:['Prepare','What to notice before reading'];
    scenes.push({role,title,html:proseMarkup([body.shift()],corpus,esc)});
  }
  if(lesson.reading)scenes.push({role:'Read',title:'Read the passage with the question in view',html:scriptureMarkup(lesson,corpus,esc)});

  for(let offset=0;offset<body.length;offset+=2){
    const originalIndex=offset+1;
    const special=lesson.id==='begin'?beginBodyHeadings[originalIndex]:null;
    const [role,title]=special||defaults[originalIndex%defaults.length];
    scenes.push({role,title,html:proseMarkup(body.slice(offset,offset+2),corpus,esc)});
  }

  if(lesson.simple)scenes.push({role:'Clarify',title:'In plain language',html:`<aside class="scene-callout"><p>${esc(lesson.simple)}</p></aside>`});
  if(lesson.visual||lesson.diagram)scenes.push({role:'Visualize',title:'See the relationship',html:visualBlock(lesson,esc)});
  (lesson.challenges||[]).forEach((challenge,index)=>scenes.push({role:'Practice',title:challenge.title||'Check understanding',html:challengeForm(challenge,aid,index,esc)}));
  if(lesson.reflect)scenes.push({role:'Reflect',title:'Reflect and keep lesson notes',html:`<p class="scene-prose">${esc(lesson.reflect)}</p>${lesson.model?`<details class="deep-reading"><summary>Compare with a model response</summary><p>${esc(lesson.model)}</p></details>`:''}<label class="reflection-notes"><span>Lesson notes</span><textarea rows="5" maxlength="12000" data-inline-lesson-note data-activity="${esc(aid)}" placeholder="Capture observations, questions, connections, or references to revisit."></textarea><small data-inline-note-status aria-live="polite">Saved locally and never scored.</small></label>`});
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

function lessonApparatus(lesson,esc,scene){
  const vocab=vocabEntries(lesson);
  const sources=(lesson.sources||[]).map((source,index)=>`<li><a href="${esc(source)}" target="_blank" rel="noreferrer">Source ${index+1}</a></li>`).join('');
  let modules='';
  if(scene)modules+=apparatusModule(`This scene · ${esc(scene.role)}`,'current',`<p><strong>${esc(scene.title)}</strong></p><p>Use this panel for the evidence, vocabulary, and interpretive boundaries most relevant while this scene is open.</p>`,{open:true});
  modules+=apparatusModule('Passage','text',`<p><strong>${esc(lesson.reading||'Lesson reading')}</strong></p><p>The lesson begins with the biblical text or primary evidence. Explanatory claims remain distinguishable from what the source states directly.</p>`,{open:true});
  if(lesson.id==='begin'){
    modules+=apparatusModule('Transmission','evidence',`<p>Paul says he “received” and “passed on” the proclamation. This supports discussion of transmitted tradition; it does not by itself reconstruct the exact date or wording of every earlier form.</p>`);
    modules+=apparatusModule('Corinth','context',`<p>The letter addresses an existing congregation. Social status, communal meals, patronage, and public honor can illuminate questions in 1 Corinthians, but background evidence should not be used to invent the private motive of every participant.</p>`);
    modules+=apparatusModule('Interpretive limit','boundary',`<p>The sequence of death, burial, resurrection, and appearances establishes the proclamation. This passage alone does not settle every theory of atonement, historical reconstruction, or later doctrinal formulation.</p>`);
  }
  if(vocab.length)modules+=apparatusModule('Glossary','lexical',`<dl class="apparatus-vocab">${vocab.map(([term,definition])=>`<div><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join('')}</dl>`);
  if(lesson.deeper)modules+=apparatusModule('Go deeper','deeper',`<p>${esc(lesson.deeper)}</p>`);
  for(const drawer of lesson.drawers||[])modules+=apparatusModule(drawer.title||'Explore',drawer.tag||'optional',Array.isArray(drawer.body)?drawer.body.map(p=>`<p>${esc(p)}</p>`).join(''):`<p>${esc(drawer.body||'')}</p>`);
  modules+=apparatusModule('Translation','BSB',`<p>The primary reading is displayed from the Berean Standard Bible in this build. Translation comparison belongs to the study layer; differences in English wording should be evaluated before treating them as differences in manuscripts, meaning, or doctrine.</p>`);
  if(sources)modules+=apparatusModule('Sources','external',`<ol class="source-list">${sources}</ol>`);
  return modules;
}

function orientationApparatus(){
  return apparatusModule('Orientation','not scored','<p>This tutorial teaches the product and study method. It does not add to course completion.</p>',{open:true})+
    apparatusModule('Study layers','method','<p>Canonical Shelf keeps text, historical evidence, interpretation, reception, doctrine, and application visible as related but distinct layers.</p>')+
    apparatusModule('Need help?','navigation','<p>Inside lessons use hints, drawers, glossary, notes and sources. Across the site use Bible, Topics, search, the Guide, Practice, and Advanced Study.</p>');
}

function focusHref(base,index){return `${base}${base.includes('?')?'&':'?'}scene=${index+1}`}

function studyFocusShell({courseSequence,courseTitle,unitSequence,unitTitle,lessonSequence,title,sceneIndex,scenes,baseHref,exitFallback,apparatus,esc,scored=true,completed=false,continuation=null}){
  const scene=scenes[sceneIndex]||scenes[0];
  const previous=sceneIndex>0?focusHref(baseHref,sceneIndex-1):null;
  const finalScene=sceneIndex===scenes.length-1;
  const next=finalScene?(continuation?.href||exitFallback):focusHref(baseHref,sceneIndex+1);
  const nextLabel=!finalScene?'Continue →':continuation?completed?`Continue to ${continuation.label} →`:`Explore ${continuation.label} →`:'Return to unit →';
  const completion=finalScene&&completed?'<aside class="lesson-complete" role="status"><span aria-hidden="true">✓</span><div><strong>Lesson complete</strong><p>You finished every required check. Review remains available whenever you want a refresher.</p></div></aside>':'';
  const progress=Math.round(((sceneIndex+1)/Math.max(scenes.length,1))*100);
  const courseLabel=courseSequence?`Course ${courseSequence} · ${courseTitle} · `:'';
  return `<section class="study-focus" data-study-focus>
    <header class="study-focus__chrome">
      <div class="study-focus__identity"><span>${esc(courseLabel)}Unit ${unitSequence} · ${esc(unitTitle)}</span><strong>Lesson ${lessonSequence} · ${esc(title)}</strong></div>
      <div class="study-focus__utilities"><button type="button" data-open-appearance>Appearance</button><button type="button" data-feedback-open aria-haspopup="dialog" aria-controls="feedback-panel">Feedback</button><button type="button" data-journal-open aria-haspopup="dialog" aria-controls="personal-study-panel">Journal</button><button type="button" data-toggle-apparatus>Notes &amp; sources</button><button type="button" class="study-exit" data-exit-lesson data-fallback="${esc(exitFallback)}">Exit lesson</button></div>
    </header>
    <article class="study-folio" aria-labelledby="study-scene-title">
      <header class="study-folio__head"><div><p class="eyebrow">${esc(scene.role)}${scored?'':' · orientation'}</p><h1 id="study-scene-title">${esc(scene.title)}</h1></div><div class="study-folio__count"><strong>${sceneIndex+1}</strong><span>of ${scenes.length}</span></div></header>
      <div class="study-layout">
        <nav class="scene-rail" aria-label="Lesson scenes">${scenes.map((item,index)=>`<a href="${focusHref(baseHref,index)}" aria-label="Scene ${index+1}: ${esc(item.role)}" ${index===sceneIndex?'aria-current="step"':''}><span>${index+1}</span><small>${esc(item.role)}</small></a>`).join('')}</nav>
        <div class="study-scene" role="region" aria-labelledby="study-scene-title"><div class="study-scene__inner">${completion}${scene.html}</div></div>
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

function activityRoute(activity){return activity?.type==='lesson'?`/course?unit=${encodeURIComponent(activity.unitId)}&lesson=${encodeURIComponent(activity.sourceId)}`:activity?`/course?unit=${encodeURIComponent(activity.unitId)}&mastery=${encodeURIComponent(activity.sourceId)}`:'/course'}
function nextActivityFor(data,currentId){
  const current=activityFor(data,currentId);if(!current)return null;
  const unitIds=data.byCourse?.[current.courseId]||[];
  const ordered=unitIds.flatMap(unitId=>data.byUnit?.[unitId]||[]);
  const nextId=ordered[ordered.indexOf(currentId)+1];
  return nextId?activityFor(data,nextId):null;
}
function continuationFor(data,currentId){const next=nextActivityFor(data,currentId);return next?{href:activityRoute(next),label:next.title}:null}

function lessonView(data,state,lesson,params,esc,corpus){
  const unit=data.units?.find(item=>item.id===lesson.unitId||item.id===lesson.v6Unit)||{sequence:1,title:'Course',courseId:'course.foundations'};
  const course=data.courses?.find(item=>item.id===unit.courseId)||null;
  const ids=data.byUnit?.[unit.id]||[];
  const lessonPosition=Math.max(0,ids.filter(id=>id.startsWith('lesson:')).indexOf(`lesson:${lesson.id}`));
  const scenes=lessonScenes(lesson,corpus,esc);
  const sceneIndex=Math.max(0,Math.min(scenes.length-1,(Number(params.get('scene'))||1)-1));
  const baseHref=`/course?unit=${encodeURIComponent(unit.id)}&lesson=${encodeURIComponent(lesson.id)}`;
  const activityId=`lesson:${lesson.id}`;
  return studyFocusShell({courseSequence:course?.sequence,courseTitle:course?.shortTitle||course?.title||'',unitSequence:unit.sequence,unitTitle:unit.title,lessonSequence:lessonPosition+1,title:lesson.title,sceneIndex,scenes,baseHref,exitFallback:`/course?unit=${encodeURIComponent(unit.id)}`,apparatus:lessonApparatus(lesson,esc,scenes[sceneIndex]),esc,scored:true,completed:state.completed?.includes(activityId),continuation:continuationFor(data,activityId)});
}

function masteryView(data,state,id,params,esc){
  const mastery=masteryFor(data,id);
  if(!mastery)return `<p class="notice">Mastery source ${esc(id)} was not found.</p>`;
  const activity=activityFor(data,`mastery:${id}`);
  const unit=data.units?.find(item=>item.id===activity?.unitId)||{sequence:'—',title:'Mastery',courseId:null};
  const course=data.courses?.find(item=>item.id===unit.courseId)||null;
  const kind=activity?.masteryType==='course-capstone'?'Course capstone':activity?.masteryType==='unit-mastery'?'Unit mastery':'Mastery';
  const scene={role:'Practice',title:mastery.title||id,html:`<p class="scene-objective">${esc(mastery.dek||mastery.plain||'Apply the skill using the authored evidence.')}</p>${(mastery.body||[]).map(p=>`<p class="scene-prose">${esc(p)}</p>`).join('')}${mastery.plain?`<aside class="scene-callout"><p>${esc(mastery.plain)}</p></aside>`:''}${challengeForm(mastery.challenge,`mastery:${id}`,0,esc)}`};
  const scenes=[scene];
  const baseHref=`/course?unit=${encodeURIComponent(activity?.unitId||'')}&mastery=${encodeURIComponent(id)}`;
  const apparatus=apparatusModule(kind,'scored skill','<p>This activity evaluates understanding or reasoning, not whether you personally assent to a theological claim.</p>',{open:true});
  const activityId=`mastery:${id}`;
  return studyFocusShell({courseSequence:course?.sequence,courseTitle:course?.shortTitle||course?.title||'',unitSequence:unit.sequence,unitTitle:unit.title,lessonSequence:'M',title:mastery.title||id,sceneIndex:0,scenes,baseHref,exitFallback:`/course?unit=${encodeURIComponent(activity?.unitId||'')}`,apparatus,esc,scored:true,completed:state.completed?.includes(activityId),continuation:continuationFor(data,activityId)});
}

function orientationUnitView(){
  return `<header class="section"><p><a href="/course">← All courses</a></p><p class="eyebrow">Orientation · not scored</p><h1>Orientation</h1><p class="lede">Learn how Canonical Shelf works before entering the scored curriculum. Revisit this tutorial whenever you need it.</p></header><ol class="unit-list"><li class="unit unit--orientation"><span class="unit-num">01</span><div><p class="eyebrow">Tutorial</p><h3><a data-activity-link="orientation" href="/course?unit=${encodeURIComponent(ORIENTATION_UNIT_ID)}&lesson=${encodeURIComponent(ORIENTATION_LESSON_ID)}">Welcome to Canonical Shelf</a></h3><p>Canon, library structure, site navigation, deeper study, sources, translation comparison, Practice, themes, and independent study.</p></div><span>Not scored</span></li></ol>`;
}

function resolveUnitId(data,id){return data.units?.some(unit=>unit.id===id)?id:(data.legacyUnitAliases?.[id]||id)}
function progressForIds(ids,state){const done=(ids||[]).filter(id=>state.completed?.includes(id)).length;return{done,total:(ids||[]).length,pct:(ids||[]).length?Math.round(done/(ids||[]).length*100):0}}

function glossaryView(data,params,esc){
  const courseId=params.get('course');
  const course=courseId?data.courses?.find(item=>item.id===courseId):null;
  const terms=(data.glossary||[]).filter(term=>!courseId||term.occurrences?.some(item=>item.courseId===courseId));
  const back=course?`/course?course=${encodeURIComponent(course.id)}`:'/course';
  return `<header class="section"><p><a href="${back}">← ${course?esc(course.shortTitle||course.title):'Course'}</a></p><p class="eyebrow">${course?'Course glossary':'Global glossary'}</p><h1>${course?`${esc(course.shortTitle||course.title)} Glossary`:'Canonical Shelf Glossary'}</h1><p class="lede">Quick definitions keep you moving; lesson drawers and Advanced Study provide deeper lexical and historical detail.</p></header><div class="topic-list">${terms.map(term=>`<article class="topic-item" id="${esc(term.id)}"><h3>${esc(term.term)}</h3><p>${esc(term.quick)}</p><p class="meta">Used in ${term.occurrences?.length||0} lesson${term.occurrences?.length===1?'':'s'}</p></article>`).join('')}</div>`;
}

function courseOverview(data,state,course,esc){
  const unitIds=data.byCourse?.[course.id]||[];
  const units=unitIds.map(id=>data.units.find(unit=>unit.id===id)).filter(Boolean);
  const activityIds=unitIds.flatMap(id=>data.byUnit?.[id]||[]);
  const courseProgress=progressForIds(activityIds,state);
  return `<header class="section"><p><a href="/course">← All courses</a></p><p class="eyebrow">Course ${course.sequence} · ${esc(course.level==='advanced'?'Deeper study':'Core curriculum')}</p><h1>${esc(course.title)}</h1><p class="lede">${esc(course.scope)}</p><p>${esc(course.outcome||'')}</p><p><a href="/course?course=${encodeURIComponent(course.id)}&glossary=1">Open course glossary</a></p><progress class="progress-native" value="${courseProgress.done}" max="${courseProgress.total||1}" aria-label="${courseProgress.pct}% complete"></progress><p class="meta">${courseProgress.done}/${courseProgress.total} activities complete</p></header><ol class="unit-list">${units.map(unit=>{const progress=progressForIds(data.byUnit?.[unit.id]||[],state);return `<li class="unit"><span class="unit-num">${String(unit.sequence).padStart(2,'0')}</span><div><p class="eyebrow">Unit ${unit.sequence}</p><h3><a href="/course?unit=${encodeURIComponent(unit.id)}">${esc(unit.title)}</a></h3><p>${esc(unit.scope)}</p><progress class="progress-native" value="${progress.done}" max="${progress.total||1}" aria-label="${progress.pct}% complete"></progress><p class="meta">${progress.done}/${progress.total} activities</p></div></li>`}).join('')}</ol>`;
}

export function courseView(data,state,params,esc,corpus=''){
  const lessonId=params.get('lesson'),masteryId=params.get('mastery');
  let unitId=params.get('unit');
  const courseId=params.get('course');
  if(lessonId===ORIENTATION_LESSON_ID&&unitId===ORIENTATION_UNIT_ID)return orientationView(params,esc);
  if(lessonId){const lesson=lessonFor(data,lessonId);return lesson?lessonView(data,state,lesson,params,esc,corpus):'<p class="notice">Lesson not found.</p>'}
  if(masteryId)return masteryView(data,state,masteryId,params,esc);
  if(unitId===ORIENTATION_UNIT_ID)return orientationUnitView();
  if(params.has('glossary'))return glossaryView(data,params,esc);

  if(unitId){
    unitId=resolveUnitId(data,unitId);
    const unit=data.units?.find(item=>item.id===unitId);
    if(!unit)return'<p class="notice">Unit not found.</p>';
    const course=data.courses?.find(item=>item.id===unit.courseId);
    const ids=data.byUnit?.[unitId]||[];
    return `<header class="section"><p><a href="/course?course=${encodeURIComponent(unit.courseId)}">← ${esc(course?.shortTitle||course?.title||'Course')}</a></p><p class="eyebrow">Course ${course?.sequence||'—'} · Unit ${unit.sequence}</p><h1>${esc(unit.title)}</h1><p class="lede">${esc(unit.scope)}</p></header><ol class="unit-list">${ids.map((aid,index)=>{const activity=activityFor(data,aid);if(!activity)return'';const done=state.completed?.includes(aid);const href=activity.type==='lesson'?`/course?unit=${encodeURIComponent(unitId)}&lesson=${encodeURIComponent(activity.sourceId)}`:`/course?unit=${encodeURIComponent(unitId)}&mastery=${encodeURIComponent(activity.sourceId)}`;const label=activity.type==='lesson'?'Guided lesson':activity.masteryType==='course-capstone'?'Course capstone':activity.masteryType==='unit-mastery'?'Unit mastery':'Integrated mastery';return `<li class="unit"><span class="unit-num">${String(index+1).padStart(2,'0')}</span><div><p class="eyebrow">${label}</p><h3><a data-activity-link="${esc(aid)}" href="${href}">${esc(activity.title)}</a></h3></div><span>${done?'✓ Complete':'Not complete'}</span></li>`}).join('')}</ol>`;
  }

  if(courseId){
    const course=data.courses?.find(item=>item.id===courseId);
    if(!course)return'<p class="notice">Course not found.</p>';
    return courseOverview(data,state,course,esc);
  }

  return `<header class="section"><p class="eyebrow">Six-course learning path</p><h1>Course</h1><p class="lede">Start with a complete adult-beginner foundation, then follow the biblical story through Israel, the Second Temple world, Jesus and the early Church. Courses 5–6 provide deeper interpretive and theological study.</p></header><ol class="unit-list"><li class="unit unit--orientation"><span class="unit-num">00</span><div><p class="eyebrow">Orientation · not scored</p><h3><a data-activity-link="orientation" href="/course?unit=${encodeURIComponent(ORIENTATION_UNIT_ID)}&lesson=${encodeURIComponent(ORIENTATION_LESSON_ID)}">Welcome to Canonical Shelf</a></h3><p>Learn the product, study layers, deeper-study surfaces, Practice, themes, and independent learning tools.</p></div><span>Replay anytime</span></li>${(data.courses||[]).map(course=>{const unitIds=data.byCourse?.[course.id]||[],ids=unitIds.flatMap(id=>data.byUnit?.[id]||[]),progress=progressForIds(ids,state);return `<li class="unit course-entry"><span class="unit-num">${String(course.sequence).padStart(2,'0')}</span><div><p class="eyebrow">${esc(course.level==='advanced'?'Deeper study':'Core curriculum')}</p><h3><a href="/course?course=${encodeURIComponent(course.id)}">${esc(course.title)}</a></h3><p>${esc(course.scope)}</p><progress class="progress-native" value="${progress.done}" max="${progress.total||1}" aria-label="${progress.pct}% complete"></progress><p class="meta">${progress.done}/${progress.total} activities · ${unitIds.length} units</p></div>${course.achievement?`<span>${esc(course.achievement)}</span>`:''}</li>`}).join('')}</ol><p><a href="/course?glossary=1">Open global glossary</a></p>`;
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
    return {mode,shape,correct:null,correctItems:[],submitted:text.length>0};
  }
  let correct=false,correctItems=[];
  if(['sequence','match','fields'].includes(shape)){
    const got=ints(form,'p',ch.answer.length),want=ch.answer.map(Number);
    correctItems=got.map((value,index)=>Number.isFinite(value)&&value===want[index]);correct=same(got,want);
  }else if(shape==='evidence-select'){
    const got=formData.getAll('pick').map(Number).sort((a,b)=>a-b),want=ch.answer.map(Number).sort((a,b)=>a-b),selected=new Set(got),supported=new Set(want);
    correctItems=(ch.items||[]).map((_,index)=>selected.has(index)&&supported.has(index));correct=same(got,want);
  }else if(shape==='scenario'){
    correctItems=ch.stages.map((stage,index)=>{const value=formData.get(`s${index}`);return value!==null&&value!==''&&Number(value)===Number(stage.correct)});correct=correctItems.every(Boolean);
  }else if(shape==='lanes'){
    const expected=ch.answer.map(entry=>Array.isArray(entry)?Number(entry[1]):Number(entry)),got=ints(form,'p',ch.items.length);
    correctItems=got.map((value,index)=>Number.isFinite(value)&&value===expected[index]);correct=same(got,expected);
  }else if(shape==='single-choice'){
    const value=formData.get('choice');correct=value!==null&&value!==''&&Number(value)===Number(ch.answer);correctItems=[correct];
  }
  return {mode:'scored',shape,correct:!!correct,correctItems,submitted:true};
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
