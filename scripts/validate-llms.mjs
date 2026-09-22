import {readFile} from 'node:fs/promises';
import {buildLlmsContract} from './llms-contract.mjs';

const fail=message=>{throw new Error(`llms.txt validation failed: ${message}`)};
const contract=await buildLlmsContract();
const output=await readFile('public/llms.txt','utf8').catch(()=>fail('public/llms.txt is missing; run bun run generate:llms'));

if(output!==contract.markdown)fail('public/llms.txt is stale; run bun run generate:llms');
if(!output.startsWith('# Canonical Shelf\n\n> '))fail('file must begin with the Canonical Shelf H1 and summary blockquote');
if((output.match(/^# /gm)||[]).length!==1)fail('file must contain exactly one structural H1');
for(const heading of ['## Primary destinations','## Canonical learning and editorial resources','## Institutional disclosures','## Linked, intentionally non-embedded resource','## Complete learner-facing content'])if(!output.includes(heading))fail(`missing ${heading}`);
if(output.includes('## Repository context'))fail('internal repository context must not be embedded as learner-facing content');

for(const route of contract.routes){
  const token=`[${route.label}](${route.href})`;
  if(output.split(token).length!==2)fail(`primary route must appear exactly once: ${route.href}`);
}

if(!output.includes('[About & methodology](/about.html)'))fail('About & methodology resource link is missing');
if(contract.aboutSections.length!==8)fail(`expected About overview plus seven disclosure sections, found ${contract.aboutSections.length}`);
for(const section of contract.aboutSections){
  if(!output.includes(`### ${section.label}`))fail(`About disclosure heading missing: ${section.label}`);
  if(!output.includes(`**${section.heading}**`))fail(`About disclosure subheading missing: ${section.heading}`);
  for(const paragraph of section.paragraphs)if(!output.includes(paragraph))fail(`About disclosure copy is stale or missing: ${section.id}`);
}

for(const resource of contract.embeddedResources){
  if(!resource.content.trim())fail(`embedded resource is empty: ${resource.url}`);
  if(resource.url==='/data/corpus.txt')fail('full BSB corpus must never be configured as an embedded resource');
  if(resource.url==='/data/theologian-belief-context.md')fail('supplemental long-form belief context must never be configured as an embedded resource');
  if(!output.includes(`### ${resource.label}`))fail(`embedded resource heading missing: ${resource.label}`);
}
for(const dataset of contract.learnerDatasets){
  if(dataset.data===undefined||dataset.data===null)fail(`learner dataset is empty: ${dataset.url}`);
  if(dataset.url==='/data/corpus.txt')fail('full BSB corpus must never be configured as a learner dataset');
  if(!output.includes(`### ${dataset.label}`))fail(`learner dataset heading missing: ${dataset.label}`);
}

for(const required of ['Runtime learning catalog','Orientation lesson','Bible library reference','Practice content','Curated passage library','Appearance themes']){
  if(!output.includes(`### ${required}`))fail(`required learner-facing dataset missing: ${required}`);
}

const catalog=contract.learnerDatasets.find(dataset=>dataset.label==='Runtime learning catalog')?.data;
if(!catalog)fail('runtime learning catalog dataset missing');
if((catalog.courses||[]).length!==contract.counts.courses)fail('embedded course count does not match runtime catalog');
if((catalog.units||[]).length!==contract.counts.units)fail('embedded unit count does not match runtime catalog');
if((catalog.lessons||[]).length!==contract.counts.guidedLessons)fail('embedded lesson count does not match runtime catalog');
if((catalog.topics||[]).length!==contract.counts.topics)fail('embedded Topic count does not match runtime catalog');
if((catalog.glossary||[]).length!==contract.counts.glossaryTerms)fail('embedded glossary count does not match runtime catalog');
if(!Object.keys(catalog.mastery||{}).length&&!Object.keys(catalog.preservedLegacyMastery||{}).length)fail('embedded mastery content is missing');
if(!Array.isArray(catalog.questionThreads)||!catalog.questionThreads.length)fail('embedded question-thread content is missing');

if(contract.learnerSummary.books!==66)fail(`expected 66 Bible book profiles, found ${contract.learnerSummary.books}`);
if(!contract.learnerSummary.orientationScenes)fail('Orientation scenes are missing');
if(!contract.learnerSummary.practiceRanks||!contract.learnerSummary.practiceAchievements||!contract.learnerSummary.practiceStages||!contract.learnerSummary.practiceLevels)fail('Practice learner-facing data is incomplete');
if(!contract.learnerSummary.curatedPassages)fail('curated passage library is empty');
if(!contract.learnerSummary.themes)fail('appearance theme metadata is empty');

const curated=contract.learnerDatasets.find(dataset=>dataset.label==='Curated passage library')?.data;
if(!curated?.translations?.bsb)fail('curated passage library must retain BSB translation metadata');
if(!curated?.verses?.some(verse=>typeof verse?.bsb==='string'&&verse.bsb.trim()))fail('curated BSB excerpts must remain included');

const entries=contract.reachability.entries;
if(entries.length!==contract.reachabilityCoverage.embedded.length+contract.reachabilityCoverage.linked.length+contract.reachabilityCoverage.excluded.length)fail('not every reachability content family has exactly one llms disposition');
for(const entry of entries){
  const bucket=entry.llms.disposition==='embed'?contract.reachabilityCoverage.embedded:entry.llms.disposition==='link'?contract.reachabilityCoverage.linked:contract.reachabilityCoverage.excluded;
  if(!bucket.includes(entry.id))fail(`reachability content family ${entry.id} is not represented by its ${entry.llms.disposition} disposition`);
}
const scripture=entries.find(entry=>entry.id==='scripture');
if(scripture?.llms?.disposition!=='link')fail('full BSB Scripture corpus must be linked rather than embedded');
const supplemental=entries.find(entry=>entry.id==='supplemental-belief-context');
if(supplemental?.llms?.disposition!=='exclude')fail('supplemental long-form belief context must remain excluded from the learner corpus');

if(output.includes('Source: [/data/corpus.txt](/data/corpus.txt)'))fail('full BSB corpus must not be embedded');
if(!output.includes('[Full BSB Bible corpus](/data/corpus.txt)'))fail('full BSB corpus link/exclusion must be explicit');
if(output.includes('/data/theologian-belief-context.md'))fail('supplemental long-form Theologian belief context must not be surfaced in llms.txt');

const index=await readFile('public/index.html','utf8');
const describedBy=[...index.matchAll(/<link\b[^>]*>/gi)].filter(match=>/\brel=["']describedby["']/i.test(match[0])&&/\bhref=["']\/llms\.txt["']/i.test(match[0]));
if(describedBy.length!==1)fail('public/index.html must advertise exactly one rel="describedby" link to /llms.txt');

if(/\/(?:api|account|feedback)(?:\/|\b)/i.test(output))fail('private/account/feedback API surface must not be linked from llms.txt');
if(contract.counts.courses!==6)fail(`expected six-course catalog, found ${contract.counts.courses}`);

console.log(`llms.txt reachability-authoritative complete learner corpus gates passed (${contract.reachabilityCoverage.embedded.length} embedded families, ${contract.reachabilityCoverage.linked.length} linked, ${contract.reachabilityCoverage.excluded.length} excluded; ${contract.learnerSummary.books} books, ${contract.learnerSummary.practiceLevels} Practice levels, ${contract.learnerSummary.curatedPassages} curated passages, ${contract.learnerSummary.themes} themes)`);
