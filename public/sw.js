const RELEASE='v6-2026-09-16-a';
const SHELL=`cs-${RELEASE}-shell`,RUNTIME=`cs-${RELEASE}-runtime`;
const ESSENTIAL=['/','/index.html','/styles.css','/app.js','/db.js','/manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(ESSENTIAL))) });
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(RUNTIME).then(c=>c.put(e.request,copy));return r}).catch(async()=>await caches.match(e.request)||await caches.match('/index.html')));return;
  }
  if(u.pathname.startsWith('/data/')){
    e.respondWith(caches.open(RUNTIME).then(async c=>{const cached=await c.match(e.request);if(cached)return cached;const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}));return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok)caches.open(RUNTIME).then(c=>c.put(e.request,r.clone()));return r})));
});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting();if(e.data==='CACHE_DATA')e.waitUntil(caches.open(RUNTIME).then(c=>c.addAll(['/data/catalog.json','/data/corpus.txt','/data/curriculum.md']))) });
