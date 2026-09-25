import {migrateLegacy} from './db.js';
import {initTheme} from './theme.js';
import './study-controls.js';
import './feedback.js';
import './personal-study.js';

const status=document.querySelector('#pwa-status');
const setStatus=(text,state)=>{if(!status)return;status.textContent=text;status.dataset.state=state||''};

initTheme();

if(location.hash.startsWith('#/'))history.replaceState({},'',location.hash.slice(1));
try{
  const data=await fetch('/data/catalog.json').then(r=>r.ok?r.json():null);
  if(data)await migrateLegacy((data.lessons||[]).map(l=>l.id),data.masteryIds||[]);
}catch(err){console.warn('Legacy progress migration skipped',err)}

// Core navigation and controls must never wait for service-worker activation.
await import('./app.js');
await import('./theologian-chat.js');
document.dispatchEvent(new Event('canonical-app-ready'));
for(const id of ['guide-open','progress-open']){
  const control=document.querySelector(`#${id}`);
  if(control){control.disabled=false;control.removeAttribute('aria-disabled')}
}

try{
  await import('./account-ui.js');
  const accountOpen=document.querySelector('#account-open');
  if(accountOpen){accountOpen.disabled=false;accountOpen.removeAttribute('aria-disabled')}
}catch(err){
  console.warn('Account controls unavailable',err);
}

async function setupOffline(){
  if(!('serviceWorker'in navigator)){
    setStatus('Offline installation is not supported by this browser.','unsupported');
    return;
  }
  const hadController=Boolean(navigator.serviceWorker.controller);
  let reloading=false;
  if(hadController){
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(reloading)return;
      reloading=true;
      location.reload();
    },{once:true});
  }
  try{
    const reg=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});
    const activate=worker=>worker?.postMessage?.('ACTIVATE_RELEASE');
    if(reg.waiting)activate(reg.waiting);
    reg.addEventListener('updatefound',()=>{
      const worker=reg.installing;
      worker?.addEventListener('statechange',()=>{if(worker.state==='installed')activate(worker)});
    });
    reg.update().catch(()=>{});
    const ready=await navigator.serviceWorker.ready;
    ready.active?.postMessage('CACHE_DATA');
    setStatus(navigator.onLine?'':'Offline — showing saved content','ready');
  }catch(err){
    console.warn('Offline setup failed',err);
    setStatus('Offline setup unavailable; the current session still works online.','error');
  }
}

setupOffline();
window.addEventListener('online',()=>setStatus('','ready'));
window.addEventListener('offline',()=>setStatus('Offline — showing saved content','ready'));
