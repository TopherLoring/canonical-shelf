// Step 9: Search on the Study Topics layout.
//   - A Scripture reference ("John 3:16") goes straight to the reader.
//   - Anything else shows instant results, grouped, with the selected result explained on the right.
//   - A Scripture word hit opens the reader at that verse; books open their overview.
//   - A question ("Why did God harden Pharaoh's heart?") also gets an "Ask the Theologian" row. It only opens the
//     Theologian with the question filled in; nothing is sent until the learner sends it.
import { BOOKS, parseReference } from '../../bible-books.js';
import { CATEGORIES } from '../../library-data.js';
import { bookIndexText, lessonIndexText, queryStudyIndex, studyTerms, topicIndexText, verseIndexText } from '../../study-index.js';
import { LABELS } from '../labels.js';

const GROUPS = [
  { id: 'all', label: 'Everything' },
  { id: 'topics', label: 'Topics' },
  { id: 'lessons', label: LABELS.learningPath + ' lessons' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'books', label: 'Books' },
  { id: 'scripture', label: 'Scripture' },
  { id: 'verses', label: 'Curated passages' }
];
// Results that open another screen directly; the rest are selected and explained on the right.
const DIRECT = new Set(['scripture', 'books', 'verses']);
const PREVIEW_LIMIT = 4;

export const handles = () => true;

export function isQuestion(text) {
  const q = String(text || '').trim();
  if (!q) return false;
  return /\?\s*$/.test(q) || /^(who|what|why|how|when|where|which|does|do|did|is|are|was|were|can|could|should|will|would)\b/i.test(q) || q.split(/\s+/).length >= 5;
}

const STOP = new Set('a an and are as at be been but by can could did do does for from had has have how i if in into is it its me my of on or our should so than that the their them then there these they this those to us was we were what when where which who whom whose why will with would you your god mean means say says wrote write written'.split(' '));
// "Why did God harden Pharaoh's heart?" is searched as "harden pharaoh heart": the question words match everything.
export const keywords = text => String(text || '').toLowerCase().replace(/[’']s\b/g, '').split(/[^a-z0-9]+/).filter(word => word.length > 2 && !STOP.has(word)).join(' ');

// A question matches on several words at once, not on one common word: keep only results that carry at least one of its
// content words (two words), or three quarters of them when there are more than two, best first.
function narrowToQuestion(result, terms) {
  if (terms.length < 2) return result;
  const need = terms.length >= 3 ? Math.ceil(terms.length * 0.75) : 1;
  const keep = textOf => list => list
    .map(item => { const hay = String(textOf(item) || '').toLowerCase(); return { item, hits: terms.reduce((n, term) => n + (hay.includes(term) ? 1 : 0), 0) }; })
    .filter(entry => entry.hits >= need).sort((a, b) => b.hits - a.hits).map(entry => entry.item);
  return {
    ...result,
    scripture: keep(row => row.text)(result.scripture),
    topics: keep(topicIndexText)(result.topics),
    lessons: keep(lessonIndexText)(result.lessons),
    glossary: keep(item => `${item.term} ${item.quick || ''} ${(item.definitions || []).join(' ')}`)(result.glossary),
    books: keep(bookIndexText)(result.books),
    verses: keep(verseIndexText)(result.verses)
  };
}

const hrefFor = (query, type = 'all', pick = '') => {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (type && type !== 'all') params.set('type', type);
  if (pick) params.set('pick', pick);
  const suffix = params.toString();
  return `/search${suffix ? `?${suffix}` : ''}`;
};

const summary = topic => topic?.answer || topic?.summary || topic?.intro || '';

function items(result) {
  return {
    topics: result.topics.map(topic => ({ group: 'topics', id: topic.id, label: topic.kind || 'Topic', title: topic.title, text: summary(topic), source: topic })),
    lessons: result.lessons.map(lesson => ({ group: 'lessons', id: lesson.id, label: LABELS.learningPath + ' lesson', title: lesson.title, text: lesson.objective || lesson.simple || '', source: lesson })),
    glossary: result.glossary.map(term => ({ group: 'glossary', id: term.id || term.term, label: 'Glossary', title: term.term, text: term.quick || term.definitions?.[0] || '', source: term })),
    books: result.books.map(book => ({ group: 'books', id: String(book.n), label: CATEGORIES[book.cat]?.name || 'Bible book', title: book.name, text: book.hook || book.syn || '', href: `/bible?book=${book.n}&profile=1` })),
    scripture: result.scripture.map(row => ({ group: 'scripture', id: `${row.bn}.${row.chapter}.${row.verse}`, label: 'Scripture', title: `${BOOKS[row.bn - 1]} ${row.chapter}:${row.verse}`, text: row.text, href: `/bible?book=${row.bn}&chapter=${row.chapter}&start=${row.verse}#v${row.verse}` })),
    verses: result.verses.map(verse => ({ group: 'verses', id: verse.ref, label: 'Curated passage', title: verse.ref, text: verse.note || verse.bsb || '', href: `/practice?mode=verses&q=${encodeURIComponent(verse.ref)}` }))
  };
}

function card(item, query, selected, esc) {
  const href = DIRECT.has(item.group) ? item.href : hrefFor(query, item.group, item.id);
  const current = selected === `${item.group}:${item.id}`;
  return `<a class="search-card${current ? ' is-selected' : ''}" href="${esc(href)}" ${current ? 'aria-current="true"' : ''}>
    <span class="search-card__copy"><small>${esc(item.label)}</small><strong>${esc(item.title)}</strong><span>${esc(item.text)}</span></span>
    <span class="search-card__arrow" aria-hidden="true">→</span></a>`;
}

function leftList(query, active, counts, esc) {
  return `<nav class="search-groups" aria-label="Search results by type"><p class="search-groups__label">Results</p>
    ${GROUPS.map(group => `<a href="${esc(hrefFor(query, group.id))}" ${active === group.id ? 'aria-current="page"' : ''}><span>${esc(group.label)}</span><span class="search-groups__count">${counts[group.id]}</span></a>`).join('')}
  </nav>`;
}

function searchForm(query, esc) {
  return `<form class="search-form" role="search" action="/search" method="get" data-search-form>
    <label class="sr-only" for="search-page-q">Search the Bible, Topics, the Learning Path and the glossary</label>
    <input id="search-page-q" name="q" type="search" value="${esc(query)}" placeholder="Search the Bible, Topics, glossary, books" autocomplete="off">
    <button type="submit" class="button button--primary">Search</button>
  </form>`;
}

function askRow(query, esc) {
  return `<div class="search-ask"><div><strong>Ask the Theologian</strong><span>Opens the Theologian with your question filled in. Nothing is sent until you send it.</span></div>
    <button class="button" type="button" data-ask="${esc(query)}">Ask: “${esc(query.length > 60 ? `${query.slice(0, 57)}…` : query)}”</button></div>`;
}

function section(group, list, query, selected, esc, all) {
  const shown = all ? list.slice(0, PREVIEW_LIMIT) : list;
  return `<section class="search-section" aria-label="${esc(group.label)}"><header class="search-section__head"><h2>${esc(group.label)}</h2><span>${list.length}</span></header>
    <div class="search-list">${shown.map(item => card(item, query, selected, esc)).join('')}</div>
    ${all && list.length > PREVIEW_LIMIT ? `<a class="search-more" href="${esc(hrefFor(query, group.id))}">See all ${list.length} ${esc(group.label.toLowerCase())}</a>` : ''}</section>`;
}

function context(item, query, active, esc) {
  const ask = `<p class="search-context__actions"><button class="button" type="button" data-ask="${esc(item?.title || query)}">Ask the Theologian about this</button></p>`;
  if (!item) {
    return `<aside class="search-context ui-panel ui-panel--raised" aria-label="Selected result"><p class="ui-panel-eyebrow">${DIRECT.has(active) ? 'Opens in place' : 'Selected result'}</p>
      <h2 class="ui-panel-title">${DIRECT.has(active) ? 'Open a result' : 'Choose a result'}</h2>
      <p>${DIRECT.has(active) ? 'Scripture, books and curated passages open directly: a verse opens in the Bible reader at that verse, a book opens its overview.' : 'Select a result to read a summary here, then open it.'}</p></aside>`;
  }
  const source = item.source || {};
  let body = `<p>${esc(item.text)}</p>`;
  let open = '';
  if (item.group === 'topics') open = `<a class="button button--primary" href="/topics?topic=${encodeURIComponent(item.id)}">Open topic</a>`;
  if (item.group === 'lessons') open = `<a class="button button--primary" href="/course?unit=${encodeURIComponent(source.unitId || '')}&lesson=${encodeURIComponent(item.id)}">Open lesson</a>`;
  if (item.group === 'glossary') {
    body = `<p>${esc(source.quick || source.definitions?.[0] || '')}</p>${(source.definitions || []).slice(1, 3).map(definition => `<p>${esc(definition)}</p>`).join('')}`;
    open = `<a class="button button--primary" href="/topics?mode=glossary&q=${encodeURIComponent(item.title)}">Open in the Glossary</a>`;
  }
  return `<aside class="search-context ui-panel ui-panel--raised" aria-label="Selected result"><p class="ui-panel-eyebrow">${esc(item.label)}</p>
    <h2 class="ui-panel-title">${esc(item.title)}</h2>${body}<p class="search-context__actions">${open}</p>${ask}</aside>`;
}

function render(container, ctx) {
  const { data, corpus, params, esc } = ctx;
  const query = (params.get('q') || '').trim();
  const type = GROUPS.some(group => group.id === params.get('type')) ? params.get('type') : 'all';
  const question = isQuestion(query);
  const searched = question ? keywords(query) || query : query;
  const raw = query
    ? queryStudyIndex({ query: searched, data, corpus, limits: { scripture: 200, topics: 40, lessons: 40, glossary: 40, books: 20, verses: 40 } })
    : { topics: [], lessons: [], glossary: [], books: [], scripture: [], verses: [] };
  const result = question && query ? narrowToQuestion(raw, studyTerms(searched)) : raw;
  const grouped = items(result);
  const counts = { all: 0 };
  for (const group of GROUPS.slice(1)) { counts[group.id] = grouped[group.id].length; counts.all += grouped[group.id].length; }
  const pool = type === 'all' ? ['topics', 'lessons', 'glossary'].flatMap(id => grouped[id]) : DIRECT.has(type) ? [] : grouped[type];
  const wanted = params.get('pick');
  const selected = pool.find(item => wanted && String(item.id) === wanted && (type === 'all' || item.group === type)) || pool[0] || null;
  const selectedKey = selected ? `${selected.group}:${selected.id}` : '';

  let main;
  if (!query) {
    main = `<header class="search-heading"><p class="eyebrow">Search</p><h1>Search the shelf</h1><p>Look up a reference like John 3:16, a word in Scripture, a Topic, a Learning Path lesson, or a glossary term.</p></header>${searchForm('', esc)}`;
  } else {
    const groups = type === 'all' ? GROUPS.slice(1) : GROUPS.filter(group => group.id === type);
    const sections = groups.filter(group => grouped[group.id].length).map(group => section(group, grouped[group.id], query, selectedKey, esc, type === 'all')).join('');
    main = `<header class="search-heading"><p class="eyebrow">Search the whole shelf</p><h1>“${esc(query)}”</h1><p>${counts.all} result${counts.all === 1 ? '' : 's'} ${question ? `for “${esc(searched)}” ` : ''}across Scripture, Topics, the Learning Path, the glossary and book overviews.</p></header>
      ${searchForm(query, esc)}${question ? askRow(query, esc) : ''}${sections || '<p class="notice" role="status">Nothing matches that search. Try a single word, or a reference like John 3:16.</p>'}`;
  }

  container.innerHTML = `<section class="search-screen" data-search-screen aria-label="Search">${leftList(query, type, counts, esc)}<div class="search-main">${main}</div>${context(selected, query, type, esc)}</section>`;
}

export async function mount(container, ctx) {
  const query = (ctx.params.get('q') || '').trim();
  // A Scripture reference is not a search: open it.
  if (query && parseReference(query)?.chapter) { ctx.navigate(`/bible?q=${encodeURIComponent(query)}`, { replace: true }); return () => {}; }
  render(container, ctx);
  return () => {};
}
