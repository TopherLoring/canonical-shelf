// The Learning Path page (S3.J). Decisions: ui.naming.hide-module-unit-labels-2026-10-05 (learners never see "Module" or
// "Unit"), ui.naming.checkpoint-bare-2026-10-05 ("Checkpoint · <title>"), navigation.hierarchy (nothing is locked).
import { test, expect } from '@playwright/test';

// This page is about the curriculum map, not offline behavior (verify:sw covers the service worker).
test.use({ serviceWorkers: 'block' });

const path = page => page.locator('[data-learning-path]');

test.describe('Learning Path', () => {
  test('desktop: modules, the open unit with numbered lessons and its Checkpoint, up next and progress, no Module/Unit words', { tag: '@smoke' }, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course?unit=c1.bible');
    await expect(path(page)).toBeVisible();
    await expect(page.locator('h1')).toHaveText(/Reading the Bible Well/);
    await expect(page.locator('#path-modules .ui-rail-link')).toHaveCount(5); // four modules and Capstones
    await expect(page.locator('#path-modules .ui-rail-sublabel').first()).toHaveText(/lessons?/);

    const open = page.locator('[data-path-unit][open]');
    await expect(open).toHaveCount(1);
    await expect(open.locator('.path-unit-title')).toHaveText('What the Bible Is');
    const rows = open.locator('.path-row');
    await expect(rows.first().locator('.path-row-mark')).toHaveText('1');
    await expect(rows.first().locator('a')).toHaveAttribute('href', /\/course\?unit=c1\.bible&lesson=c1-library-groups/);
    await expect(open.locator('.path-row--checkpoint .path-row-title')).toHaveText('Checkpoint · What the Bible Is');

    await expect(page.locator('[data-path-aside]')).toContainText('Up next');
    await expect(page.locator('[data-path-aside] .ui-progress-scope')).toHaveCount(3);

    const words = await path(page).innerText();
    expect(words).not.toMatch(/\b(Module|Unit)s?\b/i);
    expect(words).not.toMatch(/Step \d+ of \d+/);
  });

  test('choosing a module in the rail switches the page; opening another unit closes the first and updates the address and progress', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course');
    await page.locator('#path-modules a', { hasText: 'The Hebrew Scriptures' }).click();
    await expect(page).toHaveURL(/course=module\.hebrew-scriptures/);
    await expect(page.locator('h1')).toHaveText(/Hebrew Scriptures/);

    await page.goto('/course?unit=c1.christianity');
    const units = page.locator('[data-path-unit]');
    await expect(units.first()).toHaveAttribute('open', '');
    await units.nth(1).locator('summary').first().click();
    await expect(units.nth(1)).toHaveAttribute('open', '');
    await expect(units.first()).not.toHaveAttribute('open', '');
    await expect(page).toHaveURL(/unit=c1\.bible/);
    await expect(page.locator('[data-path-aside] .ui-progress-scope').first()).toContainText('What the Bible Is');
  });

  test('Up next starts the first lesson, and finishing a unit\'s lessons moves it to the unit\'s Checkpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course?unit=c1.christianity');
    await expect(page.locator('[data-path-start]')).toHaveAttribute('href', /lesson=begin/);
    await page.locator('[data-path-start]').click();
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();

    await page.goto('/course?unit=c1.christianity');
    await expect(path(page)).toBeVisible();
    await page.evaluate(async () => {
      const db = await import('/db.js'); const state = await db.getState();
      const lessons = (await (await fetch('/data/catalog.json')).json()).byUnit['c1.christianity'].filter(id => id.startsWith('lesson:'));
      state.completed = lessons; await db.putState(state);
    });
    await page.reload();
    await expect(path(page)).toBeVisible();
    const open = page.locator('[data-path-unit][open]');
    await expect(open.locator('.path-row[data-state="done"]').first().locator('.path-row-status')).toHaveText('Complete');
    await expect(open.locator('.path-unit-status')).toHaveText(/In progress/);
    await expect(page.locator('[data-path-aside] .ui-panel-title, [data-path-aside] h2').first()).toContainText('Checkpoint · Christianity in One View');
    await expect(page.locator('[data-path-start]')).toHaveText('Start Checkpoint');
  });

  test('Capstones open from the rail and list every Capstone', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course');
    await page.locator('#path-capstones-link').click();
    const list = page.locator('#path-capstones');
    await expect(list).toHaveAttribute('open', '');
    await expect(list.locator('.path-row')).toHaveCount(6);
  });

  test('phone: one column with Up next first, the picker instead of the rail, Progress last, no sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/course?unit=c1.bible');
    await expect(path(page)).toBeVisible();
    await expect(page.locator('.path-rail-wrap')).toBeHidden();
    await expect(page.locator('[data-path-picker]')).toBeVisible();
    const tops = await page.evaluate(() => {
      const top = sel => document.querySelector(sel).getBoundingClientRect().top;
      return { upNext: top('[data-path-aside] > :nth-child(1)'), main: top('.path-main'), progress: top('[data-path-aside] > :nth-child(2)') };
    });
    expect(tops.upNext).toBeLessThan(tops.main);
    expect(tops.main).toBeLessThan(tops.progress);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.locator('[data-path-picker]').selectOption({ label: 'Second Temple Judaism & the Christ Event' });
    await expect(page).toHaveURL(/course=module\.christ-event/);
    await expect(page.locator('h1')).toHaveText(/Second Temple Judaism/);
  });
});
