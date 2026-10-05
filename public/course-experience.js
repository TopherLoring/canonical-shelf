// Shared learner progress calculations; screen rendering lives in ui/screens/learning-path.js.
export { unitStats, courseProgress };
const progressFor=(ids,state)=>{const completed=new Set(state?.completed||[]),done=(ids||[]).filter(id=>completed.has(id)).length;return{done,total:(ids||[]).length,pct:(ids||[]).length?Math.round(done/(ids||[]).length*100):0}};
const dueSet=state=>new Set(Object.entries(state?.reviewSchedule||{}).filter(([,v])=>Date.parse(v?.dueAt)<=Date.now()).map(([id])=>id));
function unitStats(data,state,unit){
  const ids=data.byUnit?.[unit.id]||[],progress=progressFor(ids,state),due=dueSet(state),activities=ids.map(id=>(data.activities||[]).find(a=>a.id===id)).filter(Boolean);
  const reviewDue=ids.filter(id=>due.has(id)).length;
  const mastery=activities.filter(a=>a.type==='mastery');
  const masteryDone=mastery.filter(a=>state.completed?.includes(a.id)).length;
  const next=activities.find(a=>!state.completed?.includes(a.id))||activities.find(a=>due.has(a.id))||null;
  const status=progress.done===progress.total&&progress.total?'complete':progress.done?'in-progress':'not-started';
  return {...progress,reviewDue,masteryTotal:mastery.length,masteryDone,next,status};
}
function courseUnits(data,course){return (data.byCourse?.[course.id]||[]).map(id=>(data.units||[]).find(unit=>unit.id===id)).filter(Boolean)}
function courseIds(data,course){return courseUnits(data,course).flatMap(unit=>data.byUnit?.[unit.id]||[])}
function courseProgress(data,state,course){const units=courseUnits(data,course),ids=courseIds(data,course),completed=new Set(state?.completed||[]),done=ids.filter(id=>completed.has(id)).length;return{units,ids,done,total:ids.length,pct:Math.round(done/Math.max(ids.length,1)*100),complete:ids.length>0&&done===ids.length,started:done>0}}

