import { test, expect } from '@playwright/test';
import { waitForAppReady } from './test-helpers.js';

// Decided learner-facing names per redesign decisions
const DECIDED_NAMES = [
  'Learning Path',
  'Module',
  'Unit',
  'Lesson',
  'Capstone',
  'Study Topics',
  'Review & Practice',
  'My Notes',
  'Shelf'
];

// Forbidden stray words when used as primary navigation or section titles
const FORBIDDEN_SECTION_WORDS = [
  'Catalog',
  'volume',
  'volumes',
  'course'
];

test.describe('Phase 0: Vocabulary guard for decided learner-facing terminology', () => {
  test('decided names catalog contains all approved structural names', () => {
    expect(DECIDED_NAMES).toContain('Learning Path');
    expect(DECIDED_NAMES).toContain('Module');
    expect(DECIDED_NAMES).toContain('Unit');
    expect(DECIDED_NAMES).toContain('Lesson');
    expect(DECIDED_NAMES).toContain('Capstone');
    expect(DECIDED_NAMES).toContain('Study Topics');
    expect(DECIDED_NAMES).toContain('Review & Practice');
    expect(DECIDED_NAMES).toContain('My Notes');
    expect(DECIDED_NAMES).toContain('Shelf');
  });

  test('primary navigation uses decided names (Shelf, Learning Path, Bible, Study Topics, Review & Practice)',{tag:'@smoke'}, async ({ page }) => {
    await page.goto('/home');
    await waitForAppReady(page);
    const navLinks = await page.locator('nav.primary a').allInnerTexts();
    const cleanNav = navLinks.map(s => s.trim().toUpperCase());

    const targetNav = ['SHELF', 'LEARNING PATH', 'BIBLE', 'STUDY TOPICS', 'REVIEW & PRACTICE'];
    const hasLegacyNav = cleanNav.includes('PATHWAY') || cleanNav.includes('CATALOG') || cleanNav.includes('PRACTICE');

    if (hasLegacyNav) {
      test.fail(hasLegacyNav, `TODO(Phase 2): Primary navigation currently reads [${cleanNav.join(', ')}]; Phase 2 migrates to target [${targetNav.join(', ')}]`);
    }

    expect(cleanNav, 'Primary nav items must match decided vocabulary').toEqual(targetNav);
  });

  test('no forbidden words ("Catalog", "volume", "course") appear as primary nav destinations or section headers', async ({ page }) => {
    test.slow();
    const routes = ['/home', '/course', '/bible', '/path', '/topics', '/practice', '/profile'];
    const strayOccurrences = [];

    for (const r of routes) {
      await page.goto(r);
      await waitForAppReady(page);

      // Check primary navigation items
      const navTexts = await page.locator('nav.primary a').allInnerTexts();
      for (const forbidden of FORBIDDEN_SECTION_WORDS) {
        if (navTexts.some(t => t.toLowerCase() === forbidden.toLowerCase())) {
          strayOccurrences.push({ route: r, context: 'nav', word: forbidden });
        }
      }

      // Check main section h1, h2, and eyebrow headings
      const headings = await page.locator('main h1, main h2, main .eyebrow').allInnerTexts();
      for (const h of headings) {
        for (const forbidden of FORBIDDEN_SECTION_WORDS) {
          if (h.toLowerCase().split(/\s+/).includes(forbidden.toLowerCase())) {
            strayOccurrences.push({ route: r, context: 'heading', text: h.trim(), word: forbidden });
          }
        }
      }
    }

    if (strayOccurrences.length > 0) {
      test.fail(true, `TODO(Phase 2): Stray forbidden words detected in rendered copy: ${JSON.stringify(strayOccurrences)}; Phase 2 replaces these with decided vocabulary`);
    }

    expect(strayOccurrences, 'No forbidden words should appear as section names').toEqual([]);
  });

  test('notes section is identified as "My Notes" rather than un-scoped "Notes"', async ({ page }) => {
    // 1. Profile notes section heading
    await page.goto('/profile#study');
    await waitForAppReady(page);
    const profileNotesTitle = page.locator('[data-profile-notes]').locator('xpath=ancestor::section[1]/span[1]');
    const profileNotesText = (await profileNotesTitle.innerText()).trim();

    // 2. Reader notes panel
    await page.goto('/bible?book=1&chapter=1&start=1&end=1');
    await waitForAppReady(page);
    const readerNotes = page.locator('.study-notes[aria-label]');
    const readerNotesAria = (await readerNotes.getAttribute('aria-label'))?.trim();

    const isLegacyNotes = profileNotesText === 'Notes' || readerNotesAria === 'Your notes';
    if (isLegacyNotes) {
      test.fail(isLegacyNotes, `TODO(Phase 2): Notes section is currently labelled "${profileNotesText}" in profile and "${readerNotesAria}" in reader; Phase 2 standardizes on "My Notes"`);
    }

    expect(profileNotesText.startsWith('My Notes'), 'Profile notes section title must start with "My Notes"').toBe(true);
    expect(readerNotesAria, 'Reader study notes container label must be "My Notes"').toBe('My Notes');
  });
});
