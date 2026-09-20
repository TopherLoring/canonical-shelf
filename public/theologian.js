import {parseReference,parseCorpus,BOOKS} from './bible.js';
import {queryStudyIndex,studyTerms,topicEvidenceDetail,lessonEvidenceDetail,bookEvidenceDetail,verseEvidenceDetail} from './study-index.js';

const sourceScore=(source,terms)=>{const text=`${source.title||''} ${source.author||''} ${source.publication||''} ${(source.supports||[]).join(' ')}`.toLowerCase();return terms.reduce((score,term)=>score+(text.includes(term)?1:0),0)};
const topSources=(sources,terms,limit=4)=>sources.map(source=>({source,score:sourceScore(source,terms)})).filter(entry=>entry.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(entry=>entry.source);

export function classifyTheologianIntent(question){
  const q=String(question||'').toLowerCase();
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
  const rows=parseCorpus(corpus).filter(row=>row.bn===ref.bn&&row.chapter===ref.chapter&&(!ref.start||(row.verse>=ref.start&&row.verse<=ref.end))).slice(0,12);
  return rows.length?[{type:'scripture',label:`${BOOKS[ref.bn-1]} ${ref.chapter}${ref.start?`:${ref.start}${ref.end!==ref.start?`–${ref.end}`:''}`:''}`,detail:rows.map(row=>`${row.verse} ${row.text}`).join(' '),evidence:'direct text',href:`/bible?book=${ref.bn}&chapter=${ref.chapter}${ref.start?`#v${ref.start}`:''}`}]:[];
}

function indexedEvidence(question,data,corpus,sources){
  const ref=parseReference(question),result=queryStudyIndex({query:question,data,corpus,limits:{scripture:3,topics:4,lessons:3,glossary:2,books:2,verses:3}}),out=[];
  if(!ref){
    for(const row of result.scripture)out.push({type:'scripture',label:`${BOOKS[row.bn-1]} ${row.chapter}:${row.verse}`,detail:row.text,evidence:'direct text',href:`/bible?book=${row.bn}&chapter=${row.chapter}#v${row.verse}`});
  }
  for(const topic of result.topics)out.push({type:'topic',label:topic.title,detail:topicEvidenceDetail(topic),id:topic.id,evidence:'curated reference',href:`/topics?topic=${encodeURIComponent(topic.id)}`});
  for(const lesson of result.lessons)out.push({type:'lesson',label:lesson.title,detail:lessonEvidenceDetail(lesson),id:lesson.id,evidence:'course instruction',href:`/course?unit=${encodeURIComponent(lesson.unitId)}&lesson=${encodeURIComponent(lesson.id)}`});
  for(const book of result.books)out.push({type:'book',label:`${book.name} profile`,detail:bookEvidenceDetail(book),id:String(book.n),evidence:'book orientation',href:`/bible?book=${book.n}&profile=1`});
  for(const verse of result.verses)out.push({type:'passage',label:verse.ref,detail:verseEvidenceDetail(verse),id:verse.ref,evidence:'curated passage context',href:`/practice?mode=verses&q=${encodeURIComponent(verse.ref)}`});
  for(const term of result.glossary)out.push({type:'glossary',label:term.term,detail:[term.quick,...(term.definitions||[]).slice(0,1)].filter(Boolean).join(' — ').slice(0,520),id:term.id||term.term,evidence:'reference definition',href:`/topics?mode=glossary&q=${encodeURIComponent(term.term)}`});
  const terms=result.terms.length?result.terms:studyTerms(question);
  for(const source of topSources(sources||[],terms,4))out.push({type:'source',label:source.title||source.id,detail:[source.author,source.publication,source.year].filter(Boolean).join(' · '),id:source.id,evidence:'scholarly source',limits:source.limits||'',href:source.url||null});
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
  const evidence=[...scriptureEvidence(question,corpus),...indexedEvidence(question,data,corpus,sources)];
  if(statement)evidence.unshift({type:'authority',label:'Canonical Shelf Statement of Faith',detail:'Normative ceiling for Canonical Shelf doctrinal claims.',evidence:'governing authority'});
  let position=protectedMessage||safePosition(intent,question,policy);
  const warnings=[];
  if(/romans\s*1/i.test(question))warnings.push('Romans 1 is interpreted within its idolatry, desire, judgment, and Romans 1–2 rhetorical context. Claims that it refers only to pederasty, temple prostitution, or exploitation are contested and must not be presented as settled fact.');
  if(/arsenokoitai/i.test(question))warnings.push('arsenokoitai is rare and its precise scope is debated; it should not be mapped simplistically onto modern sexual-orientation categories.');
  if(/malakoi/i.test(question))warnings.push('malakoi has a broader semantic and cultural history than the modern category “homosexual.”');
  if(intent==='ruth-naomi'&&!position.includes(policy.queerReception.ruthNaomi.boundary))position+=` ${policy.queerReception.ruthNaomi.boundary}`;
  for(const banned of policy.prohibitedOverstatements||[])if(position.toLowerCase().includes(String(banned).toLowerCase()))throw new Error('Theologian post-validation rejected a prohibited overstatement.');
  return {intent,position,method:policy.interpretiveRules||[],evidence,warnings,masteryProtected:!!protectedMessage};
}
