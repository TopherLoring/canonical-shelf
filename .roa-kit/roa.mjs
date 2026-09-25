#!/usr/bin/env node
// project-roa-kit — contract-first project state.
// Authored inputs:  .roa/manifest.json (identity, edited only on explicit owner instruction)
//                   .roa/records/*.json (append-only decisions, questions, phases, checks, notes)
// Derived inputs:   the repository itself (package metadata, scripts, files, workflows, env examples)
// Generated outputs: .roa/state.json, CHANGELOG.md, docs/STATUS.md, docs/DECISIONS.md,
//                   SECURITY.md, and managed blocks inside AGENTS.md, README.md, CONTRIBUTING.md.
// Zero dependencies. Runs on Node >= 18 or Bun.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync, statSync, chmodSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT_DIR = dirname(fileURLToPath(import.meta.url));
const KIT_VERSION = readFileSync(join(KIT_DIR, 'VERSION'), 'utf8').trim();
const ROOT = process.env.ROA_ROOT ? resolve(process.env.ROA_ROOT) : process.cwd();
const ROA = join(ROOT, '.roa');
const RECORDS = join(ROA, 'records');
const MANIFEST = join(ROA, 'manifest.json');
const CMD = 'node .roa-kit/roa.mjs';

const RECORD_TYPES = ['decision', 'question', 'resolution', 'phase', 'check', 'note'];
const PHASE_STATUS = ['planned', 'active', 'blocked', 'done', 'dropped'];
const CHECK_STATUS = ['open', 'pass', 'fail', 'waived'];
const NOTE_KINDS = ['added', 'changed', 'fixed', 'removed', 'security', 'deprecated'];
const PROJECT_STATUS = ['planning', 'active', 'maintenance', 'dormant', 'archived'];
const ID_RE = /^[a-z0-9][a-z0-9.-]{0,63}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------- small utilities ----------
class RoaError extends Error {}
const fail = msg => { throw new RoaError(msg); };
const readJson = p => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch (e) { fail(`Cannot read JSON ${relative(ROOT, p)}: ${e.message}`); } };
const today = () => new Date().toISOString().slice(0, 10);
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const git = (args, opts = {}) => { try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], ...opts }).trim(); } catch { return null; } };
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'item';
const md = s => String(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const uniq = a => [...new Set(a)];

function parseArgs(argv) {
  const positional = []; const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split(/=(.*)/s);
      if (v !== undefined) flags[k] = v;
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) flags[k] = argv[++i];
      else flags[k] = true;
    } else positional.push(a);
  }
  return { positional, flags };
}
const list = v => (v === undefined || v === true) ? [] : String(v).split(',').map(s => s.trim()).filter(Boolean);

// ---------- manifest ----------
function validateManifest(m) {
  const errs = [];
  const str = (k, req = true) => { if (m[k] === undefined) { if (req) errs.push(`manifest.${k} is required`); } else if (typeof m[k] !== 'string' || !m[k].trim()) errs.push(`manifest.${k} must be a non-empty string`); };
  str('name'); str('summary'); str('purpose');
  if (!Array.isArray(m.audience) || !m.audience.length || m.audience.some(a => typeof a !== 'string' || !a.trim())) errs.push('manifest.audience must be a non-empty array of strings');
  if (!PROJECT_STATUS.includes(m.status)) errs.push(`manifest.status must be one of ${PROJECT_STATUS.join(', ')}`);
  if (!m.owner || typeof m.owner.name !== 'string' || !m.owner.name.trim()) errs.push('manifest.owner.name is required');
  for (const k of ['invariants', 'agentRules', 'agentDocs']) if (m[k] !== undefined && (!Array.isArray(m[k]) || m[k].some(x => typeof x !== 'string'))) errs.push(`manifest.${k} must be an array of strings`);
  for (const k of ['map', 'links', 'conventions']) if (m[k] !== undefined && (typeof m[k] !== 'object' || Array.isArray(m[k]) || Object.values(m[k]).some(x => typeof x !== 'string'))) errs.push(`manifest.${k} must be an object of strings`);
  if (m.security !== undefined && (typeof m.security !== 'object' || typeof m.security.contact !== 'string' || !m.security.contact.trim())) errs.push('manifest.security.contact is required when manifest.security is present');
  if (m.outputs !== undefined) {
    const allowed = ['changelog', 'status', 'decisions', 'agents', 'readme', 'contributing', 'security'];
    if (typeof m.outputs !== 'object' || Object.entries(m.outputs).some(([k, v]) => !allowed.includes(k) || typeof v !== 'boolean')) errs.push(`manifest.outputs keys must be booleans among ${allowed.join(', ')}`);
  }
  if (errs.length) fail(`Invalid .roa/manifest.json:\n  - ${errs.join('\n  - ')}`);
  return m;
}
const loadManifest = () => { if (!existsSync(MANIFEST)) fail(`No .roa/manifest.json. Run: ${CMD} install --summary "..." --purpose "..." --audience "..." --owner "..."`); return validateManifest(readJson(MANIFEST)); };

// ---------- records ----------
function validateRecord(r, file) {
  const errs = [];
  if (!RECORD_TYPES.includes(r.type)) errs.push(`type must be one of ${RECORD_TYPES.join(', ')}`);
  if (typeof r.date !== 'string' || !DATE_RE.test(r.date)) errs.push('date must be YYYY-MM-DD');
  const need = (k, test, msg) => { if (!test(r[k])) errs.push(msg || `${k} is required`); };
  const text = v => typeof v === 'string' && v.trim().length > 0;
  const id = v => typeof v === 'string' && ID_RE.test(v);
  switch (r.type) {
    case 'decision': need('id', id, 'id must match ' + ID_RE); need('text', text); if (r.supersedes !== undefined && (!Array.isArray(r.supersedes) || !r.supersedes.every(id))) errs.push('supersedes must be an array of ids'); break;
    case 'question': need('id', id, 'id must match ' + ID_RE); need('text', text); break;
    case 'resolution': need('question', id, 'question must be a question id'); need('text', text); if (r.decision !== undefined && !id(r.decision)) errs.push('decision must be a decision id'); break;
    case 'phase': need('phase', id, 'phase must be an id'); need('status', v => PHASE_STATUS.includes(v), `status must be one of ${PHASE_STATUS.join(', ')}`); break;
    case 'check': need('check', id, 'check must be an id'); need('status', v => CHECK_STATUS.includes(v), `status must be one of ${CHECK_STATUS.join(', ')}`); break;
    case 'note': need('kind', v => NOTE_KINDS.includes(v), `kind must be one of ${NOTE_KINDS.join(', ')}`); need('text', text); break;
  }
  if (errs.length) fail(`Invalid record ${file}:\n  - ${errs.join('\n  - ')}`);
  return r;
}

function loadRecords() {
  if (!existsSync(RECORDS)) return [];
  const files = readdirSync(RECORDS).filter(f => f.endsWith('.json')).sort();
  const recs = files.map(f => ({ ...validateRecord(readJson(join(RECORDS, f)), f), _file: f }));
  // referential integrity
  const decisions = new Map(); const questions = new Map();
  for (const r of recs) {
    if (r.type === 'decision') { if (decisions.has(r.id)) fail(`Duplicate decision id "${r.id}" in ${r._file}`); for (const s of r.supersedes || []) if (!decisions.has(s)) fail(`${r._file} supersedes unknown or later decision "${s}"`); decisions.set(r.id, r); }
    if (r.type === 'question') { if (questions.has(r.id)) fail(`Duplicate question id "${r.id}" in ${r._file}`); questions.set(r.id, r); }
    if (r.type === 'resolution') { if (!questions.has(r.question)) fail(`${r._file} resolves unknown question "${r.question}"`); if (r.decision && !decisions.has(r.decision)) fail(`${r._file} references unknown decision "${r.decision}"`); }
  }
  return recs;
}

function writeRecord(rec) {
  mkdirSync(RECORDS, { recursive: true });
  const key = rec.id || rec.question || rec.phase || rec.check || slug(rec.text || rec.type);
  const st = stamp();
  const seq = String(readdirSync(RECORDS).filter(f => f.startsWith(st)).length).padStart(3, '0');
  const name = `${st}-${seq}-${rec.type}-${key}.json`;
  const ordered = Object.fromEntries(['type', 'id', 'question', 'phase', 'check', 'kind', 'status', 'date', 'name', 'text', 'rationale', 'supersedes', 'decision', 'owner', 'by'].filter(k => rec[k] !== undefined).map(k => [k, rec[k]]));
  writeFileSync(join(RECORDS, name), JSON.stringify(ordered, null, 2) + '\n');
  return name;
}

// ---------- derivation from the repository ----------
function trackedFiles() {
  const out = git(['ls-files', '-z']);
  if (out === null) fail('Not a git repository (project-roa-kit derives facts from git-tracked files).');
  return out.split('\0').filter(Boolean);
}

function derive(manifest) {
  const files = trackedFiles();
  const has = f => files.includes(f);
  const d = { runtime: [], packageManager: null, version: null, license: null, commands: {}, languages: [], workflows: [], env: [], topLevel: [] };
  if (has('package.json')) {
    const pkg = readJson(join(ROOT, 'package.json'));
    d.version = pkg.version || null;
    d.license = pkg.license || null;
    d.commands = pkg.scripts || {};
    d.runtime.push('node');
    if (pkg.engines) for (const [k, v] of Object.entries(pkg.engines)) d.runtime.push(`${k} ${v}`);
    if (typeof pkg.packageManager === 'string') d.packageManager = pkg.packageManager;
  }
  const lockfiles = { 'bun.lock': 'bun', 'bun.lockb': 'bun', 'pnpm-lock.yaml': 'pnpm', 'yarn.lock': 'yarn', 'package-lock.json': 'npm', 'poetry.lock': 'poetry', 'uv.lock': 'uv', 'Cargo.lock': 'cargo', 'go.sum': 'go', 'Gemfile.lock': 'bundler', 'composer.lock': 'composer' };
  if (!d.packageManager) d.packageManager = Object.entries(lockfiles).find(([f]) => has(f))?.[1] || null;
  if (has('pyproject.toml')) { d.runtime.push('python'); const t = readFileSync(join(ROOT, 'pyproject.toml'), 'utf8'); d.version ||= t.match(/^version\s*=\s*"([^"]+)"/m)?.[1] || null; }
  if (has('Cargo.toml')) { d.runtime.push('rust'); const t = readFileSync(join(ROOT, 'Cargo.toml'), 'utf8'); d.version ||= t.match(/^version\s*=\s*"([^"]+)"/m)?.[1] || null; }
  if (has('go.mod')) d.runtime.push('go');
  if (!d.license) { const lf = files.find(f => /^LICEN[CS]E(\.(md|txt))?$/i.test(f)); if (lf) d.license = readFileSync(join(ROOT, lf), 'utf8').split('\n').find(l => l.trim())?.trim() || null; }
  const extNames = { js: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript', jsx: 'JavaScript', ts: 'TypeScript', tsx: 'TypeScript', py: 'Python', rs: 'Rust', go: 'Go', rb: 'Ruby', php: 'PHP', java: 'Java', kt: 'Kotlin', swift: 'Swift', cs: 'C#', css: 'CSS', scss: 'SCSS', html: 'HTML', sql: 'SQL', sh: 'Shell', ps1: 'PowerShell', liquid: 'Liquid', vue: 'Vue', svelte: 'Svelte' };
  const ignored = f => f.startsWith('.roa-kit/') || f.startsWith('node_modules/');
  d.languages = uniq(files.filter(f => !ignored(f)).map(f => extNames[f.split('.').pop()?.toLowerCase()]).filter(Boolean)).sort();
  d.workflows = files.filter(f => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(f)).map(f => basename(f)).sort();
  const envFiles = files.filter(f => /(^|\/)(\.env\.example|\.env\.sample|\.dev\.vars\.example|env\.example)$/.test(f));
  d.env = uniq(envFiles.flatMap(f => readFileSync(join(ROOT, f), 'utf8').split('\n').map(l => l.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=/)?.[1]).filter(Boolean))).sort();
  d.topLevel = uniq(files.map(f => f.includes('/') ? f.split('/')[0] + '/' : f)).sort();
  const map = manifest.map || {};
  const mapped = new Set(Object.keys(map));
  d.unmapped = d.topLevel.filter(p => p.endsWith('/') && !mapped.has(p) && !['.roa/', '.roa-kit/', '.githooks/', '.github/'].includes(p));
  d.missingMapped = Object.keys(map).filter(p => !files.some(f => f === p || f.startsWith(p.endsWith('/') ? p : p + '/')));
  return d;
}

// ---------- state assembly ----------
function assemble() {
  const manifest = loadManifest();
  const recs = loadRecords();
  const derived = derive(manifest);
  const decisions = recs.filter(r => r.type === 'decision');
  const supersededBy = new Map();
  for (const r of decisions) for (const s of r.supersedes || []) supersededBy.set(s, r.id);
  const resolutions = new Map(recs.filter(r => r.type === 'resolution').map(r => [r.question, r]));
  const questions = recs.filter(r => r.type === 'question');
  const latest = (type, key) => { const m = new Map(); for (const r of recs.filter(x => x.type === type)) m.set(r[key], { ...(m.get(r[key]) || {}), ...Object.fromEntries(Object.entries(r).filter(([, v]) => v !== undefined)) }); return [...m.values()]; };
  const phases = latest('phase', 'phase');
  const checks = latest('check', 'check');
  const current = phases.filter(p => p.status === 'active').at(-1) || phases.filter(p => p.status === 'blocked').at(-1) || phases.filter(p => p.status === 'planned')[0] || null;
  const notes = recs.filter(r => r.type === 'note');
  const outputs = { changelog: true, status: true, decisions: true, agents: true, readme: true, contributing: true, security: !!manifest.security, ...(manifest.outputs || {}) };
  if (outputs.security && !manifest.security) fail('manifest.outputs.security is true but manifest.security.contact is missing');
  const state = {
    _: `GENERATED by project-roa-kit ${KIT_VERSION} from .roa/ — do not edit. Regenerate: ${CMD} sync`,
    project: { name: manifest.name, summary: manifest.summary, purpose: manifest.purpose, audience: manifest.audience, status: manifest.status, owner: manifest.owner, links: manifest.links || {} },
    stack: { runtime: derived.runtime, packageManager: derived.packageManager, languages: derived.languages, version: derived.version, license: derived.license },
    commands: derived.commands,
    map: manifest.map || {},
    unmapped: derived.unmapped,
    invariants: manifest.invariants || [],
    agentRules: manifest.agentRules || [],
    agentDocs: manifest.agentDocs || [],
    conventions: manifest.conventions || {},
    env: derived.env,
    workflows: derived.workflows,
    phase: { current: current ? { id: current.phase, name: current.name || current.phase, status: current.status } : null, all: phases.map(p => ({ id: p.phase, name: p.name || p.phase, status: p.status, since: p.date })) },
    decisions: decisions.filter(r => !supersededBy.has(r.id)).map(r => ({ id: r.id, date: r.date, text: r.text })),
    superseded: decisions.filter(r => supersededBy.has(r.id)).map(r => r.id),
    open: questions.filter(q => !resolutions.has(q.id)).map(q => ({ id: q.id, text: q.text, owner: q.owner || null, since: q.date })),
    checks: checks.map(c => ({ id: c.check, text: c.text || c.check, status: c.status })),
    recent: notes.slice(-10).reverse().map(n => ({ date: n.date, kind: n.kind, text: n.text }))
  };
  return { manifest, recs, derived, state, decisions, supersededBy, resolutions, questions, phases, checks, notes, outputs };
}

// ---------- renderers ----------
const GEN_TOP = '<!-- GENERATED by project-roa-kit from .roa/ — do not edit by hand. Regenerate: node .roa-kit/roa.mjs sync -->';
const GEN_FOOT = `---\n*Generated by project-roa-kit ${KIT_VERSION} from \`.roa/\` records and repository facts.*\n`;
const full = (title, body) => `${GEN_TOP}\n# ${title}\n\n${body.trim()}\n\n${GEN_FOOT}`;

function renderChangelog(a) {
  const entries = [];
  for (const r of a.recs) {
    if (r.type === 'note') entries.push({ date: r.date, group: r.kind[0].toUpperCase() + r.kind.slice(1), text: r.text });
    if (r.type === 'decision') entries.push({ date: r.date, group: 'Decided', text: `${r.text}${r.supersedes?.length ? ` (supersedes ${r.supersedes.join(', ')})` : ''}` });
    if (r.type === 'resolution') entries.push({ date: r.date, group: 'Decided', text: `Resolved "${a.questions.find(q => q.id === r.question).text}": ${r.text}` });
    if (r.type === 'phase' && (r.status === 'done' || r.status === 'dropped')) entries.push({ date: r.date, group: 'Milestones', text: `Phase ${r.phase} ${r.status}${r.name ? `: ${r.name}` : ''}` });
  }
  const order = ['Milestones', 'Decided', 'Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
  const byDate = new Map();
  for (const e of entries) { if (!byDate.has(e.date)) byDate.set(e.date, new Map()); const g = byDate.get(e.date); if (!g.has(e.group)) g.set(e.group, []); g.get(e.group).push(e.text); }
  const dates = [...byDate.keys()].sort().reverse();
  const body = dates.length ? dates.map(dt => `## ${dt}\n\n` + order.filter(g => byDate.get(dt).has(g)).map(g => `### ${g}\n\n${byDate.get(dt).get(g).map(t => `- ${t}`).join('\n')}`).join('\n\n')).join('\n\n') : 'No recorded changes yet.';
  return full('Changelog', `All notable changes to ${a.manifest.name}, newest first. Entries come from \`.roa/records\`.\n\n${body}`);
}

function renderStatus(a) {
  const s = a.state;
  const cur = s.phase.current ? `**${md(s.phase.current.name)}** (\`${s.phase.current.id}\`, ${s.phase.current.status})` : 'No active phase.';
  const phases = s.phase.all.length ? `| Phase | Name | Status | Since |\n|---|---|---|---|\n${s.phase.all.map(p => `| \`${p.id}\` | ${md(p.name)} | ${p.status} | ${p.since} |`).join('\n')}` : 'No phases recorded.';
  const checks = s.checks.length ? `| Check | Status |\n|---|---|\n${s.checks.map(c => `| ${md(c.text)} (\`${c.id}\`) | ${c.status} |`).join('\n')}` : 'No checks recorded.';
  const open = s.open.length ? s.open.map(q => `- **${md(q.text)}** (\`${q.id}\`, owner: ${q.owner || 'unassigned'}, since ${q.since})`).join('\n') : 'None.';
  const dec = s.decisions.length ? s.decisions.map(d => `- ${d.date}: ${md(d.text)} (\`${d.id}\`)`).join('\n') : 'None.';
  const passCount = s.checks.filter(c => c.status === 'pass' || c.status === 'waived').length;
  return full(`${a.manifest.name} — Status`, `${md(a.manifest.summary)}\n\n**Project status:** ${s.project.status} · **Current phase:** ${cur} · **Checks:** ${passCount}/${s.checks.length} passing\n\n## Open questions\n\n${open}\n\n## Phases\n\n${phases}\n\n## Checks\n\n${checks}\n\n## Active decisions\n\n${dec}\n\nFull history: [DECISIONS.md](DECISIONS.md) · [CHANGELOG.md](../CHANGELOG.md)`);
}

function renderDecisions(a) {
  const rows = [...a.decisions].reverse().map(d => {
    const by = a.supersededBy.get(d.id);
    const status = by ? `superseded by \`${by}\`` : 'active';
    return `### ${by ? `~~${md(d.text)}~~` : md(d.text)}\n\n- **ID:** \`${d.id}\` · **Date:** ${d.date} · **Status:** ${status}${d.supersedes?.length ? ` · **Supersedes:** ${d.supersedes.map(x => `\`${x}\``).join(', ')}` : ''}${d.by ? ` · **By:** ${md(d.by)}` : ''}${d.rationale ? `\n- **Why:** ${md(d.rationale)}` : ''}`;
  });
  const res = a.recs.filter(r => r.type === 'resolution').reverse().map(r => `- ${r.date}: **${md(a.questions.find(q => q.id === r.question).text)}** → ${md(r.text)}${r.decision ? ` (decision \`${r.decision}\`)` : ''}`);
  return full(`${a.manifest.name} — Decision Log`, `Latest decisions first. A decision stays in force until a later record supersedes it.\n\n## Decisions\n\n${rows.join('\n\n') || 'None recorded.'}\n\n## Resolved questions\n\n${res.join('\n') || 'None.'}`);
}

function renderSecurity(a) {
  const sec = a.manifest.security;
  return full('Security Policy', `## Reporting a vulnerability\n\nReport suspected vulnerabilities privately to **${md(sec.contact)}**. Do not open a public issue.\n\n${sec.policy ? `## Policy\n\n${sec.policy}\n\n` : ''}## Scope\n\nThis policy covers ${md(a.manifest.name)}${a.state.project.links.production ? ` (${a.state.project.links.production})` : ''} and this repository.`);
}

const commandsTable = cmds => { const e = Object.entries(cmds); return e.length ? `| Command | Runs |\n|---|---|\n${e.map(([k, v]) => `| \`${k}\` | \`${md(v)}\` |`).join('\n')}` : 'No package scripts defined.'; };
const mapList = map => { const e = Object.entries(map); return e.length ? e.map(([k, v]) => `- \`${k}\` — ${md(v)}`).join('\n') : 'No map recorded.'; };

function blockAgents(a) {
  const s = a.state;
  return `## Start here (for AI agents)

1. Read \`.roa/state.json\` first. It is the compact, current source of truth for identity, commands, map, invariants, phase, decisions, and open questions.
2. The latest active decision overrides older documents. Treat anything in \`superseded\` as history only.
3. Do not act on an open question; ask the owner (${md(s.project.owner.name)}).

## Rules for project records

- **Never edit generated files by hand:** \`.roa/state.json\`, \`CHANGELOG.md\`, \`docs/STATUS.md\`, \`docs/DECISIONS.md\`${a.outputs.security ? ', `SECURITY.md`' : ''}, and every \`<!-- roa:begin -->\` block. CI regenerates and rejects hand edits.
- **Never edit or delete files in \`.roa/records/\`.** They are append-only. Change a decision by recording a new one that supersedes it.
- **Never edit \`.roa/manifest.json\`** unless the owner explicitly instructs it in the current task.
- Record facts only when the owner has stated them or the work completed them:
  - \`${CMD} decide "text" --id slug [--supersedes id] [--why "..."]\`
  - \`${CMD} ask "question" --id slug [--owner name]\`
  - \`${CMD} resolve <question-id> "answer" [--decision id]\`
  - \`${CMD} phase <id> <${PHASE_STATUS.join('|')}> [--name "..."]\`
  - \`${CMD} check <id> <${CHECK_STATUS.join('|')}> [--text "..."]\`
  - \`${CMD} note <${NOTE_KINDS.join('|')}> "text"\`
- Each command writes a record, regenerates outputs, and stages them. Commit them together with the related work.
- Before pushing: \`${CMD} verify\`.

## Invariants

${s.invariants.map(i => `- ${md(i)}`).join('\n') || 'None recorded.'}

## Agent rules

${s.agentRules.map(i => `- ${md(i)}`).join('\n') || 'None recorded.'}
${s.agentDocs.length ? `\n## Further instructions\n\n${s.agentDocs.map(p => `- \`${p}\``).join('\n')}\n` : ''}
## Commands

${commandsTable(s.commands)}`;
}

function blockReadme(a) {
  const s = a.state;
  return `## At a glance

${md(s.project.summary)}

- **Purpose:** ${md(s.project.purpose)}
- **For:** ${s.project.audience.map(md).join('; ')}
- **Status:** ${s.project.status}${s.phase.current ? ` · current phase **${md(s.phase.current.name)}**` : ''}
- **Stack:** ${[...s.stack.runtime, s.stack.packageManager].filter(Boolean).join(', ') || 'not detected'}${s.stack.languages.length ? ` · ${s.stack.languages.join(', ')}` : ''}
${Object.entries(s.project.links).map(([k, v]) => `- **${md(k)}:** ${v}`).join('\n')}

## Commands

${commandsTable(s.commands)}

## Repository map

${mapList(s.map)}

Project status: [docs/STATUS.md](docs/STATUS.md) · Decisions: [docs/DECISIONS.md](docs/DECISIONS.md) · Changes: [CHANGELOG.md](CHANGELOG.md)`;
}

function blockContributing(a) {
  const s = a.state;
  const conv = Object.entries(s.conventions);
  return `## Workflow

${conv.length ? conv.map(([k, v]) => `- **${md(k)}:** ${md(v)}`).join('\n') : '- No conventions recorded.'}

## Project records

Decisions, open questions, phases, checks, and changelog notes live in \`.roa/records/\` and are append-only. Generated documents are rebuilt from them; never edit those by hand.

\`\`\`sh
${CMD} decide "What was decided" --id short-slug --why "Reason"
${CMD} note fixed "What changed for users"
${CMD} verify
\`\`\`

## Environment variables

${s.env.length ? s.env.map(e => `- \`${e}\``).join('\n') : 'None declared in an env example file.'}

## Commands

${commandsTable(s.commands)}`;
}

const BLOCKS = { agents: ['AGENTS.md', 'roa-agents', blockAgents, a => `# ${a.manifest.name} — Agent Guide\n`], readme: ['README.md', 'roa-readme', blockReadme, a => `# ${a.manifest.name}\n`], contributing: ['CONTRIBUTING.md', 'roa-contributing', blockContributing, a => `# Contributing to ${a.manifest.name}\n`] };

function applyBlock(existing, name, content, headerIfNew) {
  const begin = `<!-- roa:begin ${name} — GENERATED, do not edit inside this block -->`;
  const end = `<!-- roa:end ${name} -->`;
  const block = `${begin}\n${content.trim()}\n${end}`;
  if (existing === null) return `${headerIfNew}\n${block}\n`;
  const re = new RegExp(`<!-- roa:begin ${name}[^>]*-->[\\s\\S]*?<!-- roa:end ${name} -->`);
  if (re.test(existing)) return existing.replace(re, () => block);
  return `${existing.replace(/\s*$/, '')}\n\n${block}\n`;
}

function render() {
  const a = assemble();
  const out = new Map();
  out.set('.roa/state.json', JSON.stringify(a.state) + '\n');
  if (a.outputs.changelog) out.set('CHANGELOG.md', renderChangelog(a));
  if (a.outputs.status) out.set('docs/STATUS.md', renderStatus(a));
  if (a.outputs.decisions) out.set('docs/DECISIONS.md', renderDecisions(a));
  if (a.outputs.security) out.set('SECURITY.md', renderSecurity(a));
  for (const [key, [file, name, fn, header]] of Object.entries(BLOCKS)) {
    if (!a.outputs[key]) continue;
    const p = join(ROOT, file);
    out.set(file, applyBlock(existsSync(p) ? readFileSync(p, 'utf8') : null, name, fn(a), header(a)));
  }
  return { a, out };
}

// ---------- commands ----------
function sync({ stage = false, quiet = false } = {}) {
  const { out } = render();
  const changed = [];
  for (const [file, content] of out) {
    const p = join(ROOT, file);
    if (existsSync(p) && readFileSync(p, 'utf8') === content) continue;
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
    changed.push(file);
  }
  if (stage) git(['add', '--', '.roa', ...out.keys()]);
  if (!quiet) console.log(changed.length ? `roa: updated ${changed.join(', ')}` : 'roa: all generated files current');
  return changed;
}

function verify(flags) {
  const problems = [];
  const notices = [];
  let out;
  try { ({ out } = render()); } catch (e) { if (e instanceof RoaError) problems.push(e.message); else throw e; }
  if (out) for (const [file, content] of out) {
    const p = join(ROOT, file);
    if (!existsSync(p) || readFileSync(p, 'utf8') !== content) problems.push(`${file} is stale or was edited by hand`);
  }
  const base = typeof flags.base === 'string' && flags.base && !/^0+$/.test(flags.base) ? flags.base : null;
  if (base) {
    const diff = git(['diff', '--name-status', `${base}...HEAD`, '--', '.roa/records', '.roa/manifest.json']);
    if (diff === null) notices.push(`base ${base} not available; record immutability not checked`);
    else for (const line of diff.split('\n').filter(Boolean)) {
      const [st, ...paths] = line.split('\t');
      if (paths[0] === '.roa/manifest.json') { notices.push(`.roa/manifest.json changed (${st}); confirm the owner instructed this`); continue; }
      if (st !== 'A') problems.push(`.roa/records is append-only: ${st} ${paths.join(' -> ')}`);
    }
  } else notices.push('no --base given; record immutability not checked');
  for (const n of notices) console.log(`roa notice: ${n}`);
  if (problems.length) {
    console.error(`roa verify FAILED:\n  - ${problems.join('\n  - ')}\n\nFix: run \`${CMD} sync\`, commit the regenerated files, and push.\nIf a record was edited or deleted, restore it (git checkout <base> -- .roa/records) and add a new superseding record instead.`);
    return 1;
  }
  console.log('roa verify passed');
  return 0;
}

function record(type, positional, flags) {
  const date = flags.date === undefined ? today() : String(flags.date);
  const by = typeof flags.by === 'string' ? flags.by : undefined;
  let rec;
  const need = (v, msg) => { if (v === undefined || v === true || v === '') fail(msg); return String(v); };
  switch (type) {
    case 'decide': {
      const text = need(positional[0], 'Usage: decide "text" --id slug [--supersedes a,b] [--why "..."]');
      rec = { type: 'decision', id: typeof flags.id === 'string' ? flags.id : slug(text), date, text, rationale: typeof flags.why === 'string' ? flags.why : undefined, supersedes: list(flags.supersedes).length ? list(flags.supersedes) : undefined, by };
      break;
    }
    case 'ask': {
      const text = need(positional[0], 'Usage: ask "question" --id slug [--owner name]');
      rec = { type: 'question', id: typeof flags.id === 'string' ? flags.id : slug(text), date, text, owner: typeof flags.owner === 'string' ? flags.owner : undefined, by };
      break;
    }
    case 'resolve': rec = { type: 'resolution', question: need(positional[0], 'Usage: resolve <question-id> "answer" [--decision id]'), date, text: need(positional[1], 'Usage: resolve <question-id> "answer" [--decision id]'), decision: typeof flags.decision === 'string' ? flags.decision : undefined, by }; break;
    case 'phase': rec = { type: 'phase', phase: need(positional[0], 'Usage: phase <id> <status> [--name "..."]'), status: need(positional[1], `Status must be one of ${PHASE_STATUS.join(', ')}`), date, name: typeof flags.name === 'string' ? flags.name : undefined, by }; break;
    case 'check': rec = { type: 'check', check: need(positional[0], 'Usage: check <id> <status> [--text "..."]'), status: need(positional[1], `Status must be one of ${CHECK_STATUS.join(', ')}`), date, text: typeof flags.text === 'string' ? flags.text : undefined, by }; break;
    case 'note': rec = { type: 'note', kind: need(positional[0], `Usage: note <${NOTE_KINDS.join('|')}> "text"`), date, text: need(positional[1], 'Usage: note <kind> "text"'), by }; break;
  }
  validateRecord(Object.fromEntries(Object.entries(rec).filter(([, v]) => v !== undefined)), `(new ${rec.type})`);
  // dry-run integrity against existing records before writing
  const existing = loadRecords();
  if (rec.type === 'decision' && existing.some(r => r.type === 'decision' && r.id === rec.id)) fail(`Decision id "${rec.id}" already exists. Use a new --id and --supersedes ${rec.id}.`);
  if (rec.type === 'question' && existing.some(r => r.type === 'question' && r.id === rec.id)) fail(`Question id "${rec.id}" already exists.`);
  for (const s of rec.supersedes || []) if (!existing.some(r => r.type === 'decision' && r.id === s)) fail(`Cannot supersede unknown decision "${s}".`);
  if (rec.type === 'resolution') {
    if (!existing.some(r => r.type === 'question' && r.id === rec.question)) fail(`Unknown question "${rec.question}".`);
    if (existing.some(r => r.type === 'resolution' && r.question === rec.question)) fail(`Question "${rec.question}" is already resolved.`);
    if (rec.decision && !existing.some(r => r.type === 'decision' && r.id === rec.decision)) fail(`Unknown decision "${rec.decision}". Record it first with decide.`);
  }
  const file = writeRecord(rec);
  console.log(`roa: recorded .roa/records/${file}`);
  sync({ stage: flags['no-stage'] !== true });
}

// ---------- install ----------
function detectDefaults() {
  let name = basename(ROOT);
  if (existsSync(join(ROOT, 'package.json'))) { try { name = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).name || name; } catch {} }
  const repo = git(['remote', 'get-url', 'origin']);
  const links = {};
  if (repo) links.repository = repo.replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '');
  return { name, links };
}

function copyKit(target) {
  const dest = join(target, '.roa-kit');
  mkdirSync(join(dest, 'schema'), { recursive: true });
  mkdirSync(join(dest, 'templates'), { recursive: true });
  for (const f of ['roa.mjs', 'VERSION', 'README.md']) copyFileSync(join(KIT_DIR, f), join(dest, f));
  for (const dir of ['schema', 'templates']) for (const f of readdirSync(join(KIT_DIR, dir))) copyFileSync(join(KIT_DIR, dir, f), join(dest, dir, f));
}

function install(flags) {
  if (git(['rev-parse', '--is-inside-work-tree']) !== 'true') fail('install must run inside a git repository');
  if (resolve(KIT_DIR) !== resolve(ROOT, '.roa-kit')) copyKit(ROOT);
  mkdirSync(RECORDS, { recursive: true });
  if (!existsSync(MANIFEST)) {
    const d = detectDefaults();
    const manifest = {
      $schema: '../.roa-kit/schema/manifest.schema.json',
      name: typeof flags.name === 'string' ? flags.name : d.name,
      summary: flags.summary, purpose: flags.purpose,
      audience: list(flags.audience),
      status: typeof flags.status === 'string' ? flags.status : 'active',
      owner: { name: flags.owner, ...(typeof flags.contact === 'string' ? { contact: flags.contact } : {}) },
      links: d.links, map: {}, invariants: [], agentRules: [], conventions: {}
    };
    const missing = ['summary', 'purpose', 'owner'].filter(k => typeof flags[k] !== 'string' || !flags[k].trim());
    if (!manifest.audience.length) missing.push('audience');
    if (missing.length) fail(`install needs --${missing.join(', --')} (no placeholder values are written). Example:\n  ${CMD} install --summary "One line" --purpose "Why it exists" --audience "Who,Also who" --owner "Name"`);
    validateManifest(manifest);
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
    console.log('roa: wrote .roa/manifest.json');
  }
  // git hook
  const hooksPath = git(['config', '--get', 'core.hooksPath']) || '.githooks';
  const hookDir = join(ROOT, hooksPath);
  mkdirSync(hookDir, { recursive: true });
  const hookFile = join(hookDir, 'pre-commit');
  const hookLine = readFileSync(join(KIT_DIR, 'templates', 'pre-commit'), 'utf8');
  if (!existsSync(hookFile)) writeFileSync(hookFile, hookLine);
  else if (!readFileSync(hookFile, 'utf8').includes('roa.mjs sync')) writeFileSync(hookFile, readFileSync(hookFile, 'utf8').replace(/\s*$/, '\n\n') + hookLine.split('\n').filter(l => !l.startsWith('#!')).join('\n'));
  chmodSync(hookFile, 0o755);
  git(['config', 'core.hooksPath', hooksPath]);
  // package.json wiring
  const pkgPath = join(ROOT, 'package.json');
  if (existsSync(pkgPath)) {
    const raw = readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    pkg.scripts ||= {};
    const hookCmd = `git config core.hooksPath ${hooksPath} || true`;
    if (!pkg.scripts.prepare) pkg.scripts.prepare = hookCmd;
    else if (!pkg.scripts.prepare.includes('core.hooksPath')) pkg.scripts.prepare = `${pkg.scripts.prepare} && ${hookCmd}`;
    pkg.scripts.roa ||= CMD;
    pkg.scripts['roa:verify'] ||= `${CMD} verify`;
    const indent = raw.match(/^\s+(?=")/m)?.[0] || '  ';
    writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + '\n');
  }
  // CI workflow
  const wf = join(ROOT, '.github', 'workflows', 'roa.yml');
  mkdirSync(dirname(wf), { recursive: true });
  copyFileSync(join(KIT_DIR, 'templates', 'roa.yml'), wf);
  sync();
  git(['add', '--', '.roa', '.roa-kit', hooksPath, '.github/workflows/roa.yml', ...(existsSync(pkgPath) ? ['package.json'] : []), ...render().out.keys()]);
  console.log('roa: installed and staged. Review, then commit.');
  if (flags.protect) protect(flags);
}

function protect(flags) {
  const repoUrl = git(['remote', 'get-url', 'origin']);
  const m = repoUrl && repoUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/);
  if (!m) fail('protect: origin is not a GitHub repository');
  const branch = typeof flags.branch === 'string' ? flags.branch : 'main';
  const body = JSON.stringify({
    name: 'roa-protect-' + branch, target: 'branch', enforcement: 'active',
    conditions: { ref_name: { include: [`refs/heads/${branch}`], exclude: [] } },
    rules: [
      { type: 'deletion' }, { type: 'non_fast_forward' },
      { type: 'pull_request', parameters: { required_approving_review_count: 0, dismiss_stale_reviews_on_push: false, require_code_owner_review: false, require_last_push_approval: false, required_review_thread_resolution: false } },
      { type: 'required_status_checks', parameters: { strict_required_status_checks_policy: false, required_status_checks: [{ context: 'roa' }] } }
    ]
  });
  try {
    execFileSync('gh', ['api', '--method', 'POST', `repos/${m[1]}/${m[2]}/rulesets`, '--input', '-'], { cwd: ROOT, input: body, stdio: ['pipe', 'inherit', 'inherit'] });
    console.log(`roa: ruleset created on ${m[1]}/${m[2]}:${branch} (PR + passing "roa" check required).`);
  } catch { fail('protect: gh api failed. Requires the GitHub CLI logged in with admin rights. Private repos need a paid GitHub plan for rulesets.'); }
}

function help() {
  console.log(`project-roa-kit ${KIT_VERSION}

Records (append-only; each regenerates and stages outputs):
  decide "text" --id slug [--supersedes a,b] [--why "..."] [--date YYYY-MM-DD] [--by name]
  ask "question" --id slug [--owner name]
  resolve <question-id> "answer" [--decision id]
  phase <id> <${PHASE_STATUS.join('|')}> [--name "..."]
  check <id> <${CHECK_STATUS.join('|')}> [--text "..."]
  note <${NOTE_KINDS.join('|')}> "text"

Maintenance:
  sync [--stage]         regenerate all outputs
  verify [--base <ref>]  fail if outputs are stale or records were edited/deleted since <ref>
  state                  print .roa/state.json
  install --summary .. --purpose .. --audience a,b --owner .. [--contact ..] [--protect] [--branch main]`);
}

// ---------- entry ----------
export function main(argv) {
  const [cmd, ...rest] = argv;
  const { positional, flags } = parseArgs(rest);
  try {
    switch (cmd) {
      case 'decide': case 'ask': case 'resolve': case 'phase': case 'check': case 'note': record(cmd, positional, flags); return 0;
      case 'sync': sync({ stage: flags.stage === true }); return 0;
      case 'verify': return verify(flags);
      case 'state': console.log(render().out.get('.roa/state.json').trim()); return 0;
      case 'install': install(flags); return 0;
      case 'protect': protect(flags); return 0;
      case undefined: case 'help': case '--help': case '-h': help(); return 0;
      default: help(); return 1;
    }
  } catch (e) {
    if (e instanceof RoaError) { console.error(`roa: ${e.message}`); return 1; }
    throw e;
  }
}

if (resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
