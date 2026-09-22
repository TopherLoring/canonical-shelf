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

function shelfMarkup(esc){
  return LIBRARY_BOOKS.map(book=>`<a class="library-first-book" data-cat="${esc(book.cat)}" href="/bible?view=shelf&book=${book.n}&profile=1" style="--chapters:${Number(book.ch)||1}" aria-label="${esc(book.name)}, ${book.ch} chapters" title="${esc(book.name)}"><span>${esc(book.name)}</span></a>`).join('');
}

export function homeView({data,state,esc}){
  const progress=progressSummary(data,state),next=progress.next;
  const nextUnit=next&&(data.units||[]).find(unit=>unit.id===next.unitId);
  const nextCourse=next&&(data.courses||[]).find(course=>course.id===next.courseId);
  const bibleState=getBibleState(),currentBook=LIBRARY_BOOKS[Number(bibleState.lastBook||0)-1]||null;
  const topics=data.topics||[],featured=topics.length?topics[new Date().getDate()%topics.length]:null;
  const recent=recentActivity().slice(0,5);
  const contextTitle=currentBook?`Continue ${currentBook.name}`:featured?.title||'Open a reference question';
  const contextCopy=currentBook?(currentBook.hook||currentBook.syn||'Return to your most recent Bible reading.'):(featured?.answer||featured?.summary||'Topics connect biblical text, context, interpretation, and related course material.');
  const contextHref=currentBook?`/bible?book=${currentBook.n}&chapter=${Number(bibleState.lastChapter||1)}`:featured?`/topics?topic=${encodeURIComponent(featured.id)}`:'/topics';

  return `<div class="library-first-home">
    <section class="library-first-hero">
      <div class="library-first-copy">
        <p class="eyebrow">A Bible-learning library</p>
        <h1>The Canonical <em>Shelf</em></h1>
        <p class="lede">Start with the library itself. Open a book, understand where it sits, then move naturally into reading, context, course learning, and practice.</p>
        <div class="library-first-actions"><a class="button" href="/bible?view=shelf">Open the bookshelf</a><a class="button" href="${activityHref(next)}">${next?'Continue learning':'Explore the Course'}</a></div>
      </div>
      <div class="library-first-shelf-wrap">
        <div class="library-first-shelf-label"><strong>66-book library</strong><span>Color follows canonical category</span></div>
        <div class="library-first-shelf" aria-label="Canonical bookshelf">${shelfMarkup(esc)}</div>
        <p class="library-first-shelf-note">Hover or focus a spine to reveal its book name. On touch, the Bible shelf uses a first-tap name reveal before deliberate opening.</p>
      </div>
    </section>

    <nav class="library-entry-map" aria-label="Ways into Canonical Shelf">
      <a href="/bible?view=shelf"><small>Browse books</small><strong>Shelf &amp; profiles</strong><span>See all 66 books, their canonical groups, profiles, chapters, and reading context.</span></a>
      <button type="button" data-ask="What can you help me study?"><small>Ask a question</small><strong>Theologian</strong><span>Ask from the BSB, Canonical Shelf content, the Statement of Faith, and vetted research.</span></button>
      <a href="/course"><small>Learn in sequence</small><strong>6 courses</strong><span>Build foundations, revisit difficult questions with stronger tools, and retain what you learn.</span></a>
      <a href="/practice"><small>Test recall</small><strong>Reviews &amp; games</strong><span>Use spaced review, mastery activities, the Verse Library, and active practice.</span></a>
    </nav>

    <section class="library-first-cards">
      <article class="library-first-card">
        <p class="eyebrow">Continue learning</p>
        <h2>${esc(next?.title||'Choose a course')}</h2>
        <p>${esc(nextUnit?.scope||'The Course Catalog lets you inspect all six courses before choosing where to begin.')}</p>
        <p><a class="button" href="${activityHref(next)}">${next?'Continue activity →':'Open Course Catalog →'}</a></p>
        <div class="library-first-progress"><span><strong>${progress.pct}%</strong><br>${progress.done}/${progress.total} activities</span><span><strong>${progress.due}</strong><br>review${progress.due===1?'':'s'} due</span>${nextCourse?`<span><strong>Course ${esc(nextCourse.sequence)}</strong><br>${esc(nextCourse.shortTitle||nextCourse.title)}</span>`:''}</div>
      </article>
      <article class="library-first-card library-first-card--context">
        <p class="eyebrow">Current context</p>
        <h2>${esc(contextTitle)}</h2>
        <p>${esc(contextCopy).slice(0,330)}</p>
        <p><a href="${contextHref}">Open context →</a></p>
      </article>
    </section>

    <section class="library-first-recent">
      <p class="eyebrow">Recent study</p>
      ${recent.length?`<div class="library-first-recent__items">${recent.map(item=>`<a href="${esc(item.href)}">${esc(item.title)}</a>`).join('')}</div>`:'<p>Lessons, Bible passages, and Topics you open will appear here.</p>'}
    </section>
  </div>`;
}

export function progressPanelView({data,state,esc}){
  const s=progressSummary(data,state),practice=practiceStateSummary(),recent=recentActivity().slice(0,6);
  return `<div class="progress-panel__summary"><div class="progress-ring progress-ring--small" style="--progress:${s.pct}"><span><strong>${s.pct}%</strong><small>${s.done}/${s.total}</small></span></div><div><p class="eyebrow">Learning progress</p><h3>${s.due?`${s.due} review${s.due===1?'':'s'} due`:'No reviews due'}</h3><p>Completion, mastery, and review state remain local-first and can be backed up or synced separately.</p></div></div><div class="progress-panel__courses">${s.courses.map(c=>`<a href="/course?course=${encodeURIComponent(c.id)}"><span>Course ${c.sequence}</span><strong>${esc(c.shortTitle||c.title)}</strong><small>${c.pct}% · ${c.done}/${c.total}</small></a>`).join('')}</div><section><h3>Practice</h3><p><strong>${esc(practice.rank.name)}</strong> · ${practice.state.xp.toLocaleString()} XP · ${practice.stars}/${practice.maxStars} stars · ${practice.achievements}/${practice.totalAchievements} achievements</p><p><a href="/practice?mode=campaign">Continue Practice Campaign →</a></p></section><section><h3>Recent activity</h3>${recent.length?`<ul>${recent.map(x=>`<li><a href="${esc(x.href)}">${esc(x.title)}</a></li>`).join('')}</ul>`:'<p>No recent activity yet.</p>'}</section><section><h3>Backup</h3><p><button class="button" id="export">Export progress</button> <button class="button" id="import">Import progress</button></p></section>`;
}
