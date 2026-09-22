import assert from 'node:assert/strict';
import {detectTheologianCrisis,maybeTheologianCrisisResponse} from '../worker/theologian-crisis.ts';

assert.equal(detectTheologianCrisis('Why did Judas die, and how have Christians interpreted suicide?'),null,'general theology question falsely triggered crisis mode');

const concern=detectTheologianCrisis('Current question: I do not want to live anymore.');
assert.equal(concern?.level,'concern');
const concernResponse=await maybeTheologianCrisisResponse(new Request('https://canonical.test/api/theologian',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:'Current question: I do not want to live anymore.'})}));
assert.ok(concernResponse);
const concernBody=await concernResponse.json();
assert.equal(concernBody.mode,'crisis');
for(const required of ['988','911','God\'s love','grace','presence','power','Prayer','pastor','trusted','immediate danger'])assert.ok(concernBody.answer.includes(required),`crisis response missing ${required}`);
assert.ok(concernBody.guardrails.some(item=>item.includes('Prayer may accompany but never replace')));
assert.ok(concernBody.evidence.some(item=>item.label.includes('988 Suicide & Crisis Lifeline')));

const immediate=detectTheologianCrisis('Current question: I am going to kill myself right now and I have a gun with me.');
assert.equal(immediate?.level,'immediate');
const immediateResponse=await maybeTheologianCrisisResponse(new Request('https://canonical.test/api/theologian',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:'Current question: I am going to kill myself right now and I have a gun with me.'})}));
const immediateBody=await immediateResponse.json();
assert.ok(immediateBody.answer.includes('call 911'));
assert.ok(immediateBody.answer.includes('call or text 988'));
assert.ok(immediateBody.answer.includes('move away from anything you could use to hurt yourself'));

const prayerConversation=`Previous user: I want to die and I have been thinking about killing myself.\nPrevious Theologian: I am concerned about your safety.\n\nCurrent question: Please pray with me.`;
const prayer=detectTheologianCrisis(prayerConversation);
assert.equal(prayer?.prayerRequested,true);
const prayerResponse=await maybeTheologianCrisisResponse(new Request('https://canonical.test/api/theologian',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:prayerConversation})}));
const prayerBody=await prayerResponse.json();
assert.ok(prayerBody.answer.includes('God of mercy and love'));
assert.ok(prayerBody.answer.includes('strength'));
assert.ok(prayerBody.answer.includes('Please tell me one thing next: are you in immediate danger right now'));
assert.ok(prayerBody.answer.indexOf('God of mercy and love')<prayerBody.answer.lastIndexOf('immediate danger right now'),'prayer incorrectly ended the crisis sequence');

console.log('Theologian deterministic crisis detection + 988/911 routing + pastoral reassurance + prayer-followed-by-safety-check gates passed');
