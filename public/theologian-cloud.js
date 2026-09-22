const guide=document.querySelector('#guide'),body=document.querySelector('#guide-body');
if(!guide||!body)throw new Error('Theologian shell unavailable');

const esc=(value='')=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[char]));
let controller=null;

function answerMarkup(answer){
  const blocks=String(answer||'').trim().split(/\n\s*\n/).filter(Boolean);
  return blocks.map(block=>`<p>${esc(block).replace(/\n/g,'<br>')}</p>`).join('');
}

function evidenceMarkup(item){
  const label=esc(item.label||'Evidence'),detail=esc(item.detail||''),kind=esc(item.type||'source'),evidence=esc(item.evidence||'Canonical Shelf evidence');
  const href=typeof item.href==='string'&&item.href?item.href:null;
  const safeHref=href&&(/^https?:\/\//i.test(href)||href.startsWith('/'))?esc(href):null;
  return `<article class="result"><p class="eyebrow">${kind} · ${evidence}</p><h4>${safeHref?`<a href="${safeHref}"${/^https?:\/\//i.test(href)?' target="_blank" rel="noreferrer"':''}>${label}</a>`:label}</h4>${detail?`<p>${detail}</p>`:''}${item.limits?`<p><strong>Limit:</strong> ${esc(item.limits)}</p>`:''}</article>`;
}

function formMarkup(question){
  return `<form id="guide-form"><label for="guide-q">Ask a study question</label><textarea id="guide-q" name="question" rows="3">${esc(question)}</textarea><button class="button">Ask</button></form>`;
}

function renderCloud(question,result){
  body.dataset.cloudQuestion=question;
  body.dataset.cloudPending='';
  const evidence=Array.isArray(result.evidence)?result.evidence:[];
  const guardrails=Array.isArray(result.guardrails)?result.guardrails:[];
  body.innerHTML=`${formMarkup(question)}
    <section class="evidence cloud-theologian-answer">
      <div class="badge-row"><span class="badge">Cloud Theologian</span><span class="badge">grounded response</span>${result.lgbtqResearchApplied?'<span class="badge">LGBTQ research applied</span>':''}</div>
      <div class="cloud-theologian-copy">${answerMarkup(result.answer)}</div>
    </section>
    ${evidence.length?`<section class="evidence"><h3>Evidence and connections</h3>${evidence.map(evidenceMarkup).join('')}</section>`:''}
    <details class="evidence"><summary>Guardrails used for this answer</summary><ul>${guardrails.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><p class="meta">The question and current page context are sent to Canonical Shelf's Cloudflare Worker for this response. Canonical Shelf does not write the conversation to its database.</p></details>
    <div class="evidence"><span class="badge">cloud synthesis</span><span class="badge">deterministic fallback available</span></div>`;
  guide.hidden=false;
}

function markFallback(question,message){
  body.dataset.cloudQuestion=question;
  body.dataset.cloudPending='';
  let status=body.querySelector('[data-cloud-theologian-status]');
  if(!status){status=document.createElement('p');status.dataset.cloudTheologianStatus='';status.className='meta';body.append(status)}
  status.textContent=message||'Cloud synthesis is unavailable. Showing Canonical Shelf’s deterministic evidence mode.';
}

async function requestCloud(question){
  controller?.abort();
  controller=new AbortController();
  body.dataset.cloudPending=question;
  let status=body.querySelector('[data-cloud-theologian-status]');
  if(!status){status=document.createElement('p');status.dataset.cloudTheologianStatus='';status.className='meta';body.append(status)}
  status.textContent='Building a grounded response from the BSB, Canonical Shelf content, the Statement of Faith, and vetted theology research…';
  try{
    const response=await fetch('/api/theologian',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({question,context:{path:`${location.pathname}${location.search}`}}),
      signal:controller.signal
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||result?.fallback)throw new Error(result?.error||'Cloud synthesis unavailable');
    if(body.querySelector('#guide-q')?.value.trim()!==question)return;
    renderCloud(question,result);
  }catch(error){
    if(error?.name==='AbortError')return;
    markFallback(question,'Cloud synthesis is unavailable. Showing Canonical Shelf’s deterministic evidence mode instead.');
  }
}

function maybeUpgrade(){
  const form=body.querySelector('#guide-form'),textarea=form?.querySelector('#guide-q');
  const question=textarea?.value?.trim()||'';
  if(!question)return;
  if(body.dataset.cloudQuestion===question||body.dataset.cloudPending===question)return;
  void requestCloud(question);
}

const observer=new MutationObserver(()=>queueMicrotask(maybeUpgrade));
observer.observe(body,{childList:true,subtree:true});

document.addEventListener('submit',event=>{
  if(event.target?.id!=='guide-form')return;
  controller?.abort();
  body.dataset.cloudQuestion='';
  body.dataset.cloudPending='';
  setTimeout(maybeUpgrade,0);
},true);

setTimeout(maybeUpgrade,0);
