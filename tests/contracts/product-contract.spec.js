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

test('primary navigation is a same-document SPA transition',async({page})=>{
  await page.goto('/home');
  await expect(page.locator('#main h1')).toBeVisible();
  await page.evaluate(()=>{window.__CANONICAL_SPA_SENTINEL__='same-document'});
  for(const route of ['/course','/bible','/topics','/practice','/home']){
    await page.locator(`nav.primary a[href="${route}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${route.replace('/','\\/')}(?:[?#]|$)`));
    await expect(page.locator('#main h1')).toHaveCount(1);
    expect(await page.evaluate(()=>window.__CANONICAL_SPA_SENTINEL__)).toBe('same-document');
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/practice(?:[?#]|$)/);
  expect(await page.evaluate(()=>window.__CANONICAL_SPA_SENTINEL__)).toBe('same-document');
});

test('DOM template bank drives home, progress, course, and unit views',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/home');
  for(const id of ['tpl-home','tpl-home-book','tpl-home-recent-item','tpl-progress-panel','tpl-progress-course-link','tpl-progress-recent-item','tpl-course-chooser','tpl-course-chooser-preview','tpl-course-landing','tpl-course-volume-link','tpl-course-detail','tpl-course-unit-card','tpl-unit-experience','tpl-unit-activity-step'])await expect(page.locator(`#${id}`)).toHaveCount(1);
  await expect(page.locator('main a[href^="/bible?book="]')).toHaveCount(66);
  await page.locator('#progress-open').click();
  await expect(page.locator('#progress-body .progress-panel__summary')).toBeVisible();
  await page.locator('#progress-close').click();
  await page.locator('nav.primary a[href="/course"]').click();
  await expect(page.locator('.course-volume-landing')).toBeVisible();
  const courseHref=await page.locator('.course-volume').first().getAttribute('href');
  expect(courseHref).toBeTruthy();
  await page.locator('.course-volume').first().click();
  await expect(page.locator('.course-catalog-detail')).toBeVisible();
  const unitHref=await page.locator('.journey-unit-card h2 a').first().getAttribute('href');
  expect(unitHref).toBeTruthy();
  await page.locator('.journey-unit-card h2 a').first().click();
  await expect(page.locator('.unit-experience-hero')).toBeVisible();
  await expect(page.locator('.activity-step')).not.toHaveCount(0);
  expect(errors).toEqual([]);
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
