// Compiles the Pathway (curriculum) from its outline and whole-lesson files into the runtime catalog.
//
//   content/pathway/outline.json      goals -> outcomes -> modules -> units -> lesson outline entries
//   content/pathway/lessons/<id>.md   one continuous lesson: frontmatter + sections with inline checks
//
// Lesson file syntax (field names follow docs/v7/data-dictionary.json):
//   ---                                  JSON frontmatter between --- lines
//   ## Section title {#anchor}           a section; becomes one progress dot and an outline anchor
//   plain paragraphs                     prose
//   > text                               a callout
//   ::reading                            the primary reading (readingAddress) from the BSB text
//   ```check  {JSON}  ```                a scored check placed exactly here in the prose
//   ```reflect {"prompt","modelResponse"} ```   an unscored reflection
//
// The build fails on: an outline entry without its file (or the reverse), section anchors that differ
// from the outline, a lesson that requires a skill no earlier lesson teaches, an outcome that does not
// exist, a Scripture address that is not in the corpus, duplicate anchors, or malformed checks.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parseOsis } from './lib/bible-books.mjs';

const ROOT = process.cwd();
const DIR = resolve(ROOT, 'content/pathway');
const CATALOG = resolve(ROOT, 'public/data/catalog.json');
const CORPUS = resolve(ROOT, 'public/data/corpus.txt');
const errors = [];
const fail = m => errors.push(m);

const outline = JSON.parse(readFileSync(join(DIR, 'outline.json'), 'utf8'));
const verses = new Set(readFileSync(CORPUS, 'utf8').split('\n').filter(Boolean).map(l => l.split('\t').slice(0, 3).join(':')));
const verseExists = a => a && verses.has(`${a.book}:${a.chapter}:${a.verseStart || 1}`) && (!a.verseEnd || verses.has(`${a.book}:${a.chapter}:${a.verseEnd}`));

const CHECK_KINDS = { sequence: ['items', 'answer'], match: ['items', 'options', 'answer'], evidence: ['items', 'answer'] };

export function parseLesson(text, file) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { fail(`${file}: missing --- JSON frontmatter ---`); return null; }
  let meta;
  try { meta = JSON.parse(m[1]); } catch (e) { fail(`${file}: frontmatter is not valid JSON (${e.message})`); return null; }
  const sections = [];
  const checks = [];
  let reflection = null, cur = null, para = [];
  const flush = () => { if (para.length && cur) cur.blocks.push({ type: 'prose', text: para.join(' ').trim() }); para = []; };
  const lines = m[2].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h = line.match(/^## (.+?) \{#([a-z0-9][a-z0-9-]*)\}\s*$/);
    if (h) { flush(); cur = { id: h[2], title: h[1].trim(), blocks: [] }; sections.push(cur); continue; }
    const fence = line.match(/^```(check|reflect)\s*$/);
    if (fence) {
      flush();
      const body = [];
      while (++i < lines.length && lines[i] !== '```') body.push(lines[i]);
      let obj;
      try { obj = JSON.parse(body.join('\n')); } catch (e) { fail(`${file}: ${fence[1]} block in #${cur?.id} is not valid JSON (${e.message})`); continue; }
      if (!cur) { fail(`${file}: ${fence[1]} block before the first section`); continue; }
      if (fence[1] === 'check') { cur.blocks.push({ type: 'check', index: checks.length }); checks.push(obj); }
      else { reflection = obj; cur.blocks.push({ type: 'reflect' }); }
      continue;
    }
    if (!cur) { if (line.trim()) fail(`${file}: text before the first "## Section {#anchor}" heading`); continue; }
    if (/^::reading\s*$/.test(line)) { flush(); cur.blocks.push({ type: 'reading' }); continue; }
    if (/^> /.test(line)) { flush(); cur.blocks.push({ type: 'callout', text: line.slice(2).trim() }); continue; }
    if (!line.trim()) { flush(); continue; }
    para.push(line.trim());
  }
  flush();
  return { meta, sections, checks, reflection };
}

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
  const reading = parseOsis(meta.readingOsis);
  if (!reading || !verseExists(reading)) fail(`${where}: readingOsis "${meta.readingOsis}" is not a verse range in the BSB text`);
  for (const ref of meta.scriptureRefs || []) { const a = parseOsis(ref); if (!a || !verseExists(a)) fail(`${where}: scriptureRefs "${ref}" is not in the BSB text`); }
  if (!sections.some(s => s.blocks.some(b => b.type === 'reading'))) fail(`${where}: no ::reading block (the primary reading must appear in the lesson)`);
  compiled.set(e.id, { entry: e, meta, sections, checks, reflection, reading });
}
for (const f of files) fail(`lessons/${f}.md is not in the outline`);
if (errors.length) { console.error(`compile-pathway FAILED:\n  - ${errors.join('\n  - ')}`); process.exit(1); }

// ---------- merge into the runtime catalog ----------
const catalog = JSON.parse(readFileSync(CATALOG, 'utf8'));
for (const [id, { entry, meta, sections, checks, reflection, reading }] of compiled) {
  const lesson = catalog.lessons.find(l => l.id === id);
  if (!lesson) { console.error(`compile-pathway: catalog has no lesson ${id}`); process.exit(1); }
  const prose = sections.flatMap(s => s.blocks.filter(b => b.type === 'prose').map(b => b.text));
  Object.assign(lesson, {
    title: meta.title, objective: meta.objective, reading: meta.reading,
    ref: [reading.book, reading.chapter, reading.verseStart, reading.verseEnd],
    readingOsis: meta.readingOsis, body: prose,
    simple: sections.flatMap(s => s.blocks.filter(b => b.type === 'callout').map(b => b.text))[0] || lesson.simple,
    vocab: meta.glossary || {}, deeper: meta.deeper || '', drawers: meta.drawers || [],
    challenges: checks.map(c => ({ ...c, hint: c.hint || 'Look back at the section just above.' })), reviewChallenges: [],
    reflect: reflection?.prompt || '', model: reflection?.modelResponse || '',
    sections: sections.map(s => ({ id: s.id, anchor: `lesson:${id}#${s.id}`, title: s.title, blocks: s.blocks })),
    teaches: entry.teaches || [], requires: entry.requires || [], outcomes: entry.outcomes || [],
    scriptureRefs: meta.scriptureRefs || [], authored: true
  });
}
writeFileSync(CATALOG, JSON.stringify(catalog));
console.log(`compile-pathway: ${compiled.size} authored lesson(s) validated and merged; ${entries.length} outline entries checked`);
