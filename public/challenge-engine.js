// Challenge engine: shape detection, scoring, and lookup of authored challenges.
// Shared by the lesson screen, the review flow, and scripts/test-assessment.mjs. Moved from learning.js.

const sequenceKinds=new Set(['sequence','sequence-path','timeline-sort','shelf-build','verse-rebuild','theme-trace']);
const matchKinds=new Set(['match','match-board']);
const scalar=value=>!Array.isArray(value)&&value!==undefined&&value!==null&&(typeof value==='number'||typeof value==='string');

export function challengeShape(ch){
  if(!ch)return'reflection';
  const kind=ch.kind||'';
  const answer=ch.answer;
  if(Array.isArray(ch.stages)&&ch.stages.length>0&&ch.stages.every(stage=>Array.isArray(stage.choices)&&stage.correct!==undefined&&stage.correct!==null))return'scenario';
  if(Array.isArray(ch.fields)&&Array.isArray(ch.options)&&Array.isArray(answer))return'fields';
  if(Array.isArray(ch.lanes)&&Array.isArray(ch.items)&&Array.isArray(answer))return'lanes';
  if(Array.isArray(ch.options)&&scalar(answer))return'single-choice';
  if(kind==='evidence'&&Array.isArray(ch.items)&&Array.isArray(answer)&&answer.every(scalar))return'evidence-select';
  if((matchKinds.has(kind)||(!sequenceKinds.has(kind)&&Array.isArray(ch.items)&&Array.isArray(ch.options)))&&Array.isArray(answer)&&answer.every(scalar))return'match';
  if((sequenceKinds.has(kind)||Array.isArray(ch.items))&&Array.isArray(answer)&&answer.every(scalar))return'sequence';
  return'reflection';
}

export function challengeEvaluationMode(ch){return challengeShape(ch)==='reflection'?'reflection':'scored'}
export function activityFor(data,id){return data.activities?.find(a=>a.id===id)}
export function lessonFor(data,id){return data.lessons?.find(l=>l.id===id)}
export function masteryFor(data,id){return data.mastery?.[id]||data.legacyMastery?.CANON_V4_MASTERY?.[id]||null}

function ints(form,prefix,count){
  const formData=new FormData(form);
  return Array.from({length:count},(_,index)=>{
    const value=formData.get(`${prefix}${index}`);
    return value===null||value===''?Number.NaN:Number(value);
  });
}

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function checkChallenge(form,ch){
  const shape=challengeShape(ch),mode=challengeEvaluationMode(ch),formData=new FormData(form);
  if(mode==='reflection'){
    const text=String(formData.get('reasoning')||'').trim();
    return {mode,shape,correct:null,correctItems:[],submitted:text.length>0};
  }
  let correct=false,correctItems=[];
  if(['sequence','match','fields'].includes(shape)){
    const got=ints(form,'p',ch.answer.length),want=ch.answer.map(Number);
    correctItems=got.map((value,index)=>Number.isFinite(value)&&value===want[index]);correct=same(got,want);
  }else if(shape==='evidence-select'){
    const got=formData.getAll('pick').map(Number).sort((a,b)=>a-b),want=ch.answer.map(Number).sort((a,b)=>a-b),selected=new Set(got),supported=new Set(want);
    correctItems=(ch.items||[]).map((_,index)=>selected.has(index)&&supported.has(index));correct=same(got,want);
  }else if(shape==='scenario'){
    correctItems=ch.stages.map((stage,index)=>{const value=formData.get(`s${index}`);return value!==null&&value!==''&&Number(value)===Number(stage.correct)});correct=correctItems.every(Boolean);
  }else if(shape==='lanes'){
    const expected=ch.answer.map(entry=>Array.isArray(entry)?Number(entry[1]):Number(entry)),got=ints(form,'p',ch.items.length);
    correctItems=got.map((value,index)=>Number.isFinite(value)&&value===expected[index]);correct=same(got,expected);
  }else if(shape==='single-choice'){
    const value=formData.get('choice');correct=value!==null&&value!==''&&Number(value)===Number(ch.answer);correctItems=[correct];
  }
  return {mode:'scored',shape,correct:!!correct,correctItems,submitted:true};
}

export function challengeFor(data,activityId,index){
  if(activityId.startsWith('lesson:'))return lessonFor(data,activityId.slice(7))?.challenges?.[index]||null;
  if(activityId.startsWith('mastery:'))return masteryFor(data,activityId.slice(8))?.challenge||null;
  return null;
}

export function challengeCountFor(data,activityId){
  if(activityId.startsWith('lesson:'))return Math.max(1,lessonFor(data,activityId.slice(7))?.challenges?.length||0);
  if(activityId.startsWith('mastery:'))return masteryFor(data,activityId.slice(8))?.challenge?1:0;
  return 0;
}
