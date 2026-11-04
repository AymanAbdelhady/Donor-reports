// STYLE 2: "Photo Frame": photography-led, inspired by the Brand Book's
// "Funding Futures" booklet: full-bleed images, bold green outline frames,
// colour-coded sections from the secondary palette.
import { C, esc, paras, bg, icon, texture, marker, contactBlock, duaBlock, verseBlock, signature, footer, logo, statsOrNothing } from '../helpers.js';

const tex = (base, circles = [[0.9, 0.1, 0.5], [0.05, 1, 0.6]], ink = '#fff', opacity = 0.16) => texture({ base, ink, opacity, circles });
const sec = (cls, inner, style = '') => `<section class="page fr ${cls}"${style ? ` style="${style}"` : ''}>${inner}</section>`;
const cap = (img, cls = '') => (img?.caption ? `<div class="fr-cap ${cls}">${esc(img.caption)}${img.illustrative ? ' <span class="illus">(illustrative)</span>' : ''}</div>` : '');
const stripes = '<div class="fr-stripes"><i></i><i></i><i></i><i></i></div>';

const statsFrames = (stats) => `<div class="fr-stats n${stats.length}">${stats.map((s) => `<div class="st"><div class="v">${esc(s.value)}</div><div class="l">${esc(s.label)}</div></div>`).join('')}</div>`;
const pillars = (ctx, cls = '') => `<div class="fr-pillars ${cls}">${(ctx.copy.impact.pillars || []).slice(0, 3).map((p) => `<div class="pl"><div class="pl-i">${icon(p.icon)}</div><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></div>`).join('')}</div>`;
const supports = (ctx, cls = '') => `<div class="fr-supports ${cls}">${ctx.copy.money.supports.slice(0, 3).map((s) => `<div class="su"><div class="su-i">${icon(s.icon)}</div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`).join('')}</div>`;

const pages = {
  cover: (ctx) =>
    sec(
      'fr-cover',
      `<div class="fr-cv-photo ph" ${bg(ctx.cover?.url)}></div><div class="fr-cv-shade"></div>
      ${logo(ctx, 'box', 'logo-box')}
      <div class="fr-cv-frame">
        ${marker(ctx.copy.cover.highlight, 'fr-cv-hl')}
        <h1>${esc(ctx.copy.cover.title)}</h1>
      </div>
      <p class="fr-cv-sub">${esc(ctx.copy.cover.subtitle)}</p>
      <div class="fr-cv-band">${stripes}
        <div><span>Prepared for</span><strong>${esc(ctx.donorName)}</strong></div>
        <div class="r"><span>${esc(ctx.copy.cover.kicker)}</span><strong>${esc(ctx.period || ctx.brand.tagline)}</strong></div>
      </div>`
    ),

  letter: (ctx, n) =>
    sec(
      'fr-letter',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="fr-l-head">
        <div class="fr-l-photo ph" ${bg(ctx.ceo.photo, '58% 30%')}></div>
        <div><div class="kicker">A message from our CEO</div><h2>${marker('Thank you', 'fr-l-hl')}</h2></div>
      </div>
      <div class="fr-l-card"><div class="fr-l-body fit" data-max="135">
        <p class="sal">${esc(ctx.copy.ceoLetter.salutation)}</p>${paras(ctx.copy.ceoLetter.paragraphs)}${signature(ctx)}
      </div></div>
      <div class="fr-l-side">${verseBlock(ctx)}<div class="fr-l-pic ph" ${bg(ctx.storyImg?.url)}></div></div>
      ${footer(ctx, n, 'fr-pf')}`
    ),

  project: (ctx, n) =>
    sec(
      'fr-project',
      `<div class="fr-p-photo ph" ${bg(ctx.projectImg?.url)}></div><div class="fr-p-shade"></div>
      ${logo(ctx, 'box', 'logo-sm')}
      <div class="fr-p-frame"><div class="kicker">The project</div><h2>${esc(ctx.copy.project.heading)}</h2></div>
      ${cap(ctx.projectImg, 'fr-p-cap')}
      <dl class="fr-facts">${ctx.copy.project.keyFacts.slice(0, 5).map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
      <div class="fr-p-text fit" data-max="125"><p class="lead">${esc(ctx.copy.project.lead)}</p>${paras(ctx.copy.project.paragraphs)}</div>
      ${footer(ctx, n, 'fr-pf')}`
    ),

  impact: (ctx, n) => {
    const stats = statsOrNothing(ctx);
    return sec(
      `fr-impact ${stats.length >= 2 ? '' : 'no-stats'}`,
      `${logo(ctx, 'white', 'logo-sm')}
      <div class="fr-i-head"><div class="kicker">Your impact</div><h2>${esc(ctx.copy.impact.heading)}</h2><p>${esc(ctx.copy.impact.intro)}</p></div>
      <div class="fr-i-photo ph" ${bg(ctx.impactImg?.url)}></div>
      ${stats.length >= 2 ? statsFrames(stats) : ''}
      ${pillars(ctx)}
      ${footer(ctx, n, 'fr-pf light')}`,
      `background-image:${tex(C.teal)}`
    );
  },

  story: (ctx, n) => {
    const s = ctx.copy.story;
    const q = s.quote ? { t: s.quote, a: s.quoteAttribution } : { t: ctx.verse.text, a: ctx.verse.ref };
    return sec(
      'fr-story',
      `<div class="fr-s-photo ph" ${bg(ctx.storyImg?.url)}></div><div class="fr-s-shade"></div>
      ${logo(ctx, 'box', 'logo-sm')}
      <div class="fr-s-quote"><span class="qm">“</span><blockquote>${esc(q.t)}</blockquote>${q.a ? `<cite>${esc(q.a)}</cite>` : ''}</div>
      <div class="fr-s-panel">
        <div class="kicker">A story of change</div><h2>${esc(s.heading)}</h2>
        <div class="fr-s-text fit" data-max="125">${paras(s.paragraphs)}</div>
      </div>
      ${cap(ctx.storyImg, 'fr-s-cap')}
      ${footer(ctx, n, 'fr-pf')}`
    );
  },

  gallery: (ctx, n) =>
    sec(
      'fr-gallery',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="fr-g-head"><div class="kicker">In pictures</div><h2>${esc(ctx.copy.gallery.heading)}</h2><p>${esc(ctx.copy.gallery.intro)}</p></div>
      <div class="fr-g-grid c${ctx.gallery.length}">${ctx.gallery.map((g, i) => `<figure class="g${i}"><div class="ph" ${bg(g.url)}></div><figcaption>${esc(g.caption)}${g.illustrative ? ' <span class="illus">(illustrative)</span>' : ''}</figcaption></figure>`).join('')}</div>
      ${footer(ctx, n, 'fr-pf')}`
    ),

  money: (ctx, n) => {
    const m = ctx.copy.money;
    const max = Math.max(1, ...ctx.budget.map((b) => b.amount));
    return sec(
      'fr-money',
      `<div class="fr-m-top" style="background-image:${tex(C.purple, [[1, 0, 0.6], [0.1, 1.1, 0.5]])}">
        ${logo(ctx, 'white', 'logo-sm')}
        <div class="kicker">Accountability</div><h2>${esc(m.heading)}</h2>
        <div class="fr-m-gift"><span>${esc(ctx.givingType)}</span><strong>${esc(ctx.amount || 'With thanks')}</strong></div>
        <p class="fr-m-intro">${esc(m.intro)}</p>
      </div>
      ${ctx.budget.length
        ? `<div class="fr-bars"><h3>How it was spent</h3>${ctx.budget.map((b, i) => `<div class="fb-row"><div class="fb-l">${esc(b.label)}</div><div class="fb-t"><span class="sw${i % 6}" style="width:${((b.amount / max) * 100).toFixed(1)}%"></span></div><div class="fb-v">R&nbsp;${Math.round(b.amount).toLocaleString('en-ZA').replace(/[,\s ]/g, ' ')} <em>${Math.round((b.amount / ctx.budgetTotal) * 100)}%</em></div></div>`).join('')}</div>`
        : `<div class="fr-m-photo ph" ${bg(ctx.moneyImg?.url)}></div>`}
      <h3 class="fr-m-sub">What your gift supports</h3>
      ${supports(ctx)}
      <p class="fr-note">${esc(m.note)}</p>
      ${footer(ctx, n, 'fr-pf')}`
    );
  },

  back: (ctx) => {
    const a = ctx.copy.ahead;
    return sec(
      'fr-back',
      `<div class="fr-b-photo ph" ${bg(ctx.backImg?.url)}></div><div class="fr-b-shade"></div>
      ${logo(ctx, 'box', 'logo-box')}
      <div class="fr-b-frame">${marker('Thank you', 'fr-b-hl')}<h2>${esc(ctx.copy.thankYou.heading)}</h2><p>${esc(ctx.copy.thankYou.message)}</p>${duaBlock(ctx)}</div>
      <div class="fr-b-band">${stripes}
        <div class="fr-b-ahead"><h3>${esc(a.heading)}</h3><div class="fit">${paras(a.paragraphs)}</div></div>
        <div class="fr-b-right">${verseBlock(ctx)}${contactBlock()}</div>
      </div>`
    );
  },

  impactStory: (ctx, n) => {
    const stats = statsOrNothing(ctx, 3);
    const s = ctx.copy.story;
    return sec(
      'fr-is',
      `<div class="fr-is-top" style="background-image:${tex(C.teal)}">
        ${logo(ctx, 'white', 'logo-sm')}
        <div class="kicker">Your impact</div><h2>${esc(ctx.copy.impact.heading)}</h2>
        ${stats.length >= 2 ? statsFrames(stats) : ''}
        ${pillars(ctx, stats.length >= 2 ? 'row' : 'row big')}
      </div>
      <div class="fr-is-bottom">
        <div class="fr-is-photo"><div class="ph" ${bg(ctx.storyImg?.url)}></div></div>
        <div class="fr-is-text"><div class="kicker">A story of change</div><h3>${esc(s.heading)}</h3>
          <div class="fit">${paras(s.paragraphs)}${s.quote ? `<blockquote>“${esc(s.quote)}”${s.quoteAttribution ? `<cite>${esc(s.quoteAttribution)}</cite>` : ''}</blockquote>` : ''}</div></div>
      </div>
      ${footer(ctx, n, 'fr-pf')}`
    );
  },

  closing: (ctx) =>
    sec(
      'fr-closing',
      `<div class="fr-c-top" style="background-image:${tex(C.purple, [[1, 0, 0.6]])}">
        ${logo(ctx, 'white', 'logo-sm')}
        <div class="kicker">Your gift at work</div><h2>${esc(ctx.copy.money.heading)}</h2>
        <div class="fr-m-gift"><span>${esc(ctx.givingType)}</span><strong>${esc(ctx.amount || 'With thanks')}</strong></div>
        ${supports(ctx, 'light')}
      </div>
      <div class="fr-c-bottom"><div class="fr-b-photo ph" ${bg(ctx.backImg?.url)}></div><div class="fr-b-shade"></div>
        <div class="fr-c-frame">${marker('Thank you', 'fr-b-hl')}<h2>${esc(ctx.copy.thankYou.heading)}</h2><p>${esc(ctx.copy.thankYou.message)}</p>${duaBlock(ctx)}</div>
        <div class="fr-c-contact">${contactBlock()}</div>
      </div>`
    ),
};

const css = `
.fr{color:var(--ink)}
.fr .kicker{color:var(--green)}
.fr h2{font-size:34pt;text-transform:uppercase;color:var(--blue)}
.fr .lead{font-family:var(--head);font-weight:600;font-size:14pt;line-height:1.25;color:var(--purple)}
.fr-pf{color:var(--grey)}
.fr-pf b{color:var(--blue)}
.fr-pf.light,.fr-pf.light b{color:#fff}
.fr-cap{position:absolute;font-size:7.5pt;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.7);z-index:6}
.fr-stripes{position:absolute;left:0;right:0;top:0;height:2.4mm;display:flex}
.fr-stripes i{flex:1}.fr-stripes i:nth-child(1){background:var(--blue)}.fr-stripes i:nth-child(2){background:var(--green)}.fr-stripes i:nth-child(3){background:var(--teal)}.fr-stripes i:nth-child(4){background:var(--purple)}
.fr-impact,.fr-money .fr-m-top,.fr-is-top,.fr-c-top{background-color:var(--teal);background-size:cover}
.fr-money .fr-m-top,.fr-c-top{background-color:var(--purple)}

/* cover */
.fr-cv-photo{position:absolute;inset:0 0 40mm 0}
.fr-cv-shade{position:absolute;inset:0 0 40mm 0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,.05) 45%,rgba(0,0,0,.62) 100%)}
.fr-cv-frame{position:absolute;left:14mm;right:24mm;bottom:86mm;border:2.8mm solid var(--green);padding:9mm 9mm 8mm;z-index:3}
.fr-cv-hl{font-size:32pt;transform:rotate(-2deg);position:absolute;top:-11mm;left:7mm}
.fr-cover h1{font-size:50pt;line-height:.92;color:#fff;text-transform:uppercase;text-shadow:0 2px 14px rgba(0,0,0,.35)}
.fr-cv-sub{position:absolute;left:14mm;right:30mm;bottom:54mm;color:#fff;font-size:13pt;line-height:1.35;z-index:3;text-shadow:0 1px 6px rgba(0,0,0,.5)}
.fr-cv-band{position:absolute;left:0;right:0;bottom:0;height:40mm;background:#fff;display:flex;justify-content:space-between;align-items:center;padding:4mm 14mm 0}
.fr-cv-band span{display:block;font-family:var(--head);font-weight:700;font-size:8pt;letter-spacing:.2em;text-transform:uppercase;color:var(--green)}
.fr-cv-band strong{font-family:var(--head);font-weight:800;font-size:17pt;color:var(--blue);text-transform:uppercase;line-height:1.05}
.fr-cv-band .r{text-align:right}
.fr-cv-band .r strong{font-size:12pt;color:var(--purple)}

/* letter */
.fr-letter{background:var(--warm)}
.fr-l-head{position:absolute;left:14mm;right:40mm;top:16mm;display:flex;gap:7mm;align-items:center;z-index:3}
.fr-l-photo{width:46mm;height:46mm;flex:none;border-radius:50%;border:2.2mm solid #fff;box-shadow:0 0 0 1.6mm var(--green)}
.fr-l-hl{font-size:38pt;transform:rotate(-2deg);margin-top:2mm}
.fr-l-card{position:absolute;left:14mm;width:128mm;top:72mm;bottom:22mm;background:#fff;padding:12mm 12mm 10mm;box-shadow:4.5mm 4.5mm 0 0 var(--green)}
.fr-l-body{height:100%}
.fr-l-side{position:absolute;left:150mm;right:12mm;top:72mm;bottom:22mm;display:flex;flex-direction:column;gap:8mm}
.fr-l-side .verse{border:1.6mm solid var(--green);padding:6mm 5mm}
.fr-l-side .verse blockquote{font-size:12pt;color:var(--blue)}
.fr-l-side .verse figcaption{color:var(--purple)}
.fr-l-pic{flex:1;box-shadow:3mm 3mm 0 var(--teal)}
.fr-l-body p{font-size:10.5pt;line-height:1.6}
.fr-l-body .sal{font-family:var(--head);font-weight:700;font-size:14pt;color:var(--blue)}
.fr .sig{break-inside:avoid}
.fr .sig-script{color:var(--blue)}
.fr .sig-name{color:var(--purple)}

/* project */
.fr-p-photo{position:absolute;left:0;right:0;top:0;height:150mm}
.fr-p-shade{position:absolute;left:0;right:0;top:0;height:150mm;background:linear-gradient(180deg,rgba(0,0,0,.25),rgba(0,0,0,0) 30%,rgba(0,0,0,.45))}
.fr-p-frame{position:absolute;left:14mm;top:90mm;max-width:150mm;border:2.4mm solid var(--green);padding:6mm 8mm;z-index:3}
.fr-p-frame h2{color:#fff;font-size:32pt;margin-top:1mm;text-shadow:0 2px 10px rgba(0,0,0,.3)}
.fr-p-cap{right:12mm;top:143mm}
.fr-facts{position:absolute;left:0;right:0;top:150mm;height:28mm;background:var(--blue);color:#fff;display:flex;padding:0 10mm}
.fr-facts div{flex:1;padding:5mm 3mm;border-right:.3mm solid rgba(255,255,255,.35);display:flex;flex-direction:column;justify-content:center}
.fr-facts div:last-child{border:0}
.fr-facts dt{font-family:var(--head);font-weight:700;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:var(--yellow)}
.fr-facts dd{font-family:var(--head);font-weight:700;font-size:10.5pt;line-height:1.1}
.fr-p-text{position:absolute;left:14mm;right:14mm;top:188mm;bottom:20mm;columns:2;column-gap:9mm;column-fill:balance}

/* impact */
.fr-impact{color:#fff}
.fr-impact .kicker,.fr-is-top .kicker{color:#fff;opacity:.9}
.fr-i-head{position:absolute;left:14mm;top:20mm;width:105mm}
.fr-i-head h2,.fr-is-top h2{color:#fff;font-size:44pt;margin:2mm 0 4mm}
.fr-i-head p{font-size:12pt;line-height:1.4}
.fr-i-photo{position:absolute;right:14mm;top:30mm;width:62mm;height:76mm;box-shadow:3.5mm 3.5mm 0 var(--green);border:1.4mm solid #fff}
.fr-stats{position:absolute;left:14mm;right:14mm;top:118mm;display:grid;grid-template-columns:1fr 1fr;gap:5mm}
.fr-stats.n3{grid-template-columns:repeat(3,1fr)}
.fr-stats .st{border:1mm solid #fff;padding:5mm 6mm}
.fr-stats .st:nth-child(odd){border-color:var(--green)}
.fr-stats .v{font-family:var(--head);font-weight:800;font-size:40pt;line-height:1;letter-spacing:-.02em}
.fr-stats .l{font-family:var(--head);font-weight:700;font-size:10.5pt;text-transform:uppercase;letter-spacing:.06em;margin-top:1.5mm}
.fr-pillars{position:absolute;left:14mm;right:14mm;bottom:22mm;display:grid;grid-template-columns:1fr;gap:3mm}
.fr-pillars .pl{background:#fff;color:var(--ink);display:flex;gap:5mm;align-items:center;padding:4mm 6mm;border-left:2.4mm solid var(--green)}
.fr-pillars .pl-i{flex:none;width:14mm;height:14mm;border-radius:50%;background:var(--green);color:#fff;padding:3mm}
.fr-pillars h3{font-size:13pt;text-transform:uppercase;color:var(--blue)}
.fr-pillars p{font-size:9.5pt;line-height:1.35;margin:.6mm 0 0}
.fr-impact.no-stats .fr-pillars{top:122mm;gap:5mm}
.fr-impact.no-stats .fr-pillars .pl{padding:8mm 7mm}
.fr-impact.no-stats .fr-pillars h3{font-size:18pt}
.fr-impact.no-stats .fr-pillars p{font-size:11pt}

/* story */
.fr-s-photo{position:absolute;inset:0}
.fr-s-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.15) 34%,rgba(0,0,0,0) 50%)}
.fr-s-quote{position:absolute;left:14mm;right:40mm;top:22mm;color:#fff;z-index:3}
.fr-s-quote .qm{font-family:var(--marker);font-size:80pt;line-height:.6;color:var(--yellow);display:block;height:12mm}
.fr-s-quote blockquote{font-family:var(--marker);font-size:25pt;line-height:1.15;text-shadow:0 2px 10px rgba(0,0,0,.5)}
.fr-s-quote cite{display:block;font-style:normal;font-family:var(--head);font-weight:700;font-size:9pt;letter-spacing:.16em;text-transform:uppercase;margin-top:3mm;color:var(--yellow)}
.fr-s-panel{position:absolute;left:14mm;right:14mm;bottom:20mm;height:112mm;background:#fff;padding:9mm 10mm 8mm;border-top:2.8mm solid var(--green);display:flex;flex-direction:column;z-index:3}
.fr-s-panel h2{font-size:26pt;margin:1.5mm 0 4mm}
.fr-s-text{flex:1;columns:2;column-gap:8mm;column-fill:balance}
.fr-s-cap{right:14mm;bottom:134mm}
.fr-story .pf{bottom:7mm;color:#fff}
.fr-story .pf b{color:#fff}

/* gallery */
.fr-g-head{position:absolute;left:14mm;right:40mm;top:20mm}
.fr-g-head h2{margin:2mm 0 3mm}
.fr-g-head p{font-size:11pt;color:var(--grey)}
.fr-g-grid{position:absolute;left:14mm;right:14mm;top:62mm;bottom:20mm;display:grid;grid-template-columns:repeat(6,1fr);grid-template-rows:1.7fr 1fr 1fr;gap:6mm 4mm}
.fr-g-grid figure{display:flex;flex-direction:column;min-height:0;grid-column:span 3}
.fr-g-grid .ph{flex:1;min-height:0}
.fr-g-grid figcaption{font-size:7.5pt;color:var(--grey);margin-top:1.5mm;flex:none}
.fr-g-grid .g0{grid-column:1/-1}
.fr-g-grid .g0 .ph{box-shadow:3.5mm 3.5mm 0 var(--green)}
.fr-g-grid.c2{grid-template-rows:1.3fr 1fr}.fr-g-grid.c2 .g1{grid-column:1/-1}
.fr-g-grid.c3{grid-template-rows:1.4fr 1fr}
.fr-g-grid.c4{grid-template-rows:1.4fr 1fr}.fr-g-grid.c4 figure:not(.g0){grid-column:span 2}
.fr-g-grid.c6 .g1,.fr-g-grid.c6 .g2,.fr-g-grid.c6 .g3{grid-column:span 2}

/* money */
.fr-m-top{position:absolute;left:0;right:0;top:0;height:112mm;color:#fff;padding:22mm 14mm 0}
.fr-m-top .kicker,.fr-c-top .kicker{color:var(--yellow)}
.fr-m-top h2,.fr-c-top h2{color:#fff;margin:2mm 0 5mm}
.fr-m-gift{display:inline-flex;flex-direction:column;border:2.4mm solid var(--green);padding:4mm 7mm}
.fr-m-gift span{font-family:var(--head);font-weight:700;font-size:8.5pt;letter-spacing:.18em;text-transform:uppercase;color:var(--green)}
.fr-m-gift strong{font-family:var(--head);font-weight:800;font-size:34pt;line-height:1;color:var(--yellow)}
.fr-m-intro{position:absolute;left:105mm;right:14mm;top:66mm;font-size:11.5pt;line-height:1.45}
.fr-bars{position:absolute;left:14mm;right:14mm;top:122mm;height:60mm}
.fr-bars h3,.fr-m-sub{font-size:15pt;text-transform:uppercase;color:var(--purple);margin-bottom:3mm}
.fb-row{display:grid;grid-template-columns:58mm 1fr 36mm;gap:4mm;align-items:center;margin-bottom:2.6mm}
.fb-l{font-weight:700;font-size:9.5pt;line-height:1.2}
.fb-t{height:7mm;background:var(--warm)}
.fb-t span{display:block;height:100%}
.fb-v{font-family:var(--head);font-weight:800;font-size:11pt;color:var(--blue);text-align:right;white-space:nowrap}
.fb-v em{font-style:normal;color:var(--grey);font-weight:600}
.fr-m-photo{position:absolute;left:14mm;right:14mm;top:122mm;height:60mm;box-shadow:3.5mm 3.5mm 0 var(--green)}
.fr-m-sub{position:absolute;left:14mm;top:190mm}
.fr-supports{position:absolute;left:14mm;right:14mm;top:202mm;bottom:30mm;display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.fr-supports .su{border:1mm solid var(--green);padding:6mm 5mm}
.fr-supports .su:nth-child(2){border-color:var(--teal)}.fr-supports .su:nth-child(3){border-color:var(--purple)}
.fr-supports .su-i{width:14mm;height:14mm;border-radius:50%;background:var(--blue);color:#fff;padding:3mm;margin-bottom:3mm}
.fr-supports h4{font-family:var(--head);font-weight:800;font-size:13.5pt;text-transform:uppercase;color:var(--blue);margin-bottom:1.5mm;line-height:1.05}
.fr-supports p{font-size:9.5pt;line-height:1.4;margin:0}
.fr-note{position:absolute;left:14mm;right:14mm;bottom:19mm;font-size:8.5pt;font-style:italic;color:var(--grey)}

/* back */
.fr-b-photo{position:absolute;inset:0}
.fr-b-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.2),rgba(0,0,0,.55))}
.fr-b-frame{position:absolute;left:14mm;right:14mm;top:68mm;border:2.8mm solid var(--green);padding:12mm 10mm 9mm;color:#fff;z-index:3;text-shadow:0 1px 8px rgba(0,0,0,.35)}
.fr-b-hl{font-size:30pt;transform:rotate(-2deg);position:absolute;top:-11mm;left:8mm;text-shadow:none}
.fr-b-frame h2,.fr-c-frame h2{color:#fff;font-size:46pt;margin-bottom:4mm}
.fr-b-frame p{font-size:13pt;line-height:1.4}
.fr-back .dua .ar,.fr-closing .dua .ar{color:var(--yellow)}
.fr-b-band{position:absolute;left:0;right:0;bottom:0;height:88mm;background:#fff;display:flex;gap:10mm;padding:13mm 14mm 12mm;z-index:4}
.fr-b-ahead{flex:1.1;display:flex;flex-direction:column}
.fr-b-ahead h3{font-size:18pt;color:var(--purple);text-transform:uppercase;margin-bottom:2mm}
.fr-b-ahead .fit{flex:1;font-size:10pt}
.fr-b-right{flex:1;display:flex;flex-direction:column;justify-content:space-between}
.fr-b-right .verse blockquote{font-size:11.5pt;color:var(--blue)}
.fr-b-right .verse figcaption{color:var(--green)}
.fr-b-right .contact{color:var(--ink)}
.fr-b-right .c-web{color:var(--blue)}

/* impact + story */
.fr-is-top{position:absolute;left:0;right:0;top:0;height:170mm;color:#fff;padding:22mm 14mm 0}
.fr-is-top .fr-stats{position:static;margin-bottom:5mm}
.fr-is-top .fr-stats .v{font-size:32pt}
.fr-pillars.row{position:static;grid-template-columns:repeat(3,1fr)}
.fr-pillars.row .pl{flex-direction:column;align-items:flex-start;gap:2mm;padding:5mm}
.fr-pillars.row p{font-size:8.5pt}
.fr-pillars.row.big{margin-top:10mm}
.fr-pillars.row.big .pl{padding:8mm 6mm}
.fr-pillars.row.big p{font-size:10.5pt}
.fr-is-bottom{position:absolute;left:14mm;right:14mm;top:180mm;bottom:20mm;display:flex;gap:8mm}
.fr-is-photo{width:66mm;flex:none;display:flex}
.fr-is-photo .ph{flex:1;box-shadow:3mm 3mm 0 var(--green)}
.fr-is-text{flex:1;display:flex;flex-direction:column;min-width:0}
.fr-is-text h3{font-size:20pt;color:var(--blue);text-transform:uppercase;margin:1.5mm 0 3mm}
.fr-is-text .fit{flex:1}
.fr-is-text blockquote{font-family:var(--marker);font-size:15pt;line-height:1.2;color:var(--purple)}
.fr-is-text cite{display:block;font-style:normal;font-family:var(--head);font-size:8pt;letter-spacing:.12em;text-transform:uppercase;color:var(--green)}

/* closing */
.fr-c-top{position:absolute;left:0;right:0;top:0;height:150mm;color:#fff;padding:22mm 14mm 0}
.fr-c-top .fr-m-gift{margin-bottom:7mm}
.fr-supports.light{position:static;height:auto}
.fr-supports.light .su{border-color:#fff;color:#fff}
.fr-supports.light h4{color:#fff}
.fr-supports.light .su-i{background:var(--green)}
.fr-c-bottom{position:absolute;left:0;right:0;bottom:0;height:147mm;overflow:hidden}
.fr-c-frame{position:absolute;left:14mm;right:14mm;top:16mm;border:2.8mm solid var(--green);padding:11mm 9mm 7mm;color:#fff;z-index:3;text-shadow:0 1px 8px rgba(0,0,0,.35)}
.fr-c-frame h2{font-size:36pt}
.fr-c-frame p{font-size:11.5pt}
.fr-c-contact{position:absolute;left:0;right:0;bottom:0;background:#fff;padding:6mm 14mm;z-index:4}
.fr-c-contact .c-web{color:var(--blue)}
`;

export default {
  id: 'frame',
  name: 'Photo Frame',
  description: 'Photography-led, with bold outline frames and colour-coded sections.',
  bestFor: 'Reports with strong photos; major donors and corporate partners',
  get swatch() {
    return [C.green, C.teal, C.purple];
  },
  pages,
  css,
};
