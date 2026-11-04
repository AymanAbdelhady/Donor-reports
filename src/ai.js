// The agent's brain.
//  1. chatTurn: a friendly interviewer that pulls report details out of free
//     conversation (typed or dictated) and keeps the brief up to date.
//  2. writeReport: writes the complete report copy in the organisation's voice.
// Without ANTHROPIC_API_KEY, template-based fallbacks keep the tool working.
import Anthropic from '@anthropic-ai/sdk';
import { brand } from './brand.js';
import { BRIEF_FIELDS, ICONS, CHECKLIST } from './schema.js';
import { fallbackChatTurn, fallbackCopy } from './fallbackCopy.js';
import { getSettings, enabledTopics, givingTypes, assistantName } from './settings.js';
import { trackAI } from './usage.js';

const model = () => getSettings().ai.model || process.env.CLAUDE_MODEL || 'claude-opus-5-5';
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

// ---------- API key detection ----------
// Accept the key under any common name, tolerate stray spaces/quotes, and as a
// last resort find any environment value that looks like an Anthropic key.
const KEY_NAMES = ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY', 'ANTHROPIC_KEY', 'CLAUDE_KEY', 'ANTHROPIC_APIKEY', 'ANTHROPIC_API_TOKEN'];
const clean = (v) => String(v || '').trim().replace(/^['"]|['"]$/g, '').trim();
function resolveKey() {
  const env = process.env;
  for (const n of KEY_NAMES) {
    const v = clean(env[n]);
    if (v) return { key: v, source: n };
  }
  // Names with odd spacing/case, e.g. "anthropic_api_key " or "Claude API Key".
  for (const [n, raw] of Object.entries(env)) {
    const norm = n.toUpperCase().replace(/[^A-Z]/g, '');
    if (/(ANTHROPIC|CLAUDE)/.test(norm) && /KEY/.test(norm) && /^sk-ant-/.test(clean(raw))) return { key: clean(raw), source: n };
  }
  for (const [n, raw] of Object.entries(env)) if (/^sk-ant-/.test(clean(raw))) return { key: clean(raw), source: n };
  if (clean(env.ANTHROPIC_AUTH_TOKEN)) return { token: clean(env.ANTHROPIC_AUTH_TOKEN), source: 'ANTHROPIC_AUTH_TOKEN' };
  return null;
}
const ENV_KEY = resolveKey();
const mask = (k) => (k ? `${k.slice(0, 10)}…${k.slice(-4)}` : '');

// A key saved in the admin dashboard takes priority over environment variables.
function activeKey() {
  const dash = clean(getSettings().ai.apiKey);
  if (dash) return { key: dash, source: 'admin dashboard' };
  return ENV_KEY;
}
export const keyInfo = () => {
  const k = activeKey();
  return k ? { source: k.source, key: mask(k.key || k.token), envKey: ENV_KEY ? mask(ENV_KEY.key || ENV_KEY.token) : '' } : { envKey: '' };
};

export const aiEnabled = () => getSettings().ai.enabled !== false && Boolean(activeKey());

let client;
let clientFor = '';
function getClient() {
  const k = activeKey();
  const id = k?.key || k?.token || '';
  if (!client || clientFor !== id) {
    client = k?.key ? new Anthropic({ apiKey: k.key }) : new Anthropic({ authToken: k?.token });
    clientFor = id;
    lastCheck = null;
  }
  return client;
}

function noteFailure(err) {
  console.error('Claude API error:', err?.status || '', err?.message);
  lastCheck = null; // force a fresh check so the UI shows the real reason
}

/** Live check used by /api/status and at startup: is the key present AND accepted? */
let lastCheck = null;
export async function aiStatus({ refresh = false } = {}) {
  if (getSettings().ai.enabled === false) {
    return { ok: false, enabled: false, off: true, problem: `AI writing is switched off in the admin dashboard (AI connection). ${getSettings().studio.assistantName || 'The assistant'} uses simple mode and template wording.` };
  }
  const KEY = activeKey();
  if (!KEY) {
    const related = Object.entries(process.env).filter(([n]) => /anthropic|claude/i.test(n) && /key/i.test(n) && !/^CLAUDE_CODE_/i.test(n));
    const why = related.map(([n, v]) => `${n} is ${clean(v) ? 'set, but its value doesn’t look like an Anthropic API key (it should start with sk-ant-api)' : 'empty'}`);
    return {
      ok: false,
      enabled: false,
      problem: why.length
        ? `${why.join('; ')}. Paste the key in the admin dashboard (AI connection), or fix it in Render → Environment and redeploy.`
        : 'No API key yet. An admin can paste it in the dashboard under AI connection (or set ANTHROPIC_API_KEY in Render).',
    };
  }
  const MODEL = model();
  const base = { enabled: true, source: KEY.source, key: mask(KEY.key || KEY.token), model: MODEL };
  if (KEY.key && /^sk-ant-oat/.test(KEY.key)) {
    return { ...base, ok: false, problem: 'This looks like a Claude subscription (Claude Code / claude.ai) token, not an API key. Create an API key at console.anthropic.com → API Keys (it starts with sk-ant-api).' };
  }
  if (lastCheck && !refresh && lastCheck.key === (KEY.key || KEY.token) && lastCheck.model === MODEL && Date.now() - lastCheck.at < 10 * 60 * 1000) return { ...base, ...lastCheck.result };
  let result;
  try {
    await getClient().models.retrieve(MODEL);
    result = { ok: true };
  } catch (err) {
    const status = err?.status;
    result = {
      ok: false,
      problem:
        status === 401 ? 'The API key was rejected (invalid or revoked). Create a new key at console.anthropic.com and paste it in the dashboard.'
        : status === 403 ? 'The key is valid but not allowed to use this model or workspace. Check the key’s workspace permissions in the Anthropic console.'
        : status === 404 ? `The key works but the model "${MODEL}" isn’t available to this account. Pick another model in the dashboard (AI connection).`
        : status === 402 || /credit|billing/i.test(err?.message || '') ? 'The key works but the account has no credit. Add credit at console.anthropic.com → Billing.'
        : `Could not reach the Claude API (${err?.message || 'unknown error'}).`,
    };
  }
  lastCheck = { at: Date.now(), result, key: KEY.key || KEY.token, model: MODEL };
  return { ...base, ...result };
}

// Arabic writing styles offered in the dashboard (Languages).
export const AR_STYLES = {
  warm: 'Modern Standard Arabic (فصحى معاصرة) that is warm, simple and personal, with short sentences, like a heartfelt letter.',
  formal: 'Formal, eloquent Modern Standard Arabic (فصحى رسمية رصينة) suited to institutional and government donors.',
  gulf: 'Modern Standard Arabic with a light, friendly Gulf touch in greetings and closings only; the body stays in clear فصحى.',
  levant: 'Modern Standard Arabic with a light, friendly Levantine touch in greetings and closings only; the body stays in clear فصحى.',
};

const orgContext = (lang = 'en') => {
  const ar = getSettings().ar || {};
  const base = `You work for ${brand.orgName}${brand.tagline ? ` ("${brand.tagline}")` : ''}${lang === 'ar' && ar.orgName ? `, called "${ar.orgName}" in Arabic` : ''}. About the organisation: ${brand.about || 'a non-profit organisation working with communities.'}
Money is written with the currency symbol "${brand.currency || 'R'}" and spaces as thousands separators, e.g. ${brand.currency || 'R'} 250 000.`;
  if (lang !== 'ar') return `${base}

Tone of voice and writing rules:
${brand.voice.map((v) => `- ${v}`).join('\n')}`;
  return `${base}

LANGUAGE: write in Arabic. Style: ${AR_STYLES[ar.style] || AR_STYLES.warm}
Arabic tone of voice and writing rules (from the organisation):
${(ar.voice || []).map((v) => `- ${v}`).join('\n')}
General values that still apply:
${brand.voice.slice(0, 3).map((v) => `- ${v}`).join('\n')}`;
};

// ---------- JSON-schema helpers ----------
const str = { type: 'string' };
const int = { type: 'integer' };
const bool = { type: 'boolean' };
const arr = (items) => ({ type: 'array', items });
const obj = (properties) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });

async function callClaude({ system, messages, schema, effort = 'medium', maxTokens = 16000, purpose = 'chat' }) {
  const MODEL = model();
  const params = { model: MODEL, max_tokens: maxTokens, system, output_config: { effort, format: { type: 'json_schema', schema } }, messages };
  let response;
  try {
    // Server-side fallback re-runs the request on another model if a safety
    // classifier declines it, so staff never hit a dead end.
    response = await getClient().beta.messages.stream({ ...params, betas: [FALLBACK_BETA], fallbacks: 'default' }).finalMessage();
  } catch (err) {
    if (err instanceof Anthropic.BadRequestError) response = await getClient().messages.stream(params).finalMessage();
    else throw err;
  }
  trackAI(MODEL, response.usage, purpose);
  if (response.stop_reason === 'refusal') throw new Error('The AI declined to process this content. Please rephrase and try again.');
  if (response.stop_reason === 'max_tokens') throw new Error('The AI response was cut off. Please try again.');
  return JSON.parse(response.content.filter((b) => b.type === 'text').map((b) => b.text).join(''));
}

// =====================================================================
// 1. Conversational intake
// =====================================================================
const CHAT_SCHEMA = obj({
  reply: str,
  updates: arr(obj({ field: { type: 'string', enum: Object.keys(BRIEF_FIELDS) }, value: str })),
  add_results: arr(obj({ value: str, label: str })),
  add_budget: arr(obj({ label: str, amount: str })),
  photo_captions: arr(obj({ index: int, caption: str })),
  suggestions: arr(str),
  ready: bool,
});

function chatSystem(lang = 'en') {
  const st = getSettings();
  const name = assistantName(lang);
  const topics = enabledTopics(lang);
  return `${orgContext()}

LANGUAGE: the staff member's screen is in ${lang === 'ar' ? 'Arabic' : 'English'}. Reply in the language of their latest message (Arabic or English); if unclear, use ${lang === 'ar' ? 'Arabic' : 'English'}. "suggestions" and "photo_captions" are in that same language. Store brief values as the staff member gave them (do not translate them).

You are "${name}", the friendly donor-report assistant inside ${brand.orgName}'s report builder. Staff talk to you (often by voice, so expect run-on, unpunctuated dictation) to create a 4-8 page thank-you impact report for a donor. You do NOT write the report here; you gather what's needed and keep the brief updated.

How to behave:
- Warm, upbeat, efficient, like a helpful colleague. Short replies (1-3 sentences), plain text, no markdown, no bullet lists. One question at a time, the most valuable missing thing first.
- Extract EVERYTHING useful from each message into "updates" (field + value), "add_results" (measurable results: value is the number as written, label is what it counts) and "add_budget" (spend lines, amount digits only). Correct earlier values if the user corrects them. Never invent facts.
- Ask about these topics, in this order of priority, using (or closely following) the wording given. Skip topics already answered:
${topics.map((t, i) => `  ${i + 1}. ${t.label}: "${t.question}"${t.builtin ? '' : ' (custom topic: put the answer in updates as field "report.extraInstructions", prefixed with the topic name)'}`).join('\n')}
- When photos arrive, react briefly and kindly to what you see and give each a short caption in "photo_captions" (photo index as given).
- The thank-you letter is signed by ${brand.ceo.name}, ${brand.ceo.title}.
- Staff are busy: never make them feel they must answer everything. After donor + project are known, remind them they can press "Create my report" any time and the report will still be complete.
- The organisation's giving types are: ${givingTypes().join(', ')}. Put the closest one in donor.givingType.
- "suggestions": 2-3 short tap-to-send replies the user is likely to say next (max 6 words each), e.g. "It was a grant", "Skip this", "No photos yet".
- "ready": true once at least the donor and the project are known.${st.agent.extraRules?.trim() ? `\n\nAdditional rules from the organisation:\n${st.agent.extraRules.trim()}` : ''}`;
}

export async function chatTurn({ brief, transcript, message, newPhotos = [], lang = 'en' }) {
  if (!aiEnabled()) return fallbackChatTurn({ brief, transcript, message, newPhotos, lang });
  try {
    return await aiChatTurn({ brief, transcript, message, newPhotos, lang });
  } catch (err) {
    noteFailure(err);
    const out = fallbackChatTurn({ brief, transcript, message, newPhotos, lang });
    return { ...out, reply: `${lang === 'ar' ? '(تعذّر الاتصال بـ Claude الآن، لذا أستخدم الوضع البسيط.)' : '(I couldn’t reach Claude just now, so I’m using my simple mode.)'} ${out.reply}` };
  }
}

async function aiChatTurn({ brief, transcript, message, newPhotos, lang }) {
  const checklist = CHECKLIST.map((c) => `${c.label}: ${c.test(brief, brief._photoCount) ? 'done' : 'missing'}`).join(', ');
  const messages = [];
  // Earlier turns as plain text (alternating roles).
  for (const t of transcript.slice(-24)) {
    const role = t.role === 'agent' ? 'assistant' : 'user';
    if (messages.length && messages.at(-1).role === role) messages.at(-1).content[0].text += `\n\n${t.text}`;
    else messages.push({ role, content: [{ type: 'text', text: t.text }] });
  }
  if (messages[0]?.role === 'assistant') messages.unshift({ role: 'user', content: [{ type: 'text', text: '(Staff member opened the report builder.)' }] });
  const content = [];
  newPhotos.forEach((p) => {
    content.push({ type: 'text', text: `Photo index ${p.index}:` });
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: p.preview } });
  });
  const { _photoCount, ...cleanBrief } = brief;
  content.push({
    type: 'text',
    text: `Current brief (JSON): ${JSON.stringify(cleanBrief)}\nPhotos uploaded so far: ${brief._photoCount || 0}\nChecklist: ${checklist}\n\nStaff member says: ${message || (newPhotos.length ? '(uploaded photos)' : '')}`,
  });
  if (messages.at(-1)?.role === 'user') messages.at(-1).content.push(...content);
  else messages.push({ role: 'user', content });
  return callClaude({ system: chatSystem(lang), messages, schema: CHAT_SCHEMA, effort: 'low', maxTokens: 6000, purpose: 'chat' });
}

// =====================================================================
// 2. Report writing
// =====================================================================
const REPORT_SCHEMA = obj({
  cover: obj({ kicker: str, title: str, highlight: str, subtitle: str }),
  ceoLetter: obj({ salutation: str, paragraphs: arr(str), closing: str }),
  project: obj({ heading: str, lead: str, paragraphs: arr(str), keyFacts: arr(obj({ label: str, value: str })) }),
  impact: obj({
    heading: str,
    intro: str,
    stats: arr(obj({ value: str, label: str })),
    pillars: arr(obj({ icon: { type: 'string', enum: ICONS }, title: str, text: str })),
  }),
  story: obj({ heading: str, paragraphs: arr(str), quote: str, quoteAttribution: str }),
  gallery: obj({ heading: str, intro: str }),
  money: obj({ heading: str, intro: str, supports: arr(obj({ icon: { type: 'string', enum: ICONS }, title: str, text: str })), note: str }),
  ahead: obj({ heading: str, paragraphs: arr(str), bullets: arr(str) }),
  thankYou: obj({ heading: str, message: str, duaArabic: str, duaEnglish: str }),
  images: obj({ coverIndex: int, storyIndex: int, captions: arr(obj({ index: int, caption: str })) }),
  // Arabic reports: the brief's details in Arabic (empty strings for English reports).
  locale: obj({ donorName: str, place: str, period: str, givingType: str, budgetLabels: arr(str) }),
});

export function wordBudget(pages) {
  const big = pages >= 7;
  const mid = pages >= 5;
  return {
    ceoLetter: big ? '170-210 words, 3-4 paragraphs' : mid ? '140-170 words, 3 paragraphs' : '110-140 words, 3 paragraphs',
    project: big ? 'lead 20-30 words + 110-150 words in 2 paragraphs' : 'lead 20-30 words + 70-100 words in 2 paragraphs',
    story: big ? '140-180 words, 3 paragraphs' : mid ? '100-130 words, 2 paragraphs' : '60-80 words, 1-2 paragraphs',
    impactIntro: '20-35 words',
    pillars: 'exactly 3; title max 4 words; text 12-22 words',
    stats: '2-4 stats; value max 9 characters; label max 5 words',
    money: 'intro 20-35 words; exactly 3 "supports" items (title max 4 words, text 10-18 words); note max 22 words',
    ahead: '40-70 words + 2-3 bullets (max 10 words each)',
    thankYou: 'message 30-50 words',
  };
}

const briefText = (brief) => {
  const lines = [];
  const add = (k, v) => {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length) || k.startsWith('_')) return;
    lines.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`);
  };
  for (const part of ['donor', 'project', 'report']) {
    lines.push(`## ${part}`);
    Object.entries(brief[part] || {}).forEach(([k, v]) => add(k, v));
  }
  if (brief.narrative) lines.push(`## Raw conversation notes from staff\n${brief.narrative}`);
  return lines.join('\n');
};

/** The organisation's optional blessing line (dashboard: Report styles) on the thank-you page. */
function withBlessing(copy) {
  const b = getSettings().report.blessing || {};
  copy.thankYou = { ...copy.thankYou, duaArabic: b.enabled && b.text?.trim() ? b.text.trim() : '', duaEnglish: b.enabled && b.text?.trim() ? (b.translation || '').trim() : '' };
  return copy;
}

export async function writeReport(brief, photos = []) {
  if (!aiEnabled()) return withBlessing(fallbackCopy(brief, photos));
  // (fallbackCopy writes Arabic itself when brief.report.language is "ar")
  try {
    return withBlessing(await aiWriteReport(brief, photos));
  } catch (err) {
    noteFailure(err);
    console.error('Claude report writing failed, using template copy:', err?.message);
    return withBlessing(fallbackCopy(brief, photos));
  }
}

async function aiWriteReport(brief, photos) {
  const lang = brief.report?.language === 'ar' ? 'ar' : 'en';
  const ar = getSettings().ar || {};
  const ceoName = lang === 'ar' && ar.ceoName ? ar.ceoName : brand.ceo.name;
  const ceoTitle = lang === 'ar' && ar.ceoTitle ? ar.ceoTitle : brand.ceo.title;
  const closing = lang === 'ar' ? ar.closing || 'مع خالص الشكر والامتنان،' : getSettings().ceo.closing || 'With heartfelt gratitude,';
  const pages = Number(brief.report?.pages || 6);
  const budget = wordBudget(pages);
  const content = [];
  photos.slice(0, 14).forEach((p, i) => {
    content.push({ type: 'text', text: `Photo index ${i}${p.illustrative ? ' (ILLUSTRATIVE library photo, not from this project)' : ' (from this project)'}${p.caption ? `, caption: "${p.caption}"` : ''}:` });
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: p.preview } });
  });
  content.push({
    type: 'text',
    text: `Write the complete copy for a ${pages}-page donor thank-you and impact report${lang === 'ar' ? ', IN ARABIC' : ''}.
${lang === 'ar' ? `
ARABIC REPORT (critical): every printed field is in Arabic, even if the brief below is in English: translate names of programmes, places, budget lines and quotes naturally (keep people's names, transliterated into Arabic script). Use Western digits (1 800, R 120 000). Arabic needs about 10-15% fewer words than the English word budgets below, so pages don't overflow. "locale": give the donor's name, the place, the period and the giving type in Arabic, and "budgetLabels" = the brief's budget lines translated into Arabic in the same order. Captions in Arabic.
` : `"locale": return "" for every text field and [] for budgetLabels.
`}

${briefText(brief)}

COMPLETENESS (critical): every field must be filled with polished, specific-feeling, printable copy, even if the brief is thin. Read the narrative carefully and infer sensibly. Where details are missing, write warm, credible, general copy grounded in the sector, place and giving type (e.g. what clean water means for families; what a school library means for children), phrased honestly ("families like these", "communities in the region").
HONESTY (critical): never fabricate specific numbers, named beneficiaries, quotes or claims. Stats only from supplied figures (you may use the donation amount, a stated duration, counts stated in the narrative). If fewer than two figures exist, return fewer stats: the design falls back to the pillars. Quote must be the supplied quote (lightly cleaned) or "". If no story was supplied, write the story section about the kind of change this work brings, without inventing a named person (quoteAttribution "").

Word budgets (strict, pages are fixed size):
${Object.entries(budget).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Field guidance:
- cover.kicker: 2-4 words, e.g. "Impact report 2026" or "Partnership report 2026". cover.title: max 7 words, emotive and specific (e.g. "Water that changed six villages"). cover.highlight: 1-3 words that will be set in a hand-written marker style on a yellow highlight, usually "Thank you" or the donor's first name. cover.subtitle: max 16 words naming the donor.
- ceoLetter: a personal letter from ${ceoName}, ${ceoTitle} of ${lang === 'ar' && ar.orgName ? ar.orgName : brand.orgName}. Salutation e.g. "Dear Thandi and family," or "Dear friends at Acme,". Open warmly and personally (more formal for companies, trusts and government). Mention the donor's specific gift and what it achieved; ${brief.report?.ceoMessage ? `include these personal points: ${brief.report.ceoMessage};` : ''}${getSettings().ceo.letterPoints?.trim() ? ` the CEO always wants to include: ${getSettings().ceo.letterPoints.trim()};` : ''} end with heartfelt thanks and a look ahead. Do not add religious phrases unless the organisation's extra rules ask for them. closing must be exactly "${closing}". No name in the closing.
- project.keyFacts: 3-5 short facts (Location, Period, Programme, People reached, Your gift) from the brief; use "Ongoing" or sensible general values rather than leaving gaps.
- impact.pillars: three outcome themes with an icon from the enum.
- money.supports: three things the gift pays for, each with an icon. Spending figures are printed separately from the brief; don't repeat them.
- story.heading: short and human, e.g. "Lerato's new chapter" or "Water close to home".
- gallery: heading max 5 words; intro max 25 words.
- ahead: what happens next / sustainability, plus a gentle invitation to keep supporting.
- thankYou.heading: 1-4 words, e.g. "Thank you" or "With gratitude". duaArabic and duaEnglish: always "" (the organisation's own blessing line, if any, is added separately).
- images: coverIndex = the most joyful, dignified photo (prefer project photos if they are good quality); storyIndex = a people-focused one; -1 if none. captions: max 10 words each, no full stop; illustrative photos must NOT be described as this project (caption them generically, e.g. "${brand.shortName || brand.orgName} programmes bring hope to families").
${brief.report?.tone ? `Tone: ${brief.report.tone}.` : ''}
${brief.report?.extraInstructions ? `Extra instructions: ${brief.report.extraInstructions}` : ''}`,
  });
  return callClaude({ purpose: 'report', system: `${orgContext(lang)}\n\nYou are ${brand.orgName}'s senior donor-care writer${lang === 'ar' ? ', and a native Arabic writer' : ''}. You write moving, polished, highly personal donor impact reports that are printed as designed PDFs.`, messages: [{ role: 'user', content }], schema: REPORT_SCHEMA, effort: 'medium', maxTokens: 24000 });
}
