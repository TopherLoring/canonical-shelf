// Profile (S5c): one full screen, six sections, appearance controls work, no inline-style (CSP) breakage.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const SECTIONS = ['you', 'progress', 'notes', 'appearance', 'reading', 'privacy'];

test.describe('Profile', () => {
  test('desktop: six sections, section links scroll in place, theme and light/dark controls apply, no CSP errors', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile');
    await expect(page.locator('.profile-screen h1')).toHaveText('Profile');
    for (const id of SECTIONS) await expect(page.locator(`#${id}.profile-screen__section`)).toBeVisible();
    await expect(page.locator('#you [data-account-mount]')).not.toContainText('Checking your account');
    await expect(page.locator('[data-profile-progress] .progress-panel__summary')).toBeVisible();

    await page.locator('.profile-screen__nav a[href="#privacy"]').click();
    await expect(page).toHaveURL(/\/profile#privacy$/);
    await expect(page.locator('#privacy')).toBeInViewport();

    const cards = page.locator('#appearance [data-theme-option]');
    const target = await cards.nth(2).getAttribute('data-theme-option');
    await cards.nth(2).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', target);
    await expect(cards.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#appearance [data-mode-choice="dark"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
    await expect(page.locator('#appearance [data-mode-choice="dark"]')).toHaveAttribute('aria-checked', 'true');
    expect(errors.filter(e => /Content Security Policy/.test(e))).toEqual([]);
  });

  test('theme cards: swatch has four painted colours, name and description do not overlap', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile#appearance');
    const card = page.locator('#appearance .theme-choice').first();
    await expect(card.locator('.theme-choice__swatch i')).toHaveCount(4);
    const m = await card.evaluate(el => {
      const n = el.querySelector('strong').getBoundingClientRect(), d = el.querySelector('.theme-choice__text > span').getBoundingClientRect();
      const sw = el.querySelector('.theme-choice__swatch').getBoundingClientRect();
      return { gap: d.top - n.bottom, swatchH: sw.height, colours: new Set([...el.querySelectorAll('.theme-choice__swatch i')].map(i => getComputedStyle(i).backgroundColor)).size };
    });
    expect(m.gap).toBeGreaterThanOrEqual(0);
    expect(m.swatchH).toBeGreaterThan(40);
    expect(m.colours).toBeGreaterThan(1);
  });

  test('light/dark is a radio group: arrow keys move and select', async ({ page }) => {
    await page.goto('/profile#appearance');
    const light = page.locator('#appearance [data-mode-choice="light"]');
    await light.click();
    await light.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#appearance [data-mode-choice="dark"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  });

  test('phone: no horizontal scroll, sections stack', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/profile');
    await expect(page.locator('.profile-screen h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    for (const id of SECTIONS) await expect(page.locator(`#${id}.profile-screen__section`)).toBeAttached();
  });
});
