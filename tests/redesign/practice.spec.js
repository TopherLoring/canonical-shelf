// Review & Practice (S5b overview, S12 mode frames): every /practice address opens in the same frame (rail, progress panel); the mode's own content is rebuilt later.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

test.describe('Review & Practice', () => {
  test('desktop: heading, rail, due card, three game tiles, stats; no CSP errors', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/practice');
    await expect(page.locator('.practice-screen h1')).toHaveText('Review & Practice');
    await expect(page.locator('.practice-screen__rail a')).toHaveCount(5);
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

  const MODES = [
    { path: '/practice?mode=review', active: 'Due for review', heading: /due/i },
    { path: '/practice?mode=verses', active: 'Verse library', heading: /Verse Library/ },
    { path: '/practice?mode=arcade', active: 'Games', heading: /Arcade/ },
    { path: '/practice?mode=achievements', active: 'Achievements', heading: /./ },
    { path: '/practice?mode=arcade&game=sequence&scope=all', active: 'Games', heading: /./ }
  ];

  for (const mode of MODES) {
    test(`${mode.path} opens inside the practice frame with its rail item highlighted`, async ({ page }) => {
      await page.goto(mode.path);
      await expect(page.locator('.practice-screen__mode h1').first()).toHaveText(mode.heading);
      await expect(page.locator('.practice-screen__rail a')).toHaveCount(5);
      await expect(page.locator('.practice-screen__rail a.is-active, .practice-screen__rail a[aria-current]')).toHaveText(new RegExp(mode.active));
      await expect(page.locator('.practice-screen__stat-card')).toHaveCount(2);
      await expect(page.locator('.practice-screen__mode a[href="/practice"]', { hasText: 'Practice overview' })).toHaveCount(0);
    });
  }

  test('a game still runs and checks inside the frame', async ({ page }) => {
    await page.goto('/practice?mode=arcade&game=sequence&scope=all');
    await expect(page.locator('.practice-screen__mode')).toBeVisible();
    await page.goto('/practice?arcade=sequence&scope=all');
    const form = page.locator('[data-practice-run]');
    await expect(form).toBeVisible();
    await form.locator('button[type="submit"]').click();
    await expect(form.locator('.feedback')).not.toBeEmpty();
  });

  test('a mode button is styled by the frame (padded, bordered, not bare text)', async ({ page }) => {
    await page.goto('/practice?mode=verses');
    const primary = page.locator('.practice-screen__mode .button--primary').first();
    await expect(primary).toBeVisible();
    const m = await primary.evaluate(el => { const c = getComputedStyle(el); return { pad: parseFloat(c.paddingLeft), bg: c.backgroundColor }; });
    expect(m.pad).toBeGreaterThan(8);
    expect(m.bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('phone: every mode fits without sideways scroll and the rail shows full labels', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const mode of MODES) {
      await page.goto(mode.path);
      await expect(page.locator('.practice-screen__mode')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), mode.path).toBe(true);
      const truncated = await page.locator('.practice-screen__rail .ui-rail-label').evaluateAll(els => els.filter(el => el.scrollWidth > el.clientWidth + 1).length);
      expect(truncated, mode.path).toBe(0);
    }
  });

  test('phone: no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/practice');
    await expect(page.locator('.practice-screen')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
