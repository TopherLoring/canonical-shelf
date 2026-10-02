// One-time, mechanical conversion of every lesson not yet authored into the final lesson format
// (content/pathway/lessons/<id>.md) and the outline. Text moves over word for word: paragraphs, summary,
// reading, visual, glossary, drawers, deeper reading, checks, reflection, and model response. Steps keep the
// titles learners already see. Each check is placed right after the first section by which the lesson has
// taught most of what the check asks about (its key terms). Options already in answer order are shuffled
// deterministically, with the answer remapped. The content ledger then verifies nothing was lost.
//   bun run migrate && bun scripts/convert-legacy-lessons.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { osisOf } from './lib/bible-books.mjs';

const cat = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
const outlinePath = 'content/pathway/outline.json';
const outline = JSON.parse(readFileSync(outlinePath, 'utf8'));
const DEFAULTS = [['Explain', 'Read closely'], ['Context', 'Locate the claim in context'], ['Explain', 'Follow the relationship'], ['Context', 'Keep the setting visible'], ['Interpret', 'Distinguish what follows from the evidence']];
const STOP = new Set('about above after again against also among another because been before being below between both cannot could does doing during each either every from further have having here into itself just more most much must never other over same shall should since some such than that their them then there these they this those through under until upon very were what when where whether which while will with within without would your'.split(' '));
const terms = t => [...new Set((String(t || '').toLowerCase().match(/[\p{L}]{5,}/gu) || []).filter(w => !STOP.has(w)))];
const slug = (t, used) => { let s = String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'section'; let k = s, n = 2; while (used.has(k)) k = `${s}-${n++}`; used.add(k); return k; };

function permuteIfIdentity(ch) {
  const c = structuredClone(ch);
  const n = (c.kind === 'match' || c.kind === 'argument-map') ? (c.options || []).length : (c.items || []).length;
  const identity = Array.isArray(c.answer) && c.answer.length && c.answer.every((a, i) => a === i);
  if (!identity || n < 2) return c;
  const order = [...Array(n).keys()].map(i => (i + 1) % n); // deterministic rotation: never the original order
  if (c.kind === 'match' || c.kind === 'argument-map') {
    const newOptions = order.map(i => c.options[i]);
    c.answer = c.answer.map(a => newOptions.indexOf(c.options[a]));
    c.options = newOptions;
  } else if (c.kind === 'sequence') {
    const newItems = order.map(i => c.items[i]);
    c.answer = c.items.map((_, k) => newItems.indexOf(c.items[c.answer[k]]));
    c.items = newItems;
  }
  return c;
}

function convert(l) {
  const used = new Set();
  const sections = [];
  const body = [...(l.body || [])];
  const open = { id: slug('orient', used), title: l.title, blocks: [] };
  if (l.simple) open.blocks.push(`> ${l.simple}`);
  if (body.length) open.blocks.push(body.shift());
  sections.push(open);
  const ref = Array.isArray(l.ref) && l.ref.length >= 2 ? osisOf({ book: l.ref[0], chapter: l.ref[1], verseStart: l.ref[2] || null, verseEnd: l.ref[3] || l.ref[2] || null }) : null;
  if (ref) sections.push({ id: slug('read', used), title: 'Read the passage with the question in view', blocks: ['::reading'] });
  for (let off = 0; off < body.length; off += 2) {
    const [, title] = DEFAULTS[(off + 1) % DEFAULTS.length];
    sections.push({ id: slug(title, used), title, blocks: body.slice(off, off + 2) });
  }
  if (l.visual) sections.push({ id: slug('see-the-relationship', used), title: 'See the relationship', blocks: ['::visual'] });
  // place checks where they are earned
  const contentSections = sections.length;
  const checks = (l.challenges || []).map(permuteIfIdentity);
  const cumulative = []; let acc = '';
  for (const s of sections) { acc += ' ' + s.blocks.join(' ').toLowerCase(); cumulative.push(acc); }
  const placed = sections.map(() => []);
  checks.forEach((ch, i) => {
    const t = terms([ch.prompt, ...(ch.items || []), ...(ch.options || []), ch.why].join(' '));
    let at = contentSections - 1;
    for (let k = 0; k < contentSections; k++) { const hit = t.filter(w => cumulative[k].includes(w)).length / Math.max(1, t.length); if (hit >= 0.7) { at = k; break; } }
    placed[at].push(i);
  });
  if (l.reflect) sections.push({ id: slug('reflect', used), title: 'Reflect on the lesson', blocks: ['::reflect'] });
  const meta = {
    id: l.id, title: l.title, objective: l.objective || '', reading: l.reading || '', ...(ref ? { readingOsis: ref } : {}),
    scriptureRefs: [], glossary: l.vocab || {}, deeper: l.deeper || '', drawers: l.drawers || []
  };
  const out = ['---', JSON.stringify(meta, null, 2), '---'];
  sections.forEach((s, k) => {
    out.push(`## ${s.title} {#${s.id}}`);
    for (const b of s.blocks) {
      if (b === '::reflect') { out.push('```reflect', JSON.stringify({ prompt: l.reflect, modelResponse: l.model || '' }, null, 2), '```', ''); continue; }
      out.push(b, '');
    }
    for (const i of placed[k] || []) out.push('```check', JSON.stringify(checks[i], null, 2), '```', '');
  });
  return { text: out.join('\n'), anchors: sections.map(s => s.id), checks: checks.map(c => c.title), ref, objective: l.objective || '' };
}

// Outline: every unit of every module in catalog order; existing entries (already authored) are kept as they are.
const existing = new Map();
for (const m of outline.modules || []) for (const u of m.units || []) for (const e of u.lessons || []) existing.set(e.id, e);
const modules = [];
let converted = 0;
for (const course of cat.courses) {
  const mod = (outline.modules || []).find(m => m.courseId === course.id) || { id: course.id, title: course.title };
  const units = cat.units.filter(u => u.courseId === course.id);
  mod.courseId = course.id; mod.title = mod.title || course.title;
  mod.units = units.map(u => ({
    unitId: u.id,
    lessons: (cat.byUnit[u.id] || []).filter(a => a.startsWith('lesson:')).map(a => a.slice(7)).map(id => {
      if (existing.has(id)) return existing.get(id);
      const l = cat.lessons.find(x => x.id === id);
      const path = `content/pathway/lessons/${id}.md`;
      const r = convert(l);
      if (!existsSync(path)) { writeFileSync(path, r.text); converted++; }
      return { id, authored: true, converted: 'mechanical (text carried word for word; awaiting editorial rewrite)', purpose: r.objective, ...(r.ref ? { reading: r.ref } : {}), teaches: [], requires: [], outcomes: [], sections: r.anchors, checks: r.checks };
    })
  }));
  modules.push(mod);
}
outline.modules = modules;
writeFileSync(outlinePath, JSON.stringify(outline, null, 2) + '\n');
console.log(`converted ${converted} lessons; outline now has ${modules.length} modules, ${modules.reduce((n, m) => n + m.units.length, 0)} units, ${modules.reduce((n, m) => n + m.units.reduce((k, u) => k + u.lessons.length, 0), 0)} lessons`);
