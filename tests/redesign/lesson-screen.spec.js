// Lesson screen (S3.H): renders the build-time steps in a fixed-shape step body.
// Decisions: ui.lesson.card.orientation / portrait-4x5 / landscape-2x1 / type-16px, ui.lesson.progress.no-step-label,
// ui.lesson.reading.inline-or-popover.
import { test, expect } from '@playwright/test';

const lesson = (step = 1) => `/course?unit=c1.christianity&lesson=begin&step=${step}`;

test.describe('Lesson screen', () => {
  test('portrait: the step body is a 4:5 box at about 16px, with no sideways scroll', { tag: '@smoke' }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lesson(2));
    const body = page.locator('.lesson-body');
    await expect(body).toBeVisible();
    const m = await page.evaluate(() => {
      const b = document.querySelector('.lesson-body');
      return { w: b.clientWidth, h: b.clientHeight, font: parseFloat(getComputedStyle(document.querySelector('.lesson-body-text')).fontSize), scroll: document.documentElement.scrollWidth };
    });
    expect(Math.abs(m.w / m.h - 0.8)).toBeLessThan(0.02);
    expect(m.font).toBeGreaterThanOrEqual(16);
    expect(m.font).toBeLessThan(17);
    expect(m.scroll).toBeLessThanOrEqual(390);
  });

  test('landscape: the step body is a 2:1 box beside the sections and My Notes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(lesson(2));
    await expect(page.locator('.lesson-rail')).toBeVisible();
    await expect(page.locator('.lesson-side')).toBeVisible();
    const m = await page.evaluate(() => { const b = document.querySelector('.lesson-body'); return { w: b.clientWidth, h: b.clientHeight }; });
    expect(Math.abs(m.w / m.h - 2)).toBeLessThan(0.03);
    await expect(page.locator('.lesson-side [data-note-text]')).toHaveCount(1);
  });

  test('progress reads "n of m", never "Step n of m", and Continue moves one step', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lesson(1));
    const count = page.locator('[data-lesson-count]');
    await expect(count).toHaveText(/^1 of \d+$/);
    await expect(page.locator('.lesson-screen')).not.toContainText(/Step \d+ of \d+/);
    await page.locator('.lesson-continue').click();
    await expect(page).toHaveURL(/step=2/);
    await expect(count).toHaveText(/^2 of \d+$/);
  });

  test('a long reading opens in a popover that scrolls and closes with Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lesson(3));
    const link = page.locator('[data-reading-open]').first();
    await expect(link).toBeVisible();
    await link.click();
    const dialog = page.locator('.lesson-reading-dialog[open]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.lesson-reading-context')).toHaveAttribute('href', /\/bible\?q=/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.lesson-reading-dialog[open]')).toHaveCount(0);
  });

  test('the notes editor has no in-person flag and no Ask link', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(lesson(2));
    await expect(page.locator('.lesson-side [data-note-text]')).toHaveCount(1);
    await expect(page.locator('[data-note-discuss]')).toHaveCount(0);
    await expect(page.locator('.lesson-screen')).not.toContainText('Ask the Theologian about this');
  });
});
