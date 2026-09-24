import { parseReference, parseCorpus, BOOKS } from "./bible.js";

export function scriptureResults(q, corpus) {
  const ref = parseReference(q);
  if (ref) return [{
    label: `${BOOKS[ref.bn - 1]} ${ref.chapter}${ref.start ? `:${ref.start}${ref.end !== ref.start ? `-${ref.end}` : ""}` : ""}`,
    href: `/bible?book=${ref.bn}&chapter=${ref.chapter}`
  }];
  const n = q.toLowerCase();
  return parseCorpus(corpus).filter(r => r.text.toLowerCase().includes(n)).slice(0, 12).map(r => ({
    label: `${BOOKS[r.bn - 1]} ${r.chapter}:${r.verse} — ${r.text}`,
    href: `/bible?book=${r.bn}&chapter=${r.chapter}`
  }));
}

export function searchPage(q, { data, corpus, esc, shell }) {
  const n = q.toLowerCase();
  const topics = data.topics.filter(t => `${t.title} ${t.answer || ""} ${(t.tags || []).join(" ")}`.toLowerCase().includes(n)).slice(0, 12);
  const units = data.units.filter(u => `${u.title} ${u.scope}`.toLowerCase().includes(n)).slice(0, 12);
  const terms = (data.glossary || []).filter(term => `${term.term} ${term.quick} ${(term.definitions || []).join(" ")}`.toLowerCase().includes(n)).slice(0, 12);
  const bible = scriptureResults(q, corpus);
  
  return shell(`Search: “${q}”`, "Across Canonical Shelf", `<div class="results"><section><h2>Bible</h2>${bible.map(x => `<a class="result" href="${x.href}">${esc(x.label)}</a>`).join("") || "<p>No Scripture matches.</p>"}</section><section><h2>Topics</h2>${topics.map(t => `<div class="result"><a href="/topics?topic=${encodeURIComponent(t.id)}"><strong>${esc(t.title)}</strong></a><p>${esc(t.answer || "").slice(0, 220)}</p></div>`).join("") || "<p>No Topic matches.</p>"}</section><section><h2>Glossary</h2>${terms.map(term => `<div class="result"><a href="/topics?mode=glossary&q=${encodeURIComponent(term.term)}"><strong>${esc(term.term)}</strong></a><p>${esc(term.quick)}</p></div>`).join("") || "<p>No glossary matches.</p>"}</section><section><h2>Course</h2>${units.map(u => `<div class="result"><a href="/course?unit=${encodeURIComponent(u.id)}"><strong>${esc(u.title)}</strong></a><p>${esc(u.scope)}</p></div>`).join("") || "<p>No course matches.</p>"}</section><button class="button" data-ask="${esc(q)}">Ask the Theologian about this</button></div>`);
}
