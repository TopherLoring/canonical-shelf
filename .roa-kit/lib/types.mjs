// Typed "blanks" for contracts. A schema node is either a scalar ({type, ...constraints}) or a
// structure: object (closed, fixed props), map (dynamic keys), list (typed items).
// validate(node, value, path) returns an array of error strings; an empty array means valid.

const LENGTH_UNITS = ['px', 'rem', 'em', '%', 'vw', 'vh', 'ch', 'dvh', 'svh', 'lvh', 'vmin', 'vmax'];
const RE = {
  id: /^[a-z0-9][a-z0-9.-]{0,63}$/,
  color: /^(#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})|(rgb|rgba|hsl|hsla)\(\s*[\d.%\s,/+-]+\))$/i,
  length: new RegExp(`^(0|-?\\d*\\.?\\d+(${LENGTH_UNITS.join('|').replace('%', '%')}))$`),
  duration: /^\d*\.?\d+(ms|s)$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  semver: /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/,
  url: /^(https?:\/\/[^\s/$.?#].[^\s]*|\/[^\s]*)$/
};

function balanced(s) {
  let depth = 0;
  for (const ch of s) { if (ch === '(') depth++; if (ch === ')' && --depth < 0) return false; }
  return depth === 0;
}

function fontStack(s) {
  const parts = s.split(',').map(p => p.trim());
  if (!parts.length || parts.some(p => !p)) return false;
  return parts.every(p => /^(["'])[^"']+\1$/.test(p) || /^[A-Za-z][A-Za-z0-9-]*$/.test(p));
}

export const SCALARS = {
  string: v => typeof v === 'string',
  text: v => typeof v === 'string' && v.trim().length > 0,
  id: v => typeof v === 'string' && RE.id.test(v),
  int: v => Number.isInteger(v),
  number: v => typeof v === 'number' && Number.isFinite(v),
  bool: v => typeof v === 'boolean',
  enum: (v, node) => Array.isArray(node.options) && node.options.includes(v),
  color: v => typeof v === 'string' && RE.color.test(v.trim()),
  length: v => typeof v === 'string' && RE.length.test(v.trim()),
  duration: v => typeof v === 'string' && RE.duration.test(v.trim()),
  url: v => typeof v === 'string' && RE.url.test(v),
  email: v => typeof v === 'string' && RE.email.test(v),
  semver: v => typeof v === 'string' && RE.semver.test(v),
  font: v => typeof v === 'string' && fontStack(v),
  'css-value': v => typeof v === 'string' && v.trim().length > 0 && !/[;{}]/.test(v) && balanced(v)
};
export const STRUCTURES = ['object', 'map', 'list'];
export const TYPES = [...Object.keys(SCALARS), ...STRUCTURES, 'ref'];

// Convert px/rem lengths to px for min/max comparisons; other units are not comparable.
export function lengthToPx(v) {
  const m = String(v).trim().match(/^(-?\d*\.?\d+)(px|rem)?$/);
  if (!m) return null;
  if (m[1] === '0' && !m[2]) return 0;
  return m[2] === 'rem' ? Number(m[1]) * 16 : m[2] === 'px' ? Number(m[1]) : (Number(m[1]) === 0 ? 0 : null);
}

function describe(v) { return typeof v === 'string' ? `"${v}"` : JSON.stringify(v); }

export function isRef(v) { return v && typeof v === 'object' && !Array.isArray(v) && typeof v.$ref === 'string' && Object.keys(v).length === 1; }

export function validate(node, value, path = '$', opts = {}) {
  const errs = [];
  if (!node || typeof node !== 'object' || !TYPES.includes(node.type)) return [`${path}: schema has unknown type ${describe(node && node.type)}`];
  if (isRef(value) && node.type !== 'object' && node.type !== 'map' && node.type !== 'list') {
    // References are resolved by lib/refs; here we only accept their shape.
    return opts.allowRefs === false ? [`${path}: references are not allowed here`] : [];
  }
  if (node.type in SCALARS) {
    if (!SCALARS[node.type](value, node)) return [`${path}: expected ${node.type}${node.type === 'enum' ? ` (${(node.options || []).join(', ')})` : ''}, got ${describe(value)}`];
    return errs.concat(checkScalarConstraints(node, value, path));
  }
  if (node.type === 'ref') {
    if (typeof value !== 'string' || !value.trim()) return [`${path}: expected a reference path string`];
    return errs;
  }
  if (node.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${path}: expected object`];
    const props = node.props || {};
    for (const k of Object.keys(value)) if (!(k in props)) errs.push(`${path}.${k}: unknown field`);
    for (const [k, child] of Object.entries(props)) {
      if (value[k] === undefined) { if (!child.optional) errs.push(`${path}.${k}: required`); continue; }
      errs.push(...validate(child, value[k], `${path}.${k}`, opts));
    }
    return errs;
  }
  if (node.type === 'map') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${path}: expected map`];
    const keyRe = node.keyPattern ? new RegExp(node.keyPattern) : /^[a-z0-9][a-z0-9-]*$/;
    const keys = Object.keys(value);
    if (node.minItems !== undefined && keys.length < node.minItems) errs.push(`${path}: needs at least ${node.minItems} entries, has ${keys.length}`);
    if (node.maxItems !== undefined && keys.length > node.maxItems) errs.push(`${path}: allows at most ${node.maxItems} entries, has ${keys.length}`);
    for (const k of keys) {
      if (!keyRe.test(k)) errs.push(`${path}.${k}: key does not match ${keyRe}`);
      errs.push(...validate(node.of, value[k], `${path}.${k}`, opts));
    }
    return errs;
  }
  if (node.type === 'list') {
    if (!Array.isArray(value)) return [`${path}: expected list`];
    if (node.minItems !== undefined && value.length < node.minItems) errs.push(`${path}: needs at least ${node.minItems} items, has ${value.length}`);
    if (node.maxItems !== undefined && value.length > node.maxItems) errs.push(`${path}: allows at most ${node.maxItems} items, has ${value.length}`);
    if (node.unique) {
      const seen = new Set();
      value.forEach((v, i) => { const k = JSON.stringify(v); if (seen.has(k)) errs.push(`${path}[${i}]: duplicate ${describe(v)}`); seen.add(k); });
    }
    value.forEach((v, i) => errs.push(...validate(node.of, v, `${path}[${i}]`, opts)));
    return errs;
  }
  return errs;
}

function checkScalarConstraints(node, value, path) {
  const errs = [];
  if (node.pattern !== undefined && typeof value === 'string' && !new RegExp(node.pattern).test(value)) errs.push(`${path}: ${describe(value)} does not match ${node.pattern}`);
  for (const bound of ['min', 'max']) {
    if (node[bound] === undefined) continue;
    let a = value, b = node[bound];
    if (node.type === 'length') {
      a = lengthToPx(value); b = lengthToPx(node[bound]);
      if (a === null || b === null) { errs.push(`${path}: cannot compare ${describe(value)} with ${bound} ${describe(node[bound])} (only px/rem are comparable)`); continue; }
    }
    if (bound === 'min' && a < b) errs.push(`${path}: ${describe(value)} is below min ${describe(node[bound])}`);
    if (bound === 'max' && a > b) errs.push(`${path}: ${describe(value)} is above max ${describe(node[bound])}`);
  }
  return errs;
}

// Validates a schema node itself (used by the contract meta-schema check).
export function validateSchema(node, path = '$') {
  const errs = [];
  if (!node || typeof node !== 'object') return [`${path}: schema node must be an object`];
  if (!TYPES.includes(node.type)) return [`${path}: unknown type ${describe(node.type)}`];
  if (node.type === 'enum' && (!Array.isArray(node.options) || !node.options.length)) errs.push(`${path}: enum needs options`);
  if (node.type === 'object') { if (!node.props || typeof node.props !== 'object') errs.push(`${path}: object needs props`); else for (const [k, c] of Object.entries(node.props)) errs.push(...validateSchema(c, `${path}.${k}`)); }
  if (node.type === 'map' || node.type === 'list') { if (!node.of) errs.push(`${path}: ${node.type} needs "of"`); else errs.push(...validateSchema(node.of, `${path}.of`)); }
  if (node.pattern !== undefined) { try { new RegExp(node.pattern); } catch { errs.push(`${path}: invalid pattern`); } }
  if (node.keyPattern !== undefined) { try { new RegExp(node.keyPattern); } catch { errs.push(`${path}: invalid keyPattern`); } }
  return errs;
}
