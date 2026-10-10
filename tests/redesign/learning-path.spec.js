// The Learning Path page (S3.J). Decisions: ui.naming.hide-module-unit-labels-2026-10-05 (learners never see "Module" or
// "Unit"), ui.naming.checkpoint-bare-2026-10-05 ("Checkpoint · <title>"), navigation.hierarchy (nothing is locked).
import { test, expect } from '@playwright/test';

// This page is about the curriculum map, not offline behavior (verify:sw covers the service worker).
test.use({ serviceWorkers: 'block' });

const path = page => page.locator('[data-learning-path]');
const noSideways = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
const complete = (page, ids) => page.evaluate(async list => {
  const db = await import('/db.js'); const state = await db.getState();
  state.completed = list; await db.putState(state);
}, ids);

test.describe('Learning Path', () => {
  test('desktop: modules, the open unit with numbered lessons and its Checkpoint, up next and progress, no Module/Unit words', { tag: '@smoke' }, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course?unit=c1.bible');
    await expect(path(page)).toBeVisible();
    await expect(page.locator('main.cs-cols--path h1')).toHaveText(/Reading the Bible Well/);
    await expect(page.locator('#path-modules .cs-module')).toHaveCount(4);
    await expect(page.locator('#path-capstones-link')).toBeVisible();
    await expect(page.locator('#path-modules .cs-rail__progress .ui-progress-bar')).toHaveCount(2);

    const open = page.locator('[data-path-unit][open]');
    await expect(open).toHaveCount(1);
    await expect(open.locator('.cs-unit__title')).toHaveText('What the Bible Is');
    const rows = open.locator('.path-row:visible');
    await expect(rows.first().locator('.cs-marker:visible')).toHaveText('1');
    await expect(rows.first().locator('a.path-desktop-only')).toHaveAttribute('href', /\/course\?unit=c1\.bible&view=unit&pick=lesson/);
    await expect(open.locator('.path-row--checkpoint:visible .cs-unit__lesson')).toHaveText('Checkpoint · What the Bible Is');

    await expect(page.locator('[data-path-up-next]')).toContainText('Up next');
    const words = await page.locator('main#main').innerText();
    expect(words).not.toMatch(/\b(Module|Unit)s?\b/i);
    expect(words).not.toMatch(/Step \d+ of \d+/);
  });

  test('choosing a module in the rail switches the page; opening another unit closes the first and updates the address', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course');
    await page.locator('#path-modules a', { hasText: 'The Hebrew Scriptures' }).click();
    await expect(page).toHaveURL(/course=module\.hebrew-scriptures/);
    await expect(page.locator('main.cs-cols--path h1')).toHaveText(/Hebrew Scriptures/);

    await page.goto('/course?unit=c1.christianity');
    const units = page.locator('[data-path-unit]');
    await expect(units.first()).toHaveAttribute('open', '');
    await units.nth(1).locator('summary').first().click();
    await expect(units.nth(1)).toHaveAttribute('open', '');
    await expect(units.first()).not.toHaveAttribute('open', '');
    await expect(page).toHaveURL(/unit=c1\.bible/);
  });

  test('a lesson row opens the unit page with the lesson selected, and its pane starts the lesson', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course?unit=c1.bible');
    await page.locator('[data-path-unit][open] a.path-desktop-only').nth(1).click();
    await expect(page).toHaveURL(/view=unit/);
    await expect(page.locator('[data-path-view="unit"]')).toBeVisible();
    await expect(page.locator('#path-modules .cs-backlink')).toBeVisible();
    await expect(page.locator('#path-modules .cs-module[aria-current="page"]')).toContainText('What the Bible Is');
    await expect(page.locator('.cs-unit__link[aria-current="true"]')).toHaveCount(1);
    const pane = page.locator('[data-path-lesson-pane]');
    await expect(pane).toContainText('Lesson 2 of 5');
    await pane.locator('[data-path-start]').click();
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
  });

  test('Up next starts the first lesson, and finishing a unit\'s lessons moves it to the unit\'s Checkpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course?unit=c1.christianity');
    await expect(page.locator('[data-path-up-next] [data-path-start]')).toHaveAttribute('href', /lesson=begin/);
    await page.locator('[data-path-up-next] [data-path-start]').click();
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();

    await page.goto('/course?unit=c1.christianity');
    await expect(path(page)).toBeVisible();
    const lessons = await page.evaluate(async () => (await (await fetch('/data/catalog.json')).json()).byUnit['c1.christianity'].filter(id => id.startsWith('lesson:')));
    await complete(page, lessons);
    await page.reload();
    await expect(path(page)).toBeVisible();
    const open = page.locator('[data-path-unit][open]');
    await expect(open.locator('.path-row[data-state="done"]').first().locator('.cs-marker:visible')).toHaveClass(/cs-marker--done/);
    await expect(open.locator('.cs-unit__status')).toHaveText(/In progress/);
    await expect(page.locator('[data-path-up-next] .cs-upnext__title')).toContainText('Checkpoint · Christianity in One View');
    await expect(page.locator('[data-path-up-next] [data-path-start]')).toHaveText('Start Checkpoint');
  });

  test('progress bars draw their value (empty at the start, partly full after some lessons), not full width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course?unit=c1.christianity&view=unit');
    await expect(path(page)).toBeVisible();
    const widths = () => page.evaluate(() => [...document.querySelectorAll('#path-modules .cs-rail__progress .ui-progress-bar')].map(bar => {
      const fill = bar.querySelector('.ui-progress-bar-fill');
      return Math.round(fill.getBoundingClientRect().width / bar.getBoundingClientRect().width * 100);
    }));
    expect(await widths()).toEqual([0, 0, 0]);
    await complete(page, ['lesson:begin']);
    await page.reload();
    await expect(path(page)).toBeVisible();
    const after = await widths();
    expect(after[0], 'the unit is half done (1 of 2 lessons)').toBeGreaterThan(40);
    expect(after[0]).toBeLessThan(60);
    expect(after[2], 'the whole path barely moves (1 of 119)').toBeLessThan(5);
  });

  test('Capstones open from the rail and list every Capstone', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course');
    await page.locator('#path-capstones-link').click();
    await expect(page).toHaveURL(/view=capstones/);
    await expect(page.locator('#path-capstones h1')).toHaveText('Capstones');
    await expect(page.locator('#path-capstones .path-row')).toHaveCount(6);
    await expect(page.locator('#path-capstones-link')).toHaveAttribute('aria-current', 'page');
  });

  test('phone: the picker replaces the rail, unit lessons open inline, no sideways scroll in any view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const url of ['/course', '/course?unit=c1.bible', '/course?unit=c1.bible&view=unit', '/course?view=capstones']) {
      await page.goto(url);
      await expect(path(page)).toBeVisible();
      expect(await noSideways(page), url).toBe(true);
    }
    await page.goto('/course?unit=c1.bible');
    await expect(page.locator('#path-modules')).toBeHidden();
    await expect(page.locator('[data-path-picker]')).toBeAttached();
    await expect(page.locator('[data-path-up-next]')).toBeHidden();
    const toggle = page.locator('[data-path-unit][open] [data-lesson-toggle]').first();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-path-unit][open] .cs-lessonopen:visible a.cs-button')).toBeVisible();
    await page.locator('[data-path-picker]').selectOption({ label: 'Second Temple Judaism & the Christ Event' });
    await expect(page).toHaveURL(/course=module\.christ-event/);
    await expect(page.locator('main.cs-cols--path h1')).toHaveText(/Second Temple Judaism/);
  });
});
