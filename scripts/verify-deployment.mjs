const origin=(process.env.CANONICAL_ORIGIN||'').replace(/\/$/,'');
const expectedRelease=process.env.GITHUB_SHA||'';
if(!origin)throw new Error('CANONICAL_ORIGIN is required for deployment verification');
if(!expectedRelease)throw new Error('GITHUB_SHA is required for deployment verification');

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function fetchWithRetry(path,{attempts=10,delay=3000,init={}}={}){
  let lastError=null;
  for(let attempt=1;attempt<=attempts;attempt++){
    try{
      const response=await fetch(`${origin}${path}`,{redirect:'follow',...init,headers:{'cache-control':'no-cache',...(init.headers||{})}});
      if(response.ok)return response;
      const detail=await response.text().catch(()=>'');
      lastError=new Error(`${path} returned ${response.status}${detail?`: ${detail.slice(0,700)}`:''}`);
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

for(const route of ['/','/home','/course','/bible','/topics','/practice']){
  const response=await fetchWithRetry(route);
  const type=response.headers.get('content-type')||'';
  const body=await response.text();
  if(!type.includes('text/html'))throw new Error(`${route} did not return HTML (${type||'no content-type'})`);
  if(!/<html[\s>]/i.test(body)||!/Canonical Shelf/i.test(body))throw new Error(`${route} did not return the Canonical Shelf app shell`);
  if(!body.includes('/locked-library-baseline.css'))throw new Error(`${route} is serving an app shell without the approved Library First correction layer`);
  if(!body.includes('>Theologian</'))throw new Error(`${route} is serving the legacy Guide shell instead of Theologian`);
}

for(const [route,needle] of [
  ['/llms.txt','Canonical Shelf'],
  ['/data/statement-of-faith.md','Statement'],
  ['/data/theology-policy.json','normativeCeiling'],
  ['/data/catalog.json','courses'],
  ['/locked-library-baseline.css','Library First baseline'],
  ['/locked-home.js','The Canonical <em>Shelf</em>']
]){
  const response=await fetchWithRetry(route);
  const body=await response.text();
  if(!body.includes(needle))throw new Error(`${route} is reachable but missing expected release content`);
}

// A configured AI binding is not sufficient. Production must prove that a real
// grounded Cloud Theologian inference succeeds after every deployment.
const theologianResponse=await fetchWithRetry('/api/theologian',{
  attempts:4,
  delay:4000,
  init:{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({
      question:'What is the purpose of the Ten Commandments in Exodus 20?',
      context:{path:'/bible?book=2&chapter=20'}
    })
  }
});
const theologian=await theologianResponse.json().catch(()=>null);
if(theologian?.mode!=='cloud')throw new Error(`Theologian smoke check did not return cloud mode: ${JSON.stringify(theologian).slice(0,1000)}`);
if(typeof theologian?.answer!=='string'||theologian.answer.trim().length<40)throw new Error('Theologian smoke check returned no substantive answer');
if(!Array.isArray(theologian?.evidence)||theologian.evidence.length===0)throw new Error('Theologian smoke check returned no grounding evidence');
if(!Array.isArray(theologian?.guardrails)||!theologian.guardrails.some(item=>/Berean Standard Bible/i.test(String(item))))throw new Error('Theologian smoke check did not report the BSB guardrail');

console.log(`production smoke gate passed for ${origin} at release ${expectedRelease}; Cloud Theologian inference verified`);