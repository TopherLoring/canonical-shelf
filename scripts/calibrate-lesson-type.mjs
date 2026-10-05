// Step 3, nodes S3.B and S3.B7: type calibration for the lesson step body.
// Reads character widths from the fonts the site ships for lesson text (Reading Room, decision work.s3.q: Source Sans 3
// for prose, Literata for Scripture blocks; both self-hosted, so text wraps the same on every device) and derives the
// per-shape line width and line count the build-time divider packs against. Output: content/pathway/lesson-type.json.
//   bun scripts/calibrate-lesson-type.mjs           write the file
//   bun scripts/calibrate-lesson-type.mjs --check   fail if the file is stale or its budgets are inconsistent
// Decisions: ui.lesson.card.orientation-2026-10-05, curriculum.lesson.pagination.build-time-2026-10-05.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { brotliDecompressSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const OUT = 'content/pathway/lesson-type.json';
const FONTS_CSS = 'public/fonts/fonts.css';
const LESSONS = 'content/pathway/lessons';

// Card geometry: text box 4:5 portrait (ui.lesson.card.portrait-4x5-2026-10-05) and 2:1 landscape (landscape-2x1-2026-10-05), 49 and 91 (ui.lesson.card.block-max-2026-10-05), at most 17 and 14 lines (landscape-91x14)
// characters per line. The shapes no longer hold the same amount of text; the divider packs to the tighter one.
const SHAPES = {
  portrait: { aspect: [4, 5], charsPerLine: 49, lines: 17 },
  landscape: { aspect: [2, 1], charsPerLine: 91, lines: 14 },
};
const LINE_HEIGHT = 1.55; // ui.lesson.card.line-height-1-55-2026-10-05
// Kerning (GPOS) and hinting are not applied here, and a real wrap leaves ragged line ends. These margins keep the
// computed budgets on the safe side: lines are treated as 3% narrower.
const WIDTH_SAFETY = 0.97;
const FACES = [
  { key: 'regular', style: 'normal', weight: '400' },
  { key: 'bold', style: 'normal', weight: '700' },
  { key: 'italic', style: 'italic', weight: '400' },
  { key: 'boldItalic', style: 'italic', weight: '700' },
];
// Which shipped font sets each kind of step-body text (Reading Room theme sheet; decision work.s3.q).
const ROLES = {
  prose: { family: 'Source Sans 3', scale: 1 },
  // Scripture blocks are set larger than prose: theme sheet body 15-17px, Scripture 18-19px.
  scripture: { family: 'Literata', scale: 1.15 },
};
// Variable fonts keep one width table (the default, regular instance) for every weight in a file. Bold is wider
// than that table says; this factor keeps bold text on the safe side (Source Sans 3 and Literata bold run about
// 5-7% wider than regular).
const BOLD_WIDTH_FACTOR = 1.07;
// Characters measured: printable Latin-1 plus the typographic punctuation lessons use.
const EXTRA = '–—‘’“”…•−';
const CHARS = [...Array(0x5f).keys()].map(i => String.fromCharCode(0x20 + i))
  .concat([...Array(0x60).keys()].map(i => String.fromCharCode(0xa0 + i)), [...EXTRA]);


function readWoff2(file) {
  const b = readFileSync(file);
  if (b.toString('latin1', 0, 4) !== 'wOF2') throw new Error(`${file}: not a WOFF2 file`);
  const count = b.readUInt16BE(12);
  const compressedSize = b.readUInt32BE(20);
  let o = 48;
  const u128 = () => {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const c = b[o++];
      v = v * 128 + (c & 127);
      if (!(c & 128)) return v;
    }
    throw new Error('bad UIntBase128');
  };
  const tables = [];
  for (const _ of Array(count)) {
    const flags = b[o++];
    const idx = flags & 63;
    let tag;
    if (idx === 63) { tag = b.toString('latin1', o, o + 4); o += 4; } else tag = WOFF2_KNOWN_TAG(idx);
    const version = flags >> 6;
    const origLength = u128();
    const transformed = tag === 'glyf' || tag === 'loca' ? version !== 3 : version !== 0;
    if (transformed && !['glyf', 'loca'].includes(tag)) throw new Error(`${file}: table ${tag} is transformed`);
    const storedLength = transformed ? u128() : origLength;
    tables.push({ tag, storedLength });
  }
  const data = brotliDecompressSync(b.subarray(o, o + compressedSize));
  const out = {};
  let p = 0;
  for (const t of tables) {
    out[t.tag] = data.subarray(p, p + t.storedLength);
    p += t.storedLength;
  }
  return out;
}

// Full WOFF2 known-tag table (spec section 5.1), index 0..62.
function WOFF2_KNOWN_TAG(i) {
  const t = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep',
    'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF',
    'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat',
    'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd',
    'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];
  return t[i];
}

function cmapLookup(cmap) {
  const n = cmap.readUInt16BE(2);
  let sub = -1;
  for (let i = 0; i < n; i++) {
    const pid = cmap.readUInt16BE(4 + i * 8), eid = cmap.readUInt16BE(6 + i * 8), off = cmap.readUInt32BE(8 + i * 8);
    if ((pid === 3 && eid === 10) || (pid === 3 && eid === 1) || pid === 0) {
      const fmt = cmap.readUInt16BE(off);
      if (fmt === 4 || fmt === 12) { if (sub < 0 || fmt === 12) sub = off; }
    }
  }
  if (sub < 0) throw new Error('no usable cmap subtable');
  const fmt = cmap.readUInt16BE(sub);
  if (fmt === 12) {
    const groups = cmap.readUInt32BE(sub + 12);
    return cp => {
      for (let g = 0; g < groups; g++) {
        const at = sub + 16 + g * 12;
        const s = cmap.readUInt32BE(at), e = cmap.readUInt32BE(at + 4);
        if (cp >= s && cp <= e) return cmap.readUInt32BE(at + 8) + (cp - s);
      }
      return 0;
    };
  }
  const segX2 = cmap.readUInt16BE(sub + 6);
  const endAt = sub + 14, startAt = endAt + segX2 + 2, deltaAt = startAt + segX2, rangeAt = deltaAt + segX2;
  return cp => {
    for (let s = 0; s < segX2; s += 2) {
      if (cp > cmap.readUInt16BE(endAt + s)) continue;
      if (cp < cmap.readUInt16BE(startAt + s)) return 0;
      const ro = cmap.readUInt16BE(rangeAt + s), delta = cmap.readInt16BE(deltaAt + s);
      if (ro === 0) return (cp + delta) & 0xffff;
      const g = cmap.readUInt16BE(rangeAt + s + ro + (cp - cmap.readUInt16BE(startAt + s)) * 2);
      return g === 0 ? 0 : (g + delta) & 0xffff;
    }
    return 0;
  };
}

function measureFace(file) {
  const t = readWoff2(file);
  const unitsPerEm = t.head.readUInt16BE(18);
  const numHM = t.hhea.readUInt16BE(34);
  const advance = g => t.hmtx.readUInt16BE(Math.min(g, numHM - 1) * 4);
  const glyphOf = cmapLookup(t.cmap);
  const widths = {};
  for (const ch of CHARS) {
    const g = glyphOf(ch.codePointAt(0));
    if (g) widths[ch] = advance(g);
  }
  return { unitsPerEm, widths };
}

// The latin-subset font file for each face of a family. Weights that share one variable-font file with the regular
// face get the regular widths scaled by BOLD_WIDTH_FACTOR; a face the site does not ship (for example bold italic)
// is derived from the nearest shipped face the same way.
function familyFiles(family) {
  const css = readFileSync(FONTS_CSS, 'utf8');
  const found = {};
  const esc = family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const m of css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)) {
    if (m[1] !== 'latin' || !new RegExp(`font-family:\\s*'${esc}'`).test(m[2])) continue;
    const style = m[2].match(/font-style:\s*(\w+)/)[1], weight = m[2].match(/font-weight:\s*(\d+)/)[1];
    found[`${style}/${weight}`] = 'public' + m[2].match(/url\(([^)]+)\)/)[1];
  }
  if (!found['normal/400']) throw new Error(`${family} regular (latin) missing from ${FONTS_CSS}; run bun run fonts:fetch`);
  const faces = {};
  for (const f of FACES) {
    const own = found[`${f.style}/${f.weight}`];
    const base = f.style === 'italic' && found['italic/400'] ? found['italic/400'] : found['normal/400'];
    if (own && !(f.weight === '700' && own === base)) faces[f.key] = { file: own, widthScale: 1 };
    else faces[f.key] = { file: base, widthScale: f.weight === '700' ? BOLD_WIDTH_FACTOR : 1, derived: true };
  }
  return faces;
}

// Plain lesson prose: drop front matter, fenced blocks, directives, headings and markdown marks.
function lessonProse() {
  let text = '';
  for (const f of readdirSync(LESSONS).filter(n => n.endsWith('.md')).sort()) {
    const body = readFileSync(`${LESSONS}/${f}`, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '').replace(/```[\s\S]*?```/g, '');
    for (const line of body.split('\n')) {
      if (/^(#|::|\s*$)/.test(line)) continue;
      text += line.replace(/^>\s*/, '').replace(/^\s*[-*]\s+/, '').replace(/[*_`]/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') + '\n';
    }
  }
  return text;
}

/** Width of `text` in em at the role's own size (prose by default), for a face of lesson-type.json. */
export function widthEm(type, text, face = 'regular', role = 'prose') {
  const r = type.fonts[role];
  const f = r.faces[face];
  const widths = r.widths[f.file];
  let units = 0;
  for (const ch of text) units += widths[ch] ?? widths['n'];
  return (units * f.widthScale * r.scale) / r.unitsPerEm;
}

export function calibrate() {
  const fonts = {};
  for (const [role, def] of Object.entries(ROLES)) {
    const faces = familyFiles(def.family);
    const widths = {};
    let unitsPerEm = 0;
    for (const f of Object.values(faces)) if (!widths[f.file]) { const m = measureFace(f.file); widths[f.file] = m.widths; unitsPerEm = m.unitsPerEm; }
    fonts[role] = { family: def.family, scale: def.scale, unitsPerEm, faces, widths };
  }

  // Average advance of lesson prose in the prose regular face, weighted by how often each character occurs.
  const pr = fonts.prose, regW = pr.widths[pr.faces.regular.file];
  let units = 0, count = 0;
  for (const ch of lessonProse()) {
    if (ch === '\n') continue;
    units += regW[ch] ?? regW['n'];
    count++;
  }
  const avgEm = units / count / pr.unitsPerEm;

  const shapes = {};
  for (const [name, s] of Object.entries(SHAPES)) {
    const lineWidthEm = +(s.charsPerLine * avgEm * WIDTH_SAFETY).toFixed(3);
    const maxLines = s.lines; // decided line counts are authoritative; the box aspect follows from them and the font
    const impliedAspect = +(s.charsPerLine * avgEm / (maxLines * LINE_HEIGHT)).toFixed(3); // width / height of the box
    shapes[name] = {
      aspect: s.aspect.join(':'),
      impliedAspect,
      charsPerLine: s.charsPerLine,
      lineWidthEm,
      maxLines,
      // Ceiling for one block; each paragraph break after the first costs one line (ui.lesson.card.char-ceiling-2026-10-05).
      maxCharsByParagraphs: Object.fromEntries([1, 2, 3, 4].map(n => [n, (maxLines - (n - 1)) * s.charsPerLine])),
    };
  }
  // One set of parts must fit both shapes, so the divider packs to the tighter shape.
  const governing = Object.entries(shapes).sort((a, b) => a[1].maxCharsByParagraphs[1] - b[1].maxCharsByParagraphs[1])[0][0];
  return {
    note: 'GENERATED by scripts/calibrate-lesson-type.mjs; do not edit by hand. Widths are font units; divide by unitsPerEm for em.',
    font: `${fonts.prose.family} (prose), ${fonts.scripture.family} at ${fonts.scripture.scale}x (Scripture blocks)`,
    boldWidthFactor: BOLD_WIDTH_FACTOR,
    lineHeight: LINE_HEIGHT,
    widthSafety: WIDTH_SAFETY,
    averageCharEm: +avgEm.toFixed(4),
    shapes,
    governingShape: governing,
    partBudget: {
      lines: shapes[governing].maxLines,
      // Absolute ceilings, not targets: shorter is preferred.
      maxCharsByParagraphs: shapes[governing].maxCharsByParagraphs,
    },
    fonts,
  };
}

function checkBudgets(t) {
  const problems = [];
  if (t.shapes.portrait.aspect !== '4:5') problems.push('portrait text box is not the decided 4:5');
  const c = t.partBudget.maxCharsByParagraphs;
  if (c[1] !== 833 || c[2] !== 784 || c[3] !== 735) problems.push(`ceilings ${c[1]}/${c[2]}/${c[3]} differ from the decided 833/784/735`);
  for (const [name, s] of Object.entries(t.shapes)) {
    if (Math.abs(s.charsPerLine - { portrait: 49, landscape: 91 }[name]) > 0) problems.push(`${name}: chars per line is not the decided value`);
    if (s.maxLines < 8) problems.push(`${name}: fewer than 8 lines`);
  }
  for (const [role, r] of Object.entries(t.fonts)) for (const [face, f] of Object.entries(r.faces)) {
    const w = r.widths[f.file];
    if (!w || !w[' '] || !w['e']) problems.push(`${role} ${face}: missing basic glyph widths`);
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const next = calibrate();
  const json = JSON.stringify(next, null, 1) + '\n';
  if (process.argv.includes('--check')) {
    let current = '';
    try { current = readFileSync(OUT, 'utf8'); } catch { /* missing */ }
    const problems = checkBudgets(next);
    if (current !== json) problems.unshift(`${OUT} is stale; run: bun scripts/calibrate-lesson-type.mjs`);
    if (problems.length) { console.error(problems.map(p => `calibrate-lesson-type: ${p}`).join('\n')); process.exit(1); }
    console.log(`calibrate-lesson-type: ok (${next.governingShape} governs: ${next.partBudget.lines} lines, ceilings ${Object.values(next.partBudget.maxCharsByParagraphs).join('/')} chars by paragraph count)`);
  } else {
    const problems = checkBudgets(next);
    writeFileSync(OUT, json);
    console.log(`calibrate-lesson-type: wrote ${OUT}`);
    for (const [n, s] of Object.entries(next.shapes)) console.log(`  ${n}: ${s.charsPerLine}/line, ${s.maxLines} lines, ceilings ${Object.values(s.maxCharsByParagraphs).join('/')}`);
    console.log(`  part budget: ${next.partBudget.lines} lines (${next.governingShape} governs); avg char ${next.averageCharEm} em`);
    if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
  }
}
