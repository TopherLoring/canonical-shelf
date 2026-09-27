// Logic-less template renderer. Supported syntax only:
//   {{path}}                      value at a dot path in the current scope ({{.}} is the scope itself)
//   {{#each path}}...{{/each}}    repeat for each item of a list; the item becomes the scope
//   {{#if path}}...{{/if}}        render when the value is truthy (non-empty for lists)
// Anything else inside {{ }} is a render error. Missing values are errors, never blanks.
const TAG = /\{\{\s*([#/]?)([a-zA-Z0-9_.$-]*)(?:\s+([a-zA-Z0-9_.$-]+))?\s*\}\}/g;

function lookup(scopes, path) {
  if (path === '.') return scopes[0];
  for (const scope of scopes) {
    let cur = scope, found = true;
    for (const p of path.split('.')) { if (cur !== null && typeof cur === 'object' && p in cur) cur = cur[p]; else { found = false; break; } }
    if (found) return cur;
  }
  return undefined;
}

function parse(tpl) {
  const root = { children: [] };
  const stack = [root];
  let last = 0;
  for (const m of tpl.matchAll(/\{\{([^}]*)\}\}/g)) {
    const inner = m[1].trim();
    stack.at(-1).children.push(tpl.slice(last, m.index));
    last = m.index + m[0].length;
    let mm;
    if ((mm = inner.match(/^#(each|if)\s+([a-zA-Z0-9_.$-]+)$/))) { const node = { block: mm[1], path: mm[2], children: [] }; stack.at(-1).children.push(node); stack.push(node); }
    else if ((mm = inner.match(/^\/(each|if)$/))) { const open = stack.pop(); if (!open || open.block !== mm[1]) throw new Error(`template: unexpected {{/${mm[1]}}}`); }
    else if (/^([a-zA-Z0-9_$-]+(\.[a-zA-Z0-9_$-]+)*|\.)$/.test(inner)) stack.at(-1).children.push({ value: inner });
    else throw new Error(`template: unsupported tag {{${inner}}}`);
  }
  stack.at(-1).children.push(tpl.slice(last));
  if (stack.length !== 1) throw new Error(`template: unclosed {{#${stack.at(-1).block}}}`);
  return root;
}

function run(node, scopes) {
  let out = '';
  for (const c of node.children) {
    if (typeof c === 'string') { out += c; continue; }
    if (c.value !== undefined) {
      const v = lookup(scopes, c.value);
      if (v === undefined || v === null || typeof v === 'object') throw new Error(`template: {{${c.value}}} is ${v === undefined ? 'missing' : 'not a scalar'}`);
      out += String(v);
      continue;
    }
    const v = lookup(scopes, c.path);
    if (c.block === 'if') { if (Array.isArray(v) ? v.length : v) out += run(c, scopes); continue; }
    if (!Array.isArray(v)) throw new Error(`template: {{#each ${c.path}}} needs a list`);
    for (const item of v) out += run(c, [item, ...scopes]);
  }
  return out;
}

export function render(template, data) { return run(parse(template), [data]); }
