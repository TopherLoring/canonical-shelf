import {readFile} from 'node:fs/promises';

const catalog=JSON.parse(await readFile('public/data/catalog.json','utf8'));
const sequenceKinds=new Set(['sequence','sequence-path','timeline-sort','shelf-build','verse-rebuild','theme-trace']);
const matchKinds=new Set(['match','match-board']);
const scalar=value=>!Array.isArray(value)&&value!==undefined&&value!==null&&(typeof value==='number'||typeof value==='string');

function scoreableShape(challenge){
  if(!challenge||typeof challenge!=='object')return null;
  const kind=challenge.kind||'';
  const answer=challenge.answer;
  if(Array.isArray(challenge.stages)&&challenge.stages.length>0&&challenge.stages.every(stage=>Array.isArray(stage.choices)&&stage.choices.length>1&&stage.correct!==undefined&&stage.correct!==null))return'scenario';
  if(Array.isArray(challenge.fields)&&challenge.fields.length>0&&Array.isArray(challenge.options)&&Array.isArray(answer)&&answer.length===challenge.fields.length)return'fields';
  if(Array.isArray(challenge.lanes)&&challenge.lanes.length>1&&Array.isArray(challenge.items)&&challenge.items.length>0&&Array.isArray(answer)&&answer.length===challenge.items.length)return'lanes';
  if(Array.isArray(challenge.options)&&challenge.options.length>1&&scalar(answer))return'single-choice';
  if(kind==='evidence'&&Array.isArray(challenge.items)&&challenge.items.length>1&&Array.isArray(answer)&&answer.length>0&&answer.every(scalar))return'evidence-select';
  if((matchKinds.has(kind)||(!sequenceKinds.has(kind)&&Array.isArray(challenge.items)&&Array.isArray(challenge.options)))&&Array.isArray(challenge.items)&&challenge.items.length>0&&Array.isArray(challenge.options)&&challenge.options.length>1&&Array.isArray(answer)&&answer.length===challenge.items.length&&answer.every(scalar))return'match';
  if((sequenceKinds.has(kind)||Array.isArray(challenge.items))&&Array.isArray(challenge.items)&&challenge.items.length>1&&Array.isArray(answer)&&answer.length===challenge.items.length&&answer.every(scalar))return'sequence';
  return null;
}

const failures=[];
const checked=[];
function inspect(label,challenge){
  const shape=scoreableShape(challenge);
  if(!shape)failures.push(`${label} (${challenge?.kind||'untyped'})`);
  else checked.push({label,shape});
}

for(const lesson of catalog.lessons||[]){
  const challenges=lesson.challenges||[];
  if(!challenges.length)failures.push(`lesson:${lesson.id} (no completion-bearing challenge)`);
  challenges.forEach((challenge,index)=>inspect(`lesson:${lesson.id}#${index+1}`,challenge));
}

for(const [id,mastery] of Object.entries(catalog.legacyMastery?.CANON_V4_MASTERY||{}))inspect(`mastery:${id}`,mastery?.challenge);
for(const [id,mastery] of Object.entries(catalog.mastery||{}))inspect(`mastery:${id}`,mastery?.challenge);

if(failures.length){
  throw new Error(`Completion-bearing challenges must be objectively scoreable. Replace fallback/free-response reflection challenges with evidence, matching, sequencing, classification, scenario, reconstruction, or other authored-answer interactions:\n- ${failures.join('\n- ')}`);
}

const counts=checked.reduce((out,item)=>(out[item.shape]=(out[item.shape]||0)+1,out),{});
console.log(`scoreable assessment gate passed: ${checked.length} completion-bearing challenges; ${Object.entries(counts).map(([shape,count])=>`${shape}=${count}`).join(', ')}`);
