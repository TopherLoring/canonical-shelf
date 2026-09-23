const ORIENTATION_UNIT_ID='unit.orientation';
const ORIENTATION_LESSON_ID='orientation';

const progressFor=(ids,state)=>{const completed=new Set(state?.completed||[]),done=(ids||[]).filter(id=>completed.has(id)).length;return{done,total:(ids||[]).length,pct:(ids||[]).length?Math.round(done/(ids||[]).length*100):0}};
const dueSet=state=>new Set(Object.entries(state?.reviewSchedule||{}).filter(([,v])=>Date.parse(v?.dueAt)<=Date.now()).map(([id])=>id));
const activityHref=a=>a?.type==='lesson'?`/course?unit=${encodeURIComponent(a.unitId)}&lesson=${encodeURIComponent(a.sourceId)}`:a?`/course?unit=${encodeURIComponent(a.unitId)}&mastery=${encodeURIComponent(a.sourceId)}`:'/course';

function unitStats(data,state,unit){
  const ids=data.byUnit?.[unit.id]||[],progress=progressFor(ids,state),due=dueSet(state),activities=ids.map(id=>(data.activities||[]).find(a=>a.id===id)).filter(Boolean);
  const reviewDue=ids.filter(id=>due.has(id)).length;
  const mastery=activities.filter(a=>a.type==='mastery');
  const masteryDone=mastery.filter(a=>state.completed?.includes(a.id)).length;
  const next=activities.find(a=>!state.completed?.includes(a.id))||activities.find(a=>due.has(a.id))||null;
  const status=progress.done===progress.total&&progress.total?'complete':progress.done?'in-progress':'not-started';
  return {...progress,reviewDue,masteryTotal:mastery.length,masteryDone,next,status};
}
function statusLabel(stats){if(stats.reviewDue)return `${stats.reviewDue} review${stats.reviewDue===1?'':'s'} due`;if(stats.status==='complete')return'Complete';if(stats.status==='in-progress')return'In progress';return'Not started'}
function courseUnits(data,course){return (data.byCourse?.[course.id]||[]).map(id=>(data.units||[]).find(unit=>unit.id===id)).filter(Boolean)}
function courseIds(data,course){return courseUnits(data,course).flatMap(unit=>data.byUnit?.[unit.id]||[])}
function courseProgress(data,state,course){const units=courseUnits(data,course),ids=courseIds(data,course),completed=new Set(state?.completed||[]),done=ids.filter(id=>completed.has(id)).length;return{units,ids,done,total:ids.length,pct:Math.round(done/Math.max(ids.length,1)*100),complete:ids.length>0&&done===ids.length,started:done>0}}

function chooserPreview(data,course,esc){
  const units=courseUnits(data,course);
  return `<header class="course-preview__head"><p class="eyebrow">Course ${esc(course.sequence||'')}</p><h2>${esc(course.title)}</h2><p>${esc(course.scope||'')}</p></header><div class="course-preview__body"><section><h3>What this course establishes</h3><p>${esc(course.outcome||course.scope||'')}</p><h3>Learning path</h3><p>The units below are ordered intentionally, while completed material remains available for review.</p></section><section><h3>Course contents</h3><div class="course-preview__units">${units.map((unit,index)=>`<div class="course-preview__unit"><b>${String(index+1).padStart(2,'0')}</b>${esc(unit.title)}</div>`).join('')}</div></section></div><footer class="course-preview__foot"><div class="course-preview__meta"><span>${units.length} units</span><span>No progress yet</span><a href="/course?unit=${encodeURIComponent(ORIENTATION_UNIT_ID)}&lesson=${encodeURIComponent(ORIENTATION_LESSON_ID)}">Orientation</a></div><a class="button" href="/course?course=${encodeURIComponent(course.id)}">Open course →</a></footer>`;
}

function chooserView({data,esc}){
  const courses=data.courses||[],first=courses[0];
  const templates=courses.map(course=>`<template data-course-preview-template="${esc(course.id)}">${chooserPreview(data,course,esc)}</template>`).join('');
  return `<header class="section compact-section course-catalog-heading"><p class="eyebrow">Course Catalog</p><h1>Choose where to begin.</h1><p class="lede">Browse the six-course collection, inspect what each course establishes, and open the volume you want to study.</p></header><section class="course-catalog-chooser" aria-label="Canonical learning course catalog"><div class="course-selector"><header class="course-selector__head"><h2>Canonical learning</h2><p>6 courses · select one to inspect</p></header><div data-course-choices>${courses.map((course,index)=>`<button class="course-choice" type="button" data-course-choice="${esc(course.id)}" aria-selected="${index===0?'true':'false'}"><span class="course-choice__roman">${esc(course.sequence||index+1)}</span><span><strong>${esc(course.shortTitle||course.title)}</strong><small>${esc(course.scope||'')}</small></span><span class="course-choice__arrow" aria-hidden="true">›</span></button>`).join('')}</div>${templates}</div><article class="course-preview" data-course-preview aria-live="polite">${first?chooserPreview(data,first,esc):''}</article></section>`;
}

function volumeLandingView({data,state,esc}){
  const courses=data.courses||[],completed=new Set(state?.completed||[]),firstIncomplete=(data.activities||[]).find(activity=>!completed.has(activity.id));
  const activeCourseId=firstIncomplete?.courseId||courses.find(course=>courseProgress(data,state,course).started&&!courseProgress(data,state,course).complete)?.id||courses[0]?.id;
  const due=dueSet(state),total=(data.activities||[]).length,done=(data.activities||[]).filter(activity=>completed.has(activity.id)).length,pct=Math.round(done/Math.max(total,1)*100);
  const volumes=courses.map((course,index)=>{
    const stats=courseProgress(data,state,course),dueCount=stats.ids.filter(id=>due.has(id)).length,current=course.id===activeCourseId;
    const height=Math.min(96,68+stats.units.length*3+index*2);
    const status=dueCount?`${dueCount} review${dueCount===1?'':'s'} due`:stats.complete?'Complete':stats.started?`${stats.pct}% complete`:'Not started';
    return `<a class="course-volume" data-current="${current?'true':'false'}" href="/course?course=${encodeURIComponent(course.id)}" style="--volume-height:${height}%" aria-label="Course ${esc(course.sequence||index+1)}: ${esc(course.shortTitle||course.title)}, ${status}"><span class="course-volume__seq">Course ${esc(course.sequence||index+1)}</span><strong class="course-volume__title">${esc(course.shortTitle||course.title)}</strong><span class="course-volume__status"><strong>${status}</strong>${stats.units.length} units</span></a>`;
  }).join('');
  const current=courses.find(course=>course.id===activeCourseId)||courses[0];
  const currentStats=current?courseProgress(data,state,current):null;
  return `<section class="course-volume-landing"><header class="course-volume-heading"><p class="eyebrow">Guided learning · six-course collection</p><h1>Course</h1><p class="lede">Open the curriculum as a set of six volumes. Each course has its own purpose, ordered units, scored activities, and mastery work; completed material remains available for review.</p></header><div class="course-volume-shelf" aria-label="Six Canonical Shelf courses">${volumes}</div><section class="course-volume-summary"><div><p class="eyebrow">${currentStats?.started?'Continue':'Suggested starting point'}</p><h2>${esc(current?.title||'Foundations')}</h2><p>${esc(current?.scope||'Begin with the orientation and foundational reading skills.')}</p></div><div><strong>${pct}%</strong><p>${done}/${total} scored activities</p>${current?`<a class="button button--primary" href="/course?course=${encodeURIComponent(current.id)}">Open volume →</a>`:''}</div></section></section>`;
}

document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-course-choice]');if(!button)return;
  const chooser=button.closest('.course-catalog-chooser'),choices=chooser?.querySelector('[data-course-choices]'),preview=chooser?.querySelector('[data-course-preview]'),template=chooser?.querySelector(`template[data-course-preview-template="${CSS.escape(button.dataset.courseChoice||'')}"]`);
  if(!choices||!preview||!template)return;
  choices.querySelectorAll('[data-course-choice]').forEach(item=>item.setAttribute('aria-selected',String(item===button)));
  preview.replaceChildren(template.content.cloneNode(true));
});

export function courseLandingView({data,state,esc}){
  if(!(data.courses||[]).length)return chooserView({data,esc});
  return volumeLandingView({data,state,esc});
}

export function courseDetailView({data,state,course,esc}){
  const allCourses=data.courses||[],courseIndex=allCourses.findIndex(item=>item.id===course.id),stats=courseProgress(data,state,course),units=stats.units,due=dueSet(state),dueCount=stats.ids.filter(id=>due.has(id)).length;
  let currentIndex=units.findIndex(unit=>!unitStats(data,state,unit).complete);if(currentIndex<0)currentIndex=Math.max(0,units.length-1);
  const sequence=[['Current',units[currentIndex]],['Next',units[currentIndex+1]],['Later',units[currentIndex+2]]].filter(([,unit])=>unit);
  const firstNext=(data.activities||[]).find(a=>a.courseId===course.id&&!state.completed?.includes(a.id));
  const unitCards=units.map(unit=>{const unitState=unitStats(data,state,unit);return `<article class="journey-unit-card" data-unit-state="${unitState.status}"><header><span>Unit ${String(unit.sequence).padStart(2,'0')}</span><span class="unit-state ${unitState.reviewDue?'state-due':''}">${statusLabel(unitState)}</span></header><h2><a href="/course?unit=${encodeURIComponent(unit.id)}">${esc(unit.title)}</a></h2><p>${esc(unit.scope)}</p><div class="progress"><span style="width:${unitState.pct}%"></span></div><div class="journey-unit-card__stats"><span>${unitState.done}/${unitState.total} activities</span><span>${unitState.masteryDone}/${unitState.masteryTotal} mastery</span></div><footer><a href="${unitState.next?activityHref(unitState.next):`/course?unit=${encodeURIComponent(unit.id)}`}">${unitState.status==='complete'?'Review unit':unitState.status==='in-progress'?'Continue':'Start unit'} →</a></footer></article>`}).join('');
  return `<section class="course-catalog-detail"><aside class="course-detail-hero"><div class="course-current-label">Current volume</div><div class="course-detail-hero__grid"><div><p class="eyebrow">Course ${course.sequence} · ${esc(course.level==='advanced'?'Deeper study':'Biblical Literacy Core')}</p><h1>${esc(course.title)}</h1><p class="lede">${esc(course.scope)}</p><p>${esc(course.outcome||'')}</p><div class="hero-actions"><a class="button button--primary" href="${firstNext?activityHref(firstNext):`/course?course=${encodeURIComponent(course.id)}`}">${firstNext?'Continue course':'Review course'}</a><a class="button" href="/course?course=${encodeURIComponent(course.id)}&glossary=1">Course glossary</a></div></div></div><div class="course-current-sequence">${sequence.map(([label,unit])=>`<div><small>${label}</small><strong>${esc(unit.title)}</strong></div>`).join('')}</div><div class="course-total-state"><strong>${stats.pct}%</strong><span>${stats.done}/${stats.total} activities</span><small>${dueCount?`${dueCount} review${dueCount===1?'':'s'} due`:'Retention up to date'}</small></div><nav class="course-volume-nav" aria-label="Course navigation"><a ${courseIndex<=0?'aria-disabled="true" tabindex="-1"':''} href="${courseIndex>0?`/course?course=${encodeURIComponent(allCourses[courseIndex-1].id)}`:'#'}">Prev</a><a ${courseIndex>=allCourses.length-1?'aria-disabled="true" tabindex="-1"':''} href="${courseIndex<allCourses.length-1?`/course?course=${encodeURIComponent(allCourses[courseIndex+1].id)}`:'#'}">Next</a></nav></aside><section class="course-catalog-contents"><header class="course-catalog-contents__head"><p class="eyebrow">Course ${esc(course.sequence||'')} contents</p><h2>${esc(course.shortTitle||course.title)}</h2><p>${units.length} units · open any available activity</p></header><div class="unit-card-grid">${unitCards}</div></section></section>`;
}

export function unitExperienceView({data,state,unit,course,esc}){
  const ids=data.byUnit?.[unit.id]||[],activities=ids.map(id=>(data.activities||[]).find(a=>a.id===id)).filter(Boolean),stats=unitStats(data,state,unit),due=dueSet(state),nextIndex=activities.findIndex(x=>!state.completed?.includes(x.id));
  return `<header class="unit-experience-hero"><p><a href="/course?course=${encodeURIComponent(unit.courseId)}">← ${esc(course?.shortTitle||course?.title||'Course')}</a></p><div class="unit-experience-hero__grid"><div><p class="eyebrow">Course ${course?.sequence||'—'} · Unit ${unit.sequence}</p><h1>${esc(unit.title)}</h1><p class="lede">${esc(unit.scope)}</p><p class="unit-access-note">Recommended sequence, open navigation: start or revisit any activity whenever it is useful.</p></div><aside><strong>${stats.pct}%</strong><span>${stats.done}/${stats.total} activities</span>${stats.reviewDue?`<small>${stats.reviewDue} review${stats.reviewDue===1?'':'s'} due</small>`:''}</aside></div></header><ol class="activity-journey unit-list">${activities.map((a,index)=>{const done=state.completed?.includes(a.id),review=due.has(a.id),mastered=a.type==='mastery'&&state.mastery?.[a.id]?.passed===true,label=a.type==='lesson'?'Guided lesson':a.masteryType==='course-capstone'?'Course capstone':a.masteryType==='unit-mastery'?'Unit mastery':'Integrated mastery',status=review?'Review due':mastered?'Mastered':done?'Complete · refresher available':index===nextIndex?'Recommended next':'Available · start anytime';return `<li class="activity-step unit" data-complete="${done?'true':'false'}" data-mastered="${mastered?'true':'false'}" data-review-due="${review?'true':'false'}"><span class="activity-step__num unit-num">${String(index+1).padStart(2,'0')}</span><div><p class="eyebrow">${label}</p><h3><a data-activity-link="${esc(a.id)}" href="${activityHref(a)}">${esc(a.title)}</a></h3><p class="activity-state">${status}</p></div><span class="activity-step__mark" aria-label="${status}">${review?'↻':mastered?'★':done?'✓':'○'}</span></li>`}).join('')}</ol>`;
}
