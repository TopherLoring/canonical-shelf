import {mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import {dirname} from 'node:path';

const manifest=JSON.parse(await readFile('content/migration/admissibility.json','utf8'));
if(!/^[0-9a-f]{40}$/.test(manifest.sourceRef||''))throw new Error('sourceRef must be an immutable commit SHA');
const base=`https://raw.githubusercontent.com/${manifest.sourceRepo}/${manifest.sourceRef}/`;
let written=0;
for(const asset of manifest.approvedAssets){
  const sourcePath=asset.path;
  const target=`content/vendor/legacy/${sourcePath.replace(/^public\//,'')}`;
  try{await stat(target);continue}catch{}
  const response=await fetch(base+sourcePath,{headers:{'user-agent':'canonical-shelf-vendor'}});
  if(!response.ok)throw new Error(`${sourcePath}@${manifest.sourceRef}: ${response.status}`);
  const body=new Uint8Array(await response.arrayBuffer());
  await mkdir(dirname(target),{recursive:true});
  await writeFile(target,body);
  written++;
  console.log(`vendored ${sourcePath} -> ${target}`);
}
console.log(`legacy vendor snapshot complete: ${written} new asset(s), source ${manifest.sourceRef}`);
