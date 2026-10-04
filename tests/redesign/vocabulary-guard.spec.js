import {test,expect} from '@playwright/test';

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
  'volumes'
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

  test('primary navigation uses decided names (Shelf, Learning Path, Bible, Study Topics, Review & Practice)', async ({ page }) => {
    await page.goto('/home');
    const navLinks = await page.locator('nav.primary a').allInnerTexts();
    const cleanNav = navLinks.map(s => s.trim());

    const targetNav = ['Shelf', 'Learning Path', 'Bible', 'Study Topics', 'Review & Practice'];
    const hasLegacyNav = cleanNav.includes('Pathway') || cleanNav.includes('Catalog') || cleanNav.includes('Practice');

    if (hasLegacyNav) {
      test.fail(hasLegacyNav, `TODO(Phase 2): Primary navigation currently reads [${cleanNav.join(', ')}]; Phase 2 migrates to target [${targetNav.join(', ')}]`);
    }

    expect(cleanNav, 'Primary nav items must match decided vocabulary').toEqual(targetNav);
  });

  test('no forbidden words ("Catalog", "volume") appear as primary nav destinations or section headers', async ({ page }) => {
    const routes = ['/home', '/course', '/bible', '/topics', '/practice'];
    const strayOccurrences = [];

    for (const r of routes) {
      await page.goto(r, { waitUntil: 'domcontentloaded' });
      const navTexts = await page.locator('nav.primary a').allInnerTexts();
      for (const forbidden of FORBIDDEN_SECTION_WORDS) {
        if (navTexts.some(t => t.toLowerCase() === forbidden.toLowerCase())) {
          strayOccurrences.push({ route: r, context: 'nav', word: forbidden });
        }
      }

      // Check main section h1 and eyebrow
      const headings = await page.locator('main h1, main .eyebrow').allInnerTexts();
      for (const h of headings) {
        for (const forbidden of FORBIDDEN_SECTION_WORDS) {
          if (h.toLowerCase().includes(forbidden.toLowerCase())) {
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

  test('reader notes are identified as "My Notes" rather than un-scoped "Notes"', async ({ page }) => {
    await page.goto('/bible?book=GEN&chapter=1&start=1&end=1');
    const notesTab = page.locator('[data-desk-tab="notes"], [data-note-marker]');
    const tabCount = await notesTab.count();
    if (tabCount > 0) {
      const tabText = (await notesTab.first().innerText()).trim();
      const hasBareNotes = tabText.toLowerCase() === 'notes';
      if (hasBareNotes) {
        test.fail(hasBareNotes, 'TODO(Phase 2): Reader notes tab is labelled "Notes" instead of "My Notes"; Phase 2 standardizes on My Notes');
      }
      expect(tabText).not.toBe('Notes');
    }
  });
});
