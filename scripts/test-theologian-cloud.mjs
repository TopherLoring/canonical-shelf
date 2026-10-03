import assert from 'node:assert/strict';
import {buildTheologianResponse} from '../public/theologian.js';
import {postTheologian} from '../worker/theologian-ai.ts';

const assets={
  '/data/catalog.json':JSON.stringify({
    topics:[{id:'sexuality',title:'Sexuality and faithful relationships',answer:'A bounded authored topic answer.',tags:['relationships']}],
    lessons:[{id:'romans-context',unitId:'unit.test',title:'Reading Romans in context',summary:'Read Romans in literary and historical context.'}],
    glossary:[{id:'term',term:'example term',quick:'A short lexical note.'}]
  }),
  '/data/corpus.txt':'40\t3\t13\tJesus came to be baptized by John.\n44\t22\t16\tGet up and be baptized.\n45\t1\t26\tExample verse text.\n45\t1\t27\tExample continuation.\n45\t2\t1\tExample rhetorical turn.\n',
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
// Retrieval must follow the conversation, while explicit topic changes start fresh.
const prior=[{role:'user',text:'Explain Romans 1:26'},{role:'assistant',text:'Let us look at the passage in context.'}];
for (const question of ['Why?', 'Can you explain that more simply?']) {
  const response=await postTheologian(new Request('https://canonical.test/api/theologian',{
    method:'POST',body:JSON.stringify({question,history:prior})
  }),goodEnv);
  const result=await response.json();
  assert.ok(result.evidence.some(item=>item.type==='scripture'&&item.label==='Romans 1:26'),'follow-up lost the referenced passage');
}
const greeting=await postTheologian(new Request('https://canonical.test/api/theologian',{
  method:'POST',body:JSON.stringify({question:'Thanks!',history:prior})
}),goodEnv);
assert.deepEqual((await greeting.json()).evidence,[],'acknowledgment retrieved unrelated theological evidence');
const offline=question=>buildTheologianResponse({question,data:{},policy:{},context:{history:prior},corpus:assets['/data/corpus.txt']});
assert.ok(offline('Thanks!').position.length<100,'offline acknowledgment became a lecture');
assert.ok(offline('Why?').evidence.some(item=>item.label==='Romans 1:26'),'offline follow-up lost the passage');
assert.ok(!offline('Tell me about baptism').evidence.some(item=>item.label==='Romans 1:26'),'new topic inherited the old passage');
console.log('PASS — conversational retrieval and offline acknowledgments.');

// Real feedback examples: UI facts and conversation repair must not become verse searches.
const {CATEGORIES,CATEGORY_ORDER}=await import('../public/library-data.js');
for(const question of ['what are the 9 categories of the biblical canon','what are the 9 categories that define the colors of the bookshelf on this page?']){
  const response=await postTheologian(new Request('https://canonical.test/api/theologian',{
    method:'POST',body:JSON.stringify({question,context:{path:'/home'}})
  }),goodEnv);
  const {evidence}=await response.json();
  for(const key of CATEGORY_ORDER)assert.ok(evidence.some(item=>item.detail.includes(CATEGORIES[key].name)),`missing bookshelf category ${key}`);
  assert.ok(!evidence.some(item=>item.type==='scripture'),'bookshelf question retrieved unrelated verses');
  const local=buildTheologianResponse({question,data:{},policy:{}});
  for(const key of CATEGORY_ORDER)assert.ok(local.position.includes(CATEGORIES[key].name),'offline bookshelf answer is missing a category');
}
for(const question of ['are you still broken?', "That is not what I asked", 'You misunderstood me']){
  const response=await postTheologian(new Request('https://canonical.test/api/theologian',{
    method:'POST',body:JSON.stringify({question,history:prior,context:{path:'/course?lesson=romans-context'}})
  }),goodEnv);
  assert.deepEqual((await response.json()).evidence,[],'conversation feedback became theological retrieval');
  const local=buildTheologianResponse({question,data:{},policy:{}});
  assert.ok(local.position.length<200,'conversation repair became a lecture');
}
console.log('PASS — bookshelf grounding and conversation repair from user feedback.');

const baptism=await postTheologian(new Request('https://canonical.test/api/theologian',{
  method:'POST',body:JSON.stringify({question:'Why did jeus get baptized/'})
}),goodEnv);
const baptismEvidence=(await baptism.json()).evidence;
assert.ok(baptismEvidence.some(item=>item.label==='Matthew 3:13'),'missed Jesus baptism evidence after a common typo');
assert.ok(!baptismEvidence.some(item=>item.label==='Acts 22:16'),'single-word baptism match displaced subject-specific evidence');
console.log('PASS — subject-specific Scripture retrieval.');

// Browsing is opt-in per question and must fail closed on billing uncertainty.
const originalFetch=globalThis.fetch;
const freeUsage={account:{current_plan:'Researcher',plan_usage:12,plan_limit:1000,paygo_usage:0,paygo_limit:0},key:{usage:12,limit:1000}};
let usage=freeUsage,searches=0,searchBody=null;
globalThis.fetch=async (url,options)=>{
  if(String(url)==='https://api.tavily.com/usage')return Response.json(usage);
  assert.equal(String(url),'https://api.tavily.com/search');
  searches++;searchBody=JSON.parse(options.body);
  return Response.json({results:[{title:'A historical source',url:'https://example.org/history',content:'A historical finding.',raw_content:'A historical finding with context.'},{title:'Unsafe link',url:'javascript:alert(1)',content:'bad'}]});
};
const browse=()=>postTheologian(new Request('https://canonical.test/api/theologian',{
  method:'POST',body:JSON.stringify({question:'Search the web for historical sources on baptism',history:[{role:'user',text:'PRIVATE HISTORY MUST NOT REACH SEARCH'}]})
}),{...goodEnv,TAVILY_API_KEY:'test-key'});
try{
  const response=await browse(),body=await response.json();
  assert.equal(searches,1,'explicit web request did not search');
  assert.ok(body.evidence.some(item=>item.href==='https://example.org/history'),'web evidence missing');
  assert.ok(!body.evidence.some(item=>String(item.href).startsWith('javascript:')),'unsafe web URL accepted');
  assert.equal(searchBody.search_depth,'basic');
  assert.equal(searchBody.auto_parameters,false);
  assert.ok(!JSON.stringify(searchBody).includes('PRIVATE HISTORY'),'history leaked to search provider');
  // The configured Researcher account reports null when pay-as-you-go is disabled.
  usage={...freeUsage,account:{...freeUsage.account,paygo_limit:null}};
  assert.equal((await (await browse()).json()).webSearch.status,'searched','disabled paygo null was rejected');
  const allowedSearches=searches;
  for(const account of [
    {...freeUsage.account,paygo_limit:100},
    {...freeUsage.account,current_plan:'Bootstrap'},
    {...freeUsage.account,plan_usage:1000},
    {}
  ]){
    usage={...freeUsage,account};
    const blocked=await browse();assert.equal(blocked.status,200,'unavailable browsing broke chat');
    assert.equal(searches,allowedSearches,'search ran without a verified free allowance');
  }
}finally{globalThis.fetch=originalFetch}
console.log('PASS — free-only browsing, source links, and search privacy.');
