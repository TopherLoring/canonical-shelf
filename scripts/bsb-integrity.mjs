import {readFile,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';

export const BSB_SOURCE_REF='25ea6acd012fb28e1427eb4a5e69e358824e1d96';
export const BSB_GIT_BLOB_SHA='186fb31859ad8274840aa7a4aca965d813c8f5e1';
export const BSB_VENDOR_PATH='content/vendor/legacy/corpus.txt';
export const BSB_PUBLIC_PATH='public/data/corpus.txt';

function gitBlobSha(buffer){
  return createHash('sha1').update(`blob ${buffer.length}\0`).update(buffer).digest('hex');
}

export async function verifyVendorCorpus(){
  const manifest=JSON.parse(await readFile('content/migration/admissibility.json','utf8'));
  if(manifest.sourceRef!==BSB_SOURCE_REF){
    throw new Error(`BSB source ref changed: expected ${BSB_SOURCE_REF}, found ${manifest.sourceRef||'<missing>'}`);
  }
  const vendor=await readFile(BSB_VENDOR_PATH);
  const actual=gitBlobSha(vendor);
  if(actual!==BSB_GIT_BLOB_SHA){
    throw new Error(`LOCKED BSB CORPUS CHANGED: ${BSB_VENDOR_PATH} must remain byte-identical to ${manifest.sourceRepo}@${BSB_SOURCE_REF}/public/corpus.txt (expected Git blob ${BSB_GIT_BLOB_SHA}, found ${actual}). This file is never auto-repaired.`);
  }
  return vendor;
}

export async function verifyPublicCorpus(){
  const vendor=await verifyVendorCorpus();
  const generated=await readFile(BSB_PUBLIC_PATH);
  if(!vendor.equals(generated)){
    throw new Error(`${BSB_PUBLIC_PATH} differs from the locked BSB source. Run bun run repair:prelaunch to restore the generated copy.`);
  }
  return true;
}

export async function repairPublicCorpus(){
  const vendor=await verifyVendorCorpus();
  let generated=null;
  try{generated=await readFile(BSB_PUBLIC_PATH);}catch(error){if(error?.code!=='ENOENT')throw error;}
  if(generated&&vendor.equals(generated))return false;
  await mkdir('public/data',{recursive:true});
  await copyFile(BSB_VENDOR_PATH,BSB_PUBLIC_PATH);
  const repaired=await readFile(BSB_PUBLIC_PATH);
  if(!vendor.equals(repaired))throw new Error('BSB public-copy repair did not produce byte-identical output');
  console.log(`repaired ${BSB_PUBLIC_PATH} from locked vendor corpus`);
  return true;
}

if(import.meta.main){
  await verifyPublicCorpus();
  console.log(`BSB integrity passed: ${BSB_SOURCE_REF.slice(0,12)} / ${BSB_GIT_BLOB_SHA}`);
}
