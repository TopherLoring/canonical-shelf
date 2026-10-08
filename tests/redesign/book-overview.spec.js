// Book overview and Timeline (S8): one screen in the Topics layout; the old Bible library redirects.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const screen = page => page.locator('[data-book-screen]');

test.describe('Book overview and Timeline', () => {
  test('desktop: a book overview has the list, facts, a Read first panel and chapter links; no CSP errors', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/bible?book=43&profile=1');
    await expect(screen(page)).toBeVisible();
    await expect(page.locator('#book-overview-title')).toHaveText('John');
    await expect(page.locator('.book-nav a[aria-current="page"]')).toHaveText(/John/);
    await expect(page.locator('.book-facts')).toContainText('Written by');
    await expect(page.locator('.book-context')).toContainText('Read first');
    await expect(page.locator('.book-chapters a')).toHaveCount(21);
    await page.locator('.book-chapters a').nth(2).click();
    await expect(page).toHaveURL(/\/bible\?book=43&chapter=3/);
    expect(errors).toEqual([]);
  });

  test('the progress bar fills without inline styles, and the previous and next books link', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/bible?book=1&profile=1');
    const width = await page.locator('.book-length .ui-progress-bar-fill').evaluate(el => parseFloat(el.style.width));
    expect(width).toBeGreaterThan(0);
    await expect(page.locator('.book-stepper a')).toHaveCount(1);
    await page.locator('.book-stepper a').click();
    await expect(page.locator('#book-overview-title')).toHaveText('Exodus');
    await expect(page.locator('.book-stepper a')).toHaveCount(2);
  });

  test('the Timeline lists eras and anchors, and a book in it opens its overview', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/bible?view=timeline');
    await expect(page.locator('#book-overview-title')).toHaveText('Timeline');
    await expect(page.locator('.book-nav a[aria-current="page"]')).toHaveText('Timeline');
    expect(await page.locator('.timeline-era').count()).toBeGreaterThan(5);
    await expect(page.locator('.timeline-anchors li').first()).toBeVisible();
    await page.locator('.timeline-books a').first().click();
    await expect(page).toHaveURL(/profile=1/);
    await expect(page.locator('.book-facts')).toBeVisible();
  });

  test('the old library addresses redirect: Shelf views to Home, bare /bible to where you were reading', async ({ page }) => {
    await page.goto('/bible?view=shelf');
    await expect(page).toHaveURL(/\/home$/);
    await page.goto('/bible?view=books');
    await expect(page).toHaveURL(/\/home$/);
    await page.addInitScript(() => localStorage.setItem('canonical-shelf-bible-state-v1', JSON.stringify({ lastBook: 43, lastChapter: 3 })));
    await page.goto('/bible');
    await expect(page).toHaveURL(/\/bible\?book=43&chapter=3/);
    await expect(page.locator('[data-reader]')).toBeVisible();
  });

  test('a bare /bible with nothing saved opens Genesis 1, and /bible?book=N opens that book', async ({ page }) => {
    await page.goto('/bible');
    await expect(page).toHaveURL(/\/bible\?book=1&chapter=1/);
    await page.goto('/bible?book=19');
    await expect(page).toHaveURL(/\/bible\?book=19&chapter=1/);
  });

  test('the redirect does not trap the Back button', async ({ page }) => {
    await page.goto('/home');
    await page.goto('/bible');
    await expect(page).toHaveURL(/\/bible\?book=1&chapter=1/);
    await page.goBack();
    await expect(page).toHaveURL(/\/home$/);
  });

  test('the Shelf book panel links to the overview', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    await page.locator('.shelf-book-panel__overview').click();
    await expect(page.locator('[data-book-screen]')).toBeVisible();
    await expect(page.locator('.book-context')).toContainText('Read first');
  });

  test('phone: the book name is the selector, Read first sits under it, and Chapters is collapsible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/bible?book=43&profile=1');
    const wrap = page.locator('[data-book-nav-wrap]');
    await expect(page.locator('#book-overview-title')).toBeVisible();
    // The name appears once: no separate "choose a book" bar above it.
    await expect(page.locator('main :text-is("John"):visible')).toHaveCount(1);
    await expect(wrap).toBeHidden();
    // Read first is directly under the name, before the facts.
    const top = sel => page.locator(sel).first().evaluate(el => el.getBoundingClientRect().top);
    expect(await top('.book-context')).toBeLessThan(await top('.book-facts'));
    expect(await top('#book-overview-title')).toBeLessThan(await top('.book-context'));
    // Chapters is a collapsed drop-down.
    await expect(page.locator('.book-chapters')).toBeHidden();
    await page.locator('[data-book-chapters-toggle]').click();
    await expect(page.locator('.book-chapters a')).toHaveCount(21);
    // Tapping the name opens the book list.
    await page.locator('[data-book-nav-toggle]').click();
    await expect(wrap.locator('.book-nav')).toBeVisible();
    await wrap.locator('a', { hasText: 'Romans' }).click();
    await expect(page.locator('#book-overview-title')).toHaveText('Romans');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('desktop: no selector button or collapsed chapters; everything is open', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/bible?book=43&profile=1');
    await expect(page.locator('[data-book-nav-toggle]')).toBeHidden();
    await expect(page.locator('[data-book-chapters-toggle]')).toBeHidden();
    await expect(page.locator('.book-chapters a').first()).toBeVisible();
    await expect(page.locator('.book-nav')).toBeVisible();
  });

  test('a book is reachable by keyboard from the list', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/bible?view=timeline');
    await page.locator('.book-nav a', { hasText: 'Romans' }).first().focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#book-overview-title')).toHaveText('Romans');
  });
});
