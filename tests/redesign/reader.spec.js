// Step 2 (phase 4): the Bible reader. Covers the reading apparatus (BSB headings and footnotes), selection,
// highlights, notes, study panels, keyboard use, addresses that stay on the current Bible page, and phone layout.
import { test, expect } from '@playwright/test';

// These tests are about reading, notes and highlights, not offline behavior (verify:sw covers the service worker).
// On first visit the service worker pre-caches about 130 files, which is extra load when many browsers run at once,
// so it is skipped here to keep the reload-based tests quick and steady.
test.use({ serviceWorkers: 'block' });

// The app queues its highlight saves, so a reload straight after a click can drop the last one. Wait until the saved
// ranges for a verse show the expected colours before reloading (what a person sees after a refresh is what was saved).
async function savedColors(page, osis, expected) {
  await expect.poll(() => page.evaluate(async key => {
    const db = await import('/db.js'); const state = await db.getState();
    return (state.highlights?.[key]?.ranges || []).map(r => r.color);
  }, osis)).toEqual(expected);
}

async function selectWords(page, verse, words) {
  await page.locator(`#v${verse}`).evaluate((el, words) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest('sup, [data-footnote]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    const text = nodes.map(n => n.data).join(''); const start = text.indexOf(words), end = start + words.length;
    if (start < 0) throw new Error('Selected words absent from verse');
    const range = document.createRange(); let offset = 0;
    for (const node of nodes) {
      if (start >= offset && start < offset + node.length) range.setStart(node, start - offset);
      if (end > offset && end <= offset + node.length) { range.setEnd(node, end - offset); break; }
      offset += node.length;
    }
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
  }, words);
}

test.describe('Bible reader', () => {
  test('slow Scripture loading cannot overwrite a newer destination', async ({ page }) => {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/data/corpus.txt', async route => { await gate; await route.continue(); });
    await page.goto('/home');
    await expect(page.locator('main h1')).toBeVisible();
    await page.locator('nav.primary a[href="/bible"]').click();
    await page.locator('.profile-link').click();
    await expect(page.locator('#you.profile-screen__section')).toBeVisible();
    release();
    await page.waitForResponse('**/data/corpus.txt');
    await expect(page.locator('#notes.profile-screen__section')).toBeVisible();
    await expect(page.locator('main [data-reader]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/profile$/);
  });
  test('a rapid whole-verse action supersedes an earlier phrase repaint', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await selectWords(page, 2, 'formless and void');
    await page.evaluate(() => {
      document.querySelector('[data-action="underline"]').click();
      getSelection().removeAllRanges();
      document.dispatchEvent(new Event('selectionchange'));
      const verse = document.querySelector('#v2'); verse.click(); verse.click();
      document.querySelector('[data-color="green"]').click();
    });
    await expect.poll(() => page.evaluate(async () => (await (await import('/db.js')).getState()).highlights?.['Gen.1.2']?.color)).toBe('green');
    await expect(page.locator('#v2')).toHaveClass(/ui-highlight-green/);
    await expect(page.locator('#v2 [data-mark-underline="true"]')).toHaveText(['formless and void']);
    await page.reload();
    await expect(page.locator('#v2')).toHaveClass(/ui-highlight-green/);
  });
  test('a pending reader mount cannot replace the profile after navigation', async ({ page }) => {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/data/bsb-annotations/1.json', async route => { await gate; await route.continue(); });
    const request = page.waitForRequest('**/data/bsb-annotations/1.json');
    await page.goto('/bible?book=1&chapter=1');
    await request;
    await page.locator('.profile-link').click();
    await expect(page.locator('#notes.profile-screen__section')).toBeVisible();
    const response = page.waitForResponse('**/data/bsb-annotations/1.json');
    release(); await response;
    await expect(page.locator('#notes.profile-screen__section')).toBeVisible();
    await expect(page.locator('main [data-reader]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/profile$/);
  });
  test('rapid phrase markings on different verses both appear without reloading', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await expect(page.locator('#v3')).toBeVisible();
    await page.evaluate(() => {
      function pick(number, words) {
        const verse = document.querySelector(`#v${number}`);
        const node = [...verse.childNodes].find(n => n.nodeType === Node.TEXT_NODE && n.data.includes(words));
        const start = node.data.indexOf(words), range = document.createRange();
        range.setStart(node, start); range.setEnd(node, start + words.length);
        const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
        document.dispatchEvent(new Event('selectionchange'));
      }
      pick(2, 'formless and void'); document.querySelector('[data-action="underline"]').click();
      pick(3, 'Let there be light'); document.querySelector('[data-action="underline"]').click();
    });
    await expect(page.locator('#v2 [data-mark-underline="true"]')).toHaveText(['formless and void']);
    await expect(page.locator('#v3 [data-mark-underline="true"]')).toHaveText(['Let there be light']);
    await page.reload();
    await expect(page.locator('#v2 [data-mark-underline="true"]')).toHaveText(['formless and void']);
    await expect(page.locator('#v3 [data-mark-underline="true"]')).toHaveText(['Let there be light']);
  });
  test('dragging over words opens their marking controls', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    const box = await page.locator('#v1').evaluate(el => {
      const node = [...el.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
      const start = node.data.indexOf('God created'), range = document.createRange();
      range.setStart(node, start); range.setEnd(node, start + 'God created'.length);
      const b = range.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height };
    });
    await page.mouse.move(box.x + 0.1, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 0.1, box.y + box.height / 2, { steps: 12 });
    await page.mouse.up();
    await page.getByRole('button', { name: 'Highlight green', exact: true }).click();
    await expect(page.locator('#v1 [data-mark-color="green"]')).toHaveText(['God created']);
  });
  test('selected words highlight without changing the rest of the verse and survive reload', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await selectWords(page, 2, 'formless and void');
    await page.getByRole('button', { name: 'Highlight yellow', exact: true }).click();
    const marks = page.locator('#v2 [data-text-mark][data-mark-color="yellow"]');
    await expect(marks).toHaveText(['formless and void']);
    await expect(page.locator('#v2')).not.toHaveClass(/ui-highlight-yellow/);
    await page.getByRole('button', { name: 'Underline selected text' }).click();
    await expect(page.locator('#v2 [data-mark-underline="true"]')).toHaveText(['formless and void']);
    await page.getByRole('button', { name: 'Highlight green', exact: true }).click();
    await expect(page.locator('#v2 [data-mark-color="green"]')).toHaveText(['formless and void']);
    await savedColors(page, 'Gen.1.2', ['green']);
    await page.getByRole('button', { name: 'Highlight yellow', exact: true }).click();
    await savedColors(page, 'Gen.1.2', ['yellow']);
    await page.reload();
    await expect(marks).toHaveText(['formless and void']);
    await selectWords(page, 2, 'formless and void');
    await page.locator('[data-highlight-clear]').click();
    await expect(marks).toHaveCount(0);
    await savedColors(page, 'Gen.1.2', []);
    await page.reload();
    await expect(marks).toHaveCount(0);
  });

  test('underline and overlapping color changes preserve unselected words and footnotes', async ({ page }) => {
    await page.goto('/bible?book=43&chapter=3');
    await selectWords(page, 16, 'God so loved the world');
    await page.getByRole('button', { name: 'Underline selected text' }).click();
    await expect(page.locator('#v16 [data-mark-underline="true"]')).toHaveText(['God so loved the world']);
    await selectWords(page, 16, 'loved the world');
    await page.getByRole('button', { name: 'Highlight rose', exact: true }).click();
    await expect(page.locator('#v16 [data-mark-color="rose"]')).toHaveText(['loved the world']);
    expect(await page.locator('#v16 [data-mark-underline="true"]').allTextContents()).toEqual(['God so ', 'loved the world']);
    await page.locator('#v16 [data-footnote]').click();
    await expect(page.locator('[data-reader-fn-pop]')).toContainText('only begotten');
    await page.reload();
    await expect(page.locator('#v16 [data-mark-color="rose"]')).toHaveText(['loved the world']);
    await selectWords(page, 16, 'loved the world');
    await page.getByRole('button', { name: 'Underline selected text' }).click();
    await expect(page.locator('#v16 [data-mark-underline="true"]')).toHaveText(['God so ']);
    await expect(page.locator('#v16 [data-mark-color="rose"]')).toHaveText(['loved the world']);
  });

  test('partial removal from a whole-verse highlight preserves the surrounding highlight', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await page.locator('#v2').click();
    await page.getByRole('button', { name: 'Highlight yellow', exact: true }).click();
    await selectWords(page, 2, 'formless and void');
    await page.locator('[data-highlight-clear]').click();
    await expect(page.locator('#v2 [data-mark-color="yellow"]')).toHaveCount(2);
    expect((await page.locator('#v2 [data-mark-color="yellow"]').allTextContents()).join('')).not.toContain('formless and void');
    await page.reload();
    await expect(page.locator('#v2 [data-mark-color="yellow"]')).toHaveCount(2);
  });

  test('a native selection crossing two verses saves both text ranges', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await expect(page.locator('#v2')).toBeVisible();
    await page.evaluate(() => {
      const from = document.querySelector('#v1'), to = document.querySelector('#v2');
      const start = [...from.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
      const end = [...to.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
      const range = document.createRange(); range.setStart(start, start.data.indexOf('God')); range.setEnd(end, end.data.indexOf('formless'));
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range); document.dispatchEvent(new Event('selectionchange'));
    });
    await page.getByRole('button', { name: 'Highlight blue', exact: true }).click();
    await expect(page.locator('#v1 [data-mark-color="blue"]')).toContainText('God created');
    await expect(page.locator('#v2 [data-mark-color="blue"]')).toContainText('Now the earth was');
    await page.reload();
    await expect(page.locator('#v1 [data-mark-color="blue"]')).toContainText('God created');
    await expect(page.locator('#v2 [data-mark-color="blue"]')).toContainText('Now the earth was');
  });
  test('saving a note and a highlight concurrently preserves both', async ({ page }) => {
    await page.goto('/bible?book=43&chapter=3&start=16');
    await page.locator('[data-reader-notes] [data-note-text]').fill('Concurrent note');
    await page.evaluate(() => {
      document.querySelector('[data-save-note]').click();
      document.querySelector('[data-reader-actions] [data-color="yellow"]').click();
    });
    await expect(page.locator('[data-saved-note]')).toContainText('Concurrent note');
    await expect.poll(() => page.evaluate(async () => {
      const { getState } = await import('/db.js'); const state = await getState();
      return { note: Object.values(state.notes).some(n => n.text === 'Concurrent note'), color: state.highlights?.['John.3.16']?.color };
    })).toEqual({ note: true, color: 'yellow' });
    await page.reload();
    await expect(page.locator('[data-saved-note]')).toContainText('Concurrent note');
    await expect(page.locator('#v16')).toHaveClass(/ui-highlight-yellow/);
  });

  test('full navigation labels and utility controls do not overlap at intermediate widths', async ({ page }) => {
    for (const width of [390, 641, 841, 960, 961, 1100, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/profile#notes');
      await expect(page.locator('.masthead')).toBeVisible();
      expect(await page.evaluate(() => {
        const boxes = [...document.querySelectorAll('.masthead nav.primary a, .masthead-tools')].map(el => el.getBoundingClientRect());
        return boxes.every((a, i) => a.left >= 0 && a.right <= innerWidth && boxes.slice(i + 1).every(b => a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom));
      })).toBe(true);
    }
  });
  test('the chapter heading stays fixed while the passage scrolls inside the viewport', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=119');
    const heading = page.locator('.reader-title-heading');
    const before = await heading.boundingBox();
    await page.locator('[data-reader-scroll]').evaluate(el => { el.scrollTop = el.scrollHeight; });
    const after = await heading.boundingBox();
    expect(after.y).toBe(before.y);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(page.viewportSize().height);
    await expect(page.locator('.site-footer')).toBeHidden();
  });
  test('notes keep multiple entries per verse, ordered by verse then creation time, and support edit and delete', async ({ page }) => {
    await page.goto('/bible?book=43&chapter=3&start=16');
    const mount = page.locator('[data-reader-notes]');
    const add = async text => {
      await mount.locator('[data-note-text]').fill(text);
      await mount.getByRole('button', { name: 'Add a note', exact: true }).click();
      await expect(mount.locator('[data-note-status]')).toHaveText('Saved');
    };
    await add('First note on verse sixteen');
    await add('Second note on verse sixteen');
    await page.locator('#v4').click();
    await expect(mount.locator('.study-notes__anchor')).toContainText('3:4');
    await add('Note on verse four');
    const texts = mount.locator('[data-saved-note] > p');
    await expect(texts).toHaveText(['Note on verse four', 'First note on verse sixteen', 'Second note on verse sixteen']);
    await mount.locator('[data-edit-note]').nth(1).click();
    await mount.locator('[data-note-text]').fill('Edited note on verse sixteen');
    await mount.getByRole('button', { name: 'Save changes' }).click();
    await expect(texts).toHaveText(['Note on verse four', 'Edited note on verse sixteen', 'Second note on verse sixteen']);
    await mount.locator('[data-delete-note]').last().click();
    await expect(texts).toHaveCount(2);
    await page.reload();
    await expect(texts).toHaveText(['Note on verse four', 'Edited note on verse sixteen']);
    await expect(mount.getByRole('button', { name: /Ask the Theologian/ })).toHaveCount(0);
    await expect(page.locator('[data-reader-actions] [data-action="copy"]')).toHaveCount(0);
    await mount.locator('.study-notes__all').click();
    await expect(page.locator('[data-my-notes]')).toContainText('Edited note on verse sixteen');
  });

  test('legacy notes remain readable and editable without changing their anchor', async ({ page }) => {
    await page.goto('/bible?book=43&chapter=3&start=4');
    // Seed only after the reader has mounted: the app's own startup writes would otherwise overwrite the seeded note.
    await expect(page.locator('[data-reader]')).toBeVisible();
    await page.evaluate(async () => {
      const db = await import('/db.js'); const state = await db.getState();
      state.notes = { 'scripture:John.3.4': { text: 'Existing note', label: 'John 3:4', updatedAt: '2026-10-01T10:00:00Z', discussLater: true } };
      await db.putState(state);
    });
    await page.reload();
    const note = page.locator('[data-saved-note="scripture:John.3.4"]');
    await expect(note).toContainText('Existing note');
    await note.getByRole('button', { name: 'Edit note on John 3:4' }).click();
    await page.locator('[data-reader-notes] [data-note-text]').fill('Updated existing note');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(note).toContainText('Updated existing note');
  });
  test('chapter continuation is available before the full footnotes', async ({ page }) => {
    await page.goto('/bible?book=43&chapter=3');
    await expect(page.locator('[data-reader]')).toBeVisible();
    const order = await page.getByRole('navigation', { name: 'Chapters', exact: true }).evaluate(nav => {
      const notes = document.querySelector('[aria-labelledby="reader-footnotes-title"]');
      return Boolean(nav.compareDocumentPosition(notes) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(order).toBe(true);
  });

  test('source shorthand and quotation boundaries are explained in full notes and popups', async ({ page }) => {
    await page.goto('/bible?book=43&chapter=3');
    const notes = page.locator('[aria-labelledby="reader-footnotes-title"]');
    await expect(notes).toContainText('Textus Receptus');
    await expect(notes).toContainText('Byzantine');
    await expect(notes).not.toContainText('TR and');
    await expect(notes).toContainText('narrator');
    await page.locator('#v25 [data-footnote]').click();
    await expect(page.locator('[data-reader-fn-pop]')).toContainText('Textus Receptus');
    await expect(page.locator('[data-reader-fn-pop]')).toContainText('and the Jews');
  });
  test('shows BSB section headings and the chapter text',{tag:'@smoke'}, async ({ page }) => {
    await page.goto('/bible?book=43&chapter=3');
    const reader = page.locator('[data-reader]');
    await expect(reader.getByRole('heading', { level: 2 }).first()).toBeVisible();
    await expect(reader.locator('#v16')).toContainText('For God so loved the world');
    await expect(page.locator('.reader-title-heading')).toHaveText('John 3');
  });

  test('footnote badges open their note and are listed at the end of the chapter', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=23');
    const badge = page.locator('[data-footnote]').first();
    await badge.click();
    const pop = page.locator('[data-reader-fn-pop]');
    await expect(pop).toBeVisible();
    await expect(pop).toContainText('Revelation 7:17');
    await expect(badge).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.reader-footnote')).toHaveCount(3);
    await page.keyboard.press('Escape');
    await expect(pop).toBeHidden();
  });

  test('a footnote badge opens from the keyboard without selecting its verse', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=23');
    const badge = page.locator('[data-footnote]').first();
    await badge.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-reader-fn-pop]')).toBeVisible();
    await expect(badge).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-reader] [aria-pressed="true"]')).toHaveCount(0);
  });

  test('a single psalm is labelled "Psalm"', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=23');
    await expect(page.locator('.reader-title-heading')).toHaveText('Psalm 23');
  });

  test('Psalm acrostic headings display Hebrew characters', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=119');
    await expect(page.getByRole('heading', { name: 'נ', exact: true })).toBeAttached();
    await expect(page.locator('[data-reader-text]')).not.toContainText('&#1504;');
  });

  test('legacy lesson focus still fills the viewport after stylesheet layering', async ({ page }) => {
    await page.goto('/course?unit=c1.christianity&lesson=begin');
    await expect(page.locator('body')).toHaveClass(/study-focus-active/);
    const frame = await page.locator('#main').boundingBox();
    expect(frame.x).toBe(0);
    expect(frame.y).toBe(0);
    expect(frame.width).toBe(page.viewportSize().width);
    expect(frame.height).toBe(page.viewportSize().height);
  });

  test('highlights persist across reloads and can be removed',{tag:'@smoke'}, async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await page.locator('#v2').click();
    await page.locator('[data-reader-actions] [data-color="green"]').click();
    await expect(page.locator('#v2')).toHaveClass(/ui-highlight-green/);
    await expect(page.locator('#reader-rail-highlights .ui-rail-count')).toHaveText('1');
    await page.reload();
    await expect(page.locator('#v2')).toHaveClass(/ui-highlight-green/);
    await page.locator('[data-highlight-clear]').click();
    await expect(page.locator('#v2')).not.toHaveClass(/ui-highlight-/);
    await page.reload();
    await expect(page.locator('#v2')).not.toHaveClass(/ui-highlight-/);
  });

  test('every verse in a highlighted range persists and can be cleared', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1&start=2&end=4');
    await page.locator('[data-reader-actions] [data-color="green"]').click();
    await expect.poll(() => page.evaluate(async () => {
      const { getState } = await import('/db.js');
      const state = await getState();
      return [2, 3, 4].map(n => state.highlights?.[`Gen.1.${n}`]?.color);
    })).toEqual(['green', 'green', 'green']);
    await page.reload();
    for (const n of [2, 3, 4]) await expect(page.locator(`#v${n}`)).toHaveClass(/ui-highlight-green/);
    await page.locator('[data-highlight-clear]').click();
    await expect.poll(() => page.evaluate(async () => {
      const { getState } = await import('/db.js');
      const state = await getState();
      return [2, 3, 4].map(n => state.highlights?.[`Gen.1.${n}`]?.color);
    })).toEqual([null, null, null]);
  });

  test('shared passage context preserves a selected range and reference-search address', async ({ page }) => {
    await page.goto('/bible?q=John%203%3A16-18');
    await expect(page.locator('#v18')).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(async () => (await import('/screen-context.js')).currentPassage()?.osis)).toBe('John.3.16-18');
    await page.locator('#v16').click();
    await page.locator('#v18').click({ modifiers: ['Shift'] });
    expect(await page.evaluate(async () => (await import('/screen-context.js')).currentPassage()?.osis)).toBe('John.3.16-18');
  });

  test('verses can be selected from the keyboard', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await page.locator('#v3').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#v3')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-notes-title]')).toHaveText('My notes on 1:3');
    await page.keyboard.press('Escape');
    await expect(page.locator('#v3')).toHaveAttribute('aria-pressed', 'false');
  });

  test('study links switch the side panel without leaving the chapter', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await page.locator('#reader-rail-context').click();
    await expect(page.locator('[data-reader-panel] .reader-panel-eyebrow')).toHaveText('Context');
    await expect(page).toHaveURL(/panel=context/);
    await page.locator('#reader-rail-people').click();
    await expect(page.locator('[data-reader-panel]')).not.toBeEmpty();
  });

  test('chapter steps and the book picker move between chapters', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=50');
    await page.locator('.reader-steps a[aria-label^="Next chapter"]').click();
    await expect(page).toHaveURL(/book=2&chapter=1/);
    await expect(page.locator('.reader-title-heading')).toHaveText('Exodus 1');
    await page.locator('.reader-toolbar [data-reader-picker] summary').click();
    await page.locator('.reader-toolbar [data-reader-book]').selectOption('43');
    await page.locator('.reader-toolbar [data-reader-chapters] a', { hasText: /^3$/ }).click();
    await expect(page.locator('.reader-title-heading')).toHaveText('John 3');
  });

  test('a reference search opens the reader at that passage', async ({ page }) => {
    await page.goto('/bible?q=John%203%3A16');
    await expect(page.locator('[data-reader]')).toBeVisible();
    await expect(page.locator('#v16')).toHaveAttribute('aria-pressed', 'true');
  });

  test('the Timeline and Book overview are their own screen, not the reader', async ({ page }) => {
    await page.goto('/bible?view=timeline');
    await expect(page.locator('[data-reader]')).toHaveCount(0);
    await expect(page.locator('.timeline-era').first()).toBeVisible();
    await page.goto('/bible?book=43&profile=1');
    await expect(page.locator('[data-reader]')).toHaveCount(0);
    await expect(page.locator('[data-book-screen]')).toBeVisible();
  });
});

test.describe('Bible reader on a phone', () => {
  test('native touch selection exposes marking controls without horizontal overflow', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await selectWords(page, 2, 'formless and void');
    await page.getByRole('button', { name: 'Underline selected text' }).tap();
    await expect(page.locator('#v2 [data-mark-underline="true"]')).toHaveText(['formless and void']);
    const box = await page.locator('[data-reader-actions]').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
  });
  test('Notes and Theologian share tab sizing and the chat stays above the notes drawer', async ({ page }) => {
    await page.goto('/bible?book=43&chapter=3&start=4');
    const notes = page.locator('#reader-notes-tab'), theo = page.locator('#guide-open');
    await expect(theo).toBeEnabled();
    const nb = await notes.boundingBox(), tb = await theo.boundingBox();
    expect(nb.width).toBe(tb.width);
    expect(nb.height).toBe(tb.height);
    expect(await theo.evaluate(el => {
      const probe = document.createElement('span'); probe.style.color = 'var(--color-edge-theologian)'; document.body.append(probe);
      const match = getComputedStyle(el).backgroundColor === getComputedStyle(probe).color; probe.remove(); return match;
    })).toBe(true);
    await notes.click();
    await expect(page.locator('[data-reader-aside]')).toHaveAttribute('data-sheet', 'notes');
    await expect(page.locator('[data-sheet-close]')).toBeFocused();
    expect(await page.locator('[data-reader-aside]').evaluate(el => getComputedStyle(el).animationName)).toBe('reader-drawer-in');
    await theo.click();
    await expect(page.locator('#guide')).toHaveAttribute('data-open', 'true');
    await expect(theo).toBeVisible();
    expect(await page.locator('#guide').evaluate(el => {
      const box = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
    })).toBe(true);
    await page.locator('#guide-close').click();
    await expect(page.locator('[data-reader-aside]')).toHaveAttribute('data-sheet', 'notes');
  });
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('adapts to different phone widths without horizontal scrolling', async ({ page }) => {
    for (const width of [320, 428]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/bible?book=1&chapter=1');
      await expect(page.locator('[data-reader]')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      const tools = page.locator('[data-phone-tool]');
      await expect(tools).toHaveCount(6);
      for (const tool of await tools.all()) await expect(tool).toBeInViewport();
    }
  });

  test('opening a distant verse keeps navigation visible and scrolls the chapter', async ({ page }) => {
    await page.goto('/bible?book=19&chapter=119&start=105');
    await expect(page.locator('#v105')).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator('.reader-phone-tools')).toBeInViewport();
    await expect(page.locator('#v105')).toBeInViewport();
    expect(await page.locator('[data-reader-scroll]').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  });

  test('has no horizontal scroll and opens My Notes from its edge tab',{tag:'@smoke'}, async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await expect(page.locator('[data-reader]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await expect(page.locator('.reader-rail-wrap')).toBeHidden();
    await expect(page.locator('.reader-phone-tools')).toBeVisible();
    await page.locator('#v2').click();
    const tab = page.locator('#reader-notes-tab');
    await tab.click();
    const sheet = page.locator('[data-reader-aside]');
    await expect(sheet).toHaveAttribute('data-sheet', 'notes');
    await expect(sheet.locator('[data-notes-title]')).toHaveText('My notes on 1:2');
    await expect(tab).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveAttribute('data-sheet', 'none');
    await expect(tab).toBeVisible();
  });

  test('the study icon row opens its panel as a sheet', async ({ page }) => {
    await page.goto('/bible?book=1&chapter=1');
    await page.locator('[data-phone-tool="themes"]').click();
    const sheet = page.locator('[data-reader-aside]');
    await expect(sheet).toHaveAttribute('data-sheet', 'study');
    await expect(sheet.locator('[data-reader-panel]')).not.toBeEmpty();
  });
});
