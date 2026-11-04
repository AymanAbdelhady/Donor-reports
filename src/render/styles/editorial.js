// STYLE 4: "Editorial": magazine-style pages:
// giant outlined section numbers over full-bleed photography, bold statement
// columns beside a fine black vertical rule, and generous white space.
import { C, esc, paras, bg, icon, contactBlock, duaBlock, verseBlock, signature, footer, logo, statsOrNothing, rand } from '../helpers.js';

const sec = (cls, inner, style = '') => `<section class="page ed ${cls}"${style ? ` style="${style}"` : ''}>${inner}</section>`;
const num = (n, cls = '') => `<div class="ed-num ${cls}">${String(n).padStart(2, '0')}</div>`;
const cap = (img) => (img?.caption ? `${esc(img.caption)}${img.illustrative ? ' (illustrative)' : ''}` : '');
const opener = (img, n, title, kicker, cls = '') => `
  <div class="ed-open ${cls}"><div class="ph" ${bg(img?.url)}></div><div class="ed-open-shade"></div>
    ${num(n)}<div class="ed-open-t"><div class="kicker">${esc(kicker)}</div><h2>${esc(title)}</h2></div>
    ${img?.caption ? `<div class="ed-cap">${cap(img)}</div>` : ''}</div>`;
const stats = (list, cls = '') => `<div class="ed-stats n${list.length} ${cls}">${list.map((s) => `<div class="st"><div class="v">${esc(s.value)}</div><div class="l">${esc(s.label)}</div></div>`).join('')}</div>`;
const pillars = (ctx, cls = '') => `<div class="ed-pillars ${cls}">${(ctx.copy.impact.pillars || []).slice(0, 3).map((p, i) => `<div class="pl"><div class="pl-n">${String(i + 1).padStart(2, '0')}</div><div class="pl-i">${icon(p.icon)}</div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('')}</div>`;

const pages = {
  cover: (ctx) =>
    sec(
      'ed-cover',
      `<div class="ph ed-cv-photo" ${bg(ctx.cover?.url)}></div><div class="ed-cv-shade"></div>
      ${logo(ctx, 'box', 'logo-box')}
      <div class="ed-cv-year">${new Date().getFullYear()}</div>
      <div class="ed-cv-text">
        <div class="kicker">${esc(ctx.copy.cover.kicker)}</div>
        <h1>${esc(ctx.copy.cover.title)}</h1>
        <p>${esc(ctx.copy.cover.subtitle)}</p>
      </div>
      <div class="ed-cv-foot"><span>Prepared for</span><strong>${esc(ctx.donorName)}</strong><em>${esc(ctx.brand.tagline)}</em></div>`
    ),

  letter: (ctx, n) =>
    sec(
      'ed-letter',
      `${logo(ctx, 'colour', 'logo-sm')}
      ${num(1, 'dark')}
      <div class="ed-col-l">
        <div class="kicker">A message from our CEO</div>
        <h2>Thank you</h2>
        <div class="ed-ceo ph" ${bg(ctx.ceo.photo, '58% 30%')}></div>
        <div class="ed-ceo-n">${esc(ctx.ceo.name)}</div><div class="ed-ceo-t">${esc(ctx.ceo.title)}<br>${esc(ctx.brand.orgName)}</div>
      </div>
      <div class="ed-rule"></div>
      <div class="ed-col-r fit" data-max="135"><p class="sal">${esc(ctx.copy.ceoLetter.salutation)}</p>${paras(ctx.copy.ceoLetter.paragraphs)}${signature(ctx)}</div>
      ${footer(ctx, n, 'ed-pf')}`
    ),

  project: (ctx, n) =>
    sec(
      'ed-project',
      `${opener(ctx.projectImg, 2, ctx.copy.project.heading, 'The project')}
      ${logo(ctx, 'box', 'logo-sm')}
      <div class="ed-body">
        <p class="ed-statement">${esc(ctx.copy.project.lead)}</p>
        <div class="ed-rule v"></div>
        <div class="ed-cols fit" data-max="125">${paras(ctx.copy.project.paragraphs)}</div>
      </div>
      <dl class="ed-facts">${ctx.copy.project.keyFacts.slice(0, 5).map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
      ${footer(ctx, n, 'ed-pf')}`
    ),

  impact: (ctx, n) => {
    const st = statsOrNothing(ctx);
    return sec(
      `ed-impact ${st.length >= 2 ? '' : 'no-stats'}`,
      `${logo(ctx, 'colour', 'logo-sm')}
      ${num(3, 'dark')}
      <div class="ed-i-head"><div class="kicker">Your impact</div><h2>${esc(ctx.copy.impact.heading)}</h2><p class="ed-statement">${esc(ctx.copy.impact.intro)}</p></div>
      ${st.length >= 2 ? stats(st) : ''}
      ${pillars(ctx)}
      ${footer(ctx, n, 'ed-pf')}`
    );
  },

  story: (ctx, n) => {
    const s = ctx.copy.story;
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    return sec(
      'ed-story',
      `${opener(ctx.storyImg, 4, s.heading, 'A story of change', 'tall')}
      ${logo(ctx, 'box', 'logo-sm')}
      <div class="ed-body s">
        <blockquote class="ed-q"><span>“</span>${esc(q.t)}${q.a ? `<cite>${esc(q.a)}</cite>` : ''}</blockquote>
        <div class="ed-rule v"></div>
        <div class="ed-cols fit" data-max="125">${paras(s.paragraphs)}</div>
      </div>
      ${footer(ctx, n, 'ed-pf')}`
    );
  },

  gallery: (ctx, n) =>
    sec(
      'ed-gallery',
      `${logo(ctx, 'colour', 'logo-sm')}
      ${num(5, 'dark')}
      <div class="ed-g-l"><div class="kicker">In pictures</div><h2>${esc(ctx.copy.gallery.heading)}</h2><p>${esc(ctx.copy.gallery.intro)}</p>
        <ol>${ctx.gallery.map((g) => `<li>${cap(g) || '&nbsp;'}</li>`).join('')}</ol></div>
      <div class="ed-rule g"></div>
      <div class="ed-g-grid c${ctx.gallery.length}">${ctx.gallery.map((g, i) => `<figure class="ph g${i}" ${bg(g.url)}><b>${i + 1}</b></figure>`).join('')}</div>
      ${footer(ctx, n, 'ed-pf')}`
    ),

  money: (ctx, n) => {
    const m = ctx.copy.money;
    const max = Math.max(1, ...ctx.budget.map((b) => b.amount));
    return sec(
      'ed-money',
      `${logo(ctx, 'colour', 'logo-sm')}
      ${num(6, 'dark')}
      <div class="ed-m-l"><div class="kicker">Accountability</div><h2>${esc(m.heading)}</h2><p class="ed-statement">${esc(m.intro)}</p>
        <div class="ed-gift"><span>${esc(ctx.givingType)}</span><strong>${esc(ctx.amount || 'With thanks')}</strong></div></div>
      <div class="ed-rule m"></div>
      <div class="ed-m-r">
        ${ctx.budget.length ? `<h3>How it was spent</h3>${ctx.budget.map((b, i) => `<div class="eb"><div class="eb-t"><span>${esc(b.label)}</span><b>${rand(b.amount)}</b></div><div class="eb-bar"><i style="width:${((b.amount / max) * 100).toFixed(1)}%;opacity:${1 - i * 0.16}"></i></div></div>`).join('')}` : `<div class="ph ed-m-photo" ${bg(ctx.moneyImg?.url)}></div>`}
        <h3 class="sup">What your gift supports</h3>
        <ol class="ed-sup">${m.supports.slice(0, 3).map((s) => `<li><div class="i">${icon(s.icon)}</div><div><b>${esc(s.title)}</b><p>${esc(s.text)}</p></div></li>`).join('')}</ol>
        <p class="ed-note">${esc(m.note)}</p>
      </div>
      ${footer(ctx, n, 'ed-pf')}`
    );
  },

  back: (ctx) => {
    const a = ctx.copy.ahead;
    return sec(
      'ed-back',
      `${logo(ctx, 'white', 'logo-box')}
      <div class="ed-b-ty"><div class="ed-b-out">Thank you</div><h2>${esc(ctx.copy.thankYou.heading)}</h2><p>${esc(ctx.copy.thankYou.message)}</p>${duaBlock(ctx)}</div>
      <div class="ed-b-low">
        <div class="ed-b-ahead"><h3>${esc(a.heading)}</h3><div class="fit">${paras(a.paragraphs)}${a.bullets?.length ? `<ul>${a.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</div></div>
        <div class="ed-rule w"></div>
        <div class="ed-b-r">${verseBlock(ctx)}${contactBlock()}</div>
      </div>`
    );
  },

  impactStory: (ctx, n) => {
    const st = statsOrNothing(ctx, 3);
    const s = ctx.copy.story;
    return sec(
      'ed-is',
      `${logo(ctx, 'colour', 'logo-sm')}
      ${num(2, 'dark')}
      <div class="ed-i-head"><div class="kicker">Your impact</div><h2>${esc(ctx.copy.impact.heading)}</h2></div>
      ${st.length >= 2 ? stats(st, 'compact') : pillars(ctx, 'compact')}
      <div class="ed-is-low">
        <div class="ph ed-is-photo" ${bg(ctx.storyImg?.url)}></div>
        <div class="ed-is-text"><div class="kicker">A story of change</div><h3>${esc(s.heading)}</h3>
          <div class="fit">${s.quote ? `<blockquote class="ed-q sm">“${esc(s.quote)}”${s.quoteAttribution ? `<cite>${esc(s.quoteAttribution)}</cite>` : ''}</blockquote>` : ''}${paras(s.paragraphs)}</div></div>
      </div>
      ${footer(ctx, n, 'ed-pf')}`
    );
  },

  closing: (ctx) => {
    const m = ctx.copy.money;
    return sec(
      'ed-closing',
      `<div class="ed-c-top">
        ${logo(ctx, 'colour', 'logo-sm')}
        <div class="kicker">Your gift at work</div><h2>${esc(m.heading)}</h2>
        <div class="ed-c-row"><div class="ed-gift"><span>${esc(ctx.givingType)}</span><strong>${esc(ctx.amount || 'With thanks')}</strong></div>
        <ol class="ed-sup">${m.supports.slice(0, 3).map((s) => `<li><div class="i">${icon(s.icon)}</div><div><b>${esc(s.title)}</b><p>${esc(s.text)}</p></div></li>`).join('')}</ol></div>
      </div>
      <div class="ed-c-bottom">
        <div class="ed-b-out sm">Thank you</div><h2>${esc(ctx.copy.thankYou.heading)}</h2><p>${esc(ctx.copy.thankYou.message)}</p>${duaBlock(ctx)}
        <div class="ed-c-foot">${contactBlock()}<img src="${ctx.logos.white}" alt=""></div>
      </div>`
    );
  },
};

const css = `
.ed{color:#111}
.ed .kicker{color:var(--blue)}
.ed h2{font-size:34pt;text-transform:uppercase;color:#111;font-weight:800}
.ed-pf{color:#111}
.ed-pf b{color:var(--blue)}
.ed-num{position:absolute;font-family:var(--head);font-weight:700;font-size:96pt;line-height:.8;color:transparent;-webkit-text-stroke:.5mm #fff;letter-spacing:-.02em;z-index:4}
.ed-num.dark{-webkit-text-stroke:.45mm var(--blue);left:14mm;top:16mm}
.ed-statement{font-family:var(--head);font-weight:700;font-size:17pt;line-height:1.2;color:#111}
.ed-rule{position:absolute;width:.35mm;background:#111}
.ed-q{font-family:var(--head);font-weight:700;font-size:19pt;line-height:1.18;color:#111;position:relative}
.ed-q span{display:block;font-size:56pt;line-height:.55;color:var(--blue);height:9mm}
.ed-q cite{display:block;font-style:normal;font-size:9pt;letter-spacing:.16em;text-transform:uppercase;color:var(--blue);margin-top:4mm}
.ed-q.sm{font-size:12.5pt;margin-bottom:3mm;border-left:1mm solid var(--blue);padding-left:4mm}
.ed-q.sm cite{margin-top:1.5mm;font-size:7.5pt}
.ed .sig-script{color:#111}.ed .sig-name{color:var(--blue)}

/* cover */
.ed-cv-photo{position:absolute;inset:0}
.ed-cv-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,.15) 60%,rgba(0,0,0,0)),linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.55))}
.ed-cv-year{position:absolute;left:12mm;top:58mm;font-family:var(--head);font-weight:700;font-size:150pt;line-height:.8;color:transparent;-webkit-text-stroke:.6mm #fff;letter-spacing:-.03em}
.ed-cv-text{position:absolute;left:14mm;right:30mm;top:118mm;color:#fff}
.ed-cv-text .kicker{color:#fff;margin-bottom:3mm}
.ed-cover h1{font-size:52pt;line-height:.92;text-transform:uppercase;color:#fff;font-weight:700;margin-bottom:5mm}
.ed-cv-text p{font-size:13pt;line-height:1.35;max-width:120mm}
.ed-cv-foot{position:absolute;left:14mm;right:14mm;bottom:12mm;color:#fff;display:grid;grid-template-columns:auto 1fr auto;gap:0 4mm;align-items:end;border-top:.35mm solid rgba(255,255,255,.7);padding-top:4mm}
.ed-cv-foot span{grid-column:1/-1;font-family:var(--head);font-size:8pt;letter-spacing:.2em;text-transform:uppercase}
.ed-cv-foot strong{font-family:var(--head);font-size:17pt;text-transform:uppercase;line-height:1.1}
.ed-cv-foot em{grid-column:3;font-style:normal;font-family:var(--head);font-weight:700;font-size:8.5pt;letter-spacing:.2em;text-transform:uppercase}

/* letter */
.ed-col-l{position:absolute;left:14mm;top:58mm;width:58mm;bottom:22mm}
.ed-col-l h2{margin:2mm 0 7mm}
.ed-ceo{width:58mm;height:70mm}
.ed-ceo-n{font-family:var(--head);font-weight:700;font-size:15pt;text-transform:uppercase;margin-top:4mm}
.ed-ceo-t{font-size:8.5pt;color:var(--grey)}
.ed-letter .ed-rule{left:80mm;top:58mm;bottom:22mm}
.ed-col-r{position:absolute;left:88mm;right:14mm;top:58mm;bottom:22mm}
.ed-col-r p{font-size:10.5pt;line-height:1.62}
.ed-col-r .sal{font-family:var(--head);font-weight:700;font-size:14pt}

/* openers */
.ed-open{position:absolute;left:0;right:0;top:0;height:132mm;color:#fff}
.ed-open.tall{height:150mm}
.ed-open .ph{position:absolute;inset:0}
.ed-open-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.05) 35%,rgba(0,0,0,.6))}
.ed-open .ed-num{left:12mm;bottom:40mm}
.ed-open-t{position:absolute;left:14mm;right:40mm;bottom:9mm;z-index:4}
.ed-open-t .kicker{color:#fff}
.ed-open-t h2{color:#fff;font-size:36pt;margin-top:2mm}
.ed-cap{position:absolute;right:12mm;bottom:3mm;font-size:7pt;color:#fff;opacity:.85;z-index:4}
.ed-body{position:absolute;left:14mm;right:14mm;top:142mm;bottom:56mm;display:flex;gap:10mm}
.ed-body.s{top:160mm;bottom:22mm}
.ed-body .ed-statement,.ed-body .ed-q{width:66mm;flex:none}
.ed-body .ed-rule.v{position:static;flex:none;width:.35mm;align-self:stretch}
.ed-cols{flex:1;columns:2;column-gap:7mm;column-fill:balance;font-size:9.8pt}
.ed-facts{position:absolute;left:14mm;right:14mm;bottom:20mm;height:28mm;display:flex;border-top:.6mm solid #111}
.ed-facts div{flex:1;padding:3mm 3mm 0 0;border-right:.25mm solid #ccc;margin-right:3mm}
.ed-facts div:last-child{border:0}
.ed-facts dt{font-family:var(--head);font-weight:700;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:var(--blue)}
.ed-facts dd{font-family:var(--head);font-weight:700;font-size:11pt;line-height:1.15}

/* impact */
.ed-i-head{position:absolute;left:14mm;right:14mm;top:58mm}
.ed-i-head h2{margin:2mm 0 4mm}
.ed-i-head .ed-statement{max-width:150mm;font-size:15pt}
.ed-stats{position:absolute;left:14mm;right:14mm;top:118mm;display:grid;grid-template-columns:1fr 1fr;border-top:.6mm solid #111}
.ed-stats.n3{grid-template-columns:repeat(3,1fr)}
.ed-stats .st{padding:5mm 6mm 6mm 0;border-bottom:.25mm solid #ccc}
.ed-stats .st:nth-child(odd){border-right:.25mm solid #ccc}
.ed-stats.n3 .st{border-right:.25mm solid #ccc}
.ed-stats .st:nth-child(even){padding-left:6mm}
.ed-stats.n3 .st{padding-left:5mm}.ed-stats.n3 .st:first-child{padding-left:0}
.ed-stats .v{font-family:var(--head);font-weight:700;font-size:52pt;line-height:1;color:var(--blue);letter-spacing:-.02em}
.ed-stats .l{font-family:var(--head);font-weight:700;font-size:10.5pt;text-transform:uppercase;letter-spacing:.08em;margin-top:1.5mm}
.ed-pillars{position:absolute;left:14mm;right:14mm;bottom:22mm;display:grid;grid-template-columns:repeat(3,1fr)}
.ed-pillars .pl{padding:0 6mm;border-left:.35mm solid #111;position:relative}
.ed-pillars .pl:first-child{padding-left:0;border:0}
.ed-pillars .pl-n{font-family:var(--head);font-weight:700;font-size:9pt;color:var(--grey);letter-spacing:.12em}
.ed-pillars .pl-i{width:13mm;height:13mm;color:var(--blue);margin:3mm 0}
.ed-pillars h3{font-size:14pt;text-transform:uppercase}
.ed-pillars p{font-size:9.5pt;line-height:1.45;margin-top:2mm}
.ed-impact.no-stats .ed-pillars{top:130mm;bottom:auto}
.ed-impact.no-stats .ed-pillars h3{font-size:19pt}
.ed-impact.no-stats .ed-pillars p{font-size:11pt}
.ed-impact.no-stats .ed-pillars .pl-i{width:20mm;height:20mm}

/* gallery */
.ed-g-l{position:absolute;left:14mm;top:58mm;width:56mm;bottom:22mm}
.ed-g-l h2{font-size:26pt;margin:2mm 0 4mm}
.ed-g-l p{font-size:10pt;color:var(--grey)}
.ed-g-l ol{margin:6mm 0 0 4.5mm;font-size:8pt;line-height:1.4}
.ed-g-l li{margin-bottom:2mm}
.ed-rule.g{left:76mm;top:58mm;bottom:22mm}
.ed-g-grid{position:absolute;left:82mm;right:14mm;top:34mm;bottom:22mm;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:4mm}
.ed-g-grid figure{position:relative}
.ed-g-grid figure b{position:absolute;left:0;top:0;background:#fff;color:#111;font-family:var(--head);font-size:9pt;padding:1mm 2.2mm}
.ed-g-grid .g0{grid-column:span 2;grid-row:span 2}
.ed-g-grid.c2 .g0{grid-row:span 1}.ed-g-grid.c2 .g1{grid-column:span 2}
.ed-g-grid.c3 .g0{grid-row:span 1}
.ed-g-grid.c4 .g3{grid-column:span 2}
.ed-g-grid.c6 .g5{display:none}

/* money */
.ed-m-l{position:absolute;left:14mm;top:58mm;width:68mm;bottom:22mm;display:flex;flex-direction:column}
.ed-m-l h2{margin:2mm 0 5mm}
.ed-m-l .ed-statement{font-size:14pt}
.ed-gift{margin-top:auto;border-top:.6mm solid #111;padding-top:4mm}
.ed-gift span{display:block;font-family:var(--head);font-weight:700;font-size:8.5pt;letter-spacing:.16em;text-transform:uppercase;color:var(--blue)}
.ed-gift strong{font-family:var(--head);font-weight:700;font-size:38pt;line-height:1;letter-spacing:-.02em}
.ed-rule.m{left:89mm;top:58mm;bottom:22mm}
.ed-m-r{position:absolute;left:96mm;right:14mm;top:58mm;bottom:22mm;display:flex;flex-direction:column}
.ed-m-r h3{font-family:var(--head);font-size:12pt;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3mm}
.ed-m-r h3.sup{margin-top:8mm}
.eb{margin-bottom:3.4mm}
.eb-t{display:flex;justify-content:space-between;font-size:9.5pt;gap:4mm}
.eb-t b{font-family:var(--head);white-space:nowrap}
.eb-bar{height:3.4mm;background:#eee;margin-top:1mm}
.eb-bar i{display:block;height:100%;background:var(--blue)}
.ed-m-photo{height:62mm}
.ed-sup{list-style:none;counter-reset:s}
.ed-sup li{display:flex;gap:4mm;align-items:flex-start;padding:3mm 0;border-top:.25mm solid #ccc}
.ed-sup .i{width:10mm;height:10mm;flex:none;color:var(--blue)}
.ed-sup b{font-family:var(--head);font-size:12pt;text-transform:uppercase}
.ed-sup p{font-size:9pt;line-height:1.4;margin:.5mm 0 0}
.ed-note{margin-top:auto;font-size:8pt;font-style:italic;color:var(--grey)}

/* back */
.ed-back{background:var(--blue);color:#fff}
.ed-b-ty{position:absolute;left:14mm;right:14mm;top:58mm}
.ed-b-out{font-family:var(--head);font-weight:700;font-size:72pt;line-height:.9;text-transform:uppercase;color:transparent;-webkit-text-stroke:.45mm #fff}
.ed-b-out.sm{font-size:48pt}
.ed-back h2,.ed-c-bottom h2{color:#fff;font-size:44pt;margin:5mm 0 4mm}
.ed-b-ty p{font-size:14pt;line-height:1.4;max-width:165mm}
.ed-back .dua .ar,.ed-closing .dua .ar{color:var(--yellow)}
.ed-b-low{position:absolute;left:14mm;right:14mm;bottom:14mm;height:84mm;display:flex;gap:9mm;border-top:.35mm solid #fff;padding-top:7mm}
.ed-b-ahead{flex:1.1;display:flex;flex-direction:column}
.ed-b-ahead h3{font-size:16pt;text-transform:uppercase;margin-bottom:2mm}
.ed-b-ahead .fit{flex:1;font-size:9.5pt}
.ed-b-ahead ul{margin:1mm 0 0 4mm}
.ed-rule.w{position:static;width:.35mm;background:#fff;flex:none}
.ed-b-r{flex:1;display:flex;flex-direction:column;justify-content:space-between}
.ed-b-r .verse blockquote{font-size:12pt}
.ed-b-r .verse figcaption{color:var(--yellow)}

/* 4-5 page combos */
.ed-is .ed-i-head{top:58mm}
.ed-stats.compact{top:96mm}
.ed-stats.compact .v{font-size:38pt}
.ed-pillars.compact{top:100mm;bottom:auto}
.ed-is-low{position:absolute;left:14mm;right:14mm;top:158mm;bottom:22mm;display:flex;gap:8mm;border-top:.6mm solid #111;padding-top:6mm}
.ed-is-photo{width:66mm;flex:none}
.ed-is-text{flex:1;display:flex;flex-direction:column;min-width:0}
.ed-is-text h3{font-size:19pt;text-transform:uppercase;margin:1.5mm 0 3mm}
.ed-is-text .fit{flex:1}
.ed-c-top{position:absolute;left:14mm;right:14mm;top:22mm;height:118mm}
.ed-c-top h2{margin:2mm 0 6mm}
.ed-c-row{display:flex;gap:10mm;align-items:flex-start}
.ed-c-row .ed-gift{margin:0;width:62mm;flex:none}
.ed-c-row .ed-sup{flex:1}
.ed-c-bottom{position:absolute;left:0;right:0;bottom:0;height:150mm;background:var(--blue);color:#fff;padding:14mm}
.ed-c-bottom p{font-size:12pt;max-width:165mm}
.ed-c-foot{position:absolute;left:14mm;right:14mm;bottom:12mm;display:flex;justify-content:space-between;align-items:flex-end;border-top:.35mm solid #fff;padding-top:5mm}
.ed-c-foot img{height:24mm}
`;

export default {
  id: 'editorial',
  name: 'Editorial',
  description: 'Magazine-style: giant outlined numbers, full-bleed photos, bold statements beside fine black rules.',
  bestFor: 'Trusts, foundations, major donors: formal and premium',
  get swatch() {
    return ['#111111', C.blue, '#ffffff'];
  },
  pages,
  css,
};
