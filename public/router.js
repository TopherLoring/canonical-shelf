const ROOTS=new Set(['home','course','bible','topics','practice','search']);
export function legacyHashToPath(hash=location.hash){if(!hash.startsWith('#/'))return null;const raw=hash.slice(1);return raw==='/'?'/home':raw}
export function normalizePath(pathname=location.pathname){const first=pathname.replace(/^\/+|\/+$/g,'').split('/')[0]||'home';return ROOTS.has(first)?first:'home'}
export function currentRoute(){return normalizePath()}
export function currentParams(){return new URLSearchParams(location.search)}
export function nativeHref(value){if(!value)return value;if(value.startsWith('#/'))return value.slice(1);return value}
export function canonicalizeLinks(root=document){for(const a of root.querySelectorAll('a[href^="#/"]'))a.setAttribute('href',nativeHref(a.getAttribute('href')))}
export function navigate(target,{replace=false}={}){const url=nativeHref(target);if(!url)return;history[replace?'replaceState':'pushState']({},'',url);window.dispatchEvent(new PopStateEvent('popstate'))}
export function installRouter(onNavigate){const legacy=legacyHashToPath();if(legacy)history.replaceState({},'',legacy);document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const u=new URL(a.href,location.href);if(u.origin!==location.origin)return;e.preventDefault();navigate(u.pathname+u.search)});window.addEventListener('popstate',onNavigate);onNavigate()}
