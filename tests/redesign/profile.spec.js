// Profile (Phase A): seven tabs on the Topics layout; phone shows the tab list, then a detail page with Back.
// Appearance and Reading hold a draft with a Save / Cancel bar; Typography and Theme preview without applying.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const TABS = [['account', 'Account'], ['appearance', 'Appearance'], ['reading', 'Reading'], ['study', 'My Study'], ['privacy', 'Privacy & data'], ['about', 'About Us'], ['contact', 'Contact Us']];
const pane = id => `[data-profile-section="${id}"]`;
const SIZES = [{ width: 1440, height: 900 }, { width: 820, height: 1180 }, { width: 390, height: 844 }, { width: 360, height: 640 }];

test.describe('Profile', () => {
  test('desktop: a tab list beside one pane; the list switches tabs and the address follows', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile');
    await expect(page.locator('.profile-rail a')).toHaveText(TABS.map(([, label]) => label));
    await expect(page.locator(pane('account') + ' h1')).toHaveText('Account');
    await expect(page.locator('[data-account-mount]')).not.toContainText('Checking your account');
    for (const [id, label] of TABS.slice(1)) {
      await page.locator(`.profile-rail a[href="/profile#${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/profile#${id}$`));
      await expect(page.locator(pane(id) + ' h1')).toHaveText(label);
      await expect(page.locator(`.profile-rail a[href="/profile#${id}"]`)).toHaveAttribute('aria-current', 'page');
      await expect(page.locator('[data-profile-section]')).toHaveCount(1);
    }
    expect(errors.filter(e => /Content Security Policy/.test(e))).toEqual([]);
  });

  test('earlier addresses still land: #notes and #progress open My Study, #you opens Account; unknown falls back', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const [hash, id] of [['notes', 'study'], ['progress', 'study'], ['you', 'account'], ['nonsense', 'account']]) {
      await page.goto(`/profile#${hash}`);
      await expect(page.locator(pane(id))).toBeVisible();
    }
    await expect(page.locator('[data-profile-progress] .progress-panel__summary')).toHaveCount(0);
    await page.goto('/profile#study');
    await expect(page.locator('[data-profile-progress] .progress-panel__summary')).toBeVisible();
  });

  test('Appearance: choices preview without applying; Save applies and persists; Cancel and leaving discard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile#appearance');
    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    await expect(page.locator('[data-savebar]')).toBeHidden();
    const themeSelect = page.locator('[data-theme-select]');
    const target = await themeSelect.locator('option').nth(2).getAttribute('value');
    await themeSelect.selectOption(target);
    await expect(html, 'picking a theme does not apply it').toHaveAttribute('data-theme', before);
    await expect(page.locator('[data-preview]')).toHaveAttribute('data-theme-swatch', target);
    await expect(page.locator('[data-preview-desc]')).not.toBeEmpty();
    await expect(page.locator('[data-savebar]')).toBeVisible();
    const sizeOf = () => page.locator('.pv-title').evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    const baseSize = await sizeOf();
    await page.locator('[data-text-size-choice="130"]').click();
    expect(await sizeOf()).toBeGreaterThan(baseSize * 1.2);
    expect(await page.evaluate(() => document.documentElement.dataset.textSize), 'the text size is not applied yet').toBe('100');
    await page.locator('[data-font-choice="reading"]').selectOption('literata');
    expect(await page.locator('.pv-title').evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/^Literata/);
    expect(await page.locator('.profile-h1').evaluate(el => getComputedStyle(el).fontFamily), 'the page itself is unchanged').not.toMatch(/^Literata/);
    // Cancel discards
    await page.locator('[data-cancel]').click();
    await expect(page.locator('[data-savebar]')).toBeHidden();
    await expect(html).toHaveAttribute('data-theme', before);
    await expect(page.locator('[data-text-size-choice="100"]')).toHaveAttribute('aria-checked', 'true');
    // Save applies, persists across a reload
    await themeSelect.selectOption(target);
    await page.locator('[data-text-size-choice="115"]').click();
    await page.locator('[data-font-choice="interface"]').selectOption('source-sans');
    await page.locator('[data-motion-choice="reduce"]').click();
    await page.locator('[data-contrast-choice="high"]').click();
    await page.locator('[data-save]').click();
    await expect(html).toHaveAttribute('data-theme', target);
    await expect(html).toHaveAttribute('data-text-size', '115');
    await expect(html).toHaveAttribute('data-reduce-motion', 'on');
    await expect(html).toHaveAttribute('data-contrast', 'high');
    await expect(page.locator('[data-profile-status]')).toHaveText('Saved.');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', target);
    await expect(html).toHaveAttribute('data-text-size', '115');
    await expect(html).toHaveAttribute('data-contrast', 'high');
    expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(/Source Sans 3/);
    // Leaving with unsaved changes asks first
    await page.locator('[data-text-size-choice="130"]').click();
    let prompt = '';
    page.once('dialog', d => { prompt = d.message(); d.dismiss(); });
    await page.locator('.profile-rail a[href="/profile#reading"]').click();
    expect(prompt).toContain('unsaved');
    await expect(page.locator(pane('appearance'))).toBeVisible();
    page.once('dialog', d => d.accept());
    await page.locator('.profile-rail a[href="/profile#reading"]').click();
    await expect(page.locator(pane('reading'))).toBeVisible();
    // Reset to defaults
    await page.goto('/profile#appearance');
    page.once('dialog', d => d.accept());
    await page.locator('[data-reset-defaults]').click();
    await expect(html).toHaveAttribute('data-text-size', '100');
    await expect(html).not.toHaveAttribute('data-contrast', 'high');
    await expect(page.locator('[data-profile-status]')).toContainText('reset');
  });

  test('light/dark is a radio group with arrow keys, applies as picked, and Cancel puts it back', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile#appearance');
    const light = page.locator('[data-mode-choice="light"]');
    await light.click();
    if (await page.locator('[data-savebar]').isVisible()) await page.locator('[data-save]').click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
    await page.goto('/profile#appearance');
    await light.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-mode-choice="dark"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
    await expect(page.locator('[data-savebar]')).toBeVisible();
    await page.locator('[data-cancel]').click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
  });

  test('Reading: BSB is the default; changing the choice shows Save', async ({ page }) => {
    await page.goto('/profile#reading');
    await expect(page.locator('[data-translation-choice]')).toHaveValue('bsb');
    await expect(page.locator('[data-translation-choice] option')).toHaveCount(1);
    await expect(page.locator('[data-savebar]')).toBeHidden();
  });

  test('My Study: progress, notes, history; reset and erase ask first and offer an export', async ({ page }) => {
    await page.goto('/profile#study');
    await expect(page.locator('[data-profile-progress] .progress-panel__summary')).toBeVisible();
    await page.evaluate(() => localStorage.setItem('canonical-shelf-recent-v1', JSON.stringify([{ href: '/home', title: 'Home' }])));
    const dialog = page.locator('dialog.profile-confirm');
    await page.locator('[data-study-action="clear-history"]').click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[data-confirm-export]')).toBeHidden();
    await dialog.locator('[data-confirm-cancel]').click();
    expect(await page.evaluate(() => localStorage.getItem('canonical-shelf-recent-v1'))).not.toBeNull();
    await page.locator('[data-study-action="clear-history"]').click();
    await dialog.locator('[data-confirm-go]').click();
    await expect(page.locator('[data-profile-status]')).toHaveText('History was cleared.');
    expect(await page.evaluate(() => localStorage.getItem('canonical-shelf-recent-v1'))).toBeNull();
    await page.locator('[data-study-action="erase-notes"]').click();
    await expect(dialog.locator('[data-confirm-export]')).toBeVisible();
    await dialog.locator('[data-confirm-cancel]').click();
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-study-export="progress"]').click()]);
    expect(download.suggestedFilename()).toBe('canonical-shelf-progress-summary.json');
    await page.locator('[data-study-action="reset-practice"]').click();
    await dialog.locator('[data-confirm-go]').click();
    await expect(page.locator('[data-profile-status]')).toHaveText('Practice progress was reset.');
  });

  test('Privacy & data: backup works; erase everything and delete account are here; policies are under About Us', async ({ page }) => {
    await page.goto('/profile#privacy');
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#backup #export').click()]);
    expect(download.suggestedFilename()).toBe('canonical-shelf-progress.json');
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#backup #import').click()]);
    expect(chooser.isMultiple()).toBe(false);
    await expect(page.locator('[data-study-action="erase-all"]')).toBeVisible();
    await expect(page.locator('.profile-action[href="/profile#account"]')).toBeVisible();
    await expect(page.locator('#pwa-status')).toBeVisible();
    await page.goto('/profile#about');
    const links = page.locator('.profile-links a');
    await expect(links.locator('strong')).toHaveText(['Statement of Faith', 'About', 'Terms', 'Privacy', 'Data retention', 'What is stored']);
    expect(await links.evaluateAll(list => list.map(a => a.getAttribute('href')))).toEqual(['/about.html#faith', '/about.html', '/terms.html', '/privacy.html', '/data-retention.html', '/storage.html']);
  });

  test('Contact Us: its own tab; a message is sent through the feedback pipeline', async ({ page }) => {
    let body = null;
    await page.route('**/api/feedback', async route => {
      if (route.request().method() === 'POST') { body = route.request().postDataJSON(); await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); } else await route.continue();
    });
    await page.goto('/profile#contact');
    await page.locator('#profile-contact [type="submit"]').click();
    await expect(page.locator('[data-profile-status]')).toHaveText('Write a message first.');
    await page.locator('#profile-contact textarea').fill('A question about Genesis.');
    await page.locator('#profile-contact select').selectOption('question');
    await page.locator('#profile-contact [type="submit"]').click();
    await expect(page.locator('[data-profile-status]')).toContainText('Thank you');
    expect(body.message).toBe('A question about Genesis.');
    expect(body.category).toBe('question');
    await page.locator('[data-forget-feedback]').click();
    await expect(page.locator('[data-profile-status]')).toContainText('no longer linked');
  });

  test('phone: the list is the Profile screen; each tab opens with a Back button', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/profile');
    await expect(page.locator('.profile-rail')).toBeHidden();
    await expect(page.locator('.profile-h1')).toHaveText('Profile');
    await expect(page.locator('.profile-list a strong')).toHaveText(TABS.map(([, label]) => label));
    await expect(page.locator('.profile-back')).toHaveCount(0);
    await page.locator('.profile-list a[href="/profile#contact"]').click();
    await expect(page.locator(pane('contact') + ' h1')).toHaveText('Contact Us');
    await page.locator('.profile-back').click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.locator('.profile-list')).toBeVisible();
    await page.locator('.profile-list a[href="/profile#appearance"]').click();
    await page.locator('[data-theme-select]').selectOption({ index: 1 });
    await expect(page.locator('[data-savebar]')).toBeVisible();
    await expect(page.locator('[data-savebar] [data-save]')).toBeInViewport();
  });

  for (const size of SIZES) {
    test(`no overflow at ${size.width}x${size.height}, at the largest text size`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/profile#appearance');
      await page.locator('[data-text-size-choice="130"]').click();
      await page.locator('[data-save]').click();
      for (const [id] of TABS) {
        await page.goto(`/profile#${id}`);
        await expect(page.locator(pane(id))).toBeVisible();
        const result = await page.evaluate(() => {
          const root = document.documentElement;
          const frame = document.querySelector('main#main');
          const wide = [...frame.querySelectorAll('.profile-card, .profile-links a, .mode-toggle-group, .profile-preview')].filter(el => el.getBoundingClientRect().right > frame.getBoundingClientRect().right + 1);
          return { scroll: root.scrollWidth - root.clientWidth, wide: wide.map(el => el.className) };
        });
        expect(result.scroll, `page width at ${id}`).toBeLessThanOrEqual(1);
        expect(result.wide, `cards inside the frame at ${id}`).toEqual([]);
      }
    });
  }

  test('legacy stylesheets read the learner font first, so a chosen font reaches the whole site', async ({ page }) => {
    await page.goto('/profile#appearance');
    await page.locator('[data-font-choice="reading"]').selectOption('caladea');
    await page.locator('[data-save]').click();
    await page.goto('/about');
    expect(await page.locator('.lede').first().evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/^Caladea/);
    const css = await Promise.all(['/learning.css', '/canonical-shelf.css', '/styles.css', '/library.css', '/experience.css'].map(url => page.request.get(url).then(r => r.text())));
    const bare = css.join('\n').match(/(?<!, )var\(--font-(display|reading|body)\)/g) || [];
    expect(bare, 'use var(--user-font-X, var(--font-X)) so the learner font applies').toEqual([]);
  });
});
