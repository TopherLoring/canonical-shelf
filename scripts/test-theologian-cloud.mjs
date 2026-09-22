import assert from 'node:assert/strict';
import {postTheologian,THEOLOGIAN_MODEL} from '../worker/theologian-ai.ts';

const approvedFoundation="Scripture should be interpreted with serious attention to the biblical claims that God is love, salvation is grounded in God’s grace rather than human merit, and Jesus identifies love of God and love of neighbor as the greatest commandments through which the rest of the law is understood. Where Christians differ over the conditions, scope, or mechanics of salvation, those interpretations should be presented distinctly rather than treated as settled.";
const learnerAgencyRule="The learner is the decision-maker. The Theologian informs, compares, contextualizes, and tests reasoning; it does not pressure the learner to adopt Canonical Shelf doctrine or any competing interpretation.";

const assets={
  '/data/catalog.json':JSON.stringify({
    topics:[{id:'sexuality',title:'Sexuality and faithful relationships',answer:'Canonical Shelf evaluates relationships by fidelity, consent, honesty, mutuality, equality, responsibility, self-control, care, dignity, and self-giving love rather than partner gender.',tags:['same-sex','relationships']}],
    lessons:[{id:'romans-context',unitId:'unit.test',title:'Reading Romans in context',summary:'Read Romans 1 together with the rhetorical turn into Romans 2 and distinguish text from later application.'}],
    glossary:[{id:'arsenokoitai',term:'arsenokoitai',quick:'A rare Greek term whose precise scope is debated.'}]
  }),
  '/data/corpus.txt':'45\t1\t26\tFor this reason God gave them over to dishonorable passions. Even their women exchanged natural relations for unnatural ones.\n45\t1\t27\tLikewise, the men also abandoned natural relations with women and burned with lust for one another.\n45\t2\t1\tYou therefore have no excuse, you who pass judgment on another.\n',
  '/data/statement-of-faith.md':'# Statement of Faith\nYou are not asked to agree with this Statement of Faith to use Canonical Shelf. It is the doctrinal ceiling. Canonical Shelf affirms grace, dignity, and faithful Christian discipleship while treating disputed interpretation with care.\n',
  '/data/theologian-belief-context.md':'# Supplemental belief context\n## Sexuality, relationships, and inclusion\nCanonical Shelf’s longer belief context explains its affirming position in greater detail while remaining subordinate to the compact Statement of Faith.\n',
  '/data/theology-policy.json':JSON.stringify({
    version:4,
    authority:{normativeCeiling:'Canonical Shelf compact Statement of Faith',rule:'The Theologian may explain positions beyond the Statement of Faith but may not establish them as Canonical Shelf doctrine.',domains:{scriptureText:'BSB quotation authority',canonicalDoctrine:'compact faith ceiling',interpretivePolicy:'policy boundaries, interpretive foundation, and learner agency'}},
    doctrinalStates:['affirmed','bounded-inference','open','descriptive-only','outside-scope'],
    evidenceStates:['direct','strong','plausible','contested','speculative'],
    claimDomains:['biblical-text','history','language','doctrine','interpretation','ethics','reception-history','application'],
    interpretiveFoundation:{status:'approved',principle:approvedFoundation,boundaries:['Do not erase context.','Love and grace are not shortcuts.','Greatest commandments are not the only commands Jesus gave.','Salvation disagreements remain distinct.']},
    learnerAgency:{rule:learnerAgencyRule,requirements:['Present relevant documented viewpoints when beliefs, interpretations, manuscript judgments, lexical claims, or translations materially differ.','Explain why viewpoints differ and what evidence each relies on.','Identify meaningful translation differences when wording affects interpretation.','State Canonical Shelf\'s position as its position, not a conclusion the learner must adopt.','Never make agreement a condition of learning or receiving an answer.','Allow the learner to challenge Canonical Shelf, request alternatives, compare traditions, and form a considered conclusion.','Describe a tradition\'s required doctrine as that tradition\'s requirement, not an instruction to the learner.','Avoid false balance by preserving evidence-status distinctions.']},
    responseContract:['Answer first.','State Canonical Shelf position separately when relevant.','Where beliefs, interpretations, or translations materially differ, present relevant documented viewpoints and their evidence.','Treat the learner as the decision-maker and do not pressure them to adopt a doctrine.'],
    learnerContext:{allowed:['current route','review-due count'],forbidden:['Journal text','profile data'],rule:'Study context is not theological evidence.'},
    masteryProtection:{rule:'Do not reveal assessed answers.',theologicalAssent:'Personal theological assent is never scored.'},
    lgbtq:{status:'affirmed',claims:['LGBTQ people possess equal dignity and belonging.','Faithful same-sex relationships and marriage may embody Christian virtue.']},
    interpretiveRules:['Apply the approved interpretive foundation.','Preserve learner agency and free inquiry.','Distinguish biblical text, historical context, lexical evidence, interpretation, reception history, doctrine, Canonical Shelf position, and application.'],
    queerReception:{firstClass:true},
    prohibitedOverstatements:['Romans 1 refers only to pederasty, temple prostitution, or exploitation.']
  }),
  '/data/theology-sources.json':JSON.stringify([{id:'oup.jennings.same-sex-biblical-world',type:'academic-handbook-chapter',title:'Same-Sex Relations in the Biblical World',author:'Theodore W. Jennings',publication:'The Oxford Handbook of Theology, Sexuality, and Gender',year:2014,url:'https://example.test/jennings',supports:['documented queer and same-sex-love readings in biblical scholarship'],limits:'Does not make every queer reading uncontested textual fact.'}])
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
    return{response:'Canonical Shelf reads Romans 1 from the BSB text, within its larger rhetorical and historical context. Its stated position affirms LGBTQ dignity and permits faithful same-sex relationships while acknowledging that Christians interpret these passages differently and that the learner remains free to examine the evidence and reach a considered conclusion.'};
  }}
};
const longPrior=`Previous user: ${'context '.repeat(180)}\nPrevious Theologian: Earlier answer retained only for follow-up resolution.`;
const current='How should Canonical Shelf understand same-sex relationships in Romans 1?';
const request=new Request('https://canonical.test/api/theologian',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:`LEARNER CONTEXT (study-state summary only; not theological evidence or authority):\nCurrent route: /bible?book=45&chapter=1\nReviews due: 2\n\n${longPrior}\n\nCurrent question: ${current}`,context:{path:'/bible?book=45&chapter=1',conversationMode:'local-persistent-bounded',learnerContextPresent:true}})});
const response=await postTheologian(request,goodEnv);
assert.equal(response.status,200);
const body=await response.json();
assert.equal(body.mode,'cloud');
assert.equal(body.model,THEOLOGIAN_MODEL);
assert.equal(body.lgbtqResearchApplied,true);
assert.equal(body.validation.status,'passed');
assert.equal(body.validation.masteryProtected,false);
assert.ok(body.guardrails.some(item=>item.includes('Berean Standard Bible')));
assert.ok(body.guardrails.some(item=>item.includes('Statement of Faith doctrinal ceiling')));
assert.ok(body.guardrails.some(item=>item.includes('Supplemental long-form belief context')));
assert.ok(body.evidence.some(item=>item.evidence==='vetted Canonical Shelf LGBTQ research'));
assert.ok(body.evidence.every(item=>item.evidenceStatus&&item.claimDomain&&item.doctrinalStatus));
assert.ok(body.evidenceModel.evidenceStates.includes('contested'));
assert.ok(body.evidenceModel.claimDomains.includes('application'));
assert.equal(captured.model,THEOLOGIAN_MODEL);
const prompt=JSON.stringify(captured.input);
for(const required of ['AUTHORITY BY DOMAIN','THEOLOGY POLICY','Berean Standard Bible','COMPACT CANONICAL SHELF STATEMENT OF FAITH','SUPPLEMENTAL LONG-FORM BELIEF CONTEXT','lower authority','Same-Sex Relations in the Biblical World','Theodore W. Jennings',current,'LEARNER CONTEXT','never theological authority',approvedFoundation,learnerAgencyRule,'translation differences','challenge Canonical Shelf','false balance'])assert.ok(prompt.toLowerCase().includes(required.toLowerCase()),`prompt missing ${required}`);

let masteryPrompt='';
const masteryEnv={ASSETS:assetBinding,AI:{run:async(_model,input)=>{masteryPrompt=JSON.stringify(input);return{response:'I can help you compare the evidence and test your reasoning without selecting the assessed answer.'}}}};
const mastery=await postTheologian(new Request('https://canonical.test/api/theologian',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:'LEARNER CONTEXT (study-state summary only; not theological evidence or authority):\nCurrent activity is scored/mastery work: scaffold reasoning but never reveal or select the assessed answer.\n\nCurrent question: Which option should I choose?',context:{path:'/course?mastery=test'}})}),masteryEnv);
assert.equal(mastery.status,200);
const masteryBody=await mastery.json();
assert.equal(masteryBody.validation.masteryProtected,true);
assert.ok(masteryPrompt.includes('MASTERY MODE IS ACTIVE'));

const badEnv={ASSETS:assetBinding,AI:{run:async()=>({response:'Romans 1 refers only to pederasty, temple prostitution, or exploitation.'})}};
const rejected=await postTheologian(new Request('https://canonical.test/api/theologian',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:'Current question: What does Romans 1 mean?'})}),badEnv);
assert.equal(rejected.status,422);
const rejectedBody=await rejected.json();
assert.equal(rejectedBody.fallback,true);

console.log('cloud Theologian authority-domain + approved grace/love interpretive foundation + learner-agency/free-inquiry + material-viewpoint/translation-difference + typed evidence + compact faith ceiling + supplemental belief context + bounded conversation/state context + mastery protection + prohibited-overstatement gates passed');
