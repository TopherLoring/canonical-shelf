import {LIBRARY_BOOKS,CATEGORIES,CATEGORY_ORDER} from './library-data.js';
import {PRACTICE_STAGES,PRACTICE_LEVELS,PRACTICE_GAME_FAMILIES,PRACTICE_SCOPES,PRACTICE_ACHIEVEMENTS} from './practice-data.js';
import {practiceStateSummary,recordPracticeResult} from './practice-state.js';

const sessions=new Map();
const shuffle=input=>{const values=[...input];for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}return values};
const sample=(input,count)=>shuffle(input).slice(0,Math.min(count,input.length));
const pick=input=>input[Math.floor(Math.random()*input.length)];
const book=n=>LIBRARY_BOOKS[n-1];
const escAttr=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function booksForScope(scope={all:true}){
  if(scope.all)return LIBRARY_BOOKS;
  if(scope.cat)return LIBRARY_BOOKS.filter(item=>item.cat===scope.cat);
  return LIBRARY_BOOKS.filter(item=>item.n>=Number(scope.from||1)&&item.n<=Number(scope.to||66));
}

const wrongBooks=(target,pool,count=3)=>sample(LIBRARY_BOOKS.filter(item=>item.n!==target.n&&!pool?.some?.(p=>p.n===item.n)),count);
function mc(id,prompt,answer,options,explanation,meta={}){return{id,shape:'mc',prompt,answer,options:shuffle(options),explanation,...meta}}
function safePool(spec){const pool=booksForScope(spec.scope);return pool.length?pool:LIBRARY_BOOKS}

function questionNext(spec,direction=1){
  const pool=safePool(spec).filter(item=>direction>0?item.n<66:item.n>1),source=pick(pool),target=book(source.n+direction),options=[target,...wrongBooks(target,[source],3)].map(item=>({value:String(item.n),label:item.name}));
  return mc(`step-${source.n}-${direction}`,`Which book comes immediately ${direction>0?'after':'before'} ${source.name}?`,String(target.n),options,`${target.name} is book ${target.n}.`,{book:target.n});
}
function questionGap(spec){
  const pool=safePool(spec),min=pool[0].n,max=pool.at(-1).n,start=Math.max(min,Math.min(max-4,pick(pool).n)),run=Array.from({length:Math.min(5,max-start+1)},(_,i)=>book(start+i)).filter(Boolean);
  if(run.length<3)return questionNext(spec,1);
  const hole=1+Math.floor(Math.random()*(run.length-2)),target=run[hole],strip=run.map((item,index)=>index===hole?'?':item.name).join(' → '),options=[target,...wrongBooks(target,run,3)].map(item=>({value:String(item.n),label:item.name}));
  return mc(`gap-${target.n}`,`${strip}\nWhich book fills the gap?`,String(target.n),options,`${target.name} is book ${target.n}, between ${run[hole-1].name} and ${run[hole+1].name}.`,{book:target.n});
}
function questionBeforeAfter(spec){
  const pool=safePool(spec);let a=pick(pool),b=pick(pool);while(a.n===b.n)b=pick(pool);const answer=a.n<b.n?'before':'after';
  return mc(`ba-${a.n}-${b.n}`,`Does ${a.name} come before or after ${b.name} on the canonical shelf?`,answer,[{value:'before',label:'Before'},{value:'after',label:'After'}],`${a.name} is book ${a.n}; ${b.name} is book ${b.n}.`,{book:a.n});
}
function questionMisfit(spec){
  const pool=safePool(spec);if(pool.length<4)return questionBeforeAfter(spec);
  const start=Math.max(pool[0].n,Math.min(pool.at(-1).n-3,pick(pool).n)),run=Array.from({length:4},(_,i)=>book(start+i)).filter(Boolean),slot=1+Math.floor(Math.random()*2),original=run[slot],intruder=pick(LIBRARY_BOOKS.filter(item=>!run.some(r=>r.n===item.n)&&item.cat!==original.cat)),display=run.map((item,index)=>index===slot?intruder:item);
  return mc(`misfit-${start}-${intruder.n}`,'One book breaks this consecutive shelf run. Which is the misfit?',String(intruder.n),display.map(item=>({value:String(item.n),label:item.name})),`The intended run is ${run.map(item=>item.name).join(' → ')}.`,{book:intruder.n});
}
function questionCategory(spec){
  const target=pick(safePool(spec)),options=[target.cat,...sample(CATEGORY_ORDER.filter(key=>key!==target.cat),4)].map(key=>({value:key,label:CATEGORIES[key].name}));
  return mc(`cat-${target.n}`,`Which canonical group contains ${target.name}?`,target.cat,options,`${target.name} belongs to ${CATEGORIES[target.cat].name}. ${CATEGORIES[target.cat].blurb}`,{book:target.n});
}
function questionOdd(){
  const category=pick(CATEGORY_ORDER.filter(key=>LIBRARY_BOOKS.filter(item=>item.cat===key).length>=3)),members=sample(LIBRARY_BOOKS.filter(item=>item.cat===category),3),intruder=pick(LIBRARY_BOOKS.filter(item=>item.cat!==category));
  return mc(`odd-${category}-${intruder.n}`,`Three are ${CATEGORIES[category].name}. Which one is not?`,String(intruder.n),shuffle([...members,intruder]).map(item=>({value:String(item.n),label:item.name})),`${intruder.name} belongs to ${CATEGORIES[intruder.cat].name}.`,{book:intruder.n});
}
function questionBounds(){
  const category=pick(CATEGORY_ORDER.filter(key=>LIBRARY_BOOKS.filter(item=>item.cat===key).length>=2)),members=LIBRARY_BOOKS.filter(item=>item.cat===category),first=Math.random()<.5,target=first?members[0]:members.at(-1);
  return mc(`bounds-${category}-${first?'first':'last'}`,`Which book ${first?'opens':'closes'} ${CATEGORIES[category].name}?`,String(target.n),[target,...wrongBooks(target,members,3)].map(item=>({value:String(item.n),label:item.name})),`${target.name} is the ${first?'first':'last'} book in ${CATEGORIES[category].name}.`,{book:target.n});
}
function questionHook(spec){const target=pick(safePool(spec));return mc(`hook-${target.n}`,`Which book is summarized by “${target.hook}”?`,String(target.n),[target,...wrongBooks(target,null,3)].map(item=>({value:String(item.n),label:item.name})),`${target.name}: ${target.syn}`,{book:target.n})}
function questionPeople(spec){const target=pick(safePool(spec).filter(item=>item.people?.length));return mc(`people-${target.n}`,`Which book includes ${target.people.slice(0,Math.min(3,target.people.length)).join(', ')}?`,String(target.n),[target,...wrongBooks(target,null,3)].map(item=>({value:String(item.n),label:item.name})),`${target.name} includes ${target.people.join(', ')}.`,{book:target.n})}
function questionSynopsis(spec){const target=pick(safePool(spec));return mc(`syn-${target.n}`,`Which book fits this plot movement? “${target.syn}”`,String(target.n),[target,...wrongBooks(target,null,3)].map(item=>({value:String(item.n),label:item.name})),`${target.name}: ${target.hook}.`,{book:target.n})}

function sequenceQuestion(spec){
  const pool=safePool(spec),size=Math.min(Number(spec.size||5),pool.length);let ordered;
  if(spec.mode==='run'){const start=Math.floor(Math.random()*Math.max(1,pool.length-size+1));ordered=pool.slice(start,start+size)}else ordered=sample(pool,size).sort((a,b)=>a.n-b.n);
  return{id:`sequence-${ordered.map(item=>item.n).join('-')}`,shape:'sequence',prompt:`Put these ${ordered.length} books in canonical order.`,items:shuffle(ordered).map(item=>({value:String(item.n),label:item.name})),answer:ordered.map(item=>String(item.n)),explanation:`Correct order: ${ordered.map(item=>`${item.n}. ${item.name}`).join(' · ')}`,books:ordered.map(item=>item.n)};
}
function shelfQuestion(spec){
  const pool=safePool(spec),count=Math.min(Number(spec.slots||8),pool.length),start=Math.floor(Math.random()*Math.max(1,pool.length-count+1)),ordered=pool.slice(start,start+count);
  return{id:`shelf-${ordered[0].n}-${ordered.at(-1).n}`,shape:'shelf',prompt:'Put each book into its numbered canonical slot.',items:shuffle(ordered).map(item=>({value:String(item.n),label:item.name})),slots:ordered.map(item=>item.n),answer:Object.fromEntries(ordered.map(item=>[String(item.n),String(item.n)])),explanation:`This run occupies books ${ordered[0].n}–${ordered.at(-1).n}.`,books:ordered.map(item=>item.n)};
}
function binsQuestion(spec){
  const books=sample(safePool(spec),Math.min(Number(spec.count||10),10)),categories=[...new Set(books.map(item=>item.cat))];
  return{id:`bins-${books.map(item=>item.n).join('-')}`,shape:'bins',prompt:'Sort each book into its canonical group.',items:books.map(item=>({value:String(item.n),label:item.name})),categories,answer:Object.fromEntries(books.map(item=>[String(item.n),item.cat])),explanation:'Canonical groups are navigation neighborhoods; they do not erase genre or historical differences.',books:books.map(item=>item.n)};
}
function pairsQuestion(spec,byNumber=false){
  const books=sample(safePool(spec),Math.min(Number(spec.pairs||6),6));
  return{id:`pairs-${books.map(item=>item.n).join('-')}-${byNumber?'number':'hook'}`,shape:'pairs',prompt:byNumber?'Match each book to its canonical number.':'Match each book to its one-line hook.',items:books.map(item=>({value:String(item.n),label:item.name})),options:shuffle(books.map(item=>({value:String(item.n),label:byNumber?`Book ${item.n}`:item.hook}))),answer:Object.fromEntries(books.map(item=>[String(item.n),String(item.n)])),explanation:'Pairing name with position or content gives the book more than one retrieval cue.',books:books.map(item=>item.n)};
}

function generate(engine,spec){
  if(engine==='sequence')return sequenceQuestion(spec);
  if(engine==='gap')return questionGap(spec);
  if(engine==='next')return questionNext(spec,1);
  if(engine==='previous')return questionNext(spec,-1);
  if(engine==='before-after')return questionBeforeAfter(spec);
  if(engine==='misfit')return questionMisfit(spec);
  if(engine==='category'||engine==='group-drill')return questionCategory(spec);
  if(engine==='odd'||engine==='impostor')return questionOdd(spec);
  if(engine==='bounds')return questionBounds(spec);
  if(engine==='hook'||engine==='guess-book'||engine==='content-drill')return questionHook(spec);
  if(engine==='people')return questionPeople(spec);
  if(engine==='synopsis')return questionSynopsis(spec);
  if(engine==='shelf')return shelfQuestion(spec);
  if(engine==='bins')return binsQuestion(spec);
  if(engine==='pairs')return pairsQuestion(spec,false);
  if(engine==='pairs-number')return pairsQuestion(spec,true);
  if(engine==='clock'||engine==='survival')return generate(pick(['next','gap','before-after','category','hook','people']),spec);
  return questionHook(spec);
}

const levelById=id=>PRACTICE_LEVELS.find(level=>level.id===id)||null;
const scopeById=id=>PRACTICE_SCOPES.find(scope=>scope.id===id)||PRACTICE_SCOPES[0];
const gameFamilyById=id=>PRACTICE_GAME_FAMILIES.find(([game])=>game===id)||PRACTICE_GAME_FAMILIES[0];
const starsFromRatio=ratio=>ratio>=.95?4:ratio>=.82?3:ratio>=.68?2:ratio>=.55?1:0;

function createRun(spec,{arcade=false,game=null,scope=null}={}){
  const runId=`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const runSpec=arcade?{id:null,name:gameFamilyById(game)[1],game,engines:[game],count:game==='survival'?40:game==='clock'?20:10,scope:scopeById(scope).scope,format:game}:spec;
  const format=runSpec.format||runSpec.game,engineList=runSpec.engines?.length?runSpec.engines:[runSpec.game];let questions=[];
  if(format==='shelf')questions=[shelfQuestion(runSpec)];
  else if(format==='bins')questions=[binsQuestion(runSpec)];
  else if(format==='pairs')questions=[pairsQuestion(runSpec,false)];
  else{
    const count=Math.min(Number(runSpec.count||10),format==='survival'?40:20);
    for(let index=0;index<count;index++)questions.push(generate(engineList[index%engineList.length],runSpec));
  }
  const session={runId,spec:runSpec,questions,arcade,game:runSpec.game,startedAt:Date.now(),seconds:runSpec.seconds||60,lives:runSpec.lives||3};sessions.set(runId,session);return session;
}

const inputName=(index,suffix='answer')=>`q${index}-${suffix}`;
function renderQuestion(question,index,esc){
  const heading=`<p class="practice-question__num">${String(index+1).padStart(2,'0')}</p><h3>${esc(question.prompt)}</h3>`;
  if(question.shape==='mc')return `<fieldset class="practice-question" data-question="${index}"><legend class="sr-only">Question ${index+1}</legend>${heading}<div class="answer-tiles">${question.options.map(option=>`<label class="answer-tile"><input type="radio" name="${inputName(index)}" value="${escAttr(option.value)}"><span>${esc(option.label)}</span></label>`).join('')}</div></fieldset>`;
  if(question.shape==='sequence')return `<fieldset class="practice-question" data-question="${index}"><legend class="sr-only">Question ${index+1}</legend>${heading}<ol class="sequence-board" data-sequence-board>${question.items.map((item,itemIndex)=>`<li class="sequence-card" data-seq-value="${escAttr(item.value)}" tabindex="-1"><input type="hidden" name="${inputName(index,`p${itemIndex}`)}" value="${escAttr(item.value)}"><span class="sequence-card__index">${String(itemIndex+1).padStart(2,'0')}</span><span class="sequence-card__text">${esc(item.label)}</span><span class="sequence-card__controls"><button type="button" data-seq-move="up" aria-label="Move ${esc(item.label)} earlier">↑</button><button type="button" data-seq-move="down" aria-label="Move ${esc(item.label)} later">↓</button></span></li>`).join('')}</ol></fieldset>`;
  if(question.shape==='shelf')return `<fieldset class="practice-question practice-question--board" data-question="${index}"><legend class="sr-only">Shelf slots</legend>${heading}<div class="slot-board">${question.slots.map(slot=>`<label><span>Book ${slot}</span><select name="${inputName(index,`slot-${slot}`)}"><option value="">Choose…</option>${question.items.map(item=>`<option value="${escAttr(item.value)}">${esc(item.label)}</option>`).join('')}</select></label>`).join('')}</div></fieldset>`;
  if(question.shape==='bins')return `<fieldset class="practice-question practice-question--board" data-question="${index}"><legend class="sr-only">Sort books</legend>${heading}<div class="sort-board">${question.items.map(item=>`<label><strong>${esc(item.label)}</strong><select name="${inputName(index,`bin-${item.value}`)}"><option value="">Choose group…</option>${question.categories.map(key=>`<option value="${key}">${esc(CATEGORIES[key].name)}</option>`).join('')}</select></label>`).join('')}</div></fieldset>`;
  if(question.shape==='pairs')return `<fieldset class="practice-question practice-question--board" data-question="${index}"><legend class="sr-only">Match pairs</legend>${heading}<div class="pair-board">${question.items.map(item=>`<label><strong>${esc(item.label)}</strong><select name="${inputName(index,`pair-${item.value}`)}"><option value="">Choose match…</option>${question.options.map(option=>`<option value="${escAttr(option.value)}">${esc(option.label)}</option>`).join('')}</select></label>`).join('')}</div></fieldset>`;
  return'';
}

function practiceHeader(summary,esc){const next=summary.next;return `<section class="practice-status" aria-label="Practice progression"><div><p class="eyebrow">Practice rank</p><h2>${esc(summary.rank.name)}</h2><p>${summary.state.xp.toLocaleString()} XP${next?` · ${Math.max(0,next.xp-summary.state.xp).toLocaleString()} to ${esc(next.name)}`:' · highest rank reached'}</p></div><div><strong>${summary.stars}/${summary.maxStars}</strong><span>campaign stars</span></div><div><strong>${summary.achievements}/${summary.totalAchievements}</strong><span>achievements</span></div></section>`}
export function practiceCampaignView({esc}){
  const summary=practiceStateSummary();
  return `<p><a href="/practice">← Practice overview</a></p><header class="section compact-section"><p class="eyebrow">Original Practice journey · restored natively</p><h1>Practice Campaign</h1><p class="lede">Four optional stages turn the shelf, its groups, book substance, and key passages into retrieval work. Campaign stars and XP never count toward Course completion.</p></header>${practiceHeader(summary,esc)}${PRACTICE_STAGES.map(stage=>`<section class="practice-stage"><div class="practice-stage__head"><div><p class="eyebrow">${esc(stage.tag)}</p><h2>${esc(stage.name)}</h2><p>${esc(stage.description)}</p></div><strong>${stage.levels.reduce((sum,level)=>sum+Number(summary.state.stars[level.id]||0),0)}/${stage.levels.length*4} ★</strong></div><div class="level-grid">${stage.levels.map((level,index)=>`<a class="level-card" href="/practice?play=${level.id}"><span>${String(index+1).padStart(2,'0')} · ${Number(summary.state.stars[level.id]||0)}★</span><strong>${esc(level.name)}</strong><small>${esc(level.sub||level.game)}</small></a>`).join('')}</div></section>`).join('')}`;
}
export function practiceArcadeView({params,esc}){
  const summary=practiceStateSummary(),game=params.get('game')||'sequence',scope=params.get('scope')||'all';
  return `<p><a href="/practice">← Practice overview</a></p><header class="section compact-section"><p class="eyebrow">Free play · no Course completion</p><h1>Arcade</h1><p class="lede">Choose a game and scope. Arcade awards Practice XP and remembers personal bests, but it does not alter Course mastery.</p></header>${practiceHeader(summary,esc)}<form class="arcade-config" method="get" action="/practice"><input type="hidden" name="mode" value="arcade"><label>Game<select name="game">${PRACTICE_GAME_FAMILIES.map(([id,label])=>`<option value="${id}" ${game===id?'selected':''}>${esc(label)}</option>`).join('')}</select></label><label>Scope<select name="scope">${PRACTICE_SCOPES.map(item=>`<option value="${item.id}" ${scope===item.id?'selected':''}>${esc(item.name)}</option>`).join('')}</select></label><button class="button" type="submit">Configure</button><a class="button button--primary" href="/practice?arcade=${encodeURIComponent(game)}&scope=${encodeURIComponent(scope)}">Play</a></form><div class="arcade-library">${PRACTICE_GAME_FAMILIES.map(([id,label])=>`<a href="/practice?mode=arcade&game=${id}&scope=${encodeURIComponent(scope)}" ${game===id?'aria-current="true"':''}><strong>${esc(label)}</strong><small>${esc(summary.state.arcade.bestByGame[id]?`Best: ${summary.state.arcade.bestByGame[id]} correct`:'Not played yet')}</small></a>`).join('')}</div>`;
}
export function practiceAchievementsView({esc}){const summary=practiceStateSummary(),earned=new Set(summary.state.achievements);return `<p><a href="/practice">← Practice overview</a></p><header class="section compact-section"><p class="eyebrow">Practice achievements</p><h1>${summary.achievements} of ${summary.totalAchievements} earned</h1></header>${practiceHeader(summary,esc)}<div class="achievement-grid">${PRACTICE_ACHIEVEMENTS.map(item=>`<article class="achievement-card" data-earned="${earned.has(item.id)}"><span aria-hidden="true">${earned.has(item.id)?'✦':'◇'}</span><div><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p></div></article>`).join('')}</div>`}

export function practiceRunView({params,esc}){
  const levelId=params.get('play'),arcadeGame=params.get('arcade'),scope=params.get('scope')||'all';let session;
  if(levelId){const level=levelById(levelId);if(!level)return'<p class="notice">Practice level not found.</p>';session=createRun(level)}else if(arcadeGame)session=createRun(null,{arcade:true,game:arcadeGame,scope});else return'';
  const timed=session.spec.format==='clock',survival=session.spec.format==='survival';
  return `<p><a href="${session.arcade?'/practice?mode=arcade':'/practice?mode=campaign'}">← ${session.arcade?'Arcade':'Campaign'}</a></p><header class="section compact-section practice-run-head"><p class="eyebrow">${session.arcade?'Arcade':'Practice Campaign'}</p><h1>${esc(session.spec.name)}</h1><p class="lede">${esc(session.spec.sub||session.spec.game)}</p>${timed?`<p class="run-meter"><strong data-practice-timer>${session.seconds}</strong> seconds</p>`:''}${survival?`<p class="run-meter"><strong>${session.lives}</strong> lives · up to ${session.questions.length} questions</p>`:''}</header><form class="practice-run" data-practice-run="${session.runId}" ${timed?'data-timed="true"':''}>${session.questions.map((question,index)=>renderQuestion(question,index,esc)).join('')}<div class="practice-run__submit"><button class="button button--primary" type="submit">Finish round</button><div class="feedback" role="status" aria-live="polite"></div></div></form>`;
}

function gradeQuestion(form,question,index){
  const fd=new FormData(form);
  if(question.shape==='mc')return String(fd.get(inputName(index))||'')===String(question.answer);
  if(question.shape==='sequence'){
    const values=[...form.querySelectorAll(`[data-question="${index}"] [data-seq-value]`)].map(card=>String(card.dataset.seqValue||''));
    return values.length===question.answer.length&&values.every((value,i)=>value===question.answer[i]);
  }
  if(question.shape==='shelf')return question.slots.every(slot=>String(fd.get(inputName(index,`slot-${slot}`))||'')===String(question.answer[String(slot)]));
  if(question.shape==='bins')return question.items.every(item=>String(fd.get(inputName(index,`bin-${item.value}`))||'')===question.answer[item.value]);
  if(question.shape==='pairs')return question.items.every(item=>String(fd.get(inputName(index,`pair-${item.value}`))||'')===question.answer[item.value]);
  return false;
}

export function finishPracticeRun(form){
  const session=sessions.get(form.dataset.practiceRun);if(!session)return{ok:false,html:'<p class="notice">This round expired. Start it again.</p>'};
  const graded=session.questions.map((question,index)=>({question,correct:gradeQuestion(form,question,index)}));let considered=graded;
  if(session.spec.format==='survival'){let lives=session.lives,end=graded.length;for(let i=0;i<graded.length;i++){if(!graded[i].correct)lives--;if(lives<=0){end=i+1;break}}considered=graded.slice(0,end)}
  const correct=considered.filter(item=>item.correct).length,total=considered.length,ratio=correct/Math.max(total,1),stars=session.spec.format==='survival'?(correct>=40?4:correct>=30?3:correct>=20?2:correct>=10?1:0):starsFromRatio(ratio),missed=considered.filter(item=>!item.correct).map(item=>({question:item.question.prompt,want:item.question.explanation}));
  const learnedBooks=[...new Set(considered.filter(item=>item.correct).flatMap(item=>[...(item.question.books||[]),...(item.question.book?[item.question.book]:[])]).map(Number).filter(Boolean))];
  let streak=0,bestStreak=0;for(const item of considered){if(item.correct){streak++;bestStreak=Math.max(bestStreak,streak)}else streak=0}
  const result=recordPracticeResult({levelId:session.spec.id,game:session.game,correct,total,stars,streak:bestStreak,missed,learnedBooks,timed:session.spec.format==='clock',survival:session.spec.format==='survival',arcade:session.arcade});sessions.delete(session.runId);
  const verdict=stars===4?'Flawless round.':stars===3?'Strong.':stars===2?'Cleared, with gaps.':stars===1?'Cleared — just.':'Not cleared yet.';
  const missedMarkup=missed.length?`<details class="missed-review"><summary>Review ${missed.length} missed ${missed.length===1?'answer':'answers'}</summary><ol>${missed.map(item=>`<li><strong>${escAttr(item.question)}</strong><p>${escAttr(item.want)}</p></li>`).join('')}</ol></details>`:'<p>No missed answers in this round.</p>';
  return{ok:true,complete:true,html:`<div class="round-result"><p class="eyebrow">Round complete</p><h2>${verdict}</h2><div class="round-result__metrics"><strong>${correct}/${total}</strong><span>${stars}★</span><span>+${result.xpGained} XP</span><span>${escAttr(result.rank.name)}</span></div>${result.rankAdvanced?`<p class="notice"><strong>Rank advanced:</strong> ${escAttr(result.rank.name)}</p>`:''}${missedMarkup}<div class="round-result__actions"><a class="button" href="${session.arcade?'/practice?mode=arcade':'/practice?mode=campaign'}">Back</a>${session.spec.id?`<a class="button button--primary" href="/practice?play=${session.spec.id}">Play again</a>`:`<a class="button button--primary" href="/practice?arcade=${encodeURIComponent(session.game)}&scope=all">Play again</a>`}</div></div>`};
}

let timerId=null;
export function activatePracticeRun(root=document){
  if(timerId){clearInterval(timerId);timerId=null}
  const form=root.querySelector?.('[data-practice-run][data-timed="true"]'),timer=form?.closest('main,body')?.querySelector?.('[data-practice-timer]')||root.querySelector?.('[data-practice-timer]');if(!form||!timer)return;
  let left=Number(timer.textContent||60);timerId=setInterval(()=>{left=Math.max(0,left-1);timer.textContent=String(left);if(left<=0){clearInterval(timerId);timerId=null;form.requestSubmit()}},1000);
}
