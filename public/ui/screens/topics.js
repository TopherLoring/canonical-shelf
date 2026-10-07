// Step 5: Study Topics.
// Topics are a reference library outside course completion. The page keeps browsing, reading, and
// reference context together; learner notes stay anchored to the selected topic.
import { LIBRARY_BOOKS } from '../../library-data.js';
import { parseReference } from '../../bible-books.js';
import { mountScriptureRef, renderGroupChip, renderScriptureRef } from '../components/index.js';

const GROUPS = [
  ['questions', 'Questions', () => true, 'Start with a question, then inspect Scripture, context, and interpretation.'],
  ['theology', 'Theology & doctrine', t => /doctrine|theolog|trinity|salvation|atonement|spirit|church|grace/i.test(topicIndex(t)), 'Belief, doctrine, salvation, Church, Spirit, and theological frameworks.'],
  ['life', 'Christian life', t => /life|practice|prayer|ethic|forgive|relationship|vocation|worship/i.test(topicIndex(t)), 'Prayer, ethics, worship, relationships, vocation, and discipleship.'],
  ['concepts', 'Biblical concepts', t => /scripture|bible|canon|covenant|kingdom|gospel|prophe|wisdom|temple|sacrifice/i.test(topicIndex(t)), 'Major biblical ideas and how they connect across Scripture.'],
  ['difficult', 'Difficult questions', t => /difficult|suffer|evil|lgbtq|judg|hell|violence|miracle|science|slavery|women/i.test(topicIndex(t)), 'Contested texts and questions handled with evidence labels and interpretive limits.']
];

const summary = topic => topic?.answer || topic?.summary || topic?.intro || '';
const topicIndex = topic => [topic?.title, topic?.kind, ...(topic?.aliases || []), ...(topic?.tags || []), summary(topic)].filter(Boolean).join(' ');
const searchIndex = topic => [topicIndex(topic), ...(topic?.refs || []), ...(topic?.sections || []).flatMap(section => Array.isArray(section) ? section : [section?.title, section?.body]), ...(topic?.body || [])].filter(Boolean).join(' ').toLowerCase();
const getGroup = reference => {
  const parsed = parseReference(reference || '');
  return LIBRARY_BOOKS.find(book => book.n === parsed?.book)?.cat || 'gospel';
};
const topicMode = topic => topic?.source === 'question' ? 'questions' : (GROUPS.find(([id, , matches]) => id !== 'questions' && matches(topic))?.[0] || 'concepts');
const groupFor = mode => GROUPS.find(([id]) => id === mode) || GROUPS[0];
const hrefFor = (mode, query = '', topic = '') => {
  const params = new URLSearchParams();
  if (topic || (mode && mode !== 'questions')) params.set('mode', mode || 'questions');
  if (query) params.set('q', query);
  if (topic) params.set('topic', topic);
  const suffix = params.toString();
  return `/topics${suffix ? `?${suffix}` : ''}`;
};

function visibleTopics(data, mode, query) {
  const topics = data.topics || [];
  const needle = String(query || '').trim().toLowerCase();
  const questions = (data.questionThreads || []).map(thread => ({ ...thread, kind: 'Question', answer: thread.question, source: 'question' }));
  if (needle) return [...questions, ...topics].filter(topic => searchIndex(topic).includes(needle));
  if (mode === 'questions') return questions;
  return topics.filter(topic => groupFor(mode)[2](topic));
}

function topicCard(topic, index, selected, mode, query, esc) {
  const refs = (topic.refs || []).slice(0, 2);
  const link = hrefFor(mode, query, topic.id);
  return `<a class="topics-card${selected === topic.id ? ' is-selected' : ''}" href="${esc(link)}" ${selected === topic.id ? 'aria-current="true"' : ''}>
    <span class="topics-card__number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
    <span class="topics-card__copy"><strong>${esc(topic.title)}</strong><span>${esc(summary(topic))}</span>
      ${refs.length ? `<span class="topics-card__refs" aria-label="Scripture connections">${refs.map(ref => renderGroupChip({ group: getGroup(ref), label: ref, className: 'topics-reference-chip' })).join('')}</span>` : ''}
    </span><span class="topics-card__arrow" aria-hidden="true">→</span>
  </a>`;
}

function topicGroups(data, active, esc) {
  const topics = data.topics || [];
  return `<nav class="topics-groups" aria-label="Browse Study Topics"><p class="topics-groups__label">Browse</p>
    ${GROUPS.map(([id, label, matches]) => `<a href="${esc(hrefFor(id))}" ${active === id ? 'aria-current="page"' : ''}><span>${esc(label)}</span><span class="topics-groups__count">${id === 'questions' ? (data.questionThreads || []).length : topics.filter(matches).length}</span></a>`).join('')}
    <p class="topics-groups__label topics-groups__label--secondary">Look up a word</p>
    <a href="${esc(hrefFor('glossary'))}" ${active === 'glossary' ? 'aria-current="page"' : ''}><span>Glossary</span><span class="topics-groups__count">${(data.glossary || []).length}</span></a>
  </nav>`;
}

function topicSearch(query, mode, esc) {
  return `<form class="topics-search" id="topic-search" role="search">
    <label class="sr-only" for="topic-query">Search topics and the glossary</label>
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg>
    <input id="topic-query" name="topic-q" type="search" value="${esc(query)}" placeholder="Search topics and the glossary">
    <input name="topic-mode" type="hidden" value="${esc(mode)}"><button type="submit">Search</button>
  </form>`;
}

function relatedUnits(data, topic) {
  if (topic.touchpoints?.length) {
    const byId = new Map((data.units || []).map(unit => [unit.id, unit]));
    return [...new Map(topic.touchpoints.map(point => [point.unitId, byId.get(point.unitId)]).filter(([, unit]) => unit)).values()];
  }
  const terms = [...(topic.tags || []), ...(topic.aliases || []), topic.title].filter(Boolean).map(value => String(value).toLowerCase());
  return (data.units || []).map(unit => ({ unit, score: terms.reduce((score, term) => score + (`${unit.title} ${unit.scope || ''}`.toLowerCase().includes(term) ? 1 : 0), 0) }))
    .filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map(item => item.unit);
}

function referenceList(topic, esc) {
  const refs = topic.refs || [];
  if (!refs.length) return '<p class="topics-context__empty">No authored Scripture connections are attached yet.</p>';
  return `<div class="topics-reference-list">${refs.map((reference, index) => renderScriptureRef({
    reference, group: getGroup(reference), href: `/bible?q=${encodeURIComponent(reference)}`, id: `topics-ref-${index}`
  })).join('')}</div>`;
}

function relatedList(data, topic, esc) {
  const authored = (topic.related || []).map(id => (data.topics || []).find(item => item.id === id)).filter(Boolean);
  const tagged = (data.topics || []).filter(item => item.id !== topic.id && (item.tags || []).some(tag => (topic.tags || []).includes(tag)));
  const unique = [...new Map([...authored, ...tagged].map(item => [item.id, item])).values()].slice(0, 8);
  return unique.length ? `<ul>${unique.map(item => `<li><a href="${esc(hrefFor('questions', '', item.id))}">${esc(item.title)}</a></li>`).join('')}</ul>` : '<p class="topics-context__empty">No related Topics are authored.</p>';
}

function questionGuides(data, question, esc) {
  const words = String(question.title || question.question || '').toLowerCase().split(/[^a-z0-9]+/).filter(word => word.length > 4);
  const matches = (data.topics || []).map(topic => ({ topic, score: words.reduce((score, word) => score + (searchIndex(topic).includes(word) ? 1 : 0), 0) }))
    .filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map(item => item.topic);
  return matches.length ? `<ul>${matches.map(topic => `<li><a href="${esc(hrefFor('questions', '', topic.id))}">${esc(topic.title)}</a></li>`).join('')}</ul>` : '<p class="topics-context__empty">No individual Topic guide is linked yet.</p>';
}

const unitsList = (units, esc, rich) => units.length
  ? `<ul>${units.map(unit => `<li><a href="/course?unit=${encodeURIComponent(unit.id)}">${rich ? `<span>${esc(unit.title)}</span><small>${esc(unit.scope || 'Open related unit')}</small>` : esc(unit.title)}</a></li>`).join('')}</ul>`
  : `<p class="topics-context__empty">${rich ? 'No direct Learning Path connection was found.' : 'Related units appear here when available.'}</p>`;
const askButton = (topic, esc) => `<p class="topics-context__actions"><button class="button" type="button" data-ask="${esc(topic.title)}">Ask the Theologian</button></p>`;

function selectedPanel(data, topic, esc, detail = false) {
  if (!topic) return `<aside class="topics-context ui-panel ui-panel--raised" aria-label="Selected topic"><p class="ui-panel-eyebrow">Reference context</p><h2 class="ui-panel-title">Choose a topic</h2><p class="topics-context__empty">Select a question to see its summary, Scripture connections, and related Learning Path units.</p></aside>`;
  const units = relatedUnits(data, topic);
  if (!detail) {
    const openHref = `${hrefFor(topicMode(topic), '', topic.id)}&view=read`;
    return `<aside class="topics-context ui-panel ui-panel--raised" aria-label="Reference context">
      <header class="topics-context__head"><p class="ui-panel-eyebrow">${esc(topic.kind || 'Question')}</p><h2 class="ui-panel-title">Selected topic</h2>
        <h3>${esc(topic.title)}</h3><p>${esc(summary(topic))}</p><a class="button button--primary" href="${esc(openHref)}">Open topic</a></header>
      <section class="topics-context__section"><h3>Studied in the Learning Path</h3>${unitsList(units.slice(0, 4), esc, false)}</section>
    </aside>`;
  }
  const head = `<header class="topics-context__head"><p class="ui-panel-eyebrow">${esc(topic.kind || 'Question')}</p><h2 class="ui-panel-title">Reference Desk</h2>
      <p class="topics-context__note">Notes you write here stay with this Topic.</p><section class="study-notes" data-notes-mount aria-label="My Notes"></section></header>`;
  const body = topic.source === 'question'
    ? `<section class="topics-context__section"><h3>Learning Path connections</h3>${unitsList(units, esc, true)}</section>
       <section class="topics-context__section"><h3>Related Topic guides</h3>${questionGuides(data, topic, esc)}</section>`
    : `<section class="topics-context__section"><h3>Scripture connections</h3>${referenceList(topic, esc)}</section>
       <section class="topics-context__section"><h3>Studied in the Learning Path</h3>${unitsList(units, esc, true)}</section>
       <details class="topics-context__section"><summary>Related questions</summary>${relatedList(data, topic, esc)}</details>`;
  return `<aside class="topics-context ui-panel ui-panel--raised" aria-label="Reference context">${head}${body}${askButton(topic, esc)}</aside>`;
}

function topicDetail(topic, esc) {
  if (topic.source === 'question') return `<article class="topics-detail"><a class="topics-back" href="${esc(hrefFor('questions', '', topic.id))}">← Back to questions</a>
    <p class="eyebrow">Question · reference material</p><h1>${esc(topic.title)}</h1><p class="topics-detail__lede">${esc(summary(topic))}</p>
    <section class="topics-detail-section"><p class="eyebrow">Explore the question</p><h2>Follow it through the Learning Path</h2><p>These touchpoints revisit the question as the course introduces context, evidence, interpretation, and synthesis. Study Topics remain outside course completion.</p></section>
    <div class="topics-detail__actions"><button class="button" type="button" data-ask="${esc(topic.title)}">Ask the Theologian about this</button></div>
  </article>`;
  const sections = (topic.sections || []).map((section, index) => {
    const [title, body] = Array.isArray(section) ? section : [section?.title || `Section ${index + 1}`, section?.body || section];
    return `<section class="topics-detail-section"><p class="eyebrow">Explanation</p><h2>${esc(title)}</h2><p>${esc(body || '')}</p></section>`;
  }).join('');
  const body = (Array.isArray(topic.body) ? topic.body : []).map(text => `<p>${esc(text)}</p>`).join('');
  return `<article class="topics-detail"><a class="topics-back" href="${esc(hrefFor('questions', '', topic.id))}">← Back to questions</a>
    <p class="eyebrow">${esc(topic.kind || 'Reference')} · reference material</p><h1>${esc(topic.title)}</h1><p class="topics-detail__lede">${esc(summary(topic))}</p>
    ${sections}${body}<div class="topics-detail__actions"><button class="button" type="button" data-ask="${esc(topic.title)}">Ask the Theologian about this</button><a class="button" href="/search?q=${encodeURIComponent(topic.title)}">Search all connections</a></div>
  </article>`;
}

function glossaryView(data, query, esc) {
  const needle = String(query || '').trim().toLowerCase();
  const terms = (data.glossary || []).filter(term => !needle || `${term.term} ${term.quick} ${(term.definitions || []).join(' ')}`.toLowerCase().includes(needle));
  return `<header class="topics-heading"><p class="eyebrow">Study Topics · Reference</p><h1>Glossary</h1><p>Quick definitions that keep you moving, with deeper language and context when you want it.</p></header>
    ${topicSearch(query, 'glossary', esc)}<section class="topics-glossary" aria-label="Glossary terms">${terms.map(term => `<article class="topics-glossary__card" id="${esc(term.id || term.term)}"><h2>${esc(term.term)}</h2><p>${esc(term.quick || term.definitions?.[0] || '')}</p>${term.definitions?.length > 1 ? `<details><summary>Go deeper</summary>${term.definitions.slice(1).map(definition => `<p>${esc(definition)}</p>`).join('')}</details>` : ''}</article>`).join('') || '<p class="notice">No glossary terms match that search.</p>'}</section>`;
}

function renderTopics(container, ctx) {
  const { data, params, esc } = ctx;
  const legacyLink = params.has('topic') && !params.has('mode') && !params.has('view');
  const rawMode = params.get('mode') || 'questions';
  const mode = rawMode === 'ask' ? 'questions' : rawMode;
  const query = params.get('q') || '';
  const topics = visibleTopics(data, mode, query);
  const everything = [...(data.questionThreads || []).map(thread => ({ ...thread, kind: 'Question', answer: thread.question, source: 'question' })), ...(data.topics || [])];
  const selected = topics.find(topic => topic.id === params.get('topic')) || everything.find(topic => topic.id === params.get('topic')) || topics[0] || null;
  const detail = (params.get('view') === 'read' || legacyLink) && selected;
  const activeGroup = groupFor(mode);
  const listing = `<header class="topics-heading"><p class="eyebrow">Questions · concepts · evidence</p><h1>Study Topics</h1><p>Start with a question, then inspect Scripture, context, and interpretation. Topics are reference material, not a second curriculum.</p></header>
    ${topicSearch(query, mode, esc)}<section class="topics-results" aria-label="${esc(activeGroup[1])}"><header class="topics-results__head"><h2>${esc(activeGroup[1])}</h2><p>${topics.length} ${topics.length === 1 ? 'guide' : 'guides'}</p></header>
      <div class="topics-grid">${topics.slice(0, 24).map((topic, index) => topicCard(topic, index, selected?.id, mode, query, esc)).join('') || '<p class="notice">No Topics match that search.</p>'}</div>
      ${topics.length > 24 ? `<p class="topics-results__count">Showing 24 of ${topics.length} guides. Refine your search to narrow the list.</p>` : ''}
    </section>`;

  container.innerHTML = `<section class="topics-screen" data-topics-screen>
    ${topicGroups(data, mode, esc)}<div class="topics-main">${mode === 'glossary' ? glossaryView(data, query, esc) : detail ? topicDetail(selected, esc) : listing}</div>
    ${mode === 'glossary' ? '<aside class="topics-context ui-panel ui-panel--raised" aria-label="Glossary help"><p class="ui-panel-eyebrow">Reference Desk</p><h2 class="ui-panel-title">About the glossary</h2><p>Definitions are quick starting points. Open a related Topic or Learning Path unit to explore how a term works in context.</p></aside>' : selectedPanel(data, selected, esc, Boolean(detail))}
  </section>`;
  mountScriptureRef(container);
}

export function handles() { return true; }

export async function mount(container, ctx) {
  renderTopics(container, ctx);
  return () => {};
}
