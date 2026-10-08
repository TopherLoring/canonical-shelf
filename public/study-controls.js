function syncStudyChrome(){
  const active=document.body.classList.contains('study-focus-active');
  for(const node of document.querySelectorAll('.cs-top,.cs-tabbar,#pwa-status'))node.toggleAttribute('inert',active);
}

document.addEventListener('canonical-route-rendered',syncStudyChrome);
document.addEventListener('canonical-app-ready',syncStudyChrome);
window.addEventListener('pageshow',syncStudyChrome);
setTimeout(syncStudyChrome,0);
