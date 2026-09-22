import {getState} from './db.js';
import {recentActivity} from './experience.js';
import {getBibleState} from './bible-state.js';
import {LIBRARY_BOOKS} from './library-data.js';

let catalogPromise=null;
let renderToken=0;
const esc=(value='')=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const catalog=()=>catalogPromise||=fetch('/data/catalog.json').then(response=>response.ok?response.json():Promise.reject(new Error('Catalog unavailable')));
const isHome=()=>location.pathname==='/'||location.pathname==='/home';
const activityHref=activity=>activity?.type==='lesson'?`/course?unit=${encodeURIComponent(activity.unitId)}&lesson=${encodeURIComponent(activity.sourceId)}`:activity?`/course?unit=${encodeURIComponent(activity.unitId)}&mastery=${encodeURIComponent(activity.sourceId)}`:'/course';

function shelfMarkup(){
  return LIBRARY_BOOKS.map(book=>`<a class="library-first-book" data-cat="${esc(book.cat)}" href="/bible?view=shelf&book=${book.n}&profile=1" style="--chapters:${Number(book.ch)||1}" aria-label="${esc(book.name)}, ${book.ch} chapters" title="${esc(book.name)}"><span>${esc(book.name)}</span></a>`).join('');
}

function courseProgress(data,state){
  const complete=new Set(state?.completed||[]),activities=data.activities||[];
  const done=activities.filter(activity=>complete.has(activity.id)).length;
  const next=activities.find(activity=>!complete.has(activity.id))||null;
  const due=Object.values(state?.reviewSchedule||{}).filter(entry=>Date.parse(entry?.dueAt)<=Date.now()).length;
  return {done,total:activities.length,next,due,pct:Math.round(done/Math.max(activities.length,1)*100)};
}

async function renderLockedHome(){
  const token=++renderToken;
  if(!isHome())return;
  const root=document.querySelector('#main');
  if(!root)return;
  let data,state;
  try{[data,state]=await Promise.all([catalog(),getState()])}catch{return}
  if(token!==renderToken||!isHome())return;

  const progress=courseProgress(data,state),next=progress.next;
  const nextUnit=next&&(data.units||[]).find(unit=>unit.id===next.unitId);
  const nextCourse=next&&(data.courses||[]).find(course=>course.id===next.courseId);
  const bibleState=getBibleState(),currentBook=LIBRARY_BOOKS[Number(bibleState.lastBook||0)-1]||null;
  const topics=data.topics||[],featured=topics.length?topics[new Date().getDate()%topics.length]:null;
  const recent=recentActivity().slice(0,5);
  const contextTitle=currentBook?`Continue ${currentBook.name}`:featured?.title||'Open a reference question';
  const contextCopy=currentBook?`${currentBook.hook||currentBook.syn||'Return to your most recent Bible reading.'}`:(featured?.answer||featured?.summary||'Topics connect biblical text, context, interpretation, and related course material.');
  const contextHref=currentBook?`/bible?book=${currentBook.n}&chapter=${Number(bibleState.lastChapter||1)}`:featured?`/topics?topic=${encodeURIComponent(featured.id)}`:'/topics';

  root.innerHTML=`<div class="library-first-home">
    <section class="library-first-hero">
      <div class="library-first-copy">
        <p class="eyebrow">A Bible-learning library</p>
        <h1>The Canonical <em>Shelf</em></h1>
        <p class="lede">Start with the library itself. Open a book, understand where it sits, then move naturally into reading, context, course learning, and practice.</p>
        <div class="library-first-actions"><a class="button" href="/bible?view=shelf">Open the bookshelf</a><a class="button" href="${activityHref(next)}">${next?'Continue learning':'Explore the Course'}</a></div>
      </div>
      <div class="library-first-shelf-wrap">
        <div class="library-first-shelf-label"><strong>66-book library</strong><span>Color follows canonical category</span></div>
        <div class="library-first-shelf" aria-label="Canonical bookshelf">${shelfMarkup()}</div>
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

const schedule=()=>requestAnimationFrame(()=>void renderLockedHome());
document.addEventListener('canonical-route-rendered',schedule);
document.addEventListener('canonical-app-ready',schedule);
window.addEventListener('popstate',schedule);
setTimeout(schedule,0);
