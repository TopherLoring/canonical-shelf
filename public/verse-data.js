import {VERSES_01} from './verse-data-01.js';
import {VERSES_02} from './verse-data-02.js';
import {VERSES_03} from './verse-data-03.js';
import {VERSES_04} from './verse-data-04.js';
import {VERSES_05} from './verse-data-05.js';
import {VERSES_06} from './verse-data-06.js';
import {VERSES_07} from './verse-data-07.js';
import {VERSES_08} from './verse-data-08.js';

export const VERSES=[...VERSES_01,...VERSES_02,...VERSES_03,...VERSES_04,...VERSES_05,...VERSES_06,...VERSES_07,...VERSES_08];
export const VERSE_COUNT=VERSES.length;

export const VERSE_TRANSLATIONS={
  bsb:{id:'bsb',name:'Berean Standard Bible',short:'BSB',scope:'Full Bible reader + curated passage library',credit:'Scripture quotations are from the Holy Bible, Berean Standard Bible (BSB), produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com and the Berean Bible Translation Committee. The BSB was dedicated to the public domain on 30 April 2023; all uses are freely permitted, commercial included.'},
  kjv:{id:'kjv',name:'King James Version',short:'KJV',scope:'Curated passage library only',credit:'Scripture quotations are from the King James Version, which is in the public domain.'},
  custom:{id:'custom',name:'Your translation',short:'YOURS',scope:'Curated passage library entries supplied by you',credit:''}
};

const unique=items=>[...new Set(items.filter(Boolean))].sort((a,b)=>a.localeCompare(b));
export const VERSE_THEMES=unique(VERSES.flatMap(v=>v.themes||[]));
export const VERSE_LIFE_FACETS=unique(VERSES.flatMap(v=>v.life||[]));
export const VERSE_BOOKS=unique(VERSES.map(v=>v.book));
export const VERSE_SPEAKERS=unique(VERSES.map(v=>v.speaker));
export const VERSE_RECIPIENTS=unique(VERSES.map(v=>v.recipient));

export function verseText(verse,translation='bsb',customMap={}){
  if(!verse)return'';
  if(translation==='custom')return customMap?.[verse.ref]||verse.bsb||verse.kjv||'';
  return verse?.[translation]||verse.bsb||verse.kjv||'';
}

export function filterVerses({q='',theme='',life='',book='',speaker='',recipient=''}={}){
  const needle=String(q||'').trim().toLowerCase();
  return VERSES.filter(verse=>{
    if(theme&&!(verse.themes||[]).includes(theme))return false;
    if(life&&!(verse.life||[]).includes(life))return false;
    if(book&&verse.book!==book)return false;
    if(speaker&&verse.speaker!==speaker)return false;
    if(recipient&&verse.recipient!==recipient)return false;
    if(!needle)return true;
    return `${verse.ref} ${verse.book} ${verse.speaker} ${verse.recipient} ${verse.kjv} ${verse.bsb} ${verse.note} ${(verse.themes||[]).join(' ')} ${(verse.life||[]).join(' ')}`.toLowerCase().includes(needle);
  });
}

export function parseCustomTranslation(raw){
  const parsed=typeof raw==='string'?JSON.parse(raw):raw;
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Custom translation must be a JSON object keyed by Bible reference.');
  const clean={};
  for(const [ref,text] of Object.entries(parsed))if(typeof text==='string'&&text.trim())clean[String(ref).trim()]=text.trim();
  return clean;
}
