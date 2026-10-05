// Shared work graph for every agent (Claude, Codex, any other) working on this repo.
//
//   bun run work                         board: every node, its state, owner, and what is ready to start
//   bun run work claim <id> --agent <name> --branch <branch>
//   bun run work note <id> "handoff text"
//   bun run work done <id>               runs the node's acceptance commands; marks done only if they pass
//   bun run work release <id>            gives a claimed node back (keeps its notes)
//   bun run work approve <id> "what you decided"   (Chris) records the decision and closes his gate node in one step
//   bun run work approve <id> --record <roa id>      closes a gate node citing a decision already recorded
//   bun run work check                   validates the graph and that docs/v7/WORK_BOARD.md is current (in verify:fast)
//
// The graph lives in docs/v7/work-graph.json; docs/v7/WORK_BOARD.md is generated from it. Never edit the board by hand.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const GRAPH = resolve(process.cwd(), 'docs/v7/work-graph.json');
const BOARD = resolve(process.cwd(), 'docs/v7/WORK_BOARD.md');
const STATES = ['todo', 'claimed', 'blocked', 'review', 'done', 'dropped'];
const fail = msg => { console.error(`work: ${msg}`); process.exit(1); };
const load = () => JSON.parse(readFileSync(GRAPH, 'utf8'));
const save = g => { writeFileSync(GRAPH, JSON.stringify(g, null, 2) + '\n'); writeFileSync(BOARD, board(g)); };
const today = () => new Date().toISOString().slice(0, 10);
const byId = g => new Map(g.nodes.map(n => [n.id, n]));

function validate(g) {
  const errors = [];
  const ids = new Map();
  for (const n of g.nodes) {
    if (!/^[A-Za-z0-9][\w.-]*$/.test(n.id || '')) errors.push(`bad id "${n.id}"`);
    if (ids.has(n.id)) errors.push(`duplicate id ${n.id}`);
    ids.set(n.id, n);
    if (!STATES.includes(n.state)) errors.push(`${n.id}: state must be one of ${STATES.join(', ')}`);
    if (!n.title) errors.push(`${n.id}: missing title`);
    if (!Array.isArray(n.deps)) errors.push(`${n.id}: deps must be a list`);
    if (!Array.isArray(n.owns)) errors.push(`${n.id}: owns must be a list of paths`);
    if (!Array.isArray(n.accept)) errors.push(`${n.id}: accept must be a list of commands (may be empty only for gate nodes)`);
    if (n.gate !== 'chris' && n.state !== 'dropped' && !(n.accept || []).length) errors.push(`${n.id}: needs at least one acceptance command`);
    if (['claimed', 'review'].includes(n.state) && (!n.owner || !n.branch)) errors.push(`${n.id}: ${n.state} needs owner and branch`);
  }
  for (const n of g.nodes) for (const d of n.deps || []) {
    if (!ids.has(d)) errors.push(`${n.id}: unknown dependency ${d}`);
    else if (['claimed', 'review', 'done'].includes(n.state) && n.state !== 'claimed' && ids.get(d).state !== 'done' && ids.get(d).state !== 'dropped') errors.push(`${n.id} is ${n.state} but dependency ${d} is ${ids.get(d).state}`);
  }
  // No cycles.
  const seen = new Map();
  const visit = (id, stack) => {
    if (seen.get(id) === 'done') return;
    if (seen.get(id) === 'open') { errors.push(`dependency cycle: ${[...stack, id].join(' -> ')}`); return; }
    seen.set(id, 'open');
    for (const d of ids.get(id)?.deps || []) if (ids.has(d)) visit(d, [...stack, id]);
    seen.set(id, 'done');
  };
  for (const id of ids.keys()) visit(id, []);
  // Two agents may not hold nodes that own the same paths at the same time.
  const active = g.nodes.filter(n => n.state === 'claimed');
  for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
    const a = active[i], b = active[j];
    if (a.owner === b.owner) continue;
    for (const p of a.owns) for (const q of b.owns) if (p.startsWith(q) || q.startsWith(p)) errors.push(`${a.id} (${a.owner}) and ${b.id} (${b.owner}) both own ${p.length < q.length ? p : q}`);
  }
  return errors;
}

const ready = (g, n) => n.state === 'todo' && n.deps.every(d => ['done', 'dropped'].includes(byId(g).get(d)?.state));

function board(g) {
  const map = byId(g);
  const order = ['claimed', 'review', 'blocked', 'todo', 'done', 'dropped'];
  const rows = [...g.nodes].sort((a, b) => order.indexOf(a.state) - order.indexOf(b.state) || a.id.localeCompare(b.id, undefined, { numeric: true }));
  const cell = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const status = n => (n.state === 'todo' ? (ready(g, n) ? 'ready' : 'waiting') : n.state) + (n.gate === 'chris' ? ' (Chris)' : '');
  const lines = [
    '# Work board',
    '',
    `Generated from \`docs/v7/work-graph.json\` by \`bun run work\`. Do not edit by hand. Updated ${g.updated}.`,
    '',
    '## Rules every agent follows',
    '',
    ...g.rules.map((r, i) => `${i + 1}. ${r}`),
    '',
    '## Ready to start',
    '',
    ...(g.nodes.filter(n => ready(g, n)).map(n => `- **${n.id}** — ${n.title}${n.gate === 'chris' ? ' *(needs Chris)*' : ''}`).concat(g.nodes.some(n => ready(g, n)) ? [] : ['- Nothing ready: every open node is waiting on a dependency or claimed.'])),
    '',
    '## All nodes',
    '',
    '| Node | Status | Owner | Branch | Depends on | Title |',
    '|---|---|---|---|---|---|',
    ...rows.map(n => `| \`${n.id}\` | ${status(n)} | ${cell(n.owner)} | ${n.branch ? `\`${cell(n.branch)}\`` : ''} | ${n.deps.map(d => `\`${d}\``).join(', ')} | ${cell(n.title)} |`),
    '',
    '## Handoff notes (latest first)',
    '',
    ...g.nodes.filter(n => (n.notes || []).length).flatMap(n => [`### ${n.id} — ${n.title}`, '', ...[...n.notes].reverse().map(x => `- ${x.date} (${x.by}): ${x.text}`), '']),
    ''
  ];
  return lines.join('\n');
}

const [cmd = 'status', id, ...rest] = process.argv.slice(2);
const flag = name => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };
const g = load();
const node = () => { const n = g.nodes.find(x => x.id.toLowerCase() === String(id || '').toLowerCase()); if (!n) fail(`no node "${id}". Run: bun run work`); return n; };

if (cmd === 'check') {
  const errors = validate(g);
  if (errors.length) fail(`graph invalid:\n  - ${errors.join('\n  - ')}`);
  if (readFileSync(BOARD, 'utf8') !== board(g)) fail('docs/v7/WORK_BOARD.md is stale. Run: bun run work');
  console.log(`work: graph valid (${g.nodes.length} nodes, ${g.nodes.filter(n => n.state === 'done').length} done, ${g.nodes.filter(n => ready(g, n)).length} ready)`);
} else if (cmd === 'status') {
  const errors = validate(g);
  save(g);
  console.log(board(g).split('## Handoff notes')[0]);
  if (errors.length) fail(`graph invalid:\n  - ${errors.join('\n  - ')}`);
} else if (cmd === 'claim') {
  const n = node(), agent = flag('agent'), branch = flag('branch');
  if (!agent || !branch) fail('claim needs --agent <name> --branch <branch>');
  if (n.gate === 'chris') fail(`${n.id} is Chris's decision; agents do not claim it`);
  // Read the shared board on GitHub first: a local copy can be stale, which is how one node got claimed twice.
  const shared = g.integrationBranch || 'feature/redesign-p5-lesson-path';
  try {
    execSync(`git fetch -q origin ${shared}`, { stdio: 'ignore' });
    const remote = JSON.parse(execSync(`git show FETCH_HEAD:docs/v7/work-graph.json`, { encoding: 'utf8' }));
    const there = remote.nodes.find(x => x.id === n.id);
    if (there && there.state !== 'todo') fail(`${n.id} is ${there.state}${there.owner ? ` by ${there.owner}` : ''} on GitHub (${shared}). Pull ${shared} before claiming.`);
    const behind = execSync(`git rev-list --count HEAD..FETCH_HEAD`, { encoding: 'utf8' }).trim();
    if (behind !== '0') fail(`your branch is ${behind} commit(s) behind ${shared} on GitHub. Merge or rebase onto it before claiming.`);
  } catch (e) {
    if (e.status === undefined || process.env.WORK_OFFLINE) throw e;
    fail(`could not read the shared board from origin/${shared}. Check the network, or set WORK_OFFLINE=1 only if you are sure no other agent is working.`);
  }
  if (n.state !== 'todo') fail(`${n.id} is ${n.state}${n.owner ? ` (owner ${n.owner})` : ''}`);
  if (!ready(g, n)) fail(`${n.id} is waiting on ${n.deps.filter(d => !['done', 'dropped'].includes(byId(g).get(d).state)).join(', ')}`);
  Object.assign(n, { state: 'claimed', owner: agent, branch });
  (n.notes ||= []).push({ date: today(), by: agent, text: `Claimed on ${branch}.` });
  g.updated = today();
  const errors = validate(g);
  if (errors.length) fail(`claim would break the graph:\n  - ${errors.join('\n  - ')}`);
  save(g); console.log(`work: ${n.id} claimed by ${agent} on ${branch}. Commit docs/v7/work-graph.json and WORK_BOARD.md before editing anything else.`);
} else if (cmd === 'note') {
  const n = node(), text = rest.filter((x, i) => !x.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--'))).join(' ');
  if (!text) fail('note needs text');
  (n.notes ||= []).push({ date: today(), by: flag('agent') || n.owner || 'unknown', text });
  g.updated = today(); save(g); console.log(`work: note added to ${n.id}`);
} else if (cmd === 'release') {
  const n = node();
  if (n.state !== 'claimed') fail(`${n.id} is not claimed`);
  (n.notes ||= []).push({ date: today(), by: n.owner, text: `Released from ${n.branch}.` });
  Object.assign(n, { state: 'todo' }); delete n.owner;
  g.updated = today(); save(g); console.log(`work: ${n.id} released (branch kept in notes)`);
} else if (cmd === 'done') {
  const n = node();
  if (n.gate === 'chris') fail(`${n.id} is completed by Chris's recorded decision, not by an agent`);
  if (n.state !== 'claimed' && n.state !== 'review') fail(`${n.id} is ${n.state}; claim it first`);
  for (const c of n.accept) {
    console.log(`work: ${n.id} acceptance: ${c}`);
    try { execSync(c, { stdio: 'inherit' }); } catch { fail(`${n.id} acceptance failed: ${c}`); }
  }
  n.state = 'done';
  (n.notes ||= []).push({ date: today(), by: n.owner || 'unknown', text: `Done; acceptance passed (${n.accept.join('; ')}).` });
  g.updated = today(); save(g); console.log(`work: ${n.id} done`);
} else if (cmd === 'approve') {
  // Chris closes his own gate in one line: bun run work approve S3.F "Approved the revision edits as listed"
  // (or cites an existing record with --record <id>).
  const n = node();
  if (n.gate !== 'chris') fail(`${n.id} is not a Chris-gate node; agents finish it with: bun run work done ${n.id}`);
  let record = flag('record');
  const text = rest.filter((x, i) => !x.startsWith('--') && !(i > 0 && rest[i - 1].startsWith('--'))).join(' ').trim();
  const known = id => execSync('git ls-files .roa/records', { encoding: 'utf8' }).split('\n').filter(Boolean)
    .some(f => { try { return JSON.parse(readFileSync(f, 'utf8')).id === id; } catch { return false; } });
  if (!record) {
    if (!text) fail(`say what you decided, e.g.: bun run work approve ${n.id} "Approved"`);
    record = `work.${n.id.toLowerCase()}.${today()}`;
    const q = v => JSON.stringify(v);
    execSync(`node .roa-kit/roa.mjs decide ${q(`${n.id}: ${text}`)} --topic ${q(`work.${n.id.toLowerCase()}`)} --by Chris --kind approval --scope ${q(`${n.id}: ${n.title}`)} --id ${q(record)}`, { stdio: 'inherit' });
    execSync('git add .roa', { stdio: 'inherit' });
  } else if (!known(record)) {
    fail(`no .roa record with id "${record}"`);
  }
  n.state = 'done'; n.record = record;
  (n.notes ||= []).push({ date: today(), by: 'Chris', text: `Decided: ${record}${text ? ` (${text})` : ''}.` });
  g.updated = today(); save(g);
  console.log(`work: ${n.id} closed by ${record}. Commit with: git add -A && git commit -m "work: ${n.id} approved"`);
} else {
  fail(`unknown command "${cmd}" (status, claim, note, release, done, approve, check)`);
}
