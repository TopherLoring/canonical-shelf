import {test,expect} from '@playwright/test';

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
  test('primary navigation is in the same position across every route on desktop (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    let baselineBox = null;
    let baselineRoute = null;

    for (const route of ROUTES) {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('nav.primary');
      const box = await page.locator('nav.primary').boundingBox();
      expect(box, `Nav primary should be visible on ${route.name}`).not.toBeNull();

      if (!baselineBox) {
        baselineBox = box;
        baselineRoute = route.name;
      } else {
        expect(Math.abs(box.x - baselineBox.x), `Nav X on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
        expect(Math.abs(box.y - baselineBox.y), `Nav Y on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
        expect(Math.abs(box.width - baselineBox.width), `Nav width on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(2);
        expect(Math.abs(box.height - baselineBox.height), `Nav height on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(2);
      }
    }
  });

  test('primary navigation is in the same position across every route on phone (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let baselineBox = null;
    let baselineRoute = null;

    for (const route of ROUTES) {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('nav.primary');
      const box = await page.locator('nav.primary').boundingBox();
      expect(box, `Nav primary should be visible on phone ${route.name}`).not.toBeNull();

      if (!baselineBox) {
        baselineBox = box;
        baselineRoute = route.name;
      } else {
        expect(Math.abs(box.x - baselineBox.x), `Nav X on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
        expect(Math.abs(box.y - baselineBox.y), `Nav Y on ${route.name} matches ${baselineRoute}`).toBeLessThanOrEqual(1.5);
      }
    }
  });

  test('Theologian tab position is identical on every phone route (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    let baselineTab = null;
    let baselineRoute = null;

    for (const route of ROUTES) {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
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
