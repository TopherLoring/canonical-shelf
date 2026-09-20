import {readFile} from 'node:fs/promises';

const read=path=>readFile(path,'utf8');
const [topics,experience,index,sw]=await Promise.all([
  read('public/topics-experience.js'),
  read('public/experience.js'),
  read('public/index.html'),
  read('public/sw.js')
]);
const requireText=(source,text,message)=>{if(!source.includes(text))throw new Error(message||`missing Topics restoration marker: ${text}`)};

for(const field of ['t?.aliases','t?.tags','t?.refs','t?.sections'])requireText(topics,field,`Topics search must index ${field}`);
for(const marker of ['Scripture connections','Course connections','Related search language','Related exploration','Ask the Guide about this'])requireText(topics,marker,`Topics detail missing ${marker}`);
requireText(topics,'topic.sections','Topics renderer must expose authored sections');
requireText(topics,'t.refs','Topics renderer must expose Scripture references');
requireText(index,'/topics.css','Topics stylesheet not loaded');
requireText(sw,'/topics.css','Topics stylesheet not offline-cached');
requireText(sw,'/topics-experience.js','Topics module not offline-cached');
requireText(experience,"from './topics-experience.js'",'experience router must delegate Topics to the dedicated full-depth renderer');

console.log('Topics full-depth restoration contract passed');
