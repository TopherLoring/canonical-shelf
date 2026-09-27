// Notes (owner decision `notes`): built into the Bible side panel, the lesson Study Desk, and the Topic
// panel; never a floating panel. Every note is tied to what it is about: a verse or chapter
// (scripture:<osis>), a lesson, or a topic. Notes can be flagged to bring up with someone in person,
// and all of them are listed, editable, under Your Canonical Shelf (the progress panel).
import { getState, putState } from './db.js';
import { recordMutation } from './sync.js';
import { currentPassage, outlineAnchor, screenLabel } from './screen-context.js';
import { OSIS, parseOsis } from './bible-books.js';
import { LIBRARY_BOOKS } from './library-data.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const bookName = n => LIBRARY_BOOKS.find(b => b.n === n)?.name || `Book ${n}`;
const timers = new WeakMap();

export function scriptureLabel(osis) {
  const a = parseOsis(osis);
  if (!a) return osis;
  return `${bookName(a.book)} ${a.chapter}${a.verseStart ? `:${a.verseStart}${a.verseEnd > a.verseStart ? `–${a.verseEnd}` : ''}` : ''}`;
}

export function noteHref(key) {
  if (key.startsWith('scripture:')) {
    const a = parseOsis(key.slice(10));
    if (!a) return '/bible';
    return `/bible?book=${a.book}&chapter=${a.chapter}${a.verseStart ? `&start=${a.verseStart}${a.verseEnd > a.verseStart ? `&end=${a.verseEnd}` : ''}` : ''}`;
  }
  const [kind, rest = ''] = key.split(':');
  const id = rest.split('#')[0];
  if (kind === 'lesson') return `/course?lesson=${encodeURIComponent(id)}`;
  if (kind === 'unit') return `/course?unit=${encodeURIComponent(id)}`;
  if (kind === 'course') return `/course?course=${encodeURIComponent(id)}`;
  if (kind === 'topic') return `/topics?topic=${encodeURIComponent(id)}`;
  if (kind === 'route') return rest || '/';
  return '/';
}

// The note key for what is on screen now.
export function currentNoteKey() {
  const passage = currentPassage();
  if (passage) return { key: `scripture:${passage.osis}`, label: passage.label, scripture: passage.osis };
  const anchor = outlineAnchor().replace(/#scene-\d+$/, '');
  return { key: anchor, label: screenLabel(), scripture: null };
}

// One-time move of the old floating-Journal entries into anchored notes. Old keys:
// bible:<book>:<chapter>[#v<n>] · bible-book:<book> · lesson:/unit:/course:/mastery:/topic:/route:/orientation:
export function migrateJournal(state) {
  if (state.notesMigratedAt || !state.journal || !Object.keys(state.journal).length) return false;
  const at = new Date().toISOString();
  const notes = { ...(state.notes || {}) };
  for (const [oldKey, value] of Object.entries(state.journal)) {
    const text = typeof value === 'string' ? value : String(value?.text || '');
    if (!text.trim()) continue;
    let key = oldKey, scripture = null;
    let m = oldKey.match(/^bible:(\d+):(\d+)(?:#v(\d+))?$/);
    if (m) { scripture = `${OSIS[Number(m[1]) - 1]}.${m[2]}${m[3] ? `.${m[3]}` : ''}`; key = `scripture:${scripture}`; }
    m = oldKey.match(/^bible-book:(\d+)$/);
    if (m) { scripture = OSIS[Number(m[1]) - 1]; key = `scripture:${scripture}`; }
    const existing = notes[key];
    const merged = existing && String(existing.text || '').trim() ? `${existing.text}\n\n${text}` : text;
    notes[key] = { ...(existing || {}), text: merged, updatedAt: at, label: existing?.label || (scripture ? scriptureLabel(scripture) : key), ...(scripture ? { scripture } : {}) };
  }
  state.notes = notes;
  state.notesMigratedAt = at;
  return true;
}

async function load() {
  const state = await getState();
  if (migrateJournal(state)) {
    recordMutation(state, 'personal-study', { id: 'journal-migration', fields: ['notes'], updatedAt: state.notesMigratedAt }, state.notesMigratedAt);
    await putState(state);
  }
  return state;
}

async function save(key, patch, statusNode) {
  const state = await getState();
  const at = new Date().toISOString();
  state.notes = { ...(state.notes || {}), [key]: { ...(state.notes?.[key] || {}), ...patch, updatedAt: at } };
  recordMutation(state, 'personal-study', { id: key, fields: ['notes'], updatedAt: at }, at);
  await putState(state);
  if (statusNode) statusNode.textContent = `Saved ${new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

const noteText = v => (typeof v === 'string' ? v : String(v?.text || ''));

function relatedNotes(state, key) {
  // Other notes in the same chapter (for Scripture) or the same topic/lesson family.
  const all = Object.entries(state.notes || {}).filter(([k, v]) => k !== key && noteText(v).trim());
  if (key.startsWith('scripture:')) {
    const a = parseOsis(key.slice(10));
    return all.filter(([k]) => { if (!k.startsWith('scripture:')) return false; const b = parseOsis(k.slice(10)); return b && a && b.book === a.book && b.chapter === a.chapter; });
  }
  return [];
}

async function renderMount(mount) {
  const state = await load();
  const { key, label, scripture } = currentNoteKey();
  const note = state.notes?.[key] || {};
  const related = relatedNotes(state, key);
  mount.dataset.noteKey = key;
  mount.innerHTML = `<div class="study-notes__editor">
    <p class="study-notes__anchor">Note on <strong>${esc(label)}</strong></p>
    <label class="sr-only" for="note-${esc(key)}">Your note on ${esc(label)}</label>
    <textarea id="note-${esc(key)}" rows="5" maxlength="12000" data-note-text placeholder="Write what you notice, what you wonder, or what you want to remember.">${esc(noteText(note))}</textarea>
    <label class="study-notes__discuss"><input type="checkbox" data-note-discuss ${note.discussLater ? 'checked' : ''}> Bring this up with someone in person</label>
    <div class="study-notes__row"><small class="study-notes__status" data-note-status role="status" aria-live="polite"></small><button type="button" class="link-button" data-ask="${esc(`About ${label}: `)}">Ask the Theologian about this</button></div>
  </div>
  ${related.length ? `<details class="study-notes__related"><summary>Other notes in this chapter (${related.length})</summary><ul>${related.map(([k, v]) => `<li><a href="${esc(noteHref(k))}">${esc(v.label || scriptureLabel(k.slice(10)))}</a><span>${esc(noteText(v).slice(0, 90))}${noteText(v).length > 90 ? '…' : ''}</span></li>`).join('')}</ul></details>` : ''}
  <button type="button" class="link-button study-notes__all" data-open-my-notes>All my notes</button>`;
  const text = mount.querySelector('[data-note-text]');
  const discuss = mount.querySelector('[data-note-discuss]');
  const status = mount.querySelector('[data-note-status]');
  const base = { label, anchor: key, ...(scripture ? { scripture } : {}) };
  text.addEventListener('input', () => {
    clearTimeout(timers.get(text));
    status.textContent = 'Saving…';
    timers.set(text, setTimeout(() => save(key, { ...base, text: text.value }, status).catch(() => { status.textContent = 'Could not save; your text is still here.'; }), 600));
  });
  discuss.addEventListener('change', () => save(key, { ...base, text: text.value, discussLater: discuss.checked }, status).catch(() => {}));
}

export async function renderMounts() {
  await Promise.all([...document.querySelectorAll('[data-notes-mount]')].map(m => renderMount(m).catch(() => { m.innerHTML = '<p class="meta">Notes are unavailable right now.</p>'; })));
}

// "Your notes" and saved Theologian conversations inside Your Canonical Shelf.
async function renderProfileNotes() {
  const body = document.querySelector('#progress-body');
  if (!body || body.querySelector('[data-my-notes]')) return;
  const state = await load();
  const entries = Object.entries(state.notes || {}).filter(([, v]) => noteText(v).trim()).sort(([, a], [, b]) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  const discuss = entries.filter(([, v]) => v.discussLater);
  const transcripts = Object.entries(state.transcripts || {}).filter(([, t]) => Array.isArray(t.messages) && t.messages.length).sort(([, a], [, b]) => String(b.savedAt || '').localeCompare(String(a.savedAt || '')));
  const item = ([k, v]) => `<li><a href="${esc(noteHref(k))}"><strong>${esc(v.label || k)}</strong></a>${v.discussLater ? ' <span class="study-notes__flag">To discuss</span>' : ''}<p>${esc(noteText(v).slice(0, 220))}${noteText(v).length > 220 ? '…' : ''}</p></li>`;
  const section = document.createElement('section');
  section.className = 'my-notes';
  section.dataset.myNotes = '';
  section.innerHTML = `<h3 id="my-notes-title">Your notes</h3>
    ${discuss.length ? `<h4>To bring up in person (${discuss.length})</h4><ul class="my-notes__list">${discuss.map(item).join('')}</ul>` : ''}
    <h4>All notes (${entries.length})</h4>
    ${entries.length ? `<ul class="my-notes__list">${entries.map(item).join('')}</ul>` : '<p class="meta">Notes you write in the Bible, a lesson, or a Topic appear here. Open any note to edit it where it belongs.</p>'}
    <h3>Saved Theologian conversations</h3>
    ${transcripts.length ? `<ul class="my-notes__list">${transcripts.map(([id, t]) => `<li><strong>${esc(t.title || 'Conversation')}</strong> <small>${esc(new Date(t.savedAt).toLocaleString())}</small><details><summary>Read</summary>${t.messages.map(m => `<p><strong>${m.role === 'user' ? 'You' : 'Theologian'}:</strong> ${esc(m.text)}</p>`).join('')}</details><button type="button" class="link-button" data-delete-transcript="${esc(id)}">Remove</button></li>`).join('')}</ul>` : '<p class="meta">Conversations are kept only on this screen until you start a new chat, unless you save them here from the Theologian menu.</p>'}`;
  body.append(section);
}

document.addEventListener('click', event => {
  if (event.target.closest?.('[data-open-my-notes]')) {
    event.preventDefault();
    const open = document.querySelector('#progress-open');
    if (open && !open.disabled) { open.click(); setTimeout(() => document.querySelector('#my-notes-title')?.scrollIntoView({ block: 'start' }), 60); }
    return;
  }
  const del = event.target.closest?.('[data-delete-transcript]');
  if (del) {
    event.preventDefault();
    (async () => {
      const state = await getState(), at = new Date().toISOString(), id = del.dataset.deleteTranscript;
      state.transcripts = { ...(state.transcripts || {}), [id]: { ...(state.transcripts?.[id] || {}), messages: [], updatedAt: at } };
      recordMutation(state, 'personal-study', { id: `transcript:${id}`, fields: ['transcripts'], updatedAt: at }, at);
      await putState(state);
      document.querySelector('[data-my-notes]')?.remove();
      await renderProfileNotes();
    })().catch(() => {});
    return;
  }
  // Selecting a verse in the reader re-targets the note to that verse.
  if (event.target.closest?.('.reader.scripture .verses p')) setTimeout(() => renderMounts().catch(() => {}), 0);
});
document.addEventListener('canonical-route-rendered', () => renderMounts().catch(() => {}));
document.addEventListener('canonical-progress-rendered', () => renderProfileNotes().catch(() => {}));
renderMounts().catch(() => {});
