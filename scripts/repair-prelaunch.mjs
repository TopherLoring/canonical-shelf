import {repairPublicCorpus,verifyVendorCorpus,verifyPublicCorpus} from './bsb-integrity.mjs';

function run(args,label){
  const result=Bun.spawnSync(args,{stdin:'inherit',stdout:'inherit',stderr:'inherit',env:process.env});
  if(result.exitCode!==0)throw new Error(`${label} failed with exit code ${result.exitCode}`);
}

console.log('pre-launch repair: verify protected source');
await verifyVendorCorpus();

console.log('pre-launch repair: regenerate deterministic content');
run(['bun','scripts/migrate-vendored.mjs'],'vendored content migration');
run(['bun','scripts/postprocess-v6.mjs'],'v7 curriculum postprocess');
run(['bun','scripts/generate-curriculum-reference.mjs'],'current curriculum reference generation');
run(['bun','scripts/generate-llms.mjs'],'llms generation');

console.log('pre-launch repair: restore locked public BSB copy if needed');
await repairPublicCorpus();
await verifyPublicCorpus();

console.log('pre-launch repair complete');
