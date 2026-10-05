import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';

const catalog = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
const normalize = text => String(text).replace(/\s+/g, ' ').trim();
const removedTerms = new Set(Object.keys(JSON.parse(readFileSync('content/pathway/glossary-removed.json', 'utf8')).removed).map(term => term.toLowerCase()));

test('all authored source paragraphs, sections, checks, and apparatus survive compilation', () => {
  for (const name of readdirSync('content/pathway/lessons').filter(n => n.endsWith('.md'))) {
    const source = readFileSync(`content/pathway/lessons/${name}`, 'utf8');
    const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    expect(match, name).not.toBeNull();
    const metadata = JSON.parse(match[1]);
    const lesson = catalog.lessons.find(l => l.id === metadata.id);
    expect(lesson, metadata.id).toBeTruthy();
    for (const field of ['title', 'objective', 'deeper', 'drawers']) {
      if (metadata[field] !== undefined) expect(lesson[field], `${metadata.id}: ${field}`).toEqual(metadata[field]);
    }
    expect(lesson.vocab, `${metadata.id}: retained glossary`).toEqual(Object.fromEntries(Object.entries(metadata.glossary || {}).filter(([term]) => !removedTerms.has(term.toLowerCase()))));
    const body = match[2];
    const headings = [...body.matchAll(/^## (.+?) \{#([^}]+)\}$/gm)];
    expect(lesson.sections.map(s => s.id), metadata.id).toEqual(headings.map(h => h[2]));
    const actual = normalize(JSON.stringify(lesson));
    const prose = body.replace(/```[\s\S]*?```/g, '').replace(/^## .+$/gm, '').replace(/^::.+$/gm, '');
    for (const paragraph of prose.split(/\n\s*\n/).map(p => normalize(p.replace(/^> /gm, ''))).filter(Boolean)) {
      expect(actual, `${metadata.id}: ${paragraph.slice(0, 65)}`).toContain(normalize(JSON.stringify(paragraph).slice(1, -1)));
    }
    const checks = [...body.matchAll(/```check\s*\n([\s\S]*?)```/g)].map(m => JSON.parse(m[1]));
    expect(lesson.challenges, `${metadata.id}: scored checks`).toHaveLength(checks.length);
    checks.forEach((check, index) => expect(lesson.challenges[index], `${metadata.id}: check ${index}`).toMatchObject(check));
    const reflection = body.match(/```reflect\s*\n([\s\S]*?)```/);
    if (reflection) {
      const sourceReflection = JSON.parse(reflection[1]);
      expect(lesson.reflect, `${metadata.id}: reflection`).toBe(sourceReflection.prompt);
      expect(lesson.model, `${metadata.id}: model response`).toBe(sourceReflection.modelResponse || '');
    }
  }
});

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
test(`every catalog lesson preserves original prose and checks in the mounted screen at ${viewport.width}px`, async ({ page }) => {
  test.setTimeout(300000);
  await page.setViewportSize(viewport);
  await page.goto('/course?unit=c1.christianity&lesson=begin');
  await expect(page.locator('[data-lesson-screen]')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(async () => {
    const data = window.CANON_CATALOG;
    const corpus = await (await fetch('/data/corpus.txt')).text();
    const screen = await import('/ui/screens/lesson.js');
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const normalize = text => String(text).replace(/\s+/g, ' ').trim();
    const missing = [], overflow = [], ids = [], context = [];
    const container = document.querySelector('#main');
    for (const lesson of data.lessons) {
      let count = 1;
      const expected = lesson.sections?.flatMap(s => s.blocks.filter(b => b.type === 'prose' || b.type === 'callout').map(b => b.text)) || [...(lesson.body || []), ...(lesson.simple ? [lesson.simple] : [])];
      let text = '', checkIndexes = [];
      for (let scene = 1; scene <= count; scene++) {
        const cleanup = await screen.mount(container, { data, corpus, state: { completed: [] }, params: new URLSearchParams({ lesson: lesson.id, unit: lesson.unitId || lesson.v6Unit || '', scene: String(scene) }), esc, navigate: () => {}, isCurrent: () => true });
        count = container.querySelectorAll('.ui-step-list-link').length;
        text += ' ' + container.querySelector('.lesson-primary-content').textContent;
        checkIndexes.push(...[...container.querySelectorAll('.challenge')].map(f => Number(f.dataset.index)));
        const pacing = container.querySelector('.lesson-part-status').textContent;
        const parts = Number(pacing.match(/part \d+ of (\d+)/)?.[1] || 1);
        for (let part = 1; part <= parts; part++) {
          const viewport = container.querySelector('.lesson-primary-window');
          const rect = viewport.getBoundingClientRect();
          const content = container.querySelector('.lesson-primary-content').getBoundingClientRect();
          if (viewport.scrollHeight > viewport.clientHeight + 1 || viewport.scrollWidth > viewport.clientWidth + 1 || content.bottom > rect.bottom + 1 || rect.bottom > innerHeight) overflow.push(`${lesson.id} scene${scene} part${part}: ${viewport.scrollHeight}/${viewport.clientHeight}`);
          for (const node of container.querySelectorAll('.lesson-primary-content *')) {
            if (!node.getClientRects().length || node.closest('[hidden]')) continue;
            const style = getComputedStyle(node);
            if (/^(auto|scroll|hidden|clip)$/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) overflow.push(`${lesson.id} scene${scene} part${part}: nested ${node.className} scroll/clipping ${node.scrollHeight}/${node.clientHeight}`);
            if (/^(auto|scroll|hidden|clip)$/.test(style.overflowX) && node.scrollWidth > node.clientWidth + 1) overflow.push(`${lesson.id} scene${scene} part${part}: nested ${node.className} horizontal clipping`);
            if (node.matches('p,label,legend,button,textarea,img')) {
              const bounds = node.getBoundingClientRect();
              for (let ancestor = node.parentElement; ancestor && ancestor !== container; ancestor = ancestor.parentElement) {
                const clip = getComputedStyle(ancestor), box = ancestor.getBoundingClientRect();
                if (/^(auto|scroll|hidden|clip)$/.test(clip.overflowY) && (bounds.bottom > box.bottom + 1 || bounds.top < box.top - 1)) overflow.push(`${lesson.id} scene${scene} part${part}: ${node.className || node.tagName} clipped by ${ancestor.className}`);
                if (/^(auto|scroll|hidden|clip)$/.test(clip.overflowX) && (bounds.right > box.right + 1 || bounds.left < box.left - 1)) overflow.push(`${lesson.id} scene${scene} part${part}: ${node.className || node.tagName} clipped horizontally by ${ancestor.className}`);
              }
            }
          }
          for (const fieldset of container.querySelectorAll('.lesson-primary-content fieldset')) {
            const visibleControl = [...fieldset.querySelectorAll('input:not([type=hidden])')].some(input => input.getClientRects().length && !input.closest('[hidden]'));
            if (visibleControl && !fieldset.querySelector('legend')?.getClientRects().length) context.push(`${lesson.id} scene${scene} part${part}: hidden legend`);
          }
          for (const form of container.querySelectorAll('.lesson-primary-content form.challenge')) {
            const visibleAnswer = [...form.querySelectorAll('input:not([type=hidden]),textarea')].some(input => input.getClientRects().length && !input.closest('[hidden]'));
            const prompt = form.querySelector('.challenge-prompt');
            if (visibleAnswer && (!prompt?.getClientRects().length || prompt.closest('[hidden]'))) context.push(`${lesson.id} scene${scene} part${part}: hidden question stem`);
          }
          if (part < parts) container.querySelector('.ui-lesson-continue-btn').click();
        }
        const allIds = [...container.querySelectorAll('[id]')].map(n => n.id);
        if (new Set(allIds).size !== allIds.length) ids.push(`${lesson.id} scene${scene}`);
        cleanup?.();
      }
      for (const paragraph of expected) if (!normalize(text).includes(normalize(paragraph))) missing.push(`${lesson.id}: ${paragraph.slice(0, 70)}`);
      const indices = (lesson.challenges || []).map((_, i) => i);
      if (JSON.stringify(checkIndexes.sort((a,b)=>a-b)) !== JSON.stringify(indices)) missing.push(`${lesson.id}: challenge indices ${checkIndexes}`);
    }
    return { lessons: data.lessons.length, missing, overflow, ids, context };
  });
  expect(result.lessons).toBe(catalog.lessons.length);
  expect(result.missing, 'authored learner content').toEqual([]);
  expect(result.ids, 'unique assessment/anchor IDs').toEqual([]);
  expect(result.overflow, 'primary lesson content must fit every part without nested scrolling').toEqual([]);
  expect(result.context, 'visible answer controls retain their question legend').toEqual([]);
});
}

test.describe('Lesson window', () => {
  test('malformed source-step addresses render a valid step without crashing', async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const lesson = catalog.lessons.find(l => l.id === 'begin');
    for (const value of ['1.5', 'NaN', 'Infinity', '-3', '0', '999']) {
      await page.goto(`/course?unit=c1.christianity&lesson=begin&scene=${value}`);
      await expect(page.locator('[data-lesson-screen]')).toBeVisible();
      const expected = value === '999' ? lesson.sections.at(-1).title : lesson.sections[0].title;
      await expect(page.locator('.lesson-content-heading h1')).toHaveText(expected);
    }
    expect(errors).toEqual([]);
  });

  test('closing a lesson returns to its expanded unit, scrolled pane, and original activity focus', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/path');
    await expect(page.locator('[data-learning-path]')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const unitId = catalog.byCourse[catalog.courses[0].id][1];
    const unit = page.locator(`[data-path-unit="${unitId}"]`);
    await unit.locator(':scope > summary').click();
    await expect(unit).toHaveAttribute('open', '');
    await expect(page).toHaveURL(new RegExp(`unit=${unitId.replace('.', '\\.')}`));
    const activity = unit.locator('[data-activity-link^="lesson:"]').last();
    await activity.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const pane = page.locator('[data-study-return-scroll="units"]');
    const scrollTop = await pane.evaluate(node => node.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);
    const origin = page.url(), id = await activity.getAttribute('data-activity-link');
    await page.evaluate(() => { window.__LESSON_RETURN_DOCUMENT__ = true; });
    await activity.click();
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
    await page.locator('.ui-lesson-close-btn').click();
    await expect(page).toHaveURL(origin);
    await expect(unit).toHaveAttribute('open', '');
    await expect(page.locator(`[data-path-unit="${unitId}"] [data-activity-link="${id}"]`)).toBeFocused();
    await expect.poll(async () => Math.abs(await pane.evaluate(node => node.scrollTop) - scrollTop)).toBeLessThanOrEqual(2);
    expect(await page.evaluate(() => window.__LESSON_RETURN_DOCUMENT__)).toBe(true);
  });

  test('portrait tablet rotation advice is dismissible and never blocks the lesson', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/course?unit=c1.christianity&lesson=begin');
    await expect(page.locator('.lesson-rotate-hint')).toBeVisible();
    await expect(page.locator('.ui-lesson-continue-btn')).toBeEnabled();
    await page.locator('[data-dismiss-rotate]').click();
    await expect(page.locator('.lesson-rotate-hint')).toBeHidden();
    await page.setViewportSize({ width: 841, height: 1024 });
    await expect(page.locator('.lesson-rotate-hint')).toBeHidden();
    await page.reload();
    await expect(page.locator('.lesson-rotate-hint')).toBeHidden();
    await expect(page.locator('.ui-lesson-continue-btn')).toBeEnabled();
  });

  test('checkpoint scoring preserves the inherited mastery ID through reload', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/course?unit=c1.christianity&mastery=n.what');
    const form = page.locator('form[data-activity="mastery:n.what"]');
    await expect(form).toHaveCount(1);
    const answer = page.locator('input[name=choice][value="1"]');
    for (let i = 0; i < 30 && !await answer.isVisible(); i++) await page.locator('.ui-lesson-continue-btn').click();
    await answer.locator('..').click();
    await expect(answer).toBeChecked();
    for (let i = 0; i < 30 && !await form.locator('button[type=submit]').isVisible(); i++) await page.locator('.ui-lesson-continue-btn').click();
    await form.locator('button[type=submit]').click();
    await expect.poll(() => page.evaluate(async () => (await (await import('/db.js')).getState()).mastery['mastery:n.what']?.passed)).toBe(true);
    await page.reload();
    expect(await page.evaluate(async () => (await (await import('/db.js')).getState()).completed.includes('mastery:n.what'))).toBe(true);
  });

  test('authored lesson accessibility retains landmarks, control names, and readable actions', async ({ page }) => {
    await page.goto('/course?unit=c1.christianity&lesson=begin&scene=3');
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious').map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  });

  test('all authored checks score original answers and only together complete the stable lesson ID', async ({ page }) => {
    test.slow();
    const lesson = catalog.lessons.find(l => l.id === 'begin');
    for (let index = 0; index < lesson.challenges.length; index++) {
      const scene = lesson.sections.findIndex(s => s.blocks.some(b => b.type === 'check' && b.index === index)) + 1;
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/course?unit=c1.christianity&lesson=begin&scene=${scene}`);
      const form = page.locator(`form.challenge[data-index="${index}"]`);
      await expect(form).toHaveCount(1);
      await form.evaluate((form, challenge) => {
        if (challenge.kind === 'sequence') {
          const board = form.querySelector('[data-sequence-board]');
          const cards = [...board.children];
          for (const value of challenge.answer) board.append(cards[value]);
          [...board.children].forEach((card, position) => {
            const input = card.querySelector('input'); input.name = `p${position}`; input.value = card.dataset.seqValue;
          });
        } else if (challenge.kind === 'evidence') {
          for (const input of form.querySelectorAll('input[name=pick]')) input.checked = challenge.answer.includes(Number(input.value));
        } else {
          challenge.answer.forEach((value, i) => { form.querySelector(`input[name="p${i}"][value="${value}"]`).checked = true; });
        }
        form.dispatchEvent(new Event('change', { bubbles: true }));
      }, lesson.challenges[index]);
      const parts = Number((await page.locator('.lesson-part-status').textContent()).match(/part \d+ of (\d+)/)[1]);
      for (let part = 1; part < parts && !await form.locator('button[type=submit]').isVisible(); part++) await page.locator('.ui-lesson-continue-btn').click();
      await form.locator('button[type=submit]').click();
      await expect.poll(() => page.evaluate(async index => (await (await import('/db.js')).getState()).challengeProgress['lesson:begin']?.challenges?.[index]?.passed, index)).toBe(true);
      const completed = await page.evaluate(async () => (await (await import('/db.js')).getState()).completed.includes('lesson:begin'));
      expect(completed).toBe(index === lesson.challenges.length - 1);
    }
    await page.reload();
    expect(await page.evaluate(async () => (await (await import('/db.js')).getState()).completed.includes('lesson:begin'))).toBe(true);
  });

  test('lesson notes autosave with their stable anchor across close, source steps, and reload', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/course?unit=c1.christianity&lesson=begin&scene=1');
    await page.locator('[data-edge-tab="notes"]').click();
    const drawer = page.locator('.lesson-notes-drawer');
    await drawer.locator('[data-note-text]').fill('Evidence and interpretation remain distinct.');
    await drawer.locator('[data-lesson-notes-close]').click();
    await page.locator('[data-edge-tab="notes"]').click();
    await expect(drawer.locator('[data-note-text]')).toHaveValue('Evidence and interpretation remain distinct.');
    await expect(drawer.locator('[data-note-status]')).toContainText('Saved');
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await page.locator('.ui-step-strip-button').click();
    await page.locator('.lesson-step-rail .ui-step-list-link').nth(1).click();
    await expect(page).toHaveURL(/scene=2/);
    await page.locator('[data-edge-tab="notes"]').click();
    await expect(drawer.locator('[data-note-text]')).toHaveValue('Evidence and interpretation remain distinct.');
    await page.reload();
    await page.locator('[data-edge-tab="notes"]').click();
    await expect(drawer.locator('[data-note-text]')).toHaveValue('Evidence and interpretation remain distinct.');
    expect(await page.evaluate(async () => (await (await import('/db.js')).getState()).notes['lesson:begin'].text)).toBe('Evidence and interpretation remain distinct.');
  });

  test('source-step history and resize preserve the current lesson and accessible pacing', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/course?unit=c1.christianity&lesson=begin&scene=2');
    await page.locator('.ui-step-strip-button').click();
    await page.locator('.lesson-step-rail .ui-step-list-link').nth(2).click();
    await expect(page).toHaveURL(/scene=3/);
    await page.goBack();
    await expect(page).toHaveURL(/scene=2/);
    await expect(page.locator('.ui-step-strip-button')).toHaveAccessibleName(/Step 2 of 8/);
    await page.goForward();
    await expect(page).toHaveURL(/scene=3/);
    await page.setViewportSize({ width: 768, height: 844 });
    await expect(page.locator('.lesson-content-heading h1')).toHaveText(catalog.lessons.find(l => l.id === 'begin').sections[2].title);
    await expect(page.locator('.ui-step-strip-button')).toHaveAccessibleName(/Step 3 of 8/);
  });

  test('phone lesson has paged content, accessible steps, and a reversible notes drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/course?unit=unit.orientation&lesson=orientation');
    await expect(page.locator('[data-lesson-screen]')).toBeVisible();
    await expect(page.locator('.lesson-notes-drawer')).toBeHidden();
    await page.locator('.ui-step-strip-button').click();
    await expect(page.locator('.lesson-step-rail')).toBeVisible();
    await page.locator('.ui-step-strip-button').click();
    await page.locator('[data-edge-tab="notes"]').click();
    await expect(page.locator('.lesson-notes-drawer')).toBeVisible();
    await page.locator('[data-lesson-notes-close]').click();
    await expect(page.locator('.lesson-notes-drawer')).toBeHidden();
    const bounds = await page.locator('.lesson-primary-window').evaluate(el => ({ height: el.clientHeight, scroll: el.scrollHeight, width: document.documentElement.scrollWidth, screen: innerWidth }));
    expect(bounds.scroll).toBeLessThanOrEqual(bounds.height + 1);
    expect(bounds.width).toBeLessThanOrEqual(bounds.screen);
  });
});
