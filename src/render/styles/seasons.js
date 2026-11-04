// STYLE 5: "Celebration": secondary colours with highlight line art (arched
// photo windows, sunbursts and sparkles). For seasonal and festive appeals.
import { C, esc, paras, bg, icon, lines, crescent, marker, contactBlock, duaBlock, verseBlock, signature, footer, logo, statsOrNothing, rand } from '../helpers.js';

const TEAL_ = () => lines({ base: C.teal, ink: '#fff', opacity: 0.2, angle: 50, gap: 7 });
const PURPLE_ = () => lines({ base: C.purple, ink: '#fff', opacity: 0.12, angle: 50, gap: 7 });
const sec = (cls, inner, style = '') => `<section class="page ss ${cls}"${style ? ` style="${style}"` : ''}>${inner}</section>`;
const arch = (url, cls = '', pos) => `<div class="ss-arch ${cls}"><div class="ph" ${bg(url, pos)}></div></div>`;
const stars = (cls = '') => `<svg class="ss-stars ${cls}" viewBox="0 0 60 40" fill="none" stroke="var(--yellow)" stroke-width="1.6" stroke-linejoin="round"><path d="M10 4l1.8 4.4 4.4 1.8-4.4 1.8L10 16.4l-1.8-4.4-4.4-1.8 4.4-1.8z"/><path d="M40 18l2.6 6.4 6.4 2.6-6.4 2.6L40 36l-2.6-6.4-6.4-2.6 6.4-2.6z"/><circle cx="28" cy="8" r="1.4" fill="var(--yellow)"/></svg>`;
const cap = (img) => (img?.caption ? `<div class="ss-cap">${esc(img.caption)}${img.illustrative ? ' (illustrative)' : ''}</div>` : '');
const statArches = (st) => `<div class="ss-stats n${st.length}">${st.map((s) => `<div class="st"><div class="v">${esc(s.value)}</div><div class="l">${esc(s.label)}</div></div>`).join('')}</div>`;
const pillars = (ctx, cls = '') => `<div class="ss-pillars ${cls}">${(ctx.copy.impact.pillars || []).slice(0, 3).map((p) => `<div class="pl"><div class="pl-i">${icon(p.icon)}</div><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></div>`).join('')}</div>`;
const supports = (ctx, cls = '') => `<div class="ss-sup ${cls}">${ctx.copy.money.supports.slice(0, 3).map((s) => `<div class="su"><div class="su-i">${icon(s.icon)}</div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`).join('')}</div>`;

const pages = {
  cover: (ctx) =>
    sec(
      'ss-cover',
      `${logo(ctx, 'white', 'logo-box')}
      ${crescent(C.yellow, 'ss-moon')}
      ${arch(ctx.cover?.url, 'ss-cv-arch')}
      <div class="ss-cv-text">
        <div class="kicker">${esc(ctx.copy.cover.kicker)}</div>
        ${marker(ctx.copy.cover.highlight, 'ss-hl')}
        <h1>${esc(ctx.copy.cover.title)}</h1>
        <p>${esc(ctx.copy.cover.subtitle)}</p>
      </div>
      <div class="ss-cv-foot"><span>Prepared for</span><strong>${esc(ctx.donorName)}</strong></div>`,
      `background-image:${TEAL_()}`
    ),

  letter: (ctx, n) =>
    sec(
      'ss-letter',
      `${logo(ctx, 'colour', 'logo-sm')}
      <aside class="ss-l-side" style="background-image:${PURPLE_()}">
        ${stars('l')}
        ${arch(ctx.ceo.photo, 'ss-l-arch', '58% 30%')}
        <div class="ss-l-name">${esc(ctx.ceo.name)}</div><div class="ss-l-title">${esc(ctx.ceo.title)}</div>
        ${verseBlock(ctx, 'ss-l-verse')}
      </aside>
      <div class="ss-l-main">
        <div class="kicker">A message from our CEO</div>
        <h2>${marker('Thank you', 'ss-hl')}</h2>
        <div class="ss-l-body fit" data-max="135"><p class="sal">${esc(ctx.copy.ceoLetter.salutation)}</p>${paras(ctx.copy.ceoLetter.paragraphs)}${signature(ctx)}</div>
      </div>
      ${footer(ctx, n, 'ss-pf')}`
    ),

  project: (ctx, n) =>
    sec(
      'ss-project',
      `<div class="ss-p-top" style="background-image:${PURPLE_()}">
        ${logo(ctx, 'white', 'logo-sm')}
        ${stars('p')}
        <div class="kicker">The project</div><h2>${esc(ctx.copy.project.heading)}</h2><p class="lead">${esc(ctx.copy.project.lead)}</p>
      </div>
      ${arch(ctx.projectImg?.url, 'ss-p-arch')}
      ${cap(ctx.projectImg)}
      <div class="ss-p-text fit" data-max="125">${paras(ctx.copy.project.paragraphs)}</div>
      <dl class="ss-facts">${ctx.copy.project.keyFacts.slice(0, 5).map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
      ${footer(ctx, n, 'ss-pf')}`
    ),

  impact: (ctx, n) => {
    const st = statsOrNothing(ctx);
    return sec(
      `ss-impact ${st.length >= 2 ? '' : 'no-stats'}`,
      `${logo(ctx, 'white', 'logo-sm')}
      ${crescent(C.yellow, 'ss-moon sm')}
      <div class="ss-i-head"><div class="kicker">Your impact</div><h2>${esc(ctx.copy.impact.heading)}</h2><p>${esc(ctx.copy.impact.intro)}</p></div>
      ${st.length >= 2 ? statArches(st) : ''}
      ${pillars(ctx)}
      ${footer(ctx, n, 'ss-pf light')}`,
      `background-image:${TEAL_()}`
    );
  },

  story: (ctx, n) => {
    const s = ctx.copy.story;
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    return sec(
      'ss-story',
      `${logo(ctx, 'colour', 'logo-sm')}
      ${arch(ctx.storyImg?.url, 'ss-s-arch')}
      ${cap(ctx.storyImg)}
      <div class="ss-s-main"><div class="kicker">A story of change</div><h2>${esc(s.heading)}</h2><div class="ss-s-text fit" data-max="125">${paras(s.paragraphs)}</div></div>
      <div class="ss-s-q" style="background-image:${PURPLE_()}">${stars('q')}<blockquote>${esc(q.t)}</blockquote>${q.a ? `<cite>${esc(q.a)}</cite>` : ''}</div>
      ${footer(ctx, n, 'ss-pf')}`
    );
  },

  gallery: (ctx, n) =>
    sec(
      'ss-gallery',
      `${logo(ctx, 'white', 'logo-sm')}
      ${stars('g')}
      <div class="ss-g-head"><div class="kicker">In pictures</div><h2>${esc(ctx.copy.gallery.heading)}</h2><p>${esc(ctx.copy.gallery.intro)}</p></div>
      <div class="ss-g-row c${ctx.gallery.length}">${ctx.gallery.map((g, i) => `<figure class="g${i}"><div class="ss-arch"><div class="ph" ${bg(g.url)}></div></div><figcaption>${esc(g.caption)}${g.illustrative ? ' (illustrative)' : ''}</figcaption></figure>`).join('')}</div>
      ${footer(ctx, n, 'ss-pf light')}`,
      `background-image:${TEAL_()}`
    ),

  money: (ctx, n) => {
    const m = ctx.copy.money;
    const max = Math.max(1, ...ctx.budget.map((b) => b.amount));
    return sec(
      'ss-money',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="ss-m-head"><div class="kicker">Accountability</div><h2>${esc(m.heading)}</h2><p>${esc(m.intro)}</p></div>
      <div class="ss-m-gift" style="background-image:${PURPLE_()}">${crescent(C.yellow, 'mg')}<span>${esc(ctx.givingType)}</span><strong>${esc(ctx.amount || 'With thanks')}</strong></div>
      <div class="ss-m-r">${ctx.budget.length ? `<h3>How it was spent</h3>${ctx.budget.map((b) => `<div class="sb"><div class="sb-t"><span>${esc(b.label)}</span><b>${rand(b.amount)}</b></div><div class="sb-bar"><i style="width:${((b.amount / max) * 100).toFixed(1)}%"></i></div></div>`).join('')}` : arch(ctx.moneyImg?.url, 'ss-m-arch')}</div>
      <div class="ss-m-sup"><h3>What your gift supports</h3>${supports(ctx)}</div>
      <p class="ss-note">${esc(m.note)}</p>
      ${footer(ctx, n, 'ss-pf')}`
    );
  },

  back: (ctx) => {
    const a = ctx.copy.ahead;
    return sec(
      'ss-back',
      `${logo(ctx, 'white', 'logo-box')}
      ${crescent(C.yellow, 'ss-moon big')}
      <div class="ss-b-ty">${marker('Thank you', 'ss-hl')}<h2>${esc(ctx.copy.thankYou.heading)}</h2><p>${esc(ctx.copy.thankYou.message)}</p>${duaBlock(ctx)}</div>
      <div class="ss-b-ahead"><h3>${esc(a.heading)}</h3><div class="fit">${paras(a.paragraphs)}</div></div>
      <div class="ss-b-foot">${verseBlock(ctx)}${contactBlock()}</div>`,
      `background-image:${PURPLE_()}`
    );
  },

  impactStory: (ctx, n) => {
    const st = statsOrNothing(ctx, 3);
    const s = ctx.copy.story;
    return sec(
      'ss-is',
      `<div class="ss-is-top" style="background-image:${TEAL_()}">${logo(ctx, 'white', 'logo-sm')}${crescent(C.yellow, 'ss-moon sm')}
        <div class="kicker">Your impact</div><h2>${esc(ctx.copy.impact.heading)}</h2>
        ${st.length >= 2 ? statArches(st) : ''}${pillars(ctx, 'row')}</div>
      <div class="ss-is-low">${arch(ctx.storyImg?.url, 'ss-is-arch')}
        <div class="ss-is-text"><div class="kicker">A story of change</div><h3>${esc(s.heading)}</h3>
          <div class="fit">${paras(s.paragraphs)}${s.quote ? `<blockquote>“${esc(s.quote)}”${s.quoteAttribution ? `<cite>${esc(s.quoteAttribution)}</cite>` : ''}</blockquote>` : ''}</div></div></div>
      ${footer(ctx, n, 'ss-pf')}`
    );
  },

  closing: (ctx) =>
    sec(
      'ss-closing',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="ss-c-top"><div class="kicker">Your gift at work</div><h2>${esc(ctx.copy.money.heading)}</h2>
        <div class="ss-c-row"><div class="ss-m-gift sm" style="background-image:${PURPLE_()}">${crescent(C.yellow, 'mg')}<span>${esc(ctx.givingType)}</span><strong>${esc(ctx.amount || 'With thanks')}</strong></div>${supports(ctx, 'col')}</div></div>
      <div class="ss-c-bottom" style="background-image:${PURPLE_()}">${crescent(C.yellow, 'ss-moon sm')}
        ${marker('Thank you', 'ss-hl')}<h2>${esc(ctx.copy.thankYou.heading)}</h2><p>${esc(ctx.copy.thankYou.message)}</p>${duaBlock(ctx)}
        <div class="ss-c-foot">${contactBlock()}<img src="${ctx.logos.white}" alt=""></div></div>`
    ),
};

const css = `
.ss{color:var(--ink)}
.ss .kicker{color:var(--purple)}
.ss h2{font-size:33pt;text-transform:uppercase;color:var(--purple)}
.ss-cover,.ss-impact,.ss-gallery,.ss-is-top{background-color:var(--teal);background-size:auto}
.ss-back,.ss-l-side,.ss-p-top,.ss-s-q,.ss-m-gift,.ss-c-bottom{background-color:var(--purple)}
.ss-hl{font-size:30pt}
.ss-pf{color:var(--grey)}.ss-pf b{color:var(--purple)}
.ss-pf.light,.ss-pf.light b{color:#fff}
.ss-arch{position:absolute;padding:2mm;border:1.4mm solid var(--yellow);border-radius:999mm 999mm 2mm 2mm;overflow:hidden}
.ss-arch .ph{width:100%;height:100%;border-radius:999mm 999mm 1mm 1mm}
.ss-moon{position:absolute;left:12mm;top:12mm;width:40mm;z-index:3}
.ss-moon.sm{width:26mm;left:auto;right:40mm;top:12mm}
.ss-stars{position:absolute;width:22mm}
.ss-cap{position:absolute;font-size:7.5pt;color:var(--grey);font-style:italic}
.ss .sig-script{color:var(--purple)}.ss .sig-name{color:var(--purple)}

/* cover */
.ss-cover{color:#fff}
.ss-cv-arch{left:38mm;right:38mm;top:30mm;height:150mm;box-shadow:0 0 0 3mm var(--teal),0 0 0 3.6mm rgba(252,222,30,.7)}
.ss-cv-text{position:absolute;left:14mm;right:14mm;top:190mm;text-align:center}
.ss-cv-text .kicker{color:#fff;margin-bottom:2mm}
.ss-cover .ss-hl{margin:1mm 0 3mm}
.ss-cover h1{font-size:38pt;line-height:.95;text-transform:uppercase;color:#fff}
.ss-cv-text p{font-size:12pt;margin-top:3mm;line-height:1.35}
.ss-cv-foot{position:absolute;left:0;right:0;bottom:0;height:24mm;background:var(--purple);display:flex;align-items:center;justify-content:center;gap:4mm;color:#fff}
.ss-cv-foot span{font-family:var(--head);font-weight:700;font-size:8pt;letter-spacing:.2em;text-transform:uppercase;color:var(--yellow)}
.ss-cv-foot strong{font-family:var(--head);font-size:15pt;text-transform:uppercase}

/* letter */
.ss-l-side{position:absolute;left:0;top:0;bottom:0;width:68mm;color:#fff;padding:24mm 8mm 16mm;display:flex;flex-direction:column;align-items:center;text-align:center}
.ss-stars.l{top:10mm;left:6mm}
.ss-l-arch{position:relative;width:48mm;height:64mm}
.ss-l-name{font-family:var(--head);font-weight:700;font-size:16pt;text-transform:uppercase;margin-top:6mm}
.ss-l-title{font-size:8.5pt;opacity:.9}
.ss-l-verse{margin-top:auto;text-align:left}
.ss-l-verse blockquote{font-size:11.5pt}
.ss-l-verse figcaption{color:var(--yellow)}
.ss-l-main{position:absolute;left:78mm;right:14mm;top:30mm;bottom:20mm;display:flex;flex-direction:column}
.ss-l-main h2 .hl{font-size:38pt;margin:2mm 0 5mm}
.ss-l-body{flex:1}
.ss-l-body p{font-size:10.5pt;line-height:1.6}
.ss-l-body .sal{font-family:var(--head);font-weight:700;font-size:13.5pt;color:var(--purple)}
.ss-letter .pf{left:78mm}

/* project */
.ss-p-top{position:absolute;left:0;right:0;top:0;height:112mm;color:#fff;padding:24mm 92mm 0 14mm}
.ss-p-top .kicker{color:var(--yellow)}
.ss-p-top h2{color:#fff;margin:2mm 0 4mm;font-size:30pt}
.ss-p-top .lead{font-family:var(--head);font-weight:500;font-size:13pt;line-height:1.3}
.ss-stars.p{right:16mm;top:44mm;width:16mm}
.ss-p-arch{right:14mm;top:38mm;width:74mm;height:112mm;background:#fff;z-index:2}
.ss-project .ss-cap{right:14mm;top:152mm}
.ss-p-text{position:absolute;left:14mm;right:96mm;top:122mm;bottom:56mm}
.ss-facts{position:absolute;left:14mm;right:14mm;bottom:20mm;height:28mm;display:flex;gap:3mm}
.ss-facts div{flex:1;border:1mm solid var(--teal);border-radius:12mm 12mm 1mm 1mm;padding:4mm 3mm 2mm;text-align:center;display:flex;flex-direction:column;justify-content:center}
.ss-facts dt{font-family:var(--head);font-weight:700;font-size:7pt;letter-spacing:.12em;text-transform:uppercase;color:var(--purple)}
.ss-facts dd{font-family:var(--head);font-weight:700;font-size:10pt;line-height:1.1}

/* impact */
.ss-impact{color:#fff}
.ss-impact .kicker,.ss-gallery .kicker,.ss-is-top .kicker{color:#fff}
.ss-i-head{position:absolute;left:14mm;right:70mm;top:22mm}
.ss-i-head h2{color:#fff;font-size:42pt;margin:2mm 0 4mm}
.ss-i-head p{font-size:12pt}
.ss-stats{position:absolute;left:14mm;right:14mm;top:94mm;display:grid;grid-template-columns:repeat(4,1fr);gap:4mm}
.ss-stats.n2{grid-template-columns:repeat(2,1fr)}.ss-stats.n3{grid-template-columns:repeat(3,1fr)}
.ss-stats .st{background:#fff;color:var(--purple);border-radius:999mm 999mm 2mm 2mm;padding:12mm 3mm 6mm;text-align:center;border-bottom:2mm solid var(--yellow);min-height:46mm;display:flex;flex-direction:column;justify-content:center}
.ss-stats .v{font-family:var(--head);font-weight:700;font-size:28pt;line-height:1}
.ss-stats .l{font-family:var(--head);font-weight:700;font-size:8.5pt;text-transform:uppercase;letter-spacing:.05em;margin-top:1.5mm;color:var(--ink)}
.ss-pillars{position:absolute;left:14mm;right:14mm;bottom:22mm;display:grid;gap:4mm}
.ss-pillars .pl{display:flex;gap:5mm;align-items:center;background:rgba(255,255,255,.14);border:.6mm solid rgba(255,255,255,.55);border-radius:3mm;padding:5mm 6mm}
.ss-pillars .pl-i{flex:none;width:16mm;height:16mm;border-radius:50%;border:.8mm solid var(--yellow);color:var(--yellow);padding:3mm}
.ss-pillars h3{font-size:14pt;text-transform:uppercase}
.ss-pillars p{font-size:10pt;margin-top:1mm;line-height:1.4}
.ss-impact.no-stats .ss-pillars{top:96mm;gap:6mm}
.ss-impact.no-stats .ss-pillars .pl{padding:9mm 7mm}
.ss-impact.no-stats .ss-pillars h3{font-size:19pt}

/* story */
.ss-s-arch{left:14mm;top:22mm;width:84mm;height:128mm;background:#fff}
.ss-story .ss-cap{left:14mm;top:152mm;width:84mm}
.ss-s-main{position:absolute;left:108mm;right:14mm;top:36mm;bottom:96mm;display:flex;flex-direction:column}
.ss-s-main h2{font-size:26pt;margin:2mm 0 4mm}
.ss-s-text{flex:1}
.ss-s-q{position:absolute;left:14mm;right:14mm;bottom:20mm;height:64mm;border-radius:32mm 32mm 2mm 2mm;color:#fff;padding:14mm 24mm 8mm;text-align:center;display:flex;flex-direction:column;justify-content:center}
.ss-stars.q{left:10mm;top:8mm}
.ss-s-q blockquote{font-family:var(--head);font-weight:500;font-size:17pt;line-height:1.25}
.ss-s-q cite{display:block;font-style:normal;font-family:var(--head);font-weight:700;font-size:9pt;letter-spacing:.16em;text-transform:uppercase;color:var(--yellow);margin-top:3mm}

/* gallery */
.ss-gallery{color:#fff}
.ss-stars.g{right:42mm;top:22mm}
.ss-g-head{position:absolute;left:14mm;right:70mm;top:22mm}
.ss-g-head h2{color:#fff;margin:2mm 0 3mm}
.ss-g-row{position:absolute;left:12mm;right:12mm;top:76mm;bottom:22mm;display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:1fr;gap:6mm 5mm}
.ss-g-row figure{display:flex;flex-direction:column;min-height:0}
.ss-g-row .ss-arch{position:relative;flex:1;min-height:0;background:#fff}
.ss-g-row figcaption{font-size:7.5pt;margin-top:1.5mm;text-align:center}
.ss-g-row.c2{grid-template-columns:repeat(2,1fr)}
.ss-g-row.c4{grid-template-columns:repeat(2,1fr)}
.ss-g-row.c5 .g0{grid-row:span 2}

/* money */
.ss-m-head{position:absolute;left:14mm;right:46mm;top:22mm}
.ss-m-head h2{margin:2mm 0 3mm}
.ss-m-head p{font-size:11.5pt}
.ss-m-gift{position:absolute;left:14mm;top:72mm;width:72mm;height:92mm;border-radius:999mm 999mm 2mm 2mm;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:0 5mm 10mm;text-align:center;border-bottom:2mm solid var(--yellow)}
.ss-m-gift .mg{width:26mm;margin-bottom:auto;margin-top:12mm}
.ss-m-gift span{font-family:var(--head);font-weight:700;font-size:8.5pt;letter-spacing:.16em;text-transform:uppercase;color:var(--yellow)}
.ss-m-gift strong{font-family:var(--head);font-weight:700;font-size:28pt;line-height:1}
.ss-m-gift.sm{position:static;width:60mm;height:76mm;flex:none}
.ss-m-gift.sm strong{font-size:21pt}
.ss-m-gift.sm .mg{width:20mm;margin-top:9mm}
.ss-m-r{position:absolute;left:96mm;right:14mm;top:76mm;height:88mm}
.ss-m-r h3,.ss-m-sup h3{font-size:13pt;text-transform:uppercase;color:var(--purple);margin-bottom:3mm}
.sb{margin-bottom:3.4mm}
.sb-t{display:flex;justify-content:space-between;font-size:9.5pt;gap:3mm}
.sb-t b{font-family:var(--head);white-space:nowrap;color:var(--purple)}
.sb-bar{height:4mm;background:#eee;border-radius:2mm;margin-top:1mm;overflow:hidden}
.sb-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--teal),var(--purple))}
.ss-m-arch{position:relative;width:100%;height:100%}
.ss-m-sup{position:absolute;left:14mm;right:14mm;top:176mm;bottom:30mm}
.ss-sup{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.ss-sup .su{border:1mm solid var(--teal);border-radius:16mm 16mm 2mm 2mm;padding:9mm 5mm 5mm;text-align:center}
.ss-sup .su-i{width:14mm;height:14mm;margin:0 auto 3mm;color:var(--purple)}
.ss-sup h4{font-family:var(--head);font-weight:700;font-size:12.5pt;text-transform:uppercase;color:var(--purple);margin-bottom:1.5mm}
.ss-sup p{font-size:9pt;line-height:1.4;margin:0}
.ss-note{position:absolute;left:14mm;right:14mm;bottom:19mm;font-size:8.5pt;font-style:italic;color:var(--grey)}

/* back */
.ss-back{color:#fff}
.ss-moon.big{left:14mm;top:14mm;width:38mm}
.ss-b-ty{position:absolute;left:14mm;right:14mm;top:60mm}
.ss-back h2,.ss-c-bottom h2{color:#fff;font-size:46pt;margin:4mm 0 3mm}
.ss-b-ty p{font-size:13.5pt;line-height:1.4;max-width:150mm}
.ss-back .dua .ar,.ss-c-bottom .dua .ar{color:var(--yellow)}
.ss-b-ahead{position:absolute;left:14mm;right:14mm;top:176mm;height:52mm;border:.6mm solid rgba(255,255,255,.5);border-radius:3mm;padding:6mm 7mm;display:flex;flex-direction:column}
.ss-b-ahead h3{font-size:15pt;text-transform:uppercase;color:var(--yellow);margin-bottom:2mm}
.ss-b-ahead .fit{flex:1}
.ss-b-foot{position:absolute;left:14mm;right:14mm;bottom:14mm;display:flex;justify-content:space-between;align-items:flex-end;gap:10mm;border-top:.35mm solid rgba(255,255,255,.5);padding-top:5mm}
.ss-b-foot .verse{max-width:95mm}
.ss-b-foot .verse blockquote{font-size:11.5pt}
.ss-b-foot .verse figcaption{color:var(--yellow)}
.ss-b-foot .contact{text-align:right}

/* combos */
.ss-is-top{position:absolute;left:0;right:0;top:0;height:162mm;color:#fff;padding:22mm 14mm 0}
.ss-is-top h2{color:#fff;font-size:36pt;margin:2mm 0 5mm}
.ss-is-top .ss-stats{position:static;margin-bottom:6mm}
.ss-is-top .ss-stats .st{min-height:36mm;padding-top:9mm}
.ss-is-top .ss-stats .v{font-size:23pt}
.ss-pillars.row{position:static;grid-template-columns:repeat(3,1fr)}
.ss-pillars.row .pl{flex-direction:column;align-items:flex-start;gap:2mm;padding:4mm}
.ss-pillars.row .pl-i{width:12mm;height:12mm;padding:2.2mm}
.ss-pillars.row h3{font-size:11.5pt}.ss-pillars.row p{font-size:8.5pt}
.ss-is-low{position:absolute;left:14mm;right:14mm;top:172mm;bottom:20mm;display:flex;gap:8mm}
.ss-is-arch{position:relative;width:62mm;flex:none;background:#fff}
.ss-is-text{flex:1;display:flex;flex-direction:column;min-width:0}
.ss-is-text h3{font-size:19pt;text-transform:uppercase;color:var(--purple);margin:1.5mm 0 3mm}
.ss-is-text .fit{flex:1}
.ss-is-text blockquote{font-family:var(--head);font-weight:500;font-size:12.5pt;color:var(--purple)}
.ss-is-text cite{display:block;font-style:normal;font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:var(--teal)}
.ss-c-top{position:absolute;left:14mm;right:14mm;top:22mm;height:118mm}
.ss-c-top h2{margin:2mm 0 6mm}
.ss-c-row{display:flex;gap:8mm;align-items:center}
.ss-sup.col{grid-template-columns:1fr;flex:1;gap:3mm}
.ss-sup.col .su{display:grid;grid-template-columns:12mm 1fr;grid-template-rows:auto auto;column-gap:4mm;text-align:left;border-radius:3mm;padding:3.5mm 4mm;align-items:center}
.ss-sup.col .su-i{grid-row:span 2;margin:0;width:11mm;height:11mm}
.ss-sup.col h4{margin:0}
.ss-c-bottom{position:absolute;left:0;right:0;bottom:0;height:150mm;color:#fff;padding:16mm 14mm;border-radius:40mm 40mm 0 0}
.ss-c-bottom .ss-moon.sm{right:16mm;top:14mm}
.ss-c-bottom p{font-size:12pt;max-width:160mm}
.ss-c-foot{position:absolute;left:14mm;right:14mm;bottom:12mm;display:flex;justify-content:space-between;align-items:flex-end;border-top:.35mm solid rgba(255,255,255,.5);padding-top:5mm}
.ss-c-foot img{height:24mm}
`;

export default {
  id: 'seasons',
  name: 'Celebration',
  description: 'Secondary colours with arched photo windows, sunbursts and sparkles: calm, warm and celebratory.',
  bestFor: 'Seasonal and festive appeals, anniversaries, year-end thank-yous and legacy gifts',
  get swatch() {
    return [C.teal, C.purple, C.yellow];
  },
  pages,
  css,
};
