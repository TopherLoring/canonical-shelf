// Review & Practice overview (S5b): the plain /practice address; detailed modes stay on the existing view.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

test.describe('Review & Practice', () => {
  test('desktop: heading, rail, due card, three game tiles, stats; no CSP errors', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/practice');
    await expect(page.locator('.practice-screen h1')).toHaveText('Review & Practice');
    await expect(page.locator('.practice-screen__rail a')).toHaveCount(4);
    await expect(page.locator('.practice-screen__due')).toBeVisible();
    await expect(page.locator('.practice-screen__game')).toHaveCount(3);
    await expect(page.locator('.practice-screen__stat-card')).toHaveCount(2);
    expect(errors.filter(e => /Content Security Policy/.test(e))).toEqual([]);
  });

  test('every link on the overview resolves to a live practice mode or the Learning Path (no dead ends)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/practice');
    await expect(page.locator('.practice-screen')).toBeVisible();
    const hrefs = await page.locator('.practice-screen a[href^="/practice?"], .practice-screen a[href="/course"]').evaluateAll(a => [...new Set(a.map(x => x.getAttribute('href')))]);
    expect(hrefs.length).toBeGreaterThan(4);
    for (const href of hrefs) {
      await page.goto(href);
      await expect(page.locator('main'), href).not.toBeEmpty();
      await expect(page.locator('main'), href).not.toContainText(/not found|something went wrong/i);
    }
  });

  test('the achievements bar is painted with its real width (not blocked by the CSP)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/practice');
    const m = await page.locator('.practice-screen__progress').evaluate(bar => {
      const fill = bar.querySelector('.ui-progress-bar-fill');
      const expected = (Number(bar.getAttribute('aria-valuenow')) / Number(bar.getAttribute('aria-valuemax'))) * 100;
      return { expected, painted: fill.style.width };
    });
    expect(parseFloat(m.painted)).toBeCloseTo(m.expected, 1);
  });

  test('other modes keep working from the overview address', async ({ page }) => {
    await page.goto('/practice?mode=arcade');
    await expect(page.locator('main')).not.toBeEmpty();
    await page.goto('/practice?mode=verses');
    await expect(page.locator('main')).not.toBeEmpty();
  });

  test('phone: no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/practice');
    await expect(page.locator('.practice-screen')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
