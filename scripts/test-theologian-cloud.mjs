import assert from 'node:assert/strict';
import {postTheologian} from '../worker/theologian-ai.ts';

const assets={
  '/data/catalog.json':JSON.stringify({
    topics:[{id:'sexuality',title:'Sexuality and faithful relationships',answer:'A bounded authored topic answer.',tags:['relationships']}],
    lessons:[{id:'romans-context',unitId:'unit.test',title:'Reading Romans in context',summary:'Read Romans in literary and historical context.'}],
    glossary:[{id:'term',term:'example term',quick:'A short lexical note.'}]
  }),
  '/data/corpus.txt':'45\t1\t26\tExample verse text.\n45\t1\t27\tExample continuation.\n45\t2\t1\tExample rhetorical turn.\n',
  '/data/statement-of-faith.md':'# Statement of Faith\nA compact doctrinal ceiling for Canonical Shelf.\n',
  '/data/theologian-belief-context.md':'# Supplemental belief context\nLower-authority explanatory context.\n',
  '/data/theology-policy.json':JSON.stringify({
    version:4,
    authority:{normativeCeiling:'compact faith ceiling',rule:'Explain positions without turning them into required learner assent.',domains:{scriptureText:'Bible text',canonicalDoctrine:'faith ceiling',interpretivePolicy:'policy boundaries'}},
    doctrinalStates:['affirmed','bounded-inference','open','descriptive-only','outside-scope'],
    evidenceStates:['direct','strong','plausible','contested','speculative'],
    claimDomains:['biblical-text','history','language','doctrine','interpretation','ethics','reception-history','application'],
    interpretiveFoundation:{status:'approved',principle:'Interpret Scripture with context, grace, love, and intellectual honesty.',boundaries:['Do not erase context.']},
    learnerAgency:{rule:'The learner remains the decision-maker.',requirements:['Present material viewpoints when they differ.','Distinguish evidence from interpretation.']},
    responseContract:['Answer the question.','Preserve learner agency.','Distinguish evidence types.'],
    learnerContext:{allowed:['current route'],forbidden:['Journal text','profile data'],rule:'Study context is not theological evidence.'},
    masteryProtection:{rule:'Do not reveal assessed answers.',theologicalAssent:'Personal theological assent is never scored.'},
    lgbtq:{status:'affirmed',claims:['LGBTQ people possess equal dignity and belonging.','Faithful same-sex relationships may embody Christian virtue.']},
    interpretiveRules:['Distinguish text, context, interpretation, doctrine, and application.'],
    queerReception:{firstClass:true},
    prohibitedOverstatements:['Romans 1 refers only to pederasty, temple prostitution, or exploitation.']
  }),
  '/data/theology-sources.json':JSON.stringify([{id:'source.example',type:'academic-source',title:'Example scholarship',author:'Example Scholar',year:2020,url:'https://example.test/source',supports:['documented interpretive context'],limits:'Does not settle every interpretation.'}])
};

const assetBinding={fetch:async request=>{
  const path=new URL(request.url).pathname;
  return path in assets?new Response(assets[path],{status:200}):new Response('missing',{status:404});
}};

let captured=null;
const goodEnv={
  ASSETS:assetBinding,
  AI:{run:async(model,input)=>{
    captured={model,input};
    return{response:'The passage is best read by starting with what the text actually says, then asking what historical context and later interpretation add. Christians can disagree about application, and the learner remains free to examine the evidence and reach a considered conclusion.'};
  }}
};

const request=new Request('https://canonical.test/api/theologian',{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify({
    question:'How should I understand this passage?',
    history:[{role:'user',text:'What is the larger context?'},{role:'assistant',text:'Start with the argument around the passage.'}],
    context:{path:'/bible?book=45&chapter=1',learnerContext:{route:'/bible?book=45&chapter=1',activity:'Romans 1',completed:4,total:20,reviewsDue:1,masteryActive:false}}
  })
});
const response=await postTheologian(request,goodEnv);
assert.equal(response.status,200);
const body=await response.json();
assert.equal(body.mode,'cloud');
assert.ok(typeof body.answer==='string'&&body.answer.length>0,'cloud response is empty');
assert.ok(body.model,'cloud response does not identify the model used');
assert.equal(body.model,captured?.model,'reported model does not match executed model');
assert.equal(body.validation?.status,'passed');
assert.ok(Array.isArray(body.guardrails)&&body.guardrails.length>0,'guardrail metadata is missing');
assert.ok(Array.isArray(body.evidence)&&body.evidence.length>0,'evidence metadata is missing');
assert.ok(body.evidence.every(item=>item.evidenceStatus&&item.claimDomain&&item.doctrinalStatus),'evidence items are not typed');
assert.ok(body.evidenceModel&&Array.isArray(body.evidenceModel.evidenceStates)&&Array.isArray(body.evidenceModel.claimDomains),'evidence model metadata is missing');
const sentMessages=captured?.input?.messages;
assert.ok(Array.isArray(sentMessages)&&sentMessages.some(message=>message.role==='assistant')&&sentMessages.filter(message=>message.role==='user').length>=2,'prior dialogue was not preserved as conversation turns');

// Mastery protection follows structured learner state, independent of prompt wording.
const masteryEnv={ASSETS:assetBinding,AI:{run:async()=>({response:'I can help you compare the evidence and test your reasoning without selecting the assessed answer.'})}};
const mastery=await postTheologian(new Request('https://canonical.test/api/theologian',{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify({question:'Which option should I choose?',context:{path:'/course?mastery=test',learnerContext:{route:'/course?mastery=test',activity:'Mastery activity',masteryActive:true}}})
}),masteryEnv);
assert.equal(mastery.status,200);
const masteryBody=await mastery.json();
assert.equal(masteryBody.validation?.masteryProtected,true,'mastery protection was not activated');
assert.ok(typeof masteryBody.answer==='string'&&masteryBody.answer.length>0,'mastery-safe response is empty');

// Policy validation rejects a known prohibited overstatement regardless of prompt wording or model implementation.
const badEnv={ASSETS:assetBinding,AI:{run:async()=>({response:'Romans 1 refers only to pederasty, temple prostitution, or exploitation.'})}};
const rejected=await postTheologian(new Request('https://canonical.test/api/theologian',{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify({question:'What does Romans 1 mean?',context:{learnerContext:{masteryActive:false}}})
}),badEnv);
assert.equal(rejected.status,422);
const rejectedBody=await rejected.json();
assert.equal(rejectedBody.fallback,true,'policy-rejected cloud answer did not activate fallback');

console.log('PASS — Theologian conversation turns, evidence typing, learner agency, mastery protection, and fallback behavior.');