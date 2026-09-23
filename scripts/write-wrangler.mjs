import {writeFile} from 'node:fs/promises';

const WORKER_NAME='the-canonical-shelf';
const PRODUCTION_ORIGIN=`https://${WORKER_NAME}.christopherwonder.workers.dev`;
const databaseId=process.env.D1_DATABASE_ID;
const authUrl=process.env.BETTER_AUTH_URL?.replace(/\/$/,'');
const requestedOrigin=process.env.CANONICAL_ORIGIN?.replace(/\/$/,'');
const releaseSha=process.env.GITHUB_SHA||'local';

if(!databaseId)throw new Error('D1_DATABASE_ID is required');
if(!authUrl)throw new Error('BETTER_AUTH_URL is required');

// Production/CI explicitly supplies CANONICAL_ORIGIN. That makes the canonical
// target non-negotiable while still allowing `wrangler dev` to use localhost.
if(requestedOrigin&&requestedOrigin!==PRODUCTION_ORIGIN)throw new Error(`CANONICAL_ORIGIN must equal production origin ${PRODUCTION_ORIGIN}`);
if(requestedOrigin&&authUrl!==requestedOrigin)throw new Error('BETTER_AUTH_URL must match CANONICAL_ORIGIN for a production release');
const effectiveOrigin=requestedOrigin||authUrl;

const config={
  $schema:'./node_modules/wrangler/config-schema.json',
  name:WORKER_NAME,
  main:'worker/index.ts',
  compatibility_date:'2026-09-17',
  observability:{enabled:true},
  assets:{
    directory:'./public',
    binding:'ASSETS',
    html_handling:'auto-trailing-slash',
    not_found_handling:'single-page-application',
    run_worker_first:['/api/*']
  },
  ai:{binding:'AI'},
  secrets:{required:['BETTER_AUTH_SECRET']},
  vars:{
    BETTER_AUTH_URL:authUrl,
    CANONICAL_ORIGIN:effectiveOrigin,
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
console.log(`wrangler.jsonc generated for ${WORKER_NAME} → ${effectiveOrigin} at release ${releaseSha}`);
