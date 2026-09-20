import {recentActivity} from './experience.js';

const completedSet=state=>new Set(state?.completed||[]);
const topicText=t=>t?.answer||t?.summary||'';
const activityHref=a=>a?.type==='lesson'?`/course?unit=${encodeURIComponent(a.unitId)}&lesson=${encodeURIComponent(a.sourceId)}`:a?`/course?unit=${encodeURIComponent(a.unitId)}&mastery=${encodeURIComponent(a.sourceId)}`:'/course';

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

export function homeView({data,state,esc}){
  const s=progressSummary(data,state),next=s.next,nextUnit=next&&data.units?.find(u=>u.id===next.unitId),nextCourse=next&&data.courses?.find(c=>c.id===next.courseId);
  const topics=data.topics||[],featured=topics.length?topics[new Date().getDate()%topics.length]:null;
  const recent=recentActivity().slice(0,6);
  return `<section class="experience-hero home-hero">
    <div class="experience-hero__copy"><p class="eyebrow">Canonical Shelf · Scripture in context</p><h1>Read with context.<br>Think with care.</h1><p class="lede">Know the Bible and understand what you’re reading through six connected courses, a complete reader, reference depth, active practice, and spaced retention—without turning the experience into lecture after lecture.</p><div class="hero-actions"><a class="button button--primary" href="${activityHref(next)}">${next?'Continue learning':'Open Course'}</a><a class="button" href="/bible">Explore Scripture</a></div></div>
    <aside class="home-progress" aria-label="Current progress"><div class="progress-ring" style="--progress:${s.pct}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.pct}"><span><strong>${s.pct}%</strong><small>${s.done}/${s.total}</small></span></div><div><p class="eyebrow">Current progress</p><h2>${s.due?`${s.due} review${s.due===1?'':'s'} due`:'Learning on track'}</h2><p>${nextCourse?`Course ${nextCourse.sequence} · ${esc(nextCourse.shortTitle||nextCourse.title)}`:'All current activities complete.'}</p></div></aside>
  </section>
  <section class="dashboard-grid" aria-label="Your learning dashboard">
    <article class="dashboard-card dashboard-card--wide"><p class="eyebrow">Suggested next activity</p><h2>${esc(next?.title||'Independent review')}</h2><p>${esc(nextUnit?.scope||'Return to a completed lesson, mastery activity, or a due review to strengthen retention.')}</p><a href="${activityHref(next)}">${next?'Continue where you left off':'Review the curriculum'} →</a></article>
    <article class="dashboard-card"><p class="eyebrow">Featured topic</p><h3>${esc(featured?.title||'Explore a question')}</h3><p>${esc(topicText(featured)).slice(0,190)}</p><a href="${featured?`/topics?topic=${encodeURIComponent(featured.id)}`:'/topics'}">Explore the question →</a></article>
    <article class="dashboard-card"><p class="eyebrow">Practice</p><h3>${s.due?'Review what is getting rusty':'Strengthen what you know'}</h3><p>${s.due?`${s.due} spaced review ${s.due===1?'is':'are'} ready now.`:'Use focused practice for order, context, themes, verses, and mastery.'}</p><a href="/practice">Open Practice →</a></article>
    <article class="dashboard-card"><p class="eyebrow">Bible</p><h3>Read the text itself</h3><p>Bookshelf, book profiles, chapters, search, canonical groups, and story chronology.</p><a href="/bible">Open Bible →</a></article>
  </section>
  <section class="course-strip"><div class="section-lead"><div><p class="eyebrow">Six-course path</p><h2>One connected journey.</h2></div><a href="/course">View full Course →</a></div><div class="course-progress-grid">${s.courses.map(c=>`<a class="course-progress-card" href="/course?course=${encodeURIComponent(c.id)}"><span>Course ${c.sequence}</span><strong>${esc(c.shortTitle||c.title)}</strong><div class="progress"><span style="width:${c.pct}%"></span></div><small>${c.done}/${c.total} activities · ${c.pct}%</small></a>`).join('')}</div></section>
  <section class="recent-section"><div class="section-lead"><div><p class="eyebrow">Recent activity</p><h2>Pick up without hunting for your place.</h2></div><span>Stored locally</span></div>${recent.length?`<div class="recent-grid">${recent.map(item=>`<a class="recent-item" href="${esc(item.href)}"><span>${esc(item.kind||'Study')}</span><strong>${esc(item.title)}</strong>${item.detail?`<small>${esc(item.detail)}</small>`:''}</a>`).join('')}</div>`:'<p class="notice">Lessons, Bible passages, and Topics you open will appear here.</p>'}</section>`;
}

export function progressPanelView({data,state,esc}){
  const s=progressSummary(data,state),recent=recentActivity().slice(0,6);
  return `<div class="progress-panel__summary"><div class="progress-ring progress-ring--small" style="--progress:${s.pct}"><span><strong>${s.pct}%</strong><small>${s.done}/${s.total}</small></span></div><div><p class="eyebrow">Learning progress</p><h3>${s.due?`${s.due} review${s.due===1?'':'s'} due`:'No reviews due'}</h3><p>Completion, mastery, and review state remain local-first and can be backed up or synced separately.</p></div></div><div class="progress-panel__courses">${s.courses.map(c=>`<a href="/course?course=${encodeURIComponent(c.id)}"><span>Course ${c.sequence}</span><strong>${esc(c.shortTitle||c.title)}</strong><small>${c.pct}% · ${c.done}/${c.total}</small></a>`).join('')}</div><section><h3>Recent activity</h3>${recent.length?`<ul>${recent.map(x=>`<li><a href="${esc(x.href)}">${esc(x.title)}</a></li>`).join('')}</ul>`:'<p>No recent activity yet.</p>'}</section><section><h3>Backup</h3><p><button class="button" id="export">Export progress</button> <button class="button" id="import">Import progress</button></p></section>`;
}
