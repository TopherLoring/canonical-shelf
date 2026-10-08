// Lesson screen (Step 3 of the redesign): the build-time steps flow in the template's window frame.
// Decisions: ui.lesson.card.orientation / type-16px, ui.lesson.reading.inline-or-popover; the 2:1 and 4:5 boxes and the
// "no Step n of m" rule are superseded (Chris 2026-10-08): the phone title bar reads "Step n of m" with a dot chain.
import { test, expect } from '@playwright/test';
import { overflowOf } from './lesson-helpers.js';

const lesson = (step = 1) => `/course?unit=c1.christianity&lesson=begin&step=${step}`;

test.describe('Lesson screen', () => {
  test('portrait: the step flows in the window at about 16px, with a title bar, no bottom bar and no sideways scroll', { tag: '@smoke' }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lesson(2));
    await expect(page.locator('.lesson-body')).toBeVisible();
    const m = await page.evaluate(() => {
      const area = document.querySelector('.cs-lesson__scroll').getBoundingClientRect();
      return { w: area.width, h: area.height, font: parseFloat(getComputedStyle(document.querySelector('.lesson-body-text')).fontSize), scroll: document.documentElement.scrollWidth };
    });
    expect(m.h, 'the article fills the window instead of a fixed 4:5 box').toBeGreaterThan(m.w * 1.05);
    expect(m.font).toBeGreaterThanOrEqual(16);
    expect(m.font).toBeLessThan(17);
    expect(m.scroll).toBeLessThanOrEqual(390);
    await expect(page.locator('.cs-tabbar'), 'a focus screen has no bottom bar').toBeHidden();
    await expect(page.locator('.cs-top')).toBeHidden();
    await expect(page.locator('[data-lesson-count-phone]')).toHaveText(/^Step 2 of \d+$/);
    await expect(page.locator('.lesson-titlebar .cs-dots span.is-current')).toHaveCount(1);
    await expect(page.locator('.lesson-close')).toBeVisible();
    await expect(page.locator('.lesson-rail')).toBeHidden();
  });

  test('landscape: the window frame has the title bar, steps rail, a centered lesson card, and My Notes and Glossary cards', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(lesson(2));
    await expect(page.locator('.cs-top'), 'the top bar stays on a wide screen').toBeVisible();
    await expect(page.locator('.lesson-crumbs')).toContainText('Learning Path');
    await expect(page.locator('.lesson-rail')).toBeVisible();
    await expect(page.locator('.lesson-side')).toBeVisible();
    await expect(page.locator('.lesson-rail .is-current a[aria-current="step"]')).toHaveCount(1);
    await expect(page.locator('.lesson-rail [data-lesson-tool="glossary"]')).toBeVisible();
    await expect(page.locator('.lesson-all-steps'), 'the phone title-bar toggle is hidden').toBeHidden();
    const m = await page.evaluate(() => { const b = document.querySelector('.lesson-body').getBoundingClientRect(); return { w: b.width }; });
    expect(m.w, 'the lesson column is at most 600 board units wide').toBeLessThanOrEqual(601);
    await expect(page.locator('.lesson-side [data-note-text]')).toHaveCount(1);
    await page.locator('[data-collapse="lesson-notes"]').click();
    await expect(page.locator('.lesson-side [data-note-text]')).toBeHidden();
    await page.locator('[data-collapse="lesson-notes"]').click();
    await expect(page.locator('.lesson-side [data-note-text]')).toBeVisible();
  });

  test('the phone title bar reads "Step n of m" and Continue moves one step; the wide rail reads "n of m"', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lesson(1));
    const count = page.locator('[data-lesson-count-phone]');
    await expect(count).toHaveText(/^Step 1 of \d+$/);
    await page.locator('.lesson-continue').click();
    await expect(page).toHaveURL(/step=2/);
    await expect(count).toHaveText(/^Step 2 of \d+$/);
    await expect(page.locator('[data-lesson-count]')).toHaveText(/^2 of \d+$/);
  });

  test('phone: the title bar opens all steps and the full path; My Notes opens from its edge tab', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lesson(2));
    await page.locator('.lesson-all-steps').click();
    const sheet = page.locator('#lesson-steps-sheet[open]');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('.lesson-sheet-path')).toContainText('Learning Path');
    await expect(sheet.locator('.lesson-sections li')).not.toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.locator('.lesson-notes-tab').click();
    await expect(page.locator('#lesson-notes-sheet[open] [data-note-text]')).toBeVisible();
  });

  for (const [name, width, height] of [['desktop', 1440, 900], ['phone', 390, 844]]) {
    test(`${name}: no step of Lesson 1 scrolls sideways, in the page or in the lesson card`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height });
      await page.goto(lesson(1));
      const total = Number((await page.locator('[data-lesson-count]').textContent()).split(' of ')[1]);
      for (let i = 0; i < total; i += 1) {
        const wide = await page.evaluate(() => {
          const area = [...document.querySelectorAll('.cs-lesson__scroll, .cs-lesson-card')].find(el => /auto|scroll/.test(getComputedStyle(el).overflowY) && el.offsetParent !== null);
          return { page: document.documentElement.scrollWidth - window.innerWidth, area: area ? area.scrollWidth - area.clientWidth : 0 };
        });
        expect(wide.page, `page, step ${i + 1}`).toBeLessThanOrEqual(0);
        expect(wide.area, `card, step ${i + 1}`).toBeLessThanOrEqual(1);
        if (i < total - 1) await page.locator('.lesson-continue').click();
      }
    });
  }

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
    await expect(page.locator('[data-lesson-count]')).toHaveText('1 of 2');
    await expect(page.locator('.lesson-body-text')).toContainText('This Checkpoint combines');
    const chrome = (await page.locator('.lesson-titlebar, .lesson-rail, .cs-lesson__head').allInnerTexts()).join(' ');
    expect(chrome, 'headings, crumbs and rail never say Mastery').not.toMatch(/mastery/i);
    await page.goto(`/course?unit=${UNIT}&mastery=${CHECK}&step=2`);
    await expect(page.locator('.lesson-body-text .inline-check')).toHaveCount(1);
    for (const size of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(size);
      expect(await overflowOf(page), `the check needs no scrolling at ${size.width}x${size.height}`).toBeLessThanOrEqual(1);
      const submitInView = await page.evaluate(() => document.querySelector('.inline-check button[type=submit], .inline-check button:not([type])').getBoundingClientRect().bottom <= window.innerHeight);
      expect(submitInView, `the check's button is on screen at ${size.width}x${size.height}`).toBe(true);
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
      expect(await overflowOf(page)).toBeLessThanOrEqual(1);
    }
  });
});
