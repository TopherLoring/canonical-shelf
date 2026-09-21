import {readFile,writeFile} from 'node:fs/promises';
import {courses as sourceCourses,units as sourceUnits,questionThreads} from '../content/curriculum/structure.mjs';

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

const formatHours=minutes=>Number.isInteger(minutes/60)?`${minutes/60}`:(minutes/60).toFixed(1);
const timing=course=>`${formatHours(course.activeStudyMinutes.min)}–${formatHours(course.activeStudyMinutes.max)} hours active study`;
const courseName=id=>courses.find(course=>course.id===id)?.shortTitle||id;
const unitName=id=>units.find(unit=>unit.id===id)?.title||id;

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
  `- **${glossary.length} glossary terms** generated from lesson vocabulary`,
  `- **${questionThreads.length} recurring question threads** that connect foundations, biblical/historical encounters, interpretation, and later synthesis`,'',
  'The curriculum uses a questions-first spiral. Important doctrinal and difficult questions are introduced early, revisited where their biblical and historical evidence naturally appears, investigated with stronger interpretive tools, and synthesized later. Course 6 is therefore not the first exposure to theology or difficult questions.','',
  'Published time ranges estimate active first-pass study rather than retained mastery. Completion can occur within the estimated hours; retention continues through Practice and the 1 → 3 → 7 → 14 → 30 → 60 day review schedule.','',
  '## Course and unit structure',''
];

for(const course of courses){
  lines.push(`### Course ${course.sequence} — ${course.title}`,'');
  lines.push(`**Estimated active study:** ${timing(course)}.`,'');
  if(course.scope)lines.push(course.scope,'');
  if(course.learnerPromise)lines.push(`**Learning promise:** ${course.learnerPromise}`,'');
  if(course.outcome)lines.push(`**Outcome:** ${course.outcome}`,'');
  const courseUnits=units.filter(unit=>unit.courseId===course.id).sort((a,b)=>(a.sequence||0)-(b.sequence||0));
  for(const unit of courseUnits){
    lines.push(`#### ${unit.sequence}. ${unit.title}`,'');
    if(unit.scope)lines.push(unit.scope,'');
  }
}

lines.push('## Recurring question threads','');
for(const thread of questionThreads){
  lines.push(`### ${thread.title}`,'',thread.question,'');
  for(const point of thread.touchpoints){
    lines.push(`- **${point.stage}:** ${courseName(point.courseId)} → ${unitName(point.unitId)}`);
  }
  lines.push('');
}

lines.push(
  '## Authority and use','',
  '- The runtime catalog is the machine-readable authority for current lesson/mastery placement, stable activity identifiers, glossary data, Topics, and learner-state resolution.',
  '- The canonical curriculum source under `content/curriculum/` is authoritative for the six-course/unit structure, active-study planning ranges, and question-thread map summarized here.',
  '- Course time ranges are planning estimates for active study, not guarantees and not estimates of the full spaced-retention interval.',
  '- The Statement of Faith is the doctrinal ceiling for Canonical Shelf teaching.',
  '- Scored activities evaluate learning, interpretation, evidence use, recall, and reasoning; they do not require personal theological assent.',
  '- Historical migration documents remain useful for provenance and parity review but do not override this current generated curriculum reference.',''
);

await writeFile(OUTPUT,`${lines.join('\n')}\n`,'utf8');
console.log(`generated ${OUTPUT} (${courses.length} courses, ${units.length} units, ${lessons.length} guided lessons, ${masteryActivities.length} mastery/capstone activities, ${questionThreads.length} question threads)`);
