// Step 5: Study Topics.
// Topics are a reference library outside course completion. The page keeps browsing, reading, and
// reference context together; learner notes stay anchored to the selected topic.
import { LIBRARY_BOOKS } from '../../library-data.js';
import { parseReference } from '../../bible-books.js';
import { renderEdgeTab, setFrameVariant } from '../components/index.js';
import { renderMounts } from '../../study-notes.js';

const ic = body => `<svg class="cs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const ICONS = Object.freeze({
  search: ic('<circle cx="10.5" cy="10.5" r="6.5"></circle><path d="M15.5 15.5 21 21"></path>'),
  glossary: ic('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"></path><path d="M9 9h6M9 13h4"></path>'),
  down: ic('<path d="m6 9 6 6 6-6"></path>'),
  left: ic('<path d="m15 6-6 6 6 6"></path>'),
  right: ic('<path d="m9 6 6 6-6 6"></path>')
});
const STAGES = Object.freeze({ introduce: 'Introduce', ground: 'Ground', contextualize: 'Context', encounter: 'Encounter', investigate: 'Investigate', synthesize: 'Synthesize' });

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
  return topics.filter(topic => topicMode(topic) === mode);
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


const GROUP_KEY = Object.freeze({ law: 'law', history: 'othist', wisdom: 'wisdom', major: 'major', minor: 'minor', gospel: 'gospel', gospels: 'gospel', paul: 'paul', general: 'general', revelation: 'apoc', apoc: 'apoc' });
const groupKey = reference => GROUP_KEY[getGroup(reference)] || getGroup(reference);
const questionsOf = data => (data.questionThreads || []).map(thread => ({ ...thread, kind: 'Question', answer: thread.question, source: 'question' }));
const clip = (text, max = 130) => text.length > max ? `${text.slice(0, text.lastIndexOf(' ', max - 3) > 0 ? text.lastIndexOf(' ', max - 3) : max - 3).replace(/[.,;:]+$/, '')}…` : text;
const sectionPair = (section, index) => Array.isArray(section) ? [section[0], section[1]] : [section?.title || `Section ${index + 1}`, section?.body || ''];
const link = (mode, params = {}) => {
  const query = new URLSearchParams();
  if (mode && mode !== 'questions') query.set('mode', mode);
  else if (params.topic) query.set('mode', 'questions');
  Object.entries(params).forEach(([key, value]) => { if (value !== '' && value !== undefined && value !== null) query.set(key, value); });
  const suffix = query.toString();
  return `/topics${suffix ? `?${suffix}` : ''}`;
};

/** Topics and questions, with their category (mode) and type, from the address. */
function resolve(data, params) {
  const questions = questionsOf(data);
  const topics = data.topics || [];
  const everything = [...questions, ...topics];
  const query = (params.get('q') || '').trim();
  let mode = params.get('mode') || 'questions';
  if (mode === 'ask') mode = 'questions';
  const wanted = everything.find(topic => topic.id === params.get('topic')) || null;
  if (wanted && !params.has('mode')) mode = topicMode(wanted);
  if (wanted && mode !== 'glossary' && mode !== topicMode(wanted)) mode = topicMode(wanted);
  if (!GROUPS.some(([id]) => id === mode) && mode !== 'glossary') mode = 'questions';
  const list = visibleTopics(data, mode, query);
  const open = wanted?.source === 'question' ? wanted : null;
  const selected = open ? null : (wanted && mode !== 'questions' ? wanted : (mode === 'questions' || mode === 'glossary' ? null : list[0] || null));
  const sub = Math.max(0, Number.parseInt(params.get('sub') || '0', 10) || 0);
  return { mode, query, list, open, selected, sub, subGiven: params.has('sub'), searching: Boolean(query) };
}

const countFor = (data, id) => id === 'questions' ? (data.questionThreads || []).length : (data.topics || []).filter(topic => topicMode(topic) === id).length;

function rail(data, state, esc) {
  const item = (id, label, icon, count, current) => `<a class="cs-rail__item${current ? ' is-current' : ''}" href="${esc(link(id))}"${current ? ' aria-current="page"' : ''}>${icon || ''}<span class="cs-grow">${esc(label)}</span>${current && count !== undefined ? `<span class="cs-count">${count}</span>` : ''}</a>`;
  const active = state.searching ? '' : state.mode;
  return `<nav class="cs-card cs-rail topics-rail" aria-label="Topic groups"><span class="cs-rail__label">Browse</span>
    ${GROUPS.map(([id, label]) => item(id, label, '', countFor(data, id), active === id)).join('')}
    <span class="cs-rail__section">Look up a word</span>${item('glossary', 'Glossary', ICONS.glossary, (data.glossary || []).length, active === 'glossary')}</nav>`;
}

function picker(data, state, esc) {
  const options = [...GROUPS.map(([id, label]) => [id, label]), ['glossary', 'Glossary']];
  const current = options.find(([id]) => id === state.mode) || options[0];
  return `<label class="cs-typepicker topics-picker"><span class="cs-grow">${esc(current[1])}</span>${ICONS.down}<select aria-label="Choose a topic type" data-topics-select>${options.map(([id, label]) => `<option value="${esc(link(id))}"${id === current[0] ? ' selected' : ''}>${esc(label)}</option>`).join('')}</select></label>`;
}

function searchBox(state, esc) {
  return `<form class="topics-search" id="topic-search" role="search"><label class="cs-fieldsearch">${ICONS.search}<span class="cs-visually-hidden">Search topics and the glossary</span>
    <input id="topic-query" name="topic-q" type="search" value="${esc(state.query)}" placeholder="Search topics and the glossary"></label>
    <input name="topic-mode" type="hidden" value="${esc(state.mode)}"><button class="cs-visually-hidden" type="submit">Search</button></form>`;
}

const heading = (mode, esc, label = '', phoneOnly = false) => {
  const group = mode === 'glossary' ? ['glossary', 'Glossary', null, 'Quick definitions that keep you moving, with deeper language and context when you want it.'] : groupFor(mode);
  const title = '<span class="topics-phone-title" aria-hidden="true">Study Topics</span>';
  if (phoneOnly) return `<div class="cs-heading">${title}<span class="cs-sub">${esc(group[3])}</span></div>`;
  return `<div class="cs-heading"><span class="cs-kicker topics-kicker">Study Topics</span>${title}<h1 class="topics-h1">${esc(label || group[1])}</h1><span class="cs-sub">${esc(group[3])}</span></div>`;
};

function refList(refs, esc) {
  if (!refs.length) return '<p class="cs-muted">No authored Scripture connections are attached yet.</p>';
  return `<ul class="cs-refs">${refs.map(ref => `<li data-group="${esc(groupKey(ref))}"><span class="cs-refs__bar"></span><div class="cs-grow"><div class="cs-refs__head"><a href="${esc(`/bible?q=${encodeURIComponent(ref)}`)}">${esc(ref)}</a></div></div></li>`).join('')}</ul>`;
}

function studiedCard(units, esc) {
  return `<section class="cs-card cs-panel cs-studied"><span class="cs-caption cs-caption--label">Studied in the Learning Path</span>${units.length
    ? units.map(unit => `<a href="/course?unit=${encodeURIComponent(unit.id)}"><span class="cs-kicker cs-kicker--small">${esc(unit.moduleTitle || unit.courseTitle || '')}</span><span>${esc(unit.title)}</span></a>`).join('')
    : '<p class="cs-muted">No direct Learning Path connection was found.</p>'}</section>`;
}
const askCard = (title, esc) => `<button type="button" class="cs-card cs-ask" data-ask="${esc(title)}">Ask the Theologian about this ${ICONS.right}</button>`;

function withModules(data, units) {
  const courses = new Map((data.courses || []).map(course => [course.id, course]));
  return units.map(unit => ({ ...unit, moduleTitle: courses.get(unit.courseId)?.title || '' }));
}

function topicCards(list, state, esc, kind) {
  const cards = list.slice(0, 24).map(topic => {
    const current = state.selected?.id === topic.id;
    const href = topic.source === 'question' ? link('questions', { topic: topic.id, view: 'read' }) : link(topicMode(topic), { topic: topic.id, sub: 0 });
    return `<a class="cs-topic" href="${esc(href)}"${current ? ' aria-current="true"' : ''}><span class="cs-topic__title">${esc(topic.title)}</span><span class="cs-topic__text">${esc(topic.source === 'question' ? summary(topic) : clip(summary(topic)))}</span></a>`;
  }).join('');
  const shown = Math.min(24, list.length);
  return `<div class="cs-topic-grid">${cards || '<p class="cs-muted">No Topics match that search.</p>'}</div><span class="cs-result-count" aria-live="polite">Showing ${shown} of ${list.length} ${kind}</span>`;
}

function itemPane(data, state, esc) {
  const topic = state.selected;
  if (!topic) return '<aside class="cs-stack" aria-label="Selected topic"><section class="cs-card cs-panel"><span class="cs-caption cs-caption--label">Overview</span><p class="cs-muted">Choose a topic to read its overview, sub topics, and sources.</p></section></aside>';
  const subs = (topic.sections || []).map(sectionPair);
  const index = Math.min(state.sub, Math.max(0, subs.length - 1));
  const [subTitle, subText] = subs[index] || [];
  const extra = (Array.isArray(topic.body) ? topic.body : []).map(text => `<p>${esc(text)}</p>`).join('');
  const units = withModules(data, relatedUnits(data, topic)).slice(0, 3);
  return `<aside class="cs-stack" aria-label="Selected topic" data-topic-id="${esc(topic.id)}">
    <section class="cs-card cs-panel cs-topic-detail"><span class="cs-caption cs-caption--label">Overview</span><h2>${esc(topic.title)}</h2><p>${esc(summary(topic))}</p>${extra}</section>
    ${subs.length ? `<section class="cs-card cs-panel"><span class="cs-caption cs-caption--label">Sub topics</span><nav class="cs-sublist" aria-label="Sub topics">${subs.map(([title], n) => `<a href="${esc(link(topicMode(topic), { topic: topic.id, sub: n }))}"${n === index ? ' aria-current="true"' : ''}><span class="cs-sublist__num">${n + 1}</span>${esc(title)}</a>`).join('')}</nav></section>
    <section class="cs-card cs-panel cs-subbody"><span class="cs-caption cs-caption--label">${esc(subTitle)}</span><p>${esc(subText)}</p><span class="cs-caption cs-caption--label">Sources</span>${refList(topic.refs || [], esc)}</section>` : `<section class="cs-card cs-panel cs-subbody"><span class="cs-caption cs-caption--label">Sources</span>${refList(topic.refs || [], esc)}</section>`}
    ${studiedCard(units, esc)}${askCard(topic.title, esc)}</aside>`;
}

function guidesFor(data, question) {
  const words = String(question.title || '').toLowerCase().split(/[^a-z0-9]+/).filter(word => word.length > 4);
  const matches = (data.topics || []).map(topic => ({ topic, score: words.reduce((score, word) => score + (searchIndex(topic).includes(word) ? 1 : 0), 0) }))
    .filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map(item => item.topic);
  return matches;
}
function guideLinks(data, question, esc) {
  const matches = guidesFor(data, question);
  return matches.length ? `<ul class="cs-guides">${matches.map(topic => `<li><a href="${esc(link(topicMode(topic), { topic: topic.id, sub: 0 }))}">${esc(topic.title)}</a></li>`).join('')}</ul>` : '<p class="cs-muted">No individual topic guide is linked yet.</p>';
}

function questionPage(data, state, question, esc) {
  const units = new Map((data.units || []).map(unit => [unit.id, unit]));
  const courses = new Map((data.courses || []).map(course => [course.id, course]));
  const points = (question.touchpoints || []).map(point => ({ ...point, unit: units.get(point.unitId), course: courses.get(point.courseId) })).filter(point => point.unit);
  const touch = points.length ? `<ol class="cs-touch">${points.map(point => `<li><span class="cs-kicker cs-kicker--small">${esc(STAGES[point.stage] || point.stage || '')}</span><a href="/course?unit=${encodeURIComponent(point.unit.id)}">${esc(point.unit.title)}</a><span class="cs-muted">${esc(point.course?.title || '')}</span></li>`).join('')}</ol>` : '<p class="cs-muted">No Learning Path touchpoints are authored yet.</p>';
  const studied = withModules(data, points.slice(0, 3).map(point => point.unit));
  const lead = guidesFor(data, question).find(topic => (topic.refs || []).length) || null;
  const differ = lead ? (lead.sections || []).map(sectionPair).find(([title]) => /differ|disagree/i.test(title || '')) : null;
  const passages = lead ? `<section class="cs-card cs-panel"><span class="cs-caption cs-caption--label">Key passages</span>${refList(lead.refs.slice(0, 3), esc)}</section>` : '';
  const views = differ ? `<section class="cs-card cs-panel"><span class="cs-caption cs-caption--label">${esc(differ[0])}</span><p class="cs-phone-prose">${esc(differ[1])}</p></section>` : '';
  const acc = (title, body, open = false) => `<details class="cs-acc"${open ? ' open' : ''}><summary><span class="cs-grow">${esc(title)}</span>${ICONS.down}</summary><div class="cs-acc__body">${body}</div></details>`;
  const phoneBody = `<div class="cs-subacc">${acc('Follow it through the Learning Path', touch, true)}${lead ? acc('Key passages', refList(lead.refs.slice(0, 3), esc)) : ''}${differ ? acc(differ[0], `<p>${esc(differ[1])}</p>`) : ''}${acc('Related topic guides', guideLinks(data, question, esc))}</div>${askCard(question.title, esc)}`;
  return `<section class="cs-column" aria-label="${esc(question.title)}" data-topics-screen>
      <div class="topics-phone-head">${heading('questions', esc, '', true)}${searchBox(state, esc)}${picker(data, state, esc)}</div>
      <a class="cs-backlink" href="${esc(link('questions'))}">${ICONS.left}<span>Back to questions</span></a>
      <div class="cs-heading"><span class="cs-kicker">Question · reference material</span><h1>${esc(question.title)}</h1></div>
      <p class="cs-lede">${esc(question.question || summary(question))}</p>
      <div class="topics-phone-only">${phoneBody}</div>
      <section class="cs-card cs-panel topics-desktop-only"><span class="cs-caption cs-caption--label">Follow it through the Learning Path</span><p class="cs-phone-prose">These touchpoints revisit the question as the course introduces context, evidence, interpretation, and synthesis. Study Topics stay outside course completion.</p>${touch}</section>
      <section class="cs-card cs-panel topics-desktop-only"><span class="cs-caption cs-caption--label">Related topic guides</span>${guideLinks(data, question, esc)}</section>
    </section>
    <aside class="cs-stack topics-desktop-only" aria-label="About this question">${passages}${views}${studiedCard(studied, esc)}${askCard(question.title, esc)}</aside>`;
}

function glossaryCards(data, state, esc) {
  const needle = state.query.toLowerCase();
  const terms = (data.glossary || []).filter(term => !needle || `${term.term} ${term.quick} ${(term.definitions || []).join(' ')}`.toLowerCase().includes(needle));
  return `<div class="topics-glossary" aria-label="Glossary terms">${terms.map(term => `<article class="cs-topic topics-glossary__card" id="${esc(term.id || term.term)}"><span class="cs-topic__title">${esc(term.term)}</span><span class="cs-topic__text">${esc(term.quick || term.definitions?.[0] || '')}</span>${term.definitions?.length > 1 ? `<details><summary>Go deeper</summary>${term.definitions.slice(1).map(definition => `<p>${esc(definition)}</p>`).join('')}</details>` : ''}</article>`).join('') || '<p class="cs-muted">No glossary terms match that search.</p>'}</div><span class="cs-result-count" aria-live="polite">Showing ${terms.length} of ${(data.glossary || []).length} terms</span>`;
}

/** The phone's body for a curated topic: a topic drop-down, the overview, and the sub topics as accordions. */
function phoneItem(data, state, esc) {
  const topic = state.selected;
  if (!topic) return '';
  const subs = (topic.sections || []).map(sectionPair);
  const others = state.list.filter(item => item.id !== topic.id);
  const units = withModules(data, relatedUnits(data, topic)).slice(0, 3);
  return `<label class="cs-topicpick"><span class="cs-topicpick__text"><span class="cs-kicker cs-kicker--small">Topic</span><span class="cs-topicpick__title">${esc(topic.title)}</span></span>${ICONS.down}<select aria-label="Choose a topic" data-topics-select>${state.list.map(item => `<option value="${esc(link(topicMode(item), { topic: item.id, sub: 0 }))}"${item.id === topic.id ? ' selected' : ''}>${esc(item.title)}</option>`).join('')}</select></label>
    <p class="cs-phone-prose">${esc(summary(topic))}</p>
    ${subs.length ? `<span class="cs-caption cs-caption--label">Sub topics</span><div class="cs-subacc">${subs.map(([title, text], n) => `<details class="cs-acc" name="subtopic"${state.subGiven && n === Math.min(state.sub, subs.length - 1) ? ' open' : ''}><summary><span class="cs-sublist__num">${n + 1}</span><span class="cs-grow">${esc(title)}</span>${ICONS.down}</summary><div class="cs-acc__body"><p>${esc(text)}</p><span class="cs-caption cs-caption--label">Sources</span>${refList(topic.refs || [], esc)}</div></details>`).join('')}</div>` : `<span class="cs-caption cs-caption--label">Sources</span>${refList(topic.refs || [], esc)}`}
    ${others.length ? `<details class="cs-acc cs-morefq"><summary><span class="cs-grow">Other topics in ${esc(groupFor(state.mode)[1])}</span><span class="cs-count">${others.length}</span>${ICONS.down}</summary><div class="cs-acc__body">${others.map(item => `<a class="cs-morefq__item" href="${esc(link(topicMode(item), { topic: item.id, sub: 0 }))}"><span class="cs-morefq__title">${esc(item.title)}</span></a>`).join('')}</div></details>` : ''}
    ${studiedCard(units, esc)}${askCard(topic.title, esc)}`;
}

function notesSheet() {
  return `${renderEdgeTab({ type: 'notes', targetId: 'topics-notes-sheet', className: 'topics-notes-tab' })}
    <dialog class="topics-sheet" id="topics-notes-sheet" aria-label="My Notes"><header><h2>My Notes</h2><button type="button" class="topics-sheet-close" data-dialog-close aria-label="Close">×</button></header><div class="topics-sheet-body"><section class="study-notes" data-notes-mount aria-label="My Notes"></section></div></dialog>`;
}

function render(data, state, esc) {
  const phoneBody = state.mode === 'glossary' || state.mode === 'questions' || state.searching ? '' : phoneItem(data, state, esc);
  if (state.open) return `${rail(data, state, esc)}${questionPage(data, state, state.open, esc)}${notesSheet()}`;
  if (state.mode === 'glossary') {
    return `${rail(data, state, esc)}<section class="cs-column cs-column--wide" aria-label="Glossary" data-topics-screen>${heading('glossary', esc)}${searchBox(state, esc)}${picker(data, state, esc)}${glossaryCards(data, state, esc)}</section>${notesSheet()}`;
  }
  if (state.mode === 'questions' || state.searching) {
    const label = state.searching ? `Results for “${state.query}”` : '';
    return `${rail(data, state, esc)}<section class="cs-column cs-column--wide" aria-label="${esc(label || 'Questions')}" data-topics-screen>${heading(state.mode, esc, label)}${searchBox(state, esc)}${picker(data, state, esc)}${topicCards(state.list, state, esc, state.searching ? 'results' : 'questions')}</section>${notesSheet()}`;
  }
  return `${rail(data, state, esc)}<section class="cs-column" aria-label="${esc(groupFor(state.mode)[1])}" data-topics-screen>${heading(state.mode, esc)}${searchBox(state, esc)}${picker(data, state, esc)}${topicCards(state.list, state, esc, 'topics')}<div class="topics-phone-item">${phoneBody}</div></section>${itemPane(data, state, esc)}${notesSheet()}`;
}

export const handles = () => true;

export async function mount(container, ctx) {
  const { data, params, esc } = ctx;
  const state = resolve(data, params);
  const main = document.querySelector('main#main');
  const wide = state.mode === 'glossary' || state.searching || (state.mode === 'questions' && !state.open);
  const cols = wide ? 'cs-cols--topics-list' : 'cs-cols--topics';
  const restoreFrame = setFrameVariant('well');
  main?.classList.add(cols);
  container.innerHTML = render(data, state, esc);
  renderMounts();
  const go = url => ctx.navigate ? ctx.navigate(url) : window.location.assign(url);
  const onChange = event => {
    const select = event.target.closest?.('[data-topics-select]');
    if (select?.value) go(select.value);
  };
  const onClick = event => {
    const target = event.target;
    if (target.closest?.('[data-edge-tab="notes"]')) { const dialog = container.querySelector('#topics-notes-sheet'); if (dialog && !dialog.open) dialog.showModal(); return; }
    if (target.closest?.('[data-dialog-close]')) { target.closest('dialog')?.close(); return; }
    if (target instanceof HTMLDialogElement && target.open) {
      const box = target.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) target.close();
    }
  };
  container.addEventListener('change', onChange);
  container.addEventListener('click', onClick);
  return () => {
    container.removeEventListener('change', onChange);
    container.removeEventListener('click', onClick);
    main?.classList.remove(cols);
    restoreFrame();
  };
}
