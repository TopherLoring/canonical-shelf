// Optional, explicitly requested web research. Paid plans/overages are never accepted.
export function requestsWebSearch(question:string){
  return /^(?:please\s+|(?:can|could|would) you\s+(?:please\s+)?)?(search|browse|check|look up|look for|find)\b[\s\S]{0,100}\b(web|online|internet)\b/i.test(question.trim());
}

async function providerJson(path:string,key:string,body?:unknown){
  const response=await fetch(`https://api.tavily.com/${path}`,{
    method:body?'POST':'GET',redirect:'error',
    headers:{Authorization:`Bearer ${key}`,...(body?{'Content-Type':'application/json'}:{})},
    ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(8000)
  });
  if(!response.ok||!response.body)throw new Error('Search provider unavailable');
  const reader=response.body.getReader();const chunks:Uint8Array[]=[];let length=0;
  try{
    while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>1_000_000)throw new Error('Search response too large');chunks.push(value)}
  }finally{await reader.cancel()}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function searchFreeWeb(question:string,key?:string){
  if(!requestsWebSearch(question))return{status:'not-requested',results:[]};
  if(!key)return{status:'not-configured',results:[]};
  try{
    const usage=await providerJson('usage',key),account=usage?.account,k=usage?.key;
    const finiteCount=(n:unknown)=>Number.isInteger(n)&&Number(n)>=0;
    if(!['researcher','free'].includes(String(account?.current_plan).toLowerCase()) ||
      (account?.paygo_limit!==0&&account?.paygo_limit!==null) || account?.paygo_usage!==0 ||
      !finiteCount(account?.plan_usage)||!finiteCount(account?.plan_limit)||
      account.plan_usage>=Math.min(account.plan_limit,1000) ||
      !finiteCount(k?.usage) || (k?.limit!==null&&(!finiteCount(k?.limit)||k.usage>=k.limit))){
      return{status:'free-allowance-unavailable',results:[]};
    }
    // Only the current explicit research request goes to Tavily. No chat history,
    // learner state, account identifiers, journal, or other private context.
    const data=await providerJson('search',key,{
      query:question.slice(0,1400),search_depth:'basic',auto_parameters:false,
      max_results:3,include_answer:false,include_raw_content:'text',include_usage:true
    });
    const results=[];
    for(const item of Array.isArray(data?.results)?data.results.slice(0,3):[]){
      let url:URL;try{url=new URL(item.url)}catch{continue}
      if(url.protocol!=='https:'||url.username||url.password)continue;
      results.push({title:String(item.title||url.hostname).slice(0,200),url:url.href,
        text:String(item.raw_content||item.content||'').slice(0,3500)});
    }
    return{status:results.length?'searched':'no-results',results};
  }catch{return{status:'unavailable',results:[]}}
}
