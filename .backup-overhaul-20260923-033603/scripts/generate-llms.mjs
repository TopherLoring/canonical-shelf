import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {buildLlmsContract} from './llms-contract.mjs';

const contract=await buildLlmsContract();
await writeFile(join(process.cwd(),'public/llms.txt'),contract.markdown,'utf8');
console.log(`generated public/llms.txt (${contract.counts.courses} courses, ${contract.counts.units} units, ${contract.counts.guidedLessons} guided lessons, ${contract.counts.masteryActivities} mastery/capstone activities, ${contract.counts.scoredActivities} scored activities, ${contract.counts.glossaryTerms} glossary terms, ${contract.counts.topics} Topics; reachability: ${contract.reachabilityCoverage.embedded.length} embedded, ${contract.reachabilityCoverage.linked.length} linked, ${contract.reachabilityCoverage.excluded.length} excluded)`);
