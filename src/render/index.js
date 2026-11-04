// Report engine: turns a stored report (brief + copy + photos) into a
// print-ready A4 HTML document in one of the report styles.
import fs from 'node:fs';
import path from 'node:path';
import { brand } from '../brand.js';
import { pickVerse } from '../schema.js';
import { getSettings, givingTypeAr } from '../settings.js';
import { arabicFontCss, AR_CSS, flipCss, flipInline, translateLabels, arDates } from './i18n.js';
import { esc, toNum, rand } from './helpers.js';
import signature from './styles/signature.js';
import frame from './styles/frame.js';
import pop from './styles/pop.js';
import editorial from './styles/editorial.js';
import seasons from './styles/seasons.js';
import numbers from './styles/numbers.js';
import poster from './styles/poster.js';
import mosaic from './styles/mosaic.js';
import journey from './styles/journey.js';
import { BRAND_DIR, BASE } from '../paths.js';

export const STYLES = [signature, frame, pop, editorial, seasons, numbers, poster, mosaic, journey];
export const getStyle = (id) => STYLES.find((s) => s.id === id) || STYLES[0];
/** Styles for the Studio picker. `enabled` (from admin settings) filters them; `v` busts the thumbnail cache. */
export const styleList = ({ enabled, v } = {}) =>
  STYLES.filter((s) => !enabled || enabled[s.id]).map((s) => ({ id: s.id, name: s.name, description: s.description, bestFor: s.bestFor, swatch: s.swatch, thumb: `${BASE}/styles/${s.id}.png${v ? `?v=${v}` : ''}` }));

/** Which page designs make up a report of N pages. Every report is complete. */
export function pagePlan(pages) {
  const n = Math.min(8, Math.max(4, Number(pages) || 6));
  return {
    4: ['cover', 'letter', 'impactStory', 'closing'],
    5: ['cover', 'letter', 'project', 'impactStory', 'closing'],
    6: ['cover', 'letter', 'project', 'impact', 'story', 'closing'],
    7: ['cover', 'letter', 'project', 'impact', 'story', 'money', 'back'],
    8: ['cover', 'letter', 'project', 'impact', 'story', 'gallery', 'money', 'back'],
  }[n];
}

function buildContext(report, opts) {
  const { copy, brief } = report;
  const d = brief.donor || {};
  const p = brief.project || {};
  const r = brief.report || {};
  const images = (report.images || []).map((im, i) => ({
    url: im.library ? opts.assetUrl(`library/${im.file}`) : opts.imageUrl(im.file),
    caption: report.language === 'ar' && im.library ? im.captionAr || (/[\u0600-\u06FF]/.test(im.caption || '') ? im.caption : '') : im.caption || '',
    illustrative: !!im.library,
    i,
  }));
  (copy.images?.captions || []).forEach((c) => {
    if (images[c.index] && c.caption) images[c.index].caption = c.caption;
  });
  const valid = (i) => (Number.isInteger(i) && i >= 0 && i < images.length ? i : -1);
  let coverI = valid(copy.images?.coverIndex);
  if (coverI < 0) coverI = images.length ? 0 : -1;
  let storyI = valid(copy.images?.storyIndex);
  if (storyI < 0 || storyI === coverI) storyI = images.findIndex((_, i) => i !== coverI);
  const rest = images.filter((_, i) => i !== coverI && i !== storyI);
  let cursor = 0;
  const next = () => (rest.length ? rest[cursor++ % rest.length] : images[coverI] || null);

  const budget = (p.budget || []).map((b) => ({ label: b.label, amount: toNum(b.amount) })).filter((b) => b.label && b.amount > 0);
  const budgetTotal = budget.reduce((a, b) => a + b.amount, 0);
  const amountNum = toNum(d.amount) || budgetTotal;

  const ctx = {
    copy,
    brief,
    brand,
    pages: report.pages,
    images,
    cover: images[coverI] || null,
    storyImg: images[storyI] || images[coverI] || null,
    projectImg: null,
    impactImg: null,
    backImg: null,
    gallery: [],
    logos: { box: opts.assetUrl(brand.logo.box), colour: opts.assetUrl(brand.logo.colour), white: opts.assetUrl(brand.logo.white) },
    ceo: {
      name: r.ceoName || brand.ceo.name,
      title: r.ceoTitle || brand.ceo.title,
      photo: brand.ceo.photo ? opts.assetUrl(brand.ceo.photo) : null,
      signature: brand.ceo.signature ? opts.assetUrl(brand.ceo.signature) : null,
    },
    donorName: d.name || 'Our valued supporter',
    givingType: d.givingType || 'Your gift',
    amount: rand(amountNum),
    amountNum,
    period: r.reportPeriod || [p.startDate, p.endDate].filter(Boolean).join(' – '),
    place: [p.location, p.country].filter(Boolean).join(', '),
    budget,
    budgetTotal,
    verse: pickVerse(brief, report.language === 'ar' ? getSettings().ar?.quotes : getSettings().report.quotes),
  };
  ctx.projectImg = next();
  ctx.impactImg = next();
  ctx.backImg = next();
  ctx.moneyImg = next();
  ctx.gallery = [ctx.storyImg, ...rest, ctx.cover].filter((x, i, a) => x && a.indexOf(x) === i).slice(0, 6);
  return ctx;
}

function fontCss(fontUrl) {
  const face = (family, file, weight, style = 'normal') =>
    `@font-face{font-family:'${family}';src:url('${fontUrl(file)}') format('woff2');font-weight:${weight};font-style:${style};font-display:block}`;
  const out = [];
  for (const w of [400, 500, 600, 700, 800, 900]) out.push(face('Barlow Semi Condensed', `barlow-semi-condensed/files/barlow-semi-condensed-latin-${w}-normal.woff2`, w));
  for (const w of [300, 400, 700, 900]) out.push(face('Lato', `lato/files/lato-latin-${w}-normal.woff2`, w));
  out.push(face('Lato', 'lato/files/lato-latin-400-italic.woff2', 400, 'italic'));
  out.push(face('Caveat Brush', 'caveat-brush/files/caveat-brush-latin-400-normal.woff2', 400));
  for (const w of [400, 700]) out.push(face('Cairo', `cairo/files/cairo-arabic-${w}-normal.woff2`, w));
  out.push(face('Amiri', 'amiri/files/amiri-arabic-400-normal.woff2', 400));
  out.push(face('Mrs Saint Delafield', 'mrs-saint-delafield/files/mrs-saint-delafield-latin-400-normal.woff2', 400));
  return out.join('\n');
}

// Licensed brand fonts dropped into brand/fonts are used automatically.
function licensedFontCss(assetUrl) {
  const out = [];
  const add = (family, base, weight) => {
    for (const ext of ['woff2', 'woff', 'otf', 'ttf']) {
      const f = `fonts/${base}.${ext}`;
      if (fs.existsSync(path.join(BRAND_DIR, f))) {
        out.push(`@font-face{font-family:'${family}';src:url('${assetUrl(f)}');font-weight:${weight};font-display:block}`);
        return;
      }
    }
  };
  add('Geogrotesque', 'Geogrotesque-Thin', 200);
  add('Geogrotesque', 'Geogrotesque-Regular', 400);
  add('Geogrotesque', 'Geogrotesque-Medium', 500);
  add('Geogrotesque', 'Geogrotesque-SemiBold', 600);
  add('Geogrotesque', 'Geogrotesque-Bold', 700);
  add('Geogrotesque', 'Geogrotesque-Black', 800);
  add('Lumios Marker', 'LumiosMarker', 400);
  return out.join('\n');
}

const BASE_CSS = `
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#cfd5dc}
body{font-family:var(--body);color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
body.print{background:none}
body.screen .page{margin:10mm auto;box-shadow:0 8px 30px rgba(0,0,0,.2)}
.page{position:relative;width:210mm;height:297mm;overflow:hidden;background:#fff;font-size:10.5pt;line-height:1.5;break-after:page;page-break-after:always}
.page:last-of-type{break-after:auto;page-break-after:auto}
.ph{background-size:cover;background-position:center;background-repeat:no-repeat;background-color:var(--blue40)}
h1,h2,h3,.h{font-family:var(--head);line-height:.98;font-weight:800;letter-spacing:-.005em}
p{margin:0 0 .7em}
.fit{overflow:hidden;min-height:0}
.hl{font-family:var(--marker);font-weight:400;background:var(--yellow);color:var(--blue);padding:.02em .28em .06em;display:inline-block;line-height:1.05;letter-spacing:0;text-transform:none}
.logo{position:absolute;top:10mm;right:10mm;width:auto;z-index:20;max-width:48mm;object-fit:contain;object-position:right top}
/* Wide uploaded logos are contained in a box instead of overlapping headings */
.logo-sm{max-width:34mm}
.logo-box{height:35mm}
.logo-sm{height:18mm;top:9mm;right:10mm}
.ico{width:100%;height:100%}
.pf{position:absolute;left:12mm;right:12mm;bottom:7mm;display:flex;gap:4mm;align-items:center;font-family:var(--head);font-size:7.5pt;letter-spacing:.06em;text-transform:uppercase;z-index:10}
.pf b{font-size:10pt}
.pf span{flex:none}
.pf .pf-w{margin-left:auto}
.kicker{font-family:var(--head);font-weight:700;letter-spacing:.2em;text-transform:uppercase;font-size:9pt}
.dua .ar{font-family:var(--arabic);font-size:24pt;line-height:1.5;font-weight:700}
.dua .en{font-style:italic;opacity:.9}
.verse blockquote{font-family:var(--head);font-weight:600;font-size:15pt;line-height:1.2}
.verse figcaption{font-family:var(--head);font-weight:700;letter-spacing:.18em;text-transform:uppercase;font-size:8pt;margin-top:2mm}
.contact{font-size:8pt;line-height:1.55}
.contact .c-web{font-family:var(--head);font-weight:800;font-size:12pt;letter-spacing:.02em}
.contact .c-reg{opacity:.75;margin-top:1mm;font-size:7pt}
.sig{margin-top:5mm}
.sig-closing{font-style:italic}
.sig-script{font-family:var(--sig);font-size:34pt;line-height:1.15;margin:2mm 0 3.5mm;font-weight:400}
.sig-img{height:16mm;margin:1mm 0}
.sig-name{font-family:var(--head);font-weight:800;font-size:12pt;text-transform:uppercase;letter-spacing:.03em}
.sig-title{font-size:8.5pt;opacity:.8}
table.fin{width:100%;border-collapse:collapse;font-size:9pt}
.fin th{font-family:var(--head);font-size:8pt;letter-spacing:.12em;text-transform:uppercase;text-align:left;padding:0 0 1.6mm;border-bottom:.5mm solid currentColor}
.fin td{padding:2mm 0;border-bottom:.2mm solid rgba(0,0,0,.12);vertical-align:top}
.fin .r{text-align:right;white-space:nowrap;padding-left:3mm}
.fin tfoot td{font-family:var(--head);font-weight:800;font-size:11pt;border-bottom:0;border-top:.5mm solid currentColor}
.fin .sw{display:inline-block;width:2.6mm;height:2.6mm;border-radius:50%;margin-right:2mm;vertical-align:.2mm}
.fb{height:1.6mm;background:rgba(0,0,0,.08);border-radius:1mm;margin-top:1.2mm;overflow:hidden}
.fb span{display:block;height:100%}
.sw0{background:var(--blue)}.sw1{background:var(--teal)}.sw2{background:var(--green)}.sw3{background:var(--purple)}.sw4{background:var(--yellow)}.sw5{background:var(--blue60)}
.illus{font-size:6.5pt;opacity:.7;font-style:italic}
@media screen and (max-width:820px){body.screen .page{zoom:.46}}
`;

const FIT_SCRIPT = `<script>
(function(){
  function over(el){ return el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1; }
  function fit(el){
    var s = 100, g = 0;
    // Grow a little on sparse pages, then shrink until everything fits.
    var max = parseFloat(el.getAttribute('data-max') || '118');
    while (!over(el) && s < max && g++ < 30) { s += 3; el.style.fontSize = s + '%'; }
    while (over(el) && s > 55 && g++ < 90) { s -= 2; el.style.fontSize = s + '%'; }
  }
  // Headlines in fixed boxes: shrink the font until the text fits the box
  // height (data-h, in mm) and never spills sideways.
  function shrink(el){
    var h = parseFloat(el.getAttribute('data-h') || '0') * 3.7795, g = 0;
    var fs = parseFloat(getComputedStyle(el).fontSize);
    while (g++ < 40 && ((h && el.offsetHeight > h + 1) || el.scrollWidth > el.clientWidth + 1)) { fs *= 0.95; el.style.fontSize = fs + 'px'; }
  }
  function run(){ document.querySelectorAll('.shrink').forEach(shrink); document.querySelectorAll('.fit').forEach(fit); document.body.setAttribute('data-fitted','1'); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ setTimeout(run, 60); });
  else window.addEventListener('load', run);
})();
</script>`;

/** Arabic versions of the names and details printed on the report. */
function localise(ctx, report) {
  const st = getSettings();
  const loc = ctx.copy.locale || {};
  const ar = st.ar || {};
  ctx.ceo.name = ar.ceoName?.trim() || ctx.ceo.name;
  ctx.ceo.title = ar.ceoTitle?.trim() || ctx.ceo.title;
  ctx.donorName = loc.donorName?.trim() || ctx.donorName;
  ctx.givingType = loc.givingType?.trim() || givingTypeAr(ctx.givingType);
  ctx.place = loc.place?.trim() || ctx.place;
  ctx.period = loc.period?.trim() || arDates(ctx.period);
  (loc.budgetLabels || []).forEach((l, i) => { if (ctx.budget[i] && l?.trim()) ctx.budget[i].label = l.trim(); });
  if (ctx.donorName === 'Our valued supporter') ctx.donorName = 'داعمنا العزيز';
  if (ctx.givingType === 'Your gift') ctx.givingType = 'عطاؤك';
}

export function buildHtml(report, opts) {
  const style = getStyle(report.styleId);
  const lang = report.language === 'ar' ? 'ar' : 'en';
  const ctx = buildContext(report, opts);
  const plan = pagePlan(report.pages);
  // Arabic: the organisation's Arabic names are used while the pages are built.
  const ar = getSettings().ar || {};
  const saved = { orgName: brand.orgName, shortName: brand.shortName, tagline: brand.tagline };
  let pages;
  try {
    if (lang === 'ar') {
      localise(ctx, report);
      Object.assign(brand, { orgName: ar.orgName?.trim() || brand.orgName, shortName: ar.shortName?.trim() || ar.orgName?.trim() || brand.shortName, tagline: ar.tagline?.trim() || brand.tagline });
    }
    pages = plan.map((type, i) => style.pages[type](ctx, i + 1)).join('\n');
  } finally {
    Object.assign(brand, saved);
  }
  const rtl = lang === 'ar';
  if (rtl) pages = translateLabels(flipInline(pages));
  const c = brand.colors;
  const vars = `:root{--blue:${c.blue};--blue80:${c.blue80};--blue60:${c.blue60};--blue40:${c.blue40};--blue20:${c.blue20};--purple:${c.purple};--teal:${c.teal};--green:${c.green};--yellow:${c.yellow};--warm:${c.warmGrey};--ink:${c.ink};--grey:${c.grey};
    --head:${brand.fonts.heading};--body:${brand.fonts.body};--marker:${brand.fonts.marker};--arabic:${brand.fonts.arabic};--sig:${brand.fonts.signature};}`;
  return `<!doctype html>
<html lang="${lang}" dir="${rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(ctx.copy.cover.title)} – ${esc(ctx.donorName)}</title>
<style>${fontCss(opts.fontUrl)}
${licensedFontCss(opts.assetUrl)}
${rtl ? arabicFontCss(opts.fontUrl) : ''}
${vars}
${rtl ? flipCss(BASE_CSS + style.css) + AR_CSS : BASE_CSS + style.css}</style></head>
<body class="style-${style.id} ${opts.screen ? 'screen' : 'print'} lang-${lang}">
${pages}
${FIT_SCRIPT}
</body></html>`;
}
