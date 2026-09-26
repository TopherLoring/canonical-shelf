// Dot-path addressing for nested values. Segments are separated by '.', and map keys may contain '-'.
// List items are addressed by numeric index segments.
export function split(path) {
  if (typeof path !== 'string' || !path) throw new Error('path must be a non-empty string');
  const parts = path.split('.');
  if (parts.some(p => !p)) throw new Error(`invalid path "${path}"`);
  return parts;
}

export function get(obj, path) {
  let cur = obj;
  for (const p of split(path)) {
    if (cur === null || typeof cur !== 'object' || !(p in cur)) return undefined;
    cur = cur[p];
  }
  return cur;
}

// Returns a new object with the value set; never mutates the input.
export function set(obj, path, value) {
  const parts = split(path);
  const root = structuredClone(obj ?? {});
  let cur = root;
  parts.slice(0, -1).forEach((p, i) => {
    if (cur[p] === undefined) cur[p] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    if (typeof cur[p] !== 'object' || cur[p] === null) throw new Error(`cannot descend into scalar at "${parts.slice(0, i + 1).join('.')}"`);
    cur = cur[p];
  });
  cur[parts.at(-1)] = value;
  return root;
}

export function remove(obj, path) {
  const parts = split(path);
  const root = structuredClone(obj ?? {});
  const parent = parts.length === 1 ? root : get(root, parts.slice(0, -1).join('.'));
  const last = parts.at(-1);
  if (parent === undefined || parent === null || typeof parent !== 'object' || !(last in parent)) throw new Error(`nothing at "${path}"`);
  if (Array.isArray(parent)) parent.splice(Number(last), 1); else delete parent[last];
  return root;
}

// Resolves the schema node that governs a value path (walks object props, map "of", list "of").
export function schemaAt(schema, path) {
  let node = schema;
  for (const p of split(path)) {
    if (!node) return undefined;
    if (node.type === 'object') node = node.props?.[p];
    else if (node.type === 'map' || node.type === 'list') node = node.of;
    else return undefined;
  }
  return node;
}
