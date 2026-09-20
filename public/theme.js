const STORAGE_KEY='canonical-shelf-theme-v1';

export const THEMES=[
  {id:'heritage',name:'Heritage',summary:'Warm paper, ink, oxblood and restrained gilt.',themeColor:'#2a211b'},
  {id:'canonical-original',name:'Canonical Original',summary:'The original Canonical Shelf paper, blue and gilt family.',themeColor:'#274c8e'},
  {id:'oxblood',name:'Oxblood',summary:'Deep burgundy, parchment and editorial contrast.',themeColor:'#4d1f22'},
  {id:'slate-linen',name:'Slate & Linen',summary:'Cool slate, linen and quiet scholarly neutrals.',themeColor:'#34424a'},
  {id:'illuminated-jewel',name:'Illuminated Jewel',summary:'Manuscript-inspired jewel accents with restrained richness.',themeColor:'#392b52'},
  {id:'bookshelf-spectrum',name:'Bookshelf Spectrum',summary:'A neutral folio grounded by Canonical Shelf’s original category colors.',themeColor:'#26313c'}
];

const ids=new Set(THEMES.map(theme=>theme.id));
const byId=id=>THEMES.find(theme=>theme.id===id)||THEMES[0];

export function currentTheme(){
  return ids.has(document.documentElement.dataset.theme)?document.documentElement.dataset.theme:THEMES[0].id;
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
    <p class="appearance-panel__intro">Choose a complete visual package. Theme changes affect presentation only; course content, progress, assessment, and interpretation do not change.</p>
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
  let saved=THEMES[0].id;
  try{saved=localStorage.getItem(STORAGE_KEY)||saved}catch{}
  applyTheme(ids.has(saved)?saved:THEMES[0].id,{persist:false});
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
