// Cross-field checks declared by contracts. Each check reads resolved values by path and returns
// error strings with the computed numbers, so failures explain themselves.
import { get } from './paths.mjs';
import { lengthToPx } from './types.mjs';

export function parseColor(c) {
  const s = String(c).trim();
  let m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map(x => x + x).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  }
  m = s.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  return m ? [m[1], m[2], m[3]].map(Number) : null;
}

export function luminance([r, g, b]) {
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a, b) {
  const ca = parseColor(a), cb = parseColor(b);
  if (!ca || !cb) return null;
  const [hi, lo] = [luminance(ca), luminance(cb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const round = n => Math.round(n * 100) / 100;

// Expand a path containing '*' segments against values; returns [{path, stars: [..]}].
export function expand(values, pattern) {
  const parts = pattern.split('.');
  const out = [];
  const walk = (node, i, acc, stars) => {
    if (i === parts.length) { out.push({ path: acc.join('.'), stars }); return; }
    const p = parts[i];
    if (p === '*') { if (node && typeof node === 'object') for (const k of Object.keys(node)) walk(node[k], i + 1, [...acc, k], [...stars, k]); return; }
    if (node && typeof node === 'object' && p in node) walk(node[p], i + 1, [...acc, p], stars);
  };
  walk(values, 0, [], []);
  return out;
}
const fill = (pattern, stars) => { let i = 0; return pattern.split('.').map(p => (p === '*' ? stars[i++] : p)).join('.'); };

export const CHECKS = {
  contrast(values, c) {
    if (c.fg.includes('*')) return expand(values, c.fg).flatMap(({ stars }) => CHECKS.contrast(values, { ...c, fg: fill(c.fg, stars), bg: fill(c.bg, stars) }));
    const fg = get(values, c.fg), bg = get(values, c.bg);
    const ratio = contrastRatio(fg, bg);
    if (ratio === null) return [`contrast ${c.fg} on ${c.bg}: cannot compute (${fg} / ${bg})`];
    return ratio + 1e-9 < c.min ? [`contrast ${c.fg} (${fg}) on ${c.bg} (${bg}) is ${round(ratio)}:1, needs ${c.min}:1`] : [];
  },
  lessThan(values, c) {
    const a = lengthToPx(get(values, c.a)), b = lengthToPx(get(values, c.b));
    if (a === null || b === null) return [`lessThan ${c.a} < ${c.b}: only px/rem lengths are comparable`];
    return a < b ? [] : [`lessThan: ${c.a} (${a}px) must be less than ${c.b} (${b}px)`];
  },
  fits(values, c) {
    const cols = (get(values, c.columns) || []).map(lengthToPx);
    const gap = lengthToPx(get(values, c.gap) ?? '0');
    const within = lengthToPx(get(values, c.within));
    if (cols.some(x => x === null) || gap === null || within === null) return [`fits ${c.columns}: column minimums, gap, and width must be px/rem`];
    const total = cols.reduce((s, x) => s + x, 0) + gap * Math.max(cols.length - 1, 0);
    return total <= within ? [] : [`fits: ${c.columns} needs ${total}px (columns ${cols.join('+')} + gaps ${gap}x${cols.length - 1}) but ${c.within} is ${within}px`];
  },
  allPlaced(values, c) {
    const regions = get(values, c.regions) || [];
    const areas = (get(values, c.areas) || []).join(' ').split(/\s+/).filter(Boolean);
    const overlays = c.overlays ? Object.keys(get(values, c.overlays) || {}) : [];
    const missing = regions.filter(r => !areas.includes(r) && !overlays.includes(r));
    return missing.length ? [`allPlaced: ${missing.join(', ')} not placed in ${c.areas}${c.overlays ? ` or ${c.overlays}` : ''}`] : [];
  },
  uniformKeys(values, c) {
    const maps = expand(values, c.maps);
    if (!maps.length) return [`uniformKeys: nothing matches ${c.maps}`];
    const all = [...new Set(maps.flatMap(m => Object.keys(get(values, m.path) || {})))].sort();
    return maps.flatMap(m => { const keys = Object.keys(get(values, m.path) || {}); const missing = all.filter(k => !keys.includes(k)); return missing.length ? [`uniformKeys: ${m.path} is missing ${missing.join(', ')}`] : []; });
  },
  themeContrast(values, c) {
    const pairs = get(values, c.pairs) || [];
    const errs = [];
    for (const { path } of expand(values, c.maps)) for (const p of pairs) errs.push(...CHECKS.contrast(values, { fg: `${path}.${p.fg}`, bg: `${path}.${p.bg}`, min: p.min }));
    return errs;
  },
  ascending(values, c) {
    const entries = Object.entries(get(values, c.map) || {}).map(([k, v]) => [k, lengthToPx(v)]);
    if (entries.some(([, v]) => v === null)) return [`ascending: ${c.map} values must be px/rem`];
    const errs = [];
    for (let i = 1; i < entries.length; i++) if (entries[i][1] <= entries[i - 1][1]) errs.push(`ascending: ${c.map}.${entries[i][0]} (${entries[i][1]}px) must be larger than ${entries[i - 1][0]} (${entries[i - 1][1]}px)`);
    return errs;
  },
  screenLayout(values, c) {
    const screens = get(values, c.screens) || {}, bps = get(values, c.breakpoints) || {};
    const floor = lengthToPx(get(values, c.minViewport));
    const errs = [];
    const colMin = col => { const s = String(col).trim(); const m = s.match(/^minmax\(\s*([^,]+),/); const v = lengthToPx(m ? m[1] : s); return v === null ? 0 : v; };
    for (const [id, sc] of Object.entries(screens)) {
      for (const [bp, spec] of Object.entries(sc.at || {})) {
        if (!(bp in bps)) { errs.push(`screenLayout: screens.${id}.at.${bp} is not a breakpoint (${Object.keys(bps).join(', ')})`); continue; }
        const width = Math.max(lengthToPx(bps[bp]) || 0, floor || 0);
        const rows = spec.areas.map(r => r.split(' '));
        if (rows.some(r => r.length !== spec.columns.length)) errs.push(`screenLayout: screens.${id}.at.${bp} areas rows must each have ${spec.columns.length} cells (one per column)`);
        const placed = new Set([...rows.flat(), ...Object.keys(spec.overlays || {})]);
        for (const name of placed) if (!sc.regions.includes(name)) errs.push(`screenLayout: screens.${id}.at.${bp} places unknown region "${name}"`);
        const missing = sc.regions.filter(r => !placed.has(r));
        if (missing.length) errs.push(`screenLayout: screens.${id}.at.${bp} does not place ${missing.join(', ')}`);
        const gap = lengthToPx(spec.gap) || 0;
        const need = spec.columns.reduce((n, col) => n + colMin(col), 0) + gap * (spec.columns.length - 1);
        if (need > width) errs.push(`screenLayout: screens.${id}.at.${bp} needs ${need}px of columns and gaps but the breakpoint starts at ${width}px`);
      }
    }
    return errs;
  },
  keyOf(values, c) {
    const key = get(values, c.key), map = get(values, c.map) || {};
    return key in map ? [] : [`keyOf: ${c.key} is "${key}", which is not a key of ${c.map} (${Object.keys(map).join(', ')})`];
  },
  sameKeysAs(values, c) {
    const ref = Object.keys(get(values, c.of) || {}).sort();
    const errs = [];
    for (const p of c.maps) {
      const keys = Object.keys(get(values, p) || {}).sort();
      const missing = ref.filter(k => !keys.includes(k)), extra = keys.filter(k => !ref.includes(k));
      if (missing.length || extra.length) errs.push(`sameKeysAs: ${p} differs from ${c.of}${missing.length ? `; missing ${missing.join(', ')}` : ''}${extra.length ? `; extra ${extra.join(', ')}` : ''}`);
    }
    return errs;
  }
};

export function runChecks(values, checks = []) {
  const errs = [];
  for (const c of checks) {
    if (!CHECKS[c.rule]) { errs.push(`unknown check rule "${c.rule}"`); continue; }
    errs.push(...CHECKS[c.rule](values, c));
  }
  return errs;
}
