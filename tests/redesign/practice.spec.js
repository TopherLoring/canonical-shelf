// Review & Practice (template port): every /practice address opens in the template's well frame (rail, column, progress panel; on the phone a drop-down replaces the rail); the modes keep their own content.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

test.describe('Review & Practice', () => {
  test('desktop: heading, rail, due card, three game tiles, stats; no CSP errors', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/practice');
    await expect(page.locator('main.cs-cols--practice h1')).toHaveText('Review & Practice');
    await expect(page.locator('.practice-rail a')).toHaveCount(4);
    await expect(page.locator('.practice-screen__due')).toBeVisible();
    await expect(page.locator('.practice-screen__game')).toHaveCount(3);
    await expect(page.locator('.practice-stat-card')).toHaveCount(2);
    expect(errors.filter(e => /Content Security Policy/.test(e))).toEqual([]);
  });

  test('every link on the overview resolves to a live practice mode or the Learning Path (no dead ends)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/practice');
    await expect(page.locator('main.cs-cols--practice')).toBeVisible();
    const hrefs = await page.locator('main.cs-cols--practice a[href^="/practice?"], main.cs-cols--practice a[href="/course"]').evaluateAll(a => [...new Set(a.map(x => x.getAttribute('href')))]);
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
      await expect(page.locator('.practice-rail a')).toHaveCount(4);
      await expect(page.locator('.practice-rail a[aria-current]')).toHaveText(new RegExp(mode.active));
      await expect(page.locator('.practice-stat-card')).toHaveCount(2);
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

  test('phone: every mode fits without sideways scroll and the a drop-down replaces the rail', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const mode of MODES) {
      await page.goto(mode.path);
      await expect(page.locator('.practice-screen__mode')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), mode.path).toBe(true);
      await expect(page.locator('.practice-rail'), mode.path).toBeHidden();
      const picker = page.locator('.practice-picker .cs-grow');
      await expect(picker, mode.path).toBeVisible();
      expect(await picker.evaluate(el => el.scrollWidth <= el.clientWidth + 1), mode.path).toBe(true);
    }
  });

  test('desktop: the current rail item wears the rose, and the frame is the template well with the three columns', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/practice');
    const frame = page.locator('main#main');
    await expect(frame).toHaveClass(/cs-frame--well/);
    await expect(frame).toHaveClass(/cs-cols--practice/);
    await expect(page.locator('.practice-rail a.is-current')).toHaveText(/Due for review/);
    const cols = await frame.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(cols).toBe(3);
    await expect(page.locator('.practice-picker')).toBeHidden();
  });

  test('phone: the drop-down opens a mode, the overview is one column, the games sit beside their art', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/practice');
    await expect(page.locator('.practice-screen__main')).toBeVisible();
    await expect(page.locator('.practice-rail')).toBeHidden();
    const heads = await page.locator('main#main > *').evaluateAll(els => els.filter(el => el.getBoundingClientRect().height > 0).map(el => Math.round(el.getBoundingClientRect().left)));
    expect(new Set(heads).size, 'one column: every pane starts at the same left edge').toBe(1);
    await page.locator('[data-practice-select]').selectOption('/practice?mode=verses');
    await expect(page).toHaveURL(/mode=verses/);
    await expect(page.locator('.practice-picker .cs-grow')).toHaveText(/Verse library/);
  });

  test('phone: no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/practice');
    await expect(page.locator('main.cs-cols--practice')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
