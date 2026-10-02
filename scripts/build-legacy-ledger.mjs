// Freezes the content of every lesson as it stood before the curriculum rewrite (owner decision
// curriculum.rewrite.no-loss-no-condense). compile-pathway checks every rewritten lesson against it: each item
// must be carried into the new lesson (or explicitly moved), and the teaching text may not shrink.
// Run once from the migrated catalog (before authored lessons are merged):  bun run migrate && bun scripts/build-legacy-ledger.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const OUT = 'content/pathway/legacy-ledger.json';
if (existsSync(OUT) && !process.argv.includes('--force')) { console.error(`${OUT} exists; it is frozen. Use --force only to rebuild it deliberately.`); process.exit(1); }
const cat = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
const words = s => (String(s || '').match(/[\p{L}\p{N}’']+/gu) || []).length;
const lessons = {};
for (const l of cat.lessons) {
  if (l.authored) { console.error(`${l.id} is already authored in this catalog; build the ledger from the migrated catalog only`); process.exit(1); }
  const items = [];
  const add = (id, kind, text) => { if (text && String(text).trim()) items.push({ id, kind, text: String(text).trim() }); };
  (l.body || []).forEach((p, i) => add(`p${i + 1}`, 'paragraph', p));
  add('simple', 'summary', l.simple); add('deeper', 'deeper', l.deeper); add('reflect', 'reflection', l.reflect); add('model', 'model-response', l.model);
  for (const [term, def] of Object.entries(l.vocab || {})) add(`vocab:${term}`, 'glossary', `${term}: ${def}`);
  (l.drawers || []).forEach(d => add(`drawer:${d.title}`, 'drawer', `${d.title} ${d.body || ''}`));
  (l.challenges || []).forEach((c, i) => add(`check:${i + 1}`, 'check', JSON.stringify({ title: c.title, prompt: c.prompt, items: c.items, options: c.options, why: c.why })));
  (l.reviewChallenges || []).forEach((c, i) => add(`review:${i + 1}`, 'review-check', JSON.stringify({ title: c.title, prompt: c.prompt, items: c.items, options: c.options, why: c.why })));
  if (l.visual) add('visual', 'visual', typeof l.visual === 'string' ? l.visual : `${l.visual.title || ''} ${l.visual.text || ''}`);
  (l.sources || []).forEach((src, i) => add(`source:${i + 1}`, 'source', typeof src === 'string' ? src : JSON.stringify(src)));
  (l.extraReadings || []).forEach((r, i) => add(`extra:${i + 1}`, 'extra-reading', typeof r === 'string' ? r : JSON.stringify(r)));
  lessons[l.id] = { title: l.title, teachingWords: words([...(l.body || []), l.simple, l.deeper].join(' ')), checks: (l.challenges || []).length, reviewChecks: (l.reviewChallenges || []).length, items };
}
writeFileSync(OUT, JSON.stringify({ _: 'Frozen content of every lesson before the rewrite. Do not edit.', frozenAt: new Date().toISOString().slice(0, 10), lessons }, null, 1) + '\n');
console.log(`ledger: ${Object.keys(lessons).length} lessons, ${Object.values(lessons).reduce((n, l) => n + l.items.length, 0)} items`);
