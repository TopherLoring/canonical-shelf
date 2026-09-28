// Top bar behavior, loaded before the rest of the app so the controls respond immediately.
// Search: an icon that expands into the field, and collapses again when empty.
{
  const form=document.querySelector('#global-search'),toggle=form?.querySelector('.search-toggle'),input=form?.querySelector('#q');
  const setOpen=open=>{if(!form)return;form.dataset.open=String(open);toggle?.setAttribute('aria-expanded',String(open));if(open)input?.focus({preventScroll:true})};
  toggle?.addEventListener('click',()=>{if(form.dataset.open==='true'&&input.value.trim())form.requestSubmit();else setOpen(form.dataset.open!=='true')});
  input?.addEventListener('keydown',e=>{if(e.key==='Escape'){input.value='';setOpen(false);toggle?.focus()}});
  input?.addEventListener('blur',()=>setTimeout(()=>{if(!input.value.trim()&&!form.contains(document.activeElement))setOpen(false)},120));
}
