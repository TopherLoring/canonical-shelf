// Study Topics Screen (Reading Room design system)
// 3-pane topic browse and glossary reference based on StudyTopics.dc.html
// Export standard signatures: mount(container, params) returning cleanup function, plus topicsView(opts).

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const TOPIC_CATEGORIES = Object.freeze([
  { id: 'questions', label: 'Questions', count: 12, description: 'Start with a question, then inspect Scripture, context, and interpretation.' },
  { id: 'theology', label: 'Theology & doctrine', description: 'Belief, doctrine, salvation, Trinity, Church, Spirit, and theological frameworks.' },
  { id: 'life', label: 'Christian life', description: 'Prayer, ethics, worship, relationships, vocation, and discipleship.' },
  { id: 'concepts', label: 'Biblical concepts', description: 'Major biblical ideas and how they connect across Scripture.' },
  { id: 'difficult', label: 'Difficult questions', description: 'Contested texts and questions handled with evidence labels and interpretive limits.' },
  { id: 'glossary', label: 'Glossary', description: 'Quick definitions with deeper lexical and contextual treatment.' }
]);

const TOPIC_FILTER_TESTS = {
  theology: t => /doctrine|theolog|trinity|salvation|atonement|spirit|church|grace/i.test(`${t.title || ''} ${t.kind || ''} ${(t.tags || []).join(' ')}`),
  life: t => /life|practice|prayer|ethic|forgive|relationship|vocation|worship/i.test(`${t.title || ''} ${t.kind || ''} ${(t.tags || []).join(' ')}`),
  concepts: t => /scripture|bible|canon|covenant|kingdom|gospel|prophe|wisdom|temple|sacrifice/i.test(`${t.title || ''} ${t.kind || ''} ${(t.tags || []).join(' ')}`),
  difficult: t => /difficult|suffer|evil|lgbtq|judg|hell|violence|miracle|science|slavery|women/i.test(`${t.title || ''} ${t.kind || ''} ${(t.tags || []).join(' ')}`)
};

function getTopicSummary(topic) {
  return topic?.answer || topic?.summary || topic?.question || '';
}

function getTopicSearchText(t) {
  return [
    t?.title,
    t?.kind,
    getTopicSummary(t),
    ...(t?.aliases || []),
    ...(t?.tags || []),
    ...(t?.refs || []),
    ...(t?.sections || []).flatMap(sec => Array.isArray(sec) ? sec : [String(sec || '')]),
    ...(t?.body || [])
  ].filter(Boolean).join(' ').toLowerCase();
}

function resolveTopicData(catalog) {
  const topics = catalog?.topics || [];
  const questionThreads = catalog?.questionThreads || [];
  const glossary = catalog?.glossary || [];
  const units = catalog?.units || [];
  const courses = catalog?.courses || [];
  return { topics, questionThreads, glossary, units, courses };
}

function findTouchpoints(item, catalog) {
  // If item is a questionThread, it directly carries touchpoints
  if (Array.isArray(item?.touchpoints) && item.touchpoints.length > 0) {
    return item.touchpoints.map(tp => {
      const unit = (catalog?.units || []).find(u => u.id === tp.unitId);
      const course = (catalog?.courses || []).find(c => c.id === tp.courseId || c.id === unit?.courseId);
      return {
        unitId: tp.unitId,
        unitTitle: unit?.title || tp.unitId,
        courseId: tp.courseId,
        courseTitle: course?.title || tp.courseId,
        stage: tp.stage || 'study'
      };
    });
  }

  // Otherwise calculate related curriculum units from topic tags/aliases
  const terms = [...(item?.tags || []), ...(item?.aliases || []), item?.title].filter(Boolean).map(x => String(x).toLowerCase());
  const matched = (catalog?.units || []).map(unit => {
    const score = terms.reduce((acc, term) => acc + (`${unit.title || ''} ${unit.scope || ''}`.toLowerCase().includes(term) ? 1 : 0), 0);
    return { unit, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

  return matched.map(({ unit }) => {
    const course = (catalog?.courses || []).find(c => c.id === unit.courseId);
    return {
      unitId: unit.id,
      unitTitle: unit.title,
      courseId: unit.courseId,
      courseTitle: course?.title || 'Learning Path',
      stage: 'study'
    };
  });
}

export function topicsView({ data = {}, params = new URLSearchParams() } = {}) {
  const catalog = data || window.CANON_CATALOG || {};
  const { topics, questionThreads, glossary, units } = resolveTopicData(catalog);

  const topicId = params.get('topic');
  const modeParam = params.get('mode') || (topicId ? null : 'questions');
  const activeMode = ['questions', 'theology', 'life', 'concepts', 'difficult', 'glossary'].includes(modeParam) ? modeParam : 'questions';
  const query = (params.get('q') || '').trim().toLowerCase();

  // If a specific topic ID is requested, render Topic Detail View
  if (topicId) {
    const activeTopic = topics.find(t => t.id === topicId) || questionThreads.find(q => q.id === topicId);
    if (!activeTopic) {
      return `
      <section class="ui-topics-screen">
        <header class="ui-topics-header">
          <p class="ui-topics-eyebrow">Study Topics</p>
          <h1 class="ui-topics-title">Topic not found</h1>
        </header>
        <p><a href="/topics" class="ui-topics-back">← Back to Study Topics</a></p>
      </section>`;
    }
    return renderTopicDetailLayout({ activeTopic, catalog, query });
  }

  // If glossary mode is active, render Topical Glossary View
  if (activeMode === 'glossary') {
    return renderGlossaryLayout({ glossary, query, catalog });
  }

  // Default: 3-pane topic browse layout
  return renderTopicBrowseLayout({ activeMode, query, catalog, params });
}

function renderLeftRail({ activeMode, topicCounts }) {
  const browseItems = [
    { id: 'questions', label: 'Questions', count: 12 },
    { id: 'theology', label: 'Theology & doctrine', count: topicCounts.theology },
    { id: 'life', label: 'Christian life', count: topicCounts.life },
    { id: 'concepts', label: 'Biblical concepts', count: topicCounts.concepts },
    { id: 'difficult', label: 'Difficult questions', count: topicCounts.difficult }
  ];

  return `
  <nav class="ui-topics-rail" aria-label="Topic groups">
    <div class="ui-topics-rail-group">
      <span class="ui-topics-rail-heading">Browse</span>
      <div class="ui-topics-rail-links">
        ${browseItems.map(item => `
          <a href="/topics?mode=${item.id}"
             class="ui-topics-rail-link ${activeMode === item.id ? 'is-active' : ''}"
             ${activeMode === item.id ? 'aria-current="page"' : ''}
             data-category="${item.id}">
            <span class="ui-topics-rail-label">${esc(item.label)}</span>
            ${item.count !== undefined ? `<span class="ui-topics-rail-count">${item.count}</span>` : ''}
          </a>
        `).join('')}
      </div>
    </div>
    <div class="ui-topics-rail-divider" aria-hidden="true"></div>
    <div class="ui-topics-rail-group">
      <span class="ui-topics-rail-heading">Look up a word</span>
      <div class="ui-topics-rail-links">
        <a href="/topics?mode=glossary"
           class="ui-topics-rail-link ${activeMode === 'glossary' ? 'is-active' : ''}"
           ${activeMode === 'glossary' ? 'aria-current="page"' : ''}
           data-category="glossary">
          <svg class="ui-topics-rail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"></path>
            <path d="M5 17a3 3 0 0 1 3-3h11"></path>
          </svg>
          <span class="ui-topics-rail-label">Glossary</span>
        </a>
      </div>
    </div>
  </nav>`;
}

function renderTopicBrowseLayout({ activeMode, query, catalog, params }) {
  const { topics, questionThreads } = resolveTopicData(catalog);

  const topicCounts = {
    theology: topics.filter(TOPIC_FILTER_TESTS.theology).length,
    life: topics.filter(TOPIC_FILTER_TESTS.life).length,
    concepts: topics.filter(TOPIC_FILTER_TESTS.concepts).length,
    difficult: topics.filter(TOPIC_FILTER_TESTS.difficult).length
  };

  // Filter items based on activeMode and search query
  let items = [];
  if (activeMode === 'questions') {
    items = questionThreads.length > 0 ? questionThreads : topics.slice(0, 12);
  } else if (TOPIC_FILTER_TESTS[activeMode]) {
    items = topics.filter(TOPIC_FILTER_TESTS[activeMode]);
  } else {
    items = topics;
  }

  if (query) {
    items = items.filter(t => getTopicSearchText(t).includes(query));
  }

  // Selected item for right-pane preview (defaults to first item, or specified by preview param)
  const previewId = params.get('preview') || items[0]?.id;
  const selectedItem = items.find(t => t.id === previewId) || items[0] || null;
  const selectedTouchpoints = selectedItem ? findTouchpoints(selectedItem, catalog) : [];

  const categoryMeta = TOPIC_CATEGORIES.find(c => c.id === activeMode) || TOPIC_CATEGORIES[0];

  return `
  <div class="ui-topics-container">
    ${renderLeftRail({ activeMode, topicCounts })}

    <section class="ui-topics-center" aria-label="${esc(categoryMeta.label)}">
      <header class="ui-topics-header">
        <p class="ui-topics-eyebrow">Study Topics</p>
        <h1 class="ui-topics-title">${esc(categoryMeta.label)}</h1>
        <p class="ui-topics-lede">${esc(categoryMeta.description)}</p>
      </header>

      <div class="ui-topics-search-wrap">
        <label class="ui-topics-search-field">
          <svg class="ui-topics-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5"></circle>
            <path d="M15.5 15.5 21 21"></path>
          </svg>
          <input type="search"
                 class="ui-topics-search-input"
                 name="q"
                 value="${esc(query)}"
                 placeholder="Search topics and the glossary"
                 aria-label="Search topics and the glossary"
                 autocomplete="off">
        </label>
      </div>

      <div class="ui-topics-grid" role="list">
        ${items.map(item => {
          const isSelected = selectedItem && item.id === selectedItem.id;
          const summary = getTopicSummary(item);
          // If this is a questionThread, find its primary topic counterpart if available
          const targetTopicId = item.id.startsWith('q.') ? (catalog.topics?.find(t => t.id === item.id.replace('q.', ''))?.id || item.id) : item.id;
          return `
          <a href="/topics?mode=${activeMode}&preview=${encodeURIComponent(item.id)}"
             class="ui-topics-card ${isSelected ? 'is-selected' : ''}"
             data-topic-id="${esc(item.id)}"
             data-target-id="${esc(targetTopicId)}"
             role="listitem"
             ${isSelected ? 'aria-current="true"' : ''}>
            <span class="ui-topics-card-title">${esc(item.title)}</span>
            <span class="ui-topics-card-desc">${esc(summary)}</span>
          </a>`;
        }).join('')}
      </div>

      <div class="ui-topics-count-meta">
        <span>Showing ${items.length} of ${activeMode === 'questions' ? 12 : (topicCounts[activeMode] || items.length)} ${activeMode === 'questions' ? 'questions' : 'topics'}</span>
      </div>
    </section>

    <aside class="ui-topics-aside" aria-label="Selected topic">
      ${selectedItem ? `
      <section class="ui-topics-preview-card" aria-label="Preview details">
        <span class="ui-topics-preview-eyebrow">${activeMode === 'questions' ? 'Question' : 'Topic'}</span>
        <h2 class="ui-topics-preview-title">${esc(selectedItem.title)}</h2>
        <p class="ui-topics-preview-desc">${esc(getTopicSummary(selectedItem))}</p>
        <a href="/topics?topic=${encodeURIComponent(selectedItem.id)}" class="ui-topics-open-button">Open topic</a>
      </section>

      ${selectedTouchpoints.length > 0 ? `
      <section class="ui-topics-touchpoints-card" aria-label="Studied in the Learning Path">
        <span class="ui-topics-preview-eyebrow">Studied in the Learning Path</span>
        <div class="ui-topics-touchpoints-list">
          ${selectedTouchpoints.map(tp => `
            <a href="/course?unit=${encodeURIComponent(tp.unitId)}" class="ui-topics-touchpoint-link">
              <span class="ui-topics-touchpoint-sub">${esc(tp.courseTitle)}</span>
              <span class="ui-topics-touchpoint-unit">${esc(tp.unitTitle)}</span>
            </a>
          `).join('')}
        </div>
      </section>` : ''}
      ` : `
      <section class="ui-topics-preview-card">
        <p class="ui-topics-preview-desc">Select a topic or question to preview details and curriculum connections.</p>
      </section>
      `}
      <section class="study-notes" data-notes-mount aria-label="My Notes"></section>
    </aside>
  </div>`;
}

function renderGlossaryLayout({ glossary, query, catalog }) {
  const filtered = query
    ? glossary.filter(term => `${term.term} ${term.quick} ${(term.definitions || []).join(' ')}`.toLowerCase().includes(query))
    : glossary;

  const topicCounts = {
    theology: (catalog?.topics || []).filter(TOPIC_FILTER_TESTS.theology).length,
    life: (catalog?.topics || []).filter(TOPIC_FILTER_TESTS.life).length,
    concepts: (catalog?.topics || []).filter(TOPIC_FILTER_TESTS.concepts).length,
    difficult: (catalog?.topics || []).filter(TOPIC_FILTER_TESTS.difficult).length
  };

  return `
  <div class="ui-topics-container">
    ${renderLeftRail({ activeMode: 'glossary', topicCounts })}

    <section class="ui-topics-center ui-topics-center--wide" aria-label="Topical Glossary">
      <header class="ui-topics-header">
        <p class="ui-topics-eyebrow">Study Topics</p>
        <h1 class="ui-topics-title">Glossary</h1>
        <p class="ui-topics-lede">Quick definitions that keep you moving, with deeper language and context when you want it.</p>
      </header>

      <div class="ui-topics-search-wrap">
        <label class="ui-topics-search-field">
          <svg class="ui-topics-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5"></circle>
            <path d="M15.5 15.5 21 21"></path>
          </svg>
          <input type="search"
                 class="ui-topics-search-input"
                 name="q"
                 value="${esc(query)}"
                 placeholder="Search glossary terms…"
                 aria-label="Search glossary terms"
                 autocomplete="off">
        </label>
      </div>

      <div class="ui-topics-glossary-grid" role="list">
        ${filtered.map(term => `
          <article id="${esc(term.id || term.term)}" class="ui-topics-glossary-card" role="listitem">
            <h3 class="ui-topics-glossary-term">${esc(term.term)}</h3>
            <p class="ui-topics-glossary-def">${esc(term.quick || term.definitions?.[0] || '')}</p>
            ${term.definitions?.length > 1 ? `
              <details class="ui-topics-glossary-details">
                <summary>Go deeper</summary>
                <div class="ui-topics-glossary-deep">
                  ${term.definitions.map(d => `<p>${esc(d)}</p>`).join('')}
                </div>
              </details>` : ''}
          </article>
        `).join('')}
      </div>

      <div class="ui-topics-count-meta">
        <span>Showing ${filtered.length} of ${glossary.length} glossary terms</span>
      </div>
    </section>

    <aside class="ui-topics-aside" aria-label="Reference Desk">
      <section class="ui-topics-preview-card" aria-label="Glossary Guidance">
        <span class="ui-topics-preview-eyebrow">Reference Desk</span>
        <h2 class="ui-topics-preview-title">Lexical Guidance</h2>
        <p class="ui-topics-preview-desc">Terms are cross-linked throughout lesson pathways and Scripture reading panes to clarify technical theological language.</p>
      </section>
      <section class="study-notes" data-notes-mount aria-label="My Notes"></section>
    </aside>
  </div>`;
}

function renderTopicDetailLayout({ activeTopic, catalog, query }) {
  const touchpoints = findTouchpoints(activeTopic, catalog);
  const sections = activeTopic.sections || [];
  const refs = activeTopic.refs || [];
  const relatedIds = activeTopic.related || [];
  const relatedTopics = relatedIds.map(rid => (catalog?.topics || []).find(t => t.id === rid)).filter(Boolean);

  return `
  <section class="ui-topics-detail-screen" aria-label="${esc(activeTopic.title)}">
    <div class="ui-topics-detail-nav">
      <a href="/topics" class="ui-topics-back">← All Study Topics</a>
    </div>

    <div class="ui-topics-detail-layout">
      <article class="ui-topics-detail-article">
        <header class="ui-topics-detail-header">
          <p class="ui-topics-eyebrow">${esc(activeTopic.kind || 'Reference')} · not scored</p>
          <h1 class="ui-topics-title">${esc(activeTopic.title)}</h1>
          <p class="ui-topics-detail-lede">${esc(getTopicSummary(activeTopic))}</p>
          <div class="ui-topics-detail-badges">
            <span class="ui-topics-badge">${refs.length} Scripture connection${refs.length === 1 ? '' : 's'}</span>
            <span class="ui-topics-badge">${relatedTopics.length} related topic${relatedTopics.length === 1 ? '' : 's'}</span>
            ${(activeTopic.tags || []).map(tag => `<span class="ui-topics-badge ui-topics-badge--tag">${esc(tag)}</span>`).join('')}
          </div>
        </header>

        ${sections.length > 0 ? `
        <div class="ui-topics-sections-list">
          ${sections.map((sec, idx) => {
            const [heading, body] = Array.isArray(sec) ? sec : [`Section ${idx + 1}`, String(sec || '')];
            return `
            <section class="ui-topics-section-block" aria-label="${esc(heading)}">
              <span class="ui-topics-section-eyebrow">Explanation</span>
              <h2 class="ui-topics-section-heading">${esc(heading)}</h2>
              <p class="ui-topics-section-body">${esc(body)}</p>
            </section>`;
          }).join('')}
        </div>` : ''}

        ${(Array.isArray(activeTopic.body) ? activeTopic.body : []).map(b => `
          <p class="ui-topics-body-extra">${esc(b)}</p>
        `).join('')}

        <div class="ui-topics-detail-actions">
          <button type="button" class="ui-topics-action-btn ui-topics-action-btn--primary" data-ask="${esc(activeTopic.title)}">
            Ask the Theologian about this
          </button>
          <a href="/search?q=${encodeURIComponent(activeTopic.title)}" class="ui-topics-action-btn">
            Search all connections
          </a>
        </div>
      </article>

      <aside class="ui-topics-detail-aside" aria-label="Reference Desk">
        ${refs.length > 0 ? `
        <section class="ui-topics-preview-card" aria-label="Scripture connections">
          <span class="ui-topics-preview-eyebrow">Scripture connections</span>
          <div class="ui-topics-touchpoints-list">
            ${refs.map(ref => `
              <a href="/search?q=${encodeURIComponent(ref)}" class="ui-topics-touchpoint-link">
                <span class="ui-topics-touchpoint-unit">${esc(ref)}</span>
                <span class="ui-topics-touchpoint-sub">Open passage context →</span>
              </a>
            `).join('')}
          </div>
        </section>` : ''}

        ${touchpoints.length > 0 ? `
        <section class="ui-topics-touchpoints-card" aria-label="Studied in the Learning Path">
          <span class="ui-topics-preview-eyebrow">Studied in the Learning Path</span>
          <div class="ui-topics-touchpoints-list">
            ${touchpoints.map(tp => `
              <a href="/course?unit=${encodeURIComponent(tp.unitId)}" class="ui-topics-touchpoint-link">
                <span class="ui-topics-touchpoint-sub">${esc(tp.courseTitle)}</span>
                <span class="ui-topics-touchpoint-unit">${esc(tp.unitTitle)}</span>
              </a>
            `).join('')}
          </div>
        </section>` : ''}

        ${relatedTopics.length > 0 ? `
        <section class="ui-topics-preview-card" aria-label="Related exploration">
          <span class="ui-topics-preview-eyebrow">Related exploration</span>
          <div class="ui-topics-touchpoints-list">
            ${relatedTopics.map(rel => `
              <a href="/topics?topic=${encodeURIComponent(rel.id)}" class="ui-topics-touchpoint-link">
                <span class="ui-topics-touchpoint-unit">${esc(rel.title)}</span>
              </a>
            `).join('')}
          </div>
        </section>` : ''}

        <section class="study-notes" data-notes-mount aria-label="My Notes"></section>
      </aside>
    </div>
  </section>`;
}

export function mount(container, optionsOrParams = {}) {
  let params;
  if (optionsOrParams instanceof URLSearchParams) {
    params = optionsOrParams;
  } else if (optionsOrParams?.params instanceof URLSearchParams) {
    params = optionsOrParams.params;
  } else if (typeof optionsOrParams?.params === 'object') {
    params = new URLSearchParams(optionsOrParams.params);
  } else if (typeof optionsOrParams === 'object' && !optionsOrParams.data) {
    params = new URLSearchParams(optionsOrParams);
  } else {
    params = new URLSearchParams(location.search);
  }

  const catalog = optionsOrParams.data || window.CANON_CATALOG || {};

  function renderCurrent() {
    container.innerHTML = topicsView({ data: catalog, params });
  }

  renderCurrent();

  // Handle live search typing with debounce
  let searchTimer = null;
  const onInput = (e) => {
    if (e.target && e.target.matches('.ui-topics-search-input')) {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const val = e.target.value.trim();
        if (val) {
          params.set('q', val);
        } else {
          params.delete('q');
        }
        renderCurrent();
        const input = container.querySelector('.ui-topics-search-input');
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }, 180);
    }
  };

  // Handle clicking topic card in grid to select/preview without full navigation
  const onClick = (e) => {
    const card = e.target.closest('.ui-topics-card');
    if (card && !e.metaKey && !e.ctrlKey) {
      const topicId = card.dataset.topicId;
      if (topicId) {
        e.preventDefault();
        params.set('preview', topicId);
        renderCurrent();
      }
    }

    const askBtn = e.target.closest('[data-ask]');
    if (askBtn) {
      const askQuery = askBtn.dataset.ask;
      const guideInput = document.querySelector('#guide-q');
      const guideOpen = document.querySelector('#guide-open');
      if (guideOpen && guideInput) {
        guideOpen.click();
        guideInput.value = `Tell me about: ${askQuery}`;
        guideInput.focus();
      }
    }
  };

  container.addEventListener('input', onInput);
  container.addEventListener('click', onClick);

  return function cleanup() {
    clearTimeout(searchTimer);
    container.removeEventListener('input', onInput);
    container.removeEventListener('click', onClick);
  };
}
