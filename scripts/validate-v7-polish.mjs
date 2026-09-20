import {readFile} from 'node:fs/promises';
import {ORIENTATION_LESSON,ORIENTATION_LESSON_ID,ORIENTATION_UNIT_ID} from '../public/orientation.js';
import {THEMES} from '../public/theme.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const catalog=JSON.parse(await readFile('public/data/catalog.json','utf8'));

assert(catalog.units.length===25,`scored unit count changed: ${catalog.units.length}`);
assert(catalog.lessons.length===70,`guided lesson count changed: ${catalog.lessons.length}`);
assert(catalog.masteryIds.length===69,`mastery count changed: ${catalog.masteryIds.length}`);
assert(catalog.activities.length===139,`scored activity count changed: ${catalog.activities.length}`);
assert(catalog.lessons.some(lesson=>lesson.id==='begin'&&lesson.title==='Begin with the central story'),'Unit 1 Lesson 1 identity changed');
assert(catalog.activities.some(activity=>activity.id==='lesson:begin'),'lesson:begin activity ID missing');
assert(!catalog.activities.some(activity=>activity.id===`lesson:${ORIENTATION_LESSON_ID}`),'Unit 0 leaked into scored activity catalog');
assert(!catalog.units.some(unit=>unit.id===ORIENTATION_UNIT_ID),'Unit 0 leaked into the 25 scored units');
assert(ORIENTATION_LESSON.scored===false,'Unit 0 must remain explicitly non-scored');
assert(ORIENTATION_LESSON.unitSequence===0&&ORIENTATION_LESSON.lessonSequence===1,'Unit 0 / Lesson 1 numbering contract changed');
assert(ORIENTATION_LESSON.scenes.length>=10,'Unit 0 tutorial lost required breadth');

const orientationText=JSON.stringify(ORIENTATION_LESSON).toLowerCase();
for(const term of ['canon','chronology','translation','external','practice','independent','theme'])assert(orientationText.includes(term),`Unit 0 orientation missing ${term} coverage`);

const expectedThemes=['heritage','canonical-original','oxblood','slate-linen','illuminated-jewel','bookshelf-spectrum'];
assert(THEMES.length===expectedThemes.length,`expected ${expectedThemes.length} curated themes; found ${THEMES.length}`);
assert(JSON.stringify(THEMES.map(theme=>theme.id))===JSON.stringify(expectedThemes),'curated theme package IDs changed');

const tokens=await readFile('public/tokens.css','utf8');
for(const id of expectedThemes.slice(1))assert(tokens.includes(`data-theme="${id}"`),`theme tokens missing ${id}`);
for(const semantic of ['--canon-law','--canon-history-ot','--canon-wisdom','--canon-gospel','--canon-paul','--canon-apocalypse'])assert(tokens.includes(semantic),`semantic bookshelf color missing ${semantic}`);

const learning=await readFile('public/learning.js','utf8');
for(const marker of ['studyFocusShell','study-apparatus','sequence-board','argument-board','unit--orientation'])assert(learning.includes(marker),`Study Focus implementation missing ${marker}`);
assert(!learning.includes('<select name="p'),'rich challenge rendering regressed to generic select controls');
assert(learning.includes("value!==null&&value!==''"),'single-choice/scenario null-answer hardening missing');

const styles=await readFile('public/learning.css','utf8');
for(const marker of ['container-type:inline-size','study-nav','max-height:640px','study-apparatus.is-open'])assert(styles.includes(marker),`responsive Study Focus contract missing ${marker}`);

const sw=await readFile('public/sw.js','utf8');
for(const asset of ['/theme.js','/orientation.js','/study-controls.js'])assert(sw.includes(asset),`offline shell missing ${asset}`);

const packageJson=JSON.parse(await readFile('package.json','utf8'));
assert((packageJson.scripts?.validate||'').includes('validate-v7-polish.mjs'),'v7 polish validator is not wired into validate');

console.log('v7 v5-polish Unit 0/theme/Study Focus invariants passed');
