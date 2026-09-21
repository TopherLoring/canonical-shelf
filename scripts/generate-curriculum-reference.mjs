import {readFile,writeFile} from 'node:fs/promises';
import {courses as sourceCourses,units as sourceUnits} from '../content/curriculum/structure.mjs';

const CATALOG='public/data/catalog.json';
const OUTPUT='public/data/curriculum.md';
const catalog=JSON.parse(await readFile(CATALOG,'utf8'));

const courses=[...sourceCourses].sort((a,b)=>(a.sequence||0)-(b.sequence||0));
const units=[...sourceUnits].sort((a,b)=>(a.globalSequence||0)-(b.globalSequence||0));
const lessons=Array.isArray(catalog.lessons)?catalog.lessons:[];
const activities=Array.isArray(catalog.activities)?catalog.activities:[];
const masteryActivities=activities.filter(activity=>activity?.type==='mastery');
const topics=Array.isArray(catalog.topics)?catalog.topics:[];
const glossary=Array.isArray(catalog.glossary)?catalog.glossary:[];

if(courses.length!==6)throw new Error(`curriculum reference expected 6 courses; found ${courses.length}`);
if(catalog.courses?.length!==courses.length||catalog.units?.length!==units.length)throw new Error('runtime catalog course/unit structure does not match canonical curriculum source');
if(!lessons.length||!masteryActivities.length)throw new Error('curriculum reference requires populated lessons and mastery activities');

const lines=[
  '# Canonical Shelf Curriculum Reference','',
  '> Generated from the canonical six-course curriculum structure and current runtime catalog. Do not hand-edit this file; update the canonical curriculum sources and regenerate it.','',
  '## Current curriculum','',
  `- **${courses.length} courses**`,
  `- **${units.length} scored units**`,
  `- **${lessons.length} guided lessons**`,
  `- **${masteryActivities.length} mastery/capstone activities**`,
  `- **${activities.length} scored activities total**`,
  `- **${topics.length} curated Topics** outside course completion`,
  `- **${glossary.length} glossary terms** generated from lesson vocabulary`,'',
  'The curriculum is progressive and learner-facing. Stable inherited activity identifiers remain valid even when their current course or unit placement differs from historical versions. Topics are reference material rather than completion requirements, and Practice reinforces learned material without creating a second curriculum.','',
  '## Course and unit structure',''
];

for(const course of courses){
  lines.push(`### Course ${course.sequence} — ${course.title}`,'');
  if(course.scope)lines.push(course.scope,'');
  if(course.outcome)lines.push(`**Outcome:** ${course.outcome}`,'');
  const courseUnits=units.filter(unit=>unit.courseId===course.id).sort((a,b)=>(a.sequence||0)-(b.sequence||0));
  for(const unit of courseUnits){
    lines.push(`#### ${unit.sequence}. ${unit.title}`,'');
    if(unit.scope)lines.push(unit.scope,'');
  }
}

lines.push(
  '## Authority and use','',
  '- The runtime catalog is the machine-readable authority for current lesson/mastery placement, stable activity identifiers, glossary data, Topics, and learner-state resolution.',
  '- The canonical curriculum source under `content/curriculum/` is authoritative for the six-course and unit structure summarized here.',
  '- The Statement of Faith is the doctrinal ceiling for Canonical Shelf teaching.',
  '- Scored activities evaluate learning, interpretation, evidence use, recall, and reasoning; they do not require personal theological assent.',
  '- Historical migration documents remain useful for provenance and parity review but do not override this current generated curriculum reference.',''
);

await writeFile(OUTPUT,`${lines.join('\n')}\n`,'utf8');
console.log(`generated ${OUTPUT} (${courses.length} courses, ${units.length} units, ${lessons.length} guided lessons, ${masteryActivities.length} mastery/capstone activities)`);
