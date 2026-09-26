// Reference resolution across contracts. Any scalar slot may hold {"$ref": "path"} (same contract)
// or {"$ref": "contract:path"}. Resolution follows chains, rejects missing targets, cycles, and
// type mismatches (the resolved value must satisfy the referencing slot's type), and builds a
// dependency graph used by `roa impact`.
import { isRef, validate } from './types.mjs';
import { get, schemaAt } from './paths.mjs';

const qualify = (contract, ref) => (ref.includes(':') ? ref : `${contract}:${ref}`);
const splitQ = q => { const i = q.indexOf(':'); return [q.slice(0, i), q.slice(i + 1)]; };

// Walk values alongside their schema; yield every scalar slot as {qpath, node, value}.
function* slots(contract, schema, value, path = '') {
  if (value === undefined || schema === undefined) return;
  if (isRef(value) || !['object', 'map', 'list'].includes(schema.type)) { yield { qpath: `${contract}:${path}`, node: schema, value }; return; }
  if (schema.type === 'object') for (const [k, child] of Object.entries(schema.props || {})) yield* slots(contract, child, value?.[k], path ? `${path}.${k}` : k);
  if (schema.type === 'map') for (const k of Object.keys(value || {})) yield* slots(contract, schema.of, value[k], path ? `${path}.${k}` : k);
  if (schema.type === 'list') for (let i = 0; i < (value || []).length; i++) yield* slots(contract, schema.of, value[i], path ? `${path}.${i}` : String(i));
}

// contracts: { name: { schema, values } }  ->  { resolved: {name: values}, errors: [], dependents: Map(qpath -> Set(qpath)) }
export function resolveAll(contracts) {
  const errors = [];
  const dependents = new Map();
  const resolved = {};
  const lookup = q => {
    const [c, p] = splitQ(q);
    if (!contracts[c]) return { missing: `unknown contract "${c}"` };
    const value = get(contracts[c].values, p);
    if (value === undefined) return { missing: `nothing at ${q}` };
    return { value, node: schemaAt(contracts[c].schema, p) };
  };
  const resolveValue = (q, chain) => {
    const { value, node, missing } = lookup(q);
    if (missing) return { error: missing };
    if (!isRef(value)) return { value, node };
    const target = qualify(splitQ(q)[0], value.$ref);
    if (chain.includes(target)) return { error: `cycle ${[...chain, target].join(' -> ')}` };
    if (!dependents.has(target)) dependents.set(target, new Set());
    dependents.get(target).add(q);
    return resolveValue(target, [...chain, target]);
  };
  for (const [name, { schema, values }] of Object.entries(contracts)) {
    resolved[name] = structuredClone(values);
    for (const { qpath, node, value } of slots(name, schema, values)) {
      if (!isRef(value)) continue;
      const target = qualify(name, value.$ref);
      if (!dependents.has(target)) dependents.set(target, new Set());
      dependents.get(target).add(qpath);
      const r = resolveValue(target, [qpath, target]);
      if (r.error) { errors.push(`${qpath}: ${r.error}`); continue; }
      const typeErrs = validate(node, r.value, qpath, { allowRefs: false });
      if (typeErrs.length) { errors.push(`${qpath}: reference to ${target} has the wrong type (${typeErrs[0].split(': ').slice(1).join(': ')})`); continue; }
      const [, p] = splitQ(qpath);
      setIn(resolved[name], p, r.value);
    }
  }
  return { resolved, errors, dependents };
}

function setIn(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts.slice(0, -1)) cur = cur[p];
  cur[parts.at(-1)] = value;
}

// Transitive dependents of a qualified path, in breadth-first order.
export function impact(dependents, qpath) {
  const out = [];
  const queue = [qpath];
  const seen = new Set([qpath]);
  while (queue.length) {
    const cur = queue.shift();
    for (const d of dependents.get(cur) || []) if (!seen.has(d)) { seen.add(d); out.push(d); queue.push(d); }
  }
  return out;
}
