import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Serve a real bundled font behind a gate, independently of the learner's selected theme.
const css = readFileSync(new URL('../../public/fonts/fonts.css', import.meta.url), 'utf8');
const face = [...css.matchAll(/@font-face\s*\{[^}]*\}/g)].map(match => match[0])
  .find(block => block.includes('font-style: normal') && block.includes('U+0000-00FF'));
const file = face.match(/url\(\/fonts\/([^)]+)\)/)[1];
const font = readFileSync(new URL(`../../public/fonts/${file}`, import.meta.url));

async function installFont(page) {
  await page.addInitScript(() => {
    document.fonts.add(new FontFace('Reader Test', 'url(/fonts/reader-test.woff2)', { display: 'swap' }));
  });
  await page.route('**/theme.css', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}\n:root { --font-reading: "Reader Test",serif !important; }` });
  });
}

async function holdFont(page) {
  await installFont(page);
  let started, release;
  const requested = new Promise(resolve => { started = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/fonts/reader-test.woff2', async route => {
    started();
    await gate;
    await route.fulfill({ body: font, contentType: 'font/woff2' });
  });
  return { requested, release };
}

test.use({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });

test('the reader waits for its font before mounting and revealing a distant verse', async ({ page }) => {
  const pending = await holdFont(page);
  try {
    await page.goto('/bible?book=19&chapter=119&start=105', { waitUntil: 'domcontentloaded' });
    await pending.requested;
    await expect(page.locator('main [data-reader]')).toHaveCount(0);
    pending.release();
    await expect(page.locator('#v105')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.fonts.check('400 16px "Reader Test"'))).toBe(true);
    await expect(page.locator('#v105')).toBeInViewport();
  } finally {
    pending.release();
  }
});

test('a reader waiting for its font cannot replace a newer profile destination', async ({ page }) => {
  const pending = await holdFont(page);
  try {
    await page.goto('/bible?book=19&chapter=119&start=105', { waitUntil: 'domcontentloaded' });
    await pending.requested;
    // The Bible is a focus screen on the phone (no bottom bar), so follow an in-app link to the profile.
    await page.evaluate(() => { const a = document.createElement('a'); a.href = '/profile'; document.body.append(a); a.click(); a.remove(); });
    await expect(page.locator('#notes.profile-screen__section')).toBeVisible();
    pending.release();
    await page.evaluate(() => document.fonts.load('400 16px "Reader Test"'));
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await expect(page.locator('#notes.profile-screen__section')).toBeVisible();
    await expect(page.locator('main [data-reader]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/profile$/);
  } finally {
    pending.release();
  }
});

test('an unavailable reading font still permits the chapter to open', async ({ page }) => {
  await installFont(page);
  await page.route('**/fonts/reader-test.woff2', route => route.abort());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/bible?book=43&chapter=3');
  await expect(page.locator('#v16')).toContainText('God so loved the world');
  expect(errors).toEqual([]);
});
