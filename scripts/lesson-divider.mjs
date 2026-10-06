// Step 3, node S3.D: build-time divider. Splits each lesson step's body into cards that fit the lesson step body.
//
// Rules (decisions in .roa/records):
// - A sentence is never split; content never moves between steps; order is never changed
//   (curriculum.lesson.pagination.build-time-2026-10-05).
// - Every card is a step; the first card keeps the step's id, later cards get "<id>-2", "<id>-3"
//   (record: every lesson card is a step).
// - Interim break rule (ui.lesson.card.break-637-2026-10-05): count every character on a card (spaces and
//   punctuation included, starting at 1 on each card; each new paragraph adds 49) and break at the last sentence end
//   before 637. The 833 / 784 / 735 ceilings and the ~400 target return when content is revised.
// - A card must also fit the portrait step body: 4:5 box, 16px type, line height 1.55 on the reference iPhone, which
//   holds about 54 characters x 17 lines in Source Sans 3 (ui.lesson.card.type-16px-2026-10-05). Cards that do not
//   fit are flagged, never silently accepted.
// - Widths come from content/pathway/lesson-type.json (S3.B7): Source Sans 3 for prose, Literata for Scripture.
//
//   bun scripts/lesson-divider.mjs            summary of the proposed cards for every lesson
//   bun scripts/lesson-divider.mjs <lesson>   one lesson's proposed cards in full
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseLesson } from './lib/lesson-parse.mjs';
import { parseOsis } from './lib/bible-books.mjs';

export const CEILINGS = { 1: 833, 2: 784, 3: 735 };
export const TARGET = { min: 370, max: 420 };
// A text-only card shorter than this, left at the end of a step, is merged back or flagged as an orphan.
export const ORPHAN_CHARS = 120;
// Break rule v2 (ui.lesson.card.break-rule-v2-2026-10-05): break at the last sentence end at or before 637; a new
// paragraph adds 46; a block counts 49 plus 49 per 49-character line of its text.
export const BREAK_AT = 637;
export const PARAGRAPH_COST = 46;
export const BLOCK_COST = 49;
export const LINE_CHARS = 49;
export const VISUAL_LINES = 9;
// Reference phone (Chris's calculation, ui.lesson.card.type-16px-2026-10-05): 16px type at line height 1.55 in the
// portrait step body, which spans about 89% x 51.5% of a 390 x 844 iPhone viewport (ui.lesson.card.portrait-4x5).
// With Source Sans 3 that box holds about 54 characters x 17 lines.
const REFERENCE = { boxPx: [347, 435], fontPx: 16 };
// Fixed line costs for blocks whose height does not come from wrapped text.
// readingInlinePad: the quoted Scripture block's extra padding and reference caption; readingLink: the compact link
// (reference, version, one-line preview) for passages that open in a popover (ui.lesson.reading.inline-or-popover).
const COST = { gap: 1, calloutPad: 1, readingInlinePad: 3, readingLink: 4, checkBase: 3, reflectBox: 5, visual: 9 };
// A reading of two sentences or fewer and at most 300 characters is quoted on the card (Luke 24:44-45, 246
// characters, is the mockup's example); anything longer becomes a link and a popover. The character limit keeps
// out single Scripture sentences that run six or eight verses (Ephesians 4:1-6, Ecclesiastes 3:1-8).
export const INLINE_READING_SENTENCES = 2;
export const INLINE_READING_MAX_CHARS = 300;

// ---------------------------------------------------------------- text measurement

/** Visible text of a markdown line: links become their text; emphasis marks are dropped. */
export function visible(text) {
  return String(text).replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*\*|__|[*_`]/g, '');
}

/** Per-character widths in em (at the role's size) from lesson-type.json. */
function measurer(type) {
  const cache = {};
  return (text, role = 'prose') => {
    const r = type.fonts[role];
    const w = cache[role] ||= r.widths[r.faces.regular.file];
    let units = 0;
    for (const ch of text) units += w[ch] ?? w.n;
    return (units * r.scale) / r.unitsPerEm;
  };
}

/** Lines `text` occupies when wrapped at `widthEm` (greedy word wrap, as browsers do). */
export function wrapLines(text, widthEm, measure, role = 'prose') {
  const words = visible(text).split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const space = measure(' ', role);
  let lines = 1, line = 0;
  for (const word of words) {
    const w = measure(word, role);
    if (line === 0) line = w;
    else if (line + space + w <= widthEm) line += space + w;
    else { lines++; line = w; }
  }
  return lines;
}

// ---------------------------------------------------------------- sentences

const ABBREVIATIONS = new Set(['e.g', 'i.e', 'etc', 'cf', 'vs', 'v', 'vv', 'ch', 'chs', 'c', 'ca', 'Mr', 'Mrs', 'Ms', 'Dr', 'St', 'Jr', 'Sr', 'No', 'p', 'pp', 'ed', 'eds', 'trans', 'A.D', 'B.C', 'B.C.E', 'C.E', 'B.C.E', 'U.S', 'Lk', 'Mt', 'Mk', 'Jn', 'Gen', 'Ex', 'Ps', 'Isa', 'Rom', 'Cor']);

/** Splits a paragraph into sentences without changing a character: joining the result with ' ' restores it. */
export function sentences(paragraph) {
  const text = paragraph.trim();
  const out = [];
  let start = 0;
  const re = /[.!?…]+["”’)\]]*\s+(?=["“‘(\[]?[A-Z0-9])/g;
  let m;
  while ((m = re.exec(text))) {
    const end = m.index + m[0].trimEnd().length;
    const before = text.slice(start, m.index + 1);
    const word = (before.match(/([A-Za-z.]+)\.$/) || [])[1] || '';
    // Abbreviations and initials ("C. S. Lewis") do not end sentences.
    if (ABBREVIATIONS.has(word) || /^[A-Z]$/.test(word)) continue;
    out.push(text.slice(start, end));
    start = m.index + m[0].length;
  }
  out.push(text.slice(start));
  return out.filter(s => s.length);
}

// ---------------------------------------------------------------- units and card layout

/** The step's content as an ordered list of indivisible units. */
function stepUnits(section, lesson, corpus) {
  const units = [];
  for (const [b, block] of section.blocks.entries()) {
    if (block.type === 'prose') {
      const parts = sentences(block.text);
      parts.forEach((text, i) => units.push({ kind: 'sentence', block: b, text, paraStart: i === 0, paraEnd: i === parts.length - 1 }));
    } else if (block.type === 'callout') {
      units.push({ kind: 'callout', block: b, text: block.text, paraStart: true, paraEnd: true });
    } else if (block.type === 'check') {
      units.push({ kind: 'check', block: b, check: lesson.checks[block.index] });
    } else if (block.type === 'reflect') {
      units.push({ kind: 'reflect', block: b, reflect: lesson.reflection });
    } else if (block.type === 'reading') {
      const text = readingText(lesson.meta.readingOsis, corpus);
      units.push({ kind: 'reading', block: b, text, mode: 'pending', reference: lesson.meta.reading || '' });
    } else if (block.type === 'visual') {
      units.push({ kind: 'visual', block: b });
    }
  }
  return units;
}

function readingText(osis, corpus) {
  const a = osis ? parseOsis(osis) : null;
  if (!a) return '';
  return corpus.filter(r => r.book === a.book && r.chapter === a.chapter && r.verse >= (a.verseStart || 1) && r.verse <= (a.verseEnd || a.verseStart || 999)).map(r => r.text).join(' ');
}

/** Lays out a card: paragraphs, characters and lines in a box `widthEm` wide. */
export function layout(units, widthEm, measure) {
  let chars = 0, paragraphs = 0, lines = 0, blocks = 0;
  let run = null;
  const flush = () => { if (run) { lines += wrapLines(run, widthEm, measure); run = null; } };
  const startBlock = () => { if (blocks++ > 0) lines += COST.gap; };
  for (const u of units) {
    if (u.kind === 'sentence') {
      if (u.paraStart || run === null) { flush(); startBlock(); paragraphs++; run = u.text; }
      else run += ' ' + u.text;
      chars += visible(u.text).length + (u.paraStart || run === u.text ? 0 : 1);
      continue;
    }
    flush();
    startBlock();
    if (u.kind === 'callout') {
      paragraphs++;
      chars += visible(u.text).length;
      lines += wrapLines(u.text, widthEm - 2, measure) + COST.calloutPad;
    } else if (u.kind === 'reading') {
      if (u.mode === 'link') lines += COST.readingLink;
      else {
        // Quoted Scripture is set larger (lesson-type.json scale), so each of its lines is taller as well; the
        // block's stripe and padding take about 3 em of the width.
        const scale = measure.scriptureScale || 1;
        lines += Math.ceil(wrapLines(u.text, widthEm - 3, measure, 'scripture') * scale) + COST.readingInlinePad;
      }
    } else if (u.kind === 'check') {
      const c = u.check || {};
      lines += COST.checkBase + wrapLines(c.prompt || '', widthEm, measure)
        + (c.items || []).reduce((n, item) => n + Math.max(1, wrapLines(typeof item === 'string' ? item : JSON.stringify(item), widthEm - 3, measure)), 0);
    } else if (u.kind === 'reflect') {
      lines += wrapLines(u.reflect?.prompt || '', widthEm, measure) + COST.reflectBox;
    } else if (u.kind === 'visual') {
      lines += COST.visual;
    }
  }
  flush();
  return { chars, paragraphs, lines };
}

const ceilingFor = paragraphs => CEILINGS[Math.min(3, Math.max(1, paragraphs))] - (paragraphs > 3 ? 49 * (paragraphs - 3) : 0);

// ---------------------------------------------------------------- the divider

/** Geometry derived from lesson-type.json: the primary and fallback portrait boxes, in em of prose type. */
export function geometry(type) {
  const [w, h] = REFERENCE.boxPx;
  const widthEm = (w / REFERENCE.fontPx) * type.widthSafety;
  const lines = Math.floor(h / (REFERENCE.fontPx * type.lineHeight));
  return { primary: { widthEm, lines, charsPerLine: Math.floor(w / REFERENCE.fontPx / type.averageCharEm) } };
}

/**
 * Divides one parsed lesson into cards. Returns, per step, the cards with their units, measurements and flags.
 * Flags: over-ceiling (a single sentence or block is longer than the ceiling), overflow (taller than the step body),
 * orphan (a short text-only card that could not be merged back),
 * block-alone (a check, reflection, reading or visual had to leave the text it follows).
 */
export function divideLesson(lesson, { type, corpus }) {
  const measure = measurer(type);
  measure.scriptureScale = type.fonts.scripture?.scale || 1;
  const geo = geometry(type);
  const fitsIn = (units, box) => {
    const m = layout(units, box.widthEm, measure);
    return m.lines <= box.lines && m.chars <= ceilingFor(m.paragraphs || 1);
  };
  // Lessons are their authored sections, each divided into steps (curriculum.lesson.sections-divided-2026-10-05).
  // Step break rule (ui.lesson.card.break-rule-v2-2026-10-05): count every character on a step, spaces and
  // punctuation included, starting again on each step; each new paragraph after the first adds 46; a block counts 49
  // plus 49 for each 49-character line of its text; a visual counts as its 9-line height. Break at the last sentence
  // end at or before 637. Sentences and blocks are never divided.
  const cards = [];
  for (const section of lesson.sections) {
    const units = stepUnits(section, lesson, corpus);
    for (const u of units.filter(u => u.kind === 'reading')) {
      const short = sentences(u.text).length <= INLINE_READING_SENTENCES;
      u.mode = short && u.text.length <= INLINE_READING_MAX_CHARS ? 'inline' : 'link';
    }
    const steps = [];
    let step = [], count = 0;
    for (const u of units) {
      const c = unitCost(u, step.length === 0);
      if (step.length && count + c > BREAK_AT) { steps.push(step); step = [u]; count = unitCost(u, true); }
      else { step.push(u); count += c; }
    }
    if (step.length) steps.push(step);
    steps.forEach((us, i) => {
      const m = layout(us, geo.primary.widthEm, measure);
      const n = countOf(us);
      const flags = [];
      if (n > BREAK_AT) flags.push(us.length === 1 ? 'over-ceiling' : 'overflow');
      if (m.lines > geo.primary.lines) flags.push('tall');
      if (i > 0 && us.every(u => u.kind === 'sentence' || u.kind === 'callout') && n < ORPHAN_CHARS) flags.push('orphan');
      if (i > 0 && us.every(u => !(u.kind === 'sentence' || u.kind === 'callout')) && steps[i - 1].at(-1)?.kind === 'sentence') flags.push('block-alone');
      cards.push({ id: i === 0 ? section.id : `${section.id}-${i + 1}`, title: section.title, section: section.id, sectionStep: i + 1, sectionSteps: steps.length, units: us, chars: m.chars, count: n, paragraphs: m.paragraphs, lines: m.lines, flags });
    });
  }
  return cards;
}

// ---------------------------------------------------------------- the count (break rule v2)

const textLines = text => Math.max(1, Math.ceil(visible(String(text || '')).length / LINE_CHARS));
/** Characters a block counts: 49 plus 49 for each 49-character line of its text. */
export function blockCost(u) {
  if (u.kind === 'visual') return BLOCK_COST + LINE_CHARS * (VISUAL_LINES - 1);
  let lines = 0;
  if (u.kind === 'check') {
    const c = u.check || {};
    lines = textLines(c.title) + textLines(c.prompt) + (c.items || []).reduce((n, item) => n + textLines(typeof item === 'string' ? item : item?.text || JSON.stringify(item)), 0);
  } else if (u.kind === 'reflect') {
    lines = textLines(u.reflect?.prompt);
  } else if (u.kind === 'reading') {
    // A quoted reading shows its verses; a linked reading shows its reference and a one-line preview.
    lines = u.mode === 'inline' ? textLines(u.text) + 1 : 2;
  }
  return BLOCK_COST + LINE_CHARS * lines;
}
/** What one unit adds to its step's count. */
export function unitCost(u, first) {
  if (u.kind === 'sentence' || u.kind === 'callout') return visible(u.text).length + (first ? 0 : (u.kind === 'sentence' && !u.paraStart ? 1 : PARAGRAPH_COST));
  return blockCost(u);
}
export const countOf = us => us.reduce((n, u, i) => n + unitCost(u, i === 0), 0);

// ---------------------------------------------------------------- loading

export function loadContext(root = process.cwd()) {
  const type = JSON.parse(readFileSync(`${root}/content/pathway/lesson-type.json`, 'utf8'));
  const corpus = readFileSync(`${root}/content/vendor/legacy/corpus.txt`, 'utf8').split('\n').filter(Boolean).map(line => {
    const [book, chapter, verse, ...rest] = line.split('\t');
    return { book: Number(book), chapter: Number(chapter), verse: Number(verse), text: rest.join('\t') };
  });
  return { type, corpus };
}

export function divideAll(root = process.cwd()) {
  const ctx = loadContext(root);
  const dir = `${root}/content/pathway/lessons`;
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => {
    const lesson = parseLesson(readFileSync(`${dir}/${f}`, 'utf8'), `lessons/${f}`);
    return { lesson: lesson.meta.id, title: lesson.meta.title, cards: divideLesson(lesson, ctx) };
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const only = process.argv[2];
  const all = divideAll().filter(l => !only || l.lesson === only);
  if (only && !all.length) { console.error(`lesson-divider: no lesson "${only}"`); process.exit(1); }
  const cards = all.flatMap(l => l.cards);
  const flagged = {};
  for (const c of cards) for (const f of c.flags) flagged[f] = (flagged[f] || 0) + 1;
  const sizes = cards.map(c => c.count).filter(n => n > 0).sort((a, b) => a - b);
  if (only) for (const c of all[0].cards) console.log(`\n[${c.id}] ${c.title} — count ${c.count}, ${c.lines} lines${c.flags.length ? `  FLAGS: ${c.flags.join(', ')}` : ''}\n  ${c.units.map(u => u.kind === 'sentence' ? (u.paraStart ? '¶ ' : '') + u.text : u.kind === 'heading' ? `## ${u.text}` : `[${u.kind}]`).join(' ').slice(0, 260)}`);
  console.log(`\nlesson-divider: ${all.length} lessons, ${all.reduce((n, l) => n + new Set(l.cards.map(c => c.section)).size, 0)} sections -> ${cards.length} steps; median count ${sizes[sizes.length >> 1]}, max ${sizes.at(-1)}; flags ${JSON.stringify(flagged)}`);
}
