// Orientation (S11): the lesson screen, in the names the site uses now; not scored.
import { test, expect } from '@playwright/test';
import { overflowOf } from './lesson-helpers.js';

test.use({ serviceWorkers: 'block' });

const ORIENTATION = '/course?unit=unit.orientation&lesson=orientation';

test.describe('Orientation', () => {
  test('desktop: it is a lesson on the lesson screen, step by step, ending at the Learning Path', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ORIENTATION);
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
    await expect(page.locator('#lesson-step-title')).toHaveText('Five places and a guide');
    await expect(page.locator('.lesson-crumbs')).toContainText('Orientation');
    await page.locator('.lesson-continue').click();
    await expect(page.locator('.lesson-body')).toContainText('Learning Path');
    await expect(page.locator('.lesson-body')).toContainText('Study Topics');
    await page.locator('.lesson-back').click();
    const total = Number((await page.locator('[data-lesson-count]').innerText()).split(' of ')[1]);
    expect(total).toBeGreaterThan(6);
    for (let i = 1; i < total; i += 1) await page.locator('.lesson-continue').click();
    await expect(page.locator('.lesson-continue')).toHaveAttribute('href', /unit=c1\.christianity&lesson=begin/);
    await expect(page.locator('.scene-action.is-primary')).toHaveText('Begin the Learning Path');
    expect(errors).toEqual([]);
  });

  test('the old names are gone from the Orientation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ORIENTATION);
    const text = [];
    const total = Number((await page.locator('[data-lesson-count]').innerText()).split(' of ')[1]);
    for (let i = 0; i < total; i += 1) {
      text.push(await page.locator('.lesson-body').innerText());
      if (i < total - 1) await page.locator('.lesson-continue').click();
    }
    const all = text.join(' ');
    for (const old of ['Pathway', 'Catalog', 'study desk', 'Where to begin', 'mastery activity']) expect(all).not.toContain(old);
  });

  test('names of site elements are set heavier, and desktop and phone differences are described', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ORIENTATION + '&step=3');
    const weight = await page.locator('.lesson-body .site-label').first().evaluate(el => Number(getComputedStyle(el).fontWeight));
    expect(weight).toBeGreaterThanOrEqual(700);
    await expect(page.locator('.scene-platform')).toContainText('Desktop');
    await expect(page.locator('.scene-platform')).toContainText('Phone');
    await page.goto(ORIENTATION + '&step=1');
    await expect(page.locator('.scene-note')).toContainText('designed for landscape');
    await expect(page.locator('.lesson-body svg')).toHaveCount(0);
  });

  for (const [name, width, height] of [['landscape', 1280, 720], ['phone', 390, 844], ['small phone', 360, 640]]) {
    test(`every step fits its card without scrolling (${name})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(ORIENTATION);
      const total = Number((await page.locator('[data-lesson-count]').innerText()).split(' of ')[1]);
      expect(total).toBe(17);
      for (let i = 0; i < total; i += 1) {
        const over = await overflowOf(page);
        expect(over, `step ${i + 1}`).toBeLessThanOrEqual(1);
        if (i < total - 1) await page.locator('.lesson-continue').click();
      }
    });
  }

  test('the unit address opens the lesson, and the Learning Path page links to it once the card is gone', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('canonical-shelf-orientation-seen', '1'));
    await page.goto('/course?unit=unit.orientation');
    await expect(page).toHaveURL(/lesson=orientation/);
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
    await page.goto('/course');
    await expect(page.locator('[data-path-orientation]')).toHaveCount(0);
    await page.locator('.path-orientation').click();
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
  });

  test('phone: a step fits without sideways scroll and the list step stays inside the card', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(ORIENTATION + '&step=2');
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await overflowOf(page)).toBeLessThanOrEqual(1);
  });

  test('the Learning Path offers the Orientation to someone new, above Up next, and stops once it is skipped', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/course');
    const card = page.locator('[data-path-orientation]:visible');
    await expect(card).toHaveCount(1);
    await expect(card.getByRole('link', { name: 'Begin' })).toHaveAttribute('href', /lesson=orientation/);
    const above = await page.evaluate(() => {
      const c = [...document.querySelectorAll('[data-path-orientation]')].find(el => el.offsetParent)?.getBoundingClientRect();
      return c.bottom <= document.querySelector('[data-path-up-next]').getBoundingClientRect().top + 1;
    });
    expect(above, 'the card sits above Up next').toBe(true);
    await card.getByRole('button', { name: 'Skip' }).click();
    await expect(page.locator('[data-path-orientation]')).toHaveCount(0);
    await expect(page.locator('.path-orientation')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-path-orientation]')).toHaveCount(0);
  });

  test('phone: the card sits above the module picker and Begin starts the Orientation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/course');
    const card = page.locator('[data-path-orientation]:visible');
    await expect(card).toHaveCount(1);
    const order = await page.evaluate(() => {
      const c = [...document.querySelectorAll('[data-path-orientation]')].find(el => el.offsetParent).getBoundingClientRect();
      return c.bottom <= document.querySelector('.cs-modpick').getBoundingClientRect().top + 1;
    });
    expect(order, 'the card sits above the module picker').toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await card.getByRole('link', { name: 'Begin' }).click();
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
  });

  test('the Shelf no longer carries an Orientation card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    await expect(page.locator('.shelf-home')).toBeVisible();
    await expect(page.locator('[data-orientation-first], [data-orientation-skip]')).toHaveCount(0);
  });

  test('someone with a saved reading place is not sent to the Orientation', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('canonical-shelf-bible-state-v1', JSON.stringify({ lastBook: 43, lastChapter: 3 })));
    await page.goto('/course');
    await expect(page.locator('.cs-upnext').first()).toBeVisible();
    await expect(page.locator('[data-path-orientation]')).toHaveCount(0);
  });

  test('finishing the Orientation ends the suggestion', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ORIENTATION);
    const total = Number((await page.locator('[data-lesson-count]').innerText()).split(' of ')[1]);
    await page.goto(ORIENTATION + `&step=${total}`);
    await expect(page.locator('[data-lesson-count]')).toContainText(`${total} of ${total}`);
    await page.goto('/course');
    await expect(page.locator('.cs-upnext').first()).toBeVisible();
    await expect(page.locator('[data-path-orientation]')).toHaveCount(0);
  });
});
