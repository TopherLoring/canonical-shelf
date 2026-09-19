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

if('serviceWorker'in navigator){
  try{
    const reg=await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    reg.active?.postMessage('CACHE_DATA');
    setStatus(navigator.onLine?'Offline access ready':'Offline mode active','ready');
  }catch(err){
    console.warn('Offline setup failed',err);
    setStatus('Offline setup unavailable; the current session still works online.','error');
  }
}else setStatus('Offline installation is not supported by this browser.','unsupported');

window.addEventListener('online',()=>setStatus('Offline access ready','ready'));
window.addEventListener('offline',()=>setStatus('Offline mode active','ready'));

await import('./app.js');
document.dispatchEvent(new Event('canonical-app-ready'));
await import('./account-ui.js');

const accountOpen=document.querySelector('#account-open');
if(accountOpen){accountOpen.disabled=false;accountOpen.removeAttribute('aria-disabled')}
const guideOpen=document.querySelector('#guide-open');
if(guideOpen){guideOpen.disabled=false;guideOpen.removeAttribute('aria-disabled')}
