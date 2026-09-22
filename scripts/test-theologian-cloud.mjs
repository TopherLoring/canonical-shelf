import assert from 'node:assert/strict';
import {postTheologian,THEOLOGIAN_MODEL} from '../worker/theologian-ai.ts';

const assets={
  '/data/catalog.json':JSON.stringify({
    topics:[{id:'sexuality',title:'Sexuality and faithful relationships',answer:'Canonical Shelf evaluates relationships by fidelity, consent, honesty, mutuality, equality, responsibility, self-control, care, dignity, and self-giving love rather than partner gender.',tags:['same-sex','relationships']}],
    lessons:[{id:'romans-context',unitId:'unit.test',title:'Reading Romans in context',summary:'Read Romans 1 together with the rhetorical turn into Romans 2 and distinguish text from later application.'}],
    glossary:[{id:'arsenokoitai',term:'arsenokoitai',quick:'A rare Greek term whose precise scope is debated.'}]
  }),
  '/data/corpus.txt':'45\t1\t26\tFor this reason God gave them over to dishonorable passions. Even their women exchanged natural relations for unnatural ones.\n45\t1\t27\tLikewise, the men also abandoned natural relations with women and burned with lust for one another.\n45\t2\t1\tYou therefore have no excuse, you who pass judgment on another.\n',
  '/data/statement-of-faith.md':'# Statement of Faith\nCanonical Shelf affirms grace, dignity, and faithful Christian discipleship while treating disputed interpretation with care.\n',
  '/data/theology-policy.json':JSON.stringify({
    authority:{normativeCeiling:'Canonical Shelf Statement of Faith',rule:'Do not establish doctrine beyond the Statement of Faith.'},
    lgbtq:{status:'affirmed',claims:['LGBTQ people possess equal dignity and belonging.','Faithful same-sex relationships and marriage may embody Christian virtue.']},
    interpretiveRules:['Distinguish text, context, interpretation, doctrine, and application.'],
    queerReception:{firstClass:true},
    prohibitedOverstatements:['Romans 1 refers only to pederasty, temple prostitution, or exploitation.']
  }),
  '/data/theology-sources.json':JSON.stringify([{id:'oup.jennings.same-sex-biblical-world',title:'Same-Sex Relations in the Biblical World',author:'Theodore W. Jennings',publication:'The Oxford Handbook of Theology, Sexuality, and Gender',year:2014,url:'https://example.test/jennings',supports:['documented queer and same-sex-love readings in biblical scholarship'],limits:'Does not make every queer reading uncontested textual fact.'}])
};

const assetBinding={fetch:async request=>{
  const path=new URL(request.url).pathname;
  return path in assets?new Response(assets[path],{status:200}):new Response('missing',{status:404});
}};

let captured=null;
const goodEnv={
  ASSETS:assetBinding,
  AI:{
    run:async(model,input)=>{
      captured={model,input};
      return{response:'Canonical Shelf reads Romans 1 from the BSB text, within its larger rhetorical and historical context. Its stated position affirms LGBTQ dignity and permits faithful same-sex relationships while acknowledging that Christians interpret these passages differently.'};
    }
  }
};
const request=new Request('https://canonical.test/api/theologian',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:'How should Canonical Shelf understand same-sex relationships in Romans 1?',context:{path:'/bible?book=45&chapter=1'}})});
const response=await postTheologian(request,goodEnv);
assert.equal(response.status,200);
const body=await response.json();
assert.equal(body.mode,'cloud');
assert.equal(body.model,THEOLOGIAN_MODEL);
assert.equal(body.lgbtqResearchApplied,true);
assert.ok(body.guardrails.includes('Berean Standard Bible'));
assert.ok(body.evidence.some(item=>item.evidence==='vetted Canonical Shelf LGBTQ research'));
assert.equal(captured.model,THEOLOGIAN_MODEL);
const prompt=JSON.stringify(captured.input);
for(const required of ['Berean Standard Bible','Statement of Faith','Same-Sex Relations in the Biblical World','Theodore W. Jennings','Romans 1'])assert.ok(prompt.includes(required),`prompt missing ${required}`);

const badEnv={ASSETS:assetBinding,AI:{run:async()=>({response:'Romans 1 refers only to pederasty, temple prostitution, or exploitation.'})}};
const rejected=await postTheologian(new Request('https://canonical.test/api/theologian',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:'What does Romans 1 mean?'})}),badEnv);
assert.equal(rejected.status,422);
const rejectedBody=await rejected.json();
assert.equal(rejectedBody.fallback,true);

console.log('cloud theologian guardrail + BSB/site/Statement/LGBTQ research grounding passed');
