// Guards: static rules that stop workarounds from overriding contract-owned surfaces.
// Violations present when guards were adopted live in .roa/guard-baseline.json and may only shrink.
import { createHash } from 'node:crypto';

// Replace comments (and optionally string/template contents) with spaces, keeping line structure.
export function stripJs(src, { strings = false } = {}) {
  let out = '', i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') { out += ' '; i++; } continue; }
    if (c === '/' && d === '*') { out += '  '; i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { out += src[i] === '\n' ? '\n' : ' '; i++; } out += '  '; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; out += q; i++;
      while (i < n && src[i] !== q) {
        if (src[i] === '\\') { out += strings ? '  ' : src.slice(i, i + 2); i += 2; continue; }
        out += strings ? (src[i] === '\n' ? '\n' : ' ') : src[i]; i++;
      }
      out += q; i++; continue;
    }
    out += c; i++;
  }
  return out;
}
export const stripCss = src => src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normColor = c => { let h = c.toLowerCase(); if (/^#[0-9a-f]{3}$/.test(h)) h = '#' + [...h.slice(1)].map(x => x + x).join(''); return h; };

// ctx: { ownedProps: Set('--x'), tokenColors: Set('#rrggbb'), forbid: [{pattern, paths?, message}] }
export function scanFile(path, src, ctx) {
  const out = [];
  const lines = src.split('\n');
  const push = (rule, index, message) => {
    const line = src.slice(0, index).split('\n').length;
    out.push({ rule, file: path, line, text: (lines[line - 1] || '').trim().slice(0, 160), message });
  };
  if (/\.css$/.test(path)) {
    const css = stripCss(src);
    for (const m of css.matchAll(/!important/g)) push('css-important', m.index, '!important overrides the cascade; fix specificity instead');
    for (const m of css.matchAll(/(^|[;{\s])(--[a-zA-Z0-9-]+)\s*:/g)) if (ctx.ownedProps.has(m[2])) push('css-owned-prop', m.index + m[1].length, `${m[2]} is owned by a contract; change it with roa set`);
    for (const m of css.matchAll(/(?<![\w-])z-index\s*:\s*-?\d+/g)) push('css-z-index-literal', m.index, 'literal z-index; use a layout layer variable (var(--layer-*))');
    for (const m of css.matchAll(/:[^;{}]*?(#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b)/g)) if (ctx.tokenColors.has(normColor(m[1]))) push('css-raw-color', m.index + m[0].indexOf(m[1]), `${m[1]} duplicates a design token; use its variable`);
  }
  if (/\.(m?js|ts|jsx|tsx)$/.test(path)) {
    const code = stripJs(src, { strings: true });
    const codeStr = stripJs(src);
    for (const m of code.matchAll(/\bnew\s+MutationObserver\b/g)) push('js-mutation-observer', m.index, 'post-render repair via MutationObserver');
    for (const m of code.matchAll(/\b(document\.)?head\.(appendChild|append|prepend|insertBefore)\s*\(/g)) push('js-head-inject', m.index, 'runtime stylesheet/script injection into <head>');
    for (const m of codeStr.matchAll(/\.style\.setProperty\(\s*(['"`])(--[a-zA-Z0-9-]+)\1/g)) if (ctx.ownedProps.has(m[2])) push('js-owned-style', m.index, `${m[2]} is owned by a contract`);
    for (const m of code.matchAll(/\.style\.zIndex\s*=/g)) push('js-owned-style', m.index, 'z-index is owned by the layout contract');
    for (const m of codeStr.matchAll(/\[data-region=[^\]]*\][^;\n]*\.(innerHTML|outerHTML)\s*=/g)) push('js-region-innerhtml', m.index, 'innerHTML into a layout-owned region');
  }
  for (const f of ctx.forbid || []) {
    if (!f.pattern) continue;
    if (f.paths && !f.paths.some(p => path.startsWith(p))) continue;
    for (const m of src.matchAll(new RegExp(f.pattern, 'g'))) push('forbid', m.index, f.message || `forbidden pattern ${f.pattern}`);
  }
  return out;
}

export const fingerprint = v => createHash('sha256').update(`${v.rule}\0${v.file}\0${v.text}`).digest('hex').slice(0, 16);

// Count violations per fingerprint; compare against baseline counts.
export function tally(violations) {
  const m = new Map();
  for (const v of violations) { const k = fingerprint(v); const e = m.get(k) || { rule: v.rule, file: v.file, text: v.text, count: 0 }; e.count++; m.set(k, e); }
  return m;
}

export function compare(current, baseline) {
  const fresh = [];
  for (const [k, e] of current) { const allowed = baseline[k]?.count || 0; if (e.count > allowed) fresh.push({ ...e, over: e.count - allowed }); }
  const shrunk = {};
  for (const [k, e] of Object.entries(baseline)) { const now = current.get(k)?.count || 0; if (now > 0) shrunk[k] = { ...e, count: Math.min(now, e.count) }; }
  return { fresh, shrunk };
}

export { esc, normColor };
