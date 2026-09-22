import {getState,putState} from './db.js';
import {recordMutation} from './sync.js';
import {LIBRARY_BOOKS,CATEGORIES,ERAS,THREADS} from './library-data.js';

let catalogPromise=null;
const esc=(value='')=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const catalog=()=>catalogPromise||=fetch('/data/catalog.json').then(response=>response.ok?response.json():Promise.reject(new Error('Catalog unavailable')));
const main=()=>document.querySelector('#main');
const params=()=>new URLSearchParams(location.search);

function activityKey(){
  if(location.pathname!=='/course')return null;
  const query=params();
  if(query.get('mastery'))return `mastery:${query.get('mastery')}`;
  if(query.get('lesson'))return query.get('lesson')==='orientation'?'orientation:orientation':`lesson:${query.get('lesson')}`;
  return null;
}

function plainStoredText(value){
  if(typeof value==='string')return value;
  return value&&typeof value==='object'?String(value.text||''):'';
}

function unitProgress(data,state,unit){
  const ids=data.byUnit?.[unit.id]||[];
  const completed=new Set(state.completed||[]);
  const done=ids.filter(id=>completed.has(id)).length;
  return {done,total:ids.length,complete:ids.length>0&&done===ids.length,started:done>0};
}

function courseProgress(data,state,course){
  const units=(data.byCourse?.[course.id]||[]).map(id=>(data.units||[]).find(unit=>unit.id===id)).filter(Boolean);
  const ids=units.flatMap(unit=>data.byUnit?.[unit.id]||[]);
  const completed=new Set(state.completed||[]);
  return {units,done:ids.filter(id=>completed.has(id)).length,total:ids.length};
}

async function enhanceCourse(){
  if(location.pathname!=='/course')return;
  const root=main();if(!root)return;
  const query=params();
  if(query.has('lesson')||query.has('mastery')||query.has('unit')||query.has('glossary'))return;
  const data=await catalog().catch(()=>null);if(!data)return;
  const state=await getState().catch(()=>({completed:[]}));

  if(query.has('course')){
    const course=(data.courses||[]).find(item=>item.id===query.get('course'));
    if(course)enhanceCourseDetail(root,data,state,course);
    return;
  }

  const activityIds=new Set((data.activities||[]).map(activity=>activity.id));
  const scoredCompleted=(state.completed||[]).filter(id=>activityIds.has(id));
  if(scoredCompleted.length){
    const completed=new Set(scoredCompleted);
    const next=(data.activities||[]).find(activity=>!completed.has(activity.id));
    const activeCourseId=next?.courseId||(data.activities||[]).findLast?.(activity=>completed.has(activity.id))?.courseId;
    if(activeCourseId){location.replace(`/course?course=${encodeURIComponent(activeCourseId)}`);return;}
  }

  renderCourseChooser(root,data);
}

function renderCourseChooser(root,data){
  const courses=data.courses||[];
  if(!courses.length)return;
  root.innerHTML=`
    <header class="section compact-section course-catalog-heading">
      <p class="eyebrow">Course Catalog</p>
      <h1>Choose where to begin.</h1>
      <p class="lede">Browse the six-course collection, inspect what each course establishes, and open the volume you want to study.</p>
    </header>
    <section class="course-catalog-chooser" aria-label="Canonical learning course catalog">
      <div class="course-selector">
        <header class="course-selector__head"><h2>Canonical learning</h2><p>6 courses · select one to inspect</p></header>
        <div data-course-choices></div>
      </div>
      <article class="course-preview" data-course-preview aria-live="polite"></article>
    </section>`;

  const choices=root.querySelector('[data-course-choices]');
  choices.innerHTML=courses.map((course,index)=>`
    <button class="course-choice" type="button" data-course-choice="${esc(course.id)}" aria-selected="${index===0?'true':'false'}">
      <span class="course-choice__roman">${esc(course.sequence||index+1)}</span>
      <span><strong>${esc(course.shortTitle||course.title)}</strong><small>${esc(course.scope||'')}</small></span>
      <span class="course-choice__arrow" aria-hidden="true">›</span>
    </button>`).join('');

  const renderPreview=course=>{
    const units=(data.byCourse?.[course.id]||[]).map(id=>(data.units||[]).find(unit=>unit.id===id)).filter(Boolean);
    choices.querySelectorAll('[data-course-choice]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.courseChoice===course.id)));
    root.querySelector('[data-course-preview]').innerHTML=`
      <header class="course-preview__head">
        <p class="eyebrow">Course ${esc(course.sequence||'')}</p>
        <h2>${esc(course.title)}</h2>
        <p>${esc(course.scope||'')}</p>
      </header>
      <div class="course-preview__body">
        <section><h3>What this course establishes</h3><p>${esc(course.outcome||course.scope||'')}</p><h3>Learning path</h3><p>The units below are ordered intentionally, while completed material remains available for review.</p></section>
        <section><h3>Course contents</h3><div class="course-preview__units">${units.map((unit,index)=>`<div class="course-preview__unit"><b>${String(index+1).padStart(2,'0')}</b>${esc(unit.title)}</div>`).join('')}</div></section>
      </div>
      <footer class="course-preview__foot"><div class="course-preview__meta"><span>${units.length} units</span><span>No progress yet</span><a href="/course?unit=unit.orientation&lesson=orientation">Orientation</a></div><a class="button" href="/course?course=${encodeURIComponent(course.id)}">Open course →</a></footer>`;
  };

  choices.addEventListener('click',event=>{
    const button=event.target.closest('[data-course-choice]');if(!button)return;
    const course=courses.find(item=>item.id===button.dataset.courseChoice);if(course)renderPreview(course);
  });
  renderPreview(courses[0]);
}

function enhanceCourseDetail(root,data,state,course){
  if(root.querySelector('.course-catalog-detail'))return;
  const hero=root.querySelector('.course-detail-hero');
  const grid=root.querySelector('.unit-card-grid');
  if(!hero||!grid)return;

  const allCourses=data.courses||[];
  const courseIndex=allCourses.findIndex(item=>item.id===course.id);
  const units=(data.byCourse?.[course.id]||[]).map(id=>(data.units||[]).find(unit=>unit.id===id)).filter(Boolean);
  let currentIndex=units.findIndex(unit=>!unitProgress(data,state,unit).complete);
  if(currentIndex<0)currentIndex=Math.max(0,units.length-1);
  const labels=[['Current',units[currentIndex]],['Next',units[currentIndex+1]],['Later',units[currentIndex+2]]].filter(([,unit])=>unit);

  hero.insertAdjacentHTML('afterbegin','<div class="course-current-label">Current volume</div>');
  const total=hero.querySelector('.course-total-state');
  total?.insertAdjacentHTML('beforebegin',`<div class="course-current-sequence">${labels.map(([label,unit])=>`<div><small>${label}</small><strong>${esc(unit.title)}</strong></div>`).join('')}</div>`);
  hero.insertAdjacentHTML('beforeend',`<nav class="course-volume-nav" aria-label="Course navigation"><a ${courseIndex<=0?'aria-disabled="true" tabindex="-1"':''} href="${courseIndex>0?`/course?course=${encodeURIComponent(allCourses[courseIndex-1].id)}`:'#'}">Prev</a><a ${courseIndex>=allCourses.length-1?'aria-disabled="true" tabindex="-1"':''} href="${courseIndex<allCourses.length-1?`/course?course=${encodeURIComponent(allCourses[courseIndex+1].id)}`:'#'}">Next</a></nav>`);

  const contents=document.createElement('section');
  contents.className='course-catalog-contents';
  contents.innerHTML=`<header class="course-catalog-contents__head"><p class="eyebrow">Course ${esc(course.sequence||'')} contents</p><h2>${esc(course.shortTitle||course.title)}</h2><p>${units.length} units · open any available activity</p></header>`;
  grid.before(contents);contents.append(grid);

  const shell=document.createElement('div');shell.className='course-catalog-detail';
  hero.before(shell);shell.append(hero,contents);
}

function sceneRailState(focus){
  const links=[...focus.querySelectorAll('.scene-rail a')];
  const current=Math.max(0,links.findIndex(link=>link.getAttribute('aria-current')==='step'));
  links.forEach((link,index)=>{
    link.dataset.complete=String(index<current);
    const dot=link.querySelector('span');if(dot)dot.textContent='';
  });
}

function enhanceStudyFocus(){
  const focus=main()?.querySelector('.study-focus');if(!focus||focus.dataset.libraryEnhanced==='true')return;
  focus.dataset.libraryEnhanced='true';
  sceneRailState(focus);

  const sourceIdentity=focus.querySelector('.study-focus__identity');
  const sourceHierarchy=sourceIdentity?.querySelector('span')?.textContent?.trim()||'';
  const sourceLesson=sourceIdentity?.querySelector('strong')?.textContent?.trim()||'';
  const lessonTitle=sourceLesson.replace(/^Lesson\s+\d+\s*[·-]\s*/i,'').trim()||sourceLesson;
  const match=sourceHierarchy.match(/Course\s+(\d+)\s*·\s*(.*?)\s*·\s*Unit\s+(\d+)\s*·\s*(.*)/i);
  const shortLesson=(lessonTitle.split(':')[0]||lessonTitle).trim();
  const hierarchy=match?`COURSE ${match[1]} / ${match[2].toUpperCase()} · UNIT ${match[3]} / ${match[4].toUpperCase()} · ${shortLesson.toUpperCase()}`:sourceHierarchy.toUpperCase();

  const folioHead=focus.querySelector('.study-folio__head');
  const sceneRole=folioHead?.querySelector('.eyebrow')?.textContent?.replace(/\s*·\s*orientation/i,'').trim()||'Study';
  const sceneTitle=folioHead?.querySelector('h1')?.textContent?.trim()||'';
  if(folioHead){
    folioHead.innerHTML=`<div class="library-lesson-identity"><span>${esc(hierarchy)}</span><strong>${esc(lessonTitle)}</strong></div>`;
  }
  const inner=focus.querySelector('.study-scene__inner');
  if(inner&&!inner.querySelector('.scene-content-head'))inner.insertAdjacentHTML('afterbegin',`<header class="scene-content-head"><p class="eyebrow">${esc(sceneRole)}</p><h2>${esc(sceneTitle)}</h2></header>`);

  enhanceSessionPane(focus);
  requestAnimationFrame(()=>requestAnimationFrame(()=>enhanceStudyGuide(focus)));
}

function enhanceStudyGuide(focus){
  const guideButton=focus.querySelector('.study-focus__utilities [data-study-guide]');
  if(guideButton){guideButton.textContent='Theologian';guideButton.dataset.ask='What can you help me study in this lesson?';}
}

function enhanceSessionPane(focus){
  const pane=focus.querySelector('#study-apparatus');if(!pane)return;
  const head=pane.querySelector('.study-apparatus__head');if(!head)return;
  const modules=[...pane.children].filter(node=>node!==head);
  const body=document.createElement('div');body.className='session-pane-body';
  modules.forEach(node=>body.append(node));
  pane.append(body);
  head.querySelector('h2').textContent='Session Notes';
  head.insertAdjacentHTML('beforeend','<div class="session-pane-actions"><button type="button" data-session-journal>Journal Notes</button><button type="button" data-session-feedback>Feedback</button></div>');
  head.insertAdjacentHTML('afterend','<p class="session-context-note">Notes, journal writing, and feedback are tied to the current study activity.</p>');
  const defaultMarkup=body.innerHTML;
  const restore=()=>{body.innerHTML=defaultMarkup;};

  pane.addEventListener('click',async event=>{
    if(event.target.closest('[data-session-journal]')){await openJournalEditor(body,restore);return;}
    if(event.target.closest('[data-session-feedback]')){openFeedbackEditor(body,restore);return;}
    if(event.target.closest('[data-session-cancel]')){restore();return;}
  });
}

async function openJournalEditor(body,restore){
  const key=activityKey();if(!key)return;
  const state=await getState();
  const existing=plainStoredText(state.journal?.[key]);
  body.innerHTML=`<form class="session-editor" data-session-journal-form><label>Journal Notes<textarea name="journal" maxlength="12000" placeholder="What do you want to remember, question, or revisit from this lesson?">${esc(existing)}</textarea></label><p class="session-context-note">Private, unscored, and tied to this current study activity.</p><div class="session-editor__actions"><button type="button" data-session-cancel>Cancel</button><span class="session-editor__status" role="status"></span><button type="submit" data-primary>Save</button></div></form>`;
  const form=body.querySelector('[data-session-journal-form]');form.querySelector('textarea')?.focus();
  form.addEventListener('submit',async event=>{
    event.preventDefault();const status=form.querySelector('.session-editor__status');status.textContent='Saving…';
    const current=await getState(),at=new Date().toISOString(),text=String(new FormData(form).get('journal')||'');
    current.journal={...(current.journal||{}),[key]:{text,updatedAt:at}};
    recordMutation(current,'personal-study',{id:key,fields:['journal'],updatedAt:at},at);
    await putState(current);document.dispatchEvent(new Event('canonical-state-changed'));restore();
  });
}

const FEEDBACK_QUEUE_KEY='canonical-shelf-feedback-queue-v1';
function feedbackQueue(){try{const value=JSON.parse(localStorage.getItem(FEEDBACK_QUEUE_KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}}
function openFeedbackEditor(body,restore){
  body.innerHTML=`<form class="session-editor" data-session-feedback-form><label>Feedback type<select name="category"><option value="product">Product or experience</option><option value="content">Content or source</option><option value="theology">Theology or interpretation</option><option value="bug">Bug</option><option value="accessibility">Accessibility</option><option value="other">Other</option></select></label><label>Feedback<textarea name="message" maxlength="4000" required placeholder="What happened, what should change, or what needs review?"></textarea></label><p class="session-context-note">The current activity is attached internally. Submitted feedback is not shown as learner history.</p><div class="session-editor__actions"><button type="button" data-session-cancel>Cancel</button><span class="session-editor__status" role="status"></span><button type="submit" data-primary>Send</button></div></form>`;
  const form=body.querySelector('[data-session-feedback-form]');form.querySelector('textarea')?.focus();
  form.addEventListener('submit',async event=>{
    event.preventDefault();const status=form.querySelector('.session-editor__status');
    const data=new FormData(form),payload={category:String(data.get('category')||'other'),message:String(data.get('message')||'').trim(),contact:'',route:`${location.pathname}${location.search}`.slice(0,512),clientCreatedAt:new Date().toISOString()};
    if(payload.message.length<5){status.textContent='Add a little more detail.';return;}
    status.textContent='Sending…';
    try{
      const response=await fetch('/api/feedback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      if(!response.ok)throw new Error('send failed');
      restore();
    }catch{
      const queue=feedbackQueue();queue.push(payload);localStorage.setItem(FEEDBACK_QUEUE_KEY,JSON.stringify(queue.slice(-50)));restore();
    }
  });
}

function enhanceBibleShelf(){
  const root=main();if(!root)return;
  root.querySelectorAll('.shelf-spine').forEach(spine=>{
    if(spine.querySelector('.shelf-spine__reveal'))return;
    const name=spine.querySelector('strong')?.textContent?.trim();if(!name)return;
    spine.insertAdjacentHTML('beforeend',`<span class="shelf-spine__reveal" aria-hidden="true">${esc(name)}</span>`);
  });
}

function mobileShelfPeek(event){
  const spine=event.target.closest('.shelf-spine');if(!spine||matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  if(spine.dataset.nameVisible!=='true'){
    event.preventDefault();event.stopPropagation();
    document.querySelectorAll('.shelf-spine[data-name-visible="true"]').forEach(item=>{if(item!==spine)delete item.dataset.nameVisible});
    spine.dataset.nameVisible='true';spine.focus({preventScroll:true});
  }
}

function eraName(book){return ERAS.find(era=>era.k===book?.era)?.name||book?.era||'Historical setting';}
function enhanceBibleReader(){
  const root=main();const reader=root?.querySelector('.reader.scripture');if(!reader||reader.closest('.bible-reader-shell'))return;
  const bookNumber=Number(params().get('book'));const book=LIBRARY_BOOKS[bookNumber-1];if(!book)return;
  const category=CATEGORIES[book.cat];
  const footer=reader.querySelector('.reader-footer');const footerHtml=footer?.innerHTML||'';footer?.remove();
  const shell=document.createElement('section');shell.className='bible-reader-shell';reader.before(shell);shell.append(reader);
  const panel=document.createElement('aside');panel.className='library-reader-panel';
  panel.innerHTML=`<header class="library-reader-panel__head"><p class="eyebrow">Book notes</p><h2>${esc(book.name)}</h2><p class="library-panel-note">Context for the book currently open. Expand only what you need while reading.</p></header>
    <details open><summary>At a glance</summary><div><p><strong>${esc(book.hook||'')}</strong></p><p>${esc(book.syn||'')}</p></div></details>
    <details><summary>People &amp; setting</summary><div><p><strong>Written by:</strong> ${esc(book.who||'Not specified')}</p><p><strong>Period:</strong> ${esc(book.when||'Not specified')}</p><p><strong>Story setting:</strong> ${esc(eraName(book))}</p><p><strong>People:</strong> ${esc((book.people||[]).join(' · ')||'Not specified')}</p></div></details>
    <details><summary>Group &amp; themes</summary><div><p>${esc(category?.blurb||'')}</p><ul>${(book.threads||[]).map(thread=>`<li>${esc(THREADS[thread]||thread)}</li>`).join('')}</ul></div></details>
    <details><summary>Where to start</summary><div><p>${esc(book.read||'Begin with chapter 1.')}</p></div></details>
    <details><summary>Reader links</summary><div>${footerHtml||`<p><a href="/bible?book=${bookNumber}&profile=1">Book details</a></p><p><a href="/bible?view=shelf">Bookshelf</a></p>`}</div></details>`;
  shell.append(panel);
}

function cloneInner(node,selector){return node?.querySelector(selector)?.innerHTML||'';}
function enhanceTopicReader(){
  const root=main();const article=root?.querySelector('.topic-reference-page');if(!article||article.closest('.topic-library-shell'))return;
  const meta=article.querySelector('.topic-reference-meta');
  const aliases=article.querySelector('.topic-aliases');
  const evidence=[...article.querySelectorAll('.topic-evidence')];
  const related=article.querySelector('.related-topics');
  const shell=document.createElement('section');shell.className='topic-library-shell';article.before(shell);shell.append(article);
  const panel=document.createElement('aside');panel.className='topic-context-panel';
  const evidenceDetails=evidence.map(section=>{const title=section.querySelector('.eyebrow')?.textContent?.trim()||'Connections';const content=[...section.children].filter(child=>!child.classList.contains('eyebrow')).map(child=>child.outerHTML).join('');return `<details><summary>${esc(title)}</summary><div>${content}</div></details>`}).join('');
  panel.innerHTML=`<header class="topic-context-panel__head"><p class="eyebrow">Reference notes</p><h2>Context &amp; connections</h2><p class="library-panel-note">These references belong to the topic currently open and do not count toward course completion.</p></header>
    ${meta?`<details open><summary>Topic details</summary><div>${meta.innerHTML}</div></details>`:''}
    ${aliases?`<details><summary>Related search language</summary><div>${cloneInner(aliases,'.badge-row')}</div></details>`:''}
    ${evidenceDetails}
    ${related?`<details><summary>Related exploration</summary><div>${cloneInner(related,'.topic-card-grid')}</div></details>`:''}`;
  shell.append(panel);
}

function enhanceFeedbackEverywhere(){
  const button=document.querySelector('#feedback-open');
  if(button){button.hidden=false;button.removeAttribute('aria-hidden');}
}

function enhanceAccountThemes(){
  const body=document.querySelector('#account-body');if(!body||body.querySelector('.profile-theme-choice'))return;
  const themes=[
    ['canonical-original','Canonical Original','Flat charcoal, cool-neutral surfaces, and gilt.'],
    ['heritage','Heritage','Warm paper and heritage editorial accents.'],
    ['oxblood','Oxblood','Deep burgundy and parchment.'],
    ['slate-linen','Slate & Linen','Cool slate and quiet scholarly neutrals.'],
    ['illuminated-jewel','Illuminated Jewel','Restrained manuscript-inspired jewel accents.'],
    ['bookshelf-spectrum','Bookshelf Spectrum','Neutral folio with Canonical Shelf category colors.']
  ];
  const selected=document.documentElement.dataset.theme||'canonical-original';
  body.insertAdjacentHTML('beforeend',`<section class="profile-theme-choice"><p class="eyebrow">Profile preference</p><h3>Theme</h3><p>Choose the visual package used across Canonical Shelf. This changes presentation only.</p><div class="profile-theme-grid">${themes.map(([id,name,summary])=>`<button class="theme-card ${selected===id?'is-selected':''}" type="button" data-theme-option="${id}" aria-pressed="${selected===id?'true':'false'}"><span class="theme-card__swatch" aria-hidden="true"><i></i><i></i><i></i></span><strong>${name}</strong><span>${summary}</span></button>`).join('')}</div></section>`);
}

async function enhanceCurrentRoute(){
  enhanceFeedbackEverywhere();
  if(location.pathname==='/course'){
    await enhanceCourse();
    enhanceStudyFocus();
  }
  if(location.pathname==='/bible'){
    enhanceBibleShelf();enhanceBibleReader();
  }
  if(location.pathname==='/topics')enhanceTopicReader();
}

const schedule=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>void enhanceCurrentRoute()));
document.addEventListener('canonical-route-rendered',schedule);
document.addEventListener('canonical-app-ready',schedule);
document.addEventListener('click',event=>{
  mobileShelfPeek(event);
  if(event.target.closest('#account-open'))setTimeout(enhanceAccountThemes,250);
});
document.addEventListener('canonical-theme-changed',()=>{
  document.querySelectorAll('.profile-theme-grid [data-theme-option]').forEach(button=>{
    const selected=button.dataset.themeOption===document.documentElement.dataset.theme;
    button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));
  });
});
setTimeout(schedule,0);
