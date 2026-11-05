// Donor Report Studio: web server.
//  - /login              sign-in (and forced password change)
//  - /                   the Studio (staff + admins)
//  - /admin              the admin dashboard (admins only)
// Each report "session" belongs to the user who created it: the chat
// transcript, the brief, uploaded photos and (once created) the report.
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import rtlcss from 'rtlcss';
import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { brand } from './brand.js';
import { BRIEF_FIELDS, CHECKLIST, emptyBrief } from './schema.js';
import { buildHtml, styleList, getStyle } from './render/index.js';
import { htmlToPdf } from './pdf.js';
import { chatTurn, writeReport, aiEnabled, aiStatus } from './ai.js';
import { pickLibrary, loadLibrary } from './library.js';
import { ROOT, BRAND_DIR, FONT_DIR, ASSETS_DIR, fileResolvers, httpResolvers, brandAssetPath, BASE, P } from './paths.js';
import { THUMBS_DIR, persistentStorage } from './store.js';
import { getSettings, publicSettings, settingsVersion, greetingText, languages, assistantName } from './settings.js';
import { authMiddleware, login, issueCookie, clearCookie, publicUser, changeOwnPassword, ensureBootstrapAdmin, resetAdminFromEnv, BOOTSTRAP_ADMIN, DEMO } from './auth.js';
import { requestContext, track } from './usage.js';
import { validId, dirOf, load, save, remove, listSessions } from './sessions.js';
import { admin } from './admin.js';

const PORT = Number(process.env.PORT || 3000);
// The app itself, mounted at BASE (e.g. /acme) on a small outer server.
const root = express();
root.set('trust proxy', 1);
root.disable('x-powered-by');
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
// "/acme" -> "/acme/" so relative links resolve inside the app.
app.use((req, res, next) => {
  const [p, q] = req.originalUrl.split('?');
  if (BASE && p === BASE) return res.redirect(301, `${BASE}/${q ? `?${q}` : ''}`);
  next();
});
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 12 } });

app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use(authMiddleware);
// The Studio sends its interface language (English or Arabic) with every request.
app.use((req, _res, next) => { req.lang = req.get('X-Lang') === 'ar' && languages().offered.includes('ar') ? 'ar' : 'en'; next(); });
const allowedLang = (l) => (languages().offered.includes(l) ? l : languages().defaultReport);
const T = {
  done: { en: (n, d, st) => `All done! Your ${n}-page report for ${d} is ready in the ${st} style. Download it, edit the wording, change the photos or ask me for a rewrite.`, ar: (n, d, st) => `تمّ! تقريرك المكوّن من ${n} صفحات لـ${d} جاهز بتصميم «${st}». يمكنك تنزيله، أو تعديل النصوص، أو تغيير الصور، أو طلب إعادة صياغة.` },
  photos: { en: (k) => `Added ${k} photo${k === 1 ? '' : 's'}`, ar: (k) => (k === 1 ? 'أضفت صورة واحدة' : `أضفت ${k} صور`) },
  start: { en: ['Paste my notes', 'It was a grant', 'Corporate CSI donor'], ar: ['ألصق ملاحظاتي', 'كانت منحة', 'شركة (مسؤولية اجتماعية)'] },
};
// Attribute everything (incl. AI token usage) to the signed-in user.
app.use((req, _res, next) => requestContext.run({ userId: req.user?.id || null }, next));

// ---------- pages & static files ----------
// HTML pages get <base href="BASE/"> so every relative link, script and API
// call in the front end resolves under the base path (e.g. /acme/api/...).
const pageCache = new Map();
const page = (file) => (_req, res) => {
  let html = pageCache.get(file);
  if (!html) {
    html = readFileSync(path.join(ROOT, 'public', file), 'utf8').replace('<head>', `<head>\n  <base href="${BASE}/">`);
    if (process.env.NODE_ENV === 'production') pageCache.set(file, html);
  }
  res.type('html').set('Cache-Control', 'no-cache').send(html);
};
app.get(['/', '/index.html'], page('index.html'));
// Arabic (right-to-left) versions of the Studio and sign-in stylesheets, mirrored
// automatically from the English ones, with Arabic fonts.
const AR_UI_CSS = `
@font-face{font-family:'Cairo';src:url('fonts/cairo/files/cairo-arabic-700-normal.woff2') format('woff2');font-weight:600 900}
@font-face{font-family:'Tajawal';src:url('fonts/tajawal/files/tajawal-arabic-400-normal.woff2') format('woff2');font-weight:400}
@font-face{font-family:'Tajawal';src:url('fonts/tajawal/files/tajawal-arabic-700-normal.woff2') format('woff2');font-weight:700}
@font-face{font-family:'Aref Ruqaa';src:url('fonts/aref-ruqaa/files/aref-ruqaa-arabic-700-normal.woff2') format('woff2');font-weight:400 700}
:root{--head:'Cairo','Barlow Semi Condensed',sans-serif;--body:'Tajawal','Lato',system-ui,sans-serif}
body,button,input,textarea,select{font-family:'Tajawal','Lato',system-ui,sans-serif}
*{letter-spacing:0 !important}
h1,h2,h3,b,strong,.hl{text-transform:none !important}
.hl{font-family:'Aref Ruqaa','Caveat Brush',cursive !important;line-height:1.6 !important}
`;
const rtlCache = new Map();
app.get(['/app.rtl.css', '/login.rtl.css'], (req, res) => {
  const name = req.path.slice(1).replace('.rtl', '');
  let css = rtlCache.get(name);
  if (!css) {
    css = rtlcss.process(readFileSync(path.join(ROOT, 'public', name), 'utf8')) + AR_UI_CSS;
    if (process.env.NODE_ENV === 'production') rtlCache.set(name, css);
  }
  res.type('css').send(css);
});
app.get(['/login', '/login.html'], page('login.html'));
app.get(['/admin', '/admin.html'], page('admin.html'));
app.use('/brand', express.static(ASSETS_DIR), express.static(BRAND_DIR));
app.use('/styles', express.static(THUMBS_DIR));
app.use(express.static(path.join(ROOT, 'public')));
app.use('/fonts', express.static(FONT_DIR));

// Wrap handlers so both thrown and rejected errors become friendly JSON errors.
const route = (fn) => (req, res) => {
  const fail = (err) => {
    if (!err.status || err.status >= 500) console.error(err);
    if (!res.headersSent) res.status(err.status || 500).json({ error: err.message || 'Something went wrong' });
  };
  try {
    Promise.resolve(fn(req, res)).catch(fail);
  } catch (err) {
    fail(err);
  }
};

// ---------- auth & account ----------
app.post('/api/auth/login', route(async (req, res) => {
  const u = login(req.body.username, req.body.password, req.ip);
  issueCookie(res, req, u);
  requestContext.run({ userId: u.id }, () => track('login'));
  res.json({ user: publicUser(u), mustChange: !!u.mustChange, next: u.mustChange ? null : u.role === 'admin' ? P('/admin') : P('/') });
}));
app.post('/api/auth/logout', (_req, res) => {
  clearCookie(res);
  res.json({ ok: true });
});
app.get('/api/me', (req, res) => res.json({ user: publicUser(req.user) }));
app.post('/api/me/password', route(async (req, res) => {
  const u = changeOwnPassword(req.user.id, String(req.body.current || ''), String(req.body.next || ''));
  issueCookie(res, req, u); // old cookies stop working; keep this browser signed in
  track('password');
  res.json({ ok: true, next: u.role === 'admin' ? P('/admin') : P('/') });
}));

// Branding for the sign-in page (no secrets).
app.get('/api/public-config', (_req, res) => {
  const s = publicSettings();
  // In demo mode the sign-in page shows the demo details so presenters can get straight in.
  res.json({ org: { orgName: s.org.orgName }, signin: { images: s.signin?.images || [], headline: s.signin?.headline || '', local: loadLibrary().slice(0, 6).map((im) => P(`/brand/library/${im.file}`)) }, languages: s.languages, ar: { orgName: s.ar?.orgName }, studio: { title: s.studio.title, assistantName: s.studio.assistantName, assistantNameAr: s.studio.assistantNameAr }, colors: s.colors, logos: s.logos, version: s.version, demo: DEMO ? { username: BOOTSTRAP_ADMIN.username, password: BOOTSTRAP_ADMIN.password } : null });
});

app.use('/api/admin', admin);

// ---------- Studio ----------
const checklist = (s) => CHECKLIST.map((c) => ({ id: c.id, label: c.label, done: !!c.test(s.brief, s.photos.length) }));
// A conversation that hasn't started yet always shows today's greeting, so
// renaming the assistant or editing the greeting shows up immediately.
const liveTranscript = (s) =>
  s.transcript.some((m) => m.role === 'user') ? s.transcript : s.transcript.map((m, i) => (i === 0 && m.role === 'agent' ? { ...m, text: greetingText(s.uiLang) } : m));
const view = (s) => ({
  id: s.id,
  transcript: liveTranscript(s),
  brief: s.brief,
  photos: s.photos.map(({ file, caption }) => ({ file, caption, url: P(`/reports/${s.id}/files/${file}`) })),
  checklist: checklist(s),
  suggestions: s.suggestions || [],
  ready: !!s.brief.donor?.name,
  report: s.report ? reportView(s) : null,
});
const reportView = (s) => ({
  styleId: s.report.styleId,
  language: s.report.language || 'en',
  pages: s.report.pages,
  copy: s.report.copy,
  aiWritten: s.report.aiWritten,
  previewUrl: P(`/reports/${s.id}/preview?v=${Date.parse(s.report.renderedAt || 0)}`),
  pdfUrl: P(`/reports/${s.id}/pdf?v=${Date.parse(s.report.renderedAt || 0)}`),
  rewritesLeft: Math.max(0, getSettings().report.maxRewrites - (s.report.rewrites || 0)),
  images: (s.report.images || []).map((im, i) => ({
    index: i,
    url: P(im.library ? `/brand/library/${im.file}` : `/reports/${s.id}/files/${im.file}`),
    caption: s.report.copy.images?.captions?.find((c) => c.index === i)?.caption || im.caption || '',
    library: !!im.library,
  })),
  coverIndex: s.report.copy.images?.coverIndex ?? 0,
  storyIndex: s.report.copy.images?.storyIndex ?? 1,
});

const forbidden = () => Object.assign(new Error('Not found'), { status: 404 });
// Staff can only open their own reports; admins can open all of them.
async function getSession(req) {
  if (!validId(req.params.id)) throw forbidden();
  let s;
  try {
    s = await load(req.params.id);
  } catch {
    throw forbidden();
  }
  if (req.user.role !== 'admin' && s.ownerId !== req.user.id) throw forbidden();
  return s;
}

function setPath(obj, p, v) {
  const keys = p.split('.');
  let o = obj;
  keys.slice(0, -1).forEach((k) => (o = o[k] ??= {}));
  o[keys.at(-1)] = v;
}

async function processPhoto(buf, dir, name) {
  const file = `${name}.jpg`;
  const img = sharp(buf, { failOn: 'none' }).rotate();
  // Keep photos at print quality: up to 3600px on the long edge (a full A4
  // page at 300 dpi needs ~3500px), near-lossless JPEG with full colour detail.
  // Camera metadata (including GPS location) is stripped for privacy.
  await img.clone().resize({ width: 3600, height: 3600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true }).toFile(path.join(dir, file));
  return file;
}
const preview = async (file) => (await sharp(file).resize({ width: 768, height: 768, fit: 'inside' }).jpeg({ quality: 70 }).toBuffer()).toString('base64');

// Run one agent turn and fold its answer into the session.
async function agentTurn(s, message, newPhotoIdx = []) {
  const newPhotos = [];
  for (const i of newPhotoIdx) newPhotos.push({ index: i, preview: await preview(path.join(dirOf(s.id), s.photos[i].file)) });
  const out = await chatTurn({ lang: s.uiLang || 'en', brief: { ...s.brief, _photoCount: s.photos.length, _lastAsk: s.lastAsk, _done: s.topicsDone || [] }, transcript: liveTranscript(s).slice(0, -1), message, newPhotos });
  for (const u of out.updates || []) {
    if (!BRIEF_FIELDS[u.field] || !u.value?.trim()) continue;
    if (u.field === 'report.extraInstructions') {
      // Answers to custom questions accumulate rather than overwrite.
      const prev = s.brief.report.extraInstructions || '';
      if (!prev.includes(u.value.trim())) s.brief.report.extraInstructions = `${prev}\n${u.value.trim()}`.trim().slice(-3000);
    } else setPath(s.brief, u.field, u.value.trim());
  }
  const outputs = (s.brief.project.outputs ??= []);
  for (const r of out.add_results || []) if (r.value && r.label && !outputs.some((o) => o.label.toLowerCase() === r.label.toLowerCase())) outputs.push({ value: r.value, label: r.label });
  const budget = (s.brief.project.budget ??= []);
  for (const b of out.add_budget || []) if (b.label && b.amount && !budget.some((o) => o.label.toLowerCase() === b.label.toLowerCase())) budget.push({ label: b.label, amount: b.amount });
  for (const c of out.photo_captions || []) if (s.photos[c.index] && !s.photos[c.index].caption) s.photos[c.index].caption = c.caption;
  if (message) s.brief.narrative = `${s.brief.narrative || ''}\n${message}`.trim().slice(-12000);
  if (out._answered) s.topicsDone = [...new Set([...(s.topicsDone || []), out._answered])];
  s.lastAsk = out._ask ?? s.lastAsk;
  s.suggestions = (out.suggestions || []).slice(0, 3);
  s.transcript.push({ role: 'agent', text: out.reply });
}

app.get('/api/config', route(async (req, res) => {
  const ai = await aiStatus();
  const st = getSettings();
  const pub = publicSettings();
  res.json({
    user: publicUser(req.user),
    aiEnabled: ai.enabled && ai.ok,
    ai: req.user.role === 'admin' ? ai : { ok: ai.ok, enabled: ai.enabled, off: ai.off, problem: ai.ok ? '' : `${ai.off ? 'AI writing is switched off by your administrator.' : 'The AI connection needs attention.'} ${getSettings().studio.assistantName} is using simple mode. Please let your administrator know.` },
    styles: styleList({ enabled: st.report.styles, v: settingsVersion() }),
    ceo: { name: brand.ceo.name, title: brand.ceo.title, photo: P(`/brand/${brand.ceo.photo}?v=${pub.version}`) },
    orgName: brand.orgName,
    settings: pub,
    storage: { persistent: persistentStorage() },
  });
}));
app.get('/api/status', route(async (req, res) => {
  const st = await aiStatus({ refresh: true });
  res.json(req.user.role === 'admin' ? st : { ok: st.ok, enabled: st.enabled, problem: st.ok ? '' : 'The AI connection needs attention. Please let your administrator know.' });
}));

const newSession = (req) => {
  const st = getSettings();
  const brief = emptyBrief();
  Object.assign(brief.report, { style: st.report.defaultStyle, pages: st.report.defaultPages, language: languages().defaultReport });
  return {
    uiLang: req.lang,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ownerId: req.user.id,
    ownerName: req.user.name,
    brief,
    transcript: [{ role: 'agent', text: greetingText(req.lang), greeting: true }],
    photos: [],
    suggestions: T.start[req.lang],
  };
};

app.post('/api/sessions', route(async (req, res) => {
  const s = newSession(req);
  await fs.mkdir(dirOf(s.id), { recursive: true });
  await save(s);
  track('session');
  res.json(view(s));
}));

// "My reports": your own (admins see everyone's in the dashboard).
app.get('/api/sessions', route(async (req, res) => {
  const list = await listSessions({ ownerId: req.user.id });
  res.json(list.filter((x) => x.donor));
}));

app.get('/api/sessions/:id', route(async (req, res) => {
  const s = await getSession(req);
  if (s.uiLang !== req.lang) {
    s.uiLang = req.lang;
    if (!s.transcript.some((m) => m.role === 'user') && !s.report) s.suggestions = T.start[req.lang];
    await save(s);
  }
  res.json(view(s));
}));

app.delete('/api/sessions/:id', route(async (req, res) => {
  await getSession(req);
  await remove(req.params.id);
  res.json({ ok: true });
}));

app.post('/api/sessions/:id/messages', route(async (req, res) => {
  const s = await getSession(req);
  const text = String(req.body.text || '').trim().slice(0, 8000);
  if (!text) return res.status(400).json({ error: 'Empty message' });
  s.uiLang = req.lang;
  s.transcript.push({ role: 'user', text });
  await agentTurn(s, text);
  await save(s);
  track('message');
  res.json(view(s));
}));

app.post('/api/sessions/:id/photos', upload.array('photos', 12), route(async (req, res) => {
  const s = await getSession(req);
  const added = [];
  for (const f of req.files || []) {
    if (s.photos.length >= 14) break;
    const file = await processPhoto(f.buffer, dirOf(s.id), `photo-${Date.now()}-${s.photos.length + 1}`);
    s.photos.push({ file, caption: '' });
    added.push(s.photos.length - 1);
  }
  const note = String(req.body.text || '').trim();
  s.uiLang = req.lang;
  s.transcript.push({ role: 'user', text: note || T.photos[req.lang](added.length), photos: added.map((i) => s.photos[i].file) });
  await agentTurn(s, note, added);
  await save(s);
  track('photo', { count: added.length });
  res.json(view(s));
}));

app.delete('/api/sessions/:id/photos/:file', route(async (req, res) => {
  const s = await getSession(req);
  s.photos = s.photos.filter((p) => p.file !== req.params.file);
  await save(s);
  res.json(view(s));
}));

// Direct edits from the "report card" panel.
app.patch('/api/sessions/:id/brief', route(async (req, res) => {
  const s = await getSession(req);
  for (const [k, v] of Object.entries(req.body.fields || {})) {
    // Style and page count are chosen while building; they are fixed once the report exists.
    if (s.report && ['report.pages', 'report.style', 'report.language'].includes(k)) continue;
    if (k === 'report.language') { s.brief.report.language = allowedLang(v); continue; }
    if (BRIEF_FIELDS[k] || ['report.pages', 'report.style'].includes(k)) setPath(s.brief, k, v);
  }
  if (Array.isArray(req.body.outputs)) s.brief.project.outputs = req.body.outputs.filter((o) => o.value && o.label);
  if (Array.isArray(req.body.budget)) s.brief.project.budget = req.body.budget.filter((o) => o.label && o.amount);
  if (req.body.photoCaptions) for (const [file, cap] of Object.entries(req.body.photoCaptions)) { const p = s.photos.find((x) => x.file === file); if (p) p.caption = cap; }
  await save(s);
  res.json(view(s));
}));

// ---------- reports ----------
const allowedStyle = (id) => {
  const st = getSettings().report;
  return st.styles[id] ? getStyle(id).id : st.defaultStyle;
};
const allowedPages = (n) => {
  const opts = getSettings().report.pageOptions;
  n = Number(n);
  return opts.includes(n) ? n : getSettings().report.defaultPages;
};

async function render(s) {
  const dir = dirOf(s.id);
  const html = buildHtml({ brief: s.brief, copy: s.report.copy, images: s.report.images, styleId: s.report.styleId, pages: s.report.pages, language: s.report.language || 'en' }, fileResolvers(dir));
  await htmlToPdf(html, dir, path.join(dir, 'report.pdf'));
  s.report.renderedAt = new Date().toISOString();
  await save(s);
}

async function compose(s) {
  // Staff photos first, then (if enabled) library photos so every report has rich imagery.
  const lib = getSettings().report.useLibraryPhotos ? pickLibrary(s.brief, s.photos.length, 7) : [];
  const images = [...s.photos.map((p) => ({ file: p.file, caption: p.caption })), ...lib];
  const previews = [];
  const ar = s.brief.report?.language === 'ar';
  for (const im of images) previews.push({ caption: (ar && im.captionAr) || im.caption, altAr: im.captionAr || '', illustrative: !!im.library, alt: im.caption, preview: await preview(im.library ? brandAssetPath(`library/${im.file}`) : path.join(dirOf(s.id), im.file)) });
  return { images, copy: await writeReport(s.brief, previews) };
}

app.post('/api/sessions/:id/report', route(async (req, res) => {
  const s = await getSession(req);
  if (!s.brief.donor?.name) return res.status(400).json({ error: 'Tell the assistant who the donor is first.' });
  if (s.report) return res.status(409).json({ error: LOCKED });
  const styleId = allowedStyle(req.body.styleId || s.brief.report.style);
  const pages = allowedPages(req.body.pages || s.brief.report.pages);
  const language = allowedLang(req.body.language || s.brief.report.language || 'en');
  Object.assign(s.brief.report, { style: styleId, pages, language });
  const { images, copy } = await compose(s);
  s.report = { styleId, pages, language, images, copy, aiWritten: aiEnabled(), createdAt: new Date().toISOString() };
  await render(s);
  const L = s.uiLang === 'ar' ? 'ar' : 'en';
  s.transcript.push({ role: 'agent', text: T.done[L](pages, (language === 'ar' && copy.locale?.donorName) || s.brief.donor.name, getStyle(styleId).name) });
  s.suggestions = [];
  await save(s);
  track('report', { styleId, pages, sessionId: s.id, donor: s.brief.donor.name });
  res.json(view(s));
}));

app.patch('/api/sessions/:id/report', route(async (req, res) => {
  const s = await getSession(req);
  if (!s.report) return res.status(400).json({ error: 'No report yet' });
  if ((req.body.styleId && req.body.styleId !== s.report.styleId) || (req.body.pages && Number(req.body.pages) !== s.report.pages) || (req.body.language && req.body.language !== (s.report.language || 'en'))) return res.status(409).json({ error: LOCKED });
  if (req.body.copy && typeof req.body.copy === 'object') s.report.copy = { ...s.report.copy, ...req.body.copy, images: s.report.copy.images };
  if (req.body.photos && typeof req.body.photos === 'object') applyPhotoChoices(s, req.body.photos);
  await render(s);
  track('update', { sessionId: s.id });
  res.json(view(s));
}));

app.post('/api/sessions/:id/report/rewrite', route(async (req, res) => {
  const s = await getSession(req);
  if (!s.report) return res.status(400).json({ error: 'No report yet' });
  const max = getSettings().report.maxRewrites;
  if ((s.report.rewrites || 0) >= max) return res.status(429).json({ error: `This report has used all ${max} AI rewrites. You can still edit the wording yourself.` });
  if (req.body.instructions) s.brief.report.extraInstructions = String(req.body.instructions).slice(0, 2000);
  Object.assign(s.brief.report, { pages: s.report.pages, style: s.report.styleId, language: s.report.language || 'en' });
  // Wording only: photos are not re-sent to the AI and the photo choices stay
  // as they are, which keeps a rewrite much cheaper than the first draft.
  const copy = await writeReport(s.brief, []);
  s.report.copy = { ...copy, images: s.report.copy.images };
  s.report.rewrites = (s.report.rewrites || 0) + 1;
  await render(s);
  track('rewrite', { sessionId: s.id });
  res.json(view(s));
}));

const LOCKED = 'The style, language and number of pages are fixed once a report has been created. You can still edit the wording, ask for a rewrite or change the photos.';

/** Cover/story picks, captions and newly added photos, chosen by hand (no AI). */
function applyPhotoChoices(s, p) {
  const r = s.report;
  for (const file of [].concat(p.add || [])) {
    if (s.photos.some((x) => x.file === file) && !r.images.some((im) => !im.library && im.file === file)) r.images.push({ file, caption: s.photos.find((x) => x.file === file).caption || '' });
  }
  const n = r.images.length;
  const ok = (i) => Number.isInteger(i) && i >= 0 && i < n;
  const im = (r.copy.images ||= {});
  if (ok(p.coverIndex)) im.coverIndex = p.coverIndex;
  if (ok(p.storyIndex)) im.storyIndex = p.storyIndex;
  if (Array.isArray(p.captions)) {
    const caps = new Map((im.captions || []).map((c) => [c.index, c.caption]));
    for (const c of p.captions) if (ok(c.index)) caps.set(c.index, String(c.caption || '').slice(0, 120));
    im.captions = [...caps].map(([index, caption]) => ({ index, caption }));
  }
}

app.get('/reports/:id/preview', route(async (req, res) => {
  const s = await getSession(req);
  if (!s.report) return res.status(404).send('No report yet');
  res.type('html').send(buildHtml({ brief: s.brief, copy: s.report.copy, images: s.report.images, styleId: s.report.styleId, pages: s.report.pages, language: s.report.language || 'en' }, httpResolvers(s.id)));
}));

const slug = (t) => String(t || 'donor').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40);
app.get('/reports/:id/pdf', route(async (req, res) => {
  const s = await getSession(req);
  if (!s.report) return res.status(404).send('No report yet');
  const file = path.join(dirOf(s.id), 'report.pdf');
  if (!existsSync(file)) await render(s);
  track('download', { sessionId: s.id });
  res.download(file, `${slug(brand.shortName)}-Impact-Report-${slug(s.brief.donor?.name)}.pdf`);
}));

app.get('/reports/:id/files/:file', route(async (req, res) => {
  const s = await getSession(req);
  if (!/^[\w.-]+$/.test(req.params.file)) return res.status(404).end();
  res.sendFile(path.join(dirOf(s.id), req.params.file));
}));

// ---------- start ----------
const created = ensureBootstrapAdmin();
const reset = resetAdminFromEnv(); // an explicit reset always wins
root.get('/health', (_req, res) => res.json({ ok: true }));
if (BASE) root.get('/', (_req, res) => res.redirect(`${BASE}/`));
root.use(BASE || '/', app);
root.listen(PORT, () => {
  console.log(`Donor Report Studio running on http://localhost:${PORT}${BASE}/`);
  if (created) {
    console.log('───────────────────────────────────────────────────────────');
    console.log(` First admin account created: username "${created.username}"`);
    console.log(` Password: ${process.env.ADMIN_PASSWORD ? '(from ADMIN_PASSWORD)' : BOOTSTRAP_ADMIN.password}  ${DEMO ? '(demo mode: shown on the sign-in page)' : '(must be changed at first sign-in)'}`);
    console.log('───────────────────────────────────────────────────────────');
  }
  if (reset) console.log(`ADMIN RESET: "${reset.username}" can now sign in with the password in ADMIN_RESET_PASSWORD (and must change it). Remove ADMIN_RESET_PASSWORD from the environment now.`);
  if (!persistentStorage()) console.log('WARNING: DATA_DIR is not set. Users, settings and reports are lost when the server restarts. Attach a disk and set DATA_DIR=/data.');
  aiStatus({ refresh: true }).then((st) =>
    console.log(st.ok ? `Claude AI: ON (key from ${st.source}: ${st.key}, model ${st.model})` : `Claude AI: NOT WORKING: ${st.problem}${st.source ? ` [key from ${st.source}: ${st.key}]` : ''}`)
  );
});
