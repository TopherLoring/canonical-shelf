import {readFile,writeFile} from 'node:fs/promises';

const copies=[
  ['content/statement/statement-of-faith-compact.md','public/data/statement-of-faith.md'],
  ['content/statement/statement-of-faith-v3.md','public/data/theologian-belief-context.md'],
  ['content/theology/policy.json','public/data/theology-policy.json'],
  ['content/theology/crisis-policy.json','public/data/theologian-crisis-policy.json'],
  ['content/theology/sources.json','public/data/theology-sources.json']
];

for(const [source,target] of copies){
  const content=await readFile(source,'utf8');
  await writeFile(target,content.endsWith('\n')?content:`${content}\n`,'utf8');
}

console.log('published compact Statement of Faith, supplemental Theologian belief context, theology policy, crisis policy, and vetted source catalog');
