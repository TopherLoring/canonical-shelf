// NotesPanel Component (Reading Room design system)
// "My notes on..." container with note list, editor, and save button.

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let notesCounter = 0;

export function renderNotesPanel({
  target = 'Genesis 1:2',
  notes = [], // Array of string or { id, text }
  onSave = null,
  id = '',
  className = ''
} = {}) {
  const uid = id || `ui-notes-panel-${++notesCounter}`;
  const textareaId = `${uid}-textarea`;
  const title = target ? `My notes on ${target}` : 'My Notes';

  const notesListHtml = notes.map(n => {
    const text = typeof n === 'string' ? n : n.text;
    return `<p class="ui-notes-item">${esc(text)}</p>`;
  }).join('');

  return `
  <section class="ui-notes-panel ${esc(className)}" id="${esc(uid)}" aria-label="${esc(title)}">
    <div class="ui-notes-header">
      <h2 class="ui-notes-title">${esc(title)}</h2>
    </div>
    ${notesListHtml}
    <label for="${esc(textareaId)}" class="sr-only">Add a note</label>
    <textarea id="${esc(textareaId)}" class="ui-notes-textarea" placeholder="Add a note to ${esc(target)}"></textarea>
    <div class="ui-notes-actions">
      <button type="button" class="ui-notes-save-btn" data-notes-save>Save note</button>
    </div>
  </section>`;
}

