// Study Topics (template port): rail | card grid | item pane in the well frame; questions open a question page; Glossary; My Notes sheet; legacy links; phone drop-downs.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const main = page => page.locator('main.cs-frame--well');
const noSideways = page => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test.describe('Study Topics', () => {
  test('desktop: the rail lists the four groups and the Glossary; Questions opens as a wide card list; no CSP errors', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/topics');
    await expect(main(page).locator('h1.topics-h1')).toHaveText('Questions');
    await expect(page.locator('.topics-rail a')).toHaveCount(6);
    await expect(page.locator('.topics-rail a[aria-current="page"]')).toHaveText(/Questions/);
    expect(await page.locator('.cs-topic').count()).toBeGreaterThan(5);
    await expect(page.locator('main.cs-cols--topics-list')).toBeVisible();
    expect(errors.filter(e => /Content Security Policy/.test(e))).toEqual([]);
  });

  test('a question card opens the question page with its Learning Path touchpoints, and Back returns to the list', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/topics');
    const title = (await page.locator('.cs-topic .cs-topic__title').first().textContent()).trim();
    await page.locator('.cs-topic').first().click();
    await expect(page.locator('main h1').first()).toHaveText(title);
    await expect(page.locator('.cs-touch li:visible').first()).toBeVisible();
    expect(await page.locator('[data-ask]:visible').count(), 'Ask the Theologian appears once').toBe(1);
    await page.locator('.cs-backlink').click();
    await expect(main(page).locator('h1.topics-h1')).toHaveText('Questions');
  });

  test('a curated group selects its first topic; a card, a sub topic and Sources change the item pane', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/topics?mode=theology');
    await expect(page.locator('main.cs-cols--topics')).toBeVisible();
    const pane = page.locator('aside[aria-label="Selected topic"]');
    const first = (await page.locator('.cs-topic .cs-topic__title').first().textContent()).trim();
    await expect(pane.locator('h2')).toHaveText(first);
    await expect(page.locator('.cs-topic[aria-current="true"] .cs-topic__title')).toHaveText(first);
    const second = (await page.locator('.cs-topic .cs-topic__title').nth(1).textContent()).trim();
    await page.locator('.cs-topic').nth(1).click();
    await expect(pane.locator('h2')).toHaveText(second);
    await expect(page).toHaveURL(/sub=0/);
    const subs = pane.locator('.cs-sublist a');
    expect(await subs.count()).toBeGreaterThan(1);
    await subs.nth(1).click();
    await expect(page).toHaveURL(/sub=1/);
    await expect(pane.locator('.cs-sublist a[aria-current="true"]')).toHaveCount(1);
    await expect(pane.locator('.cs-refs')).toBeVisible();
  });

  test('a legacy /topics?topic= link selects the topic (question ids open the question page)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/topics?mode=theology');
    const id = new URL(await page.locator('.cs-topic').nth(1).getAttribute('href'), 'http://x').searchParams.get('topic');
    await page.goto(`/topics?topic=${encodeURIComponent(id)}`);
    await expect(page.locator('main.cs-cols--topics')).toBeVisible();
    await expect(page.locator('.cs-topic[aria-current="true"]')).toHaveCount(1);
    await page.goto('/topics?topic=q.god-christ');
    await expect(page.locator('.cs-backlink')).toBeVisible();
  });

  test('search filters across topics and questions, and the Glossary lists terms with a working search', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/topics');
    await page.locator('#topic-query').fill('covenant');
    await page.locator('#topic-query').press('Enter');
    await expect(page).toHaveURL(/q=covenant/);
    await expect(page.locator('main h1').first()).toContainText('covenant');
    await page.goto('/topics?mode=glossary');
    await expect(page.locator('.topics-glossary__card').first()).toBeVisible();
    const before = await page.locator('.topics-glossary__card').count();
    await page.locator('#topic-query').fill('covenant');
    await page.locator('#topic-query').press('Enter');
    await expect(page).toHaveURL(/mode=glossary/);
    expect(await page.locator('.topics-glossary__card').count()).toBeLessThan(before);
  });

  test('My Notes opens from its edge tab as a sheet with the notes editor and closes again', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/topics?mode=theology');
    await page.locator('[data-edge-tab="notes"]').click();
    const sheet = page.locator('#topics-notes-sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('[data-notes-mount]')).toBeAttached();
    await sheet.locator('[data-dialog-close]').click();
    await expect(sheet).toBeHidden();
  });

  test('phone: a drop-down replaces the rail; topics and sub topics are accordions; no sideways scroll in any mode', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const url of ['/topics', '/topics?mode=theology', '/topics?mode=glossary', '/topics?mode=questions&topic=q.god-christ&view=read', '/topics?q=covenant']) {
      await page.goto(url);
      await expect(main(page).first()).toBeVisible();
      expect(await noSideways(page), url).toBe(true);
    }
    await page.goto('/topics?mode=theology');
    await expect(page.locator('.topics-rail')).toBeHidden();
    await expect(page.locator('.topics-picker')).toBeVisible();
    await expect(page.locator('.cs-subacc details').first()).toBeVisible();
    await page.locator('.topics-picker select').selectOption({ label: 'Glossary' });
    await expect(page).toHaveURL(/mode=glossary/);
  });
});
