import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// WCAG relative luminance and contrast calculation
function parseRgb(colorStr) {
  if (!colorStr) return null;
  const hex = colorStr.trim();
  if (hex.startsWith('#')) {
    const raw = hex.slice(1);
    if (raw.length === 3 || raw.length === 4) {
      const r = parseInt(raw[0] + raw[0], 16);
      const g = parseInt(raw[1] + raw[1], 16);
      const b = parseInt(raw[2] + raw[2], 16);
      return [r, g, b];
    }
    if (raw.length === 6 || raw.length === 8) {
      const r = parseInt(raw.slice(0, 2), 16);
      const g = parseInt(raw.slice(2, 4), 16);
      const b = parseInt(raw.slice(4, 6), 16);
      return [r, g, b];
    }
  }
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [Number(match[1]), Number(match[2]), Number(match[3])];
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

const themeData = JSON.parse(fs.readFileSync(path.resolve('.roa/values/theme.json'), 'utf8'));

const TEXT_ROLE_PAIRS = [
  { fg: 'text', bg: 'page', min: 4.5, role: 'primary text on page' },
  { fg: 'text', bg: 'surface', min: 4.5, role: 'primary text on surface' },
  { fg: 'text', bg: 'surfaceRaised', min: 4.5, role: 'primary text on raised surface' },
  { fg: 'text', bg: 'surfaceSunken', min: 4.5, role: 'primary text on sunken surface' },
  { fg: 'textSecondary', bg: 'surface', min: 4.5, role: 'secondary text on surface' },
  { fg: 'textSecondary', bg: 'page', min: 4.5, role: 'secondary text on page' },
  { fg: 'textMuted', bg: 'surface', min: 3.0, role: 'muted text on surface' },
  { fg: 'onAction', bg: 'action', min: 4.5, role: 'text on action control' },
  { fg: 'action', bg: 'surface', min: 3.0, role: 'action control on surface' },
  { fg: 'onAccent', bg: 'accent', min: 4.5, role: 'text on accent surface' }
];

test.describe('Phase 0: WCAG AA contrast audit for text roles', () => {
  const themes = Object.keys(themeData.themes);

  // Dedicated in-browser runtime test for Reading Room (the default theme) using live computed styles
  for (const mode of ['light', 'dark']) {
    test(`Reading Room (${mode}) meets WCAG AA contrast for all text roles in browser DOM`, async ({ page }) => {
      await page.goto('/home');
      await page.evaluate(({ mode }) => {
        document.documentElement.setAttribute('data-theme', 'reading-room');
        document.documentElement.setAttribute('data-mode', mode);
      }, { mode });

      const computedVars = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        return {
          text: cs.getPropertyValue('--color-text').trim(),
          page: cs.getPropertyValue('--color-page').trim(),
          surface: cs.getPropertyValue('--color-surface').trim(),
          surfaceRaised: cs.getPropertyValue('--color-surface-raised').trim(),
          surfaceSunken: cs.getPropertyValue('--color-surface-sunken').trim(),
          textSecondary: cs.getPropertyValue('--color-text-secondary').trim(),
          textMuted: cs.getPropertyValue('--color-text-muted').trim(),
          action: cs.getPropertyValue('--color-action').trim(),
          onAction: cs.getPropertyValue('--color-on-action').trim(),
          accent: cs.getPropertyValue('--color-accent').trim(),
          onAccent: cs.getPropertyValue('--color-on-accent').trim()
        };
      });

      const failures = [];
      for (const pair of TEXT_ROLE_PAIRS) {
        const fg = computedVars[pair.fg];
        const bg = computedVars[pair.bg];
        const ratio = contrastRatio(fg, bg);
        if (ratio === null || ratio < pair.min) {
          failures.push(`${pair.role} (${pair.fg} "${fg}" on ${pair.bg} "${bg}"): got ${ratio?.toFixed(2)}:1, expected >= ${pair.min}:1`);
        }
      }

      expect(failures, `Reading Room ${mode} runtime computed contrast failures`).toEqual([]);
    });
  }

  // Comprehensive test for all 8 existing themes across light and dark modes from theme contract
  for (const theme of themes) {
    for (const mode of ['light', 'dark']) {
      test(`Theme contract contrast: ${theme} (${mode}) meets WCAG AA for text roles`, async () => {
        const modeColors = themeData.themes[theme]?.modes?.[mode];
        if (!modeColors) return;

        const failures = [];
        for (const pair of TEXT_ROLE_PAIRS) {
          const fg = modeColors[pair.fg];
          const bg = modeColors[pair.bg];
          const ratio = contrastRatio(fg, bg);
          if (ratio === null || ratio < pair.min) {
            failures.push(`${pair.role} (${pair.fg} "${fg}" on ${pair.bg} "${bg}"): got ${ratio?.toFixed(2)}:1, expected >= ${pair.min}:1`);
          }
        }

        expect(failures, `${theme} (${mode}) contrast failures`).toEqual([]);
      });
    }
  }
});
