const STORAGE_KEY='canonical-shelf-theme-v2';
const LEGACY_KEY='canonical-shelf-theme-v1';
export const DEFAULT_THEME_ID='scholarly-graphite';

export const THEMES=[
  {id:'scholarly-graphite',name:'Scholarly Graphite',summary:'Cool paper, graphite chrome, scholarly serif reading, and bright gilt signals.',themeColor:'#24272d'},
  {id:'cool-archive',name:'Cool Archive',summary:'Cool archival whites, blue-gray structure, and restrained scholarly contrast.',themeColor:'#1a2631'},
  {id:'blue-stone',name:'Blue Stone',summary:'Stone-blue structure with clean paper surfaces and muted green secondary accents.',themeColor:'#202633'},
  {id:'quiet-jewel',name:'Quiet Jewel',summary:'Cool ivory surfaces with restrained plum, teal, and gold accents.',themeColor:'#262735'}
];

const ids=new Set(THEMES.map(theme=>theme.id));
const byId=id=>THEMES.find(theme=>theme.id===id)||THEMES.find(theme=>theme.id===DEFAULT_THEME_ID);
const LEGACY_MAP={
  'canonical-original':'scholarly-graphite',
  heritage:'scholarly-graphite',
  oxblood:'scholarly-graphite',
  'illuminated-jewel':'quiet-jewel',
  'slate-linen':'cool-archive',
  'bookshelf-spectrum':'blue-stone'
};

export function currentTheme(){
  return ids.has(document.documentElement.dataset.theme)?document.documentElement.dataset.theme:DEFAULT_THEME_ID;
}

export function applyTheme(id,{persist=true}={}){
  const theme=byId(id);
  document.documentElement.dataset.theme=theme.id;
  if(persist){
    try{localStorage.setItem(STORAGE_KEY,theme.id)}catch{}
  }
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=theme.themeColor;
  document.querySelectorAll('[data-theme-option],[data-theme-choice]').forEach(button=>{
    const selected=(button.dataset.themeOption||button.dataset.themeChoice)===theme.id;
    button.toggleAttribute('aria-pressed',selected);
    button.classList.toggle('is-selected',selected);
  });
  document.dispatchEvent(new CustomEvent('canonical-theme-changed',{detail:{theme:theme.id}}));
  return theme.id;
}

function panelMarkup(){
  return `<aside id="appearance-panel" class="appearance-panel" hidden aria-labelledby="appearance-title">
    <div class="appearance-panel__head">
      <div><p class="eyebrow">Display preference</p><h2 id="appearance-title">Appearance</h2></div>
      <button id="appearance-close" class="appearance-close" type="button" aria-label="Close appearance settings">×</button>
    </div>
    <p class="appearance-panel__intro">Choose a color package. Typography, geometry, page architecture, Bible category colors, learner state, and interaction behavior stay consistent.</p>
    <div class="theme-grid" role="list">${THEMES.map(theme=>`<button class="theme-card" type="button" role="listitem" data-theme-option="${theme.id}" aria-pressed="false"><span class="theme-card__swatch" aria-hidden="true"><i></i><i></i><i></i></span><strong>${theme.name}</strong><span>${theme.summary}</span></button>`).join('')}</div>
  </aside>`;
}

function ensureControls(){
  const account=document.querySelector('#account-open');
  if(account&&!document.querySelector('#appearance-open')){
    const button=document.createElement('button');
    button.id='appearance-open';
    button.className='appearance-open';
    button.type='button';
    button.setAttribute('aria-haspopup','dialog');
    button.setAttribute('aria-controls','appearance-panel');
    button.textContent='Appearance';
    account.before(button);
  }
  if(!document.querySelector('#appearance-panel'))document.body.insertAdjacentHTML('beforeend',panelMarkup());
}

function openPanel(){
  const panel=document.querySelector('#appearance-panel');
  if(!panel)return;
  panel.hidden=false;
  panel.querySelector('[data-theme-option].is-selected,[data-theme-option]')?.focus({preventScroll:true});
}

function closePanel(){
  const panel=document.querySelector('#appearance-panel');
  if(!panel)return;
  panel.hidden=true;
  document.querySelector('#appearance-open')?.focus({preventScroll:true});
}

export function initTheme(){
  let saved=DEFAULT_THEME_ID;
  try{
    const current=localStorage.getItem(STORAGE_KEY);
    const legacy=localStorage.getItem(LEGACY_KEY);
    saved=current||LEGACY_MAP[legacy]||saved;
    if(!current&&legacy)localStorage.setItem(STORAGE_KEY,LEGACY_MAP[legacy]||DEFAULT_THEME_ID);
  }catch{}
  applyTheme(ids.has(saved)?saved:DEFAULT_THEME_ID,{persist:false});
  ensureControls();
  applyTheme(currentTheme(),{persist:false});

  document.addEventListener('click',event=>{
    const themeButton=event.target.closest('[data-theme-option],[data-theme-choice]');
    if(themeButton){
      applyTheme(themeButton.dataset.themeOption||themeButton.dataset.themeChoice);
      return;
    }
    if(event.target.closest('#appearance-open,[data-open-appearance]'))openPanel();
    if(event.target.closest('#appearance-close'))closePanel();
  });

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!document.querySelector('#appearance-panel')?.hidden)closePanel();
  });

  window.addEventListener('canonical:appearance-open',openPanel);
}
