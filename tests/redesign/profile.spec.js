// Profile (Step 9): the Topics layout. A list of six sections beside a pane for the selected one; the section is in the address.
// Appearance controls, site text size, and the two font pickers work and persist; About, Terms and Statement of Faith links live here.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const SECTIONS = [['you', 'Account'], ['progress', 'Progress'], ['notes', 'My Notes'], ['appearance', 'Appearance'], ['reading', 'Reading'], ['privacy', 'Data & privacy']];
const pane = id => `[data-profile-section="${id}"]`;
const SIZES = [{ width: 1440, height: 900 }, { width: 820, height: 1180 }, { width: 390, height: 844 }, { width: 360, height: 640 }];

test.describe('Profile', () => {
  test('desktop: a section list beside one pane; the list switches sections and the address follows', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile');
    await expect(page.locator('.profile-rail a')).toHaveText(SECTIONS.map(([, label]) => label));
    await expect(page.locator(pane('you') + ' h1')).toHaveText('Account');
    await expect(page.locator('[data-account-mount]')).not.toContainText('Checking your account');
    for (const [id, label] of SECTIONS.slice(1)) {
      await page.locator(`.profile-rail a[href="/profile#${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/profile#${id}$`));
      await expect(page.locator(pane(id) + ' h1')).toHaveText(label);
      await expect(page.locator(`.profile-rail a[href="/profile#${id}"]`)).toHaveAttribute('aria-current', 'page');
      await expect(page.locator('[data-profile-section]')).toHaveCount(1);
    }
    expect(errors.filter(e => /Content Security Policy/.test(e))).toEqual([]);
  });

  test('arriving with a section in the address opens it; an unknown section falls back to Account', async ({ page }) => {
    await page.goto('/profile#privacy');
    await expect(page.locator(pane('privacy'))).toBeVisible();
    await page.goto('/profile#nonsense');
    await expect(page.locator(pane('you'))).toBeVisible();
    await page.goto('/profile#progress');
    await expect(page.locator('[data-profile-progress] .progress-panel__summary')).toBeVisible();
  });

  test('theme, light/dark apply; light/dark is a radio group with arrow keys; theme cards are legible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile#appearance');
    const cards = page.locator('[data-theme-option]');
    const target = await cards.nth(2).getAttribute('data-theme-option');
    await cards.nth(2).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', target);
    await expect(cards.nth(2)).toHaveAttribute('aria-pressed', 'true');
    const light = page.locator('[data-mode-choice="light"]');
    await light.click();
    await light.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-mode-choice="dark"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
    const card = page.locator('.theme-choice').first();
    await expect(card.locator('.theme-choice__swatch i')).toHaveCount(4);
    const m = await card.evaluate(el => {
      const n = el.querySelector('strong').getBoundingClientRect(), d = el.querySelector('.theme-choice__text > span').getBoundingClientRect();
      return { gap: d.top - n.bottom, swatchH: el.querySelector('.theme-choice__swatch').getBoundingClientRect().height, colours: new Set([...el.querySelectorAll('.theme-choice__swatch i')].map(i => getComputedStyle(i).backgroundColor)).size };
    });
    expect(m.gap).toBeGreaterThanOrEqual(0);
    expect(m.swatchH).toBeGreaterThan(40);
    expect(m.colours).toBeGreaterThan(1);
  });

  test('site text size: four steps scale the whole site, persist, and leave the Reader Aa size alone', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile#appearance');
    const size = () => page.evaluate(() => ({ factor: getComputedStyle(document.documentElement).getPropertyValue('--text-size-factor').trim(), h1: parseFloat(getComputedStyle(document.querySelector('.profile-h1')).fontSize), pref: document.documentElement.dataset.textSize }));
    const buttons = page.locator('[data-text-size-choice]');
    await expect(buttons).toHaveCount(4);
    await expect(page.locator('[data-text-size-choice="100"]')).toHaveAttribute('aria-checked', 'true');
    const base = (await size()).h1;
    await page.locator('[data-text-size-choice="130"]').click();
    await expect(page.locator('[data-text-size-choice="130"]')).toHaveAttribute('aria-checked', 'true');
    const big = await size();
    expect(big.factor).toBe('1.3');
    expect(big.h1).toBeGreaterThan(base * 1.2);
    await page.locator('[data-text-size-choice="90"]').click();
    expect((await size()).h1).toBeLessThan(base * 0.95);
    await page.locator('[data-text-size-choice="115"]').click();
    await page.reload();
    await expect(page.locator('.profile-h1')).toBeVisible();
    expect((await size()).pref).toBe('115');
    await expect(page.locator('[data-text-size-choice="115"]')).toHaveAttribute('aria-checked', 'true');
    await page.locator('[data-text-size-choice="115"]').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('[data-text-size-choice="100"]')).toHaveAttribute('aria-checked', 'true');
    expect((await size()).factor).toBe('');
    // The Reader's own Aa size is separate: its stored choice is untouched by the site size.
    await page.locator('[data-text-size-choice="130"]').click();
    expect(await page.evaluate(() => localStorage.getItem('cs-reader-size'))).toBeNull();
  });

  test('reading and interface fonts: pickers change the fonts, persist, and Theme default restores the theme', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile#reading');
    const family = selector => page.locator(selector).first().evaluate(el => getComputedStyle(el).fontFamily);
    const readingBefore = await family('[data-font-sample="reading"]');
    await expect(page.locator('[data-font-choice="reading"] option')).toHaveText(['Theme default', 'Newsreader', 'Literata', 'Caladea', 'Source Sans 3', 'System']);
    await page.locator('[data-font-choice="reading"]').selectOption('literata');
    expect(await family('[data-font-sample="reading"]')).toMatch(/^Literata/);
    expect(await family('.profile-h1'), 'headings follow the Reading font').toMatch(/^Literata/);
    expect(await family('.profile-card .cs-caption'), 'the Interface font is untouched').toBe(await page.evaluate(() => getComputedStyle(document.body).fontFamily));
    await page.reload();
    await expect(page.locator('[data-font-choice="reading"]')).toHaveValue('literata');
    expect(await family('[data-font-sample="reading"]')).toMatch(/^Literata/);
    await page.locator('[data-font-choice="reading"]').selectOption('default');
    expect(await family('[data-font-sample="reading"]')).toBe(readingBefore);

    await page.goto('/profile#appearance');
    const bodyBefore = await family('body');
    await page.locator('[data-font-choice="interface"]').selectOption('source-sans');
    expect(await family('body')).toMatch(/^"?'?Source Sans 3/);
    expect(await family('[data-font-sample="interface"]')).toMatch(/Source Sans 3/);
    await page.locator('[data-font-choice="interface"]').selectOption('default');
    expect(await family('body')).toBe(bodyBefore);
  });

  test('legacy stylesheets read the learner font first, so a chosen font reaches the whole site', async ({ page }) => {
    await page.goto('/profile#reading');
    await page.locator('[data-font-choice="reading"]').selectOption('caladea');
    await page.goto('/about');
    const ledeFont = await page.locator('.lede').first().evaluate(el => getComputedStyle(el).fontFamily);
    expect(ledeFont).toMatch(/^Caladea/);
    const css = await Promise.all(['/learning.css', '/canonical-shelf.css', '/styles.css', '/library.css', '/experience.css'].map(url => page.request.get(url).then(r => r.text())));
    const bare = css.join('\n').match(/(?<!, )var\(--font-(display|reading|body)\)/g) || [];
    expect(bare, 'use var(--user-font-X, var(--font-X)) so the learner font applies').toEqual([]);
  });

  test('Reading: translation choice is kept on this device', async ({ page }) => {
    await page.goto('/profile#reading');
    await expect(page.locator('[data-translation-choice]')).toHaveValue('bsb');
    await expect(page.locator('[data-translation-choice] option')).toHaveCount(1);
  });

  test('Data & privacy: backup works, and About, Terms, Statement of Faith and the policies are linked', async ({ page }) => {
    await page.goto('/profile#privacy');
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#backup #export').click()]);
    expect(download.suggestedFilename()).toBe('canonical-shelf-progress.json');
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#backup #import').click()]);
    expect(chooser.isMultiple()).toBe(false);
    const links = page.locator('.profile-links a');
    await expect(links.locator('strong')).toHaveText(['Statement of Faith', 'About', 'Terms', 'Privacy', 'Data retention', 'What is stored']);
    expect(await links.evaluateAll(list => list.map(a => a.getAttribute('href')))).toEqual(['/about.html#faith', '/about.html', '/terms.html', '/privacy.html', '/data-retention.html', '/storage.html']);
    await expect(page.locator('.profile-action[data-feedback-forget]')).toBeVisible();
    await expect(page.locator('#pwa-status')).toBeVisible();
    // Feedback is a link here on phones only (the strip under the frame carries it on larger screens).
    await expect(page.locator('.profile-action--phone')).toBeHidden();
  });

  test('phone: a drop-down picks the section; Feedback is in Data & privacy', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/profile');
    await expect(page.locator('.profile-rail')).toBeHidden();
    await expect(page.locator('.profile-phone-title')).toBeVisible();
    await page.locator('[data-profile-select]').selectOption('/profile#privacy');
    await expect(page).toHaveURL(/\/profile#privacy$/);
    await expect(page.locator('.profile-action--phone')).toBeVisible();
    await page.locator('.profile-action--phone').click();
    await expect(page.locator('#feedback-panel')).toBeVisible();
  });

  for (const size of SIZES) {
    test(`no overflow and type stays within the cap at ${size.width}x${size.height}, at the largest text size`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/profile#appearance');
      await page.locator('[data-text-size-choice="130"]').click();
      for (const [id] of SECTIONS) {
        await page.goto(`/profile#${id}`);
        await expect(page.locator(pane(id))).toBeVisible();
        const result = await page.evaluate(() => {
          const root = document.documentElement;
          const frame = document.querySelector('main#main');
          const wide = [...frame.querySelectorAll('.profile-card, .profile-links a, .theme-choice, .mode-toggle-group')].filter(el => el.getBoundingClientRect().right > frame.getBoundingClientRect().right + 1);
          return { scroll: root.scrollWidth - root.clientWidth, wide: wide.map(el => el.className) };
        });
        expect(result.scroll, `page width at ${id}`).toBeLessThanOrEqual(1);
        expect(result.wide, `cards inside the frame at ${id}`).toEqual([]);
      }
    });
  }
});
