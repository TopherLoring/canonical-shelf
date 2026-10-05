import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { waitForAppReady } from './test-helpers.js';

const ROUTES = [
  { id: 'home', name: 'Shelf', path: '/home' },
  { id: 'bible', name: 'Bible reader', path: '/bible' },
  { id: 'course', name: 'Course landing', path: '/course' },
  { id: 'lesson', name: 'Authored lesson', path: '/course?unit=c1.christianity&lesson=begin&scene=2' },
  { id: 'path', name: 'Learning Path', path: '/path' },
  { id: 'topics', name: 'Study Topics', path: '/topics' },
  { id: 'practice', name: 'Review & Practice', path: '/practice' }
];

test.describe('Phase 0: Layout conformance & baseline snapshots', () => {
  for (const route of ROUTES) {
    test(`render and capture desktop baseline (1440x900): ${route.name}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const resp = await page.goto(route.path);
      expect(resp?.ok(), `${route.name} (${route.path}) should load`).toBeTruthy();
      await waitForAppReady(page);

      const screenshotPath = testInfo.outputPath(`desktop-${route.id}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      expect(fs.existsSync(screenshotPath), `Desktop snapshot for ${route.name} captured`).toBeTruthy();
    });

    test(`render and capture phone baseline (390x844): ${route.name}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const resp = await page.goto(route.path);
      expect(resp?.ok(), `${route.name} (${route.path}) should load`).toBeTruthy();
      await waitForAppReady(page);

      const screenshotPath = testInfo.outputPath(`phone-${route.id}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      expect(fs.existsSync(screenshotPath), `Phone snapshot for ${route.name} captured`).toBeTruthy();
    });
  }

  for(const width of [320,390,428,768,1024,1440]) {
    test('primary lesson parts fit without clipping at '+width+'px',async({page})=>{
      test.slow();
      await page.setViewportSize({width,height:width===1440?900:844});
      for(let scene=1;scene<=8;scene++){
        await page.goto('/course?unit=c1.christianity&lesson=begin&scene='+scene);
        await expect(page.locator('[data-lesson-screen]')).toBeVisible();
        await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
        const results=await page.evaluate(()=>{
          const parts=Number(document.querySelector('.lesson-part-status').textContent.match(/part [0-9]+ of ([0-9]+)/)[1]);
          const bounds=[];
          for(let part=1;part<=parts;part++){
            const el=document.querySelector('.lesson-primary-window'),r=el.getBoundingClientRect(),c=document.querySelector('.lesson-primary-content').getBoundingClientRect();
            const nested=[...document.querySelectorAll('.lesson-primary-content *')].filter(node=>node.getClientRects().length&&!node.closest('[hidden]')).filter(node=>{const s=getComputedStyle(node);return (/^(auto|scroll|hidden|clip)$/.test(s.overflowY)&&node.scrollHeight>node.clientHeight+1)||(/^(auto|scroll|hidden|clip)$/.test(s.overflowX)&&node.scrollWidth>node.clientWidth+1);}).map(node=>node.className);
            bounds.push({part,nested,overflowY:el.scrollHeight-el.clientHeight,overflowX:el.scrollWidth-el.clientWidth,bottom:c.bottom-r.bottom,viewport:r.bottom-innerHeight,height:el.clientHeight,pageOverflow:document.documentElement.scrollWidth-innerWidth});
            if(part<parts)document.querySelector('.ui-lesson-continue-btn').click();
          }
          return bounds;
        });
        for(const bounds of results){
          expect(bounds.height,'primary viewport is usable').toBeGreaterThan(100);
          expect(bounds.nested,'primary content has no nested scrolling or clipping').toEqual([]);
          for(const key of ['overflowY','overflowX','bottom','viewport','pageOverflow'])expect(bounds[key],'scene '+scene+' part '+bounds.part+' '+key).toBeLessThanOrEqual(1);
        }
      }
    });
  }
});
