// STYLE 7: "Poster". Big, confident capitals on two solid blocks of brand
// colour, like a campaign poster on every page. Each page is split by one hard
// edge; the last words of each headline switch to yellow (or blue on light
// blocks); the brand's fine diagonal line texture marks one corner of a block.
import { brand } from '../../brand.js';
import { esc, paras, bg, icon, statsOrNothing, rand, real } from '../helpers.js';

const sec = (cls, inner) => `<section class="page p ${cls}">${inner}</section>`;

/** Stacked headline with the last 1–2 words emphasised. */
export function stack(text, { cls = '', style = '', alt = '', tag = 'h2', h = 0 } = {}) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const k = words.length >= 4 ? 2 : words.length >= 2 ? 1 : 0;
  const head = esc(words.slice(0, words.length - k).join(' '));
  const tail = esc(words.slice(words.length - k).join(' '));
  const span = tail ? ` <span class="alt"${alt ? ` style="color:${alt}"` : ''}>${tail}</span>` : '';
  return `<${tag} class="stack shrink ${cls}"${h ? ` data-h="${h}"` : ''}${style ? ` style="${style}"` : ''}>${head}${span}</${tag}>`;
}

const logo = (ctx, dark, big = false) => `<img class="logo ${big ? 'logo-box' : 'logo-sm'}" src="${dark ? ctx.logos.white : ctx.logos.box}" alt="${esc(brand.orgName)}">`;
const foot = (ctx, n, cls = '', style = '') =>
  `<footer class="footer ${cls}"${style ? ` style="${style}"` : ''}><span class="footer-page">${String(n).padStart(2, '0')}</span><span class="footer-title">${esc(brand.orgName)} · ${esc(ctx.copy.cover.kicker)}</span><span class="footer-web">${esc(brand.website)}</span></footer>`;
const cap = (img, style) => (img?.caption ? `<div class="cap" style="${style}">${esc(img.caption)}${img.illustrative ? ' (illustrative)' : ''}</div>` : '');
const photo = (img, cls, style = '', pos = 'center 40%') => `<div class="ph ${cls}" ${bg(img?.url, pos).replace('style="', `style="${style}`)}></div>`;

const supports = (ctx, style = '') =>
  `<div class="supports"${style ? ` style="${style}"` : ''}>${(ctx.copy.money.supports || []).slice(0, 3).map((s) => `<div class="support"><div class="ico-sq">${icon(s.icon)}</div><h3 class="support-title">${esc(s.title)}</h3><p class="support-text">${esc(s.text)}</p></div>`).join('')}</div>`;

const contact = (style = '') => {
  const items = [['Web', brand.website], ['Email', brand.email], ['Phone', real(brand.phone)], ['Social', brand.socials]].filter((x) => x[1]);
  return `<div class="contact"${style ? ` style="${style}"` : ''}>${items.map(([l, v]) => `<div><span class="contact-label">${l}</span><span class="contact-value">${esc(v)}</span></div>`).join('')}${real(brand.registration) ? `<div class="contact-reg"><span class="contact-label">Registered</span><span class="contact-value">${esc(brand.registration)}</span></div>` : ''}</div>`;
};

const dua = (ctx, style = '', block = false) => {
  const t = ctx.copy.thankYou;
  if (!t.duaArabic) return '';
  return `<div class="abs dua-line${block ? ' block' : ''}" style="${style}"><span class="dua-ar ar" dir="auto">${esc(t.duaArabic)}</span>${t.duaEnglish ? `<span class="dua-en">${esc(t.duaEnglish)}</span>` : ''}</div>`;
};

const statsGrid = (st, { style = '', small = false } = {}) =>
  `<div class="stats n${st.length}${small ? ' small' : ''}"${style ? ` style="${style}"` : ''}>${st.map((s) => `<div class="stat"><div class="stat-value shrink">${esc(s.value)}</div><div class="stat-label">${esc(s.label)}</div></div>`).join('')}</div>`;

const BAND = [
  { cls: 'bg-yellow on-light', ink: 'var(--ink)', alt: 'var(--blue)', ico: 'var(--blue)' },
  { cls: 'bg-teal on-light', ink: 'var(--ink)', alt: 'var(--purple)', ico: 'var(--ink)' },
  { cls: 'bg-purple', ink: '#fff', alt: 'var(--yellow)', ico: 'var(--yellow)' },
];
const CAPS = ['bg-blue', 'bg-yellow', 'bg-purple', 'bg-teal'];
const BARS = ['var(--blue)', 'var(--teal)', 'var(--purple)', 'var(--green)', 'var(--blue60)', 'var(--yellow)'];

const pages = {
  cover: (ctx) => {
    const c = ctx.copy.cover;
    const meta = [ctx.period, ctx.place].filter(Boolean).join(' · ');
    return sec(
      'cover',
      `<div class="blk bg-blue" style="left:0;top:0;width:210mm;height:158mm"></div>
      <div class="lines" style="left:150mm;top:70mm;width:60mm;height:88mm"></div>
      ${logo(ctx, true, true)}
      <div class="kicker" style="color:#fff">${esc(c.kicker)}</div>
      ${stack(c.title, { tag: 'h1', cls: 'cover-title', style: 'color:#fff', h: 54 })}
      <div class="cover-subtitle" style="color:#fff">${esc(c.subtitle)}</div>
      ${photo(ctx.cover, 'cover-photo')}
      <div class="cover-thanks">${esc(c.highlight || 'Thank you')}</div>
      <div class="cover-for"><div class="cover-for-label">Prepared for</div><div class="cover-donor shrink" data-h="12">${esc(ctx.donorName)}</div>${meta ? `<div class="cover-period">${esc(meta)}</div>` : ''}</div>`
    );
  },

  letter: (ctx, n) => {
    const l = ctx.copy.ceoLetter;
    return sec(
      'letter',
      `<div class="blk bg-yellow" style="left:0;top:0;width:72mm;height:297mm"></div>
      <div class="lines dark" style="left:0;top:110mm;width:72mm;height:70mm"></div>
      ${logo(ctx, false)}
      <div class="kicker" style="width:50mm;color:var(--ink)">A message from our CEO</div>
      <h2 class="stack letter-heading">Thank <span>you</span></h2>
      <div class="rule" style="left:14mm;top:78mm;background:var(--blue)"></div>
      ${ctx.ceo.photo ? photo({ url: ctx.ceo.photo }, 'ceo-photo', '', '58% 25%') : ''}
      <div class="letter-salutation">${esc(l.salutation)}</div>
      <div class="letter-col">
        <div class="letter-body fit" data-max="132">${paras(l.paragraphs)}</div>
        <div class="letter-sign">
          <div class="letter-closing">${esc(l.closing)}</div>
          ${ctx.ceo.signature ? `<img class="letter-sig-img" src="${ctx.ceo.signature}" alt="">` : `<div class="letter-signature">${esc(ctx.ceo.name)}</div>`}
          <div class="letter-name">${esc(ctx.ceo.name)}</div>
          <div class="letter-title">${esc(ctx.ceo.title)}, ${esc(brand.orgName)}</div>
        </div>
      </div>
      ${foot(ctx, n, '', 'color:var(--ink)')}`
    );
  },

  project: (ctx, n) => {
    const p = ctx.copy.project;
    const facts = (p.keyFacts || []).filter((f) => f.label && f.value).slice(0, 5);
    return sec(
      'project',
      `${photo(ctx.projectImg, 'project-photo', 'left:0;top:0;width:210mm;height:132mm;')}
      ${logo(ctx, true)}
      ${cap(ctx.projectImg, 'left:14mm;top:124mm')}
      <dl class="facts bg-purple">${facts.map((f) => `<div class="fact"><dt class="fact-label">${esc(f.label)}</dt><dd class="fact-value${/people|reached|beneficiar|famil/i.test(f.label) ? ' hi' : ''}">${esc(f.value)}</dd></div>`).join('')}</dl>
      <div class="lines" style="left:132mm;top:250mm;width:78mm;height:28mm"></div>
      <div class="kicker" style="top:140mm;color:var(--grey)">The project</div>
      ${stack(p.heading, { cls: 'project-heading', style: 'top:147mm', alt: 'var(--purple)', h: 30 })}
      <div class="project-lead">${esc(p.lead)}</div>
      <div class="project-body fit" data-max="112">${paras(p.paragraphs)}</div>
      ${foot(ctx, n)}`
    );
  },

  impact: (ctx, n) => {
    const im = ctx.copy.impact;
    const st = statsOrNothing(ctx, 4);
    const pil = (im.pillars || []).slice(0, 3);
    if (st.length < 2) {
      return sec(
        'impact no-stats',
        `<div class="blk bg-blue" style="left:0;top:0;width:210mm;height:96mm"></div>
        ${logo(ctx, true)}
        <div class="kicker" style="color:#fff">Impact</div>
        ${stack(im.heading, { cls: 'impact-heading', style: 'color:#fff', h: 36 })}
        <div class="impact-intro" style="color:#fff">${esc(im.intro)}</div>
        ${pil.map((p, i) => {
          const b = BAND[i];
          const top = 96 + i * (184 / pil.length);
          return `<div class="band ${b.cls}" style="top:${top}mm;height:${184 / pil.length}mm">
            ${stack(p.title, { tag: 'h3', style: `color:${b.ink}`, alt: b.alt, h: 26 })}
            <p class="band-text pillar-text" style="color:${b.ink}">${esc(p.text)}</p>
            <div class="band-ico" style="color:${b.ico}">${icon(p.icon)}</div>
            ${i === pil.length - 1 ? '<div class="lines" style="left:150mm;top:0;width:60mm;height:100%;opacity:.6"></div>' : ''}
          </div>`;
        }).join('')}
        ${foot(ctx, n, pil.length ? 'light' : '')}`
      );
    }
    const two = st.length === 2;
    const blockH = two ? 138 : 172;
    return sec(
      'impact',
      `<div class="blk bg-blue" style="left:0;top:0;width:210mm;height:${blockH}mm"></div>
      ${logo(ctx, true)}
      <div class="kicker" style="color:#fff">Impact</div>
      ${stack(im.heading, { cls: 'impact-heading', style: 'color:#fff', h: 36 })}
      <div class="impact-intro" style="color:#fff">${esc(im.intro)}</div>
      ${statsGrid(st, { style: 'color:#fff' })}
      <div class="lines" style="left:0;top:${blockH - 12}mm;width:210mm;height:12mm"></div>
      <div class="pillars" style="top:${blockH + 10}mm">${pil.map((p) => `<div class="pillar"><div class="ico-sq">${icon(p.icon)}</div><h3 class="pillar-title">${esc(p.title)}</h3><p class="pillar-text">${esc(p.text)}</p></div>`).join('')}</div>
      ${ctx.impactImg ? photo(ctx.impactImg, 'impact-photo', two ? 'top:204mm;height:72mm;' : '') : ''}
      ${foot(ctx, n)}`
    );
  },

  story: (ctx, n) => {
    const s = ctx.copy.story;
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    return sec(
      'story',
      `${photo(ctx.storyImg, 'story-photo')}
      ${cap(ctx.storyImg, 'left:0;top:202mm')}
      ${logo(ctx, false)}
      <div class="kicker" style="left:110mm;top:22mm;width:60mm;color:var(--grey)">Story of change</div>
      ${stack(s.heading, { cls: 'story-heading', alt: 'var(--teal)', h: 36 })}
      <div class="story-body fit" data-max="118">${paras(s.paragraphs)}</div>
      <blockquote class="quote-band bg-yellow">
        <p class="quote-text shrink" data-h="40">${esc(q.t)}</p>
        ${q.a ? `<div class="quote-by">${esc(q.a)}</div>` : ''}
        <div class="lines dark" style="left:170mm;top:0;width:40mm;height:66mm"></div>
      </blockquote>
      ${foot(ctx, n)}`
    );
  },

  gallery: (ctx, n) => {
    const g = ctx.gallery;
    const cols = g.length <= 3 ? Math.max(1, g.length) : g.length === 4 ? 2 : 3;
    const rows = g.length <= 3 ? 1 : 2;
    const cells = g.map((im, i) => `<figure>${photo(im, '', 'inset:0;')}${im.caption ? `<figcaption class="gallery-caption ${CAPS[i % 4]}">${esc(im.caption)}${im.illustrative ? ' (illustrative)' : ''}</figcaption>` : ''}</figure>`);
    while (cells.length < cols * rows) cells.push('<figure class="bg-blue"><div class="lines" style="inset:0"></div></figure>');
    return sec(
      'gallery',
      `<div class="blk bg-blue" style="left:0;top:0;width:210mm;height:72mm"></div>
      <div class="lines" style="left:150mm;top:46mm;width:60mm;height:26mm"></div>
      ${logo(ctx, true)}
      <div class="kicker" style="color:#fff">Gallery</div>
      ${stack(ctx.copy.gallery.heading, { cls: 'gallery-heading', style: 'color:#fff', h: 34 })}
      <div class="gallery-intro">${esc(ctx.copy.gallery.intro)}</div>
      <div class="sheet" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)">${cells.join('')}</div>
      ${foot(ctx, n)}`
    );
  },

  money: (ctx, n) => {
    const m = ctx.copy.money;
    const max = Math.max(...ctx.budget.map((b) => b.amount), 1);
    const rows = ctx.budget.slice(0, 6);
    const year = (ctx.period.match(/\b(20\d\d)\b(?!.*\b20\d\d\b)/) || [])[1] || '';
    const head = `<div class="blk bg-yellow" style="left:0;top:0;width:210mm;height:118mm"></div>
      <div class="lines dark" style="left:160mm;top:62mm;width:50mm;height:56mm"></div>
      ${logo(ctx, false)}
      <div class="kicker" style="color:var(--ink)">Your gift at work</div>
      ${stack(m.heading, { cls: 'money-heading on-light', h: 30 })}
      <div class="gift-amount shrink">${esc(ctx.amount || ctx.givingType)}</div>
      <div class="gift-type">${esc([ctx.amount ? ctx.givingType : '', year].filter(Boolean).join(' · '))}</div>
      <div class="money-intro">${esc(m.intro)}</div>`;
    if (!rows.length) {
      return sec(
        'money no-breakdown',
        `${head}
        ${photo(ctx.moneyImg, 'money-photo', 'left:0;top:146mm;width:210mm;height:62mm;')}
        ${cap(ctx.moneyImg, 'left:14mm;top:200mm')}
        ${supports(ctx, 'top:216mm')}
        <div class="money-note" style="top:268mm">${esc(m.note)}</div>
        ${foot(ctx, n)}`
      );
    }
    const gap = rows.length > 4 ? 9.2 : 12.4;
    return sec(
      'money',
      `${head}
      <ul class="spend" style="--gap:${gap}mm">${rows.map((b, i) => `<li class="spend-row"><span class="spend-label">${esc(b.label)} <span class="spend-amount">${rand(b.amount)}</span></span><span class="spend-pct">${Math.round((b.amount / ctx.budgetTotal) * 100)}%</span><span class="spend-track"><i style="width:${((b.amount / max) * 100).toFixed(1)}%;background:${BARS[i % 6]}"></i></span></li>`).join('')}</ul>
      ${supports(ctx)}
      <div class="money-note">${esc(m.note)}</div>
      ${foot(ctx, n)}`
    );
  },

  back: (ctx, n) => {
    const t = ctx.copy.thankYou;
    const a = ctx.copy.ahead;
    const bullets = (a.bullets || []).slice(0, 3);
    return sec(
      'back',
      `<div class="blk bg-blue" style="left:0;top:0;width:210mm;height:148mm"></div>
      <div class="lines" style="left:0;top:0;width:70mm;height:46mm"></div>
      ${logo(ctx, true, true)}
      <div class="kicker" style="top:50mm;color:#fff">Thank you</div>
      ${stack(t.heading, { cls: 'back-thanks', style: 'color:#fff', h: 42 })}
      <div class="back-message fit" data-max="105" style="color:#fff"><p>${esc(t.message)}</p></div>
      ${dua(ctx, 'left:14mm;top:128mm;color:#fff')}
      ${stack(a.heading, { cls: 'ahead-heading on-light', h: 12 })}
      <div class="ahead-text fit" data-max="108" style="height:${bullets.length ? 30 : 62}mm">${paras((a.paragraphs || []).slice(0, bullets.length ? 1 : 2))}</div>
      ${bullets.length ? `<ul class="ahead-list">${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      <div class="pverse bg-teal"><div class="fit" data-max="115" style="height:100%"><p>“${esc(ctx.verse.text)}”</p><span class="verse-ref">${esc(ctx.verse.ref)}</span></div></div>
      <div class="blk bg-yellow" style="left:0;top:240mm;width:210mm;height:57mm"></div>
      ${contact()}
      ${foot(ctx, n, '', 'color:var(--ink)')}`
    );
  },

  impactStory: (ctx, n) => {
    const im = ctx.copy.impact;
    const s = ctx.copy.story;
    const st = statsOrNothing(ctx, 4);
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    const pil = (im.pillars || []).slice(0, 3);
    const top = st.length >= 2
      ? statsGrid(st, { small: true, style: `top:68mm;grid-template-columns:repeat(${st.length},1fr);column-gap:6mm;color:#fff` })
      : `<div class="mini-pillars">${pil.map((p) => `<div><div class="mp-ico">${icon(p.icon)}</div><b>${esc(p.title)}</b></div>`).join('')}</div>`;
    return sec(
      'impact-story',
      `<div class="blk bg-blue" style="left:0;top:0;width:210mm;height:112mm"></div>
      ${logo(ctx, true)}
      <div class="kicker" style="color:#fff">Impact and story</div>
      ${stack(im.heading, { cls: 'impact-heading', style: 'font-size:34pt;color:#fff', h: 32 })}
      ${top}
      ${photo(ctx.storyImg, '', 'left:0;top:112mm;width:98mm;height:118mm;')}
      ${cap(ctx.storyImg, 'left:0;top:222mm')}
      ${stack(s.heading, { tag: 'h3', style: 'left:108mm;top:122mm;width:88mm;font-size:19pt;color:var(--blue)', alt: 'var(--teal)', h: 16 })}
      <div class="abs combo-story fit" data-max="115">${paras(s.paragraphs)}</div>
      <blockquote class="quote-band bg-yellow" style="top:230mm;height:48mm">
        <p class="quote-text shrink" data-h="24" style="top:9mm;font-size:13pt">${esc(q.t)}</p>
        ${q.a ? `<div class="quote-by" style="bottom:6mm">${esc(q.a)}</div>` : ''}
      </blockquote>
      ${foot(ctx, n)}`
    );
  },

  closing: (ctx, n) => {
    const m = ctx.copy.money;
    const t = ctx.copy.thankYou;
    return sec(
      'closing',
      `<div class="blk bg-yellow" style="left:0;top:0;width:210mm;height:100mm"></div>
      ${logo(ctx, false)}
      <div class="kicker" style="color:var(--ink)">Your gift at work</div>
      ${stack(m.heading, { cls: 'money-heading on-light', style: 'font-size:30pt', h: 26 })}
      <div class="gift-amount shrink" style="top:58mm;font-size:50pt">${esc(ctx.amount || ctx.givingType)}</div>
      ${ctx.amount ? `<div class="gift-type" style="top:79mm">${esc(ctx.givingType)}</div>` : ''}
      ${supports(ctx, 'top:110mm')}
      <div class="blk bg-blue" style="left:0;top:154mm;width:210mm;height:143mm"></div>
      <div class="lines" style="left:150mm;top:154mm;width:60mm;height:40mm"></div>
      ${stack(t.heading, { style: 'top:166mm;width:120mm;font-size:36pt;color:#fff', h: 30 })}
      <div class="abs fit" data-max="108" style="left:14mm;top:200mm;width:120mm;height:34mm;font-size:10pt;line-height:1.5;color:#fff"><p>${esc(t.message)}</p></div>
      ${dua(ctx, 'left:140mm;top:198mm;width:56mm;text-align:right;color:#fff', true)}
      ${contact('top:240mm;color:#fff')}
      ${foot(ctx, n, 'light')}`
    );
  },
};

const css = `
.p{font-size:10pt;line-height:1.45;color:var(--ink)}
.p p{margin:0 0 2.6mm}.p p:last-child{margin-bottom:0}
.p .abs{position:absolute}
.p .ph{position:absolute;overflow:hidden;background-size:cover}
.p .ico{display:block;width:100%;height:100%}
.p .ar{font-family:var(--arabic)}
.p .footer{position:absolute;left:14mm;right:14mm;bottom:8mm;display:flex;gap:5mm;align-items:baseline;font:600 7.5pt/1 var(--head);letter-spacing:.05em;color:var(--grey);z-index:4}
.p .footer-page{font-weight:800;color:var(--blue);font-size:9pt}
.p .footer-title{flex:1}
.p .footer.light{color:rgba(255,255,255,.88)}
.p .footer.light .footer-page{color:var(--yellow)}
.p .footer-page::after{content:"";display:inline-block;width:6mm;height:.5mm;background:currentColor;margin-left:2mm;vertical-align:.8mm}
.p .blk{position:absolute}
.p .bg-blue{background:var(--blue);color:#fff}
.p .bg-yellow{background:var(--yellow);color:var(--ink)}
.p .bg-purple{background:var(--purple);color:#fff}
.p .bg-teal{background:var(--teal);color:var(--ink)}
.p .bg-pale{background:var(--blue20);color:var(--ink)}
.p .lines{position:absolute;pointer-events:none;background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,.28) 0 .32mm,transparent .32mm 2.1mm)}
.p .lines.dark{background-image:repeating-linear-gradient(-45deg,rgba(7,120,212,.28) 0 .32mm,transparent .32mm 2.1mm)}
.p .kicker{position:absolute;left:14mm;top:20mm;font:700 8.5pt/1.2 var(--head);letter-spacing:.18em;text-transform:uppercase;max-width:140mm}
.p .stack{position:absolute;left:14mm;margin:0;font:700 44pt/.9 var(--head);text-transform:uppercase;letter-spacing:-.005em;text-wrap:balance}
.p .stack .alt{color:var(--yellow)}
.p .on-light .alt,.p .stack.on-light .alt{color:var(--blue)}
.p .rule{position:absolute;height:1.6mm;width:22mm;background:var(--yellow)}
.p .cap{position:absolute;background:var(--blue);color:#fff;font:600 7.5pt/1.25 var(--head);padding:1.6mm 3mm;max-width:90mm;z-index:3}
.p .ico-sq{width:11mm;height:11mm;padding:2.2mm;background:var(--yellow);color:var(--blue)}

/* Cover */
.p .cover-title{top:66mm;width:140mm;font-size:54pt}
.p .cover-subtitle{position:absolute;left:14mm;top:124mm;width:130mm;font-size:12pt;line-height:1.35}
.p .cover-thanks{position:absolute;left:12mm;top:144mm;transform:rotate(-3deg);background:var(--yellow);color:var(--blue);font:400 30pt/1 var(--marker);padding:1.5mm 5mm 2.5mm;z-index:4}
.p .cover-photo{left:0;top:158mm;width:210mm;height:139mm}
.p .cover-for{position:absolute;left:0;top:252mm;width:128mm;height:45mm;background:#fff;padding:7mm 10mm 0 14mm}
.p .cover-for-label{font:700 7.5pt var(--head);letter-spacing:.18em;text-transform:uppercase;color:var(--blue)}
.p .cover-donor{font:700 19pt/1.05 var(--head);color:var(--blue);text-transform:uppercase;margin-top:1.4mm}
.p .cover-period{font:600 9pt var(--head);color:var(--grey);margin-top:2mm}

/* Letter */
.p .letter-heading{top:34mm;width:56mm;font-size:50pt;color:var(--blue)}
.p .ceo-photo{left:14mm;top:190mm;width:46mm;height:62mm}
.p .letter-salutation{position:absolute;left:84mm;top:40mm;width:100mm;font:700 12.5pt/1.25 var(--head)}
.p .letter-col{position:absolute;left:84mm;top:56mm;width:112mm;height:220mm;display:flex;flex-direction:column}
.p .letter-body{flex:1;font-size:10pt;line-height:1.52}
.p .letter-sign{flex:none;padding-top:5mm}
.p .letter-closing{font-style:italic;color:var(--grey)}
.p .letter-signature{font:400 38pt/1.15 var(--sig);color:var(--blue);margin:0 0 2.5mm -2mm}
.p .letter-sig-img{height:16mm;margin:1mm 0;display:block}
.p .letter-name{font:700 13pt var(--head);text-transform:uppercase;letter-spacing:.02em}
.p .letter-title{font-size:8.5pt;color:var(--grey)}

/* Project */
.p .project-heading{width:110mm;font-size:36pt;color:var(--blue)}
.p .project-lead{position:absolute;left:14mm;top:184mm;width:110mm;font:600 12.5pt/1.36 var(--head);color:var(--blue)}
.p .project-body{position:absolute;left:14mm;top:208mm;width:110mm;height:68mm;font-size:9.4pt;line-height:1.48}
.p .facts{position:absolute;left:132mm;top:132mm;width:78mm;height:146mm;padding:12mm 10mm 0 9mm;margin:0}
.p .fact{margin-bottom:5.5mm}
.p .fact-label{display:block;font:700 6.8pt var(--head);letter-spacing:.16em;text-transform:uppercase;opacity:.82}
.p .fact-value{display:block;font:700 14pt/1.1 var(--head);text-transform:uppercase;margin:1mm 0 0}
.p .fact-value.hi{color:var(--yellow);font-size:22pt}

/* Impact */
.p .impact-heading{top:30mm;width:140mm;font-size:40pt}
.p .impact-intro{position:absolute;left:14mm;top:72mm;width:140mm;font-size:10.5pt;line-height:1.5}
.p .stats{position:absolute;left:14mm;top:98mm;width:182mm;display:grid;grid-template-columns:1fr 1fr;row-gap:6mm;column-gap:8mm}
.p .stat{border-top:.5mm solid rgba(255,255,255,.55);padding-top:3mm;min-width:0}
.p .stat-value{font:700 44pt/1 var(--head);color:var(--yellow);white-space:nowrap;overflow:hidden}
.p .stat-label{font:700 8.5pt/1.3 var(--head);letter-spacing:.12em;text-transform:uppercase;margin-top:1.5mm}
.p .stats.small .stat-value{font-size:28pt}
.p .stats.small .stat-label{font-size:7.5pt}
.p .pillars{position:absolute;left:14mm;top:182mm;width:182mm;display:grid;grid-template-columns:repeat(3,1fr);gap:8mm}
.p .pillar-title{font:700 13pt/1.05 var(--head);text-transform:uppercase;color:var(--blue);margin:3.5mm 0 1.6mm}
.p .pillar-text{font-size:9pt;line-height:1.45;margin:0}
.p .impact-photo{left:14mm;top:234mm;width:182mm;height:42mm}
.p .band{position:absolute;left:0;width:210mm;overflow:hidden}
.p .band .stack{top:12mm;width:92mm;font-size:30pt}
.p .band .band-text{position:absolute;left:118mm;top:14mm;width:78mm;font-size:10.5pt;line-height:1.5}
.p .band .band-ico{position:absolute;left:118mm;bottom:10mm;width:12mm;height:12mm}
.p .mini-pillars{position:absolute;left:14mm;top:70mm;width:182mm;display:grid;grid-template-columns:repeat(3,1fr);gap:8mm;color:#fff}
.p .mini-pillars div{border-top:.5mm solid rgba(255,255,255,.55);padding-top:3mm;font:700 13pt/1.1 var(--head);text-transform:uppercase}
.p .mini-pillars .mp-ico{width:10mm;height:10mm;color:var(--yellow);border:0;padding:0;margin-bottom:2mm}

/* Story */
.p .story-photo{left:0;top:0;width:100mm;height:212mm}
.p .story-heading{top:34mm;left:110mm;width:86mm;font-size:32pt;color:var(--blue)}
.p .story-body{position:absolute;left:110mm;top:84mm;width:86mm;height:122mm;font-size:9.5pt;line-height:1.48}
.p .quote-band{position:absolute;left:0;top:212mm;width:210mm;height:66mm;margin:0}
.p .quote-band::before{content:"\\201C";position:absolute;left:12mm;top:4mm;font:700 96pt/1 var(--head);color:var(--blue)}
.p .quote-text{position:absolute;left:46mm;top:12mm;width:130mm;font:700 16pt/1.3 var(--head);color:var(--blue);margin:0}
.p .quote-by{position:absolute;left:46mm;bottom:9mm;font:700 8.5pt var(--head);letter-spacing:.14em;text-transform:uppercase}
.p .combo-story{left:108mm;top:142mm;width:88mm;height:82mm;font-size:9.5pt;line-height:1.5}

/* Gallery */
.p .gallery-heading{top:30mm;width:140mm;font-size:38pt}
.p .gallery-intro{position:absolute;left:14mm;top:77mm;width:182mm;font-size:10pt;line-height:1.45}
.p .sheet{position:absolute;left:0;top:94mm;width:210mm;height:184mm;display:grid}
.p .sheet figure{position:relative;margin:0;overflow:hidden}
.p .sheet .ph{inset:0}
.p .gallery-caption{position:absolute;left:0;bottom:0;max-width:100%;padding:1.6mm 2.6mm;font:600 7.5pt/1.25 var(--head)}

/* Money */
.p .money-heading{top:28mm;width:140mm;font-size:34pt;color:var(--ink)}
.p .gift-amount{position:absolute;left:14mm;top:66mm;width:150mm;font:700 60pt/1 var(--head);color:var(--blue);white-space:nowrap;overflow:hidden}
.p .gift-type{position:absolute;left:14mm;top:91mm;font:700 10pt var(--head);letter-spacing:.18em;text-transform:uppercase}
.p .money-intro{position:absolute;left:14mm;top:124mm;width:182mm;font-size:10.5pt;line-height:1.5}
.p .spend{position:absolute;left:14mm;top:144mm;width:182mm;margin:0;padding:0;list-style:none}
.p .spend-row{display:grid;grid-template-columns:1fr 26mm;column-gap:6mm;align-items:end;height:var(--gap)}
.p .spend-label{font-size:9.5pt;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.p .spend-amount{color:var(--grey);margin-left:2mm;font-variant-numeric:tabular-nums}
.p .spend-track{grid-column:1;height:5mm;background:var(--warm);margin-top:1.2mm;position:relative}
.p .spend-track i{position:absolute;left:0;top:0;bottom:0}
.p .spend-pct{grid-column:2;grid-row:1/3;text-align:right;font:700 20pt/1 var(--head);color:var(--blue);font-variant-numeric:tabular-nums}
.p .supports{position:absolute;left:14mm;top:212mm;width:182mm;display:grid;grid-template-columns:repeat(3,1fr);gap:8mm}
.p .support-title{font:700 12pt/1.05 var(--head);text-transform:uppercase;color:var(--blue);margin:3mm 0 1.4mm}
.p .support-text{font-size:9pt;line-height:1.42;margin:0}
.p .money-note{position:absolute;left:14mm;top:264mm;width:182mm;font:italic 400 8pt/1.4 var(--body);color:var(--grey)}

/* Back */
.p .back-thanks{top:58mm;width:150mm;font-size:52pt}
.p .back-message{position:absolute;left:14mm;top:104mm;width:150mm;height:22mm;font-size:11pt;line-height:1.5}
.p .dua-line{display:flex;align-items:baseline;gap:4mm}
.p .dua-line.block{display:block}
.p .dua-ar{font:700 22pt/1.6 var(--arabic)}
.p .dua-line.block .dua-ar{display:block;font-size:19pt}
.p .dua-en{font:italic 400 9pt/1.35 var(--body)}
.p .ahead-heading{top:158mm;width:110mm;font-size:26pt;color:var(--blue)}
.p .ahead-text{position:absolute;left:14mm;top:172mm;width:108mm;font-size:9.6pt;line-height:1.48}
.p .ahead-list{position:absolute;left:14mm;top:206mm;width:108mm;margin:0;padding:0;list-style:none;font:600 10pt/1.3 var(--head)}
.p .ahead-list li{position:relative;padding-left:7mm;margin-bottom:2.2mm}
.p .ahead-list li::before{content:"";position:absolute;left:0;top:1mm;width:3.2mm;height:3.2mm;background:var(--yellow)}
.p .pverse{position:absolute;left:132mm;top:148mm;width:78mm;height:92mm;padding:10mm 9mm;font:italic 400 9.6pt/1.5 var(--body)}
.p .verse-ref{display:block;margin-top:3mm;font:700 8pt var(--head);letter-spacing:.16em;text-transform:uppercase;font-style:normal;color:var(--blue)}
.p .contact{position:absolute;left:14mm;top:250mm;width:182mm;display:grid;grid-template-columns:repeat(4,auto);gap:2.5mm 7mm;font-size:inherit;line-height:1.3}
.p .contact-label{display:block;font:700 6.8pt var(--head);letter-spacing:.14em;text-transform:uppercase;opacity:.8}
.p .contact-value{display:block;font:700 9.5pt/1.3 var(--head)}
.p .contact-reg{grid-column:1/-1}
.p .contact-reg .contact-value{font-weight:600}
`;

export default {
  id: 'poster',
  name: 'Poster',
  description: 'Big stacked capitals on two solid blocks of brand colour, like a campaign poster on every page.',
  bestFor: 'Corporate donors, businesses and young professionals; short reports with one clear headline number.',
  get swatch() {
    return [brand.colors.blue, brand.colors.yellow, brand.colors.purple];
  },
  pages,
  css,
};
