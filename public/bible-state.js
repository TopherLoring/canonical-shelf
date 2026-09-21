import {getPracticeState} from './practice-state.js';

const KEY='canonical-shelf-bible-state-v1';
const safeJson=(raw,fallback)=>{try{return JSON.parse(raw)}catch{return fallback}};

if(typeof document!=='undefined'&&!document.querySelector('link[data-canonical-bible-state]')){
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='/bible-state.css';
  link.dataset.canonicalBibleState='';
  document.head.append(link);
}

export function getBibleState(){
  try{
    const state=safeJson(localStorage.getItem(KEY)||'{}',{});
    return {lastBook:Number(state.lastBook||0),lastChapter:Number(state.lastChapter||0),updatedAt:state.updatedAt||null};
  }catch{return{lastBook:0,lastChapter:0,updatedAt:null}}
}

export function rememberBibleBook(book,chapter=0){
  const bn=Number(book||0),cn=Number(chapter||0);if(!bn||bn<1||bn>66)return getBibleState();
  const state={lastBook:bn,lastChapter:cn>0?cn:0,updatedAt:new Date().toISOString()};
  try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}
  return state;
}

const bookNumberFromHref=href=>{try{return Number(new URL(href,location.href).searchParams.get('book')||0)}catch{return 0}};
const appendStateText=(element,text)=>{if(!text)return;const current=element.getAttribute('aria-label')||element.textContent.trim();if(element.hasAttribute('aria-label'))element.setAttribute('aria-label',`${current}, ${text}`)};

export function enhanceBibleState(root=document,params=new URLSearchParams(location.search)){
  const selected=Number(params.get('book')||0),chapter=Number(params.get('chapter')||0);
  const stored=selected?rememberBibleBook(selected,chapter):getBibleState();
  const current=selected||stored.lastBook;
  const practice=getPracticeState();
  const learned=new Set((practice.learnedBooks||[]).map(Number));
  const candidates=[...root.querySelectorAll('.shelf-spine[href*="book="],.book-profile-card a[href*="book="],.reader-launch-grid a[href*="book="],.timeline-books a[href*="book="]')];
  for(const target of candidates){
    const book=bookNumberFromHref(target.getAttribute('href'));if(!book)continue;
    const host=target.classList.contains('shelf-spine')||target.matches('.reader-launch-grid a,.timeline-books a')?target:target.closest('.book-profile-card')||target;
    const isCurrent=book===current,isLearned=learned.has(book);
    host.dataset.current=String(isCurrent);host.dataset.learned=String(isLearned);
    appendStateText(target,[isCurrent?'current book':'',isLearned?'learned in Practice':''].filter(Boolean).join(', '));
    if(host.classList.contains('book-profile-card')&&(isCurrent||isLearned)&&!host.querySelector('.book-state-chip')){
      const chip=document.createElement('span');chip.className='book-state-chip';chip.textContent=isCurrent&&isLearned?'Current · learned':isCurrent?'Current':'Learned';host.prepend(chip);
    }
  }
  const page=root.querySelector('.book-profile-page,.book-drawer,.reader.scripture');
  if(page&&selected){
    page.dataset.current='true';page.dataset.learned=String(learned.has(selected));
    const anchor=page.querySelector('.book-profile-hero .badge-row,.book-drawer .badge-row,.reader-utility');
    if(anchor&&!anchor.querySelector('.book-state-chip')){
      const chip=document.createElement('span');chip.className='badge book-state-chip';chip.textContent=learned.has(selected)?'Current book · learned in Practice':'Current book';anchor.append(chip);
    }
  }
  return {current,learned:[...learned]};
}
