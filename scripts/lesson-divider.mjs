// Step 3, node S3.D: build-time divider. Splits each lesson step's body into cards that fit the lesson step body.
//
// Rules (decisions in .roa/records):
// - A sentence is never split; content never moves between steps; order is never changed
//   (curriculum.lesson.pagination.build-time-2026-10-05).
// - Every card is a step; the first card keeps the step's id, later cards get "<id>-2", "<id>-3"
//   (record: every lesson card is a step).
// - Hard ceilings: 833 / 784 / 735 characters for 1 / 2 / 3 paragraphs (spaces and punctuation included); target
//   about half the ceiling, 370-420 (ui.lesson.card.step-length-2026-10-05).
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
  return lesson.sections.map(section => {
    const units = stepUnits(section, lesson, corpus);
    for (const u of units.filter(u => u.kind === 'reading')) {
      const short = sentences(u.text).length <= INLINE_READING_SENTENCES;
      u.mode = short && u.text.length <= INLINE_READING_MAX_CHARS ? 'inline' : 'link';
    }
    const cards = [];
    let card = [];
    const textChars = us => us.filter(u => u.kind === 'sentence' || u.kind === 'callout').reduce((n, u) => n + visible(u.text).length + 1, 0);
    for (const u of units) {
      const next = [...card, u];
      const isText = u.kind === 'sentence' || u.kind === 'callout';
      const overTarget = isText && textChars(next) > TARGET.max && textChars(card) >= TARGET.min / 2;
      if (card.length && (!fitsIn(next, geo.primary) || overTarget)) { cards.push(card); card = [u]; }
      else card = next;
    }
    if (card.length) cards.push(card);
    // Balance: re-split each run of consecutive sentence-only cards into the same number of cards around an even
    // target, so 971 characters over three cards come out about 324 each rather than 404 / 323 / 242. A
    // re-split is used only if every new card still fits; otherwise the greedy cards stand.
    const sentenceOnly = c => c.every(u => u.kind === 'sentence');
    for (let i = 0; i < cards.length; i++) {
      if (!sentenceOnly(cards[i])) continue;
      let j = i;
      while (j + 1 < cards.length && sentenceOnly(cards[j + 1])) j++;
      const k = j - i + 1;
      if (k >= 2) {
        const run = cards.slice(i, j + 1).flat();
        const total = textChars(run), target = total / k;
        const out = [];
        let cur = [];
        run.forEach((u, idx) => {
          const left = run.length - idx;
          const len = visible(u.text).length + 1;
          const need = k - out.length - 1;
          if (cur.length && need > 0 && (textChars(cur) + len / 2 > target || left === need)) { out.push(cur); cur = []; }
          cur.push(u);
        });
        out.push(cur);
        const biggest = cs => Math.max(...cs.map(textChars));
        if (out.length === k && out.every(c => fitsIn(c, geo.primary)) && biggest(out) <= Math.max(TARGET.max, biggest(cards.slice(i, j + 1)))) cards.splice(i, k, ...out);
      }
      i = j;
    }
    // Merge a short text-only last card back when the combined card still fits.
    if (cards.length > 1) {
      const last = cards.at(-1);
      const merged = [...cards.at(-2), ...last];
      if (last.every(u => u.kind === 'sentence' || u.kind === 'callout') && textChars(last) < ORPHAN_CHARS && fitsIn(merged, geo.primary) && textChars(merged) <= TARGET.max + ORPHAN_CHARS / 2) {
        cards.splice(-2, 2, merged);
      }
    }
    return {
      id: section.id,
      title: section.title,
      cards: cards.map((us, i) => {
        const m = layout(us, geo.primary.widthEm, measure);
        const flags = [];
        const single = us.length === 1;
        if (m.chars > ceilingFor(m.paragraphs || 1)) flags.push(single ? 'over-ceiling' : 'overflow');
        if (m.lines > geo.primary.lines) flags.push('overflow');
        if (cards.length > 1 && us.every(u => u.kind === 'sentence' || u.kind === 'callout') && textChars(us) < ORPHAN_CHARS) flags.push('orphan');
        const nonText = us.filter(u => !['sentence', 'callout'].includes(u.kind));
        if (nonText.length && us.length === nonText.length && i > 0 && cards[i - 1].at(-1)?.kind === 'sentence') flags.push('block-alone');
        return {
          id: i === 0 ? section.id : `${section.id}-${i + 1}`,
          units: us,
          chars: m.chars,
          paragraphs: m.paragraphs,
          lines: m.lines,
          flags: [...new Set(flags)],
        };
      }),
    };
  });
}

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
    return { lesson: lesson.meta.id, title: lesson.meta.title, steps: divideLesson(lesson, ctx) };
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const only = process.argv[2];
  const all = divideAll().filter(l => !only || l.lesson === only);
  if (only && !all.length) { console.error(`lesson-divider: no lesson "${only}"`); process.exit(1); }
  const cards = all.flatMap(l => l.steps.flatMap(s => s.cards));
  const steps = all.flatMap(l => l.steps);
  const flagged = {};
  for (const c of cards) for (const f of c.flags) flagged[f] = (flagged[f] || 0) + 1;
  const sizes = cards.map(c => c.chars).filter(n => n > 0).sort((a, b) => a - b);
  if (only) {
    for (const s of all[0].steps) {
      console.log(`\n## ${s.title} {#${s.id}}  (${s.cards.length} card${s.cards.length > 1 ? 's' : ''})`);
      for (const c of s.cards) console.log(`  [${c.id}] ${c.chars} chars, ${c.paragraphs} para, ${c.lines} lines${c.flags.length ? `  FLAGS: ${c.flags.join(', ')}` : ''}\n    ${c.units.map(u => u.kind === 'sentence' ? (u.paraStart ? '¶ ' : '') + u.text : `[${u.kind}]`).join(' ').slice(0, 300)}`);
    }
  }
  console.log(`\nlesson-divider: ${all.length} lessons, ${steps.length} authored steps -> ${cards.length} cards; median ${sizes[sizes.length >> 1]} chars, max ${sizes.at(-1)}; flags ${JSON.stringify(flagged)}`);
}
