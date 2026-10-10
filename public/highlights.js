// Verse highlights (VerseActions in the Bible reader). Stored on the learner state next to notes, keyed by the
// verse's OSIS address ("Gen.1.2"), and synced the same way: each entry carries updatedAt so the newer change wins
// across devices, and removing a highlight keeps a dated entry with color null so the removal syncs too.
import { getState, updateState } from './db.js';
import { recordMutation } from './sync.js';

export const HIGHLIGHT_COLORS = Object.freeze(['yellow', 'green', 'blue', 'rose']);

// Highlights in one chapter: { verseNumber: color }.
export async function chapterHighlights(osisBook, chapter, { details = false } = {}) {
  const state = await getState();
  const prefix = `${osisBook}.${chapter}.`;
  const out = {};
  for (const [key, value] of Object.entries(state.highlights || {})) {
    if (!key.startsWith(prefix) || !(value?.color || value?.ranges?.length)) continue;
    const verse = Number(key.slice(prefix.length));
    if (verse) out[verse] = details ? value : value.color;
  }
  return out;
}

// Set (or clear, with color null) the highlight on one verse. Returns the saved color.
let pendingSave = Promise.resolve();

export function setHighlight(osis, color, label = '') {
  return setHighlights([{ osis, label }], color);
}

// A selected range is one mutation; serialize successive actions so whole-state
// writes cannot drop highlights saved by another verse or color action.
export function setHighlights(entries, color, { details = false } = {}) {
  const save = pendingSave.then(() => saveHighlights(entries, color, details));
  pendingSave = save.catch(() => {});
  return save;
}

async function saveHighlights(entries, color, details) {
  if (color !== null && !HIGHLIGHT_COLORS.includes(color)) throw new Error(`Unknown highlight color: ${color}`);
  const at = new Date().toISOString();
  const state = await updateState(state => {
    state.highlights = { ...(state.highlights || {}) };
    for (const { osis, label } of entries) {
      const ranges = color ? (state.highlights[osis]?.ranges || []).filter(r => r.underline).map(({ start, end }) => ({ start, end, underline: true })) : [];
      state.highlights[osis] = { color, ranges, updatedAt: at, ...(label ? { label } : {}) };
      recordMutation(state, 'personal-study', { id: `highlight:${osis}`, fields: ['highlights'], updatedAt: at }, at);
    }
  });
  return details ? Object.fromEntries(entries.map(({ osis }) => [osis, state.highlights[osis]])) : color;
}

// Canonical UTF-16 offsets refer to the immutable verse text, excluding numbers
// and footnote badges. Split overlapping marks without changing untouched words.
export function setTextMarks(entries, patch) {
  const save = pendingSave.then(() => saveTextMarks(entries, patch));
  pendingSave = save.catch(() => {});
  return save;
}
async function saveTextMarks(entries, patch) {
  if ('color' in patch && patch.color !== null && !HIGHLIGHT_COLORS.includes(patch.color)) throw new Error('Unknown highlight color');
  const at = new Date().toISOString();
  const state = await updateState(state => {
    state.highlights = { ...(state.highlights || {}) };
    for (const { osis, start, end, length, label } of entries) {
      if (![start, end, length].every(Number.isInteger) || start < 0 || start >= end || end > length) throw new Error('Invalid text selection');
      const old = state.highlights[osis] || {};
      const existing = (old.ranges || []).filter(r => Number.isInteger(r.start) && Number.isInteger(r.end) && r.start >= 0 && r.start < r.end && r.end <= length);
      const bounds = [...new Set([0, length, start, end, ...existing.flatMap(r => [r.start, r.end])])].sort((a, b) => a - b);
      const ranges = [];
      for (let i = 1; i < bounds.length; i++) {
        const a = bounds[i - 1], b = bounds[i];
        const previous = existing.find(r => r.start <= a && r.end >= b);
        let color = previous?.color || old.color || null, underline = Boolean(previous?.underline);
        if (a >= start && b <= end) {
          if ('color' in patch) color = patch.color;
          if ('underline' in patch) underline = patch.underline;
        }
        if (!color && !underline) continue;
        const last = ranges.at(-1);
        if (last && last.end === a && (last.color || null) === color && Boolean(last.underline) === underline) last.end = b;
        else ranges.push({ start: a, end: b, ...(color ? { color } : {}), ...(underline ? { underline: true } : {}) });
      }
      state.highlights[osis] = { color: null, ranges, updatedAt: at, ...(label ? { label } : old.label ? { label: old.label } : {}) };
      recordMutation(state, 'personal-study', { id: `highlight:${osis}`, fields: ['highlights'], updatedAt: at }, at);
    }
  });
  return Object.fromEntries(entries.map(({ osis }) => [osis, state.highlights[osis]]));
}
