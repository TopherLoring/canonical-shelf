import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

// Rose (accent) must never be mistaken for the error color (incorrect). Guard the hue gap in every theme and mode.
const values=JSON.parse(readFileSync(new URL('../../.roa/values/theme.json',import.meta.url),'utf8'));
const MIN_GAP=25;

function hue(hex){
  const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
  if(!d)return 0;
  const h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;
  return (h*60+360)%360;
}

for(const [id,theme] of Object.entries(values.themes)){
  for(const mode of ['light','dark']){
    test(`${id} ${mode}: accent hue is clearly apart from incorrect`,()=>{
      const c=theme.modes[mode];
      const gap=Math.abs(hue(c.accent)-hue(c.incorrect));
      expect(Math.min(gap,360-gap)).toBeGreaterThanOrEqual(MIN_GAP);
    });
  }
}
