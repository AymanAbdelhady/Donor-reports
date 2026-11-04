// Brand-coloured default artwork for organisations that haven't uploaded their
// own yet: a monogram logo (3 variants), a placeholder CEO portrait and a set
// of flat illustrations used as "library" images in reports.
//
// Everything is drawn as SVG/HTML and rendered by the same Chromium that makes
// the PDFs (so fonts are identical everywhere), then saved to DATA_DIR/assets,
// which is served in front of the bundled files in /brand. It is re-drawn
// whenever the organisation name or colours change.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
import { brand } from './brand.js';
import { ASSETS_DIR, BRAND_DIR, FONT_DIR } from './paths.js';

// ---------------- colour helpers ----------------
const hex = (h) => { const n = parseInt(String(h).slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));
const tint = (c, t) => mix(c, '#ffffff', t);
const shade = (c, t) => mix(c, '#000000', t);

export function initials(name) {
  const words = String(name || '').replace(/[^\p{L}\p{N}\s&-]/gu, ' ').split(/\s+/).filter((w) => w && !/^(the|of|and|for|&)$/i.test(w));
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || 'O').slice(0, 2)).toUpperCase();
}

// ---------------- logo ----------------
// A rising sun over a horizon: hopeful, sector-neutral, recognisable at small sizes.
const mark = (fg, accent) => `
  <g>
    <circle cx="100" cy="112" r="46" fill="${accent}"/>
    <rect x="30" y="112" width="140" height="70" fill="CUTOUT"/>
    <path d="M28 124 Q100 100 172 124" fill="none" stroke="${fg}" stroke-width="11" stroke-linecap="round"/>
    <path d="M44 146 Q100 128 156 146" fill="none" stroke="${fg}" stroke-width="11" stroke-linecap="round"/>
    <path d="M62 166 Q100 154 138 166" fill="none" stroke="${fg}" stroke-width="11" stroke-linecap="round"/>
    ${[-60, -30, 0, 30, 60].map((a) => { const r = (a - 90) * Math.PI / 180; return `<line x1="${100 + Math.cos(r) * 58}" y1="${112 + Math.sin(r) * 58}" x2="${100 + Math.cos(r) * 76}" y2="${112 + Math.sin(r) * 76}" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>`; }).join('')}
  </g>`;

function logoHtml(variant) {
  const c = brand.colors;
  const name = brand.shortName || brand.orgName;
  const words = name.toUpperCase().split(/\s+/);
  // Two balanced lines under the mark
  let l1 = words.join(' '), l2 = '';
  if (words.length > 1) {
    let best = 1, diff = 1e9;
    for (let i = 1; i < words.length; i++) { const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length); if (d < diff) { diff = d; best = i; } }
    l1 = words.slice(0, best).join(' '); l2 = words.slice(best).join(' ');
  }
  const fg = variant === 'colour' ? c.blue : '#ffffff';
  const accent = variant === 'colour' ? c.yellow === '#FFFFFF' ? c.blue : c.yellow : c.yellow;
  const bg = variant === 'box' ? c.blue : 'transparent';
  const cut = variant === 'box' ? c.blue : variant === 'colour' ? '#ffffff' : 'transparent';
  const svgMark = mark(fg, accent).replace('CUTOUT', cut === 'transparent' ? 'none' : cut);
  const longest = Math.max(l1.length, l2.length);
  const fs = Math.min(70, Math.round(600 / Math.max(longest, 6)));
  return `<div id="logo" style="width:400px;height:${variant === 'box' ? 520 : 480}px;background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border-radius:${variant === 'box' ? 10 : 0}px">
    <svg viewBox="20 30 160 150" width="250" height="234">${variant === 'white' || variant === 'box' ? svgMark.replace('fill="none"/>', 'fill="none"/>') : svgMark}</svg>
    <div style="font:800 ${fs}px/0.95 'Barlow Semi Condensed';letter-spacing:.02em;color:${fg};text-align:center;max-width:360px">${l1}${l2 ? `<br>${l2}` : ''}</div>
  </div>`;
}

// ---------------- CEO placeholder portrait ----------------
function ceoHtml() {
  const c = brand.colors;
  const ini = initials(brand.ceo.name);
  return `<div id="logo" style="width:800px;height:1000px;position:relative;overflow:hidden;background:linear-gradient(160deg,${tint(c.blue, 0.55)},${c.blue})">
    <svg viewBox="0 0 800 1000" width="800" height="1000" style="position:absolute;inset:0">
      <circle cx="400" cy="380" r="170" fill="${tint(c.blue, 0.82)}"/>
      <path d="M110 1000 C130 760 260 640 400 640 C540 640 670 760 690 1000 Z" fill="${tint(c.blue, 0.82)}"/>
      <circle cx="660" cy="150" r="70" fill="${c.yellow}" opacity=".9"/>
    </svg>
    <div style="position:absolute;left:0;right:0;top:300px;text-align:center;font:800 150px/1 'Barlow Semi Condensed';color:${c.blue}">${ini}</div>
  </div>`;
}

// ---------------- illustrations ----------------
// Flat, friendly scenes in the brand palette. Each is 2400x1600 with the
// subject centred so it crops well into tall and wide frames.
const W = 2400, H = 1600;
const person = (x, y, s, body, head, arm = 0) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-62 0 C-62 -95 -40 -150 0 -150 C40 -150 62 -95 62 0 Z" fill="${body}"/>
    ${arm ? `<path d="M-50 -110 L-110 ${-200 * arm}" stroke="${body}" stroke-width="30" stroke-linecap="round"/>` : ''}
    <circle cx="0" cy="-196" r="44" fill="${head}"/>
  </g>`;
const hills = (c, y = 1080) => `
  <path d="M0 ${y} C400 ${y - 160} 800 ${y - 120} 1200 ${y - 40} S2000 ${y - 220} 2400 ${y - 90} V1600 H0 Z" fill="${tint(c.green, 0.35)}"/>
  <path d="M0 ${y + 140} C500 ${y} 1100 ${y + 60} 1500 ${y + 110} S2200 ${y + 20} 2400 ${y + 70} V1600 H0 Z" fill="${c.green}"/>`;
const sky = (c, id, top = 0.86, bottom = 0.55) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tint(c.blue, top)}"/><stop offset="1" stop-color="${tint(c.blue, bottom)}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
const sun = (c, x, y, r) => `<circle cx="${x}" cy="${y}" r="${r * 1.5}" fill="${tint(c.yellow, 0.6)}" opacity=".6"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c.yellow}"/>`;
const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".85"><ellipse cx="0" cy="0" rx="120" ry="52"/><ellipse cx="80" cy="-30" rx="90" ry="62"/><ellipse cx="170" cy="0" rx="110" ry="48"/></g>`;
const skins = ['#8D5524', '#C68642', '#E0AC69', '#5C3A21', '#A0662F', '#F1C27D'];

const SCENES = {
  community: { tags: ['general', 'community', 'children', 'women'], alt: 'A community standing together', altAr: 'مجتمع يقف معاً', svg: (c) => `${sky(c, 'g1')}${sun(c, 1700, 520, 170)}${cloud(380, 330, 1.2)}${cloud(1900, 260, 0.9)}${hills(c)}
    ${[[760, 1290, 1.25, c.purple, 1], [960, 1250, 1.45, c.blue, 0], [1180, 1280, 1.3, c.teal, 0], [1400, 1250, 1.45, c.purple, 0], [1610, 1290, 1.2, c.blue, 1.05]].map(([x, y, s, b, a], i) => person(x, y, s, b, skins[i], a)).join('')}` },
  water: { tags: ['water', 'health', 'general'], alt: 'Clean water flowing through a village', altAr: 'مياه نظيفة تتدفق إلى القرية', svg: (c) => `${sky(c, 'g2', 0.88, 0.6)}${sun(c, 600, 480, 150)}${cloud(1500, 300, 1.1)}${hills(c, 1000)}
    <path d="M1300 1600 C1250 1400 1500 1260 1380 1100 C1300 1000 1460 960 1500 900" fill="none" stroke="${tint(c.blue, 0.2)}" stroke-width="150" stroke-linecap="round"/>
    <path d="M1300 1600 C1250 1400 1500 1260 1380 1100" fill="none" stroke="#fff" stroke-width="18" stroke-dasharray="60 60" opacity=".7"/>
    <g transform="translate(820 1180)"><path d="M0 -330 C120 -170 190 -70 190 30 A190 190 0 0 1 -190 30 C-190 -70 -120 -170 0 -330 Z" fill="${c.blue}"/><path d="M-90 40 A95 95 0 0 0 0 125" fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round"/></g>
    ${person(1880, 1360, 1.3, c.purple, skins[2])}${person(2080, 1380, 1.0, c.teal, skins[0])}` },
  education: { tags: ['education', 'children', 'orphans'], alt: 'Learning opens new doors', altAr: 'التعلّم يفتح الأبواب', svg: (c) => `${sky(c, 'g3', 0.9, 0.7)}${sun(c, 1200, 560, 230)}
    ${[-50, -25, 0, 25, 50].map((a) => { const r = (a - 90) * Math.PI / 180; return `<line x1="${1200 + Math.cos(r) * 330}" y1="${560 + Math.sin(r) * 330}" x2="${1200 + Math.cos(r) * 470}" y2="${560 + Math.sin(r) * 470}" stroke="${c.yellow}" stroke-width="34" stroke-linecap="round"/>`; }).join('')}
    <rect y="1100" width="${W}" height="500" fill="${c.teal}"/>
    <g transform="translate(1200 1180)"><path d="M0 0 C-260 -90 -520 -60 -640 0 V360 C-520 300 -260 280 0 360 Z" fill="#fff"/><path d="M0 0 C260 -90 520 -60 640 0 V360 C520 300 260 280 0 360 Z" fill="${tint(c.blue, 0.85)}"/>
      ${[60, 120, 180, 240].map((y) => `<path d="M-560 ${y + 10} C-400 ${y - 30} -200 ${y - 20} -60 ${y + 20}" stroke="${tint(c.blue, 0.5)}" stroke-width="14" fill="none"/><path d="M60 ${y + 20} C200 ${y - 20} 400 ${y - 30} 560 ${y + 10}" stroke="${tint(c.blue, 0.45)}" stroke-width="14" fill="none"/>`).join('')}
      <line x1="0" y1="0" x2="0" y2="360" stroke="${c.blue}" stroke-width="16"/></g>
    ${person(420, 1420, 1.5, c.purple, skins[3], 1)}${person(1980, 1420, 1.5, c.blue, skins[4], 1.1)}` },
  health: { tags: ['health', 'emergency', 'general'], alt: 'Care that heals', altAr: 'رعاية تشفي', svg: (c) => `${sky(c, 'g4', 0.92, 0.75)}
    <circle cx="1200" cy="800" r="560" fill="${tint(c.teal, 0.7)}"/>
    <path d="M1200 1180 C900 980 760 820 760 660 A220 220 0 0 1 1200 560 A220 220 0 0 1 1640 660 C1640 820 1500 980 1200 1180 Z" fill="${c.purple}"/>
    <rect x="1130" y="600" width="140" height="380" rx="20" fill="#fff"/><rect x="1010" y="720" width="380" height="140" rx="20" fill="#fff"/>
    ${hills(c, 1250)}${person(500, 1480, 1.3, c.blue, skins[1])}${person(1900, 1480, 1.3, c.teal, skins[5])}` },
  home: { tags: ['shelter', 'winter', 'emergency', 'general'], alt: 'Safe homes for families', altAr: 'بيوت آمنة للأسر', svg: (c) => `${sky(c, 'g5', 0.75, 0.4)}${sun(c, 1900, 420, 120)}${cloud(600, 320, 1)}${hills(c, 1050)}
    ${[[620, 1000, 1, c.purple], [1180, 930, 1.25, c.blue], [1760, 1010, 0.95, c.teal]].map(([x, y, s, col]) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-200" y="0" width="400" height="300" fill="${col}"/><path d="M-250 10 L0 -220 L250 10 Z" fill="${shade(col, 0.25)}"/><rect x="-55" y="140" width="110" height="160" fill="${tint(c.yellow, 0.2)}"/><rect x="-160" y="60" width="80" height="80" fill="${c.yellow}"/><rect x="80" y="60" width="80" height="80" fill="${c.yellow}"/></g>`).join('')}
    ${person(940, 1450, 1.1, c.blue, skins[0])}${person(1460, 1460, 1.0, c.purple, skins[2])}` },
  growth: { tags: ['food', 'livelihoods', 'environment', 'general'], alt: 'Growing food and livelihoods', altAr: 'زراعة الغذاء وسبل العيش', svg: (c) => `${sky(c, 'g6', 0.85, 0.6)}${sun(c, 1200, 620, 260)}
    <path d="M0 980 C600 900 1800 900 2400 980 V1600 H0 Z" fill="${shade(c.green, 0.1)}"/>
    ${[1060, 1200, 1350, 1520].map((y, i) => `<path d="M0 ${y} C700 ${y - 60} 1700 ${y - 60} 2400 ${y}" stroke="${tint(c.green, 0.25 + i * 0.1)}" stroke-width="${26 + i * 8}" fill="none"/>`).join('')}
    ${Array.from({ length: 9 }, (_, i) => { const x = 300 + i * 225, y = 1290 + (i % 2) * 40; return `<g transform="translate(${x} ${y})"><line x1="0" y1="0" x2="0" y2="-150" stroke="${shade(c.green, 0.3)}" stroke-width="14"/><path d="M0 -110 C-90 -150 -120 -230 -60 -250 C-10 -210 0 -160 0 -110Z" fill="${c.green}"/><path d="M0 -140 C90 -180 120 -260 60 -280 C10 -240 0 -190 0 -140Z" fill="${tint(c.green, 0.2)}"/></g>`; }).join('')}
    ${person(1200, 1560, 1.4, c.purple, skins[3], 1.1)}` },
  together: { tags: ['general', 'food', 'community', 'ramadan'], alt: 'People coming together in support', altAr: 'أناس يجتمعون للدعم', svg: (c) => `<rect width="${W}" height="${H}" fill="${c.blue}"/>
    ${[[380, 300, 240, c.purple], [2050, 360, 200, c.teal], [260, 1380, 200, c.green], [2140, 1320, 250, c.purple]].map(([x, y, r, col]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity=".55"/>`).join('')}
    <circle cx="1200" cy="900" r="560" fill="${tint(c.blue, 0.18)}"/>
    <circle cx="1200" cy="900" r="420" fill="${tint(c.blue, 0.32)}"/>
    <path d="M1200 640 C1060 520 900 570 900 700 C900 810 1050 900 1200 1000 C1350 900 1500 810 1500 700 C1500 570 1340 520 1200 640 Z" fill="${c.yellow}"/>
    ${[[700, 1520, 1.35, c.purple], [930, 1500, 1.5, c.teal], [1200, 1520, 1.6, '#ffffff'], [1470, 1500, 1.5, c.green], [1700, 1520, 1.35, c.purple]].map(([x, y, sc, col], i) => person(x, y, sc, col, skins[(i + 1) % 6], i === 0 || i === 4 ? 1 : 0)).join('')}` },
  city: { tags: ['community', 'general', 'education'], alt: 'Stronger neighbourhoods', altAr: 'أحياء أقوى', svg: (c) => `${sky(c, 'g8', 0.9, 0.65)}${sun(c, 700, 520, 160)}${cloud(1700, 330, 1.1)}
    ${[[200, 560, c.purple], [460, 420, c.blue], [720, 640, c.teal], [980, 360, shade(c.blue, 0.15)], [1240, 520, c.purple], [1500, 300, c.blue], [1760, 600, c.teal], [2020, 440, shade(c.purple, 0.1)]].map(([x, h, col]) => `<rect x="${x}" y="${1200 - h}" width="230" height="${h}" fill="${col}"/>${Array.from({ length: Math.floor(h / 110) }, (_, r) => `<rect x="${x + 40}" y="${1200 - h + 40 + r * 110}" width="50" height="60" fill="${tint(c.yellow, 0.3)}"/><rect x="${x + 140}" y="${1200 - h + 40 + r * 110}" width="50" height="60" fill="${tint(c.yellow, 0.3)}"/>`).join('')}`).join('')}
    <rect y="1200" width="${W}" height="400" fill="${c.green}"/>
    ${[300, 900, 1500, 2100].map((x) => `<g transform="translate(${x} 1260)"><rect x="-14" y="0" width="28" height="140" fill="${shade(c.green, 0.4)}"/><circle cx="0" cy="-20" r="90" fill="${shade(c.green, 0.15)}"/></g>`).join('')}
    ${person(1150, 1560, 1.2, c.blue, skins[1])}${person(1340, 1560, 1.0, c.purple, skins[5])}` },
};

export const LIBRARY = Object.entries(SCENES).map(([key, s]) => ({ file: `illustration-${key}.jpg`, tags: s.tags, alt: s.alt, altAr: s.altAr, width: W, height: H, illustration: true }));

// ---------------- rendering ----------------
// Embedded as data URIs: a page set with setContent() can't read file:// fonts.
const fontCss = () => {
  const f = (w) => fs.readFileSync(path.join(FONT_DIR, `barlow-semi-condensed/files/barlow-semi-condensed-latin-${w}-normal.woff2`)).toString('base64');
  return `@font-face{font-family:'Barlow Semi Condensed';src:url(data:font/woff2;base64,${f(800)}) format('woff2');font-weight:800}`;
};
const page = (body) => `<!doctype html><html><head><style>${fontCss()}html,body{margin:0;background:transparent}</style></head><body>${body}</body></html>`;

async function renderAll(outDir) {
  fs.mkdirSync(path.join(outDir, 'library'), { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox', '--allow-file-access-from-files'] });
  try {
    const p = await browser.newPage({ deviceScaleFactor: 2 });
    for (const v of ['box', 'colour', 'white']) {
      await p.setContent(page(logoHtml(v)), { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      await (await p.$('#logo')).screenshot({ path: path.join(outDir, v === 'box' ? 'logo-box.png' : v === 'colour' ? 'logo.png' : 'logo-white.png'), omitBackground: true });
    }
    await p.setContent(page(ceoHtml()), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await (await p.$('#logo')).screenshot({ path: path.join(outDir, 'ceo-photo.jpg'), type: 'jpeg', quality: 90 });
    const q = await browser.newPage({ viewport: { width: W, height: H } });
    for (const [key, s] of Object.entries(SCENES)) {
      await q.setContent(`<!doctype html><html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s.svg(brand.colors)}</svg></body></html>`);
      await q.screenshot({ path: path.join(outDir, 'library', `illustration-${key}.jpg`), type: 'jpeg', quality: 88 });
    }
    fs.writeFileSync(path.join(outDir, 'library', 'library.json'), JSON.stringify(LIBRARY, null, 1));
  } finally {
    await browser.close();
  }
}

const signature = () => crypto.createHash('sha1').update(JSON.stringify([brand.orgName, brand.shortName, brand.ceo.name, brand.colors])).digest('hex').slice(0, 12);

/** Re-draw the default artwork if the name or colours changed. */
export async function refreshGeneratedAssets({ force = false } = {}) {
  const stamp = path.join(ASSETS_DIR, 'generated.json');
  const sig = signature();
  try {
    if (!force && JSON.parse(fs.readFileSync(stamp, 'utf8')).sig === sig) return false;
  } catch {}
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  await renderAll(ASSETS_DIR);
  fs.writeFileSync(stamp, JSON.stringify({ sig, at: new Date().toISOString() }));
  return true;
}

/** Bundled defaults in /brand (run by scripts/build-assets.js). */
export const buildBundledAssets = () => renderAll(BRAND_DIR);
