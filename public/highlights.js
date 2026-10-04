// Verse highlights (VerseActions in the Bible reader). Stored on the learner state next to notes, keyed by the
// verse's OSIS address ("Gen.1.2"), and synced the same way: each entry carries updatedAt so the newer change wins
// across devices, and removing a highlight keeps a dated entry with color null so the removal syncs too.
import { getState, putState } from './db.js';
import { recordMutation } from './sync.js';

export const HIGHLIGHT_COLORS = Object.freeze(['yellow', 'green', 'blue', 'rose']);

// Highlights in one chapter: { verseNumber: color }.
export async function chapterHighlights(osisBook, chapter) {
  const state = await getState();
  const prefix = `${osisBook}.${chapter}.`;
  const out = {};
  for (const [key, value] of Object.entries(state.highlights || {})) {
    if (!key.startsWith(prefix) || !value?.color) continue;
    const verse = Number(key.slice(prefix.length));
    if (verse) out[verse] = value.color;
  }
  return out;
}

// Set (or clear, with color null) the highlight on one verse. Returns the saved color.
export async function setHighlight(osis, color, label = '') {
  if (color !== null && !HIGHLIGHT_COLORS.includes(color)) throw new Error(`Unknown highlight color: ${color}`);
  const state = await getState();
  const at = new Date().toISOString();
  state.highlights = { ...(state.highlights || {}), [osis]: { color, updatedAt: at, ...(label ? { label } : {}) } };
  recordMutation(state, 'personal-study', { id: `highlight:${osis}`, fields: ['highlights'], updatedAt: at }, at);
  await putState(state);
  return color;
}
