// STYLE 1: "Signature": confident primary colour, textured arcs,
// yellow marker highlights and big condensed headlines (Brand Book pp. 61-67).
import { C, esc, paras, bg, icon, texture, marker, donut, contactBlock, duaBlock, verseBlock, signature, footer, logo, statsOrNothing, budgetTable } from '../helpers.js';

const blueTex = (circles, opacity = 0.2) => texture({ base: C.blue, ink: '#003b7a', opacity, circles });
const sec = (cls, inner, style = '') => `<section class="page sg ${cls}"${style ? ` style="${style}"` : ''}>${inner}</section>`;

const statsGrid = (stats, cls = '') =>
  stats.length >= 2 ? `<div class="sg-stats n${stats.length} ${cls}">${stats.map((s) => `<div class="st"><div class="v">${esc(s.value)}</div><div class="l">${esc(s.label)}</div></div>`).join('')}</div>` : '';

const pillars = (ctx, cls = '') =>
  `<div class="sg-pillars ${cls}">${(ctx.copy.impact.pillars || []).slice(0, 3).map((p) => `<div class="pl"><div class="pl-i">${icon(p.icon)}</div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('')}</div>`;

const quoteOrVerse = (ctx) => {
  const s = ctx.copy.story;
  return s.quote
    ? `<div class="sg-q"><div class="qm">“</div><blockquote>${esc(s.quote)}</blockquote>${s.quoteAttribution ? `<cite>${esc(s.quoteAttribution)}</cite>` : ''}</div>`
    : `<div class="sg-q"><div class="qm">“</div><blockquote>${esc(ctx.verse.text)}</blockquote><cite>${esc(ctx.verse.ref)}</cite></div>`;
};
const cap = (img) => (img?.caption ? `<div class="sg-cap">${esc(img.caption)}${img.illustrative ? ' <span class="illus">(illustrative)</span>' : ''}</div>` : '');

const pages = {
  cover: (ctx) =>
    sec(
      'sg-cover',
      `${logo(ctx, 'white', 'logo-box')}
      <div class="sg-tagline">${esc(ctx.brand.tagline)}</div>
      <div class="sg-cv-photo ph" ${bg(ctx.cover?.url)}></div><div class="sg-cv-ring"></div>
      <div class="sg-cv-text">
        <div class="kicker">${esc(ctx.copy.cover.kicker)}</div>
        ${marker(ctx.copy.cover.highlight, 'sg-cv-hl')}
        <h1>${esc(ctx.copy.cover.title)}</h1>
        <p class="sg-cv-sub">${esc(ctx.copy.cover.subtitle)}</p>
        <div class="sg-cv-donor"><span>Prepared for</span><strong>${esc(ctx.donorName)}</strong>${ctx.period ? `<em>${esc(ctx.period)}</em>` : ''}</div>
      </div>`,
      `background-image:${blueTex([[0.05, 0.18, 0.62], [0.85, 0.02, 0.38]])}`
    ),

  letter: (ctx, n) =>
    sec(
      'sg-letter',
      `<aside class="sg-l-side" style="background-image:${blueTex([[0.5, 0.95, 0.9]], 0.12)}">
        <div class="sg-l-photo ph" ${bg(ctx.ceo.photo, '58% 30%')}></div>
        <div class="sg-l-name">${esc(ctx.ceo.name)}</div>
        <div class="sg-l-title">${esc(ctx.ceo.title)}<br>${esc(ctx.brand.orgName)}</div>
        <div class="sg-l-verse">${verseBlock(ctx)}</div>
      </aside>
      ${logo(ctx, 'colour', 'logo-sm')}
      <div class="sg-l-main">
        <div class="kicker">A message from our CEO</div>
        <h2>${marker('Thank you', 'sg-l-hl')}</h2>
        <div class="sg-l-body fit" data-max="135">
          <p class="sal">${esc(ctx.copy.ceoLetter.salutation)}</p>
          ${paras(ctx.copy.ceoLetter.paragraphs)}
          ${signature(ctx)}
        </div>
      </div>
      ${footer(ctx, n, 'sg-pf-dark')}`
    ),

  project: (ctx, n) =>
    sec(
      'sg-project',
      `<div class="sg-p-photo ph" ${bg(ctx.projectImg?.url)}></div>
      ${logo(ctx, 'box', 'logo-sm')}
      <div class="sg-p-band"><div class="kicker">The project</div><h2>${esc(ctx.copy.project.heading)}</h2></div>
      ${cap(ctx.projectImg)}
      <div class="sg-p-body">
        <div class="sg-p-text fit" data-max="125"><p class="lead">${esc(ctx.copy.project.lead)}</p>${paras(ctx.copy.project.paragraphs)}</div>
        <dl class="sg-facts">${ctx.copy.project.keyFacts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
      </div>
      ${footer(ctx, n, 'sg-pf-dark')}`
    ),

  impact: (ctx, n) => {
    const stats = statsOrNothing(ctx);
    return sec(
      `sg-impact ${stats.length >= 2 ? '' : 'no-stats'}`,
      `${logo(ctx, 'white', 'logo-sm')}
      <div class="sg-i-head"><div class="kicker">Your impact</div><h2>${esc(ctx.copy.impact.heading)}</h2><p class="fit">${esc(ctx.copy.impact.intro)}</p></div>
      <div class="sg-i-photo ph" ${bg(ctx.impactImg?.url)}></div><div class="sg-i-ring"></div>
      ${statsGrid(stats)}
      ${pillars(ctx)}
      ${footer(ctx, n, 'sg-pf-light')}`,
      `background-image:${blueTex([[0.95, 0.25, 0.42], [0.1, 1.05, 0.6]])}`
    );
  },

  story: (ctx, n) =>
    sec(
      'sg-story',
      `<div class="sg-s-photo ph" ${bg(ctx.storyImg?.url)}></div>
      ${logo(ctx, 'colour', 'logo-sm')}
      <div class="sg-s-main">
        <div class="kicker">A story of change</div>
        <h2>${esc(ctx.copy.story.heading)}</h2>
        <div class="sg-s-text fit" data-max="125">${paras(ctx.copy.story.paragraphs)}</div>
      </div>
      ${quoteOrVerse(ctx)}
      ${cap(ctx.storyImg)}
      ${footer(ctx, n, 'sg-pf-dark')}`
    ),

  gallery: (ctx, n) =>
    sec(
      'sg-gallery',
      `${logo(ctx, 'white', 'logo-sm')}
      <div class="sg-g-head"><div class="kicker">In pictures</div><h2>${marker(ctx.copy.gallery.heading)}</h2><p>${esc(ctx.copy.gallery.intro)}</p></div>
      <div class="sg-g-grid c${ctx.gallery.length}">${ctx.gallery.map((g, i) => `<figure class="g${i} ph" ${bg(g.url)}><figcaption>${esc(g.caption)}${g.illustrative ? ' <span class="illus">(illustrative)</span>' : ''}</figcaption></figure>`).join('')}</div>
      ${footer(ctx, n, 'sg-pf-light')}`,
      `background-image:${blueTex([[0.9, 0.08, 0.35]])}`
    ),

  money: (ctx, n) => {
    const m = ctx.copy.money;
    const hasBudget = ctx.budget.length > 0;
    return sec(
      'sg-money',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="sg-m-head"><div class="kicker">Accountability</div><h2>${esc(m.heading)}</h2><p class="lead">${esc(m.intro)}</p></div>
      <div class="sg-m-row">
        <div class="sg-m-gift" style="background-image:${blueTex([[0.2, 0.9, 0.7]], 0.15)}"><span>${esc(ctx.givingType)}</span><strong>${esc(ctx.amount || 'Thank you')}</strong><em>${esc(ctx.donorName)}</em></div>
        <div class="sg-m-chart">${hasBudget ? `${donut(ctx.budget, ctx.budgetTotal, [C.blue, C.teal, C.green, C.purple, C.yellow, C.blue60], 150)}${budgetTable(ctx, { bars: false })}` : `<div class="sg-m-photo ph" ${bg(ctx.moneyImg?.url)}></div>`}</div>
      </div>
      <h3 class="sg-m-sub">What your gift supports</h3>
      <div class="sg-supports">${m.supports.slice(0, 3).map((s, i) => `<div class="su su${i}"><div class="su-i">${icon(s.icon)}</div><div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div></div>`).join('')}</div>
      <p class="sg-note">${esc(m.note)}</p>
      ${footer(ctx, n, 'sg-pf-dark')}`
    );
  },

  back: (ctx) => {
    const a = ctx.copy.ahead;
    return sec(
      'sg-back',
      `${logo(ctx, 'white', 'logo-box')}
      <div class="sg-b-ahead"><h3>${esc(a.heading)}</h3><div class="fit">${paras(a.paragraphs)}${a.bullets?.length ? `<ul>${a.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</div></div>
      <div class="sg-b-ty">
        ${marker('Thank you', 'sg-b-hl')}
        <h2>${esc(ctx.copy.thankYou.heading)}</h2>
        <p class="sg-b-msg">${esc(ctx.copy.thankYou.message)}</p>
        ${duaBlock(ctx)}
      </div>
      <div class="sg-b-foot">${verseBlock(ctx)}${contactBlock()}</div>`,
      `background-image:${blueTex([[0.0, 0.0, 0.55], [1.0, 0.75, 0.7]])}`
    );
  },

  impactStory: (ctx, n) => {
    const stats = statsOrNothing(ctx, 3);
    return sec(
      'sg-is',
      `<div class="sg-is-top" style="background-image:${blueTex([[0.95, 0.3, 0.5]])}">
        ${logo(ctx, 'white', 'logo-sm')}
        <div class="kicker">Your impact</div><h2>${esc(ctx.copy.impact.heading)}</h2>
        ${stats.length >= 2 ? statsGrid(stats, 'sg-stats-row') : ''}
        ${pillars(ctx, stats.length >= 2 ? 'compact' : '')}
      </div>
      <div class="sg-is-bottom">
        <div class="sg-is-photo ph" ${bg(ctx.storyImg?.url)}></div>
        <div class="sg-is-text"><div class="kicker">A story of change</div><h3>${esc(ctx.copy.story.heading)}</h3>
          <div class="fit">${paras(ctx.copy.story.paragraphs)}${ctx.copy.story.quote ? `<blockquote>“${esc(ctx.copy.story.quote)}”${ctx.copy.story.quoteAttribution ? `<cite>${esc(ctx.copy.story.quoteAttribution)}</cite>` : ''}</blockquote>` : ''}</div></div>
      </div>
      ${footer(ctx, n, 'sg-pf-dark')}`
    );
  },

  closing: (ctx) => {
    const m = ctx.copy.money;
    return sec(
      'sg-closing',
      `${logo(ctx, 'colour', 'logo-sm')}
      <div class="sg-c-top">
        <div class="kicker">Your gift at work</div><h2>${esc(m.heading)}</h2>
        <div class="sg-c-row">
          <div class="sg-m-gift small" style="background-image:${blueTex([[0.2, 0.9, 0.7]], 0.15)}"><span>${esc(ctx.givingType)}</span><strong>${esc(ctx.amount || 'Thank you')}</strong></div>
          <div class="sg-supports col">${m.supports.slice(0, 3).map((s, i) => `<div class="su su${i}"><div class="su-i">${icon(s.icon)}</div><div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div></div>`).join('')}</div>
        </div>
      </div>
      <div class="sg-c-bottom" style="background-image:${blueTex([[0.0, 1.0, 0.6], [1.0, 0.0, 0.45]])}">
        <div class="sg-c-ty">${marker('Thank you', 'sg-b-hl')}<h2>${esc(ctx.copy.thankYou.heading)}</h2><p>${esc(ctx.copy.thankYou.message)}</p>${duaBlock(ctx)}</div>
        <div class="sg-c-foot">${contactBlock()}<img class="sg-c-logo" src="${ctx.logos.white}" alt=""></div>
      </div>`
    );
  },
};

const css = `
.sg{color:var(--ink)}
.sg .kicker{color:var(--blue)}
.sg h2{font-size:34pt;color:var(--blue);text-transform:uppercase}
.sg .lead{font-family:var(--head);font-weight:600;font-size:14pt;line-height:1.25;color:var(--blue)}
.sg-pf-dark{color:var(--blue)}
.sg-pf-light{color:#fff}
.sg-cap{position:absolute;font-size:7.5pt;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);z-index:5}

/* cover */
.sg-cover,.sg-impact,.sg-gallery,.sg-back,.sg-l-side,.sg-is-top,.sg-c-bottom,.sg-m-gift{background-color:var(--blue)}
.sg-cover{background-size:cover;color:#fff}
.sg-tagline{position:absolute;top:12mm;left:14mm;font-family:var(--head);font-weight:800;font-size:10pt;letter-spacing:.24em;text-transform:uppercase;color:#fff}
.sg-cv-photo{position:absolute;right:-42mm;bottom:-38mm;width:182mm;height:182mm;border-radius:50%;border:3.2mm solid #fff;z-index:2}
.sg-cv-ring{position:absolute;right:-52mm;bottom:-48mm;width:202mm;height:202mm;border-radius:50%;border:1.6mm solid var(--yellow);z-index:1}
.sg-cv-text{position:absolute;left:14mm;top:58mm;width:150mm;z-index:3}
.sg-cv-text .kicker{color:var(--yellow);font-size:10pt;margin-bottom:4mm}
.sg-cv-hl{font-size:36pt;transform:rotate(-2deg);margin:0 0 3mm -1mm}
.sg-cover h1{font-size:50pt;color:#fff;text-transform:uppercase;line-height:.92;margin-bottom:5mm;max-width:150mm}
.sg-cv-sub{font-size:13pt;line-height:1.35;max-width:112mm;font-weight:300}
.sg-cv-donor{margin-top:7mm;display:flex;flex-direction:column;border-left:1.6mm solid var(--yellow);padding-left:4mm;max-width:100mm}
.sg-cv-donor span{font-family:var(--head);font-size:8pt;letter-spacing:.2em;text-transform:uppercase;opacity:.85}
.sg-cv-donor strong{font-family:var(--head);font-size:16pt;line-height:1.05;text-transform:uppercase}
.sg-cv-donor em{font-style:normal;font-size:8.5pt;opacity:.85;margin-top:1mm}

/* letter */
.sg-l-side{position:absolute;left:0;top:0;bottom:0;width:70mm;background-size:cover;color:#fff;padding:22mm 8mm 16mm;display:flex;flex-direction:column;align-items:center;text-align:center}
.sg-l-photo{width:52mm;height:52mm;border-radius:50%;border:2mm solid #fff;box-shadow:0 0 0 1.4mm var(--yellow)}
.sg-l-name{font-family:var(--head);font-weight:800;font-size:17pt;text-transform:uppercase;margin-top:7mm;line-height:1}
.sg-l-title{font-size:8.5pt;opacity:.9;margin-top:2mm}
.sg-l-verse{margin-top:auto;text-align:left}
.sg-l-verse .verse blockquote{font-size:12.5pt;color:#fff}
.sg-l-verse figcaption{color:var(--yellow)}
.sg-l-main{position:absolute;left:80mm;right:13mm;top:30mm;bottom:20mm;display:flex;flex-direction:column}
.sg-l-hl{font-size:40pt;transform:rotate(-2deg);margin:3mm 0 6mm}
.sg-l-main h2{line-height:1}
.sg-l-body{flex:1}
.sg-l-body p{font-size:11pt;line-height:1.62}
.sg-letter .pf{left:80mm}
.sg-story .pf{left:108mm}
.sg-l-body .sal{font-family:var(--head);font-weight:700;font-size:13pt;color:var(--blue)}
.sg .sig-script{color:var(--blue)}
.sg .sig-name{color:var(--blue)}

/* project */
.sg-p-photo{position:absolute;left:0;right:0;top:0;height:128mm}
.sg-p-band{position:absolute;left:0;top:96mm;width:140mm;min-height:44mm;background:var(--blue);color:#fff;padding:8mm 10mm 7mm 14mm;z-index:3}
.sg-p-band .kicker{color:var(--yellow)}
.sg-p-band h2{color:#fff;font-size:30pt;margin-top:2mm}
.sg-project .sg-cap{right:12mm;top:121mm}
.sg-p-body{position:absolute;left:14mm;right:12mm;top:150mm;bottom:20mm;display:flex;gap:8mm}
.sg-p-text{flex:1.65}
.sg-facts{flex:1;background:var(--warm);border-top:2.4mm solid var(--yellow);padding:5mm 6mm;align-self:flex-start}
.sg-facts div{padding:2.2mm 0;border-bottom:.3mm solid rgba(0,0,0,.12)}
.sg-facts div:last-child{border:0}
.sg-facts dt{font-family:var(--head);font-weight:700;font-size:7.5pt;letter-spacing:.16em;text-transform:uppercase;color:var(--blue)}
.sg-facts dd{font-family:var(--head);font-weight:700;font-size:12pt;line-height:1.15}

/* impact */
.sg-impact{background-size:cover;color:#fff}
.sg-impact .kicker{color:var(--yellow)}
.sg-i-head{position:absolute;left:14mm;top:20mm;width:110mm;height:72mm;display:flex;flex-direction:column}
.sg-i-head h2{color:#fff;font-size:44pt;margin:2mm 0 4mm}
.sg-i-head p{font-size:12pt;line-height:1.4;flex:1}
.sg-i-photo{position:absolute;right:12mm;top:36mm;width:66mm;height:66mm;border-radius:50%;border:2mm solid #fff;z-index:2}
.sg-i-ring{position:absolute;right:7mm;top:31mm;width:76mm;height:76mm;border-radius:50%;border:1.2mm solid var(--yellow)}
.sg-stats{position:absolute;left:14mm;right:12mm;top:108mm;display:grid;grid-template-columns:1fr 1fr;gap:0 10mm}
.sg-stats.n3{grid-template-columns:1fr 1fr 1fr}
.sg-stats .st{padding:4mm 0 5mm;border-top:.5mm solid rgba(255,255,255,.55)}
.sg-stats .v{font-family:var(--head);font-weight:800;font-size:46pt;line-height:1;color:#fff;letter-spacing:-.02em}
.sg-stats .l{font-family:var(--head);font-weight:700;font-size:11pt;text-transform:uppercase;letter-spacing:.06em;color:var(--yellow);margin-top:1mm}
.sg-pillars{position:absolute;left:14mm;right:12mm;bottom:22mm;display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.sg-pillars .pl{background:#fff;color:var(--ink);padding:16mm 5mm 6mm;position:relative;border-bottom:2mm solid var(--yellow)}
.sg-pillars .pl-i{position:absolute;top:-9mm;left:5mm;width:20mm;height:20mm;border-radius:50%;background:var(--yellow);color:var(--blue);padding:4.5mm}
.sg-pillars h3{font-size:14pt;color:var(--blue);text-transform:uppercase;margin-bottom:2mm}
.sg-pillars p{font-size:9.5pt;line-height:1.4;margin:0}
.sg-impact.no-stats .sg-pillars{top:120mm;bottom:22mm}
.sg-impact.no-stats .sg-pillars .pl{display:flex;flex-direction:column;justify-content:center;padding-top:20mm}
.sg-impact.no-stats .sg-pillars h3{font-size:19pt}
.sg-impact.no-stats .sg-pillars p{font-size:11pt}

/* story */
.sg-s-photo{position:absolute;left:0;top:0;bottom:0;width:98mm}
.sg-s-main{position:absolute;left:108mm;right:13mm;top:34mm;height:158mm;display:flex;flex-direction:column}
.sg-s-main h2{font-size:28pt;margin:2mm 0 5mm}
.sg-s-text{flex:1}
.sg-q{position:absolute;left:58mm;right:13mm;top:203mm;height:66mm;background:var(--yellow);color:var(--blue);padding:9mm 10mm 7mm 26mm;z-index:4;display:flex;flex-direction:column;justify-content:center}
.sg-q .qm{position:absolute;left:6mm;top:-2mm;font-family:var(--marker);font-size:90pt;line-height:1;color:var(--blue)}
.sg-q blockquote{font-family:var(--head);font-weight:700;font-size:16pt;line-height:1.2}
.sg-q cite{display:block;font-style:normal;font-family:var(--head);font-weight:700;font-size:9pt;letter-spacing:.14em;text-transform:uppercase;margin-top:3mm}
.sg-story .sg-cap{left:6mm;bottom:8mm;width:46mm}

/* gallery */
.sg-gallery{background-size:cover;color:#fff}
.sg-gallery .kicker{color:var(--yellow)}
.sg-g-head{position:absolute;left:14mm;top:18mm;right:40mm}
.sg-g-head h2{font-size:30pt;margin:3mm 0}
.sg-g-head .hl{transform:rotate(-1.5deg)}
.sg-g-head p{font-size:11pt;max-width:130mm}
.sg-g-grid{position:absolute;left:12mm;right:12mm;top:66mm;bottom:20mm;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:2.5mm}
.sg-g-grid figure{position:relative;border:1.2mm solid #fff}
.sg-g-grid .g0{grid-column:span 2;grid-row:span 2}
.sg-g-grid.c2{grid-template-rows:1fr 1fr}.sg-g-grid.c2 .g0{grid-row:span 1;grid-column:span 3}.sg-g-grid.c2 .g1{grid-column:span 3}
.sg-g-grid.c3 .g2{grid-column:span 3}
.sg-g-grid.c4 .g3{grid-column:span 3}
.sg-g-grid.c5 .g4{grid-column:span 2}
.sg-g-grid figcaption{position:absolute;left:0;right:0;bottom:0;padding:6mm 3mm 2mm;font-size:7.5pt;background:linear-gradient(transparent,rgba(0,0,0,.65));color:#fff}

/* money */
.sg-m-head{position:absolute;left:14mm;right:40mm;top:22mm}
.sg-m-head h2{margin:2mm 0 4mm}
.sg-m-row{position:absolute;left:14mm;right:12mm;top:70mm;height:96mm;display:flex;gap:8mm;align-items:center}
.sg-m-gift{width:72mm;height:72mm;flex:none;border-radius:50%;background-color:var(--blue);background-size:cover;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:0 0 0 2mm #fff,0 0 0 3.4mm var(--yellow);padding:6mm}
.sg-m-gift span{font-family:var(--head);font-weight:700;font-size:9pt;letter-spacing:.18em;text-transform:uppercase;color:var(--yellow)}
.sg-m-gift strong{font-family:var(--head);font-weight:800;font-size:26pt;line-height:1;margin:2mm 0}
.sg-m-gift em{font-style:normal;font-size:8.5pt;opacity:.9}
.sg-m-gift.small{width:58mm;height:58mm}
.sg-m-gift.small strong{font-size:19pt}
.sg-m-chart{flex:1;display:flex;gap:6mm;align-items:center;height:100%}
.sg-m-chart .donut{flex:none;width:36mm;height:36mm}
.sg-m-chart table{font-size:8.5pt}
.sg-m-chart table{color:var(--ink)}
.sg-m-photo{width:100%;height:100%;border-radius:2mm;border-bottom:2.4mm solid var(--yellow)}
.sg-m-sub{position:absolute;left:14mm;top:180mm;font-size:16pt;color:var(--blue);text-transform:uppercase}
.sg-supports{position:absolute;left:14mm;right:12mm;top:192mm;bottom:32mm;display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.sg-supports .su{background:var(--warm);padding:7mm 6mm;border-top:2mm solid var(--blue)}
.sg-supports:not(.col) h4{font-size:15pt}.sg-supports:not(.col) p{font-size:10.5pt}
.sg-supports:not(.col) .su-i{width:16mm;height:16mm;padding:3.4mm}
.sg-supports .su1{border-top-color:var(--teal)}.sg-supports .su2{border-top-color:var(--green)}
.sg-supports .su-i{width:13mm;height:13mm;border-radius:50%;background:var(--blue);color:#fff;padding:2.8mm;margin-bottom:3mm}
.sg-supports h4{font-family:var(--head);font-weight:800;font-size:12.5pt;text-transform:uppercase;color:var(--blue);line-height:1.05;margin-bottom:1.5mm}
.sg-supports p{font-size:9pt;line-height:1.4;margin:0}
.sg-note{position:absolute;left:14mm;right:12mm;bottom:20mm;font-size:8.5pt;font-style:italic;color:var(--grey)}

/* back */
.sg-back{background-size:cover;color:#fff}
.sg-b-ahead{position:absolute;left:14mm;top:22mm;width:120mm;height:92mm;background:rgba(255,255,255,.12);border-left:2mm solid var(--yellow);padding:7mm 8mm;display:flex;flex-direction:column}
.sg-b-ahead h3{font-size:20pt;text-transform:uppercase;margin-bottom:3mm}
.sg-b-ahead .fit{flex:1}
.sg-b-ahead ul{margin:2mm 0 0 4.5mm}
.sg-b-ahead li{margin-bottom:1mm}
.sg-b-ty{position:absolute;left:14mm;right:14mm;top:128mm}
.sg-b-hl{font-size:30pt;transform:rotate(-2deg)}
.sg-b-ty h2{color:#fff;font-size:50pt;margin:4mm 0 4mm}
.sg-b-msg{font-size:13pt;line-height:1.4;max-width:160mm}
.sg-back .dua{margin-top:3mm}
.sg-back .dua .ar{color:var(--yellow)}
.sg-b-foot{position:absolute;left:14mm;right:14mm;bottom:14mm;display:flex;justify-content:space-between;align-items:flex-end;gap:10mm;border-top:.4mm solid rgba(255,255,255,.5);padding-top:6mm}
.sg-b-foot .verse{max-width:95mm}
.sg-b-foot .verse blockquote{font-size:12pt}
.sg-b-foot .verse figcaption{color:var(--yellow)}
.sg-b-foot .contact{text-align:right}

/* impact + story (4/5 pages) */
.sg-is-top{position:absolute;left:0;right:0;top:0;height:158mm;background-size:cover;color:#fff;padding:22mm 12mm 0 14mm}
.sg-is-top .kicker{color:var(--yellow)}
.sg-is-top h2{color:#fff;font-size:38pt;margin:2mm 0 4mm}
.sg-is-top .sg-stats{position:static;margin-bottom:12mm}
.sg-is-top .sg-stats .v{font-size:38pt}
.sg-is-top .sg-pillars{left:14mm;right:12mm;bottom:-14mm;z-index:3}
.sg-is-top .sg-pillars.compact .pl{padding-top:13mm}
.sg-is-top .sg-pillars.compact p{font-size:8.5pt}
.sg-is-top .sg-pillars:not(.compact){top:86mm;bottom:-10mm}
.sg-is-bottom{position:absolute;left:14mm;right:12mm;top:166mm;bottom:20mm;display:flex;gap:7mm;padding-top:14mm}
.sg-is-photo{width:62mm;flex:none;border-radius:1.5mm;border-bottom:2mm solid var(--yellow)}
.sg-is-text{flex:1;display:flex;flex-direction:column;min-width:0}
.sg-is-text h3{font-size:20pt;color:var(--blue);text-transform:uppercase;margin:1.5mm 0 3mm}
.sg-is-text .fit{flex:1}
.sg-is-text blockquote{font-family:var(--head);font-weight:700;font-size:12pt;color:var(--blue);border-left:1.6mm solid var(--yellow);padding-left:4mm}
.sg-is-text cite{display:block;font-style:normal;font-size:8pt;letter-spacing:.12em;text-transform:uppercase;margin-top:1mm}

/* closing (4/5 pages) */
.sg-c-top{position:absolute;left:14mm;right:12mm;top:24mm;height:116mm}
.sg-c-top h2{font-size:30pt;margin:2mm 0 6mm}
.sg-c-row{display:flex;gap:8mm;align-items:center}
.sg-supports.col{position:static;grid-template-columns:1fr;gap:3mm;flex:1}
.sg-supports.col .su{display:flex;gap:4mm;align-items:center;padding:3.5mm 4mm;border-top:0;border-left:2mm solid var(--blue)}
.sg-supports.col .su1{border-left-color:var(--teal)}.sg-supports.col .su2{border-left-color:var(--green)}
.sg-supports.col .su-i{flex:none;margin:0;width:11mm;height:11mm;padding:2.4mm}
.sg-c-bottom{position:absolute;left:0;right:0;bottom:0;height:150mm;background-size:cover;color:#fff;padding:14mm 14mm 12mm}
.sg-c-ty h2{color:#fff;font-size:40pt;margin:4mm 0 3mm}
.sg-c-ty p{font-size:12pt;max-width:165mm}
.sg-c-ty .dua .ar{color:var(--yellow);font-size:20pt}
.sg-c-foot{position:absolute;left:14mm;right:14mm;bottom:12mm;display:flex;justify-content:space-between;align-items:flex-end;border-top:.4mm solid rgba(255,255,255,.5);padding-top:5mm}
.sg-c-logo{height:24mm}
`;

export default {
  id: 'signature',
  name: 'Signature Blue',
  description: 'Bold primary colour with textured arcs, marker highlights and big confident headlines.',
  bestFor: 'Any donor: the classic, confident look',
  get swatch() {
    return [C.blue, C.yellow, '#ffffff'];
  },
  pages,
  css,
};
