import {migrateLegacy} from './db.js';
import {initTheme} from './theme.js';
import {mountAppShell} from './ui/components/app-shell.js';
import {mountFrame} from './ui/components/frame.js';
import './study-controls.js';
import './feedback.js';
import './study-notes.js';

// The offline line lives in Profile (Data & privacy). The latest status is kept on window so Profile can show it when it opens.
const setStatus=(text,state)=>{
  window.canonPwaStatus={text,state:state||''};
  const status=document.querySelector('#pwa-status');
  if(status){status.textContent=text||'Online. Saved content is available offline.';status.dataset.state=state||''}
};

initTheme();
mountAppShell();
mountFrame();

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
