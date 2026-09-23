import {readFile} from 'node:fs/promises';

const WORKER_NAME='the-canonical-shelf';
const CANONICAL_ORIGIN=`https://${WORKER_NAME}.christopherwonder.workers.dev`;
const expectedDatabaseId=process.env.D1_DATABASE_ID;
const expectedRelease=process.env.GITHUB_SHA||'local';

if(!expectedDatabaseId)throw new Error('D1_DATABASE_ID is required to validate Cloudflare configuration');

const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
const fail=message=>{throw new Error(`Cloudflare config validation failed: ${message}`)};

if(config.name!==WORKER_NAME)fail(`Worker name must be ${WORKER_NAME}; found ${config.name||'(missing)'}`);
if(config.main!=='worker/index.ts')fail(`Worker entry must be worker/index.ts; found ${config.main||'(missing)'}`);
if(config.assets?.directory!=='./public')fail('static assets directory must be ./public');
if(config.assets?.binding!=='ASSETS')fail('static assets binding must be ASSETS');
if(config.assets?.html_handling!=='auto-trailing-slash')fail('static route documents must use auto-trailing-slash HTML handling for clean /home, /course, /bible, /topics, /practice, and /search URLs');
if(config.assets?.not_found_handling!=='single-page-application')fail('static assets must use single-page-application fallback');
if(!Array.isArray(config.assets?.run_worker_first)||!config.assets.run_worker_first.includes('/api/*'))fail('API routes must run Worker code before static assets');
if(config.ai?.binding!=='AI')fail('Workers AI binding must be AI');
if(config.vars?.BETTER_AUTH_URL!==CANONICAL_ORIGIN)fail(`BETTER_AUTH_URL must be canonical origin ${CANONICAL_ORIGIN}`);
if(config.vars?.CANONICAL_ORIGIN!==CANONICAL_ORIGIN)fail('CANONICAL_ORIGIN must be emitted into Worker vars');
if(config.vars?.RELEASE_SHA!==expectedRelease)fail(`RELEASE_SHA must match current release ${expectedRelease}`);

const databases=Array.isArray(config.d1_databases)?config.d1_databases:[];
if(databases.length!==1)fail(`expected exactly one D1 binding; found ${databases.length}`);
const db=databases[0]||{};
if(db.binding!=='DB')fail('D1 binding must be DB');
if(db.database_name!=='canonical-shelf')fail('D1 database name must remain canonical-shelf');
if(db.database_id!==expectedDatabaseId)fail('generated D1 database_id does not match D1_DATABASE_ID');
if(db.migrations_dir!=='worker/migrations')fail('D1 migrations directory must be worker/migrations');

console.log(`Cloudflare config gate passed: ${WORKER_NAME} → ${CANONICAL_ORIGIN}, clean route documents + D1/ASSETS/AI bindings present, release ${expectedRelease}`);
