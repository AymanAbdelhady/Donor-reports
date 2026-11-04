// Admin dashboard API (/api/admin/*). Admin-only access is enforced by
// authMiddleware; every route here can assume req.user is an active admin.
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { getSettings, updateSettings, resetSettings, defaults, settingsVersion, STYLE_IDS } from './settings.js';
import { listUsers, createUser, updateUser, deleteUser, resetPassword, signOutEverywhere } from './auth.js';
import { summarize, track } from './usage.js';
import { aiStatus, keyInfo } from './ai.js';
import { listSessions, validId, remove } from './sessions.js';
import { real } from './render/helpers.js';
import { brand } from './brand.js';
import { ASSETS_DIR } from './paths.js';
import { persistentStorage } from './store.js';
import { refreshThumbnails } from './thumbs.js';
import { STYLES } from './render/index.js';
import { customLibrary, saveCustomLibrary, CUSTOM_DIR } from './library.js';
import { DEMO } from './auth.js';
import { REPORTS_DIR } from './paths.js';

export const admin = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 } });
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

const VISUAL = ['org', 'colors', 'logos', 'ceo'];

// ---------- getting started ----------
function setupChecklist(users) {
  const s = getSettings();
  const d = defaults();
  const ai = getSettings().ai;
  return [
    { id: 'brand', label: 'Add your organisation’s name and colours', href: 'branding', done: s.org.orgName !== d.org.orgName || JSON.stringify(s.colors) !== JSON.stringify(d.colors) },
    { id: 'logo', label: 'Upload your logo', href: 'branding', done: String(s.logos.box || '').startsWith('custom-') || String(s.logos.colour || '').startsWith('custom-') },
    { id: 'ceo', label: 'Set who signs the thank-you letter', href: 'ceo', done: s.ceo.name !== d.ceo.name || String(s.ceo.photo || '').startsWith('custom-') },
    { id: 'photos', label: 'Add photos to your library (optional)', href: 'branding', done: customLibrary().length > 0 },
    { id: 'ai', label: 'Connect Claude for AI writing', href: 'ai', done: ai.enabled !== false && Boolean(ai.apiKey || keyInfo().source) },
    { id: 'team', label: 'Invite your team', href: 'users', done: users.length > 1 },
  ];
}

// ---------- overview ----------
admin.get('/overview', route(async (_req, res) => {
  const users = listUsers();
  const sessions = await listSessions();
  const usage = summarize({ days: 30, users });
  const since = Date.now() - 30 * 864e5;
  res.json({
    users: { total: users.length, active: users.filter((u) => u.active).length, admins: users.filter((u) => u.role === 'admin').length },
    reports: { total: sessions.filter((s) => s.hasReport).length, last30: sessions.filter((s) => s.hasReport && Date.parse(s.updatedAt) >= since).length, drafts: sessions.filter((s) => !s.hasReport && s.donor).length },
    placeholders: [['phone number', brand.phone], ['registration numbers', brand.registration]].filter(([, v]) => v && !real(v)).map(([k]) => k),
    setup: setupChecklist(users),
    demo: DEMO,
    usage,
    ai: await aiStatus(),
    storage: { persistent: persistentStorage() },
  });
}));

// ---------- users ----------
admin.get('/users', (_req, res) => res.json(listUsers()));
admin.post('/users', route((req, res) => {
  const { user, password } = createUser({ ...req.body, mustChange: req.body.mustChange !== false }, req.user.username);
  track('admin', { action: 'user.create', target: user.username });
  res.json({ user, password });
}));
admin.patch('/users/:id', route((req, res) => {
  const user = updateUser(req.params.id, req.body, req.user.id);
  track('admin', { action: 'user.update', target: user.username });
  res.json(user);
}));
admin.delete('/users/:id', route((req, res) => {
  deleteUser(req.params.id, req.user.id);
  track('admin', { action: 'user.delete', target: req.params.id });
  res.json({ ok: true });
}));
admin.post('/users/:id/reset-password', route((req, res) => {
  const password = resetPassword(req.params.id);
  track('admin', { action: 'user.reset-password', target: req.params.id });
  res.json({ password });
}));
admin.post('/users/:id/sign-out', route((req, res) => {
  signOutEverywhere(req.params.id);
  res.json({ ok: true });
}));

// ---------- usage & reports ----------
admin.get('/usage', route((req, res) => res.json(summarize({ days: Math.min(365, Math.max(1, Number(req.query.days) || 30)), users: listUsers() }))));
admin.get('/reports', route(async (_req, res) => res.json((await listSessions()).filter((s) => s.started))));
admin.delete('/reports/:id', route(async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  await remove(req.params.id);
  track('admin', { action: 'report.delete', target: req.params.id });
  res.json({ ok: true });
}));

// ---------- photo library (default photos used when staff have few) ----------
const libraryView = () => customLibrary().map((im) => ({ ...im, url: `brand/library/custom/${encodeURIComponent(im.file)}` }));
const uploadMany = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 20 } });
admin.get('/library', (_req, res) => res.json(libraryView()));
admin.post('/library', uploadMany.array('photos', 20), route(async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'Please choose one or more photos.' });
  fs.mkdirSync(CUSTOM_DIR, { recursive: true });
  const list = customLibrary();
  let added = 0;
  for (const [i, f] of req.files.entries()) {
    const file = `lib-${Date.now().toString(36)}-${i}.jpg`;
    try {
      const info = await sharp(f.buffer, { failOn: 'none' }).rotate().resize({ width: 3600, height: 3600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true }).toFile(path.join(CUSTOM_DIR, file));
      const alt = path.parse(f.originalname || '').name.replace(/[-_]+/g, ' ').replace(/\b(img|dsc|photo|image)\s*\d*/gi, '').trim();
      list.unshift({ file, alt: alt.length > 3 ? alt.charAt(0).toUpperCase() + alt.slice(1) : 'Our work in the community', tags: ['general'], width: info.width, height: info.height });
      added++;
    } catch { /* skip files that aren't images */ }
  }
  if (!added) return res.status(400).json({ error: 'Those files could not be read as photos. Please use JPG or PNG.' });
  saveCustomLibrary(list.slice(0, 60));
  track('admin', { action: 'library.add', count: added });
  refreshThumbnails();
  res.json(libraryView());
}));
admin.patch('/library/:file', route((req, res) => {
  const list = customLibrary();
  const im = list.find((x) => x.file === req.params.file);
  if (!im) return res.status(404).json({ error: 'Photo not found' });
  im.alt = String(req.body.alt || '').trim().slice(0, 120) || im.alt;
  saveCustomLibrary(list);
  res.json(libraryView());
}));
admin.delete('/library/:file', route((req, res) => {
  const list = customLibrary().filter((x) => x.file !== req.params.file);
  if (/^[\w.-]+$/.test(req.params.file)) fs.rm(path.join(CUSTOM_DIR, req.params.file), { force: true }, () => {});
  saveCustomLibrary(list);
  refreshThumbnails();
  res.json(libraryView());
}));

// ---------- demo reset (DEMO_MODE only): back to the fictional demo organisation ----------
admin.post('/demo/reset', route(async (req, res) => {
  if (!DEMO) return res.status(403).json({ error: 'Only available in demo mode.' });
  resetSettings();
  for (const s of await listSessions()) await remove(s.id);
  for (const f of fs.readdirSync(ASSETS_DIR)) if (f.startsWith('custom-')) fs.rmSync(path.join(ASSETS_DIR, f), { force: true });
  fs.rmSync(CUSTOM_DIR, { recursive: true, force: true });
  track('admin', { action: 'demo.reset' });
  refreshThumbnails();
  res.json({ ok: true });
}));

// ---------- settings ----------
function settingsView() {
  const s = structuredClone(getSettings());
  const k = keyInfo();
  s.ai.apiKeySet = Boolean(s.ai.apiKey);
  s.ai.apiKeyPreview = s.ai.apiKey ? `${s.ai.apiKey.slice(0, 10)}…${s.ai.apiKey.slice(-4)}` : '';
  s.ai.envKeyPreview = k.envKey;
  delete s.ai.apiKey;
  return { settings: s, library: libraryView(), demo: DEMO, defaults: { ...defaults(), ai: { ...defaults().ai, apiKey: undefined } }, styles: STYLES.map(({ id, name, description, bestFor }) => ({ id, name, description, bestFor })), styleIds: STYLE_IDS, version: settingsVersion() };
}
admin.get('/settings', (_req, res) => res.json(settingsView()));
admin.patch('/settings', route((req, res) => {
  const patch = { ...req.body };
  if (patch.ai) {
    patch.ai = { ...patch.ai };
    // The key is only changed when explicitly sent; "" removes it.
    if (patch.ai.apiKey === undefined) delete patch.ai.apiKey;
    else patch.ai.apiKey = String(patch.ai.apiKey).trim().replace(/^['"]|['"]$/g, '');
    delete patch.ai.apiKeySet;
    delete patch.ai.apiKeyPreview;
    delete patch.ai.envKeyPreview;
  }
  updateSettings(patch);
  track('admin', { action: 'settings.update', sections: Object.keys(patch) });
  if (Object.keys(patch).some((k) => VISUAL.includes(k))) refreshThumbnails();
  res.json(settingsView());
}));
admin.post('/settings/reset', route((req, res) => {
  resetSettings(req.body.section);
  track('admin', { action: 'settings.reset', section: req.body.section || 'all' });
  refreshThumbnails();
  res.json(settingsView());
}));
admin.post('/ai/test', route(async (_req, res) => res.json(await aiStatus({ refresh: true }))));

// ---------- logo / CEO uploads ----------
const SLOTS = {
  'logo-box': { key: ['logos', 'box'], kind: 'png', max: 1400 },
  'logo-colour': { key: ['logos', 'colour'], kind: 'png', max: 1400 },
  'logo-white': { key: ['logos', 'white'], kind: 'png', max: 1400 },
  'ceo-photo': { key: ['ceo', 'photo'], kind: 'jpg', max: 1400 },
  'ceo-signature': { key: ['ceo', 'signature'], kind: 'png', max: 1200 },
};
admin.post('/assets/:slot', upload.single('file'), route(async (req, res) => {
  const slot = SLOTS[req.params.slot];
  if (!slot) return res.status(404).json({ error: 'Unknown upload slot' });
  if (!req.file) return res.status(400).json({ error: 'Please choose an image file.' });
  const name = `custom-${req.params.slot}-${Date.now()}.${slot.kind}`;
  let img = sharp(req.file.buffer, { failOn: 'none' }).rotate().resize({ width: slot.max, height: slot.max, fit: 'inside', withoutEnlargement: true });
  img = slot.kind === 'png' ? img.png() : img.jpeg({ quality: 90 });
  try {
    await img.toFile(path.join(ASSETS_DIR, name));
  } catch {
    return res.status(400).json({ error: 'That file could not be read as an image. Please upload a PNG, JPG or SVG.' });
  }
  const [section, field] = slot.key;
  const old = getSettings()[section][field];
  updateSettings({ [section]: { [field]: name } });
  if (old && old.startsWith('custom-')) fs.rm(path.join(ASSETS_DIR, old), { force: true }, () => {});
  track('admin', { action: 'asset.upload', slot: req.params.slot });
  refreshThumbnails();
  res.json(settingsView());
}));
admin.delete('/assets/:slot', route((req, res) => {
  const slot = SLOTS[req.params.slot];
  if (!slot) return res.status(404).json({ error: 'Unknown upload slot' });
  const [section, field] = slot.key;
  const old = getSettings()[section][field];
  updateSettings({ [section]: { [field]: defaults()[section][field] } });
  if (old && old.startsWith('custom-')) fs.rm(path.join(ASSETS_DIR, old), { force: true }, () => {});
  refreshThumbnails();
  res.json(settingsView());
}));
