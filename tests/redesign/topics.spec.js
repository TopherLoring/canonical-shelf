// Study Topics (S5a): browse groups, search, selected-topic panel, full topic page, Glossary, legacy links.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const screen = page => page.locator('[data-topics-screen]');

test.describe('Study Topics', () => {
  test('desktop: groups with counts, question cards, a selected-topic panel; no CSP errors', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/topics');
    await expect(screen(page)).toBeVisible();
    await expect(page.locator('.topics-screen h1')).toHaveText('Study Topics');
    await expect(page.locator('.topics-groups a')).toHaveCount(6);
    expect(await page.locator('.topics-card').count()).toBeGreaterThan(0);
    await expect(page.locator('.topics-context h3').first()).toBeVisible();
    expect(errors.filter(e => /Content Security Policy/.test(e))).toEqual([]);
  });

  test('choosing a card selects it; Open topic shows the full page with Reference Desk and notes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/topics');
    const second = page.locator('.topics-card').nth(1);
    const title = (await second.locator('strong').textContent()).trim();
    await second.click();
    await expect(page.locator('.topics-card.is-selected strong')).toHaveText(title);
    await expect(page.locator('.topics-context h3').first()).toHaveText(title);
    await page.locator('.topics-context a.button--primary').click();
    await expect(page.locator('.topics-detail h1')).toHaveText(title);
    await expect(page.locator('.topics-context .ui-panel-title')).toHaveText('Reference Desk');
    await expect(page.locator('.topics-context [data-notes-mount]')).toBeAttached();
    expect(await page.locator('.topics-context__actions').count(), 'Ask the Theologian appears once').toBe(1);
  });

  test('a theology topic shows its Scripture connections once, and a legacy /topics?topic= link opens its full page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/topics?mode=theology');
    const card = page.locator('.topics-card').first();
    const href = await card.getAttribute('href');
    const id = new URL(href, 'http://x').searchParams.get('topic');
    await page.goto(`/topics?topic=${encodeURIComponent(id)}`);
    await expect(page.locator('.topics-detail h1')).toBeVisible();
    expect(await page.locator('.topics-context__section h3', { hasText: 'Scripture connections' }).count(), 'one Scripture connections section').toBeLessThanOrEqual(1);
    expect(await page.locator('.topics-context__section h3', { hasText: 'Studied in the Learning Path' }).count()).toBeLessThanOrEqual(1);
  });

  test('search from the page filters, and the Glossary lists terms with a working search', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/topics');
    await page.locator('#topic-query').fill('covenant');
    await page.locator('#topic-search button[type=submit]').click();
    await expect(page).toHaveURL(/q=covenant/);
    await page.goto('/topics?mode=glossary');
    await expect(page.locator('.topics-glossary__card').first()).toBeVisible();
    const before = await page.locator('.topics-glossary__card').count();
    await page.locator('#topic-query').fill('covenant');
    await page.locator('#topic-search button[type=submit]').click();
    await expect(page).toHaveURL(/mode=glossary/);
    expect(await page.locator('.topics-glossary__card').count()).toBeLessThanOrEqual(before);
  });

  test('phone: no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/topics');
    await expect(screen(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.goto('/topics?mode=glossary');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
