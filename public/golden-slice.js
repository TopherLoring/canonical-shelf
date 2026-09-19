import {getState} from './db.js';

const GOLDEN_LESSON_ID='begin';

function activityHref(data,id){
  const activity=data.activities?.find(item=>item.id===id);
  if(!activity)return'/course';
  return activity.type==='lesson'
    ?`/course?unit=${encodeURIComponent(activity.unitId)}&lesson=${encodeURIComponent(activity.sourceId)}`
    :`/course?unit=${encodeURIComponent(activity.unitId)}&mastery=${encodeURIComponent(activity.sourceId)}`;
}

function refHref(lesson){
  const [book,chapter]=lesson.ref||[];
  return Number.isFinite(book)&&Number.isFinite(chapter)
    ?`/bible?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}`
    :'/bible';
}

function sceneNav(index,total){
  return `<footer class="gs-scene-nav" aria-label="Lesson scene navigation">
    <button class="gs-nav-button" type="button" data-gs-nav="back" ${index===0?'disabled':''}>← Previous</button>
    <span class="gs-scene-count" aria-live="polite">Scene ${index+1} of ${total}</span>
    <button class="gs-nav-button gs-nav-primary" type="button" data-gs-nav="next" ${index===total-1?'disabled':''}>Next →</button>
  </footer>`;
}

function scene(index,total,role,title,body,{challengeIndex=null}={}){
  return `<section class="gs-scene gs-scene-${role.toLowerCase()}" data-gs-scene="${index}" data-gs-role="${role}" ${challengeIndex===null?'':`data-challenge-index="${challengeIndex}"`} ${index===0?'':'hidden'}>
    <header class="gs-scene-head"><p class="eyebrow">${role}</p><h2>${title}</h2></header>
    <div class="gs-scene-body">${body}</div>
    ${sceneNav(index,total)}
  </section>`;
}

function hint(ch,esc){
  const text=ch.hint||ch.hints?.[0]||'Return to the evidence and context before choosing.';
  return `<details class="gs-hint"><summary>Use a hint</summary><p>${esc(text)}</p></details>`;
}

function feedback(){return '<div class="feedback" role="status" aria-live="polite"></div>';}

function sequenceForm(ch,aid,index,esc){
  const hidden=ch.items.map((_,position)=>`<input type="hidden" name="p${position}" value="${position}">`).join('');
  const items=ch.items.map((item,itemIndex)=>`<li class="gs-sequence-item" data-gs-seq-value="${itemIndex}">
      <span class="gs-sequence-index" aria-hidden="true">${String(itemIndex+1).padStart(2,'0')}</span>
      <span class="gs-sequence-text">${esc(item)}</span>
      <span class="gs-sequence-actions">
        <button type="button" data-gs-seq-move="up" aria-label="Move ${esc(item)} earlier">↑</button>
        <button type="button" data-gs-seq-move="down" aria-label="Move ${esc(item)} later">↓</button>
      </span>
    </li>`).join('');
  return `<form class="challenge golden-challenge gs-sequence" data-activity="${esc(aid)}" data-index="${index}" data-kind="${esc(ch.kind||'sequence')}" data-shape="sequence" data-mode="scored">
    <p class="eyebrow">Reconstruct</p><h3>${esc(ch.title)}</h3><p class="gs-prompt">${esc(ch.prompt)}</p>
    ${hidden}<ol class="gs-sequence-list">${items}</ol>
    ${hint(ch,esc)}<button class="button gs-check" type="submit">Check sequence</button>${feedback()}
  </form>`;
}

function choiceMatrix(ch,aid,index,esc,{argument=false}={}){
  const rows=(ch.items||ch.fields||[]).map((item,itemIndex)=>{
    const options=Array.isArray(ch.options?.[itemIndex])?ch.options[itemIndex]:ch.options||[];
    const buttons=options.map((option,optionIndex)=>`<button type="button" class="gs-pair-option" data-gs-pick="${optionIndex}" aria-pressed="false">${esc(option)}</button>`).join('');
    const label=argument?item.replace(/^(Observation|Interpretation|Application|Alternative interpretation|Competing claim):\s*/,'$1 · '):item;
    return `<fieldset class="gs-pair-row ${argument?'gs-argument-row':''}" data-gs-pair-row="${itemIndex}">
      <legend>${esc(label)}</legend>
      <input type="hidden" name="p${itemIndex}" value="">
      <div class="gs-pair-options">${buttons}</div>
      <p class="gs-selection" data-gs-selection aria-live="polite">No relationship selected</p>
    </fieldset>`;
  }).join('');
  return `<form class="challenge golden-challenge ${argument?'gs-argument':'gs-match'}" data-activity="${esc(aid)}" data-index="${index}" data-kind="${esc(ch.kind||'match')}" data-shape="${argument?'fields':'match'}" data-mode="scored">
    <p class="eyebrow">${argument?'Evidence map':'Connect'}</p><h3>${esc(ch.title)}</h3><p class="gs-prompt">${esc(ch.prompt)}</p>
    <div class="gs-pair-board">${rows}</div>
    ${hint(ch,esc)}<button class="button gs-check" type="submit">${argument?'Check evidence map':'Check matches'}</button>${feedback()}
  </form>`;
}

function challengeForm(ch,aid,index,esc){
  if(ch?.kind==='argument-map')return choiceMatrix(ch,aid,index,esc,{argument:true});
  if(Array.isArray(ch?.items)&&Array.isArray(ch?.options))return choiceMatrix(ch,aid,index,esc);
  return sequenceForm(ch,aid,index,esc);
}

function orientScene(lesson,esc){
  const vocabCount=Object.keys(lesson.vocab||{}).length;
  const checkCount=lesson.challenges?.length||0;
  return `<div class="gs-orient-grid">
    <div class="gs-orient-copy">
      <p class="gs-kicker">Unit ${String(lesson.v6Unit||'').replace('unit.','').replaceAll('-',' ')} · Guided lesson</p>
      <h1>${esc(lesson.title)}</h1>
      <p class="lede">${esc(lesson.objective||'')}</p>
      <p class="gs-reading-line"><span>Primary reading</span><strong>${esc(lesson.reading||'Open the assigned passage')}</strong></p>
    </div>
    <aside class="gs-lesson-index" aria-label="Lesson shape">
      <p class="eyebrow">This folio</p>
      <dl><div><dt>Read</dt><dd>${esc(lesson.reading||'Assigned passage')}</dd></div><div><dt>Terms</dt><dd>${vocabCount}</dd></div><div><dt>Checks</dt><dd>${checkCount}</dd></div><div><dt>Finish</dt><dd>Reflect + retain</dd></div></dl>
    </aside>
  </div>`;
}

function readScene(lesson,esc){
  return `<div class="gs-reading-spread">
    <div><p class="eyebrow">Anchor text</p><h3>${esc(lesson.reading||'Primary reading')}</h3><p class="lede">Read the passage itself before resolving every theological question around it.</p><p><a class="button gs-scripture-link" href="${refHref(lesson)}">Open in Bible →</a></p></div>
    <aside class="gs-marginalia"><p class="eyebrow">Reading posture</p><p>Notice what the passage says, who is speaking, who receives it, and what role this paragraph plays before moving to application.</p></aside>
  </div>`;
}

function explainScene(lesson,esc){
  const body=(lesson.body||[]).slice(0,2).map(p=>`<p>${esc(p)}</p>`).join('');
  return `<div class="gs-folio-copy">${body}${lesson.simple?`<aside class="gs-plain"><span>In plain language</span><p>${esc(lesson.simple)}</p></aside>`:''}</div>`;
}

function contextScene(lesson,esc){
  const body=(lesson.body||[]).slice(2).map(p=>`<p>${esc(p)}</p>`).join('');
  const vocab=Object.entries(lesson.vocab||{}).map(([term,definition])=>`<div><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></div>`).join('');
  return `<div class="gs-context-layout">
    <div class="gs-folio-copy">${body}${lesson.deeper?`<details class="gs-deeper"><summary>Open the deeper note</summary><p>${esc(lesson.deeper)}</p></details>`:''}</div>
    <aside class="gs-margin-rail"><p class="eyebrow">Working vocabulary</p><dl class="gs-vocab">${vocab}</dl></aside>
  </div>`;
}

function proclamationScene(lesson,esc){
  const challenge=lesson.challenges?.[0];
  if(!challenge?.items||!challenge?.answer)return'<p>No authored structural visual is available.</p>';
  const ordered=challenge.answer.map(index=>challenge.items[index]);
  return `<div class="gs-proclamation" aria-label="The proclamation sequence">
    ${ordered.map((item,index)=>`<div class="gs-proclamation-step"><span>${String(index+1).padStart(2,'0')}</span><strong>${esc(item)}</strong></div>`).join('<div class="gs-proclamation-rule" aria-hidden="true"></div>')}
  </div><p class="gs-caption">This visual exposes the structure already authored in the lesson's sequence challenge; it does not add a new theological claim.</p>`;
}

function reflectScene(lesson,esc){
  return `<div class="gs-reflect"><p class="lede">${esc(lesson.reflect||'What changed in how you would explain this material?')}</p>${lesson.model?`<details><summary>Compare with a model response</summary><p>${esc(lesson.model)}</p></details>`:''}</div>`;
}

function continueScene(data,state,lesson,aid,esc){
  const ids=data.byUnit?.[lesson.v6Unit]||[];
  const current=ids.indexOf(aid);
  const nextId=current>=0?ids[current+1]:null;
  const complete=state.completed?.includes(aid);
  const review=state.reviewSchedule?.[aid];
  return `<div class="gs-continue">
    <p class="eyebrow">Lesson state</p>
    <h3 class="gs-completion-title">${complete?'Complete — now retain it':'Finish the checks to complete this lesson'}</h3>
    <p class="gs-completion" data-gs-completion>${complete?(review?.dueAt?`First review scheduled for ${new Date(review.dueAt).toLocaleDateString()}.`:'Completion recorded.'): 'Your reading and scene navigation are not scored. Completion depends on the authored checks.'}</p>
    <div class="gs-next-actions"><a class="button" href="${nextId?activityHref(data,nextId):`/course?unit=${encodeURIComponent(lesson.v6Unit)}`}">${nextId?'Continue to the next activity →':'Return to the unit →'}</a><a href="/practice">Open Practice</a></div>
  </div>`;
}

export function goldenLessonView({data,state,lesson,esc}){
  if(lesson?.id!==GOLDEN_LESSON_ID)return null;
  const aid=`lesson:${lesson.id}`;
  const challenges=lesson.challenges||[];
  const total=8+challenges.length;
  const scenes=[];
  scenes.push(scene(0,total,'Orient','Begin with a clear frame',orientScene(lesson,esc)));
  scenes.push(scene(1,total,'Read','Start with the text',readScene(lesson,esc)));
  scenes.push(scene(2,total,'Explain','Name the central claim without demanding assent',explainScene(lesson,esc)));
  scenes.push(scene(3,total,'Visualize','See the proclamation as a sequence',proclamationScene(lesson,esc)));
  scenes.push(scene(4,total,'Context','Keep community, language, and evidence attached',contextScene(lesson,esc)));
  challenges.forEach((challenge,index)=>{
    scenes.push(scene(5+index,total,'Practice',challenge.title,challengeForm(challenge,aid,index,esc),{challengeIndex:index}));
  });
  scenes.push(scene(5+challenges.length,total,'Reflect','Put the distinction into your own words',reflectScene(lesson,esc)));
  scenes.push(scene(6+challenges.length,total,'Retention','Know what happens after completion',`<div class="gs-retention"><p>Full completion schedules review after the entire activity is demonstrated, not after one successful check.</p><ol><li>1 day</li><li>3 days</li><li>7 days</li><li>14 days</li><li>30 days</li><li>60 days</li></ol></div>`));
  scenes.push(scene(7+challenges.length,total,'Continue','Close the loop',continueScene(data,state,lesson,aid,esc)));

  return `<article class="lesson golden-lesson" data-gs-activity="${esc(aid)}">
    <a class="gs-back-link" href="/course?unit=${encodeURIComponent(lesson.v6Unit)}">← Back to unit</a>
    <div class="gs-shell">
      <nav class="gs-scene-rail" aria-label="Lesson scenes">
        <p class="eyebrow">Lesson folio</p>
        <ol>${scenes.map((_,index)=>`<li><button type="button" data-gs-scene-target="${index}" ${index===0?'aria-current="step"':''}><span>${String(index+1).padStart(2,'0')}</span><span>${['Orient','Read','Explain','Visualize','Context',...challenges.map(()=> 'Practice'),'Reflect','Retention','Continue'][index]}</span></button></li>`).join('')}</ol>
      </nav>
      <div class="gs-folio">${scenes.join('')}</div>
    </div>
  </article>`;
}

function setScene(article,index,{focus=true}={}){
  const scenes=[...article.querySelectorAll('[data-gs-scene]')];
  const safe=Math.max(0,Math.min(index,scenes.length-1));
  scenes.forEach((item,itemIndex)=>item.toggleAttribute('hidden',itemIndex!==safe));
  article.querySelectorAll('[data-gs-scene-target]').forEach(button=>{
    if(Number(button.dataset.gsSceneTarget)===safe)button.setAttribute('aria-current','step');
    else button.removeAttribute('aria-current');
  });
  if(focus)scenes[safe]?.querySelector('.gs-scene-head h2, h1')?.focus?.({preventScroll:true});
  scenes[safe]?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

function updateSequence(form){
  [...form.querySelectorAll('[data-gs-seq-value]')].forEach((item,index)=>{
    const input=form.querySelector(`input[name="p${index}"]`);
    if(input)input.value=item.dataset.gsSeqValue;
    const marker=item.querySelector('.gs-sequence-index');
    if(marker)marker.textContent=String(index+1).padStart(2,'0');
  });
}

function choosePair(button){
  const row=button.closest('[data-gs-pair-row]');
  const form=button.closest('form');
  if(!row||!form)return;
  const index=Number(row.dataset.gsPairRow);
  const input=form.querySelector(`input[name="p${index}"]`);
  if(input)input.value=button.dataset.gsPick;
  row.querySelectorAll('[data-gs-pick]').forEach(option=>option.setAttribute('aria-pressed',option===button?'true':'false'));
  const selected=row.querySelector('[data-gs-selection]');
  if(selected)selected.textContent=`Selected: ${button.textContent.trim()}`;
}

async function refreshGoldenState(){
  const article=document.querySelector('.golden-lesson[data-gs-activity]');
  if(!article)return;
  const state=await getState();
  const aid=article.dataset.gsActivity;
  const progress=state.challengeProgress?.[aid];
  article.querySelectorAll('[data-challenge-index]').forEach(scene=>{
    const index=scene.dataset.challengeIndex;
    const passed=progress?.challenges?.[index]?.passed===true;
    scene.classList.toggle('is-passed',passed);
    const rail=article.querySelector(`[data-gs-scene-target="${scene.dataset.gsScene}"]`);
    rail?.classList.toggle('is-passed',passed);
  });
  const completion=article.querySelector('[data-gs-completion]');
  const title=article.querySelector('.gs-completion-title');
  if(state.completed?.includes(aid)){
    if(title)title.textContent='Complete — now retain it';
    const due=state.reviewSchedule?.[aid]?.dueAt;
    if(completion)completion.textContent=due?`First review scheduled for ${new Date(due).toLocaleDateString()}.`:'Completion recorded.';
  }
}

if(typeof document!=='undefined'){
  document.addEventListener('click',event=>{
    const article=event.target.closest?.('.golden-lesson');
    if(!article)return;

    const direct=event.target.closest('[data-gs-scene-target]');
    if(direct){setScene(article,Number(direct.dataset.gsSceneTarget));return;}

    const nav=event.target.closest('[data-gs-nav]');
    if(nav){
      const current=[...article.querySelectorAll('[data-gs-scene]')].findIndex(item=>!item.hidden);
      setScene(article,current+(nav.dataset.gsNav==='next'?1:-1));
      return;
    }

    const move=event.target.closest('[data-gs-seq-move]');
    if(move){
      const item=move.closest('[data-gs-seq-value]');
      const form=move.closest('form');
      if(!item||!form)return;
      if(move.dataset.gsSeqMove==='up'&&item.previousElementSibling)item.parentNode.insertBefore(item,item.previousElementSibling);
      if(move.dataset.gsSeqMove==='down'&&item.nextElementSibling)item.parentNode.insertBefore(item.nextElementSibling,item);
      updateSequence(form);
      item.focus?.();
      return;
    }

    const pick=event.target.closest('[data-gs-pick]');
    if(pick)choosePair(pick);
  });

  window.addEventListener('canonical-state-changed',()=>{refreshGoldenState().catch(()=>{});});
}
