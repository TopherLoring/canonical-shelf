import {readFile} from 'node:fs/promises';
import {Miniflare} from 'miniflare';
import {deleteSync,mergeAndWriteSync,readSync} from '../worker/sync-store.ts';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const mf=new Miniflare({modules:true,script:`export default {fetch(){return new Response('ok')}}`,d1Databases:['DB']});
try{
  const db=await mf.getD1Database('DB');
  const migration=(await readFile('worker/migrations/0001_sync.sql','utf8')).replace(/\s+/g,' ').trim();
  await db.exec(migration);

  const at='2026-09-17T12:00:00.000Z';
  const event=(id,deviceId)=>({id,deviceId,type:'complete',payload:{activityId:'lesson:test'},at});
  const aBody={deviceId:'device-a',snapshot:{completed:['lesson:a'],attempts:{'lesson:a':1},mastery:{},reviews:{},migrations:{},updatedAt:at},events:[event('event-1','device-a')]};
  const bBody={deviceId:'device-b',snapshot:{completed:['lesson:b'],attempts:{'lesson:b':1},mastery:{},reviews:{},migrations:{},updatedAt:at},events:[event('event-1','device-b')]};

  await mergeAndWriteSync(db,'user-a',aBody,at);
  await mergeAndWriteSync(db,'user-b',bBody,at);
  const a=await readSync(db,'user-a'),b=await readSync(db,'user-b');
  assert(a.state?.completed?.includes('lesson:a')&&!a.state?.completed?.includes('lesson:b'),'user A state leaked or was overwritten');
  assert(b.state?.completed?.includes('lesson:b')&&!b.state?.completed?.includes('lesson:a'),'user B state leaked or was overwritten');

  // Replaying the same event must be idempotent from the caller's perspective.
  await mergeAndWriteSync(db,'user-a',aBody,'2026-09-17T12:01:00.000Z');
  const replayed=await readSync(db,'user-a');
  assert(replayed.state?.completed?.filter(id=>id==='lesson:a').length===1,'replayed sync changed observable learner completion');

  // Local-only migration material must never be accepted for remote persistence.
  let rejected=false;
  try{await mergeAndWriteSync(db,'user-a',{...aBody,snapshot:{...aBody.snapshot,legacyRaw:{secret:'must stay local'}}},at)}catch{rejected=true}
  assert(rejected,'local-only migration data was accepted for remote sync');

  await deleteSync(db,'user-a');
  const deleted=await readSync(db,'user-a'),survivor=await readSync(db,'user-b');
  assert(deleted.state===null,'remote deletion did not remove the selected learner state');
  assert(survivor.state?.completed?.includes('lesson:b'),'deleting one learner affected another learner');

  console.log('PASS — D1 sync isolation, idempotent replay, local-only privacy, and deletion behavior.');
}finally{await mf.dispose()}
