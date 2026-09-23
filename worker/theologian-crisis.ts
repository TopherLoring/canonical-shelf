import crisisPolicy from '../content/theology/crisis-policy.json';

type CrisisLevel='concern'|'immediate';

type CrisisDetection={level:CrisisLevel;latest:string;prayerRequested:boolean};

const clean=(value:unknown,max=5000)=>String(value??'').replace(/\u0000/g,'').trim().slice(0,max);
const latestQuestion=(value:string)=>clean(String(value||'').split(/Current question:\s*/i).pop()||value,1600);

const CONCERN_PATTERNS=[
  /\b(i\s+(?:want|need|wish)\s+to\s+die)\b/i,
  /\b(i\s+(?:do not|don't)\s+want\s+to\s+(?:live|be alive))\b/i,
  /\b(i(?:'m| am)?\s+(?:feeling\s+)?suicidal)\b/i,
  /\b(i\s+(?:have|am having|keep having)\s+suicidal\s+thoughts?)\b/i,
  /\b(i\s+(?:am|have been|'m)\s+thinking\s+about\s+(?:suicide|killing myself|ending my life))\b/i,
  /\b(kill|hurt|harm)\s+myself\b/i,
  /\b(end|take)\s+my\s+(?:own\s+)?life\b/i,
  /\bself[- ]harm(?:ing)?\b/i,
  /\bcut(?:ting)?\s+myself\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\b(?:i\s+)?can(?:not|'t)\s+go\s+on\b/i,
  /\bwish\s+i\s+(?:was|were)\s+dead\b/i
];
const ATTEMPT_PATTERNS=[
  /\b(i\s+(?:am|['’]m)\s+(?:about\s+to|going\s+to)\s+(?:kill myself|end my life|take my life|hurt myself))\b/i,
  /\b(i\s+(?:have|['’]ve)\s+(?:a\s+)?plan\s+to\s+(?:kill myself|end my life|hurt myself))\b/i,
  /\b(i\s+(?:took|have taken|['’]ve taken|swallowed)\s+(?:too many|a lot of|all of|the)\s+(?:pills|medicine|medication|drugs))\b/i,
  /\b(i\s+(?:overdosed|shot myself|stabbed myself))\b/i,
  /\b(i\s+am\s+(?:bleeding|hanging))\b/i
];
const MEANS_PATTERNS=[
  /\b(?:gun|firearm|weapon|knife|rope|pills|medication|medicine|drugs)\b/i,
  /\b(?:in my hand|with me|right here|loaded|ready)\b/i
];
const IMMEDIACY_PATTERNS=[/\bright now\b/i,/\btonight\b/i,/\bthis minute\b/i,/\bimmediately\b/i,/\bcan(?:not|'t) stop myself\b/i];

export function detectTheologianCrisis(value:unknown):CrisisDetection|null{
  const full=clean(value,12000);if(!full)return null;
  const latest=latestQuestion(full);
  const concern=CONCERN_PATTERNS.some(pattern=>pattern.test(full));
  const attempt=ATTEMPT_PATTERNS.some(pattern=>pattern.test(full));
  const means=MEANS_PATTERNS.some(pattern=>pattern.test(full));
  const immediate=attempt||(concern&&means&&IMMEDIACY_PATTERNS.some(pattern=>pattern.test(full)));
  if(!concern&&!attempt)return null;
  return {level:immediate?'immediate':'concern',latest,prayerRequested:/\b(?:pray|prayer|pray with me|can you pray)\b/i.test(latest)};
}

function prayerText(){
  return `If you would like to pray right now, you can use these words with me:\n\nGod of mercy and love, stay close in this moment. Bring safety, comfort, healing, courage, and hope. Give strength for the next step, wisdom to accept human help, and people who can remain present. Carry what feels unbearable and give enough strength to keep going through this moment. Amen.`;
}

export function buildCrisisAnswer(detection:CrisisDetection){
  const emergency=detection.level==='immediate'
    ?`This sounds like an immediate emergency. Please call 911 or your local emergency service now, or go to the nearest emergency department. In the United States, you can also call or text 988 for a trained crisis counselor while emergency help is being arranged. If you can, put the phone on speaker, move away from anything you could use to hurt yourself, and get another person physically with you.`
    :`I'm concerned about your safety. In the United States, call or text 988 now to reach the 988 Suicide & Crisis Lifeline. If you may act on these thoughts, have already harmed yourself, taken an overdose, or are in immediate physical danger, call 911 or go to the nearest emergency department.`;
  const pastoral=`Doubt, depression, despair, suicidal thoughts, or self-harm do not place you beyond God's love, grace, presence, or power. You do not need to prove that your faith is strong enough before you deserve help. Prayer and receiving crisis, medical, counseling, pastoral, or community care can belong together. You can ask God for comfort, healing, courage, hope, strength, and perseverance through this difficult period without treating prayer as a substitute for immediate human help.`;
  const community=`Please also reach out to someone you trust who can stay with you—such as a family member, friend, pastor, chaplain, clergy member, spiritual director, or another trusted person who shares your faith. If there are weapons, medications, or other means nearby, create distance from them and ask someone else to secure them if that can be done safely.`;
  const prayer=detection.prayerRequested?prayerText():`If you want, I can pray with you here, or help you find words to ask God for comfort and strength.`;
  const check=`Please tell me one thing next: are you in immediate danger right now, or have you already taken any steps to hurt yourself?`;
  return [emergency,pastoral,community,prayer,check].join('\n\n');
}

export async function maybeTheologianCrisisResponse(request:Request){
  if(request.method!=='POST')return null;
  let body:any;try{body=await request.json()}catch{return null}
  const detection=detectTheologianCrisis(body?.question);if(!detection)return null;
  return new Response(JSON.stringify({
    mode:'crisis',
    model:'deterministic-crisis-safety-v1',
    policyVersion:`crisis-${crisisPolicy.version}`,
    answer:buildCrisisAnswer(detection),
    evidence:[
      {type:'source',label:'988 Suicide & Crisis Lifeline',href:'https://988lifeline.org/',evidence:'human crisis support',limits:'United States crisis resource',evidenceStatus:'direct',claimDomain:'application',doctrinalStatus:'descriptive-only'},
      {type:'scripture',label:'Romans 8:38–39',href:'/bible?book=45&chapter=8#v38',evidence:'Berean Standard Bible reference',limits:'Pastoral reassurance; not a substitute for emergency care',evidenceStatus:'direct',claimDomain:'biblical-text',doctrinalStatus:'descriptive-only'}
    ],
    guardrails:['Immediate safety precedes normal theological instruction','988 / emergency-care routing','Pastoral reassurance without shame or salvation threats','Prayer may accompany but never replace urgent human help','No IP-based crisis identity or silent emergency dispatch'],
    validation:{status:'passed',doctrinalCeiling:'Canonical Shelf compact Statement of Faith',masteryProtected:false},
    crisis:{level:detection.level,prayerRequested:detection.prayerRequested}
  }),{status:200,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}
