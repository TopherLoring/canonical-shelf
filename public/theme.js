const STORAGE_THEME_KEY='canonical-shelf-theme-v2';
const STORAGE_MODE_KEY='canonical-shelf-mode-v1';
const LEGACY_KEY='canonical-shelf-theme-v1';
export const DEFAULT_THEME_ID='canonical-paper';
export const DEFAULT_MODE='light';

export const THEMES=[
  {
    id:'canonical-paper',
    name:'Canonical Paper',
    summary:'Authentic warm archival parchment, carbon ink, and antique gold.',
    themeColor:'#E6E7E2',
    darkThemeColor:'#181B1E',
    swatch:['#E6E7E2','#454A53','#C9A227']
  },
  {
    id:'scholarly-graphite',
    name:'Scholarly Graphite',
    summary:'Cool alabaster paper, graphite chrome, and bright gilt signals.',
    themeColor:'#F0F2F4',
    darkThemeColor:'#15171A',
    swatch:['#F0F2F4','#505862','#FFC800']
  },
  {
    id:'oxford-scriptorium',
    name:'Oxford Scriptorium',
    summary:'Collegiate navy structure, warm linen surfaces, and heraldic bronze.',
    themeColor:'#F4F2EB',
    darkThemeColor:'#111822',
    swatch:['#F4F2EB','#233B58','#D4A838']
  },
  {
    id:'monastic-cedar',
    name:'Monastic Cedar',
    summary:'Rich aged cedar leather, warm sand surfaces, and luminous amber.',
    themeColor:'#F4EFE6',
    darkThemeColor:'#1A1513',
    swatch:['#F4EFE6','#614B3F','#C88A24']
  },
  {
    id:'cambridge-stone',
    name:'Cambridge Stone',
    summary:'Limestone archival paper, muted moss accents, and understated bronze.',
    themeColor:'#ECEFEA',
    darkThemeColor:'#141A17',
    swatch:['#ECEFEA','#4B5E55','#B89738']
  }
];

export const MODES=[
  {id:'light',name:'Light',icon:'☀'},
  {id:'dark',name:'Dark',icon:'☾'},
  {id:'system',name:'System',icon:'⚙'}
];

const themeIds=new Set(THEMES.map(theme=>theme.id));
const byId=id=>THEMES.find(theme=>theme.id===id)||THEMES.find(theme=>theme.id===DEFAULT_THEME_ID);

const LEGACY_MAP={
  'canonical-original':'canonical-paper',
  heritage:'canonical-paper',
  oxblood:'monastic-cedar',
  'illuminated-jewel':'monastic-cedar',
  'slate-linen':'canonical-paper',
  'bookshelf-spectrum':'oxford-scriptorium',
  'cool-archive':'scholarly-graphite',
  'blue-stone':'oxford-scriptorium',
  'quiet-jewel':'monastic-cedar'
};

export function currentTheme(){
  const current=document.documentElement.dataset.theme;
  return themeIds.has(current)?current:DEFAULT_THEME_ID;
}

export function currentMode(){
  return document.documentElement.dataset.modePref||DEFAULT_MODE;
}

export function resolvedMode(){
  const pref=currentMode();
  if(pref==='dark')return 'dark';
  if(pref==='light')return 'light';
  return (typeof window!=='undefined'&&window.matchMedia?.('(prefers-color-scheme: dark)').matches)?'dark':'light';
}

export function applyMode(pref,{persist=true}={}){
  const mode=['light','dark','system'].includes(pref)?pref:DEFAULT_MODE;
  document.documentElement.dataset.modePref=mode;
  const active=resolvedMode();
  document.documentElement.dataset.mode=active;

  if(persist){
    try{localStorage.setItem(STORAGE_MODE_KEY,mode)}catch{}
  }

  const theme=byId(currentTheme());
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=active==='dark'?theme.darkThemeColor:theme.themeColor;

  document.querySelectorAll('[data-mode-choice]').forEach(button=>{
    const selected=button.dataset.modeChoice===mode;
    button.setAttribute('aria-checked',String(selected));
    button.classList.toggle('is-selected',selected);
  });

  document.dispatchEvent(new CustomEvent('canonical-mode-changed',{detail:{mode,resolved:active}}));
  return active;
}

export function applyTheme(id,{persist=true}={}){
  const theme=byId(id);
  document.documentElement.dataset.theme=theme.id;
  if(persist){
    try{localStorage.setItem(STORAGE_THEME_KEY,theme.id)}catch{}
  }

  const active=resolvedMode();
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=active==='dark'?theme.darkThemeColor:theme.themeColor;

  document.querySelectorAll('[data-theme-option],[data-theme-choice]').forEach(button=>{
    const selected=(button.dataset.themeOption||button.dataset.themeChoice)===theme.id;
    button.toggleAttribute('aria-pressed',selected);
    button.classList.toggle('is-selected',selected);
  });

  document.dispatchEvent(new CustomEvent('canonical-theme-changed',{detail:{theme:theme.id}}));
  return theme.id;
}

function panelMarkup(){
  const mode=currentMode();
  return `<aside id="appearance-panel" class="appearance-panel" hidden aria-labelledby="appearance-title">
    <div class="appearance-panel__head">
      <div><p class="eyebrow">Display preference</p><h2 id="appearance-title">Appearance</h2></div>
      <button id="appearance-close" class="appearance-close" type="button" aria-label="Close appearance settings">×</button>
    </div>
    <div class="appearance-section">
      <p class="appearance-section__title">Color Mode</p>
      <div class="mode-toggle-group" role="radiogroup" aria-label="Color mode">
        <button class="mode-toggle-btn ${mode==='light'?'is-selected':''}" type="button" role="radio" data-mode-choice="light" aria-checked="${mode==='light'}">☀ Light</button>
        <button class="mode-toggle-btn ${mode==='dark'?'is-selected':''}" type="button" role="radio" data-mode-choice="dark" aria-checked="${mode==='dark'}">☾ Dark</button>
        <button class="mode-toggle-btn ${mode==='system'?'is-selected':''}" type="button" role="radio" data-mode-choice="system" aria-checked="${mode==='system'}">⚙ System</button>
      </div>
    </div>
    <p class="appearance-panel__intro">Choose a visual package. Typography, geometry, page architecture, Bible category colors, learner state, and interaction behavior stay consistent.</p>
    <div class="theme-grid" role="list">${THEMES.map(theme=>`<button class="theme-card" type="button" role="listitem" data-theme-option="${theme.id}" aria-pressed="false"><span class="theme-card__swatch" aria-hidden="true"><i style="background:${theme.swatch[0]}"></i><i style="background:${theme.swatch[1]}"></i><i style="background:${theme.swatch[2]}"></i></span><strong>${theme.name}</strong><span>${theme.summary}</span></button>`).join('')}</div>
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
  let savedTheme=DEFAULT_THEME_ID;
  let savedMode=DEFAULT_MODE;

  try{
    const currentThemeVal=localStorage.getItem(STORAGE_THEME_KEY);
    const legacyThemeVal=localStorage.getItem(LEGACY_KEY);
    savedTheme=currentThemeVal||LEGACY_MAP[legacyThemeVal]||savedTheme;
    if(!currentThemeVal&&legacyThemeVal)localStorage.setItem(STORAGE_THEME_KEY,LEGACY_MAP[legacyThemeVal]||DEFAULT_THEME_ID);

    const currentModeVal=localStorage.getItem(STORAGE_MODE_KEY);
    if(currentModeVal)savedMode=currentModeVal;
  }catch{}

  applyTheme(themeIds.has(savedTheme)?savedTheme:DEFAULT_THEME_ID,{persist:false});
  applyMode(savedMode,{persist:false});

  ensureControls();
  applyTheme(currentTheme(),{persist:false});
  applyMode(currentMode(),{persist:false});

  if(typeof window!=='undefined'&&window.matchMedia){
    try{
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{
        if(currentMode()==='system'){
          applyMode('system',{persist:false});
        }
      });
    }catch{}
  }

  document.addEventListener('click',event=>{
    const modeBtn=event.target.closest('[data-mode-choice]');
    if(modeBtn){
      applyMode(modeBtn.dataset.modeChoice);
      return;
    }
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
