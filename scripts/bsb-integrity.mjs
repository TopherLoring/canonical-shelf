import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';

export const BSB_SOURCE_REF='25ea6acd012fb28e1427eb4a5e69e358824e1d96';
export const BSB_GIT_BLOB_SHA='186fb31859ad8274840aa7a4aca965d813c8f5e1';
export const BSB_VENDOR_PATH='content/vendor/legacy/corpus.txt';
export const BSB_PUBLIC_PATH='public/data/corpus.txt';

function gitBlobSha(buffer){
  return createHash('sha1').update(`blob ${buffer.length}\0`).update(buffer).digest('hex');
}

// Git may materialize text files with CRLF on Windows even when the committed
// blob uses LF. The published BSB corpus is locked to the LF blob above, so
// verification canonicalizes only line endings before hashing. No other byte
// is normalized or corrected.
export function canonicalBsbBytes(buffer){
  const source=Buffer.isBuffer(buffer)?buffer:Buffer.from(buffer);
  const text=source.toString('utf8');
  return Buffer.from(text.replace(/\r\n/g,'\n'),'utf8');
}

export async function verifyVendorCorpus(){
  const manifest=JSON.parse(await readFile('content/migration/admissibility.json','utf8'));
  if(manifest.sourceRef!==BSB_SOURCE_REF){
    throw new Error(`BSB source ref changed: expected ${BSB_SOURCE_REF}, found ${manifest.sourceRef||'<missing>'}`);
  }
  const workingTreeVendor=await readFile(BSB_VENDOR_PATH);
  const canonicalVendor=canonicalBsbBytes(workingTreeVendor);
  const actual=gitBlobSha(canonicalVendor);
  if(actual!==BSB_GIT_BLOB_SHA){
    throw new Error(`LOCKED BSB CORPUS CHANGED: ${BSB_VENDOR_PATH} must remain content-identical to ${manifest.sourceRepo}@${BSB_SOURCE_REF}/public/corpus.txt (expected canonical Git blob ${BSB_GIT_BLOB_SHA}, found ${actual}). Only CRLF↔LF checkout normalization is tolerated; Scripture content is never auto-repaired.`);
  }
  return canonicalVendor;
}

export async function verifyPublicCorpus(){
  const canonicalVendor=await verifyVendorCorpus();
  const generated=await readFile(BSB_PUBLIC_PATH);
  if(!canonicalVendor.equals(generated)){
    throw new Error(`${BSB_PUBLIC_PATH} differs from the locked published BSB bytes. Run bun run repair:prelaunch to restore the generated copy.`);
  }
  return true;
}

export async function repairPublicCorpus(){
  const canonicalVendor=await verifyVendorCorpus();
  let generated=null;
  try{generated=await readFile(BSB_PUBLIC_PATH);}catch(error){if(error?.code!=='ENOENT')throw error;}
  if(generated&&canonicalVendor.equals(generated))return false;
  await mkdir('public/data',{recursive:true});
  await writeFile(BSB_PUBLIC_PATH,canonicalVendor);
  const repaired=await readFile(BSB_PUBLIC_PATH);
  if(!canonicalVendor.equals(repaired))throw new Error('BSB public-copy repair did not produce the locked published bytes');
  console.log(`repaired ${BSB_PUBLIC_PATH} from locked BSB source in canonical LF form`);
  return true;
}

if(import.meta.main){
  await verifyPublicCorpus();
  console.log(`BSB integrity passed: ${BSB_SOURCE_REF.slice(0,12)} / ${BSB_GIT_BLOB_SHA}`);
}
