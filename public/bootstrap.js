import {migrateLegacy} from './db.js';
const status=document.querySelector('#pwa-status');
const setStatus=(text,state)=>{if(!status)return;status.textContent=text;status.dataset.state=state||''};
const roots=new Set(['home','course','bible','topics','practice','search']);
const canonical=()=>`${location.pathname==='/'?'/home':location.pathname}${location.search}`;
const isAppPath=path=>roots.has(path.replace(/^\/+|\/+$/g,'').split('/')[0]||'home');
const hashRoute=()=>location.hash.startsWith('#/')?location.hash.slice(1):null;
function renderNative(path,{push=false}={}){
  if(push)history.pushState({},'',path);
  history.replaceState({},'',`${path}#${path}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  history.replaceState({},'',path);
}
const incomingHash=hashRoute();
if(incomingHash)history.replaceState({},'',incomingHash);
const initial=canonical();
history.replaceState({},'',`${initial}#${initial}`);
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;
  const raw=a.getAttribute('href')||'';let path=null;
  if(raw.startsWith('#/'))path=raw.slice(1);else{const u=new URL(a.href,location.href);if(u.origin===location.origin&&isAppPath(u.pathname))path=u.pathname+u.search}
  if(!path)return;e.preventDefault();renderNative(path,{push:true});
},true);
window.addEventListener('popstate',()=>{if(!location.hash&&isAppPath(location.pathname))renderNative(canonical())});
window.addEventListener('hashchange',()=>{const path=hashRoute();if(path)queueMicrotask(()=>history.replaceState({},'',path))});
try{
  const data=await fetch('/data/catalog.json').then(r=>r.ok?r.json():null);
  if(data)await migrateLegacy((data.lessons||[]).map(l=>l.id),data.masteryIds||[]);
}catch(err){console.warn('Legacy progress migration skipped',err)}
if('serviceWorker'in navigator){
  try{
    const reg=await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;reg.active?.postMessage('CACHE_DATA');
    setStatus(navigator.onLine?'Offline access ready':'Offline mode active','ready');
  }catch(err){console.warn('Offline setup failed',err);setStatus('Offline setup unavailable; the current session still works online.','error')}
}else setStatus('Offline installation is not supported by this browser.','unsupported');
window.addEventListener('online',()=>setStatus('Offline access ready','ready'));
window.addEventListener('offline',()=>setStatus('Offline mode active','ready'));
await import('./app.js');
history.replaceState({},'',initial);
