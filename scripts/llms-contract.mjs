import {readFile,access} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const ROUTE_DESCRIPTIONS={
  home:'Personalized learner dashboard for orientation, progress, recommendations, and resuming the next relevant activity.',
  course:'Six-course guided curriculum containing sequenced lessons, mastery activities, and scored learning experiences.',
  bible:'Interactive 66-book Bible shelf for browsing books, reading biblical text, and accessing book-level historical, literary, and study context.',
  topics:'Curated theological and biblical reference material. Topics supplement the curriculum but do not count toward course completion.',
  practice:'Retrieval practice, review, and spaced reinforcement derived from learned material without creating a parallel curriculum.'
};

const ABOUT_SECTION_LABELS={
  faith:'Statement of Faith disclosure',
  about:'About Canonical Shelf',
  approach:'How this guide approaches Scripture',
  sources:'Sources & methodology',
  translations:'Translation information',
  accessibility:'Accessibility',
  privacy:'Privacy'
};

const PUBLIC_RESOURCES=[
  {label:'About & methodology',url:'/about.html',description:'Institutional disclosure for Canonical Shelf’s purpose, Scripture approach, sources and methodology, translation limits, accessibility posture, privacy model, and Statement of Faith disclosure.',embed:false},
  {label:'Curriculum reference',url:'/data/curriculum.md',description:'Human-readable reference for the current six-course guided curriculum, including its course, unit, lesson, and mastery structure.',embed:true},
  {label:'Runtime catalog',url:'/data/catalog.json',description:'Canonical curriculum, lesson, mastery, Topic, glossary, question-thread, challenge, feedback, stable-ID, and learning metadata. Its learner-facing substantive content is embedded below.',embed:false},
  {label:'Statement of Faith',url:'/data/statement-of-faith.md',description:"Canonical Shelf's authoritative statement of faith and doctrinal ceiling for instructional and theological content.",embed:true},
  {label:'Theology policy',url:'/data/theology-policy.json',description:'Machine-readable evidence, interpretation, doctrinal-boundary, and response rules used by the study Guide and theology layer.',embed:true},
  {label:'Theology sources',url:'/data/theology-sources.json',description:'Canonical metadata for public biblical, historical, scholarly, denominational, and theological sources available to the bounded evidence layer.',embed:true}
];

const EXCLUDED_FULL_TEXT_RESOURCES=[
  {label:'Full BSB Bible corpus',url:'/data/corpus.txt',description:'Complete Berean Standard Bible corpus used by Bible reading and search. It is intentionally linked but never embedded in llms.txt.'}
];

const decodeEntities=s=>String(s).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const cleanLabel=s=>decodeEntities(String(s).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const attr=(source,name)=>source.match(new RegExp(`\\b${name}=["']([^"']+)["']`,'i'))?.[1]||'';
const indentContent=content=>String(content).trimEnd().split('\n').map(line=>`    ${line}`).join('\n');
const jsonContent=value=>JSON.stringify(value,null,2);

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
  const hero=source.match(/<header\b[^>]*class=["'][^"']*\babout-page__hero\b[^"']*["'][^>]*>([\s\S]*?)<\/header>/i)?.[1];
  if(hero){
    const heading=cleanLabel(hero.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
    const paragraphs=[...hero.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)]
      .filter(match=>!/\bclass=["'][^"']*\beyebrow\b[^"']*["']/i.test(match[0]))
      .map(match=>cleanLabel(match[0]))
      .filter(Boolean);
    if(heading&&paragraphs.length)sections.push({id:'overview',label:'About page overview',heading,paragraphs});
  }
  for(const [id,label] of Object.entries(ABOUT_SECTION_LABELS)){
    const body=source.match(new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>([\\s\\S]*?)<\\/section>`,'i'))?.[1];
    if(!body)throw new Error(`llms generation requires About section #${id}`);
    const heading=cleanLabel(body.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1]||'');
    if(!heading)throw new Error(`About section #${id} is missing an h2`);
    const paragraphs=[];
    for(const match of body.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)){
      if(/\bclass=["'][^"']*\beyebrow\b[^"']*["']/i.test(match[0]))continue;
      const text=cleanLabel(match[0]);
      if(text&&!/^Loading the current Statement of Faith/i.test(text))paragraphs.push(text);
    }
    if(!paragraphs.length&&id!=='faith')throw new Error(`About section #${id} has no disclosure copy`);
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

// Keep every field that carries current learner-facing curriculum/reference content while
// omitting migration timestamps/provenance and compatibility-only bookkeeping that would
// make the derived corpus non-deterministic without adding content a learner can consume.
export function learnerCatalog(catalog){
  return {
    curriculumVersion:catalog.curriculumVersion??catalog.version??null,
    courses:catalog.courses||[],
    units:catalog.units||[],
    questionThreads:catalog.questionThreads||[],
    curriculumGuidance:catalog.curriculumGuidance||null,
    lessons:catalog.lessons||[],
    mastery:catalog.mastery||{},
    preservedLegacyMastery:catalog.legacyMastery||{},
    activities:catalog.activities||[],
    byCourse:catalog.byCourse||{},
    byUnit:catalog.byUnit||{},
    topics:catalog.topics||[],
    glossary:catalog.glossary||[],
    retentionDays:catalog.retentionDays||[]
  };
}

async function importPublicModule(root,name){
  return import(pathToFileURL(join(root,'public',name)).href);
}

export async function loadLearnerDatasets({root,catalog}){
  const [orientation,library,practice,verses,themes]=await Promise.all([
    importPublicModule(root,'orientation.js'),
    importPublicModule(root,'library-data.js'),
    importPublicModule(root,'practice-data.js'),
    importPublicModule(root,'verse-data.js'),
    importPublicModule(root,'theme.js')
  ]);

  const datasets=[
    {label:'Runtime learning catalog',url:'/data/catalog.json',data:learnerCatalog(catalog)},
    {label:'Orientation lesson',url:'/orientation.js',data:orientation.ORIENTATION_LESSON},
    {
      label:'Bible library reference',url:'/library-data.js',data:{
        categories:library.CATEGORIES,
        categoryOrder:library.CATEGORY_ORDER,
        books:library.LIBRARY_BOOKS,
        eras:library.ERAS,
        timelineAnchors:library.TIMELINE_ANCHORS,
        threads:library.THREADS,
        storyArc:library.STORY_ARC
      }
    },
    {
      label:'Practice content',url:'/practice-data.js',data:{
        ranks:practice.PRACTICE_RANKS,
        achievements:practice.PRACTICE_ACHIEVEMENTS,
        stages:practice.PRACTICE_STAGES,
        levels:practice.PRACTICE_LEVELS,
        gameFamilies:practice.PRACTICE_GAME_FAMILIES,
        scopes:practice.PRACTICE_SCOPES
      }
    },
    {
      label:'Curated passage library',url:'/verse-data.js',data:{
        count:verses.VERSE_COUNT,
        translations:verses.VERSE_TRANSLATIONS,
        themes:verses.VERSE_THEMES,
        lifeFacets:verses.VERSE_LIFE_FACETS,
        books:verses.VERSE_BOOKS,
        speakers:verses.VERSE_SPEAKERS,
        recipients:verses.VERSE_RECIPIENTS,
        verses:verses.VERSES
      }
    },
    {
      label:'Appearance themes',url:'/theme.js',data:{
        defaultThemeId:themes.DEFAULT_THEME_ID,
        themes:themes.THEMES
      }
    }
  ];

  const summary={
    orientationScenes:Array.isArray(orientation.ORIENTATION_LESSON?.scenes)?orientation.ORIENTATION_LESSON.scenes.length:0,
    books:Array.isArray(library.LIBRARY_BOOKS)?library.LIBRARY_BOOKS.length:0,
    practiceRanks:Array.isArray(practice.PRACTICE_RANKS)?practice.PRACTICE_RANKS.length:0,
    practiceAchievements:Array.isArray(practice.PRACTICE_ACHIEVEMENTS)?practice.PRACTICE_ACHIEVEMENTS.length:0,
    practiceStages:Array.isArray(practice.PRACTICE_STAGES)?practice.PRACTICE_STAGES.length:0,
    practiceLevels:Array.isArray(practice.PRACTICE_LEVELS)?practice.PRACTICE_LEVELS.length:0,
    curatedPassages:Array.isArray(verses.VERSES)?verses.VERSES.length:0,
    themes:Array.isArray(themes.THEMES)?themes.THEMES.length:0
  };
  return {datasets,summary};
}

export function renderLlms({routes,counts,aboutSections=[],embeddedResources=[],learnerDatasets=[]}){
  const lines=[
    '# Canonical Shelf','',
    '> Canonical Shelf is an offline-capable Bible-learning and scholarly reference application combining six progressive guided courses, Scripture study, curated Topics, Practice, glossaries, and an evidence-aware study Guide.','',
    'This file is generated from Canonical Shelf’s learner-facing learning, Bible-reference, Practice, editorial, institutional, and theology content. It is a derived machine-readable corpus, not an independent authority. The complete Berean Standard Bible corpus is intentionally excluded to avoid duplicating the full translation; curated Scripture excerpts intentionally used by Canonical Shelf remain included.','',
    `Current scored curriculum: ${counts.courses} courses, ${counts.units} units, ${counts.guidedLessons} guided lessons, ${counts.masteryActivities} mastery/capstone activities, and ${counts.scoredActivities} scored activities. Current reference library: ${counts.topics} Topics and ${counts.glossaryTerms} glossary terms.`,'',
    '## Primary destinations',''
  ];
  for(const route of routes)lines.push(`- [${route.label}](${route.href}): ${route.description}`);

  lines.push('','## Canonical learning and editorial resources','');
  for(const resource of PUBLIC_RESOURCES)lines.push(`- [${resource.label}](${resource.url}): ${resource.description}`);

  lines.push('','## Institutional disclosures','',
    'The disclosure text below is derived automatically from the linked About page so public institutional language and machine-readable context stay synchronized.','');
  for(const section of aboutSections){
    lines.push(`### ${section.label}`,'',`**${section.heading}**`,'');
    for(const paragraph of section.paragraphs)lines.push(paragraph,'');
  }

  lines.push('## Excluded full-text resource','');
  for(const resource of EXCLUDED_FULL_TEXT_RESOURCES)lines.push(`- [${resource.label}](${resource.url}): ${resource.description}`);

  lines.push('','## Complete learner-facing content','',
    'The content below is loaded automatically from current canonical published documents and public structured content modules. The full BSB corpus at /data/corpus.txt is not embedded; curated BSB excerpts used by lessons, Topics, Practice, or the curated passage library remain part of this corpus.','');

  for(const resource of embeddedResources){
    lines.push(`### ${resource.label}`,'',`Source: [${resource.url}](${resource.url})`,'',indentContent(resource.content),'');
  }
  for(const dataset of learnerDatasets){
    lines.push(`### ${dataset.label}`,'',`Source: [${dataset.url}](${dataset.url})`,'',indentContent(jsonContent(dataset.data)),'');
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

  const routes=parsePrimaryNavigation(html),aboutSections=parseAboutDisclosures(aboutHtml),catalog=JSON.parse(catalogText),counts=summarizeCatalog(catalog),resources=[...PUBLIC_RESOURCES,...EXCLUDED_FULL_TEXT_RESOURCES];
  for(const resource of resources)await access(join(root,'public',resource.url.replace(/^\//,'')));

  const embeddedResources=await Promise.all(PUBLIC_RESOURCES.filter(resource=>resource.embed).map(async resource=>({
    ...resource,
    content:await readFile(join(root,'public',resource.url.replace(/^\//,'')),'utf8')
  })));
  const {datasets:learnerDatasets,summary:learnerSummary}=await loadLearnerDatasets({root,catalog});

  if(learnerDatasets.some(dataset=>dataset.url==='/data/corpus.txt'))throw new Error('full BSB corpus must never be embedded in llms.txt');

  return {
    routes,counts,resources,aboutSections,embeddedResources,learnerDatasets,learnerSummary,
    markdown:renderLlms({routes,counts,aboutSections,embeddedResources,learnerDatasets})
  };
}
