// The "You" section of the profile screen: account status and actions. Accounts are optional; without one,
// everything works on this device. An account (a passkey, owner decision: passkey + recovery codes) adds
// sync across devices. This module renders into [data-account-mount] whenever the profile screen renders,
// and keeps background sync running for signed-in learners.
let apiPromise = null, busy = false, syncTimer = null;
const api = () => apiPromise ||= import('./generated/account.js');
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mount = () => document.querySelector('[data-account-mount]');

function show(html) { const m = mount(); if (m) m.innerHTML = html; }
function notice(message) { show(`<p class="notice" role="status">${esc(message)}</p>`); }

async function renderAccount() {
  if (!mount()) return;
  let session = null;
  try { session = await (await api()).accountSession(); }
  catch { show('<p>Accounts are not connected in this preview. Everything you do is still saved on this device.</p>'); return; }
  if (!session) {
    show(`<p>You don't need an account. Your progress and notes are saved on this device.</p>
      <p>An account keeps them in sync across your devices. It uses a passkey (your fingerprint, face, or device PIN), so there is no password to remember.</p>
      <p class="profile-actions"><button class="button" type="button" data-account="enable">Create an account</button><button class="button button--quiet" type="button" data-account="signin">Sign in on this device</button></p>`);
    return;
  }
  const anonymous = !!session.user?.isAnonymous, last = localStorage.getItem('canon.sync.last');
  show(`<p><strong>${anonymous ? 'Account setup is not finished' : 'Signed in'}</strong>${session.user?.name && !anonymous ? ` as ${esc(session.user.name)}` : ''}</p>
    <p>${anonymous ? 'Add a passkey to finish, so you can sign in on your other devices.' : 'Your progress and notes sync across your signed-in devices.'}</p>
    ${last ? `<p class="meta">Last synced ${esc(new Date(last).toLocaleString())}</p>` : ''}
    <p class="profile-actions">${anonymous ? '<button class="button" type="button" data-account="finish">Add a passkey</button>' : '<button class="button" type="button" data-account="sync">Sync now</button><button class="button button--quiet" type="button" data-account="add-device">Add another device</button>'}<button class="button button--quiet" type="button" data-account="signout">Sign out</button></p>
    <details class="profile-danger"><summary>Delete</summary><p>Deleting removes your synced copy and your account. What's saved on this device stays.</p><p class="profile-actions"><button class="button button--quiet" type="button" data-account="delete-remote">Delete synced progress only</button><button class="button button--danger" type="button" data-account="delete-account">Delete my account</button></p></details>`);
}

async function perform(action) {
  if (busy) return; busy = true;
  try {
    const a = await api();
    if (action === 'enable') { notice('Creating your account and opening passkey setup…'); const r = await a.enableCrossDeviceSync(); if (r.status === 'synced') { localStorage.setItem('canon.sync.enabled', '1'); localStorage.setItem('canon.sync.last', new Date().toISOString()); } }
    if (action === 'finish' || action === 'add-device') { notice('Opening passkey setup…'); await a.addRecoveryPasskey(); const r = await a.syncProgress(); if (r.status === 'synced') { localStorage.setItem('canon.sync.enabled', '1'); localStorage.setItem('canon.sync.last', new Date().toISOString()); } }
    if (action === 'signin') { notice('Choose your Canonical Shelf passkey…'); await a.signInWithPasskey(); localStorage.setItem('canon.sync.enabled', '1'); localStorage.setItem('canon.sync.last', new Date().toISOString()); location.reload(); return; }
    if (action === 'sync') { notice('Syncing…'); const r = await a.syncProgress(); if (r.status === 'synced') { localStorage.setItem('canon.sync.last', new Date().toISOString()); location.reload(); return; } }
    if (action === 'signout') { await a.signOut(); localStorage.removeItem('canon.sync.enabled'); }
    if (action === 'delete-remote') { if (!confirm('Delete your synced copy? What is saved on this device stays.')) return; await a.deleteRemoteProgress(); }
    if (action === 'delete-account') { if (!confirm('Delete your Canonical Shelf account and its synced copy? What is saved on this device stays.')) return; await a.deleteAccount(); localStorage.removeItem('canon.sync.enabled'); }
    await renderAccount();
  } catch (error) { notice(error?.message || 'That did not work. Everything on this device is unchanged.'); }
  finally { busy = false; }
}

document.addEventListener('click', e => { const b = e.target.closest?.('[data-account]'); if (b && b.closest('[data-account-mount]')) { e.preventDefault(); void perform(b.dataset.account); } });
document.addEventListener('canonical-route-rendered', () => { if (mount()) void renderAccount(); });

async function backgroundSync() { if (localStorage.getItem('canon.sync.enabled') !== '1' || !navigator.onLine) return; try { const a = await api(), r = await a.syncProgress(); if (r.status === 'synced') localStorage.setItem('canon.sync.last', new Date().toISOString()); } catch {} }
window.addEventListener('online', () => void backgroundSync());
window.addEventListener('canonical-state-changed', () => { clearTimeout(syncTimer); syncTimer = setTimeout(() => void backgroundSync(), 800); });
if (localStorage.getItem('canon.sync.enabled') === '1') void backgroundSync();
