// Unit tests for the build-time lesson divider. Runs in Node in about a second; no browser.
//   bun scripts/test-lesson-divider.mjs
// Rules under test: curriculum.lesson.sections-divided-2026-10-05 and ui.lesson.card.break-rule-v2-2026-10-05.
import { readFileSync } from 'node:fs';
import { sentences, visible, divideLesson, divideAll, loadContext, unitCost, countOf, blockCost, BREAK_AT, PARAGRAPH_COST, BLOCK_COST, LINE_CHARS } from './lesson-divider.mjs';
import { parseLesson } from './lib/lesson-parse.mjs';

let failures = 0;
const check = (ok, message) => { if (!ok) { failures++; console.error(`FAIL ${message}`); } };

// ---- sentences: never alters a character, never splits at abbreviations or initials
const cases = [
  ['One. Two! Three?', ['One.', 'Two!', 'Three?']],
  ['Read Luke 1:1–4. Then ask why.', ['Read Luke 1:1–4.', 'Then ask why.']],
  ['Some letters (e.g. Romans) argue. Others narrate.', ['Some letters (e.g. Romans) argue.', 'Others narrate.']],
  ['C. S. Lewis wrote it. It sold.', ['C. S. Lewis wrote it.', 'It sold.']],
  ['He said, “Come.” They came.', ['He said, “Come.”', 'They came.']],
  ['About 1000 B.C. David reigned. Then Solomon.', ['About 1000 B.C. David reigned.', 'Then Solomon.']],
  ['Single sentence without a full stop', ['Single sentence without a full stop']],
];
for (const [input, want] of cases) {
  const got = sentences(input);
  check(JSON.stringify(got) === JSON.stringify(want), `sentences(${JSON.stringify(input)}) -> ${JSON.stringify(got)}`);
  check(got.join(' ') === input, `sentences must rejoin to the original: ${JSON.stringify(input)}`);
}
check(visible('**Bold** and [a link](/x) and *it*') === 'Bold and a link and it', 'visible() strips emphasis and link targets');

// ---- the count
check(unitCost({ kind: 'sentence', text: 'Hello.', paraStart: true }, true) === 6, 'the first unit on a step counts its characters only');
check(unitCost({ kind: 'sentence', text: 'Hello.', paraStart: false }, false) === 7, 'a sentence continuing a paragraph adds its space');
check(unitCost({ kind: 'sentence', text: 'Hello.', paraStart: true }, false) === 6 + PARAGRAPH_COST, `a new paragraph adds ${PARAGRAPH_COST}`);
check(blockCost({ kind: 'check', check: { title: 'T', prompt: 'P', items: ['a', 'b'] } }) === BLOCK_COST + LINE_CHARS * 4, 'a block counts 49 plus 49 per line of its text');
check(blockCost({ kind: 'check', check: { title: 'T', prompt: 'x'.repeat(50), items: [] } }) === BLOCK_COST + LINE_CHARS * 3, 'a 50-character line wraps to two lines');

// ---- the whole curriculum
const ctx = loadContext();
const all = divideAll();
check(all.length >= 119, `every lesson is divided (got ${all.length})`);
let steps = 0;
for (const lesson of all) {
  const source = parseLesson(readFileSync(`content/pathway/lessons/${lesson.lesson}.md`, 'utf8'), lesson.lesson);
  const ids = new Set();
  for (const section of source.sections) {
    const cards = lesson.cards.filter(c => c.section === section.id);
    check(cards.length >= 1, `${lesson.lesson}#${section.id}: every section produces at least one step`);
    // Word-for-word, in order, within the section: nothing moves between sections.
    const fromCards = cards.flatMap(c => c.units).map(u => (u.kind === 'sentence' || u.kind === 'callout' ? u.text : `[${u.kind}]`));
    const fromSource = section.blocks.flatMap(b => (b.type === 'prose' ? sentences(b.text) : b.type === 'callout' ? [b.text] : [`[${b.type}]`]));
    check(JSON.stringify(fromCards) === JSON.stringify(fromSource), `${lesson.lesson}#${section.id}: steps must hold the section's content in order, unchanged`);
    cards.forEach((card, i) => {
      steps++;
      check(card.id === (i === 0 ? section.id : `${section.id}-${i + 1}`), `${lesson.lesson}#${card.id}: ids follow <section>, <section>-2, ...`);
      check(!ids.has(card.id), `${lesson.lesson}#${card.id}: ids are unique`);
      ids.add(card.id);
      check(card.title === section.title, `${lesson.lesson}#${card.id}: a step's title is its section's title`);
      check(card.count === countOf(card.units), `${lesson.lesson}#${card.id}: reported count matches the rule`);
      if (card.units.length > 1) check(card.count <= BREAK_AT, `${lesson.lesson}#${card.id}: count ${card.count} is over ${BREAK_AT}`);
      else if (card.count > BREAK_AT) check(card.flags.includes('over-ceiling'), `${lesson.lesson}#${card.id}: a single unit over ${BREAK_AT} must be flagged`);
      // The break is at the LAST sentence end at or before 637: the next step's first unit would not have fitted.
      const next = cards[i + 1];
      if (next) check(card.count + unitCost(next.units[0], false) > BREAK_AT, `${lesson.lesson}#${card.id}: broke early (${card.count} + ${unitCost(next.units[0], false)} would fit)`);
      for (const u of card.units.filter(u => u.kind === 'reading')) {
        const n = sentences(u.text).length;
        check(u.mode === (n <= 2 && u.text.length <= 300 ? 'inline' : 'link'), `${lesson.lesson}#${card.id}: ${u.reference} (${n} sentences, ${u.text.length} chars) is ${u.mode}`);
      }
    });
  }
}

// ---- a synthetic section: paragraphs, the 46, a block, and the break at or before 637
const sentence = 'This sentence is exactly the kind of plain lesson prose the divider has to pack. '; // 81 with its space
const synthetic = {
  meta: { id: 'synthetic' }, checks: [{ title: 'Order', prompt: 'Put them in order.', items: ['One', 'Two', 'Three'] }], reflection: null,
  sections: [{ id: 'rule', title: 'Rule', blocks: [
    { type: 'prose', text: sentence.repeat(4).trim() },   // 80 + 3 x 81 = 323
    { type: 'prose', text: sentence.repeat(4).trim() },   // + 49 + 80 = 452, + 81 = 533, + 81 = 614, + 81 = 695 > 637
    { type: 'check', index: 0 },                           // 49 + 49 x 5 = 294
  ] }],
};
const synthetic3 = divideLesson(synthetic, ctx);
check(synthetic3.length === 2, `the synthetic section splits into 2 steps (got ${synthetic3.length})`);
check(synthetic3[0].count === 323 + 49 + 80 + 81 + 81, `step 1 counts paragraph 1, 49 for paragraph 2, and the sentences that fit (got ${synthetic3[0].count})`);
check(synthetic3[1].count === 80 + 294, `step 2 starts again and adds the check as 49 + 49 x 5 (got ${synthetic3[1].count})`);

if (failures) { console.error(`test-lesson-divider: ${failures} failure(s)`); process.exit(1); }
console.log(`PASS — lesson divider: ${all.length} lessons, ${steps} steps; sections kept, content unchanged and in order, ids <section>, <section>-2..., every step breaks at the last sentence end at or before ${BREAK_AT} (paragraphs +${PARAGRAPH_COST}, blocks ${BLOCK_COST} + ${LINE_CHARS}/line), indivisible units over the limit flagged.`);
