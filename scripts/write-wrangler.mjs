import {writeFile} from 'node:fs/promises';

const WORKER_NAME='the-canonical-shelf';
const CANONICAL_ORIGIN=`https://${WORKER_NAME}.christopherwonder.workers.dev`;
const databaseId=process.env.D1_DATABASE_ID;
const authUrl=process.env.BETTER_AUTH_URL;
const releaseSha=process.env.GITHUB_SHA||'local';

if(!databaseId)throw new Error('D1_DATABASE_ID is required');
if(!authUrl)throw new Error('BETTER_AUTH_URL is required');
if(authUrl.replace(/\/$/,'')!==CANONICAL_ORIGIN)throw new Error(`BETTER_AUTH_URL must equal canonical production origin ${CANONICAL_ORIGIN}`);

const config={
  $schema:'./node_modules/wrangler/config-schema.json',
  name:WORKER_NAME,
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
  vars:{
    BETTER_AUTH_URL:CANONICAL_ORIGIN,
    CANONICAL_ORIGIN,
    RELEASE_SHA:releaseSha
  },
  d1_databases:[{
    binding:'DB',
    database_name:'canonical-shelf',
    database_id:databaseId,
    migrations_dir:'worker/migrations'
  }]
};

await writeFile('wrangler.jsonc',JSON.stringify(config,null,2)+'\n');
console.log(`wrangler.jsonc generated for ${WORKER_NAME} → ${CANONICAL_ORIGIN} at release ${releaseSha}`);
