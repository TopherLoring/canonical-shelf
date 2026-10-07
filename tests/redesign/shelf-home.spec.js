// Shelf home (S4). Decisions: the shelf is dark walnut with iron bookends; book width follows verse count; the Old Testament
// fills its shelf and the New Testament 80% of it; the nine decided group names; a selected-book panel; no decorations.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const GROUPS = ['Law', 'History', 'Wisdom and Poetry', 'Major Prophets', 'Minor Prophets', 'Gospels and Acts', /Paul['’]s Letters/, 'General Letters', 'Revelation'];
const home = page => page.locator('.shelf-home');
const widthOf = (page, n) => page.evaluate(n => document.querySelector(`[data-book-select="${n}"]`).getBoundingClientRect().width, n);

test.describe('Shelf home', () => {
  test('desktop: 66 books sized by length and coloured by group, New Testament at 80%, the nine group names, no policy errors', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    await expect(home(page)).toBeVisible();
    await expect(page.locator('.shelf-home h1')).toHaveText(/The Canonical\s*Shelf/);
    await expect(page.locator('[data-book-select]')).toHaveCount(66);

    const [psalms, genesis, obadiah] = [await widthOf(page, 19), await widthOf(page, 1), await widthOf(page, 31)];
    expect(psalms, 'Psalms (2,461 verses) is wider than Genesis').toBeGreaterThan(genesis);
    expect(genesis, 'Genesis is wider than Obadiah (21 verses)').toBeGreaterThan(obadiah * 3);
    const runs = await page.evaluate(() => [...document.querySelectorAll('.ui-bookshelf-book-run')].map(r => r.getBoundingClientRect().width));
    expect(runs[1] / runs[0], 'the New Testament fills 80% of its shelf').toBeGreaterThan(0.78);
    expect(runs[1] / runs[0]).toBeLessThan(0.82);

    expect(await page.evaluate(() => new Set([...document.querySelectorAll('[data-book-select]')].map(b => b.dataset.group)).size), 'books carry nine group colours').toBe(9);
    await expect(page.locator('.shelf-home__legend li')).toContainText(GROUPS);
    expect(errors.filter(e => /Content Security Policy/.test(e)), 'nothing relies on inline styles').toEqual([]);
  });

  test('selecting a book fills the panel (group, position, where to begin) and Open goes to its first chapter', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    await expect(page.locator('#shelf-selected-title')).toHaveText('Genesis');
    await page.locator('[data-book-select="43"]').click();
    await expect(page.locator('#shelf-selected-title')).toHaveText('John');
    await expect(page.locator('[data-book-select="43"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-book-select="1"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.shelf-book-panel')).toContainText('Gospels and Acts');
    await expect(page.locator('.shelf-book-panel')).toContainText('Book 43 of 66');
    await expect(page.locator('.shelf-home__announcement')).toHaveText(/Selected John, book 43 of 66/);
    await expect(page.locator('.shelf-book-panel__resume')).toHaveAttribute('href', '/bible?book=43&chapter=1');
    await page.locator('.shelf-book-panel__resume').click();
    await expect(page.locator('[data-reader]')).toBeVisible();
  });

  test('Continue learning goes to the first lesson; a saved reading position selects its book and draws its progress', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('canonical-shelf-bible-state-v1', JSON.stringify({ lastBook: 43, lastChapter: 3 })));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    await expect(page.locator('#shelf-selected-title')).toHaveText('John');
    await expect(page.locator('.shelf-book-panel__resume')).toHaveText('Resume John 3');
    await expect(page.locator('.shelf-book-panel__reading')).toContainText('Last opened · chapter 3');
    const fill = await page.evaluate(() => {
      const span = document.querySelector('.shelf-book-panel__progress span'), track = span.parentElement;
      return span.getBoundingClientRect().width / track.getBoundingClientRect().width;
    });
    expect(fill, 'chapter 3 of 21 is about 14%').toBeGreaterThan(0.1);
    expect(fill).toBeLessThan(0.2);
    await expect(page.locator('.shelf-home-continue a')).toHaveAttribute('href', /lesson=begin/);
  });

  test('My Notes shows the newest note and opens it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    await expect(page.locator('[data-home-notes]')).toBeVisible();
    await page.evaluate(async () => {
      const db = await import('/db.js'); const state = await db.getState();
      state.notes = { 'scripture:John.3.4': { text: 'Born again, but how?', label: 'John 3:4', updatedAt: '2026-10-01T10:00:00Z' } };
      await db.putState(state);
    });
    await page.reload();
    await expect(page.locator('[data-home-notes]')).toContainText('Born again, but how?');
    await expect(page.locator('[data-home-notes] a')).toHaveAttribute('href', /\/bible\?/);
  });

  test('phone: the whole shelf fits without sideways scroll, with the panel below it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home');
    await expect(home(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const tops = await page.evaluate(() => ({ shelf: document.querySelector('.ui-bookshelf').getBoundingClientRect().top, panel: document.querySelector('.shelf-book-panel').getBoundingClientRect().top }));
    expect(tops.panel).toBeGreaterThan(tops.shelf);
    expect(await widthOf(page, 19), 'books keep their relative widths on a phone').toBeGreaterThan(await widthOf(page, 31));
  });
});
