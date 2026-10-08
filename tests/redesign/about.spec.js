import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';

// These hashes capture the published policy text before the move. A missing or
// rewritten paragraph must fail even if the new screen still looks complete.
const policies = [
  ['privacy', 'Privacy', 'Privacy Policy', 'cbc39d9a4601c874b3c711608e10f67ed46ace5d7391436988eb97dcec6e52fb'],
  ['terms', 'Terms', 'Terms of Use', '24ba8398d4c068a4830cb057cad46b7e17d358c3ba78806496afa1500138dd85'],
  ['storage', 'Storage', 'Cookies & Local Storage', '2564c0b7a075016fc9bb4b5873ce9eb776fe541a43b4dc1690534cca95b6a39f'],
  ['data-retention', 'Data retention', 'Data Retention Policy', 'f24c452354f7a79b1363da23224b5699ec0fe5285721ceb199e2dff2b5adccbc']
];
const list = page => page.getByRole('navigation', { name: 'About and policies' });
const content = page => page.getByRole('article', { name: 'Selected information' });

test.describe('About and policies', () => {
  test.use({ serviceWorkers: 'block' });

  test('defaults to About and replaces the right pane without replacing the document', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about$/);
    await expect(content(page).getByRole('heading', { level: 1 })).toContainText('How Canonical Shelf works');
    await expect(list(page).getByRole('link')).toHaveText(['About', 'Privacy', 'Terms', 'Storage', 'Data retention']);
    await expect(list(page).getByRole('link', { name: 'About', exact: true })).toHaveAttribute('aria-current', 'page');
    const navigationBox = await list(page).boundingBox();
    const readingBox = await content(page).boundingBox();
    expect(navigationBox.x + navigationBox.width).toBeLessThanOrEqual(readingBox.x);
    await expect(content(page).locator('#statement-content')).toContainText('Statement of Faith');
    await expect(content(page).locator('#help')).toContainText('988');
    await expect(content(page).locator('#help')).toContainText('911');
    await page.evaluate(() => { window.aboutDocument = document; });
    await list(page).getByRole('link', { name: 'Privacy', exact: true }).click();
    await expect(content(page).getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
    await expect(content(page).locator('#statement-content')).toHaveCount(0);
    expect(await page.evaluate(() => window.aboutDocument === document)).toBe(true);
    await page.goBack();
    await expect(content(page).getByRole('heading', { level: 1 })).toContainText('How Canonical Shelf works');
    await page.goForward();
    await expect(content(page).getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
  });

  for (const [id, label, title, hash] of policies) {
    test(`${label} preserves every published paragraph and survives a reload`, async ({ page }) => {
      await page.goto(`/about?section=${id}`);
      await expect(content(page).getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(list(page).getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
      const text = await content(page).evaluate(el => el.textContent.replace(/\s+/g, ' ').trim());
      expect(createHash('sha256').update(text).digest('hex')).toBe(hash);
      await page.reload();
      await expect(content(page).getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(page).toHaveURL(new RegExp(`/about\\?section=${id}$`));
    });
  }

  test('old document addresses redirect to the corresponding screen and retain About anchors', async ({ page }) => {
    for (const [id, , title] of policies) {
      await page.goto(`/${id}.html`);
      await expect(page).toHaveURL(new RegExp(`/about\\?section=${id}$`));
      await expect(content(page).getByRole('heading', { level: 1 })).toHaveText(title);
    }
    await page.goto('/about.html#faith');
    await expect(page).toHaveURL(/\/about#faith$/);
    await expect(content(page).locator('#faith')).toBeInViewport();
    await expect(content(page).locator('#statement-content')).toContainText('Statement of Faith');
  });

  test('existing policy links stay in the SPA and invalid selections fall back to About', async ({ page }) => {
    await page.goto('/about?section=unknown');
    await expect(content(page).getByRole('heading', { level: 1 })).toContainText('How Canonical Shelf works');
    await page.evaluate(() => { window.aboutDocument = document; });
    await content(page).getByRole('link', { name: 'Privacy Policy', exact: true }).click();
    await expect(content(page).getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
    expect(await page.evaluate(() => window.aboutDocument === document)).toBe(true);
  });

  test('keyboard selection and phone reflow keep the navigation and policy text accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/about');
    const storage = list(page).getByRole('link', { name: 'Storage', exact: true });
    await storage.focus();
    await page.keyboard.press('Enter');
    await expect(content(page).getByRole('heading', { level: 1 })).toHaveText('Cookies & Local Storage');
    await page.setViewportSize({ width: 320, height: 700 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const results = await new AxeBuilder({ page }).include('#main').analyze();
    expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  });
});

test.describe('About offline access', () => {
  test('cached policies and old addresses use the SPA while offline', async ({ page, context }) => {
    await page.goto('/about?section=terms');
    await expect(content(page).getByRole('heading', { level: 1 })).toHaveText('Terms of Use');
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await expect.poll(() => page.evaluate(async () => Boolean(await caches.match('/data/catalog.json')))).toBe(true);
    await context.setOffline(true);
    await page.goto('/privacy.html');
    await expect(page).toHaveURL(/\/about\?section=privacy$/);
    await expect(content(page).getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
    await page.reload();
    await expect(content(page).getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
  });
});

test.describe('Policy access without JavaScript', () => {
  test.use({ javaScriptEnabled: false, serviceWorkers: 'block' });
  test('the legacy address still provides the complete policy', async ({ page }) => {
    await page.goto('/privacy.html');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
    const text = await page.locator('#main').textContent();
    expect(createHash('sha256').update(text.replace(/\s+/g, ' ').trim()).digest('hex')).toBe(policies[0][3]);
  });
});
