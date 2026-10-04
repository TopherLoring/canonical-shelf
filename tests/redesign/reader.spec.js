// Step 2 (phase 4): the Bible reader. Covers the reading apparatus (BSB headings and footnotes), selection,
// highlights, notes, study panels, keyboard use, addresses that stay on the current Bible page, and phone layout.
import { test, expect } from '@playwright/test';

test.describe('Bible reader', () => {
  test('shows BSB section headings and the chapter text', async ({ page }) => {
    await page.goto('/bible?book=43&chapter=3');
    const reader = page.locator('[data-reader]');
    await expect(reader.getByRole('heading', { level: 2 }).first()).toBeVisible();
    await expect(reader.locator('#v16')).toContainText('For God so loved the world');
    await expect(page.locator('.reader-title-heading')).toHaveText('John 3');
  });

  test('footnote badges open their note and are listed at the end of the chapter', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=23');
    const badge = page.locator('[data-footnote]').first();
    await badge.click();
    const pop = page.locator('[data-reader-fn-pop]');
    await expect(pop).toBeVisible();
    await expect(pop).toContainText('Revelation 7:17');
    await expect(badge).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.reader-footnote')).toHaveCount(3);
    await page.keyboard.press('Escape');
    await expect(pop).toBeHidden();
  });

  test('a footnote badge opens from the keyboard without selecting its verse', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=23');
    const badge = page.locator('[data-footnote]').first();
    await badge.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-reader-fn-pop]')).toBeVisible();
    await expect(badge).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-reader] [aria-pressed="true"]')).toHaveCount(0);
  });

  test('a single psalm is labelled "Psalm"', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=23');
    await expect(page.locator('.reader-title-heading')).toHaveText('Psalm 23');
  });

  test('Psalm acrostic headings display Hebrew characters', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=119');
    await expect(page.getByRole('heading', { name: 'נ', exact: true })).toBeAttached();
    await expect(page.locator('[data-reader-text]')).not.toContainText('&#1504;');
  });

  test('legacy lesson focus still fills the viewport after stylesheet layering', async ({ page }) => {
    await page.goto('/course?unit=c1.christianity&lesson=begin');
    await expect(page.locator('body')).toHaveClass(/study-focus-active/);
    const frame = await page.locator('#main').boundingBox();
    expect(frame.x).toBe(0);
    expect(frame.y).toBe(0);
    expect(frame.width).toBe(page.viewportSize().width);
    expect(frame.height).toBe(page.viewportSize().height);
  });

  test('highlights persist across reloads and can be removed', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await page.locator('#v2').click();
    await page.locator('[data-reader-actions] [data-color="green"]').click();
    await expect(page.locator('#v2')).toHaveClass(/ui-highlight-green/);
    await expect(page.locator('#reader-rail-highlights .ui-rail-count')).toHaveText('1');
    await page.reload();
    await expect(page.locator('#v2')).toHaveClass(/ui-highlight-green/);
    await page.locator('[data-highlight-clear]').click();
    await expect(page.locator('#v2')).not.toHaveClass(/ui-highlight-/);
    await page.reload();
    await expect(page.locator('#v2')).not.toHaveClass(/ui-highlight-/);
  });

  test('every verse in a highlighted range persists and can be cleared', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1&start=2&end=4');
    await page.locator('[data-reader-actions] [data-color="green"]').click();
    await expect.poll(() => page.evaluate(async () => {
      const { getState } = await import('/db.js');
      const state = await getState();
      return [2, 3, 4].map(n => state.highlights?.[`Gen.1.${n}`]?.color);
    })).toEqual(['green', 'green', 'green']);
    await page.reload();
    for (const n of [2, 3, 4]) await expect(page.locator(`#v${n}`)).toHaveClass(/ui-highlight-green/);
    await page.locator('[data-highlight-clear]').click();
    await expect.poll(() => page.evaluate(async () => {
      const { getState } = await import('/db.js');
      const state = await getState();
      return [2, 3, 4].map(n => state.highlights?.[`Gen.1.${n}`]?.color);
    })).toEqual([null, null, null]);
  });

  test('shared passage context preserves a selected range and reference-search address', async ({ page }) => {
    await page.goto('/bible?q=John%203%3A16-18');
    await expect(page.locator('#v18')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(async () => (await import('/screen-context.js')).currentPassage()?.osis)).toBe('John.3.16-18');
    await page.locator('#v16').click();
    await page.locator('#v18').click({ modifiers: ['Shift'] });
    expect(await page.evaluate(async () => (await import('/screen-context.js')).currentPassage()?.osis)).toBe('John.3.16-18');
  });

  test('verses can be selected from the keyboard', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await page.locator('#v3').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#v3')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-notes-title]')).toHaveText('My notes on 1:3');
    await page.keyboard.press('Escape');
    await expect(page.locator('#v3')).toHaveAttribute('aria-pressed', 'false');
  });

  test('study links switch the side panel without leaving the chapter', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await page.locator('#reader-rail-context').click();
    await expect(page.locator('[data-reader-panel] .reader-panel-eyebrow')).toHaveText('Context');
    await expect(page).toHaveURL(/panel=context/);
    await page.locator('#reader-rail-people').click();
    await expect(page.locator('[data-reader-panel]')).not.toBeEmpty();
  });

  test('chapter steps and the book picker move between chapters', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=50');
    await page.locator('.reader-steps a[aria-label^="Next chapter"]').click();
    await expect(page).toHaveURL(/book=2&chapter=1/);
    await expect(page.locator('.reader-title-heading')).toHaveText('Exodus 1');
    await page.locator('.reader-toolbar [data-reader-picker] summary').click();
    await page.locator('.reader-toolbar [data-reader-book]').selectOption('43');
    await page.locator('.reader-toolbar [data-reader-chapters] a', { hasText: /^3$/ }).click();
    await expect(page.locator('.reader-title-heading')).toHaveText('John 3');
  });

  test('a reference search opens the reader at that passage', async ({ page }) => {
    await page.goto('/bible?q=John%203%3A16');
    await expect(page.locator('[data-reader]')).toBeVisible();
    await expect(page.locator('#v16')).toHaveAttribute('aria-pressed', 'true');
  });

  test('other Bible pages stay on their current views', async ({ page }) => {
    await page.goto('/bible?view=timeline');
    await expect(page.locator('[data-reader]')).toHaveCount(0);
    await expect(page.locator('.bible-timeline')).toBeVisible();
    await page.goto('/bible?book=43&profile=1');
    await expect(page.locator('[data-reader]')).toHaveCount(0);
    await expect(page.locator('[data-book-drawer]')).toBeVisible();
  });
});

test.describe('Bible reader on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('adapts to different phone widths without horizontal scrolling', async ({ page }) => {
    for (const width of [320, 428]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/bible?book=1&chapter=1');
      await expect(page.locator('[data-reader]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const tools = page.locator('[data-phone-tool]');
      await expect(tools).toHaveCount(6);
      for (const tool of await tools.all()) await expect(tool).toBeInViewport();
    }
  });

  test('opening a distant verse keeps navigation visible and scrolls the chapter', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=119&start=105');
    await expect(page.locator('#v105')).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator('.reader-phone-tools')).toBeInViewport();
    await expect(page.locator('#v105')).toBeInViewport();
    expect(await page.locator('[data-reader-scroll]').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  });

  test('has no horizontal scroll and opens My Notes from its edge tab', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await expect(page.locator('[data-reader]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await expect(page.locator('.reader-rail-wrap')).toBeHidden();
    await expect(page.locator('.reader-phone-tools')).toBeVisible();
    await page.locator('#v2').click();
    const tab = page.locator('#reader-notes-tab');
    await tab.click();
    const sheet = page.locator('[data-reader-aside]');
    await expect(sheet).toHaveAttribute('data-sheet', 'notes');
    await expect(sheet.locator('[data-notes-title]')).toHaveText('My notes on 1:2');
    await expect(tab).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveAttribute('data-sheet', 'none');
    await expect(tab).toBeVisible();
  });

  test('the study icon row opens its panel as a sheet', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await page.locator('[data-phone-tool="themes"]').click();
    const sheet = page.locator('[data-reader-aside]');
    await expect(sheet).toHaveAttribute('data-sheet', 'study');
    await expect(sheet.locator('[data-reader-panel]')).not.toBeEmpty();
  });
});
