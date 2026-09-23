import {mkdir,writeFile} from 'node:fs/promises';
import {Miniflare} from 'miniflare';
import {getMigrations} from 'better-auth/db/migration';
import {createAuth} from '../worker/auth.ts';

const mf=new Miniflare({modules:true,script:`export default {fetch(){return new Response('ok')}}`,d1Databases:['DB']});
try{
  const db=await mf.getD1Database('DB');
  const auth=createAuth(
    {DB:db,BETTER_AUTH_SECRET:'canonical-shelf-schema-generation-secret-2026',BETTER_AUTH_URL:'https://canonical-shelf.invalid'},
    {quiet:true}
  );
  const {runMigrations}=await getMigrations(auth.options);
  await runMigrations();
  const objects=await db.prepare("SELECT type,name,sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END,name").all();
  const sql=(objects.results||[]).map(row=>String(row.sql).trim().replace(/;$/,'')+';').join('\n\n')+'\n';
  for(const required of ['user','session','account','verification','passkey'])if(!new RegExp(`CREATE TABLE[^;]*(?:\\"|\\[|\\b)${required}(?:\\"|\\]|\\b)`,'i').test(sql))throw new Error(`generated Better Auth schema missing ${required}`);
  if(!/isAnonymous/i.test(sql))throw new Error('generated Better Auth schema missing anonymous-user field');
  await mkdir('worker/migrations',{recursive:true});
  await writeFile('worker/migrations/0000_auth.sql','-- Generated from Better Auth 1.7.5 configuration. Do not hand-edit.\n'+sql);
  console.log('generated Better Auth + anonymous + passkey D1 migration');
}finally{await mf.dispose()}
