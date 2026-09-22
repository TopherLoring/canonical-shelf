import {readFile} from 'node:fs/promises';
import {buildLlmsContract} from './llms-contract.mjs';

const fail=message=>{throw new Error(`llms.txt validation failed: ${message}`)};
const contract=await buildLlmsContract();
const output=await readFile('public/llms.txt','utf8').catch(()=>fail('public/llms.txt is missing; run bun run generate:llms'));
if(output!==contract.markdown)fail('public/llms.txt is stale; run bun run generate:llms');
if(!output.startsWith('# Canonical Shelf\n\n> '))fail('file must begin with the Canonical Shelf H1 and summary blockquote');
if((output.match(/^# /gm)||[]).length!==1)fail('file must contain exactly one structural H1');
for(const heading of ['## Primary destinations','## Canonical learning and editorial resources','## Institutional disclosures','## Excluded full-text resource','## Complete user-facing content'])if(!output.includes(heading))fail(`missing ${heading}`);
for(const route of contract.routes){const token=`[${route.label}](${route.href})`;if(output.split(token).length!==2)fail(`primary route must appear exactly once: ${route.href}`)}
if(!output.includes('[About & methodology](/about.html)'))fail('About & methodology resource link is missing');
if(contract.aboutSections.length!==8)fail(`expected About overview plus seven disclosure sections, found ${contract.aboutSections.length}`);
for(const section of contract.aboutSections){
  if(!output.includes(`### ${section.label}`))fail(`About disclosure heading missing: ${section.label}`);
  if(!output.includes(`**${section.heading}**`))fail(`About disclosure subheading missing: ${section.heading}`);
  for(const paragraph of section.paragraphs)if(!output.includes(paragraph))fail(`About disclosure copy is stale or missing: ${section.id}`);
}
for(const resource of contract.embeddedResources){
  if(!resource.content.trim())fail(`embedded resource is empty: ${resource.url}`);
  if(!output.includes(`### ${resource.label}`))fail(`embedded resource heading missing: ${resource.label}`);
}
for(const dataset of contract.userFacingDatasets){
  if(dataset.data===undefined||dataset.data===null)fail(`user-facing dataset is empty: ${dataset.url}`);
  if(!output.includes(`### ${dataset.label}`))fail(`user-facing dataset heading missing: ${dataset.label}`);
}
if(!output.includes('### Runtime learning catalog'))fail('runtime learning catalog must be embedded');
if(!output.includes('### Orientation lesson'))fail('orientation lesson must be embedded');
if(!output.includes('### Bible library reference'))fail('Bible library metadata must be embedded');
if(!output.includes('### Practice content'))fail('Practice content must be embedded');
if(!output.includes('### Curated passage library'))fail('curated passage library must be embedded');
if(contract.userFacingSummary.books!==66)fail(`expected 66 Bible book profiles, found ${contract.userFacingSummary.books}`);
if(!contract.userFacingSummary.orientationScenes)fail('orientation scenes are missing');
if(!contract.userFacingSummary.practiceStages||!contract.userFacingSummary.practiceLevels)fail('Practice data is incomplete');
if(!contract.userFacingSummary.curatedPassages)fail('curated passage library is empty');
if(output.includes('Source: [/data/corpus.txt](/data/corpus.txt)'))fail('full BSB corpus must not be embedded');
if(!output.includes('[Full BSB Bible corpus](/data/corpus.txt)'))fail('full BSB corpus exclusion/link must be explicit');
const index=await readFile('public/index.html','utf8');
const describedBy=[...index.matchAll(/<link\b[^>]*>/gi)].filter(match=>/\brel=["']describedby["']/i.test(match[0])&&/\bhref=["']\/llms\.txt["']/i.test(match[0]));
if(describedBy.length!==1)fail('public/index.html must advertise exactly one rel="describedby" link to /llms.txt');
if(/\/(?:api|account|feedback)(?:\/|\b)/i.test(output))fail('private/account/feedback API surface must not be linked from llms.txt');
if(contract.counts.courses!==6)fail(`expected six-course catalog, found ${contract.counts.courses}`);
console.log('llms.txt complete-user-content/freshness/BSB-exclusion/privacy/discovery gates passed');
