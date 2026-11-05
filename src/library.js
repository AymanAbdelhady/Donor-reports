// Default imagery (the organisation's photo library, then brand-coloured illustrations), used to make
// every report visually complete when staff upload few or no photos.
import fs from 'node:fs';
import path from 'node:path';
import { BRAND_DIR, ASSETS_DIR } from './paths.js';
import { sectorCopy } from './fallbackCopy.js';

const SECTOR_TAGS = {
  water: ['water', 'children'],
  food: ['food', 'ramadan'],
  orphans: ['orphans', 'children'],
  education: ['education', 'children'],
  health: ['health', 'general'],
  livelihoods: ['livelihoods', 'women'],
  emergency: ['emergency', 'food'],
  winter: ['winter', 'emergency'],
  qurbani: ['qurbani', 'food'],
  general: ['general', 'children'],
};

export const CUSTOM_DIR = path.join(ASSETS_DIR, 'library', 'custom');
const readList = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return []; } };

/** Photos the organisation uploaded to its library (dashboard), newest first. */
export const customLibrary = () => readList(path.join(CUSTOM_DIR, 'library.json'));
export function saveCustomLibrary(list) {
  fs.mkdirSync(CUSTOM_DIR, { recursive: true });
  fs.writeFileSync(path.join(CUSTOM_DIR, 'library.json'), JSON.stringify(list, null, 1));
}

/** Uploaded library photos (real photography) first, then the brand-coloured illustrations. */
export function loadLibrary() {
  const custom = customLibrary().map((im) => ({ ...im, file: `custom/${im.file}`, custom: true }));
  // Bundled sample photography (brand/library/photos), then the illustrations.
  return [...custom, ...readList(path.join(BRAND_DIR, 'library', 'photos.json')), ...readList(path.join(BRAND_DIR, 'library', 'library.json'))];
}

/** Library photos to top a report up to `target` images, best sector match first. */
export function pickLibrary(brief, have, target = 7) {
  const need = Math.max(0, target - have);
  if (!need) return [];
  const lib = loadLibrary();
  const tags = SECTOR_TAGS[sectorCopy(brief).key] || SECTOR_TAGS.general;
  const tagScore = (im) => tags.reduce((s, t, i) => s + ((im.tags || []).includes(t) ? 10 - i * 3 : 0), 0);
  // Bundled sample photos only beat the illustrations when they match the project.
  const score = (im) => (im.custom ? 50 : 0) + (im.photo ? (tagScore(im) > 0 ? 8 : -40) : 0) + tagScore(im) + ((im.tags || []).includes('general') ? 2 : 0) + (im.width >= 1200 ? 3 : 0);
  // Stable order per donor so re-renders don't reshuffle.
  const seed = [...String(brief.donor?.name || '')].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return lib
    // Large photos first: the small ones (from the Brand Book PDF) look soft
    // when printed big, so they are only used if nothing larger is left.
    .map((im, i) => ({ im, s: (im.width >= 1000 ? 100 : 0) + score(im) + (((i + seed) * 7) % 5) / 10 }))
    .sort((a, b) => b.s - a.s)
    .slice(0, need)
    .map(({ im }) => ({ file: im.file, caption: im.alt, captionAr: im.altAr || '', library: true }));
}
