import { test, expect } from '@playwright/test';

// The edge tabs (Theologian, My Notes) sit in a reserved strip at the right edge of the app.
// The page frame never extends into that strip, so no text can sit under a tab at any size.
const ROUTES = ['/home', '/path', '/bible?book=43&chapter=3', '/topics', '/practice', '/profile', '/course?unit=c1.christianity&lesson=begin&step=1'];
const SIZES = [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 360, height: 640 }, { width: 820, height: 1180 }];

for (const size of SIZES) {
  test(`edge tabs never overlap the page frame at ${size.width}x${size.height}`, async ({ page }) => {
    test.slow();
    await page.setViewportSize(size);
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.locator('main')).not.toBeEmpty();
      await expect(page.locator('#guide-open')).toBeEnabled();
      const result = await page.evaluate(() => {
        const frame = document.querySelector('main#main').getBoundingClientRect();
        return [...document.querySelectorAll('.ui-edge-tab')]
          .filter(el => el.getClientRects().length)
          .map(el => { const r = el.getBoundingClientRect(); return { id: el.id || el.className, overlap: Math.min(frame.right, r.right) - Math.max(frame.left, r.left) > 0.5 && Math.min(frame.bottom, r.bottom) - Math.max(frame.top, r.top) > 0.5 }; });
      });
      expect(result.length, `a tab is visible on ${route}`).toBeGreaterThan(0);
      for (const tab of result) expect(tab.overlap, `${tab.id} stays outside the frame on ${route}`).toBe(false);
    }
  });
}

test('Bible is a focus screen on the phone: close button, no bottom bar; every other phone screen keeps the bar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/bible?book=43&chapter=3');
  await expect(page.locator('.cs-tabbar')).toBeHidden();
  await page.getByRole('link', { name: 'Close Bible' }).click();
  await expect(page).toHaveURL(/\/home$/);
  for (const route of ['/home', '/path', '/topics', '/practice', '/search?q=grace', '/profile']) {
    await page.goto(route);
    await expect(page.locator('.cs-tabbar'), `bottom bar on ${route}`).toBeVisible();
  }
  await page.goto('/course?unit=c1.christianity&lesson=begin&step=1');
  await expect(page.locator('.cs-tabbar')).toBeHidden();
});

test('the offline line lives in Profile, not under the top bar', async ({ page }) => {
  await page.goto('/home');
  await expect(page.locator('.cs-notice')).toHaveCount(0);
  await page.goto('/profile');
  await expect(page.locator('#privacy #pwa-status')).toBeVisible();
});
