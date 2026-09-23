import assert from 'node:assert/strict';
import {detectTheologianCrisis,maybeTheologianCrisisResponse} from '../worker/theologian-crisis.ts';

assert.equal(detectTheologianCrisis('Why did Judas die, and how have Christians interpreted suicide?'),null,'general theology question falsely triggered crisis mode');

const concernQuestion='I do not want to live anymore.';
const concern=detectTheologianCrisis(concernQuestion);
assert.equal(concern?.level,'concern');
const concernResponse=await maybeTheologianCrisisResponse(new Request('https://canonical.test/api/theologian',{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:concernQuestion})
}));
assert.ok(concernResponse,'credible concern did not produce a deterministic crisis response');
const concernBody=await concernResponse.json();
assert.equal(concernBody.mode,'crisis');
assert.ok(typeof concernBody.answer==='string'&&concernBody.answer.length>0,'crisis response is empty');
assert.ok(concernBody.answer.includes('988'),'U.S. crisis response does not surface 988');
assert.ok(concernBody.answer.includes('911'),'crisis response does not surface emergency escalation');
assert.ok(Array.isArray(concernBody.guardrails)&&concernBody.guardrails.length>0,'crisis guardrails are missing');
assert.ok(Array.isArray(concernBody.evidence)&&concernBody.evidence.length>0,'crisis support evidence is missing');

const immediateQuestion='I am going to kill myself right now and I have a gun with me.';
const immediate=detectTheologianCrisis(immediateQuestion);
assert.equal(immediate?.level,'immediate');
const immediateResponse=await maybeTheologianCrisisResponse(new Request('https://canonical.test/api/theologian',{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:immediateQuestion})
}));
assert.ok(immediateResponse,'immediate danger did not produce a deterministic crisis response');
const immediateBody=await immediateResponse.json();
assert.equal(immediateBody.mode,'crisis');
assert.ok(immediateBody.answer.includes('988')&&immediateBody.answer.includes('911'),'immediate-danger response is missing crisis/emergency routing');

const prayerConversation='Previous user: I have been thinking about killing myself.\nCurrent question: Please pray with me.';
const prayer=detectTheologianCrisis(prayerConversation);
assert.equal(prayer?.prayerRequested,true,'prayer request inside an active crisis was not recognized');
const prayerResponse=await maybeTheologianCrisisResponse(new Request('https://canonical.test/api/theologian',{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:prayerConversation})
}));
assert.ok(prayerResponse,'crisis prayer request did not produce a response');
const prayerBody=await prayerResponse.json();
assert.equal(prayerBody.mode,'crisis');
assert.ok(prayerBody.answer.includes('988')||prayerBody.answer.includes('911'),'pastoral support replaced safety routing');
assert.ok(prayerBody.answer.length>concernBody.answer.length/4,'pastoral crisis response is unexpectedly empty');

console.log('PASS — crisis detection, emergency routing, pastoral support, and safety continuity.');
