import {PRACTICE_LEVELS,PRACTICE_ACHIEVEMENTS,practiceRank,nextPracticeRank} from './practice-data.js';

const KEY='canonical-shelf-practice-v3';
const VERSION=1;
const fresh=()=>({version:VERSION,xp:0,stars:{},achievements:[],bestStreak:0,learnedBooks:[],attempts:{},missed:[],arcade:{plays:0,bestByGame:{}},updatedAt:null});
const record=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};

export function normalizePracticeState(input={}){
  const base=fresh(),source=record(input),state={...base,...source,version:VERSION};
  state.xp=Math.max(0,Number(source.xp||0));
  state.stars={...record(source.stars)};
  state.achievements=[...new Set(Array.isArray(source.achievements)?source.achievements.filter(id=>PRACTICE_ACHIEVEMENTS.some(a=>a.id===id)):[])];
  state.bestStreak=Math.max(0,Number(source.bestStreak||0));
  state.learnedBooks=[...new Set(Array.isArray(source.learnedBooks)?source.learnedBooks.map(Number).filter(n=>n>=1&&n<=66):[])];
  state.attempts={...record(source.attempts)};
  state.missed=Array.isArray(source.missed)?source.missed.slice(-80):[];
  state.arcade={plays:Math.max(0,Number(source.arcade?.plays||0)),bestByGame:{...record(source.arcade?.bestByGame)}};
  return state;
}
export function getPracticeState(){try{return normalizePracticeState(JSON.parse(localStorage.getItem(KEY)||'{}'))}catch{return fresh()}}
export function putPracticeState(state){const normalized=normalizePracticeState(state);normalized.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(normalized))}catch{}return normalized}
export function resetPracticeState(){try{localStorage.removeItem(KEY)}catch{}return fresh()}
export function exportPracticeState(){return JSON.stringify(getPracticeState(),null,2)}
export function importPracticeState(raw){const parsed=typeof raw==='string'?JSON.parse(raw):raw;return putPracticeState(normalizePracticeState(parsed))}

const award=(state,id)=>{if(PRACTICE_ACHIEVEMENTS.some(a=>a.id===id)&&!state.achievements.includes(id)){state.achievements.push(id);return true}return false};
const totalStars=state=>PRACTICE_LEVELS.reduce((sum,level)=>sum+Number(state.stars[level.id]||0),0);

export function recordPracticeResult({levelId=null,game='practice',correct=0,total=0,stars=0,streak=0,missed=[],learnedBooks=[],timed=false,survival=false,usedHint=false,arcade=false}){
  const state=getPracticeState(),previousRank=practiceRank(state.xp),safeTotal=Math.max(1,Number(total||0)),safeCorrect=Math.max(0,Math.min(safeTotal,Number(correct||0))),scoreXp=safeCorrect*10;
  let bonus=0;
  state.xp+=scoreXp;
  state.bestStreak=Math.max(state.bestStreak,Number(streak||0));
  state.learnedBooks=[...new Set([...state.learnedBooks,...learnedBooks.map(Number).filter(Boolean)])];
  state.missed=[...state.missed,...missed.map(item=>({...item,at:new Date().toISOString(),game,levelId}))].slice(-80);
  const key=levelId||`arcade:${game}`;
  state.attempts[key]=Number(state.attempts[key]||0)+1;

  if(arcade){
    state.arcade.plays+=1;
    state.arcade.bestByGame[game]=Math.max(Number(state.arcade.bestByGame[game]||0),safeCorrect);
  }else if(levelId){
    const previousStars=Number(state.stars[levelId]||0),nextStars=Math.max(previousStars,Math.max(0,Math.min(4,Number(stars||0))));
    if(nextStars>previousStars){bonus+=(nextStars-previousStars)*25;state.stars[levelId]=nextStars}
    if(previousStars===0&&nextStars>=1)bonus+=50;
    if(award(state,'first'))bonus+=25;
    if(levelId==='o1'&&nextStars===4)award(state,'pent');
    if(levelId==='o8'&&nextStars===4)award(state,'twelve');
    if(levelId==='o15'&&nextStars===4)award(state,'thirteen');
    if(levelId==='o20'&&nextStars>=1)award(state,'shelf');
    if(levelId==='g7'&&nextStars>=1)award(state,'sorter');
    if(levelId==='s6'&&nextStars>=1)award(state,'closered');
    if(levelId==='v7'&&nextStars>=1)award(state,'illum');
    const level=PRACTICE_LEVELS.find(item=>item.id===levelId);
    if(level?.boss&&nextStars===4&&!usedHint)award(state,'nohint');
    if(timed&&nextStars===4)award(state,'clockwork');
    if(survival&&safeCorrect>=30)award(state,'standing');
  }
  if(safeCorrect===safeTotal&&safeTotal>0)award(state,'flawless');
  if(streak>=10)award(state,'streak10');
  if(totalStars(state)>=PRACTICE_LEVELS.length*4)award(state,'gilt');
  state.xp+=bonus;
  const nextRank=practiceRank(state.xp),rankAdvanced=nextRank.name!==previousRank.name;
  return {state:putPracticeState(state),xpGained:scoreXp+bonus,rank:nextRank,nextRank:nextPracticeRank(state.xp),rankAdvanced};
}

export function practiceStateSummary(){
  const state=getPracticeState(),rank=practiceRank(state.xp),next=nextPracticeRank(state.xp),stars=totalStars(state);
  return {state,rank,next,stars,maxStars:PRACTICE_LEVELS.length*4,achievements:state.achievements.length,totalAchievements:PRACTICE_ACHIEVEMENTS.length};
}
