const RELEASE='v7-v5-polish-2026-09-19-a';
const SHELL=`cs-${RELEASE}-shell`,DATA=`cs-${RELEASE}-data`;
const ESSENTIAL=['/','/index.html','/tokens.css','/styles.css','/learning.css','/bible.css','/bootstrap.js','/theme.js','/orientation.js','/app.js','/account-ui.js','/db.js','/sync.js','/generated/account.js','/learning.js','/bible.js','/theologian.js','/manifest.webmanifest','/icon.svg','/data/theology-policy.json'];
const DATA_ASSETS=['/data/catalog.json','/data/corpus.txt','/data/curriculum.md','/data/statement-of-faith.md','/data/theology-sources.json'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(ESSENTIAL)))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('cs-')&&key!==SHELL&&key!==DATA).map(key=>caches.delete(key))))]))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.open(SHELL).then(cache=>cache.match('/index.html'))));return}
  if(ESSENTIAL.includes(url.pathname)){event.respondWith(caches.open(SHELL).then(async cache=>(await cache.match(event.request))||fetch(event.request)));return}
  if(url.pathname.startsWith('/data/')){event.respondWith(caches.open(DATA).then(async cache=>{const cached=await cache.match(event.request);if(cached)return cached;try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response}catch(error){for(const key of (await caches.keys()).filter(item=>item.endsWith('-data')).reverse()){const old=await caches.open(key).then(store=>store.match(event.request));if(old)return old}throw error}}));return}
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_RELEASE')self.skipWaiting();if(event.data==='CACHE_DATA')event.waitUntil(caches.open(DATA).then(cache=>cache.addAll(DATA_ASSETS)))});
