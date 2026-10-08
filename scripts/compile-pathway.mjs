// Compiles the Pathway (curriculum) from its outline and whole-lesson files into the runtime catalog.
//
//   content/pathway/outline.json      goals -> outcomes -> modules -> units -> lesson outline entries
//   content/pathway/lessons/<id>.md   one continuous lesson: frontmatter + sections with inline checks
//
// Lesson file syntax (field names follow docs/v7/data-dictionary.json):
//   ---                                  JSON frontmatter between --- lines
//   ## Section title {#anchor}           an authored section and stable outline anchor; contains provisional cards
//   plain paragraphs                     prose
//   > text                               a callout
//   ::reading                            the primary reading (readingAddress) from the BSB text
//   ::step                               an authored step break; a section with any keeps exactly its authored steps
//   ```check  {JSON}  ```                a scored check placed exactly here in the prose
//   ```reflect {"prompt","modelResponse"} ```   an unscored reflection
//
// The build fails on: an outline entry without its file (or the reverse), section anchors that differ
// from the outline, a lesson that requires a skill no earlier lesson teaches, an outcome that does not
// exist, a Scripture address that is not in the corpus, duplicate anchors, or malformed checks.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parseOsis } from './lib/bible-books.mjs';
import { parseLesson as parseLessonFile } from './lib/lesson-parse.mjs';
import { divideLesson, loadContext } from './lesson-divider.mjs';

const ROOT = process.cwd();
const DIR = resolve(ROOT, 'content/pathway');
const CATALOG = resolve(ROOT, 'public/data/catalog.json');
const CORPUS = resolve(ROOT, 'public/data/corpus.txt');
const errors = [];
const fail = m => errors.push(m);

const outline = JSON.parse(readFileSync(join(DIR, 'outline.json'), 'utf8'));
const verses = new Set(readFileSync(CORPUS, 'utf8').split('\n').filter(Boolean).map(l => l.split('\t').slice(0, 3).join(':')));
const verseExists = a => a && verses.has(`${a.book}:${a.chapter}:${a.verseStart || 1}`) && (!a.verseEnd || verses.has(`${a.book}:${a.chapter}:${a.verseEnd}`));

const CHECK_KINDS = { sequence: ['items', 'answer'], match: ['items', 'options', 'answer'], evidence: ['items', 'answer'], 'argument-map': ['items', 'options', 'answer', 'fields'], scenario: ['items', 'answer', 'stages'] };

export function parseLesson(text, file) { return parseLessonFile(text, file, fail); }

function validateCheck(ch, where) {
  const need = CHECK_KINDS[ch.kind];
  if (!need) return fail(`${where}: check kind "${ch.kind}" is not one of ${Object.keys(CHECK_KINDS).join(', ')}`);
  for (const k of ['title', 'prompt', 'why', ...need]) if (ch[k] === undefined || ch[k] === '') fail(`${where}: check "${ch.title || '?'}" needs ${k}`);
  const n = (ch.items || []).length;
  if (ch.kind === 'sequence' && (ch.answer.length !== n || [...ch.answer].sort().join() !== [...Array(n).keys()].join())) fail(`${where}: sequence answer must be a permutation of the items`);
  if (ch.kind === 'match' && (ch.answer.length !== n || ch.answer.some(a => a < 0 || a >= ch.options.length))) fail(`${where}: match answer must pick one option per item`);
  if (ch.kind === 'match' && ch.answer.every((a, i) => a === i)) fail(`${where}: match options are in answer order; shuffle them`);
  if (ch.kind === 'sequence' && ch.answer.every((a, i) => a === i)) fail(`${where}: sequence items are already in order; shuffle them`);
  if (ch.kind === 'evidence' && (!ch.answer.length || ch.answer.some(a => a < 0 || a >= n))) fail(`${where}: evidence answer must index the items`);
}

// ---------- outline checks ----------
const outcomes = new Set((outline.outcomes || []).map(o => o.id));
for (const o of outline.outcomes || []) if (!(outline.goals || []).some(g => g.id === o.goal)) fail(`outcome ${o.id} traces to unknown goal ${o.goal}`);
const entries = [];
for (const mod of outline.modules || []) for (const unit of mod.units || []) for (const l of unit.lessons || []) entries.push({ ...l, unitId: unit.unitId, moduleId: mod.id });
const taught = new Set();
const files = new Set(readdirSync(join(DIR, 'lessons')).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, '')));
const compiled = new Map();
for (const e of entries) {
  for (const o of e.outcomes || []) if (!outcomes.has(o)) fail(`lesson ${e.id}: unknown outcome ${o}`);
  for (const r of e.requires || []) if (!taught.has(r)) fail(`lesson ${e.id} requires "${r}", which no earlier lesson teaches`);
  (e.teaches || []).forEach(t => taught.add(t));
  if (!e.authored) continue;
  if (!files.has(e.id)) { fail(`outline lesson ${e.id} is marked authored but content/pathway/lessons/${e.id}.md is missing`); continue; }
  files.delete(e.id);
  const where = `lessons/${e.id}.md`;
  const parsed = parseLesson(readFileSync(join(DIR, 'lessons', `${e.id}.md`), 'utf8'), where);
  if (!parsed) continue;
  const { meta, sections, checks, reflection } = parsed;
  if (meta.id !== e.id) fail(`${where}: id "${meta.id}" does not match the outline`);
  const anchors = sections.map(s => s.id);
  if (new Set(anchors).size !== anchors.length) fail(`${where}: duplicate section anchors`);
  if (JSON.stringify(anchors) !== JSON.stringify(e.sections)) fail(`${where}: sections ${anchors.join(', ')} differ from the outline (${(e.sections || []).join(', ')})`);
  if (checks.length !== (e.checks || []).length) fail(`${where}: ${checks.length} checks, outline plans ${(e.checks || []).length}`);
  checks.forEach((c, i) => validateCheck(c, `${where} check ${i + 1}`));
  const reading = meta.readingOsis ? parseOsis(meta.readingOsis) : null;
  if (meta.readingOsis && (!reading || !verseExists(reading))) fail(`${where}: readingOsis "${meta.readingOsis}" is not a verse range in the BSB text`);
  for (const ref of meta.scriptureRefs || []) { const a = parseOsis(ref); if (!a || !verseExists(a)) fail(`${where}: scriptureRefs "${ref}" is not in the BSB text`); }
  if (reading && !sections.some(s => s.blocks.some(b => b.type === 'reading'))) fail(`${where}: no ::reading block (the primary reading must appear in the lesson)`);
  compiled.set(e.id, { entry: e, meta, sections, checks, reflection, reading });
}
for (const f of files) fail(`lessons/${f}.md is not in the outline`);
// ---------- content ledger: no loss, no condensing (owner decision curriculum.rewrite.no-loss-no-condense) ----------
const LEDGER = existsSync(join(DIR, 'legacy-ledger.json')) ? JSON.parse(readFileSync(join(DIR, 'legacy-ledger.json'), 'utf8')).lessons : {};
const REMOVED = existsSync(join(DIR, 'glossary-removed.json')) ? JSON.parse(readFileSync(join(DIR, 'glossary-removed.json'), 'utf8')).removed : {};
const STOP = new Set('about above after again against all also although among another because been before being below between both cannot could does doing during each either every from further have having here into itself just more most much must neither never other otherwise ought ours over own same shall should since some such than that their theirs them themselves then there these they this those through under until upon very were what when where whether which while whom whose will with within without would your yours'.split(' '));
const norm = t => String(t || '').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
const keyTerms = t => [...new Set((norm(t).match(/[\p{L}]{5,}/gu) || []).filter(w => !STOP.has(w)))];
const countWords = t => (String(t || '').match(/[\p{L}\p{N}’']+/gu) || []).length;
const sectionText = (sections, id) => { const s = sections.find(x => x.id === id); return s ? s.blocks.map(b => b.text || '').join(' ') : null; };
function lessonFullText({ meta, sections, checks, reflection }) {
  return [sections.flatMap(s => s.blocks.map(b => b.text || '')).join(' '), meta.deeper, ...(meta.drawers || []).map(d => `${d.title} ${d.body}`), ...Object.entries(meta.glossary || {}).map(([k, v]) => `${k}: ${v}`), reflection?.prompt, reflection?.modelResponse, JSON.stringify(checks)].join(' ');
}
const RECORD_IDS = new Set(readdirSync('.roa/records').filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(join('.roa/records', f), 'utf8')).id));
const coverage = (item, target) => { const terms = keyTerms(item); if (!terms.length) return 1; const t = norm(target); return terms.filter(w => t.includes(w)).length / terms.length; };
const reports = [];
for (const [id, c] of compiled) {
  const legacy = LEDGER[id];
  if (!legacy) { fail(`lessons/${id}.md: no ledger entry (every rewritten lesson is checked against the frozen original)`); continue; }
  const where = `lessons/${id}.md`;
  const full = norm(lessonFullText(c));
  const carries = c.meta.carries || {};
  const rep = { id, items: legacy.items.length, verbatim: 0, mapped: 0, glossaryRemoved: 0, problems: [] };
  for (const item of legacy.items) {
    if (item.kind === 'glossary') {
      const term = item.id.slice(6);
      if (REMOVED[term]) { rep.glossaryRemoved++; continue; }
      if (Object.keys(c.meta.glossary || {}).some(k => k.toLowerCase() === term.toLowerCase())) { rep.verbatim++; continue; }
    }
    if (['review-check', 'visual', 'source', 'extra-reading'].includes(item.kind) && !c.meta.reviewChecks && !c.meta.visual && !c.meta.sources) { rep.verbatim++; continue; } // kept on the lesson unchanged
    if (full.includes(norm(item.text))) { rep.verbatim++; continue; }
    if (item.kind === 'check') {
      // A check is carried when the lesson has a check with the same title or the same answer items.
      const legacyCheck = JSON.parse(item.text);
      if (c.checks.some(ch => norm(ch.title) === norm(legacyCheck.title) || JSON.stringify((ch.items || []).map(norm).sort()) === JSON.stringify((legacyCheck.items || []).map(norm).sort()))) { rep.verbatim++; continue; }
    }
    const target = carries[item.id];
    if (!target) { rep.problems.push(`${item.id} (${item.kind}) is not carried into the lesson and has no "carries" entry: "${item.text.slice(0, 80)}…"`); continue; }
    let text = null;
    if (target.startsWith('#')) text = sectionText(c.sections, target.slice(1));
    else if (target === 'deeper') text = c.meta.deeper;
    else if (target === 'drawers') text = (c.meta.drawers || []).map(d => `${d.title} ${d.body}`).join(' ');
    else if (target === 'glossary') text = Object.entries(c.meta.glossary || {}).map(([k, v]) => `${k} ${v}`).join(' ');
    else if (target === 'checks') text = JSON.stringify(c.checks);
    else if (target.startsWith('superseded:')) {
      // Text replaced because of an owner decision: the decision record must exist (e.g. a doctrinal revision).
      const rid = target.slice(11);
      if (!RECORD_IDS.has(rid)) rep.problems.push(`${item.id} is marked superseded by "${rid}", which is not a recorded decision`);
      else rep.mapped++;
      continue;
    }
    else if (target.startsWith('lesson:')) { const [lid, anchor] = target.slice(7).split('#'); const other = compiled.get(lid); text = other ? (anchor ? sectionText(other.sections, anchor) : lessonFullText(other)) : null; if (!other) { rep.problems.push(`${item.id} is carried to ${target}, which is not authored yet`); continue; } }
    if (text === null || text === undefined) { rep.problems.push(`${item.id} is carried to "${target}", which does not exist in the lesson`); continue; }
    const cov = coverage(item.text, text);
    if (item.kind !== 'check' && cov < 0.6) rep.problems.push(`${item.id} is carried to "${target}" but only ${Math.round(cov * 100)}% of its key terms appear there`);
    else rep.mapped++;
  }
  const teaching = countWords(c.sections.flatMap(s => s.blocks.filter(b => b.type === 'prose' || b.type === 'callout').map(b => b.text)).join(' ')) + countWords(c.meta.deeper);
  rep.teachingWords = { before: legacy.teachingWords, after: teaching };
  // Text removed by an owner decision (carried as superseded:<decision>) does not count toward the floor.
  const supersededWords = legacy.items.filter(i => ['paragraph', 'summary', 'deeper'].includes(i.kind) && String(carries[i.id] || '').startsWith('superseded:')).reduce((n, i) => n + countWords(i.text), 0);
  const floor = legacy.teachingWords - supersededWords;
  if (teaching < floor) rep.problems.push(`teaching text shrank from ${floor} to ${teaching} words (no condensing; ${supersededWords} words were superseded by owner decisions)`);
  rep.checks = { before: legacy.checks, after: c.checks.length };
  if (c.checks.length < legacy.checks) rep.problems.push(`checks went from ${legacy.checks} to ${c.checks.length} (no fewer checks)`);
  for (const pr of rep.problems) fail(`${where}: ${pr}`);
  reports.push(rep);
}
mkdirSync('.tmp', { recursive: true });
writeFileSync('.tmp/pathway-ledger-report.json', JSON.stringify(reports, null, 2));

if (errors.length) { console.error(`compile-pathway FAILED:\n  - ${errors.join('\n  - ')}`); process.exit(1); }

// ---------- merge into the runtime catalog ----------
const catalog = JSON.parse(readFileSync(CATALOG, 'utf8'));
const dividerContext = loadContext(ROOT);
for (const [id, { entry, meta, sections, checks, reflection, reading }] of compiled) {
  const lesson = catalog.lessons.find(l => l.id === id);
  if (!lesson) { console.error(`compile-pathway: catalog has no lesson ${id}`); process.exit(1); }
  const prose = sections.flatMap(s => s.blocks.filter(b => b.type === 'prose').map(b => b.text));
  // Provisional layout output is rebuilt from the current script, never written into the source.
  // Keep section identity and original blocks so navigation and check indices remain stable.
  const divided = divideLesson({ meta, sections, checks, reflection }, dividerContext);
  Object.assign(lesson, {
    title: meta.title, objective: meta.objective, reading: meta.reading,
    ref: reading ? [reading.book, reading.chapter, reading.verseStart, reading.verseEnd] : lesson.ref,
    readingOsis: meta.readingOsis, body: prose,
    simple: sections.flatMap(s => s.blocks.filter(b => b.type === 'callout').map(b => b.text))[0] || lesson.simple,
    vocab: meta.glossary || {}, deeper: meta.deeper || '', drawers: meta.drawers || [],
    challenges: checks.map(c => ({ ...c, hint: c.hint || 'Look back at the section just above.' })),
    // Spaced-review checks are kept: from the lesson file when it lists them, otherwise the existing ones.
    reviewChallenges: meta.reviewChecks || lesson.reviewChallenges || [],
    reflect: reflection?.prompt || '', model: reflection?.modelResponse || '',
    sections: sections.map((s, index) => ({ id: s.id, anchor: `lesson:${id}#${s.id}`, title: s.title, blocks: s.blocks, cards: divided.filter(c => c.section === s.id) })),
    teaches: entry.teaches || [], requires: entry.requires || [], outcomes: entry.outcomes || [],
    scriptureRefs: meta.scriptureRefs || [], authored: true
  });
}
// Selective glossary (owner decision curriculum.glossary.list-approved): approved removals leave every lesson's
// vocabulary list and the catalog glossary; lessons still explain the words in their text.
const removedTerms = new Set(Object.keys(REMOVED).map(t => t.toLowerCase()));
for (const l of catalog.lessons) if (l.vocab) l.vocab = Object.fromEntries(Object.entries(l.vocab).filter(([k]) => !removedTerms.has(k.toLowerCase())));
if (Array.isArray(catalog.glossary)) catalog.glossary = catalog.glossary.filter(g => !removedTerms.has(String(g.term).toLowerCase()));
writeFileSync(CATALOG, JSON.stringify(catalog));
console.log(`compile-pathway: ${compiled.size} authored lesson(s) validated and merged; ${entries.length} outline entries checked; ledger: ${reports.map(r => `${r.id} ${r.verbatim + r.mapped + r.glossaryRemoved}/${r.items} items, ${r.teachingWords.before}→${r.teachingWords.after} words`).join('; ')}; glossary ${catalog.glossary.length} terms`);
