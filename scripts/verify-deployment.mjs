const origin=(process.env.CANONICAL_ORIGIN||'').replace(/\/$/,'');
const expectedRelease=process.env.GITHUB_SHA||'';
if(!origin)throw new Error('CANONICAL_ORIGIN is required for deployment verification');
if(!expectedRelease)throw new Error('GITHUB_SHA is required for deployment verification');

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function fetchWithRetry(path,{attempts=10,delay=3000,init={}}={}){
  let lastError=null;
  for(let attempt=1;attempt<=attempts;attempt++){
    try{
      const response=await fetch(`${origin}${path}`,{
        ...init,
        headers:{'cache-control':'no-cache',...(init.headers||{})},
        redirect:'follow'
      });
      if(response.ok)return response;
      const detail=await response.text().catch(()=>'');
      lastError=new Error(`${path} returned ${response.status}${detail?`: ${detail.slice(0,240)}`:''}`);
    }catch(error){lastError=error}
    if(attempt<attempts)await wait(delay);
  }
  throw lastError||new Error(`${path} failed after ${attempts} attempts`);
}

const healthResponse=await fetchWithRetry('/api/health');
const health=await healthResponse.json();
if(health?.service!=='the-canonical-shelf')throw new Error(`health check reported unexpected service ${health?.service}`);
if(health?.release!==expectedRelease)throw new Error(`deployed release ${health?.release||'(missing)'} does not match GitHub SHA ${expectedRelease}`);
for(const binding of ['assets','db','ai'])if(health?.bindings?.[binding]!==true)throw new Error(`health check reports missing ${binding} binding`);
if(health?.origin!==origin)throw new Error(`health check origin ${health?.origin||'(missing)'} does not match ${origin}`);

const rootResponse=await fetchWithRetry('/');
const rootType=rootResponse.headers.get('content-type')||'';
const rootBody=await rootResponse.text();
if(!rootType.includes('text/html')||!/<html[\s>]/i.test(rootBody)||!/Canonical Shelf/i.test(rootBody))throw new Error('/ did not return the Canonical Shelf compatibility shell');

for(const route of ['home','course','bible','topics','practice','search']){
  const path=`/${route}`;
  const response=await fetchWithRetry(path);
  const type=response.headers.get('content-type')||'';
  const body=await response.text();
  if(!type.includes('text/html'))throw new Error(`${path} did not return HTML (${type||'no content-type'})`);
  if(!/<html[\s>]/i.test(body)||!/Canonical Shelf/i.test(body))throw new Error(`${path} did not return a Canonical Shelf document`);
  if(!body.includes(`data-route-document="${route}"`))throw new Error(`${path} resolved to generic fallback instead of its route-owned ${route} document`);
  if(!body.includes(`data-route-content="${route}"`))throw new Error(`${path} is missing its bounded ${route} enhancement region`);
}

for(const [route,needle] of [
  ['/llms.txt','Canonical Shelf'],
  ['/data/statement-of-faith.md','Statement'],
  ['/data/theology-policy.json','normativeCeiling'],
  ['/data/catalog.json','courses']
]){
  const response=await fetchWithRetry(route);
  const body=await response.text();
  if(!body.includes(needle))throw new Error(`${route} is reachable but missing expected release content`);
}

const theologianResponse=await fetchWithRetry('/api/theologian',{
  attempts:4,
  delay:2500,
  init:{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({question:'What is the Decalogue?',context:{path:'/home',smokeTest:true}})
  }
});
const theologian=await theologianResponse.json().catch(()=>null);
if(theologian?.mode!=='cloud')throw new Error(`live Theologian smoke did not return cloud synthesis mode (${theologian?.mode||'missing'})`);
if(typeof theologian?.answer!=='string'||theologian.answer.trim().length<20)throw new Error('live Theologian smoke returned no substantive answer');
if(!Array.isArray(theologian?.guardrails)||!theologian.guardrails.some(item=>/Berean Standard Bible/i.test(String(item))))throw new Error('live Theologian smoke did not report the BSB grounding guardrail');
if(!Array.isArray(theologian?.evidence))throw new Error('live Theologian smoke returned no evidence collection');

console.log(`production smoke gate passed for ${origin} at release ${expectedRelease}: route-owned documents, generated content, bindings, and live cloud Theologian verified`);
