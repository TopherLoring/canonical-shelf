import {recentActivity} from './experience.js';
import {practiceStateSummary} from './practice-state.js';
import {getBibleState} from './bible-state.js';
import {LIBRARY_BOOKS} from './library-data.js';

const completedSet=state=>new Set(state?.completed||[]);
const activityHref=a=>a?.type==='lesson'?`/course?unit=${encodeURIComponent(a.unitId)}&lesson=${encodeURIComponent(a.sourceId)}`:a?`/course?unit=${encodeURIComponent(a.unitId)}&mastery=${encodeURIComponent(a.sourceId)}`:'/course';
const cloneTemplate=id=>{const template=document.getElementById(id);if(!(template instanceof HTMLTemplateElement))throw new Error(`Missing required template #${id}`);return template.content.cloneNode(true)};
const setText=(root,selector,value)=>{const node=root.querySelector(selector);if(node)node.textContent=String(value??'');return node};
const setHref=(root,selector,value)=>{const node=root.querySelector(selector);if(node)node.setAttribute('href',value);return node};

export function progressSummary(data,state){
  const completed=completedSet(state),activities=data.activities||[];
  const total=activities.length,done=activities.filter(a=>completed.has(a.id)).length;
  const due=Object.entries(state?.reviewSchedule||{}).filter(([,v])=>Date.parse(v?.dueAt)<=Date.now()).length;
  const courses=(data.courses||[]).map(course=>{
    const unitIds=data.byCourse?.[course.id]||[];
    const ids=unitIds.flatMap(unitId=>data.byUnit?.[unitId]||[]);
    const cdone=ids.filter(id=>completed.has(id)).length;
    return {...course,done:cdone,total:ids.length,pct:Math.round(cdone/Math.max(ids.length,1)*100)};
  });
  const next=activities.find(a=>!completed.has(a.id))||null;
  return {done,total,pct:Math.round(done/Math.max(total,1)*100),due,courses,next};
}

function populateShelf(target,books){
  books.forEach(book=>{const item=cloneTemplate('tpl-home-book'),link=item.querySelector('.library-first-book');if(link){link.dataset.cat=book.cat;link.setAttribute('href',`/bible?book=${book.n}&chapter=1`);link.style.setProperty('--chapters',String(Number(book.ch)||1));link.setAttribute('aria-label',`${book.name}, ${book.ch} chapters`);link.setAttribute('title',book.name)}setText(item,'.tpl-home-book-name',book.name);target?.append(item)});
}

export function homeView({data,state}){
  const progress=progressSummary(data,state),next=progress.next;
  const nextUnit=next&&(data.units||[]).find(unit=>unit.id===next.unitId);
  const nextCourse=next&&(data.courses||[]).find(course=>course.id===next.courseId);
  const bibleState=getBibleState(),currentBook=bibleState.lastBook?LIBRARY_BOOKS[Number(bibleState.lastBook)-1]||null:null;
  const topics=data.topics||[],featured=topics.length?topics[new Date().getDate()%topics.length]:null;
  const recent=recentActivity().slice(0,5);
  const hasHistory=progress.done>0||recent.length>0||Boolean(bibleState.updatedAt);
  const contextTitle=currentBook?`${currentBook.name} ${Number(bibleState.lastChapter||1)}`:featured?.title||'Open a reference question';
  const contextCopy=currentBook?(currentBook.hook||currentBook.syn||'Return to your most recent Bible reading.'):(featured?.answer||featured?.summary||'Topics connect biblical text, context, interpretation, and related course material.');
  const contextHref=currentBook?`/bible?book=${currentBook.n}&chapter=${Number(bibleState.lastChapter||1)}`:featured?`/topics?topic=${encodeURIComponent(featured.id)}`:'/topics';
  const root=cloneTemplate('tpl-home');
  const continueLink=setHref(root,'.tpl-home-continue',next?activityHref(next):'#');if(continueLink)continueLink.hidden=!next;
  populateShelf(root.querySelector('.tpl-home-shelf-ot'),LIBRARY_BOOKS.filter(book=>book.n<=39));
  populateShelf(root.querySelector('.tpl-home-shelf-nt'),LIBRARY_BOOKS.filter(book=>book.n>=40));
  const history=root.querySelector('.tpl-home-history');if(history)history.hidden=!hasHistory;
  setText(root,'.tpl-home-next-title',next?.title||'Review your learning');setText(root,'.tpl-home-next-copy',nextUnit?.scope||'Return to your current course or review material already completed.');setText(root,'.tpl-home-progress-pct',`${progress.pct}%`);setText(root,'.tpl-home-progress-count',`${progress.done}/${progress.total} activities`);setText(root,'.tpl-home-review-count',String(progress.due));setText(root,'.tpl-home-review-label',`review${progress.due===1?'':'s'} due`);
  const courseContext=root.querySelector('.tpl-home-course-context');if(courseContext)courseContext.hidden=!nextCourse;if(nextCourse){setText(root,'.tpl-home-course-seq',`Course ${nextCourse.sequence}`);setText(root,'.tpl-home-course-title',nextCourse.shortTitle||nextCourse.title)}
  const contextLink=setHref(root,'.tpl-home-context-title',contextHref);if(contextLink)contextLink.textContent=contextTitle;setText(root,'.tpl-home-context-copy',String(contextCopy).slice(0,260));setText(root,'.tpl-home-course-count',`${data.courses?.length||6} courses with scored activities.`);
  const recentSection=root.querySelector('.tpl-home-recent'),recentItems=root.querySelector('.tpl-home-recent-items');if(recentSection)recentSection.hidden=!recent.length;recent.forEach(item=>{const row=cloneTemplate('tpl-home-recent-item'),link=setHref(row,'.tpl-home-recent-link',item.href);if(link)link.textContent=item.title;recentItems?.append(row)});
  return root;
}

export function progressPanelView({data,state}){
  const s=progressSummary(data,state),practice=practiceStateSummary(),recent=recentActivity().slice(0,6),root=cloneTemplate('tpl-progress-panel');
  const ring=root.querySelector('.tpl-progress-ring');if(ring)ring.style.setProperty('--progress',String(s.pct));setText(root,'.tpl-progress-pct',`${s.pct}%`);setText(root,'.tpl-progress-count',`${s.done}/${s.total}`);setText(root,'.tpl-progress-due',s.due?`${s.due} review${s.due===1?'':'s'} due`:'No reviews due');
  const courses=root.querySelector('.tpl-progress-courses');s.courses.forEach(course=>{const item=cloneTemplate('tpl-progress-course-link'),link=setHref(item,'.tpl-progress-course',`/course?course=${encodeURIComponent(course.id)}`);setText(item,'.tpl-progress-course-seq',`Course ${course.sequence}`);setText(item,'.tpl-progress-course-title',course.shortTitle||course.title);setText(item,'.tpl-progress-course-meta',`${course.pct}% · ${course.done}/${course.total}`);courses?.append(item)});
  setText(root,'.tpl-practice-rank',practice.rank.name);setText(root,'.tpl-practice-xp',practice.state.xp.toLocaleString());setText(root,'.tpl-practice-stars',`${practice.stars}/${practice.maxStars}`);setText(root,'.tpl-practice-achievements',`${practice.achievements}/${practice.totalAchievements}`);
  const recentList=root.querySelector('.tpl-progress-recent-list'),recentEmpty=root.querySelector('.tpl-progress-recent-empty');if(recentList)recentList.hidden=!recent.length;if(recentEmpty)recentEmpty.hidden=Boolean(recent.length);recent.forEach(item=>{const row=cloneTemplate('tpl-progress-recent-item'),link=setHref(row,'.tpl-progress-recent-link',item.href);if(link)link.textContent=item.title;recentList?.append(row)});
  return root;
}
