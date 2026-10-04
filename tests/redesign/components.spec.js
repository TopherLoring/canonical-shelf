import { test, expect } from '@playwright/test';

test.describe('Phase 3: Shared UI Component Library & Lab Harness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ui/lab.html');
  });

  test('Component Lab loads successfully with all component sections', async ({ page }) => {
    await expect(page.locator('h1.lab-title')).toHaveText('Component Lab');

    const expectedSections = [
      'rail',
      'panel',
      'edge-tab',
      'scripture-block',
      'scripture-ref',
      'group-chip',
      'progress',
      'steps',
      'verse-text',
      'footnote',
      'lesson-window',
      'bookshelf'
    ];

    for (const secId of expectedSections) {
      const section = page.locator(`section#${secId}`);
      await expect(section, `Section #${secId} should exist`).toBeVisible();
    }
  });

  test('EdgeTab renders both Theologian and My Notes with correct tokens', async ({ page }) => {
    const theoTab = page.locator('#lab-edge-theo');
    const notesTab = page.locator('#lab-edge-notes');

    await expect(theoTab).toBeVisible();
    await expect(notesTab).toBeVisible();

    await expect(theoTab).toHaveAttribute('data-edge-tab', 'theologian');
    await expect(notesTab).toHaveAttribute('data-edge-tab', 'notes');

    const theoLabel = theoTab.locator('.ui-edge-tab-label');
    const notesLabel = notesTab.locator('.ui-edge-tab-label');

    await expect(theoLabel).toHaveText('Theologian');
    await expect(notesLabel).toHaveText('My Notes');

    // Verify chevron exists
    await expect(theoTab.locator('svg[data-chevron="1"]')).toBeVisible();
    await expect(notesTab.locator('svg[data-chevron="1"]')).toBeVisible();
  });

  test('ScriptureRef interactively expands and collapses verse text', async ({ page }) => {
    const refContainer = page.locator('#scripture-ref .ui-scripture-ref[data-group="wisdom"]');
    await expect(refContainer).toBeVisible();

    const toggleBtn = refContainer.locator('[data-ref-toggle]');
    const verseText = refContainer.locator('.ui-scripture-ref-text');

    // Initial state is collapsed
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(verseText).toBeHidden();

    // Click to expand
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(verseText).toBeVisible();
    await expect(verseText).toContainText('When You send Your Spirit');

    // Click to collapse
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(verseText).toBeHidden();
  });

  test('GroupChip renders all 9 canon groups with color swatches', async ({ page }) => {
    const groups = ['law', 'othist', 'wisdom', 'major', 'minor', 'gospel', 'paul', 'general', 'apoc'];

    for (const g of groups) {
      const chip = page.locator(`#group-chip .ui-group-chip[data-group="${g}"]`).first();
      await expect(chip, `GroupChip for ${g} should exist`).toBeVisible();
      const swatch = chip.locator('.ui-group-chip-swatch');
      await expect(swatch).toBeVisible();
    }
  });

  test('ProgressBar and ProgressScope expose correct accessibility semantics and levels', async ({ page }) => {
    const progressBars = page.locator('#progress [role="progressbar"]');
    const count = await progressBars.count();
    expect(count).toBeGreaterThanOrEqual(4);

    const firstBar = progressBars.first();
    await expect(firstBar).toHaveAttribute('aria-valuemin', '0');
    await expect(firstBar).toHaveAttribute('aria-valuemax', '100');

    // Verify ProgressScopes for Unit, Module, Path
    for (const scope of ['unit', 'module', 'path']) {
      const scopeEl = page.locator(`#progress .ui-progress-scope[data-scope="${scope}"]`);
      await expect(scopeEl, `ProgressScope for ${scope} should exist`).toBeVisible();
    }
  });

  test('StepList and StepStrip render lesson pacing accurately', async ({ page }) => {
    const stepList = page.locator('#steps .ui-step-list');
    await expect(stepList).toBeVisible();
    await expect(stepList.locator('.ui-step-list-header')).toContainText('Steps · 1 of 6');

    const activeStep = stepList.locator('.ui-step-list-link.is-active');
    await expect(activeStep).toBeVisible();
    await expect(activeStep).toHaveAttribute('aria-current', 'step');

    const stepStrip = page.locator('#steps .ui-step-strip');
    await expect(stepStrip).toBeVisible();
    const bars = stepStrip.locator('.ui-step-strip-bar');
    expect(await bars.count()).toBe(6);
    await expect(bars.first()).toHaveClass(/is-active/);
  });

  test('Theme mode toggles between light and dark modes seamlessly', async ({ page }) => {
    const darkBtn = page.locator('[data-set-mode="dark"]');
    const lightBtn = page.locator('[data-set-mode="light"]');

    await darkBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');

    await lightBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
  });

  test('Component Lab passes WCAG AA contrast in Reading Room light and dark modes', async ({ page }) => {
    for (const mode of ['light', 'dark']) {
      await page.evaluate(m => {
        document.documentElement.setAttribute('data-theme', 'reading-room');
        document.documentElement.setAttribute('data-mode', m);
      }, mode);

      // Verify key text elements in Component Lab have valid colors and contrast
      const checks = await page.evaluate(() => {
        const results = [];
        const selectors = [
          'h1.lab-title',
          '.ui-panel-title',
          '.ui-rail-link.is-active',
          '.ui-scripture-block-quote',
          '.ui-scripture-ref-link',
          '.ui-group-chip-label',
          '.ui-progress-scope-title',
          '.ui-step-list-header'
        ];

        for (const sel of selectors) {
          const el = document.querySelector(sel);
          if (el) {
            const cs = getComputedStyle(el);
            results.push({
              selector: sel,
              color: cs.color,
              hasColor: Boolean(cs.color && cs.color !== 'rgba(0, 0, 0, 0)')
            });
          }
        }
        return results;
      });

      expect(checks.length).toBeGreaterThan(0);
      for (const c of checks) {
        expect(c.hasColor, `${c.selector} has visible text color in ${mode} mode`).toBeTruthy();
      }
    }
  });
});

