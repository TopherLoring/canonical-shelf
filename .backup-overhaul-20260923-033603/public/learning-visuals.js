const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

if(typeof document!=='undefined'&&!document.querySelector('link[data-canonical-learning-visuals]')){
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/learning-visuals.css';
  link.dataset.canonicalLearningVisuals='';
  document.head.append(link);
}

const VISUAL_TYPES=['shelf','timeline','story-arc','relationship','compare','flow','theme-thread','map-lite','book-profile','verse-context','spectrum','stack'];
const labels={shelf:'Canonical shelf',timeline:'Timeline','story-arc':'Story arc',relationship:'Relationship map',compare:'Comparison',flow:'Process', 'theme-thread':'Theme thread','map-lite':'Schematic map','book-profile':'Book profile','verse-context':'Verse context',spectrum:'Interpretive spectrum',stack:'Layered reading'};

const normalize=value=>String(value||'').replace(/\s+/g,' ').trim();
function pieces(text){
  const source=normalize(text);
  if(!source)return[];
  const delimiter=source.includes('→')?/\s*→\s*/:source.includes('↔')?/\s*↔\s*/:source.includes('⇒')?/\s*⇒\s*/:source.includes('·')?/\s*·\s*/:/\s*;\s*/;
  return source.split(delimiter).map(normalize).filter(Boolean).slice(0,10);
}

export function semanticVisualType(title='',text=''){
  const hay=`${title} ${text}`.toLowerCase();
  if(/shelf|canonical order|biblical library|book groups|sixty[- ]six/.test(hay))return'shelf';
  if(/translation spectrum|interpretive spectrum|major approaches|positions|continuum|traditions differ/.test(hay))return'spectrum';
  if(/compare|contrast|versus| vs |difference between|formal.*functional/.test(hay))return'compare';
  if(/verse context|speaker|recipient|wording.*application|put .* back in context/.test(hay))return'verse-context';
  if(/book profile|profile of|inside .*book/.test(hay))return'book-profile';
  if(/geograph|places in|route through|journey through|jerusalem.*rome|galilee.*jerusalem/.test(hay))return'map-lite';
  if(/theme thread|trace .*theme|covenant.*exile.*kingdom|thread across/.test(hay))return'theme-thread';
  if(/timeline|chronolog|centur|empire|political.*transition|historical.*bridge|exile.*return|babylon.*persia|persia.*hellenistic|before .*bc|after .*bc/.test(hay))return'timeline';
  if(/story arc|story in|larger story|theology map|creation.*new creation|movement.*story/.test(hay))return'story-arc';
  if(/relationship|connects|one god|trinity|community.*roles|people.*power/.test(hay))return'relationship';
  if(/layers|keep .* separate|observe.*interpret|text.*context.*application/.test(hay))return'stack';
  return'flow';
}

const node=(text,index,extra='')=>`<div class="semantic-node" ${extra}><span class="semantic-node__index">${String(index+1).padStart(2,'0')}</span><strong>${esc(text)}</strong></div>`;
function flow(parts){return `<div class="semantic-flow">${parts.map((part,index)=>`${index?'<span class="semantic-arrow" aria-hidden="true">→</span>':''}${node(part,index)}`).join('')}</div>`}
function timeline(parts){return `<ol class="semantic-timeline">${parts.map((part,index)=>`<li><span>${String(index+1).padStart(2,'0')}</span><strong>${esc(part)}</strong></li>`).join('')}</ol>`}
function storyArc(parts){return `<div class="semantic-story-arc">${parts.map((part,index)=>`<article><span>${String(index+1).padStart(2,'0')}</span><strong>${esc(part)}</strong></article>`).join('')}</div>`}
function relationship(parts){const center=parts[0]||'Central claim',others=parts.slice(1);return `<div class="semantic-relationship"><div class="semantic-relationship__center"><strong>${esc(center)}</strong></div><div class="semantic-relationship__orbit">${(others.length?others:[center]).map((part,index)=>node(part,index)).join('')}</div></div>`}
function compare(parts){const midpoint=Math.ceil(parts.length/2),left=parts.slice(0,midpoint),right=parts.slice(midpoint);return `<div class="semantic-compare"><section><span>Lens A</span>${left.map((part,index)=>node(part,index)).join('')}</section><div class="semantic-compare__axis" aria-hidden="true">↔</div><section><span>Lens B</span>${(right.length?right:left).map((part,index)=>node(part,index)).join('')}</section></div>`}
function shelf(parts){return `<div class="semantic-shelf" role="img" aria-label="Schematic canonical shelf">${parts.map((part,index)=>`<div class="semantic-spine" style="--spine-index:${index};--spine-height:${62+(index%4)*9}%"><strong>${esc(part)}</strong><span>${String(index+1).padStart(2,'0')}</span></div>`).join('')}</div>`}
function themeThread(parts){return `<div class="semantic-thread">${parts.map((part,index)=>`<article><span class="semantic-thread__marker"></span><small>Stop ${index+1}</small><strong>${esc(part)}</strong></article>`).join('')}</div>`}
function mapLite(parts){return `<div class="semantic-route" role="img" aria-label="Schematic route, not to scale"><p class="semantic-route__notice">Schematic orientation · not to scale</p>${parts.map((part,index)=>`<div class="semantic-route__place" style="--route-x:${12+(index*73/Math.max(parts.length-1,1))}%"><span></span><strong>${esc(part)}</strong></div>`).join('')}</div>`}
function bookProfile(parts){return `<dl class="semantic-profile">${parts.map((part,index)=>{const [key,...rest]=part.split(':');const hasValue=rest.length>0;return `<div><dt>${esc(hasValue?key:`Field ${index+1}`)}</dt><dd>${esc(hasValue?rest.join(':').trim():part)}</dd></div>`}).join('')}</dl>`}
function verseContext(parts){const names=['Text','Speaker / audience','Situation','Interpretive boundary','Responsible use'];return `<div class="semantic-verse-context">${parts.map((part,index)=>`<section><span>${esc(names[index]||`Layer ${index+1}`)}</span><p>${esc(part)}</p></section>`).join('')}</div>`}
function spectrum(parts){return `<div class="semantic-spectrum"><div class="semantic-spectrum__rail" aria-hidden="true"></div>${parts.map((part,index)=>`<article style="--spectrum-position:${parts.length===1?50:(index/(parts.length-1))*100}%"><span></span><strong>${esc(part)}</strong></article>`).join('')}</div>`}
function stack(parts){return `<div class="semantic-stack">${parts.map((part,index)=>`<section style="--stack-index:${index}"><span>Layer ${index+1}</span><strong>${esc(part)}</strong></section>`).join('')}</div>`}

const renderers={shelf,timeline,'story-arc':storyArc,relationship,compare,flow,'theme-thread':themeThread,'map-lite':mapLite,'book-profile':bookProfile,'verse-context':verseContext,spectrum,stack};

export function renderSemanticVisual({title='Visual map',text='',type=null}={}){
  const cleanTitle=normalize(title)||'Visual map',cleanText=normalize(text);
  const inferred=VISUAL_TYPES.includes(type)?type:semanticVisualType(cleanTitle,cleanText);
  const list=pieces(cleanText);
  const content=(renderers[inferred]||flow)(list.length?list:[cleanText||cleanTitle]);
  return `<figure class="semantic-visual" data-visual-type="${inferred}"><figcaption class="semantic-visual__head"><div><p class="eyebrow">Visualize · ${esc(labels[inferred]||inferred)}</p><h3>${esc(cleanTitle)}</h3></div><span>${esc(labels[inferred]||inferred)}</span></figcaption><div class="semantic-visual__body">${content}</div><details class="semantic-visual__text"><summary>Text equivalent</summary><p>${esc(cleanText||cleanTitle)}</p></details></figure>`;
}

export function enhanceLearningVisuals(root=document){
  const visuals=[...root.querySelectorAll('.scene-visual:not([data-semantic-enhanced])')];
  for(const visual of visuals){
    if(visual.querySelector('img')){visual.dataset.semanticEnhanced='image';continue}
    const title=visual.querySelector('h3')?.textContent||'Visual map';
    const text=[...visual.querySelectorAll('p')].map(item=>item.textContent).join(' ');
    if(!normalize(text)){visual.dataset.semanticEnhanced='empty';continue}
    visual.innerHTML=renderSemanticVisual({title,text});
    visual.dataset.semanticEnhanced='true';
    visual.classList.add('scene-visual--semantic');
  }
  return visuals.length;
}

export {VISUAL_TYPES};
