import type {ClaimDomain,DoctrinalStatus,EvidenceStatus,InterpretationType} from '../src/knowledge/model.ts';

type AssetBinding={fetch(request:Request):Promise<Response>};
type AiBinding={run(model:string,input:Record<string,unknown>):Promise<unknown>};

export interface TheologianAiEnv{
  ASSETS?:AssetBinding;
  AI?:AiBinding;
}

type Catalog={topics?:any[];lessons?:any[];activities?:any[];glossary?:any[];units?:any[];courses?:any[]};
type Policy={
  authority?:{normativeCeiling?:string;rule?:string;domains?:Record<string,string>};
  doctrinalStates?:DoctrinalStatus[];
  evidenceStates?:EvidenceStatus[];
  claimDomains?:ClaimDomain[];
  responseContract?:string[];
  learnerContext?:{allowed?:string[];forbidden?:string[];rule?:string};
  learnerAgency?:{rule?:string;requirements?:string[]};
  interpretiveFoundation?:{principle?:string;boundaries?:string[]};
  conversation?:Record<string,string>;
  masteryProtection?:{rule?:string;theologicalAssent?:string};
  lgbtq?:{status?:string;claims?:string[]};
  interpretiveRules?:string[];
  queerReception?:unknown;
  prohibitedOverstatements?:string[];
};
type Source={id?:string;type?:string;title?:string;author?:string;publication?:string;year?:number;url?:string;supports?:string[];limits?:string};
type CorpusRow={bn:number;chapter:number;verse:number;text:string};
type Evidence={
  type:string;
  label:string;
  detail:string;
  href?:string|null;
  evidence:string;
  limits?:string;
  evidenceStatus:EvidenceStatus;
  claimDomain:ClaimDomain;
  doctrinalStatus:DoctrinalStatus;
  interpretationType?:InterpretationType;
};
type Resources={catalog:Catalog;corpus:string;rows:CorpusRow[];statement:string;beliefContext:string;policy:Policy;sources:Source[]};
type HistoryTurn={role:'user'|'assistant';text:string};
type LearnerContext={route?:string;activity?:string;completed?:number;total?:number;reviewsDue?:number;recent?:string[];masteryActive?:boolean};

export const THEOLOGIAN_MODEL='@cf/qwen/qwen3-30b-a3b-fp8';
const MAX_QUESTION=1400;
const MAX_PATH=600;
const MAX_ANSWER=9000;
const STOP=new Set('a an and are as at be been being but by can could did do does for from had has have how i if in into is it its may might of on or our should so than that the their them then there these they this to under was we were what when where which who why will with would you your'.split(' '));
const BOOKS=['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
const BOOK_ALIASES=new Map<string,number>();
BOOKS.forEach((name,index)=>{
  const n=index+1;
  for(const alias of [name,name.replace('Psalms','Psalm'),name.replace('Song of Solomon','Song')])BOOK_ALIASES.set(alias.toLowerCase(),n);
});
Object.entries({gen:1,ex:2,exod:2,lev:3,num:4,deut:5,josh:6,judg:7,ps:19,psalm:19,prov:20,eccl:21,song:22,isa:23,jer:24,ezek:26,dan:27,matt:40,mk:41,lk:42,jn:43,acts:44,rom:45,gal:48,eph:49,phil:50,col:51,heb:58,jas:59,rev:66}).forEach(([alias,n])=>BOOK_ALIASES.set(alias,n));

let cached:Promise<Resources>|null=null;
const jsonHeaders={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:jsonHeaders});
const clean=(value:unknown,max=4000)=>String(value??'').replace(/\u0000/g,'').trim().slice(0,max);
const escapeRegExp=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

function parseCorpus(text:string):CorpusRow[]{
  const rows:CorpusRow[]=[];
  for(const line of text.split('\n')){
    const [book,chapter,verse,...rest]=line.split('\t');
    const bn=Number(book),c=Number(chapter),v=Number(verse);
    if(bn&&c&&v&&rest.length)rows.push({bn,chapter:c,verse:v,text:rest.join('\t')});
  }
  return rows;
}

async function assetText(env:TheologianAiEnv,requestUrl:string,path:string){
  if(!env.ASSETS)throw new Error('Static asset binding unavailable');
  const response=await env.ASSETS.fetch(new Request(new URL(path,requestUrl)));
  if(!response.ok)throw new Error(`Required Theologian asset unavailable: ${path}`);
  return response.text();
}

async function loadResources(env:TheologianAiEnv,requestUrl:string):Promise<Resources>{
  if(cached)return cached;
  cached=(async()=>{
    const [catalogText,corpus,statement,beliefContext,policyText,sourcesText]=await Promise.all([
      assetText(env,requestUrl,'/data/catalog.json'),
      assetText(env,requestUrl,'/data/corpus.txt'),
      assetText(env,requestUrl,'/data/statement-of-faith.md'),
      assetText(env,requestUrl,'/data/theologian-belief-context.md'),
      assetText(env,requestUrl,'/data/theology-policy.json'),
      assetText(env,requestUrl,'/data/theology-sources.json')
    ]);
    return {catalog:JSON.parse(catalogText),corpus,rows:parseCorpus(corpus),statement,beliefContext,policy:JSON.parse(policyText),sources:JSON.parse(sourcesText)};
  })().catch(error=>{cached=null;throw error});
  return cached;
}

function termsFor(question:string){
  return [...new Set(question.toLowerCase().replace(/[^a-z0-9'\- ]/g,' ').split(/\s+/).filter(term=>term.length>=3&&!STOP.has(term)))].slice(0,18);
}
function scoreText(value:unknown,terms:string[]){
  const text=String(value??'').toLowerCase();let score=0;
  for(const term of terms)if(text.includes(term))score+=term.length>7?3:2;
  return score;
}
function summarize(value:any,max=1800){
  if(!value)return'';
  const preferred=[value.title,value.scope,value.answer,value.summary,value.quick,value.description,value.outcome,value.hook,value.syn].filter(Boolean).join(' — ');
  return clean(preferred||JSON.stringify(value),max);
}
function rankItems(items:any[]|undefined,terms:string[],limit:number){
  return (items||[]).map(item=>({item,score:scoreText(JSON.stringify(item),terms)})).filter(row=>row.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(row=>row.item);
}

function detectReference(question:string){
  const entries=[...BOOK_ALIASES.entries()].sort((a,b)=>b[0].length-a[0].length);
  for(const [alias,bn] of entries){
    const regex=new RegExp(`(?:^|\\b)${escapeRegExp(alias)}\\s+(\\d+)(?::(\\d+)(?:[-–](\\d+))?)?`,'i');
    const match=question.match(regex);
    if(match)return{bn,chapter:Number(match[1]),start:match[2]?Number(match[2]):null,end:match[3]?Number(match[3]):match[2]?Number(match[2]):null};
  }
  return null;
}

const scriptureItem=(label:string,detail:string,href:string,evidence='Berean Standard Bible'):Evidence=>({type:'scripture',label,detail,href,evidence,evidenceStatus:'direct',claimDomain:'biblical-text',doctrinalStatus:'descriptive-only'});
const siteItem=(type:string,label:string,detail:string,href:string,evidence:string,claimDomain:ClaimDomain='interpretation'):Evidence=>({type,label,detail,href,evidence,evidenceStatus:'strong',claimDomain,doctrinalStatus:'descriptive-only'});

function scriptureEvidence(question:string,resources:Resources,terms:string[]):Evidence[]{
  const ref=detectReference(question);
  if(ref){
    let rows=resources.rows.filter(row=>row.bn===ref.bn&&row.chapter===ref.chapter);
    if(ref.start)rows=rows.filter(row=>row.verse>=ref.start!&&row.verse<=ref.end!);else rows=rows.slice(0,40);
    if(!rows.length)return[];
    return [scriptureItem(`${BOOKS[ref.bn-1]} ${ref.chapter}${ref.start?`:${ref.start}${ref.end!==ref.start?`–${ref.end}`:''}`:''}`,rows.map(row=>`${row.verse} ${row.text}`).join(' '),`/bible?book=${ref.bn}&chapter=${ref.chapter}${ref.start?`#v${ref.start}`:''}`)];
  }
  if(!terms.length)return[];
  return resources.rows.map(row=>({row,score:scoreText(row.text,terms)})).filter(entry=>entry.score>0).sort((a,b)=>b.score-a.score).slice(0,8).map(({row})=>scriptureItem(`${BOOKS[row.bn-1]} ${row.chapter}:${row.verse}`,row.text,`/bible?book=${row.bn}&chapter=${row.chapter}#v${row.verse}`));
}

function routeEvidence(path:string,resources:Resources):Evidence[]{
  if(!path)return[];
  let url:URL;try{url=new URL(path,'https://canonical.invalid')}catch{return[]}
  const out:Evidence[]=[];
  if(url.pathname==='/topics'&&url.searchParams.get('topic')){
    const id=url.searchParams.get('topic');
    const topic=(resources.catalog.topics||[]).find(item=>String(item.id)===id);
    if(topic)out.push(siteItem('topic',clean(topic.title||id,180),summarize(topic,2400),`/topics?topic=${encodeURIComponent(id||'')}`,'current Canonical Shelf Topic'));
  }
  if(url.pathname==='/course'){
    const lessonId=url.searchParams.get('lesson');
    const lesson=(resources.catalog.lessons||[]).find(item=>String(item.id)===lessonId);
    if(lesson)out.push(siteItem('lesson',clean(lesson.title||lessonId,180),summarize(lesson,2600),path,'current Canonical Shelf lesson'));
  }
  if(url.pathname==='/bible'){
    const bn=Number(url.searchParams.get('book')||0),chapter=Number(url.searchParams.get('chapter')||0);
    if(bn&&chapter){
      const rows=resources.rows.filter(row=>row.bn===bn&&row.chapter===chapter).slice(0,40);
      if(rows.length)out.push(scriptureItem(`${BOOKS[bn-1]} ${chapter}`,rows.map(row=>`${row.verse} ${row.text}`).join(' '),path,'current Berean Standard Bible reading'));
    }
  }
  return out;
}

function siteEvidence(question:string,path:string,resources:Resources,terms:string[]):Evidence[]{
  const out=[...routeEvidence(path,resources)];
  for(const topic of rankItems(resources.catalog.topics,terms,4))out.push(siteItem('topic',clean(topic.title||topic.id,180),summarize(topic,2000),`/topics?topic=${encodeURIComponent(String(topic.id||''))}`,'Canonical Shelf Topic'));
  for(const lesson of rankItems(resources.catalog.lessons,terms,3))out.push(siteItem('lesson',clean(lesson.title||lesson.id,180),summarize(lesson,2000),`/course?unit=${encodeURIComponent(String(lesson.unitId||''))}&lesson=${encodeURIComponent(String(lesson.id||''))}`,'Canonical Shelf course content'));
  for(const term of rankItems(resources.catalog.glossary,terms,3))out.push(siteItem('glossary',clean(term.term||term.title||term.id,180),summarize(term,1200),`/topics?mode=glossary&q=${encodeURIComponent(String(term.term||term.title||''))}`,'Canonical Shelf glossary','language'));
  const seen=new Set<string>();
  return out.filter(item=>{const key=`${item.type}:${item.label}:${item.href||''}`;if(seen.has(key))return false;seen.add(key);return true}).slice(0,12);
}

const LGBTQ_RE=/gay|lesbian|homosexual|bisexual|lgbt|queer|same[- ]sex|sexual orientation|arsenokoitai|malakoi|romans\s*1|leviticus\s*(18|20)|david.*jonathan|ruth.*naomi|eunuch/i;
const lexicalSource=(source:Source)=>/lexicon|greek|hebrew|arsenokoitai|malakoi|physis|to'?evah/i.test(`${source.type||''} ${source.title||''} ${(source.supports||[]).join(' ')}`);
function researchEvidence(question:string,resources:Resources,terms:string[]):Evidence[]{
  const lgbtq=LGBTQ_RE.test(question);
  const relevantTerms=lgbtq?[...new Set([...terms,'lgbtq','same-sex','sexuality','homosexual'])]:terms;
  const sources=rankItems(resources.sources,relevantTerms,lgbtq?8:4);
  return sources.map(source=>({
    type:'source',label:clean(source.title||source.id,220),detail:clean([source.author,source.publication,source.year,(source.supports||[]).join('; ')].filter(Boolean).join(' · '),1800),href:source.url||null,
    evidence:lgbtq?'vetted Canonical Shelf LGBTQ research':'vetted Canonical Shelf source',limits:clean(source.limits,900),evidenceStatus:'plausible' as EvidenceStatus,
    claimDomain:(lexicalSource(source)?'language':'interpretation') as ClaimDomain,doctrinalStatus:'descriptive-only' as DoctrinalStatus,interpretationType:'historical-critical' as InterpretationType
  }));
}

function formatEvidence(items:Evidence[]){
  if(!items.length)return'No directly matching evidence was retrieved.';
  return items.map((item,index)=>`${index+1}. ${item.label} [${item.evidenceStatus}; ${item.claimDomain}]\n${clean(item.detail,1800)}${item.limits?`\nLimit: ${clean(item.limits,500)}`:''}`).join('\n\n');
}

function supplementalBeliefContext(question:string,resources:Resources){
  const terms=termsFor(question);
  const sections=resources.beliefContext.split(/\n(?=##\s)/).map(section=>section.trim()).filter(Boolean);
  const ranked=sections.map((section,index)=>({section,index,score:scoreText(section,terms)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,3);
  return clean(ranked.sort((a,b)=>a.index-b.index).map(item=>item.section).join('\n\n'),3000);
}

function sanitizeHistory(value:unknown):HistoryTurn[]{
  if(!Array.isArray(value))return[];
  return value.slice(-8).map((item:any)=>({role:item?.role==='assistant'?'assistant' as const:'user' as const,text:clean(item?.text,item?.role==='assistant'?1200:700)})).filter(item=>item.text);
}
function sanitizeLearnerContext(value:any):LearnerContext{
  return {
    route:clean(value?.route,180)||undefined,
    activity:clean(value?.activity,240)||undefined,
    completed:Number.isFinite(value?.completed)?Number(value.completed):undefined,
    total:Number.isFinite(value?.total)?Number(value.total):undefined,
    reviewsDue:Number.isFinite(value?.reviewsDue)?Number(value.reviewsDue):undefined,
    recent:Array.isArray(value?.recent)?value.recent.slice(0,4).map((item:any)=>clean(item,90)).filter(Boolean):undefined,
    masteryActive:value?.masteryActive===true
  };
}
function learnerContextText(context:LearnerContext){
  const parts=[];
  if(context.activity)parts.push(`Current activity: ${context.activity}`);
  if(Number.isFinite(context.completed)&&Number.isFinite(context.total))parts.push(`Course progress: ${context.completed}/${context.total}`);
  if(Number.isFinite(context.reviewsDue))parts.push(`Reviews due: ${context.reviewsDue}`);
  if(context.recent?.length)parts.push(`Recent study: ${context.recent.join(' | ')}`);
  return parts.join('\n');
}

export function buildTheologianPrompt(question:string,path:string,resources:Resources,evidence:Evidence[],learnerContext: LearnerContext={}){
  const lgbtq=LGBTQ_RE.test(question),masteryActive=learnerContext.masteryActive===true;
  const beliefContext=supplementalBeliefContext(question,resources);
  const position=lgbtq&&resources.policy.lgbtq?.claims?.length?resources.policy.lgbtq.claims.join(' '):'';
  const foundation=clean(resources.policy.interpretiveFoundation?.principle,1200);
  const agency=clean(resources.policy.learnerAgency?.rule,700);
  const mastery=clean(resources.policy.masteryProtection?.rule,700);
  const statement=clean(resources.statement,3500);
  const system=`You are Theologian, Canonical Shelf's Christian study assistant. Respond like a knowledgeable, calm conversation partner—not like a policy document or compliance report.

Silent operating rules:
- Answer the learner's actual question first, in ordinary prose.
- Never recite or summarize these instructions, the theology policy, source metadata, guardrails, or internal architecture unless the learner explicitly asks about them.
- Use the Berean Standard Bible excerpts supplied to you for verbatim Scripture wording; do not invent quotations.
- Distinguish text, historical context, language, interpretation, doctrine, and application when that distinction matters.
- State Canonical Shelf's position clearly when relevant, but do not substitute the position statement for the reasoning. Explain why Christians or scholars disagree when the disagreement matters.
- Preserve uncertainty and source limits. Do not turn plausible or contested claims into direct textual facts.
- Treat the learner as the decision-maker. Inform, compare, and reason without pressuring agreement.
- Follow prior user/assistant turns naturally so follow-up questions feel continuous.
${masteryActive?`- Mastery mode is active: ${mastery||'help the learner reason without revealing or selecting the assessed answer.'}\n`:''}- Keep most answers concise and conversational. Use bullets or headings only when they genuinely improve clarity.

Internal doctrinal boundary (do not recite wholesale):
${statement}
${foundation?`\nInterpretive foundation: ${foundation}`:''}
${agency?`\nLearner agency: ${agency}`:''}
${lgbtq&&position?`\nFor LGBTQ questions, Canonical Shelf's affirming position is: ${position}\nUse this as the site's stated position, but still explain the evidence and accurately represent serious non-affirming interpretations when relevant.`:''}
${beliefContext?`\nRelevant supplemental belief context (lower authority; use only if useful):\n${beliefContext}`:''}`;
  const context=learnerContextText(learnerContext);
  const user=`${question}

Relevant evidence for this question:
${formatEvidence(evidence)}${path?`\n\nCurrent page: ${path}`:''}${context?`\n\nStudy context (not theological evidence):\n${context}`:''}

Give the learner-facing answer. Synthesize the evidence; do not merely repeat the evidence list or internal policy language.`;
  return {system,user,lgbtq,masteryActive};
}

export function validateGeneratedAnswer(answer:string,policy:Policy){
  const value=clean(answer,MAX_ANSWER);if(!value)return{ok:false,reason:'empty'};
  const normalized=value.toLowerCase().replace(/\s+/g,' ');
  const dangerous=[
    /romans 1[^.]{0,80}\bonly\b[^.]{0,80}(pederasty|temple prostitution|exploitation)/i,
    /arsenokoitai[^.]{0,80}\b(definitely means|simply means|means)\b[^.]{0,60}(child abusers|economic exploiters)/i,
    /malakoi[^.]{0,80}(direct|exact)[^.]{0,60}(modern gay|gay identity|homosexual)/i,
    /para physin[^.]{0,80}\bonly\b[^.]{0,80}against convention/i,
    /to['’]?evah[^.]{0,80}\bonly\b[^.]{0,80}ritual impurity/i,
    /ruth[^.]{0,50}naomi[^.]{0,80}(explicitly|definitely|clearly)[^.]{0,30}(lesbian|sexual couple)/i,
    /ethiopian eunuch[^.]{0,100}(direct|exact|simply)[^.]{0,60}(modern lgbt|modern transgender|modern gay)/i
  ];
  if(dangerous.some(pattern=>pattern.test(value)))return{ok:false,reason:'prohibited-overstatement'};
  for(const statementValue of policy.prohibitedOverstatements||[])if(normalized.includes(String(statementValue).toLowerCase().replace(/\s+/g,' ')))return{ok:false,reason:'policy-overstatement'};
  return{ok:true,answer:value};
}

function responseText(result:any){
  if(typeof result==='string')return result;if(typeof result?.response==='string')return result.response;if(typeof result?.result?.response==='string')return result.result.response;
  const choice=result?.choices?.[0];if(typeof choice?.message?.content==='string')return choice.message.content;if(typeof choice?.text==='string')return choice.text;return'';
}

export async function postTheologian(request:Request,env:TheologianAiEnv){
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  if(!env.AI)return reply({error:'Cloud Theologian is not configured',fallback:true},503);
  let input:any;try{input=await request.json()}catch{return reply({error:'Invalid JSON'},400)}
  const question=clean(input?.question,MAX_QUESTION),path=clean(input?.context?.path,MAX_PATH);
  if(question.length<2)return reply({error:'Question is required'},400);
  const history=sanitizeHistory(input?.history),learnerContext=sanitizeLearnerContext(input?.context?.learnerContext);
  const resources=await loadResources(env,request.url),terms=termsFor(question);
  const evidence=[...scriptureEvidence(question,resources,terms),...siteEvidence(question,path,resources,terms),...researchEvidence(question,resources,terms)];
  const unique:Evidence[]=[];const seen=new Set<string>();
  for(const item of evidence){const key=`${item.type}:${item.label}:${item.href||''}`;if(seen.has(key))continue;seen.add(key);unique.push(item)}
  const selected=unique.slice(0,14),prompt=buildTheologianPrompt(question,path,resources,selected,learnerContext);
  const messages=[{role:'system',content:prompt.system},...history.map(turn=>({role:turn.role,content:turn.text})),{role:'user',content:prompt.user}];
  let result:unknown;
  try{result=await env.AI.run(THEOLOGIAN_MODEL,{messages,max_tokens:1500,temperature:0.5,top_p:0.9})}catch{return reply({error:'Cloud synthesis unavailable',fallback:true},503)}
  const validated=validateGeneratedAnswer(responseText(result),resources.policy);
  if(!validated.ok)return reply({error:'Cloud response failed Canonical Shelf guardrail validation',fallback:true,reason:validated.reason},422);
  return reply({
    mode:'cloud',model:THEOLOGIAN_MODEL,answer:validated.answer,evidence:selected,
    guardrails:['Berean Standard Bible quotation integrity','Compact Canonical Shelf Statement of Faith doctrinal ceiling','Canonical Shelf theology/evidence policy','Published Canonical Shelf learner content','Attributed vetted scholarship and competing interpretations','Mastery answer protection'],
    evidenceModel:{doctrinalStates:resources.policy.doctrinalStates||[],evidenceStates:resources.policy.evidenceStates||[],claimDomains:resources.policy.claimDomains||[]},
    validation:{status:'passed',doctrinalCeiling:resources.policy.authority?.normativeCeiling||'Canonical Shelf Statement of Faith',masteryProtected:prompt.masteryActive},
    lgbtqResearchApplied:prompt.lgbtq
  });
}