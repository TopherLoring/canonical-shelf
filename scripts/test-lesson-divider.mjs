// Unit tests for the build-time lesson divider (S3.D). Runs in Node in about a second; no browser.
//   bun scripts/test-lesson-divider.mjs
import { readFileSync } from 'node:fs';
import { sentences, visible, divideLesson, divideAll, loadContext, geometry, CEILINGS, TARGET } from './lesson-divider.mjs';
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
      const ceiling = CEILINGS[Math.min(3, Math.max(1, card.paragraphs))];
      if (!card.flags.includes('over-ceiling')) check(card.chars <= ceiling || card.paragraphs > 3, `${lesson.lesson}#${card.id}: ${card.chars} chars is over the ${ceiling} ceiling`);
      const textOnly = card.units.every(u => u.kind === 'sentence' || u.kind === 'callout');
      if (textOnly && card.units.length > 1) check(card.chars <= TARGET.max + 60, `${lesson.lesson}#${card.id}: ${card.chars} chars is far over the ~${TARGET.max} target`);
      check(card.lines <= geo.primary.lines, `${lesson.lesson}#${card.id}: ${card.lines} lines does not fit the ${geo.primary.lines}-line step body`);
      for (const u of card.units.filter(u => u.kind === 'reading')) {
        const n = sentences(u.text).length;
        check(['inline', 'link'].includes(u.mode), `${lesson.lesson}#${card.id}: reading mode must be inline or link`);
        check(u.mode === (n <= 2 && u.text.length <= 300 ? 'inline' : 'link'), `${lesson.lesson}#${card.id}: ${u.reference} (${n} sentences, ${u.text.length} chars) is ${u.mode}`);
      }
    });
  });
}

// ---- a synthetic step: a long paragraph splits evenly at sentence boundaries, never mid-sentence
const sentence = 'This sentence is exactly the kind of plain lesson prose the divider has to pack. ';
const longParagraph = sentence.repeat(12).trim();
const synthetic = {
  meta: { id: 'synthetic' }, checks: [], reflection: null,
  sections: [{ id: 'long', title: 'Long', blocks: [{ type: 'prose', text: longParagraph }] }],
};
const [step] = divideLesson(synthetic, ctx);
const sizes = step.cards.map(c => c.chars);
check(step.cards.length >= 2, `a ${longParagraph.length}-character paragraph splits into cards (got ${step.cards.length})`);
check(Math.max(...sizes) - Math.min(...sizes) <= sentence.length + 2, `splits are balanced to within one sentence (${sizes.join(' / ')})`);
check(step.cards.flatMap(c => c.units).every(u => longParagraph.includes(u.text) && /[.!?]$/.test(u.text)), 'every card boundary falls at a sentence end');

if (failures) { console.error(`test-lesson-divider: ${failures} failure(s)`); process.exit(1); }
console.log(`PASS — lesson divider: ${all.length} lessons, ${ids.size} cards; sentences intact, content unchanged and in order, ids unique, ceilings and the ${geo.primary.lines}-line step body respected; readings quoted inline at two sentences and 300 characters or fewer, otherwise linked.`);
