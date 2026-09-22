const origin=(process.env.CANONICAL_ORIGIN||'').replace(/\/$/,'');
const expectedRelease=process.env.GITHUB_SHA||'';
if(!origin)throw new Error('CANONICAL_ORIGIN is required for deployment verification');
if(!expectedRelease)throw new Error('GITHUB_SHA is required for deployment verification');

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function fetchWithRetry(path,{attempts=10,delay=3000}={}){
  let lastError=null;
  for(let attempt=1;attempt<=attempts;attempt++){
    try{
      const response=await fetch(`${origin}${path}`,{headers:{'cache-control':'no-cache'},redirect:'follow'});
      if(response.ok)return response;
      lastError=new Error(`${path} returned ${response.status}`);
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

for(const route of ['/','/course','/bible','/topics','/practice']){
  const response=await fetchWithRetry(route);
  const type=response.headers.get('content-type')||'';
  const body=await response.text();
  if(!type.includes('text/html'))throw new Error(`${route} did not return HTML (${type||'no content-type'})`);
  if(!/<html[\s>]/i.test(body)||!/Canonical Shelf/i.test(body))throw new Error(`${route} did not return the Canonical Shelf app shell`);
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

console.log(`production smoke gate passed for ${origin} at release ${expectedRelease}`);
