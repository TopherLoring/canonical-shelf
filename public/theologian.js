import {parseReference,parseCorpus,BOOKS} from './bible.js';

const STOP=new Set(['the','and','for','with','that','this','what','why','how','does','did','are','was','were','from','into','about','have','has','can','could','would','should','christian','christians','bible','biblical']);
const terms=s=>[...new Set(String(s||'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(x=>x.length>2&&!STOP.has(x)))];
const score=(text,qs)=>{const n=String(text||'').toLowerCase();return qs.reduce((s,t)=>s+(n.includes(t)?1:0),0)};
const top=(items,qs,textOf,limit=5)=>items.map(x=>({x,s:score(textOf(x),qs)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,limit).map(x=>x.x);

export function classifyTheologianIntent(question){
  const q=String(question||'').toLowerCase();
  // Specific interpretive cases must win over broader identity categories.
  if(/ruth|naomi/.test(q))return 'ruth-naomi';
  if(/gay|lesbian|homosexual|bisexual|lgbt|queer|same[- ]sex/.test(q))return 'lgbtq';
  if(/arsenokoitai|malakoi|greek|hebrew|lexic|word mean/.test(q))return 'lexical';
  if(/catholic|orthodox|luther|methodist|episcopal|baptist|denomination|tradition/.test(q))return 'tradition';
  if(parseReference(question))return 'scripture-reference';
  if(/doctrine|trinity|atonement|salvation|hell|predestination|resurrection|judgment/.test(q))return 'doctrine';
  return 'study';
}

function scriptureEvidence(question,corpus){
  const ref=parseReference(question);if(!ref)return[];
  const rows=parseCorpus(corpus).filter(r=>r.bn===ref.bn&&r.chapter===ref.chapter&&(!ref.start||(r.verse>=ref.start&&r.verse<=ref.end))).slice(0,12);
  return rows.length?[{type:'scripture',label:`${BOOKS[ref.bn-1]} ${ref.chapter}${ref.start?`:${ref.start}${ref.end!==ref.start?`–${ref.end}`:''}`:''}`,detail:rows.map(r=>`${r.verse} ${r.text}`).join(' '),evidence:'direct'}]:[];
}

function relatedEvidence(question,data,sources){
  const qs=terms(question),out=[];
  for(const t of top(data.topics||[],qs,x=>`${x.title} ${x.answer||''} ${(x.tags||[]).join(' ')}`,4))out.push({type:'topic',label:t.title,detail:(t.answer||t.summary||'').slice(0,320),id:t.id,evidence:'curated'});
  for(const u of top(data.units||[],qs,x=>`${x.title} ${x.scope||''}`,3))out.push({type:'course',label:`Unit ${u.sequence}: ${u.title}`,detail:u.scope||'',id:u.id,evidence:'curated'});
  for(const s of top(sources||[],qs,x=>`${x.title||''} ${x.author||''} ${(x.supports||[]).join(' ')}`,4))out.push({type:'source',label:s.title||s.id,detail:[s.author,s.publication,s.year].filter(Boolean).join(' · '),id:s.id,evidence:'scholarly',limits:s.limits||''});
  return out;
}

function masteryProtection(question,context){
  if(!context?.scored)return null;
  const q=String(question||'').toLowerCase();
  if(/answer|correct|choose|which option|solve|tell me what to pick|give me/.test(q))return 'This is a scored activity, so the Guide will not select or reveal the assessed answer. It can clarify terms, provide context, identify relevant evidence, or help you test your reasoning.';
  return null;
}

function safePosition(intent,question,policy){
  if(intent==='ruth-naomi')return `${policy.queerReception.ruthNaomi.allowed} ${policy.queerReception.ruthNaomi.boundary}`;
  if(intent==='lgbtq')return policy.lgbtq.claims.join(' ');
  if(intent==='lexical')return 'Original-language evidence can clarify semantic possibilities and historical usage, but lexical claims alone do not establish contemporary doctrine. Where meanings or scopes are disputed, the Guide labels that dispute rather than resolving it by assertion.';
  if(intent==='tradition')return 'The Guide may compare documented Christian traditions descriptively. A denominational position does not become Canonical Shelf doctrine unless the Statement of Faith or an explicit Canonical Shelf policy establishes it.';
  if(intent==='scripture-reference')return 'Begin with the biblical text itself, then distinguish context, interpretation, theology, reception history, and contemporary application.';
  if(intent==='doctrine')return policy.authority.rule;
  return 'The Guide helps separate what the text says, what historical or linguistic evidence supports, how interpreters reason, and what Canonical Shelf itself affirms.';
}

export function buildTheologianResponse({question,data,policy,statement='',sources=[],corpus='',context={}}){
  const intent=classifyTheologianIntent(question),protectedMessage=masteryProtection(question,context);
  const evidence=[...scriptureEvidence(question,corpus),...relatedEvidence(question,data,sources)];
  if(statement)evidence.unshift({type:'authority',label:'Canonical Shelf Statement of Faith',detail:'Normative ceiling for Canonical Shelf doctrinal claims.',evidence:'governing'});
  let position=protectedMessage||safePosition(intent,question,policy);
  const warnings=[];
  if(/romans\s*1/i.test(question))warnings.push('Romans 1 is interpreted within its idolatry, desire, judgment, and Romans 1–2 rhetorical context. Claims that it refers only to pederasty, temple prostitution, or exploitation are contested and must not be presented as settled fact.');
  if(/arsenokoitai/i.test(question))warnings.push('arsenokoitai is rare and its precise scope is debated; it should not be mapped simplistically onto modern sexual-orientation categories.');
  if(/malakoi/i.test(question))warnings.push('malakoi has a broader semantic and cultural history than the modern category “homosexual.”');
  if(intent==='ruth-naomi'&&!position.includes(policy.queerReception.ruthNaomi.boundary))position+=` ${policy.queerReception.ruthNaomi.boundary}`;
  for(const banned of policy.prohibitedOverstatements||[])if(position.toLowerCase().includes(String(banned).toLowerCase()))throw new Error('Theologian post-validation rejected a prohibited overstatement.');
  return {intent,position,method:policy.interpretiveRules||[],evidence,warnings,masteryProtected:!!protectedMessage};
}
