const RELEASE='auto-56130baaacc9';
const SHELL=`cs-${RELEASE}-shell`,DATA=`cs-${RELEASE}-data`;
const ESSENTIAL=['/','/index.html','/about.html','/privacy.html','/data-retention.html','/storage.html','/terms.html','/safety.html','/styles.css','/theme.css','/theme-list.js','/fonts/fonts.css','/manifest.webmanifest','/logo.png','/logo-maskable.png','/favicon.svg'];
const DATA_ASSETS=['/data/catalog.json','/data/corpus.txt','/data/curriculum.md','/data/statement-of-faith.md','/data/theologian-belief-context.md','/data/theology-policy.json','/data/theologian-credentials.json','/data/theologian-sources.json'];
self.addEventListener('install',event=>{event.waitUntil(Promise.all([caches.open(SHELL).then(cache=>cache.addAll(ESSENTIAL)),self.skipWaiting()]))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('cs-')&&key!==SHELL&&key!==DATA).map(key=>caches.delete(key))))]))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);if(url.origin!==location.origin)return;
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.open(SHELL).then(cache=>cache.match('/index.html'))));return}
  // Network first for shell files: always current when online; the cache only serves when offline.
  if(ESSENTIAL.includes(url.pathname)){event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(SHELL).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.open(SHELL).then(cache=>cache.match(event.request))));return}
  if(url.pathname.startsWith('/data/')){event.respondWith(caches.open(DATA).then(async cache=>{const cached=await cache.match(event.request);if(cached)return cached;try{const response=await fetch(event.request);if(response.ok)await cache.put(event.request,response.clone());return response;}catch{return caches.match(event.request);}}));return}
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_RELEASE')self.skipWaiting();if(event.data==='CACHE_DATA')event.waitUntil(caches.open(DATA).then(cache=>cache.addAll(DATA_ASSETS)))});