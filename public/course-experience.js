const ORIENTATION_UNIT_ID='unit.orientation';
const ORIENTATION_LESSON_ID='orientation';

const progressFor=(ids,state)=>{const completed=new Set(state?.completed||[]),done=(ids||[]).filter(id=>completed.has(id)).length;return{done,total:(ids||[]).length,pct:(ids||[]).length?Math.round(done/(ids||[]).length*100):0}};
const dueSet=state=>new Set(Object.entries(state?.reviewSchedule||{}).filter(([,v])=>Date.parse(v?.dueAt)<=Date.now()).map(([id])=>id));
const activityHref=a=>a?.type==='lesson'?`/course?unit=${encodeURIComponent(a.unitId)}&lesson=${encodeURIComponent(a.sourceId)}`:a?`/course?unit=${encodeURIComponent(a.unitId)}&mastery=${encodeURIComponent(a.sourceId)}`:'/course';

const cloneTemplate=id=>{
  const template=document.getElementById(id);
  if(!(template instanceof HTMLTemplateElement))throw new Error(`Missing required template #${id}`);
  return template.content.cloneNode(true);
};
const setText=(root,selector,value)=>{const node=root.querySelector(selector);if(node)node.textContent=String(value??'');return node};
const setHref=(root,selector,value)=>{const node=root.querySelector(selector);if(node)node.setAttribute('href',value);return node};

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

function populatePreview(data,course){
  const root=cloneTemplate('tpl-course-chooser-preview'),units=courseUnits(data,course);
  setText(root,'.tpl-course-prev-seq',`Course ${course.sequence||''}`);
  setText(root,'.tpl-course-prev-title',course.title);
  setText(root,'.tpl-course-prev-scope',course.scope||'');
  setText(root,'.tpl-course-prev-outcome',course.outcome||course.scope||'');
  const list=root.querySelector('.tpl-course-prev-units');
  units.forEach((unit,index)=>{const row=document.createElement('div');row.className='course-preview__unit';const number=document.createElement('b');number.textContent=String(index+1).padStart(2,'0');row.append(number,document.createTextNode(unit.title));list?.append(row)});
  setText(root,'.tpl-course-prev-count',`${units.length} units`);
  setHref(root,'.tpl-course-prev-orientation',`/course?unit=${encodeURIComponent(ORIENTATION_UNIT_ID)}&lesson=${encodeURIComponent(ORIENTATION_LESSON_ID)}`);
  setHref(root,'.tpl-course-prev-open',`/course?course=${encodeURIComponent(course.id)}`);
  return root;
}

function chooserView({data}){
  const courses=data.courses||[],root=cloneTemplate('tpl-course-chooser'),choices=root.querySelector('[data-course-choices]'),preview=root.querySelector('[data-course-preview]');
  setText(root,'.tpl-course-chooser-lede',`Browse the ${courses.length}-course collection, inspect what each course establishes, and open the volume you want to study.`);
  setText(root,'.tpl-course-chooser-count',`${courses.length} courses · select one to inspect`);
  courses.forEach((course,index)=>{
    const button=document.createElement('button');button.className='course-choice';button.type='button';button.dataset.courseChoice=course.id;button.setAttribute('aria-selected',String(index===0));
    const roman=document.createElement('span');roman.className='course-choice__roman';roman.textContent=String(course.sequence||index+1);
    const copy=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=course.shortTitle||course.title;small.textContent=course.scope||'';copy.append(strong,small);
    const arrow=document.createElement('span');arrow.className='course-choice__arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='›';button.append(roman,copy,arrow);choices?.append(button);
  });
  if(courses[0])preview?.replaceChildren(populatePreview(data,courses[0]));
  choices?.addEventListener('click',event=>{const button=event.target.closest?.('[data-course-choice]');if(!button)return;const course=courses.find(item=>item.id===button.dataset.courseChoice);if(!course)return;choices.querySelectorAll('[data-course-choice]').forEach(item=>item.setAttribute('aria-selected',String(item===button)));preview?.replaceChildren(populatePreview(data,course))});
  return root;
}

function volumeLandingView({data,state}){
  const courses=data.courses||[],completed=new Set(state?.completed||[]),firstIncomplete=(data.activities||[]).find(activity=>!completed.has(activity.id));
  const activeCourseId=firstIncomplete?.courseId||courses.find(course=>courseProgress(data,state,course).started&&!courseProgress(data,state,course).complete)?.id||courses[0]?.id;
  const due=dueSet(state),total=(data.activities||[]).length,done=(data.activities||[]).filter(activity=>completed.has(activity.id)).length,pct=Math.round(done/Math.max(total,1)*100),root=cloneTemplate('tpl-course-landing'),shelf=root.querySelector('.tpl-course-landing-shelf');
  setText(root,'.tpl-course-landing-eyebrow',`Guided learning · ${courses.length}-course collection`);
  setText(root,'.tpl-course-landing-lede',`Open the curriculum as a set of ${courses.length} volumes. Each course has its own purpose, ordered units, scored activities, and mastery work; completed material remains available for review.`);
  root.querySelector('.course-volume-shelf')?.setAttribute('aria-label',`${courses.length} Canonical Shelf courses`);
  courses.forEach((course,index)=>{
    const stats=courseProgress(data,state,course),dueCount=stats.ids.filter(id=>due.has(id)).length,current=course.id===activeCourseId,height=Math.min(96,68+stats.units.length*3+index*2),status=dueCount?`${dueCount} review${dueCount===1?'':'s'} due`:stats.complete?'Complete':stats.started?`${stats.pct}% complete`:'Not started',item=cloneTemplate('tpl-course-volume-link'),link=item.querySelector('.course-volume');
    if(link){link.dataset.current=String(current);link.setAttribute('href',`/course?course=${encodeURIComponent(course.id)}`);link.style.setProperty('--volume-height',`${height}%`);link.setAttribute('aria-label',`Course ${course.sequence||index+1}: ${course.shortTitle||course.title}, ${status}`)}
    setText(item,'.tpl-course-volume-seq',`Course ${course.sequence||index+1}`);setText(item,'.tpl-course-volume-title',course.shortTitle||course.title);setText(item,'.tpl-course-volume-status',status);setText(item,'.tpl-course-volume-units',`${stats.units.length} units`);shelf?.append(item);
  });
  const current=courses.find(course=>course.id===activeCourseId)||courses[0],currentStats=current?courseProgress(data,state,current):null;
  setText(root,'.tpl-course-summary-label',currentStats?.started?'Continue':'Suggested starting point');setText(root,'.tpl-course-summary-title',current?.title||'Foundations');setText(root,'.tpl-course-summary-scope',current?.scope||'Begin with the orientation and foundational reading skills.');setText(root,'.tpl-course-summary-pct',`${pct}%`);setText(root,'.tpl-course-summary-count',`${done}/${total} scored activities`);
  const open=setHref(root,'.tpl-course-summary-open',current?`/course?course=${encodeURIComponent(current.id)}`:'#');if(open)open.hidden=!current;
  return root;
}

export function courseLandingView({data,state}){return !(data.courses||[]).length?chooserView({data}):volumeLandingView({data,state})}

export function courseDetailView({data,state,course}){
  const allCourses=data.courses||[],courseIndex=allCourses.findIndex(item=>item.id===course.id),stats=courseProgress(data,state,course),units=stats.units,due=dueSet(state),dueCount=stats.ids.filter(id=>due.has(id)).length,root=cloneTemplate('tpl-course-detail');
  let currentIndex=units.findIndex(unit=>!unitStats(data,state,unit).complete);if(currentIndex<0)currentIndex=Math.max(0,units.length-1);
  const sequence=[['Current',units[currentIndex]],['Next',units[currentIndex+1]],['Later',units[currentIndex+2]]].filter(([,unit])=>unit),firstNext=(data.activities||[]).find(a=>a.courseId===course.id&&!state.completed?.includes(a.id));
  setText(root,'.tpl-course-detail-eyebrow',`Course ${course.sequence} · ${course.level==='advanced'?'Deeper study':'Biblical Literacy Core'}`);setText(root,'.tpl-course-detail-title',course.title);setText(root,'.tpl-course-detail-scope',course.scope);setText(root,'.tpl-course-detail-outcome',course.outcome||'');
  setHref(root,'.tpl-course-detail-primary',firstNext?activityHref(firstNext):`/course?course=${encodeURIComponent(course.id)}`);setText(root,'.tpl-course-detail-primary',firstNext?'Continue course':'Review course');setHref(root,'.tpl-course-detail-glossary',`/course?course=${encodeURIComponent(course.id)}&glossary=1`);
  const sequenceRoot=root.querySelector('.tpl-course-detail-sequence');sequence.forEach(([label,unit])=>{const row=document.createElement('div'),small=document.createElement('small'),strong=document.createElement('strong');small.textContent=label;strong.textContent=unit.title;row.append(small,strong);sequenceRoot?.append(row)});
  setText(root,'.tpl-course-detail-pct',`${stats.pct}%`);setText(root,'.tpl-course-detail-count',`${stats.done}/${stats.total} activities`);setText(root,'.tpl-course-detail-review',dueCount?`${dueCount} review${dueCount===1?'':'s'} due`:'Retention up to date');
  const prev=root.querySelector('.tpl-course-prev'),next=root.querySelector('.tpl-course-next');
  if(prev){if(courseIndex<=0){prev.setAttribute('aria-disabled','true');prev.setAttribute('tabindex','-1');prev.setAttribute('href','#')}else prev.setAttribute('href',`/course?course=${encodeURIComponent(allCourses[courseIndex-1].id)}`)}
  if(next){if(courseIndex>=allCourses.length-1){next.setAttribute('aria-disabled','true');next.setAttribute('tabindex','-1');next.setAttribute('href','#')}else next.setAttribute('href',`/course?course=${encodeURIComponent(allCourses[courseIndex+1].id)}`)}
  setText(root,'.tpl-course-contents-eyebrow',`Course ${course.sequence||''} contents`);setText(root,'.tpl-course-contents-title',course.shortTitle||course.title);setText(root,'.tpl-course-contents-count',`${units.length} units · open any available activity`);
  const cards=root.querySelector('.tpl-course-detail-units');units.forEach(unit=>{const unitState=unitStats(data,state,unit),item=cloneTemplate('tpl-course-unit-card'),card=item.querySelector('.journey-unit-card');if(card)card.dataset.unitState=unitState.status;setText(item,'.tpl-unit-card-seq',`Unit ${String(unit.sequence).padStart(2,'0')}`);const stateNode=setText(item,'.tpl-unit-card-state',statusLabel(unitState));stateNode?.classList.toggle('state-due',Boolean(unitState.reviewDue));setText(item,'.tpl-unit-card-title',unit.title);setHref(item,'.tpl-unit-card-title',`/course?unit=${encodeURIComponent(unit.id)}`);setText(item,'.tpl-unit-card-scope',unit.scope);const bar=item.querySelector('.tpl-unit-card-progress');if(bar)bar.style.width=`${unitState.pct}%`;setText(item,'.tpl-unit-card-activities',`${unitState.done}/${unitState.total} activities`);setText(item,'.tpl-unit-card-mastery',`${unitState.masteryDone}/${unitState.masteryTotal} mastery`);setHref(item,'.tpl-unit-card-open',unitState.next?activityHref(unitState.next):`/course?unit=${encodeURIComponent(unit.id)}`);setText(item,'.tpl-unit-card-open',`${unitState.status==='complete'?'Review unit':unitState.status==='in-progress'?'Continue':'Start unit'} →`);cards?.append(item)});
  return root;
}

export function unitExperienceView({data,state,unit,course}){
  const ids=data.byUnit?.[unit.id]||[],activities=ids.map(id=>(data.activities||[]).find(a=>a.id===id)).filter(Boolean),stats=unitStats(data,state,unit),due=dueSet(state),nextIndex=activities.findIndex(x=>!state.completed?.includes(x.id)),root=cloneTemplate('tpl-unit-experience');
  setHref(root,'.tpl-unit-back',`/course?course=${encodeURIComponent(unit.courseId)}`);setText(root,'.tpl-unit-back',`← ${course?.shortTitle||course?.title||'Course'}`);setText(root,'.tpl-unit-eyebrow',`Course ${course?.sequence||'—'} · Unit ${unit.sequence}`);setText(root,'.tpl-unit-title',unit.title);setText(root,'.tpl-unit-scope',unit.scope);setText(root,'.tpl-unit-pct',`${stats.pct}%`);setText(root,'.tpl-unit-count',`${stats.done}/${stats.total} activities`);const dueNode=setText(root,'.tpl-unit-review',`${stats.reviewDue} review${stats.reviewDue===1?'':'s'} due`);if(dueNode)dueNode.hidden=!stats.reviewDue;
  const list=root.querySelector('.tpl-unit-exp-activities');activities.forEach((a,index)=>{const done=state.completed?.includes(a.id),review=due.has(a.id),mastered=a.type==='mastery'&&state.mastery?.[a.id]?.passed===true,label=a.type==='lesson'?'Guided lesson':a.masteryType==='course-capstone'?'Course capstone':a.masteryType==='unit-mastery'?'Unit mastery':'Integrated mastery',status=review?'Review due':mastered?'Mastered':done?'Complete · refresher available':index===nextIndex?'Recommended next':'Available · start anytime',item=cloneTemplate('tpl-unit-activity-step'),step=item.querySelector('.activity-step');if(step){step.dataset.complete=String(Boolean(done));step.dataset.mastered=String(Boolean(mastered));step.dataset.reviewDue=String(Boolean(review))}setText(item,'.tpl-activity-num',String(index+1).padStart(2,'0'));setText(item,'.tpl-activity-label',label);const link=setHref(item,'.tpl-activity-link',activityHref(a));if(link){link.dataset.activityLink=a.id;link.textContent=a.title}setText(item,'.tpl-activity-state',status);const mark=setText(item,'.tpl-activity-mark',review?'↻':mastered?'★':done?'✓':'○');mark?.setAttribute('aria-label',status);list?.append(item)});
  return root;
}
