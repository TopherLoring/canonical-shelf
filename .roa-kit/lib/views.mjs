// Views turn validated, resolved contract values into plain data for a pack template.
// Views are pure: same input, same output; no filesystem, network, or clock.
import { schemaAt } from './paths.mjs';
import { lengthToPx } from './types.mjs';

const kebab = s => String(s).replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[._\s]+/g, '-').toLowerCase();

// Every leaf path whose schema node (or an ancestor) emits to outputId, with its resolved value.
export function emitted(schema, values, outputId, path = '', inherited = false) {
  const node = path ? schemaAt(schema, path) : schema;
  const here = inherited || (node?.emit || []).includes(outputId);
  const v = path ? path.split('.').reduce((o, k) => o?.[k], values) : values;
  if (!node) return [];
  if (node.type === 'object') return Object.keys(node.props || {}).flatMap(k => v?.[k] === undefined ? [] : emitted(schema, values, outputId, path ? `${path}.${k}` : k, here));
  if (node.type === 'map' || node.type === 'list') {
    const keys = node.type === 'map' ? Object.keys(v || {}) : (v || []).map((_, i) => String(i));
    const childEmits = (node.of?.emit || []).includes(outputId);
    return keys.flatMap(k => emitted(schema, values, outputId, path ? `${path}.${k}` : k, here || childEmits));
  }
  return here ? [{ path, value: v }] : [];
}

export const VIEWS = {
  // Flat custom properties: {vars: [{name, value}]}
  vars({ def, resolved, outputId, output }) {
    const prefix = output.prefix ? `${output.prefix}-` : '';
    return { vars: emitted(def.schema, resolved, outputId).map(({ path, value }) => ({ name: `--${prefix}${kebab(path)}`, value: String(value) })) };
  },
  // Themed custom properties: base groups on :root, then one light and one dark block per theme.
  // The default theme also matches html:not([data-theme]). Aliases share each theme's block.
  'themed-vars'({ resolved }) {
    const base = [];
    for (const group of Object.keys(resolved.base || {})) for (const [k, v] of Object.entries(resolved.base[group])) base.push({ name: `--${k}`, value: String(v) });
    const blocks = [];
    for (const [id, theme] of Object.entries(resolved.themes || {})) {
      const ids = [id, ...(theme.aliases || [])];
      for (const mode of ['light', 'dark']) {
        const suffix = mode === 'dark' ? "[data-mode='dark']" : '';
        const sels = ids.map(t => `html[data-theme='${t}']${suffix}`);
        if (resolved.default?.theme === id) sels.splice(1, 0, `html:not([data-theme])${suffix}`);
        blocks.push({ comment: `${theme.name || id} — ${mode}`, selectorText: sels.join(',\n'), vars: Object.entries(theme.modes[mode]).map(([k, v]) => ({ name: `--${k}`, value: String(v) })) });
      }
    }
    return { base, blocks };
  },
  // Theme contract: font imports, shared values, derived colors, migration aliases, then one block per
  // theme for its style and light palette and one for its dark palette. camelCase keys become kebab-case.
  'theme-vars'({ resolved }) {
    const kebab = k => k.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
    const sh = resolved.shared || {};
    const shared = [];
    for (const [k, v] of Object.entries(sh.typeScale || {})) shared.push({ name: `--type-${kebab(k)}`, value: String(v) });
    for (const [k, v] of Object.entries(sh.lineHeights || {})) shared.push({ name: `--leading-${kebab(k)}`, value: String(v) });
    for (const [k, v] of Object.entries(sh.spacing || {})) shared.push({ name: `--space-${kebab(k).replace(/^s/, '')}`, value: String(v) });
    for (const [k, v] of Object.entries(sh.motion || {})) shared.push({ name: `--motion-${kebab(k)}`, value: String(v) });
    for (const [k, v] of Object.entries(sh.layers || {})) shared.push({ name: `--layer-${kebab(k)}`, value: String(v) });
    for (const [k, v] of Object.entries(sh.bibleCategories || {})) shared.push({ name: `--bible-${k}`, value: String(v) });
    for (const [k, v] of Object.entries(sh.fonts || {})) shared.push({ name: `--font-${k}`, value: String(v) });
    // Layout measurements shared by every theme (until the layout contract owns them).
    for (const [k, v] of Object.entries(sh.measures || {})) shared.push({ name: `--${k}`, value: String(v) });
    const derived = [
      ['--color-action-hover', 'color-mix(in srgb, var(--color-action) 82%, var(--color-text))'],
      ['--color-action-subtle', 'color-mix(in srgb, var(--color-action) 12%, var(--color-surface))'],
      ['--color-selection', 'color-mix(in srgb, var(--color-action) 16%, var(--color-surface))'],
      ['--color-disabled', 'color-mix(in srgb, var(--color-text-muted) 55%, var(--color-surface))'],
      ['--focus-ring', 'var(--color-action)'],
      // Inverse surfaces (the Theologian panel and other high-contrast chrome) swap text and page roles.
      ['--color-inverse', 'var(--color-text)'],
      ['--color-inverse-2', 'color-mix(in srgb, var(--color-text) 88%, var(--color-page))'],
      ['--color-on-inverse', 'var(--color-page)'],
      ['--color-on-inverse-muted', 'color-mix(in srgb, var(--color-page) 74%, var(--color-text))'],
      ['--bible-history-ot', 'var(--bible-othist)'],
      ['--bible-major-prophets', 'var(--bible-major)'],
      ['--bible-minor-prophets', 'var(--bible-minor)'],
      ['--bible-apocalypse', 'var(--bible-apoc)'],
      ['--bible-history-nt', 'var(--bible-gospel)']
    ].map(([name, value]) => ({ name, value }));
    const aliases = Object.entries(resolved.aliases || {}).map(([k, v]) => ({ name: `--${k}`, value: String(v) }));
    const imports = [...new Set(Object.values(resolved.themes || {}).flatMap(t => t.fontImports || []))].map(url => ({ url }));
    const blocks = [];
    for (const [id, theme] of Object.entries(resolved.themes || {})) {
      const isDefault = resolved.default?.theme === id;
      const sel = mode => [`html[data-theme='${id}']${mode === 'dark' ? "[data-mode='dark']" : ''}`, ...(isDefault ? [`html:not([data-theme])${mode === 'dark' ? "[data-mode='dark']" : ''}`] : [])].join(',\n');
      const style = Object.entries(theme.style || {}).filter(([k]) => !['illustrations'].includes(k)).map(([k, v]) => ({ name: `--${kebab(k)}`, value: String(v) }));
      // Palette roles become --color-*; optional per-mode shadows override the style's shadows.
      const colors = mode => {
        const m = theme.modes[mode];
        const vars = [];
        for (const [k, v] of Object.entries(m)) {
          if (k === 'ornaments') continue;
          if (k === 'highlight') {
            for (const [hk, hv] of Object.entries(v)) {
              vars.push({ name: `--color-highlight-${kebab(hk)}`, value: String(hv) });
              vars.push({ name: `--highlight-${kebab(hk)}`, value: String(hv) });
            }
            continue;
          }
          if (k === 'bibleCategories') {
            for (const [bk, bv] of Object.entries(v)) {
              vars.push({ name: `--bible-${kebab(bk)}`, value: String(bv) });
            }
            continue;
          }
          vars.push({ name: k.startsWith('shadow') ? `--${kebab(k)}` : `--color-${kebab(k)}`, value: String(v) });
        }
        // Ornaments: six decorative slots; a theme with fewer repeats them, one with none falls back to action/accent.
        const orn = (m.ornaments && m.ornaments.length ? m.ornaments : [m.action, m.accent || m.action]).map(String);
        for (let i = 0; i < 6; i++) vars.push({ name: `--ornament-${i + 1}`, value: orn[i % orn.length] });
        return vars;
      };
      // Aliases repeat in both blocks so they outrank older theme-specific definitions of the same names.
      blocks.push({ comment: `${theme.name} — style and light palette`, selectorText: sel('light'), vars: [...style, ...colors('light'), ...aliases] });
      blocks.push({ comment: `${theme.name} — dark palette`, selectorText: sel('dark'), vars: [...colors('dark'), ...aliases] });
    }
    // Swatch colors for every theme, so a picker can preview all themes at once (no inline styles needed).
    for (const [id, t] of Object.entries(resolved.themes || {})) {
      const sw = mode => ['page', 'surface', 'text', 'action', 'accent'].map(k => ({ name: `--swatch-${k}`, value: String(t.modes[mode][k] || t.modes[mode].action) }));
      blocks.push({ comment: `${t.name} — swatch`, selectorText: `[data-theme-swatch='${id}']`, vars: sw('light') });
      blocks.push({ comment: `${t.name} — swatch, dark`, selectorText: `html[data-mode='dark'] [data-theme-swatch='${id}']`, vars: sw('dark') });
    }
    return { imports, shared, derived, aliases: [], blocks };
  },
  // Theme list for the app's picker: id, name, summary, browser theme colors, and a 3-color swatch.
  'theme-list'({ resolved }) {
    const themes = Object.entries(resolved.themes || {}).filter(([, t]) => !t.hidden).map(([id, t]) => ({
      json: JSON.stringify({ id, name: t.name, summary: t.description, themeColor: t.modes.light.page, darkThemeColor: t.modes.dark.page, swatch: [t.modes.light.page, t.modes.light.text, t.modes.light.action, t.modes.light.accent || t.modes.light.action], darkSwatch: [t.modes.dark.page, t.modes.dark.text, t.modes.dark.action, t.modes.dark.accent || t.modes.dark.action], illustrations: t.style?.illustrations || 'none', nativeMode: t.nativeMode || null })
    }));
    return { themes, defaultTheme: JSON.stringify(resolved.default?.theme || ''), defaultMode: JSON.stringify(resolved.default?.mode || 'system') };
  },
  // Layout: container and layer variables, then grid rules per screen and breakpoint.
  layout({ resolved }) {
    const bps = Object.entries(resolved.breakpoints || {});
    const vars = [];
    for (const [id, c] of Object.entries(resolved.containers || {})) vars.push({ name: `--container-${id}-max`, value: c.max }, { name: `--container-${id}-pad`, value: c.pad });
    (resolved.layers || []).forEach((l, i) => vars.push({ name: `--layer-${l}`, value: String((i + 1) * 10) }));
    const OVERLAY = {
      'sheet-right': 'position: fixed; inset: 0 0 0 auto; width: min(24rem, 100%); overflow: auto; z-index: var(--layer-sheet, auto);',
      'sheet-bottom': 'position: fixed; inset: auto 0 0 0; max-height: 85dvh; overflow: auto; z-index: var(--layer-sheet, auto);',
      'drawer-left': 'position: fixed; inset: 0 auto 0 0; width: min(20rem, 100%); overflow: auto; z-index: var(--layer-sheet, auto);',
      hidden: 'display: none;'
    };
    const media = [];
    for (const [bp, min] of bps) {
      const rules = [];
      for (const [id, sc] of Object.entries(resolved.screens || {})) {
        const spec = sc.at?.[bp];
        if (!spec) continue;
        rules.push({ selector: `[data-screen='${id}']`, body: `display: grid; grid-template-columns: ${spec.columns.join(' ')};${spec.rows ? ` grid-template-rows: ${spec.rows.join(' ')};` : ''} grid-template-areas: ${spec.areas.map(a => `"${a}"`).join(' ')}; gap: ${spec.gap};` });
        const inGrid = new Set(spec.areas.join(' ').split(' '));
        for (const r of sc.regions) {
          if (inGrid.has(r)) rules.push({ selector: `[data-screen='${id}'] > [data-region='${r}']`, body: `grid-area: ${r}; position: static; display: revert;` });
          else if (spec.overlays?.[r]) rules.push({ selector: `[data-screen='${id}'] > [data-region='${r}']`, body: OVERLAY[spec.overlays[r]] });
        }
      }
      if (!rules.length) continue;
      const zero = lengthToPx(min) === 0;
      media.push({ open: zero ? '' : `@media (min-width: ${min}) {\n`, close: zero ? '' : '}\n', rules: rules.map(r => ({ ...r, indent: zero ? '' : '  ' })), label: bp });
    }
    return { vars, media };
  },
  // Human reference table for any contract: {name, version, description, rows: [{path, type, value, rules}], checks: [...]}
  'reference-table'({ def, resolved }) {
    const rows = [];
    const walk = (node, v, path) => {
      if (!node || v === undefined) return;
      if (node.type === 'object') { for (const k of Object.keys(node.props || {})) walk(node.props[k], v?.[k], path ? `${path}.${k}` : k); return; }
      if (node.type === 'map') { for (const k of Object.keys(v || {})) walk(node.of, v[k], path ? `${path}.${k}` : k); return; }
      if (node.type === 'list') { rows.push({ path, type: `list of ${node.of?.type}`, value: (v || []).map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(', ') || '—', rules: rules(node) }); return; }
      rows.push({ path, type: node.type, value: String(v).replace(/\|/g, '\\|'), rules: rules(node) });
    };
    walk(def.schema, resolved, '');
    const checks = (def.checks || []).map(c => ({ text: Object.entries(c).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ') }));
    return { name: def.contract, version: def.version, description: def.description, rows, checks };
  }
};

function rules(node) {
  const r = [];
  for (const k of ['min', 'max', 'pattern', 'minItems', 'maxItems']) if (node[k] !== undefined) r.push(`${k} ${node[k]}`);
  if (node.unique) r.push('unique');
  if (node.type === 'enum') r.push(`one of ${node.options.join(', ')}`);
  return r.join('; ') || '—';
}
