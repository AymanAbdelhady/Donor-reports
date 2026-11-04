// HTML -> PDF using headless Chromium (Playwright).
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let browserPromise;
// File access lets the photo-cropping step below read the report's own images.
const getBrowser = () => (browserPromise ??= chromium.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] }));

// Chromium stores any *cropped* photo in a PDF uncompressed (one photo can be
// 10MB+). So, just before printing, each cover-fitted photo is cropped to
// exactly what its frame shows and re-encoded as a high-quality JPEG at up to
// 330 dpi for the frame's printed size; Chromium then embeds that JPEG as-is.
// Full quality, sensible file sizes.
async function cropPhotosForPrint(page) {
  await page.evaluate(async () => {
    const MAX_DPI = 330, PX_PER_MM = 96 / 25.4;
    const els = [...document.querySelectorAll('[style*="background-image"]')];
    const load = (src) => new Promise((ok) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => ok(null); im.src = src; });
    const pos = (v, free) => (v.endsWith('%') ? (parseFloat(v) / 100) * free : parseFloat(v) || 0);
    for (const el of els) {
      const cs = getComputedStyle(el);
      const m = cs.backgroundImage.match(/^url\("?(.*?)"?\)$/);
      if (!m || m[1].startsWith('data:image/svg') || cs.backgroundSize !== 'cover') continue;
      const W = el.clientWidth, H = el.clientHeight;
      if (W < 20 || H < 20) continue;
      const im = await load(m[1]);
      if (!im || !im.naturalWidth) continue;
      const scale = Math.max(W / im.naturalWidth, H / im.naturalHeight);
      const [px = '50%', py = '50%'] = cs.backgroundPosition.split(',')[0].trim().split(/\s+/);
      const ox = pos(px, W - im.naturalWidth * scale), oy = pos(py, H - im.naturalHeight * scale);
      const sx = -ox / scale, sy = -oy / scale, sw = W / scale, sh = H / scale;
      const maxW = Math.round((W / PX_PER_MM / 25.4) * MAX_DPI);
      const outW = Math.round(Math.min(sw, maxW)), outH = Math.round(outW * (H / W));
      const c = document.createElement('canvas');
      c.width = outW; c.height = outH;
      const g = c.getContext('2d');
      g.imageSmoothingQuality = 'high';
      g.drawImage(im, sx, sy, sw, sh, 0, 0, outW, outH);
      try {
        const url = c.toDataURL('image/jpeg', 0.92);
        el.style.backgroundImage = `url("${url}")`;
        el.style.backgroundSize = '100% 100%';
        el.style.backgroundPosition = '0 0';
      } catch { /* leave the original photo in place */ }
    }
  });
}

async function openRendered(html, dir, viewport) {
  // Written next to the report's images so file:// URLs resolve.
  const htmlFile = path.join(dir, `render-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.html`);
  await fs.writeFile(htmlFile, html);
  const browser = await getBrowser();
  const page = await browser.newPage(viewport ? { viewport } : undefined);
  await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load', timeout: 120000 });
  await page.waitForSelector('body[data-fitted="1"]', { timeout: 30000 }).catch(() => {});
  const cleanup = async () => {
    await page.close();
    await fs.unlink(htmlFile).catch(() => {});
  };
  return { page, cleanup };
}

/** Renders the report HTML to an A4 PDF file. */
export async function htmlToPdf(html, dir, outFile) {
  const { page, cleanup } = await openRendered(html, dir);
  try {
    await cropPhotosForPrint(page).catch((e) => console.error('Photo crop step skipped:', e.message));
    await page.pdf({ path: outFile, preferCSSPageSize: true, printBackground: true });
  } finally {
    await cleanup();
  }
  return outFile;
}

/** Screenshots one page of the report (used for layout thumbnails). */
export async function htmlToPng(html, dir, outFile, pageIndex = 0, scale = 1) {
  const { page, cleanup } = await openRendered(html, dir, { width: 794, height: 1123 });
  try {
    const els = await page.$$('section.page');
    await els[pageIndex].screenshot({ path: outFile, scale: scale === 1 ? 'css' : 'device' });
  } finally {
    await cleanup();
  }
}

export async function closeBrowser() {
  if (browserPromise) await (await browserPromise).close();
  browserPromise = undefined;
}
