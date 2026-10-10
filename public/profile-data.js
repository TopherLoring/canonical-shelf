// Profile > My Study and Privacy & data: reset, export, and erase actions on what is stored on this device.
// Learner state (IndexedDB): completed/attempts/mastery/reviews/reviewSchedule/challengeProgress are Path progress;
// notes, journal, transcripts, and highlights are personal study. Practice and history live in localStorage.
import { getState, updateState, putState, exportState } from './db.js';
import { getPracticeState, resetPracticeState } from './practice-state.js';

const RECENT_KEY = 'canonical-shelf-recent-v1';
const BIBLE_STATE_KEY = 'canonical-shelf-bible-state-v1';
const noteText = v => (typeof v === 'string' ? v : String(v?.text || ''));

export async function resetPathProgress() {
  await updateState(state => {
    state.completed = [];
    state.attempts = {};
    state.mastery = {};
    state.reviews = {};
    state.reviewSchedule = {};
    state.challengeProgress = {};
  });
}

export function resetPracticeProgress() { resetPracticeState(); }
export async function eraseNotes() { await updateState(state => { state.notes = {}; state.journal = {}; state.transcripts = {}; }); }
export async function eraseHighlights() { await updateState(state => { state.highlights = {}; }); }
export function clearHistory() { try { localStorage.removeItem(RECENT_KEY); localStorage.removeItem(BIBLE_STATE_KEY); } catch { /* storage unavailable */ } }

export async function eraseEverythingOnThisDevice() {
  const empty = await getState();
  await putState({ ...empty, completed: [], attempts: {}, mastery: {}, reviews: {}, reviewSchedule: {}, challengeProgress: {}, notes: {}, journal: {}, transcripts: {}, highlights: {} });
  resetPracticeState();
  clearHistory();
}

export function download(name, text, type = 'application/json') {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([text], { type }));
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export async function exportStudy() {
  const state = await getState();
  const notes = Object.entries(state.notes || {}).filter(([, v]) => noteText(v).trim());
  const readable = notes.map(([key, v]) => `${v?.label || key}\n${noteText(v).trim()}`).join('\n\n---\n\n');
  download('canonical-shelf-notes-and-highlights.json', JSON.stringify({ notes: state.notes || {}, journal: state.journal || {}, transcripts: state.transcripts || {}, highlights: state.highlights || {} }, null, 2));
  if (readable) download('canonical-shelf-notes.txt', readable, 'text/plain');
}

export async function exportProgress() {
  const state = await getState();
  download('canonical-shelf-progress-summary.json', JSON.stringify({ path: { completed: state.completed, attempts: state.attempts, mastery: state.mastery, reviews: state.reviews, reviewSchedule: state.reviewSchedule, challengeProgress: state.challengeProgress }, practice: getPracticeState() }, null, 2));
}


export async function exportEverything() {
  download('canonical-shelf-everything.json', JSON.stringify({ learner: JSON.parse(await exportState()), practice: getPracticeState() }, null, 2));
}
