const guide=document.querySelector('#guide'),body=document.querySelector('#guide-body');
if(!guide||!body)throw new Error('Theologian shell unavailable');

const esc=(value='')=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[char]));
let controller=null;

function renameText(root){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];let node;
  while((node=walker.nextNode()))nodes.push(node);
  for(const text of nodes){
    const next=String(text.nodeValue||'')
      .replace(/Ask the Guide/g,'Ask the Theologian')
      .replace(/How the Guide is reasoning/g,'How the Theologian is reasoning')
      .replace(/The Guide/g,'The Theologian')
      .replace(/the Guide/g,'the Theologian');
    if(next!==text.nodeValue)text.nodeValue=next;
  }
}

function enforceTheologianName(){
  const title=document.querySelector('#guide-title');if(title&&title.textContent!=='Theologian')title.textContent='Theologian';
  const open=document.querySelector('#guide-open');if(open){open.textContent='Theologian';open.setAttribute('aria-label','Open Theologian')}
  const close=document.querySelector('#guide-close');if(close)close.setAttribute('aria-label','Close Theologian');
  document.querySelectorAll('[data-study-guide]').forEach(button=>{button.textContent='Theologian';button.setAttribute('aria-label','Open Theologian for the current study activity')});
  document.querySelectorAll('[data-ask]').forEach(renameText);
  renameText(body);
}

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
  return `<form id="guide-form"><label for="guide-q">Ask the Theologian a study question</label><textarea id="guide-q" name="question" rows="3">${esc(question)}</textarea><button class="button">Ask</button></form>`;
}

function statusMarkup(message,state='loading'){
  return `<p class="cloud-theologian-status" data-cloud-theologian-status data-state="${esc(state)}" role="status" aria-live="polite">${esc(message)}</p>`;
}

function setStatus(message,state='loading'){
  let status=body.querySelector('[data-cloud-theologian-status]');
  if(!status){
    const form=body.querySelector('#guide-form');
    if(form)form.insertAdjacentHTML('afterend',statusMarkup(message,state));
    else body.insertAdjacentHTML('afterbegin',statusMarkup(message,state));
    status=body.querySelector('[data-cloud-theologian-status]');
  }
  if(status){status.textContent=message;status.dataset.state=state}
}

function renderCloud(question,result){
  body.dataset.cloudQuestion=question;
  body.dataset.cloudPending='';
  const evidence=Array.isArray(result.evidence)?result.evidence:[];
  const guardrails=Array.isArray(result.guardrails)?result.guardrails:[];
  body.innerHTML=`${formMarkup(question)}
    <section class="evidence cloud-theologian-answer">
      <div class="badge-row"><span class="badge">Theologian</span><span class="badge">cloud grounded</span>${result.lgbtqResearchApplied?'<span class="badge">LGBTQ research applied</span>':''}</div>
      <div class="cloud-theologian-copy">${answerMarkup(result.answer)}</div>
    </section>
    ${evidence.length?`<section class="evidence"><h3>Evidence and connections</h3>${evidence.map(evidenceMarkup).join('')}</section>`:''}
    <details class="evidence"><summary>Guardrails used for this answer</summary><ul>${guardrails.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><p class="meta">The current question and user-facing page context are processed by Canonical Shelf's Cloudflare Worker for this response. Canonical Shelf does not write the conversation to its database.</p></details>
    <div class="evidence"><span class="badge">cloud synthesis</span><span class="badge">local evidence fallback available</span></div>`;
  guide.hidden=false;
  enforceTheologianName();
}

function markFallback(question,message){
  body.dataset.cloudQuestion=question;
  body.dataset.cloudPending='';
  setStatus(message||'Cloud synthesis is unavailable. Canonical Shelf is showing its local evidence fallback.','fallback');
  enforceTheologianName();
}

async function requestCloud(question){
  controller?.abort();
  controller=new AbortController();
  body.dataset.cloudPending=question;
  setStatus('Building a grounded response from the BSB, Canonical Shelf content, the Statement of Faith, and vetted theology research…','loading');
  try{
    const response=await fetch('/api/theologian',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({question,context:{path:`${location.pathname}${location.search}`}}),
      signal:controller.signal
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||result?.fallback)throw new Error(result?.error||`Cloud synthesis unavailable (${response.status})`);
    if(body.querySelector('#guide-q')?.value.trim()!==question)return;
    renderCloud(question,result);
  }catch(error){
    if(error?.name==='AbortError')return;
    console.warn('Cloud Theologian fallback',error);
    markFallback(question,'Cloud synthesis is unavailable right now. Showing Canonical Shelf’s local evidence response instead.');
  }
}

function maybeUpgrade(){
  enforceTheologianName();
  const form=body.querySelector('#guide-form'),textarea=form?.querySelector('#guide-q');
  const question=textarea?.value?.trim()||'';
  if(!question)return;
  if(body.dataset.cloudQuestion===question||body.dataset.cloudPending===question)return;
  void requestCloud(question);
}

const observer=new MutationObserver(()=>queueMicrotask(maybeUpgrade));
observer.observe(body,{childList:true,subtree:true,characterData:true});

const shellObserver=new MutationObserver(()=>queueMicrotask(enforceTheologianName));
shellObserver.observe(document.body,{childList:true,subtree:true});

document.addEventListener('submit',event=>{
  if(event.target?.id!=='guide-form')return;
  controller?.abort();
  body.dataset.cloudQuestion='';
  body.dataset.cloudPending='';
  const question=String(new FormData(event.target).get('question')||'').trim();
  if(question)setTimeout(()=>{enforceTheologianName();maybeUpgrade()},0);
},true);

document.addEventListener('canonical-route-rendered',()=>requestAnimationFrame(enforceTheologianName));
document.addEventListener('canonical-app-ready',enforceTheologianName);
enforceTheologianName();
setTimeout(maybeUpgrade,0);