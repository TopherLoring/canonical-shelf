// Shelf home (S4). Decisions: the shelf is dark walnut with iron bookends; book width follows verse count; the Old Testament
// fills its shelf and the New Testament 80% of it; the nine decided group names; a selected-book panel; no decorations.
import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

const GROUPS = ['Law', 'History', 'Wisdom and Poetry', 'Major Prophets', 'Minor Prophets', 'Gospels and Acts', /Paul['’]s Letters/, 'General Letters', 'Revelation'];
const home = page => page.locator('.shelf-home');
const widthOf = (page, n) => page.evaluate(n => document.querySelector(`[data-book-select="${n}"]`).getBoundingClientRect().width, n);

test.describe('Shelf home', () => {
  test('desktop: 66 books sized by length and coloured by group, New Testament at 80%, the nine group names, no policy errors', { tag: '@smoke' }, async ({ page }) => {
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    await expect(home(page)).toBeVisible();
    await expect(page.locator('.shelf-home h1')).toHaveText(/The Canonical\s*Shelf/);
    await expect(page.locator('[data-book-select]')).toHaveCount(66);

    const [psalms, genesis, obadiah] = [await widthOf(page, 19), await widthOf(page, 1), await widthOf(page, 31)];
    expect(psalms, 'Psalms (2,461 verses) is wider than Genesis').toBeGreaterThan(genesis);
    expect(genesis, 'Genesis is wider than Obadiah (21 verses); the template scales width by the square root of length').toBeGreaterThan(obadiah * 2);
    const runs = await page.evaluate(() => [...document.querySelectorAll('.cs-shelf-row')].map(row => {
      const spines = [...row.querySelectorAll('.cs-spine')];
      return spines.at(-1).getBoundingClientRect().right - spines[0].getBoundingClientRect().left;
    }));
    expect(runs[1] / runs[0], 'the New Testament fills about 80% of its shelf').toBeGreaterThan(0.74);
    expect(runs[1] / runs[0]).toBeLessThan(0.84);

    expect(await page.evaluate(() => new Set([...document.querySelectorAll('[data-book-select]')].map(b => b.dataset.group)).size), 'books carry nine group colours').toBe(9);
    await expect(page.locator('.shelf-home__legend li')).toContainText(GROUPS);
    expect(errors.filter(e => /Content Security Policy/.test(e)), 'nothing relies on inline styles').toEqual([]);
  });

  test('selecting a book fills the panel (group, position, where to begin) and Open goes to its first chapter', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    await expect(page.locator('#shelf-selected-title')).toHaveText('Genesis');
    await page.locator('[data-book-select="43"]').click();
    await expect(page.locator('#shelf-selected-title')).toHaveText('John');
    await expect(page.locator('[data-book-select="43"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-book-select="1"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.shelf-book-panel')).toContainText('Gospels and Acts');
    await expect(page.locator('.shelf-book-panel')).toContainText('Book 43 of 66');
    await expect(page.locator('.shelf-home__announcement')).toHaveText(/Selected John, book 43 of 66/);
    await expect(page.locator('.shelf-book-panel__resume')).toHaveAttribute('href', '/bible?book=43&chapter=1');
    await page.locator('.shelf-book-panel__resume').click();
    await expect(page.locator('[data-reader]')).toBeVisible();
  });

  test('Continue learning goes to the first lesson; a saved reading position selects its book and draws its progress', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('canonical-shelf-bible-state-v1', JSON.stringify({ lastBook: 43, lastChapter: 3 })));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    await expect(page.locator('#shelf-selected-title')).toHaveText('John');
    await expect(page.locator('.shelf-book-panel__resume')).toHaveText('Resume John 3');
    await expect(page.locator('.shelf-book-panel__reading')).toContainText('Last opened · chapter 3');
    const fill = await page.evaluate(() => {
      const span = document.querySelector('.shelf-book-panel__progress span'), track = span.parentElement;
      return span.getBoundingClientRect().width / track.getBoundingClientRect().width;
    });
    expect(fill, 'chapter 3 of 21 is about 14%').toBeGreaterThan(0.1);
    expect(fill).toBeLessThan(0.2);
    await expect(page.locator('a.shelf-home-continue')).toHaveAttribute('href', /lesson=begin/);
  });

  test('with no saved reading place the card is the Passage of the day, and it opens on those verses', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    const card = page.locator('[data-home-reading="passage"]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Passage of the day');
    await expect(card).toContainText(/[A-Z0-9][A-Za-z0-9 ]+ \d+:\d+/);
    expect((await card.locator('.shelf-home-reading__text').innerText()).length).toBeGreaterThan(20);
    await expect(card).toContainText('Open in the Bible');
    const href = await card.getAttribute('href');
    expect(href).toMatch(/^\/bible\?book=\d+&chapter=\d+&start=\d+/);
    await card.click();
    await expect(page.locator('[data-reader]')).toBeVisible();
    await expect(page.locator('[data-reader]')).toHaveAttribute('data-selected-verse', /\d+/);
  });

  test('the passage is the same all day and moves to the next one the next day', async ({ page }) => {
    await page.goto('/home');
    const picks = await page.evaluate(async () => {
      const { passageOfTheDay } = await import('/ui/screens/shelf-home.js');
      const { PASSAGES } = await import('/passages-of-the-day.js');
      const morning = passageOfTheDay(new Date(2026, 9, 9, 0, 5)), night = passageOfTheDay(new Date(2026, 9, 9, 23, 55));
      const next = passageOfTheDay(new Date(2026, 9, 10, 8));
      const week = new Set(Array.from({ length: 7 }, (_, i) => passageOfTheDay(new Date(2026, 9, 9 + i, 12)).label));
      return { same: morning.label === night.label, moved: next.label !== morning.label, week: week.size, count: PASSAGES.length };
    });
    expect(picks.same, 'one passage per day').toBe(true);
    expect(picks.moved, 'a new passage the next day').toBe(true);
    expect(picks.week).toBe(7);
    expect(picks.count, 'at least one passage for every day of the year').toBeGreaterThanOrEqual(365);
  });

  test('every curated passage is the Berean Standard Bible text at its address', async ({ page }) => {
    await page.goto('/home');
    const problems = await page.evaluate(async () => {
      const { PASSAGES } = await import('/passages-of-the-day.js');
      const corpus = await (await fetch('/data/corpus.txt')).text();
      const verses = new Map();
      for (const line of corpus.split('\n')) { const [b, c, v, ...rest] = line.split('\t'); if (rest.length) verses.set(`${b}.${c}.${v}`, rest.join('\t').trim()); }
      const seen = new Set(), bad = [];
      for (const [book, chapter, start, end, text] of PASSAGES) {
        const address = `${book}.${chapter}.${start}-${end}`;
        if (seen.has(address)) bad.push('duplicate ' + address);
        seen.add(address);
        const expected = []; for (let v = start; v <= end; v++) expected.push(verses.get(`${book}.${chapter}.${v}`));
        if (expected.some(t => !t) || expected.join(' ') !== text) bad.push('text differs at ' + address);
        if (end - start < 1 || end - start > 14) bad.push('must be 2 to 15 verses at ' + address);
      }
      return bad;
    });
    expect(problems).toEqual([]);
  });

  test('with a saved reading place the card is a bookmark that resumes in the Reader', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('canonical-shelf-bible-state-v1', JSON.stringify({ lastBook: 43, lastChapter: 3, excerpt: 'Now there was a man of the Pharisees named Nicodemus' })));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');
    const card = page.locator('[data-home-reading="bookmark"]');
    await expect(card).toContainText('Continue reading · John 3');
    await expect(card).toContainText('Nicodemus');
    await expect(page.locator('[data-home-reading="passage"]')).toHaveCount(0);
    await card.click();
    await expect(page.locator('[data-reader]')).toHaveAttribute('data-book', '43');
    await expect(page.locator('[data-reader]')).toHaveAttribute('data-chapter', '3');
  });

  test('opening a chapter in the Reader makes the Shelf offer to continue it, with the chapter opening as the excerpt', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/bible?book=43&chapter=3');
    await expect(page.locator('[data-reader]')).toBeVisible();
    await page.goto('/home');
    const card = page.locator('[data-home-reading="bookmark"]');
    await expect(card).toContainText('Continue reading · John 3');
    await expect(card.locator('.shelf-home-reading__text')).toContainText('Nicodemus');
    await expect(page.locator('#shelf-selected-title')).toHaveText('John');
  });

  test('phone: the whole shelf fits without sideways scroll, with the panel below it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home');
    await expect(home(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const tops = await page.evaluate(() => ({ shelf: document.querySelector('.cs-shelf').getBoundingClientRect().top, panel: document.querySelector('.shelf-book-dock').getBoundingClientRect().top }));
    expect(tops.panel, 'the selected book docks below the shelf').toBeGreaterThan(tops.shelf);
    await expect(page.locator('.shelf-book-panel')).toBeHidden();
    await expect(page.locator('.shelf-book-dock')).toContainText('Genesis');
    await expect(page.locator('.cs-shelf-intro p'), 'the intro paragraph stays on a phone').toBeVisible();
    expect(await widthOf(page, 19), 'books keep their relative widths on a phone').toBeGreaterThan(await widthOf(page, 31));
  });
});
