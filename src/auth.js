// Users, passwords and sign-in.
//  - Passwords are hashed with scrypt (salted); plain passwords are never stored.
//  - Sign-in sets an HttpOnly, signed cookie. Changing a password, disabling a
//    user or "sign out everywhere" invalidates existing cookies (tokenVersion).
//  - Roles: "admin" (dashboard + Studio) and "staff" (Studio only).
//  - Repeated failed sign-ins are slowed down per username and per IP.
import crypto from 'node:crypto';
import { readJSON, writeJSON, sessionSecret } from './store.js';
import { BASE } from './paths.js';

const COOKIE = 'drs_sid';
const SESSION_DAYS = 14;
const SECRET = sessionSecret();

// First admin account, created when no users exist yet. The password must be
// changed at first sign-in. ADMIN_USERNAME / ADMIN_PASSWORD env vars override.
// Demo mode (DEMO_MODE=1) signs presenters straight in with these details, no forced password change.
export const DEMO = process.env.DEMO_MODE === '1' || process.env.DEMO_MODE === 'true';
export const BOOTSTRAP_ADMIN = DEMO
  ? { username: process.env.DEMO_USERNAME || 'demo', password: process.env.DEMO_PASSWORD || 'Demo-Report-2026' }
  : { username: 'admin', password: 'Welcome-Report-2026!' };

// ---------- users ----------
let users = readJSON('users.json', []);
const saveUsers = () => writeJSON('users.json', users, { private: true });
const norm = (u) => String(u || '').trim().toLowerCase();

export const USERNAME_RULE = /^[a-z0-9][a-z0-9._-]{2,31}$/;
export function validatePassword(pw) {
  if (typeof pw !== 'string' || pw.length < 10) return 'Password must be at least 10 characters.';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must contain letters and at least one number.';
  return null;
}

function hash(pw, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(pw, salt, 64).toString('hex') };
}
function verify(pw, u) {
  const h = Buffer.from(crypto.scryptSync(pw, u.salt, 64).toString('hex'));
  const stored = Buffer.from(u.hash);
  return h.length === stored.length && crypto.timingSafeEqual(h, stored);
}

export const publicUser = (u) =>
  u && { id: u.id, username: u.username, name: u.name, email: u.email || '', role: u.role, active: u.active, mustChange: !!u.mustChange, createdAt: u.createdAt, createdBy: u.createdBy || '', lastLoginAt: u.lastLoginAt || null };

export const listUsers = () => users.map(publicUser);
export const getUser = (id) => users.find((u) => u.id === id);
export const findByUsername = (name) => users.find((u) => u.username === norm(name));

export function generatePassword() {
  // Readable but strong: e.g. "Sunrise-Kite-4821!"
  const words = ['Amber', 'Breeze', 'Cedar', 'Dune', 'Ember', 'Falcon', 'Garden', 'Harbor', 'Indigo', 'Jasmine', 'Kite', 'Lotus', 'Meadow', 'Nile', 'Olive', 'Palm', 'Quartz', 'River', 'Sunrise', 'Tide', 'Unity', 'Valley', 'Willow', 'Zenith'];
  const pick = () => words[crypto.randomInt(words.length)];
  return `${pick()}-${pick()}-${crypto.randomInt(1000, 9999)}!`;
}

export function createUser({ username, name, email = '', role = 'staff', password, mustChange = true }, createdBy = 'system') {
  const un = norm(username);
  if (!USERNAME_RULE.test(un)) throw Object.assign(new Error('Username must be 3–32 characters: lowercase letters, numbers, dot, dash or underscore, starting with a letter or number.'), { status: 400 });
  if (findByUsername(un)) throw Object.assign(new Error(`The username "${un}" is already taken. Usernames must be unique.`), { status: 409 });
  if (!String(name || '').trim()) throw Object.assign(new Error('Please enter the person’s full name.'), { status: 400 });
  if (!['admin', 'staff'].includes(role)) throw Object.assign(new Error('Role must be admin or staff.'), { status: 400 });
  const pw = password || generatePassword();
  const err = validatePassword(pw);
  if (err) throw Object.assign(new Error(err), { status: 400 });
  const u = { id: crypto.randomUUID(), username: un, name: String(name).trim().slice(0, 80), email: String(email || '').trim().slice(0, 120), role, active: true, mustChange, tokenVersion: 1, createdAt: new Date().toISOString(), createdBy, ...hash(pw) };
  users.push(u);
  saveUsers();
  return { user: publicUser(u), password: pw };
}

const activeAdmins = () => users.filter((u) => u.role === 'admin' && u.active);

export function updateUser(id, patch, actorId) {
  const u = getUser(id);
  if (!u) throw Object.assign(new Error('User not found'), { status: 404 });
  if (patch.name !== undefined) {
    if (!String(patch.name).trim()) throw Object.assign(new Error('Name cannot be empty'), { status: 400 });
    u.name = String(patch.name).trim().slice(0, 80);
  }
  if (patch.email !== undefined) u.email = String(patch.email).trim().slice(0, 120);
  if (patch.role !== undefined && patch.role !== u.role) {
    if (!['admin', 'staff'].includes(patch.role)) throw Object.assign(new Error('Role must be admin or staff.'), { status: 400 });
    if (u.role === 'admin' && activeAdmins().length <= 1) throw Object.assign(new Error('You can’t remove the last admin. Make someone else an admin first.'), { status: 400 });
    u.role = patch.role;
    u.tokenVersion++;
  }
  if (patch.active !== undefined && !!patch.active !== u.active) {
    if (id === actorId) throw Object.assign(new Error('You can’t disable your own account.'), { status: 400 });
    if (!patch.active && u.role === 'admin' && activeAdmins().length <= 1) throw Object.assign(new Error('You can’t disable the last admin.'), { status: 400 });
    u.active = !!patch.active;
    u.tokenVersion++;
  }
  saveUsers();
  return publicUser(u);
}

export function deleteUser(id, actorId) {
  const u = getUser(id);
  if (!u) throw Object.assign(new Error('User not found'), { status: 404 });
  if (id === actorId) throw Object.assign(new Error('You can’t delete your own account.'), { status: 400 });
  if (u.role === 'admin' && activeAdmins().length <= 1) throw Object.assign(new Error('You can’t delete the last admin.'), { status: 400 });
  users = users.filter((x) => x.id !== id);
  saveUsers();
}

/** Admin reset: new temporary password, user must change it at next sign-in. */
export function resetPassword(id) {
  const u = getUser(id);
  if (!u) throw Object.assign(new Error('User not found'), { status: 404 });
  const pw = generatePassword();
  Object.assign(u, hash(pw), { mustChange: true });
  u.tokenVersion++;
  saveUsers();
  return pw;
}

export function changeOwnPassword(id, current, next) {
  const u = getUser(id);
  if (!u || !verify(current, u)) throw Object.assign(new Error('Your current password is incorrect.'), { status: 400 });
  const err = validatePassword(next);
  if (err) throw Object.assign(new Error(err), { status: 400 });
  if (current === next) throw Object.assign(new Error('Choose a new password that is different from the current one.'), { status: 400 });
  Object.assign(u, hash(next), { mustChange: false });
  u.tokenVersion++;
  saveUsers();
  return u;
}

export function signOutEverywhere(id) {
  const u = getUser(id);
  if (u) {
    u.tokenVersion++;
    saveUsers();
  }
}

/** Create the first admin when the user list is empty. */
/**
 * Emergency admin reset: if ADMIN_RESET_PASSWORD is set (e.g. in Render's
 * Environment), the admin named by ADMIN_USERNAME (default "admin") gets
 * that password at startup, is re-activated and must choose a new one at sign-in.
 * Remove the variable again afterwards.
 */
export function resetAdminFromEnv() {
  const pw = process.env.ADMIN_RESET_PASSWORD;
  if (!pw) return null;
  const username = norm(process.env.ADMIN_USERNAME) || BOOTSTRAP_ADMIN.username;
  let u = findByUsername(username);
  if (!u) return createUser({ username, name: DEMO ? 'Demo Presenter' : 'Administrator', role: 'admin', password: pw, mustChange: true }, 'reset').user;
  Object.assign(u, { role: 'admin', active: true, mustChange: true, ...hash(pw) });
  u.tokenVersion++;
  saveUsers();
  return u;
}

export function ensureBootstrapAdmin() {
  if (users.length) return null;
  const username = norm(process.env.ADMIN_USERNAME) || BOOTSTRAP_ADMIN.username;
  const password = process.env.ADMIN_PASSWORD || BOOTSTRAP_ADMIN.password;
  const { user } = createUser({ username, name: DEMO ? 'Demo Presenter' : 'Administrator', role: 'admin', password, mustChange: !DEMO }, 'system');
  return user;
}

// ---------- sign-in throttling ----------
const fails = new Map(); // key -> {count, until}
const LIMIT = 6;
const LOCK_MS = 10 * 60 * 1000;
function throttled(key) {
  const f = fails.get(key);
  return f && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 60000) : 0;
}
function noteFail(key) {
  const f = fails.get(key) || { count: 0, until: 0 };
  f.count++;
  if (f.count >= LIMIT) {
    f.until = Date.now() + LOCK_MS;
    f.count = 0;
  }
  fails.set(key, f);
}

export function login(username, password, ip) {
  const keys = [`u:${norm(username)}`, `ip:${ip}`];
  const wait = Math.max(...keys.map(throttled));
  if (wait) throw Object.assign(new Error(`Too many failed attempts. Please wait ${wait} minute${wait > 1 ? 's' : ''} and try again.`), { status: 429 });
  const u = findByUsername(username);
  if (!u || !verify(String(password || ''), u)) {
    keys.forEach(noteFail);
    throw Object.assign(new Error('Incorrect username or password.'), { status: 401 });
  }
  if (!u.active) throw Object.assign(new Error('This account has been disabled. Please contact your administrator.'), { status: 403 });
  keys.forEach((k) => fails.delete(k));
  u.lastLoginAt = new Date().toISOString();
  saveUsers();
  return u;
}

// ---------- session cookie ----------
const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

export function issueCookie(res, req, u) {
  const payload = b64(JSON.stringify({ uid: u.id, v: u.tokenVersion, exp: Date.now() + SESSION_DAYS * 864e5 }));
  const token = `${payload}.${sign(payload)}`;
  const secure = req.secure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=${BASE}/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`);
}
export function clearCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=${BASE}/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function userFromRequest(req) {
  const raw = (req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const { uid, v, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const u = getUser(uid);
    if (!u || !u.active || u.tokenVersion !== v || exp < Date.now()) return null;
    return u;
  } catch {
    return null;
  }
}

// Paths anyone can reach without signing in.
const PUBLIC = [/^\/login(\.html)?$/, /^\/login\.(js|css|rtl\.css)$/, /^\/api\/auth\//, /^\/api\/public-config$/, /^\/health$/, /^\/brand\//, /^\/fonts\//, /^\/favicon/];
// Signed-in users who must change their password can only reach these.
const CHANGE_ONLY = [/^\/api\/me/, /^\/api\/auth\//, /^\/login/];

export function authMiddleware(req, res, next) {
  req.user = userFromRequest(req);
  const p = req.path;
  if (PUBLIC.some((r) => r.test(p))) return next();
  const wantsHtml = req.method === 'GET' && !p.startsWith('/api/') && (req.headers.accept || '').includes('text/html');
  if (!req.user) {
    if (wantsHtml) return res.redirect(`${BASE}/login?next=${encodeURIComponent(req.originalUrl)}`);
    return res.status(401).json({ error: 'Please sign in.', signIn: true });
  }
  if (req.user.mustChange && !CHANGE_ONLY.some((r) => r.test(p))) {
    if (wantsHtml) return res.redirect(`${BASE}/login?change=1`);
    return res.status(403).json({ error: 'Please change your password first.', mustChange: true });
  }
  if ((p === '/admin' || p.startsWith('/admin.') || p.startsWith('/api/admin/')) && req.user.role !== 'admin') {
    if (wantsHtml) return res.redirect(`${BASE}/`);
    return res.status(403).json({ error: 'Admins only.' });
  }
  next();
}
