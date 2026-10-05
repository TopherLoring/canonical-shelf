import { test, expect } from '@playwright/test';

test('modules, units and activities share one Learning Path view with working deep links', async ({ page }) => {
  await page.goto('/path');
  await expect(page.locator('main h1')).toBeVisible();
  const shape = await page.evaluate(() => {
    const d = window.CANON_CATALOG, course = d.courses[0];
    return { modules: d.courses.map(c => `path-module-${c.id}`), course: course.id, units: d.byCourse[course.id], title: course.title };
  });
  await expect(page.locator('[data-learning-path]')).toBeVisible();
  expect(await page.locator('[data-path-modules] [id^="path-module-"]').evaluateAll(nodes => nodes.map(n => n.id))).toEqual(shape.modules);
  await expect(page.locator('[data-path-unit]')).toHaveCount(shape.units.length);
  await expect(page.locator('main h1')).toHaveText(shape.title);
  await page.evaluate(() => { window.__PATH_DOCUMENT__ = 'same'; });
  const unit = page.locator('[data-path-unit]').first();
  if (!await unit.evaluate(element => element.open)) await unit.locator('summary').click();
  const href = await unit.locator('[data-activity-link]').first().getAttribute('href');
  await unit.locator('[data-activity-link]').first().click();
  await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  expect(await page.evaluate(() => window.__PATH_DOCUMENT__)).toBe('same');
  await page.goBack();
  await expect(page.locator('[data-learning-path]')).toBeVisible();
});

test('unit deep links expand the requested unit and progress uses stable activity IDs', async ({ page }) => {
  await page.goto('/path');
  await expect(page.locator('main h1')).toBeVisible();
  const seed = await page.evaluate(async () => {
    const d = window.CANON_CATALOG, course = d.courses[0], unit = d.byCourse[course.id][1];
    const ids = d.byUnit[unit], db = await import('/db.js'), state = await db.getState();
    state.completed = ids.slice(0, 2); await db.putState(state);
    return { unit, total: ids.length, done: Math.min(2, ids.length) };
  });
  await page.goto(`/course?unit=${encodeURIComponent(seed.unit)}`);
  const unit = page.locator(`[data-path-unit="${seed.unit}"]`);
  await expect(unit).toHaveAttribute('open', '');
  await expect(unit.locator('[data-unit-progress]')).toContainText(`${seed.done} of ${seed.total}`);
  await expect(page.locator('[data-path-progress]')).toBeVisible();
});

test('the Learning Path reflows without horizontal overflow on narrow screens', async ({ page }) => {
  for (const width of [320, 390, 841, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/path');
    await expect(page.locator('[data-learning-path]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width < 700) await expect(page.locator('[data-path-module-picker]')).toBeVisible();
  }
});

test('module switching and inherited course aliases retain original units and activity links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/path');
  await expect(page.locator('[data-learning-path]')).toBeVisible();
  const modules = await page.evaluate(() => window.CANON_CATALOG.courses.map(c => ({ id: c.id, title: c.title, units: window.CANON_CATALOG.byCourse[c.id] })));
  for (const module of modules) {
    await page.locator('[data-path-module-picker]').selectOption(module.id);
    await expect(page.locator('main h1')).toHaveText(module.title);
    expect(await page.locator('[data-path-unit]').evaluateAll(nodes => nodes.map(n => n.dataset.pathUnit))).toEqual(module.units);
    await expect(page.locator('[data-path-modules] a[aria-current]')).toHaveCount(1);
  }
  const aliases = await page.evaluate(() => window.CANON_CATALOG.legacyCourseAliases);
  for (const [alias, current] of Object.entries(aliases)) {
    await page.goto(`/course?course=${encodeURIComponent(alias)}`);
    await expect(page.locator('main h1')).toHaveText(modules.find(m => m.id === current).title);
  }
});

test('review-due and mastery states display without counting Topics toward course completion', async ({ page }) => {
  await page.goto('/path');
  await expect(page.locator('[data-learning-path]')).toBeVisible();
  const seed = await page.evaluate(async () => {
    const data = window.CANON_CATALOG, db = await import('/db.js'), state = await db.getState();
    const unit = data.byCourse[data.courses[0].id][0];
    const ids = data.byUnit[unit];
    const lesson = ids.find(id => id.startsWith('lesson:')), mastery = ids.find(id => id.startsWith('mastery:'));
    state.completed = [lesson, mastery, 'topic:outside-course'];
    state.mastery[mastery] = { passed: true };
    state.reviewSchedule[lesson] = { dueAt: '2000-01-01T00:00:00Z', stage: 0 };
    await db.putState(state);
    return { unit, lesson, mastery, total: ids.length };
  });
  await page.goto(`/course?unit=${seed.unit}`);
  const unit = page.locator(`[data-path-unit="${seed.unit}"]`);
  await expect(unit.locator('[data-unit-progress]')).toContainText(`2 of ${seed.total}`);
  await expect(unit.locator(`li:has([data-activity-link="${seed.lesson}"]) .path-activity-status`)).toHaveText('Review due');
  await expect(unit.locator(`li:has([data-activity-link="${seed.mastery}"]) .path-activity-status`)).toHaveText('Mastered');
});

test('unit, module, and path progress expose zero, partial, and full real completion values', async ({ page }) => {
  await page.goto('/path');
  await expect(page.locator('[data-learning-path]')).toBeVisible();
  const shape = await page.evaluate(() => {
    const data = window.CANON_CATALOG, course = data.courses[0], unit = data.byCourse[course.id][0];
    return { unit, ids: data.byUnit[unit], module: data.byCourse[course.id].flatMap(id => data.byUnit[id]), path: data.courses.flatMap(c => data.byCourse[c.id].flatMap(id => data.byUnit[id])) };
  });
  for (const completed of [[], shape.ids.slice(0, 2), shape.path]) {
    await page.evaluate(async completed => { const db = await import('/db.js'), state = await db.getState(); state.completed = completed; await db.putState(state); }, completed);
    await page.goto(`/course?unit=${shape.unit}`);
    for (const [scope, ids] of [['unit',shape.ids], ['module',shape.module], ['path',shape.path]]) {
      const progress = page.locator(`[data-path-progress] [data-scope="${scope}"] progress`);
      const done = ids.filter(id => completed.includes(id)).length;
      await expect(progress).toBeVisible();
      await expect(progress).toHaveAttribute('value', String(done));
      await expect(progress).toHaveAttribute('max', String(ids.length));
      await expect(progress).toHaveAccessibleName(new RegExp(`${done} of ${ids.length}`));
      expect(await progress.evaluate(el => el.position)).toBeCloseTo(done / ids.length);
    }
  }
});
