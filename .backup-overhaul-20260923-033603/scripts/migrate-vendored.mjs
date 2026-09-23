import {readFile} from 'node:fs/promises';

const originalFetch=globalThis.fetch;
globalThis.fetch=async (input,init)=>{
  const url=typeof input==='string'?input:input instanceof URL?input.href:input?.url;
  const match=String(url||'').match(/^https:\/\/raw\.githubusercontent\.com\/TopherLoring\/the-canonical-shelf\/[0-9a-f]{40}\/public\/(.+)$/);
  if(!match) throw new Error(`production migration blocked unexpected network fetch: ${url}`);
  const local=`content/vendor/legacy/${match[1]}`;
  try{
    const body=await readFile(local);
    return new Response(body,{status:200});
  }catch(error){
    throw new Error(`vendored migration asset missing: ${local}`,{cause:error});
  }
};

try{
  await import('./migrate-legacy.mjs');
}finally{
  globalThis.fetch=originalFetch;
}
