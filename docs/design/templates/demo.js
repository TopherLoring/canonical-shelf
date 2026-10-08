// Mounts one template screen. The layout follows the shape of the space the app is given, not the device:
// phone layout when the app is narrower than 761 units or taller than 5:4; desktop otherwise. CSS does the scaling.
import { screens, books, bookDock, ctx } from './examples.js';
import { icons as i } from './icons.js';

const params = new URLSearchParams(location.search);
const key = Object.hasOwn(screens, params.get('screen')) ? params.get('screen') : 'shelf';
const screen = screens[key];
const current = screen.current || key;
const chrome = params.get('chrome') !== '0';
const dockShell = params.get('shell') === 'dock';   // the phone's dock format: top bar with search and menu, five labelled tabs; My Notes and Theologian stay on the right edge
// Screen state: the page a screen is on (view) and what is selected. Links with data-go="key=value;key=value" change it.
let view = params.get('view') || '';
const st = { cat: Number(params.get('cat')) || 0, topic: params.has('topic') ? Number(params.get('topic')) : 1, sub: Number(params.get('sub')) || 0, lesson: Number(params.get('lesson')) || 0, unit: params.has('unit') ? Number(params.get('unit')) : 1, sheet: params.get('sheet') || '', sopen: params.has('sopen') ? Number(params.get('sopen')) : -1, lopen: params.has('lopen') ? Number(params.get('lopen')) : -1, mod: Number(params.get('mod')) || 0, open: params.has('open') ? Number(params.get('open')) : 1 };
let dockBook = 0;

const NAV = [
  ['shelf', 'Shelf', 'Shelf'],
  ['path', 'Learning Path', 'Path'],
  ['reader', 'Bible', 'Bible'],
  ['topics', 'Study Topics', 'Topics'],
  ['practice', 'Review & Practice', 'Review']
];
const ICON = { shelf: i.shelf, path: i.path, reader: i.bible, topics: i.topics, practice: i.review };
const cur = id => (id === current ? ' aria-current="page"' : '');

const topBar = phone => `<header class="cs-top">
  <a class="cs-brand" href="?screen=shelf" aria-label="The Canonical Shelf, home">${i.logo}${key === 'shelf' && !phone ? '' : '<span class="cs-wordmark">The Canonical <em>Shelf</em></span>'}</a>
  ${phone ? '' : `<nav class="cs-nav" aria-label="Primary">${NAV.map(([id, label]) => `<a href="?screen=${id}"${cur(id)}>${label}</a>`).join('')}</nav>`}
  <button type="button" class="cs-icon-button cs-top__search" aria-label="Search">${i.search}</button>
  ${phone ? '' : '<button type="button" class="cs-feedback">Feedback</button>'}
  <a class="cs-icon-button cs-top__profile" href="#" aria-label="Profile">${i.profile}</a>
</header>`;

const tabBar = `<nav class="cs-tabbar" aria-label="Primary">${NAV.map(([id, label, short]) => `<a href="?screen=${id}" aria-label="${label}"${cur(id)}>${ICON[id]}<span>${short}</span></a>`).join('')}<button type="button" class="cs-tabbar__extra" aria-label="Search">${i.search}<span>Search</span></button><a href="#" aria-label="Profile and feedback">${i.profile}<span>You</span></a></nav>`;

const topBarDock = `<header class="cs-top cs-top--dock"><a class="cs-brand" href="?screen=shelf" aria-label="The Canonical Shelf, home">${i.logo}<span class="cs-wordmark">The Canonical <em>Shelf</em></span></a><button type="button" class="cs-icon-button cs-top__search" aria-label="Search">${i.search}</button><button type="button" class="cs-icon-button" data-guide="menu" aria-label="Menu: profile, feedback">${i.menu}</button></header>`;
const bottomDock = `<div class="cs-bottom"><nav class="cs-tabbar" aria-label="Primary">${NAV.map(([id, label, short]) => `<a href="?screen=${id}" aria-label="${label}"${cur(id)}>${ICON[id]}<span>${short}</span></a>`).join('')}</nav></div>`;

const statusBar = `<div class="cs-status" aria-hidden="true"><span class="cs-status__time">9:41</span><span class="cs-status__island"></span><span class="cs-status__icons">
  <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"></rect><rect x="5" y="5.5" width="3" height="6.5" rx="1"></rect><rect x="10" y="3" width="3" height="9" rx="1"></rect><rect x="15" y="0" width="3" height="12" rx="1"></rect></svg>
  <svg viewBox="0 0 16 12"><path d="M8 2.6c2.3 0 4.4.9 6 2.4l1.3-1.4A10.6 10.6 0 0 0 8 .6 10.6 10.6 0 0 0 .7 3.6L2 5c1.6-1.5 3.7-2.4 6-2.4Zm0 3.8c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.8 6.8 0 0 0 8 4.4c-1.8 0-3.4.7-4.7 1.9l1.3 1.4c.9-.8 2.1-1.3 3.4-1.3ZM8 12l2.3-2.5A3.2 3.2 0 0 0 8 8.4c-.9 0-1.7.4-2.3 1.1L8 12Z"></path></svg>
  <svg viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"></rect><rect x="2" y="2" width="20" height="9" rx="2.2"></rect><path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" opacity=".45"></path></svg>
</span></div>`;

// My Notes is a tab only in lessons and the reader (Chris, 2026-10-08); the Theologian tab is on every screen.
const edgeTabs = phone => `${phone && (key === 'lesson' || key === 'reader') ? `<button type="button" class="cs-edge cs-edge--notes" data-guide="notes">${i.tab}<span>My Notes</span></button>` : ''}<button type="button" class="cs-edge cs-edge--theologian" data-guide="theologian">${i.tab}<span>Theologian</span></button>`;

const app = document.querySelector('#app');
app.classList.add('cs-app');
app.dataset.screen = key;
document.title = `${key} · Canonical Shelf template`;

let layout = '';
function render(next) {
  if (next === layout) return;
  layout = next;
  const phone = next === 'phone';
  app.dataset.layout = next;
  app.dataset.chrome = phone && chrome ? 'device' : 'none';
  const ds = phone && dockShell;
  ctx.dock = ds;
  app.dataset.shell = ds ? 'dock' : 'std';
  app.dataset.focus = String(!!screen.focus && !ds);
  const cols = typeof screen.cols === 'function' ? screen.cols(view, st) : screen.cols;
  const frameClass = `cs-frame cs-frame--${screen.frame}${cols ? ` cs-cols--${cols}` : ''}${theo.open && !phone ? ' cs-frame--theo' : ''}`;
  app.innerHTML = `<div class="cs-shell">${phone && chrome ? statusBar : ''}${phone ? (ds ? topBarDock : '') : topBar(phone)}<main class="${frameClass}">${phone ? screen.phone(view, st) : screen.desktop(view, st)}</main>${theo.open ? theoPanel() : ''}${phone && screen.overlay ? screen.overlay(st) : ''}${phone ? (ds ? bottomDock : screen.focus ? '<div class="cs-gap"></div>' : tabBar) : ''}${theo.open ? '' : edgeTabs(phone)}${phone && chrome ? '<span class="cs-home" aria-hidden="true"></span>' : ''}<dialog class="cs-dialog"><div class="cs-dialog__body"></div><form method="dialog"><button class="cs-button">Close</button></form></dialog></div>`;
  if (!theo.open) app.querySelectorAll('.cs-selection[popover]').forEach(el => el.showPopover());
  wire();
  const tb = app.querySelector('.cs-theo__body'); if (tb) tb.scrollTop = tb.scrollHeight;
  if (phone && screen.dock) paintDock();
}

// The same rule as the CSS container query: narrower than 761 units, or taller than 5:4, is the phone layout.
const decide = () => {
  const { width, height } = app.getBoundingClientRect();
  return width <= 760 || width / height <= 0.8 ? 'phone' : 'desktop';
};
// Theologian chat (theologian.chat-design.v1): docked in the right column on desktop, a centered card on the phone; everything else is dimmed and a click on the dim closes it; no tab while open.
const theo = { open: params.has('theo') || params.has('ask'), prefill: params.get('ask') || '', cite: params.has('cite') ? Number(params.get('cite')) : -1 };
const CITED = [['Deuteronomy 32:11', 'like an eagle that stirs up its nest, that hovers over its young, spreading out its wings, catching them, bearing them aloft on its pinions.', 'law'], ['Genesis 1:2', 'Now the earth was formless and void, and darkness was over the surface of the deep. And the Spirit of God was hovering over the surface of the waters.', 'law']];
const theoContext = () => key === 'reader' ? 'You’re reading Genesis 1:2' : key === 'lesson' ? 'You’re in A library, not a book' : key === 'topics' ? 'You’re in Study Topics' : key === 'path' ? 'You’re in the Learning Path' : 'You’re on the ' + key[0].toUpperCase() + key.slice(1);
const theoPanel = () => `<div class="cs-theo-dim" data-theo-close></div><section class="cs-theo" role="dialog" aria-label="Theologian"><header class="cs-theo__head"><div class="cs-theo__title"><h2>Theologian</h2><span>${theoContext()}</span></div><button type="button" class="cs-theo__btn cs-theo__btn--text">New chat</button><button type="button" class="cs-theo__btn cs-theo__btn--icon" aria-label="New chat">${i.pen}</button><button type="button" class="cs-theo__btn" aria-label="More">${i.more}</button><button type="button" class="cs-theo__btn" data-theo-close aria-label="Close">${i.close}</button></header><div class="cs-theo__body">${theo.prefill ? '<p class="cs-theo__empty">Your question is loaded in the message box. Nothing is sent until you press send.</p>' : `<p class="cs-theo__user">What does “hovering” mean in Genesis 1:2?</p><p>The Hebrew word here, <em>ruach</em>, can mean “spirit,” “wind,” or “breath,” so translations differ: the BSB reads “the Spirit of God,” while some, like the NRSV, read “a wind from God.”</p><p>The verb “hovering” appears again in Deuteronomy 32:11, of an eagle hovering over its young, which suggests watchful care rather than motion alone.</p><div class="cs-theo__read"><strong>How it has been read</strong><ul><li>Many Jewish interpreters read it as God’s presence, or a divine wind, over the waters.</li><li>Christian tradition commonly reads it as the Holy Spirit, active in creation.</li></ul></div><p>The text itself doesn’t settle which reading is right.</p><div class="cs-theo__cited"><button type="button" class="cs-theo__citedhead" aria-expanded="true">${i.up}<span>Scripture cited · 2</span></button><span class="cs-theo__rate">${i.thumbUp}${i.thumbDown}${i.flag}</span></div><p class="cs-theo__refs">${CITED.map(([r, t, g], n) => `<span data-group="${g}"><button type="button" aria-expanded="${theo.cite === n}" data-cite="${n}">${r}</button></span>${n < CITED.length - 1 ? ', ' : ''}`).join('')}</p>${theo.cite >= 0 ? `<blockquote class="cs-theo__verse" data-group="${CITED[theo.cite][2]}">${CITED[theo.cite][1]}</blockquote>` : ''}<div class="cs-theo__suggest"><span>Suggested</span><button type="button">${i.reply}Compare translations</button><button type="button">${i.reply}Where else is <em>ruach</em> used?</button></div>`}</div><footer class="cs-theo__foot">${theo.prefill || key !== 'reader' ? '' : '<span class="cs-theo__chip" data-group="law"><span class="cs-tag__dot"></span>Genesis 1:2 ×</span>'}<label class="cs-theo__input"><span class="cs-visually-hidden">Message to the Theologian</span><textarea rows="${theo.prefill ? 3 : 1}" placeholder="Write a message…">${theo.prefill}</textarea><button type="button" class="cs-theo__send" aria-label="Send">${i.send}</button></label><small>The Theologian can make mistakes. Check what it says against Scripture.</small></footer></section>`;
new ResizeObserver(() => render(decide())).observe(app);
render(decide());

function show(html) {
  const dialog = app.querySelector('.cs-dialog');
  dialog.querySelector('.cs-dialog__body').innerHTML = html;
  dialog.showModal();
}

// Shelf (phone): tapping a spine selects the book; the dock above the bottom bar shows it with Resume and Details.
function paintDock() {
  const dock = app.querySelector('.cs-dock');
  if (!dock) return;
  dock.innerHTML = bookDock(dockBook);
  app.querySelectorAll('.cs-spine').forEach(x => { const on = x.dataset.book === books[dockBook][1]; x.classList.toggle('is-selected', on); x.setAttribute('aria-pressed', String(on)); });
}

function wire() {
  // data-go links change the screen's page and selection, then redraw (Path: modules, a module, a unit; Topics: browse, a topic).
  app.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', event => {
    event.preventDefault();
    a.dataset.go.split(';').forEach(pair => { const [k, v] = pair.split('='); if (k === 'view') view = v; else if (k === 'sheet') st.sheet = v; else st[k] = Number(v); });
    layout = ''; render(decide());
  }));
  // The module is a drop-down card (phone).
  app.querySelector('[data-type-select]')?.addEventListener('change', event => { const n = Number(event.target.value); if (Number.isNaN(n)) return; st.cat = n; st.topic = 0; st.sub = 0; layout = ''; render(decide()); });
  // Questions load into the Theologian chat, ready to send. The template sends nothing.
  app.querySelectorAll('[data-ask]').forEach(b => b.addEventListener('click', () => { theo.open = true; theo.prefill = b.dataset.ask; render(decide()); app.querySelector('.cs-theo textarea')?.focus(); }));
  app.querySelectorAll('[data-cite]').forEach(b => b.addEventListener('click', () => { const n = Number(b.dataset.cite); theo.cite = theo.cite === n ? -1 : n; render(decide()); }));
  app.querySelectorAll('[data-theo-close]').forEach(b => b.addEventListener('click', () => { theo.open = false; theo.prefill = ''; render(decide()); }));
  app.querySelector('[data-topic-select]')?.addEventListener('change', event => { st.topic = Number(event.target.value); st.sub = 0; layout = ''; render(decide()); });
  app.querySelector('[data-mod-select]')?.addEventListener('change', event => { st.mod = Number(event.target.value); layout = ''; render(decide()); });
  // Collapsible panels (My Notes): open by default, the chevron folds the body away.
  app.querySelectorAll('[data-collapse]').forEach(b => b.addEventListener('click', () => {
    const body = app.querySelector(`[data-collapse-body="${b.dataset.collapse}"]`); if (!body) return;
    body.hidden = !body.hidden; b.setAttribute('aria-expanded', String(!body.hidden));
  }));
  // Footnote letters open and close their note in place.
  app.querySelectorAll('[data-fn-toggle]').forEach(b => b.addEventListener('click', () => {
    const note = app.querySelector(`.cs-fn[data-fn="${b.dataset.fnToggle}"]`); if (!note) return;
    note.hidden = !note.hidden; b.setAttribute('aria-expanded', String(!note.hidden));
  }));
  // Scrollable menu bars: the arrows show which way the bar can scroll, and scroll it.
  app.querySelectorAll('.cs-hscroll').forEach(box => {
    const track = box.querySelector('.cs-hscroll__track'), prev = box.querySelector('.cs-hscroll__arrow--prev'), next = box.querySelector('.cs-hscroll__arrow--next');
    const sync = () => { prev.disabled = track.scrollLeft <= 1; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1; };
    prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.7, behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.7, behavior: 'smooth' }));
    track.addEventListener('scroll', sync, { passive: true }); sync();
  });
  app.querySelectorAll('[data-guide]').forEach(b => b.addEventListener('click', () => b.dataset.guide === 'theologian' ? (theo.open = true, theo.prefill = '', render(decide())) : show(b.dataset.guide === 'notes'
    ? '<h2>My Notes</h2><p>Connect this tab to the app’s notes panel. The template saves nothing.</p>'
    : b.dataset.guide === 'menu' ? '<h2>Menu</h2><p>Profile, appearance, account and Feedback live here. The template opens nothing.</p>'
    : '<h2>Theologian</h2><p>Connect this tab to the app’s Theologian. The template sends nothing.</p>')));
  app.querySelectorAll('.cs-spine').forEach(b => b.addEventListener('click', () => {
    if (layout === 'phone' && screen.dock) { dockBook = books.findIndex(x => x[1] === b.dataset.book); paintDock(); return; }
    app.querySelectorAll('.cs-spine').forEach(x => { x.classList.toggle('is-selected', x === b); x.setAttribute('aria-pressed', String(x === b)); });
  }));
  app.querySelector('#topic-search')?.addEventListener('input', event => {
    const q = event.target.value.trim().toLowerCase();
    let n = 0;
    app.querySelectorAll('.cs-topic').forEach(a => { a.hidden = !!q && !a.textContent.toLowerCase().includes(q); if (!a.hidden) n++; });
    app.querySelector('.cs-result-count').textContent = n ? `Showing ${n} results` : 'Nothing matches. Try another word.';
  });
  app.querySelectorAll('.cs-unit__head').forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!open));
    b.closest('.cs-unit').classList.toggle('is-open', !open);
  }));
}
