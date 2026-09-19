function syncStudyChrome(){
  const active=document.body.classList.contains('study-focus-active');
  for(const node of document.querySelectorAll('.masthead,.primary,#pwa-status,#guide-open'))node.toggleAttribute('inert',active);
}

function ensureStudyGuideControl(){
  syncStudyChrome();
  const utilities=document.querySelector('.study-focus__utilities');
  if(!utilities||utilities.querySelector('[data-study-guide]'))return;
  const button=document.createElement('button');
  button.type='button';
  button.dataset.studyGuide='';
  button.dataset.ask='What can you help me study in this lesson?';
  button.textContent='Ask the Guide';
  const notes=utilities.querySelector('[data-toggle-apparatus]');
  utilities.insertBefore(button,notes||utilities.firstChild);
}

const schedule=()=>requestAnimationFrame(ensureStudyGuideControl);

document.addEventListener('canonical-app-ready',schedule);
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(link||event.target.closest('[data-exit-lesson]'))schedule();
});
window.addEventListener('popstate',schedule);
window.addEventListener('pageshow',schedule);
setTimeout(ensureStudyGuideControl,0);
