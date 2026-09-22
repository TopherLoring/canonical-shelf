let controller=null;

export async function requestCloudTheologian(question,{path=`${location.pathname}${location.search}`}={}){
  const text=String(question||'').trim();
  if(!text)throw new Error('Question is required');
  controller?.abort();
  controller=new AbortController();
  const response=await fetch('/api/theologian',{
    method:'POST',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({question:text,context:{path}}),
    signal:controller.signal
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok||result?.fallback)throw new Error(result?.error||`Cloud synthesis unavailable (${response.status})`);
  return result;
}

export function cancelCloudTheologian(){
  controller?.abort();
  controller=null;
}
