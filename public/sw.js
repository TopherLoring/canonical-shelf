const RELEASE='v6-2026-09-16-e';
const SHELL=`cs-${RELEASE}-shell`,DATA=`cs-${RELEASE}-data`;
const ESSENTIAL=['/','/index.html','/tokens.css','/styles.css','/learning.css','/bible.css','/bootstrap.js','/app.js','/db.js','/learning.js','/bible.js','/theologian.js','/manifest.webmanifest','/data/theology-policy.json'];
const DATA_ASSETS=['/data/catalog.json','/data/corpus.txt','/data/curriculum.md','/data/statement-of-faith.md','/data/theology-sources.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(ESSENTIAL)))});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.open(SHELL).then(c=>c.match('/index.html'))));return}
  if(ESSENTIAL.includes(u.pathname)){e.respondWith(caches.open(SHELL).then(async c=>(await c.match(e.request))||fetch(e.request)));return}
  if(u.pathname.startsWith('/data/')){e.respondWith(caches.open(DATA).then(async c=>{const cached=await c.match(e.request);if(cached)return cached;try{const r=await fetch(e.request);if(r.ok)await c.put(e.request,r.clone());return r}catch(err){for(const key of (await caches.keys()).filter(k=>k.endsWith('-data')).reverse()){const old=await caches.open(key).then(x=>x.match(e.request));if(old)return old}throw err}}));return}
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
self.addEventListener('message',e=>{if(e.data==='ACTIVATE_RELEASE')self.skipWaiting();if(e.data==='CACHE_DATA')e.waitUntil(caches.open(DATA).then(c=>c.addAll(DATA_ASSETS)))});
