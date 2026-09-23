import {recentActivity} from './experience.js';
import {practiceStateSummary} from './practice-state.js';
import {getBibleState} from './bible-state.js';
import {LIBRARY_BOOKS} from './library-data.js';

const completedSet=state=>new Set(state?.completed||[]);
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

function shelfMarkup(books,esc,{bookend=false}={}){
  const spines=books.map(book=>`<a class="library-first-book" data-cat="${esc(book.cat)}" href="/bible?book=${book.n}&chapter=1" style="--chapters:${Number(book.ch)||1}" aria-label="${esc(book.name)}, ${book.ch} chapters" title="${esc(book.name)}"><span>${esc(book.name)}</span></a>`).join('');
  return `${spines}${bookend?'<span class="library-first-bookend-space" aria-hidden="true"></span><span class="library-first-bookend" aria-hidden="true"></span>':''}`;
}

export function homeView({data,state,esc}){
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
  const ot=LIBRARY_BOOKS.filter(book=>book.n<=39),nt=LIBRARY_BOOKS.filter(book=>book.n>=40);

  return `<div class="library-first-home">
    <section class="library-first-hero">
      <header class="library-first-homehead">
        <div class="library-first-copy">
          <div><span class="home-kicker">66 books · full Bible reader · guided learning</span><h1>The Canonical <em>Shelf</em></h1></div>
          <p class="lede">Learn the Bible as a connected library: read in context, follow the story, ask hard questions, and build durable understanding without collapsing evidence, interpretation, and doctrine into one thing.</p>
        </div>
        <nav class="library-first-actions" aria-label="Home destinations">
          <a href="/course">Course</a><a href="/bible">Bible</a><a href="/topics">Topics</a><a href="/practice">Practice</a>${next?`<a class="is-primary" href="${activityHref(next)}">Continue</a>`:''}
        </nav>
      </header>
      <div class="library-first-shelf-wrap" aria-label="Canonical bookshelf">
        <div class="library-first-shelf-row"><div class="library-first-shelf-label">Old Testament</div><div class="library-first-shelf">${shelfMarkup(ot,esc)}</div></div>
        <div class="library-first-shelf-row"><div class="library-first-shelf-label">New Testament</div><div class="library-first-shelf">${shelfMarkup(nt,esc,{bookend:true})}</div></div>
        <p class="library-first-shelf-note">Book height and width follow relative length; color follows canonical category.</p>
      </div>
    </section>

    ${hasHistory?`<section class="library-first-cards" aria-label="Continue where you left off">
      <article class="library-first-card">
        <p class="eyebrow">Continue learning</p>
        <h2>${esc(next?.title||'Review your learning')}</h2>
        <p>${esc(nextUnit?.scope||'Return to your current course or review material already completed.')}</p>
        <div class="library-first-progress"><span><strong>${progress.pct}%</strong><br>${progress.done}/${progress.total} activities</span><span><strong>${progress.due}</strong><br>review${progress.due===1?'':'s'} due</span>${nextCourse?`<span><strong>Course ${esc(nextCourse.sequence)}</strong><br>${esc(nextCourse.shortTitle||nextCourse.title)}</span>`:''}</div>
      </article>
      <article class="library-first-card">
        <p class="eyebrow">Current context</p>
        <h2><a href="${contextHref}">${esc(contextTitle)}</a></h2>
        <p>${esc(contextCopy).slice(0,260)}</p>
      </article>
    </section>`:''}

    <nav class="library-entry-map" aria-label="Explore Canonical Shelf">
      <a href="/bible"><small>Bible</small><strong>Browse books</strong><span>Shelf, profiles, chapters, context.</span></a>
      <a href="/topics"><small>Topics</small><strong>Ask a question</strong><span>Curated evidence and interpretation.</span></a>
      <a href="/course"><small>Course</small><strong>Learn in sequence</strong><span>Six courses with scored activities.</span></a>
      <a href="/practice"><small>Practice</small><strong>Retain what matters</strong><span>Due review before optional practice.</span></a>
    </nav>

    ${recent.length?`<section class="library-first-recent"><p class="eyebrow">Recent study</p><div class="library-first-recent__items">${recent.map(item=>`<a href="${esc(item.href)}">${esc(item.title)}</a>`).join('')}</div></section>`:''}
  </div>`;
}

export function progressPanelView({data,state,esc}){
  const s=progressSummary(data,state),practice=practiceStateSummary(),recent=recentActivity().slice(0,6);
  return `<div class="progress-panel__summary"><div class="progress-ring progress-ring--small" style="--progress:${s.pct}"><span><strong>${s.pct}%</strong><small>${s.done}/${s.total}</small></span></div><div><p class="eyebrow">Learning progress</p><h3>${s.due?`${s.due} review${s.due===1?'':'s'} due`:'No reviews due'}</h3><p>Completion, mastery, and review state remain local-first and can be backed up or synced separately.</p></div></div><div class="progress-panel__courses">${s.courses.map(c=>`<a href="/course?course=${encodeURIComponent(c.id)}"><span>Course ${c.sequence}</span><strong>${esc(c.shortTitle||c.title)}</strong><small>${c.pct}% · ${c.done}/${c.total}</small></a>`).join('')}</div><section><h3>Practice</h3><p><strong>${esc(practice.rank.name)}</strong> · ${practice.state.xp.toLocaleString()} XP · ${practice.stars}/${practice.maxStars} stars · ${practice.achievements}/${practice.totalAchievements} achievements</p><p><a href="/practice?mode=campaign">Continue Practice Campaign →</a></p></section><section><h3>Recent activity</h3>${recent.length?`<ul>${recent.map(x=>`<li><a href="${esc(x.href)}">${esc(x.title)}</a></li>`).join('')}</ul>`:'<p>No recent activity yet.</p>'}</section><section><h3>Backup</h3><p><button class="button" id="export">Export progress</button> <button class="button" id="import">Import progress</button></p></section>`;
}
