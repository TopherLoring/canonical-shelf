// Decision ui.type.max-genesis-2026-10-07: no text anywhere is larger than the Genesis title on the shelf
// (--type-max). The only exception is the site title (masthead wordmark and the Home page title).
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const ROUTES = [
  '/home', '/course', '/course?unit=c1.christianity',
  '/course?unit=c1.christianity&lesson=begin',
  '/course?unit=c1.christianity&mastery=unit-c1-christianity-mastery&step=2',
  '/bible?book=1&chapter=1', '/topics', '/topics?mode=glossary', '/practice', '/practice?mode=arcade',
  '/practice?mode=verses', '/practice?mode=review', '/practice?mode=achievements', '/profile', '/search?q=grace', '/about', '/course?course=c1', '/topics?glossary=grace',
  '/practice?mode=campaign', '/practice?mode=context',
];
const SITE_TITLE = '.brand-wordmark, .brand-wordmark *, .shelf-home__intro h1, .shelf-home__intro h1 *';

for (const [name, size] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844 }], ['wide', { width: 1920, height: 1000 }]]) {
  test(`${name}: no text is larger than the Genesis title (site title excepted)`, async ({ page }) => {
    await page.setViewportSize(size);
    const offenders = [];
    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForSelector('main > *');
      await page.waitForTimeout(300);
      const found = await page.evaluate(sel => {
        const probe = document.createElement('span');
        probe.style.fontSize = 'var(--type-max)';
        probe.style.position = 'absolute';
        document.body.appendChild(probe);
        const cap = parseFloat(getComputedStyle(probe).fontSize);
        probe.remove();
        const out = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = walker.nextNode());) {
          if (!n.textContent.trim()) continue;
          const el = n.parentElement;
          if (!el || el.closest(sel)) continue;
          if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs > cap + 0.5) out.push(`${fs}px > ${cap}px: ${(el.className || el.tagName).toString().slice(0, 40)} "${n.textContent.trim().slice(0, 24)}"`);
        }
        return out;
      }, SITE_TITLE);
      for (const f of found) offenders.push(`${route} ${f}`);
    }
    expect(offenders).toEqual([]);
  });
}
