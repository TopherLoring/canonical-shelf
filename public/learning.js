import {ORIENTATION_LESSON,ORIENTATION_LESSON_ID,ORIENTATION_UNIT_ID} from './orientation.js';
import {THEMES} from './theme.js';
import {BOOKS,parseReference} from './bible-books.js';

export {challengeShape,challengeEvaluationMode,activityFor,lessonFor,masteryFor,checkChallenge,challengeFor,challengeCountFor} from './challenge-engine.js';
import {challengeShape,challengeEvaluationMode,activityFor,lessonFor,masteryFor} from './challenge-engine.js';

let parsedCorpusSource=null;
let parsedCorpusRows=[];


function optionTiles(name,options,esc){
  return `<div class="answer-tiles">${(options||[]).map((option,index)=>`<label class="answer-tile"><input type="radio" name="${name}" value="${index}"><span>${esc(option)}</span></label>`).join('')}</div>`;
}

export function challengeForm(ch,activityId,index,esc){
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
  ['Position','How Canonical Shelf approaches belief'],
  ['Method','Observe before settling the mechanism'],
  ['Context','Corinth: community, status, and shared life']
];

// Authored lessons (content/pathway): one step per section; checks appear exactly where they are written.
function authoredScenes(lesson,corpus,esc){
  const aid=`lesson:${lesson.id}`;
  return lesson.sections.map(section=>{
    const html=section.blocks.map(block=>{
      if(block.type==='prose')return proseMarkup([block.text],corpus,esc);
      if(block.type==='callout')return `<aside class="scene-callout"><p>${esc(block.text)}</p></aside>`;
      if(block.type==='reading')return scriptureMarkup(lesson,corpus,esc);
      if(block.type==='visual')return visualBlock(lesson,esc);
      if(block.type==='check')return `<div class="inline-check" id="check-${block.index+1}">${challengeForm(lesson.challenges[block.index],aid,block.index,esc)}</div>`;
      if(block.type==='reflect')return `<p class="scene-prose">${esc(lesson.reflect)}</p>${lesson.model?`<details class="deep-reading"><summary>Compare with a model response</summary><p>${esc(lesson.model)}</p></details>`:''}`;
      return '';
    }).join('');
    return {role:lesson.title,label:section.title,title:section.title,anchor:section.anchor,html};
  });
}

export function lessonScenes(lesson,corpus,esc){
  if(Array.isArray(lesson.sections)&&lesson.sections.length)return authoredScenes(lesson,corpus,esc);
  const aid=`lesson:${lesson.id}`;
  const body=[...(lesson.body||[])];
  const defaults=[['Explain','Read closely'],['Context','Locate the claim in context'],['Explain','Follow the relationship'],['Context','Keep the setting visible'],['Interpret','Distinguish what follows from the evidence']];
  const opening=[];
  if(lesson.simple)opening.push(`<aside class="scene-callout"><p>${esc(lesson.simple)}</p></aside>`);
  if(body.length)opening.push(proseMarkup([body.shift()],corpus,esc));
  if(lesson.reading)opening.push(`<p class="reading-ref">Primary reading ahead · <strong>${esc(lesson.reading)}</strong></p>`);
  const scenes=[{role:'Orient',title:lesson.title,html:opening.join('')}];

  if(lesson.reading)scenes.push({role:'Read',title:'Read the passage with the question in view',html:scriptureMarkup(lesson,corpus,esc)});

  for(let offset=0;offset<body.length;offset+=2){
    const originalIndex=offset+1;
    const special=lesson.id==='begin'?beginBodyHeadings[originalIndex]:null;
    const [role,title]=special||defaults[originalIndex%defaults.length];
    scenes.push({role,title,html:proseMarkup(body.slice(offset,offset+2),corpus,esc)});
  }

  if(lesson.visual||lesson.diagram)scenes.push({role:'Visualize',title:'See the relationship',html:visualBlock(lesson,esc)});
  (lesson.challenges||[]).forEach((challenge,index)=>scenes.push({role:'Practice',title:challenge.title||'Check understanding',html:challengeForm(challenge,aid,index,esc)}));
  if(lesson.reflect)scenes.push({role:'Reflect',title:'Reflect on the lesson',html:`<p class="scene-prose">${esc(lesson.reflect)}</p>${lesson.model?`<details class="deep-reading"><summary>Compare with a model response</summary><p>${esc(lesson.model)}</p></details>`:''}`});
  return scenes;
}

export function orientationSceneMarkup(scene,esc){
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

export function lessonApparatus(lesson,esc,scene){
  const aid=`lesson:${lesson.id}`;
  const vocab=vocabEntries(lesson);
  const sources=(lesson.sources||[]).map((source,index)=>`<li><a href="${esc(source)}" target="_blank" rel="noreferrer">Source ${index+1}</a></li>`).join('');
  let modules='';
  modules+=apparatusModule('Your notes','private',`<section class="study-notes" data-notes-mount aria-label="Your notes"></section>`,{open:true});
  if(scene)modules+=apparatusModule(`This step · ${esc(scene.label||scene.role)}`,'current',`<p><strong>${esc(scene.title)}</strong></p><p>Use the study tools below for evidence, vocabulary, and interpretive boundaries relevant to this lesson.</p>`);
  modules+=apparatusModule('Passage','text',`<p><strong>${esc(lesson.reading||'Lesson reading')}</strong></p><p>The lesson begins with the biblical text or primary evidence. Explanatory claims remain distinguishable from what the source states directly.</p>`);
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

export function orientationApparatus(){
  return apparatusModule('Orientation','not scored','<p>This tutorial teaches the product and study method. It does not add to module completion.</p>',{open:true})+
    apparatusModule('Study layers','method','<p>Canonical Shelf keeps text, historical evidence, interpretation, reception, doctrine, and application visible as related but distinct layers.</p>')+
    apparatusModule('Need help?','navigation','<p>Inside lessons use hints, drawers, glossary, Session Notes, and sources. Across the site use Bible, Topics, search, the Theologian, Practice, and Advanced Study.</p>');
}


function activityRoute(activity){return activity?.type==='lesson'?`/course?unit=${encodeURIComponent(activity.unitId)}&lesson=${encodeURIComponent(activity.sourceId)}`:activity?`/course?unit=${encodeURIComponent(activity.unitId)}&mastery=${encodeURIComponent(activity.sourceId)}`:'/course'}
function nextActivityFor(data,currentId){
  const current=activityFor(data,currentId);if(!current)return null;
  const unitIds=data.byCourse?.[current.courseId]||[];
  const ordered=unitIds.flatMap(unitId=>data.byUnit?.[unitId]||[]);
  const nextId=ordered[ordered.indexOf(currentId)+1];
  return nextId?activityFor(data,nextId):null;
}
export function continuationFor(data,currentId){const next=nextActivityFor(data,currentId);return next?{href:activityRoute(next),label:next.title}:null}


function orientationUnitView(){
  return `<header class="section"><p><a href="/course">← All modules</a></p><p class="eyebrow">Orientation · not scored</p><h1>Orientation</h1><p class="lede">Learn how Canonical Shelf works before entering the scored curriculum. Revisit this tutorial whenever you need it.</p></header><ol class="unit-list"><li class="unit unit--orientation"><span class="unit-num">01</span><div><p class="eyebrow">Tutorial</p><h3><a data-activity-link="orientation" href="/course?unit=${encodeURIComponent(ORIENTATION_UNIT_ID)}&lesson=${encodeURIComponent(ORIENTATION_LESSON_ID)}">Welcome to Canonical Shelf</a></h3><p>Canon, library structure, site navigation, deeper study, sources, translation comparison, Practice, themes, and independent study.</p></div><span>Not scored</span></li></ol>`;
}

function resolveUnitId(data,id){return data.units?.some(unit=>unit.id===id)?id:(data.legacyUnitAliases?.[id]||id)}
function progressForIds(ids,state){const done=(ids||[]).filter(id=>state.completed?.includes(id)).length;return{done,total:(ids||[]).length,pct:(ids||[]).length?Math.round(done/(ids||[]).length*100):0}}

function glossaryView(data,params,esc){
  const courseId=params.get('course');
  const course=courseId?data.courses?.find(item=>item.id===courseId):null;
  const terms=(data.glossary||[]).filter(term=>!courseId||term.occurrences?.some(item=>item.courseId===courseId));
  const back=course?`/course?course=${encodeURIComponent(course.id)}`:'/course';
  return `<header class="section"><p><a href="${back}">← ${course?esc(course.shortTitle||course.title):'Module'}</a></p><p class="eyebrow">${course?'Module glossary':'Global glossary'}</p><h1>${course?`${esc(course.shortTitle||course.title)} Glossary`:'Canonical Shelf Glossary'}</h1><p class="lede">Quick definitions keep you moving; lesson drawers and Advanced Study provide deeper lexical and historical detail.</p></header><div class="topic-list">${terms.map(term=>`<article class="topic-item" id="${esc(term.id)}"><h3>${esc(term.term)}</h3><p>${esc(term.quick)}</p><p class="meta">Used in ${term.occurrences?.length||0} lesson${term.occurrences?.length===1?'':'s'}</p></article>`).join('')}</div>`;
}

function courseOverview(data,state,course,esc){
  const unitIds=data.byCourse?.[course.id]||[];
  const units=unitIds.map(id=>data.units.find(unit=>unit.id===id)).filter(Boolean);
  const activityIds=unitIds.flatMap(id=>data.byUnit?.[id]||[]);
  const courseProgress=progressForIds(activityIds,state);
  return `<header class="section"><p><a href="/course">← All modules</a></p><p class="eyebrow">Module ${course.sequence} · ${esc(course.level==='advanced'?'Deeper study':'Core curriculum')}</p><h1>${esc(course.title)}</h1><p class="lede">${esc(course.scope)}</p><p>${esc(course.outcome||'')}</p><p><a href="/course?course=${encodeURIComponent(course.id)}&glossary=1">Open module glossary</a></p><progress class="progress-native" value="${courseProgress.done}" max="${courseProgress.total||1}" aria-label="${courseProgress.pct}% complete"></progress><p class="meta">${courseProgress.done}/${courseProgress.total} activities complete</p></header><ol class="unit-list">${units.map(unit=>{const progress=progressForIds(data.byUnit?.[unit.id]||[],state);return `<li class="unit"><span class="unit-num">${String(unit.sequence).padStart(2,'0')}</span><div><p class="eyebrow">Unit ${unit.sequence}</p><h3><a href="/course?unit=${encodeURIComponent(unit.id)}">${esc(unit.title)}</a></h3><p>${esc(unit.scope)}</p><progress class="progress-native" value="${progress.done}" max="${progress.total||1}" aria-label="${progress.pct}% complete"></progress><p class="meta">${progress.done}/${progress.total} activities</p></div></li>`}).join('')}</ol>`;
}

export function courseView(data,state,params,esc,corpus=''){
  let unitId=params.get('unit');
  const courseId=params.get('course');
  if(unitId===ORIENTATION_UNIT_ID)return orientationUnitView();
  if(params.has('glossary'))return glossaryView(data,params,esc);

  if(unitId){
    unitId=resolveUnitId(data,unitId);
    const unit=data.units?.find(item=>item.id===unitId);
    if(!unit)return'<p class="notice">Unit not found.</p>';
    const course=data.courses?.find(item=>item.id===unit.courseId);
    const ids=data.byUnit?.[unitId]||[];
    return `<header class="section"><p><a href="/course?course=${encodeURIComponent(unit.courseId)}">← ${esc(course?.shortTitle||course?.title||'Module')}</a></p><p class="eyebrow">Module ${course?.sequence||'—'} · Unit ${unit.sequence}</p><h1>${esc(unit.title)}</h1><p class="lede">${esc(unit.scope)}</p></header><ol class="unit-list">${ids.map((aid,index)=>{const activity=activityFor(data,aid);if(!activity)return'';const done=state.completed?.includes(aid);const href=activity.type==='lesson'?`/course?unit=${encodeURIComponent(unitId)}&lesson=${encodeURIComponent(activity.sourceId)}`:`/course?unit=${encodeURIComponent(unitId)}&mastery=${encodeURIComponent(activity.sourceId)}`;const label=activity.type==='lesson'?'Guided lesson':activity.masteryType==='course-capstone'?'Capstone':activity.masteryType==='unit-mastery'?'Unit mastery':'Integrated mastery';return `<li class="unit"><span class="unit-num">${String(index+1).padStart(2,'0')}</span><div><p class="eyebrow">${label}</p><h3><a data-activity-link="${esc(aid)}" href="${href}">${esc(activity.title)}</a></h3></div><span>${done?'✓ Complete':'Not complete'}</span></li>`}).join('')}</ol>`;
  }

  if(courseId){
    const course=data.courses?.find(item=>item.id===courseId);
    if(!course)return'<p class="notice">Module not found.</p>';
    return courseOverview(data,state,course,esc);
  }

  return `<header class="section"><p class="eyebrow">${data.courses?.length || 4}-module learning path</p><h1>Pathway</h1><p class="lede">Start with what Christianity claims and how the Bible works, then read Israel’s Scriptures and the world of Jesus and the early Church. The last module brings the questions you have met back together with better tools.</p></header><ol class="unit-list"><li class="unit unit--orientation"><span class="unit-num">00</span><div><p class="eyebrow">Orientation · not scored</p><h3><a data-activity-link="orientation" href="/course?unit=${encodeURIComponent(ORIENTATION_UNIT_ID)}&lesson=${encodeURIComponent(ORIENTATION_LESSON_ID)}">Welcome to Canonical Shelf</a></h3><p>Learn the product, study layers, deeper-study surfaces, Practice, themes, and independent learning tools.</p></div><span>Replay anytime</span></li>${(data.courses||[]).map(course=>{const unitIds=data.byCourse?.[course.id]||[],ids=unitIds.flatMap(id=>data.byUnit?.[id]||[]),progress=progressForIds(ids,state);return `<li class="unit course-entry"><span class="unit-num">${String(course.sequence).padStart(2,'0')}</span><div><p class="eyebrow">${esc(course.level==='advanced'?'Deeper study':'Core curriculum')}</p><h3><a href="/course?course=${encodeURIComponent(course.id)}">${esc(course.title)}</a></h3><p>${esc(course.scope)}</p><progress class="progress-native" value="${progress.done}" max="${progress.total||1}" aria-label="${progress.pct}% complete"></progress><p class="meta">${progress.done}/${progress.total} activities · ${unitIds.length} units</p></div>${course.achievement?`<span>${esc(course.achievement)}</span>`:''}</li>`}).join('')}</ol><p><a href="/course?glossary=1">Open global glossary</a></p>`;
}

