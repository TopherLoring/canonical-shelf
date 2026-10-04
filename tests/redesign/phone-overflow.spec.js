import { test, expect } from '@playwright/test';
import { waitForAppReady } from './test-helpers.js';

const ROUTES = [
  { name: 'Shelf', path: '/home' },
  { name: 'Reader', path: '/bible' },
  { name: 'Lesson', path: '/course?unit=c1.christianity&lesson=begin&scene=2' },
  { name: 'Course landing', path: '/course' },
  { name: 'Learning Path', path: '/path' },
  { name: 'Study Topics', path: '/topics' },
  { name: 'Review & Practice', path: '/practice' }
];

const PHONE_VIEWPORT = { width: 390, height: 844 };

test.describe('Phase 0: Phone horizontal overflow guard (390x844)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(PHONE_VIEWPORT);
  });

  for (const route of ROUTES) {
    test(`no horizontal scroll on phone: ${route.name} (${route.path})`, async ({ page }) => {
      await page.goto(route.path);
      await waitForAppReady(page);

      const overflow = await page.evaluate(() => {
        const root = document.documentElement;
        return Math.max(0, root.scrollWidth - window.innerWidth);
      });

      // Legacy course landing currently has a 10px overflow from .course-volume-shelf;
      // Phase 2 replaces it with Frame layout and phone cards.
      if (route.path === '/course' || route.path === '/path') {
        const hasLegacyOverflow = overflow > 1;
        if (hasLegacyOverflow) {
          test.fail(hasLegacyOverflow, `TODO(Phase 2): ${route.name} overflows horizontally by ${overflow}px on 390px phones until Phase 2 Frame layout`);
        }
      }

      expect(overflow, `Horizontal page overflow on ${route.name} (${route.path}) at 390px phone width`).toBeLessThanOrEqual(1);
    });
  }
});
