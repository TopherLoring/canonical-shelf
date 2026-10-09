import { test, expect } from '@playwright/test';

// The edge tabs (Theologian, My Notes) sit at the right edge of the app.
// Desktop and tablet-landscape: they sit in a reserved strip the page frame never enters.
// Phone (narrow or portrait): the card surface is as far from the right edge as from the left, a tab may overlap its edge a little,
// and the content inside keeps clear of the tabs so no text or control sits under one.
const ROUTES = ['/home', '/path', '/bible?book=43&chapter=3', '/topics', '/practice', '/profile', '/course?unit=c1.christianity&lesson=begin&step=1'];
const SIZES = [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 360, height: 640 }, { width: 820, height: 1180 }];

for (const size of SIZES) {
  test(`edge tabs and the page frame at ${size.width}x${size.height}`, async ({ page }) => {
    test.slow();
    await page.setViewportSize(size);
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.locator('main')).not.toBeEmpty();
      await expect(page.locator('#guide-open')).toBeEnabled();
      await page.waitForTimeout(150);
      const result = await page.evaluate(() => {
        const frame = document.querySelector('main#main').getBoundingClientRect();
        const phone = innerWidth <= 760 || innerWidth / innerHeight <= 0.8;
        const tabs = [...document.querySelectorAll('.ui-edge-tab')].filter(el => el.getClientRects().length);
        const boxes = tabs.map(el => ({ id: el.id || el.className, r: el.getBoundingClientRect() }));
        const hit = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
        const under = [];
        const walker = document.createTreeWalker(document.querySelector('main#main'), NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent.trim() || !node.parentElement.getClientRects().length) continue;
          const range = document.createRange(); range.selectNodeContents(node);
          const parent = node.parentElement, style = getComputedStyle(parent);
          if (style.visibility === 'hidden' || parent.closest('[hidden], .cs-visually-hidden, .ui-edge-tab')) continue;
          for (const rect of range.getClientRects()) {
            if (rect.width < 1) continue;
            const tab = boxes.find(t => hit(rect, t.r));
            // only count text actually visible at that spot (not clipped by a scroller, not covered by something else)
            if (tab && document.elementFromPoint(Math.min(rect.right - 1, rect.left + rect.width / 2), rect.top + rect.height / 2)?.closest?.('.ui-edge-tab') && parent.getBoundingClientRect().top >= 0) under.push(tab.id + ' over "' + node.textContent.trim().slice(0, 30) + '"');
          }
        }
        return { phone, left: frame.left, right: innerWidth - frame.right, tabs: boxes.map(t => ({ id: t.id, overlap: hit(frame, t.r) })), under };
      });
      expect(result.tabs.length, `a tab is visible on ${route}`).toBeGreaterThan(0);
      if (result.phone) {
        expect(Math.abs(result.left - result.right), `equal margins either side of the card surface on ${route}`).toBeLessThanOrEqual(1.5);
      } else {
        for (const tab of result.tabs) expect(tab.overlap, `${tab.id} stays outside the frame on ${route}`).toBe(false);
      }
      expect(result.under, `no text under a tab on ${route}`).toEqual([]);
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
