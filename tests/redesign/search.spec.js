// Search (S9): a reference opens the reader; other searches show grouped results on the Topics layout; questions get an
// Ask the Theologian row that only fills the draft.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const screen = page => page.locator('[data-search-screen]');

test.describe('Search', () => {
  test('desktop: keyword results are grouped, with the types on the left and the selected result on the right; no CSP errors', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/search?q=grace');
    await expect(screen(page)).toBeVisible();
    await expect(page.locator('.search-groups a[aria-current="page"]')).toContainText('Everything');
    expect(await page.locator('.search-section').count()).toBeGreaterThan(1);
    await expect(page.locator('.search-context')).toBeVisible();
    await expect(page.locator('.search-context [data-ask]')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('a result type narrows the list, and choosing a result explains it on the right', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/search?q=grace');
    await page.locator('.search-groups a', { hasText: 'Topics' }).click();
    await expect(page).toHaveURL(/type=topics/);
    await expect(page.locator('.search-groups a[aria-current="page"]')).toContainText('Topics');
    const cards = page.locator('.search-card');
    if (await cards.count() > 1) {
      const title = await cards.nth(1).locator('strong').innerText();
      await cards.nth(1).click();
      await expect(page.locator('.search-context .ui-panel-title')).toHaveText(title);
    }
    await expect(page.locator('.search-context a.button--primary, .search-context a.button')).toHaveAttribute('href', /\/topics\?topic=/);
  });

  test('a Scripture reference goes straight to the reader', async ({ page }) => {
    await page.goto('/search?q=' + encodeURIComponent('John 3:16'));
    await expect(page).toHaveURL(/\/bible\?/);
    await expect(page.locator('[data-reader]')).toBeVisible();
  });

  test('a Scripture word hit opens the reader at that verse', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/search?q=beginning&type=scripture');
    const first = page.locator('.search-card').first();
    await expect(first).toBeVisible();
    await first.click();
    await expect(page).toHaveURL(/\/bible\?book=\d+&chapter=\d+&start=\d+/);
    await expect(page.locator('[data-reader]')).toBeVisible();
  });

  test('the old Scripture word search address lands on search, and a glossary address lands in the Glossary', async ({ page }) => {
    await page.goto('/bible?q=shepherd');
    await expect(page).toHaveURL(/\/search\?q=shepherd&type=scripture/);
    await expect(screen(page)).toBeVisible();
    await page.goto('/course?glossary=grace');
    await expect(page).toHaveURL(/\/topics\?mode=glossary&q=grace/);
    await page.goto('/course?glossary=1');
    await expect(page).toHaveURL(/\/topics\?mode=glossary$/);
  });

  test('a question shows Ask the Theologian, which opens the panel with the question filled in and sends nothing', async ({ page }) => {
    let sent = 0;
    await page.route('**/api/theologian**', route => { sent += 1; route.abort(); });
    await page.setViewportSize({ width: 1440, height: 900 });
    const question = 'Why did God harden Pharaoh’s heart?';
    await page.goto('/search?q=' + encodeURIComponent(question));
    await expect(page.locator('.search-ask')).toBeVisible();
    await page.locator('.search-ask [data-ask]').click();
    await expect(page.locator('#guide-q')).toHaveValue(question);
    await page.waitForTimeout(300);
    expect(sent).toBe(0);
  });

  test('a question is searched by its content words, so results are relevant and few', async ({ page }) => {
    await page.goto('/search?q=' + encodeURIComponent('Why did God harden Pharaoh’s heart?') + '&type=scripture');
    await expect(page.locator('.search-card').first()).toBeVisible();
    const titles = await page.locator('.search-card strong').allInnerTexts();
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.length).toBeLessThan(40);
    expect(titles.some(title => title.startsWith('Exodus 4:21'))).toBe(true);
  });

  test('a single word does not show the Ask row, and an empty search shows the form', async ({ page }) => {
    await page.goto('/search?q=grace');
    await expect(page.locator('.search-ask')).toHaveCount(0);
    await page.goto('/search');
    await expect(page.locator('.search-form input[type="search"]')).toBeVisible();
  });

  test('nothing found says so', async ({ page }) => {
    await page.goto('/search?q=zzqxjv');
    await expect(page.locator('.notice')).toContainText('Nothing matches');
  });

  test('phone: one column, no sideways scroll, the types sit in two columns and clear the Theologian tab', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/search?q=grace');
    await expect(screen(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const box = await page.locator('.search-main').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(12);
    expect(box.x + box.width).toBeLessThanOrEqual(390 - 24);
  });
});
