import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const BRAND_DIR = path.join(ROOT, 'brand');
export const FONT_DIR = path.join(ROOT, 'node_modules', '@fontsource');
// Where the app lives on its domain, e.g. "/acme" for https://donor.example.org/acme
// (set with the BASE_PATH environment variable; empty = the root of the domain).
export const BASE = ('/' + String(process.env.BASE_PATH || '').trim().replace(/^\/+|\/+$/g, '')).replace(/^\/$/, '');
/** Prefix an app path ("/api/x") with the base path. */
export const P = (p) => BASE + p;
export const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
export const REPORTS_DIR = path.join(DATA_DIR, 'reports');
// Logos / CEO photo uploaded from the admin dashboard override files in /brand.
export const ASSETS_DIR = path.join(DATA_DIR, 'assets');

/** Absolute path of a brand asset: an uploaded override if present, else the bundled file. */
export function brandAssetPath(f) {
  const custom = path.join(ASSETS_DIR, f);
  return fs.existsSync(custom) ? custom : path.join(BRAND_DIR, f);
}

/** Asset resolvers for rendering to PDF from disk (file:// URLs). */
export const fileResolvers = (reportDir) => ({
  imageUrl: (f) => pathToFileURL(path.join(reportDir, f)).href,
  assetUrl: (f) => pathToFileURL(brandAssetPath(f)).href,
  fontUrl: (f) => pathToFileURL(path.join(FONT_DIR, f)).href,
});

/** Asset resolvers for the in-browser preview (served over HTTP). */
export const httpResolvers = (id) => ({
  imageUrl: (f) => `${BASE}/reports/${id}/files/${encodeURIComponent(f)}`,
  assetUrl: (f) => `${BASE}/brand/${f.split('/').map(encodeURIComponent).join('/')}`,
  fontUrl: (f) => `${BASE}/fonts/${f}`,
  screen: true,
});
