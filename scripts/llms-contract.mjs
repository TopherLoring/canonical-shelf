import {readFile,access} from 'node:fs/promises';
import {join} from 'node:path';

const ROUTE_DESCRIPTIONS={
  home:'Personalized learner dashboard for orientation, progress, recommendations, and resuming the next relevant activity.',
  course:'Six-course guided curriculum containing sequenced lessons, mastery activities, and scored learning experiences.',
  bible:'Interactive 66-book Bible shelf for browsing books, reading biblical text, and accessing book-level historical, literary, and study context.',
  topics:'Curated theological and biblical reference material. Topics supplement the curriculum but do not count toward course completion.',
  practice:'Retrieval practice, review, and spaced reinforcement derived from learned material without creating a parallel curriculum.'
};

const ABOUT_SECTION_LABELS={
  about:'About Canonical Shelf',
  approach:'How this guide approaches Scripture',
  sources:'Sources & methodology',
  translations:'Translation information',
  accessibility:'Accessibility',
  privacy:'Privacy'
};

const PUBLIC_RESOURCES=[
  {label:'About & methodology',url:'/about.html',description:'Institutional disclosure for Canonical Shelf’s product purpose, Scripture approach, sources and methodology, translation limits, accessibility posture, and privacy model.',embed:false},
  {label:'Curriculum reference',url:'/data/curriculum.md',description:'Human-readable reference for the current six-course guided curriculum, including its course, unit, lesson, and mastery structure.',embed:true},
  {label:'Runtime catalog',url:'/data/catalog.json',description:'Machine-readable canonical catalog of courses, units, lessons, mastery activities, glossary entries, Topics, stable activity identifiers, and runtime learning metadata.',embed:false},
  {label:'Statement of Faith',url:'/data/statement-of-faith.md',description:"Canonical Shelf's authoritative statement of faith and doctrinal ceiling for instructional and theological content.",embed:true},
  {label:'Theology policy',url:'/data/theology-policy.json',description:'Machine-readable evidence, interpretation, doctrinal-boundary, and response rules used by the study Guide and theology layer.',embed:true},
  {label:'Theology sources',url:'/data/theology-sources.json',description:'Canonical metadata for public biblical, historical, scholarly, denominational, and theological sources available to the bounded evidence layer.',embed:true}
];
const OPTIONAL_RESOURCES=[
  {label:'Bible corpus',url:'/data/corpus.txt',description:'Embedded Scripture corpus used by Bible reading and search; large file, fetch only when needed.',embed:false}
];

const decodeEntities=s=>String(s).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const cleanLabel=s=>decodeEntities(String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const attr=(source,name)=>source.match(new RegExp(`\\b${name}=["']([^"']+)["']`,'i'))?.[1]||'';
const indentContent=content=>String(content).trimEnd().split('\n').map(line=>`    ${line}`).join('\n');

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

export function parseAboutDisclosures(html){
  const source=String(html),sections=[];
  for(const [id,label] of Object.entries(ABOUT_SECTION_LABELS)){
    const body=source.match(new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>([\\s\\S]*?)<\\/section>`,'i'))?.[1];
    if(!body)throw new Error(`llms generation requires About section #${id}`);
    const heading=cleanLabel(body.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1]||'');
    if(!heading)throw new Error(`About section #${id} is missing an h2`);
    const paragraphs=[];
    for(const match of body.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)){
      if(/\bclass=["'][^"']*\beyebrow\b[^"']*["']/i.test(match[0]))continue;
      const text=cleanLabel(match[0]);
      if(text)paragraphs.push(text);
    }
    if(!paragraphs.length)throw new Error(`About section #${id} has no disclosure copy`);
    sections.push({id,label,heading,paragraphs});
  }
  return sections;
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

export function renderLlms({routes,counts,aboutSections=[],embeddedResources=[]}){
  const lines=[
    '# Canonical Shelf','',
    '> Canonical Shelf is an offline-capable Bible-learning and scholarly reference application combining six progressive guided courses, Scripture study, curated Topics, Practice, glossaries, and an evidence-aware study Guide.','',
    'This file is generated from the application’s primary navigation, About disclosures, runtime catalog, and canonical published learning/editorial documents. It is a derived discovery and context contract, not an independent authority for curriculum or theology. Canonical Shelf distinguishes biblical text, historical context and evidence, translation, interpretation, reception, doctrine, Canonical Shelf position, and application.','',
    `Current scored curriculum: ${counts.courses} courses, ${counts.units} units, ${counts.guidedLessons} guided lessons, ${counts.masteryActivities} mastery/capstone activities, and ${counts.scoredActivities} scored activities. Current reference library: ${counts.topics} Topics and ${counts.glossaryTerms} glossary terms.`,'',
    '## Primary destinations',''
  ];
  for(const route of routes)lines.push(`- [${route.label}](${route.href}): ${route.description}`);
  lines.push('','## Canonical learning and editorial resources','');
  for(const resource of PUBLIC_RESOURCES)lines.push(`- [${resource.label}](${resource.url}): ${resource.description}`);
  lines.push('','## Institutional disclosures','',
    'The disclosure text below is derived automatically from the linked About page so footer-facing institutional language and machine-readable discovery stay synchronized.','');
  for(const section of aboutSections){
    lines.push(`### ${section.label}`,'',`**${section.heading}**`,'');
    for(const paragraph of section.paragraphs)lines.push(paragraph,'');
  }
  lines.push('## Optional','');
  for(const resource of OPTIONAL_RESOURCES)lines.push(`- [${resource.label}](${resource.url}): ${resource.description}`);
  lines.push('','## Loaded canonical content','',
    'The About-page disclosures above and the human-readable canonical learning and editorial resources below are loaded automatically when this file is generated, so their contents stay synchronized with the published application. The large runtime catalog and Scripture corpus remain linked above rather than being duplicated verbatim.','');
  for(const resource of embeddedResources){
    lines.push(`### ${resource.label}`,'',`Source: [${resource.url}](${resource.url})`,'',indentContent(resource.content),'');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

export async function buildLlmsContract({root=process.cwd()}={}){
  const indexPath=join(root,'public/index.html'),aboutPath=join(root,'public/about.html'),catalogPath=join(root,'public/data/catalog.json');
  const [html,aboutHtml,catalogText]=await Promise.all([
    readFile(indexPath,'utf8'),
    readFile(aboutPath,'utf8'),
    readFile(catalogPath,'utf8').catch(error=>{throw new Error(`cannot read ${catalogPath}; run migration before generating llms.txt (${error.message})`)})
  ]);
  const routes=parsePrimaryNavigation(html),aboutSections=parseAboutDisclosures(aboutHtml),catalog=JSON.parse(catalogText),counts=summarizeCatalog(catalog),resources=[...PUBLIC_RESOURCES,...OPTIONAL_RESOURCES];
  for(const resource of resources)await access(join(root,'public',resource.url.replace(/^\//,'')));
  const embeddedResources=await Promise.all(PUBLIC_RESOURCES.filter(resource=>resource.embed).map(async resource=>({
    ...resource,
    content:await readFile(join(root,'public',resource.url.replace(/^\//,'')),'utf8')
  })));
  return {routes,counts,resources,aboutSections,embeddedResources,markdown:renderLlms({routes,counts,aboutSections,embeddedResources})};
}
