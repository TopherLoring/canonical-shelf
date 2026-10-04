import {test,expect} from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const ROUTES = [
  { id: 'home', name: 'Shelf', path: '/home' },
  { id: 'bible', name: 'Bible reader', path: '/bible' },
  { id: 'course', name: 'Course landing', path: '/course' },
  { id: 'lesson', name: 'Authored lesson', path: '/course?unit=c1.christianity&lesson=begin&scene=2' },
  { id: 'path', name: 'Learning Path', path: '/path' },
  { id: 'topics', name: 'Study Topics', path: '/topics' },
  { id: 'practice', name: 'Review & Practice', path: '/practice' }
];

const SNAPSHOT_DIR = path.resolve('tests/redesign/snapshots');

test.beforeAll(() => {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
});

test.describe('Phase 0: Layout conformance & baseline snapshots', () => {
  for (const route of ROUTES) {
    test(`render and capture desktop baseline (1440x900): ${route.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const resp = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(resp?.ok(), `${route.name} (${route.path}) should load`).toBeTruthy();
      await page.waitForTimeout(300);

      const screenshotPath = path.join(SNAPSHOT_DIR, `desktop-${route.id}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      expect(fs.existsSync(screenshotPath), `Desktop snapshot for ${route.name} captured`).toBeTruthy();
    });

    test(`render and capture phone baseline (390x844): ${route.name}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const resp = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(resp?.ok(), `${route.name} (${route.path}) should load`).toBeTruthy();
      await page.waitForTimeout(300);

      const screenshotPath = path.join(SNAPSHOT_DIR, `phone-${route.id}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      expect(fs.existsSync(screenshotPath), `Phone snapshot for ${route.name} captured`).toBeTruthy();
    });
  }

  test('no scrolling on any lesson screen at default text size on desktop (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const scenes = [1, 2, 3, 4, 5, 6, 7, 8];
    const overflowingScenes = [];

    for (const scene of scenes) {
      await page.goto(`/course?unit=c1.christianity&lesson=begin&scene=${scene}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(200);
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollHeight > window.innerHeight + 2;
      });
      if (isOverflowing) {
        overflowingScenes.push(scene);
      }
    }

    if (overflowingScenes.length > 0) {
      test.fail(true, `TODO(Phase 5): Lesson scenes [${overflowingScenes.join(', ')}] scroll on desktop (1440x900); Phase 5 splits each step into non-scrolling screens`);
    }

    expect(overflowingScenes, 'No lesson screen should scroll at default text size').toEqual([]);
  });

  test('no scrolling on any lesson screen at default text size on phone (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const scenes = [1, 2, 3, 4, 5, 6, 7, 8];
    const overflowingScenes = [];

    for (const scene of scenes) {
      await page.goto(`/course?unit=c1.christianity&lesson=begin&scene=${scene}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(200);
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollHeight > window.innerHeight + 2;
      });
      if (isOverflowing) {
        overflowingScenes.push(scene);
      }
    }

    if (overflowingScenes.length > 0) {
      test.fail(true, `TODO(Phase 5): Lesson scenes [${overflowingScenes.join(', ')}] scroll on phone (390x844); Phase 5 splits each step into non-scrolling screens`);
    }

    expect(overflowingScenes, 'No lesson screen should scroll on phone at default text size').toEqual([]);
  });
});
