// Tiny JSON-file persistence in DATA_DIR (settings, users, usage log, secret).
// Writes are atomic (write to a temp file, then rename) so a crash can't leave
// a half-written file behind.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DATA_DIR, ASSETS_DIR } from './paths.js';

export { ASSETS_DIR };
fs.mkdirSync(DATA_DIR, { recursive: true });
export const THUMBS_DIR = path.join(DATA_DIR, 'thumbs');
fs.mkdirSync(ASSETS_DIR, { recursive: true });
fs.mkdirSync(THUMBS_DIR, { recursive: true });

export const dataFile = (name) => path.join(DATA_DIR, name);

export function readJSON(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(dataFile(name), 'utf8'));
  } catch {
    return fallback;
  }
}

export function writeJSON(name, data, { private: priv = false } = {}) {
  const file = dataFile(name);
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 1), { mode: priv ? 0o600 : 0o644 });
  fs.renameSync(tmp, file);
}

export function appendLine(name, obj) {
  fs.appendFileSync(dataFile(name), JSON.stringify(obj) + '\n');
}

export function readLines(name) {
  try {
    return fs
      .readFileSync(dataFile(name), 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** Secret used to sign login cookies: SESSION_SECRET env, else generated once and kept in DATA_DIR. */
export function sessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const f = dataFile('secret.key');
  try {
    return fs.readFileSync(f, 'utf8').trim();
  } catch {
    const s = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(f, s, { mode: 0o600 });
    return s;
  }
}

/** True when DATA_DIR looks like a persistent disk (explicitly configured). */
export const persistentStorage = () => Boolean(process.env.DATA_DIR);
