// Notes (owner decision `notes`): built into the Bible side panel, the lesson Study Desk, and the Topic
// panel; never a floating panel. Every note is tied to what it is about: a verse or chapter
// (scripture:<osis>), a lesson, or a topic. Notes can be flagged to bring up with someone in person,
// and all of them are listed, editable, under Your Canonical Shelf (the progress panel).
import { getState, putState, updateState } from './db.js';
import { recordMutation } from './sync.js';
import { currentPassage, outlineAnchor, screenLabel, rememberVerse } from './screen-context.js';
import { OSIS, parseOsis } from './bible-books.js';
import { LIBRARY_BOOKS } from './library-data.js';

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const bookName = n => LIBRARY_BOOKS.find(b => b.n === n)?.name || `Book ${n}`;
const timers = new WeakMap();
const readerDrafts = new Map();
let noteWrites = Promise.resolve();
const noteOsis = key => key.slice(10).split('#')[0];

export function scriptureLabel(osis) {
  const a = parseOsis(osis);
  if (!a) return osis;
  return `${bookName(a.book)} ${a.chapter}${a.verseStart ? `:${a.verseStart}${a.verseEnd > a.verseStart ? `–${a.verseEnd}` : ''}` : ''}`;
}

export function noteHref(key) {
  if (key.startsWith('scripture:')) {
    const a = parseOsis(noteOsis(key));
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
    return updateState(latest => {
      if (migrateJournal(latest)) recordMutation(latest, 'personal-study', { id: 'journal-migration', fields: ['notes'], updatedAt: latest.notesMigratedAt }, latest.notesMigratedAt);
    });
  }
  return state;
}

function save(key, patch, statusNode) {
  const write = noteWrites.then(() => saveNow(key, patch, statusNode));
  noteWrites = write.catch(() => {});
  return write;
}
async function saveNow(key, patch, statusNode) {
  const at = new Date().toISOString();
  await updateState(state => {
    const previous = state.notes?.[key];
    state.notes = { ...(state.notes || {}), [key]: { ...(previous && typeof previous === 'object' ? previous : {}), ...patch, updatedAt: at } };
    recordMutation(state, 'personal-study', { id: key, fields: ['notes'], updatedAt: at }, at);
  });
  if (statusNode) statusNode.textContent = `Saved ${new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

const noteText = v => (typeof v === 'string' ? v : String(v?.text || ''));

function relatedNotes(state, key) {
  // Other notes in the same chapter (for Scripture) or the same topic/lesson family.
  const all = Object.entries(state.notes || {}).filter(([k, v]) => k !== key && noteText(v).trim());
  if (key.startsWith('scripture:')) {
    const a = parseOsis(key.slice(10));
    return all.filter(([k]) => { if (!k.startsWith('scripture:')) return false; const b = parseOsis(noteOsis(k)); return b && a && b.book === a.book && b.chapter === a.chapter; });
  }
  return [];
}

async function renderMount(mount) {
  if (mount.closest('[data-reader]')) return renderReaderNotes(mount);
  const state = await load();
  const { key, label, scripture } = currentNoteKey();
  const note = state.notes?.[key] || {};
  const related = relatedNotes(state, key);
  mount.dataset.noteKey = key;
  mount.innerHTML = `<div class="study-notes__editor">
    <p class="study-notes__anchor">Note on <strong>${esc(label)}</strong></p>
    <label class="sr-only" for="note-${esc(key)}">Your note on ${esc(label)}</label>
    <textarea id="note-${esc(key)}" rows="5" maxlength="12000" data-note-text placeholder="Write what you notice, what you wonder, or what you want to remember.">${esc(noteText(note))}</textarea>
    <div class="study-notes__row"><small class="study-notes__status" data-note-status role="status" aria-live="polite"></small></div>
  </div>
  ${related.length ? `<details class="study-notes__related"><summary>Other notes in this chapter (${related.length})</summary><ul>${related.map(([k, v]) => `<li><a href="${esc(noteHref(k))}">${esc(v.label || scriptureLabel(k.slice(10)))}</a><span>${esc(noteText(v).slice(0, 90))}${noteText(v).length > 90 ? '…' : ''}</span></li>`).join('')}</ul></details>` : ''}
  <a class="study-notes__all" href="/profile#notes">All my notes</a>`;
  const text = mount.querySelector('[data-note-text]');
  const status = mount.querySelector('[data-note-status]');
  // The in-person flag and the Ask link are gone (notes.discuss-flag.removed-2026-10-05, ui.bible.ask.notes-link-2026-10-05);
  // a note flagged before then keeps its flag so it stays readable in the profile.
  const base = { label, anchor: key, ...(scripture ? { scripture } : {}), ...(note.discussLater ? { discussLater: true } : {}) };
  text.addEventListener('input', () => {
    clearTimeout(timers.get(text));
    status.textContent = 'Saving…';
    timers.set(text, setTimeout(() => save(key, { ...base, text: text.value }, status).catch(() => { status.textContent = 'Could not save; your text is still here.'; }), 600));
  });
}

// Multiple notes use unique map keys while retaining their stable Scripture anchor.
// Empty text is a dated tombstone so deletion also survives personal-study sync.
async function renderReaderNotes(mount) {
  const state = await load();
  const target = currentNoteKey();
  const chapter = parseOsis(target.scripture);
  const entries = Object.entries(state.notes || {}).filter(([key, value]) => {
    const ref = key.startsWith('scripture:') && parseOsis(noteOsis(key));
    return ref && chapter && ref.book === chapter.book && ref.chapter === chapter.chapter && noteText(value).trim();
  }).sort(([ka, a], [kb, b]) => {
    const va = parseOsis(noteOsis(ka)).verseStart || 0, vb = parseOsis(noteOsis(kb)).verseStart || 0;
    return va - vb || String(a.createdAt || a.updatedAt || '').localeCompare(String(b.createdAt || b.updatedAt || '')) || ka.localeCompare(kb);
  });
  const draft = readerDrafts.get(target.key) || { text: '', editKey: null };
  readerDrafts.set(target.key, draft);
  mount.dataset.noteKey = target.key;
  const pencil = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m16 3 5 5-13 13H3v-5Z"/></svg>';
  const trash = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>';
  mount.innerHTML = `<ol class="reader-note-list" aria-label="Saved notes">${entries.map(([key, value]) => {
    const label = value.label || scriptureLabel(noteOsis(key));
    const at = value.createdAt || value.updatedAt;
    return `<li class="reader-note-item" data-saved-note="${esc(key)}"><div class="reader-note-head"><a href="${esc(noteHref(key))}">${esc(label)}</a>${at ? `<time datetime="${esc(at)}">${esc(new Date(at).toLocaleString())}</time>` : ''}</div><p>${esc(noteText(value))}</p><div class="reader-note-actions"><button type="button" data-edit-note="${esc(key)}" aria-label="Edit note on ${esc(label)}">${pencil}</button><button type="button" data-delete-note="${esc(key)}" aria-label="Delete note on ${esc(label)}">${trash}</button></div></li>`;
  }).join('')}</ol>${entries.length ? '' : '<p class="meta">No notes in this chapter yet.</p>'}
  <form class="study-notes__editor" data-reader-note-form>
    <p class="study-notes__anchor">Note on <strong>${esc(target.label)}</strong></p>
    <label for="reader-note-text" data-reader-note-label>${draft.editKey ? 'Edit note' : `Add a note on ${esc(target.label)}`}</label>
    <textarea id="reader-note-text" rows="8" maxlength="12000" data-note-text placeholder="Write what you notice, what you wonder, or what you want to remember.">${esc(draft.text)}</textarea>
    <div class="reader-note-actions"><small data-note-status role="status" aria-live="polite"></small><button type="button" data-note-cancel ${draft.editKey ? '' : 'hidden'}>Cancel edit</button><button type="submit" data-save-note>${draft.editKey ? 'Save changes' : 'Add a note'}</button></div>
  </form><a class="study-notes__all" href="/profile#notes">All my notes</a>`;
  const input = mount.querySelector('[data-note-text]');
  const status = mount.querySelector('[data-note-status]');
  const form = mount.querySelector('form');
  input.addEventListener('input', () => { draft.text = input.value; });
  mount.querySelector('[data-note-cancel]').addEventListener('click', () => { readerDrafts.delete(target.key); renderReaderNotes(mount); });
  let saving = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (saving || !input.value.trim()) return;
    saving = true;
    const button = mount.querySelector('[data-save-note]');
    button.disabled = true;
    status.textContent = 'Saving…';
    try {
      const key = draft.editKey || `${target.key}#note-${crypto.randomUUID()}`;
      const original = entries.find(([k]) => k === key)?.[1];
      const scripture = draft.editKey ? noteOsis(key) : target.scripture;
      await save(key, { text: input.value, label: original?.label || scriptureLabel(scripture), anchor: original?.anchor || `scripture:${scripture}`, scripture: original?.scripture || scripture, createdAt: original?.createdAt || original?.updatedAt || new Date().toISOString() }, status);
      readerDrafts.delete(target.key);
      await renderReaderNotes(mount);
      mount.querySelector('[data-note-status]').textContent = 'Saved';
    } catch { status.textContent = 'Could not save; your text is still here.'; }
    finally { saving = false; button.disabled = false; }
  });
  mount.querySelectorAll('[data-edit-note]').forEach(button => button.addEventListener('click', () => {
    const [key, value] = entries.find(([key]) => key === button.dataset.editNote);
    draft.editKey = key; draft.text = noteText(value);
    input.value = draft.text;
    mount.querySelector('[data-reader-note-label]').textContent = `Edit note on ${value.label || scriptureLabel(noteOsis(key))}`;
    mount.querySelector('[data-save-note]').textContent = 'Save changes';
    mount.querySelector('[data-note-cancel]').hidden = false;
    input.focus();
  }));
  mount.querySelectorAll('[data-delete-note]').forEach(button => button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await save(button.dataset.deleteNote, { text: '' }, status);
      if (draft.editKey === button.dataset.deleteNote) readerDrafts.delete(target.key);
      await renderReaderNotes(mount);
    } catch { status.textContent = 'Could not delete; your note is still here.'; button.disabled = false; }
  }));
}

export async function renderMounts() {
  await Promise.all([...document.querySelectorAll('[data-notes-mount]')].map(m => renderMount(m).catch(() => { m.innerHTML = '<p class="meta">Notes are unavailable right now.</p>'; })));
}

// "Your notes" and saved Theologian conversations inside Your Canonical Shelf.
async function renderProfileNotes() {
  const body = document.querySelector('[data-profile-notes]');
  if (!body || body.querySelector('[data-my-notes]')) return;
  const state = await load();
  const entries = Object.entries(state.notes || {}).filter(([, v]) => noteText(v).trim()).sort(([, a], [, b]) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  const discuss = entries.filter(([, v]) => v.discussLater);
  const transcripts = Object.entries(state.transcripts || {}).filter(([, t]) => Array.isArray(t.messages) && t.messages.length).sort(([, a], [, b]) => String(b.savedAt || '').localeCompare(String(a.savedAt || '')));
  const item = ([k, v]) => `<li><a href="${esc(noteHref(k))}"><strong>${esc(v.label || k)}</strong></a>${v.discussLater ? ' <span class="study-notes__flag">To discuss</span>' : ''}<p>${esc(noteText(v).slice(0, 220))}${noteText(v).length > 220 ? '…' : ''}</p></li>`;
  const section = document.createElement('section');
  section.className = 'my-notes';
  section.dataset.myNotes = '';
  section.innerHTML = `
    ${discuss.length ? `<h4>To bring up in person (${discuss.length})</h4><ul class="my-notes__list">${discuss.map(item).join('')}</ul>` : ''}
    <h4>All notes (${entries.length})</h4>
    ${entries.length ? `<ul class="my-notes__list">${entries.map(item).join('')}</ul>` : '<p class="meta">Notes you write in the Bible, a lesson, or a Topic appear here. Open any note to edit it where it belongs.</p>'}
    <h3>Saved Theologian conversations</h3>
    ${transcripts.length ? `<ul class="my-notes__list">${transcripts.map(([id, t]) => `<li><strong>${esc(t.title || 'Conversation')}</strong> <small>${esc(new Date(t.savedAt).toLocaleString())}</small><details><summary>Read</summary>${t.messages.map(m => `<p><strong>${m.role === 'user' ? 'You' : 'Theologian'}:</strong> ${esc(m.text)}</p>`).join('')}</details><button type="button" class="link-button" data-delete-transcript="${esc(id)}">Remove</button></li>`).join('')}</ul>` : '<p class="meta">Conversations are kept only on this screen until you start a new chat, unless you save them here from the Theologian menu.</p>'}`;
  body.append(section);
}

document.addEventListener('click', event => {
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
  const verse = event.target.closest?.('.reader.scripture .verses p');
  if (verse) { rememberVerse(verse); setTimeout(() => renderMounts().catch(() => {}), 0); }
});
document.addEventListener('canonical-route-rendered', () => renderMounts().catch(() => {}));
document.addEventListener('canonical-route-rendered', () => { if (document.querySelector('[data-profile-notes]')) renderProfileNotes().catch(() => {}); });
renderMounts().catch(() => {});
if (document.querySelector('[data-profile-notes]')) renderProfileNotes().catch(() => {});
