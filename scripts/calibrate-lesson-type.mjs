// Step 3, node S3.B: type calibration for the lesson card.
// Reads character widths from the shipped reading font (Caladea, same advance widths as Cambria, so text wraps
// identically on every device) and derives the per-shape line width and line count the build-time divider packs
// against. Output: content/pathway/lesson-type.json.
//   bun scripts/calibrate-lesson-type.mjs           write the file
//   bun scripts/calibrate-lesson-type.mjs --check   fail if the file is stale or its budgets are inconsistent
// Decisions: ui.lesson.card.orientation-2026-10-05, curriculum.lesson.pagination.build-time-2026-10-05.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { brotliDecompressSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const OUT = 'content/pathway/lesson-type.json';
const FONTS_CSS = 'public/fonts/fonts.css';
const LESSONS = 'content/pathway/lessons';

// Card geometry from the orientation decision: text box ~3:5 portrait and ~5:3 landscape, ~38 and ~68 characters
// per line, so both shapes hold about the same amount of text.
const SHAPES = {
  portrait: { aspect: [3, 5], charsPerLine: 38 },
  landscape: { aspect: [5, 3], charsPerLine: 68 },
};
const LINE_HEIGHT = 1.7; // --leading-reading in public/theme.css; lesson prose is reading text
// Kerning (GPOS) and hinting are not applied here, and a real wrap leaves ragged line ends. These margins keep the
// computed budgets on the safe side: lines are treated as 3% narrower, and a part may fill 92% of its lines.
const WIDTH_SAFETY = 0.97;
const FILL = 0.92;
const FACES = [
  { key: 'regular', style: 'normal', weight: '400' },
  { key: 'bold', style: 'normal', weight: '700' },
  { key: 'italic', style: 'italic', weight: '400' },
  { key: 'boldItalic', style: 'italic', weight: '700' },
];
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

// The font file for each Caladea face: latin subset (the one holding U+0020).
function caladeaFiles() {
  const css = readFileSync(FONTS_CSS, 'utf8');
  const found = {};
  for (const m of css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)) {
    if (m[1] !== 'latin' || !/font-family:\s*'Caladea'/.test(m[2])) continue;
    const style = m[2].match(/font-style:\s*(\w+)/)[1], weight = m[2].match(/font-weight:\s*(\d+)/)[1];
    found[`${style}/${weight}`] = 'public' + m[2].match(/url\(([^)]+)\)/)[1];
  }
  return Object.fromEntries(FACES.map(f => {
    const file = found[`${f.style}/${f.weight}`];
    if (!file) throw new Error(`Caladea ${f.style} ${f.weight} (latin) missing from ${FONTS_CSS}`);
    return [f.key, file];
  }));
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

/** Width of `text` in em for a font entry from lesson-type.json (regular face by default). */
export function widthEm(type, text, face = 'regular') {
  const f = type.fonts[face];
  let units = 0;
  for (const ch of text) units += f.widths[ch] ?? f.widths['n'];
  return units / f.unitsPerEm;
}

export function calibrate() {
  const files = caladeaFiles();
  const fonts = {};
  for (const [key, file] of Object.entries(files)) fonts[key] = { file, ...measureFace(file) };

  // Average advance of lesson prose in the regular face, weighted by how often each character occurs.
  const reg = fonts.regular;
  let units = 0, count = 0;
  for (const ch of lessonProse()) {
    if (ch === '\n') continue;
    units += reg.widths[ch] ?? reg.widths['n'];
    count++;
  }
  const avgEm = units / count / reg.unitsPerEm;

  const shapes = {};
  for (const [name, s] of Object.entries(SHAPES)) {
    const [w, h] = s.aspect;
    const fontSizeShare = w / (s.charsPerLine * avgEm); // font size as a share of text-box width
    const lineWidthEm = +(s.charsPerLine * avgEm * WIDTH_SAFETY).toFixed(3);
    const maxLines = Math.floor(h / (fontSizeShare * LINE_HEIGHT));
    shapes[name] = {
      aspect: s.aspect.join(':'),
      charsPerLine: s.charsPerLine,
      lineWidthEm,
      maxLines,
      capacityChars: Math.floor(maxLines * s.charsPerLine * FILL),
    };
  }
  // One set of parts must fit both shapes, so the divider packs to the tighter shape.
  const governing = Object.entries(shapes).sort((a, b) => a[1].capacityChars - b[1].capacityChars)[0][0];
  return {
    note: 'GENERATED by scripts/calibrate-lesson-type.mjs; do not edit by hand. Widths are font units; divide by unitsPerEm for em.',
    font: 'Caladea (same advance widths as Cambria)',
    lineHeight: LINE_HEIGHT,
    widthSafety: WIDTH_SAFETY,
    fill: FILL,
    averageCharEm: +avgEm.toFixed(4),
    shapes,
    governingShape: governing,
    partBudget: {
      lines: shapes[governing].maxLines,
      chars: shapes[governing].capacityChars,
    },
    fonts,
  };
}

function checkBudgets(t) {
  const problems = [];
  const caps = Object.values(t.shapes).map(s => s.capacityChars);
  if (Math.max(...caps) / Math.min(...caps) > 1.2) problems.push(`shapes hold different amounts of text: ${caps.join(' vs ')} characters`);
  for (const [name, s] of Object.entries(t.shapes)) {
    if (Math.abs(s.charsPerLine - { portrait: 38, landscape: 68 }[name]) > 0) problems.push(`${name}: chars per line is not the decided value`);
    if (s.maxLines < 8) problems.push(`${name}: fewer than 8 lines`);
  }
  for (const [key, f] of Object.entries(t.fonts)) if (!f.widths[' '] || !f.widths['e']) problems.push(`${key}: missing basic glyph widths`);
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
    console.log(`calibrate-lesson-type: ok (${next.governingShape} governs: ${next.partBudget.lines} lines, ${next.partBudget.chars} chars per part)`);
  } else {
    const problems = checkBudgets(next);
    writeFileSync(OUT, json);
    console.log(`calibrate-lesson-type: wrote ${OUT}`);
    for (const [n, s] of Object.entries(next.shapes)) console.log(`  ${n}: ${s.charsPerLine}/line, ${s.maxLines} lines, ${s.capacityChars} chars`);
    console.log(`  part budget: ${next.partBudget.lines} lines, ${next.partBudget.chars} chars (${next.governingShape} governs); avg char ${next.averageCharEm} em`);
    if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
  }
}
