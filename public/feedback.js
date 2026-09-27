// Feedback (owner decision `feedback`): exactly one inline Feedback link per screen opens this panel.
// Every submission carries full screen context. Submissions are not shown back to the learner; replies
// from Canonical Shelf appear as system messages on the Theologian tab (see theologian-chat.js).
import { screenContext } from './screen-context.js';

const panel = document.querySelector('#feedback-panel');
const closeButton = document.querySelector('#feedback-close');
const form = document.querySelector('#feedback-form');
const status = document.querySelector('#feedback-status');
const attached = document.querySelector('#feedback-attached');
const QUEUE_KEY = 'canonical-shelf-feedback-queue-v1';
const ANON_KEY = 'canonical-shelf-feedback-browser-id-v1';
let lastTrigger = null;

const readQueue = () => { try { const v = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } };
const writeQueue = items => { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-50))); } catch {} };
export const feedbackBrowserId = () => { try { return localStorage.getItem(ANON_KEY) || ''; } catch { return ''; } };

function ensureBrowserId() {
  const existing = feedbackBrowserId();
  if (existing) return existing;
  try {
    const random = crypto.randomUUID?.() || `${Date.now().toString(36)}_${Array.from(crypto.getRandomValues(new Uint32Array(4))).map(n => n.toString(36)).join('_')}`;
    const id = `cfb_${random}`;
    localStorage.setItem(ANON_KEY, id);
    return id;
  } catch { return ''; }
}

function headers({ json = false, create = false } = {}) {
  const id = create ? ensureBrowserId() : feedbackBrowserId();
  return { ...(json ? { 'content-type': 'application/json' } : {}), ...(id ? { 'x-canonical-feedback-id': id } : {}) };
}

async function post(payload) {
  const response = await fetch('/api/feedback', { method: 'POST', headers: headers({ json: true, create: true }), body: JSON.stringify(payload) });
  if (!response.ok) {
    let message = 'Feedback could not be sent.';
    try { const body = await response.json(); if (body?.error) message = body.error; } catch {}
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json().catch(() => ({ ok: true }));
}

// Sends feedback; validation errors (4xx) are thrown to the caller, network failures are queued.
export async function sendFeedback(payload) {
  const body = { clientCreatedAt: new Date().toISOString(), route: `${location.pathname}${location.search}`.slice(0, 512), ...payload };
  try { return { sent: true, result: await post(body) }; }
  catch (error) {
    if (error.status && error.status < 500) throw error;
    writeQueue([...readQueue(), body]);
    return { sent: false, queued: true };
  }
}

async function flushQueue() {
  if (!navigator.onLine) return;
  const queue = readQueue();
  if (!queue.length) return;
  const remaining = [];
  for (const item of queue) { try { await post(item); } catch (error) { if (!error.status || error.status >= 500) remaining.push(item); } }
  writeQueue(remaining);
}

// Replies from Canonical Shelf to this browser or account. Only items with a response are returned.
export async function fetchReplies() {
  if (!feedbackBrowserId() && !document.cookie) return [];
  const response = await fetch('/api/feedback', { headers: headers() });
  if (!response.ok) return [];
  const body = await response.json().catch(() => ({}));
  return (Array.isArray(body?.items) ? body.items : []).filter(item => item.reviewerResponse);
}

export function forgetFeedbackLink() { try { localStorage.removeItem(ANON_KEY); } catch {} }

function describeAttachment() {
  const s = screenContext();
  if (attached) attached.textContent = `Attached automatically: ${s.label}${s.scripture ? ` (${s.scripture})` : ''} · ${s.anchor} · ${s.viewport}`;
}

function openPanel(trigger) {
  lastTrigger = trigger || null;
  describeAttachment();
  panel.hidden = false;
  document.querySelectorAll('[data-feedback-open]').forEach(b => b.setAttribute('aria-expanded', 'true'));
  form?.querySelector('select')?.focus({ preventScroll: true });
}

function closePanel() {
  panel.hidden = true;
  document.querySelectorAll('[data-feedback-open]').forEach(b => b.setAttribute('aria-expanded', 'false'));
  if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
}

form?.addEventListener('submit', async event => {
  event.preventDefault();
  const data = new FormData(form);
  const payload = { category: String(data.get('category') || 'other'), message: String(data.get('message') || '').trim(), contact: String(data.get('contact') || '').trim(), context: { kind: 'screen', screen: screenContext() } };
  status.textContent = 'Sending…';
  try {
    const { sent } = await sendFeedback(payload);
    form.reset();
    status.textContent = sent ? 'Thank you. It was sent to Canonical Shelf. If there is a reply, it will appear on the Theologian tab.' : 'You are offline. It was saved on this device and will send automatically.';
  } catch (error) {
    status.textContent = error.message || 'Feedback could not be sent.';
  }
});

document.addEventListener('click', event => {
  const trigger = event.target.closest?.('[data-feedback-open]');
  if (trigger) { event.preventDefault(); openPanel(trigger); return; }
  if (event.target.closest?.('[data-feedback-forget]')) {
    event.preventDefault();
    forgetFeedbackLink();
    if (status) status.textContent = 'This browser is no longer linked to earlier anonymous feedback or its replies.';
  }
});
closeButton?.addEventListener('click', closePanel);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && panel && !panel.hidden) closePanel(); });
window.addEventListener('online', () => { flushQueue().catch(() => {}); });
setTimeout(() => flushQueue().catch(() => {}), 600);
