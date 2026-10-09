import { test, expect } from '@playwright/test';

// The Reader's chapter header: the category above the book name, the translation below it, three different colours.
for (const [label, size, group, title, version] of [
  ['desktop', { width: 1440, height: 900 }, '.reader-title-group', '.reader-title-heading', '.reader-title-version'],
  ['phone', { width: 390, height: 844 }, '.reader-eyebrow', '.reader-phone-head .reader-picker-button', '.reader-phone-version']
]) {
  test(`${label}: category above the book name, translation below it, each its own colour`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto('/bible?book=43&chapter=3');
    await expect(page.locator(group)).toBeVisible();
    const m = await page.evaluate(([g, t, v]) => {
      const el = s => document.querySelector(s), box = s => el(s).getBoundingClientRect(), colour = s => getComputedStyle(el(s)).color;
      return { order: [box(g).top, box(t).top, box(v).top], colours: [colour(g), colour(t), colour(v)], groupText: el(g).textContent.trim(), versionText: el(v).textContent.trim() };
    }, [group, title, version]);
    expect(m.order[0]).toBeLessThan(m.order[1]);
    expect(m.order[1]).toBeLessThan(m.order[2]);
    expect(new Set(m.colours).size, 'three different colours').toBe(3);
    expect(m.versionText).toBe('Berean Standard Bible');
    expect(m.groupText).not.toContain('Berean');
  });
}
