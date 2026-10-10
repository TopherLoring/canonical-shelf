const STORAGE_THEME_KEY='canonical-shelf-theme-v2';
const STORAGE_MODE_KEY='canonical-shelf-mode-v1';
const LEGACY_KEY='canonical-shelf-theme-v1';
export {DEFAULT_THEME_ID} from './theme-list.js';
import {DEFAULT_THEME_ID} from './theme-list.js';
export const DEFAULT_MODE='light';

// Themes come from the theme contract (public/theme-list.js is generated; do not edit it by hand).
export {THEMES} from './theme-list.js';
import {THEMES} from './theme-list.js';

export const MODES=[
  {id:'light',name:'Light',icon:'☀'},
  {id:'dark',name:'Dark',icon:'☾'},
  {id:'system',name:'System',icon:'⚙'}
];

const themeIds=new Set(THEMES.map(theme=>theme.id));
const byId=id=>THEMES.find(theme=>theme.id===id)||THEMES.find(theme=>theme.id===DEFAULT_THEME_ID);

// Earlier theme IDs map to the closest current theme.
const LEGACY_MAP={'canonical-paper':'paper','scholarly-graphite':'paper','oxford-scriptorium':'collegiate','monastic-cedar':'library','cambridge-stone':'paper','cool-archive':'paper','blue-stone':'collegiate','quiet-jewel':'stained-glass'};

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
  // A theme's native mode applies until the learner has chosen light, dark, or device themselves.
  let chosenMode=null;try{chosenMode=localStorage.getItem(STORAGE_MODE_KEY)}catch{}
  if(!chosenMode&&theme.nativeMode)applyMode(theme.nativeMode,{persist:false});
  if(persist){
    try{localStorage.setItem(STORAGE_THEME_KEY,theme.id)}catch{}
  }

  const active=resolvedMode();
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=active==='dark'?theme.darkThemeColor:theme.themeColor;

  document.querySelectorAll('[data-theme-option],[data-theme-choice]').forEach(button=>{
    const selected=(button.dataset.themeOption||button.dataset.themeChoice)===theme.id;
    button.setAttribute('aria-pressed',String(selected));
    button.classList.toggle('is-selected',selected);
  });

  document.dispatchEvent(new CustomEvent('canonical-theme-changed',{detail:{theme:theme.id}}));
  return theme.id;
}

// ---- Reading font, Interface font, and site text size (Profile > Appearance / Reading) ----
// Each is a per-device preference applied to the document root through the CSSOM (the CSP blocks inline style
// attributes in markup). "Theme default" removes the override so the active theme's own fonts apply. The Reader's
// Aa text size is a separate control and is not affected by the site text size here.
const STORAGE_FONTS_KEY='canonical-shelf-fonts-v1';
const STORAGE_TEXT_SIZE_KEY='canonical-shelf-text-size-v1';
export const FONT_CHOICES=Object.freeze([
  {id:'default',name:'Theme default',reading:null,interface:null},
  {id:'newsreader',name:'Newsreader',reading:'Newsreader,Georgia,serif',interface:'Newsreader,Georgia,serif'},
  {id:'literata',name:'Literata',reading:'Literata,Georgia,serif',interface:'Literata,Georgia,serif'},
  {id:'caladea',name:'Caladea',reading:'Caladea,Cambria,Georgia,serif',interface:'Caladea,Cambria,Georgia,serif'},
  {id:'source-sans',name:'Source Sans 3',reading:"'Source Sans 3',ui-sans-serif,system-ui,sans-serif",interface:"'Source Sans 3',ui-sans-serif,system-ui,sans-serif"},
  {id:'system',name:'System',reading:"Georgia,'Times New Roman',serif",interface:"ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif"}
]);
export const TEXT_SIZES=Object.freeze([
  {id:'90',name:'Smaller',percent:90,factor:0.9},
  {id:'100',name:'Standard',percent:100,factor:1},
  {id:'115',name:'Larger',percent:115,factor:1.15},
  {id:'130',name:'Largest',percent:130,factor:1.3}
]);
export const DEFAULT_TEXT_SIZE='100';
const fontIds=new Set(FONT_CHOICES.map(font=>font.id));
const sizeIds=new Set(TEXT_SIZES.map(size=>size.id));

function readFonts(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_FONTS_KEY)||'null');
    return {reading:fontIds.has(saved?.reading)?saved.reading:'default',interface:fontIds.has(saved?.interface)?saved.interface:'default'};
  }catch{return {reading:'default',interface:'default'}}
}

export function currentFonts(){
  const root=document.documentElement.dataset;
  return {reading:fontIds.has(root.readingFont)?root.readingFont:'default',interface:fontIds.has(root.interfaceFont)?root.interfaceFont:'default'};
}

export function currentTextSize(){
  const id=document.documentElement.dataset.textSize;
  return sizeIds.has(id)?id:DEFAULT_TEXT_SIZE;
}

export function applyFonts(next,{persist=true}={}){
  const now=currentFonts();
  const fonts={reading:fontIds.has(next?.reading)?next.reading:now.reading,interface:fontIds.has(next?.interface)?next.interface:now.interface};
  const root=document.documentElement;
  const reading=FONT_CHOICES.find(font=>font.id===fonts.reading),ui=FONT_CHOICES.find(font=>font.id===fonts.interface);
  // The theme contract owns --font-display, --font-reading, and --font-body. The learner's choice goes in separate
  // --user-font-* properties that every stylesheet reads first: var(--user-font-reading, var(--font-reading)).
  // The Reading font covers running text and headings (display); the Interface font covers controls and labels.
  const set=(property,value)=>{if(value)root.style.setProperty(property,value);else root.style.removeProperty(property)};
  set('--user-font-reading',reading.reading);
  set('--user-font-display',reading.reading);
  set('--user-font-body',ui.interface);
  root.dataset.readingFont=fonts.reading;
  root.dataset.interfaceFont=fonts.interface;
  if(persist){try{localStorage.setItem(STORAGE_FONTS_KEY,JSON.stringify(fonts))}catch{}}
  document.dispatchEvent(new CustomEvent('canonical-fonts-changed',{detail:fonts}));
  return fonts;
}

export function applyTextSize(id,{persist=true}={}){
  const size=TEXT_SIZES.find(item=>item.id===String(id))||TEXT_SIZES.find(item=>item.id===DEFAULT_TEXT_SIZE);
  const root=document.documentElement;
  if(size.factor===1)root.style.removeProperty('--text-size-factor');else root.style.setProperty('--text-size-factor',String(size.factor));
  root.dataset.textSize=size.id;
  if(persist){try{localStorage.setItem(STORAGE_TEXT_SIZE_KEY,size.id)}catch{}}
  document.dispatchEvent(new CustomEvent('canonical-text-size-changed',{detail:{size:size.id,factor:size.factor}}));
  return size.id;
}

function initDisplayPreferences(){
  applyFonts(readFonts(),{persist:false});
  let size=DEFAULT_TEXT_SIZE;
  try{size=localStorage.getItem(STORAGE_TEXT_SIZE_KEY)||size}catch{}
  applyTextSize(size,{persist:false});
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
    <div class="theme-grid" role="list">${THEMES.map(theme=>`<button class="theme-card" type="button" role="listitem" data-theme-option="${theme.id}" aria-pressed="false"><span class="theme-card__swatch" data-swatch="${theme.id}" aria-hidden="true"><i></i><i></i><i></i></span><strong>${theme.name}</strong><span>${theme.summary}</span></button>`).join('')}</div>
  </aside>`;
}

// Appearance lives on the profile screen (owner decision ui.profile); nothing is injected into the page.
function ensureControls(){}

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
    // A saved ID from an earlier theme set is moved to its closest current theme.
    const mapped=currentThemeVal&&!themeIds.has(currentThemeVal)?LEGACY_MAP[currentThemeVal]:currentThemeVal;
    if(mapped&&mapped!==currentThemeVal)localStorage.setItem(STORAGE_THEME_KEY,mapped);
    savedTheme=mapped||LEGACY_MAP[legacyThemeVal]||savedTheme;
    if(!currentThemeVal&&legacyThemeVal)localStorage.setItem(STORAGE_THEME_KEY,LEGACY_MAP[legacyThemeVal]||DEFAULT_THEME_ID);

    const currentModeVal=localStorage.getItem(STORAGE_MODE_KEY);
    if(currentModeVal)savedMode=currentModeVal;
    else if(byId(savedTheme)?.nativeMode)savedMode=byId(savedTheme).nativeMode;
  }catch{}

  applyTheme(themeIds.has(savedTheme)?savedTheme:DEFAULT_THEME_ID,{persist:false});
  applyMode(savedMode,{persist:false});
  initDisplayPreferences();

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
