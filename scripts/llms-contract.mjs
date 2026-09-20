import {readFile,access} from 'node:fs/promises';
import {join} from 'node:path';

const ROUTE_DESCRIPTIONS={
  home:'Orientation and continuation surface for the learner.',
  course:'Six-course guided curriculum and scored learning activities.',
  bible:'Browse and read the biblical text, books, and study context.',
  topics:'Curated reference material; Topics do not count toward course completion.',
  practice:'Retrieval and spaced reinforcement without creating a second curriculum.'
};

const PUBLIC_RESOURCES=[
  ['Curriculum reference','/data/curriculum.md','Generated curriculum reference for the current guided courses.'],
  ['Runtime catalog','/data/catalog.json','Machine-readable courses, units, lessons, mastery activities, glossary, Topics, and stable activity identifiers.'],
  ['Statement of Faith','/data/statement-of-faith.md','Canonical Shelf doctrinal ceiling and authoritative statement of faith.'],
  ['Theology policy','/data/theology-policy.json','Machine-readable evidence and interpretation boundaries used by the study Guide.'],
  ['Theology sources','/data/theology-sources.json','Public source metadata used by the bounded theology/evidence layer.']
];
const OPTIONAL_RESOURCES=[['Bible corpus','/data/corpus.txt','Embedded Scripture corpus used by Bible reading and search; large file, fetch only when needed.']];

const decodeEntities=s=>String(s).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const cleanLabel=s=>decodeEntities(String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const attr=(source,name)=>source.match(new RegExp(`\\b${name}=["']([^"']+)["']`,'i'))?.[1]||'';

export function parsePrimaryNavigation(html){
  const nav=String(html).match(/<nav\b[^>]*aria-label=["']Primary["'][^>]*>([\s\S]*?)<\/nav>/i)?.[1];
  if(!nav)throw new Error('llms generation requires a primary navigation landmark');
  const routes=[];
  for(const match of nav.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){
    const attributes=match[1],route=attr(attributes,'data-route');
    if(!route)continue;
    const href=attr(attributes,'href'),label=cleanLabel(match[2]);
    if(!href.startsWith('/'))throw new Error(`primary route ${route} must use a root-relative href`);
    if(!label)throw new Error(`primary route ${route} is missing a label`);
    routes.push({id:route,label,href,description:ROUTE_DESCRIPTIONS[route]||`${label} section of Canonical Shelf.`});
  }
  if(!routes.length)throw new Error('llms generation found no primary routes');
  const ids=new Set(),hrefs=new Set();
  for(const route of routes){
    if(ids.has(route.id)||hrefs.has(route.href))throw new Error(`duplicate primary route: ${route.id} ${route.href}`);
    ids.add(route.id);hrefs.add(route.href);
  }
  return routes;
}

export function summarizeCatalog(catalog){
  const courses=Array.isArray(catalog?.courses)?catalog.courses.length:0;
  const units=Array.isArray(catalog?.units)?catalog.units.length:0;
  const guidedLessons=Array.isArray(catalog?.lessons)?catalog.lessons.length:0;
  const masteryActivities=Array.isArray(catalog?.masteryIds)?catalog.masteryIds.length:Array.isArray(catalog?.activities)?catalog.activities.filter(activity=>activity?.type==='mastery').length:0;
  const scoredActivities=Array.isArray(catalog?.activities)?catalog.activities.length:guidedLessons+masteryActivities;
  const topics=Array.isArray(catalog?.topics)?catalog.topics.length:0;
  const glossaryTerms=Array.isArray(catalog?.glossary)?catalog.glossary.length:0;
  if(!courses||!units||!guidedLessons||!masteryActivities||!scoredActivities)throw new Error('runtime catalog is incomplete; run migration before generating llms.txt');
  if(scoredActivities!==guidedLessons+masteryActivities)throw new Error(`catalog activity count mismatch: ${guidedLessons}+${masteryActivities} != ${scoredActivities}`);
  return {courses,units,guidedLessons,masteryActivities,scoredActivities,topics,glossaryTerms};
}

export function renderLlms({routes,counts}){
  const lines=[
    '# Canonical Shelf','',
    '> Canonical Shelf is an offline-capable Bible-learning and scholarly reference application combining six progressive guided courses, Scripture study, curated Topics, Practice, glossaries, and an evidence-aware study Guide.','',
    'This file is generated from the application’s primary navigation and runtime catalog. It is a discovery contract, not an independent authority for curriculum or theology. Canonical Shelf distinguishes biblical text, historical context and evidence, interpretation, reception, doctrine, Canonical Shelf position, and application.','',
    `Current scored curriculum: ${counts.courses} courses, ${counts.units} units, ${counts.guidedLessons} guided lessons, ${counts.masteryActivities} mastery/capstone activities, and ${counts.scoredActivities} scored activities. Current reference library: ${counts.topics} Topics and ${counts.glossaryTerms} glossary terms.`,'',
    '## Primary destinations',''
  ];
  for(const route of routes)lines.push(`- [${route.label}](${route.href}): ${route.description}`);
  lines.push('','## Canonical learning and editorial resources','');
  for(const [label,url,description] of PUBLIC_RESOURCES)lines.push(`- [${label}](${url}): ${description}`);
  lines.push('','## Optional','');
  for(const [label,url,description] of OPTIONAL_RESOURCES)lines.push(`- [${label}](${url}): ${description}`);
  return `${lines.join('\n')}\n`;
}

export async function buildLlmsContract({root=process.cwd()}={}){
  const indexPath=join(root,'public/index.html'),catalogPath=join(root,'public/data/catalog.json');
  const [html,catalogText]=await Promise.all([readFile(indexPath,'utf8'),readFile(catalogPath,'utf8').catch(error=>{throw new Error(`cannot read ${catalogPath}; run migration before generating llms.txt (${error.message})`)})]);
  const routes=parsePrimaryNavigation(html),catalog=JSON.parse(catalogText),counts=summarizeCatalog(catalog),resources=[...PUBLIC_RESOURCES,...OPTIONAL_RESOURCES];
  for(const [,url] of resources)await access(join(root,'public',url.replace(/^\//,'')));
  return {routes,counts,resources,markdown:renderLlms({routes,counts})};
}
