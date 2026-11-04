// Shared parts for the Poster, Mosaic and Journey styles (all built from the
// same design system: 14mm margins, footer strip, labelled contact grid).
import { brand } from '../../brand.js';
import { esc, bg, real } from '../helpers.js';

export const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22')}")`;

export const logoImg = (ctx, variant, big = false, cls = '') =>
  `<img class="logo ${big ? 'logo-box' : 'logo-sm'} ${cls}" src="${ctx.logos[variant]}" alt="${esc(brand.orgName)}">`;

export const foot = (ctx, n, { cls = '', style = '', page } = {}) =>
  `<footer class="footer ${cls}"${style ? ` style="${style}"` : ''}><span class="footer-page">${page ? page(n) : String(n).padStart(2, '0')}</span><span class="footer-title">${esc(brand.orgName)} · ${esc(ctx.copy.cover.kicker)}</span><span class="footer-web">${esc(brand.website)}</span></footer>`;

export const capText = (img) => (img?.caption ? `${esc(img.caption)}${img.illustrative ? ' (illustrative)' : ''}` : '');

/** Photo element; `style` is extra inline CSS (positions). */
export const photo = (img, cls = '', style = '', pos = 'center 40%', inner = '', tag = 'div') =>
  `<${tag} class="ph ${cls}" ${bg(img?.url, pos).replace('style="', `style="${style}`)}>${inner}</${tag}>`;

export function contact(style = '') {
  const items = [['Web', brand.website], ['Email', brand.email], ['Phone', real(brand.phone)], ['Social', brand.socials]].filter((x) => x[1]);
  return `<div class="contact"${style ? ` style="${style}"` : ''}>${items.map(([l, v]) => `<div><span class="contact-label">${l}</span><span class="contact-value">${esc(v)}</span></div>`).join('')}${real(brand.registration) ? `<div class="contact-reg"><span class="contact-label">Registered</span><span class="contact-value">${esc(brand.registration)}</span></div>` : ''}</div>`;
}

export const sigBlock = (ctx, cls = '') => `<div class="letter-sign ${cls}">
  <div class="letter-closing">${esc(ctx.copy.ceoLetter.closing)}</div>
  ${ctx.ceo.signature ? `<img class="letter-sig-img" src="${ctx.ceo.signature}" alt="">` : `<div class="letter-signature">${esc(ctx.ceo.name)}</div>`}
  <div class="letter-name">${esc(ctx.ceo.name)}</div>
  <div class="letter-title">${esc(ctx.ceo.title)}, ${esc(brand.orgName)}</div>
</div>`;

/** Gift year from the reporting period, if any. */
export const yearOf = (ctx) => (String(ctx.period).match(/\b(20\d\d)\b(?!.*\b20\d\d\b)/) || [])[1] || '';

/** Split spending into `n` tiles with largest-remainder rounding. */
export function tilesFor(budget, total, n = 20) {
  const raw = budget.map((b) => (b.amount / total) * n);
  const out = raw.map(Math.floor);
  let left = n - out.reduce((a, b) => a + b, 0);
  raw.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left-- > 0) out[i]++; });
  return out;
}

export const baseCss = (s) => `
.${s}{font-size:10pt;line-height:1.45;color:var(--ink)}
.${s} p{margin:0 0 2.6mm}.${s} p:last-child{margin-bottom:0}
.${s} .abs{position:absolute}
.${s} .ph{position:absolute;overflow:hidden;background-size:cover}
.${s} .ico{display:block;width:100%;height:100%}
.${s} .ar{font-family:var(--arabic)}
.${s} .footer{position:absolute;left:14mm;right:14mm;bottom:8mm;display:flex;gap:5mm;align-items:baseline;font:600 7.5pt/1 var(--head);letter-spacing:.05em;color:var(--grey);z-index:4}
.${s} .footer-page{font-weight:800;color:var(--blue);font-size:9pt}
.${s} .footer-title{flex:1}
.${s} .letter-closing{font-style:italic;color:var(--grey)}
.${s} .letter-signature{font:400 38pt/1.15 var(--sig);color:var(--blue);margin:0 0 2.5mm -2mm}
.${s} .letter-sig-img{height:16mm;margin:1mm 0;display:block}
.${s} .letter-name{font:800 13pt var(--head);text-transform:uppercase;letter-spacing:.02em}
.${s} .letter-title{font-size:8.5pt;color:var(--grey)}
.${s} .contact{position:absolute;left:14mm;width:182mm;display:grid;grid-template-columns:repeat(4,auto);gap:2.5mm 7mm;font-size:inherit;line-height:1.3}
.${s} .contact-label{display:block;font:700 6.8pt var(--head);letter-spacing:.14em;text-transform:uppercase;opacity:.8}
.${s} .contact-value{display:block;font:700 9.5pt/1.3 var(--head)}
.${s} .contact-reg{grid-column:1/-1}
.${s} .contact-reg .contact-value{font-weight:600}
`;
