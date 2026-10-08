// Lesson screen (S3.H): renders the build-time steps in a fixed-shape step body.
// Decisions: ui.lesson.card.orientation / portrait-4x5 / landscape-2x1 / type-16px, ui.lesson.progress.no-step-label,
// ui.lesson.reading.inline-or-popover.
import { test, expect } from '@playwright/test';

const lesson = (step = 1) => `/course?unit=c1.christianity&lesson=begin&step=${step}`;

test.describe('Lesson screen', () => {
  test('portrait: the step body fills the window (no fixed box) at about 16px, with no sideways scroll', { tag: '@smoke' }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lesson(2));
    const body = page.locator('.lesson-body');
    await expect(body).toBeVisible();
    const m = await page.evaluate(() => {
      const b = document.querySelector('.lesson-body');
      return { w: b.clientWidth, h: b.clientHeight, font: parseFloat(getComputedStyle(document.querySelector('.lesson-body-text')).fontSize), scroll: document.documentElement.scrollWidth };
    });
    expect(m.h, 'the body fills the window instead of a fixed 4:5 box').toBeGreaterThan(m.w * 1.05);
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
    await page.goto(lesson(8));
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

test.describe('Checkpoints on the lesson screen', () => {
  const UNIT = 'c1.christianity';
  const CHECK = 'unit-c1-christianity-mastery';

  test('a Checkpoint opens in the lesson frame as "Checkpoint · <unit title>", with no Mastery wording and no scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/course?unit=${UNIT}&mastery=${CHECK}`);
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
    await expect(page.locator('#lesson-step-title')).toHaveText('Checkpoint · Christianity in One View');
    await expect(page.locator('.lesson-progress-count')).toHaveText('1 of 2');
    await expect(page.locator('.lesson-body-text')).toContainText('This Checkpoint combines');
    const chrome = (await page.locator('.lesson-titlebar, .lesson-rail, .lesson-step-head').allInnerTexts()).join(' ');
    expect(chrome, 'headings, crumbs and rail never say Mastery').not.toMatch(/mastery/i);
    await page.goto(`/course?unit=${UNIT}&mastery=${CHECK}&step=2`);
    await expect(page.locator('.lesson-body-text .inline-check')).toHaveCount(1);
    for (const size of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(size);
      const fits = await page.evaluate(() => {
        const body = document.querySelector('.lesson-body'); const b = body.getBoundingClientRect();
        const submit = document.querySelector('.inline-check button[type=submit], .inline-check button:not([type])');
        const last = document.querySelector('.inline-check label:last-of-type, .inline-check .choice:last-child') || submit;
        const sb = submit.getBoundingClientRect(), lb = last.getBoundingClientRect();
        return { noScroll: body.scrollHeight <= body.clientHeight + 1, submitInside: sb.bottom <= b.bottom + 1 && sb.top >= b.top, lastInside: lb.bottom <= b.bottom + 1 };
      });
      expect(fits, `the check fits its card at ${size.width}x${size.height}`).toEqual({ noScroll: true, submitInside: true, lastInside: true });
    }
  });

  test('a Capstone is named "Capstone · <title>" and the older practice keeps its own title', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course?unit=c1.synthesis&mastery=course-1-capstone');
    await expect(page.locator('#lesson-step-title')).toHaveText(/^Capstone · /);
    await page.goto(`/course?unit=${UNIT}&mastery=n.what`);
    await expect(page.locator('#lesson-step-title')).toHaveText('Know what a book is doing before you quote it');
  });

  test('answering the Checkpoint shows the result, and the close link returns to the unit', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/course?unit=${UNIT}&mastery=${CHECK}&step=2`);
    const form = page.locator('.inline-check form').first();
    await expect(form).toBeVisible();
    await form.locator('label').first().click();
    await form.locator('button[type=submit], button:not([type])').first().click();
    await expect(page.locator('.inline-check')).toContainText(/correct|not quite|try|why/i);
    await page.locator('.lesson-close').click();
    await expect(page).toHaveURL(new RegExp(`unit=${UNIT.replace('.', '\\.')}`));
  });

  test('phone: a Checkpoint has no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/course?unit=${UNIT}&mastery=${CHECK}`);
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
  test('a multi-question check shows one question at a time and never scrolls inside the card', async ({ page }) => {
    for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 720 }]) {
      await page.setViewportSize(size);
      await page.goto('/course?unit=c3.jewish-life&mastery=unit-c3-jewish-life-mastery&step=2');
      const form = page.locator('.inline-check form').first();
      await expect(form.locator('fieldset:visible')).toHaveCount(1);
      await expect(form.locator('[data-pager-count]')).toHaveText('Question 1 of 5');
      await expect(form.locator('[data-pager="next"]')).toBeDisabled();
      await expect(form.locator('button[type=submit]')).toBeHidden();
      await form.locator('fieldset:visible label').first().click();
      await form.locator('[data-pager="next"]').click();
      await expect(form.locator('[data-pager-count]')).toHaveText('Question 2 of 5');
      const over = await page.evaluate(() => { const b = document.querySelector('.lesson-body'); return b.scrollHeight - b.clientHeight; });
      expect(over).toBeLessThanOrEqual(1);
    }
  });
});
