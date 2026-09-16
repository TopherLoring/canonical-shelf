const DB='canonical-shelf-v6',VERSION=1,STORE='state';
function open(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
const fresh=()=>({version:1,completed:[],attempts:{},mastery:{},reviews:{},updatedAt:null});
export async function getState(){const db=await open();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).get('learner');r.onsuccess=()=>resolve({...fresh(),...(r.result||{})});r.onerror=()=>reject(r.error)})}
export async function putState(state){state.updatedAt=new Date().toISOString();const db=await open();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).put(state,'learner');t.oncomplete=()=>resolve(state);t.onerror=()=>reject(t.error)})}
export async function recordResult(id,passed){const s=await getState();s.attempts[id]=(s.attempts[id]||0)+1;if(id.startsWith('mastery:'))s.mastery[id]={passed:!!passed,attempts:s.attempts[id],lastAttempt:new Date().toISOString()};if(passed&&!s.completed.includes(id))s.completed.push(id);return putState(s)}
export async function recordReview(id){const s=await getState();s.reviews[id]=(s.reviews[id]||0)+1;return putState(s)}
export async function exportState(){return JSON.stringify(await getState(),null,2)}
export async function importState(raw){const parsed=typeof raw==='string'?JSON.parse(raw):raw;if(!parsed||!Array.isArray(parsed.completed))throw new Error('Invalid Canonical Shelf state');return putState({...fresh(),...parsed,version:1})}
export async function legacyLocalStorageSnapshot(){const out={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&/(canon|foundation|progress|mastery)/i.test(k))out[k]=localStorage.getItem(k)}return out}
