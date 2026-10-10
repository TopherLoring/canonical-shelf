// Profile: a drill-down. The left pane lists sections; choosing one shows a Back link and its sub-sections. Nothing links out of Profile.
// Customization holds a draft with a Save / Cancel bar; theme, fonts, and text size preview without applying.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const SECTIONS = [['account', 'Account'], ['customization', 'Customization'], ['study', 'My Study'], ['privacy', 'Privacy & Policies'], ['about', 'About Canonical Shelf'], ['contact', 'Contact Us']];
const SUBS = {
  account: ['Sign-in & sync'],
  customization: ['Appearance', 'Reader', 'Accessibility'],
  study: ['Progress', 'My Notes', 'History'],
  privacy: ['Your data', 'Privacy Policy', 'Cookies & storage', 'Data retention', 'Terms of Use'],
  about: ['About', 'Statement of Faith'],
  contact: ['Send a message']
};
const pane = id => `[data-profile-section="${id}"]`;
const SIZES = [{ width: 1440, height: 900 }, { width: 820, height: 1180 }, { width: 390, height: 844 }, { width: 360, height: 640 }];
const sizePick = async (page, id) => { await page.locator('[data-size-trigger]').click(); await page.locator(`[data-text-size-choice="${id}"]`).click(); };

test.describe('Profile', () => {
  test('desktop: sections first; choosing one drills into its sub-sections with Back; the address follows', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile');
    await expect(page.locator(pane('list') + ' h1')).toHaveText('Profile');
    await expect(page.locator('.profile-rail a')).toHaveText(SECTIONS.map(([, label]) => label));
    for (const [id, label] of SECTIONS) {
      await page.goto('/profile');
      await page.locator(`.profile-rail a[href="/profile#${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/profile#${id}$`));
      await expect(page.locator(pane(id))).toBeVisible();
      await expect(page.locator('.profile-rail__back')).toHaveText('Profile');
      await expect(page.locator('.profile-rail a:not(.profile-rail__back)')).toHaveText(SUBS[id]);
      await expect(page.locator(pane(id) + ' h1')).toHaveText(id === 'contact' ? 'Contact Us' : id === 'about' ? 'About Canonical Shelf' : SUBS[id][0]);
      await expect(page.locator('[data-profile-section]')).toHaveCount(1);
      expect(label).toBeTruthy();
    }
    await page.locator('.profile-rail__back').click();
    await expect(page.locator(pane('list'))).toBeVisible();
    await expect(page.locator('[data-account-mount]')).toHaveCount(0);
    await page.goto('/profile#account');
    await expect(page.locator('[data-account-mount]')).not.toContainText('Checking your account');
    expect(errors.filter(e => /Content Security Policy/.test(e))).toEqual([]);
  });

  test('earlier addresses still land: #notes and #progress open My Study, #you opens Account; unknown shows the section list', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const [hash, id] of [['notes', 'study'], ['progress', 'study'], ['you', 'account'], ['reading', 'customization'], ['appearance', 'customization'], ['terms', 'privacy'], ['faith', 'about'], ['nonsense', 'list']]) {
      await page.goto(`/profile#${hash}`);
      await expect(page.locator(pane(id))).toBeVisible();
    }
    await page.goto('/profile#study/notes');
    await expect(page.locator('[data-profile-progress] .progress-panel__summary')).toHaveCount(0);
    await page.goto('/profile#study');
    await expect(page.locator('[data-profile-progress] .progress-panel__summary')).toBeVisible();
  });

  test('nothing in Profile links to another page; policies and the Statement of Faith show in the pane and scroll inside their card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const hash of ['privacy/privacy-policy', 'privacy/storage', 'privacy/retention', 'privacy/terms', 'about/introduction', 'about/faith']) {
      await page.goto(`/profile#${hash}`);
      const doc = page.locator('.profile-doc');
      await expect(doc).toBeVisible();
      await expect(doc.locator('h2').first()).toBeVisible();
      const hrefs = await doc.locator('a[href]').evaluateAll(list => list.map(a => a.getAttribute('href')));
      for (const href of hrefs) expect(href, `${hash} link stays inside Profile`).toMatch(/^\/profile#/);
      const box = await doc.evaluate(el => ({ scroll: el.scrollHeight, client: el.clientHeight, page: document.querySelector('.profile-screen').scrollHeight - document.querySelector('.profile-screen').clientHeight }));
      expect(box.scroll, `${hash} is longer than the card`).toBeGreaterThan(box.client);
      expect(box.page, `${hash}: the screen itself does not scroll`).toBeLessThanOrEqual(1);
    }
    await page.goto('/profile#about/faith');
    await expect(page.locator('#statement-content')).not.toContainText('Loading the current Statement');
    await page.goto('/profile#privacy');
    await expect(page.locator('main#main a[href$=".html"]')).toHaveCount(0);
  });

  test('every single-page screen fits 1440x900 at the default text size, with lists scrolling inside their card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const id of Object.keys(SUBS)) {
      const hashes = { account: ['account'], customization: ['customization/appearance', 'customization/reader', 'customization/accessibility'], study: ['study/progress', 'study/notes', 'study/history'], privacy: ['privacy/data'], about: [], contact: ['contact'] }[id];
      for (const hash of hashes) {
        await page.goto(`/profile#${hash}`);
        await expect(page.locator(pane(id))).toBeVisible();
        const over = await page.evaluate(() => { const s = document.querySelector('.profile-screen'); return s.scrollHeight - s.clientHeight; });
        expect(over, `${hash} does not scroll the page`).toBeLessThanOrEqual(1);
      }
    }
  });

  test('Appearance: choices preview without applying; Save applies and persists; Cancel and leaving discard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile#customization/appearance');
    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    await expect(page.locator('[data-savebar]')).toBeHidden();
    const themeSelect = page.locator('[data-theme-select]');
    const target = await themeSelect.locator('option').nth(2).getAttribute('value');
    await themeSelect.selectOption(target);
    await expect(html, 'picking a theme does not apply it').toHaveAttribute('data-theme', before);
    await expect(page.locator('[data-preview]')).toHaveAttribute('data-theme-swatch', target);
    await expect(page.locator('[data-preview-desc]'), 'theme descriptions are gone from the preview').toHaveCount(0);
    await expect(page.locator('[data-savebar]')).toBeVisible();
    const sizeOf = () => page.locator('.pv-title').evaluate(el => parseFloat(getComputedStyle(el).fontSize));
    const baseSize = await sizeOf();
    await sizePick(page, '130');
    expect(await sizeOf()).toBeGreaterThan(baseSize * 1.2);
    expect(await page.evaluate(() => document.documentElement.dataset.textSize), 'the text size is not applied yet').toBe('100');
    await page.locator('[data-font-choice="reading"]').selectOption('literata');
    expect(await page.locator('.pv-title').evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/^Literata/);
    expect(await page.locator('.profile-h1').evaluate(el => getComputedStyle(el).fontFamily), 'the page itself is unchanged').not.toMatch(/^Literata/);
    // Cancel discards
    await page.locator('[data-cancel]').click();
    await expect(page.locator('[data-savebar]')).toBeHidden();
    await expect(html).toHaveAttribute('data-theme', before);
    await page.locator('[data-size-trigger]').click();
    await expect(page.locator('[data-text-size-choice="100"]')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    // Save applies, persists across a reload
    await themeSelect.selectOption(target);
    await sizePick(page, '115');
    await page.locator('[data-font-choice="interface"]').selectOption('source-sans');
    // Moving between Customization's own pages keeps the draft; one Save covers all three.
    await page.locator('.profile-rail a[href="/profile#customization/accessibility"]').click();
    await page.locator('[data-motion-switch]').check();
    await page.locator('[data-contrast-switch]').check();
    await expect(page.locator('[data-savebar]')).toBeVisible();
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
    await page.goto('/profile#customization/appearance');
    await sizePick(page, '130');
    let prompt = '';
    page.once('dialog', d => { prompt = d.message(); d.dismiss(); });
    await page.locator('.profile-rail__back').click();
    expect(prompt).toContain('unsaved');
    await expect(page.locator(pane('customization'))).toBeVisible();
    page.once('dialog', d => d.accept());
    await page.locator('.profile-rail__back').click();
    await expect(page.locator(pane('list'))).toBeVisible();
    // Reset to defaults
    await page.goto('/profile#customization/appearance');
    page.once('dialog', d => d.accept());
    await page.locator('[data-reset-defaults]').click();
    await expect(html).toHaveAttribute('data-text-size', '100');
    await expect(html).not.toHaveAttribute('data-contrast', 'high');
    await expect(page.locator('[data-profile-status]')).toContainText('reset');
  });

  test('light/dark is a radio group with arrow keys, applies as picked, and Cancel puts it back', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/profile#customization/appearance');
    const light = page.locator('[data-mode-choice="light"]');
    await light.click();
    if (await page.locator('[data-savebar]').isVisible()) await page.locator('[data-save]').click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
    await page.goto('/profile#customization/appearance');
    await light.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-mode-choice="dark"]')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
    await expect(page.locator('[data-savebar]')).toBeVisible();
    await page.locator('[data-cancel]').click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
  });

  test('Reader: BSB is the default; Accessibility uses toggle switches', async ({ page }) => {
    await page.goto('/profile#customization/accessibility');
    await expect(page.locator('[data-motion-switch]')).toHaveAttribute('role', 'switch');
    await expect(page.locator('[data-contrast-switch]')).not.toBeChecked();
    await page.goto('/profile#customization/reader');
    await expect(page.locator('[data-translation-choice]')).toHaveValue('bsb');
    await expect(page.locator('[data-translation-choice] option')).toHaveCount(1);
    await expect(page.locator('[data-savebar]')).toBeHidden();
  });

  test('My Study: progress, notes, history; reset and erase ask first and offer an export', async ({ page }) => {
    await page.goto('/profile#study/history');
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
    await page.goto('/profile#study/notes');
    await page.locator('[data-study-action="erase-notes"]').click();
    await expect(dialog.locator('[data-confirm-export]')).toBeVisible();
    await dialog.locator('[data-confirm-cancel]').click();
    await page.goto('/profile#study/progress');
    await expect(page.locator('[data-profile-progress] .progress-panel__summary')).toBeVisible();
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-study-export="progress"]').click()]);
    expect(download.suggestedFilename()).toBe('canonical-shelf-progress-summary.json');
    await page.locator('[data-study-action="reset-practice"]').click();
    await dialog.locator('[data-confirm-go]').click();
    await expect(page.locator('[data-profile-status]')).toHaveText('Practice progress was reset.');
  });

  test('Privacy & Policies: backup works; erase everything and delete account are in Your data', async ({ page }) => {
    await page.goto('/profile#privacy/data');
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#backup #export').click()]);
    expect(download.suggestedFilename()).toBe('canonical-shelf-progress.json');
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#backup #import').click()]);
    expect(chooser.isMultiple()).toBe(false);
    await expect(page.locator('[data-study-action="erase-all"]')).toBeVisible();
    await expect(page.locator('.profile-action[href="/profile#account"]')).toBeVisible();
    await expect(page.locator('#pwa-status')).toBeVisible();
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

  test('phone: sections, then sub-sections, then the page, each with Back', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/profile');
    await expect(page.locator('.profile-rail')).toBeHidden();
    await expect(page.locator('.profile-h1')).toHaveText('Profile');
    await expect(page.locator('.profile-list a strong')).toHaveText(SECTIONS.map(([, label]) => label));
    await expect(page.locator('.profile-back')).toHaveCount(0);
    await page.locator('.profile-list a[href="/profile#contact"]').click();
    await expect(page.locator(pane('contact') + ' h1')).toHaveText('Contact Us');
    await page.locator('.profile-back').click();
    await expect(page).toHaveURL(/\/profile$/);
    await page.locator('.profile-list a[href="/profile#customization"]').click();
    await expect(page.locator('.profile-h1')).toHaveText('Customization');
    await expect(page.locator('.profile-list a strong')).toHaveText(SUBS.customization);
    await page.locator('.profile-list a[href="/profile#customization/appearance"]').click();
    await expect(page.locator('.profile-back')).toHaveText('Customization');
    await page.locator('[data-theme-select]').selectOption({ index: 1 });
    await expect(page.locator('[data-savebar]')).toBeVisible();
    await expect(page.locator('[data-savebar] [data-save]')).toBeInViewport();
  });

  for (const size of SIZES) {
    test(`no overflow at ${size.width}x${size.height}, at the largest text size`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/profile#customization/appearance');
      await sizePick(page, '130');
      await page.locator('[data-save]').click();
      for (const hash of ['account', 'customization/appearance', 'customization/reader', 'customization/accessibility', 'study/progress', 'study/notes', 'study/history', 'privacy/data', 'privacy/terms', 'about/introduction', 'about/faith', 'contact']) {
        const id = hash.split('/')[0];
        await page.goto(`/profile#${hash}`);
        await expect(page.locator(pane(id))).toBeVisible();
        const result = await page.evaluate(() => {
          const root = document.documentElement;
          const frame = document.querySelector('main#main');
          const wide = [...frame.querySelectorAll('.profile-card, .profile-doc, .mode-toggle-group, .profile-preview')].filter(el => el.getBoundingClientRect().right > frame.getBoundingClientRect().right + 1);
          return { scroll: root.scrollWidth - root.clientWidth, wide: wide.map(el => el.className) };
        });
        expect(result.scroll, `page width at ${hash}`).toBeLessThanOrEqual(1);
        expect(result.wide, `cards inside the frame at ${hash}`).toEqual([]);
      }
    });
  }

  test('legacy stylesheets read the learner font first, so a chosen font reaches the whole site', async ({ page }) => {
    await page.goto('/profile#customization/appearance');
    await page.locator('[data-font-choice="reading"]').selectOption('caladea');
    await page.locator('[data-save]').click();
    await page.goto('/about');
    expect(await page.locator('.lede').first().evaluate(el => getComputedStyle(el).fontFamily)).toMatch(/^Caladea/);
    const css = await Promise.all(['/learning.css', '/canonical-shelf.css', '/styles.css', '/library.css', '/experience.css'].map(url => page.request.get(url).then(r => r.text())));
    const bare = css.join('\n').match(/(?<!, )var\(--font-(display|reading|body)\)/g) || [];
    expect(bare, 'use var(--user-font-X, var(--font-X)) so the learner font applies').toEqual([]);
  });
});
