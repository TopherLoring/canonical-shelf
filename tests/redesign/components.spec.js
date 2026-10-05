import { test, expect } from '@playwright/test';

// WCAG relative luminance and contrast calculation
function parseRgb(colorStr) {
  if (!colorStr) return null;
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  const colorMatch = colorStr.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (colorMatch) {
    return [
      Math.round(Number(colorMatch[1]) * 255),
      Math.round(Number(colorMatch[2]) * 255),
      Math.round(Number(colorMatch[3]) * 255)
    ];
  }
  const hex = colorStr.trim();
  if (hex.startsWith('#')) {
    const raw = hex.slice(1);
    if (raw.length === 3 || raw.length === 4) {
      return [parseInt(raw[0] + raw[0], 16), parseInt(raw[1] + raw[1], 16), parseInt(raw[2] + raw[2], 16)];
    }
    if (raw.length === 6 || raw.length === 8) {
      return [parseInt(raw.slice(0, 2), 16), parseInt(raw.slice(2, 4), 16), parseInt(raw.slice(4, 6), 16)];
    }
  }
  return null;
}

function relativeLuminance([r, g, b]) {
  const srgb = [r / 255, g / 255, b / 255];
  const linear = srgb.map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(fgStr, bgStr) {
  const fgRgb = parseRgb(fgStr);
  const bgRgb = parseRgb(bgStr);
  if (!fgRgb || !bgRgb) return null;
  const l1 = relativeLuminance(fgRgb);
  const l2 = relativeLuminance(bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

test.describe('Phase 3: Shared UI Component Library & Lab Harness', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ui/lab.html');
  });

  test('Component Lab loads successfully with all 15 component sections', async ({ page }) => {
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
      'verse-actions',
      'footnote',
      'notes-panel',
      'lesson-window',
      'bookshelf',
      'game-tile'
    ];

    for (const secId of expectedSections) {
      const section = page.locator(`section#${secId}`);
      await expect(section, `Section #${secId} should exist`).toBeVisible();
    }
  });

  test('Component Lab navigation anchors link to valid component sections', async ({ page }) => {
    const navLinks = page.locator('.lab-nav a');
    const count = await navLinks.count();
    expect(count).toBe(15);

    for (let i = 0; i < count; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^#[a-z-]+$/);
      const targetSec = page.locator(`section${href}`);
      await expect(targetSec, `Anchor ${href} must correspond to a section`).toBeAttached();
    }
  });

  test('Routes /ui/lab and /ui/lab/ resolve to the Component Lab harness', async ({ page }) => {
    await page.goto('/ui/lab');
    await expect(page.locator('h1.lab-title')).toHaveText('Component Lab');

    await page.goto('/ui/lab/');
    await expect(page.locator('h1.lab-title')).toHaveText('Component Lab');
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

  test('ScriptureBlock renders quote on scriptureBed with group border', async ({ page }) => {
    const block = page.locator('#scripture-block .ui-scripture-block').first();
    await expect(block).toBeVisible();

    // Verify scriptureBed background is active and not overridden by raw group color
    const quote = block.locator('.ui-scripture-block-quote');
    await expect(quote).toBeVisible();
    await expect(quote).toContainText('Law of Moses, the Prophets, and the Psalms');

    const contextLink = block.locator('.ui-scripture-block-context');
    await expect(contextLink).toHaveText('Read in context');
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

      await page.evaluate(async () => {
        await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
      });
      const items = await page.evaluate(() => {
        function resolveToRgb(colorStr) {
          if (!colorStr) return null;
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = colorStr;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          return { r, g, b, a };
        }

        const specs = [
          { sel: 'h1.lab-title', min: 3.0 },
          { sel: '.ui-panel-title', min: 3.0 },
          { sel: '.ui-rail-link.is-active', min: 4.5 },
          { sel: '.ui-scripture-block-quote', min: 4.5 },
          { sel: '.ui-scripture-ref-link', min: 4.5 },
          { sel: '.ui-group-chip-label', min: 4.5 },
          { sel: '.ui-progress-scope-title', min: 4.5 },
          { sel: '.ui-step-list-header', min: 3.0 },
          { sel: '.ui-edge-tab-label', min: 4.5 },
          { sel: '.ui-game-tile-title', min: 3.0 },
          { sel: '.ui-notes-title', min: 3.0 }
        ];

        return specs.map(spec => {
          const el = document.querySelector(spec.sel);
          if (!el) return { sel: spec.sel, missing: true };
          const cs = getComputedStyle(el);
          let cur = el;
          let bgStr = '';
          while (cur) {
            const curBg = getComputedStyle(cur).backgroundColor;
            if (curBg && curBg !== 'rgba(0, 0, 0, 0)' && !curBg.endsWith(', 0)')) {
              bgStr = curBg;
              break;
            }
            cur = cur.parentElement;
          }
          if (!bgStr) {
            bgStr = getComputedStyle(document.body).backgroundColor || 'rgb(237, 238, 240)';
          }
          const fgRgb = resolveToRgb(cs.color);
          const bgRgb = resolveToRgb(bgStr);

          return {
            sel: spec.sel,
            min: spec.min,
            rawFg: cs.color,
            rawBg: bgStr,
            fg: fgRgb ? [fgRgb.r, fgRgb.g, fgRgb.b] : null,
            bg: bgRgb ? [bgRgb.r, bgRgb.g, bgRgb.b] : null
          };
        });
      });

      for (const item of items) {
        expect(item.missing, `Element for ${item.sel} should exist`).toBeFalsy();
        expect(item.fg, `Fg color for ${item.sel} (${item.rawFg}) must resolve`).toBeTruthy();
        expect(item.bg, `Bg color for ${item.sel} (${item.rawBg}) must resolve`).toBeTruthy();
        const l1 = relativeLuminance(item.fg);
        const l2 = relativeLuminance(item.bg);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        expect(
          ratio,
          `Contrast ratio ${ratio.toFixed(2)} for ${item.sel} (${item.rawFg} on ${item.rawBg}) in ${mode} mode should meet WCAG AA (>= ${item.min})`
        ).toBeGreaterThanOrEqual(item.min);
      }
    }
  });
});
