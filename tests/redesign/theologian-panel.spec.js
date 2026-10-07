// Theologian panel (S6): docked/floating on desktop, centered card with dimmed, inert surroundings on a phone.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const open = async page => {
  await expect(page.locator('#guide-open')).toBeEnabled();
  await page.locator('#guide-open').click();
  await expect(page.locator('#guide')).toHaveAttribute('data-open', 'true');
};

test.describe('Theologian panel', () => {
  test('desktop: opens as a panel on the right, no dimming, page stays usable, closes and returns focus', { tag: '@smoke' }, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    await open(page);
    const box = await page.locator('#guide').boundingBox();
    expect(box.x + box.width, 'panel sits against the right edge').toBeGreaterThan(1440 - 60);
    expect(box.x, 'panel is the right-hand column, not full width').toBeGreaterThan(1440 / 2);
    await expect(page.locator('[data-theologian-backdrop]')).toBeHidden();
    expect(await page.evaluate(() => document.body.children.length && [...document.body.children].some(c => c.inert))).toBe(false);
    await page.locator('#guide-close').click();
    await expect(page.locator('#guide')).toBeHidden();
    await expect(page.locator('#guide-open')).toBeFocused();
  });

  test('phone: centered card, dimmed backdrop, background inert, Tab stays inside, backdrop click closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home');
    await open(page);
    await expect.poll(async () => { const b = await page.locator('#guide').boundingBox(); return Math.max(Math.abs(b.x + b.width / 2 - 195), Math.abs(b.y + b.height / 2 - 422)); }, { message: 'card settles centered', timeout: 5000 }).toBeLessThan(3);
    await expect(page.locator('[data-theologian-backdrop]')).toBeVisible();
    await expect(page.locator('#guide')).toHaveAttribute('aria-modal', 'true');
    expect(await page.evaluate(() => [...document.body.children].filter(c => c.id !== 'guide' && !c.hasAttribute('data-theologian-backdrop') && !c.inert && c.tagName !== 'SCRIPT').length), 'everything behind is inert').toBe(0);
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.querySelector('#guide').contains(document.activeElement)), `Tab ${i + 1} stays in the panel`).toBe(true);
    }
    await page.mouse.click(8, 8);
    await expect(page.locator('#guide')).toBeHidden();
    await expect(page.locator('[data-theologian-backdrop]')).toBeHidden();
    expect(await page.evaluate(() => [...document.body.children].some(c => c.inert)), 'inert removed after closing').toBe(false);
    await expect(page.locator('#guide-open')).toBeFocused();
  });

  test('the stylesheet is linked statically and cached for offline use', async ({ page, request }) => {
    await page.goto('/home');
    expect(await page.locator('link[href="/ui/components/theologian-panel.css"]').count()).toBe(1);
    const sw = await (await request.get('/sw.js')).text();
    expect(sw).toContain('/ui/components/theologian-panel.css');
    expect(sw).toContain('/ui/components/theologian-panel.js');
  });
});
