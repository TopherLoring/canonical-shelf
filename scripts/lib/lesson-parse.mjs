// Lesson file parser shared by the build (compile-pathway.mjs) and the build-time divider (lesson-divider.mjs),
// so both read a lesson's sections and blocks the same way. Syntax is documented in compile-pathway.mjs.
// `fail(message)` receives every problem found; the caller decides whether problems stop the build.
export function parseLesson(text, file, fail = message => { throw new Error(message); }) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) { fail(`${file}: missing --- JSON frontmatter ---`); return null; }
  let meta;
  try { meta = JSON.parse(m[1]); } catch (e) { fail(`${file}: frontmatter is not valid JSON (${e.message})`); return null; }
  const sections = [];
  const checks = [];
  let reflection = null, cur = null, para = [];
  const flush = () => { if (para.length && cur) cur.blocks.push({ type: 'prose', text: para.join(' ').trim() }); para = []; };
  const lines = m[2].split(/\r?\n/);
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
    if (/^::visual\s*$/.test(line)) { flush(); cur.blocks.push({ type: 'visual' }); continue; }
    if (/^::step\s*$/.test(line)) { flush(); cur.blocks.push({ type: 'step' }); continue; }
    if (/^> /.test(line)) { flush(); cur.blocks.push({ type: 'callout', text: line.slice(2).trim() }); continue; }
    if (!line.trim()) { flush(); continue; }
    para.push(line.trim());
  }
  flush();
  return { meta, sections, checks, reflection };
}

