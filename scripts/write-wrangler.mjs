import {writeFile} from 'node:fs/promises';
const databaseId=process.env.D1_DATABASE_ID;
const authUrl=process.env.BETTER_AUTH_URL;
if(!databaseId) throw new Error('D1_DATABASE_ID is required');
if(!authUrl) throw new Error('BETTER_AUTH_URL is required');
const config={
  $schema:'./node_modules/wrangler/config-schema.json',
  name:'the-canonical-shelf',
  main:'worker/index.ts',
  compatibility_date:'2026-09-17',
  observability:{enabled:true},
  assets:{
    directory:'./public',
    binding:'ASSETS',
    not_found_handling:'single-page-application',
    run_worker_first:['/api/*']
  },
  ai:{binding:'AI'},
  secrets:{required:['BETTER_AUTH_SECRET']},
  vars:{BETTER_AUTH_URL:authUrl},
  d1_databases:[{binding:'DB',database_name:'canonical-shelf',database_id:databaseId,migrations_dir:'worker/migrations'}]
};
await writeFile('wrangler.jsonc',JSON.stringify(config,null,2)+'\n');
console.log('wrangler.jsonc generated for the-canonical-shelf with Workers AI binding');
