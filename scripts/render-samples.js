// Renders the sample report in every style: PDFs into samples/ and a cover
// thumbnail per style into public/styles/ (used by the style picker).
//   npm run samples          -> 8-page and 4-page sample of every style
//   npm run samples -- thin  -> also a report from a very thin brief (no AI, no photos)
import fs from 'node:fs/promises';
import path from 'node:path';
import { STYLES, buildHtml } from '../src/render/index.js';
import { htmlToPdf, htmlToPng, closeBrowser } from '../src/pdf.js';
import { ROOT, BRAND_DIR, fileResolvers } from '../src/paths.js';
import { pickLibrary } from '../src/library.js';
import { fallbackCopy } from '../src/fallbackCopy.js';
import { sampleBrief, sampleCopy, sampleCopyAr } from './sample-data.js';
import { showcaseBrief, showcaseCopy, showcaseCopyAr, showcaseImages } from './showcase-data.js';

const outDir = path.join(ROOT, 'samples');
const thumbDir = path.join(ROOT, 'public', 'styles');
await fs.mkdir(outDir, { recursive: true });
await fs.mkdir(thumbDir, { recursive: true });

// Samples use only library photography (real reports use uploaded photos first).
const images = pickLibrary(sampleBrief, 0, 7);
const only = process.argv.slice(2).filter((a) => /^[a-z]+$/.test(a) && a !== 'thin');

for (const S of STYLES) {
  if (only.length && !only.includes(S.id)) continue;
  for (const pages of [8, 4]) {
    const report = { brief: sampleBrief, copy: sampleCopy, images, styleId: S.id, pages };
    const html = buildHtml(report, fileResolvers(BRAND_DIR));
    const pdf = path.join(outDir, `${S.id}-${pages}p.pdf`);
    await htmlToPdf(html, BRAND_DIR, pdf);
    console.log('rendered', path.relative(ROOT, pdf));
  }
  // Arabic (right-to-left) version
  for (const pages of [8, 4]) {
    const report = { brief: sampleBrief, copy: sampleCopyAr, images, styleId: S.id, pages, language: 'ar' };
    const pdf = path.join(outDir, `${S.id}-${pages}p-ar.pdf`);
    await htmlToPdf(buildHtml(report, fileResolvers(BRAND_DIR)), BRAND_DIR, pdf);
    console.log('rendered', path.relative(ROOT, pdf));
  }
  // Showcase: the food-relief report with real photography (English + Arabic).
  // Its cover is also the style thumbnail in the Studio's style picker.
  for (const language of ['en', 'ar']) {
    const report = { brief: showcaseBrief, copy: language === 'ar' ? showcaseCopyAr : showcaseCopy, images: showcaseImages, styleId: S.id, pages: 8, language };
    const html = buildHtml(report, fileResolvers(BRAND_DIR));
    const pdf = path.join(outDir, 'showcase', `${S.id}${language === 'ar' ? '-ar' : ''}.pdf`);
    await fs.mkdir(path.dirname(pdf), { recursive: true });
    await htmlToPdf(html, BRAND_DIR, pdf);
    if (language === 'en') await htmlToPng(html, BRAND_DIR, path.join(thumbDir, `${S.id}.png`), 0);
    console.log('rendered', path.relative(ROOT, pdf));
  }
}

if (process.argv.includes('thin')) {
  const thin = { donor: { name: 'Acme Holdings', givingType: 'Corporate / CSI', amount: '80000' }, project: { name: 'Winter warmth for families in Gauteng', outputs: [], budget: [] }, report: { pages: 6 } };
  const imgs = pickLibrary(thin, 0, 7);
  for (const S of STYLES) {
    const report = { brief: thin, copy: fallbackCopy(thin, imgs), images: imgs, styleId: S.id, pages: 6 };
    await htmlToPdf(buildHtml(report, fileResolvers(BRAND_DIR)), BRAND_DIR, path.join(outDir, `thin-${S.id}-6p.pdf`));
    console.log('rendered thin', S.id);
  }
}
await closeBrowser();
