import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes=['/home','/course','/bible','/topics','/practice','/search'];

test('core destinations render as valid documents',async({page})=>{
  for(const route of routes){
    const response=await page.goto(route,{waitUntil:'domcontentloaded'});
    expect(response?.ok(),`${route} should load`).toBeTruthy();
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
  }
});

test('home provides the durable exploration paths and canonical library',async({page})=>{
  await page.goto('/home');
  for(const route of ['/course','/bible','/topics','/practice']){
    await expect(page.locator(`main a[href="${route}"]`).first()).toBeVisible();
  }
  await expect(page.locator('main a[href^="/bible?book="]')).toHaveCount(66);
});

test('global study utilities remain operable',async({page})=>{
  await page.goto('/course');

  const theologian=page.locator('#guide-open');
  await expect(theologian).toBeEnabled();
  await theologian.click();
  await expect(page.locator('#guide')).toBeVisible();
  await page.locator('#guide-close').click();
  await expect(page.locator('#guide')).toBeHidden();

  const feedback=page.locator('[aria-controls="feedback-panel"]');
  await feedback.click();
  await expect(page.locator('#feedback-panel')).toBeVisible();
  await page.locator('#feedback-close').click();

  const journal=page.locator('[aria-controls="personal-study-panel"]');
  await journal.click();
  await expect(page.locator('#personal-study-panel')).toBeVisible();
});

test('guided lessons foreground learner copy and keep notes separate from study tools',async({page})=>{
  await page.goto('/course?unit=c1.christianity&lesson=begin');
  const scene=page.locator('.study-scene__inner');
  await expect(scene.locator('.scene-objective')).toHaveCount(0);
  await expect(scene.locator('.scene-callout')).toBeVisible();
  await expect(scene.locator('.scene-prose')).toBeVisible();

  const desk=page.locator('#study-apparatus');
  await expect(desk).toBeVisible();
  await expect(desk.locator('h2')).toHaveText('Study Desk');
  await expect(desk.locator('[data-inline-lesson-note]')).toBeVisible();
  await expect(desk.locator('.apparatus-module summary').first()).toContainText('Session Notes');
});

test('desktop and narrow layouts do not create horizontal page overflow',async({page})=>{
  for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    for(const route of ['/home','/bible','/course']){
      await page.goto(route);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      expect(overflow,`${route} at ${viewport.width}px`).toBeLessThanOrEqual(2);
    }
  }
});

test('critical accessibility smoke is clean on representative destinations',async({page})=>{
  for(const route of ['/home','/bible','/course']){
    await page.goto(route);
    const results=await new AxeBuilder({page}).analyze();
    const blocking=results.violations.filter(v=>v.impact==='critical'||v.impact==='serious');
    expect(blocking,`${route}: ${blocking.map(v=>v.id).join(', ')}`).toEqual([]);
  }
});