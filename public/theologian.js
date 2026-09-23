import {parseReference,parseCorpus,BOOKS} from './bible.js';
import {queryStudyIndex,studyTerms,topicEvidenceDetail,lessonEvidenceDetail,bookEvidenceDetail,verseEvidenceDetail} from './study-index.js';

const sourceScore=(source,terms)=>{const text=`${source.title||''} ${source.author||''} ${source.publication||''} ${(source.supports||[]).join(' ')}`.toLowerCase();return terms.reduce((score,term)=>score+(text.includes(term)?1:0),0)};
const topSources=(sources,terms,limit=4)=>sources.map(source=>({source,score:sourceScore(source,terms)})).filter(entry=>entry.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(entry=>entry.source);
const typed=(item,evidenceStatus,claimDomain,doctrinalStatus='descriptive-only',interpretationType='')=>({...item,evidenceStatus,claimDomain,doctrinalStatus,...(interpretationType?{interpretationType}:{})});
const sentence=(value,max=420)=>{const text=String(value||'').replace(/\s+/g,' ').trim();if(!text)return'';const first=text.match(/^.*?[.!?](?:\s|$)/)?.[0]||text;return first.length>max?`${first.slice(0,max-1).trim()}…`:first.trim()};

export function classifyTheologianIntent(question){
  const q=String(question||'').toLowerCase();
  if(/decalogue|ten commandments|ten words/.test(q))return 'decalogue';
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
  return rows.length?[typed({type:'scripture',label:`${BOOKS[ref.bn-1]} ${ref.chapter}${ref.start?`:${ref.start}${ref.end!==ref.start?`–${ref.end}`:''}`:''}`,detail:rows.map(row=>`${row.verse} ${row.text}`).join(' '),evidence:'direct text',href:`/bible?book=${ref.bn}&chapter=${ref.chapter}${ref.start?`#v${ref.start}`:''}`},'direct','biblical-text')]:[];
}

function indexedEvidence(question,data,corpus,sources){
  const ref=parseReference(question),result=queryStudyIndex({query:question,data,corpus,limits:{scripture:3,topics:4,lessons:3,glossary:2,books:2,verses:3}}),out=[];
  if(!ref){
    for(const row of result.scripture)out.push(typed({type:'scripture',label:`${BOOKS[row.bn-1]} ${row.chapter}:${row.verse}`,detail:row.text,evidence:'direct text',href:`/bible?book=${row.bn}&chapter=${row.chapter}#v${row.verse}`},'direct','biblical-text'));
  }
  for(const topic of result.topics)out.push(typed({type:'topic',label:topic.title,detail:topicEvidenceDetail(topic),id:topic.id,evidence:'curated reference',href:`/topics?topic=${encodeURIComponent(topic.id)}`},'strong','interpretation'));
  for(const lesson of result.lessons)out.push(typed({type:'lesson',label:lesson.title,detail:lessonEvidenceDetail(lesson),id:lesson.id,evidence:'course instruction',href:`/course?unit=${encodeURIComponent(lesson.unitId)}&lesson=${encodeURIComponent(lesson.id)}`},'strong','interpretation'));
  for(const book of result.books)out.push(typed({type:'book',label:`${book.name} profile`,detail:bookEvidenceDetail(book),id:String(book.n),evidence:'book orientation',href:`/bible?book=${book.n}&profile=1`},'strong','history'));
  for(const verse of result.verses)out.push(typed({type:'passage',label:verse.ref,detail:verseEvidenceDetail(verse),id:verse.ref,evidence:'curated passage context',href:`/practice?mode=verses&q=${encodeURIComponent(verse.ref)}`},'strong','interpretation'));
  for(const term of result.glossary)out.push(typed({type:'glossary',label:term.term,detail:[term.quick,...(term.definitions||[]).slice(0,1)].filter(Boolean).join(' — ').slice(0,520),id:term.id||term.term,evidence:'reference definition',href:`/topics?mode=glossary&q=${encodeURIComponent(term.term)}`},'strong','language'));
  const terms=result.terms.length?result.terms:studyTerms(question);
  for(const source of topSources(sources||[],terms,4))out.push(typed({type:'source',label:source.title||source.id,detail:[source.author,source.publication,source.year].filter(Boolean).join(' · '),id:source.id,evidence:'scholarly source',limits:source.limits||'',href:source.url||null},'plausible','interpretation','descriptive-only','historical-critical'));
  return out;
}

function masteryProtection(question,context){
  if(!context?.scored)return null;
  const q=String(question||'').toLowerCase();
  if(/answer|correct|choose|which option|solve|tell me what to pick|give me/.test(q))return 'This is a scored activity, so I won’t choose the assessed answer for you. I can still explain the terms, point you to the relevant evidence, or help you test the reasoning behind each option.';
  return null;
}

function agencyNote(policy){
  return policy?.learnerAgency?.rule||'You remain responsible for your own considered conclusions; I can explain and compare the evidence without requiring doctrinal agreement.';
}

function evidenceLead(evidence){
  const item=(evidence||[]).find(entry=>entry?.detail&&entry.type!=='authority');
  if(!item)return'';
  const summary=sentence(item.detail);
  return summary?`The strongest material I found here is ${item.label}: ${summary}`:'';
}

function safePosition(intent,question,policy,evidence){
  if(intent==='decalogue'){
    return 'The Decalogue is the Ten Commandments—the covenant commands given to Israel at Sinai and repeated in Deuteronomy 5. It is part of Mosaic law, but it is not the whole of Mosaic law: the Torah also contains many additional laws about worship, sacrifice, purity, courts, property, festivals, family life, and Israel’s social order. Later Christians often group those laws into “moral,” “civil,” and “ceremonial” categories, but those labels are later theological tools rather than headings the Torah itself uses. In practice, the Decalogue functions as a compact core of covenant obligations, while the rest of the law works out Israel’s covenant life in much greater detail.';
  }
  if(intent==='lgbtq'){
    const hostile=/hate|hates|hated|reject|rejection|hostile|hostility|against gay|anti[- ]gay/.test(String(question||'').toLowerCase());
    if(hostile)return 'The church is not one unified institution, and many churches actively affirm LGBTQ people. But many LGBTQ people have experienced real rejection from churches. That usually comes from a mix of traditional interpretations of a small set of biblical passages, inherited cultural assumptions about sex and gender, institutional fear of changing long-held teaching, and—sometimes—political or social hostility that gets treated as if it were theology. Canonical Shelf’s position is affirming, but a useful study answer should still distinguish sincere non-affirming biblical arguments from prejudice or mistreatment. Those are not the same thing, even when they overlap in practice.';
    return 'Canonical Shelf takes an affirming position: LGBTQ people have equal dignity and belonging, and sexual orientation is not treated as something a person must renounce to receive grace or participate in Christian life. The harder interpretive work is explaining how disputed passages should be read in their literary, historical, and linguistic contexts, and why affirming and non-affirming Christians reach different conclusions. I can walk through those passages one at a time rather than treating the policy conclusion itself as the argument.';
  }
  if(intent==='ruth-naomi')return `${policy?.queerReception?.ruthNaomi?.allowed||'Some interpreters read Ruth and Naomi through queer or same-sex-love lenses.'} The text itself does not explicitly identify them as sexual partners, so that reading belongs to reception history and interpretation rather than uncontested textual fact.`;
  if(intent==='lexical')return 'The original-language evidence can narrow the possibilities, but a Greek or Hebrew word rarely settles a modern theological question by itself. The useful approach is to look at the word’s range of meaning, its literary context, comparable ancient usage, and how the larger argument works before moving from language to doctrine.';
  if(intent==='tradition')return 'Christian traditions can be compared by asking what each one actually teaches, which texts and authorities it relies on, and where its reasoning differs from other traditions. A denominational position is evidence about that tradition; it does not automatically become Canonical Shelf doctrine or something you must personally adopt.';
  if(intent==='scripture-reference')return 'Start with the passage itself, then ask what belongs to the text, what comes from historical or linguistic context, and what is a later interpretive or theological conclusion. That sequence keeps us from reading a doctrine back into the verse before we have established what the passage is doing in context.';
  if(intent==='doctrine')return 'This is a doctrinal question, so the useful answer is to separate the biblical claims from the theological models Christians build from them. Canonical Shelf can state its own position, but it should also show where major Christian interpretations differ and what evidence or assumptions drive those differences.';
  const lead=evidenceLead(evidence);
  if(lead)return `${lead} From there, the key is to distinguish the source itself from the interpretation we build on top of it. If you want, I can take the next step and explain how the pieces fit together rather than just listing the evidence.`;
  return 'I can help with that. The best way to approach it is to answer the question directly, then separate the biblical text, historical or linguistic context, and later interpretation so we can see which conclusions are strongly supported and which remain debated.';
}

export function buildTheologianResponse({question,data,policy,statement='',sources=[],corpus='',context={}}){
  const intent=classifyTheologianIntent(question),protectedMessage=masteryProtection(question,context);
  const evidence=[...scriptureEvidence(question,corpus),...indexedEvidence(question,data,corpus,sources)];
  if(statement)evidence.unshift(typed({type:'authority',label:'Canonical Shelf Statement of Faith',detail:'Doctrinal ceiling for Canonical Shelf doctrinal claims.',evidence:'governing authority'},'direct','doctrine','affirmed'));
  let position=protectedMessage||safePosition(intent,question,policy,evidence);
  const warnings=[];
  if(/romans\s*1/i.test(question))warnings.push('Romans 1 belongs inside Paul’s larger argument about idolatry, desire, judgment, and the rhetorical turn in Romans 2. Claims that it refers only to pederasty, temple prostitution, or exploitation are contested and should not be presented as settled fact.');
  if(/arsenokoitai/i.test(question))warnings.push('arsenokoitai is rare and its precise social scope is debated; it should not be mapped simplistically onto a modern sexual-orientation category.');
  if(/malakoi/i.test(question))warnings.push('malakoi has a broader semantic and cultural history than the modern category “homosexual.”');
  if(intent==='ruth-naomi'&&policy?.queerReception?.ruthNaomi?.boundary&&!position.includes(policy.queerReception.ruthNaomi.boundary))position+=` ${policy.queerReception.ruthNaomi.boundary}`;
  for(const banned of policy?.prohibitedOverstatements||[])if(position.toLowerCase().includes(String(banned).toLowerCase()))throw new Error('Theologian post-validation rejected a prohibited overstatement.');
  return {intent,position,canonicalPosition:intent==='lgbtq'||intent==='doctrine'||intent==='tradition'||intent==='ruth-naomi'?position:null,method:policy?.interpretiveRules||[],evidence,warnings,masteryProtected:!!protectedMessage,learnerAgency:agencyNote(policy)};
}