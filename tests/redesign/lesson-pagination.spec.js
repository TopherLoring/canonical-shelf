import { test, expect } from '@playwright/test';

async function fixture(page, body, height = 170) {
  await page.route('**/phase5-fixture', route => route.fulfill({ contentType: 'text/html', body: `<style>body{margin:0}#viewport{height:${height}px;width:310px;overflow:hidden;font:18px/1.5 sans-serif}#content{display:flow-root}#content [hidden]{display:none}p{margin:0 0 12px}label{display:block;padding:10px}fieldset{margin:0;padding:4px}input{font:inherit}</style><div id="viewport"><div id="content">${body}</div></div>` }));
  await page.goto('/phase5-fixture');
  await page.evaluate(async () => {
    const { createLessonPagination } = await import('/ui/components/lesson-pagination.js');
    window.pagination = createLessonPagination({ viewport: document.querySelector('#viewport'), content: document.querySelector('#content') });
  });
}

test('pagination preserves exact prose order and inline text through resize and cleanup', async ({ page }) => {
  const first = 'Words, punctuation, and spaces must survive. '.repeat(34);
  const second = 'A second paragraph retains its separate meaning. '.repeat(18);
  await fixture(page, `<p data-source="first">${first}<em id="emphasis">An emphasized ending.</em></p><p data-source="second">${second}</p>`);
  const inspect = () => page.evaluate(() => {
    const result = { first: '', second: '', overflow: [] };
    for (let i = 0; i < pagination.state.parts; i++) {
      pagination.goTo(i);
      for (const node of document.querySelectorAll('[data-source]')) {
        if (!node.closest('[hidden]')) result[node.dataset.source] += node.textContent;
      }
      const viewport = document.querySelector('#viewport');
      if (viewport.scrollHeight > viewport.clientHeight + 1 || viewport.scrollWidth > viewport.clientWidth + 1) result.overflow.push(i);
    }
    return result;
  });
  expect(await inspect()).toEqual({ first: first + 'An emphasized ending.', second, overflow: [] });
  await page.evaluate(() => { document.querySelector('#viewport').style.width = '220px'; pagination.reflow(); });
  expect(await inspect()).toEqual({ first: first + 'An emphasized ending.', second, overflow: [] });
  expect(await page.locator('[id]').evaluateAll(nodes => new Set(nodes.map(n => n.id)).size === nodes.length)).toBe(true);
  await page.evaluate(() => pagination.destroy());
  await expect(page.locator('[data-source="first"]')).toHaveCount(1);
  await expect(page.locator('[data-source="first"]')).toHaveText(first + 'An emphasized ending.');
  await expect(page.locator('[data-source="second"]')).toHaveText(second);
});

test('hidden assessment parts keep original controls, answer values, and scoring intact', async ({ page }) => {
  await fixture(page, `<form id="assessment">${Array.from({ length: 12 }, (_, i) => `<fieldset><legend>Claim ${i + 1}</legend><label><input type="radio" name="p${i}" value="0">Unsupported inference</label><label><input type="radio" name="p${i}" value="1" checked>Supported by evidence</label></fieldset>`).join('')}</form>`);
  const result = await page.evaluate(async () => {
    const original = [...document.querySelectorAll('input')];
    const before = [...new FormData(document.querySelector('form'))];
    for (let i = 0; i < pagination.state.parts; i++) pagination.goTo(i);
    document.querySelector('#viewport').style.height = '230px'; pagination.reflow();
    const { checkChallenge } = await import('/challenge-engine.js');
    const evaluation = checkChallenge(document.querySelector('form'), { fields: Array(12).fill('Claim'), options: ['Unsupported', 'Supported'], answer: Array(12).fill(1) });
    return { parts: pagination.state.parts, before, after: [...new FormData(document.querySelector('form'))], identity: original.every(n => n.isConnected && document.querySelectorAll('input').item(original.indexOf(n)) === n), correct: evaluation.correct, overflow: pagination.state.overflow };
  });
  expect(result.parts).toBeGreaterThan(1);
  expect(result.identity).toBe(true);
  expect(result.after).toEqual(result.before);
  expect(result.correct).toBe(true);
  expect(result.overflow).toBe(false);
});

test('split answer groups keep their original question legend visible with every choice', async ({ page }) => {
  await fixture(page, `<form><fieldset><legend>Which claim follows from this observation?</legend>${Array.from({ length: 5 }, (_, i) => `<label><input type="radio" name="choice" value="${i}">Possible inference ${i}</label>`).join('')}</fieldset></form>`, 140);
  const result = await page.evaluate(() => {
    const missing = [], overflow = [];
    const legend = document.querySelector('legend');
    for (let i = 0; i < pagination.state.parts; i++) {
      pagination.goTo(i);
      const visible = node => node.getClientRects().length && !node.closest('[hidden]');
      if ([...document.querySelectorAll('input')].some(visible) && !visible(legend)) missing.push(i);
      const viewport = document.querySelector('#viewport');
      if (viewport.scrollHeight > viewport.clientHeight + 1) overflow.push(i);
    }
    return { missing, overflow, legendCount: document.querySelectorAll('legend').length };
  });
  expect(result.missing, 'answers stay attached to their question').toEqual([]);
  expect(result.overflow).toEqual([]);
  expect(result.legendCount).toBe(1);
});

test('native validation reveals the first required control with multiple invalid hidden parts', async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await fixture(page, `<form id="assessment"><p>${'Introductory teaching text. '.repeat(40)}</p><label>Required response<input id="required-response" required></label><p>${'Additional teaching text. '.repeat(30)}</p><label>Second required response<input id="second-response" required></label><button type="submit">Submit</button></form>`);
  const result = await page.evaluate(() => {
    pagination.goTo(0);
    const input = document.querySelector('#required-response');
    const wasHidden = Boolean(input.closest('[hidden]'));
    const valid = document.querySelector('form').reportValidity();
    return { wasHidden, valid, nowVisible: !input.closest('[hidden]'), part: pagination.state.part, state: pagination.state, height: document.querySelector('#viewport').clientHeight, scroll: document.querySelector('#viewport').scrollHeight };
  });
  expect(result.wasHidden, JSON.stringify(result)).toBe(true);
  expect(result.valid).toBe(false);
  expect(result.nowVisible).toBe(true);
  expect(result.part).toBeGreaterThan(1);
  expect(errors).toEqual([]);
});

test('oversized atomic controls report overflow rather than discard or clone content', async ({ page }) => {
  await fixture(page, `<label id="choice"><input type="radio" name="choice" value="1">${'An inseparable accessible answer label. '.repeat(35)}</label>`);
  expect(await page.evaluate(() => pagination.state.overflow)).toBe(true);
  await expect(page.locator('#choice')).toHaveCount(1);
  await expect(page.locator('input[name="choice"]')).toHaveCount(1);
  await expect(page.locator('#choice')).toContainText('An inseparable accessible answer label.');
});
