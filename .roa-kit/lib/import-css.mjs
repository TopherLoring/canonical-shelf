// One-time extractor: turns an existing stylesheet's custom-property blocks into design-tokens values.
// Recognizes one :root block (base) and theme blocks selected by html[data-theme='id'] (light) or
// html[data-theme='id'][data-mode='dark'] (dark); other ids in the same selector list become aliases,
// and html:not([data-theme]) marks the default theme. Values are sorted into typed base groups.
import { SCALARS } from './types.mjs';

const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '');

function declarations(body) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map(d => d.trim()).filter(Boolean).map(d => { const i = d.indexOf(':'); return [d.slice(0, i).trim(), d.slice(i + 1).trim()]; });
}

export function importDesignTokens(css) {
  const src = stripComments(css);
  const base = { fonts: {}, lengths: {}, colors: {}, durations: {}, values: {} };
  const themes = {};
  let defaultTheme = null;
  const order = [];
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    const decls = declarations(m[2]);
    if (!decls.length || !decls.every(([k]) => k.startsWith('--'))) continue;
    if (selector === ':root') {
      for (const [k, v] of decls) {
        const key = k.slice(2);
        const group = SCALARS.color(v) ? 'colors' : SCALARS.length(v) ? 'lengths' : SCALARS.duration(v) ? 'durations' : SCALARS.font(v) && /,|serif|sans|mono|system-ui/.test(v) ? 'fonts' : 'values';
        base[group][key] = v;
      }
      continue;
    }
    const parts = selector.split(',').map(s => s.trim());
    const ids = [];
    let dark = null, isDefault = false;
    for (const p of parts) {
      if (/^html:not\(\[data-theme\]\)/.test(p)) { isDefault = true; dark = /\[data-mode='dark'\]/.test(p); continue; }
      const mm = p.match(/^html\[data-theme='([a-z0-9-]+)'\](\[data-mode='dark'\])?$/);
      if (!mm) { ids.length = 0; break; }
      ids.push(mm[1]);
      dark = Boolean(mm[2]);
    }
    if (!ids.length) continue;
    const [id, ...aliases] = ids;
    if (!themes[id]) { themes[id] = { name: id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '), ...(aliases.length ? { aliases } : {}), modes: {} }; order.push(id); }
    themes[id].modes[dark ? 'dark' : 'light'] = Object.fromEntries(decls.map(([k, v]) => [k.slice(2), v]));
    if (isDefault) defaultTheme = id;
  }
  for (const g of Object.keys(base)) if (!Object.keys(base[g]).length) delete base[g];
  return { base, themes: Object.fromEntries(order.map(id => [id, themes[id]])), default: { theme: defaultTheme || order[0], mode: 'light' }, contrastPairs: [] };
}

// Custom properties per selector group, for round-trip comparison.
export function customPropertyBlocks(css) {
  const out = {};
  for (const m of stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = declarations(m[2]).filter(([k]) => k.startsWith('--'));
    if (!decls.length) continue;
    const sel = m[1].split(',').map(s => s.trim()).sort().join(',');
    out[sel] = Object.fromEntries(decls);
  }
  return out;
}
