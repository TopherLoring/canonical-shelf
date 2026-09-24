import {createAuthClient} from 'better-auth/client';
import {anonymousClient} from 'better-auth/client/plugins';
import {passkeyClient} from '@better-auth/passkey/client';
import {getState,putState} from './db.js';
import {mergeLearnerState,remoteSnapshot,acknowledgeSync} from './sync.js';

const authClient=createAuthClient({baseURL:location.origin,plugins:[anonymousClient(),passkeyClient()]});

export async function accountSession(){
  try{const {data,error}=await authClient.getSession();return error?null:(data||null)}catch{return null}
}

export async function enableSyncSession(){
  const existing=await accountSession();if(existing)return existing;
  const {data,error}=await authClient.signIn.anonymous();
  if(error)throw new Error(error.message||'Unable to enable sync');
  return data;
}

export async function addRecoveryPasskey(name='Canonical Shelf passkey'){
  await enableSyncSession();
  const {data,error}=await authClient.passkey.addPasskey({name,createSession:true});
  if(error)throw new Error(error.message||'Passkey registration failed');
  return data;
}

export async function signInWithPasskey(){
  const {data,error}=await authClient.signIn.passkey({autoFill:false});
  if(error)throw new Error(error.message||'Passkey sign-in failed');
  await syncProgress();
  return data;
}

export async function enableCrossDeviceSync(){
  const prior=await accountSession();let created=false;
  if(!prior){await enableSyncSession();created=true}
  try{
    await addRecoveryPasskey();
    const sync=await syncProgress();
    localStorage.setItem('canon.sync.enabled','1');
    return sync;
  }catch(error){
    if(created){try{await authClient.deleteAnonymousUser()}catch{}localStorage.removeItem('canon.sync.enabled')}
    throw error;
  }
}

export async function syncProgress(){
  const session=await accountSession();if(!session)return {status:'signed-out' as const};
  const local=await getState();
  const response=await fetch('/api/sync',{method:'POST',credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({deviceId:local.sync.deviceId,snapshot:remoteSnapshot(local),events:local.sync.outbox,cursor:local.sync.cursor})});
  if(response.status===401)return {status:'signed-out' as const};
  if(!response.ok)throw new Error(`Sync failed (${response.status})`);
  const remote=await response.json();
  let merged=mergeLearnerState(local,remote.state||{});
  merged=acknowledgeSync(merged,{cursor:remote.cursor,acceptedIds:remote.acceptedIds||[]});
  await putState(merged,{notify:false});
  return {status:'synced' as const,state:merged,updatedAt:remote.updatedAt};
}

export async function deleteRemoteProgress(){
  const response=await fetch('/api/sync',{method:'DELETE',credentials:'include'});
  if(response.status===401)return false;
  if(!response.ok)throw new Error(`Remote deletion failed (${response.status})`);
  return true;
}

export async function deleteAccount(){
  const {error}=await authClient.deleteUser();
  if(error)throw new Error(error.message||'Account deletion failed');
  localStorage.removeItem('canon.sync.enabled');localStorage.removeItem('canon.sync.last');
  return true;
}

export async function signOut(){await authClient.signOut();localStorage.removeItem('canon.sync.enabled')}
