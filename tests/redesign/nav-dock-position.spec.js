import { test, expect } from '@playwright/test';
import { waitForAppReady } from './test-helpers.js';

// Core routes specified in redesign brief:
// Shelf (/home), reader (/bible), lesson (/course), Learning Path (/path), Study Topics (/topics), Review & Practice (/practice)
const ROUTES = [
  { name: 'Shelf', path: '/home' },
  { name: 'Reader', path: '/bible' },
  { name: 'Lesson', path: '/course' },
  { name: 'Learning Path', path: '/path' },
  { name: 'Study Topics', path: '/topics' },
  { name: 'Review & Practice', path: '/practice' }
];

test.describe('Phase 0: Nav and dock invariant positions across routes', () => {
  test.slow();
  test('primary navigation is in the same position across every route on desktop (1440x900)',{tag:'@smoke'}, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    let baselineBox = null;
    let baselineItemBoxes = null;
    let baselineRoute = null;

    for (const route of ROUTES) {
      await page.goto(route.path);
      await waitForAppReady(page);

      const navLocator = page.locator('nav.primary');
      const box = await navLocator.boundingBox();
      expect(box, `Nav primary should be visible on ${route.name}`).not.toBeNull();

      // Collect bounding boxes of individual nav items
      const itemLocators = await navLocator.locator('a').all();
      const itemBoxes = [];
      for (const item of itemLocators) {
        const text = (await item.innerText()).trim();
        const b = await item.boundingBox();
        expect(b, `Nav item "${text}" should have bounding box on ${route.name}`).not.toBeNull();
        itemBoxes.push({ text, ...b });
      }

      if (!baselineBox) {
        baselineBox = box;
        baselineItemBoxes = itemBoxes;
        baselineRoute = route.name;
      } else {
        expect(Math.abs(box.x - baselineBox.x), `Nav container X on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
        expect(Math.abs(box.y - baselineBox.y), `Nav container Y on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
        expect(Math.abs(box.width - baselineBox.width), `Nav container width on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(2);
        expect(Math.abs(box.height - baselineBox.height), `Nav container height on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(2);

        expect(itemBoxes.length, `Nav item count on ${route.name} matches ${baselineRoute}`).toBe(baselineItemBoxes.length);
        for (let i = 0; i < itemBoxes.length; i++) {
          const item = itemBoxes[i];
          const base = baselineItemBoxes[i];
          expect(Math.abs(item.x - base.x), `Nav item "${item.text}" X on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
          expect(Math.abs(item.y - base.y), `Nav item "${item.text}" Y on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
          expect(Math.abs(item.width - base.width), `Nav item "${item.text}" width on ${route.name} matches ${baselineRoute} (the current tab is set heavier)`).toBeLessThanOrEqual(4);
          expect(Math.abs(item.height - base.height), `Nav item "${item.text}" height on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(2);
        }
      }
    }
  });

  test('primary navigation is in the same position across every route on phone (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let baselineBox = null;
    let baselineItemBoxes = null;
    let baselineRoute = null;

    // Lesson and Bible are focus screens on the phone (no bottom bar); the bar must sit identically on the rest.
    for (const route of ROUTES.filter(r => r.name !== 'Reader' && r.name !== 'Lesson')) {
      await page.goto(route.path);
      await waitForAppReady(page);

      const navLocator = page.locator('nav.cs-tabbar');
      const box = await navLocator.boundingBox();
      expect(box, `Nav primary should be visible on phone ${route.name}`).not.toBeNull();

      // Collect bounding boxes of individual nav items
      const itemLocators = await navLocator.locator('a').all();
      const itemBoxes = [];
      for (const item of itemLocators) {
        const text = (await item.innerText()).trim();
        const b = await item.boundingBox();
        expect(b, `Nav item "${text}" should have bounding box on ${route.name}`).not.toBeNull();
        itemBoxes.push({ text, ...b });
      }

      if (!baselineBox) {
        baselineBox = box;
        baselineItemBoxes = itemBoxes;
        baselineRoute = route.name;
      } else {
        expect(Math.abs(box.x - baselineBox.x), `Nav container X on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
        expect(Math.abs(box.y - baselineBox.y), `Nav container Y on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);

        expect(itemBoxes.length, `Nav item count on ${route.name} matches ${baselineRoute}`).toBe(baselineItemBoxes.length);
        for (let i = 0; i < itemBoxes.length; i++) {
          const item = itemBoxes[i];
          const base = baselineItemBoxes[i];
          expect(Math.abs(item.x - base.x), `Nav item "${item.text}" X on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
          expect(Math.abs(item.y - base.y), `Nav item "${item.text}" Y on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
        }
      }
    }
  });

  test('Theologian tab position is identical on every phone route (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let baselineTab = null;
    let baselineRoute = null;

    for (const route of ROUTES) {
      await page.goto(route.path);
      await waitForAppReady(page);

      const tab = page.locator('#guide-open');
      await expect(tab).toBeAttached();
      const box = await tab.boundingBox();
      expect(box, `Theologian tab should have bounding box on ${route.name}`).not.toBeNull();

      if (!baselineTab) {
        baselineTab = box;
        baselineRoute = route.name;
      } else {
        expect(Math.abs(box.x - baselineTab.x), `Theologian tab X on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
        expect(Math.abs(box.y - baselineTab.y), `Theologian tab Y on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
        expect(Math.abs(box.width - baselineTab.width), `Theologian tab width on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
        expect(Math.abs(box.height - baselineTab.height), `Theologian tab height on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
      }
    }
  });
});
