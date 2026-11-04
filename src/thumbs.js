// Re-draws the style-picker thumbnails in the organisation's current colours
// and logo (after branding changes in the dashboard). Saved to DATA_DIR/thumbs,
// which is served in front of the bundled thumbnails.
import path from 'node:path';
import { STYLES, buildHtml } from './render/index.js';
import { htmlToPng } from './pdf.js';
import { fileResolvers, BRAND_DIR } from './paths.js';
import { THUMBS_DIR } from './store.js';
import { pickLibrary } from './library.js';
import { refreshGeneratedAssets } from './generate.js';
import { sampleBrief, sampleCopy } from '../scripts/sample-data.js';

let running = null;
let again = false;

export function refreshThumbnails() {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    try {
      await refreshGeneratedAssets().catch((e) => console.error('Artwork refresh failed:', e.message));
      const images = pickLibrary(sampleBrief, 0, 7);
      for (const S of STYLES) {
        const html = buildHtml({ brief: sampleBrief, copy: sampleCopy, images, styleId: S.id, pages: 8 }, fileResolvers(BRAND_DIR));
        await htmlToPng(html, THUMBS_DIR, path.join(THUMBS_DIR, `${S.id}.png`), 0);
      }
    } catch (err) {
      console.error('Thumbnail refresh failed:', err.message);
    } finally {
      running = null;
      if (again) {
        again = false;
        refreshThumbnails();
      }
    }
  })();
  return running;
}
