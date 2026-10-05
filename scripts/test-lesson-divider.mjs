// Unit tests for the build-time lesson divider (S3.D). Runs in Node in about a second; no browser.
//   bun scripts/test-lesson-divider.mjs
import { readFileSync } from 'node:fs';
import { sentences, visible, divideLesson, divideAll, loadContext, geometry, BREAK_AT, PARAGRAPH_COST } from './lesson-divider.mjs';
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

// ---- the whole curriculum
const ctx = loadContext();
const geo = geometry(ctx.type);
check(geo.primary.lines === 17, `primary step body is 17 lines at 16px / 1.55 (got ${geo.primary.lines})`);
check(geo.primary.charsPerLine >= 53 && geo.primary.charsPerLine <= 56, `primary step body holds about 54 characters per line (got ${geo.primary.charsPerLine})`);

const all = divideAll();
check(all.length >= 119, `every lesson is divided (got ${all.length})`);
const ids = new Set();
for (const lesson of all) {
  const source = parseLesson(readFileSync(`content/pathway/lessons/${lesson.lesson}.md`, 'utf8'), lesson.lesson);
  lesson.steps.forEach((step, si) => {
    const section = source.sections[si];
    check(step.id === section.id, `${lesson.lesson}: steps stay in order (${step.id} vs ${section.id})`);
    // Word-for-word: the cards' text, in order, is the step's text, and no unit appears twice or goes missing.
    const fromCards = step.cards.flatMap(c => c.units).map(u => u.kind === 'sentence' || u.kind === 'callout' ? u.text : `[${u.kind}]`);
    const fromSource = section.blocks.flatMap(b => b.type === 'prose' ? sentences(b.text) : b.type === 'callout' ? [b.text] : [`[${b.type}]`]);
    check(JSON.stringify(fromCards) === JSON.stringify(fromSource), `${lesson.lesson}#${step.id}: cards must hold the step's content in order, unchanged`);
    for (const b of section.blocks.filter(b => b.type === 'prose')) {
      const rebuilt = step.cards.flatMap(c => c.units).filter(u => u.kind === 'sentence' && section.blocks.indexOf(b) === u.block).map(u => u.text).join(' ');
      check(rebuilt === b.text.trim(), `${lesson.lesson}#${step.id}: a paragraph must rebuild exactly from its sentences`);
    }
    step.cards.forEach((card, ci) => {
      check(card.id === (ci === 0 ? step.id : `${step.id}-${ci + 1}`), `${lesson.lesson}#${card.id}: card ids follow <step>, <step>-2, ...`);
      check(!ids.has(`${lesson.lesson}#${card.id}`), `${lesson.lesson}#${card.id}: card ids are unique`);
      ids.add(`${lesson.lesson}#${card.id}`);
      check(card.units.every(u => step.cards.indexOf(card) === ci), 'cards never share units');
      if (!card.flags.includes('over-ceiling')) check(card.count <= BREAK_AT, `${lesson.lesson}#${card.id}: count ${card.count} is over ${BREAK_AT}`);
      // The break is at the LAST sentence end before 637: the next card's first sentence would not have fitted.
      const next = step.cards[ci + 1];
      const lead = next?.units[0];
      if (lead && (lead.kind === 'sentence' || lead.kind === 'callout') && card.units.some(u => u.kind === 'sentence' || u.kind === 'callout')) {
        const extra = lead.kind === 'callout' || lead.paraStart ? PARAGRAPH_COST : 1;
        check(card.count + extra + visible(lead.text).length > BREAK_AT, `${lesson.lesson}#${card.id}: broke early (${card.count} + ${extra + visible(lead.text).length} would fit)`);
      }
      check(card.lines <= geo.primary.lines, `${lesson.lesson}#${card.id}: ${card.lines} lines does not fit the ${geo.primary.lines}-line step body`);
      for (const u of card.units.filter(u => u.kind === 'reading')) {
        const n = sentences(u.text).length;
        check(['inline', 'link'].includes(u.mode), `${lesson.lesson}#${card.id}: reading mode must be inline or link`);
        check(u.mode === (n <= 2 && u.text.length <= 300 ? 'inline' : 'link'), `${lesson.lesson}#${card.id}: ${u.reference} (${n} sentences, ${u.text.length} chars) is ${u.mode}`);
      }
    });
  });
}

// ---- a synthetic step: the count, the paragraph cost, and the break at the last sentence before 637
const sentence = 'This sentence is exactly the kind of plain lesson prose the divider has to pack. '; // 81 characters with its space
const synthetic = {
  meta: { id: 'synthetic' }, checks: [], reflection: null,
  sections: [{ id: 'rule', title: 'Rule', blocks: [
    { type: 'prose', text: sentence.repeat(4).trim() },   // 80 + 3 x 81 = 323
    { type: 'prose', text: sentence.repeat(4).trim() },   // + 49 + 323 = 695 > 637: card 1 ends inside paragraph 2
  ] }],
};
const [step] = divideLesson(synthetic, ctx);
check(step.cards.length === 2, `the synthetic step splits into 2 cards (got ${step.cards.length})`);
check(step.cards[0].count === 323 + 49 + 80 + 81 + 81, `card 1 counts paragraph 1, the 49 for paragraph 2, and the sentences that fit (got ${step.cards[0].count})`);
check(step.cards[1].count === 80, `card 2 starts again at the next sentence (got ${step.cards[1].count})`);

if (failures) { console.error(`test-lesson-divider: ${failures} failure(s)`); process.exit(1); }
console.log(`PASS — lesson divider: ${all.length} lessons, ${ids.size} cards; sentences intact, content unchanged and in order, ids unique, every card breaks at the last sentence before ${BREAK_AT} (new paragraphs +${PARAGRAPH_COST}), the ${geo.primary.lines}-line step body respected; readings quoted inline at two sentences and 300 characters or fewer, otherwise linked.`);
