const panel=document.querySelector('#account-panel'),body=document.querySelector('#account-body'),open=document.querySelector('#account-open'),close=document.querySelector('#account-close');
let apiPromise=null,busy=false;
const api=()=>apiPromise||=(import('/generated/account.js'));
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function status(message){body.innerHTML=`<p class="notice" role="status">${esc(message)}</p>`}
async function render(){
  const a=await api(),session=await a.accountSession();
  if(!session){
    body.innerHTML=`<p>Your course works fully without an account. Add a passkey only if you want automatic cross-device progress sync and recovery.</p><p><button class="button" data-account="enable">Enable cross-device sync</button></p><p><button class="button" data-account="signin">Sign in with an existing passkey</button></p><p class="meta">Export/import remains available from Practice as a manual backup.</p>`;
    return;
  }
  const anonymous=!!session.user?.isAnonymous,last=localStorage.getItem('canon.sync.last');
  body.innerHTML=`<p><strong>${anonymous?'Sync setup in progress':'Sync account active'}</strong></p><p>${anonymous?'Finish by adding a recovery passkey before relying on this account on another device.':'This device can reconcile progress with your other signed-in devices.'}</p>${last?`<p class="meta">Last synced ${esc(new Date(last).toLocaleString())}</p>`:''}<p><button class="button" data-account="${anonymous?'finish':'sync'}">${anonymous?'Add recovery passkey':'Sync now'}</button></p><p><button class="button" data-account="signout">Sign out on this device</button></p><details><summary>Data controls</summary><p>Deleting the synced copy does not delete progress stored on this device.</p><button class="button" data-account="delete-remote">Delete synced progress</button></details>`;
}
async function perform(action){
  if(busy)return;busy=true;try{
    const a=await api();
    if(action==='enable'){status('Creating a private sync session and opening passkey setup…');const result=await a.enableCrossDeviceSync();if(result.status==='synced')localStorage.setItem('canon.sync.last',new Date().toISOString())}
    if(action==='finish'){status('Opening passkey setup…');await a.addRecoveryPasskey();const result=await a.syncProgress();if(result.status==='synced'){localStorage.setItem('canon.sync.enabled','1');localStorage.setItem('canon.sync.last',new Date().toISOString())}}
    if(action==='signin'){status('Choose your Canonical Shelf passkey…');await a.signInWithPasskey();localStorage.setItem('canon.sync.enabled','1');localStorage.setItem('canon.sync.last',new Date().toISOString());window.dispatchEvent(new CustomEvent('canonical-sync-restored'))}
    if(action==='sync'){status('Synchronizing progress…');const result=await a.syncProgress();if(result.status==='synced'){localStorage.setItem('canon.sync.last',new Date().toISOString());window.dispatchEvent(new CustomEvent('canonical-sync-restored'))}}
    if(action==='signout'){await a.signOut();status('Signed out. Progress stored on this device has been preserved.')}
    if(action==='delete-remote'){const ok=await a.deleteRemoteProgress();status(ok?'The remotely synced progress copy was deleted. Local progress is unchanged.':'Sign in before deleting remote progress.')}
    await render();
  }catch(error){status(error?.message||'Account sync could not be completed. Local progress is unchanged.')}finally{busy=false}
}
open?.addEventListener('click',async()=>{panel.hidden=false;status('Checking account status…');try{await render()}catch{status('Account sync is not connected in this preview. Local study and progress remain available.')}close?.focus?.()});
close?.addEventListener('click',()=>{panel.hidden=true;open?.focus()});
panel?.addEventListener('click',e=>{const button=e.target.closest('[data-account]');if(button)void perform(button.dataset.account)});
async function backgroundSync(){if(localStorage.getItem('canon.sync.enabled')!=='1'||!navigator.onLine)return;try{const a=await api(),result=await a.syncProgress();if(result.status==='synced')localStorage.setItem('canon.sync.last',new Date().toISOString())}catch{}}
window.addEventListener('online',()=>void backgroundSync());
window.addEventListener('canonical-state-changed',()=>{clearTimeout(backgroundSync.timer);backgroundSync.timer=setTimeout(()=>void backgroundSync(),800)});
if(localStorage.getItem('canon.sync.enabled')==='1')void backgroundSync();
