import {readFile} from 'node:fs/promises';
import {Miniflare} from 'miniflare';
import {deleteSync,mergeAndWriteSync,readSync} from '../worker/sync-store.ts';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const mf=new Miniflare({modules:true,script:`export default {fetch(){return new Response('ok')}}`,d1Databases:['DB']});
try{
  const db=await mf.getD1Database('DB');
  await db.exec(await readFile('worker/migrations/0001_sync.sql','utf8'));
  const at='2026-09-17T12:00:00.000Z';
  const event=(id,deviceId,type='complete')=>({id,deviceId,type,payload:{activityId:'lesson:test'},at});
  const aBody={deviceId:'device-a1',snapshot:{completed:['lesson:a'],attempts:{'lesson:a':1},mastery:{},reviews:{},migrations:{},updatedAt:at},events:[event('same-id','device-a1')]};
  const bBody={deviceId:'device-b1',snapshot:{completed:['lesson:b'],attempts:{'lesson:b':1},mastery:{},reviews:{},migrations:{},updatedAt:at},events:[event('same-id','device-b1')]};
  await mergeAndWriteSync(db,'user-a',aBody,at);
  await mergeAndWriteSync(db,'user-b',bBody,at);
  const a=await readSync(db,'user-a'),b=await readSync(db,'user-b');
  assert(a.state.completed.includes('lesson:a')&&!a.state.completed.includes('lesson:b'),'user A state leaked or was overwritten');
  assert(b.state.completed.includes('lesson:b')&&!b.state.completed.includes('lesson:a'),'user B state leaked or was overwritten');
  const mutationCount=await db.prepare('SELECT COUNT(*) AS count FROM learner_mutation').first();
  assert(Number(mutationCount.count)===2,'mutation identity must be scoped per user');
  await mergeAndWriteSync(db,'user-a',aBody,'2026-09-17T12:01:00.000Z');
  const replayCount=await db.prepare('SELECT COUNT(*) AS count FROM learner_mutation WHERE user_id=?').bind('user-a').first();
  assert(Number(replayCount.count)===1,'duplicate mutation replay created a second row');
  let rejected=false;
  try{await mergeAndWriteSync(db,'user-a',{...aBody,snapshot:{...aBody.snapshot,legacyRaw:{secret:'must stay local'}}},at)}catch(error){rejected=/Legacy raw data/.test(String(error?.message||error))}
  assert(rejected,'legacyRaw payload was not rejected');
  await deleteSync(db,'user-a');
  const deleted=await readSync(db,'user-a'),survivor=await readSync(db,'user-b');
  assert(deleted.state===null,'delete did not remove user A remote state');
  assert(survivor.state?.completed?.includes('lesson:b'),'deleting user A affected user B');
  const orphaned=await db.prepare('SELECT COUNT(*) AS count FROM learner_mutation WHERE user_id=?').bind('user-a').first();
  assert(Number(orphaned.count)===0,'delete left user A mutation rows behind');
  console.log('v6 local D1 user-isolation/replay/deletion/privacy gates passed');
}finally{await mf.dispose()}
