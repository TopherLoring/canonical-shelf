import {readFile} from 'node:fs/promises';
import {buildLlmsContract} from './llms-contract.mjs';

const fail=message=>{throw new Error(`llms.txt validation failed: ${message}`)};
const contract=await buildLlmsContract();
const output=await readFile('public/llms.txt','utf8').catch(()=>fail('public/llms.txt is missing; run bun run generate:llms'));
if(output!==contract.markdown)fail('public/llms.txt is stale; run bun run generate:llms');
if(!output.startsWith('# Canonical Shelf\n\n> '))fail('file must begin with the Canonical Shelf H1 and summary blockquote');
if((output.match(/^# /gm)||[]).length!==1)fail('file must contain exactly one structural H1');
for(const heading of ['## Primary destinations','## Canonical learning and editorial resources','## Institutional disclosures','## Excluded full-text resource','## Complete substantive runtime content','## Repository context'])if(!output.includes(heading))fail(`missing ${heading}`);
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
for(const dataset of contract.runtimeDatasets){
  if(dataset.data===undefined||dataset.data===null)fail(`runtime dataset is empty: ${dataset.url}`);
  if(!output.includes(`### ${dataset.label}`))fail(`runtime dataset heading missing: ${dataset.label}`);
}
if(!output.includes('### Runtime learning catalog'))fail('runtime learning catalog must be embedded');
if(!output.includes('### Orientation lesson'))fail('orientation lesson must be embedded');
if(!output.includes('### Bible library reference'))fail('Bible library metadata must be embedded');
if(!output.includes('### Practice content'))fail('Practice content must be embedded');
if(!output.includes('### Curated passage library'))fail('curated passage library must be embedded');
if(contract.runtimeSummary.books!==66)fail(`expected 66 Bible book profiles, found ${contract.runtimeSummary.books}`);
if(!contract.runtimeSummary.orientationScenes)fail('orientation scenes are missing');
if(!contract.runtimeSummary.practiceStages||!contract.runtimeSummary.practiceLevels)fail('Practice data is incomplete');
if(!contract.runtimeSummary.curatedPassages)fail('curated passage library is empty');
if(!contract.repositoryContext.length)fail('repository context is empty');
for(const file of contract.repositoryContext){
  if(!file.content.trim())fail(`repository context file is empty: ${file.path}`);
  if(!output.includes(`### ${file.path}`))fail(`repository context heading missing: ${file.path}`);
  if(/(?:^|\/)(?:\.env|secrets?|credentials?|private[-_]?keys?)(?:\.|\/|$)/i.test(file.path))fail(`sensitive repository path must not be embedded: ${file.path}`);
}
for(const required of ['README.md','AI_INSTRUCTIONS.md','docs/v7/DECISION_PRECEDENCE.md'])if(!contract.repositoryContext.some(file=>file.path===required))fail(`required repository context missing: ${required}`);
if(output.includes('Source: [/data/corpus.txt](/data/corpus.txt)'))fail('full BSB corpus must not be embedded');
if(!output.includes('[Full BSB Bible corpus](/data/corpus.txt)'))fail('full BSB corpus exclusion/link must be explicit');
const index=await readFile('public/index.html','utf8');
const describedBy=[...index.matchAll(/<link\b[^>]*>/gi)].filter(match=>/\brel=["']describedby["']/i.test(match[0])&&/\bhref=["']\/llms\.txt["']/i.test(match[0]));
if(describedBy.length!==1)fail('public/index.html must advertise exactly one rel="describedby" link to /llms.txt');
if(contract.counts.courses!==6)fail(`expected six-course catalog, found ${contract.counts.courses}`);
console.log(`llms.txt substantive-corpus/freshness/BSB-exclusion/discovery gates passed (${contract.repositoryContext.length} repository context files)`);
