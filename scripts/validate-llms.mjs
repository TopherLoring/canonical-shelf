import {readFile} from 'node:fs/promises';
import {buildLlmsContract} from './llms-contract.mjs';

const fail=message=>{throw new Error(`llms.txt validation failed: ${message}`)};
const contract=await buildLlmsContract();
const output=await readFile('public/llms.txt','utf8').catch(()=>fail('public/llms.txt is missing; run bun run generate:llms'));
if(output!==contract.markdown)fail('public/llms.txt is stale; run bun run generate:llms');
if(!output.startsWith('# Canonical Shelf\n\n> '))fail('file must begin with the Canonical Shelf H1 and summary blockquote');
if((output.match(/^# /gm)||[]).length!==1)fail('file must contain exactly one structural H1');
for(const heading of ['## Primary destinations','## Canonical learning and editorial resources','## Optional','## Loaded canonical content'])if(!output.includes(heading))fail(`missing ${heading}`);
for(const route of contract.routes){const token=`[${route.label}](${route.href})`;if(output.split(token).length!==2)fail(`primary route must appear exactly once: ${route.href}`)}
for(const resource of contract.embeddedResources){
  if(!resource.content.trim())fail(`embedded resource is empty: ${resource.url}`);
  if(!output.includes(`### ${resource.label}`))fail(`embedded resource heading missing: ${resource.label}`);
}
const index=await readFile('public/index.html','utf8');
const describedBy=[...index.matchAll(/<link\b[^>]*>/gi)].filter(match=>/\brel=["']describedby["']/i.test(match[0])&&/\bhref=["']\/llms\.txt["']/i.test(match[0]));
if(describedBy.length!==1)fail('public/index.html must advertise exactly one rel="describedby" link to /llms.txt');
if(/\/(?:api|account|feedback)(?:\/|\b)/i.test(output))fail('private/account/feedback API surface must not be linked from llms.txt');
if(contract.counts.courses!==6)fail(`expected six-course catalog, found ${contract.counts.courses}`);
console.log('llms.txt generation/discovery/freshness/embedded-content/privacy/multi-course gates passed');
