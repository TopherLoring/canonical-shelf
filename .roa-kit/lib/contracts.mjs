// Contract registry. A contract definition (kit: contracts/<name>.json, pinned copy in the project at
// .roa/contracts/<name>.json) declares a typed schema, cross-field checks, and outputs. The project's
// filled blanks live in .roa/values/<name>.json and change only through `roa set/add/remove`.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validate, validateSchema } from './types.mjs';
import { resolveAll } from './refs.mjs';
import { runChecks, CHECKS } from './constraints.mjs';

const NAME_RE = /^[a-z][a-z0-9-]{0,39}$/;
const OUTPUT_ID_RE = /^[a-z][a-z0-9-]{0,39}$/;

const readJson = (p, errs) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { errs.push(`${p}: ${e.message}`); return null; } };

// Collect every emit tag in a schema tree.
function emits(node, path = '$', out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node.emit)) for (const e of node.emit) out.push({ path, output: e });
  if (node.type === 'object') for (const [k, c] of Object.entries(node.props || {})) emits(c, `${path}.${k}`, out);
  if (node.type === 'map' || node.type === 'list') emits(node.of, `${path}.*`, out);
  return out;
}

export function validateDefinition(def, file = 'contract') {
  const errs = [];
  if (!def || typeof def !== 'object') return [`${file}: not an object`];
  const allowed = ['$schema', 'contract', 'version', 'description', 'schema', 'checks', 'outputs', 'owns'];
  for (const k of Object.keys(def)) if (!allowed.includes(k)) errs.push(`${file}: unknown key "${k}"`);
  if (typeof def.contract !== 'string' || !NAME_RE.test(def.contract)) errs.push(`${file}: contract must be a lowercase name`);
  if (!Number.isInteger(def.version) || def.version < 1) errs.push(`${file}: version must be a positive integer`);
  if (typeof def.description !== 'string' || !def.description.trim()) errs.push(`${file}: description is required`);
  if (!def.schema || def.schema.type !== 'object') errs.push(`${file}: schema must be an object node`);
  else errs.push(...validateSchema(def.schema).map(e => `${file}: schema ${e}`));
  for (const c of def.checks || []) if (!CHECKS[c.rule]) errs.push(`${file}: unknown check rule "${c.rule}"`);
  const outputs = def.outputs || {};
  for (const [id, o] of Object.entries(outputs)) {
    if (!OUTPUT_ID_RE.test(id)) errs.push(`${file}: output id "${id}" must be lowercase`);
    if (!o || typeof o.target !== 'string' || typeof o.view !== 'string' || typeof o.path !== 'string') errs.push(`${file}: output "${id}" needs target, view, and path`);
    else if (o.path.startsWith('/') || o.path.includes('..')) errs.push(`${file}: output "${id}" path must be relative inside the repo`);
  }
  for (const { path, output } of emits(def.schema)) if (!(output in outputs)) errs.push(`${file}: ${path} emits to undeclared output "${output}"`);
  if (def.owns !== undefined) {
    const o = def.owns;
    const okList = v => v === undefined || (Array.isArray(v) && v.every(x => typeof x === 'string'));
    if (typeof o !== 'object' || !okList(o.cssProperties) || !okList(o.customPropertyPrefixes) || !okList(o.files)) errs.push(`${file}: owns must contain string lists cssProperties, customPropertyPrefixes, files`);
  }
  return errs;
}

// Loads kit and project contracts. Returns { contracts: {name: {def, values}}, errors, notices }.
export function loadProjectContracts(root, kitDir) {
  const errors = [], notices = [];
  const dir = join(root, '.roa', 'contracts');
  const valDir = join(root, '.roa', 'values');
  const contracts = {};
  if (!existsSync(dir)) return { contracts, errors, notices };
  for (const f of readdirSync(dir).filter(x => x.endsWith('.json')).sort()) {
    const name = f.replace(/\.json$/, '');
    const def = readJson(join(dir, f), errors);
    if (!def) continue;
    const defErrs = validateDefinition(def, `.roa/contracts/${f}`);
    if (def.contract !== name) defErrs.push(`.roa/contracts/${f}: contract name "${def.contract}" must match the file name`);
    errors.push(...defErrs);
    const kitPath = join(kitDir, 'contracts', f);
    if (existsSync(kitPath)) {
      const kitDef = readJson(kitPath, errors);
      if (kitDef && kitDef.version === def.version && JSON.stringify(kitDef) !== JSON.stringify(def)) errors.push(`.roa/contracts/${f} differs from the kit's version ${def.version} definition; pinned definitions are never edited (bump the version in the kit instead)`);
      if (kitDef && kitDef.version > def.version) notices.push(`${name}: kit has version ${kitDef.version}, project pins ${def.version} (upgrade with roa contract upgrade ${name})`);
    } else notices.push(`${name}: no matching definition in the kit (project-local contract)`);
    const vPath = join(valDir, f);
    if (!existsSync(vPath)) { errors.push(`.roa/values/${f} is missing for contract ${name}`); continue; }
    const values = readJson(vPath, errors);
    if (values === null) continue;
    contracts[name] = { def, values };
  }
  if (existsSync(valDir)) for (const f of readdirSync(valDir).filter(x => x.endsWith('.json'))) if (!existsSync(join(dir, f))) errors.push(`.roa/values/${f} has no contract definition`);
  return { contracts, errors, notices };
}

// Full validation: types per contract, references across contracts, then checks on resolved values.
export function evaluate(contracts) {
  const errors = [];
  for (const [name, { def, values }] of Object.entries(contracts)) errors.push(...validate(def.schema, values, name));
  if (errors.length) return { errors, resolved: null, dependents: new Map() };
  const { resolved, errors: refErrs, dependents } = resolveAll(Object.fromEntries(Object.entries(contracts).map(([n, c]) => [n, { schema: c.def.schema, values: c.values }])));
  errors.push(...refErrs);
  if (!refErrs.length) for (const [name, { def }] of Object.entries(contracts)) errors.push(...runChecks(resolved[name], def.checks).map(e => `${name}: ${e}`));
  return { errors, resolved: refErrs.length ? null : resolved, dependents };
}

// Lists the required leaf paths of a schema, for "what must I supply" messages.
export function requiredPaths(node, path = '') {
  if (!node) return [];
  if (node.type === 'object') return Object.entries(node.props || {}).filter(([, c]) => !c.optional).flatMap(([k, c]) => requiredPaths(c, path ? `${path}.${k}` : k));
  return [`${path} (${node.type}${node.type === 'map' || node.type === 'list' ? ` of ${node.of?.type}` : ''})`];
}
