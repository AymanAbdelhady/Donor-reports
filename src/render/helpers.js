// Shared building blocks for all report styles.
import { brand } from '../brand.js';

export const C = brand.colors;

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const paras = (arr, cls = '') => (arr || []).filter(Boolean).map((p) => `<p${cls ? ` class="${cls}"` : ''}>${esc(p)}</p>`).join('');

export const toNum = (v) => Number(String(v ?? '').replace(/[^\d.\-]/g, '')) || 0;

export const rand = (n) => {
  const v = toNum(n);
  return v ? `${brand.currency || 'R'} ` + Math.round(v).toLocaleString('en-ZA').replace(/[,\s ]/g, ' ') : '';
};

/** Background image style for a photo element (with a soft brand-blue fallback). */
export const bg = (url, pos = 'center') =>
  url ? `style="background-image:url('${url}');background-position:${pos}"` : `style="background:${C.blue40}"`;

/** Line icons (24x24, stroke). */
const ICON_PATHS = {
  water: '<path d="M12 3c3.5 4.5 6 7.8 6 11a6 6 0 0 1-12 0c0-3.2 2.5-6.5 6-11z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  food: '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M8 7c0-1.5 1-2 1-3M12 7c0-1.5 1-2 1-3M16 7c0-1.5 1-2 1-3"/>',
  education: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/><path d="M22 9v6"/>',
  health: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M12 9v5M9.5 11.5h5"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  heart: '<path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.4 12 20 12 20z"/>',
  hands: '<path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12"/><path d="M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-2.5-4.5a1.5 1.5 0 0 1 2.6-1.5L7 13.5"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 12c0-4 3-6 7-6 0 4-3 6-7 6zM12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5z"/>',
  family: '<circle cx="8" cy="6" r="2.5"/><circle cx="16" cy="6" r="2.5"/><circle cx="12" cy="12" r="2"/><path d="M4 21v-6a4 4 0 0 1 8 0M12 21v-4M20 21v-6a4 4 0 0 0-8 0"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9c-2-4-6-4-6-1.5S10 9 12 9c2 0 6 0 6-1.5S14 5 12 9z"/>',
};
export const icon = (name, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] || ICON_PATHS.heart}</svg>`;

/**
 * Brand texture: a flat colour field with large circles/arcs filled with fine
 * parallel lines (Brand Book "Patterns/Textures"), returned as a CSS url().
 */
export function texture({ base = C.blue, ink = '#000', opacity = 0.1, circles = [[0.15, 0.3, 0.55], [1, 0.95, 0.75]], w = 800, h = 1131, angle = 82, gap = 5 }) {
  const id = 'l' + Math.random().toString(36).slice(2, 7);
  const cs = circles.map(([x, y, r], i) => `<circle cx="${x * w}" cy="${y * h}" r="${r * w}" fill="url(#${id}${i % 2})"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <pattern id="${id}0" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><line x1="0" y1="0" x2="0" y2="${gap}" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="1.3"/></pattern>
    <pattern id="${id}1" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle - 35})"><line x1="0" y1="0" x2="0" y2="${gap}" stroke="${ink}" stroke-opacity="${opacity * 0.9}" stroke-width="1.1"/></pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="${base}"/>${cs}</svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
}

/** Raindrop + line pattern (Brand Book social example). */
export function raindrops({ base = C.blue, ink = '#fff', opacity = 0.35 } = {}) {
  const drop = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z" fill="none" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="1.4"/>`;
  const line = (x, y, l) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + l}" stroke="${ink}" stroke-opacity="${opacity * 0.8}" stroke-width="1.4" stroke-linecap="round"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160"><rect width="120" height="160" fill="${base}"/>${line(10, 10, 40)}${drop(40, 30)}${line(70, 0, 55)}${drop(100, 70, 0.8)}${line(25, 80, 50)}${drop(60, 110)}${line(95, 105, 45)}${drop(12, 140, 0.7)}</svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
}

export const marker = (text, cls = '') => (text ? `<span class="hl ${cls}">${esc(text)}</span>` : '');

export function donut(rows, total, colors, size = 100) {
  const R = 38;
  const Cc = 2 * Math.PI * R;
  let acc = 0;
  const segs = rows
    .map((r, i) => {
      const f = total ? r.amount / total : 0;
      const s = `<circle r="${R}" cx="50" cy="50" fill="none" stroke="${colors[i % colors.length]}" stroke-width="20" stroke-dasharray="${(f * Cc).toFixed(2)} ${Cc.toFixed(2)}" stroke-dashoffset="${(-acc * Cc).toFixed(2)}" transform="rotate(-90 50 50)"/>`;
      acc += f;
      return s;
    })
    .join('');
  return `<svg class="donut" viewBox="0 0 100 100" width="${size}" height="${size}">${segs}</svg>`;
}

/** Contact details still holding placeholder numbers ("000 0000") are left off reports. */
export const real = (v) => {
  const t = String(v ?? '').trim();
  if (!t) return '';
  const digits = t.replace(/^\+?\s*27/, '').replace(/\D/g, '');
  return digits.length && !/[1-9]/.test(digits) ? '' : t;
};
const joinDot = (...a) => a.filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ');

export const contactBlock = (b = brand) => `
  <div class="contact">
    <div class="c-web">${esc(b.website)}</div>
    <div>${joinDot(b.email, real(b.phone))}</div>
    <div>${joinDot(b.socials, b.address)}</div>
    ${real(b.registration) ? `<div class="c-reg">${esc(b.registration)}</div>` : ''}
  </div>`;

export const duaBlock = (ctx) =>
  ctx.copy.thankYou.duaArabic
    ? `<div class="dua"><div class="ar" dir="auto">${esc(ctx.copy.thankYou.duaArabic)}</div><div class="en">${esc(ctx.copy.thankYou.duaEnglish)}</div></div>`
    : '';

export const verseBlock = (ctx, cls = '') => `<figure class="verse ${cls}"><blockquote>“${esc(ctx.verse.text)}”</blockquote><figcaption>${esc(ctx.verse.ref)}</figcaption></figure>`;

export const signature = (ctx) => `
  <div class="sig">
    <div class="sig-closing">${esc(ctx.copy.ceoLetter.closing)}</div>
    ${ctx.ceo.signature ? `<img class="sig-img" src="${ctx.ceo.signature}" alt="">` : `<div class="sig-script">${esc(ctx.ceo.name)}</div>`}
    <div class="sig-name">${esc(ctx.ceo.name)}</div>
    <div class="sig-title">${esc(ctx.ceo.title)}, ${esc(brand.orgName)}</div>
  </div>`;

export const footer = (ctx, n, cls = '') =>
  `<footer class="pf ${cls}"><b>${String(n).padStart(2, '0')}</b><span>${esc(brand.orgName)} · ${esc(ctx.copy.cover.kicker)}</span><span class="pf-w">${esc(brand.website)}</span></footer>`;

/** Logo: brand book asks for top-right placement, 10mm margin, never tinted. */
export const logo = (ctx, variant = 'box', cls = '') => `<img class="logo logo-${variant} ${cls}" src="${ctx.logos[variant]}" alt="${esc(brand.orgName)}">`;

export function statsOrNothing(ctx, max = 4) {
  return (ctx.copy.impact.stats || []).filter((s) => s.value && s.label).slice(0, max);
}

export function budgetTable(ctx, { bars = true } = {}) {
  const rows = ctx.budget;
  if (!rows.length) return '';
  const total = ctx.budgetTotal;
  return `<table class="fin"><thead><tr><th>Area of spend</th><th class="r">Amount</th><th class="r">%</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr><td><i class="sw sw${i % 6}"></i>${esc(r.label)}${bars ? `<div class="fb"><span class="sw${i % 6}" style="width:${((r.amount / total) * 100).toFixed(1)}%"></span></div>` : ''}</td><td class="r">${rand(r.amount)}</td><td class="r">${Math.round((r.amount / total) * 100)}%</td></tr>`).join('')}
    </tbody><tfoot><tr><td>Total</td><td class="r">${rand(total)}</td><td class="r">100%</td></tr></tfoot></table>`;
}

/** Fine diagonal line texture (Brand Book "simple textured lines"). */
export function lines({ base = C.teal, ink = '#fff', opacity = 0.18, angle = 45, gap = 7, width = 1.1 } = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><pattern id="d" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><line x1="0" y1="0" x2="0" y2="${gap}" stroke="${ink}" stroke-opacity="${opacity}" stroke-width="${width}"/></pattern></defs><rect width="200" height="200" fill="${base}"/><rect width="200" height="200" fill="url(#d)"/></svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
}

/** Sunburst and sparkles line art (celebration accents). */
export const crescent = (color = C.yellow, cls = '') =>
  `<svg class="${cls}" viewBox="0 0 120 100" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="54" cy="52" r="20"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = (a * Math.PI) / 180; return `<line x1="${(54 + Math.cos(r) * 28).toFixed(1)}" y1="${(52 + Math.sin(r) * 28).toFixed(1)}" x2="${(54 + Math.cos(r) * 40).toFixed(1)}" y2="${(52 + Math.sin(r) * 40).toFixed(1)}"/>`; }).join('')}<path d="M100 14l2.6 6.4 6.4 2.6-6.4 2.6L100 32l-2.6-6.4-6.4-2.6 6.4-2.6z"/><path d="M108 58l1.6 3.8 3.8 1.6-3.8 1.6-1.6 3.8-1.6-3.8-3.8-1.6 3.8-1.6z"/><circle cx="92" cy="48" r="1.6" fill="${color}"/></svg>`;

/** Simple derived metric: cost per person reached, when both figures are known. */
export function perPerson(ctx) {
  const people = toNum(ctx.brief.project?.beneficiaries);
  if (!people || !ctx.amountNum) return null;
  const v = ctx.amountNum / people;
  return v >= 1 ? rand(v) : null;
}
