// Usage tracking: every meaningful action (sign-in, message, photo, report,
// download) and every Claude call (tokens + estimated cost) is appended to
// DATA_DIR/usage.jsonl with the user who did it.
import { AsyncLocalStorage } from 'node:async_hooks';
import { appendLine, readLines } from './store.js';

// Carries the signed-in user through async work so AI token usage is attributed.
export const requestContext = new AsyncLocalStorage();
export const currentUserId = () => requestContext.getStore()?.userId || null;

// US$ per million tokens (input, output). Used only for estimates.
const PRICES = {
  'claude-opus-5-5': [4, 20],
  'claude-sonnet-5-5': [2, 10],
  'claude-haiku-5-5': [0.1, 0.5],
  'claude-fable-5-1': [10, 50],
};
export const estimateCost = (model, inTok, outTok) => {
  const [pi, po] = PRICES[model] || PRICES['claude-opus-5-5'];
  return (inTok * pi + outTok * po) / 1e6;
};

export function track(type, data = {}, userId = currentUserId()) {
  try {
    appendLine('usage.jsonl', { t: new Date().toISOString(), type, userId, ...data });
  } catch (err) {
    console.error('usage log failed:', err.message);
  }
}

export function trackAI(model, usage, purpose) {
  if (!usage) return;
  const inTok = (usage.input_tokens || 0) + (usage.cache_read_input_tokens || 0) + (usage.cache_creation_input_tokens || 0);
  const outTok = usage.output_tokens || 0;
  track('ai', { model, purpose, inTok, outTok, cost: Number(estimateCost(model, inTok, outTok).toFixed(5)) });
}

/** Aggregates for the dashboard. */
export function summarize({ days = 30, users = [] } = {}) {
  const since = Date.now() - days * 864e5;
  const events = readLines('usage.jsonl').filter((e) => Date.parse(e.t) >= since);
  const byUser = new Map();
  const blank = () => ({ logins: 0, messages: 0, photos: 0, reports: 0, updates: 0, downloads: 0, aiCalls: 0, inTok: 0, outTok: 0, cost: 0, lastActive: null });
  const daily = {};
  for (let i = days - 1; i >= 0; i--) daily[new Date(Date.now() - i * 864e5).toISOString().slice(0, 10)] = { reports: 0, messages: 0, cost: 0 };
  const totals = blank();
  for (const e of events) {
    const u = byUser.get(e.userId) || blank();
    const day = daily[e.t.slice(0, 10)];
    for (const target of [u, totals]) {
      if (e.type === 'login') target.logins++;
      if (e.type === 'message') target.messages++;
      if (e.type === 'photo') target.photos += e.count || 1;
      if (e.type === 'report') target.reports++;
      if (e.type === 'update' || e.type === 'rewrite') target.updates++;
      if (e.type === 'download') target.downloads++;
      if (e.type === 'ai') {
        target.aiCalls++;
        target.inTok += e.inTok || 0;
        target.outTok += e.outTok || 0;
        target.cost += e.cost || 0;
      }
      if (!target.lastActive || e.t > target.lastActive) target.lastActive = e.t;
    }
    if (day) {
      if (e.type === 'report') day.reports++;
      if (e.type === 'message') day.messages++;
      if (e.type === 'ai') day.cost += e.cost || 0;
    }
    byUser.set(e.userId, u);
  }
  const nameOf = Object.fromEntries(users.map((u) => [u.id, u]));
  const perUser = [...byUser.entries()].map(([id, s]) => ({ userId: id, name: nameOf[id]?.name || (id ? 'Deleted user' : 'System'), username: nameOf[id]?.username || '', role: nameOf[id]?.role || '', ...s }));
  for (const u of users) if (!byUser.has(u.id)) perUser.push({ userId: u.id, name: u.name, username: u.username, role: u.role, ...blank() });
  perUser.sort((a, b) => b.reports - a.reports || b.messages - a.messages);
  const recent = events.slice(-60).reverse().map((e) => ({ ...e, name: nameOf[e.userId]?.name || (e.userId ? 'Deleted user' : 'System') }));
  return { days, totals, perUser, daily: Object.entries(daily).map(([date, v]) => ({ date, ...v })), recent };
}
