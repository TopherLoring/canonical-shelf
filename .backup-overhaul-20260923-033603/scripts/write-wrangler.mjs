import {writeFile} from 'node:fs/promises';

const WORKER_NAME='the-canonical-shelf';
const PRODUCTION_ORIGIN=`https://${WORKER_NAME}.christopherwonder.workers.dev`;
const requestedOrigin=process.env.CANONICAL_ORIGIN?.replace(/\/$/,'');
const isProduction=Boolean(requestedOrigin);
const releaseSha=process.env.GITHUB_SHA||'local';
const requestedPort=Number.parseInt(process.env.PORT||'',10);
const localPort=Number.isFinite(requestedPort)&&requestedPort>0?requestedPort:8787;
const localOrigin=`http://localhost:${localPort}`;
const databaseId=process.env.D1_DATABASE_ID||(isProduction?'':'00000000-0000-0000-0000-000000000000');
const authUrl=process.env.BETTER_AUTH_URL?.replace(/\/$/,'')||(isProduction?'':localOrigin);

if(isProduction&&!process.env.D1_DATABASE_ID)throw new Error('D1_DATABASE_ID is required for production');
if(isProduction&&!process.env.BETTER_AUTH_URL)throw new Error('BETTER_AUTH_URL is required for production');
if(!databaseId)throw new Error('D1 database identity is unavailable');
if(!authUrl)throw new Error('Better Auth URL is unavailable');

// Production/CI explicitly supplies CANONICAL_ORIGIN. Local development is
// intentionally self-contained and uses Wrangler's local D1 store instead.
if(requestedOrigin&&requestedOrigin!==PRODUCTION_ORIGIN)throw new Error(`CANONICAL_ORIGIN must equal production origin ${PRODUCTION_ORIGIN}`);
if(requestedOrigin&&authUrl!==requestedOrigin)throw new Error('BETTER_AUTH_URL must match CANONICAL_ORIGIN for a production release');
const effectiveOrigin=requestedOrigin||authUrl;

const vars={
  BETTER_AUTH_URL:authUrl,
  CANONICAL_ORIGIN:effectiveOrigin,
  RELEASE_SHA:releaseSha,
  ...(!isProduction?{BETTER_AUTH_SECRET:process.env.BETTER_AUTH_SECRET||'canonical-shelf-local-development-only'}:{})
};

const config={
  $schema:'./node_modules/wrangler/config-schema.json',
  name:WORKER_NAME,
  main:'worker/index.ts',
  compatibility_date:'2026-09-17',
  observability:{enabled:true},
  ...(!isProduction?{dev:{port:localPort}}:{}),
  assets:{
    directory:'./public',
    binding:'ASSETS',
    html_handling:'auto-trailing-slash',
    not_found_handling:'single-page-application',
    run_worker_first:['/api/*']
  },
  ai:{binding:'AI'},
  ...(isProduction?{secrets:{required:['BETTER_AUTH_SECRET']}}:{}),
  vars,
  d1_databases:[{
    binding:'DB',
    database_name:'canonical-shelf',
    database_id:databaseId,
    migrations_dir:'worker/migrations'
  }]
};

await writeFile('wrangler.jsonc',JSON.stringify(config,null,2)+'\n');
console.log(`${isProduction?'production':'local'} wrangler.jsonc generated for ${WORKER_NAME} → ${effectiveOrigin} at release ${releaseSha}`);
